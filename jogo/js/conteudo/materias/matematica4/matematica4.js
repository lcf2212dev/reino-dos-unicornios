/* MATEMÁTICA DO DIA A DIA — Matemática do 4º bimestre, 2º ano: Capítulos 10 "Sistema monetário", 11 "Divisão em partes iguais" e 12 "Estatística"
   (docs/contratos/quarto-bimestre.md). Dois livros da escola, reproduzidos página por página: o Livro de Aprendizagem e o
   Livro de Atividades. PDFs em matérias/4 Bimestre/matemática/; o checklist de cobertura é o INVENTARIO.md da mesma
   pasta (páginas pela numeração impressa). Nome diferente do da matéria arquivada do 3º bimestre (arte.md §22).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem dos livros: ma<cap>a<n> (Aprendizagem) e ma<cap>t<n>
   (Atividades), cartas em livro-<cap>a.js / livro-<cap>t.js, unicórnios das salas em unicornios-<cap>.js
   (carregados antes deste arquivo, na ordem do manifesto). */
(function () {
  var M = 'matematica4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'Matemática do Dia a Dia',
    emoji: '🪙',
    cor: '#4a3cc9',   // a cor da matéria (docs/contratos/arte.md §22): o anil das moedas do cofrinho
    nomeLivro: 'Livros de Matemática',
    livros: {
      aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' },
      atividades: { nome: 'Livro de Atividades', curto: 'Atividades', emoji: '📒' },
    },
    inventario: 'matérias/4 Bimestre/matemática/INVENTARIO.md',
    lugar: { nome: 'Torre dos Números', artigo: 'a', dentro: 'materia:matematica', interior: 'matematica', novidade: '2026-11-03' },
    guia: 'Aqui estão os dois livros de Matemática do 4º bimestre, página por página! Vamos começar pela primeira sala?',

    salas: Reino.salasDa(M),     // ma10a1 … ma12t<n>, na ordem do manifesto (a dos livros)
    livro: Reino.livroDa(M),     // livro-10a.js … livro-12t.js

    /* 1 comum e 1 raro por sala (unicornios-<cap>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'ma-cofrinho-dourado', nome: 'Cofrinho Dourado', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#4a3cc9', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Você foi ouro em Matemática do Dia a Dia!' },
      { id: 'ma-grafiquinho', nome: 'Grafiquinho', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#eeeaff', crina: ['#4a3cc9', '#3fbf7f', '#ffd34d'], chifre: '#ffe680', asa: '#f4f2ff' },
        frase: 'Nenhum errinho! Minhas barrinhas foram lá no alto.' },
      { id: 'ma-tesouro-dos-numeros', nome: 'Tesouro dos Números', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#fffaf2', crina: ['#4a3cc9', '#ffb020', '#ff7eb6'], chifre: '#ffd166', asa: '#f1eeff' },
        frase: 'Você leu os dois livros inteirinhos! Cada moeda, cada divisão e cada gráfico agora são seus.' },
    ]),
  });
})();
