/* Ilustrações do capítulo 10 (grupo icones; Reino.registrarIlustracao, js/arte/ilustracoes.js): a abertura do
   capítulo (APR p. 3), com os personagens de contos infantis que a questão "Quais personagens você reconhece na
   imagem?" pede: Branca de Neve, os sete anões, Aladim no tapete voador, os Três Porquinhos e as casas, o Lobo Mau na
   árvore, Pinóquio e o Grilo Falante (e o coelhinho). Desenho redesenhado em pixel art, no estilo do jogo. */
(function () {
  var K = '#3a2446';
  // pessoas e bichos (matrizes com paleta; '.' = vazio)
  var BRANCA = ['....krk.krk....', '....krrkrrk....', '....kkHHHkk....', '...kHHHHHHHk...', '..kHHHHHHHHHk..',
    '..kHHsssssHHk..', '..kHsesssesHk..', '..kHspsssspHk..', '..kHHssmssHHk..', '..kHHksssskHk..', '...kkwwwwwkk...',
    '..kRRBBBBBRRk..', '.kRRkBBBBBkRRk.', '.kskkBBBBBkksk.', '..kkkBBBBBkkk..', '...kYYYYYYYk...', '..kYYYYYYYYYk..',
    '..kYYyYYYyYYk..', '.kYYYYYYYYYYYk.', '.kYYyYYYYYyYYk.', 'kYYYYYYYYYYYYYk', 'kkkkkkkkkkkkkkk', '....kRk.kRk....'];
  var ANAO = ['....k....', '...kck...', '..kccck..', '.kccccck.', 'kccccccck', 'ksesssesk', 'kssnnnssk',
    'kWWWnWWWk', '.kWWWWWk.', 'kvkWWWkvk', 'kvvvvvvvk', '.kk...kk.'];
  var ALADIM = ['..kkkkk..', '.kHHHHHk.', 'kHHHHHHHk', 'kHsesesHk', 'kHssmssHk', '.kkssskk.', 'kRkwRwkRk',
    'kskRRRksk', 'kkPPPPPkk', '.kPPkPPk.'];
  var TAPETE = ['kkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kppPppPppPppPppPppPppPppPppk', 'kppppppppppppppppppppppppppk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'y.y.y.y.y.y.y.y.y.y.y.y.y.y.'];
  var PORCO = ['.k.....k.', 'kpkkkkkpk', 'kpppppppk', 'kpepppepk', 'kppPPPppk', 'kppnPnppk', '.kpppppk.', '..kk.kk..'];
  var LOBO = ['.k.......k.', 'kgk.....kgk', 'kggkkkkkggk', 'kgggggggggk', 'kgyegggyegk', 'kgggggggggk',
    '.kggllllgk.', '.kglllllgk.', '..kllnllk..', '...kkkkk...'];
  var PINOQUIO = ['...kkkkk.......', '..kYYYYYk......', '.kYYYrYYYk.....', 'kkkkkkkkkkk....', '.kHsssssk......',
    '.kHsesesskkkkk.', '.kHssssssssssk.', '.kHsmsskkkkkk..', '..kkssk........', '.kRRwwRRk......', 'kRRbRRbRRk.....',
    'kskbRRbksk.....', '.kkBBBBBkk.....', '..kBBkBBk......', '..ksk.ksk......', '..kYk.kYk......', '.kkkk.kkkk.....'];
  var GRILO = ['.kkkk..', '.kBBk..', 'kkbbkk.', 'kBBBBBk', '.kgggk.', 'kgegegk', '.kgggk.', '.kjjjk.', '.kgkgk.', '.kk.kk.'];
  var COELHO = ['.kk.kk...', '.kbkkbk..', '.kbkkbk..', 'kbbbbbbk.', 'kbebbebk.', 'kbbbpbbk.', '.kbbbbbk.', '..kkkkk..'];

  var PELE = '#ffd9b8';
  var FLORES = [[6, 70], [14, 64], [30, 76], [44, 66], [50, 74], [72, 72], [80, 64], [90, 76], [118, 70], [124, 60],
    [36, 58], [60, 60], [96, 58], [20, 46], [46, 48], [126, 76], [66, 77], [8, 52]];

  function casa(D, ctx, x, y, w, h, parede, telhado, risco) {
    D.triangulo(ctx, x - 2, y - 9, w + 4, 10, K);
    D.triangulo(ctx, x, y - 7, w, 8, telhado);
    D.ret(ctx, x, y, w, h, K);
    D.ret(ctx, x + 1, y + 1, w - 2, h - 1, parede);
    for (var j = y + 3; j < y + h; j += 3) D.ret(ctx, x + 1, j, w - 2, 1, risco);
    D.ret(ctx, x + (w >> 1) - 2, y + h - 6, 4, 6, K);
    D.ret(ctx, x + (w >> 1) - 1, y + h - 5, 2, 5, '#6b4428');
  }

  Reino.registrarIlustracao('lp-contos-abertura', { w: 128, h: 80, desenhar: function (ctx, D) {
    var m = D.matriz;
    // céu, sol e chão florido
    D.ret(ctx, 0, 0, 128, 80, '#bfe9ff');
    D.circulo(ctx, 12, 10, 7, '#ffd34d');
    D.circulo(ctx, 12, 10, 5, '#fff3a0');
    D.elipse(ctx, 40, 9, 8, 3, '#ffffff');
    D.ret(ctx, 0, 36, 128, 44, '#8fdc6a');
    D.ret(ctx, 0, 36, 128, 2, '#6fc25a');
    D.elipse(ctx, 64, 79, 70, 8, '#b6e88a');
    FLORES.forEach(function (f, i) {
      D.ret(ctx, f[0], f[1], 1, 1, i % 3 ? '#ffffff' : '#ff9cc6');
      D.ret(ctx, f[0] - 1, f[1] + 1, 3, 1, i % 3 ? '#ffffff' : '#ff9cc6');
      D.ret(ctx, f[0], f[1] + 1, 1, 1, '#ffd34d');
    });
    // a árvore com porta e janela, no meio
    D.ret(ctx, 55, 22, 14, 26, K);
    D.ret(ctx, 56, 22, 12, 26, '#a0745a');
    D.ret(ctx, 59, 38, 6, 10, K);
    D.ret(ctx, 60, 39, 4, 9, '#6b4428');
    D.ret(ctx, 61, 27, 3, 3, K);
    D.ret(ctx, 62, 28, 1, 1, '#ffd34d');
    D.circulo(ctx, 62, 15, 15, K);
    D.circulo(ctx, 62, 15, 14, '#4fbf5a');
    D.circulo(ctx, 58, 11, 7, '#6fdc8c');
    // casas dos Três Porquinhos: palha, madeira e tijolos
    casa(D, ctx, 84, 32, 12, 14, '#ffd23f', '#e0a020', '#e0b040');
    casa(D, ctx, 99, 30, 12, 16, '#c98a4b', '#8a604a', '#a0745a');
    casa(D, ctx, 114, 26, 13, 20, '#ff9cc6', '#e0503a', '#e07a9a');
    // o Lobo Mau escondido no arbusto
    D.circulo(ctx, 77, 44, 8, K);
    D.circulo(ctx, 77, 44, 7, '#3f9a4a');
    m(ctx, 72, 38, LOBO, { k: K, g: '#8a8a9e', y: '#ffd34d', e: '#2a1838', l: '#d8d8e6', n: '#2a1838' });
    D.ret(ctx, 70, 48, 3, 2, '#3f9a4a');
    D.ret(ctx, 82, 47, 3, 2, '#3f9a4a');
    // os três porquinhos
    var porco = { k: K, p: '#ffc2dc', P: '#ff7eb6', e: '#2a1838', n: '#c0507a' };
    m(ctx, 86, 50, PORCO, porco);
    m(ctx, 100, 52, PORCO, porco);
    m(ctx, 114, 50, PORCO, porco);
    // Aladim no tapete voador
    m(ctx, 96, 3, ALADIM, { k: K, H: '#1e1a2e', s: '#d9a070', e: '#2a1838', m: '#c0505a', R: '#e8384f', w: '#ffffff', P: '#b58cff' });
    m(ctx, 86, 12, TAPETE, { k: K, p: '#8e4fd6', P: '#d9b8ff', y: '#ffd34d' });
    // Branca de Neve
    m(ctx, 3, 40, BRANCA, { k: K, r: '#e8384f', H: '#1e1a2e', s: PELE, e: '#2a1838', p: '#ff9cc6', m: '#c0505a', w: '#ffffff',
      R: '#e8384f', B: '#3a5fd0', Y: '#ffd34d', y: '#e0a800' });
    // os sete anões
    [['#ffa133', '#3a5fd0', 24, 47], ['#ffd34d', '#e8384f', 35, 48], ['#e8384f', '#5a8a3a', 20, 60], ['#3a5fd0', '#c98a4b', 31, 63],
      ['#4fbf5a', '#8e4fd6', 42, 60], ['#b58cff', '#4fbf5a', 6, 67], ['#a0745a', '#ffa133', 51, 67]].forEach(function (a) {
      m(ctx, a[2], a[3], ANAO, { k: K, c: a[0], v: a[1], s: PELE, e: '#2a1838', n: '#f0a07a', W: '#ffffff' });
    });
    // o coelhinho
    m(ctx, 46, 44, COELHO, { k: K, b: '#a0745a', e: '#2a1838', p: '#ff9cc6' });
    // Pinóquio e o Grilo Falante
    m(ctx, 60, 56, PINOQUIO, { k: K, Y: '#ffd34d', r: '#e8384f', H: '#3e2416', s: '#f2c08a', e: '#2a1838', m: '#c0505a',
      R: '#e8384f', w: '#ffffff', b: '#2f4ea8', B: '#4d6fd8' });
    m(ctx, 76, 63, GRILO, { k: K, B: '#3f6fd8', b: '#24408f', g: '#5ab860', e: '#2a1838', j: '#4a3a66' });
  } });
})();
