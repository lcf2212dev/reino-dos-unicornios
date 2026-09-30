/* Laboratório de Química, parte 5: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira); caminho = tiles da rua até a frente da porta.
   Sem caminho o lugar é recusado; confira com node jogo/ferramentas/validar/validar-interiores.js. */
Reino.registrarLugar({
  id: 'quimica', nome: 'Laboratório de Química', sprite: 'quimica', placa: 'acima',
  rect: { x: 37, y: 24, w: 5, h: 5 },
  caminho: [[39, 29]],
  novidade: '2026-09-30',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  menu: {
    emoji: '🧪',
    // a linha de baixo no menu Lugares
    info: function () { return 'Misturas, microscópio e átomos'; },
  },
});
