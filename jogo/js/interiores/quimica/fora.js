/* Laboratório de Química, parte 4: o prédio de fora, no mapa (Mapa.PREDIOS['quimica'], 80 × 80 px = o rect em tiles × 16).
   Esqueleto do `npm run novo`: uma casinha simples no tamanho certo; desenhe a de verdade aqui. */
(function () {
  var R = window.Reino;
  var D = R.Interiores.desenho, C = D.C;
  var ret = D.ret, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = R._predios['quimica'];

  function desenharFora(ctx, px, py, w, h) {
    var cx = px + Math.floor(w / 2);   // a porta fica no meio da última fileira
    var topo = Math.round(h * 0.4);
    // paredes
    contornoRet(ctx, px + 3, py + topo, w - 6, h - topo, S.PAREDE);
    // telhado
    triangulo(ctx, px, py + 2, w, topo, K);
    triangulo(ctx, px + 3, py + 5, w - 6, topo - 4, S.COR);
    ret(ctx, px + 1, py + topo - 1, w - 2, 3, K); ret(ctx, px + 2, py + topo, w - 4, 1, S.COR2);
    // janelinhas dos lados
    [px + 8, px + w - 16].forEach(function (x) { contornoRet(ctx, x, py + topo + 6, 8, 8, '#d9f3ff'); ret(ctx, x + 1, py + topo + 7, 2, 1, C.branco); });
    // porta
    ret(ctx, cx - 6, py + h - 16, 12, 16, K); ret(ctx, cx - 5, py + h - 15, 10, 15, S.COR2);
    ret(ctx, cx + 2, py + h - 8, 2, 2, C.ouro);
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS['quimica'] = desenharFora;
})();
