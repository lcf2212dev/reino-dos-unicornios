/* Cartas do Livro de Atividades, Capítulo 11 "As partes das plantas" (pp. 5 a 8), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). Páginas só de questões: carta curta com o título da seção e o que ela pede;
   as fotos viram `figuras` (ícones). */
(function () {
  var L = 'atividades', C = 11;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('ciencias4', [
    carta('ci-t05', '🍅', 'As partes das plantas – Raiz, caule e folhas', 5, [
      { t: 'texto', texto: 'Atividade 1: identificar o nome das partes do tomateiro.' },
      { t: 'figuras', itens: [{ img: '🍅', legenda: 'Tomateiro com raízes, caule, folhas, flores amarelas e tomates vermelhos.' }] },
    ]),
    carta('ci-t06', '🌱', 'Raiz, caule e folhas', 6, [
      { t: 'texto', texto: 'Atividade 2: observar a planta no vaso e escrever onde ficam a raiz, o caule e as folhas. Atividade 3: completar as frases com as palavras do quadro.' },
      { t: 'figuras', itens: [{ img: '🌱', legenda: 'Muda com duas folhas grandes num vaso de barro, mostrando a terra e as raízes.' }] },
    ]),
    carta('ci-t07', '🌸', 'As partes das plantas – Flor, fruto e semente', 7, [
      { t: 'texto', texto: 'Atividade 1: desenhar as partes das plantas de acordo com as legendas: raiz, caule, folha, flor, fruto e sementes.' },
    ]),
    carta('ci-t08', '🌿', 'Flor, fruto e semente', 8, [
      { t: 'texto', texto: 'Atividade 2: escrever o nome das partes da planta indicadas na imagem. Atividade 3: as funções das diferentes partes das plantas. Atividade 4: a função dos frutos e das sementes.' },
      { t: 'figuras', itens: [{ img: 'ci:11-urucum', legenda: 'Urucuzeiro.' }] },
    ]),
  ]);
})();
