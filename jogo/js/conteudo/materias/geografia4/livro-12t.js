/* Cartas do Livro de Atividades, Capítulo 12 "Transformação das paisagens" (pp. 9 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra: o enunciado de cada página e as
   legendas das fotos; as ilustrações sem legenda da p. 12 ganham uma descrição curta (ícones em icones-12.js). */
(function () {
  var L = 'atividades', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('geografia4', [
    // a natureza transforma as paisagens (pp. 9 e 10)
    carta('ge-t09', '🌊', 'A natureza transforma as paisagens', 9, [
      { t: 'texto', texto: 'Observe as imagens a seguir. Elas mostram quatro momentos da Baía de Fundy, na costa atlântica do Canadá.' },
      { t: 'lista', itens: [
        { termo: 'A', texto: 'Turistas visitando a Baía de Fundy quando as águas do mar estão mais recuadas, fenômeno conhecido como maré baixa.' },
        { termo: 'B', texto: 'Momento do dia em que as águas do mar começam a avançar sobre o solo da Baía de Fundy, iniciando o processo de maré alta.' },
        { termo: 'C', texto: 'Momento do dia que mostra a intensidade do avanço das águas do mar sobre o solo da Baía de Fundy.' },
        { termo: 'D', texto: 'Momento do dia em que as águas do mar alcançam plenamente o solo da Baía de Fundy, fenômeno conhecido como maré alta.' },
      ] },
    ]),
    carta('ge-t10', '🧊', 'A natureza transforma as paisagens', 10, [
      { t: 'texto', texto: 'Em países com temperaturas muito baixas, o gelo modifica anualmente as paisagens. Observe as imagens do Lago Baikal, na Rússia, durante as estações do inverno e do verão.' },
      { t: 'figuras', itens: [
        { img: '🧊', legenda: 'Pessoas, com automóveis e a pé, em cima das águas congeladas do Lago Baikal durante o inverno. Khuzhir, Rússia.' },
        { img: '🌊', legenda: 'Lago Baikal durante o verão. Khuzhir, Rússia.' },
      ] },
    ]),

    // as atividades humanas transformam as paisagens (pp. 11 e 12)
    carta('ge-t11', '🌇', 'As atividades humanas transformam as paisagens', 11, [
      { t: 'texto', texto: 'Observe as duas fotografias a seguir. Depois, responda aos itens.' },
      { t: 'figuras', itens: [
        { img: 'ge:12-avenida-antiga', legenda: 'Vista parcial da região central de Belo Horizonte, Minas Gerais, em 1928.' },
        { img: '🌇', legenda: 'Vista da região central de Belo Horizonte, em Minas Gerais, em 2022.' },
      ] },
      { t: 'texto', texto: 'Na foto de 1928, há muita mata, uma avenida reta e poucas construções. Na foto de 2022, há muitos prédios altos e ruas, e pouca vegetação. A serra ao fundo é a mesma.' },
    ]),
    carta('ge-t12', '🐟', 'As atividades humanas transformam as paisagens', 12, [
      { t: 'texto', texto: 'Compare as ilustrações a seguir, que representam um mesmo rio, mas em duas situações diferentes.' },
      { t: 'figuras', itens: [
        { img: '🏞', legenda: 'Imagem A: o rio limpo, com a margem verde, uma gaivota numa pedra, peixes, tartaruga e algas.' },
        { img: 'ge:12-rio-sujo', legenda: 'Imagem B: uma gaivota com uma sacola plástica no bico, em cima de um cano que despeja esgoto no rio. Na água, há saco de lixo, garrafas plásticas, latinha, saco plástico e garrafa de vidro.' },
      ] },
    ]),
  ]);
})();
