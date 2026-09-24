/* Observatório por dentro: um interior noturno com 3 cômodos lado a lado —
   Galeria do Espaço (esquerda) | Cúpula do Telescópio (entrada, no meio) | Planetário (direita).
   Aqui ficam os dados do interior, os objetos temáticos (prefixo observatorio-), o piso e a
   parede noturnos, e as ações `curiosidade` e `piada` (Doutora Vega, Robô Cosmo e objetos).
   Só curiosidades: nada de estrelas, dinheiro ou save.
   Conta com (e tem reservas para quando ainda não existem):
   - Reino.ObservatorioCenas (observatorio-cenas.js): temas(), cena(tema, t), desenharPlaneta(ctx, id, cx, cy, raio);
   - Reino.Observatorio e Reino.FALAS_INTERIORES.observatorio (observatorio-falas.js).
   No carregamento NADA de DOM, canvas ou PA (as ferramentas em Node carregam este arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = '#3a2446';
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

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
  // estrela que pisca: acesa, meia ou apagada (com t = 0 fica sempre no mesmo jeito)
  function piscar(ctx, x, y, t, fase, grande) {
    var s = t ? Math.sin(t / (520 + fase * 37) + fase * 1.9) : ((fase % 3) - 1) * 0.6;
    if (s > 0.35) { if (grande) brilho(ctx, x, y, ESTRELA); else ret(ctx, x, y, 1, 1, ESTRELA); ret(ctx, x, y, 1, 1, C.branco); }
    else if (s > -0.4) ret(ctx, x, y, 1, 1, LILAS);
    else ret(ctx, x, y, 1, 1, '#4a4f9a');
  }

  /* ================= PISOS E PAREDE DA NOITE ================= */
  I.PISOS['observatorio-metal'] = { cores: { piso: '#3a4180', piso2: '#2c3268', detalhe: '#9aa4e0' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      var linha = escurecer(p.piso2, 0.25), luz = clarear(p.piso, 0.18);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, par = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx, qy, 8, 8, par ? p.piso : misturar(p.piso, p.piso2, 0.5));
        ret(ctx, qx, qy, 7, 1, luz); ret(ctx, qx, qy, 1, 7, luz);
        ret(ctx, qx + 7, qy, 1, 8, linha); ret(ctx, qx, qy + 7, 8, 1, linha);
        ret(ctx, qx + 1, qy + 1, 1, 1, p.detalhe); ret(ctx, qx + 5, qy + 5, 1, 1, escurecer(p.detalhe, 0.35));
      }
      if (sorte(tx, ty, 17) < 0.2) { ret(ctx, px + 3, py + 11, 3, 1, clarear(p.piso, 0.3)); }
    } };
  I.PISOS['observatorio-estrelado'] = { cores: { piso: '#231e58', piso2: '#2e2870', detalhe: '#fff3a0' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) {
        if ((i + j) % 2) continue;
        ret(ctx, px + i * 4 + 1, py + j * 4 + 1, 1, 1, p.piso2);
      }
      for (var k = 0; k < 3; k++) {
        var x = px + 1 + Math.floor(sorte(tx, ty, k + 3) * 14), y = py + 1 + Math.floor(sorte(ty, tx, k + 9) * 14);
        ret(ctx, x, y, 1, 1, k === 0 ? '#6a64b8' : '#4a4596');
      }
      if (sorte(tx, ty, 41) < 0.12) brilho(ctx, px + 8, py + 8, misturar(p.detalhe, p.piso, 0.45));
    } };
  // ladrilhos da Galeria: azul-noite com uma estrelinha dourada aqui e ali
  I.PISOS['observatorio-ladrilho'] = { cores: { piso: '#2a2c68', piso2: '#33347a', detalhe: '#ffd34d' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      var junta = escurecer(p.piso, 0.3);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, par = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx, qy, 8, 8, junta);
        ret(ctx, qx, qy, 7, 7, par ? p.piso : p.piso2);
        ret(ctx, qx, qy, 3, 1, clarear(par ? p.piso : p.piso2, 0.12));
        if (sorte(tx * 2 + i, ty * 2 + j, 13) < 0.1) {
          var c = misturar(p.detalhe, p.piso, 0.25);
          ret(ctx, qx + 3, qy + 2, 1, 3, c); ret(ctx, qx + 2, qy + 3, 3, 1, c);
        } else if (sorte(tx * 2 + i, ty * 2 + j, 29) < 0.2) ret(ctx, qx + 4, qy + 4, 1, 1, '#5a5cb0');
      }
    } };
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
      ret(ctx, px, py + 3, 16, 5, misturar(p.parede, p.parede2, 0.6));
      for (var k = 0; k < 3; k++) {
        var sx = px + 1 + Math.floor(sorte(tx, k, 3) * 14), sy = py + 4 + Math.floor(sorte(tx, k, 5) * 12);
        if (k === 0 && sorte(tx, 7, 1) < 0.45) brilho(ctx, sx, sy, misturar(ESTRELA, p.parede, 0.35));
        else ret(ctx, sx, sy, 1, 1, k === 1 ? LILAS : misturar(ESTRELA, p.parede, 0.2));
      }
      ret(ctx, px + 15, py + 3, 1, 15, escurecer(p.parede, 0.18));
      ret(ctx, px, py + 17, 16, 1, clarear(p.detalhe, 0.3));
      ret(ctx, px, py + 18, 16, 1, p.detalhe);
      var lam = p.parede2;
      ret(ctx, px, py + 19, 16, 8, lam);
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
  function anelSaturno(ctx, cx, cy, raio, frente) {
    var rx = Math.round(raio * 1.9), ry = Math.max(1, Math.round(raio * 0.5));
    for (var i = 0; i < 64; i++) {
      var a = i / 64 * Math.PI * 2, s = Math.sin(a);
      if ((s >= 0) !== frente) continue;
      var x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + s * ry);
      ret(ctx, x, y, 1, 1, i % 4 === 0 ? '#caa860' : '#f4e6b8');
      ret(ctx, x, y + 1, 1, 1, K);
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
  var RAIOS = { mercurio: 3, venus: 4, terra: 4, marte: 3, jupiter: 7, saturno: 5, urano: 5, netuno: 5, plutao: 2 };
  // velocidade da voltinha (os de perto do Sol andam mais rápido)
  var PERIODOS = { mercurio: 1900, venus: 2600, terra: 3200, marte: 3900, jupiter: 5200, saturno: 6200, urano: 7200, netuno: 8200, plutao: 9400 };

  /* ================= OBJETOS: PAREDE ================= */
  // a fenda aberta da cúpula, com o céu estrelado (as estrelas piscam; às vezes passa uma estrela cadente)
  var FENDA_ESTRELAS = [[4, 5], [11, 3], [18, 8], [25, 4], [8, 12], [22, 14], [14, 18], [28, 11], [5, 20], [27, 21], [16, 2], [10, 22]];
  I.objeto('observatorio-fenda', { w: 4, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 4) * T, x0 = px + 14, w = W - 28;
      // costelas da cúpula e as duas portas de metal abertas
      ret(ctx, px + 2, py + 1, 12, 27, K); ret(ctx, px + W - 14, py + 1, 12, 27, K);
      ret(ctx, px + 3, py + 2, 10, 25, METAL2); ret(ctx, px + W - 13, py + 2, 10, 25, METAL2);
      ret(ctx, px + 3, py + 2, 2, 25, METAL); ret(ctx, px + W - 13, py + 2, 2, 25, METAL);
      for (var r = 0; r < 4; r++) { ret(ctx, px + 7, py + 5 + r * 6, 1, 1, METAL3); ret(ctx, px + W - 8, py + 5 + r * 6, 1, 1, METAL3); }
      // o céu
      ret(ctx, x0 - 1, py, w + 2, 28, K);
      ret(ctx, x0, py + 1, w, 26, CEU);
      ret(ctx, x0, py + 19, w, 8, CEU2);
      ret(ctx, x0, py + 24, w, 3, CEU3);
      FENDA_ESTRELAS.forEach(function (s, i) { if (i % 2) ret(ctx, x0 + s[0], py + 1 + s[1], 1, 1, i % 4 === 1 ? LILAS : '#8a90d8'); });
      // Lua crescente
      circulo(ctx, x0 + w - 7, py + 7, 4, '#fff3c8'); circulo(ctx, x0 + w - 5, py + 6, 3, CEU);
      // trilho embaixo
      ret(ctx, x0 - 1, py + 27, w + 2, 2, K); ret(ctx, x0, py + 27, w, 1, METAL);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var W = (o.w || 4) * T, x0 = px + 14, w = W - 28;
      for (var i = 0; i < FENDA_ESTRELAS.length; i += 2) piscar(ctx, x0 + FENDA_ESTRELAS[i][0], py + 1 + FENDA_ESTRELAS[i][1], t, i, i % 4 === 0);
      // estrela cadente: 700 ms a cada 7 s
      if (t) {
        var f = (t % 7000) / 700;
        if (f < 1) {
          var sx = x0 + 3 + Math.round(f * (w - 12)), sy = py + 4 + Math.round(f * 9);
          ret(ctx, sx, sy, 1, 1, C.branco); ret(ctx, sx - 1, sy - 1, 1, 1, ESTRELA); ret(ctx, sx - 2, sy - 1, 1, 1, LILAS); ret(ctx, sx - 3, sy - 2, 1, 1, '#6a70c0');
        }
      }
    } });
  // janela redonda (escotilha) com o céu da noite
  I.objeto('observatorio-janela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 13;
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, METAL); circulo(ctx, cx, cy, 5, METAL2);
      circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, CEU);
      ret(ctx, cx - 3, cy + 1, 7, 2, CEU2);
      ret(ctx, cx + 1, cy - 2, 1, 1, LILAS);
      ret(ctx, cx - 5, cy - 5, 1, 1, C.branco); ret(ctx, cx + 5, cy + 4, 1, 1, METAL3);
      ret(ctx, cx - 4, py + 22, 9, 2, K); ret(ctx, cx - 3, py + 22, 7, 1, METAL);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      piscar(ctx, px + 6, py + 12, t, (o.x || 0) + 1, false);
      piscar(ctx, px + 10, py + 14, t, (o.x || 0) + 4, false);
    } });
  // pedaço de céu pintado no domo do Planetário, com a Via Láctea
  I.objeto('observatorio-ceu', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * T;
      ret(ctx, px + 1, py + 3, W - 2, 14, CEU);
      for (var i = 0; i < W - 2; i++) {
        var y = py + 12 - Math.round(i * 7 / (W - 2));
        ret(ctx, px + 1 + i, y, 1, 3, '#2a2f78');
        if (sorte(i, o.x, 3) < 0.35) ret(ctx, px + 1 + i, y + 1, 1, 1, '#8a84d8');
      }
      for (var k = 0; k < 6; k++) ret(ctx, px + 2 + Math.floor(sorte(o.x, k, 7) * (W - 4)), py + 4 + Math.floor(sorte(k, o.x, 9) * 12), 1, 1, k % 2 ? LILAS : '#7a80c8');
      ret(ctx, px + 1, py + 17, W - 2, 1, AMARELA);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var W = (o.w || 2) * T;
      for (var k = 0; k < 3; k++) {
        var x = px + 3 + Math.floor(sorte(o.x, k, 21) * (W - 6)), y = py + 5 + Math.floor(sorte(k, o.x, 23) * 10);
        piscar(ctx, x, y, t, o.x + k * 3, k === 0);
      }
    } });
  // quadros do espaço: Lua, cometa, galáxia, astronauta e foguete
  var QUADROS = {
    lua: function (ctx, x, y) { circulo(ctx, x + 5, y + 7, 4, '#e8e4d8'); ret(ctx, x + 3, y + 6, 2, 1, '#b8b2a4'); ret(ctx, x + 6, y + 9, 1, 1, '#b8b2a4'); ret(ctx, x + 1, y + 2, 1, 1, ESTRELA); ret(ctx, x + 8, y + 12, 1, 1, LILAS); },
    cometa: function (ctx, x, y) {
      for (var i = 0; i < 6; i++) ret(ctx, x + 1 + i, y + 2 + i, 2, 1, i < 3 ? '#6fc8ff' : CIANO);
      circulo(ctx, x + 8, y + 9, 2, C.branco); ret(ctx, x + 2, y + 11, 1, 1, ESTRELA);
    },
    galaxia: function (ctx, x, y) {
      elipse(ctx, x + 5, y + 7, 4, 2, '#6a5ac0'); ret(ctx, x + 4, y + 6, 3, 2, '#ffe0f4');
      ret(ctx, x + 1, y + 5, 2, 1, '#b58cff'); ret(ctx, x + 8, y + 9, 2, 1, '#b58cff'); ret(ctx, x + 1, y + 1, 1, 1, ESTRELA); ret(ctx, x + 9, y + 12, 1, 1, ESTRELA);
    },
    astronauta: function (ctx, x, y) {
      circulo(ctx, x + 5, y + 5, 3, C.branco); elipse(ctx, x + 5, y + 5, 2, 1, '#ffd34d');
      ret(ctx, x + 2, y + 9, 7, 4, C.branco); ret(ctx, x + 3, y + 10, 2, 1, '#2e9a4e'); ret(ctx, x + 4, y + 10, 1, 1, '#ffd34d');
    },
    foguete: function (ctx, x, y) {
      triangulo(ctx, x + 3, y + 1, 5, 3, C.vermelho); ret(ctx, x + 4, y + 4, 3, 6, C.branco); ret(ctx, x + 5, y + 6, 1, 1, C.azul);
      ret(ctx, x + 3, y + 8, 1, 2, C.vermelho); ret(ctx, x + 7, y + 8, 1, 2, C.vermelho); ret(ctx, x + 5, y + 10, 1, 2, C.laranja); ret(ctx, x + 4, y + 12, 3, 1, C.ouro);
    },
  };
  I.objeto('observatorio-quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 2, y = py + 7;
      contornoRet(ctx, x, y, 12, 17, C.ouro2);
      ret(ctx, x + 1, y + 1, 10, 1, C.ouro);
      ret(ctx, x + 2, y + 2, 8, 13, CEU);
      (QUADROS[v(o, 'cena', 'lua')] || QUADROS.lua)(ctx, x + 1, y + 1);
      ret(ctx, x + 5, y - 3, 2, 3, K);
    } });
  // carta celeste pequena (pergaminho azul com uma constelação)
  var CARTAS = {
    cruzeiro: [[5, 2], [5, 12], [2, 7], [8, 6], [6, 9]],
    marias: [[2, 3], [8, 3], [4, 7], [5, 7], [6, 7], [2, 12], [8, 12]],
    ursa: [[1, 4], [3, 3], [5, 4], [7, 5], [7, 9], [9, 10], [9, 6]],
  };
  var LINHAS_CARTA = { cruzeiro: [[0, 1], [2, 3]], marias: [[0, 2], [4, 1], [2, 5], [4, 6]], ursa: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] };
  function linhaPontos(ctx, a, b, cor) {
    var n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    for (var i = 1; i < n; i++) ret(ctx, Math.round(a[0] + (b[0] - a[0]) * i / n), Math.round(a[1] + (b[1] - a[1]) * i / n), 1, 1, cor);
  }
  I.objeto('observatorio-carta', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 2, y = py + 6, d = v(o, 'desenho', 'cruzeiro');
      ret(ctx, x - 1, y - 1, 14, 3, K); ret(ctx, x, y, 12, 1, C.madeiraClara);
      contornoRet(ctx, x, y + 1, 12, 17, '#2a3380');
      ret(ctx, x - 1, y + 17, 14, 3, K); ret(ctx, x, y + 18, 12, 1, C.madeiraClara);
      var pts = CARTAS[d] || CARTAS.cruzeiro;
      (LINHAS_CARTA[d] || []).forEach(function (l) { linhaPontos(ctx, [x + 1 + pts[l[0]][0], y + 2 + pts[l[0]][1]], [x + 1 + pts[l[1]][0], y + 2 + pts[l[1]][1]], '#5a64b8'); });
      pts.forEach(function (p, i) { ret(ctx, x + 1 + p[0], y + 2 + p[1], 1, 1, i === 0 ? AMARELA : ESTRELA); });
    } });
  // mapa grande das constelações (interativo, na Galeria)
  var MAPA_CRUZ = [[9, 4], [9, 15], [5, 9], [13, 8], [11, 12]];
  var MAPA_MARIAS = [[31, 9], [33, 10], [35, 11]];
  var MAPA_ORION = [[29, 4], [38, 5], [28, 16], [38, 17]];
  var MAPA_ESCORPIAO = [[18, 5], [20, 7], [21, 10], [21, 13], [23, 15], [26, 15], [27, 13]];
  I.objeto('observatorio-mapa-constelacoes', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * T, x = px + 2, y = py + 4, w = W - 4;
      ret(ctx, x - 1, y - 1, w + 2, 24, K);
      ret(ctx, x, y, w, 22, C.ouro2); ret(ctx, x, y, w, 1, C.ouro);
      ret(ctx, x + 2, y + 2, w - 4, 18, '#1a2060');
      ret(ctx, x + 2, y + 14, w - 4, 6, '#222a74');
      linhaPontos(ctx, [x + 2 + 9, y + 2 + 4], [x + 2 + 9, y + 2 + 15], '#5a64b8');
      linhaPontos(ctx, [x + 2 + 5, y + 2 + 9], [x + 2 + 13, y + 2 + 8], '#5a64b8');
      for (var i = 0; i < MAPA_ESCORPIAO.length - 1; i++) linhaPontos(ctx, [x + 2 + MAPA_ESCORPIAO[i][0], y + 2 + MAPA_ESCORPIAO[i][1]], [x + 2 + MAPA_ESCORPIAO[i + 1][0], y + 2 + MAPA_ESCORPIAO[i + 1][1]], '#6a5aa8');
      linhaPontos(ctx, [x + 2 + 29, y + 2 + 4], [x + 2 + 31, y + 2 + 9], '#5a64b8'); linhaPontos(ctx, [x + 2 + 38, y + 2 + 5], [x + 2 + 35, y + 2 + 11], '#5a64b8');
      linhaPontos(ctx, [x + 2 + 31, y + 2 + 9], [x + 2 + 28, y + 2 + 16], '#5a64b8'); linhaPontos(ctx, [x + 2 + 35, y + 2 + 11], [x + 2 + 38, y + 2 + 17], '#5a64b8');
      MAPA_CRUZ.concat(MAPA_ORION).forEach(function (p) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, ESTRELA); });
      MAPA_MARIAS.forEach(function (p) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, CIANO); });
      MAPA_ESCORPIAO.forEach(function (p, i) { ret(ctx, x + 2 + p[0], y + 2 + p[1], 1, 1, i === 1 ? '#ff8a6a' : '#e8d8ff'); });
      for (var k = 0; k < 10; k++) ret(ctx, x + 3 + Math.floor(sorte(k, 3, 5) * (w - 6)), y + 3 + Math.floor(sorte(3, k, 7) * 16), 1, 1, '#4a52a0');
      ret(ctx, x + w / 2 - 3, y - 4, 6, 3, K); ret(ctx, x + w / 2 - 2, y - 3, 4, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var x = px + 4, y = py + 6;
      MAPA_CRUZ.forEach(function (p, i) { piscar(ctx, x + p[0], y + p[1], t, i * 2 + 1, i < 2); });
    } });

  /* ================= OBJETOS: CHÃO ================= */
  // o telescópio grande, apontado para a fenda da cúpula
  I.objeto('observatorio-telescopio', { w: 2, h: 2, topo: 34, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      elipse(ctx, cx, py + 25, 14, 6, K); elipse(ctx, cx, py + 25, 13, 5, METAL3); elipse(ctx, cx, py + 24, 12, 4, METAL2);
      ret(ctx, cx - 9, py + 23, 2, 1, METAL); ret(ctx, cx + 7, py + 23, 2, 1, METAL);
      // coluna
      ret(ctx, cx - 4, py + 6, 9, 19, K); ret(ctx, cx - 3, py + 7, 7, 17, AZUL); ret(ctx, cx - 3, py + 7, 2, 17, AZUL_CLARO);
      ret(ctx, cx - 3, py + 18, 7, 1, AZUL2);
      // contrapeso
      for (var i = 0; i < 8; i++) { ret(ctx, cx - 5 - i, py + 4 + i, 3, 3, K); }
      for (var i2 = 0; i2 < 8; i2++) { ret(ctx, cx - 4 - i2, py + 5 + i2, 1, 1, METAL); }
      ret(ctx, cx - 16, py + 9, 7, 7, K); ret(ctx, cx - 15, py + 10, 5, 5, METAL2); ret(ctx, cx - 15, py + 10, 5, 1, METAL);
      // tubo (da ocular, embaixo à esquerda, até a lente, lá em cima à direita)
      var x0 = cx - 6, y0 = py + 8, dx = 16, dy = -36, n = 36, k;
      for (k = 0; k <= n; k++) ret(ctx, Math.round(x0 + dx * k / n) - 4, Math.round(y0 + dy * k / n) - 4, 9, 9, K);
      for (k = 0; k <= n; k++) {
        var tx = Math.round(x0 + dx * k / n), ty = Math.round(y0 + dy * k / n);
        ret(ctx, tx - 3, ty - 3, 7, 7, '#eef2fb');
        ret(ctx, tx + 1, ty - 3, 2, 7, '#c9d2ea');
      }
      [0.28, 0.62].forEach(function (f) {
        var bx = Math.round(x0 + dx * f), by = Math.round(y0 + dy * f);
        ret(ctx, bx - 3, by - 3, 7, 3, AZUL); ret(ctx, bx - 3, by - 3, 7, 1, AZUL_CLARO);
      });
      // lente
      var lx = x0 + dx, ly = y0 + dy;
      circulo(ctx, lx, ly, 5, K); circulo(ctx, lx, ly, 4, AZUL2); circulo(ctx, lx, ly, 3, '#1a2060');
      ret(ctx, lx - 2, ly - 2, 2, 1, '#bfe9ff'); ret(ctx, lx - 2, ly - 1, 1, 1, '#bfe9ff');
      // ocular
      ret(ctx, x0 - 8, y0 + 1, 6, 4, K); ret(ctx, x0 - 7, y0 + 2, 4, 2, METAL3);
      // cabeça da montagem
      ret(ctx, cx - 6, py + 1, 11, 8, K); ret(ctx, cx - 5, py + 2, 9, 6, METAL); ret(ctx, cx - 5, py + 6, 9, 1, METAL2);
      circulo(ctx, cx - 1, py + 4, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var on = !t || Math.floor(t / 650) % 2 === 0;
      ret(ctx, px + 17, py + 12, 2, 2, on ? '#ff5c6a' : '#7a2a3a');
      ret(ctx, px + 17, py + 15, 2, 1, (!t || Math.floor(t / 900) % 3) ? C.verde : '#2a5a3a');
    } });
  // painel de controle da cúpula (botões que piscam)
  I.objeto('observatorio-painel', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 9, 30, 23, K);
      ret(ctx, px + 2, py - 8, 28, 21, '#4a5298');
      ret(ctx, px + 2, py - 8, 28, 9, '#5f68b8');
      ret(ctx, px + 2, py + 1, 28, 1, '#2d3370');
      contornoRet(ctx, px + 4, py - 7, 10, 7, '#10183a');
      ret(ctx, px + 5, py - 4, 8, 1, '#2a6a4a'); ret(ctx, px + 6, py - 5, 1, 1, C.verde); ret(ctx, px + 9, py - 3, 1, 1, C.verde);
      contornoRet(ctx, px + 18, py - 7, 10, 7, '#10183a');
      circulo(ctx, px + 23, py - 4, 2, '#1e3a6a'); ret(ctx, px + 23, py - 4, 1, 1, CIANO);
      for (var i = 0; i < 6; i++) { ret(ctx, px + 4 + i * 4, py + 4, 3, 3, K); ret(ctx, px + 5 + i * 4, py + 5, 1, 1, '#2d3370'); }
      ret(ctx, px + 4, py + 9, 24, 2, '#2d3370');
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cores = [C.vermelho, C.ouro, C.verde, CIANO, C.rosa, C.laranja];
      var f = t ? Math.floor(t / 420) : 0;
      for (var i = 0; i < 6; i++) ret(ctx, px + 5 + i * 4, py + 5, 1, 1, (f + i) % 3 === 0 ? cores[i] : cores[(i + 3) % 6]);
      var r = t ? Math.floor(t / 180) % 8 : 2;
      ret(ctx, px + 20 + (r < 4 ? r : 7 - r), py - 5 + (r % 3), 1, 1, C.verde);
      ret(ctx, px + 5 + (t ? Math.floor(t / 250) % 8 : 3), py - 4, 1, 1, C.verde);
    } });
  // lunetinha de latão no tripé
  I.objeto('observatorio-luneta', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      linhaPontos(ctx, [px + 8, py - 2], [px + 3, py + 14], K); linhaPontos(ctx, [px + 8, py - 2], [px + 13, py + 14], K); linhaPontos(ctx, [px + 8, py - 2], [px + 8, py + 13], K);
      linhaPontos(ctx, [px + 8, py - 1], [px + 4, py + 13], C.madeira); linhaPontos(ctx, [px + 8, py - 1], [px + 12, py + 13], C.madeira);
      for (var i = 0; i < 10; i++) ret(ctx, px + 2 + i, py - 2 - Math.round(i * 0.8), 4, 4, K);
      for (var j = 0; j < 10; j++) ret(ctx, px + 3 + j, py - 1 - Math.round(j * 0.8), 2, 2, j < 4 ? C.ouro2 : C.ouro);
      ret(ctx, px + 12, py - 11, 2, 1, '#bfe9ff');
      ret(ctx, px + 7, py - 3, 3, 3, K); ret(ctx, px + 8, py - 2, 1, 1, METAL);
    } });
  // globo celeste (azul-noite com estrelas douradas)
  I.objeto('observatorio-globo', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 1;
      ret(ctx, cx - 4, py + 11, 9, 3, K); ret(ctx, cx - 3, py + 11, 7, 2, C.madeira);
      ret(ctx, cx - 1, py + 5, 3, 7, K); ret(ctx, cx, py + 5, 1, 6, C.madeira3);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, '#2a3380'); circulo(ctx, cx - 1, cy - 1, 4, '#3a44a0');
      [[-3, -2], [2, -4], [3, 1], [-1, 3], [-4, 1], [1, -1]].forEach(function (s, i) { ret(ctx, cx + s[0], cy + s[1], 1, 1, i % 2 ? AMARELA : ESTRELA); });
      for (var a = 0; a < 20; a++) {
        var ang = Math.PI * 0.7 + a / 20 * Math.PI * 1.3;
        ret(ctx, Math.round(cx + Math.cos(ang) * 8), Math.round(cy + Math.sin(ang) * 8), 1, 1, C.ouro2);
      }
    } });
  // projetor de estrelas do Planetário (o "halteres" com furinhos)
  I.objeto('observatorio-projetor', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 3, K); ret(ctx, cx - 4, py + 11, 9, 2, METAL2);
      ret(ctx, cx - 2, py - 2, 5, 14, K); ret(ctx, cx - 1, py - 1, 3, 12, METAL); ret(ctx, cx - 1, py - 1, 1, 12, C.branco);
      circulo(ctx, cx - 4, py - 8, 5, K); circulo(ctx, cx - 4, py - 8, 4, '#2a2f66');
      circulo(ctx, cx + 4, py - 8, 5, K); circulo(ctx, cx + 4, py - 8, 4, '#2a2f66');
      ret(ctx, cx - 1, py - 9, 3, 3, K);
      [[-6, -10], [-3, -11], [-5, -6], [-2, -8], [3, -10], [6, -9], [4, -6], [2, -8]].forEach(function (s) { ret(ctx, cx + s[0], py + s[1], 1, 1, '#4a52a0'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cx = px + 8, f = t ? Math.floor(t / 300) : 1;
      [[-6, -10], [-3, -11], [-5, -6], [-2, -8], [3, -10], [6, -9], [4, -6], [2, -8]].forEach(function (s, i) {
        if ((f + i) % 3 === 0) ret(ctx, cx + s[0], py + s[1], 1, 1, i % 2 ? ESTRELA : CIANO);
      });
    } });
  // chão do Planetário: disco da projeção com as órbitas pontilhadas (Plutão tracejada)
  I.objeto('observatorio-orbitas', { w: 3, h: 3, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var sx = v(o, 'sx', px), sy = v(o, 'sy', py), clip = v(o, 'clip', null);
      ctx.save();
      if (clip && ctx.beginPath) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
      var disco = v(o, 'disco', { rx: 120, ry: 66 });
      elipse(ctx, sx, sy, disco.rx + 2, disco.ry + 1, '#3d3a8a');
      elipse(ctx, sx, sy, disco.rx, disco.ry, '#1d1a4a');
      elipse(ctx, sx, sy, Math.round(disco.rx * 0.5), Math.round(disco.ry * 0.5), '#211d52');
      (v(o, 'aneis', []) || []).forEach(function (a) {
        var passos = Math.max(24, Math.round(a.rx * 2.2));
        for (var i = 0; i < passos; i++) {
          var ang = i / passos * Math.PI * 2;
          var ok = a.tracejado ? (i % 6 < 3) : (i % 2 === 0);
          if (!ok) continue;
          ret(ctx, Math.round(sx + Math.cos(ang) * a.rx), Math.round(sy + Math.sin(ang) * a.ry), 1, 1, a.cor || '#6b6fc4');
        }
      });
      ctx.restore();
    } });
  // o Sol, no meio do Planetário (raios girando devagar)
  I.objeto('observatorio-sol', { w: 2, h: 2, topo: 4, solido: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, cy = py + 14;
      circulo(ctx, cx, cy, 17, 'rgba(255,211,77,0.10)');
      circulo(ctx, cx, cy, 14, 'rgba(255,211,77,0.16)');
      desenharPlaneta(ctx, 'sol', cx, cy, 11);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cx = px + 16, cy = py + 14, giro = t / 2600;
      for (var i = 0; i < 8; i++) {
        var a = giro + i * Math.PI / 4, r1 = 13 + ((i + (t ? Math.floor(t / 500) : 0)) % 2);
        var x = Math.round(cx + Math.cos(a) * r1), y = Math.round(cy + Math.sin(a) * r1);
        ret(ctx, x, y, 1, 1, '#ffb347');
        ret(ctx, Math.round(cx + Math.cos(a) * (r1 + 1.6)), Math.round(cy + Math.sin(a) * (r1 + 1.6)), 1, 1, i % 2 ? '#ffe680' : '#ff9d2e');
      }
    } });
  // cada planeta: pegada fixa de 1 tile; a animação só dá uma voltinha pequena dentro dela
  I.objeto('observatorio-planeta', { w: 1, h: 1, topo: 6, solido: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      elipse(ctx, cx, py + 13, 5, 1, 'rgba(127,224,255,0.20)');
      elipse(ctx, cx, py + 13, 3, 1, 'rgba(127,224,255,0.22)');
      if (v(o, 'id', '') === 'plutao') { ret(ctx, cx - 5, py + 13, 1, 1, '#9a86c8'); ret(ctx, cx + 5, py + 13, 1, 1, '#9a86c8'); }
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var id = v(o, 'id', 'terra'), raio = RAIOS[id] || 4, per = PERIODOS[id] || 4000;
      var fase = v(o, 'fase', 0), a = (t / per) * Math.PI * 2 + fase;
      var dx = Math.round(Math.cos(a) * 2), dy = Math.round(Math.sin(a));
      var s = spritePlaneta(id, raio), cx = px + 8 + dx, cy = py + 6 + dy;
      ctx.drawImage(s, cx - s.width / 2, cy - s.height / 2);
      if (id === 'terra') {
        // a Lua dando a volta na Terra
        var al = (t / 1600) * Math.PI * 2 + 1;
        ret(ctx, Math.round(cx + Math.cos(al) * 7), Math.round(cy + Math.sin(al) * 3), 1, 1, '#e8e4d8');
      } else if (id === 'jupiter') {
        for (var i = 0; i < 2; i++) { var aj = (t / (1300 + i * 900)) * Math.PI * 2 + i * 2; ret(ctx, Math.round(cx + Math.cos(aj) * (10 + i)), Math.round(cy + Math.sin(aj) * 2), 1, 1, '#f4e4c8'); }
      }
    } });
  // foguete na plataforma
  I.objeto('observatorio-foguete', { w: 2, h: 1, topo: 46, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      // plataforma
      ret(ctx, px + 1, py + 7, 30, 8, K); ret(ctx, px + 2, py + 8, 28, 6, METAL2); ret(ctx, px + 2, py + 8, 28, 1, METAL);
      for (var i = 0; i < 7; i++) ret(ctx, px + 3 + i * 4, py + 11, 2, 2, i % 2 ? '#2a2f66' : C.ouro);
      // aletas
      ret(ctx, cx - 11, py - 6, 6, 12, K); ret(ctx, cx - 10, py - 4, 4, 9, C.vermelho); ret(ctx, cx - 10, py - 4, 4, 1, '#ff8a94');
      ret(ctx, cx + 5, py - 6, 6, 12, K); ret(ctx, cx + 6, py - 4, 4, 9, C.vermelho); ret(ctx, cx + 6, py - 4, 4, 1, '#ff8a94');
      // bocal
      ret(ctx, cx - 4, py + 4, 9, 4, K); ret(ctx, cx - 3, py + 5, 7, 2, METAL3);
      // corpo
      ret(ctx, cx - 6, py - 32, 13, 38, K);
      ret(ctx, cx - 5, py - 31, 11, 36, '#f4f6fb');
      ret(ctx, cx + 2, py - 31, 3, 36, '#d0d6e8'); ret(ctx, cx - 5, py - 31, 1, 36, C.branco);
      ret(ctx, cx - 5, py - 8, 11, 2, C.vermelho); ret(ctx, cx - 5, py - 26, 11, 1, METAL2);
      // bico
      triangulo(ctx, cx - 7, py - 45, 15, 14, K);
      triangulo(ctx, cx - 5, py - 43, 11, 12, C.vermelho);
      ret(ctx, cx - 2, py - 38, 1, 5, '#ff8a94');
      // janelinha
      circulo(ctx, cx, py - 19, 3, K); circulo(ctx, cx, py - 19, 2, C.azul); ret(ctx, cx - 1, py - 20, 1, 1, C.branco);
      // bandeirinha do Brasil
      ret(ctx, cx - 3, py - 3, 7, 5, K); ret(ctx, cx - 2, py - 2, 5, 3, '#2e9a4e'); ret(ctx, cx - 1, py - 2, 3, 3, '#ffd34d'); ret(ctx, cx, py - 1, 1, 1, '#2f4fd6');
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var on = !t || Math.floor(t / 500) % 2 === 0;
      ret(ctx, px + 3, py + 9, 1, 1, on ? C.vermelho : '#7a2a3a');
      ret(ctx, px + 28, py + 9, 1, 1, on ? '#7a2a3a' : C.vermelho);
    } });
  // traje de astronauta no manequim
  I.objeto('observatorio-traje', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 3, K); ret(ctx, cx - 4, py + 11, 9, 2, '#2a2f66');
      ret(ctx, cx - 1, py + 7, 3, 5, K); ret(ctx, cx, py + 7, 1, 4, METAL);
      // mochila
      ret(ctx, cx - 6, py - 7, 13, 11, K); ret(ctx, cx - 5, py - 6, 11, 9, '#c9d2ea');
      // pernas
      ret(ctx, cx - 4, py + 3, 4, 6, K); ret(ctx, cx + 1, py + 3, 4, 6, K);
      ret(ctx, cx - 3, py + 3, 2, 5, '#f4f6fb'); ret(ctx, cx + 2, py + 3, 2, 5, '#f4f6fb');
      // corpo e braços
      ret(ctx, cx - 5, py - 6, 11, 11, K); ret(ctx, cx - 4, py - 5, 9, 9, '#f4f6fb');
      ret(ctx, cx - 8, py - 5, 4, 9, K); ret(ctx, cx - 7, py - 4, 2, 7, '#e8ecf5');
      ret(ctx, cx + 5, py - 5, 4, 9, K); ret(ctx, cx + 6, py - 4, 2, 7, '#e8ecf5');
      ret(ctx, cx - 7, py + 2, 2, 2, METAL2); ret(ctx, cx + 6, py + 2, 2, 2, METAL2);
      // painel no peito e bandeira do Brasil
      ret(ctx, cx - 2, py - 2, 5, 3, '#2a2f66'); ret(ctx, cx - 1, py - 1, 1, 1, C.vermelho); ret(ctx, cx + 1, py - 1, 1, 1, C.verde);
      ret(ctx, cx - 4, py - 5, 3, 2, '#2e9a4e'); ret(ctx, cx - 3, py - 5, 1, 1, '#ffd34d');
      // capacete com viseira dourada
      circulo(ctx, cx, py - 11, 6, K); circulo(ctx, cx, py - 11, 5, '#f4f6fb');
      elipse(ctx, cx, py - 11, 3, 2, '#d9a93a'); ret(ctx, cx - 2, py - 12, 2, 1, '#fff3a0');
    } });
  // vitrine com a pedra da Lua
  I.objeto('observatorio-pedra-lua', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      ret(ctx, px + 1, py + 1, 30, 14, K); ret(ctx, px + 2, py + 2, 28, 12, '#3a3f8a'); ret(ctx, px + 2, py + 2, 28, 1, C.ouro);
      ret(ctx, cx - 5, py + 7, 10, 4, K); ret(ctx, cx - 4, py + 8, 8, 2, C.ouro); ret(ctx, cx - 3, py + 8, 6, 1, C.ouro3);
      // caixa de vidro
      ret(ctx, px + 3, py - 11, 26, 13, K); ret(ctx, px + 4, py - 10, 24, 11, '#9fb8e0');
      ret(ctx, px + 4, py - 10, 24, 2, '#c8dcf5');
      // a pedra
      elipse(ctx, cx, py - 3, 7, 3, K); elipse(ctx, cx, py - 3, 6, 2, '#a8a6b8'); ret(ctx, cx - 4, py - 5, 5, 1, '#c8c6d4');
      ret(ctx, cx - 2, py - 3, 2, 1, '#7a7890'); ret(ctx, cx + 3, py - 2, 1, 1, '#7a7890'); ret(ctx, cx + 1, py - 4, 1, 1, '#7a7890');
      ret(ctx, px + 6, py - 9, 1, 5, C.branco); ret(ctx, px + 8, py - 9, 1, 3, C.branco);
    } });
  // meteorito no pedestal
  I.objeto('observatorio-meteorito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 10, 13, 4, K); ret(ctx, cx - 5, py + 10, 11, 3, '#2a2f66');
      ret(ctx, cx - 4, py - 2, 9, 13, K); ret(ctx, cx - 3, py - 1, 7, 11, '#3a3f8a'); ret(ctx, cx - 3, py - 1, 2, 11, '#4a52a8');
      ret(ctx, cx - 5, py - 3, 11, 3, K); ret(ctx, cx - 4, py - 3, 9, 1, C.ouro);
      elipse(ctx, cx, py - 7, 5, 4, K); elipse(ctx, cx, py - 7, 4, 3, '#4a3c3c');
      ret(ctx, cx - 2, py - 9, 2, 1, '#8a7c78'); ret(ctx, cx + 1, py - 6, 2, 1, '#2a2020'); ret(ctx, cx - 3, py - 6, 1, 1, '#2a2020');
      ret(ctx, cx + 2, py - 9, 1, 1, '#d8d4e8'); ret(ctx, cx - 1, py - 5, 1, 1, '#c9c4d6');
    } });
  // cordão de isolamento (postes prateados, corda azul)
  I.objeto('observatorio-cordao', { w: 2, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * T;
      for (var x = px + 4; x < px + W - 4; x++) {
        var f = (x - px - 4) / (W - 8), cai = Math.round(Math.sin(f * Math.PI) * 4);
        ret(ctx, x, py + 4 + cai, 1, 2, K); ret(ctx, x, py + 4 + cai, 1, 1, '#5a6ad0');
      }
      [px + 3, px + W - 4].forEach(function (cx) {
        ret(ctx, cx - 2, py + 12, 5, 3, K); ret(ctx, cx - 1, py + 12, 3, 2, METAL2);
        ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, METAL);
        circulo(ctx, cx, py + 1, 2, K); circulo(ctx, cx, py + 1, 1, C.branco);
      });
    } });
  // plaquinha de legenda num suporte
  I.objeto('observatorio-placa', { w: 1, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      ret(ctx, cx - 1, py + 2, 3, 11, K); ret(ctx, cx, py + 2, 1, 10, METAL);
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, METAL2);
      ret(ctx, cx - 6, py - 5, 13, 9, K); ret(ctx, cx - 5, py - 4, 11, 7, v(o, 'cor', '#2a3380'));
      ret(ctx, cx - 4, py - 3, 6, 1, C.ouro); ret(ctx, cx - 4, py - 1, 9, 1, LILAS); ret(ctx, cx - 4, py + 1, 7, 1, LILAS);
      ret(ctx, cx + 3, py - 3, 1, 1, ESTRELA);
    } });

  /* ================= CURIOSIDADES (ação `curiosidade`) e PIADAS (ação `piada`) ================= */
  var RESERVA_CURIOSIDADE = 'O céu tem muitos segredos!';
  var RESERVA_PIADA = 'Meus parafusos estão felizes!';
  var CONTINUAR = { texto: 'Continuar →', valor: 'mais', principal: true };
  var FIM_CURIOSIDADE = [{ texto: 'Outra curiosidade! ✨', valor: 'outra', principal: true }, { texto: 'Tchau 👋', valor: 'tchau' }];
  var FIM_PIADA = [{ texto: 'Mais uma! 🤖', valor: 'outra', principal: true }, { texto: 'Tchau 👋', valor: 'tchau' }];
  // temas das cenas do telescópio que não têm o mesmo nome de um tema de curiosidade
  var TEMA_DA_CENA = {
    cruzeiro: 'constelacoes', 'cruzeiro-do-sul': 'constelacoes', 'tres-marias': 'constelacoes', orion: 'constelacoes',
    escorpiao: 'constelacoes', constelacao: 'constelacoes', cometa: 'cometas', 'estrela-cadente': 'cometas', meteoro: 'cometas',
    galaxia: 'galaxias', 'via-lactea': 'galaxias', andromeda: 'galaxias', nebulosa: 'estrelas', estrela: 'estrelas',
    aglomerado: 'estrelas', pleiades: 'estrelas', 'sete-estrelo': 'estrelas', eclipse: 'lua', 'lua-cheia': 'lua', crateras: 'lua', foguete: 'foguetes', astronauta: 'astronautas',
    'estacao-espacial': 'astronautas', satelite: 'foguetes',
  };
  var NOME_DA_CENA = {
    lua: 'A Lua', saturno: 'Saturno', cruzeiro: 'O Cruzeiro do Sul', 'cruzeiro-do-sul': 'O Cruzeiro do Sul', jupiter: 'Júpiter',
    marte: 'Marte', venus: 'Vênus', mercurio: 'Mercúrio', terra: 'A Terra', urano: 'Urano', netuno: 'Netuno', plutao: 'Plutão',
    sol: 'O Sol', cometa: 'Um cometa', cometas: 'Um cometa', galaxia: 'Uma galáxia', galaxias: 'Uma galáxia', 'via-lactea': 'A Via Láctea',
    'tres-marias': 'As Três Marias', orion: 'Órion', estrelas: 'As estrelas', nebulosa: 'Uma nebulosa', constelacoes: 'Constelações', pleiades: 'As Plêiades',
  };

  function temasCuriosidade() {
    var O = R.Observatorio;
    try { if (O && O.temas) return O.temas() || []; } catch (e) {}
    var cs = falas().curiosidades || [];
    return cs.map(function (c) { return c.tema; }).filter(function (t, i, a) { return t && a.indexOf(t) === i; });
  }
  // tema de curiosidade para uma cena do telescópio (null = nenhuma curiosidade combina)
  function temaDaCena(cena) {
    var temas = temasCuriosidade();
    if (temas.indexOf(cena) >= 0) return cena;
    var m = TEMA_DA_CENA[cena];
    if (m && temas.indexOf(m) >= 0) return m;
    return null;
  }
  function curiosidadeDe(tema) {
    var O = R.Observatorio;
    if (O && O.curiosidade) {
      try {
        var c = O.curiosidade(tema);
        if ((!c || !c.paginas || !c.paginas.length) && tema !== 'todas') c = O.curiosidade('todas');
        if (c && c.paginas && c.paginas.length) return c;
      } catch (e) { if (window.console) console.error(e); }
    }
    return { id: 'reserva', tema: tema, paginas: [RESERVA_CURIOSIDADE] };
  }
  function piadaDe() {
    var O = R.Observatorio;
    if (O && O.piada) {
      try { var p = O.piada(); if (p && p.paginas && p.paginas.length) return p; } catch (e) { if (window.console) console.error(e); }
    }
    return { id: 'reserva', paginas: [RESERVA_PIADA] };
  }
  // páginas no balão modal: "Continuar →" entre elas; a última com os botões do fim
  function falarPaginas(pags, quem, voz, botoesFim) {
    var Cl = R.Claude, i = 0;
    if (!Cl || !Cl.falar) return Promise.resolve(null);
    function prox(v) {
      if (v === null || v === undefined || v === 'tchau') return v === undefined ? null : v;
      var pg = pags[i], ultima = i >= pags.length - 1;
      i++;
      var r = Cl.falar(pg, { quem: quem, modal: true, voz: voz, fala: [pg], botoes: ultima ? botoesFim : [CONTINUAR] });
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }
  // retrato de um objeto do Observatório para o balão (o planeta grande; os outros, o próprio desenho)
  var retratos = {};
  function retratoDe(o) {
    if (!o) return null;
    var k = o.tipo + ':' + (v(o, 'id', '') || o.chave || '');
    if (retratos[k]) return retratos[k];
    var c = document.createElement('canvas'), cx;
    if (o.tipo === 'observatorio-planeta' || o.tipo === 'observatorio-sol') {
      var id = o.tipo === 'observatorio-sol' ? 'sol' : v(o, 'id', 'terra');
      var raio = id === 'sol' ? 12 : id === 'saturno' ? 7 : id === 'plutao' ? 6 : 9;
      c.width = 44; c.height = 30;
      cx = c.getContext('2d');
      desenharPlaneta(cx, id, 22, 15, raio);
    } else {
      var lib = I.OBJETOS[o.tipo] || {};
      var w = (o.w || lib.w || 1) * T, h = (o.h || lib.h || 1) * T, topo = o.topo !== undefined ? o.topo : (lib.topo || 0);
      c.width = w + 4; c.height = topo + h + 4;
      cx = c.getContext('2d');
      cx.save(); cx.translate(2 - o.x * T, 2 + topo - o.y * T);
      if (lib.desenhar) lib.desenhar(cx, o.x * T, o.y * T, o, R.Progresso);
      if (lib.anim) lib.anim(cx, o.x * T, o.y * T, 0, o);
      cx.restore();
    }
    retratos[k] = c;
    return c;
  }
  function npcDoInterior(ctx, id) {
    var def = (ctx && ctx.interior) || (I.def && I.def('observatorio')) || {};
    return (def.npcs || []).find(function (n) { return n.id === id; }) || null;
  }
  function quemNpc(ctx, id, vozPadrao) {
    var n = npcDoInterior(ctx, id), e = ELENCO[id] || {}, N = R.NPCs;
    var retrato = null;
    try { if (n && N && N.retrato) retrato = [N.retrato(n, 0), N.retrato(n, 1)]; } catch (err) { retrato = null; }
    return { nome: (n && n.nome) || e.nome || id, retrato: retrato, voz: vozPadrao };
  }
  // quem conta a curiosidade: o objeto tocado (planeta, peça da galeria) ou a Doutora Vega
  function quemConta(ctx) {
    var o = ctx && ctx.objeto;
    if (o) {
      var retrato = null;
      try { retrato = retratoDe(o); } catch (e) { retrato = null; }
      return { nome: o.nome || 'Observatório', retrato: retrato, voz: 'npc-vega' };
    }
    return quemNpc(ctx, 'vega', 'npc-vega');
  }

  function contarCuriosidade(acao, ctx) {
    if (acao && acao.tema === 'telescopio') return abrirTelescopio(ctx);
    var tema = (acao && acao.tema) || 'todas', quem = quemConta(ctx);
    function uma() {
      var c = curiosidadeDe(tema);
      if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} }
      return falarPaginas(c.paginas, quem, 'npc-vega', FIM_CURIOSIDADE).then(function (v2) { return v2 === 'outra' ? uma() : v2; });
    }
    return uma();
  }
  function contarPiada(acao, ctx) {
    var quem = quemNpc(ctx, 'cosmo', 'npc-cosmo');
    function uma() {
      var p = piadaDe();
      return falarPaginas(p.paginas, quem, 'npc-cosmo', FIM_PIADA).then(function (v2) { return v2 === 'outra' ? uma() : v2; });
    }
    return uma();
  }

  /* ---------- o painel do telescópio ---------- */
  function animacoesLigadas() {
    try {
      var e = R.Progresso && R.Progresso.estado && R.Progresso.estado();
      return !!(e && e.ajustes && e.ajustes.animacoes) && !(R.util && R.util.reduzMovimentoSistema);
    } catch (err) { return false; }
  }
  // cena de reserva (sem o observatorio-cenas.js): céu redondo com a Lua e estrelas
  function cenaReserva() {
    var c = document.createElement('canvas');
    c.width = 160; c.height = 112;
    var x = c.getContext('2d');
    ret(x, 0, 0, 160, 112, '#0a0d24');
    circulo(x, 80, 56, 52, K); circulo(x, 80, 56, 50, CEU);
    for (var i = 0; i < 40; i++) {
      var sx = 80 + Math.round((sorte(i, 1, 3) - 0.5) * 90), sy = 56 + Math.round((sorte(1, i, 5) - 0.5) * 90);
      if ((sx - 80) * (sx - 80) + (sy - 56) * (sy - 56) < 46 * 46) ret(x, sx, sy, 1, 1, i % 5 ? LILAS : ESTRELA);
    }
    circulo(x, 92, 46, 14, '#e8e4d8'); circulo(x, 87, 43, 3, '#c8c2b4'); circulo(x, 96, 52, 2, '#c8c2b4'); circulo(x, 97, 40, 2, '#c8c2b4');
    return c;
  }
  var ultimaCena = null;
  function sortearCena() {
    var OC = R.ObservatorioCenas, temas = [];
    try { if (OC && OC.temas && OC.cena) temas = (OC.temas() || []).slice(); } catch (e) { temas = []; }
    var comCuriosidade = temas.filter(function (t) { return !!temaDaCena(t); });
    var lista = comCuriosidade.length ? comCuriosidade : temas;
    if (lista.length > 1 && ultimaCena) lista = lista.filter(function (t) { return t !== ultimaCena; });
    var cena = lista.length ? lista[Math.floor(Math.random() * lista.length)] : null;
    ultimaCena = cena;
    return cena;
  }
  function desenharCena(tela, cena, t) {
    var OC = R.ObservatorioCenas, img = null;
    if (cena && OC && OC.cena) { try { img = OC.cena(cena, t); } catch (e) { if (window.console) console.error(e); img = null; } }
    if (!img) img = cenaReserva();
    img = img.canvas || img;
    var x = tela.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, tela.width, tela.height);
    x.drawImage(img, 0, 0, tela.width, tela.height);
  }
  function el(tag, estilo, texto) {
    var e = document.createElement(tag);
    if (estilo) e.setAttribute('style', estilo);
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function abrirTelescopio(ctx) {
    var UI = R.UI;
    if (!UI || !UI.painel || typeof document === 'undefined') return contarCuriosidade({ tipo: 'curiosidade', tema: 'estrelas' }, {});
    var p = UI.painel('telescopio', '🔭 Telescópio', { aoFechar: function () { parar(); } });
    // cena ampliada em pixels inteiros, cabendo na largura e na altura da tela
    // (a conta é em pixels do aparelho: no celular com dpr 3 a cena sai 5× ou 6×, sempre inteira)
    var dpr = window.devicePixelRatio || 1;
    var largura = Math.min(window.innerWidth - 56, 700), altura = window.innerHeight - 330;
    var k = Math.max(Math.ceil(dpr), Math.min(Math.round(4 * dpr), Math.floor(largura * dpr / 160), Math.floor(altura * dpr / 112)));
    var tela = el('canvas', 'display:block;margin:0 auto;width:' + (160 * k / dpr) + 'px;height:' + (112 * k / dpr) + 'px;image-rendering:pixelated;image-rendering:crisp-edges;border-radius:12px;');
    tela.width = 160; tela.height = 112;
    tela.className = 'telescopio-cena';
    var nome = el('h3', 'margin:12px 0 4px;text-align:center;font-size:1.15em;');
    var texto = el('p', 'margin:4px auto 0;max-width:34em;text-align:center;font-size:1.15em;line-height:1.45;');
    texto.className = 'telescopio-texto';
    var ouvir = el('button', null, '🔊 Ouvir');
    ouvir.type = 'button'; ouvir.className = 'btn-grande btn-secundario';
    var denovo = el('button', null, 'Olhar de novo 🔭');
    denovo.type = 'button'; denovo.className = 'btn-grande btn-principal';
    var botoes = el('div', null); botoes.className = 'intro-botoes';
    botoes.appendChild(ouvir); botoes.appendChild(denovo);
    p.conteudo.appendChild(tela); p.conteudo.appendChild(nome); p.conteudo.appendChild(texto); p.conteudo.appendChild(botoes);

    var paginas = [], cenaAtual = null, timer = null;
    function falar() {
      if (!paginas.length || !R.Som || !R.Som.falar) return;
      try { R.Som.calar && R.Som.calar(); R.Som.falar(paginas.slice(), { voz: 'npc-vega' }); } catch (e) { if (window.console) console.error(e); }
    }
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    function olhar() {
      cenaAtual = sortearCena();
      var tema = cenaAtual ? (temaDaCena(cenaAtual) || 'todas') : 'estrelas';
      var c = curiosidadeDe(tema);
      paginas = c.paginas.slice();
      nome.textContent = (cenaAtual && NOME_DA_CENA[cenaAtual]) || (cenaAtual ? cenaAtual.charAt(0).toUpperCase() + cenaAtual.slice(1) : 'O céu da noite');
      texto.textContent = paginas.join(' ');
      desenharCena(tela, cenaAtual, 0);
      if (R.Som && R.Som.tocar) { try { R.Som.tocar('selecionar'); } catch (e) {} }
      falar();
    }
    ouvir.addEventListener('click', function () { falar(); });
    denovo.addEventListener('click', function () { olhar(); });
    olhar();
    // animação leve da cena (5 quadros por segundo), só com as animações ligadas e o painel aberto
    if (animacoesLigadas()) {
      timer = setInterval(function () {
        if (!p.tela.parentNode) { parar(); return; }
        desenharCena(tela, cenaAtual, performance.now());
      }, 200);
    }
    setTimeout(function () { try { denovo.focus(); } catch (e) {} }, 30);
    // o NPC/objeto espera o painel fechar
    return new Promise(function (resolver) {
      var espera = setInterval(function () {
        if (p.tela.parentNode) return;
        clearInterval(espera); parar(); resolver(null);
      }, 150);
    });
  }

  if (R.NPCs && R.NPCs.registrarAcao) {
    R.NPCs.registrarAcao('curiosidade', contarCuriosidade);
    R.NPCs.registrarAcao('piada', contarPiada);
  }
  R.ObservatorioInterior = { retratoDe: retratoDe, abrirTelescopio: abrirTelescopio, temaDaCena: temaDaCena };

  /* ================= LAYOUT ================= */
  // 3 cômodos lado a lado (13 + 13 + 15 tiles), paredes nas fileiras 1-2, chão de 3 a 13.
  // Portas entre eles nas fileiras 9-10; saída embaixo da Cúpula.
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  // objeto de curiosidade (a chave é a mesma do observatorio-falas.js)
  // nome no balão: o do observatorio-falas.js (F.nomes), senão o daqui
  function nomeDe(chave, padrao) { var n = falas().nomes; return (n && n[chave]) || padrao; }
  function cur(chave, nome, tema, o) {
    return Object.assign(o, { chave: chave, nome: nomeDe(chave, nome), acao: { tipo: 'curiosidade', tema: tema } });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {}, F = falas();
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: (F.npcs && F.npcs[id]) || {} };
  }

  var GAL = { x: 1, y: 1 }, CUP = { x: 15, y: 1 }, PLA = { x: 29, y: 1 };

  // Planetário: o Sol no meio (tiles 6-7 × 6-7 do cômodo) e os planetas em órbitas achatadas
  var SOL_LOCAL = { x: 6, y: 6 };
  var PLANETAS = [
    { id: 'mercurio', nome: 'Mercúrio', x: 8, y: 7, fase: 0.5 },
    { id: 'venus', nome: 'Vênus', x: 6, y: 5, fase: 2.1 },
    { id: 'terra', nome: 'Terra', x: 3, y: 7, fase: 4.0 },
    { id: 'marte', nome: 'Marte', x: 10, y: 5, fase: 1.2 },
    { id: 'jupiter', nome: 'Júpiter', x: 4, y: 9, fase: 3.3 },
    { id: 'saturno', nome: 'Saturno', x: 12, y: 8, fase: 5.0 },
    { id: 'urano', nome: 'Urano', x: 9, y: 10, fase: 0.9 },
    { id: 'netuno', nome: 'Netuno', x: 3, y: 3, fase: 2.7 },
    { id: 'plutao', nome: 'Plutão, planeta-anão', x: 13, y: 10, fase: 4.4 },
  ];
  var ACHATAR = 0.55;
  var solPx = { x: (PLA.x + SOL_LOCAL.x + 1) * T, y: (PLA.y + SOL_LOCAL.y + 1) * T };
  var aneis = PLANETAS.map(function (p) {
    var dx = (PLA.x + p.x) * T + 8 - solPx.x, dy = (PLA.y + p.y) * T + 8 - solPx.y;
    var rx = Math.round(Math.sqrt(dx * dx + (dy / ACHATAR) * (dy / ACHATAR)));
    return { rx: rx, ry: Math.round(rx * ACHATAR), cor: p.id === 'plutao' ? '#9a86c8' : '#5d62b8', tracejado: p.id === 'plutao' };
  });
  var orbitas = { tipo: 'observatorio-orbitas', x: PLA.x + 1, y: PLA.y + 3, w: 13, h: 9,
    var: { sx: solPx.x, sy: solPx.y, aneis: aneis, disco: { rx: 118, ry: 68 },
      clip: { x: PLA.x * T, y: (PLA.y + 2) * T, w: 15 * T, h: 11 * T } } };

  var objetos = [].concat(
    /* ---------- CÚPULA DO TELESCÓPIO (entrada) ---------- */
    sala(CUP.x, CUP.y, [
      { tipo: 'observatorio-janela', x: 0, y: 0 }, { tipo: 'observatorio-carta', x: 1, y: 0, var: { desenho: 'cruzeiro' } },
      { tipo: 'arandela', x: 2, y: 0 }, { tipo: 'observatorio-quadro', x: 3, y: 0, var: { cena: 'lua' } },
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'observatorio-quadro', x: 5, y: 0, var: { cena: 'foguete' } },
      { tipo: 'observatorio-carta', x: 6, y: 0, var: { desenho: 'marias' } }, { tipo: 'relogio-parede', x: 7, y: 0, var: { cor: '#5a6ad0' } },
      { tipo: 'observatorio-fenda', x: 8, y: 0 },
      { tipo: 'observatorio-janela', x: 12, y: 0 },
      // o telescópio embaixo da fenda (à direita: a placa do cômodo fica no meio da parede)
      cur('telescopio', 'Telescópio', 'telescopio', { tipo: 'observatorio-telescopio', x: 9, y: 2 }),
      { tipo: 'escrivaninha', x: 0, y: 2, var: { cor: '#5a4a8a', abajur: '#ffd34d' } }, { tipo: 'papeis', x: 0, y: 3 },
      { tipo: 'cadeira', x: 1, y: 3, var: { almofada: '#7c5cff' } }, { tipo: 'pilha-livros', x: 2, y: 2 },
      { tipo: 'observatorio-painel', x: 3, y: 2 }, { tipo: 'cadeira', x: 4, y: 3, var: { almofada: '#5fb4ff' } },
      { tipo: 'observatorio-luneta', x: 5, y: 2 },
      { tipo: 'estante', x: 6, y: 2, var: { cor: '#5a4a8a' } }, { tipo: 'observatorio-globo', x: 12, y: 2 },
      { tipo: 'caixote', x: 12, y: 3, var: { item: 'estrela' } },
      { tipo: 'tapete-redondo', x: 9, y: 4, w: 2, h: 2, var: { cores: ['#3a3f8a', '#ffd34d', '#5a6ad0'] } },
      { tipo: 'vaso-planta', x: 0, y: 5 }, { tipo: 'observatorio-placa', x: 2, y: 5 },
      { tipo: 'tapete', x: 0, y: 6, w: 3, h: 1, var: { cor: '#3a3f8a', borda: '#ffd34d' } },
      { tipo: 'almofada', x: 4, y: 6, var: { cor: '#7c5cff' } },
      { tipo: 'poltrona', x: 11, y: 5, var: { cor: '#5a6ad0' } }, { tipo: 'mesa-centro', x: 11, y: 6 },
      { tipo: 'luminaria-pe', x: 12, y: 4 }, { tipo: 'cesto', x: 12, y: 5 }, { tipo: 'pilha-livros', x: 9, y: 7 },
      { tipo: 'globo', x: 4, y: 4 },
      { tipo: 'sofa', x: 0, y: 12, var: { cor: '#5a6ad0', almofada: '#ffd34d' } }, { tipo: 'planta-alta', x: 0, y: 10 },
      { tipo: 'luminaria-pe', x: 4, y: 11 }, { tipo: 'cesto', x: 2, y: 12 },
      { tipo: 'tapete', x: 1, y: 10, w: 3, h: 1, var: { cor: '#2d3580', borda: '#b58cff' } },
      { tipo: 'observatorio-luneta', x: 12, y: 10 }, { tipo: 'poltrona', x: 10, y: 11, var: { cor: '#7c5cff' } },
      { tipo: 'caixote', x: 12, y: 12, var: { item: 'estrela' } }, { tipo: 'vaso-grande', x: 8, y: 12, var: { cor: '#5a6ad0' } },
      { tipo: 'tapete', x: 9, y: 10, w: 2, h: 1, var: { cor: '#3a3f8a', borda: '#7fe0ff' } }, { tipo: 'almofada', x: 11, y: 11, var: { cor: '#ffd34d' } },
      { tipo: 'vaso-planta', x: 4, y: 12 },
    ]),
    /* ---------- GALERIA DO ESPAÇO ---------- */
    sala(GAL.x, GAL.y, [
      { tipo: 'observatorio-janela', x: 0, y: 0 }, { tipo: 'observatorio-quadro', x: 1, y: 0, var: { cena: 'galaxia' } },
      { tipo: 'arandela', x: 2, y: 0 },
      cur('mapa-constelacoes', 'Mapa das constelações', 'constelacoes', { tipo: 'observatorio-mapa-constelacoes', x: 3, y: 0 }),
      { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'observatorio-quadro', x: 7, y: 0, var: { cena: 'astronauta' } },
      { tipo: 'observatorio-carta', x: 8, y: 0, var: { desenho: 'ursa' } }, { tipo: 'observatorio-quadro', x: 9, y: 0, var: { cena: 'cometa' } },
      { tipo: 'prateleira-parede', x: 10, y: 0, var: { itens: ['globo', 'estrela', 'livro', 'gema'] } },
      { tipo: 'observatorio-janela', x: 12, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      { tipo: 'observatorio-placa', x: 6, y: 2 }, { tipo: 'estante', x: 7, y: 2, var: { cor: '#5a4a8a' } },
      { tipo: 'planta-alta', x: 12, y: 2 },
      // foguete (bem alto) com cordão na frente
      cur('foguete', 'Foguete', 'foguetes', { tipo: 'observatorio-foguete', x: 9, y: 4 }),
      { tipo: 'observatorio-cordao', x: 9, y: 5 }, { tipo: 'observatorio-placa', x: 11, y: 5 },
      // traje de astronauta
      cur('traje', 'Traje de astronauta', 'astronautas', { tipo: 'observatorio-traje', x: 2, y: 4 }),
      { tipo: 'observatorio-placa', x: 3, y: 4, var: { cor: '#3a3f8a' } },
      { tipo: 'tapete-listrado', x: 5, y: 4, w: 3, h: 1, var: { cores: ['#3a3f8a', '#ffd34d', '#5a6ad0', '#ffd34d'] } }, { tipo: 'tapete-redondo', x: 1, y: 5, w: 2, h: 1, var: { cores: ['#3a3f8a', '#ffd34d'] } },
      { tipo: 'vitrine', x: 4, y: 6, var: { itens: ['estrela', 'gema', 'globo'], cor: '#5a4a8a' } },
      // pedra da Lua e meteorito
      cur('pedra-lua', 'Pedra da Lua', 'lua', { tipo: 'observatorio-pedra-lua', x: 2, y: 8 }),
      { tipo: 'observatorio-cordao', x: 0, y: 9 },
      cur('meteorito', 'Meteorito', 'cometas', { tipo: 'observatorio-meteorito', x: 7, y: 7 }),
      { tipo: 'observatorio-placa', x: 8, y: 7 },
      { tipo: 'banco', x: 5, y: 11, var: { cor: '#5a6ad0' } }, { tipo: 'pedestal', x: 10, y: 8, var: { item: 'globo' } },
      { tipo: 'tapete', x: 9, y: 10, w: 3, h: 1, var: { cor: '#3a3f8a', borda: '#7fe0ff' } },
      { tipo: 'luminaria-pe', x: 12, y: 11 }, { tipo: 'vaso-grande', x: 12, y: 12, var: { cor: '#5a6ad0' } },
      { tipo: 'caixote', x: 0, y: 12, var: { item: 'estrela' } }, { tipo: 'cesto', x: 1, y: 12 },
      { tipo: 'almofada', x: 3, y: 11, var: { cor: '#b58cff' } }, { tipo: 'globo', x: 0, y: 6 },
      { tipo: 'vaso-planta', x: 8, y: 12 }, { tipo: 'pedestal', x: 4, y: 2, var: { item: 'gema' } },
    ]),
    /* ---------- PLANETÁRIO ---------- */
    [orbitas],
    sala(PLA.x, PLA.y, [
      { tipo: 'observatorio-janela', x: 0, y: 0 }, { tipo: 'observatorio-ceu', x: 1, y: 0 },
      { tipo: 'observatorio-quadro', x: 3, y: 0, var: { cena: 'cometa' } }, { tipo: 'observatorio-ceu', x: 4, y: 0 },
      { tipo: 'observatorio-carta', x: 6, y: 0, var: { desenho: 'cruzeiro' } }, { tipo: 'observatorio-ceu', x: 7, y: 0 },
      { tipo: 'observatorio-quadro', x: 9, y: 0, var: { cena: 'galaxia' } }, { tipo: 'observatorio-ceu', x: 10, y: 0 },
      { tipo: 'relogio-parede', x: 12, y: 0, var: { cor: '#5a6ad0' } }, { tipo: 'observatorio-ceu', x: 13, y: 0 },
      cur('sol', 'Sol', 'sol', { tipo: 'observatorio-sol', x: SOL_LOCAL.x, y: SOL_LOCAL.y }),
      // plateia em volta (encostada nas paredes)
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'banco', x: 1, y: 2, var: { cor: '#5a6ad0' } },
      { tipo: 'observatorio-projetor', x: 7, y: 2 }, { tipo: 'banco', x: 9, y: 2, var: { cor: '#5a6ad0' } },
      { tipo: 'estante', x: 12, y: 2, var: { cor: '#5a4a8a' } }, { tipo: 'planta-alta', x: 14, y: 2 },
      { tipo: 'poltrona', x: 14, y: 4, var: { cor: '#7c5cff' } }, { tipo: 'luminaria-pe', x: 14, y: 6 },
      { tipo: 'poltrona', x: 0, y: 4, var: { cor: '#7c5cff' } }, { tipo: 'cesto', x: 0, y: 6 },
      { tipo: 'globo', x: 0, y: 11 }, { tipo: 'banco', x: 2, y: 12, var: { cor: '#5a6ad0' } },
      { tipo: 'almofada', x: 5, y: 12, var: { cor: '#b58cff' } }, { tipo: 'banco', x: 6, y: 12, var: { cor: '#5a6ad0' } },
      { tipo: 'almofada', x: 8, y: 12, var: { cor: '#ffd34d' } }, { tipo: 'banco', x: 10, y: 12, var: { cor: '#5a6ad0' } },
      { tipo: 'vaso-grande', x: 14, y: 12, var: { cor: '#5a6ad0' } }, { tipo: 'caixote', x: 14, y: 11, var: { item: 'estrela' } },
      { tipo: 'pilha-livros', x: 11, y: 2 },
    ]),
    sala(PLA.x, PLA.y, PLANETAS.map(function (p) {
      return { tipo: 'observatorio-planeta', x: p.x, y: p.y, chave: p.id, nome: nomeDe(p.id, p.nome), var: { id: p.id, fase: p.fase },
        acao: { tipo: 'curiosidade', tema: p.id } };
    }))
  );

  R.registrarInterior({
    id: 'observatorio',
    lugar: 'observatorio',
    nome: 'Observatório',
    entrada: true,
    pacote: 'interior-observatorio',
    tamanho: { w: 45, h: 15 },
    saida: { x: CUP.x + 6, y: 13 },
    spawn: { x: CUP.x + 6, y: 12 },
    comodos: [
      { id: 'cupula', nome: 'Cúpula do Telescópio', placa: 'Cúpula do Telescópio', rect: { x: CUP.x, y: CUP.y, w: 13, h: 13 },
        piso: 'observatorio-metal', parede: 'observatorio-noite' },
      { id: 'galeria', nome: 'Galeria do Espaço', placa: 'Galeria do Espaço', rect: { x: GAL.x, y: GAL.y, w: 13, h: 13 },
        piso: 'observatorio-ladrilho', parede: 'observatorio-noite',
        paleta: { parede: '#2e2a70', parede2: '#221f5a', rodape: '#7a5ac8' } },
      { id: 'planetario', nome: 'Planetário', placa: 'Planetário', rect: { x: PLA.x, y: PLA.y, w: 15, h: 13 },
        piso: 'observatorio-estrelado', parede: 'observatorio-noite',
        paleta: { parede: '#1f2160', parede2: '#181a4e', rodape: '#4a3a8a' } },
    ],
    portas: [
      { x: GAL.x + 13, y: 9, w: 1, h: 2 },   // galeria ↔ cúpula
      { x: CUP.x + 13, y: 9, w: 1, h: 2 },   // cúpula ↔ planetário
    ],
    corredores: [
      { x: CUP.x + 5, y: 6, w: 3, h: 7 },     // da saída até o telescópio
      { x: CUP.x, y: 9, w: 13, h: 2 },        // porta a porta, na cúpula
      { x: GAL.x + 9, y: 9, w: 4, h: 2 },     // entrada da galeria
    ],
    objetos: objetos,
    npcs: [
      npc('vega', CUP.x + 8, CUP.y + 4, { tipo: 'curiosidade', tema: 'todas' }),
      npc('cosmo', GAL.x + 6, GAL.y + 9, { tipo: 'piada' }),
    ],
  });
})();
