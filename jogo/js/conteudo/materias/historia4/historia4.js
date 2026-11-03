/* HISTÓRIA DA GENTE — História do 4º bimestre, 2º ano: Capítulos 10 "O trabalho de cada um", 11 "Profissionais da comunidade" e 12 "Trabalho e meio ambiente"
   (docs/contratos/quarto-bimestre.md). Dois livros da escola, reproduzidos página por página: o Livro de Aprendizagem e o
   Livro de Atividades. PDFs em matérias/4 Bimestre/história/; o checklist de cobertura é o INVENTARIO.md da mesma
   pasta (páginas pela numeração impressa). Nome diferente do da matéria arquivada do 3º bimestre (arte.md §22).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem dos livros: hi<cap>a<n> (Aprendizagem) e hi<cap>t<n>
   (Atividades), cartas em livro-<cap>a.js / livro-<cap>t.js, unicórnios das salas em unicornios-<cap>.js
   (carregados antes deste arquivo, na ordem do manifesto). */
(function () {
  var M = 'historia4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'História da Gente',
    emoji: '⏳',
    cor: '#6c6f86',   // a cor da matéria (docs/contratos/arte.md §22): o cinza-ardósia das pedras do museu
    nomeLivro: 'Livros de História',
    livros: {
      aprendizagem: { nome: 'Livro de Aprendizagem', curto: 'Aprendizagem', emoji: '📗' },
      atividades: { nome: 'Livro de Atividades', curto: 'Atividades', emoji: '📒' },
    },
    inventario: 'matérias/4 Bimestre/história/INVENTARIO.md',
    lugar: { nome: 'Museu das Memórias', artigo: 'o', dentro: 'materia:historia', interior: 'museu', novidade: '2026-11-03' },
    guia: 'Aqui estão os dois livros de História do 4º bimestre, página por página: vamos conhecer o trabalho de cada um! Vamos começar pela primeira sala?',

    salas: Reino.salasDa(M),     // hi10a1 … hi12t<n>, na ordem do manifesto (a dos livros)
    livro: Reino.livroDa(M),     // livro-10a.js … livro-12t.js

    /* 1 comum e 1 raro por sala (unicornios-<cap>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'hi-ampulheta-dourada', nome: 'Ampulheta Dourada', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#6c6f86', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Você foi ouro em História da Gente!' },
      { id: 'hi-capacete-amigo', nome: 'Capacete Amigo', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#fff4e0', crina: ['#ffb020', '#6c6f86', '#e0433f'], chifre: '#ffe680', asa: '#fff8ee' },
        frase: 'Nenhum errinho! Trabalho bem-feito do começo ao fim.' },
      { id: 'hi-guardiao-das-memorias', nome: 'Guardião das Memórias', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#f7f6fb', crina: ['#6c6f86', '#ff9cc6', '#ffd34d'], chifre: '#ffd166', asa: '#f0eef8' },
        frase: 'Você leu os dois livros inteirinhos! Cada profissão agora mora na sua memória.' },
    ]),
  });
})();
