/* Observatório, a arte do prédio, parte 3 de 4: a base de sprite 'robo' (o Robô Cosmo), registrada em
   Reino.NPCs. Só registra a função: nada de DOM nem canvas no carregamento. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var CONTORNO = '#3a2446';
  /* ================= ROBÔ COSMO (base 'robo') ================= */
  // 19 colunas, como os outros; linhas a partir do alto da grade (antena nas linhas livres de cima)
  var ROBO = [
    '...................',   // 0
    '........aAA........',   // 1  bolinha da antena
    '........AAA........',   // 2
    '.........s.........',   // 3  hastezinha
    '........sss........',   // 4
    '....LLLLLLLLLLL....',   // 5  cabeça
    '...LCCCCCCCCCCCc...',   // 6
    '..dCSSSSSSSSSSSCd..',   // 7  tela, com os parafusos-orelha
    '..dCSeESSSSSeESCd..',   // 8  olhos de luz
    '..dCSEESSSSSEESCd..',   // 9
    '...CSkSMSSSMSkSc...',   // 10 bochechas e sorriso
    '...CSSSSMMMSSSSc...',   // 11
    '...cCCCCCCCCCCcc...',   // 12
    '........sss........',   // 13 pescoço
    '...sLLLLLLLLLLLs...',   // 14 ombros
    '..CsCPPPPPPPPPCsC..',   // 15 painel de luzes
    '..CcCPrPyPgPhPCcC..',   // 16
    '..CcCPPPPPPPPPCcC..',   // 17
    '..DcCCCCCCCCCCCcD..',   // 18 mãozinhas
    '....cCCCCCCCCCc....',   // 19
    '......ss...ss......',   // 20 perninhas (não respiram)
    '......ss...ss......',   // 21
    '.....DDDD.DDDD.....',   // 22 pezinhos
  ];
  var ROBO_PISCA = {
    8: '..dCSSSSSSSSSSSCd..',
    9: '..dCSEESSSSSEESCd..',
  };

  function gradeRobo(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    var corpo = cru.corpo || '#b8c4d8', det = cru.detalhe || '#5fb4ff', ant = cru.antena || '#ff5c8a';
    var pisca = !!(quadro & 2);
    var pal = {
      C: corpo, c: G.esc(corpo, 0.2), L: G.cla(corpo, 0.4), s: G.esc(corpo, 0.38),
      S: '#2a2050', E: det, e: G.cla(det, 0.65), k: '#ff9cc6', M: G.cla(det, 0.35),
      P: '#3a3070', r: ant, y: '#ffe066', g: '#6fdc8c', h: det, D: G.esc(det, 0.15), d: ant,
      // a bolinha da antena acende no quadro de piscar
      A: pisca ? G.cla(ant, 0.55) : ant, a: pisca ? '#ffffff' : G.cla(ant, 0.5),
    };
    var corte = 20;
    var g = new G.Grade(ROBO.length, corte, (quadro & 1) ? -1 : 0);
    ROBO.forEach(function (linha, j) {
      if (pisca && ROBO_PISCA[j]) linha = ROBO_PISCA[j];
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, j, pal[k]); }
    });
    g.fecharCorte();
    return { g: g, busto: 16 };
  }

  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('robo', gradeRobo);

})();
