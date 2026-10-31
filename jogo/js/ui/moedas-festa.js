/* Moedas voando (pedido 2026-10-31-moedas-cofre-cartoes §4): no fim da sala feita pela 1ª vez, as moedinhas 🪙 saem
   do meio da tela e voam em arco, uma a uma, até o chip .chip-dinheiro do HUD (ui/hud.js; aqui só se lê e se pinta o
   número). Cada uma que chega toca o 'plim' (sistemas/som.js), sobe o número do chip (de saldo − n até o saldo) e dá
   um pulinho de 2 px no chip. No máximo MAX moedas desenhadas, mesmo com n maior (o número sobe em partes iguais).
   UI.festaMoedas(n) → Promise (resolve quando a última chega). Sem animação (U.animar() falso, congelado, "reduzir
   movimento") ou sem o chip à vista: um plim, o número final, resolve na hora. Nada de rAF: setTimeout, e nenhum
   pendurado depois de resolver. Estilos: css/ui-moedas-festa.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var MAX = 12;        // moedas desenhadas, no máximo
  var PASSOS = 8;      // degraus do voo (posição em px pares, arte.md §15.2)
  var ALTURA = 120;    // px: quanto o arco sobe acima da reta

  function chip() { return U.$('#hud .chip-dinheiro'); }
  // o alvo: o desenho da 🪙 dentro do chip (se o chip está à vista e não há nada por cima)
  function alvo(c) {
    var r = c && c.getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    var ic = c.querySelector('canvas') || c, ri = ic.getBoundingClientRect();
    var topo = document.elementFromPoint(ri.left + ri.width / 2, ri.top + ri.height / 2);
    return topo && c.contains(topo) ? ri : null;
  }
  function pintar(c, v) { if (c) U.preencher(c, '🪙 ' + U.moedasNumero(Math.max(0, v))); }
  // uma tela que ficou aberta por cima do HUD (ex.: o painel da matéria, de onde ela começou a sala) se esconde
  // durante o voo e volta no fim: as moedas precisam ver o chip. Devolve a função que mostra de novo.
  function descobrir(c) {
    var escondidas = [];
    for (var i = 0; i < 4; i++) {
      var r = c && c.getBoundingClientRect(), topo = r && r.width && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!topo || c.contains(topo)) break;
      var cima = topo;
      while (cima.parentElement && cima.parentElement !== document.body) cima = cima.parentElement;
      if (cima === document.body || cima.contains(c)) break;
      escondidas.push([cima, cima.style.visibility]);
      cima.style.visibility = 'hidden';
    }
    return function () { escondidas.forEach(function (e) { e[0].style.visibility = e[1]; }); };
  }

  /** As moedas voando até o chip do HUD. @param {number} n moedas ganhas agora @returns {Promise<void>} */
  UI.festaMoedas = function (n) {
    n = Math.max(0, Math.round(n || 0));
    if (!n) return Promise.resolve();
    var c = chip(), mostrar = U.animar() && window.PA ? descobrir(c) : function () {}, b = alvo(c);
    if (!U.animar() || !b || !window.PA) {
      mostrar();
      Reino.Som.tocar('plim');
      if (UI.atualizarHUD) UI.atualizarHUD();
      return Promise.resolve();
    }
    return new Promise(function (resolver) {
      var MOV = Reino.config.movimento, ms = 2 * MOV.lento / PASSOS;
      var saldo = Reino.Progresso.saldoMoedas(), m = Math.min(MAX, n), chegaram = 0, timers = [];
      var camada = el('div.moedas-festa', { 'aria-hidden': 'true' });
      document.body.appendChild(camada);
      pintar(c, saldo - n);
      var x1 = b.left + b.width / 2 - 16, y1 = b.top + b.height / 2 - 16;
      function depois(t, fn) { timers.push(setTimeout(fn, t)); }
      function par(v) { return 2 * Math.round(v / 2) + 'px'; }

      function lancar(i) {
        var moeda = PA.iconeEmoji('🪙', 2);
        moeda.classList.add('moeda-voa');
        camada.appendChild(moeda);
        // cada uma sai de um ponto um pouco diferente do meio (sem sorteio: o mesmo desenho sempre)
        var x0 = window.innerWidth / 2 - 16 + ((i % 3) - 1) * 24, y0 = window.innerHeight / 2 - 16 + ((i % 2) ? 12 : -12);
        function por(k) {
          var t = k / PASSOS;
          moeda.style.left = par(x0 + (x1 - x0) * t);
          moeda.style.top = par(y0 + (y1 - y0) * t - ALTURA * 4 * t * (1 - t));
        }
        por(0);
        (function passo(k) {
          depois(ms, function () {
            if (k > PASSOS) { moeda.remove(); chegou(); return; }
            por(k); passo(k + 1);
          });
        })(1);
      }
      function chegou() {
        chegaram++;
        Reino.Som.tocar('plim');
        pintar(c, saldo - n + Math.round(n * chegaram / m));
        c.classList.remove('moedas-pulo'); void c.offsetWidth; c.classList.add('moedas-pulo');
        if (chegaram === m) depois(MOV.normal, fim);
      }
      function fim() {
        timers.forEach(clearTimeout); timers = [];
        camada.remove();
        mostrar();
        c.classList.remove('moedas-pulo');
        if (UI.atualizarHUD) UI.atualizarHUD();
        resolver();
      }
      for (var i = 0; i < m; i++) depois(i * MOV.rapido, lancar.bind(null, i));
    });
  };
})();
