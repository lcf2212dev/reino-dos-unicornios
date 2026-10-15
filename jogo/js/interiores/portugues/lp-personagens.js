/* Língua Portuguesa do 4º bimestre (térreo da Casa das Palavras, interiores/portugues/portugues.js): quem mora lá.
   Nome, voz (perfil edge-tts, um por pessoa, longe das vozes do Claude e dos outros prédios) e sprite; o lugar e a
   ação de cada um ficam no layout. As falas moram em portugues/lp-falas.js. */
(function () {
  // Bibliotecária Letícia, a guia da casa: cachos escuros, óculos roxos (a cor da matéria), cardigã lilás e o livro verde
  // na mão. A Dona Memória (guia do Museu) é idosa de coque: as duas não se confundem.
  Reino.registrarPersonagem({ id: 'lp-leticia', nome: 'Bibliotecária Letícia',
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '+14Hz' },   // voz nativa, clara e acolhedora
    sprite: { pele: '#c98a5e', cabelo: '#2b1b17', penteado: 'cachos', oculos: true, oculosCor: '#8e4fd6', roupa: '#b58cff',
      roupa2: '#5a3f8a', perna: 'saia', sapato: '#4a3a5a', cracha: true, cor2: '#ffd34d', livro: '#3fae5a' },
  });

  // Vovó Celeste, a contadora de histórias do Capítulo 10: tranças brancas, capa de noite estrelada e um livro aberto.
  // A Vovó Contadeira (do Museu) usa turbante laranja e vestido vermelho de bolinhas.
  Reino.registrarPersonagem({ id: 'lp-celeste', nome: 'Vovó Celeste',
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '-14%', tom: '-6Hz' },   // devagar, voz de contar história
    sprite: { idade: 'idoso', pele: '#f1c7a5', cabelo: '#ece8f4', penteado: 'trancas', roupa: '#6f8fe0', roupa2: '#3d4f9a',
      perna: 'vestido', capa: true, capaCor: '#2f3f8a', capaEstrelas: true, livroAberto: '#3fae5a', colar: '#ffd34d',
      sapato: '#4a3a30' },
  });

  // Maestro Sol, o músico do Capítulo 11: chapéu laranja, camisa cor de sol, gravata vermelha e o violão.
  Reino.registrarPersonagem({ id: 'lp-sol', nome: 'Maestro Sol',
    perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '+6%', tom: '+4Hz' },   // alegre, com jeito de cantor
    sprite: { pele: '#8a5236', cabelo: '#1f1414', penteado: 'curto', chapeu: 'chapeu', chapeuCor: '#e07a1a', cor2: '#ffd34d',
      roupa: '#ffb020', roupa2: '#3a3a5a', gravata: '#e0433f', bigode: true, violao: true, sapato: '#4a2a1a' },
  });

  // Poeta Pingo, o poeta do Capítulo 12: boina azul, cachecol de letras, óculos redondos e o lápis na mão.
  Reino.registrarPersonagem({ id: 'lp-pingo', nome: 'Poeta Pingo',
    perfil: { voz: 'de-DE-FlorianMultilingualNeural', velocidade: '-6%', tom: '+6Hz' },   // calmo, de quem lê poema
    sprite: { pele: '#ffe0c7', cabelo: '#c2532b', penteado: 'espetado', chapeu: 'boina', chapeuCor: '#2f6fd6',
      cachecol: true, cachecolCor: '#5fd0ff', oculos: true, oculosCor: '#3a2446', roupa: '#f4f2fa', colete: '#2f6fd6',
      roupa2: '#2f4f8a', lapis: true, sapato: '#3a2f5a' },
  });
})();
