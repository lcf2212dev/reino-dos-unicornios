/* Falas da Língua Portuguesa do 4º bimestre (térreo da Casa das Palavras, portugues/portugues.js), numa parte própria
   de Reino.falasDoPredio('portugues'): os quatro personagens (portugues/lp-personagens.js) e os objetos que falam.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. As estações das salas falam
   a página e o nome da sala (gerado em portugues.js a partir dos dados). */
Reino.falasDoPredio('portugues', {
  npcs: {
    // a guia do saguão
    'lp-leticia': {
      oi: ['Olá, eu sou a Letícia! 📚', 'Bem-{vinda|vindo} à Casa das Palavras!', 'Cada capítulo tem uma galeria.',
        'E cada uma tem um ateliê.'],
      nova: ['Vamos ler os livros {juntas|juntos}?', 'Quer ver a lista de salas? ✨'],
      depois: ['Você leu muito bem! 💖', 'Os livros ficam felizes! 📚', 'Volte sempre para ler mais!'],
    },
    // Capítulo 10, "Conta uma história?": contos e lendas
    'lp-celeste': {
      oi: ['Olá, eu sou a Vovó Celeste! 🌙', 'Aqui moram contos e lendas.', 'Era uma vez um gato de botas!'],
      nova: ['Quer ouvir uma história? 🏰', 'Vamos ler um conto {juntinhas|juntinhos}?'],
      depois: ['Que linda leitura! 🌟', 'Conto tem começo, meio e fim!', 'A vitória-régia é uma lenda!'],
    },
    // Capítulo 11, "Quem canta...": letras de canção
    'lp-sol': {
      oi: ['Olá, eu sou o Maestro Sol! 🎵', 'Aqui tudo vira canção.', 'Vamos cantar e aprender?'],
      nova: ['Vamos cantar uma canção? 🎶', 'Afine a voz e vamos lá!'],
      depois: ['Que voz afinada! 🎵', 'Gatinho, gato e gatão! 🎶', 'O rei da floresta adorou!'],
    },
    // Capítulo 12, "O visual do poema": poema visual e letras
    'lp-pingo': {
      oi: ['Olá, eu sou o Poeta Pingo! ✏️', 'Aqui o poema tem desenho.', 'As letras viram figuras! 🔤'],
      nova: ['Vamos brincar com poemas? ✏️', 'Quer ver um poema visual?'],
      depois: ['Que poema mais lindo! ✨', 'Viu o jacaré feito de letras? 🐊', 'Maiúscula nos nomes próprios!'],
    },
  },
  objetos: {
    'lp-livro-aprendizagem': ['Este é o livro verde! 📖', 'É o Livro de Aprendizagem.'],
    'lp-livro-atividades': ['Este é o livro amarelo! 📒', 'É o Livro de Atividades.'],
    'lp-mapa': ['É a Casa das Palavras! 🏠', 'Você está aqui, no saguão!', 'Em cima, as galerias verdes.',
      'Capítulo 10 fica à esquerda.', 'O 11 no meio e o 12 à direita.', 'Mais acima, os ateliês amarelos!'],
    'lp-bebedouro': ['Um golinho de água fresca! 💧', 'Ler dá sede, não é?'],
    'lp-castelo': ['Este é o castelo do ogro! 🏰', 'O gato esperto enganou o ogro.'],
    'lp-leao': ['Eu sou o rei da floresta! 🎵', 'Conheço tudo por aqui.'],
    'lp-jacare': ['Um jacaré feito de letras! 🐊', 'Isso é um poema visual.'],
  },
});
