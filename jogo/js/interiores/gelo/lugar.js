/* Montanha Gelada: o portal no mapa (Mapa.PREDIOS['portal-gelo'], 1 × 1 tile; docs/contratos/arenas.md).
   O mesmo portal do Bosque (Reino.Portal, arte/portal.js), com o redemoinho azul-gelo; abaixo, o lugar. */
if (Reino.Portal) Reino.Portal.registrar('portal-gelo', {   // sem Portal: o validador de lugares (só o registrarLugar)
  aro: '#8fd8ff', aroLuz: '#e0f6ff', aroSombra: '#5aa8d8', fundo: '#2f5ab0', braco: '#ffffff', ponto: '#d8f0ff',
  miolo: '#f0faff', halo: [196, 232, 255], luz: [240, 250, 255], pulso: ['#ffffff', '#e0f6ff', '#bfe9ff', '#e0f6ff'],
  faisca: ['#ffffff', '#bfe9ff', '#8fd8ff', '#e0f6ff'],
});
/* Montanha Gelada, parte final: o lugar (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md).
   rect 1×1 = o próprio tile do portal, na mata da borda norte, no fim da travessa que sobe entre a História e o Inglês
   (a porta é o tile); caminho = a travessa seguindo para o norte até a frente do portal.
   Livre de verdade: node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu
   mostra o nível recomendado (config.arenas.gelo.nivel). */
Reino.registrarLugar({
  id: 'gelo', nome: 'Montanha Gelada', sprite: 'portal-gelo',
  rect: { x: 11, y: 3, w: 1, h: 1 },
  caminho: [[11, 10], [11, 9], [11, 8], [11, 7], [11, 6], [11, 5], [11, 4]],
  novidade: { desde: '2026-11-06', interior: 'gelo' },
  menu: {
    emoji: '🐧',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.gelo.nivel; },
  },
});
