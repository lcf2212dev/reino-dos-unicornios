/* Cartas do English – Projetos, capítulo 12 "I Have a Healthy Diet!" (pp. 178 a 193), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). O texto do livro (todo em maiúsculas) em caixa normal, entre «»;
   uma linha curta em português ajuda. Questão só de conversa: `soLeitura` da carta que a mostra. */
(function () {
  var L = 'projetos', C = 12;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  Reino.registrarCartas('ingles4', [
    // History (pp. 178 a 183)
    carta('en-p178', '🍲', '«I Have a Healthy Diet!»', 178, [
      { t: 'texto', texto: '«Chapter 12. I have a healthy diet!» Capítulo 12: Eu tenho uma alimentação saudável!' },
      { t: 'quadro', titulo: '«Let\'s talk»', itens: [
        { texto: '«What do you usually eat at home?»' },
        { texto: '«Where does food come from?»' },
        { texto: '«What is a healthy diet?»' },
      ] },
      { t: 'texto', texto: 'O que você come em casa? De onde vem a comida? O que é uma alimentação saudável?' },
    ], ['PRJ-178-qA']),
    carta('en-p179', '🏫', '«In this chapter you will...»', 179, [
      { t: 'lista', itens: [
        { texto: '«Analyse different eating habits in different cultural contexts.»' },
        { texto: '«Learn about the origin of food.»' },
        { texto: '«Draw a graph about eating habits.»' },
      ] },
      { t: 'texto', texto: 'Neste capítulo, você vai ver o que as pessoas comem em lugares diferentes, de onde vem a comida e fazer um gráfico.' },
    ]),
    carta('en-p180', '🍝', '«Analysing eating habits»', 180, [
      { t: 'texto', texto: '«History. Analysing eating habits.» Vamos olhar o que as famílias comem.' },
      { t: 'lista', itens: [
        { texto: '«We eat noodles.»' },
        { texto: '«We eat chicken and vegetables.»' },
        { texto: '«We eat sandwiches and salad.»' },
      ] },
      { t: 'quadro', titulo: '«Pictionary»', itens: [
        { termo: '«Noodles»', texto: 'macarrão de fio, comido com pauzinhos.' },
        { termo: '«Vegetables»', texto: 'legumes e verduras.' },
        { termo: '«Steak»', texto: 'bife.' },
      ] },
    ]),
    carta('en-p181', '🍣', '«Real World»', 181, [
      { t: 'lista', itens: [
        { texto: '«At home, we eat pasta.»' },
        { texto: '«In the restaurant, we eat sushi.»' },
        { texto: '«In the cafeteria, we eat sandwiches.»' },
      ] },
      { t: 'texto', texto: 'Em casa, no restaurante e no refeitório da escola, a gente come coisas diferentes.' },
      { t: 'quadro', titulo: '«Communication frame»', itens: [
        { texto: '«What do you eat in the cafeteria?»' },
        { texto: '«In the cafeteria, we eat sandwiches.»' },
      ] },
      { t: 'texto', texto: '«Let\'s play a giant board game!» Vamos jogar num tabuleiro gigante!' },
    ]),
    carta('en-p182', '🏠', '«Let\'s practise»', 182, [
      { t: 'texto', texto: '«Look and draw.» Desenhe o que você come na escola, em casa e no restaurante.' },
      { t: 'lista', itens: [
        { termo: '«School»', texto: 'escola.' },
        { termo: '«Home»', texto: 'casa.' },
        { termo: '«Restaurant»', texto: 'restaurante.' },
      ] },
    ]),
    carta('en-p183', '🍝', '«Let\'s play with our food!»', 183, [
      { t: 'texto', texto: '«Can you use chopsticks?» Você sabe comer com pauzinhos?' },
      { t: 'texto', texto: '«Let\'s play with our food!» Vamos brincar com a comida: um colar feito de macarrão!' },
      { t: 'quadro', titulo: '«Materials»', texto: 'Macarrão de vários formatos e um barbante.' },
    ]),

    // Geography (pp. 184 a 187)
    carta('en-p184', '🥛', '«Identifying where food comes from»', 184, [
      { t: 'texto', texto: '«Read and think.» De onde vem a comida?' },
      { t: 'lista', itens: [
        { texto: '«Milk comes from cows.»' },
        { texto: '«Bread comes from wheat.»' },
        { texto: '«Fruits come from trees.»' },
      ] },
      { t: 'texto', texto: 'O leite vem das vacas, o pão vem do trigo e as frutas vêm das árvores.' },
    ]),
    carta('en-p185', '🐄', '«Where does milk come from?»', 185, [
      { t: 'texto', texto: '«Look and point.» Uma mesa de café da manhã com frutas, leite, pão, queijo e ovo.' },
      { t: 'quadro', titulo: '«Communication frame»', itens: [
        { texto: '«Where does milk come from?»' },
        { texto: '«Milk comes from cows.»' },
      ] },
      { t: 'texto', texto: '«Create a chant about food.» Invente um versinho sobre comida!' },
    ]),
    carta('en-p186', '🌱', '«Animals or plants?»', 186, [
      { t: 'texto', texto: '«Draw the food items.» Desenhe comidas que vêm das plantas e dos animais.' },
      { t: 'lista', itens: [
        { termo: '«Plants»', texto: 'plantas.' },
        { termo: '«Animals»', texto: 'animais.' },
      ] },
      { t: 'texto', texto: '«Crisps, chocolate, bubble gum, ice cream.» Batatinha, chocolate, chiclete e sorvete.' },
    ]),
    carta('en-p187', '🍓', '«Super Challenge»', 187, [
      { t: 'texto', texto: '«Let\'s make our own sandwich!» Vamos montar o nosso sanduíche!' },
      { t: 'quadro', titulo: '«Match the food.»', itens: [
        { texto: '«Olives, strawberry, egg, orange, bee, tomato.»' },
        { texto: '«Honey, ketchup, olive oil, jam, fried egg, juice.»' },
      ] },
    ]),

    // Maths (pp. 188 a 193)
    carta('en-p188', '📋', '«Drawing, analysing and comparing graphs»', 188, [
      { t: 'texto', texto: '«Look and check.» A tabela mostra o que alguém come na semana.' },
      { t: 'tabela', cab: ['«Food»', '«Days»'], linhas: [
        ['«Salad»', '«Every day»'],
        ['«Hamburger»', '«Saturday»'],
        ['«Fruit»', '«Every day»'],
        ['«Chips»', '«Saturday»'],
      ] },
      { t: 'texto', texto: 'Salada e frutas todos os dias; hambúrguer e batata frita só no sábado.' },
    ]),
    carta('en-p189', '💧', '«Doctor\'s recommendations»', 189, [
      { t: 'lista', itens: [
        { texto: '«Eat 2 pieces of fruit a day.»' },
        { texto: '«Eat 1 piece of meat a day.»' },
        { texto: '«Eat 3 types of vegetables a day.»' },
        { texto: '«Drink 4 cups of water a day.»' },
      ] },
      { t: 'quadro', titulo: '«Communication frame»', itens: [
        { texto: '«How much fruit should we eat every day?»' },
        { texto: '«Two pieces!»' },
      ] },
      { t: 'texto', texto: '«Let\'s create a pictograph!» Um pictograma é um gráfico feito de figurinhas.' },
    ], ['PRJ-189-q2']),
    carta('en-p190', '🍎', '«Colour the pictograph»', 190, [
      { t: 'texto', texto: '«How many pieces of fruit do they eat? Colour the pictograph.» Quatro crianças: uma come 7 frutas, outra 5, outra 4 e outra 2.' },
      { t: 'texto', texto: '«Prepare a survey.» Prepare perguntas para uma pesquisa.' },
    ]),
    carta('en-p191', '📋', '«Create a graph!»', 191, [
      { t: 'texto', texto: '«Let\'s interview our classmates!» Pergunte aos colegas e anote as respostas.' },
      { t: 'texto', texto: '«Create a graph!» Pinte um gráfico com água, verduras, frutas e carne.' },
    ], ['PRJ-191-q3']),
    carta('en-p192', '🧀', '«Summing up»', 192, [
      { t: 'texto', texto: '«Remember and match.»' },
      { t: 'lista', itens: [
        { texto: '«Cheese comes from cows.»' },
        { texto: '«Fruits come from trees.»' },
        { texto: '«We eat sushi in the restaurant.»' },
        { texto: '«We eat pizza at home.»' },
      ] },
    ]),
    carta('en-p193', '💧', '«Let\'s check»', 193, [
      { t: 'texto', texto: '«How much water do they drink?» Lucas, Claudia, Noah e Monica.' },
      { t: 'quadro', titulo: '«Let\'s check»', itens: [
        { termo: '«History»', texto: '«Identify what I eat in different contexts.»' },
        { termo: '«Geography»', texto: '«Talk about the origin of food.»' },
        { termo: '«Maths»', texto: '«Draw a graph about eating habits.»' },
      ] },
    ]),
  ]);
})();
