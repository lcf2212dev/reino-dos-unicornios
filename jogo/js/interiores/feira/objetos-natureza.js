/* Feira, arte 2/2: instalações vivas. Helpers privados criados em objetos.js. */
(function () {
  var R = window.Reino, I = R.Interiores, D = I.desenho, S = R._predios.feira;
  var r = D.ret, c = D.circulo, e = D.elipse, b = D.contornoRet, K = '#3a2446';
  I.objeto('feira-estufa', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    b(ctx, x + 3, y + 10, 42, 21, '#398b62');
    for (var j = 0; j < 10; j++) { var m = 8 + Math.floor(j * 1.5); r(ctx, x + 24 - m, y + j, m * 2, 1, K); r(ctx, x + 25 - m, y + j, m * 2 - 2, 1, '#bbefe1'); }
    r(ctx, x + 5, y + 11, 38, 16, '#dcf8df');
    S.planta(ctx, x + 13, y + 26, '#ff668e'); S.planta(ctx, x + 33, y + 26, '#ffb84d');
    b(ctx, x + 9, y + 25, 9, 5, '#e07a4a'); b(ctx, x + 29, y + 25, 9, 5, '#e07a4a');
    r(ctx, x + 23, y + 2, 2, 27, '#398b62'); r(ctx, x + 4, y + 10, 40, 2, '#398b62');
    r(ctx, x + 7, y + 13, 1, 7, '#ffffff'); r(ctx, x + 40, y + 13, 1, 5, '#ffffff');
    r(ctx, x + 4, y + 29, 40, 1, '#a4e78a');
  } });
  I.objeto('feira-formigueiro', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    S.vitrine(ctx, x, y, '#f4cf9a'); r(ctx, x + 4, y + 6, 40, 3, '#84d984');
    r(ctx, x + 7, y + 13, 32, 3, '#ad7559'); r(ctx, x + 15, y + 8, 3, 14, '#ad7559'); r(ctx, x + 31, y + 14, 3, 8, '#ad7559');
    e(ctx, x + 14, y + 20, 7, 3, '#ad7559'); e(ctx, x + 34, y + 20, 7, 3, '#ad7559');
    r(ctx, x + 9, y + 19, 2, 2, '#fff8ee'); r(ctx, x + 13, y + 20, 2, 2, '#fff8ee');
    S.formiga(ctx, x + 23, y + 12); S.formiga(ctx, x + 29, y + 20);
    r(ctx, x + 8, y + 5, 1, 3, '#398b62'); r(ctx, x + 37, y + 4, 1, 4, '#398b62');
  } });
  I.objeto('feira-terrario', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    S.vitrine(ctx, x, y, '#e0f4cf'); r(ctx, x + 4, y + 21, 40, 3, '#937452');
    S.planta(ctx, x + 13, y + 21); e(ctx, x + 33, y + 21, 7, 2, '#a4e78a');
    // Caracol: concha espiral, corpo, tentáculos e dois olhos.
    r(ctx, x + 24, y + 20, 16, 2, K); c(ctx, x + 30, y + 17, 5, K); c(ctx, x + 30, y + 17, 4, '#ffb84d');
    c(ctx, x + 30, y + 17, 2, '#b95a36'); r(ctx, x + 30, y + 16, 2, 2, '#ffe36b');
    r(ctx, x + 36, y + 16, 1, 4, K); r(ctx, x + 39, y + 16, 1, 4, K); r(ctx, x + 34, y + 20, 6, 1, '#b6d24e');
    r(ctx, x + 6, y + 5, 1, 8, '#ffffff');
  } });
  I.objeto('feira-colmeia', { w: 2, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    b(ctx, x + 2, y + 28, 28, 4, '#a0745a'); r(ctx, x + 5, y + 24, 3, 4, K); r(ctx, x + 24, y + 24, 3, 4, K);
    e(ctx, x + 15, y + 17, 12, 10, K); e(ctx, x + 15, y + 17, 11, 9, '#ffb84d');
    for (var j = 0; j < 4; j++) { var w = 16 + (j < 2 ? j * 3 : (3 - j) * 3); r(ctx, x + 15 - Math.floor(w / 2), y + 10 + j * 4, w, 1, '#b97834'); }
    e(ctx, x + 16, y + 21, 3, 4, K); r(ctx, x + 8, y + 13, 2, 1, '#fff3a0');
    S.abelha(ctx, x + 23, y + 6); S.flor(ctx, x + 6, y + 26, '#ff668e');
  } });
  I.objeto('feira-jardineira', { w: 2, h: 1, solido: 'base', desenhar: function (ctx, x, y) {
    [7, 16, 25].forEach(function (dx, i) { r(ctx, x + dx, y + 5, 1, 7, '#398b62'); S.flor(ctx, x + dx, y + 4, ['#ff668e', '#55badf', '#b58cff'][i]); });
    b(ctx, x + 2, y + 11, 28, 5, '#e07a4a'); r(ctx, x + 3, y + 12, 26, 1, '#ffc18c');
    r(ctx, x + 9, y + 13, 1, 2, '#b95a36'); r(ctx, x + 21, y + 13, 1, 2, '#b95a36');
  } });
  I.objeto('feira-aquario', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    S.vitrine(ctx, x, y, '#79d5e4'); r(ctx, x + 4, y + 5, 40, 2, '#d9fff4'); r(ctx, x + 4, y + 22, 40, 2, '#f4cf9a');
    S.peixe(ctx, x + 22, y + 13, '#ff9d43');
    [9, 35, 39].forEach(function (dx, i) { r(ctx, x + dx, y + 13 - i * 2, 2, 10 + i * 2, '#398b62'); r(ctx, x + dx - 2, y + 17 - i * 2, 2, 3, '#84d984'); });
    c(ctx, x + 29, y + 8, 1, '#eaffff'); c(ctx, x + 31, y + 5, 1, '#eaffff');
    r(ctx, x + 6, y + 8, 1, 9, '#eaffff');
  } });
  I.objeto('feira-deserto', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    S.vitrine(ctx, x, y, '#ffe8af'); c(ctx, x + 36, y + 9, 4, '#ffb84d');
    r(ctx, x + 4, y + 20, 40, 4, '#e9bd79'); r(ctx, x + 28, y + 18, 16, 3, '#f4cf9a');
    b(ctx, x + 13, y + 7, 5, 15, '#398b62'); r(ctx, x + 14, y + 9, 1, 11, '#84d984');
    b(ctx, x + 8, y + 11, 4, 7, '#398b62'); r(ctx, x + 11, y + 16, 3, 2, K);
    b(ctx, x + 19, y + 9, 4, 6, '#398b62'); r(ctx, x + 17, y + 14, 5, 2, K);
    // Lagartinho entre duas pedrinhas.
    r(ctx, x + 29, y + 20, 9, 2, '#b97834'); r(ctx, x + 27, y + 21, 3, 1, '#b97834'); r(ctx, x + 36, y + 19, 1, 1, K);
    r(ctx, x + 31, y + 22, 1, 1, K); r(ctx, x + 35, y + 22, 1, 1, K);
  } });
  I.objeto('feira-polar', { w: 3, h: 2, solido: 'base', desenhar: function (ctx, x, y) {
    S.vitrine(ctx, x, y, '#b8e9f5'); r(ctx, x + 4, y + 19, 40, 5, '#55badf');
    r(ctx, x + 5, y + 18, 17, 3, '#ffffff'); r(ctx, x + 27, y + 21, 15, 2, '#ffffff');
    r(ctx, x + 7, y + 16, 12, 2, '#ffffff');
    e(ctx, x + 14, y + 14, 5, 7, K); e(ctx, x + 14, y + 16, 3, 4, '#ffffff');
    r(ctx, x + 11, y + 11, 1, 1, '#ffffff'); r(ctx, x + 16, y + 11, 1, 1, '#ffffff'); r(ctx, x + 13, y + 13, 3, 2, '#ffb84d');
    r(ctx, x + 10, y + 20, 3, 1, '#ffb84d'); r(ctx, x + 15, y + 20, 3, 1, '#ffb84d');
    // Foca deitada na segunda placa de gelo.
    e(ctx, x + 33, y + 18, 6, 3, K); e(ctx, x + 33, y + 18, 5, 2, '#c8dae5');
    r(ctx, x + 36, y + 17, 1, 1, K); r(ctx, x + 38, y + 19, 2, 1, K);
  } });
})();
