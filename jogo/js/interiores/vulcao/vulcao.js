/* Vulcão dos Dragõezinhos, o chão e o céu aberto (docs/contratos/arenas.md): o piso 'vulcao-cinza' (chão de cinza
   morna com pedrinhas, rachaduras de lava e as lajes de basalto por onde passa a trilha), a parede 'vulcao-ceu' (o
   céu vermelho-escuro com cinzas caindo e as montanhas com vulcõezinhos lá no fundo) e o fundo I.FUNDOS.vulcao (o
   chão de lava esfriada em volta, com rios de lava; `saida` = o portal de volta, cor de lava, Reino.Portal.saida).
   As trilhas ficam em Reino._predios.vulcao (P.trilha), para o layout (a segunda parte, abaixo) não pôr nada sólido
   nelas. No carregamento só registra funções e monta os dados do layout: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse;
  var sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).vulcao = R._predios.vulcao || {};

  /* ---------- as trilhas de lajes (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o fundo, em zigue-zague
  var CAMINHOS = [
    [[28, 40], [28, 35], [23, 31], [25, 26], [32, 22], [30, 17], [24, 13], [27, 8], [29, 3]],   // a principal
    [[28, 35], [39, 33], [47, 34]], [[23, 31], [12, 30]],                                       // fáceis, de lado
    [[25, 26], [13, 22]], [[32, 22], [44, 20]],                                                 // médias
    [[30, 17], [42, 12]], [[24, 13], [13, 9]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(9101), t = {};
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

  /* ---------- o piso: cinza morna, pedrinhas, rachaduras de lava e as lajes de basalto da trilha ---------- */
  var LAJE = ['#86707a', '#ab979e', '#ccbcc0'];
  // uma pedra da trilha: quinas cortadas, luz em cima e à esquerda, sombra embaixo
  function laje(ctx, x, y, w, h) {
    ret(ctx, x + 1, y, w - 2, h, LAJE[0]); ret(ctx, x, y + 1, w, h - 2, LAJE[0]);
    ret(ctx, x + 1, y + 1, w - 2, h - 3, LAJE[1]); ret(ctx, x + 1, y + 1, w - 3, 1, LAJE[2]); ret(ctx, x + 1, y + 2, 1, Math.max(1, h - 5), LAJE[2]);
  }
  I.PISOS['vulcao-cinza'] = { cores: { piso: '#c8a08e', piso2: '#b88e7c', detalhe: '#7a4e44', luz: '#e0bca8' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      if (P.trilha(tx, ty)) {
        // a junta escura entre as pedras, com um fiozinho de lava; as pedras arredondadas em 3 arranjos
        ret(ctx, px, py, 16, 16, '#6a4044');
        var s = sorte(tx, ty, 33);
        if (s < 0.3) laje(ctx, px + 1, py + 1, 14, 14);
        else if (s < 0.65) { laje(ctx, px + 1, py + 1, 14, 7); laje(ctx, px + 1, py + 9, 6, 6); laje(ctx, px + 8, py + 9, 7, 6); }
        else { laje(ctx, px + 1, py + 1, 8, 8); laje(ctx, px + 10, py + 1, 5, 9); laje(ctx, px + 1, py + 10, 14, 5); }
        if (sorte(tx, ty, 31) < 0.35) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 32) * 9), py + 15, 3, 1, '#ff8a3d');
        return;
      }
      // manchas de cinza, rachadura com lava dentro, pedrinhas escuras e uma brasinha
      if (sorte(tx, ty, 1) < 0.45) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 3, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 4) * 6), py + 10, 4, 3, p.luz);
      if (sorte(tx, ty, 5) < 0.14) {
        var cx = px + 2 + Math.floor(sorte(tx, ty, 6) * 6), cy = py + 4 + Math.floor(sorte(tx, ty, 7) * 6);
        ret(ctx, cx, cy, 4, 2, p.detalhe); ret(ctx, cx + 3, cy + 1, 4, 2, p.detalhe); ret(ctx, cx + 6, cy + 2, 3, 2, p.detalhe);
        ret(ctx, cx + 1, cy, 2, 1, '#ff8a3d'); ret(ctx, cx + 4, cy + 1, 2, 1, '#ffb04a'); ret(ctx, cx + 7, cy + 2, 1, 1, '#ff8a3d');
      }
      for (var i = 0; i < 2; i++) {
        if (sorte(tx, ty, 10 + i) < 0.55) {
          var gx = px + 1 + Math.floor(sorte(tx, ty, 12 + i) * 13), gy = py + 2 + Math.floor(sorte(tx, ty, 14 + i) * 12);
          ret(ctx, gx, gy, 2, 1, p.detalhe); ret(ctx, gx, gy - 1, 1, 1, p.luz);
        }
      }
      if (sorte(tx, ty, 20) < 0.06) ret(ctx, px + 4 + Math.floor(sorte(tx, ty, 21) * 8), py + 7, 1, 1, '#ffb04a');
    } };

  /* ---------- a parede: o céu vermelho-escuro com cinzas e as montanhas com vulcõezinhos lá no fundo ---------- */
  var CEU = ['#5a1a26', '#7a2430', '#a2382e'];
  function montanha(gx, k) { return k ? 15 + Math.round(Math.sin(gx / 19) * 4 + Math.sin(gx / 7 + 1) * 2) : 9 + Math.round(Math.sin(gx / 31 + 2) * 4 + Math.sin(gx / 11) * 2); }
  I.PAREDES['vulcao-ceu'] = { cores: { parede: CEU[1], parede2: CEU[2], rodape: '#2e1820', detalhe: '#ff8a3d' },
    desenhar: function (ctx, px, py, tx) {
      // o céu em 3 faixas duras (mais claro perto do horizonte), com as cinzas e uma brasinha subindo
      ret(ctx, px, py, 16, 8, CEU[0]); ret(ctx, px, py + 8, 16, 8, CEU[1]); ret(ctx, px, py + 16, 16, 16, CEU[2]);
      for (var c = 0; c < 3; c++) {
        if (sorte(tx, c, 70) < 0.6) ret(ctx, px + Math.floor(sorte(tx, c, 71) * 15), py + 1 + c * 6 + Math.floor(sorte(tx, c, 72) * 4), sorte(tx, c, 73) < 0.5 ? 2 : 1, 1, '#c8a8a0');
      }
      if (sorte(tx, 0, 74) < 0.25) ret(ctx, px + Math.floor(sorte(tx, 0, 75) * 15), py + 4 + Math.floor(sorte(tx, 0, 76) * 10), 1, 1, '#ffb04a');
      // as duas fileiras de montanhas (a de trás mais clara), coluna por coluna, na grade global
      for (var i = 0; i < 16; i++) {
        var gx = tx * 16 + i, hl = montanha(gx, 0), hp = montanha(gx, 1);
        ret(ctx, px + i, py + 32 - 9 - hl, 1, hl + 9, '#5a2a36');
        ret(ctx, px + i, py + 32 - 9 - hl, 1, 1, '#6e3644');
        ret(ctx, px + i, py + 32 - hp, 1, hp, '#3e1e2a');
      }
      // de vez em quando um vulcãozinho com a boca de lava e um fio descendo
      if (tx % 9 === 4) {
        var by = py + 32 - montanha(tx * 16 + 8, 1);
        ret(ctx, px + 4, by - 4, 8, 4, '#3e1e2a'); ret(ctx, px + 3, by - 1, 10, 2, '#3e1e2a');
        ret(ctx, px + 5, by - 5, 6, 2, '#ff8a3d'); ret(ctx, px + 6, by - 5, 4, 1, '#ffd34d');
        ret(ctx, px + 7, by - 3, 1, 6, '#ff8a3d'); ret(ctx, px + 7, by + 3, 1, 2, '#c84a2a');
        ret(ctx, px + 6, by - 10, 3, 2, '#8a6a70'); ret(ctx, px + 8, by - 13, 3, 2, '#8a6a70');   // fumacinha
      }
      ret(ctx, px, py + 29, 16, 3, '#2e1820');
      if (sorte(tx, 0, 77) < 0.5) ret(ctx, px + 2 + Math.floor(sorte(tx, 0, 78) * 10), py + 29, 3, 1, '#c84a2a');
    } };

  /* ---------- o céu aberto: o chão de lava esfriada em volta, com rios de lava; a saída é o portal de volta ---------- */
  var CROSTA = ['#3a1820', '#4e2228', '#6a3030'];
  function lava(ctx, w, h) {
    ret(ctx, 0, 0, w, h, CROSTA[0]);
    for (var cy = 0; cy * 16 < h + 16; cy++) for (var cx = 0; cx * 16 < w + 16; cx++) {
      var x = cx * 16, y = cy * 16, s = sorte(cx, cy, 9);
      // o rio de lava que serpenteia pela grade (as linhas pares), com a beira clara
      var rio = Math.round(Math.sin(cx * 0.7 + cy * 1.3) * 4);
      if (cy % 3 === 1) { ret(ctx, x, y + 7 + rio, 16, 4, '#c84a2a'); ret(ctx, x, y + 8 + rio, 16, 2, '#ff8a3d'); ret(ctx, x + 3, y + 8 + rio, 5, 1, '#ffd34d'); }
      if (s < 0.3) ret(ctx, x + Math.floor(sorte(cx, cy, 10) * 10), y + 2, 5, 2, CROSTA[1]);   // placa de crosta
      else if (s < 0.4) { elipse(ctx, x + 8, y + 13, 4, 1, '#c84a2a'); ret(ctx, x + 6, y + 13, 4, 1, '#ff8a3d'); ret(ctx, x + 7, y + 13, 1, 1, '#ffd34d'); }   // pocinha
      else if (s < 0.5) ret(ctx, x + 4, y + 12, 3, 1, CROSTA[2]);
      if (sorte(cx, cy, 11) < 0.2) ret(ctx, x + Math.floor(sorte(cx, cy, 12) * 14), y + Math.floor(sorte(cx, cy, 13) * 6), 1, 1, '#c8a8a0');   // cinza caindo
    }
  }
  I.FUNDOS.vulcao = { cor: CROSTA[0], desenhar: lava,
    saida: R.Portal.saida({ pedra: ['#4e3a40', '#76606a', '#a8949c'], anel: ['#a82a10', '#ff6a3d', '#ffd34d', '#fff1a0'] }) };
})();
/* Vulcão dos Dragõezinhos: o interior de céu aberto (lugar 'vulcao'; docs/contratos/arenas.md). É a arena 6, a mais
   difícil: Reino.registrarArena + os números em config.arenas.vulcao (nucleo/config.js).
   Fixos (contrato das arenas): id 'vulcao', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3
   a 40), saída (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'vulcao' (acima), pacote
   'interior-vulcao'. O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual.
   Zonas pelas fileiras (as do config): fáceis embaixo, médios no meio, difíceis e voadores em cima.
   Objetos em objetos.js, falas em falas.js, ícone e inimigos em inimigos.js, portal e lugar em lugar.js. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).vulcao = R._predios.vulcao || {};
  var F = ((R.FALAS_INTERIORES || {}).vulcao || {}).objetos || {};
  var L = I.arena({
    semente: 20261110,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as das zonas e as do fundo
    clareiras: [[28, 37, 5.5], [14, 31, 4], [44, 33, 4], [36, 37, 3], [13, 21, 4.5], [44, 20, 4.5], [28, 23, 3.5], [14, 9, 4], [42, 10, 4], [28, 6, 3.5]],
    fixos: [
      ['vulcao-placa', 34, 36, 'Placa', F.placa],
      ['vulcao-geiser', 22, 36, 'Gêiser', F.geiser],
      ['vulcao-ninho', 42, 29, 'Ninho de dragão', F.ninho],
      ['vulcao-cranio', 10, 25, 'Osso de dragão', F.cranio],
    ],
    enfeites: [
      ['vulcao-lava', 6, 33], ['vulcao-lava', 48, 27], ['vulcao-lava', 6, 22], ['vulcao-lava', 36, 20], ['vulcao-lava', 20, 7], ['vulcao-lava', 46, 4],
      ['vulcao-lava', 33, 13], ['vulcao-lava', 35, 29],
      ['vulcao-geiser', 19, 33], ['vulcao-geiser', 35, 32], ['vulcao-geiser', 34, 25], ['vulcao-geiser', 21, 24],
      ['vulcao-geiser', 35, 18], ['vulcao-geiser', 22, 15], ['vulcao-geiser', 33, 10], ['vulcao-geiser', 25, 5],
      ['vulcao-ossos', 20, 31], ['vulcao-ossos', 39, 27], ['vulcao-ossos', 19, 17], ['vulcao-ossos', 32, 11],
      ['vulcao-cristais', 8, 28], ['vulcao-cristais', 47, 25], ['vulcao-cristais', 10, 16], ['vulcao-cristais', 46, 8],
      ['vulcao-ninho', 33, 4], ['vulcao-cranio', 44, 25], ['vulcao-cranio', 16, 4],
    ],
    altos: { 'vulcao-pico': 1, 'vulcao-arvore': 1, 'vulcao-coluna': 1 },
    borda: { lado: 'vulcao-arvore', baixo: ['vulcao-pedra', 'vulcao-coluna'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 37, 4], [19, 28, 3], [38, 29, 3], [8, 18, 5], [21, 19, 4], [37, 25, 4], [49, 15, 5], [35, 15, 3],
      [8, 6, 5], [21, 4, 4], [37, 3, 4], [49, 6, 5], [20, 10, 4], [37, 9, 3], [7, 12, 3], [49, 11, 3]],
    mata: [[0.26, 'vulcao-arvore'], [0.46, 'vulcao-coluna'], [0.6, 'vulcao-pico'], [0.78, 'vulcao-pedra'], [0.9, 'vulcao-toco'], [1, 'vulcao-cristais']],
    bolsao: ['vulcao-pedra', 'vulcao-pedra', 'vulcao-toco', 'vulcao-cristais'], coberto: 'vulcao-pedra',
    miudos: {
      comum: ['vulcao-cinzas', 'vulcao-cinzas', 'vulcao-brasas', 'vulcao-rachadura', 'vulcao-rachadura', 'vulcao-flor', 'vulcao-casca', 'vulcao-fumacinha'],
      fundo: ['vulcao-brasas', 'vulcao-fumacinha', 'vulcao-flor', 'vulcao-rachadura', 'vulcao-cinzas', 'vulcao-casca'], fundoAte: 20,
      trilha: 'vulcao-pedrinhas', varN: { 'vulcao-flor': 3 },
    },
  });

  R.registrarArena({ id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', curto: 'Vulcão', emoji: '🐉' });
  R.registrarInterior({
    id: 'vulcao',
    lugar: 'vulcao',
    nome: 'Vulcão dos Dragõezinhos',
    entrada: true,
    pacote: 'interior-vulcao',
    fundo: 'vulcao',
    tamanho: L.tamanho,
    saida: L.saida,
    spawn: L.spawn,
    comodos: [{ id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', rect: L.comodo, piso: 'vulcao-cinza', parede: 'vulcao-ceu' }],
    objetos: L.objetos,
  });
})();
