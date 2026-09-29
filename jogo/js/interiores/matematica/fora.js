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
    var F = window.Mapa.fachada, D = window.Reino.Desenho;
    // corpo da torre de tijolinhos azuis, com a luz na esquerda e a sombra na direita
    r(ctx, px + 8, py + 26, w - 16, h - 26, K);
    F.tijolos(ctx, px + 9, py + 27, w - 18, h - 28, parede, 5);
    r(ctx, px + 9, py + 27, 1, h - 28, '#ffffff');
    r(ctx, px + w - 15, py + 27, 6, h - 28, 'rgba(47,111,214,0.10)');
    // telhado pontudo com a bandeirinha
    for (var t = 0; t < 22; t++) {
      var meia = Math.round(t * 1.15) + 2;
      r(ctx, cx - meia - 1, py + 5 + t, meia * 2 + 2, 1, K);
      if (t > 0) r(ctx, cx - meia, py + 5 + t, meia * 2, 1, t % 4 === 0 ? '#2a5bb0' : telhado);
    }
    F.telhas(ctx, cx - 25, py + 5, 50, 22, telhado, 4);
    r(ctx, px + 4, py + 26, w - 8, 3, K); r(ctx, px + 5, py + 27, w - 10, 1, '#2a5bb0');
    // janelinha redonda no telhado com o "+"
    D.circulo(ctx, cx, py + 19, 4, K); D.circulo(ctx, cx, py + 19, 3, det); D.circulo(ctx, cx, py + 19, 2, '#eaf4ff');
    r(ctx, cx - 1, py + 19, 3, 1, '#e0433f'); r(ctx, cx, py + 18, 1, 3, '#e0433f');
    r(ctx, cx, py - 2, 1, 8, K);
    r(ctx, cx + 1, py - 2, 6, 4, K); r(ctx, cx + 1, py - 1, 5, 2, det);
    // relógio digital no alto (12:00)
    r(ctx, cx - 14, py + 31, 28, 13, K); r(ctx, cx - 13, py + 32, 26, 11, det);
    r(ctx, cx - 13, py + 32, 26, 1, '#fff3a0');
    r(ctx, cx - 12, py + 33, 24, 9, K); r(ctx, cx - 11, py + 34, 22, 7, '#1d2533');
    digito(ctx, cx - 10, py + 35, '1', '#7dff9a'); digito(ctx, cx - 6, py + 35, '2', '#7dff9a');
    r(ctx, cx - 1, py + 36, 1, 1, '#7dff9a'); r(ctx, cx - 1, py + 38, 1, 1, '#7dff9a');
    r(ctx, cx + 2, py + 35, 3, 5, '#7dff9a'); r(ctx, cx + 3, py + 36, 1, 3, '#1d2533');
    r(ctx, cx + 6, py + 35, 3, 5, '#7dff9a'); r(ctx, cx + 7, py + 36, 1, 3, '#1d2533');
    // placa "1 × 2" em amarelo
    // (1 px acima do arco da porta, que agora tem 22 px)
    r(ctx, cx - 11, py + 46, 22, 9, K); r(ctx, cx - 10, py + 47, 20, 7, det);
    r(ctx, cx - 10, py + 47, 20, 1, '#fff3a0'); r(ctx, cx - 7, py + 44, 1, 2, K); r(ctx, cx + 6, py + 44, 1, 2, K);
    digito(ctx, cx - 8, py + 48, '1', K); digito(ctx, cx - 2, py + 48, 'x', '#e0433f'); digito(ctx, cx + 4, py + 48, '2', K);
    // porta em arco com o degrau, no meio do tile da porta (x + floor(w/2), onde chegam o portão e o caminho)
    var cp = px + Math.floor(w / 32) * 16 + 8;
    F.porta(ctx, cp - 6, py + h - 24, 12, 21, '#8a5cff', det);
    F.degrau(ctx, cp, py + h - 3, 18, 3);
    // blocos de contar dos dois lados da porta (à direita, empilhados entre a porta e a quina)
    [['#e0433f', 11, 6], ['#3fbf7f', 11, 12], ['#ffc93c', 17, 6], ['#2f6fd6', w - 15, 6], ['#ff8ac4', w - 15, 12]]
      .forEach(function (b) {
        r(ctx, px + b[1], py + h - b[2] - 6, 6, 6, K); r(ctx, px + b[1] + 1, py + h - b[2] - 5, 4, 4, b[0]);
        r(ctx, px + b[1] + 1, py + h - b[2] - 5, 4, 1, D.clarear(b[0], 0.4)); r(ctx, px + b[1] + 2, py + h - b[2] - 3, 2, 1, D.escurecer(b[0], 0.25));
      });
    // régua pendurada do lado esquerdo e o esquadro do lado direito, na parede
    r(ctx, px + 12, py + 31, 4, 25, K); r(ctx, px + 13, py + 32, 2, 23, '#ffd34d');
    for (var rg = py + 34; rg < py + 56; rg += 3) r(ctx, px + 13, rg, 1, 1, K);
    D.matriz(ctx, px + w - 19, py + 47, ['k.......', 'kk......', 'kgk.....', 'kgek....', 'kg.gk...', 'kg..gk..', 'kggggggk', 'kkkkkkkk'], { k: K, g: '#3fbf7f', e: '#eaf4ff' });
    F.tufos(ctx, [px + 6, px + w - 9], py + h);
  }
  // os dois-pontos do relógio digital piscam (camada animada do mapa)
  function animarFora(ctx, px, py, w, h, t) {
    if (Math.floor(t / 500) % 2) return;
    r(ctx, (px + w / 2) - 1, py + 36, 1, 1, '#1d2533'); r(ctx, (px + w / 2) - 1, py + 38, 1, 1, '#1d2533');
  }
  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS.numeros = desenharFora;
    if (Mapa.PREDIOS_ANIM) Mapa.PREDIOS_ANIM.numeros = animarFora;
  }
})();
