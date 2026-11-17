/* Casa do jogador: os enfeites da loja Casa Bonita (Vila Arco-Íris; dados em js/conteudo/casa/moveis-loja.js), parte A:
   os 17 de parede (quadros de vários temas, pratinhos, varal de festa, relógio maçã, utensílios, espelho sol,
   estrela-do-mar, móbiles e guirlanda). Item de parede não gira: só `baixo`, na pegada w×2 das 2 fileiras da parede.
   Quadros pela família `quadro` (moldura + cena). Sem movimento (casa.md §13.7). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, circulo = D.circulo, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores;

  var MAD = '#d99a5b', OURO = C.ouro, ROSA = '#ff8fc4', LIL = '#c9a8ff', CEU = '#bfe9ff', MAR = '#5fb4ff';
  var PRATA = '#c9d2e3', VERDE = '#7fe08a', FOLHA = C.folha3, NOITE = '#2e2a5e';

  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
      c: function (x, y, raio, c) { circulo(ctx, px + x, py + y, raio, c); },
    };
    return p;
  }
  /* anel (ou disco, com dentro 0) pixel a pixel: contorno na borda de fora e na de dentro, cor(d) pela distância */
  function anel(p, cx, cy, fora, dentro, cor) {
    function em(i, j) { var d = Math.sqrt((i - cx) * (i - cx) + (j - cy) * (j - cy)); return d <= fora + 0.3 && d >= dentro - 0.3; }
    for (var j = cy - fora - 1; j <= cy + fora + 1; j++) for (var i = cx - fora - 1; i <= cx + fora + 1; i++) {
      if (!em(i, j)) continue;
      var borda = !em(i - 1, j) || !em(i + 1, j) || !em(i, j - 1) || !em(i, j + 1);
      p.r(i, j, 1, 1, borda ? K : cor(Math.sqrt((i - cx) * (i - cx) + (j - cy) * (j - cy)), i - cx, j - cy));
    }
  }
  function parede(id, w, desenho) {
    I.objeto('casa-movel-' + id, { w: w, h: 2, parede: true, solido: false,
      desenhar: function (ctx, px, py) { desenho(pincel(ctx, px, py)); } });
  }
  // prego com o fio em V até os cantos de cima da moldura
  function prego(p, cx, y, abre) {
    p.r(cx - 1, y, 2, 2, K);
    for (var i = 1; i <= abre; i++) { p.r(cx - 1 - i, y + 1 + Math.round(i / 2), 1, 1, K); p.r(cx + i, y + 1 + Math.round(i / 2), 1, 1, K); }
  }
  /* quadro: moldura (contorno, borda de `b` px na cor com luz em cima e à esquerda) e a cena desenhada no miolo;
     cena(p, x, y, w, h) recebe o retângulo do miolo */
  function quadro(p, x, y, w, h, cor, b, fundo, cena) {
    prego(p, x + (w >> 1), y - 4, 3);
    p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, cor);
    p.r(x + 1, y + 1, w - 2, 1, clarear(cor, 0.5)); p.r(x + 1, y + 2, 1, h - 3, clarear(cor, 0.25));
    p.r(x + 2, y + h - 2, w - 3, 1, escurecer(cor, 0.25)); p.r(x + w - 2, y + 2, 1, h - 3, escurecer(cor, 0.15));
    var mx = x + 1 + b, my = y + 1 + b, mw = w - 2 - 2 * b, mh = h - 2 - 2 * b;
    p.r(mx - 1, my - 1, mw + 2, mh + 2, escurecer(cor, 0.4));
    p.r(mx, my, mw, mh, fundo);
    cena(p, mx, my, mw, mh);
  }
  // os dois tamanhos de quadro: 1×2 (miolo 10×16) e 2×2 (miolo 22×16)
  function quadroAlto(p, cor, fundo, cena) { quadro(p, 1, 7, 14, 20, cor, 1, fundo, cena); }
  function quadroLargo(p, cor, fundo, cena) { quadro(p, 2, 6, 28, 22, cor, 2, fundo, cena); }

  /* ----- quadro do mar (estar, 2×2): veleiro, sol e nuvem ----- */
  parede('quadro-mar', 2, function (p) {
    quadroLargo(p, MAD, CEU, function (p, x, y) {
      p.r(x, y + 10, 22, 6, MAR); p.r(x, y + 10, 22, 1, clarear(MAR, 0.5));
      [[2, 12], [9, 14], [15, 12], [19, 14]].forEach(function (o) { p.r(x + o[0], y + o[1], 3, 1, C.branco); });
      p.m(x + 16, y + 1, ['.yyy.', 'yyyyy', 'yyyyy', '.yyy.'], { y: OURO });
      p.m(x + 2, y + 2, ['.ww...', 'wwwww.', '.wwwww'], { w: C.branco });
      p.m(x + 6, y + 2, [
        '....kr...', '....kkr..', '...kwk...', '..kwwk...', '.kwwwk...', 'kwwwwk...', 'kkkkkkkk.', 'kmmmmmmmk', '.kmmmmmk.',
      ], { k: K, w: C.branco, r: '#ff5c6a', m: '#c98a4b' });
    });
  });

  /* ----- quadro gatinho (estar, 1×2): gato laranja num fundo rosa ----- */
  parede('quadro-gato', 1, function (p) {
    quadroAlto(p, LIL, '#ffd6e8', function (p, x, y) {
      p.m(x, y + 3, [
        '.kk....kk.', 'kpok..kopk', 'koookkoook', 'kooooooook', 'kooeooeook', 'kOOOnnOOOk', '.kOOkkOOk.', '..kooook..',
        '.kooooook.', 'kooOOOOook', 'kooOOOOook', 'kooOOOOook', '.kkkkkkkk.',
      ], { k: K, o: '#ffb35c', O: '#ffe2b8', p: ROSA, e: K, n: ROSA });
    });
  });

  /* ----- quadro do bolo (jantar, 1×2): bolo com vela num fundo verde-água ----- */
  parede('quadro-bolo', 1, function (p) {
    quadroAlto(p, OURO, '#d6f7ec', function (p, x, y) {
      p.m(x, y + 1, [
        '....y.....', '...yoy....', '....k.....', '....b.....', '....b.....', '.kkkkkkkk.', 'kwwwwwwwwk', 'kwwpwwwpwk',
        'kppppppppk', 'kcccccccck', 'kppppppppk', 'kkkkkkkkkk', '.kssssssk.', '...kssk...', '..kkkkkk..',
      ], { k: K, y: OURO, o: '#ff8a3d', b: MAR, w: C.branco, p: ROSA, c: '#fff1d6', s: PRATA });
    });
  });

  /* ----- pratinhos de parede (jantar, 2×2): um prato grande e dois pequenos, pintados ----- */
  function prato(p, cx, cy, raio, borda, miolo) {
    prego(p, cx, cy - raio - 3, 0); p.r(cx - 1, cy - raio - 1, 1, 1, K);
    anel(p, cx, cy, raio, 0, function (d) { return d > raio - 1.2 ? C.branco : d > raio - 2.4 ? borda : C.creme; });
    p.r(cx - raio + 2, cy - raio + 3, 1, 2, C.branco);
    miolo(cx, cy);
  }
  parede('pratos-parede', 2, function (p) {
    prato(p, 16, 13, 8, MAR, function (cx, cy) {                                   // flor azul
      p.m(cx - 3, cy - 3, ['..b..', '.bbb.', 'bbybb', '.bbb.', '..b..', '..g..', '.gg..'], { b: MAR, y: OURO, g: FOLHA });
    });
    prato(p, 6, 24, 5, ROSA, function (cx, cy) { p.r(cx - 1, cy - 1, 3, 3, ROSA); p.r(cx, cy, 1, 1, C.branco); });
    prato(p, 26, 24, 5, OURO, function (cx, cy) { p.m(cx - 1, cy - 1, ['.r.', 'rrr', '.r.'], { r: '#ff5c6a' }); });
  });

  /* ----- varal de festa (jantar, 2×2): dois cordões de bandeirinhas coloridas ----- */
  var BANDEIRA = ['kkkkkk', 'kcccck', 'kcccck', '.kcck.', '.kcck.', '..kk..'];
  var CORES_FESTA = ['#ff5c6a', OURO, MAR, VERDE, ROSA, '#ff8a3d', LIL];
  function cordao(p, y0, cai, desloca) {
    var alt = function (x) { return y0 + Math.round(cai * Math.sin(Math.PI * x / 31)); };
    for (var x = 0; x < 32; x++) p.r(x, alt(x), 1, 1, K);
    for (var i = 0, bx = 1 + desloca; bx + 6 <= 32; i++, bx += 7) {
      var c = CORES_FESTA[(i + desloca) % CORES_FESTA.length];
      p.m(bx, alt(bx + 3), BANDEIRA, { k: K, c: c });
      p.r(bx + 1, alt(bx + 3) + 1, 4, 1, clarear(c, 0.4));
    }
  }
  parede('varal-festa', 2, function (p) {
    p.r(0, 3, 2, 3, K); p.r(30, 3, 2, 3, K);                                      // os pregos das pontas
    cordao(p, 4, 4, 0);
    cordao(p, 16, 4, 3);
  });

  /* ----- relógio maçã (cozinha, 1×2): relógio redondo vermelho com folhinha ----- */
  parede('relogio-maca', 1, function (p) {
    p.r(8, 6, 1, 3, K); p.m(9, 5, ['kkk.', 'kggk', '.kk.'], { k: K, g: VERDE });
    p.c(8, 17, 7, K); p.c(8, 17, 6, '#ff5c6a');
    p.r(4, 12, 2, 1, clarear('#ff5c6a', 0.5)); p.r(3, 13, 1, 2, clarear('#ff5c6a', 0.5));
    p.c(8, 17, 4, K); p.c(8, 17, 3, C.creme);
    p.r(8, 14, 1, 1, K); p.r(8, 20, 1, 1, K); p.r(5, 17, 1, 1, K); p.r(11, 17, 1, 1, K);   // as horas
    p.r(8, 15, 1, 3, K); p.r(9, 17, 2, 1, K);                                     // os ponteiros
    p.r(4, 24, 9, 1, escurecer('#ff5c6a', 0.3));
  });

  /* ----- quadro cupcake (cozinha, 1×2) ----- */
  parede('quadro-cupcake', 1, function (p) {
    quadroAlto(p, '#7fd6ff', '#fff3c4', function (p, x, y) {
      p.m(x, y + 2, [
        '....kk....', '...krrk...', '...kkkk...', '..kppppk..', '.kppwpppk.', 'kppppppwpk', 'kpwppppppk', 'kkkkkkkkkk',
        '.kbBbBbBk.', '.kbBbBbBk.', '..kbBbBk..', '..kkkkkk..',
      ], { k: K, r: '#ff5c6a', p: ROSA, w: C.branco, b: '#7fc8ff', B: '#c9ecff' });
    });
  });

  /* ----- utensílios (cozinha, 1×2): barra de madeira com concha, espátula e batedor ----- */
  parede('utensilios', 1, function (p) {
    p.r(0, 7, 16, 4, K); p.r(1, 8, 14, 2, MAD); p.r(1, 8, 14, 1, clarear(MAD, 0.4));
    [3, 8, 12].forEach(function (x) { p.r(x, 11, 1, 1, K); });
    // concha de metal
    p.r(2, 12, 3, 10, K); p.r(3, 12, 1, 10, PRATA); p.c(3, 24, 3, K); p.c(3, 24, 2, PRATA); p.r(2, 23, 1, 1, C.branco);
    // espátula de madeira
    p.r(7, 12, 3, 9, K); p.r(8, 12, 1, 9, '#c98a4b'); p.r(6, 20, 5, 7, K); p.r(7, 21, 3, 5, '#e8b27a'); p.r(7, 21, 1, 3, clarear('#e8b27a', 0.4));
    // batedor de arame
    p.r(11, 12, 3, 5, K); p.r(12, 12, 1, 5, ROSA);
    p.m(10, 17, ['.kkk.', 'k.k.k', 'k.k.k', 'k.k.k', 'k.k.k', '.kkk.'], { k: K });
  });

  /* ----- quadro farol (banheiro, 1×2): farol listrado com raios de luz ----- */
  parede('quadro-farol', 1, function (p) {
    quadroAlto(p, C.branco, CEU, function (p, x, y) {
      p.m(x, y, [
        '..........', '....kk....', '...krrk...', 'yy.kyyk.yy', '...kkkk...', '...kwwk...', '...krrk...', '...kwwk...',
        '..krrrrk..', '..kwwwwk..', '..krrrrk..', '..kwkkwk..', '.gkkkkkkg.', 'agggggggga', 'aaAaaaaAaa', 'aaaaaaaaaa',
      ], { k: K, r: '#ff5c6a', w: C.branco, y: OURO, g: '#a99cb8', a: MAR, A: C.branco });
    });
  });

  /* ----- espelho sol (banheiro, 2×2): espelho redondo com raios dourados ----- */
  parede('espelho-sol', 2, function (p) {
    var RAIOS = [[15, 2, 3, 6], [15, 24, 3, 6], [2, 15, 6, 3], [24, 15, 6, 3]];
    RAIOS.forEach(function (r) { p.r(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, K); });
    RAIOS.forEach(function (r) { p.r(r[0], r[1], r[2], r[3], OURO); });
    [[6, 6], [23, 6], [6, 23], [23, 23]].forEach(function (d) { p.r(d[0] - 1, d[1] - 1, 5, 5, K); p.r(d[0], d[1], 3, 3, OURO); p.r(d[0], d[1], 1, 1, C.ouro3); });
    p.c(16, 16, 9, K); p.c(16, 16, 8, OURO); p.r(10, 10, 3, 1, C.ouro3);
    p.c(16, 16, 6, K); p.c(16, 16, 5, '#d9f3ff');
    p.r(13, 13, 1, 3, C.branco); p.r(14, 12, 1, 1, C.branco); p.r(18, 18, 2, 1, C.branco);
  });

  /* ----- estrela-do-mar (banheiro, 1×2): laranja, pendurada num fio ----- */
  parede('estrela-mar', 1, function (p) {
    prego(p, 8, 4, 0); p.r(7, 6, 1, 4, K);
    p.m(1, 9, [
      '......kk......', '.....kook.....', '.....kook.....', '....kooook....', 'kkkkkooookkkkk', 'kOOOoooooooook',
      '.kooodoodoook.', '..kooooooook..', '...kooooook...', '..koookkoook..', '..kook..kook..', '.kook....kook.',
      '.kkk......kkk.',
    ], { k: K, o: '#ff9a5c', O: '#ffc79a', d: '#ffe0c0' });
  });

  /* ----- móbile de estrelas (quarto dela, 2×2) ----- */
  var ESTRELA = ['...k...', '..kyk..', 'kkyYykk', '.kyyyk.', '.kykyk.', '.kk.kk.'];
  function pendura(p, x, y0, y1) { p.r(x, y0, 1, y1 - y0, escurecer(LIL, 0.3)); }
  parede('mobile-estrelas', 2, function (p) {
    p.r(15, 0, 2, 3, K); p.r(3, 3, 26, 3, K); p.r(4, 4, 24, 1, MAD);
    [[6, 14, OURO], [12, 20, ROSA], [19, 12, '#7fc8ff'], [25, 18, OURO]].forEach(function (e) {
      pendura(p, e[0], 6, e[1]);
      p.m(e[0] - 3, e[1], ESTRELA, { k: K, y: e[2], Y: clarear(e[2], 0.6) });
    });
    p.m(13, 6, ['k', 'k', 'k'], { k: escurecer(LIL, 0.3) });
    p.m(14, 24, ['.kk', 'kyk', 'ky.', 'kyk', '.kk'], { k: K, y: C.ouro3 });            // a luazinha embaixo
    pendura(p, 15, 6, 24);
  });

  /* ----- quadro castelo (quarto dela, 2×2): castelo rosa com torres e bandeiras ----- */
  parede('quadro-castelo', 2, function (p) {
    quadroLargo(p, ROSA, '#e0f2ff', function (p, x, y) {
      p.r(x, y + 14, 22, 2, VERDE);
      p.m(x + 1, y, [
        '..r..............r....', '..kk.............kk...', '..k...............k...', '.kvk..............kvk..',
        'kvvvk............kvvvk.', 'kvvvvk..........kvvvvk.', 'kkkkkk..k.kk.k..kkkkkk.', 'kppppk.kpkppkpk.kppppk.',
        'kpwwpkkkpppppppkkpwwpk.', 'kpwwpkpppkkkkppppkpwwpk.', 'kppppkpppkddkppppkppppk.', 'kppppkpppkddkppppkppppk.',
        'kppppkpppkddkppppkppppk.', 'kkkkkkkkkkkkkkkkkkkkkkk.',
      ].map(function (l) { return l.slice(0, 22); }), { k: K, r: '#ff5c6a', v: '#9b7cf0', p: '#ffc4dd', w: CEU, d: '#c98a4b' });
      p.m(x + 9, y + 1, ['.w.', 'www'], { w: C.branco });
    });
  });

  /* ----- quadro pégaso (quarto do unicórnio, 2×2): cavalo alado num céu de estrelas ----- */
  parede('quadro-pegaso', 2, function (p) {
    quadroLargo(p, PRATA, NOITE, function (p, x, y) {
      [[1, 2], [5, 12], [19, 2], [20, 11], [14, 1], [2, 8]].forEach(function (e) { p.r(x + e[0], y + e[1], 1, 1, C.ouro3); });
      p.m(x + 3, y + 5, [
        '...............kk.', '..............kwwk', '.......kkkkkkkwwwk', '......kwwwwwwwwwk.', '.....kwwwwwwwwwk..', '....kwwwwwwwwwk...',
        '....kwkkkkwkk.....', '....kk...kk.......',
      ].map(function (l) { return l.slice(0, 18); }), { k: K, w: C.branco });
      p.m(x + 9, y + 1, ['kk.....', 'kakk...', 'kaaakk.', '.kaaaak', '.kaaAak', '..kaaak', '...kkk.'], { k: K, a: '#d9e8ff', A: C.branco });
      p.m(x + 5, y + 8, ['.l', 'll', 'l.'], { l: LIL });                                // rabo
      p.r(x + 17, y + 6, 1, 2, LIL); p.r(x + 16, y + 7, 1, 2, LIL);                   // crina
      p.r(x + 19, y + 7, 1, 1, K);                                                    // olho
    });
  });

  /* ----- guirlanda (quarto do unicórnio, 1×2): coroa de folhas e flores com laço ----- */
  parede('guirlanda', 1, function (p) {
    prego(p, 8, 3, 0); p.r(7, 5, 1, 3, K);
    anel(p, 8, 15, 7, 3, function (d, i, j) { return (i + j) % 3 ? FOLHA : VERDE; });
    [[3, 11], [6, 9], [11, 10], [13, 14], [12, 19], [4, 18], [2, 15]].forEach(function (f, i) {
      var c = [ROSA, OURO, C.branco, LIL][i % 4];
      p.r(f[0], f[1], 2, 2, c); p.r(f[0], f[1], 1, 1, clarear(c, 0.5));
    });
    p.r(5, 12, 1, 1, VERDE); p.r(10, 12, 1, 1, VERDE); p.r(11, 17, 1, 1, VERDE);
    p.m(4, 20, ['kk...kk', 'kpk.kpk', 'kppkppk', 'kpkkkpk', 'kk.k.kk', '..kpk..', '.kp.pk.', '.kk.kk.'], { k: K, p: '#ff5c8a' });
  });

  /* ----- quadro foguete (quarto do ET, 1×2) ----- */
  parede('quadro-foguete', 1, function (p) {
    quadroAlto(p, '#9b7cf0', NOITE, function (p, x, y) {
      p.m(x, y, [
        '....w.....', '....kk...w', '...krrk...', '..krrrrk..', '..kwwwwk..', '..kwkkwk..', '..kkbbkk..', '..kwkkwk..',
        '..kwwwwk..', '.krkwwkrk.', 'krrkwwkrrk', 'kk.kkkk.kk', '...kyyk...', '...yooy...', 'w...yy....', '........w.',
      ], { k: K, r: '#ff5c6a', w: C.branco, b: '#7fc8ff', y: OURO, o: '#ff8a3d' });
    });
  });

  /* ----- planetinhas (quarto do ET, 2×2): móbile de planetas ----- */
  parede('planetinhas', 2, function (p) {
    p.r(15, 0, 2, 3, K); p.r(2, 3, 28, 3, K); p.r(3, 4, 26, 1, PRATA);
    function planeta(cx, cy, raio, cor) {
      pendura(p, cx, 6, cy - raio);
      p.c(cx, cy, raio, K); p.c(cx, cy, raio - 1, cor);
      p.r(cx - raio + 2, cy - raio + 2, 2, 1, clarear(cor, 0.5));
    }
    planeta(6, 15, 4, '#ff8a5c');                                                   // planeta vermelho
    planeta(16, 22, 5, '#5fb4ff'); p.r(14, 20, 3, 2, VERDE); p.r(18, 24, 2, 1, VERDE); // planeta azul com terras
    planeta(26, 13, 3, '#c9a8ff');
    pendura(p, 11, 6, 9); p.c(11, 11, 2, K); p.c(11, 11, 1, '#e6dccb');                // luazinha
    // anel de Saturno no lilás
    p.r(21, 13, 11, 1, K); p.r(22, 12, 9, 1, K); p.r(22, 13, 9, 1, OURO); p.r(23, 14, 7, 1, K);
  });
})();
