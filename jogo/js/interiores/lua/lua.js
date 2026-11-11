/* Bosque da Lua Cheia: o interior de céu aberto de dentro do Bosque dos Fantasmas (lugar 'bosque'; arenas.md §8). É a
   arena 9, a mais difícil do jogo (nível 35): Reino.registrarArena + os números em config.arenas.lua (nucleo/config.js).
   Fixos (contrato das arenas de dentro do Bosque): id 'lua', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão
   nas fileiras 3 a 40), spawn (28, 39) e SEM tapete de saída: a volta é o portal 'lua-portal-volta' em (28, 40) com a
   escada `portal` pareada no Bosque (interiores/bosque/portais.js, chamado no fim deste arquivo), fundo 'lua'
   (objetos.js), pacote 'interior-bosque'. O layout sai de Reino.Interiores.arena, com semente: sempre igual. As zonas
   pelas fileiras (as do config): fáceis embaixo, médios no meio, difíceis e voadores em cima.
   O chão, o céu e os objetos-assinatura em objetos.js, as falas em falas.js, os inimigos em inimigos.js.
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).lua = R._predios.lua || {};
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  var F = ((R.FALAS_INTERIORES || {}).lua || {}).objetos || {};

  /* ---------- a trilha de terra azulada (por semente: sempre a mesma) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o fundo da floresta
  var CAMINHOS = [
    [[28, 40], [28, 35], [24, 31], [25, 26], [31, 22], [30, 17], [25, 13], [27, 8], [28, 4]],   // a principal
    [[28, 35], [37, 33], [46, 34]], [[24, 31], [15, 33], [8, 31]],                              // fáceis, de lado
    [[31, 22], [43, 21]], [[25, 26], [13, 23]],                                                 // médias
    [[30, 17], [42, 12]], [[25, 13], [14, 10]],                                                 // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(9037), t = {};
    CAMINHOS.forEach(function (c) {
      for (var s = 0; s < c.length - 1; s++) {
        var a = c[s], b = c[s + 1], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 2, fase = rng() * 6;
        for (var i = 0; i <= n; i++) {
          var f = i / n, x = Math.round(a[0] + (b[0] - a[0]) * f), y = Math.round(a[1] + (b[1] - a[1]) * f);
          if (Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])) x += Math.round(Math.sin(f * 3.1 + fase) * 1.2);   // balança de leve
          else y += Math.round(Math.sin(f * 3.1 + fase) * 1.2);
          t[y * 100 + x] = 1; t[y * 100 + x + 1] = 1; t[(y + 1) * 100 + x] = 1; t[(y + 1) * 100 + x + 1] = 1;
        }
      }
    });
    return t;
  }
  P.trilha = function (tx, ty) { if (!_trilha) _trilha = montarTrilha(); return !!_trilha[ty * 100 + tx]; };

  // as árvores da mata (as copas podem ficar atrás umas das outras, como no Bosque)
  var ALTOS = { 'luacheia-arvore': 1, 'bosque-pinheiro': 1 };
  var L = I.arena({
    semente: 20261137,
    zonas: R.Arenas.cfg('lua').zonas,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as do caminho, as do fundo e as dos fixos
    clareiras: [[28, 37, 5.5], [14, 34, 4], [45, 33, 4], [38, 36, 3], [14, 22, 4.5], [44, 21, 4.5], [27, 23, 3.5], [14, 10, 4], [42, 10, 4], [28, 6, 3.5]],
    fixos: [
      ['bosque-placa', 34, 36, 'Placa', F.placa],
      ['bosque-lanterna', 19, 35, 'Lanterna das fadas', F.lanterna],
      ['bosque-cogumelo', 42, 29, 'Cogumelo', F.cogumelo],
      ['bosque-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: [
      ['luacheia-cristal', 45, 35], ['luacheia-cristal', 17, 30], ['luacheia-cristal', 33, 8], ['luacheia-cristal', 47, 17],
      ['luacheia-cogumelo', 12, 33], ['luacheia-cogumelo', 38, 27], ['luacheia-cogumelo', 21, 14], ['luacheia-cogumelo', 30, 5],
      ['bosque-poca', 40, 32], ['bosque-poca', 18, 6], ['bosque-anel-fadas', 20, 19],
    ],
    altos: ALTOS,
    borda: { lado: 'luacheia-arvore', baixo: ['bosque-arbusto', 'bosque-pedra'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 37, 4], [20, 30, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.6, 'luacheia-arvore'], [0.74, 'bosque-pinheiro'], [0.84, 'bosque-arbusto'], [0.92, 'bosque-pedra'], [0.97, 'bosque-toco'], [1, 'bosque-tronco']],
    bolsao: ['bosque-arbusto', 'bosque-arbusto', 'bosque-pedra', 'bosque-toco'], coberto: 'bosque-arbusto',
    miudos: {
      comum: ['bosque-mato', 'bosque-flores', 'bosque-margaridas', 'bosque-trevo', 'bosque-samambaia', 'bosque-pedrinhas',
        'bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes', 'luacheia-cogumelo'],
      fundo: ['bosque-vagalumes', 'bosque-flor-brilho', 'bosque-cogumelos', 'luacheia-cogumelo', 'bosque-mato', 'bosque-samambaia'], fundoAte: 20,
      trilha: 'bosque-pedrinhas', varN: { 'bosque-flores': 5, 'bosque-cogumelos': 3, 'luacheia-cogumelo': 3 },
    },
  });

  R.registrarArena({ id: 'lua', nome: 'Bosque da Lua Cheia', curto: 'Lua Cheia', emoji: '🌙' });
  R.registrarInterior({
    id: 'lua',
    lugar: 'bosque',
    nome: 'Bosque da Lua Cheia',
    entrada: false,
    pacote: 'interior-bosque',
    fundo: 'lua',
    tamanho: L.tamanho,
    spawn: L.spawn,
    comodos: [{ id: 'lua', nome: 'Bosque da Lua Cheia', rect: L.comodo, piso: 'lua-lua', parede: 'lua-copas' }],
    // a volta é o portal (sem tapete de saída): a escada pareada com a do Bosque (portais.js)
    escadas: [{ x: 28, y: 40, para: 'bosque', sentido: 'portal', seta: false, chegar: { x: 0, y: -1 } }],
    objetos: L.objetos.concat([{ tipo: 'lua-portal-volta', x: 28, y: 40 }]),
  });

  // o portal no Bosque, a placa "Nv 35", a trilha até ele e a escada de ida (o layout do Bosque já foi sorteado)
  B.portalNovo(B.PORTAIS['lua']);
})();
