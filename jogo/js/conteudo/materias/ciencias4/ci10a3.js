/* Sala ci10a3 (Livro de Aprendizagem, capítulo 10, pp. 9 e 10): o Saberes em ação, experimento da planta no sol e
   no escuro (docs/contratos/quarto-bimestre.md §3). O experimento de verdade é feito na escola; no jogo, a previsão e
   o registro viram escolher e classificar o resultado esperado. As conversas da Etapa 3 (q1) e da Etapa 4 (qA)
   ficam como leitura na carta ci-a10 (soLeitura). */
(function () {
  var LOCAIS = [
    { t: 'Planta colocada em local ensolarado.' },
    { t: 'Planta colocada em local escuro.' },
  ];
  Reino.registrarSala('ciencias4',
    {
      id: 'ci10a3', nome: 'Planta no sol e no escuro', emoji: '🧪',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 9 a 10', ordem: 'livro',
      cartas: ['ci-a09', 'ci-a09b', 'ci-a10'],
      intro: 'Vamos fazer um experimento: uma plantinha no sol e outra no escuro. O que será que acontece?',
      desafios: [
        { id: 'ci10a3-01', tipo: 'escolha', origem: 'APR-09-q4', pagina: 9, livro: 'ci-a09',
          pergunta: 'Conversem com os colegas: o que vocês acham que acontecerá com as sementes?',
          opcoes: [
            { t: 'A do sol vai crescer mais e ficar bem verde.' },
            { t: 'A do escuro vai crescer mais e ficar bem verde.' },
            { t: 'As duas vão ficar iguaizinhas.' },
          ], certa: 0,
          adaptacao: 'A conversa de previsão virou escolher o que deve acontecer no experimento.',
          explica: 'A semente no sol cresce forte e verde. A do escuro fica fininha e amarelada, porque falta luz.' },
        { id: 'ci10a3-02', tipo: 'separar', origem: 'APR-09-q2', pagina: 9, livro: 'ci-a09b',
          pergunta: 'Registrem as observações sobre as plantas que nasceram em cada recipiente.',
          grupos: [{ e: '☀', t: 'Local ensolarado' }, { e: '🌑', t: 'Local escuro' }],
          itens: [
            { t: 'Fica bem verde', g: 0 },
            { t: 'Fica amarelada', g: 1 },
            { t: 'Cresce forte', g: 0 },
            { t: 'Fica fraquinha', g: 1 },
          ],
          adaptacao: 'A tabela do experimento de verdade virou separar o resultado esperado em cada local.',
          explica: 'No sol, a planta fica verde e forte. No escuro, ela fica amarelada e fraquinha.' },
        { id: 'ci10a3-03', tipo: 'desenho', origem: 'APR-10-q2', pagina: 10, livro: 'ci-a10', guardar: true,
          pergunta: 'Desenhe como estão as duas plantas ao final do experimento: a do local ensolarado e a do local escuro.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'Os dois quadros do livro viraram uma prancheta só, com as duas plantas.',
          explica: 'Que desenho caprichado! A planta do sol fica maior e verde; a do escuro, fina e amarelada.' },
        { id: 'ci10a3-04', tipo: 'escolha', origem: 'APR-10-q3a', pagina: 10, livro: 'ci-a10',
          pergunta: 'Qual foi a planta que mais cresceu?',
          opcoes: LOCAIS, certa: 0,
          explica: 'A planta do local ensolarado cresceu mais, porque recebeu a luz do sol.' },
        { id: 'ci10a3-05', tipo: 'escolha', origem: 'APR-10-q3b', pagina: 10, livro: 'ci-a10',
          pergunta: 'Qual foi a planta que ficou mais verde?',
          opcoes: LOCAIS, certa: 0,
          explica: 'A planta do sol ficou mais verde. No escuro, a planta fica amarelada.' },
        { id: 'ci10a3-06', tipo: 'escolha', origem: 'APR-10-q3c', pagina: 10, livro: 'ci-a10',
          pergunta: 'Por que vocês acham que isso aconteceu?',
          opcoes: [
            { t: 'Porque a planta precisa da luz do sol para fazer a fotossíntese.' },
            { t: 'Porque a planta não gosta de ficar sozinha.' },
            { t: 'Porque no escuro a planta dorme o tempo todo.' },
          ], certa: 0,
          adaptacao: 'A conversa em grupo virou escolher o motivo certo.',
          explica: 'Com a luz do sol, a planta faz a fotossíntese e produz o próprio alimento. Por isso ela cresce verde e forte!' },
      ],
    });
})();
