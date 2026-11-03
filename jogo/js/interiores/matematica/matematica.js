/* Torre dos Números: a torre inteira é da Matemática do Dia a Dia do 4º bimestre (docs/contratos/quarto-bimestre.md
   §7), a partir do térreo: o saguão (a Professora Isa, os dois livros, o quadro dos andares e o bebedouro) e um andar
   por capítulo, na ordem do livro (10 o dinheiro, 11 as partes iguais, 12 a estatística). Entra-se pela porta do
   mapa; sai-se pelo tapete do saguão.
   Cada andar (37×13) tem três cômodos em fila, na ordem do livro: as duas galerias do Livro de Aprendizagem e o ateliê
   do Livro de Atividades, com portas largas entre eles. Chega-se de baixo pelo vão no canto da 1ª galeria (onde
   está o anfitrião do capítulo) e sobe-se pelo arco no fundo do ateliê; as estações das salas vêm de
   matematica/salas.js (geradas dos dados), os andares de matematica/ma-andares.js, os objetos de
   matematica/ma-objetos*.js e objetos-*.js, as falas de matematica/falas.js.
   O 3º bimestre usava o interior padrão (interiores/padrao.js) com a planta de
   arquivo/terceiro-bimestre/jogo/js/interiores/matematica/salas.js. */
