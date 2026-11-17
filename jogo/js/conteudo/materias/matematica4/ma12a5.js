/* Sala ma12a5 (Livro de Aprendizagem, capítulo 12, pp. 66 a 69): Pesquisas, do tema e da pergunta (p. 66) ao
   questionário e à entrevista (p. 67, só leitura), à tabela e ao gráfico de barras (p. 68) e à apresentação do
   resultado (p. 69) (docs/contratos/quarto-bimestre.md §3). O QR code da p. 69 fica de fora. As perguntas abertas
   da p. 66 viram escolha entre uma resposta possível e outras que não servem. */
(function () {
  var BRINCADEIRAS = { titulo: 'As brincadeiras preferidas dos pais', partes: [{ lista: [
    'Corrida do saco: 27 votos', 'Dança das cadeiras: 30 votos', 'Cabo de guerra: 18 votos',
    'Caça ao tesouro: 21 votos', 'Corrida de 3 pernas: 18 votos'] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma12a5', nome: 'Como fazer uma pesquisa', emoji: '🔍',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 66 a 69', ordem: 'livro',
      cartas: ['ma-a66', 'ma-a67', 'ma-a68', 'ma-a69'],
      intro: 'Tema, pergunta, coleta e resultado: vamos aprender os passos de uma pesquisa!',
      desafios: [
        { id: 'ma12a5-01', tipo: 'escolha', origem: 'APR-66-qA', pagina: 66, livro: 'ma-a66',
          pergunta: 'Qual pode ser o tema da pesquisa que a professora e os alunos vão realizar?',
          opcoes: [
            { t: 'Brincadeiras preferidas dos pais ou responsáveis.' },
            { t: 'Comidas preferidas dos alunos.' },
            { t: 'Esporte favorito da professora.' },
            { t: 'Cores preferidas da turma.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'A professora quer descobrir as brincadeiras preferidas dos pais ou responsáveis para a gincana.' },
        { id: 'ma12a5-02', tipo: 'escolha', origem: 'APR-66-qB', pagina: 66, livro: 'ma-a66',
          pergunta: 'Qual pergunta a professora e os alunos podem fazer para descobrir as brincadeiras preferidas dos pais ou responsáveis em uma gincana?',
          opcoes: [
            { t: 'Qual brincadeira você gostaria que tivesse em uma gincana?' },
            { t: 'Qual é a sua cor preferida?' },
            { t: 'Quantos anos você tem?' },
            { t: 'Onde você mora?' },
          ], certa: 0,
          adaptacao: 'Resposta aberta virou escolher a pergunta que combina com o tema.',
          explica: 'A pergunta precisa falar de brincadeiras e da gincana, que é o tema da pesquisa.' },
        { id: 'ma12a5-03', tipo: 'escolha', origem: 'APR-66-qC', pagina: 66, livro: 'ma-a66',
          pergunta: 'Para quem a pergunta dessa pesquisa deve ser feita?',
          opcoes: [
            { t: 'Para os pais ou responsáveis dos alunos.' },
            { t: 'Para os alunos do 5º ano.' },
            { t: 'Para a diretora.' },
            { t: 'Para os vizinhos.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher entre as opções; "essa pergunta" virou "a pergunta dessa pesquisa".',
          explica: 'Queremos saber as brincadeiras preferidas dos pais ou responsáveis. Então, perguntamos a eles!' },
        { id: 'ma12a5-04', tipo: 'tabela', origem: 'APR-68-qA', pagina: 68, livro: 'ma-a68', apoio: BRINCADEIRAS,
          pergunta: 'Pinte no gráfico de barras as informações da tabela. Cada quadrinho equivale a 3 votos. Quantos quadrinhos você pinta em cada barra?',
          cab: ['Brincadeira', 'Quadrinhos pintados'],
          linhas: [
            ['Corrida do saco', { certas: ['9', 'nove'] }],
            ['Dança das cadeiras', { certas: ['10', 'dez'] }],
            ['Cabo de guerra', { certas: ['6', 'seis'] }],
            ['Caça ao tesouro', { certas: ['7', 'sete'] }],
            ['Corrida de 3 pernas', { certas: ['6', 'seis'] }],
          ],
          adaptacao: 'Pintar o gráfico de barras virou escrever quantos quadrinhos de 3 votos cada barra terá.',
          explica: 'Cada quadrinho vale 3 votos: 27 são 9 quadrinhos, 30 são 10, 18 são 6 e 21 são 7.' },
        { id: 'ma12a5-05', tipo: 'digitar', origem: 'APR-69-qA', pagina: 69, livro: 'ma-a69', apoio: BRINCADEIRAS,
          pergunta: 'Quantos votos teve a brincadeira Corrida do saco?',
          frases: [{ antes: '', depois: 'votos.', certas: ['27', 'vinte e sete'] }],
          explica: 'A corrida do saco teve 27 votos.' },
        { id: 'ma12a5-06', tipo: 'escolha', origem: 'APR-69-qB', pagina: 69, livro: 'ma-a69', apoio: BRINCADEIRAS,
          pergunta: 'Qual foi a brincadeira mais votada?',
          opcoes: [
            { t: 'Corrida do saco' },
            { t: 'Dança das cadeiras' },
            { t: 'Cabo de guerra' },
            { t: 'Caça ao tesouro' },
            { t: 'Corrida de 3 pernas' },
          ], certa: 1,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'A dança das cadeiras teve 30 votos, o maior número.' },
        { id: 'ma12a5-07', tipo: 'varias', origem: 'APR-69-qC', pagina: 69, livro: 'ma-a69', apoio: BRINCADEIRAS,
          pergunta: 'Quais brincadeiras tiveram a mesma quantidade de votos? Toque em TODAS.',
          opcoes: [
            { t: 'Corrida do saco' },
            { t: 'Dança das cadeiras' },
            { t: 'Cabo de guerra', ok: true },
            { t: 'Caça ao tesouro' },
            { t: 'Corrida de 3 pernas', ok: true },
          ],
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Cabo de guerra e corrida de 3 pernas tiveram 18 votos cada uma.' },
      ],
    });
})();
