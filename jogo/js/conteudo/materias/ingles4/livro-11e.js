/* Cartas do English, Capítulo 11 «I Dance When I'm Happy!» (pp. 134 a 147), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Texto do livro em caixa normal, entre «» (a voz inglesa lê só esse
   pedaço); uma linha curta em português ajuda. O que a Mariana escreveu à mão no livro não entra. */
(function () {
  var L = 'english', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  Reino.registrarCartas('ingles4', [
    // abertura e objetivos (pp. 134 e 135)
    carta('en-e134', '💃', 'Capítulo 11 – «I Dance When I\'m Happy!»', 134, [
      { t: 'texto', texto: 'Uma menina e a mãe dançam juntas na sala, com um sorrisão.' },
      { t: 'quadro', titulo: '«Let\'s talk»', itens: [
        { texto: '«How do you feel when you dance?»' },
        { texto: '«When do you smile?»' },
      ] },
      { t: 'texto', texto: 'Converse com alguém: como você se sente quando dança? Quando você sorri?' },
    ], ['ENG-134-qA', 'ENG-134-qB']),
    carta('en-e135', '😄', '«In this chapter you will...»', 135, [
      { t: 'texto', texto: 'Uma menina ri muito, voando alto no balanço.' },
      { t: 'lista', itens: [
        { texto: '«Talk about feelings and actions.»' },
        { texto: '«Say how you feel in different situations.»' },
      ] },
      { t: 'texto', texto: 'Neste capítulo, você vai falar de sentimentos e do que você faz quando sente cada um.' },
    ]),

    // a história em quadrinhos, o glossário e o perfil (pp. 136 e 137)
    carta('en-e136', '🐶', '«A Happy Day»', 136, [
      { t: 'texto', texto: '«Activities.» «Look and think.» «Story time.»' },
      { t: 'texto', texto: 'No abrigo, vários cachorros esperam uma família. Um cachorrinho está tristinho.' },
      { t: 'fala', quem: 'A veterinária', texto: '«Don\'t be sad, Pingo.»' },
      { t: 'texto', texto: 'Uma menina de óculos chega com o pai e vê o cachorrinho.' },
      { t: 'fala', quem: 'A menina', texto: '«What\'s his name?»' },
      { t: 'fala', quem: 'A veterinária', texto: '«Pingo!»' },
      { t: 'fala', quem: 'A menina', texto: '«Bingo?»' },
      { t: 'fala', quem: 'A veterinária', texto: '«No, Pingo. P-I-N-G-O.»' },
      { t: 'fala', quem: 'A menina', texto: '«Pingo, I dance when I\'m happy.»' },
      { t: 'fala', quem: 'Pingo', texto: '«Woof, woof!»' },
    ]),
    carta('en-e137', '🐾', '«Glossary» e «Profile»', 137, [
      { t: 'lista', itens: [
        { termo: '«Puppy»', texto: 'filhote de cachorro.' },
        { termo: '«Vet»', texto: 'veterinária, a doutora dos bichos.' },
        { termo: '«Animal shelter»', texto: 'abrigo de animais, onde eles esperam uma família.' },
      ] },
      { t: 'texto', texto: '«Draw the dog Renata adopts.» Desenhe o cachorro que a Renata adota.' },
      { t: 'quadro', titulo: '«Profile»', texto: '«Luisa Mell has an institute that helps animals.»' },
      { t: 'texto', texto: 'A Luisa Mell tem um instituto que ajuda os animais.' },
    ]),

    // o que eu faço quando sinto... (pp. 138 a 141)
    carta('en-e138', '🦶', '«Look, read and match.»', 138, [
      { t: 'texto', texto: 'Cinco fotos de crianças e cinco ações em inglês:' },
      { t: 'lista', itens: [
        { termo: '«Cry»', texto: 'chorar.' },
        { termo: '«Stamp my foot»', texto: 'bater o pé.' },
        { termo: '«Jump»', texto: 'pular.' },
        { termo: '«Sleep»', texto: 'dormir.' },
        { termo: '«Dance»', texto: 'dançar.' },
      ] },
      { t: 'quadro', titulo: '«Rewind»', texto: '«You learnt how to name feelings in chapter 10.»' },
    ]),
    carta('en-e139', '💬', '«Read and write.»', 139, [
      { t: 'lista', itens: [
        { termo: 'A)', texto: '«What do you do when you feel sad?»' },
        { termo: 'B)', texto: '«What do you do when you feel excited?»' },
        { termo: 'C)', texto: '«What do you do when you feel bored?»' },
        { termo: 'D)', texto: '«What do you do when you feel angry?»' },
      ] },
      { t: 'texto', texto: 'O que você faz quando se sente triste, animada, entediada ou brava? A resposta começa com «I».' },
    ]),
    carta('en-e140', '😐', '«Listen and draw.»', 140, [
      { t: 'texto', texto: 'Quatro crianças, A, B, C e D, com o rostinho quase sem desenho. Escute e desenhe a carinha de cada uma.' },
    ]),
    carta('en-e141', '😴', '«Look, read and number.»', 141, [
      { t: 'lista', itens: [
        { termo: '1)', texto: '«I jump when I\'m excited.»' },
        { termo: '2)', texto: '«I sleep when I\'m sleepy.»' },
        { termo: '3)', texto: '«I dance when I\'m happy.»' },
      ] },
      { t: 'texto', texto: '«Game time.» Hora da brincadeira!' },
    ]),

    // o alfabeto (pp. 142 a 144)
    carta('en-e142', '🔤', '«The Alphabet Song»', 142, [
      { t: 'texto', texto: '«Let\'s sing the alphabet.»' },
      { t: 'versos', versos: ['«A, B, C, D, E, F, G,»', '«H, I, J, K, L, M, N, O, P,»', '«Q, R, S, T, U, V,»',
        '«W, X, Y and Z.»', '', '«Now I know my ABCs.»', '«Next time won\'t you sing with me?»'] },
      { t: 'texto', texto: 'A canção se repete mais uma vez.' },
      { t: 'quadro', titulo: '«Hands on»', texto: '«Make an alphabet poster!»' },
    ]),
    carta('en-e143', '🧩', '«Break the code. Spell the words.»', 143, [
      { t: 'texto', texto: 'Cada desenho é uma letra. Troque os desenhos pelas letras e descubra as palavras.' },
      { t: 'tabela', cab: ['Desenho', 'Letra'], linhas: [
        ['nuvem com chuva', 'A'], ['folha', 'B'], ['avião de papel', 'C'], ['nuvem', 'D'], ['âncora', 'E'],
        ['estrela', 'N'], ['lua', 'O'], ['coração', 'R'], ['câmera', 'L'], ['bola', 'P'], ['lâmpada', 'H'],
        ['castelo', 'T'],
      ] },
    ]),
    carta('en-e144', '📝', '«Writing time» e «Talk to a friend»', 144, [
      { t: 'lista', itens: [
        { termo: '«Writing time.»', texto: '«What do you do when you feel sad?» «How do you spell your name?»' },
        { termo: '«Talk to a friend.»', texto: '«What do you do when...?» «A) A toy breaks.» «B) You go to a party.»' },
      ] },
    ]),

    // desafio, resumo e o que eu já sei (pp. 145 a 147)
    carta('en-e145', '⭐', '«Super Challenge»', 145, [
      { t: 'texto', texto: '«Spell the word and guess the picture.»' },
      { t: 'texto', texto: 'Seis fotos no meio de letras coloridas: uma bicicleta, uma cidade à noite, uma menina com frio, um vestido, um material de escola e uma menina feliz. Soletre a palavra e descubra a foto!' },
    ]),
    carta('en-e146', '🧸', '«Summing up»', 146, [
      { t: 'texto', texto: '«Think and match.»' },
      { t: 'texto', texto: '«Dance», «jump», «sleep», «stamp my foot» e «cry»: ligue cada ação à criança que faz isso.' },
    ]),
    carta('en-e147', '🔤', '«How do you spell your name?»', 147, [
      { t: 'texto', texto: '«A B C D E F G H I J K L M N O P Q R S T U V W X Y Z»' },
      { t: 'quadro', titulo: '«Now, I can...»', itens: [
        { texto: '«Name and identify some feelings.»' },
        { texto: '«Talk about feelings and my actions.»' },
        { texto: '«Talk about how I feel in different situations.»' },
        { texto: '«Talk about how I react in different situations.»' },
      ] },
    ], ['ENG-147-qB']),
  ]);
})();
