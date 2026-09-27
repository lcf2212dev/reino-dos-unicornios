/* Salão de Beleza, parte 4: o prédio de fora, no mapa (Mapa.PREDIOS.salao, o rect em tiles × 16; feito para
   6 × 5 tiles = 96 × 80 px e se ajusta a outro tamanho). Rosa e lilás: telhadinho de escamas, placa da tesoura e do
   pente com lampadinhas, toldo listrado com babadinho, vitrine da peruca e do vestido, porta de vidro com coração
   e floreiras. A porta fica no tile do meio da última fileira (x + floor(w/2), como em mundo/lugares.js). */
(function () {
  var R = window.Reino;
  var D = R.Interiores.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = R._predios.salao;

  function desenharFora(ctx, px, py, w, h) {
    var meio = px + Math.floor(w / 2);                    // meio do prédio (placa e telhado)
    var cx = px + Math.floor(w / 32) * 16 + 8;            // meio do tile da porta
    var yP = py + Math.round(h * 0.34);                    // começo da parede
    var yT = yP + 3, yTb = yP + 12;                        // toldo (em cima e embaixo)
    // parede rosinha com lambri lilás embaixo
    contornoRet(ctx, px + 3, yP, w - 6, py + h - yP, S.ROSA3);
    ret(ctx, px + 4, py + h - 9, w - 8, 8, S.LILAS3); ret(ctx, px + 4, py + h - 9, w - 8, 1, S.LILAS);
    for (var x = px + 6; x < px + w - 6; x += 5) ret(ctx, x, py + h - 7, 1, 5, S.LILAS);
    // telhadinho de escamas lilás (de uma ponta à outra) e a cornija
    ret(ctx, px + 2, yP - 12, w - 4, 12, K); ret(ctx, px + 3, yP - 11, w - 6, 10, S.LILAS);
    for (var j = 0; j < 3; j++) for (x = px + 4 + (j % 2) * 3; x < px + w - 6; x += 6) {
      ret(ctx, x, yP - 9 + j * 3, 4, 1, S.LILAS2); ret(ctx, x + 1, yP - 8 + j * 3, 2, 1, S.LILAS2);
    }
    ret(ctx, px, yP - 2, w, 4, K); ret(ctx, px + 1, yP - 1, w - 2, 2, S.COR); ret(ctx, px + 1, yP - 1, w - 2, 1, S.LILAS);
    // placa arredondada em cima: tesoura e pente, com lampadinhas em volta
    var pw = Math.min(44, w - 24), pxp = meio - Math.floor(pw / 2), ph = Math.max(16, yP - py - 3);
    contornoRet(ctx, pxp, py + 1, pw, ph, C.branco);
    ret(ctx, pxp + 1, py + 2, pw - 2, 2, S.ROSA2);
    for (x = pxp + 3; x < pxp + pw - 2; x += 4) ret(ctx, x, py + ph - 1, 2, 1, (x - pxp) % 8 < 4 ? C.ouro : S.ROSA);
    S.tesoura(ctx, meio - 15, py + 4, S.ROSA);
    S.pente(ctx, meio + 3, py + 7, 12, S.MENTA);
    ret(ctx, meio - 2, py + 5, 3, 1, S.COR2); ret(ctx, meio - 1, py + 4, 1, 3, S.COR2);   // brilhinho
    // vitrines dos dois lados da porta
    var vy = yTb + 2, vh = py + h - 11 - vy;
    var esq = [px + 7, cx - 11], dir = [cx + 11, px + w - 7];
    [esq, dir].forEach(function (v, i) {
      var vw = v[1] - v[0];
      if (vw < 10) return;
      contornoRet(ctx, v[0] - 1, vy - 1, vw + 2, vh + 2, S.LILAS);
      ret(ctx, v[0] + 1, vy + 1, vw - 2, vh - 2, '#d9f3ff'); ret(ctx, v[0] + 2, vy + 2, 1, vh - 5, C.branco);
      var mx = v[0] + Math.floor(vw / 2);
      if (i === 0) {
        // cabeça de manequim com peruca cacheada no suporte
        ret(ctx, mx - 1, vy + vh - 6, 3, 5, K); ret(ctx, mx - 4, vy + vh - 2, 9, 1, K);
        circulo(ctx, mx, vy + vh - 10, 5, K); circulo(ctx, mx, vy + vh - 10, 4, '#8a5a3a');
        ret(ctx, mx - 2, vy + vh - 10, 5, 4, '#f1c7a5'); ret(ctx, mx - 3, vy + vh - 12, 7, 2, '#8a5a3a');
        ret(ctx, mx + 2, vy + vh - 14, 2, 2, S.ROSA);
      } else {
        // vestidinho no cabide
        ret(ctx, mx, vy + 1, 1, 2, K); ret(ctx, mx - 3, vy + 3, 7, 1, K);
        ret(ctx, mx - 2, vy + 4, 5, 5, K); ret(ctx, mx - 1, vy + 4, 3, 4, S.ROSA);
        ret(ctx, mx - 4, vy + 8, 9, 7, K); ret(ctx, mx - 3, vy + 8, 7, 6, S.ROSA); ret(ctx, mx - 3, vy + 12, 7, 1, S.ROSA4);
        ret(ctx, mx, vy + 6, 1, 1, C.ouro);
      }
    });
    // toldo listrado com babadinho redondo
    ret(ctx, px + 2, yT - 1, w - 4, yTb - yT + 2, K);
    for (x = px + 3; x < px + w - 3; x += 6) {
      ret(ctx, x, yT, Math.min(3, px + w - 3 - x), yTb - yT, S.COR2);
      ret(ctx, x + 3, yT, Math.max(0, Math.min(3, px + w - 6 - x)), yTb - yT, C.branco);
    }
    ret(ctx, px + 3, yT, w - 6, 1, D.clarear(S.COR2, 0.4));
    // babadinho: uma pontinha arredondada por listra
    for (x = px + 3; x + 2 < px + w - 3; x += 3) {
      var cor = (x - px - 3) % 6 < 3 ? S.COR2 : C.branco;
      ret(ctx, x, yTb, 3, 1, cor); ret(ctx, x + 1, yTb + 1, 1, 1, cor);
      ret(ctx, x, yTb + 1, 1, 1, K); ret(ctx, x + 2, yTb + 1, 1, 1, K); ret(ctx, x + 1, yTb + 2, 1, 1, K);
    }
    // porta de vidro com coração e maçaneta dourada
    var dy = py + h - 19;
    ret(ctx, cx - 7, dy - 1, 14, 20, K); ret(ctx, cx - 6, dy, 12, 19, S.COR);
    ret(ctx, cx - 5, dy + 1, 10, 12, '#d9f3ff'); ret(ctx, cx - 4, dy + 2, 1, 8, C.branco);
    ret(ctx, cx - 2, dy + 5, 2, 1, S.ROSA); ret(ctx, cx + 1, dy + 5, 2, 1, S.ROSA); ret(ctx, cx - 2, dy + 6, 5, 1, S.ROSA);
    ret(ctx, cx - 1, dy + 7, 3, 1, S.ROSA); ret(ctx, cx, dy + 8, 1, 1, S.ROSA);
    ret(ctx, cx + 3, dy + 14, 2, 2, C.ouro);
    // floreiras ao lado da porta
    [cx - 13, cx + 9].forEach(function (fx) {
      if (fx < px + 4 || fx + 5 > px + w - 4) return;
      ret(ctx, fx, py + h - 6, 5, 5, K); ret(ctx, fx + 1, py + h - 5, 3, 3, C.terracota);
      circulo(ctx, fx + 2, py + h - 8, 2, K); ret(ctx, fx + 1, py + h - 9, 3, 3, C.folha);
      ret(ctx, fx + 1, py + h - 9, 1, 1, S.ROSA); ret(ctx, fx + 3, py + h - 8, 1, 1, C.ouro);
    });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.salao = desenharFora;
})();
