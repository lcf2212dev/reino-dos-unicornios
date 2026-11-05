/* Bosque dos Fantasmas no HUD (docs/contratos/bosque.md §5 e §7), só dentro do interior `bosque`:
   - o chip na coluna da esquerda (padrão da Aura, ui/hud-aura.js): 💖 vida n/max (BosqueCombate.vida()), "Nv N", a
     barrinha de XP n/10 (Bosque.xp()) e o selo "+N" quando há ponto para pôr. Tocar abre UI.telaBosque();
   - o botão redondo da espada, fixo embaixo à direita (o pintar o tira da fileira de cima), para atacar no toque:
     segurar o dedo (ou o mouse) repete o golpe a cada config.fantasmas.jogador.recargaMs, como segurar o Espaço; para
     no pointerup/cancel/leave, com tela aberta e fora do Bosque. Ao lado, a dica (só na tela, sem voz) até o 1º golpe:
     UI.dicaEspadaBosque(), "Toque na espada para atacar." em tela de toque (Reino.ambiente.toque()), senão
     "Toque na espada, ou aperte Espaço, para atacar." (também no prêmio da espada, ui/bosque-nivel.js).
   - o cursor de espada (🗡 em pixel art, data URL montada uma vez) com o mouse em cima de um fantasma que se pode
     atacar (BosqueCombate.fantasmaNaTela, sistemas/bosque-alvo.js), trocado só no pointermove do canvas;
   UI.telaBosque(): o painel com nível, XP, vida, os pontos de Força/Vida/Velocidade e o botão de pôr o ponto pendente
   (UI.subirNivelBosque, ui/bosque-nivel.js). Os ícones (💖 ⭐ 💪 ⚡ ⬆ 🗡) já existem: nenhum registrado aqui.
   Reino.Bosque e Reino.BosqueCombate carregam depois (sistemas/): lidos só dentro das funções. Estilos: css/ui-bosque.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var DICA = 'Toque na espada, ou aperte Espaço, para atacar.', DICA_TOQUE = 'Toque na espada para atacar.';
  function dica() { var A = Reino.ambiente; return A && A.toque && A.toque() ? DICA_TOQUE : DICA; }
  var HABS = [
    { h: 'forca', emoji: '💪', nome: 'Força' },
    { h: 'vida', emoji: '💖', nome: 'Vida' },
    { h: 'velocidade', emoji: '⚡', nome: 'Velocidade' },
  ];
  var EVENTOS = [EV.CENA, EV.TELAS, EV.OCUPADA, EV.TRANSICAO, EV.BOSQUE, EV.PROGRESSO];

  function B() { return Reino.Bosque && Reino.Bosque.xp ? Reino.Bosque : null; }
  function combate() { return Reino.BosqueCombate || null; }
  function noBosque() { var b = B(); return !!(b && b.noBosque()); }
  function vida() { var c = combate(); return c ? c.vida() : { n: 0, max: 0 }; }
  function icone(emoji, escala) { var c = PA.iconeEmoji(emoji, escala || 2); c.setAttribute('aria-hidden', 'true'); return c; }

  // a barrinha de XP (cheia no nível máximo)
  function barraXp(x, classe) {
    var cheio = el('span.bosque-xp-cheia');
    cheio.style.width = (x.de ? Math.round(x.n / x.de * 100) : 100) + '%';
    return el('span.bosque-xp' + (classe ? '.' + classe : ''), { 'aria-hidden': 'true' }, cheio);
  }

  /* ---------- o chip ---------- */
  var ultimoChip = null;
  function pintarChip() {
    var b = U.$('#hud .chip-bosque');
    if (!b) return;
    var esq = U.$('#hud .hud-esq');
    if (esq && b.parentNode !== esq) esq.appendChild(b);
    var mostra = noBosque();
    if (b.hidden === mostra) b.hidden = !mostra;
    if (!mostra) return;
    var Bo = B(), v = vida(), x = Bo.xp(), nv = Bo.nivel(), pend = Bo.pontosPendentes().length;
    var chave = [v.n, v.max, nv, x.n, x.de, pend].join('|');
    if (chave === ultimoChip && b.firstChild) return;
    ultimoChip = chave;
    b.innerHTML = '';
    b.appendChild(el('span.bosque-chip-vida', icone('💖'), el('span', v.n + '/' + v.max)));
    b.appendChild(el('span.bosque-chip-nivel', el('span', 'Nv ' + nv), barraXp(x)));
    if (pend) b.appendChild(el('span.bosque-selo', '+' + pend));
    b.setAttribute('aria-label', 'Bosque: vida ' + v.n + ' de ' + v.max + ', nível ' + nv +
      (pend ? ', ponto para pôr' : ''));
  }
  function chipBosque() {
    var b = el('button.chip.chip-bosque', { type: 'button', 'aria-label': 'Bosque dos Fantasmas', hidden: true });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    b.addEventListener('click', function () {
      if (UI.temTela() || !noBosque()) return;
      Reino.Som.tocar('toque');
      telaBosque();
    });
    ultimoChip = null;
    return b;
  }

  /* ---------- o botão da espada (e a dica até o 1º golpe) ---------- */
  var golpeou = false;   // nesta sessão: a dica some depois do 1º golpe
  U.on(EV.BOSQUE, function (e) { if (e && e.tipo === 'golpe') golpeou = true; });
  function pintarEspada() {
    var caixa = U.$('#hud .bosque-acao'), hud = U.$('#hud');
    if (!caixa || !hud) return;
    if (caixa.parentNode !== hud) hud.appendChild(caixa);
    var Bo = B(), mostra = noBosque() && !!(Bo && Bo.temEspada());
    if (caixa.hidden === mostra) caixa.hidden = !mostra;
    if (!mostra) pararRepetir();
    var d = caixa.querySelector('.bosque-dica'), semDica = !mostra || golpeou;
    if (d && d.hidden !== semDica) d.hidden = semDica;
    if (d && !semDica && d.textContent !== dica()) d.textContent = dica();
  }
  // segurar a espada repete o golpe (a cada recargaMs) enquanto o dedo estiver no botão
  var repetir = null;
  function pararRepetir() { if (repetir) { clearInterval(repetir); repetir = null; } }
  function golpe() {
    var c = combate();
    if (!c || UI.temTela() || !noBosque()) { pararRepetir(); return false; }
    return c.atacar();
  }
  function botaoEspada() {
    var b = el('button.btn-tela-cheia.btn-bosque-espada', { type: 'button', 'aria-label': 'Atacar com a espada', title: 'Atacar' },
      icone('🗡', 3));
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    // dedo ou mouse: golpe no pointerdown e de novo a cada recargaMs até soltar
    b.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (x) { /* ponteiro sintético */ }
      pararRepetir();
      if (!golpe()) Reino._ui.toqueIgnorado(b);
      if (!UI.temTela() && noBosque()) repetir = setInterval(golpe, Reino.config.fantasmas.jogador.recargaMs);
    });
    ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture'].forEach(function (ev) { b.addEventListener(ev, pararRepetir); });
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    // o clique do ponteiro já golpeou no pointerdown; o do teclado (Enter/Espaço, detail 0) golpeia aqui
    b.addEventListener('click', function (e) {
      if (e.detail > 0) return;
      if (!golpe()) Reino._ui.toqueIgnorado(b);
    });
    return el('div.bosque-acao', { hidden: true }, el('p.bosque-dica', { hidden: true }, dica()), b);
  }

  /* ---------- o cursor de espada em cima de um fantasma (só mouse; nada por quadro) ---------- */
  var cursorEspada = null, comCursor = false;
  function urlCursor() {
    if (cursorEspada) return cursorEspada;
    var ic = PA.iconeEmoji('🗡', 2), c = PA.novoCanvas(ic.width * 2, ic.height * 2), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(ic, 0, 0, c.width, c.height);
    // o clique é na ponta da lâmina (em cima, à direita)
    cursorEspada = 'url(' + c.toDataURL() + ') ' + (c.width - 2) + ' 1, pointer';
    return cursorEspada;
  }
  function trocarCursor(cv, sim) {
    if (sim === comCursor) return;
    comCursor = sim;
    cv.style.cursor = sim ? urlCursor() : '';
  }
  document.addEventListener('pointermove', function (e) {
    var V = Reino._motor, cv = V && V.canvas, c = combate();
    if (!cv || e.target !== cv) return;
    trocarCursor(cv, e.pointerType === 'mouse' && !!c && noBosque() && !UI.temTela() && c.temEspada() && !!c.fantasmaNaTela(e.clientX, e.clientY));
  });
  function semCursor() { var V = Reino._motor; if (V && V.canvas) trocarCursor(V.canvas, false); }
  U.on(EV.CENA, semCursor);
  U.on(EV.TELAS, semCursor);

  /* ---------- o painel do Bosque ---------- */
  function telaBosque() {
    var Bo = B();
    if (!Bo || UI.temTela()) return;
    var pn = UI.painel('bosque', '🗡 Bosque dos Fantasmas', { curto: '🗡 Bosque', estreito: true });
    var x = Bo.xp(), v = vida(), pts = Bo.pontos(), pend = Bo.pontosPendentes();
    var corpo = el('div.bosque-painel',
      el('p.bosque-painel-nivel', 'Nível ' + Bo.nivel()),
      el('div.bosque-painel-xp', icone('⭐'), barraXp(x, 'bosque-xp-grande'),
        el('b', x.maximo ? 'Máximo!' : x.n + '/' + x.de)),
      el('p.bosque-painel-vida', icone('💖'), el('span', 'Vida ' + v.n + '/' + v.max)));
    var lista = el('ul.bosque-habs');
    HABS.forEach(function (a) {
      lista.appendChild(el('li.bosque-hab', icone(a.emoji), el('span.bosque-hab-nome', a.nome), el('b', String(pts[a.h]))));
    });
    corpo.appendChild(lista);
    if (pend.length) {
      var btn = el('button.btn-grande.btn-principal.bosque-por', { type: 'button' }, '⬆ Pôr o ponto');
      btn.addEventListener('click', function (e) {
        Reino.Som.tocar('toque');
        if (e.isTrusted && e.detail) UI.segurarToques();
        UI.fecharTela(pn.tela);
        var F = Reino.BosqueFalas;
        if (UI.subirNivelBosque) UI.subirNivelBosque(pend[0], F ? [F.nivel[F.nivel.length - 1]] : []);
      });
      corpo.appendChild(el('p.bosque-painel-pend', pend.length === 1 ? 'Tem um ponto para pôr!' : 'Tem ' + pend.length + ' pontos para pôr!'));
      corpo.appendChild(el('div.bosque-painel-botoes', btn));
    }
    pn.conteudo.appendChild(corpo);
  }

  UI.registrarBotaoHud({ id: 'bosque', ordem: 6, criar: chipBosque, pintar: pintarChip, eventos: EVENTOS });
  UI.registrarBotaoHud({ id: 'bosque-espada', ordem: 7, criar: botaoEspada, pintar: pintarEspada, eventos: EVENTOS });
  UI.telaBosque = telaBosque;
  UI.dicaEspadaBosque = dica;
  UI.pintarChipBosque = pintarChip;
})();
