/* Loja das Fadas: um salão com a Fada Pétala, as vitrines (enfeites e prêmios da Escola)
   e o espelho mágico, que mostra a montaria com os enfeites em uso.
   Só dados e os objetos temáticos da loja; as falas moram em loja-falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.loja) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var LILAS = '#c9a8ff', LILAS2 = '#9b6bd6', MUSGO = '#7fa84a', MUSGO2 = '#5e8a36', ROSA = '#ff9cc6';

  // os mesmos enfeites da tela da Loja (UI.ITENS_LOJA); esta cópia só serve às ferramentas sem a UI
  function enfeites() { return (R.UI && R.UI.ITENS_LOJA) || ENFEITES; }
  var ENFEITES = [
    { id: 'flor', icone: '🌸', preco: 8 }, { id: 'laco', icone: '🎀', preco: 12 },
    { id: 'oculos', icone: '💗', preco: 15 }, { id: 'capa', icone: '🦸', preco: 20 },
    { id: 'coroa', icone: '👑', preco: 25 }, { id: 'estrelinhas', icone: '✨', preco: 30 },
    { id: 'asasFada', icone: '🧚', preco: 45 },
  ];

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  function est(P) { try { return P && P.estado ? P.estado() : null; } catch (e) { return null; } }
  function comprados(P) { var e = est(P); return (e && e.loja) || {}; }
  function premios() { try { return R.Provas ? R.Provas.acessorios() : []; } catch (e) { return []; } }
  function icone(chave) { return (window.PA && PA.iconeDesenho) ? PA.iconeDesenho(chave) : null; }
  // desenha um canvas cabendo numa caixa (sem suavizar), com a base encostada embaixo
  function caber(ctx, img, cx, base, maxW, maxH) {
    img = img && (img.canvas || img);
    if (!img) return;
    var s = Math.min(1, maxW / img.width, maxH / img.height);
    var w = Math.round(img.width * s), h = Math.round(img.height * s);
    var lig = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(cx - w / 2), base - h, w, h);
    ctx.imageSmoothingEnabled = lig;
  }
  // estrelinha de etiqueta (5×5)
  function estrelinha(ctx, x, y, c) {
    ret(ctx, x + 2, y, 1, 5, c); ret(ctx, x, y + 2, 5, 1, c); ret(ctx, x + 1, y + 1, 3, 3, c);
  }
  // lacinho rosa de "é seu"
  function lacinho(ctx, x, y) {
    ret(ctx, x, y, 3, 3, K); ret(ctx, x + 4, y, 3, 3, K); ret(ctx, x + 2, y + 1, 3, 3, K);
    ret(ctx, x + 1, y + 1, 1, 1, '#ff7eb6'); ret(ctx, x + 5, y + 1, 1, 1, '#ff7eb6'); ret(ctx, x + 3, y + 2, 1, 1, '#ffc2d8');
  }
  // o que o espelho mostra: montaria, estágio e enfeites em uso
  function espelhoInfo(P) {
    var e = est(P);
    if (!e || !P.montaria) return null;
    var id = P.montaria(), d = id && P.defUni ? P.defUni(id) : null;
    if (!d) return null;
    var u = e.unis && e.unis[id];
    var estagio = R.Unicornios.estagio(u ? u.xp : 0);
    var us = e.usando || {};
    return { id: id, def: d, estagio: estagio, enfeites: (us.enfeites || []).slice(), capa: !!us.capa, asasFada: !!us.asasFada, aparencia: e.aparencia };
  }

  /* ================= OBJETOS DA LOJA ================= */
  // vitrine dos enfeites: duas prateleiras com os ícones; os comprados ganham laço e brilho
  I.objeto('loja-vitrine-enfeites', { w: 4, h: 1, topo: 30, solido: true,
    chave: function (P) { var c = comprados(P); return 'enf:' + enfeites().map(function (it) { return c[it.id] ? 1 : 0; }).join(''); },
    desenhar: function (ctx, px, py, o, P) {
      var W = 64, top = py - 30, c = comprados(P);
      // móvel de madeira lilás com vidro
      ret(ctx, px + 1, top, W - 2, 46, K);
      ret(ctx, px + 2, top + 1, W - 4, 44, LILAS2);
      ret(ctx, px + 3, top + 2, W - 6, 13, '#f3eaff'); ret(ctx, px + 3, top + 18, W - 6, 13, '#f3eaff');
      ret(ctx, px + 2, top + 15, W - 4, 3, K); ret(ctx, px + 2, top + 16, W - 4, 1, LILAS);
      ret(ctx, px + 2, top + 31, W - 4, 3, K); ret(ctx, px + 2, top + 32, W - 4, 1, LILAS);
      // gaveta de baixo com puxadores
      ret(ctx, px + 3, top + 35, W - 6, 9, LILAS); ret(ctx, px + 3, top + 35, W - 6, 1, '#e0d0ff');
      ret(ctx, px + 16, top + 39, 4, 2, K); ret(ctx, px + 44, top + 39, 4, 2, K);
      enfeites().forEach(function (it, i) {
        var fila = i < 4 ? 0 : 1, col = fila ? i - 4 : i;
        var cx = fila ? px + 16 + col * 16 : px + 8 + col * 16, base = top + (fila ? 31 : 15);
        caber(ctx, icone(it.icone), cx, base, 13, 13);
        if (c[it.id]) { lacinho(ctx, cx + 1, base - 14); brilho(ctx, cx - 5, base - 11, C.ouro3); }
        else { ret(ctx, cx - 4, base + 1, 8, 1, C.ouro); estrelinha(ctx, cx - 2, base - 4, C.ouro); ret(ctx, cx, base - 2, 1, 1, K); }
      });
      // vidro: reflexo
      ret(ctx, px + 5, top + 3, 1, 5, C.branco); ret(ctx, px + 6, top + 3, 1, 2, C.branco);
      // coroinha no topo
      ret(ctx, px + 28, top - 3, 8, 3, K); ret(ctx, px + 29, top - 2, 6, 1, C.ouro);
    } });
  // vitrine dos prêmios da Escola: ganhos coloridos, os outros em silhueta
  I.objeto('loja-vitrine-premios', { w: 3, h: 1, topo: 30, solido: true,
    chave: function (P) { var c = comprados(P); return 'pre:' + premios().map(function (a) { return c[a.id] ? 1 : 0; }).join(''); },
    desenhar: function (ctx, px, py, o, P) {
      var W = 48, top = py - 30, c = comprados(P);
      ret(ctx, px + 1, top, W - 2, 46, K);
      ret(ctx, px + 2, top + 1, W - 4, 44, C.ouro2); ret(ctx, px + 2, top + 1, W - 4, 1, C.ouro3);
      ret(ctx, px + 3, top + 2, W - 6, 13, '#fff6dc'); ret(ctx, px + 3, top + 18, W - 6, 13, '#fff6dc');
      ret(ctx, px + 2, top + 15, W - 4, 3, K); ret(ctx, px + 2, top + 16, W - 4, 1, C.ouro);
      ret(ctx, px + 2, top + 31, W - 4, 3, K); ret(ctx, px + 2, top + 32, W - 4, 1, C.ouro);
      // faixa de arco-íris embaixo
      ['#ff7eb6', '#ffd34d', '#6fdc8c', '#5fb4ff', '#b58cff'].forEach(function (cor, i) { ret(ctx, px + 3, top + 35 + i * 2, W - 6, 2, cor); });
      premios().slice(0, 6).forEach(function (a, i) {
        var fila = i < 3 ? 0 : 1, col = i % 3;
        var cx = px + 8 + col * 16, base = top + (fila ? 31 : 15);
        var img = icone('acessorio:' + a.id);
        if (!img) return;
        if (c[a.id]) { caber(ctx, img, cx, base, 13, 13); brilho(ctx, cx + 6, base - 12, C.branco); }
        else caber(ctx, (window.PA && PA.silhueta) ? PA.silhueta(img) : img, cx, base, 13, 13);
      });
      // chapéu de formatura no topo
      ret(ctx, px + 18, top - 4, 12, 3, K); ret(ctx, px + 19, top - 3, 10, 1, LILAS2); ret(ctx, px + 23, top - 6, 2, 2, K);
    } });
  // espelho mágico: mostra a montaria com os enfeites em uso; brilha com Animações
  I.objeto('loja-espelho-magico', { w: 3, h: 1, topo: 44, solido: true,
    chave: function (P) {
      var m = espelhoInfo(P);
      return m ? 'esp:' + m.id + ':' + m.estagio + ':' + m.enfeites.join(',') + ':' + (m.capa ? 1 : 0) + (m.asasFada ? 1 : 0) : 'esp:-';
    },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 24, top = py - 44;
      // pés de cogumelo e moldura de folhas e flores
      ret(ctx, px + 8, py + 6, 6, 9, K); ret(ctx, px + 34, py + 6, 6, 9, K);
      ret(ctx, px + 9, py + 7, 4, 7, C.creme); ret(ctx, px + 35, py + 7, 4, 7, C.creme);
      elipse(ctx, cx, top + 26, 22, 28, K);
      elipse(ctx, cx, top + 26, 21, 27, MUSGO);
      elipse(ctx, cx, top + 26, 18, 24, K);
      elipse(ctx, cx, top + 26, 17, 23, '#e6f4ff');
      ret(ctx, px + 9, top + 40, 30, 10, '#d8f0c8');
      var m = espelhoInfo(P), spr = null;
      if (m && window.PA) {
        try {
          spr = m.estagio >= 1 && PA.montada
            ? PA.montada(m.def, m.estagio, 0, m.aparencia, { enfeites: m.enfeites, capa: m.capa, asasFada: m.asasFada })
            : PA.unicornio(m.def, m.estagio, 0, { enfeites: m.enfeites, asasFada: m.asasFada });
        } catch (e) { spr = null; }
      }
      if (spr) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, top + 26, 17, 23, 0, 0, Math.PI * 2); ctx.clip();
        caber(ctx, spr, cx, top + 47, 34, 42);
        ctx.restore();
      }
      // reflexo no vidro
      ret(ctx, cx - 12, top + 12, 1, 6, C.branco); ret(ctx, cx - 11, top + 10, 1, 3, C.branco);
      // flores e folhas na moldura
      [[-19, 8, '#ff7eb6'], [18, 12, '#ffd34d'], [-21, 34, '#b58cff'], [20, 38, '#ff9cc6'], [0, 0, '#ff7eb6']].forEach(function (f) {
        ret(ctx, cx + f[0] - 2, top + f[1] - 1, 5, 3, K); ret(ctx, cx + f[0] - 1, top + f[1] - 2, 3, 5, K);
        ret(ctx, cx + f[0] - 1, top + f[1] - 1, 3, 3, f[2]); ret(ctx, cx + f[0], top + f[1], 1, 1, C.ouro3);
      });
      ret(ctx, cx - 16, top + 2, 4, 2, C.folha3); ret(ctx, cx + 12, top + 3, 4, 2, C.folha3);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 24, top = py - 44, f = Math.floor(t / 260) % 6;
      var pos = [[-14, 6], [13, 18], [-16, 30], [15, 42], [-8, 48], [9, 2]];
      var p = pos[f], q = pos[(f + 3) % 6];
      brilho(ctx, cx + p[0], top + p[1], C.ouro3);
      brilho(ctx, cx + q[0], top + q[1], C.branco);
    } });
  // balcão com a caixinha registradora de estrelas
  I.objeto('loja-balcao', { w: 3, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var W = 48;
      ret(ctx, px + 1, py - 2, W - 2, 17, K); ret(ctx, px + 2, py - 1, W - 4, 15, '#ffc2d8');
      for (var x = px + 6; x < px + W - 4; x += 8) ret(ctx, x, py + 1, 1, 12, ROSA);
      ret(ctx, px, py - 5, W, 4, K); ret(ctx, px + 1, py - 4, W - 2, 2, C.madeiraClara);
      // caixa registradora
      ret(ctx, px + 26, py - 15, 16, 11, K); ret(ctx, px + 27, py - 14, 14, 9, LILAS);
      ret(ctx, px + 28, py - 13, 12, 3, '#e6f4ff'); estrelinha(ctx, px + 32, py - 14, C.ouro);
      for (var i = 0; i < 3; i++) ret(ctx, px + 29 + i * 4, py - 8, 2, 2, C.ouro3);
      ret(ctx, px + 36, py - 19, 5, 5, K); ret(ctx, px + 37, py - 18, 3, 3, C.ouro);
      // campainha e fitinhas
      elipse(ctx, px + 10, py - 7, 4, 3, K); elipse(ctx, px + 10, py - 7, 3, 2, C.ouro); ret(ctx, px + 10, py - 11, 1, 2, K);
      ret(ctx, px + 17, py - 8, 5, 3, K); ret(ctx, px + 18, py - 7, 3, 1, '#6fdc8c');
    } });
  // prateleira baixa com potes de pó de estrela
  I.objeto('loja-potes', { w: 2, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 30, 13, K); ret(ctx, px + 2, py + 3, 28, 11, C.madeira);
      ret(ctx, px + 2, py + 8, 28, 1, C.madeira2);
      [['#ffd34d', 4], ['#ff9cc6', 12], ['#9fdcff', 20]].forEach(function (p) {
        var x = px + p[1];
        ret(ctx, x, py - 9, 9, 12, K); ret(ctx, x + 1, py - 8, 7, 10, '#f3fbff');
        ret(ctx, x + 1, py - 4, 7, 6, p[0]); ret(ctx, x + 2, py - 3, 1, 1, C.branco); ret(ctx, x + 5, py - 1, 1, 1, C.branco);
        ret(ctx, x + 1, py - 11, 7, 3, K); ret(ctx, x + 2, py - 10, 5, 1, LILAS);
      });
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 300) % 3;
      brilho(ctx, px + 7 + f * 8, py - 13, C.ouro3);
    } });
  // cogumelo-banquinho
  I.objeto('loja-cogumelo', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', '#ff8a3d');
      ret(ctx, px + 5, py + 4, 6, 10, K); ret(ctx, px + 6, py + 5, 4, 8, C.creme);
      elipse(ctx, px + 8, py + 3, 7, 5, K); elipse(ctx, px + 8, py + 2, 6, 4, cor);
      ret(ctx, px + 4, py + 1, 2, 2, C.branco); ret(ctx, px + 9, py, 2, 1, C.branco); ret(ctx, px + 11, py + 3, 1, 1, C.branco);
    } });
  // pote de vaga-lumes (piscam com Animações)
  I.objeto('loja-vagalumes', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py - 6, 10, 19, K); ret(ctx, px + 4, py - 5, 8, 17, '#e8f6e0');
      ret(ctx, px + 4, py + 7, 8, 5, MUSGO); ret(ctx, px + 3, py - 8, 10, 3, K); ret(ctx, px + 4, py - 7, 8, 1, C.madeira);
      ret(ctx, px + 5, py - 4, 1, 4, C.branco);
    },
    anim: function (ctx, px, py, t) {
      var pts = [[6, -1], [9, 2], [7, 5], [10, -3]];
      for (var i = 0; i < pts.length; i++) {
        if (Math.sin(t / 300 + i * 1.7) > 0) ret(ctx, px + pts[i][0], py + pts[i][1], 2, 2, '#f6ff8a');
      }
    } });
  // cabideiro de capas
  I.objeto('loja-capas', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 20, 2, 32, K); ret(ctx, px + 3, py + 12, 10, 3, K); ret(ctx, px + 4, py + 13, 8, 1, C.madeira);
      ret(ctx, px + 1, py - 20, 14, 2, K);
      [['#b58cff', 1], ['#ff7eb6', 9]].forEach(function (c) {
        ret(ctx, px + c[1], py - 18, 6, 18, K); ret(ctx, px + c[1] + 1, py - 17, 4, 16, c[0]);
        ret(ctx, px + c[1] + 1, py - 17, 4, 2, C.ouro3);
      });
    } });
  // manequim com asinhas de fada
  I.objeto('loja-manequim', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // asinhas
      elipse(ctx, cx - 6, py - 12, 5, 7, K); elipse(ctx, cx + 6, py - 12, 5, 7, K);
      elipse(ctx, cx - 6, py - 12, 4, 6, '#d4f4ff'); elipse(ctx, cx + 6, py - 12, 4, 6, '#d4f4ff');
      ret(ctx, cx - 7, py - 14, 2, 3, '#ffd0ec'); ret(ctx, cx + 6, py - 14, 2, 3, '#ffd0ec');
      // corpo e vestidinho
      circulo(ctx, cx, py - 20, 3, K); circulo(ctx, cx, py - 20, 2, '#f3e6c8');
      ret(ctx, cx - 3, py - 17, 6, 8, K); ret(ctx, cx - 2, py - 16, 4, 6, '#f3e6c8');
      ret(ctx, cx - 5, py - 9, 10, 10, K); ret(ctx, cx - 4, py - 8, 8, 8, ROSA); ret(ctx, cx - 4, py - 8, 8, 1, '#ffd0ec');
      ret(ctx, cx - 1, py + 1, 2, 10, K); ret(ctx, cx - 4, py + 11, 8, 3, K); ret(ctx, cx - 3, py + 12, 6, 1, C.madeira);
    } });
  // tapete de folhas (plano, andável)
  I.objeto('loja-tapete-folhas', { w: 3, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 2) * 16;
      elipse(ctx, px + W / 2, py + H / 2, W / 2 - 1, H / 2 - 1, MUSGO2);
      elipse(ctx, px + W / 2, py + H / 2, W / 2 - 2, H / 2 - 2, MUSGO);
      elipse(ctx, px + W / 2, py + H / 2, W / 2 - 7, H / 2 - 6, '#a8cc6a');
      for (var i = 0; i < W - 8; i += 7) {
        ret(ctx, px + 4 + i, py + H / 2 - 1 + (i % 3) - 1, 4, 2, '#cfe89a');
        ret(ctx, px + 6 + i, py + 5 + (i % 2) * 2, 2, 1, MUSGO2);
      }
      circulo(ctx, px + W / 2, py + H / 2, 2, ROSA);
    } });
  // cesta de laços e fitas
  I.objeto('loja-cesta-lacos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 3, 12, 11, K); ret(ctx, px + 3, py + 4, 10, 9, '#d9ab45');
      for (var x = px + 4; x < px + 13; x += 3) ret(ctx, x, py + 4, 1, 9, '#b8862e');
      lacinho(ctx, px + 3, py - 1); ret(ctx, px + 10, py - 3, 3, 6, K); ret(ctx, px + 11, py - 2, 1, 4, '#5fb4ff');
      ret(ctx, px + 1, py + 2, 14, 2, K);
    } });
  // lanterna de fada pendurada (luz pulsa)
  I.objeto('loja-lanterna', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx, py + 4, 1, 8, K);
      elipse(ctx, cx, py + 18, 5, 6, K); elipse(ctx, cx, py + 18, 4, 5, '#fff3c8');
      ret(ctx, cx - 4, py + 11, 9, 2, K); ret(ctx, cx - 3, py + 11, 7, 1, MUSGO);
      ret(ctx, cx - 1, py + 24, 3, 2, K);
    },
    anim: function (ctx, px, py, t) {
      var a = 0.12 + 0.08 * Math.sin(t / 400 + px);
      elipse(ctx, px + 8, py + 18, 8, 8, 'rgba(255,240,150,' + a.toFixed(2) + ')');
      ret(ctx, px + 7, py + 17, 2, 2, C.ouro3);
    } });
  // janela redonda de casa-cogumelo
  I.objeto('loja-janela-redonda', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, cy = py + 16;
      circulo(ctx, cx, cy, 11, K); circulo(ctx, cx, cy, 10, C.madeira); circulo(ctx, cx, cy, 8, K);
      circulo(ctx, cx, cy, 7, C.ceu);
      ret(ctx, cx - 7, cy + 3, 15, 4, '#9fe0a0'); ret(ctx, cx - 3, cy - 4, 5, 2, C.branco);
      ret(ctx, cx, cy - 8, 1, 16, K); ret(ctx, cx - 8, cy, 16, 1, K);
      ret(ctx, cx - 11, cy + 10, 23, 2, K); ret(ctx, cx - 10, cy + 10, 21, 1, ROSA);
    } });
  // prateleira de parede com rolos de fita
  I.objeto('loja-fitas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 20, 28, 3, K); ret(ctx, px + 3, py + 20, 26, 1, C.madeiraClara);
      ['#ff7eb6', '#ffd34d', '#5fb4ff', '#b58cff', '#6fdc8c'].forEach(function (c, i) {
        var x = px + 3 + i * 5;
        ret(ctx, x, py + 13, 5, 7, K); ret(ctx, x + 1, py + 14, 3, 5, c); ret(ctx, x + 2, py + 16, 1, 1, K);
      });
      ret(ctx, px + 8, py + 23, 2, 6, '#ff7eb6'); ret(ctx, px + 18, py + 23, 2, 4, '#b58cff');
      lacinho(ctx, px + 12, py + 8);
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var TELA = { tipo: 'tela', tela: 'loja' };

  /* ================= LAYOUT ================= */
  // salão 15×12: balcão e Pétala à esquerda, espelho mágico ao fundo à direita, vitrines no meio
  var objetos = [
    // parede do fundo (y 1-2)
    { tipo: 'cortina', x: 1, y: 1, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-janela-redonda', x: 2, y: 1 },
    { tipo: 'cortina', x: 4, y: 1, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-lanterna', x: 5, y: 1 },
    { tipo: 'loja-fitas', x: 6, y: 1 },
    { tipo: 'espelho', x: 8, y: 1 },
    { tipo: 'loja-lanterna', x: 9, y: 1 },
    { tipo: 'espelho', x: 10, y: 1 },
    { tipo: 'loja-lanterna', x: 14, y: 1 },
    { tipo: 'cortina', x: 15, y: 1, var: { cor: '#ff9cc6' } },
    // fundo
    { tipo: 'flores', x: 1, y: 3, var: { vaso: '#b58cff' } },
    inter('potes', 'Potes de pó de estrela', { tipo: 'loja-potes', x: 2, y: 3 }),
    { tipo: 'loja-cesta-lacos', x: 7, y: 3 },
    { tipo: 'vaso-planta', x: 8, y: 3 },
    { tipo: 'loja-vagalumes', x: 9, y: 3 },
    inter('espelho', 'Espelho mágico', { tipo: 'loja-espelho-magico', x: 11, y: 3 }),
    { tipo: 'flores', x: 14, y: 3, var: { vaso: '#ff9cc6' } },
    { tipo: 'loja-capas', x: 15, y: 3 },
    // balcão e tapetes
    { tipo: 'loja-cogumelo', x: 1, y: 4, var: { cor: '#b58cff' } },
    inter('caixa', 'Caixinha das estrelas', { tipo: 'loja-balcao', x: 2, y: 4 }),
    { tipo: 'loja-tapete-folhas', x: 11, y: 4, w: 3, h: 2 },
    { tipo: 'almofada', x: 10, y: 4, var: { cor: '#c9a8ff' } },
    { tipo: 'loja-cogumelo', x: 14, y: 4 },
    { tipo: 'loja-manequim', x: 15, y: 5 },
    { tipo: 'cesto', x: 1, y: 6 },
    { tipo: 'loja-tapete-folhas', x: 2, y: 6, w: 4, h: 2 },
    { tipo: 'flores', x: 15, y: 7, var: { vaso: '#7fa84a' } },
    { tipo: 'loja-cogumelo', x: 10, y: 6, var: { cor: '#ff7eb6' } },
    // vitrines
    { tipo: 'vaso-planta', x: 1, y: 8 },
    inter('vitrine-enfeites', 'Vitrine dos enfeites', { tipo: 'loja-vitrine-enfeites', x: 2, y: 8, acao: TELA }),
    { tipo: 'loja-cogumelo', x: 6, y: 8, var: { cor: '#ffd34d' } },
    inter('vitrine-premios', 'Prêmios da Escola', { tipo: 'loja-vitrine-premios', x: 10, y: 8, acao: TELA }),
    { tipo: 'loja-cogumelo', x: 13, y: 8, var: { cor: '#b58cff' } },
    { tipo: 'vaso-planta', x: 15, y: 9 },
    // frente
    { tipo: 'loja-cogumelo', x: 1, y: 10 },
    { tipo: 'loja-vagalumes', x: 4, y: 10 },
    { tipo: 'almofada', x: 2, y: 11, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-cogumelo', x: 3, y: 11, var: { cor: '#ff7eb6' } },
    { tipo: 'cesto', x: 1, y: 12 }, { tipo: 'flores', x: 5, y: 12, var: { vaso: '#ff9cc6' } },
    { tipo: 'loja-vagalumes', x: 12, y: 10 },
    { tipo: 'almofada', x: 11, y: 11, var: { cor: '#c9a8ff' } },
    { tipo: 'loja-cogumelo', x: 14, y: 11, var: { cor: '#ffd34d' } },
    { tipo: 'flores', x: 13, y: 12, var: { vaso: '#b58cff' } }, { tipo: 'cesto', x: 15, y: 12 },
    { tipo: 'loja-cesta-lacos', x: 14, y: 12 }, { tipo: 'loja-cesta-lacos', x: 15, y: 4 },
  ];

  Reino.registrarInterior({
    id: 'loja',
    lugar: 'loja',
    nome: 'Loja das Fadas',
    entrada: true,
    pacote: 'interior-loja',
    tamanho: { w: 17, h: 14 },
    saida: { x: 8, y: 12 },
    spawn: { x: 8, y: 11 },
    comodos: [
      { id: 'salao', nome: 'Loja das Fadas', placa: 'Loja das Fadas', rect: { x: 1, y: 1, w: 15, h: 12 },
        piso: 'mosaico', parede: 'papel',
        paleta: { piso: '#efe4fb', piso2: '#c9dca0', detalhe: '#ff9cc6', parede: '#ffe8f3', parede2: '#d9c6f5', rodape: '#5e8a36' } },
    ],
    corredores: [
      { x: 7, y: 5, w: 3, h: 8 },     // da porta até o fundo
      { x: 5, y: 5, w: 5, h: 1 },     // até a Pétala
      { x: 6, y: 9, w: 9, h: 1 },     // na frente das vitrines
    ],
    objetos: objetos,
    npcs: [
      npc('petala', 5, 4, TELA),
    ],
  });
})();
