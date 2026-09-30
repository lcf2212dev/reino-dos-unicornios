/* Fachadas do mapa, parte 2 de 2 (veio de mundo/predios.js): escola, relógio (Inglês, com a bandeirinha e o "HI!") e a torre padrão
   das matérias sem desenho próprio. Registra em Mapa.PREDIOS; enfeites de Mapa.fachada. */
(function () {
  var Mapa = window.Mapa, F = Mapa.fachada, D = window.Reino.Desenho;
  var C = D.C, K = D.K, ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer, misturar = D.misturar;

  function letra(ctx, linhas, x, y, cor) {
    linhas.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (l[i] === '#') ret(ctx, x + i, y + j, 1, 1, cor); });
  }

  // letras de 5 px de altura para as placas (M, W e N mais largas, para ler bem)
  var LETRAS = {
    I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
    O: ['.#.', '#.#', '#.#', '#.#', '.#.'], S: ['.##', '#..', '.#.', '..#', '##.'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#']
  };
  // uma palavra centrada em cx (1 px entre as letras)
  function palavra(ctx, txt, cx, y, cor) {
    var formas = txt.split('').map(function (c) { return LETRAS[c]; });
    var largura = formas.reduce(function (t, f) { return t + f[0].length + 1; }, -1);
    var x = Math.round(cx - largura / 2);
    formas.forEach(function (f) { letra(ctx, f, x, y, cor); x += f[0].length + 1; });
  }

  Mapa.PREDIOS.escola = function (ctx, px, py, w, h) {
    var parede = '#fff1e8', parede2 = '#f6dccb', telhado = '#ff7a8a', telhado2 = '#e0506a';
    var cx = px + w / 2;
    // telhado principal de telhas
    triangulo(ctx, px, py + 16, w, 26, K);
    triangulo(ctx, px + 3, py + 19, w - 6, 22, telhado);
    F.telhas(ctx, px + 3, py + 19, w - 6, 22, telhado, 4);
    // beiral
    ret(ctx, px + 2, py + 40, w - 4, 4, K);
    ret(ctx, px + 3, py + 41, w - 6, 2, telhado2);
    // paredes com as tábuas deitadas e o rodapé de tijolinho
    contornoRet(ctx, px + 6, py + 43, w - 12, h - 49, parede);
    for (var j = py + 49; j < py + h - 7; j += 6) { ret(ctx, px + 7, j, w - 14, 1, parede2); ret(ctx, px + 7, j + 1, w - 14, 1, '#fffaf5'); }
    F.tijolos(ctx, px + 7, py + h - 10, w - 14, 3, '#f0a0a8', 3);
    ret(ctx, px + w - 13, py + 44, 6, h - 51, 'rgba(224,80,106,0.08)');
    // bandeirinhas
    var bandeiras = ['#ffd34d', '#6fdc8c', '#5fb4ff', '#a66bff', '#ff9d2e'];
    ret(ctx, px + 8, py + 44, w - 16, 1, '#c9a27a');
    for (var b = 0, bx = px + 9; bx < px + w - 12; bx += 7, b++) {
      var cb = bandeiras[b % bandeiras.length];
      ret(ctx, bx, py + 45, 5, 1, cb); ret(ctx, bx + 1, py + 46, 3, 1, cb); ret(ctx, bx + 2, py + 47, 1, 1, cb);
      ret(ctx, bx, py + 45, 1, 1, clarear(cb, 0.5));
    }
    // janelas com venezianas e floreira
    F.janela(ctx, px + 13, py + 50, 12, 11, { venezianas: '#5fb4ff', floreira: '#ff7eb6' });
    F.janela(ctx, px + w - 25, py + 50, 12, 11, { venezianas: '#5fb4ff', floreira: '#ffe066' });
    // degrau e porta
    F.degrau(ctx, cx, py + h - 7, 28, 7);
    F.porta(ctx, cx - 7, py + h - 29, 14, 22, '#7c5cff');
    // arbustos nos cantos
    F.vaso(ctx, px + 5, py + h, '#ff7eb6');
    F.vaso(ctx, px + w - 6, py + h, '#ffe066');
    // lousa com o nome da escola (JIM WILSON) no telhado, em duas linhas, com a moldura de madeira
    ret(ctx, cx - 16, py + 27, 32, 17, K);
    ret(ctx, cx - 15, py + 28, 30, 15, C.madeira);
    ret(ctx, cx - 14, py + 29, 28, 13, '#4f9a5a');
    ret(ctx, cx - 14, py + 29, 28, 1, '#8fd08f');
    palavra(ctx, 'JIM', cx, py + 30, '#ffffff');
    palavra(ctx, 'WILSON', cx, py + 36, '#ffffff');
    // torre do sino, de tijolinho, com o sino dourado
    contornoRet(ctx, cx - 8, py + 9, 16, 19, '#fff8ee');
    F.tijolos(ctx, cx - 7, py + 10, 14, 17, '#fff0e0', 3);
    ret(ctx, cx - 5, py + 13, 10, 11, K);
    ret(ctx, cx - 4, py + 12, 8, 1, K);
    ret(ctx, cx - 4, py + 13, 8, 10, '#6a4a88');
    ret(ctx, cx - 4, py + 13, 8, 2, '#8a6aa8');
    ret(ctx, cx - 2, py + 14, 4, 1, '#ffd34d');
    ret(ctx, cx - 3, py + 15, 6, 4, '#ffd34d');
    ret(ctx, cx - 4, py + 19, 8, 2, '#ffd34d');
    ret(ctx, cx - 2, py + 15, 1, 3, '#fff3a0');
    ret(ctx, cx + 2, py + 16, 1, 3, '#d9a93a');
    ret(ctx, cx - 1, py + 21, 2, 1, '#d9a93a');
    ret(ctx, cx - 6, py + 24, 12, 2, K); ret(ctx, cx - 5, py + 24, 10, 1, '#fff8ee');
    triangulo(ctx, cx - 12, py, 24, 11, K);
    triangulo(ctx, cx - 10, py + 2, 20, 8, telhado);
    F.telhas(ctx, cx - 10, py + 2, 20, 8, telhado, 3);
    ret(ctx, cx - 12, py + 9, 24, 2, K); ret(ctx, cx - 11, py + 9, 22, 1, telhado2);
    F.bandeira(ctx, cx, py - 6, 7, '#ffd34d');
  };

  Mapa.PREDIOS.relogio = function (ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || '#eef3ff', telhado = cores.telhado || '#4a6cd4', det = cores.detalhe || '#ffcf3d';
    var pedra = misturar(parede, '#d8c8a8', 0.35);
    var cx = px + w / 2;
    // corpo da torre de pedra, com a luz na esquerda e a sombra na direita
    contornoRet(ctx, cx - 17, py + 36, 34, h - 36, pedra);
    F.pedras(ctx, cx - 16, py + 37, 32, h - 38, pedra);
    ret(ctx, cx + 10, py + 37, 6, h - 38, 'rgba(58,36,70,0.10)');
    ret(ctx, cx - 16, py + 37, 1, h - 38, clarear(pedra, 0.5));
    // janelinhas de arco dos lados
    [cx - 14, cx + 7].forEach(function (jx) { F.janela(ctx, jx, py + 42, 7, 11, { arco: true, cruz: false }); });
    // caixa do relógio com a sacada
    contornoRet(ctx, cx - 20, py + 14, 40, 24, parede);
    ret(ctx, cx - 19, py + 15, 38, 2, clarear(det, 0.3));
    ret(ctx, cx - 19, py + 35, 38, 2, det);
    ret(ctx, cx - 22, py + 36, 44, 3, K); ret(ctx, cx - 21, py + 37, 42, 1, escurecer(det, 0.2));
    for (var s = cx - 20; s < cx + 20; s += 4) ret(ctx, s, py + 39, 2, 2, escurecer(pedra, 0.2));
    [cx - 19, cx + 17].forEach(function (lx) { ret(ctx, lx, py + 18, 2, 16, escurecer(parede, 0.1)); });
    // mostrador com o aro dourado e os 12 risquinhos
    circulo(ctx, cx, py + 26, 11, K);
    circulo(ctx, cx, py + 26, 10, det);
    circulo(ctx, cx, py + 26, 9, escurecer(det, 0.2));
    circulo(ctx, cx, py + 26, 8, '#ffffff');
    for (var hr = 0; hr < 12; hr++) {
      var ang = hr * Math.PI / 6, mx = Math.round(Math.sin(ang) * 7), my = Math.round(-Math.cos(ang) * 7);
      if (hr % 3 === 0) ret(ctx, cx + mx - 1, py + 26 + my - 1, 2, 2, telhado);
      else ret(ctx, cx + mx, py + 26 + my, 1, 1, '#8a8aa8');
    }
    ret(ctx, cx - 1, py + 20, 2, 7, K);          // ponteiro grande
    ret(ctx, cx - 1, py + 25, 6, 2, K);          // ponteiro pequeno
    ret(ctx, cx - 1, py + 25, 2, 2, '#ff5c8a');
    ret(ctx, cx - 6, py + 20, 2, 1, 'rgba(160,190,255,0.6)');
    // telhadinho pontudo de telhas
    ret(ctx, cx - 18, py + 12, 36, 3, K);
    triangulo(ctx, cx - 16, py - 4, 32, 17, K);
    triangulo(ctx, cx - 13, py - 1, 26, 13, telhado);
    F.telhas(ctx, cx - 13, py - 1, 26, 13, telhado, 3);
    ret(ctx, cx - 17, py + 13, 34, 1, escurecer(telhado, 0.2));
    // mastro com a bandeirinha do Reino Unido (a torre de Inglês, D2A-13)
    ret(ctx, cx - 1, py - 12, 2, 9, K); ret(ctx, cx - 1, py - 12, 1, 1, det);
    D.matriz(ctx, cx + 1, py - 12, ['kkkkkkkkkkk', 'kwbbwrwbbwk', 'kbwbwrwbwbk', 'krrrrrrrrrk', 'kbwbwrwbwbk', 'kwbbwrwbbwk',
      'kkkkkkkkkkk'], { k: K, w: '#ffffff', b: '#2a4fb0', r: '#e0433f' });
    // plaquinha "HI!" entre as janelinhas, em cima da porta
    contornoRet(ctx, cx - 6, py + 42, 13, 10, '#ffffff');
    ret(ctx, cx - 5, py + 43, 11, 1, '#2a4fb0'); ret(ctx, cx - 5, py + 50, 11, 1, '#2a4fb0');
    letra(ctx, ['#.#', '#.#', '###', '#.#', '#.#'], cx - 4, py + 45, '#e0433f');
    letra(ctx, ['###', '.#.', '.#.', '.#.', '###'], cx, py + 45, '#e0433f');
    letra(ctx, ['#', '#', '#', '.', '#'], cx + 4, py + 45, '#e0433f');
    // porta, degrau e vasos
    F.entrada(ctx, cx, py + h, '#7c5cff', det);
    F.vaso(ctx, cx - 23, py + h, '#ff7eb6');
    F.vaso(ctx, cx + 23, py + h, '#ffffff');
    // brilhinhos
    [[6, 20], [74, 30]].forEach(function (b) { F.brilho(ctx, px + b[0], py + b[1], '#ffffff'); });
  };
  // o ponteiro dos segundos do relógio dá a volta (um pontinho vermelho)
  Mapa.PREDIOS_ANIM.relogio = function (ctx, px, py, w, h, t) {
    var ang = ((t / 1000) % 60) * Math.PI / 30, cx = px + w / 2;
    ret(ctx, cx + Math.round(Math.sin(ang) * 5), py + 26 + Math.round(-Math.cos(ang) * 5), 1, 1, '#ff5c8a');
  };

  // torre padrão: serve para qualquer matéria sem desenho próprio (usa as cores dela e cabe em qualquer w×h)
  Mapa.PREDIOS.torre = function (ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || '#fff6e4', telhado = cores.telhado || '#f0a04a', det = cores.detalhe || '#ff8a3d';
    var cx = px + w / 2, x0 = px + 12, larg = w - 24;
    contornoRet(ctx, x0, py + 22, larg, h - 22, parede);
    F.pedras(ctx, x0 + 1, py + 23, larg - 2, h - 24, parede);
    ret(ctx, x0 + larg - 7, py + 23, 6, h - 24, 'rgba(58,36,70,0.08)');
    // telhado de telhas com o beiral e a bandeira na cor da matéria
    triangulo(ctx, px + 6, py + 1, w - 12, 23, K);
    triangulo(ctx, px + 9, py + 4, w - 18, 19, telhado);
    F.telhas(ctx, px + 9, py + 4, w - 18, 19, telhado, 4);
    ret(ctx, px + 7, py + 21, w - 14, 3, K); ret(ctx, px + 8, py + 22, w - 16, 1, escurecer(telhado, 0.22));
    F.bandeira(ctx, cx, py - 8, 10, det);
    // janela redonda no alto e as janelinhas de arco dos lados
    circulo(ctx, cx, py + 32, 5, K); circulo(ctx, cx, py + 32, 4, det); circulo(ctx, cx, py + 32, 3, K);
    circulo(ctx, cx, py + 32, 2, '#bfe9ff'); ret(ctx, cx - 1, py + 31, 1, 1, '#ffffff');
    if (larg >= 48) {
      // larga (5 tiles ou mais): janelas de arco com floreira dos dois lados da porta
      [x0 + 5, x0 + larg - 13].forEach(function (jx) { F.janela(ctx, jx, py + 40, 8, 12, { arco: true, cruz: false, floreira: det }); });
    } else {
      // estreita (4 tiles): seteiras dos lados e, se for alta, uma janela de arco entre a redonda e a porta
      [x0 + 4, x0 + larg - 7].forEach(function (sx) { ret(ctx, sx, py + 29, 3, 10, K); ret(ctx, sx + 1, py + 30, 1, 8, '#bfe9ff'); ret(ctx, sx + 1, py + 30, 1, 2, '#ffffff'); });
      if (h >= 80) F.janela(ctx, cx - 4, py + 40, 8, 10, { arco: true, cruz: false, floreira: det });
    }
    // porta, degrau e vasinhos
    F.entrada(ctx, cx, py + h, '#7c5cff', null, { largDegrau: 20 });
    F.vaso(ctx, x0 - 5, py + h, det);
    F.vaso(ctx, x0 + larg + 4, py + h, '#ffffff');
  };
})();
