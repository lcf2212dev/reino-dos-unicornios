/* Sala ma12a8 (Livro de Aprendizagem, capítulo 12, pp. 75 e 76): Saberes em ação, a pesquisa da turma em grupos
   (docs/contratos/quarto-bimestre.md §3). Ela escolhe o tema e monta o questionário sozinha; as etapas 3 a 6
   (trocar questionários, anotar, montar o gráfico de tampinhas e apresentar) são da turma: leitura na carta ma-a76. */
Reino.registrarSala('matematica4',
    {
      id: 'ma12a8', nome: 'Nossa pesquisa', emoji: '📋',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 75 a 76', ordem: 'livro',
      cartas: ['ma-a75', 'ma-a76'],
      intro: 'Agora é a sua vez! Escolha um tema e crie o seu próprio questionário de pesquisa.',
      desafios: [
        { id: 'ma12a8-01', tipo: 'escrever', origem: 'APR-75-q1', pagina: 75, livro: 'ma-a75',
          pergunta: '1. Sobre o que vocês gostariam de pesquisar? Escolham o tema da pesquisa. Depois, anotem o tema escolhido.',
          linhas: 2, minPalavras: 2,
          modelo: 'Fruta preferida da turma.',
          adaptacao: 'O tema, que no livro é escolhido em grupo, ela escolhe sozinha.',
          explica: 'Que tema legal! Agora já dá para pensar na pergunta da pesquisa.' },
        { id: 'ma12a8-02', tipo: 'digitar', livre: true, origem: 'APR-75-q2', pagina: 75, livro: 'ma-a75',
          pergunta: '2. No questionário abaixo, escrevam a pergunta da pesquisa e quatro opções de resposta.',
          frases: [
            { antes: 'Pergunta:', depois: '' },
            { antes: 'Opção 1:', depois: '' },
            { antes: 'Opção 2:', depois: '' },
            { antes: 'Opção 3:', depois: '' },
            { antes: 'Opção 4:', depois: '' },
          ],
          adaptacao: 'O questionário, que no livro é feito em grupo, ela preenche sozinha (pergunta e 4 opções).',
          explica: 'Muito bem! Por exemplo: Qual é a sua fruta preferida? Banana, maçã, uva ou morango.' },
      ],
    });
