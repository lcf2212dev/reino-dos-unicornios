/* Planeta Saturno, as falas das brincadeiras (saturno-brincadeiras.js): patinar com o Nico, a pista, os bonecos de
   gelo, os cristais, as placas de palavras em inglês e as curiosidades da Vovó Anel. Uma parte das falas do
   Observatório (Reino.falasDoPredio junta, em qualquer ordem de carga); as falas dos ETs em si estão em
   observatorio/personagens-falas.js. Cada página: frase inteira com até 30 letras (sem contar «» e emoji) e 3+
   palavras; inglês entre «» (a voz inglesa lê). Sem DOM no carregamento: as ferramentas de voz carregam num vm. */
(function () {
  var R = window.Reino;
  var NICO = 'npc-saturno-nico', VOVO = 'npc-saturno-vovo', NARRA = 'narradora';

  var saturno = {
    patina: {
      nico: ['Vamos patinar no gelo! ✨', 'Eu deslizo e dou um pulinho!', 'Você patina muito bem!'],
      pista: ['Uma pista de gelo lisinha!', 'Você deslizou no gelo! ✨'],
    },
    boneco: ['O boneco de gelo acenou!', 'Ele disse oi para você! 💛'],
    cristais: {
      pegou: 'Você pegou um cristal de gelo!',
      faltam: { 4: 'Faltam quatro cristais!', 3: 'Faltam três cristais!', 2: 'Faltam dois cristais!', 1: 'Falta só um cristal!' },
      todos: ['Você pegou os cinco! 🎉', 'Que gelo mais brilhante! 💎', 'Eles vão brilhar de novo.'],
      ja: ['Esse cristal você já pegou!'],
    },
    // placas: cada uma ensina uma palavra em inglês
    palavras: {
      ice: ['«Ice» quer dizer gelo.', 'O anel tem muito gelo!'],
      star: ['«Star» quer dizer estrela.', 'Olhe as estrelas no céu!'],
      ring: ['«Ring» quer dizer anel.', 'Você está num anel!'],
      moon: ['«Moon» quer dizer lua.', 'Saturno tem muitas luas!'],
    },
    // curiosidades de verdade (voz da Vovó Anel), sorteadas sem repetir na sessão
    curiosidades: [
      // fonte: NASA Science — https://science.nasa.gov/saturn/facts/ (anéis de gelo e rocha)
      { id: 'aneis', paginas: ['Os anéis são de gelo e pedra.', 'Tem pedaço pequeno e grandão!'] },
      // fonte: NASA Science — Saturno é um gigante gasoso, sem chão firme
      { id: 'gas', paginas: ['Saturno é feito de gás.', 'Não dá para pisar nele!'] },
      // fonte: NASA Space Place — https://spaceplace.nasa.gov/all-about-saturn/ (menos denso que a água)
      { id: 'boia', paginas: ['Saturno é feito de gás leve.', 'Boiaria numa banheira gigante!'] },
      // fonte: NASA Science — https://science.nasa.gov/saturn/moons/ (mais de 100 luas conhecidas)
      { id: 'luas', paginas: ['Saturno tem mais de 100 luas!', 'É lua que não acaba mais!'] },
      // fonte: NASA Science — https://science.nasa.gov/saturn/moons/titan/ (a maior, de névoa alaranjada)
      { id: 'tita', paginas: ['A maior lua se chama Titã.', 'Ela é laranjinha, olhe lá!'] },
      // fonte: NASA Science — Saturno é o 6º planeta a partir do Sol
      { id: 'sexto', paginas: ['Saturno é o sexto planeta.', 'Contando a partir do Sol!'] },
      // fonte: NASA Science — um ano de Saturno dura cerca de 29 anos da Terra
      { id: 'ano', paginas: ['Um ano aqui demora muito!', 'Dura quase 30 anos da Terra!'] },
    ],
    VOZES: { NICO: NICO, VOVO: VOVO, NARRA: NARRA },
  };

  // extras: cada página falada fora do balão do NPC, na voz de quem conta
  var extras = [], vistos = {};
  function add(texto, voz) {
    var k = voz + '|' + texto;
    if (vistos[k]) return;
    vistos[k] = true;
    extras.push({ texto: texto, voz: voz });
  }
  saturno.patina.nico.forEach(function (p) { add(p, NICO); });
  saturno.patina.pista.forEach(function (p) { add(p, NARRA); });
  saturno.boneco.forEach(function (p) { add(p, NARRA); });
  var c = saturno.cristais;
  [c.pegou].concat(Object.keys(c.faltam).map(function (k) { return c.faltam[k]; }), c.todos, c.ja).forEach(function (p) { add(p, NARRA); });
  Object.keys(saturno.palavras).forEach(function (k) { saturno.palavras[k].forEach(function (p) { add(p, NARRA); }); });
  saturno.curiosidades.forEach(function (cu) { cu.paginas.forEach(function (p) { add(p, VOVO); }); });

  R.falasDoPredio('observatorio', { saturno: saturno, extras: extras });
})();
