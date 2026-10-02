/* Eco Musical: memória melódica gradual, sem relógio, com repetição e pista opcional. */
(function () {
  var M = window.Reino.EscolaMusica, J = M.Jogos;
  M.jogoEco = function () {
    var s = J.base('musica-eco', 'Eco Musical'), rodada = 0, passo = 0, ouvindo = false, terminou = false;
    s.corpo.appendChild(M.el('p', 'mj-texto', 'Ouça e veja a sequência. Depois repita nas teclas, na mesma ordem.'));
    var etapa = M.el('p', 'mj-etapa'), recado = M.el('p', 'mj-recado'), pista = M.el('p', 'mj-pista');
    s.corpo.appendChild(etapa); s.corpo.appendChild(recado); s.corpo.appendChild(pista);
    var pads = M.el('div', 'mj-notas'); s.corpo.appendChild(pads);
    var teclas = J.notas.map(function (n) { return J.botao(pads, n.nome, function () { responder(n.midi); }, 'mj-nota'); });
    var controles = J.linha(s.corpo);
    J.botao(controles, 'Ouvir sequência', ouvir);
    J.botao(controles, 'Mostrar pista', function () { pista.hidden = false; });
    J.botao(controles, 'Tentar do início', function () { preparar(); });
    J.botao(controles, 'Ouvir instrução', function () { liberar(); s.falar(J.falas.eco); });
    var proxima = J.botao(s.corpo, 'Próximo eco', function () {
      if (!terminou) return;
      if (++rodada < J.ecos.length) { preparar(); J.focar(s, teclas[0]); }
      else J.fim(s, 'Você repetiu quatro melodias, com até cinco notas! Sua memória musical está em festa.', M.jogoEco);
    });
    J.voltar(s);
    function liberar() { s.parar(); ouvindo = false; teclas.forEach(function (b) { b.disabled = false; b.classList.remove('mj-soando'); }); }
    function preparar() {
      liberar(); passo = 0; terminou = false; proxima.hidden = true;
      etapa.textContent = 'Eco ' + (rodada + 1) + ' de ' + J.ecos.length + ' · ' + J.ecos[rodada].length + ' notas';
      pista.textContent = 'Pista: ' + J.ecos[rodada].map(J.nomeNota).join(' - '); pista.hidden = !J.semSom();
      recado.textContent = 'Toque em Ouvir sequência. Pode ouvir quantas vezes quiser.';
    }
    function ouvir() {
      preparar(); ouvindo = true; teclas.forEach(function (b) { b.disabled = true; });
      var tocadas = 0;
      s.exemplo(J.ecos[rodada].map(function (n, i) { return [n, i * 0.8, 0.5]; }), function (n) {
        tocadas++; recado.textContent = 'Ouça: ' + J.nomeNota(n) + ' · nota ' + tocadas;
        teclas.forEach(function (b, i) { b.classList.toggle('mj-soando', J.notas[i].midi === n); });
      }, function () { liberar(); recado.textContent = 'Sua vez! Toque a primeira nota.'; });
    }
    function responder(n) {
      if (ouvindo || terminou) return;
      s.nota(n, { duracao: 0.45, volume: 0.18 });
      teclas.forEach(function (b, i) { b.classList.toggle('mj-soando', J.notas[i].midi === n); });
      if (n !== J.ecos[rodada][passo]) { recado.textContent = 'Quase! Tente a nota ' + (passo + 1) + ' de novo. A pista pode ajudar.'; return; }
      passo++;
      if (passo === J.ecos[rodada].length) {
        terminou = true; recado.textContent = 'Eco perfeito! Você repetiu toda a sequência.'; proxima.hidden = false; J.focar(s, proxima);
      } else recado.textContent = 'Isso! Agora toque a nota ' + (passo + 1) + ' de ' + J.ecos[rodada].length + '.';
    }
    preparar();
  };
})();
