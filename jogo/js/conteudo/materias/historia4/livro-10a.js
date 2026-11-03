/* Cartas do Livro de Aprendizagem, sumário e Capítulo 10 "O trabalho de cada um" (pp. 2 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; texto longo vira cartas seguidas
   (até ~110 palavras). As fotos e ilustrações viram figuras com ícones e a legenda do livro (ou uma descrição curta).
   O sumário (sem número impresso) é a p. 2 do inventário. */
(function () {
  var L = 'aprendizagem', C = 10;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  Reino.registrarCartas('historia4', [
    // sumário, abertura e Conversa vem... (pp. 2 a 4)
    carta('hi-a02', '📚', 'Sumário', 2, [
      { t: 'lista', itens: [
        { termo: 'Capítulo 10 – O trabalho de cada um', texto: 'página 3' },
        { termo: 'Capítulo 11 – Profissionais da comunidade', texto: 'página 13' },
        { termo: 'Capítulo 12 – Trabalho e meio ambiente', texto: 'página 23' },
      ] },
    ]),
    carta('hi-a03', '🚒', 'O trabalho de cada um – Capítulo 10', 3, [
      { t: 'figuras', itens: [{ img: '🚒', legenda: 'Bombeiro com mangueira de água apagando um incêndio na rua.' }] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Qual é o nome da profissão mostrada na imagem?' },
        { texto: 'Em quais situações o trabalho desse profissional é importante?' },
      ] },
    ]),
    carta('hi-a04', '💬', 'Conversa vem...', 4, [
      { t: 'texto', texto: 'As pessoas trabalham com muitas coisas diferentes. Algumas têm profissões. Leia a dica para descobrir o nome de uma delas.' },
      { t: 'lista', itens: [{ termo: 'profissões', texto: 'são atividades especializadas feitas em troca de remuneração (dinheiro).' }] },
      { t: 'quadro', titulo: 'Dica', texto: 'Enquanto dormimos, esse profissional vigia as casas e os prédios para garantir que todos fiquem seguros.' },
    ]),

    // O que é trabalho? (p. 5)
    carta('hi-a05', '💪', 'O que é trabalho? (1 de 2)', 5, [
      { t: 'texto', texto: 'Trabalho é tudo o que as pessoas fazem para produzir alguma coisa, cuidar ou ajudar em algo. São exemplos de trabalho:' },
      { t: 'lista', itens: [
        { texto: 'costurar uma roupa;' }, { texto: 'construir um móvel;' }, { texto: 'preparar uma comida;' },
        { texto: 'ensinar alguém;' }, { texto: 'cuidar de alguém.' },
      ] },
      { t: 'texto', texto: 'Cada tipo de trabalho é feito de uma maneira diferente. Em alguns deles, as pessoas movimentam bastante o corpo e fazem muito esforço físico. Em outros trabalhos, as pessoas usam mais o pensamento e a criatividade.' },
      { t: 'figuras', itens: [
        { img: '💪', legenda: 'Os profissionais da construção civil precisam da força física para carregar os materiais de construção e utilizam o raciocínio matemático nas tarefas, como em medições.' },
        { img: '✏', legenda: 'Os escritores usam o pensamento e a criatividade para escrever livros.' },
      ] },
    ]),
    carta('hi-a05b', '🧹', 'O que é trabalho? (2 de 2)', 5, [
      { t: 'texto', texto: 'As atividades domésticas, como lavar a louça, varrer a casa e lavar as roupas, são formas de trabalho importantes para o bem-estar da família. Mesmo não sendo remuneradas, essas atividades exigem tempo, esforço e organização. Elas também devem ser compartilhadas entre todos que vivem na casa.' },
      { t: 'texto', texto: 'É possível perceber o trabalho das pessoas em várias situações ao nosso redor: nas comidas que comemos, nos objetos que usamos, nos lugares que visitamos, nos filmes que vemos etc. Tudo isso é resultado do trabalho de alguém.' },
    ]),

    // Trabalho e emprego (p. 6)
    carta('hi-a06', '💼', 'Trabalho e emprego (1 de 2)', 6, [
      { t: 'quadro', titulo: 'Você sabia que trabalho e emprego são coisas diferentes?', itens: [
        { texto: 'O trabalho pode ser qualquer atividade que cria alguma coisa ou que cumpre um objetivo. Por isso, podemos dizer que ajudar a arrumar o quarto, fazer a lição de casa ou levar o cachorrinho para passear também são tipos de trabalho.' },
        { texto: 'O emprego é o trabalho que as pessoas fazem em troca de um pagamento. Com esse pagamento, as pessoas podem comprar as coisas de que precisam.' },
        { texto: 'Assim, todo emprego é um trabalho, mas nem todo trabalho é um emprego!' },
      ] },
    ]),
    carta('hi-a06b', '🌾', 'Trabalho e emprego (2 de 2)', 6, [
      { t: 'texto', texto: 'Atualmente, as pessoas que têm emprego ganham um salário (ou seja, uma quantia em dinheiro) para trabalhar. Mas nem sempre foi assim. Observe a obra a seguir.' },
      { t: 'figuras', itens: [{ img: '🏰', legenda: 'Um castelo no alto do morro e camponeses trabalhando a terra; um deles ara o campo com dois bois.' }] },
      { t: 'fonte', texto: 'LIMBOURG, Herman; LIMBOURG, Paul; LIMBOURG, Jean. As riquíssimas Horas do Duque de Berry. 1412-1416. 1 iluminura do mês de março. Manuscrito conservado no Museu Condé, Castelo de Chantilly, França. Detalhe.' },
      { t: 'texto', texto: 'Antigamente, em vários lugares do mundo, as pessoas não ganhavam dinheiro para trabalhar. Em vez disso, ganhavam objetos ou alimentos. Por exemplo, quem trabalhava em plantações podia receber como pagamento sacos de grãos, legumes, frutas ou outras coisas para usar em casa.' },
    ]),

    // Organizando o conhecimento (p. 7)
    carta('hi-a07', '📝', ORGANIZANDO, 7, [
      { t: 'texto', texto: 'Observe as imagens a seguir e responda aos itens.' },
      { t: 'figuras', itens: [
        { img: '🌱', legenda: 'A: uma mulher rega as plantas com um regador.' },
        { img: '🪥', legenda: 'B: uma dentista cuida dos dentes de um paciente.' },
        { img: '🧽', legenda: 'C: um menino lava a louça na pia da cozinha.' },
        { img: '✂', legenda: 'D: um barbeiro corta o cabelo de um homem.' },
      ] },
    ]),

    // Cada um faz sua parte (p. 8)
    carta('hi-a08', '📖', 'Cada um faz sua parte (1 de 2)', 8, [
      { t: 'texto', texto: 'Você já se perguntou por que as pessoas trabalham?' },
      { t: 'texto', texto: 'Elas trabalham para conseguir itens importantes, como comida, casa, roupas e outras necessidades do dia a dia. Com o salário que as pessoas recebem em seus empregos, elas podem comprar aquilo de que precisam e pagar as contas.' },
      { t: 'texto', texto: 'Com suas habilidades e seus conhecimentos, as pessoas também podem realizar seus sonhos por meio do trabalho. É o caso de Ruth Rocha. Essa escritora brasileira recebeu muitos prêmios por causa dos livros infantis que escreveu. Acompanhe a leitura de um trecho em que Ruth Rocha fala um pouco sobre o que escrever significa para ela.' },
    ]),
    carta('hi-a08b', '📚', 'Cada um faz sua parte (2 de 2)', 8, [
      { t: 'fala', quem: 'Ruth Rocha', texto: 'A vida inteira eu tinha muitas ideias. Eu estava escrevendo uma história e já saía com três ideias para escrever, ficava com aquilo na cabeça [...].' },
      { t: 'fala', quem: 'Ruth Rocha', texto: 'Não aguento fazer muita coisa, mas eu gosto muito de escrever. É a minha vida.' },
      { t: 'fonte', texto: 'MANTOVANI, Flávia. Ruth Rocha, de \'Marcelo, Marmelo, Martelo\', fecha contrato até 108 anos [...]. Disponível em: https://www.bbc.com/portuguese/articles/cd6ve1zv5n1o. Acesso em: 29 jan. 2025.' },
      { t: 'quadro', texto: 'Você já leu alguma história escrita por Ruth Rocha? O livro mais conhecido dessa escritora é Marcelo, marmelo, martelo.' },
    ], ['APR-08-qB']),

    // O trabalho na comunidade (p. 9)
    carta('hi-a09', '👩‍🏫', 'O trabalho na comunidade (1 de 2)', 9, [
      { t: 'texto', texto: 'Assim como Ruth Rocha realizou seu sonho com o trabalho de escrever livros, muitas pessoas usam seu trabalho para ajudar outras e transformar a comunidade. Já pensou em como o que cada um faz pode melhorar a vida de todos?' },
      { t: 'texto', texto: 'Em uma comunidade, cada profissão tem sua importância. As pessoas trabalham juntas para alcançar objetivos que sozinhas não conseguiriam. Por isso, quem cozinha, quem ensina, quem cuida da saúde ou limpa as ruas tem um papel essencial.' },
      { t: 'texto', texto: 'Cada profissão tem ferramentas e modos de trabalhar diferentes. Os professores usam a lousa, os cozinheiros usam panelas, os agricultores usam enxadas e assim por diante.' },
    ]),
    carta('hi-a09b', '🤝', 'O trabalho na comunidade (2 de 2)', 9, [
      { t: 'texto', texto: 'Além de garantir o sustento das famílias, o trabalho organiza a vida nas cidades. É com o trabalho que as ruas são limpas, as escolas ensinam seus alunos, os alimentos chegam até os mercados e as pessoas são atendidas nos hospitais. Cada função tem um papel no dia a dia da comunidade.' },
      { t: 'texto', texto: 'Por isso, é importante reconhecer o valor de todas as profissões. Quando compreendemos o que cada pessoa faz e por que aquilo é necessário, aprendemos a respeitar o trabalho e a viver com mais cooperação.' },
      { t: 'figuras', itens: [
        { img: '👩‍🏫', legenda: 'professora' }, { img: '🍲', legenda: 'cozinheiro' }, { img: '🌱', legenda: 'agricultora' },
      ] },
    ]),

    // Organizando o conhecimento: o leite (p. 10)
    carta('hi-a10', '🥛', ORGANIZANDO, 10, [
      { t: 'texto', texto: 'Observe as fases de produção e distribuição do leite.' },
      { t: 'figuras', itens: [
        { img: '🐄', legenda: '1: um homem tira o leite da vaca.' },
        { img: '🥛', legenda: '2: um homem leva o latão de leite para o caminhão.' },
        { img: '📦', legenda: '3: um trabalhador põe as caixinhas de leite na esteira da fábrica.' },
        { img: '🚚', legenda: '4: um motorista dirige o caminhão do leite.' },
        { img: '🛒', legenda: '5: uma moça arruma as caixas de leite na prateleira do mercado.' },
      ] },
    ]),

    // Saberes em ação: jogo da memória (p. 11)
    carta('hi-a11', '🃏', 'Saberes em ação (1 de 2)', 11, [
      { t: 'texto', texto: 'Agora, você vai criar um jogo da memória sobre os tipos de trabalho.' },
      { t: 'lista', itens: [{ termo: 'Materiais necessários', texto: '1 folha de papel branca; régua; lápis grafite; lápis de cor e canetinhas.' }] },
      { t: 'lista', itens: [
        { termo: '1.', texto: 'Divida a folha de papel em 12 partes iguais e recorte cada uma delas.' },
        { termo: '2.', texto: 'Escolha 6 trabalhos que você conhece. Podem ser trabalhos que acontecem dentro ou fora de casa.' },
        { termo: '3.', texto: 'Separe 6 pedaços de papel e escreva, em cada um deles, os trabalhos que você escolheu.' },
        { termo: '4.', texto: 'Nos pedaços de papel que sobraram, desenhe cada um dos trabalhos.' },
      ] },
    ]),
    carta('hi-a11b', '🧩', 'Saberes em ação (2 de 2)', 11, [
      { t: 'lista', itens: [
        { termo: '5.', texto: 'O objetivo da brincadeira é formar pares de peças, juntando o nome e o desenho de cada um dos trabalhos.' },
        { termo: '6.', texto: 'Depois de criar as cartas, junte-se a um colega e brinque com o jogo da memória que vocês construíram.' },
        { termo: '7.', texto: 'Após a brincadeira, mostre ao colega os pares que você juntou corretamente.' },
      ] },
    ]),

    // Testando as ideias e Agora você já sabe... (p. 12)
    carta('hi-a12', '📜', 'Testando as ideias', 12, [
      { t: 'texto', texto: 'Leia o poema a seguir.' },
      { t: 'versos', versos: ['Profissão', '',
        'Todo mundo me pergunta', 'O que vou ser quando crescer.', 'Que insistência, coisa doida,', 'Nem sei o que eu vou comer!',
        'Estou pensando, escolhendo,', 'Eu gosto de responder.', 'Um médico, piscineiro', 'Ou cantor de MPB.',
        'Não sei se imito o papai,', 'Que é um grande professor,', 'Ou a minha prima Célia,', 'Que conserta até motor.'] },
      { t: 'fonte', texto: 'RAMOS, Lázaro. Caderno de rimas do João. Rio de Janeiro: Pallas, 2018. p. 29.' },
    ]),
  ]);
})();
