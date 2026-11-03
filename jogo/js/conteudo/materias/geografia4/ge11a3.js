/* Sala ge11a3 (Livro de Aprendizagem, capítulo 11, pp. 16 e 19): diversidade das paisagens brasileiras e as
   paisagens das cidades (docs/contratos/quarto-bimestre.md §3). As pp. 17 e 18 não estão no PDF: ficam fora do
   inventário e do jogo. As duas conversas viram separar e ordenar; a resposta escrita da p. 19 continua escrita. */
Reino.registrarSala('geografia4',
    {
      id: 'ge11a3', nome: 'Paisagens do Brasil', emoji: '🌵',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 16 e 19', ordem: 'livro',
      cartas: ['ge-a16', 'ge-a19'],
      intro: 'O Brasil tem paisagens secas, molhadas, cheias de prédios ou de árvores. Vamos conhecer algumas!',
      desafios: [
        { id: 'ge11a3-01', tipo: 'separar', origem: 'APR-16-qA', pagina: 16, livro: 'ge-a16',
          pergunta: 'Que palavras você usaria para descrevê-las? Leve cada palavra para a paisagem certa.',
          grupos: [{ e: '🌵', t: 'Santa Luzia, Paraíba' }, { e: '💧', t: 'Corumbá, Mato Grosso do Sul' }],
          itens: [
            { t: 'cactos', g: 0 },
            { t: 'água', g: 1 },
            { t: 'espinhos', g: 0 },
            { t: 'lagoas', g: 1 },
            { t: 'seca', g: 0 },
            { t: 'alagada', g: 1 },
          ],
          adaptacao: 'A conversa virou levar cada palavra para a sua paisagem; a pergunta "Você já viu lugares assim antes?" fica para conversar.',
          explica: 'Santa Luzia é seca, com cactos e espinhos. Corumbá é alagada, com muita água e lagoas.' },
        { id: 'ge11a3-02', tipo: 'ordenar', origem: 'APR-19-qA', pagina: 19, livro: 'ge-a19',
          pergunta: 'A quantidade de elementos culturais em São Paulo, Caruaru e Itamogi é igual? Coloque as cidades em ordem: da que tem mais elementos culturais para a que tem menos.',
          itens: [
            'São Paulo, a maior cidade do Brasil',
            'Caruaru, uma cidade de tamanho médio',
            'Itamogi, uma pequena cidade',
          ],
          adaptacao: 'A conversa virou colocar as três cidades em ordem.',
          explica: 'Não é igual! São Paulo tem muitos prédios e ruas. Caruaru tem menos. Itamogi tem casas baixas e muitas árvores.' },
        { id: 'ge11a3-03', tipo: 'escrever', origem: 'APR-19-qB', pagina: 19, livro: 'ge-a19',
          pergunta: 'Alguma dessas paisagens é natural? Há paisagens culturais ou mistas? Registre os principais elementos observados nessas paisagens.',
          linhas: 3, minPalavras: 5,
          chaves: [['cultural', 'culturais', 'mista', 'mistas'],
            ['prédio', 'prédios', 'casa', 'casas', 'rua', 'ruas', 'avenida', 'viaduto', 'igreja', 'árvore', 'árvores', 'construção', 'construções']],
          modelo: 'Nenhuma é natural. São Paulo e Caruaru são culturais, com prédios, ruas e um viaduto. Itamogi é mista, com casas, uma igreja e muitas árvores.',
          explica: 'Nenhuma é natural: todas têm construções. São Paulo tem muitos prédios. Itamogi mistura casas e muitas árvores.' },
      ],
    });
