/* Cartas do Livro de Atividades, Capítulo 12 "As plantas se relacionam" (pp. 9 a 12), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Os desenhos e as fotos viram uma descrição curta; o trecho de
   "Caraminholas de Barrigapé" (p. 12) vem inteiro, em duas cartas. Página só de questões: carta curta. */
(function () {
  var L = 'atividades', C = 12;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  var TITULO = 'Plantas, outros seres vivos e o ambiente';
  Reino.registrarCartas('ciencias4', [
    // polinização e dispersão (pp. 9 e 10)
    carta('ci-t09', '🐝', TITULO, 9, [
      { t: 'texto', texto: 'O desenho mostra uma abelha pousada numa flor vermelha. Depois, ela voa com bolinhas laranja nas patas e deixa as bolinhas cair numa segunda flor.' },
      { t: 'lista', itens: [
        { texto: 'Estrutura masculina da flor.' },
        { texto: 'Estrutura feminina da flor.' },
        { texto: 'Formação do fruto e das sementes.' },
      ] },
      { t: 'quadro', texto: 'PÓLEN – POLINIZAÇÃO – POLINIZADOR' },
    ]),
    carta('ci-t10', '🐒', TITULO, 10, [
      { t: 'texto', texto: 'Os macacos-prego consomem diversos alimentos, como frutos e sementes. Na foto, um macaco-prego come numa árvore.' },
      { t: 'texto', texto: 'Atividade 3: complete as frases usando as palavras do quadro.' },
      { t: 'quadro', texto: 'SEMENTES – POLINIZAÇÃO – FRUTOS – VENTO – ANIMAIS – DISPERSÃO – PÓLEN – ÁGUA' },
    ]),

    // formas de dispersão e o caramujo que voou (pp. 11 e 12)
    carta('ci-t11', '🌬', TITULO, 11, [
      { t: 'texto', texto: 'Esquema: Dispersão de sementes.' },
      { t: 'lista', itens: [
        { texto: 'Uma foto de taboa soltando sementes brancas e fofinhas no ar.' },
        { termo: 'Pela água', texto: '(um quadro para desenhar).' },
        { texto: 'Uma foto de um bichinho mordendo uma frutinha vermelha.' },
      ] },
    ]),
    carta('ci-t12', '🍃', 'Caraminholas de Barrigapé (1 de 2)', 12, [
      { t: 'texto', texto: 'Barrigapé sozinho ficou, e pensando. Voar? [...] Mas como? Um caramujo já não tem pernas, nem braços, nem patas, nem mãos... Só tem aquela barriga chata que se arrasta pela terra... Asas então... É mesmo um sonho maluco.' },
      { t: 'texto', texto: 'Mas pensar muito nem foi preciso.' },
      { t: 'texto', texto: 'O vento inventou de ventar, de ventar muito no brejo.' },
      { t: 'texto', texto: 'E Barrigapé viu que as folhas secas espalhadas pelo chão começavam a se mexer, a sussurrar, a cochichar...' },
    ]),
    carta('ci-t12b', '🍃', 'Caraminholas de Barrigapé (2 de 2)', 12, [
      { t: 'texto', texto: 'E se mexiam, se remexiam, se remelexiam, chacoalhadas pelo vento. Até que ficou mais forte, cada vez mais violento o movimento de valsa do vento veloz... E as folhas começaram a subir, a subir bem alto, levadas pela ventania.' },
      { t: 'texto', texto: 'Barrigapé não perdeu tempo. Viu que pertinho dele estava uma enorme folha seca, larga, fininha. Bom de cálculos, sabia: seu peso de caramujinho não ia ser problema para o vento. Se arrastou como pôde e se grudou na haste da folha, com um pouco daquela baba que só os caramujos têm. Foi justo o tempo... Vuuuuuuuuuuuuuuuu!' },
      { t: 'fonte', texto: 'BAGNO, Marcos. Caraminholas de Barrigapé. 2 ed. São Paulo: Maralto Edições, 2020.' },
    ]),
  ]);
})();
