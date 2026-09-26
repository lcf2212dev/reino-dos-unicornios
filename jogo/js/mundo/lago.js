/* O lago do reino: tiles de água (Mapa.agua: dá para nadar, não é sólido), a fundura de um
   ponto na água desenhada (Mapa.fundura, a linha d'água dos sprites) e o desenho do lago
   (Mapa._interno.desenharLago, chamado por Mapa.prerender). Os tiles 'a' são marcados em
   Mapa.criar (mundo/mapa.js); o custo de nadar no caminho também fica lá. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T;
  var C = I.C, ret = I.ret, elipse = I.elipse;

  // tile de água do lago (a fonte da praça não é água e continua sólida)
  Mapa.agua = function (x, y) { return I.dentro(x, y) && I.tipo[y][x] === 'a'; };

  var LAGO = { cx: 18, cy: 24.6, rx: 6.5, ry: 2.4 };
  // a água como desenhada (a elipse de desenharLago), em px do jogo
  var ESPELHO = { cx: Math.round(LAGO.cx * T), cy: Math.round(LAGO.cy * T), rx: Math.round(LAGO.rx * T), ry: Math.round(LAGO.ry * T) };
  // quantos px o ponto (wx, wy) está para dentro da água desenhada (negativo = fora, na margem).
  // É o que decide onde fica a linha d'água dos sprites: casa com o desenho do lago, e não com a
  // grade de tiles (nas pontas da elipse, o tile é água mas o desenho já é areia).
  Mapa.fundura = function (wx, wy) {
    var dx = wx - ESPELHO.cx, dy = wy - ESPELHO.cy;
    var ax = dx / (ESPELHO.rx * ESPELHO.rx), ay = dy / (ESPELHO.ry * ESPELHO.ry);
    var f = dx * ax + dy * ay;                           // 1 = na borda da água
    var grad = 2 * Math.sqrt(ax * ax + ay * ay);
    return (1 - f) / Math.max(grad, 1e-6);               // distância aproximada até a borda
  };
  function hasteJunco(ctx, x, y, h) {
    ret(ctx, x, y, 1, h, '#2f7a48');
    ret(ctx, x, y, 1, 2, '#8fb83a');
  }
  function desenharLago(ctx) {
    var cx = Math.round(LAGO.cx * T), cy = Math.round(LAGO.cy * T);
    var rx = Math.round(LAGO.rx * T), ry = Math.round(LAGO.ry * T);
    elipse(ctx, cx, cy, rx + 4, ry + 4, C.margem);
    elipse(ctx, cx, cy, rx + 1, ry + 1, '#e8d090');
    elipse(ctx, cx, cy, rx, ry, C.agua);
    elipse(ctx, cx, cy + 1, rx - 20, ry - 12, C.agua3);
    elipse(ctx, cx, cy + 3, 48, 13, '#2a7f78');
    elipse(ctx, cx - 2, cy - 4, 16, 3, C.agua2);
    [[192, 386, 10, '#ffffff'], [194, 400, 8, C.agua2], [376, 388, 12, C.agua2], [374, 400, 14, '#ffffff']].forEach(function (s) {
      ret(ctx, s[0], s[1], s[2], 1, s[3]);
    });
    [[286, 353], [180, 392], [393, 400], [286, 433], [338, 357], [228, 427]].forEach(function (p) {
      ret(ctx, p[0], p[1], 2, 1, C.margem);
      ret(ctx, p[0], p[1] + 1, 2, 1, '#cbb892');
    });
    [[-60, -8, 6, 3, '#ff8a3d'], [-40, 12, 5, 3, '#ffe066'], [52, 4, 7, 3, null], [70, -10, 5, 2, '#ff8a3d']].forEach(function (v) {
      elipse(ctx, cx + v[0] + 1, cy + v[1] + 1, v[2], v[3], '#2a7f78');
      elipse(ctx, cx + v[0], cy + v[1], v[2], v[3], '#8fb83a');
      elipse(ctx, cx + v[0] - 1, cy + v[1] - 1, Math.max(2, v[2] - 2), 1, '#b6d24e');
      ret(ctx, cx + v[0], cy + v[1], Math.max(2, v[2] - 1), 1, C.agua3);
      if (v[4]) {
        ret(ctx, cx + v[0] + 2, cy + v[1] - 2, 2, 2, v[4]);
        ret(ctx, cx + v[0] + 2, cy + v[1] - 2, 1, 1, '#fff6a8');
      }
    });
    [[236, 350, 8], [238, 347, 10], [241, 352, 6],
      [328, 349, 8], [331, 346, 11], [334, 351, 6],
      [184, 388, 7], [182, 386, 9], [186, 390, 6],
      [390, 388, 7], [392, 385, 10], [388, 391, 5],
      [256, 426, 7], [258, 423, 9], [261, 428, 6],
      [336, 422, 8], [338, 420, 10], [341, 424, 6]].forEach(function (h) { hasteJunco(ctx, h[0], h[1], h[2]); });
  }
  I.desenharLago = desenharLago;
})();
