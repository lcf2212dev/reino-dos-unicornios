/* Desenho da fachada de cada prédio no mapa: Mapa.PREDIOS[sprite](ctx, px, py, w, h, cores),
   em px do jogo (o retângulo do lugar). Mapa.prerender desenha cada lugar com o sprite dele
   (sem desenho: a torre). Prédio novo = uma função aqui (ou no arquivo do prédio, como a Pet Shop
   e o Observatório) + a entrada em mundo/lugares.js. Brilhos animados: Mapa.PREDIOS_ANIM. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var C = I.C, ret = I.ret, circulo = I.circulo, elipse = I.elipse, triangulo = I.triangulo;
  var contornoRet = I.contornoRet, portaArco = I.portaArco;

  var PREDIOS = {
    castelo: function (ctx, px, py, w, h) {
      var parede = '#fff1d0', parede2 = '#f0d0a0', telhado = '#f0a04a';
      // muralha central
      contornoRet(ctx, px + 20, py + 30, w - 40, h - 30, parede);
      for (var j = py + 36; j < py + h - 4; j += 8) for (var i = px + 22 + ((j / 8) % 2) * 4; i < px + w - 22; i += 10) ret(ctx, i, j, 5, 1, parede2);
      for (var k = px + 20; k < px + w - 20; k += 8) { ret(ctx, k, py + 25, 6, 6, C.contorno); ret(ctx, k + 1, py + 26, 4, 5, parede); }
      // torres
      [px + 2, px + w - 28].forEach(function (tx) {
        contornoRet(ctx, tx, py + 22, 26, h - 22, '#ffe4b8');
        for (var j2 = py + 28; j2 < py + h - 4; j2 += 8) ret(ctx, tx + 4, j2, 18, 1, parede2);
        triangulo(ctx, tx - 3, py + 2, 32, 22, C.contorno);
        triangulo(ctx, tx - 1, py + 4, 28, 19, telhado);
        ret(ctx, tx + 12, py - 6, 1, 9, C.contorno);
        ret(ctx, tx + 13, py - 6, 7, 4, '#ff8a3d');
        ret(ctx, tx + 8, py + 34, 10, 12, C.contorno); ret(ctx, tx + 9, py + 35, 8, 11, '#9fdcff');
        ret(ctx, tx + 9, py + 35, 3, 4, '#e6f7ff');
      });
      // portão
      portaArco(ctx, px + w / 2 - 10, py + h - 26, 20, 26, '#8a5cff');
      // fita da medalha: o disco dourado cobre o meio
      var mx = px + w / 2;
      var yFita = py + 28;
      var yFim = py + h - 29;
      var comp = yFim - yFita + 1;
      ret(ctx, mx - 6, py + 26, 10, 2, '#ffd34d');
      ret(ctx, mx - 6, py + 26, 10, 1, '#fff3a0');
      ret(ctx, mx - 4, yFita, 3, comp, '#ff8a3d');
      ret(ctx, mx - 4, yFita, 1, comp, '#ffd34d');
      ret(ctx, mx + 1, yFita, 3, comp, '#8a5cff');
      ret(ctx, mx + 3, yFita, 1, comp, '#ffd34d');
      ret(ctx, mx - 4, yFim + 1, 1, 2, '#ffd34d');
      ret(ctx, mx - 2, yFim + 1, 1, 2, '#ff8a3d');
      ret(ctx, mx + 1, yFim + 1, 1, 2, '#8a5cff');
      ret(ctx, mx + 3, yFim + 1, 1, 2, '#ffd34d');
      // medalha acima do portão
      circulo(ctx, px + w / 2, py + 40, 6, C.contorno);
      circulo(ctx, px + w / 2, py + 40, 5, '#ffd34d');
      ret(ctx, px + w / 2 - 1, py + 37, 3, 6, '#fff3a0'); ret(ctx, px + w / 2 - 3, py + 39, 7, 2, '#fff3a0');
    },
    museu: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      var parede = cores.parede || '#fff6e4', telhado = cores.telhado || '#f0a04a', det = cores.detalhe || '#ff8a3d';
      var pedra = PA.cor.misturar(parede, '#f0d8b8', 0.62);
      var pedraClara = PA.cor.clarear(pedra, 0.28);
      var junta = PA.cor.misturar(pedra, '#c4a57a', 0.45);
      var degrau = PA.cor.misturar(pedra, '#e7d3b0', 0.35);
      var sombra = PA.cor.escurecer(degrau, 0.16);
      contornoRet(ctx, px + 1, py + h - 6, w - 2, 6, degrau);
      ret(ctx, px + 2, py + h - 2, w - 4, 1, sombra);
      contornoRet(ctx, px + 4, py + h - 10, w - 8, 5, PA.cor.clarear(degrau, 0.12));
      ret(ctx, px + 5, py + h - 6, w - 10, 1, sombra);
      contornoRet(ctx, px + 8, py + h - 14, w - 16, 5, pedraClara);
      ret(ctx, px + 9, py + h - 10, w - 18, 1, sombra);
      contornoRet(ctx, px + 7, py + 26, w - 14, h - 39, pedra);
      for (var j = py + 32; j < py + h - 16; j += 6) ret(ctx, px + 8, j, w - 16, 1, junta);
      [px + 9, px + 23, px + w - 31, px + w - 17].forEach(function (cx) {
        ret(ctx, cx - 1, py + 28, 10, 3, C.contorno);
        ret(ctx, cx, py + 29, 8, 1, pedraClara);
        ret(ctx, cx, py + 31, 8, h - 45, C.contorno);
        ret(ctx, cx + 1, py + 31, 6, h - 45, pedraClara);
        ret(ctx, cx + 5, py + 31, 2, h - 45, PA.cor.escurecer(pedra, 0.18));
      });
      ret(ctx, px + 2, py + 20, w - 4, 7, C.contorno);
      ret(ctx, px + 3, py + 21, w - 6, 5, PA.cor.misturar(PA.cor.clarear(telhado, 0.35), pedraClara, 0.4));
      triangulo(ctx, px + 1, py + 1, w - 2, 20, C.contorno);
      triangulo(ctx, px + 4, py + 4, w - 8, 16, telhado);
      circulo(ctx, px + w / 2, py + 13, 4, '#ffffff');
      ret(ctx, px + w / 2 - 2, py + 11, 5, 1, det);
      ret(ctx, px + w / 2 - 1, py + 12, 3, 1, det);
      ret(ctx, px + w / 2, py + 13, 1, 1, det);
      ret(ctx, px + w / 2 - 1, py + 14, 3, 1, det);
      ret(ctx, px + w / 2 - 2, py + 15, 5, 1, det);
      portaArco(ctx, px + w / 2 - 8, py + h - 36, 16, 23, '#7c5cff');
      function vitral(x, y) {
        ret(ctx, x, y, 8, 10, C.contorno);
        ret(ctx, x + 1, y + 1, 2, 3, det);
        ret(ctx, x + 5, y + 1, 2, 3, telhado);
        ret(ctx, x + 1, y + 5, 2, 4, PA.cor.clarear(telhado, 0.4));
        ret(ctx, x + 5, y + 5, 2, 4, PA.cor.clarear(det, 0.35));
        ret(ctx, x + 3, y + 1, 2, 8, C.contorno);
        ret(ctx, x + 1, y + 4, 6, 1, C.contorno);
        ret(ctx, x + 1, y + 1, 1, 1, '#ffffff');
        ret(ctx, x + 5, y + 6, 1, 1, '#ffffff');
      }
      vitral(px + 13, py + 38);
      vitral(px + w - 21, py + 38);
      function estandarte(x, y) {
        ret(ctx, x - 1, y, 6, 2, C.contorno);
        ret(ctx, x, y, 4, 1, PA.cor.clarear(det, 0.35));
        ret(ctx, x, y + 2, 4, 12, C.contorno);
        ret(ctx, x, y + 2, 3, 11, det);
        ret(ctx, x, y + 2, 1, 11, PA.cor.clarear(det, 0.4));
        ret(ctx, x + 1, y + 6, 1, 2, '#ffffff');
        ret(ctx, x, y + 13, 1, 2, telhado);
        ret(ctx, x + 2, y + 13, 1, 2, telhado);
      }
      estandarte(px + w / 2 - 14, py + 32);
      estandarte(px + w / 2 + 10, py + 32);
      var qx = px + w / 2 - 4, qy = py + 32;
      contornoRet(ctx, qx, qy, 9, 10, pedraClara);
      ret(ctx, qx + 2, qy + 2, 5, 6, PA.cor.clarear(telhado, 0.5));
      ret(ctx, qx + 2, qy + 5, 5, 3, PA.cor.misturar(det, pedra, 0.35));
      ret(ctx, qx + 3, qy + 4, 3, 2, telhado);
      ret(ctx, qx + 4, qy + 3, 1, 1, '#ffffff');
    },
    estabulo: function (ctx, px, py, w, h) {
      contornoRet(ctx, px + 4, py + 22, w - 8, h - 22, '#f6e7c4');
      for (var i = px + 10; i < px + w - 6; i += 7) ret(ctx, i, py + 24, 1, h - 25, '#e6d2a8');
      // telhado
      ctx.fillStyle = C.contorno;
      for (var j = 0; j < 24; j++) { var m = Math.round(12 + j * (w / 2 - 12) / 23); ctx.fillRect(px + w / 2 - m - 2, py + j, (m + 2) * 2, 1); }
      ctx.fillStyle = '#f0a04a';
      for (var j2 = 2; j2 < 23; j2++) { var m2 = Math.round(10 + j2 * (w / 2 - 14) / 23); ctx.fillRect(px + w / 2 - m2, py + j2, m2 * 2, 1); }
      for (var j3 = 6; j3 < 23; j3 += 5) { var m3 = Math.round(10 + j3 * (w / 2 - 14) / 23); ret(ctx, px + w / 2 - m3, py + j3, m3 * 2, 1, '#d9842f'); }
      // palha no vão do telhado
      ret(ctx, px + w / 2 - 6, py + 8, 12, 10, C.contorno);
      ret(ctx, px + w / 2 - 5, py + 9, 10, 8, '#f5c842');
      for (var s = 0; s < 4; s++) ret(ctx, px + w / 2 - 4 + (s % 2), py + 10 + s * 2, 7, 1, s % 2 ? '#ffe066' : '#d9a93a');
      ret(ctx, px + w / 2 - 3, py + 6, 1, 4, '#ffe066');
      ret(ctx, px + w / 2 + 1, py + 5, 1, 5, '#f5c842');
      ret(ctx, px + w / 2 + 3, py + 7, 1, 3, '#ffe066');
      // porta de celeiro
      var dx = px + w / 2 - 10, dy = py + h - 26;
      contornoRet(ctx, dx, dy, 20, 26, '#ff8a3d');
      ctx.fillStyle = '#ffffff';
      for (var t = 0; t < 22; t++) { ctx.fillRect(dx + 1 + Math.round(t * 18 / 22), dy + 2 + t, 1, 1); ctx.fillRect(dx + 18 - Math.round(t * 18 / 22), dy + 2 + t, 1, 1); }
      ret(ctx, dx + 1, dy + 1, 18, 1, '#ffffff'); ret(ctx, dx + 9, dy + 1, 2, 25, '#ffffff');
      // monte de feno à esquerda da porta
      elipse(ctx, px + 18, py + h - 10, 11, 6, C.contorno);
      elipse(ctx, px + 18, py + h - 10, 10, 5, '#f5c842');
      elipse(ctx, px + 16, py + h - 12, 6, 2, '#ffe066');
      ret(ctx, px + 12, py + h - 16, 1, 5, '#ffd34d');
      ret(ctx, px + 21, py + h - 17, 1, 6, '#ffe066');
      ret(ctx, px + 25, py + h - 14, 1, 4, '#d9a93a');
      // ferradura na parede direita
      var hx = px + w - 22, hy = py + 30;
      ret(ctx, hx, hy, 3, 10, C.contorno);
      ret(ctx, hx + 8, hy, 3, 10, C.contorno);
      ret(ctx, hx, hy + 8, 11, 4, C.contorno);
      ret(ctx, hx + 1, hy + 1, 2, 8, '#ffd34d');
      ret(ctx, hx + 8, hy + 1, 2, 8, '#ffd34d');
      ret(ctx, hx + 1, hy + 8, 9, 3, '#ffd34d');
      ret(ctx, hx + 1, hy + 3, 1, 1, '#fff3a0');
      ret(ctx, hx + 9, hy + 3, 1, 1, '#fff3a0');
      ret(ctx, hx + 4, hy + 9, 3, 1, '#d9a93a');
    },
    bau: function (ctx, px, py, w, h) {
      // moedas no topo
      [[24, 5], [36, 2], [48, 5], [58, 3]].forEach(function (m) {
        var cx = px + m[0], cy = py + m[1] + 3;
        circulo(ctx, cx, cy, 3, C.contorno);
        circulo(ctx, cx, cy, 2, '#ffd34d');
        ret(ctx, cx - 1, cy - 1, 2, 1, '#ffffff');
        ret(ctx, cx - 1, cy, 1, 1, '#fff3a0');
      });
      // tampa arredondada
      elipse(ctx, px + w / 2, py + 22, w / 2 - 2, 14, C.contorno);
      elipse(ctx, px + w / 2, py + 22, w / 2 - 4, 12, '#b77a44');
      elipse(ctx, px + w / 2 - 6, py + 18, w / 2 - 16, 6, '#c98a4b');
      // corpo
      contornoRet(ctx, px + 2, py + 24, w - 4, h - 24, '#c98a4b');
      ret(ctx, px + 3, py + 24, w - 6, 4, '#ffd34d'); ret(ctx, px + 3, py + 28, w - 6, 1, '#d9a93a');
      [px + 10, px + w - 16].forEach(function (bx) { ret(ctx, bx, py + 10, 6, h - 10, '#ffd34d'); ret(ctx, bx + 4, py + 10, 2, h - 10, '#d9a93a'); });
      // porta-fechadura
      var dx = px + w / 2 - 8;
      contornoRet(ctx, dx, py + h - 24, 16, 24, '#6b4428');
      ret(ctx, dx + 2, py + h - 22, 12, 1, '#ffd34d');
      circulo(ctx, dx + 8, py + h - 15, 2, '#ffd34d'); ret(ctx, dx + 7, py + h - 14, 3, 5, '#ffd34d');
    },
    loja: function (ctx, px, py, w, h) {
      // caule / casa
      contornoRet(ctx, px + 12, py + 26, w - 24, h - 26, '#fff1dc');
      ret(ctx, px + w - 22, py + 28, 8, h - 29, '#f5dfc0');
      // chapéu de cogumelo
      elipse(ctx, px + w / 2, py + 18, w / 2 - 1, 17, C.contorno);
      elipse(ctx, px + w / 2, py + 17, w / 2 - 3, 15, '#ff8a3d');
      elipse(ctx, px + w / 2 - 8, py + 11, 14, 6, '#ffc27a');
      ret(ctx, px + 2, py + 26, w - 4, 6, C.contorno); ret(ctx, px + 4, py + 26, w - 8, 4, '#e07028');
      [[14, 16, 3], [58, 12, 3], [66, 18, 2], [28, 21, 2], [50, 21, 2]].forEach(function (b) {
        circulo(ctx, px + b[0], py + b[1], b[2] + 1, '#e07028');
        circulo(ctx, px + b[0], py + b[1], b[2], '#ffffff');
      });
      // janela redonda
      circulo(ctx, px + 22, py + 42, 5, C.contorno); circulo(ctx, px + 22, py + 42, 4, '#c8f3ea'); ret(ctx, px + 20, py + 40, 2, 2, '#ffffff');
      // porta
      portaArco(ctx, px + w / 2 - 7, py + h - 22, 14, 22, '#9b5cff', '#ffe066');
      contornoRet(ctx, px + 14, py + 52, 16, 8, '#c98a4b');
      ret(ctx, px + 16, py + 50, 12, 3, '#7ea832');
      ret(ctx, px + 17, py + 50, 8, 1, '#b6d24e');
      [[18, 50, '#ff8a3d'], [22, 49, '#ffe066'], [26, 50, '#ffffff']].forEach(function (f) {
        ret(ctx, px + f[0] - 1, py + f[1], 3, 1, f[2]);
        ret(ctx, px + f[0], py + f[1] - 1, 1, 3, f[2]);
        ret(ctx, px + f[0], py + f[1], 1, 1, '#fff3a0');
      });
      // brilhinhos
      [[6, 36], [72, 40], [66, 50]].forEach(function (s) { ret(ctx, px + s[0], py + s[1] - 1, 1, 3, '#ffffff'); ret(ctx, px + s[0] - 1, py + s[1], 3, 1, '#ffffff'); });
    },
    escola: function (ctx, px, py, w, h) {
      var parede = '#fff1e8', parede2 = '#f6dccb', telhado = '#ff7a8a', telhado2 = '#e0506a';
      var cx = px + w / 2;
      function letra(linhas, x, y, cor) {
        linhas.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (l[i] === '#') ret(ctx, x + i, y + j, 1, 1, cor); });
      }
      // telhado principal
      triangulo(ctx, px, py + 16, w, 26, C.contorno);
      triangulo(ctx, px + 3, py + 19, w - 6, 22, telhado);
      for (var tj = py + 26; tj < py + 40; tj += 5) {
        var meia = Math.round((w - 6) / 2 * (tj - py - 19 + 1) / 22) - 2;
        for (var tx = cx - meia + 2; tx < cx + meia - 1; tx += 6) ret(ctx, tx, tj, 3, 1, telhado2);
      }
      // beiral e bandeirinhas
      ret(ctx, px + 2, py + 40, w - 4, 4, C.contorno);
      ret(ctx, px + 3, py + 41, w - 6, 2, telhado2);
      // paredes
      contornoRet(ctx, px + 6, py + 43, w - 12, h - 49, parede);
      for (var j = py + 49; j < py + h - 7; j += 6) ret(ctx, px + 7, j, w - 14, 1, parede2);
      var bandeiras = ['#ffd34d', '#6fdc8c', '#5fb4ff', '#a66bff', '#ff9d2e'];
      for (var b = 0, bx = px + 9; bx < px + w - 12; bx += 7, b++) {
        var cb = bandeiras[b % bandeiras.length];
        ret(ctx, bx, py + 44, 5, 1, cb); ret(ctx, bx + 1, py + 45, 3, 1, cb); ret(ctx, bx + 2, py + 46, 1, 1, cb);
      }
      // janelas
      [px + 12, px + w - 24].forEach(function (jx) {
        var jy = py + 50;
        contornoRet(ctx, jx, jy, 12, 12, '#9fdcff');
        ret(ctx, jx + 1, jy + 1, 4, 4, '#e6f7ff');
        ret(ctx, jx + 5, jy + 1, 2, 10, C.contorno);
        ret(ctx, jx + 1, jy + 5, 10, 2, C.contorno);
        ret(ctx, jx - 1, jy + 12, 14, 2, '#c98a4b');
        ret(ctx, jx + 1, jy + 11, 2, 1, '#ff7eb6'); ret(ctx, jx + 9, jy + 11, 2, 1, '#ffe066');
      });
      // degrau e porta
      contornoRet(ctx, cx - 14, py + h - 7, 28, 7, '#e8d3a8');
      ret(ctx, cx - 13, py + h - 2, 26, 1, '#d4bc8c');
      portaArco(ctx, cx - 7, py + h - 29, 14, 22, '#7c5cff');
      // lousa com ABC no telhado
      contornoRet(ctx, cx - 11, py + 28, 22, 11, '#5fae6a');
      ret(ctx, cx - 10, py + 29, 20, 1, '#8fd08f');
      letra(['.#.', '#.#', '###', '#.#', '#.#'], cx - 7, py + 31, '#ffffff');
      letra(['##.', '#.#', '##.', '#.#', '##.'], cx - 2, py + 31, '#ffffff');
      letra(['.##', '#..', '#..', '#..', '.##'], cx + 3, py + 31, '#ffffff');
      // torre do sino
      contornoRet(ctx, cx - 8, py + 9, 16, 19, '#fff8ee');
      ret(ctx, cx - 5, py + 13, 10, 10, '#8a6aa8');
      ret(ctx, cx - 4, py + 12, 8, 1, '#8a6aa8');
      ret(ctx, cx - 2, py + 14, 4, 1, '#ffd34d');
      ret(ctx, cx - 3, py + 15, 6, 4, '#ffd34d');
      ret(ctx, cx - 4, py + 19, 8, 2, '#ffd34d');
      ret(ctx, cx - 2, py + 15, 1, 3, '#fff3a0');
      ret(ctx, cx - 1, py + 21, 2, 1, '#d9a93a');
      triangulo(ctx, cx - 12, py, 24, 11, C.contorno);
      triangulo(ctx, cx - 10, py + 2, 20, 8, telhado);
      ret(ctx, cx, py - 5, 1, 6, C.contorno);
      ret(ctx, cx + 1, py - 5, 5, 3, '#ffd34d');
      ret(ctx, cx + 1, py - 5, 5, 1, '#fff3a0');
    },
    relogio: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      var parede = cores.parede || '#eef3ff', telhado = cores.telhado || '#4a6cd4', det = cores.detalhe || '#ffcf3d';
      var pedra = PA.cor.misturar(parede, '#d8c8a8', 0.35), junta = PA.cor.escurecer(pedra, 0.14);
      var cx = px + w / 2;
      // corpo da torre
      contornoRet(ctx, cx - 17, py + 36, 34, h - 36, pedra);
      for (var j = py + 42; j < py + h - 2; j += 6) ret(ctx, cx - 16, j, 32, 1, junta);
      ret(ctx, cx + 10, py + 37, 6, h - 38, PA.cor.escurecer(pedra, 0.08));
      // janelinhas dos lados
      [cx - 13, cx + 8].forEach(function (jx) {
        contornoRet(ctx, jx, py + 42, 5, 8, '#9fdcff');
        ret(ctx, jx + 1, py + 43, 2, 2, '#e6f7ff');
      });
      // caixa do relógio
      contornoRet(ctx, cx - 20, py + 14, 40, 24, parede);
      ret(ctx, cx - 19, py + 15, 38, 2, PA.cor.clarear(det, 0.3));
      ret(ctx, cx - 19, py + 35, 38, 2, det);
      // mostrador
      circulo(ctx, cx, py + 26, 11, C.contorno);
      circulo(ctx, cx, py + 26, 10, det);
      circulo(ctx, cx, py + 26, 8, '#ffffff');
      [[0, -7], [7, 0], [0, 7], [-7, 0]].forEach(function (m) { ret(ctx, cx + m[0] - 1, py + 26 + m[1] - 1, 2, 2, telhado); });
      [[5, -5], [5, 5], [-5, 5], [-5, -5]].forEach(function (m) { ret(ctx, cx + m[0] - 1, py + 26 + m[1] - 1, 1, 1, '#8a8aa8'); });
      ret(ctx, cx - 1, py + 20, 2, 7, C.contorno);          // ponteiro grande
      ret(ctx, cx - 1, py + 25, 6, 2, C.contorno);          // ponteiro pequeno
      ret(ctx, cx - 1, py + 25, 2, 2, '#ff5c8a');
      // telhadinho pontudo
      ret(ctx, cx - 18, py + 12, 36, 3, C.contorno);
      triangulo(ctx, cx - 16, py - 4, 32, 17, C.contorno);
      triangulo(ctx, cx - 13, py - 1, 26, 13, telhado);
      ret(ctx, cx - 2, py + 5, 1, 6, PA.cor.clarear(telhado, 0.3));
      ret(ctx, cx, py - 9, 1, 6, C.contorno);
      circulo(ctx, cx, py - 9, 2, det);
      // porta
      portaArco(ctx, cx - 7, py + h - 20, 14, 20, '#7c5cff', det);
      // brilhinhos
      [[6, 20], [74, 30]].forEach(function (s) { ret(ctx, px + s[0], py + s[1] - 1, 1, 3, '#ffffff'); ret(ctx, px + s[0] - 1, py + s[1], 3, 1, '#ffffff'); });
    },
    // a Pet Shop e o Observatório desenham a própria fachada nos arquivos do prédio
    // (js/interiores/petshop/petshop.js e observatorio/cenas.js registram Mapa.PREDIOS.petshop/observatorio)
    torre: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      var parede = cores.parede || '#fff6e4', telhado = cores.telhado || '#f0a04a';
      contornoRet(ctx, px + 12, py + 22, w - 24, h - 22, parede);
      triangulo(ctx, px + 6, py + 1, w - 12, 23, C.contorno);
      triangulo(ctx, px + 9, py + 4, w - 18, 19, telhado);
      portaArco(ctx, px + w / 2 - 7, py + h - 22, 14, 22, '#7c5cff');
    },
  };

  Mapa.PREDIOS = PREDIOS;
  // brilhos animados de um prédio, por cima da imagem fixa (o prédio registra Mapa.PREDIOS_ANIM[sprite];
  // mesmos argumentos do desenho de fora, mais o tempo t). Só roda com Animações ligado.
  Mapa.PREDIOS_ANIM = Mapa.PREDIOS_ANIM || {};
})();
