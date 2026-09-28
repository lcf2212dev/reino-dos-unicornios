/* Planeta Netuno, as falas das brincadeiras (netuno-brincadeiras.js): o cata-vento, os gêiseres, os tubos de ensaio,
   os cristais azuis, as relíquias do Memo e as curiosidades da Vovó Ventania. Uma parte das falas do Observatório
   (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz carregam num vm. */
(function () {
  var R = window.Reino;
  var VOVO = 'npc-netuno-vovo', NARRA = 'narradora';

  var netuno = {
    catavento: ['O vento girou o cata-vento!', 'Aqui o vento é fortíssimo!'],
    geiser: ['O gêiser espirrou gelo! ✨', 'Tritão tem gêiser de verdade!'],
    // tubos de ensaio: cada toque, uma cor (água com corante, sem perigo)
    tubos: {
      cores: ['A água ficou verde!', 'A água ficou rosa!', 'A água ficou roxa!', 'A água ficou azul!'],
      fim: 'É só água com corante!',
    },
    cristais: {
      pegou: 'Você pegou um cristal azul!',
      faltam: { 4: 'Faltam quatro cristais!', 3: 'Faltam três cristais!', 2: 'Faltam dois cristais!', 1: 'Falta só um cristal!' },
      todos: ['Você pegou os cinco! 🎉', 'Que azul mais brilhante! 💎', 'Eles vão brilhar de novo.'],
      ja: ['Esse cristal você já pegou!'],
    },
    // relíquias do Memo: como era antigamente (História)
    reliquias: {
      carta: ['Antigamente se escrevia carta.', 'Ela chegava pelo correio.'],
      telefone: ['O telefone antigo tinha fio.', 'Ele ficava preso na parede.'],
      relogio: ['Esse relógio é bem antigo.', 'Precisava dar corda nele!'],
      foto: ['A foto antiga não tinha cor.', 'Era em preto e branco!'],
      livro: ['Esse livro é bem velhinho.', 'Ele guarda histórias antigas.'],
    },
    // curiosidades de verdade (voz da Vovó Ventania), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Science — https://science.nasa.gov/neptune/facts/ (8º planeta, o mais longe do Sol)
      { id: 'longe', paginas: ['Netuno é o mais longe do Sol.', 'Ele é o oitavo planeta!'] },
      // fonte: NASA Science — o metano da atmosfera deixa Netuno azul
      { id: 'azul', paginas: ['Um gás deixa Netuno azulzinho.', 'O nome do gás é metano.'] },
      // fonte: NASA Science — os ventos mais rápidos do Sistema Solar (mais de 2.000 km/h)
      { id: 'vento', paginas: ['Netuno tem o vento mais forte.', 'Mais forte do Sistema Solar!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-neptune/ (muito frio, longe do Sol)
      { id: 'frio', paginas: ['Netuno é muito, muito frio!', 'Mais frio que um congelador!'] },
      // fonte: NASA Science — descoberto em 1846 pelas contas de Le Verrier, antes de ser visto
      { id: 'contas', paginas: ['Acharam Netuno fazendo contas!', 'Depois viram no telescópio.'] },
      // fonte: NASA Science — uma volta no Sol dura cerca de 165 anos da Terra
      { id: 'ano', paginas: ['Um ano aqui demora muito!', 'Dura uns 165 anos da Terra!'] },
      // fonte: NASA Science — https://science.nasa.gov/neptune/moons/triton/ (a maior lua, com gêiseres)
      { id: 'tritao', paginas: ['A maior lua se chama Tritão.', 'A gente está nela agora!'] },
    ],
    VOZES: { VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  netuno.catavento.concat(netuno.geiser, netuno.tubos.cores, [netuno.tubos.fim]).forEach(function (p) { add(p, NARRA); });
  var c = netuno.cristais;
  [c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todos, c.ja).forEach(function (p) { add(p, NARRA); });
  Object.keys(netuno.reliquias).forEach(function (k) { netuno.reliquias[k].forEach(function (p) { add(p, NARRA); }); });
  netuno.curiosidades.forEach(function (cu) { cu.paginas.forEach(function (p) { add(p, VOVO); }); });

  R.falasDoPredio('observatorio', { netuno: netuno, extras: extras });
})();
