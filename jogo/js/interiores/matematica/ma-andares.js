/* Torre dos Números da Matemática do Dia a Dia (4º bimestre), os andares de cima: um por capítulo, na ordem do livro,
   cada um com as duas galerias do Livro de Aprendizagem e o ateliê do Livro de Atividades (matematica/matematica.js,
   andarDoCapitulo). Coordenadas do cômodo (0..10; fileiras 0 e 1 são a parede). As estações vêm de salas.js, na
   fileira 3 (colunas 1, 3, 5, 7 e 9; no ateliê, até a 7): aqui a fileira 2 em cima delas fica livre, a 4 é a passagem
   e as 6–7 a faixa das portas. Na 1ª galeria, o vão de descer em (1,9) e a chegada em (2,8–9); no ateliê dos andares
   1 e 2, o arco de subir em (9,2) (coluna 9 da parede sem enfeite) e a chegada em (8,2–3). Os anfitriões ficam em
   (5,9), sem móvel alto embaixo. Usa de Reino._predios.matematica: andarDoCapitulo, inter, paleta e CORES. */
(function () {
  var R = window.Reino;
  var S = R._predios.matematica;
  // sem a matéria do 4º bimestre o matematica.js não monta a torre (fixture histórica dos testes: interior padrão)
  if (!S || !S.andarDoCapitulo) return;
  var andarDoCapitulo = S.andarDoCapitulo, inter = S.inter, paleta = S.paleta, CO = S.CORES, ANIL = S.ANIL;

  // o canto de baixo da 1ª galeria (o vão em (1,9) e a chegada livres) e o do ateliê, com o anfitrião em (5,9)
  function cantoDoVao(itemCaixote) {
    return [
      { tipo: 'vaso-planta', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'bau', x: 0, y: 10 },
      { tipo: 'caixote', x: 1, y: 10, var: { item: itemCaixote } }, { tipo: 'papeis', x: 2, y: 10 },
      { tipo: 'lp-pufe', x: 3, y: 8 }, { tipo: 'tapete-redondo', x: 4, y: 8 },
    ];
  }
  function cantoDoAtelie(cor, itens) {
    return [
      { tipo: 'cavalete', x: 1, y: 5 }, { tipo: 'escola-carteira', x: 2, y: 5 }, { tipo: 'cadeira', x: 3, y: 5, var: { almofada: cor } },
      { tipo: 'lp-mesa-atividades', x: 7, y: 5 }, { tipo: 'cadeira', x: 9, y: 5, var: { almofada: cor } }, { tipo: 'vaso-planta', x: 10, y: 5 },
      { tipo: 'estante', x: 0, y: 8 }, { tipo: 'bau', x: 0, y: 10 }, { tipo: 'cesto', x: 1, y: 10 }, { tipo: 'escola-mochila', x: 2, y: 10 },
      { tipo: 'luminaria-pe', x: 3, y: 8 }, { tipo: 'matematica-blocos', x: 3, y: 10 },
      { tipo: 'tapete-redondo', x: 4, y: 8, var: { cor: cor } },
      { tipo: 'mesa', x: 7, y: 8, var: { toalha: '#fff8ee', itens: itens } }, { tipo: 'cadeira', x: 9, y: 8, var: { almofada: cor } },
      { tipo: 'planta-alta', x: 10, y: 8 }, { tipo: 'escrivaninha', x: 7, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
    ];
  }
  // a parede do ateliê: a coluna 9 fica sem enfeite onde há o arco de subir (andares 1 e 2)
  function paredeDoAtelie(meio, temArco) {
    return [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'lousa', x: 1, y: 0 }, { tipo: 'arandela', x: 3, y: 0 },
      Object.assign({ x: 4, y: 0 }, meio), { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'estandarte', x: 7, y: 0, var: { cor: ANIL, emblema: 'estrela' } },
      { tipo: 'cortina', x: 8, y: 0, var: { cor: CO.laranja } }, { tipo: 'janela', x: 10, y: 0 },
    ].concat(temArco ? [] : [{ tipo: 'arandela', x: 9, y: 0 }]);
  }
  function atelie(cap, nome) {
    return { nome: 'Ateliê do Capítulo ' + cap, placa: 'Ateliê do Cap. ' + cap + ' • ' + nome };
  }

  /* ---------- ANDAR 1: capítulo 10, sistema monetário (moedas, notas e o mercadinho) ---------- */
  var DINHEIRO = paleta('#fff3d6', '#f0d9a8', '#fffaf0', '#ffe7a6', CO.amarelo);
  andarDoCapitulo(1, {
    cap: 10, nome: 'Sistema Monetário',
    comodos: [
      Object.assign({ nome: 'Sistema Monetário', placa: 'Cap. 10 • Sistema Monetário', piso: 'taco', parede: 'papel', paleta: DINHEIRO }),
      { nome: 'O Mercadinho', placa: 'Cap. 10 • O Mercadinho', piso: 'tabuas', parede: 'madeira', paleta: paleta('#fbefd8', '#ead2a6', '#fff6e4', '#ffd9a0', CO.vermelho) },
      Object.assign(atelie(10, 'Dinheiro'), { piso: 'carpete', parede: 'papel', paleta: paleta('#fff4e0', '#f2dcb4', '#fffaf0', '#ffe2b0', CO.laranja, true) }),
    ],
    objetos: [
      [   // 1ª galeria: as notas e as moedas
        { tipo: 'janela', x: 0, y: 0 }, inter('ma-cedulas', 'Cartaz das notas', { tipo: 'ma-cedulas', x: 1, y: 0 }),
        { tipo: 'arandela', x: 3, y: 0 }, { tipo: 'estandarte', x: 4, y: 0, var: { cor: ANIL, emblema: 'estrela' } },
        { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'estandarte', x: 6, y: 0, var: { cor: CO.amarelo, emblema: 'coracao' } },
        { tipo: 'prateleira-parede', x: 7, y: 0 }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'museu-moedas', x: 0, y: 2 }, { tipo: 'flores', x: 4, y: 2 }, { tipo: 'pilha-livros', x: 10, y: 2 },
        { tipo: 'caixote', x: 0, y: 3, var: { item: 'moedas' } }, { tipo: 'cesto', x: 10, y: 3 },
        { tipo: 'luminaria-pe', x: 0, y: 5 }, inter('ma-cofrinho', 'Cofrinho', { tipo: 'bau-porquinho', x: 2, y: 5 }),
        { tipo: 'poltrona', x: 8, y: 5, var: { cor: CO.amarelo } }, { tipo: 'matematica-dados', x: 9, y: 5 },
      ].concat(cantoDoVao('moedas'), [
        { tipo: 'ma-caixa-registradora', x: 6, y: 10 },
        { tipo: 'mesa', x: 7, y: 8, var: { toalha: '#fff1c2', itens: ['moedas', 'bolo'] } }, { tipo: 'cadeira', x: 9, y: 8, var: { almofada: CO.amarelo } },
        { tipo: 'luminaria-pe', x: 10, y: 8 }, { tipo: 'sofa', x: 7, y: 10, var: { cor: '#ffc61a' } }, { tipo: 'vaso-grande', x: 10, y: 10 },
      ]),
      [   // 2ª galeria: o mercadinho (preços, caixa e vitrine)
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'estandarte', x: 1, y: 0, var: { cor: CO.vermelho, emblema: 'coracao' } },
        { tipo: 'arandela', x: 2, y: 0 }, { tipo: 'prateleira-parede', x: 3, y: 0 }, { tipo: 'bandeirinhas', x: 5, y: 0 },
        { tipo: 'arandela', x: 7, y: 0 }, { tipo: 'cortina', x: 8, y: 0, var: { cor: CO.vermelho } },
        { tipo: 'estandarte', x: 9, y: 0, var: { cor: ANIL, emblema: 'estrela' } }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'portugues-cesta-frutas', x: 0, y: 2 }, { tipo: 'museu-moedas', x: 6, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'lp-potes', x: 0, y: 3 }, { tipo: 'caixote', x: 10, y: 3, var: { item: 'moedas' } },
        inter('ma-banca', 'Banca de frutas', { tipo: 'ma-banca', x: 1, y: 5 }),
        inter('ma-caixa', 'Caixa registradora', { tipo: 'ma-caixa-registradora', x: 7, y: 5 }), { tipo: 'cadeira', x: 8, y: 5, var: { almofada: CO.vermelho } },
        { tipo: 'estante', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 0, y: 10 }, { tipo: 'portugues-cesta-frutas', x: 1, y: 10 },
        { tipo: 'caixote', x: 2, y: 10, var: { item: 'moedas' } }, { tipo: 'vaso-planta', x: 3, y: 8 },
        { tipo: 'tapete', x: 4, y: 9, var: { cor: '#ffe2b0', borda: CO.vermelho } },
        { tipo: 'vitrine', x: 7, y: 8, var: { itens: ['moedas', 'gema', 'medalha'] } }, { tipo: 'luminaria-pe', x: 10, y: 8 },
        { tipo: 'poltrona', x: 7, y: 10, var: { cor: CO.vermelho } }, { tipo: 'mesa-centro', x: 8, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
      ],
      paredeDoAtelie({ tipo: 'matematica-numeros', var: { texto: '10' } }, true).concat([   // ateliê: a lista de compras
        { tipo: 'lp-potes', x: 0, y: 2 }, { tipo: 'flores', x: 4, y: 2 }, { tipo: 'papeis', x: 10, y: 2 }, { tipo: 'caixote', x: 0, y: 3, var: { item: 'moedas' } }, { tipo: 'bau-porquinho', x: 10, y: 3 },
      ], cantoDoAtelie(CO.laranja, ['livro', 'moedas'])),
    ],
    npcs: [['mat-otavio', 0, 5, 9], ['mat-cecilia', 2, 5, 9]],
  });

  /* ---------- ANDAR 2: capítulo 11, divisão em partes iguais (pizza, bolo e pratos repartidos) ---------- */
  andarDoCapitulo(2, {
    cap: 11, nome: 'Partes Iguais',
    comodos: [
      { nome: 'Partes Iguais', placa: 'Cap. 11 • Partes Iguais', piso: 'azulejo', parede: 'papel', paleta: paleta('#fff0f4', '#f6d0dc', '#fff8fa', '#ffd0e2', CO.rosa) },
      { nome: 'A Confeitaria', placa: 'Cap. 11 • A Confeitaria', piso: 'taco', parede: 'azulejo', paleta: paleta('#fdeef2', '#efcfd8', '#fff6f8', '#ffc2d8', CO.laranja) },
      Object.assign(atelie(11, 'Partes Iguais'), { piso: 'carpete', parede: 'papel', paleta: paleta('#f4ecff', '#e0d0f6', '#fbf6ff', '#e6d4ff', '#b58cff', true) }),
    ],
    objetos: [
      [   // 1ª galeria: repartir em partes iguais
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'ma-cartaz-partes', x: 1, y: 0 }, { tipo: 'arandela', x: 2, y: 0 },
        { tipo: 'prateleira-parede', x: 3, y: 0 }, { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'bandeirinhas', x: 6, y: 0 },
        { tipo: 'estandarte', x: 8, y: 0, var: { cor: CO.rosa, emblema: 'coracao' } }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'matematica-caixa-ovos', x: 0, y: 2 }, { tipo: 'portugues-cesta-frutas', x: 4, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'lp-potes', x: 0, y: 3 }, { tipo: 'cesto', x: 10, y: 3 },
        { tipo: 'luminaria-pe', x: 0, y: 5 }, inter('ma-potes', 'Potes iguais', { tipo: 'matematica-potes', x: 2, y: 5 }),
        { tipo: 'cadeira', x: 7, y: 5, var: { almofada: CO.rosa } }, inter('ma-pizza', 'Pizza', { tipo: 'ma-pizza', x: 8, y: 5 }),
        { tipo: 'cadeira', x: 9, y: 5, var: { almofada: CO.rosa } },
      ].concat(cantoDoVao('bolo'), [
        { tipo: 'matematica-balanca', x: 3, y: 10 }, { tipo: 'portugues-caneca-bolo', x: 6, y: 10 },
        inter('ma-pratos', 'Pratos repartidos', { tipo: 'ma-pratos', x: 7, y: 8 }), { tipo: 'cadeira', x: 9, y: 8, var: { almofada: CO.rosa } },
        { tipo: 'luminaria-pe', x: 10, y: 8 }, { tipo: 'sofa', x: 7, y: 10, var: { cor: CO.rosa } }, { tipo: 'vaso-grande', x: 10, y: 10 },
      ]),
      [   // 2ª galeria: a confeitaria (bolos, pizza e pratos com o mesmo tanto)
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cortina', x: 1, y: 0, var: { cor: CO.rosa } }, { tipo: 'arandela', x: 2, y: 0 },
        { tipo: 'prateleira-parede', x: 3, y: 0 }, { tipo: 'quadro', x: 5, y: 0 },
        { tipo: 'estandarte', x: 6, y: 0, var: { cor: ANIL, emblema: 'estrela' } }, { tipo: 'bandeirinhas', x: 7, y: 0 },
        { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'portugues-cesta-frutas', x: 0, y: 2 }, { tipo: 'matematica-caixa-ovos', x: 6, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
        { tipo: 'lp-potes', x: 0, y: 3 }, { tipo: 'caixote', x: 10, y: 3, var: { item: 'bolo' } },
        { tipo: 'mesa', x: 1, y: 5, var: { toalha: '#ffd0e2', itens: ['bolo', 'bolo'] } }, { tipo: 'cadeira', x: 3, y: 5, var: { almofada: CO.laranja } },
        { tipo: 'ma-pizza', x: 7, y: 5 }, { tipo: 'cadeira', x: 8, y: 5, var: { almofada: CO.laranja } },
        { tipo: 'vitrine', x: 0, y: 8, var: { itens: ['bolo', 'xicara', 'bolo'] } }, { tipo: 'pilha-livros', x: 0, y: 10 },
        { tipo: 'cesto', x: 1, y: 10 }, { tipo: 'portugues-caneca-bolo', x: 2, y: 10 }, { tipo: 'vaso-planta', x: 3, y: 8 },
        { tipo: 'tapete', x: 4, y: 9, var: { cor: '#ffd0e2', borda: CO.laranja } },
        { tipo: 'ma-pratos', x: 7, y: 8, var: { cada: 3 } }, { tipo: 'cadeira', x: 9, y: 8, var: { almofada: CO.laranja } },
        { tipo: 'luminaria-pe', x: 10, y: 8 }, { tipo: 'poltrona', x: 7, y: 10, var: { cor: CO.laranja } }, { tipo: 'mesa-centro', x: 8, y: 10 },
        { tipo: 'vaso-grande', x: 10, y: 10 },
      ],
      paredeDoAtelie({ tipo: 'bandeirinhas' }, true).concat([   // ateliê: a festa repartida
        { tipo: 'matematica-caixa-ovos', x: 0, y: 2 }, { tipo: 'flores', x: 4, y: 2 }, { tipo: 'papeis', x: 10, y: 2 },
        { tipo: 'lp-potes', x: 0, y: 3 }, { tipo: 'caixote', x: 10, y: 3, var: { item: 'ursinho' } },
      ], cantoDoAtelie('#b58cff', ['bolo', 'xicara'])),
    ],
    npcs: [['mat-lara', 0, 5, 9], ['mat-zuzu', 2, 5, 9]],
  });

  /* ---------- ANDAR 3: capítulo 12, estatística (pesquisas, tabelas, gráficos e o plantio de árvores) ---------- */
  andarDoCapitulo(3, {
    cap: 12, nome: 'Estatística',
    comodos: [
      { nome: 'Estatística', placa: 'Cap. 12 • Estatística', piso: 'pedra', parede: 'papel', paleta: paleta('#eaf6ec', '#cbe6d0', '#f4fbf4', '#c8ecd0', CO.verde) },
      { nome: 'O Jardim da Pesquisa', placa: 'Cap. 12 • O Jardim', piso: 'tabuas', parede: 'madeira', paleta: paleta('#eef6e6', '#d2e6c0', '#f6fbf0', '#d4eebc', CO.verde) },
      Object.assign(atelie(12, 'Estatística'), { piso: 'tabuas', parede: 'papel', paleta: paleta('#eef4ff', '#cfdcf5', '#f6f9ff', '#cfe0ff', CO.azul, true) }),
    ],
    objetos: [
      [   // 1ª galeria: tabela, gráfico e pictograma
        { tipo: 'janela', x: 0, y: 0 }, inter('ma-tabela', 'Tabela da pesquisa', { tipo: 'ma-tabela', x: 1, y: 0 }),
        { tipo: 'arandela', x: 3, y: 0 }, inter('ma-grafico', 'Gráfico de barras', { tipo: 'matematica-grafico', x: 4, y: 0, var: { barras: [2, 4, 3, 5] } }),
        { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'ma-pictograma', x: 7, y: 0 },
        { tipo: 'estandarte', x: 9, y: 0, var: { cor: CO.verde, emblema: 'estrela' } }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'matematica-urna', x: 0, y: 2 }, { tipo: 'flores', x: 4, y: 2 }, { tipo: 'pilha-livros', x: 10, y: 2 },
        { tipo: 'caixote', x: 0, y: 3, var: { item: 'estrela' } }, { tipo: 'cesto', x: 10, y: 3 },
        { tipo: 'luminaria-pe', x: 0, y: 5 }, inter('ma-prancheta', 'Prancheta da pesquisa', { tipo: 'ma-prancheta', x: 2, y: 5 }),
        { tipo: 'cadeira', x: 3, y: 5, var: { almofada: CO.verde } }, { tipo: 'matematica-dados', x: 7, y: 5 },
        { tipo: 'matematica-roleta', x: 8, y: 5 },
      ].concat(cantoDoVao('planta'), [
        { tipo: 'matematica-blocos', x: 3, y: 10 }, { tipo: 'globo', x: 6, y: 10 },
        { tipo: 'escrivaninha', x: 7, y: 8 }, { tipo: 'cadeira', x: 9, y: 8, var: { almofada: CO.verde } },
        { tipo: 'luminaria-pe', x: 10, y: 8 }, { tipo: 'sofa', x: 7, y: 10, var: { cor: CO.verde } }, { tipo: 'vaso-grande', x: 10, y: 10 },
      ]),
      [   // 2ª galeria: o jardim do projeto de plantar árvores (as mudas contadas)
        { tipo: 'janela', x: 0, y: 0 }, { tipo: 'ma-pictograma', x: 1, y: 0, var: { colunas: [4, 2, 3] } }, { tipo: 'arandela', x: 3, y: 0 },
        { tipo: 'quadro', x: 4, y: 0, var: { cena: 'paisagem' } }, { tipo: 'janela', x: 5, y: 0 },
        { tipo: 'estandarte', x: 6, y: 0, var: { cor: CO.verde, emblema: 'coracao' } }, { tipo: 'ma-tabela', x: 7, y: 0, var: { conta: [4, 2, 5] } },
        { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
        { tipo: 'flores', x: 0, y: 2 }, { tipo: 'portugues-regador', x: 6, y: 2 }, { tipo: 'cesto', x: 10, y: 2 },
        { tipo: 'caixote', x: 0, y: 3, var: { item: 'planta' } }, { tipo: 'matematica-urna', x: 10, y: 3 },
        inter('ma-muda', 'Muda de árvore', { tipo: 'ma-muda', x: 1, y: 5 }), { tipo: 'ma-muda', x: 2, y: 5 }, { tipo: 'ma-muda', x: 3, y: 5 },
        { tipo: 'feira-jardineira', x: 7, y: 5 }, { tipo: 'ma-muda', x: 9, y: 5 },
        { tipo: 'planta-alta', x: 0, y: 8 }, { tipo: 'ma-muda', x: 1, y: 8 }, { tipo: 'vaso-planta', x: 0, y: 10 },
        { tipo: 'portugues-regador', x: 1, y: 10 }, { tipo: 'ma-muda', x: 2, y: 10 }, { tipo: 'lp-pe-feijao', x: 3, y: 8 },
        { tipo: 'tapete', x: 4, y: 9, var: { cor: '#d4eebc', borda: CO.verde } },
        { tipo: 'mesa', x: 7, y: 8, var: { toalha: '#e6f6dc', itens: ['planta', 'xicara'] } }, { tipo: 'cadeira', x: 9, y: 8, var: { almofada: CO.verde } },
        { tipo: 'luminaria-pe', x: 10, y: 8 }, { tipo: 'banco', x: 7, y: 10 }, { tipo: 'flores', x: 9, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
      ],
      paredeDoAtelie({ tipo: 'matematica-grafico', var: { barras: [3, 1, 4, 2] } }, false).concat([   // ateliê: a pesquisa da turma
        { tipo: 'matematica-urna', x: 0, y: 2 }, { tipo: 'flores', x: 4, y: 2 }, { tipo: 'pilha-livros', x: 8, y: 2 },
        { tipo: 'papeis', x: 10, y: 2 }, { tipo: 'caixote', x: 0, y: 3, var: { item: 'estrela' } }, { tipo: 'matematica-dados', x: 10, y: 3 },
      ], cantoDoAtelie(CO.azul, ['estrela', 'livro'])),
    ],
    npcs: [['mat-tadeu', 0, 5, 9], ['mat-tito', 2, 5, 9]],
  });
})();
