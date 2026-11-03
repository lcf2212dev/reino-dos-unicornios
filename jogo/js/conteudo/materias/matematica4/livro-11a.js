/* Cartas do Livro de Aprendizagem, Capítulo 11 "Divisão em partes iguais" (pp. 26 a 53), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; o que a imagem mostra e importa para
   responder vem em figuras ou numa linha "Na imagem: …". Os QR codes (videoaula, "A divisão no dia a dia") ficam de
   fora: não funcionam no jogo. As abas recortáveis das pp. 31 e 41 foram cortadas: a quantidade vem do INVENTARIO.md.
   Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'aprendizagem', C = 11;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  var ORGANIZANDO = 'Organizando o conhecimento';
  function repetir(img, legenda, n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push(legenda ? { img: img, legenda: legenda } : { img: img });
    return r;
  }
  Reino.registrarCartas('matematica4', [
    // abertura: arrumando o quarto (pp. 26 a 28)
    carta('ma-a26', '🧸', 'Divisão em partes iguais – Capítulo 11', 26, [
      { t: 'figuras', itens: [{ img: '👩', legenda: 'a mãe tira o pó da cômoda' }, { img: '👧', legenda: 'a menina segura uma boneca' }] },
      { t: 'texto', texto: 'Na imagem: um quarto com brinquedos na cama e no tapete.' },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'O que a menina e a mãe dela estão fazendo?' },
        { texto: 'Em quais tarefas você ajuda em casa?' },
        { texto: 'Você acha que seria mais rápido arrumar o quarto com a ajuda de alguém ou sozinho? Por quê?' },
      ] },
    ], ['APR-26-qA', 'APR-26-qB', 'APR-26-qC']),
    carta('ma-a27', '💬', 'Conversa vem...', 27, [
      { t: 'texto', texto: 'Beatriz está ajudando a mãe a organizar o quarto. Ela precisa guardar os brinquedos nas prateleiras da estante. Observe a imagem da página anterior.' },
      { t: 'figuras', itens: [{ img: 'ma:11-boneca', legenda: 'boneca' }, { img: '🤖', legenda: 'robô' }, { img: '🧸', legenda: 'ursinho' },
        { img: '⚽', legenda: 'bola' }, { img: '🥁', legenda: 'tambor' }, { img: '🚗', legenda: 'carrinho' }] },
      { t: 'texto', texto: 'Na imagem: uma estante com duas prateleiras vazias.' },
      { t: 'quadro', itens: [
        { texto: 'Quantos brinquedos aparecem ao todo na imagem?' },
        { texto: 'Quantas prateleiras há na estante?' },
        { texto: 'De que maneira Beatriz pode distribuir os brinquedos nas prateleiras da estante?' },
      ] },
    ], ['APR-27-qC']),
    carta('ma-a28', '📦', 'Repartir em partes iguais', 28, [
      { t: 'texto', texto: 'Ao organizar o quarto, Beatriz separou alguns bichinhos de pelúcia para doação. Ela colocará essas pelúcias em caixas. Observe quantas pelúcias foram separadas e quantas caixas serão usadas.' },
      { t: 'figuras', itens: [{ img: '🧸' }, { img: '🐻' }, { img: '🐰' }, { img: '🐒' }, { img: '🧸' }, { img: '🐻' }, { img: '🐰' }, { img: '🐒' }] },
      { t: 'figuras', itens: [{ img: '📦', legenda: 'caixa' }, { img: '📦', legenda: 'caixa' }] },
      { t: 'texto', texto: 'Beatriz quer colocar a mesma quantidade de pelúcias em cada caixa.' },
      { t: 'texto', texto: 'Podemos dizer que 8 pelúcias distribuídas igualmente em 2 caixas é igual a 4 pelúcias em cada caixa.' },
    ]),

    // a divisão e o sinal ÷ (pp. 29 a 32)
    carta('ma-a29', '👥', 'Repartir em partes iguais', 29, [
      { t: 'texto', texto: 'O professor de Beatriz vai dividir a turma em 4 grupos com a mesma quantidade de alunos em cada um.' },
      { t: 'texto', texto: 'Observe a quantidade de alunos na turma de Beatriz.' },
      { t: 'texto', texto: 'Podemos dizer que 20 alunos divididos igualmente em 4 grupos é igual a 5 alunos em cada grupo.' },
      { t: 'texto', texto: 'Ao distribuir igualmente a quantidade de brinquedos nas caixas e ao dividir os alunos nos grupos, você resolveu uma divisão.' },
    ]),
    carta('ma-a30', '🃏', 'O sinal da divisão', 30, [
      { t: 'texto', texto: 'Observe a situação a seguir.' },
      { t: 'texto', texto: 'Tiago distribuirá igualmente a quantidade de cartas de um jogo entre ele e seus amigos.' },
      { t: 'texto', texto: 'Na imagem: 12 cartas e 3 crianças sentadas a uma mesa.' },
      { t: 'texto', texto: 'A situação descrita pode ser representada por uma divisão:' },
      { t: 'texto', texto: '12 cartas distribuídas igualmente entre 3 crianças é igual a 4 cartas para cada criança.' },
      { t: 'quadro', texto: '12 ÷ 3 = 4' },
      { t: 'texto', texto: 'Lemos: 12 dividido por 3 é igual a 4.' },
      { t: 'quadro', texto: 'Situações que envolvem repartir uma quantidade em partes iguais podem ser resolvidas por uma divisão. O sinal ÷ indica uma divisão.' },
    ]),
    carta('ma-a31', '✏️', ORGANIZANDO, 31, [
      { t: 'texto', texto: 'A quantidade de rosquinhas que a mãe de Izabel fez está representada na aba recortável. Essa quantidade será distribuída igualmente nos pratos a seguir.' },
      { t: 'figuras', itens: repetir('ma:11-rosquinha', '', 9) },
      { t: 'texto', texto: 'Na imagem: 3 pratos vazios.' },
    ]),
    carta('ma-a32', '✏️', ORGANIZANDO, 32, [
      { t: 'texto', texto: 'Beto vai ajudar a mãe a pendurar 12 camisetas no varal. Desenhe e pinte as camisetas distribuindo a mesma quantidade em cada corda do varal.' },
      { t: 'texto', texto: 'Na imagem: um varal com 2 cordas.' },
    ]),

    // grupos, palitos e tampinhas (pp. 33 a 35)
    carta('ma-a33', '✏️', ORGANIZANDO, 33, [
      { t: 'texto', texto: 'As crianças a seguir serão divididas em 2 grupos iguais.' },
      { t: 'figuras', itens: [{ img: '👦' }, { img: '👦' }, { img: '👧' }, { img: '👦' }, { img: '👧' }, { img: '👦' }, { img: '👧' }, { img: '👦' }, { img: '👦' }, { img: '👧' }] },
      { t: 'texto', texto: 'Doze palitos de picolé serão distribuídos igualmente entre Ana, Luiz, Felipe e Cecília.' },
    ]),
    carta('ma-a34', '✏️', ORGANIZANDO, 34, [
      { t: 'texto', texto: 'Forme grupos com 10 tampinhas em cada um deles.' },
      { t: 'texto', texto: 'Na imagem: 4 fileiras de tampinhas vermelhas, com 10 tampinhas em cada fileira.' },
      { t: 'texto', texto: 'Antônio quer dividir igualmente o valor desta cédula entre seus 5 sobrinhos. Para isso, ele deve trocar a cédula por outras de menor valor.' },
      { t: 'figuras', itens: [{ img: 'ma:cedula-50', legenda: '50 reais' }] },
    ]),
    carta('ma-a35', '✏️', ORGANIZANDO, 35, [
      { t: 'texto', texto: 'Em dupla com um colega, use 20 palitos de picolé para esta atividade. Juntos, vocês vão formar grupos com os palitos seguindo as indicações da tabela. Depois, cada um deve completar sua tabela com as informações que estão faltando.' },
      { t: 'quadro', texto: 'Lembre-se de que os grupos formados com os palitos devem ter a mesma quantidade.' },
      { t: 'texto', texto: 'Raquel pegou alguns palitos de picolé e formou estes grupos:' },
      { t: 'figuras', itens: repetir('ma:11-palitos', '', 6) },
    ]),

    // metade, dúzia e terça parte (pp. 36 a 38)
    carta('ma-a36', '✏️', 'Metade e terça parte – Metade', 36, [
      { t: 'texto', texto: 'Vítor vai dar metade das figurinhas repetidas que tem para a irmã dele, Marina.' },
      { t: 'texto', texto: 'Observe a quantidade de figurinhas repetidas de Vítor.' },
      { t: 'texto', texto: 'Na imagem: 2 fileiras de figurinhas de jogadores, com 7 figurinhas em cada fileira.' },
      { t: 'texto', texto: 'Para dar a metade dessas figurinhas para Marina, Vítor dividiu essa quantidade em duas partes iguais.' },
      { t: 'texto', texto: 'Assim, podemos dizer que 7 é a metade de 14.' },
      { t: 'quadro', texto: 'Dividir uma quantidade por 2 é o mesmo que calcular a metade dessa quantidade.' },
    ]),
    carta('ma-a37', '🖍️', 'Dúzia e meia dúzia', 37, [
      { t: 'texto', texto: 'Daniel ganhou da avó a caixa de lápis de cor representada a seguir.' },
      { t: 'fala', quem: 'Daniel', texto: 'Essa caixa tem uma dúzia de lápis de cor.' },
      { t: 'texto', texto: 'Na imagem: a caixa diz LÁPIS DE COR – 12 UNIDADES.' },
      { t: 'texto', texto: 'Daniel usou a metade dessa quantidade ou meia dúzia desses lápis para pintar um desenho.' },
      { t: 'quadro', texto: 'Uma dúzia são 12 unidades. Para calcular a metade de uma dúzia dividimos 12 por 2. Meia dúzia são 6 unidades.' },
    ]),
    carta('ma-a38', '👗', 'Terça parte', 38, [
      { t: 'texto', texto: 'Giovana está arrumando a mala para visitar os tios.' },
      { t: 'texto', texto: 'Observe a quantidade de blusas que ela tem no guarda-roupa.' },
      { t: 'texto', texto: 'Na imagem: 3 fileiras de blusas, com 4 blusas em cada fileira.' },
      { t: 'texto', texto: 'Giovana vai colocar a terça parte da quantidade de blusas na mala. Para isso, ela vai dividir a quantidade de blusas em três partes iguais.' },
      { t: 'texto', texto: 'Assim, podemos dizer que 4 é a terça parte de 12.' },
      { t: 'quadro', texto: 'Dividir uma quantidade por 3 é o mesmo que calcular a terça parte dessa quantidade.' },
    ]),

    // organizando: metade, terça parte e o bingo (pp. 39 a 42)
    carta('ma-a39', '✏️', ORGANIZANDO, 39, [
      { t: 'texto', texto: 'Pinte a metade da quantidade de bolas em cada situação. Depois, escreva a divisão correspondente.' },
      { t: 'texto', texto: 'Renata usou meia dúzia de ovos para fazer um quindim.' },
    ]),
    carta('ma-a40', '🎈', ORGANIZANDO, 40, [
      { t: 'texto', texto: 'Pinte a terça parte da quantidade de balões em cada situação. Depois, escreva a divisão correspondente.' },
      { t: 'texto', texto: 'Observe a quantidade de pães de queijo que a mãe de Isaque assou.' },
      { t: 'texto', texto: 'Na imagem: pães de queijo em 2 fileiras, uma com 8 e outra com 7.' },
    ]),
    carta('ma-a41', '🚗', ORGANIZANDO, 41, [
      { t: 'texto', texto: 'Na aba recortável desta página está representada a quantidade de carrinhos da coleção de Lucas. Recorte as figuras dos carrinhos.' },
      { t: 'texto', texto: 'Na aba recortável: 18 carrinhos.' },
    ]),
    carta('ma-a42', '🎲', 'Bingo da divisão', 42, [
      { t: 'texto', texto: 'Vamos jogar Bingo da divisão. Escolha 8 números de 1 a 20 e escreva-os na cartela a seguir.' },
      { t: 'texto', texto: 'O professor vai ditar uma divisão. Se você tiver o resultado dessa divisão na cartela, marque-o com um X.' },
      { t: 'texto', texto: 'Vence o jogo quem marcar todos os números da cartela primeiro e falar “bingo” em voz alta.' },
      { t: 'texto', texto: 'Depois de jogar, analise e responda às situações a seguir.' },
    ], ['APR-42-q6']),

    // problemas envolvendo a divisão (pp. 43 a 47)
    carta('ma-a43', '🎈', 'Problemas envolvendo a divisão (1 de 2)', 43, [
      { t: 'texto', texto: 'Leia o problema a seguir e depois responda aos itens.' },
      { t: 'texto', texto: 'Vanessa e a mãe dela estão arrumando o salão do prédio onde moram para uma festa de aniversário. Elas vão encher as bexigas destes 4 pacotes.' },
      { t: 'figuras', itens: repetir('🎈', '10 unidades', 4) },
      { t: 'texto', texto: 'Para pendurar as bexigas no salão de festas, elas vão formar 5 grupos com a mesma quantidade de bexigas em cada um.' },
      { t: 'texto', texto: 'Quantas bexigas cada grupo terá?' },
    ]),
    carta('ma-a43b', '🎈', 'Problemas envolvendo a divisão (2 de 2)', 43, [
      { t: 'texto', texto: 'Para resolver esse problema, precisamos calcular a quantidade total de bexigas por meio de uma multiplicação:' },
      { t: 'quadro', itens: [
        { texto: '4 × 10 bexigas = 40 bexigas' },
        { texto: 'São 40 bexigas no total.' },
        { texto: 'Depois, dividimos o resultado encontrado por 5:' },
        { texto: '40 bexigas ÷ 5 = 8 bexigas' },
        { texto: 'Logo, cada grupo terá 8 bexigas de festa.' },
      ] },
      { t: 'texto', texto: 'Explique aos colegas como você resolveria esse problema.' },
    ], ['APR-43-qB']),
    carta('ma-a44', '🍰', 'Problemas envolvendo a divisão', 44, [
      { t: 'texto', texto: 'Para a festa, a mãe de Vanessa fez 30 cupcakes de dois sabores: chocolate e morango. Quantos cupcakes de morango a mãe de Vanessa fez?' },
      { t: 'fala', quem: 'A mãe de Vanessa', texto: 'A terça parte da quantidade de cupcakes que eu fiz é de chocolate. O restante é de morango.' },
      { t: 'texto', texto: 'Podemos resolver esse problema por meio de uma divisão e de uma subtração:' },
      { t: 'quadro', itens: [
        { texto: '30 cupcakes ÷ 3 = 10 cupcakes' },
        { texto: 'São 10 cupcakes de chocolate.' },
        { texto: 'Depois, efetuamos a subtração' },
        { texto: '30 cupcakes - 10 cupcakes = 20 cupcakes' },
        { texto: 'Logo, 20 cupcakes são de morango.' },
      ] },
    ]),
    carta('ma-a45', '🍬', ORGANIZANDO, 45, [
      { t: 'texto', texto: 'Carla comprou um pacote com 18 balas e distribuiu igualmente essas balas entre seus 6 sobrinhos. Desenhe as balas para descobrir quantos doces cada sobrinho ganhou.' },
      { t: 'texto', texto: 'Na imagem: 6 quadros vazios, um para cada sobrinho.' },
    ]),
    carta('ma-a46', '🚶', ORGANIZANDO, 46, [
      { t: 'texto', texto: 'A turma de Luísa tem 24 alunos. A terça parte desses alunos vai para a escola a pé e o restante vai de carro.' },
      { t: 'texto', texto: 'Para ir da cantina até a biblioteca da escola, André deu 30 passos. Juliana deu a metade da quantidade de passos de André.' },
    ]),
    carta('ma-a47', '👥', ORGANIZANDO, 47, [
      { t: 'texto', texto: 'A professora do 2º ano vai dividir a turma em grupos iguais. Cada grupo terá 6 alunos cada um. Observe a quantidade de alunos que estudam nessa turma.' },
      { t: 'texto', texto: 'Na imagem: os alunos estão em 4 fileiras, com 8, 8, 7 e 9 alunos.' },
      { t: 'fala', quem: 'Um menino da turma', texto: 'Como você pode dividir essa turma para que todos os alunos participem de um grupo?' },
    ]),

    // saberes em ação: Cubra a metade (pp. 48 e 49)
    carta('ma-a48', '🃏', 'Saberes em ação – Cubra a metade (1 de 2)', 48, [
      { t: 'texto', texto: 'Vamos jogar Cubra a metade.' },
      { t: 'quadro', titulo: 'Materiais', itens: [{ texto: 'Tabuleiro da página 49.' }, { texto: 'Cartas do Material de apoio.' }] },
      { t: 'quadro', titulo: 'Como jogar', itens: [
        { texto: '1. Reúna-se com um colega.' },
        { texto: '2. Cada jogador deve escolher 8 números de 1 a 15 e escrever esses números no seu tabuleiro.' },
        { texto: '3. Juntem as cartas do jogo e, depois de embaralhar, façam um monte com elas sobre a mesa, com o verso voltado para cima.' },
        { texto: '4. Decidam quem começa jogando.' },
      ] },
    ], ['APR-48-qA']),
    carta('ma-a48b', '🃏', 'Saberes em ação – Cubra a metade (2 de 2)', 48, [
      { t: 'quadro', titulo: 'Como jogar', itens: [
        { texto: '5. Em cada rodada, o jogador da vez tira uma carta do monte.' },
        { texto: '6. Se a metade do número da carta estiver escrita no tabuleiro, ele deve cobrir essa metade com a carta. Caso contrário, deve devolvê-la para o monte. Em seguida, é vez do seu colega.' },
        { texto: '7. Vence o jogo quem cobrir todas as metades de seu tabuleiro primeiro.' },
      ] },
      { t: 'texto', texto: 'Durante uma partida de Cubra a metade, Helena estava com o tabuleiro dela assim:' },
      { t: 'texto', texto: 'Na imagem: todas as casas do tabuleiro estão cobertas por cartas, menos uma, a do número 7.' },
    ]),
    carta('ma-a49', '🃏', 'Saberes em ação – O tabuleiro', 49, [
      { t: 'texto', texto: 'O tabuleiro do jogo Cubra a metade: 8 casas em branco para escrever os números e, no meio, a casa verde Cubra a metade.' },
    ]),

    // testando as ideias (pp. 50 a 53)
    carta('ma-a50', '🖍️', 'Testando as ideias', 50, [
      { t: 'texto', texto: 'Denise vai distribuir igualmente esta quantidade de giz de cera entre 4 crianças.' },
      { t: 'texto', texto: 'Na imagem: 2 caixas de giz de cera, e cada caixa diz 6 GIZES.' },
      { t: 'texto', texto: 'Matias convidou 20 pessoas para a festa de aniversário dele. Os convidados serão distribuídos igualmente nestas mesas.' },
      { t: 'texto', texto: 'Na imagem: 5 mesas, cada uma com um vaso de flores.' },
    ]),
    carta('ma-a51', '🎂', 'Testando as ideias', 51, [
      { t: 'texto', texto: 'Ana fez meia dúzia de dobraduras de estrela e Bruno fez meia dezena de dobraduras de barco.' },
      { t: 'texto', texto: 'Davi é confeiteiro. Observe a quantidade de ovos que ele usou em algumas encomendas de bolos.' },
      { t: 'fala', quem: 'Davi', texto: 'Usei uma dúzia e meia de ovos nesses bolos.' },
    ]),
    carta('ma-a52', '📚', 'Testando as ideias', 52, [
      { t: 'texto', texto: 'Observe a quantia que Igor tem.' },
      { t: 'figuras', itens: [{ img: 'ma:cedula-20', legenda: '20 reais' }, { img: 'ma:cedula-10', legenda: '10 reais' }] },
      { t: 'texto', texto: 'Em uma caixa há 21 livros infantis que serão distribuídos igualmente em 3 prateleiras de uma estante.' },
    ]),
    carta('ma-a53', '💰', 'Testando as ideias – Agora você já sabe...', 53, [
      { t: 'texto', texto: 'Fabrício gastou a terça parte da quantia representada a seguir na compra de um gibi.' },
      { t: 'figuras', itens: repetir('ma:cedula-10', '10 reais', 3).concat(repetir('ma:cedula-2', '2 reais', 3)) },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Resolver problemas envolvendo a ideia de repartir em partes iguais da divisão.' },
        { texto: 'Calcular a metade de uma quantidade.' },
        { texto: 'Calcular a terça parte de uma quantidade.' },
        { texto: 'Reconhecer a meia dúzia como a metade de uma dúzia.' },
        { texto: 'Resolver problemas envolvendo a ideia de metade de uma quantidade.' },
        { texto: 'Resolver problemas envolvendo a ideia de terça parte de uma quantidade.' },
      ] },
      { t: 'texto', texto: 'Já sei · Preciso saber mais · Ainda não sei' },
    ], ['APR-53-qA']),
  ]);
})();
