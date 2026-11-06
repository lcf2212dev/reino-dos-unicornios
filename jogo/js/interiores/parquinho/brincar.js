/* Parquinho, parte 0: a brincadeira num brinquedo (Reino.ParquinhoBrincar; docs/contratos/parquinho.md). Fica no
   começo da pasta (e não em sistemas/, que carrega depois dos prédios) porque as poses se registram nele. O mesmo esquema do uso
   dos móveis da casa (casa-usos-animar.js): Cena.ocupar('parquinho') no começo e liberar no fim; toques e teclas
   engolidos enquanto dura; depois de config.parquinho.pularDepoisMs um toque (ou Enter, Espaço, Esc) pula para o fim;
   um temporizador de segurança sempre libera; sem Animações (ou "reduzir movimento"), a versão curta (curtaMs) com a
   pose parada. Tudo sai do tempo decorrido: pular é só ir ao fim.
   Quem desenha é a camada do módulo 'parquinho' (sistemas/parquinho.js); a pose de cada brinquedo vem do prédio
   (interiores/parquinho/poses*.js), por registrarPose(id, def):
     def = { sons: [[fração, som]], esconde?: true, geo(st) → geo, itens(p, st, e, animar) → itens,
             sobre?(p, st, e, animar), saida?(st) → { x, y } (tile onde ela fica no fim) }
     st = { id, obj: { tipo, x, y, w, h }, de: { x, y } (os pés dela no começo), dur, curta, geo, interior }
   `esconde`: o desenho parado do brinquedo tira a parte que se mexe enquanto ele está em uso (emUso(id), lido pela
   `chave` dos objetos em interiores/parquinho/; o interior é refeito no começo e no fim).
   Nada vai para o save: o castelinho de areia fica de pé até fechar o jogo (memória).
   Sem nada de DOM, canvas, PA, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var Q = { poses: {} };
  var st = null, timers = [], engolirAte = 0, ouvindo = false, ultimo = null, castelos = 0;

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

  /* ---------- toque e teclado enquanto brinca ---------- */
  function podePular() { return !!st && st.comecou && agora() - st.inicio >= (cfg().pularDepoisMs || 0); }
  function aoToque(e) {
    if (!st && agora() > engolirAte) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    if (e.type === 'pointerdown' && podePular()) terminar(true);
  }
  var PULAR = { Enter: 1, ' ': 1, Escape: 1 };
  var ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };
  function aoTeclar(e) {
    if (!st && agora() > engolirAte) return;
    if (!PULAR[e.key] && !ANDAR[e.key]) return;
    e.stopPropagation();
    e.preventDefault();
    if (PULAR[e.key] && !e.repeat && podePular()) terminar(false);
  }
  function ouvir(ligar) {
    if (ligar === ouvindo) return;
    ouvindo = ligar;
    var f = ligar ? window.addEventListener : window.removeEventListener;
    f.call(window, 'pointerdown', aoToque, true);
    f.call(window, 'click', aoToque, true);
    f.call(window, 'keydown', aoTeclar, true);
  }

  /* ---------- começo e fim ---------- */
  function depois(ms, fn) { var dono = st; timers.push(setTimeout(function () { if (st === dono) fn(); }, ms)); }
  function terminar(porToque) {
    if (!st) return;
    var s = st, pose = Q.poses[s.id];
    timers.forEach(clearTimeout); timers = [];
    st = null;
    if (s.id === 'areia') castelos++;   // antes de refazer: o castelinho entra no desenho parado
    ultimo = { ativo: false, brinquedo: s.id, t: Math.round(agora() - s.inicio), curta: s.curta, pulou: !!porToque };
    // ela fica onde a brincadeira acaba (o pé do escorregador), se o tile estiver livre
    var J = window.Jogador, cena = R.Cena && R.Cena.atual();
    var fim = pose && pose.saida ? pose.saida(s) : null;
    if (fim && J && cena && cena.solido && !cena.solido(fim.x, fim.y)) { J.posicionar(fim.x, fim.y); J.virar(0, 1); }
    if (pose && pose.esconde) refazer(s.interior);
    engolirAte = porToque ? agora() + 400 : 0;
    setTimeout(function () { if (!st) ouvir(false); }, porToque ? 420 : 0);
    if (R.Cena && R.Cena.ocupada && R.Cena.ocupada() === 'parquinho') R.Cena.liberar('parquinho');
    var ok = s.resolver;
    setTimeout(function () { if (ok) ok({ pulou: !!porToque }); }, porToque ? 450 : 0);
  }

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
      var curta = !animacoesLigadas();
      st = {
        id: id, interior: (ctx.interior && ctx.interior.id) || 'parquinho', curta: curta,
        obj: { tipo: o.tipo, x: o.x, y: o.y, w: o.w || lib.w || 1, h: o.h || lib.h || 1 },
        dur: curta ? cfg().curtaMs : (cfg().ms[id] || 4000), inicio: agora(), comecou: true,
        de: { x: Math.round(J.x), y: Math.round(J.y) },
      };
      try { st.geo = pose.geo ? pose.geo(st) : {}; } catch (e) { console.error(e); st = null; return Promise.resolve(); }
      var promessa = new Promise(function (ok) { st.resolver = ok; });
      if (R.Cena && R.Cena.ocupar) R.Cena.ocupar('parquinho');
      ouvir(true);
      if (pose.esconde) refazer(st.interior);
      tocar('selecionar');
      if (!curta) (pose.sons || []).forEach(function (x) { depois(x[0] * st.dur, function () { tocar(x[1]); }); });
      else tocar((pose.sons && pose.sons.length) ? pose.sons[pose.sons.length - 1][1] : 'plim');
      depois(st.dur, function () { terminar(false); });
      depois(st.dur + 2000, function () { terminar(false); });   // rede de segurança
      return promessa;
    },
    ativo: function () { return !!st && !!R.Cena && R.Cena.atual && R.Cena.atual().id === st.interior; },
    emUso: function (id) { return !!st && st.id === id && !!(Q.poses[id] && Q.poses[id].esconde); },
    // quantos castelinhos ela já fez desde que abriu o jogo (o da caixa de areia fica de pé)
    castelos: function () { return castelos; },
    itens: function (p, t, animar) {
      if (!B.ativo()) return [];
      var e = Math.min(st.dur, Math.max(0, agora() - st.inicio));
      try { return Q.poses[st.id].itens(p, st, e, !!animar && !st.curta) || []; } catch (er) { console.error(er); return []; }
    },
    sobre: function (p, t, animar) {
      if (!B.ativo() || !Q.poses[st.id].sobre) return;
      var e = Math.min(st.dur, Math.max(0, agora() - st.inicio));
      Q.poses[st.id].sobre(p, st, e, !!animar && !st.curta);
    },
    parar: function () { terminar(false); },
    depurar: function () {
      if (!st) return ultimo || { ativo: false, brinquedo: null };
      return { ativo: true, brinquedo: st.id, t: Math.round(agora() - st.inicio), curta: st.curta };
    },
  };
  // saiu do parquinho (ou trocou de cena) no meio: termina na hora
  if (R.util && R.util.on && R.EVENTOS) R.util.on(R.EVENTOS.CENA, function () { if (st) terminar(false); });
})();
