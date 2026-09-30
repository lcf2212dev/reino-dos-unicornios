/* Reservas de personagem do prédio quimica: o contrato de cada NPC (quem é, voz e vaga),
   escrito antes das frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador:
   as frentes só leem. O visual vem de Reino.registrarPersonagem({ id, sprite }) no personagens.js. */
// quimica-proveta: Doutora Proveta, a cientista (Francisca nativa, média-grave e um pouco rápida: a Thalita multilíngue embolava as palavras de química)
Reino.reservarPersonagem({ id: 'quimica-proveta', nome: 'Doutora Proveta', genero: 'f', idade: 'adulto',
  perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+10%', tom: '-34Hz' },
  predio: 'quimica', x: 24, y: 6, acao: { tipo: 'tela', tela: 'quimica-bancada' },
});
