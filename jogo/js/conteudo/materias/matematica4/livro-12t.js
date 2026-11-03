/* Cartas do Livro de Atividades, Capítulo 12 "Estatística" (pp. 13 a 18), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra. O gráfico de barras da p. 13 é a
   ilustração ma-t13-grafico (icones-t.js); as tabelas vão como `tabela`; os gráficos em branco das pp. 16 e 18
   (para pintar) são descritos em texto. */
(function () {
  var L = 'atividades', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  function itens(lista) { return lista.map(function (t) { return { texto: t }; }); }
  var TABELAS = 'Tabelas e gráficos';

  Reino.registrarCartas('matematica4', [
    // Tabelas e gráficos (pp. 13 e 14)
    carta('ma-t13', '🎮', 'Estatística – Capítulo 12', 13, [
      { t: 'texto', texto: TABELAS },
      { t: 'quadro', itens: itens(['O gráfico a seguir apresenta a quantidade de pontos que cada jogador ganhou e perdeu em um jogo.']) },
      { t: 'ilustracao', id: 'ma-t13-grafico', alt: 'Gráfico de barras Pontuação no jogo. Otávio: perdidos 12, ganhos 24. Flávia: perdidos 14, ganhos 28. Jaqueline: perdidos 12, ganhos 18. Marcelo: perdidos 10, ganhos 30.' },
    ]),
    carta('ma-t14', '📚', TABELAS, 14, [
      { t: 'quadro', itens: itens([
        'Escreva na tabela as informações apresentadas no gráfico da atividade anterior.',
        'A tabela a seguir mostra o tipo de livro que os alunos do 2º ano mais gostam de ler na biblioteca da escola.',
      ]) },
      { t: 'texto', texto: 'Tipos de livros lidos na biblioteca da escola' },
      { t: 'tabela', cab: ['Tipo de livro', '2º ano A', '2º ano B'], linhas: [
        ['Contos de fadas', '15', '12'],
        ['Histórias de aventura', '10', '15'],
        ['Histórias de animais', '15', '10'],
        ['Histórias engraçadas', '13', '11'],
      ] },
    ]),

    // Tabelas e gráficos / Pesquisas: jogos de tabuleiro (pp. 15 e 16)
    carta('ma-t15', '🎲', TABELAS + ' – Pesquisas', 15, [
      { t: 'fala', quem: 'Professora Raquel', texto: 'Qual é o jogo de tabuleiro preferido de vocês?' },
      { t: 'quadro', itens: itens(['Observe a pergunta que a professora Raquel fez aos alunos do 2º ano. O resultado dessa pesquisa foi organizado na tabela a seguir.']) },
      { t: 'texto', texto: 'Jogos de tabuleiro preferidos' },
      { t: 'tabela', cab: ['Jogo', 'Quantidade de alunos'], linhas: [['Ludo', '12'], ['Xadrez', '16'], ['Damas', '10'], ['Trilha', '18']] },
    ]),
    carta('ma-t16', '🎲', TABELAS + ' – Pesquisas', 16, [
      { t: 'quadro', itens: itens(['Pinte as colunas do gráfico para representar as informações da tabela presente na atividade anterior.']) },
      { t: 'texto', texto: 'O gráfico Jogos de tabuleiro preferidos tem uma coluna para cada jogo: ludo, xadrez, damas e trilha. Cada quadrinho equivale a 2 alunos.' },
    ]),

    // Pesquisas: o parquinho da escola (pp. 17 e 18)
    carta('ma-t17', '🎠', 'Pesquisas – Capítulo 12', 17, [
      { t: 'quadro', itens: itens(['Na escola onde Alice estuda, será construído um parquinho. Leia o que o diretor dessa escola quer descobrir em uma pesquisa.']) },
      { t: 'fala', quem: 'Diretor', texto: 'Preciso descobrir quais brinquedos os alunos gostariam que o parquinho da escola tivesse.' },
      { t: 'texto', texto: 'Brinquedos no parquinho da escola' },
      { t: 'tabela', cab: ['Brinquedo', 'Quantidade de alunos'], linhas: [['Escorregador', '50'], ['Balanço', '45'], ['Gangorra', '30'], ['Gira-gira', '45']] },
    ]),
    carta('ma-t18', '🎠', 'Pesquisas', 18, [
      { t: 'quadro', itens: itens(['Pinte as barras do gráfico para representar as informações da tabela.']) },
      { t: 'texto', texto: 'O gráfico Brinquedos no parquinho da escola tem uma barra para cada brinquedo: escorregador, balanço, gangorra e gira-gira. Cada quadrinho equivale a 5 alunos.' },
    ]),
  ]);
})();
