/* Bosque dos Fantasmas: o baú do prêmio (docs/contratos/bosque.md §5 e §7). UI.bauBosque({ chave, movel, titulo })
   → Promise, a tela cheia do baú que a criança toca para abrir e receber o móvel surpresa para a casa, nos dois
   prêmios do Bosque (a pergunta certa e o nível novo). O móvel já foi gravado (CasaMoveis.presente) ANTES de abrir a
   tela: fechar o jogo no meio não perde nada. O desenho do baú é o de ui/bau-casa.js (UI.desenharBauPresente), com o
   céu, a luz e os brilhos de .tela-presente (css/ui-bau-presente.css); o cartão do móvel usa a capa da casa
   (UI.capaCasa, de ui/casa-kits.js), o nome e o cômodo. Sem casa, uma nota na tela avisa que ele fica guardado.
   Sem fala/voz nova: só os sons que já existem ('estrela', 'rachar', 'chocar') e texto na tela. Sem Animações
   (U.animar() falso): os mesmos passos, parados. Esc antes de abrir abre o baú; depois de aberto, fecha.
   Estilos: css/ui-bosque.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;

  function pequeno() { return window.innerWidth < 480; }
  function desenhar(box, quadro) {
    if (UI.desenharBauPresente) UI.desenharBauPresente(box, quadro);
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

  /** O baú do prêmio do Bosque: o toque abre e mostra o móvel já gravado. @returns {Promise<void>} */
  UI.bauBosque = function (premio) {
    var movelId = premio && premio.movel, m = movelId && Reino.movelCasa ? Reino.movelCasa(movelId) : null;
    if (!m || !window.PA || !UI.capaCasa) return Promise.resolve();
    return new Promise(function (resolver) {
      var MOV = Reino.config.movimento, animar = U.animar(), passo = 'fechado', ocupado = false, timers = [];
      var t = UI.abrirTela('bosque-bau');
      t.classList.add('tela-presente', 'tela-bosque-bau');
      t.setAttribute('aria-label', premio.titulo || 'Presente do Bosque');
      if (animar) t.classList.add('animado');
      function depois(ms, fn) { if (!animar) return fn(); timers.push(setTimeout(fn, ms)); }

      var titulo = el('h2.presente-titulo', U.colado(premio.titulo || 'Um presente para você!'));
      var bauBox = el('span.presente-bau-box');
      var bau = el('button.presente-bau' + (animar ? '.entrando' : ''), { type: 'button', 'aria-label': 'Toque no baú para abrir' }, bauBox);
      var luz = feixe(), brilhos = faiscas();
      var cartao = el('div.presente-cartao.bosque-bau-cartao', { hidden: true });
      var nota = el('p.bosque-bau-nota', { hidden: true }, U.colado('Ele fica guardado até você ganhar a sua casa.'));
      var cena = el('div.presente-cena.bosque-bau-cena', luz, brilhos, bau);
      var dica = el('p.presente-dica', 'Toque no baú! 🎁');
      var fecharBtn = el('button.btn-grande.btn-principal.presente-continuar', { type: 'button' }, 'Fechar ✨');
      fecharBtn.hidden = true;
      var palco = el('div.presente-palco.bosque-bau-palco', titulo, cena, cartao, dica, nota, el('div.presente-botoes', fecharBtn));
      t.appendChild(palco);
      desenhar(bauBox, 'fechado');
      luz.hidden = brilhos.hidden = true;
      Reino.Som.tocar('estrela');
      if (UI.porTeclado()) UI.focarTeclado(bau, 400);

      bau.addEventListener('click', function (e) { e.stopPropagation(); if (passo === 'fechado') abrir(); });
      palco.addEventListener('click', function () { if (passo === 'fechado') abrir(); });
      fecharBtn.addEventListener('click', function (e) { e.stopPropagation(); fechar(); });
      t.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === t && !e.repeat && passo === 'fechado') { e.preventDefault(); abrir(); }
      });
      t._aoEsc = function () { if (passo === 'fim') fechar(); else abrir(); };

      // treme 3 vezes e a tampa abre; sobe a luz, os brilhos e o cartão do móvel
      function abrir() {
        if (ocupado || passo !== 'fechado') return;
        ocupado = true; passo = 'abrindo';
        bau.classList.remove('entrando');
        bau.setAttribute('aria-label', 'Baú aberto');
        U.preencher(dica, '');
        if (animar) bau.classList.add('tremendo');
        [0, 1, 2].forEach(function (k) { depois(k * MOV.normal, function () { Reino.Som.tocar('rachar'); }); });
        depois(3 * MOV.normal, function () {
          bau.classList.remove('tremendo');
          desenhar(bauBox, 'abrindo');
          depois(MOV.rapido, mostrar);
        });
      }
      function montarCartao() {
        var capa = UI.capaCasa(m.objeto), comodo = Reino.Casa && Reino.Casa.nomeComodo ? Reino.Casa.nomeComodo(m.comodo) : m.comodo;
        var mais = Reino.CasaMoveis && Reino.CasaMoveis.qtd(m.id) > 1;
        cartao.appendChild(el('span.bosque-bau-moldura', capa));
        cartao.appendChild(el('b.presente-nome', U.colado(m.nome)));
        cartao.appendChild(el('span.bosque-bau-comodo', U.colado(comodo)));
        if (mais) cartao.appendChild(el('span.bosque-bau-mais', 'Mais um!'));
      }
      function mostrar() {
        if (passo === 'fim') return;
        timers.forEach(clearTimeout); timers = [];
        passo = 'fim'; ocupado = false;
        bau.classList.remove('entrando', 'tremendo');
        desenhar(bauBox, 'aberto');
        luz.hidden = brilhos.hidden = false;
        montarCartao();
        cartao.hidden = false;
        if (!(Reino.Casa && Reino.Casa.ganhou())) nota.hidden = false;
        fecharBtn.hidden = false;
        Reino.Som.tocar('chocar');
        UI.festa(2, { titulo: titulo, item: cartao, som: false });
        if (UI.porTeclado()) UI.focarTeclado(fecharBtn, 400);
      }
      function fechar() {
        timers.forEach(clearTimeout); timers = [];
        Reino.Som.calar();
        UI.fecharTela(t);
        resolver();
      }
    });
  };
})();
