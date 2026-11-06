/* Vulcão dos Dragõezinhos, os inimigos (o ícone 🐉 do menu e da pergunta já existe nos lotes de js/arte/icones/;
   Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): a salamandra de
   fogo (fácil, deitadinha no chão, com a chama na ponta do rabo), a bola de lava (médio, quica), o dragãozinho com
   coroa (difícil, com as asinhas) e o morceguinho de fogo (voador, bate as asas). Contorno K = #3a2446; '.' = vazio.
   Os números: config.arenas.vulcao. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // a salamandra de fogo: laranja de pintinhas amarelas, olhos grandes e o rabo em pé com uma chaminha na ponta
  R.registrarDesenhoInimigo('vulcao-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ o: '#ff7a3a', y: '#ffd34d', f: '#fff1a0', r: '#ffb0c0', l: '#ffd0a0' }),
    linhas: [
      '..........KKK..',
      '.........KfyfK.',
      '..KKKKK...KffK.',
      '.KoooooK..KoK..',
      'KowwowwoK.KoK..',
      'KowpowpoKKKoK..',
      'KooooooooooooK.',
      'KroKKKoroyoyoK.',
      '.KooooooooooK..',
      'KoKllllllllKoK.',
      'KKK........KKK.',
    ],
    pisca: { 4: 'KoooooooK.KoK..', 5: 'KoKKoKKoKKKoK..' },
    passo: { 9: '.KoKllllllKoK..', 10: '.KKK......KKK..' },
  });

  // a bola de lava: redondinha, laranja e amarela com manchas de crosta, chaminhas em cima; quica sem parar
  R.registrarDesenhoInimigo('vulcao-medio', {
    flutua: 2, balanco: 3,
    paleta: paleta({ o: '#ff8a3d', y: '#ffd34d', f: '#fff1a0', d: '#a8302a', r: '#ffb0c0' }),
    linhas: [
      '......K......',
      '..K..KfK..K..',
      '.KfK.KfK.KfK.',
      '.KyKKKyKKKyK.',
      '.KyyyyyyyyyK.',
      'KyywwyyywwyyK',
      'KyywpyyypwyyK',
      'KoroKyyyKoroK',
      'KdoooKKKooodK',
      'KddoooyoooddK',
      '.KddoooooddK.',
      '..KKKKKKKKK..',
    ],
    pisca: { 5: 'KyyyyyyyyyyyK', 6: 'KyyKKyyyKKyyK' },
    passo: { 10: 'KddoooooooddK', 11: '.KKKKKKKKKKK.' },
  });

  // o dragãozinho: vermelho de barriga creme, chifrinhos, asinhas laranja e a coroa dourada com uma pedra rosa
  R.registrarDesenhoInimigo('vulcao-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ r: '#e8483a', l: '#ffe0a8', a: '#ff8a3d', y: '#fff1d0', o: '#ffd34d', g: '#ff7eb6', c: '#ffb0a0' }),
    linhas: [
      '.....K.K.K.....',
      '....KoKgKoK....',
      '.K..KoooooK..K.',
      '.KyKKKKKKKKKyK.',
      '..KrrrrrrrrrK..',
      '.KrrwwrrrwwrrK.',
      '.KrrwprrrpwrrK.',
      '.KrcrrrrrrrcrK.',
      '.KrrrKrrrKrrrK.',
      '..KrrrKKKrrrK..',
      'KK.KrrrrrrrK.KK',
      'KaKKrlllllrKKaK',
      'KaaKrlllllrKaaK',
      '.KaKrlllllrKaK.',
      '..KKrlllllrKK..',
      '...KrrKKKrrK...',
      '...KKK...KKK...',
    ],
    pisca: { 5: '.KrrrrrrrrrrrK.', 6: '.KrrKKrrrKKrrK.' },
    passo: { 15: '...KrrK.KrrK...', 16: '..KKK.....KKK..' },
  });

  // o morceguinho de fogo: corpinho escuro, asas cor de fogo, barriga laranja e um topete de chama
  R.registrarDesenhoInimigo('vulcao-voador', {
    paleta: paleta({ b: '#5a3050', a: '#ff6a3d', l: '#ffb04a', f: '#e8432e', y: '#ff8a3d', c: '#ff7eb6' }),
    linhas: [
      '.......K.K.......',
      '......KfKfK......',
      '.....KKyfyKK.....',
      'KK..KbbbbbbbK..KK',
      'KaKKbwwbbbwwbKKaK',
      'KaaKbwpbbbpwbKaaK',
      'KaaaKbcbbbcbKaaaK',
      'KaKaaKbbKbbKaaKaK',
      'K.KK.KblllbK.KK.K',
      '.....KKbbbKK.....',
      '.......KKK.......',
    ],
    pisca: { 4: 'KaKKbbbbbbbbbKKaK', 5: 'KaaKbKKbbbKKbKaaK' },
    passo: { 3: '....KbbbbbbbK....', 7: 'KaaaaKbbKbbKaaaaK', 8: 'KaKaKKblllbKKaKaK', 9: 'KK...KKbbbKK...KK' },
  });
})();
