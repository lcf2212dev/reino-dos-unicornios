/* Parquinho, parte 7: o balanço (fase 1), pelos ajudantes P.H de poses.js. Ela no assento azul e o unicórnio no
   rosa, balançando juntos (ele um tiquinho atrás); as medidas são as de P.GEO.balanco (objetos.js). Sem Animações: a
   pose parada. Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, H = P.H, reg = P.registrarPose;

  /* ---------- balanço ---------- */
  reg('balanco', {
    esconde: true,
    sons: [[0.05, 'toque'], [0.35, 'toque'], [0.65, 'toque'], [0.97, 'plim']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.balanco, s = H.onda(e, 1300, animar, 0.6), c = P.pintor(p);
      return [H.item(H.base(st), function () {
        g.assentos.forEach(function (ax, i) {
          var lado = i ? H.onda(e + 160, 1300, animar, 0.6) : s, dx = Math.round(lado * 6), dy = -Math.round(Math.abs(lado) * 3);
          var x = o.x + ax + dx, y = o.y + g.assento + dy;
          P.assento(c, o.x + ax, o.y + g.barra, x, y, g.cores[i]);
          if (i === 0) H.spr(p, H.ela(true, 'frente'), x, y + 6, false);
          else H.spr(p, H.uni('frente'), x, y + 1, false);
          P.linha(c, o.x + ax - 5, o.y + g.barra, x - 5, y, '#8e9ab4'); P.linha(c, o.x + ax + 5, o.y + g.barra, x + 5, y, '#8e9ab4');
        });
      })];
    },
  });
})();
