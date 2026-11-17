/* Parquinho, parte final: o portal no mapa (Reino.registrarLugar, docs/contratos/interiores.md §9.7 e
   docs/contratos/parquinho.md). rect 1×1 = o tile do portal, na grama da entrada oeste da praça (onde a Rua da Praça
   encontra o calçamento, entre o poste e o banco); caminho = o tile da rua logo abaixo. Desenho:
   Mapa.PREDIOS['portal-parquinho'] e a camada do portal acordado (parquinho/fora.js).
   `liberado`: só com a fase 1 o portal leva ao parque e aparece no menu Lugares; antes, pisar ou tocar nele abre a
   tela do portal dormindo, com o que falta (menu.abrir → UI.telaParquinho, ui/parquinho.js). */
Reino.registrarLugar({
  id: 'parquinho', nome: 'Parquinho', sprite: 'portal-parquinho',
  rect: { x: 20, y: 20, w: 1, h: 1 },
  caminho: [[20, 21]],
  liberado: function () { return !!(Reino.Parquinho && Reino.Parquinho.liberado()); },
  menu: {
    emoji: '🎠',
    info: function () { return Reino.Parquinho.fase() >= 2 ? 'Todos os brinquedos abertos!' : 'Brinque com o seu unicórnio!'; },
    abrir: function () { return Reino.UI.telaParquinho && Reino.UI.telaParquinho('portal'); },
  },
});
