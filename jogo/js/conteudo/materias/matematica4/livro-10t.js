/* Cartas do Livro de Atividades, Capítulo 10 "Sistema monetário" (pp. 1 a 6), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra. Página só de questões: carta curta
   com o título da seção e o que ela pede; as cédulas e moedas de cada questão vão no apoio do desafio. */
(function () {
  var L = 'atividades', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  function itens(lista) { return lista.map(function (t) { return { texto: t }; }); }
  var PROBLEMAS = 'Problemas envolvendo o nosso dinheiro';

  Reino.registrarCartas('matematica4', [
    // Nosso dinheiro (pp. 1 e 2)
    carta('ma-t01', '💰', 'Sistema monetário – Capítulo 10', 1, [
      { t: 'texto', texto: 'Nosso dinheiro' },
      { t: 'texto', texto: 'Ligue cada criança à quantia que ela tem no cofrinho.' },
      { t: 'fala', quem: 'Menina de cabelo preso', texto: 'Eu tenho R$ 35,75.' },
      { t: 'fala', quem: 'Menina de cabelo crespo', texto: 'Eu tenho R$ 102,25.' },
      { t: 'fala', quem: 'Menino de sardas', texto: 'Eu tenho R$ 80,05.' },
      { t: 'fala', quem: 'Menina de coques', texto: 'Eu tenho R$ 45,80.' },
      { t: 'fala', quem: 'Menino de cabelo preto', texto: 'Eu tenho R$ 121,10.' },
    ]),
    carta('ma-t02', '💰', 'Nosso dinheiro', 2, [
      { t: 'quadro', itens: itens([
        'Observe a quantia que Daniel e Helena gastaram na loja de brinquedos.',
        'Ao trocar uma cédula, André recebeu a seguinte quantia.',
      ]) },
      { t: 'quadro', titulo: 'Trocar dinheiro', texto: 'Trocar dinheiro é entregar um valor e receber em troca o mesmo valor, mas com uma quantidade diferente de cédulas ou moedas. Por exemplo: Trocar uma nota de R$ 10,00 por duas notas de R$ 5,00. Trocar duas moedas de R$ 0,50 por uma moeda de R$ 1,00.' },
      { t: 'quadro', itens: itens(['Observe a moeda que Ana tirou do cofrinho.']) },
    ]),

    // Problemas envolvendo o nosso dinheiro: trocas e compras (pp. 3 e 4)
    carta('ma-t03', '🛒', PROBLEMAS, 3, [
      { t: 'quadro', itens: itens([
        'Renato trocou esta cédula por moedas para colocar em seu cofrinho.',
        'Jairo trocou a cédula ao lado. Nessa troca, ele recebeu 5 cédulas iguais. Qual é o valor de cada cédula que Jairo recebeu?',
      ]) },
      { t: 'figuras', itens: [{ img: 'ma:cedula-5', legenda: 'a cédula de Renato' }, { img: 'ma:cedula-100', legenda: 'a cédula de Jairo' }] },
    ]),
    carta('ma-t04', '🛒', PROBLEMAS, 4, [
      { t: 'quadro', itens: itens([
        'Na volta da escola, Amanda e a mãe dela passaram na padaria e na farmácia.',
        'O pai de Felipe comprou um brinquedo e pagou com uma cédula de R$ 50,00.',
        'Marina já tinha comprado um patinete que custou R$ 175,00 quando gastou esta quantia na compra de um jogo de «videogame».',
      ]) },
    ]),

    // Problemas envolvendo o nosso dinheiro: cofrinhos e poupança (pp. 5 e 6)
    carta('ma-t05', '🐷', PROBLEMAS, 5, [
      { t: 'quadro', itens: itens([
        'Em cada cofrinho representado a seguir, há 10 moedas de 1 real. Escreva a quantia total em reais em cada situação.',
        'Jorge ganhou do avô 3 cédulas iguais à cédula que está representada ao lado.',
      ]) },
      { t: 'figuras', itens: [{ img: 'ma:cedula-2', legenda: '2 reais' }] },
    ]),
    carta('ma-t06', '🐷', PROBLEMAS, 6, [
      { t: 'quadro', itens: itens([
        'Denise deu uma cédula de 5 reais para cada um de seus filhos.',
        'Ana, Paula e Bruno são irmãos e começaram a poupar. Depois de algum tempo, Bruno conseguiu poupar a quantia representada a seguir.',
      ]) },
      { t: 'figuras', itens: [{ img: 'ma:cedula-5', legenda: '5 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }, { img: 'ma:cedula-2', legenda: '2 reais' }] },
    ]),
  ]);
})();
