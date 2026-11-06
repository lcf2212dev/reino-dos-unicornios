/* O portal da Cidade Nova no centro-direita do Bosque dos Fantasmas (docs/contratos/cidade-nova.md):
   um aro arco-íris 2×2 que leva à Cidade Nova. Ação registrada em sistemas/teleportadora.js
   (`portalCidade`); o desenho é o mesmo dos dois lados (arte/teleportadora.js).
   Carrega antes de bosque.js, que o põe entre os objetos fixos. */
(function () {
  var R = window.Reino, I = R.Interiores;
  I.objeto('bosque-portal-cidade', {
    w: 2, h: 2, solido: false, alto: true, topo: 34,
    nome: 'Portal da Cidade Nova',
    acao: { tipo: 'portalCidade', para: 'cidade' },
    desenhar: function (ctx, px, py) { if (R.PortalCidadeArte) R.PortalCidadeArte.desenhar(ctx, px, py); },
  });
})();
