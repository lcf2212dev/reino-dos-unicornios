/* Casa das Palavras, 1º andar (portugues/lp-andar1.js): os objetos novos do Cantinho do Respiro (prefixo lp-). Cores
   suaves e nada que pisque: é o lugar de descansar entre as etapas. O pedestal da Galeria dos Tesouros mora em
   portugues/lp-tesouros.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K, misturar = R.Desenho.misturar;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  // pufe redondo e fofo (var.cor), com o botão no meio e a costura em volta
  I.objeto('lp-pufe', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#ff9ec8'), cx = px + 8;
      elipse(ctx, cx, py + 9, 7, 6, K);
      elipse(ctx, cx, py + 9, 6, 5, misturar(c, K, 0.18));
      elipse(ctx, cx, py + 7, 6, 4, c);
      elipse(ctx, cx - 2, py + 6, 2, 1, misturar(c, C.branco, 0.5));
      ret(ctx, cx - 5, py + 10, 11, 1, misturar(c, K, 0.3));
      ret(ctx, cx, py + 7, 1, 1, misturar(c, K, 0.45));
    } });

  // abajur de luz suave: pé de madeira, cúpula creme e um halo quentinho em volta (fixo, sem piscar)
  I.objeto('lp-abajur', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx, py - 4, 8, misturar('#fff2b0', C.branco, 0.3));
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 13, 7, 1, C.madeira2);
      ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, C.madeira);
      ret(ctx, cx - 5, py - 9, 11, 10, K);
      ret(ctx, cx - 4, py - 8, 9, 8, '#ffe8b8'); ret(ctx, cx - 4, py - 8, 9, 1, '#fff6dc'); ret(ctx, cx - 4, py - 1, 9, 1, '#f2c878');
      ret(ctx, cx - 3, py - 6, 1, 4, C.branco);
    } });

  // quadro do céu calmo na parede: lua, nuvens e estrelinhas, numa moldura de madeira clara (2×2)
  I.objeto('lp-nuvem', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 5, 28, 20, C.madeiraClara);
      ret(ctx, px + 3, py + 6, 26, 18, '#bfe0f4');
      ret(ctx, px + 3, py + 18, 26, 6, '#d6ecf8');
      circulo(ctx, px + 23, py + 11, 3, '#fff6c8'); circulo(ctx, px + 24, py + 10, 2, '#bfe0f4');   // a lua crescente
      [[px + 6, py + 15], [px + 14, py + 19], [px + 20, py + 17]].forEach(function (n) {
        elipse(ctx, n[0] + 3, n[1], 4, 2, C.branco); elipse(ctx, n[0] + 1, n[1] - 1, 2, 2, C.branco);
      });
      ret(ctx, px + 8, py + 9, 1, 1, C.branco); ret(ctx, px + 15, py + 8, 1, 1, C.branco); ret(ctx, px + 12, py + 12, 1, 1, '#fff6c8');
    } });
})();
