/* As roupas de aventura no desenho dela (docs/contratos/itens.md §8): cabeça (capacete ou chapéu), armadura e botas por
   cima dos moldes já montados (cabeça + corpo, 11 colunas, depois do aplicarVisual: vale para todo corte e roupa do
   Salão e para os de menino), nas 5 vistas, a pé e sentada (montada). Os moldes são dados de Reino.VESTES
   (conteudo/itens/vestes-a.js: cabeça; vestes-b.js: armaduras, botas, espadas e escudos). Quem chama:
   PA.mariana e PA.montada (pixelart-personagens.js, opcoes.vestes = { cabeca, armadura, botas } com ids).
   Registra PA._interno.aplicarVestes, PA._interno.chaveVestes, PA.espadaItem e PA.escudoItem.
   As letras dos moldes (minúsculas) são trocadas por letras próprias de cada parte (CORES): os três moldes se somam
   numa paleta só, sem uma cor pisar na outra. */
(function () {
  var PA = window.PA, I = PA._interno;
  var CORES = { cabeca: 'abcdefgh', armadura: 'ijklmnop', botas: 'qrstuvwy' };
  var PARTES = ['cabeca', 'armadura', 'botas'];
  // o papel de cada linha do corpo (a partir da 7ª), como em pixelart-mariana-visual.js
  var PAPEIS_PE = ['ombro', 'tronco', 'tronco', 'cintura', 'saia', 'perna', 'perna', 'pe'];
  var PAPEIS_SENTADA = ['ombro', 'tronco', 'cintura', 'saia', 'coxa', 'perna', 'pe'];
  // roupa clara e escura de todos os modelos (vestido, Salão e menino); cabelo (H L Z), pele (K) e laço (B) ficam
  var CLARAS = 'CWMOT', ESCURAS = 'DJQV', DETALHE = 'AG';
  var DE_FRENTE = { frente: true, diagFrente: true };

  // a parte vem do começo do id (itens.md §2: <tipo>-<nome>; capacete e chapéu dividem a cabeça)
  var PARTE_DO_TIPO = { capacete: 'cabeca', chapeu: 'cabeca', armadura: 'armadura', botas: 'botas', espada: 'espada', escudo: 'escudo' };
  // o molde de um id, só se for da parte pedida (id desconhecido, sem molde ou de outra parte: null)
  function molde(id, parte) {
    var V = window.Reino && window.Reino.VESTES;
    if (typeof id !== 'string' || !V || !Object.prototype.hasOwnProperty.call(V, id)) return null;
    return PARTE_DO_TIPO[id.split('-')[0]] === parte ? V[id] : null;
  }
  /** Chave das vestes que valem ('' = nenhuma: o desenho de sempre). @param {any} vestes @returns {string} */
  I.chaveVestes = function (vestes) {
    if (!vestes) return '';
    var ids = PARTES.map(function (p) { return molde(vestes[p], p) ? vestes[p] : ''; });
    return ids.join('') ? ids.join('+') : '';
  };
  // letras do molde → letras da parte, e a paleta já com as letras novas
  function trocarLetras(m, parte) {
    var mapa = {}, pal = {}, pool = CORES[parte];
    Object.keys(m.paleta || {}).forEach(function (l, i) { if (i < pool.length) { mapa[l] = pool[i]; pal[pool[i]] = m.paleta[l]; } });
    return { mapa: mapa, pal: pal };
  }
  function limites(r, ok) {
    var a = -1, b = -1;
    for (var i = 0; i < r.length; i++) if (ok(r[i])) { if (a < 0) a = i; b = i; }
    return [a, b];
  }
  function espelharLinhas(ls) { return ls.map(function (l) { return l.split('').reverse().join(''); }); }
  // o molde da cabeça para a vista: costas sem molde = o de frente espelhado; diagonais sem molde = o de lado
  function vistaCabeca(m, vista) {
    var v = m.vistas || {};
    if (v[vista]) return v[vista];
    if (vista === 'costas' && v.frente) return { linhas: espelharLinhas(v.frente.linhas), x: v.frente.x, y: v.frente.y };
    return v.lado || v.frente || null;
  }

  /* ---------- CABEÇA ---------- */
  function cabeca(g, m, vista, mapa, topo) {
    var v = vistaCabeca(m, vista);
    if (!v) return;
    // letras escondidas pelo chapéu (o laço): na borda somem, por dentro viram cabelo
    (m.esconde || []).forEach(function (letra) {
      for (var y = topo; y < topo + 7; y++) {
        var r = g[y], o = r.slice();
        for (var x = 0; x < r.length; x++) if (o[x] === letra) r[x] = x === 0 || x === r.length - 1 || o[x - 1] === '.' || o[x + 1] === '.' ? '.' : 'H';
      }
    });
    var x0 = v.x || 0, y0 = (v.y || 0) + topo;
    v.linhas.forEach(function (l, j) {
      var r = g[y0 + j];
      if (!r) return;
      for (var i = 0; i < l.length; i++) {
        var c = l[i], x = x0 + i;
        if (c === '.' || x < 0 || x >= r.length) continue;
        r[x] = c === '_' ? '.' : (mapa[c] || r[x]);
      }
    });
  }
  function topoCabeca(m, vistas) {
    var t = 0;
    vistas.forEach(function (vista) { var v = vistaCabeca(m, vista); if (v) t = Math.max(t, -(v.y || 0)); });
    return Math.min(4, t);
  }

  /* ---------- ARMADURA ---------- */
  // troca: { C: clara, D: escura, A: detalhe } (letras do molde); ombro, cinto, fivela, peito, mangas: letras;
  // saia: true = cobre também a linha da saia (com pregas: [a, b] alternadas)
  function armadura(g, m, sentada, vista, mapa, topo) {
    var papeis = sentada ? PAPEIS_SENTADA : PAPEIS_PE, t = m.troca || {};
    var iCin = topo + 7 + papeis.indexOf('cintura'), iSaia = topo + 7 + papeis.indexOf('saia');
    var fim = m.saia ? iSaia : iCin, frente = !!DE_FRENTE[vista];
    function cor(c) {
      if (t[c]) return t[c];
      if (CLARAS.indexOf(c) >= 0) return t.C;
      if (ESCURAS.indexOf(c) >= 0) return t.D || t.C;
      if (DETALHE.indexOf(c) >= 0) return t.A || t.D || t.C;
      return null;
    }
    var feito = {};
    for (var y = topo + 7; y <= fim; y++) {
      var r = g[y];
      feito[y] = [];
      for (var x = 0; x < r.length; x++) { var n = cor(r[x]); if (n) { r[x] = mapa[n]; feito[y].push(x); } }
    }
    function ponta(y) { var f = feito[y] || []; return f.length ? [f[0], f[f.length - 1]] : null; }
    if (m.mangas) { var r8 = g[topo + 8]; for (x = 0; x < r8.length; x++) if (r8[x] === 'K') r8[x] = mapa[m.mangas]; }
    if (m.ombro) { var po = ponta(topo + 7); if (po) { g[topo + 7][po[0]] = mapa[m.ombro]; g[topo + 7][po[1]] = mapa[m.ombro]; } }
    if (m.cinto) (feito[iCin] || []).forEach(function (x) { g[iCin][x] = mapa[m.cinto]; });
    var pc = ponta(iCin);
    if (m.fivela && frente && pc) g[iCin][Math.floor((pc[0] + pc[1]) / 2)] = mapa[m.fivela];
    if (m.peito && frente) {
      var yp = topo + 7 + papeis.indexOf('tronco'), pp = ponta(yp);
      if (pp) g[yp][Math.floor((pp[0] + pp[1]) / 2)] = mapa[m.peito];
    }
    if (m.saia && m.pregas) (feito[iSaia] || []).forEach(function (x) { g[iSaia][x] = mapa[m.pregas[x % 2]]; });
  }

  /* ---------- BOTAS ---------- */
  // troca: { S: o pé, K: o cano }. Nas 2 últimas linhas do corpo: o pé (a última) inteiro; na de cima, o que está em
  // cima de um pé (a perna) e o pé levantado do passo. Saia comprida (princesa) não vira bota: só a perna.
  function botas(g, m, sentada, mapa, topo) {
    var t = m.troca || {}, ult = topo + 7 + (sentada ? PAPEIS_SENTADA : PAPEIS_PE).length - 1;
    var pe = g[ult], cima = g[ult - 1], o = cima.slice();
    for (var x = 0; x < pe.length; x++) if (pe[x] !== '.') pe[x] = mapa[t.S];
    for (x = 0; x < cima.length; x++) {
      var c = o[x];
      if (c === '.') continue;
      if (c === 'S' || c === 'T') cima[x] = mapa[t.S];
      else if (sentada || ('CG'.indexOf(c) < 0 && pe[x] !== '.')) cima[x] = mapa[t.K || t.S];
    }
  }

  /** Veste cabeça, armadura e botas nas linhas da personagem (depois do aplicarVisual).
      @param {string[]} linhas @param {string} vista @param {boolean} sentada @param {any} vestes { cabeca, armadura, botas }
      @returns {{ linhas: string[], paletaExtra: Object<string, string>, topo: number }} topo = linhas a mais em cima */
  I.aplicarVestes = function (linhas, vista, sentada, vestes) {
    vestes = vestes || {};
    var mc = molde(vestes.cabeca, 'cabeca'), ma = molde(vestes.armadura, 'armadura'), mb = molde(vestes.botas, 'botas'), pal = {};
    // o topo é o maior das 5 vistas: virar não faz a cabeça pular
    var topo = mc ? topoCabeca(mc, PA.VISTAS || [vista]) : 0, w = linhas[0].length, vazia = new Array(w + 1).join('.');
    var g = [];
    for (var i = 0; i < topo; i++) g.push(vazia.split(''));
    linhas.forEach(function (l) { g.push(l.split('')); });
    function parte(m, nome, fazer) {
      if (!m) return;
      var tl = trocarLetras(m, nome);
      Object.assign(pal, tl.pal);
      fazer(tl.mapa);
    }
    parte(ma, 'armadura', function (mapa) { armadura(g, ma, sentada, vista, mapa, topo); });
    parte(mb, 'botas', function (mapa) { botas(g, mb, sentada, mapa, topo); });
    parte(mc, 'cabeca', function (mapa) { cabeca(g, mc, vista, mapa, topo); });
    return { linhas: g.map(function (r) { return r.join(''); }), paletaExtra: pal, topo: topo };
  };

  /* ---------- ESPADA E ESCUDO (na mão, nas arenas) ---------- */
  // o molde já traz o contorno (k), como a espada de hoje (sistemas/bosque-desenho.js): 5 × 11 e até 8 × 9
  function arma(id, parte) {
    var m = molde(id, parte);
    if (!m || !m.linhas) return null;
    var chave = 'vestes|' + parte + '|' + id;
    if (I.cache[chave]) return I.cache[chave];
    var c = PA.matriz(m.linhas, Object.assign({ k: I.CONTORNO }, m.paleta));
    I.cache[chave] = c;
    return c;
  }
  /** @param {string} id @returns {HTMLCanvasElement|null} a espada em pé (null: sem molde; quem desenha usa a de hoje) */
  PA.espadaItem = function (id) { return arma(id, 'espada'); };
  /** @param {string} id @returns {HTMLCanvasElement|null} o escudo de frente (null: sem molde, não desenha) */
  PA.escudoItem = function (id) { return arma(id, 'escudo'); };
})();
