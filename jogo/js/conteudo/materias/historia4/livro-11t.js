/* Cartas do Livro de Atividades, Capítulo 11 "Profissionais da comunidade" (pp. 5 a 8), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Redação do livro, palavra por palavra; as fotos viram figuras com a
   legenda do livro e uma frase curta do que mostram (as questões dependem delas). */
(function () {
  var L = 'atividades', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('historia4', [
    carta('hi-t05', '⏳', 'Profissões do passado', 5, [
      { t: 'texto', texto: 'Marque um X nas informações certas.' },
      { t: 'texto', texto: 'Leia as perguntas a seguir e marque um X na resposta certa.' },
    ]),
    carta('hi-t06', '🥛', 'Profissões do passado: o leiteiro', 6, [
      { t: 'texto', texto: 'Observe a imagem a seguir. Depois, responda ao que se pede.' },
      { t: 'figuras', itens: [{ img: '🥛', legenda: 'Entregador de leite. Na foto em preto e branco, um homem empurra um carrinho com garrafas de leite numa rua de pedra.' }] },
      { t: 'quadro', texto: 'No passado, o leite estragava muito rapidamente. Isso acontecia porque, naquele tempo, o leite não passava pelo processo de pasteurização, que mata as bactérias e faz o leite durar mais tempo. Os leiteiros entregavam essa bebida na porta das casas para garantir que as pessoas tivessem leite fresco. O leite era entregue em garrafas de vidro diretamente dos produtores.' },
    ]),
    carta('hi-t07', '💻', 'Profissões da atualidade', 7, [
      { t: 'texto', texto: 'Além das profissões, os lugares onde as pessoas trabalham também mudam com o passar o tempo. Observe as imagens a seguir.' },
      { t: 'figuras', itens: [
        { img: '📋', legenda: 'Pessoas trabalhando em um escritório em 1917. A foto é em preto e branco: mesas de madeira cheias de papéis e estantes de arquivos.' },
        { img: '💻', legenda: 'Pessoas trabalhando em um escritório na atualidade. A foto é colorida: mesas claras com computadores, plantas e muita luz.' },
      ] },
    ]),
    carta('hi-t08', '🚜', 'Profissões da atualidade: o agricultor', 8, [
      { t: 'texto', texto: 'Observe as imagens e leia as legendas de cada uma delas. Depois, responda ao que se pede.' },
      { t: 'figuras', itens: [
        { img: '🌾', legenda: 'Agricultor usando uma colheitadeira para colher arroz.' },
        { img: '🚜', legenda: 'Agricultor usando uma máquina para arar a terra.' },
      ] },
    ]),
  ]);
})();
