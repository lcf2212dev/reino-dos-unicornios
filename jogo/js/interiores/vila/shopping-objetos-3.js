/* Vila Arco-Íris, Shopping Terrazo, objetos parte 3 de 3 (docs/contratos/vila.md §2; prefixo vila-shopping-): o Zoo
   Parque, brinquedo de safári para criança (a girafa, o elefante, o leão e a zebra de brinquedo, com selinha; a árvore
   da savana, o escorregador, as pedras e o mural da savana na parede) e o cantinho Pet Park (o cachorrinho, o pote de
   petiscos, a casinha, a cerquinha) e as plaquinhas de pé (var.tipo zoo ou pet).
   Usa V.shopping (S, de shopping-objetos.js). O coraçãozinho do cachorro só no `anim` (retângulos: o pintor). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, matriz = D.matriz;
  var clarear = D.clarear;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, S = V.shopping, C = S.cores;
  var AMARELO = '#ffd34d', MANCHA = '#c0782a', CINZA = '#a8a0c8', CINZA2 = '#8a82ac', JUBA = '#e0621e', LEAO = '#ffb23d';
  var CORACAO = ['.kk.kk.', 'kppkppk', 'kpppppk', '.kpppk.', '..kpk..', '...k...'];
  function sela(ctx, x, y, w) { caixa(ctx, x, y, w, 4, C.vermelho); ret(ctx, x + 1, y + 1, w - 2, 1, '#ff8a9a'); ret(ctx, x + (w >> 1), y + 4, 1, 3, C.amarelo); }

  /* ---------- os bichos de brinquedo ---------- */
  // girafa (2 × 1; interativa), de lado, olhando para a esquerda
  I.objeto('vila-shopping-girafa', { w: 2, h: 1, solido: true, alto: true, topo: 34,
    desenhar: function (ctx, px, py) {
      [11, 15, 22, 26].forEach(function (x) { ret(ctx, px + x - 1, py, 4, 15, K); ret(ctx, px + x, py, 2, 13, AMARELO); ret(ctx, px + x, py + 12, 2, 2, C.marrom2); });
      caixa(ctx, px + 9, py - 9, 21, 11, AMARELO); ret(ctx, px + 10, py - 8, 19, 1, '#ffe98a');
      ret(ctx, px + 29, py - 8, 3, 1, K); ret(ctx, px + 31, py - 8, 1, 6, K); ret(ctx, px + 30, py - 3, 3, 3, MANCHA);   // o rabo
      caixa(ctx, px + 9, py - 27, 7, 20, AMARELO); ret(ctx, px + 10, py - 26, 1, 18, '#ffe98a');
      ret(ctx, px + 15, py - 26, 2, 18, MANCHA); ret(ctx, px + 16, py - 26, 1, 18, K);   // a crina
      caixa(ctx, px + 3, py - 31, 13, 8, AMARELO); ret(ctx, px + 4, py - 30, 11, 1, '#ffe98a');
      ret(ctx, px + 4, py - 26, 4, 2, '#f0b860'); ret(ctx, px + 4, py - 26, 1, 1, K);    // o focinho
      ret(ctx, px + 9, py - 29, 2, 2, K); ret(ctx, px + 9, py - 29, 1, 1, C.branco); ret(ctx, px + 6, py - 24, 3, 1, K);
      [9, 13].forEach(function (x) { ret(ctx, px + x, py - 34, 1, 3, K); ret(ctx, px + x - 1, py - 35, 3, 2, K); ret(ctx, px + x, py - 35, 1, 1, MANCHA); });
      ret(ctx, px + 15, py - 31, 3, 2, K); ret(ctx, px + 15, py - 30, 2, 1, AMARELO);
      [[11, -22], [12, -15], [11, -10], [19, -6], [25, -4], [23, -8], [13, -4]].forEach(function (m) { ret(ctx, px + m[0], py + m[1], 3, 2, MANCHA); });
      sela(ctx, px + 17, py - 12, 9);
    } });
  // elefante (2 × 1; interativo), de lado, com a tromba enrolada e a manta colorida
  I.objeto('vila-shopping-elefante', { w: 2, h: 1, solido: true, alto: true, topo: 16,
    desenhar: function (ctx, px, py) {
      [10, 15, 21, 26].forEach(function (x) { ret(ctx, px + x - 1, py + 1, 5, 14, K); ret(ctx, px + x, py + 1, 3, 12, CINZA); ret(ctx, px + x, py + 12, 3, 1, '#e6e0f4'); });
      ret(ctx, px + 8, py - 10, 23, 14, K); ret(ctx, px + 10, py - 12, 19, 2, K);
      ret(ctx, px + 9, py - 9, 21, 12, CINZA); ret(ctx, px + 11, py - 11, 17, 2, CINZA); ret(ctx, px + 11, py - 11, 15, 1, clarear(CINZA, 0.35));
      ret(ctx, px + 30, py - 6, 2, 1, K); ret(ctx, px + 31, py - 6, 1, 4, K);   // o rabinho
      caixa(ctx, px + 15, py - 13, 13, 6, '#ff86bb'); ret(ctx, px + 16, py - 12, 11, 1, '#ffb3d0');   // a manta
      for (var i = 0; i < 3; i++) ret(ctx, px + 17 + i * 4, py - 8, 2, 2, i % 2 ? C.amarelo : C.azul);
      // a cabeça, a orelhona e a tromba levantada
      caixa(ctx, px + 2, py - 14, 13, 12, CINZA); ret(ctx, px + 3, py - 13, 11, 1, clarear(CINZA, 0.35));
      caixa(ctx, px + 9, py - 13, 8, 12, CINZA2); ret(ctx, px + 10, py - 12, 6, 10, '#d8b4d8');
      ret(ctx, px + 5, py - 10, 2, 2, K); ret(ctx, px + 5, py - 10, 1, 1, C.branco);
      ret(ctx, px, py - 6, 5, 5, K); ret(ctx, px + 1, py - 5, 3, 3, CINZA); ret(ctx, px - 1, py - 10, 3, 6, K); ret(ctx, px, py - 9, 1, 4, CINZA);
      ret(ctx, px + 6, py - 4, 3, 2, K); ret(ctx, px + 7, py - 4, 2, 1, C.branco);   // a presinha
    } });
  // leão (1 × 1; interativo), de frente, com a juba laranja
  I.objeto('vila-shopping-leao', { w: 1, h: 1, solido: true, alto: true, topo: 12,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 3, py + 2, 10, 12, LEAO); ret(ctx, px + 4, py + 11, 3, 2, '#ffd890'); ret(ctx, px + 9, py + 11, 3, 2, '#ffd890');
      ret(ctx, px + 7, py + 7, 1, 6, '#e0921e'); ret(ctx, px + 13, py + 8, 3, 1, K); ret(ctx, px + 15, py + 5, 1, 4, K); ret(ctx, px + 14, py + 4, 3, 2, JUBA);
      circulo(ctx, px + 8, py - 4, 8, K); circulo(ctx, px + 8, py - 4, 7, JUBA); circulo(ctx, px + 7, py - 5, 6, '#f07a2e');
      circulo(ctx, px + 8, py - 3, 5, K); circulo(ctx, px + 8, py - 3, 4, LEAO);
      ret(ctx, px + 3, py - 10, 2, 2, LEAO); ret(ctx, px + 11, py - 10, 2, 2, LEAO);
      ret(ctx, px + 6, py - 5, 1, 2, K); ret(ctx, px + 10, py - 5, 1, 2, K);
      ret(ctx, px + 7, py - 3, 3, 1, '#a0485a'); ret(ctx, px + 8, py - 2, 1, 1, K); ret(ctx, px + 7, py - 1, 1, 1, K); ret(ctx, px + 9, py - 1, 1, 1, K);
      ret(ctx, px + 5, py - 2, 1, 1, '#ff9a8a'); ret(ctx, px + 11, py - 2, 1, 1, '#ff9a8a');
    } });
  // zebra (2 × 1; interativa), de lado, olhando para a esquerda, com as listras e a crina preta
  I.objeto('vila-shopping-zebra', { w: 2, h: 1, solido: true, alto: true, topo: 24,
    desenhar: function (ctx, px, py) {
      var i, P = '#3a3a5a';
      [9, 13, 20, 24].forEach(function (x) {
        ret(ctx, px + x - 1, py, 4, 15, K); ret(ctx, px + x, py, 2, 13, C.branco);
        ret(ctx, px + x, py + 3, 2, 1, P); ret(ctx, px + x, py + 7, 2, 1, P); ret(ctx, px + x, py + 11, 2, 2, P);
      });
      ret(ctx, px + 27, py - 8, 3, 1, K); ret(ctx, px + 29, py - 8, 1, 6, K); ret(ctx, px + 28, py - 3, 3, 3, P);   // o rabo
      caixa(ctx, px + 6, py - 9, 22, 11, C.branco); ret(ctx, px + 7, py - 8, 20, 1, '#f4f4fa');
      for (i = 0; i < 5; i++) ret(ctx, px + 9 + i * 4, py - 8, 2, 9, P);
      caixa(ctx, px + 4, py - 18, 7, 13, C.branco);
      for (i = 0; i < 4; i++) ret(ctx, px + 5, py - 16 + i * 3, 5, 1, P);
      ret(ctx, px + 10, py - 22, 2, 14, K); for (i = 0; i < 6; i++) ret(ctx, px + 10, py - 21 + i * 2, 1, 1, C.branco);   // a crina
      caixa(ctx, px, py - 21, 10, 7, C.branco);
      ret(ctx, px + 1, py - 18, 3, 3, P); ret(ctx, px + 1, py - 17, 1, 1, K);   // o focinho escuro
      ret(ctx, px + 5, py - 19, 2, 2, K); ret(ctx, px + 5, py - 19, 1, 1, C.branco); ret(ctx, px + 8, py - 20, 1, 3, P);
      ret(ctx, px + 6, py - 24, 3, 4, K); ret(ctx, px + 7, py - 23, 1, 2, '#ff9cc6');   // a orelha
      sela(ctx, px + 15, py - 12, 8);
    } });
  // árvore da savana (2 × 1): tronco fino e a copa reta e larga
  I.objeto('vila-shopping-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 34,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 14, py - 22, 5, 36, '#8a5a3a'); ret(ctx, px + 15, py - 21, 1, 34, '#b07a50');
      for (var i = 0; i < 6; i++) { ret(ctx, px + 13 - i, py - 16 - i, 2, 2, K); ret(ctx, px + 19 + i, py - 16 - i, 2, 2, K); }
      elipse(ctx, px + 16, py - 27, 17, 6, K); elipse(ctx, px + 16, py - 27, 16, 5, '#5e9a3a');
      elipse(ctx, px + 13, py - 29, 10, 3, '#8fb83a'); ret(ctx, px + 6, py - 31, 6, 1, '#b6d24e'); ret(ctx, px + 20, py - 30, 5, 1, '#b6d24e');
      ret(ctx, px + 1, py - 23, 30, 1, '#3f7a2f');
      ret(ctx, px + 10, py + 11, 2, 3, '#5e9a3a'); ret(ctx, px + 21, py + 10, 2, 4, '#5e9a3a'); ret(ctx, px + 12, py + 12, 1, 2, '#8fb83a');
    } });
  // escorregador (2 × 2; interativo): escadinha à direita, o telhadinho e a rampa amarela descendo para a esquerda
  I.objeto('vila-shopping-escorregador', { w: 2, h: 2, solido: true, alto: true, topo: 24,
    desenhar: function (ctx, px, py) {
      var i;
      ret(ctx, px + 25, py - 13, 3, 44, K); ret(ctx, px + 31, py - 13, 3, 44, K);
      ret(ctx, px + 26, py - 12, 1, 42, C.azul); ret(ctx, px + 32, py - 12, 1, 42, C.azul);
      for (i = 0; i < 8; i++) { ret(ctx, px + 28, py - 8 + i * 5, 3, 2, K); ret(ctx, px + 28, py - 8 + i * 5, 3, 1, C.metalLuz); }
      ret(ctx, px + 9, py + 14, 3, 18, K); ret(ctx, px + 10, py + 14, 1, 17, C.azul);   // o pezinho da rampa
      for (i = 0; i < 23; i++) {
        var x = px + 23 - i, y = py - 13 + Math.floor(i * 1.65);
        ret(ctx, x, y - 2, 1, 1, K); ret(ctx, x, y - 1, 1, 2, C.vermelho);
        ret(ctx, x, y + 1, 1, 5, i % 6 === 2 ? '#fff3a0' : AMARELO); ret(ctx, x, y + 6, 1, 1, C.vermelho); ret(ctx, x, y + 7, 1, 1, K);
      }
      ret(ctx, px, py + 21, 1, 9, K);
      caixa(ctx, px + 19, py - 15, 15, 4, C.agua); ret(ctx, px + 20, py - 14, 13, 1, clarear(C.agua, 0.4));
      for (i = 0; i < 6; i++) { ret(ctx, px + 27 - i, py - 22 + i, 1 + i * 2, 1, K); if (i) ret(ctx, px + 28 - i, py - 22 + i, i * 2 - 1, 1, i % 2 ? AMARELO : MANCHA); }
      ret(ctx, px + 21, py - 16, 13, 1, K);
    } });
  // pedras (1 × 1)
  I.objeto('vila-shopping-pedras', { w: 1, h: 1, solido: true, topo: 2,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 6, py + 9, 6, 5, K); elipse(ctx, px + 6, py + 9, 5, 4, '#b8a898'); ret(ctx, px + 3, py + 6, 3, 1, '#ddd0c0');
      elipse(ctx, px + 12, py + 12, 4, 3, K); elipse(ctx, px + 12, py + 12, 3, 2, '#a89888'); ret(ctx, px + 11, py + 10, 2, 1, '#ddd0c0');
      ret(ctx, px + 1, py + 13, 2, 2, '#5e9a3a');
    } });

  /* ---------- o cantinho Pet Park ---------- */
  // cachorrinho sentado (1 × 1; interativo), de coleira vermelha; com Animações, um coraçãozinho pisca em cima
  I.objeto('vila-shopping-cachorro', { w: 1, h: 1, solido: true, alto: true, topo: 10,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 13, py + 6, 2, 1, K); ret(ctx, px + 14, py + 3, 1, 3, K); ret(ctx, px + 15, py + 2, 1, 2, K);   // o rabinho
      caixa(ctx, px + 3, py, 11, 14, C.bege); ret(ctx, px + 4, py + 6, 3, 7, '#f6dcb8');
      ret(ctx, px + 5, py + 10, 1, 4, K); ret(ctx, px + 10, py + 10, 1, 4, K);
      caixa(ctx, px + 2, py - 9, 12, 10, C.bege); ret(ctx, px + 3, py - 8, 10, 1, '#f6dcb8');
      caixa(ctx, px, py - 9, 4, 8, C.marrom); caixa(ctx, px + 12, py - 9, 4, 8, C.marrom);
      ret(ctx, px + 5, py - 6, 2, 2, K); ret(ctx, px + 10, py - 6, 2, 2, K); ret(ctx, px + 5, py - 6, 1, 1, C.branco); ret(ctx, px + 10, py - 6, 1, 1, C.branco);
      ret(ctx, px + 7, py - 4, 3, 2, K); ret(ctx, px + 8, py - 2, 1, 2, C.rosa);
      ret(ctx, px + 3, py + 1, 11, 2, C.vermelho); ret(ctx, px + 8, py + 3, 2, 2, C.amarelo);
    },
    anim: function (ctx, px, py, t) {
      if (t % 2400 < 1800) return;
      matriz(ctx, px + 9, py - 16, CORACAO, { k: K, p: C.rosa });
    } });
  // pote de petiscos (1 × 1): a tigela vermelha com ossinhos e o vidro de biscoitos
  I.objeto('vila-shopping-petiscos', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 8, py - 3, 7, 11, C.vidro); ret(ctx, px + 8, py - 4, 7, 2, K); ret(ctx, px + 9, py - 4, 5, 1, C.vermelho);
      ret(ctx, px + 10, py + 1, 2, 2, C.marrom); ret(ctx, px + 12, py + 4, 2, 2, C.marrom); ret(ctx, px + 9, py + 5, 2, 1, C.marrom);
      ret(ctx, px + 1, py + 8, 12, 7, K); ret(ctx, px + 2, py + 9, 10, 5, C.vermelho); ret(ctx, px + 2, py + 9, 10, 1, '#ff8a9a');
      [[3, 6], [7, 5]].forEach(function (o) {   // os ossinhos
        ret(ctx, px + o[0], py + o[1] + 1, 4, 1, C.creme); ret(ctx, px + o[0] - 1, py + o[1], 1, 3, C.creme); ret(ctx, px + o[0] + 4, py + o[1], 1, 3, C.creme);
      });
    } });
  // casinha de cachorro (1 × 1): paredes de madeira, telhado vermelho em degraus e a porta redonda
  I.objeto('vila-shopping-casinha', { w: 1, h: 1, solido: true, alto: true, topo: 12,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py - 2, 14, 16, '#e8a050'); ret(ctx, px + 2, py - 1, 1, 14, '#ffc080');
      for (var j = 0; j < 7; j++) { ret(ctx, px + 7 - j, py - 12 + j * 2, 2 + j * 2, 2, K); if (j) ret(ctx, px + 8 - j, py - 12 + j * 2, j * 2, 2, j % 2 ? C.vermelho : '#ff6f7d'); }
      ret(ctx, px, py + 1, 16, 1, K);
      ret(ctx, px + 5, py + 5, 6, 9, K); ret(ctx, px + 6, py + 4, 4, 1, K); ret(ctx, px + 6, py + 5, 4, 9, '#3a2446');
      ret(ctx, px + 2, py + 3, 3, 2, C.creme); ret(ctx, px + 3, py + 4, 1, 1, C.marrom);
    } });
  // cerquinha branca (1 × 1)
  I.objeto('vila-shopping-cerca', { w: 1, h: 1, solido: true, topo: 2,
    desenhar: function (ctx, px, py) {
      ret(ctx, px, py + 5, 16, 3, K); ret(ctx, px, py + 10, 16, 3, K); ret(ctx, px, py + 6, 16, 1, C.branco); ret(ctx, px, py + 11, 16, 1, C.branco);
      [1, 7, 13].forEach(function (x) { ret(ctx, px + x, py + 1, 3, 14, K); ret(ctx, px + x + 1, py + 2, 1, 12, C.branco); ret(ctx, px + x + 1, py, 1, 1, K); });
    } });
  // plaquinha de pé (1 × 1): 'zoo' (amarela, de manchas) ou 'pet' (verde-água, com a patinha)
  var PATA = ['.k.k.', 'k.k.k', '.....', '.kkk.', '.kkk.'];
  I.objeto('vila-shopping-placa', { w: 1, h: 1, solido: true, alto: true, topo: 16,
    desenhar: function (ctx, px, py, o) {
      var pet = o.var && o.var.tipo === 'pet', fundo = pet ? C.agua : AMARELO;
      ret(ctx, px + 7, py - 3, 3, 17, K); ret(ctx, px + 8, py - 3, 1, 16, C.marrom);
      caixa(ctx, px, py - 16, 17, 14, fundo); ret(ctx, px + 1, py - 15, 15, 1, clarear(fundo, 0.45));
      S.letras(ctx, px + 3, py - 13, pet ? 'PET' : 'ZOO', pet ? C.branco : K);
      if (pet) matriz(ctx, px + 6, py - 7, PATA, { k: C.branco });
      else { ret(ctx, px + 3, py - 6, 2, 2, MANCHA); ret(ctx, px + 8, py - 7, 2, 2, MANCHA); ret(ctx, px + 12, py - 6, 2, 2, MANCHA); }
    } });
  // mural da savana (parede, 3 × 2): céu em faixas, sol, morros, a árvore e a girafa de longe
  I.objeto('vila-shopping-mural', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 3, 46, 25, '#ffe9b8'); ret(ctx, px + 2, py + 4, 44, 6, '#ffd890');
      circulo(ctx, px + 37, py + 11, 4, '#ff9f45'); circulo(ctx, px + 37, py + 11, 3, AMARELO);
      ret(ctx, px + 2, py + 20, 44, 7, '#8fb83a'); ret(ctx, px + 2, py + 18, 20, 2, '#b6d24e'); ret(ctx, px + 26, py + 19, 20, 1, '#b6d24e');
      ret(ctx, px + 9, py + 13, 1, 6, '#5a3a2a'); ret(ctx, px + 4, py + 11, 12, 2, '#3f7a2f'); ret(ctx, px + 6, py + 10, 8, 1, '#3f7a2f');
      ret(ctx, px + 26, py + 9, 2, 10, MANCHA); ret(ctx, px + 24, py + 8, 4, 2, MANCHA); ret(ctx, px + 27, py + 15, 7, 3, MANCHA);
      ret(ctx, px + 27, py + 18, 1, 2, MANCHA); ret(ctx, px + 32, py + 18, 1, 2, MANCHA);
      ret(ctx, px + 1, py + 27, 46, 2, K); ret(ctx, px + 2, py + 27, 44, 1, '#c08a5a');
    } });
})();
