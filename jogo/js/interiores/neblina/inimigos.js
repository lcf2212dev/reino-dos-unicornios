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
    paleta: paleta({ g: '#4a5690', l: '#7e8cc0', m: '#2e3860', h: '#b8c8e4', c: '#7ff2e0' }),
    linhas: [
      '..KK......KK.....',
      '.KhgK....KggK....',
      '.KgmgK..KgmgK....',
      '.KhgggggggggK....',
      'KhgggggggggggK...',
      'KgmmmmmmmmmmgK...',
      'KgmwcmmmmwcmgK...',
      'KgmccmmmmccmgK...',
      'KggmmmmmmmmggKKKK',
      'KgggllllllgggKllK',
      'KggllllKllllgKmmK',
      'KggllllllllggKllK',
      '.KgggllllgggK.mmK',
      '..KKggKKggKK..KKK',
    ],
    pisca: { 6: 'KgmmmmmmmmmmgK...', 7: 'KgmKKmmmmKKmgK...' },
    passo: { 13: '...KKgKKgKK...KKK' },
  });

  // a raposa: laranja, as orelhas pontudas, o focinho claro e o rabo felpudo com a ponta branca
  R.registrarDesenhoInimigo('neblina-medio', {
    flutua: 0, balanco: 1,
    paleta: paleta({ o: '#d8683c', d: '#a04a24', l: '#ffe2b8', c: '#fff4e2', n: '#7a3a18', h: '#b8c8e4', e: '#ffc94d' }),
    linhas: [
      '..K.......K......',
      '..KhK...KoK......',
      '..KooK.KooK......',
      '.KhooooooooK.....',
      'KhooooooooooK....',
      'KoooooooooooK....',
      'KooweoooewooK....',
      'KooeeoooeeooK....',
      'KoooooooooooKKKKK',
      'KooollllllooKoooK',
      'KoolllnlllllKdooK',
      'KoolllllllloKoooK',
      '.KooolllloooKcccK',
      '..KKooKKooKK.KKKK',
    ],
    pisca: { 6: 'KoooooooooooK....', 7: 'KooKKoooKKooK....' },
    passo: { 13: '...KKoKKoKK..KKKK' },
  });

  // o javali com coroa: marrom-escuro, a coroa dourada, o focinho claro e as presas de fora
  R.registrarDesenhoInimigo('neblina-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ b: '#4c3a70', d: '#382a58', l: '#c8a878', t: '#f4ecd8', u: '#fff4d8', o: '#ffd34d', h: '#b8c8e4', a: '#ffc94d' }),
    linhas: [
      '.....K.K.K......',
      '.....KoKoKoK....',
      '....KoooooooK...',
      '..KKKKKKKKKKKK..',
      '.KhbbbbbbbbbbbK.',
      'KhbbbbbbbbbbbbbK',
      'KbbbwabbbbawbbbK',
      'KbbbaabbbbaabbbK',
      'KbbbbbbbbbbbbbbK',
      'KbbbbbbbbbbbbbbK',
      'KbbdlllllllldbbK',
      'KbdutKllllKtudbK',
      'KbdbbKlddlKbbdbK',
      'KbbbbbbbbbbbbbbK',
      '.KbbbbbbbbbbbbK.',
      '..KKKbKKKKbKKK..',
    ],
    pisca: { 6: 'KbbbbbbbbbbbbbbK', 7: 'KbbbKKbbbbKKbbbK' },
    passo: { 14: '..KbbbbbbbbbbK..', 15: '...KKbKKKKbKK...' },
  });

  // o gavião: as asas abertas marrom-violeta e o bico amarelo (voa, balança de leve)
  R.registrarDesenhoInimigo('neblina-voador', {
    flutua: 8, balanco: 2,
    paleta: paleta({ b: '#4a3e80', d: '#352a62', l: '#8e84c4', y: '#ffd34d', h: '#b8c8e4', a: '#ffc94d' }),
    linhas: [
      'KK.............KK',
      'KlK...........KlK',
      'KllK.........KllK',
      'KllbK..KKK..KbllK',
      'KllbbK.KwK.KbbllK',
      'KllbbbKKaKKbbbllK',
      'KhbbbbbKpKbbbbbbK',
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
