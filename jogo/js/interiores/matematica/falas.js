/* Torre dos Números da Matemática do Dia a Dia (4º bimestre): o que os personagens e os objetos dizem (gravado com a
   voz de cada um, pacote interior-matematica). Cada página com até ~30 letras e frases de 3+ palavras. As estações
   das salas falam a página e o nome da sala (gerado em matematica/salas.js a partir dos dados).
   As falas do 3º bimestre (o interior padrão) estão em arquivo/terceiro-bimestre/jogo/js/interiores/matematica/elenco.js. */
Reino.falasDoPredio('matematica', {
  npcs: {
    // a guia do saguão (o convite é o resumo automático do motor)
    'mat-isa': {
      oi: ['Oi! Eu sou a Professora Isa. 🌟', 'Os números moram nesta torre!', 'Cada andar tem um capítulo.'],
      depois: ['Pode subir com calma, viu? ✨'],
    },
    // 1º andar: capítulo 10, sistema monetário (as galerias e o ateliê)
    'mat-otavio': {
      oi: ['Olá! Eu sou o Seu Otávio. 🪙', 'Aqui a gente conhece o dinheiro.'],
      nova: ['Vamos contar moedas e notas?', 'Quanto custa? Vamos descobrir!'],
      depois: ['Você fez as contas direitinho! 🎉', 'Guarde moedas no cofrinho! 🐷'],
    },
    'mat-cecilia': {
      oi: ['Oi! Eu sou a Cecília! 🛒', 'Eu faço a lista das compras.'],
      nova: ['Vamos fazer as atividades?', 'Cada moedinha conta, viu?'],
      depois: ['Que compra caprichada! 💖'],
    },
    // 2º andar: capítulo 11, divisão em partes iguais
    'mat-lara': {
      oi: ['Oi! Eu sou a Confeiteira Lara.', 'Eu reparto tudo igualzinho!'],
      nova: ['Vamos dividir o bolo? 🍰', 'Cada um ganha o mesmo tanto.'],
      depois: ['Ninguém ficou sem pedaço! 🍕', 'Que divisão mais justa!'],
    },
    'mat-zuzu': {
      oi: ['Oi! Eu sou a Zuzu, a palhacinha.', 'Eu reparto os balões! 🎈'],
      nova: ['Vamos repartir {juntas|juntos}?', 'Um para mim, um para você!'],
      depois: ['Que festa bem dividida! 🎉'],
    },
    // 3º andar: capítulo 12, estatística
    'mat-tadeu': {
      oi: ['Olá! Eu sou o Professor Tadeu.', 'Eu adoro fazer pesquisas!'],
      nova: ['Vamos contar e fazer gráficos?', 'Quem gosta mais de quê?'],
      depois: ['Que gráfico mais bonito! ⭐', 'Você leu a tabela direitinho!'],
    },
    'mat-tito': {
      oi: ['Oi! Eu sou o Mágico Tito! 🌱', 'Eu conto as mudas plantadas.'],
      nova: ['Vamos fazer as atividades?', 'Abracadabra, um gráfico!'],
      depois: ['Que mágica de contar! ✨'],
    },
  },
  objetos: {
    // saguão
    'ma-livro-aprendizagem': ['O Livro de Aprendizagem! 📗', 'Os capítulos 10, 11 e 12.'],
    'ma-livro-atividades': ['O Livro de Atividades! 📒', 'Tem atividades de cada capítulo.'],
    'ma-andares': ['Este é o mapa da torre! 🗼', 'No 1º andar, o dinheiro.', 'No 2º, as partes iguais.', 'No 3º, pesquisas e gráficos.'],
    'ma-bebedouro': ['Um golinho de água fresca! 💧', 'Beber água faz muito bem.'],
    'ma-abaco': ['O ábaco ajuda a contar! 🧮', 'Cada continha vale um.'],
    // 1º andar: o dinheiro
    'ma-caixa': ['A caixa registradora! 🪙', 'Ela guarda o dinheiro da loja.'],
    'ma-cedulas': ['Olha as notas e as moedas!', 'Todas são do nosso Real.'],
    'ma-banca': ['Cada fruta tem o seu preço.', 'Quanto custa uma maçã? 🍎'],
    'ma-cofrinho': ['O cofrinho guarda moedas! 🐷', 'Juntar um pouquinho ajuda.'],
    // 2º andar: as partes iguais
    'ma-pizza': ['A pizza tem quatro pedaços! 🍕', 'Todos do mesmo tamanho.'],
    'ma-pratos': ['Cada prato tem o mesmo tanto.', 'Isso é dividir em partes iguais!'],
    'ma-potes': ['Três potes com o mesmo tanto.', 'Que divisão caprichada!'],
    // 3º andar: as pesquisas
    'ma-tabela': ['A tabela da pesquisa! ⭐', 'Cada risquinho é um voto.'],
    'ma-grafico': ['Olha o gráfico de barras!', 'A barra mais alta tem mais.'],
    'ma-muda': ['Uma muda de árvore! 🌳', 'Plantar árvores ajuda o planeta.'],
    'ma-prancheta': ['A prancheta da pesquisa.', 'Vamos perguntar e contar?'],
  },
});
