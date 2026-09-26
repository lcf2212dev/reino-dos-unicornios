/* Desafio copiar: escolher a escrita certa entre duas e copiá-la com peças de letras
   (D.pecasCopiar, D.ordemPecasCopiar; a prova usa a ordem das peças para voltar numa questão). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var fracao = _d.fracao, doTeclado = _d.doTeclado;

  /* ---------- copiar: escolher a escrita certa entre duas e copiar com peças de letras ----------
     { tipo: 'copiar', pergunta, itens: [{ letra: 'a', opcoes: ['PASEIO', 'PASSEIO'], certa: 1 }, …] }
     valor: [{ escolha: índice da escrita marcada ou null, letras: [índices das peças, na ordem da resposta] }]
     peças de um item: D.pecasCopiar(item), as letras das duas escritas sem repetir as comuns além do necessário
     (PASEIO + PASSEIO = P A S E I O S); a ordem na tela é embaralhada (opts.monte[i] na prova, para ficar igual ao voltar). */
  function letrasDe(t) { return Array.from(String(t).replace(/\s+/g, '')); }
  D.pecasCopiar = function (it) {
    var pecas = [], tem = {};
    it.opcoes.forEach(function (o) {
      var aqui = {};
      letrasDe(o).forEach(function (ch) {
        aqui[ch] = (aqui[ch] || 0) + 1;
        if (aqui[ch] > (tem[ch] || 0)) { pecas.push(ch); tem[ch] = aqui[ch]; }
      });
    });
    return pecas;
  };
  // ordem embaralhada das peças (nunca soletrando uma das escritas logo de cara)
  D.ordemPecasCopiar = function (it) {
    var pecas = D.pecasCopiar(it);
    var idx = pecas.map(function (_, i) { return i; });
    var palavras = it.opcoes.map(function (o) { return letrasDe(o).join(''); });
    function entrega(m) { var s = m.map(function (i) { return pecas[i]; }).join(''); return palavras.some(function (p) { return s.indexOf(p) === 0; }); }
    var m = U.embaralhar(idx, ['copiar', it]), tentativas = 0;
    while (pecas.length > 2 && entrega(m) && tentativas++ < 20) m = U.embaralhar(idx, ['copiar', it]);
    return m;
  };
  function copiaCerta(it, v) {
    if (!v || !v.letras) return false;
    var pecas = D.pecasCopiar(it);
    return v.letras.map(function (i) { return pecas[i]; }).join('') === letrasDe(it.opcoes[it.certa]).join('');
  }
  function textoCopia(it, v) { var pecas = D.pecasCopiar(it); return ((v && v.letras) || []).map(function (i) { return pecas[i]; }).join(''); }

  var montar = function (d, opts) {
    var valores = d.itens.map(function (it, i) {
      var v = opts.valorInicial && opts.valorInicial[i];
      return { escolha: v && v.escolha != null ? v.escolha : null, letras: v && v.letras ? v.letras.slice() : [] };
    });
    var monte = opts.monte && opts.monte.length === d.itens.length ? opts.monte : d.itens.map(function (it) { return D.ordemPecasCopiar(it); });
    var wrap = el('div.copiar');
    // com instrucao (linha logo abaixo da pergunta), a dica de toque não se repete
    if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Marque a escrita certa e monte a palavra com as letras. Para tirar uma letra, toque nela.'));
    var itens = d.itens.map(function (it, i) {
      var pecas = D.pecasCopiar(it);
      var botoesOpc = it.opcoes.map(function (o, j) {
        var b = el('button.copiar-opcao', { type: 'button' }, el('span.copiar-marca', { 'aria-hidden': 'true' }), el('span.copiar-palavra', o));
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          var v = valores[i];
          v.escolha = v.escolha === j ? null : j;
          // trocou para uma escrita mais curta: as letras que sobram voltam para o monte
          if (v.escolha !== null) v.letras = v.letras.slice(0, letrasDe(it.opcoes[v.escolha]).length);
          Reino.Som.tocar(v.escolha === null ? 'toque' : 'selecionar'); pintar(i); opts.onMudar();
        });
        return b;
      });
      var linha = el('div.copiar-linha');
      var botoesPeca = {};
      var pool = el('div.copiar-pecas', monte[i].map(function (k) {
        var b = el('button.copiar-peca', { type: 'button' }, pecas[k]);
        b.addEventListener('click', function (ev) {
          if (ctrl.travado) return;
          var v = valores[i];
          if (v.letras.indexOf(k) >= 0) return;
          var max = v.escolha !== null ? letrasDe(it.opcoes[v.escolha]).length : pecas.length;
          if (v.letras.length >= max) { avisar(linha); return; }
          v.letras.push(k);
          Reino.Som.tocar('selecionar'); pintar(i); opts.onMudar();
          // teclado: o foco volta para a 1ª peça livre do monte; o Tab só anda para a frente, então
          // qualquer letra que falta fica a poucos Tabs (antes, a letra à esquerda do foco pedia a
          // volta inteira na tela: até 29 Tabs)
          if (doTeclado(ev)) focarPrimeiraLivre(i);
          else if (document.activeElement === b || document.activeElement === document.body) focarPeca(i, monte[i].indexOf(k));
        });
        botoesPeca[k] = b;
        return b;
      }));
      var caixa = el('div.copiar-item',
        el('div.copiar-escolha', it.letra ? el('b.copiar-letra', it.letra + ')') : null, botoesOpc),
        el('div.copiar-resposta', el('span.copiar-rotulo', 'Resposta:'), linha),
        pool);
      wrap.appendChild(caixa);
      return { caixa: caixa, botoesOpc: botoesOpc, linha: linha, botoesPeca: botoesPeca, pecas: pecas };
    });
    function avisar(no) { no.classList.remove('pisca'); void no.offsetWidth; no.classList.add('pisca'); }
    function focarPeca(i, desde) {
      var ordem = monte[i], n = ordem.length;
      for (var s = 1; s <= n; s++) {
        var b = itens[i].botoesPeca[ordem[(desde + s) % n]];
        if (!b.disabled) { b.focus({ preventScroll: true }); return; }
      }
      var ultima = itens[i].linha.lastElementChild;
      if (ultima && ultima.tagName === 'BUTTON') ultima.focus({ preventScroll: true });
    }
    function focarPrimeiraLivre(i) {
      var ordem = monte[i];
      for (var s = 0; s < ordem.length; s++) {
        var b = itens[i].botoesPeca[ordem[s]];
        if (!b.disabled) { Reino.UI.focarTeclado(b); return; }
      }
      var ultima = itens[i].linha.lastElementChild;
      if (ultima && ultima.tagName === 'BUTTON') Reino.UI.focarTeclado(ultima);
    }
    function pintar(i) {
      var it = d.itens[i], v = valores[i], x = itens[i];
      x.botoesOpc.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String(v.escolha === j));
        U.preencher(b.querySelector('.copiar-marca'), v.escolha === j ? 'X' : '');
      });
      x.linha.innerHTML = '';
      v.letras.forEach(function (k, pos) {
        var b = el('button.copiar-peca.colocada', { type: 'button', 'aria-label': 'Tirar a letra ' + x.pecas[k] }, x.pecas[k]);
        b.addEventListener('click', function () {
          if (ctrl.travado) return;
          v.letras.splice(pos, 1);
          Reino.Som.tocar('toque'); pintar(i); opts.onMudar();
          var bs = x.linha.querySelectorAll('button');
          if (bs.length) bs[Math.min(pos, bs.length - 1)].focus({ preventScroll: true });
          else x.botoesPeca[k].focus({ preventScroll: true });
        });
        x.linha.appendChild(b);
      });
      // vagas: quantas letras faltam para a escrita marcada
      var total = v.escolha !== null ? letrasDe(it.opcoes[v.escolha]).length : 0;
      for (var s = v.letras.length; s < total; s++) x.linha.appendChild(el('span.copiar-vaga', { 'aria-hidden': 'true' }));
      if (!v.letras.length && v.escolha === null) x.linha.appendChild(el('span.copiar-vazia', 'Marque a escrita certa e toque nas letras'));
      Object.keys(x.botoesPeca).forEach(function (k) {
        var usada = v.letras.indexOf(+k) >= 0;
        x.botoesPeca[k].disabled = usada;
        x.botoesPeca[k].classList.toggle('usada', usada);
      });
      x.caixa.classList.toggle('pronto', itemPronto(i));
    }
    function itemPronto(i) {
      var v = valores[i];
      return v.escolha !== null && v.letras.length === letrasDe(d.itens[i].opcoes[v.escolha]).length;
    }
    d.itens.forEach(function (_, i) { pintar(i); });
    var ctrl = {
      el: wrap, monte: monte,
      valor: function () { return valores.map(function (v) { return { escolha: v.escolha, letras: v.letras.slice() }; }); },
      pronto: function () { return d.itens.every(function (_, i) { return itemPronto(i); }); },
      conferir: function () {
        var erradas = d.itens.map(function (it, i) {
          return valores[i].escolha === it.certa && copiaCerta(it, valores[i]) ? -1 : i;
        }).filter(function (i) { return i >= 0; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      // desfaz só a parte errada de cada item (a escolha e/ou a cópia)
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (i) {
          var it = d.itens[i], v = valores[i];
          if (v.escolha !== it.certa) v.escolha = null;
          if (!copiaCerta(it, v)) v.letras = [];
          itens[i].caixa.classList.add('treme');
          setTimeout(function () { itens[i].caixa.classList.remove('treme'); }, 600);
          pintar(i);
        });
        opts.onMudar();
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };
  // copiar: 2 partes por item (marcou a escrita certa; a cópia forma a escrita certa)
  var pontuar = function (d, valor) { return fracao(d.itens.reduce(function (t, it, i) { var v = valor[i] || {}; return t + (v.escolha === it.certa ? 1 : 0) + (copiaCerta(it, v) ? 1 : 0); }, 0), d.itens.length * 2); };

  function letra(it) { return it.letra ? it.letra + ') ' : ''; }
  // copiar (PASEIO/PASSEIO): as duas escritas soam iguais em voz alta; a narradora lê só o enunciado
  Reino.registrarTipoDesafio('copiar', {
    montar: montar, pontuar: pontuar,
    // certa: a escrita certa e, para cada letra dela, a primeira peça igual ainda não usada
    exemplos: { desafio: { id: 'x', tipo: 'copiar', itens: [{ opcoes: ['CASA', 'KAZA'], certa: 0 }] },
      certa: function (d) { return d.itens.map(function (it) {
        var pecas = D.pecasCopiar(it), usadas = [];
        var letras = Array.from(String(it.opcoes[it.certa]).replace(/\s+/g, '')).map(function (ch) {
          var k = pecas.findIndex(function (p, j) { return p === ch && usadas.indexOf(j) < 0; }); usadas.push(k); return k;
        });
        return { escolha: it.certa, letras: letras };
      }); },
      estranhos: [[], [{}], [null], [{ escolha: 99, letras: [99] }]] },
    // na prova: as peças de letras de cada item, embaralhadas uma vez
    prepararProva: function (d) { return d.itens.map(function (it) { return D.ordemPecasCopiar(it); }); },
    textoProva: function (d) { return d.itens.map(function (x) { return x.opcoes.join(' '); }).join(' '); },
    textoCerto: function (d) { return d.itens.map(function (it) { return letra(it) + it.opcoes[it.certa]; }).join(' • '); },
    textoResposta: function (d, valor) {
      return d.itens.map(function (it, i) {
        var v = valor[i] || {}, copia = textoCopia(it, v);
        return letra(it) + (v.escolha != null ? 'marcou ' + it.opcoes[v.escolha] : 'não marcou') + ', escreveu ' + (copia || '(nada)');
      }).join(' • ');
    },
    validar: function (d, v) {
      v.checar(v.textoOk(d.pergunta), d.id + ': copiar sem pergunta');
      v.checar(Array.isArray(d.itens) && d.itens.length > 0 && d.itens.every(function (it) {
        return Array.isArray(it.opcoes) && it.opcoes.length >= 2 && it.opcoes.every(v.textoOk)
          && new Set(it.opcoes).size === it.opcoes.length && Number.isInteger(it.certa) && it.certa >= 0 && it.certa < it.opcoes.length;
      }), d.id + ': itens do copiar inválidos (2+ escritas diferentes e a certa)');
    },
  });
})();
