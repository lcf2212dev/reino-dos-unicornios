/* Feira, arte 1/2. Reino._predios.feira guarda exclusivamente os helpers de desenho
   dos objetos e da fachada: flor, planta, abelha, peixe, formiga, bandeiras e vitrine. */
(function () {
  var R = window.Reino, I = R.Interiores, D = I.desenho;
  var r = D.ret, c = D.circulo, e = D.elipse, b = D.contornoRet, K = '#3a2446';
  var S = (R._predios = R._predios || {}).feira = {};
  var cores = ['#ff668e', '#ffb84d', '#ffe36b', '#66cc8a', '#55badf', '#b58cff'];
  function flor(ctx, x, y, cor) {
    c(ctx, x - 2, y, 2, K); c(ctx, x + 2, y, 2, K);
    c(ctx, x, y - 2, 2, K); c(ctx, x, y + 2, 2, K);
    c(ctx, x - 2, y, 1, cor); c(ctx, x + 2, y, 1, cor);
    c(ctx, x, y - 2, 1, cor); c(ctx, x, y + 2, 1, cor); c(ctx, x, y, 1, '#ffe36b');
  }
  function planta(ctx, x, y, cor) {
    r(ctx, x, y - 10, 2, 11, K); r(ctx, x, y - 9, 1, 10, '#398b62');
    e(ctx, x - 3, y - 5, 3, 2, K); e(ctx, x - 3, y - 6, 2, 1, '#84d984');
    e(ctx, x + 4, y - 8, 3, 2, K); e(ctx, x + 4, y - 9, 2, 1, '#a4e78a');
    if (cor) flor(ctx, x, y - 12, cor);
  }
  function abelha(ctx, x, y) {
    e(ctx, x - 2, y - 3, 2, 2, K); e(ctx, x + 2, y - 3, 2, 2, K);
    r(ctx, x - 3, y - 4, 2, 2, '#d9f3ff'); r(ctx, x + 1, y - 4, 2, 2, '#fff8ee');
    e(ctx, x, y, 5, 3, K); e(ctx, x, y, 4, 2, '#ffd34d');
    r(ctx, x - 2, y - 2, 1, 5, K); r(ctx, x + 1, y - 2, 1, 5, K);
    r(ctx, x + 3, y - 1, 1, 1, K); r(ctx, x + 4, y + 1, 1, 1, '#ff8a3d');
  }
  function peixe(ctx, x, y, cor) {
    r(ctx, x - 7, y - 3, 2, 7, K); r(ctx, x - 5, y - 2, 2, 5, K);
    e(ctx, x, y, 5, 3, K); e(ctx, x, y, 4, 2, cor || '#ff9d43');
    r(ctx, x - 6, y - 1, 2, 3, cor || '#ff9d43');
    r(ctx, x, y - 2, 1, 5, '#fff1b4'); r(ctx, x + 2, y - 1, 1, 1, K);
  }
  function formiga(ctx, x, y) {
    for (var i = 0; i < 3; i++) { c(ctx, x + i * 3, y, 1, K); r(ctx, x + i * 3, y + 2, 1, 1, K); }
    r(ctx, x + 5, y - 3, 1, 2, K); r(ctx, x + 7, y - 3, 1, 2, K);
  }
  function bandeiras(ctx, x, y, largura) {
    r(ctx, x, y, largura, 1, K);
    for (var i = 0; i < Math.floor(largura / 7); i++) {
      for (var j = 0; j < 6; j++) r(ctx, x + i * 7 + Math.floor(j / 2), y + 1 + j, 6 - Math.floor(j / 2) * 2, 1, j === 5 ? K : cores[i % 6]);
    }
  }
  function vitrine(ctx, x, y, cor) {
    b(ctx, x + 2, y + 2, 44, 27, '#b48465');
    b(ctx, x + 3, y + 3, 42, 22, cor || '#d9f3ff');
    r(ctx, x + 4, y + 4, 40, 1, '#ffffff');
    r(ctx, x + 4, y + 25, 40, 3, '#e8b27a');
    r(ctx, x + 6, y + 29, 4, 3, K); r(ctx, x + 38, y + 29, 4, 3, K);
  }
  I.objeto('feira-portal', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y, o) {
    var cor = o && o.var && o.var.cor || '#7c5cff';
    b(ctx, x + 4, y + 4, 40, 26, cor); b(ctx, x + 9, y + 10, 30, 20, '#fff4d6');
    r(ctx, x + 6, y + 6, 36, 2, '#d4c0ff'); r(ctx, x + 7, y + 12, 1, 16, '#b58cff');
    bandeiras(ctx, x + 10, y + 11, 28);
    c(ctx, x + 24, y + 24, 5, K); c(ctx, x + 24, y + 24, 4, '#ffe36b');
    r(ctx, x + 23, y + 21, 2, 6, '#b66b39'); r(ctx, x + 21, y + 23, 6, 2, '#b66b39');
    flor(ctx, x + 5, y + 5, '#ff668e'); flor(ctx, x + 42, y + 5, '#55badf');
    b(ctx, x + 1, y + 29, 46, 3, '#ffd34d');
  } });
  I.objeto('feira-painel', { w: 2, h: 2, parede: true, solido: false, desenhar: function (ctx, x, y, o) {
    var cor = o && o.var && o.var.cor || '#55badf';
    b(ctx, x + 1, y + 2, 30, 28, cor); b(ctx, x + 3, y + 4, 26, 24, '#fff8ee');
    r(ctx, x + 5, y + 6, 22, 3, cor); planta(ctx, x + 11, y + 26, '#ff668e');
    for (var j = 0; j < 4; j++) r(ctx, x + 20, y + 12 + j * 4, 6 - j % 2, 1, '#ab8caf');
    r(ctx, x + 2, y + 3, 1, 1, '#fff3a0'); r(ctx, x + 29, y + 28, 1, 1, '#fff3a0');
  } });
  I.objeto('feira-bandeirolas', { w: 3, h: 1, parede: true, solido: false, desenhar: function (ctx, x, y) {
    bandeiras(ctx, x + 2, y + 4, 44); r(ctx, x + 2, y + 2, 1, 4, '#b48465'); r(ctx, x + 45, y + 2, 1, 4, '#b48465');
  } });
  I.objeto('feira-bancada', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    b(ctx, x + 2, y + 17, 44, 6, '#e8b27a'); r(ctx, x + 3, y + 18, 42, 1, '#ffe5b4');
    b(ctx, x + 4, y + 23, 5, 9, '#b48465'); b(ctx, x + 39, y + 23, 5, 9, '#b48465');
    b(ctx, x + 10, y + 24, 28, 6, '#a87058'); r(ctx, x + 12, y + 25, 24, 1, '#efb682');
    b(ctx, x + 7, y + 8, 8, 9, '#83dacd'); r(ctx, x + 9, y + 3, 4, 6, K); r(ctx, x + 10, y + 4, 2, 6, '#d9fff4');
    r(ctx, x + 9, y + 12, 4, 3, '#3eaea3'); r(ctx, x + 9, y + 9, 1, 2, '#ffffff');
    b(ctx, x + 20, y + 12, 13, 5, '#fff8ee'); r(ctx, x + 26, y + 13, 1, 3, '#b58cff');
    b(ctx, x + 35, y + 10, 7, 7, '#e07a4a'); planta(ctx, x + 38, y + 11);
  } });
  I.objeto('feira-passaporte', { w: 2, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    b(ctx, x + 4, y + 23, 24, 8, '#b48465'); b(ctx, x + 1, y + 19, 30, 5, '#e8b27a');
    b(ctx, x + 4, y + 3, 24, 16, '#7c5cff'); b(ctx, x + 6, y + 5, 9, 12, '#fff8ee'); b(ctx, x + 15, y + 5, 11, 12, '#fff8ee');
    for (var i = 0; i < 5; i++) c(ctx, x + 9 + i % 3 * 6, y + 9 + Math.floor(i / 3) * 5, 1, cores[i]);
    r(ctx, x + 23, y + 13, 2, 9, '#ff668e'); r(ctx, x + 8, y + 26, 16, 2, '#ffd34d');
  } });
  I.objeto('feira-lupa', { w: 2, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    b(ctx, x + 2, y + 26, 28, 5, '#b58cff'); b(ctx, x + 7, y + 22, 17, 5, '#fff8ee');
    planta(ctx, x + 12, y + 25); r(ctx, x + 21, y + 15, 4, 11, K); r(ctx, x + 22, y + 16, 2, 9, '#ffb84d');
    c(ctx, x + 15, y + 10, 9, K); c(ctx, x + 15, y + 10, 7, '#55badf'); c(ctx, x + 15, y + 10, 5, '#d9fff4');
    e(ctx, x + 15, y + 11, 3, 2, '#398b62'); r(ctx, x + 13, y + 11, 5, 1, '#a4e78a'); r(ctx, x + 11, y + 6, 2, 2, '#ffffff');
  } });
  I.objeto('feira-pegadas', { w: 1, h: 1, plano: true, semSombra: true, solido: false, desenhar: function (ctx, x, y) {
    [[5, 10], [11, 5]].forEach(function (p) {
      e(ctx, x + p[0], y + p[1], 2, 2, '#997bb7');
      r(ctx, x + p[0] - 3, y + p[1] - 3, 2, 2, '#997bb7'); r(ctx, x + p[0], y + p[1] - 4, 2, 2, '#997bb7');
    });
  } });
  I.objeto('feira-flor', { w: 1, h: 1, plano: true, semSombra: true, solido: false, desenhar: function (ctx, x, y, o) {
    r(ctx, x + 8, y + 7, 1, 6, '#398b62'); r(ctx, x + 9, y + 10, 3, 2, '#66cc8a'); flor(ctx, x + 7, y + 6, o && o.var && o.var.cor || '#ff668e');
  } });
  S.flor = flor; S.planta = planta; S.abelha = abelha; S.peixe = peixe;
  S.formiga = formiga; S.bandeiras = bandeiras; S.vitrine = vitrine;
})();
