/* Observatório, 2º andar (NASA), parte 3 de 3: o Centro de Pesquisas Avançadas da NASA, 3 cômodos lado a lado —
   Hangar dos Foguetes (esquerda) | Sala de Controle (meio, com as escadas) | Laboratório de Experiências (direita).
   Só para brincar: curiosidades e experiências, sem pergunta, estrela, dinheiro ou save. O foguete grande do
   Hangar abre a viagem de foguete (ação `viagem`, sistemas/viagem.js).
   Escadas: desce para o térreo e sobe para o 3º andar (observatorio-3). Quem chega aparece ao lado da escada
   que volta para o andar de onde veio (`chegar`; padrão: logo abaixo). */
(function () {
  var R = window.Reino;
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var N = S.NASA, AZUL_CLARO = S.AZUL_CLARO;
  var HAN = { x: 1, y: 1 }, CTL = { x: 15, y: 1 }, LAB = { x: 29, y: 1 };

  function F() { return S.falas(); }
  function nomeDe(chave, padrao) { var n = F().nasa && F().nasa.nomes; return (n && n[chave]) || padrao; }
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function exp(chave, e, o) { return Object.assign(o, { chave: chave, nome: nomeDe(chave, chave), acao: { tipo: 'nasa-experiencia', exp: e } }); }
  function cur(nome, temas, o) { return Object.assign(o, { nome: nome, acao: { tipo: 'nasa-curiosidade', temas: temas } }); }
  /** NPC do andar com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {string[]} temas @returns {Npc} */
  function npc(id, x, y, temas) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: { tipo: 'nasa-curiosidade', temas: temas, quem: id },
      falas: (F().npcs && F().npcs[id]) || {} };
  }

  var objetos = [].concat(
    /* ---------- HANGAR DOS FOGUETES ---------- */
    sala(HAN.x, HAN.y, [
      { tipo: 'nasa-letreiro', x: 0, y: 0 },
      { tipo: 'nasa-painel', x: 4, y: 0 }, cur('Satélite', ['missoes'], { tipo: 'nasa-satelite', x: 8, y: 0 }),
      { tipo: 'nasa-cartaz', x: 10, y: 0, var: { desenho: 'foguete' } }, { tipo: 'janela', x: 11, y: 0 }, { tipo: 'nasa-cartaz', x: 12, y: 0, var: { desenho: 'lua' } },
      // o foguete grande na plataforma, com a torre ao lado: abre a viagem (painel do foguete, sistemas/viagem.js)
      { tipo: 'nasa-foguete', x: 5, y: 5, chave: 'nasa-foguete', nome: nomeDe('nasa-foguete', 'nasa-foguete'), acao: { tipo: 'viagem' } },
      { tipo: 'nasa-torre', x: 4, y: 6 },
      { tipo: 'nasa-tanque', x: 0, y: 2 }, { tipo: 'nasa-tanque', x: 1, y: 2 }, { tipo: 'nasa-caixa', x: 2, y: 2 },
      { tipo: 'nasa-caixa', x: 3, y: 2 }, { tipo: 'vaso-planta', x: 4, y: 2 }, { tipo: 'nasa-caixa', x: 6, y: 2 }, { tipo: 'caixote', x: 7, y: 2, var: { item: 'estrela' } },
      { tipo: 'estante', x: 9, y: 2, var: { cor: '#6a7390' } }, { tipo: 'observatorio-luminaria', x: 11, y: 2 }, { tipo: 'nasa-caixa', x: 12, y: 2 },
      { tipo: 'nasa-capacete', x: 3, y: 3 }, { tipo: 'pilha-livros', x: 9, y: 4 },
      { tipo: 'nasa-computador', x: 0, y: 5 }, { tipo: 'nasa-caixa', x: 1, y: 5 }, { tipo: 'almofada', x: 2, y: 7, var: { cor: N.azul } },
      cur('Traje de astronauta', ['astronautas'], { tipo: 'observatorio-traje', x: 10, y: 5 }),
      { tipo: 'observatorio-placa', x: 11, y: 5, var: { cor: N.azul2 } }, { tipo: 'nasa-tanque', x: 12, y: 5 },
      { tipo: 'observatorio-cordao', x: 8, y: 6 },
      { tipo: 'tapete-listrado', x: 5, y: 8, w: 3, h: 1, var: { cores: [N.amarelo, '#3a3f5a', N.amarelo, '#3a3f5a'] } },
      { tipo: 'caixote', x: 0, y: 7, var: { item: 'estrela' } }, { tipo: 'nasa-caixa', x: 3, y: 9 },
      { tipo: 'observatorio-foguete', x: 1, y: 10 }, { tipo: 'nasa-caixa', x: 5, y: 10 },
      { tipo: 'planta-alta', x: 0, y: 12 }, { tipo: 'banco', x: 3, y: 12, var: { cor: N.azul } }, { tipo: 'vaso-planta', x: 7, y: 12 },
      { tipo: 'nasa-computador', x: 10, y: 10 }, { tipo: 'nasa-cadeira', x: 9, y: 12 }, { tipo: 'pilha-livros', x: 12, y: 12 },
    ]),
    /* ---------- SALA DE CONTROLE (com as escadas) ---------- */
    sala(CTL.x, CTL.y, [
      { tipo: 'nasa-telao', x: 0, y: 0, var: { tela: 'terra' } },
      { tipo: 'nasa-painel', x: 3, y: 0 }, { tipo: 'nasa-relogio', x: 4, y: 0 },
      { tipo: 'nasa-telao', x: 6, y: 0, var: { tela: 'trajetoria' } },
      { tipo: 'nasa-painel', x: 9, y: 0 }, { tipo: 'nasa-cartaz', x: 10, y: 0, var: { desenho: 'marte' } },
      { tipo: 'nasa-cartaz', x: 12, y: 0, var: { desenho: 'foguete' } },
      { tipo: 'nasa-console', x: 0, y: 2 }, { tipo: 'nasa-computador', x: 4, y: 2 }, { tipo: 'nasa-console', x: 6, y: 2 },
      { tipo: 'nasa-caixa', x: 9, y: 2 }, { tipo: 'planta-alta', x: 12, y: 2 },
      { tipo: 'nasa-cadeira', x: 1, y: 4 }, { tipo: 'nasa-cadeira', x: 7, y: 4 },
      { tipo: 'nasa-console', x: 0, y: 5 }, { tipo: 'nasa-cadeira', x: 1, y: 7 },
      cur('Telão de Marte', ['missoes'], { tipo: 'nasa-telao', x: 9, y: 5, var: { tela: 'marte' }, parede: false, solido: true, w: 3, h: 2 }),
      // NASA escrito no chão, no meio da sala
      { tipo: 'nasa-piso-letreiro', x: 4, y: 6 },
      { tipo: 'nasa-computador', x: 3, y: 10 }, { tipo: 'nasa-capacete', x: 9, y: 10 }, { tipo: 'observatorio-luminaria', x: 12, y: 10 },
      { tipo: 'vaso-planta', x: 0, y: 12 }, { tipo: 'observatorio-globo', x: 3, y: 12 },
      { tipo: 'tapete', x: 8, y: 11, w: 2, h: 1, var: { cor: N.azul2, borda: N.vermelho } },
      { tipo: 'pilha-livros', x: 10, y: 12 }, { tipo: 'nasa-caixa', x: 12, y: 12 },
    ]),
    /* ---------- LABORATÓRIO DE EXPERIÊNCIAS ---------- */
    sala(LAB.x, LAB.y, [
      { tipo: 'nasa-cartaz', x: 0, y: 0, var: { desenho: 'lua' } }, { tipo: 'lousa', x: 1, y: 0, w: 2 },
      { tipo: 'nasa-painel', x: 3, y: 0 }, { tipo: 'arandela', x: 5, y: 0 }, { tipo: 'arandela', x: 7, y: 0 },
      { tipo: 'nasa-letreiro', x: 9, y: 0 },
      exp('nasa-pena', 'pena', { tipo: 'nasa-camara', x: 1, y: 4 }),
      exp('nasa-fases', 'fases', { tipo: 'nasa-fases', x: 5, y: 4 }),
      exp('nasa-horta', 'horta', { tipo: 'nasa-horta', x: 9, y: 4 }),
      { tipo: 'estante', x: 0, y: 2, var: { cor: '#6a7390' } }, { tipo: 'nasa-computador', x: 3, y: 2 },
      { tipo: 'pilha-livros', x: 4, y: 2 }, { tipo: 'vaso-planta', x: 7, y: 2 }, { tipo: 'nasa-tanque', x: 11, y: 2 }, { tipo: 'nasa-caixa', x: 12, y: 2 },
      { tipo: 'mesa', x: 2, y: 6, var: { cor: '#c8d0e0' } }, { tipo: 'nasa-caixa', x: 0, y: 6 }, { tipo: 'nasa-caixa', x: 3, y: 4 },
      { tipo: 'nasa-cadeira', x: 5, y: 6 }, { tipo: 'nasa-caixa', x: 6, y: 9 },
      { tipo: 'vaso-planta', x: 8, y: 6 }, { tipo: 'nasa-computador', x: 10, y: 7 }, { tipo: 'globo', x: 12, y: 6 },
      { tipo: 'nasa-capacete', x: 12, y: 9 },
      { tipo: 'tapete-redondo', x: 8, y: 9, w: 2, h: 2, var: { cores: [N.azul2, N.branco, N.azul] } },
      { tipo: 'nasa-cadeira', x: 3, y: 10 }, { tipo: 'banco', x: 1, y: 11, var: { cor: N.azul } }, { tipo: 'papeis', x: 5, y: 11 },
      { tipo: 'planta-alta', x: 0, y: 12 }, { tipo: 'cesto', x: 6, y: 12 }, { tipo: 'observatorio-luminaria', x: 10, y: 12 }, { tipo: 'nasa-tanque', x: 12, y: 12 },
    ])
  );

  // escadas: desce para o térreo (quem sobe de lá chega à direita do vão, (22, 12)); sobe para o 3º andar
  // (quem desce de lá chega logo abaixo do arco, (26, 4))
  var escadas = [
    { x: CTL.x + 6, y: 12, para: 'observatorio', chegar: { x: 1, y: 0 }, olhar: { x: 0, y: 1 }, sentido: 'desce' },
    { x: CTL.x + 11, y: 3, para: 'observatorio-3', olhar: { x: 0, y: 1 }, sentido: 'sobe' },
  ];

  var AZULEJO = { piso: '#e6ecf6', piso2: '#d2dbea', detalhe: '#9fb4d8' };
  var PAREDE = { parede: '#e2e8f4', parede2: '#a8b8d4', rodape: N.azul, detalhe: N.ciano };
  R.registrarInterior({
    id: 'observatorio-2',
    lugar: 'observatorio',
    nome: 'Centro de Pesquisas Avançadas da NASA',
    pacote: 'interior-observatorio',
    tamanho: { w: 43, h: 15 },
    escadas: escadas,
    comodos: [
      { id: 'hangar', nome: 'Hangar dos Foguetes', placa: 'Hangar dos Foguetes', rect: { x: HAN.x, y: HAN.y, w: 13, h: 13 },
        piso: 'pedra', parede: 'azulejo', paleta: Object.assign({ piso: '#d8dee8', piso2: '#c6cedc', detalhe: '#aeb8ca' }, PAREDE) },
      { id: 'controle', nome: 'Sala de Controle da NASA', placa: 'Sala de Controle da NASA', rect: { x: CTL.x, y: CTL.y, w: 13, h: 13 },
        piso: 'azulejo', parede: 'azulejo', paleta: Object.assign({}, AZULEJO, PAREDE) },
      { id: 'experiencias', nome: 'Laboratório de Experiências', placa: 'Laboratório de Experiências', rect: { x: LAB.x, y: LAB.y, w: 13, h: 13 },
        piso: 'mosaico', parede: 'azulejo', paleta: Object.assign({ piso: '#e8eef8', piso2: '#d6e2f2', detalhe: '#b8c8e8' }, PAREDE) },
    ],
    portas: [
      { x: HAN.x + 13, y: 9, w: 1, h: 2 },   // hangar ↔ controle
      { x: CTL.x + 13, y: 9, w: 1, h: 2 },   // controle ↔ laboratório
    ],
    corredores: [
      { x: CTL.x + 5, y: 9, w: 3, h: 4 },     // da escada que desce até o meio
      { x: CTL.x, y: 9, w: 13, h: 2 },        // porta a porta, no controle
      { x: HAN.x + 8, y: 9, w: 5, h: 2 },     // entrada do hangar
      { x: LAB.x, y: 9, w: 5, h: 2 },         // entrada do laboratório
    ],
    objetos: objetos,
    npcs: [
      npc('nasa-lia', CTL.x + 4, CTL.y + 4, ['foguetes', 'missoes']),
      npc('nasa-davi', HAN.x + 9, HAN.y + 7, ['astronautas']),
      npc('nasa-bia', LAB.x + 7, LAB.y + 7, ['estacao']),
    ],
  });
})();
