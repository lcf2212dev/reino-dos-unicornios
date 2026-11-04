/* Casa do jogador: os móveis avulsos de Sala de Jantar (casa.md §12; dados em js/conteudo/casa/moveis-salas.js),
   em pixel art. baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada).
   Paleta: madeira cerejeira, estofado menta, porcelana branca com rosa. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var MAD = '#c9764f', ESTOF = '#a8ecd0', ROSA = '#ff7eb6', VASO = '#5fb4ff', UVA = '#b58cff';

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
  /* ----- usos (docs/contratos/casa.md §13): o estado ligado vem de Reino.CasaUsos.ligado(obj) (sem uid = desligado);
     as animações só desenham quando ligado, só com ret (móvel alto), e espelham na direção 'dir' ----- */
  function ligado(o) { return R.CasaUsos.ligado(o); }
  function pa(ctx, px, py, o) {
    var W = ((o && o.w) || 1) * 16, esp = !!o && o.dir === 'dir';
    return { r: function (x, y, w, h, c) { ret(ctx, px + (esp ? W - x - w : x), py + y, w, h, c); } };
  }
  var ESCURO = '#4a4060';
  function perna(p, x, y, h) { p.r(x, y, 3, h, K); p.r(x + 1, y, 1, h - 1, escurecer(MAD, 0.2)); }
  // florzinhas num vaso (de frente)
  function flores(p, x, y) {
    p.m(x, y, ['.r..y.', 'rRryYy', '.rgyg.', '..gg..'], { r: ROSA, R: C.ouro3, y: C.ouro, Y: '#ff8a3d', g: C.folha3 });
  }

  /* ----- aparador 2×1: móvel baixo com gavetas, vaso e fruteira ----- */
  function gavetas(p, x, y, w, h) {
    p.caixa(x, y, w, h, MAD);
    var n = Math.max(1, Math.floor((w - 2) / 10)), q = Math.floor((w - 2) / n);
    for (var i = 0; i < n; i++) { p.r(x + 2 + i * q, y + 3, q - 2, h - 5, escurecer(MAD, 0.15)); p.r(x + 1 + i * q + Math.floor(q / 2), y + 5, 2, 1, C.ouro); }
  }
  // portas abertas (de frente): o armário vazio por dentro com duas prateleiras e as portas viradas para os lados
  function aberto(p) {
    p.caixa(0, -2, 32, 15, MAD);
    p.r(4, 1, 24, 10, K); p.r(5, 2, 22, 8, ESCURO); p.r(5, 6, 22, 1, MAD); p.r(5, 2, 22, 1, escurecer(ESCURO, 0.3));
    p.m(7, 3, ['.kkkk.', 'kwwwwk'], { k: K, w: C.branco }); p.m(19, 3, ['..kk..', '.kRRk.', 'kRRRRk'], { k: K, R: ROSA });
    p.r(8, 7, 6, 2, C.branco); p.r(9, 7, 4, 1, C.creme); p.r(17, 7, 7, 2, VASO);
    p.r(1, 0, 3, 13, K); p.r(2, 1, 1, 11, clarear(MAD, 0.25)); p.r(2, 6, 1, 1, C.ouro);      // portas abertas nas pontas
    p.r(28, 0, 3, 13, K); p.r(29, 1, 1, 11, clarear(MAD, 0.25)); p.r(29, 6, 1, 1, C.ouro);
  }
  I.objeto('casa-movel-aparador', { w: 2, h: 1, topo: 12, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py), on = ligado(o);
      flores(p, 4, -12); p.m(4, -8, ['.kkkk.', 'kbbbbk', 'kbbbbk', '.kkkk.'], { k: K, b: VASO });
      p.m(18, -6, ['..r.u.', '.rrouu', 'kkkkkk', '.kwwk.'], { k: K, r: '#ff5c6a', o: '#ff8a3d', u: UVA, w: C.branco });
      if (on) aberto(p); else gavetas(p, 0, -2, 32, 15);
      perna(p, 2, 13, 3); perna(p, 27, 13, 3);
    },
    cima: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py);
      flores(p, 22, -12); p.m(22, -8, ['.kkkk.', 'kbbbbk', 'kbbbbk', '.kkkk.'], { k: K, b: VASO });
      p.caixa(0, -2, 32, 15, escurecer(MAD, 0.15)); p.r(3, 2, 26, 1, escurecer(MAD, 0.35)); p.r(3, 7, 26, 1, escurecer(MAD, 0.35));
      if (ligado(o)) { p.r(0, 0, 2, 11, K); p.r(1, 1, 1, 9, clarear(MAD, 0.2)); p.r(30, 0, 2, 11, K); p.r(30, 1, 1, 9, clarear(MAD, 0.2)); }   // portas abertas aparecem nas pontas
      perna(p, 2, 13, 3); perna(p, 27, 13, 3);
    },
    lado: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py);
      // tampo comprido visto de cima, frente das gavetas à esquerda
      p.caixa(3, -4, 13, 34, MAD); p.r(1, -2, 4, 30, K);
      if (ligado(o)) {                                                   // portas abertas: por dentro escuro, com a louça, e as portas nas pontas
        p.r(2, -1, 2, 28, ESCURO); p.r(2, 13, 2, 1, MAD); p.r(2, 3, 2, 3, C.branco); p.r(2, 17, 2, 4, ROSA);
        p.r(0, -2, 1, 8, K); p.r(0, 22, 1, 8, K);
      } else { p.r(2, -1, 2, 28, escurecer(MAD, 0.2)); p.r(2, 6, 2, 1, C.ouro); p.r(2, 20, 2, 1, C.ouro); }
      p.m(6, -9, ['.r.y.', 'rRryY', '.gyg.', 'kbbbk', 'kbbbk', '.kkk.'], { r: ROSA, R: C.ouro3, y: C.ouro, Y: '#ff8a3d', g: C.folha3, k: K, b: VASO });
      p.m(6, 14, ['.kkkk.', 'kroruk', 'kuurok', '.kkkk.'], { k: K, r: '#ff5c6a', o: '#ff8a3d', u: UVA });
      perna(p, 2, 29, 3); perna(p, 12, 29, 3);
    },
  }), anim: function (ctx, px, py, t, o) {
    if (!ligado(o)) return;
    var p = pa(ctx, px, py, o), dir = o.dir || 'baixo', f = Math.floor(t / 300) % 6;
    if (dir === 'cima') return;
    var q = dir === 'baixo' ? [[9, 3], [20, 5], [26, 3], [12, 7], [21, 8], [8, 8]][f] : [[2, 4], [3, 17], [2, 19], [3, 5], [2, 22], [3, 7]][f];
    p.r(q[0], q[1], 1, 1, C.branco);                                   // louça brilhando lá dentro
    if (f % 2) p.r(q[0] - 1, q[1], 3, 1, C.branco); else p.r(q[0], q[1] - 1, 1, 3, C.branco);
  } });

  /* ----- vaso de flores 1×1, grandão no chão ----- */
  I.objeto('casa-movel-vaso-flores', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(1, -14, [
        '..r....y....', '.rRr..yYy.p.', '..rg..gyg.pPp', '...g.g...g.p.', '.l..ggg.gg...', 'lLl..gggg.....', '.lgg.ggg......', '...gg.g.......',
      ], { r: ROSA, R: C.ouro, y: C.ouro, Y: '#ff8a3d', p: UVA, P: C.branco, l: '#ff5c6a', L: C.ouro3, g: C.folha3 });
      p.m(2, -6, [
        '...kkkkkk...', '..kbbbbbbk..', '.kBbbbbbbbk.', 'kBbbbbbbbbbk', 'kBbwbbbwbbbk', 'kBbbwbwbbbbk', 'kbbbbwbbbbbk',
        'kbbbbbbbbbbk', '.kbbbbbbbbk.', '.kbbbbbbbbk.', '..kbbbbbbk..', '..kbbbbbbk..', '...kkkkkk...',
        '..kddddddk..', '..kkkkkkkk..',
      ], { k: K, b: VASO, B: clarear(VASO, 0.45), w: C.branco, d: escurecer(VASO, 0.3) });
    } });

  /* ----- relógio de pé 1×1, bem alto ----- */
  I.objeto('casa-movel-relogio-pe', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py), e = escurecer(MAD, 0.25), on = ligado(o);
      p.m(2, -24, ['....kkkk....', '..kkMMMMkk..', 'kkMMMMMMMMkk'], { k: K, M: e });
      p.caixa(2, -21, 12, 13, MAD);
      p.r(4, -19, 8, 8, K); p.r(5, -18, 6, 6, C.branco); p.r(7, -17, 1, 3, K); p.r(7, -15, 3, 1, K); p.r(5, -18, 6, 1, C.creme);
      p.caixa(3, -8, 10, 17, MAD);
      if (on) { p.r(4, -6, 8, 13, K); p.r(5, -5, 6, 11, '#fff1d6'); p.r(7, -5, 2, 1, C.ouro); }   // janela mais larga: o pêndulo balança no anim
      else {
        p.r(5, -6, 6, 13, K); p.r(6, -5, 4, 11, '#fff1d6');
        p.r(8, -5, 1, 7, K); p.r(6, 2, 4, 3, K); p.r(7, 3, 2, 1, C.ouro);
      }
      p.caixa(1, 9, 14, 6, e); p.r(2, 15, 3, 1, K); p.r(11, 15, 3, 1, K);
    },
    anim: function (ctx, px, py, t, o) {
      if (!ligado(o)) return;
      var p = pa(ctx, px, py, o), s = Math.round(2 * Math.sin(t / 159));   // balança forte, 1 s por ida e volta
      for (var j = 0; j < 7; j++) p.r(7 + Math.round(s * (j + 1) / 8), -4 + j, 1, 1, K);
      p.r(7 + s, 3, 3, 3, K); p.r(8 + s, 4, 1, 1, C.ouro);
    } });

  /* ----- jogo de chá 1×1: mesinha redonda com bule e xícaras ----- */
  I.objeto('casa-movel-jogo-cha', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 3, 8, 7); perna(p, 10, 8, 7);
      p.m(0, 2, ['.kkkkkkkkkkkkkk.', 'kTTTTTTTTTTTTTTk', 'kttttttttttttttk', '.kkkkkkkkkkkkkk.', '..kddddddddddk..', '...kkkkkkkkkk...'],
        { k: K, T: clarear(ESTOF, 0.4), t: ESTOF, d: escurecer(MAD, 0.2) });
      // bule rosa com bico e tampa
      p.m(4, -6, ['...kk...', '..kRRk..', '.kRRRRk.', 'kkrrrrrkk', 'k.rwrrrk.k', '..krrrrk.k', '..kkkkkk..'],
        { k: K, R: clarear(ROSA, 0.4), r: ROSA, w: C.branco });
      // duas xícaras
      p.m(1, 0, ['.kkk.', '.kwkk', 'kkkkk'], { k: K, w: ROSA });
      p.m(11, 0, ['.kkk.', '.kwkk', 'kkkkk'], { k: K, w: ROSA });
    },
    anim: function (ctx, px, py, t, o) {
      if (!ligado(o)) return;
      var p = pincel(ctx, px, py);
      for (var i = 0; i < 3; i++) {                                    // vapor sobe do bule e some
        var u = ((t / 110 + i * 6) % 14) / 14, x = 6 + i * 2 + Math.round(1.5 * Math.sin(t / 240 + i * 2)), y = -7 - Math.floor(7 * u);
        if (u < 0.75) { p.r(x, y, 2, 2, '#d6e6f2'); p.r(x, y, 1, 1, C.branco); }
      }
    } });

  /* ----- quadro de parede 1×2: cacho de uvas ----- */
  I.objeto('casa-movel-quadro-uvas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.r(7, 5, 2, 4, K);
      p.r(1, 9, 14, 17, K); p.r(2, 10, 12, 15, C.ouro); p.r(2, 10, 12, 1, C.ouro3); p.r(2, 24, 12, 1, C.ouro2);
      p.r(3, 11, 10, 13, '#fff1d6');
      p.m(3, 11, [
        '....m.gg..', '....mgggg.', '..uUuuu...', '.uUuuuuu..', '.uuuuuuu..', '..uuuuuu..', '..uuuuu...', '...uuuu...', '....uu....', '....u.....',
      ], { m: C.madeira2, g: C.folha3, u: UVA, U: C.branco });
    } });

  /* ----- banco estofado 2×1 ----- */
  I.objeto('casa-movel-banco', { w: 2, h: 1, topo: 4, solido: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 2, 6, 10); perna(p, 27, 6, 10);
      p.caixa(0, -4, 32, 9, ESTOF); [8, 16, 24].forEach(function (x) { p.r(x, -1, 1, 1, escurecer(ESTOF, 0.35)); });
      p.r(1, 4, 30, 4, K); p.r(2, 4, 28, 3, MAD); p.r(2, 6, 28, 1, escurecer(MAD, 0.25));
      p.m(14, 4, ['kk.', 'krk'], { k: K, r: ROSA });
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      perna(p, 2, 26, 4); perna(p, 11, 26, 4);
      p.caixa(1, -4, 14, 29, ESTOF); [4, 12, 20].forEach(function (y) { p.r(7, y, 1, 1, escurecer(ESTOF, 0.35)); });
      p.r(1, 24, 14, 4, K); p.r(2, 24, 12, 3, MAD);
    },
  }) });
})();
