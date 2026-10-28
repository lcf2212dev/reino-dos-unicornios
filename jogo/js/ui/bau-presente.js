/* Baú dos presentes (pedido 2026-10-28-presente-medalhas): depois do login, cada presente pendente deste jogador
   (P.presentesPendentes, sistemas/presentes.js; dados em conteudo/presentes.js) chega num baú dourado que ela abre no
   ritmo dela. UI.abrirPresentesPendentes() → Promise (resolve na hora se não há nada). Passos (toque ou Enter avança):
     chegada  céu escuro com estrelas, o baú entra pulando, "Um presente especial para você, <nome>!" e "Toque no baú!"
     aberto   o baú treme 3 vezes e a tampa abre (troca de quadros); AQUI o presente é gravado (P.abrirPresente: fechar
              o jogo no meio não perde nada); sobe a luz arco-íris com estrelinhas
     item i   o acessório sobe girando (quadros mais estreitos, sem rotate) e para no centro: cartão Ultra Lendário com
              moldura arco-íris, selo e nome; o último (o mais imponente) maior, com festa nível 3 e fanfarra
     final    todos lado a lado, "Você mereceu cada uma! 💛" e "Usar a de …" (veste como a Loja: um por encaixe) ou
              "Guardar para depois". Esc: depois de aberto, pula para o final; no final, guarda.
   Animações desligadas, prefers-reduced-motion ou congelado (U.animar() falso): os mesmos passos, parados (baú aberto,
   medalhas paradas, sem luz subindo). Voz do Claude: Reino.Presentes.FALAS e as `falas` de cada acessório. */
