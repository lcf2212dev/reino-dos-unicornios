/* Planetas: a base de sprite 'et' (ET fofinho de desenho infantil), com chaves para variar por planeta:
   pele, barriga, antenas (0-2, com bolinha 'antena'), olhos (1-3), orelhas, enfeite (+ enfeiteCor), cabelo,
   e as roupas opcionais macacao, cachecol, barba, jaleco, mochila, boina, lapis, xale (cores; sem elas o desenho
   não muda) e bengala (true ou cor). `planeta` dá o traço fixo dos 3 ETs de lá (crateras na Lua, poeira em
   Marte, anel em Saturno, faixas e mancha em Júpiter, nuvem em Vênus, gota em Netuno). `idade` muda a altura (ui.md §10.12): a criança
   perde 2 linhas da barriga e o idoso/adulto ganha 2 (barriga e perna), 4 px de diferença.
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

  // linhas do CORPO que cada idade usa (a cabeça é a mesma; as pernas, 20 e 21, não respiram)
  var LINHAS = { crianca: [], adulto: [] };
  for (var j0 = 0; j0 < CORPO.length; j0++) {
    if (j0 !== 17 && j0 !== 18) LINHAS.crianca.push(j0);
    LINHAS.adulto.push(j0);
    if (j0 === 18 || j0 === 20) LINHAS.adulto.push(j0);
  }

  // traço fixo de cada planeta, pintado por cima do corpo (só em linhas que as 3 idades têm)
  function pintarPlaneta(g, planeta, pele, som) {
    function r(x, y, w, h, c) { g.r(x, y, w, h, c); }
    function naPele(y, x0, x1, c) { for (var x = x0; x <= x1; x++) { var k = g.em(x, y); if (k === pele || k === som) g.p(x, y, c); } }
    if (planeta === 'lua') {   // crateras na cabeça
      var cr = Reino.NPCs.gradeSprite.esc(pele, 0.32), crl = Reino.NPCs.gradeSprite.cla(pele, 0.6);
      r(5, 6, 3, 2, cr); g.p(6, 6, Reino.NPCs.gradeSprite.esc(pele, 0.45)); r(5, 8, 3, 1, crl);
      r(12, 13, 2, 1, cr); g.p(12, 14, crl); g.p(13, 14, crl);
    } else if (planeta === 'marte') {   // nuvenzinha de poeira vermelha nos pés
      var po = '#d98a5a', pol = '#f2b98a';
      [[2, 21], [3, 21], [3, 20], [15, 21], [16, 21], [15, 20]].forEach(function (q) { g.p(q[0], q[1], po); });
      g.p(3, 20, pol); g.p(15, 20, pol);
    } else if (planeta === 'saturno') {   // anel em volta da cintura, de ponta a ponta
      r(0, 16, 19, 1, '#c9a0ff'); g.p(0, 16, '#9f78e0'); g.p(18, 16, '#9f78e0');
      [3, 8, 13].forEach(function (x) { g.p(x, 16, '#ecdcff'); });
    } else if (planeta === 'jupiter') {   // faixas de nuvem na cabeça e a grande mancha vermelha
      var fx = Reino.NPCs.gradeSprite.esc(pele, 0.3);
      naPele(6, 3, 15, fx); naPele(7, 2, 16, Reino.NPCs.gradeSprite.cla(pele, 0.35)); naPele(13, 4, 14, fx);
      r(3, 12, 3, 2, '#c8503a'); g.p(3, 12, '#e0785a');
    } else if (planeta === 'venus') {   // golinha de nuvem fofa
      var nv = '#fff4fb', nvs = '#e6d3ec';
      r(3, 14, 13, 1, nv); r(4, 13, 3, 1, nv); r(12, 13, 3, 1, nv); r(5, 15, 9, 1, nvs);
      g.p(9, 14, nvs); g.p(5, 13, '#ffffff'); g.p(13, 13, '#ffffff');
    } else if (planeta === 'netuno') {   // gota azul na testa
      g.p(9, 6, '#1f4fb0'); r(8, 7, 3, 2, '#1f4fb0'); g.p(8, 7, '#9fd8ff');
    }
  }

  function gradeEt(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    var pele = cru.pele || '#c9b6f0', som = G.esc(pele, 0.18), barriga = cru.barriga || G.cla(pele, 0.5);
    var bola = cru.antena || '#ffd34d', enf = cru.enfeiteCor || '#ff7eb6';
    var antenas = cru.antenas == null ? 2 : cru.antenas, olhos = cru.olhos || 2;
    var orelhas = cru.orelhas || 'nenhuma', enfeite = cru.enfeite || null;
    var crianca = o.idade === 'crianca', linhas = crianca ? LINHAS.crianca : LINHAS.adulto;
    var pisca = !!(quadro & 2);
    var OLHO = '#2a1838', BRILHO = '#ffffff', ROSA = '#ff9cc6', BOCA = '#8a2c4e';
    // pinta nas 22 linhas de sempre (sem respirar); depois cada idade copia as linhas dela para a grade final
    var gs = new G.Grade(CORPO.length, 0, 0);
    var g = { p: function (x, y, c) { gs.p(x, y, c); }, r: function (x, y, w, h, c) { gs.r(x, y, w, h, c); },
      apagar: function (x, y) { gs.apagar(x, y); }, em: function (x, y) { return gs.em(x, y); } };
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
    pintarPlaneta(g, cru.planeta, pele, som);

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
      var mc = cru.macacao; r(6, 16, 7, 4, mc); g.p(7, 15, mc); g.p(11, 15, mc); g.p(9, 16, G.cla(mc, 0.35));
    }
    if (cru.cachecol) {   // cachecol no pescoço, com a ponta caindo
      var cc = cru.cachecol; r(5, 14, 9, 1, cc); r(11, 15, 2, 2, cc); g.p(12, 16, G.esc(cc, 0.3)); g.p(7, 14, G.cla(cc, 0.4));
    }
    if (cru.xale) {   // xale de tricô nos ombros, com a pontinha na frente
      var xl = cru.xale, xls = G.esc(xl, 0.25), xll = G.cla(xl, 0.4);
      r(5, 14, 9, 1, xl); r(3, 15, 13, 1, xl); r(5, 16, 9, 1, xl); r(7, 17, 5, 1, xl); g.p(9, 18, xl);
      [4, 7, 10, 13].forEach(function (x) { g.p(x, 15, xll); }); g.p(9, 17, xls); g.p(3, 15, xls); g.p(15, 15, xls);
    }
    if (cru.jaleco) {   // jaleco de cientista aberto, com golinha
      var jl = cru.jaleco, jls = G.esc(jl, 0.15); r(4, 15, 2, 4, jl); r(13, 15, 2, 4, jl); g.p(6, 15, jls); g.p(12, 15, jls);
    }
    if (cru.mochila) {   // alças da mochila de exploradora e a mochilinha aparecendo do lado
      var mo = cru.mochila; r(6, 15, 1, 4, mo); r(12, 15, 1, 4, mo); r(15, 14, 3, 4, mo); g.p(16, 15, G.cla(mo, 0.4));
    }
    if (cru.boina) {   // boina caída de lado, com o cabinho
      var bo = cru.boina; r(5, 4, 10, 2, bo); r(7, 3, 6, 1, bo); g.p(10, 2, G.esc(bo, 0.3)); r(5, 5, 10, 1, G.esc(bo, 0.2));
    }
    if (cru.lapis) {   // lápis-pena na mãozinha (na criança, 1 linha acima: a barriga é mais curta)
      var ly = crianca ? -1 : 0;
      r(18, 12 + ly, 1, 5, cru.lapis); g.p(18, 17 + ly, '#3a2446'); g.p(18, 11 + ly, '#ff9cc6');
    }
    if (cru.bengala) {   // bengala na mão direita, com o cabo curvo
      var bg = cru.bengala === true ? '#8a5a3a' : cru.bengala; g.p(16, 14, bg); g.p(17, 14, bg); r(17, 15, 1, 7, bg); g.p(17, 21, G.esc(bg, 0.3));
    }
    if (cru.barba) { r(8, bY + 2, 3, 2, cru.barba); g.p(9, bY + 4, cru.barba); }   // barbicha

    // grade final: uma linha livre no topo (ao respirar a parte de cima sobe 1 px sem sair da grade)
    var pernas = linhas.indexOf(20);
    var g0 = new G.Grade(linhas.length + 1, pernas + 1, (quadro & 1) ? -1 : 0);
    linhas.forEach(function (ly2, jj) {
      for (var x = 0; x < G.W; x++) { var c = gs.em(x, ly2); if (c) g0.p(x, jj + 1, c); }
    });
    g0.fecharCorte();
    return { g: g0, busto: 17 };
  }
  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('et', gradeEt, {
    antenas: [0, 1, 2], olhos: [1, 2, 3], orelhas: ['coelho', 'caida', 'redonda', 'nenhuma'],
    enfeite: ['laco', 'oculos', 'cabelo-branco'], antena: 'cor', enfeiteCor: 'cor', macacao: 'cor', cachecol: 'cor', barba: 'cor',
    jaleco: 'cor', mochila: 'cor', boina: 'cor', lapis: 'cor', xale: 'cor',
    planeta: ['lua', 'marte', 'saturno', 'jupiter', 'venus', 'netuno'],
  });
})();
