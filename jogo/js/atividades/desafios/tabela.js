/* Desafio tabela: o quadro do livro para completar (docs/contratos/quarto-bimestre.md §12).
     { tipo: 'tabela', pergunta, cab?: ['Masculino', 'Feminino'], linhas: [['o alemão', { certas: ['a alemã'] }], …], banco? }
   Célula texto = fixa; { certas: [...] } = digitada (caixa de texto; a fileira de acentos é uma linha da tabela que
   vai para logo depois da linha da caixa com foco, _d.acentosNoFoco, e escreve nela); { certa: i } = tocar a célula e depois a palavra banco[i] (como o completar; a
   mesma palavra pode ir em mais de uma célula). Valor: uma lista por linha com uma entrada por célula (null na fixa,
   o texto na digitada, o índice do banco ou null). Pontuação: fração das células a preencher que estão certas.
   No celular a tabela de 3 colunas ou mais (e com letras grandes, toda tabela) vira uma ficha por linha (css).
   Texto de célula nunca é cortado: a caixa de digitar é de uma linha que cresce para baixo (quebra entre as palavras;
   Enter passa para a próxima caixa) e a palavra longa da célula fixa ou do banco quebra na sílaba, com hífen. */
(function () {
  var U = Reino.util, el = U.el, _d = Reino._desafios;

  function digitada(c) { return !!c && typeof c === 'object' && Array.isArray(c.certas); }
  function deBanco(c) { return !!c && typeof c === 'object' && Number.isInteger(c.certa); }
  // células a preencher, em ordem de leitura: [[linha, coluna], …]
  function vagas(d) {
    var r = [];
    d.linhas.forEach(function (l, i) { l.forEach(function (c, j) { if (digitada(c) || deBanco(c)) r.push([i, j]); }); });
    return r;
  }
  function valorEm(valor, i, j) { return Array.isArray(valor) && Array.isArray(valor[i]) ? valor[i][j] : null; }
  // banco: vale a palavra (a mesma palavra repetida no banco também vale)
  function celulaCerta(d, c, v) {
    if (digitada(c)) return typeof v === 'string' && _d.digitadaCerta(v, c.certas);
    return Number.isInteger(v) && !!d.banco && v >= 0 && v < d.banco.length && d.banco[v] === d.banco[c.certa];
  }
  function preenchida(c, v) { return digitada(c) ? typeof v === 'string' && v.trim() !== '' : v !== null && v !== undefined; }
  // palavra de 9 letras ou mais quebra na sílaba, com o hífen à vista (arte.md §17.2; Reino._ui vem depois, já na tela)
  function hifenizar(t) { return Reino._ui && Reino._ui.hifenizar ? Reino._ui.hifenizar(t) : String(t); }
  // a caixa de digitar da célula: uma linha que cresce com o texto (nada fica escondido de lado)
  function crescer(campo) {
    if (!campo.isConnected) return;
    campo.style.height = 'auto';
    campo.style.height = campo.scrollHeight + campo.offsetHeight - campo.clientHeight + 'px';
  }

  var montar = function (d, opts) {
    var ncol = d.linhas.reduce(function (n, l) { return Math.max(n, l.length); }, 0);
    var valor = d.linhas.map(function (l, i) {
      return l.map(function (c, j) {
        var v = valorEm(opts.valorInicial, i, j);
        if (digitada(c)) return typeof v === 'string' ? v : '';
        return deBanco(c) && Number.isInteger(v) ? v : null;
      });
    });
    var lista = vagas(d);
    var sel = null;           // [i, j] da célula do banco escolhida
    var ultimoCampo = null;   // a fileira de acentos escreve aqui
    // com caixa de digitar, no celular também vira ficha (a caixa ganha a largura toda e não corta a palavra)
    var temDigitar = d.linhas.some(function (l) { return l.some(digitada); });
    var wrap = el('div.tabela-desafio' + (ncol > 2 ? '.tabela-larga' : '') + (temDigitar ? '.tabela-digita' : ''));
    var chips = [];
    if (d.banco) {
      chips = d.banco.map(function (p, k) {
        var b = el('button.chip-palavra', { type: 'button' }, p);
        b.addEventListener('click', function () { if (!ctrl.travado) porPalavra(k); });
        return b;
      });
      if (!d.instrucao && !_d.jaInstrui(d.pergunta)) wrap.appendChild(el('p.dica-toque', 'Toque numa casa da tabela e depois na palavra.'));
      wrap.appendChild(el('div.quadro-palavras.tabela-banco', chips));
    }
    var celulas = {};   // 'i,j' → { caixa (o que treme), campo? ou botao? }
    function rotulo(j) { return (d.cab && d.cab[j]) || 'Resposta'; }
    var digitadas = lista.filter(function (p) { return digitada(d.linhas[p[0]][p[1]]); });
    var acentos = digitadas.length
      ? el('tr.tabela-acentos', el('td', { colspan: String(ncol) }, _d.fileiraAcentos(function () { return ultimoCampo || corpo.querySelector('.campo-texto'); }))) : null;
    var corpo = el('tbody');
    var trs = d.linhas.map(function (l, i) {
      var tr = el('tr');
      corpo.appendChild(tr);
      l.forEach(function (c, j) {
        var td = el('td', { 'data-cab': d.cab && d.cab[j] ? d.cab[j] : null });
        tr.appendChild(td);
        if (digitada(c)) {
          // textarea de uma linha (linhas: 2 pede a textarea): a resposta comprida quebra e a caixa cresce
          var ct = _d.campoTexto({ valor: valor[i][j], semAcentos: true, max: 60, linhas: 2, rotulo: rotulo(j), classe: '.tabela-campo',
            aoMudar: function (t) {
              if (/\n/.test(t)) { t = t.replace(/\s*\n\s*/g, ' '); ct.campo.value = t; }   // colado com quebra de linha
              valor[i][j] = t; crescer(ct.campo); opts.onMudar();
            } });
          ct.campo.rows = 1;
          ct.campo.addEventListener('focus', function () { ultimoCampo = ct.campo; });
          ct.campo.addEventListener('keydown', function (ev) {
            if (ev.key !== 'Enter') return;
            ev.preventDefault();
            var todas = Array.prototype.slice.call(corpo.querySelectorAll('.tabela-campo')), k = todas.indexOf(ct.campo);
            if (todas[k + 1]) todas[k + 1].focus();
          });
          _d.acentosNoFoco(acentos, ct.campo, tr);
          td.appendChild(ct.el);
          celulas[i + ',' + j] = { caixa: ct.campo, ct: ct };
        } else if (deBanco(c)) {
          var b = el('button.tabela-lacuna', { type: 'button', 'aria-label': rotulo(j) });
          b.addEventListener('click', function () {
            if (ctrl.travado) return;
            sel = sel && sel[0] === i && sel[1] === j ? null : [i, j];
            Reino.Som.tocar('toque'); pintar();
          });
          td.appendChild(b);
          celulas[i + ',' + j] = { caixa: b, botao: b };
        } else {
          td.classList.add('tabela-fixa');
          U.preencher(td, hifenizar(String(c)));
        }
      });
      return tr;
    });
    // a fileira começa logo depois da linha da 1ª caixa de digitar
    if (acentos) corpo.insertBefore(acentos, trs[digitadas[0][0]].nextSibling);
    var tabela = el('table.tabela-quadro',
      d.cab ? el('thead', el('tr', d.cab.map(function (t) { return el('th', { scope: 'col' }, t); }))) : null, corpo);
    wrap.appendChild(el('div.tabela-moldura', tabela));
    // as caixas crescem quando entram na tela e quando a largura muda (girar o aparelho, Letras grandes)
    function crescerTodas() { Array.prototype.forEach.call(corpo.querySelectorAll('.tabela-campo'), crescer); }
    if (digitadas.length) {
      if (window.ResizeObserver) new ResizeObserver(crescerTodas).observe(tabela);
      setTimeout(crescerTodas, 0);   // a 1ª medida assim que a tabela entra na tela (também no jogo congelado, sem quadros)
    }

    // próxima célula do banco vazia depois de `de` (em ordem de leitura, dando a volta); null se não há
    function proximaVazia(de) {
      var bancos = lista.filter(function (p) { return deBanco(d.linhas[p[0]][p[1]]); });
      var k0 = de ? bancos.findIndex(function (p) { return p[0] === de[0] && p[1] === de[1]; }) : -1;
      for (var n = 1; n <= bancos.length; n++) {
        var p = bancos[(k0 + n + bancos.length) % bancos.length];
        if (valor[p[0]][p[1]] === null) return p;
      }
      return null;
    }
    // tocar a palavra: vai para a célula escolhida (de novo na mesma: tira) e a escolha passa para a próxima vazia
    function porPalavra(k) {
      if (!sel) sel = proximaVazia(null);
      if (!sel) { Reino.Som.tocar('toque'); return; }
      var i = sel[0], j = sel[1];
      valor[i][j] = valor[i][j] === k ? null : k;
      if (valor[i][j] !== null) sel = proximaVazia(sel) || sel;
      Reino.Som.tocar(valor[i][j] === null ? 'toque' : 'selecionar');
      pintar(); opts.onMudar();
    }
    function pintar() {
      Object.keys(celulas).forEach(function (chave) {
        var c = celulas[chave], p = chave.split(',').map(Number), v = valor[p[0]][p[1]];
        if (c.ct) { if (c.ct.campo.value !== v) { c.ct.campo.value = v; crescer(c.ct.campo); } return; }
        U.preencher(c.botao, v === null ? ' ' : hifenizar(d.banco[v]));
        c.botao.classList.toggle('preenchida', v !== null);
        c.botao.setAttribute('aria-pressed', String(!!sel && sel[0] === p[0] && sel[1] === p[1]));
      });
      var vSel = sel ? valor[sel[0]][sel[1]] : null;
      chips.forEach(function (b, k) { b.setAttribute('aria-pressed', String(vSel === k)); });
    }
    sel = proximaVazia(null);
    pintar();
    var ctrl = {
      el: wrap,
      valor: function () { return valor.map(function (l) { return l.slice(); }); },
      pronto: function () { return !_d.marcado(wrap) && lista.every(function (p) { return preenchida(d.linhas[p[0]][p[1]], valor[p[0]][p[1]]); }); },
      conferir: function () {
        var erradas = lista.filter(function (p) { return !celulaCerta(d, d.linhas[p[0]][p[1]], valor[p[0]][p[1]]); });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      // erro parado (arte.md §19.2): as células erradas ficam marcadas e depois se apagam para ela tentar de novo
      marcarErro: function (res) {
        var erradas = res.erradas || [];
        _d.erroParado(wrap, erradas.map(function (p) { return celulas[p[0] + ',' + p[1]].caixa; }), function () {
          erradas.forEach(function (p) { valor[p[0]][p[1]] = digitada(d.linhas[p[0]][p[1]]) ? '' : null; });
          var banco = erradas.filter(function (p) { return deBanco(d.linhas[p[0]][p[1]]); });
          if (banco.length) sel = banco[0];
          pintar(); opts.onMudar();
        });
      },
      marcarCerto: function () {
        wrap.classList.add('tudo-certo');
        Object.keys(celulas).forEach(function (k) { if (celulas[k].ct) celulas[k].ct.travar(true); });
      },
    };
    return ctrl;
  };

  var pontuar = function (d, valor) {
    var lista = vagas(d);
    return _d.fracao(lista.filter(function (p) { return celulaCerta(d, d.linhas[p[0]][p[1]], valorEm(valor, p[0], p[1])); }).length, lista.length);
  };
  // texto de uma linha da tabela (correção): as células separadas por " – " (célula vazia: ___)
  function linhaTexto(d, l, vs) {
    return l.map(function (c, j) {
      if (!digitada(c) && !deBanco(c)) return String(c);
      var v = vs ? vs[j] : digitada(c) ? c.certas[0] : c.certa;
      if (digitada(c)) return typeof v === 'string' && v.trim() ? v.trim() : '___';
      return Number.isInteger(v) && d.banco && d.banco[v] !== undefined ? d.banco[v] : '___';
    }).join(' – ');
  }
  function textoOk(t) { return typeof t === 'string' && t.trim().length > 0; }

  Reino.registrarTipoDesafio('tabela', {
    montar: montar, pontuar: pontuar, especial: true, pista: 'pistaEspecial', campos: ['cab', 'banco'],
    exemplos: { desafio: { id: 'x', tipo: 'tabela', cab: ['Masculino', 'Feminino'], linhas: [['o alemão', { certas: ['a alemã'] }], ['o leão', { certa: 1 }]], banco: ['a leitoa', 'a leoa'] },
      certa: function (d) { return d.linhas.map(function (l) { return l.map(function (c) { return digitada(c) ? c.certas[0] : deBanco(c) ? c.certa : null; }); }); },
      estranhos: [[], [[]], [[null, 'x'], [null, 99]], [[null, ''], [null, null]], [null], [['a alemã', 0]]] },
    // prova: títulos, células fixas e palavras do banco contam no tempo mínimo de leitura
    textoProva: function (d) {
      return ' ' + [].concat(d.cab || [], d.banco || [], d.linhas.map(function (l) { return l.filter(function (c) { return typeof c === 'string'; }).join(' '); })).join(' ');
    },
    textoCerto: function (d) { return d.linhas.filter(function (l) { return l.some(function (c) { return digitada(c) || deBanco(c); }); }).map(function (l) { return linhaTexto(d, l); }).join(' • '); },
    textoResposta: function (d, valor) {
      return d.linhas.map(function (l, i) { return l.some(function (c) { return digitada(c) || deBanco(c); }) ? linhaTexto(d, l, Array.isArray(valor[i]) ? valor[i] : []) : null; })
        .filter(function (t) { return t !== null; }).join(' • ');
    },
    validar: function (d, v) {
      var ok = v.checar, linhas = Array.isArray(d.linhas) && d.linhas.length > 0 && d.linhas.every(Array.isArray);
      if (!linhas) { ok(false, d.id + ': tabela sem linhas'); return; }
      var n = d.linhas[0].length;
      ok(n > 0 && d.linhas.every(function (l) { return l.length === n; }), d.id + ': as linhas da tabela precisam do mesmo número de células');
      if (d.cab !== undefined) ok(Array.isArray(d.cab) && d.cab.length === n && d.cab.every(textoOk), d.id + ': cab precisa de um título por coluna');
      var temBanco = false;
      d.linhas.forEach(function (l, i) {
        l.forEach(function (c, j) {
          var onde = d.id + ': linha ' + (i + 1) + ', coluna ' + (j + 1);
          if (typeof c === 'string') return;
          if (digitada(c)) ok(c.certas.length > 0 && c.certas.every(textoOk), onde + ': certas vazias');
          else if (deBanco(c)) { temBanco = true; ok(Array.isArray(d.banco) && c.certa >= 0 && c.certa < d.banco.length, onde + ': certa fora do banco'); }
          else ok(false, onde + ': célula precisa ser texto, { certas: [...] } ou { certa: i }');
        });
      });
      ok(vagas(d).length > 0, d.id + ': tabela sem célula para preencher');
      if (d.banco !== undefined || temBanco) ok(temBanco && Array.isArray(d.banco) && d.banco.length > 1 && d.banco.every(textoOk), d.id + ': banco precisa de 2 palavras ou mais (e de célula { certa: i })');
      if (n > 4 && !v.naProva) v.avisar(d.id + ': tabela com ' + n + ' colunas: no celular vira ficha por linha');
    },
  });
})();
