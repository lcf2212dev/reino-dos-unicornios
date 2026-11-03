/* CIÊNCIAS DA NATUREZA — Ciências do 4º bimestre, 2º ano: Capítulos 10 "Conhecendo as plantas", 11 "As partes das plantas" e 12 "As plantas se relacionam"
   (docs/contratos/quarto-bimestre.md). Dois livros da escola, reproduzidos página por página: o Livro de Aprendizagem e o
   Livro de Atividades. PDFs em matérias/4 Bimestre/ciências/; o checklist de cobertura é o INVENTARIO.md da mesma
   pasta (páginas pela numeração impressa). Nome diferente do da matéria arquivada do 3º bimestre (arte.md §22).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem dos livros: ci<cap>a<n> (Aprendizagem) e ci<cap>t<n>
   (Atividades), cartas em livro-<cap>a.js / livro-<cap>t.js, unicórnios das salas em unicornios-<cap>.js
   (carregados antes deste arquivo, na ordem do manifesto). */
(function () {
  var M = 'ciencias4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'Ciências da Natureza',
    emoji: '🌱',
    cor: '#7d9c1a',   // a cor da matéria (docs/contratos/arte.md §22): o verde-oliva das plantas
    nomeLivro: 'Livros de Ciências',
    livros: {
      aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' },
      atividades: { nome: 'Livro de Atividades', curto: 'Atividades', emoji: '📒' },
    },
    inventario: 'matérias/4 Bimestre/ciências/INVENTARIO.md',
    lugar: { nome: 'Laboratório de Ciências', artigo: 'o', dentro: 'materia:ciencias', interior: 'observatorio-3', andar: '3º andar', novidade: '2026-11-03' },
    guia: 'Aqui estão os dois livros de Ciências do 4º bimestre, página por página: vamos conhecer as plantas! Vamos começar pela primeira sala?',

    salas: Reino.salasDa(M),     // ci10a1 … ci12t<n>, na ordem do manifesto (a dos livros)
    livro: Reino.livroDa(M),     // livro-10a.js … livro-12t.js

    /* 1 comum e 1 raro por sala (unicornios-<cap>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'ci-semente-dourada', nome: 'Semente Dourada', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#7d9c1a', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Você brotou como ouro em Ciências da Natureza!' },
      { id: 'ci-orvalho', nome: 'Orvalho', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#eafbff', crina: ['#5fb4ff', '#7d9c1a', '#ffffff'], chifre: '#bff0ff', asa: '#f2fdff' },
        frase: 'Nenhum errinho! Brilhei como uma gotinha na folha.' },
      { id: 'ci-arvore-encantada', nome: 'Árvore Encantada', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#f6ffe8', crina: ['#4f8a1a', '#ff9cc6', '#ffd34d'], chifre: '#ffd166', asa: '#eefbe0' },
        frase: 'Você leu os dois livros inteirinhos! Minhas raízes, caule, folhas, flores e frutos são todos seus.' },
    ]),
  });
})();
