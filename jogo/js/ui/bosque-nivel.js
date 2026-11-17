/* Bosque dos Fantasmas: o prêmio da espada e o ponto de nível (docs/contratos/bosque.md §7, itens 1 e 3).
   UI.telaEspadaBosque() → Promise: a espada sobe na luz do arco-íris (céu e brilhos do baú dos presentes, .tela-presente
     de css/ui-bau-presente.css), Bosque.ganharEspada() na hora, festa e as falas `espada` do Claude. Abre sozinha ao fim
     da íris de entrada no Bosque se ela ainda não tem a espada; nunca no modo congelado (precedente: motor/main.js).
   UI.subirNivelBosque(n, falas?, premio?) → Promise<'forca'|'vida'|'velocidade'|null>: 3 cartões (Força, Vida,
     Velocidade) → Bosque.porPonto(n, h) e a fala `ponto`; "Depois", ✕ ou Esc deixam o ponto pendente (null). Depois do
     ponto (ou de "Depois"/Esc), o baú do nível (UI.bauBosque, ui/bosque-bau.js): o móvel surpresa que o abate já gravou
     (`premio` = { chave, movel }) ou, para um nível antigo pendente, um CasaMoveis.presente('bosque:<n>') se a chave
     ainda não tiver móvel (casa.md §12). Sem casa o móvel fica guardado e o próprio baú avisa na tela. Sem móvel, segue
     sem baú. `falas` = o que o Claude diz ao abrir (padrão: as falas `nivel`).
   Em toda arena (arenas.md); fora do Bosque, as falas sem fantasma (BosqueFalas.de).
   Os botões novos nascem travados 600 ms (toque duplo). Estilos: css/ui-bosque.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var TRAVA_MS = 600;
  var CARTOES = [
    { h: 'forca', emoji: '💪', nome: 'Força', diz: 'Golpe mais forte' },
    { h: 'vida', emoji: '💖', nome: 'Vida', diz: 'Mais vida e cura' },
    { h: 'velocidade', emoji: '⚡', nome: 'Velocidade', diz: 'Anda e ataca mais rápido' },
  ];

  function F() { return Reino.BosqueFalas; }
  function pequeno() { return window.innerWidth <= 480; }
  function falar(linhas) {
    if (!linhas || !linhas.length) return Promise.resolve();
    return Promise.resolve(Reino.Som.falar(linhas, { voz: 'claude' })).catch(function () {});
  }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // destrava os botões depois de TRAVA_MS e foca o 1º (só pelo teclado)
  function travar(botoes, tela, foco) {
    botoes.forEach(function (b) { b.disabled = true; });
    setTimeout(function () {
      botoes.forEach(function (b) { b.disabled = false; });
      if (tela.isConnected && foco && UI.porTeclado()) UI.focarTeclado(foco);
    }, TRAVA_MS);
  }

  /* ---------- o prêmio da espada ---------- */
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
  UI.telaEspadaBosque = function () {
    var B = Reino.Bosque, Fa = F();
    if (!B || !window.PA) return Promise.resolve();
    var esp = Fa ? (Fa.de ? Fa.de('espada') : Fa.espada) : null;   // fora do Bosque, sem falar de fantasma
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var animar = U.animar(), t = UI.abrirTela('espada-bosque');
      t.classList.add('tela-presente');
      t.setAttribute('aria-label', 'Prêmio: a espada');
      if (animar) t.classList.add('animado');
      B.ganharEspada();
      var titulo = el('h2.presente-titulo', U.colado(esp ? esp[0] : 'Você ganhou uma espada!'));
      var espada = el('div.bosque-premio-espada', { 'aria-hidden': 'true' }, PA.iconeEmoji('🗡', pequeno() ? 6 : 8));
      var cena = el('div.presente-cena.bosque-premio-cena', feixe(), faiscas(), espada);
      var fala = el('p.presente-dica', U.colado(esp ? esp[esp.length - 1] : ''));
      var dica = el('p.bosque-premio-dica', UI.dicaEspadaBosque ? UI.dicaEspadaBosque() : 'Toque na espada, ou aperte Espaço, para atacar.');
      var ok = el('button.btn-grande.btn-principal.presente-continuar', { type: 'button' }, 'Vamos lá! ✨');
      t.appendChild(el('div.presente-palco.bosque-premio', titulo, cena, fala, dica, el('div.presente-botoes', ok)));
      Reino.Som.tocar('estrela');
      UI.festa(2, { titulo: titulo, emoji: espada, som: false });
      if (esp) falar(esp);
      travar([ok], t, ok);
      var feito = false;
      function fechar() {
        if (feito) return;
        feito = true;
        Reino.Som.calar();
        UI.fecharTela(t);
        resolver();
      }
      ok.addEventListener('click', function (e) { e.stopPropagation(); if (!ok.disabled) { Reino.Som.tocar('toque'); fechar(); } });
      t._aoEsc = fechar;
    });
  };

  /* ---------- o ponto do nível e o baú do móvel ---------- */
  // o móvel do nível n (casa.md §12): o que o abate já gravou (premio) ou, para um nível antigo pendente, um
  // presente novo se a chave ainda não tiver móvel. Sem móvel, segue sem baú (o baú avisa na tela quando não há casa).
  function premioDoNivel(n, premio) {
    var B = Reino.Bosque, CM = Reino.CasaMoveis;
    if (!UI.bauBosque || !B || !CM) return Promise.resolve();
    var p = premio;
    if (!p) {
      var chave = B.chaveMovel(n);
      if (!CM.escolhida || CM.escolhida(chave)) return Promise.resolve();
      p = CM.presente ? CM.presente(chave) : null;
    }
    if (!p || !p.movel) return Promise.resolve();
    return UI.bauBosque({ chave: p.chave, movel: p.movel, titulo: 'Presente do nível!' })
      .then(function () {}, function (e) { console.warn('bosque, baú do nível:', e); });
  }

  UI.subirNivelBosque = function (n, falas, premio) {
    var B = Reino.Bosque, Fa = F();
    if (!B) return Promise.resolve(null);
    // prêmio já gravado (o abate chamou abater): o baú sai mesmo que o ponto já tenha sido posto antes
    if (B.pontosPendentes().indexOf(n) < 0) {
      if (!premio) return Promise.resolve(null);
      return premioDoNivel(n, premio).then(function () { return null; });
    }
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var escolhido = false, saindo = false;
      var pn = UI.painel('bosque-nivel', '⬆ Nível ' + n + '!', { aoFechar: function () { seguir(null); } });
      var grade = el('div.bosque-cartoes');
      var botoes = CARTOES.map(function (c) {
        var b = el('button.bosque-cartao', { type: 'button', 'data-hab': c.h },
          PA.iconeEmoji(c.emoji, pequeno() ? 2 : 3),
          el('span.bosque-cartao-texto', el('b.bosque-cartao-nome', c.nome), el('span.bosque-cartao-diz', U.colado(c.diz))));
        b.addEventListener('click', function (e) { if (!b.disabled) escolher(c.h, b, e); });
        grade.appendChild(b);
        return b;
      });
      var depois = el('button.btn-grande.btn-secundario.bosque-depois', { type: 'button' }, 'Depois');
      depois.addEventListener('click', function () { if (escolhido || saindo) return; Reino.Som.tocar('toque'); Reino.Som.calar(); UI.fecharTela(pn.tela); seguir(null); });
      pn.conteudo.appendChild(el('p.bosque-nivel-dica', U.colado('Escolha onde pôr o seu ponto:')));
      pn.conteudo.appendChild(grade);
      pn.conteudo.appendChild(el('div.bosque-nivel-botoes', depois));
      Reino.Som.tocar('estrela');
      UI.festa(1, { item: grade, som: false });
      falar(falas === undefined && Fa ? Fa.nivel : falas);
      travar(botoes, pn.tela, botoes[0]);

      function escolher(h, b, e) {
        if (escolhido || saindo) return;
        if (!B.porPonto(n, h)) { Reino.Som.tocar('erro'); Reino._ui.toqueIgnorado(b); return; }
        escolhido = true;
        b.classList.add('escolhido');
        if (e && e.isTrusted && e.detail) UI.segurarToques();
        UI.festa(2, { item: b });
        if (UI.atualizarHUD) UI.atualizarHUD();
        Reino.Som.calar();
        // o cartão escolhido fica à vista até o Claude terminar a fala do ponto (no máximo 3 s)
        var fala = Fa ? falar([Fa.ponto[h]]) : Promise.resolve();
        var minimo = U.animar() ? Reino.config.movimento.lento * 2 : 0;
        Promise.all([Promise.race([fala, esperar(3000)]), esperar(minimo)]).then(function () {
          UI.fecharTela(pn.tela);
          seguir(h);
        });
      }
      // fecha a tela do ponto (se ainda aberta) e abre o baú do nível; resolve só depois que ele fechar
      function seguir(v) {
        if (saindo) return;
        saindo = true;
        premioDoNivel(n, premio).then(function () { resolver(v); }, function () { resolver(v); });
      }
    });
  };

  /* ---------- a espada ao entrar numa arena (o Bosque ou um mapa novo; fim da íris) ---------- */
  U.on(Reino.EVENTOS.TRANSICAO, function (comecou) {
    if (comecou || Reino.congelado) return;
    var B = Reino.Bosque, C = Reino.Cena;
    if (!B || !B.naArena() || B.temEspada() || UI.temTela() || (C && C.ocupada && C.ocupada())) return;
    UI.telaEspadaBosque().catch(function (e) { console.warn('bosque, espada:', e); });
  });
})();
