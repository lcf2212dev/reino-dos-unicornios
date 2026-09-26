/* Desafio varias: marcar todas as opções certas (d.livre: questão pessoal, qualquer escolha vale). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var TIPOS = _d.TIPOS, PONTUAR = _d.PONTUAR, fracao = _d.fracao, botaoOpcao = _d.botaoOpcao;

  TIPOS.varias = function (d, opts) {
    var ordem = opts.ordem || U.embaralhar(d.opcoes.map(function (_, i) { return i; }));
    var sel = {};
    (opts.valorInicial || []).forEach(function (i) { sel[i] = true; });
    var bloq = {};
    var lista = el('div.opcoes.opcoes-varias');
    var botoes = {};
    ordem.forEach(function (i) {
      var b = botaoOpcao(d.opcoes[i], '.opcao-marcar');
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
  PONTUAR.varias = function (d, valor) {
    if (d.livre) return (valor || []).length ? 1 : 0;
    var marcadas = valor || [];
    return fracao(d.opcoes.filter(function (o, i) { return !!o.ok === (marcadas.indexOf(i) >= 0); }).length, d.opcoes.length);
  };
})();
