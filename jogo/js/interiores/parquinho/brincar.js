/* Parquinho, parte 0: a brincadeira num brinquedo (Reino.ParquinhoBrincar; docs/contratos/parquinho.md). Fica no
   começo da pasta (e não em sistemas/, que carrega depois dos prédios) porque as poses se registram nele. O mesmo esquema do uso
   dos móveis da casa (casa-usos-animar.js): Cena.ocupar('parquinho') no começo e liberar no fim; toques e teclas
   engolidos enquanto dura; depois de config.parquinho.pularDepoisMs um toque (ou Enter, Espaço, Esc) pula para o fim;
   um temporizador de segurança sempre libera; sem Animações (ou "reduzir movimento"), a versão curta (curtaMs) com a
   pose parada. Tudo sai do tempo decorrido: pular é só ir ao fim.
   Quem desenha é a camada do módulo 'parquinho' (sistemas/parquinho.js); a pose de cada brinquedo vem do prédio
   (interiores/parquinho/poses*.js), por registrarPose(id, def):
     def = { sons: [[fração, som]], esconde?: true, geo(st) → geo, itens(p, st, e, animar) → itens,
             sobre?(p, st, e, animar), saida?(st) → { x, y } (tile onde ela fica no fim),
             fim?(st, { pulou }) (no fim, antes de refazer o desenho parado: o que fica depois da brincadeira) }
     st = { id, obj: { tipo, x, y, w, h }, de: { x, y } (os pés dela no começo), dur, curta, geo, interior }
   Pose interativa (`interativo: true`, o balanço): ela brinca até querer sair. Sem fim por tempo nem temporizador de
   segurança (sair de cena ainda encerra); `e` não para em `dur`; `sons` não tocam sozinhos. Até pularDepoisMs nada
   passa (o toque que começou não conta); Esc encerra sempre; o resto vai para a pose:
     comecar?(st, ctx)   ctx da ação ({ interior, cena, objeto }), no começo
     toque?(st, { fase: 'apertou'|'moveu'|'soltou'|'cancelou', dx, dy (px CSS desde o apertar), ms, toque })
             um dedo (ou o mouse) por vez; toque = soltou quase no mesmo lugar e rápido (um toque, não um arrasto)
     tecla?(st, { fase: 'desceu'|'subiu', key })   Enter, Espaço e as setas/WASD; sem a repetição automática, e o
             'subiu' só de tecla que desceu aqui (o Enter que começou a brincadeira não solta nada)
     depurar?(st) → objeto (entra no depurar())
   e a pose usa st.acabar(porToque?) para encerrar e st.depois(ms, fn) para um timer desta brincadeira.
   `esconde`: o desenho parado do brinquedo tira a parte que se mexe enquanto ele está em uso (emUso(id), lido pela
   `chave` dos objetos em interiores/parquinho/; o interior é refeito no começo e no fim).
   Nada vai para o save (o que fica depois da brincadeira é da pose, no `fim`, e só em memória).
   Sem nada de DOM, canvas, PA, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var Q = { poses: {} };
  var st = null, timers = [], engolirAte = 0, ouvindo = false, ultimo = null;
  var LIMIAR_TOQUE = 10, TOQUE_MS = 500;   // até isto (px CSS, ms) o apertar e soltar é um toque, não um arrasto
  var dedo = null, teclas = {};            // na pose interativa: o dedo apertado e as teclas que desceram aqui

  function cfg() { return R.config.parquinho; }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function tocar(som) { try { if (R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function animacoesLigadas() {
    var est = R.Progresso && R.Progresso.estado();
    return !!(est && est.ajustes && est.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }
  function refazer(id) {
    var I = R.Interiores;
    if (id && I && I.refazer) { try { I.refazer(id); } catch (e) { console.error(e); } }
  }
  function interativa() { return !!st && !!st.interativo; }
  // uma tela ou o balão do Claude por cima da brincadeira sem fim: o toque e a tecla são deles, não do brinquedo
  function telaPorCima() {
    try { return !!(R.UI && R.UI.temTela && R.UI.temTela()) || !!(R.Claude && R.Claude.aberto && R.Claude.aberto()); } catch (e) { return false; }
  }
  // um gancho da pose interativa; erro nele encerra a brincadeira (ela nunca fica presa no brinquedo)
  function mandar(gancho, ev) {
    var pose = st && Q.poses[st.id];
    if (!pose || !pose[gancho]) return;
    try { pose[gancho](st, ev); } catch (er) { console.error(er); terminar(false); }
  }

  /* ---------- toque e teclado enquanto brinca ---------- */
  function podePular() { return !!st && st.comecou && agora() - st.inicio >= (cfg().pularDepoisMs || 0); }
  function aoToque(e) {
    if (!st && agora() > engolirAte) return;
    if (interativa() && telaPorCima()) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    if (interativa()) { if (e.type === 'pointerdown') aoDedo(e); return; }
    if (e.type === 'pointerdown' && podePular()) terminar(true);
  }
  // pointermove/up/cancel: só a pose interativa usa (nas outras passam, como sempre passaram)
  function aoMover(e) {
    if (!interativa() || telaPorCima()) return;
    e.stopPropagation();
    aoDedo(e);
  }
  function aoDedo(e) {
    if (!podePular()) return;
    var t = agora();
    if (e.type === 'pointerdown') {
      if (dedo) return;
      dedo = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: t, longe: false };
      mandar('toque', { fase: 'apertou', dx: 0, dy: 0, ms: 0, toque: false });
      return;
    }
    if (!dedo || e.pointerId !== dedo.id) return;
    var dx = e.clientX - dedo.x0, dy = e.clientY - dedo.y0, ms = t - dedo.t0;
    if (Math.sqrt(dx * dx + dy * dy) > LIMIAR_TOQUE) dedo.longe = true;
    if (e.type === 'pointermove') { mandar('toque', { fase: 'moveu', dx: dx, dy: dy, ms: ms, toque: false }); return; }
    var soltou = e.type === 'pointerup', toque = soltou && !dedo.longe && ms <= TOQUE_MS;
    dedo = null;
    mandar('toque', { fase: soltou ? 'soltou' : 'cancelou', dx: dx, dy: dy, ms: ms, toque: toque });
  }
  var PULAR = { Enter: 1, ' ': 1, Escape: 1 };
  var ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };
  function aoTeclar(e) {
    if (!st && agora() > engolirAte) return;
    if (!PULAR[e.key] && !ANDAR[e.key]) return;
    if (interativa() && telaPorCima()) return;
    e.stopPropagation();
    e.preventDefault();
    if (interativa()) {
      if (e.repeat || !podePular()) return;
      if (e.key === 'Escape') { terminar(false); return; }
      if (teclas[e.key]) return;
      teclas[e.key] = true;
      mandar('tecla', { fase: 'desceu', key: e.key });
      return;
    }
    if (PULAR[e.key] && !e.repeat && podePular()) terminar(false);
  }
  function aoSoltarTecla(e) {
    if (!interativa() || !teclas[e.key]) return;
    delete teclas[e.key];
    mandar('tecla', { fase: 'subiu', key: e.key });
  }
  // a janela perdeu o foco com o dedo ou a tecla apertados: é como soltar
  function aoSairDaJanela() {
    if (!interativa()) return;
    if (dedo) { dedo = null; mandar('toque', { fase: 'cancelou', dx: 0, dy: 0, ms: 0, toque: false }); }
    Object.keys(teclas).forEach(function (k) { delete teclas[k]; if (st) mandar('tecla', { fase: 'subiu', key: k }); });
  }
  function ouvir(ligar) {
    if (ligar === ouvindo) return;
    ouvindo = ligar;
    var f = ligar ? window.addEventListener : window.removeEventListener;
    f.call(window, 'pointerdown', aoToque, true);
    f.call(window, 'click', aoToque, true);
    f.call(window, 'keydown', aoTeclar, true);
    f.call(window, 'pointermove', aoMover, true);
    f.call(window, 'pointerup', aoMover, true);
    f.call(window, 'pointercancel', aoMover, true);
    f.call(window, 'keyup', aoSoltarTecla, true);
    f.call(window, 'blur', aoSairDaJanela);
  }

  /* ---------- começo e fim ---------- */
  function depois(ms, fn) { var dono = st; timers.push(setTimeout(function () { if (st === dono) fn(); }, ms)); }
  function terminar(porToque) {
    if (!st) return;
    var s = st, pose = Q.poses[s.id];
    timers.forEach(clearTimeout); timers = [];
    st = null; dedo = null; teclas = {};
    if (pose && pose.fim) { try { pose.fim(s, { pulou: !!porToque }); } catch (e) { console.error(e); } }   // antes de refazer
    ultimo = { ativo: false, brinquedo: s.id, t: Math.round(agora() - s.inicio), curta: s.curta, pulou: !!porToque };
    // ela fica onde a brincadeira acaba (o pé do escorregador), se o tile estiver livre
    var J = window.Jogador, cena = R.Cena && R.Cena.atual();
    var fim = null;
    try { fim = pose && pose.saida ? pose.saida(s) : null; } catch (e) { console.error(e); }
    if (fim && J && cena && cena.solido && !cena.solido(fim.x, fim.y)) { J.posicionar(fim.x, fim.y); J.virar(0, 1); }
    if (pose && pose.esconde) refazer(s.interior);
    engolirAte = porToque ? agora() + 400 : 0;
    setTimeout(function () { if (!st) ouvir(false); }, porToque ? 420 : 0);
    if (R.Cena && R.Cena.ocupada && R.Cena.ocupada() === 'parquinho') R.Cena.liberar('parquinho');
    var ok = s.resolver;
    setTimeout(function () { if (ok) ok({ pulou: !!porToque }); }, porToque ? 450 : 0);
  }
  function decorrido() { var e = Math.max(0, agora() - st.inicio); return st.interativo ? e : Math.min(st.dur, e); }

  var B = R.ParquinhoBrincar = {
    registrarPose: function (id, def) { Q.poses[id] = def; },
    poses: function () { return Object.keys(Q.poses); },
    // acao = { tipo: 'parquinhoBrincar', brinquedo, surpresa? }; ctx = { interior, objeto } (interiores-toque.js)
    brincar: function (acao, ctx) {
      var id = acao && acao.brinquedo, pose = Q.poses[id], o = ctx && ctx.objeto, J = window.Jogador;
      // brinquedo da fase 2 ainda embrulhado: a tela da surpresa (o que falta)
      if (acao && acao.surpresa && R.Parquinho.fase() < 2) {
        tocar('selecionar');
        if (R.UI && R.UI.telaParquinho) R.UI.telaParquinho('presente');
        return Promise.resolve();
      }
      if (!pose || !o || st || !J) return Promise.resolve();
      var lib = (R.Interiores && R.Interiores.OBJETOS[o.tipo]) || {};
      var curta = !animacoesLigadas(), interativo = !!pose.interativo;
      var este = st = {
        id: id, interior: (ctx.interior && ctx.interior.id) || 'parquinho', curta: curta, interativo: interativo,
        obj: { tipo: o.tipo, x: o.x, y: o.y, w: o.w || lib.w || 1, h: o.h || lib.h || 1 },
        dur: curta ? cfg().curtaMs : (cfg().ms[id] || 4000), inicio: agora(), comecou: true,
        de: { x: Math.round(J.x), y: Math.round(J.y) },
      };
      st.acabar = function (porToque) { if (st === este) terminar(!!porToque); };
      st.depois = function (ms, fn) { if (st === este) depois(ms, fn); };
      try {
        st.geo = pose.geo ? pose.geo(st) : {};
        if (interativo && pose.comecar) pose.comecar(st, ctx);
      } catch (e) { console.error(e); st = null; return Promise.resolve(); }
      var promessa = new Promise(function (ok) { st.resolver = ok; });
      if (R.Cena && R.Cena.ocupar) R.Cena.ocupar('parquinho');
      ouvir(true);
      if (pose.esconde) refazer(st.interior);
      tocar('selecionar');
      if (interativo) return promessa;   // ela brinca até querer sair: sem som marcado nem fim por tempo
      if (!curta) (pose.sons || []).forEach(function (x) { depois(x[0] * st.dur, function () { tocar(x[1]); }); });
      else tocar((pose.sons && pose.sons.length) ? pose.sons[pose.sons.length - 1][1] : 'plim');
      depois(st.dur, function () { terminar(false); });
      depois(st.dur + 2000, function () { terminar(false); });   // rede de segurança
      return promessa;
    },
    ativo: function () { return !!st && !!R.Cena && R.Cena.atual && R.Cena.atual().id === st.interior; },
    emUso: function (id) { return !!st && st.id === id && !!(Q.poses[id] && Q.poses[id].esconde); },
    itens: function (p, t, animar) {
      if (!B.ativo()) return [];
      try { return Q.poses[st.id].itens(p, st, decorrido(), !!animar && !st.curta) || []; } catch (er) { console.error(er); return []; }
    },
    sobre: function (p, t, animar) {
      if (!B.ativo() || !Q.poses[st.id].sobre) return;
      Q.poses[st.id].sobre(p, st, decorrido(), !!animar && !st.curta);
    },
    parar: function () { terminar(false); },
    depurar: function () {
      if (!st) return ultimo || { ativo: false, brinquedo: null };
      var d = { ativo: true, brinquedo: st.id, t: Math.round(agora() - st.inicio), curta: st.curta }, pose = Q.poses[st.id];
      if (pose && pose.depurar) { try { var x = pose.depurar(st) || {}; Object.keys(x).forEach(function (k) { d[k] = x[k]; }); } catch (e) {} }
      return d;
    },
  };
  // saiu do parquinho (ou trocou de cena) no meio: termina na hora
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function () { if (st) terminar(false); });
})();
