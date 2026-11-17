/* Vila Arco-Íris, Casa Mal-Assombrada por dentro (docs/contratos/vila.md §2; os monstros: monstros.md §10):
   'vila-assombrada', 16 × 12 tiles, um cômodo { x: 1, y: 1, w: 14, h: 10 }, parte do Bosque (lugar 'bosque',
   entrada: false, pacote 'interior-bosque'), saída pela escada `portal` (8, 10) com seta de descer (volta para a porta
   da casa na Vila, (5, 17)). O centro é a fileira das 6 jaulas dos monstros das matérias (uma por espécie de
   Reino.Monstros.daMateria, na ordem: 4 no meio do salão e 2 nos lados), cada uma com a ação 'assombrada-monstro'
   (assombrada-acoes.js); atrás delas fica um corredor livre. Do fundo: caldeirão (fala), teias, morcegos, janelas da
   noite e o quadro torto (fala); embaixo, o tapete da lua, o fantasminha amigo (fala), velas e abóboras. O corredor da
   porta até o tapete fica livre. Objetos de assombrada-objetos*.js e da biblioteca; falas de assombrada-falas.js. */
(function () {
  var R = window.Reino;
  var F = ((R.FALAS_INTERIORES || {}).vila || {}).objetos || {};
  var SAIDA = { x: 8, y: 10 };
  // as jaulas, na ordem das espécies (monstros-materias.js): [espécie, x, y]
  var JAULAS = [
    ['assombrada-matematica', 1, 5], ['assombrada-ingles', 4, 5], ['assombrada-portugues', 10, 5],
    ['assombrada-geografia', 13, 5], ['assombrada-ciencias', 1, 8], ['assombrada-historia', 13, 8],
  ];

  // [tipo, x, y, extra?]; `fala: 'chave'` vira a fala do falas (o nome vem junto)
  function objetos(lista) {
    return lista.map(function (o) {
      var r = { tipo: o[0], x: o[1], y: o[2] }, ex = o[3] || {};
      Object.keys(ex).forEach(function (k) { if (k !== 'fala') r[k] = ex[k]; });
      if (ex.fala) r.fala = F[ex.fala] || [];
      return r;
    });
  }
  // o nome no balão é o do monstro (Monstros.especie: só a tabela, sem save)
  var jaulas = JAULAS.map(function (j) {
    var e = R.Monstros && R.Monstros.especie ? R.Monstros.especie(j[0]) : null;
    return ['vila-assombrada-jaula', j[1], j[2], { nome: (e && e.nome) || 'Jaula', acao: { tipo: 'assombrada-monstro', especie: j[0] } }];
  });

  R.registrarInterior({
    id: 'vila-assombrada',
    lugar: 'bosque',
    nome: 'Casa Mal-Assombrada',
    entrada: false,
    pacote: 'interior-bosque',
    tamanho: { w: 16, h: 12 },
    spawn: { x: SAIDA.x, y: SAIDA.y - 1 },
    comodos: [{ id: 'vila-assombrada', nome: 'Casa Mal-Assombrada', placa: 'Casa Mal-Assombrada',
      rect: { x: 1, y: 1, w: 14, h: 10 }, piso: 'tabuas', parede: 'papel',
      paleta: { piso: '#a07a5e', piso2: '#8c6a50', parede: '#5a4280', parede2: '#4a356c', rodape: '#2f2347', detalhe: '#b58cff' } }],
    corredores: [{ x: 7, y: 7, w: 3, h: 3 }],
    escadas: [{ x: SAIDA.x, y: SAIDA.y, para: 'vila', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 } }],
    objetos: objetos([
      // parede: teias nos cantos, arandelas, janelas da noite, morcegos e os quadros tortos (o meio fica para a placa)
      ['vila-assombrada-teia', 1, 1], ['arandela', 2, 1], ['vila-assombrada-janela', 3, 1], ['vila-assombrada-morcegos', 4, 1],
      ['vila-assombrada-quadro', 6, 1, { nome: 'Quadro torto', fala: 'assombrada-quadro' }],
      ['vila-assombrada-quadro', 9, 1, { var: { n: 1 } }], ['vila-assombrada-morcegos', 10, 1],
      ['vila-assombrada-janela', 12, 1], ['arandela', 13, 1], ['vila-assombrada-teia', 14, 1, { var: { lado: 'dir' } }],
      // fundo: baús, livros, abóboras, velas, barris e o caldeirão no meio
      ['bau', 1, 3], ['pilha-livros', 2, 3], ['vila-assombrada-abobora', 3, 3], ['vila-assombrada-velas', 4, 3],
      ['barril', 5, 3, { var: { cor: '#7a5234' } }],
      ['vila-assombrada-caldeirao', 7, 3, { nome: 'Caldeirão', fala: 'assombrada-caldeirao' }],
      ['vila-assombrada-velas', 9, 3], ['caixote', 10, 3, { var: { cor: '#8a6448' } }], ['vila-assombrada-abobora', 11, 3, { var: { rosto: false } }],
      ['pilha-livros', 12, 3], ['barril', 13, 3, { var: { cor: '#6e4428' } }], ['bau', 14, 3],
      // o meio: o tapete da lua entre as jaulas
      ['vila-assombrada-tapete', 6, 5],
    ].concat(jaulas).concat([
      // embaixo: poltrona e livros, o castiçal, o fantasminha, o relógio antigo, cesto, velas e abóboras na porta
      ['vila-assombrada-castical', 3, 8], ['poltrona', 4, 8, { var: { cor: '#7c4ca8' } }], ['pilha-livros', 5, 8],
      ['vila-assombrada-fantasma', 10, 8, { nome: 'Fantasminha', fala: 'assombrada-fantasma' }],
      ['relogio-pe', 12, 8], ['vila-assombrada-velas', 1, 10], ['cesto', 13, 10, { var: { cor: '#8a6448' } }],
      ['barril', 5, 10, { var: { cor: '#7a5234' } }], ['vila-assombrada-abobora', 7, 10], ['vila-capacho', SAIDA.x, SAIDA.y],
      ['vila-assombrada-abobora', 9, 10], ['caixote', 11, 10, { var: { cor: '#6e4428' } }], ['vila-assombrada-velas', 14, 10],
    ])),
  });
})();
