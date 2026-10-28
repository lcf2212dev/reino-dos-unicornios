/* Reservas de personagem da Casa das Palavras: o contrato de cada NPC (quem é, voz e vaga), escrito antes das
   frentes que o constroem em paralelo (docs/contratos/plano-paralelo.md §2). É do orquestrador: as frentes só leem.
   O visual vem de Reino.registrarPersonagem({ id, sprite }) no lp-personagens.js.
   1º andar (portugues-1, docs/contratos/quarto-bimestre.md §13–§14): um anfitrião em cada ateliê do Livro de
   Atividades e a guardiã do Cantinho do Respiro (pausa entre as etapas). */
// lp-rabisco: Mestre Rabisco, anfitrião do Ateliê do capítulo 10 (contos)
Reino.reservarPersonagem({ id: 'lp-rabisco', nome: 'Mestre Rabisco', genero: 'm', idade: 'adulto',
  perfil: { voz: 'en-US-BrianMultilingualNeural', velocidade: '+0%', tom: '-6Hz' },
  predio: 'portugues-1', x: 10, y: 9, acao: { tipo: 'guia', lugar: 'materia:portugues4', livro: 'portugues4' },
});

// lp-melodia: Dona Cantiga, anfitriã do Ateliê do capítulo 11 (canções)
Reino.reservarPersonagem({ id: 'lp-melodia', nome: 'Dona Cantiga', genero: 'f', idade: 'adulto',
  perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+4%', tom: '+6Hz' },
  predio: 'portugues-1', x: 22, y: 9, acao: { tipo: 'guia', lugar: 'materia:portugues4', livro: 'portugues4' },
});

// lp-tito: Tito Rima, anfitrião do Ateliê do capítulo 12 (poemas)
Reino.reservarPersonagem({ id: 'lp-tito', nome: 'Tito Rima', genero: 'm', idade: 'jovem',
  perfil: { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '+8%', tom: '+14Hz' },
  predio: 'portugues-1', x: 34, y: 9, acao: { tipo: 'guia', lugar: 'materia:portugues4', livro: 'portugues4' },
});

// lp-serena: Vovó Serena, a guardiã do Cantinho do Respiro (sem desafio: respiração guiada, ação lp-respiro)
Reino.reservarPersonagem({ id: 'lp-serena', nome: 'Vovó Serena', genero: 'f', idade: 'idoso',
  perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '-12%', tom: '-10Hz' },
  predio: 'portugues-1', x: 9, y: 19, acao: { tipo: 'lp-respiro' },
});
