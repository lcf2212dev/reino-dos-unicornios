/* Vulcão dos Dragõezinhos, parte final: o portal no mapa (Reino.Portal, arte/portal.js: o portal do Bosque com o
   redemoinho vermelho-lava) e o lugar (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md). rect 1×1 =
   o próprio tile do portal, na mata da borda leste, no fim da avenida de cima (a porta é o tile); caminho = o tile
   entre a ponta da avenida e o portal. Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1.
   Sem trava de nível: o menu mostra o nível recomendado (config.arenas.vulcao.nivel). Carrega sozinho (o validador
   de lugares só carrega config, registros e os lugar.js): sem Portal, só o registrarLugar. */
if (Reino.Portal) Reino.Portal.registrar('portal-vulcao', { aro: '#ff6a3d', aroLuz: '#ffd0b8', aroSombra: '#c83a1a', fundo: '#5a1010', braco: '#ffd34d', ponto: '#fff1a0', miolo: '#ffe0b0', halo: [255, 190, 150], luz: [255, 240, 220], pulso: ['#ffffff', '#fff1a0', '#ffd0b8', '#fff1a0'], faisca: ['#ffffff', '#ffd34d', '#ff8a3d', '#ff5c4a'] });
Reino.registrarLugar({
  id: 'vulcao', nome: 'Vulcão dos Dragõezinhos', sprite: 'portal-vulcao',
  rect: { x: 53, y: 10, w: 1, h: 1 },
  caminho: [[53, 11]],
  novidade: { desde: '2026-11-06', interior: 'vulcao' },
  menu: {
    emoji: '🐉',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.vulcao.nivel; },
  },
});
