/* Bosque da Neblina: o ícone pixel art da névoa (🌫, no menu do painel, na pergunta e na placa do portal) e, abaixo,
   os desenhos dos 4 inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md). Os números são os de
   config.arenas.neblina. Contorno K = #3a2446; '.' = vazio. */
Reino.registrarIcones({
  '🌫': { n: 'neblina', p: { k: '#3a2446', w: '#eef0f8', l: '#c8cce0', b: '#a4a8c4' }, d: [
    '................',
    '................',
    '.....kkkkkk.....',
    '...kkwwwwwwkk...',
    '..kwwwwwwwwwwk..',
    '.kwllllllllllwk.',
    '.kwllllllllllwk.',
    '..kwwllllllwwk..',
    '...kkwwwwwwkk...',
    '.....kkkkkk.....',
    '................',
    '..kkkkkkkkkkkk..',
    '.kwwwllllllwwwk.',
    '..kkkkkkkkkkkk..',
    '................',
    '................',
  ] },
});
/* Bosque da Neblina, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): o guaxinim (fácil, a
   máscara escura e o rabo listrado), a raposa (média, laranja com o focinho claro e o rabo felpudo), o javali com
   coroa (difícil, marrom-escuro com as presas claras) e o gavião (voador, as asas abertas e o bico amarelo).
   Fofos, olhos w/p, contorno K = #3a2446; '.' = vazio. Os números: config.arenas.neblina. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o guaxinim: cinza-azulado, a máscara escura nos olhos, o focinho claro e o rabo listrado
  R.registrarDesenhoInimigo('neblina-facil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ g: '#8090ac', l: '#b6c2d8', m: '#3e4a68' }),
    linhas: [
      '..KK......KK.....',
      '.KggK....KggK....',
      '.KgmgK..KgmgK....',
      '.KggggggggggK....',
      'KggggggggggggK...',
      'KgmmmmmmmmmmgK...',
      'KgmwwmmmmwwmgK...',
      'KgmwpmmmmwpmgK...',
      'KggmmmmmmmmggKKKK',
      'KgggllllllgggKllK',
      'KggllllKllllgKmmK',
      'KggllllllllggKllK',
      '.KgggllllgggK.mmK',
      '..KKggKKggKK..KKK',
    ],
    pisca: { 6: 'KgmmmmmmmmmmgK...', 7: 'KgmKKmmmmKKmgK...' },
  });

  // a raposa: laranja, as orelhas pontudas, o focinho claro e o rabo felpudo com a ponta branca
  R.registrarDesenhoInimigo('neblina-medio', {
    flutua: 0, balanco: 1,
    paleta: paleta({ o: '#e8823c', d: '#b85a24', l: '#ffe2b8', c: '#fff4e2', n: '#7a3a18' }),
    linhas: [
      '..K.......K......',
      '..KoK...KoK......',
      '..KooK.KooK......',
      '.KoooooooooK.....',
      'KoooooooooooK....',
      'KoooooooooooK....',
      'KoowwooowwooK....',
      'KoowpoooopwoK....',
      'KoooooooooooKKKKK',
      'KooollllllooKoooK',
      'KoolllnlllllKdooK',
      'KoolllllllloKoooK',
      '.KooolllloooKcccK',
      '..KKooKKooKK.KKKK',
    ],
    pisca: { 6: 'KoooooooooooK....', 7: 'KooKKoooKKooK....' },
  });

  // o javali com coroa: marrom-escuro, a coroa dourada, o focinho claro e as presas de fora
  R.registrarDesenhoInimigo('neblina-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#6a4a34', d: '#46301f', l: '#c8a878', t: '#f4ecd8', u: '#fff4d8', o: '#ffd34d' }),
    linhas: [
      '.....K.K.K......',
      '.....KoKoKoK....',
      '....KoooooooK...',
      '..KKKKKKKKKKKK..',
      '.KbbbbbbbbbbbbK.',
      'KbbbbbbbbbbbbbbK',
      'KbbbwwbbbbwwbbbK',
      'KbbbwpbbbbwpbbbK',
      'KbbbbbbbbbbbbbbK',
      'KbbbbbbbbbbbbbbK',
      'KbbdlllllllldbbK',
      'KbdutKllllKtudbK',
      'KbdbbKlddlKbbdbK',
      'KbbbbbbbbbbbbbbK',
      '.KbbbbbbbbbbbbK.',
      '..KKKbKKKKbKKK..',
    ],
    passo: { 14: '..KbbbbbbbbbbK..', 15: '...KKbKKKKbKK...' },
  });

  // o gavião: as asas abertas marrom-violeta e o bico amarelo (voa, balança de leve)
  R.registrarDesenhoInimigo('neblina-voador', {
    paleta: paleta({ b: '#7a5a86', d: '#543a62', l: '#c8b8d0', y: '#ffd34d' }),
    linhas: [
      'KK.............KK',
      'KlK...........KlK',
      'KllK.........KllK',
      'KllbK..KKK..KbllK',
      'KllbbK.KwK.KbbllK',
      'KllbbbKKwKKbbbllK',
      'KbbbbbbKpKbbbbbbK',
      'KbbbbbbKyKbbbbbbK',
      '.KbbbbbKyKbbbbbK.',
      '..KbbbbKyKbbbbK..',
      '...KbbbKyKbbbK...',
      '....KKKbbbbKKK...',
      '.......KbbK......',
      '.......KbbK......',
      '........KK.......',
    ],
    pisca: { 4: 'KllbbK.KKK.KbbllK', 5: 'KllbbbKKKKKbbbllK' },
    passo: { 1: 'KKK...........KKK', 2: 'KbbK.........KbbK', 3: 'KbbbbK.KKK.KbbbbK' },
  });
})();
