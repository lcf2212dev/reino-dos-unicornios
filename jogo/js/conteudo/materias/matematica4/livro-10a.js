/* Cartas do Livro de Aprendizagem, sumário e Capítulo 10 "Sistema monetário" (pp. 2 a 25), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; as falas dos balões (em maiúsculas
   no livro) vêm em letra normal. As cenas e os preços das ilustrações viram texto curto; as moedas e cédulas, figuras
   (ma:moeda-*, ma:cedula-*, de icones-10.js). Página só de questões: carta curta com o que a questão precisa.
   Conversa oral: soLeitura na carta que a mostra. */
(function () {
  var L = 'aprendizagem', C = 10;
  function carta(id, e, titulo, pagina, blocos, soLeitura) {
    var c = { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
    if (soLeitura) c.soLeitura = soLeitura;
    return c;
  }
  function fig(chave, legenda) { return { img: 'ma:' + chave, legenda: legenda }; }
  var ORGANIZANDO = 'Organizando o conhecimento', TESTANDO = 'Testando as ideias';
  Reino.registrarCartas('matematica4', [
    carta('ma-a02', '📖', 'Sumário', 2, [
      { t: 'lista', itens: [
        { termo: 'Capítulo 10 – Sistema monetário:', texto: 'página 3' },
        { termo: 'Capítulo 11 – Divisão em partes iguais:', texto: 'página 26' },
        { termo: 'Capítulo 12 – Estatística:', texto: 'página 54' },
      ] },
    ]),

    // abertura, Conversa vai / vem (pp. 3 e 4)
    carta('ma-a03', '🛒', 'Sistema monetário – Capítulo 10', 3, [
      { t: 'texto', texto: 'No caixa do mercado, um cartaz na parede diz: "Senhor cliente, traga suas moedas para facilitar o troco." A tela do caixa mostra: "Total R$ 45,00". O avô de Murilo entrega ao caixa uma cédula de 50 reais. Murilo está ao lado dele, sorridente.' },
      { t: 'figuras', itens: [fig('cedula-50', 'a cédula do avô de Murilo')] },
      { t: 'quadro', titulo: 'Conversa vai...', itens: [
        { texto: 'Por que o cartaz pede aos clientes que tragam moedas?' },
        { texto: 'O que pode acontecer se o caixa não tiver troco para o cliente?' },
        { texto: 'Por que trazer moedas é bom para todo mundo?' },
      ] },
    ], ['APR-03-qB', 'APR-03-qC']),
    carta('ma-a04', '💬', 'Conversa vem...', 4, [
      { t: 'texto', texto: 'Murilo e o avô dele foram às compras no mercado do bairro. Observe a imagem da página anterior.' },
      { t: 'lista', itens: [
        { texto: 'Qual foi o valor total da compra que eles fizeram?' },
        { texto: 'Qual cédula o avô de Murilo usou para pagar a compra?' },
        { texto: 'Quantos reais o avô de Murilo deve receber de troco?' },
      ] },
    ]),

    // Nosso dinheiro (pp. 5 e 6)
    carta('ma-a05', '🐟', 'Nosso dinheiro', 5, [
      { t: 'texto', texto: 'Você sabe como o dinheiro surgiu? Leia a história a seguir para descobrir.' },
      { t: 'texto', texto: 'Quando o dinheiro não existia, as pessoas trocavam produtos.' },
      { t: 'fala', quem: 'O moço do peixe', texto: 'Troca esse peixe por essas frutas?' },
      { t: 'fala', quem: 'A moça das frutas', texto: 'Troco!' },
      { t: 'texto', texto: 'Mas era difícil encontrar o produto certo para a troca.' },
      { t: 'fala', quem: 'O moço das verduras', texto: 'Agora eu quero um peixe, mas você só tem frutas... Como vamos trocar?' },
      { t: 'fala', quem: 'O moço das frutas', texto: 'Isso está ficando complicado!' },
      { t: 'texto', texto: 'Então, as pessoas decidiram usar moedas feitas de metal para facilitar as trocas.' },
      { t: 'texto', texto: 'Hoje, usamos dinheiro para trocar por tudo de que precisamos!' },
      { t: 'quadro', titulo: 'Conversa', texto: 'Em que situações do seu dia a dia você usa dinheiro?' },
    ], ['APR-05-qA']),
    carta('ma-a06', '🪙', 'Nosso dinheiro: moedas e cédulas', 6, [
      { t: 'texto', texto: 'O dinheiro brasileiro é o Real. Ele é apresentado nos formatos de moedas e cédulas.' },
      { t: 'texto', texto: 'Moedas:' },
      { t: 'figuras', itens: [fig('moeda-1c', '1 centavo'), fig('moeda-5c', '5 centavos'), fig('moeda-10c', '10 centavos'),
        fig('moeda-25c', '25 centavos'), fig('moeda-50c', '50 centavos'), fig('moeda-1', '1 real')] },
      { t: 'texto', texto: 'Cédulas:' },
      { t: 'figuras', itens: [fig('cedula-2', '2 reais'), fig('cedula-5', '5 reais'), fig('cedula-10', '10 reais'),
        fig('cedula-20', '20 reais'), fig('cedula-50', '50 reais'), fig('cedula-100', '100 reais'), fig('cedula-200', '200 reais')] },
      { t: 'texto', texto: 'O símbolo do Real é R. Para escrever valores em reais, usamos esse símbolo seguido do cifrão ($). Assim: R$.' },
    ]),
    carta('ma-a06b', '🪙', 'Reais e centavos', 6, [
      { t: 'texto', texto: 'Observe o preço de um dos produtos que Murilo e o avô dele compraram no mercado: a caixa de suco de uva custa R$ 5,25.' },
      { t: 'texto', texto: 'O preço da caixa de suco pode ser pago com a cédula e a moeda mostradas a seguir.' },
      { t: 'figuras', itens: [fig('cedula-5', '5 reais'), fig('moeda-25c', '25 centavos')] },
      { t: 'texto', texto: 'Observe que o número que representa o valor da cédula vem antes da vírgula, e o que representa o valor da moeda vem depois da vírgula.' },
      { t: 'quadro', titulo: 'R$ 5,25', texto: 'A vírgula separa os valores em reais dos valores em centavos. Antes da vírgula: 5 reais. Depois da vírgula: 25 centavos.' },
    ]),

    // Trocando moedas, trocando cédulas (pp. 7 e 8)
    carta('ma-a07', '🐷', 'Trocando moedas', 7, [
      { t: 'texto', texto: 'Observe as cenas a seguir. Murilo pensa numa salada de frutas de R$ 6,50. Ele sacode o cofrinho, e as moedas caem na cama.' },
      { t: 'fala', quem: 'Murilo', texto: 'Vou trocar uma dessas moedas de 1 real por outras de menor valor.' },
      { t: 'figuras', itens: [fig('moeda-1', 'moeda de 1 real')] },
      { t: 'quadro', titulo: 'Para saber mais', texto: 'As cédulas e as moedas do Real têm tamanhos diferentes para que pessoas com deficiência visual possam identificar seus valores com mais facilidade.' },
      { t: 'texto', texto: 'A moeda de um real, por exemplo, é a maior de todas. Ela mede 27 milímetros.' },
    ]),
    carta('ma-a08', '💵', 'Trocando cédulas', 8, [
      { t: 'texto', texto: 'Murilo e Gabriela são irmãos e acabaram de trocar as moedas que tinham nos cofrinhos de cada um por cédulas.' },
      { t: 'texto', texto: 'Observe, a seguir, a quantia que cada um deles recebeu.' },
      { t: 'lista', itens: [
        { termo: 'Murilo:', texto: 'uma cédula de 100 reais e uma cédula de 20 reais.' },
        { termo: 'Gabriela:', texto: 'duas cédulas de 50 reais e duas cédulas de 10 reais.' },
      ] },
      { t: 'quadro', texto: 'Observe que as cédulas de R$ 100,00 e de R$ 20,00 podem ser trocadas por outras de menor valor. Uma cédula de 100 reais tem o mesmo valor de duas cédulas de 50 reais. Uma cédula de 20 reais tem o mesmo valor de duas cédulas de 10 reais.' },
    ]),

    // Organizando o conhecimento, q1 a q6 (pp. 9 a 12)
    carta('ma-a09', '🍫', ORGANIZANDO, 9, [
      { t: 'texto', texto: 'Na cantina da escola, Gabriel comprou uma barra de chocolate. Veja o preço dessa barra: o chocolate ao leite custa R$ 2,50.' },
      { t: 'texto', texto: 'Este é o preço de um carrinho em uma loja de brinquedos:' },
      { t: 'figuras', itens: [fig('cedula-50', 'cédula de 50 reais'), fig('moeda-10c', 'moeda de 10 centavos')] },
    ]),
    carta('ma-a10', '🧸', ORGANIZANDO, 10, [
      { t: 'texto', texto: 'Observe os preços dos brinquedos de madeira que as crianças compraram em uma feira de artesanato.' },
      { t: 'tabela', cab: ['Criança', 'Brinquedo', 'Preço'], linhas: [
        ['Marina', 'blocos de montar', 'R$ 100,75'],
        ['Caio', 'trenzinho', 'R$ 30,25'],
        ['Vítor', 'aviãozinho', 'R$ 25,30'],
        ['Alana', 'bicicletinha', 'R$ 210,50'],
      ] },
    ]),
    carta('ma-a11', '🪙', ORGANIZANDO, 11, [
      { t: 'texto', texto: 'Bruno, Mateus e Lorena levaram as moedas dos cofrinhos que cada um tinha até a mercearia do bairro para trocá-las por cédulas.' },
      { t: 'lista', itens: [
        { termo: 'Bruno:', texto: '6 moedas de 50 centavos e 8 moedas de 25 centavos.' },
        { termo: 'Mateus:', texto: '5 moedas de 1 real e 10 moedas de 50 centavos.' },
        { termo: 'Lorena:', texto: '2 moedas de 25 centavos, 2 moedas de 50 centavos e 5 moedas de 10 centavos.' },
      ] },
      { t: 'figuras', itens: [fig('cedula-2', '2 reais'), fig('cedula-5', '5 reais'), fig('cedula-10', '10 reais')] },
    ]),
    carta('ma-a12', '💵', ORGANIZANDO, 12, [
      { t: 'texto', texto: 'Rita trabalha no caixa de um mercado.' },
      { t: 'fala', quem: 'Rita', texto: 'Vou dar o troco usando a menor quantidade possível de cédulas.' },
      { t: 'texto', texto: 'Rita precisa dar R$ 59,00 de troco a um cliente.' },
      { t: 'texto', texto: 'Observe a cédula que Elias vai trocar por cédulas de menor valor na padaria.' },
      { t: 'figuras', itens: [fig('cedula-200', 'cédula de 200 reais')] },
    ]),

    // Problemas envolvendo o nosso dinheiro (pp. 13 a 15)
    carta('ma-a13', '🐷', 'Problemas envolvendo o nosso dinheiro', 13, [
      { t: 'fala', quem: 'Isabela', texto: 'Aprendi com a minha mãe que poupar é importante!' },
      { t: 'texto', texto: 'Isabela ganhou da tia uma quantia em dinheiro como presente de aniversário. Ela usou uma parte dessa quantia para comprar um diário e guardou o restante no cofrinho.' },
      { t: 'quadro', texto: 'Poupar é guardar uma parte do dinheiro para usar depois, quando você quiser comprar algo especial ou quando precisar dele.' },
      { t: 'texto', texto: 'Isabela guardou no cofrinho a quantia representada a seguir.' },
      { t: 'figuras', itens: [fig('cedula-100', '100 reais'), fig('cedula-50', '50 reais'), fig('cedula-20', '20 reais'),
        fig('cedula-5', '5 reais'), fig('cedula-2', '2 reais'), fig('cedula-2', '2 reais'), fig('cedula-2', '2 reais')] },
    ]),
    carta('ma-a14', '🧸', 'A boneca de Isabela', 14, [
      { t: 'texto', texto: 'Isabela vai usar o dinheiro que guardou no cofrinho para comprar esta boneca, que custa R$ 69,00.' },
      { t: 'texto', texto: 'A quantia que vai sobrar para Isabela também pode ser calculada no quadro de ordens. Acompanhe a resolução apresentada a seguir.' },
      { t: 'tabela', cab: ['C', 'D', 'U'], linhas: [['1', '8 (vira 7)', '1 (vira 11)'], ['-', '6', '9'], ['1', '1', '2']] },
      { t: 'texto', texto: 'Não é possível subtrair 9 U de 1 U. Tiramos 1 D de 8 D: 8 D - 1 D = 7 D. Trocamos 1 D por 10 U e juntamos com a unidade já existente. 1 U + 10 U = 11 U. 11 U - 9 U = 2 U. 7 D - 6 D = 1 D. 1 C - 0 C = 1 C.' },
    ]),
    carta('ma-a15', '🥪', 'O dobro', 15, [
      { t: 'texto', texto: 'Em outro dia, Isabela e a amiga Ana compraram lanches na cantina da escola. Ana gastou o dobro da quantia que Isabela gastou.' },
      { t: 'fala', quem: 'Isabela', texto: 'Eu gastei R$ 15,00 na cantina.' },
      { t: 'quadro', texto: 'O dobro de R$ 15,00 também pode ser calculado por meio de uma multiplicação: 2 × 15 = 30.' },
    ]),

    // Organizando o conhecimento, q1 a q5 (pp. 16 a 19)
    carta('ma-a16', '⚽', ORGANIZANDO, 16, [
      { t: 'texto', texto: 'O pai de Caio fez uma pesquisa de preços de brinquedos em duas lojas. Observe os preços que ele encontrou.' },
      { t: 'tabela', cab: ['Brinquedo', 'Loja Brinca Mais', 'Loja Brinquedão'], linhas: [
        ['bola de futebol', 'R$ 14,00', 'R$ 16,00'],
        ['patinete', 'R$ 79,00', 'R$ 75,00'],
      ] },
    ]),
    carta('ma-a17', '🍬', ORGANIZANDO, 17, [
      { t: 'texto', texto: 'Calcule o dobro e o triplo de cada uma das quantias mostradas a seguir.' },
      { t: 'texto', texto: 'Davi comprou na cantina 4 pirulitos para ele e os colegas. Cada pirulito custou a quantia representada a seguir.' },
      { t: 'figuras', itens: [fig('cedula-2', 'cada pirulito: 2 reais')] },
    ]),
    carta('ma-a18', '🎒', ORGANIZANDO, 18, [
      { t: 'texto', texto: 'Observe os preços de alguns produtos vendidos na papelaria do bairro onde Catarina mora.' },
      { t: 'tabela', cab: ['Produto', 'Preço'], linhas: [
        ['mochila', 'R$ 79,00'],
        ['caderno', 'R$ 29,00'],
        ['estojo', 'R$ 28,00'],
        ['caixa de lápis de cor', 'R$ 32,00'],
      ] },
    ]),
    carta('ma-a19', '🎮', ORGANIZANDO, 19, [
      { t: 'texto', texto: 'Joana e Bruno são irmãos e resolveram juntar o dinheiro que estavam poupando para comprar um jogo de videogame. Observe a quantia que cada um deles tinha poupado.' },
      { t: 'lista', itens: [
        { termo: 'Joana:', texto: 'uma cédula de 100 reais, uma cédula de 20 reais e quatro cédulas de 2 reais.' },
        { termo: 'Bruno:', texto: 'uma cédula de 100 reais, uma cédula de 50 reais, uma cédula de 20 reais e uma cédula de 2 reais.' },
      ] },
    ]),

    // Saberes em ação (p. 20)
    carta('ma-a20', '🃏', 'Saberes em ação', 20, [
      { t: 'texto', texto: 'Vamos jogar Memória das quantias. Recorte as cartas do jogo que estão no Material de apoio.' },
      { t: 'quadro', titulo: 'Como jogar', itens: [
        { texto: 'Reúna-se com um colega e decidam quem começa jogando.' },
        { texto: 'Embaralhem as cartas e coloquem todas viradas sobre a mesa, com o verso para baixo.' },
        { texto: 'Observem as cartas por alguns segundos e depois virem todas com o verso para cima.' },
        { texto: 'Na sua vez, tire duas cartas. Se as cartas tiverem a mesma quantia, fique com elas. Se as quantias forem diferentes, desvire as cartas. Em seguida, é a vez do seu colega.' },
        { texto: 'O jogo acaba quando não houver mais cartas na mesa.' },
        { texto: 'Vence o jogo quem tiver mais cartas no final.' },
      ] },
    ]),
    carta('ma-a20b', '🃏', 'Memória das quantias: cartas novas', 20, [
      { t: 'fala', quem: 'Menino', texto: 'Adicionar os valores das moedas e das cédulas pode ajudar a encontrar os pares de cartas!' },
      { t: 'texto', texto: 'Depois dessa partida, você vai criar cartas novas para o jogo, diferentes das que já foram usadas. Para cada quantia a seguir, desenhe ao lado cédulas e moedas para formar o par.' },
      { t: 'figuras', itens: [fig('cedula-20', '20 reais'), fig('cedula-200', '200 reais')] },
      { t: 'quadro', titulo: 'Conversa', texto: 'Converse com seus colegas para descobrir se todos desenharam cartas com as mesmas quantias.' },
    ], ['APR-20-qC']),

    // Testando as ideias, q1 a q8, e Agora você já sabe (pp. 21 a 25)
    carta('ma-a21', '🥪', TESTANDO, 21, [
      { t: 'texto', texto: 'Observe o preço do sanduíche natural que Denise vai comprar na cantina da escola: R$ 12,75.' },
    ]),
    carta('ma-a22', '🪙', TESTANDO, 22, [
      { t: 'texto', texto: 'Paulo trocou as moedas representadas a seguir por cédulas.' },
      { t: 'figuras', itens: [fig('moeda-5c'), fig('moeda-5c'), fig('moeda-5c'), fig('moeda-5c'), fig('moeda-5c'), fig('moeda-5c')] },
      { t: 'figuras', itens: [fig('moeda-10c'), fig('moeda-10c'), fig('moeda-10c'), fig('moeda-10c'), fig('moeda-10c'), fig('moeda-10c'), fig('moeda-10c')] },
      { t: 'figuras', itens: [fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c'), fig('moeda-25c')] },
      { t: 'figuras', itens: [fig('moeda-50c'), fig('moeda-50c'), fig('moeda-50c'), fig('moeda-50c')] },
    ]),
    carta('ma-a23', '🛒', TESTANDO, 23, [
      { t: 'texto', texto: 'Fábio foi às compras com a avó. Eles gastaram R$ 23,00 na padaria e R$ 89,00 na farmácia.' },
      { t: 'texto', texto: 'Na compra de alguns pacotes de figurinhas, Patrícia recebeu R$ 26,00 de troco. Ela usou apenas uma cédula para pagar a compra.' },
      { t: 'fala', quem: 'Patrícia', texto: 'Os pacotes de figurinhas custaram R$ 24,00.' },
    ]),
    carta('ma-a24', '👗', TESTANDO, 24, [
      { t: 'texto', texto: 'A tia de Sara pagou as roupas a seguir com uma cédula de R$ 200,00 e uma de R$ 50,00.' },
      { t: 'tabela', cab: ['Roupa', 'Preço'], linhas: [['blusa', 'R$ 90,00'], ['saia', 'R$ 125,00']] },
      { t: 'texto', texto: 'Betina foi ao parque de diversões com a mãe. Observe o preço de alguns doces que elas compraram no parque.' },
      { t: 'tabela', cab: ['Doce', 'Preço'], linhas: [['balde de pipoca', 'R$ 5,00'], ['algodão-doce', 'R$ 8,00']] },
    ]),
    carta('ma-a25', '🎈', TESTANDO, 25, [
      { t: 'texto', texto: 'Alice tem R$ 30,00 e precisa comprar três pacotes de balões para sua festa de aniversário. Cada pacote de balão custa R$ 8,00.' },
      { t: 'quadro', titulo: 'Agora você já sabe...', itens: [
        { texto: 'Reconhecer e comparar o valor das cédulas e das moedas do nosso dinheiro.' },
        { texto: 'Realizar trocas com cédulas e moedas.' },
        { texto: 'Resolver problemas de adição com cédulas e moedas.' },
        { texto: 'Resolver problemas de subtração com cédulas e moedas.' },
        { texto: 'Resolver problemas de multiplicação com cédulas e moedas.' },
      ] },
      { t: 'texto', texto: 'Já sei – Preciso saber mais – Ainda não sei' },
    ], ['APR-25-qA']),
  ]);
})();
