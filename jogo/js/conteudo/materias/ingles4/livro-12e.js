/* Cartas do English, Capítulo 12 "Book Time" (pp. 148 a 159), na ordem das páginas (docs/contratos/quarto-bimestre.md
   §4). Texto do livro palavra por palavra, em caixa normal, com o inglês entre «». O livro lido em sala ("Book time")
   não está no PDF: a carta en-e150b traz uma historinha curta do jogo, com as palavras do capítulo, e as questões
   "in the book" e "from the story" usam ela (adaptação, INVENTARIO.md). */
(function () {
  var L = 'english', C = 12;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  Reino.registrarCartas('ingles4', [
    carta('en-e148', '🏖', '«Chapter 12: Book Time»', 148, [
      { t: 'texto', texto: 'Uma menina descansa na praia, com óculos de sol, bola e mala de viagem.' },
      { t: 'quadro', titulo: '«Let\'s talk»', itens: [
        { texto: '«What do you usually do in your free time?»' },
        { texto: '«What do you do with your family at the weekends?»' },
      ] },
      { t: 'texto', texto: '«Free time» é o tempo livre. «Weekend» é o fim de semana.' },
    ]),
    carta('en-e149', '😄', '«In this chapter you will...»', 149, [
      { t: 'lista', itens: [
        { texto: '«Read a book.»' },
        { texto: '«Give your opinion about the book.»' },
        { texto: '«Revise what you have learnt.»' },
      ] },
      { t: 'texto', texto: 'Neste capítulo, você vai ler um livro, dar sua opinião sobre ele e revisar o que aprendeu.' },
    ]),
    carta('en-e150', '📖', '«Activities»', 150, [
      { t: 'lista', itens: [
        { termo: '01', texto: '«Book time.»' },
        { termo: '02', texto: '«Listen and answer. A) Did you like the story? B) What is the story about? C) Who wrote the book?»' },
        { termo: '03', texto: '«Write and draw. Book title. Main character.»' },
      ] },
      { t: 'texto', texto: 'O livro da sala de aula não está aqui. Então o Big Ben escreveu uma historinha para você ler!' },
    ]),
    carta('en-e150b', '📖', '«Lily\'s Weekend»', 150, [
      { t: 'texto', texto: 'Esta historinha não é do livro da escola: é do jogo, e quem escreveu foi o Big Ben!' },
      { t: 'texto', texto: '«It is Saturday. It is cold and windy. Lily wears a coat, a scarf and boots. She reads a book with Grandma. Lily is happy!»' },
      { t: 'texto', texto: '«On Sunday, it is sunny and hot. Lily wears a T-shirt, shorts and sandals. She rides a bike and plays football with her brother Tom.»' },
      { t: 'texto', texto: '«Then it is rainy. The ball is wet. Tom is angry. Lily is sad. "Let\'s watch a film!" says Mum. Lily is excited!»' },
      { t: 'texto', texto: '«At night, Lily is sleepy. She goes to bed. Good night, Lily!»' },
      { t: 'fonte', texto: 'Historinha do jogo, escrita pelo unicórnio Big Ben.' },
    ]),
    carta('en-e151', '🎵', '«Feelings»', 151, [
      { t: 'texto', texto: '«Match the pictures with the feelings.» «Find in the book. Then talk with your friends.»' },
      { t: 'lista', itens: [
        { termo: '«Angry»', texto: 'bravo' }, { termo: '«Sleepy»', texto: 'com sono' },
        { termo: '«Sad»', texto: 'triste' }, { termo: '«Happy»', texto: 'feliz' },
        { termo: '«Bored»', texto: 'entediado' }, { termo: '«Excited»', texto: 'animado' },
      ] },
      { t: 'quadro', titulo: '«Cult»', texto: '«Happy is a song by Pharrell Williams.»' },
    ]),
    carta('en-e152', '☀', '«Weather»', 152, [
      { t: 'texto', texto: '«Look and write.» «Think and write the type of weather in the book.»' },
      { t: 'lista', itens: [
        { termo: '«Cold»', texto: 'frio' }, { termo: '«Hot»', texto: 'quente' },
        { termo: '«Sunny»', texto: 'ensolarado' }, { termo: '«Rainy»', texto: 'chuvoso' },
        { termo: '«Snowy»', texto: 'com neve' }, { termo: '«Windy»', texto: 'com vento' },
      ] },
    ]),
    carta('en-e153', '👗', '«Clothes»', 153, [
      { t: 'texto', texto: '«Draw what you wear on a cold and on a hot day.» «Think and write clothes from the story.»' },
      { t: 'lista', itens: [
        { termo: '«T-shirt»', texto: 'camiseta' }, { termo: '«Boots»', texto: 'botas' },
        { termo: '«Sandals»', texto: 'sandálias' }, { termo: '«Dress»', texto: 'vestido' },
        { termo: '«Shorts»', texto: 'bermuda, short' }, { termo: '«Trousers»', texto: 'calça' },
        { termo: '«Coat»', texto: 'casaco' }, { termo: '«Skirt»', texto: 'saia' },
        { termo: '«Gloves»', texto: 'luvas' }, { termo: '«Scarf»', texto: 'cachecol' },
        { termo: '«Hat»', texto: 'chapéu, gorro' },
      ] },
    ]),
    carta('en-e154', '⚽', '«Free time»', 154, [
      { t: 'texto', texto: '«Tick what you do in your free time.» «Think and write free time activities that appear in the book.» «Simon says.»' },
      { t: 'figuras', itens: [
        { img: '📖', legenda: '«Read»' }, { img: '🏊', legenda: '«Swim»' }, { img: 'en:bicicleta', legenda: '«Ride a bike»' },
        { img: '🎮', legenda: '«Play video games»' }, { img: '⚽', legenda: '«Play football»' }, { img: '📺', legenda: '«Watch videos / films»' },
      ] },
    ]),
    carta('en-e155', '🖍', '«Hands on»', 155, [
      { t: 'quadro', titulo: '«Hands on»', texto: '«Let\'s recreate your favourite scene from the book.»' },
      { t: 'texto', texto: 'Com papel, massinha e o que tiver em casa, monte a sua parte favorita da história!' },
      { t: 'texto', texto: '«Talk to a friend about your routine and free time activities.»' },
      { t: 'fala', quem: 'Menino', texto: '«I brush my teeth every day. How about you?»' },
      { t: 'fala', quem: 'Menina', texto: '«I play football in my free time. How about you?»' },
      { t: 'texto', texto: '«Colour and say.» «Purple, black, white, grey, brown.»' },
    ], ['ENG-155-qA']),
    carta('en-e156', '🪥', '«Super Challenge»', 156, [
      { t: 'texto', texto: '«Read and guess the daily routines.»' },
      { t: 'lista', itens: [
        { termo: '1.', texto: '«Brush my teeth.»' }, { termo: '2.', texto: '«Have a shower.»' },
        { termo: '3.', texto: '«Get up.»' }, { termo: '4.', texto: '«Go to school.»' }, { termo: '5.', texto: '«Go to bed.»' },
      ] },
    ]),
    carta('en-e157', '🔎', '«Break the code»', 157, [
      { t: 'texto', texto: '«Break the code.» Cada figurinha é uma letra: a nuvem com chuva é A, a âncora é E, a estrelinha é N, a lua é O...' },
      { t: 'texto', texto: '«A) At the ... B) After ... C) ... D) ... E) ...»' },
      { t: 'texto', texto: '«Talk to your friends.»' },
    ]),
    carta('en-e158', '📅', '«Summing up»', 158, [
      { t: 'texto', texto: '«Think and match.»' },
      { t: 'lista', itens: [
        { texto: '«Free time activities»' }, { texto: '«Weather»' }, { texto: '«Days of the week»' },
        { texto: '«Feelings»' }, { texto: '«Routine»' },
      ] },
    ]),
    carta('en-e159', '✅', '«Now, I can...»', 159, [
      { t: 'texto', texto: 'Ligue: «clothes», «times of the day», «actions», «colours».' },
      { t: 'lista', itens: [
        { texto: '«Understand a book.»' }, { texto: '«Give my opinion about a book.»' },
        { texto: '«Identify and talk about feelings.»' }, { texto: '«Identify clothes and talk about the weather.»' },
        { texto: '«Describe my routine.»' },
      ] },
    ]),
  ]);
})();
