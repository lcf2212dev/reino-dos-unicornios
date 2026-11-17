/* Montanha Gelada, os inimigos (Reino.registrarDesenhoInimigo; docs/contratos/arenas.md): o bonequinho de neve bravo
   (fácil, no chão, pula), o pinguim mal-humorado (médio, anda gingando), o yeti fofo com coroa (difícil) e a
   coruja-das-neves (voador, bate as asas). Contorno K = #3a2446; '.' = vazio. Os números: config.arenas.gelo.
   O 🐧 (menu Lugares, pergunta e painel) já tem desenho no lote js/arte/icones/natureza.js: nenhum ícone novo. */
(function () {
  var R = window.Reino;
  var OLHO = { w: '#ffffff', p: '#2a1838' };
  function paleta(cores) { var p = { K: '#3a2446', w: OLHO.w, p: OLHO.p }; Object.keys(cores).forEach(function (k) { p[k] = cores[k]; }); return p; }

  // o bonequinho de neve bravo: sobrancelhas franzidas, nariz de cenoura, cachecol vermelho e bracinhos de galho
  R.registrarDesenhoInimigo('gelo-facil', {
    flutua: 0, balanco: 1,
    paleta: paleta({ b: '#eef4fc', s: '#a9c3e4', o: '#ff9a3c', r: '#e8506a', m: '#6a4a3a' }),
    linhas: [
      '.....KKKKK.....',
      '....KbbbbbK....',
      '...KbbbbbbbK...',
      '..KbKKbbbKKbK..',
      '..KbbbKbKbbsK..',
      '..KbbbbbbbbsK..',
      '..KbbpbbbpbsK..',
      '..KbbbbooobsK..',
      '...KbbKKKbsK...',
      '..KrrrrrrrrrK..',
      'm.KKrrbbbbsKK.m',
      '.mKbrbbbbbbsKm.',
      '.KbbbbbpbbbbsK.',
      'KbbbbbbbbbbbbsK',
      'KbbbbbbpbbbbbsK',
      'KsbbbbbbbbbbssK',
      '.KssbbbbbbbssK.',
      '..KKKKKKKKKKK..',
    ],
    pisca: { 6: '..KbbKbbbKbsK..' },
    passo: { 10: '..KKrrbbbbsKK..', 11: 'mmKbrbbbbbbsKmm' },
  });

  // o pinguim mal-humorado: azul-marinho com a barriga branca, sobrancelhas bravas, bico e pezinhos laranja
  R.registrarDesenhoInimigo('gelo-medio', {
    flutua: 0, balanco: 0,
    paleta: paleta({ n: '#4a5a94', d: '#323e70', o: '#ffa53a', r: '#ff9ec0' }),
    linhas: [
      '....KKKKK....',
      '...KnnnnnK...',
      '..KnnnnnnnK..',
      '.KnKKnnnKKnK.',
      '.KnwwKnKwwnK.',
      '.KnwpwnwpwnK.',
      '.KnwwooowwnK.',
      '.KnrwwowwrnK.',
      'KnnwwwwwwwnnK',
      'KdnwwwwwwwndK',
      'KdnwwwwwwwndK',
      '.KnwwwwwwwnK.',
      '.KnnwwwwwnnK.',
      '..KKKKKKKKK..',
      '..KooK.KooK..',
      '..KKKK.KKKK..',
    ],
    pisca: { 5: '.KnKKwnwKKnK.' },
    passo: { 14: '.KooK...KooK.', 15: '.KKKK...KKKK.' },
  });

  // o yeti fofo: peludo branco-lilás, a cara azul, dentinhos de fora, bochechas rosa e a coroa dourada
  R.registrarDesenhoInimigo('gelo-dificil', {
    flutua: 0, balanco: 0,
    paleta: paleta({ f: '#f4f2ff', s: '#c4bce8', c: '#8fb0e4', l: '#ffffff', r: '#ff9ec0', o: '#ffd34d', g: '#ff7eb6' }),
    linhas: [
      '......K.K.K......',
      '.....KoKgKoK.....',
      '.....KoooooK.....',
      '...KKKKKKKKKKK...',
      '..KfffffffffffK..',
      '.KffcccccccccffK.',
      '.KfcKKcccccKKcfK.',
      'KffcwwKcccKwwcffK',
      'KffcwpcccccpwcffK',
      'KffrcccccccccrffK',
      'KfffcccKKKcccfffK',
      'KffffccwcwccffffK',
      'KffffffcccffffssK',
      'KfKfflllllllfKfsK',
      'KfKflllllllllKfsK',
      'KfKfflllllllfKfsK',
      '.KffKffffffKffsK.',
      '..KffK.....KfsK..',
      '..KKKK.....KKKK..',
    ],
    pisca: { 7: 'KffcccKcccKcccffK', 8: 'KffcKKcccccKKcffK' },
    passo: { 17: '...KffK...KfsK...', 18: '...KKKK...KKKK...' },
  });

  // a coruja-das-neves: branquinha com pintas lilases, olhos amarelos enormes, bico laranja e as asas que batem
  R.registrarDesenhoInimigo('gelo-voador', {
    paleta: paleta({ b: '#f6f8ff', s: '#a99ad8', e: '#ffd34d', o: '#ffa53a', a: '#e2e6f8', d: '#b4b0e0' }),
    linhas: [
      '...KK.......KK...',
      '...KbK.....KbK...',
      '...KbbKKKKKbbK...',
      '..KbKKKbbbKKKbK..',
      '..KKepKbbbKpeKK..',
      '..KKeeKbobKeeKK..',
      '..KbKKKbobKKKbK..',
      'K..KbbbbbbbbbK..K',
      'KaKKbsbbbbbsbKKaK',
      'KadKbbbsbsbbbKdaK',
      '.KadKbsbbbsbKdaK.',
      '..KKKbbbbbbbKKK..',
      '....KKbbbbbKK....',
      '.....KoK.KoK.....',
      '.....KKK.KKK.....',
    ],
    pisca: { 4: '..KKbbKbbbKbbKK..', 5: '..KKKKKbobKKKKK..' },
    passo: { 7: '...KbbbbbbbbbK...', 8: '..KKbsbbbbbsbKK..', 9: '.KaKbbbsbsbbbKaK.', 10: 'KadaKbsbbbsbKadaK', 11: 'KKKKKbbbbbbbKKKKK' },
  });
})();
