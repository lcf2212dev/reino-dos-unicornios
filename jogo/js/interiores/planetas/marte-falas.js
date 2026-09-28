/* Planeta Marte, as falas das brincadeiras (marte-brincadeiras.js): o Faísca e o tobogã de areia, o jipe-robô, o
   redemoinho, as pedrinhas coloridas e as curiosidades do Vovô Vulcão. Uma parte das falas do Observatório
   (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras (sem contar emoji) e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz e o validador carregam este arquivo num vm. */
(function () {
  var R = window.Reino;
  var FAISCA = 'npc-marte-faisca', VOVO = 'npc-marte-vovo', NARRA = 'narradora';

  var marte = {
    duna: {
      faisca: ['Vamos rolar na duna! ✨', 'Uiii! Que tobogã de areia!', 'A areia de Marte é macia!'],
      duna: ['Um tobogã de areia vermelha!', 'Escorregar aqui é bom!'],
    },
    jipe: ['O jipe-robô deu uma voltinha!', 'Ele explora Marte sozinho.'],
    redemoinho: ['Um redemoinho de poeira!', 'Ele gira, gira e passa.'],
    pedrinhas: {
      pegou: 'Você pegou uma pedrinha! ✨',
      faltam: { 4: 'Faltam quatro pedrinhas!', 3: 'Faltam três pedrinhas!', 2: 'Faltam duas pedrinhas!', 1: 'Falta só uma pedrinha!' },
      todas: ['Você pegou as cinco pedrinhas! 🎉', 'Que pedrinhas coloridas!', 'Elas vão brilhar de novo.'],
      ja: ['Essa pedrinha você já pegou!'],
    },
    // curiosidades de verdade (voz do Vovô Vulcão), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Science — o óxido de ferro (ferrugem) da poeira deixa Marte vermelho
      { id: 'ferrugem', paginas: ['Marte é o planeta vermelho.', 'O chão tem muita ferrugem!'] },
      // fonte: NASA Science — Olympus Mons é o maior vulcão do Sistema Solar
      { id: 'olimpo', paginas: ['Aqui tem o maior vulcão!', 'É o Monte Olimpo, olha lá!', 'O maior do Sistema Solar.'] },
      // fonte: NASA Science — as luas de Marte são Fobos e Deimos
      { id: 'luas', paginas: ['Marte tem duas luas pequenas.', 'Elas são Fobos e Deimos.'] },
      // fonte: NASA Science — o dia de Marte (sol) dura 24 h 37 min
      { id: 'dia', paginas: ['O dia aqui é quase igual.', 'Só uns minutinhos a mais!'] },
      // fonte: NASA Science — a temperatura média de Marte é de uns 60 graus abaixo de zero
      { id: 'frio', paginas: ['Marte é muito, muito frio.', 'Bem mais frio que a Terra!'] },
      // fonte: NASA Science — as calotas polares de Marte têm gelo de água e gelo seco
      { id: 'gelo', paginas: ['Tem gelo nos polos de Marte.', 'Os polos são branquinhos!'] },
      // fonte: NASA Science — Marte é o 4º planeta a partir do Sol
      { id: 'quarto', paginas: ['Marte é o quarto planeta.', 'Contando a partir do Sol!'] },
      // fonte: NASA — os jipes-robôs Curiosity e Perseverance exploram Marte
      { id: 'robos', paginas: ['Robôs de verdade andam aqui.', 'Eles tiram fotos e estudam!'] },
    ],
    VOZES: { FAISCA: FAISCA, VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  marte.duna.faisca.forEach(function (p) { add(p, FAISCA); });
  marte.duna.duna.concat(marte.jipe, marte.redemoinho).forEach(function (p) { add(p, NARRA); });
  var c = marte.pedrinhas;
  [c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todas, c.ja).forEach(function (p) { add(p, NARRA); });
  marte.curiosidades.forEach(function (cu) { cu.paginas.forEach(function (p) { add(p, VOVO); }); });

  R.falasDoPredio('observatorio', { marte: marte, extras: extras });
})();
