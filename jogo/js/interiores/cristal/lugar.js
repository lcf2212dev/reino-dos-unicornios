/* Caverna de Cristal: o portal no mapa (Mapa.PREDIOS['portal-cristal'], 1 × 1 tile; docs/contratos/arenas.md).
   O mesmo portal do Bosque (Reino.Portal, arte/portal.js), com o redemoinho ciano e roxo dos cristais; abaixo, o lugar. */
if (Reino.Portal) Reino.Portal.registrar('portal-cristal', {   // sem Portal: o validador de lugares (só o registrarLugar)
  aro: '#5fe0e8', aroLuz: '#d0fbff', aroSombra: '#2fa8b8', fundo: '#3a1f7a', braco: '#c89cff', ponto: '#eadcff',
  miolo: '#e0f8ff', halo: [180, 240, 255], luz: [235, 250, 255], pulso: ['#ffffff', '#e0f8ff', '#c8f4ff', '#e0f8ff'],
  faisca: ['#ffffff', '#5fe0e8', '#c89cff', '#a66bff'],
});
/* Caverna de Cristal, parte final: o lugar (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e arenas.md).
   rect 1×1 = o próprio tile do portal, na mata da borda oeste, no fim da avenida de baixo (a porta é o tile);
   caminho = o tile entre a ponta da avenida e o portal. Livre de verdade:
   node jogo/ferramentas/validar/lugares-do-mapa.js --livres 1x1. Sem trava de nível: o menu mostra o nível
   recomendado (config.arenas.cristal.nivel). O 💎 já tem desenho (arte/icones/premios.js). */
Reino.registrarLugar({
  id: 'cristal', nome: 'Caverna de Cristal', sprite: 'portal-cristal',
  rect: { x: 2, y: 29, w: 1, h: 1 },
  caminho: [[2, 30]],
  novidade: { desde: '2026-11-06', interior: 'cristal' },
  menu: {
    emoji: '💎',
    info: function () { return 'Nível recomendado: ' + Reino.config.arenas.cristal.nivel; },
  },
});
