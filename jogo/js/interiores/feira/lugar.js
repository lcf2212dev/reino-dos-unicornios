/* Feira de Ciências, parte 5: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira); caminho = tiles da rua até a frente da porta.
   Sem caminho o lugar é recusado; confira com node jogo/ferramentas/validar/validar-interiores.js. */
Reino.registrarLugar({
  id: 'feira', nome: 'Feira de Ciências', sprite: 'feira', placa: 'acima',
  rect: { x: 46, y: 24, w: 7, h: 5 },
  caminho: [[49, 29]],
  novidade: '2026-10-01',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  menu: {
    emoji: '🔬',
    // a linha de baixo no menu Lugares
    info: function () { return 'Cinco salas, bichinhos e descobertas!'; },
  },
});
