/* Estação dos Caminhos (Geografia): a estação de fora, no mapa (Mapa.PREDIOS.caminhos). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer, brilho = R.Desenho.brilho;
  var K = R.Desenho.K;
  var S = R._predios.geografia;

  /* ================= A ESTAÇÃO DE FORA (mapa) ================= */
  // estação com telhado azul, o globo no alto, antena de rádio, semáforo e placa na calçada; porta roxa no meio da última fileira
  function desenharFora(ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || '#eaf6ff', telhado = cores.telhado || S.AZUL, det = cores.detalhe || S.VERDE;
    var telhado2 = escurecer(telhado, 0.22), telhadoL = clarear(telhado, 0.3), parede2 = escurecer(parede, 0.06);
    var cx = px + w / 2;
    // antena de rádio (atrás, à esquerda) com as ondinhas
    ret(ctx, px + 13, py + 4, 2, 26, K); ret(ctx, px + 13, py + 5, 1, 24, C.metal);
    for (var a = 0; a < 5; a++) { ret(ctx, px + 11 - a, py + 10 + a * 4, 2 + a * 2 + 4, 1, K); }
    circulo(ctx, px + 14, py + 3, 2, S.VERM);
    // corpo da estação com as tábuas
    contornoRet(ctx, px + 6, py + 34, w - 12, h - 34, parede);
    for (var j = py + 40; j < py + h - 2; j += 6) ret(ctx, px + 7, j, w - 14, 1, parede2);
    // telhado azul em duas águas, com as telhas
    triangulo(ctx, px + 1, py + 12, w - 2, 24, K);
    triangulo(ctx, px + 4, py + 15, w - 8, 20, telhado);
    for (var ty = py + 21; ty < py + 34; ty += 4) {
      var meia = Math.round((w - 8) / 2 * (ty - py - 15 + 1) / 20) - 3;
      for (var tx = cx - meia + 1; tx < cx + meia - 2; tx += 5) { ret(ctx, tx, ty, 4, 1, telhado2); ret(ctx, tx + 1, ty - 1, 2, 1, telhadoL); }
    }
    ret(ctx, px + 2, py + 33, w - 4, 3, K); ret(ctx, px + 3, py + 34, w - 6, 1, telhado2);
    // o globo no bico do telhado: oceano azul, continentes verdes e o suporte dourado
    var gy = py + 13;
    ret(ctx, cx - 1, gy + 8, 3, 6, K); ret(ctx, cx - 5, gy + 12, 11, 3, K); ret(ctx, cx - 4, gy + 13, 9, 1, C.ouro);
    circulo(ctx, cx, gy, 10, K); circulo(ctx, cx, gy, 9, '#5fb4ff');
    D.matriz(ctx, cx - 7, gy - 6, [
      '..##..........',
      '.####....###..',
      '.#####..#####.',
      '..###....###..',
      '...##.....#...',
      '....#.........',
      '.........##...',
      '........####..',
      '.........##...'], { '#': det });
    ret(ctx, cx - 5, gy - 7, 2, 1, C.branco); ret(ctx, cx - 7, gy - 5, 1, 2, C.branco);
    ret(ctx, cx - 11, gy - 1, 1, 3, C.ouro2); ret(ctx, cx + 11, gy - 1, 1, 3, C.ouro2);
    // faixa verde com as janelinhas de bilheteria
    var ay = py + 37;
    ret(ctx, px + 7, ay, w - 14, 4, K); ret(ctx, px + 8, ay + 1, w - 16, 2, det);
    [[px + 11, py + 45], [px + w - 27, py + 45]].forEach(function (jw) {
      contornoRet(ctx, jw[0], jw[1], 16, 12, '#bfe9ff');
      ret(ctx, jw[0] + 7, jw[1] + 1, 1, 10, K); ret(ctx, jw[0] + 1, jw[1] + 5, 14, 1, K);
      ret(ctx, jw[0] + 2, jw[1] + 2, 2, 2, C.branco);
      ret(ctx, jw[0] - 1, jw[1] + 12, 18, 2, K); ret(ctx, jw[0], jw[1] + 12, 16, 1, det);
    });
    // relógio redondo em cima da porta
    circulo(ctx, cx, py + 44, 4, K); circulo(ctx, cx, py + 44, 3, C.creme);
    ret(ctx, cx, py + 42, 1, 2, K); ret(ctx, cx, py + 44, 2, 1, K);
    // degrau de pedra e a porta roxa de arco com moldura dourada (como todas as entradas do reino)
    ret(ctx, cx - 12, py + h - 5, 25, 5, K); ret(ctx, cx - 11, py + h - 4, 23, 3, '#e8d3a8');
    ret(ctx, cx - 11, py + h - 4, 23, 1, '#fff0d0'); ret(ctx, cx - 11, py + h - 2, 23, 1, '#d4bc8c');
    var dx = cx - 7, dy = py + h - 26, dw = 14, dh = 21, roxo = '#7c5cff';
    ret(ctx, dx - 1, dy + 2, dw + 2, dh - 2, C.ouro); elipse(ctx, dx + dw / 2 - 0.5, dy + 3, dw / 2, 3, C.ouro);
    ret(ctx, dx, dy + 3, dw, dh - 3, roxo); elipse(ctx, dx + dw / 2 - 0.5, dy + 4, dw / 2 - 1, 3, roxo);
    ret(ctx, dx + dw / 2 - 1, dy + 5, 1, dh - 5, escurecer(roxo, 0.25));
    ret(ctx, dx + 1, dy + 6, 1, dh - 7, clarear(roxo, 0.3));
    ret(ctx, dx + dw - 4, dy + dh / 2 + 2, 2, 2, C.ouro);
    // sombra de 2 px na base
    ret(ctx, px + 7, py + h, w - 14, 1, 'rgba(58,36,70,0.28)'); ret(ctx, px + 9, py + h + 1, w - 18, 1, 'rgba(58,36,70,0.14)');
    // semáforo na calçada (esquerda) e a caixa de correio amarela (direita)
    var sx = px + 3, sb = py + h - 1;
    ret(ctx, sx + 2, sb - 14, 2, 14, K); ret(ctx, sx + 2, sb - 13, 1, 12, C.metal);
    contornoRet(ctx, sx, sb - 26, 7, 13, S.CINZA);
    circulo(ctx, sx + 3, sb - 23, 1, S.VERM); circulo(ctx, sx + 3, sb - 19, 1, S.AMAR); circulo(ctx, sx + 3, sb - 15, 1, S.VERDE);
    var mx = px + w - 12, mb = py + h - 1;
    ret(ctx, mx + 3, mb - 5, 2, 5, K);
    contornoRet(ctx, mx, mb - 14, 8, 10, S.AMAR); ret(ctx, mx + 2, mb - 11, 4, 1, K); ret(ctx, mx + 1, mb - 7, 6, 2, S.AZUL);
    // brilhinhos
    [[5, 36], [75, 30]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.caminhos = desenharFora;
})();
