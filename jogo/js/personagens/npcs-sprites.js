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
  var DRAGAO_BOCA = { 10: '.aa...cCmTmCc...aa.' };   // boca aberta (retrato falando): T = língua
  var ASA = /[aA]/;

  function gradeDragao(o, quadro) {
    var pal = {
      C: o.corpo || '#f0a04a', c: esc(o.corpo || '#f0a04a', 0.2), B: o.barriga || '#fff0c4', h: '#fff6e0',
      E: '#2a1838', W: '#ffffff', R: '#ff9cc6', n: esc(o.corpo || '#f0a04a', 0.35), m: '#b03a5a',
      a: o.asa || '#ff7a3d', A: esc(o.asa || '#ff7a3d', 0.25), o: '#ffd34d', O: '#e09a1e', K: o.corpo || '#f0a04a',
      t: o.corpo || '#f0a04a', F: esc(o.corpo || '#f0a04a', 0.28), s: '#ff6b8a', T: '#ff7e9e',
    };
    if (o.moeda === false) { pal.o = pal.B; pal.O = pal.B; }
    var h = TOPO + DRAGAO.length, corte = TOPO + 13;
    var g = new Grade(h, corte, (quadro & 1) ? -1 : 0);
    // ação (bit 4): as asas sobem 1 px e, na 2ª pose (bit 8), voltam: bate as asas
    var asaSobe = (quadro & 4) && !(quadro & 8) ? -1 : 0;
    DRAGAO.forEach(function (linha, j) {
      if (quadro & 2) linha = DRAGAO_PISCA[j] || linha;
      if (quadro & 16) linha = DRAGAO_BOCA[j] || linha;
      for (var i = 0; i < linha.length; i++) {
        var k = linha[i];
        if (k !== '.') g.p(i, TOPO + j + (asaSobe && ASA.test(k) ? asaSobe : 0), pal[k]);
      }
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

  // a chave de cada objeto de sprite sai uma vez só (o interiores/padrao.js troca o objeto inteiro, nunca muda dentro)
  var chaves = typeof WeakMap === 'function' ? new WeakMap() : null;
  function chaveSprite(s) {
    if (!chaves || !s || typeof s !== 'object') return JSON.stringify(s || {});
    var k = chaves.get(s);
    if (k === undefined) { k = JSON.stringify(s); chaves.set(s, k); }
    return k;
  }
  // sprite pronto por objeto de sprite e quadro, sem montar a chave em texto a cada desenho
  var prontos = chaves ? new WeakMap() : null;

  /* bases novas de sprite (ex.: 'robo' do Observatório): fn(o, quadro) → { g: Grade, busto }.
     o = params() com o.cru = o sprite original; quadro: bit 1 respira, bit 2 pisca.
     chaves (opcional): { chave: 'cor' | 'sim' | [valores] } que a base lê de o.cru (entram em N.OPCOES_SPRITE). */
  var BASES = {};
  N.registrarBase = function (nome, fn, chaves) {
    BASES[nome] = fn;
    if (N.OPCOES_SPRITE.base.indexOf(nome) < 0) N.OPCOES_SPRITE.base.push(nome);
    Object.keys(chaves || {}).forEach(function (k) { if (!N.OPCOES_SPRITE[k]) N.OPCOES_SPRITE[k] = chaves[k]; });
  };
  N.gradeSprite = { Grade: Grade, W: W, CX: CX, TOPO: TOPO, HY: HY, BY: BY, CONTORNO: CONTORNO,
    esc: function (c, t) { return esc(c, t); }, cla: function (c, t) { return cla(c, t); }, mis: function (a, b, t) { return mis(a, b, t); } };

  /* ---------- ação e boca (D4-17): por cima do que a base pintou ---------- */
  var BOCA = '#8a2c4e', LINGUA = '#ff7e9e';
  // pessoa e fada acenam: a mão direita sai do lado do corpo e sobe até o queixo; a 2ª pose (bit 8) balança a mão
  function aceno(g, o, pose2) {
    var m = medidas(o), x = CX + 4, b = BY;
    var manga = g.em(x, b + 1) || o.roupa, pele = o.pele;
    g.c[m.maos * g.w + x] = g.em(x, m.maos - 1) || manga;   // a mão de baixo some (vira manga)
    // braço em diagonal para fora (longe do cabelo e do rosto); a mão de 2 px, e na 2ª pose 1 px mais para fora
    g.p(x + 1, b, manga); g.p(x + 2, b - 1, manga);
    var hx = pose2 ? x + 4 : x + 3;
    g.p(hx, b - 2, pele); g.p(hx, b - 3, pele);
    if (pose2) g.p(x + 3, b - 2, manga);
  }
  // boca aberta: pessoa e fada pela posição da boca; outra base, pelos pixels da cor de boca de sempre
  function abrirBoca(g, o) {
    if (o.base === 'pessoa' || o.base === 'fada') {
      if (!o.boca) return;
      var y = HY + 6;
      if (o.barba || o.bigode) { g.p(CX, y, BOCA); return; }
      g.p(CX - 1, y - 1, BOCA); g.p(CX, y - 1, BOCA); g.p(CX + 1, y - 1, BOCA); g.p(CX, y, LINGUA);
      return;
    }
    // base registrada (ET e cia.): a caixa dos pixels da boca; a linha de cima enche e o meio de baixo vira língua
    var x0 = 99, x1 = -1, y0 = 99, y1 = -1;
    for (var yy = 0; yy < g.h; yy++) for (var xx = 0; xx < g.w; xx++) {
      var k = g.em(xx, yy);
      if (k && k.toLowerCase() === BOCA) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy); }
    }
    if (x1 < 0 || y1 - y0 > 2 || x1 - x0 > 6) return;   // sem boca (ou não é boca): fica como está
    var meio = Math.round((x0 + x1) / 2);
    for (var i = x0; i <= x1; i++) g.c[y0 * g.w + i] = BOCA;
    if (y1 === y0) { y1 = y0 + 1; g.c[y1 * g.w + meio - 1] = BOCA; g.c[y1 * g.w + meio + 1] = BOCA; }
    g.c[y1 * g.w + meio] = LINGUA;
  }

  /* quadro: bit 1 = respirando (corpo sobe 1 px), bit 2 = piscando (0 e 1 são os quadros do contrato);
     bit 4 = ação (pessoa acena, o dragãozinho bate as asas; as outras bases pulam no N.desenhar) e bit 8 a
     2ª pose dela; bit 16 = boca aberta (retrato falando). A ação não respira. */
  function gerar(spriteDef, quadro) {
    quadro = quadro | 0;
    if (quadro & 4) quadro &= ~1;
    var porQuadro = prontos && spriteDef && typeof spriteDef === 'object' ? prontos.get(spriteDef) : null;
    if (porQuadro && porQuadro[quadro]) return porQuadro[quadro];
    var k = 'npc|' + chaveSprite(spriteDef) + '|' + quadro;
    if (cache[k]) return guardar(spriteDef, quadro, cache[k]);
    var o = params(spriteDef);
    var r = BASES[o.base] ? BASES[o.base](o, quadro) : o.base === 'dragao' ? gradeDragao(o, quadro) : gradePessoa(o, quadro);
    if ((quadro & 4) && (o.base === 'pessoa' || o.base === 'fada')) aceno(r.g, o, !!(quadro & 8));
    if ((quadro & 16) && o.base !== 'dragao') abrirBoca(r.g, o);
    var c = window.PA.contornar(r.g.canvas(), CONTORNO);
    // primeira linha com desenho (para pôr o ícone de status em cima da cabeça)
    var dados = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, topo = 0;
    achar: for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (dados[(y * c.width + x) * 4 + 3]) { topo = y; break achar; }
    c.topo = topo;
    c.busto = r.busto + 1;   // +1 do contorno
    cache[k] = c;
    return guardar(spriteDef, quadro, c);
  }
  function guardar(spriteDef, quadro, c) {
    if (!prontos || !spriteDef || typeof spriteDef !== 'object') return c;
    var porQuadro = prontos.get(spriteDef);
    if (!porQuadro) prontos.set(spriteDef, porQuadro = []);
    porQuadro[quadro] = c;
    return c;
  }

  N.sprite = function (npc, quadro) { return gerar(npc.sprite, quadro); };

  /* retrato do balão (arte.md §10.6): de 1 px acima do topo (chapéu e antena inteiros) até o peito; se a cabeça (do
     topo ao queixo, 3 linhas acima do busto) passar de 80 % da altura, entram mais linhas de ombro. Largura: 19
     colunas no meio do sprite (a cabeça com 1 px de margem dos lados); o que tiver desenho mais para fora nessas
     linhas (orelha, anel de Saturno) alarga o quadro até ele + 1 px de margem, sem cortar. O recorte sai do quadro 0,
     para os 3 quadros ficarem alinhados. quadro 1 = piscando, 2 = boca aberta (falando) */
  var QUADRO_RETRATO = [0, 2, 16], LARGURA_RETRATO = 19, CABECA_MAX = 0.8;
  N.retrato = function (npc, quadro) {
    quadro = QUADRO_RETRATO[quadro] === undefined ? (quadro ? 1 : 0) : quadro;
    var k = 'npcRetrato|' + chaveSprite(npc.sprite) + '|' + quadro;
    if (cache[k]) return cache[k];
    var spr = gerar(npc.sprite, QUADRO_RETRATO[quadro]), base = gerar(npc.sprite, 0);
    var ini = base.topo - 1, cabeca = base.busto - 3 - base.topo + 1;
    var fim = Math.min(base.height, Math.max(base.busto + 1, ini + Math.ceil(cabeca / CABECA_MAX)));
    var sy = Math.max(0, ini), meio = Math.floor(base.width / 2), metade = (LARGURA_RETRATO - 1) / 2;
    var dados = base.getContext('2d').getImageData(0, sy, base.width, fim - sy).data;
    for (var i = 0; i < dados.length / 4; i++) if (dados[i * 4 + 3]) metade = Math.max(metade, Math.abs(i % base.width - meio) + 1);
    var lado = 2 * metade + 1, sx = meio - metade, dx = 0;
    if (sx < 0) { dx = -sx; sx = 0; }
    var larg = Math.min(lado - dx, spr.width - sx), c = window.PA.novoCanvas(lado, fim - ini);
    c.getContext('2d').drawImage(spr, sx, sy, larg, fim - sy, dx, sy - ini, larg, fim - sy);
    c.personagem = true;   // o balão amplia a 4 (claude.js), mesmo com o quadro mais largo
    cache[k] = c;
    return c;
  };

  _n.gerar = gerar;
})();
