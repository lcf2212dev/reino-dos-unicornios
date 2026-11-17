/* A poção na luta (docs/contratos/itens.md §9, §13): o botão rápido redondo, fixo embaixo à direita, logo acima do
   botão da espada (ui/bosque-hud.js), em toda arena e só depois da espada (como ela; assim as fotos do e2e, sem espada,
   não mudam). Mostra o ícone da poção (a pequena; só a grande na mochila: a grande) e quantas há na Mochila (as duas
   somadas). Tocar (ou Enter/Espaço com o foco nele) bebe uma: a pequena primeiro (Itens.usar, que cura pela
   BosqueCombate.curar e só gasta se curou), com o som 'gole'. Apagado (aria-disabled, continua focável) com a vida
   cheia, sem poção, com a luta parada (tela, desmaio) e por config.itens.pocaoRecargaMs depois de beber.
   Só na tela, sem voz. Estilos: css/ui-itens-pocao.css. Reino.Itens e Reino.BosqueCombate são lidos na hora. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var EVENTOS = [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO, EV.BOSQUE, EV.PROGRESSO, EV.ITENS];
  var recargaAte = 0, visto = { mostra: null, apagado: null, n: null, icone: null };

  function naArena() { var B = Reino.Bosque; return !!(B && B.naArena && B.naArena()); }
  function temEspada() { var B = Reino.Bosque; return !!(B && B.temEspada && B.temEspada()); }
  /** as poções da Mochila: { pequenas: [uid], grandes: [uid] } (só as da mochila se usam) */
  function pocoes() {
    var r = { pequenas: [], grandes: [] }, It = Reino.Itens;
    if (!It || !It.mochila || !Reino.Progresso.estado()) return r;
    It.mochila().forEach(function (s) {
      if (s.def.tipo !== 'pocao') return;
      Array.prototype.push.apply(s.def.cura === 'grande' ? r.grandes : r.pequenas, s.uids);
    });
    return r;
  }
  function vidaCheia() { var BC = Reino.BosqueCombate, v = BC && BC.vida ? BC.vida() : null; return !v || v.n >= v.max; }
  function parada() { var C = Reino.Cena; return UI.temTela() || !!(C && C.bloqueado && C.bloqueado()) || !!(Reino._bosqueCombate || {}).desmaio; }
  function icone(id) {
    var base = PA.iconeDesenho('item:' + id), c = base ? PA.paraDOM(base, 2, 'icone-px') : PA.iconeEmoji('💖', 2);
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  /** bebe uma poção (a pequena primeiro): true se curou */
  function beber() {
    var p = pocoes(), uid = p.pequenas[0] || p.grandes[0];
    if (!uid || Date.now() < recargaAte || parada() || vidaCheia()) return false;
    var r = Reino.Itens.usar(uid);
    if (!r || !r.ok) return false;
    recargaAte = Date.now() + (Reino.config.itens.pocaoRecargaMs || 0);
    if (Reino.Som) Reino.Som.tocar('gole');
    setTimeout(pintar, (Reino.config.itens.pocaoRecargaMs || 0) + 20);   // acende de novo quando a recarga acaba
    pintar();
    return true;
  }
  function botao() {
    var b = el('button.btn-tela-cheia.btn-itens-pocao', { type: 'button', 'aria-label': 'Beber poção de vida', title: 'Poção de vida' },
      el('span.itens-pocao-icone'), el('span.itens-pocao-n', { 'aria-hidden': 'true' }, '0'));
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });   // não é toque no mapa nem ataque
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    b.addEventListener('click', function () { if (!beber()) Reino._ui.toqueIgnorado(b); });
    return el('div.itens-pocao', { hidden: true }, b);
  }
  // só mexe no DOM quando algo mudou (roda nos eventos e de 500 em 500 ms)
  function pintar() {
    var caixa = U.$('#hud .itens-pocao'), hud = U.$('#hud');
    if (!caixa || !hud) return;
    if (caixa.parentNode !== hud) hud.appendChild(caixa);
    var mostra = naArena() && temEspada();
    if (visto.mostra !== mostra) { visto.mostra = mostra; caixa.hidden = !mostra; }
    if (!mostra) return;
    var b = caixa.querySelector('button'), p = pocoes(), n = p.pequenas.length + p.grandes.length;
    var qual = p.pequenas.length || !p.grandes.length ? 'pocao-pequena' : 'pocao-grande';
    var apagado = !n || vidaCheia() || parada() || Date.now() < recargaAte;
    if (visto.icone !== qual || !b.querySelector('.itens-pocao-icone canvas')) {
      visto.icone = qual;
      var lugar = b.querySelector('.itens-pocao-icone');
      lugar.textContent = '';
      lugar.appendChild(icone(qual));
    }
    if (visto.n !== n) {
      visto.n = n;
      b.querySelector('.itens-pocao-n').textContent = String(n);
      b.setAttribute('aria-label', n ? 'Beber poção de vida (' + n + ')' : 'Sem poção de vida');
    }
    if (visto.apagado !== apagado) {
      visto.apagado = apagado;
      if (apagado) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    }
  }
  // o HUD remontado cria um botão novo: pinta tudo de novo
  function criar() { visto = { mostra: null, apagado: null, n: null, icone: null }; return botao(); }

  UI.registrarBotaoHud({ id: 'itens-pocao', ordem: 8, criar: criar, pintar: pintar, eventos: EVENTOS });
})();
