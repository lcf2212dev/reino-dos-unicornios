/* Bosque da Neblina: o interior de céu aberto (lugar 'bosque'; docs/contratos/arenas.md §8). É o bosque 8 do jogo, um
   dos três de DENTRO do Bosque dos Fantasmas: o portal fica na borda direita da arena do Bosque, com a placa "Nv 30"
   (interiores/bosque/portais.js), e a volta é o portal de (28,40), logo abaixo do spawn.
   Fixos (contrato): id 'neblina', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3 a 40), SEM
   `saida` (a volta é o portal), spawn (28,39), fundo 'neblina' (objetos.js), pacote 'interior-bosque'. Ela chega em
   (28,39) vindo do Bosque (a escada de lá tem o `chegar` {-1,0}, o lado de chegada no Bosque).
   O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual. Zonas pelas fileiras
   (config.arenas.neblina.zonas): fáceis embaixo, médios no meio, difíceis e voadores em cima; a zona segura em volta
   do spawn não tem sólido.
   O chão, o céu e os objetos-assinatura estão em objetos.js; as falas (as do Bosque, copiadas) em falas.js; o ícone e
   os 4 monstros em inimigos.js. No fim chama B.portalNovo(B.PORTAIS.neblina): o portal, a placa do nível, a trilha e a
   escada de ida no Bosque, mais as miudezas nas janelas que abrirem (o layout do Bosque já foi sorteado em bosque.js). */
