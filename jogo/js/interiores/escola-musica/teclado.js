/* Teclado de uma oitava: tocar livremente e seguir a melodia sem tempo limite. */
(function () {
  var R = window.Reino, M = R.EscolaMusica;
  M.teclado = function () {
    var s = M.sessao('musica-teclado', 'Aula de teclado'), guiada = false, passo = 0, ouvindo = false;
    var botoes = {}, ultima = null;
    var intro = M.el('p', 'musica-intro', 'Toque as teclas brancas e pretas. À direita, os sons ficam mais agudos.');
    s.corpo.appendChild(intro);
    if (R.Progresso.estado().ajustes.som === false) s.corpo.appendChild(M.el('p', 'musica-aviso', 'Som desligado. Ative Sons nos Ajustes.'));
    var controles = M.el('div', 'musica-controles');
    var livre = M.botao('Tocar livremente', function () { modo(false); });
    var aula = M.botao('Aprender melodia', function () { modo(true); });
    controles.appendChild(livre); controles.appendChild(aula); s.corpo.appendChild(controles);
    var recado = M.el('p', 'musica-recado'); s.corpo.appendChild(recado);
    var trilha = M.el('ol', 'musica-trilha'); trilha.setAttribute('aria-label', 'Notas da melodia');
    M.melodia.forEach(function (m) { trilha.appendChild(M.el('li', '', nome(m))); }); s.corpo.appendChild(trilha);
    var teclado = M.el('div', 'musica-teclado'); teclado.setAttribute('role', 'group'); teclado.setAttribute('aria-label', 'Teclado de Dó a Dó agudo');
    M.notas.forEach(function (n) {
      var b = M.botao(n.midi === 72 ? 'Dó↑' : (n.curta || n.nome), function () { tocar(n.midi); }, 'musica-tecla ' + (n.preta ? 'musica-preta' : 'musica-branca'));
      b.setAttribute('aria-label', n.nome); b.style.setProperty('--pos', n.preta || n.branca);
      botoes[n.midi] = b; teclado.appendChild(b);
    });
    s.corpo.appendChild(teclado);
    var tocada = M.el('p', 'musica-tocada', 'Sua nota aparece aqui.'); s.corpo.appendChild(tocada);
    var rodape = M.el('div', 'musica-controles');
    var exemplo = M.botao('Ouvir a melodia', function () {
      ouvindo = true; atualizar(); recado.textContent = 'Ouça e acompanhe as teclas iluminadas.';
      s.exemplo(M.melodia.map(function (m, i) { return [m, i * 0.65, 0.48]; }), destacar, function () { ouvindo = false; apagar(); atualizar(); });
    });
    rodape.appendChild(exemplo);
    rodape.appendChild(M.botao('Recomeçar', function () { modo(guiada); }));
    rodape.appendChild(M.botao('Ouvir instrução', function () { ouvindo = false; apagar(); atualizar(); s.falar(guiada ? M.falas.guiada : M.falas.teclado); }));
    rodape.appendChild(M.botao('Escolher aula', function () { s.ir(M.menu); })); s.corpo.appendChild(rodape);
    s.corpo.appendChild(M.el('p', 'musica-dica', 'Toque ou clique. No teclado do computador, use Tab para escolher e Enter ou Espaço para tocar. Esc fecha a aula.'));
    function nome(m) { return M.notas.filter(function (n) { return n.midi === m; })[0].nome; }
    function apagar() { if (ultima) ultima.classList.remove('musica-soando'); ultima = null; }
    function destacar(m) { apagar(); ultima = botoes[m]; ultima.classList.add('musica-soando'); tocada.textContent = 'Você ouve: ' + nome(m); }
    function atualizar() {
      livre.setAttribute('aria-pressed', String(!guiada)); aula.setAttribute('aria-pressed', String(guiada));
      trilha.hidden = !guiada;
      Array.prototype.forEach.call(trilha.children, function (e, i) { e.classList.toggle('musica-feita', i < passo); e.classList.toggle('musica-proxima', i === passo); });
      Object.keys(botoes).forEach(function (m) { botoes[m].classList.toggle('musica-alvo', guiada && +m === M.melodia[passo]); });
      exemplo.disabled = ouvindo;
      recado.textContent = guiada ? (passo === M.melodia.length ? 'Você tocou a melodia toda! Pode recomeçar ou inventar sua música.' : 'Nota ' + (passo + 1) + ' de ' + M.melodia.length + ': toque ' + nome(M.melodia[passo]) + '.') : 'Modo livre: invente sua música!';
    }
    function modo(valor) { s.parar(); ouvindo = false; guiada = valor; passo = 0; apagar(); tocada.textContent = 'Sua nota aparece aqui.'; atualizar(); }
    function tocar(m) {
      if (ouvindo) { s.parar(); ouvindo = false; }
      s.nota(m, { duracao: 0.5, volume: 0.18, timbre: 'triangle' }); destacar(m);
      if (guiada && passo < M.melodia.length) {
        if (m === M.melodia[passo]) { passo++; atualizar(); }
        else { atualizar(); recado.textContent = 'Você tocou ' + nome(m) + '. Tente ' + nome(M.melodia[passo]) + ', sem pressa.'; }
      } else atualizar();
    }
    modo(false);
  };
})();
