/* Cartas do Livro de Atividades, Capítulo 12 "Trabalho e meio ambiente" (pp. 9 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra (o balão da Ane, todo em
   maiúsculas no livro, vem em letra comum); as fotos viram figuras com uma frase curta do que mostram. */
(function () {
  var L = 'atividades', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('historia4', [
    carta('hi-t09', '🌱', 'Impactos do trabalho na natureza', 9, [
      { t: 'texto', texto: 'Marque um X na frase que explica o que são impactos ambientais.' },
      { t: 'texto', texto: 'Algumas atividades causam impacto ambiental positivo e outras causam impacto ambiental negativo. Leia as atividades a seguir e responda se elas têm um impacto positivo ou negativo no ambiente.' },
      { t: 'figuras', itens: [
        { img: '🙂', legenda: 'Impacto ambiental positivo' },
        { img: '🙁', legenda: 'Impacto ambiental negativo' },
      ] },
    ]),
    carta('hi-t10', '🏭', 'Impactos do trabalho na natureza', 10, [
      { t: 'texto', texto: 'Observe as imagens a seguir.' },
      { t: 'figuras', itens: [
        { img: '🏭', legenda: 'Foto 1' },
        { img: '🚲', legenda: 'Foto 2' },
        { img: '🥕', legenda: 'Foto 3' },
        { img: '🗑', legenda: 'Foto 4' },
      ] },
    ]),
    carta('hi-t11', '🐟', 'Trabalhos de preservação da natureza (1 de 2)', 11, [
      { t: 'texto', texto: 'Leia a seguir um texto sobre a pesca em comunidades caiçaras.' },
      { t: 'fala', quem: 'Ane', texto: 'Os caiçaras são pessoas que vivem em pequenas vilas perto do mar e das florestas brasileiras. Eles são conhecidos por viver em harmonia com a natureza. Os caiçaras costumam praticar a pesca artesanal, a agricultura, o extrativismo e o artesanato. Além disso, os conhecimentos deles podem ajudar a cuidar do meio ambiente.' },
    ]),
    carta('hi-t11b', '🐟', 'Trabalhos de preservação da natureza (2 de 2)', 11, [
      { t: 'quadro', texto: '[...] O que é pesca ARTESANAL? É uma pesca bonita, gostosa de ir, em que usamos materiais simples e o conhecimento que aprendemos com nossos avós e bisavós.' },
      { t: 'quadro', texto: '[...] No meio do caminho, a gente põe a rede. É um jeito de pescar muito diferente da pesca industrial, que tem equipamento, sonar, alta tecnologia, e, com isso, mata muito, muito mais peixe, e desequilibra tudo.' },
      { t: 'fonte', texto: 'BORDAS, Marie Ange. Manual da criança caiçara. São Paulo: Peirópolis, 2011. p. 64.' },
    ]),
    carta('hi-t12', '🌳', 'Trabalhos de preservação da natureza', 12, [
      { t: 'texto', texto: 'Em cada quadro abaixo, escreva o nome de uma profissão que ajuda a cuidar do meio ambiente.' },
      { t: 'texto', texto: 'Depois, faça um desenho que represente cada uma delas.' },
    ]),
  ]);
})();
