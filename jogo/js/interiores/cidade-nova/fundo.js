/* Céu aberto da Cidade Nova (docs/contratos/cidade-nova.md): o vão em volta do chão é céu com
   nuvens e morros distantes. Sem DOM no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores, D = R.Desenho;
  if (!I || !I.FUNDOS) return;
  I.FUNDOS.cidade = {
    cor: '#9fd8ff',
    desenhar: function (ctx, w, h) {
      var faixas = ['#8ccfff', '#9fd8ff', '#b8e4ff', '#d4f0ff'];
      for (var i = 0; i < faixas.length; i++) D.ret(ctx, 0, Math.floor(h * i / faixas.length), w, Math.ceil(h / faixas.length), faixas[i]);
      D.circulo(ctx, Math.floor(w * 0.82), 60, 13, '#fff1a8');
      D.circulo(ctx, Math.floor(w * 0.82), 60, 10, '#ffe066');
      for (var x = 0; x < w; x += 80) {
        D.elipse(ctx, x + 40, h - 20, 70, 38, '#7cc15a');
        D.elipse(ctx, x + 40, h - 18, 60, 30, '#8fd46a');
      }
      [[120, 50], [320, 80], [560, 40], [760, 70]].forEach(function (p) {
        D.elipse(ctx, p[0], p[1], 24, 8, '#ffffff'); D.elipse(ctx, p[0] - 12, p[1] + 2, 14, 6, '#ffffff'); D.elipse(ctx, p[0] + 16, p[1] + 1, 16, 7, '#f4fbff');
      });
    },
  };
})();
