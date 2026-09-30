/* Reservas de personagem do prédio quimica: o contrato de cada NPC (quem é, voz e vaga),
   escrito antes das frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador:
   as frentes só leem. O visual vem de Reino.registrarPersonagem({ id, sprite }) no personagens.js. */
// quimica-proveta: Doutora Proveta, a cientista (Francisca nativa, média-grave e um pouco rápida: a Thalita multilíngue embolava as palavras de química)
Reino.reservarPersonagem({ id: 'quimica-proveta', nome: 'Doutora Proveta', genero: 'f', idade: 'adulto',
  perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+10%', tom: '-34Hz' },
  predio: 'quimica', x: 24, y: 6, acao: { tipo: 'tela', tela: 'quimica-bancada' },
});

// quimica-carbono: Professor Carbono, o vovô cientista das curiosidades e dos livros do 2º andar (Antonio calmo e bem
// grave: longe do Claude e diferente dos outros Antonio do jogo)
Reino.reservarPersonagem({ id: 'quimica-carbono', nome: 'Professor Carbono', genero: 'm', idade: 'idoso',
  perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '-12%', tom: '-50Hz' },
  predio: 'quimica-2', x: 24, y: 6, acao: { tipo: 'quimica-curiosidade', tema: 'todas' },
});

// quimica-caramela: Dona Caramela, a cozinheira-cientista do 2º andar (Francisca alegre e aguda: longe da Doutora
// Proveta, grave, e da narradora; a Thalita embolava as palavras de química)
Reino.reservarPersonagem({ id: 'quimica-caramela', nome: 'Dona Caramela', genero: 'f', idade: 'adulto',
  perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+0%', tom: '+22Hz' },
  predio: 'quimica-2', x: 7, y: 6, acao: { tipo: 'tela', tela: 'quimica-estados' },
});
