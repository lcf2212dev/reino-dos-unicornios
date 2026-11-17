/* Os portais novos dentro do Bosque dos Fantasmas (pedido do Leandro, 11/11/2026; docs/contratos/arenas.md §8): cada
   um leva a um bosque-arena novo, com monstros mais fortes e o seu nível recomendado. Um portal = o redemoinho de
   TODO portal (Reino.Portal.vortice, com os tons da floresta), a placa de madeira "Nv N", a escada `portal` que
   viaja e o portal de volta dentro da floresta (as mesmas cores).
   A floresta nova registra o interior dela e chama B.portalNovo(B.PORTAIS.<id>). Aí este arquivo:
     - registra os objetos 'bosque-portal-<id>' (não sólido), 'bosque-placa-<id>' (sólido, "Nv N") e
       '<id>-portal-volta' (1×1; a floresta põe em (28,40));
     - tira do Bosque o que estiver no lugar do portal, da placa e da trilha nova (o layout já foi sorteado em bosque.js);
     - põe o portal, a placa e os enfeites;
     - emenda a trilha de terra até o portal (B.trilha: o piso do Bosque já desenha a terra por cima);
     - põe a escada do portal no Bosque (a de volta vem no registrarInterior da floresta; a chegada é ao lado);
     - preenche com miudezas toda janela 3×3 que ficar vazia em volta (a regra do "rico", interiores.md §7).
   node: true; no carregamento só registra objetos e funções (nada de DOM nem canvas). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = R.Desenho, ret = D.ret, K = D.K, C = D.C;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  var T = 16;

  /* ---------- a placa do nível: fonte de 3 × 5 pixels, escala 2 ---------- */
  var GLIFOS = {
    N: ['#.#', '###', '###', '#.#', '#.#'],
    v: ['...', '...', '#.#', '#.#', '.#.'],
    ' ': ['...', '...', '...', '...', '...'],
    0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['###', '..#', '###', '#..', '###'], 3: ['###', '..#', '###', '..#', '###'],
    4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '###', '..#', '###'],
    6: ['###', '#..', '###', '#.#', '###'], 7: ['###', '..#', '..#', '..#', '..#'],
    8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '###'],
  };
  function textoPequeno(ctx, s, x, y, cor) {
    for (var i = 0; i < s.length; i++) {
      var g = GLIFOS[s.charAt(i)] || GLIFOS[' '];
      for (var l = 0; l < 5; l++) for (var c = 0; c < 3; c++) if (g[l].charAt(c) === '#') ret(ctx, x + i * 8 + c * 2, y + l * 2, 2, 2, cor);
    }
  }
  // a placa de madeira presa em dois esteios: "Nv N" na tábua (3 × 1 tiles)
  function placa(ctx, px, py, nivel) {
    var madeira = '#c98a4b', escura = '#8a5a34', luz = '#e8b27a';
    ret(ctx, px + 7, py - 10, 3, 24, K); ret(ctx, px + 8, py - 10, 1, 23, madeira);
    ret(ctx, px + 38, py - 10, 3, 24, K); ret(ctx, px + 39, py - 10, 1, 23, madeira);
    ret(ctx, px + 1, py - 28, 46, 20, K);
    ret(ctx, px + 2, py - 27, 44, 18, escura);
    ret(ctx, px + 2, py - 27, 44, 1, luz);
    ret(ctx, px + 2, py - 10, 44, 1, '#5a3a24');
    ret(ctx, px + 4, py - 26, 1, 1, C.creme); ret(ctx, px + 43, py - 26, 1, 1, C.creme);
    textoPequeno(ctx, 'Nv ' + nivel, px + 5, py - 23, '#fff4d8');
  }

  /* ---------- o redemoinho no meio de um objeto de w × h tiles ---------- */
  function centro(o) { return { x: o.w * T / 2, y: o.h * T - 12 }; }
  function objetoPortal(tipo, w, h, tons) {
    var c = centro({ w: w, h: h });
    I.objeto(tipo, { w: w, h: h, solido: false, semSombra: true,
      desenhar: function (ctx, px, py) { R.Portal.vortice(ctx, px + c.x, py + c.y, tons, 0); },
      anim: function (ctx, px, py, t) {
        R.Portal.vortice(ctx, px + c.x, py + c.y, tons, Math.floor(t / 160) % 6);
        R.Portal.brilho(ctx, px + c.x, py + c.y, t);
      } });
  }

  /* ---------- as três florestas: onde fica cada portal no Bosque e as cores dele ---------- */
  var PORTAIS = {
    // o mais fácil (Nv 25), embaixo à esquerda, no fim de uma trilha que sai da clareira da entrada
    orvalho: {
      id: 'orvalho', nome: 'Bosque do Orvalho', nivel: 25, semente: 11,
      tons: ['#0f5a52', '#1f8a6a', '#45c0a0', '#b8f4d8'],
      lugar: { x: 9, y: 38, w: 2, h: 3 }, gatilho: { x: 9, y: 40 }, chegar: { x: -1, y: 0 },
      placa: { x: 5, y: 37 }, limpa: { x0: 4, x1: 15, y0: 33, y1: 40 },
      trilha: [[28, 33], [20, 34], [14, 37], [10, 39]],
      enfeites: [['bosque-lanterna', 13, 36], ['bosque-poca', 6, 39], ['bosque-cogumelos', 12, 34]],
    },
    // o do meio (Nv 30), na borda direita, abaixo do portal da Vila Arco-Íris
    neblina: {
      id: 'neblina', nome: 'Bosque da Neblina', nivel: 30, semente: 23,
      tons: ['#332a52', '#5a4f8a', '#8f84c0', '#d8d0f0'],
      lugar: { x: 53, y: 30, w: 2, h: 3 }, gatilho: { x: 53, y: 32 }, chegar: { x: -1, y: 0 },
      placa: { x: 49, y: 29 }, limpa: { x0: 47, x1: 54, y0: 26, y1: 34 },
      trilha: [[46, 33], [51, 32]],
      enfeites: [['bosque-lanterna', 49, 26], ['bosque-poca', 48, 33]],
    },
    // o mais difícil (Nv 35), no alto, no fim da trilha principal
    lua: {
      id: 'lua', nome: 'Bosque da Lua Cheia', nivel: 35, semente: 37,
      tons: ['#16264f', '#2f4a8f', '#6f94d8', '#dcecff'],
      lugar: { x: 27, y: 3, w: 3, h: 3 }, gatilho: { x: 27, y: 5 }, chegar: { x: 0, y: 1 },
      placa: { x: 31, y: 4 }, limpa: { x0: 22, x1: 35, y0: 2, y1: 9 },
      trilha: [],
      enfeites: [['bosque-lanterna', 34, 7], ['bosque-poca', 23, 4]],
    },
  };

  /* ---------- o desenho do portal no Bosque, o da placa e o de volta (registrados na carga) ---------- */
  Object.keys(PORTAIS).forEach(function (k) {
    var op = PORTAIS[k];
    objetoPortal('bosque-portal-' + op.id, op.lugar.w, op.lugar.h, op.tons);
    I.objeto('bosque-placa-' + op.id, { w: 3, h: 1, solido: true, alto: true, topo: 28,
      desenhar: function (ctx, px, py) { placa(ctx, px, py, op.nivel); } });
    var volta = R.Portal.criar({ tons: op.tons });
    I.objeto(op.id + '-portal-volta', { w: 1, h: 1, solido: false, semSombra: true,
      desenhar: function (ctx, px, py) { volta.desenhar(ctx, px, py); },
      anim: function (ctx, px, py, t) { volta.animar(ctx, px, py, 16, 16, t); } });
  });

  /* ---------- as trilhas novas emendadas no piso do Bosque ---------- */
  var _trechos = null;
  function marcarTrilha(pts) {
    var m = {};
    function t(x, y) { m[x + ',' + y] = 1; }
    for (var s = 0; s < pts.length - 1; s++) {
      var a = pts[s], b = pts[s + 1], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 2;
      for (var i = 0; i <= n; i++) {
        var f = i / n, x = Math.round(a[0] + (b[0] - a[0]) * f), y = Math.round(a[1] + (b[1] - a[1]) * f);
        t(x, y); t(x + 1, y); t(x, y + 1); t(x + 1, y + 1);
      }
    }
    return m;
  }
  function trilhasNovas() {
    var m = {};
    Object.keys(PORTAIS).forEach(function (k) { var t = marcarTrilha(PORTAIS[k].trilha); Object.keys(t).forEach(function (q) { m[q] = 1; }); });
    return m;
  }
  var _baseTrilha = B.trilha;
  B.trilha = function (tx, ty) {
    if (_baseTrilha && _baseTrilha(tx, ty)) return true;
    if (!_trechos) _trechos = trilhasNovas();
    return !!_trechos[tx + ',' + ty];
  };

  /* ---------- ocupação e preenchimento ---------- */
  function dim(tipo) { var l = I.OBJETOS[tipo] || {}; return { w: l.w || 1, h: l.h || 1 }; }
  function ocupados(b) {
    var m = {};
    b.objetos.forEach(function (o) {
      var d = dim(o.tipo);
      for (var j = 0; j < d.h; j++) for (var i = 0; i < d.w; i++) m[(o.x + i) + ',' + (o.y + j)] = 1;
    });
    return m;
  }
  // as miudezas que preenchem as janelas 3×3 vazias (todas não sólidas, como no bosque.js)
  var MIUDOS = ['bosque-mato', 'bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-samambaia',
    'bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes'];
  function preencher(b, area, semente) {
    var occ = ocupados(b), esc = {};
    (b.escadas || []).forEach(function (e) { esc[e.x + ',' + e.y] = 1; });
    var saida = b.saida || {};
    function podePisar(x, y) { return x >= 1 && x <= 54 && y >= 3 && y <= 40 && !(x === saida.x && y === saida.y) && !esc[x + ',' + y]; }
    function toca(x, y) { for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) if (area[(x + i) + ',' + (y + j)]) return true; return false; }
    for (var y = 3; y + 3 <= 41; y++) for (var x = 1; x + 3 <= 55; x++) {
      if (!toca(x, y)) continue;
      var vazia = true, i, j;
      for (j = 0; j < 3 && vazia; j++) for (i = 0; i < 3; i++) if (occ[(x + i) + ',' + (y + j)]) { vazia = false; break; }
      if (!vazia) continue;
      var c = null;
      for (var k = 0; k < 9 && !c; k++) { var tx = x + (k % 3), ty = y + Math.floor(k / 3); if (podePisar(tx, ty)) c = { x: tx, y: ty }; }
      if (!c) continue;
      var tipo = B.trilha(c.x, c.y) ? 'bosque-pedrinhas' : MIUDOS[(c.x * 7 + c.y * 13 + semente) % MIUDOS.length];
      var o = { tipo: tipo, x: c.x, y: c.y };
      if (tipo === 'bosque-flores' || tipo === 'bosque-cogumelos' || tipo === 'bosque-flor-brilho') o.var = { n: (c.x + c.y) % 5 };
      b.objetos.push(o);
      occ[c.x + ',' + c.y] = 1;
    }
  }

  /* ---------- a montagem do portal no Bosque (chamada pela floresta, depois do registrarInterior) ---------- */
  function portalNovo(op) {
    var b = I.def('bosque'), i;
    if (!b || !op || !PORTAIS[op.id] || (b.__portais = b.__portais || {})[op.id]) return false;
    b.__portais[op.id] = 1;
    var trilha = marcarTrilha(op.trilha), limpa = op.limpa, proibido = {};
    Object.keys(trilha).forEach(function (q) { proibido[q] = 1; });
    for (var y = limpa.y0; y <= limpa.y1; y++) for (var x = limpa.x0; x <= limpa.x1; x++) proibido[x + ',' + y] = 1;
    // 1. tira o que estava no lugar (o layout do Bosque já tinha sorteado tudo)
    b.objetos = b.objetos.filter(function (o) {
      var d = dim(o.tipo);
      for (var j = 0; j < d.h; j++) for (var i2 = 0; i2 < d.w; i2++) if (proibido[(o.x + i2) + ',' + (o.y + j)]) return false;
      return true;
    });
    // 2. o portal, a placa e os enfeites (só num tile livre, fora da trilha e da escada)
    var esc = {};
    (b.escadas || []).forEach(function (e) { esc[e.x + ',' + e.y] = 1; });
    function livre(tipo, x, y) {
      var d = dim(tipo);
      for (var j = 0; j < d.h; j++) for (var i2 = 0; i2 < d.w; i2++) {
        if (proibido[(x + i2) + ',' + (y + j)] || esc[(x + i2) + ',' + (y + j)]) return false;
        if (x + i2 < 1 || x + i2 > 54 || y + j < 3 || y + j > 40) return false;
      }
      return true;
    }
    b.objetos.push({ tipo: 'bosque-portal-' + op.id, x: op.lugar.x, y: op.lugar.y });
    b.objetos.push({ tipo: 'bosque-placa-' + op.id, x: op.placa.x, y: op.placa.y });
    (op.enfeites || []).forEach(function (e) { if (livre(e[0], e[1], e[2])) b.objetos.push({ tipo: e[0], x: e[1], y: e[2] }); });
    // 3. a escada do portal no Bosque (a de volta vem no registrarInterior da floresta)
    b.escadas.push({ x: op.gatilho.x, y: op.gatilho.y, para: op.id, sentido: 'portal', seta: false, chegar: op.chegar });
    // 4. as miudezas nas janelas que abriram e a trilha nova (o piso já desenha a terra)
    preencher(b, proibido, op.semente);
    _trechos = null;
    return true;
  }

  B.PORTAIS = PORTAIS;
  B.portalNovo = portalNovo;
})();
