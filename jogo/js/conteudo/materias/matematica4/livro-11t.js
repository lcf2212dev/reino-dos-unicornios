/* Cartas do Livro de Atividades, Capítulo 11 "Divisão em partes iguais" (pp. 7 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra. Página só de questões: carta curta
   com o título da seção e o que ela pede; balas e doces são as ilustrações ma-t07-* e ma-t09-* (icones-t.js). */
(function () {
  var L = 'atividades', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  function itens(lista) { return lista.map(function (t) { return { texto: t }; }); }
  var REPARTIR = 'Repartir em partes iguais', METADE = 'Metade e terça parte', PROBLEMAS = 'Problemas envolvendo a divisão';

  Reino.registrarCartas('matematica4', [
    // Repartir em partes iguais (pp. 7 e 8)
    carta('ma-t07', '🍫', 'Divisão em partes iguais – Capítulo 11', 7, [
      { t: 'texto', texto: REPARTIR },
      { t: 'quadro', itens: itens([
        'Murilo comprou um pacote de balas e vai dividir essas balas com os amigos dele. Trace linhas para dividir igualmente as balas entre Murilo e os amigos.',
      ]) },
      { t: 'ilustracao', id: 'ma-t07-balas', alt: '12 balas embrulhadas, numa fileira só: azul, rosa, amarela e roxa, repetidas.' },
      { t: 'quadro', itens: itens([
        'Para uma atividade, serão distribuídos igualmente 18 palitos de picolé entre 3 alunos. Desenhe a quantidade de palitos de picolé que cada aluno vai receber.',
      ]) },
    ]),
    carta('ma-t08', '👧', REPARTIR, 8, [
      { t: 'quadro', itens: itens([
        'As crianças devem ser divididas em grupos com a mesma quantidade de participantes. Complete o quadro escrevendo a divisão que representa cada situação.',
      ]) },
      { t: 'tabela', cab: ['Quantidade total de crianças', 'Quantidade de grupos'], linhas: [['8', '4'], ['12', '2'], ['20', '5']] },
    ]),

    // Metade e terça parte (pp. 9 e 10)
    carta('ma-t09', '🍰', METADE + ' – Capítulo 11', 9, [
      { t: 'quadro', itens: itens(['A mãe de Larissa fez estes «cupcakes» para o lanche da tarde.']) },
      { t: 'ilustracao', id: 'ma-t09-cupcakes', alt: '8 «cupcakes» de cobertura rosa, em duas fileiras de 4.' },
      { t: 'quadro', itens: itens(['Observe a quantidade de maçãs do amor que Manoel estava vendendo no parque.']) },
      { t: 'ilustracao', id: 'ma-t09-macas', alt: '21 maçãs do amor no palito, em três fileiras de 7.' },
    ]),
    carta('ma-t10', '🍰', METADE, 10, [
      { t: 'quadro', itens: itens([
        'Descubra a metade e a terça parte de cada quantidade de bolinhas de tênis. Depois, complete o quadro com as informações que faltam.',
        'Ricardo tinha a quantia representada abaixo na carteira e gastou a metade na cantina da escola.',
      ]) },
      { t: 'figuras', itens: [{ img: 'ma:cedula-10', legenda: '10 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }] },
    ]),

    // Problemas envolvendo a divisão (pp. 11 e 12)
    carta('ma-t11', '🍓', PROBLEMAS + ' – Capítulo 11', 11, [
      { t: 'quadro', itens: itens([
        'Deise colheu morangos da horta. Ela deu 12 morangos para seu filho Miguel e a metade dessa quantidade para sua filha Marina.',
        'Carla tem 18 livros infantis na estante.',
      ]) },
      { t: 'fala', quem: 'Carla', texto: 'Já li a terça parte desses livros.' },
    ]),
    carta('ma-t12', '📖', PROBLEMAS, 12, [
      { t: 'quadro', itens: itens([
        'Lucas leu 18 páginas de um livro na segunda-feira e a metade dessa quantidade de páginas na terça-feira.',
        'João gastou a terça parte da quantia que tinha na compra de um gibi. Observe a quantia que ele tinha.',
      ]) },
    ]),
  ]);
})();
