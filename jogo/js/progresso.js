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
      provas: {},       // provaId -> {tentativas, notas, melhor, premio, premioEm} (não zera no novo ciclo)
      unis: {},         // uniId -> {em, nome, xp, chocado}
      montaria: 'inicial',
      estrelas: { ganhas: 0, gastas: 0 },
      loja: {},         // itemId -> true
      usando: { enfeites: [], capa: false, asasFada: false, estrelinhas: false },
      pago: {},         // materiaId -> valor já pago pelos pais
      ajustes: { som: true, musica: false, voz: true, animacoes: !U.reduzMovimentoSistema, texto: 1, setas: false, surpresa: true },
      ritualVisto: false,
      cuidados: {},     // uniId -> {fome, sede, em} (0–100, 100 = satisfeito; sem registro = 100/100) — js/cuidados.js
      despensa: {},     // comidaId -> {compradas, usadas} (contadores que só crescem; quantidade = compradas − usadas)
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
    if (P.conferirPersistencia().length) gravarLocal();
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
  var ORDEM_PREMIO = { comum: 1, raro: 2, lendario: 3 };

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
    // provas bimestrais: vale o aparelho com mais tentativas e o melhor prêmio
    r.provas = r.provas || {};
    Object.keys(antigo.provas || {}).forEach(function (k) {
      var x = r.provas[k], y = antigo.provas[k];
      if (!x) { r.provas[k] = U.copia(y); return; }
      if ((y.tentativas || 0) > (x.tentativas || 0)) { x.tentativas = y.tentativas; x.notas = U.copia(y.notas || []); }
      x.melhor = Math.max(x.melhor || 0, y.melhor || 0);
      if ((ORDEM_PREMIO[y.premio] || 0) > (ORDEM_PREMIO[x.premio] || 0)) { x.premio = y.premio; x.premioEm = y.premioEm; }
    });
    // unicórnios: união, maior XP
    Object.keys(antigo.unis || {}).forEach(function (k) {
      var x = r.unis[k], y = antigo.unis[k];
      if (!x) { r.unis[k] = U.copia(y); return; }
      x.xp = max(x.xp, y.xp); x.em = minPos(x.em, y.em); x.chocado = !!(x.chocado || y.chocado);
    });
    r.estrelas = { ganhas: max(r.estrelas.ganhas, antigo.estrelas && antigo.estrelas.ganhas), gastas: max(r.estrelas.gastas, antigo.estrelas && antigo.estrelas.gastas) };
    Object.keys(antigo.loja || {}).forEach(function (k) { if (antigo.loja[k]) r.loja[k] = true; });
    // fome e sede: por unicórnio vale o registro mudado por último (`em`; empate: o do lado mais recente).
    // Um lado sem o campo (aparelho com a versão antiga) não apaga nada: vale o outro lado.
    if (a.cuidados || b.cuidados) {
      r.cuidados = U.copia(recente.cuidados || {});
      Object.keys(antigo.cuidados || {}).forEach(function (k) {
        var x = r.cuidados[k], y = antigo.cuidados[k];
        if (!y) return;
        if (!x || (y.em || 0) > (x.em || 0)) r.cuidados[k] = U.copia(y);
      });
    }
    // despensa: contadores que só crescem, pelo maior (nunca some comida comprada)
    if (a.despensa || b.despensa) {
      r.despensa = U.copia(recente.despensa || {});
      Object.keys(antigo.despensa || {}).forEach(function (k) {
        var x = r.despensa[k], y = antigo.despensa[k];
        if (!y) return;
        if (!x) { r.despensa[k] = U.copia(y); return; }
        x.compradas = max(x.compradas, y.compradas); x.usadas = max(x.usadas, y.usadas);
      });
    }
    // interruptor novo das perguntas surpresa: se o lado mais recente não conhece (versão antiga), vale o do outro
    if (r.ajustes && r.ajustes.surpresa === undefined && antigo.ajustes && antigo.ajustes.surpresa !== undefined) r.ajustes.surpresa = antigo.ajustes.surpresa;
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
  // sem resposta (rede fora) é falha, não "sem servidor": o jogo espera e oferece tentar de novo
  function temServidor() {
    return fetch('api/progresso', { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { return r.headers.get('X-Reino') === '1'; });
  }
  function comLimite(promessa, ms) {
    return new Promise(function (ok, falha) {
      var t = setTimeout(function () { falha(new Error('sem resposta')); }, ms);
      promessa.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); falha(e); });
    });
  }

  /* Busca o progresso guardado (servidor de casa ou claude.ai) e junta com o do aparelho.
     A promessa só se cumpre com a resposta, e o jogo só começa depois dela: senão um aparelho
     novo abriria como jogo novo. Falha (ou demora demais) = rejeita, e o jogo pode tentar de novo.
     Aberto direto do arquivo, sem servidor nenhum, segue só no aparelho. */
  var tentativa = 0;
  P.iniciarNuvem = function () {
    var minha = ++tentativa;
    var usaClaude = window.claude && typeof window.claude.use === 'function';
    var pedirDb = usaClaude ? window.claude.use('db')
      : /^https?:$/.test(location.protocol) ? temServidor().then(function (s) { return s ? { doc: docDoServidor } : null; })
      : Promise.resolve(null);
    var pronto = pedirDb.then(function (db) {
      if (!db) return;
      var ref = db.doc('progresso/mariana');
      return ref.get().then(function (snap) {
        if (minha !== tentativa) return;   // resposta atrasada de uma tentativa que já desistiu
        nuvem.ref = ref;
        nuvem.ok = true;
        nuvem.status = 'sincronizado';
        if (snap.exists && snap.data() && snap.data().estado) {
          var guardado = snap.data().estado;
          // aparelho que nunca começou não tem nada a somar: fica com o guardado inteiro
          // (senão a aparência e as escolhas em branco dele, mais recentes, venceriam)
          var emBranco = !estado.comecou && (estado.geracao || 1) <= (guardado.geracao || 1);
          estado = completar(emBranco ? U.copia(guardado) : P.mesclar(estado, guardado));
          P.conferirPersistencia();
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
          if (P.conferirPersistencia().length) agendarNuvem();
          gravarLocal();
          U.emit('progresso', estado);
          U.emit('progressoRemoto', estado);
        }, function () { nuvem.status = 'local'; U.emit('nuvem', nuvem.status); });
      });
    });
    return comLimite(pronto, 12000).catch(function (e) {
      if (minha === tentativa) tentativa++;
      throw e;
    });
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
    if (raro && (perfeita && calma || P.persistiuSala(sala.id)) && P.ganharUni(raro.id)) {
      premios.ovos.push(raro.id);
      if (!(perfeita && calma)) premios.porPersistencia = true;
    }
    if (P.materiaCompleta(materia)) {
      var lend = unis.find(function (u) { return u.raridade === 'lendario'; });
      if (lend && P.ganharUni(lend.id)) { premios.ovos.push(lend.id); premios.materiaCompleta = true; }
    }
    premios.cresceu = P.xpMontaria(10 + (calma ? 5 : 0));
    P.salvar();
    return premios;
  };

  /* ---------- caminho da persistência ---------- */
  function vezesSala(id) { return (estado.salas[id] && estado.salas[id].vezes) || 0; }
  function vezesTreino(id) { return (estado.treinos[id] && estado.treinos[id].vezes) || 0; }
  P.persistiuSala = function (salaId) { return vezesSala(salaId) >= Reino.config.persistencia.sala; };
  // quantas vezes ainda faltam para o unicórnio nascer pela persistência (0 = já pode)
  P.faltamPersistencia = function (def) {
    var pers = Reino.config.persistencia;
    if (def.raridade === 'raro' && def.sala) return Math.max(0, pers.sala - vezesSala(def.sala));
    if (def.raridade === 'epico' && def.treino === 'ouro') return Math.max(0, pers.treinoOuro - vezesTreino(def.materiaId));
    if (def.raridade === 'epico' && def.treino === 'perfeito') return Math.max(0, pers.treinoPerfeito - vezesTreino(def.materiaId));
    return null;
  };
  // dá os raros/épicos que já cumprem a regra (retroativo); devolve os ids novos
  P.conferirPersistencia = function () {
    var novos = [];
    Reino.materias.forEach(function (m) {
      (m.unicornios || []).forEach(function (u) {
        if (u.raridade !== 'raro' && u.raridade !== 'epico') return;
        var def = { raridade: u.raridade, sala: u.sala, treino: u.treino, materiaId: m.id };
        if (P.faltamPersistencia(def) === 0 && P.ganharUni(u.id)) novos.push(u.id);
      });
    });
    if (novos.length) estado.atualizado = agora();
    return novos;
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
    var pers = Reino.config.persistencia;
    if (medalha === 'ouro' && !reg.ouro) reg.ouro = agora();
    if (medalha === 'ouro' || reg.vezes >= pers.treinoOuro) {
      var ep = unis.find(function (u) { return u.raridade === 'epico' && u.treino === 'ouro'; });
      if (ep && P.ganharUni(ep.id)) premios.ovos.push(ep.id);
    }
    if (acertos === total && !reg.perfeito) reg.perfeito = agora();
    if (acertos === total || reg.vezes >= pers.treinoPerfeito) {
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

  /* ---------- provas bimestrais (Escola do Reino) ---------- */
  // 1ª tentativa vale lendário, 2ª vale raro, da 3ª em diante vale comum
  P.premioDaTentativa = function (n) { return n <= 1 ? 'lendario' : n === 2 ? 'raro' : 'comum'; };
  P.regProva = function (prova) { return estado.provas[prova.id] || { tentativas: 0, notas: [] }; };
  // o que a próxima tentativa vale (null quando o acessório já foi ganho)
  P.valendoProva = function (prova) {
    var reg = P.regProva(prova);
    return reg.premio ? null : P.premioDaTentativa((reg.tentativas || 0) + 1);
  };
  P.registrarProva = function (prova, nota) {
    var reg = estado.provas[prova.id] || { tentativas: 0, notas: [] };
    var valendo = reg.premio ? null : P.premioDaTentativa((reg.tentativas || 0) + 1);
    reg.tentativas = (reg.tentativas || 0) + 1;
    reg.notas = (reg.notas || []).concat([nota]).slice(-20);
    reg.melhor = Math.max(reg.melhor || 0, nota);
    var sucesso = nota >= Reino.config.notaSucessoProva;
    var premios = { tentativa: reg.tentativas, nota: nota, sucesso: sucesso, valendo: valendo, raridade: null, acessorio: null, estrelas: 0 };
    if (sucesso && valendo) {
      premios.raridade = valendo;
      premios.acessorio = prova.acessorios[valendo];
      estado.loja[premios.acessorio.id] = true;
      reg.premio = valendo;
      reg.premioEm = agora();
    }
    premios.proximo = reg.premio ? null : P.premioDaTentativa(reg.tentativas + 1);
    estado.provas[prova.id] = reg;
    premios.estrelas = Math.round(nota);
    P.ganharEstrelas(premios.estrelas);
    premios.cresceu = P.xpMontaria(Math.round(nota * 2));
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
    // fome e sede (cuidados) e a despensa continuam: são do unicórnio, não do ciclo de provas
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
