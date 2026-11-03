/* Torre dos Números da Matemática do Dia a Dia (4º bimestre), parte 2 dos objetos (prefixo ma-): os enfeites de cada
   capítulo. Capítulo 10 (sistema monetário): caixa registradora, cartaz das cédulas e banca de preços. Capítulo 11
   (divisão em partes iguais): pizza, pratos repartidos e cartaz das partes. Capítulo 12 (estatística): tabela de
   risquinhos, pictograma, prancheta da pesquisa e muda de árvore. A estação e o quadro dos andares: ma-objetos.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, matriz = D.matriz, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = R._predios.matematica, CO = S.CORES, ANIL = S.ANIL;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // "R$" em pixel (5×5)
  function real(ctx, x, y, cor) { matriz(ctx, x, y, ['##.#.', '#.###', '##.#.', '#.###', '#.##.'], { '#': cor }); }
  // as cédulas do Real: a cor de cada uma e o número
  var CEDULAS = [['#9fc6e8', '2'], ['#c9a6e8', '5'], ['#ff9c8a', '10'], ['#ffd56b', '20']];

  /* ================= CAPÍTULO 10: SISTEMA MONETÁRIO ================= */
  // caixa registradora no balcãozinho: o visor com "R$", as teclas e a gaveta de moedas aberta
  I.objeto('ma-caixa-registradora', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 14, 9, K); ret(ctx, px + 2, py + 7, 12, 7, C.madeira); ret(ctx, px + 2, py + 7, 12, 1, C.madeiraClara);
      ret(ctx, px + 2, py - 4, 12, 11, K); ret(ctx, px + 3, py - 3, 10, 9, ANIL); ret(ctx, px + 3, py - 3, 10, 1, '#7a6ee6');
      ret(ctx, px + 4, py - 9, 8, 6, K); ret(ctx, px + 5, py - 8, 6, 4, '#c8ffd8'); real(ctx, px + 5, py - 8, '#2a7a3e');
      for (var j = 0; j < 2; j++) for (var i = 0; i < 3; i++) ret(ctx, px + 4 + i * 3, py - 1 + j * 3, 2, 2, C.creme);
      // a gaveta aberta com moedas
      ret(ctx, px + 3, py + 9, 10, 3, K); ret(ctx, px + 4, py + 10, 8, 1, C.metal);
      [[5, C.ouro], [8, C.metal], [10, C.ouro]].forEach(function (m) { ret(ctx, px + m[0], py + 10, 2, 1, m[1]); });
    } });
  // cartaz das cédulas e moedas do Real, preso na parede
  I.objeto('ma-cedulas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 3, 28, 25, C.branco);
      ret(ctx, px + 15, py + 1, 2, 3, K);
      CEDULAS.forEach(function (c, i) {
        var x = px + 4 + (i % 2) * 13, y = py + 5 + Math.floor(i / 2) * 9;
        ret(ctx, x, y, 11, 7, K); ret(ctx, x + 1, y + 1, 9, 5, c[0]); ret(ctx, x + 1, y + 1, 9, 1, C.branco);
        S.texto(ctx, x + (c[1].length > 1 ? 2 : 4), y + 1, c[1], K);
      });
      // as moedas embaixo
      [[7, C.metal], [12, C.ouro], [17, C.ouro], [22, C.metal]].forEach(function (m, i) {
        circulo(ctx, px + m[0] + 1, py + 24, i % 2 ? 2 : 1, K); ret(ctx, px + m[0], py + 23 + (i % 2 ? 0 : 1), 2, i % 2 ? 2 : 1, m[1]);
      });
    } });
  // banca do mercadinho: a prateleira de frutas e cada caixote com a plaquinha de preço
  I.objeto('ma-banca', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 2, 30, 17, K); ret(ctx, px + 2, py - 1, 28, 15, C.madeira2);
      ret(ctx, px + 2, py + 6, 28, 2, K); ret(ctx, px + 2, py - 1, 28, 1, C.madeiraClara);
      var frutas = [['#e0433f', '#ff8a80'], ['#ffc61a', '#fff0a0'], ['#ff8a3d', '#ffc896'], ['#6fdc8c', '#c8f5d4']];
      frutas.forEach(function (f, i) {
        var x = px + 3 + i * 7;
        for (var k = 0; k < 3; k++) { ret(ctx, x + k * 2, py + 2 - (k % 2), 2, 2, f[0]); ret(ctx, x + k * 2, py + 2 - (k % 2), 1, 1, f[1]); }
        // a plaquinha do preço
        ret(ctx, x, py + 9, 6, 4, K); ret(ctx, x + 1, py + 10, 4, 2, C.creme); ret(ctx, x + 2, py + 10, 2, 1, '#2a7a3e');
      });
      ret(ctx, px + 1, py - 6, 30, 5, K); ret(ctx, px + 2, py - 5, 28, 3, CO.vermelho);
      for (var i = 0; i < 7; i++) ret(ctx, px + 2 + i * 4, py - 5, 2, 3, C.creme);   // o toldo listrado
    } });

  /* ================= CAPÍTULO 11: DIVISÃO EM PARTES IGUAIS ================= */
  // mesinha redonda com a pizza cortada em quatro pedaços iguais
  I.objeto('ma-pizza', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 6, 3, 9, K); ret(ctx, px + 8, py + 6, 1, 8, C.madeira);
      ret(ctx, px + 4, py + 13, 9, 2, K);
      elipse(ctx, px + 8, py + 3, 7, 4, K); elipse(ctx, px + 8, py + 3, 6, 3, '#e8b27a');
      elipse(ctx, px + 8, py + 3, 5, 2, '#ffc04d');
      ret(ctx, px + 3, py + 3, 11, 1, K); ret(ctx, px + 8, py, 1, 6, K);   // os cortes: quatro partes iguais
      [[5, 2], [11, 1], [5, 4], [11, 5]].forEach(function (p) { ret(ctx, px + p[0], py + p[1], 1, 1, CO.vermelho); });
    } });
  // mesa com três pratos e o mesmo tanto de biscoitos em cada um (var.cada: quantos por prato)
  I.objeto('ma-pratos', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var n = v(o, 'cada', 2);
      ret(ctx, px + 3, py + 4, 2, 11, K); ret(ctx, px + 27, py + 4, 2, 11, K);
      ret(ctx, px + 1, py - 2, 30, 7, K); ret(ctx, px + 2, py - 1, 28, 5, '#ffd0e2'); ret(ctx, px + 2, py - 1, 28, 1, C.branco);
      for (var p = 0; p < 3; p++) {
        var cx = px + 7 + p * 9;
        elipse(ctx, cx, py + 1, 4, 2, K); elipse(ctx, cx, py + 1, 3, 1, C.branco);
        for (var b = 0; b < n; b++) { var bx = cx - n + b * 2; ret(ctx, bx, py, 2, 2, C.madeira); ret(ctx, bx, py, 1, 1, C.madeiraClara); }
      }
    } });
  // cartaz das partes: o círculo em metades e o quadrado em quatro partes iguais
  I.objeto('ma-cartaz-partes', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 4, 14, 24, C.creme);
      ret(ctx, px + 7, py + 2, 2, 3, K);
      circulo(ctx, px + 8, py + 10, 4, K); circulo(ctx, px + 8, py + 10, 3, CO.laranja);
      ret(ctx, px + 8, py + 6, 1, 4, CO.amarelo); ret(ctx, px + 8, py + 10, 1, 4, CO.laranja);
      ret(ctx, px + 4, py + 10, 9, 1, K);   // o corte: duas metades
      ret(ctx, px + 4, py + 17, 9, 9, K);
      [[5, 18, CO.azul], [9, 18, CO.verde], [5, 22, CO.verde], [9, 22, CO.azul]].forEach(function (q) { ret(ctx, px + q[0], py + q[1], 3, 3, q[2]); });
    } });

  /* ================= CAPÍTULO 12: ESTATÍSTICA ================= */
  // tabela da pesquisa na parede: três linhas com um bichinho de cor e os risquinhos contados
  I.objeto('ma-tabela', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var conta = v(o, 'conta', [3, 5, 2]);
      contornoRet(ctx, px + 2, py + 3, 28, 25, C.branco);
      ret(ctx, px + 4, py + 5, 24, 4, ANIL);
      for (var i = 0; i < 3; i++) {
        var y = py + 11 + i * 5;
        ret(ctx, px + 4, y + 4, 24, 1, '#c9c2f0');
        ret(ctx, px + 5, y, 3, 3, [CO.vermelho, CO.verde, CO.amarelo][i]); ret(ctx, px + 10, y - 1, 1, 5, '#c9c2f0');
        for (var k = 0; k < conta[i]; k++) {
          if (k === 4) ret(ctx, px + 12, y + 1, 8, 1, K);   // o quinto risquinho atravessa os quatro
          else ret(ctx, px + 13 + k * 2, y - 1, 1, 4, K);
        }
      }
    } });
  // pictograma: colunas de carinhas (cada uma vale uma criança)
  I.objeto('ma-pictograma', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var col = v(o, 'colunas', [2, 4, 3]);
      contornoRet(ctx, px + 2, py + 3, 28, 25, '#fff3d6');
      ret(ctx, px + 5, py + 24, 22, 1, K);
      col.forEach(function (n, i) {
        var x = px + 7 + i * 7;
        for (var k = 0; k < n; k++) {
          var y = py + 20 - k * 4;
          circulo(ctx, x + 1, y + 1, 2, K); circulo(ctx, x + 1, y + 1, 1, C.ouro);
        }
        ret(ctx, x - 1, py + 25, 5, 1, [CO.azul, CO.rosa, CO.verde][i % 3]);
      });
    } });
  // prancheta da pesquisa num cavalete: a folha com as perguntas e os vistos
  I.objeto('ma-prancheta', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py - 2, 2, 17, K); ret(ctx, px + 11, py - 2, 2, 17, K); ret(ctx, px + 7, py + 2, 2, 13, K);
      ret(ctx, px + 2, py - 16, 12, 16, K); ret(ctx, px + 3, py - 15, 10, 14, C.madeira);
      ret(ctx, px + 4, py - 13, 8, 11, C.creme); ret(ctx, px + 6, py - 17, 4, 3, K); ret(ctx, px + 7, py - 16, 2, 1, C.metal);
      for (var i = 0; i < 3; i++) {
        ret(ctx, px + 5, py - 11 + i * 3, 4, 1, '#b8a8c8');
        matriz(ctx, px + 9, py - 12 + i * 3, ['..g', 'g.g', '.g.'], { g: '#3fae5a' });
      }
    } });
  // muda de árvore no vasinho (o projeto de plantar árvores da escola)
  I.objeto('ma-muda', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 7, 8, 8, K); ret(ctx, px + 5, py + 8, 6, 6, C.terracota); ret(ctx, px + 5, py + 8, 6, 1, '#f09a6e');
      ret(ctx, px + 3, py + 6, 10, 3, K); ret(ctx, px + 4, py + 7, 8, 1, C.terracota2);
      ret(ctx, px + 7, py - 2, 2, 9, K); ret(ctx, px + 8, py - 1, 1, 7, C.folha3);
      elipse(ctx, px + 5, py - 1, 3, 2, K); elipse(ctx, px + 5, py - 1, 2, 1, C.folha);
      elipse(ctx, px + 11, py - 4, 3, 2, K); elipse(ctx, px + 11, py - 4, 2, 1, C.folha2);
      elipse(ctx, px + 8, py - 7, 2, 3, K); elipse(ctx, px + 8, py - 7, 1, 2, C.folha);
    } });
})();
