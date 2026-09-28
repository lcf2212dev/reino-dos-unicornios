/* Planeta Júpiter, as brincadeiras: a ação `jupiter-brincadeira` (NPCs e objetos de Júpiter), com `b` = 'curiosidade' | …
   Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0 da 3ª versão): ação vazia; a frente do cenário de Júpiter faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('jupiter-brincadeira', function () { return Promise.resolve(); });
})();
