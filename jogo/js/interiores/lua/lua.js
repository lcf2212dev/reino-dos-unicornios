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

  // as árvores 2×1 da mata (as copas podem ficar atrás umas das outras, como no Bosque)
  var ALTOS = { 'lua-arvore': 1, 'lua-arvore-m': 1, 'lua-arvore-p': 1 };
  // o círculo de pedras rúnicas (o marco da floresta): 6 pedras em roda de (14, 17), com cristais e um raio de luar no meio
  var RODA = [[10, 16], [12, 13], [16, 13], [18, 16], [16, 20], [11, 20]].map(function (p) { return ['lua-pedra-runa', p[0], p[1]]; });
  var L = I.arena({
    semente: 20261137,
    zonas: R.Arenas.cfg('lua').zonas,
    trilha: P.trilha,
    // clareiras sem sólido: a da chegada, as do caminho, a do círculo de pedras e as do fundo
    clareiras: [[28, 37, 4], [14, 34, 3.5], [45, 33, 4], [38, 36, 2.5], [14, 17, 3.2], [14, 23, 3.5], [44, 21, 4.5], [27, 23, 3.5], [14, 10, 3], [42, 10, 4], [28, 6, 4]],
    fixos: [
      ['lua-placa', 34, 36, 'Placa', F.placa],
      ['lua-lanterna', 17, 34, 'Lanterna das fadas', F.lanterna],
      ['lua-cogumelo', 42, 29, 'Cogumelo', F.cogumelo],
      ['lua-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: RODA.concat([
      // a vista do spawn: a poça da lua, 2 feixes de luar, poças de luar no campo, runas (não só o círculo é marco) e moitas
      ['lua-poca-g', 30, 37], ['lua-feixe', 29, 30], ['lua-feixe', 19, 28], ['lua-luar', 20, 35], ['lua-luar', 33, 33, 1], ['lua-luar', 24, 25, 2], ['lua-luar', 26, 33, 3],
      ['lua-arvore-p', 18, 29], ['lua-arvore-m', 20, 28], ['lua-arvore', 33, 29], ['lua-arvore-m', 37, 29], ['lua-arvore-p', 38, 31], ['lua-arvore', 35, 27],   // a clareira: copas sobrepostas em volta da vista do spawn
      ['lua-pedra', 35, 31], ['lua-pedra', 21, 29], ['lua-pedra', 41, 36],
      ['lua-moita', 25, 36, 1], ['lua-moita', 37, 33], ['lua-moita-g', 22, 32], ['lua-moita-g', 38, 26, 1], ['lua-moita', 30, 27, 2],
      // a chegada emoldurada: árvores desencontradas, cristais e flores-da-lua em volta do portal de volta
      ['lua-arvore', 20, 38], ['lua-arvore-m', 36, 40], ['lua-cristal-g', 22, 38], ['lua-cristal-fixo', 35, 39], ['lua-arvoreta', 31, 40], ['lua-arvore-p', 12, 40], ['lua-arvore-m', 44, 40], ['lua-pedra', 9, 40], ['lua-arvore-m', 16, 40], ['lua-moita', 23, 40], ['lua-moita', 33, 40, 1], ['lua-pedra', 40, 40], ['lua-arvore', 47, 40],
      ['lua-flor-lua', 27, 40], ['lua-flor-lua', 29, 40, 1], ['lua-flor-lua-fixa', 26, 39, 2], ['lua-flor-lua-fixa', 30, 39], ['lua-vaga-lumes', 33, 39],
      // o círculo: cristais e o raio de luar no miolo
      ['lua-raio', 14, 15], ['lua-cristal-g', 14, 18], ['lua-cristal', 13, 16], ['lua-flor-lua-fixa', 15, 17, 1], ['lua-flor-lua-fixa', 12, 17, 2], ['lua-luar', 8, 17],
      // o miolo
      ['lua-cristal-g-fixo', 44, 28], ['lua-cristal', 39, 30], ['lua-cogumelos', 40, 28, 1], ['lua-cogumelos-fixo', 45, 31, 2], ['lua-poca-fixa', 40, 32, 1],
      ['lua-vaga-lumes', 33, 29], ['lua-vaga-lumes', 10, 30], ['lua-vaga-lumes', 17, 26], ['lua-cogumelos-fixo', 38, 21, 3], ['lua-poca', 28, 28, 2],
      // o fundo
      ['lua-cristal-g-fixo', 24, 5], ['lua-cristal-fixo', 33, 6], ['lua-cogumelos-fixo', 30, 5, 1], ['lua-cogumelos-fixo', 26, 8, 2], ['lua-flor-lua-fixa', 28, 4, 1], ['lua-flor-lua-fixa', 31, 7, 2],
      ['lua-poca-fixa', 18, 6], ['lua-moita-g', 21, 12], ['lua-vaga-lumes', 40, 14], ['lua-cristal-fixo', 47, 17], ['lua-cristal-fixo', 17, 31],
    ]),
    altos: ALTOS,
    borda: { lado: 'lua-arvore-p', baixo: ['lua-arbusto', 'lua-arvoreta'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[28, 32, 5], [20, 34, 5], [37, 33, 5], [8, 36, 4], [48, 37, 4], [20, 30, 3], [38, 28, 3], [8, 18, 5], [21, 18, 4], [37, 25, 4], [49, 15, 5], [34, 17, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [37, 13, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.26, 'lua-arvore'], [0.44, 'lua-arvore-m'], [0.58, 'lua-arvore-p'], [0.72, 'lua-arvoreta'], [0.86, 'lua-arbusto'], [0.94, 'lua-pedra'], [1, 'lua-arbusto']],
    bolsao: ['lua-arbusto', 'lua-pedra'], coberto: 'lua-arbusto',
    miudos: {
      comum: ['lua-samambaia', 'lua-flor-lua-fixa', 'lua-folhas', 'lua-cogumelos-fixo', 'lua-samambaia', 'lua-flor-lua-fixa', 'lua-folhas'],   // só tipos sem anim (os animados ficam em enfeites)
      fundo: ['lua-cogumelos-fixo', 'lua-flor-lua-fixa', 'lua-samambaia'], fundoAte: 20,
      trilha: 'lua-folhas', varN: { 'lua-cogumelos-fixo': 4, 'lua-flor-lua-fixa': 3 },
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
