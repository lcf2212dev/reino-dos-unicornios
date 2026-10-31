/* Casa do jogador: os móveis avulsos de Sala de Jantar (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   PROVISÓRIO: caixas no lugar do desenho (a frente de arte troca pelo desenho de verdade). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, ret = D.ret;
  var I = R.Interiores;

  function provisorio(w, h, topo, cor) {
    return function (ctx, px, py) { ret(ctx, px + 1, py - topo, w * 16 - 2, h * 16 - 1 + topo, K); ret(ctx, px + 2, py - topo + 1, w * 16 - 4, h * 16 - 3 + topo, cor); };
  }

  I.objeto('casa-movel-aparador', { w: 2, h: 1, topo: 12, solido: true, desenhar: provisorio(2, 1, 12, '#ffc94d') });
  I.objeto('casa-movel-vaso-flores', { w: 1, h: 1, topo: 14, solido: true, desenhar: provisorio(1, 1, 14, '#ffc94d') });
  I.objeto('casa-movel-relogio-pe', { w: 1, h: 1, topo: 24, solido: true, desenhar: provisorio(1, 1, 24, '#ffc94d') });
  I.objeto('casa-movel-jogo-cha', { w: 1, h: 1, topo: 6, solido: true, desenhar: provisorio(1, 1, 6, '#ffc94d') });
  I.objeto('casa-movel-quadro-uvas', { w: 1, h: 2, parede: true, solido: false, desenhar: provisorio(1, 2, 0, '#c9a6ff') });
  I.objeto('casa-movel-banco', { w: 2, h: 1, topo: 4, solido: true, desenhar: provisorio(2, 1, 4, '#ffc94d') });
})();
