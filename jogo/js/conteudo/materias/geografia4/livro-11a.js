/* Cartas do Livro de Aprendizagem, Capítulo 11 "Paisagem: retrato de um lugar" (pp. 12 a 21), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra ("muito elementos", p. 13, fica como
   está). As fotografias viram figuras com ícones e a legenda do livro. As pp. 17 e 18 não estão no PDF: sem carta. */
(function () {
  var L = 'aprendizagem', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }

  Reino.registrarCartas('geografia4', [
    // abertura e Conversa vai... / Conversa vem... (pp. 12 e 13)
    carta('ge-a12', '🏖️', 'Paisagem: retrato de um lugar – Capítulo 11', 12, [
      { t: 'figuras', itens: [
        { img: '🌊', legenda: 'rio e mar' }, { img: '🏖️', legenda: 'bancos de areia' },
        { img: '🌿', legenda: 'plantas verdes' }, { img: '⛵', legenda: 'barcos na água' },
      ] },
      { t: 'texto', texto: 'Paisagem em Rio do Fogo, Rio Grande do Norte.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Como você descreveria a paisagem para uma pessoa que não está vendo a fotografia?' },
        { texto: 'Na paisagem há mais elementos da natureza ou feitos pelo ser humano?' },
        { texto: 'Quais elementos produzidos pelo ser humano você identifica?' },
      ] },
    ], ['APR-12-qA']),
    carta('ge-a13', '💬', 'Conversa vem...', 13, [
      { t: 'texto', texto: 'O Brasil é um país muito grande e composto de paisagens diversas. Há paisagens formadas principalmente por elementos naturais e paisagens com muito elementos feitos pelo ser humano. Em alguns lugares, a paisagem foi tão alterada pela ação humana que é difícil identificar os elementos da natureza.' },
      { t: 'quadro', itens: [
        { texto: 'Crie uma paisagem composta de elementos criados pelo ser humano. Você pode desenhar elementos maiores (como ruas, calçadas e construções) ou menores (como placas, máquinas e veículos).' },
        { texto: 'Agora, descreva a paisagem que você desenhou.' },
      ] },
    ]),

    // os elementos das paisagens e os sentidos (pp. 14 e 15)
    carta('ge-a14', '👂', 'Os elementos das paisagens (1 de 2)', 14, [
      { t: 'texto', texto: 'Quando você ouve ou lê a palavra paisagem, o que vem à sua mente?' },
      { t: 'quadro', texto: 'Paisagens são compostas de todos os elementos que percebemos no espaço e com os quais interagimos. Esses elementos podem ser naturais ou produzidos pelas pessoas.' },
      { t: 'texto', texto: 'Você sabia que usamos vários sentidos para perceber as paisagens?' },
      { t: 'lista', itens: [
        { termo: 'Visão:', texto: 'permite visualizar elementos naturais, como as árvores e o Sol, e elementos culturais, como os prédios, as casas e as ruas.' },
        { termo: 'Paladar e olfato:', texto: 'nos ajudam a perceber, por exemplo, quando o almoço já está quase pronto. Em diferentes lugares do mundo, há sabores e cheiros diferentes para conhecer.' },
      ] },
    ]),
    carta('ge-a14b', '👂', 'Os elementos das paisagens (2 de 2)', 14, [
      { t: 'lista', itens: [
        { termo: 'Audição:', texto: 'nos ajuda a identificar se um lugar é movimentado ou tranquilo por meio do barulho das pessoas ou do canto dos pássaros.' },
        { termo: 'Tato:', texto: 'permite sentir os objetos com o toque, percebendo a forma, o tamanho e a temperatura deles. Na praia, por exemplo, além de ver e ouvir as ondas, é possível sentir a temperatura da areia e o calor do sol na pele.' },
      ] },
      { t: 'texto', texto: 'Em um dia na praia, podemos ouvir os sons naturais e os produzidos pelos seres humanos. Além disso, podemos perceber o calor do sol e a brisa do mar. Praia de Ipanema, no Rio de Janeiro.' },
    ]),
    carta('ge-a15', '🏞️', 'Paisagens naturais, culturais e mistas', 15, [
      { t: 'texto', texto: 'As paisagens podem ser diferenciadas de acordo com os elementos que encontramos nelas.' },
      { t: 'lista', itens: [
        { termo: 'Paisagens naturais', texto: 'têm muitos elementos que vêm da natureza.' },
        { termo: 'Paisagens culturais', texto: 'têm muitos elementos feitos por atividades humanas.' },
        { termo: 'Paisagens mistas', texto: 'têm uma mistura de elementos da natureza e elementos culturais.' },
      ] },
      { t: 'figuras', itens: [
        { img: '🏖️', legenda: 'Paisagem natural da Praia do Sancho, Fernando de Noronha, Pernambuco.' },
        { img: '🏛️', legenda: 'Paisagem cultural da Praça da Estação, em Belo Horizonte, Minas Gerais.' },
        { img: '⛰️', legenda: 'Paisagem mista de parte da cidade do Rio de Janeiro, no estado do Rio de Janeiro.' },
      ] },
      { t: 'quadro', itens: [
        { texto: 'Use seus sentidos para perceber a paisagem da sala de aula. Depois, com a ajuda dos colegas e do professor, descreva quais elementos fazem parte dessa paisagem.' },
        { texto: 'No seu dia a dia, você costuma encontrar mais paisagens naturais, culturais ou mistas? Converse com o professor e os colegas.' },
      ] },
    ]),

    // diversidade das paisagens brasileiras (pp. 16 e 19; as pp. 17 e 18 faltam no PDF)
    carta('ge-a16', '🌵', 'Diversidade das paisagens brasileiras', 16, [
      { t: 'texto', texto: 'As paisagens brasileiras são muito diversas. Algumas têm rios e lagos, enquanto em outras não existem esses recursos. Há, ainda, paisagens que têm árvores com muitas folhas e outras que têm arbustos ou plantas com espinhos.' },
      { t: 'texto', texto: 'Agora que você já praticou usar seus sentidos para perceber paisagens, observe as fotografias a seguir de paisagens naturais do Brasil.' },
      { t: 'figuras', itens: [
        { img: '🌵', legenda: 'Paisagem natural em Santa Luzia, Paraíba.' },
        { img: '💧', legenda: 'Paisagem natural em Corumbá, Mato Grosso do Sul.' },
      ] },
      { t: 'texto', texto: 'Essas paisagens são compostas de muitos elementos naturais, mas cada uma delas apresenta características próprias.' },
    ]),
    carta('ge-a19', '🏠', 'Paisagens das cidades brasileiras', 19, [
      { t: 'texto', texto: 'Nas cidades brasileiras, também podemos observar a convivência entre a natureza e a ação humana criando paisagens muito diversas. Em algumas cidades, é possível identificar muitos espaços verdes, como gramados, canteiros de árvores e parques. Em outras, é mais comum identificar casas, prédios e outros tipos de construção.' },
      { t: 'texto', texto: 'Repare na diferença entre a quantidade de elementos culturais como ruas, casas e prédios nas cidades brasileiras retratadas a seguir.' },
      { t: 'figuras', itens: [
        { img: '🏛️', legenda: 'Vista panorâmica da cidade de São Paulo, no estado de São Paulo.' },
        { img: '🚗', legenda: 'Paisagem da cidade de Caruaru, em Pernambuco.' },
        { img: '⛪', legenda: 'Paisagem da cidade de Itamogi, em Minas Gerais.' },
      ] },
    ]),

    // Testando as ideias e Agora você já sabe... (pp. 20 e 21)
    carta('ge-a20', '🌊', 'Testando as ideias', 20, [
      { t: 'texto', texto: 'Observe a paisagem na fotografia abaixo. Depois, resolva os itens.' },
      { t: 'figuras', itens: [
        { img: '🌊', legenda: 'cachoeira e rio' }, { img: '🌿', legenda: 'plantas' },
        { img: '🌉', legenda: 'passarela com grade' }, { img: '🚶', legenda: 'pessoas' },
      ] },
      { t: 'texto', texto: 'Cataratas do Iguaçu, em Foz do Iguaçu, no Paraná.' },
    ]),
    carta('ge-a21', '⭐', 'Agora você já sabe...', 21, [
      { t: 'texto', texto: 'Agora, imagine que você está no lugar retratado na fotografia. O que você consegue perceber nessa paisagem por meio: a) da sua audição. b) do seu tato. c) do seu olfato.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer os elementos da paisagem, diferenciando os naturais (criados pela natureza) dos culturais (construídos pela ação humana).' },
        { texto: 'Perceber os elementos das paisagens por meio dos sentidos.' },
        { texto: 'Classificar uma paisagem como natural, cultural ou mista.' },
        { texto: 'Identificar diferentes tipos de paisagens.' },
      ] },
    ]),
  ]);
})();
