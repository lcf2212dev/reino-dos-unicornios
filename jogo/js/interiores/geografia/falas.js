/* Estação dos Caminhos (Geografia): os personagens e o que eles e os objetos dizem.
   Cada página com até 30 letras (sem contar emoji), frases de 3 ou mais palavras. */
(function () {
  var R = window.Reino;

  /* ---------- personagens (vozes diferentes entre si) ---------- */
  // guia do hall
  R.registrarPersonagem({ id: 'geo-marco', nome: 'Maquinista Marco',
    sprite: { pele: '#c68a5e', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#2f8fd6', roupa: '#2f8fd6', roupa2: '#3a3a5a', apito: true },
    perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '+0%', tom: '-2Hz' } });
  // sala g1: Formas de se Comunicar
  R.registrarPersonagem({ id: 'geo-lais', nome: 'Intérprete Laís',
    sprite: { pele: '#f1c7a5', cabelo: '#8a5a3a', penteado: 'rabo', roupa: '#ff9d2e', roupa2: '#3a3a5a', presilha: true, cor2: '#6fa8ff' },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-4%', tom: '+6Hz' } });
  // sala g2: Meios de Comunicação
  R.registrarPersonagem({ id: 'geo-duda', nome: 'Locutora Duda',
    sprite: { pele: '#8a5a3a', cabelo: '#1f1410', penteado: 'cacheado', roupa: '#e0433f', roupa2: '#3a3a5a', oculos: true, oculosCor: '#ffd34d' },
    perfil: { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+6%', tom: '+4Hz' } });
  // sala g3: Telefone e Internet Segura
  R.registrarPersonagem({ id: 'geo-teo', nome: 'Técnico Téo',
    sprite: { pele: '#f1c7a5', cabelo: '#3a2418', penteado: 'curto', roupa: '#39c5bb', roupa2: '#3a4a6a', cracha: true, cor2: '#5a6cff' },
    perfil: { voz: 'en-US-BrianMultilingualNeural', velocidade: '+2%', tom: '+2Hz' } });
  // sala g4: Trânsito Seguro
  R.registrarPersonagem({ id: 'geo-beto', nome: 'Guarda Beto',
    sprite: { pele: '#b07a52', cabelo: '#1f1414', penteado: 'curto', chapeu: 'bone', chapeuCor: '#ffd34d', roupa: '#ffd34d', roupa2: '#3a3a5a', apito: true },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-2%', tom: '-6Hz' } });
  // sala g5: Problemas no Trânsito
  R.registrarPersonagem({ id: 'geo-cora', nome: 'Ciclista Cora',
    sprite: { pele: '#ffe0c7', cabelo: '#c9304a', penteado: 'trancas', chapeu: 'bone', chapeuCor: '#39a860', roupa: '#6fdc8c', roupa2: '#2f4f8a' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+4%', tom: '+12Hz' } });

  /* ---------- falas ---------- */
  R.falasDoPredio('geografia', {
    npcs: {
      'geo-marco': {
        oi: ['Oi, eu sou o Maquinista Marco!', 'Todos os caminhos passam aqui!'],
      },
      'geo-lais': {
        oi: ['Oi, eu sou a Intérprete Laís!', 'Eu converso em Libras! 🤟'],
        nova: ['Vamos aprender a comunicar?', 'Vamos conversar com sinais?'],
        feita: ['Quer conversar de novo comigo?', 'Vamos brincar com os sinais?'],
        depois: ['Que conversa mais bonita! 💬', 'Você se comunicou muito bem! ✨'],
      },
      'geo-duda': {
        oi: ['Olá, eu sou a Locutora Duda!', 'Eu falo no rádio! 📻'],
        nova: ['Individual ou coletivo? Vamos?', 'Vamos separar os meios?'],
        feita: ['Quer separar tudo de novo?', 'Vamos ouvir o rádio outra vez?'],
        depois: ['Notícia boa: você acertou! 📻', 'Você separou com atenção! ✨'],
      },
      'geo-teo': {
        oi: ['Oi, eu sou o Técnico Téo!', 'Eu cuido dos telefones! ☎️'],
        nova: ['Do telefone ao celular: vamos?', 'Internet segura é com adulto!'],
        feita: ['Vamos navegar com cuidado?', 'Vamos brincar de telefone?'],
        depois: ['Você navegou com cuidado! 💻', 'Que ligação caprichada! ✨'],
      },
      'geo-beto': {
        oi: ['Olá, eu sou o Guarda Beto!', 'Eu cuido do trânsito! 🚦'],
        nova: ['Vamos atravessar na faixa?', 'Vermelho, amarelo ou verde?'],
        feita: ['Quer revisar o semáforo?', 'Vamos ler as placas de novo?'],
        depois: ['Você atravessou com cuidado! 🚦', 'Que pedestre caprichosa! ✨'],
      },
      'geo-cora': {
        oi: ['Oi, eu sou a Ciclista Cora!', 'Eu vou de bicicleta! 🚲'],
        nova: ['Vamos ajudar o trânsito?', 'Vamos pedalar sem fumaça?'],
        feita: ['Quer pedalar de novo comigo?', 'Vamos cuidar da cidade?'],
        depois: ['O ar ficou mais limpinho! 🌿', 'Você ajudou a cidade! ✨'],
      },
    },
    objetos: {
      // hall
      'livro': ['O Livro dos Caminhos! 📖', 'Vamos ler com calma?'],
      'linha-tempo': ['A linha do tempo dos meios!', 'Carta, telefone, rádio e TV.', 'Depois veio o celular! 📱'],
      'bebedouro': ['Um golinho de água? 💧', 'Descanse os olhos um pouco.'],
      // sala 1
      'libras': ['As mãos também conversam! 🤟', 'Isso é a Libras.'],
      // sala 2
      'radio': ['O rádio fala com muita gente!', 'Ele usa só os sons. 🔊'],
      'correio': ['A caixa de correio! 📮', 'A carta precisa do CEP.'],
      // sala 3
      'telefone': ['Um telefone antigo, de fio! ☎️', 'Ele só transmitia som.'],
      'computador': ['Internet só com um adulto!', 'E a câmera fica desligada. 📷'],
      // sala 4
      'semaforo': ['Vermelho: pare! 🔴', 'Amarelo: atenção! 🟡', 'Verde: siga! 🟢'],
      'faixa': ['A faixa de pedestres!', 'Atravesse sempre por aqui.'],
      // sala 5
      'bicicleta': ['A bicicleta não solta fumaça!', 'Ela ajuda o ar da cidade. 🚲'],
      'ponto': ['O ponto de ônibus! 🚌', 'O ônibus leva muita gente.'],
    },
  });
})();
