/* Parquinho, parte 8: a caixa de areia (fase 1), pelos ajudantes P.H de poses.js. Tocar na caixa: ela pula para
   dentro e senta, e o unicórnio vem atrás (config.parquinho.ms.areia); no fim (ou no toque que pula), abre a
   brincadeira de perto, UI.telaParquinhoAreia (ui/parquinho-areia.js; as regras em areia-caixa.js). Fechando a tela,
   ela continua onde estava, ao lado da caixa. O que ela fez fica até fechar o jogo, e a caixa do parque mostra
   (objetos.js, areia-desenho.js). Sem Animações: a pose parada. Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, H = P.H, reg = P.registrarPose;

  reg('areia', {
    esconde: true,
    sons: [[0.55, 'toque']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.areia, k = animar ? Math.min(1, e / st.dur) : 1;
      var ela = { x: o.x + g.ela[0], y: o.y + g.ela[1] }, uni = { x: o.x + g.uni[0], y: o.y + g.uni[1] };
      // ela pula de onde estava até o meio da areia; o unicórnio, logo atrás, até o lado da caixa
      var pe = H.arco(st.de, ela, H.trecho(k, 0, 0.7), 10), pu = H.arco({ x: st.de.x + 12, y: st.de.y }, uni, H.trecho(k, 0.2, 0.9), 8);
      return [H.item(H.base(st), function () {
        H.sombra(p, pu.x, pu.y, 8);
        H.spr(p, H.uni('lado'), pu.x, pu.y, true);
        if (k < 0.7) { H.sombra(p, pe.x, pe.y, 5); H.spr(p, H.ela(false, 'frente'), pe.x, pe.y, false); }
        else H.spr(p, H.ela(true, 'frente'), ela.x, ela.y, false);
      })];
    },
    // abre a caixa de perto, se ela ainda está no parque (saiu de cena no meio: nada)
    fim: function (st) {
      var cena = R.Cena && R.Cena.atual && R.Cena.atual();
      if (!cena || cena.id !== st.interior || !R.UI || !R.UI.telaParquinhoAreia) return;
      R.UI.telaParquinhoAreia();
    },
  });
})();
