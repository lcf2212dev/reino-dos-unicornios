/* Desafio cacaPalavras (docs/contratos/quarto-bimestre.md §12):
     { tipo: 'cacaPalavras', pergunta, grade: ['GATOX', …], palavras: ['GATO', …] }
   As palavras estão na grade na horizontal (da esquerda para a direita) ou na vertical (de cima para baixo), cada uma
   uma vez só. Tocar na primeira e na última letra (em qualquer ordem) ou arrastar de uma até a outra seleciona; se
   for uma palavra da lista, ela fica marcada na grade (uma cor por palavra) e riscada na lista. Teclado: setas andam
   na grade (só a casa ativa conta no Tab: _d.focoItinerante, de cruzadinha.js), Enter/Espaço marcam o começo e o fim.
   Na sala, sem Conferir: termina sozinho ao achar todas (opts.onCompleto, como a memória). Na prova, pronto com uma
   achada. Valor: os índices das palavras achadas, na ordem em que achou. Pontuação: fração achada. */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;
  var CORES = 5;   // marca de cada palavra achada: .caca-cor-0 … .caca-cor-4 (css)
  var ERRO_MS = 900;   // trecho que não é palavra: as letras ficam marcadas (e tremem) um instante

  function letras(t) { return Array.from(String(t)); }
  // onde a palavra está na grade: [{ x, y, dir }] (o validar exige uma ocorrência só)
  function ocorrencias(grade, palavra) {
    var L = grade.map(letras), alvo = letras(palavra), r = [];
    L.forEach(function (linha, y) {
      linha.forEach(function (_, x) {
        ['h', 'v'].forEach(function (dir) {
          if (alvo.every(function (ch, k) { var l = L[y + (dir === 'v' ? k : 0)]; return !!l && l[x + (dir === 'h' ? k : 0)] === ch; })) r.push({ x: x, y: y, dir: dir });
        });
      });
    });
    return r;
  }
  // casas de a até b (na mesma linha ou coluna), da esquerda para a direita / de cima para baixo; null se não alinham
  function trecho(a, b) {
    if (a[0] !== b[0] && a[1] !== b[1]) return null;
    var dx = a[1] === b[1] ? 1 : 0, ini = dx ? Math.min(a[0], b[0]) : Math.min(a[1], b[1]), fim = dx ? Math.max(a[0], b[0]) : Math.max(a[1], b[1]);
    var r = [];
    for (var n = ini; n <= fim; n++) r.push(dx ? [n, a[1]] : [a[0], n]);
    return r;
  }
  function achadasDe(d, valor) {
    var r = [];
    (Array.isArray(valor) ? valor : []).forEach(function (i) { if (Number.isInteger(i) && i >= 0 && i < d.palavras.length && r.indexOf(i) < 0) r.push(i); });
    return r;
  }

  var montar = function (d, opts) {
    var L = d.grade.map(letras), h = L.length, w = L[0].length;
    var achadas = achadasDe(d, opts.valorInicial);
    var naProva = opts.modo === 'prova';
    var inicio = null, foco = [0, 0], arrasto = null;
    var wrap = el('div.caca');
    var grade = el('div.caca-grade');
    grade.style.setProperty('--colunas', String(w));
    var deFora = _d.focoItinerante(grade);
    var botoes = L.map(function (linha, y) {
      return linha.map(function (ch, x) {
        var b = el('button.caca-letra', { type: 'button', 'data-x': String(x), 'data-y': String(y) }, ch);
        b.addEventListener('focus', function (ev) {
          if ((foco[0] !== x || foco[1] !== y) && deFora(ev)) { botoes[foco[1]][foco[0]].focus(); return; }
          foco = [x, y]; pintar();
        });
        // pelo teclado (Enter/Espaço: clique sem detail) ou por programa; o toque vem pelos eventos de ponteiro
        b.addEventListener('click', function (ev) { if (!ev.detail) tocar([x, y]); });
        grade.appendChild(b);
        return b;
      });
    });
    function casaDe(alvo) {
      var b = alvo && alvo.closest ? alvo.closest('.caca-letra') : null;
      return b && grade.contains(b) ? [+b.getAttribute('data-x'), +b.getAttribute('data-y')] : null;
    }
    // toque e arrasto: começa no pointerdown; no pointerup, mesma casa = um toque, outra casa = o trecho entre as duas
    grade.addEventListener('pointerdown', function (ev) {
      limparErro();
      var c = casaDe(ev.target);
      if (!c || ctrl.travado || completo()) return;
      arrasto = { de: c, ate: c, id: ev.pointerId };
    });
    grade.addEventListener('pointermove', function (ev) {
      if (!arrasto || ev.pointerId !== arrasto.id) return;
      var c = casaDe(document.elementFromPoint(ev.clientX, ev.clientY));
      if (c && (c[0] !== arrasto.ate[0] || c[1] !== arrasto.ate[1])) { arrasto.ate = c; pintar(); }
    });
    function soltar(ev) {
      if (!arrasto || ev.pointerId !== arrasto.id) return;
      var a = arrasto, c = casaDe(document.elementFromPoint(ev.clientX, ev.clientY)) || a.ate;
      arrasto = null;
      if (ev.type === 'pointercancel') { pintar(); return; }
      if (c[0] === a.de[0] && c[1] === a.de[1]) tocar(c);
      else if (trecho(a.de, c)) { inicio = null; escolher(a.de, c); }
      else pintar();
    }
    grade.addEventListener('pointerup', soltar);
    grade.addEventListener('pointercancel', soltar);
    grade.addEventListener('keydown', function (ev) {
      var setas = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }, s = setas[ev.key];
      if (!s) return;
      ev.preventDefault();
      var x = Math.min(w - 1, Math.max(0, foco[0] + s[0])), y = Math.min(h - 1, Math.max(0, foco[1] + s[1]));
      Reino.UI.focarTeclado(botoes[y][x]);
    });
    var itens = d.palavras.map(function (p) { return el('li.caca-palavra', p); });
    var lista = el('ul.caca-lista', itens);
    wrap.appendChild(grade);
    wrap.appendChild(lista);

    function completo() { return achadas.length === d.palavras.length; }
    // 1º toque marca o começo; tocar nele de novo desmarca; fora da linha e da coluna dele, recomeça dali
    function tocar(c) {
      if (ctrl.travado || completo()) return;
      limparErro();
      if (!inicio || !trecho(inicio, c)) { inicio = c; Reino.Som.tocar('selecionar'); pintar(); return; }
      if (inicio[0] === c[0] && inicio[1] === c[1]) { inicio = null; Reino.Som.tocar('toque'); pintar(); return; }
      var a = inicio;
      inicio = null;
      escolher(a, c);
    }
    function escolher(a, b) {
      var cs = trecho(a, b), texto = cs.map(function (c) { return L[c[1]][c[0]]; }).join('');
      var i = d.palavras.findIndex(function (p, j) { return p === texto && achadas.indexOf(j) < 0; });
      if (i < 0) {
        // não é palavra da lista (ou já achada): as letras tremem paradas um instante (ui.md §10.19.2)
        Reino.Som.tocar('toque');
        pintar();
        if (d.palavras.indexOf(texto) < 0) marcarErro(cs.map(function (c) { return botoes[c[1]][c[0]]; }));
        return;
      }
      achadas.push(i);
      Reino.Som.tocar('estrela');
      pintar(); opts.onMudar();
      if (completo() && opts.onCompleto) setTimeout(opts.onCompleto, 500);
    }
    /* erro parado (ui.md §10.19.2) só no trecho tocado, até ERRO_MS ou até o próximo toque na grade (o _d.erroParado
       apagaria a marca já no clique que vem junto com o pointerup) */
    var erro = { casas: [], t: null };
    function marcarErro(bs) {
      limparErro();
      erro.casas = bs;
      bs.forEach(function (b) { b.classList.add('item-erro', 'treme'); });
      erro.t = setTimeout(limparErro, ERRO_MS);
    }
    function limparErro() {
      clearTimeout(erro.t);
      erro.casas.forEach(function (b) { b.classList.remove('item-erro', 'treme'); });
      erro.casas = [];
    }
    // marca de cada palavra achada (a última por cima no cruzamento), a seleção em curso e a casa ativa
    function pintar() {
      var cor = {};
      achadas.forEach(function (i, n) {
        var o = ocorrencias(d.grade, d.palavras[i])[0];
        if (o) letras(d.palavras[i]).forEach(function (_, k) { cor[(o.x + (o.dir === 'h' ? k : 0)) + ',' + (o.y + (o.dir === 'v' ? k : 0))] = n % CORES; });
      });
      var sel = arrasto ? trecho(arrasto.de, arrasto.ate) || [arrasto.de] : inicio ? (Reino.UI.porTeclado() && trecho(inicio, foco)) || [inicio] : [];
      var marcadas = {};
      sel.forEach(function (c) { marcadas[c[0] + ',' + c[1]] = true; });
      botoes.forEach(function (linha, y) {
        linha.forEach(function (b, x) {
          var k = x + ',' + y;
          for (var n = 0; n < CORES; n++) b.classList.toggle('caca-cor-' + n, cor[k] === n);
          b.classList.toggle('caca-achada', cor[k] !== undefined);
          b.classList.toggle('caca-sel', !!marcadas[k]);
          b.classList.toggle('caca-inicio', !!inicio && inicio[0] === x && inicio[1] === y);
          b.tabIndex = foco[0] === x && foco[1] === y ? 0 : -1;
        });
      });
      itens.forEach(function (li, i) { li.classList.toggle('achada', achadas.indexOf(i) >= 0); });
    }
    pintar();
    var ctrl = {
      el: wrap, semConferir: !!opts.onCompleto,
      valor: function () { return achadas.slice(); },
      pronto: function () { return naProva ? achadas.length > 0 : completo(); },
      conferir: function () { return { ok: completo() }; },
      // na sala o erro se marca no toque (não há Conferir); na prova não há marca
      marcarErro: function () { /* sem marca no Conferir */ },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  var pontuar = function (d, valor) { return _d.fracao(achadasDe(d, valor).length, d.palavras.length); };

  Reino.registrarTipoDesafio('cacaPalavras', {
    montar: montar, pontuar: pontuar, especial: true,
    exemplos: { desafio: { id: 'x', tipo: 'cacaPalavras', grade: ['GATOX', 'XXXXS', 'XXXXO', 'XXXXL'], palavras: ['GATO', 'SOL'] },
      certa: function (d) { return d.palavras.map(function (_, i) { return i; }); },
      estranhos: [[], [99], [0, 0, 0], ['GATO'], [null], [-1, 1.5]] },
    // prova: a lista de palavras conta no tempo mínimo de leitura
    textoProva: function (d) { return ' ' + d.palavras.join(' '); },
    textoCerto: function (d) { return d.palavras.join(', '); },
    textoResposta: function (d, valor) { var a = achadasDe(d, valor); return a.length ? a.map(function (i) { return d.palavras[i]; }).join(', ') : '(nenhuma palavra)'; },
    validar: function (d, v) {
      var ok = v.checar;
      var grade = Array.isArray(d.grade) && d.grade.length > 0 && d.grade.every(function (l) { return typeof l === 'string' && /^\p{Lu}+$/u.test(l); });
      ok(grade && d.grade.every(function (l) { return letras(l).length === letras(d.grade[0]).length; }), d.id + ': grade precisa de linhas do mesmo tamanho, só com letras MAIÚSCULAS');
      var palavras = Array.isArray(d.palavras) && d.palavras.length > 0 && d.palavras.every(function (p) { return typeof p === 'string' && /^\p{Lu}{2,}$/u.test(p); });
      ok(palavras && new Set(d.palavras).size === d.palavras.length, d.id + ': palavras precisam ser MAIÚSCULAS, de 2 letras ou mais, sem repetir');
      if (!grade || !palavras) return;
      d.palavras.forEach(function (p) {
        var n = ocorrencias(d.grade, p).length;
        ok(n === 1, d.id + ': "' + p + '" aparece ' + n + ' vez(es) na grade (precisa de 1, na horizontal ou na vertical)');
      });
      if (letras(d.grade[0]).length > 10 && !v.naProva) v.avisar(d.id + ': caça-palavras com ' + letras(d.grade[0]).length + ' colunas: no celular as letras ficam pequenas (até 10)');
    },
  });
})();
