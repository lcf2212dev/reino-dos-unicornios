/* As árvores do mapa (arte.md §12): a comum (copa de massas, ≥ 40 px de arte), a de meia altura e a arvoreta de
   1 tile, em 3 formatos, com fruta, moita no pé (na borda) e deslocamento pela sorte do tile. Usa as cores e os
   ajudantes de mundo/mapa-desenho.js (Mapa._interno) e entrega:
     I.varianteArvore(x, y, memo)   o desenho da árvore do tile ({ forma, pal, chave, esp, fruta, moita, dx, dy, w, h });
                                    nunca o mesmo desenho 3 vezes seguidas (memo: as do tile da esquerda e de cima)
     I.desenharArvore(ctx, v)       o sprite dela, em px do sprite (w × h, o chão é a última linha) */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var W = Mapa.W, H = Mapa.H, C = I.C, K = C.contorno, ret = I.ret, sombraChao = I.sombraChao;
  var COPAS = [['#ffc27a', '#f0a04a', '#fff1d0'], ['#d4ee78', '#a8cc48', '#f4f8c8'], ['#e4f59a', '#8fb83a', '#fff6d4']];

  /* ----- árvores (arte.md §12: a comum ≥ 40 px de arte, a arvoreta de 1 tile 16–20): copa de massas com contorno,
     luz em cima e à esquerda, sombra embaixo à direita e no chão; 3 formatos e nunca o mesmo desenho 3 vezes seguidas */
  var AW = 30, AH = 48;       // caixa do sprite da árvore: 7 px para cada lado do tile e 2 tiles acima dele
  function bola(cx, cy, r) {
    return { den: function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; },
      baixo: function (x, y) { var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)); return d > r - 1.3 && y > cy + r * 0.3; } };
  }
  // camada de pinheiro: triângulo de topo a base, meia-largura de m0 a m1
  function camada(cx, topo, base, m0, m1) {
    return { den: function (x, y) { return y >= topo && y <= base && Math.abs(x - cx) <= m0 + (m1 - m0) * (y - topo) / (base - topo); },
      baixo: function (x, y) { return y > base - 1.5; } };
  }
  var FORMAS = {
    redonda: { massas: [bola(15, 11, 8), bola(15, 20, 13.5), bola(9, 27, 8), bola(21, 27, 8)], tronco: 33, frutas: [[8, 17], [19, 12], [20, 24], [11, 26]] },
    dupla: { massas: [bola(20, 15, 10.5), bola(10, 21, 9.5), bola(15, 28, 8)], tronco: 34, frutas: [[18, 10], [7, 20], [15, 27], [23, 19]] },
    pinheiro: { massas: [camada(15, 3, 16, 0.5, 6.5), camada(15, 10, 26, 2, 9.5), camada(15, 18, 36, 4, 12.5)], tronco: 35, frutas: [] },
    // meia altura (a copa só cobre o tile de cima) e a arvoreta de 1 tile, onde a copa grande cobriria rua ou prédio
    media: { massas: [bola(15, 22, 9.5), bola(10, 28, 6.5), bola(20, 28, 6.5)], tronco: 33, frutas: [[11, 21], [18, 26]] },
    pinheiroMedio: { massas: [camada(15, 12, 25, 0.5, 6.5), camada(15, 19, 36, 3, 10.5)], tronco: 35, frutas: [] },
    arvoreta: { massas: [bola(9, 9, 7)], tronco: 14, frutas: [[5, 8], [11, 5]], w: 18, h: 22 },
    pinheirinho: { massas: [camada(9, 2, 11, 0.5, 5), camada(9, 7, 16, 2, 7.5)], tronco: 16, frutas: [], w: 18, h: 22 },
  };
  var FRUTAS = ['#ff5c6a', '#ff8a3d', '#ffd34d'];
  // uma massa (copa, moita) pixel a pixel: contorno, sombra embaixo e à direita, brilho de 1 px em cima e à esquerda,
  // miolo mais claro em cima, e a linha de baixo de cada massa por cima das outras (os tufos)
  var pintarMassa = I.pintarMassa = function (ctx, w, h, massas, pal, esp) {
    var M = new Uint8Array(w * h), x, y, k;
    function den(px, py) { for (var i = 0; i < massas.length; i++) if (massas[i].den(px, py)) return i + 1; return 0; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) M[y * w + x] = den((esp ? w - 1 - x : x) + 0.5, y + 0.5);
    function m(px, py) { return px >= 0 && py >= 0 && px < w && py < h && M[py * w + px] > 0; }
    var escuro = D.escurecer(pal[1], 0.24);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      if (!m(x, y)) continue;
      var cor = pal[1], xs = (esp ? w - 1 - x : x) + 0.5;
      if (!m(x - 1, y) || !m(x + 1, y) || !m(x, y - 1) || !m(x, y + 1)) cor = K;
      else if (!m(x + 2, y) || !m(x, y + 2) || !m(x + 2, y + 2)) cor = escuro;
      else if (!m(x, y - 2) || !m(x - 2, y)) cor = pal[2];
      else {
        for (k = 0; k < massas.length; k++) {
          if (!massas[k].baixo(xs, y + 0.5)) continue;
          var outra = false;
          for (var o = 0; o < massas.length; o++) if (o !== k && massas[o].den(xs, y + 2.5)) outra = true;
          if (outra) { cor = escuro; break; }
        }
        if (cor === pal[1] && (!m(x - 4, y - 4) || !m(x - 3, y - 5))) cor = pal[0];
      }
      ret(ctx, x, y, 1, 1, cor);
    }
  };
  // o sprite de uma variante de árvore (em px do sprite: o chão é a última linha)
  I.desenharArvore = function (ctx, v) {
    var f = FORMAS[v.forma], w = f.w || AW, h = f.h || AH, cx = w / 2, gy = h - 1, pal = COPAS[v.pal];
    sombraChao(ctx, cx, gy - 1, f.w ? 5 : 7);
    var topo = f.tronco;
    ret(ctx, cx - 3, topo, 6, gy - topo, K);
    ret(ctx, cx - 2, topo, 1, gy - topo, '#c4906e'); ret(ctx, cx - 1, topo, 2, gy - topo, C.tronco); ret(ctx, cx + 1, topo, 1, gy - topo, '#8a604a');
    ret(ctx, cx - 4, gy - 1, 8, 2, K); ret(ctx, cx - 3, gy - 1, 6, 1, C.tronco); ret(ctx, cx - 3, gy - 1, 1, 1, '#c4906e');
    pintarMassa(ctx, w, gy - 1, f.massas, pal, v.esp);
    if (v.fruta) f.frutas.forEach(function (p, i) {
      var fx = v.esp ? w - 2 - p[0] : p[0], cor = FRUTAS[(i + v.pal) % FRUTAS.length];
      ret(ctx, fx, p[1], 2, 2, cor); ret(ctx, fx, p[1], 1, 1, '#fff6ea');
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
    var fi = Math.floor(s(1) * 3), pal = Math.floor(s(2) * COPAS.length), v;
    function igual(a, b) { return a && b && a.chave === v.chave && b.chave === v.chave; }
    function viz(i, j) { return x + i >= 0 && y + j >= 0 ? memo[(y + j) * W + x + i] : null; }
    for (var tent = 0; tent < 9; tent++) {
      var forma = formas[(fi + tent) % 3], p = (pal + Math.floor(tent / 3)) % COPAS.length;
      if (/pinh/.test(forma) && p === 0) p = 1;
      v = { forma: forma, pal: p, chave: forma + p };
      if (!igual(viz(-1, 0), viz(-2, 0)) && !igual(viz(0, -1), viz(0, -2))) break;
    }
    var borda = x === 0 || y === 0 || x === W - 1 || y === H - 1;
    v.esp = s(3) < 0.5;
    v.fruta = I.decor[y][x] === 'frutifera' || (p !== 0 && !/pinh/.test(v.forma) && s(4) < 0.2);
    v.moita = borda && nivel < 2 && s(5) < 0.3 ? (s(6) < 0.5 ? -1 : 1) : 0;
    v.dx = Math.floor(s(7) * 7) - 3; v.dy = -Math.floor(s(8) * 3);
    if (!alta) v.dx = Math.max(-2, Math.min(2, v.dx));
    v.w = FORMAS[v.forma].w || AW; v.h = FORMAS[v.forma].h || AH;
    memo[y * W + x] = v;
    return v;
  };
})();
