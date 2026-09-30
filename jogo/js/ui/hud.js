/* HUD: chips de cima (dinheiro, estrelas, ovos, montaria), dock do menu, tela cheia e os botões
   registrados por UI.registrarBotaoHud (📷 e álbum em ui/hud-fotos.js). */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI, R = Reino._ui;
  var est = R.est, iconePequeno = R.iconePequeno, barrasCuidado = R.barrasCuidado, rotularMontaria = R.rotularMontaria;
  var cuidadosProntos = R.cuidadosProntos, uniChocado = R.uniChocado;

  /* ---------- tela cheia (o navegador some; no app instalado já é tela cheia: sem botão) ---------- */
  function instalado() {
    try { return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches); } catch (e) { return false; }
  }
  UI.telaCheiaDisponivel = function () { return !instalado() && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); };
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
  // ícone dos botões do canto: 32 px nítidos nos 3 tamanhos (o mesmo do álbum)
  UI.iconeHud = function (emoji) {
    var c = PA.iconeEmoji(emoji, 2), lado = c.width * PA.escalaNitida(32, c.width);
    c.style.width = lado + 'px';
    c.style.height = (c.height * lado / c.width) + 'px';
    return c;
  };
  function pintarBotaoTela() {
    var b = U.$('.btn-tela-cheia');
    if (!b) return;
    var cheia = UI.emTelaCheia();
    b.textContent = '';
    b.appendChild(UI.iconeHud(cheia ? 'tela-cheia:sair' : 'tela-cheia:abrir'));
    b.setAttribute('aria-label', cheia ? 'Sair da tela cheia' : 'Tela cheia');
    b.title = cheia ? 'Sair da tela cheia' : 'Tela cheia';
  }
  document.addEventListener('fullscreenchange', pintarBotaoTela);
  document.addEventListener('webkitfullscreenchange', pintarBotaoTela);

  /* ---------- botões registrados (ao lado da tela cheia) ---------- */
  // UI.registrarBotaoHud({ id, ordem, criar() → botão, pintar?(), eventos?: [EV…] }): montarHUD põe os botões
  // pela ordem; pintar roda na montagem, nos eventos e de 500 em 500 ms (balão não tem evento).
  var botoesHud = [], EVENTOS_BASE = [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO], ouvidos = {};
  function pintarRegistrados(ev) {
    botoesHud.forEach(function (d) {
      if (!d.pintar || (ev && !(d.eventos || EVENTOS_BASE).includes(ev))) return;
      d.pintar();
    });
  }
  function ouvir(ev) {
    if (ouvidos[ev]) return;
    ouvidos[ev] = true;
    U.on(ev, function () { pintarRegistrados(ev); });
  }
  EVENTOS_BASE.forEach(ouvir);
  setInterval(function () { pintarRegistrados(); }, 500);
  UI.registrarBotaoHud = function (def) {
    if (!def || !def.id || typeof def.criar !== 'function') throw new Error('registrarBotaoHud: precisa de id e criar()');
    botoesHud = botoesHud.filter(function (d) { return d.id !== def.id; });
    botoesHud.push(def);
    botoesHud.sort(function (x, y) { return (x.ordem || 0) - (y.ordem || 0); });
    (def.eventos || []).forEach(ouvir);
  };

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
    // tela cheia e os registrados (câmera, álbum…) juntos (no celular, um embaixo do outro, ao lado do chip da montaria)
    var botoes = el('div.hud-botoes', telaCheia);
    botoesHud.forEach(function (d) { botoes.appendChild(d.criar()); });
    hud.appendChild(el('div.hud-topo', el('div.hud-esq', dinheiro, estrelas, ovos), el('div.hud-dir', botoes, montaria)));
    function botaoDock(acao, icone, linhas, aria) {
      var rot = el('small.dock-rotulo');
      linhas.forEach(function (l, i) {
        if (i) rot.appendChild(el('br'));
        rot.appendChild(document.createTextNode(l));
      });
      return el('button.dock-btn', { type: 'button', 'data-acao': acao, 'aria-label': aria },
        PA.paraDOM(PA.iconeMenu(icone), PA.escalaNitida(32, 16), 'dock-icone'), rot);
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
    pintarRegistrados();
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
    // os chips em linha: ícone ao lado do número, sem quebra (D8A-02, ui-hud.css)
    U.preencher(U.$('.chip-dinheiro', hud), '💰 ' + U.reais(P.dinheiroTotal()));
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
        iconePequeno(estg.emoji, 32),
        el('span.montaria-cresce-col',
          el('span.montaria-estagio', estg.nome),
          // 🌱 antes da barra de crescimento, como na carta do Estábulo (D8A-14)
          el('span.carta-cresce', iconePequeno('🌱', 16),
            el('span.barrinha', el('span', { style: { width: Math.round(pe.pct * 100) + '%' } }))))),
      comCuidados ? barrasCuidado(id, 'mini') : null));
  };
})();
