/* Laboratório de Química, parte 3: o layout e o registro do interior (um cômodo de 11×11, 3 cômodos; esqueleto do contrato, a caprichar).
   Já passa no validador ("rico", alcançável, saída e spawn): mexa aos poucos e rode
   node jogo/ferramentas/validar/validar-interiores.js. Formato: docs/contratos/interiores.md §3.
   As falas moram em quimica/falas.js; os objetos próprios em quimica/objetos.js; o de fora em quimica/fora.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES['quimica']) || { npcs: {}, objetos: {} };
  var S = R._predios['quimica'];
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // objeto que se toca: nome e as falas de F.objetos[chave]
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }

  /** NPC do interior com sprite e voz do elenco (Reino.registrarPersonagem, quimica/personagens.js).
      @param {string} id @param {number} x @param {number} y @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  // chão livre perto da entrada para quem chega por `npm run novo -- personagem` sem x/y (do 2º em diante, nesta ordem)
  var VAGAS = [{ x: 18, y: 7 }, { x: 25, y: 9 }, { x: 17, y: 9 }];
  var GUIA = { tipo: 'guia', lugar: 'quimica' };

  /* ================= LAYOUT ================= */
  // 3 cômodos de 13×13 lado a lado (paredes nas fileiras 1-2): Sala do Microscópio (esquerda) | Bancada de
  // Misturas (entrada, no meio) | Cantinho dos Átomos (direita). Portas nas fileiras 9-10; saída embaixo da Bancada.
  // CONTRATO (docs/contratos/quimica.md §5): ids e rects dos cômodos, portas, saída, spawn, a vaga da Doutora
  // Proveta (24, 6) e os 4 objetos que abrem as telas (chaves bancada, caderno, microscopio, tabela).
  var MIC = { x: 1, y: 1 }, BAN = { x: 15, y: 1 }, ATO = { x: 29, y: 1 };
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function tela(chave, nome, t, o) { return inter(chave, nome, Object.assign(o, { acao: { tipo: 'tela', tela: t } })); }
  var objetos = [].concat(
    // BANCADA DE MISTURAS (entrada)
    sala(BAN.x, BAN.y, [
      tela('bancada', 'Bancada de misturas', 'quimica-bancada', { tipo: 'lab-bancada', x: 8, y: 3, w: 3, h: 1 }),
      tela('caderno', 'Caderno de receitas', 'quimica-caderno', { tipo: 'lab-pulpito', x: 2, y: 5 }),
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'arandela', x: 3, y: 0 }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 12, y: 0 },
    ]),
    // SALA DO MICROSCÓPIO
    sala(MIC.x, MIC.y, [
      tela('microscopio', 'Microscópio', 'quimica-microscopio', { tipo: 'lab-microscopio', x: 6, y: 4 }),
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
    ]),
    // CANTINHO DOS ÁTOMOS
    sala(ATO.x, ATO.y, [
      tela('tabela', 'Tabela periódica', 'quimica-tabela', { tipo: 'lab-quadro', x: 5, y: 0 }),
      { tipo: 'janela', x: 1, y: 0 }, { tipo: 'janela', x: 11, y: 0 },
    ])
  );

  // os personagens registrados com predio: 'quimica' (npm run novo -- personagem … --predio quimica), sem editar
  // este layout. O 1º sem x/y toma o lugar e a ação do guia; enquanto não há nenhum, fica o guia de marcador.
  var REG = R.personagensDoPredio ? R.personagensDoPredio('quimica') : [];
  var npcs = REG.map(function (p, i) {
    var v = i === 0 ? { x: 24, y: 6 } : VAGAS[(i - 1) % VAGAS.length];
    return npc(p.id, p.x != null ? p.x : v.x, p.y != null ? p.y : v.y, p.acao || GUIA);
  });
  if (!npcs.length) {
    // guia de marcador: some sozinho com o 1º personagem (docs/receitas/personagem-novo.md). O marcador é montado
    // aqui (não literal) para não sobrar no arquivo depois; enquanto o guia aparece, o validador o acusa
    var M = '(' + 'preencher)';
    npcs.push({ id: 'quimica-guia', nome: M, voz: 'npc-padrao-guia',
      sprite: { base: 'pessoa', pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'rabo', roupa: S.COR, roupa2: '#5a4a8a', cor2: S.COR2, perna: 'saia' },
      x: 24, y: 6, acao: GUIA, falas: { oi: [M + ' quem é você?', M + ' o que tem aqui?'], depois: [M + ' uma fala curtinha.'] } });
  }

  Reino.registrarInterior({
    id: 'quimica',
    lugar: 'quimica',
    nome: 'Laboratório de Química',
    entrada: true,
    pacote: 'interior-quimica',
    tamanho: { w: 43, h: 15 },
    saida: { x: BAN.x + 6, y: 13 },
    spawn: { x: BAN.x + 6, y: 12 },
    comodos: [
      { id: 'bancada', nome: 'Bancada de Misturas', placa: 'Bancada de Misturas', rect: { x: BAN.x, y: BAN.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: S.PAREDE, parede2: '#e9dcff', rodape: S.COR, detalhe: S.COR2 } },
      { id: 'microscopio', nome: 'Sala do Microscópio', placa: 'Sala do Microscópio', rect: { x: MIC.x, y: MIC.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel' },
      { id: 'atomos', nome: 'Cantinho dos Átomos', placa: 'Cantinho dos Átomos', rect: { x: ATO.x, y: ATO.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel' },
    ],
    portas: [
      { x: MIC.x + 13, y: 9, w: 1, h: 2 },   // microscópio ↔ bancada
      { x: BAN.x + 13, y: 9, w: 1, h: 2 },   // bancada ↔ átomos
    ],
    corredores: [
      { x: BAN.x + 5, y: 3, w: 3, h: 11 },   // da saída até o fundo da bancada
      { x: MIC.x + 9, y: 9, w: 19, h: 2 },   // porta a porta
    ],
    objetos: objetos,
    npcs: npcs,
  });
})();
