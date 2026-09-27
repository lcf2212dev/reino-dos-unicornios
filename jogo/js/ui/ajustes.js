/* Ajustes (interruptores) e UI.aplicarAjustes (letras grandes, sem animação). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, painel = R.painel, toqueIgnorado = R.toqueIgnorado;

  /* ---------- ajustes ---------- */
  UI.telaAjustes = function () {
    var pn = painel('ajustes', '⚙️ Ajustes');
    var a = est().ajustes;   // só para desenhar os interruptores ao abrir
    // cada toque lê e grava nos ajustes do estado de AGORA: com a tela aberta, o progresso pode ser
    // recarregado ou mesclado (a aba volta do fundo, outro aparelho) e o objeto de antes fica solto.
    // O valor novo é o contrário do que o interruptor mostra (o que ela viu é o que ela quis mudar)
    function atuais() { return est().ajustes; }
    function ligado(b) { return b.getAttribute('aria-checked') === 'true'; }
    // no 1º segundo depois de abrir, um toque (o dedo ainda batendo no menu) não muda nenhum
    // interruptor: ficava gravado ("Letras grandes" ligava sozinho no tablet)
    var abriuAjustes = performance.now();
    pn.tela.addEventListener('click', function (e) {
      var sw = e.target.closest && e.target.closest('.interruptor');
      if (!sw || !e.isTrusted || !e.detail || performance.now() - abriuAjustes >= 1000) return;
      e.preventDefault(); e.stopImmediatePropagation(); toqueIgnorado(sw);
    }, true);
    function interruptor(chave, rotulo, desc, depois) {
      var b = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(!!a[chave]) }, el('span.interruptor-texto', el('b', rotulo), el('small', desc)), el('span.interruptor-bola'));
      b.addEventListener('click', function () {
        var v = !ligado(b), aj = atuais();
        aj[chave] = v; b.setAttribute('aria-checked', String(v)); P.salvar(); Reino.Som.tocar('toque'); if (depois) depois(v);
      });
      return b;
    }
    var c = pn.conteudo;
    c.appendChild(interruptor('som', '🔔 Sons', 'Sons de acerto, moedas e ovos.'));
    c.appendChild(interruptor('musica', '🎵 Musiquinha', 'Música bem baixinha enquanto joga.', function (v) { Reino.Som.musica(v); }));
    c.appendChild(interruptor('voz', '🗣️ Voz', 'Ler perguntas e falas em voz alta.'));
    c.appendChild(interruptor('animacoes', '✨ Animações', 'Confete, brilhos e água mexendo.', function () { U.emit(EV.MAPA_MUDOU); }));
    c.appendChild(interruptor('surpresa', '❓ Perguntas surpresa', 'De vez em quando, uma pergunta valendo ' + ((Reino.config.surpresa && Reino.config.surpresa.estrelas) || 2) + ' estrelas.'));
    var tam = el('button.interruptor', { type: 'button', role: 'switch', 'aria-checked': String(a.texto > 1) }, el('span.interruptor-texto', el('b', '🔠 Letras grandes'), el('small', 'Deixa os textos maiores.')), el('span.interruptor-bola'));
    tam.addEventListener('click', function () { var v = !ligado(tam); atuais().texto = v ? 1.15 : 1; tam.setAttribute('aria-checked', String(v)); UI.aplicarAjustes(); P.salvar(); });
    c.appendChild(tam);
    var pers = el('button.btn-grande.btn-secundario', { type: 'button' }, '🪞 Meu personagem');
    pers.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.telaAparencia().then(function () { U.emit(EV.MAPA_MUDOU); }); });
    var pais = el('button.btn-grande.btn-secundario', { type: 'button' }, '🔒 Área dos pais');
    pais.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.telaPais(); });
    var trocar = el('button.btn-grande.btn-secundario', { type: 'button' }, '🔄 Trocar jogador');
    trocar.addEventListener('click', function () { UI.fecharTela(pn.tela); UI.trocarJogador(); });
    c.appendChild(el('div.intro-botoes.coluna', pers, trocar, pais));
  };

  UI.aplicarAjustes = function () {
    var a = est().ajustes;
    document.documentElement.style.setProperty('--escala-texto', String(a.texto || 1));
    document.body.classList.toggle('sem-animacao', !a.animacoes);
  };
})();
