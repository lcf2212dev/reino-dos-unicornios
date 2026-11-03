/* Cartas do Livro de Aprendizagem, Capítulo 12 "Transformação das paisagens" (pp. 22 a 32), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas seguidas.
   As fotos que importam para responder viram ícones (icones-12.js) com a legenda do livro; foto sem legenda ganha
   uma descrição curta. Os avisos de QR code (pp. 22 e 29) ficam de fora: no jogo não há vídeo para acessar. */
(function () {
  var L = 'aprendizagem', C = 12;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  var TESTANDO = 'Testando as ideias';
  Reino.registrarCartas('geografia4', [
    // abertura e Conversa vai / vem (pp. 22 e 23)
    carta('ge-a22', '🚗', 'Transformação das paisagens – Capítulo 12', 22, [
      { t: 'figuras', itens: [
        { img: 'ge:12-avenida-antiga', legenda: 'A: Vista de parte da Avenida Tiradentes, na cidade de São Paulo, em São Paulo, em 1910.' },
        { img: 'ge:12-avenida-hoje', legenda: 'B: Vista de parte da Avenida Tiradentes, na cidade de São Paulo, em São Paulo, em 2022.' },
      ] },
      { t: 'texto', texto: 'Na foto A, em preto e branco, a avenida é de terra, com fileiras de árvores e poucas construções baixas. Na foto B, colorida, a avenida está cheia de carros, com prédios altos dos dois lados.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Que lugar as imagens mostram?' },
        { texto: 'De quando são as imagens?' },
        { texto: 'Quais diferenças é possível perceber entre as duas fotografias?' },
      ] },
    ]),
    carta('ge-a23', '💬', 'Conversa vem...', 23, [
      { t: 'quadro', titulo: 'Conversa vem...', texto: 'As imagens A e B revelam transformações que ocorreram na paisagem da Avenida Tiradentes, em São Paulo, ao longo de 112 anos. Em sua opinião, por que essas transformações ocorreram?' },
      { t: 'texto', texto: 'Observe novamente as imagens. Depois, responda aos itens.' },
      { t: 'texto', texto: 'As paisagens estão em constante transformação por causa das ações humanas. Entretanto, elas também podem ser modificadas pelos elementos da natureza.' },
      { t: 'texto', texto: 'Você já reparou em alguma mudança causada pela natureza no local em que você mora ou estuda? Compartilhe sua experiência com a turma.' },
    ], ['APR-23-qA', 'APR-23-qE']),

    // a natureza transforma as paisagens (pp. 24 e 25)
    carta('ge-a24', '💨', 'A natureza transforma as paisagens (1 de 2)', 24, [
      { t: 'texto', texto: 'Em todo o planeta, a natureza está em constante movimento. Os elementos naturais transformam as paisagens por meio dos seguintes fenômenos: ventos, chuvas, rios, mares, calor do sol e atividade vulcânica.' },
      { t: 'figuras', itens: [
        { img: '💨', legenda: 'ventos' }, { img: '🌧', legenda: 'chuvas' }, { img: '🏞', legenda: 'rios' },
        { img: '🌊', legenda: 'mares' }, { img: '☀', legenda: 'calor do sol' }, { img: '🌋', legenda: 'atividade vulcânica' },
      ] },
      { t: 'texto', texto: 'A maior parte das transformações nas paisagens causadas pelos elementos da natureza ocorre de forma muito mais lenta quando comparada às alterações realizadas pelos seres humanos.' },
    ]),
    carta('ge-a24b', '🪨', 'A natureza transforma as paisagens (2 de 2)', 24, [
      { t: 'texto', texto: 'Veja as imagens a seguir.' },
      { t: 'lista', itens: [
        { termo: 'Foto 1', texto: 'Vista de parte do Parque Nacional do Catimbau, em Pernambuco. Esse parque é conhecido por apresentar rochas de diferentes formatos, originados pela ação dos ventos ao longo de milhares de anos.' },
        { termo: 'Foto 2', texto: 'Vista da Pedra da Galinha Choca, em Quixadá, no Ceará. O nome se deve ao seu formato curioso, que foi modificado pela ação da chuva e dos ventos ao longo de muitos anos.' },
      ] },
    ]),
    carta('ge-a25', '🔎', 'Para saber mais (1 de 2)', 25, [
      { t: 'fala', quem: 'Menino', texto: 'Você já ouviu alguém dizer o ditado popular “Água mole em pedra dura tanto bate até que fura”?' },
      { t: 'texto', texto: 'Ele se refere ao modo como a água, mesmo sendo “mole”, pode alterar o formato de formações rochosas grandes, como montanhas, ainda que esse processo leve muito tempo.' },
    ]),
    carta('ge-a25b', '🌊', 'Para saber mais (2 de 2)', 25, [
      { t: 'lista', itens: [
        { termo: 'Foto', texto: 'Vista da Gruta das Encantadas, em Paranaguá, no Paraná. As ondas do mar batem nas rochas há muitos e muitos anos, e formaram uma abertura chamada de gruta. Na imagem, é possível ver pessoas entrando nessa gruta.' },
      ] },
      { t: 'texto', texto: 'A natureza pode transformar as paisagens de modo lento, pela ação do vento e das águas. Mas alguns fenômenos naturais são capazes de transformar a paisagem de maneira muito rápida, como por meio de chuvas intensas que provocam enchentes.' },
    ]),

    // as atividades humanas transformam as paisagens (p. 26)
    carta('ge-a26', '🏠', 'As atividades humanas transformam as paisagens (1 de 2)', 26, [
      { t: 'texto', texto: 'Algumas mudanças causadas pela natureza podem levar mais tempo para acontecer. Já as mudanças feitas pelas atividades humanas acontecem de modo mais rápido.' },
      { t: 'texto', texto: 'As pessoas transformam as paisagens para viverem melhor, construindo casas, escolas, ruas e parques.' },
      { t: 'texto', texto: 'A cidade do Rio de Janeiro, por exemplo, mudou muito de 1816 até 2024. Em 208 anos, foram construídas muitas ruas e diversos prédios, até mesmo perto das montanhas do Pão de Açúcar.' },
    ]),
    carta('ge-a26b', '🌇', 'As atividades humanas transformam as paisagens (2 de 2)', 26, [
      { t: 'lista', itens: [
        { termo: 'Pintura de 1816', texto: 'casas baixas, a baía e o Pão de Açúcar ao fundo.' },
        { termo: 'Foto de 2024', texto: 'Vista da Baía de Guanabara, com destaque para o Pão de Açúcar, na cidade do Rio de Janeiro, em 2024.' },
      ] },
      { t: 'quadro', texto: 'Formação de rochas nomeada como Pão de Açúcar, na cidade do Rio de Janeiro, no estado do Rio de Janeiro.' },
      { t: 'fonte', texto: 'TAUNAY, Nicolas Antoine. Entrada da baía e da cidade do Rio a partir do terraço do convento de Santo Antônio em 1816. 1 óleo sobre tela, 45 x 56,5 cm. Museu Nacional de Belas Artes, Rio de Janeiro.' },
    ]),

    // Organizando o conhecimento (pp. 27 e 28)
    carta('ge-a27', '✏', ORGANIZANDO, 27, [
      { t: 'texto', texto: 'Observe o processo ilustrado a seguir.' },
      { t: 'figuras', itens: [
        { img: 'ge:12-rocha-1', legenda: '1: o paredão de rocha inteiro, na beira do mar.' },
        { img: 'ge:12-rocha-2', legenda: '2: o mar começa a cavar a base da rocha.' },
        { img: 'ge:12-rocha-3', legenda: '3: forma-se um arco na rocha.' },
        { img: 'ge:12-rocha-4', legenda: '4: o arco cai e sobra uma coluna de pedra.' },
      ] },
    ]),
    carta('ge-a28', '📷', ORGANIZANDO, 28, [
      { t: 'texto', texto: 'Observe as imagens a seguir. Depois, resolva os itens.' },
      { t: 'lista', itens: [
        { termo: 'Imagem 1', texto: 'Construção de moradias e ruas, Gália, São Paulo.' },
        { termo: 'Imagem 2', texto: 'Paredão de rochas chamado de Pedra Furada. Parque Nacional da Serra da Capivara, Piauí.' },
      ] },
      { t: 'texto', texto: 'Na imagem 1, um terreno de terra vermelha com ruas abertas e casas em construção. Na imagem 2, um paredão de rocha com um grande buraco redondo.' },
    ]),

    // impactos ambientais nas paisagens (p. 29)
    carta('ge-a29', '💧', 'Impactos ambientais nas paisagens (1 de 3)', 29, [
      { t: 'texto', texto: 'As ações humanas transformam a natureza para atender a necessidades das pessoas. No entanto, em alguns casos, elas podem prejudicar o ambiente e as pessoas.' },
      { t: 'texto', texto: 'Um exemplo de ação humana que impacta os rios é a poluição por lixo e esgoto doméstico. Leia as consequências desse problema e os cuidados que devem ser tomados.' },
      { t: 'figuras', itens: [{ img: 'ge:12-rio-sujo', legenda: 'Cidade do Rio de Janeiro, no estado do Rio de Janeiro.' }] },
    ]),
    carta('ge-a29b', '💧', 'Impactos ambientais nas paisagens (2 de 3)', 29, [
      { t: 'lista', itens: [
        { termo: '1', texto: 'A contaminação do rio deve ser evitada com a destinação correta do lixo e a coleta e o tratamento do esgoto.' },
        { termo: '2', texto: 'A poluição do rio gera mau cheiro e atrai insetos e roedores, que podem transmitir doenças aos seres humanos.' },
        { termo: '3', texto: 'A vegetação próxima aos rios deve ser sempre preservada, pois ajuda a proteger os rios.' },
        { termo: '4', texto: 'A poluição prejudica a vida aquática do rio.' },
        { termo: '5', texto: 'A poluição do rio prejudica o solo.' },
      ] },
    ]),
    carta('ge-a29c', '🗑', 'Impactos ambientais nas paisagens (3 de 3)', 29, [
      { t: 'texto', texto: 'Uma forma de evitar a poluição dos rios é descartar de maneira correta os resíduos sólidos que produzimos no nosso dia a dia. Se jogarmos o lixo no chão, ele pode ser levado pela chuva até os bueiros e alcançar os rios. Por isso, é importante jogar o lixo sempre na lixeira certa e separar os materiais que podem ser reciclados.' },
      { t: 'quadro', titulo: 'Glossário', itens: [
        { termo: 'resíduos sólidos', texto: 'materiais originados de atividades do cotidiano, como embalagens, papéis, garrafas plásticas e restos de comida.' },
      ] },
    ]),

    // Saberes em ação e Testando as ideias (pp. 30 a 32)
    carta('ge-a30', '🌳', 'Saberes em ação', 30, [
      { t: 'texto', texto: 'As paisagens são transformadas ao longo do tempo, seja pela ação dos elementos da natureza ou pela ação dos seres humanos.' },
      { t: 'texto', texto: 'Agora, com a orientação do professor, observe a paisagem da rua em que a sua escola está localizada. Depois, resolva os itens.' },
      { t: 'figuras', itens: [{ img: '🌳', legenda: 'Elementos da natureza' }, { img: '🏠', legenda: 'Elementos culturais' }] },
      { t: 'quadro', titulo: 'Exemplos', itens: [
        { texto: 'A quantidade de casas e prédios na rua vai aumentar.' },
        { texto: 'A escola será reformada.' },
        { texto: 'As árvores da praça vão continuar a existir.' },
      ] },
    ]),
    carta('ge-a31', '❓', TESTANDO, 31, [
      { t: 'texto', texto: 'Marque um X na imagem que mostra uma alteração na paisagem feita pela ação humana. Em seguida, escreva qual foi essa alteração.' },
      { t: 'figuras', itens: [
        { img: '🌳', legenda: 'Foto da esquerda: mata fechada, com árvores e capim.' },
        { img: 'ge:12-ponte', legenda: 'Foto da direita: rio largo com uma ponte e duas torres ao fundo.' },
      ] },
      { t: 'texto', texto: 'Preservar a natureza é importante para não perdermos recursos naturais de que precisamos.' },
    ]),
    carta('ge-a32', '🏞', TESTANDO, 32, [
      { t: 'texto', texto: 'Marque um X na imagem que mostra uma paisagem natural bem conservada.' },
      { t: 'figuras', itens: [
        { img: 'ge:12-estrada-serra', legenda: 'Foto da esquerda: serra com mata e uma estrada cheia de curvas.' },
        { img: '🏞', legenda: 'Foto da direita: rio largo cercado por floresta, sem construções.' },
      ] },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer como a natureza pode transformar as paisagens.' },
        { texto: 'Reconhecer como as ações humanas podem transformar as paisagens.' },
        { texto: 'Identificar os elementos da paisagem que mostram mudanças feitas pela natureza ou pelas pessoas.' },
        { texto: 'Entender como as ações humanas podem prejudicar a natureza.' },
        { texto: 'Compreender a importância do cuidado com a natureza.' },
      ] },
    ]),
  ]);
})();
