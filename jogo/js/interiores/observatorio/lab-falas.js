/* Laboratório de Ciências (3º andar do Observatório) da Ciências da Natureza do 4º bimestre: os personagens e o que
   eles e os objetos dizem. Uma parte das falas do Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga).
   Os mesmos seis personagens do 3º bimestre (mesmo id, mesma voz), com falas novas sobre as plantas. Cada página com
   até 30 letras (sem contar emoji), frases de 3 ou mais palavras. As estações das salas falam a página e o nome da
   sala (gerado em lab-andar3.js a partir dos dados); o microscópio e os tubos falam em lab-atividades.js.
   As falas do 3º bimestre estão em arquivo/terceiro-bimestre/jogo/js/interiores/observatorio/lab-falas.js. */
(function () {
  var R = window.Reino;

  /* ---------- personagens (voz do edge-tts; diferentes da Vega e do Cosmo) ---------- */
  // guia do Hall
  R.registrarPersonagem({ id: 'lab-iris', nome: 'Professora Íris',
    sprite: { pele: '#c68a62', cabelo: '#3a2418', penteado: 'coque', oculos: true, oculosCor: '#2f6fd6', roupa: '#137a70', roupa2: '#3a3a5a', perna: 'saia', cracha: true, livro: '#139a8c' },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-8%', tom: '+10Hz' } });
  // capítulo 11: As partes das plantas
  R.registrarPersonagem({ id: 'lab-bento', nome: 'Biólogo Bento',
    sprite: { pele: '#f1c7a5', cabelo: '#8a5a3a', penteado: 'cacheado', chapeu: 'palha', roupa: '#8fb83a', roupa2: '#6b4428', bolsa: true, bolsaCor: '#c98a4b' },
    perfil: { voz: 'en-US-AndrewMultilingualNeural', velocidade: '+2%', tom: '+6Hz' } });
  // capítulo 12: As plantas se relacionam
  R.registrarPersonagem({ id: 'lab-jana', nome: 'Guarda Jana',
    sprite: { pele: '#8a5a3a', cabelo: '#1f1410', penteado: 'trancas', chapeu: 'chapeu', chapeuCor: '#6b8a3a', roupa: '#a8b86a', roupa2: '#5a4a2a', apito: true },
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+2%', tom: '-6Hz' } });
  // capítulo 10: Conhecendo as plantas
  R.registrarPersonagem({ id: 'lab-malu', nome: 'Jardineira Malu',
    sprite: { idade: 'crianca', pele: '#ffe0c7', cabelo: '#c9304a', penteado: 'rabos', roupa: '#ff9cc6', perna: 'vestido', flor: true },
    perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+8%', tom: '+20Hz' } });
  // Sala das Experiências: as experiências
  R.registrarPersonagem({ id: 'lab-ravi', nome: 'Explorador Ravi',
    sprite: { pele: '#b07a52', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'chapeu', chapeuCor: '#c9a46a', roupa: '#e8c890', roupa2: '#6b4428', cachecol: true, cachecolCor: '#5fb4ff' },
    perfil: { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-2%', tom: '-8Hz' } });
  // Sala das Experiências: os mini-jogos
  R.registrarPersonagem({ id: 'lab-lupa', nome: 'Detetive Lupa',
    sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', chapeu: 'boina', chapeuCor: '#8a5a3a', roupa: '#c98a4b', roupa2: '#3a3a5a', gola: '#fff8ee' },
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '+18Hz' } });

  R.falasDoPredio('observatorio', {
    npcs: {
      // a guia do Hall
      'lab-iris': {
        oi: ['Olá, sou a Professora Íris! 🔬', 'Vamos conhecer as plantas! 🌱', 'Cada capítulo tem uma galeria.',
          'Em cima, ficam as estufas.'],
        nova: ['Vamos ler os livros {juntas|juntos}?', 'Quer ver a lista de salas? 🌱'],
        depois: ['Você cuida bem das plantas! 🌱', 'Que cientista {caprichosa|caprichoso}!', 'Volte sempre ao laboratório!'],
      },
      // capítulo 10, "Conhecendo as plantas"
      'lab-malu': {
        oi: ['Oi! Eu sou a Jardineira Malu!', 'Aqui conhecemos as plantas. 🌱', 'Planta também é ser vivo!'],
        nova: ['Vamos conhecer as plantas? 🌱', 'Planta precisa de água e sol!'],
        depois: ['Que lindo! Você brotou! 🌼', 'Você cuida bem das plantas!'],
      },
      // capítulo 11, "As partes das plantas"
      'lab-bento': {
        oi: ['Olá! Eu sou o Biólogo Bento.', 'Toda planta tem suas partes.', 'Raiz, caule, folha e flor! 🌿'],
        nova: ['Vamos ver as partes da planta?', 'O fruto guarda as sementes!'],
        depois: ['Muito bem, {pesquisadora|pesquisador}!', 'Você conhece cada partezinha!'],
      },
      // capítulo 12, "As plantas se relacionam"
      'lab-jana': {
        oi: ['Oi! Eu sou a Guarda Jana. 🌳', 'Plantas e bichos são amigos.', 'A abelha leva o pólen da flor.'],
        nova: ['Quem ajuda as plantas? 🐝', 'Vamos descobrir {juntas|juntos}?'],
        depois: ['Que descoberta linda! 🌼', 'A natureza agradece a você!'],
      },
      // Sala das Experiências
      'lab-lupa': {
        oi: ['Eu sou a Detetive Lupa!', 'Eu investigo a natureza.'],
        nova: ['Vamos brincar com ciências?', 'Tenho jogos de detetive! 🔬'],
        depois: ['Caso resolvido! Muito bem! ✨'],
      },
      'lab-ravi': {
        oi: ['Olá! Eu sou o Explorador Ravi.', 'Aqui fazemos experiências!'],
        nova: ['Vamos fazer uma experiência?', 'Observe com calma e atenção.'],
        depois: ['Que descoberta incrível! ✨'],
      },
    },
    objetos: {
      // hall
      'ci-livro-aprendizagem': ['Este é o livro verde! 📗', 'É o Livro de Aprendizagem.'],
      'ci-livro-atividades': ['Este é o livro amarelo! 📒', 'É o Livro de Atividades.'],
      'ci-mapa': ['É o Laboratório de Ciências!', 'Você está aqui, no hall.', 'Cada capítulo tem uma galeria.',
        'Em cima dela fica a estufa.', 'Em cima do hall, experiências!'],
      // capítulo 10
      'ci-girassol': ['Um girassol bem alto!', 'Ele gosta muito de sol. ☀️'],
      'ci-cacto': ['Um cacto do deserto! 🌵', 'Ele guarda água no caule.'],
      'ci-aguape': ['O aguapé vive na água! 💧', 'Nem toda planta vive na terra.'],
      'ci-broto': ['Um feijão brotou! 🌱', 'Ele precisa de água e de luz.'],
      'ci-regador': ['Um regador cheio de água! 💧', 'Planta também tem sede.'],
      // capítulo 11
      'ci-raizes': ['Um vaso de vidro com raízes!', 'A raiz bebe a água da terra.'],
      'ci-frutas': ['Uma cesta cheia de frutas! 🍎', 'Dentro delas há sementes.'],
      'ci-cenouras': ['A cenoura é uma raiz! 🥕', 'E é gostosa de comer.'],
      'ci-folhas': ['Folhinhas de hortelã! 🌿', 'As folhas gostam de luz.'],
      // capítulo 12
      'ci-colmeia': ['Abelhas visitam as flores! 🐝', 'Elas levam o pólen junto.'],
      'ci-ninho': ['Um ninho no galho! 🐦', 'A árvore é a casa dele.'],
      'ci-beija-flor': ['Um beija-flor bebe o néctar!', 'Ele também ajuda as flores.'],
      'ci-arvore': ['A árvore dá sombra e frutos.', 'Passarinhos espalham sementes!'],
    },
  });
})();
