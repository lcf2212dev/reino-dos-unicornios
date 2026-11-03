/* Sala ci11a3 (Livro de Aprendizagem, capítulo 11, pp. 20 e 21): o Saberes em ação das exsicatas, em quatro etapas
   (docs/contratos/quarto-bimestre.md §3). O experimento é feito em grupo, na escola: a conversa sobre as plantas, a
   etiqueta da exsicata e a conversa da exposição viraram perguntas sobre o que se observa, a parte da planta e a
   ordem dos passos. */
Reino.registrarSala('ciencias4',
    {
      id: 'ci11a3', nome: 'Fazendo exsicatas', emoji: '🍂',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 20 e 21', ordem: 'livro',
      cartas: ['ci-a20', 'ci-a20b', 'ci-a21', 'ci-a21b'],
      intro: 'Vamos aprender a secar e guardar folhas e flores para estudar, como os cientistas fazem!',
      desafios: [
        { id: 'ci11a3-01', tipo: 'varias', origem: 'APR-20-q2', pagina: 20, livro: 'ci-a20',
          pergunta: 'Organizem as plantas sobre uma mesa e observem as partes coletadas. Sobre quais características das plantas o grupo vai conversar? Toque em TODAS.',
          opcoes: [
            { t: 'Os formatos das flores e folhas', ok: true },
            { t: 'Os tamanhos', ok: true },
            { t: 'A textura de suas superfícies', ok: true },
            { t: 'O preço das plantas' },
          ],
          adaptacao: 'A conversa em grupo virou escolher as características que o livro manda observar.',
          explica: 'O grupo observa o formato, o tamanho e a textura. Tem folha lisa, folha áspera, folha larga e folha dividida em partes menores!' },
        { id: 'ci11a3-02', tipo: 'escolha', origem: 'APR-21-q4', pagina: 21, livro: 'ci-a21',
          figura: { img: '🌸' },
          pergunta: 'Com a ajuda do professor, identifiquem as plantas coladas no papel. Depois, escrevam ao lado da exsicata: Parte da planta. Qual é a parte da planta desta exsicata?',
          opcoes: [
            { t: 'Raiz' },
            { t: 'Flor' },
            { t: 'Semente' },
          ], certa: 1,
          adaptacao: 'A etiqueta da exsicata de verdade virou identificar a parte da planta numa figura.',
          explica: 'É uma flor! Na Etapa 2, o grupo escolhe um ramo com folhas e outro com flores.' },
        { id: 'ci11a3-03', tipo: 'ordenar', origem: 'APR-21-q2', pagina: 21, livro: 'ci-a21b',
          pergunta: 'Aproveitem para observar as diferentes plantas coletadas pelos seus colegas e conversar sobre o processo de produção das exsicatas. Coloque os passos na ordem.',
          itens: [
            'Coletar ramos de plantas com folhas e flores.',
            'Colocar os ramos entre folhas de papel, dentro de um livro grosso.',
            'Esperar cerca de uma semana até secarem.',
            'Colar os ramos secos na folha de montagem com fita adesiva.',
            'Escrever o nome da planta e a parte da planta.',
          ],
          adaptacao: 'A conversa sobre a produção das exsicatas virou pôr os passos na ordem.',
          explica: 'Primeiro coletamos, depois prensamos e secamos, colamos na folha e, por fim, escrevemos o nome e a parte da planta.' },
      ],
    });
