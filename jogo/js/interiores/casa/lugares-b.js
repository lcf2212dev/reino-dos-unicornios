/* Casa do jogador: as miniaturas de lugares famosos do Mercado da Garagem (dados em js/conteudo/casa/lugares.js),
   parte B: as paisagens de 2 tiles (Cristo, Pão de Açúcar, Cataratas, Grande Muralha, Taj Mahal, São Basílio).
   O mesmo pedestal e os mesmos helpers da parte A (repetidos aqui: cada parte se basta). Só a direção baixo, sem
   movimento, `alto` (na ordem por Y com a Mariana). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores;

  var MAD = '#8a5a3a', OURO = C.ouro, OURO3 = C.ouro3;
  var CHAO = {
    grama: ['#7fc85a', '#a8e078'], agua: ['#5fb4ff', '#9fdcff'], pedra: ['#c9c2d6', '#e6e1ee'],
  };
  var VERDE = '#5fb84a', MATA = '#3f8f3a';

  function pincel(ctx, px, py) {
    return {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
    };
  }
  // silhueta com contorno na borda; cor(i, j, luz): luz 1 colado no contorno de cima/esquerda, -1 no da direita
  function forma(p, x, y, W, H, dentro, cor) {
    function em(i, j) { return i >= 0 && j >= 0 && i < W && j < H && dentro(i, j); }
    function borda(i, j) { return em(i, j) && (!em(i - 1, j) || !em(i + 1, j) || !em(i, j - 1) || !em(i, j + 1)); }
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      if (!em(i, j)) continue;
      var luz = borda(i - 1, j) || borda(i, j - 1) ? 1 : borda(i + 1, j) ? -1 : 0;
      p.r(x + i, y + j, 1, 1, borda(i, j) ? K : cor(i, j, luz));
    }
  }
  function tons(c) { var l = clarear(c, 0.35), e = escurecer(c, 0.2); return function (i, j, luz) { return luz > 0 ? l : luz < 0 ? e : c; }; }
  function perfil(larg, cx) { return function (i, j) { var l = larg[j] || 0; return l > 0 && i >= cx - l / 2 && i < cx + l / 2; }; }
  function pedestal(p, W, chao) {
    p.r(0, 7, W, 9, K);
    p.r(1, 8, W - 2, 3, chao[0]); p.r(1, 8, W - 2, 1, chao[1]);
    p.r(1, 11, W - 2, 3, MAD); p.r(1, 11, W - 2, 1, clarear(MAD, 0.3)); p.r(1, 12, 1, 2, clarear(MAD, 0.15));
    p.r(2, 14, W - 3, 1, escurecer(MAD, 0.25));
    p.r(W / 2 - 3, 12, 6, 2, OURO); p.r(W / 2 - 3, 12, 6, 1, OURO3);
  }
  function maquete(id, topo, desenho) {
    I.objeto('casa-movel-' + id, { w: 2, h: 1, topo: topo, solido: true, alto: true,
      desenhar: function (ctx, px, py) { desenho(pincel(ctx, px, py)); } });
  }
  // morro verde de mata: pontinhos escuros fixos
  function mata(i, j, luz) { return luz > 0 ? clarear(VERDE, 0.3) : (i * 5 + j * 3) % 7 === 0 ? MATA : luz < 0 ? escurecer(VERDE, 0.15) : VERDE; }

  /* ----- Cristo (Brasil): o Cristo Redentor de braços abertos no alto do morro do Corcovado ----- */
  var SABAO = '#e2e8ee';
  maquete('lugar-cristo', 24, function (p) {
    pedestal(p, 32, CHAO.grama);
    forma(p, 0, -8, 32, 18, function (i, j) { return i >= 14 - j * 0.8 && i <= 18 + j * 0.65; }, function (i, j, luz) {
      if (!luz && i > 17 && j < 8 && i < 20 + j * 0.5) return (i + j) % 3 ? '#a8a0a8' : '#8f8690';   // a pedra do penhasco
      return mata(i, j, luz);
    });
    p.m(14, -10, ['kkkk', 'kllk', 'kkkk'], { k: K, l: '#b9c4d6' });                          // o pedestal da estátua
    forma(p, 0, -17, 32, 8, perfil([4, 4, 4, 4, 6, 6, 6, 8], 16), tons(SABAO));              // a túnica
    p.r(8, -19, 16, 4, K); p.r(9, -18, 14, 1, C.branco); p.r(9, -17, 14, 1, '#b9c4d6');      // os braços abertos
    p.r(13, -18, 6, 3, K); p.r(14, -18, 4, 2, SABAO); p.r(14, -18, 1, 2, C.branco);
    p.m(14, -23, ['.kk.', 'kllk', 'klgk', '.kk.'], { k: K, l: C.branco, g: '#b9c4d6' });   // a cabeça
  });

  /* ----- Pão de Açúcar (Brasil): os dois morros no mar e o bondinho pendurado no cabo ----- */
  var GRANITO = '#ab9c98';
  maquete('lugar-pao-de-acucar', 16, function (p) {
    pedestal(p, 32, CHAO.agua);
    // o morro da Urca (baixo, de mata)
    forma(p, 0, -3, 32, 13, function (i, j) { var a = (i - 7.5) / 7.5, b = (j - 12) / 12.5; return a * a + b * b <= 1; }, mata);
    // o Pão de Açúcar (alto, de pedra, com mata no pé)
    forma(p, 0, -15, 32, 25, function (i, j) { return Math.abs(i + 0.5 - 23) <= 6.6 * Math.sqrt(Math.min(1, (j + 1) / 10)); }, function (i, j, luz) {
      if (j > 18 || (j > 14 && i < 20)) return mata(i, j, luz);
      var c = (i + Math.floor(j / 4)) % 4 === 0 ? escurecer(GRANITO, 0.15) : GRANITO;
      return luz > 0 ? clarear(GRANITO, 0.35) : luz < 0 ? escurecer(GRANITO, 0.25) : c;
    });
    // o cabo e o bondinho
    for (var x = 10; x <= 21; x++) p.r(x, -2 - Math.round((x - 10) * 12 / 11), 1, 1, K);
    p.r(15, -8, 1, 2, K);
    p.m(13, -6, ['kkkkk', 'kbbbk', 'kyyyk', 'kkkkk'], { k: K, b: '#9fdcff', y: '#ffb02e' });
    p.r(3, 9, 3, 1, C.branco); p.r(26, 9, 3, 1, C.branco);                                     // marolas
  });

  /* ----- Cataratas (Brasil): as quedas d'água brancas no paredão, a mata em cima e o arco-íris ----- */
  var ROCHA = '#a8584a';
  maquete('lugar-cataratas', 14, function (p) {
    pedestal(p, 32, CHAO.agua);
    // a mata em cima e o paredão de pedra
    forma(p, 0, -14, 32, 20, function (i, j) { return j >= ((i * 7) % 5 < 2 ? 0 : (i * 3) % 4 === 0 ? 2 : 1); }, function (i, j, luz) {
      if (j < 6) return mata(i, j, luz);
      var c = (j + (i % 5 === 0 ? 1 : 0)) % 4 === 0 ? escurecer(ROCHA, 0.2) : ROCHA;
      return luz > 0 ? clarear(c, 0.3) : luz < 0 ? escurecer(c, 0.2) : c;
    });
    // as quedas (água: sem contorno, com a linha d'água clara)
    [[2, 4], [8, 3], [13, 6], [21, 3], [26, 4]].forEach(function (q) {
      for (var i = 0; i < q[1]; i++) p.r(q[0] + i, -8, 1, 14, i % 2 ? '#cfeeff' : C.branco);
      p.r(q[0], -8, q[1], 1, '#9fdcff');
    });
    // a espuma lá embaixo
    p.r(1, 5, 30, 3, '#9fdcff');
    [[1, 4, 6], [7, 4, 5], [12, 3, 8], [20, 4, 5], [25, 4, 6]].forEach(function (e) { p.r(e[0], e[1] + 1, e[2], 2, C.branco); });
    // o arco-íris na névoa
    for (var j = -6; j <= 5; j++) for (var i = 0; i < 18; i++) {
      var d = Math.sqrt((i - 9) * (i - 9) + (j - 6) * (j - 6));
      var c = d >= 8 && d < 9 ? '#ff5c6a' : d >= 7 && d < 8 ? OURO : d >= 6 && d < 7 ? '#5fb4ff' : null;
      if (c && j < 5) p.r(i, j, 1, 1, c);
    }
  });

  /* ----- Grande Muralha (China): o muro de pedra serpenteando nos morros, com as torres de vigia ----- */
  var MURO = '#d8c0a0';
  var CAMINHO = [[0, 4], [8, -3], [15, 1], [24, -6], [31, -4]];   // (x, y do alto do muro)
  function alturaMuro(x) {
    for (var k = 1; k < CAMINHO.length; k++) {
      var a = CAMINHO[k - 1], b = CAMINHO[k];
      if (x <= b[0]) return Math.round(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]));
    }
    return CAMINHO[CAMINHO.length - 1][1];
  }
  function torreVigia(p, x, topo, base, telhado) {
    forma(p, x, topo, 7, base - topo + 1, function (i, j) { return j > 1 || i % 2 === 0; }, tons(MURO));
    p.r(x + 3, topo + 4, 1, 2, '#5a4470');
    if (telhado) p.m(x - 1, topo - 4, ['...kkk...', '.kkrrrkk.', 'krrrrrrrk', 'k.k...k.k'], { k: K, r: '#e8483a' });
  }
  maquete('lugar-muralha', 18, function (p) {
    pedestal(p, 32, CHAO.grama);
    // as montanhas de trás e o morro da frente
    forma(p, 0, -12, 32, 22, function (i, j) { return j >= 8 - 7 * Math.max(0, 1 - Math.abs(i - 7) / 11) - 9 * Math.max(0, 1 - Math.abs(i - 24) / 10); },
      tons('#8fcfa0'));
    forma(p, 0, -6, 32, 16, function (i, j) { return j >= 6 + alturaMuro(i) + 3 - 2; }, mata);
    // o muro, com as ameias
    forma(p, 0, -10, 32, 20, function (i, j) { var t = alturaMuro(i) + 10; return j <= t + 3 && j >= t - (i % 4 < 2 ? 2 : 0); }, function (i, j, luz) {
      return (j - alturaMuro(i) - 10) === 2 ? escurecer(MURO, 0.2) : tons(MURO)(i, j, luz);
    });
    torreVigia(p, 5, -10, alturaMuro(8) + 3, false);
    torreVigia(p, 21, -13, alturaMuro(24) + 3, true);
  });

  /* ----- Taj Mahal (Índia): o palácio branco de cúpula redonda, os minaretes e o lago comprido ----- */
  var BRANCO = '#f4f0fa', LILAS = '#9a8cc8';
  function cupula(p, cx, topo, larg) {
    forma(p, 0, topo, 32, larg.length, perfil(larg, cx), function (i, j, luz) { return luz > 0 ? C.branco : luz < 0 ? '#cfc8e0' : BRANCO; });
  }
  function minarete(p, x) {
    p.m(x - 1, -17, ['..k..', '.kwk.', 'kwwwk', 'kkkkk'], { k: K, w: BRANCO });
    p.r(x, -13, 3, 21, K); p.r(x + 1, -13, 1, 20, BRANCO);
    [-9, -3, 3].forEach(function (y) { p.r(x - 1, y, 5, 2, K); p.r(x, y, 3, 1, C.branco); });
  }
  maquete('lugar-taj-mahal', 22, function (p) {
    pedestal(p, 32, CHAO.grama);
    p.r(12, 8, 8, 3, '#7fc8ff'); p.r(12, 8, 8, 1, '#bfe9ff');                                // o lago comprido
    minarete(p, 1); minarete(p, 28);
    // o palácio, de cantos cortados
    forma(p, 0, -5, 32, 14, function (i, j) { return i >= 6 && i <= 25 && !(j < 2 && (i < 8 || i > 23)); }, tons(BRANCO));
    p.m(13, -3, ['..kk..', '.kddk.', 'kddddk', 'kddddk', 'kddddk', 'kddddk', 'kddddk', 'kddddk', 'kddddk', 'kkkkkk'], { k: K, d: LILAS });
    [[8, -2], [10, -2], [8, 3], [10, 3], [21, -2], [23, -2], [21, 3], [23, 3]].forEach(function (a) { p.r(a[0], a[1], 1, 3, LILAS); });
    // as cúpulas: as pequenas dos cantos e a grande no tambor
    cupula(p, 9, -9, [2, 4, 4, 4]); cupula(p, 23, -9, [2, 4, 4, 4]);
    forma(p, 0, -8, 32, 4, perfil([10, 10, 10, 10], 16), tons(BRANCO));
    cupula(p, 16, -20, [2, 4, 6, 8, 10, 12, 12, 12, 12, 10, 8, 8]);
    p.r(15, -22, 2, 2, OURO); p.r(15, -21, 1, 1, OURO3);
  });

  /* ----- São Basílio (Rússia): a catedral de tijolo vermelho com as cúpulas de cebola listradas e coloridas ----- */
  var TIJOLO = '#d8584a';
  function cebola(p, cx, topo, larg, cores) {
    forma(p, 0, topo, 32, larg.length, perfil(larg, cx), function (i, j, luz) {
      var c = cores[((i + j) >> 1) % 2];
      return luz > 0 ? clarear(c, 0.3) : luz < 0 ? escurecer(c, 0.2) : c;
    });
    p.r(cx - 1, topo - 2, 2, 2, OURO); p.r(cx - 1, topo - 2, 1, 1, OURO3);
  }
  function tambor(p, cx, topo, base, larg) {
    forma(p, 0, topo, 32, base - topo + 1, perfil(Array(base - topo + 1).fill(larg), cx), tons(TIJOLO));
    p.r(cx - larg / 2 + 1, topo + 1, larg - 2, 1, C.branco);
  }
  maquete('lugar-sao-basilio', 24, function (p) {
    pedestal(p, 32, CHAO.pedra);
    // o corpo, com frisos brancos e janelas em arco
    forma(p, 0, -3, 32, 13, function (i, j) { return i >= 2 && i <= 29; }, tons(TIJOLO));
    p.r(3, 0, 26, 1, C.branco); p.r(3, 5, 26, 1, C.branco);
    [5, 9, 13, 18, 22, 26].forEach(function (x) { p.r(x, 1, 2, 3, '#5a3040'); p.r(x, 6, 2, 3, '#5a3040'); });
    // as torres e as cúpulas
    tambor(p, 3, -6, -2, 6); cebola(p, 3, -12, [2, 4, 6, 6, 4, 4], ['#4f8fe8', C.branco]);
    tambor(p, 29, -6, -2, 6); cebola(p, 29, -12, [2, 4, 6, 6, 4, 4], ['#ff9a3d', '#4fbf6a']);
    tambor(p, 8, -8, -2, 6); cebola(p, 8, -16, [2, 4, 6, 8, 8, 6, 4, 4], ['#ff4a4a', C.branco]);
    tambor(p, 24, -8, -2, 6); cebola(p, 24, -16, [2, 4, 6, 8, 8, 6, 4, 4], ['#4fbf6a', OURO]);
    // a torre do meio, de telhado de tenda
    tambor(p, 16, -9, -2, 8);
    forma(p, 0, -19, 32, 10, perfil([2, 2, 4, 4, 4, 6, 6, 6, 8, 8], 16), function (i, j, luz) {
      return luz > 0 ? '#9fe0a8' : (i + j) % 3 === 0 ? OURO : '#3fa85a';
    });
    cebola(p, 16, -22, [2, 4, 2], [OURO, OURO]);
  });
})();
