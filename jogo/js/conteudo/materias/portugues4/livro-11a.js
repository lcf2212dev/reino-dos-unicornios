/* Cartas do Livro de Aprendizagem, Capítulo 11 "Quem canta..." (pp. 30 a 54), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; as letras de canção vêm inteiras,
   em cartas de até 16 versos. Página só de questões: carta curta com o título da seção e o que ela pede.
   Decisão: "o/um artista" e "a/uma artista" (p. 37) viraram "o ou um" e "a ou uma", para a voz não ler a barra. */
(function () {
  var L = 'aprendizagem', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  var CONVERSE = 'Converse com os colegas e o professor.';
  var REFRAO = ['Eu sou o rei da floresta', 'Conheço tudo por aqui', 'Eu ando por tudo, correndo e caçando', 'Tem tanto bicho que eu já vi'];
  var ELEFANTE = ['Já vi um elefante', 'Bem grande, muito grande', 'Tomando água pelo nariz', 'E quando ele espirra a água pra fora', 'Parece um chafariz'];
  var MACACO = ['Já vi um macaco marrom', 'Pulando de galho em galho', 'Comendo banana', 'Coçando a cabeça', 'E procurando um atalho'];
  var FONTE_REI = 'REI da Floresta. Publicado pelo canal Turminha Paraíso. 1 vídeo (3 min). Disponível em: https://www.youtube.com/watch?v=qbLRNSBs5PU. Acesso em: 18 fev. 2025.';
  function itens(lista) { return lista.map(function (t) { return { texto: t }; }); }

  Reino.registrarCartas('portugues4', [
    // abertura, Conversa vai... e Conversa vem... (pp. 30 e 31)
    carta('lp-a30', '🎵', 'Capítulo 11 – Quem canta...', 30, [
      { t: 'ilustracao', id: 'lp-11-musical', alt: 'Cena de teatro musical: num palco com arcos verdes, uma moça de vestido rosa dança de mãos dadas com uma personagem de pele verde e chapéu de bruxa, entre dançarinos de roupas coloridas.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: itens([
        'O que você vê na imagem?',
        'Considerando as roupas e as expressões dos personagens, sobre o que você acha que é essa apresentação?',
        'Imagine que está tocando uma música nessa cena. Qual tipo de música combina com ela?',
      ]) },
    ]),
    carta('lp-a31', '💬', 'Conversa vem...', 31, [
      { t: 'texto', texto: 'A imagem da página anterior é da peça de teatro musical «Wicked», que conta a história de duas bruxas que estudam juntas. No teatro musical, as músicas fazem parte da história e geralmente mostram o que os personagens estão sentindo.' },
      { t: 'quadro', itens: itens([
        'Qual é o nome da sua música favorita?',
        'Sobre o que é essa música?',
        'Por que essa música é especial para você? Conte aos colegas e ouça o que eles tem a dizer.',
        'Faça um desenho que represente a sua música favorita.',
      ]) },
    ]),

    // Letra de canção: Rei da Floresta (p. 32), inteira
    carta('lp-a32', '🎵', 'Rei da Floresta (1 de 3)', 32, [
      { t: 'quadro', titulo: 'Letra de canção', texto: 'Leia a letra da canção e, depois, cante junto aos colegas e ao professor com muito ritmo e animação!' },
      { t: 'versos', versos: REFRAO.concat([''], ELEFANTE, [''], REFRAO) },
    ]),
    carta('lp-a32b', '🎵', 'Rei da Floresta (2 de 3)', 32, [
      { t: 'versos', versos: MACACO.concat([''],
        ['Pra escapar da girafa', 'Que queria pegar seu lanche', 'A boca dela alcança a comida dos outros', 'Com aquele pescoço gigante'],
        [''], REFRAO) },
    ]),
    carta('lp-a32c', '🎵', 'Rei da Floresta (3 de 3)', 32, [
      { t: 'versos', versos: [
        'E quando olhei bem para cima', 'Vi uma arara voando', 'Toda colorida, tão bonita', 'E eu acho que ela tava falando', '',
        'E quando olhei para o chão', 'Vi a tartaruga, que não voa não', 'Bem devagarinho ela caminha', 'E o casco é a sua casinha', '',
      ].concat(REFRAO) },
      { t: 'fonte', texto: FONTE_REI },
    ]),

    // as partes da letra de canção e o eu lírico (p. 33)
    carta('lp-a33', '🎶', 'As partes da letra de canção', 33, [
      { t: 'quadro', titulo: CONVERSE, itens: itens([
        'Sobre o que é a letra dessa canção?',
        'Que animal é o rei da floresta?',
        'Qual é a parte da canção que se repete?',
      ]) },
      { t: 'texto', texto: 'As canções fazem parte do nosso dia a dia. Podemos ouvi-las na televisão, na «internet», no rádio e até mesmo na rua. As letras de canção têm partes importantes. Observe a seguir.' },
    ]),
    carta('lp-a33b', '🎶', 'As partes da letra de canção (1 de 2)', 33, [
      { t: 'lista', itens: [{ termo: 'VERSO:', texto: 'é o nome dado a cada linha da letra de uma canção.' }] },
      { t: 'texto', texto: 'REFRÃO' },
      { t: 'versos', versos: REFRAO.concat([''], ELEFANTE) },
      { t: 'lista', itens: [{ termo: 'ESTROFE:', texto: 'é um grupo de versos.' }] },
    ]),
    carta('lp-a33c', '🎶', 'As partes da letra de canção (2 de 2)', 33, [
      { t: 'versos', versos: REFRAO },
      { t: 'lista', itens: [
        { termo: 'REFRÃO:', texto: 'é uma estrofe que se repete na canção e que costuma ser fácil de lembrar e cantar.' },
        { termo: 'RIMA:', texto: 'é a repetição de sons ao final dos versos, que deixa as canções mais fáceis de memorizar.' },
      ] },
    ]),
    carta('lp-a33d', '🎶', 'O eu lírico', 33, [
      { t: 'texto', texto: 'Quando ouvimos uma canção, percebemos que alguém está expressando emoções ou contando histórias. Esse "alguém" não é o autor da canção, e sim uma voz que dá vida às palavras. Essa voz é chamada de eu lírico.' },
      { t: 'texto', texto: 'Por exemplo, a música Rei da Floresta é cantada pela Turminha Paraíso, porém o eu lírico é o leão, personagem que conta a história da letra.' },
      { t: 'figuras', itens: [{ img: 'lp:11-leao', legenda: 'o leão' }] },
    ]),

    // Organizando o conhecimento (pp. 34 a 36)
    carta('lp-a34', '✏', ORGANIZANDO + ' (1 de 2)', 34, [
      { t: 'quadro', titulo: ORGANIZANDO, itens: [
        { termo: '1.', texto: 'Sobre a letra da canção Rei da Floresta, responda aos itens a seguir.' },
        { termo: 'a)', texto: 'Qual é o tema da canção?' },
        { termo: 'b)', texto: 'Qual animal é o rei da floresta? Desenhe-o no espaço abaixo.' },
        { termo: '2.', texto: 'Quantas estrofes essa canção tem? 10 estrofes – 9 estrofes – 8 estrofes' },
      ] },
    ]),
    carta('lp-a34b', '✏', ORGANIZANDO + ' (2 de 2)', 34, [
      { t: 'quadro', itens: [
        { termo: '3.', texto: 'Volte à página em que a letra da canção está. Depois, resolva os itens.' },
        { termo: '•', texto: 'Numere cada verso da letra da canção.' },
        { termo: '•', texto: 'Pinte o quadro que mostra a quantidade de versos que a canção tem. 35 versos – 38 versos – 40 versos' },
        { termo: '4.', texto: 'Agora, pinte as palavras que rimam em cada estrofe da canção. Lembre-se: as palavras que rimam terminam com o mesmo som.' },
        { termo: '5.', texto: 'Copie, a seguir, o refrão da canção.' },
      ] },
    ]),
    carta('lp-a35', '🎵', 'Música e canção', 35, [
      { t: 'figuras', itens: [
        { img: 'lp:11-elefante', legenda: 'elefante' }, { img: '🐒', legenda: 'macaco' }, { img: 'lp:11-girafa', legenda: 'girafa' },
        { img: '🦜', legenda: 'arara' }, { img: '🐢', legenda: 'tartaruga' },
      ] },
      { t: 'quadro', titulo: 'Você sabe a diferença entre música e canção?', itens: itens([
        'Música é quando vários sons – como batidas, vozes e instrumentos – são unidos e formam uma melodia, ou seja, algo bom de ouvir. Esse é o termo mais geral, que normalmente usamos.',
        'Já a canção é um tipo de música que tem uma letra, ou seja, a canção é uma música feita para ser cantada.',
      ]) },
    ]),
    carta('lp-a36', '🐒', 'Rei da Floresta (trecho)', 36, [
      { t: 'texto', texto: 'Releia um trecho da canção Rei da Floresta. Depois, responda aos itens.' },
      { t: 'versos', versos: MACACO },
      { t: 'fonte', texto: FONTE_REI },
    ]),

    // Gêneros do substantivo: masculino e feminino (pp. 37 a 40)
    carta('lp-a37', '👑', 'Gêneros do substantivo: masculino e feminino', 37, [
      { t: 'quadro', texto: 'A palavra macaco aparece no primeiro verso da quarta estrofe da canção Rei da Floresta. Como se chama a fêmea do macaco?' },
      { t: 'texto', texto: 'Os substantivos são as palavras que usamos para dar nome às coisas, às pessoas, aos animais e aos objetos. Eles podem ser do gênero masculino ou do gênero feminino.' },
      { t: 'lista', itens: itens([
        'A maioria dos substantivos femininos terminam com a letra A. Exemplos: macaca, rata.',
        'A maioria dos substantivos masculinos terminam com a letra O. Exemplos: macaco, rato.',
      ]) },
    ]),
    carta('lp-a37b', '👑', 'A palavra que vem antes', 37, [
      { t: 'texto', texto: 'Outra forma de saber se um substantivo é masculino ou feminino é observar a palavra que vem antes dele.' },
      { t: 'lista', itens: itens([
        'Substantivos femininos costumam vir depois de a ou uma. Exemplos: a leoa, uma tigresa.',
        'Substantivos masculinos costumam vir depois de o ou um. Exemplos: o leão, um urso.',
      ]) },
      { t: 'figuras', itens: [
        { img: 'lp:11-galo', legenda: 'o galo' }, { img: 'lp:11-galinha', legenda: 'a galinha' },
        { img: 'lp:11-leao', legenda: 'o leão' }, { img: 'lp:11-leoa', legenda: 'a leoa' },
        { img: 'lp:11-ovelha', legenda: 'a ovelha' }, { img: 'lp:11-bode', legenda: 'o bode' },
      ] },
    ]),
    carta('lp-a37c', '❗', 'Atenção!', 37, [
      { t: 'quadro', titulo: 'Atenção! Algumas palavras não seguem essa regra.', itens: itens([
        'Existem substantivos que terminam com outras letras, como E, e ainda assim podem ser femininos ou masculinos. Por exemplo: o tigre (masculino) e a ponte (feminino).',
        'Há palavras que podem ser usadas no masculino e no feminino, dependendo da palavra que vem antes delas. É o caso da palavra artista: dizemos o ou um artista para nos referirmos ao masculino e a ou uma artista para nos referirmos ao feminino.',
      ]) },
    ]),
    carta('lp-a38', '✏', ORGANIZANDO, 38, [
      { t: 'quadro', titulo: ORGANIZANDO, itens: itens([
        'Pinte os substantivos de acordo com a legenda.',
        'Complete os quadrinhos com o nome de cada imagem no feminino.',
      ]) },
      { t: 'figuras', itens: [
        { img: '🐱', legenda: 'gato' }, { img: 'lp:11-leao', legenda: 'leão' }, { img: 'lp:11-rei', legenda: 'rei' },
        { img: 'lp:11-avo', legenda: 'avô' }, { img: '🧑‍🏫', legenda: 'professor' },
      ] },
    ]),
    carta('lp-a39', '✏', 'Masculino e feminino', 39, [
      { t: 'quadro', itens: itens([
        'Contorne somente os substantivos femininos.',
        'Leia o texto a seguir. Em cada linha, observe a palavra destacada e insira a palavra correspondente do quadro para fazer o par.',
      ]) },
    ]),
    carta('lp-a40', '✏', 'Masculino e feminino', 40, [
      { t: 'quadro', itens: itens([
        'Reflita se as palavras a seguir aceitam A, O ou qualquer um deles antes delas. Depois, escreva A, O ou A e O no espaço antes de cada palavra.',
        'Enumere os substantivos femininos na coluna da direita de acordo com os substantivos masculinos correspondentes na coluna da esquerda.',
        'Leia as palavras a seguir e circule aquelas que podem ser masculinas e femininas, ou seja, que aceitam A e O antes delas.',
      ]) },
    ]),

    // Graus do substantivo: aumentativo (pp. 41 a 45)
    carta('lp-a41', '🌊', 'Graus do substantivo: aumentativo', 41, [
      { t: 'texto', texto: 'Leia o trecho da letra de canção a seguir.' },
      { t: 'texto', texto: 'Fundo do mar' },
      { t: 'versos', versos: [
        'Como é legal lá no fundo do mar,', 'no fundo do mar, água de montão.', 'Peixes, peixinhos, peixões a nadar,', 'formando um grande coração.', '',
        'A maré é mansa,', 'eu quero ver quem dança', 'a dança das estrelinhas.', 'Quem sabe essa questão:', 'quantos dentes tem o tubarão?',
      ] },
      { t: 'fonte', texto: 'MUNDO Bita. Fundo do mar. Disponível em: https://www.letras.mus.br/mundo-bita/fundo-do-mar/. Acesso em: 19 fev. 2025.' },
    ]),
    carta('lp-a41b', '💬', 'Fundo do mar: converse', 41, [
      { t: 'quadro', titulo: CONVERSE, itens: itens([
        'Qual palavra foi usada para indicar que tem muita água no fundo do mar?',
        'Qual palavra foi usada para indicar que tem peixes grandes a nadar?',
      ]) },
    ]),
    carta('lp-a41c', '🌊', 'O grau aumentativo', 41, [
      { t: 'quadro', itens: itens([
        'Os substantivos podem variar em grau. O grau aumentativo é usado para mostrar que algo é muito grande ou para dar mais intensidade a uma ideia.',
        'A maioria dos substantivos no grau aumentativo termina em -ÃO ou -ONA. Exemplos: amigão, amigona.',
        'Mas algumas palavras podem ter outras terminações, como: -AÇO, -ALHÃO, -ARRA, -EIRÃO, -ÁZIO etc.',
      ]) },
    ]),
    carta('lp-a42', '🌊', 'Aumentativo: exemplos', 42, [
      { t: 'texto', texto: 'Veja os exemplos a seguir.' },
      { t: 'tabela', cab: ['Grau normal', 'Grau aumentativo'], linhas: [['casa', 'casarão'], ['garoto', 'garotão'], ['mãe', 'mãezona'], ['garota', 'garotona']] },
      { t: 'quadro', texto: 'Mas atenção! Nem toda palavra terminada em -ÃO está no aumentativo.' },
      { t: 'quadro', titulo: CONVERSE, itens: itens(['Quais palavras do trecho da canção terminam em -ÃO mas não estão no grau aumentativo?']) },
    ]),
    carta('lp-a42b', '💬', 'Carinho, admiração e exagero', 42, [
      { t: 'texto', texto: 'O aumentativo nem sempre mostra que algo é grande. Ele também pode expressar exagero, crítica ou sentimentos, como carinho e admiração. Observe a seguir.' },
      { t: 'texto', texto: 'Carinho' },
      { t: 'fala', texto: 'Você é meu amigão!' },
      { t: 'texto', texto: 'Admiração' },
      { t: 'fala', texto: 'Nossa, o seu casaco é bonitão!' },
      { t: 'texto', texto: 'Exagero: uma menina fala com a amiga, que segura um bolo. A menina diz:' },
      { t: 'fala', quem: 'a menina', texto: 'Que bolão você pegou!' },
      { t: 'texto', texto: 'E a amiga responde:' },
      { t: 'fala', quem: 'a amiga', texto: 'Comprei para dividirmos!' },
    ]),
    carta('lp-a43', '✏', ORGANIZANDO, 43, [
      { t: 'quadro', titulo: ORGANIZANDO, itens: itens([
        'Marque um X nas palavras que estão no grau aumentativo.',
        'Ligue cada substantivo à sua forma no aumentativo.',
      ]) },
    ]),
    carta('lp-a44', '✏', 'Aumentativo', 44, [
      { t: 'quadro', itens: itens([
        'Reescreva as frases trocando a palavra destacada pelo seu aumentativo.',
        'Qual é o aumentativo das palavras a seguir? Cole cada palavra da aba recortável no espaço correto.',
      ]) },
      { t: 'quadro', titulo: 'Aba recortável', texto: 'carrão – olhão – casona – janelona – pedregulho – barracão' },
    ]),
    carta('lp-a45', '✏', 'Aumentativo', 45, [
      { t: 'quadro', itens: itens([
        'Encontre e pinte a frase que usa o aumentativo para mostrar admiração.',
        'Leia as dicas e descubra quais são as palavras no aumentativo.',
      ]) },
      { t: 'quadro', texto: 'pezão – garrafona – colheraça – vozeirão' },
    ]),

    // Graus do substantivo: diminutivo (pp. 46 a 49)
    carta('lp-a46', '🐣', 'Graus do substantivo: diminutivo', 46, [
      { t: 'texto', texto: 'Releia o trecho da canção Fundo do mar.' },
      { t: 'versos', versos: [
        'Peixes, peixinhos, peixões a nadar,', 'formando um grande coração.', '',
        'A maré é mansa,', 'eu quero ver quem dança', 'a dança das estrelinhas.', 'Quem sabe essa questão:', 'Quantos dentes tem o tubarão?',
      ] },
      { t: 'quadro', itens: itens([
        'Quando queremos dizer que algo é menor do que o tamanho original, usamos os substantivos no grau diminutivo. Exemplos: flor → florzinha; cadeira → cadeirinha.',
        'As palavras no grau diminutivo terminam em -INHO, -INHA, -ZINHO, -ZINHA.',
      ]) },
    ]),
    carta('lp-a46b', '🐣', 'Para que serve o diminutivo (1 de 2)', 46, [
      { t: 'texto', texto: 'Além de mostrar que algo é pequeno, o grau diminutivo é usado para expressar algumas ideias. Veja os exemplos a seguir.' },
      { t: 'lista', itens: [
        { termo: 'Afetividade ou carinho', texto: '– Exemplo: Que fofinho esse gatinho!' },
        { termo: 'Desprezo ou ironia', texto: '– Exemplo: Esse projetinho não vai dar certo.' },
        { termo: 'Delicadeza ou suavidade', texto: '– Exemplo: Vou tomar só um cafezinho.' },
      ] },
    ]),
    carta('lp-a46c', '🐣', 'Para que serve o diminutivo (2 de 2)', 46, [
      { t: 'lista', itens: [
        { termo: 'Intensidade ou reforço de ideia', texto: '– Exemplo: Está um friozinho gostoso hoje!' },
        { termo: 'Atenuação (minimizar algo)', texto: '– Exemplo: Foi só um errinho, nada grave.' },
      ] },
      { t: 'quadro', texto: 'Algumas palavras terminadas em -INHO não estão no grau diminutivo. Exemplos: vizinho, caminho, ninho.' },
    ]),
    carta('lp-a47', '✏', ORGANIZANDO, 47, [
      { t: 'quadro', titulo: ORGANIZANDO, itens: itens([
        'Ligue as palavras da coluna da esquerda ao seu diminutivo na coluna da direita.',
        'Escreva o diminutivo das palavras a seguir.',
      ]) },
    ]),
    carta('lp-a48', '✏', 'Diminutivo', 48, [
      { t: 'quadro', itens: itens(['Complete os quadrinhos com o nome de cada imagem no diminutivo.']) },
      { t: 'figuras', itens: [
        { img: '💍', legenda: 'anel' }, { img: 'lp:11-mala', legenda: 'mala' }, { img: '🚗', legenda: 'carro' }, { img: '✋', legenda: 'mão' },
        { img: '📖', legenda: 'livro' }, { img: 'palavra:olho', legenda: 'olho' }, { img: '🏺', legenda: 'vaso' }, { img: 'lp:11-leao', legenda: 'leão' },
      ] },
    ]),
    carta('lp-a49', '✏', 'Diminutivo', 49, [
      { t: 'quadro', itens: itens([
        'Leia as frases a seguir e contorne somente as palavras no diminutivo que indicam algo pequeno. Dica: nem todas as frases têm palavras no diminutivo.',
        'Use as dicas entre parênteses para completar o texto.',
      ]) },
    ]),

    // Saberes em ação: paródia musical (pp. 50 a 52)
    carta('lp-a50', '🎶', 'Saberes em ação: paródia musical', 50, [
      { t: 'quadro', titulo: 'Produção: paródia musical', texto: 'Uma paródia musical é uma canção criada com base em outra mais conhecida. A melodia da canção original é mantida na paródia, mas a letra é mudada para expressar novas ideias. Veja o exemplo a seguir.' },
      { t: 'quadro', titulo: 'Letra original', itens: itens(['Ciranda, cirandinha, vamos todos cirandar', 'Vamos dar a meia volta, volta e meia vamos dar']) },
      { t: 'quadro', titulo: 'Letra da paródia', itens: itens(['Ciranda, cirandinha, vamos todos reciclar,', 'Cuidar bem da natureza, para o planeta melhorar']) },
    ]),
    carta('lp-a50b', '🎶', 'Preparação', 50, [
      { t: 'texto', texto: 'Agora é a sua vez de criar uma paródia musical!' },
      { t: 'quadro', titulo: 'Preparação', itens: [
        { termo: '1.', texto: 'Junto aos colegas e ao professor, selecione uma música. Pode ser uma das canções estudadas ao longo do capítulo.' },
        { termo: '2.', texto: 'Preencha o quadro com as informações da paródia que você escreverá.' },
      ] },
    ]),
    carta('lp-a51', '🎶', 'Primeira produção', 51, [
      { t: 'texto', texto: 'Agora que você já planejou a sua paródia, é o momento de produzir. Escreva uma estrofe da letra da canção original e a estrofe da paródia nos espaços abaixo. Lembre-se de organizar a letra em versos e de usar rimas. Depois, cante os versos que você escreveu para ver se a sua paródia combina com a melodia da canção original.' },
    ]),
    carta('lp-a52', '🎶', 'Avaliação', 52, [
      { t: 'texto', texto: 'Agora que você já criou a primeira versão da sua paródia musical, confira se cumpriu os critérios a seguir.' },
      { t: 'quadro', itens: itens([
        'A paródia foi baseada em uma música que já existe?',
        'A letra da paródia está dividida em versos?',
        'A letra da paródia tem rimas?',
        'A paródia tem um tema?',
      ]) },
      { t: 'texto', texto: 'Se você marcou um X em não ou pode melhorar, faça as mudanças necessárias antes de escrever a versão final da sua paródia.' },
    ]),
    carta('lp-a52b', '🎶', 'Produção final', 52, [
      { t: 'texto', texto: 'É hora de escrever a versão final e ensaiar para a apresentação.' },
      { t: 'lista', itens: [
        { termo: '1.', texto: 'Em uma folha entregue pelo professor, escreva a estrofe da sua letra de canção. Depois, junto aos colegas e ao professor, agende um momento para ensaiar e organizar a apresentação.' },
      ] },
    ]),
    carta('lp-a52c', '🎶', 'A apresentação', 52, [
      { t: 'lista', itens: [
        { termo: '2.', texto: 'No dia da apresentação, lembre-se de cantar de um jeito que todos possam ouvir a sua voz. Você pode também criar uma coreografia para deixar o momento ainda mais especial.' },
        { termo: '3.', texto: 'Cante todos os versos com muita alegria, siga o ritmo a cada palavra cantada e a melodia da canção. E não esqueça: o mais importante é se divertir juntos aos colegas ao som das músicas!' },
      ] },
    ]),

    // Testando as ideias e Agora você já sabe... (pp. 53 e 54)
    carta('lp-a53', '🌳', 'Testando as ideias', 53, [
      { t: 'texto', texto: 'Leia o trecho da letra de canção a seguir.' },
      { t: 'texto', texto: 'Como é verde na floresta' },
      { t: 'versos', versos: [
        'Vem brincar que hoje é festa na floresta,', 'E os bichinhos vão se agitar.',
        'Olhe pra baixo, você nem nota, passa ligeiro, essa é a cobra.', 'Esse é famoso e grandalhão, o rei das selvas é o leão.',
      ] },
      { t: 'fonte', texto: 'COMO é verde na floresta. Publicado pelo canal Mundo Bita. 1 vídeo (2 minutos). Disponível em: https://www.youtube.com/watch?v=2ZB6dQ-Fjho. Acesso em: 20 fev. 2025' },
    ]),
    carta('lp-a54', '📖', 'Agora você já sabe...', 54, [
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: itens([
        'Ler e compreender letras de canção.',
        'Identificar partes da canção, como rimas, versos, estrofes e refrão.',
        'Identificar substantivos femininos e substantivos masculinos.',
        'Reconhecer e escrever palavras no aumentativo e no diminutivo.',
      ]) },
      { t: 'texto', texto: 'Já sei. Preciso saber mais. Ainda não sei.' },
    ]),
  ]);
})();
