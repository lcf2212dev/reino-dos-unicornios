/* O Reino visto de cima: grade de tiles, lugares, caminhos (este arquivo) e o desenho em pixel art
   (mundo/mapa-desenho.js, mundo/lago.js, mundo/predios.js). Os lugares fixos são dados em
   mundo/lugares.js; os das matérias vêm de Reino.materias. Este é o primeiro arquivo de mundo/:
   cria window.Mapa e o Mapa._interno que as outras partes usam. */
(function () {
  var T = 16;               // tamanho do tile em pixels
  var W = 36, H = 28;       // tamanho do mapa em tiles
  var Mapa = { T: T, W: W, H: H };
  Mapa.claudeTile = { x: 20, y: 12 };
  // gerador pseudoaleatório com semente (o reino sai sempre igual): o de Reino.Desenho
  var rng = window.Reino.Desenho.rng;

  /* Estado e ajudantes compartilhados entre os arquivos de mundo/ (não é API do jogo).
     Mapa.criar troca as grades e a lista de lugares a cada chamada: leia sempre I.tipo etc. na hora
     de usar, nunca guarde a grade numa variável que dure mais que uma chamada. */
  var I = Mapa._interno = {
    tipo: [],               // letra do chão
    solido: [],             // true = não dá para andar
    decor: [],              // enfeite do tile: 'arvore', 'flor', 'cristal', 'arbusto', 'cogumelo'
    lugares: [],            // o que Mapa.lugares() devolve
    estatico: null,         // canvas com tudo o que não se mexe (mundo/mapa-desenho.js)
    rng: rng,
    dentro: dentro,
    noRect: noRect,
  };

  function dentro(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  function noRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function porta(r) { return { x: r.x + Math.floor(r.w / 2), y: r.y + r.h - 1 }; }

  Mapa.criar = function (materias) {
    var tipo = I.tipo = [], solido = I.solido = [], decor = I.decor = [], lugares = I.lugares = [];
    for (var y = 0; y < H; y++) {
      tipo.push([]); solido.push([]); decor.push([]);
      for (var x = 0; x < W; x++) { tipo[y].push('g'); solido[y].push(false); decor[y].push(null); }
    }
    // lugares: fixos (os sem `caminho` da lista de mundo/lugares.js) + um por matéria
    Mapa.LUGARES_FIXOS.forEach(function (f) { if (!f.caminho) lugares.push(Object.assign({ tipo: f.id, porta: porta(f.rect) }, f)); });
    // matéria com lugar.porCima entra depois do sorteio dos enfeites (como os lugares com caminho), para as árvores
    // e flores do resto do reino continuarem iguais: o sorteio ainda vê a clareira livre
    var porCima = [];
    materias.forEach(function (m, i) {
      var r = m.lugar.rect || Mapa.CLAREIRAS[i % Mapa.CLAREIRAS.length];
      var l = { id: 'materia:' + m.id, tipo: 'materia', materiaId: m.id, nome: m.lugar.nome,
        sprite: m.lugar.sprite || 'torre', cores: m.lugar.cores, rect: r, porta: porta(r), placa: m.lugar.placa };
      if (m.lugar.porCima) porCima.push(l); else lugares.push(l);
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
    solido[Mapa.claudeTile.y][Mapa.claudeTile.x] = true;

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
    porCima.forEach(function (l) {
      lugares.push(l);
      var r = l.rect, p = l.porta;
      for (var yy = r.y; yy < r.y + r.h; yy++) for (var xx = r.x; xx < r.x + r.w; xx++) {
        decor[yy][xx] = null;
        tipo[yy][xx] = 'g';
        solido[yy][xx] = !(xx === p.x && yy === p.y);
      }
      // da porta até a rua (a mesma ligação dos outros lugares)
      var rua = p.y < 9 ? 9 : 20;
      for (var cy = p.y + 1; cy < rua; cy++) { decor[cy][p.x] = null; tipo[cy][p.x] = 'c'; solido[cy][p.x] = false; }
    });
    // os que têm `caminho` chegaram depois: por cima do reino já enfeitado
    Mapa.LUGARES_FIXOS.forEach(function (f) {
      if (!f.caminho) return;
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
    I.estatico = null;
  };

  Mapa.lugares = function () { return I.lugares; };
  Mapa.lugar = function (id) { return I.lugares.find(function (l) { return l.id === id; }); };
  Mapa.solido = function (x, y) { return !dentro(x, y) || I.solido[y][x]; };
  Mapa.lugarNoTile = function (x, y) { return I.lugares.find(function (l) { return noRect(x, y, l.rect); }); };
  Mapa.portaEm = function (x, y) { return I.lugares.find(function (l) { return l.porta.x === x && l.porta.y === y; }); };
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
    if (I.tipo[b.y][b.x] !== 'a') {
      var seco = buscar(a, b, true);
      if (seco) return seco;
    }
    return buscar(a, b, false);
  };
  function buscar(a, b, semAgua) {
    var tipo = I.tipo, solido = I.solido;
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
    var solido = I.solido;
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

  window.Mapa = Mapa;
})();
