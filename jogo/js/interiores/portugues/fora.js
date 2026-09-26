/* Casa das Palavras, parte 6 de 6: a casa de fora, no mapa (Mapa.PREDIOS.palavras). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.portugues;
  var CREME = S.CREME, VERM = S.VERM, VERDE = S.VERDE, MORANGO = S.MORANGO, brilho = S.brilho, livrinho = S.livrinho;

  /* ================= A CASA DE FORA (mapa) ================= */
  // casinha de cozinha com chaminé, o livro aberto "Aa" no telhado e a flâmula do lápis; porta roxa no meio da última fileira
  function desenharFora(ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || CREME, telhado = cores.telhado || VERM, det = cores.detalhe || VERDE;
    var parede2 = '#f3dccb', telhado2 = escurecer(telhado, 0.22), telhadoL = clarear(telhado, 0.3), det2 = escurecer(det, 0.25);
    var cx = px + w / 2;
    // chaminé de tijolinho (atrás do telhado, à direita) com a fumacinha parada
    ret(ctx, px + 55, py + 6, 11, 20, K); ret(ctx, px + 56, py + 7, 9, 19, '#d9785a');
    for (var tj = py + 9; tj < py + 24; tj += 3) ret(ctx, px + 56 + ((tj / 3) % 2 ? 0 : 4), tj, 4, 1, '#b85a40');
    ret(ctx, px + 54, py + 4, 13, 4, K); ret(ctx, px + 55, py + 5, 11, 2, '#e8957a');
    [[61, 1, 3], [65, -4, 4], [60, -8, 3]].forEach(function (f) { circulo(ctx, px + f[0], py + f[1], f[2], '#f1eef8'); ret(ctx, px + f[0] - 1, py + f[1] - 1, 1, 1, C.branco); });
    // corpo da casa com as tábuas
    contornoRet(ctx, px + 6, py + 34, w - 12, h - 34, parede);
    for (var j = py + 40; j < py + h - 2; j += 6) ret(ctx, px + 7, j, w - 14, 1, parede2);
    ret(ctx, px + w - 14, py + 35, 7, h - 36, '#f7e6da');
    // telhado vermelho com fileiras de telhas redondinhas
    triangulo(ctx, px + 1, py + 8, w - 2, 28, K);
    triangulo(ctx, px + 4, py + 11, w - 8, 24, telhado);
    for (var ty = py + 17; ty < py + 34; ty += 4) {
      var meia = Math.round((w - 8) / 2 * (ty - py - 11 + 1) / 24) - 3;
      for (var tx = cx - meia + 1; tx < cx + meia - 2; tx += 5) { ret(ctx, tx, ty, 4, 1, telhado2); ret(ctx, tx + 1, ty - 1, 2, 1, telhadoL); }
    }
    ret(ctx, px + 2, py + 33, w - 4, 3, K); ret(ctx, px + 3, py + 34, w - 6, 1, telhado2);
    // livro aberto no telhado (a placa da casa), com o "Aa" grandão: capa vermelha, páginas e a fitinha
    var LA = ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'];
    var La = ['.##.', '...#', '.###', '#..#', '.###'];
    ret(ctx, cx - 14, py + 18, 29, 12, K); ret(ctx, cx - 13, py + 19, 27, 10, telhado2);
    ret(ctx, cx - 12, py + 16, 25, 12, K);
    ret(ctx, cx - 11, py + 17, 11, 10, C.creme); ret(ctx, cx + 1, py + 17, 11, 10, C.creme);
    ret(ctx, cx - 11, py + 17, 3, 1, '#fffaf2'); ret(ctx, cx + 9, py + 17, 3, 1, '#fffaf2');
    ret(ctx, cx - 1, py + 16, 3, 1, K); ret(ctx, cx - 2, py + 17, 1, 10, '#e8d8c0'); ret(ctx, cx + 2, py + 17, 1, 10, '#e8d8c0');
    ret(ctx, cx, py + 17, 1, 11, K);
    D.matriz(ctx, cx - 9, py + 19, LA, { '#': telhado });
    D.matriz(ctx, cx + 4, py + 21, La, { '#': det2 });
    ret(ctx, cx - 10, py + 27, 21, 1, '#e8d8c0');
    ret(ctx, cx + 1, py + 28, 1, 4, '#ffd34d'); ret(ctx, cx + 1, py + 31, 1, 1, '#e0a020');
    // flâmula amarela com um lápis, no bico do telhado (3 px mais baixa: a placa do nome não tampa a ponta do mastro)
    var fy = py + 3;
    ret(ctx, cx - 1, fy - 5, 2, py + 10 - (fy - 5), K); ret(ctx, cx - 1, fy - 4, 1, py + 9 - (fy - 4), '#c9a27a');
    circulo(ctx, cx - 1, fy - 6, 1, C.ouro);
    for (var fi = 0; fi < 14; fi++) {
      var meiaF = Math.max(0, Math.round(4 * (1 - fi / 14))), fx = cx + 1 + fi;
      ret(ctx, fx, fy - 1 - meiaF - 1, 1, meiaF * 2 + 3, K);
      if (meiaF > 0) { ret(ctx, fx, fy - 1 - meiaF, 1, meiaF * 2 + 1, '#ffd34d'); ret(ctx, fx, fy - 1 - meiaF, 1, 1, '#fff0a0'); }
    }
    // o lápis: borracha rosa, corpo laranja, madeira e a ponta
    ret(ctx, cx + 2, fy - 2, 1, 3, '#ff9cc6'); ret(ctx, cx + 3, fy - 2, 1, 3, '#c9c2d8');
    ret(ctx, cx + 4, fy - 2, 4, 3, '#ff7a3a'); ret(ctx, cx + 4, fy - 1, 4, 1, '#ffb070');
    ret(ctx, cx + 8, fy - 2, 1, 3, '#f3c890'); ret(ctx, cx + 9, fy - 1, 1, 1, K);
    // toldo listrado verde e creme em cima da porta e das janelas
    var ay = py + 37;
    ret(ctx, px + 9, ay, w - 18, 6, K);
    for (var i = px + 10, k = 0; i < px + w - 10; i += 4, k++) ret(ctx, i, ay + 1, 4, 4, k % 2 ? C.branco : det);
    for (var s = px + 10, k2 = 0; s < px + w - 10; s += 4, k2++) { ret(ctx, s, ay + 5, 4, 2, K); ret(ctx, s + 1, ay + 5, 2, 1, k2 % 2 ? C.branco : det); }
    // janela da cozinha (esquerda) com a torta esfriando e a cortininha
    var jx = px + 10, jy = py + 47;
    contornoRet(ctx, jx, jy, 16, 13, '#bfe9ff');
    ret(ctx, jx + 1, jy + 1, 14, 3, '#ff9cc6'); for (var c = jx + 2; c < jx + 15; c += 3) ret(ctx, c, jy + 4, 1, 1, '#ff9cc6');
    ret(ctx, jx + 2, jy + 5, 3, 3, C.branco);
    ret(ctx, jx - 1, jy + 13, 18, 3, K); ret(ctx, jx, jy + 13, 16, 1, det);
    ret(ctx, jx + 3, jy + 10, 10, 3, K); ret(ctx, jx + 4, jy + 10, 8, 2, '#e8a060'); ret(ctx, jx + 5, jy + 10, 2, 1, MORANGO); ret(ctx, jx + 9, jy + 10, 2, 1, MORANGO);
    // janela redonda (direita) com uma xícara
    var rx = px + 62, ry = py + 52;
    circulo(ctx, rx, ry, 7, K); circulo(ctx, rx, ry, 6, det); circulo(ctx, rx, ry, 4, K); circulo(ctx, rx, ry, 3, '#eef9ff');
    ret(ctx, rx - 2, ry, 4, 3, '#ff7eb6'); ret(ctx, rx + 2, ry + 1, 1, 1, '#ff7eb6'); ret(ctx, rx - 1, ry - 2, 1, 1, C.branco);
    // degrau de pedra e a porta roxa de arco com moldura dourada (como todas as entradas do reino)
    ret(ctx, cx - 12, py + h - 5, 25, 5, K); ret(ctx, cx - 11, py + h - 4, 23, 3, '#e8d3a8');
    ret(ctx, cx - 11, py + h - 4, 23, 1, '#fff0d0'); ret(ctx, cx - 11, py + h - 2, 23, 1, '#d4bc8c');
    for (var dg = cx - 7; dg < cx + 11; dg += 6) ret(ctx, dg, py + h - 3, 1, 2, '#c9ae80');
    var dx = cx - 7, dy = py + h - 26, dw = 14, dh = 21, roxo = '#7c5cff';
    ret(ctx, dx - 1, dy + 2, dw + 2, dh - 2, C.ouro); elipse(ctx, dx + dw / 2 - 0.5, dy + 3, dw / 2, 3, C.ouro);
    ret(ctx, dx, dy + 3, dw, dh - 3, roxo); elipse(ctx, dx + dw / 2 - 0.5, dy + 4, dw / 2 - 1, 3, roxo);
    ret(ctx, dx + dw / 2 - 1, dy + 5, 1, dh - 5, escurecer(roxo, 0.25));
    ret(ctx, dx + 1, dy + 6, 1, dh - 7, clarear(roxo, 0.3));
    ret(ctx, dx + dw - 4, dy + dh / 2 + 2, 2, 2, C.ouro);
    // sombra de 2 px na base da casa
    ret(ctx, px + 7, py + h, w - 14, 1, 'rgba(58,36,70,0.28)'); ret(ctx, px + 9, py + h + 1, w - 18, 1, 'rgba(58,36,70,0.14)');
    // pilha de livros ao lado da porta (esquerda) e um vaso de hortelã (direita)
    var lx = px + 12, lb = py + h - 2;
    livrinho(ctx, lx, lb, 14, 5, '#5fb4ff'); livrinho(ctx, lx + 1, lb - 4, 12, 5, '#ffd34d'); livrinho(ctx, lx + 2, lb - 8, 11, 5, '#ff7eb6');
    livrinho(ctx, lx + 3, lb - 12, 8, 5, det);
    var vx = px + w - 20, vb = py + h - 2;
    ret(ctx, vx, vb - 7, 9, 7, K); ret(ctx, vx + 1, vb - 6, 7, 5, C.terracota); ret(ctx, vx - 1, vb - 8, 11, 2, K);
    [[1, -12], [4, -14], [7, -12], [3, -10], [6, -10]].forEach(function (f) { ret(ctx, vx + f[0], vb + f[1], 2, 3, K); ret(ctx, vx + f[0], vb + f[1], 1, 2, '#6fdc8c'); });
    // brilhinhos
    [[4, 30], [76, 40]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.palavras = desenharFora;
})();
