/* Fachada de 64 × 48: telhado violeta, friso de teclas e duas notas douradas. */
(function () {
  var R = window.Reino, D = R.Interiores.desenho, K = R.Desenho.K;
  var ret = D.ret, borda = D.contornoRet, S = R._predios['escola-musica'];
  function desenhar(ctx, x, y, w, h) {
    var cx = x + Math.floor(w / 2);
    borda(ctx, x + 3, y + 17, w - 6, h - 17, S.PAREDE);
    D.triangulo(ctx, x, y + 1, w, 21, K);
    D.triangulo(ctx, x + 3, y + 4, w - 6, 17, S.COR);
    ret(ctx, x + 2, y + 19, w - 4, 3, K);
    ret(ctx, x + 4, y + 20, w - 8, 1, S.COR2);
    // As sete teclas brancas do frontão e os grupos de duas e três pretas.
    borda(ctx, cx - 15, y + 9, 30, 10, K);
    for (var i = 0; i < 7; i++) ret(ctx, cx - 13 + i * 4, y + 10, 3, 7, '#fff8ed');
    [0, 1, 3, 4, 5].forEach(function (i) { ret(ctx, cx - 11 + i * 4, y + 10, 2, 4, K); });
    [x + 8, x + w - 17].forEach(function (px) {
      borda(ctx, px, y + 25, 9, 11, S.COR); ret(ctx, px + 2, y + 27, 5, 6, '#b9e6e0');
      ret(ctx, px + 4, y + 26, 1, 9, '#fff8ed'); ret(ctx, px + 1, y + 31, 7, 1, '#fff8ed');
      ret(ctx, px - 1, y + 36, 11, 2, S.COR2);
    });
    S.nota(ctx, x + 5, y + 5, S.COR2); S.nota(ctx, x + w - 13, y + 5, S.COR2);
    borda(ctx, cx - 6, y + h - 17, 12, 17, K);
    ret(ctx, cx - 5, y + h - 16, 10, 16, S.COR); ret(ctx, cx - 3, y + h - 14, 6, 6, '#d7c8f3');
    ret(ctx, cx + 2, y + h - 7, 2, 2, S.COR2);
    ret(ctx, x + 5, y + h - 4, 13, 3, '#78a77d'); ret(ctx, x + w - 18, y + h - 4, 13, 3, '#78a77d');
    ret(ctx, x + 8, y + h - 5, 2, 2, '#ee9cbf'); ret(ctx, x + w - 12, y + h - 5, 2, 2, S.COR2);
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS['escola-musica'] = desenhar;
})();
