/* Planeta Saturno, as brincadeiras: a ação `saturno-brincadeira` (NPCs e objetos de Saturno), com `b` = 'curiosidade' | …
   Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0 da 2ª versão): ação vazia; a frente do cenário de Saturno faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('saturno-brincadeira', function () { return Promise.resolve(); });
})();
