/* Observatório por dentro, parte 1 de 6: as cores da noite, ajudantes de cor e tempo, a galáxia
   (nebulosa em pontilhado, estrelas que cintilam, estrela cadente), o piso e a parede noturnos
   (I.PISOS/I.PAREDES observatorio-*), os planetas (desenho do observatorio/cenas.js ou reserva) e o
   toque no desenho do planeta e do Sol.
   O que as outras partes usam fica em Reino._predios.observatorio (ver o fim do arquivo).
   No carregamento NADA de DOM, canvas ou PA (as ferramentas em Node carregam este arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = '#3a2446';
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).observatorio = {};
  // cores da noite
  var CEU = '#141a46', CEU2 = '#1f2766', CEU3 = '#2d3580';
  var ESTRELA = '#fff6c8', AMARELA = '#ffe680', LILAS = '#b8c0ff', CIANO = '#7fe0ff';
  var METAL = C.metal, METAL2 = C.metal2, METAL3 = '#6a7390';
  var AZUL = '#5a6ad0', AZUL2 = '#3a4396', AZUL_CLARO = '#7f8cf0';

  function falas() { return (R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio) || {}; }
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  function hexRgb(h) {
    h = String(h).replace('#', '');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function misturar(a, b, t) {
    var x = hexRgb(a), y = hexRgb(b);
    return '#' + [0, 1, 2].map(function (i) {
      var c = Math.max(0, Math.min(255, Math.round(x[i] + (y[i] - x[i]) * t)));
      return (c < 16 ? '0' : '') + c.toString(16);
    }).join('');
  }
  function escurecer(c, t) { return misturar(c, K, t); }
  function clarear(c, t) { return misturar(c, '#ffffff', t); }
  // número pseudoaleatório fixo por posição (o desenho sai sempre igual)
  function sorte(x, y, s) {
    var n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor || ESTRELA); ret(ctx, x - 1, y, 3, 1, cor || ESTRELA); }
  // tempo das animações: parado (t = 0) sem animação ou com "reduzir movimento" do aparelho
  function tempo(t) { return (R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0); }

  /* ---------- galáxia: azul-marinho → azul → roxo → magenta, com toques de ciano e rosa ---------- */
  var MARINHO = '#0e1240', G_AZUL = '#2f3fb8', G_ROXO = '#6c3fd4', G_MAGENTA = '#b24fe0';
  var G_CIANO = '#6fd6ff', G_ROSA = '#ff9ad8', G_LILAS = '#c9b6ff';
  // [fraca, forte] de cada família da nebulosa
  var NEBULOSA = [['#2230a0', G_AZUL, '#5a6ae0'], ['#3a2aa0', G_ROXO, '#9670ec'], ['#4c2898', G_MAGENTA, '#d07cf0']];
  // cores da estrela que cintila (branco → ciano → lilás)
  var CINTILA = [C.branco, G_CIANO, G_LILAS];
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function limiar(x, y) { return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16; }
  // cor da nebulosa no ponto (X, Y) do mundo, em pontilhado (null = céu liso); `forca` 0-1
  function corNebulosa(X, Y, forca, escala) {
    var l = limiar(X, Y);
    if (escala) { X = X * escala; Y = Y * escala; }
    var d = 0.55 * Math.sin(X * 0.043 + 1.3 * Math.sin(X * 0.011)) + 0.35 * Math.sin(X * 0.017 + Y * 0.21 + 2) + 0.1;
    d = d * forca;
    var nivel = d > 0.72 + l * 0.4 ? 2 : d > 0.28 + l * 0.5 ? 1 : d > -0.22 + l * 0.5 ? 0 : -1;
    if (nivel < 0) return null;
    var h = 0.5 + 0.5 * Math.sin(X * 0.02 + 0.8 + Y * 0.02) + (l - 0.5) * 0.25;
    return NEBULOSA[h < 0.36 ? 0 : h < 0.68 ? 1 : 2][nivel];
  }
  // canvas pronto (criado uma vez por tile e paleta): a faixa de céu de 16×14 px da parede, com a
  // nebulosa em pontilhado e, na Cúpula, a Via Láctea atravessando a parede toda
  var cacheFaixa = {};
  function faixaCeu(tx, base, via) {
    var k = tx + base + (via ? 'v' : '');
    if (cacheFaixa[k]) return cacheFaixa[k];
    var c = document.createElement('canvas');
    c.width = 16; c.height = 14;
    var x = c.getContext('2d');
    ret(x, 0, 0, 16, 14, base);
    for (var j = 0; j < 14; j++) for (var i = 0; i < 16; i++) {
      var X = tx * 16 + i, Y = j + 19;
      // a nebulosa some perto das beiradas da faixa (em cima e embaixo)
      var borda = Math.min(j, 13 - j) < 2 ? 0.55 : 1;
      var cor = corNebulosa(X, Y, borda * 1.35);
      if (via) {
        var meio = 3 + (X - via) * 8 / 208, dist = Math.abs(j - meio), l = limiar(X, Y);
        if (dist < 1.2 && l < 0.7) cor = l < 0.25 ? '#e8e0ff' : G_LILAS;
        else if (dist < 3 && l < 0.55) cor = cor ? misturar(cor, '#b8b0ff', 0.45) : '#4a4aa8';
      }
      if (cor) ret(x, i, j, 1, 1, cor);
    }
    // estrelinhas fixas: branca, ciano e rosa
    for (var s = 0; s < 4; s++) {
      var sx = 1 + Math.floor(sorte(tx, s, 31) * 14), sy = 1 + Math.floor(sorte(s, tx, 37) * 12);
      ret(x, sx, sy, 1, 1, [C.branco, G_CIANO, G_ROSA, ESTRELA][s]);
    }
    cacheFaixa[k] = c;
    return c;
  }
  // estrela que cintila: troca de cor (branco → ciano → lilás) e pisca num ritmo só dela; `fase` diferencia.
  // Com t = 0 fica parada, acesa numa das três cores.
  function piscar(ctx, x, y, t, fase, grande) {
    var cor, s;
    if (!t) { cor = CINTILA[fase % 3]; s = fase % 4 === 3 ? 0 : 1; }
    else {
      var per = 1300 + (fase * 397) % 1900;
      var f = (t / per + fase * 0.137) % 1;
      s = f < 0.5 ? f * 2 : 2 - f * 2;
      cor = CINTILA[Math.floor(t / (per * 1.7) + fase * 0.61) % 3];
    }
    if (s > 0.62) {
      if (grande) { brilho(ctx, x, y, cor); ret(ctx, x, y - 2, 1, 1, misturar(cor, MARINHO, 0.45)); ret(ctx, x, y + 2, 1, 1, misturar(cor, MARINHO, 0.45)); ret(ctx, x - 2, y, 1, 1, misturar(cor, MARINHO, 0.45)); ret(ctx, x + 2, y, 1, 1, misturar(cor, MARINHO, 0.45)); }
      else brilho(ctx, x, y, misturar(cor, MARINHO, 0.35));
      ret(ctx, x, y, 1, 1, C.branco);
    } else if (s > 0.28) ret(ctx, x, y, 1, 1, cor);
    else ret(ctx, x, y, 1, 1, '#4a4f9a');
  }
  // halo de anel em pixels (pontilhado) em volta de (cx, cy); `pula(ang)` = true deixa o ângulo sem pixel
  function haloAnel(ctx, cx, cy, raio, cor, passo, giro, pula) {
    var n = Math.max(12, Math.round(raio * 6.3));
    for (var i = 0; i < n; i++) {
      if ((i + (giro || 0)) % (passo || 2)) continue;
      var a = i / n * Math.PI * 2;
      if (pula && pula(a)) continue;
      ret(ctx, Math.round(cx + Math.cos(a) * raio), Math.round(cy + Math.sin(a) * raio), 1, 1, cor);
    }
  }
  // estrela cadente: passa uma vez a cada 8 a 15 s (fatias de 11,5 s, começando de 0 a 3,5 s dentro de
  // cada uma), em 1 s, de (x0, y0) a (x1, y1), com o rastro branco → ciano → lilás
  var RASTRO = [C.branco, '#fff6c8', G_CIANO, '#b8a8ff', '#8a70e0', '#5a4ab0'];
  function estrelaCadente(ctx, t, x0, y0, x1, y1) {
    if (!t) return;
    var k = Math.floor(t / 11500), dt = t - k * 11500 - 3500 * sorte(k, 7, 77);
    if (dt < 0 || dt >= 1000) return;
    var f = dt / 1000, dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy));
    for (var i = RASTRO.length - 1; i >= 0; i--) {
      var g = f - i * 2.2 / n;
      if (g < 0) continue;
      ret(ctx, Math.round(x0 + dx * g), Math.round(y0 + dy * g), 1, 1, RASTRO[i]);
    }
    var hx = Math.round(x0 + dx * f), hy = Math.round(y0 + dy * f);
    brilho(ctx, hx, hy, '#dff4ff'); ret(ctx, hx, hy, 1, 1, C.branco);
  }

  /* ================= PISOS E PAREDE DA NOITE ================= */
  // Piso de galáxia (Cúpula e Galeria): o ladrilho ganha um pontilhado claro que vai do azul ao roxo e ao
  // magenta pelo cômodo, fiapos de nebulosa e estrelinhas fixas. Continua CLARO (luminância igual ou maior
  // que a do piso azul de antes): a Mariana e a unicórnio (contorno #3a2446) se destacam como no Planetário.
  // Cada tile é pintado uma vez num canvas de 16×16 (cache por tile e tipo) e depois só copiado.
  var PISO_GAL = [hexRgb('#5e6ccc'), hexRgb('#7666d0'), hexRgb('#9a60cc')];
  var RGB_K = hexRgb(K), RGB_BRANCO = [255, 255, 255], RGB_NEVOA = hexRgb('#c9c0ff');
  function mixRgb(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function corPiso(X, Y, fase) {
    var l = limiar(X, Y);
    var h = 0.5 + 0.5 * Math.sin(X * 0.011 + Y * 0.017 + 1.2 * Math.sin(Y * 0.009 - X * 0.005) + fase);
    var c = PISO_GAL[Math.max(0, Math.min(2, Math.round(h * 2.4 - 0.2 + (l - 0.5) * 0.9)))];
    // fiapos de nebulosa, mais claros, em pontilhado
    var w = Math.sin(X * 0.05 + Y * 0.03 + fase) * Math.sin(Y * 0.045 - X * 0.02);
    if (w > 0.5 && l < 0.35) c = mixRgb(c, RGB_NEVOA, 0.22);
    return c;
  }
  var cachePiso = {};
  function pisoGalaxia(ctx, px, py, tx, ty, tipo) {
    var k = tipo + tx + ',' + ty;
    var c = cachePiso[k];
    if (!c && typeof document !== 'undefined') {
      c = document.createElement('canvas');
      c.width = 16; c.height = 16;
      var x = c.getContext('2d'), img = x.createImageData(16, 16), d = img.data;
      var fase = tipo === 'metal' ? 0.6 : 2.4;
      for (var j = 0; j < 16; j++) for (var i = 0; i < 16; i++) {
        var X = tx * 16 + i, Y = ty * 16 + j, qi = i & 7, qj = j & 7;
        var cor = corPiso(X, Y, fase), par = ((i >> 3) + (j >> 3) + tx + ty) % 2 === 0;
        if (tipo === 'metal') {
          if (!par) cor = mixRgb(cor, RGB_K, 0.05);
          if (qi === 7 || qj === 7) cor = mixRgb(cor, RGB_K, 0.28);
          else if (qi === 0 || qj === 0) cor = mixRgb(cor, RGB_BRANCO, 0.16);
          else if (qi === 1 && qj === 1) cor = mixRgb(cor, RGB_BRANCO, 0.5);
          else if (qi === 5 && qj === 5) cor = mixRgb(cor, RGB_K, 0.2);
        } else {
          if (qi === 7 || qj === 7) cor = mixRgb(cor, RGB_K, 0.3);
          else if (qj === 0 && qi < 3) cor = mixRgb(cor, RGB_BRANCO, 0.14);
          else if (par) cor = mixRgb(cor, RGB_BRANCO, 0.04);
        }
        var o = (j * 16 + i) * 4;
        d[o] = Math.round(cor[0]); d[o + 1] = Math.round(cor[1]); d[o + 2] = Math.round(cor[2]); d[o + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      // estrelinhas fixas no piso (lilás, branca, ciano, rosa; às vezes uma em cruz)
      for (var e = 0; e < 2; e++) {
        if (sorte(tx, ty, 61 + e) > 0.32) continue;
        var ex = 2 + Math.floor(sorte(tx, ty, 71 + e) * 5) + e * 8, ey = 2 + Math.floor(sorte(ty, tx, 81 + e) * 5) + e * 8;
        var ce = ['#e8e0ff', C.branco, '#bff0ff', '#ffd0ee'][Math.floor(sorte(tx, ty, 91 + e) * 4)];
        if (sorte(tx, ty, 95 + e) < 0.25) { brilho(x, ex, ey, misturar(ce, '#7666d0', 0.3)); ret(x, ex, ey, 1, 1, C.branco); }
        else ret(x, ex, ey, 1, 1, ce);
      }
      // na Galeria, a estrelinha dourada de antes
      if (tipo === 'ladrilho' && sorte(tx, ty, 13) < 0.2) { var cg = '#ffe89a'; ret(x, 11, 2, 1, 3, cg); ret(x, 10, 3, 3, 1, cg); }
      cachePiso[k] = c;
    }
    if (c && ctx.drawImage) ctx.drawImage(c, px, py);
    else ret(ctx, px, py, 16, 16, '#6a66cc');
  }
  // poeira cintilante no piso da Cúpula e da Galeria (8 pontinhos em cada, cada um no seu ritmo)
  var poeiraPisos = null;
  function poeiraPiso(ctx, comodo, t) {
    if (!poeiraPisos) {
      poeiraPisos = {};
      [['cupula', CUP, 13], ['galeria', GAL, 13]].forEach(function (c) {
        var l = poeiraPisos[c[0]] = [];
        for (var k = 0; k < 8; k++) l.push([c[1].x * T + 8 + Math.floor(sorte(k, c[2], 101) * (c[2] - 1) * T), (c[1].y + 2) * T + 4 + Math.floor(sorte(c[2], k, 103) * 10 * T), k]);
      });
    }
    var lista = poeiraPisos[comodo] || [];
    for (var i = 0; i < lista.length; i++) {
      var q = lista[i], per = 1100 + q[2] * 211, f = t ? ((t / per) + q[2] * 0.37) % 1 : (q[2] % 3) / 3;
      if (f > 0.6) continue;
      var cor = CINTILA[(q[2] + (t ? Math.floor(t / 1500) : 0)) % 3];
      // com animação, o grão sobe devagar 0-3 px enquanto brilha
      var sobe = t ? Math.floor(f * 5) : 0;
      if (f > 0.2 && f < 0.36) brilho(ctx, q[0], q[1] - sobe, cor);
      ret(ctx, q[0], q[1] - sobe, 1, 1, f > 0.2 && f < 0.36 ? C.branco : cor);
    }
  }

  // pisos da noite num azul mais claro que a parede e o céu das janelas: a Mariana (contorno #3a2446)
  // e a unicórnio precisam se destacar do chão, principalmente no celular
  I.PISOS['observatorio-metal'] = { cores: { piso: '#5a66b0', piso2: '#4c57a0', detalhe: '#c0c8f4' },
    desenhar: function (ctx, px, py, tx, ty, p) { pisoGalaxia(ctx, px, py, tx, ty, 'metal'); } };
  I.PISOS['observatorio-estrelado'] = { cores: { piso: '#5a52aa', piso2: '#665eb6', detalhe: '#fff3a0' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) {
        if ((i + j) % 2) continue;
        ret(ctx, px + i * 4 + 1, py + j * 4 + 1, 1, 1, p.piso2);
      }
      for (var k = 0; k < 3; k++) {
        var x = px + 1 + Math.floor(sorte(tx, ty, k + 3) * 14), y = py + 1 + Math.floor(sorte(ty, tx, k + 9) * 14);
        ret(ctx, x, y, 1, 1, k === 0 ? LILAS : clarear(p.piso, 0.22));
      }
      if (sorte(tx, ty, 41) < 0.12) brilho(ctx, px + 8, py + 8, ESTRELA);
    } };
  // ladrilhos da Galeria: galáxia clara com uma estrelinha dourada aqui e ali
  I.PISOS['observatorio-ladrilho'] = { cores: { piso: '#5254a6', piso2: '#5c5eb0', detalhe: '#ffd34d' },
    desenhar: function (ctx, px, py, tx, ty, p) { pisoGalaxia(ctx, px, py, tx, ty, 'ladrilho'); } };
  function acabamento(ctx, px, py, p) {
    ret(ctx, px, py, 16, 1, escurecer(p.parede, 0.35));
    ret(ctx, px, py + 1, 16, 1, clarear(p.parede, 0.25));
    ret(ctx, px, py + 2, 16, 1, escurecer(p.parede, 0.14));
    ret(ctx, px, py + 27, 16, 1, escurecer(p.parede, 0.18));
    ret(ctx, px, py + 28, 16, 1, clarear(p.rodape, 0.3));
    ret(ctx, px, py + 29, 16, 2, p.rodape);
    ret(ctx, px, py + 31, 16, 1, escurecer(p.rodape, 0.4));
  }
  // parede azul-marinho: céu pintado em cima (estrelinhas fixas), faixa dourada e lambri embaixo
  I.PAREDES['observatorio-noite'] = { cores: { parede: '#262a6a', parede2: '#1d2056', rodape: '#5a4a9a', detalhe: '#ffd34d' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      // o céu pintado: faixa de galáxia pronta (nebulosa em pontilhado; Via Láctea na Cúpula)
      var via = (tx >= CUP.x && tx < CUP.x + 13) ? CUP.x * 16 : 0;
      if (typeof document !== 'undefined' && ctx.drawImage) ctx.drawImage(faixaCeu(tx, misturar(p.parede, G_AZUL, 0.2), via), px, py + 3);
      else ret(ctx, px, py + 3, 16, 14, misturar(p.parede, MARINHO, 0.55));
      // uma estrela grande em cruz a cada tanto
      if (sorte(tx, 7, 1) < 0.4) {
        var sx = px + 3 + Math.floor(sorte(tx, 0, 3) * 10), sy = py + 6 + Math.floor(sorte(tx, 0, 5) * 8);
        var cs = [C.branco, G_CIANO, G_ROSA][Math.floor(sorte(tx, 2, 9) * 3)];
        brilho(ctx, sx, sy, misturar(cs, MARINHO, 0.3)); ret(ctx, sx, sy, 1, 1, C.branco);
      }
      ret(ctx, px + 15, py + 3, 1, 15, escurecer(p.parede, 0.18));
      ret(ctx, px, py + 17, 16, 1, clarear(p.detalhe, 0.3));
      ret(ctx, px, py + 18, 16, 1, p.detalhe);
      // lambri em tom de galáxia (azul, roxo ou magenta conforme a parede avança), com pontilhado no painel
      var hue = 0.5 + 0.5 * Math.sin(tx * 0.33 + 0.8);
      var lam = misturar(p.parede2, hue < 0.36 ? G_AZUL : hue < 0.68 ? G_ROXO : G_MAGENTA, 0.32);
      ret(ctx, px, py + 19, 16, 8, lam);
      for (var lj = 21; lj < 25; lj++) for (var li = 3; li < 13; li++) if (limiar(px + li, py + lj) < 0.28) ret(ctx, px + li, py + lj, 1, 1, clarear(lam, 0.14));
      if (sorte(tx, 3, 91) < 0.5) ret(ctx, px + 8, py + 22, 1, 1, sorte(tx, 4, 93) < 0.5 ? G_CIANO : G_ROSA);
      ret(ctx, px + 2, py + 20, 12, 1, escurecer(lam, 0.2)); ret(ctx, px + 2, py + 20, 1, 6, escurecer(lam, 0.2));
      ret(ctx, px + 3, py + 25, 11, 1, clarear(lam, 0.18)); ret(ctx, px + 13, py + 21, 1, 5, clarear(lam, 0.18));
      acabamento(ctx, px, py, p);
    } };

  /* ================= PLANETAS (desenho do G2 ou reserva simples) ================= */
  var CORES_PLANETA = {
    sol: ['#ffd34d', '#ff9d2e', '#fff3a0'], mercurio: ['#b9a89a', '#8a7a70', '#e0d4c8'], venus: ['#f2d49a', '#d9a95e', '#fff0c8'],
    terra: ['#5fb4ff', '#2f6fd6', '#bfe9ff'], marte: ['#e0663a', '#a8442a', '#ffa07a'], jupiter: ['#e8c49a', '#c98a5b', '#fff0d8'],
    saturno: ['#f0dc9a', '#caa860', '#fff8d8'], urano: ['#9fe8e8', '#6cc4cc', '#e0ffff'], netuno: ['#5f7fff', '#3a4fcc', '#a8b8ff'],
    plutao: ['#d8c0a8', '#a88c74', '#f4e4d4'],
  };
  // anel lilás-claro (cor diferente do corpo, para não virar um "pastel" amarelo), com contorno
  function anelSaturno(ctx, cx, cy, raio, frente) {
    var rx = Math.round(raio * 2), ry = Math.max(1, Math.round(raio * 0.65));
    // primeiro o contorno (em cima e embaixo de cada ponto), depois o anel por cima dele
    for (var passo = 0; passo < 2; passo++) {
      for (var i = 0; i < 64; i++) {
        var a = i / 64 * Math.PI * 2, s = Math.sin(a);
        if ((s >= 0) !== frente) continue;
        var x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + s * ry);
        if (passo === 0) ret(ctx, x, y - 1, 1, 3, K);
        else ret(ctx, x, y, 1, 1, i % 4 === 0 ? '#a58fe6' : '#c9b6ff');
      }
    }
  }
  function planetaReserva(ctx, id, cx, cy, raio) {
    var c = CORES_PLANETA[id] || CORES_PLANETA.mercurio;
    if (id === 'saturno') anelSaturno(ctx, cx, cy, raio, false);
    circulo(ctx, cx, cy, raio + 1, K);
    circulo(ctx, cx, cy, raio, c[1]);
    circulo(ctx, cx - 1, cy - 1, Math.max(1, raio - 1), c[0]);
    if (id === 'jupiter') { ret(ctx, cx - raio + 1, cy - 2, raio * 2 - 1, 1, c[1]); ret(ctx, cx - raio + 1, cy + 2, raio * 2 - 1, 1, c[1]); ret(ctx, cx + 1, cy + 1, 2, 1, '#d0603a'); }
    if (id === 'terra') { ret(ctx, cx - 2, cy - 1, 2, 2, C.verde); ret(ctx, cx + 1, cy + 1, 2, 1, C.verde); }
    if (id === 'marte') ret(ctx, cx - 1, cy - raio + 1, 2, 1, C.branco);
    if (id === 'plutao' && raio >= 3) ret(ctx, cx, cy, 2, 1, c[2]);
    ret(ctx, cx - Math.ceil(raio / 2), cy - Math.ceil(raio / 2), 1, 1, c[2]);
    if (id === 'saturno') anelSaturno(ctx, cx, cy, raio, true);
  }
  function desenharPlaneta(ctx, id, cx, cy, raio) {
    var OC = R.ObservatorioCenas;
    if (OC && OC.desenharPlaneta) {
      try { OC.desenharPlaneta(ctx, id, cx, cy, raio); return; } catch (e) { if (window.console) console.error(e); }
    }
    planetaReserva(ctx, id, cx, cy, raio);
  }
  // sprite pronto de cada planeta (criado uma vez, na primeira vez que aparece)
  var sprites = {};
  function spritePlaneta(id, raio) {
    var k = id + ':' + raio;
    if (sprites[k]) return sprites[k];
    var S = raio * 4 + 8;
    var c = document.createElement('canvas');
    c.width = S; c.height = S;
    var cx = c.getContext('2d');
    desenharPlaneta(cx, id, S / 2, S / 2, raio);
    sprites[k] = c;
    return c;
  }
  // (Plutão continua o menor, mas com raio 3 ele ainda aparece redondinho no celular; Urano com 6 sai redondo)
  var RAIOS = { mercurio: 4, venus: 5, terra: 5, marte: 4, jupiter: 8, saturno: 6, urano: 6, netuno: 6, plutao: 3 };

  /* ---------- toque: o desenho do planeta (e do Sol) inteiro, até as pontas dos anéis ---------- */
  // alfa de um sprite (1 = tem desenho), guardado junto dele
  function alfaDe(c) {
    if (c.__alfa) return c.__alfa;
    var d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, a = new Uint8Array(c.width * c.height);
    for (var i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] >= 64 ? 1 : 0;
    c.__alfa = a;
    return a;
  }
  // o ponto (px do jogo) cai no sprite desenhado com o canto em (x0, y0)? `folga` px a mais em volta
  function tocaSprite(c, x0, y0, wx, wy, folga) {
    var a = alfaDe(c), x = Math.floor(wx - x0), y = Math.floor(wy - y0);
    for (var dy = -folga; dy <= folga; dy++) for (var dx = -folga; dx <= folga; dx++) {
      var xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < c.width && yy < c.height && a[yy * c.width + xx]) return true;
    }
    return false;
  }
  var spriteSol = null;
  function toqueSol(wx, wy, px, py, o, folga) {
    try {
      if (!spriteSol) {
        spriteSol = document.createElement('canvas'); spriteSol.width = 40; spriteSol.height = 40;
        desenharPlaneta(spriteSol.getContext('2d'), 'sol', 20, 20, 11);
      }
      return tocaSprite(spriteSol, px + 16 - 20, py + 14 - 20, wx, wy, folga);
    } catch (e) { return false; }
  }
  function toquePlaneta(wx, wy, px, py, o, folga) {
    try {
      var id = v(o, 'id', 'terra'), c = spritePlaneta(id, RAIOS[id] || 4), cx = px + 8, cy = py + 6;
      if (tocaSprite(c, cx - c.width / 2, cy - c.height / 2, wx, wy, folga)) return true;
      // com folga, a faixa em que as luas dão a volta também vale
      if (folga && id === 'jupiter') return Math.abs(wx - cx) <= 13 && Math.abs(wy - cy) <= 3;
      if (folga && id === 'terra') return Math.abs(wx - cx) <= 9 && Math.abs(wy - cy) <= 4;
      return false;
    } catch (e) { return false; }
  }

  // canto de cada cômodo no interior (usado aqui, nos objetos de parede e no layout, observatorio.js)
  var GAL = { x: 1, y: 1 }, CUP = { x: 15, y: 1 }, PLA = { x: 29, y: 1 };

  // para as outras partes (R._predios.observatorio)
  S.CEU = CEU; S.ESTRELA = ESTRELA; S.AMARELA = AMARELA; S.LILAS = LILAS; S.CIANO = CIANO; S.METAL = METAL;
  S.METAL2 = METAL2; S.METAL3 = METAL3; S.AZUL = AZUL; S.AZUL2 = AZUL2; S.AZUL_CLARO = AZUL_CLARO; S.falas = falas;
  S.v = v; S.misturar = misturar; S.clarear = clarear; S.sorte = sorte; S.brilho = brilho; S.tempo = tempo;
  S.MARINHO = MARINHO; S.G_AZUL = G_AZUL; S.G_ROXO = G_ROXO; S.G_MAGENTA = G_MAGENTA; S.G_CIANO = G_CIANO;
  S.G_ROSA = G_ROSA; S.G_LILAS = G_LILAS; S.CINTILA = CINTILA; S.limiar = limiar; S.corNebulosa = corNebulosa;
  S.piscar = piscar; S.haloAnel = haloAnel; S.estrelaCadente = estrelaCadente; S.poeiraPiso = poeiraPiso;
  S.desenharPlaneta = desenharPlaneta; S.spritePlaneta = spritePlaneta; S.RAIOS = RAIOS; S.toqueSol = toqueSol;
  S.toquePlaneta = toquePlaneta; S.GAL = GAL; S.CUP = CUP; S.PLA = PLA;
})();
