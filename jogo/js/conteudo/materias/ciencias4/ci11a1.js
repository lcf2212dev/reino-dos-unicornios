/* Sala ci11a1 (Livro de Aprendizagem, capítulo 11, pp. 13 a 15): a abertura do capítulo com o Conversa vai e vem
   (as partes do corpo e de outros seres vivos) e o texto Raiz, caule e folhas (docs/contratos/quarto-bimestre.md §3).
   A 1ª pergunta do Conversa vai é só conversa (soLeitura na carta ci-a13); os desenhos da p. 14 vão para a prancheta. */
Reino.registrarSala('ciencias4',
    {
      id: 'ci11a1', nome: 'Raiz, caule e folhas', emoji: '🥕',
      livroOrigem: 'aprendizagem', capitulo: 11, paginas: 'pp. 13 a 15', ordem: 'livro',
      cartas: ['ci-a13', 'ci-a14', 'ci-a15', 'ci-a15b'],
      intro: 'Nosso corpo tem partes, e as plantas também! Vamos conhecer a raiz, o caule e as folhas?',
      desafios: [
        { id: 'ci11a1-01', tipo: 'varias', origem: 'APR-13-qB', pagina: 13, livro: 'ci-a13',
          pergunta: 'Que outros seres vivos podem ter o corpo estudado em partes? Toque em TODOS.',
          opcoes: [
            { img: '🌱', t: 'Plantas', ok: true },
            { img: '🐝', t: 'Animais', ok: true },
            { img: '🪨', t: 'Pedras' },
            { img: '🧸', t: 'Brinquedos' },
          ],
          adaptacao: 'A pergunta de conversa virou escolher os seres vivos entre opções.',
          explica: 'Os animais e as plantas são seres vivos e têm partes! A planta tem raiz, caule, folhas, flores e frutos. Pedras e brinquedos não são seres vivos.' },
        { id: 'ci11a1-02', tipo: 'desenho', origem: 'APR-14-qA', pagina: 14, livro: 'ci-a14', guardar: true,
          pergunta: 'Faça um desenho simples do seu corpo. Com o lápis de cor, circule uma parte do seu corpo. Comente com a turma qual é a função da parte destacada.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O quadro do livro virou a prancheta de desenho; o comentário com a turma fica para uma conversa em casa.',
          explica: 'Que desenho lindo! Cada parte do corpo tem uma função: as pernas servem para andar, e os olhos, para ver.' },
        { id: 'ci11a1-03', tipo: 'desenho', origem: 'APR-14-qB', pagina: 14, livro: 'ci-a14', guardar: true,
          pergunta: 'Faça um desenho de outro ser vivo (um animal ou uma planta). De maneira semelhante, circule uma parte do corpo desse ser vivo e comente com a turma qual é a função da parte destacada.',
          requisitos: ['formas', 'cores'],
          adaptacao: 'O quadro do livro virou a prancheta de desenho; o comentário com a turma fica para uma conversa em casa.',
          explica: 'Muito bem! A raiz da planta absorve água, e as asas do passarinho servem para voar.' },
      ],
    });
