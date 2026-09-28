/* Planetas: a base de sprite 'et' (ET fofinho de desenho infantil), com chaves para variar por planeta:
   pele, barriga, antenas (0-2, com bolinha 'antena'), olhos (1-3), orelhas, enfeite (+ enfeiteCor), cabelo,
   e as roupas opcionais macacao, cachecol e barba (cores; sem elas o desenho não muda).
   Só registra: nada de DOM nem canvas no carregamento. */
(function () {
  var Reino = window.Reino;
  // 19 colunas, como os outros NPCs; P = pele, p = sombra, B = barriga
  var CORPO = [
    '...................',   // 0  antenas e orelhas
    '...................',   // 1
    '...................',   // 2
    '...................',   // 3
    '...................',   // 4
    '......PPPPPPP......',   // 5  cabeça redonda
    '....PPPPPPPPPPP....',   // 6
    '...PPPPPPPPPPPPP...',   // 7
    '..PPPPPPPPPPPPPPP..',   // 8
    '..PPPPPPPPPPPPPPP..',   // 9  olhos
    '..PPPPPPPPPPPPPPp..',   // 10
    '..PPPPPPPPPPPPPPp..',   // 11 bochechas
    '...PPPPPPPPPPPPp...',   // 12 sorriso
    '....PPPPPPPPPPpp...',   // 13
    '.....PPPPPPPPPp....',   // 14
    '....PPBBBBBBBPp....',   // 15 barriga
    '..PPPBBBBBBBBBPpp..',   // 16 bracinhos
    '..PP.BBBBBBBBB.pp..',   // 17
    '.....PBBBBBBBPp....',   // 18
    '......PPPPPPPp.....',   // 19
    '......PP...Pp......',   // 20 perninhas (não respiram)
    '.....PPP...PPp.....',   // 21
  ];

  function gradeEt(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    var pele = cru.pele || '#c9b6f0', som = G.esc(pele, 0.18), barriga = cru.barriga || G.cla(pele, 0.5);
    var bola = cru.antena || '#ffd34d', enf = cru.enfeiteCor || '#ff7eb6';
    var antenas = cru.antenas == null ? 2 : cru.antenas, olhos = cru.olhos || 2;
    var orelhas = cru.orelhas || 'nenhuma', enfeite = cru.enfeite || null;
    var pisca = !!(quadro & 2);
    var OLHO = '#2a1838', BRILHO = '#ffffff', ROSA = '#ff9cc6', BOCA = '#8a2c4e';
    // uma linha livre no topo: ao respirar a parte de cima sobe 1 px sem sair da grade
    var g0 = new G.Grade(CORPO.length + 1, 21, (quadro & 1) ? -1 : 0);
    var g = { p: function (x, y, c) { g0.p(x, y + 1, c); }, r: function (x, y, w, h, c) { g0.r(x, y + 1, w, h, c); },
      apagar: function (x, y) { g0.apagar(x, y + 1); } };
    var pal = { P: pele, p: som, B: barriga };
    function r(x, y, w, h, c) { g.r(x, y, w, h, c); }

    // orelhas atrás da cabeça
    if (orelhas === 'coelho') {
      [3, 13].forEach(function (x) { r(x, 1, 3, 5, pele); r(x + 1, 0, 1, 1, pele); r(x + 1, 2, 1, 3, ROSA); });
    } else if (orelhas === 'caida') {   // de coelho, caídas para os lados
      [[0, 1], [16, -1]].forEach(function (a) { var x = a[0]; r(x, 7, 3, 5, som); r(x + 1, 12, 1, 1, som); r(x + 1, 8, 1, 3, ROSA); });
    } else if (orelhas === 'redonda') {
      [2, 14].forEach(function (x) { r(x, 4, 3, 3, pele); r(x + 1, 5, 1, 1, ROSA); g.apagar(x + (x < 9 ? 0 : 2), 4); });
    }
    // antenas com bolinha
    function bolinha(x, w) { r(x, 0, w, 2, bola); g.p(x, 0, G.cla(bola, 0.55)); }
    if (antenas === 1) { r(9, 2, 1, 3, som); bolinha(8, 3); }
    else if (antenas === 2) { r(7, 2, 1, 3, som); r(11, 2, 1, 3, som); bolinha(6, 2); bolinha(11, 2); }
    // corpo e cabeça
    CORPO.forEach(function (linha, j) {
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, j, pal[k]); }
    });
    // olhos (piscando: só um risquinho)
    function olho(x, y, w, h) {
      if (pisca) { r(x, y + h - 1, w, 1, OLHO); return; }
      r(x, y, w, h, OLHO); g.p(x, y, BRILHO);
    }
    if (olhos === 1) {
      if (pisca) r(7, 10, 5, 1, OLHO);
      else { r(7, 8, 5, 4, BRILHO); g.p(7, 8, pele); g.p(11, 8, pele); g.p(7, 11, pele); g.p(11, 11, pele); r(8, 9, 3, 2, OLHO); g.p(8, 9, BRILHO); }
    } else if (olhos === 3) { olho(5, 9, 2, 2); olho(9, 8, 1, 2); olho(12, 9, 2, 2); }
    else { olho(5, 9, 2, 2); olho(12, 9, 2, 2); }
    // bochechas e sorriso
    g.p(4, 11, ROSA); g.p(14, 11, ROSA);
    var bY = olhos === 1 ? 12 : 11;   // o olhão desce o sorriso
    g.p(7, bY, BOCA); g.p(11, bY, BOCA); r(8, bY + 1, 3, 1, BOCA);

    // enfeites
    if (enfeite === 'laco') {
      [11, 12, 14, 15].forEach(function (x) { g.p(x, 4, enf); g.p(x, 6, enf); });
      r(11, 5, 5, 1, enf); g.p(13, 5, G.esc(enf, 0.3));
    } else if (enfeite === 'oculos') {
      var aro = cru.enfeiteCor || '#8a6a3a';
      if (olhos === 1) { r(6, 7, 7, 1, aro); r(6, 12, 7, 1, aro); r(6, 8, 1, 4, aro); r(12, 8, 1, 4, aro); }
      else { [4, 11].forEach(function (x) { r(x, 8, 4, 1, aro); r(x, 11, 4, 1, aro); r(x, 9, 1, 2, aro); r(x + 3, 9, 1, 2, aro); }); if (olhos !== 3) r(8, 9, 3, 1, aro); }   // 3 olhos: sem ponte, o do meio fica à mostra
    }
    if (enfeite === 'cabelo-branco' || cru.cabelo) {   // topete fofo (com 'cabelo', junta com outro enfeite)
      var br = cru.cabelo || '#f4f2fa', brs = G.esc(br, 0.15);
      r(6, 4, 7, 2, br); [5, 8, 11].forEach(function (x) { r(x, 3, 3, 1, br); }); r(7, 2, 5, 1, br);
      g.p(7, 5, brs); g.p(10, 5, brs);
    }
    if (cru.macacao) {   // macacão de peitilho (engenheira)
      var mc = cru.macacao; r(6, 16, 7, 3, mc); g.p(7, 15, mc); g.p(11, 15, mc); g.p(9, 17, G.esc(mc, 0.35));
    }
    if (cru.cachecol) {   // cachecol no pescoço, com a ponta caindo
      var cc = cru.cachecol; r(5, 14, 9, 1, cc); r(11, 15, 2, 2, cc); g.p(12, 16, G.esc(cc, 0.3)); g.p(7, 14, G.cla(cc, 0.4));
    }
    if (cru.barba) { r(8, bY + 2, 3, 2, cru.barba); g.p(9, bY + 4, cru.barba); }   // barbicha
    g0.fecharCorte();
    return { g: g0, busto: 17 };
  }
  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('et', gradeEt, {
    antenas: [0, 1, 2], olhos: [1, 2, 3], orelhas: ['coelho', 'caida', 'redonda', 'nenhuma'],
    enfeite: ['laco', 'oculos', 'cabelo-branco'], antena: 'cor', enfeiteCor: 'cor', macacao: 'cor', cachecol: 'cor', barba: 'cor',
  });
})();
