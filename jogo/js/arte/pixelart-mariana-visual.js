/* Visual da Mariana do Salão de Beleza: FORMATO do corte de cabelo e MODELO da roupa (as cores continuam as de
   PA.OPCOES_APARENCIA). Salvos em aparencia.corte / aparencia.modelo; ausente ou desconhecido = o de hoje
   ('solto' e 'vestido'), que não passa por aqui: o desenho padrão sai pixel a pixel igual.
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
  PA.VISUAL_PADRAO = { corte: 'solto', modelo: 'vestido' };
  function existe(lista, id) { return lista.some(function (o) { return o.id === id; }); }
  // o visual valendo: o que não existe (save antigo, versão mais nova) cai no de hoje, sem mexer no save
  PA.visualMariana = function (ap) {
    ap = ap || {};
    return { corte: existe(PA.CORTES, ap.corte) ? ap.corte : 'solto', modelo: existe(PA.MODELOS, ap.modelo) ? ap.modelo : 'vestido' };
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
        frente: ['...HHHHB...', '..HHHHHHBB.', '.HHHHHHHHHH', '.HHKKKKKHHH', '.HKEKKKEKHL', '..RKKKKKR.H', '...KKKKK..H'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHBBBHHH.', '..HHHHHHH..', '..KHHLHHK..'],
        lado: ['...HHHH....', '..HHHHHHH..', '.BBHHHHHHH.', 'HHLHHKKKKK.', 'HLHHKKKEKK.', 'HH.HKKKKRK.', 'H...HKKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '.BBHHHHHHH.', 'HHLHKKKKKH.', 'HLHHKEKKEK.', 'HH.HKKKKRK.', 'H...HKKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHBBHHHK.', '...HHHHHKK.', '...KHLHKK..'],
      },
      corpo: {
        frente: ['..........H'],
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
        frente: ['...HHHHBB..', '..HHHHHHBB.', '.HHHHHHHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '.HRKKKKKRH.', '.HHKKKKKHH.'],
        lado: ['..BHHHH....', '.BBHHHHHH..', '..HHHHHHHH.', '..HHHKKKKK.', '..HHKKKEKK.', '..HHKKKKRK.', '..HHHKKKK..'],
      } },
    tranca: { curto: true,
      cabeca: {
        frente: ['...HHHHH...', '..HHHHHHH..', '.HHHHHHHHH.', '.HHKKKKKHH.', '.HKEKKKEKH.', '..RKKKKKRH.', '...KKKKKHL.'],
        costas: ['...HHHHH...', '..HHHHHHH..', '.HHHLLHHHH.', '.HHLHHHHHH.', '.HHHHHHHHH.', '..HHHHHHH..', '..KHLHHHK..'],
        lado: ['...HHHH....', '..HHHHHHH..', '..HHHHHHHH.', '..HHHKKKKK.', '..HHKKKEKK.', '..HHKKKKRK.', '..LH.KKKK..'],
        diagFrente: ['...HHHHH...', '..HHHHHHHH.', '..HHHHHHHH.', '..HHKKKKKH.', '..HHKEKKEK.', '..HHKKKKRK.', '..LH.KKKK..'],
        diagCostas: ['...HHHH....', '..HHHHHHH..', '..HHHLLHHH.', '..HHLHHHHH.', '..HHHHHHHK.', '...HHHHHKK.', '...HLHHKK..'],
      },
      corpo: {
        frente: ['........LH.', '........HL.', '........BB.'],
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
        frente: ['..HHHHHBB..', '.HHLHHHHBB.', 'HHHHHHLHHHH', 'HLHKKKKKHLH', 'HHKEKKKEKHH', 'HLRKKKKKRLH', 'HHHKKKKKHHH'],
        costas: ['..BBHHHHH..', '.BBHHHLHHH.', 'HHHLHHHHLHH', 'HLHHHLHHHHH', 'HHHHHHHLHLH', 'HLHHLHHHHHH', 'HHHHHHHLHHH'],
        lado: ['.BHHHHH....', 'BBHHLHHHH..', 'HHHHHHHHHH.', 'HLHHHKKKKK.', 'HHHLKKKEKK.', 'HLHHKKKKRK.', 'HHHHHKKKK..'],
        diagFrente: ['.BHHHHHH...', 'BBHHLHHHHH.', 'HHHHHHHHHHH', 'HLHHKKKKKHL', 'HHHLKEKKEKH', 'HLHHKKKKRKH', 'HHHHHKKKK.H'],
        diagCostas: ['.BHHHHH....', 'BBHHLHHHH..', 'HHHHHLLHHHH', 'HLHHLHHHHHL', 'HHHLHHHHHKH', 'HLHHHHHHKKH', 'HHHHHHHKK.H'],
      },
      corpo: {
        frente: ['HLH.....HLH', 'HH.......HH', '.H.......H.'],
        costas: ['HHLHHHLHHLH', '.HHLHHHLHH.', '..HLHHHLH..', '...HHLHH...'],
        lado: ['HLHH.......', 'HHLH.......', '.HH........'],
        diagFrente: ['HLHH.......', 'HHL........', '.H.........'],
        diagCostas: ['HLHHLHH....', 'HHLHHLH....', '.HHLHH.....', '..HH.......'],
      } },
    franjinha: {
      cabeca: {
        frente: ['...HHHHBB..', '..HHHHHHBB.', '.HHHHHHHHH.', '.HHLHHHLHH.', '.HKEKKKEKH.', '.HRKKKKKRH.', '.HHKKKKKHH.'],
        lado: ['..BHHHH....', '.BBHHHHHH..', '..HHHHHHHH.', '..HHHHHHLK.', '..HHKKKEKK.', '..HHKKKKRK.', '..HHHKKKK..'],
        diagFrente: ['..BHHHHH...', '.BBHHHHHHH.', '..HHHHHHHH.', '..HHHLHHLH.', '..HHKEKKEK.', '..HHKKKKRK.', '..HHHKKKK..'],
      } },
  };

  /* ---------- ROUPA ---------- */
  // o papel de cada linha do corpo (a partir da 1ª): em pé 8 linhas, sentada (montada) 7
  var PAPEIS_PE = ['ombro', 'tronco', 'tronco', 'cintura', 'saia', 'perna', 'perna', 'pe'];
  var PAPEIS_SENTADA = ['ombro', 'tronco', 'cintura', 'saia', 'coxa', 'perna', 'pe'];
  /* Cada modelo: troca de letras por papel ({ C: 'W' } = a roupa vira branquinha) e ajustes de forma:
     pregas (a saia listrada), largura (saia mais rodada), comprida (quantas linhas de perna a saia cobre, em pé). */
  var MODELOS = {
    macacao: { ombro: { C: 'W' }, tronco: { A: 'D' }, cintura: { A: 'D' }, perna: { K: 'D' } },
    saiaBlusa: { ombro: { C: 'W' }, tronco: { C: 'W', A: 'C' }, cintura: { C: 'W', A: 'C' }, pregas: ['C', 'D'],
      coxa: { D: 'C' }, perna: { D: 'K' } },
    jardineira: { ombro: { C: 'W' }, tronco: { C: 'W', A: 'D' }, cintura: { C: 'D', A: 'G' }, perna: { D: 'K' } },
    princesa: { ombro: { C: 'M' }, tronco: { A: 'W' }, cintura: { A: 'W' }, saia: { D: 'C' }, largura: 1, comprida: 2,
      brilho: 'W', perna: { K: 'C' } },
    bailarina: { ombro: { C: 'C' }, tronco: { A: 'M' }, cintura: { A: 'M' }, pregas: ['W', 'M'], largura: 1,
      coxa: { D: 'M' }, perna: { K: 'M', D: 'M' }, pe: { S: 'C' } },
    esporte: { ombro: { C: 'C' }, tronco: { A: 'W' }, cintura: { A: 'W', C: 'W' }, perna: { K: 'D' }, pe: { S: 'T' } },
    festa: { tronco: { A: 'G' }, cintura: { C: 'A', A: 'A' }, saia: { D: 'C' }, comprida: 1, brilho: 'G',
      pe: { S: 'A' } },
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
  function vestir(g, sentada, m) {
    var papeis = sentada ? PAPEIS_SENTADA : PAPEIS_PE, iSaia = 7 + papeis.indexOf('saia');
    papeis.forEach(function (p, i) { if (p !== 'saia') trocar(g[7 + i], m[p]); });
    var saia = g[iSaia], ls = limites(saia);
    trocar(saia, m.saia);
    if (m.largura && ls[0] > 0 && ls[1] < saia.length - 1) { saia[ls[0] - 1] = saia[ls[0]]; saia[ls[1] + 1] = saia[ls[1]]; ls = [ls[0] - 1, ls[1] + 1]; }
    if (m.pregas) for (var x = ls[0]; x <= ls[1]; x++) saia[x] = m.pregas[x % 2];
    // saia comprida em pé: as linhas de perna viram saia, cada uma um pouco mais rodada
    for (var j = 1; !sentada && j <= (m.comprida || 0); j++) {
      var l = g[iSaia + j], a = Math.max(0, ls[0] - (j - 1)), b = Math.min(l.length - 1, ls[1] + (j - 1));
      for (var k = 0; k < l.length; k++) l[k] = k >= a && k <= b ? 'C' : (l[k] === 'K' ? '.' : l[k]);
      if (j === m.comprida) for (k = a; k <= b; k++) if ((k + j) % 3 === 0) l[k] = 'D';
    }
    if (m.brilho) for (x = ls[0] + 1; x < ls[1]; x += 3) saia[x] = m.brilho;
  }

  /** Aplica corte e modelo nas linhas da Mariana (cabeça + corpo) e devolve linhas novas.
      @param {string[]} linhas @param {string} vista @param {boolean} sentada @param {string} corte @param {string} modelo */
  I.aplicarVisual = function (linhas, vista, sentada, corte, modelo) {
    var g = linhas.map(function (l) { return l.split(''); });
    var c = CORTES[corte], m = MODELOS[modelo];
    if (c && c.curto) (NU[vista] || []).forEach(function (l, j) {
      var r = g[7 + j];
      for (var i = 0; i < r.length; i++) if (r[i] === 'H' || r[i] === 'L') r[i] = l[i];
    });
    if (m) vestir(g, sentada, m);
    if (c && c.cabeca && c.cabeca[vista]) c.cabeca[vista].forEach(function (l, j) { g[j] = l.split(''); });
    if (c && c.corpo && c.corpo[vista]) c.corpo[vista].forEach(function (l, j) {
      var r = g[7 + j];
      if (r) for (var i = 0; i < l.length; i++) if (l[i] !== '.') r[i] = l[i];
    });
    return g.map(function (r) { return r.join(''); });
  };
})();
