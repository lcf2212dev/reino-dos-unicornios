/* As árvores do mapa (arte.md §12): a comum (copa de massas, ≥ 40 px de arte), a de meia altura e a arvoreta de
   1 tile, em 3 formatos, com fruta, moita no pé (na borda) e deslocamento pela sorte do tile. Usa as cores e os
   ajudantes de mundo/mapa-desenho.js (Mapa._interno) e entrega:
     I.varianteArvore(x, y, memo)   o desenho da árvore do tile ({ forma, pal, chave, esp, fruta, moita, dx, dy, w, h });
                                    nunca o mesmo desenho 3 vezes seguidas (memo: as do tile da esquerda e de cima)
     I.desenharArvore(ctx, v)       o sprite dela, em px do sprite (w × h, o chão é a última linha) */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var W = Mapa.W, H = Mapa.H, C = I.C, K = C.contorno, ret = I.ret, sombraChao = I.sombraChao;
  // paletas de copa: [luz, meio, brilho, sombra]; ESPECIES diz o que cada uma é (fruta, flor, pétalas no chão)
  var COPAS = [['#ffc27a', '#f0a04a', '#fff1d0', '#c4703c'], ['#d4ee78', '#a8cc48', '#f4f8c8', '#74a03a'],
    ['#c4e868', '#86b83c', '#eef8b8', '#548a36'], ['#ffd4e6', '#f6a0c4', '#fff6fa', '#d06e9c'],
    ['#fff2ec', '#f8dcd8', '#ffffff', '#e8aca0'], ['#ff9c6a', '#ee5e3a', '#ffe2c4', '#c23e2a'],
    ['#a6dc78', '#5c9e4a', '#dcf4a8', '#3a7440']];
  var ESPECIES = [{ fruta: 1 }, { fruta: 1 }, { fruta: 1, flor: '#ffffff' }, { petala: '#f6a0c4', flor: '#ffffff' },
    { petala: '#ffd4e6', flor: '#ff9cc6' }, { petala: '#ffb27a' }, {}];
  var PAL_COMUM = [0, 1, 2, 2, 1, 5, 3, 1, 2, 0, 4, 2], PAL_PINHO = [6, 2, 6, 1];

  /* ----- árvores (arte.md §12: a comum ≥ 40 px de arte, a arvoreta de 1 tile 16–20): copa de massas com contorno,
     luz em cima e à esquerda, sombra embaixo à direita e no chão; 3 formatos e nunca o mesmo desenho 3 vezes seguidas */
  var AW = 30, AH = 48;       // caixa do sprite da árvore: 7 px para cada lado do tile e 2 tiles acima dele
  function bola(cx, cy, r) {
    return { den: function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; },
      baixo: function (x, y) { var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)); return d > r - 1.3 && y > cy + r * 0.3; } };
  }
  // camada de pinheiro: triângulo de topo a base, meia-largura de m0 a m1 (a base em dentes: as pontas dos galhos)
  function camada(cx, topo, base, m0, m1) {
    return { pinho: true, den: function (x, y) {
      var dente = Math.abs(((x - cx) % 4 + 4) % 4 - 2) * 0.6;
      return y >= topo && y <= base - dente + 1 && Math.abs(x - cx) <= m0 + (m1 - m0) * (y - topo) / (base - topo); },
      baixo: function (x, y) { return y > base - 2.5; } };
  }
  var FORMAS = {
    redonda: { massas: [bola(15, 11, 8), bola(15, 20, 13.5), bola(9, 27, 8), bola(21, 27, 8)], tronco: 33, frutas: [[8, 17], [19, 12], [20, 24], [11, 26], [14, 20]] },
    dupla: { massas: [bola(20, 15, 10.5), bola(10, 21, 9.5), bola(15, 28, 8)], tronco: 34, frutas: [[18, 10], [7, 20], [15, 27], [23, 19], [12, 15]] },
    pinheiro: { massas: [camada(15, 3, 16, 0.5, 6.5), camada(15, 10, 26, 2, 9.5), camada(15, 18, 36, 4, 12.5)], tronco: 35, frutas: [] },
    // meia altura (a copa só cobre o tile de cima) e a arvoreta de 1 tile, onde a copa grande cobriria rua ou prédio
    media: { massas: [bola(15, 22, 9.5), bola(10, 28, 6.5), bola(20, 28, 6.5)], tronco: 33, frutas: [[11, 21], [18, 26], [16, 17]] },
    pinheiroMedio: { massas: [camada(15, 12, 25, 0.5, 6.5), camada(15, 19, 36, 3, 10.5)], tronco: 35, frutas: [] },
    arvoreta: { massas: [bola(9, 9, 7)], tronco: 14, frutas: [[5, 8], [11, 5]], w: 18, h: 22 },
    pinheirinho: { massas: [camada(9, 2, 11, 0.5, 5), camada(9, 7, 16, 2, 7.5)], tronco: 16, frutas: [], w: 18, h: 22 },
  };
  var FRUTAS = ['#ff5c6a', '#ff8a3d', '#ffd34d'];
  // uma massa (copa, moita) pixel a pixel: contorno com a borda recortada em folhinhas, e por dentro cachos de folhas
  // em 3 tons (luz em cima e à esquerda de cada cacho e da massa toda, sombra embaixo e à direita), brilho de 1 px,
  // e a linha de baixo de cada massa por cima das outras (os tufos)
  var pintarMassa = I.pintarMassa = function (ctx, w, h, massas, pal, esp) {
    var M = new Uint8Array(w * h), x, y, k, i;
    function den(px, py) { for (var i = 0; i < massas.length; i++) if (massas[i].den(px, py)) return i + 1; return 0; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) M[y * w + x] = den((esp ? w - 1 - x : x) + 0.5, y + 0.5);
    function m(px, py) { return px >= 0 && py >= 0 && px < w && py < h && M[py * w + px] > 0; }
    // borda em folhinhas: some 1 px da beirada aqui e ali (fixo pela posição)
    var tirar = [];
    for (y = 1; y < h; y++) for (x = 0; x < w; x++) if (m(x, y) && (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1))
      && D.sorte(esp ? w - 1 - x : x, y, 41) < 0.2 && m(x, y + 1)) tirar.push(y * w + x);
    tirar.forEach(function (j) { M[j] = 0; });
    // a caixa de cada massa (a luz grande vem do canto de cima à esquerda dela)
    var cx0 = [], cy0 = [], cx1 = [], cy1 = [];
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) if ((k = M[y * w + x])) {
      if (cx0[k] === undefined || x < cx0[k]) cx0[k] = x; if (cx1[k] === undefined || x > cx1[k]) cx1[k] = x;
      if (cy0[k] === undefined || y < cy0[k]) cy0[k] = y; if (cy1[k] === undefined || y > cy1[k]) cy1[k] = y;
    }
    var sombra = pal[3] || D.escurecer(pal[1], 0.24), funda = D.escurecer(sombra, 0.12);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      if (!(k = M[y * w + x])) continue;
      var cor, xs = (esp ? w - 1 - x : x) + 0.5, xa = esp ? w - 1 - x : x, pinho = massas[k - 1].pinho;
      var g = ((x - cx0[k]) / Math.max(1, cx1[k] - cx0[k]) - 0.5) * 1.1 + ((y - cy0[k]) / Math.max(1, cy1[k] - cy0[k]) - 0.5) * 1.6;
      // o cacho do pixel: centros numa grade de 6 (pinheiro: tufos achatados de 5 × 3), meio passo por fileira
      var sx = pinho ? 5 : 6, sy = pinho ? 3 : 5, fy = Math.floor(y / sy), d1 = 99, d2 = 99, lx = 0, ly = 0;
      for (var jj = fy - 1; jj <= fy + 1; jj++) {
        var desl = (jj & 1) * sx / 2, fx = Math.floor((xa - desl) / sx);
        for (var ii = fx - 1; ii <= fx + 1; ii++) {
          var ccx = ii * sx + desl + sx / 2 + (D.sorte(ii, jj, 43) - 0.5) * 2, ccy = jj * sy + sy / 2;
          var ex = xa + 0.5 - ccx, ey = (y + 0.5 - ccy) * (pinho ? 1.6 : 1), dd = ex * ex + ey * ey;
          if (dd < d1) { d2 = d1; d1 = dd; lx = ex; ly = ey; } else if (dd < d2) d2 = dd;
        }
      }
      if (esp) lx = -lx;
      var l = (lx * 0.5 + ly * 0.9) / 3, t = g * 0.7 + l * 0.55;
      if (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1)) cor = K;
      else if (!m(x + 1, y + 1) || !m(x + 2, y) || !m(x, y + 2)) cor = t > -0.2 ? sombra : pal[1];
      else if (Math.sqrt(d2) - Math.sqrt(d1) < 1 && ly > 0) cor = t > 0.1 ? funda : sombra;   // o vão entre cachos
      else if ((!m(x, y - 2) || !m(x - 2, y)) && t < 0.05) cor = pal[2];
      else cor = t < -0.55 ? pal[2] : t < -0.1 ? pal[0] : t < 0.4 ? pal[1] : sombra;
      if (cor !== K) for (i = 0; i < massas.length; i++) {
        if (!massas[i].den(xs, y + 0.5) || !massas[i].baixo(xs, y + 0.5)) continue;
        var outra = false;
        for (var o = 0; o < massas.length; o++) if (o !== i && massas[o].den(xs, y + 2.5)) outra = true;
        if (outra) { cor = funda; break; }
      }
      ret(ctx, x, y, 1, 1, cor);
    }
    // folhinhas soltas, de 1 px, logo fora da beirada de cima
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++)
      if (!m(x, y) && m(x, y + 2) && !m(x, y + 1) && D.sorte(esp ? w - 1 - x : x, y, 47) < 0.05) ret(ctx, x, y, 1, 1, pal[0]);
  };
  // tronco com casca e raízes (em px do sprite; cx no meio, gy a linha do chão)
  function tronco(ctx, cx, topo, gy, peq, sx) {
    var CL = '#c4906e', ES = '#7a5040';
    ret(ctx, cx - 3, topo, 6, gy - topo, K);
    ret(ctx, cx - 2, topo, 1, gy - topo, CL); ret(ctx, cx - 1, topo, 2, gy - topo, C.tronco); ret(ctx, cx + 1, topo, 1, gy - topo, '#8a604a');
    for (var yy = topo + 2; yy < gy - 3; yy++) if (D.sorte(sx, yy, 51) < 0.3) ret(ctx, cx - 1 + (D.sorte(sx, yy, 52) < 0.5 ? 1 : 0), yy, 1, 2, ES);
    if (!peq && gy - topo > 7) { ret(ctx, cx - 1, topo + 4, 2, 2, ES); ret(ctx, cx - 1, topo + 4, 1, 1, '#5e3a30'); }
    ret(ctx, cx - 2, topo, 4, 1, '#6e4a3a');   // a sombra da copa no alto do tronco
    // raízes: o pé se abre em 2 px para cada lado
    var r = peq ? 1 : 2;
    ret(ctx, cx - 3 - r, gy - 2, 6 + r * 2, 2, K);
    ret(ctx, cx - 2 - r, gy - 2, 4 + r * 2, 1, C.tronco); ret(ctx, cx - 2 - r, gy - 2, 1, 1, CL); ret(ctx, cx + 1 + r, gy - 2, 1, 1, '#8a604a');
    ret(ctx, cx - 4 - r, gy - 1, 8 + r * 2, 1, K);
    if (!peq) { ret(ctx, cx - 4, gy - 3, 1, 1, K); ret(ctx, cx + 3, gy - 3, 1, 1, K); }
  }
  // o sprite de uma variante de árvore (em px do sprite: o chão é a última linha)
  I.desenharArvore = function (ctx, v) {
    var f = FORMAS[v.forma], w = f.w || AW, h = f.h || AH, cx = w / 2, gy = h - 1, pal = COPAS[v.pal], e = ESPECIES[v.pal];
    sombraChao(ctx, cx, gy - 1, f.w ? 5 : 7);
    tronco(ctx, cx, f.tronco, gy, !!f.w, v.pal);
    pintarMassa(ctx, w, gy - 1, f.massas, pal, v.esp);
    var M = f.massas, gx = function (x) { return v.esp ? w - 1 - x : x; };
    function dentro(x, y) { for (var i = 0; i < M.length; i++) if (M[i].den(gx(x) + 0.5, y + 0.5) && M[i].den(gx(x) + 2.5, y + 2.5) && M[i].den(gx(x) - 1.5, y - 1.5)) return true; return false; }
    // florzinhas espalhadas pela copa (cerejeira e a florida)
    if (v.flor && e.flor) for (var y = 2; y < gy - 2; y++) for (var x = 2; x < w - 2; x++)
      if (D.sorte(x, y, 53) < 0.03 && dentro(x, y)) { ret(ctx, x, y, 1, 1, e.flor); if (D.sorte(x, y, 54) < 0.5) ret(ctx, x + 1, y, 1, 1, '#ffe066'); }
    // pétalas caídas no chão
    if (e.petala) [[-8, 0], [-5, -1], [6, 0], [9, -1], [3, 1]].forEach(function (p, i) {
      if (D.sorte(i, v.pal, 55) < 0.7) ret(ctx, cx + p[0] * (f.w ? 0.6 : 1) | 0, gy - 1 + p[1], 1, 1, e.petala);
    });
    if (v.fruta) f.frutas.forEach(function (p, i) {
      var fx = v.esp ? w - 2 - p[0] : p[0], cor = FRUTAS[(i + v.pal) % FRUTAS.length];
      ret(ctx, fx, p[1] - 1, 1, 1, '#5e3a30');
      ret(ctx, fx - 1, p[1], 4, 2, K); ret(ctx, fx, p[1] - 0, 2, 3, K);
      ret(ctx, fx, p[1], 2, 2, cor); ret(ctx, fx, p[1], 1, 1, '#fff6ea'); ret(ctx, fx + 1, p[1] + 1, 1, 1, D.escurecer(cor, 0.25));
    });
    if (v.moita) {
      var mx = cx + v.moita * 9;
      pintarMassa(ctx, w, gy + 1, [{ den: function (x, y) { var a = (x - mx) / 5.5, b = (y - gy + 3) / 4; return a * a + b * b <= 1; }, baixo: function () { return false; } }], COPAS[1], false);
      ret(ctx, mx - 2, gy - 4, 1, 1, '#ff9cc6'); ret(ctx, mx + 1, gy - 3, 1, 1, '#ffffff');
    }
  };
  // a copa não cobre rua, praça, água, prédio nem peça alta: a grande sobe 2 tiles, a média 1; senão, a arvoreta
  function copaLivre(x, y, n) {
    for (var j = 1; j <= n; j++) for (var i = -1; i <= 1; i++) {
      var nx = x + i, ny = y - j;
      if (ny < 0 || nx < 0 || nx >= W) continue;
      var t = I.tipo[ny][nx], d = I.decor[ny][nx];
      if ((t !== 'g' && t !== 'f') || (d && I.PECAS_ALTAS && I.PECAS_ALTAS[d])) return false;
      if (I.lugares.some(function (l) { return I.noRect(nx, ny, l.rect); })) return false;
    }
    return true;
  }
  var FORMAS_SORTE = [['redonda', 'dupla', 'pinheiro'], ['media', 'pinheiroMedio', 'media'], ['arvoreta', 'pinheirinho', 'arvoreta']];
  // formato, cores, espelho, fruta, moita e deslocamento de cada árvore, pela sorte do tile (sempre igual);
  // o vizinho da esquerda e o de cima já estão em memo (o Mapa.prerender anda em ordem)
  I.varianteArvore = function (x, y, memo) {
    var s = function (n) { return D.sorte(x, y, n); };
    var nivel = copaLivre(x, y, 2) ? 0 : copaLivre(x, y, 1) ? 1 : 2, formas = FORMAS_SORTE[nivel], alta = nivel === 0;
    var fi = Math.floor(s(1) * 3), pal = Math.floor(s(2) * PAL_COMUM.length), v;
    function igual(a, b) { return a && b && a.chave === v.chave && b.chave === v.chave; }
    function viz(i, j) { return x + i >= 0 && y + j >= 0 ? memo[(y + j) * W + x + i] : null; }
    for (var tent = 0; tent < 9; tent++) {
      var forma = formas[(fi + tent) % 3], n = pal + Math.floor(tent / 3), lista = /pinh/.test(forma) ? PAL_PINHO : PAL_COMUM;
      var p = I.decor[y][x] === 'frutifera' && !/pinh/.test(forma) ? [1, 2][n % 2] : lista[n % lista.length];
      v = { forma: forma, pal: p, chave: forma + p };
      if (!igual(viz(-1, 0), viz(-2, 0)) && !igual(viz(0, -1), viz(0, -2))) break;
    }
    var borda = x === 0 || y === 0 || x === W - 1 || y === H - 1;
    v.esp = s(3) < 0.5;
    v.fruta = I.decor[y][x] === 'frutifera' || (!!ESPECIES[v.pal].fruta && v.pal && !/pinh/.test(v.forma) && s(4) < 0.25);
    v.flor = !v.fruta && (!!ESPECIES[v.pal].petala || s(9) < 0.15);
    v.chave += v.flor ? 'f' : '';
    v.moita = borda && nivel < 2 && s(5) < 0.3 ? (s(6) < 0.5 ? -1 : 1) : 0;
    v.dx = Math.floor(s(7) * 7) - 3; v.dy = -Math.floor(s(8) * 3);
    if (!alta) v.dx = Math.max(-2, Math.min(2, v.dx));
    v.w = FORMAS[v.forma].w || AW; v.h = FORMAS[v.forma].h || AH;
    memo[y * W + x] = v;
    return v;
  };
})();
