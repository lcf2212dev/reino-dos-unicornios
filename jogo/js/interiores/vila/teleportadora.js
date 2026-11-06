/* Vila Arco-Íris: o objeto `vila-teleportadora` (docs/contratos/vila.md §2 e §6), a Teleportadora de aura
   arco-íris, 2 × 1 tiles, sólida, na ordem por y com a Mariana (alto). Quem a põe na Vila (vila.js) dá a ação
   { tipo: 'teleportadora', para: 'cidade' } (módulo 'teleportadora', sistemas/teleportadora.js).
   Desenho em arte/teleportadora.js: o parado no `desenhar`; no `anim` (só com Animações), as cores da aura que
   andam, o pulso e os brilhinhos que sobem, só com fillRect (o anim dos móveis altos desenha pelo pintor).
   node: true: nada de canvas no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores;
  // o meio dela (entre os 2 tiles) e a última fileira dos cascos, em px do jogo
  function base(px, py) { return { x: px + 16, b: py + 14 }; }
  I.objeto('vila-teleportadora', { w: 2, h: 1, solido: true, alto: true, topo: 14, semSombra: true,
    desenhar: function (ctx, px, py) {
      var A = R.TeleportadoraArte, c = base(px, py);
      ctx.drawImage(A.parado(), c.x - A.CX, c.b - A.BASE);
    },
    anim: function (ctx, px, py, t) {
      var A = R.TeleportadoraArte, c = base(px, py), animar = !!t;
      function r(x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }
      var f = A.fase(t, animar);
      if (f !== A.PARADO) {
        var ox = c.x - A.CX, oy = c.b - A.BASE;
        A.pontos(f).forEach(function (p) { r(ox + p[0], oy + p[1], p[2], 1, p[3]); });
      }
      A.brilhos(r, c.x, c.b, t, animar);
    } });
})();
