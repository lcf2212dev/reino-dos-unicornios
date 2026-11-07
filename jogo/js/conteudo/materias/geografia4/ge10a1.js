/* Sala ge10a1 (Livro de Aprendizagem, capítulo 10, sumário e pp. 3 a 5): a abertura do capítulo com o Conversa vai
   e o Conversa vem (os objetos da brincadeira e o material de cada um) e o que são matérias-primas, com o lápis
   (docs/contratos/quarto-bimestre.md §3). A p. 5 é só leitura. As ligações e a palavra escritas à mão na p. 4 são da
   Mariana: o gabarito vem do livro (a folha de papel é feita de celulose, da madeira: p. 7). */
Reino.registrarSala('geografia4',
    {
      id: 'ge10a1', nome: 'De onde vêm as coisas?', emoji: '🪵',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 3 a 5', ordem: 'livro',
      cartas: ['ge-a00', 'ge-a03', 'ge-a04', 'ge-a05', 'ge-a05b', 'ge-a05c'],
      intro: 'Vamos descobrir de que são feitos os brinquedos e o lápis. Tudo começa na natureza!',
      desafios: [
        { id: 'ge10a1-01', tipo: 'varias', origem: 'APR-03-qA', pagina: 3, livro: 'ge-a03',
          pergunta: 'Quais objetos fazem parte da brincadeira das crianças da imagem? Toque em TODOS.',
          opcoes: [
            { t: 'avião de brinquedo', img: '✈️', ok: true },
            { t: 'bola', img: '⚽' },
            { t: 'blocos de montar', img: 'ge:10-blocos', ok: true },
            { t: 'lápis', img: '✏️', ok: true },
            { t: 'ursinho de pelúcia', img: '🧸' },
            { t: 'folha de papel', img: '📄', ok: true },
          ],
          adaptacao: 'A conversa oral virou tocar nos objetos que aparecem na imagem.',
          explica: 'As crianças brincam com o avião de brinquedo, os blocos de montar, o lápis e a folha de papel.' },
        { id: 'ge10a1-02', tipo: 'escolha', origem: 'APR-03-qB', pagina: 3, livro: 'ge-a03',
          pergunta: 'Os objetos presentes na imagem não são todos iguais. O que há de diferente entre eles?',
          opcoes: [
            { t: 'Eles são feitos de materiais diferentes.' },
            { t: 'Todos são feitos do mesmo material.' },
            { t: 'Todos têm a mesma cor.' },
          ], certa: 0,
          adaptacao: 'A conversa oral virou escolher a resposta.',
          explica: 'Cada objeto é feito de um material: madeira, plástico, grafite, papel. Eles também têm cores, formas e tamanhos diferentes.' },
        { id: 'ge10a1-03', tipo: 'ligar', origem: 'APR-04-qA', pagina: 4, livro: 'ge-a04', avulsa: { carta: 'ge-a03' },
          pergunta: 'Observe novamente alguns dos objetos usados pelas crianças na página anterior. Em seguida, ligue cada um deles ao material que você acredita que foi usado para produzi-lo.',
          pares: [
            [{ img: '✈️', alt: 'avião de brinquedo' }, { t: 'MADEIRA' }],
            [{ img: 'ge:10-blocos', alt: 'blocos de montar' }, { t: 'PLÁSTICO' }],
            [{ img: '✏️', alt: 'lápis' }, { t: 'MADEIRA E GRAFITE' }],
          ],
          explica: 'O avião de brinquedo é de madeira, os blocos de montar são de plástico e o lápis é de madeira e grafite.' },
        { id: 'ge10a1-04', tipo: 'escrever', origem: 'APR-04-qB', pagina: 4, livro: 'ge-a04', avulsa: { carta: 'ge-a03' },
          pergunta: 'E a folha de papel? De qual material você imagina que ela seja feita? Escreva sua ideia.',
          linhas: 2, chaves: [['madeira', 'madeiras', 'árvore', 'árvores', 'celulose', 'tronco', 'troncos']],
          modelo: 'A folha de papel é feita de madeira, que vem das árvores.',
          adaptacao: 'A conversa com o professor e os colegas ficou de fora: só a escrita da ideia.',
          explica: 'O papel é feito de madeira! Das árvores se tira a celulose, que vira papel. Você vai ver isso na página 7.' },
      ],
    });
