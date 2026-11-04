/* Casa do jogador: os móveis avulsos de Banheiro (casa.md §12; dados em js/conteudo/casa/moveis-salas.js), em pixel art.
   baixo = de frente, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, CA = R.CasaArte, virado = CA.virado;

  var AGUA = '#8fd8f0', AMAR = '#ffd34d', LARANJA = '#ff9f43', ROSA = '#ffb3c7', MENTA = '#7fe0c8', LIL = '#c9a8ff';
  var AZUL = '#8fc8ff', CORAL = '#ff8a7a', MAD = '#e0b07a', VERDE = '#5fc46a', VERDE2 = '#3e9a4f', LOUCA = '#fbfbff';

  /* ----- estados dos avulsos com uso (casa.md §13): ligado = Reino.CasaUsos.ligado(obj); sem uid (capa, prancha, fantasma)
     e desligado ficam como sempre. O quadro de animação (`anim`) só ACRESCENTA pixels: ctx do móvel alto tem só
     fillStyle/fillRect; o baixo recebe o canvas de verdade (clearRect liberado). ----- */
  CA.ligado = function (obj) { return !!(obj && obj.uid && R.CasaUsos && R.CasaUsos.ligado(obj)); };
  // contexto espelhado para a direção 'dir' (o lado desenhado para a esquerda, virado ao contrário)
  function espelho(ctx, px, W) {
    return { set fillStyle(c) { ctx.fillStyle = c; }, get fillStyle() { return ctx.fillStyle; },
      fillRect: function (x, y, w, h) { ctx.fillRect(2 * px + W - x - w, y, w, h); } };
  }
  // anim por direção ({baixo, cima?, lado?}, cada uma f(ctx, px, py, t, obj)); só roda ligado
  CA.animPorDir = function (d) {
    return function (ctx, px, py, t, obj) {
      if (!CA.ligado(obj)) return;
      var dir = obj.dir || 'baixo', f = dir === 'cima' ? (d.cima || d.baixo) : dir === 'esq' || dir === 'dir' ? (d.lado || d.baixo) : d.baixo;
      f(dir === 'dir' ? espelho(ctx, px, obj.w * 16) : ctx, px, py, t, obj);
    };
  };
  // móvel baixo cujo desenho muda de verdade: ligado, o desenho estático sai (CasaUsos.ligar já refaz o estático) e a anim
  // desenha o móvel inteiro, chamando f(ctx, px, py, t, obj, desenharOriginal). Nada de clearRect: o buffer da cena não é só dele
  CA.refazer = function (def, f) {
    var orig = def.desenhar;
    def.desenhar = function (ctx, px, py, obj, P) { if (!CA.ligado(obj)) return orig.call(this, ctx, px, py, obj, P); };
    def.anim = function (ctx, px, py, t, obj) { if (CA.ligado(obj)) f(ctx, px, py, t, obj, orig); };
  };

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

  /* ----- patinhos de borracha numa bacia 1×1 (ligado: balançam na água e soltam bolhas) ----- */
  var BOB = [0, 0];
  var patinhos = I.objeto('casa-movel-patinhos', { w: 1, h: 1, topo: 2, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    patinho(p, 0, -2 + BOB[0], AMAR); patinho(p, 6, -2 + BOB[1], ROSA);
    p.r(0, 4, 16, 2, K); p.r(1, 4, 14, 1, AGUA); p.r(3, 4, 2, 1, C.branco); p.r(10, 4, 2, 1, C.branco);
    p.r(1, 6, 14, 7, K); p.r(2, 6, 12, 6, MENTA); p.r(2, 6, 12, 1, clarear(MENTA, 0.4));
    p.r(2, 10, 12, 1, escurecer(MENTA, 0.2)); p.r(3, 13, 10, 1, K);
    p.r(6, 8, 1, 1, C.branco); p.r(9, 8, 1, 1, C.branco);
  } });
  CA.refazer(patinhos, function (ctx, px, py, t, obj, orig) {
    var f = Math.floor(t / 300) % 4, p = pincel(ctx, px, py);
    BOB = [[0, -1, 0, 1][f], [0, 1, 0, -1][f]];
    orig(ctx, px, py, obj); BOB = [0, 0];
    [[3, 0], [11, 3]].forEach(function (b) {                                  // bolhas claras subindo ao lado e acima dos patos
      var k = (Math.floor(t / 250) + b[1]) % 6;
      if (k < 5) { p.r(b[0] + (k & 1), -3 - k, 2, 2, '#e8fbff'); p.r(b[0] + 1 + (k & 1), -2 - k, 1, 1, AGUA); }
    });
  });

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
  var balanca = I.objeto('casa-movel-balanca', { w: 1, h: 1, topo: 0, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.caixa(1, 3, 14, 11, LOUCA);
    p.r(4, 4, 8, 4, K); p.r(5, 5, 6, 2, '#d8f6e8'); p.r(7, 5, 2, 1, K); p.r(7, 6, 1, 1, CORAL);  // visor
    p.r(3, 9, 4, 3, AZUL); p.r(9, 9, 4, 3, AZUL);                       // pezinhos pintados
    p.r(3, 9, 4, 1, clarear(AZUL, 0.4)); p.r(9, 9, 4, 1, clarear(AZUL, 0.4));
    p.r(2, 14, 12, 1, escurecer(LOUCA, 0.3));
  } });
  balanca.anim = function (ctx, px, py, t, obj) {                                // ligado: o ponteiro vai e volta no visor
    if (!CA.ligado(obj)) return;
    var p = pincel(ctx, px, py), f = Math.floor(t / 110) % 10, x = f < 5 ? f : 9 - f;
    p.r(5, 5, 6, 2, '#d8f6e8');
    p.r(5 + x, 5, 1, 1, K); p.r(5 + x, 6, 1, 1, CORAL);
  };

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
  /* ----- chuveiro (pedido de 03/11/2026): box 2×2 de azulejo, cano e ducha no alto, porta de vidro; sem 4 direções.
     Ligado: névoa e gotas no vidro (no desenho) e água caindo (anim). A parte da frente do box fica livre para quem toma banho ----- */
  var METAL = '#cfd8e6', METAL2 = '#9fb0c8', AZULEJO = '#bfe3f2', BOX = [7, 9, 11, 13, 15];
  var chuveiro = I.objeto('casa-movel-chuveiro', { w: 2, h: 2, topo: 20, solido: true, alto: true, desenhar: function (ctx, px, py, obj) {
    var p = pincel(ctx, px, py), y, b, i;
    p.r(0, -16, 32, 47, K); p.r(3, -16, 26, 38, AZULEJO);                              // fundo de azulejo
    for (b = 0; b < 5; b++) {
      y = -16 + b * 8; p.r(3, y, 26, 1, escurecer(AZULEJO, 0.18));
      for (i = b % 2 ? 9 : 15; i < 29; i += 12) p.r(i, y, 1, 8, escurecer(AZULEJO, 0.18));
    }
    p.r(3, -15, 26, 1, clarear(AZULEJO, 0.5));
    p.caixa(0, -20, 32, 5, METAL); p.r(1, -16, 1, 47, clarear(METAL, 0.3)); p.r(30, -16, 1, 47, METAL2);   // moldura
    p.r(21, -15, 3, 8, K); p.r(22, -15, 1, 8, METAL);                                 // cano
    p.r(11, -9, 13, 3, K); p.r(12, -8, 12, 1, METAL);                                 // braço da ducha
    p.r(5, -6, 12, 4, K); p.r(6, -5, 10, 2, METAL); p.r(6, -5, 10, 1, clarear(METAL, 0.5));   // cabeça da ducha
    for (i = 7; i < 16; i += 2) p.r(i, -3, 1, 1, METAL2);                           // furinhos
    p.r(23, 8, 5, 5, K); p.r(24, 9, 3, 3, CORAL); p.r(25, 10, 1, 1, C.branco);           // registro
    p.r(8, 17, 4, 5, K); p.r(9, 18, 2, 3, ROSA); p.r(9, 15, 2, 2, K);                    // frasco de sabonete
    p.r(0, 22, 32, 10, K); p.r(3, 23, 26, 4, '#eef7fb');                                // bandeja do piso
    p.r(1, 27, 30, 4, METAL); p.r(1, 27, 30, 1, clarear(METAL, 0.4)); p.r(1, 30, 30, 1, escurecer(METAL, 0.25));
    p.r(14, 24, 4, 2, K); p.r(15, 24, 2, 1, METAL2);                                    // ralo
    p.r(16, -14, 13, 1, K); p.r(16, 21, 13, 1, K); p.r(16, -14, 1, 36, K); p.r(28, -14, 1, 36, K);   // porta de vidro (a metade livre fica aberta)
    p.r(17, 2, 1, 6, METAL);
    [[19, -9], [22, 5], [19, 13]].forEach(function (g) { for (i = 0; i < 5; i++) p.r(g[0] + i, g[1] - i, 1, 1, C.branco); });   // reflexos
    if (CA.ligado(obj)) {
      for (y = -13; y < 21; y += 2) for (i = 17 + (y & 2 ? 1 : 0); i < 28; i += 2) p.r(i, y, 1, 1, C.branco);     // névoa no vidro
      p.r(20, -4, 1, 3, AGUA); p.r(25, 3, 1, 3, AGUA); p.r(22, 12, 1, 3, AGUA);                                    // gotas escorrendo
    }
  } });
  chuveiro.anim = function (ctx, px, py, t, obj) {
    if (!CA.ligado(obj)) return;
    var p = pincel(ctx, px, py), n = Math.floor(t / 45), j, yy;
    BOX.forEach(function (x, c) {                                                    // fios de água caindo da ducha
      for (yy = -2 + (n + c * 2) % 6; yy < 20; yy += 6) p.r(x, yy, 1, 3, c % 2 ? AGUA : '#b8ecfa');
    });
    for (j = 0; j < 4; j++) p.r(5 + ((n + j * 3) % 4) * 4 + j, 21 - ((n + j) % 2), 1, 1, C.branco);   // respingos no piso
  };
})();
