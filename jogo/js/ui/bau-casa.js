/* Baú da casa do jogador (docs/contratos/casa.md §9.1): para quem ainda não tem `casaBau`, ao entrar no Reino
   (motor/main.js). O baú dourado é o dos presentes (desenho copiado de ui/bau-cartao.js; céu, luz, estrelinhas e
   movimento são as classes .presente-* de css/ui-bau-presente.css, a tela leva .tela-presente). Passos:
     chegada   o baú entra; "Toque no baú!"
     aberto    treme 3 vezes, a tampa abre (Reino.Casa.abrirBau() grava aqui) e sobe a casinha de 2 andares;
               o Claude: "Uma casa só sua!" e "Fica perto do Observatório!"
   "Fechar" (ou Esc no fim) fecha; Esc antes do fim abre na hora. Depois, UI.casaKitsPendentes() (ui/casa-kits.js).
   UI.abrirBauCasa() → Promise (resolve na hora se Casa.ganhou()). Sem animação: os mesmos passos, parados.
   O desenho do baú (fechado/tremendo/abrindo/aberto) fica em UI.desenharBauPresente, para as outras telas de baú
   (ui/bosque-bau.js).
   Estilos: css/ui-bau-casa.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var FALAS = Reino.CasaFalas;   // ui/casa-falas.js

  /* ---------- o baú (24×18; o mesmo desenho do baú dos presentes) ---------- */
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

  /* ---------- a casinha de 2 andares (20×24; luz de cima e da esquerda, contorno #3a2446) ---------- */
  var PAL_CASA = { k: '#3a2446', R: '#ff7a9a', r: '#c94a6e', S: '#ffb3c6', W: '#fff6e8', w: '#e8cfb8',
    B: '#9fd8ff', b: '#5fa8e0', D: '#b0703a', Y: '#ffd34d' };
  var CASA = [
    '.........kk.........',
    '........kSRk........',
    '.......kSRRRk.......',
    '......kSRRRRRk......',
    '.....kSRRRRRRRk.....',
    '....kSRRRRRRRRRk....',
    '...kSRRRRRRRRRRRk...',
    '..kSRRRRRRRRRRRRRk..',
    '.kSRRRRRRRRRRRRRRRk.',
    'krrrrrrrrrrrrrrrrrrk',
    '.kWWWWWWWWWWWWWWWwk.',
    '.kWkkkkWWWWWWkkkkwk.',
    '.kWkBbkWWWWWWkBbkwk.',
    '.kWkbbkWWWWWWkbbkwk.',
    '.kWkkkkWWWWWWkkkkwk.',
    '.kwwwwwwwwwwwwwwwwk.',
    '.kWWWWWWWWWWWWWWWwk.',
    '.kWkkkkWkkkkWkkkkwk.',
    '.kWkBbkWkDDkWkBbkwk.',
    '.kWkbbkWkDDkWkbbkwk.',
    '.kWkkkkWkDYkWkkkkwk.',
    '.kWWWWWWkDDkWWWWWwk.',
    '.kwwwwwwkDDkwwwwwwk.',
    'kkkkkkkkkkkkkkkkkkkk'];

  // a mesma casinha, para a novidade da tela de início (ui/abertura-novidade.js)
  UI.casinhaDOM = function (escala, classe) { return PA.paraDOM(PA.matriz(CASA, PAL_CASA), escala, classe); };

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
  function depoisKits() { return UI.casaKitsPendentes ? UI.casaKitsPendentes() : Promise.resolve(); }

  /** O baú da casa (uma vez por jogador). @returns {Promise<void>} */
  UI.abrirBauCasa = function () {
    var C = Reino.Casa;
    if (!C || C.ganhou() || !window.PA) return Promise.resolve();
    return new Promise(function (resolver) {
      var MOV = Reino.config.movimento;
      var animar = U.animar(), passo = 'chegada', ocupado = false, timers = [];
      var t = UI.abrirTela('bau-casa');
      t.classList.add('tela-presente');
      t.setAttribute('aria-label', 'Baú da casa');
      if (animar) t.classList.add('animado');
      function depois(ms, fn) { if (!animar) return fn(); timers.push(setTimeout(fn, ms)); }

      var titulo = el('h2.presente-titulo', U.colado('Um presente para você!'));
      var bauBox = el('span.presente-bau-box');
      var bau = el('button.presente-bau' + (animar ? '.entrando' : ''), { type: 'button', 'aria-label': 'Toque no baú para abrir' }, bauBox);
      var casa = el('div.presente-sobe.bcasa-casa', { 'aria-hidden': 'true' }, PA.paraDOM(PA.matriz(CASA, PAL_CASA), pequeno() ? 4 : 5, 'bcasa-desenho'));
      var luz = feixe(), brilhos = faiscas();
      luz.hidden = brilhos.hidden = casa.hidden = true;
      var cena = el('div.presente-cena.bcasa-cena', luz, brilhos, casa, bau);
      var dica = el('p.presente-dica', 'Toque no baú! 🎁');
      var fecharBtn = el('button.btn-grande.btn-principal.presente-continuar', { type: 'button' }, 'Fechar ✨');
      fecharBtn.hidden = true;
      var palco = el('div.presente-palco.bcasa-palco', titulo, cena, dica, el('div.presente-botoes', fecharBtn));
      t.appendChild(palco);
      desenharBau(bauBox, 'fechado');
      Reino.Som.tocar('estrela');
      Reino.Som.falar([FALAS.chegou], { voz: 'claude' });
      if (UI.porTeclado()) UI.focarTeclado(bau, 400);

      bau.addEventListener('click', function (e) { e.stopPropagation(); if (passo === 'chegada') abrirBau(); });
      fecharBtn.addEventListener('click', function (e) { e.stopPropagation(); fechar(); });
      palco.addEventListener('click', function () { if (passo === 'chegada') abrirBau(); });
      t.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === t && !e.repeat && passo === 'chegada') { e.preventDefault(); abrirBau(); }
      });
      t._aoEsc = function () { if (passo === 'fim') fechar(); else mostrarCasa(); };

      // treme 3 vezes e a tampa abre (grava aqui); sobe a luz e a casinha
      function abrirBau() {
        if (ocupado) return;
        ocupado = true; passo = 'abrindo';
        bau.classList.remove('entrando');
        bau.setAttribute('aria-label', 'Baú aberto');
        U.preencher(dica, '');
        if (animar) bau.classList.add('tremendo');
        [0, 1, 2].forEach(function (k) { depois(k * MOV.normal, function () { Reino.Som.tocar('rachar'); }); });
        depois(3 * MOV.normal, function () {
          bau.classList.remove('tremendo');
          desenharBau(bauBox, 'abrindo');
          C.abrirBau();
          depois(MOV.rapido, mostrarCasa);
        });
      }
      // a casinha subiu: festa, a fala do Claude e o botão de fechar (o Esc chega aqui direto)
      function mostrarCasa() {
        if (passo === 'fim') return;
        timers.forEach(clearTimeout); timers = [];
        C.abrirBau();   // já gravado pela tampa; pelo Esc, grava agora (não faz nada da 2ª vez)
        passo = 'fim'; ocupado = false;
        bau.classList.remove('entrando', 'tremendo');
        desenharBau(bauBox, 'aberto');
        luz.hidden = brilhos.hidden = casa.hidden = false;
        if (animar) casa.classList.add('subindo');
        U.preencher(titulo, FALAS.casa);
        U.preencher(dica, FALAS.perto);
        Reino.Som.tocar('chocar');
        UI.festa(2, { titulo: titulo, som: false });
        Reino.Som.calar();
        Reino.Som.falar([FALAS.casa, FALAS.perto], { voz: 'claude' });
        fecharBtn.hidden = false;
        if (UI.porTeclado()) UI.focarTeclado(fecharBtn, 400);
      }
      function fechar() {
        timers.forEach(clearTimeout); timers = [];
        Reino.Som.calar();
        UI.fecharTela(t);
        depoisKits().then(function () { resolver(); }, function () { resolver(); });
      }
    });
  };

  // o desenho do baú dourado, para as outras telas de presente (ui/bosque-bau.js)
  UI.desenharBauPresente = desenharBau;
})();
