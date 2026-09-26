/* HUD: chips de cima (dinheiro, estrelas, ovos, montaria), dock do menu, tela cheia e o botão
   das fotos (Reino.Fotos). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, iconePequeno = R.iconePequeno, barrasCuidado = R.barrasCuidado, rotularMontaria = R.rotularMontaria;
  var cuidadosProntos = R.cuidadosProntos, uniChocado = R.uniChocado;

  /* ---------- tela cheia (esconde a barra do claude.ai em volta do jogo) ---------- */
  var ICONE_ABRIR = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICONE_FECHAR = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  UI.telaCheiaDisponivel = function () { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); };
  UI.emTelaCheia = function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); };
  UI.telaCheia = function (ligar) {
    var d = document, raiz = d.documentElement, p = null;
    if (!UI.telaCheiaDisponivel()) return;
    if (ligar === undefined) ligar = !UI.emTelaCheia();
    try {
      if (ligar && !UI.emTelaCheia()) p = raiz.requestFullscreen ? raiz.requestFullscreen({ navigationUI: 'hide' }) : raiz.webkitRequestFullscreen();
      else if (!ligar && UI.emTelaCheia()) p = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen();
    } catch (e) { p = null; }
    if (p && p.catch) p.catch(function () {});
  };
  function pintarBotaoTela() {
    var b = U.$('.btn-tela-cheia');
    if (!b) return;
    var cheia = UI.emTelaCheia();
    b.textContent = '';
    b.appendChild(PA.iconeEmoji(cheia ? '↙' : '↗', 2));
    b.setAttribute('aria-label', cheia ? 'Sair da tela cheia' : 'Tela cheia');
    b.title = cheia ? 'Sair da tela cheia' : 'Tela cheia';
  }
  document.addEventListener('fullscreenchange', pintarBotaoTela);
  document.addEventListener('webkitfullscreenchange', pintarBotaoTela);

  /* ---------- botão das fotos (Reino.Fotos, js/sistemas/fotos.js) ---------- */
  // toque → tira a foto; toque longo (config.fotos.toqueLongoMs) → abre o álbum, sem tirar a foto.
  // Apagado (aria-disabled) quando Fotos.podeTirar() diz não: transição, tela aberta, balão, banho.
  function fotos() { var F = Reino.Fotos; return F && typeof F.tirar === 'function' ? F : null; }
  function podeFotografar() {
    var F = fotos();
    try { return !!(F && (typeof F.podeTirar !== 'function' || F.podeTirar())); } catch (e) { return false; }
  }
  function pintarBotaoFoto() {
    var b = U.$('#hud .btn-foto');
    if (!b) return;
    b.hidden = !fotos();
    var pode = podeFotografar();
    if (b.classList.contains('desligado') === !pode) return;
    b.classList.toggle('desligado', !pode);
    b.setAttribute('aria-disabled', String(!pode));
  }
  UI.pintarBotaoFoto = pintarBotaoFoto;
  [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO].forEach(function (ev) { U.on(ev, function () { pintarBotaoFoto(); }); });
  // balão de diálogo não tem evento: confere de vez em quando (só mexe no DOM quando muda)
  setInterval(pintarBotaoFoto, 500);
  function botaoFoto() {
    var b = el('button.btn-tela-cheia.btn-foto', { type: 'button', 'aria-label': 'Tirar foto', 'aria-disabled': 'false', title: 'Tirar foto (segure para ver o álbum)' });
    b.appendChild(PA.iconeEmoji('📷', 2));
    var timer = null, longoEm = -1e9;
    function soltar() { if (timer) { clearTimeout(timer); timer = null; } }
    b.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      soltar(); longoEm = -1e9;   // toque novo: o click dele vale
      var ms = (Reino.config.fotos && Reino.config.fotos.toqueLongoMs) || 600;
      timer = setTimeout(function () {
        timer = null;
        var F = fotos();
        if (!F || UI.temTela() || !podeFotografar() || typeof F.abrirAlbum !== 'function') return;
        longoEm = performance.now();   // o click que vem ao soltar o dedo não tira a foto
        // nem fecha o álbum que acabou de abrir embaixo do dedo (o dedo ainda está na tela)
        UI.segurarToques();
        Reino.Som.tocar('toque');
        F.abrirAlbum();
      }, ms);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, soltar); });
    // Enter/Espaço no botão são dele: não chegam ao motor/entrada.js (que agiria no que estiver perto dela)
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    // toque longo no celular abriria o menu do navegador
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) {
      // (só o do dedo/mouse, logo depois: o álbum cobre o botão e às vezes esse click nem chega)
      if (e.detail && performance.now() - longoEm < 2000) { longoEm = -1e9; e.preventDefault(); return; }
      soltar();
      var F = fotos();
      pintarBotaoFoto();
      if (!F || !podeFotografar()) return;
      F.tirar();
    });
    return b;
  }

  /* ---------- HUD ---------- */
  UI.montarHUD = function () {
    var hud = U.$('#hud');
    hud.innerHTML = '';
    var dinheiro = el('button.chip.chip-dinheiro', { type: 'button', 'aria-label': 'Baú do Tesouro' });
    var estrelas = el('button.chip.chip-estrelas', { type: 'button', 'aria-label': 'Loja das Fadas' });
    var ovos = el('button.chip.chip-ovos', { type: 'button', hidden: true });
    var montaria = el('button.chip-montaria', { type: 'button', 'aria-label': 'Estábulo' });
    var telaCheia = el('button.btn-tela-cheia', { type: 'button', hidden: !UI.telaCheiaDisponivel() });
    telaCheia.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaCheia(); });
    // tela cheia e câmera juntos (no celular, um embaixo do outro, ao lado do chip da montaria)
    var foto = botaoFoto();
    hud.appendChild(el('div.hud-topo', el('div.hud-esq', dinheiro, estrelas, ovos), el('div.hud-dir', el('div.hud-botoes', telaCheia, foto), montaria)));
    function botaoDock(acao, icone, linhas, aria) {
      var rot = el('small.dock-rotulo');
      linhas.forEach(function (l, i) {
        if (i) rot.appendChild(el('br'));
        rot.appendChild(document.createTextNode(l));
      });
      return el('button.dock-btn', { type: 'button', 'data-acao': acao, 'aria-label': aria },
        PA.paraDOM(PA.iconeMenu(icone), PA.escalaNitida(36, 16), 'dock-icone'), rot);
    }
    var dock = el('nav.dock', { 'aria-label': 'Menu' },
      botaoDock('missoes', 'lugares', ['Lugares'], 'Lugares'),
      botaoDock('estabulo', 'estabulo', ['Estábulo'], 'Estábulo'),
      botaoDock('plano', 'plano', ['Plano', 'da Prova'], 'Plano da Prova'),
      botaoDock('ajustes', 'ajustes', ['Ajustes'], 'Ajustes'));
    hud.appendChild(dock);
    // com uma tela aberta, o HUD fica atrás dela: um Enter num botão dele não empilha outra tela
    hud.addEventListener('click', function (e) { if (UI.temTela()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    pintarBotaoTela();
    pintarBotaoFoto();
    dinheiro.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaBau(); });
    estrelas.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaLoja(); });
    ovos.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.chocarOvos(P.ovosParaChocar()); });
    montaria.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaEstabulo(); });
    dock.addEventListener('click', function (e) {
      var b = e.target.closest('.dock-btn'); if (!b) return;
      Reino.Som.tocar('toque');
      var a = b.getAttribute('data-acao');
      if (a === 'missoes') UI.telaLugares();
      if (a === 'estabulo') UI.telaEstabulo();
      if (a === 'plano') UI.telaPlano();
      if (a === 'ajustes') UI.telaAjustes();
    });
    UI.atualizarHUD();
  };

  UI.atualizarHUD = function () {
    var hud = U.$('#hud');
    if (!hud || !hud.firstChild || !est()) return;
    U.$('.chip-dinheiro', hud).innerHTML = '';
    U.$('.chip-dinheiro', hud).appendChild(el('span', '💰 ' + U.reais(P.dinheiroTotal())));
    U.preencher(U.$('.chip-estrelas', hud), '⭐ ' + P.estrelas());
    var ovos = P.ovosParaChocar();
    var cOvos = U.$('.chip-ovos', hud);
    cOvos.hidden = !ovos.length;
    U.preencher(cOvos, '🥚 ' + ovos.length + (ovos.length === 1 ? ' ovo!' : ' ovos!'));
    var m = U.$('.chip-montaria', hud);
    m.innerHTML = '';
    var id = P.montaria(), u = est().unis[id];
    var pe = Reino.Unicornios.progressoEstagio(u ? u.xp : 0);
    m.appendChild(UI.spriteMontaria(id, 2));
    rotularMontaria();
    // o ícone do estágio fica ao lado do nome do estágio e da barrinha de crescimento; assim
    // a linha da fome e da sede cabe embaixo sem o chip crescer
    var estg = Reino.Unicornios.ESTAGIOS[pe.estagio];
    var comCuidados = cuidadosProntos() && uniChocado(id);
    // com fome e sede, o celular arruma o chip em outra grade (ui-petshop.css): nome em cima, na largura toda
    m.classList.toggle('com-cuidados', comCuidados);
    m.appendChild(el('span.montaria-info',
      el('b', P.nomeUni(id)),
      el('span.montaria-cresce',
        iconePequeno(estg.emoji, 22),
        el('span.montaria-cresce-col',
          el('span.montaria-estagio', estg.nome),
          el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } })))),
      comCuidados ? barrasCuidado(id, 'mini') : null));
  };
})();
