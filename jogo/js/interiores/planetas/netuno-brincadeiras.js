/* Planeta Netuno, as brincadeiras: a ação `netuno-brincadeira` (NPCs e objetos de Netuno), com `b` = 'curiosidade' | …
   Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0 da 3ª versão): ação vazia; a frente do cenário de Netuno faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('netuno-brincadeira', function () { return Promise.resolve(); });
})();
