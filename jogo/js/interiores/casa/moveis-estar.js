/* Casa do jogador: os móveis do kit "Sala de Estar" (casa.md §5), em pixel art, nas direções que o kit declara.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada; 'dir' sai espelhado).
   Paleta: sofá coral, poltrona amarela, madeira mel, tapete lilás. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var SOFA = '#ff8f9c', POLT = '#ffc94d', MAD = '#d99a5b', TAP = '#c9a6ff', TV = '#4a4060';
  var ALM1 = '#7ed9c8', ALM2 = '#b58cff';

  // pincel em px relativos à pegada; caixa = contorno + luz em cima/esquerda + sombra embaixo
  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, escurecer(c, 0.2));
      },
      bola: function (x, y, raio, c) { circulo(ctx, px + x, py + y, raio, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
    };
    return p;
  }
  // almofadinha quadrada com um botão no meio
  function almofada(p, x, y, c) { p.r(x, y, 7, 7, K); p.r(x + 1, y + 1, 5, 5, c); p.r(x + 1, y + 1, 3, 1, clarear(c, 0.5)); p.r(x + 3, y + 3, 1, 1, escurecer(c, 0.3)); }
  function pe(p, x, y) { p.r(x, y, 3, 3, K); p.r(x + 1, y, 1, 2, C.madeira2); }

  /* ----- sofá 3×2 ----- */
  I.objeto('casa-estar-sofa', { w: 3, h: 2, topo: 8, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(SOFA, 0.15);
      p.caixa(3, -8, 42, 20, SOFA);
      [12, 24, 36].forEach(function (x) { p.r(x, -3, 1, 1, e); p.r(x, 3, 1, 1, e); });
      almofada(p, 9, 2, ALM1); almofada(p, 32, 2, ALM2);
      [9, 19, 29].forEach(function (x) { p.caixa(x, 10, 11, 10, clarear(SOFA, 0.15)); });
      p.r(9, 19, 30, 8, K); p.r(10, 19, 28, 7, e); p.r(10, 25, 28, 1, escurecer(SOFA, 0.3));
      p.caixa(0, 2, 10, 26, SOFA); p.caixa(38, 2, 10, 26, SOFA);
      p.r(2, 3, 6, 2, clarear(SOFA, 0.5)); p.r(40, 3, 6, 2, clarear(SOFA, 0.5));
      pe(p, 2, 28); pe(p, 43, 28);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(SOFA, 0.15);
      [9, 19, 29].forEach(function (x) { p.caixa(x, -4, 11, 10, clarear(SOFA, 0.15)); });
      almofada(p, 9, -7, ALM1); almofada(p, 32, -7, ALM2);
      p.caixa(0, -6, 10, 30, SOFA); p.caixa(38, -6, 10, 30, SOFA);
      p.caixa(3, 4, 42, 24, e);
      [14, 24, 34].forEach(function (x) { p.r(x, 6, 1, 20, escurecer(SOFA, 0.3)); });
      p.r(5, 8, 2, 16, clarear(SOFA, 0.1));
      pe(p, 2, 28); pe(p, 43, 28);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(SOFA, 0.15);
      p.caixa(19, -8, 13, 52, e); p.r(21, -6, 2, 46, clarear(SOFA, 0.25));
      [8, 18, 28].forEach(function (y) { p.caixa(5, y - 2, 15, 10, clarear(SOFA, 0.15)); });
      almofada(p, 13, 9, ALM1); almofada(p, 13, 27, ALM2);
      p.r(1, 6, 5, 30, K); p.r(2, 7, 3, 28, e);
      p.caixa(1, -4, 28, 10, SOFA); p.caixa(1, 34, 28, 10, SOFA);
      p.r(3, 35, 24, 1, clarear(SOFA, 0.55));
      pe(p, 2, 44); pe(p, 26, 44);
    },
  }) });

  /* ----- poltrona 1×1 ----- */
  I.objeto('casa-estar-poltrona', { w: 1, h: 1, topo: 8, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(POLT, 0.15);
      p.caixa(2, -8, 12, 14, POLT); p.r(7, -4, 2, 2, e);
      p.caixa(4, 4, 8, 6, clarear(POLT, 0.2)); p.r(4, 9, 8, 4, K); p.r(5, 9, 6, 3, e);
      p.caixa(0, -1, 5, 14, POLT); p.caixa(11, -1, 5, 14, POLT);
      pe(p, 1, 13); pe(p, 12, 13);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(POLT, 0.15);
      p.caixa(4, -5, 8, 6, clarear(POLT, 0.2));
      p.caixa(0, -6, 5, 18, POLT); p.caixa(11, -6, 5, 18, POLT);
      p.caixa(2, -1, 12, 14, e); p.r(7, 1, 1, 10, escurecer(POLT, 0.3));
      pe(p, 1, 13); pe(p, 12, 13);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(POLT, 0.15);
      // encosto gordo à direita, almofada alta e dois braços rolados (estofados)
      p.caixa(8, -8, 8, 21, e); p.r(9, -8, 6, 1, K); p.r(10, -6, 2, 15, clarear(POLT, 0.3));
      p.caixa(1, 0, 9, 9, clarear(POLT, 0.25)); p.r(2, 1, 7, 2, clarear(POLT, 0.55)); p.r(5, 4, 1, 1, e);
      p.r(0, 2, 2, 9, K); p.r(1, 3, 1, 7, e);
      [-5, 7].forEach(function (y) {
        p.caixa(0, y, 12, 7, POLT); p.r(2, y + 1, 8, 2, clarear(POLT, 0.55)); p.r(2, y + 4, 9, 1, escurecer(POLT, 0.25));
      });
      pe(p, 1, 13); pe(p, 11, 13);
    },
  }) });

  /* ----- mesa de centro 2×1 (com um livro e uma xícara) ----- */
  function xicara(p, x, y) { p.r(x, y, 5, 4, K); p.r(x + 1, y + 1, 3, 2, C.creme); p.r(x + 5, y + 1, 1, 2, K); p.r(x + 1, y + 1, 3, 1, '#ff7eb6'); }
  I.objeto('casa-estar-mesa-centro', { w: 2, h: 1, topo: 2, solido: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(4, 9, 3, 6, K); p.r(25, 9, 3, 6, K); p.r(5, 9, 1, 5, C.madeira2); p.r(26, 9, 1, 5, C.madeira2);
      p.caixa(1, 0, 30, 8, MAD); p.r(2, 7, 28, 3, K); p.r(3, 7, 26, 2, escurecer(MAD, 0.3));
      p.r(6, 1, 9, 5, K); p.r(7, 2, 7, 3, '#5fb4ff'); p.r(7, 2, 7, 1, C.creme);
      xicara(p, 20, 1);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      // mesa baixa em 3/4: tampo comprido visto de cima, faixa da frente de 3 px e pés curtos
      p.r(3, 28, 3, 3, K); p.r(10, 28, 3, 3, K); p.r(4, 28, 1, 2, C.madeira2); p.r(11, 28, 1, 2, C.madeira2);
      p.caixa(1, 2, 14, 24, MAD); p.r(5, 5, 1, 18, escurecer(MAD, 0.12)); p.r(10, 6, 1, 16, escurecer(MAD, 0.12));
      p.r(1, 25, 14, 4, K); p.r(2, 25, 12, 3, escurecer(MAD, 0.3));
      // livro deitado: capa azul, lombada escura, páginas brancas
      p.r(3, 4, 9, 11, K); p.r(4, 5, 7, 9, '#5fb4ff'); p.r(4, 5, 1, 9, '#3a7cc4'); p.r(10, 5, 1, 9, C.branco); p.r(6, 7, 3, 1, C.creme);
      // caneca de cima: rosa com café no meio e a alça
      p.r(6, 17, 6, 6, K); p.r(7, 18, 4, 4, '#ff7eb6'); p.r(8, 19, 2, 2, '#6b4428'); p.r(12, 19, 1, 2, K);
    },
  }) });

  /* ----- tapete 3×2 lilás com flores e franja ----- */
  function tapete(p, W, H, deitado) {
    p.r(2, 2, W - 4, H - 4, K); p.r(3, 3, W - 6, H - 6, TAP);
    p.r(5, 5, W - 10, H - 10, clarear(TAP, 0.45)); p.r(7, 7, W - 14, H - 14, TAP);
    p.r(3, 3, W - 6, 1, clarear(TAP, 0.3));
    for (var i = 4; i < (deitado ? H : W) - 4; i += 3) {
      if (deitado) { p.r(0, i, 2, 1, C.creme); p.r(W - 2, i, 2, 1, C.creme); } else { p.r(i, 0, 1, 2, C.creme); p.r(i, H - 2, 1, 2, C.creme); }
    }
    var flor = ['.r.', 'ryr', '.r.'], pal = { r: '#ff7eb6', y: C.ouro };
    p.m(Math.floor(W / 2) - 1, Math.floor(H / 2) - 1, flor, pal);
    [[10, 10], [W - 13, 10], [10, H - 13], [W - 13, H - 13]].forEach(function (q) { p.m(q[0], q[1], flor, { r: C.creme, y: '#ff7eb6' }); });
  }
  I.objeto('casa-estar-tapete', { w: 3, h: 2, solido: false, semSombra: true, plano: true, desenhar: virado({
    baixo: function (ctx, px, py) { tapete(pincel(ctx, px, py), 48, 32, false); },
    lado: function (ctx, px, py) { tapete(pincel(ctx, px, py), 32, 48, true); },
  }) });

  /* ----- estante baixa com TV 2×1 ----- */
  function rack(p, x, y, w, h) {
    p.caixa(x, y, w, h, MAD);
    var n = Math.max(1, Math.floor((w - 2) / 10)), q = Math.floor((w - 2) / n);
    for (var i = 0; i < n; i++) { p.r(x + 1 + i * q + 1, y + 3, q - 2, h - 5, escurecer(MAD, 0.15)); p.r(x + 1 + i * q + q - 3, y + 6, 1, 2, C.ouro); }
  }
  I.objeto('casa-estar-estante-tv', { w: 2, h: 1, topo: 18, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(5, -18, 22, 16, K); p.r(6, -17, 20, 14, TV); p.r(7, -16, 18, 11, '#7fd4ff');
      p.r(8, -15, 6, 2, '#d9f3ff'); p.r(8, -13, 3, 1, '#d9f3ff');
      p.m(16, -12, ['.y.', 'yyy', '.y.'], { y: C.ouro }); p.m(20, -10, ['p', 'p'], { p: '#ff7eb6' });
      p.r(14, -3, 4, 2, K); p.r(11, -1, 10, 1, K);
      p.m(1, -6, ['.g.', 'ggg', 'kgk', 'krk', 'krk', '.k.'], { g: C.verde, k: K, r: C.terracota });
      rack(p, 0, 0, 32, 15); pe(p, 2, 13); pe(p, 27, 13);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(4, -18, 24, 17, '#5a5070'); p.r(10, -14, 12, 9, escurecer(TV, 0.2));
      [11, 13, 15, 17, 19].forEach(function (x) { p.r(x, -12, 1, 5, TV); });
      p.r(20, -2, 6, 1, K); p.r(25, -1, 1, 3, K);
      p.caixa(0, 0, 32, 15, escurecer(MAD, 0.1)); p.r(2, 7, 28, 1, escurecer(MAD, 0.3));
      pe(p, 2, 13); pe(p, 27, 13);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      // tampo do móvel visto de cima, frente das gavetas à esquerda (puxadores dourados)
      p.caixa(1, 2, 15, 20, MAD); p.r(3, 4, 11, 1, clarear(MAD, 0.3));
      p.caixa(1, 21, 15, 9, escurecer(MAD, 0.1));
      p.r(0, 4, 2, 25, K); p.r(1, 8, 1, 3, C.ouro); p.r(1, 17, 1, 3, C.ouro); p.r(1, 25, 1, 2, C.ouro);
      // TV fina de perfil, da altura da tela de frente, com a tela virada para a esquerda e o pé no tampo
      p.r(6, -5, 6, 17, K); p.r(7, -4, 4, 15, '#5a5070'); p.r(7, -4, 1, 15, '#7fd4ff'); p.r(9, -3, 1, 13, escurecer(TV, 0.3));
      p.r(8, 12, 2, 3, K); p.r(5, 14, 8, 3, K); p.r(6, 15, 6, 1, C.metal);
      p.m(2, 16, ['.g.', 'ggg', 'krk', '.k.'], { g: C.verde, k: K, r: C.terracota });
      pe(p, 2, 29); pe(p, 12, 29);
    },
  }) });

  /* ----- luminária de pé (cúpula creme com franja) ----- */
  I.objeto('casa-estar-luminaria', { w: 1, h: 1, topo: 22, solido: 'base', alto: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(3, -22, 10, 1, K); p.r(2, -21, 12, 10, K); p.r(3, -21, 10, 9, '#fff1b8'); p.r(1, -13, 14, 3, K);
      p.r(2, -12, 12, 1, '#ffd34d'); p.r(4, -20, 2, 7, C.branco);
      [3, 6, 9, 12].forEach(function (x) { p.r(x, -10, 1, 1, '#ff7eb6'); });
      p.r(7, -10, 2, 20, K); p.r(7, -10, 1, 19, C.ouro2);
      p.r(3, 10, 10, 4, K); p.r(4, 11, 8, 2, C.ouro); p.r(4, 11, 3, 1, C.ouro3);
    } });

  /* ----- vaso com planta grande ----- */
  I.objeto('casa-estar-planta', { w: 1, h: 1, topo: 12, solido: 'base', alto: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(1, -12, [
        '.....kk.......', '....kggk..kk..', '..kkgGgk.kggk.', '.kgggGgkkgGgk.', 'kgGgggkggGggk.', 'kggGgkgggggk..',
        '.kgggkgGgkkkk.', '..kkgggGgggggk', '.kggGgggkgGggk', 'kgGgggkgggggk.', 'kggggkggGgkk..', '.kkkkkkkkkk...',
      ], { k: K, g: C.folha3, G: C.folha2 });
      p.r(3, 0, 10, 2, K); p.caixa(3, 1, 10, 13, C.terracota); p.r(4, 6, 8, 2, C.creme);
    } });

  /* ----- quadro de parede: arco-íris sobre colinas ----- */
  I.objeto('casa-estar-quadro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(15, 4, 2, 4, K);
      p.r(4, 8, 24, 18, K); p.r(5, 9, 22, 16, C.ouro); p.r(5, 9, 22, 1, C.ouro3); p.r(5, 24, 22, 1, C.ouro2);
      p.m(7, 11, [
        'ssssssssssssswwwss', 'sssssrrrrrrsswwwws', 'ssssroooooorssssss', 'sssroyyyyyyorsssss',
        'ssroyggggggyorssss', 'ssroygbbbbgyorssss', 'sroygbssssbgyorsss', 'sroygbssssbgyorsss',
        'hhhhhhhhhhhhhhhhhh', 'HhhhHhhhhHhhhhHhhh', 'HHHHHHHHHHHHHHHHHH', 'HHHHHHHHHHHHHHHHHH',
      ], { s: '#bfe9ff', w: C.branco, r: '#ff5c6a', o: '#ff8a3d', y: '#ffd34d', g: '#6fdc8c', b: '#5fb4ff', h: C.folha2, H: C.folha3 });
    } });
})();
