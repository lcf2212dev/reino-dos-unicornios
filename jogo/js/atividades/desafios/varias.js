/* Desafio varias: marcar todas as opções certas (d.livre: questão pessoal, qualquer escolha vale). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var fracao = _d.fracao, botaoOpcao = _d.botaoOpcao;

  var montar = function (d, opts) {
    var ordem = opts.ordem || _d.ordemRotulada(d) || U.embaralhar(d.opcoes.map(function (_, i) { return i; }), ['varias', d]);   // rotuladas: escolha.js
    var sel = {};
    (opts.valorInicial || []).forEach(function (i) { sel[i] = true; });
    var bloq = {};
    // opções com desenho (o.img; d.soImagem): _d.botaoImg, de escolha.js
    var comImg = _d.temImg(d);
    var lista = el('div.opcoes.opcoes-varias' + (comImg ? '.opcoes-img' : '') + _d.classeLongas(d));
    var botoes = {};
    ordem.forEach(function (i) {
      var b = comImg ? _d.botaoImg(d.opcoes[i], d, '.opcao-marcar') : botaoOpcao(d.opcoes[i], '.opcao-marcar');
      b.addEventListener('click', function () {
        if (bloq[i] || ctrl.travado) return;
        sel[i] = !sel[i]; Reino.Som.tocar(sel[i] ? 'selecionar' : 'toque'); pintar(); opts.onMudar();
      });
      botoes[i] = b; lista.appendChild(b);
    });
    function pintar() { Object.keys(botoes).forEach(function (k) { botoes[k].setAttribute('aria-pressed', String(!!sel[k])); }); }
    pintar();
    function valor() { return Object.keys(sel).filter(function (k) { return sel[k]; }).map(Number).sort(function (a, b) { return a - b; }); }
    var ctrl = {
      el: lista, ordem: ordem, valor: valor,
      pronto: function () { return valor().length > 0; },
      conferir: function () {
        // livre: questão pessoal, qualquer escolha vale
        if (d.livre) return { ok: valor().length > 0, erradas: [], faltam: 0 };
        var certos = d.opcoes.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; });
        var v = valor();
        var erradas = v.filter(function (i) { return !d.opcoes[i].ok; });
        var faltam = certos.filter(function (i) { return !sel[i]; }).length;
        return { ok: erradas.length === 0 && faltam === 0, erradas: erradas, faltam: faltam };
      },
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (i) { sel[i] = false; bloq[i] = true; botoes[i].classList.add('errada'); botoes[i].disabled = true; });
        pintar();
      },
      marcarCerto: function () { d.opcoes.forEach(function (o, i) { if (d.livre ? sel[i] : o.ok) botoes[i].classList.add('certa'); }); },
      revelar: function () {
        if (d.livre) { ctrl.marcarCerto(); return; }
        d.opcoes.forEach(function (o, i) {
          if (o.ok) botoes[i].classList.add('certa');
          else if (sel[i]) botoes[i].classList.add('errada');
        });
      },
    };
    return ctrl;
  };
  var pontuar = function (d, valor) {
    if (d.livre) return (valor || []).length ? 1 : 0;
    var marcadas = valor || [];
    return fracao(d.opcoes.filter(function (o, i) { return !!o.ok === (marcadas.indexOf(i) >= 0); }).length, d.opcoes.length);
  };

  Reino.registrarTipoDesafio('varias', {
    montar: montar, pontuar: pontuar, treinavel: true, campos: ['livre', 'soImagem'], pista: 'pistaVarias',
    exemplos: { desafio: { id: 'x', tipo: 'varias', opcoes: [{ t: 'a', ok: true }, { t: 'b' }, { t: 'c', ok: true }] },
      certa: function (d) { return d.livre ? [0] : d.opcoes.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; }); },
      estranhos: [[], [99], [null], [0, 0, 0]] },
    textoFala: _d.textoOpcoes, falas: _d.opcoesFaladas,
    textoCerto: function (d) { return d.opcoes.filter(function (o) { return o.ok; }).map(function (o) { return o.t; }).join(', '); },
    textoResposta: function (d, valor) { return valor.map(function (i) { return d.opcoes[i].t; }).join(', '); },
    validar: function (d, v) {
      _d.conferirOpcoesImg(d, v);
      if (d.livre !== undefined) v.checar(d.livre === true, d.id + ': "livre" só vale true');
      if (d.livre) return;
      var ok = d.opcoes.filter(function (o) { return o.ok; }).length;
      v.checar(ok >= 1, d.id + ': nenhuma opção certa');
      if (!v.naProva && ok === d.opcoes.length) v.avisar(d.id + ': todas as opções são certas');
    },
  });
})();
