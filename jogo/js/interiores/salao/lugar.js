/* Salão de Beleza, parte 5: o lugar no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7).
   rect em tiles (a porta fica no meio da última fileira); caminho = tiles da rua até a frente da porta.
   Sem caminho o lugar é recusado; confira com node jogo/ferramentas/validar/validar-interiores.js. */
Reino.registrarLugar({
  id: 'salao', nome: 'Salão de Beleza', sprite: 'salao', placa: 'acima',
  // o terreno reservado para o salão no mapa (mundo/lugares.js): à esquerda e embaixo da praça, porta na Avenida do Lago
  rect: { x: 13, y: 24, w: 6, h: 5 },
  caminho: [[16, 29]],
  novidade: '2026-09-27',   // selo "✨ Novo!" no menu Lugares até ela entrar (ou config.novidadeDias dias)
  menu: {
    emoji: '✂',
    // a linha de baixo no menu Lugares
    info: function () { return 'Cortes de cabelo e roupas'; },
  },
});