(function () {
  var R = window.Reino, I = R.Interiores, P = (R._predios = R._predios || {}).neblina = R._predios.neblina || {};
  var F = ((R.FALAS_INTERIORES || {}).neblina || {}).objetos || {};

  /* ---------- a trilha de terra (por semente: sempre a mesma) ---------- */
  // pontos por onde ela passa (x, y em tiles); a principal sobe do portal de volta até o fundo do bosque, em zigue-zague
  var CAMINHOS = [
    [[28, 40], [28, 35], [24, 31], [31, 27], [26, 22], [32, 18], [25, 13], [29, 8], [28, 3]],   // a principal
    [[28, 35], [20, 34], [13, 36]], [[24, 31], [33, 33], [42, 34]],                             // fáceis, de lado
    [[31, 27], [40, 25], [46, 22]], [[26, 22], [17, 20], [11, 22]],                             // médias
    [[32, 18], [41, 15]], [[25, 13], [17, 11]],                                                  // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(6111), t = {};
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

  /* ---------- o layout do bosque (Reino.Interiores.arena): fixos, mata, bosquezinhos, bolsões e miudezas ---------- */
  var L = I.arena({
    semente: 20261111,
    trilha: P.trilha,
    // clareiras sem sólido: a da entrada, as do caminho, as do fundo e as dos cantos
    clareiras: [[28, 37, 5.5], [14, 33, 4], [44, 32, 4], [38, 36, 3], [13, 21, 4.5], [44, 20, 4.5], [27, 23, 3.5], [14, 10, 4], [42, 9, 4], [28, 6, 3.5]],
    fixos: [
      ['bosque-placa', 34, 36, 'Placa', F.placa],
      ['bosque-lanterna', 23, 36, 'Lanterna', F.lanterna],
      ['bosque-cogumelo', 42, 29, 'Cogumelo', F.cogumelo],
      ['bosque-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: [
      // os bancos de neblina atravessando as clareiras
      ['neblina-banco', 18, 34], ['neblina-banco', 40, 30], ['neblina-banco', 22, 20], ['neblina-banco', 44, 16],
      ['neblina-banco', 15, 9], ['neblina-banco', 36, 6],
      // os cogumelos-da-neblina ao lado da trilha
      ['neblina-cogumelo', 21, 33], ['neblina-cogumelo', 38, 34], ['neblina-cogumelo', 45, 21], ['neblina-cogumelo', 17, 15],
      ['neblina-cogumelo', 33, 9],
      // as lanternas das fadas (as mesmas do Bosque) marcando a trilha principal
      ['bosque-lanterna', 22, 33], ['bosque-lanterna', 34, 32], ['bosque-lanterna', 33, 27], ['bosque-lanterna', 25, 25],
      ['bosque-lanterna', 31, 21], ['bosque-lanterna', 26, 17], ['bosque-lanterna', 31, 13], ['bosque-lanterna', 29, 7],
      // troncos caídos, arbustos e árvorezinhas lilás
      ['bosque-tronco', 18, 30], ['bosque-tronco', 38, 27], ['bosque-tronco', 20, 15], ['bosque-tronco', 36, 11],
      ['bosque-arbusto', 16, 36, { cor: 'lilas' }], ['bosque-arbusto', 41, 35, { cor: 'lilas' }],
      ['bosque-arvore-p', 49, 36, { cor: 'lilas' }], ['bosque-arvore-p', 7, 31, { cor: 'lilas' }],
    ],
    altos: { 'neblina-arvore': 1, 'bosque-pinheiro': 1 },
    borda: { lado: 'neblina-arvore', baixo: ['bosque-arbusto', 'neblina-arvore'] },
    base: { facil: 0.025, medio: 0.07, dificil: 0.11 },
    bosques: [[8, 36, 4], [48, 37, 4], [20, 29, 3], [38, 28, 3], [8, 18, 5], [22, 19, 4], [37, 24, 4], [49, 15, 5], [34, 16, 3],
      [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [21, 11, 4], [36, 12, 4], [7, 12, 3], [49, 11, 3]],
    mata: [[0.4, 'neblina-arvore'], [0.64, 'bosque-pinheiro'], [0.78, 'bosque-arbusto'], [0.89, 'bosque-pedra'], [0.96, 'bosque-toco'], [1, 'bosque-tronco']],
    bolsao: ['bosque-arbusto', 'bosque-arbusto', 'bosque-pedra', 'bosque-toco'], coberto: 'bosque-arbusto',
    miudos: {
      comum: ['neblina-cogumelo', 'neblina-cogumelo', 'neblina-banco', 'bosque-mato', 'bosque-flores', 'bosque-margaridas',
        'bosque-trevo', 'bosque-samambaia', 'bosque-pedrinhas'],
      fundo: ['neblina-banco', 'neblina-banco', 'neblina-cogumelo', 'bosque-cogumelos', 'bosque-flor-brilho', 'bosque-vagalumes', 'bosque-mato'],
      fundoAte: 20, trilha: 'bosque-pedrinhas', varN: { 'bosque-flores': 5, 'bosque-cogumelos': 5 },
    },
  });

  R.registrarArena({ id: 'neblina', nome: 'Bosque da Neblina', curto: 'Neblina', emoji: '🌫' });
  R.registrarInterior({
    id: 'neblina',
    lugar: 'bosque',
    nome: 'Bosque da Neblina',
    entrada: false,
    pacote: 'interior-bosque',
    fundo: 'neblina',
    tamanho: L.tamanho,
    spawn: L.spawn,
    comodos: [{ id: 'neblina', nome: 'Bosque da Neblina', rect: L.comodo, piso: 'neblina-neblina', parede: 'neblina-copas' }],
    // a volta é o portal (objeto e escada no mesmo tile): vindo do Bosque ela chega em (28,39), o spawn
    escadas: [{ x: 28, y: 40, para: 'bosque', sentido: 'portal', seta: false, chegar: { x: 0, y: -1 } }],
    objetos: L.objetos.concat([{ tipo: 'neblina-portal-volta', x: 28, y: 40 }]),
  });

  /* ---------- o portal no Bosque (o redemoinho, a placa "Nv 30", a trilha nova e a escada de ida) ---------- */
  var B = (R._predios = R._predios || {}).bosque || {};
  if (B.portalNovo) B.portalNovo(B.PORTAIS.neblina);
})();
