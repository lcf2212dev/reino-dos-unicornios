/* Montanha Gelada, os objetos da mata nevada (prefixo gelo-): o pinheiro nevado (pequeno e grande), o monte de neve,
   a pedra azulada com neve em cima, o toco nevado, os cristais de gelo, o tronco caído e o laguinho congelado
   (sólidos). Mais abaixo, na segunda parte: os que se tocam e os enfeites do chão. Reino._predios.gelo guarda
   P.sombra. Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).gelo = R._predios.gelo || {};
  var PINHO = ['#2f6660', '#4a8a7a', '#1f4a4a'], NEVE = ['#f6faff', '#d4e4f4', '#a9c3e4'];
  var TRONCO = ['#4a3442', '#6a4e58', '#8c6c74'];
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(60,70,130,0.22)'); }
  P.sombra = sombra;
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 1, h, TRONCO[2]); ret(ctx, x + w - 1, y, 1, h, TRONCO[0]); }
  // um pinheiro nevado: camadas [y do topo, altura, meia largura], o contorno de todas antes, depois o verde
  // (de baixo para cima, a camada de cima por cima) e a neve em cada uma, escorrendo em gotas
  function pinheiro(ctx, cx, py, camadas) {
    var c, r, w;
    camadas.forEach(function (k) {
      for (r = -1; r <= k[1]; r++) { w = Math.round(k[2] * (Math.max(r, 0) + 1) / k[1]) + 1; ret(ctx, cx - w, py + k[0] + r, w * 2 + 1, 1, K); }
    });
    for (var i = camadas.length - 1; i >= 0; i--) {
      c = camadas[i];
      var neve = Math.max(2, Math.round(c[1] * 0.4));
      for (r = 0; r < c[1]; r++) {
        w = Math.round(c[2] * (r + 1) / c[1]);
        ret(ctx, cx - w, py + c[0] + r, w * 2 + 1, 1, r === c[1] - 1 ? PINHO[2] : PINHO[0]);
        ret(ctx, cx - w, py + c[0] + r, Math.max(1, w), 1, r === c[1] - 1 ? PINHO[2] : PINHO[1]);
        if (r < neve) { ret(ctx, cx - w, py + c[0] + r, w * 2 + 1, 1, NEVE[0]); ret(ctx, cx + Math.ceil(w / 2), py + c[0] + r, Math.ceil(w / 2) + 1, 1, NEVE[1]); }
      }
      w = Math.round(c[2] * (neve + 1) / c[1]);
      for (var x = -w + 1; x < w; x += 3) ret(ctx, cx + x, py + c[0] + neve, 2, 1 + ((x + 9) % 2), NEVE[0]);   // as gotas de neve
    }
  }

  /* ---------- pinheiros (sólidos na base, desenhados na ordem por Y) ---------- */
  I.objeto('gelo-pinheiro', { w: 1, h: 1, solido: true, alto: true, topo: 32,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      tronco(ctx, px + 7, py + 6, 3, 9);
      pinheiro(ctx, px + 8, py, [[-29, 11, 4], [-21, 13, 6], [-11, 15, 7]]);
    } });
  I.objeto('gelo-pinheiro-g', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 14, py + 4, 5, 11);
      pinheiro(ctx, px + 16, py, [[-44, 13, 6], [-34, 15, 9], [-22, 16, 12], [-10, 15, 14]]);
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('gelo-monte', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 8, 6, K); elipse(ctx, px + 8, py + 9, 7, 5, NEVE[1]);
      elipse(ctx, px + 7, py + 8, 6, 4, NEVE[0]); ret(ctx, px + 4, py + 5, 4, 1, '#ffffff');
      ret(ctx, px + 3, py + 13, 10, 1, NEVE[2]);
    } });
  I.objeto('gelo-pedra', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, '#7f8fc0');
      elipse(ctx, px + 7, py + 9, 4, 2, '#a3b0dc'); ret(ctx, px + 11, py + 10, 2, 2, '#5f6a9c');
      elipse(ctx, px + 7, py + 5, 5, 2, K); elipse(ctx, px + 7, py + 5, 4, 1, NEVE[0]); ret(ctx, px + 3, py + 6, 2, 1, NEVE[0]);   // neve em cima
    } });
  I.objeto('gelo-toco', { w: 1, h: 1, solido: true, topo: 5,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, TRONCO[1]); ret(ctx, px + 3, py + 7, 2, 7, TRONCO[2]);
      elipse(ctx, px + 8, py + 5, 7, 3, K); elipse(ctx, px + 8, py + 5, 6, 2, NEVE[0]); ret(ctx, px + 5, py + 7, 2, 2, NEVE[0]); ret(ctx, px + 10, py + 7, 1, 3, NEVE[0]);
    } });
  // os cristais de gelo: três pontas lilás e azuis, com o brilho em cima
  I.objeto('gelo-cristal', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      [[4, 2, 3, '#b8a8f0', '#e4dcff'], [8, -6, 4, '#8fd0f4', '#e0f6ff'], [12, 3, 3, '#a0b8f4', '#e4ecff']].forEach(function (c) {
        ret(ctx, px + c[0] - c[2] - 1, py + c[1] + 2, c[2] * 2 + 3, 13 - c[1], K); ret(ctx, px + c[0] - c[2] + 1, py + c[1] - 1, c[2] * 2 - 1, 3, K);
        ret(ctx, px + c[0] - c[2], py + c[1] + 2, c[2] * 2 + 1, 12 - c[1], c[3]); ret(ctx, px + c[0] - c[2] + 2, py + c[1], c[2] * 2 - 3, 2, c[3]);
        ret(ctx, px + c[0] - c[2] + 1, py + c[1] + 2, 1, 8 - c[1], c[4]);
      });
    } });
  I.objeto('gelo-tronco', { w: 2, h: 1, solido: true, topo: 6,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 2, py + 5, 28, 10, K); ret(ctx, px + 3, py + 6, 26, 8, TRONCO[1]); ret(ctx, px + 3, py + 12, 26, 2, TRONCO[0]);
      ret(ctx, px + 1, py + 6, 3, 8, K); ret(ctx, px + 2, py + 7, 1, 6, '#3a2a36');   // a ponta oca
      ret(ctx, px + 4, py + 3, 24, 4, K); ret(ctx, px + 5, py + 4, 22, 3, NEVE[0]); ret(ctx, px + 8, py + 7, 2, 2, NEVE[0]); ret(ctx, px + 19, py + 7, 3, 1, NEVE[0]);   // a neve em cima
      ret(ctx, px + 20, py + 4, 7, 1, NEVE[1]);
    } });
  // o laguinho congelado: gelo liso com a beira de neve, rachaduras e o reflexo (sólido: ela contorna)
  I.objeto('gelo-lago', { w: 2, h: 1, solido: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 9, 15, 6, K); elipse(ctx, px + 16, py + 9, 14, 5, NEVE[0]);
      elipse(ctx, px + 16, py + 9, 12, 4, '#9cc8ec'); elipse(ctx, px + 15, py + 8, 9, 2, '#bfe0f8');
      ret(ctx, px + 9, py + 10, 4, 1, '#e8f6ff'); ret(ctx, px + 13, py + 9, 1, 1, '#e8f6ff'); ret(ctx, px + 19, py + 11, 5, 1, '#e8f6ff');
      ret(ctx, px + 20, py + 7, 3, 1, '#ffffff'); ret(ctx, px + 21, py + 6, 1, 3, '#ffffff');
    } });
})();
/* Segunda parte: os que se tocam e os enfeites do chão (prefixo gelo-): a placa, o iglu, o trenó, o unicórnio de gelo
   (com fala) e a lanterna de gelo; capim com geada, flocos, pegadas de passarinho, gelinho, florzinhas de inverno,
   galhos, bolas de neve, brilhos e as pedrinhas da trilha (não sólidos). O brilho parado fica no `desenhar`; o piscar,
   no `anim` (só com Animações; com t = 0 fica parado). Usa P.sombra (da primeira parte). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).gelo = R._predios.gelo || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  var NEVE = ['#f6faff', '#d4e4f4', '#a9c3e4'];
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }
  function sombra(ctx, cx, y, rx) { if (P.sombra) P.sombra(ctx, cx, y, rx); }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

  /* ---------- os que se tocam ---------- */
  // a placa de madeira com neve em cima e um floco pintado
  I.objeto('gelo-placa', { w: 1, h: 1, solido: true, topo: 9,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, '#7a5a48');
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#b88a70'); ret(ctx, px + 1, py + 5, 14, 2, '#8c6450');
      ret(ctx, px, py - 6, 16, 3, K); ret(ctx, px + 1, py - 5, 14, 2, NEVE[0]); ret(ctx, px + 3, py - 3, 2, 1, NEVE[0]); ret(ctx, px + 11, py - 3, 3, 1, NEVE[0]);
      ret(ctx, px + 7, py - 2, 1, 7, '#ffffff'); ret(ctx, px + 4, py + 1, 7, 1, '#ffffff');   // o floco
      ret(ctx, px + 5, py - 1, 1, 1, '#ffffff'); ret(ctx, px + 9, py - 1, 1, 1, '#ffffff'); ret(ctx, px + 5, py + 3, 1, 1, '#ffffff'); ret(ctx, px + 9, py + 3, 1, 1, '#ffffff');
    } });
  // o iglu: a cúpula de blocos de gelo, a portinha escura em arco e a neve em cima
  I.objeto('gelo-iglu', { w: 2, h: 1, solido: true, topo: 9,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ctx.save(); ctx.beginPath(); ctx.rect(px, py - 12, 32, 27); ctx.clip();
      elipse(ctx, px + 16, py + 14, 15, 23, K); elipse(ctx, px + 16, py + 14, 14, 22, '#e6f0fb');
      elipse(ctx, px + 13, py + 10, 9, 15, NEVE[0]);
      [-3, 2, 7, 11].forEach(function (y, i) {   // as fileiras de blocos
        var w = [16, 24, 26, 28][i];
        ret(ctx, px + 16 - w / 2, py + y, w, 1, '#b9cfe8');
        for (var x = 16 - w / 2 + (i % 2 ? 3 : 6); x < 16 + w / 2 - 1; x += 7) ret(ctx, px + x, py + y - 4, 1, 4, '#c8daee');
      });
      ctx.restore();
      ret(ctx, px + 1, py + 14, 30, 1, K);
      ret(ctx, px + 11, py + 4, 10, 11, K); ret(ctx, px + 12, py + 3, 8, 1, K);
      ret(ctx, px + 12, py + 5, 8, 9, '#3a4a86'); ret(ctx, px + 13, py + 4, 6, 1, '#3a4a86'); ret(ctx, px + 13, py + 6, 2, 7, '#4f62a8');   // a porta
      ret(ctx, px + 10, py - 8, 6, 1, '#ffffff');
    } });
  // o trenó vermelho com os esquis curvos e uma manta lilás
  I.objeto('gelo-treno', { w: 2, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 3, py + 12, 26, 3, K); ret(ctx, px + 4, py + 13, 24, 1, '#c8d0e0'); ret(ctx, px + 27, py + 9, 3, 5, K); ret(ctx, px + 28, py + 10, 1, 3, '#c8d0e0');
      ret(ctx, px + 8, py + 10, 2, 3, K); ret(ctx, px + 21, py + 10, 2, 3, K);
      ret(ctx, px + 4, py + 2, 22, 9, K); ret(ctx, px + 5, py + 3, 20, 7, '#e0485e'); ret(ctx, px + 5, py + 3, 20, 2, '#ff7a8a'); ret(ctx, px + 5, py + 8, 20, 2, '#a83048');
      ret(ctx, px + 3, py - 2, 4, 10, K); ret(ctx, px + 4, py - 1, 2, 8, '#e0485e');   // o encosto
      ret(ctx, px + 10, py + 1, 10, 5, K); ret(ctx, px + 11, py + 2, 8, 3, '#b8a8f0'); ret(ctx, px + 12, py + 2, 2, 3, '#e4dcff');   // a manta
      ret(ctx, px + 7, py + 1, 3, 1, NEVE[0]); ret(ctx, px + 21, py + 2, 3, 1, NEVE[0]);
    } });
  // o unicórnio de gelo: uma escultura azul-clara num pedestal de neve, com o chifre lilás
  var GELO = ['#bfe6ff', '#8fc8f0', '#ffffff'];
  I.objeto('gelo-estatua', { w: 2, h: 1, solido: true, topo: 22,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 3, py + 5, 26, 10, K); ret(ctx, px + 4, py + 6, 24, 8, NEVE[0]); ret(ctx, px + 4, py + 11, 24, 3, NEVE[1]); ret(ctx, px + 4, py + 9, 24, 1, NEVE[2]);
      // pernas, corpo, pescoço, cabeça e rabo (contorno primeiro)
      [[9, 0, 3, 6], [13, 0, 3, 6], [18, 0, 3, 6], [22, 0, 3, 6]].forEach(function (l) { ret(ctx, px + l[0] - 1, py + l[1], l[2] + 2, l[3], K); });
      elipse(ctx, px + 16, py - 3, 10, 5, K); ret(ctx, px + 20, py - 15, 7, 12, K); ret(ctx, px + 21, py - 18, 10, 7, K);
      ret(ctx, px + 4, py - 6, 4, 8, K);
      [[9, 0, 3, 5], [13, 0, 3, 5], [18, 0, 3, 5], [22, 0, 3, 5]].forEach(function (l) { ret(ctx, px + l[0], py + l[1], l[2], l[3], GELO[1]); });
      elipse(ctx, px + 16, py - 3, 9, 4, GELO[0]); ret(ctx, px + 21, py - 14, 5, 11, GELO[0]); ret(ctx, px + 22, py - 17, 8, 5, GELO[0]);
      ret(ctx, px + 5, py - 5, 2, 6, '#c8b4f0'); ret(ctx, px + 19, py - 16, 2, 8, '#c8b4f0');   // rabo e crina lilases
      ret(ctx, px + 27, py - 16, 1, 1, K);   // o olho
      ret(ctx, px + 24, py - 20, 3, 3, K); ret(ctx, px + 25, py - 23, 3, 3, K); ret(ctx, px + 25, py - 19, 1, 2, '#e4b0ff'); ret(ctx, px + 26, py - 22, 1, 2, '#f4d8ff');   // o chifre
      ret(ctx, px + 10, py - 6, 6, 1, GELO[2]); ret(ctx, px + 22, py - 16, 3, 1, GELO[2]); ret(ctx, px + 22, py - 12, 1, 5, GELO[2]);   // reflexos
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 500) % 4 : 3;
      if (f < 3) brilho(ctx, px + [12, 24, 17][f], py + [-5, -14, -2][f], '#ffffff');
    } });
  // a lanterna de gelo: um poste de madeira com o potinho de luz azul pendurado (o halo parado, o brilho no anim)
  I.objeto('gelo-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      elipse(ctx, px + 9, py - 11, 13, 13, 'rgba(160,220,255,0.12)'); elipse(ctx, px + 9, py - 11, 9, 9, 'rgba(160,220,255,0.16)');
      ret(ctx, px + 5, py - 18, 3, 33, K); ret(ctx, px + 6, py - 18, 1, 32, '#8c6c74'); ret(ctx, px + 7, py - 18, 1, 32, '#4a3442');
      ret(ctx, px + 5, py - 21, 10, 3, K); ret(ctx, px + 6, py - 20, 8, 1, NEVE[0]); ret(ctx, px + 12, py - 18, 2, 3, K);
      ret(ctx, px + 9, py - 15, 8, 11, K); ret(ctx, px + 10, py - 14, 6, 9, '#a8e0ff'); ret(ctx, px + 11, py - 13, 2, 6, '#e8f8ff'); ret(ctx, px + 9, py - 16, 8, 2, K);
      ret(ctx, px + 14, py - 8, 1, 1, '#ffffff');
      ret(ctx, px + 3, py + 12, 9, 4, K); ret(ctx, px + 4, py + 12, 7, 3, NEVE[0]);   // neve no pé do poste
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 380) % 3 : 0;
      brilho(ctx, px + 3 + f * 6, py - 22 + (f & 1) * 6, '#ffffff');
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  I.objeto('gelo-capim', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[2, 6], [5, 9], [8, 7], [11, 10], [13, 5]].forEach(function (l, i) {
        ret(ctx, px + l[0], py + 15 - l[1], 1, l[1], i % 2 ? '#6a9a8a' : '#8ab8a4');
        ret(ctx, px + l[0], py + 15 - l[1], 1, 2, '#ffffff');   // a geada na ponta
      });
    } });
  I.objeto('gelo-flocos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[4, 5, '#9fbbe0'], [11, 10, '#b8a8f0']].forEach(function (f) {
        ret(ctx, px + f[0], py + f[1] - 2, 1, 5, f[2]); ret(ctx, px + f[0] - 2, py + f[1], 5, 1, f[2]);
        ret(ctx, px + f[0] - 1, py + f[1] - 1, 1, 1, f[2]); ret(ctx, px + f[0] + 1, py + f[1] + 1, 1, 1, f[2]);
        ret(ctx, px + f[0] + 1, py + f[1] - 1, 1, 1, f[2]); ret(ctx, px + f[0] - 1, py + f[1] + 1, 1, 1, f[2]);
      });
    } });
  I.objeto('gelo-pegadas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {   // pegadas de passarinho
      [[3, 12], [7, 8], [11, 4]].forEach(function (p) {
        ret(ctx, px + p[0], py + p[1], 1, 3, '#9fb4d4'); ret(ctx, px + p[0] - 1, py + p[1], 1, 1, '#9fb4d4'); ret(ctx, px + p[0] + 1, py + p[1], 1, 1, '#9fb4d4');
      });
    } });
  I.objeto('gelo-gelinho', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 6, 3, '#a8cdec'); elipse(ctx, px + 8, py + 10, 4, 2, '#c4e0f6');
      ret(ctx, px + 5, py + 9, 3, 1, '#ffffff'); ret(ctx, px + 10, py + 11, 2, 1, '#e8f6ff');
    } });
  var PETALA = ['#b8a8f0', '#8fd0f4', '#ffb0d8'];
  I.objeto('gelo-flor', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {   // florzinha de inverno, com o cabinho verde
      var n = (o.var && o.var.n) || 0;
      [[5, 9], [11, 12]].forEach(function (f, i) {
        ret(ctx, px + f[0], py + f[1], 1, 4, '#5f9a7a');
        ret(ctx, px + f[0] - 2, py + f[1] - 3, 5, 3, K); ret(ctx, px + f[0] - 1, py + f[1] - 4, 3, 1, K);
        ret(ctx, px + f[0] - 1, py + f[1] - 3, 3, 2, PETALA[(n + i) % 3]); ret(ctx, px + f[0], py + f[1] - 3, 1, 1, '#ffffff');
      });
    } });
  I.objeto('gelo-galhos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 10, 9, 1, '#6a4e58'); ret(ctx, px + 6, py + 8, 1, 2, '#6a4e58'); ret(ctx, px + 9, py + 11, 4, 1, '#6a4e58');
      ret(ctx, px + 3, py + 9, 4, 1, '#ffffff');
    } });
  I.objeto('gelo-bolas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {   // um montinho de bolas de neve
      [[5, 11, 3], [10, 11, 3], [8, 7, 3]].forEach(function (b) {
        circulo(ctx, px + b[0], py + b[1], b[2], K); circulo(ctx, px + b[0], py + b[1], b[2] - 1, NEVE[0]); ret(ctx, px + b[0], py + b[1] + 1, 2, 1, NEVE[2]);
      });
    } });
  var BRILHOS = [[3, 5, 0], [11, 4, 2], [8, 12, 4]];   // [x, y, fase] de cada brilhinho
  I.objeto('gelo-brilho', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      BRILHOS.forEach(function (b) { ret(ctx, px + b[0], py + b[1], 1, 1, '#c4b4ec'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < BRILHOS.length; n++) {
        var b = BRILHOS[n];
        if (t && Math.floor(t / 300 + b[2]) % 3 === 0) brilho(ctx, px + b[0], py + b[1], '#ffffff');
      }
    } });
  // pedrinhas azuladas na trilha
  I.objeto('gelo-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, 4, 3], [10, 4, 3, 3], [9, 11, 4, 3]].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], s[2], s[3], '#8a9cc8'); ret(ctx, px + s[0] + 1, py + s[1] + 1, s[2] - 2, s[3] - 2, '#c4d0ee');
      });
    } });
})();
