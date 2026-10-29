/* HUD: chips de cima (dinheiro, estrelas, ovos, montaria), ajustes, tela cheia e os botões
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

  UI.registrarBotaoHud({ id: 'ajustes', ordem: 25, criar: function () {
    var b = el('button.btn-tela-cheia.btn-ajustes', { type: 'button', 'aria-label': 'Ajustes', title: 'Ajustes' });
    b.appendChild(PA.paraDOM(PA.iconeMenu('ajustes'), 2, 'hud-icone'));
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaAjustes(); });
    return b;
  } });

  /* ---------- área útil (arte.md §18): o HUD escreve no :root o que ele cobre, em px CSS ----------
     --hud-topo (fim do HUD de cima), --dock-altura (do pé da tela ao topo do dock) e, para quem só conta o
     que cobre a sua coluna (câmera dos interiores, placas), cada bloco de cima: --hud-esq-largura e
     --hud-esq-fundo (chips da esquerda), --hud-dir-largura (da borda direita) e --hud-dir-fundo (cartão
     da montaria e a fileira ⛶ 📷 🖼, no celular embaixo dele). Medido por ResizeObserver, na troca de
     tela/cena, no resize e de 500 em 500 ms (o relógio congelado dos testes não pinta). UI.areaUtil()
     devolve os mesmos números. Ninguém mais mede o HUD ou o dock. */
  var area = { topo: 0, dock: 0, esqLargura: 0, esqFundo: 0, dirLargura: 0, dirFundo: 0 };
  var VARS = { topo: '--hud-topo', dock: '--dock-altura', esqLargura: '--hud-esq-largura', esqFundo: '--hud-esq-fundo',
    dirLargura: '--hud-dir-largura', dirFundo: '--hud-dir-fundo' };
  // caixa sem o transform da animação (o chip do ovo pulsa: a medida tremia 1-2 px), com 2% de folga para o pulso
  function caixaParada(e) {
    var anima = getComputedStyle(e).animationName, pai = e.offsetParent;
    if (!anima || anima === 'none' || !pai) return e.getBoundingClientRect();
    var pr = pai.getBoundingClientRect();
    var left = pr.left + pai.clientLeft + e.offsetLeft, top = pr.top + pai.clientTop + e.offsetTop;
    var w = e.offsetWidth, h = e.offsetHeight, dx = w * 0.02, dy = h * 0.02;
    return { left: left - dx, right: left + w + dx, top: top - dy, bottom: top + h + dy };
  }
  function caixas(sel) {
    return U.$$(sel).map(caixaParada).filter(function (b) { return b.bottom > b.top && b.right > b.left; });
  }
  function medirArea() {
    var hud = U.$('#hud'), vw = window.innerWidth, vh = window.innerHeight;
    var n = { topo: 0, dock: 0, esqLargura: 0, esqFundo: 0, dirLargura: 0, dirFundo: 0 };
    if (hud && !hud.hidden) {
      caixas('#hud .hud-esq > *').forEach(function (b) { n.esqFundo = Math.max(n.esqFundo, b.bottom); n.esqLargura = Math.max(n.esqLargura, b.right); });
      caixas('#hud .hud-dir > .chip-montaria, #hud .hud-botoes > *').forEach(function (b) {
        n.dirFundo = Math.max(n.dirFundo, b.bottom); n.dirLargura = Math.max(n.dirLargura, vw - b.left);
      });
      caixas('#hud > .dock').forEach(function (b) { n.dock = Math.max(n.dock, vh - b.top); });
      n.topo = Math.max(n.esqFundo, n.dirFundo);
    }
    var raiz = document.documentElement.style;
    Object.keys(n).forEach(function (k) {
      var v = Math.max(0, Math.ceil(n[k]));
      if (v === area[k] && raiz.getPropertyValue(VARS[k])) return;
      area[k] = v;
      raiz.setProperty(VARS[k], v + 'px');
    });
  }
  UI.areaUtil = function () { return U.copia(area); };
  UI.medirAreaUtil = medirArea;
  var vigia = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { medirArea(); }) : null;
  window.addEventListener('resize', medirArea);
  [EV.CENA, EV.TELAS].forEach(function (ev) { U.on(ev, medirArea); });
  setInterval(medirArea, 500);

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
    // com uma tela aberta, o HUD fica atrás dela: um Enter num botão dele não empilha outra tela
    hud.addEventListener('click', function (e) { if (UI.temTela()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    pintarBotaoTela();
    pintarRegistrados();
    dinheiro.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaBau(); });
    estrelas.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaLoja(); });
    ovos.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.chocarOvos(P.ovosParaChocar()); });
    montaria.addEventListener('click', function () { Reino.Som.tocar('toque'); UI.telaEstabulo(); });
    UI.atualizarHUD();
    if (vigia) { vigia.disconnect(); [hud, U.$('.hud-esq', hud), U.$('.hud-dir', hud)].forEach(function (e) { vigia.observe(e); }); }
  };

  UI.atualizarHUD = function () {
    var hud = U.$('#hud');
    if (!hud || !hud.firstChild || !est()) return;
    // os chips em linha: ícone ao lado do número, sem quebra (D8A-02, ui-hud.css)
    var saldo = P.saldoRobux(), chipD = U.$('.chip-dinheiro', hud);
    U.preencher(chipD, '💰 ' + U.robuxNumero(saldo));
    chipD.setAttribute('aria-label', 'Baú do Tesouro: ' + U.robux(saldo) + ' para receber');
    chipD.title = U.robux(saldo) + ' para receber';
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
    medirArea();
  };
})();
