/* Sala ma12t1 (Livro de Atividades, capítulo 12, pp. 13 e 14): Tabelas e gráficos. O gráfico de barras "Pontuação
   no jogo" (a ilustração ma-t13-grafico, icones-t.js), a tabela que o copia e a tabela dos livros lidos na biblioteca
   (docs/contratos/quarto-bimestre.md §3). O gráfico vai como figura em todas as questões que dependem dele. */
(function () {
  var GRAFICO = { ilustracao: 'ma-t13-grafico', alt: 'Gráfico de barras Pontuação no jogo, com os pontos perdidos (laranja) e ganhos (roxo) de Otávio, Flávia, Jaqueline e Marcelo.' };
  var JOGADORES = ['Otávio', 'Flávia', 'Jaqueline', 'Marcelo'];
  function nomes() { return JOGADORES.map(function (n) { return { t: n }; }); }
  var LIVROS = { titulo: 'Tipos de livros lidos na biblioteca da escola', partes: [{ lista: [
    'Contos de fadas: 2º ano A, 15 alunos; 2º ano B, 12 alunos.',
    'Histórias de aventura: 2º ano A, 10 alunos; 2º ano B, 15 alunos.',
    'Histórias de animais: 2º ano A, 15 alunos; 2º ano B, 10 alunos.',
    'Histórias engraçadas: 2º ano A, 13 alunos; 2º ano B, 11 alunos.',
  ] }] };
  var TIPOS = ['Contos de fadas', 'Histórias de aventura', 'Histórias de animais', 'Histórias engraçadas'];
  function tipos() { return TIPOS.map(function (n) { return { t: n }; }); }

  Reino.registrarSala('matematica4',
    {
      id: 'ma12t1', nome: 'Gráfico e tabela', emoji: '📚',
      livroOrigem: 'atividades', capitulo: 12, paginas: 'pp. 13 a 14', ordem: 'livro',
      cartas: ['ma-t13', 'ma-t14'],
      intro: 'Vamos ler um gráfico de barras e duas tabelas, como detetives dos números!',
      desafios: [
        { id: 'ma12t1-01', tipo: 'escolha', origem: 'ATI-13-q1a', pagina: 13, livro: 'ma-t13', figura: GRAFICO,
          pergunta: 'O gráfico a seguir apresenta a quantidade de pontos que cada jogador ganhou e perdeu em um jogo. a) Qual é o título desse gráfico?',
          opcoes: [
            { t: 'Quantidade de pontos' },
            { t: 'Pontuação no jogo' },
            { t: 'Perdidos e ganhos' },
          ], certa: 1,
          adaptacao: 'Escrever o título virou escolher o título entre três.',
          explica: 'O título fica em cima do gráfico: Pontuação no jogo.' },
        { id: 'ma12t1-02', tipo: 'escolha', origem: 'ATI-13-q1b', pagina: 13, livro: 'ma-t13', figura: GRAFICO,
          pergunta: 'b) Quem ganhou mais pontos nesse jogo?',
          opcoes: nomes(), certa: 3,
          adaptacao: 'Escrever o nome virou escolher entre os quatro jogadores.',
          explica: 'A barra roxa mais comprida é a de Marcelo: ele ganhou 30 pontos.' },
        { id: 'ma12t1-03', tipo: 'escolha', origem: 'ATI-13-q1c', pagina: 13, livro: 'ma-t13', figura: GRAFICO,
          pergunta: 'c) Quem perdeu menos pontos?',
          opcoes: nomes(), certa: 3,
          adaptacao: 'Escrever o nome virou escolher entre os quatro jogadores.',
          explica: 'A barra laranja mais curta é a de Marcelo: ele perdeu só 10 pontos.' },
        { id: 'ma12t1-04', tipo: 'varias', origem: 'ATI-13-q1d', pagina: 13, livro: 'ma-t13', figura: GRAFICO,
          pergunta: 'd) Quais jogadores perderam a mesma quantidade de pontos?',
          opcoes: [
            { t: 'Otávio', ok: true },
            { t: 'Flávia' },
            { t: 'Jaqueline', ok: true },
            { t: 'Marcelo' },
          ],
          adaptacao: 'Escrever os nomes virou tocar nos jogadores.',
          explica: 'Otávio e Jaqueline perderam 12 pontos cada um: as barras laranjas deles são do mesmo tamanho.' },
        { id: 'ma12t1-05', tipo: 'escolha', origem: 'ATI-13-q1e', pagina: 13, livro: 'ma-t13', figura: GRAFICO,
          pergunta: 'e) Quem ganhou 28 pontos?',
          opcoes: nomes(), certa: 1,
          adaptacao: 'Escrever o nome virou escolher entre os quatro jogadores.',
          explica: 'A barra roxa de Flávia chega no 28.' },
        { id: 'ma12t1-06', tipo: 'tabela', origem: 'ATI-14-q2', pagina: 14, livro: 'ma-t14', figura: GRAFICO,
          pergunta: 'Escreva na tabela as informações apresentadas no gráfico da atividade anterior.',
          cab: ['Nome', 'Pontos ganhos', 'Pontos perdidos'],
          linhas: [
            ['Marcelo', { certas: ['30'] }, { certas: ['10'] }],
            ['Jaqueline', { certas: ['18'] }, { certas: ['12'] }],
            ['Flávia', { certas: ['28'] }, { certas: ['14'] }],
            ['Otávio', { certas: ['24'] }, { certas: ['12'] }],
          ],
          explica: 'Marcelo ganhou 30 e perdeu 10. Jaqueline, 18 e 12. Flávia, 28 e 14. Otávio, 24 e 12.' },
        { id: 'ma12t1-07', tipo: 'digitar', origem: 'ATI-14-q3a', pagina: 14, livro: 'ma-t14', apoio: LIVROS,
          pergunta: 'A tabela a seguir mostra o tipo de livro que os alunos do 2º ano mais gostam de ler na biblioteca da escola. a) Quantos alunos do 2º ano A gostam de ler livros sobre animais?',
          frases: [{ antes: '', depois: '', certas: ['15', 'quinze', '15 alunos'] }],
          explica: 'Na linha Histórias de animais, a coluna do 2º ano A diz 15.' },
        { id: 'ma12t1-08', tipo: 'escolha', origem: 'ATI-14-q3b', pagina: 14, livro: 'ma-t14', apoio: LIVROS,
          pergunta: 'b) Qual é o tipo de livro que 12 alunos do 2º ano B mais gostam de ler?',
          opcoes: tipos(), certa: 0,
          adaptacao: 'Escrever o tipo de livro virou escolher entre os quatro.',
          explica: 'No 2º ano B, o 12 está na linha Contos de fadas.' },
        { id: 'ma12t1-09', tipo: 'escolha', origem: 'ATI-14-q3c', pagina: 14, livro: 'ma-t14', apoio: LIVROS,
          pergunta: 'c) Qual é o tipo de livro que os alunos do 2º ano B mais gostam de ler?',
          opcoes: tipos(), certa: 1,
          adaptacao: 'Escrever o tipo de livro virou escolher entre os quatro.',
          explica: 'No 2º ano B, o maior número é 15, de Histórias de aventura.' },
        { id: 'ma12t1-10', tipo: 'digitar', origem: 'ATI-14-q3d', pagina: 14, livro: 'ma-t14', apoio: LIVROS,
          pergunta: 'd) Quantos alunos do 2º ano A e do 2º ano B gostam de ler livros de histórias engraçadas ao todo?',
          frases: [{ antes: '', depois: '', certas: ['24', '24 alunos'] }],
          explica: 'Histórias engraçadas: 13 no 2º ano A e 11 no 2º ano B. 13 + 11 = 24 alunos.' },
      ],
    });
})();
