/* Baú do cartão de experiência (pedido 2026-10-31-moedas-cofre-cartoes §3–§4; docs/contratos/quimica.md §10): no fim
   da sala que deu o cartão n (Reino.Cartoes.daSala), um baú dourado como o dos presentes (ui/bau-presente.js: o
   desenho do baú é cópia; o céu, a luz, as estrelinhas e o movimento são as classes .presente-* de
   css/ui-bau-presente.css, e a tela leva também .tela-presente: o balão do Claude espera ela fechar).
   UI.abrirCartaoBau(n) → Promise (resolve ao fechar; na hora se o cartão n não existe). Passos (toque ou Enter avança):
     chegada   céu da noite, o baú entra, "Um cartão novo para você!" e "Toque no baú!"
     aberto    o baú treme 3 vezes e abre, sobe a luz; "Ver o cartão ✨"
     cartão    a cartinha: "🃏 Cartão n", o emoji da receita, o nome e os ingredientes em tubinhos (UI.quimicaTubo,
               ui/quimica-caderno.js), "Experimente no Laboratório!"; festa nível 2
     final     (só se Reino.Cartoes.produtosNovos(n) tem algo) a cartinha menor e os frascos dos produtos novos:
               "Novo no laboratório!", nome e fórmula
   "Ok! ✨" fecha. Esc: antes do fim, pula para o fim; no fim, fecha. Nada é gravado aqui: o cartão é derivado das
   salas feitas. Sem animações (U.animar() falso, congelado): os mesmos passos, parados. Voz do Claude:
   Reino.Cartoes.FALAS (sistemas/cartoes.js). Estilos: css/ui-bau-cartao.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;

  /* ---------- o baú (24×18 pixels de arte; o mesmo desenho do baú dos presentes) ---------- */
  var PAL = { k: '#3a2446', Y: '#ffd34d', y: '#e8a524', o: '#b06a12', W: '#fff6c8', R: '#ff5c6a', L: '#fff4cc' };
  var VAZIO = '........................';
  var TAMPA = [
    '...kkkkkkkkkkkkkkkkkk...',
    '..kWWYYooYYYYYYooYYYYk..',
    '.kWYYYYooYYYYYYooYYYYyk.',
    '.kYYYYYooYYYYYYooYYYYyk.',
    'kYYYYYYooYYYYYYooYYYYYyk',
    'kyyyyyyooyykkyyooyyyyyyk'];
  var CORPO = [
    'kkkkkkkkkkkRRkkkkkkkkkkk',
    'kYYYYYYooYkRRkYooYYYYYyk',
    'kYYYYYYooYkkkkYooYYYYYyk',
    'kYWYYYYooYYYYYYooYYYYYyk',
    'kYYYYYYooYYYYYYooYYYYYyk',
    'kYYYYYYooYYYYYYooYYYYYyk',
    'kyyyyyyooyyyyyyooyyyyyyk',
    'kkkkkkkkkkkkkkkkkkkkkkkk'];
  var LUZ = 'kLLLLLLLLLLLLLLLLLLLLLLk';
  var QUADROS = {
    fechado: [VAZIO, VAZIO, VAZIO, VAZIO].concat(TAMPA, CORPO),
    abrindo: [VAZIO, VAZIO].concat(TAMPA, [LUZ, LUZ], CORPO),
    aberto: [
      '....kkkkkkkkkkkkkkkk....',
      '...kyyyooyyyyyyooyyyk...',
      '...kyyyooyyyyyyooyyyk...',
      '..kyyyyooyyyyyyooyyyyk..',
      '..kyyyyooyyyyyyooyyyyk..',
      '.kkkkkkkkkkkkkkkkkkkkkk.',
      LUZ,
      'kLLYLLLYLLLLLLYLLLYLLLLk',
      'kYyYYyYYyYYYYyYYyYYyYYYk',
      'kyYyyYyyYyyyyYyyYyyYyyyk'].concat(CORPO),
  };
  function pequeno() { return window.innerWidth < 480; }
  function desenharBau(box, quadro) {
    box.innerHTML = '';
    box.appendChild(PA.paraDOM(PA.matriz(QUADROS[quadro], PAL), pequeno() ? 6 : 8, 'presente-bau-desenho'));
  }
  function faiscas() {
    var box = el('div.presente-faiscas', { 'aria-hidden': 'true' });
    for (var i = 0; i < 8; i++) box.appendChild(PA.paraDOM(PA.iconeDesenho('✨'), 2, 'presente-faisca f' + i));
    return box;
  }
  function feixe() {
    var f = el('div.presente-feixe', { 'aria-hidden': 'true' });
    for (var i = 1; i <= 6; i++) f.appendChild(el('span.arco-' + i));
    return f;
  }
  function hif(s) { var h = Reino._ui && Reino._ui.hifenizar; return h ? h(s) : s; }
  function tubo(ing, escala) {
    if (UI.quimicaTubo) return UI.quimicaTubo(ing, escala);
    return el('span.cbau-tubo-cor', { 'aria-hidden': 'true', style: { background: ing.cor } });
  }

  /* ---------- a cartinha e os produtos ---------- */
  function cartinha(r, compacta) {
    var Q = Reino.Quimica;
    var fila = el('div.cbau-tubos', { role: 'list', 'aria-label': 'Ingredientes' });
    (r.ingredientes || []).forEach(function (id, i) {
      var ing = (Q && Q.ingrediente(id)) || { id: id, nome: id, cor: '#9fd8ff' };
      var t = el('div.cbau-tubo', { role: 'listitem' }, tubo(ing, compacta ? 2 : 3), el('small', U.colado(hif(ing.nome))));
      fila.appendChild(i ? el('div.cbau-par', { role: 'presentation' }, el('span.cbau-mais', { 'aria-hidden': 'true' }, '+'), t) : t);
    });
    var emoji = PA.iconeEmoji(r.emoji, compacta ? 3 : 4);
    emoji.setAttribute('aria-hidden', 'true');
    return el('div.cbau-cartao' + (compacta ? '.compacta' : ''),
      el('p.cbau-numero', U.colado('🃏 Cartão ' + r.cartao)),
      el('div.cbau-emoji', emoji),
      el('h3.cbau-nome', U.colado(hif(r.nome))),
      fila,
      el('p.cbau-onde', el('span', '🧪'), el('span', U.colado('Experimente no Laboratório!'))));
  }
  function produtos(lista) {
    var ul = el('ul.cbau-lista');
    lista.forEach(function (g) {
      ul.appendChild(el('li.cbau-produto', tubo(g, 3), el('b', U.colado(hif(g.nome))),
        g.formula ? el('small.cbau-formula', g.formula) : null));
    });
    return el('div.cbau-produtos', el('p.cbau-novo', U.colado(lista.length > 1 ? '✨ Novos no laboratório!' : '✨ Novo no laboratório!')), ul);
  }

  /** O baú com o cartão de experiência n. @param {number} n @returns {Promise<void>} */
  UI.abrirCartaoBau = function (n) {
    var C = Reino.Cartoes, r = C && C.cartao(n);
    if (!r || !window.PA) return Promise.resolve();
    return new Promise(function (resolver) {
      var MOV = Reino.config.movimento, FALAS = C.FALAS, novos = C.produtosNovos(n);
      var animar = U.animar(), passo = 'chegada', ocupado = false, timers = [];
      var t = UI.abrirTela('cartao-bau');
      t.classList.add('tela-presente');
      t.setAttribute('aria-label', 'Baú do cartão de experiência');
      if (animar) t.classList.add('animado');
      function depois(ms, fn) { if (!animar) return fn(); timers.push(setTimeout(fn, ms)); }

      var titulo = el('h2.presente-titulo', U.colado(FALAS.chegou));
      var bauBox = el('span.presente-bau-box');
      var bau = el('button.presente-bau' + (animar ? '.entrando' : ''), { type: 'button', 'aria-label': 'Toque no baú para abrir' }, bauBox);
      var luz = feixe(), brilhos = faiscas();
      luz.hidden = brilhos.hidden = true;
      var cena = el('div.presente-cena', luz, brilhos, bau);
      var caixa = el('div.cbau-caixa');
      caixa.hidden = true;
      var dica = el('p.presente-dica', 'Toque no baú! 🎁');
      var continuar = el('button.btn-grande.btn-principal.presente-continuar.cbau-continuar', { type: 'button' }, 'Ver o cartão ✨');
      continuar.hidden = true;
      var palco = el('div.presente-palco.cbau-palco', titulo, cena, caixa, dica, el('div.presente-botoes', continuar));
      t.appendChild(palco);
      desenharBau(bauBox, 'fechado');
      Reino.Som.tocar('estrela');
      Reino.Som.falar([FALAS.chegou, FALAS.abrir], { voz: 'claude' });
      if (UI.porTeclado()) UI.focarTeclado(bau, 400);

      bau.addEventListener('click', function (e) { e.stopPropagation(); avancar(); });
      continuar.addEventListener('click', function (e) { e.stopPropagation(); if (passo === 'final') fechar(); else avancar(); });
      // tocar em qualquer lugar do palco (ou Enter/Espaço com o foco na própria tela) também avança
      palco.addEventListener('click', function () { if (passo !== 'final') avancar(); });
      t.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === t && !e.repeat) { e.preventDefault(); if (passo !== 'final') avancar(); }
      });
      t._aoEsc = function () { if (passo === 'final') fechar(); else mostrarFinal(); };

      function avancar() {
        if (ocupado) return;
        if (passo === 'chegada') return abrirBau();
        if (passo === 'aberto') return mostrarCartao();
        mostrarFinal();
      }
      function botao(texto) {
        U.preencher(continuar, texto);
        continuar.hidden = false;
        if (UI.porTeclado()) UI.focarTeclado(continuar, 400);
      }
      // treme 3 vezes e a tampa abre; sobe a luz
      function abrirBau() {
        ocupado = true; passo = 'abrindo';
        bau.classList.remove('entrando');
        bau.setAttribute('aria-label', 'Baú aberto');
        U.preencher(dica, '');
        if (animar) bau.classList.add('tremendo');
        [0, 1, 2].forEach(function (k) { depois(k * MOV.normal, function () { Reino.Som.tocar('rachar'); }); });
        depois(3 * MOV.normal, function () {
          bau.classList.remove('tremendo');
          desenharBau(bauBox, 'abrindo');
          depois(MOV.rapido, function () {
            desenharBau(bauBox, 'aberto');
            passo = 'aberto';
            Reino.Som.tocar('chocar');
            luz.hidden = brilhos.hidden = false;
            depois(MOV.lento, function () {
              ocupado = false;
              U.preencher(dica, 'O baú abriu! ✨');
              botao('Ver o cartão ✨');
            });
          });
        });
      }
      function limparTimers() { timers.forEach(clearTimeout); timers = []; }
      // a cartinha grande; com produtos novos, ainda falta o final
      function mostrarCartao() {
        limparTimers();
        ocupado = false; passo = novos.length ? 'cartao' : 'final';
        cena.hidden = true;
        U.preencher(dica, '');
        caixa.innerHTML = '';
        caixa.appendChild(cartinha(r, false));
        caixa.hidden = false;
        UI.festa(2, { titulo: titulo, emoji: caixa.querySelector('.cbau-emoji') });
        Reino.Som.calar();
        Reino.Som.falar([FALAS.fazer], { voz: 'claude' });
        botao(novos.length ? (novos.length > 1 ? 'Ver os produtos ✨' : 'Ver o produto ✨') : 'Ok! ✨');
      }
      // a cartinha menor e os produtos novos (ou, pelo Esc, a cartinha direto)
      function mostrarFinal() {
        if (!novos.length) return mostrarCartao();
        limparTimers();
        ocupado = false; passo = 'final';
        cena.hidden = true;
        titulo.hidden = true;
        U.preencher(dica, '');
        caixa.innerHTML = '';
        caixa.appendChild(cartinha(r, true));
        caixa.appendChild(produtos(novos));
        caixa.hidden = false;
        Reino.Som.tocar('estrela');
        UI.festa(1, { item: caixa.querySelector('.cbau-produtos'), som: false });
        Reino.Som.calar();
        Reino.Som.falar([novos.length > 1 ? FALAS.produtos : FALAS.produto], { voz: 'claude' });
        botao('Ok! ✨');
      }
      function fechar() {
        limparTimers();
        Reino.Som.calar();
        UI.fecharTela(t);
        resolver();
      }
    });
  };
})();
