/* A Teleportadora da Cidade Nova (docs/contratos/cidade-nova.md): um unicórnio adulto, alado,
   com uma aura arco-íris que gira devagar. Desenha no mapa (mundo/teleportadora.js), nos objetos
   da Cidade Nova (interiores/cidade-nova/objetos.js) e no retrato do balão. A aura é pixel art:
   anéis de 1 px em volta do corpo e estrelinhas; sem Animações ela fica parada. */
(function () {
  var R = window.Reino, D = R.Desenho;
  var CORES = ['#ff6b8a', '#ff9d2e', '#ffd34d', '#6fdc8c', '#5fb4ff', '#b58cff'];
  var DEF = { id: 'teleportadora', nome: 'Teleportadora', raridade: 'lendario',
    cores: { corpo: '#f6efff', crina: ['#ff6b8a', '#ffd34d', '#5fb4ff'], chifre: '#ffd34d', casco: '#e8c9a0', asa: '#fff6ff' } };

  function sprite() { return window.PA && PA.unicornio ? PA.unicornio(DEF, 3, 0) : null; }

  // anel de pixels em volta do centro (elipse); `fase` gira os pontinhos
  function anel(ctx, cx, cy, rx, ry, cor, fase) {
    var n = Math.max(16, Math.round((rx + ry) * 2.2));
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + fase;
      ctx.fillStyle = cor;
      ctx.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1);
    }
  }
  function aura(ctx, cx, cy, t, animar) {
    var giro = animar ? t / 2400 : 0;
    for (var i = 0; i < CORES.length; i++) {
      var r = 17 + i * 2;
      anel(ctx, cx, cy, r + 4, r, CORES[i], giro * (i % 2 ? -1 : 1) + i * 0.35);
    }
    // brilhos em volta: acendem em degraus, parados sem Animações
    var pontos = [[-22, -14], [20, -18], [-18, 8], [24, 4], [-8, -27], [10, -29], [0, 18], [16, 14]];
    pontos.forEach(function (p, i) {
      var passo = animar ? (Math.floor(t / 260) + i) % 5 : (i % 3 === 0 ? 2 : 0);
      if (!passo) return;
      var x = cx + p[0], y = cy + p[1], cor = CORES[(i + (animar ? Math.floor(t / 400) : 0)) % CORES.length];
      if (passo === 1) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, 1); }
      else if (passo === 2) { ctx.fillStyle = cor; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, 1); }
      else { ctx.fillStyle = cor; ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); }
    });
  }

  /** desenha a Teleportadora com o pé em (px + 16, py + 32) da pegada 2×2 */
  function desenhar(ctx, px, py, t, animar) {
    var s = sprite();
    if (!s) return;
    var img = s.canvas || s, w = img.width, h = img.height;
    var cx = px + 16, cy = py + 10;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    aura(ctx, cx, cy, t, animar);
    ctx.drawImage(img, Math.round(cx - w / 2), Math.round(py + 32 - h));
    ctx.restore();
  }
  // só a aura animada (o corpo já está no estático)
  function animar(ctx, px, py, t) {
    // o motor dos interiores passa um ctx falso só com fillStyle/fillRect (como os outros `anim`)
    aura(ctx, px + 16, py + 10, t, true);
  }

  R.TeleportadoraArte = {
    DEF: DEF, cores: CORES, desenhar: desenhar, animar: animar,
    retrato: function () { var s = sprite(); return s ? (s.canvas || s) : null; },
    sprite: sprite,
  };
})();

/* O portal entre o Bosque e a Cidade Nova: um aro arco-íris com redemoinho e estrelinhas. Desenhado
   nos dois lados (interiores/bosque/portal-cidade.js e interiores/cidade-nova/objetos.js). */
(function () {
  var R = window.Reino, D = R.Desenho;
  var CORES = ['#ff6b8a', '#ff9d2e', '#ffd34d', '#6fdc8c', '#5fb4ff', '#b58cff'];
  function desenhar(ctx, px, py) {
    var cx = px + 16, cy = py + 12;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // halo
    for (var i = 0; i < 6; i++) {
      var rx = 13 + i, ry = 17 + i;
      ctx.fillStyle = CORES[i];
      for (var a = 0; a < 40; a++) {
        var an = (a / 40) * Math.PI * 2;
        ctx.fillRect(Math.round(cx + Math.cos(an) * rx), Math.round(cy + Math.sin(an) * ry), 1, 1);
      }
    }
    // miolo escuro com redemoinho
    D.elipse(ctx, cx, cy, 12, 16, '#3a2446');
    D.elipse(ctx, cx, cy, 10, 14, '#4a3a7a');
    for (var k = 0; k < 14; k++) {
      var t = k / 14 * Math.PI * 4;
      ctx.fillStyle = CORES[k % CORES.length];
      ctx.fillRect(Math.round(cx + Math.cos(t) * (2 + t * 0.7)), Math.round(cy + Math.sin(t) * (2 + t * 0.9)), 1, 1);
    }
    // estrelinhas
    [[-8, -12], [8, -10], [-10, 8], [9, 9], [0, -18]].forEach(function (p, i) {
      ctx.fillStyle = i % 2 ? '#ffffff' : CORES[i % CORES.length];
      ctx.fillRect(cx + p[0] - 1, cy + p[1], 3, 1); ctx.fillRect(cx + p[0], cy + p[1] - 1, 1, 3);
    });
    // base de pedra
    D.ret(ctx, px + 2, py + 30, 28, 3, '#3a2446');
    D.ret(ctx, px + 3, py + 31, 26, 1, '#8e9ab4');
    ctx.restore();
  }
  R.PortalCidadeArte = { desenhar: desenhar, cores: CORES };
})();
