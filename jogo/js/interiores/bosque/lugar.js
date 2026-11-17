/* Bosque dos Fantasmas, parte final: o portal no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e
   docs/contratos/bosque.md). rect 1×1 = o próprio tile do portal, entre as árvores à direita da Minha Casa (a porta é
   o tile); caminho = as pedras da casa seguindo para leste até a frente do portal. Desenho: Mapa.PREDIOS['portal-bosque']
   (bosque/fora.js). Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1 */
Reino.registrarLugar({
  id: 'bosque', nome: 'Bosque dos Fantasmas', sprite: 'portal-bosque',
  rect: { x: 53, y: 38, w: 1, h: 1 },
  caminho: [[50, 39], [51, 39], [52, 39], [53, 39]],
  // selo "✨ Novo!" no menu Lugares até ela entrar no bosque (ou config.novidadeDias dias)
  novidade: { desde: '2026-11-05', interior: 'bosque' },
  menu: {
    emoji: '👻',
    info: function () { return 'Vença fantasmas e responda!'; },
  },
});
