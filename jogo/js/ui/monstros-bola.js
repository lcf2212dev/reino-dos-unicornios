/* As bolas na luta (docs/contratos/monstros.md §4): dois botões rápidos redondos, fixos embaixo à direita, acima do da
   poção (ui/itens-pocao.js), em toda arena:
   - a MonsterBall: só para quem já teve alguma bola ou algum monstro (assim as fotos do e2e, sem bola, não mudam);
   - a Super MonsterBall, logo acima: só quando há Super na Mochila.
   Cada um mostra o ícone e quantas há na Mochila. Tocar (ou Enter/Espaço com o foco nele) joga uma daquele tipo no
   monstro mais perto (Reino.Monstros.jogar(tipo)). Apagado (aria-disabled, continua focável) sem bola, sem monstro perto
   (até config.monstros.alcanceBola), com a bola no ar, na recarga ou com a luta parada; tocar apagado explica no aviso
   pequeno. Só na tela, sem voz. Estilos: css/ui-monstros.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var EVENTOS = [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO, EV.BOSQUE, EV.PROGRESSO, EV.ITENS, EV.MONSTROS];
  var TEXTOS = { 'sem-bola': 'Sem MonsterBall! Compre nos Treinadores de Monstros, na Vila Arco-Íris.',
    longe: 'Chegue mais perto de um monstro para jogar a MonsterBall.' };
  var TIPOS = {
    comum: { id: 'monstros-bola', classe: 'monstros-bola', icone: 'item:bola-monster', nome: 'MonsterBall', ordem: 9 },
    super: { id: 'monstros-super', classe: 'monstros-bola.monstros-super', icone: 'item:bola-super', nome: 'Super MonsterBall', ordem: 10 },
  };

  function naArena() { var B = Reino.Bosque; return !!(B && B.naArena && B.naArena()); }
  // já teve alguma bola (até as gastas, lápides do campo itens) ou algum monstro
  function conhece() {
    var M = Reino.Monstros, est = null;
    try { est = Reino.Progresso.estado(); } catch (e) { return false; }
    if (!est) return false;
    if (M && M.capturados().length) return true;
    var it = est.itens || {};
    return Object.keys(it).some(function (k) { return it[k] && (it[k].id === 'bola-monster' || it[k].id === 'bola-super'); });
  }

  function botaoDe(tipo) {
    var T = TIPOS[tipo], visto = {};
    var seletor = '#hud .' + T.classe.split('.').join('.');
    function icone() {
      var base = PA.iconeDesenho(T.icone), c = base ? PA.paraDOM(base, 2, 'icone-px') : PA.iconeEmoji('⭐', 2);
      c.setAttribute('aria-hidden', 'true');
      return c;
    }
    function jogar(b) {
      var M = Reino.Monstros, p = M && M.podeJogar ? M.podeJogar(tipo) : { ok: false };
      if (p.ok && M.jogar(tipo)) {
        pintar();
        setTimeout(pintar, (Reino.config.monstros.recargaBolaMs || 0) + 20);   // acende de novo quando a recarga acaba
        return;
      }
      Reino._ui.toqueIgnorado(b);
      if (TEXTOS[p.motivo]) UI.avisoItem({ icone: T.icone, texto: TEXTOS[p.motivo] });
    }
    function botao() {
      var b = el('button.btn-tela-cheia.btn-monstros-bola', { type: 'button', 'aria-label': 'Jogar ' + T.nome, title: T.nome },
        el('span.monstros-bola-icone'), el('span.monstros-bola-n', { 'aria-hidden': 'true' }, '0'));
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });   // não é toque no mapa nem ataque
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { jogar(b); });
      return el('div.' + T.classe, { hidden: true }, b);
    }
    // só mexe no DOM quando algo mudou (roda nos eventos e de 500 em 500 ms)
    function pintar() {
      var caixa = U.$(seletor), hud = U.$('#hud');
      if (!caixa || !hud) return;
      if (caixa.parentNode !== hud) hud.appendChild(caixa);
      var M = Reino.Monstros, n = naArena() && M ? M.bolas(tipo).length : 0;
      var mostra = naArena() && (tipo === 'super' ? n > 0 : conhece());
      if (visto.mostra !== mostra) { visto.mostra = mostra; caixa.hidden = !mostra; }
      if (!mostra) return;
      var b = caixa.querySelector('button'), apagado = !M.podeJogar(tipo).ok;
      if (!b.querySelector('.monstros-bola-icone canvas')) b.querySelector('.monstros-bola-icone').appendChild(icone());
      if (visto.n !== n) {
        visto.n = n;
        b.querySelector('.monstros-bola-n').textContent = String(n);
        b.setAttribute('aria-label', n ? 'Jogar ' + T.nome + ' (' + n + ')' : 'Sem ' + T.nome);
      }
      if (visto.apagado !== apagado) {
        visto.apagado = apagado;
        if (apagado) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      }
    }
    // o HUD remontado cria um botão novo: pinta tudo de novo
    function criar() { visto = { mostra: null, apagado: null, n: null }; return botao(); }
    UI.registrarBotaoHud({ id: T.id, ordem: T.ordem, criar: criar, pintar: pintar, eventos: EVENTOS });
  }
  botaoDe('comum');
  botaoDe('super');
})();
