/* Casa do jogador: móveis do kit Quarto do unicórnio (prefixo casa-quarto-uni-; docs/contratos/casa.md §5). Quarto
   mágico: almofadão de feno, bebedouro, comedouro de cenouras, tapete de nuvem, baú de brinquedos, estrela luminosa,
   espelho e cabideiro de escovas. baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada
   trocada). Movimento de sempre (casa.md §13.7): pinga água no bebedouro. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K, CA = R.CasaArte, virado = CA.virado, usos = CA.objeto;
  var LIL = '#c9a8ff', LIL2 = '#e6d8ff', ROXO = '#9b7cf0', AMAR = '#ffd84d', FENO = '#f2cf6b', FENO2 = '#c99a3a';
  var ARCO = ['#ff7a8a', '#ffb35c', '#ffe066', '#7fe08a', '#7fc8ff', '#b58cff'];
  var ESTRELA = ['...#...', '..###..', '#######', '.#####.', '.##.##.', '#.....#'];

  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  function caixa(ctx, x, y, w, h, c) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, c);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
    ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(c, 0.2));
  }
  function estrelinha(ctx, x, y, c) { ret(ctx, x + 1, y, 1, 3, c); ret(ctx, x, y + 1, 3, 1, c); }
  function estrela(ctx, x, y, c) { D.matriz(ctx, x, y, ESTRELA, { '#': c }); }
  function arcoIris(ctx, x, y, w, vertical) {   // faixa de 6 listras de 1 px
    ARCO.forEach(function (c, i) { if (vertical) ret(ctx, x + i, y, 1, w, c); else ret(ctx, x, y + i, w, 1, c); });
  }

  /* ---------- almofadão de feno (3×2; lado 2×3) ---------- */
  function almofadao(ctx, px, py, W, H) {
    for (var i = 4; i < W - 4; i += 5) { ret(ctx, px + i, py - 3, 1, 4, K); ret(ctx, px + i + 1, py - 2, 1, 3, FENO); }   // feno escapando
    arred(ctx, px + 1, py - 1, W - 2, H, K); arred(ctx, px + 2, py, W - 4, H - 2, FENO);
    for (var j = 2; j < H - 3; j += 3) ret(ctx, px + 3 + (j % 2) * 2, py + j, W - 8, 1, FENO2);
    arred(ctx, px + 4, py + 3, W - 8, H - 8, K); arred(ctx, px + 5, py + 4, W - 10, H - 10, LIL);      // o almofadão
    arred(ctx, px + 7, py + 6, W - 14, H - 14, LIL2);
    ret(ctx, px + 5, py + 4, W - 10, 1, clarear(LIL, 0.5)); ret(ctx, px + 5, py + H - 7, W - 10, 1, escurecer(LIL, 0.2));
    if (W > H) arcoIris(ctx, px + 9, py + (H >> 1) - 3, W - 18, false); else arcoIris(ctx, px + (W >> 1) - 3, py + 9, H - 18, true);
    estrela(ctx, px + 7, py + 7, AMAR); estrela(ctx, px + W - 14, py + H - 15, AMAR);
    estrelinha(ctx, px + W - 12, py + 7, C.branco); estrelinha(ctx, px + 8, py + H - 13, C.branco);
  }
  I.objeto('casa-quarto-uni-almofadao', { w: 3, h: 2, topo: 3, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { almofadao(ctx, px, py, 48, 32); },
      lado: function (ctx, px, py) { almofadao(ctx, px, py, 32, 48); },
    }) });

  /* ---------- bebedouro (1×1): cocho de água com bica de estrela ---------- */
  function cocho(ctx, x, y, w, h, c) {
    caixa(ctx, x, y + 3, w, h, c); ret(ctx, x + 1, y + 6, w - 2, 1, escurecer(c, 0.3));
    ret(ctx, x, y, w, 5, K); ret(ctx, x + 1, y + 1, w - 2, 3, '#8fd8f0'); ret(ctx, x + 2, y + 1, w - 5, 1, '#d6f6ff');
  }
  // sempre (só com t > 0): um fio de gotas cai da bica, uma por segundo (de y0 a y1, nas colunas xs, alternando), e cada
  // uma abre uma roda na água em ya; a gota anterior ainda faz a roda enquanto a nova cai
  var GOTA_MS = 1000, PASSO_GOTA = 110, PASSO_RODA = 200;
  function pingar(xs, y0, y1, ya) {
    var n = y1 - y0 + 1;
    return function (p, t) {
      if (!t) return;
      for (var k = Math.floor(t / GOTA_MS), j = k - 1; j <= k; j++) {
        if (j < 0) continue;
        var idade = t - j * GOTA_MS, s = Math.floor(idade / PASSO_GOTA), x = xs[j % xs.length];
        if (s < n) { p.r(x, y0 + s, 1, 2, '#8fd8f0'); p.r(x, y0 + s, 1, 1, C.branco); continue; }   // gota: luz em cima
        s = Math.floor((idade - n * PASSO_GOTA) / PASSO_RODA);
        if (s === 0) p.r(x, ya, 1, 1, C.branco);
        else if (s < 3) { p.r(x - 1, ya + s - 1, 1, 1, '#d6f6ff'); p.r(x + 1, ya + s - 1, 1, 1, '#d6f6ff'); }   // a roda abre e some
      }
    };
  }
  function bica(ctx, x, y) { ret(ctx, x, y, 3, 9, K); ret(ctx, x + 1, y + 1, 1, 7, C.metal); estrela(ctx, x - 2, y - 6, AMAR); }
  I.objeto('casa-quarto-uni-bebedouro', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        bica(ctx, px + 7, py - 6);
        cocho(ctx, px + 1, py + 2, 14, 10, LIL); estrelinha(ctx, px + 6, py + 9, C.branco); ret(ctx, px + 8, py + 3, 1, 2, '#d6f6ff');
      },
      cima: function (ctx, px, py) {
        cocho(ctx, px + 1, py, 14, 12, escurecer(LIL, 0.1)); bica(ctx, px + 7, py + 1);
      },
      lado: function (ctx, px, py) {
        bica(ctx, px + 11, py - 6); ret(ctx, px + 9, py + 1, 3, 2, K);
        cocho(ctx, px + 3, py + 2, 10, 10, LIL); ret(ctx, px + 2, py + 6, 1, 4, K);
      },
    }),
    // de frente, das pontas da estrela; de costas, a estrela fica rente à água (pingo curto); de lado, do bico
    anim: CA.sempre({ baixo: pingar([5, 11], -6, 2, 4), cima: pingar([5, 11], 0, 1, 2), lado: pingar([8], 1, 3, 4) }) });

  /* ---------- comedouro de cenouras (1×1) ---------- */
  function cenoura(ctx, x, y, deitada) {
    if (deitada) { ret(ctx, x, y, 7, 3, K); ret(ctx, x + 1, y + 1, 5, 1, C.laranja); ret(ctx, x + 6, y - 1, 3, 2, '#5fc85a'); return; }
    ret(ctx, x, y, 3, 7, K); ret(ctx, x + 1, y + 1, 1, 5, C.laranja); ret(ctx, x - 1, y - 2, 2, 2, '#5fc85a'); ret(ctx, x + 2, y - 3, 2, 3, '#4aa84a');
  }
  function cesto(ctx, x, y, w, h, frente) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, '#f0b8ff');
    for (var j = y + 3; j < y + h - 1; j += 3) ret(ctx, x + 1, j, w - 2, 1, escurecer('#f0b8ff', 0.18));
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear('#f0b8ff', 0.5));
    if (frente) { ret(ctx, x + (w >> 1) - 3, y + 4, 6, 4, K); ret(ctx, x + (w >> 1) - 2, y + 5, 4, 2, AMAR); }   // plaquinha
  }
  I.objeto('casa-quarto-uni-comedouro', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        cenoura(ctx, px + 4, py - 5); cenoura(ctx, px + 8, py - 7); cenoura(ctx, px + 11, py - 4);
        cesto(ctx, px + 1, py, 14, 15, true);
      },
      cima: function (ctx, px, py) {
        cenoura(ctx, px + 5, py - 7); cenoura(ctx, px + 9, py - 5);
        cesto(ctx, px + 1, py - 1, 14, 16, false); ret(ctx, px + 2, py + 5, 12, 1, escurecer('#f0b8ff', 0.35));
      },
      lado: function (ctx, px, py) {
        cenoura(ctx, px + 4, py - 4, true); cenoura(ctx, px + 6, py - 7);
        cesto(ctx, px + 3, py, 11, 15, false);
        ret(ctx, px + 3, py + 4, 2, 4, K); ret(ctx, px + 2, py + 5, 1, 2, AMAR);
      },
    }) });

  /* ---------- tapete de nuvem (3×2; lado 2×3) ---------- */
  function nuvem(ctx, px, py, W, H) {
    var bolas = [], r = 6, i;
    for (i = 0; i <= W - 2 * r - 4; i += 7) { bolas.push([px + r + 2 + i, py + r + 1]); bolas.push([px + r + 2 + i, py + H - r - 2]); }
    for (i = 0; i <= H - 2 * r - 4; i += 7) { bolas.push([px + r + 1, py + r + 2 + i]); bolas.push([px + W - r - 2, py + r + 2 + i]); }
    bolas.forEach(function (b) { circulo(ctx, b[0], b[1], r, K); });
    ret(ctx, px + r, py + r, W - 2 * r, H - 2 * r, K);
    bolas.forEach(function (b) { circulo(ctx, b[0], b[1], r - 1, C.branco); });
    ret(ctx, px + r + 1, py + r + 1, W - 2 * r - 2, H - 2 * r - 2, C.branco);
    arred(ctx, px + 9, py + 9, W - 18, H - 18, LIL2);
    bolas.forEach(function (b) { ret(ctx, b[0] - 2, b[1] - 3, 3, 1, '#fdfbff'); });
    estrela(ctx, px + (W >> 1) - 3, py + (H >> 1) - 3, AMAR);
    estrelinha(ctx, px + 12, py + 11, LIL); estrelinha(ctx, px + W - 15, py + H - 14, LIL);
  }
  I.objeto('casa-quarto-uni-tapete', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { nuvem(ctx, px, py, 48, 32); },
      lado: function (ctx, px, py) { nuvem(ctx, px, py, 32, 48); },
    }) });

  /* ---------- baú de brinquedos (2×1; lado 1×2) ---------- */
  function tampa(ctx, x, y, w, h) { arred(ctx, x, y, w, h, K); arred(ctx, x + 1, y + 1, w - 2, h - 2, ROXO); ret(ctx, x + 2, y + 1, w - 4, 1, clarear(ROXO, 0.45)); }
  function faisca(p, x, y, c) { p.r(x + 1, y, 1, 3, c); p.r(x, y + 1, 3, 1, c); }
  var BAU_DENTRO = '#4a3590';
  var BAU_ON = {
    baixo: function (p) {   // tampa levantada atrás (só a faixa de cima aparece); lá dentro, os brinquedos
      p.r(1, -8, 30, 5, K); p.r(2, -7, 28, 3, LIL2); p.r(2, -7, 28, 1, C.branco); p.r(4, -6, 1, 1, ROXO); p.r(12, -5, 1, 1, ROXO); p.r(20, -6, 1, 1, ROXO);
      p.r(2, -3, 28, 5, K); p.r(3, -2, 26, 4, BAU_DENTRO);
      p.m(5, -6, ['.kk.', 'kbbk', 'kbbk', 'kkkk'], { k: K, b: '#5fb4ff' }); p.m(13, -7, ['.kkk.', 'kpppk', 'kpwpk', 'kpppk'], { k: K, p: '#ff9cc6', w: C.branco });
      p.m(20, -7, ['k.k', 'kyk', 'kyk', 'kkk'], { k: K, y: AMAR }); p.m(24, -5, ['.kk', 'kgk', 'kkk'], { k: K, g: C.verde });
    },
    cima: function (p) {   // de costas, a tampa aberta é uma parede roxa que sobe
      p.r(1, -8, 30, 8, K); p.r(2, -7, 28, 6, ROXO); p.r(2, -7, 28, 1, clarear(ROXO, 0.45)); p.r(2, -3, 28, 1, escurecer(ROXO, 0.2));
      p.r(4, -7, 2, 2, AMAR); p.r(26, -7, 2, 2, AMAR); p.r(7, -6, 3, 6, AMAR); p.r(22, -6, 3, 6, AMAR);
    },
    lado: function (p) {
      p.r(2, -5, 12, 29, K); p.r(3, -4, 10, 27, BAU_DENTRO); p.r(13, -6, 2, 31, K); p.r(13, -5, 1, 29, LIL2);
      p.m(5, -2, ['kkk', 'kbk', 'kkk'], { k: K, b: '#5fb4ff' }); p.m(7, 6, ['.kk.', 'kppk', 'kppk', '.kk.'], { k: K, p: '#ff9cc6' });
      p.m(5, 14, ['k.k', 'kyk', 'kkk'], { k: K, y: AMAR });
    },
    anim: {   // faíscas de magia subindo do baú
      baixo: function (p, t) { [0, 1, 2].forEach(function (i) { var u = (t / 100 + i * 7) % 16; if (u < 12) faisca(p, 4 + i * 11 + (i & 1) * 3, -10 - Math.floor(u / 2), i === 1 ? AMAR : C.branco); }); },
      cima: function (p, t) { var u = Math.floor(t / 200) % 3; p.r(6 + u * 9, -12, 1, 1, AMAR); },
      lado: function (p, t) { var u = (t / 100) % 12; p.r(7, -5 - Math.floor(u / 2), 1, 1, AMAR); p.r(9, -4 - Math.floor(u / 3), 1, 1, C.branco); },
    },
  };
  usos('casa-quarto-uni-bau', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        tampa(ctx, px + 1, py - 8, 30, 10);
        caixa(ctx, px + 2, py + 1, 28, 14, LIL);
        ret(ctx, px + 7, py - 7, 3, 21, AMAR); ret(ctx, px + 22, py - 7, 3, 21, AMAR);                // cintas douradas
        ret(ctx, px + 13, py - 1, 6, 6, K); ret(ctx, px + 14, py, 4, 4, AMAR); ret(ctx, px + 15, py + 2, 2, 1, K);   // fecho
        estrelinha(ctx, px + 3, py + 5, C.branco); estrelinha(ctx, px + 26, py + 8, C.branco);
      },
      cima: function (ctx, px, py) {
        tampa(ctx, px + 1, py - 8, 30, 10);
        caixa(ctx, px + 2, py + 1, 28, 14, escurecer(LIL, 0.1));
        ret(ctx, px + 7, py - 7, 3, 21, escurecer(AMAR, 0.15)); ret(ctx, px + 22, py - 7, 3, 21, escurecer(AMAR, 0.15));
        ret(ctx, px + 4, py + 1, 2, 2, K); ret(ctx, px + 26, py + 1, 2, 2, K);                         // dobradiças
      },
      lado: function (ctx, px, py) {
        caixa(ctx, px + 2, py + 24, 12, 7, escurecer(LIL, 0.1));                                        // faixa da frente
        arred(ctx, px + 1, py - 6, 14, 31, K); arred(ctx, px + 2, py - 5, 12, 29, ROXO);                // tampa abaulada de cima
        ret(ctx, px + 7, py - 5, 3, 29, clarear(ROXO, 0.3)); ret(ctx, px + 8, py - 4, 1, 27, clarear(ROXO, 0.55));
        ret(ctx, px + 3, py - 5, 1, 29, escurecer(ROXO, 0.15)); ret(ctx, px + 12, py - 5, 1, 29, escurecer(ROXO, 0.2));
        ret(ctx, px + 1, py + 2, 14, 3, AMAR); ret(ctx, px + 1, py + 16, 14, 3, AMAR);                  // ferragens
        ret(ctx, px + 1, py + 2, 14, 1, K); ret(ctx, px + 1, py + 19, 14, 1, K);
        ret(ctx, px + 6, py + 25, 5, 5, K); ret(ctx, px + 7, py + 26, 3, 3, AMAR); ret(ctx, px + 8, py + 27, 1, 1, K);   // fechadura
      },
    }) }, BAU_ON);

  /* ---------- estrela luminosa (1×1, um lado só) ---------- */
  var ESTR_ON = { baixo: function (p) {   // acesa: corpo claro, miolo branco e pontas de luz
      var G = ['......#......', '.....###.....', '....#####....', '#############', '.###########.', '..#########..', '...#######...', '..####.####..', '.###.....###.', '.#.........#.'];
      p.m(1, -15, G, { '#': '#fff08a' }); p.r(6, -13, 1, 3, C.branco); p.r(4, -11, 5, 1, C.branco); p.r(5, -10, 3, 3, C.branco);
      p.r(6, -15, 1, 1, C.branco); p.r(1, -12, 1, 1, C.branco); p.r(13, -12, 1, 1, C.branco);
    },
    anim: { baixo: function (p, t) {   // raios em cruz que pulsam em volta, além das pontas
      var f = Math.floor(t / 300) % 3, a = [1, 2, 3][f];
      p.r(7, -16 - a, 1, a, '#fff6c8'); p.r(-a, -11, a, 1, '#fff6c8'); p.r(15, -11, a, 1, '#fff6c8');
      p.r(1 - f, -4 + f, 1, 1, C.branco); p.r(14 + f, -4 + f, 1, 1, C.branco); p.r(-2 + f, -17 + f, 1, 1, '#ffe27a'); p.r(16 - f, -17 + f, 1, 1, '#ffe27a');
    } } };
  usos('casa-quarto-uni-estrela', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 10, 10, 5, K); ret(ctx, px + 4, py + 11, 8, 3, LIL); ret(ctx, px + 4, py + 11, 8, 1, clarear(LIL, 0.5));
      ret(ctx, px + 7, py - 2, 2, 12, K);
      var ex = px + 1, ey = py - 15, G = ['......#......', '.....###.....', '....#####....', '#############', '.###########.',
        '..#########..', '...#######...', '..####.####..', '.###.....###.', '.#.........#.'];
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { D.matriz(ctx, ex + d[0], ey + d[1], G, { '#': K }); });   // contorno
      D.matriz(ctx, ex, ey, G, { '#': AMAR });
      ret(ctx, ex + 6, ey + 2, 1, 2, '#fff6c8'); ret(ctx, ex + 3, ey + 3, 2, 1, '#fff6c8');
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 400) % 4;
      var p = [[0, -12], [14, -14], [1, -3], [14, -4]][f];
      estrelinha(ctx, px + p[0], py + p[1], C.branco);
    } }, ESTR_ON);

  /* ---------- espelho de nuvem (parede, 1×2) ---------- */
  I.objeto('casa-quarto-uni-espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 5, py + 7, 3, K); circulo(ctx, px + 10, py + 6, 4, K);
      arred(ctx, px + 2, py + 7, 12, 19, K); circulo(ctx, px + 5, py + 7, 2, C.branco); circulo(ctx, px + 10, py + 6, 3, C.branco);
      arred(ctx, px + 3, py + 8, 10, 17, C.branco);
      ret(ctx, px + 4, py + 10, 8, 13, '#d8e6ff'); ret(ctx, px + 5, py + 11, 1, 5, C.branco); ret(ctx, px + 6, py + 12, 1, 2, C.branco);
      arcoIris(ctx, px + 4, py + 19, 8, false);
      estrelinha(ctx, px + 9, py + 11, AMAR);
    } });

  /* ---------- cabideiro de escovas (1×1) ---------- */
  function escova(ctx, x, y, c) { ret(ctx, x, y, 4, 6, K); ret(ctx, x + 1, y + 1, 2, 2, c); ret(ctx, x + 1, y + 3, 2, 2, C.branco); }
  I.objeto('casa-quarto-uni-cabideiro', { w: 1, h: 1, topo: 20, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 12, 10, 3, K); ret(ctx, px + 4, py + 12, 8, 1, LIL);
      ret(ctx, px + 7, py - 14, 3, 27, K); ret(ctx, px + 8, py - 13, 1, 25, C.branco);
      for (var j = 0; j < 25; j += 4) ret(ctx, px + 8, py - 13 + j, 1, 2, '#ff9cc6');                // listra de pirulito
      ret(ctx, px + 2, py - 10, 13, 2, K);
      estrela(ctx, px + 5, py - 19, AMAR);
      escova(ctx, px + 1, py - 8, ARCO[0]); escova(ctx, px + 12, py - 8, ARCO[4]);
      ret(ctx, px + 3, py - 4, 2, 9, ARCO[5]); ret(ctx, px + 12, py - 2, 2, 7, ARCO[2]);              // fitas
    } });
})();
