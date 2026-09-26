/* Observatório, a arte do prédio, parte 4 de 4: o desenho de fora (Mapa.PREDIOS.observatorio): o morro,
   a cúpula e o telescópio, e as estrelinhas que cintilam no prédio (Mapa.PREDIOS_ANIM.observatorio). */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var CONTORNO = Reino.Desenho.K;
  var S = Reino._predios.observatorioCenas;
  var esc = S.esc, mis = S.mis, BAYER4 = S.BAYER4, CINTILA = S.CINTILA;

  /* ================= DESENHO DE FORA (mapa) ================= */
  // helpers de pixel: os de Reino.Desenho (contornoRet e brilho aqui sempre recebem a cor)
  var D = Reino.Desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet, brilho = D.brilho;

  function desenharObservatorio(ctx, px, py, w, h) {
    var cx = px + Math.floor(w / 32) * 16 + 8;   // meio do tile da porta (a escada desce até ele)
    var hx = px + Math.floor(w / 2);
    var grama = '#b2d84e', grama2 = '#d0ea72', grama3 = '#8fb83a';
    var terra = '#d4a57a', terra2 = '#b98457', terra3 = '#e8c49c';
    var j, x, y, m;

    // ---- morro: encosta de terra na frente e o platô gramado em cima ----
    elipse(ctx, hx, py + h - 22, w / 2 - 1, 21, CONTORNO);
    elipse(ctx, hx, py + h - 22, w / 2 - 2, 20, terra);
    elipse(ctx, hx + 8, py + h - 16, w / 2 - 12, 13, mis(terra, terra2, 0.35));
    // camadas de pedra na encosta
    [[py + h - 16, 0], [py + h - 10, 4], [py + h - 5, 2]].forEach(function (c) {
      var yy = c[0], dy = yy - (py + h - 22);
      m = Math.floor((w / 2 - 4) * Math.sqrt(Math.max(0, 1 - (dy * dy) / 400)));
      for (x = hx - m + c[1]; x < hx + m - 5; x += 11) { ret(ctx, x, yy, 6, 1, terra2); ret(ctx, x + 1, yy - 1, 3, 1, terra3); }
    });
    [[14, 66], [80, 64], [24, 74], [72, 73]].forEach(function (s) {
      ret(ctx, px + s[0], py + s[1], 3, 2, '#efe2cc'); ret(ctx, px + s[0], py + s[1] + 2, 3, 1, terra2);
    });
    // platô
    elipse(ctx, hx, py + h - 34, w / 2 - 2, 13, CONTORNO);
    elipse(ctx, hx, py + h - 34, w / 2 - 3, 12, grama);
    elipse(ctx, hx - 8, py + h - 37, w / 2 - 16, 7, grama2);
    // franjinha de grama pendurada na beira do platô
    for (x = px + 6; x < px + w - 8; x += 5) {
      var ux = (x + 1 - hx) / (w / 2 - 3);
      if (Math.abs(ux) >= 1) continue;
      var borda = py + h - 34 + Math.floor(12 * Math.sqrt(1 - ux * ux));
      ret(ctx, x, borda, 3, 2, grama);
      ret(ctx, x, borda + 2, 3, 1, CONTORNO);
      ret(ctx, x - 1, borda + 1, 1, 1, CONTORNO); ret(ctx, x + 3, borda + 1, 1, 1, CONTORNO);
    }
    // tufinhos e florzinhas no platô
    [[10, 47], [30, 53], [86, 48], [80, 55]].forEach(function (s) { ret(ctx, px + s[0], py + s[1], 1, 2, grama3); ret(ctx, px + s[0] + 2, py + s[1] - 1, 1, 3, grama3); });
    [[26, 47, '#ff8ac6'], [88, 43, '#ffe066'], [14, 52, '#ffffff'], [84, 52, '#ff8ac6']].forEach(function (f) {
      var fx = px + f[0], fy = py + f[1];
      ret(ctx, fx - 1, fy, 3, 1, f[2]); ret(ctx, fx, fy - 1, 1, 3, f[2]); ret(ctx, fx, fy, 1, 1, '#fff3a0');
    });

    // ---- antena parabólica no canto do platô ----
    var ax = px + 16, ay = py + 38;
    ret(ctx, ax, ay + 2, 3, 8, CONTORNO); ret(ctx, ax + 1, ay + 2, 1, 7, '#9a8cc4');
    ret(ctx, ax - 2, ay + 9, 7, 2, CONTORNO); ret(ctx, ax - 1, ay + 9, 5, 1, '#c9bfe6');
    elipse(ctx, ax, ay, 7, 5, CONTORNO);
    elipse(ctx, ax, ay, 6, 4, '#f4f2fb');
    elipse(ctx, ax + 1, ay + 1, 4, 2, '#cfd6ea');
    ret(ctx, ax + 1, ay - 7, 1, 7, CONTORNO);
    ret(ctx, ax, ay - 9, 3, 3, CONTORNO); ret(ctx, ax + 1, ay - 8, 1, 1, '#ff5c8a');

    // ---- prédio redondo ----
    var bx = cx - 22, by = py + 26, bw = 44, bh = 27;
    contornoRet(ctx, bx, by, bw, bh, '#f6f0ff');
    for (j = by + 6, m = 0; j < by + bh - 3; j += 6, m++) {
      ret(ctx, bx + 1, j, bw - 2, 1, '#e2d8f4');
      for (x = bx + 4 + (m % 2) * 5; x < bx + bw - 2; x += 10) ret(ctx, x, j - 5, 1, 5, '#ece4f8');
    }
    ret(ctx, bx + bw - 10, by + 1, 9, bh - 2, 'rgba(154,140,196,0.22)');
    ret(ctx, bx + 1, by + 1, 2, bh - 2, '#ffffff');
    // rodapé
    ret(ctx, bx - 1, by + bh - 4, bw + 2, 5, CONTORNO); ret(ctx, bx, by + bh - 3, bw, 3, '#cfc2ea'); ret(ctx, bx, by + bh - 3, bw, 1, '#e2d8f4');

    // ---- cúpula (meia bola prateada, com gomos) ----
    var dy0 = by, rx = 23, ry = 21;
    for (j = 0; j <= ry + 1; j++) {
      m = Math.floor((rx + 1) * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 1) * (ry + 1)))) + 0.3);
      ret(ctx, cx - m, dy0 - j, m * 2 + 1, 1, CONTORNO);
    }
    for (j = 0; j <= ry; j++) {
      m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      for (x = -m; x <= m; x++) {
        var u = m ? x / m : 0, v = j / ry;
        var cor = '#b8c8ea';
        if (u > 0.45) cor = '#9fb2da';
        if (u < -0.15 && v > 0.35 && u > -0.75) cor = '#d6e2f8';
        if (u < -0.3 && u > -0.55 && v > 0.55 && v < 0.8) cor = '#f4f8ff';
        // reflexo de galáxia na cúpula: faixa diagonal em pontilhado, do azul ao roxo e ao magenta
        var fx = cx + x, fy = dy0 - j, lim = (BAYER4[(fy & 3) * 4 + (fx & 3)] + 0.5) / 16;
        var faixa = Math.abs(u * 0.9 - v + 0.2);
        if (faixa < 0.32 && lim < 0.75 - faixa * 1.6) cor = u < -0.3 ? '#4f63d8' : u < 0.35 ? '#7c52e0' : '#b24fe0';
        else if (faixa < 0.5 && lim < 0.25) cor = '#9a8ce8';
        var gomo = Math.abs(Math.abs(u) - 0.55) < 0.5 / Math.max(m, 1) || Math.abs(Math.abs(u) - 0.88) < 0.5 / Math.max(m, 1);
        if (gomo || j === 9) cor = '#8ea2cc';
        ret(ctx, fx, fy, 1, 1, cor);
      }
    }
    // estrelinhas refletidas na cúpula (brancas, ciano e rosa)
    [[-15, 6, '#ffffff'], [-9, 14, '#6fd6ff'], [9, 4, '#ffffff'], [15, 10, '#ff9ad8'], [-18, 3, '#6fd6ff'], [12, 15, '#ffffff'], [-6, 5, '#ff9ad8']].forEach(function (s) {
      ret(ctx, cx + s[0], dy0 - s[1], 1, 1, s[2]);
    });
    brilho(ctx, cx - 12, dy0 - 10, '#ffffff'); ret(ctx, cx - 12, dy0 - 10, 1, 1, '#dff4ff');
    brilho(ctx, cx + 17, dy0 - 5, '#dff4ff');
    // fenda aberta, com céu de noite e estrelinhas lá dentro
    for (j = 1; j <= ry; j++) {
      m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      if (m < 4) continue;
      ret(ctx, cx - 5, dy0 - j, 1, 1, CONTORNO); ret(ctx, cx + 4, dy0 - j, 1, 1, CONTORNO);
      ret(ctx, cx - 4, dy0 - j, 8, 1, '#141852');
      // nebulinha na fenda: roxo e magenta em pontilhado
      for (x = -4; x < 4; x++) {
        var nx = cx + x, ny = dy0 - j, ln = (BAYER4[(ny & 3) * 4 + (nx & 3)] + 0.5) / 16;
        var dn = Math.abs(x + 0.5 + (j - 10) * 0.35);
        if (dn < 2.2 && ln < 0.6) ret(ctx, nx, ny, 1, 1, j > 10 ? '#6c3fd4' : '#b24fe0');
        else if (dn < 3.5 && ln < 0.25) ret(ctx, nx, ny, 1, 1, '#2f3fb8');
      }
    }
    ret(ctx, cx - 3, dy0 - 15, 1, 1, '#ffffff'); ret(ctx, cx + 2, dy0 - 7, 1, 1, '#6fd6ff'); ret(ctx, cx - 2, dy0 - 4, 1, 1, '#ff9ad8');
    // aro da cúpula (roxo com bolinhas douradas)
    ret(ctx, bx - 2, by - 1, bw + 4, 4, CONTORNO); ret(ctx, bx - 1, by, bw + 2, 2, '#8a6cd8');
    for (x = bx + 1; x < bx + bw; x += 5) ret(ctx, x, by, 1, 1, '#ffd34d');
    // telescópio saindo da fenda, para o alto à direita
    var t;
    for (t = 0; t <= 16; t++) ret(ctx, cx - 3 + t, dy0 - 12 - t, 5, 5, CONTORNO);
    for (t = 0; t <= 16; t++) {
      ret(ctx, cx - 2 + t, dy0 - 11 - t, 3, 3, t >= 9 && t <= 10 ? '#ffd34d' : '#f4f0ff');
      ret(ctx, cx + t, dy0 - 9 - t, 1, 1, t >= 9 && t <= 10 ? '#e0a820' : '#c9bfe6');
    }
    ret(ctx, cx + 14, dy0 - 27, 3, 3, '#5fb4ff'); ret(ctx, cx + 15, dy0 - 27, 1, 1, '#d9f2ff');
    ret(ctx, cx - 3, dy0 - 6, 6, 5, CONTORNO); ret(ctx, cx - 2, dy0 - 5, 4, 3, '#6f6198');   // o pé do telescópio

    // ---- plaquinha com a lua e a estrela, porta e janelinhas ----
    contornoRet(ctx, cx - 6, by + 4, 12, 8, '#2a2050');
    circulo(ctx, cx - 2, by + 8, 2, '#ffe066'); ret(ctx, cx - 1, by + 6, 2, 3, '#2a2050'); ret(ctx, cx, by + 9, 1, 1, '#2a2050');
    brilho(ctx, cx + 3, by + 7, '#ffffff');
    var dx = cx - 6, dyy = by + 12, dw = 12, dh = bh - 12;
    ret(ctx, dx - 1, dyy + 2, dw + 2, dh - 2, '#ffd34d');
    elipse(ctx, dx + dw / 2 - 0.5, dyy + 3, dw / 2, 3, '#ffd34d');
    ret(ctx, dx, dyy + 3, dw, dh - 3, '#7c5cff');
    elipse(ctx, dx + dw / 2 - 0.5, dyy + 4, dw / 2 - 1, 3, '#7c5cff');
    ret(ctx, dx + dw / 2 - 1, dyy + 5, 1, dh - 5, esc('#7c5cff', 0.25));
    ret(ctx, dx + dw - 4, dyy + dh / 2 + 2, 2, 2, '#ffd34d');
    ret(ctx, dx + 2, dyy + 6, 1, 1, '#ffe066');
    [bx + 9, bx + bw - 9].forEach(function (jx) {
      circulo(ctx, jx, by + 13, 4, CONTORNO); circulo(ctx, jx, by + 13, 3, '#ffd34d'); circulo(ctx, jx, by + 13, 2, '#2a2050');
      ret(ctx, jx - 1, by + 12, 1, 1, '#ffffff'); ret(ctx, jx + 1, by + 14, 1, 1, '#ffe066');
    });

    // ---- escada do morro, da porta até embaixo ----
    var sy = by + bh;
    for (var k = 0; sy + k * 4 < py + h; k++) {
      var y0 = sy + k * 4, meia = 7 + Math.floor(k / 2);
      var alto = Math.min(5, py + h - y0);
      ret(ctx, cx - meia, y0, meia * 2, alto, CONTORNO);
      ret(ctx, cx - meia + 1, y0 + 1, meia * 2 - 2, alto - 1, k % 2 ? '#eadbb8' : '#f5ead0');
      ret(ctx, cx - meia + 1, y0 + 1, meia * 2 - 2, 1, '#fff8e8');
    }
    // lampiões dos dois lados, no pé da escada
    [cx - 14, cx + 13].forEach(function (lx) {
      var ly = py + h - 16;
      ret(ctx, lx, ly, 2, 15, CONTORNO); ret(ctx, lx, ly + 1, 1, 13, '#6f6198');
      ret(ctx, lx - 2, ly - 5, 6, 6, CONTORNO); ret(ctx, lx - 1, ly - 4, 4, 4, '#ffe066'); ret(ctx, lx - 1, ly - 4, 2, 2, '#fff8c8');
      ret(ctx, lx - 1, ly - 7, 4, 2, CONTORNO);
    });

    // ---- estrelinhas em volta ----
    [[6, 10, '#ffe066'], [w - 8, 8, '#6fd6ff'], [28, 18, '#ffffff'], [w - 5, 30, '#ff9ad8'], [6, 30, '#c9b6ff'], [w - 22, 16, '#ffffff']].forEach(function (s) {
      brilho(ctx, px + s[0], py + s[1], s[2]);
    });
  }

  // estrelinhas que cintilam no prédio (camada animada do mapa, só com Animações ligado): as da cúpula e da
  // fenda trocam de cor (branco → ciano → lilás) e piscam cada uma no seu ritmo; nada de canvas novo
  var CINTILA_MAPA = [
    [-15, 6, 0], [-9, 14, 0], [9, 4, 0], [15, 10, 0], [-18, 3, 0], [12, 15, 0], [-6, 5, 0],   // na cúpula
    [-12, 10, 2], [17, 5, 2],                                                                // as de cruz
    [-3, 15, 1], [2, 7, 1],                                                                  // na fenda
  ];
  function animarObservatorio(ctx, px, py, w, h, t) {
    if (!t) return;
    var cx = px + Math.floor(w / 32) * 16 + 8, dy0 = py + 26;
    for (var i = 0; i < CINTILA_MAPA.length; i++) {
      var s = CINTILA_MAPA[i], x = cx + s[0], y = dy0 - s[1];
      var per = 1100 + (i * 373) % 1500, f = ((t / per) + i * 0.29) % 1;
      var cor = CINTILA[Math.floor(t / (per * 1.6) + i) % 3];
      if (f > 0.7) { ctx.fillStyle = s[2] === 1 ? '#2f3fb8' : '#9a8ce8'; ctx.fillRect(x, y, 1, 1); continue; }   // apagadinha
      ctx.fillStyle = cor;
      if (f > 0.25 && f < 0.45) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); if (s[2] === 2) { ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); } ctx.fillStyle = '#ffffff'; }
      ctx.fillRect(x, y, 1, 1);
    }
  }

  if (window.Mapa && window.Mapa.PREDIOS) {
    window.Mapa.PREDIOS.observatorio = desenharObservatorio;
    (window.Mapa.PREDIOS_ANIM = window.Mapa.PREDIOS_ANIM || {}).observatorio = animarObservatorio;
  }
})();
