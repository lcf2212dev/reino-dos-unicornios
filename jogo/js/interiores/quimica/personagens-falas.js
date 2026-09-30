/* Falas dos personagens reservados do prédio quimica (reservas.js), numa parte própria de
   Reino.falasDoPredio: a frente das falas escreve aqui e as vozes são gravadas sem esperar o visual.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. */
Reino.falasDoPredio('quimica', { npcs: {
  'quimica-proveta': {
    oi: ['Olá, sou a Doutora Proveta!', 'Bem-{vinda|vindo} ao laboratório!', 'Aqui usamos óculos e jaleco.'],
    nova: ['Vamos misturar poções?'],
    depois: ['Já espiou pelo microscópio?', 'Olhe a tabela periódica!', 'O caderno guarda as receitas.',
      'Na vida real, chame um adulto!', 'Lá em cima tem mais surpresas!'],
  },
} });
// 2º andar: o Professor Carbono (guia das curiosidades) e a Dona Caramela (a cozinheira-cientista). A fala `nova` da
// Dona Caramela é o convite do Fogão dos Estados (interiores/quimica/acoes.js): o mesmo texto, o mesmo áudio
Reino.falasDoPredio('quimica', { npcs: {
  'quimica-carbono': {
    oi: ['Olá! Sou o Professor Carbono.', 'Eu coleciono curiosidades!', 'Adoro o elemento carbono!'],
    nova: ['Quer ouvir uma curiosidade? ✨', 'Tenho uma curiosidade nova!'],
    depois: ['Leia os livros da biblioteca!', 'A química está em todo lugar.', 'Volte para mais curiosidades!',
      'Experimento, só com um adulto!'],
  },
  'quimica-caramela': {
    oi: ['Oi! Eu sou a Dona Caramela.', 'Cozinhar também é química!', 'Vamos esquentar e esfriar!'],
    nova: ['Vamos ver a água mudar?'],
    depois: ['Já separou uma mistura?', 'A mesa de separar é demais!', 'O chocolate derrete na mão!',
      'Fogão, só com um adulto junto!'],
  },
} });
