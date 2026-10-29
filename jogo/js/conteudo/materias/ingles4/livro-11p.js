/* Cartas do English – Projetos, Capítulo 11 "Be Kind!" (pp. 164 a 177), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). O texto do livro entre «» em caixa normal; uma linha em português ajuda.
   Atividades de turma (entrevista, massinha, bingo, recortar, dar a caixa) ficam como leitura (soLeitura). */
(function () {
  var L = 'projetos', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  Reino.registrarCartas('ingles4', [
    // Science (pp. 164 a 169)
    carta('en-p164', '🌈', 'Chapter 11 – «Be Kind!»', 164, [
      { t: 'texto', texto: 'Na foto, uma menina dá flores para a mamãe. Que gentileza!' },
      { t: 'quadro', titulo: 'Let\'s talk', itens: [
        { texto: '«In which situations can you be kind?»' },
        { texto: '«How can we show people that we care about them?»' },
        { texto: '«Is it important to think about other people\'s feelings? Why?»' },
      ] },
      { t: 'texto', texto: '«Be kind» quer dizer «seja gentil».' },
    ]),
    carta('en-p165', '🤝', 'In this chapter you will...', 165, [
      { t: 'lista', itens: [
        { termo: '«Identify differences among people.»', texto: 'Ver as diferenças entre as pessoas.' },
        { termo: '«Understand empathy and kindness.»', texto: 'Entender a empatia e a gentileza.' },
        { termo: '«Learn ways to be kind.»', texto: 'Aprender jeitos de ser gentil.' },
        { termo: '«Make a kindness box.»', texto: 'Fazer uma caixa da gentileza.' },
      ] },
    ]),
    carta('en-p166', '📖', 'Science – «Valuing differences»', 166, [
      { t: 'quadro', titulo: 'Read and think', texto: '«John is short. Gabriel is tall. Paul, James and Gabriel are black. They have black hair. Daniel and John are white. Daniel has brown hair. John has blond hair. The boys have short hair. They are friends!»' },
      { t: 'texto', texto: 'Cada um é de um jeito, e todos são amigos! «Short» é baixo, «tall» é alto, «hair» é cabelo.' },
      { t: 'texto', texto: '«Look and describe.» «Alice has long hair.» Depois, «draw and colour»: desenhe e pinte.' },
    ]),
    carta('en-p167', '💬', 'Science – «Real World»', 167, [
      { t: 'texto', texto: '«Look and describe.» Quatro amigos andam abraçados. Cada um tem um cabelo diferente.' },
      { t: 'quadro', titulo: 'Communication frame', itens: [
        { texto: '«My hair is different from yours.»' },
        { texto: '«My hair is similar to yours.»' },
        { texto: '«I don\'t look like you.»' },
        { texto: '«I look like you.»' },
      ] },
      { t: 'texto', texto: '«Find someone who...» Na escola, procure um colega parecido com você!' },
    ], ['PRJ-167-q2']),
    carta('en-p168', '✏️', 'Science – «Let\'s practise»', 168, [
      { t: 'texto', texto: '«Listen and draw.» Escute e desenhe na moldura.' },
    ]),
    carta('en-p169', '🍎', 'Science – «Let\'s practise»', 169, [
      { t: 'texto', texto: '«What do they have in common?» Maçãs de cores diferentes, e crianças brincando juntas.' },
      { t: 'texto', texto: '«Let\'s make dolls!» Vamos fazer bonecos de massinha. «Bingo!»' },
      { t: 'texto', texto: '«Let\'s check Science. Go to page 177.»' },
    ], ['PRJ-169-q3', 'PRJ-169-q4']),
    // Arts (pp. 170 a 173)
    carta('en-p170', '🎨', 'Arts – «Empathy through arts»', 170, [
      { t: 'texto', texto: '«Look and think.» Duas pinturas: uma menina dança feliz na chuva; outra fecha os olhos debaixo do guarda-chuva.' },
      { t: 'texto', texto: '«How are they feeling?»' },
      { t: 'lista', itens: [
        { termo: '«The boy is stressed out.»', texto: 'O menino está nervoso.' },
        { termo: '«The children are excited.»', texto: 'As crianças estão animadas.' },
        { termo: '«The girl is reflective.»', texto: 'A menina está pensativa.' },
        { termo: '«The children are bored.»', texto: 'As crianças estão entediadas.' },
      ] },
    ]),
    carta('en-p171', '💬', 'Arts – «Real World»', 171, [
      { t: 'texto', texto: '«Look and think.» Umas crianças brincam na grama. Outra está sozinha na janela.' },
      { t: 'fala', quem: 'Menina', texto: '«What\'s the matter?»' },
      { t: 'fala', quem: 'Menino', texto: '«I\'m bored.»' },
      { t: 'fala', quem: 'Menina', texto: '«Let\'s play!»' },
      { t: 'texto', texto: '«Let\'s play a miming game!» Mímica é contar sem falar, só com o corpo.' },
    ]),
    carta('en-p172', '✏️', 'Arts – «Let\'s practise»', 172, [
      { t: 'texto', texto: '«Match feelings and pictures.»' },
      { t: 'lista', itens: [
        { termo: '«bored»', texto: 'entediado' },
        { termo: '«stressed out»', texto: 'nervoso' },
        { termo: '«excited»', texto: 'animado' },
        { termo: '«reflective»', texto: 'pensativo' },
      ] },
      { t: 'texto', texto: '«How can you be kind?» Dois meninos dividem as coisas na grama.' },
    ]),
    carta('en-p173', '🌈', 'Arts – «Super Challenge»', 173, [
      { t: 'texto', texto: '«Let\'s represent the diversity around us!» Bonecos de papel de mãos dadas, cada um de uma cor.' },
      { t: 'quadro', titulo: 'Super Challenge', texto: '«How can you help? Peter is sad, but he doesn\'t want to talk about it. How can you help Peter?»' },
      { t: 'texto', texto: '«Let\'s check Arts. Go to page 177.»' },
    ], ['PRJ-173-q3']),
    // Connecting Ideas (pp. 174 a 177)
    carta('en-p174', '🎁', 'Connecting Ideas – «Kindness box»', 174, [
      { t: 'texto', texto: '«Kindness box.» A caixa da gentileza guarda bilhetes carinhosos.' },
      { t: 'texto', texto: '«Which notes are related to kindness?»' },
      { t: 'lista', itens: [
        { termo: 'A)', texto: '«You are a good friend!»' },
        { termo: 'B)', texto: '«Don\'t touch my things.»' },
        { termo: 'C)', texto: '«Let\'s talk!»' },
        { termo: 'D)', texto: '«I don\'t like you.»' },
        { termo: 'E)', texto: '«I love to play with you!»' },
        { termo: 'F)', texto: '«We are different and beautiful.»' },
      ] },
      { t: 'texto', texto: '«How do you want to decorate your box?»' },
    ]),
    carta('en-p175', '📦', 'Connecting Ideas – «Carry out»', 175, [
      { t: 'texto', texto: '«Materials: paper box, coloured paper, glue.»' },
      { t: 'lista', itens: [
        { termo: 'A)', texto: '«Prepare your kindness notes.»' },
        { termo: 'B)', texto: '«Decorate the box.»' },
        { termo: 'C)', texto: '«Put the notes in the box.»' },
        { termo: 'D)', texto: '«Give the kindness box to a classmate.»' },
      ] },
      { t: 'fala', quem: 'Liam', texto: '«Here\'s my kindness box. It\'s for you, Emma.»' },
      { t: 'fala', quem: 'Emma', texto: '«Thank you, Liam!»' },
      { t: 'texto', texto: '«Give the kindness box to a classmate!»' },
    ], ['PRJ-175-q6']),
    carta('en-p176', '🌍', '«Summing up»', 176, [
      { t: 'texto', texto: '«Remember and match.» Seis amigos olham um globo na biblioteca.' },
      { t: 'texto', texto: '«He\'s black. She has black hair. She has blond hair. She\'s black. He has brown hair. He\'s white.»' },
      { t: 'texto', texto: 'Somos diferentes, e todos somos lindos!' },
    ]),
    carta('en-p177', '✅', '«Let\'s check»', 177, [
      { t: 'texto', texto: 'Nos cartões, escreva os materiais da caixa da gentileza.' },
      { t: 'lista', itens: [
        { termo: 'Science', texto: '«Identify differences among people.»' },
        { termo: 'Arts', texto: '«Understand empathy and kindness.»' },
        { termo: 'Connecting Ideas', texto: '«Write kind words to my friends.»' },
      ] },
    ], ['PRJ-177-qB']),
  ]);
})();
