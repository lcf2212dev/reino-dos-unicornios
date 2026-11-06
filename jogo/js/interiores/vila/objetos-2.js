/* Vila Arco-Íris, os objetos de dentro das 4 lojas (prefixo vila-; docs/contratos/vila.md): o balcão com a caixa
   registradora, o capacho da porta, o letreiro de parede com o emblema da loja e a mercadoria desenhada de cada uma
   (vasos e almofadas e quadros na Casa Bonita; espadas na parede, bigorna e forja na Forja Brilhante; chapéus em
   cabides e elmos em bustos em Elmos e Chapéus; armaduras em manequins e botas em prateleiras em Armaduras e Botas).
   Usa os desenhos da mercadoria de Reino._predios.vila (objetos.js). O fogo da forja só no `anim`. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, ARCO = V.ARCO, MADEIRA = V.MADEIRA;
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(58,36,70,0.25)'); }

  /* ---------- comuns ---------- */
  // balcão (4 × 1) de madeira, tampo na cor da loja (var.cor) e a caixa registradora na ponta
  I.objeto('vila-balcao', { w: 4, h: 1, solido: true, alto: true, topo: 14,
    desenhar: function (ctx, px, py, o) {
      var cor = (o.var && o.var.cor) || '#ff86bb';
      sombra(ctx, px + 32, py + 15, 30);
      caixa(ctx, px, py, 64, 16, MADEIRA[1]); ret(ctx, px + 1, py + 6, 62, 1, MADEIRA[0]);
      for (var i = 0; i < 4; i++) { caixa(ctx, px + 4 + i * 15, py + 8, 12, 6, MADEIRA[2]); }
      caixa(ctx, px - 1, py - 3, 66, 5, cor); ret(ctx, px, py - 2, 64, 1, '#ffffff');
      caixa(ctx, px + 46, py - 13, 14, 11, '#ffe066'); ret(ctx, px + 48, py - 11, 10, 3, '#3a6a5a'); ret(ctx, px + 49, py - 10, 4, 1, '#8af0a0');
      for (i = 0; i < 3; i++) ret(ctx, px + 48 + i * 4, py - 6, 2, 2, K);
      // um sininho e um potinho de balas
      caixa(ctx, px + 8, py - 9, 8, 6, '#ffd23f'); ret(ctx, px + 11, py - 11, 2, 2, K);
      caixa(ctx, px + 22, py - 11, 9, 8, '#dff4ff'); ret(ctx, px + 24, py - 7, 2, 2, '#ff5c6a'); ret(ctx, px + 27, py - 8, 2, 2, '#6fdc8c'); ret(ctx, px + 25, py - 5, 2, 2, '#5fb4ff');
    } });
  // capacho da porta de saída (fica sob a seta de descer)
  I.objeto('vila-capacho', { w: 1, h: 1, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px, py + 2, 16, 13, '#c86a4a');
      for (var i = 0; i < 6; i++) ret(ctx, px + 2 + i * 2, py + 4, 1, 9, i % 2 ? '#e08a5a' : '#a8543a');
      ret(ctx, px - 2, py, 20, 2, K);
    } });
  // letreiro de parede (2 × 2) com o emblema da loja (var.loja)
  var EMBLEMA = {
    casa: function (ctx, x, y) { V.vaso(ctx, x + 4, y + 2, '#5fb4ff'); V.almofada(ctx, x + 15, y + 7, '#ff86bb'); },
    armas: function (ctx, x, y) { V.bigorna(ctx, x + 7, y + 6); V.espada(ctx, x + 3, y, 14); V.espada(ctx, x + 27, y, 14, '#bfe6ff'); },
    cabecas: function (ctx, x, y) { V.chapeu(ctx, x + 16, y + 3, 24, '#8a4fd0', '#ffe066'); },
    armaduras: function (ctx, x, y) { V.escudo(ctx, x + 2, y - 1, '#5fb4ff'); V.bota(ctx, x + 18, y + 2, '#9a6c46'); },
  };
  I.objeto('vila-letreiro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      ret(ctx, px + 8, py + 2, 1, 4, K); ret(ctx, px + 23, py + 2, 1, 4, K);
      caixa(ctx, px, py + 5, 32, 22, '#fff4d8'); ret(ctx, px + 1, py + 6, 30, 2, '#ffffff');
      ARCO.forEach(function (c, i) { ret(ctx, px + 2 + i * 5, py + 24, 5, 2, c); });
      (EMBLEMA[(o.var && o.var.loja) || 'casa'])(ctx, px, py + 8);
    } });

  /* ---------- Casa Bonita ---------- */
  // prateleira (2 × 1) cheia de vasos coloridos
  I.objeto('vila-prateleira-vasos', { w: 2, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 15, 14);
      caixa(ctx, px + 1, py - 28, 30, 43, MADEIRA[1]); ret(ctx, px + 2, py - 27, 28, 41, MADEIRA[0]);
      [-14, 0].forEach(function (y, k) { caixa(ctx, px + 1, py + y, 30, 3, MADEIRA[2]); });
      V.vaso(ctx, px + 4, py - 27, '#ff86bb'); V.vaso(ctx, px + 14, py - 27, '#ffe066'); V.vaso(ctx, px + 23, py - 27, '#6fdc8c');
      V.vaso(ctx, px + 5, py - 13, '#a66bff'); caixa(ctx, px + 15, py - 8, 12, 7, '#5fb4ff'); ret(ctx, px + 17, py - 7, 3, 2, '#ffffff');
      caixa(ctx, px + 4, py + 4, 24, 8, MADEIRA[2]);
    } });
  // mural de quadrinhos (parede, 2 × 2)
  I.objeto('vila-quadros', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 4, 13, 11, '#ffd23f'); ret(ctx, px + 3, py + 6, 9, 7, '#bfe6ff'); ret(ctx, px + 4, py + 10, 7, 3, '#6fdc8c'); circulo(ctx, px + 9, py + 8, 1, '#ff9f45');
      caixa(ctx, px + 17, py + 2, 14, 14, '#ff86bb'); ret(ctx, px + 19, py + 4, 10, 10, '#fff4fa'); ret(ctx, px + 22, py + 7, 4, 4, '#ff5c8a');
      caixa(ctx, px + 4, py + 18, 11, 10, '#a66bff'); ret(ctx, px + 6, py + 20, 7, 6, '#ffe0f2'); ret(ctx, px + 8, py + 22, 3, 2, '#5fb4ff');
      caixa(ctx, px + 19, py + 19, 10, 9, '#6fdc8c'); ret(ctx, px + 21, py + 21, 6, 5, '#fff4d8'); ret(ctx, px + 23, py + 22, 2, 2, '#ff5c6a');
    } });
  // pilha de almofadas fofas
  I.objeto('vila-almofadas', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      V.almofada(ctx, px + 3, py + 7, '#ff86bb'); V.almofada(ctx, px + 2, py + 2, '#ffe066'); V.almofada(ctx, px + 4, py - 3, '#a66bff');
    } });
  // cesto com tapetes enrolados
  I.objeto('vila-tapetes-rolo', { w: 1, h: 1, solido: true, alto: true, topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      ['#ff5c6a', '#5fb4ff', '#6fdc8c'].forEach(function (c, i) { caixa(ctx, px + 2 + i * 4, py - 9 + i, 5, 18, c); ret(ctx, px + 3 + i * 4, py - 8 + i, 3, 2, '#ffffff'); });
      caixa(ctx, px + 1, py + 6, 14, 9, '#e0b070'); ret(ctx, px + 2, py + 9, 12, 1, '#b08040'); ret(ctx, px + 2, py + 12, 12, 1, '#b08040');
    } });

  /* ---------- Forja Brilhante ---------- */
  // espadas penduradas (parede, 2 × 2)
  I.objeto('vila-espadas-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 2, 30, 26, MADEIRA[1]); ret(ctx, px + 2, py + 3, 28, 24, MADEIRA[0]);
      V.espada(ctx, px + 6, py + 4, 20); V.espada(ctx, px + 13, py + 5, 19, '#ffe066'); V.espada(ctx, px + 20, py + 4, 20, '#bfe6ff'); V.espada(ctx, px + 27, py + 6, 18, '#ffc8e6');
    } });
  // escudo redondo pendurado (parede, 1 × 2), na cor de var.cor
  I.objeto('vila-escudo-parede', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) { V.escudo(ctx, px + 1, py + 8, (o.var && o.var.cor) || '#ff5c6a'); } });
  I.objeto('vila-bigorna', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      caixa(ctx, px + 4, py + 8, 9, 7, MADEIRA[1]);
      V.bigorna(ctx, px + 0, py - 2);
      ret(ctx, px + 9, py - 6, 2, 4, K); ret(ctx, px + 6, py - 8, 8, 3, K); ret(ctx, px + 7, py - 7, 6, 1, '#8a8a9c');   // martelinho
    } });
  // a forja de pedra (2 × 1) com o fogo
  var FOGO = ['#ff5c3a', '#ff9f45', '#ffe066'];
  I.objeto('vila-forja', { w: 2, h: 1, solido: true, alto: true, topo: 28,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 15, 15);
      caixa(ctx, px + 1, py - 10, 30, 25, '#9a9aac'); ret(ctx, px + 2, py - 2, 28, 1, '#7a7a8c'); ret(ctx, px + 2, py + 6, 28, 1, '#7a7a8c');
      caixa(ctx, px + 9, py - 26, 14, 17, '#8a8a9c');
      caixa(ctx, px + 7, py - 4, 18, 12, '#3a2446'); ret(ctx, px + 9, py + 2, 14, 5, '#ff5c3a'); ret(ctx, px + 11, py + 1, 10, 2, '#ff9f45');
    },
    anim: function (ctx, px, py, t) {
      for (var i = 0; i < 4; i++) { var h = 2 + Math.round((Math.sin(t / 120 + i * 1.7) + 1) * 2); ret(ctx, px + 10 + i * 3, py + 3 - h, 2, h, FOGO[(i + Math.floor(t / 200)) % 3]); }
    } });
  // suporte com espadas em pé
  I.objeto('vila-suporte-espadas', { w: 1, h: 1, solido: true, alto: true, topo: 14,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      V.espada(ctx, px + 4, py - 12, 22); V.espada(ctx, px + 8, py - 14, 24, '#ffe066'); V.espada(ctx, px + 12, py - 12, 22, '#bfe6ff');
      caixa(ctx, px + 1, py + 7, 14, 8, MADEIRA[1]); ret(ctx, px + 2, py + 8, 12, 1, MADEIRA[2]);
    } });
  // barril de espadas de treino
  I.objeto('vila-barril-espadas', { w: 1, h: 1, solido: true, alto: true, topo: 12,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      V.espada(ctx, px + 5, py - 10, 16, '#c08a5a'); V.espada(ctx, px + 10, py - 12, 18);
      caixa(ctx, px + 2, py + 1, 12, 14, MADEIRA[1]); ret(ctx, px + 3, py + 4, 10, 1, '#5a5a7a'); ret(ctx, px + 3, py + 11, 10, 1, '#5a5a7a');
    } });

  /* ---------- Elmos e Chapéus ---------- */
  // cabide de chapéus (pé alto com três chapéus)
  I.objeto('vila-cabide-chapeus', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0;
      sombra(ctx, px + 8, py + 15, 6);
      ret(ctx, px + 7, py - 24, 3, 38, K); ret(ctx, px + 8, py - 23, 1, 36, MADEIRA[1]); caixa(ctx, px + 3, py + 11, 11, 4, MADEIRA[1]);
      V.chapeu(ctx, px + 8, py - 30, 12, ARCO[n % 6], '#ffffff');
      V.chapeu(ctx, px + 2, py - 16, 12, ARCO[(n + 2) % 6], '#ffe066');
      V.chapeu(ctx, px + 14, py - 10, 12, ARCO[(n + 4) % 6], K);
    } });
  // busto com elmo (var.cor: a pluma)
  I.objeto('vila-busto-elmo', { w: 1, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py, o) {
      var c = (o.var && o.var.cor) || '#ff5c6a';
      sombra(ctx, px + 8, py + 15, 6);
      caixa(ctx, px + 3, py + 2, 11, 13, '#e8e0f0'); ret(ctx, px + 4, py + 3, 3, 11, '#ffffff');
      caixa(ctx, px + 2, py - 10, 13, 6, '#f4ece0'); ret(ctx, px + 6, py - 4, 5, 6, K); ret(ctx, px + 7, py - 4, 3, 6, '#f4ece0');
      caixa(ctx, px + 1, py - 20, 15, 14, '#b0b0c2'); ret(ctx, px + 2, py - 19, 4, 12, '#d4d4e0'); ret(ctx, px + 4, py - 13, 9, 2, K); ret(ctx, px + 8, py - 12, 1, 5, K);
      ret(ctx, px + 7, py - 26, 4, 7, K); ret(ctx, px + 8, py - 25, 2, 6, c); ret(ctx, px + 10, py - 27, 3, 4, K); ret(ctx, px + 10, py - 26, 2, 2, c);
    } });
  // pilha de caixas de chapéu redondas, de fita
  I.objeto('vila-caixas-chapeu', { w: 1, h: 1, solido: true, alto: true, topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 15, 7);
      [['#ff86bb', 6], ['#5fb4ff', -2], ['#ffe066', -9]].forEach(function (c, i) {
        caixa(ctx, px + 1 + i, py + c[1], 14 - i * 2, 8, c[0]); ret(ctx, px + 7, py + c[1] + 1, 2, 6, '#ffffff'); ret(ctx, px + 2 + i, py + c[1] + 1, 12 - i * 2, 1, '#ffffff');
      });
    } });
  // prateleira de chapéus na parede (2 × 2)
  I.objeto('vila-prateleira-chapeus', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      [12, 26].forEach(function (y, k) {
        caixa(ctx, px, py + y, 32, 4, MADEIRA[2]); ret(ctx, px + 3, py + y + 4, 2, 3, K); ret(ctx, px + 27, py + y + 4, 2, 3, K);
        V.chapeu(ctx, px + 8, py + y - 7, 12, ARCO[k * 3], '#ffffff'); V.chapeu(ctx, px + 24, py + y - 7, 12, ARCO[k * 3 + 1], K);
      });
    } });

  /* ---------- Armaduras e Botas ---------- */
  // manequim de armadura (var.cor: a cor da peça)
  I.objeto('vila-manequim-armadura', { w: 1, h: 1, solido: true, alto: true, topo: 28,
    desenhar: function (ctx, px, py, o) {
      var c = (o.var && o.var.cor) || '#b0b0c2';
      sombra(ctx, px + 8, py + 15, 7);
      caixa(ctx, px + 3, py + 12, 11, 3, MADEIRA[1]); ret(ctx, px + 7, py + 4, 2, 9, K);
      caixa(ctx, px + 2, py - 14, 13, 19, c); ret(ctx, px + 3, py - 13, 3, 17, '#ffffff'); ret(ctx, px + 3, py - 6, 11, 1, K); ret(ctx, px + 8, py - 13, 1, 7, K);
      caixa(ctx, px - 1, py - 15, 5, 6, c); caixa(ctx, px + 13, py - 15, 5, 6, c);
      caixa(ctx, px + 4, py - 26, 9, 11, c); ret(ctx, px + 5, py - 21, 7, 2, K); ret(ctx, px + 6, py - 29, 5, 3, '#ff5c6a');
    } });
  // prateleira de botas (2 × 1, alta)
  I.objeto('vila-prateleira-botas', { w: 2, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 15, 14);
      caixa(ctx, px + 1, py - 24, 30, 39, MADEIRA[1]); ret(ctx, px + 2, py - 23, 28, 37, MADEIRA[0]);
      [-10, 2].forEach(function (y) { caixa(ctx, px + 1, py + y, 30, 3, MADEIRA[2]); });
      V.bota(ctx, px + 3, py - 22, '#c08a5a'); V.bota(ctx, px + 17, py - 22, '#ff5c6a');
      V.bota(ctx, px + 3, py - 10, '#5fb4ff'); V.bota(ctx, px + 17, py - 10, '#3a3a5a');
      ret(ctx, px + 4, py + 6, 24, 6, MADEIRA[2]);
    } });
  // par de botas no chão, para provar
  I.objeto('vila-botas', { w: 1, h: 1, solido: false,
    desenhar: function (ctx, px, py) { V.bota(ctx, px + 1, py + 3, '#9a6c46'); V.bota(ctx, px + 5, py + 4, '#9a6c46'); } });
})();
