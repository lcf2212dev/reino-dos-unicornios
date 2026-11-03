/* Sala ma10a3 (Livro de Aprendizagem, capítulo 10, pp. 13 a 15): Problemas envolvendo o nosso dinheiro, com o
   cofrinho de Isabela, a boneca e o dobro do lanche de Ana (docs/contratos/quarto-bimestre.md §3). A conta no quadro
   e a frase com lacuna viraram digitar a quantia; colar as cédulas da aba (p. 15, recortada) também. */
(function () {
  function reais(n) { return [n + '', n + ',00', 'R$ ' + n + ',00', 'R$' + n + ',00', 'R$ ' + n, 'R$' + n, n + ' reais']; }
  Reino.registrarSala('matematica4',
    {
      id: 'ma10a3', nome: 'Poupar no cofrinho', emoji: '🐷',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 13 a 15', ordem: 'livro',
      cartas: ['ma-a13', 'ma-a14', 'ma-a15'],
      intro: 'Vamos ajudar Isabela a contar o dinheiro do cofrinho e a fazer as contas das compras!',
      desafios: [
        { id: 'ma10a3-01', tipo: 'digitar', origem: 'APR-13-qA', pagina: 13, livro: 'ma-a13',
          pergunta: 'Quantos reais Isabela guardou? Resolva usando a estratégia que preferir.',
          frases: [{ antes: 'Isabela guardou', depois: 'no cofrinho.', certas: reais(181) }],
          explica: '100 + 50 + 20 + 5 + 2 + 2 + 2 = 181. Isabela guardou R$ 181,00.' },
        { id: 'ma10a3-02', tipo: 'digitar', origem: 'APR-14-qA', pagina: 14, livro: 'ma-a14',
          pergunta: 'Quantos reais vão sobrar para Isabela depois que ela pagar pela boneca? Resolva essa subtração usando a estratégia que preferir.',
          frases: [{ antes: 'Vão sobrar', depois: 'para Isabela depois da compra da boneca.', certas: reais(112) }],
          explica: '181 - 69 = 112. Vão sobrar R$ 112,00 para Isabela.' },
        { id: 'ma10a3-03', tipo: 'digitar', origem: 'APR-15-qA', pagina: 15, livro: 'ma-a15',
          pergunta: 'Quantos reais Ana gastou na cantina?',
          frases: [{ antes: 'Ana gastou', depois: 'na cantina.', certas: reais(30) }],
          adaptacao: 'Recortar e colar as cédulas da aba virou digitar a quantia.',
          explica: 'O dobro de 15 é 15 + 15 = 30. Ana gastou R$ 30,00.' },
        { id: 'ma10a3-04', tipo: 'escolha', origem: 'APR-15-qB', pagina: 15, livro: 'ma-a15',
          pergunta: 'Como podemos representar o dobro de R$ 15,00 usando uma adição?',
          opcoes: [
            { t: '15 + 15 = 30' },
            { t: '15 + 2 = 17' },
            { t: '15 + 30 = 45' },
            { t: '15 - 15 = 0' },
          ], certa: 0,
          adaptacao: 'Escrever a adição na linha virou escolher a adição certa.',
          explica: 'O dobro é a mesma quantia duas vezes: 15 + 15 = 30, igual a 2 × 15.' },
      ],
    });
})();
