/* Sala ma12a1 (Livro de Aprendizagem, capítulo 12, pp. 54 e 55): a abertura do capítulo, com a tabela do projeto
   reflorestar, e o Conversa vem... (docs/contratos/quarto-bimestre.md §3). As três perguntas do Conversa vai...
   são de conversa (soLeitura na carta ma-a54); as do Conversa vem... são orais no livro e viram escolha e digitação. */
(function () {
  var MUDAS = { titulo: 'Projeto reflorestar – Plantio de mudas de árvores', partes: [{ lista: [
    '1º ano: 10 mudas', '2º ano: 8 mudas', '3º ano: 6 mudas', '4º ano: 12 mudas', '5º ano: 10 mudas'] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma12a1', nome: 'Plantando árvores', emoji: '🌳',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 54 a 55', ordem: 'livro',
      cartas: ['ma-a54', 'ma-a55'],
      intro: 'Vamos plantar árvores com a turma da Soraia e ler a primeira tabela do capítulo!',
      desafios: [
        { id: 'ma12a1-01', tipo: 'escolha', origem: 'APR-55-qA', pagina: 55, livro: 'ma-a55', avulsa: { carta: 'ma-a54' }, apoio: MUDAS,
          pergunta: 'Qual ano escolar plantou a maior quantidade de mudas de árvores?',
          opcoes: [
            { t: '1º ano' },
            { t: '2º ano' },
            { t: '3º ano' },
            { t: '4º ano' },
            { t: '5º ano' },
          ], certa: 3,
          adaptacao: 'Pergunta oral do Conversa vem... virou escolha.',
          explica: 'O 4º ano plantou 12 mudas, a maior quantidade da tabela.' },
        { id: 'ma12a1-02', tipo: 'digitar', origem: 'APR-55-qB', pagina: 55, livro: 'ma-a55', avulsa: { carta: 'ma-a54' }, apoio: MUDAS,
          pergunta: 'Quantas mudas de árvores os alunos do 2º ano plantaram?',
          frases: [{ antes: 'Os alunos do 2º ano plantaram', depois: 'mudas.', certas: ['8', 'oito'] }],
          adaptacao: 'Pergunta oral do Conversa vem... virou digitar o número.',
          explica: 'Na linha do 2º ano, a tabela mostra 8 mudas.' },
        { id: 'ma12a1-03', tipo: 'escolha', origem: 'APR-55-qC', pagina: 55, livro: 'ma-a55', avulsa: { carta: 'ma-a54' }, apoio: MUDAS,
          pergunta: 'Observando os dados da tabela, foram plantadas ao todo mais de 50 mudas ou menos?',
          opcoes: [
            { t: 'Mais de 50 mudas.' },
            { t: 'Menos de 50 mudas.' },
          ], certa: 1,
          adaptacao: 'Pergunta oral do Conversa vem... virou escolha.',
          explica: '10 + 8 + 6 + 12 + 10 = 46 mudas. 46 é menos que 50!' },
        { id: 'ma12a1-04', tipo: 'tabela', origem: 'APR-55-qD', pagina: 55, livro: 'ma-a55', avulsa: { carta: 'ma-a54' }, apoio: MUDAS,
          pergunta: 'Insira no gráfico abaixo as informações da tabela. Para isso, pinte na malha quadriculada a quantidade de mudas que cada ano escolar plantou. Cada quadradinho pintado deve representar uma muda de árvore plantada.',
          cab: ['Ano escolar', 'Quadradinhos pintados'],
          linhas: [
            ['1º', { certas: ['10'] }],
            ['2º', { certas: ['8'] }],
            ['3º', { certas: ['6'] }],
            ['4º', { certas: ['12'] }],
            ['5º', { certas: ['10'] }],
          ],
          adaptacao: 'Pintar a malha virou escrever quantos quadradinhos a coluna de cada ano terá.',
          explica: 'Cada quadradinho é uma muda: a coluna do 1º ano tem 10, a do 2º tem 8, a do 3º tem 6, a do 4º tem 12 e a do 5º tem 10.' },
      ],
    });
})();
