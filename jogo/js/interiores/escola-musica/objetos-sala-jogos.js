/* O pequeno palco e três estações musicais têm silhuetas próprias. */
(function () {
  var R = window.Reino, I = R.Interiores, D = I.desenho, S = R._predios['escola-musica'];
  var ret = D.ret, borda = D.contornoRet, K = R.Desenho.K;
  I.objeto('escola-musica-palco', { w: 5, h: 3, solido: false, semSombra: true,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 1, y + 1, 78, 45, '#d6a779');
      for (var i = 0; i < 7; i++) ret(ctx, x + 3, y + 4 + i * 6, 74, 1, '#b78865');
      ret(ctx, x + 3, y + 41, 74, 4, '#94715f');
      ret(ctx, x + 25, y + 44, 30, 3, '#efb34f');
      ret(ctx, x + 4, y + 40, 4, 2, '#fff2b9'); ret(ctx, x + 72, y + 40, 4, 2, '#fff2b9');
    } });
  I.objeto('escola-musica-cortina-palco', { w: 5, h: 2, parede: true, solido: false,
    desenhar: function (ctx, x, y) {
      ret(ctx, x, y + 2, 80, 3, K); ret(ctx, x + 1, y + 3, 78, 2, S.COR2);
      for (var i = 0; i < 5; i++) {
        ret(ctx, x + i * 16 + 2, y + 5, 12, 7, '#a15380');
        ret(ctx, x + i * 16 + 4, y + 5, 3, 8, '#dc91b0');
      }
      for (var j = 0; j < 2; j++) {
        var dx = j ? 67 : 2;
        borda(ctx, x + dx, y + 5, 11, 26, '#a15380');
        ret(ctx, x + dx + 3, y + 6, 2, 23, '#dc91b0');
        ret(ctx, x + dx, y + 22, 11, 3, S.COR2);
      }
    } });
  I.objeto('escola-musica-bateria', { w: 3, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 5, y + 9, 2, 21, K); ret(ctx, x + 41, y + 8, 2, 22, K);
      ret(ctx, x + 2, y + 29, 8, 2, K); ret(ctx, x + 38, y + 29, 8, 2, K);
      D.elipse(ctx, x + 6, y + 8, 6, 2, K); D.elipse(ctx, x + 6, y + 7, 5, 1, S.COR2);
      D.elipse(ctx, x + 42, y + 6, 6, 2, K); D.elipse(ctx, x + 42, y + 5, 5, 1, S.COR2);
      borda(ctx, x + 10, y + 6, 11, 11, '#a15380'); borda(ctx, x + 27, y + 6, 11, 11, '#a15380');
      ret(ctx, x + 12, y + 7, 7, 2, '#fff2dc'); ret(ctx, x + 29, y + 7, 7, 2, '#fff2dc');
      D.circulo(ctx, x + 24, y + 21, 10, K); D.circulo(ctx, x + 24, y + 21, 8, '#fff2dc');
      D.circulo(ctx, x + 24, y + 21, 6, '#dbc8df'); S.nota(ctx, x + 21, y + 16, S.COR);
    } });
  I.objeto('escola-musica-microfone', { w: 1, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      ret(ctx, x + 7, y + 6, 2, 24, K); ret(ctx, x + 3, y + 29, 10, 2, K);
      borda(ctx, x + 4, y + 1, 8, 9, '#a5b6c3'); ret(ctx, x + 5, y + 3, 6, 1, '#fff8ee');
      ret(ctx, x + 6, y + 6, 4, 1, K); ret(ctx, x + 10, y + 11, 2, 14, '#7957b5');
    } });
  I.objeto('escola-musica-caixa-som', { w: 1, h: 2, solido: 'base', alto: true,
    desenhar: function (ctx, x, y) {
      borda(ctx, x + 1, y + 2, 14, 28, '#65576d');
      D.circulo(ctx, x + 8, y + 9, 4, K); D.circulo(ctx, x + 8, y + 9, 2, '#a393ae');
      D.circulo(ctx, x + 8, y + 21, 5, K); D.circulo(ctx, x + 8, y + 21, 3, '#a393ae');
      ret(ctx, x + 3, y + 28, 2, 1, '#bce4da');
    } });
  function estacao(tipo, cor, desenho) {
    I.objeto('escola-musica-' + tipo, { w: 2, h: 2, solido: 'base', alto: true,
      desenhar: function (ctx, x, y) {
        borda(ctx, x + 3, y + 1, 26, 29, cor);
        ret(ctx, x + 5, y + 3, 22, 16, '#fff8ee'); desenho(ctx, x + 5, y + 4);
        ret(ctx, x + 4, y + 21, 24, 2, K);
        for (var i = 0; i < 4; i++) ret(ctx, x + 6 + i * 5, y + 24, 3, 3, ['#d9c8f1','#efb34f','#bce4da','#eea7a0'][i]);
        ret(ctx, x + 5, y + 30, 3, 2, K); ret(ctx, x + 24, y + 30, 3, 2, K);
      } });
  }
  estacao('eco', '#a992d5', function (ctx, x, y) {
    S.nota(ctx, x + 2, y + 2, S.COR); S.nota(ctx, x + 12, y + 2, '#b597cd');
  });
  estacao('ritmo', '#dca05d', function (ctx, x, y) {
    for (var i = 0; i < 4; i++) {
      borda(ctx, x + 1 + i * 5, y + 3, 4, 9, i % 2 ? '#efb34f' : '#bce4da');
      ret(ctx, x + 2 + i * 5, y + 5, 2, i % 2 ? 4 : 2, K);
    }
  });
  estacao('ouvido', '#70a99a', function (ctx, x, y) {
    ret(ctx, x + 4, y + 2, 14, 2, K); ret(ctx, x + 2, y + 4, 2, 7, K); ret(ctx, x + 18, y + 4, 2, 7, K);
    borda(ctx, x + 2, y + 8, 5, 6, '#7957b5'); borda(ctx, x + 15, y + 8, 5, 6, '#7957b5');
  });
})();
