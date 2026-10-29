/* Interiores, biblioteca de objetos 1/3: os que ficam NA PAREDE (janela, cortina, quadros,
   estandarte, vitral, cartaz, relógio, prateleira, arandela, lousa, mapa, espelho, bandeirinhas).
   Veio de motor/interiores.js. Cada objeto('tipo', {...}) entra em Reino._interiores.OBJETOS
   (a ordem de registro é a do arquivo original). Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet,
    matriz = D.matriz, sorte = D.sorte, misturar = D.misturar, escurecer = D.escurecer, clarear = D.clarear,
    brilho = D.brilho, miudeza = D.miudeza;
  var II = R._interiores, T = II.T, OBJETOS = II.OBJETOS, objeto = II.objeto, larg = II.larg, cor = II.cor;

  /* ----- na parede (pegada nas 2 fileiras da parede; desenho entre y+9 e y+30) ----- */
  function vidraca(ctx, x, y, w, h, noite) {
    ret(ctx, x, y, w, h, noite ? '#4a3a7a' : C.ceu);
    ret(ctx, x, y + h - 4, w, 4, noite ? '#5a4a8a' : '#d6f2ff');
    if (!noite) {
      ret(ctx, x + 2, y + 3, 4, 1, C.branco); ret(ctx, x + 1, y + 4, 6, 1, C.branco);
      if (w > 10) { ret(ctx, x + w - 6, y + 6, 3, 1, C.branco); ret(ctx, x + w - 7, y + 7, 5, 1, C.branco); }
      ret(ctx, x, y + h - 2, w, 2, '#b6e39a');
    } else {
      ret(ctx, x + 2, y + 2, 1, 1, C.ouro3); ret(ctx, x + w - 3, y + 4, 1, 1, C.branco);
      circulo(ctx, x + w - 4, y + 3, 1, C.ouro3);
    }
  }
  objeto('janela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py + 8, w = W - 2, h = 18, mold = cor(o, 'moldura', C.creme);
      contornoRet(ctx, x, y, w, h, mold);
      vidraca(ctx, x + 2, y + 2, w - 4, h - 4, o.var && o.var.noite);
      ret(ctx, x + Math.floor(w / 2) - 1, y + 2, 2, h - 4, mold);
      ret(ctx, x + 2, y + Math.floor(h / 2) - 1, w - 4, 1, mold);
      ret(ctx, x - 1, y + h - 1, w + 2, 3, K); ret(ctx, x, y + h - 1, w, 2, C.madeiraClara); ret(ctx, x, y + h - 1, w, 1, clarear(C.madeiraClara, 0.4));
      ret(ctx, x + 3, y + h - 3, 2, 2, C.rosa); ret(ctx, x + w - 5, y + h - 3, 2, 2, C.ouro);
    },
    luz: function (ctx, px, py, o) {   // sol entrando no piso logo abaixo
      var W = larg(o);
      for (var j = 0; j < 12; j++) ret(ctx, px + 2 + Math.floor(j / 3), py + 32 + j, W - 4, 1, 'rgba(255,248,200,' + (0.30 - j * 0.02).toFixed(2) + ')');
    } });
  objeto('cortina', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.rosa), c2 = escurecer(c, 0.2);
      contornoRet(ctx, px + 2, py + 9, W - 4, 17, C.creme);
      vidraca(ctx, px + 3, py + 10, W - 6, 15);
      ret(ctx, px, py + 6, W, 2, K); ret(ctx, px + 1, py + 6, W - 2, 1, C.ouro);
      [px + 1, px + W - 6].forEach(function (x, lado) {
        ret(ctx, x - 1, py + 8, 7, 21, K);
        ret(ctx, x, py + 8, 5, 20, c);
        ret(ctx, x + (lado ? 3 : 1), py + 8, 1, 20, c2);
        ret(ctx, x + (lado ? 1 : 3), py + 8, 1, 20, clarear(c, 0.35));
        ret(ctx, x, py + 20, 5, 1, C.ouro);
      });
      ret(ctx, px + 1, py + 8, W - 2, 3, K); ret(ctx, px + 2, py + 8, W - 4, 2, c);
      for (var i = px + 2; i < px + W - 2; i += 3) ret(ctx, i, py + 10, 2, 1, c2);
    },
    luz: function (ctx, px, py, o) { OBJETOS.janela.luz(ctx, px, py, o); } });
  var CENAS_QUADRO = {
    paisagem: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, C.ceu); circulo(ctx, x + w - 3, y + 2, 1, C.ouro);
      elipse(ctx, x + 3, y + h, 5, 4, C.folha); elipse(ctx, x + w - 2, y + h, 6, 3, C.folha2);
      ret(ctx, x + 2, y + h - 4, 1, 1, C.rosa);
    },
    flor: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#fff1d0'); var cx = x + Math.floor(w / 2);
      ret(ctx, cx, y + 4, 1, h - 4, C.folha3); ret(ctx, cx + 1, y + h - 4, 2, 1, C.folha);
      circulo(ctx, cx, y + 3, 2, C.rosa); ret(ctx, cx, y + 3, 1, 1, C.ouro);
    },
    mar: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, C.ceu); ret(ctx, x, y + h - 5, w, 5, C.azul); ret(ctx, x, y + h - 5, w, 1, C.branco);
      ret(ctx, x + 2, y + h - 8, 3, 3, C.branco); ret(ctx, x + 3, y + h - 10, 1, 2, C.madeira3);
    },
    retrato: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#e6d6ff'); var cx = x + Math.floor(w / 2);
      elipse(ctx, cx, y + h - 1, 4, 3, C.azul); circulo(ctx, cx, y + 4, 2, '#f1c7a5');
      ret(ctx, cx - 2, y + 1, 5, 2, '#5a3825'); ret(ctx, cx - 1, y + 4, 1, 1, K); ret(ctx, cx + 1, y + 4, 1, 1, K);
    },
    castelo: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#ffe6f2'); var cx = x + Math.floor(w / 2);
      ret(ctx, cx - 3, y + 4, 7, h - 4, C.creme2); ret(ctx, cx - 3, y + 2, 2, 2, C.laranja); ret(ctx, cx + 2, y + 2, 2, 2, C.laranja);
      ret(ctx, cx - 1, y + h - 3, 2, 3, C.roxo); ret(ctx, x, y + h - 1, w, 1, C.folha);
    },
  };
  objeto('quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py + 10, w = W - 4, h = 14;
      ret(ctx, px + Math.floor(W / 2), py + 6, 1, 4, K);
      contornoRet(ctx, x, y, w, h, cor(o, 'moldura', C.ouro));
      ret(ctx, x + 1, y + 1, w - 2, 1, C.ouro3);
      var nomes = Object.keys(CENAS_QUADRO);
      var cena = (o.var && o.var.cena) || nomes[Math.floor(sorte(o.x, o.y, 4) * nomes.length)];
      (CENAS_QUADRO[cena] || CENAS_QUADRO.paisagem)(ctx, x + 2, y + 2, w - 4, h - 4);
      ret(ctx, x + 1, y + h - 1, w - 2, 1, C.ouro2);
    } });
  // quadro que mostra um unicórnio do deck: silhueta até ela ganhar, depois o unicórnio
  function spriteUni(P, id, larguraMax, alturaMax) {
    if (!window.PA || !PA.unicornio || !P || !P.defUni) return null;
    var def = P.defUni(id);
    if (!def) return null;
    for (var e = 3; e >= 0; e--) {
      var s = PA.unicornio(def, e, 0);
      var c = s && (s.canvas || s);
      if (c && c.width <= larguraMax && c.height <= alturaMax) return c;
    }
    var ultimo = PA.unicornio(def, 0, 0);
    return ultimo && (ultimo.canvas || ultimo);
  }
  objeto('quadro-unicornio', { w: 2, h: 2, parede: true, solido: false,
    chave: function (P, o) { var id = o && o.var && o.var.uni; return 'qu:' + id + ':' + (P && P.temUni && id && P.temUni(id) ? 1 : 0); },
    desenhar: function (ctx, px, py, o, P) {
      var W = larg(o), x = px + 2, y = py + 7, w = W - 4, h = 21;
      ret(ctx, x - 1, y - 1, w + 2, h + 2, K);
      ret(ctx, x, y, w, h, C.ouro); ret(ctx, x, y, w, 1, C.ouro3); ret(ctx, x, y + h - 1, w, 1, C.ouro2);
      ret(ctx, x + 2, y + 2, w - 4, h - 4, K);
      var ix = x + 3, iy = y + 3, iw = w - 6, ih = h - 6;
      var tem = !!(P && P.temUni && o.var && o.var.uni && P.temUni(o.var.uni));
      ret(ctx, ix, iy, iw, ih, tem ? '#ffe6f2' : '#e9e0f2');
      ret(ctx, ix, iy + ih - 3, iw, 3, tem ? '#d4f0c0' : '#d8cde6');
      if (tem) { brilho(ctx, ix + 2, iy + 2, C.ouro3); brilho(ctx, ix + iw - 3, iy + 3, C.branco); }
      var spr = o.var && o.var.uni ? spriteUni(P, o.var.uni, iw, ih) : null;
      if (spr) {
        var img = tem ? spr : (PA.silhueta ? PA.silhueta(spr) : spr);
        ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
        ctx.drawImage(img, Math.round(ix + (iw - img.width) / 2), Math.round(iy + ih - img.height));
        ctx.restore();
      }
      // "?" de 7 px em --papel com contorno --tinta (arte.md §14)
      if (!tem) matriz(ctx, ix + iw - 7, iy, ['.kkkk.', 'kppppk', 'kpkkpk', 'kkkpk.', '.kpk..', '.kkk..', '.kpk..', '.kkk..'], { k: K, p: '#fff8ee' });
      // plaquinha dourada
      ret(ctx, px + W / 2 - 4, y + h + 1, 8, 2, K); ret(ctx, px + W / 2 - 3, y + h + 1, 6, 1, C.ouro);
    } });
  objeto('estandarte', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.roxo), c2 = clarear(c, 0.35);
      ret(ctx, px + 1, py + 7, 14, 2, K); ret(ctx, px + 2, py + 7, 12, 1, C.ouro);
      circulo(ctx, px + 1, py + 8, 1, C.ouro); circulo(ctx, px + 14, py + 8, 1, C.ouro);
      ret(ctx, px + 3, py + 9, 10, 16, K);
      ret(ctx, px + 4, py + 9, 8, 15, c); ret(ctx, px + 4, py + 9, 1, 15, c2);
      ret(ctx, px + 3, py + 25, 4, 3, K); ret(ctx, px + 9, py + 25, 4, 3, K);
      ret(ctx, px + 4, py + 24, 2, 3, c); ret(ctx, px + 10, py + 24, 2, 3, c);
      var em = cor(o, 'emblema', 'estrela');
      if (em === 'coracao') matriz(ctx, px + 5, py + 13, ['yy.yy', 'yyyyy', '.yyy.', '..y..'], { y: C.ouro });
      else matriz(ctx, px + 5, py + 12, ['..y..', 'yyyyy', '.yyy.', 'y...y'], { y: C.ouro });
      ret(ctx, px + 4, py + 19, 8, 1, C.ouro);
    } });
  objeto('vitral', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 3, y = py + 7;
      ret(ctx, x, y + 3, 10, 19, K); elipse(ctx, x + 5, y + 4, 5, 4, K);
      var cores = [C.rosa, C.azul2, C.ouro, C.lilas, C.agua, C.laranja];
      for (var j = 0; j < 4; j++) for (var i = 0; i < 2; i++) ret(ctx, x + 1 + i * 4 + i, y + 4 + j * 4 + j, 3 + (1 - i), 4, cores[(i + j * 2 + o.x) % cores.length]);
      elipse(ctx, x + 5, y + 4, 3, 2, C.ouro3); ret(ctx, x + 5, y + 2, 1, 4, K);
      ret(ctx, x + 1, y + 5, 1, 2, C.branco);
      ret(ctx, x - 1, y + 22, 12, 2, K); ret(ctx, x, y + 22, 10, 1, C.pedra);
    } });
  var CARTAZES = {
    abc: function (ctx, x, y) {
      matriz(ctx, x, y, ['.r..bb..gg', 'r.r.b.b.g.', 'rrr.bb..g.', 'r.r.b.b.g.', 'r.r.bb..gg'], { r: C.vermelho, b: C.azul, g: C.verde });
    },
    estrela: function (ctx, x, y) { miudeza(ctx, 'estrela', x + 5, y + 7); },
    coracao: function (ctx, x, y) { matriz(ctx, x + 2, y, ['.kk.kk.', 'krrkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'], { k: K, r: C.rosa }); },
    numeros: function (ctx, x, y) {
      matriz(ctx, x, y, ['.o..ll..', 'oo.l..l.', '.o...l..', '.o..l...', 'ooo.llll'], { o: C.laranja, l: C.roxo });
    },
    arcoiris: function (ctx, x, y) {
      [C.vermelho, C.laranja, C.ouro, C.verde, C.azul].forEach(function (c, i) { ret(ctx, x + i, y + i, 10 - i * 2, 1, c); ret(ctx, x + i, y + i, 1, 6 - i, c); ret(ctx, x + 9 - i, y + i, 1, 6 - i, c); });
    },
  };
  objeto('cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 1, y = py + 9, fundo = cor(o, 'cor', C.creme);
      contornoRet(ctx, x, y, 14, 16, fundo);
      ret(ctx, x + 1, y + 14, 12, 1, escurecer(fundo, 0.1));
      var d = cor(o, 'desenho', ['abc', 'estrela', 'coracao', 'numeros', 'arcoiris'][Math.floor(sorte(o.x, o.y, 9) * 5)]);
      (CARTAZES[d] || CARTAZES.estrela)(ctx, x + 2, y + 3);
      ret(ctx, x + 1, y, 2, 2, C.vermelho); ret(ctx, x + 11, y, 2, 2, C.azul);
      ret(ctx, x + 3, y + 12, 8, 1, '#c4b4d4');
    } });
  objeto('relogio-parede', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = cor(o, 'cor', C.madeira);
      ret(ctx, cx - 5, py + 9, 11, 20, K); ret(ctx, cx - 4, py + 10, 9, 18, c);
      triangulo(ctx, cx - 6, py + 5, 13, 5, K); triangulo(ctx, cx - 4, py + 6, 9, 4, clarear(c, 0.2));
      circulo(ctx, cx, py + 14, 4, K); circulo(ctx, cx, py + 14, 3, C.creme);
      ret(ctx, cx, py + 12, 1, 3, K); ret(ctx, cx, py + 14, 2, 1, K);
      ret(ctx, cx - 3, py + 19, 7, 8, escurecer(c, 0.45));
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, a = Math.round(Math.sin(t / 500) * 2);
      ret(ctx, cx, py + 19, 1, 4, C.ouro2);
      ret(ctx, cx + Math.round(a / 2), py + 22, 1, 2, C.ouro2);
      circulo(ctx, cx + a, py + 25, 1, C.ouro);
    } });
  objeto('prateleira-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o);
      ret(ctx, px + 1, py + 21, W - 2, 3, K); ret(ctx, px + 2, py + 21, W - 4, 1, C.madeiraClara); ret(ctx, px + 2, py + 22, W - 4, 1, C.madeira);
      ret(ctx, px + 4, py + 24, 2, 3, C.madeira3); ret(ctx, px + W - 6, py + 24, 2, 3, C.madeira3);
      var itens = (o.var && o.var.itens) || ['livro', 'vaso', 'ursinho', 'planta'];
      var passo = (W - 4) / itens.length;
      itens.forEach(function (it, i) { miudeza(ctx, it, Math.round(px + 2 + passo * (i + 0.5)), py + 21); });
    } });
  objeto('arandela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 2, py + 18, 5, 6, K); ret(ctx, cx - 1, py + 19, 3, 4, C.ouro2);
      ret(ctx, cx - 4, py + 17, 9, 2, K); ret(ctx, cx - 3, py + 17, 7, 1, C.ouro);
      ret(ctx, cx - 1, py + 12, 3, 5, K); ret(ctx, cx, py + 12, 1, 5, C.creme);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, f = Math.floor(t / 140) % 3;
      circulo(ctx, cx, py + 9, 4, 'rgba(255,220,120,0.18)');
      circulo(ctx, cx, py + 9, 2, 'rgba(255,230,150,0.25)');
      ret(ctx, cx, py + 8 - (f === 1 ? 1 : 0), 1, 4 + (f === 1 ? 1 : 0), C.laranja);
      ret(ctx, cx + (f === 2 ? 1 : 0), py + 9, 1, 2, C.ouro3);
    } });
  objeto('lousa', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py + 9, w = W - 2;
      contornoRet(ctx, x, y, w, 17, C.madeira);
      ret(ctx, x + 2, y + 2, w - 4, 13, cor(o, 'cor', '#4f8a64'));
      matriz(ctx, x + 4, y + 4, ['.w..ww...ww', 'w.w.w.w.w..', 'www.ww..w..', 'w.w.w.w.w..', 'w.w.ww...ww'], { w: '#eef6e8' });
      matriz(ctx, x + 4, y + 10, ['.w......w...ww', 'ww.w.w.ww.ww.w', '.w.www..w....w', '.w.w.w..w...w.', 'www....www.www'].map(function (l) { return l; }), { w: '#dcefd4' });
      ret(ctx, x + 1, y + 16, w - 2, 2, K); ret(ctx, x + 2, y + 16, w - 4, 1, C.madeiraClara);
      ret(ctx, x + w - 8, y + 15, 3, 1, C.branco); ret(ctx, x + w - 4, y + 15, 2, 1, C.rosa2);
    } });
  objeto('mapa-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py + 9, w = W - 4;
      contornoRet(ctx, x, y, w, 16, '#f6e2b0');
      ret(ctx, x - 1, y - 1, 3, 18, K); ret(ctx, x, y, 1, 16, C.madeira);
      ret(ctx, x + w - 2, y - 1, 3, 18, K); ret(ctx, x + w - 1, y, 1, 16, C.madeira);
      ret(ctx, x + 3, y + 2, w - 6, 12, '#bfe6ee');
      elipse(ctx, x + 9, y + 7, 5, 3, '#c9dd8a'); elipse(ctx, x + 19, y + 10, 4, 2, '#c9dd8a');
      ret(ctx, x + 8, y + 6, 2, 1, C.folha3); ret(ctx, x + 18, y + 9, 1, 1, C.folha3);
      for (var i = 0; i < 4; i++) ret(ctx, x + 11 + i * 2, y + 8 + (i % 2), 1, 1, C.vermelho);
      matriz(ctx, x + 19, y + 8, ['r.r', '.r.', 'r.r'], { r: C.vermelho });
      brilho(ctx, x + 5, y + 11, C.ouro);
    } });
  objeto('espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      elipse(ctx, cx, py + 17, 6, 9, K); elipse(ctx, cx, py + 17, 5, 8, C.ouro);
      elipse(ctx, cx, py + 17, 4, 7, '#cfe8f5'); elipse(ctx, cx + 1, py + 19, 2, 4, '#e8f6ff');
      ret(ctx, cx - 2, py + 12, 1, 4, C.branco); ret(ctx, cx - 1, py + 13, 1, 1, C.branco);
      ret(ctx, cx - 1, py + 7, 3, 2, K); ret(ctx, cx, py + 7, 1, 1, C.rosa);
    } });
  objeto('bandeirinhas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), cores = [C.rosa, C.ouro, C.azul, C.verde, C.lilas, C.laranja];
      for (var i = 0; i < W; i++) { var y = py + 12 + Math.round(Math.sin(i / W * Math.PI) * 3); ret(ctx, px + i, y, 1, 1, K); }
      for (var b = 0; b * 6 + 2 < W - 3; b++) {
        var x = px + 2 + b * 6, yb = py + 13 + Math.round(Math.sin((x - px + 2) / W * Math.PI) * 3);
        var c = cores[(b + o.x) % cores.length];
        ret(ctx, x, yb, 5, 1, c); ret(ctx, x + 1, yb + 1, 3, 1, c); ret(ctx, x + 2, yb + 2, 1, 2, c);
        ret(ctx, x, yb, 1, 1, clarear(c, 0.5));
      }
    } });
})();
