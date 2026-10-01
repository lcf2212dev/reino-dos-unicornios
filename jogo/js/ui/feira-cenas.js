/* Dioramas da feira: canvas fornecido pela UI, 160×96, sem animação nem estado.
   Cada missão tem uma transformação visível; os ids seguem o contrato tema-01..05. */
(function () {
  var R = window.Reino, D = R.Interiores.desenho;
  var r = D.ret, c = D.circulo, e = D.elipse, b = D.contornoRet, K = '#3a2446';
  var verde = '#398b62', folha = '#84d984', ouro = '#ffe36b', branco = '#fff8ee';
  function linha(ctx, x, y, dx, dy, cor) {
    var passos = Math.max(Math.abs(dx), Math.abs(dy));
    if (!passos) { r(ctx, x, y, 1, 1, cor); return; }
    for (var i = 0; i <= passos; i++) r(ctx, Math.round(x + dx * i / passos), Math.round(y + dy * i / passos), 1, 1, cor);
  }
  function flor(ctx, x, y, cor) {
    [[-4, 0], [4, 0], [0, -4], [0, 4]].forEach(function (p) { c(ctx, x + p[0], y + p[1], 3, K); c(ctx, x + p[0], y + p[1], 2, cor); });
    c(ctx, x, y, 3, K); c(ctx, x, y, 2, ouro);
  }
  function planta(ctx, x, y, altura, cor) {
    r(ctx, x, y - altura, 3, altura, K); r(ctx, x + 1, y - altura, 1, altura, verde);
    e(ctx, x - 5, y - altura + 9, 6, 3, K); e(ctx, x - 5, y - altura + 8, 5, 2, folha);
    e(ctx, x + 7, y - altura + 4, 6, 3, K); e(ctx, x + 7, y - altura + 3, 5, 2, folha);
    if (cor) flor(ctx, x + 1, y - altura, cor);
  }
  function nuvem(ctx, x, y) { r(ctx, x, y, 25, 5, '#ffffff'); r(ctx, x + 5, y - 4, 13, 9, '#ffffff'); }
  function fundo(ctx, tipo) {
    var neve = tipo === 'frio', seco = tipo === 'seco', agua = tipo === 'agua';
    r(ctx, 0, 0, 160, 96, neve ? '#c8eafa' : '#c7f0ee');
    nuvem(ctx, 12, 17); nuvem(ctx, 105, 11);
    if (!neve) { c(ctx, 139, 25, 10, '#ffb84d'); c(ctx, 139, 25, 7, '#ffe36b'); }
    for (var j = 0; j < 18; j++) {
      var m = j * 3; r(ctx, 16 - m, 45 + j, 42 + m * 2, 1, neve ? '#eefaff' : seco ? '#edc694' : '#a6d9b2');
      r(ctx, 108 - m, 41 + j, 27 + m * 2, 1, neve ? '#eefaff' : seco ? '#e6b582' : '#90c9a7');
    }
    r(ctx, 0, 65, 160, 31, seco ? '#f5d596' : neve ? '#edfaff' : '#84c986');
    r(ctx, 0, 65, 160, 2, neve ? '#a4d8ef' : seco ? '#bf9566' : verde);
    if (agua) { r(ctx, 0, 56, 160, 40, '#55badf'); r(ctx, 0, 55, 160, 2, '#eaffff'); }
    for (var i = 0; i < 12; i++) {
      var x = (i * 37 + 11) % 156, y = 71 + i % 4 * 6;
      r(ctx, x, y, agua ? 8 : 3, 1, neve || agua ? '#b8e9f5' : seco ? '#d2ad75' : '#58a975');
      if (!neve && !seco && !agua) r(ctx, x + 1, y - 2, 1, 2, '#58a975');
    }
  }
  function arvore(ctx, x, y, palmeira) {
    b(ctx, x - 3, y - 37, 7, 38, '#b48465'); r(ctx, x - 1, y - 36, 2, 36, '#e8b27a');
    if (palmeira) {
      for (var i = -2; i <= 2; i++) { linha(ctx, x, y - 38, i * 11, Math.abs(i) * 3, K); linha(ctx, x, y - 37, i * 11, Math.abs(i) * 3, verde); }
      c(ctx, x - 4, y - 33, 3, '#b97834'); c(ctx, x + 4, y - 32, 3, '#b97834');
    } else {
      [[-11, -35, 12], [9, -38, 15], [0, -48, 12]].forEach(function (p) { c(ctx, x + p[0], y + p[1], p[2], K); c(ctx, x + p[0], y + p[1], p[2] - 1, verde); });
      e(ctx, x - 5, y - 49, 10, 5, folha); c(ctx, x + 10, y - 41, 3, '#a4e78a');
    }
  }
  function gotas(ctx, x, y) {
    for (var i = 0; i < 5; i++) { r(ctx, x + i * 6, y + i % 2 * 6, 2, 4, '#319ac1'); r(ctx, x + i * 6 - 1, y + 3 + i % 2 * 6, 4, 2, '#319ac1'); }
  }
  function inseto(ctx, x, y, tipo) {
    if (tipo === 'formiga' || tipo === 'cupim') {
      for (var i = 0; i < 3; i++) { c(ctx, x + i * 4, y, 2, K); c(ctx, x + i * 4, y, 1, tipo === 'cupim' ? '#d8ae71' : '#93513a'); linha(ctx, x + i * 4, y + 2, -2, 3, K); }
      linha(ctx, x + 8, y - 2, 2, -3, K); linha(ctx, x + 7, y - 2, -1, -3, K); return;
    }
    e(ctx, x - 3, y - 5, 4, 3, K); e(ctx, x + 3, y - 5, 4, 3, K);
    e(ctx, x - 3, y - 5, 3, 2, branco); e(ctx, x + 3, y - 5, 3, 2, '#d9f3ff');
    e(ctx, x, y, 7, 4, K); e(ctx, x, y, 6, 3, tipo === 'joaninha' ? '#ff668e' : ouro);
    for (var n = -3; n <= 3; n += 3) r(ctx, x + n, y - 2, tipo === 'joaninha' ? 2 : 1, tipo === 'joaninha' ? 2 : 5, K);
    r(ctx, x + 5, y - 1, 1, 1, K);
  }
  function ave(ctx, x, y, beija) {
    e(ctx, x, y, 9, 6, K); e(ctx, x, y, 8, 5, beija ? verde : '#55badf');
    e(ctx, x - 3, y - 2, 5, 4, beija ? folha : '#9fdcff');
    c(ctx, x + 7, y - 5, 5, K); c(ctx, x + 7, y - 5, 4, beija ? verde : '#55badf');
    r(ctx, x + 8, y - 6, 1, 1, K); r(ctx, x + 12, y - 4, beija ? 9 : 4, 2, '#b97834');
    r(ctx, x - 13, y - 2, 5, 3, K); r(ctx, x - 12, y - 1, 5, 1, '#55badf');
    if (!beija) { r(ctx, x - 1, y + 6, 1, 4, K); r(ctx, x + 4, y + 6, 1, 4, K); }
  }
  function mamifero(ctx, x, y, tipo) {
    var cor = { onca: '#ffb84d', gato: '#e7b7a4', bufalo: '#81788e', cao: '#ce9464', feneco: '#edc694', preguica: '#aa8f7c', macaco: '#ad7559' }[tipo] || '#ad7559';
    var largo = tipo === 'bufalo' ? 20 : 15;
    e(ctx, x, y, largo, 10, K); e(ctx, x, y - 1, largo - 1, 8, cor);
    for (var i = -1; i <= 1; i += 2) { b(ctx, x + i * 11 - 2, y + 5, 5, 12, cor); r(ctx, x + i * 11 - 2, y + 15, 6, 2, K); }
    var hx = x + largo - 1;
    c(ctx, hx, y - 10, 10, K); c(ctx, hx, y - 10, 9, cor);
    if (tipo === 'bufalo') {
      r(ctx, hx - 13, y - 20, 3, 7, '#fff4d6'); r(ctx, hx + 10, y - 20, 3, 7, '#fff4d6');
      r(ctx, hx - 12, y - 14, 5, 2, K); r(ctx, hx + 8, y - 14, 5, 2, K);
    } else {
      var alt = tipo === 'feneco' ? 13 : 5;
      b(ctx, hx - 8, y - 20 - alt + 4, 6, alt, cor); b(ctx, hx + 3, y - 20 - alt + 4, 6, alt, cor);
    }
    e(ctx, hx + 3, y - 6, 6, 4, '#fff0d5'); r(ctx, hx + 6, y - 8, 3, 2, K); r(ctx, hx + 3, y - 13, 2, 2, K);
    linha(ctx, x - largo, y, -8, -6, K); linha(ctx, x - largo - 8, y - 6, 0, -6, K);
    if (tipo === 'onca') [[-9, -4], [0, -6], [8, -2], [-4, 2]].forEach(function (p) { b(ctx, x + p[0], y + p[1], 4, 3, '#b97834'); });
    if (tipo === 'preguica') r(ctx, hx - 5, y - 14, 13, 4, '#6b514e');
  }
  function reptil(ctx, x, y, tartaruga) {
    if (tartaruga) {
      [[-13, -7], [-13, 8], [10, -7], [10, 8]].forEach(function (p) { e(ctx, x + p[0], y + p[1], 7, 3, K); e(ctx, x + p[0], y + p[1], 6, 2, folha); });
      e(ctx, x, y, 16, 11, K); e(ctx, x, y, 15, 10, verde); e(ctx, x + 19, y, 6, 5, K); e(ctx, x + 19, y, 5, 4, folha);
      b(ctx, x - 5, y - 5, 10, 10, folha); r(ctx, x + 21, y - 2, 2, 2, K);
    } else {
      e(ctx, x, y, 21, 7, K); e(ctx, x, y, 20, 6, verde); b(ctx, x + 16, y - 4, 22, 7, folha);
      c(ctx, x + 21, y - 6, 4, K); c(ctx, x + 21, y - 6, 3, folha); r(ctx, x + 22, y - 7, 1, 2, K);
      linha(ctx, x - 20, y, -14, -4, K); r(ctx, x - 11, y + 5, 4, 5, K); r(ctx, x + 9, y + 5, 4, 5, K);
      for (var i = 0; i < 5; i++) r(ctx, x - 15 + i * 6, y - 8, 3, 3, K);
    }
  }
  function peixe(ctx, x, y) {
    b(ctx, x - 17, y - 5, 7, 11, '#ffb84d'); e(ctx, x, y, 12, 7, K); e(ctx, x, y, 11, 6, '#ffb84d');
    r(ctx, x - 4, y - 5, 2, 11, branco); r(ctx, x + 6, y - 2, 2, 2, K);
  }
  function caderno(ctx, x, y, pronto) {
    b(ctx, x, y, 31, 24, '#b58cff'); b(ctx, x + 2, y + 2, 13, 20, branco); b(ctx, x + 15, y + 2, 14, 20, branco);
    for (var i = 0; i < 4; i++) r(ctx, x + 18, y + 5 + i * 4, 8, 1, '#c5b4d8');
    if (pronto) { planta(ctx, x + 8, y + 20, 12); r(ctx, x + 20, y + 17, 4, 2, verde); }
    r(ctx, x + 32, y + 4, 2, 19, '#ffb84d'); r(ctx, x + 32, y + 23, 2, 2, K);
  }
  function jardim(ctx, n, feita) {
    fundo(ctx, 'jardim');
    if (n === 4) {
      r(ctx, 0, 57, 160, 39, '#e8b27a'); r(ctx, 0, 56, 160, 3, verde);
      b(ctx, 19, 70, 121, 10, '#ad7559'); e(ctx, 117, 80, 23, 11, '#ad7559');
      for (var i = 0; i < 4; i++) { inseto(ctx, 24 + i * 28, 66, 'formiga'); if (feita) e(ctx, 29 + i * 28, 60, 6, 3, folha); }
      if (feita) for (var j = 0; j < 6; j++) c(ctx, 104 + j % 3 * 8, 79 + Math.floor(j / 3) * 6, 3, branco);
      planta(ctx, 25, 53, 28); return;
    }
    if (n === 5) {
      e(ctx, 80, 76, 64, 18, K); e(ctx, 80, 76, 62, 16, feita ? '#55badf' : '#bf9566');
      planta(ctx, 19, 70, 24, '#ff668e'); if (feita) { peixe(ctx, 76, 77); planta(ctx, 119, 80, 22); }
      return;
    }
    b(ctx, 54, 69, 39, 18, '#b95a36'); r(ctx, 56, 71, 35, 3, '#ffc18c');
    planta(ctx, 73, 70, feita ? 38 : 22, feita ? '#ff668e' : null);
    if (n === 1) caderno(ctx, 111, 65, feita);
    if (n === 2) {
      b(ctx, 8, 12, 38, 43, '#b48465'); r(ctx, 11, 15, 32, 37, feita ? '#fff3a0' : '#81788e');
      r(ctx, 26, 15, 2, 37, K); r(ctx, 11, 32, 32, 2, K);
      if (feita) for (var a = 0; a < 3; a++) linha(ctx, 44, 22 + a * 10, 22, 12, '#ffb84d');
    }
    if (n === 3) {
      b(ctx, 112, 37, 24, 17, '#55badf'); b(ctx, 135, 39, 9, 10, '#d9f3ff'); r(ctx, 100, 38, 13, 5, K);
      if (feita) gotas(ctx, 83, 47);
    }
  }
  function teia(ctx, n, feita) {
    fundo(ctx, 'jardim');
    if (n === 1) { arvore(ctx, 21, 69); mamifero(ctx, 56, 64, 'onca'); reptil(ctx, 114, 79, false); if (feita) { r(ctx, 70, 39, 40, 3, '#b97834'); linha(ctx, 110, 40, -7, -6, '#b97834'); linha(ctx, 110, 40, -7, 6, '#b97834'); } }
    if (n === 2) {
      planta(ctx, 59, 81, 41, '#ff668e');
      e(ctx, feita ? 71 : 109, 57, 10, 5, K); e(ctx, feita ? 71 : 109, 57, 9, 4, folha);
      var gx = feita ? 71 : 109; linha(ctx, gx, 58, -9, 13, K); linha(ctx, gx + 5, 57, 9, 12, K); r(ctx, gx + 7, 54, 2, 2, K);
      if (feita) { c(ctx, 68, 56, 2, '#c7f0ee'); c(ctx, 67, 48, 2, '#c7f0ee'); }
    }
    if (n === 3) { arvore(ctx, 42, 66, true); if (feita) arvore(ctx, 124, 66, true); mamifero(ctx, 36, 75, 'macaco'); ave(ctx, feita ? 124 : 62, 37); }
    if (n === 4) { mamifero(ctx, 74, 68, 'gato'); if (!feita) [61, 72, 83].forEach(function (x) { c(ctx, x, 57, 2, K); }); else { b(ctx, 118, 43, 13, 28, '#fff8ee'); r(ctx, 122, 48, 5, 13, '#ff668e'); r(ctx, 118, 52, 13, 5, '#ff668e'); } }
    if (n === 5) {
      arvore(ctx, 23, 69); e(ctx, 100, 49, 31, 24, K); e(ctx, 100, 49, 30, 23, '#ffb84d');
      for (var j = 0; j < 3; j++) for (var i = 0; i < 4; i++) { c(ctx, 80 + i * 13, 37 + j * 13, 6, '#b97834'); c(ctx, 80 + i * 13, 37 + j * 13, 4, ouro); }
      if (feita) { e(ctx, 92, 50, 3, 2, branco); e(ctx, 106, 62, 3, 2, branco); }
      inseto(ctx, feita ? 101 : 51, feita ? 36 : 45, 'abelha');
    }
  }
  function parcerias(ctx, n, feita) {
    fundo(ctx, 'jardim');
    if (n === 1) { mamifero(ctx, 75, 68, 'bufalo'); ave(ctx, feita ? 65 : 25, feita ? 44 : 30); if (n === 2) ave(ctx, feita ? 88 : 121, feita ? 43 : 25); if (!feita) { c(ctx, 72, 60, 2, K); c(ctx, 82, 62, 2, K); } }
    if (n === 2) { ave(ctx, 47, 58); ave(ctx, feita ? 114 : 75, 58); inseto(ctx, 42, 77, 'formiga'); if (feita) { inseto(ctx, 104, 76, 'formiga'); inseto(ctx, 124, 81, 'formiga'); planta(ctx, 134, 70, 25); } }
    if (n === 3) { planta(ctx, 108, 80, 43, '#ff668e'); planta(ctx, 133, 81, 30, '#b58cff'); ave(ctx, feita ? 81 : 43, 42, true); if (feita) { c(ctx, 103, 41, 2, ouro); c(ctx, 86, 49, 1, ouro); } }
    if (n === 4) {
      b(ctx, 22, 55, 116, 28, '#ad7559'); r(ctx, 24, 57, 112, 3, '#e8b27a');
      for (var i = 0; i < 4; i++) { inseto(ctx, 36 + i * 24, 69, 'cupim'); if (feita) r(ctx, 34 + i * 24, 75, 15, 4, '#6b4428'); }
      planta(ctx, 134, 55, 22);
    }
    if (n === 5) { mamifero(ctx, 67, 68, 'cao'); b(ctx, 113, 74, 29, 10, '#ff668e'); e(ctx, 127, 74, 14, 4, K); e(ctx, 127, 74, 12, 2, feita ? '#55badf' : '#b48465'); }
  }
  function habitats(ctx, n, feita) {
    fundo(ctx, n <= 2 ? 'seco' : n === 3 ? 'frio' : n === 4 ? 'agua' : 'jardim');
    if (n === 1) {
      e(ctx, 83, 80, 40, 11, '#b97834'); if (feita) { e(ctx, 83, 78, 37, 8, '#55badf'); gotas(ctx, 60, 29); }
      b(ctx, 24, 33, 5, 41, '#b48465'); linha(ctx, 26, 52, -13, -15, '#b48465'); linha(ctx, 26, 47, 15, -18, '#b48465');
      ave(ctx, 123, 67); if (feita) planta(ctx, 39, 79, 21);
    }
    if (n === 2) {
      b(ctx, 68, 28, 19, 53, verde); b(ctx, 48, 43, 12, 24, verde); b(ctx, 95, 36, 12, 25, verde);
      r(ctx, 58, 61, 11, 6, K); r(ctx, 85, 56, 12, 6, K); r(ctx, 71, 31, 3, 47, folha);
      for (var i = 0; i < 5; i++) { r(ctx, 65, 37 + i * 8, 3, 1, K); r(ctx, 87, 34 + i * 8, 3, 1, K); }
      flor(ctx, 76, 24, '#ff668e');
      if (feita) { b(ctx, 77, 48, 8, 25, '#79d5e4'); r(ctx, 79, 50, 2, 19, '#d9fff4'); }
    }
    if (n === 3) {
      for (var j = 0; j < 5; j++) { e(ctx, 27 + j * 26, 78, 12, 5, K); e(ctx, 27 + j * 26, 77, 11, 4, feita ? verde : '#a4c3b3'); if (feita) c(ctx, 27 + j * 26, 74, 2, '#b58cff'); }
      for (var a = 0; a < 4; a++) { r(ctx, 21 + a * 30, 35 + a % 2 * 8, 20, 1, '#8eb8d5'); r(ctx, 28 + a * 30, 38 + a % 2 * 8, 12, 1, '#8eb8d5'); }
    }
    if (n === 4) {
      peixe(ctx, 110, 78); e(ctx, 51, feita ? 57 : 81, 23, 7, K); e(ctx, 51, feita ? 56 : 80, 22, 6, folha);
      planta(ctx, 51, feita ? 55 : 79, 24, '#b58cff');
      if (feita) { linha(ctx, 49, 59, -7, 20, '#b48465'); linha(ctx, 52, 59, 5, 22, '#b48465'); }
    }
    if (n === 5) {
      arvore(ctx, 77, 67); r(ctx, 0, 69, 160, 27, '#b48465'); r(ctx, 0, 69, 160, 2, '#6b4428');
      for (var k = -2; k <= 2; k++) { linha(ctx, 77, 69, k * (feita ? 15 : 5), feita ? 24 : 9, '#6b4428'); if (feita) linha(ctx, 77 + k * 10, 85, k * 7, 7, '#6b4428'); }
      if (feita) gotas(ctx, 17, 55);
    }
  }
  function pinguim(ctx, x, y, feita) {
    e(ctx, x, y, 16, 26, K); e(ctx, x, y + 4, 10, 18, branco);
    e(ctx, x - 16, y + 2, 5, 14, K); e(ctx, x + 16, y + 2, 5, 14, K);
    r(ctx, x - 7, y - 17, 3, 3, branco); r(ctx, x + 5, y - 17, 3, 3, branco);
    b(ctx, x - 4, y - 11, 9, 5, '#ffb84d'); b(ctx, x - 13, y + 24, 11, 4, '#ffb84d'); b(ctx, x + 3, y + 24, 11, 4, '#ffb84d');
    if (feita) for (var i = 0; i < 5; i++) { r(ctx, x - 13, y - 5 + i * 5, 3, 2, '#81788e'); r(ctx, x + 11, y - 5 + i * 5, 3, 2, '#81788e'); }
  }
  function observatorio(ctx, n, feita) {
    fundo(ctx, n === 1 ? 'agua' : n === 3 ? 'seco' : n === 4 ? 'frio' : 'jardim');
    if (n === 1) { reptil(ctx, 76, 71, true); if (feita) { r(ctx, 24, 65, 16, 2, '#d9fff4'); r(ctx, 28, 74, 10, 2, '#d9fff4'); } planta(ctx, 134, 89, 20); }
    if (n === 2) {
      arvore(ctx, 28, 88); b(ctx, 27, 31, 108, 6, '#b48465'); mamifero(ctx, 77, feita ? 58 : 73, 'preguica');
      if (feita) { linha(ctx, 65, 61, -4, -25, '#aa8f7c'); linha(ctx, 89, 59, 9, -23, '#aa8f7c'); r(ctx, 58, 32, 7, 3, K); r(ctx, 95, 32, 7, 3, K); }
    }
    if (n === 3) {
      e(ctx, 109, 76, 32, 20, '#bf9566'); e(ctx, 109, 80, 22, 15, K);
      mamifero(ctx, feita ? 93 : 44, 73, 'feneco');
      if (feita) { r(ctx, 83, 90, 50, 6, '#e9bd79'); r(ctx, 96, 50, 26, 2, '#bf9566'); }
    }
    if (n === 4) { pinguim(ctx, 76, 56, feita); if (feita) { c(ctx, 115, 54, 14, K); c(ctx, 115, 54, 13, '#d9f3ff'); for (var i = 0; i < 4; i++) { linha(ctx, 108 + i * 4, 63, 0, -17, K); linha(ctx, 108 + i * 4, 54, 3, -3, '#81788e'); } } }
    if (n === 5) {
      planta(ctx, 42, 82, 42, '#ff668e'); inseto(ctx, 43, 61, 'joaninha'); caderno(ctx, 104, 63, feita);
      c(ctx, 71, 44, 17, K); c(ctx, 71, 44, 15, '#d9fff4'); inseto(ctx, 71, 46, 'joaninha');
      b(ctx, 82, 59, 6, 20, '#ffb84d'); if (feita) { c(ctx, 112, 73, 3, '#ff668e'); r(ctx, 111, 72, 2, 2, K); }
    }
  }
  var cenas = { jardim: jardim, teia: teia, parcerias: parcerias, habitats: habitats, observatorio: observatorio };
  R.FeiraCiencias.desenharCena = function (ctx, salaId, estado) {
    estado = estado || {};
    var missao = estado.missao || {}, numero = Number(String(missao.id || '').slice(-2)) || 1;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 160, 96); ctx.clip();
    (cenas[salaId] || jardim)(ctx, Math.max(1, Math.min(5, numero)), !!estado.feita);
    // A etiqueta integra o diorama; a explicação e os controles ficam no DOM da UI.
    if (estado.feita) {
      b(ctx, 5, 5, 15, 13, '#fff8ee');
      r(ctx, 8, 10, 2, 4, verde); r(ctx, 10, 12, 2, 3, verde); r(ctx, 12, 10, 2, 3, verde); r(ctx, 14, 8, 2, 3, verde);
    }
    ctx.restore();
  };
})();
