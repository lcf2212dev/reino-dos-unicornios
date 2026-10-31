/* Pixel art do unicórnio: paleta pelas cores do unicórnio, PA.unicornio (corpo, asas, brilhos,
   enfeites e contorno, com cache; lugarDoEnfeite põe o enfeite o mínimo para dentro do quadro e
   enfeitesNaFrente diz quais a montada repinta por cima da cavaleira) e o teto do cache por combinação de enfeites (usarCombo, que
   PA.montada também usa via PA._interno.usarCombo). Moldes em pixelart-unicornio-moldes.js. */
(function () {
  var PA = window.PA, I = PA._interno;
  var CONTORNO = I.CONTORNO, cache = I.cache, UNI = I.UNI, ENFEITES = PA.ENFEITES_MONTARIA;
  var misturar = PA.cor.misturar, escurecer = PA.cor.escurecer, clarear = PA.cor.clarear;
  var novoCanvas = PA.novoCanvas, pintarMatriz = PA.pintarMatriz, contornar = PA.contornar;

  function paletaUnicornio(def, estagio) {
    var corpo = def.cores.corpo;
    var crina = def.cores.crina;
    var chifre = def.cores.chifre || '#ffd34d';
    var p = {
      b: corpo, s: escurecer(corpo, 0.22), w: clarear(corpo, 0.55),
      m: crina[0], n: crina[1] || crina[0], r: crina[2] || crina[1] || crina[0],
      h: chifre, g: escurecer(chifre, 0.25), k: clarear(chifre, 0.45),
      e: '#2a1838', l: '#ffffff', p: '#ff9cc6', o: '#6b3b5a', q: misturar(corpo, '#ff9cc6', 0.22),
      f: escurecer(def.cores.casco || corpo, 0.3),
      W: def.cores.asa || '#ffffff', X: escurecer(def.cores.asa || '#ffffff', 0.18),
      // meia-sombra, íris e cílio (moldes e pixelart-unicornio-acabamento.js); brilho (x t u) e sombra (y z v) das 3 cores da crina
      d: escurecer(corpo, 0.12), i: misturar(crina[1] || crina[0], '#2a1838', 0.5), c: '#2a1838',
      x: clarear(crina[0], 0.5), t: clarear(crina[1] || crina[0], 0.5), u: clarear(crina[2] || crina[1] || crina[0], 0.5),
      y: escurecer(crina[0], 0.2), z: escurecer(crina[1] || crina[0], 0.2), v: escurecer(crina[2] || crina[1] || crina[0], 0.2),
    };
    if (estagio === 0) { p.h = clarear(chifre, 0.35); } // bebê: chifre bem pequenino
    if (estagio === 3) p.f = CASCO_ADULTO;               // adulto: casco dourado (o jovem, não)
    p.F = clarear(p.f, 0.35);
    return p;
  }

  var CASCO_ADULTO = '#e8a92e';

  // Cada combinação de enfeites gera os seus sprites (uns 13 canvas). Guardamos só as
  // TETO_COMBOS combinações usadas por último; a sem enfeite fica sempre. Uma que sai é
  // redesenhada na hora, no mesmo quadro, se voltar.
  var combosUni = new Map();   // enf.join('+') -> chaves do cache (a usada por último no fim)
  var TETO_COMBOS = 24, ultimoCombo = '';
  function usarCombo(combo, chave) {
    if (!combo) return;
    var chaves = combosUni.get(combo);
    if (chaves && combo === ultimoCombo && !chave) return;
    if (chaves) combosUni.delete(combo); else chaves = [];
    if (chave) chaves.push(chave);
    combosUni.set(combo, chaves);
    ultimoCombo = combo;
    var it = combosUni.keys();
    while (combosUni.size > TETO_COMBOS) {
      var velho = it.next().value;
      if (velho === combo) continue;
      combosUni.get(velho).forEach(function (k) { delete cache[k]; });
      combosUni.delete(velho);
    }
  }

  // onde o enfeite vai neste molde: desenho próprio (o do bebê, se houver) ou âncora + dx/dy; e, se passaria
  // da borda do quadro (o canvas cortaria), o mínimo para dentro. null = a vista não mostra o encaixe
  function lugarDoEnfeite(molde, nome, e, estagio, w, h) {
    var d = molde.enfeites && molde.enfeites[nome];
    if (d && estagio === 0 && d.bebe) d = d.bebe;
    if (!d) {
      var a = molde.ancoras[e.ancora];
      if (!a) return null;
      d = { linhas: e.linhas, x: a[0] + e.dx, y: a[1] + e.dy };
    }
    var x0 = 99, x1 = -99, y0 = 99, y1 = -99;
    d.linhas.forEach(function (l, j) {
      for (var i = 0; i < l.length; i++) if (l[i] !== '.') { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
    });
    var dx = Math.max(0, -(d.x + x0)) - Math.max(0, d.x + x1 - (w - 1));
    var dy = Math.max(0, -(d.y + y0)) - Math.max(0, d.y + y1 - (h - 1));
    return { linhas: d.linhas, x: d.x + dx, y: d.y + dy, naFrente: !!d.naFrente };
  }
  // retângulo [x0, y0, x1, y1] de 1 pixel pintado do desenho
  function umPixel(d) {
    for (var j = 0; j < d.linhas.length; j++) for (var i = 0; i < d.linhas[j].length; i++) {
      if (d.paleta[d.linhas[j][i]]) return [d.x + i, d.y + j, d.x + i, d.y + j];
    }
    return null;
  }

  /* Enfeites em camadas por encaixe: cauda, pescoço, orelha, cabeça, olho e chifre, cada um por cima dos de antes
     (a ordem em que foram postos não conta). Onde um cobre outro, 1 px de contorno em volta dele separa os dois;
     o chifre do corpo é repintado por cima dos enfeites da orelha e da cabeça (a coroa e o laço não o tampam, com
     1 px de contorno dos lados), menos quando um enfeite é feito para cobri-lo (cobreChifre: o capacete) ou está
     quase todo em cima dele (a antena: QUASE_NO_CHIFRE); os do chifre vão por último. Pinta em ctx e devolve os que a montada repinta
     por cima da cavaleira ({ linhas, paleta, x, y }), já com as camadas resolvidas. */
  var ORDEM_CAMADAS = ['cauda', 'pescoco', 'orelha', 'cabeca', 'olho', 'chifre'];
  // fração dos pixels do enfeite em cima do chifre a partir da qual ele é feito para ficar ali (antena, chapéu de cone)
  var QUASE_NO_CHIFRE = 0.4;
  function pintarEnfeites(ctx, molde, enf, estagio, w, h, corpoLinhas, pal) {
    var lista = [];
    enf.forEach(function (nome, i) {
      var e = ENFEITES[nome];
      if (!e) return;
      var d = lugarDoEnfeite(molde, nome, e, estagio, w, h);
      if (d) lista.push({ e: e, d: d, i: i, o: ORDEM_CAMADAS.indexOf(e.ancora) });
    });
    if (!lista.length) return [];
    lista.sort(function (a, b) { return a.o - b.o || a.i - b.i; });
    var cel = new Array(w * h);   // { cor, donos: índices em lista, o de cima primeiro }
    function dentro(x, y) { return x >= 0 && y >= 0 && x < w && y < h; }
    function pixels(d, paleta) {
      var r = [];
      d.linhas.forEach(function (l, j) { for (var k = 0; k < l.length; k++) if (paleta[l[k]] && dentro(d.x + k, d.y + j)) r.push([d.x + k, d.y + j, paleta[l[k]]]); });
      return r;
    }
    // pinta os pixels px como do dono n; onde cobriu outro enfeite, contorno nos vizinhos desse outro (lados = só esq./dir./cima)
    function camada(n, px, lados) {
      var cobertos = {};
      px.forEach(function (p) {
        var k = p[1] * w + p[0], velho = cel[k];
        if (velho && velho.donos[0] !== n) cobertos[velho.donos[0]] = true;
        cel[k] = { cor: p[2], donos: [n].concat(velho ? velho.donos : []) };
      });
      var meu = {};
      px.forEach(function (p) { meu[p[1] * w + p[0]] = true; });
      var viz = lados ? [[-1, 0], [1, 0], [0, -1]] : [[-1, 0], [1, 0], [0, -1], [0, 1]];
      px.forEach(function (p) {
        viz.forEach(function (v) {
          var x = p[0] + v[0], y = p[1] + v[1], k = y * w + x, c = dentro(x, y) && cel[k];
          if (!c || meu[k] || !cobertos[c.donos[0]]) return;
          cel[k] = { cor: CONTORNO, donos: [n].concat(c.donos) };
        });
      });
    }
    var cobreChifre = lista.some(function (l) { return l.e.cobreChifre; });
    var chifre = [];
    corpoLinhas.forEach(function (l, y) { for (var x = 0; x < l.length; x++) if ('hgk'.indexOf(l[x]) >= 0 && pal[l[x]]) chifre.push([x, y, pal[l[x]]]); });
    var noChifre = {};
    chifre.forEach(function (p) { noChifre[p[1] * w + p[0]] = true; });
    var chifrePintado = false;
    function pintarChifre() {
      chifrePintado = true;
      if (cobreChifre) return;
      // só onde um enfeite da orelha ou da cabeça tampou o chifre (e esse enfeite não está quase todo em cima dele)
      var tampados = chifre.filter(function (p) {
        var c = cel[p[1] * w + p[0]];
        return c && !lista[c.donos[0]].sobreOChifre && (lista[c.donos[0]].e.ancora === 'orelha' || lista[c.donos[0]].e.ancora === 'cabeca');
      });
      if (tampados.length) camada(-1, tampados, true);
    }
    lista.forEach(function (l, n) {
      if (l.e.ancora === 'chifre' && !chifrePintado) pintarChifre();
      var px = pixels(l.d, l.e.paleta);
      var sobre = px.filter(function (p) { return noChifre[p[1] * w + p[0]]; }).length;
      l.sobreOChifre = sobre >= px.length * QUASE_NO_CHIFRE;
      camada(n, px, false);
    });
    if (!chifrePintado) pintarChifre();
    // o chifre repintado entra na lista como dono -1: guardamos a camada para a montada
    var ancorasNaFrente = molde.enfeitesNaFrente || [];
    var naFrente = lista.map(function (l) { return !!(l.d.naFrente || ancorasNaFrente.indexOf(l.e.ancora) >= 0); });
    var linhasNF = [], paletaNF = {}, letras = {}, nLetras = 0, algum = false;
    for (var y = 0; y < h; y++) {
      var linha = '';
      for (var x = 0; x < w; x++) {
        var c = cel[y * w + x];
        if (c) { ctx.fillStyle = c.cor; ctx.fillRect(x, y, 1, 1); }
        var vai = c && c.donos.some(function (n) { return n >= 0 && naFrente[n]; });
        if (!vai) { linha += '.'; continue; }
        if (!letras[c.cor]) { letras[c.cor] = String.fromCharCode(65 + nLetras++); paletaNF[letras[c.cor]] = c.cor; }
        linha += letras[c.cor];
        algum = true;
      }
      linhasNF.push(linha);
    }
    return algum ? [{ linhas: linhasNF, paleta: paletaNF, x: 0, y: 0 }] : [];
  }

  /* Pulo (quadro PULO): as patas encolhem, cada casco 1 px mais alto e 1 px para o meio do corpo (joelho dobrado),
     a partir das pernas paradas do molde; o sprite continua da mesma altura (a última linha fica vazia). */
  var PULO = 3, pernasDoPulo = new WeakMap();
  function pernasPulo(molde) {
    var q = molde.pernas[0], r = pernasDoPulo.get(molde);
    if (r) return r;
    var g = q.map(function (l) { return l.split(''); }), cascos = [], x0 = 99, x1 = -1;
    q.forEach(function (l, y) { for (var x = 0; x < l.length; x++) if (l[x] === 'f') { cascos.push([x, y]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); } });
    var meio = (x0 + x1) / 2;
    cascos.forEach(function (c) {
      g[c[1]][c[0]] = '.';
      if (c[1] > 0 && 'bdsw'.indexOf(g[c[1] - 1][c[0]]) >= 0) g[c[1] - 1][c[0]] = '.';
    });
    cascos.forEach(function (c) { if (c[1] > 0) g[c[1] - 1][c[0] + (c[0] < meio ? 1 : c[0] > meio ? -1 : 0)] = 'f'; });
    r = g.map(function (l) { return l.join(''); });
    pernasDoPulo.set(molde, r);
    return r;
  }

  /* Pose cansada (fome ou sede baixa: Cuidados.fatorVelocidade() < 1): a cabeça desce 1 px (o retângulo
     molde.cansado.cabeca, com os enfeites da orelha, olho, cabeça e chifre), as pontas das orelhas caem
     (molde.cansado.orelhas: [x, y, letra] do molde parado, já contando a descida) e os olhos ficam meio fechados.
     De frente ela senta na cabeça (cansado.cavaleira): desce junto. */
  var DA_CABECA = { orelha: true, olho: true, cabeca: true, chifre: true };
  var moldesCansados = new WeakMap();
  function dentroDe(r, x, y) { return x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]; }
  function moldeCansado(molde) {
    var m = moldesCansados.get(molde);
    if (m) return m;
    var c = molde.cansado, r = c.cabeca, ancoras = {}, enfeites = {};
    Object.keys(molde.ancoras).forEach(function (k) {
      var a = molde.ancoras[k];
      ancoras[k] = a && DA_CABECA[k] ? [a[0], a[1] + 1] : a;
    });
    function descer(d) { return Object.assign({}, d, { y: d.y + 1 }, d.bebe ? { bebe: descer(d.bebe) } : {}); }
    Object.keys(molde.enfeites || {}).forEach(function (k) {
      var e = ENFEITES[k], d = molde.enfeites[k];
      enfeites[k] = e && DA_CABECA[e.ancora] ? descer(d) : d;
    });
    var nf = molde.naFrente;
    m = Object.assign({}, molde, {
      ancoras: ancoras, enfeites: enfeites,
      brilhos: molde.brilhos.map(function (b) { return dentroDe(r, b[0], b[1]) ? [b[0], b[1] + 1] : b; }),
      naFrente: nf ? [nf[0], nf[1] + 1, nf[2], nf[3] + 1] : nf,
      cavaleira: c.cavaleira ? [molde.cavaleira[0], molde.cavaleira[1] + 1] : molde.cavaleira,
    });
    moldesCansados.set(molde, m);
    return m;
  }
  function cansar(linhas, c) {
    var r = c.cabeca, g = linhas.map(function (l) { return l.split(''); });
    for (var y = Math.min(r[3] + 1, g.length - 1); y >= r[1]; y--) {
      for (var x = r[0]; x <= r[2]; x++) g[y][x] = y > r[1] ? linhas[y - 1][x] : '.';
    }
    (c.orelhas || []).forEach(function (o) { var l = g[o[1] + 1]; if (l && o[0] < l.length) l[o[0]] = o[2]; });
    // olhos meio fechados: a linha do brilho do olho vira pálpebra (a cor da sombra do pelo)
    g.forEach(function (l) {
      for (var x = 0; x < l.length; x++) if (l[x] === 'l') {
        l[x] = 's';
        if (l[x - 1] === 'e') l[x - 1] = 's';
        if (l[x + 1] === 'e') l[x + 1] = 's';
      }
    });
    return g.map(function (l) { return l.join(''); });
  }

  // estagio: 0 bebê, 1 pequeno, 2 jovem, 3 adulto • quadro: 0 parado, 1 e 2 passos, PULO (3) patas encolhidas
  // • opcoes.vista: uma de PA.VISTAS • opcoes.cansado: pose cansada (fome ou sede baixa) • opcoes.piscando: olho fechado
  PA.unicornio = function (def, estagio, quadro, opcoes) {
    opcoes = opcoes || {};
    var enf = opcoes.enfeites || [];
    var vista = opcoes.vista || 'lado';
    var combo = enf.join('+');
    var chave = ['uni', def.id, estagio, quadro, combo, opcoes.asasFada ? 'af' : '', vista, opcoes.cansado ? 'c' : '',
      opcoes.piscando ? 'pi' : ''].join('|');
    if (cache[chave]) { usarCombo(combo); return cache[chave]; }

    var grande = estagio >= 2;
    var molde = UNI[grande ? 'adulto' : 'filhote'][vista];
    var pernas = quadro === PULO ? pernasPulo(molde) : molde.pernas[quadro % 3] || molde.pernas[1];
    var corpoLinhas = molde.corpo.concat(pernas);
    if (estagio === 0) {
      // bebê: só um toquinho de chifre
      corpoLinhas = corpoLinhas.map(function (l, j) { return j < 2 ? l.replace(/[hg]/g, '.') : l.replace(/g/g, '.'); });
    }
    if (estagio === 3) {
      // adulto: crina e cauda 1 linha mais longas (o jovem usa o mesmo molde sem elas)
      corpoLinhas = corpoLinhas.slice();
      (molde.crinaAdulto || []).forEach(function (p) {
        var l = corpoLinhas[p[1]];
        if (l) corpoLinhas[p[1]] = l.slice(0, p[0]) + p[2] + l.slice(p[0] + 1);
      });
    }
    // piscando: o olho fecha antes da pose cansada (a pálpebra do cansaço não fica boiando sobre o olho fechado)
    if (opcoes.piscando && I.piscarUnicornio) corpoLinhas = I.piscarUnicornio(corpoLinhas);
    if (opcoes.cansado && molde.cansado) {
      corpoLinhas = cansar(corpoLinhas, molde.cansado);
      molde = moldeCansado(molde);
    }
    if (I.acabarUnicornio) corpoLinhas = I.acabarUnicornio(corpoLinhas);
    var w = corpoLinhas[0].length, h = corpoLinhas.length;
    var base = novoCanvas(w, h);
    var ctx = base.getContext('2d');
    var pal = paletaUnicornio(def, estagio);

    var temAsas = (def.raridade === 'epico' || def.raridade === 'lendario') || opcoes.asasFada;
    var palAsa = pal;
    if (opcoes.asasFada && !(def.raridade === 'epico' || def.raridade === 'lendario')) {
      palAsa = Object.assign({}, pal, { W: '#e6d6ff', X: '#b9a3f5' });
    }
    var palAsaEscura = Object.assign({}, palAsa, { W: palAsa.X, X: escurecer(palAsa.X, 0.2) });
    var asas = temAsas && estagio >= 1 ? molde.asas : [];
    // asas de trás antes do corpo, as da frente por cima
    asas.forEach(function (a) { if (a.atras) pintarMatriz(ctx, a.linhas, a.escura ? palAsaEscura : palAsa, a.x, a.y); });
    pintarMatriz(ctx, corpoLinhas, pal, 0, 0);
    asas.forEach(function (a) { if (!a.atras) pintarMatriz(ctx, a.linhas, palAsa, a.x, a.y); });

    // brilhinhos na crina dos raros para cima
    if (def.raridade !== 'comum' && estagio >= 1) {
      ctx.fillStyle = '#ffffff';
      molde.brilhos.forEach(function (pt) { ctx.fillRect(pt[0], pt[1], 1, 1); });
    }

    // enfeites em camadas (ver pintarEnfeites); montada, os das âncoras de molde.enfeitesNaFrente e os de desenho
    // próprio com naFrente são pintados de novo por cima da cavaleira (senão somem atrás dela)
    var enfNaFrente = pintarEnfeites(ctx, molde, enf, estagio, w, h, corpoLinhas, pal);
    // pedaços do corpo que a montada também repinta por cima dela (a ponta da cauda do filhote de lado)
    (molde.pedacosNaFrente || []).forEach(function (r) {
      var linhas = corpoLinhas.slice(r[1], r[3] + 1).map(function (l) { return l.slice(r[0], r[2] + 1); });
      enfNaFrente.unshift({ linhas: linhas, paleta: pal, x: r[0], y: r[1] });
    });
    // vista sem pedaço na frente mas com enfeite por cima dela: o "pedaço" vira 1 pixel desse enfeite
    // (PA.montada só repinta quando há naFrente; o enfeite cobre esse pixel de novo, então nada muda)
    var naFrente = molde.naFrente || null;
    if (!naFrente && enfNaFrente.length) naFrente = umPixel(enfNaFrente[0]);

    var final = contornar(base, CONTORNO);
    var res = { canvas: final, w: final.width, h: final.height, grande: grande, base: base,
      cavaleira: molde.cavaleira, naFrente: naFrente, enfeitesNaFrente: enfNaFrente };
    cache[chave] = res;
    usarCombo(combo, chave);
    return res;
  };
  I.usarCombo = usarCombo;
  I.PULO = PULO;
  I.QUASE_NO_CHIFRE = QUASE_NO_CHIFRE;
  I.lugarDoEnfeite = lugarDoEnfeite;
})();
