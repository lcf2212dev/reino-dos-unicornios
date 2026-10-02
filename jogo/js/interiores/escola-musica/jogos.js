/* Hub dos três minijogos e peças compartilhadas, criadas somente ao abrir uma tela. */
(function () {
  var R = window.Reino, M = R.EscolaMusica, J = M.Jogos;
  J.semSom = function () { return R.Progresso.estado().ajustes.som === false; };
  J.base = function (id, titulo) {
    var s = M.sessao(id, titulo); s.painel.card.classList.add('musica-jogo');
    if (J.semSom()) s.corpo.appendChild(M.el('p', 'mj-aviso', 'Som desligado. As pistas visuais ajudam a jogar. Ative Sons nos Ajustes para ouvir.'));
    return s;
  };
  J.linha = function (pai) { var e = M.el('div', 'mj-controles'); pai.appendChild(e); return e; };
  J.botao = function (pai, texto, fn, classe) { var b = M.botao(texto, fn, classe || 'btn-pequeno mj-botao'); pai.appendChild(b); return b; };
  J.focar = function (s, alvo, titulo) { R.UI.focarTroca(alvo, titulo || s.painel.card.querySelector('h2'), 400); };
  J.voltar = function (s) { J.botao(s.corpo, 'Escolher outro jogo', function () { s.ir(M.jogos); }); };
  J.fim = function (s, texto, recomecar) {
    s.parar(); s.corpo.replaceChildren();
    var titulo = M.el('h3', '', 'Desafio completo!'); titulo.tabIndex = -1; s.corpo.appendChild(titulo);
    s.corpo.appendChild(M.el('p', 'mj-texto', texto));
    var rejogar = J.botao(s.corpo, 'Jogar de novo', function () { s.ir(recomecar); });
    J.botao(s.corpo, 'Ouvir parabéns', function () { s.falar(J.falas.fim); }); J.voltar(s); J.focar(s, rejogar, titulo);
  };
  J.tocarRitmo = function (s, blocos, aoTempo, aoFim) {
    s.parar();
    J.notasDoRitmo(blocos).forEach(function (n) { s.depois(function () { s.nota(n[0], { duracao: n[2], volume: 0.18, timbre: 'triangle' }); }, n[1] * 1000); });
    blocos.forEach(function (b, i) { s.depois(function () { aoTempo(i, b); }, i * 700); });
    s.depois(aoFim, blocos.length * 700);
  };
  M.jogos = function () {
    var s = J.base('musica-jogos', 'Jogos de música');
    s.corpo.appendChild(M.el('p', 'mj-texto', 'Ouça, invente e descubra! Aqui você joga no seu tempo e pode tentar de novo.'));
    var grade = M.el('div', 'mj-hub'); s.corpo.appendChild(grade);
    [['Eco Musical', 'Repita melodias cada vez maiores.', M.jogoEco], ['Ritmo em Peças', 'Monte quatro tempos com sons e pausas.', M.jogoRitmo], ['Detetive dos Sons', 'Descubra o que muda entre dois sons.', M.jogoOuvido]].forEach(function (j) {
      var b = J.botao(grade, '', function () { s.ir(j[2]); }, 'mj-cartao');
      b.appendChild(M.el('strong', '', j[0])); b.appendChild(M.el('span', '', j[1]));
    });
    J.botao(s.corpo, 'Ouvir o convite', function () { s.falar(J.falas.convite); });
    J.botao(s.corpo, 'Voltar à escola', function () { s.ir(M.menu); });
  };
  if (R.NPCs && R.NPCs.registrarTela) {
    [['musica-jogos', 'jogos'], ['musica-eco', 'jogoEco'], ['musica-ritmo', 'jogoRitmo'], ['musica-ouvido', 'jogoOuvido']].forEach(function (p) {
      R.NPCs.registrarTela(p[0], function () { M[p[1]](); });
    });
  }
})();
