/* O Reino visto de cima: grade de tiles, lugares, caminhos e desenho em pixel art. */
(function () {
  var T = 16;               // tamanho do tile em pixels
  var W = 36, H = 28;       // tamanho do mapa em tiles
  var Mapa = { T: T, W: W, H: H };

  var tipo = [];            // letra do chão
  var solido = [];          // true = não dá para andar
  var decor = [];           // enfeite do tile: 'arvore', 'flor', 'cristal', 'arbusto', 'cogumelo'
  var lugares = [];
  var estatico = null;      // canvas com tudo o que não se mexe
  var BORDA_BAIXO = 4;      // fileiras de grama desenhadas abaixo do fim do mapa (só enfeite)
  var claudeTile = { x: 20, y: 12 };

  // clareiras onde as próximas matérias vão ganhar um lugar
  Mapa.CLAREIRAS = [
    { x: 10, y: 4, w: 5, h: 5 },
    { x: 23, y: 4, w: 5, h: 5 },
    { x: 22, y: 15, w: 5, h: 5 },
  ];

  var FIXOS = [
    // castelo com placa à direita (à esquerda cobriria a torre da clareira); a do baú vai no telhado
    { id: 'castelo', nome: 'Castelo da Medalha', sprite: 'castelo', rect: { x: 15, y: 1, w: 7, h: 5 }, placa: 'direita' },
    { id: 'bau', nome: 'Baú do Tesouro', sprite: 'bau', rect: { x: 29, y: 3, w: 5, h: 4 }, placa: 'acima' },
    // placa em cima do telhado: à direita ela cobriria a Escola do Reino
    { id: 'estabulo', nome: 'Estábulo Mágico', sprite: 'estabulo', rect: { x: 2, y: 15, w: 6, h: 4 }, placa: 'acima' },
    { id: 'loja', nome: 'Loja das Fadas', sprite: 'loja', rect: { x: 29, y: 15, w: 5, h: 4 } },
    { id: 'escola', nome: 'Escola do Reino', sprite: 'escola', rect: { x: 9, y: 15, w: 5, h: 5 } },
  ];
  // lugares que chegaram depois (Pet Shop e Observatório): entram no mapa DEPOIS dos enfeites,
  // para o resto do reino continuar com as mesmas árvores e flores de sempre (o sorteio segue a
  // ordem dos tiles). Ficam ao sul da rua de baixo, fora das clareiras; `caminho` = tiles de rua
  // da rua até a frente da porta (a porta fica embaixo, virada para o sul).
  var EXTRAS = [
    // em frente ao Estábulo, do outro lado da rua
    { id: 'petshop', nome: 'Pet Shop', sprite: 'petshop', rect: { x: 2, y: 21, w: 5, h: 4 },
      caminho: [[7, 21], [7, 22], [7, 23], [7, 24], [7, 25], [6, 25], [5, 25], [4, 25]] },
    // no morro a leste do lago (o ponto alto do reino)
    // placa em cima: a área inclui a ilha do morro, e ao lado a placa ficava longe da cúpula
    { id: 'observatorio', nome: 'Observatório', sprite: 'observatorio', rect: { x: 28, y: 21, w: 6, h: 5 }, placa: 'acima',
      caminho: [[27, 21], [27, 22], [27, 23], [27, 24], [27, 25], [27, 26], [28, 26], [29, 26], [30, 26], [31, 26]] },
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
        sprite: m.lugar.sprite || 'torre', cores: m.lugar.cores, rect: r, porta: porta(r), placa: m.lugar.placa });
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
    // lago: dá para nadar nele (a Mariana e a montaria), então a água não é sólida.
    // O sorteio dos enfeites pula a água pelo tipo ('a'), não pela solidez: o reino sai igual.
    for (var ly = 21; ly < H - 1; ly++) for (var lx = 1; lx < W - 1; lx++) {
      var dx = (lx + 0.5 - 18) / 6.5, dy = (ly + 0.5 - 24.6) / 2.4;
      if (dx * dx + dy * dy <= 1) tipo[ly][lx] = 'a';
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
    function pertoDaAgua(x, y) {
      for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
        var nx = x + i, ny = y + j;
        if (dentro(nx, ny) && tipo[ny][nx] === 'a') return true;
      }
      return false;
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
      else if (v < 0.40 && !pertoDaAgua(bx, by)) decor[by][bx] = 'cogumelo';
    }
    // lugares novos por cima do reino já enfeitado: tiram só o enfeite do próprio terreno e do caminho
    EXTRAS.forEach(function (f) {
      var l = Object.assign({ tipo: f.id, porta: porta(f.rect) }, f);
      lugares.push(l);
      var r = f.rect;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        decor[yy][xx] = null;
        tipo[yy][xx] = 'g';
        solido[yy][xx] = !(xx === l.porta.x && yy === l.porta.y);
      }
      f.caminho.forEach(function (p) { decor[p[1]][p[0]] = null; tipo[p[1]][p[0]] = 'c'; solido[p[1]][p[0]] = false; });
    });
    estatico = null;
  };

  Mapa.lugares = function () { return lugares; };
  Mapa.lugar = function (id) { return lugares.find(function (l) { return l.id === id; }); };
  Mapa.solido = function (x, y) { return !dentro(x, y) || solido[y][x]; };
  // tile de água do lago (a fonte da praça não é água e continua sólida)
  Mapa.agua = function (x, y) { return dentro(x, y) && tipo[y][x] === 'a'; };
  Mapa.lugarNoTile = function (x, y) { return lugares.find(function (l) { return noRect(x, y, l.rect); }); };
  Mapa.portaEm = function (x, y) { return lugares.find(function (l) { return l.porta.x === x && l.porta.y === y; }); };
  Mapa.claudeTile = claudeTile;
  Mapa.largura = function () { return W * T; };
  Mapa.altura = function () { return H * T; };

  // menor caminho de tiles de a até b, em 8 direções (lista sem o tile inicial).
  // Na diagonal só passa se os dois vizinhos retos estiverem livres (não corta quina).
  var VIZINHOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  // Destino em terra: primeiro procura um caminho que não entra na água (o lago como sólido);
  // só se não houver nenhum (ex.: ela está no meio do lago) procura de novo nadando.
  // Destino na água (ou a volta a nado): cada passo que entra na água custa config.nado.custo vezes mais.
  Mapa.caminho = function (a, b) {
    if (!dentro(b.x, b.y)) return null;
    if (tipo[b.y][b.x] !== 'a') {
      var seco = buscar(a, b, true);
      if (seco) return seco;
    }
    return buscar(a, b, false);
  };
  function buscar(a, b, semAgua) {
    var nado = (window.Reino && Reino.config && Reino.config.nado) || {};
    var custoAgua = nado.custo > 0 ? nado.custo : 3;
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
        if (semAgua && tipo[ny][nx] === 'a') return;
        if (d[0] && d[1] && (solido[cy][nx] || solido[ny][cx])) return;
        // de terra para terra na diagonal, também não corta a quina da água (não molha o pé à toa)
        if (d[0] && d[1] && tipo[cy][cx] !== 'a' && tipo[ny][nx] !== 'a' && (tipo[cy][nx] === 'a' || tipo[ny][cx] === 'a')) return;
        var nk = chave(nx, ny), c = custo[k] + d[2] * (tipo[ny][nx] === 'a' ? custoAgua : 1);
        if (fechado[nk] || (nk in custo && custo[nk] <= c)) return;
        custo[nk] = c; veio[nk] = k;
        abertos.push(nk);
      });
    }
    if (!fechado[fim]) return null;
    var cam = [], k2 = fim;
    while (veio[k2] !== -1) { cam.unshift({ x: k2 % W, y: Math.floor(k2 / W) }); k2 = veio[k2]; }
    return cam;
  }

  // tile andável mais perto de (x, y)
  // tocou num tile de terra sólido (árvore, arbusto): prefere terra; água só se não houver terra perto
  Mapa.maisPerto = function (x, y, de) {
    function procurar(aceitaAgua, raio) {
      var melhor = null, dist = 1e9, rMax = raio === undefined ? 3 : raio;
      for (var r = 0; r <= rMax; r++) for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
        var nx = x + i, ny = y + j;
        if (!dentro(nx, ny) || solido[ny][nx]) continue;
        if (!aceitaAgua && Mapa.agua(nx, ny)) continue;
        var d = Math.abs(nx - de.x) + Math.abs(ny - de.y) + (Math.abs(i) + Math.abs(j)) * 3;
        if (d < dist) { dist = d; melhor = { x: nx, y: ny }; }
      }
      return melhor;
    }
    // tocou em terra (arbusto, casa): prefere um tile de terra, para ela não atravessar o lago nadando;
    // se ela já está nadando: terra encostada no que foi tocado, senão a água em volta (senão ela
    // nadaria de lado até a margem para chegar a uma árvore cercada de água)
    if (Mapa.agua(x, y)) return procurar(true);
    if (de && Mapa.agua(de.x, de.y)) return procurar(false, 1) || procurar(true);
    return procurar(false) || procurar(true);
  };

  /* ================= DESENHO ================= */
  var C = {
    grama: '#c6e15a', grama2: '#a8cc48', grama3: '#e4f59a',
    rua: '#f7d7a8', rua2: '#e4c07a', rua3: '#fff8e8',
    praca: '#ffe6b0', praca2: '#f0c56e', praca3: '#fff8e8',
    agua: '#7ed9c8', agua2: '#d9fff4', agua3: '#3eaea3', margem: '#f8e2a8',
    tronco: '#a0745a', contorno: '#3a2446',
    miolo: '#fff6a8',
  };
  var COPAS = [['#ffc27a', '#f0a04a', '#fff1d0'], ['#d4ee78', '#a8cc48', '#f4f8c8'], ['#e4f59a', '#8fb83a', '#fff6d4']];
  var FLORES = ['#ff8a3d', '#ffe066', '#ffffff', '#ffb15a', '#7ed9c8'];

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

  function desenharChao(ctx, x, y, r, forcado) {
    var px = x * T, py = y * T, t = forcado || tipo[y][x];
    var par = (x + y) % 2 === 0, fio, topo, k, fx, fy, cor;
    if (t === 'g' || t === 'f') {
      ret(ctx, px, py, T, T, t === 'f' ? C.grama3 : C.grama);
      fio = t === 'f' ? C.grama : C.grama3;
      var ax = par ? 1 : 13, ay = par ? 1 : 12;
      var bx = par ? 13 : 1, by = par ? 12 : 1;
      ret(ctx, px + ax, py + ay, 1, 3, C.grama2);
      ret(ctx, px + ax + 1, py + ay + 1, 1, 2, fio);
      ret(ctx, px + bx, py + by, 1, 3, C.grama2);
      ret(ctx, px + bx + 1, py + by + 1, 1, 2, fio);
      if (t === 'f') {
        var pts = [[4, 5], [11, 6], [7, 11]];
        for (k = 0; k < 3; k++) {
          fx = px + pts[k][0]; fy = py + pts[k][1];
          cor = FLORES[(x + y + k) % FLORES.length];
          ret(ctx, fx, fy + 1, 1, 2, C.grama2);
          ret(ctx, fx - 1, fy, 3, 1, cor);
          ret(ctx, fx, fy - 1, 1, 3, cor);
          ret(ctx, fx, fy, 1, 1, C.miolo);
        }
      }
    } else if (t === 'c') {
      topo = (x % 2) ? 3 : 0;
      ret(ctx, px, py, T, T, C.rua2);
      ret(ctx, px + 1, py + topo, 6, 13, C.rua);
      ret(ctx, px + 9, py + (3 - topo), 6, 13, C.rua);
      ret(ctx, px + 1, py + topo, 6, 1, C.rua3);
      ret(ctx, px + 9, py + (3 - topo), 6, 1, C.rua3);
    } else if (t === 'p') {
      ret(ctx, px, py, T, T, par ? C.praca2 : C.praca);
      ret(ctx, px, py + 15, T, 1, C.praca2);
      ret(ctx, px + 15, py, 1, T, C.praca2);
      ret(ctx, px, py, T, 1, par ? C.praca : C.praca3);
      ret(ctx, px, py, 1, T, par ? C.praca : C.praca3);
      ret(ctx, px + 7, py + 7, 2, 2, par ? C.praca : C.praca2);
    } else if (t === 'a') {
      ret(ctx, px, py, T, T, C.grama);
    }
  }

  function desenharArvore(ctx, x, y, r) {
    var px = x * T, py = y * T;
    var i = Math.floor(r() * COPAS.length);
    var copa = COPAS[i], buque = COPAS[(i + 1) % COPAS.length];
    ret(ctx, px + 6, py + 9, 4, 7, C.tronco);
    ret(ctx, px + 6, py + 9, 1, 7, '#8a604a');
    ret(ctx, px + 4, py + 15, 3, 1, C.tronco);
    ret(ctx, px + 9, py + 15, 3, 1, C.tronco);
    circulo(ctx, px + 8, py + 6, 7, C.contorno);
    circulo(ctx, px + 8, py + 6, 6, copa[1]);
    circulo(ctx, px + 6, py + 5, 4, copa[0]);
    circulo(ctx, px + 5, py + 3, 2, copa[2]);
    circulo(ctx, px + 12, py + 6, 3, C.contorno);
    circulo(ctx, px + 12, py + 6, 2, buque[1]);
    ret(ctx, px + 8, py, 1, 3, '#ffffff');
    ret(ctx, px + 7, py + 1, 3, 1, '#fff6a8');
  }
  function desenharFlor(ctx, x, y, r) {
    var px = x * T + 4 + Math.floor(r() * 7), py = y * T + 5 + Math.floor(r() * 5);
    var cor = FLORES[Math.floor(r() * FLORES.length)];
    var miolo = (cor === '#ffe066' || cor === '#ffffff') ? '#ff8a3d' : '#fff3a0';
    ret(ctx, px, py + 2, 1, 4, '#7ea832');
    ret(ctx, px - 2, py + 3, 2, 1, '#8fb83a'); ret(ctx, px + 1, py + 4, 2, 1, '#b6d24e');
    ret(ctx, px - 2, py, 5, 1, cor); ret(ctx, px, py - 2, 1, 5, cor);
    ret(ctx, px - 1, py - 1, 1, 1, cor); ret(ctx, px + 1, py - 1, 1, 1, cor);
    ret(ctx, px - 1, py + 1, 1, 1, cor); ret(ctx, px + 1, py + 1, 1, 1, cor);
    ret(ctx, px, py, 1, 1, miolo); ret(ctx, px + 3, py - 2, 1, 1, '#ffffff');
  }
  function desenharCristal(ctx, x, y) {
    var px = x * T, py = y * T;
    elipse(ctx, px + 8, py + 13, 5, 2, '#8fb83a');
    elipse(ctx, px + 8, py + 12, 3, 1, '#b6d24e');
    var larg = [2, 4, 6, 8, 8, 6, 4, 2];
    for (var j = 0; j < larg.length; j++) {
      var w = larg[j], x0 = px + 8 - w / 2;
      ret(ctx, x0 - 1, py + 4 + j, w + 2, 1, C.contorno);
      ret(ctx, x0, py + 4 + j, w / 2, 1, '#d8f2ff');
      ret(ctx, x0 + w / 2, py + 4 + j, w / 2, 1, j < 4 ? '#9fdcff' : '#6bb8ea');
      if (w > 2) ret(ctx, x0 + w - 1, py + 4 + j, 1, 1, '#7ed9c8');
    }
    ret(ctx, px + 7, py + 6, 1, 2, '#ffffff');
    ret(ctx, px + 11, py + 4, 1, 3, '#ffffff');
    ret(ctx, px + 10, py + 5, 3, 1, '#fff6a8');
  }
  function desenharArbusto(ctx, x, y) {
    var px = x * T, py = y * T;
    var cor = ['#ff8a3d', '#ffb15a', '#7ed9c8'][(x + y) % 3];
    elipse(ctx, px + 8, py + 10, 7, 5, C.contorno);
    elipse(ctx, px + 8, py + 10, 6, 4, '#a8cc48');
    elipse(ctx, px + 6, py + 9, 3, 2, '#d4ee78');
    elipse(ctx, px + 12, py + 12, 2, 2, '#8fb83a');
    ret(ctx, px + 4, py + 9, 3, 1, cor); ret(ctx, px + 5, py + 8, 1, 3, cor); ret(ctx, px + 5, py + 9, 1, 1, '#ffffff');
    ret(ctx, px + 10, py + 11, 3, 1, '#ffe066'); ret(ctx, px + 11, py + 10, 1, 3, '#ffe066'); ret(ctx, px + 11, py + 11, 1, 1, '#ffffff');
  }
  function desenharCogumelo(ctx, x, y) {
    var sorte = rng(x * 89 + y * 47 + 13);
    var px = x * T + 4 + Math.floor(sorte() * 5);
    var py = y * T + 5 + Math.floor(sorte() * 4);
    var rosa = sorte() < 0.7;
    var chapeu = rosa ? '#ff8a3d' : '#f0a04a';
    var barra = rosa ? '#e07028' : '#d9842f';
    ret(ctx, px, py + 6, 5, 1, C.grama2);
    ret(ctx, px + 1, py + 3, 3, 4, '#fff6ea');
    ret(ctx, px + 3, py + 3, 1, 4, '#e7d4b8');
    circulo(ctx, px + 2, py + 2, 3, C.contorno);
    circulo(ctx, px + 2, py + 1, 3, chapeu);
    ret(ctx, px, py + 2, 5, 1, barra);
    ret(ctx, px + 1, py, 1, 1, '#ffffff');
    ret(ctx, px + 3, py + 1, 1, 1, '#ffffff');
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
    // (js/interiores/petshop.js e observatorio-cenas.js registram Mapa.PREDIOS.petshop/observatorio)
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

  var LAGO = { cx: 18, cy: 24.6, rx: 6.5, ry: 2.4 };
  // a água como desenhada (a elipse de desenharLago), em px do jogo
  var ESPELHO = { cx: Math.round(LAGO.cx * T), cy: Math.round(LAGO.cy * T), rx: Math.round(LAGO.rx * T), ry: Math.round(LAGO.ry * T) };
  // quantos px o ponto (wx, wy) está para dentro da água desenhada (negativo = fora, na margem).
  // É o que decide onde fica a linha d'água dos sprites: casa com o desenho do lago, e não com a
  // grade de tiles (nas pontas da elipse, o tile é água mas o desenho já é areia).
  Mapa.fundura = function (wx, wy) {
    var dx = wx - ESPELHO.cx, dy = wy - ESPELHO.cy;
    var ax = dx / (ESPELHO.rx * ESPELHO.rx), ay = dy / (ESPELHO.ry * ESPELHO.ry);
    var f = dx * ax + dy * ay;                           // 1 = na borda da água
    var grad = 2 * Math.sqrt(ax * ax + ay * ay);
    return (1 - f) / Math.max(grad, 1e-6);               // distância aproximada até a borda
  };
  function hasteJunco(ctx, x, y, h) {
    ret(ctx, x, y, 1, h, '#2f7a48');
    ret(ctx, x, y, 1, 2, '#8fb83a');
  }
  function desenharLago(ctx) {
    var cx = Math.round(LAGO.cx * T), cy = Math.round(LAGO.cy * T);
    var rx = Math.round(LAGO.rx * T), ry = Math.round(LAGO.ry * T);
    elipse(ctx, cx, cy, rx + 4, ry + 4, C.margem);
    elipse(ctx, cx, cy, rx + 1, ry + 1, '#e8d090');
    elipse(ctx, cx, cy, rx, ry, C.agua);
    elipse(ctx, cx, cy + 1, rx - 20, ry - 12, C.agua3);
    elipse(ctx, cx, cy + 3, 48, 13, '#2a7f78');
    elipse(ctx, cx - 2, cy - 4, 16, 3, C.agua2);
    [[192, 386, 10, '#ffffff'], [194, 400, 8, C.agua2], [376, 388, 12, C.agua2], [374, 400, 14, '#ffffff']].forEach(function (s) {
      ret(ctx, s[0], s[1], s[2], 1, s[3]);
    });
    [[286, 353], [180, 392], [393, 400], [286, 433], [338, 357], [228, 427]].forEach(function (p) {
      ret(ctx, p[0], p[1], 2, 1, C.margem);
      ret(ctx, p[0], p[1] + 1, 2, 1, '#cbb892');
    });
    [[-60, -8, 6, 3, '#ff8a3d'], [-40, 12, 5, 3, '#ffe066'], [52, 4, 7, 3, null], [70, -10, 5, 2, '#ff8a3d']].forEach(function (v) {
      elipse(ctx, cx + v[0] + 1, cy + v[1] + 1, v[2], v[3], '#2a7f78');
      elipse(ctx, cx + v[0], cy + v[1], v[2], v[3], '#8fb83a');
      elipse(ctx, cx + v[0] - 1, cy + v[1] - 1, Math.max(2, v[2] - 2), 1, '#b6d24e');
      ret(ctx, cx + v[0], cy + v[1], Math.max(2, v[2] - 1), 1, C.agua3);
      if (v[4]) {
        ret(ctx, cx + v[0] + 2, cy + v[1] - 2, 2, 2, v[4]);
        ret(ctx, cx + v[0] + 2, cy + v[1] - 2, 1, 1, '#fff6a8');
      }
    });
    [[236, 350, 8], [238, 347, 10], [241, 352, 6],
      [328, 349, 8], [331, 346, 11], [334, 351, 6],
      [184, 388, 7], [182, 386, 9], [186, 390, 6],
      [390, 388, 7], [392, 385, 10], [388, 391, 5],
      [256, 426, 7], [258, 423, 9], [261, 428, 6],
      [336, 422, 8], [338, 420, 10], [341, 424, 6]].forEach(function (h) { hasteJunco(ctx, h[0], h[1], h[2]); });
  }

  function desenharFonte(ctx) {
    var cx = 18 * T, cy = 14 * T;
    elipse(ctx, cx, cy + 2, 15, 11, C.contorno);
    elipse(ctx, cx, cy + 2, 14, 10, '#f3e6c8');
    elipse(ctx, cx, cy + 2, 12, 8, '#e4d0a4');
    elipse(ctx, cx, cy + 2, 11, 7, C.agua);
    elipse(ctx, cx, cy + 3, 8, 4, C.agua3);
    elipse(ctx, cx, cy + 4, 4, 2, '#2a7f78');
    elipse(ctx, cx - 2, cy, 4, 1, C.agua2);
    [[12, 1], [9, 8], [-1, 10], [-11, 8], [-14, 1], [9, -4], [-11, -4]].forEach(function (p) {
      ret(ctx, cx + p[0], cy + p[1], 2, 1, '#fff8e8');
      ret(ctx, cx + p[0], cy + p[1] + 1, 2, 1, '#cfc4e2');
    });
    ret(ctx, cx - 2, cy - 10, 4, 12, C.contorno); ret(ctx, cx - 1, cy - 10, 2, 12, '#ffffff');
    elipse(ctx, cx, cy - 10, 5, 2, C.contorno); elipse(ctx, cx, cy - 10, 4, 1, '#f3e6c8');
  }

  function sombraBase(ctx, px, py, w, h) {
    elipse(ctx, px + w / 2, py + h - 1, Math.round(w * 0.38), 3, 'rgba(58,36,70,0.10)');
    elipse(ctx, px + w / 2, py + h - 1, Math.round(w * 0.30), 1, 'rgba(58,36,70,0.18)');
  }

  Mapa.prerender = function () {
    // mais BORDA_BAIXO fileiras de grama depois do fim do mapa: a câmera passa da borda de baixo para
    // o menu não esconder a última fileira, e ali aparecia grama lisa, sem os tufinhos
    var c = PA.novoCanvas(W * T, (H + BORDA_BAIXO) * T);
    var ctx = c.getContext('2d');
    var r = rng(777);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) desenharChao(ctx, x, y, r);
    for (var yb = H; yb < H + BORDA_BAIXO; yb++) for (var xb = 0; xb < W; xb++) desenharChao(ctx, xb, yb, r, 'g');
    var r2 = rng(4242);
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      var d = decor[y2][x2];
      if (d === 'flor') desenharFlor(ctx, x2, y2, r2);
      else if (d === 'cristal') desenharCristal(ctx, x2, y2);
      else if (d === 'arbusto') desenharArbusto(ctx, x2, y2);
      else if (d === 'cogumelo') desenharCogumelo(ctx, x2, y2);
    }
    desenharLago(ctx);
    desenharFonte(ctx);
    // prédios e árvores em ordem de cima para baixo
    var itens = [];
    lugares.forEach(function (l) { itens.push({ y: l.rect.y + l.rect.h, f: function () {
      var fn = PREDIOS[l.sprite] || PREDIOS.torre;
      sombraBase(ctx, l.rect.x * T, l.rect.y * T, l.rect.w * T, l.rect.h * T);
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
        if (Mapa.agua(Math.floor(ax / T), Math.floor(ay / T)) && fase < 0.5) {
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
        var fio = ((t / 700) + g / 4) % 1;
        ctx.fillStyle = fio < 0.75 ? '#bfe7ff' : '#ffffff';
        ctx.fillRect(287 + (g % 2), Math.round(210 + fio * 14), 1, 2);
      }
      var anel = (t / 700) % 1;
      var meio = 2 + Math.round(anel * 7);
      var alfa = (0.85 * (1 - anel)).toFixed(2);
      ctx.fillStyle = anel < 0.5 ? 'rgba(255,255,255,' + alfa + ')' : 'rgba(217,255,244,' + alfa + ')';
      ctx.fillRect(18 * T - meio, 14 * T + 1, meio * 2, 1);
      ctx.fillRect(18 * T - meio, 14 * T + 2, meio * 2, 1);
      ctx.fillRect(18 * T - meio, 14 * T + 3, meio * 2, 1);
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
