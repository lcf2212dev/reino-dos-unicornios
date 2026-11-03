/* Cartas do Livro de Atividades, Capítulo 10 "O trabalho de cada um" (pp. 1, 2 e 4), na ordem das páginas
   (docs/contratos/quarto-bimestre.md §4). A p. 3 não foi fotografada: fica fora do inventário e do jogo.
   Página só de questões: carta curta com o título da seção e o que ela pede. */
(function () {
  var L = 'atividades', C = 10;
  function carta(id, e, titulo, pagina, blocos) {
    return { id: id, e: e, titulo: titulo, livroOrigem: L, pagina: pagina, capitulo: C, blocos: blocos };
  }
  Reino.registrarCartas('historia4', [
    carta('hi-t01', '🧩', 'O trabalho de cada um: O que é trabalho? – Capítulo 10', 1, [
      { t: 'texto', texto: 'Troque os símbolos pelas letras da legenda e descubra a palavra secreta.' },
      { t: 'figuras', itens: [
        { img: 'hi:10-circulo', legenda: 'A' }, { img: 'hi:10-quadrado', legenda: 'B' }, { img: 'hi:10-triangulo', legenda: 'H' },
        { img: 'hi:10-losango', legenda: 'L' }, { img: 'hi:10-estrela', legenda: 'O' }, { img: 'hi:10-gota', legenda: 'R' },
        { img: 'hi:10-flor', legenda: 'T' },
      ] },
      { t: 'texto', texto: 'Desenhe um tipo de trabalho em que as pessoas precisam usar mais esforço físico e outro em que precisam usar mais criatividade.' },
    ]),
    carta('hi-t02', '🧺', 'O que é trabalho?', 2, [
      { t: 'texto', texto: 'Quando estamos em casa, fazemos muitos trabalhos que não são considerados empregos, mas que precisam ser feitos para manter nosso lar organizado e limpo.' },
      { t: 'figuras', itens: [
        { img: '🧺', legenda: '1: uma mulher e um homem com as roupas, a bacia e a máquina de lavar.' },
        { img: '🧹', legenda: '2: uma mulher com o aspirador de pó e um homem com o esfregão.' },
        { img: '🌱', legenda: '3: um menino com um vaso e uma mulher com o regador.' },
        { img: 'hi:10-ferro', legenda: '4: um homem com o ferro, na tábua de passar.' },
      ] },
    ]),
    carta('hi-t04', '🚀', 'Profissões', 4, [
      { t: 'texto', texto: 'Leia o trecho de música a seguir.' },
      { t: 'versos', versos: ['PROFISSÕES', '', 'QUANDO VOCÊ CRESCER', 'DIZ AÍ O QUE VOCÊ QUER SER', '[...]',
        'SE NA LUA QUER PISAR', 'DE FOGUETE VIAJAR', 'VOAR PELA VIA LÁCTEA', 'TEM QUE SER ASTRONAUTA', '[...]'] },
      { t: 'fonte', texto: 'ANITTA; JÚNIOR; Jefferson; TAVARES, Umberto. Profissões. Intérprete: Anittinha. In: ANITTINHA. Clube da Anittinha. Rio de Janeiro: WM Brazil, 2018.' },
    ]),
  ]);
})();
