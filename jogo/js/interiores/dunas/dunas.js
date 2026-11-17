/* Dunas dos Escorpiões, o chão e o céu aberto (docs/contratos/arenas.md): o piso 'dunas-areia' (areia clara com as
   marolas do vento e a trilha de areia batida, com pedrinhas na beira), a parede 'dunas-horizonte' (o céu de
   entardecer laranja lá no fundo, com o sol se pondo, as dunas longe, as pirâmides e os pássaros) e o fundo
   I.FUNDOS.dunas (as dunas altas em volta, alaranjadas do pôr do sol; `saida` = o portal de volta, Reino.Portal.saida).
   As trilhas ficam em Reino._predios.dunas (P.trilha), para o layout (a segunda parte, abaixo) não pôr nada sólido
   nelas. No carregamento só registra funções e monta os dados do layout: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).dunas = R._predios.dunas || {};

  /* ---------- as trilhas de areia batida (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até a pirâmide, em curvas
  var CAMINHOS = [
    [[28, 40], [28, 34], [23, 30], [24, 25], [31, 21], [32, 16], [26, 12], [27, 7], [28, 3]],   // a principal
    [[28, 34], [38, 33], [47, 35]], [[23, 30], [14, 32], [7, 30]],                              // fáceis, de lado
    [[24, 25], [13, 23]], [[31, 21], [43, 19]],                                                 // médias
    [[26, 12], [14, 9]], [[32, 16], [44, 11]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(8117), t = {};
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

  // marolas de areia: ondinhas finas que continuam de um tile para o outro (pela coordenada do mundo)
  function marolas(ctx, px, py, tx, ty, escura, clara, passo) {
    for (var faixa = 0; faixa < 2; faixa++) for (var x = 0; x < 16; x++) {
      var g = tx * 16 + x, y = 4 + faixa * 8 + Math.round(Math.sin(g / 7 + ty * 1.7 + faixa * 2) * 2);
      if ((g + faixa * 5) % passo < passo - 3) { ret(ctx, px + x, py + y, 1, 1, escura); ret(ctx, px + x, py + y - 1, 1, 1, clara); }
    }
  }

  /* ---------- o piso: areia clara com marolas e a trilha de areia batida ---------- */
  I.PISOS['dunas-areia'] = { cores: { piso: '#f4d896', piso2: '#ecca7e', detalhe: '#d8a860', luz: '#fff0c4' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      if (P.trilha(tx, ty)) {
        // areia batida, um tom mais quente, com grãozinhos; a beira se desfaz em areia solta (sem quina reta)
        ret(ctx, px, py, 16, 16, '#ecc480');
        for (var i = 0; i < 5; i++) ret(ctx, px + Math.floor(sorte(tx, ty, 30 + i) * 15), py + Math.floor(sorte(tx, ty, 40 + i) * 15), 1, 1, i % 2 ? '#c99858' : '#f6d8a0');
        for (var j = 0; j < 16; j++) {
          var a = 1 + Math.floor(sorte(tx * 16 + j, ty, 52) * 3), b = 1 + Math.floor(sorte(tx, ty * 16 + j, 53) * 3);
          if (!P.trilha(tx - 1, ty)) ret(ctx, px, py + j, a, 1, p.piso);
          if (!P.trilha(tx + 1, ty)) ret(ctx, px + 16 - b, py + j, b, 1, p.piso);
          if (!P.trilha(tx, ty - 1)) ret(ctx, px + j, py, 1, b, p.piso);
          if (!P.trilha(tx, ty + 1)) ret(ctx, px + j, py + 16 - a, 1, a, p.piso);
        }
        if (sorte(tx, ty, 50) < 0.3) ret(ctx, px + 4 + Math.floor(sorte(tx, ty, 51) * 8), py + 4 + Math.floor(sorte(tx, ty, 54) * 8), 2, 1, '#b8885a');   // pedrinha
        return;
      }
      if (sorte(tx, ty, 4) < 0.45) ret(ctx, px + Math.floor(sorte(tx, ty, 5) * 8), py + 2, 8, 5, p.piso2);
      marolas(ctx, px, py, tx, ty, p.detalhe, p.luz, 14);
      if (sorte(tx, ty, 6) < 0.25) ret(ctx, px + 3 + Math.floor(sorte(tx, ty, 7) * 9), py + 12, 2, 1, '#c99858');   // pedrinha
      if (sorte(tx, ty, 8) < 0.12) ret(ctx, px + 2 + Math.floor(sorte(tx, ty, 9) * 11), py + 9, 1, 1, '#ffffff');    // brilho de areia
    } };

  /* ---------- a parede: o céu do entardecer, com o sol, as dunas longe, as pirâmides e os pássaros ---------- */
  var CEU = ['#ec8a5a', '#f49c5c', '#ffb062', '#ffc66e', '#ffdc8e'];
  var PIRAMIDES = [[7, 17], [10, 12], [46, 15], [20, 9]];   // [tile do meio, altura em px]
  var SOL = 37.5;
  function horizonte(ctx, px, py, tx) {
    var i, x, g;
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
    for (i = 0; i < CEU.length; i++) ret(ctx, px, py + i * 5, 16, i === CEU.length - 1 ? 12 : 5, CEU[i]);
    var ds = (SOL - tx) * 16;   // o sol se pondo, com o halo
    if (Math.abs(ds) < 32) { circulo(ctx, px + ds, py + 22, 13, '#ffd27a'); circulo(ctx, px + ds, py + 22, 10, '#ffe9a8'); circulo(ctx, px + ds, py + 21, 7, '#fff6d8'); }
    if (sorte(tx, 0, 73) < 0.35) ret(ctx, px + Math.floor(sorte(tx, 0, 74) * 8), py + 7 + Math.floor(sorte(tx, 0, 75) * 5), 9, 1, '#ffc8a8');   // nuvem fininha
    if (sorte(tx, 0, 70) < 0.3) {   // pássaros longe
      x = px + 2 + Math.floor(sorte(tx, 0, 71) * 10); var y = py + 3 + Math.floor(sorte(tx, 0, 72) * 6);
      ret(ctx, x, y, 2, 1, '#8a3a4a'); ret(ctx, x + 2, y + 1, 1, 1, '#8a3a4a'); ret(ctx, x + 3, y, 2, 1, '#8a3a4a');
    }
    PIRAMIDES.forEach(function (p) {
      var cx = (p[0] - tx) * 16 + 8, hP = p[1];
      if (cx < -hP - 2 || cx > 16 + hP + 2) return;
      for (x = 0; x < 16; x++) {
        var d = Math.abs(x - cx), h = hP - d;
        if (h <= 0) continue;
        ret(ctx, px + x, py + 25 - h, 1, h, x < cx ? '#d88a52' : '#b8683e');
        if (d >= hP - 1) ret(ctx, px + x, py + 25 - h, 1, 1, '#7a3a3a');
      }
    });
    for (x = 0; x < 16; x++) {   // as dunas longe e as de perto, em duas camadas
      g = tx * 16 + x;
      var h1 = 6 + Math.round(Math.sin(g / 23) * 3 + Math.sin(g / 9) * 1.5), h2 = 3 + Math.round(Math.sin(g / 15 + 2) * 2);
      ret(ctx, px + x, py + 32 - h1 - 3, 1, h1 + 3, '#e0945a');
      ret(ctx, px + x, py + 32 - h1 - 3, 1, 1, '#f8b878');
      ret(ctx, px + x, py + 32 - h2, 1, h2, '#eab070');
    }
    ret(ctx, px, py + 30, 16, 2, '#d8a060');
    ctx.restore();
  }
  I.PAREDES['dunas-horizonte'] = { cores: { parede: '#ffa65c', parede2: '#ffc06a', rodape: '#d8a060', detalhe: '#e0945a' },
    desenhar: function (ctx, px, py, tx) { horizonte(ctx, px, py, tx); } };

  /* ---------- o céu aberto: as dunas altas em volta, com sombra e cactinhos; a saída é o portal de volta ---------- */
  var DUNA = ['#e0945a', '#c8784a', '#f4b070', '#a85e3e'];
  function dunas(ctx, w, h) {
    ret(ctx, 0, 0, w, h, DUNA[0]);
    for (var cy = 0; cy * 16 < h + 16; cy++) for (var cx = 0; cx * 16 < w + 16; cx++) {
      var x = cx * 16, y = cy * 16, s = sorte(cx, cy, 9);
      if (cy === 0) continue;   // a fileira de cima fica lisa: emenda com o céu do horizonte
      // a crista da duna: luz em cima, sombra embaixo (ondas largas que seguem de um tile ao outro)
      for (var i = 0; i < 16; i += 2) {
        var yy = y + 8 + Math.round(Math.sin((x + i) / 11 + cy * 2.3) * 3);
        ret(ctx, x + i, yy, 2, 1, DUNA[2]); ret(ctx, x + i, yy + 1, 2, 3, DUNA[1]);
      }
      if (s < 0.08) {                                                                            // cactinho
        ret(ctx, x + 6, y + 2, 4, 9, K); ret(ctx, x + 7, y + 3, 2, 7, '#4f9a5a');
        ret(ctx, x + 3, y + 4, 3, 4, K); ret(ctx, x + 4, y + 5, 1, 2, '#4f9a5a');
      } else if (s < 0.13) {                                                                     // pedra
        elipse(ctx, x + 8, y + 12, 4, 2, DUNA[3]); ret(ctx, x + 6, y + 11, 2, 1, '#d8a07a');
      } else if (s < 0.2) ret(ctx, x + 4, y + 13, 2, 1, '#ffd8a0');                              // brilho
    }
  }
  I.FUNDOS.dunas = { cor: DUNA[0], desenhar: dunas,
    saida: R.Portal.saida({ pedra: ['#a8885a', '#c8a874', '#e8d0a0'], anel: ['#c8601a', '#ffb347', '#4fd0c8', '#fff1cc'] }) };
})();
/* Dunas dos Escorpiões: o interior de céu aberto (lugar 'dunas'; docs/contratos/arenas.md). É a arena 4:
   Reino.registrarArena + os números em config.arenas.dunas (nucleo/config.js).
   Fixos (contrato das arenas): id 'dunas', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3 a
   40), saída (28, 40) (o portal de volta, desenhado pelo fundo), spawn (28, 39), fundo 'dunas', pacote
   'interior-dunas'. O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual.
   O chão e o céu na primeira parte (acima); objetos em objetos.js, falas em falas.js, inimigos em inimigos.js
   (o 🏜 já tem desenho em arte/icones/natureza.js), portal e lugar em lugar.js. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).dunas = R._predios.dunas || {};
  var F = ((R.FALAS_INTERIORES || {}).dunas || {}).objetos || {};
  var L = I.arena({
    semente: 20261108,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as dos oásis e as do fundo
    clareiras: [[28, 37, 5.5], [13, 33, 4], [44, 33, 4], [38, 37, 3], [12, 22, 4.5], [43, 20, 4.5], [24, 26, 3.5], [14, 10, 4], [43, 10, 4], [28, 6, 3.5]],
    fixos: [
      ['dunas-placa', 34, 36, 'Placa', F.placa],
      ['dunas-vaso', 23, 36, 'Vaso antigo', F.vaso],
      ['dunas-oasis', 41, 29, 'Oásis', F.oasis],
      ['dunas-piramide', 10, 25, 'Pirâmide', F.piramide],
    ],
    enfeites: [
      // os oásis: a lagoinha turquesa na beira de uma clareira, com as palmeiras em volta
      ['dunas-lago', 8, 34], ['dunas-palmeira', 6, 32], ['dunas-palmeira', 5, 35],
      ['dunas-lago', 49, 34], ['dunas-palmeira', 51, 32], ['dunas-palmeira', 51, 36],
      ['dunas-palmeira', 45, 27], ['dunas-palmeira', 37, 30],
      ['dunas-lago', 6, 22], ['dunas-palmeira', 5, 20], ['dunas-palmeira', 5, 24],
      ['dunas-lago', 48, 21], ['dunas-palmeira', 50, 19], ['dunas-palmeira', 51, 23],
      ['dunas-lago', 8, 10], ['dunas-palmeira', 9, 8], ['dunas-palmeira', 6, 12],
      ['dunas-lago', 48, 10], ['dunas-palmeira', 47, 8], ['dunas-palmeira', 50, 12],
      // os vasos e as colunas do templo antigo, na beira da trilha
      ['dunas-vaso', 25, 33], ['dunas-vaso', 31, 31], ['dunas-vaso', 21, 28], ['dunas-vaso', 27, 23],
      ['dunas-coluna', 35, 23], ['dunas-coluna', 29, 18], ['dunas-coluna', 35, 15], ['dunas-coluna', 24, 9], ['dunas-coluna', 31, 9],
      ['dunas-duna', 18, 30], ['dunas-duna', 37, 27], ['dunas-duna', 19, 15], ['dunas-duna', 37, 11],
      ['dunas-piramide', 33, 5],
    ],
    altos: { 'dunas-rochedo': 1, 'dunas-cacto': 1, 'dunas-palmeira': 1 },
    borda: { lado: 'dunas-rochedo', baixo: ['dunas-moita', 'dunas-cacto'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 37, 4], [48, 38, 4], [19, 34, 3], [38, 30, 3], [7, 18, 5], [20, 19, 4], [36, 25, 4], [49, 15, 5], [35, 18, 3],
      [7, 5, 5], [20, 4, 4], [37, 4, 4], [49, 6, 5], [21, 11, 4], [36, 13, 4], [6, 12, 3], [49, 11, 3]],
    mata: [[0.32, 'dunas-cacto'], [0.5, 'dunas-rochedo'], [0.66, 'dunas-cacto-redondo'], [0.78, 'dunas-moita'], [0.88, 'dunas-pedra'], [1, 'dunas-duna']],
    bolsao: ['dunas-cacto-redondo', 'dunas-moita', 'dunas-pedra', 'dunas-moita'], coberto: 'dunas-moita',
    miudos: {
      comum: ['dunas-marolas', 'dunas-marolas', 'dunas-capim', 'dunas-capim', 'dunas-ossinhos', 'dunas-caco', 'dunas-flor', 'dunas-concha'],
      fundo: ['dunas-ossinhos', 'dunas-caco', 'dunas-flor', 'dunas-marolas', 'dunas-capim', 'dunas-concha'], fundoAte: 20,
      trilha: 'dunas-pegadas', varN: { 'dunas-flor': 3 },
    },
  });

  R.registrarArena({ id: 'dunas', nome: 'Dunas dos Escorpiões', curto: 'Dunas', emoji: '🏜' });
  R.registrarInterior({
    id: 'dunas',
    lugar: 'dunas',
    nome: 'Dunas dos Escorpiões',
    entrada: true,
    pacote: 'interior-dunas',
    fundo: 'dunas',
    tamanho: L.tamanho,
    saida: L.saida,
    spawn: L.spawn,
    comodos: [{ id: 'dunas', nome: 'Dunas dos Escorpiões', rect: L.comodo, piso: 'dunas-areia', parede: 'dunas-horizonte' }],
    objetos: L.objetos,
  });
})();
