/* Cartas do Livro de Atividades, Capítulo 10 "Conhecendo as plantas" (pp. 1 a 4), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). As páginas são só de questões: carta curta com o título da seção e o que
   ela pede; as fotos e o esquema viram figuras e texto curto. */
(function () {
  var L = 'atividades', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var TITULO = 'As plantas precisam de água e luz do sol';
  Reino.registrarCartas('ciencias4', [
    carta('ci-t01', '🌱', 'Conhecendo as plantas – Capítulo 10', 1, [
      { t: 'texto', texto: TITULO + '. Observe as imagens das plantas 1 e 2.' },
      { t: 'figuras', itens: [
        { img: 'ci:10-vitoria-regia', legenda: '1: um lago coberto de folhas redondas que boiam, com flores lilases.' },
        { img: '🌵', legenda: '2: uma planta de folhas compridas num solo seco e cheio de pedras, com sol forte.' },
      ] },
    ]),
    carta('ci-t02', '☀', TITULO + ' (continuação)', 2, [
      { t: 'texto', texto: 'Do que as plantas precisam para crescer saudáveis? Depois, complete o esquema da fotossíntese.' },
      { t: 'texto', texto: 'No esquema, o sol manda setas amarelas para as folhas. Uma seta azul sai das folhas. Uma seta vermelha entra na folha. No solo, duas setas brancas vão até as raízes, uma da esquerda e outra da direita, perto do rio.' },
    ]),
    carta('ci-t03', '☀', TITULO, 3, [
      { t: 'texto', texto: 'Complete as frases com as palavras do quadro. Depois, desenhe como as plantas podem ajudar os seres vivos.' },
    ]),
    carta('ci-t04', '🌳', TITULO + ' (continuação)', 4, [
      { t: 'texto', texto: 'Ligue as partes das plantas usadas como matéria-prima com os produtos que elas ajudam a fazer.' },
    ]),
  ]);
})();
