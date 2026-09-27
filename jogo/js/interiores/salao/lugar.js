/* Salão de Beleza, parte 5: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira); caminho = tiles da rua até a frente da porta.
   Sem caminho o lugar é recusado; confira com node jogo/ferramentas/validar/validar-interiores.js. */
Reino.registrarLugar({
  id: 'salao', nome: 'Salão de Beleza', sprite: 'salao', placa: 'acima',
  rect: { x: 10, y: 10, w: 5, h: 4 },
  caminho: [[14, 14], [13, 14], [12, 14]],
  novidade: '2026-09-27',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  menu: {
    emoji: '✂',
    // a linha de baixo no menu Lugares
    info: function () { return 'Cortes de cabelo e roupas'; },
  },
});
