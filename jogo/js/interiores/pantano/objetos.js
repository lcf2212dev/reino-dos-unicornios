/* Pântano das Rãs Resmungonas, os objetos da mata do brejo (prefixo pantano-): o salgueiro-chorão, o cipreste com as
   raízes de fora, os juncos, o tronco caído, a pedra e o toco com musgo (sólidos) e as lagoas (água andável, onde ela
   nada). Mais abaixo, na segunda parte: os que se tocam e os enfeites do chão. Reino._predios.pantano guarda
   P.folhagem, P.sombra e as lagoas (P.LAGOAS, P.fundura, P.agua). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).pantano = R._predios.pantano || {};
  var FOLHA = { verde: ['#2f6646', '#4a8f5a', '#7cc47a'], musgo: ['#4f6a2a', '#76963e', '#a8c860'] };
  var TRONCO = ['#4a3a2a', '#6a5438', '#8c7250'];
  function cor(o) { return FOLHA[(o && o.var && o.var.cor)] || FOLHA.verde; }

  // folhagem em bolas [cx, cy, raio] com contorno só por fora (todas as bolas de contorno primeiro)
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(30,50,30,0.3)'); }
  P.folhagem = folhagem; P.sombra = sombra;
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 2, h, TRONCO[2]); ret(ctx, x + w - 2, y, 2, h, TRONCO[0]); }
  // cortina de folhas do salgueiro: fios que descem da copa, alternando os verdes, com contorno por fora
  function chorao(ctx, px, py, x0, x1, topo, c) {
    for (var x = x0; x <= x1; x += 2) {
      var h = 10 + ((x * 7) % 9);
      ret(ctx, px + x - 1, py + topo, 4, h + 1, K);
    }
    for (x = x0; x <= x1; x += 2) {
      var hh = 10 + ((x * 7) % 9);
      ret(ctx, px + x, py + topo, 2, hh, x % 4 ? c[0] : c[1]);
      ret(ctx, px + x, py + topo + hh - 2, 1, 1, c[2]);
    }
  }

  /* ---------- árvores (sólidas na base, desenhadas na ordem por Y) ---------- */
  I.objeto('pantano-salgueiro', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o);
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 8, 8, 22);
      ret(ctx, px + 9, py + 11, 4, 3, K); ret(ctx, px + 20, py + 11, 4, 3, K); ret(ctx, px + 10, py + 11, 2, 2, TRONCO[1]); ret(ctx, px + 21, py + 11, 2, 2, TRONCO[0]);
      folhagem(ctx, px, py, [[16, -30, 13], [6, -24, 8], [26, -24, 8]], c);
      chorao(ctx, px, py, 1, 30, -22, c);
    } });
  I.objeto('pantano-cipreste', { w: 1, h: 1, solido: true, alto: true, topo: 34,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o);
      sombra(ctx, px + 8, py + 14, 7);
      tronco(ctx, px + 6, py - 4, 4, 18);
      ret(ctx, px + 2, py + 10, 3, 4, K); ret(ctx, px + 3, py + 11, 1, 3, TRONCO[2]);   // as "joelheiras": raízes de fora
      ret(ctx, px + 11, py + 11, 3, 3, K); ret(ctx, px + 12, py + 12, 1, 2, TRONCO[1]);
      folhagem(ctx, px, py, [[8, -22, 6], [8, -14, 7], [8, -6, 6]], c);
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('pantano-juncos', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      [[3, -2, 15], [7, -6, 19], [11, -3, 16], [5, 2, 11], [13, 1, 12]].forEach(function (j, i) {
        ret(ctx, px + j[0] - 1, py + j[1], 3, j[2], K); ret(ctx, px + j[0], py + j[1], 1, j[2], i % 2 ? '#4f8a3a' : '#6aa84a');
        if (i < 3) { ret(ctx, px + j[0] - 1, py + j[1] - 1, 3, 6, K); ret(ctx, px + j[0], py + j[1], 1, 4, '#8a5a30'); }   // a "salsicha" marrom
      });
    } });
  I.objeto('pantano-tronco', { w: 2, h: 1, solido: true, topo: 6,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 2, py + 5, 28, 10, K); ret(ctx, px + 3, py + 6, 26, 8, TRONCO[1]); ret(ctx, px + 3, py + 6, 26, 2, TRONCO[2]); ret(ctx, px + 3, py + 12, 26, 2, TRONCO[0]);
      ret(ctx, px + 1, py + 6, 3, 8, K); ret(ctx, px + 2, py + 7, 1, 6, '#3a2a1a');   // a ponta oca
      ret(ctx, px + 8, py + 3, 12, 4, K); ret(ctx, px + 9, py + 4, 10, 3, '#76963e'); ret(ctx, px + 10, py + 4, 4, 1, '#a8c860');   // musgo
      ret(ctx, px + 23, py + 2, 3, 3, K); ret(ctx, px + 24, py + 3, 1, 2, '#ffb0c8');   // cogumelinho
    } });
  I.objeto('pantano-pedra', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, '#8a907a');
      elipse(ctx, px + 7, py + 8, 4, 2, '#b0b49c'); ret(ctx, px + 11, py + 10, 2, 2, '#6a6e5a');
      ret(ctx, px + 2, py + 5, 7, 3, '#76963e'); ret(ctx, px + 3, py + 5, 3, 1, '#a8c860');   // musgo em cima
    } });
  I.objeto('pantano-toco', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, TRONCO[1]); ret(ctx, px + 3, py + 7, 2, 7, TRONCO[2]);
      elipse(ctx, px + 8, py + 6, 6, 3, K); elipse(ctx, px + 8, py + 6, 5, 2, '#b89a6a'); elipse(ctx, px + 8, py + 6, 3, 1, '#8c7250');
      ret(ctx, px + 3, py + 11, 4, 3, '#76963e');
    } });
  /* ---------- as lagoas: água andável (ela nada, como no lago da cidade; docs/contratos/arenas.md §6) ----------
     Cada lagoa é a união de duas elipses [cx, cy, rx, ry] (tiles) com a margem ondulada. P.fundura(wx, wy) = quantos
     px o ponto está para dentro da água desenhada (negativo = fora; a mesma conta pinta a água e corta o sprite
     dela); P.agua(tx, ty) = o meio do tile na água. Um tipo por lagoa ('pantano-lagoa-<n>', plano e não sólido,
     pegada = a caixa da lagoa com a beira de lama): o layout da arena não põe nada em cima e o desenho vai no
     estático; a ondinha da linha d'água e os brilhos, no `anim` (parados sem Animações). */
  var BEIRA = 8, FORA = 8;   // px de lama em volta da água (na caixa); fundura longe de toda lagoa
  P.LAGOAS = [
    [[10.2, 29.8, 3.6, 1.9], [12.8, 29.0, 1.7, 1.2]], [[40.5, 37.4, 3.3, 1.6], [38.2, 37.1, 1.6, 1.2]],   // fáceis
    [[6.6, 22.4, 2.9, 1.8], [7.8, 23.3, 1.4, 1.0]],   [[49.6, 25.2, 2.4, 2.0], [48.0, 26.4, 1.5, 1.0]],     // médias
    [[44.4, 16.8, 3.6, 2.0], [41.6, 17.6, 1.6, 1.2]], [[7.6, 9.2, 3.0, 1.8], [5.6, 8.4, 1.5, 1.1]],       // difíceis
  ].map(function (es, n) {
    var e = es.map(function (v) { return { cx: v[0] * 16, cy: v[1] * 16, rx: v[2] * 16, ry: v[3] * 16 }; });
    function lim(f, s) { return e.reduce(function (m, a) { return f(m, a.cx + s * a.rx, a.cy + s * a.ry); }, null); }
    var x0 = lim(function (m, x) { return m === null ? x : Math.min(m, x); }, -1) - BEIRA;
    var x1 = lim(function (m, x) { return m === null ? x : Math.max(m, x); }, 1) + BEIRA;
    var y0 = lim(function (m, x, y) { return m === null ? y : Math.min(m, y); }, -1) - BEIRA;
    var y1 = lim(function (m, x, y) { return m === null ? y : Math.max(m, y); }, 1) + BEIRA;
    var x = Math.floor(x0 / 16), y = Math.floor(y0 / 16);
    return { n: n, e: e, x: x, y: y, w: Math.ceil(x1 / 16) - x, h: Math.ceil(y1 / 16) - y };
  });
  // distância com sinal até a borda da elipse (px; + dentro), pela 1ª ordem (boa perto da margem; no miolo, até o raio menor)
  function dElipse(a, wx, wy) {
    var dx = wx - a.cx, dy = wy - a.cy, rx2 = a.rx * a.rx, ry2 = a.ry * a.ry, m = Math.min(a.rx, a.ry);
    var f = dx * dx / rx2 + dy * dy / ry2 - 1, gn = 2 * Math.sqrt(dx * dx / (rx2 * rx2) + dy * dy / (ry2 * ry2));
    return gn < 1e-9 ? m : Math.min(m, -f / gn);
  }
  function fundLagoa(l, wx, wy) {
    var d = -1e9;
    for (var i = 0; i < l.e.length; i++) d = Math.max(d, dElipse(l.e[i], wx, wy));
    return d + Math.sin(wx * 0.23 + l.n * 2.1) * 0.9 + Math.sin(wy * 0.41 + l.n * 3.7) * 0.6;   // a margem ondulada
  }
  P.fundura = function (wx, wy) {
    var d = -FORA;
    for (var i = 0; i < P.LAGOAS.length; i++) {
      var l = P.LAGOAS[i];
      if (wx >= l.x * 16 && wy >= l.y * 16 && wx < (l.x + l.w) * 16 && wy < (l.y + l.h) * 16) d = Math.max(d, fundLagoa(l, wx, wy));
    }
    return d;
  };
  P.agua = function (tx, ty) { return P.fundura(tx * 16 + 8, ty * 16 + 8) > 0; };

  var LAMA = ['#7a7440', '#655f34', '#8a8450'], BORDA_LAMA = '#5e5a30', MOLHADA = '#5a5430', LINHA = '#1f4a40', RASO = '#7fb39a';
  var TONS = ['#5f9c84', '#4b8a74', '#3c7864', '#306756', '#275a4c'], LIMITES = [4, 8, 13, 19];
  var FLORES = ['#ff9cc6', '#ffffff', null, null], ANEL = '#a8e0c8';
  function corDe(l, wx, wy) {
    var k = fundLagoa(l, wx + 0.5, wy + 0.5), fim = -4 + (sorte(wx, wy >> 2, 61) < 0.4 ? 1 : 0);
    if (k < fim) return null;
    if (k < fim + 1) return BORDA_LAMA;                                        // a beirada da lama, no capim
    if (k < -1) { var r = sorte(wx, wy, 62); return r < 0.15 ? LAMA[1] : r > 0.9 ? LAMA[2] : LAMA[0]; }
    if (k < 0) return MOLHADA;
    if (k < 1) return LINHA;                                                   // linha d'água de 1 px
    if (k < 2.5) return RASO;
    // o fundo puxa para baixo; a troca de tom em pontilhado 2 × 2
    var v = k + (wy - l.e[0].cy) * 0.12, t = 0, xadrez = (wx + wy) & 1;
    while (t < 4 && v >= LIMITES[t] + (xadrez ? 0 : 1.2)) t++;
    return TONS[t];
  }
  function longe(lista, x, y, d) { return lista.every(function (p) { return Math.abs(p[0] - x) >= d || Math.abs(p[1] - y) >= d; }); }
  // vitórias-régias (até 4), brilhos, juncos da margem e o anel da ondinha: pela sorte do lugar, feitos uma vez
  function enfeitesDe(l) {
    if (l.enf) return l.enf;
    var reg = [], bri = [], jun = [], anel = [], X0 = l.x * 16, Y0 = l.y * 16, X1 = X0 + l.w * 16, Y1 = Y0 + l.h * 16, x, y, k;
    for (y = Y0 + 2; y < Y1 - 2; y += 5) for (x = X0 + 2; x < X1 - 2; x += 5) {
      k = fundLagoa(l, x + 0.5, y + 0.5);
      var s = sorte(x, y, 63);
      if (k > 9 && s < 0.25 && reg.length < 4 && longe(reg, x, y, 15)) reg.push([x, y, 4 + Math.floor(sorte(x, y, 64) * 3), 2, FLORES[reg.length % 4]]);
      else if (k > 6 && s > 0.86 && bri.length < 3 && longe(reg, x, y, 10) && longe(bri, x, y, 12)) bri.push([x, y]);
    }
    // os juncos só na metade de cima (crescem para a terra; embaixo cobririam a água)
    for (y = Y0 + 3; y < l.e[0].cy; y += 2) for (x = X0 + 3; x < X1 - 3; x += 2) {
      k = fundLagoa(l, x + 0.5, y + 0.5);
      if (k > -3 && k < -1.5 && sorte(x, y, 67) < 0.1 && longe(jun, x, y, 6)) jun.push([x, y, 7 + Math.floor(sorte(x, y, 68) * 6)]);
    }
    var c = l.e[0];
    for (y = Y0; y < Y1; y++) for (x = X0; x < X1; x++) {
      k = fundLagoa(l, x + 0.5, y + 0.5);
      if (k >= 1 && k < 2) anel.push([x, y, Math.atan2((y - c.cy) / c.ry, (x - c.cx) / c.rx)]);
    }
    anel.sort(function (a, b) { return a[2] - b[2]; });
    return (l.enf = { reg: reg, bri: bri, jun: jun, anel: anel });
  }
  // (ox, oy) = onde a caixa foi parar menos onde ela fica na arena (0 no jogo; a prévia desenha em outro lugar)
  function desenharLagoa(ctx, l, ox, oy) {
    var X0 = l.x * 16, Y0 = l.y * 16, X1 = X0 + l.w * 16, Y1 = Y0 + l.h * 16, x, y;
    for (y = Y0; y < Y1; y++) {
      var ini = X0, cor = corDe(l, X0, y);
      for (x = X0 + 1; x <= X1; x++) {   // em tiras da mesma cor (menos fillRect)
        var c2 = x < X1 ? corDe(l, x, y) : undefined;
        if (c2 === cor) continue;
        if (cor) ret(ctx, ini + ox, y + oy, x - ini, 1, cor);
        ini = x; cor = c2;
      }
    }
    var en = enfeitesDe(l);
    en.reg.forEach(function (v) {   // a folha com contorno, a sombra na água, o cortezinho e às vezes uma flor
      var bx = v[0] + ox, by = v[1] + oy, rx = v[2], ry = v[3];
      elipse(ctx, bx + 1, by + 1, rx, ry, TONS[4]); elipse(ctx, bx, by, rx + 1, ry + 1, K);
      elipse(ctx, bx, by, rx, ry, '#5fae4a'); elipse(ctx, bx - 1, by - 1, Math.max(2, rx - 2), 1, '#8cc85a');
      ret(ctx, bx + 1, by - ry, 2, ry + 1, TONS[1]);
      if (v[4]) { ret(ctx, bx - 3, by - 2, 5, 3, K); ret(ctx, bx - 2, by - 3, 3, 5, K); ret(ctx, bx - 2, by - 2, 3, 3, v[4]); ret(ctx, bx - 1, by - 1, 1, 1, '#ffd34d'); }
    });
    en.jun.forEach(function (h) {   // juncos e taboas na lama da margem
      var jx = h[0] + ox, base = h[1] + oy, a = h[2], jy = base - a;
      ret(ctx, jx, jy + 2, 1, a - 2, '#2f7a48'); ret(ctx, jx, jy, 1, 2, '#8fb83a');
      ret(ctx, jx - 1, base - Math.ceil(a * 0.6), 1, Math.ceil(a * 0.6), '#4f9a4a');
      ret(ctx, jx + 1, base - Math.ceil(a * 0.45), 1, Math.ceil(a * 0.45), '#3e8a46');
      if (a > 9) { ret(ctx, jx - 1, jy - 5, 3, 6, K); ret(ctx, jx, jy - 4, 1, 4, '#9a5a36'); }
    });
  }
  function tempoDe(t) { return (R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0); }
  // a parte viva: a ondinha que corre na linha d'água (3 quadros) e os brilhos que piscam; t = 0: parados
  function vivo(ctx, l, t, ox, oy) {
    var en = enfeitesDe(l), tt = tempoDe(t), q = tt ? Math.floor(tt / 450) % 3 : 0;
    ctx.fillStyle = ANEL;
    for (var i = 0; i < en.anel.length; i++) if ((i + q * 4) % 12 < 3) ctx.fillRect(en.anel[i][0] + ox, en.anel[i][1] + oy, 1, 1);
    en.bri.forEach(function (c, n) {
      var b = [c[0] + ox, c[1] + oy], aceso = tt ? (q + n) % 3 === 0 : n % 2 === 0;
      ret(ctx, b[0], b[1], 1, 1, '#ffffff');
      if (aceso) { ret(ctx, b[0] - 1, b[1], 3, 1, ANEL); ret(ctx, b[0], b[1] - 1, 1, 3, ANEL); ret(ctx, b[0], b[1], 1, 1, '#ffffff'); }
    });
  }
  P.LAGOAS.forEach(function (l) {
    I.objeto('pantano-lagoa-' + (l.n + 1), { w: l.w, h: l.h, solido: false, plano: true, semSombra: true,
      desenhar: function (ctx, px, py) { desenharLagoa(ctx, l, px - l.x * 16, py - l.y * 16); },
      anim: function (ctx, px, py, t) { vivo(ctx, l, t, px - l.x * 16, py - l.y * 16); } });
  });
})();
/* Segunda parte: os que se tocam e os enfeites do chão (prefixo pantano-): a placa, a estátua da rã,
   a lanterna de vaga-lumes e a vitória-régia (com fala); capim do brejo, lodo, lótus, cogumelos, raízes, vaga-lumes e
   as pedrinhas da passarela (não sólidos). O brilho parado fica no `desenhar`; o piscar, no `anim` (só com
   Animações; com t = 0 fica parado). Usa P.sombra (da primeira parte). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).pantano = R._predios.pantano || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }
  function sombra(ctx, cx, y, rx) { if (P.sombra) P.sombra(ctx, cx, y, rx); }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  function halo(ctx, cx, cy, rx, ry, rgb) {
    elipse(ctx, cx, cy, rx, ry, 'rgba(' + rgb + ',0.12)'); elipse(ctx, cx, cy, Math.round(rx * 0.7), Math.round(ry * 0.7), 'rgba(' + rgb + ',0.16)');
  }

  /* ---------- os que se tocam ---------- */
  // a placa torta de madeira, com uma rã pintada
  I.objeto('pantano-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, '#6a5438');
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#b89060'); ret(ctx, px + 1, py - 3, 14, 2, '#d4b080'); ret(ctx, px + 1, py + 5, 14, 2, '#8c6c40');
      ret(ctx, px + 4, py - 2, 3, 2, K); ret(ctx, px + 9, py - 2, 3, 2, K); ret(ctx, px + 5, py - 2, 1, 1, '#ffffff'); ret(ctx, px + 10, py - 2, 1, 1, '#ffffff');
      ret(ctx, px + 3, py, 10, 4, K); ret(ctx, px + 4, py, 8, 3, '#6cc04a'); ret(ctx, px + 6, py + 2, 4, 1, K);
      ret(ctx, px + 12, py + 6, 3, 2, '#76963e');   // musgo no canto
    } });
  // a estátua da rã: uma rã de pedra grande e velhinha, com musgo e um sorriso torto
  I.objeto('pantano-estatua-ra', { w: 2, h: 1, solido: true, topo: 16,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 3, py + 6, 26, 9, K); ret(ctx, px + 4, py + 7, 24, 7, '#8a907a'); ret(ctx, px + 4, py + 7, 24, 2, '#a8ae96');   // pedestal
      elipse(ctx, px + 16, py + 1, 11, 7, K); elipse(ctx, px + 16, py + 1, 10, 6, '#9aa088');
      circulo(ctx, px + 10, py - 7, 4, K); circulo(ctx, px + 22, py - 7, 4, K); circulo(ctx, px + 10, py - 7, 3, '#b4b8a0'); circulo(ctx, px + 22, py - 7, 3, '#b4b8a0');
      ret(ctx, px + 10, py - 8, 2, 2, K); ret(ctx, px + 22, py - 8, 2, 2, K);
      ret(ctx, px + 11, py + 1, 10, 1, K); ret(ctx, px + 10, py, 1, 1, K); ret(ctx, px + 21, py + 2, 1, 1, K);   // sorriso torto
      ret(ctx, px + 7, py + 3, 6, 2, '#76963e'); ret(ctx, px + 19, py - 3, 4, 2, '#76963e'); ret(ctx, px + 8, py + 3, 2, 1, '#a8c860');
      ret(ctx, px + 13, py - 3, 3, 1, '#c8ccb4');   // luz em cima
    } });
  // a lanterna de vaga-lumes: um potinho de vidro pendurado num galho torto, com a luz verde-amarela
  I.objeto('pantano-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      halo(ctx, px + 9, py - 12, 13, 13, '216,255,120');
      ret(ctx, px + 5, py - 18, 3, 33, K); ret(ctx, px + 6, py - 18, 1, 32, '#8c7250'); ret(ctx, px + 7, py - 18, 1, 32, '#4a3a2a');
      ret(ctx, px + 6, py - 21, 8, 2, K); ret(ctx, px + 12, py - 21, 2, 6, K); ret(ctx, px + 8, py - 20, 4, 1, '#8c7250');
      ret(ctx, px + 9, py - 15, 8, 11, K); ret(ctx, px + 10, py - 14, 6, 9, '#d8ff8a'); ret(ctx, px + 11, py - 13, 2, 6, '#f4ffd8'); ret(ctx, px + 9, py - 16, 8, 2, K);
      ret(ctx, px + 13, py - 11, 1, 1, '#ffffff'); ret(ctx, px + 11, py - 7, 1, 1, '#ffffff');
      ret(ctx, px + 4, py + 12, 7, 4, K); ret(ctx, px + 5, py + 12, 5, 3, '#86906a');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 380) % 3 : 0;
      brilho(ctx, px + 3 + f * 6, py - 20 + (f & 1) * 6, '#eaffb8');
    } });
  // a vitória-régia gigante, numa poça própria, com a rãzinha dormindo em cima (a água é sólida)
  I.objeto('pantano-vitoria-regia', { w: 2, h: 1, solido: true, topo: 4, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 9, 15, 6, K); elipse(ctx, px + 16, py + 9, 14, 5, '#3a6b5a'); ret(ctx, px + 5, py + 12, 22, 1, '#4f8270');
      elipse(ctx, px + 15, py + 7, 10, 4, K); elipse(ctx, px + 15, py + 7, 9, 3, '#5fae4a'); elipse(ctx, px + 15, py + 7, 7, 2, '#7cc45a');
      ret(ctx, px + 15, py + 4, 1, 4, '#3a6b5a');   // o cortezinho da folha
      ret(ctx, px + 17, py + 2, 6, 4, K); ret(ctx, px + 18, py + 3, 4, 2, '#6cc04a'); ret(ctx, px + 18, py + 2, 1, 1, K); ret(ctx, px + 21, py + 2, 1, 1, K);
      ret(ctx, px + 25, py + 7, 3, 3, K); ret(ctx, px + 26, py + 7, 1, 2, '#ffb0d8');   // um botão de lótus
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 700) % 3 : 0;   // os zzz da rãzinha subindo
      ret(ctx, px + 23 + f, py - 1 - f * 2, 2, 1, '#ffffff');
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  I.objeto('pantano-capim', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[2, 7], [5, 10], [8, 8], [11, 11], [13, 6], [6, 5]].forEach(function (l, i) {
        ret(ctx, px + l[0], py + 15 - l[1], 1, l[1], i % 2 ? '#4f8a3a' : '#6aa84a');
        ret(ctx, px + l[0] + 1, py + 16 - l[1], 1, l[1] - 2, '#3f6e2e');
      });
    } });
  I.objeto('pantano-lodo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 6, 3, '#6a6436'); elipse(ctx, px + 8, py + 10, 4, 2, '#565029');
      circulo(ctx, px + 6, py + 9, 1, '#8a8450'); ret(ctx, px + 10, py + 9, 1, 1, '#a8a060');   // bolhinhas
    } });
  I.objeto('pantano-lotus', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 7, py + 11, 5, 2, '#4f8a3a');
      ret(ctx, px + 5, py + 6, 5, 4, K); ret(ctx, px + 4, py + 7, 7, 2, K);
      ret(ctx, px + 6, py + 6, 3, 3, '#ffb0d8'); ret(ctx, px + 5, py + 7, 5, 1, '#ff8ac4'); ret(ctx, px + 7, py + 6, 1, 1, '#ffffff');
    } });
  var CHAPEU = ['#ff8ac4', '#c8e86a', '#ffc94d'];
  I.objeto('pantano-cogumelos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0;
      [[5, 13, 3], [11, 14, 2]].forEach(function (c, i) {
        ret(ctx, px + c[0] - 1, py + c[1] - c[2] - 1, 3, c[2] + 2, K); ret(ctx, px + c[0], py + c[1] - c[2], 1, c[2] + 1, '#f4ecd8');
        elipse(ctx, px + c[0], py + c[1] - c[2] - 1, c[2] + 1, c[2] - 1, K); elipse(ctx, px + c[0], py + c[1] - c[2] - 1, c[2], Math.max(1, c[2] - 2), CHAPEU[(n + i) % 3]);
      });
    } });
  I.objeto('pantano-raizes', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 10, 7, 2, '#6a5438'); ret(ctx, px + 7, py + 9, 5, 2, '#6a5438'); ret(ctx, px + 11, py + 11, 4, 2, '#6a5438');
      ret(ctx, px + 1, py + 10, 7, 1, '#8c7250'); ret(ctx, px + 4, py + 12, 2, 2, '#4a3a2a');
    } });
  var VAGA = [[3, 5, 0], [10, 3, 2], [12, 11, 4]];   // [x, y, fase] de cada vaga-lume (fora do quadro: nada novo por frame)
  I.objeto('pantano-vagalumes', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      VAGA.forEach(function (v) { elipse(ctx, px + v[0], py + v[1], 3, 2, 'rgba(216,255,120,0.2)'); ret(ctx, px + v[0], py + v[1], 1, 1, '#eaffb8'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < VAGA.length; n++) {
        var v = VAGA[n], dx = t ? Math.round(Math.sin(t / 520 + v[2]) * 3) : 0, dy = t ? Math.round(Math.cos(t / 430 + v[2]) * 2) : 0;
        ret(ctx, px + v[0] + dx, py + v[1] + dy, 2, 2, (t ? Math.floor(t / 260 + v[2]) % 3 : 0) ? '#eaffb8' : '#ffffff');
      }
    } });
  // pedrinhas soltas na passarela
  I.objeto('pantano-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, 4, 3], [10, 4, 3, 3], [9, 11, 4, 3]].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], s[2], s[3], K); ret(ctx, px + s[0] + 1, py + s[1] + 1, s[2] - 2, s[3] - 2, '#a8ae96');
      });
    } });
})();
