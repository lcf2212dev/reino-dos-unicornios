/* Baú do Tesouro: uma caverna do tesouro aconchegante dentro do baú, guardada pelo Dragãozinho Tostão.
   As pilhas de moedas crescem com o dinheiro das salas feitas (derivado de Reino.Progresso).
   Só dados e os objetos temáticos; as falas moram em bau-falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.bau) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // moedinha deitada (5×3) e de pé (4×4)
  function moeda(ctx, x, y) { ret(ctx, x, y, 5, 3, K); ret(ctx, x + 1, y + 1, 3, 1, C.ouro); ret(ctx, x + 1, y, 3, 1, C.ouro3); }
  function moedaPe(ctx, x, y) { ret(ctx, x, y, 4, 4, K); ret(ctx, x + 1, y + 1, 2, 2, C.ouro); ret(ctx, x + 1, y + 1, 1, 1, C.ouro3); }
  function gema(ctx, x, y, c) { ret(ctx, x, y + 1, 5, 2, K); ret(ctx, x + 1, y, 3, 4, K); ret(ctx, x + 1, y + 1, 3, 2, c); ret(ctx, x + 1, y + 1, 1, 1, C.branco); }
  // dinheiro em centavos (derivado das salas feitas)
  function materia(id) { return (R.materias || []).find(function (m) { return m.id === id; }) || null; }
  function centMateria(P, id) { var m = materia(id); return m && P && P.dinheiroMateria ? Math.round(P.dinheiroMateria(m) * 100) : 0; }
  function centTotal(P) { return P && P.dinheiroTotal ? Math.round(P.dinheiroTotal() * 100) : 0; }
  function valorMax() { return ((R.config && R.config.valorPorMateria) || 20) * 100; }
  // ícone da matéria em pixel (desenho de js/icones.js ou o emoji reduzido a pixels)
  function iconeMateria(m) {
    if (!m || !window.PA || typeof document === 'undefined') return null;
    try { var c = PA.iconeEmoji(m.emoji, 1); return c; } catch (e) { return null; }
  }

  /* ================= PILHAS E MONTE (derivados do progresso) ================= */
  I.objeto('bau-pilha', { w: 1, h: 1, topo: 30, solido: true, alto: true,
    chave: function (P, o) { return 'bp:' + v(o, 'materia', '') + ':' + centMateria(P, v(o, 'materia', '')); },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, id = v(o, 'materia', ''), m = materia(id);
      var f = Math.max(0, Math.min(1, centMateria(P, id) / valorMax()));
      var camadas = Math.round(f * 12);   // até 12 moedas de 2 px
      // pratinho dourado
      elipse(ctx, cx, py + 3, 7, 2, K); elipse(ctx, cx, py + 3, 6, 1, C.ouro2);
      if (!camadas) { circulo(ctx, cx - 2, py + 2, 1, C.ouro); circulo(ctx, cx + 3, py + 3, 1, C.ouro3); }
      for (var i = 0; i < camadas; i++) {
        var y = py + 1 - i * 2, dx = (i % 3) - 1;
        ret(ctx, cx - 5 + dx, y - 1, 11, 3, K); ret(ctx, cx - 4 + dx, y, 9, 1, i % 2 ? C.ouro2 : C.ouro);
        ret(ctx, cx - 4 + dx, y - 1, 9, 1, C.ouro3);
      }
      if (camadas >= 12) { ret(ctx, cx - 1, py - 26, 1, 3, C.branco); ret(ctx, cx - 2, py - 25, 3, 1, C.branco); }
      // plaquinha de madeira com o desenho da matéria
      ret(ctx, px + 1, py + 4, 14, 11, K); ret(ctx, px + 2, py + 5, 12, 9, C.madeira); ret(ctx, px + 2, py + 5, 12, 1, C.madeiraClara);
      var ic = iconeMateria(m);
      if (ic) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(ic, 0, 0, ic.width, ic.height, px + 3, py + 5, 10, 10);
      } else ret(ctx, px + 6, py + 7, 4, 4, C.ouro);
    } });
  I.objeto('bau-monte', { w: 3, h: 1, topo: 20, solido: true, alto: true,
    chave: function (P) { return 'bm:' + centTotal(P); },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 24, max = valorMax() * Math.max(1, (R.materias || []).length);
      var f = Math.max(0, Math.min(1, centTotal(P) / max));
      var alt = 3 + Math.round(f * 16), larg = 16 + Math.round(f * 26);
      // base de pedra
      elipse(ctx, cx, py + 11, 22, 4, K); elipse(ctx, cx, py + 10, 21, 3, '#8a6aa0'); elipse(ctx, cx, py + 9, 19, 2, '#a888bc');
      // o monte (triângulo de moedas com contorno)
      triangulo(ctx, cx - larg / 2 - 1, py + 9 - alt, larg + 2, alt + 1, K);
      triangulo(ctx, cx - larg / 2, py + 10 - alt, larg, alt - 1, C.ouro);
      for (var j = 0; j < alt; j += 3) for (var i = -larg / 2; i < larg / 2; i += 5) {
        var x = Math.round(cx + i + (j % 2) * 2), y = py + 9 - j;
        if (Math.abs(x - cx) < (larg / 2) * (j + 2) / alt - 1 || j === 0) ret(ctx, x, y, 3, 1, (i + j) % 2 ? C.ouro2 : C.ouro3);
      }
      moeda(ctx, cx - larg / 2 - 4, py + 9); moeda(ctx, cx + larg / 2, py + 8);
      if (f > 0) { gema(ctx, cx - 3, py + 5 - Math.round(alt / 2), '#ff5c8a'); gema(ctx, cx + 4, py + 6 - Math.round(alt / 3), '#5fb4ff'); }
      if (f >= 0.5) { ctx.fillStyle = K; ctx.fillRect(cx - 4, py + 4 - alt, 9, 5); matriz4(ctx, cx - 4, py + 3 - alt); }
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 300) % 10, xs = [18, 30, 24, 14, 34];
      if (f < 5) { var x = px + xs[f], y = py - 4 - (f * 3) % 10; ret(ctx, x, y - 1, 1, 3, C.branco); ret(ctx, x - 1, y, 3, 1, C.branco); }
    } });
  // coroinha no topo do monte
  function matriz4(ctx, x, y) {
    D.matriz(ctx, x, y, ['k.k.k.k.k', 'kykkykkyk', 'kyyryyyyk', 'kyyyyyyyk', 'kkkkkkkkk'], { k: K, y: C.ouro, r: C.vermelho });
  }

  /* ================= PAREDE DA CAVERNA ================= */
  I.objeto('bau-tocha', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 3, py + 18, 7, 3, K); ret(ctx, cx - 2, py + 19, 5, 1, C.metal2);
      ret(ctx, cx - 1, py + 12, 3, 9, K); ret(ctx, cx, py + 12, 1, 8, C.madeira);
      ret(ctx, cx - 3, py + 10, 7, 3, K); ret(ctx, cx - 2, py + 11, 5, 1, C.ouro2);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, h = 4 + Math.round(Math.sin(t / 110 + px) * 1.5);
      elipse(ctx, cx, py + 7, 6, 6, 'rgba(255,190,90,0.16)');
      ret(ctx, cx - 2, py + 10 - h, 5, h, C.laranja); ret(ctx, cx - 1, py + 9 - h, 3, h, '#ffb04a');
      ret(ctx, cx, py + 10 - h, 1, h - 1, C.ouro3);
    } });
  I.objeto('bau-veio', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#c9a8ff'), e = D.escurecer(c, 0.3);
      [[3, 14, 4, 9], [8, 10, 5, 13], [11, 17, 3, 7]].forEach(function (p) {
        ret(ctx, px + p[0] - 1, py + p[1] - 1, p[2] + 2, p[3] + 2, K);
        ret(ctx, px + p[0], py + p[1], p[2], p[3], c); ret(ctx, px + p[0] + p[2] - 1, py + p[1], 1, p[3], e);
        ret(ctx, px + p[0], py + p[1], 1, p[3] - 2, C.branco);
      });
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 350 + px) % 6;
      if (f < 2) { var x = px + 9, y = py + 12 + f * 4; ret(ctx, x, y - 1, 1, 3, C.branco); ret(ctx, x - 1, y, 3, 1, C.branco); }
    } });
  I.objeto('bau-mapa-tesouro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 7, 28, 20, K); ret(ctx, px + 3, py + 8, 26, 18, '#f3dca8');
      ret(ctx, px + 3, py + 8, 26, 1, '#fff0c8'); ret(ctx, px + 1, py + 6, 4, 22, K); ret(ctx, px + 27, py + 6, 4, 22, K);
      ret(ctx, px + 2, py + 7, 2, 20, '#c98a4b'); ret(ctx, px + 28, py + 7, 2, 20, '#c98a4b');
      // ilhas, trilha pontilhada e o X
      elipse(ctx, px + 10, py + 14, 4, 3, '#9fe0a0'); elipse(ctx, px + 21, py + 20, 5, 3, '#9fe0a0');
      for (var i = 0; i < 6; i++) ret(ctx, px + 11 + i * 2, py + 16 + (i >> 1), 1, 1, C.vermelho);
      D.matriz(ctx, px + 20, py + 18, ['r.r', '.r.', 'r.r'], { r: C.vermelho });
      ret(ctx, px + 23, py + 10, 3, 3, K); ret(ctx, px + 24, py + 11, 1, 1, C.ouro);
    } });
  I.objeto('bau-medalha', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 5, 28, 23, '#7c5cff'); ret(ctx, px + 3, py + 6, 26, 1, '#a88cff');
      // fita e medalha de ouro da escola
      ret(ctx, px + 12, py + 7, 3, 8, K); ret(ctx, px + 17, py + 7, 3, 8, K);
      ret(ctx, px + 13, py + 7, 1, 7, C.vermelho); ret(ctx, px + 18, py + 7, 1, 7, C.azul);
      circulo(ctx, px + 16, py + 18, 6, K); circulo(ctx, px + 16, py + 18, 5, C.ouro2); circulo(ctx, px + 16, py + 18, 4, C.ouro);
      D.matriz(ctx, px + 14, py + 16, ['.w.', 'www', '.w.', 'w.w'], { w: C.ouro3 });
      ret(ctx, px + 13, py + 15, 1, 2, C.branco);
      // estrelinhas nos cantos
      ret(ctx, px + 6, py + 9, 1, 3, C.ouro3); ret(ctx, px + 5, py + 10, 3, 1, C.ouro3);
      ret(ctx, px + 25, py + 22, 1, 3, C.ouro3); ret(ctx, px + 24, py + 23, 3, 1, C.ouro3);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 400) % 5;
      if (f === 0) { ret(ctx, px + 20, py + 12, 1, 3, C.branco); ret(ctx, px + 19, py + 13, 3, 1, C.branco); }
    } });

  /* ================= CHÃO DA CAVERNA ================= */
  I.objeto('bau-cristal', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#c9a8ff'), e = D.escurecer(c, 0.3), l = D.clarear(c, 0.5);
      ret(ctx, px + 2, py + 11, 12, 4, K); ret(ctx, px + 3, py + 12, 10, 2, '#8a6aa0');
      [[3, 3, 4], [7, -8, 3], [10, 0, 3]].forEach(function (p) {
        var x = px + p[0], y = py + p[1], w = p[2] + 2;
        triangulo(ctx, x - 1, y - 3, w + 2, 4, K); ret(ctx, x - 1, y, w + 2, 13 - p[1] - 1, K);
        triangulo(ctx, x, y - 2, w, 3, l); ret(ctx, x, y, w, 12 - p[1] - 1, c);
        ret(ctx, x + w - 1, y, 1, 12 - p[1] - 1, e); ret(ctx, x, y, 1, 8 - p[1] - 2, l);
      });
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 280 + px * 0.1) % 8;
      if (f < 3) { var x = px + 8 + f, y = py - 6 + f * 4; ret(ctx, x, y - 1, 1, 3, C.branco); ret(ctx, x - 1, y, 3, 1, C.branco); }
    } });
  I.objeto('bau-arca', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#8a4a2a');
      ret(ctx, px + 1, py - 8, 30, 23, K);
      ret(ctx, px + 2, py - 7, 28, 7, D.clarear(c, 0.15)); ret(ctx, px + 2, py - 7, 28, 1, D.clarear(c, 0.4));
      ret(ctx, px + 1, py, 30, 1, K);
      ret(ctx, px + 2, py + 1, 28, 13, c); ret(ctx, px + 2, py + 1, 28, 1, D.clarear(c, 0.3));
      [5, 24].forEach(function (x) { ret(ctx, px + x, py - 7, 3, 21, C.ouro); ret(ctx, px + x + 2, py - 7, 1, 21, C.ouro2); });
      ret(ctx, px + 14, py - 2, 5, 6, K); ret(ctx, px + 15, py - 1, 3, 4, C.ouro); ret(ctx, px + 16, py + 1, 1, 1, K);
      // moedinhas escapando da tampa
      moeda(ctx, px + 9, py - 10); moeda(ctx, px + 18, py - 11);
    } });
  I.objeto('bau-saco', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#c9a070'), cx = px + 8;
      elipse(ctx, cx, py + 8, 7, 7, K); elipse(ctx, cx, py + 8, 6, 6, c); elipse(ctx, cx - 2, py + 6, 2, 3, D.clarear(c, 0.3));
      ret(ctx, cx - 3, py - 1, 7, 3, K); ret(ctx, cx - 2, py, 5, 1, c);
      ret(ctx, cx - 4, py + 2, 9, 2, K); ret(ctx, cx - 3, py + 2, 7, 1, C.vermelho);
      D.matriz(ctx, cx - 2, py + 7, ['.yy.', 'y...', '.yy.', '...y', '.yy.'], { y: C.ouro2 });
      moedaPe(ctx, px + 12, py + 11);
    } });
  I.objeto('bau-taca', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // banquinho
      ret(ctx, cx - 6, py + 5, 13, 4, K); ret(ctx, cx - 5, py + 6, 11, 2, '#9b6bd6');
      ret(ctx, cx - 5, py + 9, 2, 6, K); ret(ctx, cx + 4, py + 9, 2, 6, K);
      // taça dourada e coroa
      ret(ctx, cx - 7, py - 9, 8, 7, K); ret(ctx, cx - 6, py - 8, 6, 5, C.ouro); ret(ctx, cx - 6, py - 8, 1, 4, C.ouro3);
      ret(ctx, cx - 4, py - 3, 2, 6, K); ret(ctx, cx - 6, py + 3, 6, 2, K); ret(ctx, cx - 5, py + 3, 4, 1, C.ouro2);
      D.matriz(ctx, cx + 1, py - 2, ['k.k.k', 'kykyk', 'kyryk', 'kkkkk'], { k: K, y: C.ouro, r: C.azul });
      ret(ctx, cx + 1, py + 2, 5, 3, K); ret(ctx, cx + 2, py + 3, 3, 1, C.ouro2);
    } });
  I.objeto('bau-gemas', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 11, 7, 4, K); elipse(ctx, px + 8, py + 11, 6, 3, C.ouro2);
      gema(ctx, px + 2, py + 6, '#ff5c8a'); gema(ctx, px + 7, py + 3, '#5fb4ff'); gema(ctx, px + 10, py + 7, '#6fdc8c');
      gema(ctx, px + 5, py + 9, '#c9a8ff'); moeda(ctx, px + 9, py + 11);
    } });
  I.objeto('bau-balanca', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 2, C.madeira);
      ret(ctx, cx - 1, py - 10, 3, 23, K); ret(ctx, cx, py - 10, 1, 22, C.ouro2);
      ret(ctx, cx - 8, py - 9, 17, 2, K); ret(ctx, cx - 7, py - 9, 15, 1, C.ouro);
      circulo(ctx, cx, py - 11, 2, K); circulo(ctx, cx, py - 11, 1, C.ouro3);
      [-6, 6].forEach(function (d, n) {
        ret(ctx, cx + d, py - 7, 1, 6, K);
        ret(ctx, cx + d - 4, py - 1, 9, 3, K); ret(ctx, cx + d - 3, py - 1, 7, 1, C.ouro);
        if (n) moeda(ctx, cx + d - 2, py - 4); else moeda(ctx, cx + d - 2, py - 3);
      });
    } });
  I.objeto('bau-porquinho', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, r = '#ff9cc6', r2 = '#ff7eb6';
      elipse(ctx, cx, py + 7, 7, 6, K); elipse(ctx, cx, py + 7, 6, 5, r); elipse(ctx, cx - 2, py + 5, 2, 2, '#ffc2d8');
      ret(ctx, cx - 4, py - 1, 3, 3, K); ret(ctx, cx + 2, py - 1, 3, 3, K); ret(ctx, cx - 3, py, 1, 2, r2); ret(ctx, cx + 3, py, 1, 2, r2);
      ret(ctx, cx - 2, py + 1, 5, 1, K);   // fenda da moeda
      ret(ctx, cx + 5, py + 6, 3, 4, K); ret(ctx, cx + 6, py + 7, 1, 2, r2);   // focinho
      ret(ctx, cx + 2, py + 5, 1, 1, K);
      ret(ctx, cx - 5, py + 12, 2, 3, K); ret(ctx, cx + 3, py + 12, 2, 3, K);
      moedaPe(ctx, cx - 1, py - 4);
    } });
  I.objeto('bau-estante', { w: 2, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 20, 30, 35, K); ret(ctx, px + 2, py - 19, 28, 33, '#6b4428');
      var cores = ['#2f6f5a', '#8a2a3a', '#2f4f8a', '#7a5a1e', '#5a3a8a'];
      for (var p = 0; p < 3; p++) {
        var y = py - 18 + p * 11;
        ret(ctx, px + 2, y + 9, 28, 2, K); ret(ctx, px + 2, y + 9, 28, 1, C.madeira);
        for (var i = 0; i < 6; i++) {
          var x = px + 3 + i * 4 + (p % 2), h = 7 + ((i + p) % 2);
          ret(ctx, x, y + 9 - h, 3, h, K); ret(ctx, x, y + 10 - h, 2, h - 1, cores[(i + p) % 5]);
          ret(ctx, x, y + 11 - h, 2, 1, C.ouro);
        }
      }
      moedaPe(ctx, px + 25, py - 11);
    } });
  I.objeto('bau-ninho', { w: 2, h: 2, topo: 2, solido: 'base',
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 20, 15, 10, K); elipse(ctx, px + 16, py + 20, 14, 9, '#a0745a');
      elipse(ctx, px + 16, py + 19, 11, 6, '#7c5cff');
      // travesseiros coloridos
      [[7, 11, '#ff9cc6'], [22, 12, '#ffd34d'], [15, 9, '#9fdcff'], [10, 23, '#6fdc8c'], [23, 24, '#c9a8ff']].forEach(function (p) {
        ret(ctx, px + p[0] - 5, py + p[1] - 3, 10, 7, K); ret(ctx, px + p[0] - 4, py + p[1] - 2, 8, 5, p[2]);
        ret(ctx, px + p[0] - 4, py + p[1] - 2, 8, 1, C.branco);
      });
      moeda(ctx, px + 14, py + 18); moeda(ctx, px + 18, py + 21);
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var TELA = { tipo: 'tela', tela: 'bau' };

  // uma pilha por matéria, até 4 por fileira (x = 5, 7, 9, 11). A 1ª fileira fica no fundo;
  // cada fileira a mais abre uma faixa de 2 tiles (passagem + pilhas) e empurra o resto para baixo.
  // Abaixo do mapa (3-4) e da medalha (12-13) o fundo fica livre: nada alto por cima deles.
  var MATS = R.materias || [], POR = 4, XS = [5, 7, 9, 11];
  var EXTRA = Math.max(0, Math.ceil(MATS.length / POR) - 1), DY = EXTRA * 2;
  var pilhas = [], entre = [], corrFaixa = [];
  function fileiraY(f) { return f === 0 ? 2 : 2 + f * 2; }
  MATS.forEach(function (m, i) {
    var o = inter('pilha', 'Moedas de ' + String(m.nome).replace(/[«»]/g, ''),
      { tipo: 'bau-pilha', x: XS[i % POR], y: fileiraY(Math.floor(i / POR)), var: { materia: m.id }, acao: TELA });
    o.chave = 'pilha-' + m.id;   // mesma fala para todas as pilhas
    o.fala = F.objetos.pilha;
    pilhas.push(o);
  });
  function ocupada(x, y) { return pilhas.some(function (p) { return p.x === x && p.y === y; }); }
  for (var f = 0; f <= EXTRA; f++) {
    var y = fileiraY(f), ini = f === 0 ? 5 : 4;
    for (var x = ini; x <= 11; x++) {
      if (!ocupada(x, y)) entre.push({ tipo: x % 2 ? 'bau-gemas' : 'bau-saco', x: x, y: y });
    }
    if (f > 0) {
      // pontas da faixa: cristais e barris; a passagem acima fica livre
      [0, 2, 13, 15, 17].forEach(function (x, n) {
        entre.push({ tipo: ['bau-cristal', 'barril', 'bau-taca', 'caixote', 'bau-cristal'][n], x: x, y: y,
          var: n === 4 ? { cor: '#ffd34d' } : n === 0 ? { cor: '#9fdcff' } : undefined });
      });
      corrFaixa.push({ x: 1, y: 1 + y - 1, w: 18, h: 1 });
    }
  }
  // desce o que fica abaixo da fileira do fundo
  function desce(lista) { return lista.map(function (o) { if (o.y < 3) return o; var n = Object.assign({}, o); n.y = o.y + DY; return n; }); }

  /* ================= LAYOUT ================= */
  // um salão de 18×13 (fileiras 0 e 1 = parede de pedra); coordenadas locais, deslocadas por (1, 1)
  var objetos = sala(1, 1, desce([
    // parede
    { tipo: 'bau-tocha', x: 0, y: 0 }, { tipo: 'bau-veio', x: 1, y: 0 },
    inter('mapa', 'Mapa do tesouro', { tipo: 'bau-mapa-tesouro', x: 3, y: 0 }),
    { tipo: 'bau-tocha', x: 2, y: 0 },
    { tipo: 'estandarte', x: 5, y: 0, var: { cor: '#7c5cff', emblema: 'estrela' } },
    { tipo: 'bau-veio', x: 6, y: 0, var: { cor: '#9fdcff' } }, { tipo: 'bau-tocha', x: 7, y: 0 },
    { tipo: 'bau-veio', x: 8, y: 0, var: { cor: '#ff9cc6' } }, { tipo: 'bau-tocha', x: 10, y: 0 },
    inter('medalha', 'Medalha de ouro da escola', { tipo: 'bau-medalha', x: 12, y: 0 }),
    { tipo: 'bau-tocha', x: 11, y: 0 },
    { tipo: 'estandarte', x: 14, y: 0, var: { cor: '#d9a93a', emblema: 'coracao' } },
    { tipo: 'bau-veio', x: 15, y: 0, var: { cor: '#6fdc8c' } }, { tipo: 'prateleira-parede', x: 16, y: 0 },
    { tipo: 'bau-tocha', x: 17, y: 0 }, { tipo: 'bau-veio', x: 9, y: 0, var: { cor: '#ffd34d' } },
    // fundo (fileira 2): pilhas no meio, livros à esquerda, cristais nas pontas
    { tipo: 'bau-cristal', x: 0, y: 2 },
    inter('livros', 'Livros de contas', { tipo: 'bau-estante', x: 1, y: 2 }),
    { tipo: 'bau-taca', x: 14, y: 2 }, { tipo: 'bau', x: 15, y: 2 }, { tipo: 'vaso-grande', x: 16, y: 2 },
    { tipo: 'bau-cristal', x: 17, y: 2, var: { cor: '#9fdcff' } },
    // meio: o monte, a balança, o ninho do dragão
    { tipo: 'tapete-redondo', x: 7, y: 6, w: 3, h: 1 },
    inter('monte', 'Monte de moedas', { tipo: 'bau-monte', x: 7, y: 5, acao: TELA }),
    { tipo: 'pilha-livros', x: 0, y: 3 }, { tipo: 'bau-saco', x: 0, y: 4, var: { cor: '#a8b8d8' } },
    inter('balanca', 'Balança de moedas', { tipo: 'bau-balanca', x: 3, y: 4 }),
    { tipo: 'caixote', x: 2, y: 4, var: { item: 'moedas' } }, { tipo: 'almofada', x: 4, y: 4, var: { cor: '#ffd34d' } },
    { tipo: 'bau-gemas', x: 5, y: 3 },
    { tipo: 'tapete', x: 1, y: 6, w: 4, h: 2, var: { cor: '#9b6bd6', borda: '#ffd34d' } },
    inter('ninho', 'Ninho de travesseiros', { tipo: 'bau-ninho', x: 14, y: 3 }),
    { tipo: 'bau-arca', x: 16, y: 5 }, { tipo: 'bau-saco', x: 12, y: 4 }, { tipo: 'almofada', x: 13, y: 6, var: { cor: '#ff9cc6' } },
    { tipo: 'bau-gemas', x: 16, y: 7 }, { tipo: 'bau-cristal', x: 17, y: 8, var: { cor: '#ff9cc6' } },
    // frente
    { tipo: 'bau-arca', x: 0, y: 9, var: { cor: '#6b3a8a' } }, { tipo: 'bau-cristal', x: 0, y: 11, var: { cor: '#6fdc8c' } },
    { tipo: 'barril', x: 1, y: 11 }, { tipo: 'bau-taca', x: 3, y: 10 }, { tipo: 'caixote', x: 4, y: 11, var: { item: 'estrela' } },
    { tipo: 'bau-saco', x: 5, y: 9 }, { tipo: 'almofada', x: 2, y: 8, var: { cor: '#6fdc8c' } },
    { tipo: 'tapete-listrado', x: 11, y: 9, w: 3, h: 1, var: { cores: ['#9b6bd6', '#ffd34d', '#c8324a', '#fff8ee'] } },
    inter('porquinho', 'Cofrinho de porquinho', { tipo: 'bau-porquinho', x: 13, y: 10 }),
    { tipo: 'bau-gemas', x: 12, y: 11 }, { tipo: 'bau-saco', x: 15, y: 11 }, { tipo: 'vaso-grande', x: 17, y: 11 },
    { tipo: 'bau', x: 16, y: 10, var: { moedas: true } }, { tipo: 'bau-cristal', x: 17, y: 10, var: { cor: '#ffd34d' } },
  ]).concat(pilhas, entre));

  Reino.registrarInterior({
    id: 'bau',
    lugar: 'bau',
    nome: 'Baú do Tesouro',
    entrada: true,
    pacote: 'interior-bau',
    tamanho: { w: 20, h: 15 + DY },
    saida: { x: 9, y: 13 + DY },
    spawn: { x: 9, y: 12 + DY },
    comodos: [
      { id: 'caverna', nome: 'Baú do Tesouro', placa: 'Baú do Tesouro', rect: { x: 1, y: 1, w: 18, h: 13 + DY },
        piso: 'pedra', parede: 'pedra',
        paleta: { piso: '#e0b878', piso2: '#b88a52', parede: '#8a6aa0', parede2: '#6b4a82', rodape: '#4a2a5a', detalhe: '#ffd34d' } },
    ],
    corredores: [
      { x: 7, y: 7 + DY, w: 5, h: 7 },     // do tapete até o monte
      { x: 1, y: 9 + DY, w: 18, h: 2 },    // atravessa a caverna
    ].concat(corrFaixa),
    objetos: objetos,
    npcs: [
      npc('tostao', 12, 5 + DY, TELA),
    ],
  });
})();
