/* Observatório, 2º andar (Centro de Pesquisas Avançadas da NASA): as falas da Doutora Lia, do Astronauta
   Davi e da Engenheira Bia, as curiosidades de foguetes, missões e da Estação Espacial e as explicações das
   experiências. Só diversão: nada de pergunta, estrela, dinheiro ou save.
   Uma parte das falas do Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga).
   Cada página é uma frase inteira com até 30 letras (sem contar «» e emoji) e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz e o validador carregam este arquivo num vm. */
(function () {
  var R = window.Reino;
  var npcs = {};
  var extras = [];

  // a doutora da Sala de Controle: foguetes e missões (voz npc-nasa-lia)
  npcs['nasa-lia'] = {
    oi: ['Oi! Eu sou a doutora Lia.', 'Aqui cuidamos dos foguetes!'],
    nova: ['Quer ouvir um segredo? 🚀', 'Tenho uma curiosidade nova!'],
    depois: ['Volte sempre para a NASA! 🚀', 'Até a próxima missão!'],
  };
  // o astronauta do Hangar: como é viver no espaço (voz npc-nasa-davi)
  npcs['nasa-davi'] = {
    oi: ['Oi! Eu sou o astronauta Davi.', 'Eu já morei no espaço!'],
    nova: ['Quer saber como é lá em cima?', 'Vou contar da minha viagem!'],
    depois: ['Até logo, {pequena astronauta|pequeno astronauta}!', 'Tchau! Eu vou voar de novo!'],
  };
  // a engenheira do Laboratório: a Estação Espacial e as experiências (voz npc-nasa-bia)
  npcs['nasa-bia'] = {
    oi: ['Oi! Eu sou a engenheira Bia.', 'Eu adoro fazer experiências!'],
    nova: ['Toque nas experiências! ✨', 'Vamos descobrir {juntas|juntos}?'],
    depois: ['Você é {uma ótima|um ótimo} cientista! ⭐', 'Volte para experimentar!'],
  };

  var nasa = {
    // nomes nos balões
    nomes: {
      'nasa-foguete': 'Foguete da NASA', 'nasa-pena': 'Pena e martelo', 'nasa-fases': 'Fases da Lua',
      'nasa-horta': 'Horta espacial',
    },
    // quem conta cada tema (a voz é a do NPC)
    curiosidades: [
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/launch-rocket/en/
      { id: 'foguete-fogo', tema: 'foguetes', paginas: ['O foguete solta fogo embaixo.', 'O fogo empurra o foguete.', 'Assim ele sobe para o céu!'] },
      // fonte: NASA — https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-rocket-grades-k-4/
      { id: 'foguete-partes', tema: 'foguetes', paginas: ['O foguete tem várias partes.', 'Cada parte cai quando acaba.', 'Assim ele fica mais leve!'] },
      // fonte: NASA — https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-rocket-grades-k-4/
      { id: 'foguete-rapido', tema: 'foguetes', paginas: ['O foguete é muito rápido.', 'Ele é mais rápido que avião!'] },
      // fonte: NASA — https://www.nasa.gov/history/apollo-11/
      { id: 'apolo-11', tema: 'missoes', paginas: ['A missão Apolo 11 foi à Lua.', 'Isso foi no ano de 1969.'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'lua-pegadas', tema: 'missoes', paginas: ['Astronautas pisaram na Lua.', 'As pegadas ainda estão lá.', 'Lá não tem vento para apagar!'] },
      // fonte: NASA — https://www.nasa.gov/humans-in-space/artemis/
      { id: 'artemis', tema: 'missoes', paginas: ['A NASA quer voltar à Lua.', 'A missão se chama Ártemis.'] },
      // fonte: NASA Science — https://science.nasa.gov/mission/mars-2020-perseverance/
      { id: 'marte-robos', tema: 'missoes', paginas: ['Robôs passeiam em Marte.', 'Eles tiram fotos das pedras.'] },
      // fonte: NASA Science — https://science.nasa.gov/mission/voyager/
      { id: 'voyager', tema: 'missoes', paginas: ['A sonda Voyager viaja há anos.', 'Ela está muito longe do Sol!'] },
      // fonte: NASA — https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
      { id: 'estacao-volta', tema: 'estacao', paginas: ['A Estação Espacial voa rápido.', 'Ela dá a volta na Terra.', 'Leva só uma hora e meia!'] },
      // fonte: NASA — https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
      { id: 'estacao-sol', tema: 'estacao', paginas: ['Na Estação Espacial é assim.', 'O Sol nasce 16 vezes por dia!'] },
      // fonte: NASA — https://www.nasa.gov/learning-resources/
      { id: 'estacao-banho', tema: 'estacao', paginas: ['No espaço não tem chuveiro.', 'Eles se limpam com toalhinha.'] },
      // fonte: NASA — https://www.nasa.gov/humans-in-space/
      { id: 'flutuar', tema: 'astronautas', paginas: ['No espaço, tudo flutua.', 'Os astronautas dormem presos.', 'Eles usam um saco de dormir!'] },
      // fonte: NASA — https://www.nasa.gov/humans-in-space/food-in-space/
      { id: 'comida', tema: 'astronautas', paginas: ['Astronautas comem tortilha.', 'Pão faz farelo que flutua!'] },
      // fonte: NASA — https://www.nasa.gov/humans-in-space/twins-study/
      { id: 'mais-alto', tema: 'astronautas', paginas: ['No espaço, o corpo estica.', 'O astronauta fica mais alto!', 'Na Terra, ele volta ao normal.'] },
      // fonte: NASA — https://www.nasa.gov/suited-for-spacewalking/
      { id: 'traje', tema: 'astronautas', paginas: ['O traje é uma nave pequena.', 'Ele tem ar para respirar.'] },
      // fonte: Agência Espacial Brasileira — https://www.gov.br/aeb/
      { id: 'marcos-pontes', tema: 'astronautas', paginas: ['Marcos Pontes é brasileiro.', 'Ele foi à Estação Espacial!'] },
    ],
    // explicações das experiências (voz npc-nasa-bia)
    experiencias: {
      // o foguete sobe durante a contagem
      foguete: ['Atenção, contagem regressiva!', 'Três, dois, um... já! 🚀', 'O fogo empurra o foguete!'],
      // fonte: NASA — https://www.nasa.gov/history/the-apollo-15-hammer-feather-drop/
      pena: ['Na Lua não tem ar nenhum.', 'Pena e martelo caem juntos!', 'Um astronauta fez isso lá!'],
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/moon-phases/en/
      fases: ['A lâmpada é o nosso Sol.', 'A bola é a Lua girando.', 'Vemos partes da Lua acesas.'],
      // fonte: NASA — https://www.nasa.gov/image-article/veggie-plant-growth-system/
      horta: ['Plantas crescem no espaço!', 'Na Estação tem uma horta.', 'Lá já colheram alface!'],
    },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var TEMA_VOZ = { foguetes: 'npc-nasa-lia', missoes: 'npc-nasa-lia', astronautas: 'npc-nasa-davi', estacao: 'npc-nasa-bia' };
  var vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  nasa.TEMA_VOZ = TEMA_VOZ;
  nasa.curiosidades.forEach(function (c) { c.paginas.forEach(function (p) { add(p, TEMA_VOZ[c.tema]); }); });
  Object.keys(nasa.experiencias).forEach(function (k) { nasa.experiencias[k].forEach(function (p) { add(p, 'npc-nasa-bia'); }); });

  R.falasDoPredio('observatorio', { npcs: npcs, nasa: nasa, extras: extras });
})();
