/* Entradas das atividades do hall e todas as páginas faladas pela narradora. */
(function () {
  var R = window.Reino, D = R.LABORATORIO;
  var extras = [], vistos = {};
  function add(texto) { if (vistos[texto]) return; vistos[texto] = true; extras.push({ texto: texto, voz: 'narradora' }); }
  D.experiencias.concat(D.jogos).forEach(function (a) { a.fala.forEach(add); (a.conclusao || []).forEach(add); });
  D.fim.concat(['Vamos fazer descobertas.', 'Escolha uma experiência.']).forEach(add);
  R.falasDoPredio('observatorio', { objetos: {
    'lab-experiencias': 'Vamos fazer experiências?',
    'lab-minijogos': 'Vamos brincar com ciências?'
  }, extras: extras });
  R.NPCs.registrarTela('laboratorio-jogos', function () { R.UI.telaLaboratorio('jogos'); });
  R.NPCs.registrarTela('laboratorio-atividades', function () { R.UI.telaLaboratorio(); });
})();
