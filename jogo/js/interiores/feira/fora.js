/* Pavilhão da Feira: cúpula de vidro, arco-íris e vitrines de vida. */
(function () {
  var R = window.Reino, D = R.Interiores.desenho, S = R._predios.feira;
  var r = D.ret, c = D.circulo, e = D.elipse, b = D.contornoRet, K = '#3a2446';
  function desenhar(ctx, x, y, w, h) {
    var cx = x + Math.floor(w / 32) * 16 + 8, base = y + h;
    var arco = ['#ff668e', '#ffb84d', '#ffe36b', '#66cc8a', '#55badf', '#b58cff'];
    // Arco solar atrás da estufa: degraus opacos de pixel, sem interpolação.
    for (var j = 0; j < 22; j++) {
      var largura = Math.floor(Math.sqrt(1 - Math.pow((22 - j) / 23, 2)) * 44);
      r(ctx, cx - largura, y + j + 1, largura * 2 + 1, 1, K);
      if (largura > 1) r(ctx, cx - largura + 1, y + j + 1, largura * 2 - 1, 1, arco[Math.min(5, Math.floor(j / 3))]);
    }
    // Cúpula em três níveis, com nervuras em verde profundo e luz do céu.
    for (var a = 0; a < 25; a++) {
      var meio = 12 + Math.floor(Math.sqrt(a / 24) * 34);
      r(ctx, cx - meio, y + 10 + a, meio * 2, 1, K);
      r(ctx, cx - meio + 2, y + 10 + a, meio * 2 - 4, 1, a < 12 ? '#d9fff4' : '#a6e6d9');
    }
    r(ctx, cx - 1, y + 11, 2, 25, '#398b62');
    for (var n = 0; n < 19; n++) {
      var dx = 10 + Math.floor(n * 0.65);
      r(ctx, cx - dx, y + 17 + n, 2, 1, '#398b62'); r(ctx, cx + dx, y + 17 + n, 2, 1, '#398b62');
    }
    r(ctx, cx - 37, y + 26, 74, 2, '#398b62'); r(ctx, cx - 12, y + 15, 5, 2, '#ffffff');
    // Végétation que se vê através do vidro.
    S.planta(ctx, cx - 29, y + 34, '#ff668e'); S.planta(ctx, cx + 30, y + 34, '#ffb84d');
    b(ctx, x + 6, y + 35, w - 12, h - 35, '#fff4d6');
    r(ctx, x + 8, y + 37, w - 16, 4, '#66cc8a'); r(ctx, x + 8, base - 7, w - 16, 6, '#e8b27a');
    r(ctx, x + 8, base - 8, w - 16, 1, '#b48465');
    // Cornija e bandeirolas festivas.
    b(ctx, x + 3, y + 33, w - 6, 5, '#398b62'); r(ctx, x + 4, y + 34, w - 8, 1, '#a4e78a');
    S.bandeiras(ctx, x + 10, y + 40, w - 20);
    // Vitrines de aquário e jardim: a fachada já anuncia os experimentos.
    b(ctx, x + 12, y + 49, 23, 19, '#b48465'); b(ctx, x + 14, y + 51, 19, 15, '#79d5e4');
    S.peixe(ctx, x + 25, y + 59); r(ctx, x + 16, y + 52, 1, 6, '#ffffff'); r(ctx, x + 15, y + 64, 17, 1, '#f4cf9a');
    b(ctx, x + w - 35, y + 49, 23, 19, '#b48465'); b(ctx, x + w - 33, y + 51, 19, 15, '#dcf8df');
    S.planta(ctx, x + w - 23, y + 65, '#ff668e');
    // Porta exatamente no tile de entrada; arco e maçaneta legíveis.
    b(ctx, cx - 10, base - 29, 20, 26, '#ffd34d'); b(ctx, cx - 7, base - 26, 14, 23, '#7c5cff');
    r(ctx, cx - 5, base - 25, 10, 2, '#b58cff'); r(ctx, cx - 5, base - 22, 1, 16, '#b58cff');
    r(ctx, cx + 3, base - 13, 2, 2, '#ffe36b'); b(ctx, cx - 13, base - 3, 26, 3, '#e6dccb');
    // Medalhão da feira, flor em estrela, floreiras e abelhinha visitante.
    c(ctx, cx, y + 43, 6, K); c(ctx, cx, y + 43, 5, '#ffe36b'); S.flor(ctx, cx, y + 43, '#ff668e');
    [x + 13, x + w - 16].forEach(function (fx, i) {
      S.planta(ctx, fx, base - 5, i ? '#55badf' : '#b58cff'); b(ctx, fx - 5, base - 6, 11, 6, '#e07a4a'); r(ctx, fx - 4, base - 5, 9, 1, '#ffc18c');
    });
    S.abelha(ctx, x + w - 9, y + 23);
    e(ctx, x + 7, base - 1, 4, 1, '#398b62'); e(ctx, x + w - 7, base - 1, 4, 1, '#398b62');
  }
  if (window.Mapa && window.Mapa.PREDIOS) window.Mapa.PREDIOS.feira = desenhar;
})();
