/* Utilidades comuns (Reino.util): $, $$, el (monta DOM), preencher, semEn, embaralhar, sortear, clamp,
   reais, reaisCurto, copia, esperar, o barramento de eventos (on, emit) e reduzMovimentoSistema
   (lido na carga, depois do js/nucleo/congelar.js). */
window.Reino = window.Reino || {};

Reino.util = (function () {
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  // el('div.classe#id', {atributos}, filhos...)
  function el(tag, attrs) {
    var partes = tag.split(/(?=[.#])/);
    var node = document.createElement(partes[0] || 'div');
    partes.slice(1).forEach(function (p) {
      if (p[0] === '.') node.classList.add(p.slice(1));
      else if (p[0] === '#') node.id = p.slice(1);
    });
    var filhos = Array.prototype.slice.call(arguments, 2);
    if (attrs && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) {
      filhos.unshift(attrs); attrs = null;
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'on') { Object.keys(v).forEach(function (ev) { node.addEventListener(ev, v[ev]); }); }
        else if (k === 'style' && typeof v === 'object') { Object.assign(node.style, v); }
        else if (k === 'text') { preencher(node, v); }
        else if (k === 'html') { node.innerHTML = v; }
        else if (k in node && typeof v !== 'string') { node[k] = v; }
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    filhos.flat(Infinity).forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      if (f.nodeType) node.appendChild(f);
      else colocarTexto(node, String(f));
    });
    return node;
  }

  var RE_ICONE = /(\p{RI}\p{RI}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|[✓✕✔✘←→↑↓▲▼◀▶⌫↙↗])/gu;
  // «inglês» vira <span class="en"> sem os sinais (a voz inglesa lê o mesmo trecho)
  var RE_EN = /«([^«»]*)»/g;
  function semEn(s) { return String(s).replace(/[«»]/g, ''); }
  function colocarTexto(node, s) {
    if (s.indexOf('«') < 0 && s.indexOf('»') < 0) { colocarIcones(node, s); return; }
    RE_EN.lastIndex = 0;
    var ultimo = 0, m;
    while ((m = RE_EN.exec(s))) {
      if (m.index > ultimo) colocarIcones(node, semEn(s.slice(ultimo, m.index)));
      var span = document.createElement('span');
      span.className = 'en'; span.lang = 'en';
      colocarIcones(span, m[1]);
      node.appendChild(span);
      ultimo = RE_EN.lastIndex;
    }
    if (ultimo < s.length) colocarIcones(node, semEn(s.slice(ultimo)));
  }
  function colocarIcones(node, s) {
    RE_ICONE.lastIndex = 0;
    if (!RE_ICONE.test(s) || !window.PA || !PA.iconeEmoji) {
      node.appendChild(document.createTextNode(s));
      return;
    }
    RE_ICONE.lastIndex = 0;
    var ultimo = 0, m;
    while ((m = RE_ICONE.exec(s))) {
      if (m.index > ultimo) node.appendChild(document.createTextNode(s.slice(ultimo, m.index)));
      node.appendChild(PA.iconeTexto(m[0], s.trim() === m[0]));
      ultimo = m.index + m[0].length;
    }
    if (ultimo < s.length) node.appendChild(document.createTextNode(s.slice(ultimo)));
  }
  function preencher(node, s) {
    node.textContent = '';
    colocarTexto(node, String(s));
    return node;
  }

  function embaralhar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sortear(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function reais(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
  function reaisCurto(v) { return 'R$' + (Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',')); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // pequeno barramento de eventos
  var ouvintes = {};
  function on(ev, fn) { (ouvintes[ev] = ouvintes[ev] || []).push(fn); }
  function emit(ev, dado) { (ouvintes[ev] || []).forEach(function (fn) { try { fn(dado); } catch (e) { console.error(e); } }); }

  var reduzMovimento = false;
  try { reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  return { $: $, $$: $$, el: el, preencher: preencher, semEn: semEn, embaralhar: embaralhar, sortear: sortear, clamp: clamp,
    reais: reais, reaisCurto: reaisCurto, copia: copia, esperar: esperar, on: on, emit: emit,
    reduzMovimentoSistema: reduzMovimento };
})();
