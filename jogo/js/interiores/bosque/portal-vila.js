/* Bosque dos Fantasmas: o portal para a Vila Arco-Íris (docs/contratos/vila.md), objeto 'bosque-portal-vila' (1 × 1,
   não sólido, não interativo: pisou, viaja pela escada `sentido: 'portal'` que bosque.js põe no mesmo tile).
   O desenho é o Reino.Portal (arte/portal.js) com as cores do arco-íris; o brilho (anim) só com Animações.
   Guarda as cores em Reino._predios.bosque.CORES_VILA: o portal de volta, na Vila, usa as mesmas (vila/objetos.js).
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino, I = R.Interiores;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};
  B.CORES_VILA = { aro: '#ffd23f', aroLuz: '#fff3a8', aroSombra: '#e0952a', fundo: '#3f6fd8', braco: '#ff6b9a',
    ponto: '#8af0a0', miolo: '#e8d6ff', halo: [255, 214, 240], luz: [255, 250, 220],
    pulso: ['#ffffff', '#fff3a8', '#ffc8e6', '#c8f0ff'], faisca: ['#ff6b6b', '#ffd23f', '#7ee08a', '#7ec8ff'],
    anel: ['#ff5c6a', '#ffb43f', '#6fdc8c', '#7ec8ff'] };
  var portal = R.Portal.criar(B.CORES_VILA);
  I.objeto('bosque-portal-vila', { w: 1, h: 1, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) { portal.desenhar(ctx, px, py); },
    anim: function (ctx, px, py, t) { portal.animar(ctx, px, py, 16, 16, t); } });
})();
