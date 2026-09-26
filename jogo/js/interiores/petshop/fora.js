/* Pet Shop, parte 5 de 5: o prédio de fora, no mapa (Mapa.PREDIOS.petshop, 80 × 64 px). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.petshop;
  var MENTA = S.MENTA, ROSA2 = S.ROSA2, MAD = S.MAD, LAR = S.LAR, VERM = S.VERM, AGUA = S.AGUA, AGUA2 = S.AGUA2,
      brilho = S.brilho, cenoura = S.cenoura, maca = S.maca, fardo = S.fardo, coracao = S.coracao;

  /* ================= DE FORA: o prédio no mapa (80 × 64 px) ================= */
  function desenharFora(ctx, px, py, w, h) {
    var cx = px + 40;                      // meio do tile da porta (tile 4 de 2..6)
    var parede = '#fff4e6', parede2 = '#f3dcc0', telhado = '#4fbfae', telhado2 = '#2f9e90';
    // corpo da loja com tábuas
    contornoRet(ctx, px + 4, py + 24, w - 8, h - 24, parede);
    for (var j = py + 29; j < py + h - 2; j += 5) ret(ctx, px + 5, j, w - 10, 1, parede2);
    ret(ctx, px + w - 12, py + 25, 7, h - 26, '#f6e6d0');
    // telhado de telhas menta com beiral
    triangulo(ctx, px, py + 4, w, 23, K);
    triangulo(ctx, px + 3, py + 7, w - 6, 19, telhado);
    for (var tj = py + 13; tj < py + 25; tj += 4) {
      var meia = Math.round((w - 6) / 2 * (tj - py - 7 + 1) / 19) - 3;
      for (var tx = cx - meia + 2; tx < cx + meia - 2; tx += 6) ret(ctx, tx, tj, 3, 1, telhado2);
    }
    ret(ctx, px + 1, py + 23, w - 2, 3, K); ret(ctx, px + 2, py + 24, w - 4, 1, telhado2);
    // placa da patinha no telhado: plaquinha redonda clarinha com uma patinha escura e bem marcada
    // (4 dedinhos separados + almofada), que se lê mesmo em 1× e não vira carinha de porquinho
    var PATA = '#7a2a66';
    circulo(ctx, cx, py + 14, 8, K); circulo(ctx, cx, py + 14, 7, C.branco);
    // 4 dedinhos do mesmo tamanho em arco (os do meio mais altos), bem separados da almofada
    ret(ctx, cx - 2, py + 10, 2, 2, PATA); ret(ctx, cx + 1, py + 10, 2, 2, PATA);
    ret(ctx, cx - 5, py + 12, 2, 2, PATA); ret(ctx, cx + 4, py + 12, 2, 2, PATA);
    // almofada: gota larga, estreita em cima e arredondada embaixo
    ret(ctx, cx - 1, py + 14, 3, 1, PATA); ret(ctx, cx - 2, py + 15, 5, 1, PATA);
    ret(ctx, cx - 3, py + 16, 7, 2, PATA); ret(ctx, cx - 2, py + 18, 5, 1, PATA);
    // ossinho de cata-vento no topo
    ret(ctx, cx, py - 2, 1, 7, K);
    ret(ctx, cx - 4, py - 3, 9, 3, K); ret(ctx, cx - 3, py - 2, 7, 1, C.creme); ret(ctx, cx - 5, py - 4, 2, 2, K); ret(ctx, cx + 4, py - 4, 2, 2, K); ret(ctx, cx - 5, py - 1, 2, 2, K); ret(ctx, cx + 4, py - 1, 2, 2, K);
    // toldo listrado rosa e branco com babadinho
    var ty = py + 27;
    ret(ctx, px + 6, ty, w - 12, 8, K);
    for (var i = px + 7, k = 0; i < px + w - 7; i += 4, k++) ret(ctx, i, ty + 1, 4, 6, k % 2 ? C.branco : ROSA2);
    for (var s = px + 7, k2 = 0; s < px + w - 7; s += 4, k2++) { ret(ctx, s, ty + 7, 4, 2, K); ret(ctx, s + 1, ty + 7, 2, 1, k2 % 2 ? C.branco : ROSA2); }
    // vitrine grande (esquerda): aquário, cenouras e maçã
    var vx = px + 8, vy = py + 39;
    contornoRet(ctx, vx, vy, 22, 16, '#d9f3ff');
    ret(ctx, vx + 1, vy + 1, 20, 3, '#eef9ff'); ret(ctx, vx + 2, vy + 2, 4, 1, C.branco);
    ret(ctx, vx + 2, vy + 6, 9, 8, K); ret(ctx, vx + 3, vy + 7, 7, 6, AGUA); ret(ctx, vx + 3, vy + 7, 7, 1, AGUA2);
    ret(ctx, vx + 5, vy + 9, 3, 2, LAR); ret(ctx, vx + 4, vy + 9, 1, 2, LAR);
    cenoura(ctx, vx + 13, vy + 14); cenoura(ctx, vx + 16, vy + 14);
    maca(ctx, vx + 18, vy + 7);
    ret(ctx, vx - 1, vy + 16, 24, 3, K); ret(ctx, vx, vy + 16, 22, 1, MAD);
    [[3, '#ff7eb6'], [9, '#ffd34d'], [15, '#b58cff'], [20, '#ff7eb6']].forEach(function (f) {
      ret(ctx, vx + f[0] - 1, vy + 18, 3, 1, f[1]); ret(ctx, vx + f[0], vy + 17, 1, 3, f[1]); ret(ctx, vx + f[0], vy + 18, 1, 1, C.ouro3);
    });
    // janela redonda (direita) com o bolo arco-íris
    var jx = px + 60, jy = py + 45;
    circulo(ctx, jx, jy, 8, K); circulo(ctx, jx, jy, 7, MAD); circulo(ctx, jx, jy, 5, K); circulo(ctx, jx, jy, 4, '#eef9ff');
    ['#ff7eb6', '#ffd34d', '#6fdc8c', '#5fb4ff'].forEach(function (c, i) { ret(ctx, jx - 3, jy + 2 - i, 7, 1, c); });
    ret(ctx, jx - 3, jy - 3, 7, 1, C.branco); ret(ctx, jx, jy - 4, 1, 1, VERM);
    // porta com arco e janelinha de coração
    var dx = cx - 7, dy = py + h - 22;
    ret(ctx, dx - 1, dy + 2, 16, 20, C.ouro); elipse(ctx, dx + 7, dy + 3, 8, 3, C.ouro);
    ret(ctx, dx, dy + 3, 14, 19, LAR); elipse(ctx, dx + 7, dy + 4, 7, 3, LAR);
    ret(ctx, dx + 1, dy + 5, 12, 1, '#ffb070');
    ret(ctx, dx + 6, dy + 5, 1, 17, '#d96a2a');
    coracao(ctx, dx + 5, dy + 7, C.creme);
    ret(ctx, dx + 10, dy + 13, 2, 2, C.ouro);
    // tapetinho da porta
    ret(ctx, cx - 6, py + h - 2, 13, 2, K); ret(ctx, cx - 5, py + h - 2, 11, 1, MENTA);
    // saco de feno e potinho de água do lado de fora
    fardo(ctx, px + 49, py + h - 2, 10, 8);
    var bx = px + 68, by = py + h - 5;
    elipse(ctx, bx, by, 5, 3, K); elipse(ctx, bx, by, 4, 2, '#5fb4ff'); ret(ctx, bx - 3, by - 2, 7, 1, AGUA2);
    // brilhinhos
    [[6, 34], [74, 36]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.petshop = desenharFora;
})();
