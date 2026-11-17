/* Bosque dos Fantasmas, os objetos da mata (prefixo bosque-): árvores (grande, pequena, pinheiro e a velha de cara
   simpática), arbusto, pedra, toco, tronco e os enfeites do chão que não são sólidos (mato, flores, margaridas, trevo,
   samambaia, pedrinhas). Os mágicos (cogumelos, lanternas, placa, vaga-lumes) estão em objetos-2.js.
   Divide com ele Reino._predios.bosque (B.folhagem). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  // folhagens: [escuro, médio, claro]; a árvore escolhe por var.cor (verde, rosa de cerejeira, lilás)
  var COPA = { verde: ['#3b8240', '#58b257', '#8fe07a'], rosa: ['#c8609c', '#ee8cc4', '#ffc4e4'], lilas: ['#7a56c4', '#a884ee', '#d4bcff'] };
  var TRONCO = ['#5a3a24', '#7a5234', '#9a6c46'];
  function cor(o) { return COPA[(o && o.var && o.var.cor)] || COPA.verde; }

  // folhagem em bolas [cx, cy, raio] com contorno só por fora (todas as bolas de contorno primeiro)
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  B.folhagem = folhagem;
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(40,70,40,0.3)'); }
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 2, h, TRONCO[2]); ret(ctx, x + w - 2, y, 2, h, TRONCO[0]); }

  /* ---------- árvores (sólidas na base, desenhadas na ordem por Y) ---------- */
  I.objeto('bosque-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 6, 8, 20);
      folhagem(ctx, px, py, [[16, -20, 14], [6, -10, 9], [26, -10, 9], [16, -8, 10]], cor(o));
    } });
  I.objeto('bosque-arvore-p', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 7);
      tronco(ctx, px + 6, py - 2, 4, 16);
      folhagem(ctx, px, py, [[8, -12, 8], [3, -5, 5], [13, -5, 5]], cor(o));
    } });
  I.objeto('bosque-pinheiro', { w: 1, h: 1, solido: true, alto: true, topo: 42,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      tronco(ctx, px + 6, py + 6, 4, 9);
      [[-26, 18, 14], [-17, 15, 12], [-8, 12, 10], [-1, 9, 8]].forEach(function (c, i) {
        triangulo(ctx, px + 8 - c[1] / 2 - 1, py + c[0] - 1, c[1] + 2, c[2] + 2, K);
      });
      [[-26, 18, 14], [-17, 15, 12], [-8, 12, 10], [-1, 9, 8]].forEach(function (c, i) {
        triangulo(ctx, px + 8 - c[1] / 2, py + c[0], c[1], c[2], i % 2 ? '#3b8240' : '#2f6b34');
        ret(ctx, px + 8 - c[1] / 2 + 2, py + c[0] + c[2] - 3, 3, 1, '#58b257');
      });
    } });
  // a árvore velha: tronco largo com uma carinha simpática, bigode de musgo e uma copa enorme
  I.objeto('bosque-arvore-velha', { w: 2, h: 1, solido: true, alto: true, topo: 62,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 5, py - 2, 22, 17, K); ret(ctx, px + 6, py - 2, 20, 16, TRONCO[1]);
      ret(ctx, px + 6, py - 2, 4, 16, TRONCO[2]); ret(ctx, px + 22, py - 2, 4, 16, TRONCO[0]);
      ret(ctx, px + 8, py + 14, 3, 2, TRONCO[0]); ret(ctx, px + 21, py + 14, 3, 2, TRONCO[0]);
      ret(ctx, px + 9, py - 22, 14, 21, K); ret(ctx, px + 10, py - 22, 12, 21, TRONCO[1]); ret(ctx, px + 10, py - 22, 3, 21, TRONCO[2]); ret(ctx, px + 20, py - 22, 2, 21, TRONCO[0]);
      // carinha
      ret(ctx, px + 11, py - 10, 3, 4, K); ret(ctx, px + 18, py - 10, 3, 4, K); ret(ctx, px + 12, py - 10, 1, 1, '#ffffff'); ret(ctx, px + 19, py - 10, 1, 1, '#ffffff');
      ret(ctx, px + 14, py - 5, 4, 1, K); ret(ctx, px + 13, py - 6, 1, 1, K); ret(ctx, px + 18, py - 6, 1, 1, K);
      ret(ctx, px + 10, py - 6, 2, 2, '#e8907a'); ret(ctx, px + 21, py - 6, 2, 2, '#e8907a');
      ret(ctx, px + 8, py + 4, 16, 3, '#6fb04a'); ret(ctx, px + 10, py + 7, 4, 2, '#6fb04a'); ret(ctx, px + 18, py + 7, 3, 3, '#6fb04a');
      folhagem(ctx, px, py, [[16, -34, 15], [5, -24, 9], [27, -24, 9], [16, -24, 11], [9, -41, 7], [23, -41, 7]], COPA.verde);
      ret(ctx, px + 12, py - 28, 2, 2, '#fff3a0'); ret(ctx, px + 24, py - 33, 2, 2, '#fff3a0'); ret(ctx, px + 6, py - 20, 2, 2, '#fff3a0');
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('bosque-arbusto', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 7);
      folhagem(ctx, px, py, [[8, 8, 6], [3, 10, 4], [13, 10, 4]], cor(o));
      ret(ctx, px + 6, py + 5, 1, 1, '#ffffff'); ret(ctx, px + 11, py + 9, 1, 1, '#ffe27a');
    } });
  I.objeto('bosque-pedra', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, '#a0a4b4');
      elipse(ctx, px + 7, py + 8, 4, 2, '#c8ccd8'); ret(ctx, px + 11, py + 10, 2, 2, '#7c8094');
      ret(ctx, px + 3, py + 6, 4, 2, '#6fb04a');   // um tiquinho de musgo
    } });
  I.objeto('bosque-toco', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, TRONCO[1]); ret(ctx, px + 3, py + 7, 2, 7, TRONCO[2]);
      elipse(ctx, px + 8, py + 6, 6, 3, K); elipse(ctx, px + 8, py + 6, 5, 2, '#d8b078'); elipse(ctx, px + 8, py + 6, 3, 1, '#b8884e'); ret(ctx, px + 8, py + 6, 1, 1, '#8a5a30');
      ret(ctx, px + 11, py + 2, 3, 2, K); ret(ctx, px + 12, py + 1, 2, 1, K); ret(ctx, px + 11, py + 2, 2, 1, '#ff8ab0');
    } });
  I.objeto('bosque-tronco', { w: 2, h: 1, solido: true, topo: 6,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 2, py + 5, 28, 10, K); ret(ctx, px + 3, py + 6, 26, 8, TRONCO[1]); ret(ctx, px + 3, py + 6, 26, 2, TRONCO[2]); ret(ctx, px + 3, py + 12, 26, 2, TRONCO[0]);
      ret(ctx, px + 1, py + 6, 3, 8, K); ret(ctx, px + 2, py + 7, 1, 6, '#d8b078');
      ret(ctx, px + 10, py + 4, 9, 3, '#6fb04a'); ret(ctx, px + 22, py + 4, 4, 2, '#6fb04a');
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  I.objeto('bosque-mato', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 14, 5], [6, 14, 7], [9, 14, 6], [12, 14, 4], [5, 14, 4], [10, 14, 3]].forEach(function (l, i) {
        ret(ctx, px + l[0] + (i % 2), py + 14 - l[2], 2, l[2], i % 2 ? '#3b8240' : '#58b257');
        ret(ctx, px + l[0] + (i % 2), py + 14 - l[2], 1, 1, '#8fe07a');
      });
    } });
  var PETALAS = ['#ff8ac4', '#ffffff', '#ffe27a', '#b894ff', '#8fd8ff'];
  function flor(ctx, x, y, c) {
    ret(ctx, x, y + 2, 1, 4, '#3b8240');
    ret(ctx, x - 1, y, 3, 3, K); ret(ctx, x, y - 1, 1, 5, K); ret(ctx, x - 1, y + 1, 3, 1, c); ret(ctx, x, y, 1, 3, c); ret(ctx, x, y + 1, 1, 1, '#ffd34d');
  }
  I.objeto('bosque-flores', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var s = (o.var && o.var.n) || 0;
      flor(ctx, px + 4, py + 5, PETALAS[s % 5]); flor(ctx, px + 10, py + 8, PETALAS[(s + 2) % 5]); flor(ctx, px + 7, py + 3, PETALAS[(s + 4) % 5]);
      ret(ctx, px + 2, py + 12, 3, 2, '#58b257'); ret(ctx, px + 11, py + 13, 3, 2, '#58b257');
    } });
  I.objeto('bosque-margaridas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[4, 6], [11, 9]].forEach(function (f) {
        ret(ctx, px + f[0], py + f[1] + 2, 1, 5, '#3b8240');
        ret(ctx, px + f[0] - 2, py + f[1] - 2, 5, 5, K); ret(ctx, px + f[0] - 1, py + f[1] - 3, 3, 7, K); ret(ctx, px + f[0] - 3, py + f[1] - 1, 7, 3, K);
        ret(ctx, px + f[0] - 1, py + f[1] - 2, 3, 5, '#ffffff'); ret(ctx, px + f[0] - 2, py + f[1] - 1, 5, 3, '#ffffff'); ret(ctx, px + f[0], py + f[1], 1, 1, '#ffc94d');
      });
    } });
  I.objeto('bosque-trevo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[4, 9], [10, 6], [11, 12]].forEach(function (t, i) {
        circulo(ctx, px + t[0] - 1, py + t[1] - 1, 1, '#2f8a3c'); circulo(ctx, px + t[0] + 1, py + t[1] - 1, 1, '#2f8a3c');
        circulo(ctx, px + t[0] - 1, py + t[1] + 1, 1, '#3fa84c'); circulo(ctx, px + t[0] + 1, py + t[1] + 1, 1, '#3fa84c');
        if (i === 1) ret(ctx, px + t[0], py + t[1], 1, 1, '#d8ffc8');
      });
    } });
  I.objeto('bosque-samambaia', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      for (var i = 0; i < 5; i++) {   // folhas em leque, saindo de baixo
        var dx = (i - 2) * 3, c = i % 2 ? '#3b8240' : '#58b257';
        ret(ctx, px + 8 + dx, py + 7 + Math.abs(i - 2) * 2, 1, 7 - Math.abs(i - 2), c);
        ret(ctx, px + 8 + dx + (dx < 0 ? -1 : 1), py + 8 + Math.abs(i - 2) * 2, 1, 2, c);
        ret(ctx, px + 8 + dx + (dx < 0 ? 1 : -1), py + 10 + Math.abs(i - 2) * 2, 1, 2, c);
      }
    } });
  var PEDRINHA = ['#8a8a9c', '#b4b8c8', '#e4e8f0'];
  I.objeto('bosque-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[2, 8, 6, 5], [9, 3, 5, 5], [8, 10, 6, 5]].forEach(function (s) { B.pedra(ctx, px + s[0], py + s[1], s[2], s[3], PEDRINHA); });
    } });
})();
