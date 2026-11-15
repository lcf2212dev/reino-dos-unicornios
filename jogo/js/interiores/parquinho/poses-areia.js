/* Parquinho, parte 8: a caixa de areia (fase 1), pelos ajudantes P.H de poses.js. Ela senta na areia e o castelinho
   sobe em etapas; o unicórnio ajuda. O castelinho fica de pé até fechar o jogo (memória, nada no save): P.castelos()
   diz quantos ela já fez desde que abriu o jogo (o desenho parado da caixa, em objetos.js, lê). Sem Animações: a pose
   parada. Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, H = P.H, reg = P.registrarPose;
  var castelos = 0;
  P.castelos = function () { return castelos; };

  /* ---------- caixa de areia: ela senta na areia e o castelinho sobe em etapas; o unicórnio ajuda ---------- */
  reg('areia', {
    esconde: true,
    fim: function () { castelos++; },   // o castelinho entra no desenho parado (objetos.js lê P.castelos())
    sons: [[0.2, 'toque'], [0.45, 'toque'], [0.7, 'toque'], [0.95, 'estrela']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.areia, c = P.pintor(p), k = e / st.dur;
      var etapa = animar ? Math.min(4, 1 + Math.floor(k * 4.4)) : 4;
      var pula = animar && Math.floor(e / 320) % 2 ? 1 : 0;
      return [H.item(H.base(st), function () {
        P.castelo(c, o.x + g.castelo[0], o.y + g.castelo[1], etapa);
        H.sombra(p, o.x + g.uni[0], o.y + g.uni[1], 8);
        H.spr(p, H.uni('lado'), o.x + g.uni[0], o.y + g.uni[1] - pula, true);
        H.spr(p, H.ela(true, 'frente'), o.x + g.ela[0], o.y + g.ela[1], false);
        if (animar && etapa < 4) {                                            // a areia voando das mãos
          var f = (e % 400) / 400;
          [[-4, 1], [3, 0], [7, 2]].forEach(function (s, i) {
            c.fillStyle = i % 2 ? '#e8c77e' : '#f6e2a8';
            c.fillRect(o.x + g.ela[0] + 8 + s[0] + Math.round(f * 6), o.y + g.ela[1] - 10 - Math.round(Math.sin(f * Math.PI) * 6) + s[1], 1, 1);
          });
        }
      })];
    },
  });
})();
