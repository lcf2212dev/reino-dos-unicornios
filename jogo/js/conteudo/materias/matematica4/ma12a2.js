/* Sala ma12a2 (Livro de Aprendizagem, capítulo 12, pp. 56 a 59): Tabelas e gráficos, com as mudas de flores (contagem,
   tabela e gráfico de colunas) e os alimentos in natura e ultraprocessados (tabela e gráfico de barras duplas)
   (docs/contratos/quarto-bimestre.md §3). A p. 58 só tem leitura (duas cartas). */
(function () {
  var FLORES = { titulo: 'Mudas de flores que plantamos', partes: [{ lista: [
    'Margarida: 12', 'Rosa: 18', 'Camélia: 18', 'Jasmim: 20'] }] };
  var ALIMENTOS = { titulo: 'Alimentos consumidos durante uma semana', partes: [{ lista: [
    'Soraia: 12 in natura e 4 ultraprocessados', 'Marcelo: 10 in natura e 10 ultraprocessados',
    'Rodrigo: 14 in natura e 6 ultraprocessados', 'Vitória: 12 in natura e 8 ultraprocessados'] }] };
  Reino.registrarSala('matematica4',
    {
      id: 'ma12a2', nome: 'Tabelas e gráficos', emoji: '📊',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 56 a 59', ordem: 'livro',
      cartas: ['ma-a56', 'ma-a57', 'ma-a58', 'ma-a58b', 'ma-a59'],
      intro: 'Vamos contar as flores do jardim e aprender a ler tabelas e gráficos!',
      desafios: [
        { id: 'ma12a2-01', tipo: 'escolha', origem: 'APR-56-qA', pagina: 56, livro: 'ma-a56',
          apoio: { titulo: 'Mudas de flores que plantamos', partes: [{ texto: 'Na folha, cada tracinho é uma muda. O quadradinho riscado tem 4 tracinhos em volta e 1 risco atravessado no meio.' }] },
          pergunta: 'Qual quantidade o símbolo do quadradinho riscado representa?',
          opcoes: [
            { t: '1' },
            { t: '4' },
            { t: '5' },
            { t: '10' },
          ], certa: 2,
          adaptacao: 'Completar o quadradinho virou escolher entre as opções.',
          explica: 'São 4 tracinhos em volta e mais 1 risco: 4 + 1 = 5. Cada quadradinho riscado vale 5.' },
        { id: 'ma12a2-02', tipo: 'tabela', origem: 'APR-56-qB', pagina: 56, livro: 'ma-a56',
          apoio: { titulo: 'Mudas de flores que plantamos', partes: [{ lista: [
            'Margarida: 2 quadradinhos riscados e 2 tracinhos', 'Rosa: 3 quadradinhos riscados e 3 tracinhos',
            'Camélia: 3 quadradinhos riscados e 3 tracinhos', 'Jasmim: 4 quadradinhos riscados'] }] },
          pergunta: 'Escreva na tabela, com números, a quantidade de mudas plantadas de cada flor.',
          cab: ['Flor', 'Quantidade de mudas'],
          linhas: [
            ['Margarida', { certas: ['12'] }],
            ['Rosa', { certas: ['18'] }],
            ['Camélia', { certas: ['18'] }],
            ['Jasmim', { certas: ['20'] }],
          ],
          explica: 'Cada quadradinho riscado vale 5. Margarida: 5 + 5 + 2 = 12. Rosa e Camélia: 5 + 5 + 5 + 3 = 18. Jasmim: 5 + 5 + 5 + 5 = 20.' },
        { id: 'ma12a2-03', tipo: 'digitar', origem: 'APR-57-qA', pagina: 57, livro: 'ma-a57', apoio: FLORES,
          pergunta: 'Quantas mudas de margarida foram plantadas?',
          frases: [{ antes: '', depois: 'mudas de margarida.', certas: ['12', 'doze'] }],
          explica: 'A coluna da margarida chega no 12.' },
        { id: 'ma12a2-04', tipo: 'escolha', origem: 'APR-57-qB', pagina: 57, livro: 'ma-a57', apoio: FLORES,
          pergunta: 'Qual flor teve a maior quantidade de mudas plantadas?',
          opcoes: [
            { t: 'Margarida' },
            { t: 'Rosa' },
            { t: 'Camélia' },
            { t: 'Jasmim' },
          ], certa: 3,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'O jasmim tem a coluna mais alta: 20 mudas.' },
        { id: 'ma12a2-05', tipo: 'varias', origem: 'APR-57-qC', pagina: 57, livro: 'ma-a57', apoio: FLORES,
          pergunta: 'Há flores que tiveram mudas plantadas em quantidades iguais? Quais? Toque em TODAS.',
          opcoes: [
            { t: 'Margarida' },
            { t: 'Rosa', ok: true },
            { t: 'Camélia', ok: true },
            { t: 'Jasmim' },
          ],
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Sim! Rosa e camélia tiveram 18 mudas cada uma: as colunas têm a mesma altura.' },
        { id: 'ma12a2-06', tipo: 'digitar', origem: 'APR-59-qA', pagina: 59, livro: 'ma-a59', avulsa: { carta: 'ma-a58b' }, apoio: ALIMENTOS,
          pergunta: 'Quantos alimentos ultraprocessados Soraia consumiu em uma semana?',
          frases: [{ antes: '', depois: 'alimentos ultraprocessados.', certas: ['4', 'quatro'] }],
          explica: 'A barra laranja da Soraia chega no 4.' },
        { id: 'ma12a2-07', tipo: 'escolha', origem: 'APR-59-qB', pagina: 59, livro: 'ma-a59', avulsa: { carta: 'ma-a58b' }, apoio: ALIMENTOS,
          pergunta: 'Quem consumiu a maior quantidade de alimentos in natura?',
          opcoes: [
            { t: 'Soraia' },
            { t: 'Marcelo' },
            { t: 'Rodrigo' },
            { t: 'Vitória' },
          ], certa: 2,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Rodrigo consumiu 14 alimentos in natura: a barra azul mais comprida.' },
        { id: 'ma12a2-08', tipo: 'escolha', origem: 'APR-59-qC', pagina: 59, livro: 'ma-a59', avulsa: { carta: 'ma-a58b' }, apoio: ALIMENTOS,
          pergunta: 'Quem consumiu a mesma quantidade de alimentos ultraprocessados e in natura?',
          opcoes: [
            { t: 'Soraia' },
            { t: 'Marcelo' },
            { t: 'Rodrigo' },
            { t: 'Vitória' },
          ], certa: 1,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'Marcelo consumiu 10 de cada: as duas barras dele são do mesmo tamanho.' },
      ],
    });
})();
