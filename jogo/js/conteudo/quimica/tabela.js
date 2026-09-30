/* Laboratório de Química: as 118 casas da tabela periódica, para o mapa colorido (Reino.QUIMICA.tabela).
   Contrato: docs/contratos/quimica.md §3. Cada casa: [z, simbolo, familia, linha, coluna] (linha 1-7 e 9-10 para
   lantanídeos e actinídeos; coluna 1-18). familia = chave de Reino.QUIMICA.familias (elementos.js). */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.tabela = [
    { z: 1, simbolo: 'H', familia: 'nao-metal', linha: 1, coluna: 1 },
  ];
})();
