/* Viagem de foguete (parte 3): o desafio do ET — a ação `viagem-desafio` ({ materia }) de um ET com um problema
   abre o painel com perguntas da matéria do planeta; ajudar até o fim faz dele um amigo (campo `etsAmigos`).
   Contrato: docs/contratos/viagem.md §6.1.
   CONTRATO (onda 0 da 2ª versão): ação vazia; a frente do desafio a completa.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  R.registrarModulo({ id: 'viagem-desafio', acoes: { 'viagem-desafio': function () { return Promise.resolve(); } } });
})();
