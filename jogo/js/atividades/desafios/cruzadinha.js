/* Desafio cruzadinha (docs/contratos/quarto-bimestre.md §12):
     { tipo: 'cruzadinha', pergunta, palavras: [{ resposta: 'GATO', x, y, dir: 'h'|'v', dica?, img? }] }
   A grade e os números das pistas saem das palavras (número = casa de começo, em ordem de leitura). Uma casa por
   letra (maiúscula): digitar escreve e anda na direção da palavra; setas movem; Backspace apaga e volta; tocar numa
   casa escolhe a palavra dela (tocar de novo, no cruzamento, troca a direção; pelo teclado, Enter/Espaço). Pistas
   com número, dica e/ou figura (ICONES). Fileira de acentos. Vale sem acento (cruzadinha de escola ignora acento).
   Valor: uma string por palavra, com as letras da grade (' ' na casa vazia). Pontuação: fração das palavras certas.
   Também aqui: _d.focoItinerante (grade com uma casa só no Tab, usada pelo caça-palavras). */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;

  function letras(t) { return Array.from(String(t)); }
  // sem acento e maiúscula (Ç = C, Ã = A)
  function base(t) { return String(t == null ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); }
  function casasDa(p) { return letras(p.resposta).map(function (_, k) { return (p.x + (p.dir === 'h' ? k : 0)) + ',' + (p.y + (p.dir === 'v' ? k : 0)); }); }
  // grade: { w, h, casas: { 'x,y': { letra, palavras: [i…] } }, num: [número da pista de cada palavra], numDe: { 'x,y': n } }
  function grade(d) {
    var casas = {}, w = 0, h = 0, inicios = [];
    d.palavras.forEach(function (p, i) {
      var ls = letras(p.resposta);
      casasDa(p).forEach(function (k, j) {
        var xy = k.split(',').map(Number);
        (casas[k] = casas[k] || { letra: ls[j], palavras: [] }).palavras.push(i);
        w = Math.max(w, xy[0] + 1); h = Math.max(h, xy[1] + 1);
      });
      if (inicios.indexOf(p.x + ',' + p.y) < 0) inicios.push(p.x + ',' + p.y);
    });
    var numDe = {};
    inicios.map(function (k) { return k.split(',').map(Number); }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; })
      .forEach(function (c, n) { numDe[c[0] + ',' + c[1]] = n + 1; });
    return { w: w, h: h, casas: casas, numDe: numDe, num: d.palavras.map(function (p) { return numDe[p.x + ',' + p.y]; }) };
  }
  // pistas em ordem: número, depois a deitada antes da em pé
  function ordemPistas(d, g) {
    return d.palavras.map(function (_, i) { return i; }).sort(function (a, b) {
      var da = d.palavras[a].dir, db = d.palavras[b].dir;
      return g.num[a] - g.num[b] || (da === db ? a - b : da === 'h' ? -1 : 1);
    });
  }

  /* Grade com foco itinerante: só a casa ativa conta no Tab (o Tab da tela, ui/base.js, passa por toda caixa e botão,
     até com tabindex -1; aqui o Tab de uma casa pula a grade inteira; sem nada depois dela, dá a volta para o 1º da
     tela, e o Shift+Tab para o último). Devolve deFora(ev): o foco entrou na grade pelo teclado, vindo de fora (a casa
     que recebeu o foco o passa para a casa ativa). */
  var FOCAVEIS = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  _d.focoItinerante = function (gradeEl) {
    gradeEl.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Tab') return;
      var raiz = gradeEl.closest('.tela') || document.body;
      var fora = Array.prototype.filter.call(raiz.querySelectorAll(FOCAVEIS), function (e) { return !gradeEl.contains(e) && (e.offsetWidth || e.offsetHeight); });
      var alvo = ev.shiftKey
        ? fora.filter(function (e) { return gradeEl.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING; }).pop()
        : fora.find(function (e) { return gradeEl.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING; });
      if (!alvo) alvo = ev.shiftKey ? fora[fora.length - 1] : fora[0];
      ev.preventDefault(); ev.stopPropagation();
      if (alvo) Reino.UI.focarTeclado(alvo);
    });
    return function (ev) { return !gradeEl.contains(ev.relatedTarget) && Reino.UI.porTeclado(); };
  };

  var montar = function (d, opts) {
    var g = grade(d);
    var letra = {};   // 'x,y' → letra escrita ('' vazia)
    Object.keys(g.casas).forEach(function (k) { letra[k] = ''; });
    if (Array.isArray(opts.valorInicial)) d.palavras.forEach(function (p, i) {
      var v = opts.valorInicial[i], ls = typeof v === 'string' ? letras(v) : [];
      casasDa(p).forEach(function (k, j) { if (ls[j] && ls[j] !== ' ') letra[k] = ls[j]; });
    });
    var atual = 0, foco = casasDa(d.palavras[0])[0], tocouNaAtiva = false;
    var wrap = el('div.cruzadinha');
    var tab = el('div.cruz-grade');
    tab.style.setProperty('--colunas', String(g.w));
    var deFora = _d.focoItinerante(tab);
    // uma fileira de acentos para todas as casas, logo depois da grade (o Tab de uma casa vai direto a ela)
    var acentos = _d.fileiraAcentos(function () { return casas[foco].campo; });
    var casas = {};   // 'x,y' → { caixa, campo, ver }
    for (var y = 0; y < g.h; y++) for (var x = 0; x < g.w; x++) {
      var k = x + ',' + y;
      if (g.casas[k]) { casas[k] = casa(k); tab.appendChild(casas[k].caixa); } else tab.appendChild(el('span.cruz-vazia', { 'aria-hidden': 'true' }));
    }
    var botoesPista = {};
    var pistas = el('ol.cruz-pistas' + (d.palavras.every(function (p) { return p.img && !p.dica; }) ? '.cruz-pistas-img' : ''), ordemPistas(d, g).map(function (i) {
      var p = d.palavras[i];
      var b = el('button.cruz-pista', { type: 'button' },
        el('span.cruz-pista-num', String(g.num[i])), el('span.cruz-pista-dir', { 'aria-hidden': 'true' }, p.dir === 'h' ? '→' : '↓'),
        p.img ? el('span.cruz-pista-img', _d.figuraIcone(p.img, 64)) : null,
        p.dica ? el('span.cruz-pista-dica', p.dica) : null);
      b.addEventListener('click', function () {
        atual = i;
        var cs = casasDa(p), vazia = cs.filter(function (c) { return !letra[c]; })[0];
        Reino.Som.tocar('toque');
        focar(vazia || cs[0]);
      });
      botoesPista[i] = b;
      return el('li', b);
    }));
    wrap.appendChild(el('div.cruz-lado', tab, acentos));
    wrap.appendChild(pistas);

    function casa(k) {
      var campo = el('input.cruz-campo', { type: 'text', 'aria-label': 'Letra', autocomplete: 'off', autocapitalize: 'characters', autocorrect: 'off', spellcheck: 'false', tabindex: '-1', 'data-maiusculas': 'sim' });
      var ver = el('span.cruz-letra', { 'aria-hidden': 'true' });
      var n = g.numDe[k];
      var c = { caixa: el('div.cruz-casa', n ? el('span.cruz-num', { 'aria-hidden': 'true' }, String(n)) : null, campo, ver), campo: campo, ver: ver };
      _d.acentosNoFoco(acentos, campo, tab);
      campo.addEventListener('pointerdown', function () { tocouNaAtiva = foco === k && document.activeElement === campo; });
      campo.addEventListener('focus', function (ev) {
        if (foco !== k && deFora(ev)) { casas[foco].campo.focus(); return; }
        if (foco !== k) { foco = k; if (casasDa(d.palavras[atual]).indexOf(k) < 0) atual = palavraDa(k, d.palavras[atual].dir); }
        selecionar(campo); pintar();
      });
      // tocar de novo na casa ativa: troca a direção (no cruzamento)
      campo.addEventListener('click', function () { if (tocouNaAtiva) trocar(k); tocouNaAtiva = false; selecionar(campo); });
      campo.addEventListener('keydown', function (ev) { teclas(ev, k); });
      campo.addEventListener('input', function (ev) { escreveu(ev, k); });
      return c;
    }
    function selecionar(campo) { try { campo.setSelectionRange(0, campo.value.length); } catch (e) { /* sem seleção */ } }
    // palavra da casa k: a da direção preferida, se houver
    function palavraDa(k, dir) {
      var ps = g.casas[k].palavras, mesma = ps.filter(function (i) { return d.palavras[i].dir === dir; });
      return mesma.length ? mesma[0] : ps[0];
    }
    function trocar(k) {
      var ps = g.casas[k].palavras;
      if (ps.length < 2) return;
      atual = ps[(ps.indexOf(atual) + 1) % ps.length];
      Reino.Som.tocar('toque'); pintar();
    }
    function focar(k) { if (casas[k]) { foco = k; casas[k].campo.focus(); pintar(); } }
    // vizinha na palavra atual (passo +1 ou -1); null no fim
    function naPalavra(k, passo) { var cs = casasDa(d.palavras[atual]), j = cs.indexOf(k) + passo; return j >= 0 && j < cs.length && cs.indexOf(k) >= 0 ? cs[j] : null; }
    // seta: a próxima casa naquela direção (pula o vazio); a palavra passa a ser a dessa direção
    function mover(k, dx, dy) {
      var xy = k.split(',').map(Number);
      for (var x = xy[0] + dx, y = xy[1] + dy; x >= 0 && y >= 0 && x < g.w && y < g.h; x += dx, y += dy) {
        var alvo = x + ',' + y;
        if (!casas[alvo]) continue;
        atual = palavraDa(alvo, dx ? 'h' : 'v');
        focar(alvo); return;
      }
    }
    function teclas(ev, k) {
      var setas = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
      if (setas[ev.key]) { ev.preventDefault(); mover(k, setas[ev.key][0], setas[ev.key][1]); return; }
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (!ev.repeat) trocar(k); return; }
      if (ev.key !== 'Backspace' && ev.key !== 'Delete') return;
      ev.preventDefault();
      if (ctrl.travado) return;
      // Backspace: apaga a casa; vazia, volta uma casa na palavra e apaga lá
      var alvo = letra[k] || ev.key === 'Delete' ? k : naPalavra(k, -1);
      if (!alvo) return;
      letra[alvo] = '';
      if (alvo !== k) focar(alvo);
      pintar(); opts.onMudar();
    }
    // a letra nova (a caixa pode trazer a antiga junto); anda na palavra. Pela fileira de acentos (evento sintético)
    // anda depois que a fileira devolve o foco à casa
    function escreveu(ev, k) {
      var campo = casas[k].campo;
      if (ctrl.travado) { campo.value = letra[k]; return; }
      var ls = letras(campo.value.normalize('NFC').toLocaleUpperCase('pt-BR').replace(/[^\p{L}]/gu, ''));
      if (ls.length > 1 && letra[k] && ls.indexOf(letra[k]) >= 0) ls.splice(ls.indexOf(letra[k]), 1);
      letra[k] = ls.length ? ls[ls.length - 1] : '';
      pintar(); opts.onMudar();
      if (!letra[k]) return;
      var prox = naPalavra(k, 1);
      if (!prox) { selecionar(campo); return; }
      if (ev.isTrusted) focar(prox); else Promise.resolve().then(function () { if (campo.isConnected) focar(prox); });
    }
    function pintar() {
      var ativas = casasDa(d.palavras[atual]);
      Object.keys(casas).forEach(function (k) {
        var c = casas[k];
        if (c.campo.value !== letra[k]) c.campo.value = letra[k];
        if (c.ver.textContent !== letra[k]) U.preencher(c.ver, letra[k]);
        c.caixa.classList.toggle('na-palavra', ativas.indexOf(k) >= 0);
        c.caixa.classList.toggle('ativa', k === foco);
        c.campo.tabIndex = k === foco ? 0 : -1;
        c.campo.readOnly = !!ctrl.travado;
      });
      Object.keys(botoesPista).forEach(function (i) { botoesPista[i].setAttribute('aria-pressed', String(+i === atual)); });
    }
    function valor() { return d.palavras.map(function (p) { return casasDa(p).map(function (k) { return letra[k] || ' '; }).join(''); }); }
    var ctrl = {
      el: wrap, valor: valor,
      pronto: function () { return !_d.marcado(wrap) && Object.keys(letra).every(function (k) { return !!letra[k]; }); },
      conferir: function () {
        var v = valor(), erradas = d.palavras.map(function (p, i) { return base(v[i]) === base(p.resposta) ? -1 : i; }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      // erro parado nas casas das palavras erradas; depois apaga as letras delas (menos as que cruzam com uma certa)
      marcarErro: function (res) {
        var erradas = res.erradas || [], certas = {};
        d.palavras.forEach(function (p, i) { if (erradas.indexOf(i) < 0) casasDa(p).forEach(function (k) { certas[k] = true; }); });
        var cs = [];
        erradas.forEach(function (i) { casasDa(d.palavras[i]).forEach(function (k) { if (cs.indexOf(k) < 0) cs.push(k); }); });
        _d.erroParado(wrap, cs.map(function (k) { return casas[k].caixa; }), function () {
          cs.forEach(function (k) { if (!certas[k]) letra[k] = ''; });
          if (erradas.length) atual = erradas[0];
          pintar(); opts.onMudar();
        });
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); pintar(); },
    };
    pintar();
    return ctrl;
  };

  var pontuar = function (d, valor) {
    if (!Array.isArray(valor)) return 0;
    return _d.fracao(d.palavras.filter(function (p, i) { return typeof valor[i] === 'string' && base(valor[i]) === base(p.resposta); }).length, d.palavras.length);
  };
  /* correção: "1. GATO • 1. GALO • 2. LIMÃO" (no mesmo número, a deitada antes da em pé), número e palavra presos por
     espaço inquebrável (arte.md §17.4). Sem a seta: na correção ela vira desenho (canvas) e o Chromium quebra a linha
     antes e depois dele mesmo com U+00A0; a linha é montada por concatenação de texto (provas.js), sem lugar para um span */
  function textoPalavras(d, ls) {
    var g = grade(d);
    return ordemPistas(d, g).map(function (i) { return g.num[i] + '.\u00a0' + ls[i]; }).join('\u00a0• ');   // o • fica no fim da linha
  }

  Reino.registrarTipoDesafio('cruzadinha', {
    montar: montar, pontuar: pontuar, especial: true, pista: 'pistaEspecial',
    exemplos: { desafio: { id: 'x', tipo: 'cruzadinha', palavras: [{ resposta: 'GATO', x: 0, y: 0, dir: 'h', dica: 'Mia.' }, { resposta: 'GALO', x: 0, y: 0, dir: 'v', dica: 'Canta.' }] },
      certa: function (d) { return d.palavras.map(function (p) { return p.resposta; }); },
      estranhos: [[], [''], ['GATX', null], ['    ', '    '], [7, {}], ['G']] },
    // prova: as dicas também contam no tempo mínimo de leitura
    textoProva: function (d) { return ' ' + d.palavras.map(function (p) { return p.dica || ''; }).join(' '); },
    textoCerto: function (d) { return textoPalavras(d, d.palavras.map(function (p) { return p.resposta; })); },
    textoResposta: function (d, valor) {
      return textoPalavras(d, d.palavras.map(function (p, i) { return typeof valor[i] === 'string' && valor[i].trim() ? valor[i].replace(/ /g, '_') : '___'; }));
    },
    validar: function (d, v) {
      var ok = v.checar;
      if (!(Array.isArray(d.palavras) && d.palavras.length > 0)) { ok(false, d.id + ': cruzadinha sem palavras'); return; }
      var boas = d.palavras.map(function (p, i) {
        var onde = d.id + ': palavra ' + (i + 1);
        var certa = p && typeof p.resposta === 'string' && /^\p{Lu}{2,}$/u.test(p.resposta) && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && (p.dir === 'h' || p.dir === 'v');
        ok(certa, onde + ': precisa de resposta (MAIÚSCULAS, 2 letras ou mais), x, y e dir (h ou v)');
        if (!certa) return false;
        ok(v.textoOk(p.dica) || v.textoOk(p.img), onde + ': pista sem dica nem img');
        if (p.dica !== undefined) ok(v.textoOk(p.dica), onde + ': dica vazia');
        if (p.img !== undefined) _d.conferirDesenho(p.img, onde, v);
        return true;
      }).every(Boolean);
      if (!boas) return;
      // cruzamentos: a mesma letra (sem acento) nas duas palavras; duas palavras na mesma direção não se sobrepõem
      var vistas = {};
      d.palavras.forEach(function (p, i) {
        var ls = letras(p.resposta);
        casasDa(p).forEach(function (k, j) {
          var antes = vistas[k];
          if (antes) {
            ok(d.palavras[antes.i].dir !== p.dir, d.id + ': palavras ' + (antes.i + 1) + ' e ' + (i + 1) + ' se sobrepõem na mesma direção');
            ok(base(antes.l) === base(ls[j]), d.id + ': cruzamento em ' + k + ' com letras diferentes (' + antes.l + ' e ' + ls[j] + ')');
          } else vistas[k] = { i: i, l: ls[j] };
        });
      });
      var g = grade(d);
      // toda sequência de 2 letras ou mais numa linha (ou coluna) é uma palavra inteira nessa direção: palavras
      // encostadas formariam uma palavra que não existe
      var inteiras = {};
      d.palavras.forEach(function (p) { inteiras[p.dir + p.x + ',' + p.y + ':' + letras(p.resposta).length] = true; });
      [['h', g.w, g.h], ['v', g.h, g.w]].forEach(function (o) {
        for (var a = 0; a < o[2]; a++) {
          var ini = -1, ls = [];
          for (var b = 0; b <= o[1]; b++) {
            var k = o[0] === 'h' ? b + ',' + a : a + ',' + b, c = b < o[1] ? g.casas[k] : null;
            if (c) { if (ini < 0) ini = b; ls.push(c.letra); continue; }
            var xy = o[0] === 'h' ? ini + ',' + a : a + ',' + ini;
            if (ls.length > 1) ok(inteiras[o[0] + xy + ':' + ls.length], d.id + ': letras encostadas na ' + (o[0] === 'h' ? 'linha ' : 'coluna ') + (a + 1) + ' formam "' + ls.join('') + '", que não é palavra da cruzadinha');
            ini = -1; ls = [];
          }
        }
      });
      // todas as palavras ligadas (por cruzamentos) à 1ª: nenhuma solta da grade
      var ligadas = [0];
      for (var n = 0; n < ligadas.length; n++) {
        casasDa(d.palavras[ligadas[n]]).forEach(function (k) {
          g.casas[k].palavras.forEach(function (j) { if (ligadas.indexOf(j) < 0) ligadas.push(j); });
        });
      }
      d.palavras.forEach(function (p, i) { if (ligadas.indexOf(i) < 0) ok(false, d.id + ': palavra ' + (i + 1) + ' (' + p.resposta + ') solta: não cruza com as outras'); });
      if (g.w > 10 && !v.naProva) v.avisar(d.id + ': cruzadinha com ' + g.w + ' colunas: no celular as casas ficam pequenas (até 10)');
    },
  });
})();