(function () {
  var U = Reino.util, el = U.el, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var UI = Reino.UI;

  /* ---------- o baú (24×18 pixels de arte, contorno #3a2446) ---------- */
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

  /* ---------- o acessório girando: colunas amostradas (vizinho mais próximo), centradas, sem rotate ---------- */
  var LARGURAS = [16, 12, 6, 2, 6, 12];
  function quadrosDoGiro(id) {
    var src = PA.iconeDesenho('acessorio:' + id);
    return LARGURAS.map(function (w) {
      var c = PA.novoCanvas(16, 16), x = c.getContext('2d'), ini = (16 - w) / 2;
      for (var i = 0; i < w; i++) x.drawImage(src, Math.floor((i + 0.5) * 16 / w), 0, 1, 16, ini + i, 0, 1, 16);
      return c;
    });
  }

  // estrelinhas da luz: ✨ em pixel, espalhadas em volta do baú (posição pela classe, css)
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

  UI.abrirPresentesPendentes = function () {
    var lista = P.presentesPendentes ? P.presentesPendentes() : [];
    if (!lista.length) return Promise.resolve([]);
    var seq = Promise.resolve();
    lista.forEach(function (def) { seq = seq.then(function () { return abrirUm(def); }); });
    return seq.then(function () { UI.atualizarHUD(); return lista.map(function (d) { return d.id; }); });
  };

  function abrirUm(def) {
    return new Promise(function (resolver) {
      var MOV = Reino.config.movimento, FALAS = Reino.Presentes.FALAS;
      var animar = U.animar();
      var acs = def.acessorios, passo = 'chegada', i = -1, ocupado = false, timers = [];
      var J = Reino.Jogadores, nome = (J && J.perfil && J.perfil().nome) || 'Mariana';
      var t = UI.abrirTela('presente');
      if (animar) t.classList.add('animado');
      function depois(ms, fn) { if (!animar) return fn(); timers.push(setTimeout(fn, ms)); }

      var titulo = el('h2.presente-titulo', 'Um presente especial para você, ' + nome + '!');
      var bauBox = el('span.presente-bau-box');
      var bau = el('button.presente-bau' + (animar ? '.entrando' : ''), { type: 'button', 'aria-label': 'Toque no baú para abrir' }, bauBox);
      var luz = feixe(), brilhos = faiscas();
      luz.hidden = brilhos.hidden = true;
      var sobe = el('span.presente-sobe', { 'aria-hidden': 'true' });
      sobe.hidden = true;
      var cena = el('div.presente-cena', luz, brilhos, sobe, bau);
      var cartao = el('div.presente-cartao');
      cartao.hidden = true;
      var dica = el('p.presente-dica', { 'aria-live': 'polite' }, 'Toque no baú! 🎁');
      var continuar = el('button.btn-grande.btn-principal.presente-continuar', { type: 'button' }, 'Ver o presente ✨');
      continuar.hidden = true;
      var palco = el('div.presente-palco', titulo, cena, cartao, dica, el('div.presente-botoes', continuar));
      t.appendChild(palco);
      desenharBau(bauBox, 'fechado');
      Reino.Som.tocar('estrela');
      Reino.Som.falar([FALAS.chegou, FALAS.toque], { voz: 'claude' });
      if (UI.porTeclado()) UI.focarTeclado(bau, 400);

      bau.addEventListener('click', function (e) { e.stopPropagation(); avancar(); });
      continuar.addEventListener('click', function (e) { e.stopPropagation(); avancar(); });
      // tocar em qualquer lugar do palco (ou Enter/Espaço com o foco na própria tela) também avança
      palco.addEventListener('click', function () { if (passo !== 'final') avancar(); });
      t.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === t && !e.repeat) { e.preventDefault(); if (passo !== 'final') avancar(); }
      });
      t._aoEsc = function () {
        if (passo === 'final') return fechar();
        if (passo !== 'chegada' && !ocupado) mostrarFinal();
      };

      function avancar() {
        if (ocupado) return;
        if (passo === 'chegada') return abrirBau();
        if (i + 1 < acs.length) return mostrarItem(i + 1);
        mostrarFinal();
      }
      function mostrarBotao(texto) {
        U.preencher(continuar, texto);
        continuar.hidden = false;
        if (UI.porTeclado()) UI.focarTeclado(continuar, 400);
      }

      // treme 3 vezes, a tampa abre e o presente fica gravado
      function abrirBau() {
        ocupado = true; passo = 'abrindo';
        bau.classList.remove('entrando');
        bau.setAttribute('aria-label', 'Baú aberto');
        U.preencher(dica, '');
        if (animar) bau.classList.add('tremendo');
        [0, 1, 2].forEach(function (n) { depois(n * MOV.normal, function () { Reino.Som.tocar('rachar'); }); });
        depois(3 * MOV.normal, function () {
          bau.classList.remove('tremendo');
          desenharBau(bauBox, 'abrindo');
          depois(MOV.rapido, function () {
            desenharBau(bauBox, 'aberto');
            P.abrirPresente(def.id);
            passo = 'aberto';
            Reino.Som.tocar('chocar');
            luz.hidden = brilhos.hidden = false;
            depois(MOV.lento, function () {
              ocupado = false;
              U.preencher(dica, 'O baú abriu! ✨');
              mostrarBotao('Ver o presente ✨');
            });
          });
        });
      }

      // o acessório sobe girando do baú e para no centro, no cartão Ultra Lendário
      function mostrarItem(n) {
        ocupado = true; passo = 'item'; i = n;
        var a = acs[n], ultimo = n === acs.length - 1;
        continuar.hidden = true;
        U.preencher(dica, '');
        cartao.hidden = true;
        cena.hidden = false;
        var quadros = quadrosDoGiro(a.id), tela = PA.novoCanvas(16, 16), k = 0;
        sobe.innerHTML = '';
        sobe.appendChild(PA.paraDOM(tela, pequeno() ? 4 : 6, 'presente-girando'));
        var ctx = sobe.firstChild.getContext('2d');
        function pintar(q) { ctx.clearRect(0, 0, 16, 16); ctx.drawImage(q, 0, 0); }
        pintar(quadros[0]);
        sobe.hidden = false;
        sobe.classList.remove('subindo'); void sobe.offsetWidth;
        if (animar) sobe.classList.add('subindo');
        Reino.Som.tocar('estrela');
        var giros = animar ? Math.round(2 * MOV.lento / MOV.rapido) : 0;
        (function girar() {
          if (k >= giros) return;
          depois(MOV.rapido, function () { k++; pintar(quadros[k % quadros.length]); girar(); });
        })();
        depois(2 * MOV.lento + MOV.rapido, function () { pintar(quadros[0]); mostrarCartao(a, ultimo); });
      }
      function mostrarCartao(a, ultimo) {
        sobe.hidden = true;
        cena.hidden = true;
        cartao.className = 'presente-cartao rar-ultra' + (ultimo ? ' maior' : '');
        cartao.innerHTML = '';
        var desenho = el('div.brilho-arco.presente-moldura', PA.paraDOM(PA.iconeDesenho('acessorio:' + a.id), (ultimo ? 10 : 8) - (pequeno() ? 2 : 0), 'presente-medalha'));
        var nomeEl = el('h3.presente-nome', a.nome);
        cartao.appendChild(el('p.presente-selo', '✨ ' + Reino.LojaItens.ULTRA.nome.toUpperCase() + ' ✨'));
        cartao.appendChild(desenho);
        cartao.appendChild(nomeEl);
        cartao.hidden = false;
        if (ultimo) { Reino.Som.tocar('fanfarra'); UI.festa(3, { som: false }); }
        else Reino.Som.tocar('acerto');
        if (a.falas) Reino.Som.falar(a.falas, { voz: 'claude' });
        ocupado = false;
        mostrarBotao(ultimo ? 'Continuar ✨' : 'Ver o próximo ✨');
      }

      // os dois lado a lado, e o que fazer com eles
      function mostrarFinal() {
        timers.forEach(clearTimeout); timers = [];
        ocupado = false; passo = 'final';
        cena.hidden = true; continuar.hidden = true;
        titulo.hidden = true;
        cartao.className = 'presente-final';
        cartao.innerHTML = '';
        var lado = el('div.presente-lado');
        acs.forEach(function (a) {
          lado.appendChild(el('div.presente-mini.rar-ultra', PA.paraDOM(PA.iconeDesenho('acessorio:' + a.id), 4, 'presente-medalha'), el('span', a.nome)));
        });
        cartao.appendChild(el('p.presente-selo', '✨ ' + Reino.LojaItens.ULTRA.nome.toUpperCase() + ' ✨'));
        cartao.appendChild(lado);
        cartao.appendChild(el('p.presente-mereceu', 'Você mereceu cada uma! 💛'));
        var botoes = el('div.presente-escolhas');
        acs.slice().reverse().forEach(function (a, n) {
          var b = el('button.btn-grande' + (n === 0 ? '.btn-principal' : '.btn-secundario'), { type: 'button', 'data-usar': a.id }, a.usar);
          b.addEventListener('click', function () { usar(a); });
          botoes.appendChild(b);
        });
        var guardar = el('button.btn-grande.btn-secundario.presente-guardar', { type: 'button' }, 'Guardar para depois');
        guardar.addEventListener('click', function () { Reino.Som.tocar('toque'); fechar(); });
        botoes.appendChild(guardar);
        cartao.appendChild(botoes);
        cartao.hidden = false;
        U.preencher(dica, '');
        Reino.Som.falar([FALAS.ultra, FALAS.mereceu], { voz: 'claude' });
        if (UI.porTeclado()) UI.focarTeclado(botoes.firstChild, 400);
      }
      // veste como a Loja (um por encaixe: tira o outro do mesmo encaixe) e grava
      function usar(a) {
        P.abrirPresente(def.id);   // por garantia (Esc antes da tampa não chega aqui)
        if (!UI.usandoEnfeite(a.id)) UI.alternarEnfeite(a.id);
        P.salvar();
        Reino.Som.tocar('selecionar');
        U.emit(EV.MAPA_MUDOU);
        fechar();
      }
      function fechar() {
        timers.forEach(clearTimeout); timers = [];
        Reino.Som.calar();
        UI.fecharTela(t);
        resolver();
      }
    });
  }
})();
