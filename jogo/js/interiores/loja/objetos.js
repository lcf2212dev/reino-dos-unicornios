/* Loja das Fadas, parte 2 de 3: os objetos temáticos (prefixo loja-): vitrines dos enfeites e dos
   prêmios, espelho mágico, balcão e os enfeites do salão. Usa loja/desenhos.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.loja) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.loja;
  var LILAS = S.LILAS, LILAS2 = S.LILAS2, MUSGO = S.MUSGO, MUSGO2 = S.MUSGO2, ROSA = S.ROSA, enfeites = S.enfeites,
      v = S.v, brilho = S.brilho, comprados = S.comprados, premios = S.premios, estadoPremio = S.estadoPremio,
      icone = S.icone, caber = S.caber, estrelinha = S.estrelinha, etiquetaPreco = S.etiquetaPreco,
      cadeado = S.cadeado, medalha = S.medalha, lacinho = S.lacinho, espelhoInfo = S.espelhoInfo,
      cenaEspelho = S.cenaEspelho;

  /* ================= OBJETOS DA LOJA ================= */
  // vitrine dos enfeites: três prateleiras com os ícones de toda a lista; os comprados ganham fundo rosa e selo ✓
  I.objeto('loja-vitrine-enfeites', { w: 5, h: 1, topo: 44, solido: true, alto: true,
    chave: function (P) { var c = comprados(P); return 'enf:' + enfeites().map(function (it) { return c[it.id] ? 1 : 0; }).join(''); },
    desenhar: function (ctx, px, py, o, P) {
      var W = 80, top = py - 44, c = comprados(P), lista = enfeites();
      // móvel de madeira lilás com vidro
      ret(ctx, px + 1, top, W - 2, 60, K);
      ret(ctx, px + 2, top + 1, W - 4, 58, LILAS2);
      for (var f = 0; f < 3; f++) {
        ret(ctx, px + 3, top + 2 + f * 16, W - 6, 13, '#f3eaff');
        ret(ctx, px + 2, top + 15 + f * 16, W - 4, 3, K); ret(ctx, px + 2, top + 16 + f * 16, W - 4, 1, LILAS);
      }
      // gaveta de baixo com puxadores
      ret(ctx, px + 3, top + 50, W - 6, 8, LILAS); ret(ctx, px + 3, top + 50, W - 6, 1, '#e0d0ff');
      ret(ctx, px + 20, top + 53, 4, 2, K); ret(ctx, px + 56, top + 53, 4, 2, K);
      var porFila = Math.max(1, Math.ceil(lista.length / 3)), esp = Math.floor((W - 6) / porFila);
      var x0 = px + 3 + Math.floor((W - 6 - porFila * esp) / 2);
      lista.slice(0, porFila * 3).forEach(function (it, i) {
        var fila = Math.floor(i / porFila), col = i % porFila;
        var cx = x0 + col * esp + Math.floor(esp / 2), base = top + 15 + fila * 16;
        if (c[it.id]) {
          // é seu: fundo rosa e selo verde com ✓
          ret(ctx, cx - 6, base - 12, 12, 12, '#ffc2e0');
          caber(ctx, icone(it.icone), cx - 1, base - 1, 10, 10);
          ret(ctx, cx + 1, base - 5, 5, 5, K); ret(ctx, cx + 2, base - 4, 3, 3, '#3fbf6a');
          ret(ctx, cx + 3, base - 3, 1, 1, C.branco);
        } else {
          // à venda: moedinha de estrela no canto
          caber(ctx, icone(it.icone), cx - 1, base - 1, 10, 10);
          ret(ctx, cx + 1, base - 5, 5, 5, K); ret(ctx, cx + 2, base - 4, 3, 3, C.ouro2); ret(ctx, cx + 3, base - 3, 1, 1, C.ouro3);
        }
      });
      // vidro: reflexo
      ret(ctx, px + 5, top + 3, 1, 5, C.branco); ret(ctx, px + 6, top + 3, 1, 2, C.branco);
      // coroinha no topo
      ret(ctx, px + 36, top - 3, 8, 3, K); ret(ctx, px + 37, top - 2, 6, 1, C.ouro);
    } });
  // vitrine dos prêmios da Escola: em cada lugar o prêmio em cima e, embaixo dele, o selo do estado:
  // medalha de fita (ganho na prova), lacinho rosa (comprado), etiqueta com o preço (à venda) ou
  // cadeado com o prêmio em silhueta (bloqueado). Prateleiras altas: nada cobre o prêmio.
  // Três prateleiras (uma por prova: lendário, raro, comum); com mais de 9 prêmios, mais colunas por prateleira.
  // A pegada ocupa 2 fileiras para caber a terceira prateleira sem subir sobre o espelho mágico.
  var FILAS_PREMIOS = 3;
  I.objeto('loja-vitrine-premios', { w: 3, h: 2, topo: 46, solido: true, alto: true,
    chave: function (P) { return 'pre:' + premios().map(function (a) { return estadoPremio(a, P).charAt(0); }).join(''); },
    desenhar: function (ctx, px, py, o, P) {
      var W = 48, top = py - 46, lista = premios();
      ret(ctx, px + 1, top, W - 2, 80, K);
      ret(ctx, px + 2, top + 1, W - 4, 78, C.ouro2); ret(ctx, px + 2, top + 1, W - 4, 1, C.ouro3);
      for (var f = 0; f < FILAS_PREMIOS; f++) {
        ret(ctx, px + 3, top + 2 + f * 24, W - 6, 21, '#fff6dc');
        ret(ctx, px + 2, top + 23 + f * 24, W - 4, 3, K); ret(ctx, px + 2, top + 24 + f * 24, W - 4, 1, C.ouro);
      }
      // faixa de arco-íris embaixo
      ['#ff7eb6', '#ffd34d', '#6fdc8c', '#5fb4ff', '#b58cff'].forEach(function (cor, i) { ret(ctx, px + 3, top + 74 + i, W - 6, 1, cor); });
      var cols = Math.max(3, Math.ceil(lista.length / FILAS_PREMIOS));
      var esp = cols <= 3 ? 16 : Math.floor((W - 4) / cols), x0 = px + 3 + Math.floor(esp / 2) + Math.floor((W - 6 - cols * esp) / 2);
      lista.slice(0, cols * FILAS_PREMIOS).forEach(function (a, i) {
        var fila = Math.floor(i / cols), col = i % cols;
        var cx = x0 + col * esp, y0 = top + 2 + fila * 24, base = y0 + 12;
        var img = icone('acessorio:' + a.id);
        if (!img) return;
        var st = estadoPremio(a, P), mw = Math.min(13, esp - 1);
        if (st === 'bloqueado') {
          caber(ctx, (window.PA && PA.silhueta) ? PA.silhueta(img) : img, cx, base, mw, 12);
          cadeado(ctx, cx - 2, base + 1);
        } else {
          caber(ctx, img, cx, base, mw, 12);
          if (st === 'aVenda') etiquetaPreco(ctx, cx - 5, base, a.preco);
          else {
            brilho(ctx, cx + 6, y0 + 1, C.branco);
            if (st === 'ganho') medalha(ctx, cx - 3, base);
            else lacinho(ctx, cx - 3, base + 2);
          }
        }
      });
      // chapéu de formatura no topo
      ret(ctx, px + 18, top - 4, 12, 3, K); ret(ctx, px + 19, top - 3, 10, 1, LILAS2); ret(ctx, px + 23, top - 6, 2, 2, K);
    } });
  // espelho mágico (desce sobre o tapete da frente para não passar do alto da parede): mostra a montaria com os enfeites em uso; brilha com Animações
  I.objeto('loja-espelho-magico', { w: 4, h: 1, topo: 30, solido: true,
    chave: function (P) {
      var m = espelhoInfo(P);
      var ap = (m && m.aparencia) || {};
      return m ? 'esp:' + m.id + ':' + m.estagio + ':' + m.enfeites.join(',') + ':' + (m.capa ? 1 : 0) + (m.asasFada ? 1 : 0) +
        ':' + [ap.pele, ap.cabelo, ap.roupa, ap.laco].join(',') : 'esp:-';
    },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 32, top = py - 30;
      // pés de cogumelo (sobre o tapete da frente) e moldura de folhas e flores
      ret(ctx, px + 14, py + 26, 6, 8, K); ret(ctx, px + 44, py + 26, 6, 8, K);
      ret(ctx, px + 15, py + 27, 4, 6, C.creme); ret(ctx, px + 45, py + 27, 4, 6, C.creme);
      elipse(ctx, cx, top + 30, 31, 30, K);
      elipse(ctx, cx, top + 30, 30, 29, MUSGO);
      elipse(ctx, cx, top + 30, 27, 26, K);
      elipse(ctx, cx, top + 30, 26, 25, '#e6f4ff');
      // o reflexo mostra o unicórnio sozinho, grande (em dobro), com todos os enfeites à vista, e a Mariana
      // de pé com ele, pequena; montada, ela cobriria a cabeça dele (o chapéu de chef, a tiara, a pena...)
      var m = espelhoInfo(P), cena = null;
      if (m && window.PA) { try { cena = cenaEspelho(m, cx, top); } catch (e) { cena = null; } }
      if (cena) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, top + 30, 26, 25, 0, 0, Math.PI * 2); ctx.clip();
        ret(ctx, cx - 26, top + 44, 52, 12, '#d8f0c8');
        var lig = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
        var u = cena.uni, mi = cena.mariana;
        if (mi && cena.atras) ctx.drawImage(mi.img, mi.x, mi.y);
        ctx.drawImage(u.img, u.x, u.y, u.img.width * 2, u.img.height * 2);
        if (mi && !cena.atras) ctx.drawImage(mi.img, mi.x, mi.y);
        ctx.imageSmoothingEnabled = lig;
        ctx.restore();
      }
      // reflexo no vidro
      ret(ctx, cx - 20, top + 14, 1, 6, C.branco); ret(ctx, cx - 19, top + 12, 1, 3, C.branco);
      // flores e folhas na moldura
      [[-27, 12, '#ff7eb6'], [26, 16, '#ffd34d'], [-29, 38, '#b58cff'], [28, 42, '#ff9cc6'], [0, 1, '#ff7eb6']].forEach(function (f) {
        ret(ctx, cx + f[0] - 2, top + f[1] - 1, 5, 3, K); ret(ctx, cx + f[0] - 1, top + f[1] - 2, 3, 5, K);
        ret(ctx, cx + f[0] - 1, top + f[1] - 1, 3, 3, f[2]); ret(ctx, cx + f[0], top + f[1], 1, 1, C.ouro3);
      });
      ret(ctx, cx - 18, top + 4, 4, 2, C.folha3); ret(ctx, cx + 14, top + 5, 4, 2, C.folha3);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 32, top = py - 30, f = Math.floor(t / 260) % 6;
      var pos = [[-22, 8], [21, 22], [-24, 34], [23, 48], [-10, 56], [12, 3]];
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

})();
