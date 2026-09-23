/* O Reino visto de cima: grade de tiles, lugares, caminhos e desenho em pixel art. */
(function () {
  var T = 16;               // tamanho do tile em pixels
  var W = 36, H = 28;       // tamanho do mapa em tiles
  var Mapa = { T: T, W: W, H: H };

  var tipo = [];            // letra do chão
  var solido = [];          // true = não dá para andar
  var decor = [];           // enfeite do tile: 'arvore', 'flor', 'cristal', 'arbusto', ...
  var lugares = [];
  var estatico = null;      // canvas com tudo o que não se mexe
  var claudeTile = { x: 20, y: 12 };

  // clareiras onde as próximas matérias vão ganhar um lugar
  Mapa.CLAREIRAS = [
    { x: 10, y: 4, w: 5, h: 5 },
    { x: 23, y: 4, w: 5, h: 5 },
    { x: 9, y: 15, w: 5, h: 5 },
    { x: 22, y: 15, w: 5, h: 5 },
  ];

  var FIXOS = [
    { id: 'castelo', nome: 'Castelo da Medalha', sprite: 'castelo', rect: { x: 15, y: 1, w: 7, h: 5 } },
    { id: 'bau', nome: 'Baú do Tesouro', sprite: 'bau', rect: { x: 29, y: 3, w: 5, h: 4 } },
    { id: 'estabulo', nome: 'Estábulo Mágico', sprite: 'estabulo', rect: { x: 2, y: 15, w: 6, h: 4 } },
    { id: 'loja', nome: 'Loja das Fadas', sprite: 'loja', rect: { x: 29, y: 15, w: 5, h: 4 } },
  ];

  // gerador pseudoaleatório com semente (o reino sai sempre igual)
  function rng(semente) {
    var s = semente >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function dentro(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  function noRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function porta(r) { return { x: r.x + Math.floor(r.w / 2), y: r.y + r.h - 1 }; }

  Mapa.criar = function (materias) {
    tipo = []; solido = []; decor = []; lugares = [];
    for (var y = 0; y < H; y++) {
      tipo.push([]); solido.push([]); decor.push([]);
      for (var x = 0; x < W; x++) { tipo[y].push('g'); solido[y].push(false); decor[y].push(null); }
    }
    // lugares: fixos + um por matéria
    FIXOS.forEach(function (f) { lugares.push(Object.assign({ tipo: f.id, porta: porta(f.rect) }, f)); });
    materias.forEach(function (m, i) {
      var r = m.lugar.rect || Mapa.CLAREIRAS[i % Mapa.CLAREIRAS.length];
      lugares.push({ id: 'materia:' + m.id, tipo: 'materia', materiaId: m.id, nome: m.lugar.nome,
        sprite: m.lugar.sprite || 'torre', cores: m.lugar.cores, rect: r, porta: porta(r) });
    });

    function pintar(x, y, t) { if (dentro(x, y)) tipo[y][x] = t; }
    // ruas principais
    for (var x2 = 2; x2 <= 33; x2++) { pintar(x2, 9, 'c'); pintar(x2, 20, 'c'); }
    // praça
    for (var py = 11; py <= 17; py++) for (var px = 15; px <= 20; px++) pintar(px, py, 'p');
    for (var vy = 6; vy <= 19; vy++) { if (tipo[vy][17] !== 'p') { pintar(17, vy, 'c'); pintar(18, vy, 'c'); } }
    // ligação de cada porta até a rua mais próxima
    lugares.forEach(function (l) {
      var p = l.porta;
      var rua = p.y < 9 ? 9 : (p.y < 20 ? 20 : 20);
      if (p.y <= 9) { for (var yy = p.y + 1; yy < 9; yy++) pintar(p.x, yy, 'c'); }
      else { for (var yy2 = p.y + 1; yy2 < rua; yy2++) pintar(p.x, yy2, 'c'); }
    });
    // lago
    for (var ly = 21; ly < H - 1; ly++) for (var lx = 1; lx < W - 1; lx++) {
      var dx = (lx + 0.5 - 18) / 6.5, dy = (ly + 0.5 - 24.6) / 2.4;
      if (dx * dx + dy * dy <= 1) { tipo[ly][lx] = 'a'; solido[ly][lx] = true; }
    }
    // clareiras livres ganham um tapete de flores
    Mapa.CLAREIRAS.forEach(function (r) {
      var ocupada = lugares.some(function (l) { return l.rect.x === r.x && l.rect.y === r.y; });
      if (ocupada) return;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        var ddx = (xx + 0.5 - (r.x + r.w / 2)) / (r.w / 2), ddy = (yy + 0.5 - (r.y + r.h / 2)) / (r.h / 2);
        if (ddx * ddx + ddy * ddy <= 1.05) tipo[yy][xx] = 'f';
      }
    });
    // prédios são sólidos, menos a porta
    lugares.forEach(function (l) {
      var r = l.rect;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        solido[yy][xx] = !(xx === l.porta.x && yy === l.porta.y);
        tipo[yy][xx] = 'g';
      }
    });
    // fonte e Claude
    [[17, 13], [18, 13], [17, 14], [18, 14]].forEach(function (p) { solido[p[1]][p[0]] = true; });
    solido[claudeTile.y][claudeTile.x] = true;

    // bordas de árvores e enfeites
    var r = rng(20260923);
    function livreParaEnfeite(x, y) {
      if (tipo[y][x] !== 'g' || solido[y][x]) return false;
      for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
        var nx = x + i, ny = y + j;
        if (!dentro(nx, ny)) continue;
        if (tipo[ny][nx] === 'c' || tipo[ny][nx] === 'p' || tipo[ny][nx] === 'f') return false;
        if (lugares.some(function (l) { return noRect(nx, ny, l.rect); })) return false;
      }
      return true;
    }
    for (var by = 0; by < H; by++) for (var bx = 0; bx < W; bx++) {
      var borda = bx === 0 || by === 0 || bx === W - 1 || by === H - 1;
      if (borda) { decor[by][bx] = 'arvore'; solido[by][bx] = true; continue; }
      if (!livreParaEnfeite(bx, by)) {
        if (tipo[by][bx] === 'g' && !solido[by][bx] && r() < 0.18) decor[by][bx] = 'flor';
        continue;
      }
      var v = r();
      if (v < 0.07) { decor[by][bx] = 'arvore'; solido[by][bx] = true; }
      else if (v < 0.085) { decor[by][bx] = 'cristal'; solido[by][bx] = true; }
      else if (v < 0.11) { decor[by][bx] = 'arbusto'; solido[by][bx] = true; }
      else if (v < 0.36) decor[by][bx] = 'flor';
    }
    estatico = null;
  };

  Mapa.lugares = function () { return lugares; };
  Mapa.lugar = function (id) { return lugares.find(function (l) { return l.id === id; }); };
  Mapa.solido = function (x, y) { return !dentro(x, y) || solido[y][x]; };
  Mapa.lugarNoTile = function (x, y) { return lugares.find(function (l) { return noRect(x, y, l.rect); }); };
  Mapa.portaEm = function (x, y) { return lugares.find(function (l) { return l.porta.x === x && l.porta.y === y; }); };
  Mapa.claudeTile = claudeTile;
  Mapa.largura = function () { return W * T; };
  Mapa.altura = function () { return H * T; };

  // menor caminho de tiles de a até b, em 8 direções (lista sem o tile inicial).
  // Na diagonal só passa se os dois vizinhos retos estiverem livres (não corta quina).
  var VIZINHOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  Mapa.caminho = function (a, b) {
    if (!dentro(b.x, b.y)) return null;
    var chave = function (x, y) { return y * W + x; };
    var custo = {}, veio = {}, fechado = {};
    var ini = chave(a.x, a.y), fim = chave(b.x, b.y);
    custo[ini] = 0; veio[ini] = -1;
    var abertos = [ini];
    while (abertos.length) {
      // o aberto de menor custo (o mapa é pequeno, uma busca simples basta)
      var mi = 0;
      for (var i = 1; i < abertos.length; i++) if (custo[abertos[i]] < custo[abertos[mi]]) mi = i;
      var k = abertos[mi];
      abertos[mi] = abertos[abertos.length - 1]; abertos.pop();
      if (fechado[k]) continue;
      fechado[k] = true;
      if (k === fim) break;
      var cx = k % W, cy = Math.floor(k / W);
      VIZINHOS.forEach(function (d) {
        var nx = cx + d[0], ny = cy + d[1];
        if (!dentro(nx, ny) || solido[ny][nx]) return;
        if (d[0] && d[1] && (solido[cy][nx] || solido[ny][cx])) return;
        var nk = chave(nx, ny), c = custo[k] + d[2];
        if (fechado[nk] || (nk in custo && custo[nk] <= c)) return;
        custo[nk] = c; veio[nk] = k;
        abertos.push(nk);
      });
    }
    if (!fechado[fim]) return null;
    var cam = [], k2 = fim;
    while (veio[k2] !== -1) { cam.unshift({ x: k2 % W, y: Math.floor(k2 / W) }); k2 = veio[k2]; }
    return cam;
  };

  // tile andável mais perto de (x, y)
  Mapa.maisPerto = function (x, y, de) {
    var melhor = null, dist = 1e9;
    for (var r = 0; r <= 3; r++) for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
      var nx = x + i, ny = y + j;
      if (!dentro(nx, ny) || solido[ny][nx]) continue;
      var d = Math.abs(nx - de.x) + Math.abs(ny - de.y) + (Math.abs(i) + Math.abs(j)) * 3;
      if (d < dist) { dist = d; melhor = { x: nx, y: ny }; }
    }
    return melhor;
  };

  /* ================= DESENHO ================= */
  var C = {
    grama: '#a9e6a3', grama2: '#98db93', grama3: '#bdf0b5',
    rua: '#f7dce8', rua2: '#ebc4d6', rua3: '#fff0f6',
    praca: '#e9defe', praca2: '#d8c8fb',
    agua: '#86cdf7', agua2: '#a9ddfa', agua3: '#6bb8ea', margem: '#f3e3c0',
    tronco: '#a0745a', contorno: '#3a2446',
  };
  var COPAS = [['#ffb3d9', '#ff94c6', '#ffd6ea'], ['#b8f0d8', '#8fe0bf', '#dcfff0'], ['#d8c6ff', '#bba3ff', '#efe6ff']];
  var FLORES = ['#ff7eb6', '#ffe066', '#ffffff', '#b58cff', '#7fd6ff'];

  function ret(ctx, x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }
  function circulo(ctx, cx, cy, raio, cor) {
    ctx.fillStyle = cor;
    for (var j = -raio; j <= raio; j++) {
      var meia = Math.floor(Math.sqrt(raio * raio - j * j) + 0.35);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function elipse(ctx, cx, cy, rx, ry, cor) {
    ctx.fillStyle = cor;
    for (var j = -ry; j <= ry; j++) {
      var meia = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function triangulo(ctx, x, y, w, h, cor) { // triângulo isósceles apontando para cima
    ctx.fillStyle = cor;
    for (var j = 0; j < h; j++) {
      var meia = Math.round((w / 2) * (j + 1) / h);
      ctx.fillRect(Math.round(x + w / 2 - meia), y + j, meia * 2, 1);
    }
  }

  function desenharChao(ctx, x, y, r) {
    var px = x * T, py = y * T, t = tipo[y][x];
    if (t === 'g' || t === 'f') {
      ret(ctx, px, py, T, T, C.grama);
      for (var i = 0; i < 5; i++) ret(ctx, px + Math.floor(r() * 15), py + Math.floor(r() * 15), 1, 2, r() < 0.5 ? C.grama2 : C.grama3);
      if (t === 'f') {
        for (var k = 0; k < 4; k++) {
          var fx = px + 2 + Math.floor(r() * 12), fy = py + 2 + Math.floor(r() * 12);
          var cor = FLORES[Math.floor(r() * FLORES.length)];
          ret(ctx, fx - 1, fy, 3, 1, cor); ret(ctx, fx, fy - 1, 1, 3, cor); ret(ctx, fx, fy, 1, 1, '#fff6a8');
        }
      }
    } else if (t === 'c') {
      ret(ctx, px, py, T, T, C.rua);
      ret(ctx, px + (y % 2 ? 0 : 8), py, 1, 8, C.rua2);
      ret(ctx, px + (y % 2 ? 8 : 0), py + 8, 1, 8, C.rua2);
      ret(ctx, px, py + 7, T, 1, C.rua2);
      ret(ctx, px + 2, py + 2, 3, 1, C.rua3); ret(ctx, px + 10, py + 10, 3, 1, C.rua3);
    } else if (t === 'p') {
      ret(ctx, px, py, T, T, (x + y) % 2 ? C.praca : C.praca2);
      ret(ctx, px, py, T, 1, '#f6f0ff'); ret(ctx, px, py, 1, T, '#f6f0ff');
    } else if (t === 'a') {
      ret(ctx, px, py, T, T, C.grama); // o lago é pintado depois, como uma elipse
    }
  }

  function desenharArvore(ctx, x, y, r) {
    var px = x * T, py = y * T;
    var copa = COPAS[Math.floor(r() * COPAS.length)];
    ret(ctx, px + 6, py + 9, 4, 7, C.tronco);
    ret(ctx, px + 6, py + 9, 1, 7, '#8a604a');
    circulo(ctx, px + 8, py + 6, 7, C.contorno);
    circulo(ctx, px + 8, py + 6, 6, copa[1]);
    circulo(ctx, px + 7, py + 5, 5, copa[0]);
    circulo(ctx, px + 6, py + 3, 2, copa[2]);
    ret(ctx, px + 10, py + 8, 1, 1, '#ffffff');
  }
  function desenharFlor(ctx, x, y, r) {
    var px = x * T + 3 + Math.floor(r() * 9), py = y * T + 4 + Math.floor(r() * 8);
    var cor = FLORES[Math.floor(r() * FLORES.length)];
    ret(ctx, px, py + 2, 1, 3, '#5cb85c');
    ret(ctx, px - 1, py, 3, 1, cor); ret(ctx, px, py - 1, 1, 3, cor); ret(ctx, px, py, 1, 1, '#fff3a0');
  }
  function desenharCristal(ctx, x, y) {
    var px = x * T, py = y * T;
    ctx.fillStyle = C.contorno;
    ctx.fillRect(px + 4, py + 4, 8, 11);
    ret(ctx, px + 5, py + 5, 6, 9, '#9fdcff');
    ret(ctx, px + 5, py + 5, 2, 9, '#d8f2ff');
    ret(ctx, px + 7, py + 2, 2, 3, C.contorno); ret(ctx, px + 7, py + 3, 1, 2, '#d8f2ff');
    ret(ctx, px + 3, py + 13, 10, 2, '#b58cff');
  }
  function desenharArbusto(ctx, x, y) {
    var px = x * T, py = y * T;
    elipse(ctx, px + 8, py + 10, 7, 5, C.contorno);
    elipse(ctx, px + 8, py + 10, 6, 4, '#7fd08a');
    elipse(ctx, px + 7, py + 9, 4, 2, '#a4e6ad');
    ret(ctx, px + 5, py + 8, 1, 1, '#ff7eb6'); ret(ctx, px + 11, py + 11, 1, 1, '#ffe066');
  }

  /* ----- prédios ----- */
  function contornoRet(ctx, x, y, w, h, cor, fundo) { ret(ctx, x, y, w, h, C.contorno); ret(ctx, x + 1, y + 1, w - 2, h - 2, fundo || cor); }

  function portaArco(ctx, x, y, w, h, cor, moldura) {
    ret(ctx, x - 1, y + 2, w + 2, h - 2, moldura || '#ffd34d');
    elipse(ctx, x + w / 2 - 0.5, y + 3, w / 2, 3, moldura || '#ffd34d');
    ret(ctx, x, y + 3, w, h - 3, cor);
    elipse(ctx, x + w / 2 - 0.5, y + 4, w / 2 - 1, 3, cor);
    ret(ctx, x + w / 2 - 1, y + 5, 1, h - 5, PA.cor.escurecer(cor, 0.25));
    ret(ctx, x + w - 4, y + h / 2 + 2, 2, 2, '#ffd34d');
  }

  var PREDIOS = {
    castelo: function (ctx, px, py, w, h) {
      var parede = '#ffd1e6', parede2 = '#f7b7d4', telhado = '#b79cff';
      // muralha central
      contornoRet(ctx, px + 20, py + 30, w - 40, h - 30, parede);
      for (var j = py + 36; j < py + h - 4; j += 8) for (var i = px + 22 + ((j / 8) % 2) * 4; i < px + w - 22; i += 10) ret(ctx, i, j, 5, 1, parede2);
      for (var k = px + 20; k < px + w - 20; k += 8) { ret(ctx, k, py + 25, 6, 6, C.contorno); ret(ctx, k + 1, py + 26, 4, 5, parede); }
      // torres
      [px + 2, px + w - 28].forEach(function (tx) {
        contornoRet(ctx, tx, py + 22, 26, h - 22, '#ffc2dd');
        for (var j2 = py + 28; j2 < py + h - 4; j2 += 8) ret(ctx, tx + 4, j2, 18, 1, parede2);
        triangulo(ctx, tx - 3, py + 2, 32, 22, C.contorno);
        triangulo(ctx, tx - 1, py + 4, 28, 19, telhado);
        ret(ctx, tx + 12, py - 6, 1, 9, C.contorno);
        ret(ctx, tx + 13, py - 6, 7, 4, '#ff7eb6');
        ret(ctx, tx + 8, py + 34, 10, 12, C.contorno); ret(ctx, tx + 9, py + 35, 8, 11, '#9fdcff');
        ret(ctx, tx + 9, py + 35, 3, 4, '#e6f7ff');
      });
      // portão
      portaArco(ctx, px + w / 2 - 10, py + h - 26, 20, 26, '#8a5cff');
      // medalha acima do portão
      circulo(ctx, px + w / 2, py + 40, 6, C.contorno);
      circulo(ctx, px + w / 2, py + 40, 5, '#ffd34d');
      ret(ctx, px + w / 2 - 1, py + 37, 3, 6, '#fff3a0'); ret(ctx, px + w / 2 - 3, py + 39, 7, 2, '#fff3a0');
    },
    museu: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      var parede = cores.parede || '#efe6ff', telhado = cores.telhado || '#b79cff', det = cores.detalhe || '#ff9cc6';
      // degraus
      contornoRet(ctx, px + 2, py + h - 8, w - 4, 8, '#e2d9f3');
      ret(ctx, px + 3, py + h - 5, w - 6, 1, '#cfc2ea');
      contornoRet(ctx, px + 5, py + h - 14, w - 10, 7, '#ece5fa');
      // parede
      contornoRet(ctx, px + 7, py + 26, w - 14, h - 39, parede);
      // colunas
      [px + 9, px + 23, px + w - 31, px + w - 17].forEach(function (cx) {
        ret(ctx, cx - 1, py + 28, 10, 3, C.contorno); ret(ctx, cx, py + 29, 8, 1, '#ffffff');
        ret(ctx, cx, py + 31, 8, h - 45, C.contorno); ret(ctx, cx + 1, py + 31, 6, h - 45, '#ffffff');
        ret(ctx, cx + 5, py + 31, 2, h - 45, '#e3dbf5');
      });
      // frontão
      ret(ctx, px + 2, py + 20, w - 4, 7, C.contorno); ret(ctx, px + 3, py + 21, w - 6, 5, PA.cor.clarear(telhado, 0.35));
      triangulo(ctx, px + 1, py + 1, w - 2, 20, C.contorno);
      triangulo(ctx, px + 4, py + 4, w - 8, 16, telhado);
      // emblema: ampulheta do tempo com coração
      circulo(ctx, px + w / 2, py + 13, 4, '#ffffff');
      ret(ctx, px + w / 2 - 2, py + 11, 5, 1, det); ret(ctx, px + w / 2 - 1, py + 12, 3, 1, det);
      ret(ctx, px + w / 2, py + 13, 1, 1, det); ret(ctx, px + w / 2 - 1, py + 14, 3, 1, det); ret(ctx, px + w / 2 - 2, py + 15, 5, 1, det);
      // porta
      portaArco(ctx, px + w / 2 - 8, py + h - 36, 16, 23, '#7c5cff');
      // janelinhas
      ret(ctx, px + 13, py + 38, 8, 10, C.contorno); ret(ctx, px + 14, py + 39, 6, 8, '#bfe7ff');
      ret(ctx, px + w - 21, py + 38, 8, 10, C.contorno); ret(ctx, px + w - 20, py + 39, 6, 8, '#bfe7ff');
    },
    estabulo: function (ctx, px, py, w, h) {
      contornoRet(ctx, px + 4, py + 22, w - 8, h - 22, '#c9f2e3');
      for (var i = px + 10; i < px + w - 6; i += 7) ret(ctx, i, py + 24, 1, h - 25, '#a9e3cf');
      // telhado
      ctx.fillStyle = C.contorno;
      for (var j = 0; j < 24; j++) { var m = Math.round(12 + j * (w / 2 - 12) / 23); ctx.fillRect(px + w / 2 - m - 2, py + j, (m + 2) * 2, 1); }
      ctx.fillStyle = '#ff9cc6';
      for (var j2 = 2; j2 < 23; j2++) { var m2 = Math.round(10 + j2 * (w / 2 - 14) / 23); ctx.fillRect(px + w / 2 - m2, py + j2, m2 * 2, 1); }
      for (var j3 = 6; j3 < 23; j3 += 5) { var m3 = Math.round(10 + j3 * (w / 2 - 14) / 23); ret(ctx, px + w / 2 - m3, py + j3, m3 * 2, 1, '#ff7eb6'); }
      // janelinha do feno
      ret(ctx, px + w / 2 - 6, py + 8, 12, 10, C.contorno); ret(ctx, px + w / 2 - 5, py + 9, 10, 8, '#ffe066');
      ret(ctx, px + w / 2 - 5, py + 14, 10, 3, '#f5c842');
      // porta de celeiro
      var dx = px + w / 2 - 10, dy = py + h - 26;
      contornoRet(ctx, dx, dy, 20, 26, '#ff7eb6');
      ctx.fillStyle = '#ffffff';
      for (var t = 0; t < 22; t++) { ctx.fillRect(dx + 1 + Math.round(t * 18 / 22), dy + 2 + t, 1, 1); ctx.fillRect(dx + 18 - Math.round(t * 18 / 22), dy + 2 + t, 1, 1); }
      ret(ctx, dx + 1, dy + 1, 18, 1, '#ffffff'); ret(ctx, dx + 9, dy + 1, 2, 25, '#ffffff');
      // ferradura dourada
      ret(ctx, px + w / 2 - 3, py + 20, 7, 2, '#ffd34d'); ret(ctx, px + w / 2 - 3, py + 17, 2, 4, '#ffd34d'); ret(ctx, px + w / 2 + 2, py + 17, 2, 4, '#ffd34d');
    },
    bau: function (ctx, px, py, w, h) {
      // moedas no topo
      [[14, 4], [24, 2], [34, 5], [48, 3], [60, 5]].forEach(function (m) { circulo(ctx, px + m[0], py + m[1] + 3, 3, C.contorno); circulo(ctx, px + m[0], py + m[1] + 3, 2, '#ffd34d'); ret(ctx, px + m[0] - 1, py + m[1] + 2, 1, 1, '#fff3a0'); });
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
      elipse(ctx, px + w / 2, py + 17, w / 2 - 3, 15, '#ff7eb6');
      elipse(ctx, px + w / 2 - 8, py + 11, 14, 6, '#ff9cc6');
      ret(ctx, px + 2, py + 26, w - 4, 6, C.contorno); ret(ctx, px + 4, py + 26, w - 8, 4, '#e8609d');
      [[18, 10, 4], [44, 7, 5], [62, 16, 3], [30, 21, 3], [52, 22, 2]].forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], '#ffffff'); });
      // janela redonda
      circulo(ctx, px + 22, py + 42, 5, C.contorno); circulo(ctx, px + 22, py + 42, 4, '#d8c6ff'); ret(ctx, px + 20, py + 40, 2, 2, '#ffffff');
      // porta
      portaArco(ctx, px + w / 2 - 7, py + h - 22, 14, 22, '#9b5cff', '#ffe066');
      // brilhinhos
      [[6, 36], [72, 40], [66, 50]].forEach(function (s) { ret(ctx, px + s[0], py + s[1] - 1, 1, 3, '#ffffff'); ret(ctx, px + s[0] - 1, py + s[1], 3, 1, '#ffffff'); });
    },
    torre: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      var parede = cores.parede || '#e6f4ff', telhado = cores.telhado || '#7fd6ff';
      contornoRet(ctx, px + 12, py + 22, w - 24, h - 22, parede);
      triangulo(ctx, px + 6, py + 1, w - 12, 23, C.contorno);
      triangulo(ctx, px + 9, py + 4, w - 18, 19, telhado);
      portaArco(ctx, px + w / 2 - 7, py + h - 22, 14, 22, '#7c5cff');
    },
  };

  Mapa.PREDIOS = PREDIOS;

  var LAGO = { cx: 18, cy: 24.6, rx: 6.5, ry: 2.4 };
  function desenharLago(ctx) {
    var cx = Math.round(LAGO.cx * T), cy = Math.round(LAGO.cy * T);
    var rx = Math.round(LAGO.rx * T), ry = Math.round(LAGO.ry * T);
    elipse(ctx, cx, cy, rx + 4, ry + 4, C.margem);
    elipse(ctx, cx, cy, rx + 1, ry + 1, '#e7cf9e');
    elipse(ctx, cx, cy, rx, ry, C.agua3);
    elipse(ctx, cx, cy - 2, rx - 2, ry - 3, C.agua);
    var r = rng(99);
    for (var i = 0; i < 22; i++) {
      var ax = cx - rx + 10 + Math.floor(r() * (rx * 2 - 20)), ay = cy - ry + 8 + Math.floor(r() * (ry * 2 - 14));
      var dx = (ax - cx) / rx, dy = (ay - cy) / ry;
      if (dx * dx + dy * dy < 0.8) ret(ctx, ax, ay, 4 + Math.floor(r() * 4), 1, C.agua2);
    }
    // vitórias-régias
    [[-60, -8], [-40, 12], [52, 4], [70, -10]].forEach(function (v) {
      elipse(ctx, cx + v[0], cy + v[1], 5, 3, '#5cbf6b'); elipse(ctx, cx + v[0] - 1, cy + v[1] - 1, 3, 1, '#7fd08a');
      ret(ctx, cx + v[0] + 2, cy + v[1] - 2, 2, 2, '#ff9cc6');
    });
  }

  function desenharFonte(ctx) {
    var cx = 18 * T, cy = 14 * T;
    elipse(ctx, cx, cy + 2, 15, 11, C.contorno);
    elipse(ctx, cx, cy + 2, 14, 10, '#e2d9f3');
    elipse(ctx, cx, cy + 2, 11, 7, C.agua);
    ret(ctx, cx - 2, cy - 10, 4, 12, C.contorno); ret(ctx, cx - 1, cy - 10, 2, 12, '#ffffff');
    elipse(ctx, cx, cy - 10, 5, 2, C.contorno); elipse(ctx, cx, cy - 10, 4, 1, '#e2d9f3');
  }

  Mapa.prerender = function () {
    var c = PA.novoCanvas(W * T, H * T);
    var ctx = c.getContext('2d');
    var r = rng(777);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) desenharChao(ctx, x, y, r);
    var r2 = rng(4242);
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      var d = decor[y2][x2];
      if (d === 'flor') desenharFlor(ctx, x2, y2, r2);
      else if (d === 'cristal') desenharCristal(ctx, x2, y2);
      else if (d === 'arbusto') desenharArbusto(ctx, x2, y2);
    }
    desenharLago(ctx);
    desenharFonte(ctx);
    // prédios e árvores em ordem de cima para baixo
    var itens = [];
    lugares.forEach(function (l) { itens.push({ y: l.rect.y + l.rect.h, f: function () {
      var fn = PREDIOS[l.sprite] || PREDIOS.torre;
      fn(ctx, l.rect.x * T, l.rect.y * T, l.rect.w * T, l.rect.h * T, l.cores);
    } }); });
    for (var y3 = 0; y3 < H; y3++) for (var x3 = 0; x3 < W; x3++) {
      if (decor[y3][x3] === 'arvore') (function (xx, yy) { itens.push({ y: yy + 1, f: function () { desenharArvore(ctx, xx, yy, rng(xx * 131 + yy * 71)); } }); })(x3, y3);
    }
    itens.sort(function (a, b) { return a.y - b.y; }).forEach(function (i) { i.f(); });
    estatico = c;
    return c;
  };

  // partes animadas: brilho da água, jato da fonte, arco-íris dos lugares concluídos
  Mapa.desenharAnimado = function (ctx, t, opcoes) {
    opcoes = opcoes || {};
    if (!estatico) Mapa.prerender();
    ctx.drawImage(estatico, 0, 0);
    if (!opcoes.semAnimacao) {
      // brilhos na água
      for (var i = 0; i < 14; i++) {
        var fase = (t / 1400 + i * 0.37) % 1;
        var ax = 12 * T + ((i * 53) % (12 * T)), ay = 22 * T + 6 + ((i * 29) % (4 * T - 10));
        if (Mapa.solido(Math.floor(ax / T), Math.floor(ay / T)) && fase < 0.5) {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.9 - fase * 1.6).toFixed(2) + ')';
          ctx.fillRect(ax, ay, 3, 1);
        }
      }
      // jato da fonte
      var cx = 18 * T, cy = 14 * T - 12;
      for (var g = 0; g < 8; g++) {
        var f = ((t / 700) + g / 8) % 1;
        var lado = g % 2 ? 1 : -1;
        var gx = cx + lado * f * 9, gy = cy - Math.sin(f * Math.PI) * 9 + f * 10;
        ctx.fillStyle = f < 0.8 ? '#bfe7ff' : '#ffffff';
        ctx.fillRect(Math.round(gx), Math.round(gy), 2, 2);
      }
    }
    // arco-íris sobre os lugares concluídos
    (opcoes.concluidos || []).forEach(function (id) {
      var l = Mapa.lugar(id);
      if (!l) return;
      var cx2 = (l.rect.x + l.rect.w / 2) * T, base = l.rect.y * T + 10;
      var cores = ['#ff6b8a', '#ffb020', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
      var raio = l.rect.w * T / 2 + 6;
      for (var k = 0; k < cores.length; k++) {
        ctx.strokeStyle = cores[k];
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx2, base, raio - k * 2, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  };

  window.Mapa = Mapa;
})();
