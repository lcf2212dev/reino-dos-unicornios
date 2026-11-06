/* Objetos da Cidade Nova (docs/contratos/cidade-nova.md): as fachadas das 4 lojas e as portas, os
   terrenos livres, o portal de volta ao Bosque, a Teleportadora, árvores, bancas, murais e o
   tapete de saída das lojas. Pixel art em código, sem DOM no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores, D = R.Desenho;
  var T = I.T, ret = D.ret, contornoRet = D.contornoRet, elipse = D.elipse, circulo = D.circulo,
    triangulo = D.triangulo, matriz = D.matriz, esc = D.escurecer, cla = D.clarear, K = D.K;

  function cor(o, chave, padrao) { return (o && o.var && o.var[chave]) || padrao; }
  function simbolo(ctx, tipo, cx, cy) {
    if (tipo === 'casa') { // casinha
      ret(ctx, cx - 5, cy - 1, 11, 6, '#8a5530'); ret(ctx, cx - 4, cy, 9, 4, '#ffd34d');
      triangulo(ctx, cx - 6, cy - 5, 13, 5, '#e0433f'); triangulo(ctx, cx - 4, cy - 4, 9, 3, '#ff7a5a');
    } else if (tipo === 'armas') { // espadas cruzadas
      matriz(ctx, cx - 6, cy - 5, ['w....w', '.w..w.', '..ww..', '..ww..', '.w..w.'], { w: '#c9d4e0' });
    } else if (tipo === 'cabecas') { // chapéu
      ret(ctx, cx - 2, cy - 5, 5, 4, '#9b5cff'); ret(ctx, cx - 2, cy - 6, 5, 1, '#ffd34d');
      ret(ctx, cx - 7, cy - 1, 15, 2, '#ff9cc6');
    } else { // armaduras: escudo
      ret(ctx, cx - 5, cy - 5, 11, 7, '#c9d4e0'); ret(ctx, cx - 3, cy + 2, 7, 3, '#c9d4e0');
      ret(ctx, cx - 3, cy - 3, 7, 5, '#3f7fe0'); ret(ctx, cx - 1, cy - 1, 3, 3, '#ffd34d');
    }
  }

  /* ---------- fachada de loja (8×3) e porta (1×1) ---------- */
  I.objeto('cidade-loja', {
    w: 8, h: 3, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#ffb3d9'), x = px + 3, y = py - 24, w = 8 * T - 6, h = 3 * T + 24;
      ret(ctx, x - 3, py + 44, w + 6, 4, 'rgba(58,36,70,0.18)');
      // parede e telhado
      contornoRet(ctx, x, y + 20, w, h - 20, c);
      ret(ctx, x + 2, y + 22, w - 4, 2, cla(c, 0.35));
      ret(ctx, x + 2, py + 42, w - 4, 2, esc(c, 0.2));
      ret(ctx, x - 3, y + 12, w + 6, 10, K);
      ret(ctx, x - 2, y + 13, w + 4, 8, esc(c, 0.35));
      for (var i = 0; i < 8; i++) ret(ctx, x - 2 + i * 16, y + 14, 8, 6, i % 2 ? '#fff8e4' : esc(c, 0.45));
      // placa
      ret(ctx, x + w / 2 - 24, y + 1, 48, 18, K);
      ret(ctx, x + w / 2 - 22, y + 3, 44, 14, '#fff8e4');
      simbolo(ctx, cor(o, 'tipo', 'casa'), x + w / 2, y + 11);
      // vitrines e cortinas
      [x + 10, x + w - 30].forEach(function (wx) {
        ret(ctx, wx - 1, y + 30, 22, 18, K); ret(ctx, wx, y + 31, 20, 16, '#bfe7ff');
        ret(ctx, wx, y + 31, 20, 4, '#e8f6ff'); ret(ctx, wx + 9, y + 31, 2, 16, '#fff8e4');
        ret(ctx, wx, y + 34, 20, 1, 'rgba(255,255,255,0.7)');
      });
      // porta central (a porta interativa fica na frente, na Cidade Nova)
      ret(ctx, x + Math.floor(w / 2) - 10, py + 30, 20, 18, K); ret(ctx, x + Math.floor(w / 2) - 8, py + 32, 16, 16, esc(c, 0.45));
      ret(ctx, x + Math.floor(w / 2) - 1, py + 38, 2, 2, '#ffd34d');
      // floreiras
      [x - 1, x + w - 13].forEach(function (fx) {
        ret(ctx, fx, py + 36, 14, 8, '#8a5530'); ret(ctx, fx + 1, py + 37, 12, 6, '#6fdc8c');
        ret(ctx, fx + 3, py + 35, 2, 2, '#ff6b8a'); ret(ctx, fx + 8, py + 34, 2, 2, '#ffd34d');
      });
    },
  });

  I.objeto('cidade-porta', {
    w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#c9a27a'), x = px + 1, y = py - 10;
      ret(ctx, x + 1, py + 12, 14, 3, 'rgba(58,36,70,0.18)');
      contornoRet(ctx, x, y, 15, 23, c);
      ret(ctx, x + 1, y + 1, 13, 21, esc(c, 0.35));
      ret(ctx, x + 2, y + 2, 11, 19, esc(c, 0.15));
      ret(ctx, x + 3, y + 3, 3, 17, c);
      ret(ctx, x + 9, y + 8, 2, 2, '#ffd34d');
      ret(ctx, x + 3, y - 5, 10, 4, K); ret(ctx, x + 4, y - 4, 8, 2, '#fff8e4');
    },
  });

  /* ---------- terreno livre (5×4, anda por cima) ---------- */
  I.objeto('cidade-terreno', {
    w: 5, h: 4, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var w = 5 * T, h = 4 * T;
      ret(ctx, px + 2, py + 2, w - 4, h - 4, '#c9a27a');
      ret(ctx, px + 4, py + 4, w - 8, h - 8, '#d9b88a');
      for (var i = 0; i < 14; i++) ret(ctx, px + 8 + (i * 37) % (w - 16), py + 10 + (i * 23) % (h - 20), 2, 1, '#b8946a');
      // cerca baixa em volta
      var postes = [[0, 0], [w - 4, 0], [0, h - 4], [w - 4, h - 4], [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 4]];
      postes.forEach(function (p) { ret(ctx, px + p[0], py + p[1] - 2, 4, 10, K); ret(ctx, px + p[0] + 1, py + p[1] - 1, 2, 8, '#c9a27a'); });
      for (var x = 2; x < w - 2; x += 4) { ret(ctx, px + x, py + 2, 4, 2, '#c9a27a'); ret(ctx, px + x, py + h - 4, 4, 2, '#c9a27a'); }
      // placa "?"
      var cx = px + Math.floor(w / 2);
      ret(ctx, cx - 1, py + 20, 2, 14, K); ret(ctx, cx - 1, py + 20, 1, 14, '#8a5530');
      ret(ctx, cx - 12, py + 12, 25, 16, K); ret(ctx, cx - 10, py + 14, 21, 12, '#fff8e4');
      matriz(ctx, cx - 2, py + 17, ['.kkk.', 'k...k', '...k.', '..k..', '..k..', '.....', '..k..'], { k: '#8a5530' });
    },
  });

  /* ---------- portal de volta ao Bosque ---------- */
  I.objeto('cidade-portal-bosque', {
    w: 2, h: 2, solido: 'base', alto: true, topo: 38,
    nome: 'Portal do Bosque', acao: { tipo: 'portalCidade', para: 'bosque' },
    desenhar: function (ctx, px, py) { if (R.PortalCidadeArte) R.PortalCidadeArte.desenhar(ctx, px, py); },
  });

  /* ---------- a Teleportadora (2×2) ---------- */
  I.objeto('cidade-teleportadora', {
    w: 2, h: 2, solido: 'base', alto: true, topo: 42,
    nome: 'Teleportadora',
    desenhar: function (ctx, px, py) { if (R.TeleportadoraArte) R.TeleportadoraArte.desenhar(ctx, px, py, 0, false); },
    anim: function (ctx, px, py, t) { if (R.TeleportadoraArte) R.TeleportadoraArte.animar(ctx, px, py, t); },
  });

  /* ---------- árvore, bandeira, banca, mural e cartaz ---------- */
  I.objeto('cidade-arvore', {
    w: 2, h: 2, solido: 'base', alto: true, topo: 44,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      ret(ctx, cx - 2, py + 18, 5, 16, K); ret(ctx, cx - 1, py + 19, 3, 14, '#8a5530');
      elipse(ctx, cx, py + 10, 18, 14, K); elipse(ctx, cx, py + 10, 16, 12, '#4e9a3c');
      elipse(ctx, cx - 6, py + 7, 9, 7, '#7cc15a'); elipse(ctx, cx + 7, py + 11, 8, 6, '#6fdc8c');
      ret(ctx, cx - 12, py + 3, 6, 2, '#a8e07a'); ret(ctx, cx + 5, py + 4, 5, 1, '#c8f0a0');
    },
  });
  I.objeto('cidade-bandeira', {
    w: 1, h: 2, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#ff6b8a');
      ret(ctx, px + 7, py - 20, 2, 36, K); ret(ctx, px + 8, py - 19, 1, 34, '#c9a27a');
      triangulo(ctx, px + 9, py - 19, 14, 10, K); triangulo(ctx, px + 10, py - 18, 12, 8, c);
      ret(ctx, px + 10, py - 16, 5, 2, '#ffd34d'); ret(ctx, px + 10, py - 12, 8, 1, '#fff8e4');
    },
  });
  I.objeto('cidade-banca', {
    w: 3, h: 2, solido: 'base', alto: true, topo: 20,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#ff9cc6');
      ret(ctx, px + 2, py + 22, 44, 6, K); ret(ctx, px + 3, py + 23, 42, 4, '#c9a27a');
      ret(ctx, px + 4, py + 16, 40, 8, K); ret(ctx, px + 5, py + 17, 38, 6, '#fff8e4');
      for (var i = 0; i < 5; i++) { ret(ctx, px + 7 + i * 7, py + 14, 5, 3, i % 2 ? '#ffd34d' : '#ff6b8a'); }
      ret(ctx, px + 3, py + 4, 42, 12, K); ret(ctx, px + 4, py + 5, 40, 10, c);
      for (var k = 0; k < 5; k++) ret(ctx, px + 5 + k * 8, py + 6, 4, 8, '#fff8e4');
      ret(ctx, px + 3, py + 4, 42, 2, cla(c, 0.4));
    },
  });
  I.objeto('cidade-mural', {
    w: 2, h: 2, solido: true, alto: true, topo: 16,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 20, 30, 4, K); ret(ctx, px + 2, py + 21, 28, 2, '#8a5530');
      ret(ctx, px + 3, py + 2, 26, 20, K); ret(ctx, px + 4, py + 3, 24, 18, '#c9a27a');
      ret(ctx, px + 6, py + 5, 8, 6, '#fff8e4'); ret(ctx, px + 16, py + 5, 9, 4, '#8fd8ff');
      ret(ctx, px + 6, py + 13, 11, 5, '#ffd34d'); ret(ctx, px + 18, py + 11, 7, 8, '#ff9cc6');
      ret(ctx, px + 4, py + 1, 3, 3, '#fff8e4'); ret(ctx, px + 25, py + 1, 3, 3, '#fff8e4');
    },
  });
  I.objeto('cidade-cartaz', {
    w: 1, h: 1, solido: true, alto: true, topo: 16,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 2, 2, 12, K); ret(ctx, px + 7, py + 2, 1, 12, '#8a5530');
      ret(ctx, px + 1, py - 12, 14, 14, K); ret(ctx, px + 2, py - 11, 12, 12, '#fff8e4');
      ret(ctx, px + 4, py - 9, 8, 1, '#8a5530'); ret(ctx, px + 4, py - 6, 6, 1, '#8a5530'); ret(ctx, px + 4, py - 3, 7, 1, '#8a5530');
    },
  });

  /* ---------- tapete de saída das lojas (anda por cima) ---------- */
  I.objeto('cidade-saida', {
    w: 1, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 14, 12, K); ret(ctx, px + 2, py + 4, 12, 10, '#c9a27a');
      ret(ctx, px + 3, py + 5, 10, 8, '#ffd34d');
      matriz(ctx, px + 5, py + 6, ['..k..', '.kkk.', 'kkkkk', '.kkk.', '..k..'], { k: '#8a5530' });
    },
  });
})();
