/* O botão 🎒 da Mochila no HUD (docs/contratos/itens.md §6, §13), por UI.registrarBotaoHud (ordem 22: entre o álbum e
   os Ajustes). Só aparece quando ela já tem a espada do Bosque ou algum item (Reino.Itens.temMochila()): antes disso
   o HUD fica como sempre foi. Um brilhinho (sem número) quando chegou item desde a última vez que a Mochila abriu
   (só na memória). No celular, se a fileira não couber, ele desce sozinho para a linha de baixo (css/ui-itens.css). */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var novo = false;   // chegou item desde a última vez que a Mochila abriu

  function mostrar() { return !!(Reino.Itens && Reino.Itens.temMochila()); }
  function pintar() {
    var b = U.$('#hud .btn-mochila');
    if (!b) return;
    var ver = mostrar();
    if (b.hidden === ver) b.hidden = !ver;
    if (b.classList.contains('com-novo') !== novo) b.classList.toggle('com-novo', novo);
  }
  function criar() {
    var b = el('button.btn-tela-cheia.btn-mochila', { type: 'button', 'aria-label': 'Mochila', title: 'Mochila', hidden: !mostrar() },
      UI.iconeHud('🎒'), el('span.mochila-brilho', { 'aria-hidden': 'true' }));
    // Enter/Espaço no botão são dele (não chegam ao motor/entrada.js)
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () {
      if (UI.temTela() || !UI.telaMochila) { Reino._ui.toqueIgnorado(b); return; }
      Reino.Som.tocar('toque');
      UI.telaMochila();
    });
    return b;
  }

  U.on(EV.ITENS, function (c) { if (c && c.tipo === 'ganhou') novo = true; });
  // a Mochila abriu: viu o que chegou
  U.on(EV.TELAS, function () { if (novo && document.querySelector('#telas .tela-mochila')) { novo = false; pintar(); } });

  UI.registrarBotaoHud({ id: 'mochila', ordem: 22, criar: criar, pintar: pintar,
    eventos: [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO, EV.ITENS, EV.PROGRESSO] });
})();
