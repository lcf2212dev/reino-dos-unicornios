/* Desafio memoria: jogo da memória (sem botão Conferir; termina sozinho ao achar todos os pares).
   Não tem pontuação própria: D.pontuar dá 0 (ele só aparece na missão, que não pontua). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;
  // letras que cabem numa carta do celular (1em por letra): 16 px até 4; em 12 px, 4 colunas até 5, 3 até 8, senão 2
  var LETRAS_MEM = [4, 5, 8];
  // virada em degraus (D9-13): a carta achata em 2 passos, troca de lado e abre de volta (PASSO_MS cada; JS, não CSS,
  // para seguir o relógio do jogo); sem animação troca na hora
  var PASSO_MS = 48, ABERTA_MS = 950;
  function virar(b, aberta) {
    if (b.__virando) clearTimeout(b.__virando);
    b.classList.remove('mem-achata-1', 'mem-achata-2');
    if (!Reino.util.animar()) { b.classList.toggle('virada', aberta); return; }
    // quanto some de cada lado, em px pares (grade de pixel de 2 px): 1/4 e ~2/5 da largura da carta
    var w = b.offsetWidth || 0;
    b.style.setProperty('--mem-corte-1', 2 * Math.round(w / 8) + 'px');
    b.style.setProperty('--mem-corte-2', 2 * Math.round(w * 0.21) + 'px');
    var passos = ['mem-achata-1', 'mem-achata-2', 'troca', 'mem-achata-1', null], k = 0;
    (function passo() {
      b.classList.remove('mem-achata-1', 'mem-achata-2');
      var p = passos[k++];
      if (p === 'troca') { b.classList.toggle('virada', aberta); b.classList.add('mem-achata-2'); }
      else if (p) b.classList.add(p);
      b.__virando = k < passos.length ? setTimeout(passo, PASSO_MS) : null;
    })();
  }

  var montar = function (d, opts) {
    var cartas = [];
    d.pares.forEach(function (p, i) { cartas.push({ par: i, face: p[0], emoji: true }); cartas.push({ par: i, face: p[1] }); });
    cartas = U.embaralhar(cartas, ['memoria', d]);
    var abertas = [], achados = {}, travar = false, completo = false;
    // palavra mais longa das cartas (sem as marcas «»): passou de LETRAS_MEM, a fonte desce (css)
    var maior = Math.max.apply(null, d.pares.map(function (p) {
      return Math.max.apply(null, String(p[1]).replace(/[«»]/g, '').split(/\s+/).map(function (w) { return w.length; }));
    }));
    var grade = el('div.memoria' + (maior > LETRAS_MEM[2] ? '.mem-longa.mem-2col' : maior > LETRAS_MEM[1] ? '.mem-longa.mem-3col' : maior > LETRAS_MEM[0] ? '.mem-longa' : ''));
    var botoes = cartas.map(function (c, idx) {
      var b = el('button.carta-mem', { type: 'button', 'aria-label': 'Carta virada' },
        el('span.mem-verso', '🦄'), el('span.mem-face' + (c.emoji ? '.mem-emoji' : ''), c.face));
      b.addEventListener('click', function () {
        if (travar || achados[c.par] || abertas.indexOf(idx) >= 0) return;
        abertas.push(idx); virar(b, true); b.setAttribute('aria-label', U.semEn(c.face));
        Reino.Som.tocar('toque');
        if (abertas.length === 2) {
          var a = cartas[abertas[0]], z = cartas[abertas[1]];
          if (a.par === z.par) {
            achados[a.par] = true;
            abertas.forEach(function (i) { botoes[i].classList.add('achada'); });
            abertas = [];
            Reino.Som.tocar('estrela');
            if (Object.keys(achados).length === d.pares.length) { completo = true; opts.onMudar(); if (opts.onCompleto) setTimeout(opts.onCompleto, 500); }
          } else {
            // par errado: as duas cartas ficam marcadas (erro parado, ui.md §10.19.2) enquanto abertas
            travar = true;
            abertas.forEach(function (i) { botoes[i].classList.add('item-erro'); });
            setTimeout(function () {
              abertas.forEach(function (i) { botoes[i].classList.remove('item-erro'); virar(botoes[i], false); botoes[i].setAttribute('aria-label', 'Carta virada'); });
              abertas = []; travar = false;
            }, ABERTA_MS);
          }
        }
      });
      grade.appendChild(b);
      return b;
    });
    return {
      el: grade, semConferir: true,
      valor: function () { return completo; },
      pronto: function () { return completo; },
      conferir: function () { return { ok: completo }; },
      // sem Conferir: o erro e o acerto de cada par são marcados na hora do toque (item-erro, achada)
      marcarErro: function () { /* o par errado se marca no toque (item-erro), não no Conferir */ },
      marcarCerto: function () { grade.classList.add('tudo-certo'); },
    };
  };

  // sem pontuar (vale 0) e sempre no fim da missão
  Reino.registrarTipoDesafio('memoria', {
    montar: montar, especial: true, noFim: true,
    // sem pontuar: sem resposta certa (termina sozinho); só as estranhas, que valem 0
    exemplos: { desafio: { id: 'm', tipo: 'memoria', pares: [] }, estranhos: [true, false] },
    validar: function (d, v) { if (!v.naProva) v.checar(d.pares.length >= 3, d.id + ': memória com poucos pares'); },
  });
})();
