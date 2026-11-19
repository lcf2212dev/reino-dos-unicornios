/* Vila Arco-Íris, Shopping Terrazo, objetos parte 2 de 3 (docs/contratos/vila.md §2; prefixo vila-shopping-): o cinema
   do Corredor das Lojas (bilheteria, pipoqueira, o cartaz de pé e o cordão da fila) e o Terraço Gourmet, a praça de
   alimentação (o balcão de comida, 3 × 1 encostado na parede, var.tipo pizza, hamburguer ou japones; o carrinho de
   sorvete, a mesa com guarda-sol e a churrasqueira de espetinhos). Só tipos de comida, nenhuma marca.
   Usa V.shopping (S, de shopping-objetos.js). A pipoca pulando e a fumaça só no `anim` (retângulos: o pintor). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, triangulo = D.triangulo;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, S = V.shopping, C = S.cores;

  /* ---------- o cinema ---------- */
  // bilheteria (2 × 1): cabine vermelha com o telhadinho de luzes, o vidro e os ingressos
  I.objeto('vila-shopping-bilheteria', { w: 2, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py - 20, 28, 35, C.cereja); ret(ctx, px + 3, py - 19, 1, 33, '#ff6f9a');
      caixa(ctx, px, py - 26, 32, 7, C.noite);
      for (var i = 0; i < 7; i++) ret(ctx, px + 3 + i * 4, py - 24, 2, 2, C.amarelo);
      S.vidro(ctx, px + 6, py - 16, 20, 12); S.reflexo(ctx, px + 8, py - 7, 3);
      ret(ctx, px + 15, py - 15, 2, 4, '#7a6a8a'); circulo(ctx, px + 16, py - 9, 2, '#7a6a8a');   // o microfone do vidro
      caixa(ctx, px + 4, py - 4, 24, 3, C.amarelo);
      [[8, C.amarelo], [19, C.rosa]].forEach(function (b) {   // os ingressos de picote
        ret(ctx, px + b[0], py + 1, 7, 5, K); ret(ctx, px + b[0] + 1, py + 2, 5, 3, b[1]); ret(ctx, px + b[0] + 3, py + 2, 1, 3, K);
      });
      ret(ctx, px + 6, py + 9, 20, 1, '#a0285a');
    } });
  // pipoqueira (1 × 1; interativa): carrinho vermelho e branco, vidro cheio de pipoca e o telhadinho
  var PIPOCA = [[3, 0], [6, -1], [9, 0], [11, -2], [4, -3], [8, -4], [2, -5], [6, -6], [10, -6]];
  I.objeto('vila-shopping-pipoqueira', { w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py) {
      triangulo(ctx, px + 1, py - 22, 14, 5, K); ret(ctx, px + 1, py - 17, 14, 2, K);
      triangulo(ctx, px + 3, py - 21, 10, 4, C.vermelho); ret(ctx, px + 2, py - 17, 12, 1, C.amarelo);
      ret(ctx, px + 2, py - 15, 1, 6, K); ret(ctx, px + 13, py - 15, 1, 6, K);
      caixa(ctx, px + 2, py - 13, 12, 10, C.vidro);
      PIPOCA.forEach(function (p) { ret(ctx, px + 2 + p[0], py - 5 + p[1], 2, 2, p[0] % 3 ? C.creme : '#fff3a0'); });
      caixa(ctx, px + 1, py - 4, 14, 15, C.vermelho);
      for (var i = 0; i < 3; i++) ret(ctx, px + 3 + i * 4, py - 3, 2, 13, C.branco);
      ret(ctx, px + 2, py - 3, 12, 1, '#ff8a9a');
      circulo(ctx, px + 4, py + 12, 2, K); circulo(ctx, px + 12, py + 12, 2, K); ret(ctx, px + 4, py + 12, 1, 1, C.metal); ret(ctx, px + 12, py + 12, 1, 1, C.metal);
    },
    anim: function (ctx, px, py, t) {   // um grão pulando dentro do vidro
      var f = Math.floor(t / 180) % 6;
      if (f < 4) ret(ctx, px + 6 + (f & 1) * 3, py - 7 - f * 1, 2, 2, C.creme);
    } });
  // o cartaz de pé (1 × 1): o filme de unicórnio num cavalete dourado
  I.objeto('vila-shopping-cartaz', { w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py, o) {
      ret(ctx, px + 3, py - 4, 2, 18, K); ret(ctx, px + 11, py - 4, 2, 18, K); ret(ctx, px + 4, py - 4, 1, 17, C.amarelo);
      caixa(ctx, px + 1, py - 22, 14, 22, C.amarelo);
      S.cartaz(ctx, px + 3, py - 20, (o.var && o.var.tema) || 'arco');
      ret(ctx, px + 3, py + 13, 10, 1, K);
    } });
  // o cordão da fila (2 × 1): dois postes dourados e a corda vermelha
  I.objeto('vila-shopping-cordao', { w: 2, h: 1, solido: true, alto: true, topo: 8,
    desenhar: function (ctx, px, py) {
      [3, 26].forEach(function (x) {
        ret(ctx, px + x, py - 6, 4, 18, K); ret(ctx, px + x + 1, py - 5, 2, 16, C.amarelo); ret(ctx, px + x + 1, py - 5, 1, 16, '#fff3a0');
        ret(ctx, px + x - 1, py - 8, 6, 3, K); ret(ctx, px + x, py - 7, 4, 1, C.amarelo);
        caixa(ctx, px + x - 2, py + 11, 8, 4, C.amarelo);
      });
      for (var i = 0; i < 19; i++) { var y = py - 4 + Math.round(Math.sin((i / 18) * Math.PI) * 4); ret(ctx, px + 7 + i, y, 1, 3, K); ret(ctx, px + 7 + i, y + 1, 1, 1, C.vermelho); }
    } });

  /* ---------- Terraço Gourmet ---------- */
  function pizza(ctx, cx, cy) {   // pizza inteira com calabresa (r 7)
    circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, '#e8b060'); circulo(ctx, cx, cy, 5, '#ffd86a');
    [[-2, -2], [2, -1], [-1, 2], [3, 3], [-4, 1]].forEach(function (p) { ret(ctx, cx + p[0], cy + p[1], 2, 2, C.vermelho); });
    ret(ctx, cx + 1, cy - 4, 1, 1, '#5e9a3a'); ret(ctx, cx - 3, cy + 4, 1, 1, '#5e9a3a');
  }
  function hamburguer(ctx, cx, by) {   // 12 × 10, base em by
    ret(ctx, cx - 6, by - 10, 12, 10, K);
    ret(ctx, cx - 5, by - 9, 10, 3, '#e8a050'); ret(ctx, cx - 3, by - 9, 1, 1, C.creme); ret(ctx, cx + 1, by - 8, 1, 1, C.creme);
    ret(ctx, cx - 5, by - 6, 10, 1, '#6fdc8c'); ret(ctx, cx - 5, by - 5, 10, 1, C.amarelo); ret(ctx, cx - 5, by - 4, 10, 2, C.marrom2);
    ret(ctx, cx - 5, by - 2, 10, 1, '#e8a050');
  }
  function sushi(ctx, x, y, c) {   // 6 × 6: arroz, alga e o recheio
    caixa(ctx, x, y, 6, 6, '#2f4a3a'); ret(ctx, x + 1, y + 1, 4, 4, C.creme); ret(ctx, x + 2, y + 2, 2, 2, c);
  }
  // o balcão de cada cozinha: faixa com o nome, o painel do fundo (forno, chapa ou lanternas) e a bancada com a comida
  var BALCOES = {
    pizza: { faixa: C.vermelho, letra: C.branco, texto: 'PIZZARIA', bancada: '#5e9a3a',
      fundo: function (ctx, px, py) {   // forno de tijolo com o fogo
        caixa(ctx, px + 2, py - 18, 44, 14, '#f3e2c4');
        ret(ctx, px + 13, py - 17, 22, 13, K); ret(ctx, px + 14, py - 16, 20, 12, '#b95a36');
        for (var j = 0; j < 3; j++) ret(ctx, px + 14, py - 14 + j * 4, 20, 1, '#8a3e22');
        ret(ctx, px + 18, py - 11, 12, 7, K); ret(ctx, px + 19, py - 10, 10, 6, '#3a2446'); ret(ctx, px + 20, py - 7, 8, 3, C.laranja); ret(ctx, px + 22, py - 8, 4, 2, C.amarelo);
      },
      comida: function (ctx, px, py) { pizza(ctx, px + 12, py - 8); pizza(ctx, px + 34, py - 8); } },
    hamburguer: { faixa: '#ff9f45', letra: C.branco, texto: 'HAMBURGUER', bancada: C.vermelho,
      fundo: function (ctx, px, py) {   // os três quadrinhos do cardápio
        caixa(ctx, px + 2, py - 18, 44, 14, '#3a4a5a');
        [6, 19, 32].forEach(function (x, i) { caixa(ctx, px + x, py - 16, 10, 10, C.creme); ret(ctx, px + x + 2, py - 13, 6, 2, i === 1 ? C.amarelo : '#e8a050'); ret(ctx, px + x + 2, py - 11, 6, 2, i === 2 ? C.vermelho : C.marrom2); });
      },
      comida: function (ctx, px, py) { hamburguer(ctx, px + 11, py - 2); hamburguer(ctx, px + 25, py - 2); caixa(ctx, px + 36, py - 9, 6, 7, C.vermelho); ret(ctx, px + 37, py - 12, 1, 3, C.amarelo); ret(ctx, px + 39, py - 12, 1, 3, C.amarelo); ret(ctx, px + 41, py - 11, 1, 2, C.amarelo); } },
    japones: { faixa: C.noite, letra: C.branco, texto: 'SUSHI', bancada: '#c08a5a',
      fundo: function (ctx, px, py) {   // painel de madeira com as lanternas de papel
        caixa(ctx, px + 2, py - 18, 44, 14, '#e8c49a');
        for (var i = 0; i < 5; i++) ret(ctx, px + 4 + i * 9, py - 17, 1, 12, '#c08a5a');
        [10, 37].forEach(function (x) { ret(ctx, px + x, py - 18, 1, 2, K); caixa(ctx, px + x - 3, py - 16, 7, 9, C.vermelho); ret(ctx, px + x - 2, py - 13, 5, 1, '#ff9a8a'); ret(ctx, px + x - 2, py - 15, 1, 6, '#ff9a8a'); });
      },
      comida: function (ctx, px, py) {
        caixa(ctx, px + 6, py - 6, 36, 4, '#7a4a2a');
        [[8, C.coral], [15, '#ffb06a'], [22, '#6fdc8c'], [29, C.coral], [36, '#ffb06a']].forEach(function (s) { sushi(ctx, px + s[0], py - 12, s[1]); });
      } },
  };
  I.objeto('vila-shopping-balcao', { w: 3, h: 1, solido: true, alto: false, topo: 30, junto: true,
    desenhar: function (ctx, px, py, o) {
      var t = BALCOES[(o.var && o.var.tipo) || 'pizza'] || BALCOES.pizza;
      caixa(ctx, px, py - 30, 48, 46, C.parede);
      caixa(ctx, px, py - 30, 48, 11, t.faixa); ret(ctx, px + 1, py - 29, 46, 1, clarear(t.faixa, 0.4));
      S.letras(ctx, px + 24 - (S.largura(t.texto) >> 1), py - 27, t.texto, t.letra);
      t.fundo(ctx, px, py);
      caixa(ctx, px, py - 4, 48, 20, t.bancada); ret(ctx, px + 1, py - 3, 46, 1, clarear(t.bancada, 0.4));
      for (var i = 0; i < 4; i++) ret(ctx, px + 5 + i * 11, py + 2, 6, 10, escurecer(t.bancada, 0.15));
      caixa(ctx, px - 1, py - 5, 50, 4, C.creme);
      t.comida(ctx, px, py);
    } });
  // carrinho de sorvete (2 × 1; interativo): guarda-sol listrado, os potes de sabores e a casquinha
  I.objeto('vila-shopping-sorvete', { w: 2, h: 1, solido: true, alto: true, topo: 28,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 15, py - 20, 2, 20, K);
      for (var j = 0; j < 7; j++) {   // o guarda-sol em degraus
        var meia = 3 + j * 2;
        ret(ctx, px + 16 - meia - 1, py - 28 + j, meia * 2 + 2, 1, K);
        for (var i = -meia; i < meia; i++) ret(ctx, px + 16 + i, py - 28 + j, 1, 1, Math.floor((i + 16) / 4) % 2 ? C.rosa : C.branco);
      }
      ret(ctx, px + 1, py - 21, 30, 1, K);
      caixa(ctx, px + 1, py - 6, 30, 18, C.branco); ret(ctx, px + 2, py - 5, 28, 1, C.rosa);
      [[4, C.rosa], [11, '#7a4a2a'], [18, '#fff3a0'], [25, '#6fdc8c']].forEach(function (s) { caixa(ctx, px + s[0], py - 9, 6, 4, s[1]); ret(ctx, px + s[0] + 1, py - 10, 4, 1, s[1]); });
      // a casquinha pintada na frente: a bola rosa e o cone em degraus
      circulo(ctx, px + 16, py, 3, K); circulo(ctx, px + 16, py, 2, C.rosa); ret(ctx, px + 15, py - 2, 1, 1, C.branco);
      for (var k = 0; k < 6; k++) {
        var m = 3 - (k >> 1);
        ret(ctx, px + 15 - m, py + 3 + k, m * 2 + 2, 1, K); ret(ctx, px + 16 - m, py + 3 + k, m * 2, 1, k % 2 ? '#d08a40' : '#e8a050');
      }
      ret(ctx, px + 15, py + 9, 2, 1, K);
      circulo(ctx, px + 6, py + 13, 2, K); circulo(ctx, px + 26, py + 13, 2, K);
    } });
  // mesa da praça de alimentação (2 × 1) com guarda-sol (var.cor) e o lanche em cima
  I.objeto('vila-shopping-mesa', { w: 2, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py, o) {
      var c = (o.var && o.var.cor) || C.laranja, comida = (o.var && o.var.comida) || 'pizza';
      ret(ctx, px + 15, py - 18, 2, 20, K);
      for (var j = 0; j < 6; j++) {
        var meia = 4 + j * 2;
        ret(ctx, px + 16 - meia - 1, py - 26 + j, meia * 2 + 2, 1, K);
        for (var i = -meia; i < meia; i++) ret(ctx, px + 16 + i, py - 26 + j, 1, 1, Math.floor((i + 16) / 4) % 2 ? C.branco : c);
      }
      ret(ctx, px + 1, py - 20, 30, 1, K);
      ret(ctx, px + 1, py - 1, 30, 7, K); ret(ctx, px + 2, py, 28, 4, C.creme); ret(ctx, px + 2, py, 28, 1, C.branco);
      ret(ctx, px + 6, py + 6, 2, 9, K); ret(ctx, px + 24, py + 6, 2, 9, K);
      // o lanche: prato e um copo de suco
      ret(ctx, px + 5, py - 1, 9, 2, K); ret(ctx, px + 6, py - 1, 7, 1, C.branco);
      if (comida === 'pizza') { triangulo(ctx, px + 6, py - 6, 6, 5, K); triangulo(ctx, px + 7, py - 5, 4, 3, '#ffd86a'); ret(ctx, px + 9, py - 3, 1, 1, C.vermelho); }
      else if (comida === 'sorvete') { circulo(ctx, px + 9, py - 4, 3, K); circulo(ctx, px + 9, py - 4, 2, C.rosa); }
      else { ret(ctx, px + 5, py - 6, 8, 5, K); ret(ctx, px + 6, py - 5, 6, 1, '#e8a050'); ret(ctx, px + 6, py - 4, 6, 1, '#6fdc8c'); ret(ctx, px + 6, py - 3, 6, 1, C.marrom2); }
      caixa(ctx, px + 20, py - 7, 5, 7, C.vidro); ret(ctx, px + 21, py - 4, 3, 3, C.laranja); ret(ctx, px + 23, py - 10, 1, 4, C.vermelho);
    } });
  // churrasqueira de espetinhos (2 × 1; interativa): base de tijolo, a grelha e as brasas
  I.objeto('vila-shopping-churrasqueira', { w: 2, h: 1, solido: true, alto: true, topo: 12,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py - 4, 30, 19, '#c8603a');
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) ret(ctx, px + 2 + i * 7 + (j % 2) * 3, py - 1 + j * 4, 6, 3, j % 2 ? '#d8744a' : '#e08458');
      caixa(ctx, px, py - 8, 32, 5, C.metal2); ret(ctx, px + 1, py - 7, 30, 1, C.metal);
      for (i = 0; i < 6; i++) ret(ctx, px + 3 + i * 5, py - 7, 2, 2, i % 2 ? C.laranja : C.vermelho);   // brasas
      [[5, C.marrom2], [14, C.vermelho], [23, C.marrom2]].forEach(function (s) {   // os espetinhos
        ret(ctx, px + s[0] - 2, py - 10, 10, 1, '#c8c0b0');
        ret(ctx, px + s[0], py - 12, 3, 3, K); ret(ctx, px + s[0] + 3, py - 12, 3, 3, K);
        ret(ctx, px + s[0], py - 11, 2, 1, s[1]); ret(ctx, px + s[0] + 3, py - 11, 2, 1, s[1] === C.vermelho ? '#6fdc8c' : '#e8a050');
      });
    },
    anim: function (ctx, px, py, t) {   // a fumacinha subindo em degraus
      var f = Math.floor(t / 250) % 6;
      ret(ctx, px + 8 + (f & 1), py - 14 - f * 2, 2, 2, '#e8e8f4');
      ret(ctx, px + 22 - (f & 1), py - 16 - ((f + 3) % 6) * 2, 2, 2, '#d4d4e0');
    } });
})();
