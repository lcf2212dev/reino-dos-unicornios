/* Laboratório de Ciências (3º andar do Observatório): os personagens e o que eles e os objetos dizem.
   Uma parte das falas do Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga).
   Cada página com até 30 letras (sem contar emoji), frases de 3 ou mais palavras. */
(function () {
  var R = window.Reino;

  /* ---------- personagens (voz pt-BR do edge-tts; diferentes da Vega e do Cosmo) ---------- */
  // guia do Hall
  R.registrarPersonagem({ id: 'lab-iris', nome: 'Professora Íris',
    sprite: { pele: '#c68a62', cabelo: '#3a2418', penteado: 'coque', oculos: true, oculosCor: '#2f6fd6', jaleco: true, roupa: '#39c5bb', roupa2: '#3a3a5a', perna: 'saia', cracha: true },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-8%', tom: '+10Hz' } });
  // sala c1: Vivo ou Não Vivo?
  R.registrarPersonagem({ id: 'lab-bento', nome: 'Biólogo Bento',
    sprite: { pele: '#f1c7a5', cabelo: '#8a5a3a', penteado: 'cacheado', chapeu: 'palha', roupa: '#8fb83a', roupa2: '#6b4428', bolsa: true, bolsaCor: '#c98a4b' },
    perfil: { voz: 'en-US-AndrewMultilingualNeural', velocidade: '+2%', tom: '+6Hz' } });
  // sala c2: Quem Ganha, Quem Perde
  R.registrarPersonagem({ id: 'lab-jana', nome: 'Guarda Jana',
    sprite: { pele: '#8a5a3a', cabelo: '#1f1410', penteado: 'trancas', chapeu: 'bone', chapeuCor: '#6b8a3a', roupa: '#a8b86a', roupa2: '#5a4a2a', apito: true },
    perfil: { voz: 'en-US-AvaMultilingualNeural', velocidade: '+2%', tom: '-6Hz' } });
  // sala c3: Amigos da Natureza
  R.registrarPersonagem({ id: 'lab-malu', nome: 'Jardineira Malu',
    sprite: { idade: 'crianca', pele: '#ffe0c7', cabelo: '#c9304a', penteado: 'rabos', roupa: '#ff9cc6', perna: 'vestido', flor: true },
    perfil: { voz: 'fr-FR-VivienneMultilingualNeural', velocidade: '+8%', tom: '+20Hz' } });
  // sala c4: Cada Um no Seu Hábitat
  R.registrarPersonagem({ id: 'lab-ravi', nome: 'Explorador Ravi',
    sprite: { pele: '#b07a52', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'chapeu', chapeuCor: '#c9a46a', roupa: '#e8c890', roupa2: '#6b4428', cachecol: true, cachecolCor: '#5fb4ff' },
    perfil: { voz: 'en-AU-WilliamMultilingualNeural', velocidade: '-2%', tom: '-8Hz' } });
  // sala c5: Detetives da Natureza
  R.registrarPersonagem({ id: 'lab-lupa', nome: 'Detetive Lupa',
    sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', chapeu: 'boina', chapeuCor: '#8a5a3a', roupa: '#c98a4b', roupa2: '#3a3a5a', gola: '#fff8ee' },
    perfil: { voz: 'pt-BR-FranciscaNeural', velocidade: '+4%', tom: '+18Hz' } });

  /* ---------- falas dos personagens ---------- */
  R.falasDoPredio('observatorio', { npcs: {
    'lab-iris': {
      oi: ['Oi, eu sou a Professora Íris!', 'Aqui a gente estuda a vida!'],
    },
    'lab-bento': {
      oi: ['Oi, eu sou o Biólogo Bento!', 'Eu cuido das formiguinhas.'],
      nova: ['Isso é vivo ou não vivo?', 'Vamos olhar o formigueiro?'],
      feita: ['Quer investigar de novo?', 'Vamos olhar mais seres vivos?'],
      depois: ['Você achou os seres vivos! 🌱', 'Que olhar de cientista! ✨'],
    },
    'lab-jana': {
      oi: ['Olá, eu sou a Guarda Jana!', 'Eu cuido dos bichos do parque.'],
      nova: ['Quem ganha e quem perde?', 'Vamos ver a onça e o jacaré?'],
      feita: ['Quer voltar ao parque comigo?', 'Vamos ver os bichos de novo?'],
      depois: ['Você entendeu os bichos! 🐾', 'Que guarda {caprichosa|caprichoso}! ✨'],
    },
    'lab-malu': {
      oi: ['Oi, eu sou a Malu! 🌸', 'Meu amigo é o beija-flor.'],
      nova: ['Vamos ver amigos da natureza?', 'Vamos jogar a memória?'],
      feita: ['Quer brincar de novo comigo?', 'Vamos jogar outra vez? 🌸'],
      depois: ['Todo mundo se ajudou! 🌸', 'Você é {amiga|amigo} da natureza! ✨'],
    },
    'lab-ravi': {
      oi: ['Olá, eu sou o Explorador Ravi!', 'Já fui do deserto ao gelo!'],
      nova: ['Cada bicho tem a sua casa.', 'Vamos explorar os hábitats?'],
      feita: ['Quer explorar de novo comigo?', 'Vamos viajar outra vez?'],
      depois: ['Que viagem mais corajosa!', 'Você achou cada hábitat! ✨'],
    },
    'lab-lupa': {
      oi: ['Olá, eu sou a Detetive Lupa!', 'Eu sigo as pistas dos bichos.'],
      nova: ['Vamos resolver um mistério?', 'Quem mora aqui? Vamos ver?'],
      feita: ['Quer investigar de novo?', 'Vamos seguir mais pistas?'],
      depois: ['O mistério foi resolvido!', 'Você é {uma ótima|um ótimo} detetive! ✨'],
    },
  } });

  /* ---------- falas dos objetos (voz da narradora) ---------- */
  R.falasDoPredio('observatorio', { objetos: {
    // hall
    'lab-livro': ['O Livro de Ciências! 📖', 'Vamos ler com calma?'],
    'lab-mapa': ['O mapa do laboratório.', 'São cinco salas para visitar.'],
    'lab-microscopio': ['Um microscópio de verdade!', 'Ele mostra o bem pequeninho.'],
    'lab-tubos': ['Tubos com água colorida!', 'Cientista testa com cuidado.'],
    // sala 1: Vivo ou Não Vivo?
    'lab-formigueiro': ['Um formigueiro de vidro!', 'As formigas são seres vivos.', 'Elas nascem, comem e crescem.'],
    'lab-broto': ['Um brotinho de feijão! 🌱', 'A planta nasce e cresce.', 'Ela também é um ser vivo.'],
    'lab-pedra': ['Uma pedra bem redondinha.', 'A pedra não nasce nem cresce.', 'Ela é um elemento não vivo.'],
    'lab-agua': ['Água fresquinha no galão! 💧', 'A água não é viva.', 'Mas todo ser vivo precisa dela.'],
    // sala 2: Quem Ganha, Quem Perde
    'lab-onca': ['A onça é uma caçadora!', 'Ela ganha e a caça perde.'],
    'lab-jacare': ['O jacaré mora no rio.', 'A onça pode caçar o jacaré.'],
    'lab-gafanhoto': ['Um gafanhoto comilão!', 'Ele come as folhas da planta.'],
    'lab-pulgas': ['Esse cãozinho tem pulgas!', 'A pulga ganha e o cão perde.'],
    'lab-colmeia': ['Uma colmeia de abelhas! 🐝', 'Cada abelha tem um trabalho.', 'Elas vivem em sociedade.'],
    // sala 3: Amigos da Natureza
    'lab-bufalo': ['O búfalo e o passarinho!', 'O pássaro come os bichinhos.', 'O búfalo fica limpinho.'],
    'lab-beija-flor': ['O beija-flor bebe o néctar.', 'Ele leva pólen de flor em flor.', 'Os dois saem ganhando! 🌸'],
    'lab-flores': ['A abelha visita as flores. 🐝', 'Ela ajuda a flor a dar frutos.'],
    'lab-memoria': ['O jogo da memória!', 'Ache os pares de amigos.'],
    // sala 4: Cada Um no Seu Hábitat
    'lab-urso': ['O urso-polar mora no gelo.', 'O pelo grosso esquenta ele.'],
    'lab-aguape': ['O aguapé boia na água! 🐟', 'O peixe mora no aquário.'],
    'lab-cacto': ['O cacto guarda água dentro.', 'Ele vive bem na Caatinga.'],
    'lab-camelo': ['O camelo mora no deserto.', 'Ele fica dias sem beber água.'],
    'lab-caatinga': ['Esta é a Caatinga do Brasil.', 'Lá chove pouco e faz calor.'],
    'lab-termometro': ['Um termômetro de hábitats!', 'No gelo frio, no deserto calor.'],
    // sala 5: Detetives da Natureza
    'lab-mesa': ['A mesa do detetive!', 'A lupa mostra as pistas.'],
    'lab-preguica': ['Um bicho-preguiça na árvore!', 'Ele se mexe bem devagar.'],
    'lab-pinguim': ['O pinguim nada no mar gelado.', 'As penas protegem do frio.'],
    'lab-tartaruga': ['A tartaruga marinha nada!', 'Ela bota ovos na areia.'],
    'lab-feneco': ['O feneco tem orelhas grandes!', 'Elas soltam o calor do deserto.'],
    'lab-lagarto': ['O lagarto-de-colar abre a gola!', 'Assim ele assusta quem chega.'],
    'lab-lobo': ['O lobo-do-ártico é branquinho.', 'Ele se esconde na neve.'],
  } });

  // cavaleira da ala de Ciências no Castelo: registrada em castelo/castelo.js (o Castelo carrega antes daqui)
})();
