/* Bosque do Orvalho, as falas dos objetos (a placa, a árvore velha, o cogumelo e a lanterna; voz 'narradora',
   pacote 'interior-bosque'). Os textos são os do Bosque dos Fantasmas, copiados (texto igual = áudio igual; nenhuma
   voz nova). As do Claude na arena são as do Bosque sem fantasma (sistemas/bosque-falas.js, BosqueFalas.arena).
   Cada página: até 30 letras (sem contar emoji). */
Reino.falasDoPredio('orvalho', {
  objetos: {
    'placa': ['{Bem-vinda|Bem-vindo} ao bosque!', 'Vença e responda às perguntas!'],
    'arvore-velha': ['Esta árvore é muito velhinha.'],
    'cogumelo': ['Um cogumelo que brilha!', 'Ele ilumina o caminho.'],
    'lanterna': ['Uma lanterna das fadas.', 'A luz dela nunca se apaga.'],
  },
});
