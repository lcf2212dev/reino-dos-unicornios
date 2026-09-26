/* Pixel art do unicórnio: paleta pelas cores do unicórnio, PA.unicornio (corpo, asas, brilhos,
   enfeites e contorno, com cache) e o teto do cache por combinação de enfeites (usarCombo, que
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
      b: corpo, s: escurecer(corpo, 0.14), w: clarear(corpo, 0.55),
      m: crina[0], n: crina[1] || crina[0], r: crina[2] || crina[1] || crina[0],
      h: chifre, g: escurecer(chifre, 0.25), k: clarear(chifre, 0.45),
      e: '#2a1838', l: '#ffffff', p: '#ff9cc6', o: '#6b3b5a', q: misturar(corpo, '#ff9cc6', 0.22),
      f: escurecer(def.cores.casco || corpo, 0.3),
      W: def.cores.asa || '#ffffff', X: escurecer(def.cores.asa || '#ffffff', 0.18),
    };
    if (estagio === 0) { p.h = clarear(chifre, 0.35); } // bebê: chifre bem pequenino
    return p;
  }

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

  // estagio: 0 bebê, 1 pequeno, 2 jovem, 3 adulto • opcoes.vista: uma de PA.VISTAS
  PA.unicornio = function (def, estagio, quadro, opcoes) {
    opcoes = opcoes || {};
    var enf = opcoes.enfeites || [];
    var vista = opcoes.vista || 'lado';
    var combo = enf.join('+');
    var chave = ['uni', def.id, estagio, quadro, combo, opcoes.asasFada ? 'af' : '', vista].join('|');
    if (cache[chave]) { usarCombo(combo); return cache[chave]; }

    var grande = estagio >= 2;
    var molde = UNI[grande ? 'adulto' : 'filhote'][vista];
    var pernas = molde.pernas[quadro % 3] || molde.pernas[1];
    var corpoLinhas = molde.corpo.concat(pernas);
    if (estagio === 0) {
      // bebê: só um toquinho de chifre
      corpoLinhas = corpoLinhas.map(function (l, j) { return j < 2 ? l.replace(/[hg]/g, '.') : l.replace(/g/g, '.'); });
    }
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

    var enfNaFrente = [];
    enf.forEach(function (nome) {
      var e = ENFEITES[nome];
      if (!e) return;
      var proprio = molde.enfeites && molde.enfeites[nome];
      if (proprio && estagio === 0 && proprio.bebe) proprio = proprio.bebe;
      if (proprio && proprio.naFrente) enfNaFrente.push({ linhas: proprio.linhas, paleta: e.paleta, x: proprio.x, y: proprio.y });
      if (proprio) { pintarMatriz(ctx, proprio.linhas, e.paleta, proprio.x, proprio.y); return; }
      var a = molde.ancoras[e.ancora];
      if (a) pintarMatriz(ctx, e.linhas, e.paleta, a[0] + e.dx, a[1] + e.dy);
    });

    var final = contornar(base, CONTORNO);
    var res = { canvas: final, w: final.width, h: final.height, grande: grande, base: base,
      cavaleira: molde.cavaleira, naFrente: molde.naFrente || null, enfeitesNaFrente: enfNaFrente };
    cache[chave] = res;
    usarCombo(combo, chave);
    return res;
  };
  I.usarCombo = usarCombo;
})();
