/* Sala ma12a6 (Livro de Aprendizagem, capítulo 12, pp. 70 e 71): Organizando o conhecimento, questão 1, os gastos na
   cantina da escola (questionário e gráfico de barras) (docs/contratos/quarto-bimestre.md §3). Na tabela do item b)
   o título é a primeira linha. O item f) é a mesma pesquisa feita com a turma: leitura na carta ma-a71. */
(function () {
  var CANTINA = { titulo: 'Gastos na cantina da escola', partes: [{ lista: [
    'Menos de R$ 10,00: 20 alunos', 'De R$ 10,00 a R$ 15,00: 16 alunos',
    'Mais de R$ 15,00: 6 alunos', 'Não comprei na cantina: 10 alunos'] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma12a6', nome: 'Gastos na cantina', emoji: '🪙',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 70 a 71', ordem: 'livro',
      cartas: ['ma-a70', 'ma-a71'],
      intro: 'Quantos reais a turma gastou na cantina? O gráfico de barras vai contar para você!',
      desafios: [
        { id: 'ma12a6-01', tipo: 'escolha', origem: 'APR-70-q1a', pagina: 70, livro: 'ma-a70',
          pergunta: 'a) Qual é o tema dessa pesquisa?',
          opcoes: [
            { t: 'Gastos na cantina da escola.' },
            { t: 'Idade dos alunos.' },
            { t: 'Brincadeiras preferidas.' },
            { t: 'Lanche favorito.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'A pergunta do questionário é: Quantos reais você gastou na cantina da escola hoje?' },
        { id: 'ma12a6-02', tipo: 'tabela', origem: 'APR-71-q1b', pagina: 71, livro: 'ma-a71', avulsa: { carta: 'ma-a70' }, apoio: CANTINA,
          pergunta: 'b) Complete a tabela com as informações do gráfico.',
          linhas: [
            ['Título:', { certas: ['Gastos na cantina da escola', 'Gastos na cantina'] }],
            ['Quantia gasta', 'Quantidade de alunos'],
            ['Menos de R$ 10,00', { certas: ['20', 'vinte'] }],
            ['De R$ 10,00 a R$ 15,00', { certas: ['16', 'dezesseis'] }],
            ['Mais de R$ 15,00', { certas: ['6', 'seis'] }],
            ['Não comprei na cantina', { certas: ['10', 'dez'] }],
          ],
          explica: 'O título da tabela é o mesmo do gráfico: Gastos na cantina da escola. Depois, cada quantia com a sua quantidade de alunos.' },
        { id: 'ma12a6-03', tipo: 'digitar', origem: 'APR-71-q1c', pagina: 71, livro: 'ma-a71', avulsa: { carta: 'ma-a70' }, apoio: CANTINA,
          pergunta: 'c) Quantos alunos gastaram menos de R$ 10,00?',
          frases: [{ antes: '', depois: 'alunos.', certas: ['20', 'vinte'] }],
          explica: 'A barra de menos de R$ 10,00 chega no 20.' },
        { id: 'ma12a6-04', tipo: 'digitar', origem: 'APR-71-q1d', pagina: 71, livro: 'ma-a71', avulsa: { carta: 'ma-a70' }, apoio: CANTINA,
          pergunta: 'd) Quantos alunos não compraram na cantina?',
          frases: [{ antes: '', depois: 'alunos.', certas: ['10', 'dez'] }],
          explica: 'A barra de quem não comprou na cantina chega no 10.' },
        { id: 'ma12a6-05', tipo: 'digitar', origem: 'APR-71-q1e', pagina: 71, livro: 'ma-a71', avulsa: { carta: 'ma-a70' }, apoio: CANTINA,
          pergunta: 'e) Quantos alunos gastaram mais de R$ 10,00?',
          frases: [{ antes: 'Foram', depois: 'alunos que gastaram mais de R$ 10,00.', certas: ['22', 'vinte e dois'] }],
          explica: '16 alunos gastaram de R$ 10,00 a R$ 15,00 e 6 gastaram mais de R$ 15,00: 16 + 6 = 22.' },
      ],
    });
})();
