/* Desafio ligar: tocar num item da esquerda e depois no par dele na direita (valor: { esquerda: direita }). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  var TIPOS = _d.TIPOS, PONTUAR = _d.PONTUAR, fracao = _d.fracao;

  var CORES_LIGAR = ['#ff7eb6', '#7c5cff', '#39c5bb', '#ffb020', '#5fb4ff'];

  TIPOS.ligar = function (d, opts) {
    var n = d.pares.length;
    // d.direita: ordem fixa da coluna da direita (como na folha da prova)
    var direita = d.direita ? d.direita.slice() : U.embaralhar(d.pares.map(function (_, i) { return i; }));
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
        ? el('span.ligar-img', desenhoImg ? PA.paraDOM(desenhoImg, PA.escalaNitida(desenhoImg.width > 16 ? 96 : 64, desenhoImg.width)) : '❓')
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
  PONTUAR.ligar = function (d, valor) { return fracao(d.pares.filter(function (_, i) { return valor[i] === i; }).length, d.pares.length); };
})();
