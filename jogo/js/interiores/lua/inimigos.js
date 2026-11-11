/* Bosque da Lua Cheia, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md §8): os 4 monstros mais
   fortes do jogo, um de cada tipo. O gato da lua (fácil, preto-azulado, olhos amarelos e o rabo para cima), o cervo
   da lua (médio, marrom-azulado com os galhos prateados e o peito claro), o urso da lua com coroa (difícil, azul-escuro
   com o focinho claro e a coroa dourada) e o corvo da lua (voador, preto-azulado com as asas abertas, o bico e as
   patas claras). Contorno K = #3a2446; '.' = vazio. O ícone do 🌙 já existe (arte/icones/premios.js): não se registra
   de novo. Os números: config.arenas.lua. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o gato da lua: gordinho, orelhas pontudas, olhos amarelos e o rabo levantado; bochechas rosas
  R.registrarDesenhoInimigo('lua-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ g: '#2f3a66', s: '#212a4d', l: '#46548a', r: '#ff9ec0', n: '#ffb0c8' }),
    linhas: [
      '..K.....K........',
      '.KgK...KgK.......',
      '.KggK.KggK.......',
      '.KgggKKKgggK.....',
      '.KgggggggggK.....',
      '.KgggggggggKKKK..',
      '.KggwwgggwwKKgK..',
      '.KggwpgggpwKKgK..',
      '.KggggnggggKKgK..',
      '.KgrgKKKgrgKKgK..',
      '.KgggggggggKKgK..',
      '..KgggggggK.KgK..',
      '..KglllllgK.KgK..',
      '..KglllllgK.KgK..',
      '..KgggggggKKKK...',
      '..KggKggKggK.....',
      '..KKK.KKK.KKK....',
    ],
    pisca: { 6: '.KgggggggggKKgK..', 7: '.KggKKgggKKKKgK..' },
    passo: { 15: '.KggKggKggK......', 16: '...KKK.KKK.KKK...' },
  });

  // o cervo da lua: os galhos prateados, o focinho claro e o peito de pelo clarinho
  R.registrarDesenhoInimigo('lua-medio', {
    flutua: 0, balanco: 1,
    paleta: paleta({ b: '#6b5a80', s: '#4a3f5e', l: '#8f7fa8', c: '#e8dcc8', a: '#c8d0e0', m: '#d8c8b8', n: '#3a2a4a' }),
    linhas: [
      '..K.......K....',
      '.KaK.....KaK...',
      '.KaaK...KaaK...',
      '.KaaK...KaaK...',
      '..KaK...KaK....',
      '..KbbbbbbbK....',
      '.KbbbbbbbbbK...',
      '.KbwwbbbwwbK...',
      '.KbwpbbbwpbK...',
      '.KbbbbmbbbbK...',
      '.KbbbmmmbbbK...',
      '.KbbbmmnmmK....',
      '..KbbbbbbbK....',
      '..KbcccccbK....',
      '..KbcccccbK....',
      '..KbbbbbbbK....',
      '..KbbK.KbbK....',
      '..KbbK.KbbK....',
      '..KKK...KKK....',
    ],
    pisca: { 7: '.KbbbbbbbbbK...', 8: '.KbKKbbbKKbK...' },
    passo: { 16: '...KbbK.KbbK...', 17: '....KbbK.KbbK..' },
  });

  // o urso da lua com coroa: azul-escuro, o focinho claro e a coroa dourada de três pontas; patas grandes
  R.registrarDesenhoInimigo('lua-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#2f3a68', s: '#1e2748', l: '#46568c', m: '#c8d0e8', n: '#3a2a4a', o: '#ffd34d', q: '#e0a020' }),
    linhas: [
      '....K.K.K......',
      '...KoKoKoK.....',
      '...KoooooK.....',
      '...KqqqqqK.....',
      '..KbbbbbbbK....',
      'KKbbbbbbbbbKK..',
      'KbbbbbbbbbbbK..',
      'KbbwwbbbwwbbK..',
      'KbbwpbbbwpbbK..',
      'KbbbbbmmmbbbK..',
      'KbbbbmmnmmbbK..',
      'KbbbbbmmmbbbK..',
      '..KbbbbbbbK....',
      '..KblllllbK....',
      '..KblllllbK....',
      '..KbbbbbbbK....',
      '..KbbKbbKbbK...',
      '..KbbKbbKbbK...',
      '..KKK.KKK.KK...',
    ],
    pisca: { 7: 'KbbbbbbbbbbbK..', 8: 'KbbKKbbbKKbbK..' },
    passo: { 17: '..KbbKbbKbbK...', 18: '...KK.KKK.KK...' },
  });

  // o corvo da lua: as asas abertas com as pontas na luz da lua, o bico e as patas claras
  R.registrarDesenhoInimigo('lua-voador', {
    flutua: 8, balanco: 1,
    paleta: paleta({ b: '#2a3358', s: '#1a2140', l: '#41507e', c: '#d8e0f0' }),
    linhas: [
      '.................',
      '......KKKKK......',
      '.....KbbbbbK.....',
      '....KblllllbK....',
      '...KbwwbbwwbK....',
      '...KbwpbbwpbK....',
      '...KbbbcccbbbK...',
      '.KbbbbbbbbbbbbK..',
      'KllbbbbbbbbbbllK.',
      'KllbbbbbbbbbbllK.',
      '.KbbbbbbbbbbbbK..',
      '..KbbbbbbbbbbK...',
      '...KbbbbbbbbK....',
      '...KbbbbbbbbK....',
      '....KcK.KcK......',
    ],
    pisca: { 4: '...KbbbbbbbbK....', 5: '...KbKKbbKKbK....' },
    passo: { 12: '..KbbbbbbbbbbK...', 13: '...KbbbbbbbbK....' },
  });
})();
