/* Baú do Tesouro: tudo o que o Dragãozinho Tostão e os objetos dizem (gravado com a voz de cada um).
   Nada de números de moedas aqui: quem mostra quanto ela ganhou é a tela do Baú. */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.bau = {
  npcs: {
    // guardião das moedas: abre o Baú (quanto ela ganhou por matéria)
    tostao: {
      oi: ['Oi! Sou o Dragãozinho Tostão. 🐉', 'Eu guardo suas moedas!'],
      nova: ['Vamos contar suas moedas? 🪙', 'Quer ver quanto você juntou?', 'Vamos abrir o baú juntos?'],
      depois: ['Suas moedas estão seguras! 💛', 'Contei tudo com muito carinho.'],
    },
  },
  objetos: {
    'pilha': ['Esta pilha é de uma matéria.', 'Cada sala nova põe moedas!'],
    'monte': ['O monte de todas as moedas! ✨', 'Ele cresce a cada sala nova.'],
    'medalha': ['A medalha de ouro da escola! 🥇', 'Vem de acertar com calma.', 'E de revisar com carinho.'],
    'mapa': ['Um mapa do tesouro! 🗺️', 'O X é onde a gente aprende.'],
    'balanca': ['Uma balança de moedas! ⚖️', 'O Tostão pesa tudo direitinho.'],
    'porquinho': ['Um cofrinho de porquinho! 🐷', 'Guardar um pouco é bom demais.'],
    'livros': ['Os livros de contas do Tostão.', 'Ele anota cada moeda! 📒'],
    'ninho': ['O ninho de travesseiros! 💤', 'O Tostão cochila aqui.'],
  },
};
