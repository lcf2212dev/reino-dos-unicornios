/* Utilidades comuns (Reino.util): $, $$, el (monta DOM), preencher, colar/colado (quebra de linha), semEn, embaralhar, sortear, clamp,
   reais, reaisCurto, copia, esperar, hoje, o barramento de eventos (on, emit) e reduzMovimentoSistema
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
  function colocarIcones(node, s, sozinho) {
    if (sozinho === undefined) sozinho = s.trim();
    RE_ICONE.lastIndex = 0;
    if (!RE_ICONE.test(s) || !window.PA || !PA.iconeEmoji) {
      node.appendChild(document.createTextNode(s));
      return;
    }
    RE_ICONE.lastIndex = 0;
    var ultimo = 0, m;
    while ((m = RE_ICONE.exec(s))) {
      if (m.index > ultimo) node.appendChild(document.createTextNode(s.slice(ultimo, m.index)));
      node.appendChild(PA.iconeTexto(m[0], sozinho === m[0]));
      ultimo = m.index + m[0].length;
    }
    if (ultimo < s.length) node.appendChild(document.createTextNode(s.slice(ultimo)));
  }
  function preencher(node, s) {
    node.textContent = '';
    colocarTexto(node, String(s));
    return node;
  }

  // quebra de linha (ui.md §10.17): grupos de no máximo COLA_MAX caracteres (espaço e pontuação contam, emoji vale 2).
  // Cola à direita a palavra de 1–2 letras ("a", "pp."), o "R$" e o número (só começando um grupo); cola à esquerda o
  // número do fim (da frase ou da lista: "de 10.", "e 29"), o de "Sala N" e o emoji do fim. Se a cola à esquerda
  // passar do teto, o grupo se desfaz e ela fica só com a palavra de antes (teto maior: COLA_EMOJI, COLA_NUM).
  var COLA_MAX = 12, COLA_EMOJI = 20, COLA_NUM = 16;
  var RE_SO_ICONE = new RegExp('^(?:' + RE_ICONE.source + ')+[.!?]*$', 'u');
  var RE_CURTA = /^(\p{L}{1,2}\.?|R\$|\p{N}[\p{N},.ºª°]*)$/u;
  function tamanho(p) { return p.replace(new RegExp(RE_ICONE.source, 'gu'), '  ').replace(/[\uFE0F\u200D]/g, '').length; }
  function colar(s) {
    var ps = String(s).split(' '), junta = [], ini = 0;   // junta[i]: o espaço antes de ps[i] vira U+00A0
    function tam(de, ate) { return tamanho(ps.slice(de, ate + 1).join(' ')); }
    for (var i = 1; i < ps.length; i++) {
      var a = ps[i - 1], b = ps[i], ult = i === ps.length - 1, prox = ps[i + 1] || '';
      var fimEmoji = !!a && ult && RE_SO_ICONE.test(b);
      var num = /^\p{N}/u.test(b);
      var numFim = !!a && num && (ult || /[.!?;:]["”)]*$/.test(b) || (i === ps.length - 2 && RE_SO_ICONE.test(prox)) || /^\p{L}{1,2}$/u.test(a) && !/^\p{N}/u.test(prox));
      var salaN = /^sala$/i.test(a) && num;
      var esquerda = fimEmoji || numFim || salaN;
      var direita = !esquerda && ini === i - 1 && !!a && !!b && RE_CURTA.test(a) && !(/^sala$/i.test(b) && /^\p{N}/u.test(prox));
      if (esquerda && ini < i - 1 && tam(ini, i) > COLA_MAX) {   // desfaz o grupo: fica só com a palavra de antes
        for (var k = ini + 1; k < i; k++) junta[k] = false;
        ini = i - 1;
      }
      // a cola à esquerda de uma palavra só aceita um pouco mais: emoji do fim até COLA_EMOJI, número até COLA_NUM
      var teto = ini < i - 1 ? COLA_MAX : fimEmoji ? COLA_EMOJI : esquerda ? COLA_NUM : COLA_MAX;
      if ((esquerda || direita) && tam(ini, i) <= teto) junta[i] = true;
      else { junta[i] = false; ini = i; }
    }
    return ps.map(function (p, i) { return i === 0 ? p : (junta[i] ? '\u00a0' : ' ') + p; }).join('');
  }
  // o mesmo em DOM: cada grupo colado (e palavra composta até 12 letras, "Arco-íris": a fonte não tem U+2011) vira um span
  // nowrap. O textContent fica igual ao texto (voz e quem compara o balão não veem diferença).
  function colarEm(node, s, sozinho) {
    colar(s).split(' ').forEach(function (p, i) {
      if (i) node.appendChild(document.createTextNode(' '));
      if (!p) return;
      if (p.indexOf('\u00a0') < 0 && !(/\p{L}-\p{L}/u.test(p) && tamanho(p) <= COLA_MAX)) { colocarIcones(node, p, sozinho); return; }
      var sp = document.createElement('span');
      sp.style.whiteSpace = 'nowrap';
      colocarIcones(sp, p.replace(/\u00a0/g, ' '), sozinho);
      node.appendChild(sp);
    });
  }
  function colado(s) {
    s = String(s);
    var frag = document.createDocumentFragment(), sozinho = semEn(s).trim(), ultimo = 0, m;
    RE_EN.lastIndex = 0;
    while ((m = RE_EN.exec(s))) {   // «inglês» como no colocarTexto
      if (m.index > ultimo) colarEm(frag, semEn(s.slice(ultimo, m.index)), sozinho);
      var span = document.createElement('span');
      span.className = 'en'; span.lang = 'en';
      colarEm(span, m[1], sozinho);
      frag.appendChild(span);
      ultimo = RE_EN.lastIndex;
    }
    if (ultimo < s.length) colarEm(frag, semEn(s.slice(ultimo)), sozinho);
    return frag;
  }
  // no balão (já na tela): o grupo mais largo que a linha se desfaz (data-largo), para não sair da caixa
  function preencherColado(node, s) {
    node.textContent = ''; node.appendChild(colado(s));
    var largura = node.clientWidth;
    if (largura) Array.prototype.slice.call(node.querySelectorAll('span')).forEach(function (sp) {
      if (sp.style.whiteSpace === 'nowrap' && sp.getBoundingClientRect().width > largura) { sp.style.whiteSpace = ''; sp.dataset.largo = '1'; }
    });
    return node;
  }

  // chave: só no modo de teste (congelado) dá ordem estável por chave; no jogo de verdade é sempre Math.random
  function sorteador(chave) {
    var R = window.Reino;
    if (!R || !R.congelado || chave == null || !R.sorteioDaChave) return Math.random;
    return R.sorteioDaChave(typeof chave === 'string' ? chave : JSON.stringify(chave));
  }
  function embaralhar(arr, chave) {
    var a = arr.slice(), aleatorio = sorteador(chave);
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(aleatorio() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sortear(arr, chave) { return arr[Math.floor(sorteador(chave)() * arr.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function reais(v) { return 'R$ ' + (Math.round(v * 100) / 100).toFixed(2).replace('.', ','); }
  function reaisCurto(v) { return 'R$' + (Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',')); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // pequeno barramento de eventos
  var ouvintes = {};
  function on(ev, fn) { (ouvintes[ev] = ouvintes[ev] || []).push(fn); }
  function emit(ev, dado) { (ouvintes[ev] || []).forEach(function (fn) { try { fn(dado); } catch (e) { console.error(e); } }); }

  // o dia de hoje 'aaaa-mm-dd' no fuso local; guardado por minuto (há quem pergunte a cada quadro).
  // Lê o Date da hora da chamada: o relógio virtual do modo determinístico vale.
  var hojeMinuto = -1, hojeTexto = '';
  function hoje() {
    var agora = Date.now(), min = Math.floor(agora / 60000);
    if (min !== hojeMinuto) {
      var d = new Date(agora);
      hojeMinuto = min;
      hojeTexto = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    return hojeTexto;
  }

  var reduzMovimento = false;
  try { reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  return { $: $, $$: $$, el: el, preencher: preencher, semEn: semEn, embaralhar: embaralhar, sortear: sortear, clamp: clamp,
    colar: colar, colado: colado, preencherColado: preencherColado,
    reais: reais, reaisCurto: reaisCurto, copia: copia, esperar: esperar, hoje: hoje, on: on, emit: emit,
    reduzMovimentoSistema: reduzMovimento };
})();
