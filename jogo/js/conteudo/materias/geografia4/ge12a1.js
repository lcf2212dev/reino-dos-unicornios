/* Sala ge12a1 (Livro de Aprendizagem, capítulo 12, pp. 22 e 23): a abertura do capítulo, com a Avenida Tiradentes
   em 1910 e em 2022, o Conversa vai... e o Conversa vem... (docs/contratos/quarto-bimestre.md §3). As perguntas de
   conversa viraram escolha, ligar e verdadeiro ou falso; a opinião (APR-23-qA) e a experiência pessoal (APR-23-qE)
   ficam como leitura na carta da p. 23 (soLeitura). */
Reino.registrarSala('geografia4',
    {
      id: 'ge12a1', nome: 'A avenida mudou', emoji: '🚗',
      livroOrigem: 'aprendizagem', capitulo: 12, paginas: 'pp. 22 a 23', ordem: 'livro',
      cartas: ['ge-a22', 'ge-a23'],
      intro: 'Vamos ver como uma avenida de São Paulo mudou em mais de cem anos!',
      desafios: [
        { id: 'ge12a1-01', tipo: 'escolha', origem: 'APR-22-qA', pagina: 22, livro: 'ge-a22',
          pergunta: 'Que lugar as imagens mostram?',
          opcoes: [
            { t: 'A Avenida Tiradentes, na cidade de São Paulo.' },
            { t: 'A Praia dos Ingleses, em Florianópolis.' },
            { t: 'As Cataratas do Iguaçu, no Paraná.' },
          ], certa: 0,
          adaptacao: 'A conversa da abertura virou escolher a resposta.',
          explica: 'As duas imagens mostram o mesmo lugar: a Avenida Tiradentes, na cidade de São Paulo.' },
        { id: 'ge12a1-02', tipo: 'ligar', origem: 'APR-22-qB', pagina: 22, livro: 'ge-a22',
          pergunta: 'De quando são as imagens? Ligue cada imagem ao seu ano.',
          pares: [
            [{ img: 'ge:12-avenida-antiga', alt: 'imagem A, a avenida de terra com árvores' }, { t: '1910' }],
            [{ img: 'ge:12-avenida-hoje', alt: 'imagem B, a avenida com prédios e carros' }, { t: '2022' }],
          ],
          adaptacao: 'A conversa virou ligar cada imagem ao ano da legenda.',
          explica: 'A imagem A é de 1910 e a imagem B é de 2022. Entre uma e outra passaram 112 anos!' },
        { id: 'ge12a1-03', tipo: 'vfLista', origem: 'APR-22-qC', pagina: 22, livro: 'ge-a22',
          pergunta: 'Quais diferenças é possível perceber entre as duas fotografias? Marque V para o que for verdadeiro e F para o que for falso.',
          itens: [
            { t: 'Em 2022, há muito mais carros na avenida.', v: true },
            { t: 'Em 1910, havia mais árvores na avenida.', v: true },
            { t: 'Em 1910, já havia muitos prédios altos.', v: false },
            { t: 'A foto de 1910 é em preto e branco, e a de 2022 é colorida.', v: true },
          ],
          adaptacao: 'A conversa sobre as diferenças virou frases de verdadeiro ou falso.',
          explica: 'Em 1910 havia árvores, poucas casas baixas e a rua quase vazia. Em 2022 há muitos carros e prédios altos, e quase nenhuma árvore.' },
        { id: 'ge12a1-04', tipo: 'escolha', origem: 'APR-23-qB', pagina: 23, livro: 'ge-a23',
          pergunta: 'Por que a quantidade de carros passando pela avenida aumentou?',
          opcoes: [
            { t: 'Porque a cidade cresceu e mais pessoas passaram a morar nela e a usar carros.' },
            { t: 'Porque choveu muito na avenida.' },
            { t: 'Porque as árvores foram trocadas por carros de brinquedo.' },
          ], certa: 0,
          adaptacao: 'A resposta escrita virou escolher a resposta certa.',
          explica: 'A cidade cresceu! Mais gente foi morar lá, e os carros ficaram mais comuns.' },
        { id: 'ge12a1-05', tipo: 'escolha', origem: 'APR-23-qC', pagina: 23, livro: 'ge-a23',
          pergunta: 'Por que foram construídos mais prédios?',
          opcoes: [
            { t: 'Porque os ventos empurraram as casas para cima.' },
            { t: 'Porque mais pessoas foram morar e trabalhar na cidade e precisavam de moradias, lojas e escritórios.' },
            { t: 'Porque as pessoas não gostavam das árvores.' },
          ], certa: 1,
          adaptacao: 'A resposta escrita virou escolher a resposta certa.',
          explica: 'Com mais gente na cidade, foi preciso construir lugares para morar e trabalhar.' },
        { id: 'ge12a1-06', tipo: 'escrever', origem: 'APR-23-qD', pagina: 23, livro: 'ge-a23',
          pergunta: 'Qual foi a principal mudança observada nas imagens A e B em relação aos elementos da natureza?',
          linhas: 3, minPalavras: 3,
          chaves: [['árvores', 'árvore', 'vegetação', 'mata', 'plantas']],
          modelo: 'As árvores diminuíram muito: quase todas foram retiradas.',
          explica: 'As árvores foram retiradas! Em 1910 havia fileiras de árvores; em 2022 quase não há.' },
      ],
    });
