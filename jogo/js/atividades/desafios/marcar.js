/* Desafio marcar: circular, sublinhar ou pintar palavras e sinais num texto, como no livro (4º bimestre).
   { tipo: 'marcar', pergunta, texto: 'Era uma vez um {gato} esperto{.|0}', cores?: [{ nome, cor }], marca? }
   Alvos entre chaves ({a princesa} vale como um alvo de duas palavras); {x|n} = cor n de `cores` (sem cores: uma
   marca só); \n quebra a linha. Cada palavra e cada sinal é tocável ("..." e "—" são um sinal só).
   Alvo opcional ("aceitar também"): {x?} (uma palavra), {várias palavras|?} ou {x|n?}; frase com "?" no fim sem "|"
   é recusada (a pergunta com o sinal: {frase}{?}); marcado (na cor certa) não é erro, sem marca não falta, e fica
   fora do total. O sinal ? sozinho é {?} (ou {?|n}); {??} é o ? opcional. Rótulo de item no começo da linha
   ("a) ", "1. ", "1) ") é só texto: não é tocável nem conta como token.
   valor: { <índice do token>: cor }. Pontuação: (alvos certos - marcas erradas) / alvos obrigatórios, de 0 a 1.
   Contrato: docs/contratos/quarto-bimestre.md §12. */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;
  var MARCAS = ['circular', 'sublinhar', 'pintar'];
  // quebra de linha, espaço, "...", "…", "—", palavra (com hífen ou apóstrofo dentro) ou um sinal sozinho
  var RE_PEDACO = /\n|[^\S\n]+|\.\.\.|…|—|[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu;
  var LETRA = /[\p{L}\p{N}]/u;
  // rótulo de item no começo da linha: "a) ", "a. ", "A) ", "1. ", "12) "
  var RE_ROTULO = /^(?:[a-z][.)]|[A-Z]\)|\d{1,2}[.)])(?=[^\S\n])/;

  /* o texto em tokens: { tokens: [{ t, sinal, espaco (antes), linha }], linhas, alvos: [{ idx: [tokens], cat, opcional }],
     rotulos: { linha: 'a)' }, erros }
     (guardado por texto: as salas não mudam com o jogo aberto) */
  var CACHE = Object.create(null);
  function analisar(texto) {
    texto = String(texto == null ? '' : texto);
    if (CACHE[texto]) return CACHE[texto];
    var r = { tokens: [], linhas: 1, alvos: [], rotulos: {}, erros: [] }, linha = 0, espaco = false, antes = '', inicio = true;
    function pedaco(s, alvo) {
      var m;
      RE_PEDACO.lastIndex = 0;
      while ((m = RE_PEDACO.exec(s))) {
        var x = m[0];
        if (x === '\n') { linha++; espaco = false; inicio = true; continue; }
        if (!/\S/.test(x)) { espaco = true; continue; }
        var ro = inicio && !alvo && RE_ROTULO.exec(s.slice(m.index));
        inicio = false;
        if (ro) { r.rotulos[linha] = ro[0]; RE_PEDACO.lastIndex = m.index + ro[0].length; continue; }
        if (alvo) alvo.idx.push(r.tokens.length);
        r.tokens.push({ t: x, sinal: !LETRA.test(x), espaco: espaco, linha: linha });
        espaco = false;
      }
    }
    // alvo colado numa palavra ({gat}o) partiria a palavra em dois tokens
    function junta(a, b) { return LETRA.test(a.slice(-1)) && LETRA.test(b.charAt(0)); }
    var re = /\{([^{}]*)\}/g, i = 0, m;
    while ((m = re.exec(texto))) {
      var solto = texto.slice(i, m.index);
      if (/[{}]/.test(solto)) r.erros.push('chave sem par perto de "' + solto.slice(-12) + '"');
      pedaco(solto);
      var corpo = m[1], cat = 0, barra = corpo.lastIndexOf('|'), opcional = false;
      if (barra >= 0) {
        var n = corpo.slice(barra + 1).trim();
        if (/\?$/.test(n)) { opcional = true; n = n.slice(0, -1).trim(); }
        // {várias palavras|?}: opcional sem cor
        if (opcional && n === '') { corpo = corpo.slice(0, barra); barra = -1; }
        else {
          if (!/^\d+$/.test(n)) r.erros.push('cor inválida em "{' + corpo + '}"');
          cat = Number(n); corpo = corpo.slice(0, barra);
        }
      } else if (corpo.trim().length > 1 && /\?\s*$/.test(corpo)) {
        // frase com "?" no fim é ambígua (a pergunta inteira ou um alvo opcional?): o validador recusa
        if (/\s/.test(corpo.trim())) r.erros.push('alvo de várias palavras terminado em "?" em "{' + m[1] + '}": para a pergunta com o sinal, {frase}{?}; para alvo opcional, {frase|?} (ou {frase|n?} com cores)');
        opcional = true; corpo = corpo.replace(/\?\s*$/, '');
      }
      if (junta(antes + solto, corpo)) r.erros.push('alvo "{' + m[1] + '}" no meio de uma palavra');
      var alvo = { idx: [], cat: cat, barra: barra >= 0, opcional: opcional, t: corpo.trim() };
      pedaco(corpo, alvo);
      if (!alvo.idx.length) r.erros.push('alvo vazio "{' + m[1] + '}"');
      else r.alvos.push(alvo);
      antes = corpo; i = re.lastIndex;
      if (junta(corpo, texto.slice(i))) r.erros.push('alvo "{' + m[1] + '}" no meio de uma palavra');
    }
    var fim = texto.slice(i);
    if (/[{}]/.test(fim)) r.erros.push('chave sem par perto de "' + fim.slice(0, 12) + '"');
    pedaco(fim);
    r.linhas = linha + 1;
    CACHE[texto] = r;
    return r;
  }

  // as marcas válidas de um valor: { índice: cor } (cor inteira ≥ 0)
  function marcasDe(valor) {
    var v = {};
    if (!valor || typeof valor !== 'object') return v;
    Object.keys(valor).forEach(function (k) {
      if (/^\d+$/.test(k) && Number.isInteger(valor[k]) && valor[k] >= 0) v[k] = valor[k];
    });
    return v;
  }
  function obrigatorios(a) { return a.alvos.filter(function (al) { return !al.opcional; }); }
  // { certos, erradas: [índices], faltam, total } de um valor (marca em alvo opcional, na cor dele, não é errada)
  function avaliar(d, valor) {
    var a = analisar(d.texto), v = marcasDe(valor), naAlvo = {}, ob = obrigatorios(a);
    a.alvos.forEach(function (al) { al.idx.forEach(function (i) { naAlvo[i] = al.cat; }); });
    var certos = ob.filter(function (al) { return al.idx.every(function (i) { return v[i] === al.cat; }); }).length;
    var erradas = Object.keys(v).filter(function (k) { return naAlvo[k] !== v[k]; }).map(Number);
    return { certos: certos, erradas: erradas, faltam: ob.length - certos, total: ob.length };
  }
  var pontuar = function (d, valor) {
    var r = avaliar(d, valor);
    return r.total ? U.clamp((r.certos - r.erradas.length) / r.total, 0, 1) : 0;
  };

  // pintar com cor do livro: texto --tinta ou --branco, o que tiver mais contraste com a cor (arte.md §8.1)
  function luz(hex) {
    var n = parseInt(String(hex).slice(1), 16), rgb = [n >> 16 & 255, n >> 8 & 255, n & 255];
    return rgb.reduce(function (s, c, i) {
      c /= 255;
      return s + [0.2126, 0.7152, 0.0722][i] * (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    }, 0);
  }
  function contraste(a, b) { var x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function fundoEscuro(cor) { return contraste(cor, '#ffffff') > contraste(cor, Reino.config.paleta.tinta); }

  var montar = function (d, opts) {
    var a = analisar(d.texto), cores = d.cores || null;
    var sel = marcasDe(opts.valorInicial), ativa = 0, foco = 0;
    var wrap = el('div.marcar.marcar-' + (MARCAS.indexOf(d.marca) >= 0 ? d.marca : 'circular') + (cores ? '.marcar-com-cores' : ''));
    var botoesCor = [];
    if (cores) {
      wrap.appendChild(el('div.marcar-legenda', { role: 'group', 'aria-label': 'Cores' }, cores.map(function (c, n) {
        var b = el('button.marcar-cor', { type: 'button' }, el('span.marcar-amostra', { 'aria-hidden': 'true' }), el('span', c.nome));
        b.style.setProperty('--marca-cor', c.cor);
        b.addEventListener('click', function () { if (ctrl.travado) return; ativa = n; Reino.Som.tocar('selecionar'); pintarCores(); });
        botoesCor.push(b);
        return b;
      })));
    }
    if (!d.instrucao && !_d.jaInstrui(d.pergunta)) wrap.appendChild(el('p.dica-toque', cores
      ? 'Escolha a cor e toque na palavra ou no sinal. Toque de novo para tirar.'
      : 'Toque na palavra ou no sinal para marcar. Toque de novo para tirar.'));

    // o texto: uma linha por \n (com o rótulo "a)" só de texto); palavra e sinal colados (sem espaço) ficam juntos, sem
    // quebra entre eles (o CSS encosta um no outro)
    var caixa = el('div.marcar-texto', { role: 'group', 'aria-label': 'Texto' });
    var linhas = [];
    for (var l = 0; l < a.linhas; l++) {
      var ln = caixa.appendChild(el('div.marcar-linha'));
      if (a.rotulos[l]) { ln.appendChild(el('span.marcar-rotulo', a.rotulos[l])); ln.appendChild(document.createTextNode('\u00a0')); }
      linhas.push(ln);
    }
    var tokens = [], grupo = null;
    a.tokens.forEach(function (tk, i) {
      var linha = linhas[tk.linha];
      if (!grupo || tk.espaco || grupo.parentNode !== linha) {
        if (grupo && tk.espaco && grupo.parentNode === linha) linha.appendChild(document.createTextNode(' '));
        grupo = linha.appendChild(el('span.marcar-grupo'));
      }
      var t = el('span.marcar-token' + (tk.sinal ? '.marcar-sinal' : ''), { role: 'button', tabindex: i === 0 ? '0' : '-1' }, tk.t);
      t.addEventListener('click', function () { tocar(i); });
      grupo.appendChild(t);
      tokens.push(t);
    });
    linhas.forEach(function (ln) { if (!ln.querySelector('.marcar-token')) ln.classList.add('marcar-linha-vazia'); });
    wrap.appendChild(caixa);

    function tocar(i) {
      if (ctrl.travado) return;
      mover(i, false);
      var cat = cores ? ativa : 0;
      if (sel[i] === cat) delete sel[i]; else sel[i] = cat;
      Reino.Som.tocar(sel[i] === undefined ? 'toque' : 'selecionar');
      pintar(i); opts.onMudar();
    }
    function pintar(i) {
      var t = tokens[i], c = sel[i], tem = c !== undefined;
      t.setAttribute('aria-pressed', String(tem));
      var cor = tem && cores && cores[c] ? cores[c].cor : null;
      if (cor) t.style.setProperty('--marca-cor', cor); else t.style.removeProperty('--marca-cor');
      t.classList.toggle('marca-escura', !!cor && fundoEscuro(cor));
    }
    function pintarCores() { botoesCor.forEach(function (b, n) { b.setAttribute('aria-pressed', String(n === ativa)); }); }
    tokens.forEach(function (_, i) { pintar(i); });
    pintarCores();

    // teclado: tabindex itinerante (um token só na ordem do Tab); setas andam, Enter/Espaço marca
    function mover(j, focar) {
      if (j < 0 || j >= tokens.length) return;
      tokens[foco].setAttribute('tabindex', '-1');
      foco = j;
      tokens[j].setAttribute('tabindex', '0');
      if (focar) tokens[j].focus();
    }
    // seta para cima/baixo: o token da linha de cima/baixo (na tela) mais perto na horizontal
    function vertical(i, dir) {
      var r = tokens[i].getBoundingClientRect(), meio = r.left + r.width / 2, topo = null, melhor = -1, dist = Infinity;
      for (var j = i + dir; j >= 0 && j < tokens.length; j += dir) {
        var q = tokens[j].getBoundingClientRect();
        if (dir > 0 ? q.top < r.bottom - 2 : q.bottom > r.top + 2) continue;
        if (topo === null) topo = q.top;
        else if (Math.abs(q.top - topo) > 2) break;
        var dd = Math.abs(q.left + q.width / 2 - meio);
        if (dd < dist) { dist = dd; melhor = j; }
      }
      return melhor;
    }
    caixa.addEventListener('keydown', function (ev) {
      var i = tokens.indexOf(ev.target);
      if (i < 0) return;
      var k = ev.key, j = null;
      if (k === 'Enter' || k === ' ') { ev.preventDefault(); if (!ev.repeat) tocar(i); return; }
      if (k === 'ArrowRight') j = i + 1;
      else if (k === 'ArrowLeft') j = i - 1;
      else if (k === 'ArrowDown' || k === 'ArrowUp') j = vertical(i, k === 'ArrowDown' ? 1 : -1);
      else if (k === 'Home') j = 0;
      else if (k === 'End') j = tokens.length - 1;
      else return;
      ev.preventDefault();
      if (j >= 0 && j < tokens.length) mover(j, true);
    });

    function valor() { return U.copia(sel); }
    var ctrl = {
      el: wrap, valor: valor,
      pronto: function () { return !_d.marcado(wrap) && Object.keys(sel).length > 0; },
      conferir: function () {
        var r = avaliar(d, sel), ok = !r.faltam && !r.erradas.length;
        var dica = !ok && !r.erradas.length ? 'Dica: ainda falta marcar ' + (r.faltam === 1 ? '1 item' : r.faltam + ' itens') + '!' : null;
        return { ok: ok, erradas: r.erradas, faltam: r.faltam, dica: dica };
      },
      // as marcas erradas ficam paradas (arte.md §19.2) e depois saem
      marcarErro: function (res) {
        var erradas = (res.erradas || []).filter(function (i) { return tokens[i]; });
        _d.erroParado(wrap, erradas.map(function (i) { return tokens[i]; }), function () {
          erradas.forEach(function (i) { delete sel[i]; pintar(i); });
          opts.onMudar();
        });
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };

  // texto de um grupo de índices: tokens seguidos com o mesmo espaço do texto ("a princesa", "esperto.")
  function juntar(a, idx) {
    return idx.map(function (i, k) {
      var junto = k && idx[k - 1] === i - 1 && !a.tokens[i].espaco && a.tokens[i].linha === a.tokens[i - 1].linha;
      return (k && !junto ? ' ' : '') + a.tokens[i].t;
    }).join('');
  }
  // lista "gato, a princesa" (ou "Ponto-final: . e ." por cor): itens = [{ idx, cat }]
  function listar(d, itens) {
    var a = analisar(d.texto);
    function nomes(lista) { return lista.map(function (x) { return juntar(a, x.idx); }).join(', '); }
    if (!d.cores) return nomes(itens);
    return d.cores.map(function (c, n) {
      var daCor = itens.filter(function (x) { return x.cat === n; });
      return daCor.length ? c.nome + ': ' + nomes(daCor) : null;
    }).concat(itens.some(function (x) { return !d.cores[x.cat]; }) ? ['outra cor: ' + nomes(itens.filter(function (x) { return !d.cores[x.cat]; }))] : [])
      .filter(Boolean).join(' • ');
  }

  Reino.registrarTipoDesafio('marcar', {
    montar: montar, pontuar: pontuar, campos: ['cores', 'marca'],
    exemplos: {
      desafio: { id: 'x', tipo: 'marcar', texto: 'A {menina|1} riu{.|0}\nO {gato de botas|1} correu{...|0} {Fim|1?}',
        cores: [{ nome: 'Ponto', cor: '#4d8dff' }, { nome: 'Personagem', cor: '#ff7eb6' }] },
      certa: function (d) {
        var v = {};
        obrigatorios(analisar(d.texto)).forEach(function (al) { al.idx.forEach(function (i) { v[i] = al.cat; }); });
        return v;
      },
      estranhos: [{}, { 0: 0 }, { 999: 0 }, { 1: 7 }, { 1: null, 2: 'x' }, [], { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }],
    },
    // a prova mede o tempo de leitura pelo texto todo
    textoProva: function (d) { return ' ' + analisar(d.texto).tokens.map(function (t) { return t.t; }).join(' '); },
    textoCerto: function (d) {
      var a = analisar(d.texto), op = a.alvos.filter(function (al) { return al.opcional; });
      return listar(d, obrigatorios(a)) + (op.length ? ' (também vale: ' + listar(d, op) + ')' : '');
    },
    textoResposta: function (d, valor) {
      var v = marcasDe(valor), itens = [];
      Object.keys(v).map(Number).sort(function (x, y) { return x - y; }).forEach(function (i) {
        var ult = itens[itens.length - 1];
        if (ult && ult.cat === v[i] && ult.idx[ult.idx.length - 1] === i - 1) ult.idx.push(i);
        else itens.push({ idx: [i], cat: v[i] });
      });
      var a = analisar(d.texto);
      itens = itens.filter(function (x) { return x.idx.every(function (i) { return a.tokens[i]; }); });
      return itens.length ? listar(d, itens) : '(nada marcado)';
    },
    validar: function (d, v) {
      v.checar(v.textoOk(d.pergunta), d.id + ': marcar sem pergunta');
      if (!v.textoOk(d.texto)) { v.checar(false, d.id + ': marcar sem texto'); return; }
      var a = analisar(d.texto);
      a.erros.forEach(function (e) { v.checar(false, d.id + ': ' + e); });
      v.checar(obrigatorios(a).length > 0, d.id + ': marcar sem alvo obrigatório (palavra ou sinal entre chaves)');
      if (d.marca !== undefined) v.checar(MARCAS.indexOf(d.marca) >= 0, d.id + ': marca deve ser ' + MARCAS.join('/'));
      if (d.cores === undefined) {
        v.checar(a.alvos.every(function (al) { return !al.barra; }), d.id + ': {x|n} só vale com cores');
      } else {
        var okCores = Array.isArray(d.cores) && d.cores.length > 0 && d.cores.every(function (c) { return c && v.textoOk(c.nome) && /^#[0-9a-f]{6}$/i.test(c.cor); });
        v.checar(okCores, d.id + ': cores = [{ nome, cor: \'#rrggbb\' }, …]');
        if (okCores) {
          v.checar(new Set(d.cores.map(function (c) { return c.nome; })).size === d.cores.length, d.id + ': nome de cor repetido');
          v.checar(a.alvos.every(function (al) { return al.cat < d.cores.length; }), d.id + ': alvo com cor que não existe em cores');
          d.cores.forEach(function (c, n) { if (!a.alvos.some(function (al) { return al.cat === n; })) v.avisar(d.id + ': a cor ' + c.nome + ' não marca nada'); });
        }
      }
      if (a.tokens.length > 160) v.avisar(d.id + ': texto longo para o celular (' + a.tokens.length + ' palavras e sinais)');
      if (a.tokens.length && a.alvos.reduce(function (s, al) { return s + al.idx.length; }, 0) === a.tokens.length) v.avisar(d.id + ': tudo no texto é alvo');
    },
  });
  // para os testes de unidade
  _d.analisarMarcar = analisar;
})();