(function () {
  var R = window.Reino;
  var S = R._predios.matematica;
  // sem a matéria do 4º bimestre o salas.js não gera estações: a torre fica com o interior padrão (fixture histórica)
  if (!S || !S.estacoes) return;
  var MAT = S.MAT;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.matematica) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var CO = S.CORES, LIVROS = S.LIVROS, ANIL = S.ANIL;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (0..10; fileiras 0 e 1 são a parede), com o canto do cômodo em (ox, oy)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC da torre com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };
  // + os registrados com predio: o id do andar e x/y do interior (Reino.personagensDoPredio; sem x/y, o validador acusa)
  function registrados(id) {
    return R.personagensDoPredio(id).filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || GUIA);
    });
  }

  /* ================= OS ANDARES ================= */
  // térreo 13×13 (um cômodo em (1,1)); andares 37×13 (três cômodos em (1,1), (13,1) e (25,1)).
  // Escadas: o arco do térreo em (10,3) sobe para o vão do 1º andar em (2,10); o arco do ateliê em (34,3) sobe para o
  // vão do andar de cima. Quem sobe chega à direita do vão, (3,10); quem desce, à esquerda do arco
  var ANDARES = ['matematica', 'matematica-1', 'matematica-2', 'matematica-3'];
  var ARCO_TERREO = { x: 10, y: 3 }, ARCO = { x: 34, y: 3 }, VAO = { x: 2, y: 10 };
  function escadas(i) {
    var e = [], arco = i === 0 ? ARCO_TERREO : ARCO;
    if (i < ANDARES.length - 1) e.push({ x: arco.x, y: arco.y, para: ANDARES[i + 1], chegar: { x: -1, y: 0 }, olhar: { x: 1, y: 0 }, sentido: 'sobe' });
    if (i > 0) e.push({ x: VAO.x, y: VAO.y, para: ANDARES[i - 1], chegar: { x: 1, y: 0 }, olhar: { x: 0, y: 1 }, sentido: 'desce' });
    return e;
  }
  function registrar(i, def) {
    Reino.registrarInterior(Object.assign({
      id: ANDARES[i],
      lugar: 'materia:matematica',
      pacote: 'interior-matematica',
      escadas: escadas(i),
    }, def));
  }
  var OX = [1, 13, 25];   // o canto de cada cômodo do andar: 1ª galeria, 2ª galeria e ateliê
  // paleta de cômodo: piso claro (contraste com o contorno da Mariana); rodapé verde nas galerias (Livro de
  // Aprendizagem) e dourado no ateliê (Livro de Atividades)
  function paleta(piso, piso2, parede, parede2, detalhe, ateli) {
    return { piso: piso, piso2: piso2, parede: parede, parede2: parede2, rodape: ateli ? LIVROS.atividades.capa2 : LIVROS.aprendizagem.capa2, detalhe: detalhe };
  }
  /** um andar de capítulo. t = { cap, nome, comodos: [3 × { nome, placa, piso, parede, paleta }],
      objetos: [3 listas em coordenadas do cômodo], npcs: [[id, cômodo 0..2, x, y]] } */
  function andarDoCapitulo(i, t) {
    var cap = t.cap, ids = ['ma-galeria' + cap + '-1', 'ma-galeria' + cap + '-2', 'ma-atelie' + cap];
    var comodosEst = ['galeria1', 'galeria2', 'atelie'];
    var objetos = [], corredores = [{ x: 1, y: 7, w: 35, h: 2 }, { x: VAO.x + 1, y: VAO.y - 1, w: 1, h: 2 }];
    t.objetos.forEach(function (lista, k) {
      objetos = objetos.concat(sala(OX[k], 1, lista), S.estacoes(cap, comodosEst[k], OX[k], 1));
      // a passagem em frente das estações e a ligação dela com a faixa das portas
      corredores.push({ x: OX[k], y: 5, w: 11, h: 1 }, { x: OX[k] + 4, y: 6, w: 3, h: 1 });
    });
    if (i < ANDARES.length - 1) corredores.push({ x: ARCO.x - 1, y: ARCO.y, w: 1, h: 2 });   // do arco até a passagem
    registrar(i, {
      nome: t.nome,
      tamanho: { w: 37, h: 13 },
      // o spawn é a chegada pelo vão (onde o irPara sem chegada e as fotos do e2e a põem)
      spawn: { x: VAO.x + 1, y: VAO.y },
      comodos: t.comodos.map(function (c, k) { return Object.assign({ id: ids[k], rect: { x: OX[k], y: 1, w: 11, h: 11 } }, c); }),
      portas: [{ x: 12, y: 6, w: 1, h: 3 }, { x: 24, y: 6, w: 1, h: 3 }],
      corredores: corredores,
      objetos: objetos,
      npcs: t.npcs.map(function (n) { return npc(n[0], OX[n[1]] + n[2], 1 + n[3], GUIA); }).concat(registrados(ANDARES[i])),
    });
  }
  S.andarDoCapitulo = andarDoCapitulo; S.inter = inter; S.paleta = paleta;

  /* ---------- TÉRREO: o saguão (números e formas, os dois livros e o quadro dos andares) ---------- */
  // livre: o corredor do meio (colunas 4–6), o (7..8, 2) até o arco (9, 2) e o (3, 5) da Professora Isa
  registrar(0, {
    nome: 'Torre dos Números',
    entrada: true,
    tamanho: { w: 13, h: 13 },
    saida: { x: 6, y: 11 },
    spawn: { x: 6, y: 10 },
    comodos: [{ id: 'ma-saguao', nome: 'Saguão', placa: 'Térreo • Matemática', piso: 'mosaico', parede: 'papel',
      paleta: paleta('#eeeaff', '#d6cff7', '#f6f4ff', '#ffe7a6', CO.amarelo), rect: { x: 1, y: 1, w: 11, h: 11 } }],
    corredores: [{ x: 5, y: 3, w: 3, h: 9 }, { x: 8, y: 3, w: 2, h: 1 }],
    objetos: sala(1, 1, [
      { tipo: 'janela', x: 0, y: 0 },
      inter('ma-andares', 'Mapa da torre', { tipo: 'ma-andares', x: 1, y: 0 }),
      { tipo: 'estandarte', x: 3, y: 0, var: { cor: ANIL, emblema: 'estrela' } }, { tipo: 'arandela', x: 4, y: 0 },
      { tipo: 'matematica-numeros', x: 5, y: 0, var: { texto: '123' } }, { tipo: 'arandela', x: 7, y: 0 },
      { tipo: 'matematica-formas', x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      // à esquerda: os dois livros e a guia no tapete
      { tipo: 'matematica-blocos', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'flores', x: 3, y: 2 },
      inter('ma-livro-aprendizagem', 'Livro de Aprendizagem', { tipo: 'lp-pulpito', x: 0, y: 4, var: { livro: 'aprendizagem' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'aprendizagem' } }),
      inter('ma-livro-atividades', 'Livro de Atividades', { tipo: 'lp-pulpito', x: 2, y: 4, var: { livro: 'atividades' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'atividades' } }),
      { tipo: 'tapete-redondo', x: 1, y: 5, var: { cor: '#d6cff7' } },
      { tipo: 'museu-moedas', x: 0, y: 6 }, { tipo: 'matematica-dados', x: 3, y: 7 },
      inter('ma-bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 0, y: 8 }),
      { tipo: 'tapete-listrado', x: 1, y: 9, w: 3, h: 1, var: { cores: [ANIL, '#fff8ee', CO.amarelo, '#fff8ee'] } },
      { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'moedas' } }, { tipo: 'cesto', x: 2, y: 10 },
      { tipo: 'bau-porquinho', x: 3, y: 10 },
      // à direita: o ábaco, o relógio, o tapete de números e a mesinha
      { tipo: 'flores', x: 10, y: 2 },
      inter('ma-abaco', 'Ábaco', { tipo: 'matematica-abaco', x: 8, y: 4 }), { tipo: 'relogio-pe', x: 10, y: 4 },
      { tipo: 'matematica-tapete-numeros', x: 7, y: 6, var: { texto: '1234' } }, { tipo: 'globo', x: 10, y: 6 },
      { tipo: 'cadeira', x: 7, y: 9, var: { almofada: CO.amarelo } },
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#e6e2ff', itens: ['moedas', 'xicara'] } }, { tipo: 'vaso-planta', x: 10, y: 9 },
      { tipo: 'matematica-blocos', x: 7, y: 10 }, { tipo: 'caixote', x: 8, y: 10, var: { item: 'estrela' } }, { tipo: 'cesto', x: 9, y: 10 },
      { tipo: 'vaso-grande', x: 10, y: 10 },
    ]),
    npcs: [npc('mat-isa', 4, 6, GUIA)].concat(registrados(ANDARES[0])),
  });
})();
