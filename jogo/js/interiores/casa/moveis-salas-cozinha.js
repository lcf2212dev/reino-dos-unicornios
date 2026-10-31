/* Casa do jogador: os móveis avulsos de Cozinha (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   PROVISÓRIO: caixas no lugar do desenho (a frente de arte troca pelo desenho de verdade). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, ret = D.ret;
  var I = R.Interiores;

  function provisorio(w, h, topo, cor) {
    return function (ctx, px, py) { ret(ctx, px + 1, py - topo, w * 16 - 2, h * 16 - 1 + topo, K); ret(ctx, px + 2, py - topo + 1, w * 16 - 4, h * 16 - 3 + topo, cor); };
  }

  I.objeto('casa-movel-sorveteira', { w: 1, h: 1, topo: 14, solido: true, desenhar: provisorio(1, 1, 14, '#ffc94d') });
  I.objeto('casa-movel-lixeira', { w: 1, h: 1, topo: 4, solido: true, desenhar: provisorio(1, 1, 4, '#ffc94d') });
  I.objeto('casa-movel-prateleira', { w: 2, h: 2, parede: true, solido: false, desenhar: provisorio(2, 2, 0, '#c9a6ff') });
  I.objeto('casa-movel-cesta-paes', { w: 1, h: 1, topo: 4, solido: true, desenhar: provisorio(1, 1, 4, '#ffc94d') });
  I.objeto('casa-movel-filtro', { w: 1, h: 1, topo: 14, solido: true, desenhar: provisorio(1, 1, 14, '#ffc94d') });
  I.objeto('casa-movel-panelas', { w: 2, h: 2, parede: true, solido: false, desenhar: provisorio(2, 2, 0, '#c9a6ff') });
})();
