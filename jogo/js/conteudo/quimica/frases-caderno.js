/* Laboratório de Química: as frases da tela caderno (chaves 'caderno.<nome>'), na voz da Doutora Proveta.
   Contrato: docs/contratos/quimica.md §4. Até 30 letras por página, 3+ palavras. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // ao abrir o caderno (no índice) e no "Ouvir" do índice
  por('caderno.oi', ['Este é o caderno de receitas.', 'Cada mistura nova fica aqui!']);
  // na página de uma receita que ainda é segredo, depois da dica
  por('caderno.segredo', ['Misture na bancada e descubra!']);
  // o caderno completo (no lugar do oi)
  por('caderno.completo', ['Você completou o caderno!', 'Que cientista incrível você é!']);
})();
