/* Cartas do Livro de Aprendizagem, Capítulo 10 "Matérias-primas: de onde vêm?" (sumário e pp. 3 a 11), na ordem das
   páginas (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas
   seguidas. As fotos e ilustrações que importam para responder viram `figuras` (icones-10.js) ou a legenda do livro.
   Página só de questões: carta curta com o título da seção e o que ela mostra. */
(function () {
  var L = 'aprendizagem', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('geografia4', [
    // sumário (sem número) e abertura: Conversa vai / vem (pp. 3 e 4)
    carta('ge-a00', '📚', 'Sumário', 0, [
      { t: 'tabela', cab: ['Capítulo', 'Página'], linhas: [
        ['Capítulo 10 – Matérias-primas: de onde vêm?', '3'],
        ['Capítulo 11 – Paisagem: retrato de um lugar', '12'],
        ['Capítulo 12 – Transformação das paisagens', '22'],
      ] },
    ]),
    carta('ge-a03', '✈️', 'Matérias-primas: de onde vêm? – Capítulo 10', 3, [
      { t: 'texto', texto: 'Na imagem, duas crianças brincam numa sala. A menina segura um avião de brinquedo e tem à frente blocos de montar coloridos. O menino desenha com um lápis numa folha de papel.' },
      { t: 'figuras', itens: [
        { img: 'ge:10-aviao', legenda: 'avião de brinquedo' }, { img: 'ge:10-blocos', legenda: 'blocos de montar' },
        { img: '✏️', legenda: 'lápis' }, { img: '📄', legenda: 'folha de papel' },
      ] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Quais objetos fazem parte da brincadeira das crianças da imagem?' },
        { texto: 'Os objetos presentes na imagem não são todos iguais. O que há de diferente entre eles?' },
      ] },
    ]),
    carta('ge-a04', '💬', 'Conversa vem...', 4, [
      { t: 'texto', texto: 'Você já reparou nas características dos objetos que são usados no dia a dia das pessoas? Alguns são leves, outros são mais pesados. Há objetos coloridos, brilhantes ou até transparentes. Eles podem ser grandes ou pequenos, entre outros.' },
      { t: 'texto', texto: 'Cada objeto pode ter características diferentes, pois é feito com um tipo específico de material.' },
    ]),

    // o que são matérias-primas (p. 5)
    carta('ge-a05', '✏️', 'O que são matérias-primas? (1 de 3)', 5, [
      { t: 'texto', texto: 'A maior parte dos objetos utilizados pelas pessoas, como brinquedos, móveis, roupas ou livros, precisam ser planejados e passar por transformações em fábricas, oficinas ou outros locais de produção até assumirem a forma que conhecemos.' },
      { t: 'texto', texto: 'Para fabricar esses objetos, é necessário utilizar materiais que vêm da natureza. Esses materiais recebem o nome de matérias-primas.' },
      { t: 'quadro', texto: 'As matérias-primas são os materiais usados para fazer ou fabricar um produto.' },
      { t: 'texto', texto: 'Um lápis de escrever, por exemplo, pode ter diferentes partes, e cada uma delas é feita com um tipo de matéria-prima. Confira no exemplo a seguir.' },
    ]),
    carta('ge-a05b', '✏️', 'O que são matérias-primas? (2 de 3)', 5, [
      { t: 'lista', itens: [
        { texto: 'A parte do lápis que permite desenhar ou escrever é feita com uma matéria-prima chamada de grafite. Essa matéria-prima é retirada de alguns tipos de rochas que são encontradas na natureza.' },
        { texto: 'Uma pequena parte de metal é usada para prender a borracha ao corpo do lápis. Um dos metais usados nessa parte é o alumínio, matéria-prima que pode ser obtida a partir de rochas encontradas na natureza.' },
      ] },
    ]),
    carta('ge-a05c', '✏️', 'O que são matérias-primas? (3 de 3)', 5, [
      { t: 'lista', itens: [
        { texto: 'Para a parte externa do lápis, a matéria-prima utilizada é a madeira, retirada das árvores, que protege o grafite e permite segurar melhor o objeto.' },
        { texto: 'A borracha pode ser feita a partir de uma matéria-prima chamada de látex, que é retirada de alguns tipos de árvores.' },
      ] },
      { t: 'figuras', itens: [{ img: '✏️', legenda: 'lápis' }, { img: '🪵', legenda: 'madeira' }, { img: '🪨', legenda: 'grafite' }] },
    ]),

    // extrativismo (p. 6)
    carta('ge-a06', '🌳', 'Extrativismo (1 de 3)', 6, [
      { t: 'texto', texto: 'Depois de entender o que são matérias-primas, é importante observar como elas são obtidas. Muitas matérias-primas usadas na fabricação de objetos, alimentos e roupas precisam ser retiradas da natureza. Depois, elas são transformadas em produtos. A retirada de matérias-primas da natureza acontece por meio de atividades chamadas de extrativismo.' },
      { t: 'quadro', texto: 'Extrativismo é o conjunto de ações que retira da natureza matérias-primas para serem usadas na produção de diferentes produtos.' },
      { t: 'texto', texto: 'Existem diferentes formas de extrativismo. Cada forma depende do tipo de matéria-prima que é retirada da natureza. Leia os exemplos a seguir.' },
    ]),
    carta('ge-a06b', '🌳', 'Extrativismo (2 de 3)', 6, [
      { t: 'quadro', texto: 'Quando a matéria-prima vem das plantas ou das árvores, como a madeira, os frutos ou as sementes, isso é chamado de extrativismo vegetal.' },
      { t: 'texto', texto: 'Extrativismo vegetal de látex, retirado do tronco da árvore seringueira. Município de Itabela, Bahia.' },
      { t: 'quadro', texto: 'Quando são obtidas matérias-primas de origem animal, por meio de atividades como a pesca, trata-se de extrativismo animal.' },
      { t: 'texto', texto: 'A retirada do mel de abelhas em seu ambiente natural é um exemplo de extrativismo animal. Na imagem, abelhas silvestres no município de Ubajara, Ceará.' },
      { t: 'figuras', itens: [{ img: '🌳', legenda: 'seringueira' }, { img: '🐝', legenda: 'abelhas' }] },
    ]),
    carta('ge-a06c', '🪨', 'Extrativismo (3 de 3)', 6, [
      { t: 'quadro', texto: 'A retirada de matérias-primas das rochas e do solo, como o grafite e o ferro, é chamada de extrativismo mineral.' },
      { t: 'texto', texto: 'Extrativismo mineral de sal no município de Macau, Rio Grande do Norte.' },
      { t: 'figuras', itens: [{ img: '🪨', legenda: 'rochas' }, { img: '🧂', legenda: 'sal' }] },
    ]),

    // de onde vem a folha de papel (p. 7)
    carta('ge-a07', '📄', 'De onde vem a folha de papel? (1 de 2)', 7, [
      { t: 'texto', texto: 'A madeira, por exemplo, é um recurso que pode ser extraído da natureza. É dela que se obtém a celulose, uma substância que serve como matéria-prima principal na fabricação de papel. Observe as etapas de produção desse produto a seguir.' },
      { t: 'lista', itens: [
        { termo: '1.', texto: 'As árvores produzem celulose, que é a substância usada para fazer papel.' },
        { termo: '2.', texto: 'As árvores são cortadas para que a madeira possa ser transportada e usada na produção do papel.' },
        { termo: '3.', texto: 'Já na fábrica, a madeira é triturada, ou seja, quebrada em pedaços pequenos.' },
        { termo: '4.', texto: 'A madeira triturada é transformada em uma pasta chamada polpa de celulose.' },
      ] },
    ]),
    carta('ge-a07b', '📄', 'De onde vem a folha de papel? (2 de 2)', 7, [
      { t: 'lista', itens: [
        { termo: '5.', texto: 'A polpa é lavada para não apresentar sujeiras.' },
        { termo: '6.', texto: 'Depois, a polpa é clareada para que o papel fique branco.' },
        { termo: '7.', texto: 'Na sequência, ela é colocada sobre uma tela para que a folha de papel ganhe forma.' },
        { termo: '8.', texto: 'A folha de papel é prensada e seca para ficar lisa.' },
        { termo: '9.', texto: 'Na sequência, as folhas de papel são cortadas e embaladas para serem comercializadas.' },
      ] },
      { t: 'figuras', itens: [{ img: '🌳', legenda: 'árvore' }, { img: '🪵', legenda: 'madeira' }, { img: '📄', legenda: 'papel' }] },
    ]),

    // Organizando o conhecimento, Saberes em ação (pp. 8 e 9)
    carta('ge-a08', '📝', 'Organizando o conhecimento', 8, [
      { t: 'texto', texto: 'Observe as imagens e classifique-as de acordo com a origem de cada matéria-prima.' },
      { t: 'lista', itens: [
        { texto: 'Amostra de grafite em estado bruto, ou seja, antes de passar por processos de transformação.' },
        { texto: 'Pescador retirando peixe de rede de pesca. Município de Laguna, Santa Catarina.' },
        { texto: 'Toras de madeira extraídas de área de floresta. Município de Faro, Pará.' },
        { texto: 'Frutos de açaí recém-coletados, Ilha de Marajó, Pará.' },
      ] },
      { t: 'figuras', itens: [
        { img: '🪨', legenda: 'grafite' }, { img: '🐟', legenda: 'peixe' },
        { img: '🪵', legenda: 'toras de madeira' }, { img: 'ge:10-acai', legenda: 'açaí' },
      ] },
    ]),
    carta('ge-a09', '🔎', 'Saberes em ação', 9, [
      { t: 'texto', texto: 'A natureza tem recursos naturais que podem ser utilizados de diferentes maneiras, inclusive como matéria-prima para a construção de ruas, pontes e casas. Esses recursos também são usados na fabricação de diversos produtos, como este livro.' },
    ]),

    // Testando as ideias e Agora você já sabe (pp. 10 e 11)
    carta('ge-a10', '⛏️', 'Testando as ideias', 10, [
      { t: 'texto', texto: 'Observe as imagens a seguir. Depois, resolva os itens.' },
      { t: 'lista', itens: [
        { termo: 'Imagem 1', texto: 'Área de extração de minério de ferro. Município de Parauapebas, Pará.' },
        { termo: 'Imagem 2', texto: 'Uso de ferro na construção de um edifício na cidade de São Paulo, em São Paulo.' },
      ] },
      { t: 'figuras', itens: [{ img: '⛏️', legenda: 'extração de minério' }, { img: '🔩', legenda: 'ferro' }] },
    ]),
    carta('ge-a11', '📖', 'Testando as ideias e Agora você já sabe...', 11, [
      { t: 'texto', texto: 'Analise as imagens a seguir. Depois, use as palavras-chave para indicar a principal matéria-prima usada na produção de cada objeto.' },
      { t: 'quadro', titulo: 'Palavras-chave', texto: 'madeira – látex – celulose' },
      { t: 'figuras', itens: [
        { img: '📄', legenda: 'folha de papel' }, { img: 'ge:10-cadeira', legenda: 'cadeira' },
        { img: 'ge:10-borracha', legenda: 'borracha escolar' },
      ] },
    ]),
  ]);
})();
