/* Cartas do Livro de Atividades, Capítulo 10 "Matérias-primas: de onde vêm?" (pp. 1 a 4), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra. A foto em grade da p. 2 vira uma
   tabela com o que aparece em cada espaço (é o que a questão pede para observar). */
(function () {
  var L = 'atividades', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('geografia4', [
    carta('ge-t01', '☁️', 'O que são matérias-primas?', 1, [
      { t: 'texto', texto: 'Complete a cruzadinha a seguir com os elementos e fenômenos da natureza.' },
      { t: 'figuras', itens: [
        { img: '☁️', legenda: 'nuvem' }, { img: '🌬️', legenda: 'vento' }, { img: 'ge:10-rio', legenda: 'rio' },
        { img: '🌳', legenda: 'árvore' }, { img: '⛰️', legenda: 'montanhas' },
      ] },
    ]),
    carta('ge-t02', '🏞️', 'Trecho do Rio Doce', 2, [
      { t: 'texto', texto: 'Analise a imagem a seguir, que mostra parte do município de Governador Valadares, em Minas Gerais.' },
      { t: 'tabela', cab: ['', '1', '2', '3', '4'], linhas: [
        ['A', 'montanha alta', 'montanha alta', 'céu', 'céu e serras'],
        ['B', 'morro com mata', 'morro com mata', 'começo do rio', 'rio e cidade'],
        ['C', 'rio largo', 'rio e casas', 'cidade', 'cidade'],
      ] },
      { t: 'fonte', texto: 'Trecho do Rio Doce em Governador Valadares, Minas Gerais.' },
    ]),
    carta('ge-t03', '📦', 'O que são matérias-primas?', 3, [
      { t: 'lista', itens: [
        { texto: 'O alumínio é um metal retirado de uma rocha chamada bauxita. Ele é usado na fabricação de objetos do dia a dia, como embalagens de bebida.' },
        { texto: 'O látex é um líquido obtido do tronco de uma árvore chamada seringueira. Com ele, é possível produzir um objeto que faz parte do material escolar.' },
        { texto: 'O petróleo é um óleo retirado do subsolo. Ele pode passar por transformações e ser usado para fazer embalagens, objetos de plástico e partes de brinquedos.' },
        { texto: 'O algodão é uma planta. Depois de colhido e processado em fábricas, ele pode ser transformado em tecido.' },
      ] },
    ]),
    carta('ge-t04', '🧂', 'Extração de sal', 4, [
      { t: 'figuras', itens: [{ img: '🧂', legenda: 'sal' }] },
      { t: 'texto', texto: 'Área de extração de sal marinho em Macau, no Rio Grande do Norte.' },
    ]),
  ]);
})();
