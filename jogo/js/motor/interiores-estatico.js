/* Interiores: desenho do estático (paredes, pisos, sombras, lábios, escadas, saída e os móveis
   baixos, pré-renderizados num canvas) e as setas animadas da saída e das escadas.
   Veio de motor/interiores.js. Registra em Reino._interiores: paletaComodo, comodoDoTile,
   desenharEstatico, setaSaida, setaEscada. Só roda quando chamado (nada de DOM no carregamento). */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, elipse = D.elipse, matriz = D.matriz, misturar = D.misturar, escurecer = D.escurecer, clarear = D.clarear;
  var II = R._interiores, T = II.T, FUNDO = II.FUNDO, PISOS = II.PISOS, PAREDES = II.PAREDES;

  /* ================= DESENHO DO ESTÁTICO ================= */
  function paletaComodo(c) {
    var piso = PISOS[c.piso] || PISOS.taco, parede = PAREDES[c.parede] || PAREDES.papel;
    var p = Object.assign({ piso2: undefined }, parede.cores, piso.cores, c.paleta || {});
    if (!p.rodape) p.rodape = C.madeira;
    return { piso: piso, parede: parede, p: p };
  }
  function comodoPorId(def, id) { return (def.comodos || []).find(function (c) { return c.id === id; }); }
  // dono visual de um tile de porta/vão: o cômodo que o contém ou o primeiro vizinho
  function comodoDoTile(def, g, x, y) {
    if (g.dentro(x, y) && g.comodo[y][x]) return comodoPorId(def, g.comodo[y][x]);
    var viz = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (var i = 0; i < viz.length; i++) {
      var nx = x + viz[i][0], ny = y + viz[i][1];
      if (g.dentro(nx, ny) && g.comodo[ny][nx] && !g.parede[ny][nx]) return comodoPorId(def, g.comodo[ny][nx]);
    }
    return (def.comodos || [])[0];
  }

  function desenharEscada(ctx, g, e) {
    var px = e.x * T, py = e.y * T;
    if (e.sentido !== 'desce') {
      // sobe: degraus que entram por um arco na parede do fundo (ou só no tile, longe da parede)
      var subeParede = g.dentro(e.x, e.y - 1) && g.parede[e.y - 1][e.x];
      var topo = subeParede ? py - 26 : py - 6;
      ret(ctx, px, topo, 16, py + 16 - topo, K);
      ret(ctx, px + 1, topo + 1, 14, 10, '#4a3358');
      elipse(ctx, px + 8, topo + 2, 6, 3, '#5d4470');
      var y = py + 15, n = 0;
      while (y > topo + 6) {
        var frac = Math.min(1, (py + 15 - y) / (py + 15 - topo));
        var tread = misturar('#f8dcae', '#a07a8a', frac * 0.9), riser = escurecer(tread, 0.28);
        var enc = Math.round(frac * 2);
        ret(ctx, px + 2 + enc, y - 1, 12 - enc * 2, 1, riser);
        ret(ctx, px + 2 + enc, y - 3, 12 - enc * 2, 2, tread);
        ret(ctx, px + 2 + enc, y - 3, 12 - enc * 2, 1, clarear(tread, 0.35));
        y -= 3; n++;
      }
      // laterais (corrimão) com a pontinha dourada
      ret(ctx, px, topo + 8, 2, py + 8 - topo, C.madeira); ret(ctx, px + 14, topo + 8, 2, py + 8 - topo, C.madeira);
      ret(ctx, px, topo + 8, 1, py + 8 - topo, C.madeiraClara); ret(ctx, px + 15, topo + 8, 1, py + 8 - topo, C.madeira3);
      ret(ctx, px - 1, py + 12, 3, 4, K); ret(ctx, px + 14, py + 12, 3, 4, K);
      ret(ctx, px, py + 12, 1, 3, C.ouro); ret(ctx, px + 15, py + 12, 1, 3, C.ouro);
    } else {
      // desce: um vão no chão com degraus que somem no escuro e grades dos dois lados
      ret(ctx, px, py, 16, 16, K);
      for (var k = 0; k < 5; k++) {
        var c = misturar('#f8dcae', '#3a2446', k * 0.2);
        ret(ctx, px + 3, py + 1 + k * 3, 10, 3, c);
        ret(ctx, px + 3, py + 1 + k * 3, 10, 1, clarear(c, 0.3));
      }
      [px, px + 13].forEach(function (x) {
        ret(ctx, x, py - 4, 3, 20, K);
        ret(ctx, x + 1, py - 3, 1, 18, C.madeira);
        ret(ctx, x, py - 5, 3, 2, C.ouro); ret(ctx, x + 1, py - 5, 1, 1, C.ouro3);
      });
      ret(ctx, px + 3, py, 10, 1, C.madeiraClara);
    }
  }
  function desenharSaida(ctx, g, s) {
    var px = s.x * T, py = s.y * T;
    // vão da porta no lábio de baixo, com a luz de fora
    if (g.dentro(s.x, s.y + 1) || true) {
      ret(ctx, px + 1, py + 16, 14, 5, '#fff4c8');
      ret(ctx, px + 1, py + 19, 14, 2, '#c6e15a');
      ret(ctx, px - 1, py + 14, 3, 8, K); ret(ctx, px + 14, py + 14, 3, 8, K);
      ret(ctx, px, py + 14, 1, 7, C.madeiraClara); ret(ctx, px + 15, py + 14, 1, 7, C.madeiraClara);
    }
    // capacho
    ret(ctx, px + 1, py + 2, 14, 13, K);
    ret(ctx, px + 2, py + 3, 12, 11, '#e0506a');
    ret(ctx, px + 3, py + 4, 10, 9, '#ff7a8a');
    for (var i = 0; i < 5; i++) ret(ctx, px + 3 + i * 2, py + 4, 1, 9, '#f06a7c');
    for (var f = px + 2; f < px + 14; f += 2) { ret(ctx, f, py + 1, 1, 1, '#ffd0d8'); ret(ctx, f, py + 15, 1, 1, '#ffd0d8'); }
    // luz entrando
    for (var j = 0; j < 7; j++) ret(ctx, px + 2 + (j >> 1), py + 14 - j * 2, 12 - (j >> 1) * 2, 2, 'rgba(255,244,200,' + (0.28 - j * 0.035).toFixed(3) + ')');
  }
  function setaSaida(ctx, s, t, animar) {
    var px = s.x * T, py = s.y * T, d = animar ? Math.round((Math.sin(t / 260) + 1) * 1) : 1;
    matriz(ctx, px + 4, py + 3 + d, ['..kkkk..', '..kwwk..', '..kwwk..', 'kkkwwkkk', 'kwwwwwwk', '.kwwwwk.', '..kwwk..', '...kk...'], { k: K, w: '#fff3a0' });
  }
  function setaEscada(ctx, e, t, animar) {
    var px = e.x * T, py = e.y * T, d = animar ? Math.round((Math.sin(t / 300) + 1) * 1) : 1;
    var cima = e.sentido !== 'desce';
    var linhas = ['...kk...', '..kwwk..', '.kwwwwk.', 'kwwwwwwk', 'kkkwwkkk', '..kwwk..', '..kwwk..', '..kkkk..'];
    if (!cima) linhas = linhas.slice().reverse();
    matriz(ctx, px + 4, py + 4 + (cima ? -d : d), linhas, { k: K, w: C.ouro });
  }

  function desenharEstatico(ctx, def, g, P, objs) {
    var W = g.w, H = g.h;
    ctx.clearRect(0, 0, W * T, H * T);
    ret(ctx, 0, 0, W * T, H * T, FUNDO);
    var pal = {};
    (def.comodos || []).forEach(function (c) { pal[c.id] = paletaComodo(c); });
    function palTile(x, y) { var c = comodoDoTile(def, g, x, y); return c ? pal[c.id] : paletaComodo({}); }
    function vazio(x, y) { return !g.dentro(x, y) || (!g.comodo[y][x] && !g.porta[y][x]); }
    function ehParedeSolida(x, y) { return g.dentro(x, y) && g.parede[y][x] && !g.porta[y][x]; }
    // paredes do fundo
    (def.comodos || []).forEach(function (c) {
      var r = c.rect, pc = pal[c.id];
      for (var x = r.x; x < r.x + r.w; x++) pc.parede.desenhar(ctx, x * T, r.y * T, x, pc.p);
    });
    // pisos (inclui os vãos das portas)
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (!g.chao[y][x]) continue;
      var pt = palTile(x, y);
      pt.piso.desenhar(ctx, x * T, y * T, x, y, pt.p);
    }
    // sombra da parede no chão e dos lábios laterais
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      if (!g.chao[y2][x2]) continue;
      var px = x2 * T, py = y2 * T;
      if (ehParedeSolida(x2, y2 - 1)) { ret(ctx, px, py, 16, 2, 'rgba(58,36,70,0.22)'); ret(ctx, px, py + 2, 16, 2, 'rgba(58,36,70,0.09)'); }
      if (vazio(x2 - 1, y2) || ehParedeSolida(x2 - 1, y2)) ret(ctx, px, py, 2, 16, 'rgba(58,36,70,0.14)');
      // batente das portas que atravessam a parede
      if (g.porta[y2][x2] && g.parede[y2][x2]) {
        var pp = palTile(x2, y2).p;
        if (ehParedeSolida(x2 - 1, y2)) { ret(ctx, px, py, 3, 16, K); ret(ctx, px, py, 2, 16, escurecer(pp.parede, 0.25)); ret(ctx, px + 1, py, 1, 16, C.madeiraClara); }
        if (ehParedeSolida(x2 + 1, y2)) { ret(ctx, px + 13, py, 3, 16, K); ret(ctx, px + 14, py, 2, 16, escurecer(pp.parede, 0.25)); ret(ctx, px + 14, py, 1, 16, C.madeiraClara); }
      }
    }
    // lábios: a espessura das paredes vista de cima, no vão escuro em volta dos cômodos
    var saida = def.saida;
    for (var y3 = -1; y3 <= H; y3++) for (var x3 = -1; x3 <= W; x3++) {
      if (!vazio(x3, y3)) continue;
      var bx = x3 * T, by = y3 * T;
      var cima = !vazio(x3, y3 - 1), baixo = !vazio(x3, y3 + 1), esq = !vazio(x3 - 1, y3), dir = !vazio(x3 + 1, y3);
      if (cima && !(saida && saida.x === x3 && saida.y === y3 - 1)) { ret(ctx, bx, by, 16, 1, C.labioLuz); ret(ctx, bx, by + 1, 16, 3, C.labio); ret(ctx, bx, by + 4, 16, 1, K); }
      if (baixo) { ret(ctx, bx, by + 11, 16, 1, K); ret(ctx, bx, by + 12, 16, 3, C.labio); ret(ctx, bx, by + 15, 16, 1, C.labioLuz); }
      if (esq) { ret(ctx, bx, by, 1, 16, C.labioLuz); ret(ctx, bx + 1, by, 3, 16, C.labio); ret(ctx, bx + 4, by, 1, 16, K); }
      if (dir) { ret(ctx, bx + 11, by, 1, 16, K); ret(ctx, bx + 12, by, 3, 16, C.labio); ret(ctx, bx + 15, by, 1, 16, C.labioLuz); }
      // cantos
      if (!cima && !esq && !vazio(x3 - 1, y3 - 1)) ret(ctx, bx, by, 4, 4, C.labio);
      if (!cima && !dir && !vazio(x3 + 1, y3 - 1)) ret(ctx, bx + 12, by, 4, 4, C.labio);
      if (!baixo && !esq && !vazio(x3 - 1, y3 + 1)) ret(ctx, bx, by + 12, 4, 4, C.labio);
      if (!baixo && !dir && !vazio(x3 + 1, y3 + 1)) ret(ctx, bx + 12, by + 12, 4, 4, C.labio);
      if (cima && esq) ret(ctx, bx, by, 4, 4, C.labio);
      if (cima && dir) ret(ctx, bx + 12, by, 4, 4, C.labio);
      if (baixo && esq) ret(ctx, bx, by + 12, 4, 4, C.labio);
      if (baixo && dir) ret(ctx, bx + 12, by + 12, 4, 4, C.labio);
    }
    // escadas e saída
    (def.escadas || []).forEach(function (e) { desenharEscada(ctx, g, e); });
    if (saida) desenharSaida(ctx, g, saida);
    // luz das janelas no chão
    objs.forEach(function (it) { if (it.lib.luz) it.lib.luz(ctx, it.px, it.py, it.o); });
    // sombras automáticas sob os móveis
    objs.forEach(function (it) {
      if (it.parede || it.lib.semSombra || it.lib.plano) return;
      var cx = it.px + it.W / 2, by2 = it.py + it.H - 2;
      elipse(ctx, Math.round(cx), by2, Math.max(3, Math.round(it.W * 0.42)), 3, 'rgba(58,36,70,0.13)');
      elipse(ctx, Math.round(cx), by2, Math.max(2, Math.round(it.W * 0.32)), 1, 'rgba(58,36,70,0.14)');
    });
    // móveis e enfeites (os altos viram sprites desenhados na ordem por Y)
    objs.filter(function (it) { return !it.alto; })
      .sort(function (a, b) { return (a.ordem - b.ordem) || (a.base - b.base) || (a.px - b.px); })
      .forEach(function (it) { it.lib.desenhar && it.lib.desenhar(ctx, it.px, it.py, it.o, P); });
  }

  II.paletaComodo = paletaComodo; II.comodoDoTile = comodoDoTile; II.desenharEstatico = desenharEstatico;
  II.setaSaida = setaSaida; II.setaEscada = setaEscada;
})();
