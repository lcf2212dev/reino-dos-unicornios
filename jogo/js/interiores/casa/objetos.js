/* Minha Casa: os objetos do prédio (casa.md §2). A caixa de mudança de papelão, com fita e a setinha "para cima",
   que abre o modo decorar (ação 'casaDecorar'). Os móveis dos kits moram em casa/moveis-*.js. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, escurecer = D.escurecer, clarear = D.clarear;
  var PAPELAO = '#d9a66b', FITA = '#f2dcae';

  R.Interiores.objeto('casa-caixa', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      var e = escurecer(PAPELAO, 0.2);
      // tampa (de cima) e frente da caixa
      ret(ctx, px + 1, py - 3, 14, 17, K);
      ret(ctx, px + 2, py - 2, 12, 5, clarear(PAPELAO, 0.2));
      ret(ctx, px + 2, py + 3, 12, 1, K);
      ret(ctx, px + 2, py + 4, 12, 9, PAPELAO);
      ret(ctx, px + 2, py + 4, 1, 9, clarear(PAPELAO, 0.15)); ret(ctx, px + 12, py + 4, 2, 9, e);
      ret(ctx, px + 2, py + 12, 12, 1, e);
      // a fita no meio da tampa, descendo pela frente
      ret(ctx, px + 7, py - 2, 2, 5, FITA); ret(ctx, px + 7, py + 4, 2, 3, FITA); ret(ctx, px + 7, py + 7, 2, 1, escurecer(FITA, 0.15));
      ret(ctx, px + 7, py - 2, 1, 1, C.branco);
      // a setinha "para cima" e o coraçãozinho escritos de canetão
      ret(ctx, px + 4, py + 8, 1, 4, K); ret(ctx, px + 3, py + 9, 3, 1, K);
      ret(ctx, px + 10, py + 9, 1, 1, '#ff6b8a'); ret(ctx, px + 12, py + 9, 1, 1, '#ff6b8a'); ret(ctx, px + 10, py + 10, 3, 1, '#ff6b8a'); ret(ctx, px + 11, py + 11, 1, 1, '#ff6b8a');
    } });
})();
