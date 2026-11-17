/* Sala ma11a4 (Livro de Aprendizagem, capítulo 11, pp. 36 a 38): Metade e terça parte, com as figurinhas de Vítor
   (metade), os lápis de cor de Daniel (dúzia e meia dúzia) e as blusas de Giovana (terça parte)
   (docs/contratos/quarto-bimestre.md §3). Contornar os lápis virou escolher quantos contornar. */
(function () {
  function divisao(a, b, c) {
    return [
      { antes: '', depois: '÷', certas: [a] },
      { antes: '', depois: '=', certas: [b], junto: true },
      { antes: '', depois: '', certas: [c], junto: true },
    ];
  }
  Reino.registrarSala('matematica4',
    {
      id: 'ma11a4', nome: 'Metade, dúzia e terça', emoji: '✏️',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 36 a 38', ordem: 'livro',
      cartas: ['ma-a36', 'ma-a37', 'ma-a38'],
      intro: 'Vamos descobrir a metade, a meia dúzia e a terça parte com figurinhas, lápis e blusas!',
      desafios: [
        { id: 'ma11a4-01', tipo: 'digitar', origem: 'APR-36-qA', pagina: 36, livro: 'ma-a36',
          pergunta: 'Quantas figurinhas repetidas Vítor tem?',
          frases: [{ antes: '', depois: 'figurinhas', certas: ['14', 'catorze', 'quatorze'] }],
          explica: 'São 2 fileiras de 7 figurinhas: 7 + 7 = 14.' },
        { id: 'ma11a4-02', tipo: 'digitar', origem: 'APR-36-qB', pagina: 36, livro: 'ma-a36',
          pergunta: 'Faça a divisão das figurinhas repetidas e complete a frase.',
          frases: [{ antes: 'Vítor deu', depois: 'figurinhas repetidas para Marina.', certas: ['7', 'sete'] }],
          explica: 'A metade de 14 é 7, porque 7 + 7 = 14.' },
        { id: 'ma11a4-03', tipo: 'digitar', origem: 'APR-36-qC', pagina: 36, livro: 'ma-a36',
          pergunta: 'Represente essa situação por meio de uma divisão.',
          frases: divisao('14', '2', '7'),
          explica: 'Dividir por 2 é calcular a metade: 14 ÷ 2 = 7.' },
        { id: 'ma11a4-04', tipo: 'digitar', origem: 'APR-37-qA', pagina: 37, livro: 'ma-a37',
          pergunta: 'Quantos lápis de cor tem nessa caixa?',
          frases: [{ antes: '', depois: 'lápis de cor', certas: ['12', 'doze'] }],
          explica: 'A caixa tem uma dúzia de lápis: 12 unidades.' },
        { id: 'ma11a4-05', tipo: 'escolha', origem: 'APR-37-qB', pagina: 37, livro: 'ma-a37',
          pergunta: 'Quantos lápis a seguir devem ser contornados para indicar a quantidade de lápis que Daniel usou nessa pintura?',
          apoio: { titulo: 'Os lápis de cor', partes: [{ figuras: [
            { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' },
            { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' }, { img: '🖍️' },
          ] }] },
          opcoes: [
            { t: 'Contornar 2 lápis.' },
            { t: 'Contornar 4 lápis.' },
            { t: 'Contornar 6 lápis.' },
            { t: 'Contornar os 12 lápis.' },
          ], certa: 2,
          adaptacao: 'Contornar os lápis na imagem virou escolher quantos lápis contornar.',
          explica: 'Daniel usou meia dúzia, a metade de 12: 6 lápis.' },
        { id: 'ma11a4-06', tipo: 'digitar', origem: 'APR-37-qC', pagina: 37, livro: 'ma-a37',
          pergunta: 'Quantos lápis Daniel usou para pintar o desenho?',
          frases: [{ antes: '', depois: 'lápis', certas: ['6', 'seis'] }],
          explica: 'Meia dúzia são 6 unidades: 12 ÷ 2 = 6.' },
        { id: 'ma11a4-07', tipo: 'digitar', origem: 'APR-38-qA', pagina: 38, livro: 'ma-a38',
          pergunta: 'Quantas blusas Giovana tem ao todo?',
          frases: [{ antes: '', depois: 'blusas', certas: ['12', 'doze'] }],
          explica: 'São 3 fileiras de 4 blusas: 4 + 4 + 4 = 12.' },
        { id: 'ma11a4-08', tipo: 'digitar', origem: 'APR-38-qB', pagina: 38, livro: 'ma-a38',
          pergunta: 'Faça a divisão das blusas e complete a frase.',
          frases: [{ antes: 'Giovana colocará na mala', depois: 'blusas.', certas: ['4', 'quatro'] }],
          explica: 'A terça parte de 12 é 4, porque 4 + 4 + 4 = 12.' },
        { id: 'ma11a4-09', tipo: 'digitar', origem: 'APR-38-qC', pagina: 38, livro: 'ma-a38',
          pergunta: 'Represente essa situação por meio de uma divisão.',
          frases: divisao('12', '3', '4'),
          explica: 'Dividir por 3 é calcular a terça parte: 12 ÷ 3 = 4.' },
      ],
    });
})();
