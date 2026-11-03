/* Sala ma10a6 (Livro de Aprendizagem, capítulo 10, pp. 23 a 25): Testando as ideias q4 a q8 (compras, troco, o
   parque e os balões de Alice) e o Agora você já sabe (docs/contratos/quarto-bimestre.md §3). A conta no quadro e a
   frase com lacuna viraram digitar a quantia; desenhar a cédula (q5) virou escolher. Na q7 o livro escreve "Quanto
   reais"; aqui fica "Quantos reais", como pede o INVENTARIO.md. A autoavaliação APR-25-qA é leitura (soLeitura). */
(function () {
  function reais(n) { return [n + '', n + ',00', 'R$ ' + n + ',00', 'R$' + n + ',00', 'R$ ' + n, 'R$' + n, n + ' reais']; }
  Reino.registrarSala('matematica4',
    {
      id: 'ma10a6', nome: 'Compras e troco', emoji: '🎈',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 23 a 25', ordem: 'livro',
      cartas: ['ma-a23', 'ma-a24', 'ma-a25'],
      intro: 'Vamos às compras, calcular o troco e preparar a festa de Alice!',
      desafios: [
        { id: 'ma10a6-01', tipo: 'digitar', origem: 'APR-23-q4a', pagina: 23, livro: 'ma-a23',
          pergunta: 'a) Quantos reais Fábio e a avó gastaram nessas duas compras?',
          frases: [{ antes: 'Fábio e a avó gastaram', depois: 'nessas duas compras.', certas: reais(112) }],
          explica: '23 + 89 = 112. Eles gastaram R$ 112,00.' },
        { id: 'ma10a6-02', tipo: 'digitar', origem: 'APR-23-q4b', pagina: 23, livro: 'ma-a23',
          pergunta: 'b) A avó de Fábio tinha R$ 150,00 na carteira antes das compras. Quantos reais ela tem agora, depois do que gastou na padaria e na farmácia?',
          frases: [{ antes: 'A avó de Fábio tem', depois: 'agora.', certas: reais(38) }],
          explica: 'Ela gastou 112. 150 - 112 = 38. Agora ela tem R$ 38,00.' },
        { id: 'ma10a6-03', tipo: 'escolha', origem: 'APR-23-q5', pagina: 23, livro: 'ma-a23',
          pergunta: 'Qual cédula Patrícia usou para pagar pelos pacotes de figurinhas? Faça o cálculo para descobrir.',
          opcoes: [
            { t: '20 reais', img: 'ma:cedula-20' },
            { t: '50 reais', img: 'ma:cedula-50' },
            { t: '100 reais', img: 'ma:cedula-100' },
            { t: '200 reais', img: 'ma:cedula-200' },
          ], certa: 1,
          adaptacao: 'Desenhar a cédula da resposta virou escolher a cédula.',
          explica: 'As figurinhas custaram 24 e o troco foi 26: 24 + 26 = 50. Ela pagou com a cédula de 50 reais.' },
        { id: 'ma10a6-04', tipo: 'digitar', origem: 'APR-24-q6a', pagina: 24, livro: 'ma-a24',
          pergunta: 'a) Quantos reais a tia de Sara gastou nessa compra?',
          frases: [{ antes: 'A tia de Sara gastou', depois: 'nessa compra.', certas: reais(215) }],
          explica: 'Blusa e saia: 90 + 125 = 215. Ela gastou R$ 215,00.' },
        { id: 'ma10a6-05', tipo: 'digitar', origem: 'APR-24-q6b', pagina: 24, livro: 'ma-a24',
          pergunta: 'b) Quantos reais ela recebeu de troco?',
          frases: [{ antes: 'Ela recebeu', depois: 'de troco.', certas: reais(35) }],
          explica: 'Ela pagou com 200 + 50 = 250. 250 - 215 = 35. O troco foi de R$ 35,00.' },
        { id: 'ma10a6-06', tipo: 'digitar', origem: 'APR-24-q7', pagina: 24, livro: 'ma-a24',
          pergunta: 'Elas compraram 2 baldes de pipoca e 2 algodões doces. Quantos reais elas gastaram?',
          frases: [{ antes: 'Elas gastaram', depois: '', certas: reais(26) }],
          explica: 'Pipoca: 5 + 5 = 10. Algodão-doce: 8 + 8 = 16. 10 + 16 = 26. Elas gastaram R$ 26,00.' },
        { id: 'ma10a6-07', tipo: 'escolha', origem: 'APR-25-q8a', pagina: 25, livro: 'ma-a25',
          pergunta: 'a) Alice tem dinheiro suficiente para fazer essa compra?',
          opcoes: [
            { t: 'Sim.' },
            { t: 'Não.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita nas linhas virou escolher Sim ou Não.',
          explica: '3 pacotes de 8 reais: 8 + 8 + 8 = 24. Como 24 é menos que 30, o dinheiro dá!' },
        { id: 'ma10a6-08', tipo: 'digitar', origem: 'APR-25-q8b', pagina: 25, livro: 'ma-a25',
          pergunta: 'b) Se Alice fizer essa compra, ela receberá troco? Se sim, de quantos reais?',
          frases: [{ antes: 'Alice vai receber', depois: 'de troco.', certas: reais(6) }],
          explica: 'Sim! 30 - 24 = 6. Alice recebe R$ 6,00 de troco.' },
      ],
    });
})();
