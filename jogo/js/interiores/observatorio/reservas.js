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

// marte-rubi: Rubi, a marciana engenheira cuja nave quebrou (desafio de Matemática)
Reino.reservarPersonagem({ id: 'marte-rubi', nome: 'Rubi', genero: 'f', idade: 'crianca',
  perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+4%', tom: '+28Hz' },
  predio: 'planeta-marte', x: 8, y: 7, acao: { tipo: 'viagem-desafio', materia: 'matematica' },
});

// marte-faisca: Faísca, o marciano que brinca de rolar nas dunas
Reino.reservarPersonagem({ id: 'marte-faisca', nome: 'Faísca', genero: 'm', idade: 'crianca',
  perfil: { voz: 'en-US-BrianMultilingualNeural', velocidade: '+6%', tom: '+30Hz' },
  predio: 'planeta-marte', x: 16, y: 9, acao: { tipo: 'marte-brincadeira', b: 'faisca' },
});

// marte-vovo: Vovô Vulcão, o marciano mais velho, que conta curiosidades de Marte
Reino.reservarPersonagem({ id: 'marte-vovo', nome: 'Vovô Vulcão', genero: 'm', idade: 'idoso',
  perfil: { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '-12%', tom: '-16Hz' },
  predio: 'planeta-marte', x: 5, y: 12, acao: { tipo: 'marte-brincadeira', b: 'curiosidade' },
});

// saturno-sky: «Sky», a ET dos anéis que só fala um pouco de português (desafio de Inglês)
Reino.reservarPersonagem({ id: 'saturno-sky', nome: '«Sky»', genero: 'f', idade: 'crianca',
  perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+4%', tom: '+22Hz' },
  predio: 'planeta-saturno', x: 8, y: 7, acao: { tipo: 'viagem-desafio', materia: 'ingles' },
});

// saturno-nico: Nico, o ET que patina no gelo dos anéis
Reino.reservarPersonagem({ id: 'saturno-nico', nome: 'Nico', genero: 'm', idade: 'crianca',
  perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '+8%', tom: '+26Hz' },
  predio: 'planeta-saturno', x: 16, y: 9, acao: { tipo: 'saturno-brincadeira', b: 'nico' },
});

// saturno-vovo: Vovó Anel, a ET mais velha, que conta curiosidades de Saturno
Reino.reservarPersonagem({ id: 'saturno-vovo', nome: 'Vovó Anel', genero: 'f', idade: 'idoso',
  perfil: { voz: 'en-US-EmmaMultilingualNeural', velocidade: '-10%', tom: '-8Hz' },
  predio: 'planeta-saturno', x: 5, y: 12, acao: { tipo: 'saturno-brincadeira', b: 'curiosidade' },
});
