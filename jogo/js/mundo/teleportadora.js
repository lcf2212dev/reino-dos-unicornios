/* A Teleportadora da praça principal (docs/contratos/cidade-nova.md): um unicórnio com aura
   arco-íris no meio da praça, ao lado da fonte. Entra em Mapa.CIDADE.objetos (2×2, sólida) e no
   desenho do mapa; o toque/Enter abre o balão dela (Reino.Teleportadora.falar), que leva à
   Cidade Nova. O desenho é de arte/teleportadora.js. Carrega depois de mundo/cofre-desenho.js
   para embrulhar Mapa.alvoObjeto sem perder o cofre. */
(function () {
  var R = window.Reino, Mapa = window.Mapa, I = Mapa._interno, T = Mapa.T;
  var CFG = (R.config && R.config.lojaCidade) || {}, P = CFG.teleportadoraPrincipal || { x: 31, y: 21 };
  var TIPO = 'teleportadora';
  if (!(Mapa.CIDADE.objetos || []).some(function (o) { return o.tipo === TIPO; })) {
    (Mapa.CIDADE.objetos = Mapa.CIDADE.objetos || []).push({ tipo: TIPO, x: P.x, y: P.y, w: 2, h: 2 });
  }
  function obj() { return (I.objetos || []).filter(function (o) { return o.tipo === TIPO; })[0] || null; }
  function arte() { return R.TeleportadoraArte; }

  // estático: o unicórnio com a aura parada
  I.OBJETOS[TIPO] = function (ctx, o) {
    var a = arte();
    if (a) a.desenhar(ctx, o.x * T, o.y * T, 0, false);
  };
  // animado: só a aura, por cima do estático (o corpo fica no estático)
  var animarAntes = I.animarObjeto;
  I.animarObjeto = function (ctx, o, t) {
    if (o && o.tipo === TIPO) { var a = arte(); if (a) a.animar(ctx, o.x * T, o.y * T, t); return; }
    if (animarAntes) animarAntes(ctx, o, t);
  };

  function abrir() {
    if (R.Teleportadora && R.Teleportadora.falar) return R.Teleportadora.falar('cidade');
    return Promise.resolve();
  }
  function alvo(o, tile) {
    var dx = Math.sign(Math.max(o.x, Math.min(o.x + o.w - 1, tile.x)) - tile.x);
    var dy = Math.sign(Math.max(o.y, Math.min(o.y + o.h - 1, tile.y)) - tile.y);
    return { tipo: 'objeto', id: TIPO, tile: tile, olhar: dy ? { x: 0, y: dy } : { x: dx, y: 0 }, agir: abrir };
  }
  function naPegada(o, tx, ty) { return tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h; }

  var alvoObjetoAntes = Mapa.alvoObjeto;
  Mapa.alvoObjeto = function (wx, wy) {
    var o = obj();
    if (o && wx >= o.x * T && wx < (o.x + o.w) * T && wy >= o.y * T - 40 && wy < (o.y + o.h) * T) {
      var frente = { x: o.x + Math.floor(o.w / 2), y: o.y + o.h };
      var tile = Mapa.solido(frente.x, frente.y) ? Mapa.maisPerto(frente.x, frente.y, window.Jogador && Jogador.tile()) : frente;
      return alvo(o, tile || frente);
    }
    return alvoObjetoAntes ? alvoObjetoAntes(wx, wy) : null;
  };
  var pertoAntes = Mapa.alvoObjetoPerto;
  Mapa.alvoObjetoPerto = function (tl, olhar) {
    var o = obj();
    if (o) {
      var viz = [olhar && { x: olhar.x, y: olhar.y }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
      for (var i = 0; i < viz.length; i++) {
        var v = viz[i];
        if (v && (v.x || v.y) && naPegada(o, tl.x + v.x, tl.y + v.y)) return alvo(o, { x: tl.x, y: tl.y });
      }
    }
    return pertoAntes ? pertoAntes(tl, olhar) : null;
  };
})();
