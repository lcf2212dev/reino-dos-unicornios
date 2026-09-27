/* Planeta Lua, as brincadeiras: a ação `lua-brincadeira` (NPCs e objetos da Lua), com `b` = 'pulo' | 'esconde' |
   'curiosidade' | … Só diversão, na memória da sessão (nada no save). Contrato: docs/contratos/viagem.md §5.
   CONTRATO (onda 0): ação vazia; a frente do cenário da Lua faz as brincadeiras. */
(function () {
  var R = window.Reino;
  R.NPCs.registrarAcao('lua-brincadeira', function () { return Promise.resolve(); });
})();
