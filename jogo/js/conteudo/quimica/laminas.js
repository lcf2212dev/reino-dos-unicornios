/* Laboratório de Química: as lâminas do microscópio, nenhuma de bicho (Reino.QUIMICA.laminas).
   Contrato: docs/contratos/quimica.md §3. id (o desenho da lâmina na tela do microscópio), nome, emoji (com pixel
   art), explica (páginas ao olhar pela 1ª vez), aumentos: { 10: página, 40: página, 100: página } (o que se vê em
   cada aumento). Olhar uma lâmina nítida = descoberta ('laminas'). Até 30 letras por página, 3+ palavras. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.laminas = [
    { id: 'sal', nome: 'Sal', emoji: '🧂', explica: ['O sal tem cristais quadrados.'],
      aumentos: { 10: 'Parecem grãozinhos brancos.', 40: 'Olha os cubinhos de sal!', 100: 'Cada cubo é um cristal.' } },
  ];
})();
