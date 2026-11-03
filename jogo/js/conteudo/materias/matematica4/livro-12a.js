/* Cartas do Livro de Aprendizagem, Capítulo 12 "Estatística" (pp. 54 a 80), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; tabelas como `tabela`; os gráficos
   prontos viram uma tabela com os valores das colunas ou barras (dito no texto antes dela); malha em branco para
   pintar, uma linha que diz como ela é. Conversa, troca com colega e trabalho em grupo: leitura (soLeitura). */
(function () {
  var L = 'aprendizagem', C = 12;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  var TESTANDO = 'Testando as ideias';
  Reino.registrarCartas('matematica4', [
    // abertura e Conversa vai / vem (pp. 54 e 55)
    carta('ma-a54', '🌳', 'Estatística – Capítulo 12', 54, [
      { t: 'texto', texto: 'No pátio da escola, duas crianças plantam uma muda de árvore. Soraia segura uma prancheta com esta tabela:' },
      { t: 'texto', texto: 'Projeto reflorestar – Plantio de mudas de árvores' },
      { t: 'tabela', cab: ['Ano escolar', 'Quantidade de mudas já plantadas'],
        linhas: [['1º', '10'], ['2º', '8'], ['3º', '6'], ['4º', '12'], ['5º', '10']] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Plantar árvores é uma atitude que ajuda o planeta. O que mais podemos plantar para esse fim, além de árvores?' },
        { texto: 'Quem você acha que deve cuidar das árvores depois que elas forem plantadas?' },
        { texto: 'O que podemos fazer para garantir que essas árvores cresçam fortes e saudáveis?' },
      ] },
    ], ['APR-54-qA', 'APR-54-qB', 'APR-54-qC']),
    carta('ma-a55', '💬', 'Conversa vem...', 55, [
      { t: 'quadro', titulo: 'Conversa vem...', texto: 'Os alunos da escola em que Soraia estuda estão participando de um projeto de plantio de árvores. Observe a imagem da página anterior e responda:' },
      { t: 'texto', texto: 'Na página, há um gráfico para pintar: Projeto reflorestar - Plantio de mudas de árvores. No eixo vertical, a quantidade de mudas já plantadas, de 0 a 12. No eixo horizontal, o ano escolar, do 1º ao 5º.' },
    ]),

    // tabelas e gráficos (pp. 56 a 59)
    carta('ma-a56', '🌸', 'Tabelas e gráficos', 56, [
      { t: 'texto', texto: 'Os alunos da turma de Soraia também plantaram mudas de flores no jardim da escola.' },
      { t: 'texto', texto: 'Observe a quantidade de mudas de cada flor que os alunos plantaram.' },
      { t: 'texto', texto: 'Na folha "Mudas de flores que plantamos", cada flor tem quadradinhos riscados e tracinhos: Margarida, 2 quadradinhos riscados e 2 tracinhos. Rosa, 3 quadradinhos riscados e 3 tracinhos. Camélia, 3 quadradinhos riscados e 3 tracinhos. Jasmim, 4 quadradinhos riscados.' },
      { t: 'texto', texto: 'As informações anotadas pelos alunos podem ser organizadas em uma tabela.' },
      { t: 'texto', texto: 'O título dessa tabela é: Mudas de flores que plantamos.' },
      { t: 'quadro', texto: 'Toda tabela deve ter um título. Uma tabela é composta de linhas e colunas.' },
    ]),
    carta('ma-a57', '🌸', 'Tabelas e gráficos – Gráfico de colunas', 57, [
      { t: 'texto', texto: 'As informações da tabela também podem ser representadas em um gráfico de colunas.' },
      { t: 'texto', texto: 'Gráfico de colunas "Mudas de flores que plantamos". A altura de cada coluna:' },
      { t: 'tabela', cab: ['Flor', 'Quantidade de mudas'],
        linhas: [['Margarida', '12'], ['Rosa', '18'], ['Camélia', '18'], ['Jasmim', '20']] },
      { t: 'quadro', texto: 'Todo gráfico deve ter um título. O título desse gráfico é o mesmo da tabela: Mudas de flores que plantamos. O gráfico é formado por dois eixos: um vertical e outro horizontal. No eixo vertical desse gráfico, temos a quantidade de mudas. No eixo horizontal desse gráfico, temos o tipo de flor plantada.' },
    ]),
    carta('ma-a58', '🍎', 'Alimentos in natura e ultraprocessados', 58, [
      { t: 'texto', texto: 'Na escola em que Soraia estuda, foi feita uma pesquisa sobre alimentação saudável. Os alunos precisaram contar a quantidade de alimentos in natura e de alimentos ultraprocessados consumidos por eles durante uma semana.' },
      { t: 'quadro', titulo: 'Para saber mais', texto: 'Você sabe o que diferencia um alimento in natura de um alimento ultraprocessado? Alimentos in natura, como frutas, verduras e carnes frescas, são aqueles que vêm diretamente da natureza, sem adicionar outros ingredientes. Já os alimentos ultraprocessados, como salgadinhos e refrigerantes, são feitos em fábricas, com a adição de vários ingredientes industriais, como corantes, conservantes e aromatizantes.' },
      { t: 'figuras', itens: [{ img: '🍎', legenda: 'in natura' }, { img: '🥕', legenda: 'in natura' }, { img: '🍟', legenda: 'ultraprocessado' }] },
    ]),
    carta('ma-a58b', '🍎', 'Alimentos consumidos durante uma semana', 58, [
      { t: 'quadro', texto: 'Dar preferência a alimentos in natura, em vez de alimentos ultraprocessados, deixa o corpo com mais energia para brincar e aprender, e a saúde fica mais forte para crescer.' },
      { t: 'texto', texto: 'A tabela a seguir mostra o resultado da pesquisa feita pelo grupo de Soraia.' },
      { t: 'tabela', cab: ['Aluno', 'Ultraprocessado', 'In natura'],   // colunas trocadas: a fala da linha termina em "In natura: 12." (o número não fica sozinho no balão)
        linhas: [['Soraia', '4', '12'], ['Marcelo', '10', '10'], ['Rodrigo', '6', '14'], ['Vitória', '8', '12']] },
      { t: 'texto', texto: 'Para descobrir a quantidade de alimentos in natura que Rodrigo consumiu, por exemplo, olhamos onde a linha que tem o nome Rodrigo se encontra com a coluna que mostra a quantidade de alimentos in natura consumidos. Nesse encontro, descobrimos que Rodrigo consumiu 14 alimentos in natura.' },
    ]),
    carta('ma-a59', '🍎', 'Gráfico de barras', 59, [
      { t: 'texto', texto: 'As informações dessa tabela podem ser representadas em um gráfico de barras.' },
      { t: 'texto', texto: 'Esse gráfico é formado por dois tipos de barras: uma azul e uma laranja. Na legenda abaixo do gráfico, podemos observar que:' },
      { t: 'lista', itens: [
        { texto: 'a barra laranja representa a quantidade de alimentos ultraprocessados consumidos.' },
        { texto: 'a barra azul representa a quantidade de alimentos in natura consumidos.' },
      ] },
      { t: 'texto', texto: 'De acordo com as informações da tabela e do gráfico de barras, responda:' },
      { t: 'quadro', texto: 'As informações de uma pesquisa podem ser organizadas e apresentadas em tabelas e gráficos.' },
    ]),

    // esporte favorito (pp. 60 e 61)
    carta('ma-a60', '⚽', ORGANIZANDO + ' – Esporte favorito', 60, [
      { t: 'texto', texto: 'A professora Ana fez uma pesquisa sobre o esporte favorito de seus alunos do 2º ano. Observe como ela fez essa pesquisa.' },
      { t: 'fala', quem: 'Professora Ana', texto: 'Perguntei a todos os alunos da turma qual é o esporte favorito, e cada um votou em um esporte.' },
      { t: 'texto', texto: 'O resultado dessa pesquisa está representado no gráfico a seguir. Gráfico de colunas "Esporte favorito dos alunos". A altura de cada coluna:' },
      { t: 'tabela', cab: ['Esporte', 'Quantidade de votos'],
        linhas: [['Judô', '3'], ['Natação', '5'], ['Voleibol', '2'], ['Basquetebol', '2'], ['Futebol', '10']] },
    ]),
    carta('ma-a61', '⚽', ORGANIZANDO + ' – Esporte favorito', 61, [
      { t: 'texto', texto: 'Na página, há a tabela "Esporte favorito dos alunos" para completar, com as colunas Esporte e Quantidade de votos.' },
      { t: 'fala', quem: 'Menino', texto: 'Qual é o seu esporte favorito?' },
    ]),

    // ida à escola e doações (pp. 62 a 65)
    carta('ma-a62', '🚶', ORGANIZANDO + ' – Ida à escola', 62, [
      { t: 'texto', texto: 'A tabela a seguir mostra a quantidade de alunos que vão a pé e de carro para a escola em cada ano escolar.' },
      { t: 'texto', texto: 'Ida à escola' },
      { t: 'tabela', cab: ['Ano escolar', 'A pé', 'De carro'],
        linhas: [['1º', '15', '25'], ['2º', '20', '20'], ['3º', '10', '15'], ['4º', '15', '20'], ['5º', '10', '25']] },
    ]),
    carta('ma-a63', '🚗', ORGANIZANDO + ' – Gráfico da ida à escola', 63, [
      { t: 'texto', texto: 'Na página, há um gráfico de barras para pintar: Ida à escola. No eixo vertical, o ano escolar. No eixo horizontal, a quantidade de alunos, de 0 a 30.' },
      { t: 'lista', itens: [
        { texto: 'Cada quadrinho equivale a 5 alunos.' },
        { termo: 'Vermelho', texto: 'a pé.' },
        { termo: 'Verde', texto: 'de carro.' },
      ] },
    ]),
    carta('ma-a64', '🎁', ORGANIZANDO + ' – Gibis e bonecas doados', 64, [
      { t: 'texto', texto: 'Observe a quantidade de gibis e bonecas que as turmas do 2º ano de uma escola doaram para uma campanha beneficente.' },
      { t: 'fala', quem: 'Turma A', texto: 'Minha turma doou 21 gibis e 12 bonecas.' },
      { t: 'fala', quem: 'Turma B', texto: 'Minha turma doou 15 gibis e o dobro dessa quantidade de bonecas.' },
      { t: 'fala', quem: 'Turma C', texto: 'Minha turma doou 15 gibis e 15 bonecas.' },
      { t: 'fala', quem: 'Turma D', texto: 'Minha turma doou 9 gibis e o triplo dessa quantidade de bonecas.' },
      { t: 'texto', texto: 'Na página, há um gráfico de colunas para pintar: Gibis e bonecas doados. Cada quadrinho equivale a 3 unidades.' },
      { t: 'fala', quem: 'Menino', texto: 'Podemos doar os brinquedos que não usamos mais e que estão em boas condições para quem precisa!' },
    ]),
    carta('ma-a65', '🧸', ORGANIZANDO + ' – Gibis e bonecas doados', 65, [
      { t: 'texto', texto: 'Na página, há a tabela "Gibis e bonecas doados" para completar, com a quantidade de gibis e de bonecas de cada turma.' },
      { t: 'quadro', texto: 'Troque de livro com um colega e responda no seu caderno à pergunta dele. Ele responderá à sua pergunta no caderno dele.' },
    ], ['APR-65-q3g']),

    // pesquisas (pp. 66 a 69)
    carta('ma-a66', '🔍', 'Pesquisas', 66, [
      { t: 'texto', texto: 'A professora do 2º ano vai organizar uma gincana de final de ano para os alunos e os pais ou responsáveis.' },
      { t: 'texto', texto: 'Ela quer que as provas dessa gincana sejam feitas com as brincadeiras preferidas dos pais.' },
      { t: 'texto', texto: 'Para descobrir as brincadeiras preferidas dos pais ou responsáveis em uma gincana, a professora pediu aos alunos ajuda para fazer uma pesquisa.' },
      { t: 'fala', quem: 'Professora', texto: 'Como eu faço para descobrir quais brincadeiras os pais ou responsáveis dos alunos preferem em uma gincana?' },
      { t: 'quadro', texto: 'Toda pesquisa tem um tema, que é o assunto principal da investigação.' },
      { t: 'quadro', texto: 'Com base no tema, precisamos criar a pergunta que será feita na pesquisa.' },
    ]),
    carta('ma-a67', '📋', 'Pesquisas – Questionário e entrevista', 67, [
      { t: 'texto', texto: 'Depois de definir o tema e a pergunta da pesquisa, é preciso coletar os dados, ou seja, as respostas dos pais ou responsáveis.' },
      { t: 'texto', texto: 'Para isso, a professora e os alunos podem usar um questionário ou fazer entrevistas.' },
      { t: 'quadro', titulo: 'Questionário', texto: 'Questionário da pesquisa. Nome: ____. Qual dessas brincadeiras você gostaria que tivesse em uma gincana?', itens: [
        { texto: 'Corrida do saco' }, { texto: 'Dança das cadeiras' }, { texto: 'Cabo de guerra' },
        { texto: 'Caça ao tesouro' }, { texto: 'Corrida de 3 pernas' },
      ] },
      { t: 'texto', texto: 'Entrevista' },
      { t: 'fala', quem: 'Menino', texto: 'Qual brincadeira vocês gostariam que tivesse em uma gincana?' },
    ]),
    carta('ma-a68', '📋', 'Pesquisas – Organizar os dados', 68, [
      { t: 'texto', texto: 'Depois de coletar os dados da pesquisa, é hora de organizar esses dados. Para isso, podemos construir uma tabela e um gráfico de barras.' },
      { t: 'texto', texto: 'As brincadeiras preferidas dos pais' },
      { t: 'tabela', cab: ['Brincadeira', 'Quantidade de votos'],
        linhas: [['Corrida do saco', '27'], ['Dança das cadeiras', '30'], ['Cabo de guerra', '18'], ['Caça ao tesouro', '21'], ['Corrida de 3 pernas', '18']] },
      { t: 'texto', texto: 'Na página, há um gráfico de barras para pintar, com o mesmo título. Cada quadrinho equivale a 3 votos.' },
    ]),
    carta('ma-a69', '🙋', 'Pesquisas – Apresentar o resultado', 69, [
      { t: 'texto', texto: 'Com os dados organizados na tabela e no gráfico, é o momento de apresentar o resultado da pesquisa para a turma.' },
      { t: 'texto', texto: 'Na imagem, um menino e uma menina mostram para a turma a tabela no quadro e o gráfico de barras pintado num cartaz.' },
      { t: 'quadro', texto: 'Pesquisar é descobrir ou saber mais sobre um assunto ou uma situação. Para fazer uma pesquisa, é preciso planejar, coletar e organizar os dados em tabelas ou gráficos e apresentar os resultados.' },
    ]),

    // gastos na cantina (pp. 70 e 71)
    carta('ma-a70', '🪙', ORGANIZANDO + ' – Gastos na cantina', 70, [
      { t: 'texto', texto: 'O grupo de Aline fez um questionário para uma pesquisa da escola. Observe esse questionário e depois resolva os itens.' },
      { t: 'quadro', titulo: 'Questionário da pesquisa', texto: 'Nome do aluno: ____. Idade: ____ Ano: ____ Turma: ____. Quantos reais você gastou na cantina da escola hoje?', itens: [
        { texto: 'Menos de R$ 10,00' }, { texto: 'De R$ 10,00 a R$ 15,00' }, { texto: 'Mais de R$ 15,00' }, { texto: 'Não comprei na cantina' },
      ] },
      { t: 'texto', texto: 'O gráfico a seguir mostra o resultado dessa pesquisa. Gráfico de barras "Gastos na cantina da escola". O tamanho de cada barra:' },
      { t: 'tabela', cab: ['Quantia gasta', 'Quantidade de alunos'],
        linhas: [['Não comprei na cantina', '10'], ['Mais de R$ 15,00', '6'], ['De R$ 10,00 a R$ 15,00', '16'], ['Menos de R$ 10,00', '20']] },
    ]),
    carta('ma-a71', '🪙', ORGANIZANDO + ' – Gastos na cantina', 71, [
      { t: 'texto', texto: 'Na página, há duas tabelas para completar, cada uma com um título, as quantias gastas e a quantidade de alunos.' },
      { t: 'quadro', texto: 'O seu professor vai fazer a mesma pesquisa com os alunos de sua turma. Escreva na tabela o resultado da pesquisa.' },
    ], ['APR-71-q1f']),

    // arte e livros lidos (pp. 72 a 74)
    carta('ma-a72', '🎨', ORGANIZANDO + ' – Atividade artística preferida', 72, [
      { t: 'texto', texto: 'Observe o que o professor de Arte quer descobrir na pesquisa dele.' },
      { t: 'fala', quem: 'Professor de Arte', texto: 'Quero descobrir qual é a atividade artística preferida dos meus alunos.' },
      { t: 'texto', texto: 'Observe a tabela com os dados que apareceram no resultado dessa pesquisa.' },
      { t: 'texto', texto: 'Atividade artística preferida dos alunos (quantidade de votos)' },
      { t: 'tabela', cab: ['Atividade artística', 'Meninas', 'Meninos'],
        linhas: [['Pintura em tela', '20', '16'], ['Escultura', '10', '12'], ['Tapeçaria', '14', '6'], ['Desenho à mão', '12', '18']] },
    ]),
    carta('ma-a73', '🎨', ORGANIZANDO + ' – Gráfico da atividade artística', 73, [
      { t: 'texto', texto: 'Na página, há um gráfico de barras para pintar: Atividade artística preferida dos alunos. Cada atividade tem uma barra para as meninas e outra para os meninos.' },
      { t: 'quadro', texto: 'Cada quadrinho equivale a 2 votos.' },
    ]),
    carta('ma-a74', '📚', ORGANIZANDO + ' – Leitura de livros no ano', 74, [
      { t: 'texto', texto: 'Diego e alguns amigos representaram no gráfico a seguir a quantidade de livros que eles leram durante o ano.' },
      { t: 'texto', texto: 'Gráfico de colunas "Leitura de livros no ano". Coluna verde: contos infantis. Coluna lilás: gibis. A altura de cada coluna:' },
      { t: 'tabela', cab: ['Nome', 'Contos infantis', 'Gibis'],
        linhas: [['Diego', '15', '30'], ['Marina', '20', '25'], ['Orlando', '10', '40'], ['Carolina', '20', '30']] },
    ]),

    // Saberes em ação: nossa pesquisa (pp. 75 e 76)
    carta('ma-a75', '📝', 'Saberes em ação', 75, [
      { t: 'texto', texto: 'Agora é a sua vez de realizar uma pesquisa.' },
      { t: 'texto', texto: 'Para isso, vamos separar a turma em dois grupos. Cada grupo deve organizar os seguintes materiais:' },
      { t: 'lista', itens: [
        { texto: 'papel Kraft ou cartolina;' }, { texto: 'canetinhas;' }, { texto: 'régua;' },
        { texto: 'tampinhas plásticas de 4 cores diferentes;' }, { texto: 'cola ou fita adesiva.' },
      ] },
      { t: 'texto', texto: 'Sigam estas etapas:' },
    ]),
    carta('ma-a76', '📝', 'Saberes em ação – Coletar, organizar e apresentar', 76, [
      { t: 'lista', itens: [
        { termo: '3.', texto: 'Os questionários devem ser respondidos pelos colegas do outro grupo. Escolha um colega e troque de questionário com ele.' },
        { termo: '4.', texto: 'Anotem o resultado da pesquisa do grupo na tabela a seguir.' },
        { termo: '5.', texto: 'Agora, com ajuda do professor, construam um gráfico com o resultado da pesquisa. Usem os materiais que foram solicitados. Vejam o exemplo ao lado.' },
        { termo: '6.', texto: 'Apresente aos colegas da turma o gráfico que vocês construíram.' },
      ] },
      { t: 'texto', texto: 'O exemplo é um cartaz "Sorvete preferido dos colegas", com tampinhas coladas em colunas: 6 vermelhas, 4 verdes, 5 pretas e 4 roxas.' },
    ], ['APR-76-q3', 'APR-76-q4', 'APR-76-q5', 'APR-76-q6']),

    // Testando as ideias e Agora você já sabe (pp. 77 a 80)
    carta('ma-a77', '🤸', TESTANDO + ' – Pulos de corda', 77, [
      { t: 'texto', texto: 'Olívia e os amigos dela contaram a quantidade de pulos de corda que conseguiram dar sem errar.' },
      { t: 'fala', quem: 'Olívia', texto: 'Eu dei 10 pulos.' },
      { t: 'fala', quem: 'Beatriz', texto: 'Eu dei a metade dos pulos de José.' },
      { t: 'fala', quem: 'José', texto: 'Eu dei 40 pulos.' },
      { t: 'fala', quem: 'Caio', texto: 'Eu dei o dobro dos pulos de Olívia.' },
      { t: 'texto', texto: 'Na página, há a tabela "Pulos de corda sem errar" para completar, com as colunas Nome e Quantidade de pulos.' },
    ]),
    carta('ma-a78', '🐶', TESTANDO + ' – Animal de estimação', 78, [
      { t: 'texto', texto: 'Pedro começou a construir o gráfico a seguir para mostrar o resultado de uma pesquisa que ele fez. O tema são os animais de estimação dos alunos do 2º ano da escola dele.' },
      { t: 'texto', texto: 'Gráfico de colunas "Animal de estimação dos alunos do 2º ano". A altura de cada coluna:' },
      { t: 'tabela', cab: ['Animal', 'Quantidade de alunos'],
        linhas: [['Cão', '27'], ['Gato', '21'], ['Peixe', '6'], ['Hamster', '9'], ['Não tem animal', '?']] },
    ]),
    carta('ma-a79', '🥪', TESTANDO + ' – Merenda da escola', 79, [
      { t: 'texto', texto: 'O cardápio da merenda de uma escola vai mudar. Para isso, a direção vai fazer uma pesquisa para descobrir quais alimentos os alunos preferem para a hora do lanche.' },
      { t: 'quadro', texto: 'Agora, votem na opção de merenda que cada um de vocês escolheria. Depois, complete a tabela com o resultado dessa pesquisa.' },
      { t: 'texto', texto: 'Na página, há a tabela "Alimentos preferidos dos alunos", com as colunas Opção de lanche e Quantidade de votos.' },
    ], ['APR-79-q3d']),
    carta('ma-a80', '✅', 'Agora você já sabe...', 80, [
      { t: 'texto', texto: 'Agora, reúnam-se para conferir as respostas.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Ler informações em tabelas e gráficos.' },
        { texto: 'Comparar informações de pesquisas apresentadas em tabelas.' },
        { texto: 'Comparar informações de pesquisas apresentadas em gráficos.' },
        { texto: 'Realizar pesquisas e apresentar os dados obtidos em tabelas.' },
        { texto: 'Realizar pesquisas e apresentar os dados obtidos em gráficos.' },
      ] },
    ]),
  ]);
})();
