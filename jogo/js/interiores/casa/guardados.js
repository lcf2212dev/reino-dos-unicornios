/* Minha Casa: o Baú de Guardados (objeto `casa-guardados`, 2×1, na Sala de Estar; docs/contratos/itens.md §7) e a
   ação 'guardados', que abre a tela UI.telaGuardados (ui/guardados.js). A ação mora aqui (node: true) para o
   validador dos interiores conhecê-la. Baú de madeira com tampa arredondada em degraus, ferragens douradas e um
   coraçãozinho no fecho (diferente do baú do prêmio do Bosque). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, escurecer = D.escurecer, clarear = D.clarear;
  var MADEIRA = '#c98a4a', OURO = '#ffd34d', OURO2 = '#e0a020', CORACAO = '#ff5c8a';

  R.Interiores.objeto('casa-guardados', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var esc = escurecer(MADEIRA, 0.25), luz = clarear(MADEIRA, 0.25);
      ret(ctx, px + 2, py + 14, 28, 2, escurecer(MADEIRA, 0.6));                 // sombra no chão
      // tampa arredondada em degraus (contorno e madeira), luz de cima
      ret(ctx, px + 7, py - 8, 18, 1, K); ret(ctx, px + 4, py - 7, 24, 1, K); ret(ctx, px + 2, py - 6, 28, 1, K);
      ret(ctx, px + 1, py - 5, 30, 9, K);
      ret(ctx, px + 7, py - 7, 18, 1, luz); ret(ctx, px + 4, py - 6, 24, 1, luz); ret(ctx, px + 2, py - 5, 28, 2, MADEIRA);
      ret(ctx, px + 2, py - 3, 28, 6, MADEIRA); ret(ctx, px + 2, py - 4, 28, 1, luz);
      ret(ctx, px + 2, py + 2, 28, 1, esc);
      // frente do baú
      ret(ctx, px + 1, py + 3, 30, 12, K);
      ret(ctx, px + 2, py + 4, 28, 10, MADEIRA);
      ret(ctx, px + 2, py + 4, 1, 10, luz); ret(ctx, px + 28, py + 4, 2, 10, esc); ret(ctx, px + 2, py + 13, 28, 1, esc);
      ret(ctx, px + 4, py + 8, 7, 1, esc); ret(ctx, px + 21, py + 8, 7, 1, esc);  // tábuas
      // ferragens douradas (cintas) da tampa até o pé
      [5, 24].forEach(function (x) {
        ret(ctx, px + x, py - 6, 3, 20, OURO); ret(ctx, px + x + 2, py - 6, 1, 20, OURO2);
        ret(ctx, px + x, py + 3, 3, 1, K);
      });
      // fecho com o coraçãozinho
      ret(ctx, px + 12, py, 8, 8, K); ret(ctx, px + 13, py + 1, 6, 6, OURO); ret(ctx, px + 18, py + 1, 1, 6, OURO2);
      ret(ctx, px + 14, py + 2, 1, 1, CORACAO); ret(ctx, px + 16, py + 2, 1, 1, CORACAO);
      ret(ctx, px + 14, py + 3, 3, 1, CORACAO); ret(ctx, px + 15, py + 4, 1, 1, CORACAO);
      ret(ctx, px + 13, py + 1, 1, 1, C.branco); ret(ctx, px + 9, py - 6, 2, 1, C.branco);
    } });

  // tocar no baú abre a tela (ui/guardados.js); sem a tela (ferramentas), nada
  R.registrarModulo({
    id: 'casa-guardados',
    acoes: { guardados: function () { return R.UI && R.UI.telaGuardados ? R.UI.telaGuardados() : null; } },
  });
})();
