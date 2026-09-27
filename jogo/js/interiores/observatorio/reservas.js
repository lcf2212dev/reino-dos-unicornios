/* Reservas de personagem do prédio observatorio: o contrato de cada NPC (quem é, voz e vaga),
   escrito antes das frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador:
   as frentes só leem. O visual vem de Reino.registrarPersonagem({ id, sprite }) no personagens.js. */
// ETs da Lua (planeta-lua, viagem de foguete): Lumi e Vovó Cratera com vozes estrangeiras falando português
// (sotaque de outro planeta); o Pipo, com sotaque, não se entendia na transcrição: voz brasileira bem aguda
// lua-lumi: Lumi, a ET lunar que recebe a Mariana
Reino.reservarPersonagem({ id: 'lua-lumi', nome: 'Lumi', genero: 'f', idade: 'crianca',
  perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+0%', tom: '+34Hz' },
  predio: 'planeta-lua', x: 8, y: 7, acao: { tipo: 'lua-brincadeira', b: 'pulo' },
});

// lua-pipo: Pipo, o ET que brinca de esconde-esconde
Reino.reservarPersonagem({ id: 'lua-pipo', nome: 'Pipo', genero: 'm', idade: 'crianca',
  perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '+6%', tom: '+45Hz' },
  predio: 'planeta-lua', x: 16, y: 9, acao: { tipo: 'lua-brincadeira', b: 'esconde' },
});

// lua-vovo: Vovó Cratera, a ET mais velha, que conta curiosidades da Lua
Reino.reservarPersonagem({ id: 'lua-vovo', nome: 'Vovó Cratera', genero: 'f', idade: 'idoso',
  perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-8%', tom: '-6Hz' },
  predio: 'planeta-lua', x: 5, y: 12, acao: { tipo: 'lua-brincadeira', b: 'curiosidade' },
});
