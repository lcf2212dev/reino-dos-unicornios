/* Ilustrações do capítulo 11 (grupo icones; Reino.registrarIlustracao, js/arte/ilustracoes.js): a abertura do
   capítulo (APR p. 30), a cena de teatro musical que as perguntas "O que você vê na imagem?" e "Sobre o que é essa
   apresentação?" pedem: um palco com arcos verdes, uma moça de vestido rosa dançando de mãos dadas com uma
   personagem de pele verde e chapéu de bruxa, e dançarinos de roupas coloridas. Redesenhada em pixel art. */
(function () {
  var K = '#3a2446';
  var PELE = '#ffd9b8', MORENA = '#c98a5b', VERDE = '#5cc06a';
  // rostinho 5×3 sobre a cabeça (olhos e sorriso)
  function rosto(D, ctx, cx, cy) {
    D.ret(ctx, cx - 2, cy, 1, 1, '#2a1838');
    D.ret(ctx, cx + 2, cy, 1, 1, '#2a1838');
    D.ret(ctx, cx - 1, cy + 2, 3, 1, '#e0607a');
  }
  function cabeca(D, ctx, cx, cy, pele) {
    D.circulo(ctx, cx, cy, 5, K);
    D.circulo(ctx, cx, cy, 4, pele);
  }
  // dançarina de vestido rodado (cx = meio; y = topo da cabeça)
  function dancarina(D, ctx, cx, y, pele, cabelo, vestido, brilho) {
    D.ret(ctx, cx - 4, y + 18, 2, 12, pele);
    D.ret(ctx, cx + 2, y + 18, 2, 12, pele);
    D.ret(ctx, cx - 5, y + 29, 3, 2, K);
    D.ret(ctx, cx + 2, y + 29, 3, 2, K);
    D.triangulo(ctx, cx - 9, y + 11, 18, 13, K);
    D.triangulo(ctx, cx - 8, y + 12, 16, 11, vestido);
    D.ret(ctx, cx - 3, y + 9, 6, 6, K);
    D.ret(ctx, cx - 2, y + 10, 4, 5, vestido);
    D.ret(ctx, cx - 7, y + 9, 4, 2, pele);
    D.ret(ctx, cx + 3, y + 7, 2, 4, pele);
    cabeca(D, ctx, cx, y + 4, pele);
    D.ret(ctx, cx - 4, y - 1, 9, 3, cabelo);
    D.ret(ctx, cx - 5, y + 1, 2, 7, cabelo);
    D.ret(ctx, cx + 4, y + 1, 2, 7, cabelo);
    rosto(D, ctx, cx, y + 4);
    [[-5, 17], [0, 15], [5, 18], [-2, 20], [3, 21]].forEach(function (p) { D.ret(ctx, cx + p[0], y + p[1], 1, 1, brilho); });
  }

  Reino.registrarIlustracao('lp-11-musical', { w: 128, h: 80, desenhar: function (ctx, D) {
    // fundo do palco e os arcos verdes
    D.ret(ctx, 0, 0, 128, 80, '#24162e');
    [[60, '#3fae6a'], [57, '#24162e'], [50, '#5cc06a'], [47, '#2c1c3a'], [40, '#3fae6a'], [37, '#2c1c3a'], [30, '#5cc06a'], [27, '#33224a']].forEach(function (a) {
      D.circulo(ctx, 64, 66, a[0], a[1]);
    });
    for (var x = 8; x < 128; x += 16) D.ret(ctx, x, 0, 1, 6, '#ffe8a0');
    // o chão do palco, com a luz no meio
    D.ret(ctx, 0, 62, 128, 18, '#5a3e52');
    D.ret(ctx, 0, 62, 128, 1, '#7a5a70');
    D.elipse(ctx, 64, 70, 40, 7, '#7e6078');
    D.elipse(ctx, 64, 70, 28, 5, '#9a7c92');

    // dançarinos dos lados
    dancarina(D, ctx, 12, 34, PELE, '#6b3a1e', '#ff9cc6', '#ffffff');
    dancarina(D, ctx, 104, 33, PELE, '#8a4a2a', '#b58cff', '#ffffff');
    dancarina(D, ctx, 119, 36, MORENA, '#2a1838', '#d8d0f0', '#ffd34d');
    // o rapaz de terno azul, de braços abertos
    D.ret(ctx, 26, 50, 3, 16, K); D.ret(ctx, 27, 50, 1, 15, '#2f4ea8');
    D.ret(ctx, 32, 50, 3, 16, K); D.ret(ctx, 33, 50, 1, 15, '#2f4ea8');
    D.ret(ctx, 25, 37, 11, 15, K);
    D.ret(ctx, 26, 38, 9, 13, '#3f6fd8');
    D.ret(ctx, 30, 38, 1, 8, '#ffffff');
    D.ret(ctx, 18, 36, 8, 2, '#3f6fd8'); D.ret(ctx, 16, 35, 3, 2, MORENA);
    D.ret(ctx, 35, 38, 6, 2, '#3f6fd8'); D.ret(ctx, 40, 37, 3, 2, MORENA);
    cabeca(D, ctx, 30, 32, MORENA);
    D.ret(ctx, 26, 27, 9, 3, '#2a1838');
    rosto(D, ctx, 30, 32);

    // a moça de vestido rosa armado (Glinda)
    D.ret(ctx, 49, 60, 2, 6, PELE); D.ret(ctx, 54, 60, 2, 6, PELE);
    D.ret(ctx, 48, 65, 3, 2, '#ff7eb6'); D.ret(ctx, 54, 65, 3, 2, '#ff7eb6');
    D.elipse(ctx, 52, 55, 12, 7, K);
    D.elipse(ctx, 52, 55, 11, 6, '#ff9cc6');
    D.ret(ctx, 41, 59, 23, 2, '#ffc6dd');
    [[44, 53], [50, 57], [57, 54], [47, 58], [60, 57]].forEach(function (p) { D.ret(ctx, p[0], p[1], 1, 1, '#ffffff'); });
    D.ret(ctx, 48, 40, 9, 10, K);
    D.ret(ctx, 49, 41, 7, 9, '#ff7eb6');
    D.ret(ctx, 42, 41, 7, 2, PELE);
    D.ret(ctx, 56, 44, 8, 2, PELE);
    cabeca(D, ctx, 52, 34, PELE);
    D.ret(ctx, 47, 28, 11, 3, '#ffe07a');
    D.ret(ctx, 46, 30, 3, 10, '#ffe07a');
    D.ret(ctx, 56, 30, 3, 10, '#ffe07a');
    D.ret(ctx, 49, 28, 1, 1, '#ff7eb6'); D.ret(ctx, 54, 28, 1, 1, '#ff7eb6'); D.ret(ctx, 52, 27, 1, 1, '#ffffff');
    rosto(D, ctx, 52, 34);

    // a personagem verde de chapéu de bruxa (Elphaba), de mãos dadas com a moça
    D.ret(ctx, 70, 60, 3, 6, K); D.ret(ctx, 76, 60, 3, 6, K);
    D.ret(ctx, 67, 50, 15, 12, K);
    D.ret(ctx, 68, 51, 13, 10, '#8a8aa0');
    D.ret(ctx, 68, 55, 13, 1, '#6e6e86');
    D.ret(ctx, 69, 40, 11, 11, K);
    D.ret(ctx, 70, 41, 9, 10, '#6e6e86');
    D.ret(ctx, 73, 41, 3, 7, '#ffffff');
    D.ret(ctx, 64, 44, 6, 2, VERDE);
    D.ret(ctx, 79, 42, 5, 2, VERDE);
    cabeca(D, ctx, 74, 34, VERDE);
    D.ret(ctx, 68, 31, 3, 10, '#2a1838');
    D.ret(ctx, 78, 31, 3, 10, '#2a1838');
    // o chapéu preto, com a borda clara para aparecer no fundo escuro
    D.ret(ctx, 65, 27, 19, 4, '#8a7aa8');
    D.triangulo(ctx, 68, 13, 12, 15, '#8a7aa8');
    D.ret(ctx, 66, 28, 17, 2, '#1a1020');
    D.triangulo(ctx, 69, 15, 10, 13, '#1a1020');
    D.ret(ctx, 70, 25, 8, 1, '#6b4a8e');
    rosto(D, ctx, 74, 34);

    // brilhos da luz do palco
    [[20, 12], [44, 8], [88, 10], [110, 16], [64, 6]].forEach(function (b) { D.brilho(ctx, b[0], b[1], '#fff3a0'); });
  } });
})();
