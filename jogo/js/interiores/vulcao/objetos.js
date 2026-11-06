/* Vulcão dos Dragõezinhos, os objetos da mata do vulcão (prefixo vulcao-): o vulcãozinho com lava na boca, a árvore-
   de-fogo (copa vermelha e laranja), a coluna de basalto, a pedra quente rachada, o toco queimado com brasa, os
   cristais de fogo, a pocinha de lava e os ossinhos de brinquedo (sólidos). Mais abaixo, na segunda parte: os que se
   tocam e os enfeites do chão. Reino._predios.vulcao guarda P.sombra, P.tempo e P.LAVA. Nada de DOM nem canvas no
   carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).vulcao = R._predios.vulcao || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  var ROCHA = ['#3e2a32', '#5a4048', '#7a5e66'];
  var LAVA = ['#c84a2a', '#ff8a3d', '#ffd34d', '#fff1a0'];
  var FOGO = ['#c8342a', '#ff6a3d', '#ffb04a'];
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(58,36,70,0.22)'); }
  P.sombra = sombra; P.LAVA = LAVA;
  P.tempo = function (t) { return PL.tempo ? PL.tempo(t) : 0; };   // 0 sem Animações: o desenho fica parado

  // folhagem em bolas [cx, cy, raio] com contorno só por fora (todas as bolas de contorno primeiro)
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  // cone de rocha: do topo (y0, meia largura w0) até a base (y1, meia largura w1), luz à esquerda e sombra à direita
  function cone(ctx, cx, y0, y1, w0, w1) {
    var n = y1 - y0, r, hw;
    for (r = -1; r <= n; r++) { hw = Math.round(w0 + (w1 - w0) * Math.max(0, r) / n) + 1; ret(ctx, cx - hw, y0 + r, hw * 2 + 1, 1, K); }
    for (r = 0; r < n; r++) {
      hw = Math.round(w0 + (w1 - w0) * r / n);
      ret(ctx, cx - hw, y0 + r, hw * 2 + 1, 1, ROCHA[1]);
      ret(ctx, cx - hw, y0 + r, Math.max(1, Math.round(hw / 3)), 1, ROCHA[2]);
      ret(ctx, cx + hw - Math.round(hw / 3), y0 + r, Math.round(hw / 3) + 1, 1, ROCHA[0]);
    }
  }

  /* ---------- os altos da mata (sólidos na base, desenhados na ordem por Y) ---------- */
  // o vulcãozinho: um cone de rocha com a boca de lava, um fio escorrendo e a fumacinha em cima
  I.objeto('vulcao-pico', { w: 2, h: 1, solido: true, alto: true, topo: 40,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      cone(ctx, px + 16, py - 32, py + 14, 5, 14);
      elipse(ctx, px + 16, py - 32, 5, 2, K); elipse(ctx, px + 16, py - 32, 4, 1, LAVA[1]); ret(ctx, px + 14, py - 32, 3, 1, LAVA[2]);
      ret(ctx, px + 13, py - 31, 3, 9, K); ret(ctx, px + 14, py - 31, 1, 8, LAVA[1]); ret(ctx, px + 12, py - 23, 4, 5, K); ret(ctx, px + 13, py - 23, 2, 4, LAVA[1]); ret(ctx, px + 13, py - 22, 1, 2, LAVA[2]);
      ret(ctx, px + 20, py - 30, 2, 4, K); ret(ctx, px + 20, py - 30, 1, 3, LAVA[0]);
      ret(ctx, px + 15, py - 38, 4, 3, '#a8949c'); ret(ctx, px + 18, py - 40, 4, 3, '#c8b8bc'); ret(ctx, px + 19, py - 40, 2, 1, '#e0d6d8');   // fumacinha
      ret(ctx, px + 6, py + 6, 4, 2, ROCHA[2]); ret(ctx, px + 22, py + 2, 3, 2, ROCHA[0]);
    } });
  // a árvore-de-fogo: tronco escuro e a copa vermelha, laranja e amarela, com florzinhas
  I.objeto('vulcao-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 42,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 12);
      ret(ctx, px + 12, py - 10, 8, 24, K); ret(ctx, px + 13, py - 10, 6, 23, '#4a3036'); ret(ctx, px + 13, py - 10, 2, 23, '#6a4a50');
      ret(ctx, px + 9, py + 11, 4, 3, K); ret(ctx, px + 20, py + 11, 4, 3, K); ret(ctx, px + 10, py + 11, 2, 2, '#6a4a50');
      folhagem(ctx, px, py, [[16, -28, 12], [6, -20, 8], [26, -20, 8], [16, -16, 8]], FOGO);
      [[8, -24], [22, -30], [24, -18], [12, -14], [17, -36]].forEach(function (f) { ret(ctx, px + f[0], py + f[1], 2, 2, LAVA[3]); });
    } });
  // a coluna de basalto: prismas empilhados, com o topo claro e uma rachadura de lava
  I.objeto('vulcao-coluna', { w: 1, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py - 22, 12, 37, K); ret(ctx, px + 3, py - 21, 10, 35, ROCHA[1]);
      ret(ctx, px + 3, py - 21, 3, 35, ROCHA[2]); ret(ctx, px + 10, py - 21, 3, 35, ROCHA[0]);
      ret(ctx, px + 3, py - 21, 10, 3, '#a8949c'); ret(ctx, px + 4, py - 21, 6, 1, '#c8b8bc');
      ret(ctx, px + 2, py - 8, 12, 1, K); ret(ctx, px + 2, py + 3, 12, 1, K);   // as juntas dos prismas
      ret(ctx, px + 7, py - 6, 1, 4, LAVA[1]); ret(ctx, px + 8, py - 3, 1, 3, LAVA[1]); ret(ctx, px + 7, py - 5, 1, 1, LAVA[2]);
    } });

  /* ---------- pequenos sólidos ---------- */
  // a pedra quente: rocha escura com as rachaduras acesas
  I.objeto('vulcao-pedra', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, ROCHA[2]);
      elipse(ctx, px + 6, py + 7, 3, 2, '#a8949c'); ret(ctx, px + 9, py + 12, 4, 1, ROCHA[1]);
      ret(ctx, px + 7, py + 8, 1, 3, LAVA[1]); ret(ctx, px + 8, py + 10, 3, 1, LAVA[1]); ret(ctx, px + 10, py + 9, 1, 1, LAVA[2]);
    } });
  // o toco queimado, com uma brasinha acesa em cima
  I.objeto('vulcao-toco', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, '#6a4a40'); ret(ctx, px + 3, py + 7, 2, 7, '#8a6a58');
      elipse(ctx, px + 8, py + 6, 6, 3, K); elipse(ctx, px + 8, py + 6, 5, 2, '#8a6a60'); elipse(ctx, px + 8, py + 6, 2, 1, LAVA[1]);
      ret(ctx, px + 8, py + 6, 1, 1, LAVA[3]); ret(ctx, px + 11, py + 10, 1, 2, '#2e1820');
    } });
  // cristais de fogo: três pontas vermelhas e laranja, com brilho
  I.objeto('vulcao-cristais', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      [[3, 2, 4, 11, FOGO[0]], [7, -6, 4, 19, FOGO[1]], [11, 1, 3, 12, FOGO[0]]].forEach(function (c) {
        ret(ctx, px + c[0] - 1, py + c[1] + 1, c[2] + 2, c[3], K); ret(ctx, px + c[0], py + c[1], c[2], 1, K);
        ret(ctx, px + c[0], py + c[1] + 1, c[2], c[3] - 1, c[4]); ret(ctx, px + c[0], py + c[1] + 1, 1, c[3] - 2, FOGO[2]);
      });
      ret(ctx, px + 8, py - 3, 1, 3, LAVA[3]); ret(ctx, px + 2, py + 13, 12, 2, ROCHA[1]);
    } });
  // a pocinha de lava: a beira de crosta escura, a lava laranja com o miolo amarelo (sólida: ela contorna)
  I.objeto('vulcao-lava', { w: 2, h: 1, solido: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 9, 15, 6, K); elipse(ctx, px + 16, py + 9, 14, 5, ROCHA[1]);
      elipse(ctx, px + 16, py + 9, 12, 4, LAVA[0]); elipse(ctx, px + 16, py + 9, 10, 3, LAVA[1]); ret(ctx, px + 9, py + 8, 10, 1, LAVA[2]);
      circulo(ctx, px + 21, py + 9, 1, LAVA[2]); ret(ctx, px + 12, py + 10, 2, 1, LAVA[3]);
    },
    anim: function (ctx, px, py, t) {
      var f = P.tempo(t) ? Math.floor(P.tempo(t) / 450) % 4 : 0;   // a bolha cresce e estoura
      if (f < 3) circulo(ctx, px + 10 + f * 3, py + 9, f, LAVA[3]);
    } });
  // ossinhos de dragão de brinquedo: dois ossos cruzados, gordinhos, cor de creme
  function osso(ctx, x, y, w) {
    ret(ctx, x, y - 1, w, 4, K); ret(ctx, x + 1, y, w - 2, 2, '#fff1d0');
    [[x - 2, y - 3], [x - 2, y + 1], [x + w - 2, y - 3], [x + w - 2, y + 1]].forEach(function (b) {
      ret(ctx, b[0], b[1], 4, 4, K); ret(ctx, b[0] + 1, b[1] + 1, 2, 2, '#fff1d0');
    });
    ret(ctx, x + 1, y, w - 2, 1, '#ffffff');
  }
  I.objeto('vulcao-ossos', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      osso(ctx, px + 4, py + 10, 9);
      osso(ctx, px + 3, py + 5, 8);
      ret(ctx, px + 12, py + 3, 3, 2, '#ff7eb6'); ret(ctx, px + 13, py + 3, 1, 1, '#ffffff');   // lacinho
    } });
})();
/* Segunda parte: os que se tocam e os enfeites do chão (prefixo vulcao-): a placa, o gêiser, o ninho com ovos e o
   osso de dragão de brinquedo (com fala); cinzas, brasas, rachadura de lava, flor-de-fogo, casca de ovo, fumacinha e
   as pedrinhas da trilha (não sólidos). O parado fica no `desenhar`; o que mexe, no `anim` (só com Animações; com
   t = 0 fica parado). Usa P.sombra, P.tempo e P.LAVA (da primeira parte). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).vulcao = R._predios.vulcao || {};
  var LAVA = P.LAVA || ['#c84a2a', '#ff8a3d', '#ffd34d', '#fff1a0'];
  function tempo(t) { return P.tempo ? P.tempo(t) : 0; }
  function sombra(ctx, cx, y, rx) { if (P.sombra) P.sombra(ctx, cx, y, rx); }
  var FUMO = ['#c8b8bc', '#e6dee0', '#ffffff'];
  function nuvem(ctx, x, y, n) { ret(ctx, x, y + 1, 3 + n, 2 + n, FUMO[0]); ret(ctx, x + 1, y, 2 + n, 2 + n, FUMO[1]); ret(ctx, x + 1, y, 1, 1, FUMO[2]); }

  /* ---------- os que se tocam ---------- */
  // a placa de pedra com um dragãozinho sorrindo pintado
  I.objeto('vulcao-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, '#6a4a50');
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#b89060'); ret(ctx, px + 1, py - 3, 14, 2, '#d4b080'); ret(ctx, px + 1, py + 5, 14, 2, '#8c6c40');
      ret(ctx, px + 4, py - 2, 8, 6, K); ret(ctx, px + 5, py - 1, 6, 4, '#ff6a3d');                 // a cabecinha do dragão
      ret(ctx, px + 4, py - 3, 2, 1, K); ret(ctx, px + 10, py - 3, 2, 1, K);                          // chifrinhos
      ret(ctx, px + 6, py - 1, 1, 1, K); ret(ctx, px + 9, py - 1, 1, 1, K); ret(ctx, px + 7, py + 1, 2, 1, '#ffd34d');
      ret(ctx, px + 12, py + 1, 2, 2, LAVA[1]); ret(ctx, px + 13, py, 1, 1, LAVA[2]);                 // uma chaminha pintada
    } });
  // o gêiser: um montinho de pedra com o buraco, e a fumaça que sobe (parada sem Animações)
  I.objeto('vulcao-geiser', { w: 1, h: 1, solido: true, topo: 12,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 8, 12, 7, K); ret(ctx, px + 1, py + 10, 14, 4, K); ret(ctx, px + 4, py + 6, 8, 3, K);
      ret(ctx, px + 3, py + 9, 10, 5, '#a8949c'); ret(ctx, px + 2, py + 11, 12, 2, '#a8949c'); ret(ctx, px + 5, py + 7, 6, 2, '#c8b8bc');
      ret(ctx, px + 3, py + 13, 10, 1, '#86707a'); ret(ctx, px + 3, py + 10, 1, 2, '#ccbcc0');
      ret(ctx, px + 6, py + 7, 4, 2, '#2e1820'); ret(ctx, px + 7, py + 8, 2, 1, LAVA[1]);
      nuvem(ctx, px + 5, py + 1, 1); nuvem(ctx, px + 8, py - 5, 1); nuvem(ctx, px + 5, py - 11, 0);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 300) % 4 : 0;
      if (f) nuvem(ctx, px + 4 + (f & 1) * 4, py + 2 - f * 3, 2);   // um sopro a mais subindo
    } });
  // o ninho: gravetos em roda com três ovos de dragão (pintinhas laranja), aquecidos por brasas embaixo
  function ovo(ctx, x, y, c, p) {
    elipse(ctx, x, y, 3, 4, K); elipse(ctx, x, y, 2, 3, c); ret(ctx, x - 1, y - 2, 1, 2, '#ffffff');
    ret(ctx, x + 1, y, 1, 1, p); ret(ctx, x - 1, y + 2, 1, 1, p);
  }
  I.objeto('vulcao-ninho', { w: 2, h: 1, solido: true, topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      elipse(ctx, px + 16, py + 9, 14, 5, K); elipse(ctx, px + 16, py + 9, 13, 4, '#8c6c40');
      ovo(ctx, px + 10, py + 3, '#fff1d0', LAVA[1]); ovo(ctx, px + 22, py + 3, '#ffe0f0', '#ff7eb6'); ovo(ctx, px + 16, py + 1, '#fff4cc', LAVA[0]);
      elipse(ctx, px + 16, py + 10, 12, 3, K); elipse(ctx, px + 16, py + 10, 11, 2, '#b89060');
      for (var i = 0; i < 6; i++) ret(ctx, px + 6 + i * 4, py + 9 + (i & 1), 3, 1, '#6a4a30');   // gravetos
      ret(ctx, px + 4, py + 13, 2, 1, LAVA[1]); ret(ctx, px + 26, py + 13, 2, 1, LAVA[2]);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 400) % 4 : 0;   // um brilhinho pisca em volta dos ovos (vão nascer!)
      if (f) { var x = px + [0, 12, 20, 6][f], y = py + [0, -6, -3, -2][f]; ret(ctx, x, y - 1, 1, 3, LAVA[3]); ret(ctx, x - 1, y, 3, 1, LAVA[3]); }
    } });
  // o osso de dragão de brinquedo: uma cabeçona redonda cor de creme, chifrinhos, sorriso e um lacinho rosa
  I.objeto('vulcao-cranio', { w: 2, h: 1, solido: true, topo: 14,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 7, py - 9, 3, 5, K); ret(ctx, px + 22, py - 9, 3, 5, K); ret(ctx, px + 8, py - 8, 1, 4, '#fff1d0'); ret(ctx, px + 23, py - 8, 1, 4, '#fff1d0');
      elipse(ctx, px + 16, py + 1, 12, 9, K); elipse(ctx, px + 16, py + 1, 11, 8, '#fff1d0');
      ret(ctx, px + 4, py + 5, 24, 8, K); ret(ctx, px + 5, py + 5, 22, 7, '#fff1d0'); ret(ctx, px + 5, py + 10, 22, 2, '#e6d0b0');
      elipse(ctx, px + 11, py, 3, 3, K); elipse(ctx, px + 21, py, 3, 3, K); ret(ctx, px + 10, py - 2, 1, 1, '#ffffff'); ret(ctx, px + 20, py - 2, 1, 1, '#ffffff');
      ret(ctx, px + 14, py + 5, 1, 1, K); ret(ctx, px + 17, py + 5, 1, 1, K);                          // narinas
      ret(ctx, px + 9, py + 8, 14, 1, K); ret(ctx, px + 8, py + 7, 1, 1, K); ret(ctx, px + 23, py + 7, 1, 1, K);   // sorriso
      ret(ctx, px + 11, py + 9, 2, 2, '#ffffff'); ret(ctx, px + 19, py + 9, 2, 2, '#ffffff');           // dentinhos
      ret(ctx, px + 8, py - 6, 2, 1, '#ffffff');
      ret(ctx, px + 23, py - 5, 6, 4, K); ret(ctx, px + 24, py - 4, 2, 2, '#ff7eb6'); ret(ctx, px + 27, py - 4, 1, 2, '#ff7eb6'); ret(ctx, px + 26, py - 4, 1, 2, '#c84a8a');   // lacinho
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  I.objeto('vulcao-cinzas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 11, 6, 2, '#9a8088'); elipse(ctx, px + 7, py + 10, 3, 1, '#b8a0a4');
      ret(ctx, px + 3, py + 6, 1, 1, '#9a8088'); ret(ctx, px + 12, py + 5, 1, 1, '#b8a0a4');
    } });
  var BRASA = [[4, 9, 0], [9, 12, 1], [12, 7, 2]];
  I.objeto('vulcao-brasas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      BRASA.forEach(function (b) { ret(ctx, px + b[0], py + b[1], 2, 2, '#2e1820'); ret(ctx, px + b[0], py + b[1], 1, 1, LAVA[1]); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < BRASA.length; n++) { var b = BRASA[n]; if (t && Math.floor(t / 330 + b[2]) % 3 === 0) ret(ctx, px + b[0], py + b[1], 1, 1, LAVA[3]); }
    } });
  I.objeto('vulcao-rachadura', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 7, 4, 2, '#5a3438'); ret(ctx, px + 5, py + 8, 4, 2, '#5a3438'); ret(ctx, px + 8, py + 9, 5, 2, '#5a3438'); ret(ctx, px + 9, py + 6, 2, 3, '#5a3438');
      ret(ctx, px + 3, py + 7, 2, 1, LAVA[1]); ret(ctx, px + 6, py + 8, 2, 1, LAVA[1]); ret(ctx, px + 9, py + 9, 3, 1, LAVA[2]); ret(ctx, px + 9, py + 7, 1, 1, LAVA[1]);
    } });
  var PETALA = [['#ff5c4a', '#ffd34d'], ['#ff8a3d', '#fff1a0'], ['#ffd34d', '#ff6a3d']];
  I.objeto('vulcao-flor', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var c = PETALA[((o.var && o.var.n) || 0) % 3];
      ret(ctx, px + 7, py + 8, 1, 6, '#5a7a3a'); ret(ctx, px + 8, py + 11, 2, 1, '#5a7a3a');
      ret(ctx, px + 5, py + 4, 5, 5, K); ret(ctx, px + 4, py + 5, 7, 3, K); ret(ctx, px + 6, py + 3, 3, 1, K);
      ret(ctx, px + 5, py + 5, 5, 3, c[0]); ret(ctx, px + 6, py + 4, 3, 5, c[0]); ret(ctx, px + 7, py + 5, 1, 2, c[1]);
    } });
  // a casca do ovo que já nasceu: a metade de baixo, com a beirada em zigue-zague, e um caquinho
  var CASCA = { K: K, w: '#fff1d0', s: '#e6d0b0', o: LAVA[1] };
  function molde(ctx, x, y, linhas, pal) {
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) { var c = pal[linhas[j][i]]; if (c) ret(ctx, x + i, y + j, 1, 1, c); }
  }
  I.objeto('vulcao-casca', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      molde(ctx, px + 2, py + 7, ['.K..K..K.', 'KwKKwKKwK', 'KwwwwwwsK', 'KwwowwwsK', '.KsssssK.', '..KKKKK..'], CASCA);
      molde(ctx, px + 11, py + 11, ['.KK', 'KwK', 'KK.'], CASCA);
    } });
  I.objeto('vulcao-fumacinha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 12, 3, 1, '#5a3438'); ret(ctx, px + 8, py + 12, 1, 1, LAVA[1]);
      ret(ctx, px + 7, py + 7, 2, 2, FUMO[0]); ret(ctx, px + 9, py + 3, 2, 2, FUMO[1]);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 400) % 3 : 0;
      if (f) ret(ctx, px + 6 + f, py + 8 - f * 3, 2, 2, FUMO[2]);
    } });
  I.objeto('vulcao-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, 4, 3], [10, 4, 3, 3], [9, 11, 4, 3]].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], s[2], s[3], '#6a4044'); ret(ctx, px + s[0], py + s[1], s[2] - 1, s[3] - 1, '#ccbcc0');
      });
    } });
})();
