/* Minha Casa, por dentro dos lugares famosos (casa/lugares-dentro.js), objetos temáticos parte 2: Pão de Açúcar,
   Grande Muralha, Cataratas, Taj Mahal, São Basílio e Monte Fuji. Usa Reino._predios.casa.dentro (caixa, janela, obj),
   criado pela parte 1 (lugares-dentro-objetos.js). Contorno #3a2446, luz de cima e da esquerda, sem movimento.
   Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var B = R._predios.casa.dentro, caixa = B.caixa, janela = B.janela, nuvem = B.nuvem, obj = B.obj, MARMORE = B.MARMORE;
  var OURO = C.ouro, VERMELHO = '#e0403a';

  /* ================= Pão de Açúcar ================= */
  // o mar, a areia da praia e o cabo do bondinho com a cabine pequena
  janela('mar', function (ctx, x, y, w, h) {
    circulo(ctx, x + 4, y + 4, 2, OURO); nuvem(ctx, x + 15, y + 3);
    ret(ctx, x, y + h - 7, w, 5, '#5fb4ff'); ret(ctx, x, y + h - 2, w, 2, '#f2d48a');
    ret(ctx, x + 4, y + h - 5, 4, 1, C.branco); ret(ctx, x + 14, y + h - 4, 4, 1, C.branco);
    elipse(ctx, x + 21, y + h - 7, 4, 6, K); elipse(ctx, x + 21, y + h - 7, 3, 5, '#6fae6a');
    for (var i = 0; i < 20; i++) ret(ctx, x + i, y + 6 + Math.floor(i / 4), 1, 1, '#4a3358');
    ret(ctx, x + 9, y + 8, 4, 3, K); ret(ctx, x + 10, y + 9, 2, 1, OURO);
  }, '#e8f4ff');
  // o bondinho parado na estação (3 × 2, sobe 10 px): o cabo, a roldana e a cabine amarela de vidro
  obj('bondinho', { w: 3, h: 2, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      var am = '#ffc94d';
      ret(ctx, px, py - 9, 48, 1, '#4a3358');
      ret(ctx, px + 21, py - 10, 6, 4, K); ret(ctx, px + 22, py - 9, 4, 2, C.metal);
      ret(ctx, px + 23, py - 6, 2, 8, K);
      ret(ctx, px + 5, py + 1, 38, 27, K); ret(ctx, px + 4, py + 2, 40, 25, K);
      ret(ctx, px + 5, py + 2, 38, 25, am); ret(ctx, px + 5, py + 2, 38, 1, clarear(am, 0.4)); ret(ctx, px + 5, py + 2, 1, 25, clarear(am, 0.25));
      ret(ctx, px + 7, py + 5, 34, 12, K); ret(ctx, px + 8, py + 6, 32, 10, C.vidro); ret(ctx, px + 8, py + 6, 32, 2, C.branco);
      [16, 24, 32].forEach(function (x) { ret(ctx, px + x, py + 6, 1, 10, K); });
      ret(ctx, px + 21, py + 18, 6, 9, K); ret(ctx, px + 22, py + 19, 4, 8, escurecer(am, 0.2));
      ret(ctx, px + 5, py + 21, 16, 1, VERMELHO); ret(ctx, px + 27, py + 21, 16, 1, VERMELHO);
      ret(ctx, px + 2, py + 27, 44, 4, K); ret(ctx, px + 3, py + 28, 42, 2, C.metal2);
    } });
  // o binóculo de moedinha no poste (1 × 1, sobe 16 px)
  obj('binoculo', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 6, py - 6, 4, 18, K); ret(ctx, px + 7, py - 5, 2, 17, C.metal);
      caixa(ctx, px + 2, py - 15, 12, 10, '#5fb4ff');
      ret(ctx, px + 1, py - 13, 4, 6, K); ret(ctx, px + 11, py - 13, 4, 6, K);
      ret(ctx, px + 2, py - 12, 2, 4, '#3a2446'); ret(ctx, px + 12, py - 12, 2, 4, '#3a2446');
      ret(ctx, px + 7, py - 14, 2, 1, OURO);
      ret(ctx, px + 4, py + 11, 8, 4, K); ret(ctx, px + 5, py + 12, 6, 2, C.metal2);
    } });
  // o miquinho no toco de madeira (1 × 1, sobe 6 px): pelo cinza, tufos brancos e o rabo listrado
  obj('mico', { w: 1, h: 1, topo: 6,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 3, py + 6, 10, 9, C.madeira); ret(ctx, px + 4, py + 7, 8, 1, C.madeiraClara);
      matriz(ctx, px + 2, py - 6, ['w.kkk.w.', 'wkgggkw.', '.kgfgk..', '.kgggk..', '..kggk..', '.kggggk.', '.kggggk.', 'kggggggk', '.kkkkkk.', '.........', '.........', '.........'],
        { k: K, g: '#9a8a8a', w: C.branco, f: '#f5c9a6' });
      ret(ctx, px + 4, py - 4, 1, 1, K); ret(ctx, px + 6, py - 4, 1, 1, K);
      for (var i = 0; i < 5; i++) ret(ctx, px + 11, py - 3 + i * 2, 2, 2, i % 2 ? K : '#9a8a8a');
    } });

  /* ================= Grande Muralha ================= */
  // as montanhas verdes com a muralha subindo e descendo, com as ameias
  janela('muralha', function (ctx, x, y, w, h) {
    nuvem(ctx, x + 2, y + 3); nuvem(ctx, x + 17, y + 2);
    elipse(ctx, x + 6, y + h, 9, 8, '#6fae6a'); elipse(ctx, x + 19, y + h, 9, 10, '#7fc85a');
    var topo = function (i) { return y + h - 7 - Math.round(Math.sin(i / 4) * 3) - (i > 13 ? 2 : 0); };
    for (var i = 0; i < w; i++) {
      var yy = topo(i);
      ret(ctx, x + i, yy - 1, 1, 1, K); ret(ctx, x + i, yy, 1, 3, '#f0ecf6'); ret(ctx, x + i, yy + 2, 1, 1, '#c9c2d6'); ret(ctx, x + i, yy + 3, 1, 1, K);
      if (i % 3 === 0) { ret(ctx, x + i, yy - 3, 1, 2, K); ret(ctx, x + i, yy - 2, 1, 1, '#f0ecf6'); }
    }
    // a torre de vigia em cima da muralha
    var ty = topo(19);
    ret(ctx, x + 17, ty - 7, 6, 8, K); ret(ctx, x + 18, ty - 6, 4, 7, '#f0ecf6'); ret(ctx, x + 19, ty - 4, 2, 2, '#4a3358');
  }, '#c9c2d6');
  // a lanterna vermelha de papel, pendurada (1 × 2, na parede), com a borla dourada
  obj('lanterna-china', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 2, 2, 6, K);
      ret(ctx, px + 4, py + 7, 8, 2, K); ret(ctx, px + 5, py + 7, 6, 1, OURO);
      elipse(ctx, px + 8, py + 15, 6, 6, K); elipse(ctx, px + 8, py + 15, 5, 5, VERMELHO);
      ret(ctx, px + 5, py + 12, 1, 6, clarear(VERMELHO, 0.35)); ret(ctx, px + 8, py + 10, 1, 11, escurecer(VERMELHO, 0.2));
      ret(ctx, px + 4, py + 21, 8, 2, K); ret(ctx, px + 5, py + 21, 6, 1, OURO);
      ret(ctx, px + 7, py + 23, 2, 6, K); ret(ctx, px + 7, py + 23, 1, 5, OURO);
    } });
  // o panda de pelúcia (1 × 1, sobe 8 px)
  obj('panda', { w: 1, h: 1, topo: 8,
    desenhar: function (ctx, px, py) {
      matriz(ctx, px + 2, py - 8, ['.kk....kk.', 'kppkkkkppk', 'kpwwwwwwpk', 'kwppwwppwk', 'kwpwwwwpwk', '.kwwkkwwk.', '..kwwwwk..', '.kppwwppk.', 'kppwwwwppk',
        'kpwwwwwwpk', 'kwwwwwwwwk', 'kppwwwwppk', 'kppkkkkppk', '.kkk..kkk.'], { k: K, p: '#3a3a5a', w: C.branco });
    } });

  /* ================= Cataratas ================= */
  // as quedas d'água brancas no paredão verde, a névoa e o arco-íris
  janela('cataratas', function (ctx, x, y, w, h) {
    ret(ctx, x, y + 6, w, h - 6, '#5e9a3a');
    for (var i = 0; i < 5; i++) { var cx = x + 2 + i * 5; ret(ctx, cx, y + 7, 3, h - 7, '#e8f6ff'); ret(ctx, cx + 1, y + 7, 1, h - 7, C.branco); }
    ret(ctx, x, y + h - 3, w, 3, '#9fdcff');
    ['#ff5c6a', '#ffd34d', '#6fdc8c', '#5fb4ff'].forEach(function (c, k) {
      for (var a = 0; a <= 12; a++) {
        var t = a / 12 * Math.PI, xx = Math.round(x + 13 - Math.cos(t) * (10 - k)), yy = Math.round(y + 9 - Math.sin(t) * (6 - k));
        ret(ctx, xx, yy, 1, 1, c);
      }
    });
  }, '#e6dccb');
  // a passarela de madeira no chão (3 × 1, plana), com as tábuas e os pregos
  obj('passarela', { w: 3, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      // as tábuas de comprido, com as juntas desencontradas e os preguinhos
      var c = '#dcae74', j = '#b07c48';
      ret(ctx, px, py + 2, 48, 12, K); ret(ctx, px + 1, py + 3, 46, 10, c); ret(ctx, px + 1, py + 3, 46, 1, clarear(c, 0.35));
      for (var t = 0; t < 2; t++) ret(ctx, px + 1, py + 6 + t * 4, 46, 1, j);
      for (var i = 0; i < 3; i++) for (var r = 0; r < 3; r++) {
        var x = px + 6 + i * 16 + (r % 2) * 8;
        if (x < px + 46) { ret(ctx, x, py + 3 + r * 4, 1, 3, j); ret(ctx, x + 2, py + 4 + r * 4, 1, 1, '#6b4428'); }
      }
    } });
  // o quati de focinho comprido e rabo listrado em pé (1 × 1, sobe 6 px)
  obj('quati', { w: 1, h: 1, topo: 7,
    desenhar: function (ctx, px, py) {
      // o rabo em pé, com os anéis claros e escuros
      ret(ctx, px + 11, py - 7, 5, 15, K);
      for (var i = 0; i < 7; i++) ret(ctx, px + 12, py - 6 + i * 2, 3, 2, i % 2 ? '#5a3a2a' : '#d8a070');
      matriz(ctx, px, py + 4, ['..kk..........', '.kbbk.........', 'kkbwbkkkkkkk..', 'fbbbbbbbbbbbk.', 'kkkbbbbbbbbbbk', '...kbbbbbbbbbk',
        '...kbblbbbbbbk', '...kbkkkkkkbk.', '...kbk....kbk.', '...kk.....kk..'], { k: K, b: '#a8703a', l: '#c89060', w: C.branco, f: '#3a2446' });
    } });
  // o tucano no poleiro (1 × 1, sobe 14 px): o bico laranja enorme
  obj('tucano', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 2, 2, 14, K); ret(ctx, px + 4, py + 11, 8, 4, K); ret(ctx, px + 5, py + 12, 6, 2, C.madeira);
      ret(ctx, px + 2, py - 2, 12, 2, K); ret(ctx, px + 3, py - 2, 10, 1, C.madeira);
      matriz(ctx, px + 1, py - 15, ['....kkk.......', '...kpppk......', '..kpwwpkkkkk..', '..kpwkokoooook', '..kpwwkooooyyk', '..kpwwpkkkkkk.', '..kppwpk......',
        '..kpppppk.....', '..kpppppk.....', '...kpppk......', '....kkk.......', '...k.k........'], { k: K, p: '#2e2a40', w: C.branco, o: '#ff8a3d', y: OURO });
    } });

  /* ================= Taj Mahal ================= */
  // o arco de mármore com a treliça de pedra (2 × 2, na parede) e as florzinhas coloridas em volta
  obj('arco-mogol', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py + 3, 28, 28, MARMORE);
      matriz(ctx, px + 8, py + 6, ['.......kk.......', '......kssk......', '....kkssssk.....', '...kssssssk.....', '..kssssssssk....', '..kssssssssk....']
        .map(function (l) { return l.slice(0, 8) + l.slice(0, 8).split('').reverse().join(''); }), { k: K, s: '#bfe9ff' });
      ret(ctx, px + 10, py + 12, 12, 17, K); ret(ctx, px + 11, py + 12, 10, 17, '#bfe9ff');
      for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) ret(ctx, px + 12 + i * 3, py + 13 + j * 3, 2, 2, '#e8e4f2');
      [[4, 6, '#ff5c6a'], [26, 6, '#5fb4ff'], [4, 26, '#6fdc8c'], [26, 26, '#ffd34d'], [4, 16, '#b58cff'], [26, 16, '#ff7eb6']].forEach(function (f) {
        ret(ctx, px + f[0], py + f[1], 2, 2, f[2]); ret(ctx, px + f[0] - 1, py + f[1] + 2, 1, 1, '#6fae6a');
      });
    } });
  // o espelho d'água (2 × 3, plano e sólido), com a borda de mármore e o brilho
  obj('espelho-agua', { w: 2, h: 3, solido: true, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 1, 30, 46, MARMORE);
      ret(ctx, px + 3, py + 3, 26, 42, K); ret(ctx, px + 4, py + 4, 24, 40, '#7ec8f0'); ret(ctx, px + 4, py + 4, 24, 2, '#5aa8d8');
      // o reflexo do palácio branco, de cabeça para baixo: a base, a cúpula, a pontinha e as torrinhas
      ret(ctx, px + 9, py + 7, 14, 8, '#d9f3ff'); D.elipse(ctx, px + 16, py + 18, 5, 4, '#d9f3ff'); ret(ctx, px + 16, py + 22, 1, 3, '#d9f3ff');
      ret(ctx, px + 7, py + 7, 1, 12, '#c4ecff'); ret(ctx, px + 24, py + 7, 1, 12, '#c4ecff');
      ret(ctx, px + 7, py + 32, 6, 1, C.branco); ret(ctx, px + 18, py + 37, 6, 1, C.branco); ret(ctx, px + 10, py + 41, 4, 1, C.branco);
    } });
  // o pavão de rabo aberto (1 × 1, sobe 18 px): a ave da Índia
  obj('pavao', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py - 4, 8, 12, K); elipse(ctx, px + 8, py - 4, 7, 11, '#3faa6a');
      [[3, -10], [8, -13], [13, -10], [2, -3], [14, -3], [5, 3], [11, 3]].forEach(function (o) {
        circulo(ctx, px + o[0], py + o[1], 1, OURO); ret(ctx, px + o[0], py + o[1], 1, 1, '#3a6ab0');
      });
      ret(ctx, px + 6, py - 6, 4, 14, K); ret(ctx, px + 7, py - 5, 2, 13, '#3a6ab0');
      ret(ctx, px + 6, py - 9, 4, 4, K); ret(ctx, px + 7, py - 8, 2, 2, '#3a6ab0'); ret(ctx, px + 8, py - 8, 1, 1, C.branco);
      ret(ctx, px + 7, py - 11, 1, 2, K); ret(ctx, px + 9, py - 11, 1, 2, K); ret(ctx, px + 10, py - 7, 2, 1, OURO);
      ret(ctx, px + 6, py + 8, 1, 6, K); ret(ctx, px + 9, py + 8, 1, 6, K);
    } });

  /* ================= São Basílio ================= */
  // a cúpula de cebola, listrada (1 × 1, sobe 20 px): var.c1 e var.c2 são as listras
  obj('cupula', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var v = o.var || {}, c1 = v.c1 || VERMELHO, c2 = v.c2 || '#6fdc8c';
      ret(ctx, px + 7, py - 22, 2, 4, K); ret(ctx, px + 7, py - 21, 1, 2, OURO);
      var L = [2, 4, 6, 8, 10, 12, 12, 12, 10, 8, 6];
      L.forEach(function (w, j) {
        var x = px + 8 - w / 2, y = py - 18 + j;
        ret(ctx, x - 1, y, w + 2, 1, K);
        for (var i = 0; i < w; i++) ret(ctx, x + i, y, 1, 1, ((i + j) >> 1) % 2 ? c1 : c2);
        ret(ctx, x, y, 1, 1, C.branco);
      });
      ret(ctx, px + 4, py - 7, 8, 1, K);
      caixa(ctx, px + 3, py - 7, 10, 17, '#f4e6d0'); ret(ctx, px + 7, py - 3, 2, 5, '#8a6a9a'); ret(ctx, px + 4, py + 3, 8, 1, c1);
      caixa(ctx, px + 1, py + 10, 14, 5, '#e07a5a');
    } });
  // as bonecas russas, uma dentro da outra (1 × 1, sobe 8 px): grande, média e pequena
  obj('matrioska', { w: 1, h: 1, topo: 6,
    desenhar: function (ctx, px, py) {
      // [meio x, rx e ry do corpo, raio da cabeça, cor]: a pequena, a média e a grande (na frente)
      [[13, 2, 3, 2, OURO], [9, 3, 4, 2, '#5fb4ff'], [5, 4, 6, 3, VERMELHO]].forEach(function (b) {
        var cx = px + b[0], ry = b[2], cy = py + 14 - ry, hy = cy - ry - b[3] + 1, c = b[4];
        elipse(ctx, cx, cy, b[1] + 1, ry + 1, K); elipse(ctx, cx, cy, b[1], ry, c);
        circulo(ctx, cx, hy, b[3] + 1, K); circulo(ctx, cx, hy, b[3], c);
        ret(ctx, cx - b[3] + 1, hy - 1, b[3] * 2 - 1, b[3] + 1, '#f5c9a6');
        if (b[3] > 2) { ret(ctx, cx - 1, hy, 1, 1, K); ret(ctx, cx + 1, hy, 1, 1, K); }
        ret(ctx, cx - b[1] + 1, cy - 1, 1, ry, clarear(c, 0.35));
        ret(ctx, cx, cy, 1, 1, C.branco); ret(ctx, cx - 1, cy + 1, 3, 1, C.ouro3);
      });
    } });
  // o samovar dourado do chá (1 × 1, sobe 12 px), com a torneirinha e o bule em cima
  obj('samovar', { w: 1, h: 1, topo: 12,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 5, py - 12, 6, 5, '#ff7eb6');
      elipse(ctx, px + 8, py - 1, 6, 7, K); elipse(ctx, px + 8, py - 1, 5, 6, OURO);
      ret(ctx, px + 4, py - 5, 2, 7, C.ouro3); ret(ctx, px + 9, py - 6, 1, 10, '#d9a93a');
      ret(ctx, px + 13, py, 3, 2, K); ret(ctx, px + 14, py + 2, 1, 2, K);
      ret(ctx, px + 1, py - 3, 2, 4, K);
      ret(ctx, px + 4, py + 6, 8, 3, K); ret(ctx, px + 3, py + 9, 10, 6, K); ret(ctx, px + 4, py + 10, 8, 4, '#d9a93a');
    } });
  // a parede pintada com flores e caracóis (2 × 2), como a de dentro da catedral
  obj('pintura-flores', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 4, 30, 26, '#fff3d6');
      [[8, 12, VERMELHO], [22, 11, '#5fb4ff'], [15, 21, OURO], [6, 24, '#b58cff'], [25, 23, '#ff7eb6']].forEach(function (f) {
        var x = px + f[0], y = py + f[1];
        ret(ctx, x, y + 2, 1, 5, '#5e9a3a'); ret(ctx, x + 1, y + 4, 2, 1, '#6fdc8c'); ret(ctx, x - 2, y + 5, 2, 1, '#6fdc8c');
        circulo(ctx, x, y, 3, K); circulo(ctx, x, y, 2, f[2]); ret(ctx, x, y, 1, 1, C.ouro3);
      });
      for (var i = 0; i < 26; i += 2) { ret(ctx, px + 3 + i, py + 6 + (i % 4 ? 0 : 1), 1, 1, '#5e9a3a'); ret(ctx, px + 3 + i, py + 27 - (i % 4 ? 0 : 1), 1, 1, '#c0502a'); }
    } });

  /* ================= Monte Fuji ================= */
  // o monte de topo nevado, o sol vermelho e um galho de cerejeira
  janela('fuji', function (ctx, x, y, w, h) {
    circulo(ctx, x + 20, y + 4, 3, VERMELHO);
    for (var j = 0; j < 12; j++) {
      var l = 4 + j * 2, xx = x + 12 - j;
      ret(ctx, xx, y + 6 + j, l, 1, j < 4 ? C.branco : '#7a8ad8'); ret(ctx, xx, y + 6 + j, 1, 1, K); ret(ctx, xx + l - 1, y + 6 + j, 1, 1, K);
    }
    ret(ctx, x, y + h - 2, w, 2, '#6fae6a');
    ret(ctx, x, y + 2, 6, 1, '#8a5a3a'); [[1, 3], [4, 4], [6, 2]].forEach(function (f) { ret(ctx, x + f[0], y + f[1], 2, 2, '#ffb8d6'); });
  }, '#e8c890');
  // o portão vermelho torii (3 × 1, sobe 30 px): ela passa por baixo dele
  obj('torii', { w: 3, h: 1, topo: 30, solido: false,
    desenhar: function (ctx, px, py) {
      [px + 4, px + 39].forEach(function (x) { caixa(ctx, x, py - 22, 5, 36, VERMELHO); ret(ctx, x - 1, py + 11, 7, 4, K); });
      caixa(ctx, px + 1, py - 18, 46, 4, VERMELHO);
      ret(ctx, px, py - 27, 48, 6, K); ret(ctx, px + 1, py - 26, 46, 2, VERMELHO); ret(ctx, px + 1, py - 24, 46, 2, '#3a3a5a');
      ret(ctx, px - 1, py - 29, 4, 3, K); ret(ctx, px + 45, py - 29, 4, 3, K);
      caixa(ctx, px + 21, py - 22, 6, 5, '#3a3a5a');
    } });
  // a cerejeira florida no vaso (1 × 1, sobe 22 px)
  obj('cerejeira', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 3, py + 6, 10, 9, '#5fb4ff'); ret(ctx, px + 4, py + 9, 8, 1, C.branco);
      ret(ctx, px + 7, py - 6, 3, 13, K); ret(ctx, px + 8, py - 5, 1, 12, '#8a5a3a'); ret(ctx, px + 9, py - 9, 3, 2, K);
      [[8, -16, 7, 5], [3, -11, 5, 4], [13, -11, 4, 4]].forEach(function (n) {
        elipse(ctx, px + n[0], py + n[1], n[2], n[3], K); elipse(ctx, px + n[0], py + n[1], n[2] - 1, n[3] - 1, '#ffb8d6');
      });
      [[6, -18], [10, -15], [3, -12], [13, -11], [8, -13]].forEach(function (f) { ret(ctx, px + f[0], py + f[1], 1, 1, C.branco); });
    } });
  // a mesinha baixa do chá verde (2 × 1, sobe 4 px): o bule e as duas xícaras
  obj('mesa-cha', { w: 2, h: 1, topo: 4,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py + 2, 28, 7, '#8a4a3a'); ret(ctx, px + 4, py + 9, 3, 5, K); ret(ctx, px + 25, py + 9, 3, 5, K);
      elipse(ctx, px + 15, py - 1, 5, 4, K); elipse(ctx, px + 15, py - 1, 4, 3, '#6fae6a');
      ret(ctx, px + 14, py - 6, 3, 2, K); ret(ctx, px + 20, py - 2, 3, 2, K); ret(ctx, px + 7, py - 2, 3, 1, K);
      [6, 24].forEach(function (x) { ret(ctx, px + x, py, 4, 3, K); ret(ctx, px + x + 1, py, 2, 2, '#e8f4d8'); });
    } });
  // a lanterna de pedra do jardim (1 × 1, sobe 18 px), com a luz quentinha
  obj('lanterna-pedra', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var p = '#c9c2d6';
      caixa(ctx, px + 3, py + 9, 10, 6, p); caixa(ctx, px + 6, py - 2, 4, 12, p);
      caixa(ctx, px + 3, py - 9, 10, 8, p); ret(ctx, px + 5, py - 7, 6, 4, '#ffe08a'); ret(ctx, px + 6, py - 6, 4, 2, C.ouro3);
      ret(ctx, px + 1, py - 13, 14, 4, K); ret(ctx, px + 2, py - 12, 12, 2, '#a8a0b8');
      ret(ctx, px + 6, py - 17, 4, 4, K); ret(ctx, px + 7, py - 16, 2, 2, p);
    } });
})();
