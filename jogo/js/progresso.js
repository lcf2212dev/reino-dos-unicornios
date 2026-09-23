/* Progresso da Mariana: salvo no aparelho (localStorage) e, quando o jogo roda
   publicado no claude.ai, sincronizado entre aparelhos pela capacidade `db`.
   Dinheiro e prêmios são DERIVADOS das conquistas, nunca guardados soltos. */
(function () {
  var U = Reino.util;
  var P = {};
  var estado = null;
  var nuvem = { ref: null, ok: false, gravando: false, pendente: false, timer: null, status: 'local' };

  function agora() { return Date.now(); }

  function estadoNovo() {
    return {
      v: 1, geracao: 1, ciclo: 1, criado: agora(), atualizado: agora(),
      comecou: false,
      aparencia: Object.assign({}, PA.APARENCIA_PADRAO),
      corInicial: 'rosa',
      salas: {},        // salaId -> {feita, melhor, perfeita, calma, vezes}
      treinos: {},      // materiaId -> {melhor, ouro, perfeito, vezes}
      unis: {},         // uniId -> {em, nome, xp, chocado}
      montaria: 'inicial',
      estrelas: { ganhas: 0, gastas: 0 },
      loja: {},         // itemId -> true
      usando: { enfeites: [], capa: false, asasFada: false, estrelinhas: false },
      pago: {},         // materiaId -> valor já pago pelos pais
      ajustes: { som: true, musica: false, voz: true, animacoes: !U.reduzMovimentoSistema, texto: 1, setas: false },
      ritualVisto: false,
    };
  }

  /* ---------- carregar / salvar ---------- */
  function lerLocal() {
    try {
      var bruto = localStorage.getItem(Reino.config.chaveSave);
      if (!bruto) return null;
      return JSON.parse(bruto);
    } catch (e) { return null; }
  }
  function gravarLocal() {
    try { localStorage.setItem(Reino.config.chaveSave, JSON.stringify(estado)); } catch (e) {}
  }
  function completar(e) {
    var base = estadoNovo();
    Object.keys(base).forEach(function (k) { if (e[k] === undefined) e[k] = base[k]; });
    e.ajustes = Object.assign({}, base.ajustes, e.ajustes || {});
    e.usando = Object.assign({}, base.usando, e.usando || {});
    e.estrelas = Object.assign({}, base.estrelas, e.estrelas || {});
    return e;
  }

  P.carregar = function () {
    estado = completar(lerLocal() || estadoNovo());
    return estado;
  };
  P.estado = function () { return estado; };

  P.salvar = function (semNuvem) {
    estado.atualizado = agora();
    gravarLocal();
    U.emit('progresso', estado);
    if (!semNuvem) agendarNuvem();
  };

  /* ---------- mesclar dois estados (aparelhos diferentes) ---------- */
  function max(a, b) { return Math.max(a || 0, b || 0); }
  function minPos(a, b) { if (!a) return b; if (!b) return a; return Math.min(a, b); }
  var ORDEM_MEDALHA = { bronze: 1, prata: 2, ouro: 3 };

  P.mesclar = function (a, b) {
    if (!a) return b; if (!b) return a;
    // quem "apagou tudo" por último vence inteiro
    if ((a.geracao || 1) !== (b.geracao || 1)) return (a.geracao || 1) > (b.geracao || 1) ? a : b;
    var recente = (a.atualizado || 0) >= (b.atualizado || 0) ? a : b;
    var antigo = recente === a ? b : a;
    var r = U.copia(recente);

    // novo ciclo de provas: salas, treinos e pagamentos vêm do ciclo mais novo
    var mesmoCiclo = (a.ciclo || 1) === (b.ciclo || 1);
    if (mesmoCiclo) {
      Object.keys(antigo.salas || {}).forEach(function (k) {
        var x = r.salas[k], y = antigo.salas[k];
        if (!x) { r.salas[k] = U.copia(y); return; }
        x.feita = minPos(x.feita, y.feita); x.melhor = max(x.melhor, y.melhor);
        x.perfeita = !!(x.perfeita || y.perfeita); x.calma = !!(x.calma || y.calma); x.vezes = max(x.vezes, y.vezes);
      });
      Object.keys(antigo.treinos || {}).forEach(function (k) {
        var x = r.treinos[k], y = antigo.treinos[k];
        if (!x) { r.treinos[k] = U.copia(y); return; }
        if ((ORDEM_MEDALHA[y.melhor] || 0) > (ORDEM_MEDALHA[x.melhor] || 0)) x.melhor = y.melhor;
        x.ouro = minPos(x.ouro, y.ouro); x.perfeito = minPos(x.perfeito, y.perfeito); x.vezes = max(x.vezes, y.vezes);
      });
      Object.keys(antigo.pago || {}).forEach(function (k) { r.pago[k] = max(r.pago[k], antigo.pago[k]); });
    } else if ((antigo.ciclo || 1) > (recente.ciclo || 1)) {
      r.ciclo = antigo.ciclo; r.salas = U.copia(antigo.salas || {}); r.treinos = U.copia(antigo.treinos || {}); r.pago = U.copia(antigo.pago || {});
    }
    // unicórnios: união, maior XP
    Object.keys(antigo.unis || {}).forEach(function (k) {
      var x = r.unis[k], y = antigo.unis[k];
      if (!x) { r.unis[k] = U.copia(y); return; }
      x.xp = max(x.xp, y.xp); x.em = minPos(x.em, y.em); x.chocado = !!(x.chocado || y.chocado);
    });
    r.estrelas = { ganhas: max(r.estrelas.ganhas, antigo.estrelas && antigo.estrelas.ganhas), gastas: max(r.estrelas.gastas, antigo.estrelas && antigo.estrelas.gastas) };
    Object.keys(antigo.loja || {}).forEach(function (k) { if (antigo.loja[k]) r.loja[k] = true; });
    r.comecou = !!(a.comecou || b.comecou);
    r.ritualVisto = !!(a.ritualVisto || b.ritualVisto);
    return r;
  };

  /* ---------- sincronização com o claude.ai (capacidade db) ---------- */
  function agendarNuvem() {
    if (!nuvem.ok) return;
    clearTimeout(nuvem.timer);
    nuvem.timer = setTimeout(enviarNuvem, 1800);
  }
  function enviarNuvem() {
    if (!nuvem.ok || !nuvem.ref) return;
    if (nuvem.gravando) { nuvem.pendente = true; return; }
    nuvem.gravando = true;
    nuvem.ref.set({ estado: U.copia(estado), atualizado: estado.atualizado })
      .then(function () { nuvem.status = 'sincronizado'; U.emit('nuvem', nuvem.status); })
      .catch(function (e) {
        nuvem.status = 'erro'; U.emit('nuvem', nuvem.status);
        if (e && (e.code === 'revoked' || e.code === 'not_granted' || e.code === 'invalid_argument')) nuvem.ok = false;
      })
      .then(function () {
        nuvem.gravando = false;
        if (nuvem.pendente) { nuvem.pendente = false; agendarNuvem(); }
      });
  }
  /* no servidor de casa (servidor/servidor.js) o mesmo doc fica em /api/progresso;
     este adaptador imita o doc da capacidade db (get, set, onSnapshot) */
  function docDoServidor() {
    function ler() {
      return fetch('api/progresso', { cache: 'no-store' }).then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('servidor ' + r.status);
        return r.json();
      });
    }
    function snap(d) { return { exists: !!d, data: function () { return d; }, metadata: { hasPendingWrites: false } }; }
    return {
      get: function () { return ler().then(snap); },
      set: function (d) {
        return fetch('api/progresso', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error('servidor ' + r.status); });
      },
      onSnapshot: function (ok, erro) {
        function conferir() { ler().then(function (d) { if (d) ok(snap(d)); }, erro); }
        setInterval(conferir, 20000);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) conferir(); });
      },
    };
  }
  function temServidor() {
    return fetch('api/progresso', { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { return r.headers.get('X-Reino') === '1'; }, function () { return false; });
  }

  P.iniciarNuvem = function () {
    var usaClaude = window.claude && typeof window.claude.use === 'function';
    var pedirDb = usaClaude ? window.claude.use('db')
      : /^https?:$/.test(location.protocol) ? temServidor().then(function (s) { return s ? { doc: docDoServidor } : null; })
      : Promise.resolve(null);
    pedirDb.then(function (db) {
      if (!db) return;
      try { nuvem.ref = db.doc('progresso/mariana'); } catch (e) { return; }
      return nuvem.ref.get().then(function (snap) {
        nuvem.ok = true;
        nuvem.status = 'sincronizado';
        if (snap.exists && snap.data() && snap.data().estado) {
          estado = completar(P.mesclar(estado, snap.data().estado));
          gravarLocal();
          U.emit('progresso', estado);
          U.emit('progressoRemoto', estado);
        }
        if (estado.comecou) enviarNuvem();
        U.emit('nuvem', nuvem.status);
        nuvem.ref.onSnapshot(function (s) {
          if (!s.exists || s.metadata.hasPendingWrites) return;
          var remoto = s.data() && s.data().estado;
          if (!remoto || remoto.atualizado === estado.atualizado) return;
          estado = completar(P.mesclar(estado, remoto));
          gravarLocal();
          U.emit('progresso', estado);
          U.emit('progressoRemoto', estado);
        }, function () { nuvem.status = 'local'; U.emit('nuvem', nuvem.status); });
      });
    }).catch(function () { /* segue só no aparelho */ });
  };
  P.statusNuvem = function () { return nuvem.ok ? nuvem.status : 'local'; };

  /* ---------- dinheiro ---------- */
  P.valorSala = function (materia) { return Reino.config.valorPorMateria / materia.salas.length; };
  P.dinheiroMateria = function (materia) {
    var v = 0;
    materia.salas.forEach(function (s) { if (estado.salas[s.id] && estado.salas[s.id].feita) v += P.valorSala(materia); });
    return Math.round(v * 100) / 100;
  };
  P.dinheiroTotal = function () {
    return Reino.materias.reduce(function (t, m) { return t + P.dinheiroMateria(m); }, 0);
  };
  P.pago = function (materiaId) { return estado.pago[materiaId] || 0; };

  P.salasFeitas = function (materia) { return materia.salas.filter(function (s) { return estado.salas[s.id] && estado.salas[s.id].feita; }).length; };
  P.materiaCompleta = function (materia) { return P.salasFeitas(materia) === materia.salas.length; };

  /* ---------- estrelas ---------- */
  P.estrelas = function () { return Math.max(0, (estado.estrelas.ganhas || 0) - (estado.estrelas.gastas || 0)); };
  P.ganharEstrelas = function (n) { estado.estrelas.ganhas = (estado.estrelas.ganhas || 0) + n; };
  P.gastarEstrelas = function (n) {
    if (P.estrelas() < n) return false;
    estado.estrelas.gastas = (estado.estrelas.gastas || 0) + n;
    return true;
  };

  /* ---------- unicórnios ---------- */
  P.temUni = function (id) { return !!estado.unis[id]; };
  P.defUni = function (id) { return Reino.Unicornios.def(id, estado.corInicial); };
  P.nomeUni = function (id) {
    var u = estado.unis[id]; var d = P.defUni(id);
    return (u && u.nome) || (d && d.nome) || 'Unicórnio';
  };
  P.ganharUni = function (id) {
    if (estado.unis[id]) return false;
    estado.unis[id] = { em: agora(), xp: 0, chocado: false };
    return true;
  };
  P.ovosParaChocar = function () {
    return Object.keys(estado.unis).filter(function (id) { return !estado.unis[id].chocado; });
  };
  P.chocar = function (id) { if (estado.unis[id]) estado.unis[id].chocado = true; };
  P.montaria = function () {
    var id = estado.montaria;
    if (!estado.unis[id] || !estado.unis[id].chocado) id = 'inicial';
    return id;
  };
  P.xpMontaria = function (n) {
    var id = P.montaria();
    var u = estado.unis[id];
    if (!u) return null;
    var antes = Reino.Unicornios.estagio(u.xp);
    u.xp = (u.xp || 0) + n;
    var depois = Reino.Unicornios.estagio(u.xp);
    return depois > antes ? { id: id, estagio: depois } : null;
  };

  /* ---------- conclusões ---------- */
  // resultado: {acertosPrimeira, total, pressas}
  P.concluirSala = function (materia, sala, resultado) {
    var reg = estado.salas[sala.id] || { vezes: 0, melhor: 0 };
    var primeiraVez = !reg.feita;
    var perfeita = resultado.acertosPrimeira === resultado.total;
    var calma = resultado.pressas === 0;
    var premios = { primeiraVez: primeiraVez, dinheiro: 0, estrelas: 0, calma: calma, perfeita: perfeita, ovos: [], cresceu: null, materiaCompleta: false };

    reg.vezes = (reg.vezes || 0) + 1;
    reg.melhor = Math.max(reg.melhor || 0, resultado.acertosPrimeira);
    if (primeiraVez) { reg.feita = agora(); premios.dinheiro = P.valorSala(materia); }
    if (perfeita) reg.perfeita = true;
    if (calma) reg.calma = true;
    estado.salas[sala.id] = reg;

    premios.estrelas = resultado.acertosPrimeira + (calma ? 3 : 0);
    P.ganharEstrelas(premios.estrelas);

    var unis = materia.unicornios || [];
    var comum = unis.find(function (u) { return u.raridade === 'comum' && u.sala === sala.id; });
    var raro = unis.find(function (u) { return u.raridade === 'raro' && u.sala === sala.id; });
    if (comum && P.ganharUni(comum.id)) premios.ovos.push(comum.id);
    if (raro && perfeita && calma && P.ganharUni(raro.id)) premios.ovos.push(raro.id);
    if (P.materiaCompleta(materia)) {
      var lend = unis.find(function (u) { return u.raridade === 'lendario'; });
      if (lend && P.ganharUni(lend.id)) { premios.ovos.push(lend.id); premios.materiaCompleta = true; }
    }
    premios.cresceu = P.xpMontaria(10 + (calma ? 5 : 0));
    P.salvar();
    return premios;
  };

  P.medalhaPara = function (acertos, total) {
    var pct = acertos / total;
    if (pct >= 0.9) return 'ouro';
    if (pct >= 0.7) return 'prata';
    return 'bronze';
  };

  P.registrarTreino = function (materia, acertos, total) {
    var medalha = P.medalhaPara(acertos, total);
    var reg = estado.treinos[materia.id] || { vezes: 0 };
    reg.vezes = (reg.vezes || 0) + 1;
    if ((ORDEM_MEDALHA[medalha] || 0) > (ORDEM_MEDALHA[reg.melhor] || 0)) reg.melhor = medalha;
    var premios = { medalha: medalha, ovos: [], estrelas: 0 };
    var unis = materia.unicornios || [];
    if (medalha === 'ouro') {
      if (!reg.ouro) reg.ouro = agora();
      var ep = unis.find(function (u) { return u.raridade === 'epico' && u.treino === 'ouro'; });
      if (ep && P.ganharUni(ep.id)) premios.ovos.push(ep.id);
    }
    if (acertos === total) {
      if (!reg.perfeito) reg.perfeito = agora();
      var ep2 = unis.find(function (u) { return u.raridade === 'epico' && u.treino === 'perfeito'; });
      if (ep2 && P.ganharUni(ep2.id)) premios.ovos.push(ep2.id);
    }
    premios.estrelas = { ouro: 10, prata: 6, bronze: 3 }[medalha];
    P.ganharEstrelas(premios.estrelas);
    premios.cresceu = P.xpMontaria(acertos * 2);
    estado.treinos[materia.id] = reg;
    P.salvar();
    return premios;
  };

  /* ---------- área dos pais ---------- */
  P.registrarPagamento = function (materiaId, valor) {
    estado.pago[materiaId] = Math.max(0, valor);
    P.salvar();
  };
  P.novoCiclo = function () {
    estado.ciclo = (estado.ciclo || 1) + 1;
    estado.salas = {}; estado.treinos = {}; estado.pago = {};
    P.salvar();
  };
  P.apagarTudo = function () {
    var g = (estado.geracao || 1) + 1;
    estado = estadoNovo();
    estado.geracao = g;
    P.salvar();
  };

  Reino.Progresso = P;
})();
