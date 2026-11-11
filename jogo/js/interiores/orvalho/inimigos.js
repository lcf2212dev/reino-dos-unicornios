/* Bosque do Orvalho, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md §8): o caracol de concha
   pêssego (fácil), a lagarta listrada (médio), o ouriço com coroa dourada (difícil) e a mariposa pastel (voador).
   Contorno K = #3a2446; '.' = vazio; até 17 × 20. O ícone do 💧 da arena já existe (arte/icones/natureza.js), então
   aqui não se registra ícone nenhum. Os números de vida, força e XP são config.arenas.orvalho. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o caracol: concha laranja saturada com brilho creme em cima/à esquerda, corpo verde escuro, olhões com brilho e bochechas
  R.registrarDesenhoInimigo('orvalho-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ c: '#f0883f', e: '#ffd9a0', d: '#b8502a', g: '#4fae48', s: '#37853a', r: '#ff7aa8', h: '#fff4cc' }),
    linhas: [
      '....KKKKK....',
      '..KKhhcccKK..',
      '.KhhcccccccK.',
      '.KhcccddcccK.',
      '.KccdcccdccK.',
      '.KccdcddcdcK.',
      '.KcccdddcccK.',
      '..KcccccccK..',
      '...KKKKKKK...',
      '.KKhggggggKK.',
      'KhgggggggggsK',
      'KgwwwgggwwwgK',
      'KgwpwgggwpwgK',
      'KrgggKKKgggrK',
      '.KKKKKKKKKKK.',
    ],
    pisca: { 11: 'KgKKKgggKKKgK', 12: 'KgggggggggggK' },
    passo: { 9: 'KKKhgggggggKK', 10: 'KhgggggggssgK', 13: 'KrggKKKKKggrK', 14: 'KKKKKKKKKKKKK' },
  });

  // a lagarta: corpo verde saturado com listras amarelas, antenas com bolinha creme, olhões e bochechas
  R.registrarDesenhoInimigo('orvalho-medio', {
    flutua: 0, balanco: 0,
    paleta: paleta({ y: '#58b83c', g: '#f2c230', s: '#3a8a34', d: '#e8943a', l: '#fff4cc', h: '#d8ffb0', r: '#ff7aa8' }),
    linhas: [
      '.....l.l.....',
      '.....s.s.....',
      '....KKKKK....',
      '..KKhhyyyKK..',
      '.KhhyyggyyyK.',
      '.KhyggyyyysK.',
      'KywwwyyywwwsK',
      'KywpwyyywpwsK',
      'KyrryyyyyyrrK',
      'KyyyysKKKyysK',
      'KyyyysyyyyssK',
      'KsydssyysdssK',
      '.KKKKKKKKKKK.',
      '...s.s.s.....',
    ],
    pisca: { 6: 'KyKKKyyyKKKsK', 7: 'KyyyyyyyyyysK' },
    passo: { 10: 'KyyyysyyyyssK', 11: 'KsyyssyyyssK.', 13: '..s..s..s....' },
  });

  // o ouriço com coroa: espinhos marrom escuro, brilho nos espinhos de cima, barriga creme, olhões, bochechas e a coroa dourada
  R.registrarDesenhoInimigo('orvalho-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#8a5230', d: '#5a3220', l: '#f4e4cc', o: '#ffd34d', O: '#d9a93a', r: '#ff7aa8', h: '#ffd9a0' }),
    linhas: [
      '.....K.K.K.....',
      '....KoKoKoK....',
      '....KoooooK....',
      '..K.KKKKKKK.K..',
      '.KdKhhbbbbbKdK.',
      '.KddKhbbbbKddK.',
      'KKKKKbbbbbKKKKK',
      'KbwwwbbbbbwwwbK',
      'KbwpwbbbbbwpwbK',
      'KbrrbbbbbbbrrbK',
      'KbbbbbbbbbbbbbK',
      'KbbbbbbbbbbbbbK',
      'KbbblllllllbbbK',
      'KbbblllllllbbbK',
      '..KKK.KKK.KKK..',
    ],
    pisca: { 7: 'KbKKKbbbbbKKKbK', 8: 'KbbbbbbbbbbbbbK' },
    passo: { 12: 'KbbblllllllbbbK', 13: 'KbblllllllllbbK', 14: '.KKKK.K.K.KKK..' },
  });

  // a mariposa: asas roxas saturadas em cima e verde-água embaixo, corpinho creme, olhões com brilho e antenas
  R.registrarDesenhoInimigo('orvalho-voador', {
    flutua: 8, balanco: 2,
    paleta: paleta({ L: '#a56be0', l: '#7a3fc0', s: '#5a3a78', T: '#34b4a4', t: '#1f8a80', b: '#f0e2c8', d: '#b8a890', h: '#ffe9ff', r: '#ff7aa8' }),
    linhas: [
      '.....l...l.....',
      '.....s...s.....',
      '...KKKKKKKKK...',
      '..KwwwKbKwwwK..',
      '..KwpwKbKwpwK..',
      '..KrKKKbKKKrK..',
      '.KlhLLKbKLLLlK.',
      'KLhLLLKbKLLLLLK',
      '..KTTKbbbKTTK..',
      '.KTTTKbbbKTTTK.',
      '.KTTTKbbbKTTTK.',
      '..KTTKbbbKTTK..',
      '...KKKKKKKKK...',
    ],
    pisca: { 3: '..KKKKKbKKKKK..', 4: '..KbbbKbKbbbK..' },
    passo: { 6: '.KLhLKKbKKLLLK.', 7: 'KLhLKKKbKKKLLLK', 8: '..KTKKKbKKKTK..', 9: '.KTTKKKbKKKTTK.' },
  });
})();
