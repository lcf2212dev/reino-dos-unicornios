/* Laboratório de Química: o desenho das lâminas do microscópio em pixel art (docs/contratos/quimica.md §2).
   Reino.QuimicaLaminas.imagem(id, aumento, bloco) → canvas TAM×TAM com o campo inteiro (a máscara redonda é da
   tela, ui/quimica-microscopio.js). bloco 1 = nítida; 4, 5, 8… = fora de foco em mosaico (média de cada bloco,
   ampliada por inteiro; nunca blur). Fiel à realidade e sem bicho: sal (cubinhos), açúcar (prismas), folha
   (células e estômatos), cebola (tijolinhos com núcleo), pólen (grãos com espinhos), areia (grãos variados),
   algodão (fitas torcidas), neve (seis pontas). Cache por lâmina/aumento; nada de canvas no carregamento;
   sorteio fixo pela chave (Reino.Desenho.rng), nunca Math.random. */
(function () {
  var R = window.Reino;
  var TAM = 160, K = '#3a2446', PI = Math.PI;
  var cache = {}, mosaicos = { chave: null, blocos: {} }, rasc = null;

  /* ---------- ferramentas de pixel ---------- */
  function fnv(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // ler: o canvas é lido de volta (getImageData) muitas vezes: o rascunho e as lâminas nítidas (fonte do mosaico)
  function tela(ler) { var c = document.createElement('canvas'); c.width = TAM; c.height = TAM; c.getContext('2d', { willReadFrequently: !!ler }).imageSmoothingEnabled = false; return c; }
  function ent(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function entre(rnd, a, b) { return a + rnd() * (b - a); }
  function ret(x, a, b, w, h, cor) { x.fillStyle = cor; x.fillRect(Math.round(a), Math.round(b), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
  function circ(x, cx, cy, r, cor) { R.Desenho.circulo(x, Math.round(cx), Math.round(cy), Math.max(0, Math.round(r)), cor); }
  function elip(x, cx, cy, rx, ry, cor) { R.Desenho.elipse(x, Math.round(cx), Math.round(cy), Math.max(1, Math.round(rx)), Math.max(1, Math.round(ry)), cor); }
  // polígono cheio, linha a linha pelo centro dos pixels (sem serrilhado liso)
  function poli(x, pts, cor) {
    x.fillStyle = cor;
    var y0 = Infinity, y1 = -Infinity;
    pts.forEach(function (p) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    for (var y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      var yc = y + 0.5, xs = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort(function (m, n) { return m - n; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var xa = Math.round(xs[k]), xb = Math.round(xs[k + 1]);
        if (xb > xa) x.fillRect(xa, y, xb - xa, 1);
      }
    }
  }
  // linha de quadradinhos g×g
  function linha(x, x0, y0, x1, y1, cor, g) {
    g = g || 1; x.fillStyle = cor;
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      x.fillRect(Math.floor(x0 + (x1 - x0) * t - (g - 1) / 2), Math.floor(y0 + (y1 - y0) * t - (g - 1) / 2), g, g);
    }
  }
  // pontos locais girados e levados para (cx, cy)
  function pos(cx, cy, ang, pts) { var c = Math.cos(ang), s = Math.sin(ang); return pts.map(function (p) { return [cx + p[0] * c - p[1] * s, cy + p[0] * s + p[1] * c]; }); }
  function hexagono(cx, cy, r, ang) { var p = []; for (var i = 0; i < 6; i++) p.push([Math.cos(ang + i * PI / 3) * r, Math.sin(ang + i * PI / 3) * r]); return pos(cx, cy, 0, p); }
  // um objeto sozinho no rascunho, com o contorno #3a2446 de 1 px por fora (4 vizinhos), e depois no campo
  function objeto(x, caixa, fn) {
    if (!rasc) rasc = tela(true);
    var r = rasc.getContext('2d');
    r.clearRect(0, 0, TAM, TAM);
    fn(r);
    var x0 = Math.max(0, Math.floor(caixa[0]) - 2), y0 = Math.max(0, Math.floor(caixa[1]) - 2);
    var x1 = Math.min(TAM, Math.ceil(caixa[2]) + 3), y1 = Math.min(TAM, Math.ceil(caixa[3]) + 3);
    var w = x1 - x0, h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    var img = r.getImageData(x0, y0, w, h), d = img.data, a = new Uint8Array(w * h), i;
    for (i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      i = yy * w + xx;
      if (a[i] || !((xx > 0 && a[i - 1]) || (xx < w - 1 && a[i + 1]) || (yy > 0 && a[i - w]) || (yy < h - 1 && a[i + w]))) continue;
      d[i * 4] = 58; d[i * 4 + 1] = 36; d[i * 4 + 2] = 70; d[i * 4 + 3] = 255;
    }
    r.putImageData(img, x0, y0);
    x.drawImage(rasc, x0, y0, w, h, x0, y0, w, h);
  }
  // fundo da luz do microscópio, com poeirinha
  function fundo(x, rnd, cor, poeira) {
    ret(x, 0, 0, TAM, TAM, cor);
    for (var i = 0; i < 36; i++) ret(x, ent(rnd, 0, TAM - 1), ent(rnd, 0, TAM - 1), 1, 1, poeira);
  }
  // n lugares de tamanho t0..t1 (diâmetro), pouco encavalados; de cima para baixo (o de baixo fica na frente)
  function espalhar(rnd, n, t0, t1, junto) {
    var l = [];
    for (var i = 0; i < n; i++) {
      var t = ent(rnd, t0, t1), o = null;
      for (var k = 0; k < 40 && !o; k++) {
        var c = { x: entre(rnd, 8, TAM - 8), y: entre(rnd, 8, TAM - 8), t: t };
        var ok = l.every(function (q) { return Math.hypot(q.x - c.x, q.y - c.y) > (q.t + c.t) / 2 * (junto || 0.85); });
        if (ok || k === 39) o = c;
      }
      l.push(o);
    }
    return l.sort(function (a, b) { return a.y - b.y; });
  }

  /* ---------- sal: cubinhos transparentes (os grandes com os degraus de "funil") ---------- */
  function cubo(x, px, py, s, p, grande) {
    px = Math.round(px); py = Math.round(py);
    objeto(x, [px, py - p, px + s + p, py + s], function (r) {
      if (p > 0) {
        poli(r, [[px, py], [px + p, py - p], [px + s + p, py - p], [px + s, py]], '#d8eaf5');
        poli(r, [[px + s, py], [px + s + p, py - p], [px + s + p, py + s - p], [px + s, py + s]], '#aecbe0');
        linha(r, px + s, py, px + s + p - 1, py - p + 1, '#8fb1cc');
      }
      ret(r, px, py, s, s, '#eef7fc');
      if (s >= 8) { ret(r, px, py, s, 1, '#ffffff'); ret(r, px, py, 1, s, '#ffffff'); ret(r, px + s - 1, py, 1, s, '#bcd4e6'); ret(r, px, py + s - 1, s, 1, '#bcd4e6'); }
      if (grande) for (var k = 1; k <= 3; k++) {
        var m = Math.round(s * k / 8), q = s - 2 * m;
        ret(r, px + m, py + m, q, q, k % 2 ? '#e0eef7' : '#f6fbfe');
        ret(r, px + m, py + m, q, 1, '#b4cee2'); ret(r, px + m, py + m, 1, q, '#b4cee2');
        ret(r, px + m, py + m + q - 1, q, 1, '#ffffff'); ret(r, px + m + q - 1, py + m, 1, q, '#ffffff');
      }
      if (s >= 16) R.Desenho.brilho(r, px + 3, py + 3, '#ffffff');
    });
  }
  function sal(x, a, rnd) {
    fundo(x, rnd, '#f1ede4', '#e0d9c9');
    var c = a === 10 ? [38, 4, 8] : a === 40 ? [8, 16, 28] : [3, 46, 62];
    espalhar(rnd, c[0], c[1], c[2]).forEach(function (o) {
      var p = a === 10 && rnd() < 0.35 ? 0 : Math.round(o.t * entre(rnd, 0.2, 0.32));
      cubo(x, o.x - o.t / 2, o.y - o.t / 2, o.t, p, o.t >= 22);
    });
  }

  /* ---------- açúcar: cristais prismáticos (faces, pontas chanfradas e degraus) ---------- */
  function prisma(x, cx, cy, L, W, ang, grande, rnd) {
    var l = L / 2, h = W / 2, e1 = W * 0.55, e2 = W * 0.32;
    var P = pos(cx, cy, ang, [[-l, 0], [-l + e1, -h], [l - e2, -h], [l, 0], [l - e2, h], [-l + e1, h]]);
    objeto(x, [cx - l - 2, cy - l - 2, cx + l + 2, cy + l + 2], function (r) {
      poli(r, [P[0], P[1], P[2], P[3]], '#fbf7ec');
      poli(r, [P[0], P[3], P[4], P[5]], '#e6dcc4');
      poli(r, [P[0], P[1], P[5]], '#f3ead6');
      poli(r, [P[3], P[2], P[4]], '#d4c7a8');
      if (W >= 8) { linha(r, P[1][0], P[1][1], P[5][0], P[5][1], '#c8b994'); linha(r, P[2][0], P[2][1], P[4][0], P[4][1], '#c8b994'); linha(r, P[0][0], P[0][1], P[3][0], P[3][1], '#d9ceb2'); }
      if (grande) {
        for (var k = 1; k <= 3; k++) {   // degraus de crescimento na face de cima
          var q = pos(cx, cy, ang, [[-l + e1 + k * 6, -h * (1 - k * 0.22)], [l - e2 - k * 5, -h * (1 - k * 0.22)]]);
          linha(r, q[0][0], q[0][1], q[1][0], q[1][1], '#e9dfc6');
        }
        var b = pos(cx, cy, ang, [[-l * 0.3, -h * 0.55], [l * 0.25, h * 0.4]]);
        R.Desenho.brilho(r, Math.round(b[0][0]), Math.round(b[0][1]), '#ffffff'); R.Desenho.brilho(r, Math.round(b[1][0]), Math.round(b[1][1]), '#ffffff');
      } else if (W >= 8) { var g = pos(cx, cy, ang, [[-l * 0.2, -h * 0.5]]); ret(r, g[0][0], g[0][1], 2, 1, '#ffffff'); }
    });
  }
  function acucar(x, a, rnd) {
    fundo(x, rnd, '#f2eee4', '#e2dbca');
    var c = a === 10 ? [30, 9, 15, 0.55] : a === 40 ? [7, 30, 46, 0.5] : [2, 96, 124, 0.45];
    espalhar(rnd, c[0], c[1], c[2], 0.75).forEach(function (o) {
      prisma(x, o.x, o.y, o.t, Math.round(o.t * entre(rnd, c[3], c[3] + 0.15)), entre(rnd, 0, PI), a === 100, rnd);
    });
  }

  /* ---------- folha: células verdes onduladas (a pele da folha) com estômatos ---------- */
  function estomato(x, cx, cy, rx, ry, a, rnd) {
    var deitado = rnd() < 0.4, ex = deitado ? ry : rx, ey = deitado ? rx : ry;
    objeto(x, [cx - ex - 1, cy - ey - 1, cx + ex + 1, cy + ey + 1], function (r) {
      elip(r, cx, cy, ex, ey, '#6fae44');
      elip(r, cx - (a > 10 ? 1 : 0), cy - (a > 10 ? 1 : 0), ex - 1, ey - 1, '#a2d672');
      if (a > 10) elip(r, cx, cy, ex * 0.36, ey * 0.72, '#5e9a3a');   // a parede grossa em volta da boquinha
      elip(r, cx, cy, deitado ? ex * 0.62 : Math.max(1, ex * 0.18), deitado ? Math.max(1, ey * 0.18) : ey * 0.62, '#2f4d2a');
      if (a > 10) for (var i = 0; i < (a === 100 ? 14 : 6); i++) {   // cloroplastos nas duas células-guarda
        var lado = i % 2 ? 1 : -1, t = entre(rnd, -0.6, 0.6), rr = a === 100 ? 2 : 1;
        var px = deitado ? cx + t * ex : cx + lado * ex * 0.62, py = deitado ? cy + lado * ey * 0.62 : cy + t * ey;
        circ(r, px, py, rr, '#4f8a34'); ret(r, px - rr + 1, py - rr + 1, 1, 1, '#8fcf6a');
      }
    });
  }
  function folha(x, a, rnd) {
    var cel = a === 10 ? 13 : a === 40 ? 32 : 76, parede = a === 10 ? 0.8 : a === 40 ? 1.3 : 2.4;
    var n = Math.ceil(TAM / cel) + 3, sem = [];
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) sem.push({ x: (i - 1 + 0.2 + rnd() * 0.6) * cel, y: (j - 1 + 0.2 + rnd() * 0.6) * cel, t: rnd() });
    var img = x.createImageData(TAM, TAM), d = img.data, A = cel * 0.09, f = 2 * PI / (cel * 0.55), fase = rnd() * 6;
    var CORES = [[195, 229, 160], [183, 222, 146], [203, 233, 170]], BORDA = [156, 203, 106], PAREDE = [61, 122, 52];
    for (var py = 0; py < TAM; py++) for (var px = 0; px < TAM; px++) {
      var wx = px + A * Math.sin(py * f + fase), wy = py + A * Math.sin(px * f + fase * 1.7);
      var gi = Math.floor(wx / cel) + 1, gj = Math.floor(wy / cel) + 1, d1 = 1e9, d2 = 1e9, s1 = null, s2 = null;
      for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) {
        var ii = gi + di, jj = gj + dj;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
        var s = sem[jj * n + ii], dd = (s.x - wx) * (s.x - wx) + (s.y - wy) * (s.y - wy);
        if (dd < d1) { d2 = d1; s2 = s1; d1 = dd; s1 = s; } else if (dd < d2) { d2 = dd; s2 = s; }
      }
      var dist = s2 ? (d2 - d1) / (2 * Math.hypot(s1.x - s2.x, s1.y - s2.y)) : 99;
      var cor = dist < parede ? PAREDE : dist < parede + 1.2 ? BORDA : CORES[Math.floor(s1.t * 3)];
      var k = (py * TAM + px) * 4;
      d[k] = cor[0]; d[k + 1] = cor[1]; d[k + 2] = cor[2]; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    if (a > 10) sem.forEach(function (s) {   // uns cloroplastos nas células
      for (var c = 0; c < (a === 100 ? 5 : 2); c++) {
        var rr = a === 100 ? 2 : 1, qx = s.x + entre(rnd, -0.25, 0.25) * cel, qy = s.y + entre(rnd, -0.25, 0.25) * cel;
        circ(x, qx, qy, rr, '#6aa84a'); ret(x, qx - rr + 1, qy - rr + 1, 1, 1, '#9ad876');
      }
    });
    if (a === 100) { estomato(x, 80, 80, 22, 32, a, rnd); return; }
    sem.forEach(function (s) {
      if (s.t > (a === 10 ? 0.2 : 0.3) || s.x < -4 || s.y < -4 || s.x > TAM + 4 || s.y > TAM + 4) return;
      estomato(x, s.x, s.y, cel * 0.24, cel * 0.34, a, rnd);
    });
  }

  /* ---------- casca de cebola: células compridas em tijolinho, cada uma com o núcleo ---------- */
  function cebola(x, a, rnd) {
    var H = a === 10 ? 10 : a === 40 ? 26 : 62, W0 = a === 100 ? H * 2.2 : H * 2.8, p = a === 10 ? 1 : a === 40 ? 2 : 3;
    ret(x, 0, 0, TAM, TAM, '#8e557f');
    for (var y = -ent(rnd, 0, H - 1); y < TAM; y += H) {
      for (var xx = -ent(rnd, 0, Math.round(W0)); xx < TAM;) {
        var w = Math.round(W0 * entre(rnd, 0.75, 1.3));
        celula(x, xx + p, y + p, w - p, H - p, a, rnd);
        xx += w;
      }
    }
  }
  function celula(x, cx, cy, w, h, a, rnd) {
    ret(x, cx, cy, w, h, ['#f3d5e8', '#eecde2', '#f6dcec'][ent(rnd, 0, 2)]);
    ret(x, cx, cy, w, 1, '#fbeaf4'); ret(x, cx, cy + h - 1, w, 1, '#e0b4d0');
    if (a > 10) for (var k = 0; k < w * h / 70; k++) ret(x, cx + ent(rnd, 1, w - 2), cy + ent(rnd, 1, h - 2), 1, 1, '#e3b9d6');
    var nx = cx + w * entre(rnd, 0.25, 0.75), ny = cy + h * entre(rnd, 0.4, 0.6);
    if (a === 10) { ret(x, nx, ny - 1, 2, 2, '#6b3464'); return; }
    var nr = a === 40 ? 4 : 10;
    circ(x, nx, ny, nr + 1, K); circ(x, nx, ny, nr, '#a8639b'); circ(x, nx - 1, ny - 1, nr - 2, '#bd7cb0');
    circ(x, nx + 1, ny + 1, a === 40 ? 1 : 3, '#5a2a57');   // o nucléolo
    if (a === 100) { ret(x, nx - 5, ny - 6, 2, 1, '#e0b0d6'); ret(x, nx + 4, ny - 2, 1, 1, '#8a4f7d'); ret(x, nx - 3, ny + 5, 1, 1, '#8a4f7d'); }
  }

  /* ---------- pólen de flor: grãos amarelos redondos cheios de espinhos ---------- */
  function grao(x, cx, cy, rr, rnd) {
    cx = Math.round(cx); cy = Math.round(cy);
    var n = Math.round(rr * 0.6) + 6, esp = Math.max(1, Math.round(rr * 0.24)), b = Math.max(0.8, rr * 0.13), f = rnd() * 6.28;
    objeto(x, [cx - rr - esp, cy - rr - esp, cx + rr + esp, cy + rr + esp], function (r) {
      for (var i = 0; i < n; i++) {
        var an = f + i * 2 * PI / n, c = Math.cos(an), s = Math.sin(an);
        poli(r, [[cx + c * (rr - 1) - s * b, cy + s * (rr - 1) + c * b], [cx + c * (rr + esp), cy + s * (rr + esp)], [cx + c * (rr - 1) + s * b, cy + s * (rr - 1) - c * b]], '#eeb330');
      }
      circ(r, cx, cy, rr, '#e0a02a');
      circ(r, cx - Math.max(1, rr * 0.1), cy - Math.max(1, rr * 0.1), rr - Math.max(1, rr * 0.12), '#ffd34d');
      circ(r, cx - rr * 0.38, cy - rr * 0.38, rr * 0.28, '#ffe98a');
      if (rr >= 8) for (var k = 0; k < rr * 1.5; k++) {   // furinhos da casca
        var ra = rr * 0.8 * Math.sqrt(rnd()), aa = rnd() * 6.28;
        ret(r, cx + Math.cos(aa) * ra, cy + Math.sin(aa) * ra, 1, 1, '#e8b43a');
      }
      if (rr >= 30) for (var m = 0; m < 3; m++) {   // as aberturas por onde o grão brota
        var am = f + m * 2 * PI / 3 + 0.4;
        circ(r, cx + Math.cos(am) * rr * 0.5, cy + Math.sin(am) * rr * 0.5, 4, '#c98a24'); circ(r, cx + Math.cos(am) * rr * 0.5, cy + Math.sin(am) * rr * 0.5, 3, '#f6c55a');
      }
      if (rr >= 8) R.Desenho.brilho(r, Math.round(cx - rr * 0.4), Math.round(cy - rr * 0.45), '#ffffff');
    });
  }
  function polen(x, a, rnd) {
    fundo(x, rnd, '#f2efe6', '#e3ddcd');
    var c = a === 10 ? [22, 8, 11] : a === 40 ? [6, 28, 36] : [2, 96, 110];
    espalhar(rnd, c[0], c[1], c[2], a === 100 ? 0.55 : 0.9).forEach(function (o) { grao(x, o.x, o.y, Math.round(o.t / 2.5), rnd); });
  }

  /* ---------- areia: grãos de cores e formas variadas (quartzo, feldspato, minério, olivina, concha) ---------- */
  var MINERAIS = [[0.4, '#f1e7d0', '#cdb98f', '#fffaf0'], [0.55, '#f0b49c', '#c9826a', '#ffd9c8'], [0.67, '#5a5064', '#2e2836', '#9a90a8'],
    [0.75, '#b8d27a', '#86a84a', '#e0efb0'], [0.85, '#fff8ee', '#d9ccb6', '#ffffff'], [1, '#e0a458', '#ad7132', '#f8cd90']];
  function pedrinha(x, cx, cy, rr, a, rnd) {
    var sorte = rnd(), m = MINERAIS.filter(function (q) { return sorte <= q[0]; })[0];
    var n = ent(rnd, 7, 11), a0 = rnd() * 6.28, alongar = entre(rnd, 0.62, 1), gira = rnd() * PI, pts = [];
    for (var i = 0; i < n; i++) { var an = a0 + i * 2 * PI / n + entre(rnd, -0.2, 0.2), k = entre(rnd, 0.75, 1.05); pts.push([Math.cos(an) * rr * k, Math.sin(an) * rr * k * alongar]); }
    var P = pos(cx, cy, gira, pts), sh = rr * 0.09;
    objeto(x, [cx - rr - 1, cy - rr - 1, cx + rr + 1, cy + rr + 1], function (r) {
      poli(r, P, m[2]);
      poli(r, P.map(function (p) { return [cx + (p[0] - cx) * 0.86 - sh, cy + (p[1] - cy) * 0.86 - sh]; }), m[1]);
      poli(r, P.map(function (p) { return [cx + (p[0] - cx) * 0.34 - rr * 0.3, cy + (p[1] - cy) * 0.34 - rr * 0.3]; }), m[3]);
      if (a > 10) for (var t = 0; t < (a === 100 ? 3 : 1); t++) {   // rachadurinhas
        var x0 = cx + entre(rnd, -0.4, 0.4) * rr, y0 = cy + entre(rnd, -0.4, 0.4) * rr;
        linha(r, x0, y0, x0 + entre(rnd, -0.3, 0.3) * rr, y0 + entre(rnd, -0.3, 0.3) * rr, m[2]);
      }
      if (a === 100) for (var p = 0; p < rr; p++) { var ra = rr * 0.6 * Math.sqrt(rnd()), aa = rnd() * 6.28; ret(r, cx + Math.cos(aa) * ra, cy + Math.sin(aa) * ra, 1, 1, m[2]); }
      if (rr >= 10) R.Desenho.brilho(r, Math.round(cx - rr * 0.35), Math.round(cy - rr * 0.35), '#ffffff');
    });
  }
  function areia(x, a, rnd) {
    fundo(x, rnd, '#eee8dc', '#dcd3c0');
    var c = a === 10 ? [48, 8, 15, 0.8] : a === 40 ? [12, 22, 42, 0.8] : [4, 72, 104, 0.7];
    espalhar(rnd, c[0], c[1], c[2], c[3]).forEach(function (o) { pedrinha(x, o.x, o.y, o.t / 2, a, rnd); });
  }

  /* ---------- fio de algodão: fibras achatadas e torcidas como fitas ---------- */
  function fibra(x, x0, y0, ang, W, rnd) {
    var c = Math.cos(ang), s = Math.sin(ang), amp = entre(rnd, 2, 6) * (W / 12 + 0.6), fw = entre(rnd, 0.012, 0.024);
    var ft = 2 * PI / (W * entre(rnd, 7, 10)), f1 = rnd() * 6, f2 = rnd() * 6;
    objeto(x, [0, 0, TAM, TAM], function (r) {
      for (var t = -140; t <= 140; t += 0.5) {
        var off = amp * Math.sin(t * fw + f1), px = x0 + c * t - s * off, py = y0 + s * t + c * off;
        if (px < -W || py < -W || px > TAM + W || py > TAM + W) continue;
        var tw = Math.cos(t * ft + f2), hw = W / 2 * (0.22 + 0.78 * Math.pow(Math.abs(tw), 0.35));   // fita larga que afina só na torção
        for (var u = -hw; u <= hw; u += 0.5) {
          var q = u / hw, cor;
          if (Math.abs(tw) < 0.12) cor = '#d6cdb9';   // a dobra da torção
          else if (W >= 10 && Math.abs(q) < 0.14 && Math.abs(tw) > 0.55) cor = '#ddd5c3';   // o canal do meio
          else cor = q * tw > 0.4 ? '#e7e0cf' : q * tw < -0.6 ? '#ffffff' : '#f7f3e8';
          r.fillStyle = cor; r.fillRect(Math.round(px - s * u), Math.round(py + c * u), 1, 1);
        }
      }
    });
  }
  function algodao(x, a, rnd) {
    fundo(x, rnd, '#e4ebf0', '#d2dbe2');
    var c = a === 10 ? [9, 4, 5] : a === 40 ? [4, 13, 16] : [2, 30, 46], base = rnd() * PI;
    for (var i = 0; i < c[0]; i++) {
      var ult = i === c[0] - 1, W = a === 100 ? (ult ? 46 : 30) : ent(rnd, c[1], c[2]);
      var cx = a === 100 && ult ? 80 : entre(rnd, 30, 130), cy = a === 100 && ult ? 80 : entre(rnd, 30, 130);
      fibra(x, cx, cy, base + (i % 3 === 2 ? entre(rnd, 0.9, 1.4) : entre(rnd, -0.35, 0.35)), W, rnd);
    }
  }

  /* ---------- floco de neve: cristal de gelo de seis pontas ---------- */
  // no 10× o floco é pequeno: braços de 2 px com contorno e raminhos de 1 px sem contorno (senão o roxo cobre o branco)
  function floco(x, cx, cy, Rr, g, a, rnd) {
    var rot = -PI / 2, simples = a === 10 && rnd() < 0.3, fin = Math.max(1, g - 2), miudo = a === 10;
    function raminhos(r, larg) {
      for (var k = 0; k < 6; k++) {
        var an = rot + k * PI / 3, c = Math.cos(an), s = Math.sin(an);
        (miudo ? [0.45, 0.72] : [0.32, 0.52, 0.72]).forEach(function (p, i) {
          var bl = miudo ? Rr * (0.34 - i * 0.12) : Rr * (0.34 - i * 0.09), bx = cx + c * Rr * p, by = cy + s * Rr * p;
          [-1, 1].forEach(function (lado) { var a2 = an + lado * PI / 3; linha(r, bx, by, bx + Math.cos(a2) * bl, by + Math.sin(a2) * bl, '#ffffff', larg); });
        });
      }
    }
    objeto(x, [cx - Rr - g, cy - Rr - g, cx + Rr + g, cy + Rr + g], function (r) {
      if (simples) { poli(r, hexagono(cx, cy, Rr * 0.6, rot), '#f4faff'); poli(r, hexagono(cx, cy, Rr * 0.3, rot), '#dcecfa'); return; }
      for (var k = 0; k < 6; k++) {
        var an = rot + k * PI / 3, c = Math.cos(an), s = Math.sin(an);
        linha(r, cx, cy, cx + c * Rr, cy + s * Rr, '#ffffff', g);
        if (g >= 3) linha(r, cx + c * Rr * 0.2, cy + s * Rr * 0.2, cx + c * Rr, cy + s * Rr, '#c4dcf2', 1);   // a nervura do braço
      }
      if (!miudo) raminhos(r, fin);
      poli(r, hexagono(cx, cy, Rr * (miudo ? 0.28 : 0.2), rot), '#f4faff');
      if (miudo) { poli(r, hexagono(cx, cy, Rr * 0.14, rot), '#c4dcf2'); return; }
      if (g >= 3) [0.2, 0.14, 0.08].forEach(function (q, i) {   // as bordinhas da placa do meio
        var h = hexagono(cx, cy, Rr * q, rot);
        for (var j = 0; j < 6; j++) linha(r, h[j][0], h[j][1], h[(j + 1) % 6][0], h[(j + 1) % 6][1], i % 2 ? '#dcecfa' : '#b4d2ee');
      });
      if (a === 100) for (var b = 0; b < 10; b++) { var ra = Rr * 0.16 * Math.sqrt(rnd()), aa = rnd() * 6.28; ret(r, cx + Math.cos(aa) * ra, cy + Math.sin(aa) * ra, 2, 2, '#e4f1fc'); }
    });
    if (miudo && !simples) raminhos(x, 1);
  }
  function neve(x, a, rnd) {
    fundo(x, rnd, '#cfe2f3', '#bdd4ea');
    if (a === 40) { floco(x, 80, 80, 70, 3, a, rnd); return; }
    if (a === 100) { floco(x, 80, 80, 200, 7, a, rnd); return; }
    // 10×: flocos espalhados por todo o campo redondo (raio 72 no centro 80), inteiros dentro dele
    var l = [];
    for (var k = 0; k < 600 && l.length < 11; k++) {
      var r = ent(rnd, 10, 14), an = rnd() * 2 * PI, d = Math.sqrt(rnd()) * (66 - r);
      var o = { x: Math.round(80 + Math.cos(an) * d), y: Math.round(80 + Math.sin(an) * d), r: r };
      if (l.every(function (q) { return Math.hypot(q.x - o.x, q.y - o.y) > q.r + o.r + 4; })) l.push(o);
    }
    l.forEach(function (o) { floco(x, o.x, o.y, o.r, 2, a, rnd); });
  }

  // lâmina sem desenho (id novo nos dados): bolinhas claras, para nunca ficar vazia
  function reserva(x, a, rnd) {
    fundo(x, rnd, '#f1ede4', '#e0d9c9');
    espalhar(rnd, a === 10 ? 20 : a === 40 ? 6 : 2, a === 10 ? 6 : a === 40 ? 20 : 60, a === 10 ? 10 : a === 40 ? 30 : 80).forEach(function (o) {
      objeto(x, [o.x - o.t / 2, o.y - o.t / 2, o.x + o.t / 2, o.y + o.t / 2], function (r) { circ(r, o.x, o.y, o.t / 2, '#d8d0e8'); circ(r, o.x - 1, o.y - 1, o.t / 2 - 1, '#ece6f6'); });
    });
  }

  var LAMINAS = { sal: sal, acucar: acucar, folha: folha, cebola: cebola, polen: polen, areia: areia, algodao: algodao, neve: neve };

  /* ---------- fora de foco: mosaico (a média de cada bloco b×b) ---------- */
  function mosaico(fonte, b) {
    var c = tela(), x = c.getContext('2d'), d = fonte.getContext('2d').getImageData(0, 0, TAM, TAM).data;
    for (var by = 0; by < TAM; by += b) for (var bx = 0; bx < TAM; bx += b) {
      var s = [0, 0, 0], n = 0;
      for (var y = by; y < Math.min(TAM, by + b); y++) for (var xx = bx; xx < Math.min(TAM, bx + b); xx++) {
        var k = (y * TAM + xx) * 4; s[0] += d[k]; s[1] += d[k + 1]; s[2] += d[k + 2]; n++;
      }
      x.fillStyle = 'rgb(' + Math.round(s[0] / n) + ',' + Math.round(s[1] / n) + ',' + Math.round(s[2] / n) + ')';
      x.fillRect(bx, by, b, b);
    }
    return c;
  }

  /** O campo da lâmina. @param {string} id @param {number} aumento 10 | 40 | 100 @param {number} [bloco] 1 = nítida
      @returns {HTMLCanvasElement} TAM×TAM */
  function imagem(id, aumento, bloco) {
    aumento = [10, 40, 100].indexOf(aumento) >= 0 ? aumento : 10;
    var chave = id + ':' + aumento;
    if (!cache[chave]) {
      var c = tela(true);
      (LAMINAS[id] || reserva)(c.getContext('2d'), aumento, R.Desenho.rng(fnv('lamina:' + chave)));
      cache[chave] = c;
    }
    if (!bloco || bloco <= 1) return cache[chave];
    // só os mosaicos da lâmina e do aumento da vez ficam guardados (memória)
    if (mosaicos.chave !== chave) mosaicos = { chave: chave, blocos: {} };
    return mosaicos.blocos[bloco] || (mosaicos.blocos[bloco] = mosaico(cache[chave], bloco));
  }

  R.QuimicaLaminas = { TAM: TAM, imagem: imagem, desenhos: Object.keys(LAMINAS) };
})();
