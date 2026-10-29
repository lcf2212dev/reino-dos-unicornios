/* Sala en10e1 (English, capítulo 10, pp. 122 a 125): a abertura com o Let's talk, os objetivos, a canção
   "How do you feel today?" com o glossário e o Match the pictures with the sentences (docs/contratos/quarto-bimestre.md §3).
   O Let's talk é só conversa (soLeitura na carta en-e122); a canção vira perguntas de compreensão (ENG-124-q1a a q1d). */
Reino.registrarSala('ingles4',
    {
      id: 'en10e1', nome: '«How Do You Feel Today?»', emoji: '😄',
      livroOrigem: 'english', capitulo: 10, paginas: 'pp. 122 a 125', ordem: 'livro',
      cartas: ['en-e122', 'en-e123', 'en-e124', 'en-e125'],
      intro: 'Vamos cantar e aprender os sentimentos em inglês! «If you\'re happy, clap your hands!»',
      desafios: [
        { id: 'en10e1-01', tipo: 'escolha', origem: 'ENG-124-q1a', pagina: 124, livro: 'en-e124',
          adaptacao: 'Cantar com o áudio do livro virou ler a letra na carta e responder sobre ela.',
          pergunta: '«If you\'re happy, if you\'re happy, clap your hands!» Na canção, quando a gente bate palmas?',
          opcoes: [
            { t: 'Quando está feliz, «happy».' },
            { t: 'Quando está triste, «sad».' },
            { t: 'Quando está com sono, «sleepy».' },
          ], certa: 0,
          explica: '«Happy» é feliz! Quando estamos felizes, batemos palmas: «clap your hands»!' },
        { id: 'en10e1-02', tipo: 'escolha', origem: 'ENG-124-q1b', pagina: 124, livro: 'en-e124',
          pergunta: '«If you\'re sleepy, if you\'re sleepy...» O que a canção manda fazer?',
          opcoes: [
            { t: '«Clap your hands!»' },
            { t: '«Stamp your foot!»' },
          ], certa: 1,
          explica: 'Com sono, «sleepy», a canção manda bater o pé: «stamp your foot»!' },
        { id: 'en10e1-03', tipo: 'vf', origem: 'ENG-124-q1c', pagina: 124, livro: 'en-e124',
          afirmacao: '«Today he\'s sleepy.» Hoje o menino da canção está com sono, e não está bravo.',
          certo: true,
          explica: 'Isso! «He\'s sleepy»: ele está com sono. «He\'s not angry»: ele não está bravo.' },
        { id: 'en10e1-04', tipo: 'escolha', origem: 'ENG-124-q1d', pagina: 124, livro: 'en-e124',
          pergunta: 'No glossário: o que quer dizer «stamp your foot»?',
          opcoes: [
            { t: 'Bater o pé no chão.', img: '🦶' },
            { t: 'Bater palmas.', img: '👏' },
            { t: 'Ir dormir.', img: '😴' },
          ], certa: 0,
          explica: '«Stamp your foot» é bater o pé no chão. «Foot» é pé!' },
        { id: 'en10e1-05', tipo: 'ligar', origem: 'ENG-125-q2', pagina: 125, livro: 'en-e125',
          pergunta: '«Match the pictures with the sentences.» Ligue cada carinha à frase certa.',
          pares: [
            [{ img: 'sentimento:angry', alt: 'menina brava' }, { t: '«She\'s angry.»' }],
            [{ img: 'sentimento:bored', alt: 'menino entediado' }, { t: '«He\'s bored.»' }],
            [{ img: 'sentimento:sleepy', alt: 'menina com sono' }, { t: '«She\'s sleepy.»' }],
            [{ img: 'sentimento:excited', alt: 'menino animado' }, { t: '«He\'s excited.»' }],
          ],
          explica: '«Angry»: bravo. «Bored»: entediado. «Sleepy»: com sono. «Excited»: animado!' },
      ],
    });
