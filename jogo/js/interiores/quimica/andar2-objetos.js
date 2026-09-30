/* Laboratório de Química, 2º andar, parte 1 de 2 dos objetos próprios ('quimica-<nome>'; a biblioteca comum em
   js/motor/interiores-objetos-*.js já tem janela, estante, sofá…): a Cozinha Química (fogão, geladeira, mesa de
   separar, potes, pia, fruteira, avental, panelas) e o cartaz "2º andar" do térreo. Usa as cores e os ajudantes de
   vidraria de Reino._predios.quimica (quimica/objetos.js). Nada de canvas no carregamento. Contrato: docs/contratos/quimica.md §9. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, elipse = D.elipse, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios['quimica'];
  var v = S.v, LIQ = S.LIQ;
  var ESMALTE = '#fdfbff', ESMALTE2 = '#dcd6ec', FOGO = '#5fb4ff', FOGO2 = '#ffd34d';

  // pezinhos de móvel de cozinha na base (py+13..15)
  function pes(ctx, px, py, w) { ret(ctx, px + 2, py + 13, 3, 2, K); ret(ctx, px + w - 5, py + 13, 3, 2, K); }
  // pote de vidro com tampa colorida e o mantimento dentro (base em by)
  function pote(ctx, x, by, w, h, tampa, dentro) {
    ret(ctx, x, by - h, w, h, K); ret(ctx, x + 1, by - h + 3, w - 2, h - 4, S.VIDRO);
    ret(ctx, x + 1, by - (h >> 1) - 1, w - 2, (h >> 1), dentro); ret(ctx, x + 1, by - h + 3, 1, h - 5, C.branco);
    ret(ctx, x - 1, by - h - 1, w + 2, 4, K); ret(ctx, x, by - h, w, 2, tampa);
  }
  // pontinhos de grão (arroz, feijão, açúcar) em cima de um preenchimento
  function graos(ctx, x, y, w, h, cor) {
    for (var j = 0; j < h; j += 2) for (var i = (j >> 1) % 2; i < w; i += 2) ret(ctx, x + i, y + j, 1, 1, cor);
  }

  /* ================= COZINHA QUÍMICA ================= */
  // o Fogão dos Estados (abre a tela): forno com janelinha, 4 bocas, a panela com tampa e a chaleira
  I.objeto('quimica-fogao', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 5, 30, 19, K); ret(ctx, px + 2, py - 4, 28, 17, ESMALTE); ret(ctx, px + 2, py + 11, 28, 2, ESMALTE2);
      pes(ctx, px, py, 32);
      // painel dos botões e o forno
      ret(ctx, px + 2, py - 4, 28, 3, ESMALTE2);
      [5, 11, 20, 26].forEach(function (x, i) { ret(ctx, px + x, py - 4, 3, 3, K); ret(ctx, px + x + 1, py - 3, 1, 1, i === 1 ? LIQ.vermelho : C.metal2); });
      ret(ctx, px + 5, py, 22, 10, K); ret(ctx, px + 6, py + 1, 20, 8, '#3a2f4a'); ret(ctx, px + 7, py + 2, 18, 6, '#ffb35c');
      ret(ctx, px + 8, py + 6, 16, 1, '#ff8a3d'); ret(ctx, px + 7, py + 2, 3, 1, C.ouro3);
      ret(ctx, px + 9, py - 1, 14, 1, C.metal2);
      // tampo: grelha e as chamas azuis
      ret(ctx, px, py - 7, 32, 3, K); ret(ctx, px + 1, py - 6, 30, 1, C.metal);
      // panela vermelha com tampa (bocas da esquerda) e o vapor
      ret(ctx, px + 2, py - 16, 15, 10, K); ret(ctx, px + 3, py - 15, 13, 8, LIQ.vermelho); ret(ctx, px + 3, py - 15, 13, 2, D.clarear(LIQ.vermelho, 0.35));
      ret(ctx, px, py - 13, 3, 2, K); ret(ctx, px + 16, py - 13, 3, 2, K);
      ret(ctx, px + 2, py - 18, 15, 3, K); ret(ctx, px + 3, py - 17, 13, 1, C.metal);
      ret(ctx, px + 7, py - 20, 5, 3, K); ret(ctx, px + 8, py - 19, 3, 1, C.metal2);
      // chaleira amarela na boca da direita
      ret(ctx, px + 20, py - 14, 10, 8, K); ret(ctx, px + 21, py - 13, 8, 6, LIQ.amarelo); ret(ctx, px + 21, py - 13, 2, 6, D.clarear(LIQ.amarelo, 0.4));
      ret(ctx, px + 29, py - 13, 3, 2, K); ret(ctx, px + 22, py - 16, 6, 2, K); ret(ctx, px + 23, py - 16, 4, 1, C.metal);
      // chaminhas saindo por baixo das duas
      [4, 9, 14, 22, 27].forEach(function (x) { ret(ctx, px + x, py - 7, 2, 1, FOGO); ret(ctx, px + x, py - 8, 1, 1, FOGO2); });
    },
    anim: function (ctx, px, py, t) {
      // fiozinho de vapor sobe da panela e da chaleira
      var f = (S.tempo(t) / 900) % 1, s = Math.floor(f * 5);
      if (f < 0.8) { ret(ctx, px + 9 + (s % 2), py - 22 - s, 2, 1, C.branco); ret(ctx, px + 30, py - 16 - ((s + 2) % 5), 1, 1, C.branco); }
    } });

  // geladeira com congelador em cima, ímãs e um desenho colado
  I.objeto('quimica-geladeira', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px, py - 24, 16, 39, K); ret(ctx, px + 1, py - 23, 14, 37, '#eaf6ff'); ret(ctx, px + 1, py - 23, 2, 37, C.branco);
      ret(ctx, px + 1, py - 10, 14, 1, K); ret(ctx, px + 1, py + 12, 14, 2, C.metal);
      // puxadores
      ret(ctx, px + 12, py - 20, 2, 7, K); ret(ctx, px + 12, py - 7, 2, 10, K);
      // floco no congelador, ímãs e o desenho colorido na porta
      ret(ctx, px + 6, py - 20, 1, 7, C.azul2); ret(ctx, px + 3, py - 17, 7, 1, C.azul2); ret(ctx, px + 4, py - 19, 1, 1, C.azul2); ret(ctx, px + 8, py - 15, 1, 1, C.azul2);
      ret(ctx, px + 3, py - 7, 7, 8, K); ret(ctx, px + 4, py - 6, 5, 6, C.creme); ret(ctx, px + 5, py - 4, 3, 2, S.COR2); ret(ctx, px + 4, py - 1, 5, 1, C.verde);
      ret(ctx, px + 6, py - 8, 1, 2, LIQ.vermelho);
      ret(ctx, px + 3, py + 3, 2, 2, LIQ.amarelo); ret(ctx, px + 7, py + 5, 2, 2, S.COR);
    } });

  // a Mesa de Separar Misturas (abre a tela): coador com funil, peneira, ímã, pote de areia com pregos e copos
  I.objeto('quimica-mesa-separar', { w: 3, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      S.tampo(ctx, px, py, py - 3, 3);
      ret(ctx, px + 3, py + 9, 42, 2, K); ret(ctx, px + 4, py + 9, 40, 1, C.madeiraClara);
      var by = py - 3;
      // suporte com funil e papel de filtro pingando no béquer
      ret(ctx, px + 3, by - 14, 2, 14, K); ret(ctx, px + 3, by - 12, 10, 2, K);
      matriz(ctx, px + 5, by - 14, ['kkkkkkkkk', 'kwwwwwwwk', '.kwwwwwk.', '..kwwwk..', '...kpk...', '....k....'], { k: K, w: C.branco, p: LIQ.laranja });
      S.bequer(ctx, px + 7, by, 7, 6, S.VIDRO2); ret(ctx, px + 9, by - 7, 1, 1, S.VIDRO2);
      // peneira redonda com grãozinhos
      elipse(ctx, px + 20, by - 3, 6, 3, K); elipse(ctx, px + 20, by - 3, 5, 2, C.metal);
      for (var i = -3; i <= 3; i += 2) ret(ctx, px + 20 + i, by - 4, 1, 1, C.metal2);
      ret(ctx, px + 18, by - 7, 2, 2, C.madeiraClara); ret(ctx, px + 21, by - 6, 2, 2, '#8a5a3a');
      ret(ctx, px + 26, by - 4, 6, 2, K); ret(ctx, px + 27, by - 4, 4, 1, C.madeira);
      // ímã em U vermelho com as pontas prateadas e pregos pulando para ele
      matriz(ctx, px + 31, by - 11, ['kkk.kkk', 'kmk.kmk', 'krk.krk', 'krkkkrk', 'krrrrrk', '.kkkkk.'], { k: K, m: C.metal, r: LIQ.vermelho });
      ret(ctx, px + 32, by - 14, 1, 2, C.metal2); ret(ctx, px + 36, by - 13, 1, 2, C.metal2);
      // pote de areia com pregos e copinho de água com sal
      S.frasco(ctx, px + 39, by, 6, 8, '#e8c98a'); ret(ctx, px + 40, by - 3, 1, 1, C.metal2); ret(ctx, px + 43, by - 2, 1, 1, C.metal2);
    } });

  // armário alto de mantimentos: potes de arroz, feijão, açúcar, sal, macarrão e café
  I.objeto('quimica-potes', { w: 2, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 22, 30, 37, K); ret(ctx, px + 2, py - 21, 28, 35, '#ffd9b8'); ret(ctx, px + 3, py - 20, 26, 23, '#fff4e8');
      [py - 10, py + 2].forEach(function (y) { ret(ctx, px + 2, y, 28, 2, K); ret(ctx, px + 3, y, 26, 1, C.madeiraClara); });
      // portinhas embaixo
      ret(ctx, px + 3, py + 4, 12, 9, K); ret(ctx, px + 4, py + 5, 10, 7, '#ffb88a'); ret(ctx, px + 12, py + 8, 1, 2, K);
      ret(ctx, px + 17, py + 4, 12, 9, K); ret(ctx, px + 18, py + 5, 10, 7, '#ffb88a'); ret(ctx, px + 19, py + 8, 1, 2, K);
      var by = py - 10;
      pote(ctx, px + 4, by, 7, 8, S.COR2, C.creme); graos(ctx, px + 5, by - 4, 5, 3, C.creme2);
      pote(ctx, px + 13, by, 7, 8, LIQ.laranja, '#6b3a2a'); graos(ctx, px + 14, by - 4, 5, 3, '#3a1f18');
      pote(ctx, px + 22, by, 6, 8, C.azul, C.branco);
      by = py + 2;
      pote(ctx, px + 4, by, 6, 7, C.verde, C.branco); graos(ctx, px + 5, by - 3, 4, 2, S.VIDRO2);
      pote(ctx, px + 12, by, 8, 7, LIQ.amarelo, '#ffe08a');
      pote(ctx, px + 22, by, 6, 7, S.COR, '#5a3825');
    } });

  // pia da cozinha: armário, torneira, pratos no escorredor e a esponja
  I.objeto('quimica-pia-cozinha', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 1, 30, 16, K); ret(ctx, px + 2, py, 28, 13, '#ffb88a');
      ret(ctx, px + 3, py + 3, 12, 9, K); ret(ctx, px + 4, py + 4, 10, 7, '#ffd9b8'); ret(ctx, px + 17, py + 3, 12, 9, K); ret(ctx, px + 18, py + 4, 10, 7, '#ffd9b8');
      ret(ctx, px + 12, py + 6, 1, 2, K); ret(ctx, px + 19, py + 6, 1, 2, K);
      ret(ctx, px, py - 3, 32, 4, K); ret(ctx, px + 1, py - 2, 30, 2, C.metal); ret(ctx, px + 4, py - 2, 14, 1, C.metal2);
      // torneira e o pingo
      ret(ctx, px + 9, py - 11, 2, 9, K); ret(ctx, px + 9, py - 12, 6, 2, K); ret(ctx, px + 13, py - 11, 2, 3, K);
      ret(ctx, px + 10, py - 11, 1, 7, C.metal); ret(ctx, px + 14, py - 7, 1, 1, C.azul2);
      // escorredor com pratos em pé e um copo
      ret(ctx, px + 20, py - 4, 10, 2, K);
      [21, 24, 27].forEach(function (x, i) { ret(ctx, px + x, py - 12, 3, 9, K); ret(ctx, px + x + 1, py - 11, 1, 7, [C.branco, C.azul2, S.COR2][i]); });
      // esponja amarela e verde
      ret(ctx, px + 3, py - 6, 5, 4, K); ret(ctx, px + 4, py - 5, 3, 1, C.verde); ret(ctx, px + 4, py - 4, 3, 1, LIQ.amarelo);
    } });

  // fruteira em cima de um banquinho: maçã, banana, uva, laranja
  I.objeto('quimica-fruteira', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 4, 2, 11, K); ret(ctx, cx + 4, py + 4, 2, 11, K); ret(ctx, cx - 6, py + 2, 13, 3, K); ret(ctx, cx - 5, py + 3, 11, 1, C.madeira);
      // as frutas por cima da cesta
      ret(ctx, cx - 6, py - 4, 5, 5, K); ret(ctx, cx - 5, py - 3, 3, 3, LIQ.vermelho); ret(ctx, cx - 5, py - 3, 1, 1, C.branco); ret(ctx, cx - 4, py - 5, 1, 1, C.folha3);
      ret(ctx, cx - 1, py - 5, 5, 5, K); ret(ctx, cx, py - 4, 3, 3, LIQ.laranja); ret(ctx, cx, py - 4, 1, 1, C.branco);
      matriz(ctx, cx + 3, py - 7, ['.kk.', 'kyyk', 'kyyk', '.kyk', '..kk'], { k: K, y: LIQ.amarelo });
      ret(ctx, cx - 3, py - 8, 3, 3, K); ret(ctx, cx - 2, py - 7, 1, 1, LIQ.roxo); ret(ctx, cx - 1, py - 9, 2, 2, K);
      // cesta de palha
      ret(ctx, cx - 7, py - 1, 15, 4, K); ret(ctx, cx - 6, py, 13, 2, C.madeiraClara);
      for (var i = -5; i <= 5; i += 3) ret(ctx, cx + i, py, 1, 2, C.madeira2);
    } });

  // mesa de cozinha com toalha xadrez, jarra de suco e bolo (2×1)
  I.objeto('quimica-mesa-cozinha', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 3, 2, 12, K); ret(ctx, px + 27, py + 3, 2, 12, K);
      ret(ctx, px + 1, py - 1, 30, 7, K);
      for (var i = 0; i < 14; i++) for (var j = 0; j < 2; j++) ret(ctx, px + 2 + i * 2, py + j * 2, 2, 2, (i + j) % 2 ? C.branco : S.COR2);
      ret(ctx, px + 2, py + 4, 28, 1, D.escurecer(S.COR2, 0.2));
      // jarra de suco de laranja, dois copos e o bolo de cenoura
      ret(ctx, px + 4, py - 9, 7, 9, K); ret(ctx, px + 5, py - 8, 5, 7, S.VIDRO); ret(ctx, px + 5, py - 5, 5, 4, LIQ.laranja); ret(ctx, px + 10, py - 7, 2, 4, K);
      ret(ctx, px + 13, py - 5, 4, 5, K); ret(ctx, px + 14, py - 4, 2, 3, LIQ.laranja);
      ret(ctx, px + 19, py - 6, 10, 6, K); ret(ctx, px + 20, py - 5, 8, 4, '#ff9d3d'); ret(ctx, px + 20, py - 5, 8, 2, '#6b3a2a');
      ret(ctx, px + 22, py - 7, 1, 1, LIQ.vermelho); ret(ctx, px + 26, py - 7, 1, 1, LIQ.vermelho);
    } });

  /* ================= PAREDE ================= */
  // avental pendurado no gancho (1×2)
  I.objeto('quimica-avental', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 6, py + 3, 4, 2, K); ret(ctx, px + 7, py + 3, 2, 1, C.metal);
      matriz(ctx, px + 2, py + 5, ['..k..k..', '..k..k..', '.kkkkkk.', '.krwwrk.', '.kwwwwk.', 'kkkkkkkk', 'kwrwwrwk',
        'kwwwwwwk', 'kwkkkkwk', 'kwkrrkwk', 'kwkkkkwk', 'kwwwwwwk', 'kwrwwrwk', 'kwwwwwwk', 'kwwwwwwk', '.kkkkkk.'], { k: K, w: C.creme, r: S.COR2 });
    } });

  // painel com panelinhas, concha e colher de pau pendurados (2×2)
  I.objeto('quimica-panelas-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 5, 28, 2, K); ret(ctx, px + 3, py + 5, 26, 1, C.metal);
      // concha, colher de pau, frigideira e panelinha azul
      ret(ctx, px + 5, py + 7, 2, 12, K); elipse(ctx, px + 6, py + 20, 3, 2, K); elipse(ctx, px + 6, py + 20, 2, 1, C.metal);
      ret(ctx, px + 11, py + 7, 2, 13, K); ret(ctx, px + 11, py + 7, 1, 12, C.madeira); ret(ctx, px + 10, py + 19, 4, 5, K); ret(ctx, px + 11, py + 20, 2, 3, C.madeiraClara);
      ret(ctx, px + 18, py + 7, 2, 6, K); elipse(ctx, px + 19, py + 17, 5, 5, K); elipse(ctx, px + 19, py + 17, 4, 4, '#3a2f4a'); ret(ctx, px + 17, py + 15, 2, 1, C.metal2);
      ret(ctx, px + 25, py + 7, 1, 5, K); ret(ctx, px + 23, py + 12, 7, 8, K); ret(ctx, px + 24, py + 13, 5, 6, C.azul); ret(ctx, px + 24, py + 13, 1, 6, C.azul2);
    } });

  // cartaz "2º andar" com a seta para cima (térreo, ao lado do arco da escada): 1×2
  I.objeto('quimica-cartaz-andar', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 3, 14, 23, K, LIQ.amarelo);
      ret(ctx, px + 2, py + 4, 12, 1, D.clarear(LIQ.amarelo, 0.5));
      // a seta roxa apontando para cima
      matriz(ctx, px + 3, py + 5, ['....k....', '...kpk...', '..kpppk..', '.kpppppk.', 'kkkpppkkk', '...kpk...', '...kpk...', '...kkk...'], { k: K, p: S.COR });
      // "2º" em pixel
      matriz(ctx, px + 4, py + 15, ['kkk.kkk', '..k.k.k', 'kkk.kkk', 'k......', 'kkk.kkk'], { k: K });
      ret(ctx, px + 2, py + 21, 12, 4, S.COR2); ret(ctx, px + 4, py + 22, 8, 1, C.branco);
    } });

  S.pote = pote; S.pes = pes;
})();
