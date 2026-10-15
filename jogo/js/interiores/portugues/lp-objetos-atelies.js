/* Língua Portuguesa do 4º bimestre (térreo da Casa das Palavras), parte 3 dos objetos: o tema de cada ateliê.
   Cap. 10 (contos e lendas): quadro da Sereia Iara, os Três Porquinhos, o pé de feijão. Cap. 11 (canções): parede de
   instrumentos, aquário, hamster, cachorrão e cachorrinho (o animal de estimação; aumentativo e diminutivo).
   Cap. 12 (poemas): o poema visual "Falta de sorte" com a bola. E o cartaz de parede de cada ateliê (var.tema). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var ROXO = '#8e4fd6', TINTA = '#5a4a6a';

  /* ================= CAPÍTULO 10: contos e lendas ================= */
  // quadro da Lenda da Sereia Iara: o rio à noite, a Iara (cabelo ruivo com concha lilás, cauda verde) e peixinhos
  I.objeto('lp-quadro-iara', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 6, 30, 20, C.ouro2);
      ret(ctx, px + 3, py + 8, 26, 8, '#3d4f9a'); circulo(ctx, px + 25, py + 11, 2, C.ouro3);
      ret(ctx, px + 6, py + 10, 1, 1, C.branco); ret(ctx, px + 18, py + 9, 1, 1, C.branco);
      ret(ctx, px + 3, py + 16, 26, 8, '#3eaea3'); ret(ctx, px + 3, py + 16, 26, 1, '#7ed9c8');
      elipse(ctx, px + 10, py + 21, 6, 2, '#8a8aa0');
      matriz(ctx, px + 6, py + 9, ['..rrr....', '.rrrrl...', '.rssr....', '.rssrr...', '..ll.r...', '.sllsr...', '..ss.....',
        '..gg.....', '...gg....', '....ggg..', '.....g.g.'], { r: '#e0602a', l: C.lilas, s: '#f1c7a5', g: '#3fae5a' });
      [[px + 20, py + 19], [px + 24, py + 22]].forEach(function (f) {
        ret(ctx, f[0], f[1], 3, 2, '#ff8a3d'); ret(ctx, f[0] + 3, f[1] - 1, 1, 1, '#ff8a3d'); ret(ctx, f[0] + 3, f[1] + 2, 1, 1, '#ff8a3d');
      });
    } });
  // maquete dos Três Porquinhos: casa de palha, de madeira e de tijolos, numa tábua
  I.objeto('lp-porquinhos', { w: 2, h: 1, topo: 7, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 9, 30, 6, K); ret(ctx, px + 2, py + 10, 28, 4, C.madeiraClara); ret(ctx, px + 2, py + 13, 28, 1, C.madeira2);
      var casas = [['#ffd34d', '#d9a93a'], ['#a0745a', '#6b4428'], ['#e0433f', '#a83030']];
      casas.forEach(function (c, i) {
        var x = px + 3 + i * 9;
        contornoRet(ctx, x, py + 2, 8, 8, c[0]);
        for (var l = 0; l < 3; l++) ret(ctx, x + 1, py + 4 + l * 2, 6, 1, c[1]);
        triangulo(ctx, x - 1, py - 5, 10, 7, K); triangulo(ctx, x, py - 4, 8, 6, i === 2 ? '#8a604a' : c[0]);
        ret(ctx, x + 3, py + 6, 2, 3, K);
      });
      ret(ctx, px + 23, py - 7, 2, 4, K);   // a chaminé da casa de tijolos
      circulo(ctx, px + 28, py + 11, 2, K); circulo(ctx, px + 28, py + 11, 1, C.rosa2);   // um porquinho
    } });
  // pé de feijão subindo do vaso até uma nuvem com um castelinho
  I.objeto('lp-pe-feijao', { w: 1, h: 1, topo: 15, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      for (var y = py + 9; y > py - 9; y--) {
        var x = cx + Math.round(Math.sin((y - py) / 4) * 2);
        ret(ctx, x - 1, y, 3, 1, K); ret(ctx, x, y, 1, 1, '#5e9a3a');
        if ((y - py) % 5 === 0) { elipse(ctx, x + ((y - py) % 10 ? 3 : -3), y, 2, 1, '#3f7a2a'); }
      }
      elipse(ctx, cx, py - 10, 7, 2, K); elipse(ctx, cx, py - 10, 6, 1, C.branco);
      ret(ctx, cx - 2, py - 14, 5, 3, '#cfc6d8'); ret(ctx, cx - 2, py - 15, 1, 1, '#cfc6d8'); ret(ctx, cx + 2, py - 15, 1, 1, '#cfc6d8');
      ret(ctx, cx, py - 13, 1, 2, '#6b4428');
      ret(ctx, cx - 4, py + 8, 9, 7, K); ret(ctx, cx - 3, py + 9, 7, 5, C.terracota); ret(ctx, cx - 3, py + 9, 7, 1, '#f09a6a');
    } });

  /* ================= CAPÍTULO 11: canções ================= */
  // parede de instrumentos: cavaquinho, chocalhos, flauta e notas
  I.objeto('lp-instrumentos', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 6, 30, 20, '#e0b47a');
      for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) ret(ctx, px + 4 + i * 5, py + 9 + j * 6, 1, 1, '#b98a5a');
      circulo(ctx, px + 8, py + 19, 4, K); circulo(ctx, px + 8, py + 19, 3, '#ff8a3d'); circulo(ctx, px + 8, py + 19, 1, K);
      ret(ctx, px + 7, py + 8, 3, 9, K); ret(ctx, px + 8, py + 8, 1, 8, '#8a604a');
      [[px + 16, '#e0433f'], [px + 21, '#ffd34d']].forEach(function (m) {
        ret(ctx, m[0], py + 15, 1, 7, K); circulo(ctx, m[0], py + 13, 3, K); circulo(ctx, m[0], py + 13, 2, m[1]);
      });
      ret(ctx, px + 14, py + 23, 14, 2, K); ret(ctx, px + 15, py + 23, 12, 1, C.metal);
      matriz(ctx, px + 24, py + 9, ['.k..', '.kk.', '.k.k', 'kk..', 'kk..'], { k: ROXO });
    } });
  // aquário redondo num banquinho ("um peixe que nunca sai do aquário")
  I.objeto('lp-aquario', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 6, 11, 3, K); ret(ctx, cx - 4, py + 7, 9, 1, C.madeiraClara);
      ret(ctx, cx - 4, py + 9, 2, 6, K); ret(ctx, cx + 3, py + 9, 2, 6, K);
      circulo(ctx, cx, py - 1, 7, K); circulo(ctx, cx, py - 1, 6, C.vidro);
      ret(ctx, cx - 6, py - 2, 13, 6, '#7ed9c8'); ret(ctx, cx - 5, py + 4, 11, 1, '#3eaea3');
      ret(ctx, cx - 7, py - 8, 15, 1, K);
      ret(ctx, cx - 2, py, 4, 2, '#ff8a3d'); ret(ctx, cx + 2, py - 1, 1, 4, '#ff8a3d'); ret(ctx, cx - 1, py, 1, 1, K);
      ret(ctx, cx - 4, py - 5, 1, 2, C.branco);
    } });
  // gaiola do hamster ("fiel maratonista"), com a rodinha
  I.objeto('lp-hamster', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 4, 14, 19, K); ret(ctx, px + 2, py - 3, 12, 17, '#fff6e0');
      for (var x = px + 4; x < px + 14; x += 3) ret(ctx, x, py - 3, 1, 15, '#c8b8d8');
      ret(ctx, px + 2, py + 12, 12, 2, '#d9b27a');
      circulo(ctx, px + 10, py + 6, 4, K); circulo(ctx, px + 10, py + 6, 3, '#fff6e0'); circulo(ctx, px + 10, py + 6, 1, C.metal2);
      elipse(ctx, px + 5, py + 10, 3, 2, K); elipse(ctx, px + 5, py + 10, 2, 1, '#f0c890'); ret(ctx, px + 3, py + 9, 1, 1, K);
    } });
  // cachorrão e cachorrinho de pelúcia numa almofada (aumentativo e diminutivo)
  I.objeto('lp-bichos', { w: 2, h: 1, topo: 2, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 12, 14, 3, K); elipse(ctx, px + 16, py + 12, 13, 2, '#ff9cc6');
      matriz(ctx, px + 3, py - 1, ['.kk...kk.', 'kbbk.kbbk', 'kbbbbbbbk', 'kbwbbbwbk', 'kbbbbbbbk', '.kbbnbbk.', '..kbbbk..',
        '.kbbbbbk.', 'kbbbbbbbk', 'kbbbbbbbk', 'kbbbbbbbk', 'kbbkkkbbk', '.kk...kk.'], { k: K, b: '#c98a4b', w: C.branco, n: K });
      matriz(ctx, px + 18, py + 1, ['.k...k.', 'kbk.kbk', 'kbbbbbk', 'kbwbwbk', 'kbbnbbk', '.kbbbk.', 'kbbbbbk', 'kbbbbbk', '.kk.kk.'],
        { k: K, b: '#e8b27a', w: C.branco, n: K });
    } });

  /* ================= CAPÍTULO 12: poemas ================= */
  // o poema visual "Falta de sorte": as letras de "cai" descendo, a bola e as palavras formando um boneco
  I.objeto('lp-falta-sorte', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 6, 28, 20, C.branco);
      [[px + 3, py + 7], [px + 26, py + 7], [px + 3, py + 22], [px + 26, py + 22]].forEach(function (c) { ret(ctx, c[0], c[1], 3, 3, '#3fae5a'); });
      ret(ctx, px + 7, py + 9, 14, 1, TINTA); ret(ctx, px + 7, py + 11, 6, 1, TINTA);
      ret(ctx, px + 15, py + 11, 1, 1, TINTA); ret(ctx, px + 17, py + 12, 1, 1, TINTA); ret(ctx, px + 19, py + 13, 1, 1, TINTA);
      circulo(ctx, px + 16, py + 16, 2, '#ff5a2a');
      ret(ctx, px + 16, py + 18, 1, 3, TINTA);
      for (var i = 1; i <= 3; i++) { ret(ctx, px + 16 - i, py + 18 + i, 1, 1, TINTA); ret(ctx, px + 16 + i, py + 18 + i, 1, 1, TINTA); }
      for (var j = 1; j <= 3; j++) { ret(ctx, px + 16 - j, py + 20 + j, 1, 1, TINTA); ret(ctx, px + 16 + j, py + 20 + j, 1, 1, TINTA); }
    } });
  // a bola vermelha do poema, no chão
  I.objeto('lp-bola', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 8, py + 8, 6, K); circulo(ctx, px + 8, py + 8, 5, '#ff5a2a');
      ret(ctx, px + 3, py + 8, 11, 1, C.branco); ret(ctx, px + 5, py + 4, 2, 2, '#ffb090');
    } });

  /* ================= CARTAZ DE PAREDE DO ATELIÊ ================= */
  // var.tema: 'pontuacao' (. ? ! do Cap. 10), 'notas' (Cap. 11), 'ao' (ÃO e ÃES do Cap. 12)
  var TEMAS = {
    pontuacao: function (ctx, x, y) {
      // 12 colunas: cabe dentro da moldura (de px+2 a px+13)
      matriz(ctx, x, y, ['....yy..ooo.', '....yy.o...o', '....yy.....o', '....yy....o.', '....yy...o..', '............',
        'pp..yy...o..'], { y: '#ffc61a', o: '#ff8a3d', p: ROXO });
    },
    notas: function (ctx, x, y) {
      matriz(ctx, x, y, ['...k....kkkk', '...kk...k..k', '...k.k..k..k', '...k....k..k', '.kkk...kk.kk', 'kkkk..kkkkkk',
        '.kk....kk.kk'], { k: ROXO });
    },
    ao: function (ctx, x, y) {
      matriz(ctx, x, y, ['.k.k.........', 'k.k..........', '.kk..kk......', 'k..kk..k.....', 'kkkkk..k.....', 'k..kk..k.....',
        'k..k.kk......', '.............', '.k.k.........', 'k.k..........', '.kk.kkk.kkk..', 'k..kk...k....', 'kkkkkkk.kkk..',
        'k..kk.....k..', 'k..kkkk.kkk..'], { k: ROXO });
    },
  };
  I.objeto('lp-cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var t = v(o, 'tema', 'pontuacao');
      contornoRet(ctx, px + 1, py + 7, 14, 18, C.creme);
      ret(ctx, px + 4, py + 7, 2, 2, C.vermelho); ret(ctx, px + 10, py + 7, 2, 2, '#5fb4ff');
      (TEMAS[t] || TEMAS.pontuacao)(ctx, px + 2, py + 9 + (t === 'ao' ? 0 : 4));
      if (t !== 'ao') ret(ctx, px + 3, py + 21, 10, 1, '#ffc61a');
    } });
})();
