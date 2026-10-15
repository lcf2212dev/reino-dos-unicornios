/* Cartas do Livro de Aprendizagem, Capítulo 12 "O visual do poema" (pp. 55 a 80), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra (os erros do próprio livro ficam
   como estão); poema longo vira cartas seguidas. Os poemas visuais são ilustrações (ilustracoes-12.js) e o texto
   deles vem também em `versos`, na ordem de leitura decidida no INVENTARIO.md (é o que a voz lê).
   Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'aprendizagem', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  var CAPPARELLI = 'CAPPARELLI, Sérgio. ';
  var LIVRO_111 = '. In: 111 poemas para crianças. Ilustrações de Ana Gruszynski. Porto Alegre: Via Láctea, 2021. ';
  var BANDEIRA = 'BANDEIRA, Pedro. Pontinho de vista. In: Por enquanto eu sou pequeno. São Paulo: Moderna, 2009. p. 22.';
  Reino.registrarCartas('portugues4', [
    // abertura: jacaré letrado e Conversa vai / vem (pp. 55 e 56)
    carta('lp-a55', '🐊', 'Capítulo 12 – O visual do poema', 55, [
      { t: 'ilustracao', id: 'lp-12-jacare', alt: 'Poema visual jacaré letrado: a palavra jacaré, repetida muitas vezes, desenha um jacaré de perfil, com a cabeça à direita, as patas embaixo e o rabo descendo à esquerda.' },
      { t: 'fonte', texto: CAPPARELLI + 'Jacaré letrado' + LIVRO_111 + 'p. 116.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Quais são as palavras que você consegue ler na imagem acima?' },
        { texto: 'O que as palavras do poema formam?' },
        { texto: 'Como as palavras escritas estão relacionadas com a imagem?' },
      ] },
    ]),
    carta('lp-a56', '💬', 'Conversa vem...', 56, [
      { t: 'texto', texto: 'Que tal criar um animal letrado, como o que você viu na página anterior? Escreva várias vezes dentro da imagem o nome do animal formado.' },
      { t: 'ilustracao', id: 'lp-12-gato', alt: 'Contorno vazio de um gato sentado, com duas orelhas pontudas e o rabo em forma de S.' },
    ]),

    // poema e poema visual (pp. 57 a 61)
    carta('lp-a57', '📖', 'Poema e poema visual', 57, [
      { t: 'texto', texto: 'Vamos lembrar o que é um poema?' },
      { t: 'quadro', texto: 'Poema é um texto literário escrito em versos e estrofes, assim como as letras de canção. Poemas podem tratar de muitos assuntos, como amor, bichos, brinquedos, natureza, sentimentos etc. Além de versos e estrofes, o poema também pode ter rima, que é quando as palavras têm sons parecidos. A rima ajuda a dar musicalidade ao poema, assim como nas canções, tornando-os mais agradáveis e divertidos de ouvir.' },
      { t: 'texto', texto: 'Leia o poema a seguir.' },
    ]),
    carta('lp-a57b', '📖', 'Pontinho de vista', 57, [
      { t: 'versos', versos: ['Eu sou pequeno, me dizem,', 'e eu fico muito zangado.', 'Tenho de olhar todo mundo',
        'com o queixo levantado.', 'Mas se formiga falasse,', 'e me visse lá do chão,', 'ia dizer, com certeza:',
        '"Minha nossa, que grandão!"'] },
      { t: 'fonte', texto: BANDEIRA },
    ]),
    carta('lp-a57c', '📖', 'Pontinho de vista: versos, estrofe e rimas', 57, [
      { t: 'ilustracao', id: 'lp-12-pontinho-esquema', alt: 'O poema Pontinho de vista com o esquema do livro: a etiqueta VERSOS com um traço até cada verso, a etiqueta ESTROFE com uma chave que abraça o poema inteiro e a etiqueta RIMAS, com as palavras zangado, levantado, chão e grandão destacadas em verde.' },
      { t: 'texto', texto: 'Os poemas têm como objetivo entreter ou emocionar quem lê. Para isso, os poetas usam algo chamado licença poética, que é a liberdade de se expressar de maneira criativa, sem seguir todas as regras gramaticais.' },
    ]),
    carta('lp-a58', '🐊', 'Poema visual', 58, [
      { t: 'texto', texto: 'O texto que você leu na abertura do capítulo é um exemplo de poema visual.' },
      { t: 'quadro', texto: 'O poema visual é diferente do poema tradicional porque nele as palavras (ou frases) são organizadas de modo a formar imagens. As imagens e as palavras estão sempre relacionadas ao assunto e ao título do poema. Veja um exemplo.' },
      { t: 'ilustracao', id: 'lp-12-jacare-elementos', alt: 'O poema jacaré letrado com os três elementos marcados: 1, uma palavra jacaré em laranja; 2, uma linha pontilhada em volta do jacaré; 3, o título em verde.' },
      { t: 'lista', itens: [
        { termo: 'Elemento 1:', texto: 'texto que forma a imagem – repetição da palavra jacaré.' },
        { termo: 'Elemento 2:', texto: 'imagem formada – um jacaré.' },
        { termo: 'Elemento 3:', texto: 'título do poema – jacaré letrado, ou seja, um jacaré formado por letras.' },
      ] },
      { t: 'fonte', texto: CAPPARELLI + 'Jacaré letrado' + LIVRO_111 + 'p. 116.' },
    ]),
    carta('lp-a58b', '🐊', 'Os elementos do poema visual', 58, [
      { t: 'texto', texto: 'Ao identificar a relação entre o elemento 1 (texto) e o elemento 2 (imagem), é possível entender o título (elemento 3) e o assunto do poema. Ou seja, o poema brinca com a ideia de que o jacaré letrado, nesse caso, não é um jacaré que sabe ler, mas, sim, um jacaré formado por letras.' },
      { t: 'texto', texto: 'Assim, para ler um poema visual, é importante considerar todos os elementos que o constituem.' },
    ]),
    carta('lp-a59', '🥚', 'um ovo (1 de 2)', 59, [
      { t: 'quadro', titulo: 'Organizando o conhecimento', texto: 'Leia o poema visual a seguir.' },
      { t: 'ilustracao', id: 'lp-12-ovo', alt: 'Poema visual um ovo: um ovo de Páscoa amarrado com uma fita preta em cruz e um laço no alto. Na fita estão escritas as palavras um ovo e de novo; no nó, a palavra ovo em cruz; embaixo, de páscoa.' },
      { t: 'versos', versos: ['de novo', 'um ovo', 'um ovo', 'de novo', '', 'um ovo', 'de novo', 'de novo', 'um ovo', '',
        'o', 'ovo', 'o', '', 'de novo', 'um ovo', 'um ovo', 'de novo'] },
    ]),
    carta('lp-a59b', '🥚', 'um ovo (2 de 2)', 59, [
      { t: 'versos', versos: ['de novo', 'um ovo', 'de novo', 'um ovo', 'de novo', 'de novo', 'um ovo', 'um ovo', '', 'de páscoa'] },
      { t: 'fonte', texto: CAPPARELLI + 'Um ovo' + LIVRO_111 + 'p. 117.' },
    ]),
    carta('lp-a60', '📝', ORGANIZANDO, 60, [
      { t: 'texto', texto: 'Continuação da atividade 1 sobre o poema um ovo. Atividade 2: completar as frases sobre poema e poema visual. Atividade 3: como os poemas visuais usam as palavras para formar imagens.' },
      { t: 'quadro', texto: 'imagem – estrofes – versos' },
    ]),
    carta('lp-a61', '📖', 'Pontinho de vista (releitura)', 61, [
      { t: 'texto', texto: 'Releia o poema a seguir. Depois, responda aos itens.' },
      { t: 'versos', versos: ['Eu sou pequeno, me dizem,', 'e eu fico muito zangado.', 'Tenho de olhar todo mundo',
        'com o queixo levantado.', 'Mas se formiga falasse,', 'e me visse lá do chão,', 'ia dizer com certeza:',
        '"Minha nossa, que grandão!"'] },
      { t: 'fonte', texto: BANDEIRA },
    ]),

    // palavras terminadas em -ã, -ão, -ães (pp. 62 a 66)
    carta('lp-a62', '💗', 'o que é mãe (1 de 3)', 62, [
      { t: 'quadro', titulo: 'Palavras terminadas em -ã, -ão, -ães', texto: 'Leia o poema a seguir.' },
      { t: 'ilustracao', id: 'lp-12-mae', alt: 'O título o que é mãe e um ponto de interrogação gigante, marrom, todo preenchido com a palavra mãe; o ponto embaixo é uma flor com um coração branco.' },
      { t: 'versos', versos: ['Mãe? O que é mãe?', 'Pessoa doce?', 'Tão doce', 'Que faz passar vergonha', 'Doce de batata-doce?', '',
        'Mãe? O que é mãe?', 'Tão doce', 'Que se parte', 'Quando parte,', 'Melhor seria', 'Se não se fosse.'] },
    ]),
    carta('lp-a62b', '💗', 'o que é mãe (2 de 3)', 62, [
      { t: 'versos', versos: ['Mãe? O que é mãe?', 'Luz muito clara,', 'Tão clara', 'Que nos aclara', 'E, afagando,', 'nos ampara?', '',
        'Mãe? O que é mãe', 'Tão doce? Tão severa', 'Se a gente erra!', 'E que empurra', 'Se tudo emperra.', 'Mãe severa?',
        'Mãe doce?', 'Ou mãe fera?'] },
    ]),
    carta('lp-a62c', '💗', 'o que é mãe (3 de 3)', 62, [
      { t: 'versos', versos: ['Nesse teu dia', 'Te dou jasmim,', 'Te dou gladíolos,', 'Te dou beijim,', 'Assim assado,', 'Assim, assim.'] },
      { t: 'fonte', texto: CAPPARELLI + 'O que é mãe' + LIVRO_111 + 'p. 47.' },
    ]),
    carta('lp-a63', '🔤', 'Terminações -ã, -ão, -ães (1 de 2)', 63, [
      { t: 'texto', texto: 'As palavras podem terminar de jeitos diferentes e isso pode mudar o que elas significam. Vamos entender melhor as terminações -Ã, -ÃO e -ÃES.' },
      { t: 'quadro', titulo: 'Palavras terminadas em -Ã indicam:', itens: [
        { texto: 'o singular de algumas palavras. Exemplos: hortelã, ímã, avelã, talismã.' },
        { texto: 'o feminino das palavras. Exemplos: irmão → irmã; guardião → guardiã.' },
      ] },
      { t: 'quadro', titulo: 'Palavras terminadas em -ÃO indicam:', itens: [
        { texto: 'o singular de algumas palavras. Exemplos: limão, feijão, verão, vulcão.' },
        { texto: 'o aumentativo de algumas palavras. Exemplos: grande → grandão; presente → presentão.' },
        { texto: 'o masculino das palavras. Exemplos: cidadã → cidadão; aldeã → aldeão.' },
      ] },
    ]),
    carta('lp-a63b', '🔤', 'Terminações -ã, -ão, -ães (2 de 2)', 63, [
      { t: 'quadro', titulo: 'Palavras terminadas em -ÃES indicam o plural das palavras.', texto: 'Exemplos:', itens: [
        { texto: 'mãe (singular) → mães (plural)' },
        { texto: 'cão (singular) → cães (plural)' },
        { texto: 'pão (singular) → pães (plural)' },
      ] },
      { t: 'fonte', texto: 'No livro: "Embarque em uma missão divertida para aprender sobre palavras e suas terminações. Acesse o QR Code para entrar nessa aventura!" (Terminações -Ã, -ÃO, -ÃES.)' },
    ]),
    carta('lp-a64', '📝', ORGANIZANDO, 64, [
      { t: 'texto', texto: 'Atividade 1: usar as palavras do quadro para nomear as imagens. Atividade 2: trocar a terminação -ÃO por -Ã e escrever o feminino das palavras.' },
      { t: 'quadro', texto: 'televisão – tubarão – avião – roupão' },
      { t: 'figuras', itens: [{ img: 'lp:12-tubarao' }, { img: '✈' }, { img: '📺' }, { img: 'lp:12-roupao' }] },
    ]),
    carta('lp-a65', '📝', ORGANIZANDO, 65, [
      { t: 'texto', texto: 'Atividade 3: completar cada palavra com a terminação correta.' },
      { t: 'quadro', texto: 'Ã – ÃO' },
      { t: 'texto', texto: 'Atividade 4: completar as frases com uma das palavras do quadro.' },
      { t: 'quadro', texto: 'balão – cães – irmãs – pães – maçãs – limão – presentão' },
    ]),
    carta('lp-a66', '📝', ORGANIZANDO, 66, [
      { t: 'texto', texto: 'Atividade 5: ler as frases e contornar os substantivos que estão no plural. Atividade 6: reescrever as frases trocando as palavras em destaque pelo seu feminino.' },
    ]),

    // substantivos próprios e comuns (pp. 67 a 70)
    carta('lp-a67', '🐶', 'relâmpago', 67, [
      { t: 'quadro', titulo: 'Substantivos: próprios e comuns', texto: 'Leia o poema a seguir.' },
      { t: 'ilustracao', id: 'lp-12-relampago', alt: 'O título relâmpago no meio de muitos pingos pretos em forma de gota, espalhados como manchas.' },
      { t: 'versos', versos: ['O meu cachorro Relâmpago', 'Acordou-se com sarampo.', '', 'Veio a dona Manuela:', 'Deve ser varicela!', '',
        'Veio a dona Dora:', 'Para mim, catapora!', '', 'E a dona Fabíola:', 'Mais parece varíola.', '',
        'Por fim, a veterinária:', 'Acho tudo um disparate,', 'Pois o cachorro se manchou', 'Foi com molho de tomate!'] },
      { t: 'fonte', texto: CAPPARELLI + 'Relâmpago' + LIVRO_111 + 'p. 40.' },
    ]),
    carta('lp-a68', '🐶', 'Substantivos próprios e comuns', 68, [
      { t: 'texto', texto: 'Agora, observe algumas palavras do poema.' },
      { t: 'quadro', texto: 'Relâmpago – Manuela – Dora – Fabíola' },
      { t: 'texto', texto: 'Essas palavras são substantivos próprios, que usamos para dar nome a pessoas, animais de estimação e lugares. Eles sempre começam com letra maiúscula. Exemplos: Isabela, Fortaleza, Shopping Boa Vista, Totó.' },
      { t: 'texto', texto: 'Agora, observe outras palavras do poema:' },
      { t: 'quadro', texto: 'cachorro – veterinária – molho – tomate' },
      { t: 'texto', texto: 'Essas palavras são substantivos comuns, que usamos para dar nome a lugares, bichos, pessoas ou coisas, de forma geral, sem especificar um nome único. Por isso, eles começam com letra minúscula. Exemplos: menina, cidade, cachorro, livro.' },
    ]),
    carta('lp-a69', '📝', ORGANIZANDO, 69, [
      { t: 'texto', texto: 'Atividades 1, 2 e 3: marcar P (próprio) ou C (comum), completar os parênteses com 1 ou 2 conforme a legenda e organizar as palavras no quadro, separando os substantivos próprios dos comuns.' },
    ]),
    carta('lp-a70', '📝', ORGANIZANDO, 70, [
      { t: 'texto', texto: 'Atividade 4: encontrar a palavra que não combina em cada quadro. Atividade 5: escrever frases usando as palavras entre parênteses.' },
      { t: 'quadro', titulo: 'Exemplo', itens: [{ termo: '(Ana, avó)', texto: 'Fui à casa da minha avó Ana.' }] },
    ]),

    // letras maiúsculas e minúsculas (pp. 71 a 74)
    carta('lp-a71', '🔠', 'Letras: maiúsculas e minúsculas', 71, [
      { t: 'texto', texto: 'Quando escrevemos, usamos letras maiúsculas e minúsculas.' },
      { t: 'ilustracao', id: 'lp-12-lousa', alt: 'Uma lousa verde com o alfabeto em letras maiúsculas e, embaixo, em letras minúsculas.' },
      { t: 'quadro', titulo: 'Quando usamos letra maiúscula?', itens: [
        { texto: 'No início de frases. Exemplo: "Acordou-se com sarampo".' },
        { texto: 'Para indicar substantivos próprios, ou seja, nomes de pessoas, lugares e animais de estimação. Exemplo: "O meu cachorro Relâmpago".' },
      ] },
      { t: 'quadro', titulo: 'Quando usamos letra minúscula?', itens: [
        { texto: 'No meio de frases, depois da primeira palavra.' },
        { texto: 'Para indicar substantivos comuns, ou seja, seres, objetos e lugares de forma geral. Exemplos: "O meu cachorro Relâmpago", "Por fim, a veterinária".' },
      ] },
    ]),
    carta('lp-a72', '📝', ORGANIZANDO, 72, [
      { t: 'texto', texto: 'Atividade 1: completar as palavras com as letras que estão faltando. Dica: use a letra maiúscula em nomes próprios. Atividade 2: escolher um substantivo do quadro para nomear cada imagem.' },
      { t: 'quadro', texto: 'Joaquim – abelha – mala – Ana – meias – Brasil' },
    ]),
    carta('lp-a73', '💌', 'A mensagem de Ana', 73, [
      { t: 'texto', texto: 'Leia com atenção uma mensagem que Ana escreveu para sua avó.' },
      { t: 'texto', texto: 'Vovó Lúcia,' },
      { t: 'texto', texto: 'Ontem fui ao parque com o meu pai. Brinquei muito com a Júlia e o Lucas. Nós andamos de bicicleta e tomamos sorvete. Foi um dia muito divertido!' },
      { t: 'texto', texto: 'Beijos,' },
      { t: 'texto', texto: 'Ana' },
    ]),
    carta('lp-a74', '📝', ORGANIZANDO, 74, [
      { t: 'texto', texto: 'Atividade 5: completar as frases usando letra maiúscula e letra minúscula nos lugares corretos. Atividade 6: reescrever frases usando a letra maiúscula onde for necessário.' },
    ]),

    // saberes em ação: produção escrita, poema visual (pp. 75 a 77)
    carta('lp-a75', '✍', 'Produção escrita: poema visual', 75, [
      { t: 'quadro', titulo: 'Saberes em ação', texto: 'Produção escrita: poema visual' },
      { t: 'texto', texto: 'Poemas visuais unem texto e imagem para criar imagens com palavras. Agora, é a sua vez de criar um poema visual.' },
      { t: 'quadro', titulo: 'Preparação', texto: 'Para iniciar a produção do seu poema, é importante pensar em alguns detalhes. Responda aos itens a seguir para começar.' },
    ]),
    carta('lp-a76', '✍', 'Primeira produção', 76, [
      { t: 'texto', texto: 'Agora que você já tem as informações para escrever o seu poema visual, use o espaço a seguir para fazer a primeira produção. Organize as palavras ou frases que você escolheu de um jeito que elas formem a imagem que você quer.' },
    ]),
    carta('lp-a77', '✍', 'Avaliação', 77, [
      { t: 'texto', texto: 'Troque seu texto com um colega. Peça a ele que leia seu poema visual e responda às perguntas a seguir no seu livro. Leia e avalie a produção dele também.' },
      { t: 'quadro', titulo: 'Sim – Não – Pode melhorar', itens: [
        { texto: 'O poema tem um tema?' },
        { texto: 'As letras ou frases do poema formam uma imagem?' },
        { texto: 'O poema tem título?' },
      ] },
      { t: 'texto', texto: 'Se o seu colega marcou não ou pode melhorar, faça as mudanças necessárias antes de escrever a versão final do seu poema visual.' },
    ]),
    carta('lp-a77b', '✍', 'Produção final', 77, [
      { t: 'lista', itens: [
        { termo: '1.', texto: 'Produza a versão final do seu poema na folha que o professor vai entregar. Considere os comentários do seu colega.' },
        { termo: '2.', texto: 'Coloque um título no topo da folha.' },
        { termo: '3.', texto: 'Assine seu nome ao final do poema.' },
        { termo: '4.', texto: 'Escolha, com o professor e os colegas, um espaço na escola para pendurar as produções. Convidem outras pessoas para conhecer os poemas visuais da turma. Vai ser um sucesso!' },
      ] },
    ]),

    // testando as ideias e agora você já sabe (pp. 78 a 80)
    carta('lp-a78', '🌷', 'a primavera endoideceu', 78, [
      { t: 'quadro', titulo: 'Testando as ideias', texto: 'Leia o poema visual a seguir.' },
      { t: 'ilustracao', id: 'lp-12-primavera', alt: 'Poema visual a primavera endoideceu: uma flor de cinco pétalas feitas com a frase bem me quer mal me quer, o miolo é uma espiral da palavra zum com uma abelhinha no meio, e o caule são duas linhas de texto.' },
      { t: 'versos', versos: ['a primavera endoideceu', '', 'zum zum zum zum zum zum zum zum zum zum zum zum', '',
        'bem me quer mal me quer', 'bem me quer mal me quer', 'bem me quer mal me quer', 'bem me quer mal me quer',
        'bem me quer mal me quer', '', 'nos meus olhos zumbiam mil abelhas', 'e me fitavas detrás da cerca dos cílios'] },
      { t: 'fonte', texto: CAPPARELLI + 'A primavera endoideceu' + LIVRO_111 + 'p. 122.' },
    ]),
    carta('lp-a79', '📝', 'Testando as ideias', 79, [
      { t: 'texto', texto: 'Continuação da atividade 1 sobre o poema a primavera endoideceu: a frase das pétalas, a palavra zum no miolo e as letras minúsculas do poema. Atividade 2: contornar as palavras que estão no singular.' },
    ]),
    carta('lp-a80', '🌟', 'Agora você já sabe...', 80, [
      { t: 'texto', texto: 'Atividade 3: pintar de azul os substantivos próprios e de amarelo os substantivos comuns. Atividade 4: escrever uma frase com um substantivo próprio e um comum.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Ler e compreender poemas e poemas visuais.' },
        { texto: 'Identificar a estrutura de um poema visual.' },
        { texto: 'Diferenciar substantivos próprios de substantivos comuns.' },
        { texto: 'Usar a letra maiúscula ou minúscula de acordo com a situação.' },
        { texto: 'Escrever palavras terminadas em -Ã, -ÃO e -ÃES.' },
      ] },
      { t: 'texto', texto: 'Já sei – Preciso saber mais – Ainda não sei' },
    ]),
  ]);
})();
