/* Casa das Palavras, parte 4 de 6: os objetos do Parque do Carrossel e o quadro do raro, estreito.
   Usa portugues/objetos-hall-cozinha.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.portugues;
  var VERM = S.VERM, VERM2 = S.VERM2, VERDE = S.VERDE, VERDE2 = S.VERDE2, VERDE3 = S.VERDE3, BANANA = S.BANANA,
      TERRA = S.TERRA, FOLHA = S.FOLHA, FOLHA2 = S.FOLHA2, v = S.v, letra = S.letra, mesinha = S.mesinha;

  /* ================= PARQUE DO CARROSSEL ================= */
  // carrossel de três unicórnios, cada um preso na sua barra, em alturas alternadas
  var CARROSSEL_BARRAS = [-15, 0, 15];
  I.objeto('portugues-carrossel', { w: 3, h: 3, topo: 23, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // sombra no chão e a plataforma redonda com a saia listrada
      elipse(ctx, cx, py + 44, 24, 4, 'rgba(58,36,70,0.22)');
      elipse(ctx, cx, py + 40, 23, 7, K); elipse(ctx, cx, py + 40, 22, 6, '#ffd1e6'); elipse(ctx, cx, py + 38, 21, 4, '#ffe6f2');
      ret(ctx, cx - 22, py + 40, 45, 3, '#ff7eb6');
      for (var sx = cx - 21; sx < cx + 22; sx += 6) ret(ctx, sx, py + 40, 3, 3, '#ffc2dc');
      ret(ctx, cx - 22, py + 43, 45, 1, K);
      ret(ctx, cx - 19, py + 36, 6, 1, C.branco);
      // coluna central (espelhada, com luzinhas)
      ret(ctx, cx - 3, py - 4, 7, 42, K); ret(ctx, cx - 2, py - 4, 5, 41, '#ffd1e6'); ret(ctx, cx - 2, py - 4, 1, 41, C.branco);
      for (var ly = py + 2; ly < py + 36; ly += 6) { ret(ctx, cx, ly, 1, 1, C.ouro); ret(ctx, cx, ly + 3, 1, 1, '#5fb4ff'); }
      // as três barras douradas, do teto até a plataforma
      CARROSSEL_BARRAS.forEach(function (dx) {
        var bx = cx + dx;
        ret(ctx, bx - 1, py + 3, 3, 36, K); ret(ctx, bx, py + 3, 1, 36, C.ouro); ret(ctx, bx, py + 3, 1, 36, C.ouro);
        for (var k = py + 5; k < py + 38; k += 4) ret(ctx, bx, k, 1, 1, C.ouro3);
      });
      // telhado de lona listrada com babados
      triangulo(ctx, cx - 25, py - 18, 51, 16, K);
      for (var j = 0; j < 14; j++) {
        var m = Math.round(24 * (j + 1) / 15);
        for (var i = -m; i < m; i++) ret(ctx, cx + i, py - 17 + j, 1, 1, (Math.floor((i + 48) / 6) % 2) ? C.branco : '#ff5c8a');
      }
      ret(ctx, cx - 25, py - 3, 51, 4, K); ret(ctx, cx - 24, py - 2, 49, 2, C.ouro);
      for (var b = 0; b < 12; b++) { ret(ctx, cx - 24 + b * 4, py + 1, 4, 3, K); ret(ctx, cx - 23 + b * 4, py + 1, 2, 2, b % 2 ? '#5fb4ff' : '#ff5c8a'); }
      ret(ctx, cx, py - 22, 1, 5, K); ret(ctx, cx + 1, py - 22, 5, 3, VERDE); ret(ctx, cx + 1, py - 22, 5, 1, VERDE3);
    },
    anim: function (ctx, px, py, t) {
      bichinhos(ctx, px, py, t);
    } });
  // unicórnio de carrossel (olhando para a direita): chifre dourado, crina e rabo de duas cores
  var UNI_CARROSSEL = [
    '............y...',
    '...........yy...',
    '.........kkyk...',
    '........kmccck..',
    '.......kmnccecck',
    '.......knmccccck',
    '......kmnmcckkk.',
    '..kkkkknmccck...',
    '.kmkcccccccccck.',
    'kmnkcccccccccck.',
    'kn.kcccccccccck.',
    '....kcckkkkcck..',
    '....kk.....kk...',
  ];
  // sobem e descem em alturas alternadas; parado (sem animações) um fica em cima e os outros embaixo
  function bichinhos(ctx, px, py, t) {
    var cx = px + 24;
    var cores = [['#ffffff', '#ff7eb6', '#b58cff'], ['#e8dcff', '#5fb4ff', '#6fdc8c'], ['#ffe6f2', '#ffd34d', '#ff9d2e']];
    CARROSSEL_BARRAS.forEach(function (dx, i) {
      var fase = (i % 2 ? Math.PI : 0), y = py + 16 + Math.round(Math.sin(t / 420 + fase) * 4.5), x = cx + dx, vira = dx < 0;
      if (!t) y = py + (i % 2 ? 21 : 12);
      var pal = { k: K, K: K, c: cores[i][0], m: cores[i][1], n: cores[i][2], e: K, y: C.ouro };
      for (var j = 0; j < UNI_CARROSSEL.length; j++) for (var a = 0; a < 16; a++) {
        var ch = UNI_CARROSSEL[j][vira ? 15 - a : a], cor = pal[ch];
        if (cor) ret(ctx, x - (vira ? 9 : 6) + a, y + j, 1, 1, cor);
      }
      // bochecha rosada, a selinha no lombo e a barra passando por ela
      ret(ctx, x + (vira ? -3 : 6), y + 5, 1, 1, '#ff9cc6');
      ret(ctx, x - 2, y + 7, 5, 2, VERM); ret(ctx, x - 2, y + 8, 5, 1, VERM2); ret(ctx, x - 1, y + 9, 3, 1, C.ouro);
      ret(ctx, x, y + 6, 1, 4, C.ouro); ret(ctx, x, y + 6, 1, 1, C.ouro3);
    });
  }
  I.objeto('portugues-arvore', { w: 1, h: 1, topo: 28, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 3, py - 6, 7, 21, K); ret(ctx, cx - 2, py - 6, 5, 20, C.madeira2); ret(ctx, cx - 2, py - 6, 1, 20, C.madeira);
      ret(ctx, cx - 5, py + 13, 11, 2, K);
      circulo(ctx, cx, py - 16, 12, K); circulo(ctx, cx, py - 16, 11, FOLHA2);
      circulo(ctx, cx - 4, py - 19, 6, FOLHA); circulo(ctx, cx + 5, py - 14, 5, FOLHA); circulo(ctx, cx + 1, py - 23, 4, '#8fd08f');
      [[-6, -12], [4, -21], [7, -9], [-2, -16]].forEach(function (p) { ret(ctx, cx + p[0], py + p[1], 2, 2, '#ff5c6a'); });
    } });
  I.objeto('portugues-baloes', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 9, 11, 6, K); ret(ctx, cx - 4, py + 10, 9, 4, '#5fb4ff');
      baloes(ctx, px, py, 0);
    },
    anim: function (ctx, px, py, t) { baloes(ctx, px, py, t); } });
  function baloes(ctx, px, py, t) {
    var cx = px + 8, cores = ['#ff5c8a', '#ffd34d', '#5fb4ff', '#6fdc8c', '#b58cff'];
    [[-6, -20], [0, -24], [6, -19], [-3, -14], [4, -12]].forEach(function (b, i) {
      var d = t ? Math.round(Math.sin(t / 500 + i) * 1) : 0, x = cx + b[0] + d, y = py + b[1];
      ret(ctx, cx, y + 4, 1, py + 10 - y - 4, '#8a7aa8');
      elipse(ctx, x, y, 3, 4, K); elipse(ctx, x, y, 2, 3, cores[i]); ret(ctx, x - 1, y - 2, 1, 1, C.branco);
      ret(ctx, x, y + 4, 1, 1, K);
    });
  }
  I.objeto('portugues-mel', { w: 1, h: 1, topo: 17, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, MEL = '#ffb020', MEL2 = '#e08a10', MEL3 = '#ffe08a';
      mesinha(ctx, cx, py, py + 1, '#ffe28a');
      // pote de vidro cheio de mel, com rótulo MEL, tampa de paninho xadrez e o mel escorrendo
      ret(ctx, cx - 6, py - 11, 13, 13, K); ret(ctx, cx - 7, py - 9, 15, 9, K);
      ret(ctx, cx - 5, py - 10, 11, 11, MEL); ret(ctx, cx - 6, py - 8, 13, 7, MEL);
      ret(ctx, cx + 4, py - 9, 2, 9, MEL2); ret(ctx, cx - 5, py - 9, 1, 8, MEL3);
      ret(ctx, cx - 5, py, 11, 1, MEL2);
      // rótulo
      ret(ctx, cx - 7, py - 8, 15, 7, K); ret(ctx, cx - 6, py - 7, 13, 5, C.creme);
      D.matriz(ctx, cx - 6, py - 7, ['#...#', '##.##', '#.#.#', '#...#', '#...#'], { '#': '#b8603a' });
      letra(ctx, 'E', cx, py - 7, '#b8603a'); letra(ctx, 'L', cx + 4, py - 7, '#b8603a');
      // tampa de pano vermelho com bolinhas, amarrada
      ret(ctx, cx - 6, py - 15, 13, 5, K); ret(ctx, cx - 5, py - 14, 11, 3, VERM); ret(ctx, cx - 7, py - 12, 15, 2, K); ret(ctx, cx - 6, py - 12, 13, 1, VERM2);
      ret(ctx, cx - 3, py - 14, 1, 1, C.branco); ret(ctx, cx + 1, py - 13, 1, 1, C.branco); ret(ctx, cx + 4, py - 14, 1, 1, C.branco);
      ret(ctx, cx - 5, py - 11, 11, 1, '#f3c890');
      // mel escorrendo pela beirada do pote
      ret(ctx, cx - 6, py - 10, 2, 2, MEL); ret(ctx, cx - 7, py - 9, 1, 4, MEL); ret(ctx, cx - 7, py - 5, 1, 1, MEL2);
      // pingo de mel na mesa e a abelhinha
      ret(ctx, cx + 6, py + 2, 2, 1, MEL);
      ret(ctx, cx + 6, py - 16, 4, 3, K); ret(ctx, cx + 7, py - 15, 1, 1, BANANA); ret(ctx, cx + 9, py - 15, 1, 1, BANANA); ret(ctx, cx + 8, py - 15, 1, 1, K);
      ret(ctx, cx + 7, py - 18, 2, 2, '#dff4ff');
    } });
  I.objeto('portugues-algodao', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx - 4, py + 12, 2, K); circulo(ctx, cx + 5, py + 12, 2, K);
      ret(ctx, cx - 6, py, 13, 11, K); ret(ctx, cx - 5, py + 1, 11, 9, '#9fdcff');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 4 + i * 4, py + 1, 2, 9, C.branco);
      // três algodões-doces nos palitos
      [[-4, -9, '#ff9cc6'], [1, -12, '#c9a8ff'], [5, -8, '#ff9cc6']].forEach(function (a) {
        ret(ctx, cx + a[0], py + a[1] + 3, 1, 1 - a[1] - 3 + 0, C.creme);
        circulo(ctx, cx + a[0], py + a[1], 4, K); circulo(ctx, cx + a[0], py + a[1], 3, a[2]); ret(ctx, cx + a[0] - 2, py + a[1] - 2, 1, 1, C.branco);
      });
    } });
  I.objeto('portugues-poste', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, VERDE2);
      ret(ctx, cx - 1, py - 14, 3, 26, K); ret(ctx, cx, py - 14, 1, 25, VERDE);
      ret(ctx, cx - 4, py - 22, 9, 9, K); ret(ctx, cx - 3, py - 21, 7, 7, '#fff3a0'); ret(ctx, cx - 3, py - 21, 2, 7, C.branco);
      triangulo(ctx, cx - 5, py - 26, 11, 5, K); ret(ctx, cx, py - 28, 1, 2, K);
    } });
  I.objeto('portugues-banco-praca', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 8, 28, 9, K);
      for (var j = 0; j < 3; j++) ret(ctx, px + 3, py - 7 + j * 3, 26, 2, j % 2 ? '#ff9d6a' : '#ff7e5a');
      ret(ctx, px + 1, py + 1, 30, 5, K); ret(ctx, px + 2, py + 2, 28, 3, '#ff9d6a'); ret(ctx, px + 2, py + 2, 28, 1, '#ffc2a0');
      ret(ctx, px + 4, py + 6, 3, 9, K); ret(ctx, px + 25, py + 6, 3, 9, K);
      ret(ctx, px + 5, py + 6, 1, 8, '#5a5a6a'); ret(ctx, px + 26, py + 6, 1, 8, '#5a5a6a');
    } });
  I.objeto('portugues-bola', { w: 1, h: 1, topo: 1, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 9;
      circulo(ctx, cx, cy, 5, K); circulo(ctx, cx, cy, 4, C.branco);
      ret(ctx, cx - 4, cy - 1, 9, 2, '#ff5c8a'); ret(ctx, cx - 1, cy - 4, 2, 9, '#5fb4ff'); ret(ctx, cx - 2, cy - 3, 1, 1, C.branco);
    } });
  I.objeto('portugues-canteiro-flores', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#ff7eb6');
      ret(ctx, px + 1, py + 7, 14, 8, K); ret(ctx, px + 2, py + 8, 12, 6, '#c9a27a'); ret(ctx, px + 2, py + 8, 12, 1, '#e8c9a0');
      ret(ctx, px + 3, py + 9, 10, 2, TERRA);
      [3, 7, 11].forEach(function (x, i) {
        ret(ctx, px + x + 1, py + 3, 1, 6, FOLHA2);
        ret(ctx, px + x, py + 1 + i % 2, 3, 3, i === 1 ? '#ffd34d' : c); ret(ctx, px + x + 1, py + 2 + i % 2, 1, 1, C.branco);
      });
    } });

  /* ================= QUADRO DO RARO, ESTREITO ================= */
  // o mesmo quadro-unicornio da biblioteca, 4 px mais estreito e encostado num lado (var.lado: 'dir'|'esq'),
  // para ficar inteiro ao lado de uma placa de sala comprida (a placa fica no meio da parede, em cima)
  var QU = I.OBJETOS['quadro-unicornio'];
  I.objeto('portugues-quadro-estreito', { w: 2, h: 2, parede: true, solido: false,
    chave: function (P, o) { return QU.chave(P, o); },
    desenhar: function (ctx, px, py, o, P) {
      QU.desenhar(ctx, px + (v(o, 'lado', 'dir') === 'dir' ? 4 : 0), py, Object.assign({}, o, { w: 1.75 }), P);
    } });

})();
