/* Desafios de escolha única: escolha (uma opção certa; também serve para "completar a frase")
   e vf (Verdadeiro ou Falso, a escolha com duas opções fixas). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var TIPOS = _d.TIPOS, PONTUAR = _d.PONTUAR, botaoOpcao = _d.botaoOpcao;

  // escolha única (também serve para "completar a frase")
  TIPOS.escolha = function (d, opts) {
    var ordem = opts.ordem || U.embaralhar(d.opcoes.map(function (_, i) { return i; }));
    var sel = opts.valorInicial != null ? opts.valorInicial : null;
    var bloqueadas = {};
    var lista = el('div.opcoes' + (d.opcoes.length === 2 ? '.opcoes-duas' : ''));
    var botoes = {};
    ordem.forEach(function (i) {
      var b = botaoOpcao(d.opcoes[i]);
      b.addEventListener('click', function () {
        if (bloqueadas[i] || ctrl.travado) return;
        sel = i; Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      botoes[i] = b; lista.appendChild(b);
    });
    function pintar() { Object.keys(botoes).forEach(function (k) { botoes[k].setAttribute('aria-pressed', String(+k === sel)); }); }
    pintar();
    var ctrl = {
      el: lista, ordem: ordem,
      valor: function () { return sel; },
      pronto: function () { return sel !== null; },
      conferir: function () { return { ok: sel === d.certa }; },
      marcarErro: function () { if (sel === null) return; bloqueadas[sel] = true; botoes[sel].classList.add('errada'); botoes[sel].disabled = true; sel = null; pintar(); },
      marcarCerto: function () { botoes[d.certa].classList.add('certa'); },
      revelar: function () { botoes[d.certa].classList.add('certa'); if (sel !== null && sel !== d.certa) botoes[sel].classList.add('errada'); },
    };
    return ctrl;
  };

  TIPOS.vf = function (d, opts) {
    var d2 = { opcoes: [{ e: '👍', t: 'Verdadeiro' }, { e: '👎', t: 'Falso' }], certa: d.certo ? 0 : 1 };
    var c = TIPOS.escolha(d2, Object.assign({}, opts, { ordem: [0, 1] }));
    c.el.classList.add('opcoes-vf');
    return c;
  };
  PONTUAR.escolha = function (d, valor) { return valor === d.certa ? 1 : 0; };
  PONTUAR.vf = function (d, valor) { return valor === (d.certo ? 0 : 1) ? 1 : 0; };
})();
