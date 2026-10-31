/* Casa do jogador: os móveis avulsos de Banheiro (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   PROVISÓRIO: caixas no lugar do desenho (a frente de arte troca pelo desenho de verdade). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, ret = D.ret;
  var I = R.Interiores;

  function provisorio(w, h, topo, cor) {
    return function (ctx, px, py) { ret(ctx, px + 1, py - topo, w * 16 - 2, h * 16 - 1 + topo, K); ret(ctx, px + 2, py - topo + 1, w * 16 - 4, h * 16 - 3 + topo, cor); };
  }

  I.objeto('casa-movel-patinhos', { w: 1, h: 1, topo: 2, solido: true, desenhar: provisorio(1, 1, 2, '#ffc94d') });
  I.objeto('casa-movel-samambaia', { w: 1, h: 1, topo: 12, solido: true, desenhar: provisorio(1, 1, 12, '#ffc94d') });
  I.objeto('casa-movel-toalhas', { w: 1, h: 1, topo: 6, solido: true, desenhar: provisorio(1, 1, 6, '#ffc94d') });
  I.objeto('casa-movel-balanca', { w: 1, h: 1, topo: 0, solido: true, desenhar: provisorio(1, 1, 0, '#ffc94d') });
  I.objeto('casa-movel-quadro-concha', { w: 1, h: 2, parede: true, solido: false, desenhar: provisorio(1, 2, 0, '#c9a6ff') });
  I.objeto('casa-movel-banco-banho', { w: 1, h: 1, topo: 4, solido: true, desenhar: provisorio(1, 1, 4, '#ffc94d') });
})();
