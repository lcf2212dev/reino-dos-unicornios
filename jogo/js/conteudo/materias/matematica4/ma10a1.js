/* Sala ma10a1 (Livro de Aprendizagem, capítulo 10, sumário e pp. 3 a 6): a abertura no caixa do mercado, o Conversa
   vai / vem (o total, a cédula e o troco do avô de Murilo), a história do dinheiro e as moedas e cédulas do Real
   (docs/contratos/quarto-bimestre.md §3). As conversas APR-03-qB, APR-03-qC e APR-05-qA são leitura (soLeitura). */
(function () {
  // jeitos de escrever uma quantia inteira em reais: 45, 45,00, R$ 45,00, 45 reais
  function reais(n) { return [n + '', n + ',00', 'R$ ' + n + ',00', 'R$' + n + ',00', 'R$ ' + n, 'R$' + n, n + ' reais']; }
  Reino.registrarSala('matematica4',
    {
      id: 'ma10a1', nome: 'O nosso dinheiro', emoji: '💵',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 2 a 6', ordem: 'livro',
      cartas: ['ma-a02', 'ma-a03', 'ma-a04', 'ma-a05', 'ma-a06', 'ma-a06b'],
      intro: 'Vamos às compras com Murilo e o avô dele e conhecer as moedas e as cédulas do Real!',
      desafios: [
        { id: 'ma10a1-01', tipo: 'escolha', origem: 'APR-03-qA', pagina: 3, livro: 'ma-a03',
          pergunta: 'Por que o cartaz pede aos clientes que tragam moedas?',
          opcoes: [
            { t: 'Para facilitar o troco.' },
            { t: 'Porque as moedas são bonitas.' },
            { t: 'Porque as cédulas acabaram.' },
          ], certa: 0,
          adaptacao: 'A conversa oral virou escolher a resposta.',
          explica: 'Com moedas no caixa, fica fácil devolver o troco certinho para cada cliente.' },
        { id: 'ma10a1-02', tipo: 'digitar', origem: 'APR-04-qA', pagina: 4, livro: 'ma-a04',
          pergunta: 'Qual foi o valor total da compra que eles fizeram?',
          frases: [{ antes: 'A compra custou', depois: '', certas: reais(45) }],
          explica: 'A tela do caixa mostra o total: R$ 45,00.' },
        { id: 'ma10a1-03', tipo: 'escolha', origem: 'APR-04-qB', pagina: 4, livro: 'ma-a04',
          pergunta: 'Qual cédula o avô de Murilo usou para pagar a compra?',
          opcoes: [
            { t: '10 reais', img: 'ma:cedula-10' },
            { t: '20 reais', img: 'ma:cedula-20' },
            { t: '50 reais', img: 'ma:cedula-50' },
            { t: '100 reais', img: 'ma:cedula-100' },
          ], certa: 2,
          adaptacao: 'A conversa oral virou escolher a cédula.',
          explica: 'O avô entregou a cédula de 50 reais, a laranja.' },
        { id: 'ma10a1-04', tipo: 'digitar', origem: 'APR-04-qC', pagina: 4, livro: 'ma-a04',
          pergunta: 'Quantos reais o avô de Murilo deve receber de troco?',
          frases: [{ antes: 'Ele deve receber', depois: 'de troco.', certas: reais(5) }],
          explica: 'Ele pagou 50 e a compra custou 45: 50 - 45 = 5. O troco é de R$ 5,00.' },
        { id: 'ma10a1-05', tipo: 'varias', origem: 'APR-04-qD', pagina: 4, livro: 'ma-a04',
          pergunta: 'Marque um X nas quantias que o avô de Murilo poderia usar para pagar essa compra sem precisar de troco. Há mais de um jeito de conseguir isso.',
          opcoes: [
            { t: '20 reais + 20 reais + 5 reais', ok: true },
            { t: '20 reais + 20 reais + 10 reais' },
            { t: '20 reais + 10 reais + 10 reais + 10 reais' },
            { t: '20 reais + 10 reais + 10 reais + 5 reais', ok: true },
          ],
          explica: '20 + 20 + 5 = 45 e 20 + 10 + 10 + 5 = 45: certinho, sem troco! Os outros dois grupos dão 50 reais.' },
        { id: 'ma10a1-06', tipo: 'escolha', origem: 'APR-06-qA', pagina: 6, livro: 'ma-a06b',
          pergunta: 'Esta caixa de suco custa mais ou menos de 5 reais?',
          opcoes: [
            { t: 'Mais de 5 reais.' },
            { t: 'Menos de 5 reais.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher entre as opções.',
          explica: 'R$ 5,25 é 5 reais e mais 25 centavos. Então custa mais de 5 reais.' },
      ],
    });
})();
