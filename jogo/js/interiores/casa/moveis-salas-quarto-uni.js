/* Casa do jogador: os móveis avulsos de Quarto do unicórnio (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   PROVISÓRIO: caixas no lugar do desenho (a frente de arte troca pelo desenho de verdade). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, ret = D.ret;
  var I = R.Interiores;

  function provisorio(w, h, topo, cor) {
    return function (ctx, px, py) { ret(ctx, px + 1, py - topo, w * 16 - 2, h * 16 - 1 + topo, K); ret(ctx, px + 2, py - topo + 1, w * 16 - 4, h * 16 - 3 + topo, cor); };
  }

  I.objeto('casa-movel-fontinha', { w: 1, h: 1, topo: 10, solido: true, desenhar: provisorio(1, 1, 10, '#ffc94d') });
  I.objeto('casa-movel-arco-iris', { w: 2, h: 2, parede: true, solido: false, desenhar: provisorio(2, 2, 0, '#c9a6ff') });
  I.objeto('casa-movel-ferradura', { w: 1, h: 2, parede: true, solido: false, desenhar: provisorio(1, 2, 0, '#c9a6ff') });
  I.objeto('casa-movel-luminaria-lua', { w: 1, h: 1, topo: 16, solido: true, desenhar: provisorio(1, 1, 16, '#ffc94d') });
  I.objeto('casa-movel-cesto-macas', { w: 1, h: 1, topo: 4, solido: true, desenhar: provisorio(1, 1, 4, '#ffc94d') });
  I.objeto('casa-movel-cristal', { w: 1, h: 1, topo: 14, solido: true, desenhar: provisorio(1, 1, 14, '#ffc94d') });
})();
