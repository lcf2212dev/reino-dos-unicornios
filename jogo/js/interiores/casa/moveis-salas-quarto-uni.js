/* Casa do jogador: os móveis avulsos de Quarto do unicórnio (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   Fontinha de água, arco-íris e ferradura de parede, luminária de lua, cesto de maçãs e cristal mágico. Todos de
   uma direção só. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var LIL = '#c9a8ff', ROXO = '#9b7cf0', ROSA = '#ff8fc4', AMAR = '#ffd84d', OURO = '#f5b82e', AGUA = '#7fc8ff';
  var PEDRA = '#d8d0ea', VIME = '#d9a35c', VIME2 = '#b07a3a', MACA = '#ff5a6a', VERDE = '#7fe08a';
  var ARCO = ['#ff7a8a', '#ffb35c', '#ffe066', '#7fe08a', '#7fc8ff', '#b58cff'];

  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  function pintar(ctx, x, y, linhas) {                                                                // '.' vazio
    var cor = { '#': K, a: AGUA, w: C.branco, p: PEDRA, P: '#b8aed0', o: OURO, l: clarear(OURO, 0.5) };
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) { var c = cor[linhas[j][i]]; if (c) ret(ctx, x + i, y + j, 1, 1, c); }
  }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

  /* ---------- fontinha de água (1×1) ---------- */
  I.objeto('casa-movel-fontinha', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      pintar(ctx, px, py - 2, [                                                                        // jorro em arco de gotinhas
        '.....aaaaaa.....', '...aa..ww..aa...', '..a....ww....a..', '..a...####...a..', '.......##.......',
        '.a....####....a.', '.a...#pppp#...a.', '..............a.', '#######..#######', '#paaawaaaaawaap#',
        '#paawaaaaaaaaap#', '#pppppppppppppp#', '#pPPpPPPpPPPpPP#', '#pppppppppppppp#', '.##############.'], 0);
    } });

  /* ---------- arco-íris de parede (2×2) ---------- */
  I.objeto('casa-movel-arco-iris', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, base = py + 22;
      for (var dy = 0; dy < 15; dy++) { var m = Math.round(Math.sqrt(225 - dy * dy)); ret(ctx, cx - m, base - dy, m * 2, 1, K); }   // contorno cheio
      for (var i = 0; i <= ARCO.length; i++) {                                                         // faixas em degraus
        var r = 14 - i * 2, c = i === ARCO.length ? '#e8f6ff' : ARCO[i];                              // miolo de céu
        for (dy = 0; dy < r; dy++) { var meia = Math.round(Math.sqrt(r * r - dy * dy)); ret(ctx, cx - meia, base - dy, meia * 2, 1, c); }
      }
      circulo(ctx, px + 5, py + 23, 4, K); circulo(ctx, px + 9, py + 22, 4, K); circulo(ctx, px + 26, py + 23, 4, K); circulo(ctx, px + 22, py + 22, 4, K);
      circulo(ctx, px + 5, py + 23, 3, C.branco); circulo(ctx, px + 9, py + 22, 3, C.branco);       // nuvens nas pontas
      circulo(ctx, px + 26, py + 23, 3, C.branco); circulo(ctx, px + 22, py + 22, 3, C.branco);
      brilho(ctx, px + 4, py + 6, AMAR); brilho(ctx, px + 28, py + 8, AMAR);
    } });

  /* ---------- ferradura dourada de parede (1×2) ---------- */
  I.objeto('casa-movel-ferradura', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      pintar(ctx, px, py + 3, [                                                                        // U invertido, pontas para fora
        '.......##.......', '....########....', '...#oollllo#....', '..#ollo##ooo#...', '.#olo#....#oo#..', '.#oo#......#o#..',
        '.#o.#......#o#..', '.#oo#......#oo#.', '.#lo#......#o.#.', '.#oo#......#oo#.', '.#oo#......#oo#.', '.#o.#......#o.#.',
        '.#oo#......#oo#.', '#ooo#......#ooo#', '#oo##......##oo#', '####........####'], 0);
      brilho(ctx, px + 8, py + 12, AMAR);
    } });

  /* ---------- luminária de lua (1×1) ---------- */
  I.objeto('casa-movel-luminaria-lua', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      var LUA = ['...####...', '..#yy#....', '.#yyw#....', '#yyw#.....', '#yyy#.....', '#yyy#.....', '#yyyy#...#',
        '.#yyyy###y#', '.#yyyyyyyy#', '..#yyyyyy#.', '...######..'];
      var cor = { '#': K, y: AMAR, w: C.branco };
      for (var j = 0; j < LUA.length; j++) for (var i = 0; i < LUA[j].length; i++) {
        var ch = LUA[j][i]; if (cor[ch]) ret(ctx, px + 3 + i, py - 15 + j, 1, 1, cor[ch]);
      }
      brilho(ctx, px + 11, py - 12, AMAR);
      ret(ctx, px + 7, py - 4, 2, 12, K); ret(ctx, px + 7, py - 3, 1, 10, LIL);                              // a haste
      arred(ctx, px + 3, py + 8, 10, 5, K); arred(ctx, px + 4, py + 9, 8, 3, ROXO); ret(ctx, px + 4, py + 9, 8, 1, LIL);
    } });

  /* ---------- cesto de maçãs (1×1) ---------- */
  function maca(ctx, x, y) { circulo(ctx, x, y, 3, K); circulo(ctx, x, y, 2, MACA); ret(ctx, x - 1, y - 1, 1, 1, C.branco); ret(ctx, x, y - 4, 1, 2, K); ret(ctx, x + 1, y - 4, 2, 1, VERDE); }
  I.objeto('casa-movel-cesto-macas', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      maca(ctx, px + 4, py + 1); maca(ctx, px + 11, py + 1); maca(ctx, px + 8, py - 1);
      ret(ctx, px + 1, py + 4, 14, 10, K); ret(ctx, px + 2, py + 5, 12, 8, VIME);                       // cesto de vime
      for (var y = py + 7; y < py + 13; y += 3) ret(ctx, px + 2, y, 12, 1, VIME2);
      for (var x = px + 4; x < px + 14; x += 4) ret(ctx, x, py + 5, 1, 8, VIME2);
      ret(ctx, px + 2, py + 5, 12, 1, clarear(VIME, 0.4)); ret(ctx, px + 3, py + 13, 10, 2, K);
    } });

  /* ---------- cristal mágico (1×1) ---------- */
  I.objeto('casa-movel-cristal', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var CRISTAL = ['....#....', '...#a#...', '..#aab#..', '..#aab#..', '.#aaabb#.', '.#aaabb#.', '#aaaabbb#',
        '#aaaabbb#', '#acaabbb#', '#acaabbb#', '.#aaabb#.', '.#aaabb#.', '..#aab#..', '...###...'];
      var cor = { '#': K, a: ROSA, b: LIL, c: C.branco };
      for (var j = 0; j < CRISTAL.length; j++) for (var i = 0; i < 9; i++) {
        var ch = CRISTAL[j][i]; if (cor[ch]) ret(ctx, px + 4 + i, py - 14 + j, 1, 1, cor[ch]);
      }
      brilho(ctx, px + 2, py - 10, AMAR); brilho(ctx, px + 14, py - 5, C.branco); brilho(ctx, px + 13, py - 13, ROSA);
      arred(ctx, px + 2, py, 12, 5, K); arred(ctx, px + 3, py + 1, 10, 3, ROXO); ret(ctx, px + 3, py + 1, 10, 1, LIL);   // pedestal
      ret(ctx, px + 4, py + 5, 8, 7, K); ret(ctx, px + 5, py + 5, 6, 6, ROXO); ret(ctx, px + 5, py + 5, 1, 6, LIL);
      ret(ctx, px + 2, py + 11, 12, 3, K); ret(ctx, px + 3, py + 12, 10, 1, ROXO);
    } });
  /* ---------- caminha nuvem (2×2, baixa; lado espelhado) ---------- */
  var NUVEM = [                                                                                        // # contorno, n nuvem, w luz, b sombra
    '................................', '...............#####............', '.............##wwwww##..........', '............#wwnnnnnww#.........',
    '...........#wnnnnnnnnnw#........', '...........#nnnnnnnnnnn#........', '.....######nnnnnnnnnnnn#........', '....#wwwwwwnnnnnnnnnnnn#........',
    '...#wnnnnnnnnnnnnnnnnnn#..#.....', '...#nnnnnnnnnnnnnnnnnnnn##w##...', '...#nnnnnnnnnnnnnnnnnnnnwwnww#..', '...#nnnnnnnnnnnnnnnnnnnnnnnnnw#.',
    '...#bnnnnnnnnnnnnnnnnnnnnnnnnn#.', '...#bnnnnnnnnnnnnnnnnnnnnnnnnb#.', '....#nnnnnnnnnnnnnnnnnnnnnnnnb#.', '.....#nnnnnnnnnnnnnnnnnnnnnnn#..',
    '..###nnnnnnnnnnnnnnnnnnnnnnn#...', '.#wwwnnnnnnnnnnnnnnnnnnnnnnnn#..', '#wnnnnnnnnnnnnnnnnnnnnnnnnnnnw#.', '#nnnnnnnnnnnnnnnnnnnnnnnnnnnnn#.',
    '#bnnnnnnnnnnnnnnnnnnnnnnnnnnnnn#', '#bbbnnnnnnnnnnnnnnnnnnnnnnnnnnb#', '.#bbnnnnnnnnnnnnnnnnnnnnnnnnbb#.', '..##nnnnnnnnnnnnnnnnnnnnnnnnbb#.',
    '....#nnnnnnnnnnnnnnnnnnnnnnn##..', '....#nnnnnnnnnnbbnnnnnnnnnn#....', '....#nnnnnnnnnnbbnnnnnnnnnn#....', '....#bbnnnnnnbb##bbnnnnnnbb#....',
    '.....#bnnnnnnb#..#bnnnnnnb#.....', '.....##nnnnnn##..##nnnnnn##.....', '.......######......######.......'];
  var NUVEM_COR = { '#': K, n: '#eef7ff', w: C.branco, b: '#b9defa' };
  function nuvem(ctx, x, y, espelho) {
    for (var j = 0; j < NUVEM.length; j++) for (var i = 0; i < 32; i++) {
      var c = NUVEM_COR[NUVEM[j][espelho ? 31 - i : i]]; if (c) ret(ctx, x + i, y + j, 1, 1, c);
    }
  }
  function ninho(ctx, x, y) {                                                                         // almofada afundada
    arred(ctx, x - 1, y - 1, 20, 12, '#b9defa');
    arred(ctx, x, y, 18, 10, K); arred(ctx, x + 1, y + 1, 16, 8, LIL);
    ret(ctx, x + 2, y + 1, 14, 2, escurecer(LIL, 0.18)); ret(ctx, x + 2, y + 7, 14, 1, clarear(LIL, 0.4));
  }
  I.objeto('casa-movel-caminha-nuvem', { w: 2, h: 2, topo: 4, solido: true,
    desenhar: R.CasaArte.virado({
      baixo: function (ctx, px, py) {
        nuvem(ctx, px, py - 4, false); ninho(ctx, px + 7, py + 10);
        brilho(ctx, px + 12, py + 15, AMAR); brilho(ctx, px + 20, py + 16, C.branco);
        brilho(ctx, px + 9, py + 3, AMAR); brilho(ctx, px + 25, py + 6, ROSA); brilho(ctx, px + 4, py + 18, AMAR);
      },
      lado: function (ctx, px, py) {
        nuvem(ctx, px, py - 4, true); ninho(ctx, px + 11, py + 12);
        brilho(ctx, px + 15, py + 17, ROSA); brilho(ctx, px + 23, py + 16, AMAR);
        brilho(ctx, px + 22, py + 3, AMAR); brilho(ctx, px + 7, py + 6, C.branco); brilho(ctx, px + 27, py + 18, ROSA);
      },
    }) });
})();
