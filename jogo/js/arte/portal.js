/* O portal mágico em qualquer cor: o redemoinho (pedido do Leandro, 06/11: todos neste formato), uma elipse grande no
   chão com o aro arco-íris e a espiral nos tons do portal; animado, o aro e os braços giram e sobe uma coluna de luz
   com brilhinhos (só com Animações).
     Reino.Portal.criar(cores?) → { desenhar(ctx, px, py), animar(ctx, px, py, w, h, t) }   o portal no mapa (1 × 1
       tile; o desenho passa para os lados, dentro da folga de 16 px do sprite). A espiral: cores.tons (4, escuro →
       claro) ou os tons de cores.fundo; sem cores, azul.
     Reino.Portal.registrar(sprite, cores?)   põe o par em Mapa.PREDIOS[sprite] / Mapa.PREDIOS_ANIM[sprite] (no fora.js).
     Reino.Portal.saida(cores?) → fn(ctx, px, py)   o portal de volta dentro da arena (I.FUNDOS[id].saida): o mesmo
       redemoinho, com a espiral em cores.anel (4).
     Reino.Portal.vortice(ctx, cx, cy, tons, f) e brilho(ctx, cx, base, t): as partes, para quem desenha outro tamanho.
   node: true. */
(function () {
  var R = window.Reino, D = R.Desenho, K = D.K, ret = D.ret;
  /* ----- o redemoinho (pedido do Leandro, 06/11: todo portal neste formato) -----
     elipse grande no chão (meia largura RX, meia altura RY): aro arco-íris contornado e a espiral de 4 tons da cor do
     portal no meio, com o miolo claro. f (0–5) gira o aro e os braços; vortice(ctx, cx, cy, tons, f, aro?) (aro: as cores do aro; padrão o arco-íris) */
  var ARCO = ['#ff6b8b', '#ff9f43', '#ffe066', '#7ee081', '#5fc8ff', '#8f7cff'];
  var RX = 15, RY = 9;
  function pinta(ctx, cx, cy, rx, ry, cor) {
    for (var j = -ry; j <= ry; j++) {
      var m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 0.5) * (ry + 0.5)))) + 0.3);
      for (var i = -m; i <= m; i++) { var c = cor(i, j); if (c) ret(ctx, cx + i, cy + j, 1, 1, c); }
    }
  }
  function vortice(ctx, cx, cy, tons, f, aro) {
    f = f || 0; aro = aro || ARCO;
    pinta(ctx, cx, cy + 1, RX + 2, RY + 2, function () { return 'rgba(40,70,40,0.25)'; });
    pinta(ctx, cx, cy, RX + 1, RY + 1, function () { return K; });
    pinta(ctx, cx, cy, RX, RY, function (i, j) {
      var u = i / RX, v = j / RY, r = Math.sqrt(u * u + v * v), a = (Math.atan2(v, u) + Math.PI) / (2 * Math.PI);
      if (r > 1.02) return null;
      if (r > 0.86) return aro[Math.floor(a * aro.length + f) % aro.length];
      if (r > 0.8) return K;
      if (r < 0.18) return '#ffffff';
      var b = (a * 3 - r * 2.2 + f / 6) % 1;
      return tons[b < 0.25 ? 3 : b < 0.5 ? 2 : b < 0.75 ? 1 : 0];
    });
  }
  // os 4 tons da espiral a partir de uma cor (escuro → claro)
  function tonsDe(cor) { var C = PA_cor(); return C ? [C.escurecer(cor, 0.25), cor, C.clarear(cor, 0.35), C.clarear(cor, 0.7)] : [cor, cor, cor, cor]; }
  function PA_cor() { return window.PA && window.PA.cor; }
  var AZUL = ['#2f4fb8', '#3f6fd8', '#5f9cff', '#9fd0ff'];
  // coluna de luz e brilhinhos subindo (só animado)
  function brilho(ctx, cx, base, t) {
    var alto = 26 + (Math.floor(t / 400) % 2) * 3;
    for (var k = 0; k < alto; k += 2) {
      var w = 16 - Math.floor(k / 4);
      if (w > 2) ret(ctx, cx - (w >> 1), base - 6 - k, w, 1, 'rgba(230,244,255,' + (0.3 - k / 110).toFixed(3) + ')');
    }
    for (var s = 0; s < 6; s++) {
      var p = ((t + s * 330) % 2000) / 2000, x = cx - 12 + ((s * 5) % 24), y = base - 4 - Math.round(p * 32);
      ret(ctx, x, y, 1, 1, ARCO[s]);
      if (p > 0.3 && p < 0.7) { ret(ctx, x - 1, y, 3, 1, ARCO[s]); ret(ctx, x, y - 1, 1, 3, '#ffffff'); }
    }
  }

  // o portal no mapa (1 × 1 tile; o desenho passa para os lados, dentro da folga do sprite)
  function criar(cores) {
    var tons = cores && cores.tons ? cores.tons : cores && cores.fundo ? null : AZUL;
    function t4() { return tons || (tons = tonsDe(cores.fundo)); }
    function desenhar(ctx, px, py) { vortice(ctx, px + 8, py + 9, t4(), 0); }
    function animar(ctx, px, py, w, h, t) {
      if (!t) return;
      vortice(ctx, px + 8, py + 9, t4(), Math.floor(t / 160) % 6);
      brilho(ctx, px + 8, py + 9, t);
    }
    return { desenhar: desenhar, animar: animar };
  }

  // pedrinha redonda: (x, y) = canto de cima, w × h; contorno sem as quinas, luz em cima e sombra embaixo
  function pedra(ctx, x, y, w, h, cores) {
    ret(ctx, x + 1, y, w - 2, h, K); ret(ctx, x, y + 1, w, h - 2, K);
    ret(ctx, x + 1, y + 1, w - 2, h - 2, cores[1]);
    ret(ctx, x + 1, y + 1, w - 3, 1, cores[2]); ret(ctx, x + 1, y + 2, 1, 1, cores[2]);
    ret(ctx, x + 2, y + h - 2, w - 3, 1, cores[0]); ret(ctx, x + w - 2, y + h - 3, 1, 1, cores[0]);
  }
  // o portal de volta dentro da arena: o mesmo redemoinho, com a espiral nas cores do `anel` da arena
  function saida(cores) {
    var tons = cores && cores.anel ? cores.anel.slice(0, 4) : AZUL;
    return function (ctx, px, py) { vortice(ctx, px + 8, py + 9, tons, 0); };
  }

  R.Portal = {
    criar: criar, saida: saida, pedra: pedra, vortice: vortice, brilho: brilho, AZUL: AZUL,
    registrar: function (sprite, cores) {
      var M = window.Mapa;
      if (!M || !M.PREDIOS) return false;
      var p = criar(cores);
      M.PREDIOS[sprite] = p.desenhar;
      (M.PREDIOS_ANIM = M.PREDIOS_ANIM || {})[sprite] = p.animar;
      return true;
    },
  };
})();
