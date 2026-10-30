/* Enfeites de fachada, iguais em todos os prédios do mapa: Mapa.fachada.<enfeite>(ctx, ...), em px do jogo.
   Janela com moldura e brilho, telhas, tijolos, tábuas, floreira, toldo, porta caprichada, lampião, vaso,
   brasão, bandeira, degrau (2 níveis), a entrada padrão (degrau + porta), a sombra da base e, para o volume,
   fundacao (base de pedra no pé da parede), volume (luz na quina esquerda, sombra na direita), beiral (sombra do telhado na parede) e trepadeira. Quem usa: mundo/predios*.js
   e os desenhos de fora dos prédios (js/interiores/<p>/fora.js), sempre dentro da função de desenho (nunca no
   carregamento). Só desenha: nada de Math.random (a textura usa Reino.Desenho.sorte, fixa por posição). */
(function () {
  var Mapa = window.Mapa, D = window.Reino.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo;
  var clarear = D.clarear, escurecer = D.escurecer, misturar = D.misturar, sorte = D.sorte;

  // largura de meio triângulo (o mesmo cálculo de D.triangulo) na linha j de um triângulo w×h
  function meiaTri(w, h, j) { return Math.round((w / 2) * (j + 1) / h); }

  var F = {
    // janela com moldura clara, vidro em degradê, cruz, reflexo diagonal e peitoril com sombra.
    // o: { moldura, vidro, cruz (false = sem), arco, cortina, floreira (cor das flores ou true), venezianas, luz }
    janela: function (ctx, x, y, w, h, o) {
      o = o || {};
      var mold = o.moldura || C.creme, vidro = o.vidro || '#9fdcff', vidroL = clarear(vidro, 0.55);
      // arco: cada camada (contorno, moldura, vidro) fica mais estreita nas primeiras linhas
      var perfil = !o.arco ? [] : w >= 9 ? [3, 1, 1] : [2, 1];
      function camada(o2, cor, nClaras, corClara) {
        for (var r = o2; r < h - o2; r++) {
          var k = r - o2, ins = o2 + (k < perfil.length ? perfil[k] : 0);
          if (w - ins * 2 > 0) ret(ctx, x + ins, y + r, w - ins * 2, 1, k < (nClaras || 0) ? corClara : cor);
        }
      }
      camada(0, K); camada(1, mold);
      var vx = x + 2, vy = y + 2, vw = w - 4, vh = h - 4;
      camada(2, vidro, Math.max(1, vh >> 2), vidroL);
      ret(ctx, vx, vy + vh - 1, vw, 1, escurecer(vidro, 0.15));
      // fundo da moldura: 1 px escuro em cima e à esquerda do vidro (o vidro fica para dentro)
      var fundo = escurecer(vidro, 0.32);
      if (!perfil.length) ret(ctx, vx, vy, vw, 1, fundo);
      ret(ctx, vx, vy + perfil.length, 1, vh - 1 - perfil.length, fundo);
      if (o.luz) ret(ctx, vx, vy + (vh >> 1), vw, vh - (vh >> 1) - 1, o.luz);
      // reflexo em diagonal
      for (var d = perfil.length; d < Math.min(vw, vh) - 1; d++) {
        var rx = vx + vw - 2 - d, ry = vy + d;
        if (rx >= vx && ry < vy + vh - 1 && d % 3 !== 2) ret(ctx, rx, ry, 1, 1, 'rgba(255,255,255,0.75)');
      }
      var brX = vx + 1, brY = vy + 1 + (perfil.length ? 1 : 0);
      ret(ctx, brX, brY, 2, 1, '#ffffff'); ret(ctx, brX, brY, 1, 2, '#ffffff');
      if (o.cortina) { ret(ctx, vx, vy, 2, vh - 1, o.cortina); ret(ctx, vx + vw - 2, vy, 2, vh - 1, o.cortina); ret(ctx, vx, vy, vw, 1, o.cortina); }
      if (o.cruz !== false) {
        ret(ctx, x + (w >> 1) - (w % 2 ? 0 : 1), vy, w % 2 ? 1 : 2, vh, mold);
        if (h >= 9) ret(ctx, vx, vy + (vh >> 1) - 1, vw, 1, mold);
      }
      // peitoril
      ret(ctx, x - 1, y + h - 1, w + 2, 3, K); ret(ctx, x, y + h, w, 1, clarear(mold, 0.4));
      ret(ctx, x - 1, y + h, 1, 1, mold); ret(ctx, x + w, y + h, 1, 1, escurecer(mold, 0.2));
      ret(ctx, x, y + h + 2, w, 1, 'rgba(58,36,70,0.25)'); ret(ctx, x + 1, y + h + 3, w - 2, 1, 'rgba(58,36,70,0.15)');
      if (o.venezianas) {
        [x - 5, x + w + 1].forEach(function (sx) {
          ret(ctx, sx, y, 4, h, K); ret(ctx, sx + 1, y + 1, 2, h - 2, o.venezianas);
          for (var s = y + 2; s < y + h - 1; s += 2) ret(ctx, sx + 1, s, 2, 1, escurecer(o.venezianas, 0.18));
        });
      }
      if (o.floreira) F.floreira(ctx, x - 1, y + h + 2, w + 2, o.floreira === true ? null : o.floreira);
    },
    // caixinha de madeira com flores e folhinhas; y = topo da caixa
    floreira: function (ctx, x, y, w, cor) {
      var cores = cor ? [cor, '#ffffff', cor] : ['#ff7eb6', '#ffe066', '#ffffff', '#b58cff'];
      for (var i = 0; i + 2 < w; i += 3) {
        var fx = x + 1 + i, fy = y - 2 - (i % 2);
        ret(ctx, fx, fy + 1, 3, 2, C.folha3); ret(ctx, fx + 1, fy + 1, 1, 1, C.folha2);
        if (i % 2 === 0) { ret(ctx, fx, fy, 3, 1, K); ret(ctx, fx + 1, fy - 1, 1, 1, cores[(i / 3) % cores.length | 0]); ret(ctx, fx, fy, 1, 1, cores[(i / 3) % cores.length | 0]); ret(ctx, fx + 2, fy, 1, 1, cores[(i / 3) % cores.length | 0]); ret(ctx, fx + 1, fy, 1, 1, C.ouro3); }
      }
      ret(ctx, x, y, w, 4, K); ret(ctx, x + 1, y + 1, w - 2, 2, C.madeira); ret(ctx, x + 1, y + 1, w - 2, 1, C.madeiraClara);
    },
    // telhas redondinhas (escamas) dentro de um triângulo igual ao D.triangulo(x, y, w, h)
    telhas: function (ctx, x, y, w, h, cor, passo) {
      passo = passo || 4;
      var esc = escurecer(cor, 0.22), luz = clarear(cor, 0.3), cx = x + w / 2;
      var fundo = escurecer(cor, 0.12), outro = misturar(cor, '#ffd9a0', 0.18);
      // volume: a água da direita fica na sombra (luz da esquerda), a da esquerda ganha um tom mais claro
      for (var jj = 2; jj < h - 1; jj++) {
        var mm = meiaTri(w, h, jj) - 1;
        if (mm > 3) { ret(ctx, Math.round(cx + 1), y + jj, mm - 1, 1, escurecer(cor, 0.14)); ret(ctx, Math.round(cx - mm), y + jj, 1, 1, clarear(cor, 0.25)); }
      }
      for (var j = passo, lin = 0; j < h; j += passo, lin++) {
        var m = meiaTri(w, h, j) - 2, m0 = meiaTri(w, h, j - 1) - 1;
        // sombra da fileira de cima: a faixa logo abaixo da beirada
        if (m0 > 0 && j + 1 < h) ret(ctx, Math.round(cx - m0), y + j + 1, Math.round(m0 * 2), 1, fundo);
        // tom por fileira: uma sim, uma não, um pouco mais escura
        if (lin % 2 && m0 > 1) for (var jf = j + 2; jf < Math.min(h - 1, j + passo); jf++) { var mf = meiaTri(w, h, jf) - 1; ret(ctx, Math.round(cx - mf) + 1, y + jf, Math.round(mf * 2) - 2, 1, escurecer(cor, 0.07)); }
        // junta da fileira atravessando o telhado e o topo claro da fileira de baixo
        var mj = meiaTri(w, h, j) - 1;
        if (mj > 1) { ret(ctx, Math.round(cx - mj) + 1, y + j, Math.round(mj * 2) - 2, 1, escurecer(cor, 0.3)); if (j + 1 < h - 1) ret(ctx, Math.round(cx - mj) + 2, y + j + 1, Math.round(mj) - 2, 1, clarear(cor, 0.14)); }
        for (var tx = Math.round(cx - m) + (lin % 2) * 3; tx + 4 <= cx + m; tx += 6) {
          if (sorte(tx, y + j, 11) < 0.22 && passo > 3) ret(ctx, tx + 1, y + j - passo + 2, 4, passo - 2, outro);
          ret(ctx, tx + 5, y + j - passo + 1, 1, passo - 1, escurecer(cor, 0.18));   // junta vertical entre telhas
          ret(ctx, tx + 1, y + j, 4, 1, esc); ret(ctx, tx, y + j - 1, 1, 1, esc); ret(ctx, tx + 5, y + j - 1, 1, 1, esc);
          ret(ctx, tx + 2, y + j - passo + 2, 2, 1, luz);
        }
      }
    },
    // telhas numa faixa retangular (telhado reto, marquise)
    telhasRet: function (ctx, x, y, w, h, cor, passo) {
      passo = passo || 4;
      var esc = escurecer(cor, 0.22), luz = clarear(cor, 0.3);
      ret(ctx, x, y, w, h, cor);
      for (var j = y + passo - 1, lin = 0; j < y + h; j += passo, lin++) {
        ret(ctx, x, j, w, 1, escurecer(cor, 0.3));
        if (j + 1 < y + h) ret(ctx, x, j + 1, w, 1, clarear(cor, 0.12));   // topo claro da fileira de baixo
        for (var tx = x + (lin % 2) * 3 - 3; tx < x + w; tx += 6) {
          var a = Math.max(x, tx + 1), b = Math.min(x + w, tx + 5);
          if (b > a) ret(ctx, a, j, b - a, 1, esc);
          if (tx + 2 >= x && tx + 4 <= x + w) ret(ctx, tx + 2, j - passo + 2, 2, 1, luz);
        }
      }
    },
    // tijolos em fileiras desencontradas, com um tom a mais em alguns (fixo por posição)
    tijolos: function (ctx, x, y, w, h, cor, alto) {
      alto = alto || 4;
      var junta = misturar(cor, '#fff4e0', 0.45), esc = escurecer(cor, 0.1), luz = clarear(cor, 0.18);
      ret(ctx, x, y, w, h, cor);
      for (var j = y, lin = 0; j < y + h; j += alto, lin++) {
        if (j + alto - 1 < y + h) ret(ctx, x, j + alto - 1, w, 1, junta);
        for (var i = x + (lin % 2 ? 4 : 0); i < x + w; i += 8) {
          if (i > x) ret(ctx, i, j, 1, Math.min(alto - 1, y + h - j), junta);
          var s = sorte(i, j, 7), a0 = Math.max(x, i + (i > x ? 1 : 0)), lw = Math.min(i + 8, x + w) - a0, la = Math.min(alto - 1, y + h - j);
          if (lw <= 0) continue;
          if (s < 0.25) ret(ctx, a0, j, lw, la, esc);
          else if (s > 0.8) ret(ctx, a0, j, lw, la, clarear(cor, 0.08));
          ret(ctx, a0, j, Math.min(3, lw), 1, luz);
          if (la > 2) ret(ctx, a0 + 1, j + la - 1, lw - 1, 1, escurecer(cor, 0.18));
        }
      }
    },
    // pedras grandes de muralha
    pedras: function (ctx, x, y, w, h, cor) {
      var junta = escurecer(cor, 0.22), luz = clarear(cor, 0.35);
      ret(ctx, x, y, w, h, cor);
      for (var j = y, lin = 0; j < y + h; j += 6, lin++) {
        if (j + 5 < y + h) ret(ctx, x, j + 5, w, 1, junta);
        for (var i = x + (lin % 2 ? 5 : 0); i < x + w; i += 10) {
          if (i > x) ret(ctx, i, j, 1, Math.min(5, y + h - j), junta);
          var a0 = Math.max(x, i + 1), lw = Math.min(i + 10, x + w) - a0, la = Math.min(5, y + h - j), sp = sorte(i, j, 13);
          if (lw > 0 && sp < 0.3) ret(ctx, a0, j, lw, la, escurecer(cor, 0.06));
          else if (lw > 0 && sp > 0.75) ret(ctx, a0, j, lw, la, misturar(cor, '#ffe0b0', 0.25));
          if (lw > 1 && la > 3) { ret(ctx, a0 + 1, j + la - 1, lw - 1, 1, escurecer(cor, 0.1)); ret(ctx, a0 + lw - 1, j + 1, 1, la - 1, escurecer(cor, 0.08)); }
          ret(ctx, a0, j, Math.min(3, x + w - i - 1), 1, luz); if (la > 2) ret(ctx, a0, j + 1, 1, 1, luz);
          if (sorte(i, j, 3) < 0.3 && j + 3 < y + h && i + 5 < x + w) ret(ctx, i + 5, j + 3, Math.min(2, x + w - i - 5), 1, junta);
        }
      }
    },
    // tábuas de madeira (verticais ou deitadas) com veios e preguinhos
    tabuas: function (ctx, x, y, w, h, cor, deitadas) {
      var esc = escurecer(cor, 0.28), luz = clarear(cor, 0.2);
      ret(ctx, x, y, w, h, cor);
      if (deitadas) {
        for (var j0 = y; j0 < y + h; j0 += 6) if (sorte(x, j0, 19) < 0.4) ret(ctx, x, j0 + 1, w, Math.min(4, y + h - j0 - 1), escurecer(cor, 0.1));
        for (var j = y + 5; j < y + h; j += 6) { ret(ctx, x, j, w, 1, esc); ret(ctx, x, j + 1, w, 1, luz); }
        for (var v = y + 2; v < y + h; v += 6) for (var i = x + 3; i < x + w - 4; i += 9) if (sorte(i, v, 5) < 0.5) ret(ctx, i, v, 3, 1, esc);
      } else {
        for (var i1 = x; i1 < x + w; i1 += 7) { var s1 = sorte(i1, y, 17); if (s1 < 0.3 || s1 > 0.8) ret(ctx, i1 + 2, y, Math.min(4, x + w - i1 - 2), h, s1 < 0.3 ? escurecer(cor, 0.1) : clarear(cor, 0.1)); }
        for (var i2 = x + 6; i2 < x + w; i2 += 7) { ret(ctx, i2, y, 1, h, esc); ret(ctx, i2 + 1, y, 1, h, luz); }
        for (var i3 = x + 3; i3 < x + w; i3 += 7) for (var v2 = y + 4; v2 < y + h - 3; v2 += 8) if (sorte(i3, v2, 9) < 0.5) ret(ctx, i3, v2, 1, 3, esc);
        for (var p = x + 2; p < x + w - 1; p += 7) { ret(ctx, p, y + 2, 1, 1, esc); ret(ctx, p, y + h - 3, 1, 1, esc); }
      }
    },
    // toldo listrado com babadinho e a sombra embaixo
    toldo: function (ctx, x, y, w, cor1, cor2, alto) {
      alto = alto || 6;
      ret(ctx, x, y, w, alto + 1, K);
      for (var i = x + 1, k = 0; i < x + w - 1; i += 4, k++) {
        var c = k % 2 ? cor2 : cor1, lw = Math.min(4, x + w - 1 - i);
        ret(ctx, i, y + 1, lw, alto - 1, c); ret(ctx, i, y + 1, lw, 1, clarear(c, 0.35));
        ret(ctx, i, y + alto, lw, 2, K); ret(ctx, i + 1, y + alto, Math.max(0, lw - 2), 1, c);
      }
      ret(ctx, x + 1, y + alto + 2, w - 2, 1, 'rgba(58,36,70,0.25)');
    },
    // porta de arco com moldura, almofadas, maçaneta dourada e a luz do lado esquerdo
    porta: function (ctx, x, y, w, h, cor, moldura) {
      moldura = moldura || C.ouro;
      var esc = escurecer(cor, 0.25), luz = clarear(cor, 0.3);
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      // arco em linhas inteiras (sem meio pixel): cada camada estreita nas primeiras linhas
      function camada(x0, w0, y0, perfil, c) {
        for (var r = 0; y0 + r < y + h; r++) {
          var ins = r < perfil.length ? perfil[r] : 0;
          if (w0 - ins * 2 > 0) ret(ctx, x0 + ins, y0 + r, w0 - ins * 2, 1, c);
        }
      }
      var perfil = w >= 12 ? [4, 2, 1, 1] : [3, 1, 1];
      camada(x - 2, w + 4, y - 1, perfil, K);
      camada(x - 1, w + 2, y, perfil, moldura);
      ret(ctx, x - 1, y + 4, 1, h - 5, clarear(moldura, 0.45));
      camada(x, w, y + 1, perfil, cor);
      ret(ctx, x + w / 2 - 1, y + 4, 1, h - 4, esc);
      ret(ctx, x + 1, y + 6, 1, h - 7, luz);
      // almofadas das duas folhas
      [x + 2, x + w / 2 + 1].forEach(function (ax) {
        var aw = Math.max(2, Math.floor(w / 2) - 3);
        ret(ctx, ax, y + 7, aw, Math.max(2, (h >> 1) - 6), esc); ret(ctx, ax, y + 7, aw, 1, luz);
        ret(ctx, ax, y + h - 7, aw, 4, esc); ret(ctx, ax, y + h - 7, aw, 1, luz);
      });
      ret(ctx, x + w - 4, y + (h >> 1) + 1, 2, 2, C.ouro); ret(ctx, x + w - 4, y + (h >> 1) + 1, 1, 1, C.ouro3);
      ret(ctx, x + 2, y + (h >> 1) + 1, 2, 2, C.ouro);
    },
    // entrada padrão das fachadas (D2A-04): degrau claro embaixo e F.porta em cima (arco, moldura, maçaneta dourada);
    // cx = meio da porta, yb = chão (py + h). Folha de 14×22 (23 px de arte com o arco; arte.md §12: 22 a 28) e
    // degrau de 3. o: { larg, alto, degrau (0 = sem), largDegrau }. Devolve a folha { x, y, w, h } para os enfeites
    entrada: function (ctx, cx, yb, cor, moldura, o) {
      o = o || {};
      var lw = o.larg || F.PORTA.larg, al = o.alto || F.PORTA.alto, dg = o.degrau === 0 ? 0 : (o.degrau || F.PORTA.degrau);
      if (dg) F.degrau(ctx, cx, yb - dg, o.largDegrau || lw + 8, dg);
      var x = cx - (lw >> 1), y = yb - dg - al;
      F.porta(ctx, x, y, lw, al, cor, moldura);
      return { x: x, y: y, w: lw, h: al };
    },
    // degrau de pedra na frente da porta (y = topo do degrau)
    degrau: function (ctx, cx, y, larg, alto) {
      alto = alto || 4;
      ret(ctx, cx - (larg >> 1), y, larg, alto, K);
      ret(ctx, cx - (larg >> 1) + 1, y + 1, larg - 2, alto - 1, '#e8d3a8');
      ret(ctx, cx - (larg >> 1) + 1, y + 1, larg - 2, 1, '#fff0d0');
      ret(ctx, cx - (larg >> 1) + 1, y + alto - 1, larg - 2, 1, '#d4bc8c');
      for (var d = cx - (larg >> 1) + 5; d < cx + (larg >> 1) - 2; d += 6) ret(ctx, d, y + 2, 1, alto - 3, '#c9ae80');
      // segundo nível: a pedra de baixo aparece 2 px de cada lado, com a quina escura
      if (larg >= 10) {
        ret(ctx, cx - (larg >> 1) + 1, y, 2, 1, '#e8d3a8'); ret(ctx, cx + (larg >> 1) - 3, y, 2, 1, '#e8d3a8');
        ret(ctx, cx - (larg >> 1) + 3, y, 1, alto - 1, K); ret(ctx, cx + (larg >> 1) - 4, y, 1, alto - 1, K);
        ret(ctx, cx - (larg >> 1) + 4, y + 1, 1, alto - 2, '#fff0d0');
      }
    },
    // lampião de ferro com a luz amarela; x = poste, yb = chão
    lampiao: function (ctx, x, yb, alto) {
      alto = alto || 18;
      ret(ctx, x - 2, yb - 2, 6, 2, K); ret(ctx, x, yb - alto, 2, alto - 2, K); ret(ctx, x, yb - alto + 1, 1, alto - 4, '#6f6198');
      var ly = yb - alto - 6;
      ret(ctx, x - 2, ly, 6, 7, K); ret(ctx, x - 1, ly + 1, 4, 5, '#ffe066'); ret(ctx, x - 1, ly + 1, 2, 2, '#fff8c8');
      ret(ctx, x - 3, ly - 1, 8, 2, K); ret(ctx, x, ly - 3, 2, 2, K);
    },
    // vaso de barro com arbusto redondo; cx = meio, yb = chão
    vaso: function (ctx, cx, yb, flor) {
      ret(ctx, cx - 3, yb - 6, 7, 6, K); ret(ctx, cx - 2, yb - 5, 5, 4, C.terracota); ret(ctx, cx - 2, yb - 5, 1, 4, '#f09a70');
      ret(ctx, cx - 4, yb - 7, 9, 2, K); ret(ctx, cx - 3, yb - 7, 7, 1, C.terracota2);
      circulo(ctx, cx, yb - 11, 5, K); circulo(ctx, cx, yb - 11, 4, C.folha); circulo(ctx, cx - 1, yb - 12, 2, C.folha2);
      ret(ctx, cx - 2, yb - 14, 1, 1, C.folha4);
      if (flor) [[-2, -12], [2, -10], [1, -14]].forEach(function (p) { ret(ctx, cx + p[0], yb + p[1], 1, 1, flor); });
    },
    // brasão (escudo) com a faixa e a estrelinha; cx = meio, y = topo
    brasao: function (ctx, cx, y, cor, cor2) {
      D.matriz(ctx, cx - 5, y, [
        'kkkkkkkkkkk', 'kaaaaabbbbk', 'kaaaaabbbbk', 'kaaawabbbbk', 'kaawwwbbbbk', 'kbbbwbaaaak',
        '.kbbbbaaak.', '.kbbbbaaak.', '..kbbbaak..', '...kbbak...', '....kkk....'], { k: K, a: cor, b: cor2, w: C.ouro });
      ret(ctx, cx - 4, y + 1, 1, 5, 'rgba(255,255,255,0.35)');
    },
    // bandeirinha num mastro; x = mastro, y = topo do mastro
    bandeira: function (ctx, x, y, alto, cor) {
      ret(ctx, x, y, 1, alto, K); circulo(ctx, x, y - 1, 1, C.ouro);
      ret(ctx, x + 1, y + 1, 8, 5, K); ret(ctx, x + 1, y + 2, 7, 3, cor); ret(ctx, x + 1, y + 2, 7, 1, clarear(cor, 0.4));
      ret(ctx, x + 6, y + 3, 3, 1, K);
    },
    // sombra de chão do prédio (arte.md §13): faixa reta embaixo e centrada na porta, 3 px de arte para fora da
    // base (y = py + h, a primeira linha abaixo do rect), em pixel cheio e 2 níveis de alfa. Chamada pelo
    // Mapa.prerender (mundo/mapa-desenho.js) no chão, antes do prédio: fica fora do sprite e da máscara do contorno
    sombraBase: function (ctx, px, py, w, h) {
      var cx = Math.round(px + w / 2 + F.desvio(w)), meia = Math.round(w * 0.38), y = py + h;
      ret(ctx, cx - meia, y, meia * 2, 1, 'rgba(58,36,70,0.25)');
      ret(ctx, cx - meia + 2, y + 1, (meia - 2) * 2, 1, 'rgba(58,36,70,0.25)');
      ret(ctx, cx - meia + 5, y + 2, (meia - 5) * 2, 1, 'rgba(58,36,70,0.15)');
    },
    // base de pedra (fundação) no pé da parede: contorno em cima, pedras deitadas com tom próprio. y = topo
    fundacao: function (ctx, x, y, w, h, cor) {
      cor = misturar(cor || '#c9b494', '#6e5f58', 0.3);   // sempre bem mais escura que a parede
      ret(ctx, x, y, w, 1, K);
      ret(ctx, x, y + 1, w, h - 1, cor);
      for (var i = x, k = 0; i < x + w; k++) {
        var lw = 5 + Math.floor(sorte(i, y, 23) * 5), b = Math.min(i + lw, x + w), s = sorte(i, y, 29);
        if (s < 0.33) ret(ctx, i, y + 1, b - i, h - 1, escurecer(cor, 0.15));
        else if (s > 0.66) ret(ctx, i, y + 1, b - i, h - 1, clarear(cor, 0.18));
        ret(ctx, i, y + 1, b - i, 1, clarear(cor, 0.35));
        if (h > 3) ret(ctx, i, y + h - 1, b - i, 1, escurecer(cor, 0.25));
        if (b < x + w) ret(ctx, b, y + 1, 1, h - 1, escurecer(cor, 0.4));
        i = b + 1;
      }
    },
    // volume da parede: luz de 1 px na quina esquerda, sombra de 3 px (2 degraus) na direita
    volume: function (ctx, x, y, w, h) {
      ret(ctx, x, y, 1, h, 'rgba(255,255,255,0.35)');
      ret(ctx, x + w - 3, y, 3, h, 'rgba(58,36,70,0.15)'); ret(ctx, x + w - 2, y, 2, h, 'rgba(58,36,70,0.1)');
    },
    // beiral: com cor, a tábua do beiral (2 px, o lado de baixo escuro) e, embaixo dela, a sombra de 2 px na parede;
    // sem cor, só a sombra (2 faixas de alfa, arte.md §13). y = linha logo abaixo do telhado
    beiral: function (ctx, x, y, w, alto, cor) {
      alto = alto || 3;
      if (cor) { ret(ctx, x - 1, y, w + 2, 1, clarear(cor, 0.1)); ret(ctx, x - 1, y + 1, w + 2, 1, escurecer(cor, 0.35)); ret(ctx, x - 1, y + 2, w + 2, 1, K); y += 3; }
      ret(ctx, x, y, w, 2, 'rgba(58,36,70,0.25)');
      if (alto > 2) ret(ctx, x, y + 2, w, alto - 2, 'rgba(58,36,70,0.12)');
    },
    // trepadeira subindo a parede, com folhinhas e flores; x = pé, yb = chão
    trepadeira: function (ctx, x, yb, alto, flor) {
      for (var j = 0; j < alto; j++) {
        var ox = x + ((j >> 2) % 2);
        ret(ctx, ox, yb - 1 - j, 1, 1, C.folha3);
        if (j % 3 === 1) { ret(ctx, ox - 1, yb - 1 - j, 1, 1, C.folha); ret(ctx, ox + 1, yb - 2 - j, 2, 1, C.folha); ret(ctx, ox + 1, yb - 3 - j, 1, 1, C.folha2); }
        if (flor && j % 7 === 5) ret(ctx, ox - 1, yb - 2 - j, 1, 1, flor);
      }
    },
    // tufinhos de grama junto da base
    tufos: function (ctx, pts, yb) {
      pts.forEach(function (tx) { ret(ctx, tx, yb - 2, 1, 2, C.folha3); ret(ctx, tx + 1, yb - 3, 1, 3, C.folha); ret(ctx, tx + 2, yb - 2, 1, 2, C.folha3); });
    },
    brilho: D.brilho,
    meiaTri: meiaTri,
    // tamanho mínimo da porta de toda fachada (folha, em px de arte; o degrau é o detalhe comum)
    PORTA: { larg: 14, alto: 22, degrau: 3 },
    // quanto o meio do tile da porta (x + floor(w/2), mundo/mapa.js) fica à direita do meio do rect: 8 px nos prédios
    // de largura par, 0 nos de largura ímpar. O desenho de largura par anda isso para a porta ficar no eixo do telhado
    desvio: function (w) { return Math.floor(w / 32) * 16 + 8 - w / 2; },
  };

  Mapa.fachada = F;
})();
