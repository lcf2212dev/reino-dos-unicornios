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


  // casinha de cachorro com o osso na plaquinha e o potinho de ração; x = esquerda, yb = chão
  function casinha(ctx, x, yb) {
    ret(ctx, x - 1, yb, 16, 1, 'rgba(58,36,70,0.2)');
    contornoRet(ctx, x, yb - 10, 14, 10, '#f2b27a');
    ret(ctx, x + 1, yb - 9, 1, 8, '#ffd0a0'); ret(ctx, x + 11, yb - 9, 2, 8, '#d98d58');
    ret(ctx, x + 1, yb - 6, 12, 1, '#d98d58'); ret(ctx, x + 1, yb - 3, 12, 1, '#d98d58');
    ret(ctx, x + 4, yb - 7, 6, 7, K); ret(ctx, x + 5, yb - 6, 4, 6, '#5a3550'); ret(ctx, x + 5, yb - 8, 4, 1, K);
    triangulo(ctx, x - 2, yb - 19, 18, 10, K); triangulo(ctx, x, yb - 17, 14, 7, VERM);
    ret(ctx, x - 2, yb - 11, 18, 2, K); ret(ctx, x - 1, yb - 11, 16, 1, D.escurecer(VERM, 0.2));
    ret(ctx, x + 6, yb - 15, 2, 3, D.clarear(VERM, 0.35));
    // ossinho na plaquinha da porta
    ret(ctx, x + 5, yb - 10, 4, 1, C.branco); ret(ctx, x + 4, yb - 10, 1, 1, C.creme); ret(ctx, x + 9, yb - 10, 1, 1, C.creme);
  }

  /* ================= DE FORA: o prédio no mapa (80 × 64 px) ================= */
  var V;   // Mapa.fachada.kit, lido na hora de desenhar
  function desenharFora(ctx, px, py, w, h) {
    V = window.Mapa.fachada.kit;
    var cx = px + 40;                      // meio do tile da porta (tile 4 de 2..6)
    var parede = '#fff4e6', telhado = '#4fbfae', telhado2 = '#2f9e90', Fa = window.Mapa.fachada;
    // corpo da loja com tábuas
    contornoRet(ctx, px + 4, py + 24, w - 8, h - 24, parede);
    V.tabuas(ctx, px + 5, py + 25, w - 10, h - 26, parede);
    V.volume(ctx, px + 5, py + 25, w - 10, h - 31);
    V.fundacao(ctx, px + 5, py + h - 6, w - 10, 5, '#d6bfa6');
    // telhado de telhas menta com beiral
    triangulo(ctx, px, py + 4, w, 23, K);
    V.telhado(ctx, px + 3, py + 7, w - 6, 19, telhado, 4);
    V.beiral(ctx, px + 1, py + 23, w - 2, telhado2);
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
    for (var s = px + 7, k2 = 0; s < px + w - 7; s += 4, k2++) {
      ret(ctx, s, ty + 7, 4, 2, K); ret(ctx, s + 1, ty + 7, 2, 1, k2 % 2 ? C.branco : ROSA2);
      ret(ctx, s, ty + 1, 1, 6, 'rgba(58,36,70,0.12)');                       // dobra de cada listra
    }
    ret(ctx, px + 7, ty + 1, w - 14, 1, 'rgba(255,255,255,0.5)');
    ret(ctx, px + 5, ty + 9, w - 10, 2, 'rgba(58,36,70,0.15)');              // sombra do toldo na parede
    // vitrine grande (esquerda): aquário, cenouras e maçã
    var vx = px + 8, vy = py + 39;
    contornoRet(ctx, vx, vy, 22, 16, '#d9f3ff');
    ret(ctx, vx + 1, vy + 1, 20, 3, '#eef9ff'); V.fundoJanela(ctx, vx - 1, vy - 1, 24, 18);
    for (var rd = 0; rd < 7; rd++) { ret(ctx, vx + 19 - rd, vy + 2 + rd, 1, 1, rd % 3 === 2 ? '#bfe9ff' : C.branco); ret(ctx, vx + 20 - rd, vy + 2 + rd, 1, 1, '#bfe9ff'); }
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
    // porta laranja padrão (arco, moldura dourada, maçaneta e degrau: Mapa.fachada.entrada) com o coração
    V.degraus(ctx, cx, py + h, 26);
    var fo = Fa.entrada(ctx, cx, py + h, LAR, C.ouro);
    V.capacho(ctx, cx, py + h, VERM);
    coracao(ctx, cx - 3, fo.y + 4, C.creme);
    // saco de feno e potinho de água do lado de fora
    fardo(ctx, px + 49, py + h - 2, 10, 8);
    var bx = px + 68, by = py + h - 5;
    elipse(ctx, bx, by, 5, 3, K); elipse(ctx, bx, by, 4, 2, '#5fb4ff'); ret(ctx, bx - 3, by - 2, 7, 1, AGUA2);
    // casinha do cachorro do lado de fora
    casinha(ctx, px - 13, py + h);
    // brilhinhos
    [[6, 34], [74, 36]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  // o peixinho do aquário da vitrine nada de um lado para o outro (camada animada do mapa)
  function animarFora(ctx, px, py, w, h, t) {
    var vx = px + 8, vy = py + 39, f = Math.floor(t / 400) % 6, pos = f < 3 ? f : 6 - f;
    ret(ctx, vx + 3, vy + 8, 7, 5, AGUA);
    ret(ctx, vx + 4 + pos, vy + 9, 3, 2, LAR); ret(ctx, vx + 3 + pos, vy + 9, 1, 2, LAR);
    ret(ctx, vx + 6 + pos, vy + 9, 1, 1, K);
  }
  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS.petshop = desenharFora;
    if (Mapa.PREDIOS_ANIM) Mapa.PREDIOS_ANIM.petshop = animarFora;
  }
})();
