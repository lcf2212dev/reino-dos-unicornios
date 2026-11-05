/* Bosque dos Fantasmas: o portal no mapa (Mapa.PREDIOS['portal-bosque'], 1 × 1 tile; docs/contratos/bosque.md).
   Um disco chato no chão, dentro do próprio tile (ela pisa em cima e aparece na frente): aro lilás, redemoinho
   rosa e estrelinhas. O brilho (Mapa.PREDIOS_ANIM['portal-bosque'], só com Animações) é para ser visto de longe:
   halo que pulsa por fora do aro, miolo pulsando, coluna de luz, faíscas 2×2 subindo e estrelinhas piscando.
   Cores prontas, nada de objeto ou string por quadro; o sprite tem folga de 16 px dos lados e 40 em cima. */
(function () {
  var D = window.Reino.Desenho, K = D.K, ret = D.ret;

  // disco em pixel: meia largura da fileira j (de -ry a ry), igual ao D.elipse, mas sem o "pino" de 1 px em j = ±ry
  function disco(ctx, cx, cy, rx, ry, cor) {
    ctx.fillStyle = cor;
    for (var j = -ry; j <= ry; j++) {
      var m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 0.5) * (ry + 0.5)))) + 0.3);
      ctx.fillRect(cx - m, cy + j, m * 2 + 1, 1);
    }
  }

  function desenharPortal(ctx, px, py) {
    var cx = px + 8, cy = py + 9;
    disco(ctx, cx, cy + 1, 8, 5, 'rgba(58,36,70,0.22)');                    // sombra de chão, saindo por baixo do disco
    disco(ctx, cx, cy, 8, 5, K);
    disco(ctx, cx, cy, 7, 4, '#b57cff');                                     // aro lilás
    ret(ctx, px + 4, py + 5, 5, 1, '#e8d6ff'); ret(ctx, px + 2, py + 6, 2, 1, '#e8d6ff');   // luz em cima à esquerda
    ret(ctx, px + 9, py + 13, 4, 1, '#8a5ad8');                              // sombra embaixo à direita
    disco(ctx, cx, cy, 5, 3, '#5a2fb0');                                     // fundo do redemoinho
    ret(ctx, px + 4, py + 9, 3, 1, '#ff7ec0'); ret(ctx, px + 5, py + 10, 3, 1, '#ff7ec0');   // braços rosa em espiral
    ret(ctx, px + 9, py + 8, 3, 1, '#ff7ec0'); ret(ctx, px + 8, py + 7, 3, 1, '#ff7ec0');
    ret(ctx, px + 11, py + 9, 1, 1, '#ffc8e6'); ret(ctx, px + 4, py + 8, 1, 1, '#ffc8e6');
    disco(ctx, cx, cy, 2, 1, '#ffd0ea');
    ret(ctx, cx - 1, cy, 2, 1, '#ffffff');                                   // miolo claro
    // estrelinhas em cruz no chão, nos cantos do tile
    [[1, 3, '#ffe066'], [14, 4, '#ffffff'], [14, 14, '#ffe066'], [1, 13, '#ffffff']].forEach(function (s) {
      ret(ctx, px + s[0], py + s[1], 1, 1, s[2]);
      ret(ctx, px + s[0] - 1, py + s[1], 1, 1, 'rgba(255,255,255,0.55)'); ret(ctx, px + s[0] + 1, py + s[1], 1, 1, 'rgba(255,255,255,0.55)');
      ret(ctx, px + s[0], py + s[1] - 1, 1, 1, 'rgba(255,255,255,0.55)'); ret(ctx, px + s[0], py + s[1] + 1, 1, 1, 'rgba(255,255,255,0.55)');
    });
  }

  // ---- brilho animado (tudo pronto de antemão) ----
  // halo: o contorno de uma elipse (rx 10, ry 6) em retângulos [dx, dy, w, h] relativos ao miolo, montados uma vez
  var HALO_R = (function () {
    var rx = 10, ry = 6, j, x, lista = [], dentro = function (X, Y, a, b) { return (X * X) / (a * a) + (Y * Y) / (b * b) <= 1; };
    for (j = -ry; j <= ry; j++) {
      var x0 = null;
      for (x = -rx; x <= rx + 1; x++) {
        var anel = x <= rx && dentro(x, j, rx + 0.4, ry + 0.4) && !dentro(x, j, rx - 1.2, ry - 1.2);
        if (anel && x0 === null) x0 = x;
        if (!anel && x0 !== null) { lista.push([x0, j, x - x0, 1]); x0 = null; }
      }
    }
    // junta fileiras seguidas com o mesmo trecho (os lados viram retângulos altos)
    var fim = [];
    lista.forEach(function (r) {
      var u = fim[fim.length - 1];
      if (u && u[0] === r[0] && u[2] === r[2] && u[1] + u[3] === r[1]) u[3]++; else fim.push(r);
    });
    return fim;
  })();
  var HALO = ['rgba(220,196,255,0.95)', 'rgba(220,196,255,0.6)', 'rgba(220,196,255,0.25)', 'rgba(220,196,255,0.6)'];
  var PULSO = ['#ffffff', '#ffe0f2', '#ffc8e6', '#ffe0f2'];
  var LUZ = ['rgba(255,240,252,0.32)', 'rgba(255,240,252,0.16)'];
  var ORBITA = [[3, 9], [4, 6], [8, 5], [12, 6], [13, 9], [12, 12], [8, 13], [4, 12]];   // no aro, relativo ao tile
  var FAISCA = ['#ffffff', '#ffe066', '#ff9ed2', '#c9a6ff'];
  var ESTRELAS = [[1, 3], [14, 14]];
  function animarPortal(ctx, px, py, w, h, t) {
    if (!t) return;
    var i, o, f, x, y, r, cx = px + 8, cy = py + 9, p = Math.floor(t / 300) % 4;
    ctx.fillStyle = HALO[p];                                                  // halo redondo pulsando por fora do aro
    for (i = 0; i < HALO_R.length; i++) { r = HALO_R[i]; ctx.fillRect(cx + r[0], cy + r[1], r[2], r[3]); }
    for (i = 0; i < 2; i++) { ctx.fillStyle = LUZ[i]; ctx.fillRect(cx - 3 + i * 2, cy - 4 - i * 9, 6 - i * 4, 9); }   // coluna de luz
    ctx.fillStyle = PULSO[p]; ctx.fillRect(px + 6, py + 8, 4, 2);            // miolo pulsando
    o = Math.floor(t / 130) % 8;                                              // dois brilhinhos girando no aro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + ORBITA[o][0], py + ORBITA[o][1], 2, 1);
    ctx.fillRect(px + ORBITA[(o + 4) % 8][0], py + ORBITA[(o + 4) % 8][1], 2, 1);
    for (i = 0; i < 4; i++) {                                                 // faíscas 2×2 subindo
      f = ((t / 2200) + i * 0.25) % 1;
      x = px + 3 + i * 3 + Math.round(Math.sin(f * 6.3 + i * 1.7) * 2);
      y = py + 7 - Math.round(f * 28);
      ctx.fillStyle = FAISCA[i]; ctx.fillRect(x, y, 2, 2);
    }
    for (i = 0; i < 2; i++) {                                                 // estrelinhas do chão piscando, cada uma no seu tempo
      if ((Math.floor(t / 260) + i * 3) % 6 > 2) continue;
      ctx.fillStyle = '#ffffff'; x = px + ESTRELAS[i][0]; y = py + ESTRELAS[i][1];
      ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5);
    }
  }

  if (window.Mapa && Mapa.PREDIOS) {
    Mapa.PREDIOS['portal-bosque'] = desenharPortal;
    (Mapa.PREDIOS_ANIM = Mapa.PREDIOS_ANIM || {})['portal-bosque'] = animarPortal;
  }
})();
