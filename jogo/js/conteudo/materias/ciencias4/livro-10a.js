/* Cartas do Livro de Aprendizagem, sumário e Capítulo 10 "Conhecendo as plantas" (pp. 2 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; texto longo vira cartas seguidas
   (até ~110 palavras). Página só de questões: carta curta com o título da seção e o que ela pede.
   O sumário (sem número impresso) é a p. 2 do inventário e vai no pacote de voz do capítulo 10. As fotos viram
   figuras com legenda; o QR code e a videoaula ficam de fora (não dá para abrir no jogo). */
(function () {
  var L = 'aprendizagem', C = 10;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var SABERES = 'Saberes em ação';
  var TESTANDO = 'Testando as ideias';
  Reino.registrarCartas('ciencias4', [
    // sumário
    carta('ci-a02', '📚', 'Sumário', 2, [
      { t: 'lista', itens: [
        { termo: 'Capítulo 10 – Conhecendo as plantas', texto: 'página 3' },
        { termo: 'Capítulo 11 – As partes das plantas', texto: 'página 13' },
        { termo: 'Capítulo 12 – As plantas se relacionam', texto: 'página 24' },
      ] },
    ]),

    // abertura, Conversa vai / vem e as plantas precisam de água e luz do sol (pp. 3 a 5)
    carta('ci-a03', '🌱', 'Conhecendo as plantas – Capítulo 10', 3, [
      { t: 'figuras', itens: [{ img: '🌳', legenda: 'Jardim Botânico de Brasília.' }] },
      { t: 'texto', texto: 'Na foto, há árvores altas, palmeiras, plantas baixinhas, gramado e um lago ao fundo.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Quais seres vivos estão representados na imagem?' },
        { texto: 'Explique, com suas palavras, o que são plantas.' },
      ] },
    ]),
    carta('ci-a04', '💬', 'Conversa vem...', 4, [
      { t: 'texto', texto: 'Você já reparou como as plantas crescem em diferentes lugares? Algumas vivem em jardins, outras em vasos dentro de casa, e muitas fazem parte de grandes florestas. O que todas essas plantas têm em comum?' },
    ]),
    carta('ci-a05', '🌱', 'As plantas precisam de água e luz do sol', 5, [
      { t: 'texto', texto: 'Assim como os animais, as plantas formam um grupo de seres vivos bastante diverso. Há plantas aquáticas, como a vitória-régia, e plantas terrestres, que podem viver em ambientes secos, como o cacto.' },
      { t: 'texto', texto: 'Além disso, existem plantas muito pequenas, como os musgos, e plantas muito grandes, como o angelim-vermelho da Amazônia. Toda essa diversidade faz com que as plantas sejam encontradas em diferentes ambientes na natureza.' },
      { t: 'figuras', itens: [
        { img: 'ci:10-vitoria-regia', legenda: 'Vitória-régia, planta aquática típica da Amazônia.' },
        { img: '🌵', legenda: 'Cacto, planta adaptada aos ambientes secos.' },
        { img: '🌿', legenda: 'Musgo, planta encontrada em ambientes úmidos.' },
        { img: '🌳', legenda: 'Angelim-vermelho, árvore encontrada na Amazônia, que pode alcançar mais de 80 metros de altura, o que corresponde a um prédio de 30 andares.' },
      ] },
    ]),

    // fotossíntese, importância das plantas e Organizando o conhecimento (pp. 6 a 8)
    carta('ci-a06', '☀', 'Fotossíntese', 6, [
      { t: 'quadro', texto: 'Todas as plantas precisam de água, luz do sol, ar e nutrientes para viver.' },
      { t: 'lista', itens: [{ termo: 'Nutrientes', texto: 'são substâncias essenciais para o desenvolvimento dos seres vivos. No caso das plantas, os nutrientes geralmente são obtidos do solo.' }] },
      { t: 'texto', texto: 'As plantas produzem o seu próprio alimento por meio de um processo chamado de fotossíntese. Acompanhe como ele acontece.' },
    ]),
    carta('ci-a06b', '☀', 'Como acontece a fotossíntese', 6, [
      { t: 'lista', itens: [
        { termo: '1. Gás carbônico', texto: 'As plantas absorvem o gás carbônico que está presente no ar, principalmente pelas folhas.' },
        { termo: '2. Água e nutrientes', texto: 'Por meio das raízes, as plantas absorvem água e nutrientes do solo.' },
        { termo: '3. Luz solar', texto: 'A água, o gás carbônico e os nutrientes, na presença de luz solar, são transformados em açúcares e gás oxigênio.' },
        { termo: '4. Açúcares', texto: 'Os açúcares são a fonte de energia para a planta.' },
        { termo: '5. Gás oxigênio', texto: 'O gás oxigênio é liberado para o ambiente e será utilizado para a respiração dos seres vivos.' },
        { termo: '6. Vapor de água', texto: 'As plantas também liberam vapor de água, que mantém o ar úmido e contribui para a formação das chuvas.' },
      ] },
      { t: 'fonte', texto: 'Esquema representando a fotossíntese e os elementos de que a planta precisa para viver.' },
    ]),
    carta('ci-a07', '🌳', 'A importância das plantas', 7, [
      { t: 'quadro', texto: 'As plantas são importantes para muitos seres vivos, porque oferecem a eles alimento, abrigo e proteção.' },
      { t: 'texto', texto: 'Árvores grandes podem abrigar ninhos de aves e esconder pequenos animais. Já plantas menores, como arbustos, oferecem sombra e proteção contra o calor para alguns animais.' },
      { t: 'texto', texto: 'As plantas ajudam a manter o equilíbrio da natureza. Elas servem como alimento para muitos animais e são usadas na fabricação de muitos produtos utilizados pelos seres humanos.' },
      { t: 'texto', texto: 'A madeira das árvores pode virar papel, móveis ou ser usada na construção de casas. O algodão é usado para fazer roupas. Além disso, muitas plantas são usadas para fabricar medicamentos e tratar doenças.' },
    ]),
    carta('ci-a08', '✏', 'Organizando o conhecimento', 8, [
      { t: 'texto', texto: 'Observe a imagem que mostra elementos usados e produzidos na fotossíntese.' },
      { t: 'texto', texto: 'Na imagem, o sol manda setas para as folhas. Uma seta vermelha sai do ar e entra numa folha. Uma seta azul sai das folhas e vai para o céu. Uma seta branca sobe da água do solo até as raízes.' },
    ]),

    // Saberes em ação: o experimento da luz (pp. 9 e 10)
    carta('ci-a09', '🧪', SABERES + ' (1 de 2)', 9, [
      { t: 'texto', texto: 'Agora, você e seus colegas vão investigar como as plantas reagem à luz do sol. Para isso, formem grupos e sigam as instruções a seguir.' },
      { t: 'quadro', titulo: 'Etapa 1 – Preparando o experimento', itens: [
        { texto: '1. Levem dois copos plásticos ou vasos pequenos e algumas sementes para a sala de aula no dia combinado com o professor.' },
        { texto: '2. Plantem as sementes nos dois recipientes, preenchendo-os com terra até a metade e cobrindo as sementes.' },
        { texto: '3. Escolham dois locais diferentes para deixar os recipientes. Um recipiente deve ficar em local ensolarado e o outro deve ficar em local escuro.' },
      ] },
    ]),
    carta('ci-a09b', '🧪', SABERES + ' (2 de 2)', 9, [
      { t: 'quadro', titulo: 'Etapa 2 – Observação', itens: [
        { texto: '1. Após uma semana do plantio das sementes, inicie com o grupo a observação diária das plantas que nasceram.' },
        { texto: '2. Registrem, juntos, as observações sobre as plantas que nasceram em cada recipiente na tabela.' },
      ] },
      { t: 'tabela', cab: ['Planta do recipiente colocado em local ensolarado', 'Planta do recipiente colocado em local escuro'], linhas: [['Data: ___/___', 'Data: ___/___']] },
    ]),
    carta('ci-a10', '🧪', SABERES + ': resultados', 10, [
      { t: 'quadro', titulo: 'Etapa 3 – Observando os resultados', itens: [
        { texto: '1. Converse com os colegas: o que vocês imaginaram no início do experimento aconteceu?' },
        { texto: '2. Desenhe como estão as duas plantas ao final do experimento.' },
        { texto: '3. Responda, com o grupo, às perguntas.' },
      ] },
      { t: 'quadro', titulo: 'Etapa 4 – Compartilhando resultados', itens: [
        { texto: '1. Junto ao grupo, apresentem suas observações para a turma. Expliquem o que aconteceu com as plantas e como a luz influenciou o crescimento delas.' },
      ] },
    ], ['APR-10-q1', 'APR-10-qA']),

    // Testando as ideias e Agora você já sabe (pp. 11 e 12)
    carta('ci-a11', '💧', TESTANDO, 11, [
      { t: 'texto', texto: 'Leia a tirinha. Armandinho e o sapinho estão diante de uma planta murcha num vaso.' },
      { t: 'fala', quem: 'Pai', texto: 'Viu como a plantinha está murchando?' },
      { t: 'fala', quem: 'Armandinho', texto: 'Sim...' },
      { t: 'fala', quem: 'Armandinho', texto: 'Vou pegar um pouco de água pra ela!...' },
      { t: 'fala', quem: 'Pai', texto: 'Boa!' },
      { t: 'fala', quem: 'Armandinho', texto: '...E acho que vou trazer um pouco pro senhor também...' },
      { t: 'fonte', texto: 'BECK, Alexandre. Tirinha de Armandinho. 2017.' },
      { t: 'figuras', itens: [{ img: '🐒', legenda: 'Um macaquinho agarrado no tronco de uma árvore, entre as folhas.' }] },
    ]),
    carta('ci-a12', '⭐', TESTANDO + ' e Agora você já sabe...', 12, [
      { t: 'texto', texto: 'Relacione as frases às características das plantas e responda por que a fotossíntese é importante.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Identificar os elementos de que as plantas precisam para crescer e viver.' },
        { texto: 'Compreender como a fotossíntese ajuda as plantas a obter alimento e a se desenvolver.' },
        { texto: 'Reconhecer a importância das plantas para os outros seres vivos.' },
      ] },
    ]),
  ]);
})();
