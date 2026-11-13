/* Sala ge10a2 (Livro de Aprendizagem, capítulo 10, pp. 6 a 9): o extrativismo (vegetal, animal e mineral), de onde
   vem a folha de papel, o Organizando o conhecimento e o Saberes em ação (docs/contratos/quarto-bimestre.md §3).
   As pp. 6 e 7 são só leitura. A investigação dos 10 objetos (p. 9) é escolhida pelo professor: no jogo, objetos fixos
   do próprio capítulo. Os quadrados pintados e a tabela escritos à mão são da Mariana, nunca gabarito. */
Reino.registrarSala('geografia4',
    {
      id: 'ge10a2', nome: 'Extrativismo e o papel', emoji: '🌳',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 6 a 9', ordem: 'livro',
      cartas: ['ge-a06', 'ge-a06b', 'ge-a06c', 'ge-a07', 'ge-a07b', 'ge-a08', 'ge-a09'],
      intro: 'Vamos ver como as pessoas tiram da natureza o que precisam, e como a árvore vira papel!',
      desafios: [
        { id: 'ge10a2-01', tipo: 'marcar', origem: 'APR-08-q1', pagina: 8, livro: 'ge-a08', marca: 'pintar',
          pergunta: 'Observe as imagens e classifique-as de acordo com a origem de cada matéria-prima. Para isso, pinte usando as cores da legenda a seguir.',
          cores: [{ nome: 'Extrativismo vegetal', cor: '#3f7cff' }, { nome: 'Extrativismo animal', cor: '#ffd34d' }, { nome: 'Extrativismo mineral', cor: '#ff4f5e' }],
          texto: '{Grafite em estado bruto|2}\n{Peixe da rede de pesca|1}\n{Toras de madeira|0}\n{Frutos de açaí|0}',
          adaptacao: 'Pintar o quadrado de cada foto virou pintar o nome da foto (nos nomes de várias palavras, todas elas).',
          explica: 'O grafite vem das rochas: extrativismo mineral (vermelho). O peixe vem de um animal: extrativismo animal (amarelo). A madeira e o açaí vêm das plantas: extrativismo vegetal (azul).' },
        { id: 'ge10a2-02', tipo: 'tabela', origem: 'APR-09-q1', pagina: 9, livro: 'ge-a09',
          pergunta: 'Agora, você vai investigar alguns objetos. Escolha a principal matéria-prima utilizada na produção de cada um.',
          cab: ['Nome do objeto', 'Principal matéria-prima'],
          banco: ['madeira e grafite', 'celulose', 'látex', 'madeira', 'ferro'],
          linhas: [
            ['lápis', { certa: 0 }],
            ['folha de papel', { certa: 1 }],
            ['borracha escolar', { certa: 2 }],
            ['mesa de madeira', { certa: 3 }],
            ['prego', { certa: 4 }],
          ],
          adaptacao: 'Os 10 objetos escolhidos pelo professor viraram 5 objetos do capítulo, com as matérias-primas num banco de palavras.',
          explica: 'O lápis é de madeira e grafite. O papel vem da celulose. A borracha, do látex. A mesa é de madeira. E o prego é de ferro.' },
        { id: 'ge10a2-03', tipo: 'escrever', origem: 'APR-09-q2', pagina: 9, livro: 'ge-a09',
          apoio: { titulo: 'Os objetos investigados', partes: [{ texto: 'Lápis: madeira e grafite. Folha de papel: celulose. Borracha escolar: látex. Mesa de madeira: madeira. Prego: ferro.' }] },
          pergunta: 'Qual matéria-prima chamou mais a sua atenção entre os objetos investigados? Explique sua resposta.',
          linhas: 3, minPalavras: 4,
          chaves: [['madeira', 'grafite', 'celulose', 'látex', 'latex', 'ferro', 'alumínio', 'aluminio', 'metal', 'borracha', 'papel', 'árvore', 'árvores', 'rocha', 'rochas']],
          modelo: 'O látex, porque ele sai do tronco de uma árvore e vira borracha.',
          explica: 'Que legal! Cada matéria-prima vem da natureza e vira um objeto diferente.' },
      ],
    });
