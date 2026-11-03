/* Minha Casa: o prédio de fora, no mapa (Mapa.PREDIOS.casa, 6 × 5 tiles = 96 × 80 px; o telhado e a chaminé sobem
   até 14 px acima). Casinha de 2 andares: telhado coral de escamas com a janelinha redonda, andar de cima de tábuas
   creme com duas janelas e floreiras, térreo de reboco pêssego com a janela grande, a porta menta com degrau
   (no tile (49, 37), à direita do meio) e a chaminé de tijolos com a fumacinha (Mapa.PREDIOS_ANIM.casa).
   Nada de Math.random. */
(function () {
  var R = window.Reino;
  var D = R.Interiores.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;

  var TELHA = '#ef7d6b', TELHA2 = '#c85a4c', TABUA = '#fff1c9', REBOCO = '#ffd9c2', MENTA = '#5fc9b4', MENTA2 = '#3fa894';
  var TIJOLO = '#c86a5a', ROSA = '#ff7eb6', AMAR = '#ffe066';

  // posições que o desenho e a animação dividem
  function medidas(px, py) { return { chx: px + 14, chy: py - 14, porta: px + 56 }; }

  function desenharFora(ctx, px, py, w, h) {
    var V = window.Mapa.fachada.kit, Fa = window.Mapa.fachada, M = medidas(px, py);
    var y2 = py + 24, y1 = py + 47;                     // começo do andar de cima e do térreo
    // chaminé de tijolos (antes do telhado: ele cobre o pé dela). Desce até py + 18, abaixo da água do telhado
    // na coluna da esquerda (py + 15 em px + 14): o pé fica todo dentro do telhado, sem grama entre os dois
    contornoRet(ctx, M.chx, M.chy + 3, 11, 30, TIJOLO);
    Fa.tijolos(ctx, M.chx + 1, M.chy + 4, 9, 28, TIJOLO, 3);
    ret(ctx, M.chx + 1, M.chy + 4, 1, 28, '#e8907e');
    ret(ctx, M.chx - 1, M.chy, 13, 4, K); ret(ctx, M.chx, M.chy + 1, 11, 1, '#e8907e');
    // andar de cima: tábuas creme deitadas
    contornoRet(ctx, px + 4, y2, w - 8, y1 - y2 + 1, TABUA);
    V.tabuas(ctx, px + 5, y2 + 1, w - 10, y1 - y2 - 1, TABUA);
    V.volume(ctx, px + 5, y2 + 1, w - 10, y1 - y2 - 1);
    // térreo: reboco pêssego, mais largo, com a faixa de madeira entre os andares
    contornoRet(ctx, px + 3, y1, w - 6, py + h - y1, REBOCO);
    V.reboco(ctx, px + 4, y1 + 1, w - 8, py + h - y1 - 6, REBOCO);
    V.volume(ctx, px + 4, y1 + 1, w - 8, py + h - y1 - 6);
    V.fundacao(ctx, px + 4, py + h - 6, w - 8, 5, '#d8c2b0');
    ret(ctx, px + 2, y1 - 1, w - 4, 4, K); ret(ctx, px + 3, y1, w - 6, 2, C.madeira); ret(ctx, px + 3, y1, w - 6, 1, C.madeiraClara);
    V.sombra(ctx, px + 4, y1 + 3, w - 8);
    // telhado coral de escamas, com o beiral escuro
    triangulo(ctx, px, py - 8, w, 34, K);
    V.telhado(ctx, px + 3, py - 5, w - 6, 30, TELHA, 4);
    ret(ctx, px, y2 - 1, w, 4, K); ret(ctx, px + 1, y2, w - 2, 2, TELHA2); ret(ctx, px + 1, y2, w - 2, 1, TELHA);
    V.sombra(ctx, px + 5, y2 + 3, w - 10);
    // janelinha redonda no oitão, com um coraçãozinho
    var cx = px + (w >> 1), jy = py + 9;
    circulo(ctx, cx, jy, 6, K); circulo(ctx, cx, jy, 5, TABUA); circulo(ctx, cx, jy, 3, '#9fdcff');
    ret(ctx, cx - 1, jy - 1, 1, 1, ROSA); ret(ctx, cx + 1, jy - 1, 1, 1, ROSA); ret(ctx, cx - 1, jy, 3, 1, ROSA); ret(ctx, cx, jy + 1, 1, 1, ROSA);
    // andar de cima: duas janelas com floreira
    [[px + 13], [px + w - 31]].forEach(function (j) {
      Fa.janela(ctx, j[0], y2 + 5, 18, 13, { moldura: C.branco, vidro: '#b8e6ff' });
      V.fundoJanela(ctx, j[0], y2 + 5, 18, 13);
      Fa.floreira(ctx, j[0] - 1, y2 + 18, 20);
    });
    // térreo: janela grande à esquerda, com floreira e veneziana menta
    var jx = px + 12, jt = y1 + 7;
    ret(ctx, jx - 4, jt, 4, 15, K); ret(ctx, jx - 3, jt + 1, 2, 13, MENTA);
    ret(ctx, jx + 26, jt, 4, 15, K); ret(ctx, jx + 27, jt + 1, 2, 13, MENTA);
    Fa.janela(ctx, jx, jt, 26, 15, { moldura: C.branco, vidro: '#b8e6ff' });
    V.fundoJanela(ctx, jx, jt, 26, 15);
    Fa.floreira(ctx, jx - 2, jt + 15, 30, ROSA);
    // a porta menta com o degrau e o capacho, no tile da porta
    V.degraus(ctx, M.porta, py + h, 26);
    var fo = Fa.entrada(ctx, M.porta, py + h, MENTA2, C.branco);
    V.capacho(ctx, M.porta, py + h, ROSA);
    ret(ctx, M.porta - 2, fo.y + 5, 5, 4, K); ret(ctx, M.porta - 1, fo.y + 6, 3, 2, AMAR);   // janelinha da porta
    // lampião ao lado da porta e vaso de flor à direita
    V.lampiao(ctx, M.porta + 9, y1 + 8, 1);
    Fa.vaso(ctx, px + w - 12, py + h, AMAR);
    // brilhinhos
    Fa.brilho(ctx, px + 6, py + 16, C.branco); Fa.brilho(ctx, px + w - 14, py - 2, C.branco);
  }
  // animação: três bolinhas de fumaça sobem da chaminé, crescem e somem
  function animarFora(ctx, px, py, w, h, t) {
    var M = medidas(px, py), ciclo = 2400;
    for (var i = 0; i < 3; i++) {
      var fase = ((t + i * ciclo / 3) % ciclo) / ciclo, dy = Math.floor(fase * 14);
      var x = M.chx + 4 + [0, 1, 1, 0, -1, -1][Math.floor(dy / 3) % 6], y = M.chy - 3 - dy;
      if (fase > 0.85) continue;
      var n = fase > 0.45 ? 4 : 3;
      ret(ctx, x, y, n, n, '#e9e4f2'); ret(ctx, x, y, 1, 1, C.branco);
    }
  }
  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS.casa = desenharFora;
    if (Mapa.PREDIOS_ANIM) Mapa.PREDIOS_ANIM.casa = animarFora;
  }
})();
