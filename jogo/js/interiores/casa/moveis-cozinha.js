/* Casa do jogador: os móveis do kit "Cozinha" (casa.md §5), em pixel art, nas direções que o kit declara.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada; 'dir' sai espelhado).
   Paleta: armários menta, fogão rosa retrô, geladeira branca com ímãs, toques de coral e amarelo. Sem DOM. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var MENTA = '#9fe3d0', ROSA = '#ffb3c7', GEL = '#f4fbff', TAMPO = '#fff1d6', CORAL = '#ff8a7a', AMAR = '#ffd34d';

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
  function boca(p, x, y) { p.m(x, y, ['.kkk.', 'kmkmk', 'kkmkk', '.kkk.'], { k: K, m: C.metal2 }); }
  function pes(p, x1, x2, y) { p.r(x1, y, 3, 1, K); p.r(x2, y, 3, 1, K); }

  /* ----- fogão rosa retrô 1×1 (bocas, botões e forno com janelinha) ----- */
  I.objeto('casa-cozinha-fogao', { w: 1, h: 1, topo: 10, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(1, -10, 14, 5, ROSA); p.r(7, -9, 2, 2, C.branco);
      p.r(0, -6, 16, 6, K); p.r(1, -5, 14, 4, C.metal); boca(p, 1, -5); boca(p, 10, -5);
      p.caixa(1, -1, 14, 15, ROSA);
      [3, 7, 11].forEach(function (x) { p.r(x, 0, 2, 2, K); p.r(x, 0, 1, 1, C.branco); });
      p.r(3, 3, 10, 8, K); p.r(4, 4, 8, 6, '#ffb35c'); p.r(4, 4, 8, 1, '#ff8a3d'); p.r(4, 4, 2, 1, C.ouro3);
      p.r(4, 12, 8, 1, C.metal2); pes(p, 1, 12, 14);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -8, 16, 7, K); p.r(1, -7, 14, 5, C.metal); boca(p, 1, -7); boca(p, 10, -7);
      p.caixa(1, -2, 14, 5, ROSA);
      p.caixa(1, 2, 14, 12, escurecer(ROSA, 0.15));
      [5, 7, 9].forEach(function (y) { p.r(4, y, 8, 1, escurecer(ROSA, 0.4)); });
      pes(p, 1, 12, 14);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -6, 12, 7, K); p.r(1, -5, 10, 5, C.metal); boca(p, 3, -5);
      p.caixa(11, -10, 5, 25, ROSA);
      p.caixa(1, 0, 11, 14, escurecer(ROSA, 0.08)); p.r(3, 3, 7, 7, escurecer(ROSA, 0.2));
      p.r(0, 2, 2, 10, K); p.r(0, 4, 1, 5, C.metal2);
      pes(p, 1, 9, 14);
    },
  }) });

  /* ----- geladeira branca 1×1 com ímãs e um desenho ----- */
  I.objeto('casa-cozinha-geladeira', { w: 1, h: 1, topo: 22, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(0, -22, 16, 37, GEL); p.r(1, -9, 14, 1, K); p.r(1, 12, 14, 2, C.metal);
      p.r(12, -19, 2, 7, K); p.r(12, -6, 2, 10, K);
      p.m(3, -19, ['k.k', 'kkk', '.k.'], { k: CORAL });
      p.r(3, -6, 7, 8, K); p.r(4, -5, 5, 6, C.creme); p.r(5, -4, 2, 2, AMAR); p.r(4, -1, 5, 1, C.verde); p.r(7, -3, 1, 1, '#5fb4ff');
      p.r(6, -7, 1, 2, CORAL);
      p.m(3, 5, ['.y.', 'yyy', '.y.'], { y: AMAR }); p.r(8, 7, 2, 2, '#5fb4ff');
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(0, -22, 16, 37, '#dfe7f0');
      p.r(3, -6, 10, 17, K);
      for (var y = -5; y < 10; y += 2) p.r(4, y, 8, 1, C.metal2);
      p.r(4, -5, 1, 15, C.metal2); p.r(11, -5, 1, 15, C.metal2);
      p.r(4, -18, 8, 1, escurecer(GEL, 0.25));
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(2, -22, 14, 37, escurecer(GEL, 0.05)); p.r(3, 12, 12, 2, C.metal);
      p.r(0, -21, 3, 35, K); p.r(1, -20, 1, 33, GEL); p.r(2, -9, 1, 1, K);
      p.r(0, -18, 1, 6, C.metal2); p.r(0, -5, 1, 8, C.metal2);
      p.r(6, -16, 6, 1, escurecer(GEL, 0.2));
    },
  }) });

  /* ----- pia 2×1: armário menta, cuba, torneira e um paninho ----- */
  function torneira(p, x, y) { p.r(x, y, 2, 6, K); p.r(x, y, 5, 2, K); p.r(x + 3, y, 2, 3, K); p.r(x + 1, y + 1, 1, 4, C.metal); }
  I.objeto('casa-cozinha-pia', { w: 2, h: 1, topo: 12, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -6, 32, 7, K); p.r(1, -5, 30, 5, TAMPO); p.r(1, -5, 30, 1, C.branco);
      p.r(6, -4, 14, 4, K); p.r(7, -3, 12, 2, '#a8d8f0');
      torneira(p, 11, -12);
      p.m(23, -9, ['kkkk', 'kbbk', 'kbbk', 'kkkk'], { k: K, b: AMAR });
      p.caixa(1, 0, 30, 14, MENTA); p.r(16, 1, 1, 12, escurecer(MENTA, 0.35));
      p.r(13, 5, 2, 2, AMAR); p.r(18, 5, 2, 2, AMAR);
      p.r(4, 2, 6, 8, CORAL); p.r(4, 2, 6, 1, K); p.r(5, 4, 4, 1, C.branco); p.r(5, 7, 4, 1, C.branco);
      pes(p, 2, 27, 14);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -8, 32, 7, K); p.r(1, -7, 30, 5, TAMPO);
      p.r(12, -7, 14, 4, K); p.r(13, -6, 12, 2, '#a8d8f0');
      p.r(18, -12, 2, 5, K);
      p.caixa(1, -2, 30, 16, escurecer(MENTA, 0.12));
      [8, 16, 24].forEach(function (x) { p.r(x, 0, 1, 12, escurecer(MENTA, 0.3)); });
      pes(p, 2, 27, 14);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(0, -6, 16, 22, K); p.r(1, -5, 14, 20, TAMPO); p.r(1, -5, 14, 1, C.branco);
      p.r(3, -2, 7, 12, K); p.r(4, -1, 5, 10, '#a8d8f0');
      p.r(11, -8, 3, 8, K); p.r(12, -7, 1, 6, C.metal); p.r(9, -8, 4, 2, K);
      p.caixa(1, 15, 14, 16, MENTA); p.r(0, 16, 2, 14, K); p.r(0, 20, 1, 2, AMAR);
      pes(p, 2, 11, 31);
    },
  }) });

  /* ----- armário alto 2×1 menta com potes em cima ----- */
  I.objeto('casa-cozinha-armario', { w: 2, h: 1, topo: 18, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(5, -18, ['.kkk.', 'krrrk', 'kwwwk', 'krrrk', 'kkkkk'], { k: K, r: CORAL, w: C.branco });
      p.m(22, -17, ['.kk.', 'kyyk', 'kyyk', 'kkkk'], { k: K, y: AMAR });
      p.caixa(1, -13, 30, 28, MENTA);
      [3, 17].forEach(function (x) { p.r(x, -11, 12, 23, K); p.r(x + 1, -10, 10, 21, clarear(MENTA, 0.15)); p.r(x + 2, -9, 8, 19, MENTA); });
      p.m(7, -5, ['.c.', 'ccc', '.c.'], { c: CORAL }); p.m(21, -5, ['.c.', 'ccc', '.c.'], { c: CORAL });
      p.r(13, -1, 2, 3, AMAR); p.r(17, -1, 2, 3, AMAR);
      pes(p, 2, 27, 15);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(22, -18, ['.kkk.', 'krrrk', 'kkkkk'], { k: K, r: CORAL });
      p.caixa(1, -15, 30, 30, escurecer(MENTA, 0.12));
      [9, 16, 23].forEach(function (x) { p.r(x, -13, 1, 26, escurecer(MENTA, 0.3)); });
      pes(p, 2, 27, 15);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(5, -18, ['.kkk.', 'krrrk', 'kwwwk', 'kkkkk'], { k: K, r: CORAL, w: C.branco });
      p.caixa(2, -14, 14, 45, escurecer(MENTA, 0.05));
      p.r(5, -11, 8, 17, escurecer(MENTA, 0.15)); p.r(5, 9, 8, 18, escurecer(MENTA, 0.15));
      p.r(0, -13, 3, 43, K); p.r(1, -12, 1, 41, MENTA); p.r(0, 2, 1, 3, AMAR);
      pes(p, 2, 12, 31);
    },
  }) });

  /* ----- mesinha redonda com toalha xadrez ----- */
  I.objeto('casa-cozinha-mesinha', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(7, 6, 2, 8, K); p.r(4, 13, 8, 2, K); p.r(5, 13, 6, 1, C.madeira);
      p.m(0, -4, [
        '...kkkkkkkk...', '.kkcwcwcwcwkk.', 'kwcwcwcwcwcwck', 'kcwcwcwcwcwcwk', 'kwcwcwcwcwcwck', 'kcwcwcwcwcwcwk',
        '.kkcwcwcwcwkk.', '...kckckckck..', '....k.k.k.k...',
      ].map(function (l) { return ' ' + l; }), { k: K, c: CORAL, w: C.creme });
      p.r(6, -1, 4, 3, K); p.r(7, -1, 2, 2, C.branco); p.r(7, -3, 1, 2, C.folha3); p.r(6, -4, 3, 1, '#ff7eb6');
    } });

  /* ----- banquinho amarelo ----- */
  I.objeto('casa-cozinha-banquinho', { w: 1, h: 1, topo: 0, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(3, 6, 2, 9, K); p.r(11, 6, 2, 9, K); p.r(7, 7, 2, 7, K); p.r(3, 10, 10, 1, K);
      p.r(1, 1, 14, 6, K); p.r(2, 2, 12, 4, AMAR); p.r(2, 2, 12, 1, clarear(AMAR, 0.5)); p.r(3, 5, 11, 1, escurecer(AMAR, 0.2));
    } });

  /* ----- fruteira de pé com maçã, banana, uva e laranja ----- */
  I.objeto('casa-cozinha-fruteira', { w: 1, h: 1, topo: 10, solido: 'base', alto: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(1, -10, [
        '....g.........', '...kkk..kkk...', '..krrrkkuuuk..', '.krRrrkuUuuk..', 'kyyyyykkuuuk.k', 'kyYyyyyykkkkoo',
        'kkkkkkkkkkkkok', 'kwwwwwwwwwwwwk', '.kwwwwwwwwwwk.', '..kkkkkkkkkk..',
      ], { k: K, g: C.folha3, r: '#ff5c6a', R: '#ffb0b8', y: AMAR, Y: C.ouro3, u: C.lilas, U: '#e2d0ff', o: '#ff8a3d', w: '#9fdcff' });
      p.r(7, 0, 2, 12, K); p.r(7, 0, 1, 11, C.metal);
      p.r(3, 12, 10, 3, K); p.r(4, 13, 8, 1, C.metal);
    } });
})();
