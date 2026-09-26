/* Interiores, biblioteca de objetos 2/3: móveis NO CHÃO (estante, armário, mesas, escrivaninha,
   cadeira, poltrona, sofá, banco e tapetes). Veio de motor/interiores.js.
   Cada objeto('tipo', {...}) entra em Reino._interiores.OBJETOS. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet,
    matriz = D.matriz, sorte = D.sorte, misturar = D.misturar, escurecer = D.escurecer, clarear = D.clarear,
    brilho = D.brilho, miudeza = D.miudeza;
  var II = R._interiores, T = II.T, OBJETOS = II.OBJETOS, objeto = II.objeto, larg = II.larg, cor = II.cor;
  var LIVROS = II.LIVROS;

  /* ----- no chão (pegada no piso; `topo` = quanto o desenho sobe acima da pegada) ----- */
  objeto('estante', { w: 2, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py - 20, w = W - 2, h = 35, c = cor(o, 'cor', C.madeira);
      contornoRet(ctx, x, y, w, h, c);
      ret(ctx, x + 1, y + 1, w - 2, 2, clarear(c, 0.3));
      ret(ctx, x + 3, y + 4, w - 6, h - 8, escurecer(c, 0.55));
      for (var p = 0; p < 3; p++) {
        var base = y + 4 + (p + 1) * 9;
        ret(ctx, x + 2, base - 1, w - 4, 2, clarear(c, 0.15)); ret(ctx, x + 2, base + 1, w - 4, 1, escurecer(c, 0.3));
        var bx = x + 3, n = 0;
        while (bx < x + w - 4) {
          var s = sorte(o.x * 7 + n, o.y * 5 + p, 13), bw = s < 0.5 ? 2 : 3, bh = 5 + Math.floor(sorte(n, p, o.x) * 3);
          if (bx + bw > x + w - 3) break;
          if (s > 0.9) { bx += 2; n++; continue; }
          var cl = LIVROS[Math.floor(sorte(o.x + n, p, 17) * LIVROS.length)];
          ret(ctx, bx, base - 1 - bh, bw, bh, cl); ret(ctx, bx, base - 1 - bh, 1, bh, clarear(cl, 0.35));
          ret(ctx, bx, base - bh + 1, bw, 1, escurecer(cl, 0.25));
          ret(ctx, bx + bw, base - 1 - bh, 1, bh, K);
          bx += bw + 1; n++;
        }
      }
      ret(ctx, x + 1, y + h - 1, 3, 1, K); ret(ctx, x + w - 4, y + h - 1, 3, 1, K);
    } });
  objeto('armario', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py - 18, w = W - 4, h = 33, c = cor(o, 'cor', '#c9e4ff');
      ret(ctx, x - 1, y - 2, w + 2, 4, K); ret(ctx, x, y - 1, w, 2, clarear(c, 0.4));
      contornoRet(ctx, x, y + 1, w, h - 1, c);
      var mw = Math.floor((w - 3) / 2);
      [x + 1, x + 2 + mw].forEach(function (dx) {
        ret(ctx, dx + 1, y + 3, mw - 2, h - 8, escurecer(c, 0.1));
        ret(ctx, dx + 2, y + 4, mw - 4, h - 10, clarear(c, 0.2));
        ret(ctx, dx + 3, y + 5, 1, h - 14, C.branco);
      });
      ret(ctx, x + 1 + mw, y + 2, 1, h - 4, escurecer(c, 0.35));
      circulo(ctx, x + mw - 1, y + 16, 1, C.ouro); circulo(ctx, x + mw + 4, y + 16, 1, C.ouro);
      ret(ctx, x + 1, y + h - 3, w - 2, 2, escurecer(c, 0.25));
      ret(ctx, x, y + h, 3, 1, K); ret(ctx, x + w - 3, y + h, 3, 1, K);
      miudeza(ctx, 'moedas', x + 5, y - 2); miudeza(ctx, 'ursinho', x + w - 7, y - 2);
    } });
  objeto('mesa', { w: 2, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, w = W - 2, toalha = o.var && o.var.toalha, c = cor(o, 'cor', C.madeiraClara);
      ret(ctx, x + 2, py + 4, 3, 11, K); ret(ctx, x + 3, py + 4, 1, 10, C.madeira2);
      ret(ctx, x + w - 5, py + 4, 3, 11, K); ret(ctx, x + w - 4, py + 4, 1, 10, C.madeira2);
      contornoRet(ctx, x, py - 5, w, 10, c);
      ret(ctx, x + 1, py - 4, w - 2, 1, clarear(c, 0.4));
      ret(ctx, x + 1, py + 2, w - 2, 2, escurecer(c, 0.25));
      if (toalha) {
        var t = typeof toalha === 'string' ? toalha : C.rosa2;
        ret(ctx, x + 1, py - 3, w - 2, 6, t);
        for (var i = x + 1; i < x + w - 1; i += 3) { ret(ctx, i, py + 3, 2, 2, t); ret(ctx, i, py + 5, 2, 1, K); ret(ctx, i + 2, py + 3, 1, 2, K); }
        for (var k = x + 2; k < x + w - 2; k += 4) ret(ctx, k, py - 1, 1, 1, C.branco);
      }
      var itens = (o.var && o.var.itens) || ['vaso', 'livro'];
      var passo = (w - 4) / itens.length;
      itens.forEach(function (it, n) { miudeza(ctx, it, Math.round(x + 2 + passo * (n + 0.5)), py); });
    } });
  objeto('mesa-centro', { w: 2, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, w = W - 4, c = cor(o, 'cor', C.madeira);
      ret(ctx, x + 2, py + 9, 2, 5, K); ret(ctx, x + w - 4, py + 9, 2, 5, K);
      contornoRet(ctx, x, py + 1, w, 9, clarear(c, 0.15));
      ret(ctx, x + 1, py + 2, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, py + 7, w - 2, 2, escurecer(c, 0.2));
      var itens = (o.var && o.var.itens) || ['bule', 'xicara'];
      var passo = (w - 4) / itens.length;
      itens.forEach(function (it, n) { miudeza(ctx, it, Math.round(x + 2 + passo * (n + 0.5)), py + 6); });
    } });
  objeto('escrivaninha', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, w = W - 2, c = cor(o, 'cor', C.madeira);
      contornoRet(ctx, x, py - 2, w, 17, escurecer(c, 0.1));
      ret(ctx, x + 1, py - 1, w - 2, 5, clarear(c, 0.25)); ret(ctx, x + 1, py - 1, w - 2, 1, clarear(c, 0.5));
      ret(ctx, x + 1, py + 4, w - 2, 1, escurecer(c, 0.35));
      ret(ctx, x + 3, py + 6, 10, 8, escurecer(c, 0.55));
      contornoRet(ctx, x + w - 13, py + 5, 11, 5, c); contornoRet(ctx, x + w - 13, py + 9, 11, 5, c);
      ret(ctx, x + w - 8, py + 7, 2, 1, C.ouro); ret(ctx, x + w - 8, py + 11, 2, 1, C.ouro);
      ret(ctx, x + 3, py - 4, 8, 5, K); ret(ctx, x + 4, py - 4, 6, 4, C.branco); ret(ctx, x + 5, py - 3, 4, 1, '#c4b4d4'); ret(ctx, x + 5, py - 1, 3, 1, '#c4b4d4');
      ret(ctx, x + 14, py - 3, 4, 4, K); ret(ctx, x + 15, py - 2, 2, 2, '#4a6cd4');
      ret(ctx, x + 17, py - 9, 1, 6, C.branco); ret(ctx, x + 18, py - 10, 1, 4, C.creme2); ret(ctx, x + 16, py - 8, 1, 3, C.creme2);
      ret(ctx, x + w - 9, py - 9, 3, 8, K); ret(ctx, x + w - 8, py - 8, 1, 6, C.ouro2);
      triangulo(ctx, x + w - 12, py - 13, 9, 5, K); triangulo(ctx, x + w - 11, py - 12, 7, 4, cor(o, 'abajur', C.verde));
    } });
  objeto('cadeira', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.madeira), a = cor(o, 'almofada', C.rosa);
      ret(ctx, px + 3, py - 8, 10, 12, K); ret(ctx, px + 4, py - 7, 8, 10, c);
      ret(ctx, px + 5, py - 6, 6, 7, a); ret(ctx, px + 5, py - 6, 6, 1, clarear(a, 0.4));
      ret(ctx, px + 2, py + 3, 12, 5, K); ret(ctx, px + 3, py + 4, 10, 2, clarear(a, 0.2)); ret(ctx, px + 3, py + 6, 10, 1, escurecer(c, 0.2));
      ret(ctx, px + 3, py + 8, 2, 7, K); ret(ctx, px + 11, py + 8, 2, 7, K);
      ret(ctx, px + 3, py + 8, 1, 6, c); ret(ctx, px + 11, py + 8, 1, 6, c);
    } });
  objeto('poltrona', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.lilas), e = escurecer(c, 0.2), l = clarear(c, 0.35);
      elipse(ctx, px + 8, py - 2, 7, 7, K); elipse(ctx, px + 8, py - 2, 6, 6, c); ret(ctx, px + 4, py - 6, 4, 1, l);
      ret(ctx, px + 1, py + 1, 14, 13, K);
      ret(ctx, px + 2, py + 2, 3, 11, e); ret(ctx, px + 11, py + 2, 3, 11, e);
      ret(ctx, px + 2, py + 2, 3, 1, l); ret(ctx, px + 11, py + 2, 3, 1, l);
      ret(ctx, px + 5, py + 4, 6, 6, l); ret(ctx, px + 5, py + 9, 6, 3, c);
      ret(ctx, px + 2, py + 14, 2, 1, K); ret(ctx, px + 12, py + 14, 2, 1, K);
    } });
  objeto('sofa', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.rosa2), e = escurecer(c, 0.2), l = clarear(c, 0.35);
      ret(ctx, px + 2, py - 8, W - 4, 12, K); ret(ctx, px + 3, py - 7, W - 6, 10, c);
      ret(ctx, px + 4, py - 6, W - 8, 1, l);
      ret(ctx, px + W / 2, py - 6, 1, 8, e);
      ret(ctx, px + 1, py, W - 2, 14, K);
      ret(ctx, px + 2, py + 1, 4, 12, e); ret(ctx, px + W - 6, py + 1, 4, 12, e);
      ret(ctx, px + 2, py + 1, 4, 1, l); ret(ctx, px + W - 6, py + 1, 4, 1, l);
      ret(ctx, px + 6, py + 3, W - 12, 6, l); ret(ctx, px + 6, py + 8, W - 12, 4, c);
      ret(ctx, px + W / 2, py + 3, 1, 9, e);
      var al = cor(o, 'almofada', C.ouro);
      ret(ctx, px + 7, py - 3, 6, 6, K); ret(ctx, px + 8, py - 2, 4, 4, al); ret(ctx, px + 8, py - 2, 2, 1, clarear(al, 0.5));
      ret(ctx, px + 3, py + 14, 2, 1, K); ret(ctx, px + W - 5, py + 14, 2, 1, K);
    } });
  objeto('banco', { w: 2, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.madeiraClara);
      ret(ctx, px + 3, py + 7, 3, 8, K); ret(ctx, px + W - 6, py + 7, 3, 8, K);
      ret(ctx, px + 4, py + 7, 1, 7, C.madeira2); ret(ctx, px + W - 5, py + 7, 1, 7, C.madeira2);
      contornoRet(ctx, px + 1, py, W - 2, 8, c);
      ret(ctx, px + 2, py + 1, W - 4, 1, clarear(c, 0.4)); ret(ctx, px + 2, py + 4, W - 4, 1, escurecer(c, 0.15));
      ret(ctx, px + 2, py + 6, W - 4, 1, escurecer(c, 0.3));
    } });
  objeto('tapete', { w: 3, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 2) * T, c = cor(o, 'cor', C.vermelho), b = cor(o, 'borda', C.ouro);
      var x = px + 3, y = py + 2, w = W - 6, h = H - 4;
      for (var f = y + 1; f < y + h - 1; f += 2) { ret(ctx, x - 2, f, 2, 1, C.creme2); ret(ctx, x + w, f, 2, 1, C.creme2); }
      contornoRet(ctx, x, y, w, h, b);
      ret(ctx, x + 2, y + 2, w - 4, h - 4, c);
      ret(ctx, x + 3, y + 3, w - 6, h - 6, escurecer(c, 0.12));
      ret(ctx, x + 4, y + 4, w - 8, h - 8, c);
      var cx = x + Math.floor(w / 2), cy = y + Math.floor(h / 2);
      for (var j = -3; j <= 3; j++) { var m = 3 - Math.abs(j); ret(ctx, cx - m * 2, cy + j, m * 4 + 1, 1, b); }
      ret(ctx, cx, cy, 1, 1, C.branco);
      ret(ctx, x + 6, y + 6, 2, 2, b); ret(ctx, x + w - 8, y + 6, 2, 2, b); ret(ctx, x + 6, y + h - 8, 2, 2, b); ret(ctx, x + w - 8, y + h - 8, 2, 2, b);
    } });
  objeto('tapete-redondo', { w: 2, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 2) * T, cx = px + Math.floor(W / 2), cy = py + Math.floor(H / 2);
      var rx = Math.floor(W / 2) - 2, ry = Math.floor(H / 2) - 3;
      var cores = (o.var && o.var.cores) || [C.lilas, '#e6d6ff', C.rosa2, C.creme];
      elipse(ctx, cx, cy, rx + 1, ry + 1, K);
      cores.forEach(function (c, i) { elipse(ctx, cx, cy, Math.max(1, rx - i * 3), Math.max(1, ry - i * 3), c); });
      for (var a = 0; a < 8; a++) ret(ctx, Math.round(cx + Math.cos(a * Math.PI / 4) * (rx - 1)), Math.round(cy + Math.sin(a * Math.PI / 4) * (ry - 1)), 1, 1, C.branco);
    } });
  objeto('tapete-listrado', { w: 3, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 1) * T, cores = (o.var && o.var.cores) || [C.azul2, C.creme, C.agua, C.creme];
      var x = px + 2, y = py + 2, w = W - 4, h = H - 4;
      contornoRet(ctx, x, y, w, h, cores[0]);
      for (var i = x + 1, k = 0; i < x + w - 1; i += 3, k++) ret(ctx, i, y + 1, Math.min(3, x + w - 1 - i), h - 2, cores[k % cores.length]);
      ret(ctx, x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,0.35)');
      for (var f = x + 1; f < x + w - 1; f += 2) { ret(ctx, f, y - 1, 1, 1, C.creme2); ret(ctx, f, y + h, 1, 1, C.creme2); }
    } });
})();
