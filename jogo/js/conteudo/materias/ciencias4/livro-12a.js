/* Cartas do Livro de Aprendizagem, Capítulo 12 "As plantas se relacionam" (pp. 24 a 32), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas seguidas.
   Os QR codes vão para a `fonte` (só na tela). Legendas apagadas na foto (panda e beija-flor da p. 26) ficam de fora.
   Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'aprendizagem', C = 12;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  Reino.registrarCartas('ciencias4', [
    // abertura e conversa (pp. 24 e 25)
    carta('ci-a24', '🐝', 'As plantas se relacionam – Capítulo 12', 24, [
      { t: 'texto', texto: 'Na foto, uma abelha voa perto de uma flor branca. Ela tem uma bola laranja na perna e pontinhos amarelos presos ao corpo.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'O que são os pontinhos amarelos presos ao corpo da abelha?' },
        { texto: 'Por que as abelhas pousam nas flores?' },
      ] },
      { t: 'fonte', texto: 'No livro: "Escola digital. Acesse o QR Code e assista à videoaula do capítulo."' },
    ]),
    carta('ci-a25', '💬', 'Conversa vem...', 25, [
      { t: 'texto', texto: 'As plantas e outros seres vivos têm diferentes tipos de relação. As abelhas, por exemplo, buscam alimento nas flores.' },
    ]),

    // plantas, outros seres vivos e o ambiente (pp. 26 e 27)
    carta('ci-a26', '🍯', 'Plantas, outros seres vivos e o ambiente (1 de 2)', 26, [
      { t: 'texto', texto: 'As plantas são importantes fontes de alimento. Muitos seres vivos, incluindo os seres humanos, se alimentam de raízes, caules, folhas, frutos, sementes e até de flores.' },
      { t: 'texto', texto: 'Uma refeição, por exemplo, pode incluir diferentes partes de diversas plantas, como sementes de feijão, folhas de alface, flores de brócolis, raízes de cenoura, caules de cebola e frutos de tomate.' },
      { t: 'texto', texto: 'Também o néctar das flores é fonte de energia para muitos animais, como as abelhas, que se alimentam dele e o utilizam na produção de mel.' },
    ]),
    carta('ci-a26b', '🌸', 'Plantas, outros seres vivos e o ambiente (2 de 2)', 26, [
      { t: 'texto', texto: 'Nessa relação, as plantas fornecem o alimento e, em troca, as abelhas levam o pólen de uma planta para outra, ajudando-as a se reproduzir. Esse processo é chamado de polinização e é muito importante para a produção de novas sementes. Assim, as abelhas são animais polinizadores.' },
      { t: 'texto', texto: 'Outros animais, como borboletas, besouros, joaninhas, pássaros e morcegos, também podem ser polinizadores. Além dos animais, o vento também pode levar o pólen de uma flor para outra.' },
      { t: 'texto', texto: 'Os morcegos que se alimentam de néctar e de pólen também são polinizadores.' },
      { t: 'fonte', texto: 'No livro: "Acesse o QR Code para entender mais sobre o processo de polinização." (Conheça melhor o que é a polinização.)' },
    ]),
    carta('ci-a27', '🌬', 'A dispersão das sementes (1 de 2)', 27, [
      { t: 'texto', texto: 'Depois que a polinização acontece, as sementes e os frutos se formam. Ao consumi-los, os animais espalham as sementes no ambiente, e esse processo é chamado de dispersão. Ao encontrar um ambiente com solo e umidade adequados, as sementes germinam e geram novas plantas.' },
      { t: 'quadro', texto: 'Na dispersão, as sementes são transportadas para germinar em locais afastados da planta que as originou. Isso permite que as plantas cresçam em novos ambientes e forneçam alimento para mais seres vivos.' },
      { t: 'texto', texto: 'A dispersão das sementes pode acontecer de algumas formas. Veja a seguir.' },
    ]),
    carta('ci-a27b', '🌬', 'A dispersão das sementes (2 de 2)', 27, [
      { t: 'lista', itens: [
        { termo: 'Dispersão pelo vento:', texto: 'sementes leves, como as do dente-de-leão, são levadas para longe pelo vento.' },
        { termo: 'Dispersão por animais:', texto: 'muitos frutos servem de alimento para animais, que podem derrubá-los durante a alimentação ou eliminar as sementes com as fezes. As aves que comem frutos podem voar e espalhar as sementes para longe.' },
        { termo: 'Dispersão pela água:', texto: 'frutos e suas sementes, como o coco, flutuam na água até encontrar um local para germinar.' },
      ] },
    ]),

    // organizando o conhecimento (pp. 28 e 29)
    carta('ci-a28', '🌽', ORGANIZANDO, 28, [
      { t: 'quadro', titulo: ORGANIZANDO, texto: 'Observe a seguir as imagens de diferentes plantas usadas na alimentação humana. Depois, encontre os nomes delas no caça-palavras.' },
      { t: 'texto', texto: 'As imagens mostram alface, pimentão, milho, mamão, espinafre, abóbora, mandioca e repolho. Na atividade 2, um beija-flor está com o bico numa flor amarela e laranja.' },
    ]),
    carta('ci-a29', '🪶', ORGANIZANDO, 29, [
      { t: 'texto', texto: 'Atividade 3: pintar o que acontece durante a polinização. Atividade 4: observar uma semente com um tufo branco e fofinho e responder sobre a dispersão.' },
    ]),

    // saberes em ação: corrida das abelhas (p. 30)
    carta('ci-a30', '🐝', 'Corrida das abelhas (1 de 2)', 30, [
      { t: 'quadro', titulo: 'Saberes em ação', texto: 'Agora, o professor vai organizar uma Corrida das abelhas. Para isso, reúna-se em um grupo com seus colegas. Cada grupo será uma colmeia e vocês serão as abelhas.' },
      { t: 'texto', texto: 'Etapa 1 – Corrida das abelhas' },
      { t: 'lista', itens: [
        { termo: '1.', texto: 'O professor vai organizar um campo de flores de papel colorido e distribuir as colmeias dos grupos no pátio.' },
        { termo: '2.', texto: 'No centro de cada flor do campo de flores, vão ter bolinhas que representam os grãos de pólen. Na sua colmeia também terá uma flor, mas sem nenhum grão de pólen.' },
      ] },
    ]),
    carta('ci-a30b', '🐝', 'Corrida das abelhas (2 de 2)', 30, [
      { t: 'lista', itens: [
        { termo: '3.', texto: 'Ao sinal do professor, a corrida começa. Use uma colher para coletar o pólen das flores e transferi-lo para a flor da sua colmeia. Cada abelha poderá levar apenas um grão de pólen por vez com sua colher.' },
        { termo: '4.', texto: 'A corrida das abelhas terminará quando o professor der o sinal. Vence o grupo que conseguir coletar o maior número de grãos de pólen.' },
      ] },
      { t: 'quadro', titulo: 'Etapa 2 – Resultados', itens: [
        { texto: 'Em grupo, respondam às perguntas a seguir.' },
        { texto: 'a) Vocês conseguiram visitar todas as flores do campo de flores?' },
      ] },
    ], ['APR-30-q1a']),

    // testando as ideias e agora você já sabe (pp. 31 e 32)
    carta('ci-a31', '📝', 'Testando as ideias', 31, [
      { t: 'quadro', titulo: 'Testando as ideias', texto: 'Observe a imagem e depois responda às questões a seguir.' },
      { t: 'texto', texto: 'A imagem mostra uma semente com uma "asa" fina, cheia de risquinhos.' },
    ]),
    carta('ci-a32', '🦜', 'Agora você já sabe...', 32, [
      { t: 'texto', texto: 'Atividade 2: enumerar as etapas do desenvolvimento do açaizeiro e dizer em quais etapas ocorrem a polinização e a dispersão.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer que as plantas se relacionam com outros seres vivos.' },
        { texto: 'Identificar a importância das plantas na alimentação dos seres vivos.' },
        { texto: 'Compreender os processos de polinização e de dispersão de sementes.' },
      ] },
      { t: 'texto', texto: 'Já sei – Preciso saber mais – Ainda não sei' },
    ]),
  ]);
})();
