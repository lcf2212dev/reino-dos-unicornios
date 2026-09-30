/* Interiores: as placas dos cômodos (em px da tela, com a fonte pixel, por cima de móveis e
   personagens), que fogem do HUD e ficam quase transparentes quando cruzam a Mariana.
   Veio de motor/interiores.js (o corpo de cena.desenharSobre e os ajudantes do HUD).
   Registra em Reino._interiores: desenharPlacas. Só roda quando chamado. */
(function () {
  var R = window.Reino;
  var II = R._interiores, T = II.T, K = II.K;

  function naTela(pintor, x, y) {
    if (pintor.tela) return pintor.tela(x, y);
    var c = pintor.cam || { x: 0, y: 0 };
    return { x: Math.round((x - c.x) * pintor.escala), y: Math.round((y - c.y) * pintor.escala) };
  }
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';

  // corpo da Mariana em px da tela (em pé ~16×24 acima dos pés; montada ~28×34)
  function caixaMariana(pintor) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return null;
    var montada = false;
    try { montada = !!(J.montado && J.montado()); } catch (e) {}
    var w = montada ? 28 : 16, h = montada ? 34 : 24;
    var a = naTela(pintor, J.x - w / 2, J.y - h), b = naTela(pintor, J.x + w / 2, J.y);
    return { esq: a.x, cima: a.y, dir: b.x, baixo: b.y };
  }
  // caixa de um elemento do HUD sem o transform da animação (o chip do ovo pulsa: medir com
  // getBoundingClientRect fazia a placa tremer 1-2 px); a mesma ideia que o mapa usava para as placas dos prédios,
  // com 2% de folga para caber o pulso
  function caixaParada(e) {
    var anima = getComputedStyle(e).animationName, pai = e.offsetParent;
    if (!anima || anima === 'none' || !pai) return e.getBoundingClientRect();
    var pr = pai.getBoundingClientRect();
    var left = pr.left + pai.clientLeft + e.offsetLeft, top = pr.top + pai.clientTop + e.offsetTop;
    var w = e.offsetWidth, h = e.offsetHeight, dx = w * 0.02, dy = h * 0.02;
    return { left: left - dx, right: left + w + dx, top: top - dy, bottom: top + h + dy };
  }
  // retângulos do HUD em px do canvas, medidos no máximo a cada 500 ms (como o mapa fazia com as placas dos prédios)
  var hudMedido = { chave: '', medidoEm: -1e9, rects: [] };
  function retangulosHud(canvas, dpr) {
    if (typeof document === 'undefined' || !canvas || !canvas.getBoundingClientRect) return [];
    var agora = performance.now(), chave = canvas.width + 'x' + canvas.height + '@' + dpr;
    if (chave === hudMedido.chave && agora - hudMedido.medidoEm <= 500) return hudMedido.rects;
    var c = canvas.getBoundingClientRect();
    if (!c.width) return [];
    var k = canvas.width / c.width || dpr;
    hudMedido.rects = Array.prototype.map.call(document.querySelectorAll('#hud > *:not(.hud-topo), #hud .hud-topo > * > *'), function (e) {
      var r = caixaParada(e);
      return { left: (r.left - c.left) * k, right: (r.right - c.left) * k, top: (r.top - c.top) * k, bottom: (r.bottom - c.top) * k };
    }).filter(function (r) { return r.right > r.left && r.bottom > r.top; });
    hudMedido.medidoEm = agora; hudMedido.chave = chave;
    return hudMedido.rects;
  }
  // posição mais próxima da original em que a placa (com a borda e uma folga) não cruza o HUD
  function desviarDoHud(hud, sx, sy, sw, sh, borda, cw, ch, xMin, xMax) {
    if (!hud.length) return { x: sx, y: sy };
    var folga = borda * 2;
    function cruza(x, y) {
      for (var i = 0; i < hud.length; i++) {
        var r = hud[i];
        if (x - folga < r.right && x + sw + folga > r.left && y - folga < r.bottom && y + sh + folga > r.top) return true;
      }
      return false;
    }
    var lo = Math.max(folga, xMin === undefined ? -1e9 : xMin), hi = Math.min(cw - sw - folga, xMax === undefined ? 1e9 : xMax - sw);
    function dentroX(x) { return hi >= lo ? Math.max(lo, Math.min(x, hi)) : Math.max(folga, Math.min(x, cw - sw - folga)); }
    if (!cruza(sx, sy)) return { x: sx, y: sy };
    var cands = [];
    var ys = [sy], xs = [sx];
    hud.forEach(function (r) {
      ys.push(Math.round(r.bottom + folga * 2));
      xs.push(Math.round(r.right + folga * 2), Math.round(r.left - sw - folga * 2));
    });
    ys.forEach(function (y) { xs.forEach(function (x) { cands.push({ x: dentroX(x), y: y }); }); });
    var melhor = null, custo = Infinity;
    cands.forEach(function (p) {
      if (p.y < sy || p.y + sh > ch || cruza(p.x, p.y)) return;
      // descer é o preferido; andar de lado pesa um pouco mais
      var k = (p.y - sy) + Math.abs(p.x - sx) * 1.3;
      if (k < custo) { custo = k; melhor = p; }
    });
    if (melhor) return melhor;
    var fundo = sy;
    hud.forEach(function (r) { fundo = Math.max(fundo, Math.round(r.bottom + folga * 2)); });
    return { x: dentroX(sx), y: fundo, semLugar: true };
  }

  // as linhas de cada placa, medidas uma vez por texto, fonte e largura máxima (medir texto a cada quadro custava
  // ~0,6 ms no Museu): quebra no menor número de linhas que cabe e, com esse número, na largura mais equilibrada
  var medidas = {};
  function linhasDa(ctx, texto, fonte, largMax) {
    var chave = texto + '|' + fonte + '|' + Math.round(largMax);
    if (medidas[chave]) return medidas[chave];
    // o "•" fica no fim da linha de cima, colado à palavra antes dele (nunca começa uma linha)
    var pal = texto.split(' ').reduce(function (a, w) { if (w === '•' && a.length) a[a.length - 1] += ' •'; else a.push(w); return a; }, []), larg = pal.map(function (w) { return ctx.measureText(w).width; });
    var esp = ctx.measureText(' ').width;
    function quebrar(max) {   // guloso: devolve as linhas (índices de palavra) com largura até max
      var ls = [], l = [0], w = larg[0];
      for (var i = 1; i < pal.length; i++) {
        if (w + esp + larg[i] <= max) { l.push(i); w += esp + larg[i]; } else { ls.push(l); l = [i]; w = larg[i]; }
      }
      ls.push(l);
      return ls;
    }
    function largura(ls) {
      return Math.max.apply(null, ls.map(function (l) { return ctx.measureText(l.map(function (i) { return pal[i]; }).join(' ')).width; }));
    }
    var ls = quebrar(largMax), n = ls.length, lo = Math.max.apply(null, larg), hi = largMax;
    if (n > 1) {   // a menor largura que ainda dá n linhas
      for (var k = 0; k < 12 && hi - lo > 1; k++) { var m = (lo + hi) / 2; if (quebrar(m).length <= n) hi = m; else lo = m; }
      ls = quebrar(Math.max(hi, Math.max.apply(null, larg)));
    }
    var r = { linhas: ls.map(function (l) { return l.map(function (i) { return pal[i]; }).join(' '); }), largura: largura(ls) };
    // guarda só com a fonte pixel já carregada (medida com a fonte reserva ficaria errada para sempre)
    var pronta = true;
    try { pronta = typeof document === 'undefined' || !document.fonts || document.fonts.check(ctx.font); } catch (e) {}
    if (pronta) medidas[chave] = r;
    return r;
  }
  function comMariana(r) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return false;
    return J.x >= r.x * T && J.x < (r.x + r.w) * T && J.y >= r.y * T && J.y < (r.y + r.h) * T;
  }

  // placas dos cômodos, em px da tela, com a fonte pixel, por cima de móveis e personagens (ui.md §10.9.5): a letra
  // tem Reino.config.texto.corpo px CSS (× dpr em px de aparelho) nos 3 tamanhos; a moldura é desenhada em px de arte
  // da interface (u = 2 px CSS): borda de 1 u, pregos de 1×1 u
  function desenharPlacas(def, ctx, pintor, t, animar) {
    var escala = pintor.escala || 3, dpr = pintor.dpr || 1;
    var corpo = (R.config && R.config.texto && R.config.texto.corpo) || 16;
    var fonte = Math.round(corpo * dpr), u = Math.max(1, Math.round(2 * dpr));
    var pad = 5 * u, topo = 2 * u, lh = 10 * u, borda = u;
    var cw = ctx.canvas.width, ch = ctx.canvas.height;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fonte + 'px ' + FONTE_PIXEL;
    ctx.textRendering = 'optimizeSpeed';   // sem ligadura: com ela "fi"/"fl" viram um glifo só (o CSS não vale no canvas)
    var hud = null, mari = caixaMariana(pintor);
    // os balãozinhos que N.desenhar pôs neste quadro (npcs-status.js), lidos e esvaziados a cada quadro
    var bq = R._npcs && R._npcs.bolhasQuadro, bolhas = [], corpos = [];
    function daTela(b) { return b.canvas === ctx.canvas; }
    if (bq) { bolhas = bq.rects.filter(daTela); corpos = (bq.corpos || []).filter(daTela); bq.rects = []; bq.corpos = []; }
    (def.comodos || []).forEach(function (c) {
      if (!c.placa) return;
      var r = c.rect;
      // o cômodo fora da tela sai antes de medir qualquer coisa
      var esq = naTela(pintor, r.x * T, 0).x, dir = naTela(pintor, (r.x + r.w) * T, 0).x;
      var cimaC = naTela(pintor, 0, r.y * T).y, baixoC = naTela(pintor, 0, (r.y + r.h) * T).y;
      if (dir < 0 || esq > cw || baixoC < 0 || cimaC > ch) return;
      var dela = comMariana(r);   // a do cômodo da Mariana nunca some (ui.md §10.18.4)
      var med = linhasDa(ctx, c.placa, fonte, (r.w * T - 6) * escala - pad * 2);
      var sw = Math.ceil(med.largura + pad * 2), sh = topo * 2 + lh * med.linhas.length;
      var sx = Math.round((esq + dir) / 2 - sw / 2), sy = naTela(pintor, 0, r.y * T + 2).y;
      // a placa inteira na tela: encosta na borda de dentro, sem sair do cômodo
      var xLo = Math.max(esq, borda * 2), xHi = Math.min(dir, cw - borda * 2) - sw;
      if (xHi >= xLo) sx = Math.max(xLo, Math.min(sx, xHi));
      var fora = sx > cw || sy > ch || sx + sw < 0 || sy + sh < 0;
      if (fora && !dela) return;
      // o HUD e os balãozinhos de status deste quadro (a placa por cima esconderia o ícone do NPC)
      if (!hud) hud = retangulosHud(ctx.canvas, dpr).concat(bolhas);
      // placa atrás do HUD (chips, botão ↙, montaria): desce para logo abaixo dele ou vai para o lado,
      // e só desce até a borda de baixo da parede do fundo (as 2 primeiras fileiras do cômodo):
      // mais abaixo ela pareceria estar no chão, ou no meio do cômodo de baixo
      var fimParede = naTela(pintor, 0, (r.y + 2) * T).y, livre = null;
      if (!fora) {
        livre = desviarDoHud(hud, sx, sy, sw, sh, borda, cw, Math.min(ch, fimParede - borda), esq + borda, dir - borda);
        // desviada, a placa não pode invadir outro cômodo nem sair da parede
        if ((livre.x !== sx || livre.y !== sy) &&
          (livre.x < esq - borda || livre.x + sw > dir + borda || livre.y + sh + borda > fimParede)) livre = null;
        // e inteira na tela, com a borda: cortada, a da Mariana desce e a vizinha some
        else if (livre.x - borda < 0 || livre.x + sw + borda > cw || livre.y - borda < 0 || livre.y + sh + borda > ch) livre = null;
      }
      if (!livre) {
        if (!dela) return;
        // na descida, a placa desvia também do corpo dos NPCs e da Mariana (em cima do chão ela cobriria alguém)
        var obst = hud.concat(corpos, mari ? [{ left: mari.esq, top: mari.cima, right: mari.dir, bottom: mari.baixo }] : []);
        // sem lugar na parede: a primeira faixa livre abaixo do HUD e à direita da coluna de chips, mesmo sobre o
        // chão, com a mesma borda. A largura é a da tela que sobra; o texto quebra em quantas linhas precisar
        var xChips = 0;
        hud.forEach(function (h) { if (h.left < cw / 3 && h.top < ch / 2 && h.bottom > 0) xChips = Math.max(xChips, h.right); });
        var folga = borda * 2, larg = cw - xChips - folga * 4;
        med = linhasDa(ctx, c.placa, fonte, Math.min((r.w * T - 6) * escala, larg) - pad * 2);
        sw = Math.ceil(med.largura + pad * 2); sh = topo * 2 + lh * med.linhas.length;
        var x0 = Math.round(Math.max(xChips + folga * 2, Math.min(cw - sw - folga * 2, (esq + dir) / 2 - sw / 2)));
        var y0 = Math.max(folga, Math.min(sy, ch - sh - folga));
        livre = desviarDoHud(obst, x0, y0, sw, sh, borda, cw, ch, xChips + folga, cw - folga);
        // nenhum lugar livre de gente: fica onde não cruza o HUD (e some por cima da Mariana, como sempre)
        if (livre.semLugar || livre.y + sh > ch) livre = desviarDoHud(hud, x0, y0, sw, sh, borda, cw, ch, xChips + folga, cw - folga);
      }
      sx = livre.x; sy = livre.y;
      // cruzando a Mariana, a placa fica quase transparente (como as placas do mapa)
      ctx.globalAlpha = mari && sx - borda < mari.dir && sx + sw + borda > mari.esq && sy - borda < mari.baixo && sy + sh + borda > mari.cima ? 0.35 : 1;
      ctx.fillStyle = K;
      ctx.fillRect(sx - borda, sy - borda, sw + borda * 2, sh + borda * 2);
      ctx.fillStyle = '#fff8ee';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#f3e6c8';
      ctx.fillRect(sx, sy + sh - u, sw, u);
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(sx + 2 * u, sy + 2 * u, u, u);
      ctx.fillRect(sx + sw - 3 * u, sy + 2 * u, u, u);
      ctx.fillStyle = K;
      med.linhas.forEach(function (l, i) { ctx.fillText(l, Math.round(sx + sw / 2), sy + topo + lh * i + Math.round(lh / 2)); });
      ctx.globalAlpha = 1;
    });
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
  }

  II.desenharPlacas = desenharPlacas;
})();
