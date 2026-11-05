/* Bosque dos Fantasmas, as falas dos objetos (a placa, a árvore velha, o cogumelo e a lanterna; voz 'narradora',
   pacote 'interior-bosque'). Os textos são os do plano (já gravados no esqueleto): não mude, a voz é pelo texto exato.
   As do Claude estão em sistemas/bosque-falas.js. Cada página: até 30 letras (sem contar emoji). */
Reino.falasDoPredio('bosque', {
  objetos: {
    'placa': ['{Bem-vinda|Bem-vindo} ao bosque!', 'Os fantasmas daqui são fofos.', 'Vença e responda às perguntas!'],
    'arvore-velha': ['Esta árvore é muito velhinha.', 'Ela já viu muitos fantasmas.'],
    'cogumelo': ['Um cogumelo que brilha!', 'Ele ilumina o caminho.'],
    'lanterna': ['Uma lanterna das fadas.', 'A luz dela nunca se apaga.'],
  },
});
