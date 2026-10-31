/* Interiores: a grade de tiles de um interior (pura: sem DOM) e o caminho nela.
   Veio de motor/interiores.js. Registra em Reino._interiores: libDe, dimensoes, solidoDe, ehParede,
   ehAlto, interativo, objetosDe, grade, caminhoNa. */
(function () {
  var R = window.Reino;
  var II = R._interiores, OBJETOS = II.OBJETOS;

  /* ================= GRADE (pura: sem DOM) ================= */
  function libDe(o) { return OBJETOS[o.tipo] || {}; }
  function dimensoes(o) {
    var lib = libDe(o);
    return { w: o.w || lib.w || 1, h: o.h || lib.h || 1, topo: o.topo !== undefined ? o.topo : (lib.topo || 0) };
  }
  function solidoDe(o) {
    var lib = libDe(o);
    var s = o.solido !== undefined ? o.solido : (lib.solido !== undefined ? lib.solido : 'base');
    return s;
  }
  function ehParede(o) { return o.parede !== undefined ? !!o.parede : !!libDe(o).parede; }
  function ehAlto(o) { return o.alto !== undefined ? !!o.alto : !!libDe(o).alto; }
  function interativo(o) { return !!(o.fala || o.acao); }
  function noRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  // os objetos do interior: os fixos e, no decorável, os extras de agora (casa.md §4). Extra que lança erro ou não
  // devolve lista vira [] (a cena não cai); sem objetosExtras, a própria lista fixa (nada a mais para os outros)
  function objetosDe(def) {
    var fixos = def.objetos || [];
    if (typeof def.objetosExtras !== 'function') return fixos;
    var extras = null;
    try { extras = def.objetosExtras(II.progresso()); } catch (e) { if (typeof console !== 'undefined') console.warn('objetosExtras de ' + def.id + ' falhou:', e); }
    return Array.isArray(extras) && extras.length ? fixos.concat(extras) : fixos;
  }

  // objetos: a lista já montada (a cena passa a mesma que desenha, para os índices baterem); padrão objetosDe(def)
  function grade(def, objetos) {
    var W = def.tamanho.w, H = def.tamanho.h;
    function matriz2(v) { var m = []; for (var y = 0; y < H; y++) { m.push([]); for (var x = 0; x < W; x++) m[y].push(v); } return m; }
    var g = { w: W, h: H, solido: matriz2(true), chao: matriz2(false), comodo: matriz2(null), parede: matriz2(false),
      porta: matriz2(false), ocupado: matriz2(null), objeto: matriz2(null) };
    function dentro(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    g.dentro = dentro;
    (def.comodos || []).forEach(function (c) {
      var r = c.rect;
      for (var y = r.y; y < r.y + r.h; y++) for (var x = r.x; x < r.x + r.w; x++) {
        if (!dentro(x, y)) continue;
        g.comodo[y][x] = c.id;
        if (y < r.y + 2) { g.parede[y][x] = true; g.solido[y][x] = true; g.chao[y][x] = false; }
        else { g.chao[y][x] = true; g.solido[y][x] = false; }
      }
    });
    (def.portas || []).forEach(function (p) {
      for (var y = p.y; y < p.y + (p.h || 1); y++) for (var x = p.x; x < p.x + (p.w || 1); x++) {
        if (!dentro(x, y)) continue;
        g.porta[y][x] = true; g.solido[y][x] = false; g.chao[y][x] = true;
      }
    });
    (objetos || objetosDe(def)).forEach(function (o, i) {
      var d = dimensoes(o), s = solidoDe(o), parede = ehParede(o);
      for (var y = o.y; y < o.y + d.h; y++) for (var x = o.x; x < o.x + d.w; x++) {
        if (!dentro(x, y)) continue;
        if (g.objeto[y][x] === null || !parede) g.objeto[y][x] = i;
        if (!parede && g.ocupado[y][x] === null) g.ocupado[y][x] = 'objeto';
        if (parede) continue;
        if (s === true || (s === 'base' && y === o.y + d.h - 1)) g.solido[y][x] = true;
      }
    });
    (def.npcs || []).forEach(function (n) { if (dentro(n.x, n.y)) { g.solido[n.y][n.x] = true; g.ocupado[n.y][n.x] = 'npc'; } });
    function andavel(p, marca) { if (p && dentro(p.x, p.y)) { g.solido[p.y][p.x] = false; if (marca) g.ocupado[p.y][p.x] = marca; } }
    andavel(def.saida, 'saida');
    andavel(def.spawn);
    (def.escadas || []).forEach(function (e) { andavel(e, 'escada'); });
    return g;
  }

  /* ================= CAMINHO (igual ao Mapa.caminho: 8 direções sem cortar quina) ================= */
  var VIZINHOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  function caminhoNa(g, a, b) {
    var W = g.w, H = g.h;
    function sol(x, y) { return x < 0 || y < 0 || x >= W || y >= H || g.solido[y][x]; }
    if (!a || !b || b.x < 0 || b.y < 0 || b.x >= W || b.y >= H) return null;
    var custo = {}, veio = {}, fechado = {};
    var ini = a.y * W + a.x, fim = b.y * W + b.x;
    custo[ini] = 0; veio[ini] = -1;
    var abertos = [ini];
    while (abertos.length) {
      var mi = 0;
      for (var i = 1; i < abertos.length; i++) if (custo[abertos[i]] < custo[abertos[mi]]) mi = i;
      var k = abertos[mi];
      abertos[mi] = abertos[abertos.length - 1]; abertos.pop();
      if (fechado[k]) continue;
      fechado[k] = true;
      if (k === fim) break;
      var cx = k % W, cy = Math.floor(k / W);
      for (var v = 0; v < 8; v++) {
        var d = VIZINHOS[v], nx = cx + d[0], ny = cy + d[1];
        if (sol(nx, ny)) continue;
        if (d[0] && d[1] && (sol(nx, cy) || sol(cx, ny))) continue;
        var nk = ny * W + nx, c = custo[k] + d[2];
        if (fechado[nk] || (nk in custo && custo[nk] <= c)) continue;
        custo[nk] = c; veio[nk] = k;
        abertos.push(nk);
      }
    }
    if (!fechado[fim]) return null;
    var cam = [], k2 = fim;
    while (veio[k2] !== -1) { cam.unshift({ x: k2 % W, y: Math.floor(k2 / W) }); k2 = veio[k2]; }
    cam.custo = custo[fim];
    return cam;
  }

  II.libDe = libDe; II.dimensoes = dimensoes; II.solidoDe = solidoDe; II.ehParede = ehParede;
  II.ehAlto = ehAlto; II.interativo = interativo; II.objetosDe = objetosDe; II.grade = grade; II.caminhoNa = caminhoNa;
})();
