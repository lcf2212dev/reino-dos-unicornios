/* Escola de Música: instrumentos e materiais desenhados em pixels inteiros. */
(function () {
  var R = window.Reino, I = R.Interiores, D = I.desenho;
  var ret = D.ret, borda = D.contornoRet, K = R.Desenho.K;
  var S = (R._predios = R._predios || {})['escola-musica'] = {};
  S.COR = '#7957b5'; S.COR2 = '#efb34f'; S.PAREDE = '#fff2dc';

  function nota(ctx, x, y, cor) {
    ret(ctx, x, y + 6, 4, 3, cor); ret(ctx, x + 3, y, 2, 8, cor);
    ret(ctx, x + 5, y + 1, 3, 2, cor);
  }
  S.nota = nota;
  function pauta(ctx, x, y, largura, cor) {
    for (var i = 0; i < 5; i++) ret(ctx, x, y + i * 3, largura, 1, cor);
  }
  I.objeto('escola-musica-teclado', { w: 3, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 8, y + 14, 3, 16, K); ret(ctx, x + 37, y + 14, 3, 16, K);
      borda(ctx, x + 1, y + 2, 46, 17, '#4d4166');
      ret(ctx, x + 3, y + 4, 42, 3, S.COR); ret(ctx, x + 20, y + 4, 8, 2, '#b5f0db');
      for (var i = 0; i < 14; i++) {
        ret(ctx, x + 3 + i * 3, y + 8, 2, 9, '#fff8ed');
        if ([2, 6].indexOf(i % 7) < 0 && i < 13) ret(ctx, x + 5 + i * 3, y + 8, 2, 5, K);
      }
      ret(ctx, x + 9, y + 29, 30, 2, '#756581');
    } });
  I.objeto('escola-musica-pauta', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 1, y + 5, 46, 22, S.COR2);
      ret(ctx, x + 3, y + 7, 42, 18, '#fff9ec'); pauta(ctx, x + 5, y + 10, 38, '#bfadbd');
      nota(ctx, x + 10, y + 8, S.COR); nota(ctx, x + 22, y + 5, K); nota(ctx, x + 34, y + 8, S.COR);
    } });
  I.objeto('escola-musica-metronomo', { w: 1, h: 1, solido: true,
    desenhar: function (ctx, x, y) {
      D.triangulo(ctx, x + 3, y + 1, 10, 13, K);
      D.triangulo(ctx, x + 5, y + 3, 6, 10, '#d99d61');
      ret(ctx, x + 7, y + 4, 2, 8, '#fff2dc'); ret(ctx, x + 6, y + 7, 4, 2, S.COR);
      ret(ctx, x + 3, y + 13, 10, 2, K);
    } });
  I.objeto('escola-musica-estante-partitura', { w: 1, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 7, y + 15, 2, 14, K); ret(ctx, x + 3, y + 29, 10, 2, K);
      borda(ctx, x + 1, y + 2, 14, 17, '#c49a68'); ret(ctx, x + 3, y + 4, 10, 12, '#fff8ee');
      pauta(ctx, x + 4, y + 6, 8, '#bda7bb'); ret(ctx, x + 7, y + 9, 2, 2, K);
    } });
  I.objeto('escola-musica-aulas', { w: 2, h: 1, solido: true, alto: true, topo: 5,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 4, y + 8, 3, 7, K); ret(ctx, x + 25, y + 8, 3, 7, K);
      borda(ctx, x + 1, y - 5, 30, 16, S.COR); ret(ctx, x + 3, y - 3, 26, 11, '#fff9ec');
      nota(ctx, x + 5, y - 2, S.COR); ret(ctx, x + 17, y, 9, 1, '#967782');
      ret(ctx, x + 17, y + 3, 7, 1, '#967782'); ret(ctx, x + 17, y + 6, 9, 1, '#967782');
    } });
  I.objeto('escola-musica-tapete', { w: 3, h: 2, solido: false, semSombra: true,
    desenhar: function (ctx, x, y, o) {
      var cor = o.var && o.var.cor || '#d9c8f1';
      borda(ctx, x + 1, y + 2, 46, 27, S.COR); ret(ctx, x + 3, y + 4, 42, 23, cor);
      nota(ctx, x + 9, y + 11, S.COR); nota(ctx, x + 29, y + 8, S.COR);
      for (var i = 4; i < 45; i += 4) { ret(ctx, x + i, y, 1, 2, S.COR2); ret(ctx, x + i, y + 29, 1, 2, S.COR2); }
    } });
})();
