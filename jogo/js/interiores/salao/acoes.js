/* Salão de Beleza, as telas: a cadeira e a Dona Lulu abrem os cortes de cabelo, a arara e o provador abrem as
   roupas (UI.telaSalao, js/ui/salao.js). Só guardam funções: nada roda no carregamento. */
(function () {
  var R = window.Reino;
  function abrir(tipo) { return function () { if (R.UI && R.UI.telaSalao) return R.UI.telaSalao(tipo); }; }
  if (R.NPCs && R.NPCs.registrarTela) {
    // o convite é o mesmo texto da fala `nova` da Dona Lulu (o mesmo áudio)
    R.NPCs.registrarTela('salao-cabelo', abrir('cabelo'), 'Vamos mudar o seu cabelo?');
    R.NPCs.registrarTela('salao-roupa', abrir('roupa'), 'Vamos provar uma roupa?');
  }
})();
