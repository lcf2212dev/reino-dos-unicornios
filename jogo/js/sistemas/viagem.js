/* Viagem de foguete (viagem): o registro dos planetas, o tanque de combustível, o passaporte e a ação `viagem`.
   Contrato: docs/contratos/viagem.md. Cada resposta certa (Reino.EVENTOS.RESPOSTAS, de Reino.Aura.contar) põe 1 no
   tanque, até config.viagem.tanque; errada não tira. O fluxo (decolar → voo → chegada, a volta, o aviso) está em
   viagem-fluxo.js; o painel em ui/foguete.js. Textos falados: aqui (falas()), voz 'claude'.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var planetas = [];
  function cfg() { return R.config.viagem; }
  function max() { return cfg().tanque; }

  var V = R.Viagem = {};
  /** Registra um planeta (arquivo do planeta, no carregamento). @param {{ id: string, nome: string,
      interior: string, chegada: {x: number, y: number}, ordem: number, cor: string, materia?: string,
      artigo?: string, depois?: string }} p */
  V.registrarPlaneta = function (p) {
    if (!p || !p.id || !p.interior) throw new Error('registrarPlaneta: falta id ou interior');
    if (planetas.some(function (o) { return o.id === p.id; })) throw new Error('registrarPlaneta: id repetido ' + p.id);
    planetas.push(p);
    planetas.sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  };
  V.planetas = function () { return planetas.slice(); };
  V.planeta = function (id) { return planetas.find(function (p) { return p.id === id || p.interior === id; }) || null; };
  // o destino está aberto? (`depois`: só com o carimbo daquele planeta; o painel mostra o cadeado)
  V.aberto = function (id) {
    var p = V.planeta(id);
    return !!p && (!p.depois || !!V.carimbos()[p.depois]);
  };

  /* ================= NO SAVE ================= */
  // combustivel: { mariana: { n, em } } (save-e-mescla.md §11): entre aparelhos vale o mais recente (o tanque
  // também desce, ao decolar). Sem o campo: cheio se config.viagem.cheioNoComeco. Novo ciclo mantém.
  R.Progresso.registrarCampo('combustivel', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var m = v.mariana;
      if (m === undefined) return v;
      var n = typeof m.n === 'number' && isFinite(m.n) ? Math.max(0, Math.min(max(), Math.round(m.n))) : 0;
      return { mariana: { n: n, em: m.em } };
    },
    exemplos: [{ mariana: { n: 3, em: 10 } }, { mariana: { n: 0, em: 20 } }],
  });
  // passaporte: { <planeta>: true }, um carimbo por planeta visitado; só cresce
  R.Progresso.registrarCampo('passaporte', {
    padrao: function () { return {}; },
    mesclar: 'uniao',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ lua: true }, { lua: true, marte: true }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }
  function salvar() { try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ } }

  /* ================= TANQUE ================= */
  V.tanque = function () {
    var est = estado(), m = est && est.combustivel && est.combustivel.mariana;
    var n = m && typeof m.n === 'number' ? m.n : (cfg().cheioNoComeco ? max() : 0);
    return { n: Math.max(0, Math.min(max(), n)), max: max() };
  };
  V.cheio = function () { var t = V.tanque(); return t.n >= t.max; };
  function gravarTanque(n) {
    var est = estado();
    if (!est) return;
    var mar = est.combustivel && est.combustivel.mariana;
    est.combustivel = est.combustivel || {};
    est.combustivel.mariana = { n: n, em: Math.max(Date.now(), (mar && mar.em || 0) + 1) };
    salvar();
  }
  // põe n no tanque (nunca passa do máximo); devolve o tanque
  V.ganhar = function (n) {
    n = Math.floor(Number(n) || 0);
    var t = V.tanque();
    if (n > 0 && t.n < t.max) gravarTanque(Math.min(t.max, t.n + n));
    return V.tanque();
  };
  // decolou: o tanque fica vazio
  V.gastar = function () { gravarTanque(0); return V.tanque(); };

  /* ================= PASSAPORTE ================= */
  V.carimbos = function () {
    var est = estado(), p = est && est.passaporte, r = {};
    if (p) Object.keys(p).forEach(function (k) { if (p[k] === true) r[k] = true; });
    return r;
  };
  // true = carimbo novo (1ª visita)
  V.carimbar = function (id) {
    var est = estado();
    if (!est || !id || V.carimbos()[id]) return false;
    est.passaporte = est.passaporte || {};
    est.passaporte[id] = true;
    salvar();
    return true;
  };

  /* ================= FALAS ================= */
  // tudo o que o painel e o fluxo falam (texto exato = voz; até 30 letras por página)
  V.frases = {
    cheio: ['O tanque está cheio!', 'Escolha para onde voar!'],
    faltam: function (n) {
      return [n === 1 ? 'Falta 1 resposta certa!' : 'Faltam ' + n + ' respostas certas!',
        'Acerte nas salas e no treino.', 'Nas provas e surpresas também!'];
    },
    chegou: function (nome, artigo) { return 'Chegamos ' + (artigo || 'na') + ' ' + nome + '!'; },
    carimbo: 'Carimbo novo no passaporte!',
    estrelas: function (n) { return n === 1 ? 'Você ganhou 1 estrela!' : 'Você ganhou ' + n + ' estrelas!'; },
    voltar: 'Voltar para o Reino?',
    // o cadeado do painel: "Visite a Lua primeiro!", "Visite Marte primeiro!"
    antes: function (nome, artigo) { return 'Visite ' + (artigo === 'em' ? '' : 'a ') + nome + ' primeiro!'; },
    aviso: ['O foguete da NASA agora voa!', 'Vá ao Observatório, 2º andar.'],
  };
  V.falas = function () {
    var F = V.frases, t = [].concat(F.cheio, F.carimbo, F.voltar, F.aviso);
    for (var n = 1; n <= max(); n++) t = t.concat(F.faltam(n));
    // estrelas da chegada: as do voo mais as dos portais
    var maxEst = cfg().estrelasPorVoo + (cfg().portaisPorVoo || 0) * (cfg().estrelasPorPortal || 0);
    for (var e = 1; e <= maxEst; e++) t.push(F.estrelas(e));
    planetas.forEach(function (p) {
      t.push(F.chegou(p.nome, p.artigo));
      var antes = p.depois && V.planeta(p.depois);
      if (antes) t.push(F.antes(antes.nome, antes.artigo));
    });
    // o que o voo fala (atividades/voo.js carrega depois; falas() só é chamada depois de tudo carregado)
    if (R.Voo && R.Voo.falas) R.Voo.falas().forEach(function (f) { t.push(f.texto); });
    var vistos = {};
    return t.filter(function (x) { if (vistos[x]) return false; vistos[x] = true; return true; })
      .map(function (x) { return { texto: x, voz: 'claude' }; });
  };

  // cada resposta certa (sala, treino, prova, pergunta surpresa) põe 1 no tanque
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.RESPOSTAS, function (r) { if (r && r.certas > 0) V.ganhar(r.certas); });

  // ação `viagem`: sem `para` (o foguete do Hangar) abre o painel do foguete; com `para` (o foguete de um planeta)
  // pergunta e volta para lá, na `chegada`, de graça (viagem-fluxo.js)
  function viagem(acao) {
    if (acao && acao.para) return V.voltar ? V.voltar(acao) : R.Cena.irPara(acao.para, acao.chegada, { x: 0, y: 1 });
    if (R.UI && R.UI.telaFoguete) R.UI.telaFoguete();
    return Promise.resolve();
  }

  R.registrarModulo({
    id: 'viagem',
    acoes: { viagem: viagem },
    iniciar: function () { if (V.vigiarAviso) V.vigiarAviso(); },
    falas: function () { return V.falas(); },
    depurar: function () { return { tanque: V.tanque(), cheio: V.cheio(), carimbos: V.carimbos(), planetas: planetas.map(function (p) { return p.id; }), avisou: !!(R._viagem && R._viagem.avisou) }; },
  });
})();
