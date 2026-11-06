/* Pântano das Rãs Resmungonas: o portal no mapa (Mapa.PREDIOS['portal-pantano'], 1 × 1 tile; docs/contratos/arenas.md).
   O mesmo portal do Bosque (Reino.Portal, arte/portal.js), com o redemoinho verde-limão do brejo; abaixo, o lugar. */
if (Reino.Portal) Reino.Portal.registrar('portal-pantano', {   // sem Portal: o validador de lugares (só o registrarLugar)
  aro: '#7ccf5a', aroLuz: '#d4f5b8', aroSombra: '#4f9a3a', fundo: '#2f6b3a', braco: '#c8e86a', ponto: '#eaffb8',
  miolo: '#e0ffc8', halo: [196, 240, 170], luz: [240, 255, 230], pulso: ['#ffffff', '#eaffd8', '#c8f0a8', '#eaffd8'],
  faisca: ['#ffffff', '#ffe066', '#c8e86a', '#8fe0b0'],
});
/* Pântano das Rãs Resmungonas, parte final: o portal no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e
   arenas.md). rect 1×1 = o próprio tile do portal, na mata da borda oeste, no fim da avenida do meio (a porta é o
   tile); caminho = o tile entre a ponta da avenida e o portal. Desenho: Mapa.PREDIOS['portal-pantano'] (fora.js).
   Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu mostra
   o nível recomendado (config.arenas.pantano.nivel). */
Reino.registrarLugar({
  id: 'pantano', nome: 'Pântano das Rãs Resmungonas', sprite: 'portal-pantano',
  rect: { x: 2, y: 20, w: 1, h: 1 },
  caminho: [[2, 21]],
  novidade: { desde: '2026-11-06', interior: 'pantano' },
  menu: {
    emoji: '🐸',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.pantano.nivel; },
  },
});
