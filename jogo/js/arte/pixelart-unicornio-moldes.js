/* dados: moldes do unicórnio em pixel art (adulto até 26x21 e filhote até 18x16, nas 5 vistas):
   corpo, pernas, asas, âncoras dos enfeites, desenhos próprios de enfeites por vista, brilhos,
   onde a cavaleira senta (e que enfeites ficam por cima dela); e ENFEITES (PA.ENFEITES_MONTARIA), o desenho de cada enfeite.
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
  // cachecol listrado (Loja): nas vistas em que o de pinguim tem desenho próprio, vai no mesmo lugar (de costas, só a volta)
  var CACHECOL_LISTRADO = ['PVPVPVPVP', 'VPVPVPVPV', '....PV...', '....VP...'];
  var LACINHO_MORANGO = ['rR.g.Rr', 'RyRGRyR', 'RRdGdRR', 'yRd.dRy', 'dd...dd'];
  var COLAR_PLANETAS = ['ykkykkykky', 'krRkbBkoOk', 'kRRkBBkOOk', '.kk.kk.kk.'];
  var COMETA_CAUDA_TRAS = ['kk....', 'kck...', 'kCck..', '.kCWk.', '.kWWWk', '.kYWYk', '..kkk.'];

  // Adulto / jovem (26 x 21)
  // capacete de astronauta (bolha de frente; de lado a viseira fica virada para a cara)
  var CAPACETE_ASTRONAUTA = ['....kRk....', '.....k.....', '..kkkkkkk..', '.kWCCCCCwk.', 'kWCcCCCCBwk', 'GWCCCCCBBwG', 'kgggggggggk', '.kkkkkkkkk.'];
  var CAPACETE_ASTRONAUTA_LADO = ['....kRk....', '.....k.....', '..kkkkkkk..', '.kWWWCCCCk.', 'kWWWCcCCCBk', 'GWWwCCCCBBk', 'kgggggggggk', '.kkkkkkkkk.'];
  var CAPACETE_ASTRONAUTA_COSTAS = ['....kRk....', '.....k.....', '..kkkkkkk..', '.kWWWWWWwk.', 'kWWWWWWWwwk', 'GWWWWWWwwwG', 'kgggggggggk', '.kkkkkkkkk.'];
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
      // 3º quadro: as pernas de fora voltam para junto das de dentro (o outro tempo do passo)
      ['..rm..bb.ss....ss.bb......',
       '...n...bbss....ssbb.......',
       '.......bbss....ssbb.......',
       '.......ffff....ffff.......'],
    ],
    asas: [{ linhas: ASA_ADULTO, x: 2, y: 4, atras: true, escura: true }, { linhas: ASA_ADULTO, x: 3, y: 5 }],
    ancoras: { orelha: [15, 1], olho: [19, 6], cabeca: [17, 3],
      pescoco: [16, 11], cauda: [2, 13], chifre: [21, 1] },
    // de lado o chifre é inclinado: o anel não leva o risquinho (embaixo dele só há o próprio chifre)
    enfeites: { 'anel-saturno': { linhas: ['.AA..AA.', 'AAWWWWAA'], x: 18, y: 1 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_LADO, x: 12, y: 1 },
      'cometa-cauda': { linhas: COMETA_CAUDA_TRAS, x: 0, y: 8 } },
    brilhos: [[12, 6], [11, 9], [2, 13], [13, 4]],
    // só o Adulto (estágio 3): a crina e a cauda 1 linha mais longas ([x, y, letra] por cima do molde)
    crinaAdulto: [[11, 13, 'm'], [12, 13, 'n'], [3, 19, 'r']],
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
    enfeites: { 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 5, y: 1 }, oculos: { linhas: OCULOS_FRENTE, x: 4, y: 6 }, 'oculos-estrela': { linhas: OCULOS_ESTRELA_FRENTE, x: 4, y: 6 },
      // o anel 1 px mais alto, perto da ponta do chifre e sem o risquinho de baixo: com a coroa (encaixe da cabeça,
      // logo embaixo) as pontas dela ficam à vista
      'anel-saturno': { linhas: ['.AA..AA.', 'AAWWWWAA'], x: 5, y: 0 } },
    brilhos: [[0, 7], [1, 10], [7, 4]],
    // montada: ela senta no alto da cabeça, com as pernas dos dois lados da crina; na frente dela só a cara do
    // unicórnio (dos olhos para baixo): o chifre e os enfeites da cabeça ficam atrás do tronco dela
    // só o Adulto (estágio 3): a crina e a cauda 1 linha mais longas ([x, y, letra] por cima do molde)
    crinaAdulto: [[2, 13, 'r']],
    cavaleira: [3, -7],
    naFrente: [0, 7, 17, 12],
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
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 5, y: 9 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_COSTAS, x: 3, y: 1 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 5, y: 1 }, 'gravata-borboleta': { linhas: ['RRRRR'], x: 5, y: 10 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 6, y: 10 } },
    brilhos: [[10, 6], [11, 9], [8, 15]],
    // só o Adulto (estágio 3): a crina e a cauda 1 linha mais longas ([x, y, letra] por cima do molde)
    crinaAdulto: [[8, 20, 'n']],
    cavaleira: [3, 6],
    // montada, a cauda fica entre ela e quem olha: o enfeite dela vai por cima da cavaleira
    enfeitesNaFrente: ['cauda'],
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
      ['......bb.ss...bb.ss...',
       '.......bbss....bbss...',
       '.......ffff....bbss...',
       '...............ffff...'],
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
    // só o Adulto (estágio 3): a crina e a cauda 1 linha mais longas ([x, y, letra] por cima do molde)
    crinaAdulto: [[2, 16, 'n']],
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
      ['.rnm.bb.ss...bb.ss....',
       '..rn..bbss....bbss....',
       '..r...bbss....ffff....',
       '......ffff............'],
    ],
    asas: [{ linhas: ASA_ADULTO, x: 5, y: 4, atras: true, escura: true }, { linhas: ASA_ADULTO, x: 6, y: 5 }],
    ancoras: { orelha: [13, 2], olho: null, cabeca: [16, 4],
      pescoco: [15, 9], cauda: [2, 14], chifre: [18, 1] },
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 11, y: 8 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_COSTAS, x: 11, y: 2 }, 'gravata-borboleta': { linhas: ['RRRR'], x: 11, y: 9 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 12, y: 9 },
      // o anel 1 px mais estreito na frente, para caber na borda direita
      'anel-saturno': { linhas: ['..AA..AA', '.AAWWWAA'], x: 14, y: 1 } },
    brilhos: [[10, 7], [9, 10], [1, 14]],
    // só o Adulto (estágio 3): a crina e a cauda 1 linha mais longas ([x, y, letra] por cima do molde)
    crinaAdulto: [[2, 20, 'n']],
    cavaleira: [5, 1],
    // montada: enfeites da cabeça e da cauda por cima da cavaleira (a cabeça dela tampava a orelha)
    enfeitesNaFrente: ['orelha', 'cabeca', 'chifre', 'cauda'],
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
      ['.....bbs.sbb......',
       '.....bbs.sbb......',
       '.....fff.fff......'],
    ],
    asas: [{ linhas: ASA_FILHOTE, x: 1, y: 3, atras: true, escura: true }, { linhas: ASA_FILHOTE, x: 2, y: 4 }],
    ancoras: { orelha: [8, 0], olho: [11, 5], cabeca: [10, 2],
      pescoco: [10, 10], cauda: [1, 9], chifre: [12, 1] },
    // filhote: o anel de Saturno é um aro pequeno em volta da base do chifrinho, visto um pouco de
    // cima (pontas ao lado do chifre, arco da frente embaixo): no bebê o toquinho aparece dentro dele
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_PINGUIM_FILHOTE, x: 6, y: 9 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_LADO, x: 5, y: 0 }, 'anel-saturno': { linhas: ['A...A', '.AaA.'], x: 10, y: 2 },
      // enfeites de cauda 1 px para dentro (cauda + dx −1), para não cortar na borda esquerda
      'fitinha-cauda': { linhas: FITINHA_CAUDA, x: 0, y: 8 },
      'pompom-cauda': { linhas: POMPOM_CAUDA, x: 0, y: 7 },
      'cometa-cauda': { linhas: COMETA_CAUDA, x: 0, y: 5 },
      // de lado o filhote mostra só dois planetas, no peito (os três viravam um cinto na barriga)
      'colar-planetas': { linhas: ['ykkykky', 'krRkbBk', 'kRRkBBk', '.kk.kk.'], x: 7, y: 9 },
      // laço 1 px mais alto e sem as pontinhas: montada, fica 1 px de cabelo entre ele e o rosto dela
      laco: { linhas: ['PP.PP', 'PPYPP'], x: 5, y: 0 } },
    brilhos: [[5, 5], [1, 9], [6, 3]],
    // montada: ela senta 1 px mais para trás e 1 mais baixo, no dorso; os enfeites da orelha, da cabeça, do
    // chifre e da cauda vão por cima dela (a cabeça dela tampava a orelha do filhote),
    cavaleira: [0, 0],
    enfeitesNaFrente: ['orelha', 'cabeca', 'chifre', 'cauda'],
    // e a ponta da cauda também (as costas dela a tampavam): [x0, y0, x1, y1] do corpo repintado por cima
    pedacosNaFrente: [[0, 8, 2, 11]],
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
    // montada: como no adulto (pernas dos dois lados da crina, chifre e enfeites atrás do tronco dela)
    cavaleira: [2, -8],
    naFrente: [0, 6, 15, 10],
  };
  // de costas o filhote é mais largo (18) que de frente: a cabeça e a garupa aparecem dos dois lados da Mariana montada
  UNI.filhote.costas = {
    corpo: [
      '........h.........',
      '........hg........',
      '..b.....hg.....b..',
      '..bb...mhgm...bb..',
      '..bbbbbbmnbbbbbb..',
      '..bbbbbbbmnrbbbb..',
      '..bbbbbbbbmnrbbb..',
      '...bbbbbbbmnrbb...',
      '...bbbbbbbbmnrb...',
      '..bbbbbbbbbbmnrb..',
      '.bbbbbbbbbbbbmnbb.',
      '.bbbbbbbmmbbbbbbb.',
      '.bsssssmnnmssssss.',
    ],
    pernas: [
      ['...bb...rn...bb...',
       '...bb...nr...bb...',
       '...ff........ff...'],
      ['...bb...rn...bb...',
       '...ff...nr...bb...',
       '.............ff...'],
      ['...bb...rn...bb...',
       '...bb...nr...ff...',
       '...ff.............'],
    ],
    asas: [
      { linhas: ['WW...', '.WWWW', '..XWW'], x: 3, y: 8 },
      { linhas: ['...WW', 'WWWW.', 'WWX..'], x: 10, y: 8 },
    ],
    ancoras: { orelha: [15, 2], olho: null, cabeca: [8, 3],
      pescoco: [9, 9], cauda: [8, 12], chifre: [8, 1] },
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 5, y: 8 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_COSTAS, x: 3, y: 1 }, 'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF_FRENTE, x: 5, y: 1 }, 'gravata-borboleta': { linhas: ['RRRRR'], x: 6, y: 9 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 6, y: 9 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 6, y: 2, bebe: { linhas: ANEL_BEBE_FRENTE.linhas, x: 6, y: 3 } } },
    brilhos: [[11, 6], [12, 8]],
    cavaleira: [3, 3],
    enfeitesNaFrente: ['cauda'],
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
      ['.....bbs...bbs..',
       '.....fff...bbs..',
       '...........fff..'],
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
    // ela senta 2 px mais baixa que antes: montada fica com 22 px de altura (arte.md §12: 19–22)
    cavaleira: [2, -4],
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
      ['.....bbs...bbs..',
       '.....bbs...fff..',
       '.....fff........'],
    ],
    asas: [{ linhas: ASA_FILHOTE, x: 3, y: 5, atras: true, escura: true }, { linhas: ASA_FILHOTE, x: 4, y: 6 }],
    ancoras: { orelha: [9, 2], olho: null, cabeca: [12, 3],
      pescoco: [10, 8], cauda: [2, 10], chifre: [12, 1] },
    enfeites: { 'cachecol-pinguim': { linhas: CACHECOL_COSTAS, x: 6, y: 7 }, 'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA_COSTAS, x: 7, y: 1 }, 'gravata-borboleta': { linhas: ['RRRR'], x: 8, y: 8 },
      'colar-perolas': { linhas: ['LcrcrcL', '.LLLLL.'], x: 7, y: 8 },
      'anel-saturno': { linhas: ['A....A', '.AaaA.'], x: 10, y: 2, bebe: ANEL_BEBE_DIAG } },
    brilhos: [[7, 5], [6, 7], [1, 10]],
    // 1 px mais alta que o chifre: montada com 19 px (arte.md §12: 19–22)
    cavaleira: [3, -1],
    enfeitesNaFrente: ['orelha', 'cabeca', 'chifre', 'cauda'],
  };

  /* Pose cansada (fome ou sede baixa; quem desenha é pixelart-unicornio.js): cabeca = [x0, y0, x1, y1] que desce
     1 px; orelhas = [x, y, letra] do molde parado (a ponta que some, '.', e onde a orelha cai); cavaleira: de frente
     ela senta na cabeça e desce junto. */
  var CANSADO = {
    adulto: {
      lado: { cabeca: [10, 0, 25, 10], orelhas: [[16, 2, '.']] },
      frente: { cabeca: [0, 0, 17, 12], orelhas: [[3, 2, '.'], [14, 2, '.'], [2, 3, 'b'], [15, 3, 'b']], cavaleira: true },
      costas: { cabeca: [3, 0, 14, 4], orelhas: [[3, 2, '.'], [14, 2, '.'], [2, 3, 'b'], [15, 3, 'b']] },
      diagFrente: { cabeca: [11, 0, 21, 11], orelhas: [[11, 2, '.'], [20, 2, '.'], [21, 3, 'b']] },
      diagCostas: { cabeca: [11, 0, 21, 7], orelhas: [[13, 2, '.'], [20, 3, '.'], [21, 4, 'b']] },
    },
    filhote: {
      lado: { cabeca: [8, 0, 17, 8], orelhas: [[9, 1, '.'], [8, 2, 'b']] },
      frente: { cabeca: [0, 0, 15, 10], orelhas: [[3, 2, '.'], [12, 2, '.'], [2, 3, 'b'], [13, 3, 'b']], cavaleira: true },
      costas: { cabeca: [2, 0, 15, 4], orelhas: [[2, 2, '.'], [15, 2, '.'], [1, 3, 'b'], [16, 3, 'b']] },
      diagFrente: { cabeca: [7, 0, 15, 10], orelhas: [[7, 2, '.'], [15, 2, '.']] },
      diagCostas: { cabeca: [9, 0, 15, 6], orelhas: [[9, 2, '.']] },
    },
  };
  Object.keys(CANSADO).forEach(function (est) {
    Object.keys(CANSADO[est]).forEach(function (vista) { UNI[est][vista].cansado = CANSADO[est][vista]; });
  });

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
    // segunda leva da Loja das Fadas (50): pequenos (até 9 px de largura e 6 de altura);
    // óculos: a lente de lado (3×3 no olho); de frente e 3/4 de frente, duas lentes e a ponte (OCULOS2, abaixo)
    'tulipa-orelha': { linhas: ['R.r.R', 'RRrRR', 'kRRRk', '.kGk.'], paleta: { k: '#3a2446', R: '#ff4f6d', r: '#ff9cb0', G: '#3fae4f' }, ancora: 'orelha', dx: -2, dy: 0 },
    'morango-orelha': { linhas: ['.gGg.', 'kRRRk', 'kRyRk', '.kRk.'], paleta: { k: '#3a2446', g: '#8fe07a', G: '#3fae4f', R: '#ee3b50', y: '#ffe98a' }, ancora: 'orelha', dx: -2, dy: 0 },
    'abelhinha-orelha': { linhas: ['.w.w.', 'kYkYk', 'kYkYk', '.kkk.'], paleta: { k: '#3a2446', w: '#d8f4ff', Y: '#ffd34d' }, ancora: 'orelha', dx: -2, dy: 0 },
    'joaninha-orelha': { linhas: ['.kkk.', 'kWkRk', 'kRkRk', '.RkR.'], paleta: { k: '#3a2446', R: '#ff3b3b', W: '#ffffff' }, ancora: 'orelha', dx: -2, dy: 0 },
    'concha-orelha': { linhas: ['.kkk.', 'kPpPk', 'kpPpk', '.kPk.'], paleta: { k: '#3a2446', P: '#ff9cc6', p: '#ffd1e6' }, ancora: 'orelha', dx: -2, dy: 1 },
    'floco-neve-orelha': { linhas: ['C.W.C', '.CWC.', 'WWkWW', '.CWC.', 'C.W.C'], paleta: { k: '#3a2446', C: '#3d8ee8', W: '#ffffff' }, ancora: 'orelha', dx: -2, dy: 0 },
    'nota-musical-orelha': { linhas: ['..PPP', '..P.P', '..P..', 'PPP..', 'PPP..'], paleta: { P: '#6a3fd0' }, ancora: 'orelha', dx: -2, dy: 0 },
    'borboleta-orelha': { linhas: ['PPkPP', 'PYkYP', '.pkp.', 'pp.pp'], paleta: { k: '#3a2446', P: '#3d8ee8', Y: '#ffffff', p: '#ffb020' }, ancora: 'orelha', dx: -2, dy: 0 },
    'brinco-diamante': { linhas: ['.Y.', 'kCk', 'CWC', 'kCk', '.k.'], paleta: { k: '#3a2446', Y: '#ffd34d', C: '#5fd6ff', W: '#ffffff' }, ancora: 'orelha', dx: -1, dy: 1 },
    'oculos-redondos': { linhas: ['kkk', 'kCk', 'kkk'], paleta: { k: '#3a2446', C: '#cfefff' }, ancora: 'olho', dx: -1, dy: -1 },
    'oculos-flor': { linhas: ['.O.', 'OYO', '.O.'], paleta: { O: '#ff8a1c', Y: '#ffe066', G: '#3fae4f' }, ancora: 'olho', dx: -1, dy: -1 },
    'oculos-arco-iris': { linhas: ['ror', 'yWy', 'gbg'], paleta: { r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d', g: '#5fd07a', b: '#5fb4ff', W: '#e8f6ff' }, ancora: 'olho', dx: -1, dy: -1 },
    'oculos-melancia': { linhas: ['GGG', 'RkR', '.R.'], paleta: { k: '#3a2446', G: '#3fae4f', R: '#ff5a6e' }, ancora: 'olho', dx: -1, dy: -1 },
    'oculos-gatinho': { linhas: ['P.P', 'PWP', 'PPP'], paleta: { P: '#9b59d0', W: '#e8f6ff' }, ancora: 'olho', dx: -1, dy: -1 },
    'oculos-diamante': { linhas: ['.C.', 'CWC', '.C.'], paleta: { C: '#3fb4e0', W: '#ffffff', Y: '#ffd34d' }, ancora: 'olho', dx: -1, dy: -1 },
    'faixa-bolinhas': { linhas: ['PWPWPWP', 'dPdPdPd'], paleta: { P: '#ff7eb6', W: '#ffffff', d: '#c92f73' }, ancora: 'cabeca', dx: -3, dy: 0 },
    'chapeu-cogumelo': { linhas: ['.kRRRk.', 'kRWRRWk', 'ccccccc'], paleta: { k: '#3a2446', R: '#ff4f4f', W: '#ffffff', c: '#fff3dc' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'tiara-coracoes': { linhas: ['R.R.R.R', 'RRR.RRR', '.R...R.', 'YYYYYYY'], paleta: { R: '#ff4f7b', Y: '#ffd34d' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'orelhinhas-coelho': { linhas: ['kk...kk', 'kPk.kPk', 'kPk.kPk', 'kPkkkPk'], paleta: { k: '#3a2446', P: '#ff9cc6' }, ancora: 'cabeca', dx: -3, dy: -3 },
    'touca-pompom': { linhas: ['..kWk..', '.kBcBk.', 'kBcBcBk', 'WWWWWWW'], paleta: { k: '#3a2446', W: '#ffffff', B: '#3d8ee8', c: '#bfe4ff' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'chapeu-aniversario': { linhas: ['...P...', '..kBk..', '.kBYBk.', 'kYYYYYk'], paleta: { k: '#3a2446', Y: '#ffd34d', P: '#ff4f9a', B: '#3d8ee8' }, ancora: 'cabeca', dx: -3, dy: -3 },
    'arquinho-arco-iris': { linhas: ['.rrrrr.', 'rooooor', 'oy...yo'], paleta: { r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'tiara-perolas-mar': { linhas: ['..kPk..', 'LkPpPkL', 'cLcLcLc'], paleta: { k: '#3a2446', P: '#ff4f9a', p: '#ffc2e0', c: '#fff8ee', L: '#8a6fb0' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'coroa-diamantes': { linhas: ['C..C..C', 'Y.YCY.Y', 'YYYYYYY', 'YRYCYRY'], paleta: { Y: '#ffd34d', C: '#7fe3ff', R: '#ff5c8a' }, ancora: 'cabeca', dx: -3, dy: -2 },
    'estrelinha-chifre': { linhas: ['kYk', 'YWY', 'kYk'], paleta: { k: '#3a2446', Y: '#ffe14d', W: '#ffffff' }, ancora: 'chifre', dx: -1, dy: -1 },
    'lacinho-chifre': { linhas: ['PP.PP', 'PPDPP', 'P...P'], paleta: { P: '#ff4f9a', D: '#c92f73' }, ancora: 'chifre', dx: -2, dy: 1 },
    'raminho-chifre': { linhas: ['g.g', 'GgG', '.G.'], paleta: { G: '#3fae4f', g: '#8fe07a' }, ancora: 'chifre', dx: -1, dy: 1 },
    'coracao-chifre': { linhas: ['kYkYk', 'kYYYk', '.kYk.'], paleta: { k: '#3a2446', Y: '#ffc21a' }, ancora: 'chifre', dx: -2, dy: 1 },
    'anel-arco-iris-chifre': { linhas: ['.rr..bb.', 'rroyygbb', '..k..k..'], paleta: { k: '#3a2446', r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d', g: '#5fd07a', b: '#5fb4ff' }, ancora: 'chifre', dx: -3, dy: 0 },
    'sininho-chifre': { linhas: ['.k.', 'kYk', 'kYk', 'YYy', '.k.'], paleta: { k: '#3a2446', Y: '#f5a300', y: '#b87400' }, ancora: 'chifre', dx: 0, dy: 1 },
    'cristal-gelo-chifre': { linhas: ['.W.', 'CWC', 'CCC', '.C.'], paleta: { C: '#3fa0f0', W: '#bff0ff' }, ancora: 'chifre', dx: -1, dy: -1 },
    'lenco-bolinhas': { linhas: ['RWRWRWR', '.RRWRR.', '..RWR..', '...R...'], paleta: { R: '#ff4f4f', W: '#ffffff' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'colar-margaridas': { linhas: ['kWkGkWk', 'WYWkWYW', 'kWk.kWk'], paleta: { k: '#3a2446', G: '#3fae4f', W: '#ffffff', Y: '#ffc21a' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'colar-cerejas': { linhas: ['GGGGGGG', 'R.R.R.R', 'd.d.d.d'], paleta: { G: '#3fae4f', R: '#ee3b50', d: '#b3203a' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'medalhinha-ouro': { linhas: ['B.....B', '.B...B.', '..kYk..', '..YWY..', '..kYk..'], paleta: { k: '#3a2446', B: '#3d8ee8', Y: '#ffd34d', W: '#fff6c8' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'cachecol-listrado': { linhas: CACHECOL_LISTRADO, paleta: { P: '#ff7eb6', V: '#9b6cf0' }, ancora: 'pescoco', dx: -4, dy: -1 },
    'colar-conchinhas': { linhas: ['LcLcLcL', '.P.O.P.', '.p.o.p.'], paleta: { L: '#8a6fb0', c: '#fff8ee', P: '#ff7eb6', p: '#ffc2e0', O: '#ff9a3a', o: '#ffd08a' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'colar-balinhas': { linhas: ['LLLLLLL', 'PWPLBWB', '..YWY..'], paleta: { L: '#8a6fb0', P: '#ff4f9a', B: '#3fb4e0', Y: '#f2b400', W: '#ffffff' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'pingente-coracao': { linhas: ['LcLcLcL', '..B.B..', '..WBB..', '...B...'], paleta: { L: '#8a6fb0', c: '#fff8ee', B: '#3d8ee8', W: '#cfe9ff' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'colar-notas': { linhas: ['YYYYYYY', '.P...P.', 'PP..PP.'], paleta: { Y: '#ffd34d', P: '#6a3fd0' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'colar-rubis': { linhas: ['YRYRYRY', '..kYk..', '..RWR..', '..dRd..', '...d...'], paleta: { k: '#3a2446', Y: '#ffd34d', R: '#ff3b5c', d: '#b3203a', W: '#ffd1dc' }, ancora: 'pescoco', dx: -3, dy: 0 },
    'laco-xadrez-cauda': { linhas: ['RW.WR', 'WRDRW', 'RW.WR'], paleta: { R: '#e02a4a', W: '#ffffff', D: '#8c1c33' }, ancora: 'cauda', dx: -2, dy: -1 },
    'flores-cauda': { linhas: ['.P...', 'PYP..', '.P.V.', '..VYV', '...V.'], paleta: { P: '#ff7eb6', V: '#b58cff', Y: '#ffe066' }, ancora: 'cauda', dx: -2, dy: -2 },
    'peixinho-cauda': { linhas: ['.OOO.O', 'OkOOOO', '.OOO.O'], paleta: { k: '#3a2446', O: '#ffa020' }, ancora: 'cauda', dx: -3, dy: -1 },
    'estrelas-cauda': { linhas: ['.Y...', 'YWY..', '.Y.Y.', '..YWY', '...Y.'], paleta: { Y: '#ffc21a', W: '#fffbe0' }, ancora: 'cauda', dx: -2, dy: -2 },
    'fita-arco-iris-cauda': { linhas: ['kk.kk', 'kPDPk', 'kk.kk', 'roygb', 'r.y.b'], paleta: { k: '#3a2446', P: '#ff7eb6', D: '#c92f73', r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d', g: '#5fd07a', b: '#5fb4ff' }, ancora: 'cauda', dx: -2, dy: -1 },
    'pena-cauda': { linhas: ['..kk', '.kGk', 'kGBk', 'kBYk', 'kk..'], paleta: { k: '#3a2446', G: '#8f6cf0', B: '#5fb4ff', Y: '#ffd34d' }, ancora: 'cauda', dx: -2, dy: -3 },
    'balao-cauda': { linhas: ['.kRk.', 'kRWRk', 'kRRRk', '.kRk.', '..k..', '..k..'], paleta: { k: '#3a2446', R: '#ff4f6d', W: '#ffffff' }, ancora: 'cauda', dx: -2, dy: -5 },
    'barbatana-sereia': { linhas: ['kT.Tk', 'TtTtT', '.TTT.', '..k..'], paleta: { k: '#3a2446', T: '#34d0c0', t: '#9ff0e6' }, ancora: 'cauda', dx: -2, dy: 0 },
    'estrela-cadente-cauda': { linhas: ['....p', '...pP', 'kYkP.', 'YWY..', 'kYk..'], paleta: { k: '#3a2446', Y: '#ffd34d', W: '#ffffff', p: '#ffd1e6', P: '#ff7eb6' }, ancora: 'cauda', dx: -2, dy: -2 },
    // capacete de astronauta: bolha branca com viseira azul, aro cinza com parafusos e antena de bolinha rosa.
    // dy -2 para a bolinha caber no quadro do filhote (âncora cabeca em y=2); de lado a viseira vai para a cara
    'capacete-astronauta': { linhas: CAPACETE_ASTRONAUTA, paleta: { k: '#3a2446', W: '#ffffff', w: '#dfe6f2', C: '#8fd8ff', c: '#eafaff', B: '#4fa8e8', g: '#b8c2d6', G: '#7d88a3', R: '#ff5c8a' }, ancora: 'cabeca', dx: -5, dy: -2, cobreChifre: true },
    // prêmios da prova de Português (js/conteudo/provas/portugues-3bim.js)
    // touca de chef branca e fofa (dois gomos, dobras e lado da sombra em lilás L) com faixa de arco-íris
    // de 2 px (a de baixo mais escura): assim a touca não se confunde com a cabeça de um unicórnio branco
    'chapeu-chef-arco-iris': { linhas: CHAPEU_CHEF, paleta: { k: '#3a2446', w: '#ffffff', l: '#d9cff0', L: '#a58fd6', r: '#ff5a6e', o: '#ffa53a', y: '#ffe14d', g: '#5fd07a', t: '#4fd6c8', b: '#5fb4ff', p: '#b07cff', m: '#ff7eb6', R: '#e03a55', O: '#f08a1c', Y: '#f2c21c', G: '#3cb45e', T: '#26b8aa', B: '#3f8fe8', P: '#8e5ae8', M: '#e85a9a' }, ancora: 'cabeca', dx: -6, dy: -2 },
    // cachecol listrado azul e gelo, com a ponta caída e uma carinha de pinguim no pompom
    'cachecol-pinguim': { linhas: CACHECOL_PINGUIM, paleta: { k: '#3a2446', B: '#3d8ee8', c: '#bfe4ff', D: '#2a62b8', d: '#2c2f4a', w: '#ffffff', o: '#ffa020' }, ancora: 'pescoco', dx: -4, dy: -1 },
    // lacinho vermelho de morango com sementinhas e o nó de folhinha verde
    'lacinho-morango': { linhas: LACINHO_MORANGO, paleta: { k: '#3a2446', r: '#ff8a96', R: '#ee3b50', d: '#b3203a', y: '#ffe98a', G: '#3fae4f', g: '#8fe07a' }, ancora: 'orelha', dx: -4, dy: 1 },
  };
  // óculos da segunda leva de frente e em 3/4 de frente: a lente de lado em cada olho e a ponte no meio
  // (a ponte usa a letra P2 da lista, que está na paleta do enfeite; '.' = sem ponte)
  var OCULOS2 = { 'oculos-redondos': 'k', 'oculos-flor': 'G', 'oculos-arco-iris': 'r', 'oculos-melancia': 'G', 'oculos-gatinho': 'P', 'oculos-diamante': 'Y' };
  // [estágio, vista, x, y, vão entre as lentes]: os mesmos lugares dos óculos de coração
  [['adulto', 'frente', 4, 6, 4], ['adulto', 'diagFrente', 11, 6, 4], ['filhote', 'frente', 3, 5, 4], ['filhote', 'diagFrente', 7, 5, 2]].forEach(function (v) {
    Object.keys(OCULOS2).forEach(function (id) {
      var l = ENFEITES[id].linhas, vao = new Array(v[4] + 1).join('.'), ponte = new Array(v[4] + 1).join(OCULOS2[id]);
      UNI[v[0]][v[1]].enfeites[id] = { linhas: [l[0] + vao + l[0], l[1] + ponte + l[1], l[2] + vao + l[2]], x: v[2], y: v[3] };
    });
  });
  Object.keys(UNI).forEach(function (est) {
    Object.keys(UNI[est]).forEach(function (vista) {
      var m = UNI[est][vista], pg = m.enfeites && m.enfeites['cachecol-pinguim'];
      if (pg) m.enfeites['cachecol-listrado'] = { linhas: pg.linhas === CACHECOL_COSTAS ? CACHECOL_LISTRADO.slice(0, 2) : CACHECOL_LISTRADO, x: pg.x, y: pg.y };
    });
  });
  // todo enfeite (inclusive os prêmios das provas, que se registram depois) cabe inteiro no quadro: onde o
  // desenho passaria da borda, pixelart-unicornio.js o põe o mínimo para dentro (lugarDoEnfeite)
  PA.ENFEITES_MONTARIA = ENFEITES;
  // acessórios de prova com desenho no próprio arquivo (Reino.registrarProva), se já registrados
  Object.assign(ENFEITES, (window.Reino && window.Reino.desenhosAcessorios) || {});
  I.UNI = UNI;
})();
