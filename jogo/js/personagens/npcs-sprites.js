/* NPCs: monta o sprite (dragãozinho, pessoa ou base registrada), com cache, e o retrato do balão.
   API: N.registrarBase, N.gradeSprite, N.sprite, N.retrato. Ver npcs.js. */
(function () {
  var N = window.Reino.NPCs, _n = window.Reino._npcs;
  var Grade = _n.Grade, W = _n.W, CX = _n.CX, TOPO = _n.TOPO, HY = _n.HY, BY = _n.BY, CONTORNO = _n.CONTORNO;
  var esc = _n.esc, cla = _n.cla, mis = _n.mis, params = _n.params, medidas = _n.medidas;
  var pintarAtras = _n.pintarAtras, pintarCorpo = _n.pintarCorpo, pintarCabeca = _n.pintarCabeca,
    pintarCabeloFrente = _n.pintarCabeloFrente, pintarRosto = _n.pintarRosto, pintarPalhaco = _n.pintarPalhaco,
    pintarChapeu = _n.pintarChapeu, pintarFrente = _n.pintarFrente;
  var cache = {};


  /* ---------- dragãozinho (Tostão) ---------- */
  var DRAGAO = [
    '......h.....h......',
    '.....hh.....hh.....',
    '.....CCCCsCCCC.....',
    '....CCCCCCCCCCC....',
    '...CCCCCCCCCCCCC...',
    '...CCWECCCCCWECC...',
    '...CCEECCCCCEECC...',
    '...CRCCCCCCCCCRC...',
    '....CCCnCCCnCCC....',
    '.....CCCmmmCCC.....',
    '.aa...cCCCCCc...aa.',
    'aAaa.CCBBBBBCC.aaAa',
    '.aAa.CBBoooBBC.aAa.',
    '..aaCKBoOOOoBKC.aa.',
    '....cCBBoooBBCc....',
    '....CCBBBBBBBCC.tt.',
    '....CCCBBBBBCCCtt..',
    '....cCCCCCCCCCttt..',
    '...FFFF.....FFFF...',
  ];
  var DRAGAO_PISCA = { 5: '...CCCCCCCCCCCCC...', 6: '...CCEECCCCCEECC...' };

  function gradeDragao(o, quadro) {
    var pal = {
      C: o.corpo || '#f0a04a', c: esc(o.corpo || '#f0a04a', 0.2), B: o.barriga || '#fff0c4', h: '#fff6e0',
      E: '#2a1838', W: '#ffffff', R: '#ff9cc6', n: esc(o.corpo || '#f0a04a', 0.35), m: '#b03a5a',
      a: o.asa || '#ff7a3d', A: esc(o.asa || '#ff7a3d', 0.25), o: '#ffd34d', O: '#e09a1e', K: o.corpo || '#f0a04a',
      t: o.corpo || '#f0a04a', F: esc(o.corpo || '#f0a04a', 0.28), s: '#ff6b8a',
    };
    if (o.moeda === false) { pal.o = pal.B; pal.O = pal.B; }
    var h = TOPO + DRAGAO.length, corte = TOPO + 13;
    var g = new Grade(h, corte, (quadro & 1) ? -1 : 0);
    DRAGAO.forEach(function (linha, j) {
      if (quadro & 2) linha = DRAGAO_PISCA[j] || linha;
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, TOPO + j, pal[k]); }
    });
    g.fecharCorte();
    return { g: g, busto: TOPO + 11 };
  }

  function gradePessoa(o, quadro) {
    var m = medidas(o);
    var g = new Grade(m.h, m.corte, (quadro & 1) ? -1 : 0);
    pintarAtras(g, o, m);
    pintarCorpo(g, o, m);
    pintarCabeca(g, o, !!(quadro & 2));
    pintarCabeloFrente(g, o);
    pintarRosto(g, o);
    pintarPalhaco(g, o);
    pintarChapeu(g, o);
    pintarFrente(g, o, m);
    g.fecharCorte();
    return { g: g, busto: BY + 3 };
  }

  function chaveSprite(s) { return JSON.stringify(s || {}); }

  /* bases novas de sprite (ex.: 'robo' do Observatório): fn(o, quadro) → { g: Grade, busto }.
     o = params() com o.cru = o sprite original; quadro: bit 1 respira, bit 2 pisca. */
  var BASES = {};
  N.registrarBase = function (nome, fn) { BASES[nome] = fn; };
  N.gradeSprite = { Grade: Grade, W: W, CX: CX, TOPO: TOPO, HY: HY, BY: BY, CONTORNO: CONTORNO,
    esc: function (c, t) { return esc(c, t); }, cla: function (c, t) { return cla(c, t); }, mis: function (a, b, t) { return mis(a, b, t); } };

  // quadro: bit 1 = respirando (corpo sobe 1 px), bit 2 = piscando. 0 e 1 são os quadros do contrato.
  function gerar(spriteDef, quadro) {
    quadro = quadro | 0;
    var k = 'npc|' + chaveSprite(spriteDef) + '|' + quadro;
    if (cache[k]) return cache[k];
    var o = params(spriteDef);
    var r = BASES[o.base] ? BASES[o.base](o, quadro) : o.base === 'dragao' ? gradeDragao(o, quadro) : gradePessoa(o, quadro);
    var c = window.PA.contornar(r.g.canvas(), CONTORNO);
    // primeira linha com desenho (para pôr o ícone de status em cima da cabeça)
    var dados = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, topo = 0;
    achar: for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (dados[(y * c.width + x) * 4 + 3]) { topo = y; break achar; }
    c.topo = topo;
    c.busto = r.busto + 1;   // +1 do contorno
    cache[k] = c;
    return c;
  }

  N.sprite = function (npc, quadro) { return gerar(npc.sprite, quadro); };

  // busto para o balão: quadrado, com a base no peito; quadro 1 = piscando
  N.retrato = function (npc, quadro) {
    var k = 'npcRetrato|' + chaveSprite(npc.sprite) + '|' + (quadro ? 1 : 0);
    if (cache[k]) return cache[k];
    var spr = gerar(npc.sprite, quadro ? 2 : 0);
    var lado = spr.width, fim = spr.busto + 1, ini = Math.max(0, Math.min(spr.topo, fim - lado));
    var alto = Math.min(lado, fim - ini);
    var c = window.PA.novoCanvas(lado, lado);
    c.getContext('2d').drawImage(spr, 0, ini, lado, alto, 0, lado - alto, lado, alto);
    cache[k] = c;
    return c;
  };

  _n.gerar = gerar;
})();
