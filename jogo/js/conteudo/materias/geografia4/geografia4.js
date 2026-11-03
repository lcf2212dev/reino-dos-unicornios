/* GEOGRAFIA DO MUNDO — Geografia do 4º bimestre, 2º ano: Capítulos 10 "Matérias-primas: de onde vêm?", 11 e 12
   (docs/contratos/quarto-bimestre.md). Dois livros da escola, reproduzidos página por página: o Livro de Aprendizagem e o
   Livro de Atividades. PDFs em matérias/4 Bimestre/geografia/; o checklist de cobertura é o INVENTARIO.md da mesma
   pasta (páginas pela numeração impressa). Nome diferente do da matéria arquivada do 3º bimestre (arte.md §22).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem dos livros: ge<cap>a<n> (Aprendizagem) e ge<cap>t<n>
   (Atividades), cartas em livro-<cap>a.js / livro-<cap>t.js, unicórnios das salas em unicornios-<cap>.js
   (carregados antes deste arquivo, na ordem do manifesto). */
(function () {
  var M = 'geografia4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'Geografia do Mundo',
    emoji: '🧭',
    cor: '#e5731a',   // a cor da matéria (docs/contratos/arte.md §22): o laranja da bússola
    nomeLivro: 'Livros de Geografia',
    livros: {
      aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' },
      atividades: { nome: 'Livro de Atividades', curto: 'Atividades', emoji: '📒' },
    },
    inventario: 'matérias/4 Bimestre/geografia/INVENTARIO.md',
    lugar: { nome: 'Estação dos Caminhos', artigo: 'a', dentro: 'materia:geografia', interior: 'geografia', novidade: '2026-11-03' },
    guia: 'Aqui estão os dois livros de Geografia do 4º bimestre, página por página! Vamos começar pela primeira sala?',

    salas: Reino.salasDa(M),     // ge10a1 … ge12t<n>, na ordem do manifesto (a dos livros)
    livro: Reino.livroDa(M),     // livro-10a.js … livro-12t.js

    /* 1 comum e 1 raro por sala (unicornios-<cap>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'ge-rosa-dos-ventos', nome: 'Rosa dos Ventos', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#e5731a', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Você foi ouro em Geografia do Mundo! Eu aponto sempre para você.' },
      { id: 'ge-trilheiro', nome: 'Trilheiro', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#fff0e0', crina: ['#e5731a', '#39a860', '#5fb4ff'], chifre: '#ffe680', asa: '#fff6ee' },
        frase: 'Nenhum errinho no caminho todo!' },
      { id: 'ge-globo-encantado', nome: 'Globo Encantado', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#f2fbff', crina: ['#2f8fd6', '#39a860', '#e5731a'], chifre: '#ffd166', asa: '#eaf6ff' },
        frase: 'Você leu os dois livros inteirinhos! O mundo todo cabe no seu coração.' },
    ]),
  });
})();
