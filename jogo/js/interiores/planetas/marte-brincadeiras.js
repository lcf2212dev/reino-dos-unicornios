/* Planeta Marte, as brincadeiras: a ação `marte-brincadeira` (NPCs e objetos de Marte), com `b` = 'curiosidade' | …
   Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0 da 2ª versão): ação vazia; a frente do cenário de Marte faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('marte-brincadeira', function () { return Promise.resolve(); });
})();
