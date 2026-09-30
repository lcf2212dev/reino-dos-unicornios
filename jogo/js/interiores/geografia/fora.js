/* Estação dos Caminhos (Geografia): a estação de fora, no mapa (Mapa.PREDIOS.caminhos). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer, brilho = R.Desenho.brilho;
  var K = R.Desenho.K;
  var S = R._predios.geografia;

  /* ================= A ESTAÇÃO DE FORA (mapa) ================= */
  // estação com telhado azul, o globo no alto (continentes sempre verdes), antena de rádio, semáforo e placa na calçada; porta roxa no meio da última fileira
  function desenharFora(ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || '#eaf6ff', telhado = cores.telhado || S.AZUL, det = '#f0a04a';   // toldos e faixa em âmbar (--ambar): contrastam com o telhado verde da matéria
    var telhado2 = escurecer(telhado, 0.22);
    var cx = px + w / 2, Fa = window.Mapa.fachada;
    // antena de rádio (atrás, à esquerda) com as ondinhas
    ret(ctx, px + 13, py + 4, 2, 26, K); ret(ctx, px + 13, py + 5, 1, 24, C.metal);
    for (var a = 0; a < 5; a++) { ret(ctx, px + 11 - a, py + 10 + a * 4, 2 + a * 2 + 4, 1, K); }
    circulo(ctx, px + 14, py + 3, 2, S.VERM);
    // corpo da estação com as tábuas
    contornoRet(ctx, px + 6, py + 34, w - 12, h - 34, parede);
    Fa.tabuas(ctx, px + 7, py + 35, w - 14, h - 36, parede, true);
    Fa.pedras(ctx, px + 7, py + h - 6, w - 14, 5, '#e6dccb');
    ret(ctx, px + 7, py + h - 7, w - 14, 1, K);
    ret(ctx, px + w - 13, py + 35, 6, h - 42, 'rgba(47,143,214,0.08)');
    // telhado azul em duas águas, com as telhas
    triangulo(ctx, px + 1, py + 12, w - 2, 24, K);
    triangulo(ctx, px + 4, py + 15, w - 8, 20, telhado);
    Fa.telhas(ctx, px + 4, py + 15, w - 8, 20, telhado, 4);
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
      '.........##...'], { '#': S.VERDE });
    ret(ctx, cx - 5, gy - 7, 2, 1, C.branco); ret(ctx, cx - 7, gy - 5, 1, 2, C.branco);
    ret(ctx, cx - 11, gy - 1, 1, 3, C.ouro2); ret(ctx, cx + 11, gy - 1, 1, 3, C.ouro2);
    // faixa verde com as janelinhas de bilheteria
    var ay = py + 37;
    ret(ctx, px + 7, ay, w - 14, 4, K); ret(ctx, px + 8, ay + 1, w - 16, 2, det);
    Fa.toldo(ctx, px + 10, py + 42, 18, det, C.branco, 3);
    Fa.toldo(ctx, px + w - 28, py + 42, 18, det, C.branco, 3);
    Fa.janela(ctx, px + 11, py + 47, 16, 11, { floreira: '#ff7eb6' });
    Fa.janela(ctx, px + w - 27, py + 47, 16, 11, { floreira: S.AMAR });
    // relógio redondo em cima da porta
    circulo(ctx, cx, py + 44, 4, K); circulo(ctx, cx, py + 44, 3, C.creme);
    ret(ctx, cx, py + 42, 1, 2, K); ret(ctx, cx, py + 44, 2, 1, K);
    // degrau de pedra e a porta roxa de arco com moldura dourada (como todas as entradas do reino)
    Fa.degrau(ctx, cx, py + h - 5, 25, 5);
    Fa.porta(ctx, cx - 7, py + h - 26, 14, 21, '#7c5cff');
    // semáforo na calçada (esquerda) e a caixa de correio amarela (direita)
    var sx = px + 3, sb = py + h - 1;
    ret(ctx, sx + 2, sb - 14, 2, 14, K); ret(ctx, sx + 2, sb - 13, 1, 12, C.metal);
    contornoRet(ctx, sx, sb - 26, 7, 13, S.CINZA);
    circulo(ctx, sx + 3, sb - 23, 1, S.VERM); circulo(ctx, sx + 3, sb - 19, 1, S.AMAR); circulo(ctx, sx + 3, sb - 15, 1, S.VERDE);
    ret(ctx, sx + 1, sb - 25, 5, 1, clarear(S.CINZA, 0.4));
    var mx = px + w - 12, mb = py + h - 1;
    ret(ctx, mx + 3, mb - 5, 2, 5, K);
    contornoRet(ctx, mx, mb - 14, 8, 10, S.AMAR); ret(ctx, mx + 2, mb - 11, 4, 1, K); ret(ctx, mx + 1, mb - 7, 6, 2, S.AZUL);
    // brilhinhos
    [[5, 36], [75, 30]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  // o semáforo troca de luz (vermelho, amarelo, verde): as outras duas ficam apagadas (camada animada do mapa)
  function animarFora(ctx, px, py, w, h, t) {
    var acesa = Math.floor(t / 1500) % 3, sx = px + 3, sb = py + h - 1;
    [sb - 23, sb - 19, sb - 15].forEach(function (y, i) { if (i !== acesa) circulo(ctx, sx + 3, y, 1, '#4a4a5a'); });
  }
  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS.caminhos = desenharFora;
    if (Mapa.PREDIOS_ANIM) Mapa.PREDIOS_ANIM.caminhos = animarFora;
  }
})();
