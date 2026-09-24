/* Castelo da Medalha: tudo o que a princesa, os cavaleiros e os objetos dizem (gravado com a voz de cada um). */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.castelo = {
  npcs: {
    // salão do trono: explica o treino (o convite sorteia uma das falas de `nova`)
    serena: {
      oi: ['Oi! Sou a Princesa Serena. 👑', 'O treino aqui não tem relógio.'],
      nova: [
        'Aqui ninguém tem pressa. 🌷',
        'Revise tudo antes de entregar.',
        'A medalha vem dos acertos. 🥇',
        'Acertar com calma dá ouro. 🥇',
      ],
    },
    // ala da História
    aurora: {
      oi: ['Oi! Sou a Cavaleira Aurora. 🛡️', 'Eu treino a História com você.'],
      nova: ['Vamos treinar a História? 🥇', 'Vamos ler cada pergunta? 📖'],
      feita: ['Quer treinar mais uma vez?', 'Vamos buscar o ouro com calma?'],
      bloqueada: ['Primeiro, as salas do museu. 🏛️', 'O museu vem antes do treino.'],
      depois: ['Você revisou tudo com calma! ✨', 'Revisar é coisa de campeã! 🏆'],
    },
    // ala do Inglês
    oliver: {
      oi: ['Oi! Eu sou o «Sir Oliver». 🛡️', 'Eu treino o Inglês com você.'],
      nova: ['Vamos treinar o Inglês? 🥇', 'Vamos ler tudo com calma?'],
      feita: ['Quer treinar de novo comigo?', 'Vamos tentar o ouro com calma?'],
      bloqueada: ['Primeiro, as salas da Torre. 🕰️', 'A Torre vem antes do treino.'],
      depois: ['«Well done!» Você revisou tudo!', 'Terminar com calma é o melhor!'],
    },
  },
  // cavaleiro padrão: usado pelo gerador numa matéria sem cavaleiro conhecido
  cavaleiro: {
    oi: ['Oi! Sou um cavaleiro do Reino.', 'Eu cuido do treino desta ala.'],
    nova: ['Vamos treinar sem pressa? 🥇', 'Vamos ler cada pergunta? 📖'],
    feita: ['Quer treinar mais uma vez?', 'Vamos buscar o ouro com calma?'],
    bloqueada: ['Primeiro, termine as salas. 🔒'],
    depois: ['Você revisou tudo com calma! ✨', 'Revisar é coisa de campeã! 🏆'],
  },
  objetos: {
    // salão do trono
    'tapecaria': ['É o Plano da Prova! 📜', 'Vamos ler juntas com calma?'],
    'medalhas': ['Aqui ficam as suas medalhas! 🏅', 'Todas vieram dos seus acertos.'],
    'lareira': ['Que fogo quentinho! 🔥', 'Descanse um pouquinho aqui.'],
    // ala da História
    'historia-ampulheta': ['Uma ampulheta bem antiga! ⏳', 'No treino não tem relógio.', 'Pode pensar com calma.'],
    // ala do Inglês
    'ingles-cartaz': ['Um cartaz «in English»! 📋', '«Hello» quer dizer olá.'],
  },
};
