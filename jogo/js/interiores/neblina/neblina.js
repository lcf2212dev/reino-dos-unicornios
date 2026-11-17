/* Bosque da Neblina: o interior de céu aberto (lugar 'bosque'; docs/contratos/arenas.md §8). É o bosque 8 do jogo, um
   dos três de DENTRO do Bosque dos Fantasmas: o portal fica na borda direita da arena do Bosque, com a placa "Nv 30"
   (interiores/bosque/portais.js), e a volta é o portal de (28,40), logo abaixo do spawn.
   Fixos (contrato): id 'neblina', 56 × 44 tiles, cômodo { x: 1, y: 1, w: 54, h: 40 } (chão nas fileiras 3 a 40), SEM
   `saida` (a volta é o portal), spawn (28,39), fundo 'neblina' (objetos.js), pacote 'interior-bosque'. Ela chega em
   (28,39) vindo do Bosque (a escada de lá tem o `chegar` {-1,0}, o lado de chegada no Bosque).
   O layout sai de Reino.Interiores.arena (motor/interiores-arena.js), com semente: sempre igual. Zonas pelas fileiras
   (config.arenas.neblina.zonas): fáceis embaixo, médios no meio, difíceis e voadores em cima; a zona segura em volta
   do spawn não tem sólido.
   O chão, o céu e os objetos-assinatura (kit próprio, floresta fria) estão em objetos.js; as falas (as do Bosque, copiadas) em falas.js; o ícone e
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
    // clareiras sem sólido: a chegada (emoldurada por duas árvores), a do círculo de pedras, as do caminho e as do fundo
    clareiras: [[28, 37, 4], [14, 33, 4], [44, 34, 3], [46, 29, 3], [13, 21, 4.5], [44, 19, 4], [27, 23, 3.5], [14, 10, 4], [42, 9, 4], [28, 6, 3.5], [21, 11, 2.5]],
    fixos: [
      ['neblina-placa', 34, 36, 'Placa', F.placa],
      ['neblina-lanterna', 23, 36, 'Lanterna', F.lanterna],
      ['neblina-cogumelo', 46, 29, 'Cogumelo', F.cogumelo],           // o foco do círculo de pedras
      ['neblina-arvore-velha', 11, 25, 'Árvore velha', F['arvore-velha']],
    ],
    enfeites: [
      // a fileira de baixo à mão (a borda do motor só tem 2 tipos em passo fixo): árvores de 2 tamanhos, arbustos, arvoretas, pedras
      ['neblina-arbusto', 1, 40], ['neblina-arvore-p', 2, 40], ['neblina-arbusto', 54, 40], ['neblina-arbusto', 4, 40], ['neblina-arvoreta', 5, 40], ['neblina-arvore', 6, 40], ['neblina-pedra', 8, 40], ['neblina-arbusto', 9, 40],
      ['neblina-arvore-p', 10, 40], ['neblina-arvoreta', 12, 40], ['neblina-tronco', 13, 40], ['neblina-arvore', 14, 40], ['neblina-arbusto', 16, 40], ['neblina-arvore-p', 17, 40],
      ['neblina-pedra', 19, 40], ['neblina-arvoreta', 20, 40], ['neblina-arvore', 21, 40], ['neblina-arbusto', 23, 40], ['neblina-arvoreta', 24, 40],
      ['neblina-arvore-p', 32, 40], ['neblina-arbusto', 34, 40], ['neblina-arvoreta', 35, 40], ['neblina-arvore', 36, 40], ['neblina-tronco', 38, 40], ['neblina-arbusto', 39, 40],
      ['neblina-arbusto', 40, 40], ['neblina-arvoreta', 42, 40], ['neblina-pedra', 43, 40], ['neblina-arvore', 44, 40], ['neblina-arbusto', 46, 40], ['neblina-arvoreta', 47, 40],
      ['neblina-arvore-p', 48, 40], ['neblina-arbusto', 50, 40], ['neblina-arvore', 51, 40], ['neblina-arvoreta', 53, 40],
      // a chegada: duas árvores, névoa rasteira atravessando a vista e flores lilás/azuis em volta do portal de volta
      ['neblina-arvore-p', 19, 37], ['neblina-arvore', 36, 38], ['neblina-nevoa', 25, 35], ['neblina-nevoa', 30, 34], ['neblina-nevoa-fixo', 21, 37], ['neblina-banco', 31, 37], ['neblina-flores', 26, 40, 1], ['neblina-flores', 30, 40, 3],
      ['neblina-flores', 25, 39, 4], ['neblina-vaga-lumes', 27, 36], ['neblina-vaga-lumes', 31, 36], ['neblina-vaga-lumes-fixo', 21, 38], ['neblina-vaga-lumes', 33, 33], ['neblina-vaga-lumes-fixo', 21, 36],
      ['neblina-poca', 33, 39, 1], ['neblina-moita', 30, 38],
      ['neblina-pedra', 31, 37], ['neblina-pedra', 34, 38], ['neblina-pedra', 33, 35], ['neblina-cogumelo-luz', 32, 36], ['neblina-cogumelo-luz-fixo', 33, 37], ['neblina-cogumelo-luz-fixo', 32, 38],
      ['neblina-pedra', 22, 38], ['neblina-pedra', 25, 38], ['neblina-cogumelo-luz', 23, 38], ['neblina-cogumelo-luz-fixo', 24, 39],
      // o cartão de visita: um pedaço do círculo de pedras (cogumelos acesos e névoa) já na vista do spawn, dos dois lados
      ['neblina-pedra', 35, 32], ['neblina-pedra', 37, 31], ['neblina-pedra', 36, 35], ['neblina-cogumelo-luz', 36, 32], ['neblina-cogumelo-luz-fixo', 37, 33], ['neblina-nevoa', 34, 33],
      // a clareira no bosque: copas sobrepostas dos dois lados da vista (nada sólido na trilha)
      ['neblina-arvore-p', 19, 31], ['neblina-arvoreta', 22, 30], ['neblina-arvore', 17, 29], ['neblina-arvore', 35, 29], ['neblina-arvore-p', 38, 31], ['neblina-arvoreta', 36, 30], ['neblina-arvore-p', 33, 28],
      ['neblina-pedra', 22, 31], ['neblina-pedra', 19, 33], ['neblina-cogumelo-luz-fixo', 20, 32], ['neblina-cogumelo-luz-fixo', 21, 31], ['neblina-moita', 16, 33],
      // o círculo de pedras do miolo (a entrada é do lado da trilha, a oeste) com os cogumelos acesos e névoa baixa
      ['neblina-pedra', 50, 29], ['neblina-pedra', 49, 32], ['neblina-pedra', 46, 33], ['neblina-pedra', 43, 32], ['neblina-pedra', 43, 26],
      ['neblina-pedra', 46, 25], ['neblina-pedra', 49, 26], ['neblina-cogumelo-luz', 44, 28], ['neblina-cogumelo-luz-fixo', 48, 28],
      ['neblina-cogumelo-luz-fixo', 44, 30], ['neblina-cogumelo-luz', 48, 30], ['neblina-nevoa', 42, 30], ['neblina-vaga-lumes', 46, 27], ['neblina-vaga-lumes-fixo', 47, 31],
      // uma teia entre dois arbustos, poças diferentes e um tronco com cogumelos
      ['neblina-arbusto', 7, 31], ['neblina-arbusto', 10, 31], ['neblina-teia', 8, 30], ['neblina-tronco', 5, 33], ['neblina-poca-fixo', 14, 36, 2], ['neblina-poca-fixo', 11, 28, 1],
      // o miolo: lanternas de fada marcando a trilha, bancos de névoa e moitas
      ['neblina-lanterna', 22, 32], ['neblina-lanterna', 34, 31], ['neblina-lanterna', 33, 26], ['neblina-lanterna', 25, 24],
      ['neblina-lanterna', 31, 20], ['neblina-lanterna', 26, 16], ['neblina-lanterna', 30, 12], ['neblina-lanterna', 31, 6],
      ['neblina-banco', 16, 28], ['neblina-banco', 38, 36], ['neblina-banco-fixo', 20, 20], ['neblina-banco-fixo', 43, 16], ['neblina-banco-fixo', 35, 8], ['neblina-banco-fixo', 12, 12],
      ['neblina-nevoa-fixo', 36, 21], ['neblina-nevoa-fixo', 14, 16], ['neblina-nevoa-fixo', 39, 12], ['neblina-nevoa-fixo', 20, 7], ['neblina-nevoa', 28, 28],
      ['neblina-moita-g', 36, 27], ['neblina-moita', 13, 24], ['neblina-moita', 40, 22], ['neblina-moita-g', 23, 18], ['neblina-moita', 33, 15],
      ['neblina-poca', 36, 30, 0], ['neblina-teia', 36, 13], ['neblina-flores', 37, 29, 0],
      // o fundo: a gruta dos cogumelos acesos, bem escondida
      ['neblina-cogumelo-luz-fixo', 19, 11], ['neblina-cogumelo-luz-fixo', 22, 10], ['neblina-cogumelo-luz', 21, 13], ['neblina-vaga-lumes', 20, 9],
      ['neblina-vaga-lumes-fixo', 45, 8], ['neblina-vaga-lumes-fixo', 12, 14], ['neblina-tronco', 17, 8], ['neblina-pedra', 24, 12], ['neblina-poca-fixo', 40, 8, 2],
      ['neblina-cogumelo-luz-fixo', 17, 20], ['neblina-vaga-lumes-fixo', 41, 20], ['neblina-folhas', 29, 29], ['neblina-folhas', 24, 33], ['neblina-flores', 15, 26, 2],
    ],
    altos: { 'neblina-arvore': 1, 'neblina-arvore-p': 1, 'neblina-arvoreta': 1 },
    borda: { lado: 'neblina-arvore-p', baixo: ['neblina-arbusto', 'neblina-arvoreta'] },
    base: { facil: 0.035, medio: 0.085, dificil: 0.12 },
    bosques: [[28, 32, 5], [20, 34, 5], [37, 33, 5], [8, 36, 4], [49, 37, 4], [20, 29, 3], [8, 18, 5], [22, 19, 4], [49, 15, 5], [8, 6, 5], [21, 4, 4], [36, 4, 4], [49, 6, 5], [36, 14, 4], [37, 24, 3]],
    mata: [[0.3, 'neblina-arvore'], [0.55, 'neblina-arvore-p'], [0.7, 'neblina-arvoreta'], [0.86, 'neblina-arbusto'], [0.94, 'neblina-pedra'], [1, 'neblina-tronco']],
    bolsao: ['neblina-arbusto', 'neblina-pedra', 'neblina-tronco'], coberto: 'neblina-arbusto',
    miudos: {
      comum: ['neblina-samambaia', 'neblina-flores', 'neblina-samambaia', 'neblina-flores', 'neblina-folhas'],
      fundo: ['neblina-samambaia', 'neblina-folhas', 'neblina-flores'],
      fundoAte: 20, trilha: 'neblina-folhas', varN: { 'neblina-flores': 5, 'neblina-poca': 3 },
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
    // a árvore sorteada em (40,39) escondia um inimigo da zona fácil (só a barra de vida aparecia): sai da lista (o sorteio do layout não muda)
    objetos: L.objetos.filter(function (o) { return !(o.tipo === 'neblina-arvore-p' && o.x === 40 && o.y === 39); }).concat([{ tipo: 'neblina-portal-volta', x: 28, y: 40 }]),
  });

  /* ---------- o portal no Bosque (o redemoinho, a placa "Nv 30", a trilha nova e a escada de ida) ---------- */
  var B = (R._predios = R._predios || {}).bosque || {};
  if (B.portalNovo) B.portalNovo(B.PORTAIS.neblina);
})();
