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
   fáceis embaixo, médios no meio, difíceis e voadores em cima. Os objetos-assinatura (a árvore do orvalho, a folha e a
   florzinha) e o chão/céu estão em objetos.js; as falas em falas.js; os monstros em inimigos.js; o portal no Bosque
   vem de interiores/bosque/portais.js (B.portalNovo, no fim). */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).orvalho = R._predios.orvalho || {};
  var F = ((R.FALAS_INTERIORES || {}).orvalho || {}).objetos || {};
  // as árvores que podem ficar atrás de outra igual na mata (o layout marca `junto` nelas: a copa não é "por cima")
  var ALTOS = { 'orvalho-arvore': 1, 'bosque-arvore': 1, 'bosque-arvore-p': 1, 'bosque-pinheiro': 1 };
  var L = I.arena({
    semente: 20261125,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada e a de cada cruzamento de trilha (as mesmas folgas do Bosque e do Pântano)
    clareiras: [[28, 37, 5.5], [14, 33, 4], [45, 32, 4], [38, 36, 3], [13, 21, 4.5], [44, 21, 4.5], [27, 23, 3.5], [14, 10, 4], [42, 9, 4], [28, 6, 3.5]],
    fixos: [
      ['bosque-placa', 34, 36, 'Placa', F.placa],
      ['bosque-lanterna', 23, 36, 'Lanterna', F.lanterna],
      ['bosque-cogumelo', 42, 29, 'Cogumelo', F.cogumelo],
      ['bosque-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: [
      // as assinaturas da manhã na trilha da entrada: folhas caídas e florzinhas com a gota brilhando
      ['orvalho-folha', 20, 38], ['orvalho-folha', 37, 38], ['orvalho-folha', 32, 32], ['orvalho-folha', 24, 23],
      ['orvalho-florzinha', 17, 36], ['orvalho-florzinha', 39, 34], ['orvalho-florzinha', 23, 32], ['orvalho-florzinha', 33, 20],
      // as mágicas do Bosque, como lá: as lanternas das fadas ladeiam a trilha e os cogumelos ficam nas clareiras
      ['bosque-lanterna', 22, 33], ['bosque-lanterna', 34, 32], ['bosque-lanterna', 32, 27], ['bosque-lanterna', 24, 26],
      ['bosque-lanterna', 33, 22], ['bosque-lanterna', 25, 18], ['bosque-lanterna', 32, 14], ['bosque-lanterna', 30, 8],
      ['bosque-cogumelo', 18, 32, { n: 1 }], ['bosque-cogumelo', 40, 31, { n: 2 }], ['bosque-cogumelo', 20, 28, { n: 3 }],
      ['bosque-cogumelo', 36, 26, { n: 4 }], ['bosque-tronco', 18, 30], ['bosque-tronco', 38, 27], ['bosque-tronco', 20, 15],
      ['bosque-tronco', 36, 11],
    ],
    altos: ALTOS,
    borda: { lado: 'orvalho-arvore', baixo: ['orvalho-arvore', 'bosque-arbusto'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.3, 'orvalho-arvore'], [0.52, 'bosque-arvore-p'], [0.7, 'bosque-pinheiro'], [0.85, 'bosque-arbusto'], [0.93, 'bosque-pedra'], [1, 'bosque-toco']],
    bolsao: ['bosque-arbusto', 'bosque-pedra', 'bosque-toco'], coberto: 'bosque-arbusto',
    miudos: {
      comum: ['bosque-mato', 'bosque-mato', 'bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-samambaia', 'orvalho-folha', 'orvalho-florzinha'],
      fundo: ['bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes', 'orvalho-folha', 'orvalho-florzinha', 'bosque-flores'],
      fundoAte: 20,
      trilha: 'bosque-pedrinhas',
      varN: { 'bosque-cogumelos': 4, 'bosque-flores': 5, 'bosque-flor-brilho': 3 },
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
