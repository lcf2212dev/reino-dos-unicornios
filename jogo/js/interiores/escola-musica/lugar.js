/* Escola de Música, parte 5: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira); caminho = tiles da rua até a frente da porta.
   Sem caminho o lugar é recusado; confira com node jogo/ferramentas/validar/validar-interiores.js. */
Reino.registrarLugar({
  id: 'escola-musica', nome: 'Escola de Música', sprite: 'escola-musica', placa: 'acima',
  rect: { x: 10, y: 7, w: 4, h: 3 },
  caminho: [[12, 10]],
  novidade: '2026-10-02',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  menu: {
    emoji: '🎵',
    // a linha de baixo no menu Lugares
    info: function () { return 'Aulas de teclado e fundamentos musicais'; },
  },
});
