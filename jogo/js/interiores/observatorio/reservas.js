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

// jupiter-tinta: Tinta, a ET que escreve cartas e perdeu as letras (desafio de Português)
Reino.reservarPersonagem({ id: 'jupiter-tinta', nome: 'Tinta', genero: 'f', idade: 'crianca',
  perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+6%', tom: '+30Hz' },
  predio: 'planeta-jupiter', x: 8, y: 7, acao: { tipo: 'viagem-desafio', materia: 'portugues' },
});

// jupiter-bolha: Bolha, o ET que pula de nuvem em nuvem
Reino.reservarPersonagem({ id: 'jupiter-bolha', nome: 'Bolha', genero: 'm', idade: 'crianca',
  perfil: { voz: 'pt-BR-AntonioNeural', velocidade: '+12%', tom: '+30Hz' },
  predio: 'planeta-jupiter', x: 16, y: 9, acao: { tipo: 'jupiter-brincadeira', b: 'bolha' },
});

// jupiter-vovo: Vovô Tempestade, que conta curiosidades de Júpiter
Reino.reservarPersonagem({ id: 'jupiter-vovo', nome: 'Vovô Tempestade', genero: 'm', idade: 'idoso',
  perfil: { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-18%', tom: '-22Hz' },
  predio: 'planeta-jupiter', x: 5, y: 12, acao: { tipo: 'jupiter-brincadeira', b: 'curiosidade' },
});

// venus-mapi: Mapi, a ET que se perdeu e precisa do mapa (desafio de Geografia)
Reino.reservarPersonagem({ id: 'venus-mapi', nome: 'Mapi', genero: 'f', idade: 'crianca',
  perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '+4%', tom: '+14Hz' },
  predio: 'planeta-venus', x: 8, y: 7, acao: { tipo: 'viagem-desafio', materia: 'geografia' },
});

// venus-quentinho: Quentinho, o ET que brinca no calor de Vênus
Reino.reservarPersonagem({ id: 'venus-quentinho', nome: 'Quentinho', genero: 'm', idade: 'crianca',
  perfil: { voz: 'en-US-AndrewMultilingualNeural', velocidade: '+4%', tom: '+24Hz' },
  predio: 'planeta-venus', x: 16, y: 9, acao: { tipo: 'venus-brincadeira', b: 'quentinho' },
});

// venus-vovo: Vovó Nuvem, que conta curiosidades de Vênus
Reino.reservarPersonagem({ id: 'venus-vovo', nome: 'Vovó Nuvem', genero: 'f', idade: 'idoso',
  perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-14%', tom: '-10Hz' },
  predio: 'planeta-venus', x: 5, y: 12, acao: { tipo: 'venus-brincadeira', b: 'curiosidade' },
});

// netuno-gota: Gota, a ET cientista (desafio de Ciências)
Reino.reservarPersonagem({ id: 'netuno-gota', nome: 'Gota', genero: 'f', idade: 'crianca',
  perfil: { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+6%', tom: '+24Hz' },
  predio: 'planeta-netuno', x: 8, y: 7, acao: { tipo: 'viagem-desafio', materia: 'ciencias' },
});

// netuno-memo: Memo, o ET que guarda histórias antigas (desafio de História)
Reino.reservarPersonagem({ id: 'netuno-memo', nome: 'Memo', genero: 'm', idade: 'crianca',
  perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '+4%', tom: '+24Hz' },
  predio: 'planeta-netuno', x: 16, y: 9, acao: { tipo: 'viagem-desafio', materia: 'historia' },
});

// netuno-vovo: Vovó Ventania, que conta curiosidades de Netuno
Reino.reservarPersonagem({ id: 'netuno-vovo', nome: 'Vovó Ventania', genero: 'f', idade: 'idoso',
  perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-14%', tom: '-14Hz' },
  predio: 'planeta-netuno', x: 5, y: 12, acao: { tipo: 'netuno-brincadeira', b: 'curiosidade' },
});
