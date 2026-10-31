/* Minha Casa, parte final: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira, em (49, 37)); caminho = da ponta da trilha do sul até a porta. */
Reino.registrarLugar({
  id: 'casa', nome: 'Minha Casa', sprite: 'casa', placa: 'acima',
  rect: { x: 46, y: 33, w: 6, h: 5 },
  caminho: [[45, 39], [46, 39], [47, 39], [48, 39], [49, 39], [49, 38]],
  cerca: true,   // cerquinha com portão na frente, como os prédios de hoje (mundo/mapa.js)
  // selo "✨ Novo!" no menu Lugares até ela entrar na casa (ou config.novidadeDias dias)
  novidade: { desde: '2026-10-31', interior: 'casa' },
  menu: {
    emoji: '🏠',
    info: function () { return 'Sua casa para decorar'; },
  },
});
