/* Bosque do Orvalho, as trilhas de terra clara (docs/contratos/arenas.md §8): a principal sobe do portal de volta até o
   fundo da floresta e as laterais levam aos cantos. As trilhas ficam em Reino._predios.orvalho (P.trilha), para o layout
   (a segunda parte, abaixo) não pôr nada sólido nelas e para o piso 'orvalho-orvalho' (objetos.js) desenhar a terra.
   No carregamento só registra funções: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var P = (R._predios = R._predios || {}).orvalho = R._predios.orvalho || {};

  /* ---------- as trilhas de terra (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o fundo, em zigue-zague de manhã
  var CAMINHOS = [
    [[28, 40], [28, 35], [33, 30], [32, 25], [25, 21], [27, 16], [32, 12], [28, 7], [28, 3]],   // a principal
    [[28, 35], [18, 33], [9, 34]], [[33, 30], [43, 32], [49, 29]],                              // fáceis, de lado
    [[32, 25], [44, 21]], [[25, 21], [13, 20]],                                                 // médias
    [[32, 12], [43, 9]], [[27, 16], [14, 12]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(8025), t = {};
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
})();
/* Bosque do Orvalho: o interior de céu aberto (lugar 'bosque'; docs/contratos/arenas.md §8). É o bosque mais fácil dos
   três de dentro do Bosque dos Fantasmas (Nv 25): o portal fica na arena do Bosque, embaixo à esquerda, e a volta é o
   portal desta floresta em (28,40) — por isso NÃO tem tapete de saída (`saida`).
   Fixos (contrato das arenas de dentro): id 'orvalho', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas
   fileiras 3 a 40), spawn (28,39), fundo 'orvalho', pacote 'interior-bosque'. O layout sai de
   Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual. Zonas pelas fileiras (as do config):
   fáceis embaixo, médios no meio, difíceis e voadores em cima. Os objetos-assinatura (árvores, poças, teia, flores…) e o chão/céu estão em objetos.js; as falas em falas.js; os monstros em inimigos.js; o portal no Bosque
   vem de interiores/bosque/portais.js (B.portalNovo, no fim). */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).orvalho = R._predios.orvalho || {};
  var F = ((R.FALAS_INTERIORES || {}).orvalho || {}).objetos || {};
  // as árvores 2×1 que podem ficar atrás de outra na mata (o layout marca `junto` nelas: a copa não é "por cima")
  var ALTOS = { 'orvalho-arvore': 1, 'orvalho-arvore-p': 1, 'orvalho-arvore-velha': 1, 'orvalho-arvoreta': 1, 'orvalho-arbusto': 1, 'orvalho-toco': 1 };
  var L = I.arena({
    semente: 20261125,
    trilha: P.trilha,
    // clareiras sem sólido: a chegada, cada cruzamento de trilha, o miolo do poço de orvalho e a clareira do fundo
    clareiras: [[28, 37, 5.5], [14, 33, 4], [45, 32, 4], [38, 36, 3], [13, 21, 4.5], [44, 21, 4.5], [27, 23, 3.5], [14, 10, 4], [42, 9, 4], [28, 6, 3.5],
      [20, 27, 1.8], [38, 16, 3], [22.5, 33, 3.4]],
    fixos: [
      ['orvalho-placa', 34, 36, 'Placa', F.placa],
      ['orvalho-lanterna', 23, 36, 'Lanterna', F.lanterna],
      ['orvalho-cogumelo', 42, 29, 'Cogumelo', F.cogumelo],
      ['orvalho-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: [
      // o cartão de visita: o poço de orvalho à esquerda do portal, duas árvores altas emoldurando a chegada (fora da zona segura,
      // desencontradas) e o anel de flores em volta do portal de volta
      ['orvalho-poco', 21, 31], ['orvalho-arvore', 18, 38], ['orvalho-arvore-p', 36, 39], ['orvalho-arvore', 39, 39],
      ['orvalho-florzinha', 26, 40, { n: 0 }], ['orvalho-flor', 27, 40], ['orvalho-florzinha', 31, 40, { n: 1 }], ['orvalho-flor', 32, 40],
      ['orvalho-florzinha', 26, 39, { n: 2 }], ['orvalho-florzinha', 31, 39, { n: 0 }], ['orvalho-polen', 27, 38],
      ['orvalho-polen', 24, 38], ['orvalho-polen', 33, 37], ['orvalho-polen', 25, 33],
      // a mata em volta da vista do spawn (fora da zona segura, nada sobre a trilha): a chegada é uma clareira emoldurada
      ['orvalho-arvore', 17, 31], ['orvalho-arvore-p', 19, 29], ['orvalho-arvore', 22, 29], ['orvalho-arvoreta', 20, 33],
      ['orvalho-arvore-p', 35, 33], ['orvalho-arvore', 38, 31], ['orvalho-arvoreta', 38, 34], ['orvalho-arvore-p', 41, 30],
      // as poças de sol da manhã (planas, elipses de pixel), ao longo da trilha
      ['orvalho-raio', 25, 36], ['orvalho-raio', 31, 34], ['orvalho-raio', 36, 32],
      // as moitas-assinatura (samambaias, flores e gotas num objeto só) quebram a grade
      ['orvalho-moita', 19, 36, { n: 0 }], ['orvalho-moita-g', 32, 38, { n: 1 }], ['orvalho-moita', 25, 31, { n: 2 }], ['orvalho-moita', 37, 34, { n: 0 }],
      ['orvalho-moita-g', 24, 29, { n: 2 }], ['orvalho-moita', 34, 27, { n: 1 }], ['orvalho-moita', 14, 23, { n: 0 }],
      // a trilha da entrada: poças rente à beirada, folhas caídas, lanternas das fadas, teia
      ['orvalho-poca', 24, 34], ['orvalho-poca', 33, 34], ['orvalho-teia', 17, 35],
      ['orvalho-folha', 32, 32], ['orvalho-folha', 24, 23], ['orvalho-folha', 22, 38],
      ['orvalho-florzinha', 13, 31, { n: 1 }], ['orvalho-florzinha', 39, 34, { n: 2 }], ['orvalho-florzinha', 33, 20, { n: 0 }],
      ['orvalho-samambaia', 40, 30], ['orvalho-samambaia', 22, 29],
      ['orvalho-lanterna', 24, 33], ['orvalho-lanterna', 34, 32], ['orvalho-lanterna', 32, 27], ['orvalho-lanterna', 24, 26],
      ['orvalho-lanterna', 33, 22], ['orvalho-lanterna', 25, 18], ['orvalho-lanterna', 32, 14], ['orvalho-lanterna', 30, 8],
      ['orvalho-cogumelo', 18, 30], ['orvalho-cogumelo', 36, 26], ['orvalho-cogumelo', 21, 15], ['orvalho-toco', 38, 27], ['orvalho-toco', 36, 11],
      // o poço de pedras do meio (clareira): pedras em volta, poças no miolo e samambaias
      ['orvalho-pedra', 17, 27], ['orvalho-pedra', 18, 25], ['orvalho-pedra', 22, 25], ['orvalho-pedra', 23, 27], ['orvalho-pedra', 21, 29],
      ['orvalho-poca', 20, 27], ['orvalho-samambaia', 19, 28], ['orvalho-samambaia', 22, 26], ['orvalho-polen', 20, 25],
      // a clareira do fundo: teia, poças, samambaias e um retalho de sol
      ['orvalho-teia', 36, 14], ['orvalho-raio', 39, 17], ['orvalho-samambaia', 36, 17],
      ['orvalho-samambaia', 41, 15], ['orvalho-pedra', 35, 18], ['orvalho-pedra', 42, 17], ['orvalho-polen', 37, 15], ['orvalho-florzinha', 40, 14, { n: 1 }],
    ],
    altos: ALTOS,
    borda: { lado: 'orvalho-arvore-p', baixo: ['orvalho-arbusto', 'orvalho-arvoreta'] },
    base: { facil: 0.03, medio: 0.08, dificil: 0.12 },
    bosques: [[28, 32, 5], [20, 34, 5], [37, 33, 5], [8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.3, 'orvalho-arvore'], [0.55, 'orvalho-arvore-p'], [0.7, 'orvalho-arvoreta'], [0.86, 'orvalho-arbusto'], [0.94, 'orvalho-pedra'], [1, 'orvalho-toco']],
    bolsao: ['orvalho-arbusto', 'orvalho-pedra', 'orvalho-toco'], coberto: 'orvalho-arbusto',
    miudos: {
      comum: ['orvalho-samambaia', 'orvalho-flor', 'orvalho-folha', 'orvalho-florzinha', 'orvalho-samambaia', 'orvalho-florzinha', 'orvalho-folha', 'orvalho-flor'],
      fundo: ['orvalho-folha', 'orvalho-flor', 'orvalho-florzinha'],
      fundoAte: 20,
      trilha: 'orvalho-folha',
      varN: { 'orvalho-florzinha': 3 },
    },
  });

  // a arena do Bosque do Orvalho (o motor do combate e o HUD são os de sempre; os números são config.arenas.orvalho)
  R.registrarArena({ id: 'orvalho', nome: 'Bosque do Orvalho', curto: 'Orvalho', emoji: '💧' });
  R.registrarInterior({
    id: 'orvalho',
    lugar: 'bosque',
    nome: 'Bosque do Orvalho',
    entrada: false,
    pacote: 'interior-bosque',
    fundo: 'orvalho',
    tamanho: L.tamanho,
    spawn: L.spawn,
    // sem `saida`: a volta para o Bosque é o portal de volta em (28,40) (o objeto e a escada `portal`)
    comodos: [{ id: 'orvalho', nome: 'Bosque do Orvalho', rect: L.comodo, piso: 'orvalho-orvalho', parede: 'orvalho-copas' }],
    escadas: [{ x: L.saida.x, y: L.saida.y, para: 'bosque', sentido: 'portal', seta: false, chegar: { x: 0, y: -1 } }],
    objetos: L.objetos.concat([{ tipo: 'orvalho-portal-volta', x: L.saida.x, y: L.saida.y }]),
  });

  // o portal no Bosque dos Fantasmas (o redemoinho verde-água, a placa "Nv 25", a trilha e a escada de ida)
  var B = (R._predios = R._predios || {}).bosque || {};
  B.portalNovo(B.PORTAIS['orvalho']);
})();
