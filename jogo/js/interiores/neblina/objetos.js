/* Bosque da Neblina, o chão, o céu e os objetos-assinatura (prefixo neblina-): floresta fria e fofa, teal e lilás, com
   névoa em camadas, cogumelos que brilham e a lanterna quente como único ponto de calor.
   Piso 'neblina-neblina': grama fria em manchas grandes (luz, sombra, musgo, grama molhada), poças de névoa, capim em
   tufos, florzinhas em moitas e a trilha de terra de cantos redondos. Parede 'neblina-copas': 3 camadas de copa (a escura
   na frente), luar frio, cipós e cogumelos no tronco. Fundo I.FUNDOS.neblina: a faixa de baixo é uma vista de serras de
   copas com névoa; o resto repete o mesmo desenho. Objetos: árvores (3), arvoreta, arbusto, pedra, tronco, samambaia,
   flores, folhas, cogumelo (o interativo), cogumelo-luz, banco e névoa (animados), poça, teia, vaga-lumes e os
   interativos placa, lanterna e árvore velha. Tudo em pixel (sem arc/gradiente); alfa só em sombra, luz e névoa; o
   pontilhado é o 2×2 ordenado. A trilha (P.trilha) vem de neblina.js: o piso a lê na hora de desenhar, nunca na carga.
   Divide Reino._predios.neblina. No carregamento só registra funções: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).neblina = R._predios.neblina || {};
  var PL = R._predios.planetas || {};
  function tempo(t) { return PL.tempo ? PL.tempo(t) : ((R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0)); }
  var COPA = ['#46546e', '#5d6f8e', '#8394b2'], LUAR = '#b8c8e4';
  var TRONCO = ['#4a4256', '#6a6078', '#8a8098'], LIQ = '#9fc0a8', MUSGO = '#7e9a86';
  var CIANO = '#7ff2e0', CIANO2 = '#3fd0b8', PALIDO = '#d8fff8', LILAS = '#c4b6dc';
  var NEV = 'rgba(216,222,236,0.4)', NEV2 = 'rgba(232,238,246,0.5)';

  // pontilhado ordenado 2×2 (f troca a fase do xadrez)
  function pont(ctx, x, y, w, h, c, f) {
    ctx.fillStyle = c;
    for (var j = 0; j < h; j += 2) for (var i = 0; i < w; i += 2) if ((((i >> 1) + (j >> 1) + (f || 0)) & 1) === 0) ctx.fillRect(x + i, y + j, Math.min(2, w - i), Math.min(2, h - j));
  }
  // véu/halo: n elipses achatadas sobrepostas (cada anel soma um alfa baixo `a`), beirada irregular por linha e 1 px solto só na transição
  function veu(ctx, cx, cy, rx, ry, rgb, a, s, n) {
    ctx.fillStyle = 'rgba(' + rgb + ',' + a + ')';
    for (var k = 0; k < n; k++) {
      var sc = 1 - k * 0.22, ay = ry * sc;
      for (var y = Math.floor(cy - ay); y < Math.ceil(cy + ay); y++) {
        var dy = (y + 0.5 - cy) / ay;
        if (dy * dy >= 1) continue;
        var hw = rx * sc * Math.sqrt(1 - dy * dy) + (sorte(y, s, k + 7) - 0.5) * 3;
        if (hw < 1) continue;
        ctx.fillRect(Math.round(cx - hw), y, Math.round(hw * 2), 1);
        if (k === 0) { if (sorte(y, s, 31) < 0.35) ctx.fillRect(Math.round(cx - hw) - 1, y, 1, 1); if (sorte(y, s, 32) < 0.35) ctx.fillRect(Math.round(cx + hw), y, 1, 1); }
      }
    }
  }
  function nev(ctx, cx, cy, rx, ry, a, f) { veu(ctx, cx, cy, rx, ry, '232,238,248', Math.max(0.03, a * 0.17), (f || 0) + 3, 4); }
  function vr(gx, gy, s) {   // ruído de valor (coordenadas globais em tiles), suave
    var x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var t = sorte(x0, y0, s) + (sorte(x0 + 1, y0, s) - sorte(x0, y0, s)) * fx, b = sorte(x0, y0 + 1, s) + (sorte(x0 + 1, y0 + 1, s) - sorte(x0, y0 + 1, s)) * fx;
    return t + (b - t) * fy;
  }
  // folhagem em bolas [cx, cy, raio]: contorno só por fora, 2 tons e o luar frio em cima/à esquerda
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) {
      circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]);
      if (b[2] > 5) ret(ctx, px + b[0] - Math.round(b[2] * 0.6), py + b[1] - Math.round(b[2] * 0.75), 2, 1, LUAR);
    });
  }
  P.folhagem = folhagem;
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(52,56,84,0.26)'); }
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 2, h, TRONCO[2]); ret(ctx, x + w - 2, y, 2, h, TRONCO[0]); }
  function raizes(ctx, px, py, x0, x1) {
    ret(ctx, px + x0 - 3, py + 10, 4, 3, K); ret(ctx, px + x1 - 1, py + 10, 4, 3, K);
    ret(ctx, px + x0 - 2, py + 11, 2, 2, TRONCO[1]); ret(ctx, px + x1, py + 11, 2, 2, TRONCO[0]);
  }
  function musgoTronco(ctx, x, y, n, s) { for (var i = 0; i < n; i++) { ret(ctx, x + (i * 3) % 5, y + i * 4 + (s & 3), 2, 2, i & 1 ? MUSGO : LIQ); } }
  function cipo(ctx, x, y, n) { ret(ctx, x, y, 1, n, MUSGO); ret(ctx, x, y + n, 2, 1, LIQ); }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

  /* ---------- copas: 3 camadas de bolas na grade global; a escura fica na frente (embaixo), a clara atrás (em cima) ---------- */
  var CAMADAS = [['#46546e', '#5d6f8e', '#8394b2'], ['#3a4660', '#46546e', '#5d6f8e'], ['#2c3650', '#3a4660', '#46546e']];
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, CAMADAS[2][0]);
    var c0 = Math.floor((x - 9) / 12), c1 = Math.floor((x + w + 9) / 12);
    for (var k = 0; k < 3; k++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + k * 4 + Math.round((sorte(cc, k, 1) - 0.5) * 6), by = y + 4 + k * 9 + Math.round(sorte(cc, k, 2) * 3), r = 7 + (sorte(cc, k, 5) < 0.3 ? 1 : 0);
      circulo(ctx, bx, by, r, CAMADAS[k][0]); circulo(ctx, bx - 1, by - 1, r - 2, CAMADAS[k][1]); circulo(ctx, bx - 2, by - 3, 2, CAMADAS[k][2]);
      ret(ctx, bx - r + 2, by - r + 3, 2, 1, LUAR);
      if (k < 2 && sorte(cc, k, 3) < 0.45) pont(ctx, bx - 3, by + 4, 8, 2, NEV, cc);
    }
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- o piso: campos de manchas (distância ao centro mais próximo de cada célula, com a borda mexida) ---------- */
  function campo(gx, gy, cel, s) {   // < 1 = dentro da mancha (gx, gy em tiles)
    var cx = Math.floor(gx / cel), cy = Math.floor(gy / cel), m = 9;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var ax = cx + dx, ay = cy + dy, qx = (ax + 0.15 + 0.7 * sorte(ax, ay, s)) * cel, qy = (ay + 0.15 + 0.7 * sorte(ax, ay, s + 1)) * cel;
      var d = Math.sqrt((gx - qx) * (gx - qx) + (gy - qy) * (gy - qy) * 1.3) / (cel * (0.3 + 0.2 * sorte(ax, ay, s + 2)));
      if (d < m) m = d;
    }
    return m;
  }
  var PISO = { base: '#6f908a', mancha: '#668a86', sombra: '#5c7e7c', luz: '#7c9c96', capim: '#587a76', musgo: '#5f8470', musgo2: '#4f7464', molhada: '#5f8582', nevoa: '#a8bfc4' };
  var TR = { base: '#6f616b', clara: '#7e707a', escura: '#605260', umida: '#4e4352' };
  // a trilha: terra molhada marrom-arroxeada, com raízes, pedrinhas, poças de reflexo frio e musgo/líquen invadindo a beirada
  function trilhaTile(ctx, px, py, tx, ty) {
    var T = P.trilha, c = T(tx, ty - 1), b = T(tx, ty + 1), e = T(tx - 1, ty), d = T(tx + 1, ty), i;
    ret(ctx, px, py, 16, 16, TR.base);
    if (sorte(tx, ty, 31) < 0.7) ret(ctx, px + 1 + Math.floor(sorte(tx, ty, 32) * 7), py + 2 + Math.floor(sorte(tx, ty, 33) * 9), 5, 2, TR.clara);
    if (sorte(tx, ty, 34) < 0.6) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 35) * 6), py + 7 + Math.floor(sorte(tx, ty, 36) * 6), 5, 2, TR.escura);
    var s = sorte(tx, ty, 60);
    if (s < 0.07) { elipse(ctx, px + 6, py + 8, 3, 2, '#7e7c90'); elipse(ctx, px + 6, py + 7, 2, 1, '#a6a8ba'); elipse(ctx, px + 11, py + 10, 2, 1, '#7e7c90'); }   // pedrinhas frias
    else if (s < 0.2) { elipse(ctx, px + 8, py + 10, 6, 3, '#46607e'); elipse(ctx, px + 8, py + 10, 5, 2, '#6f94b8'); ret(ctx, px + 5, py + 9, 3, 1, '#d4e8f8'); ret(ctx, px + 10, py + 11, 1, 1, '#a8c8e4'); ret(ctx, px + 2, py + 11, 1, 1, '#46607e'); ret(ctx, px + 13, py + 9, 1, 1, '#46607e'); }   // poça: reflexo frio e brilho
    else if (s < 0.32) { var lx = px + 2 + Math.floor(sorte(tx, ty, 61) * 10), ly = py + 3 + Math.floor(sorte(tx, ty, 62) * 9); ret(ctx, lx, ly, 3, 2, '#6a5062'); ret(ctx, lx + 1, ly, 1, 1, '#8a7080'); }   // folha
    else if (s < 0.46) { ret(ctx, px + 1, py + 5, 8, 1, TR.escura); ret(ctx, px + 8, py + 6, 6, 1, TR.escura); ret(ctx, px + 2, py + 4, 6, 1, TR.clara); }   // raiz
    for (i = 0; i < 2; i++) if (sorte(tx, ty, 80 + i) < 0.4) { var mx = px + 2 + Math.floor(sorte(tx, ty, 82 + i) * 11), my = py + 2 + Math.floor(sorte(tx, ty, 84 + i) * 11); ret(ctx, mx, my, 2, 2, MUSGO); ret(ctx, mx, my, 1, 1, LIQ); }
    // a beirada: onde não há trilha, o próprio chão (mesmo ruído do piso, sem emenda) entra em franja irregular com dither de 1 px
    [c, b, e, d].forEach(function (tem, k) {
      if (tem) return;
      for (var p = 0; p < 16; p++) {
        var g = (k < 2 ? tx : ty) * 16 + p, dd = 2 + Math.floor(vr(g / 4, k, 77) * 3.4);
        for (var q = 0; q <= dd; q++) {
          if (q >= dd - 1 && ((p + q) & 1)) continue;
          var x = k === 2 ? q : k === 3 ? 15 - q : p, y = k === 0 ? q : k === 1 ? 15 - q : p;
          ctx.fillStyle = chao(tx + (x >> 1) / 8, ty + (y >> 1) / 8); ctx.fillRect(px + x, py + y, 1, 1);
        }
        if (sorte(g, k, 72) < 0.25) ret(ctx, k < 2 ? px + p : (k === 2 ? px + dd + 1 : px + 14 - dd), k < 2 ? (k === 0 ? py + dd + 1 : py + 14 - dd) : py + p, 1, 1, PISO.capim);
      }
    });
  }
  var CAMPOS = [[0.2, 100, 0.36, PISO.luz], [0.25, 170, 0.33, PISO.sombra], [0.18, 110, 0.38, PISO.mancha], [0.3, 120, 0.27, PISO.molhada], [0.22, 130, 0.3, PISO.musgo], [0.22, 130, 0.2, PISO.musgo2]];
  function chao(gx, gy) {   // a cor do chão (sem trilha) numa célula 2×2: a mesma conta do piso
    var r = PISO.base;
    CAMPOS.forEach(function (c) { if (vr(gx * c[0], gy * c[0], c[1]) < c[2]) r = c[3]; });
    return r;
  }
  I.PISOS['neblina-neblina'] = { cores: { piso: PISO.base, piso2: PISO.mancha, detalhe: PISO.capim, luz: PISO.luz, nevoa: PISO.nevoa },
    desenhar: function (ctx, px, py, tx, ty) {
      var i, j;
      ret(ctx, px, py, 16, 16, PISO.base);
      if (P.trilha && P.trilha(tx, ty)) { trilhaTile(ctx, px, py, tx, ty); return; }
      // manchas orgânicas: ruído de valor em coordenadas globais, células 2×2 e a beirada em dither de 1 px
      for (j = 0; j < 8; j++) for (i = 0; i < 8; i++) {
        var gx = tx + i / 8, gy = ty + j / 8, x = px + i * 2, y = py + j * 2;
        CAMPOS.forEach(function (c) {
          var n = vr(gx * c[0], gy * c[0], c[1]);
          if (n < c[2] - 0.025) ret(ctx, x, y, 2, 2, c[3]);
          else if (n < c[2] + 0.025) { ctx.fillStyle = c[3]; if ((i + j) & 1) { ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y + 1, 1, 1); } else { ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 1, y + 1, 1, 1); } }
        });
      }
      // capim fino em tufos: só onde o campo de tufos pede (nada uniforme)
      if (campo(tx + 0.5, ty + 0.5, 5, 150) < 0.9) for (i = 0; i < 3; i++) {
        var cx = px + 2 + Math.floor(sorte(tx, ty, 10 + i) * 12), cy = py + 6 + Math.floor(sorte(tx, ty, 20 + i) * 9);
        ret(ctx, cx, cy - 2, 1, 3, PISO.capim); ret(ctx, cx + 1, cy - 3, 1, 2, PISO.capim); ret(ctx, cx - 1, cy - 1, 1, 2, PISO.capim);
      }
      // florzinhas pálidas em moitas
      if (campo(tx + 0.5, ty + 0.5, 10, 160) < 0.55 && sorte(tx, ty, 50) < 0.6) {
        var fx = px + 3 + Math.floor(sorte(tx, ty, 51) * 10), fy = py + 3 + Math.floor(sorte(tx, ty, 52) * 10);
        ret(ctx, fx, fy, 2, 2, ['#b8a8d8', '#8fa8e0', '#c4b6dc'][Math.floor(sorte(tx, ty, 53) * 3)]); ret(ctx, fx, fy, 1, 1, '#e6dcf4');
      }
      // um fungo minúsculo ciano, raro
      if (sorte(tx, ty, 54) < 0.03) { ret(ctx, px + 5, py + 9, 2, 2, CIANO2); ret(ctx, px + 5, py + 9, 1, 1, PALIDO); }
    } };

  /* ---------- a parede: copas em 3 camadas, fios de névoa, cipós e um cogumelo ciano no tronco ---------- */
  I.PAREDES['neblina-copas'] = { cores: { parede: '#46546e', parede2: '#5d6f8e', rodape: '#2c3650', detalhe: '#8394b2' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 21, 3, 9, '#4a4256'); ret(ctx, px + t, py + 21, 1, 9, '#6a6078'); ret(ctx, px + t + 3, py + 25, 2, 1, '#4a4256');
      if (sorte(tx, 0, 62) < 0.35) { ret(ctx, px + t + 3, py + 24, 3, 2, CIANO2); ret(ctx, px + t + 3, py + 24, 2, 1, CIANO); }
      if (sorte(tx, 0, 63) < 0.5) cipo(ctx, px + 2 + Math.floor(sorte(tx, 0, 64) * 11), py + 12, 4 + Math.floor(sorte(tx, 0, 65) * 6));
      ret(ctx, px, py + 29, 16, 3, '#2c3650');
      if (sorte(tx, 0, 61) < 0.6) { pont(ctx, px + 1, py + 26, 14, 3, NEV, tx); pont(ctx, px + 4, py + 18, 9, 2, NEV, tx + 1); }
    } };

  /* ---------- as árvores (2×1, altas): a comum, a esguia e a velha ---------- */
  I.objeto('neblina-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 6, 8, 20); raizes(ctx, px, py, 12, 20); musgoTronco(ctx, px + 13, py - 2, 3, 1);
      folhagem(ctx, px, py, [[16, -20, 14], [6, -10, 9], [26, -10, 9], [16, -8, 10]], COPA);
      pont(ctx, px + 4, py - 24, 10, 2, NEV2, 0); pont(ctx, px + 18, py - 14, 8, 2, NEV, 1); pont(ctx, px + 11, py - 3, 10, 2, NEV, 0);
      ret(ctx, px + 12, py - 32, 2, 1, '#e6eeff'); ret(ctx, px + 23, py - 27, 2, 2, '#e6eeff'); cipo(ctx, px + 8, py - 1, 6);
    } });
  I.objeto('neblina-arvore-p', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 10);
      tronco(ctx, px + 14, py - 8, 5, 22); raizes(ctx, px, py, 14, 18); musgoTronco(ctx, px + 15, py - 4, 3, 2);
      folhagem(ctx, px, py, [[16, -27, 9], [16, -15, 10], [9, -8, 6], [23, -8, 6]], ['#3a4660', '#4c5c7c', '#7284a4']);
      pont(ctx, px + 9, py - 19, 12, 2, NEV2, 1); pont(ctx, px + 8, py - 6, 14, 2, NEV, 0); cipo(ctx, px + 21, py - 2, 8); cipo(ctx, px + 10, py - 3, 5);
      ret(ctx, px + 14, py - 36, 2, 1, '#e6eeff'); ret(ctx, px + 21, py - 17, 1, 1, CIANO);
    } });
  // a árvore velha (interativa): torta, de copa assimétrica, com teia e um cogumelo ciano no tronco
  I.objeto('neblina-arvore-velha', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 7, py + 4, 20, 11, K); ret(ctx, px + 8, py + 4, 18, 10, TRONCO[1]); ret(ctx, px + 8, py + 4, 4, 10, TRONCO[2]); ret(ctx, px + 22, py + 4, 4, 10, TRONCO[0]);
      ret(ctx, px + 10, py - 10, 12, 15, K); ret(ctx, px + 11, py - 10, 10, 14, TRONCO[1]); ret(ctx, px + 11, py - 10, 3, 14, TRONCO[2]);
      ret(ctx, px + 14, py - 18, 10, 9, K); ret(ctx, px + 15, py - 18, 8, 8, TRONCO[1]); ret(ctx, px + 15, py - 18, 2, 8, TRONCO[2]);   // o tronco entorta para a direita
      ret(ctx, px + 12, py - 4, 2, 2, K); ret(ctx, px + 12, py - 4, 1, 1, PALIDO); ret(ctx, px + 17, py - 4, 2, 2, K); ret(ctx, px + 17, py - 4, 1, 1, PALIDO);   // os olhinhos
      ret(ctx, px + 13, py, 4, 1, K); ret(ctx, px + 9, py + 6, 16, 3, MUSGO); ret(ctx, px + 9, py + 6, 16, 1, LIQ);
      ret(ctx, px + 8, py + 14, 3, 2, TRONCO[0]); ret(ctx, px + 23, py + 14, 3, 2, TRONCO[0]);
      ret(ctx, px + 22, py + 1, 4, 3, CIANO2); ret(ctx, px + 22, py + 1, 3, 1, CIANO);
      folhagem(ctx, px, py, [[18, -23, 9], [8, -16, 7], [26, -17, 6], [17, -14, 7]], COPA);
      pont(ctx, px + 6, py - 18, 12, 2, NEV2, 0); cipo(ctx, px + 6, py - 11, 9); cipo(ctx, px + 27, py - 12, 7);
      ret(ctx, px + 24, py - 25, 6, 1, 'rgba(232,238,246,0.8)'); ret(ctx, px + 26, py - 24, 1, 5, 'rgba(232,238,246,0.6)'); ret(ctx, px + 24, py - 22, 4, 1, 'rgba(232,238,246,0.7)');   // a teia
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('neblina-arvoreta', { w: 1, h: 1, solido: true, alto: true, topo: 20,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6); tronco(ctx, px + 7, py + 6, 3, 9);
      folhagem(ctx, px, py, [[8, 2, 5], [5, 7, 3], [11, 7, 3]], COPA);
      pont(ctx, px + 4, py + 4, 8, 2, NEV, 0); ret(ctx, px + 12, py - 1, 1, 1, CIANO);
    } });
  I.objeto('neblina-arbusto', { w: 1, h: 1, solido: 'base', topo: 12,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      folhagem(ctx, px, py, [[8, 9, 4], [4, 11, 3], [12, 11, 3]], ['#46546e', '#5d7a86', '#8fb0b8']);
      ret(ctx, px + 5, py + 7, 1, 1, '#e8eef6'); ret(ctx, px + 10, py + 12, 1, 1, '#e8eef6'); ret(ctx, px + 12, py + 8, 1, 1, CIANO);
    } });
  I.objeto('neblina-pedra', { w: 1, h: 1, solido: 'base', topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 10, 7, 5, K); elipse(ctx, px + 8, py + 10, 6, 4, '#8a90a8'); elipse(ctx, px + 7, py + 9, 4, 2, '#b4bad0');
      ret(ctx, px + 11, py + 11, 2, 2, '#6a7088'); ret(ctx, px + 3, py + 7, 5, 2, MUSGO); ret(ctx, px + 3, py + 7, 3, 1, LIQ); ret(ctx, px + 10, py + 6, 2, 1, MUSGO);
    } });
  I.objeto('neblina-tronco', { w: 1, h: 1, solido: 'base', topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 1, py + 7, 14, 8, K); ret(ctx, px + 2, py + 8, 12, 6, TRONCO[1]); ret(ctx, px + 2, py + 8, 12, 2, TRONCO[2]); ret(ctx, px + 2, py + 12, 12, 2, TRONCO[0]);
      ret(ctx, px, py + 8, 2, 6, K); ret(ctx, px + 1, py + 9, 1, 4, '#c8b8a0'); ret(ctx, px + 5, py + 7, 5, 2, MUSGO);
      ret(ctx, px + 10, py + 4, 4, 4, K); ret(ctx, px + 11, py + 5, 3, 2, LILAS); ret(ctx, px + 11, py + 5, 2, 1, '#ffffff'); ret(ctx, px + 4, py + 5, 3, 3, K); ret(ctx, px + 5, py + 5, 2, 2, CIANO); ret(ctx, px + 5, py + 5, 1, 1, PALIDO);
    } });

  /* ---------- enfeites do chão (não sólidos) ---------- */
  function fern(ctx, px, py, n) {
    for (var i = 0; i < n; i++) {
      var dx = (i - (n >> 1)) * 3, a = Math.abs(i - (n >> 1)), c = i % 2 ? '#3f6a6e' : '#4f7e7c';
      ret(ctx, px + 8 + dx, py + 6 + a * 2, 1, 8 - a, c); ret(ctx, px + 8 + dx + (dx < 0 ? -1 : 1), py + 7 + a * 2, 1, 2, c);
      ret(ctx, px + 8 + dx + (dx < 0 ? 1 : -1), py + 10 + a * 2, 1, 2, c); ret(ctx, px + 8 + dx, py + 6 + a * 2, 1, 1, '#c4d8e8');
    }
  }
  I.objeto('neblina-samambaia', { w: 1, h: 1, solido: false, plano: true, desenhar: function (ctx, px, py) { fern(ctx, px, py, 5); } });
  I.objeto('neblina-flores', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var s = (o.var && o.var.n) || 0, PET = ['#b8a8d8', '#8fa8e0', '#e6dcf4', '#9a8ae0'];
      [[4, 6], [10, 9], [7, 3]].forEach(function (f, i) {
        ret(ctx, px + f[0], py + f[1] + 2, 1, 5, '#4f7e7c');
        ret(ctx, px + f[0] - 1, py + f[1], 3, 3, K); ret(ctx, px + f[0], py + f[1] - 1, 1, 5, K);
        ret(ctx, px + f[0] - 1, py + f[1] + 1, 3, 1, PET[(s + i * 2) % 4]); ret(ctx, px + f[0], py + f[1], 1, 3, PET[(s + i * 2) % 4]); ret(ctx, px + f[0], py + f[1] + 1, 1, 1, '#ffe27a');
      });
      ret(ctx, px + 2, py + 12, 3, 2, '#4f7e7c'); ret(ctx, px + 11, py + 13, 3, 2, '#3f6a6e');
    } });
  // moitas planas (2×1 e 3×1): samambaia, cogumelo e névoa rasteira no mesmo objeto, para quebrar a grade dos enfeites
  function moita(ctx, px, py, w, luz) {
    var W = w * 16;
    nev(ctx, px + W / 2, py + 12, W / 2 - 2, 5, 0.2, w); fern(ctx, px, py, 3); fern(ctx, px + W - 16, py, w > 2 ? 5 : 3);
    veu(ctx, px + W / 2, py + 10, 11, 7, '127,242,224', 0.06, w, 3);
    cogumelo(ctx, px + W / 2, py + 15, 3, luz ? CIANO2 : '#7a5ce0', luz ? CIANO : '#a88cff', luz ? PALIDO : '#e0d4ff'); cogumelo(ctx, px + W / 2 + 6, py + 15, 2, '#7a5ce0', '#a88cff', '#e0d4ff');
  }
  I.objeto('neblina-moita', { w: 2, h: 1, solido: false, plano: true, semSombra: true, desenhar: function (ctx, px, py) { moita(ctx, px, py, 2, false); } });
  I.objeto('neblina-moita-g', { w: 3, h: 1, solido: false, plano: true, semSombra: true, desenhar: function (ctx, px, py) { moita(ctx, px, py, 3, true); } });
  I.objeto('neblina-folhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, '#7a5a52'], [8, 5, '#6f8c78'], [10, 11, '#8a6a60'], [5, 13, '#5f8e88']].forEach(function (l) { ret(ctx, px + l[0], py + l[1], 3, 2, l[2]); ret(ctx, px + l[0] + 1, py + l[1], 1, 1, '#b8a898'); });
    } });
  I.objeto('neblina-poca', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0, A = [[[8, 9, 7, 4]], [[6, 10, 5, 3], [12, 6, 3, 2]], [[8, 7, 6, 3], [5, 12, 3, 2]]][n % 3];
      A.forEach(function (e) { elipse(ctx, px + e[0], py + e[1], e[2], e[3], '#46607e'); elipse(ctx, px + e[0], py + e[1], e[2] - 1, e[3] - 1, '#6f94b8'); ret(ctx, px + e[0] - 2, py + e[1] - 1, Math.max(1, e[2] - 3), 1, '#d4e8f8'); });
      ret(ctx, px + 4 + n * 3, py + 12, 2, 1, '#a8c8e4');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 260) % 6 : 0;
      if (f < 3) ret(ctx, px + 9, py + 3 + f * 2, 1, 2, '#d8e4f4'); else ret(ctx, px + 9 - (f - 3), py + 9, 3 + (f - 3) * 2, 1, '#b8c8e4');
    } });

  /* ---------- cogumelos: o interativo (lilás com halo) e o grupo luminoso (ciano, pulsa) ---------- */
  function cogumelo(ctx, cx, base, r, c1, c2, c3) {
    ret(ctx, cx - 2, base - r - 1, 5, r + 2, K); ret(ctx, cx - 1, base - r, 3, r + 1, '#eeeaf8'); ret(ctx, cx - 1, base - r, 1, r + 1, '#ffffff');
    elipse(ctx, cx, base - r - 1, r + 2, r, K); elipse(ctx, cx, base - r - 1, r + 1, Math.max(1, r - 1), c1);
    elipse(ctx, cx - 1, base - r - 2, Math.max(1, r - 2), Math.max(1, r - 3), c2);
    ret(ctx, cx - r + 1, base - r - 3, 2, 1, c3); ret(ctx, cx + 1, base - r - 2, 1, 1, c3);
  }
  var CAPA = [[CIANO2, CIANO, PALIDO], ['#7a5ce0', '#a88cff', '#e0d4ff']];
  I.objeto('neblina-cogumelo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      veu(ctx, px + 8, py + 11, 13, 8, '127,242,224', 0.06, 1, 3);
      sombra(ctx, px + 8, py + 15, 6);
      cogumelo(ctx, px + 8, py + 15, 4, '#7a5ce0', '#a88cff', '#e0d4ff'); cogumelo(ctx, px + 14, py + 16, 2, '#6a4cd0', '#9a7cf0', '#e0d4ff');
      ret(ctx, px + 2, py + 5, 1, 1, PALIDO);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 520) % 3 : 0;
      ret(ctx, px + 1 + f * 5, py + 2 + (f & 1) * 4, 1, 1, 'rgba(216,255,248,0.9)');
    } });
  // o grupo luminoso: tufo de 4–5 cogumelos em 3 tamanhos, tampas ciano e violeta saturadas, halo ciano pontilhado no chão
  I.objeto('neblina-cogumelo-luz', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var s = (o.x + o.y) & 1, M = [[5, 14, 3, 0], [11, 15, 2, 1], [8, 12, 1, 0], [2, 15, 1, 1], [14, 13, 2, 0]];
      veu(ctx, px + 8, py + 11, 13, 8, '127,242,224', 0.06, s + 2, 3);
      M.slice(0, 4 + s).forEach(function (m) { var c = CAPA[(m[3] + o.x) & 1]; cogumelo(ctx, px + m[0], py + m[1], m[2], c[0], c[1], c[2]); });
    },
    anim: function (ctx, px, py, t, o) {
      var f = tempo(t) ? Math.floor(tempo(t) / 450 + o.x) % 4 : 0;
      if (f === 1 || f === 2) ret(ctx, px + 6, py + 9 + f, 5, 1, 'rgba(216,255,248,0.12)');
      ret(ctx, px + 3 + f * 3, py + 3 - (f & 1) * 2, 1, 1, PALIDO);
    } });

  /* ---------- névoa viva: banco (2×1) e véu rasteiro (2×2), em pontilhado, à deriva ---------- */
  function fiapos(ctx, px, py, t, per, amp, F) {   // fiapos de névoa (x, y, largura, 1 px de altura) andando: 1 fillRect cada
    var d = Math.round(Math.sin(tempo(t) / per) * amp);
    ctx.fillStyle = 'rgba(232,238,248,0.14)';
    for (var i = 0; i < F.length; i++) ctx.fillRect(px + F[i][0] + (i & 1 ? -d : d), py + F[i][1], F[i][2], 1);
  }
  I.objeto('neblina-banco', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      nev(ctx, px + 24, py + 20, 23, 7, 0.32, 0); nev(ctx, px + 16, py + 12, 13, 6, 0.26, 1); nev(ctx, px + 34, py + 15, 12, 6, 0.28, 0); nev(ctx, px + 26, py + 26, 14, 4, 0.18, 1);
    },
    anim: function (ctx, px, py, t) { fiapos(ctx, px, py, t, 2600, 10, [[6, 14, 6], [20, 18, 8], [30, 11, 5]]); } });
  I.objeto('neblina-nevoa', { w: 2, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) { nev(ctx, px + 16, py + 20, 15, 7, 0.32, 1); nev(ctx, px + 12, py + 13, 11, 6, 0.26, 0); nev(ctx, px + 21, py + 17, 10, 5, 0.28, 1); },
    anim: function (ctx, px, py, t) { fiapos(ctx, px, py, t, 3000, 7, [[6, 12, 6], [14, 19, 7]]); } });

  /* ---------- a teia (2×1) e os vaga-lumes ---------- */
  var FIO = 'rgba(232,238,246,0.75)';
  I.objeto('neblina-teia', { w: 2, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 3, 24, 1, FIO); ret(ctx, px + 16, py + 3, 1, 11, FIO);
      for (var i = 0; i < 6; i++) { ret(ctx, px + 4 + i * 2, py + 3 + i, 1, 1, FIO); ret(ctx, px + 28 - i * 2, py + 3 + i, 1, 1, FIO); }
      ret(ctx, px + 8, py + 8, 17, 1, 'rgba(232,238,246,0.5)'); ret(ctx, px + 11, py + 5, 11, 1, 'rgba(232,238,246,0.5)'); ret(ctx, px + 6, py + 11, 21, 1, 'rgba(232,238,246,0.34)');
      [[9, 8], [22, 8], [16, 5], [13, 11]].forEach(function (g) { ret(ctx, px + g[0], py + g[1], 1, 2, '#ffffff'); });
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 380) % 4 : 0, G = [[9, 8], [22, 8], [16, 5], [13, 11]];
      brilho(ctx, px + G[f][0], py + G[f][1], '#ffffff');
    } });
  var VAGA = [[2, 4, 0], [9, 2, 2], [13, 7, 4], [5, 11, 1], [11, 13, 3]];   // [x, y, fase]: 2×2 com 1 px de halo
  function vaga(ctx, x, y, c) { ret(ctx, x - 1, y, 4, 2, 'rgba(127,242,224,0.34)'); ret(ctx, x, y - 1, 2, 4, 'rgba(127,242,224,0.34)'); ret(ctx, x, y, 2, 2, c); }
  I.objeto('neblina-vaga-lumes', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { VAGA.forEach(function (v) { vaga(ctx, px + v[0], py + v[1], PALIDO); }); },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < 2; n++) {   // só 2 dos 5 andam (os 5 estáticos já estão no desenho): 2 fillRects cada
        var v = VAGA[n * 2 + 1], dx = t ? Math.round(Math.sin(t / 520 + v[2]) * 4) : 0, dy = t ? Math.round(Math.cos(t / 430 + v[2]) * 3) : 0;
        var x = px + v[0] + dx, y = py + v[1] + dy;
        ret(ctx, x - 1, y, 4, 2, 'rgba(127,242,224,0.34)'); ret(ctx, x, y, 2, 2, (t ? Math.floor(t / 260 + v[2]) % 3 : 0) ? CIANO : PALIDO);
      }
    } });

  /* ---------- os interativos: a placa de pedra e madeira, a lanterna de fada (o ponto quente) ---------- */
  // versões fixas (mesmo desenho, sem anim) para os enfeites de fundo: só o que está perto da criança anda
  ['cogumelo-luz', 'vaga-lumes', 'nevoa', 'banco', 'poca'].forEach(function (n) {
    var d = {}, b = I.OBJETOS['neblina-' + n];
    Object.keys(b).forEach(function (k) { if (k !== 'anim') d[k] = b[k]; });
    I.objeto('neblina-' + n + '-fixo', d);
  });

  I.objeto('neblina-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, TRONCO[1]);
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#7a7894'); ret(ctx, px + 1, py - 3, 14, 2, '#a4a4c0'); ret(ctx, px + 1, py + 5, 14, 2, '#5c5a78');
      ret(ctx, px + 2, py - 3, 3, 1, LUAR); ret(ctx, px + 1, py + 6, 5, 1, MUSGO);
      circulo(ctx, px + 8, py + 1, 3, PALIDO); circulo(ctx, px + 9, py, 2, '#7a7894'); ret(ctx, px + 12, py - 1, 1, 1, CIANO);   // a lua em foice
    } });
  I.objeto('neblina-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      veu(ctx, px + 13, py - 9, 12, 11, '255,226,122', 0.05, 5, 3);   // o halo quente da lâmpada
      veu(ctx, px + 8, py + 11, 19, 6, '255,226,122', 0.06, 6, 3);   // a poça de luz quente no chão
      ret(ctx, px + 7, py - 18, 3, 33, K); ret(ctx, px + 8, py - 18, 1, 32, '#8a8098'); ret(ctx, px + 9, py - 18, 1, 32, TRONCO[0]);
      ret(ctx, px + 8, py - 22, 7, 2, K); ret(ctx, px + 12, py - 22, 2, 8, K); ret(ctx, px + 10, py - 21, 4, 1, '#8a8098');
      ret(ctx, px + 9, py - 14, 8, 10, K); ret(ctx, px + 10, py - 13, 6, 8, '#ffe27a'); ret(ctx, px + 11, py - 12, 2, 5, '#fffbe0'); ret(ctx, px + 9, py - 15, 8, 2, K);
      ret(ctx, px + 6, py + 12, 7, 4, K); ret(ctx, px + 7, py + 12, 5, 3, '#8a90a8'); ret(ctx, px + 7, py + 12, 3, 1, MUSGO);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 330) % 4 : 0;
      brilho(ctx, px + 3 + f * 4, py - 18 + (f & 1) * 5, '#fff3a0'); if (f === 2) ret(ctx, px + 10, py - 10, 6, 1, 'rgba(255,240,170,0.2)');
    } });

  /* ---------- o céu aberto: serras de copas frias com névoa; a faixa de baixo é a que aparece ---------- */
  function serra(ctx, w, y, c, luz, s, fim) {
    for (var x = -6; x < w + 6; x += 6) {
      var r = 5 + Math.floor(sorte(x, y, s) * 6), cy = y + Math.floor(sorte(x, y, s + 1) * 4);
      circulo(ctx, x + Math.floor(sorte(x, y, s + 3) * 4), cy, r, c); ret(ctx, x - r + 2, cy - r + 2, 2, 1, luz);
    }
    ret(ctx, 0, y + 8, w, fim, c);
  }
  function bruma(ctx, w, y, rows, d, s, c) {   // névoa em pontos de 2 px (a escala da arte), mais densa no meio: quebra a linha reta da borda
    ctx.fillStyle = c;
    for (var j = 0; j < rows; j += 2) { var q = d * (1 - Math.abs(j - rows / 2) / (rows / 2)); for (var x = 0; x < w; x += 2) if (sorte(x >> 1, (y + j) >> 1, s) < q) ctx.fillRect(x, y + j, 2, 2); }
  }
  // o "mar de névoa" (unidade de 72 px, a de baixo é a que aparece): horizonte frio e claro no alto, 3 silhuetas de copas
  // em degraus de valor (a mais clara é a mais longe, a escura é a de perto), névoa pontilhada de 2 px entre elas
  I.FUNDOS.neblina = { cor: '#2c3650',
    desenhar: function (ctx, w, h) {
      for (var k = Math.ceil(h / 72) + 1; k >= 0; k--) {   // de cima para baixo: a unidade de baixo fica por cima
        var y0 = h - 72 - 72 * k, i;
        ret(ctx, 0, y0, w, 72, '#a8b6d4'); pont(ctx, 0, y0, w, 10, '#c8d6ee', 0); pont(ctx, 0, y0 + 10, w, 4, '#b8c6e0', 1);
        for (i = 0; i < 4; i++) veu(ctx, Math.floor(sorte(i, y0, 41) * w), y0 + 9, 44, 4, '230,242,255', 0.07, i + y0, 3);   // o brilho frio do horizonte
        serra(ctx, w, y0 + 8, '#92a2c2', '#c8d6ee', 3, 72);
        bruma(ctx, w, y0 + 16, 12, 0.55, 5, 'rgba(226,234,248,0.5)');
        serra(ctx, w, y0 + 26, '#6a7c9c', '#92a2c2', 7, 72);
        bruma(ctx, w, y0 + 34, 12, 0.5, 9, 'rgba(210,222,244,0.42)');
        serra(ctx, w, y0 + 44, '#46546e', '#6a7c9c', 11, 72);
        bruma(ctx, w, y0 + 52, 10, 0.4, 13, 'rgba(190,204,230,0.3)');
        pont(ctx, 0, y0 + 62, w, 4, '#3a4660', 0); ret(ctx, 0, y0 + 66, w, 6, '#3a4660');
        for (i = 0; i < 10; i++) { var lx = 2 * Math.floor(sorte(i, y0, 21) * w / 2), ly = y0 + 18 + 2 * Math.floor(sorte(i, y0, 22) * 20); ret(ctx, lx, ly, 2, 2, i % 3 ? CIANO : LILAS); }
      }
    } };
})();
