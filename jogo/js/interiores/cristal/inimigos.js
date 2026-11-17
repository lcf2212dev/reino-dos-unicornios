/* Caverna de Cristal, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): o slime de cristal (fácil,
   uma gota ciano com duas pontas de cristal, mole no chão), o golem de cristal pequeno (médio, de pedra lilás com
   cristais nos ombros), a aranha de cristal com coroa (difícil, redondinha, olhos grandes e perninhas curtas) e o
   morcego (voador, bate as asas). O 💎 do menu já tem desenho (arte/icones/premios.js). Contorno K = #3a2446;
   '.' = vazio. Os números: config.arenas.cristal. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o slime de cristal: gota ciano translúcida, duas pontas de cristal lilás em cima, bochecha rosa e sorrisinho
  R.registrarDesenhoInimigo('cristal-facil', {
    flutua: 0, balanco: 1,
    paleta: paleta({ c: '#7fe3ee', s: '#3fb0c8', l: '#d8fcff', x: '#c89cff', X: '#8a5cf0', r: '#ff9ec0' }),
    linhas: [
      '......K......',
      '.....KxK.....',
      '.....KxXK....',
      '..KK.KxXK.KK.',
      '..KxKKxXKKxK.',
      '...KlccccsK..',
      '..KlccccccsK.',
      '.KlcwpcccwpsK',
      '.KccppcccppsK',
      'KcrrccKccrrsK',
      'KscccccccccsK',
      '.KKKKKKKKKKK.',
    ],
    pisca: { 7: '.KlccccccccsK', 8: '.KcKKcccKKcsK' },
    passo: { 0: '.............', 1: '......K......', 2: '.....KxK.....', 10: 'KscccccccccsK', 11: 'KKKKKKKKKKKKK' },
  });

  // o golem de cristal pequeno: cabeça e corpo de pedra lilás, cristal ciano na cabeça e nos ombros, pezinhos curtos
  R.registrarDesenhoInimigo('cristal-medio', {
    flutua: 0, balanco: 0,
    paleta: paleta({ g: '#a596d4', s: '#6f60a4', l: '#d4caf0', c: '#5fe0e8', C: '#2fa8b8', r: '#ff9ec0' }),
    linhas: [
      '......K......',
      '.....KcK.....',
      '....KcCCK....',
      '..KKKKKKKKK..',
      '..KllggggsK..',
      '..KgwpgwpsK..',
      '..KgppgppsK..',
      '..KrggKggrK..',
      'KK.KKKKKKK.KK',
      'KcKKlggggKKcK',
      'KCsKgggggKsCK',
      '.KKKgggggKKK.',
      '...KssKssK...',
      '...KKK.KKK...',
    ],
    pisca: { 5: '..KggggggsK..', 6: '..KKKgKKKsK..' },
    passo: { 12: '...KssKssK...', 13: '..KKK...KKK..' },
  });

  // a aranha de cristal com coroa: redondinha e roxa, cristais nas costas, olhos grandes, coroa dourada e 6 perninhas
  R.registrarDesenhoInimigo('cristal-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ v: '#8a5cd8', d: '#5a34a0', l: '#c8a8ff', c: '#5fe0e8', x: '#ff9ce0', o: '#ffd34d', O: '#d89a20', g: '#ff5c8a', r: '#ff9ec0' }),
    linhas: [
      '......K.K.K......',
      '.....KoKgKoK.....',
      '.....KoooooK.....',
      '.....KOOOOOK.....',
      '...KKKcKKKxKKK...',
      '..KlvKcKvKxKvdK..',
      '.KlvvvvvvvvvvvdK.',
      '.KvvwpvvvvvwpvdK.',
      '.KvvppvvvvvppvdK.',
      '.KvrrvvvKvvvrrdK.',
      'KKvvvvvvvvvvvvdKK',
      'K.KddvvvvvvvddK.K',
      '.KdK.KKKKKKK.KdK.',
      '.KK.KdK...KdK.KK.',
      '....KK.....KK....',
    ],
    pisca: { 7: '.KvvvvvvvvvvvvdK.', 8: '.KvvKKvvvvvKKvdK.' },
    passo: { 13: '..KKKdK...KdKKK..', 14: '..KK.........KK..' },
  });

  // o morcego: corpo roxo-azulado redondo, orelhas grandes com o rosa por dentro, olhão e as asas que batem
  R.registrarDesenhoInimigo('cristal-voador', {
    paleta: paleta({ b: '#6a58b8', d: '#45367e', a: '#9a86dc', i: '#c8b8f4', r: '#ff9ec0' }),
    linhas: [
      '.....K...K.....',
      '....KrK.KrK....',
      'KK..KbbKbbK..KK',
      'KaKKbbbbbbbKKaK',
      'KaaKbwpbwpbKaaK',
      'KaiKbppbppbKiaK',
      '.KaKbrbbbrbKaK.',
      '..KKbbwbwbbKK..',
      '....KbbbbbK....',
      '.....KKKKK.....',
    ],
    pisca: { 4: 'KaaKbbbbbbbKaaK', 5: 'KaiKbKKbKKbKiaK' },
    passo: {
      2: '....KbbKbbK....', 3: '...KbbbbbbbK...', 4: '..KKbwpbwpbKK..', 5: '.KaKbppbppbKaK.', 6: 'KaiKbrbbbrbKiaK',
      7: 'KaiaKbwbwbKaiaK', 8: 'KaaKKbbbbbKKaaK', 9: 'KK...KKKKK...KK',
    },
  });
})();
