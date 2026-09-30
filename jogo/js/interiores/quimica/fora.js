/* Laboratório de Química, parte 4: o prédio de fora, no mapa (Mapa.PREDIOS.quimica, 5 × 5 tiles = 80 × 80 px; o
   tubo de vidro da chaminé e as bolhas sobem até 40 px acima). Lilás, ciano e branco: telhado de escamas com o
   átomo no alto, janela redonda com o balão borbulhando, placa do tubo de ensaio, parede de azulejos, janelas com
   frascos coloridos, porta ciano e a chaminé de vidro de onde saem bolhas coloridas (Mapa.PREDIOS_ANIM.quimica).
   Cores próprias aqui (o Reino._predios.quimica é do interior). Nada de Math.random. */
(function () {
  var R = window.Reino;
  var D = R.Interiores.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;

  var LIL = '#b58cff', LIL2 = '#8f6ae0', LIL3 = '#e2d4ff';
  var CIA = '#5fd8e8', CIA2 = '#2fb0c4', CIA3 = '#d4f7fb';
  var PAREDE = '#fdfbff', AZULEJO = '#e9e2f7';
  var ROSA = '#ff7eb6', ROSA2 = '#ffb3d4', VERDE = '#6fdc8c', AMAR = '#ffe066', AZUL = '#5fb4ff', LARANJA = '#ff8a3d';
  // cores das bolhas da chaminé, uma de cada vez
  var BOLHAS = [ROSA, CIA, AMAR, LIL, VERDE];

  // órbita do átomo: anel de pixel (elipse vazada de 1 px) girado de `ang` graus
  function orbita(ctx, cx, cy, rx, ry, ang, cor) {
    var a = ang * Math.PI / 180, co = Math.cos(a), se = Math.sin(a);
    for (var j = -rx; j <= rx; j++) for (var i = -rx; i <= rx; i++) {
      var u = i * co + j * se, v = -i * se + j * co;
      var fora = (u * u) / (rx * rx) + (v * v) / (ry * ry), dentro = (u * u) / ((rx - 1.2) * (rx - 1.2)) + (v * v) / ((ry - 1.2) * (ry - 1.2));
      if (fora <= 1 && dentro > 1) ret(ctx, cx + i, cy + j, 1, 1, cor);
    }
  }
  // tubo de ensaio deitado a 45° (boca em cima, à direita) numa caixa n × n; líquido na metade de baixo
  function tuboInclinado(ctx, x0, y0, n, cor) {
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var s = i + j - (n - 1), d = i - j, as = Math.abs(s), fim = -(n - 4);
      var c = null;
      if (d >= n - 3 && d <= n - 2 && as <= 4) c = as >= 3 || d === n - 2 ? K : LIL3;   // borda da boca
      else if (d > fim + 1 && d < n - 3 && as <= 3) c = as >= 2 ? K : d <= -1 ? (s === -1 && d > fim + 3 ? ROSA2 : cor) : (s === -1 ? C.branco : CIA3);
      else if (d >= fim && d <= fim + 1 && as <= 2) c = d === fim || as === 2 ? K : cor;   // fundo redondo
      if (c) ret(ctx, x0 + i, y0 + j, 1, 1, c);
    }
  }
  // frasquinhos da janela, de pé no chão yb
  function erlenmeyer(ctx, x, yb, cor) {       // 7 de largura
    ret(ctx, x + 2, yb - 9, 3, 4, K); ret(ctx, x + 3, yb - 8, 1, 3, CIA3);
    for (var j = 0; j < 5; j++) { ret(ctx, x + 2 - (j >> 1), yb - 5 + j, 3 + (j >> 1) * 2, 1, K); }
    ret(ctx, x + 1, yb - 1, 5, 1, K); ret(ctx, x, yb, 7, 1, K);
    ret(ctx, x + 3, yb - 4, 1, 1, cor); ret(ctx, x + 2, yb - 3, 3, 1, cor); ret(ctx, x + 2, yb - 2, 3, 1, cor); ret(ctx, x + 1, yb - 1, 5, 1, cor);
    ret(ctx, x + 2, yb - 2, 1, 1, C.branco);
  }
  function tubinho(ctx, x, yb, cor) {          // 4 de largura
    ret(ctx, x, yb - 10, 4, 10, K); ret(ctx, x + 1, yb - 9, 2, 8, CIA3);
    ret(ctx, x + 1, yb - 5, 2, 4, cor); ret(ctx, x + 1, yb - 5, 1, 1, C.branco);
    ret(ctx, x - 1, yb - 11, 6, 1, K);
  }
  function balao(ctx, x, yb, cor) {            // 7 de largura (fundo redondo)
    ret(ctx, x + 2, yb - 10, 3, 5, K); ret(ctx, x + 3, yb - 9, 1, 4, CIA3);
    circulo(ctx, x + 3, yb - 3, 3, K); circulo(ctx, x + 3, yb - 3, 2, cor);
    ret(ctx, x + 1, yb - 4, 5, 1, cor); ret(ctx, x + 2, yb - 4, 1, 1, C.branco);
  }
  // janela com os frascos coloridos na prateleira
  function janelaFrascos(ctx, x, y, w, h, frascos) {
    window.Mapa.fachada.janela(ctx, x, y, w, h, { moldura: LIL3, vidro: '#b9eef6', cruz: false });
    var yb = y + h - 4;
    ret(ctx, x + 2, yb + 1, w - 4, 1, C.madeira);
    frascos.forEach(function (f) { f[0](ctx, x + f[1], yb, f[2]); });
  }

  // posições que o desenho e a animação dividem
  function medidas(px, py, w, h) {
    var cx = px + Math.floor(w / 2);
    return { cx: cx, jy: py + 16, tx: px + 58, topo: py - 11 };   // janela redonda; tubo da chaminé (x e a boca)
  }

  function desenharFora(ctx, px, py, w, h) {
    var Fa = window.Mapa.fachada, M = medidas(px, py, w, h), cx = M.cx;
    var yP = py + 31;                                        // começo da parede
    // chaminé de tijolos lilás com o tubo de vidro (antes do telhado: ele cobre o pé dela)
    var chx = M.tx - 3;
    contornoRet(ctx, chx, py + 4, 12, 24, LIL2);
    Fa.tijolos(ctx, chx + 1, py + 5, 10, 22, LIL2, 3);
    ret(ctx, M.tx, M.topo + 1, 6, py + 4 - M.topo, K);                       // tubo
    ret(ctx, M.tx + 1, M.topo + 2, 4, py + 3 - M.topo - 1, CIA3);
    ret(ctx, M.tx + 1, M.topo + 7, 4, py + 3 - M.topo - 6, ROSA); ret(ctx, M.tx + 1, M.topo + 7, 4, 1, ROSA2);
    ret(ctx, M.tx + 1, M.topo + 3, 1, 3, C.branco);
    ret(ctx, M.tx - 1, M.topo, 8, 3, K); ret(ctx, M.tx, M.topo + 1, 6, 1, LIL3);   // borda da boca
    ret(ctx, M.tx + 2, M.topo + 10, 1, 1, C.branco); ret(ctx, M.tx + 3, M.topo + 12, 1, 1, C.branco);
    ret(ctx, chx - 1, py + 2, 14, 3, K); ret(ctx, chx, py + 3, 12, 1, LIL3);   // tampa da chaminé
    // parede branca de azulejos, com o rodapé ciano
    contornoRet(ctx, px + 3, yP, w - 6, py + h - yP, PAREDE);
    for (var ay = yP + 6; ay < py + h - 10; ay += 6) ret(ctx, px + 4, ay, w - 8, 1, AZULEJO);
    for (ay = yP + 1; ay < py + h - 10; ay += 6) for (var ax = px + 4 + ((ay - yP) % 12 ? 3 : 0) + 5; ax < px + w - 4; ax += 6) ret(ctx, ax, ay, 1, 5, AZULEJO);
    ret(ctx, px + 4, py + h - 10, w - 8, 1, K);
    ret(ctx, px + 4, py + h - 9, w - 8, 8, CIA); ret(ctx, px + 4, py + h - 9, w - 8, 1, CIA3);
    for (var rx = px + 8; rx < px + w - 6; rx += 8) ret(ctx, rx, py + h - 7, 1, 5, CIA2);
    ret(ctx, px + w - 10, yP + 1, 6, py + h - yP - 11, 'rgba(143,106,224,0.08)');   // sombra do lado direito
    // telhado de escamas lilás com a cornija ciano
    triangulo(ctx, px, py + 2, w, 30, K);
    triangulo(ctx, px + 3, py + 5, w - 6, 26, LIL);
    Fa.telhas(ctx, px + 3, py + 5, w - 6, 26, LIL, 4);
    ret(ctx, px + 1, yP - 2, w - 2, 4, K); ret(ctx, px + 2, yP - 1, w - 4, 2, CIA); ret(ctx, px + 2, yP - 1, w - 4, 1, CIA3);
    // átomo no alto do telhado: duas órbitas, o núcleo rosa e os elétrons ciano
    ret(ctx, cx, py - 3, 1, 6, K);
    [0, 60, 120].forEach(function (g) { orbita(ctx, cx, py - 11, 8, 3.2, g, K); });
    circulo(ctx, cx, py - 11, 2, K); ret(ctx, cx - 1, py - 12, 3, 3, ROSA); ret(ctx, cx - 1, py - 12, 1, 1, C.branco);
    ret(ctx, cx - 8, py - 12, 2, 2, CIA); ret(ctx, cx + 3, py - 18, 2, 2, AMAR); ret(ctx, cx + 3, py - 5, 2, 2, VERDE);
    // janela redonda no oitão, com o balão verde borbulhando
    var jy = M.jy;
    circulo(ctx, cx, jy, 8, K); circulo(ctx, cx, jy, 7, LIL3); circulo(ctx, cx, jy, 5, K); circulo(ctx, cx, jy, 4, '#b9eef6');
    ret(ctx, cx - 7, jy, 1, 1, LIL2); ret(ctx, cx + 7, jy, 1, 1, LIL2); ret(ctx, cx, jy - 7, 1, 1, C.branco); ret(ctx, cx, jy + 7, 1, 1, LIL2);
    balaoJanela(ctx, cx, jy, 0);
    // placa com o tubo de ensaio (e bolhinhas), presa na cornija
    var pw = 27, pxp = cx - 13, pyp = yP - 7;
    contornoRet(ctx, pxp, pyp, pw, 15, LIL3); ret(ctx, pxp + 2, pyp + 2, pw - 4, 11, C.branco);
    ret(ctx, pxp + 2, pyp + 2, pw - 4, 1, CIA3);
    tuboInclinado(ctx, cx - 7, pyp + 2, 11, ROSA);
    [[cx + 6, pyp + 4, CIA], [cx + 9, pyp + 7, AMAR], [cx + 5, pyp + 9, LIL]].forEach(function (b) {
      ret(ctx, b[0], b[1], 3, 3, K); ret(ctx, b[0] + 1, b[1] + 1, 1, 1, b[2]);
    });
    ret(ctx, pxp + 1, pyp + 1, 1, 1, C.ouro); ret(ctx, pxp + pw - 2, pyp + 1, 1, 1, C.ouro);
    // janelas com frascos coloridos
    janelaFrascos(ctx, px + 7, py + 41, 20, 15, [[erlenmeyer, 3, ROSA], [tubinho, 11, AMAR], [tubinho, 15, VERDE]]);
    janelaFrascos(ctx, px + w - 27, py + 41, 20, 15, [[balao, 2, AZUL], [erlenmeyer, 10, LARANJA]]);
    // porta ciano padrão (Mapa.fachada.entrada) com a vigia redonda
    var fo = Fa.entrada(ctx, cx, py + h, CIA2, C.ouro);
    circulo(ctx, cx, fo.y + 7, 3, K); circulo(ctx, cx, fo.y + 7, 2, CIA3); ret(ctx, cx - 1, fo.y + 6, 1, 1, C.branco);
    // vaso de flor à esquerda e caixote de frascos à direita
    Fa.vaso(ctx, px + 16, py + h, ROSA);
    var bx = px + w - 22, by = py + h - 7;
    [[1, LIL], [4, AMAR], [7, CIA]].forEach(function (g) {
      ret(ctx, bx + g[0], by - 5, 3, 5, K); ret(ctx, bx + g[0] + 1, by - 4, 1, 4, g[1]); ret(ctx, bx + g[0] + 1, by - 6, 1, 1, K);
    });
    contornoRet(ctx, bx, by, 11, 7, C.madeira); ret(ctx, bx + 1, by + 1, 9, 1, C.madeiraClara); ret(ctx, bx + 1, by + 4, 9, 1, C.madeira2);
    // brilhinhos
    Fa.brilho(ctx, px + 4, py + 26, C.branco); Fa.brilho(ctx, px + w - 18, py + 4, C.branco);
  }
  // o balão da janela redonda: fundo redondo de líquido verde e uma bolha que sobe pelo gargalo (f = quadro 0 a 3)
  function balaoJanela(ctx, cx, jy, f) {
    circulo(ctx, cx, jy, 4, '#b9eef6'); ret(ctx, cx - 3, jy - 2, 1, 2, C.branco);
    ret(ctx, cx - 1, jy - 4, 3, 3, K); ret(ctx, cx, jy - 4, 1, 3, CIA3);
    circulo(ctx, cx, jy + 1, 3, K); circulo(ctx, cx, jy + 1, 2, VERDE);
    ret(ctx, cx, jy - 1, 1, 1, CIA3); ret(ctx, cx - 1, jy + 1, 1, 1, C.branco);
    var b = [[1, 2], [1, 1], [0, 0], [0, -2]][f];
    ret(ctx, cx + b[0], jy + b[1], 1, 1, f < 3 ? '#c9f5d4' : C.branco);
  }
  // animação: bolhas coloridas sobem da chaminé de vidro e estouram; o líquido do tubo e o balão borbulham
  function animarFora(ctx, px, py, w, h, t) {
    var M = medidas(px, py, w, h), bx = M.tx + 3;
    // bolhinhas dentro do líquido do tubo
    ret(ctx, M.tx + 1, M.topo + 8, 4, 6, ROSA);
    var q = Math.floor(t / 250) % 6;
    ret(ctx, M.tx + 1 + (q % 2) * 2, M.topo + 13 - q, 1, 1, C.branco);
    // quatro bolhas em fila, cada uma de uma cor, subindo em degraus e balançando de lado (até 40 px acima do prédio)
    var ciclo = 3200, n = 4;
    for (var i = 0; i < n; i++) {
      var fase = ((t + i * ciclo / n) % ciclo) / ciclo;
      var dy = Math.floor(fase * 25), y = M.topo - 4 - dy;
      var lado = [0, 1, 1, 0, -1, -1][Math.floor(dy / 3) % 6] * (i % 2 ? 1 : -1);
      var x = bx + lado - 2, cor = BOLHAS[(i + Math.floor(t / ciclo)) % BOLHAS.length];
      if (fase > 0.9) { R.Desenho.brilho(ctx, x + 2, y + 2, C.branco); continue; }   // estourou
      if (fase > 0.4) { ret(ctx, x, y, 5, 5, K); ret(ctx, x + 1, y + 1, 3, 3, cor); ret(ctx, x + 1, y + 1, 1, 1, C.branco); }   // cresceu
      else { ret(ctx, x + 1, y + 1, 4, 4, K); ret(ctx, x + 2, y + 2, 2, 2, cor); ret(ctx, x + 2, y + 2, 1, 1, C.branco); }
    }
    balaoJanela(ctx, M.cx, M.jy, Math.floor(t / 300) % 4);
  }
  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS.quimica = desenharFora;
    if (Mapa.PREDIOS_ANIM) Mapa.PREDIOS_ANIM.quimica = animarFora;
  }
})();
