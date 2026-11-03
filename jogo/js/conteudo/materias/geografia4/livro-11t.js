/* Cartas do Livro de Atividades, Capítulo 11 "Paisagem: retrato de um lugar" (pp. 5 a 8), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro; as fotografias viram figuras com ícones e a legenda do
   livro. Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'atividades', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var SECAO = 'Os elementos das paisagens';

  Reino.registrarCartas('geografia4', [
    carta('ge-t05', '🪟', SECAO, 5, [
      { t: 'texto', texto: 'Desenhe a paisagem que você observa de uma das janelas da sua casa.' },
      { t: 'texto', texto: 'Na paisagem que você representou, há mais elementos criados pela natureza ou construídos pela ação humana?' },
      { t: 'texto', texto: 'Com base nessa paisagem, responda às questões a seguir. a) É possível escutar algum som? Qual ou quais? b) É possível sentir algum cheiro? Se sim, descreva-o.' },
    ]),
    carta('ge-t06', '🏞️', SECAO, 6, [
      { t: 'texto', texto: 'Classifique as paisagens a seguir de acordo com a legenda. A) Paisagem natural. B) Paisagem cultural.' },
      { t: 'figuras', itens: [
        { img: '⛰️', legenda: 'Chapada Diamantina, na Bahia.' },
        { img: '🌳', legenda: 'Floresta Amazônica, no Amazonas.' },
        { img: '⛪', legenda: 'Belém, no Pará.' },
        { img: '🏛️', legenda: 'Porto Alegre, no Rio Grande do Sul.' },
      ] },
    ]),
    carta('ge-t07', '🏖️', SECAO, 7, [
      { t: 'texto', texto: 'Observe a imagem a seguir. Depois, resolva os itens.' },
      { t: 'figuras', itens: [
        { img: '🌊', legenda: 'mar' }, { img: '🏖️', legenda: 'areia' }, { img: '🌿', legenda: 'vegetação' },
        { img: '⛰️', legenda: 'morros' }, { img: '🏠', legenda: 'casas, ruas e prédios' },
      ] },
      { t: 'texto', texto: 'Vista de parte da Praia dos Ingleses, em Florianópolis, Santa Catarina.' },
    ]),
    carta('ge-t08', '🐆', SECAO, 8, [
      { t: 'texto', texto: 'Observe as paisagens a seguir, de diferentes locais do Brasil.' },
      { t: 'figuras', itens: [
        { img: '🏖️', legenda: 'A: Litoral de Natal, no Rio Grande do Norte.' },
        { img: '⛪', legenda: 'B: Centro histórico da cidade de Goiás, em Goiás.' },
        { img: '🐆', legenda: 'C: Região do Pantanal em Poconé, no Mato Grosso.' },
      ] },
      { t: 'lista', itens: [
        { termo: 'Na foto A:', texto: 'praia, dunas e plantas, com um quiosque e um carro na areia.' },
        { termo: 'Na foto B:', texto: 'casas de telhado, ruas e uma igreja, com morros verdes ao fundo.' },
        { termo: 'Na foto C:', texto: 'uma onça-pintada na areia, à beira do rio, com mata ao fundo.' },
      ] },
    ]),
  ]);
})();
