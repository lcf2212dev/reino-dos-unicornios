/* Bosque dos Fantasmas: o portal para a Vila Arco-Íris (docs/contratos/vila.md), objeto 'bosque-portal-vila' (2 × 3,
   não sólido, não interativo: pisou, viaja pela escada `sentido: 'portal'` que bosque.js põe no meio dele). Colado na
   borda direita do Bosque: o redemoinho de todo portal (Reino.Portal.vortice, arte/portal.js) com a espiral azul e,
   animado, a coluna de luz. Guarda as cores em Reino._predios.bosque.CORES_VILA: o portal de volta, na Vila, usa as
   mesmas (vila/objetos.js). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores, P = R.Portal;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  B.CORES_VILA = { tons: P.AZUL };
  I.objeto('bosque-portal-vila', { w: 2, h: 3, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) { P.vortice(ctx, px + 16, py + 36, P.AZUL, 0); },
    anim: function (ctx, px, py, t) { P.vortice(ctx, px + 16, py + 36, P.AZUL, Math.floor(t / 160) % 6); P.brilho(ctx, px + 16, py + 36, t); } });
})();
