/* Cartas do livro English, Capítulo 10 "If You're Happy, Clap Your Hands" (pp. 122 a 133), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). O texto do livro entre «» (em caixa normal; o livro é todo em maiúsculas)
   e uma linha curta em português. Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'english', C = 10;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  Reino.registrarCartas('ingles4', [
    // abertura e objetivos (pp. 122 e 123)
    carta('en-e122', '😄', '«If You\'re Happy, Clap Your Hands» – Capítulo 10', 122, [
      { t: 'texto', texto: 'Duas meninas pulam de alegria, com confete caindo do céu azul.' },
      { t: 'quadro', titulo: '«Let\'s talk»', itens: [
        { texto: '«What makes you happy?»' },
        { texto: '«What makes you sad?»' },
      ] },
      { t: 'texto', texto: 'O que deixa você feliz? E o que deixa você triste? Pense e converse com alguém!' },
    ], ['ENG-122-qA', 'ENG-122-qB']),
    carta('en-e123', '💬', '«In this chapter you will...»', 123, [
      { t: 'lista', itens: [
        { texto: '«Learn about feelings.»' },
        { texto: '«Talk about your feelings.»' },
        { texto: '«Ask your friends how they feel.»' },
      ] },
      { t: 'texto', texto: 'Neste capítulo, você vai aprender os sentimentos, os «feelings», e falar deles em inglês.' },
    ]),

    // canção e glossário (p. 124)
    carta('en-e124', '🎵', '«Song time»: «How do you feel today?»', 124, [
      { t: 'versos', versos: ['«Are you happy happy happy»', '«or are you sad sad sad?»', '«Today I\'m happy happy happy»',
        '«don\'t feel sad sad sad»', '«If you\'re happy, if you\'re happy,»', '«clap your hands! Hurray!»', '',
        '«Is he sleepy sleepy sleepy»', '«or is he angry angry angry?»', '«Today he\'s sleepy sleepy sleepy»',
        '«he\'s not angry angry angry»', '«If you\'re sleepy, if you\'re sleepy,»', '«stamp your foot! Hurray!»'] },
      { t: 'lista', itens: [{ termo: '«Stamp your foot»', texto: 'bater o pé no chão.' }] },
    ]),
    carta('en-e125', '🤝', '«Match the pictures with the sentences.»', 125, [
      { t: 'texto', texto: 'Ligue cada carinha à frase certa. «She» é ela; «he» é ele.' },
      { t: 'lista', itens: [
        { texto: '«She\'s sleepy.»' }, { texto: '«He\'s excited.»' },
        { texto: '«She\'s angry.»' }, { texto: '«He\'s bored.»' },
      ] },
    ]),

    // ouvir, desenhar, letras, mímica, desenhar e escrever, termômetro (pp. 126 a 129)
    carta('en-e126', '👉', '«Listen and point» e «Draw»', 126, [
      { t: 'texto', texto: '«Listen to the sentences and point at the correct picture.» Ouça a frase e aponte a foto certa.' },
      { t: 'texto', texto: '«Draw what makes you happy!» Desenhe o que deixa você feliz!' },
    ]),
    carta('en-e127', '🎥', '«Complete with the missing letters.»', 127, [
      { t: 'texto', texto: 'Complete as letras que faltam e depois ligue os sentimentos às carinhas.' },
      { t: 'texto', texto: '«Miming game.» O jogo de mímica: faça o sentimento sem falar, e o amigo adivinha!' },
      { t: 'quadro', titulo: '«Cult»', texto: '«Inside Out is a film about a little girl named Riley and her feelings.»' },
      { t: 'texto', texto: 'Divertida Mente é um filme sobre uma menina chamada Riley e os sentimentos dela.' },
    ]),
    carta('en-e128', '✏', '«Draw the feelings» e «Writing time»', 128, [
      { t: 'texto', texto: '«Look at the pictures and draw the feelings.» Olhe as fotos e desenhe as carinhas.' },
      { t: 'fala', quem: 'Writing time', texto: '«How do they feel today?»' },
      { t: 'texto', texto: '«She\'s» quer dizer ela está; «he\'s» quer dizer ele está.' },
    ]),
    carta('en-e129', '🌡', '«Hands on»', 129, [
      { t: 'texto', texto: '«Make a feelings thermometer!» Um termômetro dos sentimentos, de cima para baixo:' },
      { t: 'lista', itens: [
        { texto: '«Angry»' }, { texto: '«Sad»' }, { texto: '«Sleepy»' },
        { texto: '«Bored»' }, { texto: '«Happy»' }, { texto: '«Excited»' },
      ] },
    ]),

    // conversa, desafio, o tempo e os sentimentos, resumo (pp. 130 a 133)
    carta('en-e130', '💬', '«Answer the question»', 130, [
      { t: 'fala', quem: 'Menina', texto: '«How do you feel today?»' },
      { t: 'fala', quem: 'Menino', texto: '«I\'m happy!»' },
      { t: 'quadro', titulo: '«Super challenge»', texto: '«Look at the pictures and guess the feelings.» «I think he\'s...» «I think she\'s...»' },
    ]),
    carta('en-e131', '☀', '«Believe it or not»', 131, [
      { t: 'quadro', texto: '«The weather can affect our feelings. It can make us happy, sad, bored, excited etc.»' },
      { t: 'texto', texto: 'O tempo, sol ou chuva, pode mudar como a gente se sente!' },
      { t: 'texto', texto: '«Think and write.» «How do you feel when it\'s sunny?» «How do you feel when it\'s rainy?»' },
    ]),
    carta('en-e132', '🤝', '«Summing up»', 132, [
      { t: 'texto', texto: '«Think, match and write.» «Feelings»: os sentimentos.' },
      { t: 'lista', itens: [
        { texto: '«Bored»' }, { texto: '«Sad»' }, { texto: '«Angry»' },
        { texto: '«Sleepy»' }, { texto: '«Happy»' }, { texto: '«Excited»' },
      ] },
    ]),
    carta('en-e133', '✅', '«Now, I can...»', 133, [
      { t: 'lista', itens: [
        { texto: '«Name feelings.»' },
        { texto: '«Say how I am feeling.»' },
        { texto: '«Ask my friends how they feel.»' },
        { texto: '«Say how I feel in different situations.»' },
      ] },
    ]),
  ]);
})();
