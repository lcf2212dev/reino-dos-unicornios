/* Escola do Reino: tudo o que a diretora, os professores e os objetos dizem (gravado com a voz de cada um). */
Reino.FALAS_INTERIORES = Reino.FALAS_INTERIORES || {};
Reino.FALAS_INTERIORES.escola = {
  npcs: {
    // corredor: a diretora explica os prêmios (o motor junta o botão "Ver a lista")
    margarida: {
      oi: [
        'Oi! Sou a Diretora Margarida. 🌼',
        'Nota dez é acertar tudo! ⭐',
        'Com dez de primeira: lendário! 🌈',
        'Na segunda vez, vale o raro. 💙',
        'Depois, vale o comum. 🤍',
      ],
      nova: ['Quer ver as provas da Escola?', 'Vamos ver os prêmios juntas?'],
    },
    // sala de História
    helena: {
      oi: ['Oi! Sou a Professora Helena. 📜', 'Eu adoro contar histórias.'],
      nova: ['Vamos fazer a prova com calma?', 'Leia cada pergunta devagar.'],
      feita: ['Vamos treinar a prova juntas?', 'Quer revisar a prova comigo?'],
      depois: ['Você leu com muita atenção!', 'Que prova caprichada! ✨'],
    },
    // sala de Inglês
    emma: {
      oi: ['Oi! Eu sou a «Teacher Emma»! 🍎', 'Eu ensino Inglês com carinho.'],
      nova: ['Vamos fazer a prova juntas?', 'Escute cada palavra com calma.'],
      feita: ['Vamos treinar a prova juntas?', 'Quer revisar as palavras comigo?'],
      depois: ['«Good job!» Você foi muito bem!', 'Você revisou com calma! ✨'],
    },
    // sala de Português
    lucia: {
      oi: ['Eu sou a Professora Lúcia! 📝', 'Eu adoro ler e escrever.'],
      nova: ['Vamos fazer a prova com calma?', 'Leia o texto duas vezes. 📖'],
      feita: ['Vamos treinar a prova juntas?', 'Revise antes de entregar. ✏️'],
      depois: ['Você leu tudo com atenção!', 'Revisar ajudou muito! ✨'],
    },
  },
  // professora de uma prova nova, sem professor próprio ainda (voz da narradora)
  professorPadrao: {
    oi: ['Oi! Sou a Professora do Reino.', 'Cuido desta sala de aula. 📝'],
    nova: ['Vamos fazer a prova com calma?', 'Leia tudo antes de responder.'],
    feita: ['Vamos treinar a prova juntas?', 'Quer revisar a prova comigo?'],
    depois: ['Você fez tudo com carinho! 💛'],
  },
  objetos: {
    // corredor
    'mural': ['São os prêmios da Escola! 🏆', 'Os coloridos já são seus.', 'Os outros ainda vão chegar.'],
    'bebedouro': ['Um golinho de água? 💧', 'Descanse um pouquinho.'],
    'escaninhos': ['Os armários dos alunos. 🎒', 'Cada um guarda o seu material.'],
    // salas (todas)
    'lousa': ['A lousa tem o ABC! ✏️', 'Letra por letra, sem pressa.'],
    'globo': ['Um globo do mundo! 🌍', 'O mundo é grande e bonito.'],
    'mochila': ['Uma mochila bem arrumada. 🎒', 'Lápis, caderno e borracha.'],
    // sala de História
    'cartas': ['Cartas antigas da turma. ✉️', 'Contam coisas de outra época.'],
    'linha-tempo': ['Uma linha do tempo! 📜', 'Do passado até hoje. ⏳'],
    // sala de Inglês
    'palavras': ['Palavras em inglês! 🍎', '«Apple» quer dizer maçã.', '«Book» quer dizer livro. 📖'],
    'bandeira': ['A bandeira do Reino Unido.', 'Lá se fala inglês! 💂'],
    // sala de Português
    'receita': ['Uma receita de salada! 🍎', 'Primeiro vêm os ingredientes.', 'Depois, o modo de preparo.'],
    'silabas': ['Sílabas coloridas no quadro! 🔤', 'Toda palavra tem sílabas.', 'Bata uma palma em cada uma.'],
  },
};
