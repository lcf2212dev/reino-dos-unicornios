/* Detetive dos Sons: comparar altura, duração e intensidade, com pista visual e tentativa livre. */
(function () {
  var M = window.Reino.EscolaMusica, J = M.Jogos;
  M.jogoOuvido = function () {
    var s = J.base('musica-ouvido', 'Detetive dos Sons'), rodada = 0, acertou = false;
    s.corpo.appendChild(M.el('p', 'mj-texto', 'Compare os sons 1 e 2. Escolha sua resposta sem pressa. Pode ouvir e tentar quantas vezes quiser.'));
    var etapa = M.el('p', 'mj-etapa'), pergunta = M.el('h3', 'mj-pergunta'), pista = M.el('p', 'mj-pista'), recado = M.el('p', 'mj-recado');
    s.corpo.appendChild(etapa); s.corpo.appendChild(pergunta);
    var sons = M.el('div', 'mj-sons'); s.corpo.appendChild(sons);
    var ouvir = [0, 1].map(function (i) { return J.botao(sons, 'Ouvir som ' + (i + 1), function () { tocar(i); }, 'btn-pequeno mj-som'); });
    s.corpo.appendChild(pista);
    var respostas = J.linha(s.corpo);
    [0, 1].forEach(function (i) { J.botao(respostas, 'É o som ' + (i + 1), function () { responder(i); }, 'btn-pequeno mj-resposta'); });
    s.corpo.appendChild(recado);
    var controles = J.linha(s.corpo);
    J.botao(controles, 'Ouvir os dois', function () { tocar(); });
    J.botao(controles, 'Mostrar pista', function () { pista.hidden = false; });
    J.botao(controles, 'Ouvir instrução', function () { limparLuz(); s.falar(J.falas.ouvido); });
    var proximo = J.botao(s.corpo, 'Próxima descoberta', function () {
      if (!acertou) return;
      if (++rodada < J.ouvidos.length) { iniciar(); J.focar(s, ouvir[0], pergunta); }
      else J.fim(s, 'Você comparou sons graves, agudos, longos, curtos, fortes e suaves. Que ouvido curioso!', M.jogoOuvido);
    }); J.voltar(s);
    function limparLuz() { ouvir.forEach(function (b) { b.classList.remove('mj-soando'); }); }
    function iniciar() {
      s.parar(); limparLuz(); acertou = false; proximo.hidden = true;
      Array.prototype.forEach.call(respostas.children, function (b) { b.disabled = false; });
      var d = J.ouvidos[rodada];
      etapa.textContent = 'Descoberta ' + (rodada + 1) + ' de ' + J.ouvidos.length + ' · ' + d.tema;
      pergunta.textContent = d.pergunta;
      pista.textContent = 'Som 1: ' + d.dica[0] + '. Som 2: ' + d.dica[1] + '.'; pista.hidden = !J.semSom();
      recado.textContent = 'Ouça os dois sons e escolha sua resposta.';
    }
    function tocar(qual) {
      s.parar(); limparLuz();
      var indices = qual === undefined ? [0, 1] : [qual], d = J.ouvidos[rodada];
      indices.forEach(function (i, ordem) {
        s.depois(function () {
          limparLuz(); ouvir[i].classList.add('mj-soando'); recado.textContent = 'Agora: som ' + (i + 1) + '.';
          var n = d.sons[i]; s.nota(n[0], { duracao: n[1], volume: n[2], timbre: 'triangle' });
        }, ordem * 1800);
      });
      s.depois(function () { limparLuz(); recado.textContent = acertou ? d.explicacao : 'Qual é sua resposta? Pode ouvir outra vez.'; }, (indices.length - 1) * 1800 + 1400);
    }
    function responder(i) {
      if (acertou) return;
      s.parar(); limparLuz();
      var d = J.ouvidos[rodada];
      if (i === d.certa) {
        acertou = true; recado.textContent = 'Isso! ' + d.explicacao;
        Array.prototype.forEach.call(respostas.children, function (b) { b.disabled = true; });
        proximo.hidden = false; J.focar(s, proximo);
      } else recado.textContent = 'Vamos ouvir mais uma vez? Compare os dois sons. A pista também pode ajudar.';
    }
    iniciar();
  };
})();
