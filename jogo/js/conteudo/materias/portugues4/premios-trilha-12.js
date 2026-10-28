/* Prêmios da trilha perfeita do capítulo 12 (poemas): acessório lendário, elemento e experiência por sala.
   Contrato: docs/contratos/quarto-bimestre.md §14 (tabela fixa em §14.4). */
(function () {
  var K = '#3a2446', Y = '#ffd34d', D = '#e0a020', W = '#ffffff';
  function premio(sala, z, exp, id, nome, desenho, icone) {
    Reino.registrarPremioTrilha({
      sala: sala, materia: 'portugues4', elemento: z, experiencia: exp,
      acessorio: { id: id, nome: nome, desenho: desenho, icone: { n: nome, p: icone.p, d: icone.d } }
    });
  }

  // lp12a1: óculos dourados de lentes verdes, como os do jacaré que lê
  var pOc = { k: K, y: Y, d: D, g: '#7fe08a', w: W };
  premio('lp12a1', 78, 'exp-batata-espuma', 'lpt-lp12a1', 'Óculos do Jacaré Letrado',
    { linhas: ['.yyy.yyy.', 'ywggygwgy', 'ygggkgggy', '.ddd.ddd.'], paleta: pOc, ancora: 'olho', dx: -4, dy: -1 },
    { p: pOc, d: [
      '................',
      '..w.........w...',
      '.www.......www..',
      '..w.........w...',
      '..yyyy....yyyy..',
      '.ywwggy..ywwggy.',
      'kywgggyyyywgggyk',
      'kygggggkkygggggk',
      '.yggggy..yggggy.',
      '..dddd....dddd..',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'] });

  // lp12a2: pingente de coração de maçã (-ã) na orelha
  var pMa = { k: K, y: Y, G: '#4fbf5a', R: '#e8324a', r: '#ff8a9a', W: W };
  premio('lp12a2', 38, 'exp-arco-iris-no-copo', 'lpt-lp12a2', 'Coração de Maçã',
    { linhas: ['.kkykk.', 'kRRyRRk', 'kRWRRRk', '.kRRRk.', '..kRk..', '...k...'], paleta: pMa, ancora: 'orelha', dx: -3, dy: 1 },
    { p: pMa, d: [
      '.......y........',
      '.......y........',
      '.......y........',
      '.......yGG......',
      '.......GG.......',
      '..RRRR...RRRR...',
      '.RRWWRR.RRRRRR..',
      '.RWWRRRRRRRRRR..',
      '.RRRRRRRRRRRRR..',
      '.RRRRRRRRRRRrR..',
      '..RRRRRRRRRrR...',
      '...RRRRRRRRR....',
      '....RRRRRRR.....',
      '.....RRRRR......',
      '......RRR.......',
      '.......R........'] });

  // lp12a3: plaquinha dourada com um nome escrito (nome próprio!)
  var pPl = { k: K, y: Y, d: D, W: W, c: '#b07a10' };
  premio('lp12a3', 82, 'exp-lapis-sem-chumbo', 'lpt-lp12a3', 'Plaquinha de Nome Dourada',
    { linhas: ['y.....y', '.y...y.', '.kkkkk.', 'kyWyyyk', 'kyckcyk', '.kkkkk.'], paleta: pPl, ancora: 'pescoco', dx: -3, dy: 0 },
    { p: pPl, d: [
      '.y............y.',
      '..y..........y..',
      '...y........y...',
      '....y......y....',
      '.....y....y.....',
      '..kkkkkkkkkkkk..',
      '.kyyyyyyyyyyyyk.',
      '.kyWWyyyyyyyyyk.',
      '.kyWcyycyccycyk.',
      '.kyycycycycycyk.',
      '.kyycyycyccyyyk.',
      '.kyyyyyyyyyyydk.',
      '.kdddddddddddddk',
      '..kkkkkkkkkkkkk.',
      '................',
      '................'] });

  // lp12a4: broche dourado com a letra A maiúscula
  var pBr = { k: K, y: Y, d: D, R: '#e8324a', B: '#4a7ce8', G: '#3fae5a', W: W };
  premio('lp12a4', 80, 'exp-termometro-caseiro', 'lpt-lp12a4', 'Broche ABC',
    { linhas: ['.yRy.', 'yRyRy', 'yRRRy', 'yRdRy', '.ddd.'], paleta: pBr, ancora: 'cabeca', dx: -2, dy: -1 },
    { p: pBr, d: [
      '................',
      '....kkkkkkkk....',
      '...kyyyyyyyyk...',
      '..kyWyyyyyyyyk..',
      '.kyWyyyyyyyyydk.',
      '.kyyyyyyyyyyydk.',
      '.kyRRyBBByGGydk.',
      '.kRyRyByByGyydk.',
      '.kRRRyBBByGyydk.',
      '.kRyRyByByGyydk.',
      '.kRyRyBBByGGydk.',
      '.kyyyyyyyyyyydk.',
      '..kyyyyyyyyydk..',
      '...kddddddddk...',
      '....kkkkkkkk....',
      '................'] });

  // lp12a5: chifre pintado de arco-íris, com brilho na ponta
  var pPi = { W: W, y: Y, R: '#ff5c6a', O: '#ffa030', Y: '#ffe04d', G: '#5fd06a', B: '#5fb4ff', V: '#b58cff', k: K, m: '#a06a3a' };
  premio('lp12a5', 56, 'exp-leite-colorido', 'lpt-lp12a5', 'Pincel Arco-Íris',
    { linhas: ['.W.', 'WyW', 'RRR', 'OOO', 'YYY', 'GGG', 'BBB', 'VVV'], paleta: pPi, ancora: 'chifre', dx: -1, dy: -1 },
    { p: pPi, d: [
      '.............W..',
      '............WyW.',
      '.............W..',
      '..........kVV...',
      '.........kBBV...',
      '........kGGB....',
      '.......kYYG.....',
      '......kOOY......',
      '.....kRRO.......',
      '....kyyR........',
      '...kyyk.........',
      '..kmmk..........',
      '.kmmk...........',
      'kmmk............',
      'kmk.............',
      '.k..............'] });

  // lp12a6: coroa de flores da primavera, com miolos dourados
  var pCo = { k: K, P: '#ff7eb6', B: '#b58cff', O: '#ffa030', y: Y, G: '#6fdc8c', g: '#3fae5a', W: W };
  premio('lp12a6', 42, 'exp-flor-colorida', 'lpt-lp12a6', 'Coroa de Flores da Primavera',
    { linhas: ['kPkBkOk', 'PyPyByO', 'kPkBkOk', 'GgGgGgG', 'kkkkkkk'], paleta: pCo, ancora: 'cabeca', dx: -3, dy: -2 },
    { p: pCo, d: [
      '.......W........',
      '......WyW.......',
      '.......W........',
      '..PP...BB...OO..',
      '.PyyP.ByyB.OyyO.',
      '.PyyP.ByyB.OyyO.',
      '..PP...BB...OO..',
      '.GgGgGgGgGgGgGg.',
      'gGgGgGgGgGgGgGgG',
      '.ggggggggggggggg',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................'] });

  // lp12t1: trevo de quatro folhas com miolo de ouro, na cauda
  var pTr = { G: '#4fbf5a', g: '#9cf0a0', y: Y, k: K, W: W };
  premio('lp12t1', 54, 'exp-balao-estatico', 'lpt-lp12t1', 'Trevo da Sorte',
    { linhas: ['GG.GG', 'GgGgG', '.GyG.', 'GgGgG', 'GG.GG'], paleta: pTr, ancora: 'cauda', dx: -2, dy: -2 },
    { p: pTr, d: [
      '..............W.',
      '...GGG..GGG..WyW',
      '..GgggGGgggG..W.',
      '..GggGGGGggG....',
      '..GgGGGGGGgG....',
      '...GGGGGGGG.....',
      '.GGGGGGyGGGGGG..',
      'GggGGGyyyGGGggG.',
      '.GGGGGGyGGGGGG..',
      '...GGGGGGGG.....',
      '..GgGGGGGGgG....',
      '..GggGGGGggG....',
      '..GgggGkgggG....',
      '...GGG.k.GGG....',
      '.......k........',
      '.......k........'] });

  // lp12t2: colar de letrinhas coloridas num cordão de ouro
  var pCl = { y: Y, R: '#e8324a', B: '#4a7ce8', G: '#3fae5a', W: W, k: K };
  premio('lp12t2', 83, 'exp-cristais-de-sal', 'lpt-lp12t2', 'Colar de Letrinhas',
    { linhas: ['yRyByGy', '.yyyyy.', '..yWy..'], paleta: pCl, ancora: 'pescoco', dx: -3, dy: 0 },
    { p: pCl, d: [
      'y..............y',
      '.y............y.',
      '..y..........y..',
      '...yy......yy...',
      '.....yyyyyy.....',
      'RRR...BBB...GGG.',
      'RWR...BWB...G...',
      'RRR...BBB...G...',
      'RWR...BWB...G...',
      'RWR...BBB...GGG.',
      '................',
      '.......yy.......',
      '......yWWy......',
      '.......yy.......',
      '................',
      '................'] });
})();
