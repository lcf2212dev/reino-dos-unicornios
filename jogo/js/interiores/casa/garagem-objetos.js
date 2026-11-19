/* Minha Casa, a Garagem (interior `casa-garagem`; casa.md §2): os objetos do cômodo (prefixo casa-garagem-). O balcão
   do Mercado de Lugares Famosos (toldo listrado, globo e a Torre Eiffel de miniatura em cima; a ação abre a loja
   'lugares', vila.md §4), a porta para o térreo, o portão de enrolar e o painel de ferramentas na parede, a bancada,
   o carro da família, a bicicleta, os pneus e a prateleira de latas. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, escurecer = D.escurecer, clarear = D.clarear;
  var circulo = R.Interiores.desenho.circulo;
  var MADEIRA = '#c98a50', LILAS = '#b58cff', ROSA = '#ff7eb6', AZUL = '#5cb8ff', AMARELO = '#ffd34d', CINZA = '#9a93b5';

  // caixa com contorno: borda escura, miolo, luz em cima/esquerda e sombra embaixo/direita
  function caixa(ctx, x, y, w, h, cor) {
    ret(ctx, x, y, w, h, K);
    ret(ctx, x + 1, y + 1, w - 2, h - 2, cor);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(cor, 0.25)); ret(ctx, x + 1, y + 1, 1, h - 2, clarear(cor, 0.15));
    ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(cor, 0.2)); ret(ctx, x + w - 2, y + 1, 1, h - 2, escurecer(cor, 0.15));
  }

  /* ---------- o balcão do Mercado (3 × 2, com o toldo acima) ---------- */
  R.Interiores.objeto('casa-garagem-balcao', { w: 3, h: 2, topo: 26, solido: true,
    desenhar: function (ctx, px, py) {
      var W = 48, i;
      ret(ctx, px + 2, py + 30, W - 4, 2, 'rgba(58,36,70,0.25)');          // sombra no chão
      // os postes do toldo e o toldo listrado (lilás e branco)
      ret(ctx, px + 3, py - 18, 2, 30, K); ret(ctx, px + W - 5, py - 18, 2, 30, K);
      ret(ctx, px + 1, py - 26, W - 2, 10, K);
      for (i = 0; i < 6; i++) {   // 6 faixas em 44 px, em pixels inteiros
        var x0 = Math.round(i * 44 / 6), x1 = Math.round((i + 1) * 44 / 6), cor = i % 2 ? C.branco : LILAS;
        ret(ctx, px + 2 + x0, py - 25, x1 - x0, 8, cor);
        ret(ctx, px + 3 + x0, py - 17, x1 - x0 - 2, 2, cor);   // a franja
      }
      ret(ctx, px + 2, py - 25, W - 4, 1, clarear(LILAS, 0.4));
      // o balcão de madeira com a frente rosa
      caixa(ctx, px + 1, py + 6, W - 2, 24, MADEIRA);
      ret(ctx, px + 1, py + 6, W - 2, 4, K); ret(ctx, px + 2, py + 7, W - 4, 2, clarear(MADEIRA, 0.3));   // o tampo
      caixa(ctx, px + 4, py + 12, W - 8, 14, ROSA);
      // na frente, a estrelinha do preço (compra com estrelas)
      var sx = px + 21, sy = py + 15;
      ret(ctx, sx + 2, sy, 2, 8, AMARELO); ret(ctx, sx, sy + 2, 6, 3, AMARELO); ret(ctx, sx + 1, sy + 5, 1, 2, AMARELO); ret(ctx, sx + 4, sy + 5, 1, 2, AMARELO);
      ret(ctx, sx + 2, sy + 1, 1, 2, C.branco);
      // em cima: o globo (azul com terra verde) e a Torre Eiffel de miniatura
      circulo(ctx, px + 12, py + 1, 5, K); circulo(ctx, px + 12, py + 1, 4, AZUL);
      ret(ctx, px + 10, py - 2, 3, 2, '#6ee07a'); ret(ctx, px + 13, py + 1, 2, 3, '#6ee07a'); ret(ctx, px + 10, py - 1, 1, 1, C.branco);
      ret(ctx, px + 11, py + 5, 3, 2, K);
      var tx = px + 32, ty = py - 10;   // a torre: a ponta, o corpo afinando e as duas pernas
      ret(ctx, tx + 3, ty, 1, 3, K); ret(ctx, tx + 2, ty + 3, 3, 4, K); ret(ctx, tx + 3, ty + 4, 1, 2, '#c08850');
      ret(ctx, tx + 1, ty + 7, 5, 5, K); ret(ctx, tx + 2, ty + 8, 3, 3, '#c08850');
      ret(ctx, tx, ty + 12, 7, 4, K); ret(ctx, tx + 1, ty + 12, 2, 3, '#c08850'); ret(ctx, tx + 4, ty + 12, 2, 3, '#c08850');
    } });

  /* ---------- na parede: a porta para o térreo (1 × 2), o portão (4 × 2) e o painel de ferramentas (3 × 2) ---------- */
  R.Interiores.objeto('casa-garagem-porta', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 4, 14, 28, '#d9a066');
      ret(ctx, px + 3, py + 7, 10, 10, escurecer('#d9a066', 0.12)); ret(ctx, px + 3, py + 19, 10, 10, escurecer('#d9a066', 0.12));
      ret(ctx, px + 11, py + 18, 2, 2, AMARELO); ret(ctx, px + 11, py + 18, 1, 1, C.branco);   // a maçaneta
    } });
  R.Interiores.objeto('casa-garagem-portao', { w: 4, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var W = 64, i;
      caixa(ctx, px, py + 2, W, 30, '#8e86ad');
      for (i = 0; i < 6; i++) { ret(ctx, px + 2, py + 6 + i * 4, W - 4, 1, escurecer('#8e86ad', 0.25)); ret(ctx, px + 2, py + 7 + i * 4, W - 4, 1, clarear('#8e86ad', 0.2)); }
      ret(ctx, px + 28, py + 28, 8, 2, K);   // a alça
    } });
  R.Interiores.objeto('casa-garagem-ferramentas', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 3, 46, 26, '#e8c48c');
      for (var j = 0; j < 4; j++) for (var i = 0; i < 9; i++) ret(ctx, px + 5 + i * 5, py + 7 + j * 6, 1, 1, escurecer('#e8c48c', 0.3));
      // o martelo, a chave inglesa, a chave de fenda e o serrote
      ret(ctx, px + 6, py + 8, 7, 3, K); ret(ctx, px + 7, py + 9, 5, 1, CINZA); ret(ctx, px + 8, py + 11, 3, 12, K); ret(ctx, px + 9, py + 11, 1, 11, MADEIRA);
      ret(ctx, px + 17, py + 7, 4, 4, K); ret(ctx, px + 18, py + 8, 2, 2, CINZA); ret(ctx, px + 18, py + 11, 2, 12, K); ret(ctx, px + 18, py + 12, 1, 10, CINZA);
      ret(ctx, px + 26, py + 7, 1, 8, K); ret(ctx, px + 25, py + 15, 3, 8, K); ret(ctx, px + 26, py + 16, 1, 6, ROSA);
      ret(ctx, px + 32, py + 8, 10, 12, K); ret(ctx, px + 33, py + 9, 8, 10, CINZA); ret(ctx, px + 32, py + 20, 4, 4, K); ret(ctx, px + 33, py + 20, 2, 3, MADEIRA);
      for (var d = 0; d < 4; d++) ret(ctx, px + 34 + d * 2, py + 18, 1, 1, K);
    } });

  /* ---------- no chão ---------- */
  // a bancada de ferramentas (3 × 1)
  R.Interiores.objeto('casa-garagem-bancada', { w: 3, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 14, 44, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 1, py - 4, 46, 7, MADEIRA);
      ret(ctx, px + 3, py + 3, 3, 11, K); ret(ctx, px + 42, py + 3, 3, 11, K); ret(ctx, px + 4, py + 3, 1, 10, escurecer(MADEIRA, 0.2)); ret(ctx, px + 43, py + 3, 1, 10, escurecer(MADEIRA, 0.2));
      ret(ctx, px + 6, py + 9, 36, 2, K);   // a prateleira de baixo
      caixa(ctx, px + 8, py - 8, 8, 5, AZUL);       // a caixa de ferramentas
      caixa(ctx, px + 30, py - 9, 5, 6, AMARELO);   // a lata de tinta
      ret(ctx, px + 31, py - 10, 3, 1, K);
    } });
  // o carro da família, de lado (4 × 3), rosa com janelas azuis
  R.Interiores.objeto('casa-garagem-carro', { w: 4, h: 3, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      var x = px + 2, y = py + 8, cor = ROSA;
      ret(ctx, px + 4, py + 44, 56, 3, 'rgba(58,36,70,0.25)');
      // o teto e as janelas
      ret(ctx, x + 14, y, 30, 14, K); ret(ctx, x + 15, y + 1, 28, 12, cor);
      ret(ctx, x + 17, y + 3, 11, 9, K); ret(ctx, x + 18, y + 4, 9, 8, '#bfe6ff'); ret(ctx, x + 18, y + 4, 3, 2, C.branco);
      ret(ctx, x + 30, y + 3, 11, 9, K); ret(ctx, x + 31, y + 4, 9, 8, '#bfe6ff'); ret(ctx, x + 31, y + 4, 3, 2, C.branco);
      // a carroceria
      ret(ctx, x, y + 13, 60, 18, K); ret(ctx, x + 1, y + 14, 58, 16, cor);
      ret(ctx, x + 1, y + 14, 58, 2, clarear(cor, 0.3)); ret(ctx, x + 1, y + 27, 58, 3, escurecer(cor, 0.2));
      ret(ctx, x + 29, y + 16, 1, 11, escurecer(cor, 0.3));                     // a porta
      ret(ctx, x + 32, y + 19, 4, 1, K);                                          // a maçaneta
      ret(ctx, x + 55, y + 17, 4, 4, AMARELO); ret(ctx, x + 1, y + 17, 3, 4, '#ff5c5c');   // farol e lanterna
      // as rodas
      [x + 13, x + 47].forEach(function (cx) {
        circulo(ctx, cx, y + 31, 7, K); circulo(ctx, cx, y + 31, 6, '#4a4458'); circulo(ctx, cx, y + 31, 3, CINZA); ret(ctx, cx - 1, y + 30, 1, 1, C.branco);
      });
    } });
  // a bicicleta (2 × 1)
  R.Interiores.objeto('casa-garagem-bicicleta', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 14, 26, 2, 'rgba(58,36,70,0.25)');
      [px + 8, px + 24].forEach(function (cx) { circulo(ctx, cx, py + 8, 6, K); circulo(ctx, cx, py + 8, 5, '#f4f2fa'); circulo(ctx, cx, py + 8, 4, K); circulo(ctx, cx, py + 8, 1, CINZA); });
      ret(ctx, px + 8, py + 7, 16, 2, LILAS); ret(ctx, px + 13, py - 2, 2, 10, LILAS); ret(ctx, px + 20, py - 3, 2, 11, LILAS);
      ret(ctx, px + 11, py - 4, 6, 2, K); ret(ctx, px + 19, py - 5, 5, 2, K);   // o selim e o guidão
    } });
  // a pilha de pneus (1 × 1)
  R.Interiores.objeto('casa-garagem-pneus', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      for (var i = 0; i < 3; i++) { var y = py + 8 - i * 6; ret(ctx, px + 1, y, 14, 6, K); ret(ctx, px + 2, y + 1, 12, 4, '#4a4458'); ret(ctx, px + 6, y + 2, 4, 2, K); ret(ctx, px + 2, y + 1, 12, 1, '#6a6478'); }
    } });
  // a prateleira de latas e caixas (2 × 1)
  R.Interiores.objeto('casa-garagem-prateleira', { w: 2, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 14, 2, 28, K); ret(ctx, px + 29, py - 14, 2, 28, K);
      ret(ctx, px + 1, py - 4, 30, 2, K); ret(ctx, px + 1, py + 8, 30, 2, K);
      caixa(ctx, px + 4, py - 12, 7, 8, AMARELO); caixa(ctx, px + 12, py - 11, 6, 7, AZUL); caixa(ctx, px + 20, py - 13, 8, 9, '#d9a66b');
      caixa(ctx, px + 4, py, 10, 8, '#d9a66b'); caixa(ctx, px + 16, py + 1, 6, 7, ROSA); caixa(ctx, px + 23, py + 1, 6, 7, '#6ee07a');
    } });
})();
