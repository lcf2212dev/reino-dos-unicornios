/* Sala ma12t2 (Livro de Atividades, capítulo 12, pp. 15 e 16): Tabelas e gráficos / Pesquisas. A pesquisa da
   professora Raquel sobre os jogos de tabuleiro preferidos, a tabela e o gráfico de colunas para pintar
   (docs/contratos/quarto-bimestre.md §3). A tabela da p. 15 vai no apoio de todas as questões (a p. 16 depende dela). */
(function () {
  var JOGOS = { titulo: 'Jogos de tabuleiro preferidos', partes: [{ lista: [
    'Ludo: 12 alunos.', 'Xadrez: 16 alunos.', 'Damas: 10 alunos.', 'Trilha: 18 alunos.',
  ] }] };
  function jogos() { return ['Ludo', 'Xadrez', 'Damas', 'Trilha'].map(function (n) { return { t: n }; }); }

  Reino.registrarSala('matematica4',
    {
      id: 'ma12t2', nome: 'Jogos de tabuleiro', emoji: '🎲',
      livroOrigem: 'atividades', capitulo: 12, paginas: 'pp. 15 a 16', ordem: 'livro',
      cartas: ['ma-t15', 'ma-t16'],
      intro: 'Vamos descobrir qual é o jogo de tabuleiro preferido da turma e montar um gráfico!',
      desafios: [
        { id: 'ma12t2-01', tipo: 'digitar', origem: 'ATI-15-q1a', pagina: 15, livro: 'ma-t15', apoio: JOGOS,
          pergunta: 'Observe a pergunta que a professora Raquel fez aos alunos do 2º ano. O resultado dessa pesquisa foi organizado na tabela a seguir. a) Quantos alunos preferem xadrez?',
          frases: [{ antes: '', depois: '', certas: ['16', 'dezesseis', '16 alunos'] }],
          explica: 'Na tabela, o xadrez tem 16 alunos.' },
        { id: 'ma12t2-02', tipo: 'escolha', origem: 'ATI-15-q1b', pagina: 15, livro: 'ma-t15', apoio: JOGOS,
          pergunta: 'b) Qual é o jogo preferido por 12 alunos?',
          opcoes: jogos(), certa: 0,
          adaptacao: 'Escrever o nome do jogo virou escolher entre os quatro.',
          explica: 'O 12 está na linha do ludo.' },
        { id: 'ma12t2-03', tipo: 'escolha', origem: 'ATI-15-q1c', pagina: 15, livro: 'ma-t15', apoio: JOGOS,
          pergunta: 'c) Qual é o jogo preferido pela maior quantidade de alunos do 2º ano?',
          opcoes: jogos(), certa: 3,
          adaptacao: 'Escrever o nome do jogo virou escolher entre os quatro.',
          explica: 'O maior número da tabela é 18, da trilha.' },
        { id: 'ma12t2-04', tipo: 'escolha', origem: 'ATI-15-q1d', pagina: 15, livro: 'ma-t15', apoio: JOGOS,
          pergunta: 'd) Qual é o jogo preferido pela menor quantidade de alunos do 2º ano?',
          opcoes: jogos(), certa: 2,
          adaptacao: 'Escrever o nome do jogo virou escolher entre os quatro.',
          explica: 'O menor número da tabela é 10, das damas.' },
        { id: 'ma12t2-05', tipo: 'digitar', origem: 'ATI-15-q1e', pagina: 15, livro: 'ma-t15', apoio: JOGOS,
          pergunta: 'e) Quantos alunos preferem xadrez e trilha?',
          frases: [{ antes: 'São', depois: 'alunos que preferem xadrez e trilha.', certas: ['34', 'trinta e quatro'] }],
          explica: 'Xadrez 16 e trilha 18: 16 + 18 = 34 alunos.' },
        { id: 'ma12t2-06', tipo: 'tabela', origem: 'ATI-16-q2', pagina: 16, livro: 'ma-t16', avulsa: { carta: 'ma-t15' }, apoio: JOGOS,
          pergunta: 'Pinte as colunas do gráfico para representar as informações da tabela Jogos de tabuleiro preferidos. Cada quadrinho equivale a 2 alunos. Quantos quadrinhos você pinta em cada coluna?',
          cab: ['Jogo', 'Quadrinhos pintados'],
          linhas: [
            ['Ludo', { certas: ['6', 'seis'] }],
            ['Xadrez', { certas: ['8', 'oito'] }],
            ['Damas', { certas: ['5', 'cinco'] }],
            ['Trilha', { certas: ['9', 'nove'] }],
          ],
          adaptacao: 'Pintar as colunas do gráfico virou escrever quantos quadrinhos pintar em cada coluna; "a tabela da atividade anterior" virou o nome da tabela.',
          explica: 'Cada quadrinho vale 2 alunos. Ludo 12: 6 quadrinhos. Xadrez 16: 8. Damas 10: 5. Trilha 18: 9.' },
        { id: 'ma12t2-07', tipo: 'digitar', origem: 'ATI-16-q2a', pagina: 16, livro: 'ma-t16', avulsa: { carta: 'ma-t15' }, apoio: JOGOS,
          pergunta: 'a) Quantos alunos preferem ludo e xadrez?',
          frases: [{ antes: 'São', depois: 'alunos que preferem ludo e xadrez.', certas: ['28', 'vinte e oito'] }],
          explica: 'Ludo 12 e xadrez 16: 12 + 16 = 28 alunos.' },
        { id: 'ma12t2-08', tipo: 'digitar', origem: 'ATI-16-q2b', pagina: 16, livro: 'ma-t16', avulsa: { carta: 'ma-t15' }, apoio: JOGOS,
          pergunta: 'b) Sabendo que cada aluno votou em apenas um jogo, quantos alunos participaram dessa pesquisa?',
          frases: [{ antes: 'Foram', depois: 'alunos que participaram dessa pesquisa.', certas: ['56', 'cinquenta e seis'] }],
          explica: 'Somando todos os jogos: 12 + 16 + 10 + 18 = 56 alunos.' },
      ],
    });
})();
