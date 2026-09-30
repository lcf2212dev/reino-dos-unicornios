/* Laboratório de Química, parte 4: o layout e o registro do interior (3 cômodos de 13×13 num andar só).
   Bancada de Misturas (entrada: a bancada, o canto da segurança e o caderno), Sala do Microscópio (lâminas, lupas,
   cebolas, cristais) e Cantinho dos Átomos (tabela periódica, átomo, água, pufes). Formato: docs/contratos/interiores.md §3.
   As falas moram em quimica/falas.js; os objetos próprios em quimica/objetos.js e objetos-2.js; o de fora em quimica/fora.js.
   Confira com node jogo/ferramentas/validar/validar-interiores.js --so quimica --detalhes. */
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
  // CONTRATO (docs/contratos/quimica.md §5): ids e rects dos cômodos, portas, saída, spawn, a escada (21, 3) que
  // sobe para o 2º andar, a vaga da Doutora Proveta (24, 6) e os 4 objetos que abrem as telas (chaves bancada,
  // caderno, microscopio, tabela).
  var MIC = { x: 1, y: 1 }, BAN = { x: 15, y: 1 }, ATO = { x: 29, y: 1 };
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function tela(chave, nome, t, o) { return inter(chave, nome, Object.assign(o, { acao: { tipo: 'tela', tela: t } })); }
  function poster(x, desenho, chave, nome) {
    var o = { tipo: 'quimica-poster', x: x, y: 0, var: { desenho: desenho } };
    return chave ? inter(chave, nome, o) : o;
  }
  var AMARELO = '#ffd34d', CREME = '#fff8ee';
  var objetos = [].concat(
    /* ---------- BANCADA DE MISTURAS (entrada): a bancada, a segurança e o caderno ---------- */
    sala(BAN.x, BAN.y, [
      // parede: embaixo dos pôsteres e das janelas, só coisa baixa; 5-7 livre para a placa
      poster(2, 'seguranca', 'seguranca', 'Segurança primeiro'),
      inter('formulas', 'Quadro de fórmulas', { tipo: 'quimica-quadro', x: 3, y: 0, var: { desenho: 'formulas' } }),
      { tipo: 'janela', x: 8, y: 0 }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('capela', 'Capela de exaustão', { tipo: 'quimica-capela', x: 0, y: 2 }),
      // (2, 2) e (4, 2) livres: é dali que ela olha o pôster e o quadro
      inter('lixeira', 'Lixeiras de reciclagem', { tipo: 'quimica-lixeira', x: 3, y: 2 }),
      inter('vidrarias', 'Balões e provetas', { tipo: 'quimica-vidrarias', x: 8, y: 2 }), { tipo: 'cesto', x: 10, y: 2 },
      inter('frascos', 'Estante de frascos', { tipo: 'quimica-estante-frascos', x: 11, y: 2 }),
      // o canto da segurança: chuveiro, jalecos, extintor
      inter('chuveiro', 'Chuveiro de segurança', { tipo: 'quimica-chuveiro', x: 0, y: 5 }),
      inter('cabide', 'Jalecos e óculos', { tipo: 'quimica-cabide', x: 4, y: 4 }),
      { tipo: 'tapete-listrado', x: 1, y: 5, w: 3, h: 1, var: { cores: [AMARELO, CREME, AMARELO, CREME] } },
      inter('extintor', 'Extintor', { tipo: 'quimica-extintor', x: 0, y: 7 }),
      { tipo: 'quimica-banqueta', x: 3, y: 7, var: { cor: S.COR2 } },
      // a bancada logo em frente à entrada; a Doutora Proveta fica atrás dela, em (9, 5)
      tela('bancada', 'Bancada de misturas', 'quimica-bancada', { tipo: 'quimica-bancada', x: 8, y: 6 }),
      { tipo: 'tapete', x: 8, y: 7, w: 3, h: 1, var: { cor: '#e9dcff', borda: S.COR } },
      { tipo: 'quimica-banqueta', x: 11, y: 6 }, { tipo: 'planta-alta', x: 12, y: 4 }, { tipo: 'vaso-planta', x: 12, y: 7 },
      // embaixo: o caderno no púlpito, perto da porta, e a pia
      { tipo: 'vaso-planta', x: 0, y: 10 },
      tela('caderno', 'Caderno de receitas', 'quimica-caderno', { tipo: 'quimica-pulpito', x: 4, y: 10 }),
      { tipo: 'banco', x: 1, y: 12 }, { tipo: 'pilha-livros', x: 3, y: 12 },
      { tipo: 'caixote', x: 8, y: 12 },
      inter('pia', 'Pia do laboratório', { tipo: 'quimica-pia', x: 9, y: 11 }),
      { tipo: 'luminaria-pe', x: 12, y: 10 }, { tipo: 'flores', x: 12, y: 11, var: { vaso: S.COR } }, { tipo: 'vaso-grande', x: 12, y: 12 },
    ]),
    /* ---------- SALA DO MICROSCÓPIO: lâminas, lupas, cebolas e cristais ---------- */
    sala(MIC.x, MIC.y, [
      { tipo: 'janela', x: 2, y: 0 }, poster(3, 'cebola', 'poster-cebola', 'Célula de cebola'),
      poster(4, 'neve', 'poster-neve', 'Floco de neve'),
      { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, poster(10, 'cristal'),
      { tipo: 'janela', x: 11, y: 0 }, { tipo: 'arandela', x: 12, y: 0 },
      { tipo: 'estante', x: 0, y: 2 },
      inter('laminas', 'Caixa de lâminas', { tipo: 'quimica-caixa-laminas', x: 2, y: 2 }),
      { tipo: 'papeis', x: 4, y: 2 },
      inter('cristais', 'Vitrine de cristais', { tipo: 'quimica-vitrine-cristais', x: 5, y: 2 }),
      { tipo: 'planta-alta', x: 7, y: 2 }, { tipo: 'cesto', x: 8, y: 2 }, { tipo: 'pilha-livros', x: 9, y: 2 },
      { tipo: 'flores', x: 11, y: 2 },
      inter('lupas', 'Mesa das lupas', { tipo: 'quimica-lupas', x: 1, y: 4 }),
      { tipo: 'poltrona', x: 4, y: 4 },
      { tipo: 'tapete', x: 4, y: 5, w: 3, h: 2, var: { cor: '#ffe0ef', borda: S.COR2 } },
      { tipo: 'mesa-centro', x: 5, y: 5 },
      inter('cebolas', 'Cebolas brotando', { tipo: 'quimica-cebolas', x: 8, y: 4 }),
      { tipo: 'vaso-planta', x: 11, y: 4 },
      // o microscópio perto da porta da Bancada
      tela('microscopio', 'Microscópio', 'quimica-microscopio', { tipo: 'quimica-microscopio', x: 9, y: 6 }),
      { tipo: 'quimica-banqueta', x: 11, y: 7, var: { cor: '#5fb4ff' } }, { tipo: 'luminaria-pe', x: 12, y: 6 },
      { tipo: 'vaso-planta', x: 0, y: 6 }, { tipo: 'quimica-cebolas', x: 2, y: 6, var: { vaso: 'barro' } },
      { tipo: 'quimica-cebolas', x: 1, y: 8 }, { tipo: 'cesto', x: 7, y: 8 },
      { tipo: 'tapete-listrado', x: 3, y: 9, w: 3, h: 1, var: { cores: [S.COR2, CREME, S.COR, CREME] } },
      { tipo: 'lab-bancada', x: 0, y: 11, var: { itens: 'vasos' } }, { tipo: 'banco', x: 3, y: 12 },
      { tipo: 'cavalete', x: 6, y: 10 }, { tipo: 'caixote', x: 8, y: 11 },
      { tipo: 'quimica-cebolas', x: 10, y: 11 }, { tipo: 'vaso-grande', x: 12, y: 12 },
    ]),
    /* ---------- CANTINHO DOS ÁTOMOS: a tabela periódica, o átomo e a água ---------- */
    sala(ATO.x, ATO.y, [
      { tipo: 'janela', x: 0, y: 0 },
      // a tabela gigante perto da porta; embaixo dela só coisa baixa e (2, 2)-(3, 2) livres para chegar
      tela('tabela', 'Tabela periódica', 'quimica-tabela', { tipo: 'quimica-tabela-parede', x: 1, y: 0 }),
      inter('estados', 'Sólido, líquido e gás', { tipo: 'quimica-quadro', x: 8, y: 0, var: { desenho: 'estados' } }),
      { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'flores', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'almofada', x: 4, y: 2, var: { cor: S.COR2 } },
      // cesto de bolinhas-átomo; o var próprio o separa do cesto do Observatório 3 no mesmo tile (o sorteio do
      // conteúdo do cesto é pelo prédio, achado por tipo + x + y + var)
      { tipo: 'cesto', x: 5, y: 2, var: { conteudo: 'bolinhas', cores: [S.COR, S.COR2] } },
      inter('agua', 'Molécula de água', { tipo: 'quimica-agua', x: 7, y: 2 }),
      { tipo: 'caixote', x: 9, y: 2 }, { tipo: 'estante', x: 11, y: 2 }, 
      { tipo: 'mesa', x: 0, y: 5, var: { toalha: '#e9dcff', itens: ['livro', 'xicara'] } },
      inter('atomo', 'Modelo de átomo', { tipo: 'quimica-atomo', x: 6, y: 4 }),
      { tipo: 'planta-alta', x: 11, y: 4 },
      { tipo: 'tapete', x: 3, y: 5, w: 7, h: 3, var: { cor: '#dff4ff', borda: S.COR } },
      { tipo: 'quimica-pufe', x: 4, y: 6 }, { tipo: 'quimica-pufe', x: 6, y: 7, var: { cor: AMARELO } },
      { tipo: 'quimica-pufe', x: 8, y: 6, var: { cor: '#b58cff' } },
      { tipo: 'poltrona', x: 11, y: 6 }, { tipo: 'luminaria-pe', x: 0, y: 7 }, { tipo: 'vaso-planta', x: 12, y: 7 },
      { tipo: 'tapete-listrado', x: 5, y: 9, w: 3, h: 1, var: { cores: [S.COR, CREME, AMARELO, CREME] } },
      { tipo: 'mesa-centro', x: 10, y: 8 },
      { tipo: 'banco', x: 0, y: 11 }, { tipo: 'vaso-grande', x: 3, y: 10 }, { tipo: 'sofa', x: 4, y: 12 },
      { tipo: 'quimica-pufe', x: 7, y: 11, var: { cor: '#6fdc8c' } }, { tipo: 'relogio-pe', x: 9, y: 10 },
      { tipo: 'pilha-livros', x: 11, y: 12 }, { tipo: 'globo', x: 12, y: 10 },
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
    // sobe para o 2º andar (quimica/andar2.js), no fundo da Bancada, no fim do corredor que sai da porta: quem desce
    // de lá chega logo abaixo do arco, (21, 4); quem sobe chega acima do vão de lá, olhando para o salão
    escadas: [{ x: BAN.x + 6, y: 3, para: 'quimica-2', olhar: { x: 0, y: -1 }, sentido: 'sobe' }],
    comodos: [
      { id: 'bancada', nome: 'Bancada de Misturas', placa: 'Bancada de Misturas', rect: { x: BAN.x, y: BAN.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: S.PAREDE, parede2: '#e9dcff', rodape: S.COR, detalhe: S.COR2 } },
      { id: 'microscopio', nome: 'Sala do Microscópio', placa: 'Sala do Microscópio', rect: { x: MIC.x, y: MIC.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: '#f2fff8', parede2: '#cdeee0', rodape: '#3fae8a', detalhe: S.COR2 } },
      { id: 'atomos', nome: 'Cantinho dos Átomos', placa: 'Cantinho dos Átomos', rect: { x: ATO.x, y: ATO.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: '#eef6ff', parede2: '#d6e4ff', rodape: '#5a7ad6', detalhe: '#ffd34d' } },
    ],
    portas: [
      { x: MIC.x + 13, y: 9, w: 1, h: 2 },   // microscópio ↔ bancada
      { x: BAN.x + 13, y: 9, w: 1, h: 2 },   // bancada ↔ átomos
    ],
    corredores: [
      { x: BAN.x + 5, y: 3, w: 3, h: 11 },   // da saída até o fundo da bancada
      { x: MIC.x + 9, y: 9, w: 19, h: 2 },   // porta a porta
      { x: ATO.x, y: 9, w: 4, h: 2 },        // entrada do Cantinho dos Átomos
    ],
    objetos: objetos,
    npcs: npcs,
  });
})();
