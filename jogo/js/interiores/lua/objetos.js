/* Bosque da Lua Cheia, o chão, as copas, o céu e os objetos-assinatura (prefixo lua-; docs/contratos/arenas.md §8):
   o piso 'lua-lua' (grama ao luar em manchas orgânicas de ruído, com beirada em pontilhado 2×2: sombra de copa, luz e
   luar; a trilha prateada de beirada irregular), a parede 'lua-copas' (copas azul-noite com 1 px de luar), o fundo
   I.FUNDOS.lua (a faixa de baixo: a LUA CHEIA grande, fora do eixo do portal, com halo em degraus, nuvens orgânicas e
   serras de copas) e os objetos: árvores, cristais, cogumelos de chapéu aceso, flores-da-lua, moitas, poças e feixes de
   luar (planos, alfa baixo em pontilhado), pedras e runas, vaga-lumes e os 4 interativos. As trilhas ficam em
   Reino._predios.lua (P.trilha, em lua.js). O que anima fica no `anim` (parado sem Animações).
   No carregamento só registra funções: nada de DOM nem canvas aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).lua = R._predios.lua || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }   // 0 sem Animações: o desenho fica parado
  var COPAS = ['#1b2752', '#26366a', '#34487f'], PRATA = '#b8c8e8', LUAR = '#e8f0ff';
  var TR = ['#26325c', '#3a4a7a', '#55689c'], CR = ['#7f9cd8', '#b8d4f8', '#eef6ff'];
  var CIANO = '#8fe8f0', VAGA = '#ffe9a8';
  function vn(o) { var v = o && o.var; return typeof v === 'number' ? v : (v && v.n) || 0; }   // enfeites levam número; miudos, { n }
  function halo(ctx, cx, cy, rx, ry, rgb, a) {   // halo em pontilhado 2×2: miolo cheio, beirada em xadrez (2 níveis de alfa)
    for (var j = -ry; j < ry; j += 2) for (var i = -rx; i < rx; i += 2) {
      var d = (i * i) / (rx * rx) + (j * j) / (ry * ry);
      if (d < 0.4) ret(ctx, cx + i, cy + j, 2, 2, 'rgba(' + rgb + ',' + (a + 0.07) + ')'); else if (d < 1) ret(ctx, cx + i, cy + j, 2, 2, 'rgba(' + rgb + ',' + a + ')');
    }
  }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  function lin(ctx, x0, y0, x1, y1, c) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (var i = 0; i <= n; i++) ret(ctx, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1, c);
  }
  function ruido(gx, gy, esc, s) {   // ruído de valor suave em coordenadas globais: as manchas passam de um tile ao outro sem emenda
    var ix = Math.floor(gx / esc), iy = Math.floor(gy / esc), fx = gx / esc - ix, fy = gy / esc - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = sorte(ix, iy, s), b = sorte(ix + 1, iy, s), c = sorte(ix, iy + 1, s), d = sorte(ix + 1, iy + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }

  /* ---------- as copas: 3 camadas de bolas na grade global (sem emenda entre tiles), luar em cima à esquerda ---------- */
  function camada(ctx, x, y, w, h, tam, raio, c, sem, luar) {
    var c0 = Math.floor((x - raio) / tam), c1 = Math.floor((x + w + raio) / tam), r0 = Math.floor((y - raio) / tam), r1 = Math.floor((y + h + raio) / tam);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * tam + Math.round(tam / 2) + Math.round((sorte(cc, cr, sem) - 0.5) * 8) + (cr & 1) * Math.round(tam / 2),
        by = cr * tam + Math.round(tam / 2) + Math.round((sorte(cc, cr, sem + 1) - 0.5) * 6);
      circulo(ctx, bx, by, raio, c[0]); circulo(ctx, bx - 1, by - 1, raio - 2, c[1]); circulo(ctx, bx - 2, by - 2, Math.round(raio / 2.6), c[2]);
      if (luar) {
        ret(ctx, bx - Math.round(raio * 0.7), by - Math.round(raio * 0.4), 1, 2, PRATA); ret(ctx, bx - Math.round(raio * 0.5), by - Math.round(raio * 0.7), 2, 1, PRATA);
        if (sorte(cc, cr, sem + 2) < 0.2) { ret(ctx, bx + 1, by - raio + 2, 2, 1, PRATA); ret(ctx, bx + 2, by - raio + 1, 1, 1, LUAR); }   // folha prateada
      }
    }
  }
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, '#0f162e');
    camada(ctx, x, y, w, h, 16, 10, ['#131b38', '#1b2752', '#26366a'], 11, false);   // a camada de trás
    camada(ctx, x, y, w, h, 12, 8, COPAS, 1, true);                                  // as do meio, com o luar
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- o piso: manchas orgânicas de ruído (sombra de copa, luz, luar), beirada em pontilhado ---------- */
  var SOMBRA = ['#4a5e94', '#5a70a2'], LUZ = ['#7490c0', '#8eaad8'];
  function campo(gx, gy) { return ruido(gx, gy, 44, 5) * 0.6 + ruido(gx, gy, 19, 6) * 0.4; }
  function grama(ctx, px, py, tx, ty, p) {
    ret(ctx, px, py, 16, 16, p.piso);
    var x, y, i;
    for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {   // manchas de ruído global; a beirada é dither de 1 px esparso (sem bloco, sem degrau)
      var gx = tx * 16 + x, gy = ty * 16 + y, n = campo(gx, gy), h = sorte(gx, gy, 9), c = null;
      if (n < 0.15) c = SOMBRA[0]; else if (n < 0.21) c = SOMBRA[1]; else if (n < 0.26) c = h < 0.3 ? SOMBRA[1] : null;
      else if (n > 0.85) c = LUZ[1]; else if (n > 0.79) c = LUZ[0]; else if (n > 0.74) c = h < 0.3 ? LUZ[0] : null;
      if (c) ret(ctx, px + x, py + y, 1, 1, c);
    }
    for (i = 0; i < 2; i++) if (sorte(tx, ty, 10 + i) < 0.55) {   // tufos de lâminas prateadas (escuras na sombra)
      x = px + 1 + Math.floor(sorte(tx, ty, 12 + i) * 12); y = py + 6 + Math.floor(sorte(tx, ty, 14 + i) * 9);
      var sombra = campo(tx * 16 + x - px, ty * 16 + y - py) < 0.3, tom = sombra ? '#3a4d82' : '#9db4de';
      ret(ctx, x, y - 3, 1, 3, tom); ret(ctx, x + 1, y - 4, 1, 4, tom); ret(ctx, x + 2, y - 2, 1, 2, tom);
      if (!sombra) ret(ctx, x + 1, y - 4, 1, 1, '#c8d8f4');
    }
    if (sorte(tx >> 1, ty >> 1, 50) < 0.2) for (i = 0; i < 3; i++) {   // brilhos prateados em cachos
      x = px + 2 + Math.floor(sorte(tx, ty, 51 + i) * 12); y = py + 2 + Math.floor(sorte(tx, ty, 54 + i) * 12);
      ret(ctx, x, y, 1, 1, '#eef6ff'); if (i === 0) { ret(ctx, x - 1, y, 3, 1, '#c8d8f4'); ret(ctx, x, y - 1, 1, 3, '#c8d8f4'); }
    }
    if (sorte(tx >> 2, ty >> 2, 58) < 0.12 && sorte(tx, ty, 59) < 0.6) {   // flor-da-lua em moita
      x = px + 3 + Math.floor(sorte(tx, ty, 60) * 9); y = py + 5 + Math.floor(sorte(tx, ty, 61) * 7);
      ret(ctx, x, y + 1, 1, 3, CR[0]); ret(ctx, x - 1, y, 3, 1, '#dcecff'); ret(ctx, x, y - 1, 1, 3, '#dcecff'); ret(ctx, x, y, 1, 1, '#fff4cc');
    }
  }
  function agua(ctx, cx, cy, rx, ry) {   // água legível: beirada irregular, 3 tons e o reflexo prateado do disco lunar
    elipse(ctx, cx, cy, rx, ry, '#2a3668'); elipse(ctx, cx, cy, rx - 1, ry - 1, '#3a5290'); elipse(ctx, cx - 1, cy - 1, Math.max(2, rx - 3), Math.max(1, ry - 2), '#5878b8');
    ret(ctx, cx - rx - 1, cy, 1, 1, '#2a3668'); ret(ctx, cx + rx, cy - 1, 1, 2, '#2a3668'); ret(ctx, cx - 2, cy - ry, 3, 1, '#7f96c8');
    ret(ctx, cx - 2, cy - 1, 3, 2, '#f6f2d8'); ret(ctx, cx - 1, cy - 1, 1, 1, '#ffffff'); ret(ctx, cx + 2, cy + 1, 2, 1, '#b8c8e8');
  }
  function trilha(ctx, px, py, tx, ty, p) {   // prateada, mais clara que a grama; a beirada irregular deixa a grama aparecer
    var lado = { N: !P.trilha(tx, ty - 1), S: !P.trilha(tx, ty + 1), W: !P.trilha(tx - 1, ty), E: !P.trilha(tx + 1, ty) }, x, y, i;
    grama(ctx, px, py, tx, ty, p);
    for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
      var gx = tx * 16 + x, gy = ty * 16 + y, hj = 1 + sorte(gx >> 1, ty, 40) * 2.6, vj = 1 + sorte(tx, gy >> 1, 41) * 2.6;
      var dN = lado.N ? y : 99, dS = lado.S ? 15 - y : 99, dW = lado.W ? x : 99, dE = lado.E ? 15 - x : 99;
      var dh = Math.min(dN, dS), dv = Math.min(dW, dE), dmin = Math.min(dh - 0, dv - 0);
      if (dh < hj || dv < vj) continue;
      if (dh < 5 && dv < 5 && (5 - dh) * (5 - dh) + (5 - dv) * (5 - dv) > 16) continue;   // canto arredondado
      var n = ruido(gx, gy, 26, 12), c = n > 0.62 ? '#d2def8' : n < 0.36 ? '#b2c2ee' : '#c2d0f4';
      if (dh < hj + 1 || dv < vj + 1) c = '#44568c';   // o fio escuro da beirada
      ret(ctx, px + x, py + y, 1, 1, c);
    }
    if (sorte(tx, ty, 37) < 0.012) agua(ctx, px + 8, py + 8, 6, 3);   // 1 ou 2 poças legíveis na trilha
    ['N', 'S', 'W', 'E'].forEach(function (s, k) {
      if (!lado[s]) return;
      var a = 2 + Math.floor(sorte(tx, ty, 70 + k) * 10), h = s === 'N' ? 1 : 13, w = s === 'N' || s === 'S';
      if (sorte(tx, ty, 74 + k) < 0.55) { var ax = w ? a : h, ay = w ? h : a; ret(ctx, px + ax, py + ay, 3, 2, '#c4cce4'); ret(ctx, px + ax, py + ay + 2, 3, 1, '#6a7498'); ret(ctx, px + ax, py + ay, 1, 1, '#f2f6ff'); }   // pedrinha na beirada
      else if (sorte(tx, ty, 78 + k) < 0.5) { var bx = w ? a : h, by = w ? h : a; for (i = 0; i < 4; i++) ret(ctx, px + bx + (w ? i : 0), py + by + (w ? 0 : i), 1, 1, i & 1 ? '#5f8aa6' : '#4f7894'); }   // musgo
      if (sorte(tx, ty, 82 + k) < 0.3) { var rx = w ? a : h, ry = w ? h : a; lin(ctx, px + rx, py + ry, px + rx + (w ? 4 : 5), py + ry + (w ? 5 : 3), '#5a6590'); }   // raiz
    });
  }
  I.PISOS['lua-lua'] = { cores: { piso: '#667fb0', piso2: '#5d74a6', detalhe: '#55699c', luz: '#86a0d4', luar: '#7089bb' },
    desenhar: function (ctx, px, py, tx, ty, p) { if (P.trilha(tx, ty)) trilha(ctx, px, py, tx, ty, p); else grama(ctx, px, py, tx, ty, p); } };

  /* ---------- a parede: as copas em 3 camadas, o tronco com um cogumelo ou cristal que brilha, estrelas nos rasgos ---------- */
  I.PAREDES['lua-copas'] = { cores: { parede: '#1b2752', parede2: '#26366a', rodape: '#141d3c', detalhe: '#34487f' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 9), s = sorte(tx, 0, 63);
      ret(ctx, px + t, py + 21, 3, 9, '#2a3358'); ret(ctx, px + t, py + 21, 1, 9, '#41507e');
      if (s < 0.3) { ret(ctx, px + t + 3, py + 25, 1, 3, K); ret(ctx, px + t + 3, py + 25, 1, 2, CIANO); ret(ctx, px + t + 4, py + 27, 1, 1, '#eef6ff'); }   // cristal no tronco
      else if (s < 0.55) { ret(ctx, px + t + 3, py + 26, 3, 1, PRATA); ret(ctx, px + t + 3, py + 27, 3, 1, '#8fa4d0'); ret(ctx, px + t + 4, py + 28, 1, 1, '#d8e0f0'); }   // cogumelo prateado
      ret(ctx, px, py + 29, 16, 3, '#141d3c');
      if (sorte(tx, 0, 61) < 0.35) { ret(ctx, px + 4 + Math.floor(sorte(tx, 0, 62) * 8), py + 4, 1, 1, LUAR); ret(ctx, px + 3 + Math.floor(sorte(tx, 0, 62) * 8), py + 5, 3, 1, PRATA); }   // estrelinha no rasgo
    } };

  /* ---------- o céu: a faixa de baixo é a que se vê; a lua grande fica nela (fora do eixo do portal), atrás das serras ---------- */
  var NOITE = ['#121a38', '#1a2448', '#233058'];
  function disco(ctx, cx, cy, rx, ry, rgb, a, sem, jit) {   // elipse de pixel em linhas de 1 px, com a beirada irregular (sem bloco, sem xadrez)
    for (var j = -ry; j <= ry; j++) {
      var m = Math.round(rx * Math.sqrt(1 - (j * j) / (ry * ry + 0.5)) + (sorte(j, sem, 31) - 0.5) * jit);
      if (m > 0) ret(ctx, cx - m, cy + j, 2 * m, 1, 'rgba(' + rgb + ',' + a + ')');
    }
  }
  function nuvem(ctx, x, y, rx, ry, a) {   // nuvem orgânica: 3 elipses achatadas irregulares, alfa em 2 degraus, dither de 1 px só na beirada
    [[0, 0, 1, 1], [-0.5, 0.35, 0.6, 0.7], [0.5, 0.25, 0.7, 0.75]].forEach(function (b, k) {
      var cx = Math.round(x + b[0] * rx), cy = Math.round(y + b[1] * ry), w = Math.round(rx * b[2]), h = Math.max(2, Math.round(ry * b[3]));
      disco(ctx, cx, cy, w, h, '184,200,232', a * 0.6, x + k, 4);
      disco(ctx, cx, cy, Math.round(w * 0.72), Math.max(1, h - 2), '184,200,232', a * 0.5, x + k + 7, 3);
      for (var j = -h; j <= h; j++) for (var s = -1; s <= 1; s += 2) {   // pontinhos de 1 px só na beirada
        var m = Math.round(w * Math.sqrt(1 - (j * j) / (h * h + 0.5))) + 2;
        if (sorte(j + k * 9, x, 33) < 0.4) ret(ctx, cx + s * m - (s > 0 ? 1 : 0), cy + j, 1, 1, 'rgba(184,200,232,' + a * 0.6 + ')');
      }
    });
  }
  function haloLua(ctx, cx, cy, r) {   // anéis de elipse de pixel de alfa 0,04, do mais largo ao mais perto, beirada irregular
    for (var k = 0, R = r + 15; R > r; R -= 2, k++) disco(ctx, cx, cy, R, R, '143,164,208', 0.04 + (R < r + 5 ? 0.02 : 0), 40 + k, 3);
  }
   I.FUNDOS.lua = { cor: NOITE[0],
    desenhar: function (ctx, w, h) {
      var top = h - 52, c0 = Math.round(w / 2), cx = c0 + 46, cy = h - 31, r = 14, i, x, y;   // a lua fora do eixo do portal, mas ao alcance do celular
      copas(ctx, 0, 0, w, top + 6);   // a mata em volta, nas lascas das bordas
      ret(ctx, 0, top, w, 52, NOITE[0]); ret(ctx, 0, top + 14, w, 14, NOITE[1]); ret(ctx, 0, top + 28, w, 24, NOITE[2]);
      for (x = 0; x < w; x += 4) { var hh = 2 + Math.round(ruido(x, 3, 34, 21) * 9); ret(ctx, x, top, 4, hh, '#17214a'); }   // a silhueta distante, em degraus
      for (i = 0; i < Math.ceil(w / 9); i++) circulo(ctx, i * 9 + Math.round(sorte(i, 5, 21) * 6), top + 1, 5 + Math.round(sorte(i, 6, 22) * 4), COPAS[0]);
      for (i = 0; i < 70; i++) {   // estrelas (as últimas, juntas em volta do centro, que é o que o celular mostra)
        x = i < 46 ? Math.floor(sorte(i, 3, 7) * w) : c0 - 90 + Math.floor(sorte(i, 3, 7) * 180); y = top + 6 + Math.floor(sorte(i, 4, 8) * 30);
        if (Math.hypot(x - cx, y - cy) < r + 14) continue;
        if (i % 7 === 0) brilho(ctx, x, y, '#e8f0ff'); else ret(ctx, x, y, 1, 1, i % 3 ? '#c8d4ee' : '#e8f0ff');
      }
      nuvem(ctx, c0 - 52, top + 24, 26, 6, 0.16); nuvem(ctx, cx - 26, cy + 4, 20, 6, 0.2); nuvem(ctx, cx + 70, top + 13, 22, 6, 0.14); nuvem(ctx, Math.round(w * 0.15), top + 22, 30, 6, 0.14);
      haloLua(ctx, cx, cy, r); circulo(ctx, cx, cy, r + 1, '#8fa4d0');
      circulo(ctx, cx, cy, r, '#e6dcba'); circulo(ctx, cx - 2, cy - 2, r - 2, '#f6f2d8'); circulo(ctx, cx - 4, cy - 4, r - 7, '#fffef2');
      circulo(ctx, cx + 4, cy + 3, 3, '#e0d6b0'); circulo(ctx, cx - 5, cy + 4, 2, '#e0d6b0'); circulo(ctx, cx + 6, cy - 5, 2, '#e6dcba'); circulo(ctx, cx - 1, cy - 7, 1, '#e6dcba');
      for (x = 0; x < w; x += 3) { var ph = 14 + Math.round(ruido(x, 1, 36, 22) * 10); ret(ctx, x, h - ph, 3, ph, '#1f2c58'); }   // a serra distante cobre o pé da lua
      for (i = 0; i < Math.ceil(w / 12); i++) circulo(ctx, i * 12 + Math.round(sorte(i, 7, 23) * 6), h - 7 + Math.round(sorte(i, 8, 24) * 4), 8 + Math.round(sorte(i, 12, 26) * 3), '#2a3a68');
      for (i = 0; i < Math.ceil(w / 10); i++) {   // a serra de perto, com luar e a borda de baixo irregular
        var bx = i * 10 + 3 + Math.round(sorte(i, 13, 27) * 4), by = h - 2 + Math.round(sorte(i, 9, 25) * 4), rr = 6 + Math.round(sorte(i, 14, 28) * 4);
        circulo(ctx, bx, by, rr, COPAS[0]); circulo(ctx, bx - 1, by - 2, rr - 3, COPAS[1]); ret(ctx, bx - rr + 2, by - rr + 1, 2, 1, '#4a62a0');
      }
    } };

  /* ---------- os objetos-assinatura ---------- */
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx + 3, y, rx, 2, 'rgba(20,28,60,0.2)'); elipse(ctx, cx + 2, y, Math.max(2, rx - 4), 1, 'rgba(20,28,60,0.16)'); }   // a luz vem de cima e da esquerda
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) {
      circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]);
      ret(ctx, px + b[0] - Math.round(b[2] * 0.7), py + b[1] - Math.round(b[2] * 0.4), 1, 2, PRATA); ret(ctx, px + b[0] - Math.round(b[2] * 0.5), py + b[1] - Math.round(b[2] * 0.7), 2, 1, PRATA);   // o luar
    });
  }
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TR[1]); ret(ctx, x, y, 2, h, TR[2]); ret(ctx, x + w - 2, y, 2, h, TR[0]); }
  function raizes(ctx, px, py, cx, l) { ret(ctx, px + cx - l, py + 11, 4, 3, K); ret(ctx, px + cx + l - 3, py + 11, 4, 3, K); ret(ctx, px + cx - l + 1, py + 11, 2, 2, TR[2]); }
  var ARV = ['#1b2752', '#2e4280', '#4a62a0'];
  I.objeto('lua-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13); tronco(ctx, px + 12, py - 6, 8, 20); raizes(ctx, px, py, 15, 5);
      ret(ctx, px + 14, py + 3, 2, 2, K); ret(ctx, px + 14, py + 3, 1, 1, CIANO);   // um cristalzinho no tronco
      folhagem(ctx, px, py, [[16, -26, 12], [7, -17, 9], [25, -17, 9], [16, -11, 10]], ARV);
      ret(ctx, px + 11, py - 34, 2, 1, LUAR); ret(ctx, px + 22, py - 30, 2, 1, PRATA); ret(ctx, px + 16, py - 38, 1, 1, '#ffffff'); ret(ctx, px + 26, py - 12, 2, 1, PRATA); ret(ctx, px + 5, py - 14, 2, 1, PRATA);
    } });
  I.objeto('lua-arvore-m', { w: 2, h: 1, solido: true, alto: true, topo: 40,   // a média: copa larga e baixa, com barba de musgo prateado
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 15, py + 14, 12); tronco(ctx, px + 11, py - 3, 7, 17); raizes(ctx, px, py, 14, 5);
      folhagem(ctx, px, py, [[15, -21, 11], [6, -12, 8], [24, -13, 8], [15, -7, 9]], ['#22305e', '#36498a', '#5a74b0']);
      ret(ctx, px + 20, py - 6, 1, 5, '#9fb4dc'); ret(ctx, px + 8, py - 3, 1, 4, '#9fb4dc'); ret(ctx, px + 10, py - 30, 2, 1, LUAR); ret(ctx, px + 25, py - 19, 2, 1, PRATA);
    } });
  I.objeto('lua-arvore-p', { w: 2, h: 1, solido: true, alto: true, topo: 46,   // a esguia: copa estreita em andares
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 10); tronco(ctx, px + 13, py - 8, 6, 22); raizes(ctx, px, py, 16, 4);
      folhagem(ctx, px, py, [[16, -36, 6], [12, -28, 7], [20, -27, 7], [16, -19, 9], [16, -9, 8]], ['#22305e', '#34487f', '#8fa4d0']);
      ret(ctx, px + 14, py - 43, 1, 1, '#ffffff'); ret(ctx, px + 22, py - 29, 2, 1, LUAR); ret(ctx, px + 9, py - 19, 2, 1, PRATA); ret(ctx, px + 20, py - 9, 1, 1, VAGA);
    } });
  I.objeto('lua-arvoreta', { w: 1, h: 1, solido: true, topo: 20,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6); tronco(ctx, px + 6, py + 2, 3, 13);
      folhagem(ctx, px, py, [[8, -4, 6], [4, 1, 4], [12, 1, 4]], ARV); ret(ctx, px + 9, py - 8, 2, 1, LUAR);
    } });
  I.objeto('lua-arbusto', { w: 1, h: 1, solido: 'base', topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7); folhagem(ctx, px, py, [[8, 8, 6], [3, 10, 4], [13, 10, 4]], ARV);
      ret(ctx, px + 6, py + 6, 1, 1, '#ffffff'); ret(ctx, px + 11, py + 9, 1, 1, CR[1]); ret(ctx, px + 4, py + 11, 1, 1, '#ffffff');   // gotas prateadas
    } });
  function samambaia(ctx, x, y, n) {   // folhas em leque que se curvam para fora
    for (var i = -n; i <= n; i++) {
      var a = Math.abs(i), c = i % 2 ? '#9fb4dc' : '#c8d8f4', ex = x + i * 4, ey = y - (6 - a);
      lin(ctx, x, y, x + i * 2, y - 3 - a, c); lin(ctx, x + i * 2, y - 3 - a, ex, ey + 2, c); ret(ctx, ex, ey + 2, 1, 1, '#eef6ff');
    }
  }
  I.objeto('lua-samambaia', { w: 1, h: 1, solido: false, plano: true, desenhar: function (ctx, px, py) { samambaia(ctx, px + 8, py + 14, 2); } });
  function ponta(ctx, x, y, w, h) {   // uma ponta de cristal com a quina de luz do lado esquerdo
    ret(ctx, x - 1, y + 1, w + 2, h, K); ret(ctx, x, y, w, 1, K); ret(ctx, x + 1, y - 1, Math.max(1, w - 2), 1, K);
    ret(ctx, x, y + 1, w, h - 1, CR[0]); ret(ctx, x, y + 1, 1, h - 2, CR[1]); ret(ctx, x + 1, y + 1, 1, Math.max(1, h - 4), CR[2]);
  }
  function cristalDes(ctx, px, py) {
    sombra(ctx, px + 8, py + 14, 6); halo(ctx, px + 8, py + 8, 12, 10, '184,212,248', 0.1);
    ponta(ctx, px + 2, py + 5, 4, 9); ponta(ctx, px + 6, py - 2, 4, 16); ponta(ctx, px + 11, py + 6, 3, 8);
    ret(ctx, px + 1, py + 13, 14, 2, '#2a3358'); ret(ctx, px + 3, py + 12, 3, 1, CR[1]);
  }
  I.objeto('lua-cristal-fixo', { w: 1, h: 1, solido: true, topo: 10, desenhar: cristalDes });   // sem anim: os cristais de fundo
  I.objeto('lua-cristal', { w: 1, h: 1, solido: true, topo: 10,
    desenhar: cristalDes,
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 420) % 4 : 0;
      if (f === 0) brilho(ctx, px + 7, py + 2, '#ffffff'); if (f === 2) { ret(ctx, px + 12, py + 3, 1, 1, '#ffffff'); ret(ctx, px + 3, py + 6, 1, 1, CR[1]); }
    } });
  function cristalGDes(ctx, px, py) {
    sombra(ctx, px + 8, py + 14, 7); halo(ctx, px + 8, py + 4, 14, 14, '143,232,240', 0.08);
    ponta(ctx, px + 1, py + 3, 4, 11); ponta(ctx, px + 5, py - 7, 6, 21); ponta(ctx, px + 11, py + 1, 4, 13);
    ret(ctx, px, py + 13, 16, 2, '#2a3358'); ret(ctx, px + 2, py + 12, 3, 1, CR[1]); ret(ctx, px + 12, py + 12, 2, 1, CIANO);
  }
  I.objeto('lua-cristal-g-fixo', { w: 1, h: 1, solido: true, topo: 22, desenhar: cristalGDes });   // sem anim
  I.objeto('lua-cristal-g', { w: 1, h: 1, solido: true, topo: 22,   // o grande (papel "estátua", ≤ 24)
    desenhar: cristalGDes,
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 380) % 4 : 0;
      if (f === 1) brilho(ctx, px + 7, py - 3, '#ffffff'); if (f === 3) brilho(ctx, px + 12, py + 4, CIANO);
    } });
  var CAP = [['#25c4dc', '#9ff4ff', '#1a8fb0'], ['#9a5ce0', '#d8b4ff', '#6a3aa8']];   // chapéu saturado, luz de 1 px, sombra
  function cogumelo(ctx, cx, base, n, v) {   // pé curto e claro, chapéu aceso em cima (silhueta de cogumelo), contorno K
    var c = CAP[v & 1], ws = [3, 5, 7, 9, 11], sh = 3, b = base - sh - 1, i;
    ret(ctx, cx - 2, base - sh, 1, sh + 1, K); ret(ctx, cx + 2, base - sh, 1, sh + 1, K); ret(ctx, cx - 1, base, 3, 1, K); ret(ctx, cx - 1, base - sh, 3, sh, '#e8eefc'); ret(ctx, cx + 1, base - sh, 1, sh, '#b8c4e4');
    ret(ctx, cx - (ws[0] >> 1), b - n, ws[0], 1, K);
    for (i = 0; i < n; i++) { var y = b - n + 1 + i, w = ws[i]; ret(ctx, cx - (w >> 1) - 1, y, w + 2, 1, K); ret(ctx, cx - (w >> 1), y, w, 1, i === n - 1 ? c[2] : c[0]); }
    ret(ctx, cx - (ws[n - 1] >> 1) - 1, b + 1, ws[n - 1] + 2, 1, K);
    ret(ctx, cx - (ws[1] >> 1), b - n + 2, 1, 1, c[1]); ret(ctx, cx - 1, b - n + 1, 2, 1, c[1]);   // 1 px de luz
    if (n > 2) ret(ctx, cx + 1, b - 1, 1, 1, c[1]);
  }
  var TUFOS = [[[4, 14, 3, 0], [10, 13, 2, 1], [13, 15, 2, 0]], [[6, 14, 3, 1], [12, 14, 2, 1], [2, 15, 2, 0], [9, 11, 2, 0]],
    [[5, 15, 2, 0], [10, 14, 3, 0], [13, 15, 2, 1]], [[8, 14, 3, 1], [3, 13, 2, 0], [13, 13, 2, 0], [6, 16, 2, 1], [11, 16, 2, 0]]];
  function tufo(ctx, px, py, o) {
    var t = TUFOS[vn(o) % 4];
    t.forEach(function (c) { halo(ctx, px + c[0], py + c[1] - 2, 8, 5, c[3] ? '196,150,255' : '143,232,240', 0.12); });
    t.forEach(function (c) { cogumelo(ctx, px + c[0], py + c[1], c[2], c[3]); });
  }
  I.objeto('lua-cogumelos-fixo', { w: 1, h: 1, solido: false, plano: true, desenhar: tufo });   // sem anim: o que enche os miudos (o motor sorteia dezenas)
  I.objeto('lua-cogumelos', { w: 1, h: 1, solido: false, plano: true, desenhar: tufo,
    anim: function (ctx, px, py, t, o) { var f = tempo(t) ? Math.floor(tempo(t) / 500) % 3 : 0; ret(ctx, px + 2 + f * 5, py + 3 + (f & 1) * 3 + (vn(o) & 1), 1, 1, '#ffffff'); } });
  I.objeto('lua-cogumelo', { w: 1, h: 1, solido: true, topo: 8,   // o interativo: o cogumelo grande que brilha, com um pequeno ao lado
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6); halo(ctx, px + 8, py + 9, 14, 9, '143,232,240', 0.12);
      cogumelo(ctx, px + 8, py + 15, 4, 0); cogumelo(ctx, px + 13, py + 15, 2, 1);
    },
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 350) % 4 : 0; if (f < 2) brilho(ctx, px + 3 + f * 9, py - 2 + f * 3, '#ffffff'); } });
  var FLOR = [[8, 6, '#dcecff', '#c4b6dc'], [5, 8, '#cdeeff', '#7fd0e8'], [10, 7, '#e8dcff', '#a78ae0']];
  function flor(ctx, x, y, aberta, a, b) {
    if (aberta) { ret(ctx, x - 3, y - 1, 7, 4, K); ret(ctx, x - 2, y - 2, 5, 6, K); ret(ctx, x - 2, y - 1, 5, 4, a); ret(ctx, x - 1, y - 2, 3, 6, b); ret(ctx, x, y, 1, 2, '#fff4cc'); }
    else { ret(ctx, x - 2, y - 3, 5, 7, K); ret(ctx, x - 1, y - 2, 3, 5, b); ret(ctx, x - 1, y - 2, 1, 3, a); }
  }
  function florLua(ctx, px, py, o) {
      var v = FLOR[vn(o) % 3];
      flor(ctx, px + v[0], py + v[1], true, v[2], v[3]);
      halo(ctx, px + v[0], py + v[1] + 2, 8, 6, v[3] === '#7fd0e8' ? '127,208,232' : '196,182,220', 0.12);
      ret(ctx, px + v[0], py + v[1] + 3, 1, 12 - v[1], '#3a5a80'); ret(ctx, px + v[0] - 3, py + 12, 3, 1, '#5d8aa8'); ret(ctx, px + v[0] + 1, py + 11, 3, 1, '#5d8aa8');
  }
  I.objeto('lua-flor-lua-fixa', { w: 1, h: 1, solido: false, plano: true, desenhar: florLua });   // sem anim: o que enche os miudos
  I.objeto('lua-flor-lua', { w: 1, h: 1, solido: false, plano: true, desenhar: florLua,   // estática; 1 px de brilho no miolo da flor
    anim: function (ctx, px, py, t, o) { var v = FLOR[vn(o) % 3]; if (tempo(t) && Math.floor(tempo(t) / 700) % 2) ret(ctx, px + v[0], py + v[1], 1, 1, '#ffffff'); } });
  I.objeto('lua-moita', { w: 2, h: 1, solido: false, plano: true, semSombra: true,   // moita: samambaia, flor-da-lua e cogumelo no mesmo objeto (3 variantes)
    desenhar: function (ctx, px, py, o) {
      var v = vn(o) % 3;
      halo(ctx, px + 16, py + 10, 14, 6, '143,232,240', 0.08); samambaia(ctx, px + 9 + v * 3, py + 14, 2);
      ctx.save(); flor(ctx, px + 21 - v * 2, py + 8, true, FLOR[v][2], FLOR[v][3]); ctx.restore(); ret(ctx, px + 21 - v * 2, py + 11, 1, 4, '#3a5a80');
      cogumelo(ctx, px + 15 + v * 5 - (v === 2 ? 14 : 0), py + 15, 2 + (v & 1), v);
    } });
  I.objeto('lua-moita-g', { w: 3, h: 1, solido: false, plano: true, semSombra: true,   // a larga: duas samambaias, tufo de cogumelos e flores
    desenhar: function (ctx, px, py, o) {
      var v = vn(o) % 2;
      halo(ctx, px + 24, py + 10, 22, 6, '143,232,240', 0.08); samambaia(ctx, px + 9, py + 14, 2); samambaia(ctx, px + 38 - v * 4, py + 14, 2);
      cogumelo(ctx, px + 22, py + 15, 3, v); cogumelo(ctx, px + 28, py + 15, 2, 1 - v); cogumelo(ctx, px + 18, py + 15, 2, 1 - v);
      flor(ctx, px + 31 + v * 4, py + 6, true, FLOR[v + 1][2], FLOR[v + 1][3]); ret(ctx, px + 31 + v * 4, py + 9, 1, 6, '#3a5a80'); flor(ctx, px + 12, py + 9, false, FLOR[0][2], FLOR[0][3]); ret(ctx, px + 12, py + 13, 1, 2, '#3a5a80');
    } });
  function pocaDes(ctx, px, py, o) { var v = vn(o) % 3; agua(ctx, px + 8, py + 9, [7, 5, 6][v], [4, 3, 3][v]); }
  I.objeto('lua-poca-fixa', { w: 1, h: 1, solido: false, plano: true, semSombra: true, desenhar: pocaDes });   // sem anim
  I.objeto('lua-poca', { w: 1, h: 1, solido: false, plano: true, semSombra: true,   // água com o reflexo da lua (3 formas)
    desenhar: pocaDes,
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 600) % 2 : 0; ret(ctx, px + 4 - f, py + 10, 1, 1, CR[1]); ret(ctx, px + 11 + f, py + 9, 1, 1, CR[1]); } });
  I.objeto('lua-poca-g', { w: 2, h: 2, solido: false, plano: true, semSombra: true,   // a poça da lua: reflete o disco lunar, com ondulação
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 17, 13, 9, '#3a4a7a'); elipse(ctx, px + 16, py + 17, 12, 8, '#26326a'); elipse(ctx, px + 16, py + 17, 9, 6, '#3a5290');
      circulo(ctx, px + 15, py + 17, 4, '#8fa4d0'); circulo(ctx, px + 15, py + 17, 3, '#f6f2d8'); ret(ctx, px + 13, py + 15, 2, 1, '#ffffff');   // o reflexo da lua
      ret(ctx, px + 7, py + 12, 4, 1, '#9db4e8'); ret(ctx, px + 22, py + 21, 3, 1, '#9db4e8'); ret(ctx, px + 4, py + 17, 1, 2, '#46609c'); ret(ctx, px + 27, py + 16, 1, 2, '#5d6890');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 600) % 2 : 0;
      ret(ctx, px + 9 - f, py + 17, 2, 1, CR[1]); ret(ctx, px + 20 + f, py + 17, 2, 1, CR[1]); ret(ctx, px + 12, py + 22 + f, 7, 1, f ? '#8fa4d0' : CR[1]); ret(ctx, px + 12 - f, py + 12 + f, 6, 1, '#6f86bc');
    } });
  function raioLuz(ctx, px, py, alt, larg, sem) {   // anéis de alfa 0,04 empilhados, beirada irregular, em diagonal
    for (var y = 0; y < alt; y += 2) for (var k = 0; k < 5; k++) {
      var hw = Math.min(larg, 3 + y / 2, 3 + (alt - y) / 3), w = Math.round(hw - k * 1.5 + (sorte(y, k, sem) - 0.5) * 1.8);
      if (w > 0) ret(ctx, px + 9 + Math.round(y * 0.33) - w, py + y, w * 2, 2, 'rgba(232,242,255,0.04)');
    }
  }
  I.objeto('lua-luar', { w: 2, h: 2, solido: false, plano: true, semSombra: true,   // poça de luar: elipse de pixel em 3 anéis de alfa baixo, 1 px de dither só na transição
    desenhar: function (ctx, px, py, o) {
      var s = 90 + vn(o) * 3, A = 'rgba(226,238,255,0.07)';
      for (var j = 0; j < 32; j++) for (var k = 0; k < 3; k++) {
        var dy = (j - 15.5) / (13 - k * 3.2), w = dy * dy < 1 ? Math.round((15 - k * 3.6) * Math.sqrt(1 - dy * dy) + (sorte(j >> 1, k, s) - 0.5) * 1.6) : 0;
        if (w > 0) ret(ctx, px + 16 - w, py + j, w * 2, 1, A);
        if (k === 0 && w > 0) { if (sorte(j, 1, s) < 0.5) ret(ctx, px + 15 - w, py + j, 1, 1, A); if (sorte(j, 2, s) < 0.5) ret(ctx, px + 16 + w, py + j, 1, 1, A); }
      }
      ret(ctx, px + 12, py + 14, 1, 1, '#ffffff'); ret(ctx, px + 19, py + 20, 1, 1, '#eef6ff'); ret(ctx, px + 9, py + 20, 1, 1, '#eef6ff');
    } });
  I.objeto('lua-feixe', { w: 2, h: 3, solido: false, plano: true, semSombra: true,   // feixe largo de luar em diagonal (de cima e da esquerda): 5 anéis de alfa 0,04, beirada irregular
    desenhar: function (ctx, px, py) { raioLuz(ctx, px, py, 48, 8, 95); },
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 600) % 4 : 0; ret(ctx, px + 9 + f * 3, py + 8 + f * 8, 1, 1, '#ffffff'); ret(ctx, px + 16 - f * 2, py + 30 - f * 3, 1, 1, PRATA); } });
  I.objeto('lua-pedra', { w: 1, h: 1, solido: 'base', topo: 8,   // contorno K escuro normal; 1 px de luar prateado em cima e à esquerda
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, '#7f8cb8'); ret(ctx, px + 9, py + 11, 4, 2, '#5a6694'); ret(ctx, px + 4, py + 7, 3, 1, '#dfe8fa'); ret(ctx, px + 3, py + 8, 1, 2, '#c8d4ee');
    } });
  I.objeto('lua-pedra-runa', { w: 2, h: 1, solido: true, topo: 24,   // marco do círculo de pedras: a runa brilha no anim
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 11);
      ret(ctx, px + 10, py - 6, 12, 21, K); ret(ctx, px + 12, py - 8, 8, 2, K); ret(ctx, px + 8, py + 10, 16, 5, K);
      ret(ctx, px + 11, py - 6, 10, 20, '#7f8cb8'); ret(ctx, px + 13, py - 7, 6, 1, '#7f8cb8'); ret(ctx, px + 9, py + 11, 14, 3, '#7f8cb8');
      ret(ctx, px + 11, py - 6, 1, 20, '#dfe8fa'); ret(ctx, px + 13, py - 7, 3, 1, LUAR); ret(ctx, px + 19, py - 4, 2, 18, '#5a6694'); ret(ctx, px + 9, py + 11, 1, 3, '#c8d4ee');
      ret(ctx, px + 14, py, 4, 1, '#3aa8c0'); ret(ctx, px + 15, py + 1, 2, 5, '#3aa8c0'); ret(ctx, px + 13, py + 3, 1, 1, '#3aa8c0'); ret(ctx, px + 18, py + 3, 1, 1, '#3aa8c0');   // a runa, apagada
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 450) % 3 : 1;
      if (f) { ret(ctx, px + 14, py, 4, 1, CIANO); ret(ctx, px + 15, py + 1, 2, 5, CIANO); }
      if (f === 2) brilho(ctx, px + 16, py - 3, '#ffffff');
    } });
  var VG = [[3, 5, 0], [10, 3, 2], [12, 11, 4]];
  I.objeto('lua-vaga-lumes', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { VG.forEach(function (v) { halo(ctx, px + v[0], py + v[1], 4, 3, '255,233,168', 0.14); ret(ctx, px + v[0], py + v[1], 1, 1, VAGA); }); },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < VG.length; n++) {
        var v = VG[n], dx = t ? Math.round(Math.sin(t / 500 + v[2]) * 3) : 0, dy = t ? Math.round(Math.cos(t / 420 + v[2]) * 2) : 0;
        ret(ctx, px + v[0] + dx, py + v[1] + dy, 2, 2, (t ? Math.floor(t / 250 + v[2]) % 3 : 0) ? VAGA : '#fff4cc');
      }
    } });
  I.objeto('lua-raio', { w: 2, h: 2, solido: false, plano: true, semSombra: true,   // raio de luar do círculo de pedras, em pontilhado
    desenhar: function (ctx, px, py) { raioLuz(ctx, px, py, 32, 6, 96); },
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 600) % 4 : 0; ret(ctx, px + 8 + f * 3, py + 6 + f * 5, 1, 1, '#ffffff'); ret(ctx, px + 14 - f * 2, py + 20 - f * 3, 1, 1, PRATA); } });
  I.objeto('lua-folhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, 0], [9, 5, 1], [10, 11, 0]].forEach(function (f) { ret(ctx, px + f[0], py + f[1], 3, 2, f[2] ? '#9fb4dc' : PRATA); ret(ctx, px + f[0], py + f[1], 1, 1, '#eef6ff'); });
    } });

  /* ---------- os 4 interativos temáticos (mesmos nomes e falas do layout) ---------- */
  I.objeto('lua-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 5, py + 7, 6, 9, K); ret(ctx, px + 6, py + 7, 4, 8, TR[1]); ret(ctx, px + 6, py + 7, 1, 8, TR[2]);
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#dce6fc'); ret(ctx, px + 1, py - 3, 14, 2, '#f2f6ff'); ret(ctx, px + 1, py + 5, 14, 2, '#9fb4dc');
      circulo(ctx, px + 8, py + 1, 3, '#3a4a7a'); circulo(ctx, px + 9, py, 3, '#dce6fc');   // a lua crescente pintada, escura no painel claro
      ret(ctx, px + 12, py - 1, 1, 1, '#3a4a7a'); ret(ctx, px + 3, py + 3, 1, 1, '#3a4a7a');
    } });
  I.objeto('lua-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,   // o ponto quente da noite
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5); halo(ctx, px + 8, py - 13, 14, 14, '255,226,122', 0.11);
      ret(ctx, px + 7, py - 18, 3, 33, K); ret(ctx, px + 8, py - 18, 1, 32, TR[2]); ret(ctx, px + 9, py - 18, 1, 32, TR[0]);
      ret(ctx, px + 8, py - 22, 7, 2, K); ret(ctx, px + 12, py - 22, 2, 8, K); ret(ctx, px + 10, py - 21, 4, 1, TR[2]);
      ret(ctx, px + 9, py - 14, 8, 10, K); ret(ctx, px + 10, py - 13, 6, 8, '#ffd34d'); ret(ctx, px + 11, py - 12, 2, 5, '#fffbe0'); ret(ctx, px + 9, py - 15, 8, 2, K);
      ret(ctx, px + 6, py + 12, 7, 4, K); ret(ctx, px + 7, py + 12, 5, 3, '#8f9cc4');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 180) % 3 : 0;
      ret(ctx, px + 10 + f, py - 12, 1, 6, '#ffffff'); brilho(ctx, px + 4 + f * 6, py - 18 + (f & 1) * 5, VAGA);
    } });
  I.objeto('lua-arvore-velha', { w: 2, h: 1, solido: true, alto: true, topo: 46,   // antiga: tronco largo oco com olhinhos, folhas prateadas e uma teia
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 6, py - 12, 20, 27, K); ret(ctx, px + 7, py - 12, 18, 26, TR[1]); ret(ctx, px + 7, py - 12, 4, 26, TR[2]); ret(ctx, px + 21, py - 12, 4, 26, TR[0]);
      ret(ctx, px + 4, py + 11, 5, 4, K); ret(ctx, px + 23, py + 11, 5, 4, K); ret(ctx, px + 5, py + 11, 3, 3, TR[2]);
      ret(ctx, px + 12, py - 4, 8, 9, K); ret(ctx, px + 13, py - 3, 6, 7, '#141d3c'); ret(ctx, px + 14, py - 1, 1, 2, CIANO); ret(ctx, px + 17, py - 1, 1, 2, CIANO);   // o oco, com olhinhos
      ret(ctx, px + 8, py + 6, 1, 8, '#9fb4dc'); ret(ctx, px + 23, py + 4, 1, 9, '#9fb4dc');   // barba de musgo prateado
      folhagem(ctx, px, py, [[16, -24, 12], [6, -17, 8], [26, -17, 8], [16, -13, 10]], ['#26366a', '#3d5496', '#8fa4d0']);
      lin(ctx, px + 24, py - 12, px + 29, py - 4, 'rgba(238,246,255,0.85)'); lin(ctx, px + 24, py - 12, px + 24, py - 4, 'rgba(238,246,255,0.85)'); lin(ctx, px + 24, py - 8, px + 29, py - 8, 'rgba(238,246,255,0.85)');
      ret(ctx, px + 12, py - 30, 2, 1, LUAR); ret(ctx, px + 24, py - 26, 2, 1, PRATA);
    },
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 500) % 3 : 0; brilho(ctx, px + 25 + (f & 1), py - 7 + f, '#ffffff'); } });
})();
