/* Planeta Vênus, as brincadeiras: a ação `venus-brincadeira` (NPCs e objetos de Vênus), com `b` = 'curiosidade' | …
   Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0 da 3ª versão): ação vazia; a frente do cenário de Vênus faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('venus-brincadeira', function () { return Promise.resolve(); });
})();
