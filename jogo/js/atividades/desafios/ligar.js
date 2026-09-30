/* Desafio ligar: tocar num item da esquerda e depois no par dele na direita (valor: { esquerda: direita }). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var fracao = _d.fracao;

  var CORES_LIGAR = ['#ff7eb6', '#7c5cff', '#39c5bb', '#ffb020', '#5fb4ff'];

  var montar = function (d, opts) {
    var n = d.pares.length;
    // d.direita: ordem fixa da coluna da direita (como na folha da prova)
    var direita = d.direita ? d.direita.slice() : U.embaralhar(d.pares.map(function (_, i) { return i; }), ['ligar', d]);
    var liga = opts.valorInicial ? U.copia(opts.valorInicial) : {}; // esquerda -> direita
    var escolhida = null;
    var wrap = el('div.ligar');
    var colE = el('div.ligar-col'), colD = el('div.ligar-col');
    var bE = [], bD = {};
    d.pares.forEach(function (p, i) {
      // p[0].img: desenho de js/arte/icones/ no lugar do texto (o nome não aparece, senão entrega a resposta).
      // Qualquer chave de ICONES serve (ex.: 'doc:rg', 'acao:escovar', 'sentimento:bored'): os desenhos
      // novos são registrados em js/arte/icones/ (window.ICONES['acao:escovar'] = ...), e PA.iconeDesenho os acha.
      // desenho ainda não feito: mostra ❓ em vez de quebrar a questão
      var desenhoImg = p[0].img && PA.iconeDesenho(p[0].img);
      var conteudo = p[0].img
        ? el('span.ligar-img', desenhoImg ? PA.paraDOM(desenhoImg, PA.escalaNitida(64, desenhoImg.width)) : '❓')
        : [p[0].e ? el('span.opcao-emoji', p[0].e) : null, el('span', p[0].t)];
      var b = el('button.ligar-item.ligar-esq' + (p[0].img ? '.com-img' : ''), { type: 'button', 'aria-label': p[0].img ? U.semEn(p[0].alt) : null }, el('span.ligar-marca'), conteudo);
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        // tocar num item da esquerda sempre o escolhe (e desfaz o par antigo dele)
        if (liga[i] !== undefined) { delete liga[i]; }
        escolhida = i;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      bE.push(b); colE.appendChild(b);
    });
    direita.forEach(function (j) {
      var p = d.pares[j];
      var b = el('button.ligar-item.ligar-dir', { type: 'button' }, el('span.ligar-marca'), el('span', p[1].t));
      b.addEventListener('click', function () {
        if (ctrl.travado) return;
        var dono = Object.keys(liga).find(function (k) { return liga[k] === j; });
        if (escolhida === null) {
          if (dono !== undefined) { delete liga[dono]; Reino.Som.tocar('toque'); pintar(); opts.onMudar(); }
          else { avisar(); }
          return;
        }
        if (dono !== undefined) delete liga[dono];
        liga[escolhida] = j;
        // próxima da esquerda ainda sem par
        var prox = null;
        for (var k = 0; k < n; k++) if (liga[k] === undefined) { prox = k; break; }
        escolhida = prox;
        Reino.Som.tocar('selecionar'); pintar(); opts.onMudar();
      });
      bD[j] = b; colD.appendChild(b);
    });
    var dica = el('p.dica-toque', 'Toque em um item da esquerda e depois no par dele na direita.');
    function avisar() { dica.classList.remove('pisca'); void dica.offsetWidth; dica.classList.add('pisca'); }
    wrap.appendChild(dica);
    wrap.appendChild(el('div.ligar-colunas', colE, colD));
    function pintar() {
      bE.forEach(function (b, i) {
        var cor = CORES_LIGAR[i % CORES_LIGAR.length];
        var ligado = liga[i] !== undefined;
        b.classList.toggle('escolhida', escolhida === i);
        b.classList.toggle('ligado', ligado);
        b.style.setProperty('--cor-par', ligado || escolhida === i ? cor : 'transparent');
        b.querySelector('.ligar-marca').textContent = ligado || escolhida === i ? String(i + 1) : '';
      });
      Object.keys(bD).forEach(function (j) {
        var dono = Object.keys(liga).find(function (k) { return liga[k] === +j; });
        var b = bD[j];
        b.classList.toggle('ligado', dono !== undefined);
        b.style.setProperty('--cor-par', dono !== undefined ? CORES_LIGAR[dono % CORES_LIGAR.length] : 'transparent');
        b.querySelector('.ligar-marca').textContent = dono !== undefined ? String(+dono + 1) : '';
      });
    }
    for (var k0 = 0; k0 < n; k0++) if (liga[k0] === undefined) { escolhida = k0; break; }
    pintar();
    var ctrl = {
      el: wrap, ordem: direita,
      valor: function () { return U.copia(liga); },
      pronto: function () { return Object.keys(liga).length === n; },
      conferir: function () {
        var erradas = Object.keys(liga).filter(function (k) { return liga[k] !== +k; }).map(Number);
        return { ok: erradas.length === 0 && Object.keys(liga).length === n, erradas: erradas };
      },
      marcarErro: function (res) {
        (res.erradas || []).forEach(function (k) {
          // os botões são guardados agora: aos 450 ms o par é apagado e liga[k] some
          var bDir = bD[liga[k]], bEsq = bE[k];
          bDir.classList.add('treme'); bEsq.classList.add('treme');
          setTimeout(function () { bDir.classList.remove('treme'); bEsq.classList.remove('treme'); }, 600);
        });
        setTimeout(function () {
          (res.erradas || []).forEach(function (k) { delete liga[k]; });
          escolhida = (res.erradas || [])[0] != null ? res.erradas[0] : null;
          pintar(); opts.onMudar();
        }, 450);
      },
      marcarCerto: function () { wrap.classList.add('tudo-certo'); },
    };
    return ctrl;
  };
  var pontuar = function (d, valor) { return fracao(d.pares.filter(function (_, i) { return valor[i] === i; }).length, d.pares.length); };

  function textoEsquerda(p, i) { return p[0].t || ((i + 1) + 'º ' + p[0].alt); }
  /* Ligar no celular: as duas colunas lado a lado só cabem em 390 px se a palavra mais comprida da esquerda
     mais a da direita somarem até 24 letras (fonte pixel com 1em por letra; ver css/ui-jogo.css, .ligar-item) */
  function maiorPalavra(t) {
    return Math.max.apply(null, [0].concat(String(t || '').replace(/[«»]/g, '').split(/[\s\-]+/)
      .map(function (w) { return Array.from(w.replace(/[^\p{L}\p{N}]/gu, '')).length; })));
  }

  Reino.registrarTipoDesafio('ligar', {
    montar: montar, pontuar: pontuar, especial: true, pista: 'pistaEspecial',
    exemplos: { desafio: { id: 'x', tipo: 'ligar', pares: [[{ t: 'a' }, { t: '1' }], [{ t: 'b' }, { t: '2' }], [{ t: 'c' }, { t: '3' }]] },
      certa: function (d) { var v = {}; d.pares.forEach(function (_, i) { v[i] = i; }); return v; },
      estranhos: [{}, { 0: 99 }, [], [null]] },
    // lerItens: a narradora lê também os itens (nas provas, que não têm pista)
    falas: function (d, todos, segs) {
      if (!d.lerItens) return segs;
      d.pares.forEach(function (p) { if (p[0].t) segs.push(p[0].t); });
      todos(d.pares).forEach(function (i) { segs.push(d.pares[i][1].t); });
      return segs;
    },
    textoCerto: function (d) { return d.pares.map(function (p, i) { return textoEsquerda(p, i) + ' → ' + p[1].t; }).join(' • '); },
    textoResposta: function (d, valor) { return d.pares.map(function (p, i) { return textoEsquerda(p, i) + ' → ' + (valor[i] != null ? d.pares[valor[i]][1].t : '?'); }).join(' • '); },
    validar: function (d, v) {
      var esq = Math.max.apply(null, [0].concat(d.pares.map(function (p) { return p[0].img ? 0 : maiorPalavra(p[0].t); })));
      var dir = Math.max.apply(null, [0].concat(d.pares.map(function (p) { return maiorPalavra(p[1].t); })));
      if (esq + dir > 24) v.avisar(d.id + ': Ligar com palavras longas (' + esq + ' + ' + dir + ' letras > 24): no celular vai quebrar palavra ou vazar');
      var pares = d.pares.every(function (p) { return (p[0].t || (p[0].img && p[0].alt)) && p[1].t; });
      if (!v.naProva) { v.checar(d.pares.length >= 2 && pares, d.id + ': pares inválidos'); return; }
      v.checar(pares, d.id + ': pares inválidos');
      d.pares.forEach(function (p) { if (p[0].img) v.checar(v.icones[p[0].img], d.id + ': falta o desenho "' + p[0].img + '" em js/arte/icones/'); });
      if (d.direita) v.checar(d.direita.slice().sort().join() === d.pares.map(function (_, i) { return i; }).join(), d.id + ': ordem da direita inválida');
    },
  });
})();
