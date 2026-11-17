/* Montanha Gelada, as falas dos objetos (a placa, o iglu, o trenó e o unicórnio de gelo; voz 'narradora', pacote
   'interior-gelo'). Voz pelo texto exato: mudou, grava de novo. As do Claude na arena são as do Bosque sem fantasma
   (sistemas/bosque-falas.js, BosqueFalas.arena). Cada página: até 30 letras. */
Reino.falasDoPredio('gelo', {
  objetos: {
    'placa': ['{Bem-vinda|Bem-vindo} à montanha!', 'Aqui faz muito frio. Brrr!', 'Vença e responda às perguntas!'],
    'iglu': ['Uma casinha feita de gelo.', 'Lá dentro é quentinho!'],
    'treno': ['Um trenó vermelho.', 'Ele desliza rápido na neve!'],
    'estatua': ['Um unicórnio de gelo!', 'Ele brilha quando bate o sol.'],
  },
});
