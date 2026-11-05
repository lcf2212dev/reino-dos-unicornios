/* Bosque dos Fantasmas, os objetos mágicos (prefixo bosque-): cogumelos que brilham, lanternas das fadas, a placa do
   bosque, o anel de fadas, a poça de lírios, flores e vaga-lumes que brilham. O brilho parado fica no `desenhar`;
   o piscar, no `anim` (só com Animações; com t = 0 fica parado). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  var P = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return P.tempo ? P.tempo(t) : 0; }
  var CHAPEU = ['#ff8ac4', '#b894ff', '#6fd6ff', '#ffc94d'], CHAPEU_LUZ = ['#ffc4e4', '#d9c4ff', '#b8ecff', '#ffe9a0'];
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  function halo(ctx, cx, cy, rx, ry, rgb) {
    elipse(ctx, cx, cy, rx, ry, 'rgba(' + rgb + ',0.12)'); elipse(ctx, cx, cy, Math.round(rx * 0.7), Math.round(ry * 0.7), 'rgba(' + rgb + ',0.16)');
  }
  // cogumelo: pé, chapéu com pintinhas; (cx, base) = meio e chão
  function cogumelo(ctx, cx, base, r, i) {
    ret(ctx, cx - 2, base - r - 1, 5, r + 2, K); ret(ctx, cx - 1, base - r, 3, r + 1, '#f4ecd8');
    elipse(ctx, cx, base - r - 1, r + 2, r, K); elipse(ctx, cx, base - r - 1, r + 1, r - 1, CHAPEU[i % 4]);
    ret(ctx, cx - r + 1, base - r - 3, 2, 1, CHAPEU_LUZ[i % 4]); ret(ctx, cx + 1, base - r - 2, 2, 2, CHAPEU_LUZ[i % 4]);
  }
  var NUM = { 0: '255,138,196', 1: '184,148,255', 2: '111,214,255', 3: '255,201,77' };

  // o cogumelo grande que brilha (interativo): halo parado e brilhinhos que piscam
  I.objeto('bosque-cogumelo', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py, o) {
      var i = (o.var && o.var.n) || 0;
      halo(ctx, px + 8, py + 8, 14, 10, NUM[i % 4]);
      elipse(ctx, px + 8, py + 14, 6, 2, 'rgba(40,70,40,0.3)');
      cogumelo(ctx, px + 8, py + 15, 6, i);
    },
    anim: function (ctx, px, py, t, o) {
      var i = (o.var && o.var.n) || 0, f = tempo(t) ? Math.floor(tempo(t) / 350) % 4 : 0;
      if (f < 2) brilho(ctx, px + 2 + f * 10, py - 4 + f * 3, CHAPEU_LUZ[i % 4]);
    } });
  I.objeto('bosque-cogumelos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var i = (o.var && o.var.n) || 0;
      halo(ctx, px + 8, py + 10, 9, 6, NUM[i % 4]);
      cogumelo(ctx, px + 5, py + 13, 3, i); cogumelo(ctx, px + 11, py + 14, 2, i + 1);
    } });
  // anel de fadas (2×2): cogumelinhos em roda com um brilho no meio
  I.objeto('bosque-anel-fadas', { w: 2, h: 2, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 17, 15, 11, 'rgba(184,148,255,0.14)');
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2;
        cogumelo(ctx, px + 16 + Math.round(Math.cos(a) * 12), py + 18 + Math.round(Math.sin(a) * 8), 2, i);
      }
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 300) % 3 : 0;
      brilho(ctx, px + 14 + f * 2, py + 14 + (f & 1) * 3, '#ffffff'); brilho(ctx, px + 20 - f, py + 20, '#ffe9a0');
    } });
  // flor que brilha: botão azul-turquesa com pontinhos de luz
  I.objeto('bosque-flor-brilho', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      halo(ctx, px + 8, py + 9, 8, 6, '111,214,255');
      [[5, 9], [11, 7]].forEach(function (f) {
        ret(ctx, px + f[0], py + f[1] + 2, 1, 5, '#2f8a3c');
        ret(ctx, px + f[0] - 2, py + f[1] - 1, 5, 4, K); ret(ctx, px + f[0] - 1, py + f[1] - 2, 3, 2, K);
        ret(ctx, px + f[0] - 1, py + f[1] - 1, 3, 3, '#6fd6ff'); ret(ctx, px + f[0] - 1, py + f[1] - 1, 1, 1, '#ffffff'); ret(ctx, px + f[0], py + f[1], 1, 1, '#b8ecff');
      });
    } });
  var VAGA = [[3, 5, 0], [10, 3, 2], [12, 11, 4]];   // [x, y, fase] de cada vaga-lume (fora do quadro: nada novo por frame)
  // vaga-lumes: pontinhos de luz amarela flutuando (parados sem Animações)
  I.objeto('bosque-vagalumes', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      VAGA.forEach(function (v) { elipse(ctx, px + v[0], py + v[1], 3, 2, 'rgba(255,233,120,0.2)'); ret(ctx, px + v[0], py + v[1], 1, 1, '#fff3a0'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < VAGA.length; n++) {
        var v = VAGA[n], dx = t ? Math.round(Math.sin(t / 500 + v[2]) * 3) : 0, dy = t ? Math.round(Math.cos(t / 420 + v[2]) * 2) : 0;
        ret(ctx, px + v[0] + dx, py + v[1] + dy, 2, 2, (t ? Math.floor(t / 250 + v[2]) % 3 : 0) ? '#fff3a0' : '#ffffff');
      }
    } });

  // a lanterna das fadas: poste de madeira com a luz quentinha pendurada (interativa)
  I.objeto('bosque-lanterna', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 5, 2, 'rgba(40,70,40,0.3)');
      halo(ctx, px + 8, py - 14, 13, 13, '255,226,122');
      ret(ctx, px + 7, py - 18, 3, 33, K); ret(ctx, px + 8, py - 18, 1, 32, '#9a6c46'); ret(ctx, px + 9, py - 18, 1, 32, '#5a3a24');
      ret(ctx, px + 8, py - 22, 7, 2, K); ret(ctx, px + 12, py - 22, 2, 8, K);   // braço curvo
      ret(ctx, px + 10, py - 21, 4, 1, '#9a6c46');
      ret(ctx, px + 9, py - 14, 8, 10, K); ret(ctx, px + 10, py - 13, 6, 8, '#ffe27a'); ret(ctx, px + 11, py - 12, 2, 5, '#fffbe0'); ret(ctx, px + 9, py - 15, 8, 2, K);
      ret(ctx, px + 6, py + 12, 7, 4, K); ret(ctx, px + 7, py + 12, 5, 3, '#8a8a9c');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 400) % 3 : 0;
      brilho(ctx, px + 4 + f * 6, py - 18 + (f & 1) * 5, '#fff3a0');
    } });
  // a placa de madeira do bosque, com um fantasminha pintado
  I.objeto('bosque-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 6, 2, 'rgba(40,70,40,0.3)');
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, '#7a5234');
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, '#d8a860'); ret(ctx, px + 1, py - 3, 14, 2, '#f0c888'); ret(ctx, px + 1, py + 5, 14, 2, '#a87840');
      elipse(ctx, px + 8, py - 1, 4, 3, K); ret(ctx, px + 4, py - 1, 9, 5, K);
      elipse(ctx, px + 8, py - 1, 3, 2, '#ffffff'); ret(ctx, px + 5, py - 1, 7, 4, '#ffffff'); ret(ctx, px + 5, py + 3, 1, 1, '#d8a860'); ret(ctx, px + 8, py + 3, 1, 1, '#d8a860'); ret(ctx, px + 11, py + 3, 1, 1, '#d8a860');
      ret(ctx, px + 6, py, 1, 2, K); ret(ctx, px + 10, py, 1, 2, K);
    } });
  // poça com lírios (2×1, a água é sólida)
  I.objeto('bosque-poca', { w: 2, h: 1, solido: true, topo: 2,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 9, 15, 7, K); elipse(ctx, px + 16, py + 9, 14, 6, '#5a9ad8'); elipse(ctx, px + 16, py + 8, 11, 4, '#7cb8f0');
      ret(ctx, px + 8, py + 6, 5, 1, '#d4ecff'); ret(ctx, px + 20, py + 11, 4, 1, '#d4ecff');
      elipse(ctx, px + 12, py + 9, 4, 2, '#3fa84c'); elipse(ctx, px + 12, py + 8, 3, 1, '#58b257');
      elipse(ctx, px + 22, py + 7, 3, 2, '#3fa84c'); ret(ctx, px + 22, py + 5, 2, 2, '#ffb0d8'); ret(ctx, px + 22, py + 5, 1, 1, '#ffffff');
      ret(ctx, px + 1, py + 11, 4, 3, '#58b257'); ret(ctx, px + 27, py + 5, 3, 4, '#58b257');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 500) % 3 : 0;
      ret(ctx, px + 14 + f * 3, py + 5 + f, 3, 1, '#ffffff');
    } });
})();
