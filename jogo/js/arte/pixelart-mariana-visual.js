/* Visual da personagem do Salão de Beleza e da criação: FORMATO do corte de cabelo, MODELO da roupa e o laço
   (as cores continuam as de PA.OPCOES_APARENCIA). Salvos em aparencia.corte / aparencia.modelo / aparencia.semLaco;
   ausente ou desconhecido = o padrão do sexo (menina: 'solto' + 'vestido' + laço, que não passa por aqui: o desenho
   padrão sai pixel a pixel igual; menino: 'curto' + 'camiseta', sem laço). Os de menino: pixelart-menino-moldes.js.
   PA.mariana (pixelart-personagens.js) chama PA._interno.aplicarVisual nos moldes já montados (cabeça + corpo,
   11 colunas: linhas 0–6 cabeça, 7+ corpo), então vale a pé, montada (sentada) e nas 5 vistas.
   Letras novas da paleta: W roupa bem clarinha, M roupa clara, G dourado, T branco (tênis). */
(function () {
  var PA = window.PA, I = PA._interno;

  PA.CORTES = [
    { id: 'solto', nome: 'Longo solto' }, { id: 'rabo', nome: 'Rabo de cavalo' },
    { id: 'chiquinhas', nome: 'Maria-chiquinha' }, { id: 'chanel', nome: 'Chanel curtinho' },
    { id: 'tranca', nome: 'Trança' }, { id: 'coque', nome: 'Coque' },
    { id: 'cacheado', nome: 'Cacheado' }, { id: 'franjinha', nome: 'Franjinha' },
  ];
  PA.MODELOS = [
    { id: 'vestido', nome: 'Vestido' }, { id: 'macacao', nome: 'Macacão' },
    { id: 'saiaBlusa', nome: 'Saia e blusa' }, { id: 'jardineira', nome: 'Jardineira' },
    { id: 'princesa', nome: 'Princesa' }, { id: 'bailarina', nome: 'Bailarina' },
    { id: 'esporte', nome: 'Esportivo' }, { id: 'festa', nome: 'Festa' },
  ];
  PA.CORTES.forEach(function (o) { o.sexo = 'menina'; });
  PA.MODELOS.forEach(function (o) { o.sexo = 'menina'; });
  PA.VISUAL_PADRAO = { corte: 'solto', modelo: 'vestido' };
  // o padrão de cada sexo (o menino ganha ao escolher "Menino" na criação, e quando não há escolha salva)
  PA.VISUAL_SEXO = { menina: { corte: 'solto', modelo: 'vestido', laco: true }, menino: { corte: 'curto', modelo: 'camiseta', laco: false } };
  function existe(lista, id) { return lista.some(function (o) { return o.id === id; }); }
  // sexo de quem joga (perfil de Reino.Jogadores, lido na hora); sem perfil = menina (a Mariana)
  PA.sexoJogador = function () {
    var J = window.Reino && window.Reino.Jogadores, p = null;
    try { p = J && J.perfil ? J.perfil() : null; } catch (e) { p = null; }
    return p && p.sexo === 'menino' ? 'menino' : 'menina';
  };
  // o visual valendo: o que não existe (save antigo, versão mais nova) cai no padrão, sem mexer no save.
  // ap.sexo (a prévia da criação) vale no lugar do sexo do perfil.
  PA.visualMariana = function (ap) {
    ap = ap || {};
    var c = existe(PA.CORTES, ap.corte) ? ap.corte : null, m = existe(PA.MODELOS, ap.modelo) ? ap.modelo : null;
    var laco = typeof ap.semLaco === 'boolean' ? !ap.semLaco : null;
    var pad = c && m && laco !== null ? null : PA.VISUAL_SEXO[ap.sexo === 'menino' || ap.sexo === 'menina' ? ap.sexo : PA.sexoJogador()];
    return { corte: c || pad.corte, modelo: m || pad.modelo, laco: laco !== null ? laco : pad.laco };
  };

  /* ---------- CABELO ---------- */
  // o que fica embaixo do cabelo comprido nas 3 primeiras linhas do corpo (só onde hoje há cabelo)
  var NU = {
    lado: ['...........', '...C.......', '...C.......'],
    frente: ['..C.....C..', '...........', '...........'],
    costas: ['..CCCCCCC..', '...CCCCC...', '....CCC....'],
    diagFrente: ['...C.......', '...........', '...........'],
    diagCostas: ['...CCCC....', '...CCCC....', '...CCC.....'],
  };
  /* Cada corte: curto (tira o cabelo comprido do corpo), cabeca[vista] (as 7 linhas da cabeça) e corpo[vista]
     (linhas por cima do corpo, a partir da 1ª; '.' = deixa). Vista sem cabeça própria usa a de hoje. */
  var CORTES = {
    rabo: { curto: true,
      cabeca: {
        frente: ['...BHHHH...', '.BBHHHHHH..', 'HHHHHHHHHH.', 'HHHKKKKKHH.', 'LHKEKKKEKH.', 'H.RKKKKKR..', 'H..KKKKK...'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHBBBHHH.', '..HHHHHHH..', '..KHHLHHK..'],
        lado: ['...HHHH....', '..HHHHHHH..', '.BBHHHHHHH.', 'HHLHHKKKKK.', 'HLHHKKKEKK.', 'HH.HKKKKRK.', 'H...HKKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '.BBHHHHHHH.', 'HHLHKKKKKH.', 'HLHHKEKKEK.', 'HH.HKKKKRK.', 'H...HKKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHBBHHHK.', '...HHHHHKK.', '...KHLHKK..'],
      },
      corpo: {
        frente: ['H..........'],
        costas: ['....HLH....', '....HHH....', '.....H.....'],
        lado: ['H..........'],
        diagFrente: ['H..........'],
        diagCostas: ['....HL.....', '....HH.....', '.....H.....'],
      } },
    chiquinhas: { curto: true,
      cabeca: {
        frente: ['...HHHHH...', '..HHHHHHH..', '.HHHHHHHHH.', 'BHHKKKKKHHB', 'HHKEKKKEKHH', 'HLRKKKKKRLH', 'HH.KKKKK.HH'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', 'BHHLHHHHHHB', 'HHHHHHHHHHH', 'HLHHHHHHHLH', 'HH.KKKKK.HH'],
        lado: ['...HHHH....', '..HHHHHHH..', '..HHHHHHHH.', '.BHHHKKKKK.', 'HHHHKKKEKK.', 'HLHHKKKKRK.', 'HH..HKKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '..HHHHHHHH.', '.BHHKKKKKHB', 'HHHHKEKKEKH', 'HLHHKKKKRKH', 'HH..HKKKK.H'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '.BHHLHHHHHB', 'HHHHHHHHHKH', 'HLHHHHHHKKH', 'HH.HHHHKK.H'],
      },
      corpo: {
        frente: ['H.........H', 'H.........H'],
        costas: ['H.........H', 'H.........H'],
        lado: ['H..........', 'H..........'],
        diagFrente: ['H.........H', 'H..........'],
        diagCostas: ['H.........H', 'H..........'],
      } },
    chanel: { curto: true,
      cabeca: {
        frente: ['..BBHHHH...', '.BBHHHHHH..', '.HHHHHHHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '.HRKKKKKRH.', '.HHKKKKKHH.'],
        lado: ['..BHHHH....', '.BBHHHHHH..', '..HHHHHHHH.', '..HHHKKKKK.', '..HHKKKEKK.', '..HHKKKKRK.', '..HHHKKKK..'],
        // de costas e em 3/4: o cabelo acaba reto na altura do queixo, com as pontas claras, e a nuca aparece
        costas: ['...HHHHBB..', '..HHHHHHBB.', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '.HLHHHHHLH.', '..KKKKKKK..'],
        diagFrente: ['..BHHHHH...', '.BBHHHHHHH.', '..HHHHHHHH.', '..HHKKKKKH.', '..HHKEKKEK.', '..HLKKKKRK.', '...KKKKKK..'],
        diagCostas: ['...HHHHHB..', '..HHHHHHBB.', '..HHHLLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '..HLHHHLKK.', '...KKKKKK..'],
      } },
    tranca: { curto: true,
      cabeca: {
        frente: ['...HHHHH...', '..HHHHHHH..', '.HHHHHHHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '.HRKKKKKR..', '.LHKKKKK...'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '..HHHHHHH..', '..KHLHHHK..'],
        lado: ['...HHHH....', '..HHHHHHH..', '..HHHHHHHH.', '..HHHKKKKK.', '..HHKKKEKK.', '..HHKKKKRK.', '..LH.KKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '..HHHHHHHH.', '..HHKKKKKH.', '..HHKEKKEK.', '..HHKKKKRK.', '..LH.KKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '...HHHHHKK.', '...HLHHKK..'],
      },
      corpo: {
        frente: ['.HL........', '.LH........', '.BB........'],
        costas: ['....LH.....', '....HL.....', '....LH.....', '....BB.....'],
        lado: ['..HL.......', '..LH.......', '..BB.......'],
        diagFrente: ['..HL.......', '..LH.......', '..BB.......'],
        diagCostas: ['...LH......', '...HL......', '...LH......', '...BB......'],
      } },
    coque: { curto: true,
      cabeca: {
        frente: ['....HHH....', '...BHLHB...', '.HHHHHHHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '..RKKKKKR..', '...KKKKK...'],
        costas: ['....HHH....', '...BHLHB...', '.HHHHHHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '..HHHHHHH..', '..KKKKKKK..'],
        lado: ['...HHH.....', '..BHLHB....', '..HHHHHHHH.', '..HHHKKKKK.', '..HHKKKEKK.', '...HKKKKRK.', '...KKKKKK..'],
        diagFrente: ['...HHH.....', '..BHLHB....', '..HHHHHHHH.', '..HHKKKKKH.', '..HHKEKKEK.', '...HKKKKRK.', '...KKKKKK..'],
        diagCostas: ['...HHH.....', '..BHLHB....', '..HHHHHHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '...HHHHHKK.', '...KKKKKK..'],
      } },
    cacheado: {
      cabeca: {
        frente: ['..BBHHHHH..', '.BBHHHHLHH.', 'HHHHLHHHHHH', 'HLHKKKKKHLH', 'HHKEKKKEKHH', 'HLRKKKKKRLH', 'HHHKKKKKHHH'],
        costas: ['..HHHHHBB..', '.HHHLHHHBB.', 'HHHLHHHHLHH', 'HLHHHLHHHHH', 'HHHHHHHLHLH', 'HLHHLHHHHHH', 'HHHHHHHLHHH'],
        lado: ['.BHHHHH....', 'BBHHLHHHH..', 'HHHHHHHHHH.', 'HLHHHKKKKK.', 'HHHLKKKEKK.', 'HLHHKKKKRK.', 'HHHHHKKKK..'],
        diagFrente: ['.BHHHHHH...', 'BBHHLHHHHH.', 'HHHHHHHHHHH', 'HLHHKKKKKHL', 'HHHLKEKKEKH', 'HLHHKKKKRKH', 'HHHHHKKKK.H'],
        diagCostas: ['..HHHHHHB..', '.HHHLHHHHBB', 'HHHHHLLHHHH', 'HLHHLHHHHHL', 'HHHLHHHHHKH', 'HLHHHHHHKKH', 'HHHHHHHKK.H'],
      },
      corpo: {
        frente: ['HLH.....HLH', 'HH.......HH', '.H.......H.'],
        costas: ['HHLHHHLHHLH', '.HHLHHHLHH.', '..HLHHHLH..', '...HHLHH...'],
        lado: ['HLHH.......', 'HHLH.......', '.HH........'],
        diagFrente: ['HLHH.......', 'HHL........', '.H.........'],
        diagCostas: ['HLHHLHH....', 'HHLHHLH....', '.HHLHH.....', '..HH.......'],
      } },
    // franja grossa, cabelo na altura do ombro com as pontas viradas para fora e presilhas dos dois lados
    franjinha: { curto: true,
      cabeca: {
        frente: ['...HHHHH...', '..HHLHHHH..', '.BHHHHHHHB.', '.HHHLHLHHH.', '.HKEKKKEKH.', '.HRKKKKKRH.', 'HHHKKKKKHHH'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.BHHLLHHHB.', '.HHLHHHHHH.', '.HHHHHHHHH.', '.HHHHHHHHH.', 'HHHHHHHHHHH'],
        lado: ['...HHHH....', '..HHHHHHH..', '..HBHHHHHH.', '..HHHHHHLK.', '..HHKKKEKK.', '..HHKKKKRK.', '.HHHHKKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '..HBHHHHHB.', '..HHHLHHLH.', '..HHKEKKEK.', '..HHKKKKRK.', '.HHHHKKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HBHLLHHB.', '..HHLHHHHH.', '..HHHHHHHK.', '..HHHHHHKK.', '.HHHHHHKK..'],
      },
      corpo: {
        frente: ['H.........H'],
        costas: ['H.........H'],
        lado: ['H..........'],
        diagFrente: ['H..........'],
        diagCostas: ['H..........'],
      } },
  };

  /* ---------- ROUPA ---------- */
  // o papel de cada linha do corpo (a partir da 1ª): em pé 8 linhas, sentada (montada) 7
  var PAPEIS_PE = ['ombro', 'tronco', 'tronco', 'cintura', 'saia', 'perna', 'perna', 'pe'];
  var PAPEIS_SENTADA = ['ombro', 'tronco', 'cintura', 'saia', 'coxa', 'perna', 'pe'];
  /* Cada modelo: troca de letras por papel ({ C: 'W' } = a roupa vira branquinha) e ajustes de forma:
     pregas (a saia listrada), largura (saia mais rodada), comprida (quantas linhas de perna a saia cobre, em pé),
     barra (a última linha da saia comprida), mangas (o braço de cima), laco (laço na cintura), brilho (pontinhos na saia). */
  var MODELOS = {
    macacao: { ombro: { C: 'W' }, tronco: { A: 'D' }, cintura: { A: 'D' }, perna: { K: 'D' } },
    saiaBlusa: { ombro: { C: 'W' }, tronco: { C: 'W', A: 'C' }, cintura: { C: 'W', A: 'C' }, pregas: ['C', 'D'],
      coxa: { D: 'C' }, perna: { D: 'K' } },
    jardineira: { ombro: { C: 'W' }, tronco: { C: 'W', A: 'D' }, cintura: { C: 'D', A: 'G' }, perna: { D: 'K' } },
    // longo até os pés, mangas bufantes, saia rodada com barrado dourado
    princesa: { ombro: { C: 'M' }, mangas: 'M', tronco: { A: 'W' }, cintura: { A: 'W' }, saia: { D: 'C' }, largura: 1,
      comprida: 2, barra: 'G', perna: { K: 'C' } },
    bailarina: { ombro: { C: 'C' }, tronco: { A: 'M' }, cintura: { A: 'M' }, pregas: ['W', 'M'], largura: 1,
      coxa: { D: 'M' }, perna: { K: 'M', D: 'M' }, pe: { S: 'C' } },
    esporte: { ombro: { C: 'C' }, tronco: { A: 'W' }, cintura: { A: 'W', C: 'W' }, perna: { K: 'D' }, pe: { S: 'T' } },
    // curto, com laço grande na cintura (na cor do laço do cabelo) e brilhos na saia
    festa: { tronco: { A: 'M' }, cintura: { A: 'B' }, laco: 'B', saia: { D: 'C' }, brilho: 'G', pe: { S: 'A' } },
  };
  function trocar(linha, mapa) {
    if (!mapa) return;
    for (var i = 0; i < linha.length; i++) if (mapa[linha[i]]) linha[i] = mapa[linha[i]];
  }
  function limites(linha) {
    var a = -1, b = -1;
    for (var i = 0; i < linha.length; i++) if (linha[i] !== '.') { if (a < 0) a = i; b = i; }
    return [a, b];
  }
  var DE_FRENTE = { frente: true, diagFrente: true };   // onde aparecem gola, botões, zíper, estampa e fivela
  function meio(linha) { var l = limites(linha); return Math.floor((l[0] + l[1]) / 2); }
  function pintarSe(linha, x, letra) { if (x >= 0 && x < linha.length && 'CADW'.indexOf(linha[x]) >= 0) linha[x] = letra; }
  function vestir(g, sentada, m, vista) {
    var papeis = sentada ? PAPEIS_SENTADA : PAPEIS_PE, iSaia = 7 + papeis.indexOf('saia');
    var iCin = 7 + papeis.indexOf('cintura'), iTronco = 7 + papeis.lastIndexOf('tronco'), frente = !!DE_FRENTE[vista];
    // estampa da camiseta (no peito, antes de o tronco perder os detalhes do vestido)
    if (m.estampa && frente && !sentada) { var mt = meio(g[iTronco]); [mt - 1, mt + 1].forEach(function (x) { pintarSe(g[iTronco], x, m.estampa); }); pintarSe(g[iTronco], mt, 'G'); }
    papeis.forEach(function (p, i) { if (p !== 'saia') trocar(g[7 + i], m[p]); });
    // o pé levantado do passo fica numa linha de perna: o sapato troca igual ao do chão
    if (m.pe && m.pe.S) papeis.forEach(function (p, i) { if (p === 'perna') trocar(g[7 + i], { S: m.pe.S }); });
    if (m.mangas) trocar(g[8], { K: m.mangas });   // a 1ª linha do tronco: o braço de cima vira manga
    if (m.gola && frente) { var mg = meio(g[7]); [mg - 1, mg, mg + 1].forEach(function (x) { pintarSe(g[7], x, m.gola); }); }
    if (m.cinto) {
      trocar(g[iCin], { C: m.cinto[0], A: m.cinto[0], D: m.cinto[0] });
      if (frente) g[iCin][meio(g[iCin])] = m.cinto[1];
    }
    for (var t = 8; frente && (m.botoes || m.ziper) && t <= (m.ziper ? iCin : iTronco); t++) pintarSe(g[t], meio(g[t]), m.botoes || m.ziper);
    if (m.laco) {
      // laço: nó no meio da cintura e as duas voltas saindo para os lados
      var cin = g[iCin], lc = limites(cin), mc = Math.floor((lc[0] + lc[1]) / 2);
      cin[mc] = 'A';
      [mc - 1, mc + 1, lc[0] - 1, lc[1] + 1].forEach(function (x) { if (x >= 0 && x < cin.length) cin[x] = m.laco; });
    }
    var saia = g[iSaia], ls = limites(saia);
    trocar(saia, m.saia);
    if (m.calca) calca(g, sentada, m, iSaia, ls);
    if (m.largura && ls[0] > 0 && ls[1] < saia.length - 1) { saia[ls[0] - 1] = saia[ls[0]]; saia[ls[1] + 1] = saia[ls[1]]; ls = [ls[0] - 1, ls[1] + 1]; }
    if (m.pregas) for (var x = ls[0]; x <= ls[1]; x++) saia[x] = m.pregas[x % 2];
    // saia comprida em pé: as linhas de perna viram saia, cada uma um pouco mais rodada
    for (var j = 1; !sentada && j <= (m.comprida || 0); j++) {
      var l = g[iSaia + j], a = Math.max(0, ls[0] - (j - 1)), b = Math.min(l.length - 1, ls[1] + (j - 1));
      for (var k = 0; k < l.length; k++) l[k] = k >= a && k <= b ? 'C' : (l[k] === 'K' ? '.' : l[k]);
      // a barra: só no miolo (a largura da linha de cima), com 1 px de roupa escura nas pontas que rodam para fora
      if (j === m.comprida) for (k = a; k <= b; k++) l[k] = !m.barra ? ((k + j) % 3 === 0 ? 'D' : 'C') : (k === a || k === b) && j > 1 ? 'D' : m.barra;
    }
    if (m.brilho) for (x = ls[0] + 1; x < ls[1]; x += 3) saia[x] = m.brilho;
  }
  // calça ou bermuda: a linha da saia vira quadril (em pé, estreito como as pernas) e as pernas se cobrem
  function calca(g, sentada, m, iSaia, ls) {
    var saia = g[iSaia], cor = m.calca;
    if (sentada) {
      trocar(saia, { C: cor, D: cor, A: cor });
      trocar(g[iSaia + 1], { D: cor, K: cor });
      trocar(g[iSaia + 2], m.pernas >= 2 ? { D: cor, K: cor } : { D: 'K' });
      return;
    }
    var lp = limites(g[iSaia + 1]), a = Math.max(ls[0], lp[0]), b = Math.min(ls[1], lp[1]);
    for (var x = 0; x < saia.length; x++) saia[x] = x >= a && x <= b ? cor : '.';
    for (var j = 1; j <= m.pernas; j++) trocar(g[iSaia + j], { K: cor });
  }

  /* ---------- LAÇO ---------- */
  // sem laço: o laço do cabelo vira cabelo, e a ponta que sai para fora some (a cabeça fica com o contorno certo)
  function tirarLaco(g) {
    for (var y = 0; y < 7; y++) {
      var r = g[y], o = r.slice();
      for (var x = 0; x < r.length; x++) if (o[x] === 'B') r[x] = x === 0 || x === r.length - 1 || o[x - 1] === '.' || o[x + 1] === '.' ? '.' : 'H';
    }
  }
  // corte de menino com laço: o lacinho fica no mesmo lugar do da Mariana (de costas, à direita de quem olha)
  var LACO = { frente: [[0, 3], [0, 2], [1, 2], [1, 1]], lado: [[0, 2], [1, 1], [1, 2]], costas: [[0, 7], [0, 8], [1, 8], [1, 9]],
    diagFrente: [[0, 2], [1, 1], [1, 2]], diagCostas: [[0, 8], [1, 8], [1, 9]] };

  /** Aplica corte, modelo e laço nas linhas da Mariana (cabeça + corpo) e devolve linhas novas.
      @param {string[]} linhas @param {string} vista @param {boolean} sentada @param {string} corte @param {string} modelo
      @param {boolean} [laco] false = sem laço (padrão: com) */
  I.aplicarVisual = function (linhas, vista, sentada, corte, modelo, laco) {
    var g = linhas.map(function (l) { return l.split(''); });
    var c = CORTES[corte], m = MODELOS[modelo], comLaco = laco !== false;
    if (c && c.curto) (NU[vista] || []).forEach(function (l, j) {
      var r = g[7 + j];
      for (var i = 0; i < r.length; i++) if (r[i] === 'H' || r[i] === 'L') r[i] = l[i];
    });
    if (m) vestir(g, sentada, m, vista);
    if (c && c.cabeca && c.cabeca[vista]) c.cabeca[vista].forEach(function (l, j) { g[j] = l.split(''); });
    if (!comLaco) tirarLaco(g);
    else if (c && c.menino) (LACO[vista] || []).forEach(function (p) { if ('.HLZ'.indexOf(g[p[0]][p[1]]) >= 0) g[p[0]][p[1]] = 'B'; });
    if (c && c.corpo && c.corpo[vista]) c.corpo[vista].forEach(function (l, j) {
      var r = g[7 + j];
      if (r) for (var i = 0; i < l.length; i++) if (l[i] !== '.') r[i] = l[i] === 'B' && !comLaco ? 'H' : l[i];
    });
    return g.map(function (r) { return r.join(''); });
  };
  I.CORTES_VISUAL = CORTES;
  I.MODELOS_VISUAL = MODELOS;
})();
