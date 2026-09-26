/* dados: moldes do unicórnio em pixel art (adulto 26x21 e filhote 18x16, nas 5 vistas):
   corpo, pernas, asas, âncoras dos enfeites, desenhos próprios de enfeites por vista, brilhos,
   onde a cavaleira senta; e ENFEITES (PA.ENFEITES_MONTARIA), o desenho de cada enfeite.
   Guarda os moldes em PA._interno.UNI (quem desenha é pixelart-unicornio.js). Sem DOM. */
(function () {
  var PA = window.PA, I = PA._interno;

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
  var CHAPEU_CHEF = ['.wl.wwl.', 'wwlLwwwL', 'lwwwwwlL', 'roygtbpm', 'ROYGTBPM'];
  // de frente e de costas o chifre atravessa a touca pelo meio (o buraco deixa o chifre aparecer)
  var CHAPEU_CHEF_FRENTE = ['.wl..wl.', 'lwL..wlL', 'lwwLLwlL', 'roygtbpm', 'ROYGTBPM'];
  var CACHECOL_PINGUIM = ['BcBcBcBcB', 'DBDBDBDBD', '....cBc..', '....BDB..', '...kdddk.', '...dwdwd.', '...dwowd.', '....kkk..'];
  // filhote: a pontinha é mais curta (o pinguim logo abaixo da volta); de costas e 3/4 de costas só a volta
  var CACHECOL_PINGUIM_FILHOTE = ['BcBcBcBcB', 'DBDBDcDBD', '...kdddk.', '...dwdwd.', '...dwowd.', '....kkk..'];
  var CACHECOL_COSTAS = ['BcBcBcBcB', 'DBDBDBDBD'];
  var LACINHO_MORANGO = ['rR.g.Rr', 'RyRGRyR', 'RRdGdRR', 'yRd.dRy', 'dd...dd'];
  var COLAR_PLANETAS = ['ykkykkykky', 'krRkbBkoOk', 'kRRkBBkOOk', '.kk.kk.kk.'];
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
    enfeites: { 'anel-saturno': { linhas: ['.AA..AA.', 'AAWWWWAA'], x: 18, y: 1 },
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
    enfeites: { 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 5, y: 1 }, oculos: { linhas: OCULOS_FRENTE, x: 4, y: 6 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 4, y: 6 } },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 5, y: 9 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 5, y: 1 }, 'gravata-borboleta': { linhas: ['RRRRR'], x: 5, y: 10 },
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
    enfeites: { 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF, x: 9, y: 1 }, oculos: { linhas: OCULOS_FRENTE, x: 11, y: 6 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 11, y: 6 },
      'anel-saturno': { linhas: ['.AA..AA.', 'AAWWWWAA', '.kk.....'], x: 14, y: 1 },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 11, y: 8 }, 'gravata-borboleta': { linhas: ['RRRR'], x: 11, y: 9 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 12, y: 9 },
      // o anel 1 px mais estreito na frente, para caber na borda direita
      'anel-saturno': { linhas: ['..AA..AA', '.AAWWWAA'], x: 14, y: 1 } },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_PINGUIM_FILHOTE, x: 6, y: 9 }, 'anel-saturno': { linhas: ['A...A', '.AaA.'], x: 10, y: 2 },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_PINGUIM_FILHOTE, x: 4, y: 10 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 4, y: 1 }, oculos: { linhas: OCULOS_FRENTE, x: 3, y: 5 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 3, y: 5 },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 4, y: 8 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 4, y: 1 }, 'gravata-borboleta': { linhas: ['RRRRR'], x: 5, y: 9 },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_PINGUIM_FILHOTE, x: 8, y: 10 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF, x: 4, y: 1 }, oculos: { linhas: ['R.R..R.R', 'RRRRRRRR', '.R....R.'], x: 7, y: 5 },
      'oculos-estrela': { linhas: ['kYk..kYk', 'YOYkkYOY', 'YkY..YkY'], x: 7, y: 5 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 10, y: 2, bebe: ANEL_BEBE_DIAG },
      'brinco-lua': { linhas: BRINCO_LUA, x: 3, y: 3 },
      // o rastro do cometa mais curto (sem as 2 linhas de cima) para não encostar no olho esquerdo;
      // a cabeça fica no mesmo lugar
      'cometa-cauda': { linhas: COMETA_CAUDA.slice(2), x: 0, y: 8 },
      // colar 1 px para a esquerda, para o planeta laranja e o elo da ponta caberem na borda
      'colar-planetas': { linhas: COLAR_PLANETAS, x: 6, y: 10 } },
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 6, y: 7 }, 'gravata-borboleta': { linhas: ['RRRR'], x: 8, y: 8 },
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
    // acessórios das provas bimestrais (js/conteudo/provas/*.js)
    // (com contorno próprio 'k' para não sumir no meio da crina colorida)
    'tiara-arco-iris': { linhas: ['..kpk..', 'kykpkyk', 'kyyyyyk', 'kroGbvk'], paleta: { k: '#3a2446', y: '#ffd34d', p: '#ff7eb6', r: '#ff6b8a', o: '#ffb020', G: '#6fdc8c', b: '#5fb4ff', v: '#a66bff' }, ancora: 'cabeca', dx: -5, dy: -2 },
    'pena-magica': { linhas: ['kk...', 'kbk..', 'klbk.', '.klbk', '..kbk', '...ky'], paleta: { k: '#3a2446', b: '#4a9dff', l: '#e6f3ff', y: '#ffd34d' }, ancora: 'orelha', dx: -4, dy: 0 },
    'laco-vovo': { linhas: ['kk...kk', 'kLk.kLk', 'kLwDwLk', 'kLkDkLk', 'kk...kk'], paleta: { k: '#3a2446', L: '#b58cff', w: '#ffffff', D: '#7c5cff' }, ancora: 'orelha', dx: -4, dy: 1 },
    'coroa-big-ben': { linhas: ['...k...', '..kbk..', '.kwhwk.', 'kykkkyk', 'kyyryyk', 'kkkkkkk'], paleta: { k: '#3a2446', y: '#ffd34d', b: '#4a6cd4', w: '#ffffff', h: '#ff5c8a', r: '#5fb4ff' }, ancora: 'cabeca', dx: -3, dy: -5 },
    'oculos-de-sol': { linhas: ['pppppppp', 'pkkppkkp', 'pkgppkgp', '.pp..pp.'], paleta: { k: '#3a2446', p: '#ff7eb6', g: '#6a5a8a' }, ancora: 'olho', dx: -4, dy: -1 },
    'lacinho-estrela': { linhas: ['kk...kk', 'kbk.kbk', 'kbkykbk', 'kbyyybk', 'kbkykbk', 'kk...kk'], paleta: { k: '#3a2446', b: '#4a9dff', y: '#ffe066' }, ancora: 'orelha', dx: -4, dy: 1 },
    // enfeites da Loja das Fadas (js/conteudo/loja-itens.js), com os encaixes novos: chifre, pescoço e cauda
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
    'colar-planetas': { linhas: COLAR_PLANETAS, paleta: { k: '#3a2446', y: '#ffd34d', R: '#ff6b8a', r: '#ffc2d0', B: '#5fb4ff', b: '#cfe9ff', O: '#ffb020', o: '#ffe6a0' }, ancora: 'pescoco', dx: -5, dy: -1 },
    'brinco-lua': { linhas: BRINCO_LUA, paleta: { k: '#3a2446', Y: '#ffc21a' }, ancora: 'orelha', dx: -2, dy: 1 },
    'oculos-estrela': { linhas: ['kYk', 'YOY', 'YkY'], paleta: { k: '#3a2446', Y: '#f5a300', O: '#ffe066' }, ancora: 'olho', dx: -1, dy: -1 },
    'coroa-flores': { linhas: ['kPk.kBk', 'PYPkBYB', 'GGGGGGG', 'kkkkkkk'], paleta: { k: '#3a2446', P: '#ff7eb6', B: '#b58cff', Y: '#ffe066', G: '#6fdc8c' }, ancora: 'cabeca', dx: -3, dy: -2 },
    // tiara: a faixa em azul-noite claro (antes quase branca, sumia na cabeça) segura as duas estrelas
    'tiara-estrelas': { linhas: ['.Y...Y.', 'YWY.YWY', 'kSkSkSk'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#fffbe0', S: '#8f9cff' }, ancora: 'cabeca', dx: -3, dy: -2 },
    // adulto: anel lilás largo atravessando o meio do chifre, visto um pouco de cima: o arco de trás
    // (lilás forte) some atrás do chifre e o da frente (miolo branco, que não se confunde com uma roupa
    // lilás quando ela está montada de frente) passa por cima dele; o filhote usa o lilás claro 'a'
    // (e um risquinho de contorno embaixo dele onde encosta na crina, para não se misturar com ela)
    'anel-saturno': { linhas: ['.AA..AA.', 'AAWWWWAA', '..k..k..'], paleta: { k: '#3a2446', A: '#9a6cf5', a: '#d9c2ff', W: '#ffffff' }, ancora: 'chifre', dx: -3, dy: 0 },
    // prêmios da prova de Português (js/conteudo/provas/portugues-3bim.js)
    // touca de chef branca e fofa (dois gomos, dobras e lado da sombra em lilás L) com faixa de arco-íris
    // de 2 px (a de baixo mais escura): assim a touca não se confunde com a cabeça de um unicórnio branco
    'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF, paleta: { k: '#3a2446', w: '#ffffff', l: '#d9cff0', L: '#a58fd6', r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d', g: '#5fd07a', t: '#4fd6c8', b: '#5fb4ff', p: '#b07cff', m: '#ff7eb6', R: '#e03a55', O: '#f08a1c', Y: '#f2c21c', G: '#3cb45e', T: '#26b8aa', B: '#3f8fe8', P: '#8e5ae8', M: '#e85a9a' }, ancora: 'cabeca', dx: -6, dy: -2 },
    // cachecol listrado azul e gelo, com a ponta caída e uma carinha de pinguim no pompom
    'cachecol-pinguim': { linhas: CACHECOL_PINGUIM, paleta: { k: '#3a2446', B: '#3d8ee8', c: '#bfe4ff', D: '#2a62b8', d: '#2c2f4a', w: '#ffffff', o: '#ffa020' }, ancora: 'pescoco', dx: -4, dy: -1 },
    // lacinho vermelho de morango com sementinhas e o nó de folhinha verde
    'lacinho-morango': { linhas: LACINHO_MORANGO, paleta: { k: '#3a2446', r: '#ff8a96', R: '#ee3b50', d: '#b3203a', y: '#ffe98a', G: '#3fae4f', g: '#8fe07a' }, ancora: 'orelha', dx: -4, dy: 1 },
  };
  PA.ENFEITES_MONTARIA = ENFEITES;
  I.UNI = UNI;
})();
