/* Cartas do Livro de Aprendizagem, Capítulo 11 "As partes das plantas" (pp. 13 a 23), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; página longa vira cartas seguidas
   "(1 de 2)". As fotos viram `figuras` (ícones) e as legendas delas, texto. Página só de questões: carta curta com o
   título da seção e o que ela pede. O QR code e a videoaula ficam de fora (não há como abrir no jogo). */
(function () {
  var L = 'aprendizagem', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var GLOSSARIO = 'Glossário';

  Reino.registrarCartas('ciencias4', [
    // abertura, Conversa vai / vem (pp. 13 e 14)
    carta('ci-a13', '🌱', 'As partes das plantas – Capítulo 11', 13, [
      { t: 'texto', texto: 'Na imagem, uma menina com setas para as partes do corpo: cabeça, braço, mão, perna e pé.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Você já aprendeu o nome de algumas das principais partes do corpo humano. Por que é importante conhecer as partes de um ser vivo?' },
        { texto: 'Que outros seres vivos podem ter o corpo estudado em partes?' },
      ] },
    ], ['APR-13-qA']),
    carta('ci-a14', '💬', 'Conversa vem...', 14, [
      { t: 'texto', texto: 'Os seres humanos, assim como outros seres vivos, têm partes do corpo diferentes. Cada uma delas tem uma função no organismo.' },
      { t: 'lista', itens: [
        { texto: 'Faça um desenho simples do seu corpo. Com o lápis de cor, circule uma parte do seu corpo. Comente com a turma qual é a função da parte destacada.' },
        { texto: 'Faça um desenho de outro ser vivo (um animal ou uma planta). De maneira semelhante, circule uma parte do corpo desse ser vivo e comente com a turma qual é a função da parte destacada.' },
      ] },
    ]),

    // raiz, caule e folhas (pp. 15 e 16)
    carta('ci-a15', '🥕', 'Raiz, caule e folhas (1 de 2)', 15, [
      { t: 'texto', texto: 'As plantas são formadas por diferentes partes: raiz, caule, folhas, flores e frutos. Todas as partes têm funções importantes para que a planta cresça e se desenvolva. Saiba mais sobre elas a seguir.' },
      { t: 'texto', texto: 'A raiz é a parte da planta que geralmente cresce no solo. Ela tem as funções de absorver água e nutrientes e ajudar a planta a se firmar.' },
      { t: 'figuras', itens: [{ img: '🍅', legenda: 'Pé de tomate: flor, folha, fruto, caule, sementes e raiz' }] },
    ]),
    carta('ci-a15b', '🥕', 'Raiz, caule e folhas (2 de 2)', 15, [
      { t: 'texto', texto: 'Existem muitos tipos de raízes. Algumas delas têm um ramo principal de onde saem ramificações, como a planta de feijão na imagem ao final da página.' },
      { t: 'texto', texto: 'Também existem raízes que acumulam nutrientes, ficam maiores e ajudam a planta a crescer. Algumas delas servem de alimento para os seres vivos, como a cenoura, a batata-doce, a beterraba e a mandioca.' },
      { t: 'figuras', itens: [
        { img: '🥕', legenda: 'A cenoura é um tipo de raiz.' },
        { img: 'ci:11-raiz', legenda: 'Raízes de plantas de feijão mostrando o ramo principal de onde saem as ramificações.' },
      ] },
    ]),
    carta('ci-a16', '🍓', 'O caule (1 de 2)', 16, [
      { t: 'texto', texto: 'O caule é responsável por sustentar a planta toda e pelo transporte de substâncias, levando água e nutrientes absorvidos pela raiz até as outras partes da planta e distribuindo os açúcares produzidos na fotossíntese. Ele pode ter diferentes tamanhos, ramificações e formatos. No mamoeiro o caule é longo e rígido e no morangueiro ele é esverdeado, curto e flexível.' },
      { t: 'texto', texto: 'Assim como as raízes, alguns caules ficam embaixo da terra e armazenam nutrientes, como a cebola, o alho, a batata e o gengibre.' },
      { t: 'figuras', itens: [
        { img: '🍓', legenda: 'Morangueiro.' },
        { img: '🧅', legenda: 'A cebola é um tipo de caule.' },
      ] },
    ]),
    carta('ci-a16b', '🍃', 'As folhas (2 de 2)', 16, [
      { t: 'texto', texto: 'As folhas são as principais estruturas responsáveis pela fotossíntese. Elas apresentam pequenas aberturas por onde o gás carbônico entra e o gás oxigênio sai. Além disso, elas absorvem a luz do sol por meio da clorofila, substância que dá a cor verde à maioria das plantas.' },
      { t: 'texto', texto: 'As folhas têm formas, texturas e tamanhos variados. Algumas são largas e alongadas, como as folhas de bananeira, enquanto outras são divididas em partes menores, como as folhas de coentro.' },
      { t: 'figuras', itens: [
        { img: '🍃', legenda: 'Folhas de bananeira' },
        { img: '🌿', legenda: 'Folhas de coentro' },
      ] },
    ]),

    // flor, fruto e semente (pp. 17 e 18)
    carta('ci-a17', '🌸', 'Flor, fruto e semente (1 de 2)', 17, [
      { t: 'texto', texto: 'Muitas plantas se reproduzem por meio de flores. A maioria delas têm partes masculinas, que produzem os grãos de pólen, e partes femininas, que produzem os óvulos. O encontro do grão de pólen com o óvulo forma a semente, que dará origem a uma nova planta.' },
      { t: 'figuras', itens: [{ img: '🌷', legenda: 'Os lírios apresentam estruturas masculinas e femininas na mesma flor.' }] },
    ]),
    carta('ci-a17b', '🐝', 'Flor, fruto e semente (2 de 2)', 17, [
      { t: 'texto', texto: 'Muitas flores produzem néctar e têm cheiros e cores que atraem animais, principalmente insetos, como as abelhas. Quando os animais se alimentam do néctar, os grãos de pólen acabam grudando em seus corpos e são transportados para flores de outras plantas da mesma espécie, polinizando-as.' },
      { t: 'quadro', titulo: GLOSSARIO, itens: [{ termo: 'néctar', texto: 'líquido doce produzido nas flores.' }] },
      { t: 'figuras', itens: [{ img: '🐝', legenda: 'Abelha com grãos de pólen grudados no corpo.' }] },
    ]),
    carta('ci-a18', '🍅', 'Os frutos (1 de 2)', 18, [
      { t: 'texto', texto: 'Os frutos protegem as sementes e, como são consumidos por diversos seres vivos, geralmente são responsáveis por espalhá-las no ambiente. Eles podem ter diversas cores, cheiros e formatos. Podem ser secos, como as castanhas, ou carnosos, como o melão.' },
      { t: 'texto', texto: 'O mamão e o abacate são frutos carnosos, enquanto a noz é um fruto seco. O mamão tem muitas sementes, já a noz e o abacate têm apenas uma semente por fruto.' },
    ]),
    carta('ci-a18b', '🌱', 'As sementes (2 de 2)', 18, [
      { t: 'texto', texto: 'As sementes têm formatos, tamanhos e cores variados. Algumas sementes são pequenas e leves, como as do mamão, enquanto outras são grandes e pesadas, como as do abacate. Quando encontram condições para a germinação, as sementes dão origem a novas plantas.' },
      { t: 'quadro', titulo: GLOSSARIO, itens: [{ termo: 'germinação', texto: 'é o desenvolvimento de uma semente, que dá origem a uma nova planta.' }] },
      { t: 'figuras', itens: [
        { img: '🫘', legenda: 'Semente' },
        { img: '🌱', legenda: 'Folhas e caule em formação' },
      ] },
    ]),
    carta('ci-a19', '📋', 'Organizando o conhecimento', 19, [
      { t: 'quadro', titulo: 'Organizando o conhecimento', texto: 'Recorte as imagens da aba e cole as partes das plantas nos locais corretos: raiz, caule, folha, flor e fruto.' },
    ]),

    // saberes em ação: exsicatas (pp. 20 e 21)
    carta('ci-a20', '🍂', 'Saberes em ação – Etapas 1 e 2', 20, [
      { t: 'texto', texto: 'Agora, você e seus colegas vão analisar diferentes plantas e descobrir as diferenças entre elas. Para isso, siga as etapas do experimento a seguir.' },
      { t: 'quadro', titulo: 'Etapa 1 – Coleta de plantas', itens: [
        { texto: '1. Reúna-se com seus colegas em um grupo. Juntos, coletem ramos de plantas com folhas e flores.' },
        { texto: '2. Organizem as plantas sobre uma mesa e observem as partes coletadas. Conversem sobre as seguintes características das plantas: Quais são os formatos das flores e folhas? Quais são os tamanhos? Como é a textura de suas superfícies?' },
      ] },
    ]),
    carta('ci-a20b', '📖', 'Saberes em ação – Etapa 2', 20, [
      { t: 'quadro', titulo: 'Etapa 2 – Preparação de plantas', itens: [
        { texto: '1. Escolham um ramo pequeno com folhas e outro com flores para serem transformados em exsicatas.' },
        { texto: '2. Coloquem os ramos entre duas folhas de papel-jornal ou papel-toalha.' },
        { texto: '3. Coloquem os papéis com os ramos entre as páginas de um livro grosso ou embaixo de algum objeto pesado.' },
        { texto: '4. Mantenham os ramos prensados por cerca de uma semana ou até que as flores e folhas estejam bem secas e achatadas.' },
      ] },
      { t: 'quadro', titulo: GLOSSARIO, itens: [{ termo: 'exsicatas', texto: 'amostras de partes de plantas que são secas e prensadas para serem preservadas e estudadas.' }] },
    ]),
    carta('ci-a21', '📌', 'Saberes em ação – Etapa 3', 21, [
      { t: 'quadro', titulo: 'Etapa 3 – Montagem de exsicatas', itens: [
        { texto: '1. Com cuidado, retirem os ramos secos do meio do papel utilizado na secagem.' },
        { texto: '2. Coloquem cada ramo sobre a folha de montagem disponibilizada pelo professor.' },
        { texto: '3. Escolham uma maneira criativa de organizar os ramos na exsicata e colem as extremidades deles na folha usando pedaços de fita adesiva.' },
        { texto: '4. Com a ajuda do professor, identifiquem as plantas coladas no papel. Depois, escrevam as seguintes informações ao lado de cada exsicata: Nome da planta. Parte da planta.' },
      ] },
    ]),
    carta('ci-a21b', '📋', 'Saberes em ação – Etapa 4', 21, [
      { t: 'quadro', titulo: 'Etapa 4 – Exposição das exsicatas', itens: [
        { texto: '1. Reúnam as exsicatas de todos os grupos e organizem um mural na sala de aula.' },
        { texto: '2. Aproveitem para observar as diferentes plantas coletadas pelos seus colegas e conversar sobre o processo de produção das exsicatas.' },
      ] },
    ]),

    // testando as ideias e agora você já sabe (pp. 22 e 23)
    carta('ci-a22', '🎨', 'Testando as ideias', 22, [
      { t: 'quadro', titulo: 'Testando as ideias', texto: 'Observe a imagem do quadro a seguir, do pintor Claude Monet, e resolva os itens.' },
      { t: 'figuras', itens: [{ img: 'ci:11-monet', legenda: 'Um vaso com muitas flores amarelas, caules e folhas verdes, sobre uma mesa.' }] },
      { t: 'fonte', texto: 'MONET, Claude. Flores de Alcachofra de Jerusalém. 1880. 1 óleo sobre tela, color., 99,6 × 73 cm. National Gallery of Art, Washington, D.C., Estados Unidos.' },
    ]),
    carta('ci-a23', '🌟', 'Agora você já sabe...', 23, [
      { t: 'texto', texto: 'Atividade 2: pintar cada parte da planta de acordo com a legenda.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Conhecer as principais partes de uma planta.' },
        { texto: 'Compreender as funções desempenhadas por cada parte de uma planta.' },
      ] },
      { t: 'texto', texto: 'Já sei – Preciso saber mais – Ainda não sei' },
    ]),
  ]);
})();
