/* Torre dos Números: o desenho de fora, no mapa (Mapa.PREDIOS.numeros). A matéria (sala, lugar) fica em
   conteudo/materias/matematica/matematica.js; por dentro vale o interior padrão (interiores/padrao.js). */
(function () {
  var K = '#3a2446';
  function r(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  // algarismo 3×5 em pixels (o "1 2 3" e o "×" da fachada)
  var DIG = {
    '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['##.', '..#', '.#.', '#..', '###'],
    '3': ['##.', '..#', '.#.', '..#', '##.'], 'x': ['...', '#.#', '.#.', '#.#', '...'],
  };
  function digito(ctx, x, y, d, c) {
    DIG[d].forEach(function (l, j) { for (var i = 0; i < 3; i++) if (l[i] === '#') r(ctx, x + i, y + j, 1, 1, c); });
  }
  // torre de tijolos azuis com telhado pontudo, relógio digital no alto e blocos coloridos de contar na base;
  // a porta fica no meio da última fileira do rect (4×5 tiles)
  function desenharFora(ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || '#eaf4ff', telhado = cores.telhado || '#3f7fe0', det = cores.detalhe || '#ffc93c';
    var cx = px + w / 2;
    // corpo da torre
    r(ctx, px + 8, py + 26, w - 16, h - 28, K);
    r(ctx, px + 9, py + 27, w - 18, h - 30, parede);
    for (var j = py + 31; j < py + h - 4; j += 5) {
      for (var i = px + 10 + ((j / 5) % 2 ? 0 : 3); i < px + w - 12; i += 7) r(ctx, i, j, 5, 1, '#c9dcf5');
    }
    // telhado pontudo com a bandeirinha
    for (var t = 0; t < 22; t++) {
      var meia = Math.round(t * 1.15) + 2;
      r(ctx, cx - meia - 1, py + 5 + t, meia * 2 + 2, 1, K);
      if (t > 0) r(ctx, cx - meia, py + 5 + t, meia * 2, 1, t % 4 === 0 ? '#2a5bb0' : telhado);
    }
    r(ctx, px + 4, py + 26, w - 8, 3, K); r(ctx, px + 5, py + 27, w - 10, 1, '#2a5bb0');
    r(ctx, cx, py - 2, 1, 8, K);
    r(ctx, cx + 1, py - 2, 6, 4, K); r(ctx, cx + 1, py - 1, 5, 2, det);
    // relógio digital no alto (12:00)
    r(ctx, cx - 13, py + 32, 26, 11, K); r(ctx, cx - 12, py + 33, 24, 9, '#1d2533');
    digito(ctx, cx - 10, py + 35, '1', '#7dff9a'); digito(ctx, cx - 6, py + 35, '2', '#7dff9a');
    r(ctx, cx - 1, py + 36, 1, 1, '#7dff9a'); r(ctx, cx - 1, py + 38, 1, 1, '#7dff9a');
    r(ctx, cx + 2, py + 35, 3, 5, '#7dff9a'); r(ctx, cx + 3, py + 36, 1, 3, '#1d2533');
    r(ctx, cx + 6, py + 35, 3, 5, '#7dff9a'); r(ctx, cx + 7, py + 36, 1, 3, '#1d2533');
    // placa "1 × 2" em amarelo
    r(ctx, cx - 11, py + 47, 22, 9, K); r(ctx, cx - 10, py + 48, 20, 7, det);
    digito(ctx, cx - 8, py + 49, '1', K); digito(ctx, cx - 2, py + 49, 'x', '#e0433f'); digito(ctx, cx + 4, py + 49, '2', K);
    // porta em arco
    r(ctx, cx - 6, py + h - 17, 12, 17, K); r(ctx, cx - 5, py + h - 16, 10, 16, '#8a5cff');
    r(ctx, cx - 4, py + h - 18, 8, 1, K); r(ctx, cx - 1, py + h - 16, 1, 16, '#6b3fd6'); r(ctx, cx + 2, py + h - 9, 1, 2, det);
    // blocos de contar dos dois lados da porta
    [['#e0433f', 11, 6], ['#3fbf7f', 11, 12], ['#ffc93c', 17, 6], ['#2f6fd6', w - 23, 6], ['#ff8ac4', w - 17, 6], ['#3fbf7f', w - 17, 12]]
      .forEach(function (b) { r(ctx, px + b[1], py + h - b[2] - 6, 6, 6, K); r(ctx, px + b[1] + 1, py + h - b[2] - 5, 4, 4, b[0]); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.numeros = desenharFora;
})();
