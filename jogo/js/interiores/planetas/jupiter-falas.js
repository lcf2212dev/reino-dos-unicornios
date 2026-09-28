/* Planeta Júpiter, as falas das brincadeiras (jupiter-brincadeiras.js): pular nas nuvens com o Bolha, o trampolim,
   o redemoinho, os cristais de amônia, as letras que flutuam e as curiosidades do Vovô Tempestade. Uma parte das
   falas do Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras (sem contar emoji) e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz carregam num vm. */
(function () {
  var R = window.Reino;
  var BOLHA = 'npc-jupiter-bolha', VOVO = 'npc-jupiter-vovo', NARRA = 'narradora';

  var jupiter = {
    pulo: {
      bolha: ['Vamos pular nas nuvens! ✨', 'Pula, pula, bem alto!', 'Você pula muito bem!'],
      trampolim: ['Uma nuvem de pular!', 'Você voou lá no alto! ✨'],
    },
    redemoinho: ['O redemoinho está girando!', 'O vento faz a nuvem rodar! ✨'],
    cristais: {
      pegou: 'Você pegou um cristal!',
      faltam: { 4: 'Faltam quatro cristais!', 3: 'Faltam três cristais!', 2: 'Faltam dois cristais!', 1: 'Falta só um cristal!' },
      todos: ['Você pegou os cinco! 🎉', 'Que cristais mais bonitos! 💎', 'Eles vão brilhar de novo.'],
      ja: ['Esse cristal você já pegou!'],
    },
    // letras que flutuam: cada uma ensina uma palavra que começa com ela
    letras: {
      A: ['Amigo começa com A!', 'Você é {minha amiga|meu amigo}! 💛'],
      B: ['Bola começa com B!', 'Vamos jogar bola na nuvem?'],
      E: ['Estrela começa com E!', 'Olhe as estrelas no céu!'],
      I: ['Ilha começa com I!', 'Aqui tem ilha de nuvem!'],
      U: ['Unicórnio começa com U!', 'Os unicórnios do seu Reino!'],
    },
    // curiosidades de verdade (voz do Vovô Tempestade), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Science — https://science.nasa.gov/jupiter/facts/ (o maior planeta do Sistema Solar)
      { id: 'maior', paginas: ['Júpiter é o maior planeta!', 'O maior do Sistema Solar!'] },
      // fonte: NASA Science — gigante gasoso, sem chão firme
      { id: 'gas', paginas: ['Júpiter é feito de gás.', 'Por isso andamos na nuvem!'] },
      // fonte: NASA Science — https://science.nasa.gov/jupiter/ (Grande Mancha Vermelha, maior que a Terra)
      { id: 'mancha', paginas: ['Olhe a mancha vermelha no céu!', 'É uma tempestade enorme.', 'Ela é maior que a Terra!'] },
      // fonte: NASA Science — https://science.nasa.gov/jupiter/jupiter-moons/ (95 luas oficiais)
      { id: 'luas', paginas: ['Júpiter tem mais de 90 luas!', 'É lua para todo lado!'] },
      // fonte: NASA Science — as luas galileanas: Io, Europa, Ganimedes e Calisto
      { id: 'quatro', paginas: ['Quatro luas são bem grandes.', 'Io, Europa e Ganimedes.', 'E a quarta é Calisto!'] },
      // fonte: NASA Science — um dia de Júpiter dura cerca de 10 horas
      { id: 'dia', paginas: ['Aqui o dia é bem curto.', 'Dura umas dez horas só!'] },
      // fonte: NASA Science — Júpiter é o 5º planeta a partir do Sol
      { id: 'quinto', paginas: ['Júpiter é o quinto planeta.', 'Contando a partir do Sol!'] },
    ],
    VOZES: { BOLHA: BOLHA, VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  jupiter.pulo.bolha.forEach(function (p) { add(p, BOLHA); });
  jupiter.pulo.trampolim.forEach(function (p) { add(p, NARRA); });
  jupiter.redemoinho.forEach(function (p) { add(p, NARRA); });
  var c = jupiter.cristais;
  [c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todos, c.ja).forEach(function (p) { add(p, NARRA); });
  Object.keys(jupiter.letras).forEach(function (k) { jupiter.letras[k].forEach(function (p) { add(p, NARRA); }); });
  jupiter.curiosidades.forEach(function (cu) { cu.paginas.forEach(function (p) { add(p, VOVO); }); });

  R.falasDoPredio('observatorio', { jupiter: jupiter, extras: extras });
})();
