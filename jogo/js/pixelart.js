/* Pixel art feita em código: matrizes de letras + paleta, contorno automático.
   Nada de imagens externas. */
(function () {
  var PA = {};
  var CONTORNO = '#3a2446';
  var cache = {};

  /* ---------- cores ---------- */
  function hexParaRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbParaHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return (v < 16 ? '0' : '') + v.toString(16);
    }).join('');
  }
  function misturar(a, b, t) {
    var x = hexParaRgb(a), y = hexParaRgb(b);
    return rgbParaHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  }
  function escurecer(c, t) { return misturar(c, '#3a2446', t); }
  function clarear(c, t) { return misturar(c, '#ffffff', t); }
  PA.cor = { misturar: misturar, escurecer: escurecer, clarear: clarear, hexParaRgb: hexParaRgb };

  /* ---------- canvas ---------- */
  function novoCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return c;
  }
  PA.novoCanvas = novoCanvas;

  // desenha uma matriz de letras em ctx (x, y), usando a paleta {letra: cor}
  function pintarMatriz(ctx, linhas, paleta, x, y, espelhar) {
    var w = linhas[0].length;
    for (var j = 0; j < linhas.length; j++) {
      var linha = linhas[j];
      if (linha.length !== w && window.console) console.warn('Sprite com linha de tamanho diferente:', j, linha);
      for (var i = 0; i < linha.length; i++) {
        var ch = linha[i];
        if (ch === '.' || ch === ' ') continue;
        var cor = paleta[ch];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(x + (espelhar ? (w - 1 - i) : i), y + j, 1, 1);
      }
    }
  }
  PA.pintarMatriz = pintarMatriz;

  function matriz(linhas, paleta) {
    var c = novoCanvas(linhas[0].length, linhas.length);
    pintarMatriz(c.getContext('2d'), linhas, paleta, 0, 0);
    return c;
  }
  PA.matriz = matriz;

  // contorno de 1px ao redor de tudo que não é transparente (4 vizinhos)
  function contornar(src, cor) {
    var w = src.width, h = src.height;
    var c = novoCanvas(w + 2, h + 2);
    var ctx = c.getContext('2d');
    var dados = src.getContext('2d').getImageData(0, 0, w, h).data;
    function cheio(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      return dados[(y * w + x) * 4 + 3] > 0;
    }
    ctx.fillStyle = cor || CONTORNO;
    for (var y = -1; y <= h; y++) {
      for (var x = -1; x <= w; x++) {
        if (cheio(x, y)) continue;
        if (cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1)) ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    ctx.drawImage(src, 1, 1);
    return c;
  }
  PA.contornar = contornar;

  function espelhado(src) {
    var c = novoCanvas(src.width, src.height);
    var ctx = c.getContext('2d');
    ctx.translate(src.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0);
    return c;
  }
  PA.espelhado = espelhado;

  /* ---------- VISTAS (8 direções) ----------
     Cada sprite tem 5 vistas desenhadas; as outras 3 direções são o espelho.
     lado: para a direita • frente: para baixo • costas: para cima
     diagFrente: para baixo e direita • diagCostas: para cima e direita */
  PA.VISTAS = ['lado', 'frente', 'costas', 'diagFrente', 'diagCostas'];
  var OITO = [
    { vista: 'lado', espelhar: false }, { vista: 'diagFrente', espelhar: false },
    { vista: 'frente', espelhar: false }, { vista: 'diagFrente', espelhar: true },
    { vista: 'lado', espelhar: true }, { vista: 'diagCostas', espelhar: true },
    { vista: 'costas', espelhar: false }, { vista: 'diagCostas', espelhar: false },
  ];
  // direção do movimento na tela (y para baixo) → vista e se é espelhada
  PA.vistaDaDirecao = function (dx, dy) {
    var oitavo = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
    return OITO[(oitavo + 8) % 8];
  };

  /* ---------- UNICÓRNIOS ----------
     corpo + pernas (quadro 0 parado, 1 e 2 passos), asas, pontos de encaixe dos enfeites,
     brilhos da crina, onde a cavaleira senta e que pedaço fica na frente dela. */
  var ASA_ADULTO = [
    '..WW....',
    '.WWWX...',
    'XWWWWW..',
    'XWXWWWX.',
    '.XWXWWWW',
    '..XWXWWW',
    '....XWWW',
  ];
  var ASA_FILHOTE = [
    '.WW..',
    'WWWX.',
    'XWWWW',
    '.XWWW',
  ];
  var OCULOS_FRENTE = ['R.R....R.R', 'RRRRRRRRRR', '.R......R.'];
  // óculos de estrela (Loja) de frente: uma estrela em cada olho
  var OCULOS_ESTRELA_FRENTE = ['kYk....kYk', 'YOYkkkkYOY', 'YkY....YkY'];

  var UNI = { adulto: {}, filhote: {} };
  // desenhos de enfeites que também aparecem em lugar próprio em algum molde
  var BRINCO_LUA = ['.kYk', 'kYkk', 'kYk.', 'kYYk', '.kk.'];
  var FITINHA_CAUDA = ['kk.kk', 'kTkTk', 'kk.kk'];
  var POMPOM_CAUDA = ['.kkk.', 'kPPWk', 'kPPPk', 'kdPPk', '.kkk.'];
  // cometa: cabeça branca redonda (com um brilho amarelinho embaixo) na ponta da cauda e o rastro
  // azul-claro, com contorno próprio, saindo dela para cima (lê como cometa, não como mais uma mecha)
  var COMETA_CAUDA = ['......kk', '.....kck', '....kcCk', '..kkcCk.', '.kWWCk..', 'kYWWWk..', '.kYWYk..', '..kk....'];
  // adulto de lado e na diagonal: montada, a Mariana tampa o rastro que sobe para a frente; aqui a
  // cabeça fica no alto da cauda e o rastro sobe para trás, livre
  var COMETA_CAUDA_TRAS = ['kk....', 'kck...', 'kCck..', '.kCWk.', '.kWWWk', '.kYWYk', '..kkk.'];

  // Adulto / jovem (26 x 21)
  UNI.adulto.lado = {
    corpo: [
      '......................k...',
      '.....................gh...',
      '................b...gk....',
      '..............mmbp.hgk....',
      '.............mnnbbbbbbb...',
      '............mnrbbbbbbbbb..',
      '............mnrbbbbelbbbb.',
      '...........mmnrbbbbeebbbb.',
      '...........mnnrbbbbppbbbbb',
      '..........mmnrrbbbbbbbbbob',
      '..........mnnrbbbbbbboob..',
      '..mnm.....mnrbbbbbbb......',
      '.mnrmbbbbbbmnbbbbbbb......',
      'mnrmbbbwwwbbbbbbbbbbb.....',
      'nrmnbbbbbbbbbbbbbbbbb.....',
      'rmn.bbbbbbbbbbbbbbbbb.....',
      '.mn..sssssssssssssss......',
    ],
    pernas: [
      ['..rm..bb.ss....ss.bb......',
       '...n..bb.ss....ss.bb......',
       '......bb.ss....ss.bb......',
       '......ff.ff....ff.ff......'],
      ['..rm..bb.ss....ss.bb......',
       '...n.bb..ss...ss...bb.....',
       '.....bb..ss...ss...bb.....',
       '.....ff..ff...ff...ff.....'],
    ],
    asas: [{ linhas: ASA_ADULTO, x: 2, y: 4, atras: true, escura: true }, { linhas: ASA_ADULTO, x: 3, y: 5 }],
    ancoras: { orelha: [15, 1], olho: [19, 6], cabeca: [17, 3],
      pescoco: [16, 11], cauda: [2, 13], chifre: [21, 1] },
    // de lado o chifre é inclinado: o anel não leva o risquinho (embaixo dele só há o próprio chifre)
    enfeites: { 'anel-saturno': { linhas: ['.AA..AA.', 'AAaaaaAA'], x: 18, y: 1 },
      'cometa-cauda': { linhas: COMETA_CAUDA_TRAS, x: 0, y: 8 } },
    brilhos: [[12, 6], [11, 9], [2, 13], [13, 4]],
    cavaleira: [2, 2],
  };
  UNI.adulto.frente = {
    corpo: [
      '........h.........',
      '........hg........',
      '...b....hg....b...',
      '...bb..mhgm..bb...',
      '..mbpbmnnrnmbpb...',
      '.mbbbbbmnrnbbbbb..',
      'mnbbbbbbmrbbbbbb..',
      'mnbbbelbbbbelbbb..',
      'mrbbbeebbbbeebbb..',
      'nrbpbbbbbbbbbbpb..',
      'rn.bbbqqqqqqbbb...',
      '.rn.bqoqqqqoqb....',
      '..r..qqqqqqqq.....',
      '....bssssssssb....',
      '....bbbbbbbbbb....',
      '....bbbbbbbbbb....',
      '....sbbbbbbbbs....',
    ],
    pernas: [
      ['.....bb....bb.....',
       '.....bb....bb.....',
       '.....bb....bb.....',
       '.....ff....ff.....'],
      ['.....bb....bb.....',
       '.....bb....bb.....',
       '.....ff....bb.....',
       '...........ff.....'],
      ['.....bb....bb.....',
       '.....bb....bb.....',
       '.....bb....ff.....',
       '.....ff...........'],
    ],
    asas: [
      { linhas: ['W..', 'WW.', 'XWW', '.XW'], x: 1, y: 12, atras: true },
      { linhas: ['..W', '.WW', 'WWX', 'WX.'], x: 14, y: 12, atras: true },
    ],
    ancoras: { orelha: [3, 2], olho: [5, 7], cabeca: [8, 3],
      pescoco: [9, 13], cauda: null, chifre: [8, 1] },
    enfeites: { oculos: { linhas: OCULOS_FRENTE, x: 4, y: 6 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 4, y: 6 } },
    brilhos: [[0, 7], [1, 10], [7, 4]],
    cavaleira: [3, -8],
    naFrente: [0, 0, 17, 12],
  };
  UNI.adulto.costas = {
    corpo: [
      '........h.........',
      '........hg........',
      '...b....hg....b...',
      '...bb..mhgm..bb...',
      '...bbbbmnmbbbbb...',
      '..bbbbbbmnrbbbbb..',
      '..bbbbbbbmnrbbbb..',
      '..bbbbbbbmnrbbbb..',
      '..bbbbbbbbmnrbbb..',
      '...bbbbbbbmnrbb...',
      '.....bbbbbmnrm....',
      '....bbbbbbbmnrb...',
      '..bbbbbbbbbbmnbb..',
      '..bbbbbbmmbbbbbb..',
      '..bbbbbmnnmbbbbb..',
      '..bbbbbmnrnbbbbb..',
      '..sssssmnrnsssss..',
    ],
    pernas: [
      ['...bb..mnrm..bb...',
       '...bb...nr...bb...',
       '...bb...rm...bb...',
       '...ff........ff...'],
      ['...bb..mnrm..bb...',
       '...bb...nr...bb...',
       '...ff...rm...bb...',
       '.............ff...'],
      ['...bb..mnrm..bb...',
       '...bb...nr...bb...',
       '...bb...rm...ff...',
       '...ff.............'],
    ],
    asas: [
      { linhas: ['WW....', 'WWWW..', '.XWWWW', '..XXWW'], x: 1, y: 10 },
      { linhas: ['....WW', '..WWWW', 'WWWWX.', 'WWXX..'], x: 11, y: 10 },
    ],
    ancoras: { orelha: [14, 2], olho: null, cabeca: [8, 3],
      pescoco: [9, 10], cauda: [8, 16], chifre: [8, 1] },
    // de costas o laço da gravata e o pingente do colar ficam escondidos: só a tirinha e o fio
    // (os desenhos próprios usam a paleta do enfeite em PA.ENFEITES_MONTARIA)
    enfeites: { 'gravata-borboleta': { linhas: ['RRRRR'], x: 5, y: 10 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 6, y: 10 } },
    brilhos: [[10, 6], [11, 9], [8, 15]],
    cavaleira: [3, 6],
  };
  UNI.adulto.diagFrente = {
    corpo: [
      '.................h....',
      '.................hg...',
      '...........b.....hg.b.',
      '...........bb..mmhgbb.',
      '..........mbpbmnnrnbpb',
      '.........mnbbbbmnrbbbb',
      '.........mnbbbbbmrbbbb',
      '........mnrbelbbbbbelb',
      '........mnrbeebbbbbeeb',
      '.......mnrbbbpbqqqqqpb',
      '..mnm..mnrbbbbqoqqqob.',
      '.mnrmbbmnbbbbbbqqqqb..',
      'mnrmbbbbnbbbbbsssssb..',
      'nrmnbbbwwwbbbbbbbbb...',
      'rmn.bbbbbbbbbbbbbbb...',
      '.mn..bbbbbbbbbbbbbb...',
      '......ssssssssssssss..',
    ],
    pernas: [
      ['......bb.ss...bb.ss...',
       '......bb.ss...bb.ss...',
       '......ff.ff...bb.ss...',
       '..............ff.ff...'],
      ['......bb.ss...bb.ss...',
       '.....bb..ss..bb..ss...',
       '.....ff..ff..bb...ss..',
       '.............ff...ff..'],
    ],
    asas: [{ linhas: ASA_ADULTO, x: 3, y: 4, atras: true, escura: true }, { linhas: ASA_ADULTO, x: 4, y: 5 }],
    ancoras: { orelha: [20, 2], olho: [19, 7], cabeca: [17, 3],
      pescoco: [16, 12], cauda: [2, 12], chifre: [17, 1] },
    enfeites: { oculos: { linhas: OCULOS_FRENTE, x: 11, y: 6 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 11, y: 6 },
      'anel-saturno': { linhas: ['.AA..AA.', 'AAaaaaAA', '.kk.....'], x: 14, y: 1 },
      'cometa-cauda': { linhas: COMETA_CAUDA_TRAS, x: 0, y: 7 },
      // brinco na orelha do lado de cá, longe dos olhos (na orelha de lá tampava o olho);
      // naFrente: montada, a lua é pintada de novo por cima da Mariana (senão some atrás da perna dela)
      'brinco-lua': { linhas: BRINCO_LUA, x: 7, y: 3, naFrente: true } },
    brilhos: [[10, 6], [8, 9], [2, 13], [15, 4]],
    cavaleira: [4, -4],
    naFrente: [10, 0, 21, 12],
  };
  UNI.adulto.diagCostas = {
    corpo: [
      '...................h..',
      '..................hg..',
      '.............b....hg..',
      '............bbb..bhgb.',
      '...........mbbbbbbbbb.',
      '..........mnbbbbbbbbbb',
      '..........mnbbbbbbbbbb',
      '.........mnrbbbbbbbbbb',
      '.........mnrbbbbbbbbb.',
      '........mnrbbbbbbbbb..',
      '........mnrbbbbbbbb...',
      '.......mnrbbbbbbbb....',
      '.mm.bbbmnbbbbbbbbb....',
      'mnnmbbbbbbbbbbbbbb....',
      'mnrnbbbbbbbbbbbbbb....',
      'mnrnbbbbbbbbbbbbb.....',
      '.nrnsssssssssssss.....',
    ],
    pernas: [
      ['.rnm.bb.ss...bb.ss....',
       '..rn.bb.ss...bb.ss....',
       '..r..bb.ss...ff.ff....',
       '.....ff.ff............'],
      ['.rnm.bb.ss...bb.ss....',
       '..rnbb...ss.bb...ss...',
       '..r.bb...ss.ff...ff...',
       '....ff...ff...........'],
    ],
    asas: [{ linhas: ASA_ADULTO, x: 5, y: 4, atras: true, escura: true }, { linhas: ASA_ADULTO, x: 6, y: 5 }],
    ancoras: { orelha: [13, 2], olho: null, cabeca: [16, 4],
      pescoco: [15, 9], cauda: [2, 14], chifre: [18, 1] },
    enfeites: { 'gravata-borboleta': { linhas: ['RRRR'], x: 11, y: 9 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 12, y: 9 },
      // o anel 1 px mais estreito na frente, para caber na borda direita
      'anel-saturno': { linhas: ['..AA..AA', '.AAaaaAA'], x: 14, y: 1 } },
    brilhos: [[10, 7], [9, 10], [1, 14]],
    cavaleira: [5, 1],
  };

  // Filhote (18 x 16): bebê e pequeno
  // bebê: o anel desce 1 px e fica 1 px mais estreito, colado na cabeça e centrado no toquinho
  // (as pontas não ficam soltas acima da cabeça como duas anteninhas)
  var ANEL_BEBE_FRENTE = { linhas: ['A...A', '.AaA.'], x: 5, y: 3 };
  var ANEL_BEBE_DIAG = { linhas: ['A...A', '.AaA.'], x: 10, y: 3 };
  UNI.filhote.lado = {
    corpo: [
      '.............h....',
      '.........b..hg....',
      '......mn.bp.h.....',
      '.....mnrbbbbbbb...',
      '.....mnrbbbbbbbb..',
      '....mnrbbbbelbbbb.',
      '....mnrbbbbeebbbb.',
      '....mnbbbbbppbbbbb',
      '.mn.rbbbbbbbbboob.',
      'mnrbbbbbbbbbbb....',
      'nrmbbwwwbbbbbb....',
      '.m.bbbbbbbbbbb....',
      '....sssssssss.....',
    ],
    pernas: [
      ['....bb.s.s.bb.....',
       '....bb.s.s.bb.....',
       '....ff.f.f.ff.....'],
      ['...bb..s.s..bb....',
       '...bb..s.s..bb....',
       '...ff..f.f..ff....'],
    ],
    asas: [{ linhas: ASA_FILHOTE, x: 1, y: 3, atras: true, escura: true }, { linhas: ASA_FILHOTE, x: 2, y: 4 }],
    ancoras: { orelha: [8, 0], olho: [11, 5], cabeca: [10, 2],
      pescoco: [10, 10], cauda: [1, 9], chifre: [12, 1] },
    // filhote: o anel de Saturno é um aro pequeno em volta da base do chifrinho, visto um pouco de
    // cima (pontas ao lado do chifre, arco da frente embaixo): no bebê o toquinho aparece dentro dele
    enfeites: { 'anel-saturno': { linhas: ['A...A', '.AaA.'], x: 10, y: 2 },
      // enfeites de cauda 1 px para dentro (cauda + dx −1), para não cortar na borda esquerda
      'fitinha-cauda': { linhas: FITINHA_CAUDA, x: 0, y: 8 },
      'pompom-cauda': { linhas: POMPOM_CAUDA, x: 0, y: 7 },
      'cometa-cauda': { linhas: COMETA_CAUDA, x: 0, y: 5 },
      // de lado o filhote mostra só dois planetas, no peito (os três viravam um cinto na barriga)
      'colar-planetas': { linhas: ['ykkykky', 'krRkbBk', 'kRRkBBk', '.kk.kk.'], x: 7, y: 9 } },
    brilhos: [[5, 5], [1, 9], [6, 3]],
    cavaleira: [1, -1],
  };
  UNI.filhote.frente = {
    corpo: [
      '.......h........',
      '.......hg.......',
      '...b...hg...b...',
      '...bb.mhgm.bb...',
      '..mbpbmnnmbpb...',
      'mnbbbbbmrbbbbb..',
      'mnbbelbbbbelbb..',
      'mrbbeebbbbeebb..',
      'nrbpbbbbbbbbpb..',
      'rn.bqqqqqqqqb...',
      '.r..qoqqqqoq....',
      '....bssssssb....',
      '....bbbbbbbb....',
    ],
    pernas: [
      ['.....bb..bb.....',
       '.....bb..bb.....',
       '.....ff..ff.....'],
      ['.....bb..bb.....',
       '.....ff..bb.....',
       '.........ff.....'],
      ['.....bb..bb.....',
       '.....bb..ff.....',
       '.....ff.........'],
    ],
    asas: [
      { linhas: ['W..', 'WW.', 'XWW'], x: 1, y: 9, atras: true },
      { linhas: ['..W', '.WW', 'WWX'], x: 12, y: 9, atras: true },
    ],
    ancoras: { orelha: [3, 2], olho: [4, 6], cabeca: [7, 3],
      pescoco: [8, 11], cauda: null, chifre: [7, 1] },
    enfeites: { oculos: { linhas: OCULOS_FRENTE, x: 3, y: 5 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 3, y: 5 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 5, y: 2, bebe: ANEL_BEBE_FRENTE },
      // lua 1 linha mais curta e encostada na borda, com 1 px livre até o olho esquerdo
      'brinco-lua': { linhas: ['.kYk', 'kYk.', 'kYYk', '.kk.'], x: 0, y: 3 } },
    brilhos: [[0, 6], [1, 8], [7, 4]],
    cavaleira: [2, -9],
    naFrente: [0, 0, 15, 10],
  };
  UNI.filhote.costas = {
    corpo: [
      '.......h........',
      '.......hg.......',
      '...b...hg...b...',
      '...bb.mhgm.bb...',
      '...bbbbmnbbbb...',
      '..bbbbbbmnrbbb..',
      '..bbbbbbbmnrbb..',
      '..bbbbbbbmnrbb..',
      '...bbbbbbbmnr...',
      '....bbbbbbmnrm..',
      '...bbbbbbbbmnb..',
      '...bbbbmmbbbbb..',
      '...sssmnnmsss...',
    ],
    pernas: [
      ['....bb.rn.bb....',
       '....bb.nr.bb....',
       '....ff....ff....'],
      ['....bb.rn.bb....',
       '....ff.nr.bb....',
       '..........ff....'],
      ['....bb.rn.bb....',
       '....bb.nr.ff....',
       '....ff..........'],
    ],
    asas: [
      { linhas: ['WW...', '.WWWW', '..XWW'], x: 2, y: 8 },
      { linhas: ['...WW', 'WWWW.', 'WWX..'], x: 9, y: 8 },
    ],
    ancoras: { orelha: [12, 2], olho: null, cabeca: [7, 3],
      pescoco: [8, 9], cauda: [7, 12], chifre: [7, 1] },
    enfeites: { 'gravata-borboleta': { linhas: ['RRRRR'], x: 5, y: 9 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 5, y: 9 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 5, y: 2, bebe: ANEL_BEBE_FRENTE } },
    brilhos: [[10, 6], [11, 8]],
    cavaleira: [2, 3],
  };
  UNI.filhote.diagFrente = {
    corpo: [
      '............h...',
      '............hg..',
      '.......b....hg.b',
      '.......bb..mhgbb',
      '......mbpbmnrnpb',
      '.....mnbbbbmrbbb',
      '.....mnbelbbbelb',
      '....mnrbeebbbeeb',
      '....mnrbpbqqqqpb',
      '.mn.rbbbbbqoqob.',
      'mnrbbbbbbbbqqb..',
      'nrmbbwwwbbbssb..',
      '.m..sssssssss...',
    ],
    pernas: [
      ['....bb.s..bb.s..',
       '....ff.f..bb.s..',
       '..........ff.f..'],
      ['...bb..s.bb..s..',
       '...ff..f.bb..s..',
       '.........ff..f..'],
    ],
    asas: [{ linhas: ASA_FILHOTE, x: 2, y: 5, atras: true, escura: true }, { linhas: ASA_FILHOTE, x: 3, y: 6 }],
    ancoras: { orelha: [15, 2], olho: [13, 6], cabeca: [12, 3],
      pescoco: [12, 11], cauda: [2, 10], chifre: [12, 1] },
    enfeites: { oculos: { linhas: ['R.R..R.R', 'RRRRRRRR', '.R....R.'], x: 7, y: 5 },
      'oculos-estrela': { linhas: ['kYk..kYk', 'YOYkkYOY', 'YkY..YkY'], x: 7, y: 5 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 10, y: 2, bebe: ANEL_BEBE_DIAG },
      'brinco-lua': { linhas: BRINCO_LUA, x: 3, y: 3 } },
    brilhos: [[5, 6], [1, 10], [6, 4]],
    cavaleira: [2, -6],
    naFrente: [7, 0, 15, 11],
  };
  UNI.filhote.diagCostas = {
    corpo: [
      '.............h..',
      '............hg..',
      '.........b..hg..',
      '........mbb.hgb.',
      '.......mnbbbbbbb',
      '.......mnrbbbbbb',
      '......mnrbbbbbbb',
      '......mnrbbbbbb.',
      '.....mnrbbbbbb..',
      '.mbbbbnrbbbbbb..',
      'mnrbbbbbbbbbbb..',
      'nrmbbbbbbbbbbb..',
      'rm..sssssssss...',
    ],
    pernas: [
      ['....bb.s..bb.s..',
       '....bb.s..ff.f..',
       '....ff.f........'],
      ['...bb..s.bb..s..',
       '...bb..s.ff..f..',
       '...ff..f........'],
    ],
    asas: [{ linhas: ASA_FILHOTE, x: 3, y: 5, atras: true, escura: true }, { linhas: ASA_FILHOTE, x: 4, y: 6 }],
    ancoras: { orelha: [9, 2], olho: null, cabeca: [12, 3],
      pescoco: [10, 8], cauda: [2, 10], chifre: [12, 1] },
    enfeites: { 'gravata-borboleta': { linhas: ['RRRR'], x: 8, y: 8 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 7, y: 8 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 10, y: 2, bebe: ANEL_BEBE_DIAG } },
    brilhos: [[7, 5], [6, 7], [1, 10]],
    cavaleira: [3, 0],
  };

  var ENFEITES = {
    flor:   { linhas: ['.P.', 'PYP', '.P.'], paleta: { P: '#ff7eb6', Y: '#ffe066' }, ancora: 'orelha', dx: -1, dy: 1 },
    laco:   { linhas: ['PP.PP', 'PPYPP', 'P...P'], paleta: { P: '#ff4f9a', Y: '#ffd1e6' }, ancora: 'orelha', dx: -3, dy: 1 },
    coroa:  { linhas: ['Y.Y.Y', 'YYYYY', 'YRYBY'], paleta: { Y: '#ffd34d', R: '#ff5c8a', B: '#6fb8ff' }, ancora: 'cabeca', dx: -3, dy: -1 },
    oculos: { linhas: ['R.R', 'RRR', '.R.'], paleta: { R: '#ff3b7f' }, ancora: 'olho', dx: -1, dy: -1 },
    // acessórios das provas bimestrais (js/provas/*.js)
    // (com contorno próprio 'k' para não sumir no meio da crina colorida)
    'tiara-arco-iris': { linhas: ['..kpk..', 'kykpkyk', 'kyyyyyk', 'kroGbvk'], paleta: { k: '#3a2446', y: '#ffd34d', p: '#ff7eb6', r: '#ff6b8a', o: '#ffb020', G: '#6fdc8c', b: '#5fb4ff', v: '#a66bff' }, ancora: 'cabeca', dx: -5, dy: -2 },
    'pena-magica': { linhas: ['kk...', 'kbk..', 'klbk.', '.klbk', '..kbk', '...ky'], paleta: { k: '#3a2446', b: '#4a9dff', l: '#e6f3ff', y: '#ffd34d' }, ancora: 'orelha', dx: -4, dy: 0 },
    'laco-vovo': { linhas: ['kk...kk', 'kLk.kLk', 'kLwDwLk', 'kLkDkLk', 'kk...kk'], paleta: { k: '#3a2446', L: '#b58cff', w: '#ffffff', D: '#7c5cff' }, ancora: 'orelha', dx: -4, dy: 1 },
    'coroa-big-ben': { linhas: ['...k...', '..kbk..', '.kwhwk.', 'kykkkyk', 'kyyryyk', 'kkkkkkk'], paleta: { k: '#3a2446', y: '#ffd34d', b: '#4a6cd4', w: '#ffffff', h: '#ff5c8a', r: '#5fb4ff' }, ancora: 'cabeca', dx: -3, dy: -5 },
    'oculos-de-sol': { linhas: ['pppppppp', 'pkkppkkp', 'pkgppkgp', '.pp..pp.'], paleta: { k: '#3a2446', p: '#ff7eb6', g: '#6a5a8a' }, ancora: 'olho', dx: -4, dy: -1 },
    'lacinho-estrela': { linhas: ['kk...kk', 'kbk.kbk', 'kbkykbk', 'kbyyybk', 'kbkykbk', 'kk...kk'], paleta: { k: '#3a2446', b: '#4a9dff', y: '#ffe066' }, ancora: 'orelha', dx: -4, dy: 1 },
    // enfeites da Loja das Fadas (js/loja-itens.js), com os encaixes novos: chifre, pescoço e cauda
    'fitinha-cauda': { linhas: FITINHA_CAUDA, paleta: { k: '#3a2446', T: '#34d0c0' }, ancora: 'cauda', dx: -2, dy: -1 },
    // pompom redondo 5×5 em rosa forte, com brilho branco e sombra: aparece em cima da crina clara
    'pompom-cauda': { linhas: POMPOM_CAUDA, paleta: { k: '#3a2446', W: '#ffffff', P: '#ff4f9a', d: '#c92f73' }, ancora: 'cauda', dx: -2, dy: -2 },
    // cometinha: estrela brilhante na ponta da cauda e um rastro que afina subindo para o lado do corpo
    'cometa-cauda': { linhas: COMETA_CAUDA, paleta: { k: '#3a2446', W: '#ffffff', Y: '#ffe680', C: '#5fc4ff', c: '#c4eeff' }, ancora: 'cauda', dx: -2, dy: -4 },
    // duas asinhas triangulares vermelhas (borda em vermelho-escuro, não em contorno escuro, para não
    // parecer uma carinha) e o nó no meio; de costas só a tirinha R (desenho próprio nos moldes)
    'gravata-borboleta': { linhas: ['dl...ld', 'dRRNRRd', 'dR...Rd'], paleta: { d: '#b0243f', R: '#ff4f6d', l: '#ffa3b3', N: '#8c1c33' }, ancora: 'pescoco', dx: -3, dy: -1 },
    // fio de pérolas creme e rosa-clarinho com 1 px de sombra lilás-escura embaixo (lê em corpo de
    // qualquer cor, sem o tracejado escuro de zíper) e um coraçãozinho rosa com brilho de pingente
    'colar-perolas': { linhas: ['LcrcrcL', '.LPLPL.', '.LPWPL.', '..LPL..', '...L...'], paleta: { L: '#8a6fb0', c: '#fff8ee', r: '#ffc7e2', P: '#ff4f9a', W: '#ffffff' }, ancora: 'pescoco', dx: -3, dy: 0 },
    // colar de planetas: três bolinhas de 2×2 (rosa, azul e laranja, com um pontinho de brilho), cada
    // uma com contorno próprio, para lerem como planetinhas e não como uma listra no meio da crina,
    // presas por elos dourados
    'colar-planetas': { linhas: ['ykkykkykky', 'krRkbBkoOk', 'kRRkBBkOOk', '.kk.kk.kk.'], paleta: { k: '#3a2446', y: '#ffd34d', R: '#ff6b8a', r: '#ffc2d0', B: '#5fb4ff', b: '#cfe9ff', O: '#ffb020', o: '#ffe6a0' }, ancora: 'pescoco', dx: -5, dy: -1 },
    'brinco-lua': { linhas: BRINCO_LUA, paleta: { k: '#3a2446', Y: '#ffc21a' }, ancora: 'orelha', dx: -2, dy: 1 },
    'oculos-estrela': { linhas: ['kYk', 'YOY', 'YkY'], paleta: { k: '#3a2446', Y: '#f5a300', O: '#ffe066' }, ancora: 'olho', dx: -1, dy: -1 },
    'coroa-flores': { linhas: ['kPk.kBk', 'PYPkBYB', 'GGGGGGG', 'kkkkkkk'], paleta: { k: '#3a2446', P: '#ff7eb6', B: '#b58cff', Y: '#ffe066', G: '#6fdc8c' }, ancora: 'cabeca', dx: -3, dy: -2 },
    // tiara: a faixa em azul-noite claro (antes quase branca, sumia na cabeça) segura as duas estrelas
    'tiara-estrelas': { linhas: ['.Y...Y.', 'YWY.YWY', 'kSkSkSk'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#fffbe0', S: '#8f9cff' }, ancora: 'cabeca', dx: -3, dy: -2 },
    // adulto: anel lilás largo atravessando o meio do chifre, visto um pouco de cima: o arco de trás
    // (lilás forte) some atrás do chifre e o da frente (com brilho claro) passa por cima dele
    // (e um risquinho de contorno embaixo dele onde encosta na crina, para não se misturar com ela)
    'anel-saturno': { linhas: ['.AA..AA.', 'AAaaaaAA', '..k..k..'], paleta: { k: '#3a2446', A: '#9a6cf5', a: '#d9c2ff' }, ancora: 'chifre', dx: -3, dy: 0 },
  };
  PA.ENFEITES_MONTARIA = ENFEITES;

  function paletaUnicornio(def, estagio) {
    var corpo = def.cores.corpo;
    var crina = def.cores.crina;
    var chifre = def.cores.chifre || '#ffd34d';
    var p = {
      b: corpo, s: escurecer(corpo, 0.14), w: clarear(corpo, 0.55),
      m: crina[0], n: crina[1] || crina[0], r: crina[2] || crina[1] || crina[0],
      h: chifre, g: escurecer(chifre, 0.25), k: clarear(chifre, 0.45),
      e: '#2a1838', l: '#ffffff', p: '#ff9cc6', o: '#6b3b5a', q: misturar(corpo, '#ff9cc6', 0.22),
      f: escurecer(def.cores.casco || corpo, 0.3),
      W: def.cores.asa || '#ffffff', X: escurecer(def.cores.asa || '#ffffff', 0.18),
    };
    if (estagio === 0) { p.h = clarear(chifre, 0.35); } // bebê: chifre bem pequenino
    return p;
  }

  // estagio: 0 bebê, 1 pequeno, 2 jovem, 3 adulto • opcoes.vista: uma de PA.VISTAS
  PA.unicornio = function (def, estagio, quadro, opcoes) {
    opcoes = opcoes || {};
    var enf = opcoes.enfeites || [];
    var vista = opcoes.vista || 'lado';
    var chave = ['uni', def.id, estagio, quadro, enf.join('+'), opcoes.asasFada ? 'af' : '', vista].join('|');
    if (cache[chave]) return cache[chave];

    var grande = estagio >= 2;
    var molde = UNI[grande ? 'adulto' : 'filhote'][vista];
    var pernas = molde.pernas[quadro % 3] || molde.pernas[1];
    var corpoLinhas = molde.corpo.concat(pernas);
    if (estagio === 0) {
      // bebê: só um toquinho de chifre
      corpoLinhas = corpoLinhas.map(function (l, j) { return j < 2 ? l.replace(/[hg]/g, '.') : l.replace(/g/g, '.'); });
    }
    var w = corpoLinhas[0].length, h = corpoLinhas.length;
    var base = novoCanvas(w, h);
    var ctx = base.getContext('2d');
    var pal = paletaUnicornio(def, estagio);

    var temAsas = (def.raridade === 'epico' || def.raridade === 'lendario') || opcoes.asasFada;
    var palAsa = pal;
    if (opcoes.asasFada && !(def.raridade === 'epico' || def.raridade === 'lendario')) {
      palAsa = Object.assign({}, pal, { W: '#e6d6ff', X: '#b9a3f5' });
    }
    var palAsaEscura = Object.assign({}, palAsa, { W: palAsa.X, X: escurecer(palAsa.X, 0.2) });
    var asas = temAsas && estagio >= 1 ? molde.asas : [];
    // asas de trás antes do corpo, as da frente por cima
    asas.forEach(function (a) { if (a.atras) pintarMatriz(ctx, a.linhas, a.escura ? palAsaEscura : palAsa, a.x, a.y); });
    pintarMatriz(ctx, corpoLinhas, pal, 0, 0);
    asas.forEach(function (a) { if (!a.atras) pintarMatriz(ctx, a.linhas, palAsa, a.x, a.y); });

    // brilhinhos na crina dos raros para cima
    if (def.raridade !== 'comum' && estagio >= 1) {
      ctx.fillStyle = '#ffffff';
      molde.brilhos.forEach(function (pt) { ctx.fillRect(pt[0], pt[1], 1, 1); });
    }

    var enfNaFrente = [];
    enf.forEach(function (nome) {
      var e = ENFEITES[nome];
      if (!e) return;
      var proprio = molde.enfeites && molde.enfeites[nome];
      if (proprio && estagio === 0 && proprio.bebe) proprio = proprio.bebe;
      if (proprio && proprio.naFrente) enfNaFrente.push({ linhas: proprio.linhas, paleta: e.paleta, x: proprio.x, y: proprio.y });
      if (proprio) { pintarMatriz(ctx, proprio.linhas, e.paleta, proprio.x, proprio.y); return; }
      var a = molde.ancoras[e.ancora];
      if (a) pintarMatriz(ctx, e.linhas, e.paleta, a[0] + e.dx, a[1] + e.dy);
    });

    var final = contornar(base, CONTORNO);
    var res = { canvas: final, w: final.width, h: final.height, grande: grande, base: base,
      cavaleira: molde.cavaleira, naFrente: molde.naFrente || null, enfeitesNaFrente: enfNaFrente };
    cache[chave] = res;
    return res;
  };

  /* ---------- MARIANA ---------- */
  var CAPA = ['.PP', 'PPP', 'PPP', 'PP.'];
  var MARI = {
    lado: {
      cabeca: [
        '..BHHHH....',
        '.BBHHHHHH..',
        '..HHHHHHHH.',
        '..HHHKKKKK.',
        '..HHKKKEKK.',
        '..HHKKKKRK.',
        '..HHHKKKK..',
      ],
      emPe: [
        ['..HH.CCC...',
         '..HHACACKK.',
         '...HAAACC..',
         '...CCACCC..',
         '...DDDDDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HH.CCC...',
         '..HHACACKK.',
         '...HAAACC..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK...KK.',
         '...KK...KK.',
         '...SS...SS.'],
      ],
      sentada: [
        '..HH.CCC...',
        '..HHCCCCKK.',
        '...HCCCC...',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: CAPA, x: 0, y: 7 },
    },
    frente: {
      cabeca: [
        '...HHHHBB..',
        '..HHHHHHBB.',
        '.HHHHHHHHH.',
        '.HHKKKKKHH.',
        '.HKEKKKEKH.',
        '.HRKKKKKRH.',
        '.HHKKKKKHH.',
      ],
      emPe: [
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...KK.KK...',
         '...SS.SS...'],
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...SS.KK...',
         '......SS...'],
        ['.HHCCCCCHH.',
         '.HKCACACKH.',
         '..KCAAACK..',
         '...CCACC...',
         '..DDDDDDD..',
         '...KK.KK...',
         '...KK.SS...',
         '...SS......'],
      ],
      sentada: [
        '.HHCCCCCHH.',
        '.HKCCCCCKH.',
        '..KCCCCCK..',
        '..DDDDDDD..',
        '.DD.....DD.',
        '.KK.....KK.',
        '.SS.....SS.',
      ],
      capa: { linhas: ['P.........P', 'PP.......PP', 'PP.......PP', 'P.........P'], x: 0, y: 7 },
    },
    costas: {
      cabeca: [
        '..BBHHHH...',
        '.BBHHHHHH..',
        '.HHHLLHHHH.',
        '.HHLHHHHHH.',
        '.HHHHHHHHH.',
        '.HHHHHHHHH.',
        '.HHHHHHHHH.',
      ],
      emPe: [
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...KK.KK...',
         '...SS.SS...'],
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...SS.KK...',
         '......SS...'],
        ['.HHHHHHHHH.',
         '..KHHHHHK..',
         '..KCHHHCK..',
         '...CACAC...',
         '..DDDADDD..',
         '...KK.KK...',
         '...KK.SS...',
         '...SS......'],
      ],
      sentada: [
        '.HHHHHHHHH.',
        '..KHHHHHK..',
        '..KCHHHCK..',
        '..DDDDDDD..',
        '.DD.....DD.',
        '.KK.....KK.',
        '.SS.....SS.',
      ],
      capa: { linhas: ['.PPPPP.', 'PPPPPPP', 'PPPPPPP', 'PPPPPPP'], x: 2, y: 8, sobre: true },
    },
    diagFrente: {
      cabeca: [
        '..BHHHHH...',
        '.BBHHHHHHH.',
        '..HHHHHHHH.',
        '..HHKKKKKH.',
        '..HHKEKKEK.',
        '..HHKKKKRK.',
        '..HHHKKKK..',
      ],
      emPe: [
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK..KK..',
         '...SS..KK..',
         '.......SS..'],
        ['..HHCCCC...',
         '..HKCACAK..',
         '...KCAAAK..',
         '...CCACCC..',
         '...DDDDDD..',
         '...KK..KK..',
         '...KK..SS..',
         '...SS......'],
      ],
      sentada: [
        '..HHCCCC...',
        '..HKCCCCK..',
        '...KCCCCK..',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: CAPA, x: 0, y: 7 },
    },
    diagCostas: {
      cabeca: [
        '..BHHHH....',
        '.BBHHHHHH..',
        '..HHHLLHHH.',
        '..HHLHHHHH.',
        '..HHHHHHHK.',
        '..HHHHHHKK.',
        '..HHHHHKK..',
      ],
      emPe: [
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '....KK.KK..',
         '....KK.KK..',
         '....SS.SS..'],
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '...KK..KK..',
         '...KK..SS..',
         '...SS......'],
        ['..HHHHHC...',
         '..HHHHHCK..',
         '...HHHCCK..',
         '...CCACAC..',
         '...DDADDD..',
         '...KK..KK..',
         '...SS..KK..',
         '.......SS..'],
      ],
      sentada: [
        '..HHHHHC...',
        '..HHHHHCK..',
        '...HHHCCK..',
        '...DDDDD...',
        '.....DD....',
        '.....DD....',
        '.....SS....',
      ],
      capa: { linhas: ['PPPP.', 'PPPPP', 'PPPPP', '.PPP.'], x: 2, y: 8, sobre: true },
    },
  };

  PA.APARENCIA_PADRAO = { pele: '#f1c7a5', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ff4f9a' };
  PA.OPCOES_APARENCIA = {
    pele: ['#ffe0c7', '#f1c7a5', '#d9a07a', '#a86b4a', '#7a4a32'],
    cabelo: ['#2b1b17', '#5a3825', '#a0673a', '#e8c16a', '#c2532b'],
    roupa: ['#ff7eb6', '#9b7bff', '#4fc3f7', '#6fdc8c', '#ffb74d'],
    laco: ['#ff4f9a', '#ffd34d', '#7c5cff', '#39c5bb', '#ffffff'],
  };

  function paletaMariana(ap) {
    return {
      H: ap.cabelo, L: misturar(ap.cabelo, '#ffe3c4', 0.2), K: ap.pele, E: '#2a1838', R: '#ff9cc6',
      C: ap.roupa, D: escurecer(ap.roupa, 0.2), A: escurecer(ap.roupa, 0.34), S: '#6b3b5a', B: ap.laco,
    };
  }

  PA.mariana = function (ap, sentada, quadro, opcoes) {
    opcoes = opcoes || {};
    ap = ap || PA.APARENCIA_PADRAO;
    var vista = opcoes.vista || 'lado';
    var chave = ['mar', ap.pele, ap.cabelo, ap.roupa, ap.laco, sentada ? 1 : 0, quadro % 3, opcoes.capa ? 1 : 0, vista].join('|');
    if (cache[chave]) return cache[chave];
    var molde = MARI[vista];
    var corpo = sentada ? molde.sentada : (molde.emPe[quadro % 3] || molde.emPe[1]);
    var linhas = molde.cabeca.concat(corpo);
    var base = novoCanvas(linhas[0].length, linhas.length);
    var ctx = base.getContext('2d');
    var capa = opcoes.capa && molde.capa;
    if (capa && !capa.sobre) pintarMatriz(ctx, capa.linhas, { P: '#9b5cff' }, capa.x, capa.y);
    pintarMatriz(ctx, linhas, paletaMariana(ap), 0, 0);
    if (capa && capa.sobre) pintarMatriz(ctx, capa.linhas, { P: '#9b5cff' }, capa.x, capa.y);
    var final = contornar(base, CONTORNO);
    var res = { canvas: final, w: final.width, h: final.height };
    cache[chave] = res;
    return res;
  };

  // Mariana montada: composição unicórnio + cavaleira (+ o pedaço do unicórnio que fica na frente dela)
  PA.montada = function (def, estagio, quadro, ap, opcoes) {
    opcoes = opcoes || {};
    var vista = opcoes.vista || 'lado';
    var chave = ['mont', def.id, estagio, quadro % 3, ap.pele, ap.cabelo, ap.roupa, ap.laco,
      (opcoes.enfeites || []).join('+'), opcoes.capa ? 1 : 0, opcoes.asasFada ? 1 : 0, vista].join('|');
    if (cache[chave]) return cache[chave];
    var uni = PA.unicornio(def, estagio, quadro, opcoes);
    var cav = PA.mariana(ap, true, 0, { capa: opcoes.capa, vista: vista });
    var px = uni.cavaleira[0], py = uni.cavaleira[1];
    // o canvas cresce para caber a cavaleira; o centro dos pés continua no meio do unicórnio
    var esq = Math.max(0, -px), dir = Math.max(0, px + cav.w - uni.w);
    // (pelo menos 8px livres em cima, como sempre foi: a logo e o estábulo contam com isso)
    var margem = Math.max(esq, dir), topo = Math.max(8, -py);
    var c = novoCanvas(uni.w + margem * 2, uni.h + topo);
    var ctx = c.getContext('2d');
    ctx.drawImage(uni.canvas, margem, topo);
    ctx.drawImage(cav.canvas, margem + px, topo + py);
    if (uni.naFrente) pintarNaFrente(ctx, uni, cav, margem, topo, px, py);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };

  // redesenha a cabeça do unicórnio por cima da cavaleira, com contorno só onde encosta nela
  function pintarNaFrente(ctx, uni, cav, margem, topo, px, py) {
    var r = uni.naFrente, bw = uni.base.width, bh = uni.base.height;
    var larg = r[2] - r[0] + 1, alt = r[3] - r[1] + 1;
    var cab = novoCanvas(bw, bh);
    cab.getContext('2d').drawImage(uni.base, r[0], r[1], larg, alt, r[0], r[1], larg, alt);
    // enfeites que ficam por cima da cavaleira mesmo fora do retângulo (o brinco de lua na diagonal)
    (uni.enfeitesNaFrente || []).forEach(function (e) { pintarMatriz(cab.getContext('2d'), e.linhas, e.paleta, e.x, e.y); });
    var dc = cab.getContext('2d').getImageData(0, 0, bw, bh).data;
    var dv = cav.alfa || (cav.alfa = cav.canvas.getContext('2d').getImageData(0, 0, cav.w, cav.h).data);
    var ox = margem + 1, oy = topo + 1; // o molde começa 1px para dentro por causa do contorno
    function cheio(x, y) { return x >= 0 && y >= 0 && x < bw && y < bh && dc[(y * bw + x) * 4 + 3] > 0; }
    function temCavaleira(x, y) {
      var cx = x + ox - (margem + px), cy = y + oy - (topo + py);
      return cx >= 0 && cy >= 0 && cx < cav.w && cy < cav.h && dv[(cy * cav.w + cx) * 4 + 3] > 0;
    }
    ctx.fillStyle = CONTORNO;
    for (var y = -1; y <= bh; y++) for (var x = -1; x <= bw; x++) {
      if (cheio(x, y) || !temCavaleira(x, y)) continue;
      if (cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1)) ctx.fillRect(x + ox, y + oy, 1, 1);
    }
    ctx.drawImage(cab, ox, oy);
  }

  /* ---------- CLAUDE (mascote original) ---------- */
  var CLAUDE = [
    '.......s........',
    '......sss.......',
    '.......a........',
    '.......a........',
    '.....cccccc.....',
    '...cccccccccc...',
    '..ccyyyyyyyycc..',
    '..ccleyyyylecc..',
    '..cceeyyyyeecc..',
    '..cryyyyyyyyrc..',
    '..ccymyyyymycc..',
    '..kkyymmmmyykk..',
    '.kkknnkkkkkkkkk.',
    '...dnnyyyyydd...',
    '....dddddddd....',
    '....dd....dd....',
  ];
  var CLAUDE_PISCA = CLAUDE.slice();
  CLAUDE_PISCA[7] = '..cceeyyyyeecc..';
  CLAUDE_PISCA[8] = '..ccyyyyyyyycc..';
  var PAL_CLAUDE = { c: '#f28c5e', d: '#d4684a', y: '#ffe6cc', e: '#2a1838', l: '#ffffff', r: '#ff9cc6', m: '#8a3b3b', a: '#6b4b7a', s: '#ffd34d', k: '#c9a6ff', n: '#7a52c4' };

  PA.claude = function (quadro) {
    var chave = 'claude|' + quadro;
    if (cache[chave]) return cache[chave];
    var linhas = quadro === 1 ? CLAUDE_PISCA : CLAUDE;
    var c = contornar(matriz(linhas, PAL_CLAUDE), CONTORNO);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };

  /* ---------- OVO ---------- */
  var OVO = [
    '....aaaa....',
    '...aaaaaa...',
    '..aawaaaaa..',
    '..awaaabaa..',
    '.aawaabbaaa.',
    '.aaaaabaaaa.',
    '.abaaaaaaba.',
    '.abbaaaaaaa.',
    '.aaaaaaabaa.',
    '.aaabaaabba.',
    '..aabbaaaa..',
    '..aaaaaaaa..',
    '...aaaaaa...',
    '....aaaa....',
  ];
  var RACHADURAS = [
    [],
    [[6, 3], [5, 4], [6, 5], [7, 6]],
    [[6, 3], [5, 4], [6, 5], [7, 6], [3, 7], [4, 8], [5, 8], [8, 7], [9, 8]],
    [[6, 3], [5, 4], [6, 5], [7, 6], [3, 7], [4, 8], [5, 8], [8, 7], [9, 8], [2, 10], [3, 10], [6, 9], [7, 10], [9, 10]],
  ];
  PA.CORES_RARIDADE = {
    comum: { base: '#fff4fa', mancha: '#ffb3d9', borda: '#ff9cc6', nome: 'Comum' },
    raro: { base: '#e3f3ff', mancha: '#5fb4ff', borda: '#4a9dff', nome: 'Raro' },
    epico: { base: '#efe4ff', mancha: '#a66bff', borda: '#8a4dff', nome: 'Épico' },
    lendario: { base: '#fff4cc', mancha: '#ffb020', borda: '#f5a300', nome: 'Lendário' },
  };
  PA.ovo = function (raridade, rachaduras) {
    var chave = 'ovo|' + raridade + '|' + rachaduras;
    if (cache[chave]) return cache[chave];
    var cr = PA.CORES_RARIDADE[raridade] || PA.CORES_RARIDADE.comum;
    var base = matriz(OVO, { a: cr.base, b: cr.mancha, w: '#ffffff' });
    var ctx = base.getContext('2d');
    if (raridade === 'lendario') {
      var arco = ['#ff6b8a', '#ffb020', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
      for (var i = 0; i < 6; i++) { ctx.fillStyle = arco[i]; ctx.fillRect(3 + i, 11, 1, 1); }
    }
    ctx.fillStyle = CONTORNO;
    (RACHADURAS[rachaduras] || []).forEach(function (p) { ctx.fillRect(p[0], p[1], 1, 1); });
    var c = contornar(base, CONTORNO);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };

  /* ---------- ícones (desenhos 16x16 de js/icones.js, já com contorno) ---------- */
  function iconeDesenhado(chave) {
    var ic = window.ICONES && window.ICONES[chave];
    if (!ic) return null;
    if (!cache['icone|' + chave]) cache['icone|' + chave] = matriz(ic.d, ic.p);
    return cache['icone|' + chave];
  }
  PA.iconeMenu = function (id) { return iconeDesenhado('menu:' + id); };
  PA.iconeDesenho = iconeDesenhado;   // qualquer chave de js/icones.js (ex.: 'doc:rg', 'acessorio:pena-magica')

  /* ---------- utilidades para a interface (DOM) ---------- */
  // devolve um <canvas> ampliado com pixels nítidos para usar em cartões
  PA.paraDOM = function (spr, escala, classe) {
    var src = spr.canvas || spr;
    var c = novoCanvas(src.width, src.height);
    c.getContext('2d').drawImage(src, 0, 0);
    c.className = 'pixel ' + (classe || '');
    c.style.width = (src.width * escala) + 'px';
    c.style.height = (src.height * escala) + 'px';
    return c;
  };
  PA.silhueta = function (spr) {
    var src = spr.canvas || spr;
    var c = novoCanvas(src.width, src.height);
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#b9a8cc';
    ctx.fillRect(0, 0, c.width, c.height);
    return c;
  };

  /* Um emoji vira pixel art: desenho próprio; se ainda não houver, o glifo reduzido a uma grade. */
  var cacheIcone = {};
  function desenharEmojiPixel(emoji) {
    var N = 64, G = 16;
    var c = novoCanvas(N, N);
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, N, N);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '54px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.fillText(emoji, N / 2, N / 2 + 2);
    var dados = ctx.getImageData(0, 0, N, N).data;
    var out = novoCanvas(G, G);
    var o = out.getContext('2d');
    var passo = N / G;
    var algum = false;
    for (var y = 0; y < G; y++) {
      for (var x = 0; x < G; x++) {
        var r = 0, g = 0, b = 0, n = 0;
        for (var yy = 1; yy < passo; yy += 2) {
          for (var xx = 1; xx < passo; xx += 2) {
            var i = (((y * passo + yy) | 0) * N + ((x * passo + xx) | 0)) * 4;
            if (dados[i + 3] > 50) { r += dados[i]; g += dados[i + 1]; b += dados[i + 2]; n++; }
          }
        }
        if (n < 2) continue;
        algum = true;
        r = Math.round(r / n / 48) * 48;
        g = Math.round(g / n / 48) * 48;
        b = Math.round(b / n / 48) * 48;
        o.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        o.fillRect(x, y, 1, 1);
      }
    }
    if (!algum) return null;
    return contornar(out, CONTORNO);
  }
  PA.iconeEmoji = function (emoji, escala) {
    var chave = emoji.replace(/\uFE0F/g, '');
    var base = iconeDesenhado(chave) || cacheIcone[chave];
    if (!base) {
      base = desenharEmojiPixel(emoji);
      if (!base) {
        var vazio = novoCanvas(12, 12);
        var vx = vazio.getContext('2d');
        vx.fillStyle = '#7c5cff';
        vx.fillRect(1, 1, 10, 10);
        vx.fillStyle = '#fff8ee';
        vx.fillRect(4, 3, 4, 6);
        base = contornar(vazio, CONTORNO);
      } else cacheIcone[chave] = base;
    }
    // mesmo tamanho na tela para qualquer grade: 18px de base vezes a escala
    return PA.paraDOM(base, PA.escalaNitida((escala || 2) * 18, base.width), 'icone-px');
  };

  /* Escala que vira um número inteiro de pixels da tela por pixel do desenho:
     assim nenhum pixel sai mais largo que o vizinho. */
  PA.escalaNitida = function (px, grade) {
    var dpr = window.devicePixelRatio || 1;
    return Math.max(1, Math.round(px * dpr / grade)) / dpr;
  };

  /* Ícone dentro de um texto: pelo menos 24px no meio de uma frase e 36px sozinho,
     crescendo com a fonte onde ela é grande (1.5em / 1.25em, como um emoji).
     Já na página, vira o tamanho nítido mais próximo. */
  PA.iconeTexto = function (emoji, sozinho) {
    var c = PA.iconeEmoji(emoji, 2);
    c.classList.add('icone-em');
    c.setAttribute('data-em', sozinho ? '1.25' : '1.5');
    c.setAttribute('data-min', sozinho ? '36' : '24');
    c.style.width = c.style.height = 'max(' + c.getAttribute('data-min') + 'px, ' + c.getAttribute('data-em') + 'em)';
    return c;
  };
  function ajustarIcone(c) {
    var fonte = parseFloat(getComputedStyle(c).fontSize);
    if (!fonte) return;
    var alvo = Math.max(parseFloat(c.getAttribute('data-min')), fonte * parseFloat(c.getAttribute('data-em')));
    var t = c.width * PA.escalaNitida(alvo, c.width);
    c.style.width = t + 'px';
    c.style.height = (c.height * t / c.width) + 'px';
  }
  function ajustarDentro(no) {
    if (no.nodeType !== 1) return;
    if (no.classList.contains('icone-em')) ajustarIcone(no);
    else if (no.firstElementChild) Array.prototype.forEach.call(no.querySelectorAll('canvas.icone-em'), ajustarIcone);
  }
  if (window.MutationObserver) {
    new MutationObserver(function (mudancas) {
      mudancas.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, ajustarDentro); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  // zoom do navegador muda o devicePixelRatio
  window.addEventListener('resize', function () { ajustarDentro(document.body); });

  window.PA = PA;
})();
