/* Cartas do Livro de Aprendizagem, Capítulo 12 "Trabalho e meio ambiente" (pp. 23 a 32), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas seguidas.
   As fotos e ilustrações viram figuras com a legenda do livro (ou uma frase curta do que mostram). Os QR codes das
   pp. 23 e 29 (conteúdo digital) ficam de fora; a legenda do fiscal (p. 28) sai sem o nome da cidade, ilegível. */
(function () {
  var L = 'aprendizagem', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  Reino.registrarCartas('historia4', [
    // abertura e Conversa vai / vem (pp. 23 e 24)
    carta('hi-a23', '♻', 'Trabalho e meio ambiente – Capítulo 12', 23, [
      { t: 'figuras', itens: [{ img: '♻', legenda: 'Uma casinha rosa escrita ECO PONTO, com placas solares no telhado e uma atendente no balcão. Na rua, um catador empurra uma carroça cheia de caixas de papelão.' }] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Quais trabalhos você reconhece nessa cena?' },
        { texto: 'De que forma esses trabalhos ajudam o meio ambiente?' },
        { texto: 'Que outros trabalhos ajudam a cuidar do meio ambiente?' },
      ] },
    ]),
    carta('hi-a24', '🗑', 'Conversa vem...', 24, [
      { t: 'texto', texto: 'O trabalho dos catadores é muito importante para o meio ambiente.' },
      { t: 'texto', texto: 'Converse com os colegas e o professor sobre como você pode ajudar o trabalho dessas pessoas.' },
      { t: 'texto', texto: 'Desenhe três objetos que podem ser descartados em cada uma das lixeiras abaixo.' },
      { t: 'figuras', itens: [
        { img: '🧴', legenda: 'Lixeira vermelha: Plástico' },
        { img: '🥫', legenda: 'Lixeira amarela: Metais' },
        { img: '📰', legenda: 'Lixeira azul: Papel' },
      ] },
    ]),

    // impactos do trabalho na natureza (pp. 25 e 26)
    carta('hi-a25', '🪓', 'Impactos do trabalho na natureza', 25, [
      { t: 'texto', texto: 'As pessoas transformam a natureza para atender às necessidades das sociedades. Todas essas mudanças, sejam boas ou ruins, são chamadas de impactos ambientais.' },
      { t: 'texto', texto: 'Os impactos ambientais são negativos quando resultam de atividades que poluem o ar e a água, destroem o solo, causam mudanças climáticas e prejudicam a vida de animais e pessoas, afetando seus habitats. Observe as imagens para conhecer alguns exemplos de impactos negativos ao meio ambiente.' },
      { t: 'quadro', titulo: 'Glossário', texto: 'habitat: é o lugar onde um animal ou uma planta vive e encontra tudo do que precisa para crescer: comida, água, abrigo e segurança.' },
      { t: 'figuras', itens: [
        { img: '🪓', legenda: 'Desmatamento de florestas.' },
        { img: '💨', legenda: 'Lançamento de gases no ar.' },
        { img: '🚜', legenda: 'Mineração.' },
        { img: '🔥', legenda: 'Queimadas.' },
      ] },
    ]),
    carta('hi-a26', '🌱', 'Impactos positivos', 26, [
      { t: 'texto', texto: 'Já os impactos ambientais positivos acontecem quando as pessoas se preocupam com o meio ambiente e se dedicam a cuidar dele. Esses impactos podem ser vistos em ações de reflorestamento, como plantação de novas árvores e limpeza de praias e rios. No dia a dia, pequenas atitudes também ajudam o meio ambiente, como reciclar, economizar água e usar menos o carro.' },
      { t: 'figuras', itens: [
        { img: '🌱', legenda: 'Pessoas plantam árvores para recuperar uma área desmatada.' },
        { img: '🏖', legenda: 'Pessoas recolhem lixo em uma praia.' },
      ] },
    ]),
    carta('hi-a26b', '🌱', 'Impactos que demoram a aparecer', 26, [
      { t: 'texto', texto: 'As pessoas podem causar impactos diferentes no meio ambiente. Em algumas situações, podemos perceber esses impactos enquanto uma atividade está acontecendo. Já em outras situações, os impactos não aparecem na hora, mas acontecem bem devagar e só vão ser percebidos depois de muito tempo.' },
    ]),

    // coleta seletiva e a derrubada da floresta (p. 27)
    carta('hi-a27', '🪓', ORGANIZANDO, 27, [
      { t: 'texto', texto: 'Complete o texto usando as palavras do quadro.' },
      { t: 'quadro', texto: 'meio ambiente – material – reciclagem – diminuir' },
      { t: 'texto', texto: 'Observe a obra de arte abaixo.' },
      { t: 'figuras', itens: [{ img: '🪓', legenda: 'Uma mata sendo derrubada: homens cortam as árvores, há troncos caídos no chão e um homem a cavalo.' }] },
      { t: 'fonte', texto: 'RUGENDAS, Johann Moritz. Derrubada de uma floresta. 1835. 1 litografia sobre papel, 21,60 x 28,50 cm.' },
    ]),

    // trabalhos de preservação e comunidades tradicionais (pp. 28 e 29)
    carta('hi-a28', '🌳', 'Trabalhos de preservação da natureza (1 de 2)', 28, [
      { t: 'texto', texto: 'Você sabia que existem vários profissionais que trabalham para cuidar do meio ambiente? É o caso dos fiscais ambientais e dos ambientalistas.' },
      { t: 'texto', texto: 'Os fiscais ambientais verificam se todos cuidam da natureza como manda a lei. Eles vigiam florestas, rios e reservas para evitar desmatamento e poluição. Além disso, multam quem desobedece às leis e ajudam a proteger a natureza para o futuro.' },
      { t: 'figuras', itens: [{ img: '🌳', legenda: 'Fiscal ambiental do Ibama, no Mato Grosso, andando numa trilha dentro da mata.' }] },
    ]),
    carta('hi-a28b', '🌳', 'Trabalhos de preservação da natureza (2 de 2)', 28, [
      { t: 'texto', texto: 'Já os ambientalistas são pessoas que estudam e ensinam como preservar a natureza, os animais e as plantas. Eles ajudam a evitar a destruição do meio ambiente. Para isso, criam projetos de conservação da natureza, ensinam às pessoas a importância de cuidar do planeta e lutam contra atividades que prejudiquem a natureza, como o desmatamento e a poluição.' },
      { t: 'texto', texto: 'Eles também podem trabalhar em escolas, ONGs e em projetos com comunidades, mostrando como cada pessoa pode ajudar o meio ambiente. Muitas vezes, plantam árvores, limpam rios ou organizam campanhas educativas. O trabalho deles é muito importante para manter a natureza viva e protegida para as próximas gerações.' },
    ]),
    carta('hi-a29', '🌿', 'Comunidades tradicionais (1 de 2)', 29, [
      { t: 'texto', texto: 'Além do modo de atuação dos profissionais que você conheceu, o modo de vida de algumas pessoas também é muito importante para preservar o meio ambiente. Isso acontece nas comunidades tradicionais.' },
      { t: 'texto', texto: 'As pessoas que vivem nessas comunidades usam os recursos naturais com muita responsabilidade. Leia os textos a seguir e observe as imagens para conhecer algumas comunidades tradicionais.' },
      { t: 'figuras', itens: [{ img: '🌿', legenda: 'Uma mão colhe um fruto de mangaba no galho.' }] },
      { t: 'quadro', texto: 'As catadoras de mangaba usam os frutos da mangabeira para preparar várias receitas, como bolos, biscoitos e doces. Além disso, essas pessoas trabalham para criar áreas de conservação, protegendo a vegetação e evitando o desmatamento.' },
    ]),
    carta('hi-a29b', '🌼', 'Comunidades tradicionais (2 de 2)', 29, [
      { t: 'figuras', itens: [{ img: '🌼', legenda: 'Um homem de chapéu colhe florzinhas brancas no campo.' }] },
      { t: 'quadro', texto: 'Os apanhadores de sempre-vivas colhem flores para fazer artesanatos e usam vários conhecimentos para criar animais, cuidar de plantações e preparar remédios com plantas medicinais, que ajudam a cuidar da saúde das pessoas. As pessoas que vivem nessas comunidades cuidam da vegetação e do solo da região e lutam para aumentar as áreas de preservação.' },
    ]),

    // cuidar do meio ambiente, o jogo de tabuleiro e o fim do capítulo (pp. 30 a 32)
    carta('hi-a30', '🌍', ORGANIZANDO, 30, [
      { t: 'texto', texto: 'Marque um X nas imagens que mostram pessoas cuidando do meio ambiente.' },
      { t: 'texto', texto: 'Leia a seguir alguns problemas que as pessoas causam ao meio ambiente. Depois, pesquise e escreva quais são as possíveis soluções para cada problema.' },
      { t: 'lista', itens: [
        { texto: 'Poluição das águas' },
        { texto: 'Acúmulo de lixo nas ruas' },
        { texto: 'Poluição do ar' },
        { texto: 'Falta de água' },
      ] },
    ]),
    carta('hi-a31', '🎲', 'Saberes em ação', 31, [
      { t: 'texto', texto: 'As ações das pessoas podem ter impactos positivos ou negativos no meio ambiente. Utilize as cartas e os personagens do Material de apoio para colocar seus conhecimentos em prática no jogo de tabuleiro a seguir. Junte-se a um colega e sigam as orientações do professor.' },
      { t: 'lista', itens: [
        { texto: 'Você coletou papel para reciclagem! Pegue um pedaço de papel e escreva como você pode usá-lo novamente. Ande 1 casa!' },
        { texto: 'Uma fábrica da cidade desrespeitou as leis e jogou produtos químicos no rio. Volte 2 casas!' },
        { texto: 'Você ajudou seus familiares a construir uma composteira, recipiente utilizado para transformar os restos de alimentos em adubo! Ande mais 3 casas!' },
      ] },
    ]),
    carta('hi-a32', '🌍', 'Testando as ideias', 32, [
      { t: 'texto', texto: 'Como seus familiares cuidam do meio ambiente? Converse com um adulto da sua família para descobrir e responda às questões abaixo.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer que os impactos ambientais são ações humanas que alteram o meio ambiente.' },
        { texto: 'Entender que os impactos ambientais negativos podem causar desequilíbrio no ambiente.' },
        { texto: 'Perceber que existem profissionais que ajudam a proteger o meio ambiente.' },
      ] },
    ]),
  ]);
})();
