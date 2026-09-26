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
    return { x: dentroX(sx), y: fundo };
  }

  // placas dos cômodos, em px da tela, com a fonte pixel, por cima de móveis e personagens
  function desenharPlacas(def, ctx, pintor, t, animar) {
    var escala = pintor.escala || 3;
    var fonte = 8 * Math.max(2, Math.round(escala / 2));
    var k = fonte / 16;
    function px(v) { return Math.max(1, Math.round(v * k)); }
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fonte + 'px ' + FONTE_PIXEL;
    var hud = retangulosHud(ctx.canvas, pintor.dpr || 1);
    var mari = caixaMariana(pintor);
    (def.comodos || []).forEach(function (c) {
      if (!c.placa) return;
      var r = c.rect;
      var largMax = (r.w * T - 6) * escala;
      var pad = px(10), topo = px(5), lh = px(20), borda = px(3);
      var linhas = [c.placa];
      if (ctx.measureText(c.placa).width + pad * 2 > largMax) {
        // quebra em duas linhas equilibradas
        var pal = c.placa.split(' '), melhor = null;
        for (var q = 1; q < pal.length; q++) {
          var a = pal.slice(0, q).join(' '), b = pal.slice(q).join(' ');
          var m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
          if (!melhor || m < melhor.m) melhor = { m: m, l: [a, b] };
        }
        if (melhor) linhas = melhor.l;
      }
      var largura = 0;
      linhas.forEach(function (l) { largura = Math.max(largura, ctx.measureText(l).width); });
      var sw = Math.ceil(largura + pad * 2), sh = topo * 2 + lh * linhas.length;
      var meioX = (r.x + r.w / 2) * T, p0 = naTela(pintor, meioX, r.y * T + 2);
      var sx = Math.round(p0.x - sw / 2), sy = Math.round(p0.y);
      var cw = ctx.canvas.width, ch = ctx.canvas.height;
      if (sx > cw || sy > ch || sx + sw < 0 || sy + sh < 0) return;
      // placa atrás do HUD (chips, botão ↙, montaria): desce para logo abaixo dele ou vai para o lado
      var esq = naTela(pintor, r.x * T, 0).x, dir = naTela(pintor, (r.x + r.w) * T, 0).x;
      // e só desce até a borda de baixo da parede do fundo (as 2 primeiras fileiras do cômodo):
      // mais abaixo ela pareceria estar no chão, ou no meio do cômodo de baixo
      var fimParede = naTela(pintor, 0, (r.y + 2) * T).y;
      var livre = desviarDoHud(hud, sx, sy, sw, sh, borda, cw, Math.min(ch, fimParede - borda), esq + borda, dir - borda);
      if (livre.x !== sx || livre.y !== sy) {
        // desviada, a placa não pode invadir outro cômodo: se o dela está quase fora da tela, some
        if (livre.x < esq - borda || livre.x + sw > dir + borda) return;
        // nem sair da parede: se não coube nela, fora do HUD, some neste quadro
        if (livre.y + sh + borda > fimParede) return;
      }
      sx = livre.x; sy = livre.y;
      // cruzando a Mariana, a placa fica quase transparente (como as placas do mapa)
      ctx.globalAlpha = mari && sx - borda < mari.dir && sx + sw + borda > mari.esq && sy - borda < mari.baixo && sy + sh + borda > mari.cima ? 0.35 : 1;
      ctx.fillStyle = K;
      ctx.fillRect(sx - borda, sy - borda, sw + borda * 2, sh + borda * 2);
      ctx.fillStyle = '#fff8ee';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#f3e6c8';
      ctx.fillRect(sx, sy + sh - borda, sw, borda);
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(sx + px(4), sy + px(4), px(3), px(3));
      ctx.fillRect(sx + sw - px(7), sy + px(4), px(3), px(3));
      ctx.fillStyle = K;
      linhas.forEach(function (l, i) { ctx.fillText(l, Math.round(sx + sw / 2), sy + topo + lh * i + Math.round(lh / 2)); });
      ctx.globalAlpha = 1;
    });
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
  }

  II.desenharPlacas = desenharPlacas;
})();
