/* Escola de Música no parque: fachada de 80 × 80 pixels, dentro do rect 5 × 5.
   Alas de ensaio, torre com vitral, marquise de piano e jardim. Porta central na última fileira. */
(function () {
  var R = window.Reino, D = R.Interiores.desenho, K = R.Desenho.K;
  var ret = D.ret, borda = D.contornoRet;
  var CREME = '#fff2dc', LUZ = '#fff9ec', SOMBRA = '#dcbda9';
  var ROXO = '#7957b5', TELHA = '#a583d3', ESCURO = '#59417f', OURO = '#efb34f';

  function nota(ctx, x, y, cor) {
    ret(ctx, x, y + 6, 4, 3, cor); ret(ctx, x + 3, y, 2, 8, cor);
    ret(ctx, x + 5, y + 1, 3, 2, cor);
  }
  function telhado(ctx, x, y, w, h) {
    D.triangulo(ctx, x, y, w, h, K);
    D.triangulo(ctx, x + 3, y + 2, w - 6, h - 3, ROXO);
    for (var linha = 5; linha < h - 2; linha += 4) {
      var inicio = Math.ceil(w / 2 - (w / 2 - 3) * (linha - 1) / (h - 3)) + 2;
      ret(ctx, x + inicio, y + linha, w - inicio * 2, 1, TELHA);
      for (var coluna = inicio + 3; coluna < w - inicio - 1; coluna += 7) {
        ret(ctx, x + coluna, y + linha + 1, 1, 2, ESCURO);
      }
    }
    ret(ctx, x, y + h - 1, w, 3, K); ret(ctx, x + 1, y + h, w - 2, 1, OURO);
  }
  function janela(ctx, x, y) {
    borda(ctx, x, y, 13, 19, SOMBRA);
    ret(ctx, x + 2, y + 2, 9, 14, '#5c8f9e');
    ret(ctx, x + 3, y + 3, 3, 5, '#b9ece5'); ret(ctx, x + 7, y + 3, 3, 5, '#d6ccf7');
    ret(ctx, x + 3, y + 9, 3, 6, '#86c6ca'); ret(ctx, x + 7, y + 9, 3, 6, '#b4a6da');
    ret(ctx, x + 6, y + 2, 1, 14, LUZ); ret(ctx, x + 2, y + 8, 9, 1, LUZ);
    ret(ctx, x + 3, y + 3, 1, 3, LUZ); ret(ctx, x + 8, y + 10, 1, 2, LUZ);
    ret(ctx, x - 1, y + 17, 15, 2, K); ret(ctx, x, y + 17, 13, 1, OURO);
    // Jardineira de flores sob o peitoril.
    ret(ctx, x + 1, y + 20, 11, 3, '#ac6d61'); ret(ctx, x + 2, y + 20, 9, 1, '#de9b79');
    [2, 5, 8].forEach(function (dx, i) {
      ret(ctx, x + dx, y + 18, 3, 2, '#629a71');
      ret(ctx, x + dx + 1, y + 17, 2, 2, i === 1 ? '#efb34f' : '#eda1c6');
    });
  }
  function jardim(ctx, x, y, espelho) {
    borda(ctx, x, y + 9, 23, 6, '#c99e7c'); ret(ctx, x + 1, y + 10, 21, 2, '#efd5aa');
    ret(ctx, x + 2, y + 4, 19, 5, '#487e62'); ret(ctx, x + 4, y + 2, 15, 6, '#6aab78');
    ret(ctx, x + 6, y + 1, 11, 3, '#91c482');
    [3, 9, 16].forEach(function (dx, i) {
      ret(ctx, x + dx, y + 5, 3, 3, i === 1 ? '#f4bf61' : '#f1aecf');
      ret(ctx, x + dx + 1, y + 6, 1, 1, LUZ);
    });
    // Pequenas hastes em forma de notas emergem dos arbustos.
    nota(ctx, x + (espelho ? 12 : 4), y - 3, OURO);
  }
  function desenhar(ctx, px, py, w, h) {
    // O sprite ocupa os 80 pixels contratados, alinhado ao centro e ao chão do prédio.
    var x = px + Math.floor((w - 80) / 2), y = py + h - 80;
    // Fundação e duas alas, com pilastras e fiadas de pedra.
    borda(ctx, x + 5, y + 30, 70, 44, CREME);
    ret(ctx, x + 7, y + 33, 66, 2, '#e5cfbb');
    ret(ctx, x + 6, y + 68, 68, 5, SOMBRA);
    for (var b = 8; b < 73; b += 8) ret(ctx, x + b, y + 69, 1, 3, '#b99589');
    [7, 23, 54, 70].forEach(function (dx) {
      ret(ctx, x + dx, y + 35, 3, 31, SOMBRA); ret(ctx, x + dx, y + 35, 1, 31, LUZ);
      ret(ctx, x + dx - 1, y + 35, 5, 2, OURO);
      ret(ctx, x + dx - 1, y + 64, 5, 3, '#caa590');
    });
    telhado(ctx, x + 2, y + 15, 32, 20); telhado(ctx, x + 46, y + 15, 32, 20);
    janela(ctx, x + 11, y + 40); janela(ctx, x + 56, y + 40);
    // Torre central à frente das duas alas: vitral redondo, cornija e emblema musical.
    borda(ctx, x + 27, y + 17, 26, 54, '#f5dfc3');
    ret(ctx, x + 29, y + 20, 2, 43, LUZ); ret(ctx, x + 50, y + 20, 2, 43, SOMBRA);
    telhado(ctx, x + 22, y + 2, 36, 20);
    ret(ctx, x + 39, y, 2, 4, OURO); ret(ctx, x + 37, y + 1, 6, 1, OURO);
    D.circulo(ctx, x + 40, y + 32, 9, K); D.circulo(ctx, x + 40, y + 32, 8, OURO);
    D.circulo(ctx, x + 40, y + 32, 6, '#abdcd7');
    ret(ctx, x + 35, y + 32, 11, 1, '#fff6dc'); ret(ctx, x + 40, y + 27, 1, 11, '#fff6dc');
    nota(ctx, x + 36, y + 27, ROXO);
    ret(ctx, x + 29, y + 44, 22, 2, OURO); ret(ctx, x + 31, y + 46, 18, 1, SOMBRA);
    // Faixa de teclas: sete brancas, grupos de duas e três pretas.
    borda(ctx, x + 24, y + 49, 32, 11, K);
    ret(ctx, x + 26, y + 48, 28, 2, ROXO);
    for (var i = 0; i < 7; i++) ret(ctx, x + 26 + i * 4, y + 51, 3, 7, LUZ);
    [0, 1, 3, 4, 5].forEach(function (i) { ret(ctx, x + 28 + i * 4, y + 51, 2, 4, K); });
    ret(ctx, x + 25, y + 60, 30, 2, '#b89390');
    // Lanternas e porta dupla: passagem livre no tile central (15,37).
    [24, 54].forEach(function (dx) {
      ret(ctx, x + dx, y + 62, 2, 3, K); borda(ctx, x + dx - 1, y + 64, 4, 6, OURO);
      ret(ctx, x + dx, y + 65, 1, 3, '#fff4b5');
    });
    borda(ctx, x + 32, y + 61, 16, 15, ESCURO);
    ret(ctx, x + 34, y + 63, 5, 10, ROXO); ret(ctx, x + 41, y + 63, 5, 10, ROXO);
    ret(ctx, x + 35, y + 63, 3, 4, '#c6dbe9'); ret(ctx, x + 42, y + 63, 3, 4, '#c6dbe9');
    ret(ctx, x + 37, y + 70, 1, 2, OURO); ret(ctx, x + 42, y + 70, 1, 2, OURO);
    ret(ctx, x + 30, y + 75, 20, 2, K); ret(ctx, x + 31, y + 75, 18, 1, '#ebd5b6');
    ret(ctx, x + 28, y + 77, 24, 3, '#c6ad9a'); ret(ctx, x + 29, y + 77, 22, 1, '#fff2dc');
    jardim(ctx, x + 3, y + 63, false); jardim(ctx, x + 54, y + 63, true);
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS['escola-musica'] = desenhar;
})();
