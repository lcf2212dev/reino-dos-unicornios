/* Bosque dos Fantasmas: o portal para a Vila Arco-Íris (docs/contratos/vila.md), objeto 'bosque-portal-vila' (2 × 3,
   não sólido, não interativo: pisou, viaja pelas escadas `sentido: 'portal'` que bosque.js põe na coluna da esquerda
   dele). Colado na borda direita do Bosque, como os portais de saída de mapa dos jogos de aventura: um redemoinho
   grande no chão (aro arco-íris, espiral azul e branca) e uma coluna de luz; animado, a espiral gira, a coluna pulsa
   e brilhinhos sobem (só com Animações). Guarda as cores em Reino._predios.bosque.CORES_VILA: o portal de volta, na
   Vila, usa as mesmas (vila/objetos.js). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores, D = I.desenho, ret = D.ret, K = R.Desenho.K;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  B.CORES_VILA = { aro: '#ffd23f', aroLuz: '#fff3a8', aroSombra: '#e0952a', fundo: '#3f6fd8', braco: '#ff6b9a',
    ponto: '#8af0a0', miolo: '#e8d6ff', halo: [255, 214, 240], luz: [255, 250, 220],
    pulso: ['#ffffff', '#fff3a8', '#ffc8e6', '#c8f0ff'], faisca: ['#ff6b6b', '#ffd23f', '#7ee08a', '#7ec8ff'],
    anel: ['#ff5c6a', '#ffb43f', '#6fdc8c', '#7ec8ff'] };
  var ARCO = ['#ff6b8b', '#ff9f43', '#ffe066', '#7ee081', '#5fc8ff', '#8f7cff'];
  var AZUL = ['#2f4fb8', '#3f6fd8', '#5f9cff', '#9fd0ff', '#e6f4ff'];
  var RX = 15, RY = 9;                      // o redemoinho: meia largura e meia altura, em px

  // disco em fileiras (como D.elipse, mas pintado por função de cor por pixel)
  function disco(ctx, cx, cy, rx, ry, cor) {
    for (var j = -ry; j <= ry; j++) {
      var m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 0.5) * (ry + 0.5)))) + 0.3);
      for (var i = -m; i <= m; i++) { var c = cor(i, j); if (c) ret(ctx, cx + i, cy + j, 1, 1, c); }
    }
  }
  // a espiral: cor pelo ângulo menos o raio (os braços giram com a fase f)
  function espiral(f) {
    return function (i, j) {
      var u = i / RX, v = j / RY, r = Math.sqrt(u * u + v * v);
      if (r > 1.02) return null;
      if (r > 0.86) return ARCO[Math.floor(((Math.atan2(v, u) + Math.PI) / (2 * Math.PI)) * 6 + f) % 6];
      if (r > 0.8) return K;
      var a = (Math.atan2(v, u) + Math.PI) / (2 * Math.PI), b = (a * 3 - r * 2.2 + f / 6) % 1;
      if (r < 0.18) return AZUL[4];
      return b < 0.25 ? AZUL[3] : b < 0.5 ? AZUL[2] : b < 0.75 ? AZUL[1] : AZUL[0];
    };
  }
  function desenhar(ctx, px, py, f) {
    var cx = px + 16, cy = py + 36;
    disco(ctx, cx, cy + 1, RX + 2, RY + 2, function () { return 'rgba(40,70,40,0.25)'; });
    disco(ctx, cx, cy, RX + 1, RY + 1, function () { return K; });
    disco(ctx, cx, cy, RX, RY, espiral(f));
  }
  I.objeto('bosque-portal-vila', { w: 2, h: 3, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) { desenhar(ctx, px, py, 0); },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 160) % 6;
      desenhar(ctx, px, py, f);
      // a coluna de luz que sobe do redemoinho (faixas claras que pulsam) e os brilhinhos subindo
      var cx = px + 16, base = py + 36, alto = 30 + (Math.floor(t / 400) % 2) * 3;
      for (var k = 0; k < alto; k += 2) {
        var w = 18 - Math.floor(k / 4);
        if (w > 2) ret(ctx, cx - (w >> 1), base - 6 - k, w, 1, 'rgba(230,244,255,' + (0.32 - k / 110).toFixed(3) + ')');
      }
      for (var s = 0; s < 6; s++) {
        var p = ((t + s * 330) % 2000) / 2000, x = cx - 12 + ((s * 5) % 24), y = base - 4 - Math.round(p * 36);
        ret(ctx, x, y, 1, 1, ARCO[s]);
        if (p > 0.3 && p < 0.7) { ret(ctx, x - 1, y, 3, 1, ARCO[s]); ret(ctx, x, y - 1, 1, 3, '#ffffff'); }
      }
    } });
})();
