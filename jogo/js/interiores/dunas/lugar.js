/* Dunas dos Escorpiões: o portal no mapa (Mapa.PREDIOS['portal-dunas'], 1 × 1 tile; docs/contratos/arenas.md).
   O mesmo portal do Bosque (Reino.Portal, arte/portal.js), com o redemoinho laranja-areia do pôr do sol; abaixo, o lugar. */
if (Reino.Portal) Reino.Portal.registrar('portal-dunas', {   // sem Portal: o validador de lugares (só o registrarLugar)
  aro: '#ffb347', aroLuz: '#ffe4b8', aroSombra: '#d8822a', fundo: '#a8480a', braco: '#ffe066', ponto: '#fff1cc',
  miolo: '#fff4d0', halo: [255, 220, 160], luz: [255, 248, 230], pulso: ['#ffffff', '#fff1cc', '#ffe4b8', '#fff1cc'],
  faisca: ['#ffffff', '#ffe066', '#ffb347', '#4fd0c8'],
});
/* Dunas dos Escorpiões, parte final: o portal no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e
   arenas.md). rect 1×1 = o próprio tile do portal, na mata da borda leste, no fim da avenida do meio (a porta é o
   tile); caminho = o tile entre a ponta da avenida e o portal. Livre de verdade:
   node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu mostra o nível
   recomendado (config.arenas.dunas.nivel). */
Reino.registrarLugar({
  id: 'dunas', nome: 'Dunas dos Escorpiões', sprite: 'portal-dunas',
  rect: { x: 53, y: 20, w: 1, h: 1 },
  caminho: [[53, 21]],
  novidade: { desde: '2026-11-06', interior: 'dunas' },
  menu: {
    emoji: '🏜',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.dunas.nivel; },
  },
});
