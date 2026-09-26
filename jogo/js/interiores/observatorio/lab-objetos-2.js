/* Laboratório de Ciências (3º andar do Observatório), parte 2 de 3: os objetos da sala 3 (Amigos da
   Natureza) e da sala 4 (Cada Um no Seu Hábitat). Prefixo lab-; cores e ajudantes em S.lab (lab-objetos-1.js). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var L = R._predios.observatorio.lab;
  var v = L.v, bicho = L.bicho, FOLHA = L.FOLHA, FOLHA2 = L.FOLHA2, AREIA = L.AREIA, AREIA2 = L.AREIA2, AMARELO = L.AMARELO;
  var TERRA = L.TERRA, TERRA2 = L.TERRA2, VIDRO = L.VIDRO, AGUA = L.AGUA;
  var CACTO = '#4f9a5a', CACTO2 = '#2f7a45', GELO = '#eaf8ff', GELO2 = '#bfe4f5';

  /* ================= SALA 3: Amigos da Natureza ================= */
  I.objeto('lab-cogumelo', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', C.vermelho);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 8, 2, 6, C.creme);
      elipse(ctx, px + 8, py + 6, 7, 4, K); elipse(ctx, px + 8, py + 6, 6, 3, cor);
      ret(ctx, px + 5, py + 4, 2, 1, C.branco); ret(ctx, px + 10, py + 6, 2, 1, C.branco);
    } });
  I.objeto('lab-bufalo', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // o búfalo de lado e o passarinho nas costas
      bicho(ctx, px + 8, py + 14, [
        '.............k..', '..........k.kbk.', '.kkkkkkkk.kkbbk.', 'kbbbbbbbbkbbbbk.', 'kbbbbbbbbbbwbbbk', 'kbbbbbbbbbbbbbbk',
        'kbbbbbbbbbbbbkk.', '.kbbbbbbbbbbk...', '.kbk.kbk.kbk....', '.kbk.kbk.kbk....', '.kk..kk..kk.....',
      ], { b: '#5a4a5a', w: C.branco });
      bicho(ctx, px + 5, py + 3, ['.kk..', 'kyyk.', 'kyyyl', '.kk..'], { y: C.azul, l: C.laranja });
    } });
  I.objeto('lab-memoria', { w: 2, h: 5, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      // as cartas do jogo da memória no chão: pares de amigos (abelha e flor, pássaro e búfalo)
      var desenhos = ['flor', 'abelha', 'passaro', 'flor', 'bufalo', 'abelha', 'passaro', 'bufalo'];
      for (var i = 0; i < 8; i++) {
        var x = px + 3 + (i % 2) * 14, y = py + 4 + (i >> 1) * 19;
        ret(ctx, x, y, 12, 15, K); ret(ctx, x + 1, y + 1, 10, 13, i === 6 || i === 7 ? '#7c5cff' : C.creme);
        if (i >= 6) { ret(ctx, x + 5, y + 6, 2, 2, AMARELO); continue; }   // cartas ainda viradas
        var d = desenhos[i], cx = x + 6, cy = y + 7;
        if (d === 'flor') { circulo(ctx, cx, cy, 3, C.rosa); circulo(ctx, cx, cy, 1, AMARELO); }
        else if (d === 'abelha') { elipse(ctx, cx, cy, 3, 2, AMARELO); ret(ctx, cx - 1, cy - 2, 1, 5, K); ret(ctx, cx + 1, cy - 2, 1, 5, K); }
        else if (d === 'passaro') { elipse(ctx, cx, cy, 3, 2, C.azul); ret(ctx, cx + 3, cy - 1, 2, 1, C.laranja); }
        else { elipse(ctx, cx, cy, 4, 3, '#5a4a5a'); ret(ctx, cx + 2, cy - 4, 1, 2, C.creme); }
      }
    } });
  I.objeto('lab-beija-flor', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 8, 10, 7, K); ret(ctx, px + 4, py + 9, 8, 5, C.terracota);
      ret(ctx, px + 7, py - 10, 2, 18, FOLHA2); elipse(ctx, px + 4, py, 3, 1, FOLHA); elipse(ctx, px + 12, py - 4, 3, 1, FOLHA);
      // a flor em trombeta e o beija-flor bebendo o néctar
      triangulo(ctx, px + 5, py - 17, 7, 7, K); triangulo(ctx, px + 6, py - 16, 5, 6, C.vermelho); ret(ctx, px + 7, py - 11, 3, 2, C.vermelho);
      bicho(ctx, px + 2, py - 12, ['..kk..', '.kggk.', 'kgggglll', '.kgk..', '..k...'].map(function (l) { return (l + '........').slice(0, 8); }), { g: '#39c5bb', l: K });
    } });
  I.objeto('lab-flores', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 9, 14, 6, K); ret(ctx, px + 2, py + 10, 12, 4, TERRA);
      var cores = [C.rosa, AMARELO, C.lilas];
      for (var i = 0; i < 3; i++) {
        var x = px + 4 + i * 4, y = py + 2 + (i % 2) * 3;
        ret(ctx, x, y + 2, 1, 7 - (i % 2) * 3, FOLHA2); circulo(ctx, x, y, 2, cores[i]); ret(ctx, x, y, 1, 1, C.branco);
      }
      bicho(ctx, px + 12, py - 2, ['.kk', 'kyk', '.kk'], { y: AMARELO });
    } });

  /* ================= SALA 4: Cada Um no Seu Hábitat ================= */
  I.objeto('lab-iglu', { w: 3, h: 2, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 26, 23, 5, GELO2);
      elipse(ctx, px + 18, py + 16, 16, 15, K); elipse(ctx, px + 18, py + 16, 15, 14, GELO); ret(ctx, px + 2, py + 17, 33, 14, GELO);
      ret(ctx, px + 2, py + 30, 33, 1, K);
      for (var y = py + 6; y < py + 30; y += 6) ret(ctx, px + 5, y, 27, 1, GELO2);
      ret(ctx, px + 13, py + 20, 10, 10, K); ret(ctx, px + 14, py + 21, 8, 9, '#3a4a6a');
      // o urso-polar na frente
      bicho(ctx, px + 40, py + 30, [
        '.kk....kk..', 'kwwk..kwwk.', 'kwwwkkwwwwk', 'kwkwwwwkwwk', 'kwwwwkwwwwk', '.kwwwwwwwk.',
        'kwwwwwwwwwk', 'kwwwwwwwwwk', 'kwwwwwwwwwk', '.kwk...kwk.', '.kk.....kk.',
      ], { w: '#fffdf6' });
    } });
  I.objeto('lab-aquario', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      L.tampo(ctx, px, py, py + 4, 2);
      ret(ctx, px + 2, py - 16, 28, 21, K); ret(ctx, px + 3, py - 15, 26, 19, VIDRO); ret(ctx, px + 3, py - 11, 26, 15, '#7ecff0');
      ret(ctx, px + 3, py + 1, 26, 3, AREIA);
      // o aguapé boiando: folhas redondas e a flor lilás; raízes na água
      elipse(ctx, px + 10, py - 11, 4, 2, FOLHA); elipse(ctx, px + 16, py - 12, 3, 2, FOLHA2); circulo(ctx, px + 13, py - 14, 2, '#b58cff');
      for (var i = 0; i < 4; i++) ret(ctx, px + 9 + i * 3, py - 9, 1, 5, '#6b5a4a');
      bicho(ctx, px + 22, py - 4, ['.kkk.k', 'kooookk', 'kwoooko', '.kkk.k'].map(function (l) { return (l + '.').slice(0, 7); }), { o: C.laranja, w: K });
      ret(ctx, px + 4, py - 14, 1, 14, C.branco); ret(ctx, px + 25, py - 9, 1, 1, C.branco); ret(ctx, px + 26, py - 12, 1, 1, C.branco);
    } });
  // cacto de vaso (var.pequeno) ou mandacaru grande
  I.objeto('lab-cacto', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var p = v(o, 'pequeno', false), topo = p ? py : py - 13;
      ret(ctx, px + 3, py + 8, 10, 7, K); ret(ctx, px + 4, py + 9, 8, 5, C.terracota);
      ret(ctx, px + 5, topo, 6, py + 9 - topo, K); ret(ctx, px + 6, topo + 1, 4, py + 8 - topo, CACTO); ret(ctx, px + 7, topo + 1, 1, py + 8 - topo, CACTO2);
      if (!p) {
        ret(ctx, px + 1, py - 6, 4, 3, K); ret(ctx, px + 1, py - 9, 3, 4, K); ret(ctx, px + 2, py - 8, 1, 4, CACTO); ret(ctx, px + 3, py - 5, 2, 1, CACTO);
        ret(ctx, px + 11, py - 3, 4, 3, K); ret(ctx, px + 12, py - 7, 3, 5, K); ret(ctx, px + 13, py - 6, 1, 5, CACTO); ret(ctx, px + 11, py - 2, 2, 1, CACTO);
        circulo(ctx, px + 8, topo - 1, 2, C.rosa);
      }
      ret(ctx, px + 6, topo + 3, 1, 1, C.branco); ret(ctx, px + 9, topo + 6, 1, 1, C.branco);
    } });
  I.objeto('lab-camelo', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      bicho(ctx, px + 8, py + 14, [
        '.............kk', '....kk......kck', '...kcck.....kck', '..kcccck...kcck', '.kcccccckkkcck.', 'kccccccccccck..',
        'kccccccccccck..', '.kcccccccccck..', '..kck.kck.kck..', '..kck.kck.kck..', '..kck.kck.kck..', '..kk..kk..kk...',
      ], { c: '#d9a86a' });
      ret(ctx, px + 13, py + 3, 1, 1, K);
    } });
  I.objeto('lab-areia', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      // chão da Caatinga: terra seca rachada
      elipse(ctx, px + 24, py + 16, 23, 14, AREIA2); elipse(ctx, px + 24, py + 16, 21, 12, AREIA);
      ret(ctx, px + 10, py + 12, 6, 1, TERRA); ret(ctx, px + 15, py + 13, 1, 4, TERRA); ret(ctx, px + 26, py + 8, 1, 5, TERRA);
      ret(ctx, px + 27, py + 13, 7, 1, TERRA); ret(ctx, px + 20, py + 21, 8, 1, TERRA); ret(ctx, px + 34, py + 18, 1, 5, TERRA);
    } });
  I.objeto('lab-caatinga', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 13, 15, 3, AREIA2);
      // arbustos secos de galhos finos e o calango
      for (var i = 0; i < 2; i++) {
        var x = px + 6 + i * 16;
        ret(ctx, x, py - 6, 2, 19, TERRA2); ret(ctx, x - 4, py - 2, 4, 1, TERRA2); ret(ctx, x + 2, py - 5, 4, 1, TERRA2); ret(ctx, x - 3, py - 8, 1, 6, TERRA2);
        ret(ctx, x + 5, py - 9, 1, 4, TERRA2); elipse(ctx, x - 4, py - 9, 2, 1, '#9fb85a');
      }
      bicho(ctx, px + 15, py + 13, ['..kk.....', '.kggkkkk.', 'kgwgggggk', '.k.k.k.kk'], { g: '#b8a060', w: K });
    } });
  I.objeto('lab-termometro', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 11, 10, 4, K); ret(ctx, px + 4, py + 12, 8, 2, C.madeira);
      ret(ctx, px + 4, py - 13, 8, 25, K); ret(ctx, px + 5, py - 12, 6, 23, C.creme);
      ret(ctx, px + 7, py - 10, 2, 17, K); ret(ctx, px + 7, py - 2, 2, 9, C.vermelho); circulo(ctx, px + 8, py + 8, 2, C.vermelho);
      ret(ctx, px + 5, py - 11, 2, 2, C.azul2); ret(ctx, px + 9, py + 3, 2, 2, C.laranja);
    } });
  I.objeto('lab-bloco-gelo', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 14, 12, K); ret(ctx, px + 2, py + 4, 12, 10, GELO); ret(ctx, px + 2, py + 4, 12, 2, C.branco);
      ret(ctx, px + 9, py + 7, 3, 1, GELO2); ret(ctx, px + 4, py + 10, 4, 1, GELO2);
    } });
  L.GELO = GELO; L.GELO2 = GELO2; L.CACTO = CACTO; L.CACTO2 = CACTO2;
})();
