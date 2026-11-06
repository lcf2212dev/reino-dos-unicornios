/* Pântano das Rãs Resmungonas, o chão e o céu aberto (docs/contratos/arenas.md): o piso 'pantano-lama' (capim
   alagado com poças de lodo e as passarelas de tábuas por onde passa a trilha), a parede 'pantano-salgueiros' (os
   salgueiros-chorões lá no fundo, com cipós) e o fundo I.FUNDOS.pantano (a água parada em volta, com vitórias-régias
   e juncos; `saida` = o portal de volta, verde, Reino.Portal.saida).
   As trilhas ficam em Reino._predios.pantano (P.trilha), para o layout (a segunda parte, abaixo) não pôr nada sólido
   nelas. No carregamento só registra funções e monta os dados do layout: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).pantano = R._predios.pantano || {};

  /* ---------- as passarelas (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o fundo, em zigue-zague
  var CAMINHOS = [
    [[28, 40], [28, 35], [33, 31], [32, 26], [25, 22], [26, 17], [31, 13], [29, 8], [27, 3]],   // a principal
    [[28, 35], [18, 33], [9, 34]], [[33, 31], [44, 33], [49, 30]],                              // fáceis, de lado
    [[32, 26], [44, 22]], [[25, 22], [13, 20]],                                                 // médias
    [[31, 13], [43, 9]], [[26, 17], [14, 11]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(7023), t = {};
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

  /* ---------- copas dos salgueiros: folhagem em bolas na grade global, com cipós pendurados ---------- */
  var VERDES = ['#24503a', '#2f6646', '#3f8456'];
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, VERDES[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 1) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 2) - 0.5) * 6);
      circulo(ctx, bx, by, 8, VERDES[0]); circulo(ctx, bx - 1, by - 1, 6, VERDES[1]); circulo(ctx, bx - 2, by - 2, 3, VERDES[2]);
      if (sorte(cc, cr, 3) < 0.35) { ret(ctx, bx + 3, by + 2, 1, 7, '#5fa06a'); ret(ctx, bx + 3, by + 9, 1, 1, '#8fd08a'); }   // cipó
      if (sorte(cc, cr, 4) < 0.12) ret(ctx, bx - 3, by + 3, 1, 1, '#e8ff9a');   // vaga-lume
    }
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- o piso: capim alagado, poças de lodo e as passarelas de tábuas ---------- */
  I.PISOS['pantano-lama'] = { cores: { piso: '#9dbb63', piso2: '#8aab52', detalhe: '#5e8a3a', luz: '#c2dc86' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        // tábuas atravessadas (uma por 4 px), com as frestas e os pregos; a borda some onde a passarela continua
        ret(ctx, px, py, 16, 16, '#c49a62');
        for (i = 0; i < 4; i++) {
          ret(ctx, px, py + i * 4, 16, 1, '#8a6038');
          ret(ctx, px + 1, py + i * 4 + 1, 14, 1, '#d8b47c');
          ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 30 + i) * 11), py + i * 4 + 2, 1, 1, '#7a5432');
        }
        if (!P.trilha(tx - 1, ty)) ret(ctx, px, py, 1, 16, '#6b4a2a');
        if (!P.trilha(tx + 1, ty)) ret(ctx, px + 15, py, 1, 16, '#6b4a2a');
        return;
      }
      // poças de lodo (mais escuras, com a beira molhada) e manchas de capim
      if (sorte(tx, ty, 1) < 0.22) {
        var lx = px + 2 + Math.floor(sorte(tx, ty, 2) * 5), ly = py + 4 + Math.floor(sorte(tx, ty, 3) * 5);
        elipse(ctx, lx + 4, ly + 2, 5, 2, '#7a7440'); elipse(ctx, lx + 4, ly + 2, 3, 1, '#655f34'); ret(ctx, lx + 2, ly + 1, 2, 1, '#a8a060');
      } else if (sorte(tx, ty, 4) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 5) * 8), py + 3, 8, 5, p.piso2);
      if (sorte(tx, ty, 6) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 7) * 6), py + 10, 4, 3, p.luz);
      // tufos de capim do brejo: lâminas altas e finas
      for (i = 0; i < 3; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 4 + Math.floor(sorte(tx, ty, 20 + i) * 10);
        ret(ctx, gx, gy - 3, 1, 4, p.detalhe); ret(ctx, gx + 1, gy - 4, 1, 4, p.detalhe); ret(ctx, gx + 2, gy - 2, 1, 3, '#77a34a');
      }
    } };

  /* ---------- a parede: os salgueiros lá no fundo, com troncos tortos e a sombra na base ---------- */
  I.PAREDES['pantano-salgueiros'] = { cores: { parede: '#24503a', parede2: '#2f6646', rodape: '#1c3e2c', detalhe: '#3f8456' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 21, 3, 9, '#4a3a2a'); ret(ctx, px + t, py + 21, 1, 9, '#6a5438'); ret(ctx, px + t + 3, py + 24, 2, 1, '#4a3a2a');
      ret(ctx, px, py + 29, 16, 3, '#1c3e2c');
    } };

  /* ---------- o céu aberto: a água parada do brejo em volta; a saída é o portal de volta (verde) ---------- */
  var AGUA = ['#2f5a4c', '#3a6b5a', '#5a8f78'];
  function agua(ctx, w, h) {
    ret(ctx, 0, 0, w, h, AGUA[0]);
    for (var cy = 0; cy * 16 < h + 16; cy++) for (var cx = 0; cx * 16 < w + 16; cx++) {
      var x = cx * 16, y = cy * 16, s = sorte(cx, cy, 9);
      if (s < 0.5) ret(ctx, x + Math.floor(sorte(cx, cy, 10) * 10), y + 6, 5, 1, AGUA[1]);        // marolinha
      if (s < 0.12) {                                                                            // vitória-régia
        circulo(ctx, x + 8, y + 8, 4, K); circulo(ctx, x + 8, y + 8, 3, '#5fae4a'); ret(ctx, x + 8, y + 5, 1, 3, AGUA[0]);
      } else if (s < 0.2) {                                                                      // junco
        ret(ctx, x + 6, y + 4, 1, 9, '#4f8a3a'); ret(ctx, x + 6, y + 3, 2, 3, '#8a5a30'); ret(ctx, x + 9, y + 7, 1, 6, '#4f8a3a');
      } else if (s < 0.26) ret(ctx, x + 4, y + 11, 2, 1, AGUA[2]);                               // brilho
    }
  }
  I.FUNDOS.pantano = { cor: AGUA[0], desenhar: agua,
    saida: R.Portal.saida({ pedra: ['#5f6a4a', '#86906a', '#b4bc94'], anel: ['#2f8a4a', '#7ccf5a', '#c8e86a', '#eaffb8'] }) };
})();
/* Pântano das Rãs Resmungonas: o interior de céu aberto (lugar 'pantano'; docs/contratos/arenas.md). É a arena 2 (o
   Bosque é a 1): Reino.registrarArena + os números em config.arenas.pantano (nucleo/config.js).
   Fixos (contrato das arenas): id 'pantano', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3
   a 40), saída (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'pantano' (fundo.js),
   pacote 'interior-pantano'. O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre
   igual. Zonas pelas fileiras (as do config): fáceis embaixo, médios no meio, difíceis e voadores em cima.
   O chão e o céu na primeira parte (acima); objetos em objetos.js, falas em falas.js, ícone e inimigos em inimigos.js,
   portal e lugar em lugar.js. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).pantano = R._predios.pantano || {};
  var F = ((R.FALAS_INTERIORES || {}).pantano || {}).objetos || {};
  var ALTOS = { 'pantano-salgueiro': 1, 'pantano-cipreste': 1 };
  var L = I.arena({
    semente: 20261106,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as das lagoas e as do fundo
    clareiras: [[28, 37, 5.5], [14, 33, 4], [45, 32, 4], [38, 36, 3], [13, 21, 4.5], [44, 21, 4.5], [27, 23, 3.5], [14, 10, 4], [42, 9, 4], [28, 6, 3.5]],
    fixos: [
      ['pantano-placa', 34, 36, 'Placa', F.placa],
      ['pantano-lanterna', 23, 36, 'Lanterna de vaga-lumes', F.lanterna],
      ['pantano-vitoria-regia', 42, 29, 'Vitória-régia', F['vitoria-regia']],
      ['pantano-estatua-ra', 11, 25, 'Estátua da rã', F['estatua-ra']],
    ],
    enfeites: [
      ['pantano-lago', 12, 33], ['pantano-lago', 44, 31], ['pantano-lago', 26, 22], ['pantano-lago', 13, 9], ['pantano-lago', 41, 20],
      ['pantano-juncos', 11, 32], ['pantano-juncos', 14, 34], ['pantano-juncos', 47, 31], ['pantano-juncos', 25, 23], ['pantano-juncos', 43, 21],
      ['pantano-lanterna', 22, 33], ['pantano-lanterna', 34, 32], ['pantano-lanterna', 33, 27], ['pantano-lanterna', 24, 26],
      ['pantano-lanterna', 33, 22], ['pantano-lanterna', 25, 18], ['pantano-lanterna', 32, 14], ['pantano-lanterna', 30, 8],
      ['pantano-tronco', 18, 30], ['pantano-tronco', 38, 27], ['pantano-tronco', 20, 15], ['pantano-tronco', 36, 11],
      ['pantano-estatua-ra', 28, 5],
    ],
    altos: ALTOS,
    borda: { lado: 'pantano-salgueiro', baixo: ['pantano-juncos', 'pantano-cipreste'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.3, 'pantano-salgueiro'], [0.52, 'pantano-cipreste'], [0.72, 'pantano-juncos'], [0.84, 'pantano-pedra'], [0.93, 'pantano-toco'], [1, 'pantano-tronco']],
    bolsao: ['pantano-juncos', 'pantano-juncos', 'pantano-pedra', 'pantano-toco'], coberto: 'pantano-juncos',
    miudos: {
      comum: ['pantano-capim', 'pantano-capim', 'pantano-capim', 'pantano-lodo', 'pantano-lodo', 'pantano-lotus', 'pantano-raizes', 'pantano-cogumelos'],
      fundo: ['pantano-vagalumes', 'pantano-cogumelos', 'pantano-lotus', 'pantano-capim', 'pantano-lodo', 'pantano-raizes'], fundoAte: 20,
      trilha: 'pantano-pedrinhas', varN: { 'pantano-cogumelos': 3 },
    },
  });

  R.registrarArena({ id: 'pantano', nome: 'Pântano das Rãs Resmungonas', curto: 'Pântano', emoji: '🐸' });
  R.registrarInterior({
    id: 'pantano',
    lugar: 'pantano',
    nome: 'Pântano das Rãs Resmungonas',
    entrada: true,
    pacote: 'interior-pantano',
    fundo: 'pantano',
    tamanho: L.tamanho,
    saida: L.saida,
    spawn: L.spawn,
    comodos: [{ id: 'pantano', nome: 'Pântano das Rãs Resmungonas', rect: L.comodo, piso: 'pantano-lama', parede: 'pantano-salgueiros' }],
    objetos: L.objetos,
  });
})();
