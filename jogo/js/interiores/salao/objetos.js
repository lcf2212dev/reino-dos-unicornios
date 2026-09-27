/* Salão de Beleza, parte 2: as cores do salão e os objetos próprios ('salao-<nome>'): espelho de camarim, cadeira
   de cabeleireira, secador de capacete, carrinho de pentes, prateleira de produtos, lavatório, arara de roupas,
   provador e a placa da tesoura. O que as partes dividem fica em Reino._predios.salao (cores e a tesoura, que o
   fora.js também desenha). Nada de canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = (R._predios = R._predios || {}).salao = {};
  // rosa e lilás, com cromado e dourado
  S.COR = '#9b6bd6'; S.COR2 = '#ff8ac4'; S.PAREDE = '#fff0f7';
  var LILAS = '#c9a6ff', LILAS2 = '#9b6bd6', LILAS3 = '#efe2ff';
  var ROSA = '#ff8ac4', ROSA2 = '#ffc2e0', ROSA3 = '#ffe4f1', ROSA4 = '#e0609e';
  var MENTA = '#8fe0d0', CROMO = '#d8e0ec', CROMO2 = '#9aa6bc';
  S.LILAS = LILAS; S.LILAS2 = LILAS2; S.LILAS3 = LILAS3; S.ROSA = ROSA; S.ROSA2 = ROSA2; S.ROSA3 = ROSA3; S.ROSA4 = ROSA4;
  S.MENTA = MENTA; S.CROMO = CROMO; S.CROMO2 = CROMO2;

  // tesoura aberta (x, y = canto de cima; 11 × 12), com as argolas coloridas
  var TESOURA = ['k.........k', 'kwk.....kwk', '.kwk...kwk.', '..kwk.kwk..', '...kwkwk...', '....kyk....',
    '...kpkpk...', '..kpk.kpk..', '.kpppkpppk.', 'kp.pk.kp.pk', 'kpppk.kpppk', '.kkk...kkk.'];
  S.tesoura = function (ctx, x, y, cor) { D.matriz(ctx, x, y, TESOURA, { k: K, w: CROMO, y: C.ouro, p: cor || ROSA }); };
  // pente (x, y; largura w)
  S.pente = function (ctx, x, y, w, cor) {
    ret(ctx, x, y, w, 3, K); ret(ctx, x + 1, y + 1, w - 2, 1, cor || MENTA);
    for (var i = 1; i < w - 1; i += 2) ret(ctx, x + i, y + 3, 1, 2, K);
  };
  // frasquinho (x, base yb) com tampa
  function frasco(ctx, x, yb, w, h, cor, tampa) {
    ret(ctx, x, yb - h, w, h, K); ret(ctx, x + 1, yb - h + 1, w - 2, h - 2, cor);
    ret(ctx, x + 1, yb - h + 1, 1, h - 3, D.clarear(cor, 0.45));
    ret(ctx, x + Math.floor(w / 2) - 1, yb - h - 3, 3, 3, K); ret(ctx, x + Math.floor(w / 2), yb - h - 2, 1, 2, tampa || C.branco);
  }
  S.frasco = frasco;
  // lampadinha do camarim
  function lampada(ctx, cx, cy) { ret(ctx, cx - 1, cy - 1, 3, 3, K); ret(ctx, cx, cy, 1, 1, C.ouro3); }

  /* ================= NA PAREDE ================= */
  // espelho de camarim: moldura lilás com lampadinhas, reflexo azulado e um brilho
  I.objeto('salao-espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      contornoRet(ctx, px + 1, py + 5, 14, 22, LILAS);
      ret(ctx, px + 3, py + 7, 10, 18, K); ret(ctx, px + 4, py + 8, 8, 16, '#d6ecfa');
      ret(ctx, px + 4, py + 18, 8, 6, '#c2e0f4'); ret(ctx, px + 5, py + 9, 1, 5, C.branco); ret(ctx, px + 6, py + 9, 1, 2, C.branco);
      [[py + 7], [py + 13], [py + 19], [py + 25]].forEach(function (y) { lampada(ctx, px + 2, y[0]); lampada(ctx, px + 14, y[0]); });
      ret(ctx, cx - 1, py + 3, 3, 3, K); ret(ctx, cx, py + 4, 1, 1, ROSA);
    } });
  // prateleira de produtos: xampus, cremes e um vasinho, em duas tábuas
  I.objeto('salao-prateleira', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      [py + 14, py + 26].forEach(function (y) {
        ret(ctx, px + 1, y, 30, 3, K); ret(ctx, px + 2, y, 28, 1, C.madeiraClara); ret(ctx, px + 2, y + 1, 28, 1, C.madeira);
      });
      frasco(ctx, px + 3, py + 14, 5, 8, ROSA, C.branco); frasco(ctx, px + 9, py + 14, 5, 6, MENTA, LILAS2);
      frasco(ctx, px + 15, py + 14, 4, 9, LILAS, C.ouro); frasco(ctx, px + 21, py + 14, 6, 7, C.ouro, ROSA4);
      frasco(ctx, px + 3, py + 26, 6, 6, '#ffb74d', C.branco); frasco(ctx, px + 11, py + 26, 4, 8, '#5fb4ff', C.branco);
      // pote de creme e florzinha
      ret(ctx, px + 17, py + 22, 7, 4, K); ret(ctx, px + 18, py + 23, 5, 2, ROSA3); ret(ctx, px + 17, py + 21, 7, 2, K); ret(ctx, px + 18, py + 21, 5, 1, ROSA);
      ret(ctx, px + 26, py + 22, 3, 4, K); ret(ctx, px + 27, py + 23, 1, 2, C.terracota);
      circulo(ctx, px + 27, py + 19, 2, K); ret(ctx, px + 26, py + 18, 3, 3, ROSA2); ret(ctx, px + 27, py + 19, 1, 1, C.ouro);
    } });
  // placa da tesoura, pendurada
  I.objeto('salao-placa', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 3, 2, 4, K);
      contornoRet(ctx, px + 1, py + 7, 14, 17, ROSA3);
      ret(ctx, px + 2, py + 8, 12, 1, ROSA2);
      S.tesoura(ctx, px + 3, py + 10, LILAS2);
    } });

  /* ================= NO CHÃO ================= */
  // cadeira de cabeleireira: assento fofinho rosa, encosto alto, pé cromado com pedal
  I.objeto('salao-cadeira', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py - 12, 11, 13, K); ret(ctx, cx - 4, py - 11, 9, 11, ROSA); ret(ctx, cx - 4, py - 11, 9, 2, ROSA2);
      ret(ctx, cx - 2, py - 7, 1, 5, ROSA4); ret(ctx, cx + 2, py - 7, 1, 5, ROSA4);
      ret(ctx, cx - 7, py - 1, 15, 6, K); ret(ctx, cx - 6, py, 13, 3, ROSA); ret(ctx, cx - 6, py, 13, 1, ROSA2); ret(ctx, cx - 6, py + 3, 13, 1, ROSA4);
      // braços
      ret(ctx, cx - 8, py - 3, 3, 4, K); ret(ctx, cx + 6, py - 3, 3, 4, K); ret(ctx, cx - 7, py - 2, 1, 2, CROMO); ret(ctx, cx + 7, py - 2, 1, 2, CROMO);
      ret(ctx, cx - 1, py + 5, 3, 6, K); ret(ctx, cx, py + 5, 1, 5, CROMO);
      elipse(ctx, cx, py + 12, 6, 2, K); elipse(ctx, cx, py + 12, 5, 1, CROMO2); ret(ctx, cx - 3, py + 11, 3, 1, CROMO);
    } });
  // secador de capacete: cúpula lilás num pé cromado
  I.objeto('salao-secador', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 4, 3, 16, K); ret(ctx, cx, py - 3, 1, 14, CROMO);
      elipse(ctx, cx, py + 13, 6, 2, K); elipse(ctx, cx, py + 13, 5, 1, CROMO2);
      elipse(ctx, cx, py - 9, 7, 7, K); elipse(ctx, cx, py - 9, 6, 6, LILAS); elipse(ctx, cx - 1, py - 11, 3, 3, LILAS3);
      ret(ctx, cx - 7, py - 7, 15, 4, K); ret(ctx, cx - 6, py - 6, 13, 2, LILAS2);
      for (var i = -4; i <= 4; i += 2) ret(ctx, cx + i, py - 5, 1, 1, K);
      ret(ctx, cx + 4, py - 14, 2, 2, C.ouro);
    } });
  // carrinho de pentes: duas prateleiras com escova, pente, tesoura e frascos, rodinhas
  I.objeto('salao-carrinho', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 8, 12, 3, K); ret(ctx, px + 3, py - 7, 10, 1, MENTA);
      ret(ctx, px + 2, py + 3, 12, 3, K); ret(ctx, px + 3, py + 4, 10, 1, MENTA);
      ret(ctx, px + 2, py - 5, 2, 14, K); ret(ctx, px + 12, py - 5, 2, 14, K);
      frasco(ctx, px + 4, py - 8, 3, 5, ROSA, C.branco); ret(ctx, px + 8, py - 11, 5, 3, K); ret(ctx, px + 9, py - 10, 3, 1, C.madeira);
      S.pente(ctx, px + 4, py - 1, 8, LILAS);
      ret(ctx, px + 2, py + 9, 12, 2, K); circulo(ctx, px + 4, py + 12, 2, K); circulo(ctx, px + 12, py + 12, 2, K);
      ret(ctx, px + 4, py + 12, 1, 1, CROMO); ret(ctx, px + 12, py + 12, 1, 1, CROMO);
    } });
  // lavatório: cuba branca com torneira cromada e o apoio de pescoço
  I.objeto('salao-pia', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 2, 30, 16, K); ret(ctx, px + 2, py - 1, 28, 14, LILAS3); ret(ctx, px + 2, py + 9, 28, 4, LILAS);
      for (var x = px + 5; x < px + 29; x += 6) ret(ctx, x, py + 10, 2, 2, C.branco);
      elipse(ctx, px + 16, py - 3, 11, 5, K); elipse(ctx, px + 16, py - 3, 10, 4, C.branco); elipse(ctx, px + 16, py - 2, 7, 2, '#d6ecfa');
      ret(ctx, px + 20, py - 10, 2, 6, K); ret(ctx, px + 16, py - 10, 5, 2, K); ret(ctx, px + 16, py - 9, 5, 1, CROMO); ret(ctx, px + 16, py - 8, 2, 2, K);
      ret(ctx, px + 12, py - 6, 2, 2, K); ret(ctx, px + 12, py - 6, 1, 1, ROSA);
    } });
  // arara de roupas: barra cromada com cabides e vestidinhos coloridos (a Mariana toca e escolhe a roupa)
  var CORES_ROUPA = [ROSA, '#5fb4ff', C.ouro, LILAS2, '#6fdc8c', '#ff8a3d'];
  I.objeto('salao-arara', { w: 3, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 20, 44, 3, K); ret(ctx, px + 3, py - 19, 42, 1, CROMO);
      ret(ctx, px + 2, py - 18, 3, 30, K); ret(ctx, px + 43, py - 18, 3, 30, K); ret(ctx, px + 3, py - 17, 1, 28, CROMO); ret(ctx, px + 44, py - 17, 1, 28, CROMO);
      ret(ctx, px, py + 10, 9, 3, K); ret(ctx, px + 39, py + 10, 9, 3, K);
      CORES_ROUPA.forEach(function (cor, i) {
        var x = px + 7 + i * 6, e = D.escurecer(cor, 0.25);
        ret(ctx, x + 1, py - 19, 1, 3, K);
        ret(ctx, x - 1, py - 16, 5, 2, K);
        // vestidinho: ombro estreito, saia rodada
        ret(ctx, x - 1, py - 14, 5, 6, K); ret(ctx, x, py - 13, 3, 5, cor);
        ret(ctx, x - 2, py - 8, 7, 7, K); ret(ctx, x - 1, py - 8, 5, 6, cor); ret(ctx, x - 1, py - 3, 5, 1, e);
        if (i % 2) ret(ctx, x + 1, py - 11, 1, 1, C.branco);
      });
    } });
  // provador: cabine com cortina listrada, estrela no topo e o banquinho aparecendo
  I.objeto('salao-provador', { w: 2, h: 2, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py - 12, 30, 44, LILAS);
      ret(ctx, px + 1, py - 12, 30, 6, K); ret(ctx, px + 2, py - 11, 28, 4, LILAS2);
      ret(ctx, px + 4, py - 5, 24, 1, CROMO2);
      for (var x = px + 4; x < px + 28; x += 4) { ret(ctx, x, py - 4, 2, 34, ROSA); ret(ctx, x + 2, py - 4, 2, 34, ROSA3); }
      ret(ctx, px + 15, py - 4, 2, 34, K); ret(ctx, px + 4, py + 29, 24, 1, ROSA4);
      // estrela
      ret(ctx, px + 15, py - 16, 2, 6, K); ret(ctx, px + 12, py - 13, 8, 2, K); ret(ctx, px + 15, py - 15, 2, 4, C.ouro); ret(ctx, px + 13, py - 13, 6, 1, C.ouro);
    } });
})();
