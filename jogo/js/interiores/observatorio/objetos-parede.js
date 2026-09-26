/* Observatório por dentro, parte 2 de 6: os objetos de parede (fenda da cúpula, janelas, céu pintado,
   quadros, cartas celestes e o mapa das constelações). Usa observatorio/ceu.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = R.Desenho.K;
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var CEU = S.CEU, AMARELA = S.AMARELA, LILAS = S.LILAS, METAL = S.METAL, METAL2 = S.METAL2, METAL3 = S.METAL3,
      ESTRELA = S.ESTRELA, CIANO = S.CIANO, v = S.v, misturar = S.misturar, sorte = S.sorte, tempo = S.tempo,
      MARINHO = S.MARINHO, G_AZUL = S.G_AZUL, G_ROXO = S.G_ROXO, G_MAGENTA = S.G_MAGENTA, G_CIANO = S.G_CIANO,
      G_ROSA = S.G_ROSA, G_LILAS = S.G_LILAS, limiar = S.limiar, corNebulosa = S.corNebulosa, piscar = S.piscar,
      haloAnel = S.haloAnel, estrelaCadente = S.estrelaCadente, poeiraPiso = S.poeiraPiso, GAL = S.GAL, CUP = S.CUP,
      PLA = S.PLA;

  /* ================= OBJETOS: PAREDE ================= */
  // a fenda aberta da cúpula, com o céu estrelado (as estrelas piscam; às vezes passa uma estrela cadente)
  var FENDA_ESTRELAS = [[4, 5], [11, 3], [18, 8], [25, 4], [8, 12], [22, 14], [14, 18], [28, 11], [5, 20], [27, 21], [16, 2], [10, 22]];
  I.objeto('observatorio-fenda', { w: 4, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 4) * T, x0 = px + 14, w = W - 28;
      // costelas da cúpula e as duas portas de metal abertas
      ret(ctx, px + 2, py + 1, 12, 27, K); ret(ctx, px + W - 14, py + 1, 12, 27, K);
      ret(ctx, px + 3, py + 2, 10, 25, METAL2); ret(ctx, px + W - 13, py + 2, 10, 25, METAL2);
      ret(ctx, px + 3, py + 2, 2, 25, METAL); ret(ctx, px + W - 13, py + 2, 2, 25, METAL);
      for (var r = 0; r < 4; r++) { ret(ctx, px + 7, py + 5 + r * 6, 1, 1, METAL3); ret(ctx, px + W - 8, py + 5 + r * 6, 1, 1, METAL3); }
      // o céu: pronto uma vez (azul-marinho, nebulosa e a Via Láctea na diagonal)
      ret(ctx, x0 - 1, py, w + 2, 28, K);
      if (typeof document !== 'undefined' && ctx.drawImage) ctx.drawImage(ceuFenda(w), x0, py + 1);
      else ret(ctx, x0, py + 1, w, 26, MARINHO);
      FENDA_ESTRELAS.forEach(function (s, i) { if (i % 2) ret(ctx, x0 + s[0], py + 1 + s[1], 1, 1, [G_LILAS, G_CIANO, C.branco, G_ROSA][i % 4]); });
      // Lua crescente com halo em anéis de pixel
      var lx = x0 + w - 7, ly = py + 7;
      haloAnel(ctx, lx, ly, 6, '#8f86e0', 2);
      circulo(ctx, lx, ly, 4, '#fff3c8'); circulo(ctx, lx + 2, ly - 1, 3, MARINHO);
      // trilho embaixo
      ret(ctx, x0 - 1, py + 27, w + 2, 2, K); ret(ctx, x0, py + 27, w, 1, METAL);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var W = (o.w || 4) * T, x0 = px + 14, w = W - 28;
      for (var i = 0; i < FENDA_ESTRELAS.length; i += 2) piscar(ctx, x0 + FENDA_ESTRELAS[i][0], py + 1 + FENDA_ESTRELAS[i][1], t, i, i % 4 === 0);
      // as estrelas que cintilam no céu pintado da parede da Cúpula
      cintilarParede(ctx, 'cupula', t);
      poeiraPiso(ctx, 'cupula', t);
      // estrela cadente atravessando a Cúpula: do céu da parede até a fenda (a cada 8 a 15 s)
      estrelaCadente(ctx, t, px - 5 * T - 8, py + 5, x0 + w - 4, py + 20);
    } });
  // céu da fenda pronto (criado uma vez)
  var cacheFenda = {};
  function ceuFenda(w) {
    if (cacheFenda[w]) return cacheFenda[w];
    var c = document.createElement('canvas');
    c.width = w; c.height = 26;
    var x = c.getContext('2d');
    ret(x, 0, 0, w, 26, MARINHO);
    for (var j = 0; j < 26; j++) for (var i = 0; i < w; i++) {
      var l = limiar(i, j), cor = corNebulosa(i + 200, j + 17, j > 18 ? 1 : 0.8, 3);
      var dist = Math.abs(j - (22 - i * 0.62));   // Via Láctea subindo para a direita
      if (dist < 1.5 && l < 0.7) cor = l < 0.3 ? '#efe8ff' : G_LILAS;
      else if (dist < 4 && l < 0.6) cor = cor ? misturar(cor, '#b8b0ff', 0.45) : '#46469e';
      if (cor) ret(x, i, j, 1, 1, cor);
    }
    for (var s = 0; s < 10; s++) ret(x, Math.floor(sorte(s, 1, 43) * w), Math.floor(sorte(1, s, 47) * 26), 1, 1, [C.branco, G_CIANO, G_ROSA, '#e8e0ff'][s % 4]);
    cacheFenda[w] = c;
    return c;
  }
  // estrelas que cintilam nas faixas de céu da parede, só nos tiles de parede sem enfeite (a lista sai
  // dos objetos do interior na primeira vez); 2 por tile livre
  var estrelasParede = null;
  function cintilarParede(ctx, comodo, t) {
    if (!estrelasParede) {
      estrelasParede = { cupula: [], galeria: [], planetario: [] };
      var ocup = {};
      S.objetos.forEach(function (o) {   // S.objetos: a lista do layout (observatorio.js)
        var lib = I.OBJETOS[o.tipo] || {};
        if (!(o.parede !== undefined ? o.parede : lib.parede)) return;
        for (var i = 0; i < (o.w || lib.w || 1); i++) ocup[o.x + i] = true;
      });
      [['galeria', GAL, 13], ['cupula', CUP, 13], ['planetario', PLA, 15]].forEach(function (c) {
        for (var x = c[1].x; x < c[1].x + c[2]; x++) {
          if (ocup[x]) continue;
          for (var k = 0; k < 2; k++) estrelasParede[c[0]].push([x * T + 2 + Math.floor(sorte(x, k, 53) * 12), c[1].y * T + 5 + k * 6 + Math.floor(sorte(k, x, 59) * 5), x + k * 5]);
        }
      });
    }
    var lista = estrelasParede[comodo] || [];
    for (var i = 0; i < lista.length; i++) piscar(ctx, lista[i][0], lista[i][1], t, lista[i][2], i % 2 === 0);
  }
  // janela redonda (escotilha) com o céu da noite
  I.objeto('observatorio-janela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 13;
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, METAL); circulo(ctx, cx, cy, 5, METAL2);
      circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, MARINHO);
      // nebulinha em pontilhado: roxo embaixo, magenta no meio, um fio ciano
      for (var j = -3; j <= 3; j++) for (var i = -3; i <= 3; i++) {
        if (i * i + j * j > 10) continue;
        var l = limiar(cx + i, cy + j);
        if (j >= 1 && l < 0.7) ret(ctx, cx + i, cy + j, 1, 1, l < 0.3 ? G_MAGENTA : G_ROXO);
        else if (j === 0 && l < 0.35) ret(ctx, cx + i, cy + j, 1, 1, G_AZUL);
      }
      ret(ctx, cx - 2, cy - 1, 1, 1, G_CIANO);
      ret(ctx, cx + 1, cy - 2, 1, 1, LILAS);
      ret(ctx, cx - 5, cy - 5, 1, 1, C.branco); ret(ctx, cx + 5, cy + 4, 1, 1, METAL3);
      ret(ctx, cx - 4, py + 22, 9, 2, K); ret(ctx, cx - 3, py + 22, 7, 1, METAL);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      piscar(ctx, px + 6, py + 12, t, (o.x || 0) + 1, false);
      piscar(ctx, px + 10, py + 14, t, (o.x || 0) + 4, false);
    } });
  // pedaço de céu pintado no domo do Planetário, com a Via Láctea
  I.objeto('observatorio-ceu', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * T;
      ret(ctx, px + 1, py + 3, W - 2, 14, MARINHO);
      // nebulosa em pontilhado (a mesma conta da parede: continua de um pedaço de céu para o outro)
      for (var jj = 0; jj < 14; jj++) for (var ii = 0; ii < W - 2; ii++) {
        var cn = corNebulosa(px + 1 + ii, py + 3 + jj, 1.1);
        if (cn) ret(ctx, px + 1 + ii, py + 3 + jj, 1, 1, cn);
      }
      // a Via Láctea: faixa clara em pontilhado, subindo para a direita
      for (var i = 0; i < W - 2; i++) {
        var y = py + 12 - Math.round(i * 7 / (W - 2));
        for (var d = -2; d <= 2; d++) {
          var l = limiar(px + 1 + i, y + d);
          if (Math.abs(d) <= 1 ? l < 0.75 : l < 0.3) ret(ctx, px + 1 + i, y + d, 1, 1, d === 0 ? (l < 0.3 ? '#efe8ff' : G_LILAS) : '#8f86e0');
        }
      }
      for (var k = 0; k < 6; k++) ret(ctx, px + 2 + Math.floor(sorte(o.x, k, 7) * (W - 4)), py + 4 + Math.floor(sorte(k, o.x, 9) * 12), 1, 1, [LILAS, G_CIANO, C.branco, G_ROSA][k % 4]);
      ret(ctx, px + 1, py + 17, W - 2, 1, AMARELA);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var W = (o.w || 2) * T;
      for (var k = 0; k < 3; k++) {
        var x = px + 3 + Math.floor(sorte(o.x, k, 21) * (W - 6)), y = py + 5 + Math.floor(sorte(k, o.x, 23) * 10);
        piscar(ctx, x, y, t, o.x + k * 3, k === 0);
      }
      // o primeiro pedaço de céu também cuida das estrelas da parede do Planetário
      if (o.x === PLA.x + 1) cintilarParede(ctx, 'planetario', t);
    } });
  // quadros do espaço: Lua, cometa, galáxia, astronauta e foguete
  var QUADROS = {
    lua: function (ctx, x, y) { circulo(ctx, x + 5, y + 7, 4, '#e8e4d8'); ret(ctx, x + 3, y + 6, 2, 1, '#b8b2a4'); ret(ctx, x + 6, y + 9, 1, 1, '#b8b2a4'); ret(ctx, x + 1, y + 2, 1, 1, ESTRELA); ret(ctx, x + 8, y + 12, 1, 1, LILAS); },
    cometa: function (ctx, x, y) {
      for (var i = 0; i < 6; i++) ret(ctx, x + 1 + i, y + 2 + i, 2, 1, i < 3 ? '#6fc8ff' : CIANO);
      circulo(ctx, x + 8, y + 9, 2, C.branco); ret(ctx, x + 2, y + 11, 1, 1, ESTRELA);
    },
    galaxia: function (ctx, x, y) {
      elipse(ctx, x + 5, y + 7, 4, 2, '#6a5ac0'); ret(ctx, x + 4, y + 6, 3, 2, '#ffe0f4');
      ret(ctx, x + 1, y + 5, 2, 1, '#b58cff'); ret(ctx, x + 8, y + 9, 2, 1, '#b58cff'); ret(ctx, x + 1, y + 1, 1, 1, ESTRELA); ret(ctx, x + 9, y + 12, 1, 1, ESTRELA);
    },
    astronauta: function (ctx, x, y) {
      circulo(ctx, x + 5, y + 5, 3, C.branco); elipse(ctx, x + 5, y + 5, 2, 1, '#ffd34d');
      ret(ctx, x + 2, y + 9, 7, 4, C.branco); ret(ctx, x + 3, y + 10, 2, 1, '#2e9a4e'); ret(ctx, x + 4, y + 10, 1, 1, '#ffd34d');
    },
    foguete: function (ctx, x, y) {
      triangulo(ctx, x + 3, y + 1, 5, 3, C.vermelho); ret(ctx, x + 4, y + 4, 3, 6, C.branco); ret(ctx, x + 5, y + 6, 1, 1, C.azul);
      ret(ctx, x + 3, y + 8, 1, 2, C.vermelho); ret(ctx, x + 7, y + 8, 1, 2, C.vermelho); ret(ctx, x + 5, y + 10, 1, 2, C.laranja); ret(ctx, x + 4, y + 12, 3, 1, C.ouro);
    },
  };
  I.objeto('observatorio-quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 2, y = py + 7;
      contornoRet(ctx, x, y, 12, 17, C.ouro2);
      ret(ctx, x + 1, y + 1, 10, 1, C.ouro);
      ret(ctx, x + 2, y + 2, 8, 13, CEU);
      (QUADROS[v(o, 'cena', 'lua')] || QUADROS.lua)(ctx, x + 1, y + 1);
      ret(ctx, x + 5, y - 3, 2, 3, K);
    } });
  // carta celeste pequena (pergaminho azul com uma constelação)
  var CARTAS = {
    cruzeiro: [[5, 2], [5, 12], [2, 7], [8, 6], [6, 9]],
    marias: [[2, 3], [8, 3], [4, 7], [5, 7], [6, 7], [2, 12], [8, 12]],
    ursa: [[1, 4], [3, 3], [5, 4], [7, 5], [7, 9], [9, 10], [9, 6]],
  };
  var LINHAS_CARTA = { cruzeiro: [[0, 1], [2, 3]], marias: [[0, 2], [4, 1], [2, 5], [4, 6]], ursa: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] };
  function linhaPontos(ctx, a, b, cor) {
    var n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (var i = 1; i < n; i++) ret(ctx, Math.round(a[0] + (b[0] - a[0]) * i / n), Math.round(a[1] + (b[1] - a[1]) * i / n), 1, 1, cor);
  }
  I.objeto('observatorio-carta', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 2, y = py + 6, d = v(o, 'desenho', 'cruzeiro');
      ret(ctx, x - 1, y - 1, 14, 3, K); ret(ctx, x, y, 12, 1, C.madeiraClara);
      contornoRet(ctx, x, y + 1, 12, 17, '#2a3380');
      ret(ctx, x - 1, y + 17, 14, 3, K); ret(ctx, x, y + 18, 12, 1, C.madeiraClara);
      var pts = CARTAS[d] || CARTAS.cruzeiro;
      (LINHAS_CARTA[d] || []).forEach(function (l) { linhaPontos(ctx, [x + 1 + pts[l[0]][0], y + 2 + pts[l[0]][1]], [x + 1 + pts[l[1]][0], y + 2 + pts[l[1]][1]], '#5a64b8'); });
      pts.forEach(function (p, i) { ret(ctx, x + 1 + p[0], y + 2 + p[1], 1, 1, i === 0 ? AMARELA : ESTRELA); });
    } });
  // mapa grande das constelações (interativo, na Galeria)
  var MAPA_CRUZ = [[9, 4], [9, 15], [5, 9], [13, 8], [11, 12]];
  var MAPA_MARIAS = [[31, 9], [33, 10], [35, 11]];
  var MAPA_ORION = [[29, 4], [38, 5], [28, 16], [38, 17]];
  var MAPA_ESCORPIAO = [[18, 5], [20, 7], [21, 10], [21, 13], [23, 15], [26, 15], [27, 13]];
  I.objeto('observatorio-mapa-constelacoes', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * T, x = px + 2, y = py + 4, w = W - 4;
      ret(ctx, x - 1, y - 1, w + 2, 24, K);
      ret(ctx, x, y, w, 22, C.ouro2); ret(ctx, x, y, w, 1, C.ouro);
      ret(ctx, x + 2, y + 2, w - 4, 18, MARINHO);
      // nebulosa bem de leve no fundo do mapa (as constelações continuam na frente)
      for (var nj = 0; nj < 18; nj++) for (var ni = 0; ni < w - 4; ni++) {
        var cn = corNebulosa(x + 2 + ni, y + 2 + nj, 0.55);
        if (cn && limiar(ni, nj) < 0.6) ret(ctx, x + 2 + ni, y + 2 + nj, 1, 1, misturar(cn, MARINHO, 0.35));
      }
      linhaPontos(ctx, [x + 2 + 9, y + 2 + 4], [x + 2 + 9, y + 2 + 15], '#5a64b8');
      linhaPontos(ctx, [x + 2 + 5, y + 2 + 9], [x + 2 + 13, y + 2 + 8], '#5a64b8');
      for (var i = 0; i < MAPA_ESCORPIAO.length - 1; i++) linhaPontos(ctx, [x + 2 + MAPA_ESCORPIAO[i][0], y + 2 + MAPA_ESCORPIAO[i][1]], [x + 2 + MAPA_ESCORPIAO[i + 1][0], y + 2 + MAPA_ESCORPIAO[i + 1][1]], '#6a5aa8');
      linhaPontos(ctx, [x + 2 + 29, y + 2 + 4], [x + 2 + 31, y + 2 + 9], '#5a64b8'); linhaPontos(ctx, [x + 2 + 38, y + 2 + 5], [x + 2 + 35, y + 2 + 11], '#5a64b8');
      linhaPontos(ctx, [x + 2 + 31, y + 2 + 9], [x + 2 + 28, y + 2 + 16], '#5a64b8'); linhaPontos(ctx, [x + 2 + 35, y + 2 + 11], [x + 2 + 38, y + 2 + 17], '#5a64b8');
      MAPA_CRUZ.concat(MAPA_ORION).forEach(function (p) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, ESTRELA); });
      MAPA_MARIAS.forEach(function (p) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, CIANO); });
      MAPA_ESCORPIAO.forEach(function (p, i) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, i === 1 ? '#ff8a6a' : '#e8d8ff'); });
      for (var k = 0; k < 10; k++) ret(ctx, x + 3 + Math.floor(sorte(k, 3, 5) * (w - 6)), y + 3 + Math.floor(sorte(3, k, 7) * 16), 1, 1, '#4a52a0');
      ret(ctx, x + w / 2 - 3, y - 4, 6, 3, K); ret(ctx, x + w / 2 - 2, y - 3, 4, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var x = px + 4, y = py + 6;
      MAPA_CRUZ.forEach(function (p, i) { piscar(ctx, x + p[0], y + p[1], t, i * 2 + 1, i < 2); });
      cintilarParede(ctx, 'galeria', t);
      poeiraPiso(ctx, 'galeria', t);
    } });

  // para as outras partes (R._predios.observatorio)
  S.linhaPontos = linhaPontos;
})();
