/* Laboratório de Química: frases fixas das telas, na voz da Doutora Proveta (Reino.QUIMICA.frases).
   Contrato: docs/contratos/quimica.md §4. Chave com o prefixo da tela ('bancada.', 'caderno.', 'microscopio.',
   'tabela.'); cada tela tem o seu arquivo (frases-<tela>.js) e a mesma chave em dois arquivos é erro.
   Valor: lista de páginas (até 30 letras, 3+ palavras). Frases comuns a todas as telas ficam aqui. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  var F = Q.frases = Q.frases || {};
  function por(chave, paginas) {
    if (F[chave]) throw new Error('quimica: frase repetida ' + chave);
    F[chave] = paginas;
  }
  Q.porFrase = por;
  por('comum.seguranca', ['Aqui é uma simulação.', 'Produtos só no laboratório.', 'Com um adulto responsável.']);
})();
