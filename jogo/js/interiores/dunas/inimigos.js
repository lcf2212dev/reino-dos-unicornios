/* Dunas dos Escorpiões, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): o escorpiãozinho
   (fácil, no chão, com o rabo curvado e as pinças), o cacto andante (médio, com a flor na cabeça), a múmia fofa com
   coroa (difícil, enfaixada, os olhos espiando) e o abutre engraçado (voador, careca e vesgo, bate as asas). O 🏜 do
   mapa já tem desenho (arte/icones/natureza.js). Contorno K = #3a2446; '.' = vazio. Os números: config.arenas.dunas. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o escorpiãozinho: laranja, pinças abertas dos lados, o rabo subindo por trás com o ferrão, sorriso e bochecha
  R.registrarDesenhoInimigo('dunas-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ o: '#f49a3a', s: '#c8642a', l: '#ffd08a', t: '#a8301a', r: '#ff9ec0' }),
    linhas: [
      '.......KKKKK.....',
      '......KlooooK....',
      '.....KtKKKKKooK..',
      '.....KtK...KooK..',
      '......K...KooK...',
      '.K.K.....KooK.K.K',
      'KoKoKKKKKKooKoKoK',
      'KoooKwwooowwKoooK',
      '.KooKwpooopwKooK.',
      '....KroKoKorK....',
      '....KlooKoolK....',
      '...KKsssssssKK...',
      '..K.K.K...K.K.K..',
    ],
    pisca: { 7: 'KoooKoooooooKoooK', 8: '.KooKKKoooKKKooK.' },
    passo: { 12: '...K.K.K.K.K.K...' },
  });

  // o cacto andante: verde com espinhos claros, um braço mais alto que o outro, a flor rosa e os pezinhos
  R.registrarDesenhoInimigo('dunas-medio', {
    flutua: 0, balanco: 1,
    paleta: paleta({ g: '#5fbf6e', s: '#3f9a5a', l: '#c8f4b0', r: '#ff7eb6', y: '#ffe066', c: '#ff9ec0' }),
    linhas: [
      '......KKK......',
      '.....KrrrK.....',
      '.....KryrK.....',
      '....KKKKKKK....',
      'KKK.KglggsK....',
      'KgK.KwwgwwK....',
      'KlK.KwpgpwK.KKK',
      'KgK.KcKgKcK.KgK',
      'KggggggKggK.KlK',
      'KKKKKlgggsK.KgK',
      '....KgglggggggK',
      '....KggggsKKKKK',
      '....KlgggsK....',
      '....KsssssK....',
      '....KgK.KgK....',
      '....KKK.KKK....',
    ],
    pisca: { 5: 'KgK.KgggggK....', 6: 'KlK.KKKgKKK.KKK' },
    passo: { 14: '...KgK...KgK...', 15: '...KKK...KKK...' },
  });

  // a múmia fofa: enfaixada em creme, a faixa escura dos olhos espiando, bochechas, a coroa dourada com a pedra
  // turquesa e os bracinhos esticados
  R.registrarDesenhoInimigo('dunas-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#f4ecd8', s: '#c8b890', n: '#5a3a4a', o: '#ffd34d', j: '#3fc8c0', r: '#ff9ec0' }),
    linhas: [
      '.....K.K.K.....',
      '....KoKjKoK....',
      '....KoooooK....',
      '..KKKKKKKKKKK..',
      '..KbbbssssbbK..',
      '..KnwwwnwwwnK..',
      '..KnwpwnwpwnK..',
      '..KbrbbKbbrbK..',
      '..KssssbbbbbK..',
      'KKKbbbbbssssKKK',
      'KbsbbbbbbbbbsbK',
      'KKKsssbbbbbbKKK',
      '..KbbbbbsssbK..',
      '..KsssbbbbbbK..',
      '..KsssssssssK..',
      '...KbbK.KbbK...',
      '...KKKK.KKKK...',
    ],
    pisca: { 5: '..KnnnnnnnnnK..', 6: '..KnKKKnKKKnK..' },
    passo: { 15: '..KbbK...KbbK..', 16: '..KKKK...KKKK..' },
  });

  // o abutre engraçado: cabeça careca rosa, vesgo, bico amarelo torto, gola branca fofinha e asas marrons abertas
  R.registrarDesenhoInimigo('dunas-voador', {
    paleta: paleta({ m: '#9a6a44', s: '#6a4430', l: '#d0a070', h: '#ffb0a0', y: '#ffc94d', c: '#fff4e4' }),
    linhas: [
      '.......KKK.......',
      '......KhhhK......',
      '.....KwwhwwK.....',
      '.....KwphpwK.....',
      '.....KhyyyhK.....',
      'KK....KKyKK....KK',
      'KlK..KcccccK..KlK',
      'KlmKKcccccccKKmlK',
      'KlmmmKcccccKmmmlK',
      'KlmmmmKmmmKmmmmlK',
      '.KlmmmKmlmKmmmlK.',
      '..KsKsKmmmKsKsK..',
      '......KyKyK......',
      '......KKKKK......',
    ],
    pisca: { 2: '.....KhhhhhK.....', 3: '.....KKKhKKK.....' },
    passo: { 5: 'KlK...KKyKK...KlK', 6: 'KmlK.KcccccK.KlmK', 9: '.KKmmmKmmmKmmmKK.', 10: '..KKKKKmlmKKKKK..', 11: '......KmmmK......' },
  });
})();
