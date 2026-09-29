/* Museu das Memórias: peças baixas do acervo (prefixo museu-) no lugar do "kit de enchimento" (balde, barril, cesto,
   vaso grande, banco, almofada e tapete redondo): moedas antigas, ânfora de barro, pião, mala de viagem, banco de
   veludo do museu e tapete marajoara. Carrega depois de museu/objetos.js e antes de museu/museu.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var BARRO = '#c0703f', BARRO2 = '#8a4a2a', VINHO = '#8a2a4a', OURO = C.ouro, OURO2 = C.ouro2;

  // bandeja de madeira com moedas antigas empilhadas
  I.objeto('museu-moedas', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 8, 14, 6, K); ret(ctx, px + 2, py + 9, 12, 4, C.madeira); ret(ctx, px + 2, py + 9, 12, 1, C.madeiraClara);
      [[4, 7, 3], [9, 6, 4], [12, 9, 1]].forEach(function (p) {
        for (var k = 0; k < p[2]; k++) {
          var y = py + p[1] - k * 2;
          elipse(ctx, px + p[0], y, 3, 1, K); ret(ctx, px + p[0] - 2, y, 5, 1, k === p[2] - 1 ? OURO : OURO2);
        }
        ret(ctx, px + p[0] - 1, py + p[1] - p[2] * 2 + 2, 1, 1, C.ouro3);
      });
    } });
  // ânfora de barro com desenho marajoara (linhas em degrau)
  I.objeto('museu-anfora', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = v(o, 'cor', BARRO);
      ret(ctx, cx - 3, py - 7, 7, 3, K); ret(ctx, cx - 2, py - 6, 5, 1, clarear(c, 0.3));
      ret(ctx, cx - 2, py - 4, 5, 3, K); ret(ctx, cx - 1, py - 4, 3, 3, c);
      elipse(ctx, cx, py + 5, 6, 8, K); elipse(ctx, cx, py + 5, 5, 7, c);
      ret(ctx, cx - 4, py - 1, 3, 1, clarear(c, 0.4));   // luz de cima
      // faixa marajoara: degraus claros
      for (var i = -4; i <= 4; i += 2) { ret(ctx, cx + i, py + 4 + (i % 4 === 0 ? 0 : 1), 2, 1, C.creme); }
      ret(ctx, cx - 4, py + 7, 9, 1, escurecer(c, 0.3));
      ret(ctx, cx - 3, py + 13, 7, 2, K);
    } });
  // pião de madeira com o barbante e um bilboquê (brinquedos de antigamente)
  I.objeto('museu-piao', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      // pião
      elipse(ctx, px + 5, py + 6, 4, 3, K); elipse(ctx, px + 5, py + 6, 3, 2, C.vermelho);
      ret(ctx, px + 3, py + 5, 5, 1, C.ouro); ret(ctx, px + 3, py + 4, 2, 1, clarear(C.vermelho, 0.5));
      ret(ctx, px + 4, py + 9, 3, 2, K); ret(ctx, px + 5, py + 11, 1, 2, K);
      ret(ctx, px + 5, py + 1, 1, 3, K);
      // barbante enrolado no chão
      ret(ctx, px + 1, py + 13, 5, 1, C.creme2);
      // bilboquê: copinho no cabo e a bolinha no cordão
      ret(ctx, px + 11, py + 2, 2, 12, K); ret(ctx, px + 11, py + 3, 1, 10, C.madeira);
      ret(ctx, px + 9, py - 1, 6, 4, K); ret(ctx, px + 10, py, 4, 2, C.madeiraClara);
      ret(ctx, px + 14, py + 3, 1, 5, '#b8aac8');
      circulo(ctx, px + 14, py + 10, 2, K); circulo(ctx, px + 14, py + 10, 1, C.azul);
    } });
  // mala de viagem antiga, de couro, com etiquetas
  I.objeto('museu-maleta', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 5, py - 5, 6, 3, K); ret(ctx, px + 6, py - 4, 4, 1, BARRO2);   // alça
      ret(ctx, px + 1, py - 2, 14, 16, K); ret(ctx, px + 2, py - 1, 12, 14, '#a8643a');
      ret(ctx, px + 2, py - 1, 12, 1, '#c98a5a');
      ret(ctx, px + 2, py + 5, 12, 1, BARRO2); ret(ctx, px + 4, py - 1, 1, 14, BARRO2); ret(ctx, px + 11, py - 1, 1, 14, BARRO2);
      ret(ctx, px + 6, py + 1, 4, 3, K); ret(ctx, px + 7, py + 2, 2, 1, C.creme);          // etiqueta
      ret(ctx, px + 6, py + 8, 3, 3, K); ret(ctx, px + 7, py + 9, 1, 1, C.azul2);          // selo de viagem
      ret(ctx, px + 7, py + 4, 2, 2, OURO);                                               // fecho
    } });
  // banco de museu, estofado de veludo vinho (w em tiles, padrão 2)
  I.objeto('museu-banco-veludo', { w: 2, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, c = v(o, 'cor', VINHO);
      ret(ctx, px + 1, py + 1, W - 2, 8, K); ret(ctx, px + 2, py + 2, W - 4, 6, c);
      ret(ctx, px + 2, py + 2, W - 4, 1, clarear(c, 0.4));
      for (var x = px + 6; x < px + W - 4; x += 6) ret(ctx, x, py + 5, 1, 1, OURO);   // botões do capitonê
      ret(ctx, px + 2, py + 9, W - 4, 2, K); ret(ctx, px + 3, py + 9, W - 6, 1, C.madeira);
      ret(ctx, px + 3, py + 11, 2, 4, K); ret(ctx, px + W - 5, py + 11, 2, 4, K);
      ret(ctx, px + 3, py + 11, 1, 3, OURO2); ret(ctx, px + W - 5, py + 11, 1, 3, OURO2);
    } });
  // tapete marajoara no chão (w×h em tiles; var.cor): faixa escura com degraus claros na borda e um losango
  // escuro com miolo claro em cada tile (desenho forte, legível de longe)
  I.objeto('museu-tapete-marajoara', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 1) * 16, H = (o.h || 1) * 16, c = v(o, 'cor', '#e8b27a'), e = escurecer(c, 0.55);
      ret(ctx, px + 1, py + 2, W - 2, H - 3, K); ret(ctx, px + 2, py + 3, W - 4, H - 5, e);
      ret(ctx, px + 4, py + 5, W - 8, H - 9, c);
      // degraus claros na faixa escura (em cima e embaixo)
      for (var x = px + 3; x < px + W - 3; x += 4) { ret(ctx, x, py + 3, 2, 1, C.creme); ret(ctx, x + 2, py + H - 3, 2, 1, C.creme); }
      for (var cx = px + 8; cx < px + W; cx += 16) for (var cy = py + 8; cy < py + H - 4; cy += 16) {
        for (var k = 0; k <= 3; k++) { ret(ctx, cx - k, cy - 3 + k, k * 2 + 1, 1, e); ret(ctx, cx - k, cy + 3 - k, k * 2 + 1, 1, e); }
        ret(ctx, cx - 1, cy, 3, 1, C.creme); ret(ctx, cx, cy - 1, 1, 3, C.creme);
      }
    } });
})();
