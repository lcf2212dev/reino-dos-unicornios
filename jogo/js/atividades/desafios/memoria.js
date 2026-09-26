/* Desafio memoria: jogo da memória (sem botão Conferir; termina sozinho ao achar todos os pares).
   Não tem pontuação própria: D.pontuar dá 0 (ele só aparece na missão, que não pontua). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, _d = Reino._desafios;

  var montar = function (d, opts) {
    var cartas = [];
    d.pares.forEach(function (p, i) { cartas.push({ par: i, face: p[0], emoji: true }); cartas.push({ par: i, face: p[1] }); });
    cartas = U.embaralhar(cartas);
    var abertas = [], achados = {}, travar = false, completo = false;
    var grade = el('div.memoria');
    var botoes = cartas.map(function (c, idx) {
      var b = el('button.carta-mem', { type: 'button', 'aria-label': 'Carta virada' },
        el('span.mem-verso', '🦄'), el('span.mem-face' + (c.emoji ? '.mem-emoji' : ''), c.face));
      b.addEventListener('click', function () {
        if (travar || achados[c.par] || abertas.indexOf(idx) >= 0) return;
        abertas.push(idx); b.classList.add('virada'); b.setAttribute('aria-label', U.semEn(c.face));
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
            travar = true;
            setTimeout(function () {
              abertas.forEach(function (i) { botoes[i].classList.remove('virada'); botoes[i].setAttribute('aria-label', 'Carta virada'); });
              abertas = []; travar = false;
            }, 950);
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
      marcarErro: function () {},
      marcarCerto: function () {},
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
