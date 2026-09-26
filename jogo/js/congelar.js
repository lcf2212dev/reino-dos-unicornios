/* Modo determinístico para os testes de referência: só existe com ?debug=1&congelar=1 na URL.
   Sem os dois, este arquivo não faz nada. Com eles:
   - relógio virtual: Date, performance.now, setTimeout/setInterval e requestAnimationFrame
     só andam quando o teste chama window.__congelar.avancar(ms), em passos de 16 ms;
   - Math.random com semente fixa;
   - animações desligadas (o aparelho "pede" movimento reduzido);
   - começo sem tutorial nem tela de entrada (main.js lê Reino.congelado). */
(function () {
  if (!/[?&]debug=1(&|$)/.test(location.search) || !/[?&]congelar=1(&|$)/.test(location.search)) return;
  var R = window.Reino = window.Reino || {};
  R.congelado = true;

  var BASE = 1790000000000;   // o mesmo carimbo inventado dos saves sintéticos
  var agora = 0;              // ms virtuais desde o começo
  var PASSO = 16;

  // Math.random com semente (mulberry32)
  var semente = 20250101;
  Math.random = function () {
    semente = (semente + 0x6D2B79F5) | 0;
    var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // relógio
  var DataReal = Date;
  function DataVirtual(a, b, c, d, e, f, g) {
    var n = arguments.length;
    if (!(this instanceof DataVirtual)) return new DataReal(BASE + agora).toString();
    return n === 0 ? new DataReal(BASE + agora) : n === 1 ? new DataReal(a) : new DataReal(a, b, n > 2 ? c : 1, n > 3 ? d : 0, n > 4 ? e : 0, n > 5 ? f : 0, n > 6 ? g : 0);
  }
  DataVirtual.prototype = DataReal.prototype;
  DataVirtual.now = function () { return BASE + agora; };
  DataVirtual.parse = DataReal.parse;
  DataVirtual.UTC = DataReal.UTC;
  window.Date = DataVirtual;
  performance.now = function () { return agora; };

  // timers virtuais
  var timers = [], proximoId = 1, quadros = [];
  function agendar(fn, ms, args, repetir) {
    var id = proximoId++;
    timers.push({ id: id, fn: fn, quando: agora + Math.max(0, +ms || 0), ms: Math.max(PASSO, +ms || 0), args: args, repetir: repetir });
    return id;
  }
  function cancelar(id) { timers = timers.filter(function (t) { return t.id !== id; }); }
  window.setTimeout = function (fn, ms) { return agendar(fn, ms, [].slice.call(arguments, 2), false); };
  window.setInterval = function (fn, ms) { return agendar(fn, ms, [].slice.call(arguments, 2), true); };
  window.clearTimeout = window.clearInterval = cancelar;
  window.requestAnimationFrame = function (fn) { quadros.push({ id: proximoId, fn: fn }); return proximoId++; };
  window.cancelAnimationFrame = function (id) { quadros = quadros.filter(function (q) { return q.id !== id; }); };

  // animações desligadas: o aparelho pede movimento reduzido
  var mmReal = window.matchMedia && window.matchMedia.bind(window);
  window.matchMedia = function (q) {
    if (/prefers-reduced-motion:\s*reduce/.test(q)) return { matches: true, media: q, addListener: function () {}, removeListener: function () {}, addEventListener: function () {}, removeEventListener: function () {} };
    return mmReal(q);
  };
  // e o CSS também: nenhuma animação ou transição roda (camada animada rasteriza as bordas diferente a cada vez)
  var estilo = document.createElement('style');
  estilo.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
  (document.head || document.documentElement).appendChild(estilo);

  // uma volta de tarefas de verdade (deixa promessas e eventos correrem entre os passos)
  var canal = new MessageChannel(), esperando = [];
  canal.port1.onmessage = function () { var r = esperando.shift(); if (r) r(); };
  function respirar() { return new Promise(function (r) { esperando.push(r); canal.port2.postMessage(0); }); }

  function dispararTimers() {
    for (;;) {
      var devidos = timers.filter(function (t) { return t.quando <= agora; }).sort(function (a, b) { return a.quando - b.quando || a.id - b.id; });
      if (!devidos.length) return;
      var t = devidos[0];
      if (t.repetir) t.quando += t.ms; else cancelar(t.id);
      try { if (typeof t.fn === 'function') t.fn.apply(window, t.args); } catch (e) { console.error(e); }
    }
  }

  window.__congelar = {
    agora: function () { return agora; },
    // anda o relógio `ms` (em passos de 16 ms): timers vencidos, depois um quadro
    avancar: async function (ms) {
      var fim = agora + Math.max(0, ms || 0);
      await respirar();
      dispararTimers();
      await respirar();
      while (agora < fim) {
        agora = Math.min(fim, agora + PASSO);
        dispararTimers();
        await respirar();
        var fila = quadros; quadros = [];
        fila.forEach(function (q) { try { q.fn(agora); } catch (e) { console.error(e); } });
        await respirar();
      }
      return agora;
    },
    // deixa promessas e eventos pendentes correrem sem andar o relógio
    respirar: async function (vezes) { for (var i = 0; i < (vezes || 5); i++) { await respirar(); dispararTimers(); } },
  };
})();
