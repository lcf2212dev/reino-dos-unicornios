/* Laboratório de Química, 2º andar: os livros da Biblioteca da Química (Reino.QUIMICA.livros).
   Contrato: docs/contratos/quimica.md §3 e §9. Só dados. Lidos pelo Professor Carbono (até 30 letras, 3+ palavras).
   { id, ordem, titulo (só na tela; pode ter símbolo), emoji (com pixel art), paginas, desenho (chave de um desenho
   da tela dos livros; hoje o próprio id) }. Ler até o fim = descoberta 'livros' (estrelasLivroNovo).
   Os 8 ids são do contrato. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.livros = [
    { id: 'cozinha', ordem: 1, titulo: 'Química na cozinha', emoji: '🥣', desenho: 'cozinha',
      paginas: ['A cozinha é um laboratório!', 'O fermento faz o bolo crescer.'] },
    { id: 'ar', ordem: 2, titulo: 'O ar que a gente respira', emoji: '🌬', desenho: 'ar',
      paginas: ['O ar é uma mistura de gases.', 'Nele tem o oxigênio.'] },
    { id: 'fogo', ordem: 3, titulo: 'O fogo precisa de três coisas', emoji: '🔥', desenho: 'fogo',
      paginas: ['O fogo precisa de três coisas.', 'Nunca brinque com fogo!'] },
    { id: 'ferrugem', ordem: 4, titulo: 'A ferrugem', emoji: '🔩', desenho: 'ferrugem',
      paginas: ['O ferro molhado enferruja.', 'O ouro nunca enferruja!'] },
    { id: 'agua', ordem: 5, titulo: 'A viagem da água', emoji: '🌧', desenho: 'agua',
      paginas: ['A água do mar evapora.', 'Vira nuvem e depois chuva.'] },
    { id: 'planta', ordem: 6, titulo: 'A planta que faz comida', emoji: '🌱', desenho: 'planta',
      paginas: ['A planta faz comida com luz.', 'E solta oxigênio no ar!'] },
    { id: 'corpo', ordem: 7, titulo: 'A química do corpo', emoji: '🧠', desenho: 'corpo',
      paginas: ['Seu corpo tem muita água.', 'A saliva já começa a digerir.'] },
    { id: 'cientistas', ordem: 8, titulo: 'Cientistas que mudaram tudo', emoji: '🧑‍🔬', desenho: 'cientistas',
      paginas: ['Marie Curie ganhou dois Nobel.', 'Foi uma cientista incrível!'] },
  ];
})();
