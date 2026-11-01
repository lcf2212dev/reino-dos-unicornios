/* Tempo de celular na tela (sistemas/tempo-celular.js): a linha do prêmio no fim da sala, o quadro do Baú,
   a tela de escolher os minutos e a de mostrar aos pais. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, T = Reino.TempoCelular;
  var painel = Reino._ui.painel;

  function minutos(n) { return n === 1 ? '1 minuto' : n + ' minutos'; }
  function botao(classe, texto) { return el('button.' + classe, { type: 'button' }, texto); }

  /** Fim da sala de 1ª vez: "+5 minutos de celular" na lista de prêmios (se a sala conta). */
  UI.premioTempo = function (itens, salaId) {
    var n = T.daSala(salaId);
    if (n > 0) itens.appendChild(el('li.premio-tempo', el('span.premio-icone', '⏳'), el('span', el('b', '+' + minutos(n) + ' de celular!'), ' Guardados no Baú.')));
  };

  /** O quadro do Baú. `aoUsar` é chamado depois de usar (para redesenhar o Baú). */
  UI.quadroTempoCelular = function (aoUsar) {
    var saldo = T.saldo(), por = (Reino.config.tempoCelular || {}).minutosPorSala || 5;
    var usar = null;
    if (saldo > 0) {
      usar = botao('btn-grande.btn-principal', 'Usar tempo');
      usar.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaUsarTempo(aoUsar); });
    }
    return el('div.tempo-quadro',
      el('div.tempo-topo', el('span.bau-moeda', '⏳'), el('div', el('small', 'Tempo de celular'), el('b', U.colado(minutos(saldo))))),
      el('p', 'Cada sala nova vale mais ' + minutos(por) + '!'),
      usar || el('p.tempo-vazio', 'Faça uma sala nova para ganhar tempo!'));
  };

  /** Escolher quantos minutos usar (de passo em passo, até o saldo). */
  UI.telaUsarTempo = function (aoUsar) {
    var pn = painel('tempo', '⏳ Usar tempo', { estreito: true }), c = pn.conteudo;
    var passo = T.passo(), saldo = T.saldo(), n = Math.min(passo, saldo);
    var valor = el('b.tempo-escolha', { 'aria-live': 'polite' });
    var menos = botao('btn-icone.tempo-menos', '-'), mais = botao('btn-icone.tempo-mais', '+'), tudo = botao('btn-pequeno', 'Tudo');
    var ok = botao('btn-grande.btn-principal', '');
    menos.setAttribute('aria-label', 'Menos ' + passo + ' minutos'); mais.setAttribute('aria-label', 'Mais ' + passo + ' minutos');
    function mostrar() {
      valor.textContent = minutos(n);
      ok.textContent = 'Usar ' + minutos(n);
      menos.disabled = n - passo < passo; mais.disabled = n + passo > saldo; tudo.disabled = n === saldo - saldo % passo;
    }
    menos.addEventListener('click', function () { if (n - passo >= passo) { n -= passo; mostrar(); } });
    mais.addEventListener('click', function () { if (n + passo <= saldo) { n += passo; mostrar(); } });
    tudo.addEventListener('click', function () { n = saldo - saldo % passo; mostrar(); });
    ok.addEventListener('click', function () {
      if (!T.usar(n)) return;
      Reino.Som.tocar('toque');
      UI.fecharTela(pn.tela);
      mostrarAosPais(n, aoUsar);
    });
    c.appendChild(el('p', 'Você tem ', el('b', U.colado(minutos(saldo))), '. Quanto quer usar agora?'));
    c.appendChild(el('div.tempo-seletor', menos, valor, mais));
    c.appendChild(el('div.tempo-acoes', tudo, ok));
    mostrar();
    // ui.md §4.1/§8.1: o foco vai num botão seguro (nunca no que gasta), e só pelo teclado
    var seguro = [mais, menos, tudo].filter(function (b) { return !b.disabled; })[0];
    if (seguro && UI.porTeclado()) UI.focarTeclado(seguro, 400);
  };

  // a tela grande para mostrar ao papai ou à mamãe
  function mostrarAosPais(n, aoUsar) {
    var pn = painel('tempo-pais', '⏳ Tempo de celular', { estreito: true, semFechar: true }), c = pn.conteudo;
    var ic = window.PA && PA.iconeEmoji ? PA.iconeEmoji('⏳', 5) : el('span', '⏳');
    ic.classList.add('tempo-icone'); ic.setAttribute('aria-hidden', 'true');
    var sobra = T.saldo(), pronto = botao('btn-grande.btn-principal', 'Pronto');
    pn.card.classList.add('tempo-pais');
    c.appendChild(el('div.tempo-festa', ic,
      el('p.tempo-grande', Reino.Genero.nome() + ' vai usar ', el('b', U.colado(minutos(n))), ' de celular!'),
      el('p', 'Mostre para o papai ou a mamãe 💜'),
      el('p.tempo-sobra', sobra > 0 ? 'Ainda sobram ' + minutos(sobra) + ' guardados no Baú.' : 'O Baú ficou sem tempo. Faça uma sala nova para ganhar mais!'),
      pronto));
    function fechar() { Reino.Som.tocar('toque'); UI.fecharTela(pn.tela); if (aoUsar) aoUsar(); }
    pronto.addEventListener('click', fechar);
    pn.tela._aoEsc = fechar;
    if (UI.porTeclado()) UI.focarTeclado(pronto, 400);
  }
})();
