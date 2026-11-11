/* Bosque do Orvalho, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md §8): o caracol de concha
   pêssego (fácil), a lagarta listrada (médio), o ouriço com coroa dourada (difícil) e a mariposa pastel (voador).
   Contorno K = #3a2446; '.' = vazio; até 17 × 20. O ícone do 💧 da arena já existe (arte/icones/natureza.js), então
   aqui não se registra ícone nenhum. Os números de vida, força e XP são config.arenas.orvalho. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o caracol: a concha em espiral pêssego nas costas, o corpinho verde-claro e os olhinhos com bochecha rosa
  R.registrarDesenhoInimigo('orvalho-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ c: '#ffcf9e', e: '#ffe9d2', d: '#e8a472', g: '#c2eaa6', s: '#97cf82', r: '#ff9ec0' }),
    linhas: [
      '....KKKK.....',
      '..KKccccKK...',
      '.KccceecccK..',
      '.KccdccdccK..',
      '.KcccdddccK..',
      '.KccdccdccK..',
      '..KccccccK...',
      '...KKKKKK....',
      '.KKgggggggKK.',
      'KgggggggggggK',
      'KgrwwgggwwrgK',
      'KggwpgggpwggK',
      'KgrggKKggrggK',
      '.KKKKKKKKKKK.',
    ],
    pisca: { 10: 'KgrKKgggKKrgK', 11: 'KgggggggggggK' },
    passo: { 8: 'KKKgggggggKKK', 9: 'KgggggggggssK', 12: 'KgrggKKggrggK', 13: 'KKKKKKKKKKKKK' },
  });

  // a lagarta: listras verde-amarelas, anteninhas com bolinha e os pés curtinhos embaixo
  R.registrarDesenhoInimigo('orvalho-medio', {
    flutua: 0, balanco: 0,
    paleta: paleta({ y: '#d8e86a', g: '#a8dc7a', s: '#7aa85a', d: '#5e8a42', l: '#f2ffb0' }),
    linhas: [
      '.....l.l.....',
      '.....s.s.....',
      '.....KKK.....',
      '...KKyyyKK...',
      '..KyyggyyyK..',
      '.KyggyyyyysK.',
      '.KywwyyywwsK.',
      'KyywpyyypwysK',
      'KyyyyyyyyyysK',
      'KyyyysKKKyysK',
      'KyyyysyyyyssK',
      'KsydssyysdssK',
      '.KKKKKKKKKKK.',
      '...s.s.s.....',
    ],
    pisca: { 6: '.KyKKyyyKKsK.', 7: 'KyyKKyyyKKysK' },
    passo: { 10: 'KyyyysyyyyssK', 11: 'KsyyssyyyssK.', 13: '..s..s..s....' },
  });

  // o ouriço com coroa: espinhos marrons em volta, barriga clara, bochecha rosa e a coroa dourada
  R.registrarDesenhoInimigo('orvalho-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#a8734a', d: '#7a5236', l: '#f4e4cc', o: '#ffd34d', O: '#d9a93a', r: '#ff9ec0' }),
    linhas: [
      '.....K.K.K.....',
      '....KoKoKoK....',
      '....KoooooK....',
      '..K.KKKKKKK.K..',
      '.KdKbbbbbbbKdK.',
      '.KddKbbbbbKddK.',
      'KKKKKbbbbbKKKKK',
      'KbwwbbbbbbbwwbK',
      'KbwpbbbbbbbpwbK',
      'KbbrbbbbbbbrbbK',
      'KbbbbbbbbbbbbbK',
      'KbbbbbbbbbbbbbK',
      'KbbblllllllbbbK',
      'KbbblllllllbbbK',
      '..KKK.KKK.KKK..',
    ],
    pisca: { 7: 'KbKKbbbbbbbKKbK', 8: 'KbbbbbbbbbbbbbK' },
    passo: { 12: 'KbbblllllllbbbK', 13: 'KbblllllllllbbK', 14: '.KKKK.K.K.KKK..' },
  });

  // a mariposa: asas pastel lilás em cima e verde-água embaixo, corpinho peludo e antenas
  R.registrarDesenhoInimigo('orvalho-voador', {
    flutua: 8, balanco: 2,
    paleta: paleta({ L: '#cbb6f0', l: '#a88ce0', s: '#6a5478', T: '#a8e8dc', t: '#6fc8b8', b: '#e8dcc8', d: '#b8a890' }),
    linhas: [
      '.....l...l.....',
      '.....s...s.....',
      '....KKKKKKK....',
      '...KwwKbKwwK...',
      '...KpwKbKwpK...',
      '..KKKKKKKKKKK..',
      '.KlLLLKbKLLLlK.',
      'KLLLLLKbKLLLLLK',
      '..KTTKbbbKTTK..',
      '.KTTTKbbbKTTTK.',
      '.KTTTKbbbKTTTK.',
      '..KTTKbbbKTTK..',
      '...KKKKKKKKK...',
    ],
    pisca: { 3: '...KKKKbKKKK...', 4: '...KbbKbKbbK...' },
    passo: { 6: '.KLLLKKbKKLLLK.', 7: 'KLLLKKKbKKKLLLK', 8: '..KTKKKbKKKTK..', 9: '.KTTKKKbKKKTTK.' },
  });
})();
