/* Observatório, 2º andar (NASA): a base de sprite 'astronauta' (traje branco e capacete com visor) e as três
   pessoas do andar, com a voz de cada uma. Só registra: nada de DOM nem canvas no carregamento. */
(function () {
  var Reino = window.Reino;
  /* ================= ASTRONAUTA (base 'astronauta') ================= */
  // 19 colunas, como os outros; o rosto aparece pelo visor
  var ASTRO = [
    '...................',   // 0
    '.......WWWWW.......',   // 1  capacete
    '.....WWWWWWWWW.....',   // 2
    '....WWVVVVVVVWW....',   // 3  visor
    '...WWVVhhhhhVVwW...',   // 4  cabelo
    '...WWVhfffffhVwW...',   // 5
    '...WWVfefffefVwW...',   // 6  olhos
    '...WWVfkfmfkfVwW...',   // 7  bochechas e sorriso
    '...WWVVfffffVVwW...',   // 8
    '....WWVVVVVVVww....',   // 9
    '.....WWWWWWWWW.....',   // 10
    '......GGGGGGG......',   // 11 anel do pescoço
    '...WWWWWWWWWWWww...',   // 12 ombros
    '..WWWWBBWWWrrWWww..',   // 13 emblema azul e faixa vermelha
    '..WWWWBBWWWWWWWww..',   // 14
    '..WWWWWPPPPPWWWww..',   // 15 caixa de controle
    '..GGWWWPrPyPWWWGG..',   // 16 luvas
    '..GgWWWWWWWWWWWgG..',   // 17
    '....WWWWWWWWWWw....',   // 18
    '....WWWrrrrrWWw....',   // 19 cinto
    '.....WWW...WWw.....',   // 20 pernas (não respiram)
    '.....WWW...WWw.....',   // 21
    '....GGGG...GGGG....',   // 22 botas
  ];
  var ASTRO_PISCA = { 6: '...WWVfhfffhfVwW...' };

  function gradeAstronauta(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    var pele = cru.pele || '#d9a07a', cabelo = cru.cabelo || '#3a2320', emblema = cru.emblema || '#2f5fd6';
    var pisca = !!(quadro & 2);
    var pal = {
      W: '#f4f6fb', w: '#c8d0e0', V: '#2a3a7a', h: cabelo, f: pele, e: '#2a1838', k: '#ff9cc6', m: '#c8404e',
      G: '#9aa4bc', g: '#6a7390', B: emblema, r: '#e0433f', y: '#ffe066', P: '#3a4396',
    };
    var corte = 20;
    var g = new G.Grade(ASTRO.length, corte, (quadro & 1) ? -1 : 0);
    ASTRO.forEach(function (linha, j) {
      if (pisca && ASTRO_PISCA[j]) linha = ASTRO_PISCA[j];
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, j, pal[k]); }
    });
    g.fecharCorte();
    return { g: g, busto: 16 };
  }
  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('astronauta', gradeAstronauta, { emblema: 'cor' });

  /* ================= PESSOAS DO ANDAR (vozes diferentes da Vega e do Cosmo) ================= */
  // Sala de Controle: foguetes e missões
  Reino.registrarPersonagem({ id: 'nasa-lia', nome: 'Doutora Lia',
    sprite: { pele: '#f1c7a5', cabelo: '#2b1b17', penteado: 'rabo', jaleco: true, roupa: '#5fb4ff', roupa2: '#2f4f8a', cracha: true, cor2: '#e0433f', oculos: true, oculosCor: '#2f5fd6' },
    perfil: { voz: 'en-US-EmmaMultilingualNeural', velocidade: '+4%', tom: '+6Hz' } });       // cientista animada
  // Hangar: o astronauta
  Reino.registrarPersonagem({ id: 'nasa-davi', nome: 'Astronauta Davi',
    sprite: { base: 'astronauta', pele: '#a86b4a', cabelo: '#1f1414' },
    perfil: { voz: 'ko-KR-HyunsuMultilingualNeural', velocidade: '-4%', tom: '-8Hz' } });      // calmo e firme, de piloto (não a voz do Claude)
  // Laboratório de Experiências
  Reino.registrarPersonagem({ id: 'nasa-bia', nome: 'Engenheira Bia',
    sprite: { pele: '#c68a5e', cabelo: '#5a3825', penteado: 'cacheado', jaleco: true, roupa: '#f4f2fa', roupa2: '#3a4396', oculos: true, oculosCor: '#e0433f', presilha: true, cor2: '#6fdc8c' },
    perfil: { voz: 'de-DE-SeraphinaMultilingualNeural', velocidade: '+6%', tom: '+0Hz' } });   // engenheira curiosa e alegre
})();
