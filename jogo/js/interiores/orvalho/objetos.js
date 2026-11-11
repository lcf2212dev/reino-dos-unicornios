/* Bosque do Orvalho, o chão, a parede, o céu e os objetos da mata de manhã (prefixo orvalho-): luz dourada de sol baixo,
   orvalho em cachos, poças, teia, samambaias e flores. Piso 'orvalho-orvalho' (grama em manchas de 3 verdes, manchas de
   sol, capim, flores em moitas, gotas em cachos e a trilha de terra clara de cantos redondos), parede 'orvalho-copas'
   (3 camadas de copa, cipós com gotas, rasgos de sol) e I.FUNDOS.orvalho (a mata longe, só a faixa de baixo e as lascas
   das bordas aparecem). Árvores (grande, esguia, arvoreta, a velha), arbusto, pedra, toco (sólidos) e o enfeite do chão
   (planos): samambaia, flor, florzinha, folha, poça, teia, pólen, raio de sol e os interativos (placa, lanterna, cogumelo).
   Reino._predios.orvalho guarda as trilhas (P.trilha, em orvalho.js). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).orvalho = R._predios.orvalho || {};
  var PL = R._predios.planetas || {};
  function tempo(t) { return PL.tempo ? PL.tempo(t) : ((R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0)); }
  var V = ['#3f7a4c', '#5c9e60', '#8ccc84', '#b4e6a2'], CG = '#3f7a4c', QUENTE = '#ffe9a8', TR = ['#6a5240', '#8c7058', '#b09472'], MUSGO = '#7aa85a';

  /* ---------- peças comuns: orvalho, sombra, tronco, folhagem com luz quente, halo e linha de pixel ---------- */
  function perola(ctx, x, y) { ret(ctx, x, y, 2, 2, '#eefcff'); ret(ctx, x, y, 1, 1, '#ffffff'); ret(ctx, x + 1, y + 1, 1, 1, '#bfeaff'); ret(ctx, x + 1, y + 2, 1, 1, '#8fd0e0'); }
  function cacho(ctx, x, y, n) { [[0, 0], [3, 2], [-2, 3], [5, -1], [1, 5]].slice(0, n).forEach(function (d) { perola(ctx, x + d[0], y + d[1]); }); }   // 3 a 5 gotas juntas
  function gota(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r + 1, K); circulo(ctx, cx, cy, r, '#bfeaff'); circulo(ctx, cx, cy, r - 1, '#eefcff'); ret(ctx, cx - 1, cy - 1, 1, 1, '#ffffff');
  }
  P.gota = gota;
  function sombra(ctx, cx, y, rx) {   // a luz vem da esquerda (sol baixo): mancha achatada em 2 tons, beirada em dither de 1 px, rabo para a direita
    var c1 = 'rgba(30,60,40,0.16)', c2 = 'rgba(30,60,40,0.3)';
    elipse(ctx, cx + 3, y, rx, 3, c1); elipse(ctx, cx + 2, y, rx - 2, 2, c2);
    ret(ctx, cx + rx + 3, y - 1, 3, 2, c1); ret(ctx, cx + rx + 3, y, 2, 1, c2);
    ret(ctx, cx - rx + 1, y - 3, 1, 1, c1); ret(ctx, cx - rx + 4, y + 3, 1, 1, c1); ret(ctx, cx + rx + 1, y - 3, 1, 1, c1); ret(ctx, cx + rx - 2, y + 3, 1, 1, c1);
  }
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TR[1]); ret(ctx, x, y, 2, h, TR[2]); ret(ctx, x + w - 2, y, 2, h, TR[0]); }
  function folhagem(ctx, px, py, bolas) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], V[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 1, Math.max(1, b[2] - 2), V[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 2, py + b[1] - 3, Math.max(1, b[2] - 5), V[2]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 4)), V[3]); });
    bolas.forEach(function (b) { var d = Math.round((b[2] - 1) * 0.7); ret(ctx, px + b[0] - d - 1, py + b[1] - d, 2, 1, QUENTE); ret(ctx, px + b[0] - d - 1, py + b[1] - d + 1, 1, 1, QUENTE); });
  }
  // luz: elipse de pixel com 3 anéis de alfa 0,04 (somam 0,04/0,08/0,12), beirada irregular e 1 px de dither só na transição
  function luz(ctx, cx, cy, rx, ry, rgb) {
    ctx.fillStyle = 'rgba(' + rgb + ',0.04)';
    for (var k = 0; k < 3; k++) {
      var f = 1 - k * 0.27, a = ry * f, y, w;
      for (y = -Math.floor(a); y <= a; y++) {
        w = Math.round(rx * f * Math.sqrt(1 - (y * y) / (a * a + 0.01))) + (((y * 5 + k * 3 + 9) & 3) - 1);
        if (w > 0) ctx.fillRect(cx - w, cy + y, w * 2, 1);
        if (k === 0 && (y & 1)) { ctx.fillRect(cx - w - 1, cy + y, 1, 1); ctx.fillRect(cx + w, cy + y, 1, 1); }
      }
    }
  }
  function halo(ctx, cx, cy, r) { luz(ctx, cx, cy, r, r, '255,226,122'); }
  function linha(ctx, x0, y0, x1, y1, c, g) {   // g = espessura do ponto (1 padrão)
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (var i = 0; i <= n; i++) ret(ctx, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), g || 1, g || 1, c);
  }
  function fronde(ctx, x, y, pts) {   // samambaia: folhas em verde escuro da paleta (não K), miolo claro e ponta com luz
    pts.forEach(function (f) { linha(ctx, x, y, x + f[0], y + f[1], CG, 3); });
    pts.forEach(function (f, i) { linha(ctx, x, y, x + f[0], y + f[1], V[i & 1 ? 1 : 2], 1); ret(ctx, x + f[0], y + f[1], 1, 1, V[3]); });
  }
  function mini(ctx, x, y, c) { ret(ctx, x, y + 1, 1, 3, V[1]); ret(ctx, x - 1, y, 3, 1, c); ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x, y, 1, 1, '#ffd34d'); ret(ctx, x - 1, y - 1, 1, 1, '#ffffff'); }
  var FLORES = ['#fff8ee', '#ffb0c8', '#cbb6f0'];

  /* ---------- o piso: manchas orgânicas de grama (coordenada global), trilha de terra irregular ---------- */
  // distância normalizada ao centro da mancha mais próxima (menor que 1 = dentro); a borda ondula (sem quina de bloco)
  function mancha(gx, gy, s, cel, r0, r1, prob) {
    var cx0 = Math.floor(gx / cel), cy0 = Math.floor(gy / cel), dentro = 9;
    for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
      var cx = cx0 + i, cy = cy0 + j;
      if (sorte(cx, cy, s) > prob) continue;
      var mx = (cx + 0.25 + sorte(cx, cy, s + 1) * 0.5) * cel, my = (cy + 0.25 + sorte(cx, cy, s + 2) * 0.5) * cel, r = r0 + sorte(cx, cy, s + 3) * (r1 - r0);
      var d = Math.sqrt((gx - mx) * (gx - mx) + (gy - my) * (gy - my) * 1.6) / r;
      d *= 1 + 0.2 * Math.sin(gx * 0.17 + gy * 0.09 + cx * 3) + 0.14 * Math.sin(gy * 0.23 - gx * 0.11 + cy * 5);
      if (d < dentro) dentro = d;
    }
    return dentro;
  }
  // a cor da grama num bloco 2×2 (a trilha usa a mesma para a borda casar com o chão ao lado): grama iluminada (mais clara) e mancha média, todas de borda irregular e dura
  function grama(gx, gy) {
    if (mancha(gx, gy, 30, 120, 14, 26, 0.45) < 1) return '#d8f8e0';
    if (mancha(gx, gy, 10, 112, 40, 66, 0.7) < 1) return '#a5dcb2';
    return '#b8ecc4';
  }
  function gotaPiso(ctx, x, y) { ret(ctx, x, y, 2, 2, '#bfeaff'); ret(ctx, x, y, 1, 1, '#ffffff'); ret(ctx, x + 1, y + 1, 1, 1, 'rgba(90,150,170,0.6)'); }
  function triEsq(ctx, px, py, cx, cy, n, cor) {   // triângulo de canto de n px
    for (var r = 0; r < n; r++) ret(ctx, px + (cx ? 16 - (n - r) : 0), py + (cy ? 15 - r : r), n - r, 1, cor);
  }
  function pos(s, u, v) { return s === 0 ? [u, v] : s === 1 ? [u, 15 - v] : s === 2 ? [v, u] : [15 - v, u]; }   // (ao longo da borda, para dentro) → pixel
  var MUD = '#a8936c', PR = [[4, 6, 7, 3], [4, 7, 7, 3], [6, 4, 3, 7], [7, 4, 3, 7]];
  function trilha(ctx, px, py, tx, ty) {
    var N = function (dx, dy) { return P.trilha(tx + dx, ty + dy); }, i, u, v, bx, by, gx, gy;
    ret(ctx, px, py, 16, 16, '#e8dcc0');
    for (by = 0; by < 8; by++) for (bx = 0; bx < 8; bx++) {   // terra irregular: manchas claras e barro úmido mais escuro, bordas orgânicas
      gx = tx * 16 + bx * 2; gy = ty * 16 + by * 2;
      if (mancha(gx, gy, 41, 70, 7, 14, 0.5) < 1) ret(ctx, px + bx * 2, py + by * 2, 2, 2, '#dccfa8');
      else if (mancha(gx, gy, 40, 90, 14, 28, 0.5) < 1) ret(ctx, px + bx * 2, py + by * 2, 2, 2, '#f2e8cf');
    }
    for (i = 0; i < 2; i++) if (sorte(tx, ty, 30 + i) < 0.55) {   // seixos com luz em cima/à esquerda
      var qx = px + 2 + Math.floor(sorte(tx, ty, 32 + i) * 11), qy = py + 3 + Math.floor(sorte(tx, ty, 34 + i) * 9);
      ret(ctx, qx - 1, qy, 4, 3, '#a8996e'); ret(ctx, qx, qy, 2, 2, '#c2b184'); ret(ctx, qx, qy, 1, 1, '#f4eeda');
    }
    if (sorte(tx, ty, 45) < 0.18) {   // raiz que cruza a terra
      var rx = px + 2 + Math.floor(sorte(tx, ty, 46) * 4), ry = py + 6 + Math.floor(sorte(tx, ty, 47) * 4);
      ret(ctx, rx, ry, 3, 1, '#7a5f48'); ret(ctx, rx + 3, ry + 1, 3, 1, '#7a5f48'); ret(ctx, rx + 6, ry, 3, 1, '#7a5f48'); ret(ctx, rx + 1, ry - 1, 2, 1, '#b09472'); ret(ctx, rx + 5, ry, 2, 1, '#b09472');
    }
    if (sorte(tx, ty, 40) < 0.14) { var fx = px + 3 + Math.floor(sorte(tx, ty, 41) * 8), fy = py + 5 + Math.floor(sorte(tx, ty, 42) * 7); ret(ctx, fx, fy, 3, 2, '#d79a5e'); ret(ctx, fx, fy, 1, 1, '#f0c080'); ret(ctx, fx + 2, fy + 1, 1, 1, '#a8703c'); }
    var lados = [!N(0, -1), !N(0, 1), !N(-1, 0), !N(1, 0)], aberto = -1;
    lados.forEach(function (ab, s) {
      if (!ab) return;
      if (aberto < 0) aberto = s;
      for (u = 0; u < 16; u++) {
        var g = (s < 2 ? tx : ty) * 16 + u, p, t = 2 + Math.max(0, Math.min(2, Math.round(Math.sin(g * 0.55 + s) + Math.sin(g * 0.23 + s * 3) + 0.8)));
        for (v = 0; v <= t + 1; v++) {
          p = pos(s, u, v);
          ret(ctx, px + p[0], py + p[1], 1, 1, v === t + 1 ? '#c8b892' : v === t ? MUD : grama(tx * 16 + p[0], ty * 16 + p[1]));   // beirada úmida: barro mais escuro
        }
        if (sorte(g >> 1, s, 60) < 0.3) for (var du = 0; du < 2 && u + du < 16; du++) {   // o capim invade a terra em degraus
          for (v = t + 1; v <= t + 3 - du; v++) { p = pos(s, u + du, v); ret(ctx, px + p[0], py + p[1], 1, 1, v === t + 3 - du ? '#b4e6a2' : '#86c79b'); }
        }
      }
    });
    if (aberto >= 0 && sorte(tx, ty, 90) < 0.18) {   // poça com o céu refletido, rente à beirada
      var r = PR[aberto];
      var qx = px + r[0] + 3, qy = py + r[1] + 3;
      elipse(ctx, qx, qy, 5, 3, MUD); elipse(ctx, qx, qy, 4, 2, '#bfeaff'); elipse(ctx, qx, qy + 1, 3, 1, '#8fd0e0'); ret(ctx, qx + 4, qy - 2, 2, 1, MUD); ret(ctx, qx - 5, qy + 1, 1, 1, MUD);
      ret(ctx, qx - 2, qy - 1, 2, 1, '#ffffff'); ret(ctx, qx + 1, qy, 1, 1, '#eefcff');
    }
    [[0, 0], [15, 0], [0, 15], [15, 15]].forEach(function (c) {   // cantos: redondo por fora, entalhe por dentro
      var sx = c[0] ? 1 : -1, sy = c[1] ? 1 : -1, a = N(0, sy), b = N(sx, 0);
      if (!a && !b) { triEsq(ctx, px, py, c[0], c[1], 5, MUD); triEsq(ctx, px, py, c[0], c[1], 4, grama(tx * 16 + c[0], ty * 16 + c[1])); }
      else if (a && b && !N(sx, sy)) { triEsq(ctx, px, py, c[0], c[1], 4, MUD); triEsq(ctx, px, py, c[0], c[1], 3, grama(tx * 16 + c[0], ty * 16 + c[1])); }
    });
  }
  I.PISOS['orvalho-orvalho'] = { cores: { piso: '#b8ecc4', piso2: '#a5dcb2', detalhe: '#86c79b', luz: '#d8f8e0' },
    desenhar: function (ctx, px, py, tx, ty) {
      var bx, by;
      for (by = 0; by < 8; by++) for (bx = 0; bx < 8; bx++) ret(ctx, px + bx * 2, py + by * 2, 2, 2, grama(tx * 16 + bx * 2, ty * 16 + by * 2));
      if (P.trilha(tx, ty)) { trilha(ctx, px, py, tx, ty); return; }
      if (sorte(tx, ty, 3) < 0.4) {   // tufos de capim em verde da paleta (sem contorno escuro), lâmina iluminada
        var cx = px + 2 + Math.floor(sorte(tx, ty, 4) * 11), cy = py + 4 + Math.floor(sorte(tx, ty, 5) * 10);
        ret(ctx, cx, cy - 2, 1, 3, '#6fae6e'); ret(ctx, cx + 1, cy - 3, 1, 4, '#5c9e60'); ret(ctx, cx + 2, cy - 1, 1, 2, '#6fae6e'); ret(ctx, cx + 1, cy - 3, 1, 1, '#d8f8e0'); ret(ctx, cx - 1, cy + 1, 5, 1, '#86c79b');
      }
      if (sorte(Math.floor(tx / 5), Math.floor(ty / 5), 70) < 0.32 && sorte(tx, ty, 71) < 0.7) {   // moita de trevo e florzinhas
        mini(ctx, px + 3 + Math.floor(sorte(tx, ty, 72) * 10), py + 4 + Math.floor(sorte(tx, ty, 73) * 8), FLORES[Math.floor(sorte(tx, ty, 74) * 3)]);
      }
      if (sorte(tx, ty, 80) < 0.2) {   // orvalho em cacho: 3 a 5 gotas juntas
        var ox = px + 2 + Math.floor(sorte(tx, ty, 81) * 8), oy = py + 2 + Math.floor(sorte(tx, ty, 82) * 7), n = 3 + Math.floor(sorte(tx, ty, 83) * 3);
        [[0, 0], [3, 2], [1, 5], [5, 5], [6, 0]].slice(0, n).forEach(function (d) { gotaPiso(ctx, ox + d[0], oy + d[1]); });
      }
    } };

  /* ---------- a parede: 3 camadas de copa (escura embaixo, clara em cima), luz quente, cipós e rasgos de sol ---------- */
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, V[0]);
    var CAM = [[5, 1, 2, 3], [15, 1, 1, 2], [25, 0, 0, 1]];   // [linha, cor, ...]: do alto (claro) para baixo (escuro)
    var c0 = Math.floor((x - 10) / 12), c1 = Math.floor((x + w + 10) / 12);
    if (sorte(Math.floor(x / 16), 0, 66) < 0.3) { ret(ctx, x + 3, y, 10, 5, '#e8fbe8'); for (var k = 0; k < 5; k++) { ctx.fillStyle = 'rgba(255,233,168,0.6)'; ctx.fillRect(x + 3 + k * 2, y + (k & 1) * 2, 2, 2); } }   // rasgo de sol
    CAM.forEach(function (cam, li) {
      if (li === 2) { var tx = Math.floor(x / 16), t = Math.floor(sorte(tx, 0, 60) * 10); ret(ctx, x + t, y + 19, 3, 10, K); ret(ctx, x + t + 1, y + 19, 1, 10, TR[1]); }   // tronco entre as camadas
      for (var cc = c0; cc <= c1; cc++) {
        var bx = cc * 12 + 6 + Math.round((sorte(cc, li, 1) - 0.5) * 7) + (li & 1) * 6, by = y + cam[0] + Math.round((sorte(cc, li, 2) - 0.5) * 5);
        circulo(ctx, bx, by, 8, K); circulo(ctx, bx, by, 7, V[cam[1]]);
        circulo(ctx, bx - 1, by - 1, 5, V[cam[1] + 1]); ret(ctx, bx - 5, by - 4, 2, 1, QUENTE); ret(ctx, bx - 6, by - 3, 1, 1, QUENTE);
        if (sorte(cc, li, 3) < 0.25) perola(ctx, bx + 2, by + 1);
      }
    });
    ctx.restore();
  }
  P.copas = copas;
  I.PAREDES['orvalho-copas'] = { cores: { parede: '#6fae6e', parede2: '#8ccc84', rodape: '#4f8a56', detalhe: '#b4e6a2' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      ret(ctx, px, py + 29, 16, 3, '#3f7048'); ret(ctx, px, py + 29, 16, 1, '#4f8a56');
      if (sorte(tx, 0, 61) < 0.4) {   // cipó pendurado com a gota na ponta
        var cx = px + 3 + Math.floor(sorte(tx, 0, 62) * 10), n = 6 + Math.floor(sorte(tx, 0, 63) * 8);
        ret(ctx, cx, py + 20, 1, n, '#3f7048'); ret(ctx, cx + 1, py + 22, 1, 2, '#8ccc84'); perola(ctx, cx - 1 + (tx & 1), py + 20 + n);
      }
    } };

  /* ---------- o céu aberto: a faixa de baixo (3 tiles) e as lascas das bordas: névoa da manhã sobre copas distantes ---------- */
  function copasLonge(ctx, w, y, cor, s, sx) {   // silhueta de copas de 3 alturas irregulares (alta, média, baixa), com 1 px de luz quente em cima
    var x = -6, r, cy, alt;
    ret(ctx, 0, y + 10, w, 90, cor);
    while (x < w + 8) {
      alt = [0, 5, 10][Math.floor(sorte(x, s, 5) * 3)]; r = 6 + Math.floor(sorte(x, s, 8) * 5); cy = y + 12 - alt;
      if (s === 0 && Math.abs(x - sx) < 24) cy += 8;   // o sol nasce num vão das copas
      circulo(ctx, x, cy, r, cor); if (s < 2) { ctx.fillStyle = 'rgba(255,244,204,0.55)'; ctx.fillRect(x - 3, cy - r, 4, 1); }
      x += 7 + Math.floor(sorte(x, s, 6) * 8);
    }
  }
  function disco(ctx, cx, cy, r, cor) { for (var dy = -r; dy <= r; dy++) { var hw = Math.round(Math.sqrt(r * r - dy * dy)); ctx.fillStyle = cor; ctx.fillRect(cx - hw, cy + dy, hw * 2, 1); } }
  I.FUNDOS.orvalho = { cor: '#bfecd6',
    desenhar: function (ctx, w, h) {
      ret(ctx, 0, 0, w, h, '#d8f4e4');
      var topo = h - 46, sx = Math.round(w * 0.74), k, x, y;
      ret(ctx, 0, topo - 40, w, 40, '#a2dcc2');   // a mata alta ao fundo (aparece nas lascas das bordas)
      for (y = 0; y < topo; y += 8) for (x = 0; x < w; x += 16) if (sorte(x >> 4, y >> 3, 7) < 0.5) ret(ctx, x + (y & 8), y, 6, 4, '#8fd0b4');
      for (k = 0; k < 5; k++) {   // o brilho quente do horizonte: faixas de 2 px que afinam para os lados, com dither de 1 px na beirada
        var gw = 150 - k * 26; ctx.fillStyle = 'rgba(255,226,150,' + (0.14 + k * 0.06) + ')'; ctx.fillRect(sx - gw, topo + 2 + k * 2, gw * 2, 2);
        for (x = sx - gw - 6; x < sx - gw; x += 2) ctx.fillRect(x + (k & 1), topo + 2 + k * 2 + (x & 1), 1, 1); for (x = sx + gw; x < sx + gw + 6; x += 2) ctx.fillRect(x + (k & 1), topo + 2 + k * 2 + (x & 1), 1, 1);
      }
      disco(ctx, sx, topo + 15, 14, '#ffc477'); disco(ctx, sx, topo + 15, 12, '#ffd98a'); disco(ctx, sx, topo + 15, 9, '#fff0b8'); disco(ctx, sx - 1, topo + 14, 5, '#fffbe6');   // o sol baixo da manhã, em degraus
      for (x = sx - 15; x <= sx + 15; x += 2) { ctx.fillStyle = '#ffd98a'; ctx.fillRect(x, topo + 1 + (x & 2) / 2, 1, 1); }
      copasLonge(ctx, w, topo + 8, '#5aa88c', 0, sx); copasLonge(ctx, w, topo + 19, '#86cbae', 1, sx); copasLonge(ctx, w, topo + 29, '#a2dcc2', 2, sx);
      ret(ctx, 0, topo + 40, w, Math.max(0, h - topo - 40), '#bfecd6');
      for (x = 0; x < w; x += 6) for (y = topo + 24; y < h; y += 4) if (sorte(x, y, 9) < 0.2) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, 1, 1); }   // névoa baixa
      for (k = 0; k < 40; k++) { x = Math.round(sorte(k, 1, 11) * w); y = topo + 12 + Math.round(sorte(k, 2, 11) * 34); ret(ctx, x, y, 1, 1, '#fff4cc'); }   // pólen
    } };

  /* ---------- as árvores: grande, esguia, arvoreta e a velha (a copa alta cobre quem passa atrás) ---------- */
  function raizes(ctx, px, py, a, b) {
    ret(ctx, px + a, py + 11, 5, 4, K); ret(ctx, px + a + 1, py + 11, 3, 3, TR[1]); ret(ctx, px + b, py + 11, 5, 4, K); ret(ctx, px + b + 1, py + 11, 3, 3, TR[0]);
  }
  function pendurada(ctx, x, y, n) {   // fio fino e uma gotinha de 1 px de largura: brilho em cima, sombra ciano embaixo, sem contorno
    ret(ctx, x, y, 1, n, V[0]); ret(ctx, x, y + n, 1, 2, '#bfeaff'); ret(ctx, x, y + n, 1, 1, '#ffffff'); ret(ctx, x, y + n + 2, 1, 1, '#5fb0b8');
  }
  function vt(o) { return o ? ((o.x || 0) * 7 + (o.y || 0) * 3) % 3 : 0; }   // a variante da árvore sai do lugar dela (nunca duas iguais em fila)
  var GR = [[[16, -20, 13], [6, -10, 9], [26, -10, 9], [16, -8, 10], [23, -26, 6]], [[14, -22, 12], [5, -12, 8], [24, -14, 9], [15, -9, 10], [9, -28, 6]], [[18, -17, 11], [7, -9, 9], [27, -10, 7], [16, -8, 10], [12, -25, 7]]];
  var GP = [[[16, -28, 8], [11, -19, 7], [21, -19, 7], [16, -9, 8]], [[15, -30, 7], [20, -22, 8], [11, -16, 6], [16, -9, 8]]];
  I.objeto('orvalho-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py, o) {
      var v = vt(o);
      sombra(ctx, px + 16, py + 14, 13); ret(ctx, px + 20, py + 12, 10, 2, 'rgba(30,60,40,0.2)'); raizes(ctx, px, py, 8, 19); tronco(ctx, px + 12 + (v & 1), py - 6, 8, 20);
      ret(ctx, px + 12, py + 3, 3, 7, MUSGO); ret(ctx, px + 12, py + 3, 1, 7, '#a8cf80'); ret(ctx, px + 15, py + 8, 2, 3, MUSGO);
      folhagem(ctx, px, py, GR[v]);
      pendurada(ctx, px + 9, py - 1, 2); pendurada(ctx, px + 19, py + 2, 1); pendurada(ctx, px + 28, py - 4, 3); cacho(ctx, px + 13, py - 22, 3 + v); perola(ctx, px + 20, py - 14);
    } });
  I.objeto('orvalho-arvore-p', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py, o) {
      var v = vt(o) & 1;
      sombra(ctx, px + 16, py + 14, 10); ret(ctx, px + 20, py + 12, 8, 2, 'rgba(30,60,40,0.2)'); raizes(ctx, px, py, 10, 17); tronco(ctx, px + 14, py - 12, 4, 26);
      ret(ctx, px + 14, py + 4, 1, 7, MUSGO);
      folhagem(ctx, px, py, GP[v]);
      pendurada(ctx, px + 10, py - 11, 2); pendurada(ctx, px + 20, py - 9, 1); pendurada(ctx, px + 14, py - 8, 2); cacho(ctx, px + 18, py - 26, 3); perola(ctx, px + 14, py - 10);
    } });
  I.objeto('orvalho-arvoreta', { w: 1, h: 1, solido: true, topo: 20,
    desenhar: function (ctx, px, py, o) {
      var v = vt(o);
      sombra(ctx, px + 8, py + 14, 6); tronco(ctx, px + 7, py + 2, 2, 12);
      folhagem(ctx, px, py, [[[8, 0, 5], [3, 5, 3], [13, 5, 3]], [[8, 1, 6], [3, 6, 3], [12, 5, 2]], [[7, 0, 4], [12, 3, 4], [3, 6, 3]]][v]); perola(ctx, px + 9 - v, py + 4);
    } });
  I.objeto('orvalho-arbusto', { w: 1, h: 1, solido: true, topo: 12,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 7); folhagem(ctx, px, py, [[[8, 9, 5], [3, 11, 3], [13, 11, 3]], [[7, 9, 6], [12, 11, 4], [2, 12, 3]], [[9, 9, 5], [4, 11, 4], [14, 12, 2]]][vt(o)]); cacho(ctx, px + 4, py + 7, 3);
    } });
  I.objeto('orvalho-arvore-velha', { w: 2, h: 1, solido: true, alto: true, topo: 56,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14); ret(ctx, px + 22, py + 12, 12, 2, 'rgba(30,60,40,0.2)'); raizes(ctx, px, py, 5, 22);
      ret(ctx, px + 8, py - 18, 16, 33, K); ret(ctx, px + 9, py - 18, 14, 32, TR[1]); ret(ctx, px + 9, py - 18, 4, 32, TR[2]); ret(ctx, px + 20, py - 18, 3, 32, TR[0]);
      ret(ctx, px + 9, py - 2, 5, 12, MUSGO); ret(ctx, px + 9, py - 2, 1, 12, '#a8cf80'); ret(ctx, px + 13, py + 5, 3, 6, MUSGO);
      ret(ctx, px + 15, py - 8, 3, 4, K); ret(ctx, px + 21, py - 8, 2, 4, K); ret(ctx, px + 16, py - 8, 1, 1, '#ffffff'); ret(ctx, px + 21, py - 8, 1, 1, '#ffffff'); ret(ctx, px + 17, py - 3, 4, 1, K);   // carinha
      linha(ctx, px + 9, py + 2, px + 14, py + 8, '#f4fdff'); linha(ctx, px + 9, py + 8, px + 14, py + 8, '#f4fdff'); linha(ctx, px + 11, py + 4, px + 11, py + 8, '#f4fdff'); perola(ctx, px + 13, py + 7);   // a teia no tronco
      folhagem(ctx, px, py, [[16, -32, 13], [5, -22, 9], [27, -22, 9], [16, -20, 11], [9, -38, 6], [24, -38, 6]]);
      pendurada(ctx, px + 4, py - 11, 3); pendurada(ctx, px + 12, py - 8, 1); pendurada(ctx, px + 28, py - 11, 2); perola(ctx, px + 14, py - 34);
    } });

  /* ---------- pequenos sólidos: pedra com musgo e toco com cogumelos ---------- */
  I.objeto('orvalho-pedra', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 10, 7, 5, K); elipse(ctx, px + 8, py + 10, 6, 4, '#a8b4a0'); elipse(ctx, px + 7, py + 9, 4, 2, '#d0d8c8');
      ret(ctx, px + 3, py + 8, 5, 2, MUSGO); ret(ctx, px + 3, py + 8, 2, 1, '#a8cf80'); ret(ctx, px + 4, py + 13, 8, 1, '#bfeaff'); ret(ctx, px + 10, py + 8, 1, 1, '#ffffff');
    } });
  I.objeto('orvalho-toco', { w: 1, h: 1, solido: true, topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 3, py + 6, 10, 9, K); ret(ctx, px + 4, py + 7, 8, 7, TR[1]); ret(ctx, px + 4, py + 7, 2, 7, TR[2]); ret(ctx, px + 10, py + 7, 2, 7, TR[0]);
      elipse(ctx, px + 8, py + 6, 5, 2, K); elipse(ctx, px + 8, py + 6, 4, 1, '#d8bc90'); ret(ctx, px + 7, py + 6, 2, 1, TR[1]);
      ret(ctx, px + 11, py + 10, 4, 3, K); ret(ctx, px + 11, py + 10, 3, 2, '#ffb0c8'); ret(ctx, px + 11, py + 10, 1, 1, '#ffd9ea'); ret(ctx, px + 12, py + 12, 1, 2, '#fff8ee');
      perola(ctx, px + 5, py + 3);
    } });

  /* ---------- o enfeite do chão (plano, não sólido): samambaia, flores, folha ---------- */
  I.objeto('orvalho-samambaia', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      fronde(ctx, px + 8, py + 14, [[-6, -8], [-3, -12], [1, -13], [5, -11], [7, -6]]); ret(ctx, px + 6, py + 12, 4, 3, V[1]); ret(ctx, px + 6, py + 12, 1, 3, V[2]); cacho(ctx, px + 9, py + 3, 3);
    } });
  I.objeto('orvalho-flor', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 6, py + 8, 2, 7, K); ret(ctx, px + 7, py + 8, 1, 7, V[1]); ret(ctx, px + 7, py + 4, 4, 4, K); ret(ctx, px + 8, py + 5, 2, 2, V[1]);   // o caule curva para a direita
      ret(ctx, px + 9, py + 3, 4, 2, K); ret(ctx, px + 8, py + 5, 6, 5, K); ret(ctx, px + 7, py + 9, 8, 2, K);   // o sino da campânula
      ret(ctx, px + 10, py + 4, 2, 1, '#cbb6f0'); ret(ctx, px + 9, py + 5, 4, 4, '#cbb6f0'); ret(ctx, px + 8, py + 9, 6, 1, '#cbb6f0'); ret(ctx, px + 9, py + 5, 1, 4, '#e8dcff'); ret(ctx, px + 12, py + 6, 1, 3, '#a88ce0');
      gota(ctx, px + 11, py + 13, 1); ret(ctx, px + 3, py + 11, 3, 1, V[2]); ret(ctx, px + 2, py + 10, 2, 1, V[2]);
    } });
  I.objeto('orvalho-florzinha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var q = (o && o.var && o.var.n) || 0, c = ['#ffffff', '#ffd9ea', '#cbb6f0'][q % 3], c2 = ['#fff8ee', '#ffb0c8', '#a88ce0'][q % 3];
      ret(ctx, px + 7, py + 9, 2, 6, CG); ret(ctx, px + 7, py + 9, 1, 6, V[1]); ret(ctx, px + 5, py + 11, 2, 1, V[2]); ret(ctx, px + 9, py + 13, 2, 1, V[2]);
      ret(ctx, px + 5, py + 3, 6, 6, CG); ret(ctx, px + 4, py + 4, 8, 4, CG); ret(ctx, px + 6, py + 2, 4, 8, CG);   // contorno em verde escuro da paleta (não K)
      ret(ctx, px + 6, py + 4, 4, 4, c); ret(ctx, px + 5, py + 5, 6, 2, c); ret(ctx, px + 7, py + 3, 2, 6, c); ret(ctx, px + 5, py + 5, 2, 1, '#ffffff'); ret(ctx, px + 9, py + 7, 2, 1, c2);
      ret(ctx, px + 7, py + 5, 2, 2, '#ffd34d'); cacho(ctx, px + 11, py + 1, 3);
    } });
  I.objeto('orvalho-folha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 13, 11, 1, 'rgba(30,60,40,0.35)'); ret(ctx, px + 1, py + 11, 4, 2, K); ret(ctx, px + 1, py + 11, 4, 1, '#8cbc74');
      elipse(ctx, px + 8, py + 9, 7, 4, K); elipse(ctx, px + 8, py + 9, 6, 3, V[2]); elipse(ctx, px + 7, py + 8, 4, 2, V[3]);
      ret(ctx, px + 3, py + 9, 11, 1, V[1]); ret(ctx, px + 12, py + 7, 2, 1, V[1]); ret(ctx, px + 10, py + 11, 3, 1, V[1]); ret(ctx, px + 4, py + 7, 2, 1, QUENTE);
      gota(ctx, px + 10, py + 7, 2);
    } });

  /* ---------- a poça rasa, a teia, o pólen e o retalho de sol (planos, com um pouco de vida) ---------- */
  I.objeto('orvalho-poca', { w: 1, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 7, 4, '#6f9a8a'); elipse(ctx, px + 8, py + 9, 6, 3, '#bfeaff'); elipse(ctx, px + 8, py + 10, 5, 2, '#8fd0e0'); elipse(ctx, px + 7, py + 8, 3, 1, '#d8f4ff');
      ret(ctx, px + 13, py + 7, 2, 1, '#6f9a8a'); ret(ctx, px + 2, py + 11, 2, 1, '#6f9a8a'); ret(ctx, px + 5, py + 13, 3, 1, '#6f9a8a');
      ret(ctx, px + 4, py + 8, 3, 1, '#ffffff'); ret(ctx, px + 10, py + 10, 2, 1, '#eefcff');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 600) % 2 : 0;
      if (f) ret(ctx, px + 5, py + 8, 6, 1, '#ffffff'); else ret(ctx, px + 6, py + 9, 4, 1, '#ffffff');
    } });
  I.objeto('orvalho-teia', { w: 2, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 2, 12, K); ret(ctx, px + 1, py + 2, 1, 12, TR[2]); ret(ctx, px + 29, py + 4, 2, 10, K); ret(ctx, px + 29, py + 4, 1, 10, TR[2]);
      var cx = px + 16, cy = py + 8, W = '#f4fdff';
      [[3, 3], [3, 13], [29, 5], [29, 13], [16, 1], [16, 15]].forEach(function (p) { linha(ctx, cx + 1, cy + 1, px + p[0], py + p[1], 'rgba(40,70,80,0.6)'); linha(ctx, cx, cy, px + p[0], py + p[1], W); });
      [[5, 3], [9, 5]].forEach(function (r) { linha(ctx, cx - r[0], cy, cx, cy - r[1], W); linha(ctx, cx, cy - r[1], cx + r[0], cy, W); linha(ctx, cx + r[0], cy, cx, cy + r[1], W); linha(ctx, cx, cy + r[1], cx - r[0], cy, W); });
      perola(ctx, cx - 9, cy - 1); perola(ctx, cx + 4, cy - 5); perola(ctx, cx - 2, cy + 5); perola(ctx, cx + 9, cy);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 500) % 3 : 0;
      if (f < 2) { ret(ctx, px + 7 + f * 14, py + 6 - f * 5, 1, 1, '#ffffff'); ret(ctx, px + 6 + f * 14, py + 6 - f * 5, 3, 1, 'rgba(255,255,255,0.6)'); }
    } });
  I.objeto('orvalho-polen', { w: 1, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 10, 1, 1, '#fff4cc'); ret(ctx, px + 9, py + 5, 1, 1, QUENTE); ret(ctx, px + 12, py + 11, 1, 1, '#fff4cc'); ret(ctx, px + 6, py + 3, 1, 1, '#ffffff');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 260) % 8 : 0;
      ret(ctx, px + 2 + f, py + 12 - f, 1, 1, '#ffffff'); ret(ctx, px + 12 - f, py + 8 - (f >> 1), 1, 1, QUENTE);
    } });
  I.objeto('orvalho-raio', { w: 2, h: 2, solido: false, plano: true, semSombra: true,   // poça de sol da manhã: elipse de pixel pêssego/dourada
    desenhar: function (ctx, px, py, o) {
      luz(ctx, px + 16, py + 16, 14, 11, '255,217,176'); luz(ctx, px + 14, py + 14, 7, 5, '255,233,168');
      ret(ctx, px + 10, py + 11, 1, 1, '#ffffff'); ret(ctx, px + 20, py + 18, 1, 1, '#fff4cc');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 400) % 6 : 0;
      ret(ctx, px + 10 + f, py + 6 + f * 3, 1, 1, '#ffffff'); ret(ctx, px + 18 - f, py + 26 - f * 3, 1, 1, QUENTE);
    } });

  /* ---------- as assinaturas: moitas (samambaias + flores + gotas num objeto só, planas) e o poço de orvalho ---------- */
  function moita(ctx, px, py, n, nf) {
    var c = FLORES[n % 3], i;
    fronde(ctx, px + 7, py + 14, [[-5, -7], [-1, -11], [4, -8]]); fronde(ctx, px + nf * 16 - 8, py + 14, [[-4, -8], [1, -12], [5, -6]]);
    for (i = 0; i < nf + 1; i++) mini(ctx, px + 10 + i * 7, py + 8 + ((i * 5 + n) % 3) * 2, FLORES[(n + i) % 3]);
    ret(ctx, px + 8, py + 14, nf * 16 - 16, 1, V[1]); cacho(ctx, px + nf * 8 - 2, py + 10, 4); ret(ctx, px + 3, py + 12, 2, 1, c);
  }
  I.objeto('orvalho-moita', { w: 2, h: 1, solido: false, plano: true, desenhar: function (ctx, px, py, o) { moita(ctx, px, py, (o && o.var && o.var.n) || 0, 2); } });
  I.objeto('orvalho-moita-g', { w: 3, h: 1, solido: false, plano: true, desenhar: function (ctx, px, py, o) { moita(ctx, px, py, (o && o.var && o.var.n) || 0, 3); fronde(ctx, px + 24, py + 14, [[-3, -9], [2, -10]]); } });
  I.objeto('orvalho-poco', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 19, 16, 9, '#6f9a8a'); elipse(ctx, px + 24, py + 19, 15, 8, '#bfeaff'); elipse(ctx, px + 25, py + 21, 12, 5, '#8fd0e0');
      ret(ctx, px + 13, py + 16, 9, 1, '#ffffff'); ret(ctx, px + 27, py + 18, 6, 1, '#ffffff'); ret(ctx, px + 18, py + 22, 5, 1, '#eefcff');
      [[5, 19], [9, 10], [18, 6], [31, 5], [41, 10], [45, 20], [38, 28], [24, 30], [12, 28]].forEach(function (s, i) {   // as pedras musgosas em volta
        elipse(ctx, px + s[0], py + s[1], 5, 3, K); elipse(ctx, px + s[0], py + s[1], 4, 2, '#a8b4a0'); ret(ctx, px + s[0] - 3, py + s[1] - 2, 3, 1, '#d0d8c8'); if (i % 2 === 0) ret(ctx, px + s[0] - 1, py + s[1], 4, 1, MUSGO);
      });
      fronde(ctx, px + 4, py + 15, [[-1, -9], [3, -8]]); fronde(ctx, px + 44, py + 16, [[-2, -9], [2, -7]]); cacho(ctx, px + 22, py + 16, 4);
    },
    anim: function (ctx, px, py, t) { var f = tempo(t) ? Math.floor(tempo(t) / 600) % 2 : 0; ret(ctx, px + 16 + f * 4, py + 20, 6, 1, '#ffffff'); }
  });

  /* ---------- os interativos: a placa, a lanterna de fadas e o cogumelo do orvalho ---------- */
  I.objeto('orvalho-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, TR[1]); ret(ctx, px + 7, py + 7, 1, 7, TR[2]);
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#e0b872'); ret(ctx, px + 1, py - 3, 14, 2, '#f8dca0'); ret(ctx, px + 1, py + 5, 14, 2, '#b08850');
      ret(ctx, px + 1, py - 3, 4, 2, MUSGO); ret(ctx, px + 1, py - 3, 2, 1, '#a8cf80');
      ret(ctx, px + 8, py - 1, 4, 1, V[0]); ret(ctx, px + 6, py, 6, 2, V[0]); ret(ctx, px + 7, py - 1, 3, 1, V[1]); ret(ctx, px + 4, py + 2, 3, 1, V[0]);   // a folhinha pintada
      gota(ctx, px + 5, py + 1, 1); perola(ctx, px + 11, py + 5);
    } });
  I.objeto('orvalho-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5); halo(ctx, px + 12, py - 12, 14); luz(ctx, px + 8, py + 12, 15, 6, '255,226,122');
      ret(ctx, px + 7, py - 18, 3, 33, K); ret(ctx, px + 8, py - 18, 1, 32, '#b09472'); ret(ctx, px + 9, py - 18, 1, 32, '#6a5240');
      ret(ctx, px + 8, py - 22, 7, 2, K); ret(ctx, px + 12, py - 22, 2, 7, K); ret(ctx, px + 10, py - 21, 4, 1, '#b09472');
      ret(ctx, px + 9, py - 14, 8, 10, K); ret(ctx, px + 10, py - 13, 6, 8, '#fff6c8'); ret(ctx, px + 10, py - 9, 6, 4, '#ffd34d'); ret(ctx, px + 11, py - 12, 2, 4, '#ffffff'); ret(ctx, px + 9, py - 15, 8, 2, K);
      ret(ctx, px + 6, py + 12, 7, 4, K); ret(ctx, px + 7, py + 12, 5, 3, '#a8b4a0'); ret(ctx, px + 7, py + 12, 2, 1, MUSGO);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 300) % 4 : 0, o = [[3, -16], [14, -8], [11, -20], [4, -6]][f];
      ret(ctx, px + o[0], py + o[1], 1, 1, '#ffffff'); ret(ctx, px + o[0] - 1, py + o[1], 3, 1, 'rgba(255,243,160,0.7)');
    } });
  I.objeto('orvalho-cogumelo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[4, 14, 3, '#ffb0c8', '#ffd9ea'], [11, 15, 2, '#cbb6f0', '#e8dcff'], [8, 11, 4, '#ff9ec0', '#ffd9ea']].forEach(function (c) {
        ret(ctx, px + c[0] - 1, py + c[1] - 4, 3, 5, K); ret(ctx, px + c[0], py + c[1] - 4, 1, 4, '#fff8ee');
        elipse(ctx, px + c[0], py + c[1] - 5, c[2] + 1, Math.max(2, c[2] - 1), K); elipse(ctx, px + c[0], py + c[1] - 5, c[2], Math.max(1, c[2] - 2), c[3]);
        ret(ctx, px + c[0] - c[2] + 1, py + c[1] - 6 - (c[2] > 3 ? 1 : 0), 2, 1, c[4]); ret(ctx, px + c[0] + 1, py + c[1] - 5, 1, 1, '#ffffff');
      });
      perola(ctx, px + 7, py + 4);
    } });
})();
