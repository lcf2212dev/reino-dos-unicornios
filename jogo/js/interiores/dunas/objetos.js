/* Dunas dos Escorpiões, os objetos do deserto (prefixo dunas-): a palmeira, o cacto de braços, o rochedo de arenito
   (a borda), o cacto redondinho, a moita seca, a pedra, a dunazinha, a coluna quebrada e a lagoinha do oásis (sólidos).
   Mais abaixo, na segunda parte: os que se tocam e os enfeites do chão. Reino._predios.dunas guarda P.sombra,
   P.palmeira e P.agua. Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).dunas = R._predios.dunas || {};
  var FOLHA = ['#2f8a5a', '#4fb878', '#9ae8a8'];
  var CACTO = ['#3f9a5a', '#5fbf6e', '#a8e890'];
  var ARENITO = ['#b8683e', '#d88a52', '#f4b070', '#ffd49a'];
  var AGUA = ['#1f9a9a', '#3fc8c0', '#a8f4ec'];
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(120,70,30,0.28)'); }
  P.sombra = sombra;

  // uma folha de palmeira: arco de pontos [x, y] com as folhinhas penduradas (contorno inteiro primeiro)
  function folha(ctx, cx, cy, dx, dy, n) {
    var pts = [], i;
    for (i = 0; i <= n; i++) pts.push([cx + Math.round(dx * i), cy + Math.round(dy * i + 0.09 * i * i)]);
    pts.forEach(function (p) { ret(ctx, p[0] - 1, p[1] - 1, 4, 5, K); });
    pts.forEach(function (p, j) { ret(ctx, p[0], p[1], 2, 2, FOLHA[1]); ret(ctx, p[0], p[1] + 2, 2, 2, j % 2 ? FOLHA[0] : FOLHA[1]); });
    pts.forEach(function (p, j) { if (j % 3 === 1) ret(ctx, p[0], p[1], 1, 1, FOLHA[2]); });
  }
  // a palmeira: tronco curvo com anéis, a copa de folhas e os cocos (px e py = o pé do tronco)
  function palmeira(ctx, x, y, alt) {
    var i, topoX = x + 3, topoY = y - alt;
    for (i = 0; i <= alt; i += 3) {
      var tx = x + Math.round(Math.sin(i / alt * 1.6) * 3);
      ret(ctx, tx - 1, y - i - 3, 6, 4, K);
    }
    for (i = 0; i <= alt; i += 3) {
      var ux = x + Math.round(Math.sin(i / alt * 1.6) * 3);
      ret(ctx, ux, y - i - 2, 4, 2, '#c8905a'); ret(ctx, ux, y - i, 4, 1, '#8a5a3a'); ret(ctx, ux, y - i - 2, 1, 2, '#e8b47a');
    }
    folha(ctx, topoX, topoY, -1.2, -0.6, 10); folha(ctx, topoX, topoY, 1.2, -0.6, 10);
    folha(ctx, topoX, topoY, -1, 0.1, 9); folha(ctx, topoX, topoY, 1, 0.1, 9);
    folha(ctx, topoX, topoY, -0.4, -1.1, 5); folha(ctx, topoX, topoY, 0.5, -1, 5);
    [[-2, 3], [2, 4], [0, 5]].forEach(function (c) { circulo(ctx, topoX + 1 + c[0], topoY + c[1], 2, K); circulo(ctx, topoX + 1 + c[0], topoY + c[1], 1, '#7a4a2a'); });
  }
  P.palmeira = palmeira;
  // água de oásis: elipse turquesa com a beira de areia molhada e um brilho
  function agua(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, '#c8a068');
    elipse(ctx, cx, cy, rx - 2, ry - 1, AGUA[0]); elipse(ctx, cx, cy - 1, rx - 4, ry - 2, AGUA[1]);
    ret(ctx, cx - 4, cy - 1, 4, 1, AGUA[2]); ret(ctx, cx + 3, cy + 1, 2, 1, AGUA[2]);
  }
  P.agua = agua;

  /* ---------- altos (sólidos na base, desenhados na ordem por Y) ---------- */
  I.objeto('dunas-palmeira', { w: 2, h: 1, solido: true, alto: true, topo: 44,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 12);
      palmeira(ctx, px + 12, py + 13, 32);
    } });
  I.objeto('dunas-cacto', { w: 1, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 5, py - 24, 7, 38, K); ret(ctx, px + 6, py - 23, 5, 36, CACTO[1]);
      ret(ctx, px + 6, py - 23, 1, 36, CACTO[2]); ret(ctx, px + 10, py - 23, 1, 36, CACTO[0]);
      ret(ctx, px + 1, py - 14, 4, 10, K); ret(ctx, px + 1, py - 7, 6, 4, K); ret(ctx, px + 2, py - 13, 2, 9, CACTO[1]); ret(ctx, px + 2, py - 6, 4, 2, CACTO[1]);   // braço esquerdo
      ret(ctx, px + 12, py - 19, 4, 9, K); ret(ctx, px + 10, py - 13, 6, 4, K); ret(ctx, px + 13, py - 18, 2, 8, CACTO[1]); ret(ctx, px + 11, py - 12, 4, 2, CACTO[1]);   // braço direito
      [[8, -20], [8, -12], [8, -4], [8, 4], [2, -11], [14, -16]].forEach(function (e) { ret(ctx, px + e[0], py + e[1], 1, 1, '#eaffd8'); });   // espinhos
      ret(ctx, px + 7, py - 27, 3, 3, K); ret(ctx, px + 8, py - 26, 1, 1, '#ff7eb6');   // a florzinha no topo
    } });
  // o rochedo de arenito: pedras redondas empilhadas, com a luz do pôr do sol de um lado (as colunas da borda)
  var ROCHAS = [[16, -22, 8], [8, -10, 8], [24, -11, 7], [16, -1, 10], [6, 5, 6], [26, 5, 6]];
  I.objeto('dunas-rochedo', { w: 2, h: 1, solido: true, alto: true, topo: 31,
    desenhar: function (ctx, px, py, o) {
      var v = R.Desenho.sorte(o.x, o.y, 3) < 0.5 ? 1 : -1;   // espelha de vez em quando (a borda não fica igual)
      sombra(ctx, px + 16, py + 14, 14);
      var bolas = ROCHAS.map(function (b) { return [16 + (b[0] - 16) * v, b[1], b[2]]; });
      bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
      bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], ARENITO[0]); });
      bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 1, b[2] - 2, ARENITO[1]); });
      bolas.forEach(function (b) { circulo(ctx, px + b[0] - 2, py + b[1] - 3, Math.max(1, Math.round(b[2] / 3)), ARENITO[2]); });
      bolas.forEach(function (b) { ret(ctx, px + b[0] - b[2] + 3, py + b[1] + 1, b[2], 1, ARENITO[0]); ret(ctx, px + b[0] - 3, py + b[1] - b[2] + 2, 2, 1, ARENITO[3]); });   // camadas e brilho
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('dunas-cacto-redondo', { w: 1, h: 1, solido: true, topo: 6,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      elipse(ctx, px + 8, py + 7, 6, 7, K); elipse(ctx, px + 8, py + 7, 5, 6, CACTO[1]);
      ret(ctx, px + 5, py + 2, 1, 10, CACTO[0]); ret(ctx, px + 8, py + 1, 1, 12, CACTO[0]); ret(ctx, px + 11, py + 2, 1, 10, CACTO[0]);
      ret(ctx, px + 6, py + 3, 1, 3, CACTO[2]);
      ret(ctx, px + 6, py - 2, 5, 3, K); ret(ctx, px + 7, py - 1, 3, 1, '#ffd34d'); ret(ctx, px + 8, py - 2, 1, 1, '#ff9ec0');   // flor amarela
      ret(ctx, px + 4, py + 12, 9, 2, '#c99858');
    } });
  I.objeto('dunas-moita', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 8, 7, 6, K); elipse(ctx, px + 8, py + 8, 6, 5, '#b89a5a');
      [[4, 6], [7, 4], [10, 7], [6, 10], [11, 10]].forEach(function (g) { ret(ctx, px + g[0], py + g[1], 2, 1, '#8a7038'); ret(ctx, px + g[0] + 1, py + g[1] + 1, 1, 1, '#e0c88a'); });
      ret(ctx, px + 5, py + 4, 2, 1, '#e0c88a');
    } });
  I.objeto('dunas-pedra', { w: 1, h: 1, solido: true, topo: 3,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, ARENITO[1]);
      elipse(ctx, px + 7, py + 7, 4, 2, ARENITO[2]); ret(ctx, px + 5, py + 6, 2, 1, ARENITO[3]); ret(ctx, px + 10, py + 11, 3, 1, ARENITO[0]);
    } });
  // a dunazinha: um montinho de areia em meia-lua, com a face clara, a crista e a sombra
  I.objeto('dunas-duna', { w: 2, h: 1, solido: true, topo: 6, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 10, 15, 6, K); elipse(ctx, px + 16, py + 10, 14, 5, '#d8a060');
      elipse(ctx, px + 13, py + 9, 11, 4, '#f0c880'); elipse(ctx, px + 11, py + 8, 6, 2, '#fbe2a8');
      for (var x = 5; x < 28; x++) ret(ctx, px + x, py + 6 + Math.round((x - 18) * (x - 18) / 40), 1, 1, '#c08850');   // a crista
      ret(ctx, px + 7, py + 11, 3, 1, '#fff0c4'); ret(ctx, px + 22, py + 12, 4, 1, '#b8784a');
    } });
  // a coluna quebrada de um templo antigo, com um pedaço caído do lado
  I.objeto('dunas-coluna', { w: 1, h: 1, solido: true, topo: 18,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 10, 12, 5, K); ret(ctx, px + 3, py + 11, 10, 3, '#e8d0a0');
      ret(ctx, px + 4, py - 16, 8, 27, K); ret(ctx, px + 5, py - 15, 6, 26, '#f4e0b4');
      ret(ctx, px + 7, py - 15, 1, 26, '#d8b880'); ret(ctx, px + 10, py - 15, 1, 26, '#c8a870');
      ret(ctx, px + 4, py - 18, 4, 3, K); ret(ctx, px + 9, py - 17, 3, 2, K); ret(ctx, px + 5, py - 17, 2, 1, '#fff4d8');   // a quebra
      ret(ctx, px + 10, py - 4, 2, 3, '#ffb347');   // um risquinho pintado
    } });
  // a lagoinha do oásis (sólida: ela contorna)
  I.objeto('dunas-lago', { w: 2, h: 1, solido: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      agua(ctx, px + 16, py + 9, 14, 5);
      ret(ctx, px + 4, py + 6, 2, 3, '#4fb878'); ret(ctx, px + 27, py + 9, 2, 3, '#4fb878');   // tufinhos na beira
    } });
})();
/* Segunda parte: os que se tocam e os enfeites do chão (prefixo dunas-): a placa, o vaso antigo, o oásis com a
   palmeira e a pirâmide (com fala); as marolas, o capim seco, os ossinhos de brinquedo, o caco de vaso, a florzinha do
   deserto, a concha e as pegadas de escorpião na trilha (não sólidos). O brilho parado fica no `desenhar`; o piscar,
   no `anim` (só com Animações; com t = 0 fica parado). Usa P.sombra, P.palmeira e P.agua (da primeira parte). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).dunas = R._predios.dunas || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }
  function sombra(ctx, cx, y, rx) { if (P.sombra) P.sombra(ctx, cx, y, rx); }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  var VASO = ['#b8603a', '#d8804a', '#f4a868'];

  /* ---------- os que se tocam ---------- */
  // a placa de madeira fincada na areia, com um escorpiãozinho pintado
  I.objeto('dunas-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, '#8a5a3a');
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#d8a868'); ret(ctx, px + 1, py - 3, 14, 2, '#f0c888'); ret(ctx, px + 1, py + 5, 14, 2, '#a87848');
      ret(ctx, px + 4, py, 7, 3, '#e86a3a'); ret(ctx, px + 3, py - 1, 2, 2, '#e86a3a'); ret(ctx, px + 10, py - 1, 2, 2, '#e86a3a');   // o escorpião
      ret(ctx, px + 11, py - 2, 2, 1, '#e86a3a'); ret(ctx, px + 12, py - 3, 1, 1, '#a8301a'); ret(ctx, px + 6, py + 1, 1, 1, '#ffffff'); ret(ctx, px + 8, py + 1, 1, 1, '#ffffff');
      ret(ctx, px + 1, py + 13, 4, 2, '#ecca7e'); ret(ctx, px + 11, py + 13, 4, 2, '#ecca7e');   // areia em volta do pé
    } });
  // o vaso antigo de barro, com a faixa turquesa e os desenhinhos
  I.objeto('dunas-vaso', { w: 1, h: 1, solido: true, topo: 10,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      elipse(ctx, px + 8, py + 6, 7, 8, K); elipse(ctx, px + 8, py + 6, 6, 7, VASO[1]);
      ret(ctx, px + 4, py - 6, 9, 5, K); ret(ctx, px + 5, py - 5, 7, 3, VASO[1]); ret(ctx, px + 3, py - 8, 11, 3, K); ret(ctx, px + 4, py - 7, 9, 1, VASO[2]);
      ret(ctx, px + 2, py + 3, 13, 3, '#2fb8a8'); ret(ctx, px + 4, py + 4, 1, 1, '#ffe066'); ret(ctx, px + 8, py + 4, 1, 1, '#ffe066'); ret(ctx, px + 12, py + 4, 1, 1, '#ffe066');
      ret(ctx, px + 4, py, 2, 2, VASO[2]); ret(ctx, px + 11, py + 7, 2, 3, VASO[0]); ret(ctx, px + 6, py - 7, 5, 1, '#5a2a1a');
    } });
  // o oásis: a poça turquesa com a palmeira do lado e uma flor de lótus (a água é sólida)
  I.objeto('dunas-oasis', { w: 2, h: 1, solido: true, topo: 40, semSombra: true,
    desenhar: function (ctx, px, py) {
      if (P.agua) P.agua(ctx, px + 16, py + 9, 15, 6);
      elipse(ctx, px + 5, py + 13, 5, 2, 'rgba(120,70,30,0.28)');
      if (P.palmeira) P.palmeira(ctx, px + 2, py + 12, 26);
      ret(ctx, px + 22, py + 5, 4, 3, K); ret(ctx, px + 23, py + 6, 2, 1, '#ff9ec0');   // uma flor de lótus na água
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 450) % 3 : 0;   // o brilho passeando na água
      brilho(ctx, px + 12 + f * 4, py + 8 + (f & 1), '#ffffff');
    } });
  // a pirâmide pequena de pedra dourada, com a portinha e a pontinha que brilha
  I.objeto('dunas-piramide', { w: 3, h: 1, solido: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 24, py + 14, 22);
      var x, b = py + 14, mx = px + 24;
      for (x = -23; x <= 23; x++) { var h = 44 - Math.abs(x) * 2 + 1; ret(ctx, mx + x, b - h, 1, h + 1, K); }
      for (x = -21; x <= 21; x++) {
        var hh = 44 - Math.abs(x) * 2 - 2;
        ret(ctx, mx + x, b - hh, 1, hh, x < 0 ? '#f0c070' : '#c88a4a');
      }
      for (var y = 6; y < 42; y += 6) ret(ctx, mx - 21 + Math.ceil(y / 2), b - y, 42 - y, 1, '#a8703a');   // as fileiras de pedra
      ret(ctx, mx - 3, b - 9, 7, 9, K); ret(ctx, mx - 2, b - 8, 5, 8, '#5a2a3a'); ret(ctx, mx - 2, b - 8, 5, 1, '#3a2446');   // a portinha
      ret(ctx, mx - 2, b - 44, 4, 4, '#ffe066'); ret(ctx, mx - 1, b - 43, 1, 1, '#ffffff');   // a ponta dourada
    },
    anim: function (ctx, px, py, t) {
      if (!tempo(t) || Math.floor(tempo(t) / 600) % 3) return;
      brilho(ctx, px + 27, py - 30, '#ffffff');
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  I.objeto('dunas-marolas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[2, 5, 9], [5, 10, 8]].forEach(function (m) {
        ret(ctx, px + m[0], py + m[1], m[2], 1, '#d8a860'); ret(ctx, px + m[0] + 1, py + m[1] - 1, m[2] - 2, 1, '#fff0c4');
      });
    } });
  I.objeto('dunas-capim', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 6], [5, 9], [8, 7], [10, 10], [12, 5]].forEach(function (l, i) {
        ret(ctx, px + l[0], py + 15 - l[1], 1, l[1], i % 2 ? '#c8a050' : '#a88a3a');
        ret(ctx, px + l[0] + (i % 2 ? 1 : -1), py + 15 - l[1], 1, 1, '#e8c878');
      });
    } });
  // ossinhos de brinquedo: dois ossinhos de desenho animado, brancos e redondinhos (uma bolinha em cada canto)
  var OSSO = ['.KK.....KK.', 'KwwKKKKKwwK', '.KwwwwwwwK.', 'KwsKKKKKswK', '.KK.....KK.'], COR_OSSO = { K: K, w: '#fff8ec', s: '#e4d8c0' };
  function osso(ctx, x, y) {
    OSSO.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (l[i] !== '.') ret(ctx, x + i, y + j, 1, 1, COR_OSSO[l[i]]); });
  }
  I.objeto('dunas-ossinhos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { osso(ctx, px + 1, py + 3); osso(ctx, px + 4, py + 10); } });
  I.objeto('dunas-caco', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 8, 6, 4, K); ret(ctx, px + 4, py + 9, 4, 2, VASO[1]); ret(ctx, px + 4, py + 9, 4, 1, '#2fb8a8');
      ret(ctx, px + 10, py + 11, 4, 3, K); ret(ctx, px + 11, py + 12, 2, 1, VASO[2]);
    } });
  var PETALA = ['#ff7eb6', '#ffd34d', '#b57cff'];
  I.objeto('dunas-flor', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var c = PETALA[((o.var && o.var.n) || 0) % 3];
      ret(ctx, px + 7, py + 8, 1, 6, '#5fa04a'); ret(ctx, px + 8, py + 11, 2, 1, '#5fa04a');
      ret(ctx, px + 5, py + 5, 5, 4, K); ret(ctx, px + 6, py + 4, 3, 6, K);
      ret(ctx, px + 6, py + 6, 3, 2, c); ret(ctx, px + 7, py + 5, 1, 4, c); ret(ctx, px + 7, py + 6, 1, 2, '#fff6d8');
    } });
  I.objeto('dunas-concha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 4, 3, K); elipse(ctx, px + 8, py + 10, 3, 2, '#ffd8c8');
      ret(ctx, px + 6, py + 9, 1, 3, '#e8a090'); ret(ctx, px + 8, py + 8, 1, 4, '#e8a090'); ret(ctx, px + 10, py + 9, 1, 3, '#e8a090');
    } });
  // pegadas de escorpião na trilha: pontinhos em duas fileiras e o risco do rabo
  I.objeto('dunas-pegadas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      for (var i = 0; i < 4; i++) { ret(ctx, px + 3 + i * 3, py + 6 + (i & 1), 1, 1, '#b8885a'); ret(ctx, px + 3 + i * 3, py + 10 + (i & 1), 1, 1, '#b8885a'); }
      ret(ctx, px + 2, py + 8, 11, 1, '#d09a62');
    } });
})();
