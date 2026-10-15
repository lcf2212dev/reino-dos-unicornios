/* Desafios de sequência: ordenar (etapas numa lista numerada) e frase (montar a frase com blocos),
   a mesma implementação (sequencia) com dois estilos. Valor: índices na ordem da resposta. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var doTeclado = _d.doTeclado;

  // ordenar e montar frase: tocar para colocar na sequência
  function sequencia(d, opts, estilo) {
    var itens = d.itens || d.blocos;
    var n = itens.length;
    var seq = opts.valorInicial ? opts.valorInicial.slice() : [];
    // opts.monte: mesma ordem embaralhada ao voltar numa questão da prova
    var monte = opts.monte ? opts.monte.slice() : U.embaralhar(itens.map(function (_, i) { return i; }), ['sequencia', d]);
    while (!opts.monte && n > 2 && monte.every(function (v, i) { return v === i; })) monte = U.embaralhar(monte, ['sequencia', d]);
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
      if (estilo === 'frase' && !seq.length) alvo.appendChild(el('span.frase-vazia', comDica || _d.jaInstrui(d.pergunta) ? 'A frase aparece aqui' : 'Toque nos blocos abaixo para montar a frase'));
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
    // instrução de toque uma vez só (D6-13): sem dica quando há instrucao ou o enunciado já diz "toque…"
    var comDica = !d.instrucao && !_d.jaInstrui(d.pergunta);
    if (estilo === 'frase') {
      wrap.appendChild(alvo);
      // com instrucao (linha logo abaixo da pergunta), a dica de toque não se repete
      if (comDica) wrap.appendChild(el('p.dica-toque', 'Toque num bloco para colocar. Toque de novo para tirar.'));
      wrap.appendChild(pool);
    } else {
      // no ordenar, as opções ficam em cima para caberem na tela do celular
      if (comDica) wrap.appendChild(el('p.dica-toque', 'Toque nas partes na ordem certa. Errou? Toque no item da lista para tirar.'));
      wrap.appendChild(pool);
      wrap.appendChild(alvo);
    }
    pintar();
    var ctrl = {
      el: wrap, ordem: monte,
      valor: function () { return seq.slice(); },
      pronto: function () { return !_d.marcado(wrap) && seq.length === n; },
      conferir: function () {
        // a ordem do livro ou uma das aceitas (como na pontuação)
        if (pontuar(d, seq) === 1) return { ok: true, primeiroErrado: -1 };
        var prim = -1;
        for (var i = 0; i < n; i++) if (seq[i] !== i) { prim = i; break; }
        return { ok: prim < 0, primeiroErrado: prim };
      },
      marcarErro: function (res) {
        // marca da 1ª peça fora do lugar até o fim (as que saem ao apagar)
        var itens = Array.prototype.slice.call(pecasAlvo(), Math.max(0, res.primeiroErrado));
        _d.erroParado(wrap, itens, function () {
          seq = seq.slice(0, Math.max(0, res.primeiroErrado));
          pintar(); opts.onMudar();
        });
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  }
  var pontuar = function (d, valor) {
    var itens = d.itens || d.blocos;
    var aceitas = [itens.map(function (_, i) { return i; })].concat(d.aceitas || []);
    return aceitas.some(function (a) { return JSON.stringify(a) === JSON.stringify(valor); }) ? 1 : 0;
  };

  function textoFrase(d, seq) { return seq.map(function (i) { return (d.itens || d.blocos)[i]; }).join(' '); }
  // na prova: a ordem é embaralhada uma vez (nunca já na ordem certa)
  function prepararProva(d) {
    var m = U.embaralhar((d.blocos || d.itens).map(function (_, i) { return i; }), ['sequencia-prova', d]);
    while (m.every(function (v, i) { return v === i; })) m = U.embaralhar(m, ['sequencia-prova', d]);
    return m;
  }
  function textoCerto(d) { return textoFrase(d, (d.itens || d.blocos).map(function (_, i) { return i; })); }
  // desafios sintéticos do teste de unidade (def.exemplos)
  var EXEMPLOS = { ordenar: { id: 'x', tipo: 'ordenar', itens: ['a', 'b', 'c'], aceitas: [[1, 0, 2]] },
    frase: { id: 'y', tipo: 'frase', blocos: ['Eu', 'gosto', 'de', 'ler'] } };
  [['ordenar', 'itens', 'ordem', 'poucos itens para ordenar'], ['frase', 'blocos', 'frase', 'poucos blocos']].forEach(function (t) {
    var campo = t[1], estilo = t[2], erro = t[3];
    Reino.registrarTipoDesafio(t[0], {
      montar: function (d, opts) { return sequencia(d, opts, estilo); },
      pontuar: pontuar, especial: true, pista: 'pistaEspecial', prepararProva: prepararProva,
      exemplos: { desafio: EXEMPLOS[t[0]], estranhos: [[], [99], [null], [0, 0, 0]],
        certa: function (d) { return d[campo].map(function (_, i) { return i; }); } },
      // lerItens: a narradora lê também os itens (nas provas, que não têm pista)
      falas: function (d, todos, segs) { if (d.lerItens) todos(d[campo]).forEach(function (i) { segs.push(d[campo][i]); }); return segs; },
      textoCerto: textoCerto, textoResposta: textoFrase,
      validar: function (d, v) { v.checar(d[campo].length >= 3, d.id + ': ' + erro); },
    });
  });
})();
