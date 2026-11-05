/* Casa do jogador: móveis do kit Banheiro (prefixo casa-banheiro-; docs/contratos/casa.md §5). Banheira, vaso, pia,
   tapetinho e cesto no chão; espelho, toalheiro e armarinho na parede. Cada um nas direções do kit (kits-b.js):
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada). Movimento de sempre (casa.md
   §13.7): o patinho da banheira boia e a espuma brilha. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K, CA = R.CasaArte, virado = CA.virado, usos = CA.objeto;
  var LOUCA = '#fbfbff', LOUCA2 = '#dfe3f3', AGUA = '#8fd8f0', AGUA2 = '#c8f0ff', MENTA = '#7fe0c8', LIL = '#c9a8ff';

  // retângulo de cantos cortados (1 px), cor cheia
  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  // caixa com contorno, luz em cima e à esquerda, sombra embaixo
  function caixa(ctx, x, y, w, h, c) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, c);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
    ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(c, 0.2));
  }
  function espuma(ctx, x, y) { circulo(ctx, x, y, 2, K); circulo(ctx, x, y, 1, C.branco); ret(ctx, x - 1, y - 1, 1, 1, AGUA2); }
  function torneira(ctx, x, y) { ret(ctx, x, y, 5, 3, K); ret(ctx, x + 1, y + 1, 3, 1, C.metal); ret(ctx, x + 2, y + 3, 1, 2, K); }

  /* ---------- banheira (2×3; lado 3×2) ---------- */
  // pés de leão dourados
  function pe(ctx, x, y) { ret(ctx, x, y, 4, 4, K); ret(ctx, x + 1, y + 1, 2, 2, C.ouro); ret(ctx, x + 1, y + 1, 1, 1, C.ouro3); }
  // patinho amarelo no canto (x, y) da caixa, bico para a esquerda (b = -1) ou para a direita (b = 1)
  function patinho(p, x, y, b) {
    p.r(x, y, 7, 5, K); p.r(x + 1, y + 1, 5, 3, C.ouro); p.r(b < 0 ? x - 1 : x + 6, y + 2, 2, 1, C.laranja);
    p.r(b < 0 ? x + 2 : x + 4, y + 1, 1, 1, K);
  }
  var PATINHO = { baixo: [17, 9, -1], cima: [9, 5, 1], lado: [21, 3, -1] };
  function pincel(ctx, px, py) { return { r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); } }; }
  // a banheira vista de cima, comprida em pé: torneira no fundo (baixo) ou na frente (cima); na casa (uid) o patinho boia no anim
  function banheiraEmPe(ctx, px, py, torneiraFrente, uid) {
    pe(ctx, px + 3, py + 43); pe(ctx, px + 25, py + 43);
    arred(ctx, px + 1, py - 3, 30, 47, K); arred(ctx, px + 2, py - 2, 28, 45, LOUCA);
    ret(ctx, px + 2, py + 34, 28, 9, LIL); ret(ctx, px + 2, py + 34, 28, 1, K);      // a frente lilás
    ret(ctx, px + 2, py + 35, 28, 1, clarear(LIL, 0.4)); ret(ctx, px + 2, py + 41, 28, 1, escurecer(LIL, 0.2));
    for (var i = 0; i < 4; i++) ret(ctx, px + 6 + i * 6, py + 38, 2, 2, C.branco);   // bolinhas
    arred(ctx, px + 5, py + 1, 22, 31, K); arred(ctx, px + 6, py + 2, 20, 29, AGUA);
    ret(ctx, px + 7, py + 3, 1, 26, AGUA2); ret(ctx, px + 9, py + 3, 15, 1, AGUA2);
    ret(ctx, px + 2, py - 2, 28, 1, C.branco); ret(ctx, px + 2, py - 1, 1, 34, C.branco);
    [[11, 22], [16, 25], [21, 21], [13, 27], [19, 28]].forEach(function (b) { espuma(ctx, px + b[0], py + b[1]); });
    if (torneiraFrente) {
      torneira(ctx, px + 14, py + 30);
    } else {
      torneira(ctx, px + 14, py - 6); ret(ctx, px + 16, py - 1, 1, 3, AGUA2);
    }
    var b = PATINHO[torneiraFrente ? 'cima' : 'baixo'];
    if (!uid) patinho(pincel(ctx, px, py), b[0], b[1], b[2]);
  }
  function banheiraLado(ctx, px, py, obj) {
    pe(ctx, px + 3, py + 27); pe(ctx, px + 41, py + 27);
    arred(ctx, px + 1, py - 3, 46, 31, K); arred(ctx, px + 2, py - 2, 44, 29, LOUCA);
    ret(ctx, px + 2, py + 19, 44, 8, LIL); ret(ctx, px + 2, py + 19, 44, 1, K);
    ret(ctx, px + 2, py + 20, 44, 1, clarear(LIL, 0.4)); ret(ctx, px + 2, py + 25, 44, 1, escurecer(LIL, 0.2));
    for (var i = 0; i < 7; i++) ret(ctx, px + 5 + i * 6, py + 22, 2, 2, C.branco);
    arred(ctx, px + 5, py + 1, 36, 16, K); arred(ctx, px + 6, py + 2, 34, 14, AGUA);
    ret(ctx, px + 7, py + 3, 30, 1, AGUA2); ret(ctx, px + 2, py - 2, 44, 1, C.branco);
    [[10, 10], [15, 13], [20, 9], [26, 12], [31, 10]].forEach(function (b) { espuma(ctx, px + b[0], py + b[1]); });
    ret(ctx, px + 42, py - 2, 3, 9, K); ret(ctx, px + 39, py + 4, 4, 3, K); ret(ctx, px + 43, py - 1, 1, 7, C.metal);   // torneira à direita
    ret(ctx, px + 40, py + 5, 2, 1, C.metal);
    if (!(obj && obj.uid)) patinho(pincel(ctx, px, py), 21, 3, -1);
  }
  // sempre: o patinho sobe e desce 1 px (600 ms) e, uma de cada vez, uma bolha de espuma brilha (os brilhos só com t > 0)
  var ESPUMA = { baixo: [[11, 22], [16, 25], [21, 21], [13, 27], [19, 28]], lado: [[10, 10], [15, 13], [20, 9], [26, 12], [31, 10]] };
  ESPUMA.cima = ESPUMA.baixo;
  function boiar(dir) {
    return function (p, t, obj) {
      var b = PATINHO[dir], e = ESPUMA[dir], k = Math.floor(t / 600);
      if (obj.uid) patinho(p, b[0], b[1] - (k % 2), b[2]);
      if (!t) return;
      var bo = e[(k * 3) % 5];                                                              // brilho: o pontinho de luz clareia e acende ao lado
      p.r(bo[0] - 1, bo[1] - 1, 1, 1, C.branco); p.r(bo[0] - 2, bo[1] - 2, 1, 1, C.branco);
    };
  }
  I.objeto('casa-banheiro-banheira', { w: 2, h: 3, topo: 6, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py, obj) { banheiraEmPe(ctx, px, py, false, obj && obj.uid); },
      cima: function (ctx, px, py, obj) { banheiraEmPe(ctx, px, py, true, obj && obj.uid); },
      lado: banheiraLado,
    }),
    anim: CA.sempre({ baixo: boiar('baixo'), cima: boiar('cima'), lado: boiar('lado') }) });

  /* ---------- vaso sanitário (1×1) ---------- */
  function caixaDescarga(ctx, x, y, w, h) { caixa(ctx, x, y, w, h, LOUCA); ret(ctx, x + 1, y + h - 2, w - 2, 1, LOUCA2); }
  var AGUAV = '#6ec8f0', AGUAV2 = '#3a9ad0';
  // redemoinho do vaso: o miolo azul-escuro e um pontinho branco que dá a volta no oco (x0,y0 = canto do oco, 6×3)
  var VOLTA = [[0, 1], [1, 0], [3, 0], [5, 0], [5, 1], [5, 2], [3, 2], [1, 2]];
  function giro(p, x0, y0, t) {
    var i = Math.floor(t / 90) % 8;
    p.r(x0 + VOLTA[i][0], y0 + VOLTA[i][1], 1, 1, C.branco); p.r(x0 + VOLTA[(i + 7) % 8][0], y0 + VOLTA[(i + 7) % 8][1], 1, 1, AGUA2);
    p.r(x0 + VOLTA[(i + 4) % 8][0], y0 + VOLTA[(i + 4) % 8][1], 1, 1, AGUAV2);
  }
  var VASO_ON = {
    baixo: function (p) {   // tampa levantada na caixa d'água; no oco, a água girando
      p.r(4, -7, 8, 6, K); p.r(5, -6, 6, 4, C.rosa2); p.r(5, -6, 6, 1, clarear(C.rosa2, 0.5));
      p.r(4, 3, 8, 5, K); p.r(5, 4, 6, 3, AGUAV); p.r(6, 5, 3, 1, AGUAV2); p.r(10, 4, 1, 1, AGUA2);
    },
    cima: function (p) { p.r(3, -8, 10, 8, K); p.r(4, -7, 8, 6, C.rosa2); p.r(4, -7, 8, 1, clarear(C.rosa2, 0.5)); p.r(3, 1, 1, 8, AGUA2); p.r(12, 1, 1, 8, AGUA2); },
    lado: function (p) {
      p.r(10, -5, 5, 8, K); p.r(11, -4, 3, 6, C.rosa2); p.r(11, -4, 3, 1, clarear(C.rosa2, 0.5));
      p.r(3, 3, 7, 5, K); p.r(4, 4, 5, 3, AGUAV); p.r(5, 5, 3, 1, AGUAV2);
    },
    anim: {
      baixo: function (p, t) { giro(p, 5, 4, t); },
      cima: function (p, t) { var u = Math.floor(t / 100) % 4; p.r(3, 2 + u * 2, 1, 1, AGUAV); p.r(12, 4 + ((u + 2) % 4) * 2, 1, 1, AGUAV); },
      lado: function (p, t) { giro(p, 4, 4, t - 0); },
    },
  };
  usos('casa-banheiro-vaso', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        caixaDescarga(ctx, px + 3, py - 8, 10, 9); ret(ctx, px + 7, py - 6, 2, 2, C.rosa);           // botão rosa
        arred(ctx, px + 4, py + 9, 8, 6, K); ret(ctx, px + 5, py + 9, 6, 5, LOUCA2);              // pé
        arred(ctx, px + 2, py + 1, 12, 10, K); arred(ctx, px + 3, py + 2, 10, 8, C.rosa2);         // tampa rosa
        ret(ctx, px + 4, py + 3, 8, 1, clarear(C.rosa2, 0.5)); ret(ctx, px + 7, py + 5, 2, 2, C.branco);
      },
      cima: function (ctx, px, py) {
        arred(ctx, px + 2, py - 4, 12, 9, K); arred(ctx, px + 3, py - 3, 10, 7, C.rosa2);         // tampa atrás
        ret(ctx, px + 4, py - 2, 8, 1, clarear(C.rosa2, 0.5));
        caixaDescarga(ctx, px + 3, py + 1, 10, 11); ret(ctx, px + 4, py + 4, 8, 1, LOUCA2);       // as costas da caixa
        ret(ctx, px + 5, py + 12, 6, 3, K); ret(ctx, px + 6, py + 12, 4, 2, LOUCA2);
      },
      lado: function (ctx, px, py) {
        caixaDescarga(ctx, px + 9, py - 6, 7, 14); ret(ctx, px + 11, py - 4, 2, 2, C.rosa);             // caixa d'água atrás
        ret(ctx, px + 4, py + 7, 7, 8, K); ret(ctx, px + 5, py + 7, 5, 7, LOUCA2);
        arred(ctx, px + 1, py + 1, 11, 9, K); arred(ctx, px + 2, py + 2, 9, 7, C.rosa2);                 // assento de cima
        ret(ctx, px + 3, py + 2, 7, 1, clarear(C.rosa2, 0.5)); ret(ctx, px + 4, py + 4, 5, 3, LOUCA);
      },
    }) }, VASO_ON);

  /* ---------- pia de coluna (1×1) ---------- */
  function coluna(ctx, px, py) {
    ret(ctx, px + 5, py + 3, 6, 10, K); ret(ctx, px + 6, py + 3, 4, 9, LOUCA); ret(ctx, px + 9, py + 3, 1, 9, LOUCA2);
    ret(ctx, px + 3, py + 12, 10, 3, K); ret(ctx, px + 4, py + 12, 8, 2, LOUCA2);
  }
  var PIA_ON = {
    baixo: function (p) { p.r(8, -7, 2, 3, AGUA); p.r(8, -7, 1, 3, AGUA2); p.r(5, -4, 6, 3, AGUA2); p.r(6, -3, 2, 1, C.branco); },
    cima: function (p) { p.r(5, -5, 6, 2, AGUA2); p.r(6, -5, 2, 1, C.branco); p.r(9, -4, 1, 1, C.branco); },
    lado: function (p) { p.r(8, -8, 1, 5, AGUA); p.r(8, -8, 1, 2, AGUA2); p.r(5, -4, 4, 3, AGUA2); p.r(6, -3, 1, 1, C.branco); },
    anim: {
      baixo: function (p, t) { var u = Math.floor(t / 70) % 3; p.r(8, -7 + u, 1, 1, C.branco); p.r(9, -5 + u, 1, 1, AGUA2); p.r(5 + (u + 1) % 3 * 2, -3, 1, 1, C.branco); },
      cima: function (p, t) { var u = Math.floor(t / 140) % 3; p.r(5 + u * 2, -4, 1, 1, C.branco); p.r(9 - u, -5, 1, 1, AGUA); },
      lado: function (p, t) { var u = Math.floor(t / 70) % 3; p.r(8, -8 + u * 2, 1, 1, C.branco); p.r(5 + (u + 1) % 3, -3, 1, 1, C.branco); },
    },
  };
  usos('casa-banheiro-pia', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        coluna(ctx, px, py);
        torneira(ctx, px + 6, py - 11); ret(ctx, px + 7, py - 12, 3, 1, MENTA);
        arred(ctx, px + 1, py - 7, 14, 11, K); arred(ctx, px + 2, py - 6, 12, 9, LOUCA);
        arred(ctx, px + 4, py - 5, 8, 5, K); ret(ctx, px + 5, py - 4, 6, 3, AGUA);
        ret(ctx, px + 2, py + 1, 12, 1, MENTA); ret(ctx, px + 12, py - 8, 3, 3, K); ret(ctx, px + 13, py - 7, 1, 1, C.rosa);  // sabonete
      },
      cima: function (ctx, px, py) {
        coluna(ctx, px, py);
        arred(ctx, px + 1, py - 7, 14, 11, K); arred(ctx, px + 2, py - 6, 12, 9, LOUCA);
        arred(ctx, px + 4, py - 6, 8, 4, K); ret(ctx, px + 5, py - 5, 6, 2, AGUA);
        ret(ctx, px + 2, py + 1, 12, 1, MENTA); torneira(ctx, px + 6, py - 2); ret(ctx, px + 7, py - 2, 3, 1, MENTA);
      },
      lado: function (ctx, px, py) {
        coluna(ctx, px, py);
        arred(ctx, px + 2, py - 7, 12, 11, K); arred(ctx, px + 3, py - 6, 10, 9, LOUCA);
        arred(ctx, px + 4, py - 5, 6, 5, K); ret(ctx, px + 5, py - 4, 4, 3, AGUA);
        ret(ctx, px + 3, py + 1, 10, 1, MENTA);
        ret(ctx, px + 11, py - 11, 3, 7, K); ret(ctx, px + 8, py - 11, 4, 3, K); ret(ctx, px + 12, py - 10, 1, 5, C.metal); ret(ctx, px + 9, py - 10, 3, 1, C.metal);
      },
    }) }, PIA_ON);

  /* ---------- tapetinho (2×1; lado 1×2) ---------- */
  function tapetinho(ctx, px, py, W, H) {
    arred(ctx, px + 1, py + 1, W - 2, H - 2, K); arred(ctx, px + 2, py + 2, W - 4, H - 4, MENTA);
    arred(ctx, px + 4, py + 4, W - 8, H - 8, C.branco); arred(ctx, px + 5, py + 5, W - 10, H - 10, '#a8f0dc');
    // franjinha nas pontas
    if (W > H) { for (var y = py + 3; y < py + H - 3; y += 2) { ret(ctx, px, y, 1, 1, C.branco); ret(ctx, px + W - 1, y, 1, 1, C.branco); } }
    else { for (var x = px + 3; x < px + W - 3; x += 2) { ret(ctx, x, py, 1, 1, C.branco); ret(ctx, x, py + H - 1, 1, 1, C.branco); } }
    var cx = px + (W >> 1), cy = py + (H >> 1);                                 // patinho no meio
    ret(ctx, cx - 2, cy - 1, 4, 3, C.ouro); ret(ctx, cx, cy - 3, 3, 2, C.ouro); ret(ctx, cx + 3, cy - 2, 1, 1, C.laranja); ret(ctx, cx + 1, cy - 3, 1, 1, K);
  }
  I.objeto('casa-banheiro-tapete', { w: 2, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { tapetinho(ctx, px, py, 32, 16); },
      lado: function (ctx, px, py) { tapetinho(ctx, px, py, 16, 32); },
    }) });

  /* ---------- cesto de roupa (1×1) ---------- */
  var CESTO_ON = { baixo: function (p) {   // mais roupa saindo e pendurada na borda: toalhinha amarela, meia e pano azul
    p.r(6, -6, 4, 4, K); p.r(7, -5, 2, 3, '#ffd34d'); p.r(7, -5, 1, 1, C.branco);
    p.r(3, -3, 3, 7, K); p.r(4, -2, 1, 5, C.rosa); p.r(4, 3, 1, 1, C.branco);
    p.r(10, -2, 3, 6, K); p.r(11, -1, 1, 4, C.azul);
  } };
  usos('casa-banheiro-cesto', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py - 6, 5, 4, K); ret(ctx, px + 5, py - 5, 3, 3, C.rosa);                 // meia e camiseta saindo
      ret(ctx, px + 8, py - 5, 5, 4, K); ret(ctx, px + 9, py - 4, 3, 3, C.azul);
      ret(ctx, px + 2, py - 2, 12, 17, K); ret(ctx, px + 3, py - 1, 10, 15, C.madeiraClara);
      for (var y = 1; y < 14; y += 3) ret(ctx, px + 3, py + y, 10, 1, C.madeira);                // trama
      for (var x = 4; x < 13; x += 3) ret(ctx, px + x, py, 1, 13, escurecer(C.madeiraClara, 0.1));
      ret(ctx, px + 2, py - 2, 12, 2, K); ret(ctx, px + 3, py - 1, 10, 1, C.madeira3);
      ret(ctx, px + 3, py, 1, 13, clarear(C.madeiraClara, 0.3));
      ret(ctx, px + 6, py + 5, 4, 3, K); ret(ctx, px + 7, py + 6, 2, 1, C.rosa2);                // lacinho
    } }, CESTO_ON);

  /* ---------- de parede (1×2) ---------- */
  I.objeto('casa-banheiro-espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      arred(ctx, px + 2, py + 6, 12, 18, K); arred(ctx, px + 3, py + 7, 10, 16, MENTA);
      ret(ctx, px + 4, py + 8, 8, 14, '#d4eef8'); ret(ctx, px + 5, py + 9, 1, 5, C.branco); ret(ctx, px + 6, py + 10, 1, 2, C.branco);
      ret(ctx, px + 9, py + 17, 2, 3, '#e8f8ff');
      ret(ctx, px + 7, py + 4, 2, 2, K); ret(ctx, px + 3, py + 7, 10, 1, clarear(MENTA, 0.4));
      ret(ctx, px + 7, py + 24, 2, 2, K); ret(ctx, px + 7, py + 24, 1, 1, C.rosa);
    } });
  I.objeto('casa-banheiro-toalheiro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 13, 14, 3, K); ret(ctx, px + 2, py + 14, 12, 1, C.metal);
      ret(ctx, px + 1, py + 12, 2, 5, K); ret(ctx, px + 13, py + 12, 2, 5, K);
      ret(ctx, px + 3, py + 15, 10, 13, K); ret(ctx, px + 4, py + 15, 8, 12, C.rosa2);         // toalha
      ret(ctx, px + 4, py + 15, 8, 1, clarear(C.rosa2, 0.5)); ret(ctx, px + 4, py + 16, 1, 10, clarear(C.rosa2, 0.3));
      ret(ctx, px + 4, py + 23, 8, 2, C.branco); ret(ctx, px + 4, py + 26, 8, 1, escurecer(C.rosa2, 0.2));
      for (var x = 4; x < 12; x += 2) ret(ctx, px + x, py + 28, 1, 1, K);
    } });
  var ARM_ON = { baixo: function (p) {   // portinhas abertas de lado: frascos na prateleira de dentro
    p.r(1, 5, 14, 16, K); p.r(2, 6, 12, 14, '#4fa391'); p.r(2, 6, 12, 1, '#7fd0bd'); p.r(2, 13, 12, 1, K); p.r(2, 14, 12, 1, '#7fd0bd');
    p.r(0, 4, 2, 18, K); p.r(0, 5, 1, 16, '#9fe6d4'); p.r(14, 4, 2, 18, K); p.r(15, 5, 1, 16, '#9fe6d4');
    p.r(3, 9, 3, 4, K); p.r(4, 10, 1, 3, C.lilas); p.r(7, 8, 3, 5, K); p.r(8, 9, 1, 3, C.rosa); p.r(11, 10, 2, 3, K); p.r(11, 11, 1, 1, C.branco);
    p.r(3, 16, 4, 4, K); p.r(4, 17, 2, 2, C.branco); p.r(9, 15, 3, 5, K); p.r(10, 16, 1, 3, '#ffd84d');
  } };
  usos('casa-banheiro-armario', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 5, 14, 16, '#9fe6d4');
      ret(ctx, px + 7, py + 6, 1, 14, K);                                                        // duas portinhas
      ret(ctx, px + 5, py + 12, 1, 2, C.ouro); ret(ctx, px + 9, py + 12, 1, 2, C.ouro);
      ret(ctx, px + 3, py + 8, 2, 2, C.branco); ret(ctx, px + 10, py + 16, 2, 1, C.branco);
      ret(ctx, px + 1, py + 22, 14, 2, K); ret(ctx, px + 2, py + 22, 12, 1, C.madeiraClara);   // prateleira
      ret(ctx, px + 3, py + 18, 3, 4, K); ret(ctx, px + 4, py + 19, 1, 3, C.lilas);           // frascos
      ret(ctx, px + 10, py + 19, 3, 3, K); ret(ctx, px + 11, py + 20, 1, 2, C.rosa);
    } }, ARM_ON);
})();
