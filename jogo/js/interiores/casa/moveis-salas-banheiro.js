/* Casa do jogador: os móveis avulsos de Banheiro (casa.md §12; dados em js/conteudo/casa/moveis-salas.js), em pixel art.
   baixo = de frente, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var AGUA = '#8fd8f0', AMAR = '#ffd34d', LARANJA = '#ff9f43', ROSA = '#ffb3c7', MENTA = '#7fe0c8', LIL = '#c9a8ff';
  var AZUL = '#8fc8ff', CORAL = '#ff8a7a', MAD = '#e0b07a', VERDE = '#5fc46a', VERDE2 = '#3e9a4f', LOUCA = '#fbfbff';

  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, escurecer(c, 0.2));
      },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
    };
    return p;
  }
  // patinho de borracha (10×7): cabeça redonda, bico laranja à esquerda, corpo com rabinho
  function patinho(p, x, y, cor) {
    p.m(x, y, ['..kkk.....', '.kyyyk..kk', 'lkyeyk.kyk', 'kkkyykkyyk', '.kyyyyyyyk', '.kyyyyyyk.', '..kkkkkk..'],
      { k: K, y: cor, e: K, l: LARANJA });
    p.r(x + 2, y + 1, 1, 1, clarear(cor, 0.5));
  }

  /* ----- patinhos de borracha numa bacia 1×1 ----- */
  I.objeto('casa-movel-patinhos', { w: 1, h: 1, topo: 2, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    patinho(p, 0, -2, AMAR); patinho(p, 6, -2, ROSA);
    p.r(0, 4, 16, 2, K); p.r(1, 4, 14, 1, AGUA); p.r(3, 4, 2, 1, C.branco); p.r(10, 4, 2, 1, C.branco);
    p.r(1, 6, 14, 7, K); p.r(2, 6, 12, 6, MENTA); p.r(2, 6, 12, 1, clarear(MENTA, 0.4));
    p.r(2, 10, 12, 1, escurecer(MENTA, 0.2)); p.r(3, 13, 10, 1, K);
    p.r(6, 8, 1, 1, C.branco); p.r(9, 8, 1, 1, C.branco);
  } });

  /* ----- samambaia no vaso 1×1 ----- */
  I.objeto('casa-movel-samambaia', { w: 1, h: 1, topo: 12, solido: true, alto: true, desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.m(0, -12, [
      '.....k..k.......',
      '...kkgk.kgk.k...',
      '..kgglkkgglkgk..',
      '.kgglgkgglgkglk.',
      'kgglgkgglgkglggk',
      'kglgkgglgkgglglk',
      '.kgkgglggkgglgk.',
      'kgglgglggglglggk',
      'kglk.kgggglk.klk',
      '.k...kgddgk...k.',
    ], { k: K, g: VERDE, l: clarear(VERDE, 0.4), d: VERDE2 });
    p.caixa(3, -2, 10, 3, CORAL);
    p.r(4, 1, 8, 12, K); p.r(5, 1, 6, 11, ROSA); p.r(5, 1, 1, 10, clarear(ROSA, 0.4));
    p.r(6, 5, 4, 2, C.branco); p.r(7, 5, 2, 2, CORAL);                 // florzinha pintada
    p.r(5, 12, 6, 1, K);
  } });

  /* ----- pilha de toalhas coloridas num banquinho 1×1 ----- */
  I.objeto('casa-movel-toalhas', { w: 1, h: 1, topo: 6, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    function toalha(y, cor) {
      p.r(2, y, 12, 4, K); p.r(3, y + 1, 10, 2, cor); p.r(3, y + 1, 10, 1, clarear(cor, 0.4));
      p.r(1, y + 1, 2, 2, K); p.r(13, y + 1, 2, 2, K);
    }
    toalha(-6, LIL); toalha(-3, MENTA); toalha(0, ROSA); toalha(3, AMAR);
    p.r(5, -2, 6, 1, C.branco);                                         // listrinha
    p.r(1, 7, 14, 3, K); p.r(2, 7, 12, 1, clarear(MAD, 0.3)); p.r(2, 8, 12, 1, MAD);
    p.r(2, 10, 2, 5, K); p.r(12, 10, 2, 5, K); p.r(4, 12, 8, 1, K);
  } });

  /* ----- balança baixinha 1×1 ----- */
  I.objeto('casa-movel-balanca', { w: 1, h: 1, topo: 0, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.caixa(1, 3, 14, 11, LOUCA);
    p.r(4, 4, 8, 4, K); p.r(5, 5, 6, 2, '#d8f6e8'); p.r(7, 5, 2, 1, K); p.r(7, 6, 1, 1, CORAL);  // visor
    p.r(3, 9, 4, 3, AZUL); p.r(9, 9, 4, 3, AZUL);                       // pezinhos pintados
    p.r(3, 9, 4, 1, clarear(AZUL, 0.4)); p.r(9, 9, 4, 1, clarear(AZUL, 0.4));
    p.r(2, 14, 12, 1, escurecer(LOUCA, 0.3));
  } });

  /* ----- quadro de concha na parede 1×2 ----- */
  I.objeto('casa-movel-quadro-concha', { w: 1, h: 2, parede: true, solido: false, desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.r(7, 4, 2, 2, K);
    p.caixa(1, 6, 14, 20, MAD);
    p.r(3, 8, 10, 16, K); p.r(4, 9, 8, 14, AZUL); p.r(4, 19, 8, 4, '#f6e2b0');   // mar e areia
    p.m(4, 10, [                                                        // vieira: nervuras em leque
      '.kkkkkk.',
      'kplplplk',
      'kplplplk',
      '.kplplk.',
      '..kplk..',
      '.kkkkkk.',
      '.kppppk.',
      '.kkkkkk.',
    ], { k: K, p: ROSA, l: clarear(ROSA, 0.5) });
    p.r(10, 20, 1, 1, CORAL); p.r(5, 21, 2, 1, C.branco);              // estrelinha e espuma
  } });

  /* ----- banco de banho 1×1 (2 direções) ----- */
  I.objeto('casa-movel-banco-banho', { w: 1, h: 1, topo: 4, solido: 'base', desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(0, -4, 16, 5, MENTA);
      [3, 7, 11].forEach(function (x) { p.r(x, -2, 2, 1, escurecer(MENTA, 0.3)); });   // furinhos
      p.r(2, 1, 3, 13, K); p.r(3, 1, 1, 12, LOUCA);
      p.r(11, 1, 3, 13, K); p.r(12, 1, 1, 12, LOUCA);
      p.r(5, 8, 6, 2, K); p.r(5, 8, 6, 1, LOUCA);
      p.r(1, 14, 5, 2, K); p.r(10, 14, 5, 2, K);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(3, -4, 10, 5, MENTA);
      p.r(5, -2, 2, 1, escurecer(MENTA, 0.3)); p.r(9, -2, 2, 1, escurecer(MENTA, 0.3));
      p.r(4, 1, 3, 13, K); p.r(5, 1, 1, 12, LOUCA);
      p.r(9, 1, 3, 13, K); p.r(10, 1, 1, 12, escurecer(LOUCA, 0.3));
      p.r(3, 14, 5, 2, K); p.r(8, 14, 5, 2, K);
    },
  }) });
})();
