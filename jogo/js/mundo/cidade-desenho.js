/* Desenho da cidade (o que Mapa.CIDADE põe à mão, mundo/lugares.js): o piso em mosaico da praça, a fonte grande
   (e o jato animado), o coreto e os canteiros redondos. Os enfeites de 1 tile (poste, banco, canteiro, cerca,
   pedra, poço, correio, placa, pedrinhas) e o halo dos lampiões ficam em mundo/cidade-pecas.js.
   Usa as cores e os ajudantes que mundo/mapa-desenho.js põe em Mapa._interno e entrega:
     I.desenharPraca(ctx)             o piso desenhado da praça (depois do chão, antes dos enfeites)
     I.desenharObjeto(ctx, o)         uma peça grande da praça ({ tipo, x, y, w, h } em tiles)
     I.animarCidade(ctx, t)           a água da fonte e o brilho dos lampiões (só com Animações)
     I.animarObjeto(ctx, o, t)        a água da fonte (também por cima da Mariana, quando ela passa atrás)
     I.CIDADE_CORES, I.trianguloBaixo  a paleta de pedra e madeira e o triângulo para baixo (para cidade-pecas.js) */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var T = Mapa.T;
  var C = I.C, ret = I.ret, circulo = I.circulo, elipse = I.elipse, triangulo = I.triangulo;
  var K = C.contorno;
  var PEDRA = '#fff4dc', PEDRA2 = '#e8cf9c', PEDRA3 = '#c9a978', PEDRA4 = '#a88660', TERRA = '#b07a52', BORDA = '#f3dfb4';
  var ROSA = '#ff9cc6', ROSA2 = '#ffc9df', LILAS = '#b58cff', LILAS2 = '#dccbff', OURO = '#ffd34d', OURO2 = '#fff0a0';
  I.CIDADE_CORES = { PEDRA: PEDRA, PEDRA2: PEDRA2, PEDRA3: PEDRA3, PEDRA4: PEDRA4, TERRA: TERRA,
    MADEIRA: '#c98a5a', MADEIRA2: '#9c6446', MADEIRA3: '#e8b27a', FERRO: '#6b5a7a', FERRO2: '#8e7aa0' };

  // triângulo apontando para baixo (bandeirinha, ponta do coração)
  function trianguloBaixo(ctx, x, y, w, h, cor) {
    ctx.fillStyle = cor;
    for (var j = 0; j < h; j++) {
      var meia = Math.round((w / 2) * (h - j) / h);
      ctx.fillRect(Math.round(x + w / 2 - meia), y + j, meia * 2, 1);
    }
  }
  I.trianguloBaixo = trianguloBaixo;
  // ponta da rosa dos ventos: losango do raio rIn até a ponta rTip, largura máxima 2·meia em rBase.
  // Pinta pixel a pixel (centro do pixel dentro do losango): sem pixel solto; a borda sai em pedra
  function ponta(ctx, c, ang, rIn, rBase, meia, rTip, cor) {
    var ux = Math.cos(ang), uy = Math.sin(ang);
    function dentroP(px, py) {
      var dx = px + 0.5 - c.x, dy = py + 0.5 - c.y;
      var ao = dx * ux + dy * uy, lado = -dx * uy + dy * ux;
      if (ao < rIn || ao > rTip) return false;
      var lim = ao < rBase ? meia * (ao - rIn) / (rBase - rIn) : meia * (rTip - ao) / (rTip - rBase);
      return Math.abs(lado) <= lim;
    }
    var escura = D.escurecer(cor, 0.2), clara = D.clarear(cor, 0.45);
    // pixel da ponta sem vizinho dos dois lados de nenhum eixo sai (não fica pixel solto)
    function cheio(px, py) {
      return dentroP(px, py) && ((dentroP(px - 1, py) && dentroP(px + 1, py)) || (dentroP(px, py - 1) && dentroP(px, py + 1))
        || (dentroP(px - 1, py) || dentroP(px + 1, py)) && (dentroP(px, py - 1) || dentroP(px, py + 1)));
    }
    for (var py = Math.floor(c.y - rTip - 1); py <= c.y + rTip + 1; py++) for (var px = Math.floor(c.x - rTip - 1); px <= c.x + rTip + 1; px++) {
      if (!cheio(px, py)) continue;
      var borda = !dentroP(px + 1, py) || !dentroP(px - 1, py) || !dentroP(px, py + 1) || !dentroP(px, py - 1);
      var lado = -(px + 0.5 - c.x) * uy + (py + 0.5 - c.y) * ux;
      // a nervura do meio sai clara do lado da luz
      ret(ctx, px, py, 1, 1, borda ? PEDRA4 : (lado < 0 && lado > -1.2 ? clara : (lado < 0 ? cor : escura)));
    }
  }
  function centroDe(o) { return { x: (o.x + o.w / 2) * T, y: (o.y + o.h / 2) * T }; }
  function fonte() { return I.objetos.find(function (o) { return o.tipo === 'fonte'; }); }

  /* ----- piso da praça: mosaico de pedrinhas, eixos de ladrilho, anéis em volta da fonte e a faixa de borda ----- */
  var PISO = ['#fff0cc', '#ffe9bd', '#fbe1b2'], JUNTA = '#efd3a0';
  // cor de um pixel do piso (sem a borda): anéis > eixos > mosaico com incrustações
  function corPiso(px, py, c, eixoX, faixa) {
    var dx = px + 0.5 - c.x, dy = py + 0.5 - c.y, r = Math.sqrt(dx * dx + dy * dy);
    if (r < 78) {
      var ang = (Math.atan2(dy, dx) / (Math.PI * 2) + 1) % 1;
      if (r < 56) return '#fff6de';
      if (r < 58) return '#f4c98a';
      if (r < 64) { var s24 = (ang * 24) % 1; return s24 < 0.04 || s24 > 0.96 ? '#f0d7a6' : (Math.floor(ang * 24) % 2 ? '#fff6de' : '#ffeccb'); }
      if (r < 66) return PEDRA3;
      if (r < 75) {
        var seg = ang * 32, fr = seg % 1, rosa = Math.floor(seg) % 2 === 0;
        if (fr < 0.06 || fr > 0.94) return '#d9b88a';
        if (Math.abs(r - 70.5) < 1.2 && fr > 0.35 && fr < 0.65) return rosa ? OURO : '#ffffff';
        if (r < 67) return rosa ? '#ffe4ef' : '#efe6ff';   // luz na borda de dentro
        return rosa ? ROSA2 : LILAS2;
      }
      return r < 76 ? PEDRA3 : OURO;
    }
    var ex = Math.abs(px + 0.5 - eixoX), naFaixa = faixa && py >= faixa[0] && py < faixa[1];
    if (ex < 24 || naFaixa) {
      if (ex >= 22 && !naFaixa) return PEDRA3;
      if (naFaixa && ex >= 22 && (py - faixa[0] < 2 || faixa[1] - py <= 2)) return PEDRA3;
      var fy = Math.floor(py / 6), lx = (px + (fy % 2) * 4) % 8, ly = py % 6;
      if (ly === 5 || lx === 7) return '#f0d29c';
      if (ly === 0 || lx === 0) return '#fff8e4';
      return D.sorte(Math.floor((px + (fy % 2) * 4) / 8), fy, 11) < 0.3 ? '#ffe9bd' : '#fff0cc';
    }
    // incrustação no meio de cada tile: losango de 7 px em rosa, lilás ou ouro, com borda de pedra
    var ux = Math.abs(px - (Math.floor(px / T) * T + 7.5)), uy = Math.abs(py - (Math.floor(py / T) * T + 7.5)), m = ux + uy;
    if (m < 4) {
      var cor = [ROSA, LILAS, OURO][(Math.floor(px / T) + Math.floor(py / T)) % 3];
      return m < 1.5 ? '#ffffff' : (m < 3 ? cor : PEDRA3);
    }
    // mosaico de pedrinhas de 5 px, fileiras desencontradas, 3 tons fixos por posição
    var cy5 = Math.floor(py / 5), off = (cy5 % 2) * 2, cx5 = Math.floor((px + off) / 5);
    if (py % 5 === 4 || (px + off) % 5 === 4) return JUNTA;
    if (py % 5 === 0 && (px + off) % 5 < 3) return '#fff8e4';
    return PISO[Math.floor(D.sorte(cx5, cy5, 7) * 3)];
  }
  I.desenharPraca = function (ctx) {
    var p = Mapa.CIDADE.praca, x0 = p.x * T, y0 = p.y * T, w = p.w * T, h = p.h * T;
    var c = centroDe(fonte());
    c = { x: c.x, y: c.y - 4 };
    var ruaO = Mapa.CIDADE.ruas.find(function (r) { return r.x + r.w === p.x && r.y > p.y && r.y < p.y + p.h; });
    var faixa = ruaO ? [ruaO.y * T, (ruaO.y + ruaO.h) * T] : null;
    // pinta em trechos de mesma cor, linha a linha
    for (var py = y0; py < y0 + h; py++) {
      var ini = x0, atual = corPiso(x0, py, c, c.x, faixa);
      for (var px = x0 + 1; px <= x0 + w; px++) {
        var cor = px < x0 + w ? corPiso(px, py, c, c.x, faixa) : null;
        if (cor !== atual) { ret(ctx, ini, py, px - ini, 1, atual); ini = px; atual = cor; }
      }
    }
    // faixa de borda: pedra mais escura em blocos de 8, brilho em cima e sombra embaixo; aberta onde uma rua chega
    // (ali, uma soleira de 1 fileira entre a rua e o piso). Tile a tile do contorno
    var B = 6;
    function rua(tx, ty) { return I.dentro(tx, ty) && I.tipo[ty][tx] === 'c'; }
    function blocos(bx, by, bw, bh, deitado) {
      ret(ctx, bx, by, bw, bh, '#e6c896');
      if (deitado) for (var q = bx; q < bx + bw; q += 8) ret(ctx, q, by, 1, bh, PEDRA3);
      else for (var q2 = by; q2 < by + bh; q2 += 8) ret(ctx, bx, q2, bw, 1, PEDRA3);
    }
    for (var tx = p.x; tx < p.x + p.w; tx++) [[p.y, -1, y0], [p.y + p.h - 1, 1, y0 + h - B]].forEach(function (l) {
      var bx = tx * T;
      if (rua(tx, l[0] + l[1])) { ret(ctx, bx, l[1] < 0 ? y0 : y0 + h - 1, T, 1, PEDRA2); return; }
      blocos(bx, l[2], T, B, true);
      ret(ctx, bx, l[2], T, 1, l[1] < 0 ? PEDRA : PEDRA3); ret(ctx, bx, l[2] + B - 1, T, 1, l[1] < 0 ? PEDRA3 : PEDRA4);
      if (l[1] < 0) ret(ctx, bx, l[2] + B, T, 1, 'rgba(58,36,70,0.12)');
    });
    for (var ty = p.y; ty < p.y + p.h; ty++) [[p.x, -1, x0], [p.x + p.w - 1, 1, x0 + w - B]].forEach(function (l) {
      var by = ty * T;
      if (rua(l[0] + l[1], ty)) { ret(ctx, l[1] < 0 ? x0 : x0 + w - 1, by, 1, T, PEDRA2); return; }
      blocos(l[2], by, B, T, false);
      ret(ctx, l[2], by, 1, T, l[1] < 0 ? PEDRA : PEDRA3); ret(ctx, l[2] + B - 1, by, 1, T, l[1] < 0 ? PEDRA3 : PEDRA4);
      if (l[1] < 0) ret(ctx, l[2] + B, by, 1, T, 'rgba(58,36,70,0.12)');
    });
    // as quinas: bloco quadrado com um losango rosa ou lilás
    [[x0, y0], [x0 + w - 8, y0], [x0, y0 + h - 8], [x0 + w - 8, y0 + h - 8]].forEach(function (q, i) {
      var cor = i % 3 ? LILAS : ROSA;
      ret(ctx, q[0], q[1], 8, 8, PEDRA4); ret(ctx, q[0] + 1, q[1] + 1, 6, 6, PEDRA3); ret(ctx, q[0] + 1, q[1] + 1, 6, 1, PEDRA2);
      ret(ctx, q[0] + 3, q[1] + 2, 2, 4, cor); ret(ctx, q[0] + 2, q[1] + 3, 4, 2, cor); ret(ctx, q[0] + 3, q[1] + 3, 1, 1, '#ffffff');
    });
    // rosa dos ventos: 2 pontas pequenas em lilás nas diagonais de cima e 4 grandes (N, L, S, O)
    var cores = ['#7ed9c8', '#ff8a3d', '#ffd34d', ROSA];
    for (var k = 2; k < 4; k++) ponta(ctx, c, k * Math.PI / 2 + Math.PI / 4, 38, 44, 4, 54, LILAS);   // as de baixo, a bacia cobriria
    for (k = 0; k < 4; k++) ponta(ctx, c, k * Math.PI / 2 - Math.PI / 2, 38, 47, 7, 63, cores[k]);
    // estrelinhas douradas no anel claro, entre as pontas
    for (var d = 0; d < 8; d++) {
      var b = d * Math.PI / 4 + Math.PI / 8;
      var gx = Math.round(c.x + Math.cos(b) * 61), gy = Math.round(c.y + Math.sin(b) * 61);
      ret(ctx, gx - 1, gy, 3, 1, OURO); ret(ctx, gx, gy - 1, 1, 3, OURO); ret(ctx, gx, gy, 1, 1, OURO2);
    }
  };

  /* ----- peças grandes ----- */
  // elipse com contorno K fechado: cada linha fecha o degrau até a vizinha (sem furo na borda)
  function elipseContornada(ctx, cx, cy, rx, ry, cor) {
    function meia(j) { return Math.abs(j) > ry ? -1 : Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3); }
    for (var j = -ry; j <= ry; j++) {
      var a = meia(j), dentro = Math.min(a - 1, meia(j - 1), meia(j + 1));
      ret(ctx, cx - a, cy + j, a * 2 + 1, 1, K);
      if (dentro >= 0) ret(ctx, cx - dentro, cy + j, dentro * 2 + 1, 1, cor);
    }
  }
  // bacia com parede: a parede (alt px) embaixo, com juntas de bloco, e a borda de cima com luz e sombra
  function bacia(ctx, cx, cy, rx, ry, alt, juntas) {
    elipseContornada(ctx, cx, cy + alt, rx, ry, PEDRA3);
    for (var g = 0; g < juntas; g++) {
      var a = Math.PI * (g + 0.5) / juntas;
      ret(ctx, Math.round(cx + Math.cos(a) * (rx - 2)), Math.round(cy + Math.sin(a) * ry) + 1, 1, alt - 1, PEDRA4);
    }
    elipseContornada(ctx, cx, cy, rx, ry, PEDRA2);
    elipse(ctx, cx - 1, cy - 1, rx - 2, ry - 2, PEDRA);
    elipse(ctx, cx, cy, rx - 2, ry - 2, BORDA);
  }
  // a fonte grande (5×4 tiles): bacia larga de pedra, pé com bacia do meio, taça de cima e a estrela dourada
  function desenharFonte(ctx, o) {
    var c = centroDe(o), cx = c.x, cy = c.y + 12;
    // sombra de 2 níveis (0,15 fora; ~0,25 no miolo: 0,12 por cima do 0,15)
    elipse(ctx, cx, cy + 7, 42, 19, 'rgba(58,36,70,0.15)'); elipse(ctx, cx, cy + 6, 37, 16, 'rgba(58,36,70,0.12)');
    bacia(ctx, cx, cy, 39, 19, 4, 14);
    for (var g = 0; g < 16; g++) {
      var a = g * Math.PI / 8;
      ret(ctx, Math.round(cx + Math.cos(a) * 36), Math.round(cy + Math.sin(a) * 16.5), 1, 2, PEDRA3);
    }
    // a água em degraus de tom: escura sob a borda de cima, clara no meio, funda no centro
    elipseContornada(ctx, cx, cy, 33, 14, C.agua3);
    elipse(ctx, cx, cy + 2, 32, 12, '#5cc6b8');
    elipse(ctx, cx, cy + 3, 30, 10, C.agua);
    elipse(ctx, cx, cy + 4, 22, 7, '#5cc6b8');
    elipse(ctx, cx, cy + 5, 14, 4, C.agua3);
    // reflexo da estrela e brilhos
    ret(ctx, cx - 1, cy + 7, 3, 1, '#ffe98a'); ret(ctx, cx, cy + 9, 1, 1, '#ffe98a');
    ret(ctx, cx - 18, cy - 6, 10, 1, C.agua2); ret(ctx, cx - 22, cy - 4, 4, 1, C.agua2); ret(ctx, cx + 14, cy + 7, 6, 1, C.agua2);
    ret(ctx, cx - 16, cy - 7, 2, 1, '#ffffff'); ret(ctx, cx + 22, cy + 3, 2, 1, '#ffffff');
    // vitórias-régias na água, com a fenda e uma flor
    [[-21, 4, ROSA], [23, -2, null], [9, 8, '#ffe066']].forEach(function (v) {
      var vx = cx + v[0], vy = cy + v[1];
      elipse(ctx, vx, vy, 4, 2, '#6e9c2c'); elipse(ctx, vx, vy - 1, 4, 1, '#8fb83a'); ret(ctx, vx - 2, vy - 2, 3, 1, '#b6d24e');
      ret(ctx, vx + 1, vy - 1, 1, 2, C.agua);
      if (v[2]) { ret(ctx, vx - 1, vy - 3, 3, 2, v[2]); ret(ctx, vx, vy - 4, 1, 1, v[2]); ret(ctx, vx, vy - 3, 1, 1, '#ffffff'); }
    });
    // pé esculpido: base larga, fuste com anéis, luz à esquerda e sombra à direita
    ret(ctx, cx - 9, cy - 3, 18, 5, K); ret(ctx, cx - 8, cy - 2, 16, 3, PEDRA2); ret(ctx, cx - 8, cy - 2, 16, 1, PEDRA);
    ret(ctx, cx - 6, cy - 22, 12, 20, K); ret(ctx, cx - 5, cy - 22, 10, 20, PEDRA); ret(ctx, cx + 2, cy - 22, 3, 20, PEDRA2);
    ret(ctx, cx - 5, cy - 22, 1, 20, '#ffffff');
    for (var an = cy - 17; an < cy - 2; an += 5) { ret(ctx, cx - 6, an, 12, 1, K); ret(ctx, cx - 5, an + 1, 10, 1, PEDRA3); }
    // bacia do meio: barriga de pedra, borda e a água
    elipseContornada(ctx, cx, cy - 20, 14, 6, PEDRA3); elipse(ctx, cx - 1, cy - 20, 11, 4, PEDRA2);
    for (g = -2; g <= 2; g++) ret(ctx, cx + g * 5, cy - 18, 1, 3, PEDRA4);
    elipseContornada(ctx, cx, cy - 24, 17, 5, BORDA); elipse(ctx, cx - 1, cy - 25, 15, 3, PEDRA);
    elipse(ctx, cx, cy - 24, 14, 3, C.agua3); elipse(ctx, cx, cy - 23, 12, 2, C.agua);
    ret(ctx, cx - 9, cy - 25, 5, 1, C.agua2); ret(ctx, cx + 6, cy - 23, 3, 1, C.agua2);
    // pé e taça de cima
    ret(ctx, cx - 3, cy - 40, 6, 16, K); ret(ctx, cx - 2, cy - 40, 4, 16, '#ffffff'); ret(ctx, cx + 1, cy - 40, 1, 16, '#e8e0f0');
    ret(ctx, cx - 3, cy - 33, 6, 1, K); ret(ctx, cx - 2, cy - 32, 4, 1, PEDRA2);
    elipseContornada(ctx, cx, cy - 40, 7, 3, PEDRA2); elipse(ctx, cx - 1, cy - 41, 5, 1, '#ffffff');
    elipseContornada(ctx, cx, cy - 43, 10, 3, BORDA); ret(ctx, cx - 7, cy - 44, 14, 1, C.agua); ret(ctx, cx - 6, cy - 44, 3, 1, C.agua2);
    ret(ctx, cx - 1, cy - 52, 2, 8, K); ret(ctx, cx, cy - 52, 1, 8, OURO);
    // estrela de 5 pontas (linha a linha: meia-largura por linha, de cima para baixo)
    var ESTRELA = [[0, 1], [-1, 1], [-1, 1], [-5, 5], [-4, 4], [-3, 3], [-3, 3], [-4, -1, 1, 4], [-4, -2, 2, 4]];
    ESTRELA.forEach(function (lin, j) {
      for (var q = 0; q < lin.length; q += 2) ret(ctx, cx + lin[q] - 1, cy - 60 + j, lin[q + 1] - lin[q] + 2, 1, K);
    });
    ESTRELA.forEach(function (lin, j) {
      if (j === 0) return;
      for (var q = 0; q < lin.length; q += 2) ret(ctx, cx + lin[q], cy - 60 + j, lin[q + 1] - lin[q], 1, j < 4 ? OURO2 : OURO);
    });
    ret(ctx, cx - 1, cy - 57, 1, 2, '#ffffff');
  }
  function desenharCoreto(ctx, o) {
    var x = o.x * T, y = o.y * T, w = o.w * T, h = o.h * T, cx = x + w / 2;
    // sombra encostada na base de pedra (2 níveis)
    ret(ctx, x, y + h - 5, w, 3, 'rgba(58,36,70,0.15)'); ret(ctx, x + 2, y + h - 2, w - 4, 1, 'rgba(58,36,70,0.15)');
    ret(ctx, x + 2, y + h - 5, w - 4, 2, 'rgba(58,36,70,0.12)');
    // degraus na frente (do mais largo, embaixo)
    [[18, 0], [14, 3]].forEach(function (d) {
      ret(ctx, cx - d[0] / 2 - 1, y + h - 4 - d[1], d[0] + 2, 4, K);
      ret(ctx, cx - d[0] / 2, y + h - 3 - d[1], d[0], 2, PEDRA2); ret(ctx, cx - d[0] / 2, y + h - 3 - d[1], d[0], 1, PEDRA);
    });
    // base de pedra com as quinas cortadas e juntas de bloco
    ret(ctx, x + 3, y + h - 17, w - 6, 11, K); ret(ctx, x + 2, y + h - 15, w - 4, 7, K);
    ret(ctx, x + 3, y + h - 15, w - 6, 7, PEDRA2); ret(ctx, x + 3, y + h - 15, w - 6, 1, PEDRA);
    for (var j = x + 6; j < x + w - 4; j += 6) ret(ctx, j, y + h - 13, 1, 4, PEDRA3);
    ret(ctx, x + 3, y + h - 9, w - 6, 1, PEDRA3);
    // piso de tábuas
    ret(ctx, x + 4, y + h - 16, w - 8, 2, '#f4c98a'); for (j = x + 7; j < x + w - 4; j += 5) ret(ctx, j, y + h - 16, 1, 2, '#e0a868');
    // o fundo de dentro, na sombra do telhado
    ret(ctx, x + 6, y + 12, w - 12, h - 28, '#ffe3ee'); ret(ctx, x + 6, y + 12, w - 12, 3, '#f7c3d8');
    // colunas com capitel e base
    [x + 5, x + 15, x + w - 19, x + w - 9].forEach(function (px) {
      ret(ctx, px, y + 11, 4, h - 27, K); ret(ctx, px + 1, y + 11, 2, h - 27, '#ffffff'); ret(ctx, px + 2, y + 11, 1, h - 27, '#e8e0f0');
      ret(ctx, px - 1, y + 15, 6, 2, K); ret(ctx, px - 1, y + h - 18, 6, 2, K); ret(ctx, px, y + h - 18, 4, 1, PEDRA2);
    });
    // grade com balaústres (entre as colunas)
    ret(ctx, x + 6, y + h - 25, w - 12, 2, K); ret(ctx, x + 6, y + h - 25, w - 12, 1, '#ffffff');
    for (var bx = x + 9; bx < x + w - 8; bx += 4) {
      if (bx >= x + 13 && bx <= x + 19 || bx >= x + w - 21 && bx <= x + w - 15) continue;
      ret(ctx, bx, y + h - 23, 3, 6, K); ret(ctx, bx + 1, y + h - 23, 1, 6, '#ffffff'); ret(ctx, bx, y + h - 21, 2, 2, '#ffffff');
    }
    ret(ctx, x + 6, y + h - 18, w - 12, 1, K);
    // daqui para cima, o telhado: 8 px mais alto que o tile, para as colunas aparecerem
    y -= 8;
    // bandeirinhas num cordão sob o beiral
    ret(ctx, x + 6, y + 23, w - 12, 1, '#c98a5a');
    for (var f = 0; f < 6; f++) {
      var fx = x + 7 + f * 6;
      trianguloBaixo(ctx, fx - 1, y + 23, 7, 6, K);
      trianguloBaixo(ctx, fx, y + 24, 5, 4, ['#ff8a3d', '#7ed9c8', OURO, LILAS][f % 4]);
    }
    // telhado de telhas em escama
    triangulo(ctx, x - 1, y, w + 2, 18, K);
    triangulo(ctx, x + 1, y + 2, w - 2, 16, ROSA);
    for (var ty = y + 6; ty < y + 16; ty += 3) {
      var meia = Math.round(((w - 2) / 2) * (ty - y - 1) / 16) - 1;
      for (var tx = cx - meia; tx < cx + meia; tx++) {
        var e = (tx - cx + 40 + ((ty - y) % 6 ? 2 : 0)) % 4;
        ret(ctx, tx, ty + (e === 0 ? 0 : 1), 1, 1, e === 0 ? '#ffd1e6' : '#e0679a');
      }
    }
    ret(ctx, cx - 2, y + 3, 1, 7, '#ffd1e6');
    // barrado recortado: faixa e abas redondinhas, rosa e branco alternados
    ret(ctx, x - 1, y + 16, w + 2, 4, K); ret(ctx, x, y + 17, w, 2, '#e0679a'); ret(ctx, x, y + 17, w, 1, '#ff8fbd');
    for (var a = 0; a < 8; a++) {
      var ax = x + a * 6, cor = a % 2 ? '#ffffff' : ROSA2;
      ret(ctx, ax, y + 20, 6, 2, K); ret(ctx, ax + 1, y + 22, 4, 1, K);
      ret(ctx, ax + 1, y + 20, 4, 1, cor); ret(ctx, ax + 2, y + 21, 2, 1, cor);
    }
    // pináculo dourado com a flâmula
    ret(ctx, cx - 1, y - 6, 2, 7, K); circulo(ctx, cx, y - 3, 2, K); circulo(ctx, cx, y - 3, 1, OURO); ret(ctx, cx - 1, y - 4, 1, 1, OURO2);
    ret(ctx, cx, y - 14, 1, 9, K);
    ret(ctx, cx + 1, y - 14, 6, 4, K); ret(ctx, cx + 7, y - 13, 1, 2, K); ret(ctx, cx + 1, y - 13, 6, 2, ROSA); ret(ctx, cx + 1, y - 13, 6, 1, ROSA2);
  }
  // tulipa (de trás) e margarida (da frente), em px do sprite
  function tulipa(ctx, x, y, cor) {
    ret(ctx, x, y, 1, 3, '#6e9c2c'); ret(ctx, x + 1, y + 1, 1, 1, '#8fb83a');
    ret(ctx, x - 1, y - 3, 3, 3, cor); ret(ctx, x, y - 4, 1, 1, cor); ret(ctx, x + 1, y - 3, 1, 3, D.escurecer(cor, 0.18));
    ret(ctx, x - 1, y - 3, 1, 1, D.clarear(cor, 0.5));
  }
  function margarida(ctx, x, y, cor, miolo) {
    ret(ctx, x, y + 1, 1, 2, '#6e9c2c');
    ret(ctx, x - 1, y, 3, 1, cor); ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x, y, 1, 1, miolo);
  }
  function desenharCanteiroGrande(ctx, o) {
    var c = centroDe(o), cx = c.x, cy = c.y + 3;
    elipse(ctx, cx, cy + 6, 24, 13, 'rgba(58,36,70,0.15)'); elipse(ctx, cx, cy + 5, 20, 11, 'rgba(58,36,70,0.12)');
    // aro de pedras em blocos, com parede embaixo
    bacia(ctx, cx, cy, 22, 13, 3, 9);
    for (var g = 0; g < 18; g++) {
      var a = g * Math.PI / 9;
      ret(ctx, Math.round(cx + Math.cos(a) * 20), Math.round(cy + Math.sin(a) * 11.5), 1, 1, PEDRA3);
    }
    // terra fofa
    elipseContornada(ctx, cx, cy, 18, 10, '#8a5a3c');
    elipse(ctx, cx, cy + 1, 17, 8, TERRA);
    for (var t = 0; t < 30; t++) {
      var tx = cx - 16 + Math.floor(D.sorte(t, o.x, 21) * 32), ty = cy - 6 + Math.floor(D.sorte(t, o.y, 22) * 13);
      if (((tx - cx) * (tx - cx)) / 256 + ((ty - cy - 1) * (ty - cy - 1)) / 49 < 1) ret(ctx, tx, ty, 2, 1, t % 2 ? '#c48a5e' : '#8a5a3c');
    }
    // moitinha em coração atrás, com botões cor-de-rosa
    circulo(ctx, cx - 4, cy - 10, 6, K); circulo(ctx, cx + 4, cy - 10, 6, K); trianguloBaixo(ctx, cx - 10, cy - 10, 20, 10, K);
    circulo(ctx, cx - 4, cy - 10, 5, '#8fb83a'); circulo(ctx, cx + 4, cy - 10, 5, '#8fb83a'); trianguloBaixo(ctx, cx - 9, cy - 10, 18, 8, '#8fb83a');
    circulo(ctx, cx - 4, cy - 11, 4, '#a8cc48'); circulo(ctx, cx + 3, cy - 11, 4, '#a8cc48');
    circulo(ctx, cx - 5, cy - 12, 2, '#d4ee78'); ret(ctx, cx + 2, cy - 14, 2, 1, '#d4ee78');
    [[-6, -8], [3, -6], [0, -12], [6, -10]].forEach(function (b) { ret(ctx, cx + b[0], cy + b[1], 2, 2, ROSA); ret(ctx, cx + b[0], cy + b[1], 1, 1, '#ffffff'); });
    // flores em fileiras, de trás para a frente: tulipas, depois margaridas
    var TUL = ['#ff8a3d', ROSA, '#ff5c6a', LILAS], MAR = [['#ffffff', '#ffd34d'], ['#ffe066', '#ff8a3d'], [ROSA2, '#ffd34d']];
    [[-15, -1], [-11, -3], [11, -3], [15, -1], [-8, 0], [8, 0]].forEach(function (p, i) { tulipa(ctx, cx + p[0], cy + p[1], TUL[i % 4]); });
    [[-13, 3], [-7, 4], [-2, 2], [3, 4], [8, 3], [13, 4], [-10, 7], [-4, 8], [2, 7], [7, 8], [11, 7], [0, 10]].forEach(function (p, i) {
      var m = MAR[(i + o.x) % 3];
      margarida(ctx, cx + p[0], cy + p[1], m[0], m[1]);
    });
    [[-16, 4], [15, 5], [-6, 10], [5, 11]].forEach(function (p) { ret(ctx, cx + p[0], cy + p[1], 2, 1, '#8fb83a'); });
  }
  // I.OBJETOS: outras peças grandes se acrescentam (o cofre, mundo/cofre-desenho.js)
  var OBJETOS = I.OBJETOS = { fonte: desenharFonte, coreto: desenharCoreto, canteiro: desenharCanteiroGrande };
  I.desenharObjeto = function (ctx, o) { if (OBJETOS[o.tipo]) OBJETOS[o.tipo](ctx, o); };

  /* ----- animação: água da fonte (jatos, pingos, ondinhas); os lampiões em mundo/cidade-pecas.js ----- */
  // a água da fonte, em px do jogo: no buffer e, quando ela passa atrás da fonte, de novo por cima dela
  I.animarObjeto = function (ctx, o, t) {
    if (o.tipo !== 'fonte') return;
    var c = centroDe(o), cx = c.x, cy = c.y + 12;
    for (var g = 0; g < 14; g++) {
      var lado = g % 2 ? 1 : -1;
      // da taça de cima para a bacia do meio
      var fa = ((t / 900) + g / 14) % 1;
      ctx.fillStyle = fa < 0.8 ? '#bfe7ff' : '#ffffff';
      ctx.fillRect(Math.round(cx + lado * (4 + fa * 10)), Math.round(cy - 46 - Math.sin(fa * Math.PI) * 6 + fa * 20), 1, 2);
      // da bacia do meio para a de baixo, em cortina
      var fb = ((t / 1100) + g / 14) % 1;
      ctx.fillStyle = fb < 0.7 ? '#d9fff4' : '#ffffff';
      ctx.fillRect(Math.round(cx + lado * (14 + fb * 7) + (g % 3) - 1), Math.round(cy - 24 + fb * fb * 20), 1, 2);
    }
    // jato de cima (em volta da estrela)
    var jato = (t / 500) % 1;
    ctx.fillStyle = '#d9fff4';
    ctx.fillRect(cx - 6, cy - 47 - Math.round(Math.sin(jato * Math.PI) * 2), 2, 2);
    ctx.fillRect(cx + 4, cy - 47 - Math.round(Math.cos(jato * Math.PI) * 2), 2, 2);
    // ondinhas na água de baixo: arcos de pixel que abrem, passam de branco a verde-água e somem
    for (var k = 0; k < 3; k++) {
      var an = ((t / 1600) + k / 3) % 1, rx = Math.round(18 + an * 10), ry = Math.round(5 + an * 4);
      if (an > 0.85) continue;
      ctx.fillStyle = an < 0.5 ? '#ffffff' : C.agua2;
      ctx.fillRect(cx - rx, cy + 3, 3, 1); ctx.fillRect(cx + rx - 3, cy + 3, 3, 1);
      ctx.fillRect(cx - rx + 3, cy + 3 + Math.round(ry / 2), 3, 1); ctx.fillRect(cx + rx - 6, cy + 3 + Math.round(ry / 2), 3, 1);
      ctx.fillRect(cx - 2, cy + 3 + ry, 4, 1);
    }
    // brilho que passeia na água
    var br = (t / 2600) % 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(cx - 24 + br * 48), cy + 6, 2, 1);
  };
  I.animarCidade = function (ctx, t) {
    var f = fonte();
    if (f) I.animarObjeto(ctx, f, t);
    if (I.animarPostes) I.animarPostes(ctx, t);
  };
})();
