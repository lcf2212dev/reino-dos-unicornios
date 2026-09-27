/* Planeta Lua, as falas das brincadeiras (lua-brincadeiras.js): pulo, pedra que flutua, esconde-esconde com o
   Pipo, cristais e as curiosidades da Vovó Cratera. Uma parte das falas do Observatório
   (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras (sem contar emoji) e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz e o validador carregam este arquivo num vm. */
(function () {
  var R = window.Reino;
  var LUMI = 'npc-lua-lumi', PIPO = 'npc-lua-pipo', VOVO = 'npc-lua-vovo', NARRA = 'narradora';

  var lua = {
    // fonte: NASA Space Place — a gravidade da Lua é 1/6 da Terra
    pulo: {
      lumi: ['Vamos pular bem alto! 🌙', 'Na Lua a gente pula alto!', 'Seis vezes mais que na Terra!'],
      cratera: ['A cratera é um pula-pula!', 'Na Lua a gente pula alto!'],
    },
    flutua: ['A pedra ficou levinha! ✨', 'Na Lua tudo pesa menos.', 'Ela sobe e desce devagar.'],
    esconde: {
      comeco: ['Meu irmãozinho Tico sumiu!', 'Ele está atrás de uma pedra.', 'Toque nas pedras grandes!'],
      procurando: ['Procure nas pedras grandes!'],
      errou: ['Aqui não tem ninguém!', 'Tente outra pedra grande!'],
      achou: ['Oba! Você achou o Tico! 🎉', 'Você é {ótima|ótimo} nisso!'],
      denovo: ['O Tico se escondeu de novo!'],
      pedra: ['Uma pedra lunar grandona.'],
    },
    cristais: {
      pegou: 'Você pegou um cristal! ✨',
      faltam: { 4: 'Faltam quatro cristais!', 3: 'Faltam três cristais!', 2: 'Faltam dois cristais!', 1: 'Falta só um cristal!' },
      todos: ['Você pegou os cinco! 🎉', 'Que brilho lindo! 💎', 'Eles vão brilhar de novo.'],
      ja: ['Esse cristal você já pegou!'],
    },
    // curiosidades de verdade (voz da Vovó Cratera), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-the-moon/en/
      { id: 'luz', paginas: ['A Lua não tem luz própria.', 'Ela brilha com a luz do Sol!'] },
      // fonte: NASA Science — a Lua quase não tem atmosfera; as pegadas da Apolo continuam lá
      { id: 'pegadas', paginas: ['Na Lua não tem ar nem vento.', 'As pegadas duram muito tempo!'] },
      // fonte: NASA Science — https://science.nasa.gov/moon/
      { id: 'volta', paginas: ['A Lua gira em volta da Terra.', 'A volta leva quase um mês.'] },
      // fonte: NASA — https://www.nasa.gov/history/apollo-11/
      { id: 'apolo', paginas: ['Em 1969, gente pisou aqui!', 'Foi a primeira vez na Lua.'] },
      // fonte: NASA Space Place — a gravidade da Lua é 1/6 da Terra
      { id: 'pulo', paginas: ['Aqui a gente pesa menos.', 'Pula seis vezes mais alto!'] },
      // fonte: NASA Science — as crateras vêm de asteroides e cometas que bateram na Lua
      { id: 'crateras', paginas: ['As crateras são buracos.', 'Pedras do espaço bateram aqui.'] },
      // fonte: NASA Science — sem atmosfera o céu da Lua é preto até de dia
      { id: 'ceu', paginas: ['Aqui o céu é sempre preto.', 'É porque não tem ar!'] },
      // fonte: NASA Science — o som precisa de ar para viajar
      { id: 'silencio', paginas: ['Na Lua não tem barulho.', 'O som precisa de ar!'] },
      // fonte: NASA Science — cabem cerca de 50 Luas no volume da Terra
      { id: 'tamanho', paginas: ['A Lua é menor que a Terra.', 'Cabem umas 50 Luas na Terra!'] },
    ],
    VOZES: { LUMI: LUMI, PIPO: PIPO, VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  lua.pulo.lumi.forEach(function (p) { add(p, LUMI); });
  lua.pulo.cratera.forEach(function (p) { add(p, NARRA); });
  lua.flutua.forEach(function (p) { add(p, NARRA); });
  ['comeco', 'procurando', 'errou', 'achou', 'denovo'].forEach(function (k) { lua.esconde[k].forEach(function (p) { add(p, PIPO); }); });
  lua.esconde.pedra.forEach(function (p) { add(p, NARRA); });
  var c = lua.cristais;
  [c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todos, c.ja).forEach(function (p) { add(p, NARRA); });
  lua.curiosidades.forEach(function (cu) { cu.paginas.forEach(function (p) { add(p, VOVO); }); });

  R.falasDoPredio('observatorio', { lua: lua, extras: extras });
})();
