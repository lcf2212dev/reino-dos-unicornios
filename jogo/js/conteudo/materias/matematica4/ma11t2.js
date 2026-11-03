/* Sala ma11t2 (Livro de Atividades, capítulo 11, pp. 9 e 10): Metade e terça parte. Os «cupcakes» de Larissa, as
   maçãs do amor de Manoel, o quadro das bolinhas de tênis e a cantina de Ricardo (docs/contratos/quarto-bimestre.md §3).
   Os doces são as ilustrações ma-t09-* (icones-t.js). */
(function () {
  function divisao(a, b, c) {
    return [
      { antes: '', depois: '÷', certas: [String(a)] },
      { antes: '', depois: '=', certas: [String(b)], junto: true },
      { antes: '', depois: '', certas: [String(c)], junto: true },
    ];
  }

  Reino.registrarSala('matematica4',
    {
      id: 'ma11t2', nome: 'Metade e terça parte', emoji: '🍰',
      livroOrigem: 'atividades', capitulo: 11, paginas: 'pp. 9 a 10', ordem: 'livro',
      cartas: ['ma-t09', 'ma-t10'],
      intro: 'Vamos achar a metade e a terça parte de doces, bolinhas e dinheiro!',
      desafios: [
        { id: 'ma11t2-01', tipo: 'digitar', origem: 'ATI-09-q1', pagina: 9, livro: 'ma-t09',
          figura: { ilustracao: 'ma-t09-cupcakes', alt: '8 «cupcakes» de cobertura rosa, em duas fileiras de 4.' },
          pergunta: 'A mãe de Larissa fez estes «cupcakes» para o lanche da tarde. Apenas a metade da quantidade de «cupcakes» foi comida no lanche. Que divisão representa essa situação?',
          frases: divisao(8, 2, 4),
          explica: 'Metade é dividir por 2: 8 ÷ 2 = 4. Foram comidos 4 «cupcakes».' },
        { id: 'ma11t2-02', tipo: 'digitar', origem: 'ATI-09-q2', pagina: 9, livro: 'ma-t09',
          figura: { ilustracao: 'ma-t09-macas', alt: '21 maçãs do amor no palito, em três fileiras de 7.' },
          pergunta: 'Observe a quantidade de maçãs do amor que Manoel estava vendendo no parque. Manoel vendeu a terça parte dessa quantidade de maçãs do amor pela manhã. Que divisão representa essa situação?',
          frases: divisao(21, 3, 7),
          explica: 'Terça parte é dividir por 3: 21 ÷ 3 = 7. Manoel vendeu 7 maçãs do amor pela manhã.' },
        { id: 'ma11t2-03', tipo: 'tabela', origem: 'ATI-10-q3', pagina: 10, livro: 'ma-t10',
          pergunta: 'Descubra a metade e a terça parte de cada quantidade de bolinhas de tênis. Depois, complete o quadro com as informações que faltam.',
          cab: ['Quantidade de bolas', 'Metade', 'Terça parte'],
          linhas: [
            ['6', { certas: ['3'] }, { certas: ['2'] }],
            ['12', { certas: ['6'] }, { certas: ['4'] }],
            ['24', { certas: ['12'] }, { certas: ['8'] }],
          ],
          adaptacao: 'As bolinhas de tênis desenhadas em cada linha viraram o número de bolinhas.',
          explica: '6: metade 3, terça parte 2. 12: metade 6, terça parte 4. 24: metade 12, terça parte 8.' },
        { id: 'ma11t2-04', tipo: 'escolha', origem: 'ATI-10-q4', pagina: 10, livro: 'ma-t10',
          apoio: { titulo: 'Na carteira de Ricardo', partes: [{ figuras: [
            { img: 'ma:cedula-10', legenda: '10 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' },
          ] }] },
          pergunta: 'Ricardo tinha a quantia representada abaixo na carteira e gastou a metade na cantina da escola. Quantos reais Ricardo gastou na cantina?',
          opcoes: [
            { t: 'R$ 28,00' },
            { t: 'R$ 14,00' },
            { t: 'R$ 7,00' },
            { t: 'R$ 4,00' },
          ], certa: 2,
          explica: 'Ricardo tinha 10 + 2 + 2 = 14 reais. A metade de 14 é 7: ele gastou R$ 7,00.' },
      ],
    });
})();
