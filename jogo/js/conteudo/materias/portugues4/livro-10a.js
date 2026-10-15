/* Cartas do Livro de Aprendizagem, capa, sumário e Capítulo 10 "Conta uma história?" (pp. 1 a 29), na ordem das
   páginas (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; texto longo vira cartas
   seguidas (até ~110 palavras). Página só de questões: carta curta com o título da seção e o que ela pede.
   Capa e sumário (sem número impresso) são as pp. 1 e 2 do inventário e vão no pacote de voz do capítulo 10. */
(function () {
  var L = 'aprendizagem', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  Reino.registrarCartas('portugues4', [
    // capa e sumário
    carta('lp-a01', '🤖', 'Língua Portuguesa', 1, [
      { t: 'texto', texto: '2º ano – Volume 4' },
      { t: 'quadro', texto: 'Crie nesta página sua máquina do conhecimento' },
    ]),
    carta('lp-a02', '📚', 'Sumário', 2, [
      { t: 'lista', itens: [
        { termo: 'Capítulo 10 – Conta uma história?', texto: 'página 3' },
        { termo: 'Capítulo 11 – Quem canta...', texto: 'página 30' },
        { termo: 'Capítulo 12 – O visual do poema', texto: 'página 55' },
      ] },
    ]),

    // abertura e "Quem sou eu?" (pp. 3 e 4)
    carta('lp-a03', '📖', 'Capítulo 10 – Conta uma história?', 3, [
      { t: 'ilustracao', id: 'lp-contos-abertura', alt: 'Um livro aberto de onde saem personagens de contos infantis, num campo florido.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Quais personagens de histórias infantis você reconhece na imagem?' },
        { texto: 'O que acontece na história de cada personagem?' },
      ] },
    ]),
    carta('lp-a04', '💬', 'Conversa vem...', 4, [
      { t: 'texto', texto: 'Os personagens na imagem da página anterior fazem parte de contos infantis. Essas histórias são contadas há muitos anos e continuam encantando crianças e adultos.' },
      { t: 'texto', texto: 'Leia as pistas para descobrir quem são estes personagens. Depois, escreva o nome de cada um no espaço em branco.' },
      { t: 'quadro', texto: 'Zangado – Soneca – Feliz – Grilo Falante – Gênio da Lâmpada – Lobo Mau' },
    ]),

    // O Gato de Botas – Parte 1 e os elementos do conto (p. 5)
    carta('lp-a05', '🐱', 'O Gato de Botas – Parte 1 (1 de 2)', 5, [
      { t: 'texto', texto: 'Acompanhe a leitura do primeiro trecho do texto a seguir.' },
      { t: 'texto', texto: 'Era uma vez um velho moleiro que tinha três filhos. Ao morrer, deixou, como herança, o moinho para o primogênito, um burrinho para o filho do meio e um gato para o caçula, que se pôs a chorar:' },
      { t: 'fala', texto: 'O que será de mim? Por que papai me deixou desamparado? Vou morrer de fome!' },
      { t: 'texto', texto: 'O felino, que ouvia tudo em silêncio, resolveu falar:' },
      { t: 'fala', texto: 'Não se preocupe! Peço apenas que compre para mim um par de botas e uma bolsa de couro. Então, provarei que sou mais útil que o moinho e o burro.' },
    ]),
    carta('lp-a05b', '🐱', 'O Gato de Botas – Parte 1 (2 de 2)', 5, [
      { t: 'texto', texto: 'Surpreso com a firmeza dessas palavras, o caçula contou as últimas moedas e saiu para adquirir as encomendas.' },
      { t: 'texto', texto: 'Logo que recebeu seus presentes, o gato dirigiu-se ao bosque, onde capturou duas codornas. Em seguida, entregou-as ao rei e disse que foram mimos do Marquês de Carabás – na verdade, um título inventado, para aproximar o rapaz do soberano.' },
      { t: 'texto', texto: 'A estratégia continuou durante meses, deixando Sua Majestade cada dia mais curioso para conhecer o tal nobre.' },
    ]),
    carta('lp-a05c', '📖', 'Conto', 5, [
      { t: 'quadro', texto: 'O trecho anterior faz parte de um conto, texto narrativo curto e com poucos personagens, que tem como característica apresentar um único problema principal, que precisa ser resolvido. Os temas dos contos são muito variados: há contos infantis, contos de fadas, contos de aventura, contos de terror etc.' },
      { t: 'texto', texto: 'O conto tem estes elementos narrativos, que dão forma à história.' },
      { t: 'lista', itens: [
        { termo: 'Personagens', texto: 'são os seres que participam da história.' },
        { termo: 'Espaço', texto: 'é o conjunto de lugares onde a história acontece.' },
        { termo: 'Tempo', texto: 'é o momento em que os fatos acontecem.' },
        { termo: 'Narrador', texto: 'é quem conta a história. Pode ser alguém de fora da história ou um personagem que participa dela.' },
      ] },
    ]),

    // O Gato de Botas – Parte 2 (pp. 6 e 7) e as partes do conto
    carta('lp-a06', '🐱', 'O Gato de Botas – Parte 2 (1 de 3)', 6, [
      { t: 'texto', texto: 'Vamos ler o segundo trecho do conto O Gato de Botas?' },
      { t: 'texto', texto: 'Em uma bela tarde, sabendo que o monarca e a princesa sairiam para passear, o gato convidou o jovem para descansarem à margem do rio. Tiravam uma soneca, quando a carruagem real se aproximou. Sem pestanejar, o felino despertou seu proprietário e disse:' },
      { t: 'fala', texto: 'Se hoje você me escutar, traçará seu destino. Não se esqueça de que agora é o Marquês de Carabás! Retire suas roupas e entre logo no rio! O resto eu faço.' },
      { t: 'texto', texto: 'Enquanto o dono obedecia, o gato correu em direção à carruagem, gritando:' },
      { t: 'fala', texto: 'Socorro! Roubaram as roupas de meu senhor, o Marquês de Carabás!' },
    ]),
    carta('lp-a06b', '🐱', 'O Gato de Botas – Parte 2 (2 de 3)', 6, [
      { t: 'texto', texto: 'Ao ouvir aquele nome, o rei ordenou que parassem. Inteirou-se do acontecido, determinou que providenciassem trajes para o rapaz e o convidou para entrar na carruagem.' },
      { t: 'texto', texto: 'O gato, sorrateiramente, perguntou:' },
      { t: 'fala', texto: 'Vossa Majestade nos daria a honra de visitar o palácio do Marquês de Carabás?' },
      { t: 'texto', texto: 'O rei aceitou o convite, e o gato foi na frente, pois anunciaria a chegada da família real. Na verdade, o felino saiu em direção às terras de um rico e misterioso ogro.' },
    ]),
    carta('lp-a07', '🐱', 'O Gato de Botas – Parte 2 (3 de 3)', 7, [
      { t: 'texto', texto: 'Quando alcançou as propriedades do monstrengo, o astuto comunicou aos camponeses que ali trabalhavam:' },
      { t: 'fala', texto: 'O rei está chegando! Se não disserem que toda esta paisagem pertence ao Marquês de Carabás, serão sentenciados à morte.' },
      { t: 'texto', texto: 'Assim, quando o monarca perguntou de quem eram aqueles campos verdinhos, os lavradores proferiram:' },
      { t: 'fala', texto: 'Do nobre Marquês de Carabás!' },
      { t: 'texto', texto: 'Mais adiante, o gato encontrou agricultores a colocar trigo em uma carroça e os advertiu:' },
      { t: 'fala', texto: 'O rei está a chegar! Se não disserem que todo este trigo pertence ao Marquês de Carabás, serão condenados ao calabouço.' },
      { t: 'texto', texto: 'Desse modo, quando o rei perguntou de quem eram aqueles grãos, responderam:' },
      { t: 'fala', texto: 'Do Marquês de Carabás!' },
    ]),
    carta('lp-a07b', '🧩', 'As partes do conto', 7, [
      { t: 'texto', texto: 'O conto normalmente apresenta estas partes.' },
      { t: 'lista', itens: [
        { termo: 'Introdução', texto: 'é o começo da história, quando são apresentados os personagens, o lugar e o tempo em que a história acontece.' },
        { termo: 'Desenvolvimento', texto: 'é a parte da história em que os personagens enfrentam situações e tomam decisões.' },
        { termo: 'Clímax', texto: 'é o momento mais emocionante da história, quando os personagens tentam resolver o problema principal.' },
        { termo: 'Desfecho', texto: 'é o fim da história, quando o problema é resolvido.' },
      ] },
    ]),

    // O Gato de Botas – Parte 3 (p. 8)
    carta('lp-a08', '🐱', 'O Gato de Botas – Parte 3 (1 de 2)', 8, [
      { t: 'texto', texto: 'Agora, leia o último trecho do conto O Gato de Botas.' },
      { t: 'texto', texto: 'Assim, o gato continuou a correr, até alcançar o castelo do terrível ogro, que, ao vê-lo, indagou:' },
      { t: 'fala', texto: 'Quem é você? O que deseja em meus domínios?' },
      { t: 'fala', texto: 'Sou o Gato de Botas, seu modesto servo! Ouvi dizer que o senhor possui poderes mágicos, mas não acreditei, pois só creio naquilo que vejo... Será que conseguiria me transformar em um leão?' },
      { t: 'texto', texto: 'Imediatamente, houve a metamorfose, e o bichano emendou:' },
      { t: 'fala', texto: 'Nossa! Mas eu duvido que você consiga virar um ratinho!' },
    ]),
    carta('lp-a08b', '🐱', 'O Gato de Botas – Parte 3 (2 de 2)', 8, [
      { t: 'texto', texto: 'Cheio de orgulho, o ogro se converteu em roedor. Sem perder tempo, o leão o comeu e, em seguida, voltou à forma natural.' },
      { t: 'texto', texto: 'Naquele momento, o rei chegara às portas do palácio e, impressionado com a riqueza e com a modéstia do jovem, ofereceu a mão da princesa em casamento. O Marquês de Carabás aceitou e foi muito feliz ao lado da esposa e do fiel escudeiro.' },
      { t: 'fonte', texto: 'BRASIL. Ministério da Educação. Secretaria de Alfabetização. O Gato de Botas. Disponível em: https://alfabetizacao.mec.gov.br/images/conta-pra-mim/livros/versao_digital/gato_de_botas_versao_digital.pdf. Acesso em: 11 fev. 2025.' },
    ]),

    // Organizando o conhecimento: o conto (pp. 9 e 10)
    carta('lp-a09', '📝', ORGANIZANDO, 9, [
      { t: 'texto', texto: 'Questões 1, 2 e 3 sobre o conto O Gato de Botas: a herança que o moleiro deixou para os filhos, a reação do filho caçula e os elementos narrativos do conto.' },
    ]),
    carta('lp-a10', '📝', ORGANIZANDO, 10, [
      { t: 'texto', texto: 'Questões 4 e 5 sobre o conto O Gato de Botas: o objetivo do gato e as partes do conto (introdução, desenvolvimento, clímax e desfecho).' },
    ]),

    // Sinais de pontuação: ponto-final, ponto de interrogação, ponto de exclamação (pp. 11 a 13)
    carta('lp-a11', '❓', 'Sinais de pontuação: ponto-final, ponto de interrogação, ponto de exclamação (1 de 2)', 11, [
      { t: 'texto', texto: 'Releia um trecho do conto O Gato de Botas.' },
      { t: 'texto', texto: 'Era uma vez um velho moleiro que tinha três filhos. Ao morrer, deixou, como herança, o moinho para o primogênito, um burrinho para o filho do meio e um gato para o caçula, que se pôs a chorar:' },
      { t: 'fala', texto: 'O que será de mim? Por que papai me deixou desamparado? Vou morrer de fome!' },
      { t: 'texto', texto: 'O felino, que ouvia tudo em silêncio, resolveu falar:' },
      { t: 'fala', texto: 'Não se preocupe! Peço apenas que compre para mim um par de botas e uma bolsa de couro. Então, provarei que sou mais útil que o moinho e o burro.' },
    ]),
    carta('lp-a11b', '❗', 'Sinais de pontuação: ponto-final, ponto de interrogação, ponto de exclamação (2 de 2)', 11, [
      { t: 'quadro', texto: 'Sinais de pontuação ajudam a entender o que lemos. Eles mostram quando devemos fazer pausas na leitura e ajudam a identificar intenções do texto e emoções que ele transmite.' },
      { t: 'lista', itens: [
        { termo: 'Ponto-final', texto: 'É usado para indicar que a frase terminou. Exemplo: "Era uma vez um moleiro que tinha três filhos."' },
        { termo: 'Ponto de interrogação', texto: 'É usado para fazer uma pergunta ou expressar uma dúvida. Exemplo: "O que será de mim?"' },
        { termo: 'Ponto de exclamação', texto: 'É usado para transmitir sentimentos e emoções, como alegria, animação, medo e surpresa. Exemplo: "Não se preocupe!"' },
      ] },
    ]),
    carta('lp-a12', '📝', ORGANIZANDO, 12, [
      { t: 'texto', texto: 'Questões 1, 2 e 3: contornar as pontuações de um trecho de O Gato de Botas e descobrir quais frases podem terminar com ponto de exclamação ou com ponto de interrogação.' },
    ]),
    carta('lp-a13', '📝', ORGANIZANDO, 13, [
      { t: 'texto', texto: 'Questão 4: completar um trecho do conto Chapeuzinho Vermelho com ponto-final, ponto de exclamação ou ponto de interrogação.' },
      { t: 'fonte', texto: 'BRASIL. Ministério da Educação. Secretaria de Alfabetização. Chapeuzinho Vermelho. Disponível em: https://alfabetizacao.mec.gov.br/images/conta-pra-mim/livros/versao_digital/chapeuzinho_vermelho_versao_digital.pdf. Acesso em: 11 fev. 2025.' },
    ]),

    // Sinais de pontuação: dois-pontos, aspas e travessão; A lenda da Vitória-Régia (pp. 14 a 16)
    carta('lp-a14', '🌙', 'A lenda da Vitória-Régia (1 de 5)', 14, [
      { t: 'quadro', titulo: 'Sinais de pontuação: dois-pontos, aspas e travessão', texto: 'Acompanhe a leitura do texto a seguir.' },
      { t: 'texto', texto: 'Há muitos e muitos anos, em certas noites, a Lua, chamada de Jaci por alguns indígenas, aparecia com todo o seu esplendor para iluminar uma aldeia na Amazônia brasileira.' },
      { t: 'texto', texto: 'Sabia-se que Jaci, quando se escondia atrás das montanhas, sempre levava consigo algumas jovens e as transformava em estrelas no céu.' },
      { t: 'texto', texto: 'Acontece que uma moça [...], a guerreira Naiá, vivia sonhando com esse encontro, e seus olhos brilhavam quando pensava no grande dia em que seria convidada pela deusa Jaci. No entanto, os anciões da aldeia alertavam:' },
    ]),
    carta('lp-a14b', '🌙', 'A lenda da Vitória-Régia (2 de 5)', 14, [
      { t: 'fala', texto: 'Naiá, as moças são transformadas em estrelas depois que são tocadas pela formosa deusa. Não tem volta, Naiá!' },
      { t: 'texto', texto: 'Mas quem conseguia convencê-la? Naiá queria porque queria ser levada pela Lua, para ser estrela no céu e brilhar ao lado de Jaci!' },
      { t: 'texto', texto: 'Nas noites claras da floresta, ou quando apenas um pedacinho da Lua aparecia no céu, a indígena sonhadora corria e implorava pelo toque de Jaci, sem nunca a alcançar.' },
      { t: 'texto', texto: 'Naiá subia nos galhos mais altos das árvores ou pernoitava no cume dos morros silenciosos, na esperança de subir ao céu pelo convite da deusa.' },
    ]),
    carta('lp-a14c', '🌙', 'A lenda da Vitória-Régia (3 de 5)', 14, [
      { t: 'texto', texto: 'Mas Jaci sumia na imensidão do céu, para depois ressurgir linda, redonda e brilhante. Enquanto isso, a jovem [...] apenas definhava. Naiá já não sentia fome, nem sede. E não havia pajé que a curasse do seu imenso desejo.' },
      { t: 'quadro', titulo: 'Glossário', texto: 'Pajé: é uma pessoa sábia e muito importante para alguns povos indígenas. Sua função é aconselhar e cuidar dos outros.' },
    ]),
    carta('lp-a15', '🌙', 'A lenda da Vitória-Régia (4 de 5)', 15, [
      { t: 'texto', texto: 'Uma noite, tendo parado para descansar após longa caminhada, Naiá sentou-se à beira de um lago. Viu, então, na superfície, a imagem [...]: a Lua estava bem ali, ao seu alcance, refletida no espelho d\'água. Naiá, pensando que a Lua descera para se banhar, mergulhou fundo ao seu encontro e não conseguiu voltar à superfície.' },
      { t: 'texto', texto: 'Jaci, comovida com tão intenso desejo, quis recompensar o sacrifício da bela jovem indígena e resolveu transformá-la em uma estrela diferente de todas aquelas que brilhavam no céu.' },
    ]),
    carta('lp-a15b', '🌙', 'A lenda da Vitória-Régia (5 de 5)', 15, [
      { t: 'texto', texto: 'Assim, Naiá foi transformada na "Estrela das Águas", única e majestosa, que é a vitória-régia ou "mumuru", como é chamada por alguns indígenas. Conta-se que, por isso, as flores perfumadas e brancas da vitória-régia só se abrem à noite: uma homenagem à Jaci, a deusa Lua. E, ao nascer do sol, as flores ficam rosadas, como o rosto da [...] guerreira Naiá.' },
      { t: 'fonte', texto: 'BRASIL. Ministério da Educação. Secretaria de Alfabetização. A lenda da Vitória-Régia. Disponível em: https://alfabetizacao.mec.gov.br/images/conta-pra-mim/livros/versao_digital/vitoria_regia_versao_digital.pdf. Acesso em: 17 fev. 2025. (Adaptado). Acesso em: 17 fev. 2025. (Adaptado)' },
    ]),
    carta('lp-a15c', '🌸', 'Lenda', 15, [
      { t: 'quadro', texto: 'O texto que você leu é uma lenda, história que as pessoas contam há muitos anos. Ela mistura partes inventadas e fantásticas com fatos que podem ter acontecido de verdade. As lendas ajudam a explicar o mundo, além de ensinar lições e costumes que passam de geração para geração.' },
    ]),
    carta('lp-a16', '💬', 'Dois-pontos, travessão e aspas (1 de 2)', 16, [
      { t: 'texto', texto: 'Quando a lenda é escrita, precisamos usar sinais de pontuação. Além das pontuações que você já conhece, existem o dois-pontos (:), o travessão (—) e as aspas (" ").' },
      { t: 'quadro', titulo: 'Dois-pontos', texto: 'São usados para indicar que algo importante vem a seguir no texto. Podem aparecer' },
      { t: 'lista', itens: [
        { termo: 'antes da fala de um personagem.', texto: 'Exemplo: "No entanto, os anciões da aldeia alertavam:' },
      ] },
      { t: 'fala', texto: 'Naiá, as moças são transformadas em estrelas depois que são tocadas pela formosa deusa. Não tem volta, Naiá!".' },
      { t: 'lista', itens: [
        { termo: 'antes de uma lista.', texto: 'Exemplo: "Alguns exemplos de lenda são: Iara e Saci".' },
        { termo: 'antes de uma explicação.', texto: 'Exemplo: Existem muitas lendas famosas, como a do Boitatá: uma cobra de fogo que protege a natureza.' },
      ] },
    ]),
    carta('lp-a16b', '💬', 'Dois-pontos, travessão e aspas (2 de 2)', 16, [
      { t: 'quadro', titulo: 'Travessão', texto: 'É usado para mostrar quando um personagem está falando em uma história. Nos contos, o travessão aparece nos diálogos, ajudando a entender quem está conversando. Exemplo: "— Naiá, as moças são transformadas em estrelas depois que são tocadas pela formosa deusa. Não tem volta, Naiá!"' },
      { t: 'quadro', titulo: 'Aspas', texto: 'São usadas principalmente para destacar palavras, expressões ou citações. As aspas também servem para marcar nomes de livros, filmes e outros títulos. Exemplo: "A vitória-régia, também chamada de "mumuru", tem flores que só se abrem à noite."' },
    ]),

    // Organizando o conhecimento: a lenda (pp. 17 a 19)
    carta('lp-a17', '📝', ORGANIZANDO, 17, [
      { t: 'texto', texto: 'Questões 1 a 4 sobre A lenda da Vitória-Régia: quem são Naiá e Jaci, onde a lenda acontece, a ordem dos acontecimentos e os outros nomes da vitória-régia.' },
    ]),
    carta('lp-a18', '📝', ORGANIZANDO, 18, [
      { t: 'texto', texto: 'Questões 5 a 8: por que as flores da vitória-régia se abrem à noite e ficam rosadas quando o Sol nasce, frases verdadeiras ou falsas e os sinais de pontuação da lenda.' },
    ]),
    carta('lp-a19', '📝', ORGANIZANDO, 19, [
      { t: 'texto', texto: 'Naiá viveu muitas aventuras tentando realizar o seu sonho de se tornar uma estrela no céu. Em uma história, as ações dos personagens podem causar consequências. Veja um exemplo.' },
      { t: 'tabela', cab: ['Ação', 'Consequência'], linhas: [
        ['Naiá ficava noites acordada, subindo nos galhos das árvores para tentar alcançar Jaci.', 'Naiá ficou enfraquecida.'],
      ] },
    ]),

    // Marcadores temporais e espaciais (pp. 20 a 22)
    carta('lp-a20', '⏳', 'Marcadores temporais e espaciais (1 de 2)', 20, [
      { t: 'texto', texto: 'Releia um trecho de A lenda da Vitória-Régia.' },
      { t: 'quadro', texto: 'Há muitos e muitos anos, em certas noites, a Lua, chamada de Jaci por alguns indígenas, aparecia com todo o seu esplendor para iluminar uma aldeia na Amazônia brasileira.' },
      { t: 'texto', texto: 'Em uma narrativa, algumas palavras indicam quando os fatos acontecem. Essas palavras são chamadas de marcadores temporais. Veja alguns exemplos.' },
      { t: 'quadro', titulo: 'Marcadores temporais', texto: 'naquele tempo – depois – passados alguns dias – era uma vez – logo em seguida – nesse momento – certa época – frequentemente – no mesmo instante – no dia seguinte' },
    ]),
    carta('lp-a20b', '🧭', 'Marcadores temporais e espaciais (2 de 2)', 20, [
      { t: 'texto', texto: 'Agora, releia outro trecho da lenda.' },
      { t: 'quadro', texto: 'Viu, então, na superfície, a imagem da deusa: a Lua estava bem ali, ao seu alcance, refletida no espelho d\'água.' },
      { t: 'texto', texto: 'Algumas palavras marcam o espaço onde uma história acontece. Elas são chamadas de marcadores espaciais. Veja alguns exemplos.' },
      { t: 'quadro', titulo: 'Marcadores espaciais', texto: 'onde – atrás – em frente – embaixo – dentro de – entre – ali – ao lado – acima – aqui – perto' },
    ]),
    carta('lp-a21', '📝', ORGANIZANDO, 21, [
      { t: 'texto', texto: 'Questões 1 e 2: contornar marcadores temporais e espaciais em trechos da lenda e os marcadores espaciais de algumas frases.' },
    ]),
    carta('lp-a22', '📝', ORGANIZANDO, 22, [
      { t: 'texto', texto: 'Questões 3 e 4: escolher o marcador temporal que completa cada frase e separar os marcadores temporais dos espaciais.' },
    ]),

    // Saberes em ação: produção escrita, reconto (pp. 23 a 26)
    carta('lp-a23', '✍️', 'Produção escrita: reconto', 23, [
      { t: 'texto', texto: 'Uma história pode ser diferente quando é recontada, ou seja, quando uma pessoa que já conhece a história decide contá-la do próprio jeito. Os detalhes e os acontecimentos podem mudar, também podem aparecer novos personagens. Tudo isso é possível!' },
      { t: 'texto', texto: 'Podem ser usadas duas estratégias ao recontar uma história.' },
      { t: 'lista', itens: [
        { texto: 'Inventar novos acontecimentos para uma história que já existe.' },
        { texto: 'Recontar a história com suas próprias palavras, sem mudar o que acontece nela.' },
      ] },
      { t: 'texto', texto: 'Agora, você vai escrever um reconto! Para começar, escolha uma dessas estratégias.' },
    ]),
    carta('lp-a24', '📋', 'Preparação', 24, [
      { t: 'texto', texto: 'Antes de escrever o seu reconto, é importante planejar o que acontecerá em cada parte da história. Para isso, siga este passo a passo.' },
      { t: 'lista', itens: [
        { termo: '1.', texto: 'Com colegas e o professor, selecione alguns contos que a turma mais gosta ou conhece.' },
        { termo: '2.', texto: 'Escolha o conto que você mais gostou.' },
        { termo: '3.', texto: 'Preencha as linhas com as informações do conto que você escolheu.' },
      ] },
    ]),
    carta('lp-a25', '📝', 'Primeira produção', 25, [
      { t: 'texto', texto: 'Depois de escolher seu conto e identificar as informações e características dele, é o momento de recontar essa história do seu jeito!' },
      { t: 'texto', texto: 'Em seu caderno, escreva o reconto. Lembre-se de algumas informações importantes antes de iniciar a escrita.' },
      { t: 'lista', itens: [
        { termo: 'Título', texto: 'qual é o título do seu reconto? Pode ser o mesmo da versão original ou um criado por você.' },
        { termo: 'Introdução', texto: 'quem são os personagens? Apresente todos eles. Onde e quando a história acontece?' },
        { termo: 'Desenvolvimento', texto: 'o que acontece na história? Quais são as ações dos personagens? Os acontecimentos serão diferentes na sua versão?' },
        { termo: 'Clímax', texto: 'qual é a parte mais emocionante da história?' },
        { termo: 'Desfecho', texto: 'como o seu reconto termina?' },
      ] },
    ]),
    carta('lp-a25b', '📌', 'Dica importante!', 25, [
      { t: 'quadro', texto: 'Caso você decida mudar alguma parte do conto, pense se essa mudança faz sentido com a introdução e com o fim da história.' },
    ]),
    carta('lp-a26', '✅', 'Avaliação', 26, [
      { t: 'texto', texto: 'Agora que você criou a primeira versão do seu reconto, confira se cumpriu os critérios a seguir.' },
      { t: 'tabela', cab: ['Critério', 'Sim', 'Não', 'Pode melhorar'], linhas: [
        ['Criou um reconto com base em uma história que já existe?', '', '', ''],
        ['Organizou o reconto com introdução, desenvolvimento e desfecho?', '', '', ''],
        ['Incluiu um momento de clímax na história?', '', '', ''],
        ['Apresentou os personagens, o tempo e o local onde a história ocorre?', '', '', ''],
      ] },
      { t: 'texto', texto: 'Se você marcou algum X em não ou em pode melhorar, faça as mudanças necessárias antes de escrever a versão final do seu reconto.' },
    ]),
    carta('lp-a26b', '🎨', 'Produção final', 26, [
      { t: 'texto', texto: 'Para escrever a versão final do seu reconto, siga estas instruções.' },
      { t: 'lista', itens: [
        { texto: 'Escreva seu texto com dedicação e capricho em uma folha de papel sulfite.' },
        { texto: 'Releia o que você escreveu para ver se o texto está claro e organizado.' },
        { texto: 'Faça um desenho para ilustrar seu reconto! Use lápis de cor, gizes de cera ou canetinhas para deixar sua ilustração colorida e chamativa!' },
      ] },
    ]),

    // Testando as ideias: João e o pé de feijão (pp. 27 a 29)
    carta('lp-a27', '🫘', 'João e o pé de feijão (1 de 3)', 27, [
      { t: 'quadro', titulo: 'Testando as ideias', texto: 'Leia o trecho de João e o pé de feijão a seguir.' },
      { t: 'texto', texto: 'Era uma vez uma viúva e seu único filho, João. Viviam na roça, numa casinha bem simples.' },
      { t: 'texto', texto: 'Enfrentavam tempos difíceis, já que os dois não tinham dinheiro para comprar comida.' },
      { t: 'fala', texto: 'Querido, acabou o arroz, o feijão e todos os mantimentos. Pegue a nossa vaquinha, vá até a cidade e venda o único bem que ainda temos.' },
      { t: 'texto', texto: 'João ficou bem triste, mas não havia outro jeito de se alimentarem. No caminho, ele conheceu um homem que lhe fez a seguinte proposta:' },
    ]),
    carta('lp-a27b', '🫘', 'João e o pé de feijão (2 de 3)', 27, [
      { t: 'fala', texto: 'Criança, dê-me a sua vaquinha, que lhe dou estes sete grãos de feijão. É uma boa troca, porque são mágicos.' },
      { t: 'texto', texto: 'O menino acreditou, fez a troca e voltou para casa com as sementes.' },
      { t: 'texto', texto: 'Quando a mãe descobriu o que havia acontecido, ficou furiosa e jogou os feijões pela janela.' },
      { t: 'texto', texto: 'Naquele mesmo dia, os dois foram dormir com fome, pois já não tinham nada para comer.' },
      { t: 'texto', texto: 'Pela manhã, após o galo cantar, João se levantou, olhou pela janela do quarto e viu uma enorme árvore, que antes não existia no quintal.' },
    ]),
    carta('lp-a27c', '🫘', 'João e o pé de feijão (3 de 3)', 27, [
      { t: 'texto', texto: 'O menino correu até lá. Os grãos germinaram, e ali nascera um enorme pé de feijão.' },
      { t: 'texto', texto: 'O tronco era espesso; as raízes eram grossas; e os galhos se entrelaçavam.' },
      { t: 'texto', texto: 'Olhou para cima e avistou que a planta ia até o céu. Ele não podia acreditar... Criou coragem e decidiu subir. Foi escalando, escalando, até as nuvens, onde encontrou um bonito castelo. [...]' },
      { t: 'fonte', texto: 'BRASIL. Ministério da Educação. João e o Pé de Feijão. Brasília, DF: MEC/Sealf, 2020. Disponível em: https://alfabetizacao.mec.gov.br/images/conta-pra-mim/livros/versao_digital/joao_pe_de_feijao_versao_digital.pdf. Acesso em: 21 fev. 2025.' },
    ]),
    carta('lp-a28', '📝', 'Testando as ideias', 28, [
      { t: 'texto', texto: 'Questões 1 a 6 sobre o trecho de João e o pé de feijão: o problema de João e da mãe, a vaquinha, a troca, a reação da mãe, a consequência e os marcadores do texto.' },
    ]),
    carta('lp-a29', '🌟', 'Agora você já sabe...', 29, [
      { t: 'texto', texto: 'Questão 7: completar diálogos com ponto-final, ponto de interrogação, ponto de exclamação, travessão, dois-pontos ou aspas.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', texto: 'Já sei – Preciso saber mais – Ainda não sei', itens: [
        { texto: 'Ler e entender o que são contos e lendas.' },
        { texto: 'Identificar as partes de um conto ou de uma lenda: introdução, desenvolvimento, clímax e desfecho.' },
        { texto: 'Reconhecer os sinais de pontuação e saber para que eles servem: ponto-final, ponto de exclamação, ponto de interrogação, aspas, travessão e dois-pontos.' },
        { texto: 'Identificar marcadores temporais e espaciais em um texto.' },
      ] },
    ]),
  ]);
})();
