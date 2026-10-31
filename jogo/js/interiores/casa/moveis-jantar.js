/* Casa do jogador: os móveis do kit "Sala de Jantar" (casa.md §5), em pixel art, nas direções que o kit declara.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada; 'dir' sai espelhado).
   Paleta: madeira cerejeira, toalha menta, almofadas amarelas, cristaleira verde-água. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var MAD = '#c9764f', TOALHA = '#a8ecd0', ALM = '#ffd34d', CRIS = '#8fd6c4', VIDRO = '#d9f3ff', TAP = '#ff8a7a';

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
  function perna(p, x, y, h) { p.r(x, y, 3, h, K); p.r(x + 1, y, 1, h - 1, escurecer(MAD, 0.2)); }
  // prato redondo visto de cima, com uma comidinha
  function prato(p, x, y, comida) { p.m(x, y, ['.kkkk.', 'kwwwwk', 'kwccwk', 'kwccwk', 'kwwwwk', '.kkkk.'], { k: K, w: C.branco, c: comida }); }
  // vaso de flores do centro da mesa
  function centro(p, x, y) {
    p.m(x, y, ['.r.y.', 'rRryYy', '.rgy.', '..g..', '.kkk.', 'kbbbk', 'kbbbk', '.kkk.'],
      { r: '#ff7eb6', R: C.ouro3, y: C.ouro, Y: '#ff8a3d', g: C.folha3, k: K, b: '#5fb4ff' });
  }

  /* ----- mesa de jantar 3×2 com toalha, pratos e flores ----- */
  I.objeto('casa-jantar-mesa', { w: 3, h: 2, topo: 6, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 4, 22, 9); perna(p, 41, 22, 9);
      p.caixa(1, -2, 46, 22, MAD);
      p.r(5, 0, 38, 18, K); p.r(6, 1, 36, 16, TOALHA); p.r(6, 1, 36, 1, clarear(TOALHA, 0.5));
      for (var x = 7; x < 42; x += 4) p.r(x, 17, 2, 2, TOALHA);
      p.r(1, 19, 46, 4, K); p.r(2, 19, 44, 2, escurecer(MAD, 0.25));
      prato(p, 8, 3, '#ff8a3d'); prato(p, 34, 3, C.verde); prato(p, 8, 10, '#ff5c6a'); prato(p, 34, 10, C.ouro);
      centro(p, 21, -6);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 3, 38, 9); perna(p, 26, 38, 9);
      p.caixa(1, -2, 30, 38, MAD);
      p.r(5, 0, 22, 34, K); p.r(6, 1, 20, 32, TOALHA); p.r(6, 1, 20, 1, clarear(TOALHA, 0.5));
      for (var x = 7; x < 26; x += 4) p.r(x, 33, 2, 2, TOALHA);
      p.r(1, 35, 30, 4, K); p.r(2, 35, 28, 2, escurecer(MAD, 0.25));
      prato(p, 7, 3, '#ff8a3d'); prato(p, 19, 3, C.verde); prato(p, 7, 25, '#ff5c6a'); prato(p, 19, 25, C.ouro);
      centro(p, 13, 10);
    },
  }) });

  /* ----- cadeira 1×1 com encosto de coração e almofada amarela ----- */
  function encosto(p, x, y) {
    p.caixa(x, y, 11, 12, MAD);
    p.m(x + 3, y + 3, ['k.k', 'kkk', '.k.'], { k: '#ff7eb6' });
  }
  I.objeto('casa-jantar-cadeira', { w: 1, h: 1, topo: 10, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      encosto(p, 3, -10);
      perna(p, 2, 6, 9); perna(p, 11, 6, 9);
      p.caixa(1, 0, 14, 7, MAD); p.r(3, 1, 10, 3, ALM); p.r(3, 1, 10, 1, clarear(ALM, 0.5));
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(1, -4, 14, 7, MAD); p.r(3, -3, 10, 3, ALM);
      perna(p, 2, 6, 9); perna(p, 11, 6, 9);
      p.caixa(3, -8, 11, 15, escurecer(MAD, 0.1)); p.r(5, -5, 7, 1, escurecer(MAD, 0.35)); p.r(5, 1, 7, 1, escurecer(MAD, 0.35));
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 1, 6, 9); perna(p, 11, 6, 9);
      p.caixa(1, 0, 14, 7, MAD); p.r(2, 1, 9, 3, ALM); p.r(2, 1, 9, 1, clarear(ALM, 0.5));
      p.caixa(10, -10, 5, 16, escurecer(MAD, 0.05)); p.r(11, -8, 1, 10, '#ff7eb6');
    },
  }) });

  /* ----- cristaleira 2×1: louça atrás do vidro, gavetas e coroa ----- */
  I.objeto('casa-jantar-cristaleira', { w: 2, h: 1, topo: 24, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(1, -22, 30, 4, K); p.r(2, -21, 28, 2, clarear(CRIS, 0.4)); p.m(14, -24, ['.kk.', 'kppk'], { k: K, p: '#ff7eb6' });
      p.caixa(2, -19, 28, 33, CRIS);
      [4, 17].forEach(function (x) {
        p.r(x, -17, 11, 17, K); p.r(x + 1, -16, 9, 15, VIDRO); p.r(x + 1, -9, 9, 1, K);
        p.r(x + 2, -15, 1, 4, C.branco);
      });
      p.m(6, -15, ['.kkk.', 'kpppk', 'kpwpk', 'kpppk', '.kkk.'], { k: K, p: '#ff9cc6', w: C.branco });
      p.m(19, -14, ['kk.kk', 'kbkkb', 'kbkkb', '.k..k'], { k: K, b: '#5fb4ff' });
      p.m(6, -7, ['k.k.k', 'kykyk', 'kkkkk'], { k: K, y: C.ouro });
      p.m(19, -8, ['.kkk.', 'kgggk', 'kgggk', '.kkk.'], { k: K, g: C.verde });
      p.r(15, -10, 1, 3, C.ouro); p.r(16, -10, 1, 3, C.ouro);
      p.r(4, 2, 24, 5, K); p.r(5, 3, 22, 3, escurecer(CRIS, 0.15)); p.r(4, 7, 24, 5, K); p.r(5, 8, 22, 3, escurecer(CRIS, 0.15));
      p.r(15, 4, 2, 1, C.ouro); p.r(15, 9, 2, 1, C.ouro);
      p.r(3, 14, 3, 1, K); p.r(26, 14, 3, 1, K);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(CRIS, 0.15);
      p.r(1, -22, 30, 4, K); p.r(2, -21, 28, 2, clarear(CRIS, 0.2));
      p.caixa(2, -19, 28, 33, e);
      [9, 16, 23].forEach(function (x) { p.r(x, -17, 1, 29, escurecer(CRIS, 0.3)); });
      p.r(3, 14, 3, 1, K); p.r(26, 14, 3, 1, K);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -22, 16, 4, K); p.r(1, -21, 14, 2, clarear(CRIS, 0.4));
      p.caixa(2, -19, 13, 49, CRIS);
      p.r(4, -16, 9, 18, escurecer(CRIS, 0.12)); p.r(4, 6, 9, 20, escurecer(CRIS, 0.12));
      p.r(1, -19, 2, 22, K); p.r(1, -17, 1, 17, VIDRO); p.r(1, 5, 2, 24, K);
      p.r(3, 30, 3, 1, K); p.r(11, 30, 3, 1, K);
    },
  }) });

  /* ----- tapete 3×2 listrado coral e creme ----- */
  function tapete(p, W, H, deitado) {
    p.r(2, 2, W - 4, H - 4, K); p.r(3, 3, W - 6, H - 6, TAP);
    var n = deitado ? W : H;
    for (var i = 6; i < n - 6; i += 6) { if (deitado) p.r(i, 3, 2, H - 6, C.creme); else p.r(3, i, W - 6, 2, C.creme); }
    p.r(3, 3, W - 6, 1, clarear(TAP, 0.35));
    for (var k = 4; k < (deitado ? W : H) - 4; k += 3) {
      if (deitado) { p.r(k, 0, 1, 2, C.creme); p.r(k, H - 2, 1, 2, C.creme); } else { p.r(0, k, 2, 1, C.creme); p.r(W - 2, k, 2, 1, C.creme); }
    }
  }
  I.objeto('casa-jantar-tapete', { w: 3, h: 2, solido: false, semSombra: true, plano: true, desenhar: virado({
    baixo: function (ctx, px, py) { tapete(pincel(ctx, px, py), 48, 32, false); },
    lado: function (ctx, px, py) { tapete(pincel(ctx, px, py), 32, 48, true); },
  }) });

  /* ----- quadro de parede: fruteira ----- */
  I.objeto('casa-jantar-quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(7, 5, 2, 4, K);
      p.r(1, 9, 14, 17, K); p.r(2, 10, 12, 15, MAD); p.r(2, 10, 12, 1, clarear(MAD, 0.4));
      p.r(3, 11, 10, 13, '#fff1d6');
      p.m(3, 12, [
        '...g......', '..rrg.uu..', '.rRrryuUu.', '.rrryyyuuo', 'kkkkkkkkkk', '.kbbbbbbk.', '..kbbbbk..', '...kkkk...',
      ], { k: K, g: C.folha3, r: '#ff5c6a', R: '#ffb0b8', y: C.ouro, u: C.lilas, U: '#e2d0ff', o: '#ff8a3d', b: '#5fb4ff' });
      p.r(3, 21, 10, 3, '#f3d9b0');
    } });
})();
