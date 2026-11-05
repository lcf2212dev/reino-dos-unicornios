/* Casa do jogador: os móveis avulsos de Sala de Estar (casa.md §12; dados em js/conteudo/casa/moveis-salas.js),
   em pixel art. baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada).
   Paleta: madeira mel, piano lilás, tijolo coral, vidro azul-claro. Movimento de sempre (casa.md §13.7): os peixes do
   aquário nadam e o pêndulo do relógio cuco balança. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, CA = R.CasaArte, virado = CA.virado;

  var MAD = '#d99a5b', PIANO = '#b58cff', TIJ = '#ff8a7a', VIDRO = '#bfe9ff', AGUA = '#5fb4ff', PUFE = '#ff7eb6';

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
  function pe(p, x, y) { p.r(x, y, 3, 3, K); p.r(x + 1, y, 1, 2, C.madeira2); }

  /* ----- usos (docs/contratos/casa.md §13): o estado ligado vem de Reino.CasaUsos.ligado(obj) (sem uid = desligado);
     as animações só desenham quando ligado, só com ret (móvel alto), e espelham na direção 'dir' ----- */
  function ligado(o) { return R.CasaUsos.ligado(o); }
  function pa(ctx, px, py, o) {
    var W = ((o && o.w) || 1) * 16, esp = !!o && o.dir === 'dir';
    return { r: function (x, y, w, h, c) { ret(ctx, px + (esp ? W - x - w : x), py + y, w, h, c); } };
  }
  var NOTAS = [PUFE, C.ouro, AGUA, '#7ae0a8'];
  // notinhas subindo e sumindo: n notas entre x0 e x0+larg, de y0 para cima (alt px)
  function notas(p, t, x0, larg, y0, alt, n) {
    for (var i = 0; i < n; i++) {
      var u = ((t + i * 1800 / n) % 1800) / 1800;
      if (u > 0.88) continue;
      var x = x0 + Math.floor(larg * i / n) + Math.round(Math.sin(t / 260 + i * 2));
      var y = y0 - Math.floor(alt * u), c = NOTAS[i % 4];
      p.r(x - 1, y + 2, 4, 4, K); p.r(x, y - 1, 3, 6, K); p.r(x + 1, y - 1, 3, 4, K);   // contorno por fora
      p.r(x, y + 3, 2, 2, c); p.r(x + 1, y, 1, 4, c); p.r(x + 2, y, 1, 1, c); p.r(x + 2, y + 1, 1, 1, c);
    }
  }

  /* ----- aquário 1×1: vidro com peixinhos sobre um móvel ----- */
  function vira(m) { return m.map(function (l) { return l.split('').reverse().join(''); }); }
  var LARANJA = ['.oo.o', 'ooooo', '.oo.o'], DOURADO = ['y.yy.', 'yyyyy'];   // de frente para a esquerda e para a direita
  var PEIXES = [LARANJA, vira(LARANJA), DOURADO, vira(DOURADO)], COR_L = { o: '#ff8a3d' }, COR_D = { y: C.ouro };
  // ax, bx = quanto cada um nadou; av, bv = virado; tudo 0 = o lugar de sempre
  function peixes(p, ax, av, bx, bv) {
    p.m(4 + ax, -4, PEIXES[av ? 1 : 0], COR_L);
    p.m(10 + bx, bx ? -1 : 0, PEIXES[bv ? 3 : 2], COR_D);                   // longe do canto, nada acima da areia
  }
  // nado de sempre: [dx, 1 = virado], passos de 450 e 520 ms; o laranja vai até a planta e volta, o dourado atravessa o aquário
  var NADO_A = [[0, 0], [-1, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [3, 0], [2, 0], [1, 0]];
  var NADO_B = [[0, 0], [0, 1], [-1, 1], [-2, 1], [-3, 1], [-4, 1], [-5, 1], [-5, 0], [-4, 0], [-3, 0], [-2, 0], [-1, 0]];
  I.objeto('casa-movel-aquario', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py), on = ligado(o);
      p.r(0, -10, 16, 15, K); p.r(1, -9, 14, 13, VIDRO); p.r(1, -6, 14, 10, on ? '#7cc8ff' : AGUA); p.r(1, -6, 14, 1, clarear(AGUA, 0.5));
      p.r(2, -8, 1, 10, C.branco);
      if (on) { p.r(3, -9, 10, 2, '#fff6c8'); p.r(4, -9, 8, 1, C.branco); p.r(4, -5, 8, 1, '#a8dcff'); }   // luz acesa; os peixes nadam no anim
      else if (!(o && o.uid)) peixes(p, 0, 0, 0, 0);   // na casa (com uid), os peixes nadam no anim
      p.m(12, -4, ['g', 'gg', 'g', 'gg'], { g: C.folha3 }); p.r(3, 2, 10, 2, '#f3d9b0');
      p.caixa(0, 5, 16, 10, MAD); p.r(6, 8, 4, 1, C.ouro);
      pe(p, 1, 13); pe(p, 12, 13);
    },
    anim: CA.sempre({ baixo: function (p, t, o) {
      if (!o.uid) return;
      var a = NADO_A[Math.floor(t / 450) % NADO_A.length], b = NADO_B[Math.floor(t / 520) % NADO_B.length];
      peixes(p, a[0], a[1], b[0], b[1]);
      if (!t) return;
      for (var f = 0; f <= 4; f += 4) {                               // duas bolhas sobem devagar da areia
        var u = (Math.floor(t / 380) + f) % 8; if (u < 7) p.r(f ? 7 : 11, 1 - u, 1, 1, C.branco);
      }
    } }, function (ctx, px, py, t, o) {                               // ligado: luz acesa e os peixes de hoje
      var p = pa(ctx, px, py, o);
      function peixe(x, y, c, volta) {                                // 3×2 com rabo e olho; volta = nadando para a esquerda
        p.r(x, y, 3, 2, c); p.r(volta ? x + 3 : x - 1, y, 1, 2, c); p.r(volta ? x : x + 2, y, 1, 1, K);
      }
      var a = Math.floor(2.5 + 2.5 * Math.sin(t / 900)), b = Math.floor(2.5 + 2.5 * Math.sin(t / 700 + 2));
      peixe(4 + a, -4, '#ff8a3d', Math.cos(t / 900) < 0);
      peixe(6 + b, -1, C.ouro, Math.cos(t / 700 + 2) < 0);
      for (var i = 0; i < 3; i++) {                                   // bolhas sobem da areia
        var u = ((t / 140 + i * 5) % 9); p.r(10 + (i % 2) * 2, 2 - Math.floor(u), 1, 1, C.branco);
      }
    }) });

  /* ----- piano 2×1 ----- */
  function teclas(p, x, y, n) {
    p.r(x, y, n * 3 + 1, 5, K);
    for (var i = 0; i < n; i++) { p.r(x + 1 + i * 3, y + 1, 2, 4, C.branco); if (i % 7 !== 2 && i % 7 !== 6) p.r(x + 3 + i * 3, y + 1, 1, 2, K); }
  }
  I.objeto('casa-movel-piano', { w: 2, h: 1, topo: 16, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(1, -16, 30, 22, PIANO); p.r(4, -13, 24, 6, escurecer(PIANO, 0.2));
      p.m(14, -13, ['..yy', '..yy', '..y.', '..y.', 'yyy.', 'yyy.'], { y: C.ouro });
      p.r(3, -3, 26, 1, K); teclas(p, 4, -2, 8);
      p.caixa(1, 4, 30, 9, escurecer(PIANO, 0.1)); p.r(14, 8, 4, 1, C.ouro);
      pe(p, 2, 13); pe(p, 27, 13);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(PIANO, 0.15);
      p.caixa(1, -16, 30, 29, e);
      [6, 12, 18, 24].forEach(function (x) { p.r(x, -13, 1, 23, escurecer(PIANO, 0.3)); });
      p.r(3, -15, 26, 1, clarear(PIANO, 0.5));
      pe(p, 2, 13); pe(p, 27, 13);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      // corpo alto à direita, teclado saindo para a esquerda
      p.caixa(6, -16, 10, 45, PIANO); p.r(8, -14, 2, 40, clarear(PIANO, 0.4));
      p.r(0, 2, 7, 22, K); p.r(1, 3, 5, 20, C.branco);
      for (var y = 5; y < 23; y += 3) p.r(1, y, 3, 1, K);
      p.r(0, 24, 7, 4, K); p.r(1, 24, 5, 3, escurecer(PIANO, 0.2));
      pe(p, 7, 29); pe(p, 12, 29);
    },
  }), anim: function (ctx, px, py, t, o) {
    if (!ligado(o)) return;
    var p = pa(ctx, px, py, o), dir = o.dir || 'baixo';
    if (dir === 'esq' || dir === 'dir') { notas(p, t, 2, 9, -21, 11, 3); return; }
    notas(p, t, 5, 20, -21, 11, 3);
    if (dir === 'baixo') { var i = Math.floor(t / 200) % 8; p.r(5 + i * 3, -1, 2, 4, '#d8c8f0'); }   // uma tecla afundada
  } });

  /* ----- lareira 2×1: tijolos, fogo e uma prateleira ----- */
  I.objeto('casa-movel-lareira', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py), e = escurecer(TIJ, 0.2);
      // sem uid (capa, prancha) fica acesa como sempre; na casa, apagada até alguém acender (o fogo mexe no anim)
      var viva = !(o && o.uid) || ligado(o), animada = !!(o && o.uid);
      p.caixa(0, -18, 32, 34, TIJ);
      for (var y = -14; y < 15; y += 4) p.r(1, y, 30, 1, e);
      for (var j = 0; j < 8; j++) { var yy = -17 + j * 4, x0 = j % 2 ? 6 : 10; for (var x = x0; x < 31; x += 8) p.r(x, yy, 1, 3, e); }
      p.caixa(0, -18, 32, 5, MAD);
      p.r(7, -6, 18, 22, K); p.r(8, -5, 16, 21, '#4a4060');
      var fogo = [
        '....r.....r...', '...ror...ror..', '..royor.royor.', '.royyyororyyor', '.roywyyoyywyor', 'royywwyyywwyyo',
      ];
      if (viva) p.m(9, animada ? 5 : 2, animada ? fogo.slice(3) : fogo, { r: '#ff5c6a', o: '#ff8a3d', y: C.ouro, w: '#fff1d6' });
      p.r(9, 8, 14, 3, K); p.r(10, 9, 12, 1, C.madeira2);
      if (!viva) { p.r(12, 7, 3, 1, '#6a5a70'); p.r(18, 7, 2, 1, '#6a5a70'); p.r(15, 8, 2, 1, '#8a7a90'); }   // só lenha e cinza
    },
    anim: function (ctx, px, py, t, o) {
      if (!ligado(o)) return;
      var p = pa(ctx, px, py, o);
      [11, 16, 21].forEach(function (cx, i) {                         // três línguas de fogo de alturas diferentes
        var h = 4 + Math.floor(2 + 2 * Math.sin(t / 120 + i * 2.1));
        for (var j = 0; j < h; j++) {
          var w = j < h - 2 ? 3 : 1, y = 4 - j;
          p.r(cx - (w >> 1), y, w, 1, '#ff5c6a');
          if (j < h - 1) p.r(cx, y, 1, 1, j < h - 3 ? '#ffd34d' : '#ff8a3d');
        }
      });
      var s = Math.floor(t / 90) % 6; p.r(10 + (Math.floor(t / 720) % 3) * 5, 1 - s, 1, 1, C.ouro);   // faísca
    } });

  /* ----- relógio cuco de parede 1×2 ----- */
  // pêndulo entre as correntes dos pesos: haste dourada presa embaixo da caixa e o disco abaixo dos pesos; s = -1, 0 ou 1 px
  var VAIVEM = [0, 1, 0, -1];
  function pendulo(p, s) {
    p.r(8, 21, 1, 7, C.ouro2);
    p.m(7 + s, 28, ['.k.', 'kok', 'kok', '.k.'], { k: K, o: C.ouro });
  }
  I.objeto('casa-movel-relogio-cuco', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var p = pincel(ctx, px, py), on = ligado(o);
      p.m(1, 3, ['......kk......', '....kkMMkk....', '..kkMMMMMMkk..', 'kkMMMMMMMMMMkk'], { k: K, M: escurecer(MAD, 0.2) });
      p.caixa(2, 7, 12, 14, MAD);
      p.r(6, 8, 4, 3, K); p.r(7, 9, 2, 2, C.ouro); p.r(7, 9, 1, 1, '#ff8a3d');
      p.r(4, 12, 8, 7, K);
      if (on) { p.r(5, 13, 6, 5, '#4a4060'); p.r(3, 12, 1, 7, K); p.r(2, 13, 1, 5, escurecer(MAD, 0.2)); }   // portinha aberta; o passarinho sai no anim
      else { p.r(5, 13, 6, 5, C.branco); p.r(8, 14, 1, 2, K); p.r(8, 15, 2, 1, K); }
      p.r(5, 21, 1, 7, K); p.r(10, 21, 1, 5, K);
      p.m(4, 27, ['kk', 'oo', 'kk'], { k: K, o: C.ouro }); p.m(9, 25, ['kk', 'oo', 'kk'], { k: K, o: C.ouro });
      if (!(o && o.uid)) pendulo(p, 0);                             // na casa (com uid), ele balança no anim
    },
    anim: CA.sempre({ junto: true, baixo: function (p, t, o) {      // sempre: o pêndulo vai e volta (1,8 s), ligado também
      if (o.uid) pendulo(p, VAIVEM[Math.floor(t / 450) % 4]);
    } }, function (ctx, px, py, t) {                                // ligado: o cuco sai e canta
      var p = pincel(ctx, px, py), c = t % 1600;
      var n = c < 250 ? Math.ceil(5 * c / 250) : c < 1350 ? 5 : Math.ceil(5 * (1600 - c) / 250);   // linhas à mostra: sobe, canta, desce
      if (n <= 0) return;
      var bico = c > 300 && c < 1300 && Math.floor(t / 200) % 2 === 0;
      p.m(5, 18 - n, ['.kkkk.', 'kyyyyk', bico ? 'ooyeyk' : 'oyyeyk', 'kyyyyk', '.kkkk.'].slice(0, n), { k: K, y: C.ouro, o: '#ff8a3d', e: K });
    }) });

  /* ----- pufe 1×1 redondo com botão ----- */
  I.objeto('casa-movel-pufe', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py), e = escurecer(PUFE, 0.2);
      p.m(1, -2, [
        '...kkkkkkkk...', '.kkPPPPPPPPkk.', 'kPPPPPPPPPPppk', 'kPPppppppppppk', 'kpppppbbpppppk', 'kpppppbbpppppk',
        'kpppppppppppek', 'keeeeeeeeeeeek', 'kpppppppppppek', 'kPpppppppppppk', 'kPppppppppppek', 'kpppppppppppek',
        '.keeeeeeeeeek.', '..kkkkkkkkkk..',
      ], { k: K, P: clarear(PUFE, 0.45), p: PUFE, e: e, b: C.ouro });
    } });

  /* ----- vitrola 1×1: caixa de madeira com disco e corneta ----- */
  function corneta(p, x, y) { p.m(x, y, ['..kkkk', '.kyyYk', 'kyyyYk', '.kyyYk', '..kkkk'], { k: K, y: C.ouro, Y: C.ouro3 }); }
  I.objeto('casa-movel-vitrola', { w: 1, h: 1, topo: 10, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(1, -10, ['kkkkkkkkk.', 'kyyyyyyYk.', '.kyyyyYk..', '..kyyYk...', '...kyk....', '....kk....'], { k: K, y: C.ouro, Y: C.ouro3 });
      p.r(4, -4, 2, 4, K);
      p.r(1, -1, 14, 3, K); p.r(2, -1, 12, 2, '#4a4060'); p.r(6, -1, 4, 1, PUFE);
      p.caixa(1, 2, 14, 11, MAD); p.r(4, 5, 8, 5, escurecer(MAD, 0.2)); p.r(6, 7, 1, 1, C.ouro); p.r(9, 7, 1, 1, C.ouro);
      pe(p, 2, 13); pe(p, 11, 13);
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      corneta(p, 3, -10); p.r(8, -5, 2, 5, K);
      p.caixa(1, -1, 14, 14, escurecer(MAD, 0.15)); p.r(4, 3, 8, 1, escurecer(MAD, 0.35)); p.r(4, 7, 8, 1, escurecer(MAD, 0.35));
      pe(p, 2, 13); pe(p, 11, 13);
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(1, -10, ['kkk...', 'kYyk..', 'kYyyk.', 'kYyk..', 'kkk...'], { k: K, y: C.ouro, Y: C.ouro3 });
      p.r(5, -8, 6, 1, K); p.r(10, -8, 2, 8, K);
      p.caixa(2, 0, 12, 13, MAD); p.m(4, 2, ['.kkkk.', 'kddddk', 'kdppdk', 'kddddk', '.kkkk.'], { k: K, d: '#4a4060', p: PUFE });
      p.r(4, 9, 8, 1, escurecer(MAD, 0.3));
      pe(p, 3, 13); pe(p, 10, 13);
    },
  }), anim: function (ctx, px, py, t, o) {
    if (!ligado(o)) return;
    var p = pa(ctx, px, py, o), dir = o.dir || 'baixo', f = Math.floor(t / 100);
    var g = '#9a8cc0';
    if (dir === 'baixo') {                                             // brilho girando no disco
      var q = [[3, -1], [5, -1], [10, -1], [12, -1], [12, 0], [10, 0], [5, 0], [3, 0]][f % 8]; p.r(q[0], q[1], 1, 1, g);
    } else if (dir !== 'cima') {
      var l = [[5, 3], [6, 3], [7, 3], [8, 3], [8, 4], [8, 5], [7, 5], [6, 5], [5, 5], [5, 4]][f % 10]; p.r(l[0], l[1], 1, 1, g);
    }
    notas(p, t, dir === 'baixo' ? 2 : 1, 7, -15, 11, 2);
  } });

  /* ----- vitral de parede 2×2: arco-íris com unicórnio ----- */
  I.objeto('casa-movel-vitral', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.m(4, 2, [
        '.......kkkkkkkkkk.......', '.....kkrrrrkrrrrrkk.....', '....krrrrrrkrrrrrrrk....', '...kooooooookooooooook...',
        '..kooooooooookooooooook..', '..kyyyyyyyyykyyyyyyyyyk..', '.kyyyyyyyyyykyyyyyyyyyyk.', '.kgggggggggggkggggggggggk',
        'kkkkkkkkkkkkkkkkkkkkkkkk', 'kbbbbbbbbbkkbbbbbbbbbbbk', 'kbbbwwwbbbkkbbbbbbbbbbbk', 'kbbwwwwbbbkkbbbbbbbbbbbk',
        'kbbbbbbbbbkkbbbbbbbbbbbk', 'kkkkkkkkkkkkkkkkkkkkkkkk', 'kvvvvvvvvvvkvvvvvvvvvvvk', 'kvvvvvvvvvvkvvvvvvvvvvvk',
        'kvvvvvvvvvvkvvvvvvvvvvvk', 'kvvvvvvvvvvkvvvvvvvvvvvk', 'kvvvvvvvvvvkvvvvvvvvvvvk', 'kkkkkkkkkkkkkkkkkkkkkkkk',
      ], { k: K, r: '#ff5c6a', o: '#ff8a3d', y: '#ffd34d', g: '#6fdc8c', b: '#5fb4ff', w: C.branco, v: C.lilas });
      // unicórnio branco no meio, de perfil, com chifre dourado e crina rosa
      p.m(8, 10, [
        '..........y...', '.........kyk..', '.......kkwwk..', '......pkwwwek.', '.....ppkwwwwwk', '.kkkkpkwwwkkk.',
        'kwwwwwwwwwk...', 'kwwwwwwwwwk...', '.kwkkkkwkk....', '.kk...kk......',
      ], { k: K, w: C.branco, y: C.ouro, p: PUFE, e: K });
      p.r(3, 21, 26, 2, K); p.r(4, 21, 24, 1, MAD); p.r(2, 22, 28, 1, K);
    } });
})();
