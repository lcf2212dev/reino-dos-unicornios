/* Laboratório de Química: as frases da tela livros, a Estante da Biblioteca (chaves 'livros.<nome>'), na voz do
   Professor Carbono (Reino.Quimica.vozDe). Contrato: docs/contratos/quimica.md §4 e §9. Até 30 letras por página, 3+ palavras. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // ao abrir a estante
  por('livros.oi', ['Escolha um livro para ler!']);
  // chegou ao fim de um livro pela 1ª vez (estrelasLivroNovo = 1: mudou o config, regrave)
  por('livros.lido', ['Muito bem, livro lido!', 'Você ganhou uma estrela!']);
  // leu os 8
  por('livros.todos', ['Você leu todos os livros!', 'Parabéns, você é cientista!']);
})();
