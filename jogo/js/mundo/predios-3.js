/* Desenho de fora da Loja das Fadas no mapa (Mapa.PREDIOS.loja), separado de mundo/predios.js pelo tamanho.
   Mesmo contrato: (ctx, px, py, w, h) em px do jogo, enfeites de Mapa.fachada (mundo/fachadas.js), porta F.entrada.
   As luzinhas do varal acendem uma de cada vez em Mapa.PREDIOS_ANIM.loja (só com Animações). */
(function () {
  var Mapa = window.Mapa, F = Mapa.fachada, D = window.Reino.Desenho;
  var C = D.C, K = D.K, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var contornoRet = D.contornoRet;

  // luzinhas do varal da loja: x, desce (a curva do fio) e a cor
  var LUZES_LOJA = [[8, 0, '#ff7eb6'], [16, 1, '#ffe066'], [24, 2, '#6fdc8c'], [32, 2, '#5fb4ff'], [46, 2, '#ff7eb6'],
    [54, 2, '#ffe066'], [62, 1, '#6fdc8c'], [70, 0, '#b58cff']];

  Mapa.PREDIOS.loja = function (ctx, px, py, w, h) {
    var cx = px + w / 2, lar = '#ff8a3d', larE = '#e07028', larC = '#ffc27a';
    // caule / casa, com a textura de caule e a sombra do chapéu
    contornoRet(ctx, px + 12, py + 26, w - 24, h - 26, '#fff1dc');
    for (var i = px + 15; i < px + w - 14; i += 5) ret(ctx, i, py + 34, 1, h - 36, '#f7e4c8');
    ret(ctx, px + w - 22, py + 28, 8, h - 29, '#f5dfc0');
    ret(ctx, px + 13, py + 32, w - 26, 2, 'rgba(160,80,30,0.18)');
    F.volume(ctx, px + 13, py + 34, w - 26, h - 39);
    F.fundacao(ctx, px + 13, py + h - 5, w - 26, 5, '#d8c4a4');
    F.trepadeira(ctx, px + 14, py + h - 5, 16, '#ff7eb6');
    // chapéu de cogumelo com sombra embaixo, brilho em cima e as pintas
    elipse(ctx, cx, py + 18, w / 2 - 1, 17, K);
    elipse(ctx, cx, py + 17, w / 2 - 3, 15, lar);
    elipse(ctx, cx + 4, py + 21, w / 2 - 8, 9, '#f57a30');
    elipse(ctx, cx - 8, py + 11, 14, 6, larC);
    elipse(ctx, cx - 12, py + 8, 6, 2, '#ffe2b8');
    // volume do chapéu: faixa mais escura na borda de baixo e brilho em degraus em cima
    elipse(ctx, cx + 2, py + 23, w / 2 - 5, 5, larE);
    ret(ctx, cx - 18, py + 5, 10, 1, '#fff2d8'); ret(ctx, cx - 21, py + 7, 4, 1, '#fff2d8');
    ret(ctx, px + 2, py + 26, w - 4, 6, K); ret(ctx, px + 4, py + 26, w - 8, 4, larE);
    for (var g = px + 6; g < px + w - 6; g += 3) ret(ctx, g, py + 28, 1, 2, '#c85a1c');
    [[14, 16, 3], [58, 12, 3], [66, 18, 2], [28, 21, 2], [50, 21, 2], [38, 7, 2]].forEach(function (b) {
      circulo(ctx, px + b[0], py + b[1] + 1, b[2], larE);
      circulo(ctx, px + b[0], py + b[1], b[2], '#ffffff');
      ret(ctx, px + b[0] - 1, py + b[1] - b[2] + 1, 1, 1, '#fff8ee');
    });
    // varal de luzinhas na aba do chapéu
    LUZES_LOJA.forEach(function (l) {
      ret(ctx, px + l[0], py + 31 + l[1], 1, 1, K);
      ret(ctx, px + l[0], py + 32 + l[1], 2, 2, l[2]);
    });
    // janela redonda com moldura e floreira
    circulo(ctx, px + 22, py + 42, 6, K); circulo(ctx, px + 22, py + 42, 5, C.madeira); circulo(ctx, px + 22, py + 42, 4, K);
    circulo(ctx, px + 22, py + 42, 3, '#c8f3ea'); ret(ctx, px + 20, py + 40, 2, 2, '#ffffff'); ret(ctx, px + 22, py + 39, 1, 7, C.madeira); ret(ctx, px + 19, py + 42, 7, 1, C.madeira);
    // plaquinha pendurada com a varinha de condão
    ret(ctx, px + 55, py + 32, 1, 5, K); ret(ctx, px + 64, py + 32, 1, 5, K);
    contornoRet(ctx, px + 52, py + 37, 16, 11, '#fff3d6');
    ret(ctx, px + 53, py + 38, 14, 1, '#ffffff');
    ret(ctx, px + 56, py + 45, 1, 1, '#9b5cff'); ret(ctx, px + 57, py + 44, 1, 1, '#9b5cff'); ret(ctx, px + 58, py + 43, 1, 1, '#9b5cff');
    D.matriz(ctx, px + 58, py + 39, ['..y..', '.yyy.', 'yywyy', '.y.y.'], { y: C.ouro, w: '#fff3a0' });
    // porta
    F.entrada(ctx, cx, py + h, '#9b5cff', '#ffe066');
    // canteiro de flores
    contornoRet(ctx, px + 14, py + 52, 16, 8, '#c98a4b');
    ret(ctx, px + 15, py + 53, 14, 1, C.madeiraClara);
    ret(ctx, px + 16, py + 50, 12, 3, '#7ea832');
    ret(ctx, px + 17, py + 50, 8, 1, '#b6d24e');
    [[18, 50, '#ff8a3d'], [22, 49, '#ffe066'], [26, 50, '#ffffff']].forEach(function (f) {
      ret(ctx, px + f[0] - 1, py + f[1], 3, 1, f[2]);
      ret(ctx, px + f[0], py + f[1] - 1, 1, 3, f[2]);
      ret(ctx, px + f[0], py + f[1], 1, 1, '#fff3a0');
    });
    // cogumelinhos na porta da direita
    [[54, 62, '#ff7eb6'], [60, 63, '#b58cff']].forEach(function (c) {
      ret(ctx, px + c[0], py + c[1] - 3, 2, 3, '#fff1dc'); ret(ctx, px + c[0] - 1, py + c[1] - 3, 4, 1, K);
      elipse(ctx, px + c[0], py + c[1] - 5, 3, 2, K); elipse(ctx, px + c[0], py + c[1] - 5, 2, 1, c[2]);
      ret(ctx, px + c[0], py + c[1] - 6, 1, 1, '#ffffff');
    });
    // lanternas penduradas nas pontas do chapéu
    [px + 8, px + w - 10].forEach(function (lx) {
      ret(ctx, lx + 1, py + 32, 1, 3, K);
      ret(ctx, lx, py + 35, 3, 1, K); ret(ctx, lx - 1, py + 36, 5, 5, K); ret(ctx, lx, py + 37, 3, 3, '#ffe066'); ret(ctx, lx, py + 37, 1, 1, '#fff8c8');
      ret(ctx, lx, py + 41, 3, 1, K);
    });
    // flores no pé do caule, à direita
    [[w - 16, '#ff7eb6'], [w - 20, '#ffe066'], [16, '#b58cff']].forEach(function (f) {
      var fx = px + f[0], fy = py + h - 4;
      ret(ctx, fx, fy, 1, 3, C.folha3); ret(ctx, fx - 1, fy - 1, 3, 1, f[1]); ret(ctx, fx, fy - 2, 1, 3, f[1]); ret(ctx, fx, fy - 1, 1, 1, '#fff3a0');
    });
    // brilhinhos
    [[6, 36], [72, 40], [66, 50]].forEach(function (s) { F.brilho(ctx, px + s[0], py + s[1], '#ffffff'); });
  };

  // as luzinhas da loja acendem uma de cada vez
  Mapa.PREDIOS_ANIM.loja = function (ctx, px, py, w, h, t) {
    var n = Math.floor(t / 260) % LUZES_LOJA.length, l = LUZES_LOJA[n];
    ret(ctx, px + l[0] - 1, py + 32 + l[1], 4, 2, 'rgba(255,255,255,0.35)');
    ret(ctx, px + l[0], py + 32 + l[1], 2, 2, '#ffffff');
  };
})();
