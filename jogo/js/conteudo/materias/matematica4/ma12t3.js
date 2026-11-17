/* Sala ma12t3 (Livro de Atividades, capítulo 12, pp. 17 e 18): Pesquisas. A pesquisa do diretor sobre os brinquedos
   do parquinho, a tabela e o gráfico de barras para pintar (docs/contratos/quarto-bimestre.md §3). A tabela da
   p. 17 vai no apoio de todas as questões (a p. 18 depende dela). */
(function () {
  var BRINQUEDOS = { titulo: 'Brinquedos no parquinho da escola', partes: [{ lista: [
    'Escorregador: 50 alunos.', 'Balanço: 45 alunos.', 'Gangorra: 30 alunos.', 'Gira-gira: 45 alunos.',
  ] }] };
  var DIRETOR = { titulo: 'O diretor disse:', partes: [{ texto: '"Preciso descobrir quais brinquedos os alunos gostariam que o parquinho da escola tivesse."' }] };

  Reino.registrarSala('matematica4',
    {
      id: 'ma12t3', nome: 'Pesquisa do parquinho', emoji: '🎠',
      livroOrigem: 'atividades', capitulo: 12, paginas: 'pp. 17 a 18', ordem: 'livro',
      cartas: ['ma-t17', 'ma-t18'],
      intro: 'Vamos ajudar o diretor a escolher os brinquedos do parquinho com uma pesquisa!',
      desafios: [
        { id: 'ma12t3-01', tipo: 'escolha', origem: 'ATI-17-q1a', pagina: 17, livro: 'ma-t17', apoio: DIRETOR,
          pergunta: 'Na escola onde Alice estuda, será construído um parquinho. Leia o que o diretor dessa escola quer descobrir em uma pesquisa. a) Qual é o tema dessa pesquisa?',
          opcoes: [
            { t: 'Brinquedos que os alunos gostariam que o parquinho da escola tivesse.' },
            { t: 'Brincadeiras que os alunos mais brincam na escola.' },
          ], certa: 0,
          explica: 'O diretor quer saber quais brinquedos os alunos gostariam de ter no parquinho.' },
        { id: 'ma12t3-02', tipo: 'digitar', origem: 'ATI-17-q1b', pagina: 17, livro: 'ma-t17', apoio: BRINQUEDOS,
          pergunta: 'b) A tabela a seguir mostra o resultado dessa pesquisa. Qual é o título dessa tabela? Quantos alunos gostariam que tivesse balanço no parquinho?',
          frases: [
            { antes: 'Título:', depois: '', certas: ['Brinquedos no parquinho da escola'] },
            { antes: 'Balanço:', depois: 'alunos', certas: ['45', 'quarenta e cinco'] },
          ],
          explica: 'O título é Brinquedos no parquinho da escola. O balanço foi escolhido por 45 alunos.' },
        { id: 'ma12t3-03', tipo: 'tabela', origem: 'ATI-18-q1c', pagina: 18, livro: 'ma-t18', avulsa: { carta: 'ma-t17' }, apoio: BRINQUEDOS,
          pergunta: 'c) Pinte as barras do gráfico para representar as informações da tabela. Cada quadrinho equivale a 5 alunos. Quantos quadrinhos você pinta em cada barra?',
          cab: ['Brinquedo', 'Quadrinhos pintados'],
          linhas: [
            ['Escorregador', { certas: ['10', 'dez'] }],
            ['Balanço', { certas: ['9', 'nove'] }],
            ['Gangorra', { certas: ['6', 'seis'] }],
            ['Gira-gira', { certas: ['9', 'nove'] }],
          ],
          adaptacao: 'Pintar as barras do gráfico virou escrever quantos quadrinhos pintar em cada barra.',
          explica: 'Cada quadrinho vale 5 alunos. Escorregador 50: 10 quadrinhos. Balanço 45: 9. Gangorra 30: 6. Gira-gira 45: 9.' },
        { id: 'ma12t3-04', tipo: 'escolha', origem: 'ATI-18-q1d', pagina: 18, livro: 'ma-t18', avulsa: { carta: 'ma-t17' }, apoio: BRINQUEDOS,
          pergunta: 'd) Qual brinquedo foi escolhido por 50 alunos?',
          opcoes: [
            { t: 'Escorregador' },
            { t: 'Balanço' },
            { t: 'Gangorra' },
            { t: 'Gira-gira' },
          ], certa: 0,
          adaptacao: 'Escrever o nome do brinquedo virou escolher entre os quatro.',
          explica: 'O 50 está na linha do escorregador.' },
        { id: 'ma12t3-05', tipo: 'varias', origem: 'ATI-18-q1e', pagina: 18, livro: 'ma-t18', avulsa: { carta: 'ma-t17' }, apoio: BRINQUEDOS,
          pergunta: 'e) Quais brinquedos foram escolhidos pela mesma quantidade de alunos?',
          opcoes: [
            { t: 'Escorregador' },
            { t: 'Balanço', ok: true },
            { t: 'Gangorra' },
            { t: 'Gira-gira', ok: true },
          ],
          adaptacao: 'Escrever os nomes virou tocar nos brinquedos.',
          explica: 'Balanço e gira-gira foram escolhidos por 45 alunos cada um.' },
        { id: 'ma12t3-06', tipo: 'digitar', origem: 'ATI-18-q1f', pagina: 18, livro: 'ma-t18', avulsa: { carta: 'ma-t17' }, apoio: BRINQUEDOS,
          pergunta: 'f) Quantos alunos ao todo escolheram balanço e gira-gira?',
          frases: [{ antes: 'São', depois: 'alunos ao todo que escolheram balanço e gira-gira.', certas: ['90', 'noventa'] }],
          explica: 'Balanço 45 e gira-gira 45: 45 + 45 = 90 alunos.' },
      ],
    });
})();
