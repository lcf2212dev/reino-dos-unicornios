/* Montanha Gelada, o chão e o céu aberto (docs/contratos/arenas.md): o piso 'gelo-neve' (neve fofa com montinhos e
   brilhos; a trilha é a neve pisada, com pegadas), a parede 'gelo-pinheiros' (a fileira de pinheiros nevados lá no
   fundo, com o céu frio claro atrás) e o fundo I.FUNDOS.gelo (o lago congelado em volta, com rachaduras, montes de
   neve e brilhos; `saida` = o portal de volta, azul-gelo, Reino.Portal.saida).
   As trilhas ficam em Reino._predios.gelo (P.trilha), para o layout (a segunda parte, abaixo) não pôr nada sólido
   nelas. No carregamento só registra funções e monta os dados do layout: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse;
  var sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).gelo = R._predios.gelo || {};

  /* ---------- as trilhas de neve pisada (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o pico, em zigue-zague
  var CAMINHOS = [
    [[28, 40], [28, 35], [22, 31], [24, 26], [31, 22], [30, 17], [24, 13], [27, 8], [29, 3]],   // a principal
    [[28, 35], [39, 34], [47, 31]], [[22, 31], [12, 32], [7, 29]],                              // fáceis, de lado
    [[24, 26], [12, 22]], [[31, 22], [43, 20]],                                                 // médias
    [[24, 13], [12, 9]], [[30, 17], [43, 11]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(7031), t = {};
    CAMINHOS.forEach(function (c) {
      for (var s = 0; s < c.length - 1; s++) {
        var a = c[s], b = c[s + 1], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 2, fase = rng() * 6;
        for (var i = 0; i <= n; i++) {
          var f = i / n, x = Math.round(a[0] + (b[0] - a[0]) * f), y = Math.round(a[1] + (b[1] - a[1]) * f);
          if (Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])) x += Math.round(Math.sin(f * 3.1 + fase) * 1.2);
          else y += Math.round(Math.sin(f * 3.1 + fase) * 1.2);
          t[y * 100 + x] = 1; t[y * 100 + x + 1] = 1; t[(y + 1) * 100 + x] = 1; t[(y + 1) * 100 + x + 1] = 1;
        }
      }
    });
    return t;
  }
  P.trilha = function (tx, ty) { if (!_trilha) _trilha = montarTrilha(); return !!_trilha[ty * 100 + tx]; };

  /* ---------- o piso: neve fofa, montinhos com a sombra azul e brilhos; a trilha é a neve pisada ---------- */
  I.PISOS['gelo-neve'] = { cores: { piso: '#eaf3fb', piso2: '#dceaf7', detalhe: '#b9cfe8', luz: '#ffffff' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        // neve pisada: só um pouco mais azulada, com pegadas de bota; na beira, os montinhos da neve fofa
        ret(ctx, px, py, 16, 16, '#dde9f5');
        var fx = px + 3 + Math.floor(sorte(tx, ty, 32) * 6), fy = py + 1 + Math.floor(sorte(tx, ty, 33) * 4);
        ret(ctx, fx, fy, 2, 3, '#b4c9e4'); ret(ctx, fx + 4, fy + 7, 2, 3, '#b4c9e4');   // pegadas
        ret(ctx, fx, fy, 2, 1, '#c6d7ec'); ret(ctx, fx + 4, fy + 7, 2, 1, '#c6d7ec');
        if (!P.trilha(tx - 1, ty)) [3, 11].forEach(function (y) { elipse(ctx, px + 1, py + y, 2, 3, p.piso); ret(ctx, px + 2, py + y + 2, 2, 1, '#c6d7ec'); });
        if (!P.trilha(tx + 1, ty)) [6, 13].forEach(function (y) { elipse(ctx, px + 14, py + y, 2, 3, p.piso); ret(ctx, px + 12, py + y + 2, 2, 1, '#c6d7ec'); });
        if (!P.trilha(tx, ty - 1)) [4, 12].forEach(function (x) { elipse(ctx, px + x, py + 1, 3, 2, p.piso); ret(ctx, px + x - 2, py + 3, 4, 1, '#c6d7ec'); });
        return;
      }
      // montinhos de neve (a luz em cima, a sombra azul embaixo) e manchas mais frias
      if (sorte(tx, ty, 1) < 0.25) {
        var mx = px + 3 + Math.floor(sorte(tx, ty, 2) * 5), my = py + 5 + Math.floor(sorte(tx, ty, 3) * 5);
        elipse(ctx, mx + 4, my + 3, 5, 2, '#c7dbef'); elipse(ctx, mx + 4, my + 2, 4, 1, p.luz);
      } else if (sorte(tx, ty, 4) < 0.5) elipse(ctx, px + 4 + Math.floor(sorte(tx, ty, 5) * 8), py + 6, 4, 2, p.piso2);
      if (sorte(tx, ty, 6) < 0.3) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 7) * 10), py + 11, 4, 1, p.detalhe);
      // brilhos da neve: pontinhos brancos, azuis e lilases
      for (i = 0; i < 2; i++) {
        var bx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 14), by = py + 1 + Math.floor(sorte(tx, ty, 20 + i) * 14);
        ret(ctx, bx, by, 1, 1, sorte(tx, ty, 40 + i) < 0.5 ? '#9fbbe0' : '#c4b4ec');
      }
      if (sorte(tx, ty, 8) < 0.2) { var sx = px + 4 + Math.floor(sorte(tx, ty, 9) * 8); ret(ctx, sx, py + 7, 1, 3, p.luz); ret(ctx, sx - 1, py + 8, 3, 1, p.luz); }
    } };

  /* ---------- a parede: os pinheiros nevados lá no fundo, com o céu frio atrás e a neve na base ---------- */
  var PINHO = ['#2a5a5e', '#3d7a72', '#1f4448'];
  function pinhoFundo(ctx, cx, base, alt) {
    for (var r = 0; r < alt; r++) {
      var w = Math.round(1 + r * 0.45);
      ret(ctx, cx - w, base - alt + r, w * 2 + 1, 1, r % 5 === 4 ? PINHO[2] : PINHO[0]);
      ret(ctx, cx - w, base - alt + r, w, 1, PINHO[1]);
      if (r % 5 === 0) ret(ctx, cx - w, base - alt + r, w * 2 + 1, 1, '#f4f9ff');   // a neve em cada galho
    }
  }
  I.PAREDES['gelo-pinheiros'] = { cores: { parede: '#2a5a5e', parede2: '#3d7a72', rodape: '#b9cfe8', detalhe: '#f4f9ff' },
    desenhar: function (ctx, px, py, tx) {
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      ret(ctx, px, py, 16, 32, '#cfe2f6'); ret(ctx, px, py, 16, 6, '#bcd4f0');   // o céu frio e claro
      if (sorte(tx, 0, 61) < 0.4) ret(ctx, px + 3 + Math.floor(sorte(tx, 0, 62) * 8), py + 3, 5, 2, '#ffffff');   // nuvenzinha
      for (var k = -1; k <= 1; k++) {   // os vizinhos também, para a fileira emendar
        var c = tx + k, h = 20 + Math.floor(sorte(c, 0, 63) * 8);
        pinhoFundo(ctx, px + k * 16 + 4 + Math.floor(sorte(c, 0, 64) * 8), py + 28, h);
      }
      ret(ctx, px, py + 26, 16, 6, '#eaf3fb'); ret(ctx, px, py + 26, 16, 1, '#ffffff'); ret(ctx, px, py + 30, 16, 2, '#b9cfe8');
      ctx.restore();
    } };

  /* ---------- o céu aberto: o lago congelado em volta; a saída é o portal de volta (azul-gelo) ---------- */
  var GELO = ['#8fb2dc', '#a9c6e8', '#d6e8f8'];
  function lagoGelado(ctx, w, h) {
    ret(ctx, 0, 0, w, h, GELO[0]);
    for (var cy = 0; cy * 16 < h + 16; cy++) for (var cx = 0; cx * 16 < w + 16; cx++) {
      var x = cx * 16, y = cy * 16, s = sorte(cx, cy, 9);
      if (s < 0.45) ret(ctx, x + Math.floor(sorte(cx, cy, 10) * 8), y + 5, 7, 1, GELO[1]);          // reflexo
      if (s < 0.1) {                                                                              // monte de neve
        elipse(ctx, x + 8, y + 11, 7, 3, '#7a9ccc'); elipse(ctx, x + 6, y + 9, 5, 3, '#eaf3fb'); elipse(ctx, x + 11, y + 10, 4, 2, '#dceaf7');
        ret(ctx, x + 4, y + 7, 4, 1, '#ffffff');
      } else if (s < 0.2) {                                                                       // rachadura
        ret(ctx, x + 3, y + 8, 4, 1, GELO[2]); ret(ctx, x + 7, y + 9, 4, 1, GELO[2]); ret(ctx, x + 10, y + 7, 1, 2, GELO[2]);
      } else if (s < 0.27) { ret(ctx, x + 5, y + 11, 1, 3, '#ffffff'); ret(ctx, x + 4, y + 12, 3, 1, '#ffffff'); }   // brilho
    }
  }
  I.FUNDOS.gelo = { cor: GELO[0], desenhar: lagoGelado,
    saida: R.Portal.saida({ pedra: ['#7f8fb4', '#aab8d4', '#e2ecf8'], anel: ['#3f7fd0', '#8fd8ff', '#d8f0ff', '#ffffff'] }) };
})();
/* Montanha Gelada: o interior de céu aberto (lugar 'gelo'; docs/contratos/arenas.md). É a arena 3:
   Reino.registrarArena + os números em config.arenas.gelo (nucleo/config.js).
   Fixos (contrato das arenas): id 'gelo', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3
   a 40), saída (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'gelo', pacote
   'interior-gelo'. O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual.
   Zonas pelas fileiras (as do config): fáceis embaixo, médios no meio, difíceis e voadores em cima.
   O chão e o céu na primeira parte (acima); objetos em objetos.js, falas em falas.js, ícone e inimigos em inimigos.js,
   portal e lugar em lugar.js. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).gelo = R._predios.gelo || {};
  var F = ((R.FALAS_INTERIORES || {}).gelo || {}).objetos || {};
  var ALTOS = { 'gelo-pinheiro': 1, 'gelo-pinheiro-g': 1 };
  var L = I.arena({
    semente: 20261107,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as dos lagos congelados e as do fundo
    clareiras: [[28, 37, 5.5], [13, 34, 4], [42, 32, 4], [36, 37, 3], [13, 22, 4.5], [43, 23, 4.5], [27, 27, 3.5], [14, 10, 4], [41, 9, 4], [29, 5, 3.5]],
    fixos: [
      ['gelo-placa', 32, 36, 'Placa', F.placa],
      ['gelo-iglu', 18, 35, 'Iglu', F.iglu],
      ['gelo-treno', 40, 29, 'Trenó', F.treno],
      ['gelo-estatua', 11, 26, 'Unicórnio de gelo', F.estatua],
    ],
    enfeites: [
      ['gelo-lago', 12, 34], ['gelo-lago', 42, 33], ['gelo-lago', 27, 27], ['gelo-lago', 13, 10], ['gelo-lago', 42, 22],
      ['gelo-iglu', 45, 35], ['gelo-iglu', 9, 20], ['gelo-iglu', 39, 9],
      ['gelo-lanterna', 25, 33], ['gelo-lanterna', 31, 33], ['gelo-lanterna', 20, 28], ['gelo-lanterna', 28, 24],
      ['gelo-lanterna', 34, 20], ['gelo-lanterna', 27, 15], ['gelo-lanterna', 22, 11], ['gelo-lanterna', 31, 7],
      ['gelo-tronco', 17, 30], ['gelo-tronco', 37, 26], ['gelo-tronco', 19, 16], ['gelo-tronco', 36, 13],
      ['gelo-cristal', 15, 21], ['gelo-cristal', 46, 24], ['gelo-cristal', 16, 8], ['gelo-cristal', 44, 10],
      ['gelo-estatua', 29, 4],
    ],
    altos: ALTOS,
    borda: { lado: 'gelo-pinheiro-g', baixo: ['gelo-monte', 'gelo-pinheiro'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 37, 4], [48, 38, 4], [21, 33, 3], [37, 31, 3], [7, 17, 5], [21, 20, 4], [36, 23, 4], [49, 16, 5], [34, 17, 3],
      [8, 6, 5], [21, 5, 4], [37, 4, 4], [49, 6, 5], [19, 12, 4], [36, 12, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.32, 'gelo-pinheiro'], [0.52, 'gelo-pinheiro-g'], [0.68, 'gelo-monte'], [0.82, 'gelo-pedra'], [0.92, 'gelo-toco'], [1, 'gelo-cristal']],
    bolsao: ['gelo-monte', 'gelo-monte', 'gelo-pedra', 'gelo-toco'], coberto: 'gelo-monte',
    miudos: {
      comum: ['gelo-capim', 'gelo-capim', 'gelo-flocos', 'gelo-flocos', 'gelo-pegadas', 'gelo-gelinho', 'gelo-flor', 'gelo-galhos', 'gelo-bolas'],
      fundo: ['gelo-brilho', 'gelo-flor', 'gelo-gelinho', 'gelo-flocos', 'gelo-capim', 'gelo-bolas'], fundoAte: 20,
      trilha: 'gelo-pedrinhas', varN: { 'gelo-flor': 3 },
    },
  });

  R.registrarArena({ id: 'gelo', nome: 'Montanha Gelada', curto: 'Montanha', emoji: '🐧' });
  R.registrarInterior({
    id: 'gelo',
    lugar: 'gelo',
    nome: 'Montanha Gelada',
    entrada: true,
    pacote: 'interior-gelo',
    fundo: 'gelo',
    tamanho: L.tamanho,
    saida: L.saida,
    spawn: L.spawn,
    comodos: [{ id: 'gelo', nome: 'Montanha Gelada', rect: L.comodo, piso: 'gelo-neve', parede: 'gelo-pinheiros' }],
    objetos: L.objetos,
  });
})();
