/* ENGLISH — Inglês do 4º bimestre, 2º ano, English Volume 2 (docs/contratos/quarto-bimestre.md).
   Um livro da escola em duas partes, reproduzidas página por página: os capítulos 10 "If You're Happy, Clap Your
   Hands", 11 "I Dance When I'm Happy!" e 12 "Book Time" (pp. 122 a 159) e a parte de projetos, com os capítulos 11
   "Be Kind!" e 12 "I Have a Healthy Diet!" (pp. 164 a 193; Science, Arts, History, Geography, Maths e Connecting
   Ideas). As duas partes têm capítulos de mesmo número: cada uma é um `livros` (letra e sigla próprias).
   PDFs em matérias/4 Bimestre/inglês/; o checklist de cobertura é o INVENTARIO.md da mesma pasta.
   Lugar no reino: a Torre do Relógio inteira, a partir do térreo (lugar.dentro: o interior de entrada da torre).
   Salas de livro (ordem: 'livro'), uma por seção, na ordem do livro: en<cap>e<n> (English) e en<cap>p<n> (Projetos),
   cartas em livro-<cap><e|p>.js, unicórnios das salas em unicornios-<cap><e|p>.js (carregados antes deste arquivo,
   na ordem do manifesto). Convenção da voz: todo trecho em inglês fica entre « e » (a voz inglesa lê só esse pedaço). */
(function () {
  var M = 'ingles4';
  Reino.registrarMateria({
    id: M,
    bimestre: 4,
    nome: 'English',
    emoji: '🇬🇧',
    cor: '#d23c9b',   // a cor da matéria (docs/contratos/arte.md §22): o rosa-framboesa da capa do English Volume 2
    nomeLivro: 'Livros de English',
    livros: {
      english: { nome: 'English – Capítulos 10 a 12', curto: 'English', emoji: '📔', letra: 'e', sigla: 'ENG' },
      projetos: { nome: 'English – Projetos', curto: 'Projetos', emoji: '📖', letra: 'p', sigla: 'PRJ' },
    },
    inventario: 'matérias/4 Bimestre/inglês/INVENTARIO.md',
    lugar: { nome: 'Torre do Relógio', artigo: 'a', dentro: 'materia:ingles', interior: 'torre', novidade: '2026-10-29' },
    guia: 'Aqui está o livro de English do 4º bimestre, página por página! Vamos começar pela primeira sala? «Let\'s go!»',

    salas: Reino.salasDa(M),     // en10e1 … en12p3, na ordem do manifesto (a do livro)
    livro: Reino.livroDa(M),     // livro-10e.js … livro-12p.js

    /* 1 comum e 1 raro por sala (unicornios-<cap><e|p>.js), 2 épicos e o lendário. */
    unicornios: Reino.unicorniosDa(M).concat([
      { id: 'en-golden-star', nome: 'Golden Star', raridade: 'epico', treino: 'ouro',
        cores: { corpo: '#fff1c2', crina: ['#e0a800', '#d23c9b', '#fff8e0'], chifre: '#ffffff', asa: '#fff6d6' },
        frase: 'Você brilhou como ouro em English! «Well done!»' },
      { id: 'en-perfect', nome: 'Perfect', raridade: 'epico', treino: 'perfeito',
        cores: { corpo: '#ffe6f4', crina: ['#d23c9b', '#5fb4ff', '#ffd34d'], chifre: '#ffffff', asa: '#fff0f8' },
        frase: 'Nenhum errinho, do começo ao fim! «Perfect!»' },
      { id: 'en-big-ben', nome: 'Big Ben', raridade: 'lendario', materiaCompleta: true,
        cores: { corpo: '#fffaf2', crina: ['#d23c9b', '#2f6fd6', '#ffb020'], chifre: '#ffd166', asa: '#ffeef8' },
        frase: 'Você leu o livro de English inteirinho! Eu toco o sino da torre para você. «Ding, dong!»' },
    ]),
  });
})();
