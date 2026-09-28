/* Planeta Vênus, as falas das brincadeiras (venus-brincadeiras.js): pular no vapor com o Quentinho, o gêiser, os
   vulcõezinhos, os cristais, a rosa dos ventos, as placas de direção e as curiosidades da Vovó Nuvem. Uma parte das
   falas do Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras (sem contar emoji) e 3+ palavras.
   Sem DOM no carregamento: as ferramentas de voz carregam num vm. */
(function () {
  var R = window.Reino;
  var QUENTE = 'npc-venus-quentinho', VOVO = 'npc-venus-vovo', NARRA = 'narradora';

  var venus = {
    quentinho: ['Vamos pular no vapor! ✨', 'O vapor me joga lá no alto!', 'Você pulou muito alto!'],
    geiser: ['O gêiser soltou vapor! ✨', 'Fiuuu! Que vapor quentinho!'],
    vulcao: ['O vulcãozinho soltou vapor!', 'Ele faz fumacinha quente.'],
    cristais: {
      pegou: 'Você pegou um cristal quente!',
      faltam: { 4: 'Faltam quatro cristais!', 3: 'Faltam três cristais!', 2: 'Faltam dois cristais!', 1: 'Falta só um cristal!' },
      todos: ['Você pegou os cinco! 🎉', 'Que cristais mais dourados! 💎', 'Eles vão brilhar de novo.'],
      ja: ['Esse cristal você já pegou!'],
    },
    // rosa dos ventos: cada toque acende a próxima ponta (Norte, Leste, Sul, Oeste)
    rosa: {
      ordem: ['norte', 'leste', 'sul', 'oeste'],
      norte: ['Esta ponta é o Norte!', 'O Norte fica em cima no mapa.'],
      leste: ['Esta ponta é o Leste!', 'Na Terra, o Sol nasce aqui!'],
      sul: ['Esta ponta é o Sul!', 'O Sul fica embaixo no mapa.'],
      oeste: ['Esta ponta é o Oeste!', 'Na Terra, o Sol se põe aqui!'],
      todas: ['Você achou os quatro pontos!', 'Norte, Sul, Leste e Oeste! ✨'],
    },
    // placas de direção, cada uma no seu lado do planeta
    direcoes: {
      norte: ['Esta seta aponta o Norte!', 'Será que a Mapi foi para lá?'],
      sul: ['Esta seta aponta o Sul!', 'Lá tem um monte de vulcão!'],
      leste: ['Esta seta aponta o Leste!', 'Lá tem pedra bem quentinha!'],
      oeste: ['Esta seta aponta o Oeste!', 'Aqui em Vênus, o Sol nasce lá!'],
    },
    // curiosidades de verdade (voz da Vovó Nuvem), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Science — https://science.nasa.gov/venus/facts/ (cerca de 465 °C, mais que Mercúrio)
      { id: 'quente', paginas: ['Vênus é o planeta mais quente!', 'Mais quente até que Mercúrio!'] },
      // fonte: NASA Science — nuvens grossas de ácido sulfúrico, amareladas
      { id: 'nuvens', paginas: ['Vênus tem nuvens bem grossas.', 'Elas são amarelinhas, olhe!'] },
      // fonte: NASA Science — rotação retrógrada: o Sol nasce no oeste e se põe no leste
      { id: 'oeste', paginas: ['Aqui o Sol nasce no Oeste!', 'Vênus gira ao contrário!'] },
      // fonte: NASA Science — 2º planeta a partir do Sol
      { id: 'segundo', paginas: ['Vênus é o segundo planeta.', 'Contando a partir do Sol!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-venus/ (quase o tamanho da Terra)
      { id: 'tamanho', paginas: ['Vênus e a Terra são parecidas.', 'Têm quase o mesmo tamanho!'] },
      // fonte: NASA Science — o planeta mais brilhante no céu da Terra ("estrela da manhã", Estrela d'Alva)
      { id: 'brilho', paginas: ['No nosso céu, Vênus brilha!', 'É o planeta que mais brilha!', 'O apelido é Estrela d\'Alva!'] },
      // fonte: NASA Science — uma volta em torno de si (243 dias) dura mais que o ano de Vênus (225 dias)
      { id: 'devagar', paginas: ['Vênus gira bem devagarinho.', 'Uma volta dura mais que o ano!'] },
    ],
    VOZES: { QUENTE: QUENTE, VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  function todas(lista, voz) { lista.forEach(function (p) { add(p, voz); }); }
  todas(venus.quentinho, QUENTE);
  todas(venus.geiser, NARRA);
  todas(venus.vulcao, NARRA);
  var c = venus.cristais;
  todas([c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todos, c.ja), NARRA);
  venus.rosa.ordem.forEach(function (k) { todas(venus.rosa[k], NARRA); });
  todas(venus.rosa.todas, NARRA);
  Object.keys(venus.direcoes).forEach(function (k) { todas(venus.direcoes[k], NARRA); });
  venus.curiosidades.forEach(function (cu) { todas(cu.paginas, VOVO); });

  R.falasDoPredio('observatorio', { venus: venus, extras: extras });
})();
