/* Desafios de sequência: ordenar (etapas numa lista numerada) e frase (montar a frase com blocos),
   a mesma implementação (sequencia) com dois estilos. Valor: índices na ordem da resposta. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var TIPOS = _d.TIPOS, PONTUAR = _d.PONTUAR, doTeclado = _d.doTeclado;

  // ordenar e montar frase: tocar para colocar na sequência
  function sequencia(d, opts, estilo) {
    var itens = d.itens || d.blocos;
    var n = itens.length;
    var seq = opts.valorInicial ? opts.valorInicial.slice() : [];
    // opts.monte: mesma ordem embaralhada ao voltar numa questão da prova
    var monte = opts.monte ? opts.monte.slice() : U.embaralhar(itens.map(function (_, i) { return i; }));
    while (!opts.monte && n > 2 && monte.every(function (v, i) { return v === i; })) monte = U.embaralhar(monte);
    var wrap = el('div.sequencia.seq-' + estilo);
    var alvo = el(estilo === 'frase' ? 'div.seq-alvo.frase-linha' : 'ol.seq-alvo');
    var pool = el('div.seq-monte');
    function pecasAlvo() { return alvo.querySelectorAll('button'); }
    function pintar() {
      alvo.innerHTML = '';
      pool.innerHTML = '';
      seq.forEach(function (i, pos) {
        var b = el('button.seq-item.no-alvo', { type: 'button' },
          estilo === 'frase' ? null : el('span.seq-num', String(pos + 1)), el('span', itens[i]));
        b.addEventListener('click', function (ev) {
          if (ctrl.travado) return;
          seq.splice(pos, 1); Reino.Som.tocar('toque'); pintar(); opts.onMudar();
          // teclado: os botões foram refeitos; o foco fica na mesma posição da resposta (ou no monte)
          if (doTeclado(ev)) Reino.UI.focarTeclado(pecasAlvo()[Math.min(pos, seq.length - 1)] || pool.querySelector('button'));
        });
        alvo.appendChild(estilo === 'frase' ? b : el('li', b));
      });
      for (var k = seq.length; k < n && estilo !== 'frase'; k++) alvo.appendChild(el('li.seq-vaga', el('span.seq-num', String(k + 1)), el('span', '...')));
      if (estilo === 'frase' && !seq.length) alvo.appendChild(el('span.frase-vazia', 'Toque nos blocos abaixo para montar a frase'));
      monte.filter(function (i) { return seq.indexOf(i) < 0; }).forEach(function (i) {
        var b = el('button.seq-item', { type: 'button' }, itens[i]);
        b.addEventListener('click', function (ev) {
          if (ctrl.travado) return;
          var noMonte = Array.prototype.indexOf.call(pool.querySelectorAll('button'), b);
          seq.push(i); Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
          // teclado: os botões foram refeitos e o foco ia para o body; ele vai para o bloco que
          // ficou no lugar deste no monte (ou o de antes); o monte acabou: a última peça colocada
          if (doTeclado(ev)) {
            var resto = pool.querySelectorAll('button'), pecas = pecasAlvo();
            Reino.UI.focarTeclado(resto[Math.min(noMonte, resto.length - 1)] || pecas[pecas.length - 1]);
          }
        });
        pool.appendChild(b);
      });
    }
    if (estilo === 'frase') {
      wrap.appendChild(alvo);
      // com instrucao (linha logo abaixo da pergunta), a dica de toque não se repete
      if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Toque num bloco para colocar. Toque de novo para tirar.'));
      wrap.appendChild(pool);
    } else {
      // no ordenar, as opções ficam em cima para caberem na tela do celular
      if (!d.instrucao) wrap.appendChild(el('p.dica-toque', 'Toque nas etapas na ordem certa. Errou? Toque no item da lista para tirar.'));
      wrap.appendChild(pool);
      wrap.appendChild(alvo);
    }
    pintar();
    var ctrl = {
      el: wrap, ordem: monte,
      valor: function () { return seq.slice(); },
      pronto: function () { return seq.length === n; },
      conferir: function () {
        var prim = -1;
        for (var i = 0; i < n; i++) if (seq[i] !== i) { prim = i; break; }
        return { ok: prim < 0, primeiroErrado: prim };
      },
      marcarErro: function (res) {
        wrap.classList.add('treme');
        setTimeout(function () {
          wrap.classList.remove('treme');
          seq = seq.slice(0, Math.max(0, res.primeiroErrado));
          pintar(); opts.onMudar();
        }, 500);
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  }
  TIPOS.ordenar = function (d, opts) { return sequencia(d, opts, 'ordem'); };
  TIPOS.frase = function (d, opts) { return sequencia(d, opts, 'frase'); };
  PONTUAR.ordenar = PONTUAR.frase = function (d, valor) {
    var itens = d.itens || d.blocos;
    var aceitas = [itens.map(function (_, i) { return i; })].concat(d.aceitas || []);
    return aceitas.some(function (a) { return JSON.stringify(a) === JSON.stringify(valor); }) ? 1 : 0;
  };
})();
