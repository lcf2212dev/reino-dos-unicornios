/* Estúdio e laboratório: teclas, acústica e instrumentos em pixels inteiros. */
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
  I.objeto('escola-musica-acustica', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 2, y + 4, 28, 24, '#695477');
      for (var j = 0; j < 3; j++) for (var i = 0; i < 4; i++) {
        ret(ctx, x + 4 + i * 6, y + 6 + j * 7, 4, 5, '#987bad');
        ret(ctx, x + 4 + i * 6, y + 6 + j * 7, 4, 1, '#c9b3dc');
      }
    } });
  I.objeto('escola-musica-fones', { w: 1, h: 1, solido: true,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 1, y + 10, 14, 5, '#c49a68');
      ret(ctx, x + 4, y + 2, 8, 2, K); ret(ctx, x + 2, y + 4, 2, 6, K); ret(ctx, x + 12, y + 4, 2, 6, K);
      borda(ctx, x + 2, y + 7, 4, 5, S.COR); borda(ctx, x + 10, y + 7, 4, 5, S.COR);
      ret(ctx, x + 6, y + 14, 5, 1, K);
    } });
  I.objeto('escola-musica-banco-piano', { w: 2, h: 1, solido: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 4, y + 9, 3, 6, K); ret(ctx, x + 25, y + 9, 3, 6, K);
      borda(ctx, x + 2, y + 4, 28, 7, S.COR); ret(ctx, x + 4, y + 5, 24, 2, '#bda1df');
      ret(ctx, x + 10, y + 7, 2, 1, K); ret(ctx, x + 20, y + 7, 2, 1, K);
    } });
  I.objeto('escola-musica-discos', { w: 2, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 2, y + 1, 28, 30, '#b17d53');
      ret(ctx, x + 4, y + 3, 24, 11, '#674c67'); ret(ctx, x + 4, y + 17, 24, 11, '#674c67');
      for (var i = 0; i < 7; i++) {
        ret(ctx, x + 5 + i * 3, y + 4, 2, 9, ['#d9c8f1','#efb34f','#bce4da'][i % 3]);
        ret(ctx, x + 5 + i * 3, y + 18, 2, 9, ['#bce4da','#eea7a0','#d9c8f1'][i % 3]);
      }
    } });
  I.objeto('escola-musica-ondas', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 1, y + 3, 46, 25, '#4f877f'); ret(ctx, x + 3, y + 5, 42, 21, '#e9f8e9');
      ret(ctx, x + 5, y + 16, 38, 1, '#b0cec1');
      for (var i = 0; i < 18; i++) {
        var h = [2, 5, 8, 5, 2, 0][i % 6];
        ret(ctx, x + 5 + i * 2, y + 16 - h, 2, 1, '#4f877f');
        ret(ctx, x + 5 + i * 2, y + 17 + h, 2, 1, '#7957b5');
      }
    } });
  I.objeto('escola-musica-xilofone', { w: 3, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 7, y + 20, 3, 11, K); ret(ctx, x + 38, y + 20, 3, 11, K);
      borda(ctx, x + 2, y + 6, 44, 18, '#b17d53');
      var cores = ['#eea7a0', '#efb34f', '#d4dd83', '#88c3ad', '#8cbedc', '#a992d5', '#d79fca'];
      for (var i = 0; i < 7; i++) {
        borda(ctx, x + 4 + i * 6, y + 3 + Math.floor(i / 2), 5, 21 - i, cores[i]);
        ret(ctx, x + 6 + i * 6, y + 7 + Math.floor(i / 2), 1, 1, K);
      }
      ret(ctx, x + 17, y + 27, 14, 1, '#d6af71'); D.circulo(ctx, x + 31, y + 27, 2, '#7957b5');
    } });
  I.objeto('escola-musica-tamborins', { w: 2, h: 1, solido: true,
    desenhar: function (ctx, x, y) {
      for (var i = 0; i < 2; i++) {
        D.elipse(ctx, x + 8 + i * 16, y + 9, 7, 5, K); D.elipse(ctx, x + 8 + i * 16, y + 8, 6, 4, '#efb34f');
        D.elipse(ctx, x + 8 + i * 16, y + 7, 4, 2, '#fff8ee');
        ret(ctx, x + 3 + i * 16, y + 9, 2, 2, '#fff8ee'); ret(ctx, x + 11 + i * 16, y + 9, 2, 2, '#fff8ee');
      }
    } });

})();
