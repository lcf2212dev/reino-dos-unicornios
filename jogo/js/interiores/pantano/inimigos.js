/* Pântano das Rãs Resmungonas: o ícone pixel art da rã (🐸, no menu Lugares, na pergunta e no painel da arena) e,
   abaixo, os desenhos dos 4 inimigos. */
Reino.registrarIcones({
  '🐸': { n: 'ra', p: { k: '#3a2446', g: '#6cc04a', l: '#a8e070', s: '#3f8a34', w: '#ffffff', p: '#2a1838', r: '#ff9ec0', b: '#e8f8c0' }, d: [
    '................',
    '..kkkk....kkkk..',
    '.kwwwwk..kwwwwk.',
    '.kwwppk..kwwppk.',
    '.kwwppkkkkwwppk.',
    'kkkkkkggggkkkkkk',
    'kglgggggggggggsk',
    'kglgggggggggggsk',
    'kgrrggkkkkggrrsk',
    'kggggkggggkgggsk',
    '.kgggggggggggsk.',
    '.kgbbbbbbbbbbsk.',
    'kggkbbbbbbbbkgsk',
    'kgsgkkkkkkkkgssk',
    '.kkkk......kkkk.',
    '................',
  ] },
});
/* Pântano das Rãs Resmungonas, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): a rã
   resmungona (fácil, sentada no chão, pula), a bolha de lodo (médio, balança), o sapo-rei com coroa (difícil) e a
   libélula-mosca (voador, bate as asas). Contorno K = #3a2446; '.' = vazio. Os números: config.arenas.pantano. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // a rã resmungona: olhos esbugalhados com a sobrancelha franzida, boquinha emburrada e bochecha rosa
  R.registrarDesenhoInimigo('pantano-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ g: '#6cc04a', s: '#3f8a34', l: '#e8f8c0', r: '#ff9ec0' }),
    linhas: [
      '..KKK...KKK..',
      '.KwwwK.KwwwK.',
      '.KwKpKKKpKwK.',
      'KgKKKgggKKKgK',
      'KggggggggggsK',
      'KgrgKKKKKgrsK',
      'KgggKgggKggsK',
      '.KglllllllsK.',
      'KgKlllllllKgK',
      'KggKKKKKKKggK',
      '.KKK.....KKK.',
    ],
    pisca: { 1: '.KgggK.KgggK.', 2: '.KKKKKKKKKKK.' },
    passo: { 8: '.KKlllllllKK.', 9: '.KgKKKKKKKgK.', 10: '..KK.....KK..' },
  });

  // a bolha de lodo: uma gota mole marrom-esverdeada, com os olhos tortos e a boca de lado
  R.registrarDesenhoInimigo('pantano-medio', {
    flutua: 0, balanco: 1,
    paleta: paleta({ b: '#7a8a3c', l: '#a8b860', s: '#55602a', d: '#3f4a1c' }),
    linhas: [
      '.....KKK.....',
      '...KKbbbKK...',
      '..KbbllbbbK..',
      '.KbllbbbbbsK.',
      '.KbwwbbbwwsK.',
      'KbbwpbbbpwbsK',
      'KbbbbbbbbbbsK',
      'KbbbbKKKKbbsK',
      'KbbbbbbbbbssK',
      'KsbdsbbbsdssK',
      '.KKKKKKKKKKK.',
    ],
    pisca: { 4: '.KbbbbbbbbsK.', 5: 'KbbKKbbbKKbsK' },
    passo: { 8: 'KbbbbbbbbbbsK', 9: 'KKsbdsbsdbsKK', 10: 'K.KKKKKKKKK.K' },
  });

  // o sapo-rei: maior e verde-escuro, com a coroinha dourada e a barriga clara
  R.registrarDesenhoInimigo('pantano-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ d: '#3f8a46', s: '#26603a', l: '#d8f0b0', r: '#ff9ec0', o: '#ffd34d', g: '#ff7eb6' }),
    linhas: [
      '.....K.K.K.....',
      '....KoKgKoK....',
      '....KoooooK....',
      '.KKKKKKKKKKKKK.',
      'KwwwKdddddKwwwK',
      'KwpwKKdddKKwpwK',
      'KKKKdddddddKKKK',
      'KddddddddddddsK',
      'KdrdKKKKKKKdrsK',
      'KdddKdddddKddsK',
      'KddllllllllldsK',
      'KdlllllllllllsK',
      'KdKlllllllllKdK',
      'KddKKKKKKKKKddK',
      '.KKK.......KKK.',
    ],
    pisca: { 4: 'KdddKdddddKdddK', 5: 'KKKKKKdddKKKKKK' },
    passo: { 12: '.KKlllllllllKK.', 13: '.KdKKKKKKKKKdK.', 14: '..KK.......KK..' },
  });

  // a libélula-mosca: corpo comprido verde-azulado, olhos vermelhos e quatro asas transparentes que batem
  R.registrarDesenhoInimigo('pantano-voador', {
    paleta: paleta({ g: '#3aa58a', s: '#22705c', r: '#ff4d4d', v: '#9fe0d0', x: '#e6fff8' }),
    linhas: [
      'KK....KKK....KK',
      'KxK..KrKrK..KxK',
      'KvxK.KKKKK.KxvK',
      '.KvxKKgggKKxvK.',
      '..KKKKgggKKKK..',
      '.....KgsgK.....',
      '.....KgggK.....',
      '.....KgsgK.....',
      '......KgK......',
      '......KsK......',
      '......KgK......',
      '.......K.......',
    ],
    pisca: { 1: 'KxK..KKKKK..KxK' },
    passo: { 0: '......KKK......', 1: '.....KrKrK.....', 2: 'KKKK.KKKKK.KKKK', 3: 'KvxxKKgggKKxxvK', 4: '.KKKKKgggKKKKK.' },
  });
})();
