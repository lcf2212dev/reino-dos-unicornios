/* Estação dos Caminhos: a Geografia do Mundo do 4º bimestre (docs/contratos/quarto-bimestre.md §7). Os personagens e
   o que eles e os objetos dizem (gravado com a voz de cada um, pacote interior-geografia). Cada página com até 30
   letras (sem contar emoji), frases de 3 ou mais palavras. As estações das salas falam a página e o nome da sala
   (gerado em geografia/geografia.js a partir dos dados). Os mesmos personagens (e vozes) do 3º bimestre, com falas
   novas; as falas do 3º bimestre estão em arquivo/terceiro-bimestre/jogo/js/interiores/geografia/falas.js. */
(function () {
  var R = window.Reino;

  /* ---------- personagens (vozes diferentes entre si) ---------- */
  // guia do saguão
  R.registrarPersonagem({ id: 'geo-marco', nome: 'Maquinista Marco',
    sprite: { pele: '#c68a5e', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#2f8fd6', roupa: '#2f8fd6', roupa2: '#3a3a5a', mapa: true },
    perfil: { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '+0%', tom: '-2Hz' } });
  // saguão: a bilheteria
  R.registrarPersonagem({ id: 'geo-lais', nome: 'Intérprete Laís',
    sprite: { pele: '#f1c7a5', cabelo: '#8a5a3a', penteado: 'rabo', roupa: '#ff9d2e', roupa2: '#3a3a5a', presilha: true, cor2: '#6fa8ff' },
    perfil: { voz: 'pt-BR-ThalitaMultilingualNeural', velocidade: '-4%', tom: '+6Hz' } });
  // saguão: a locutora da estação
  R.registrarPersonagem({ id: 'geo-duda', nome: 'Locutora Duda',
    sprite: { pele: '#8a5a3a', cabelo: '#1f1410', penteado: 'cacheado', roupa: '#e0433f', roupa2: '#3a3a5a', oculos: true, oculosCor: '#ffd34d' },
    perfil: { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+6%', tom: '+4Hz' } });
  // plataforma do capítulo 10: matérias-primas
  R.registrarPersonagem({ id: 'geo-teo', nome: 'Técnico Téo',
    sprite: { pele: '#f1c7a5', cabelo: '#3a2418', penteado: 'curto', roupa: '#39c5bb', roupa2: '#3a4a6a', cracha: true, cor2: '#5a6cff' },
    perfil: { voz: 'en-US-BrianMultilingualNeural', velocidade: '+2%', tom: '+2Hz' } });
  // plataforma do capítulo 12: transformação das paisagens
  R.registrarPersonagem({ id: 'geo-beto', nome: 'Guarda Beto',
    sprite: { pele: '#b07a52', cabelo: '#1f1414', penteado: 'curto', chapeu: 'bone', chapeuCor: '#ffd34d', roupa: '#ffd34d', roupa2: '#3a3a5a', apito: true },
    perfil: { voz: 'fr-FR-RemyMultilingualNeural', velocidade: '-2%', tom: '-6Hz' } });
  // plataforma do capítulo 11: paisagem (ciclista mirim)
  R.registrarPersonagem({ id: 'geo-cora', nome: 'Ciclista Cora',
    sprite: { idade: 'crianca', pele: '#ffe0c7', cabelo: '#c9304a', penteado: 'trancas', chapeu: 'bone', chapeuCor: '#39a860', roupa: '#6fdc8c', roupa2: '#2f4f8a' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+10%', tom: '+28Hz' } });

  /* ---------- falas ---------- */
  R.falasDoPredio('geografia', {
    npcs: {
      // o guia do saguão (o convite é o resumo automático do motor)
      'geo-marco': {
        oi: ['Piuí! Sou o Maquinista Marco!', 'Aqui mora a Geografia! 🧭', 'Cada plataforma é um capítulo.'],
        depois: ['Boa viagem pelos livros! ✨'],
      },
      'geo-lais': {
        oi: ['Oi! Eu sou a Intérprete Laís.', 'Esta é a bilheteria!'],
        nova: ['Os dois livros estão ali! 📗'],
        depois: ['Você foi longe hoje! 🌟'],
      },
      'geo-duda': {
        oi: ['Atenção, passageiros!', 'Eu sou a Locutora Duda!'],
        nova: ['O trem dos livros vai partir!'],
        depois: ['Que viagem caprichada! ✨'],
      },
      // capítulo 10: Matérias-primas: de onde vêm?
      'geo-teo': {
        oi: ['Oi! Sou o Técnico Téo.', 'Tudo é feito de matéria-prima!'],
        nova: ['De onde vem a madeira? 🌳', 'Vamos descobrir {juntas|juntos}?'],
        depois: ['O lápis vem da natureza! ✏️', 'Você aprendeu muito! ✨'],
      },
      // capítulo 11: Paisagem: retrato de um lugar
      'geo-cora': {
        oi: ['Oi! Sou a Ciclista Cora! 🚲', 'Eu pedalo e olho as paisagens.'],
        nova: ['O que tem nesta paisagem? 🏞️', 'Vamos olhar com calma?'],
        depois: ['Que olhar atento! ✨', 'Você viu tudinho! 📷'],
      },
      // capítulo 12: Transformação das paisagens
      'geo-beto': {
        oi: ['Olá! Eu sou o Guarda Beto.', 'Eu vi esta cidade crescer!'],
        nova: ['A paisagem muda com o tempo.', 'Vamos ver o antes e o depois?'],
        depois: ['Você entendeu as mudanças! ✨', 'Que trabalho bonito! 🌟'],
      },
    },
    objetos: {
      // saguão
      'ge-livro-aprendizagem': ['O Livro de Aprendizagem! 📗', 'Os capítulos 10, 11 e 12.'],
      'ge-livro-atividades': ['O Livro de Atividades! 📒', 'Os capítulos 10, 11 e 12.'],
      'ge-mapa': ['O mapa da estação! 🧭', 'Embaixo fica o saguão.', 'No meio, as plataformas.', 'Em cima, os vagões.'],
      'ge-painel': ['O painel dos trens!', 'Um trem para cada capítulo.', 'Vamos embarcar? ✨'],
      'ge-bilheteria': ['A bilheteria da estação!', 'O bilhete é a vontade de ler!'],
      'ge-bebedouro': ['Um golinho de água? 💧', 'Descanse os olhos um pouco.'],
      'ge-relogio': ['O relógio da estação! ⏰', 'O trem chega na hora certa.'],
      // capítulo 10
      'ge-lapis': ['As partes do lápis!', 'O grafite vem das rochas. 🪨', 'A madeira vem das árvores. 🌳', 'A borracha vem do látex.'],
      'ge-seringueira': ['Esta árvore é a seringueira.', 'Dela sai o látex branquinho.', 'Com ele se faz a borracha!'],
      'ge-colmeia': ['O mel vem das abelhas! 🐝', 'É uma matéria-prima animal.'],
      'ge-sal': ['Um monte de sal! 🧂', 'É uma matéria-prima mineral.'],
      // capítulo 11
      'ge-camera': ['A câmera tira um retrato! 📷', 'A paisagem é tudo que se vê.'],
      'ge-paisagem-natural': ['Uma paisagem natural! ⛰️', 'Montanha, rio e árvores.'],
      'ge-paisagem-cidade': ['A paisagem da cidade! 🏠', 'O ser humano fez os prédios.'],
      // capítulo 12
      'ge-antes-depois': ['Antes, só tinha árvores. 🌳', 'Depois, vieram as casas! 🏠', 'A paisagem se transformou.'],
      'ge-gruta': ['Uma gruta perto do mar! 🌊', 'As ondas furaram a pedra.', 'Isso levou muito tempo!'],
      'ge-muda': ['Uma mudinha de árvore! 🌱', 'Plantar muda a paisagem!'],
    },
  });
})();
