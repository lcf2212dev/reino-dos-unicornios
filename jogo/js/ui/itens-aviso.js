/* O aviso do item (docs/contratos/itens.md §13): UI.avisoItem({ icone, texto, raridade? }). Faixa pequena no alto,
   logo abaixo do HUD (--hud-topo), com o ícone de 32 px e a faixa da raridade; some em config.itens.avisoMs. Não é
   tela: não pausa a luta nem pega o foco. Com uma tela aberta espera ela fechar; até config.itens.avisosMax na fila
   (o que passa disso é esquecido: o item já está salvo). Ouve EVENTOS.ITENS: 'ganhou' ("<nome>!" ou "Mochila cheia!
   Foi para o baú da casa.") e 'estrelas' ("+1 estrela!" / "+N estrelas!"). Estilos: css/ui-itens.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var fila = [], atual = null, timer = null;

  function cfg() { return (Reino.config.itens) || {}; }
  function icone(chave) { var c = UI.iconeHud(chave); c.setAttribute('aria-hidden', 'true'); return c; }

  function proximo() {
    if (atual || !fila.length || UI.temTela()) return;
    var a = fila.shift();
    atual = el('div.itens-aviso.rar-' + (a.raridade || 'comum'), { 'data-raridade': a.raridade || 'comum' },
      el('span.itens-aviso-icone', icone(a.icone)), el('span.itens-aviso-texto', a.texto));
    document.body.appendChild(atual);
    timer = setTimeout(sair, cfg().avisoMs || 2600);
  }
  function sair() {
    timer = null;
    if (atual) { atual.remove(); atual = null; }
    proximo();
  }

  /** mostra (ou põe na fila) um aviso pequeno no alto */
  UI.avisoItem = function (a) {
    if (!a || !a.texto) return;
    if (fila.length >= (cfg().avisosMax || 3)) return;
    fila.push({ icone: a.icone || '🎒', texto: a.texto, raridade: a.raridade || null });
    proximo();
  };

  U.on(EV.ITENS, function (c) {
    if (!c) return;
    if (c.tipo === 'estrelas') { UI.avisoItem({ icone: '⭐', texto: c.n === 1 ? '+1 estrela!' : '+' + c.n + ' estrelas!' }); return; }
    if (c.tipo !== 'ganhou') return;
    var d = Reino.Itens && Reino.Itens.def(c.id);
    if (!d) return;
    UI.avisoItem({ icone: d.icone, raridade: d.raridade, texto: c.onde === 'bau' ? 'Mochila cheia! Foi para o baú da casa.' : d.nome + '!' });
  });
  // a tela fechou: o que esperava aparece
  U.on(EV.TELAS, function () { proximo(); });
})();
