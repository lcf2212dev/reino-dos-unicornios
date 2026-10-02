/* Fundamentos: cinco experiências curtas, exemplos repetíveis e perguntas sem punição. */
(function () {
  var R = window.Reino, M = R.EscolaMusica;
  M.fundamentos = function () {
    var s = M.sessao('musica-fundamentos', 'Fundamentos musicais'), indice = 0, respondeu = false;
    var nav = M.el('nav', 'musica-controles'); nav.setAttribute('aria-label', 'Assuntos musicais');
    var botoes = M.licoes.map(function (l, i) { var b = M.botao(l.titulo, function () { abrir(i); }); nav.appendChild(b); return b; });
    s.corpo.appendChild(nav);
    if (R.Progresso.estado().ajustes.som === false) s.corpo.appendChild(M.el('p', 'musica-aviso', 'Som desligado. Ative Sons nos Ajustes.'));
    var area = M.el('div', 'musica-licao'); s.corpo.appendChild(area);
    s.corpo.appendChild(M.botao('Escolher aula', function () { s.ir(M.menu); }));
    function abrir(i) {
      s.parar(); indice = i; respondeu = false; area.replaceChildren();
      botoes.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
      var l = M.licoes[indice];
      area.appendChild(M.el('p', 'musica-etapa', 'Descoberta ' + (i + 1) + ' de ' + M.licoes.length));
      var titulo = M.el('h3', '', l.titulo); area.appendChild(titulo);
      area.appendChild(M.el('p', 'musica-intro', l.texto));
      var exemplos = M.el('div', 'musica-controles');
      var tocando = M.el('p', 'musica-tocada', 'Os exemplos podem ser ouvidos quantas vezes você quiser.');
      l.exemplos.forEach(function (e) { exemplos.appendChild(M.botao('Ouvir: ' + e.nome, function () {
        tocando.textContent = e.nome; var batida = 0;
        s.exemplo(e.notas, function () { batida++; tocando.textContent = e.nome + (l.id === 'ritmo' ? ' — som ' + batida : ' — tocando'); }, function () { tocando.textContent = e.nome + ' — terminou. Pode ouvir de novo!'; });
      })); });
      exemplos.appendChild(M.botao('Ouvir instrução', function () { tocando.textContent = 'Vamos ouvir a explicação.'; s.falar(l.fala); }));
      area.appendChild(exemplos); area.appendChild(tocando);
      var pergunta = M.el('fieldset', 'musica-pergunta'); pergunta.appendChild(M.el('legend', '', l.pergunta));
      var resposta = M.el('p', 'musica-recado', 'Escolha uma resposta. Você pode tentar de novo.');
      var respostas = [];
      l.opcoes.forEach(function (o, n) { var b = M.botao(o, function () {
        if (respondeu) return;
        if (n === l.certa) {
          respondeu = true; resposta.textContent = l.explicacao;
          respostas.forEach(function (r) { r.disabled = true; }); continuar.hidden = false; continuar.focus();
        } else resposta.textContent = 'Vamos tentar de novo? ' + l.texto;
      }); respostas.push(b); pergunta.appendChild(b); });
      area.appendChild(pergunta); area.appendChild(resposta);
      var continuar = M.botao(i === M.licoes.length - 1 ? 'Concluir aula' : 'Próxima descoberta', function () {
        if (indice < M.licoes.length - 1) { abrir(indice + 1); area.querySelector('h3').setAttribute('tabindex', '-1'); area.querySelector('h3').focus(); }
        else concluir();
      }); continuar.hidden = true; area.appendChild(continuar);
    }
    function concluir() {
      s.parar(); area.replaceChildren();
      var titulo = M.el('h3', '', 'Você explorou o mundo dos sons!'); titulo.tabIndex = -1; area.appendChild(titulo);
      area.appendChild(M.el('p', 'musica-intro', 'Altura, duração, intensidade, timbre e pulsação ajudam a entender a música. Continue ouvindo e experimentando!'));
      area.appendChild(M.botao('Fazer a aula de novo', function () { abrir(0); }));
      area.appendChild(M.botao('Experimentar o teclado', function () { s.ir(M.teclado); })); titulo.focus();
    }
    abrir(0);
  };
})();
