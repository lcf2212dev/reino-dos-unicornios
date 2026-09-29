/* Ouvir antes de seguir (Reino.UI.esperarFala, UI.lerQuestao, UI.ouvirDeNovo, UI.esperandoFala).
   Contrato: docs/contratos/som-musica-e-voz.md §4 item 11. Carrega logo depois de ui/base.js.
   UI.esperarFala(alvos, segmentos, opcoes) fala (Som.falarEsperando) e, se vale esperar, desabilita os
   botões, campos e canvas (desenho) de `alvos` (elemento, seletor ou lista; num contêiner, os de dentro)
   até a fala acabar ou o teto de tempo. O que tem a classe `livre-na-fala` (o 🔊 Ouvir) fica livre. Enquanto espera,
   UI.esperandoFala() é true e o Esc não fecha nada (ui/base.js). O 🔊 usa UI.ouvirDeNovo (repete sem soltar
   a espera). Nada muda no DOM quando não há espera (voz desligada, sem gravação, áudio bloqueado).
   Devolve a Promise do fim (já resolvida sem espera). */
(function () {
  var UI = Reino.UI;
  var esperas = [];   // esperas em curso (a última é a de cima)
  UI.esperandoFala = function () { return esperas.length > 0; };
  // a espera acaba no fim da fala, a menos que o 🔊 (UI.ouvirDeNovo) tenha posto uma fala nova no lugar
  function aguardar(w) {
    return w.fim.then(function () {
      if (!w.proxima) return;
      w.fim = w.proxima; w.proxima = null;
      return aguardar(w);
    });
  }
  UI.esperarFala = function (alvos, segmentos, opcoes) {
    var r = Reino.Som.falarEsperando(segmentos, opcoes);
    if (!r.espera) return r.fim;
    var lista = [];
    (Array.isArray(alvos) ? alvos : [alvos]).forEach(function (a) {
      if (typeof a === 'string') a = document.querySelectorAll(a);
      if (!a) return;
      (a.length !== undefined ? Array.prototype.slice.call(a) : [a]).forEach(function (x) {
        if (!x || !x.matches) return;
        if (x.matches('button, input, select, textarea, canvas')) lista.push(x);
        else Array.prototype.push.apply(lista, x.querySelectorAll('button, input, select, textarea, canvas'));
      });
    });
    var travados = lista.filter(function (b) { return !b.disabled && !b.classList.contains('livre-na-fala'); });
    travados.forEach(function (b) { b.disabled = true; b.classList.add('esperando-fala'); });
    var w = { fim: r.fim, proxima: null };
    esperas.push(w);
    return aguardar(w).then(function () {
      var i = esperas.indexOf(w);
      if (i >= 0) esperas.splice(i, 1);
      travados.forEach(function (b) {
        if (!b.classList.contains('esperando-fala')) return;
        b.classList.remove('esperando-fala');
        b.disabled = false;
      });
    });
  };
  // a leitura de uma questão (sala, treino, prova): trava as respostas como UI.esperarFala só se
  // config.esperaFala.travarQuestoes; senão só fala, e ela responde sem esperar a voz acabar
  UI.lerQuestao = function (alvos, segmentos, opcoes) {
    if (Reino.config.esperaFala.travarQuestoes) return UI.esperarFala(alvos, segmentos, opcoes);
    return Reino.Som.falar(segmentos, opcoes);
  };
  // o 🔊 (repetir a fala): durante uma espera, a repetição toma o lugar da fala e a espera vai até o fim
  // dela (senão tocar no 🔊 cortava a fala e liberava os botões na hora); fora de espera, só fala
  UI.ouvirDeNovo = function (segmentos, opcoes) {
    var w = esperas[esperas.length - 1];
    if (!w) return Reino.Som.falar(segmentos, opcoes);
    var r = Reino.Som.falarEsperando(segmentos, opcoes);
    if (r.espera) w.proxima = r.fim;
    return r.fim;
  };
})();
