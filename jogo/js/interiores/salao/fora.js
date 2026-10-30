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

  // poste listrado de salão (rosa e branco em degraus) com a bolinha dourada; x = esquerda, yb = chão
  function poste(ctx, x, yb) {
    ret(ctx, x - 1, yb, 8, 1, 'rgba(58,36,70,0.2)');
    ret(ctx, x, yb - 4, 6, 4, K); ret(ctx, x + 1, yb - 3, 4, 2, S.LILAS);
    ret(ctx, x + 1, yb - 22, 4, 18, K); ret(ctx, x + 2, yb - 21, 2, 16, C.branco);
    for (var j = 0; j < 16; j += 4) ret(ctx, x + 2 + ((j >> 2) % 2), yb - 21 + j, 1, 3, S.COR2);
    ret(ctx, x + 2, yb - 21, 1, 16, 'rgba(255,255,255,0.6)');
    circulo(ctx, x + 3, yb - 25, 3, K); circulo(ctx, x + 3, yb - 25, 2, C.ouro); ret(ctx, x + 2, yb - 26, 1, 1, C.ouro3);
  }
  var V;   // Mapa.fachada.kit, lido na hora de desenhar
  function desenharFora(ctx, px, py, w, h) {
    V = window.Mapa.fachada.kit;
    px += window.Mapa.fachada.desvio(w);                   // largura par: o desenho anda até a porta (D2A-12)
    var meio = px + Math.floor(w / 2);                    // meio do prédio (placa e telhado)
    var cx = meio;                                        // meio do tile da porta
    var yP = py + Math.round(h * 0.34);                    // começo da parede
    var yT = yP + 3, yTb = yP + 12;                        // toldo (em cima e embaixo)
    // parede rosinha com lambri lilás embaixo
    contornoRet(ctx, px + 3, yP, w - 6, py + h - yP, S.ROSA3);
    ret(ctx, px + 4, py + h - 9, w - 8, 8, S.LILAS3); ret(ctx, px + 4, py + h - 9, w - 8, 1, S.LILAS);
    for (var x = px + 6; x < px + w - 6; x += 5) ret(ctx, x, py + h - 7, 1, 5, S.LILAS);
    V.reboco(ctx, px + 4, yP + 1, w - 8, py + h - yP - 10, S.ROSA3);
    V.volume(ctx, px + 4, yP + 1, w - 8, py + h - yP - 10);
    V.fundacao(ctx, px + 4, py + h - 6, w - 8, 5, '#cdb2c8');
    // telhadinho de escamas lilás (de uma ponta à outra) e a cornija
    ret(ctx, px + 2, yP - 12, w - 4, 12, K);
    V.telhadoRet(ctx, px + 3, yP - 11, w - 6, 10, S.LILAS);
    ret(ctx, px + 3, yP - 11, w - 6, 1, D.clarear(S.LILAS, 0.55));                       // cumeeira com brilho
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
      V.fundoJanela(ctx, v[0] - 1, vy - 1, vw + 2, vh + 2);
      for (var rd = 0; rd < Math.min(vw, vh) - 5; rd++) { ret(ctx, v[0] + vw - 3 - rd, vy + 2 + rd, 1, 1, C.branco); ret(ctx, v[0] + vw - 2 - rd, vy + 2 + rd, 1, 1, '#bfe9ff'); }
      ret(ctx, v[0] - 2, vy + vh + 1, vw + 4, 2, K); ret(ctx, v[0] - 1, vy + vh + 1, vw + 2, 1, S.LILAS3);   // peitoril
      ret(ctx, v[0] - 1, vy + vh + 3, vw + 2, 1, 'rgba(58,36,70,0.25)');
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
    for (x = px + 3; x < px + w - 3; x += 6) ret(ctx, x, yT + 1, 1, yTb - yT - 1, 'rgba(58,36,70,0.14)');   // dobras
    ret(ctx, px + 4, yTb + 3, w - 8, 1, 'rgba(58,36,70,0.18)');                                     // sombra do toldo
    // babadinho: uma pontinha arredondada por listra
    for (x = px + 3; x + 2 < px + w - 3; x += 3) {
      var cor = (x - px - 3) % 6 < 3 ? S.COR2 : C.branco;
      ret(ctx, x, yTb, 3, 1, cor); ret(ctx, x + 1, yTb + 1, 1, 1, cor);
      ret(ctx, x, yTb + 1, 1, 1, K); ret(ctx, x + 2, yTb + 1, 1, 1, K); ret(ctx, x + 1, yTb + 2, 1, 1, K);
    }
    // porta padrão (arco, moldura dourada, maçaneta e degrau: Mapa.fachada.entrada) com o vidro e o coração
    V.degraus(ctx, cx, py + h, 26);
    var fo = window.Mapa.fachada.entrada(ctx, cx, py + h, S.COR, C.ouro), dy = fo.y + 3;
    V.capacho(ctx, cx, py + h, S.ROSA);
    ret(ctx, cx - 5, dy, 10, 9, '#d9f3ff'); ret(ctx, cx - 4, dy + 1, 1, 6, C.branco);
    ret(ctx, cx - 2, dy + 2, 2, 1, S.ROSA); ret(ctx, cx + 1, dy + 2, 2, 1, S.ROSA); ret(ctx, cx - 2, dy + 3, 5, 1, S.ROSA);
    ret(ctx, cx - 1, dy + 4, 3, 1, S.ROSA); ret(ctx, cx, dy + 5, 1, 1, S.ROSA);
    // o poste listrado do salão
    poste(ctx, px - 9, py + h);
    // floreiras ao lado da porta
    [cx - 14, cx + 9].forEach(function (fx) {
      if (fx < px + 4 || fx + 5 > px + w - 4) return;
      ret(ctx, fx, py + h - 6, 5, 5, K); ret(ctx, fx + 1, py + h - 5, 3, 3, C.terracota);
      circulo(ctx, fx + 2, py + h - 8, 2, K); ret(ctx, fx + 1, py + h - 9, 3, 3, C.folha);
      ret(ctx, fx + 1, py + h - 9, 1, 1, S.ROSA); ret(ctx, fx + 3, py + h - 8, 1, 1, C.ouro);
    });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.salao = desenharFora;
})();
