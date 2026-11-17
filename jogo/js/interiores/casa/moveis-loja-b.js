/* Casa do jogador: os enfeites da loja Casa Bonita (Vila Arco-Íris; dados em js/conteudo/casa/moveis-loja.js), parte B:
   7 tapetes (redondo, xadrez, limão, patinho, coração, estrela, lunar) e 9 de chão com planta ou luz (abajur tulipa,
   girassóis, castiçal, vaso azul, jiboia, hortinha, bambu, abajur nuvem, abajur de lava). baixo = de frente; lado = a
   pegada trocada (os tapetes 2×1 deitam o mesmo desenho, transform de 90° exato). `forma` pinta uma silhueta pixel a
   pixel com o contorno #3a2446 na borda. Sem movimento (casa.md §13.7). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, circulo = D.circulo, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var ROSA = '#ff8fc4', OURO = C.ouro, LIL = '#c9a8ff', ROXO = '#9b7cf0', VERDE = '#7fe08a', FOLHA = C.folha3;
  var TERRA = C.terracota, MAD = '#d99a5b', LATAO = '#e8b84a', AZUL = '#4f8fe8';

  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
      c: function (x, y, raio, c) { circulo(ctx, px + x, py + y, raio, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, escurecer(c, 0.2));
      },
    };
    return p;
  }
  /* silhueta: dentro(i, j) diz se o pixel (i, j) da caixa W×H em (x, y) é do desenho; a borda sai em contorno e o
     resto na cor(i, j) */
  function forma(p, x, y, W, H, dentro, cor) {
    function em(i, j) { return i >= 0 && j >= 0 && i < W && j < H && dentro(i, j); }
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      if (!em(i, j)) continue;
      var borda = !em(i - 1, j) || !em(i + 1, j) || !em(i, j - 1) || !em(i, j + 1);
      p.r(x + i, y + j, 1, 1, borda ? K : cor(i, j));
    }
  }
  // perfil de vaso: larguras[j] = largura da linha j (centrada em cx)
  function perfil(p, cx, y, larguras, cor) {
    var W = 0; larguras.forEach(function (l) { W = Math.max(W, l); });
    forma(p, cx - (W >> 1), y, W, larguras.length, function (i, j) {
      var l = larguras[j]; return i >= (W - l) >> 1 && i < ((W - l) >> 1) + l;
    }, function (i, j) { return cor(i - ((W - larguras[j]) >> 1), j, larguras[j]); });
  }
  function tapete(id, w, h, desenho) {
    var def = { w: w, h: h, solido: false, plano: true, semSombra: true };
    var baixo = function (ctx, px, py) { desenho(pincel(ctx, px, py)); };
    // 2×1: o lado é o mesmo tapete deitado (x vira y), na pegada 1×2
    def.desenhar = w === h ? baixo : virado({ baixo: baixo, lado: function (ctx, px, py) {
      ctx.save(); ctx.transform(0, 1, -1, 0, px + h * 16, py); desenho(pincel(ctx, 0, 0)); ctx.restore();
    } });
    I.objeto('casa-movel-' + id, def);
  }

  /* ----- tapete redondo (estar, 2×2): anéis coral, creme e verde-água com uma flor no meio ----- */
  tapete('tapete-redondo', 2, 2, function (p) {
    var ANEIS = ['#ff8a7a', C.creme, '#7ed9c8', C.creme, '#ff8a7a'];
    forma(p, 1, 1, 30, 30, function (i, j) { var a = i - 14.5, b = j - 14.5; return a * a + b * b < 15 * 15; }, function (i, j) {
      var d = Math.sqrt((i - 14.5) * (i - 14.5) + (j - 14.5) * (j - 14.5));
      if (d > 13) return clarear('#ff8a7a', 0.25);
      return ANEIS[Math.min(4, Math.floor((13 - d) / 3))];
    });
    p.m(12, 12, ['..p..', '.ppp.', 'ppypp', '.ppp.', '..p..'].map(function (l) { return l + '...'; }), { p: ROSA, y: OURO });
    p.r(5, 9, 1, 3, C.branco); p.r(6, 7, 1, 2, C.branco);
  });

  /* ----- tapete xadrez (jantar, 2×1): vermelho e branco, com franjas ----- */
  tapete('tapete-xadrez', 2, 1, function (p) {
    for (var y = 3; y < 13; y += 2) { p.r(0, y, 2, 1, C.creme2); p.r(30, y, 2, 1, C.creme2); }
    p.r(2, 1, 28, 14, K);
    for (var j = 0; j < 3; j++) for (var i = 0; i < 7; i++) {
      var c = (i + j) % 2 ? C.branco : '#ff6a6a';
      p.r(3 + i * 4, 2 + j * 4, 4, 4, c); p.r(3 + i * 4, 2 + j * 4, 4, 1, clarear(c, 0.35));
    }
    p.r(3, 13, 26, 1, escurecer('#ff6a6a', 0.25));
  });

  /* ----- tapete limão (cozinha, 2×1): oval amarelo com rodelas de limão ----- */
  function rodela(p, cx, cy) {
    p.c(cx, cy, 4, K); p.c(cx, cy, 3, '#f2fbd0'); p.c(cx, cy, 2, '#c8e64a');
    p.r(cx, cy - 2, 1, 5, '#f2fbd0'); p.r(cx - 2, cy, 5, 1, '#f2fbd0');
  }
  tapete('tapete-limao', 2, 1, function (p) {
    forma(p, 0, 0, 32, 16, function (i, j) { var a = (i - 15.5) / 16, b = (j - 7.5) / 8; return a * a + b * b < 1; },
      function (i, j) { return j < 3 ? '#fff08a' : '#ffe14d'; });
    rodela(p, 9, 8); rodela(p, 22, 8);
    p.r(15, 5, 2, 1, '#e8c22e'); p.r(15, 10, 2, 1, '#e8c22e');
  });

  /* ----- tapete patinho (banheiro, 2×1): um patinho amarelo felpudo ----- */
  tapete('tapete-pato', 2, 1, function (p) {
    forma(p, 1, 1, 30, 14, function (i, j) {
      var a = (i - 17) / 13, b = (j - 9) / 5, c = (i - 7) / 5, d = (j - 5) / 5;
      return a * a + b * b < 1 || c * c + d * d < 1 || (i > 26 && j > 2 && j < 8 && i - 26 < 8 - j);
    }, function (i, j) { return j < 3 ? '#fff3a0' : '#ffd84d'; });
    p.m(0, 5, ['.kk.', 'kooo', 'kooo', '.kk.'], { k: K, o: '#ff9a3d' });     // bico
    p.r(6, 5, 2, 2, K); p.r(6, 5, 1, 1, C.branco);                          // olho
    p.m(14, 7, ['.kkkk...', 'kyyyyk..', '.kyyyykk', '..kkkk..'], { k: K, y: '#ffe98a' });   // asa
  });

  /* ----- tapete coração (quarto dela, 2×2) ----- */
  tapete('tapete-coracao', 2, 2, function (p) {
    forma(p, 1, 2, 30, 28, function (i, j) {
      var x = (i - 14.5) / 13, y = (13 - j) / 12 + 0.15, t = x * x + y * y - 1;
      return t * t * t - x * x * y * y * y < 0;
    }, function (i, j) {
      var x = (i - 14.5) / 13, y = (13 - j) / 12 + 0.15, t = x * x * 0.55 + y * y * 0.55 - 1;
      return t * t * t - x * x * y * y * y * 0.17 < 0 ? '#ffb3d6' : ROSA;
    });
    p.r(6, 6, 3, 1, C.branco); p.r(5, 7, 1, 2, C.branco);
  });

  /* ----- tapete estrela (quarto do unicórnio, 2×2) ----- */
  var PONTAS = [];
  for (var k = 0; k < 10; k++) {
    var ang = -Math.PI / 2 + k * Math.PI / 5, raio = k % 2 ? 6.5 : 15.5;
    PONTAS.push([15.5 + raio * Math.cos(ang), 16.5 + raio * Math.sin(ang)]);
  }
  function naEstrela(x, y) {
    var dentro = false;
    for (var a = 0, b = PONTAS.length - 1; a < PONTAS.length; b = a++) {
      var A = PONTAS[a], B = PONTAS[b];
      if ((A[1] > y) !== (B[1] > y) && x < (B[0] - A[0]) * (y - A[1]) / (B[1] - A[1]) + A[0]) dentro = !dentro;
    }
    return dentro;
  }
  tapete('tapete-estrela', 2, 2, function (p) {
    forma(p, 0, 0, 32, 32, function (i, j) { return naEstrela(i + 0.5, j + 0.5); }, function (i, j) {
      var d = Math.abs(i - 15.5) + Math.abs(j - 16.5);
      return d < 6 ? '#fff3a0' : '#ffd34d';
    });
    p.m(13, 15, ['k...k', '.....', 'k...k', '.kkk.'].map(function (l) { return l; }), { k: K });   // carinha
    p.r(11, 18, 2, 1, ROSA); p.r(19, 18, 2, 1, ROSA);
  });

  /* ----- tapete lunar (quarto do ET, 2×2): lua cinza com crateras ----- */
  var CRATERAS = [[10, 10, 3], [20, 9, 2], [19, 19, 4], [9, 20, 2], [14, 15, 1], [24, 15, 1]];
  tapete('tapete-lua', 2, 2, function (p) {
    forma(p, 1, 1, 30, 30, function (i, j) { var a = i - 14.5, b = j - 14.5; return a * a + b * b < 15 * 15; }, function (i, j) {
      for (var n = 0; n < CRATERAS.length; n++) {
        var c = CRATERAS[n], a = i + 1 - c[0], b = j + 1 - c[1];
        if (a * a + b * b <= c[2] * c[2] + 1) return (a < 0 && b < 0) ? '#9c97b5' : '#b5b0cc';
      }
      return (i + j < 14) ? '#e8e5f2' : '#d2cee2';
    });
  });

  /* ----- abajur tulipa (estar, 1×1): luminária de pé com cúpula de tulipa rosa ----- */
  I.objeto('casa-movel-abajur-tulipa', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(2, -16, [
        '.k...kk...k.', 'kpk.kppk.kpk', 'kppkppppkppk', 'kppppppppppk', 'kPpppppppppk', 'kPpppppppppk', '.kPppppppek.',
        '..keeeeeek..', '...kkkkkk...',
      ], { k: K, p: ROSA, P: '#ffc4e0', e: escurecer(ROSA, 0.2) });
      p.r(6, -6, 4, 1, '#fff3a0');                                                       // a luz que escapa
      p.r(7, -7, 3, 18, K); p.r(8, -7, 1, 18, VERDE);
      p.m(9, 0, ['kk.', 'kgk', '.kk'], { k: K, g: VERDE });                              // folhinha na haste
      p.caixa(3, 11, 10, 4, escurecer(VERDE, 0.2));
    } });

  /* ----- girassóis (estar, 1×1): vaso de barro com três girassóis ----- */
  function girassol(p, cx, cy) {
    p.m(cx - 3, cy - 3, ['..kyk..', '.kyyyk.', 'kyybbyk', 'yybbbby', 'kyybbyk', '.kyyyk.', '..kyk..'], { k: K, y: OURO, b: '#8a5a2a' });
    p.r(cx - 1, cy - 1, 1, 1, '#b07a3a');
  }
  I.objeto('casa-movel-girassois', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(4, -10, 1, 15, FOLHA); p.r(8, -14, 1, 19, FOLHA); p.r(11, -8, 1, 13, FOLHA);
      p.m(5, -4, ['kk', 'gk'], { k: K, g: VERDE }); p.m(9, -2, ['kk', 'kg'], { k: K, g: VERDE });
      girassol(p, 4, -10); girassol(p, 11, -8); girassol(p, 8, -13);
      perfil(p, 8, 4, [14, 14, 12, 12, 12, 10, 10, 10, 10, 10, 10], function (i, j) {
        return j < 2 ? clarear(TERRA, j ? 0.1 : 0.35) : i === 1 ? clarear(TERRA, 0.2) : TERRA;
      });
    } });

  /* ----- castiçal (estar, 1×1): de latão, com três velas acesas ----- */
  function vela(p, x, y, alt) {
    p.r(x, y - 3, 1, 1, OURO); p.r(x - 1, y - 2, 3, 1, '#ff9a3d'); p.r(x, y - 2, 1, 1, '#fff3a0');   // chama (luz, sem contorno)
    p.r(x, y - 1, 1, 1, K);
    p.r(x - 2, y, 5, alt, K); p.r(x - 1, y + 1, 3, alt - 1, C.creme); p.r(x - 1, y + 1, 1, alt - 1, C.branco);
  }
  I.objeto('casa-movel-castical', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      vela(p, 3, -7, 6); vela(p, 12, -7, 6); vela(p, 8, -9, 6);
      p.r(1, -2, 14, 3, K); p.r(2, -1, 12, 1, LATAO);                                    // braços
      p.r(0, -2, 6, 3, K); p.r(1, -1, 4, 1, LATAO); p.r(10, -2, 6, 3, K); p.r(11, -1, 4, 1, LATAO);
      p.r(6, -3, 4, 14, K); p.r(7, -3, 2, 14, LATAO); p.r(7, -3, 1, 14, clarear(LATAO, 0.4));
      p.r(6, 3, 4, 2, K);
      perfil(p, 8, 10, [6, 8, 12, 12, 12], function (i, j) { return j === 1 ? clarear(LATAO, 0.4) : LATAO; });
    } });

  /* ----- vaso azul (jantar, 1×1): porcelana branca com desenho azul ----- */
  I.objeto('casa-movel-vaso-azul', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      var L = [8, 8, 6, 6, 6, 8, 10, 12, 14, 14, 14, 14, 14, 14, 14, 14, 12, 12, 10, 10, 10, 8, 8, 8, 8, 10, 10, 10, 10];
      perfil(p, 8, -14, L, function (i, j, l) {
        if (j === 0) return clarear(AZUL, 0.5);
        if (j === 4 || j === 20) return AZUL;
        if (j >= 9 && j <= 15 && ((i + j) % 4 === 0 || (i - j + 40) % 4 === 0)) return AZUL;
        return i <= 1 ? C.branco : '#eef3ff';
      });
      p.m(6, -3, ['.b.', 'bbb', '.b.'], { b: '#2f6ac8' });
    } });

  /* ----- jiboia (jantar, 1×1): planta pendente num suporte de madeira ----- */
  I.objeto('casa-movel-jiboia', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(2, 4, 3, 11, K); p.r(3, 4, 1, 10, MAD); p.r(11, 4, 3, 11, K); p.r(12, 4, 1, 10, MAD);   // pernas
      p.r(3, 10, 10, 2, K); p.r(4, 10, 8, 1, MAD);
      p.caixa(1, 2, 14, 4, MAD);
      perfil(p, 8, -6, [12, 12, 10, 10, 10, 10, 10, 8], function (i, j) { return j === 0 ? clarear('#5fc8b8', 0.4) : i === 1 ? clarear('#5fc8b8', 0.3) : '#5fc8b8'; });
      p.r(5, -2, 6, 1, escurecer('#5fc8b8', 0.25));
      // a copa de folhas de coração e os ramos que caem pelos lados
      var FOL = ['.kk.', 'kggk', 'kgGk', '.kk.'];
      p.r(1, -4, 1, 12, FOLHA); p.r(14, -4, 1, 14, FOLHA);
      [[2, -14], [6, -16], [10, -14], [4, -11], [8, -12], [12, -10], [0, -9], [0, -2], [12, -3], [0, 4], [12, 6]].forEach(function (f) {
        p.m(f[0], f[1], FOL, { k: K, g: VERDE, G: FOLHA });
      });
    } });

  /* ----- hortinha (cozinha, 2×1): floreira de madeira com manjericão, tomates e cenouras ----- */
  function ervas(p, x, y) {
    p.m(x, y, ['.gg.g', 'gGggg', 'ggGgG', '.ggg.'], { g: VERDE, G: FOLHA });
  }
  function tomateiro(p, x, y) {
    p.r(x + 2, y, 1, 9, FOLHA); p.m(x, y + 1, ['kk...', 'rrk.g', 'krk.g', '...kk', '..krr', '...kk'], { k: K, r: '#ff5c6a', g: VERDE });
  }
  I.objeto('casa-movel-hortinha', { w: 2, h: 1, topo: 10, solido: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      ervas(p, 3, -6); tomateiro(p, 11, -10); ervas(p, 17, -5); p.m(24, -8, ['g.g', 'ggg', '.g.', '.g.'], { g: FOLHA }); p.m(27, -7, ['g.g', '.g.', '.g.'], { g: VERDE });
      p.caixa(1, -2, 30, 15, MAD); p.r(2, -2, 28, 2, '#8a5a3a');
      [10, 20].forEach(function (x) { p.r(x, 0, 1, 12, escurecer(MAD, 0.3)); });
      p.r(23, 2, 1, 1, '#ff8a3d'); p.r(26, 2, 1, 1, '#ff8a3d');
      p.r(2, 13, 3, 2, K); p.r(27, 13, 3, 2, K);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      ervas(p, 5, -6); tomateiro(p, 5, 2); ervas(p, 6, 14); p.m(6, 18, ['g.g', 'ggg', '.g.'], { g: FOLHA });
      p.caixa(3, -1, 10, 31, MAD); p.r(4, 0, 8, 1, '#8a5a3a');
      p.r(4, 1, 8, 27, '#8a5a3a');
      ervas(p, 4, 0); tomateiro(p, 4, 8); ervas(p, 5, 17); p.m(6, 22, ['g.g', 'ggg', '.g.'], { g: VERDE }); p.r(7, 25, 1, 1, '#ff8a3d');
      p.r(4, 29, 2, 2, K); p.r(10, 29, 2, 2, K);
    },
  }) });

  /* ----- bambu da sorte (banheiro, 1×1): três hastes num vaso branco com pedrinhas ----- */
  function haste(p, x, y, alt) {
    p.r(x - 1, y, 4, alt, K); p.r(x, y + 1, 2, alt - 1, '#9ad86a'); p.r(x, y + 1, 1, alt - 1, '#c4ef94');
    for (var n = y + 4; n < y + alt; n += 5) p.r(x, n, 2, 1, escurecer('#9ad86a', 0.3));
  }
  I.objeto('casa-movel-bambu', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      haste(p, 4, -10, 16); haste(p, 8, -16, 22); haste(p, 11, -7, 13);
      p.m(1, -12, ['.kk', 'kgk', 'kgk', '.k.'], { k: K, g: FOLHA }); p.m(11, -15, ['kk.', 'kgk', '.kk'], { k: K, g: VERDE });
      p.m(12, -9, ['.kk', 'kgk', 'kk.'], { k: K, g: FOLHA });
      p.caixa(2, 5, 12, 10, C.branco); p.r(3, 6, 10, 1, '#cfeaff');
      [[4, 5, '#b8aed0'], [7, 5, '#ff8fc4'], [10, 5, '#7fc8ff']].forEach(function (s) { p.r(s[0], s[1], 2, 1, s[2]); });
      p.r(4, 10, 8, 1, '#7fc8ff');
    } });

  /* ----- abajur nuvem (quarto do unicórnio, 1×1): cúpula de nuvem num pé lilás ----- */
  I.objeto('casa-movel-abajur-nuvem', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      forma(p, 0, -14, 16, 11, function (i, j) {
        function bola(cx, cy, r) { return (i - cx) * (i - cx) + (j - cy) * (j - cy) <= r * r; }
        return bola(4, 6, 4) || bola(8, 4.5, 4.5) || bola(12, 6, 3.6) || (j > 5 && j < 10 && i > 0 && i < 15);
      }, function (i, j) { return j < 4 ? C.branco : j > 7 ? '#fff6c8' : '#f2f4ff'; });
      p.r(5, -6, 1, 1, '#ffb3d6'); p.r(10, -6, 1, 1, '#ffb3d6');                         // bochechas
      p.r(6, -8, 1, 1, K); p.r(9, -8, 1, 1, K); p.r(7, -7, 2, 1, K);
      p.r(7, -3, 2, 12, K); p.r(7, -3, 1, 12, LIL);
      perfil(p, 8, 9, [6, 10, 12, 12, 12, 12], function (i, j) { return j === 1 ? clarear(ROXO, 0.4) : ROXO; });
    } });

  /* ----- abajur de lava (quarto do ET, 1×1): cápsula de vidro com bolhas laranja ----- */
  I.objeto('casa-movel-abajur-lava', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perfil(p, 8, -16, [4, 6, 6], function () { return '#8a94aa'; });
      perfil(p, 8, -13, [6, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12], function (i, j) {
        return i === 1 ? '#e8b0ff' : '#c27cf0';
      });
      [[6, -10, 2], [9, -5, 2], [6, -1, 1], [8, 2, 2]].forEach(function (b) { p.c(b[0], b[1], b[2], '#ff9a3d'); p.r(b[0] - 1, b[1] - 1, 1, 1, '#ffd39a'); });
      perfil(p, 8, 5, [12, 12, 10, 10, 12, 14, 14, 14, 14, 14], function (i, j) { return j === 0 || j === 5 ? '#b9c4d6' : '#8a94aa'; });
      p.r(5, 12, 6, 1, '#ff9a3d');
    } });
})();
