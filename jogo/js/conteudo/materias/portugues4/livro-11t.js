/* Cartas do Livro de Atividades, Capítulo 11 "Quem canta..." (pp. 7 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; a letra de canção vem inteira.
   Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'atividades', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  function itens(lista) { return lista.map(function (t) { return { texto: t }; }); }

  Reino.registrarCartas('portugues4', [
    // Letra de canção: O animal de estimação (pp. 7 e 8)
    carta('lp-t07', '🐟', 'O animal de estimação', 7, [
      { t: 'texto', texto: 'Leia o trecho da letra de canção a seguir. Depois, responda às questões.' },
      { t: 'versos', versos: [
        'Pode ser um peixe', 'Que nunca sai do aquário', 'Ou um papagaio', 'Expandindo seu vocabulário', '',
        'Pode ser um hamster', 'Fiel maratonista', 'Ou uma tartaruga', 'Que bem lentamente te conquista', '',
        'Você sabe bem como é gostosa a sensação', 'De ter um animal de estimação!',
      ] },
      { t: 'fonte', texto: 'GRUPO Cria. O animal de estimação. Disponível em: https://www.letras.mus.br/grupo-cria/o-animal-de-estimacao/. Acesso em: 20 mar. 2025.' },
    ]),
    carta('lp-t08', '📝', 'Letra de canção', 8, [
      { t: 'quadro', itens: itens([
        'Procure no trecho da canção uma palavra que rima com cada palavra a seguir.',
        'Quais bichos a canção apresenta como animais de estimação? Desenhe e escreva o nome de cada bicho nas linhas embaixo dos desenhos.',
        'Pinte as características que podem fazer parte de uma letra de canção.',
      ]) },
    ]),

    // Gêneros do substantivo: masculino e feminino (pp. 9 e 10)
    carta('lp-t09', '📝', 'Gêneros do substantivo: masculino e feminino', 9, [
      { t: 'quadro', itens: itens([
        'Ligue os substantivos masculinos à versão deles no feminino.',
        'Numere cada palavra de acordo com a legenda para indicar se é um substantivo masculino (1) ou feminino (2).',
        'Complete o quadro para formar masculino e feminino de cada palavra.',
      ]) },
    ]),
    carta('lp-t10', '📝', 'Masculino e feminino', 10, [
      { t: 'quadro', itens: itens([
        'Escreva o substantivo feminino dos animais representados a seguir.',
        'Reescreva as frases trocando as palavras destacadas pelo substantivo masculino correspondente.',
      ]) },
      { t: 'figuras', itens: [{ img: '🐱', legenda: 'gato' }, { img: 'lp:11-tigre', legenda: 'tigre' }, { img: 'palavra:coelho', legenda: 'coelho' }] },
    ]),

    // Graus do substantivo: aumentativo e diminutivo (pp. 11 e 12)
    carta('lp-t11', '📝', 'Graus do substantivo: aumentativo e diminutivo', 11, [
      { t: 'quadro', itens: itens([
        'As palavras a seguir estão no grau aumentativo ou no diminutivo? Ligue cada palavra ao quadro certo.',
        'Escreva o diminutivo das palavras a seguir.',
        'Circule as palavras diferentes de cada grupo, ou seja, aquelas palavras que não estão no mesmo grau das outras.',
      ]) },
    ]),
    carta('lp-t12', '📝', 'Aumentativo e diminutivo', 12, [
      { t: 'quadro', itens: itens(['Escreva o aumentativo e o diminutivo de cada um dos animais representados a seguir.']) },
      { t: 'figuras', itens: [
        { img: '🐟', legenda: 'peixe' }, { img: 'palavra:cachorro', legenda: 'cachorro' }, { img: 'lp:11-rato', legenda: 'rato' },
        { img: '🐢', legenda: 'tartaruga' }, { img: '🐦', legenda: 'pássaro' },
      ] },
    ]),
  ]);
})();
