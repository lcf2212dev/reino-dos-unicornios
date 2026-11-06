/* Caverna de Cristal, o chão, a parede e o "céu" (docs/contratos/arenas.md): o piso 'cristal-chao' (pedra lilás com
   rachaduras, cascalho e lasquinhas de cristal, e as lajes lisas por onde passa a trilha), a parede 'cristal-paredao'
   (a rocha do fundo com estalactites e cristais na base) e o fundo I.FUNDOS.cristal (o teto de pedra escura em volta,
   com veios de cristal; `saida` = o portal de volta, ciano e roxo, Reino.Portal.saida).
   Reino._predios.cristal guarda P.trilha (o layout, abaixo, não põe sólido nela) e P.prisma (o cristal de 1 px de
   contorno, usado pelos objetos). No carregamento só registra funções e monta os dados: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).cristal = R._predios.cristal || {};

  /* ---------- a trilha de lajes (por semente: sempre a mesma) ---------- */
  // pontos por onde passa (x, y em tiles); a principal sobe do portal de volta até o fundo, em zigue-zague
  var CAMINHOS = [
    [[28, 40], [28, 34], [22, 30], [24, 24], [30, 20], [29, 14], [24, 9], [27, 3]],   // a principal
    [[28, 34], [38, 33], [47, 35]], [[22, 30], [11, 31]],                            // fáceis, de lado
    [[24, 24], [12, 22]], [[30, 20], [43, 19]],                                      // médias
    [[29, 14], [41, 10]], [[24, 9], [12, 7]],                                        // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(9091), t = {};
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

  /* ---------- o cristal: prisma de ponta para cima, com contorno, a face clara à esquerda e a escura à direita ---------- */
  // c = [escuro, meio, claro]; (x, y) = canto de cima à esquerda da ponta; w ≥ 3
  P.CRISTAL = { roxo: ['#6a3cc8', '#a66bff', '#e0ccff'], ciano: ['#1f9fb0', '#5fe0e8', '#d0fbff'], rosa: ['#b0449a', '#ff8ad8', '#ffd8f4'] };
  P.prisma = function (ctx, x, y, w, h, c) {
    var p = Math.max(2, Math.ceil(w / 2)), f = Math.max(1, Math.floor(w / 3));
    triangulo(ctx, x - 1, y - 1, w + 2, p + 1, K); ret(ctx, x - 1, y + p - 1, w + 2, h - p + 2, K);
    triangulo(ctx, x, y, w, p, c[1]); ret(ctx, x, y + p, w, h - p, c[1]);
    ret(ctx, x, y + p, f, h - p, c[2]); ret(ctx, x + w - f, y + p, f, h - p, c[0]);
    ret(ctx, x + Math.floor(w / 2) - 1, y + 1, 1, Math.max(1, p - 1), c[2]);   // o fio de luz da ponta
  };

  /* ---------- o piso: pedra lilás com rachaduras e lascas de cristal; na trilha, lajes lisas ---------- */
  var LAJE = { laje: '#a9a1cf', junta: '#6f679e', luz: '#c6bfe4', beira: '#4f4880' };
  I.PISOS['cristal-chao'] = { cores: { piso: '#857db0', piso2: '#7a72a6', detalhe: '#5c548a', luz: '#a098c8' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        // duas fileiras de lajes de 8 px, as juntas desencontradas fileira a fileira (na grade do mundo)
        ret(ctx, px, py, 16, 16, LAJE.laje);
        for (i = 0; i < 2; i++) {
          var y = py + i * 8, des = ((ty * 2 + i) & 1) * 4;
          ret(ctx, px, y, 16, 1, LAJE.junta); ret(ctx, px, y + 1, 16, 1, LAJE.luz);
          for (var x = des; x < 16; x += 8) ret(ctx, px + x, y, 1, 8, LAJE.junta);
          if (sorte(tx, ty, 40 + i) < 0.3) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 42 + i) * 10), y + 4, 2, 1, LAJE.junta);
        }
        if (!P.trilha(tx - 1, ty)) ret(ctx, px, py, 1, 16, LAJE.beira);
        if (!P.trilha(tx + 1, ty)) ret(ctx, px + 15, py, 1, 16, LAJE.beira);
        if (!P.trilha(tx, ty + 1)) ret(ctx, px, py + 15, 16, 1, LAJE.beira);
        return;
      }
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2 + Math.floor(sorte(tx, ty, 3) * 6), 8, 5, p.piso2);
      if (sorte(tx, ty, 4) < 0.35) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 5) * 8), py + 11, 5, 2, p.luz);
      // rachadura em zigue-zague
      if (sorte(tx, ty, 6) < 0.3) {
        var rx = px + 2 + Math.floor(sorte(tx, ty, 7) * 8), ry = py + 3 + Math.floor(sorte(tx, ty, 8) * 6);
        ret(ctx, rx, ry, 3, 1, p.detalhe); ret(ctx, rx + 3, ry + 1, 2, 1, p.detalhe); ret(ctx, rx + 5, ry + 2, 3, 1, p.detalhe);
      }
      // cascalho
      for (i = 0; i < 2; i++) if (sorte(tx, ty, 10 + i) < 0.5) ret(ctx, px + 1 + Math.floor(sorte(tx, ty, 12 + i) * 13), py + 1 + Math.floor(sorte(tx, ty, 14 + i) * 13), 2, 1, p.detalhe);
      // lasquinha de cristal brotando do chão
      var s = sorte(tx, ty, 20);
      if (s < 0.1) {
        var cx = px + 3 + Math.floor(sorte(tx, ty, 21) * 9), cy = py + 4 + Math.floor(sorte(tx, ty, 22) * 7), c = s < 0.05 ? P.CRISTAL.ciano : P.CRISTAL.roxo;
        ret(ctx, cx - 1, cy - 1, 3, 4, K); ret(ctx, cx, cy, 1, 3, c[1]); ret(ctx, cx, cy, 1, 1, c[2]);
      }
    } };

  /* ---------- a parede: a rocha do fundo, com estalactites penduradas e cristais na base ---------- */
  var PEDRA = ['#211a3c', '#2e2350', '#3d3066', '#4e4080', '#6a5ca0'];
  function estalactite(ctx, x, y, w, h) {   // ponta para baixo, contorno por fora
    for (var j = 0; j < h; j++) {
      var m = Math.max(1, Math.round(w * (1 - j / h)));
      ret(ctx, x + Math.floor((w - m) / 2) - 1, y + j, m + 2, 1, K);
    }
    ret(ctx, x + Math.floor(w / 2), y + h, 1, 1, K);
    for (j = 0; j < h - 1; j++) {
      var mm = Math.max(1, Math.round(w * (1 - j / h)) - 0), x0 = x + Math.floor((w - mm) / 2);
      if (mm < 1) continue;
      ret(ctx, x0, y + j, mm, 1, PEDRA[3]); ret(ctx, x0, y + j, 1, 1, PEDRA[4]);
    }
  }
  I.PAREDES['cristal-paredao'] = { cores: { parede: PEDRA[1], parede2: PEDRA[2], rodape: '#1c1430', detalhe: PEDRA[3] },
    desenhar: function (ctx, px, py, tx) {
      ret(ctx, px, py, 16, 32, PEDRA[1]);
      // blocos de rocha (na grade do mundo: as juntas continuam de um tile ao outro)
      for (var b = 0; b < 4; b++) {
        var by = py + 2 + b * 7, bx = px + Math.floor(sorte(tx, b, 50) * 10) - 4;
        ret(ctx, bx, by, 10, 5, PEDRA[2]); ret(ctx, bx, by, 10, 1, PEDRA[3]); ret(ctx, bx, by + 5, 10, 1, PEDRA[0]);
      }
      ret(ctx, px, py, 16, 2, PEDRA[0]);
      // estalactites que descem do teto
      var n = sorte(tx, 0, 61) < 0.5 ? 2 : 1;
      for (var k = 0; k < n; k++) estalactite(ctx, px + 1 + Math.floor(sorte(tx, k, 62) * 10), py + 1, 4 + Math.floor(sorte(tx, k, 63) * 2), 7 + Math.floor(sorte(tx, k, 64) * 8));
      // cristais na base da parede
      var s = sorte(tx, 0, 65);
      if (s < 0.45) {
        var c = s < 0.2 ? P.CRISTAL.ciano : s < 0.38 ? P.CRISTAL.roxo : P.CRISTAL.rosa, cx = px + 3 + Math.floor(sorte(tx, 0, 66) * 7);
        P.prisma(ctx, cx, py + 19, 4, 10, c); P.prisma(ctx, cx + 4, py + 23, 3, 6, c);
      }
      ret(ctx, px, py + 29, 16, 3, '#1c1430');
    } };

  /* ---------- o "céu": o teto de pedra escura da caverna, com veios de cristal; a saída é o portal (ciano) ---------- */
  var ROCHA = ['#1a1230', '#241a40', '#30244f'];
  function teto(ctx, w, h) {
    ret(ctx, 0, 0, w, h, ROCHA[0]);
    for (var cy = 0; cy * 16 < h + 16; cy++) for (var cx = 0; cx * 16 < w + 16; cx++) {
      var x = cx * 16, y = cy * 16, s = sorte(cx, cy, 9);
      if (s < 0.5) {                                                                    // pedra solta, de tamanho e altura sorteados
        var lw = 6 + Math.floor(sorte(cx, cy, 10) * 9), lh = 4 + Math.floor(sorte(cx, cy, 12) * 5);
        var lx = x + Math.floor(sorte(cx, cy, 11) * (17 - lw)), ly = y + 1 + Math.floor(sorte(cx, cy, 13) * (15 - lh));
        ret(ctx, lx + 1, ly, lw - 2, lh, ROCHA[1]); ret(ctx, lx, ly + 1, lw, lh - 2, ROCHA[1]);
        ret(ctx, lx + 1, ly, lw - 2, 1, ROCHA[2]); ret(ctx, lx + 1, ly + lh, lw - 2, 1, '#120c22');
      }
      if (s > 0.9) {                                                                    // veio de cristal
        var c = s > 0.96 ? P.CRISTAL.ciano : P.CRISTAL.roxo;
        ret(ctx, x + 5, y + 7, 2, 2, c[1]); ret(ctx, x + 7, y + 9, 2, 1, c[0]); ret(ctx, x + 5, y + 7, 1, 1, c[2]);
      } else if (s > 0.86) ret(ctx, x + 10, y + 3, 1, 1, '#8a7ab8');                       // brilhinho
    }
  }
  I.FUNDOS.cristal = { cor: ROCHA[0], desenhar: teto,
    saida: R.Portal.saida({ pedra: ['#4a3c74', '#6a5ca0', '#9a8cc8'], anel: ['#5a2fb0', '#5fe0e8', '#c89cff', '#eadcff'] }) };
})();
/* Caverna de Cristal: o interior (lugar 'cristal'; docs/contratos/arenas.md). É a arena 5: Reino.registrarArena + os
   números em config.arenas.cristal (nucleo/config.js).
   Fixos (contrato das arenas): id 'cristal', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3
   a 40), saída (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'cristal', pacote
   'interior-cristal'. O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual.
   Fáceis embaixo, médios no meio, difíceis e voadores em cima. Objetos em objetos.js, falas em falas.js, inimigos em
   inimigos.js, portal e lugar em lugar.js. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).cristal = R._predios.cristal || {};
  var F = ((R.FALAS_INTERIORES || {}).cristal || {}).objetos || {};
  function trilhos(y, x0, x1) { var l = []; for (var x = x0; x <= x1; x++) l.push(['cristal-trilho', x, y]); return l; }
  var L = I.arena({
    semente: 20261109,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as das salas da caverna e as do fundo
    clareiras: [[28, 37, 5.5], [11, 31, 4], [46, 33, 4], [13, 21, 4.5], [44, 19, 4.5], [27, 22, 3.5], [13, 8, 4], [41, 9, 4], [27, 5, 3.5]],
    fixos: [
      ['cristal-placa', 34, 37, 'Placa', F.placa],
      ['cristal-lampiao', 22, 36, 'Lampião', F.lampiao],
      ['cristal-vagonete', 39, 28, 'Carrinho de mina', F.vagonete],
      ['cristal-geodo', 14, 26, 'Geodo', F.geodo],
    ],
    enfeites: [
      // o lago subterrâneo e as poças
      ['cristal-lago', 16, 34], ['cristal-lago', 35, 23], ['cristal-lago', 33, 7], ['cristal-lago', 6, 15],
      // os trilhos de mina (e um carrinho vazio no fundo)
      ['cristal-vagonete', 37, 15], ['cristal-trilho', 35, 15, { ponta: 'e' }], ['cristal-trilho', 36, 15], ['cristal-trilho', 39, 15], ['cristal-trilho', 40, 15, { ponta: 'd' }],
      ['cristal-trilho', 31, 31, { ponta: 'e' }]].concat(trilhos(31, 32, 36), [['cristal-trilho', 37, 31, { ponta: 'd' }],
      // lampiões ao longo da trilha
      ['cristal-lampiao', 20, 28], ['cristal-lampiao', 30, 25], ['cristal-lampiao', 21, 22],
      ['cristal-lampiao', 34, 18], ['cristal-lampiao', 26, 13], ['cristal-lampiao', 30, 9],
      ['cristal-geodo', 26, 4], ['cristal-rocha', 18, 30], ['cristal-rocha', 38, 25], ['cristal-rocha', 19, 15], ['cristal-rocha', 46, 12],
    ]),
    altos: { 'cristal-cristalao': 1, 'cristal-estalagmite': 1 },
    borda: { lado: 'cristal-cristalao', baixo: ['cristal-drusa', 'cristal-estalagmite'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 38, 4], [19, 37, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [20, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.3, 'cristal-cristalao'], [0.52, 'cristal-estalagmite'], [0.66, 'cristal-cogumelo-gigante'], [0.8, 'cristal-drusa'], [0.92, 'cristal-pedra'], [1, 'cristal-rocha']],
    bolsao: ['cristal-drusa', 'cristal-drusa', 'cristal-pedra'], coberto: 'cristal-pedra',
    miudos: {
      comum: ['cristal-cascalho', 'cristal-cascalho', 'cristal-lascas', 'cristal-lascas', 'cristal-cogumelos', 'cristal-poca', 'cristal-musgo'],
      fundo: ['cristal-faiscas', 'cristal-cogumelos', 'cristal-lascas', 'cristal-musgo', 'cristal-cascalho', 'cristal-poca'], fundoAte: 20,
      trilha: 'cristal-brilhos', varN: { 'cristal-lascas': 3, 'cristal-cogumelos': 3 },
    },
  });

  R.registrarArena({ id: 'cristal', nome: 'Caverna de Cristal', curto: 'Caverna', emoji: '💎' });
  R.registrarInterior({
    id: 'cristal',
    lugar: 'cristal',
    nome: 'Caverna de Cristal',
    entrada: true,
    pacote: 'interior-cristal',
    fundo: 'cristal',
    tamanho: L.tamanho,
    saida: L.saida,
    spawn: L.spawn,
    comodos: [{ id: 'cristal', nome: 'Caverna de Cristal', rect: L.comodo, piso: 'cristal-chao', parede: 'cristal-paredao' }],
    objetos: L.objetos,
  });
})();
