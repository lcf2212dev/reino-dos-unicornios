/* Caverna de Cristal, as falas dos objetos (a placa, o geodo, o lampião do mineiro e o carrinho de mina; voz
   'narradora', pacote 'interior-cristal'). Voz pelo texto exato: mudou, grava de novo. As do Claude na arena são as do
   Bosque sem fantasma (sistemas/bosque-falas.js, BosqueFalas.arena). Cada página: até 30 letras. */
Reino.falasDoPredio('cristal', {
  objetos: {
    'placa': ['{Bem-vinda|Bem-vindo} à caverna!', 'Os cristais brilham no escuro.', 'Vença e responda às perguntas!'],
    'geodo': ['Uma pedra rachada ao meio.', 'Dentro, só cristal roxo!'],
    'lampiao': ['O lampião de um mineiro.', 'Ele ilumina os trilhos.'],
    'vagonete': ['Um carrinho cheio de cristais!', 'Alguém esqueceu ele aqui.'],
  },
});
