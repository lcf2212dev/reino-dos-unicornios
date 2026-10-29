/* LÍNGUA PORTUGUESA — 4º bimestre, 2º ano, Volume 4 (docs/contratos/quarto-bimestre.md).
   Dois livros da escola, reproduzidos página por página: o Livro de Aprendizagem (80 pp.: capa, sumário e os
   Capítulos 10 "Conta uma história?", 11 "Quem canta..." e 12 "O visual do poema") e o Livro de Atividades
   (página da turminha e pp. 1 a 18). PDFs em matérias/4 Bimestre/português/; o checklist de cobertura é o
   INVENTARIO.md da mesma pasta (páginas pela numeração impressa: o PDF tem pares de páginas trocados).
   Lugar no reino: a Casa das Palavras inteira, a partir do térreo (lugar.dentro: o interior de entrada da casa).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem dos livros: lp<cap>a<n> (Aprendizagem) e lp<cap>t<n>
   (Atividades), cartas em livro-<cap>a.js / livro-<cap>t.js, unicórnios das salas em unicornios-<cap>.js
   (carregados antes deste arquivo, na ordem do manifesto). */
(function () {
  var M = 'portugues4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'Língua Portuguesa',
    emoji: '✏️',
    cor: '#8e4fd6',   // a cor da matéria (docs/contratos/arte.md §22): o roxo da capa do Volume 4
    nomeLivro: 'Livros de Língua Portuguesa',
    livros: {
      aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' },
      atividades: { nome: 'Livro de Atividades', curto: 'Atividades', emoji: '📒' },
    },
    inventario: 'matérias/4 Bimestre/português/INVENTARIO.md',
    lugar: { nome: 'Casa das Palavras', artigo: 'a', dentro: 'materia:portugues', interior: 'portugues', novidade: '2026-10-15' },
    guia: 'Aqui estão os dois livros de Língua Portuguesa do 4º bimestre, página por página! Vamos começar pela primeira sala?',

    salas: Reino.salasDa(M),     // lp10a1 … lp12t2, na ordem do manifesto (a dos livros)
    livro: Reino.livroDa(M),     // livro-10a.js … livro-12t.js

    /* 1 comum e 1 raro por sala (unicornios-<cap>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'lp-pena-dourada', nome: 'Pena Dourada', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#8e4fd6', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Minha pena escreve em ouro: você foi ouro em Língua Portuguesa!' },
      { id: 'lp-reticencias', nome: 'Reticências', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#efe6ff', crina: ['#8e4fd6', '#ff7eb6', '#ffd34d'], chifre: '#5fd0ff', asa: '#f6f0ff' },
        frase: 'Tudo certinho, do começo ao fim... e a história continua!' },
      { id: 'lp-guardia-dos-livros', nome: 'Guardiã dos Livros', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#fffaf2', crina: ['#8e4fd6', '#3fbf7f', '#ffb020'], chifre: '#ffd166', asa: '#f3eaff' },
        frase: 'Você leu os dois livros inteirinhos! Eu guardo cada página com carinho.' },
    ]),
  });
})();
