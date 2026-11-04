/* Casa do jogador: os móveis do kit "Cozinha" (casa.md §5), em pixel art, nas direções que o kit declara.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada; 'dir' sai espelhado).
   Paleta: armários menta, fogão rosa retrô, geladeira branca com ímãs, toques de coral e amarelo. Sem DOM. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado, usos = R.CasaArte.objeto;

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
  var CH1 = '#ff8a3d', CH2 = '#ffd34d', CHB = '#7fc8ff';
  // chama de uma boca: base laranja com miolo amarelo e pé azul (estático); a animação cresce e treme por cima
  function chama(p, x, y, alt) { p.r(x, y + 2 - alt, 3, alt, CH1); p.r(x + 1, y + 3 - alt, 1, alt - 1, CH2); p.r(x, y + 2, 3, 1, CHB); }
  function chamas(y, x0, x1) {
    return function (p, t) {
      var a = Math.floor(t / 130), q = [2, 3, 2, 4][a % 4], r = [3, 2, 4, 2][a % 4];
      p.r(x0 + 1, y - q, 1, 1, CH2); p.r(x1 + 1, y - r, 1, 1, CH2); p.r(x0, y - q + 1, 1, 1, CH1); p.r(x1 + 2, y - r + 1, 1, 1, CH1);
    };
  }
  var FOGO_ON = {
    baixo: function (p) { chama(p, 2, -7, 3); chama(p, 11, -7, 3); [3, 12].forEach(function (x) { p.r(x, -4, 3, 1, CH1); p.r(x + 1, -3, 1, 1, CH2); }); },
    cima: function (p) { chama(p, 2, -9, 3); chama(p, 11, -9, 3); },
    lado: function (p) { chama(p, 4, -7, 3); p.r(4, -3, 3, 1, CH1); p.r(5, -2, 1, 1, CH2); },
    anim: { baixo: function (p, t) { chamas(-6, 2, 11)(p, t); }, cima: function (p, t) { chamas(-8, 2, 11)(p, t); }, lado: function (p, t) { chamas(-6, 4, 4)(p, t); } },
  };
  usos('casa-cozinha-fogao', { w: 1, h: 1, topo: 10, solido: true, alto: true, desenhar: virado({
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
  }) }, FOGO_ON);

  /* ----- geladeira branca 1×1 com ímãs e um desenho ----- */
  var FRIO = '#e9fbff', FRIO2 = '#c8eef9';
  var GEL_ON = {
    baixo: function (p) {   // porta de baixo aberta (de lado, à esquerda): prateleiras com comidinhas e luz
      p.r(0, -9, 16, 24, K); p.r(3, -8, 12, 20, FRIO); p.r(3, -8, 12, 1, C.branco); p.r(0, -8, 3, 22, K); p.r(1, -7, 1, 20, GEL);
      p.r(0, -1, 1, 6, C.metal2); p.r(3, 3, 12, 1, K); p.r(3, 8, 12, 1, K); p.r(3, -3, 12, 1, K); p.r(14, -8, 1, 20, FRIO2);
      p.m(4, -7, ['.kk.', 'kbbk', 'kwwk', 'kwwk', 'kkkk'], { k: K, b: '#5fb4ff', w: C.branco });          // caixa de leite
      p.m(9, -6, ['.g.', 'krk', 'rrr', 'krk'], { k: K, g: C.folha3, r: '#ff5c6a' });                      // maçã
      p.m(4, -2, ['kkkkkk', 'kyyyyk', 'kyokyk', 'kkkkkk'].slice(0, 4), { k: K, y: AMAR, o: '#ff8a3d' });    // queijo
      p.m(11, -2, ['.kkk', 'kppk', 'kwwk', 'kkkk'], { k: K, p: '#ff9cc6', w: C.branco });                  // bolinho
      p.m(5, 4, ['.kkkk.', 'kccccck', 'kcccck.', '.kkkk..'].slice(0, 3), { k: K, c: '#ffb35c' }); p.m(11, 4, ['.g.', 'ggg', 'kgk'], { k: K, g: C.verde });
      p.r(4, 9, 10, 3, '#9fdcff'); p.r(4, 9, 10, 1, C.branco); p.r(5, 13, 8, 1, C.metal);
    },
    cima: function (p) { p.r(13, -9, 3, 22, K); p.r(14, -8, 1, 20, C.branco); p.r(13, 4, 1, 3, C.metal2); },
    lado: function (p) {
      p.r(0, -9, 4, 22, K); p.r(1, -8, 2, 20, FRIO); p.r(1, -3, 2, 1, K); p.r(1, 3, 2, 1, K); p.r(1, 8, 2, 1, K);
      p.r(1, -6, 1, 2, '#ff5c6a'); p.r(2, -2, 1, 2, AMAR); p.r(1, 4, 2, 2, C.branco); p.r(1, 9, 2, 2, '#9fdcff');
    },
    anim: {   // ar frio saindo pela porta aberta
      baixo: function (p, t) {
        [0, 1, 2].forEach(function (i) {
          var u = (t / 90 + i * 5) % 14;
          p.r(4 + i * 4 + (u > 7 ? 1 : 0), 12 + Math.floor(u / 2), 2, 1, i === 1 ? C.branco : FRIO2);
        });
      },
      cima: function (p, t) { var u = Math.floor(t / 120) % 4; p.r(13, 14 - u, 1, 1, FRIO2); p.r(15, 15 - u, 1, 1, C.branco); },
      lado: function (p, t) { var u = Math.floor(t / 120) % 4; p.r(1, 14 - u, 1, 1, FRIO2); p.r(2, 13 - u, 1, 1, C.branco); },
    },
  };
  usos('casa-cozinha-geladeira', { w: 1, h: 1, topo: 22, solido: true, alto: true, desenhar: virado({
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
  }) }, GEL_ON);

  /* ----- pia 2×1: armário menta, cuba, torneira e um paninho ----- */
  function torneira(p, x, y) { p.r(x, y, 2, 6, K); p.r(x, y, 5, 2, K); p.r(x + 3, y, 2, 3, K); p.r(x + 1, y + 1, 1, 4, C.metal); }
  var AG = '#6ec8f0', AG2 = '#c8f0ff';
  // pingos que caem de x (dois fios) entre y0 e y1, defasados no tempo
  function fio(p, x, y0, y1, t) {
    var h = y1 - y0, u = Math.floor(t / 60) % 4;
    for (var y = y0 + u % 2; y < y1; y += 2) p.r(x + ((y - y0 + u) % 4 === 0 ? 0 : 1), y, 1, 1, AG2);
    p.r(x - 1 + (u % 2) * 3, y1 - 1, 1, 1, AG2); p.r(x + 1 + (u % 2) * -2, y1 - 2 - (h > 5 ? 1 : 0), 1, 1, AG);
  }
  var PIA_ON = {
    baixo: function (p) { p.r(14, -9, 2, 5, AG); p.r(14, -9, 1, 5, AG2); p.r(8, -3, 10, 2, AG); p.r(9, -3, 3, 1, C.branco); p.r(15, -4, 2, 1, C.branco); },
    cima: function (p) { p.r(14, -6, 10, 2, AG); p.r(16, -6, 3, 1, C.branco); p.r(20, -5, 3, 1, AG2); },
    lado: function (p) { p.r(9, -6, 2, 5, AG); p.r(9, -6, 1, 5, AG2); p.r(4, 2, 5, 6, AG); p.r(5, 3, 2, 1, C.branco); p.r(7, 6, 1, 1, C.branco); },
    anim: {
      baixo: function (p, t) { fio(p, 14, -9, -3, t); },
      cima: function (p, t) { var u = Math.floor(t / 150) % 3; p.r(15 + u * 3, -6, 2, 1, C.branco); p.r(22 - u * 3, -5, 1, 1, C.branco); },
      lado: function (p, t) { fio(p, 9, -6, 2, t); var u = Math.floor(t / 150) % 3; p.r(5 + u, 4 + u, 1, 1, C.branco); },
    },
  };
  usos('casa-cozinha-pia', { w: 2, h: 1, topo: 12, solido: true, alto: true, desenhar: virado({
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
  }) }, PIA_ON);

  /* ----- armário alto 2×1 menta com potes em cima ----- */
  var DENTRO = '#6bb8a6';
  var ARM_ON = {
    baixo: function (p) {   // as duas portas abertas de lado, prateleiras com potes
      p.r(3, -11, 26, 23, K); p.r(4, -10, 24, 21, DENTRO); p.r(4, -10, 24, 1, clarear(DENTRO, 0.4)); p.r(4, -10, 1, 21, clarear(DENTRO, 0.2));
      p.r(4, -2, 24, 1, K); p.r(4, -1, 24, 1, escurecer(DENTRO, 0.25)); p.r(4, 6, 24, 1, K); p.r(4, 7, 24, 1, escurecer(DENTRO, 0.25));
      p.r(0, -12, 3, 25, K); p.r(1, -11, 1, 23, MENTA); p.r(29, -12, 3, 25, K); p.r(30, -11, 1, 23, MENTA);
      p.m(6, -7, ['.kk.', 'krrk', 'krrk', 'kkkk'], { k: K, r: CORAL }); p.m(12, -8, ['kkkk', 'kwwk', 'kwwk', 'kwwk', 'kkkk'], { k: K, w: C.branco });
      p.m(19, -7, ['.kk.', 'kyyk', 'kyyk', 'kkkk'], { k: K, y: AMAR }); p.m(24, -6, ['kkk', 'kbk', 'kbk', 'kkk'], { k: K, b: '#5fb4ff' });
      p.m(7, 1, ['kkkkk', 'kgggk', 'kgggk', 'kkkkk'], { k: K, g: C.verde }); p.m(15, 1, ['.kkk.', 'kcccc', 'kcccc', '.kkk.'].map(function (l) { return l.slice(0, 5); }), { k: K, c: CORAL });
      p.m(22, 2, ['kkk', 'kyk', 'kkk'], { k: K, y: C.ouro3 }); p.m(6, 9, ['kkkk', 'kppk', 'kkkk'], { k: K, p: '#ff9cc6' }); p.m(20, 8, ['.kkk.', 'kwwwk', 'kkkkk'], { k: K, w: C.creme });
    },
    cima: function (p) { p.r(0, -12, 2, 25, K); p.r(1, -11, 1, 23, MENTA); p.r(30, -12, 2, 25, K); p.r(30, -11, 1, 23, MENTA); },
    lado: function (p) {
      p.r(2, -11, 4, 41, K); p.r(3, -10, 2, 39, DENTRO); p.r(3, -3, 2, 1, K); p.r(3, 14, 2, 1, K); p.r(3, 22, 2, 1, K);
      p.r(3, -8, 2, 3, CORAL); p.r(3, 0, 2, 3, C.branco); p.r(3, 8, 2, 3, AMAR); p.r(3, 16, 2, 3, '#5fb4ff'); p.r(3, 25, 2, 3, CORAL);
      p.r(0, -10, 2, 39, K); p.r(0, -9, 1, 37, MENTA);
    },
  };
  usos('casa-cozinha-armario', { w: 2, h: 1, topo: 18, solido: true, alto: true, desenhar: virado({
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
  }) }, ARM_ON);

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
