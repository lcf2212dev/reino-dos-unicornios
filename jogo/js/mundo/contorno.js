/* Contorno dourado dos lugares concluídos (o troféu visível no mapa): uma linha dourada que segue o
   desenho do prédio, pulsando devagar, com faíscas que acendem e apagam em pontos da linha.
   I.desenharContorno(ctx, lugar, t, animar), chamado por Mapa.desenharAnimado (mundo/mapa-desenho.js).
   O contorno de cada prédio é feito uma vez (a máscara do desenho de Mapa.PREDIOS) e guardado em
   I.contornos (zerado no Mapa.prerender). Números: Reino.config.mapa.contorno. Sem animação: parado. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T;
  var FOLGA = 12;    // px em volta do rect: bandeira, pináculo e o próprio contorno passam da borda

  function cfg() {
    var c = (window.Reino && Reino.config && Reino.config.mapa && Reino.config.mapa.contorno) || {};
    return {
      espessura: c.espessura > 0 ? c.espessura : 2,
      brilhoMin: typeof c.brilhoMin === 'number' ? c.brilhoMin : 0.55,
      brilhoMax: typeof c.brilhoMax === 'number' ? c.brilhoMax : 1,
      periodoMs: c.periodoMs > 0 ? c.periodoMs : 1800,
      faiscas: typeof c.faiscas === 'number' ? c.faiscas : 5,
      faiscaMs: c.faiscaMs > 0 ? c.faiscaMs : 900,
    };
  }

  // máscara do desenho do prédio (só o que o sprite pinta) → anéis dourados por fora dela
  function montar(l, espessura) {
    var w = l.rect.w * T + FOLGA * 2, h = l.rect.h * T + FOLGA * 2;
    var tela = PA.novoCanvas(w, h), tctx = tela.getContext('2d');
    var fn = Mapa.PREDIOS[l.sprite] || Mapa.PREDIOS.torre;
    fn(tctx, FOLGA, FOLGA, l.rect.w * T, l.rect.h * T, l.cores);
    var dados = tctx.getImageData(0, 0, w, h).data;
    var cheio = new Uint8Array(w * h);
    for (var i = 0; i < w * h; i++) cheio[i] = dados[i * 4 + 3] > 40 ? 1 : 0;
    // distância (em anéis) até o desenho, até espessura + 1 (o último anel é o brilho difuso)
    var dist = new Uint8Array(w * h), borda = [];
    for (var i2 = 0; i2 < w * h; i2++) if (cheio[i2]) { dist[i2] = 255; borda.push(i2); }
    for (var anel = 1; anel <= espessura + 1; anel++) {
      var prox = [];
      borda.forEach(function (k) {
        var x = k % w, y = (k - x) / w;
        for (var j = -1; j <= 1; j++) for (var q = -1; q <= 1; q++) {
          var nx = x + q, ny = y + j;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          var nk = ny * w + nx;
          if (!dist[nk]) { dist[nk] = anel; prox.push(nk); }
        }
      });
      borda = prox;
    }
    var saida = PA.novoCanvas(w, h), sctx = saida.getContext('2d');
    var pontos = [];
    // nada abaixo da linha de baixo do prédio: a cerca, o caminho e o que está na frente ficam limpos
    var chao = FOLGA + l.rect.h * T;
    for (var k = 0; k < w * h; k++) {
      var d = dist[k];
      if (!d || d === 255) continue;
      var x = k % w, y = (k - x) / w;
      if (y >= chao) continue;
      if (d === 1) { sctx.fillStyle = (x + y) % 5 ? '#ffd34d' : '#fff3a0'; if ((x * 7 + y * 13) % 11 === 0) pontos.push([x, y]); }
      else if (d <= espessura) sctx.fillStyle = '#f5a623';
      else sctx.fillStyle = 'rgba(255,211,77,0.35)';
      sctx.fillRect(x, y, 1, 1);
    }
    return { canvas: saida, pontos: pontos, x: l.rect.x * T - FOLGA, y: l.rect.y * T - FOLGA };
  }

  function faisca(ctx, x, y, tam, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(x - tam, y, tam * 2 + 1, 1);
    ctx.fillRect(x, y - tam, 1, tam * 2 + 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, 1, 1);
  }

  I.desenharContorno = function (ctx, l, t, animar) {
    var c = cfg();
    I.contornos = I.contornos || {};
    var chave = l.id + '@' + c.espessura;
    var m = I.contornos[chave] || (I.contornos[chave] = montar(l, c.espessura));
    var pulso = animar ? 0.5 + 0.5 * Math.sin(t * 2 * Math.PI / c.periodoMs) : 0.5;
    ctx.globalAlpha = c.brilhoMin + (c.brilhoMax - c.brilhoMin) * pulso;
    ctx.drawImage(m.canvas, m.x, m.y);
    ctx.globalAlpha = 1;
    if (!animar || !m.pontos.length) return;
    for (var i = 0; i < c.faiscas; i++) {
      var ciclo = t / c.faiscaMs + i / c.faiscas, n = Math.floor(ciclo), fase = ciclo - n;
      var p = m.pontos[(n * 7919 + i * 104729 + l.rect.x * 31) % m.pontos.length];
      var tam = Math.round(Math.sin(fase * Math.PI) * 2.4);
      if (tam > 0) faisca(ctx, m.x + p[0], m.y + p[1], tam, fase < 0.5 ? '#fff3a0' : '#ffd34d');
    }
  };
})();
