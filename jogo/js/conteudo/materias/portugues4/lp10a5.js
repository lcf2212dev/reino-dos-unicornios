/* Sala lp10a5 (Livro de Aprendizagem, capítulo 10, pp. 20 a 22): marcadores temporais (quando) e espaciais (onde),
   com trechos de A lenda da Vitória-Régia. */
Reino.registrarSala('portugues4',
    {
      id: 'lp10a5', nome: 'Quando e onde?', emoji: '⏳',
      livroOrigem: 'aprendizagem', capitulo: 10, paginas: 'pp. 20 a 22', ordem: 'livro',
      cartas: ['lp-a20', 'lp-a20b', 'lp-a21', 'lp-a22'],
      intro: 'Algumas palavras contam quando e onde a história acontece. Vamos caçar essas palavras?',
      desafios: [
        { id: 'lp10a5-01', tipo: 'marcar', origem: 'APR-20-qA', pagina: 20, livro: 'lp-a20', marca: 'circular',
          pergunta: 'Existe alguma palavra ou expressão no trecho que mostra quando as situações narradas aconteceram? Toque nelas.',
          texto: '{Há muitos e muitos anos}, {em certas noites}, a Lua, chamada de Jaci por alguns indígenas, aparecia com todo o seu esplendor para iluminar uma aldeia na Amazônia brasileira.',
          adaptacao: 'A conversa oral virou tocar no trecho as expressões que mostram quando.',
          explica: '"Há muitos e muitos anos" e "em certas noites" mostram quando a história aconteceu. São marcadores temporais!' },
        { id: 'lp10a5-02', tipo: 'marcar', origem: 'APR-20-qB', pagina: 20, livro: 'lp-a20b', marca: 'circular',
          pergunta: 'No trecho, você consegue encontrar alguma palavra ou expressão que mostra onde os personagens estão? Toque nelas.',
          texto: 'Viu, então, {na superfície}, a imagem da deusa: a Lua estava {bem?} {ali}, {ao seu alcance|?}, refletida {no espelho d\'água}.',
          adaptacao: 'A conversa oral virou tocar no trecho as expressões que mostram onde.',
          explica: '"Na superfície", "ali" e "no espelho d\'água" mostram onde a Lua estava. "Ao seu alcance" também vale. São marcadores espaciais!' },
        { id: 'lp10a5-03', tipo: 'marcar', origem: 'APR-21-q1', pagina: 21, livro: 'lp-a20b', marca: 'circular',
          pergunta: 'Leia os trechos a seguir. Depois, contorne-os conforme a legenda.',
          cores: [{ nome: 'Marcadores espaciais', cor: '#3f7cff' }, { nome: 'Marcadores temporais', cor: '#ff4f5e' }],
          texto: '{Há muitos e muitos anos|1}, {em certas noites|1}, a Lua, chamada de Jaci por indígenas, aparecia com todo o seu esplendor para iluminar uma aldeia {na Amazônia brasileira|0}.\n' +
            'Sabia-se que Jaci, {quando se escondia|1?} {atrás das montanhas|0}, {sempre|1} levava consigo algumas jovens e as transformava em estrelas {no céu|0}.\n' +
            '{Uma noite|1}, tendo parado para descansar {após longa caminhada|1?}, Naiá sentou-se {à beira de um lago|0}. Viu, {então|1}, {na superfície|0}, a imagem [...]: a Lua estava {bem|0?} {ali|0}, {ao seu alcance|0?}, refletida {no espelho d\'água|0}.',
          explica: 'Temporais (quando): "Há muitos e muitos anos", "em certas noites", "sempre", "Uma noite", "então". Espaciais (onde): "na Amazônia brasileira", "atrás das montanhas", "no céu", "à beira de um lago", "na superfície", "ali", "no espelho d\'água".' },
        { id: 'lp10a5-04', tipo: 'marcar', origem: 'APR-21-q2', pagina: 21, livro: 'lp-a20b', marca: 'circular',
          pergunta: 'Leia as frases a seguir. Depois, contorne os marcadores espaciais usados em cada frase.',
          texto: 'a) {Onde} Patrícia deixou os lápis de cor?\n' +
            'b) Daniela e Karina irão se encontrar {na livraria}.\n' +
            'c) O apartamento de Joaquim fica {ao lado} {do banco|?}.\n' +
            'd) O bebedouro fica {perto} {do parquinho infantil|?}.\n' +
            'e) Rebeca pegou a batedeira {em cima} {do armário|?}.\n' +
            'f) O gato de Bianca ficou preso {para fora} {de casa|?}.',
          explica: 'Os marcadores espaciais mostram onde: "Onde", "na livraria", "ao lado", "perto", "em cima" e "para fora".' },
        { id: 'lp10a5-05', tipo: 'marcar', origem: 'APR-22-q3', pagina: 22, livro: 'lp-a20', marca: 'circular',
          pergunta: 'Circule o marcador temporal que completa cada frase a seguir.',
          texto: 'a) ({Ontem} / Durante) fiz um passeio de bicicleta.\n' +
            'b) A turma da professora Tânia vai visitar o zoológico ({na próxima semana} / no ano passado).\n' +
            'c) Gabriela disse que comprará os presentes (desde ontem / {hoje}).\n' +
            'd) Eles chegaram ao trabalho (sempre / {na mesma hora}).\n' +
            'e) Pâmela contou uma novidade ({durante} / em breve) o jantar.',
          explica: '"Ontem fiz um passeio", "vai visitar na próxima semana", "comprará hoje", "chegaram na mesma hora" e "durante o jantar". O marcador combina com o tempo da frase!' },
        { id: 'lp10a5-06', tipo: 'separar', origem: 'APR-22-q4', pagina: 22, livro: 'lp-a20',
          pergunta: 'Ligue cada palavra a seguir ao quadro correto: marcadores temporais ou marcadores espaciais.',
          grupos: [{ e: '⏳', t: 'Marcadores temporais', dica: 'quando' }, { e: '🧭', t: 'Marcadores espaciais', dica: 'onde' }],
          itens: [
            { t: 'onde', g: 1 },
            { t: 'sempre', g: 0 },
            { t: 'ali', g: 1 },
            { t: 'amanhã', g: 0 },
            { t: 'após', g: 0 },
            { t: 'embaixo', g: 1 },
            { t: 'há muitos anos', g: 0 },
            { t: 'perto', g: 1 },
            { t: 'atrás', g: 1 },
            { t: 'de repente', g: 0 },
          ],
          adaptacao: 'Ligar cada palavra a um dos dois quadros virou separar as palavras nos dois quadros.',
          explica: 'Temporais (quando): sempre, amanhã, após, há muitos anos, de repente. Espaciais (onde): onde, ali, embaixo, perto, atrás.' },
      ],
    });
