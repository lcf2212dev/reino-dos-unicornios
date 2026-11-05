/* Bosque dos Fantasmas: o prêmio da espada e o ponto de nível (docs/contratos/bosque.md §7, itens 1 e 3).
   UI.telaEspadaBosque() → Promise: a espada sobe na luz do arco-íris (céu e brilhos do baú dos presentes, .tela-presente
     de css/ui-bau-presente.css), Bosque.ganharEspada() na hora, festa e as falas `espada` do Claude. Abre sozinha ao fim
     da íris de entrada no Bosque se ela ainda não tem a espada; nunca no modo congelado (precedente: motor/main.js).
   UI.subirNivelBosque(n, falas?) → Promise<'forca'|'vida'|'velocidade'|null>: 3 cartões (Força, Vida, Velocidade) →
     Bosque.porPonto(n, h) e a fala `ponto`; "Depois", ✕ ou Esc deixam o ponto pendente (null). Depois do ponto, o móvel
     do nível: com casa e a chave ainda pendente, UI.escolherMovelCasa(chave); sem casa, a fala `semCasa` (ele fica
     guardado); com todos os móveis, nada. `falas` = o que o Claude diz ao abrir (padrão: as falas `nivel`).
   Os botões novos nascem travados 600 ms (toque duplo). Estilos: css/ui-bosque.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var TRAVA_MS = 600;
  var CARTOES = [
    { h: 'forca', emoji: '💪', nome: 'Força', diz: 'Golpe mais forte' },
    { h: 'vida', emoji: '💖', nome: 'Vida', diz: 'Mais vida' },
    { h: 'velocidade', emoji: '⚡', nome: 'Velocidade', diz: 'Anda mais rápido' },
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
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var animar = U.animar(), t = UI.abrirTela('espada-bosque');
      t.classList.add('tela-presente');
      t.setAttribute('aria-label', 'Prêmio: a espada');
      if (animar) t.classList.add('animado');
      B.ganharEspada();
      var titulo = el('h2.presente-titulo', U.colado(Fa ? Fa.espada[0] : 'Você ganhou uma espada!'));
      var espada = el('div.bosque-premio-espada', { 'aria-hidden': 'true' }, PA.iconeEmoji('🗡', pequeno() ? 6 : 8));
      var cena = el('div.presente-cena.bosque-premio-cena', feixe(), faiscas(), espada);
      var fala = el('p.presente-dica', U.colado(Fa ? Fa.espada[2] : ''));
      var dica = el('p.bosque-premio-dica', UI.dicaEspadaBosque ? UI.dicaEspadaBosque() : 'Toque na espada, ou aperte Espaço, para atacar.');
      var ok = el('button.btn-grande.btn-principal.presente-continuar', { type: 'button' }, 'Vamos lá! ✨');
      t.appendChild(el('div.presente-palco.bosque-premio', titulo, cena, fala, dica, el('div.presente-botoes', ok)));
      Reino.Som.tocar('estrela');
      UI.festa(2, { titulo: titulo, emoji: espada, som: false });
      if (Fa) falar(Fa.espada);
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

  /* ---------- o ponto do nível ---------- */
  // o móvel do nível n, depois do ponto (casa.md §12)
  function movel(n) {
    var B = Reino.Bosque, C = Reino.Casa, CM = Reino.CasaMoveis, Fa = F(), chave = B.chaveMovel(n);
    // sem casa: o balão do Claude (texto e voz); o móvel aparece quando ela ganhar a casa
    if (!C || !C.ganhou()) {
      if (Fa && Reino.Claude && Reino.Claude.falar) Reino.Claude.falar(Fa.semCasa.join(' '), { fala: Fa.semCasa.slice(), voz: 'claude' });
      return Promise.resolve();
    }
    if (!CM || CM.pendentes().indexOf(chave) < 0 || !UI.escolherMovelCasa) return Promise.resolve();
    return UI.escolherMovelCasa(chave).then(function () {}, function (e) { console.warn('bosque, móvel:', e); });
  }

  UI.subirNivelBosque = function (n, falas) {
    var B = Reino.Bosque, Fa = F();
    if (!B || B.pontosPendentes().indexOf(n) < 0) return Promise.resolve(null);
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      var feito = false;
      var pn = UI.painel('bosque-nivel', '⬆ Nível ' + n + '!', { aoFechar: function () { sair(null); } });
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
      depois.addEventListener('click', function () { if (!feito) { Reino.Som.tocar('toque'); Reino.Som.calar(); UI.fecharTela(pn.tela); sair(null); } });
      pn.conteudo.appendChild(el('p.bosque-nivel-dica', U.colado('Escolha onde pôr o seu ponto:')));
      pn.conteudo.appendChild(grade);
      pn.conteudo.appendChild(el('div.bosque-nivel-botoes', depois));
      Reino.Som.tocar('estrela');
      UI.festa(1, { item: grade, som: false });
      falar(falas === undefined && Fa ? Fa.nivel : falas);
      travar(botoes, pn.tela, botoes[0]);

      function escolher(h, b, e) {
        if (feito) return;
        if (!B.porPonto(n, h)) { Reino.Som.tocar('erro'); Reino._ui.toqueIgnorado(b); return; }
        feito = true;
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
          return movel(n);
        }).then(function () { resolver(h); }, function () { resolver(h); });
      }
      function sair(v) {
        if (feito) return;
        feito = true;
        resolver(v);
      }
    });
  };

  /* ---------- a espada ao entrar no Bosque (fim da íris) ---------- */
  U.on(Reino.EVENTOS.TRANSICAO, function (comecou) {
    if (comecou || Reino.congelado) return;
    var B = Reino.Bosque, C = Reino.Cena;
    if (!B || !B.noBosque() || B.temEspada() || UI.temTela() || (C && C.ocupada && C.ocupada())) return;
    UI.telaEspadaBosque().catch(function (e) { console.warn('bosque, espada:', e); });
  });
})();
