/* Reservas de personagem do prédio quimica: o contrato de cada NPC (quem é, voz e vaga),
   escrito antes das frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador:
   as frentes só leem. O visual vem de Reino.registrarPersonagem({ id, sprite }) no personagens.js. */
// quimica-proveta: Doutora Proveta, a cientista (Thalita média-grave, em velocidade normal: longe do Claude e dos outros)
Reino.reservarPersonagem({ id: 'quimica-proveta', nome: 'Doutora Proveta', genero: 'f', idade: 'adulto',
  perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+0%', tom: '-28Hz' },
  predio: 'quimica', x: 24, y: 6, acao: { tipo: 'tela', tela: 'quimica-bancada' },
});
