/* Ritmo em Peças: quatro tempos editáveis por clique, sem arrastar e sem medir rapidez. */
(function () {
  var M = window.Reino.EscolaMusica, J = M.Jogos;
  M.jogoRitmo = function () {
    var s = J.base('musica-ritmo', 'Ritmo em Peças'), rodada = 0, blocos = [], acertou = false;
    s.corpo.appendChild(M.el('p', 'mj-texto', 'Monte o ritmo do desafio. Cada bloco é um tempo. Toque para trocar: Tá, Tá-tá, Pausa.'));
    s.corpo.appendChild(M.el('p', 'mj-texto', 'Tá: um som. Tá-tá: dois sons curtos. Pausa: um tempo de silêncio.'));
    var etapa = M.el('p', 'mj-etapa'), pista = M.el('p', 'mj-pista'), recado = M.el('p', 'mj-recado');
    s.corpo.appendChild(etapa); s.corpo.appendChild(pista);
    var grade = M.el('div', 'mj-grade-ritmo'); s.corpo.appendChild(grade);
    var botoes = [0, 1, 2, 3].map(function (i) { return J.botao(grade, '', function () {
      s.parar(); limparLuz(); blocos[i] = J.blocos[(J.blocos.indexOf(blocos[i]) + 1) % J.blocos.length];
      acertou = false; proximo.hidden = true; pintar(); recado.textContent = 'Tempo ' + (i + 1) + ': ' + J.rotulos[blocos[i]] + '. Ouça sua criação ou confira.';
    }, 'mj-bloco'); });
    s.corpo.appendChild(recado);
    var controles = J.linha(s.corpo);
    J.botao(controles, 'Ouvir desafio', function () { tocar(J.ritmos[rodada], 'Desafio'); });
    J.botao(controles, 'Ouvir meu ritmo', function () { tocar(blocos.slice(), 'Seu ritmo'); });
    J.botao(controles, 'Mostrar pista', function () { pista.hidden = false; });
    J.botao(controles, 'Conferir ritmo', conferir);
    J.botao(controles, 'Limpar blocos', function () { iniciar(); });
    J.botao(controles, 'Ouvir instrução', function () { limparLuz(); s.falar(J.falas.ritmo); });
    var proximo = J.botao(s.corpo, 'Próximo ritmo', function () {
      if (!acertou) return;
      if (++rodada < J.ritmos.length) { iniciar(); J.focar(s, botoes[0]); }
      else J.fim(s, 'Você montou quatro ritmos usando sons e silêncios. Agora pode brincar de novo e inventar outras combinações!', M.jogoRitmo);
    }); J.voltar(s);
    function limparLuz() { botoes.forEach(function (b) { b.classList.remove('mj-soando'); }); }
    function pintar() {
      botoes.forEach(function (b, i) {
        b.replaceChildren(M.el('span', 'mj-numero', 'Tempo ' + (i + 1)), M.el('span', '', J.rotulos[blocos[i]]));
        b.setAttribute('aria-label', 'Tempo ' + (i + 1) + ': ' + J.rotulos[blocos[i]] + '. Toque para mudar.');
      });
    }
    function iniciar() {
      s.parar(); limparLuz(); blocos = ['ta', 'ta', 'ta', 'ta']; acertou = false; proximo.hidden = true;
      etapa.textContent = 'Ritmo ' + (rodada + 1) + ' de ' + J.ritmos.length;
      pista.textContent = 'Desafio: ' + J.ritmos[rodada].map(function (b) { return J.rotulos[b]; }).join(' | '); pista.hidden = !J.semSom();
      recado.textContent = 'Ouça o desafio e monte a mesma sequência nos quatro blocos.'; pintar();
    }
    function tocar(sequencia, nome) {
      limparLuz();
      J.tocarRitmo(s, sequencia, function (i, b) {
        limparLuz(); botoes[i].classList.add('mj-soando');
        recado.textContent = nome + ' · tempo ' + (i + 1) + ': ' + (b === 'pausa' ? 'silêncio' : J.rotulos[b]);
      }, function () { limparLuz(); recado.textContent = nome + ' terminou. Pode ouvir de novo ou continuar montando.'; });
    }
    function conferir() {
      s.parar(); limparLuz();
      if (J.igual(blocos, J.ritmos[rodada])) {
        acertou = true; recado.textContent = 'Isso! Seu ritmo ficou igual ao desafio.'; proximo.hidden = false; J.focar(s, proximo);
      } else {
        var diferente = blocos.findIndex(function (b, i) { return b !== J.ritmos[rodada][i]; });
        recado.textContent = 'Vamos ajustar o tempo ' + (diferente + 1) + '? Ouça de novo ou veja a pista. Os outros blocos ficam como estão.';
      }
    }
    iniciar();
  };
})();
