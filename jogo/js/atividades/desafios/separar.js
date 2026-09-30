/* Desafio separar: levar cada item para o baú (grupo) certo (valor: { item: 0 ou 1 }). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var fracao = _d.fracao, doTeclado = _d.doTeclado;

  var montar = function (d, opts) {
    var grupo = {}; // item -> 0/1
    var escolhido = null, botoes = {};
    var ordem = U.embaralhar(d.itens.map(function (_, i) { return i; }), ['separar', d]);
    var wrap = el('div.separar');
    var pool = el('div.separar-monte');
    var baus = d.grupos.map(function (g, gi) {
      var caixa = el('div.bau-itens');
      var b = el('button.bau', { type: 'button' },
        el('span.bau-titulo', el('span.bau-emoji', g.e), el('b', g.t)),
        el('span.bau-dica', g.dica),
        caixa);
      b.addEventListener('click', function (ev) {
        if (ctrl.travado) return;
        if (ev.target.closest('.sep-item')) return;
        if (escolhido === null) { avisar(); return; }
        grupo[escolhido] = gi;
        var prox = ordem.find(function (i) { return grupo[i] === undefined; });
        escolhido = prox === undefined ? null : prox;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
        // teclado: o baú com foco cresceu com o item novo e a parte de baixo ia para trás do
        // rodapé; rola a caixa até ele aparecer inteiro. Toque e mouse: nada muda
        if (doTeclado(ev)) Reino.UI.focarTeclado(b);
      });
      return { el: b, caixa: caixa };
    });
    // a instrução de toque aparece uma vez só: o enunciado que já diz "toque…" dispensa a dica (D6-13)
    var dica = el('p.dica-toque', 'Toque em um item e depois no baú certo.');
    var comDica = !d.instrucao && !_d.jaInstrui(d.pergunta);
    function avisar() { if (!comDica) return; dica.classList.remove('pisca'); void dica.offsetWidth; dica.classList.add('pisca'); }
    function pintar() {
      pool.innerHTML = ''; botoes = {};
      baus.forEach(function (b) { b.caixa.innerHTML = ''; });
      ordem.forEach(function (i) {
        var it = d.itens[i];
        var b = el('button.sep-item', { type: 'button' }, el('span.opcao-emoji', it.e), el('span', it.t));
        if (escolhido === i) b.classList.add('escolhido');
        botoes[i] = b;
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (ctrl.travado) return;
          // tocar num item sempre o escolhe; se estava num baú, ele volta para o monte
          if (grupo[i] !== undefined) delete grupo[i];
          escolhido = i;
          Reino.Som.tocar('toque'); pintar(); opts.onMudar();
        });
        if (grupo[i] === undefined) pool.appendChild(b); else baus[grupo[i]].caixa.appendChild(b);
      });
      if (!pool.children.length) pool.appendChild(el('span.frase-vazia', 'Tudo separado! Agora é só conferir.'));
      wrap.classList.toggle('com-escolha', escolhido !== null);
    }
    if (comDica) wrap.appendChild(dica);
    wrap.appendChild(pool);
    wrap.appendChild(el('div.baus', baus.map(function (b) { return b.el; })));
    escolhido = ordem[0];
    pintar();
    var ctrl = {
      el: wrap,
      valor: function () { return U.copia(grupo); },
      pronto: function () { return !_d.marcado(wrap) && Object.keys(grupo).length === d.itens.length; },
      conferir: function () {
        var erradas = Object.keys(grupo).map(Number).filter(function (i) { return grupo[i] !== d.itens[i].g; });
        return { ok: erradas.length === 0, erradas: erradas };
      },
      marcarErro: function (res) {
        // o pintar refaz os itens: a marca vai nos botões de agora (cada um já está no baú errado)
        var itens = (res.erradas || []).map(function (i) { return botoes[i]; }).filter(Boolean);
        _d.erroParado(wrap, itens, function () {
          (res.erradas || []).forEach(function (i) { delete grupo[i]; });
          escolhido = (res.erradas || [])[0] != null ? res.erradas[0] : null;
          pintar(); opts.onMudar();
        });
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };
  var pontuar = function (d, valor) { return fracao(d.itens.filter(function (it, i) { return valor[i] === it.g; }).length, d.itens.length); };

  // a sala 5 sempre tem pelo menos um "separar nos baús" (semprePrimeiro)
  Reino.registrarTipoDesafio('separar', {
    montar: montar, pontuar: pontuar, especial: true, semprePrimeiro: true, pista: 'pistaEspecial',
    exemplos: { desafio: { id: 'y', tipo: 'separar', grupos: ['G1', 'G2'], itens: [{ t: 'a', g: 0 }, { t: 'b', g: 1 }, { t: 'c', g: 0 }] },
      certa: function (d) { return d.itens.map(function (it) { return it.g; }); }, estranhos: [{}, { 0: 99 }, [], [null]] },
    validar: function (d, v) { if (!v.naProva) v.checar(d.itens.every(function (i) { return i.g === 0 || i.g === 1; }) && d.grupos.length === 2, d.id + ': separar inválido'); },
  });
})();
