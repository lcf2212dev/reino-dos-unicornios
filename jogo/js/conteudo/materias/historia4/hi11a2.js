/* Sala hi11a2 (Livro de Aprendizagem, capítulo 11, pp. 17 a 19): o Organizando o conhecimento do acendedor de
   lampiões e a leitura das profissões da atualidade (o costureiro) e das profissões novas
   (docs/contratos/quarto-bimestre.md §3). As pp. 18 e 19 são só leitura. */
Reino.registrarSala('historia4',
    {
      id: 'hi11a2', nome: 'Profissões que mudaram', emoji: '🏮',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 17 a 19', ordem: 'livro',
      cartas: ['hi-a17', 'hi-a18', 'hi-a18b', 'hi-a19', 'hi-a19b'],
      intro: 'Algumas profissões sumiram, outras mudaram e outras nasceram agora. Vamos descobrir quais?',
      desafios: [
        { id: 'hi11a2-01', tipo: 'escolha', origem: 'APR-17-q1a', pagina: 17, livro: 'hi-a17',
          figura: { img: '🏮' },
          pergunta: 'Observe a imagem a seguir. a) A profissão mostrada na imagem existe nos dias de hoje?',
          opcoes: [
            { t: 'Sim' },
            { t: 'Não' },
          ], certa: 1,
          explica: 'Não existe mais! O acendedor de lampiões acendia, um por um, os lampiões das ruas.' },
        { id: 'hi11a2-02', tipo: 'escolha', origem: 'APR-17-q1b', pagina: 17, livro: 'hi-a17',
          pergunta: 'b) Qual invenção fez com que esse trabalho deixasse de existir?',
          opcoes: [
            { t: 'Luz elétrica' },
            { t: 'Internet' },
            { t: 'Isqueiro' },
          ], certa: 0,
          explica: 'Foi a luz elétrica: os postes passaram a acender sozinhos, sem ninguém precisar subir neles.' },
        { id: 'hi11a2-03', tipo: 'varias', origem: 'APR-17-q1c', pagina: 17, livro: 'hi-a17',
          pergunta: 'c) Na imagem, a pessoa está usando dois objetos para realizar seu trabalho. Toque nos quadros a seguir que indicam esses objetos.',
          opcoes: [
            { t: 'Escada', ok: true },
            { t: 'Lanterna' },
            { t: 'Mangueira' },
            { t: 'Vara para acender o lampião', ok: true },
          ],
          adaptacao: 'Pintar os quadros virou tocar neles.',
          explica: 'Ele usa a escada, que leva no ombro, e a vara comprida para acender o lampião.' },
      ],
    });
