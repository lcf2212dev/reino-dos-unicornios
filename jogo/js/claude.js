/* Claude, o mascote guia: elogios, dicas de calma para a prova e lembretes. */
(function () {
  var U = Reino.util;
  var C = {};
  var nome = function () { return Reino.config.nomeJogadora; };

  var FALAS = {
    boasVindas: [
      'Oi, {nome}! Que bom te ver! Vamos passear pelo Reino e revisar História?',
      'Olá, {nome}! Seu unicórnio estava com saudade de você! 🦄',
      'Oba, a {nome} chegou! O Museu e a Torre do Relógio estão te esperando.',
    ],
    acerto: [
      'Isso, {nome}! Você leu com calma e acertou! ✨',
      'Uau! Resposta certinha! 🦄',
      'Que orgulho! Você pensou direitinho.',
      'Acertou! Seu unicórnio está pulando de alegria!',
      'Muito bem! Ler com atenção funciona mesmo!',
      'Perfeito! Você é uma ótima historiadora! 🏛️',
      'Mandou muito bem, {nome}! 💛',
      'Show! Você lembrou direitinho da apostila!',
    ],
    acertoDepois: [
      'Isso aí! Errar e tentar de novo é assim que a gente aprende. 💪',
      'Viu só? Você leu de novo com calma e conseguiu!',
      'Muito bem! Agora você não esquece mais essa!',
    ],
    erro: [
      'Quase! Leia a pista com calma e tente de novo. 📖',
      'Tudo bem errar! Errar faz parte de aprender.',
      'Hmm, não foi essa. Respira fundo e olha de novo com calma. 🌬️',
      'Opa! Toda campeã erra às vezes. Você consegue!',
    ],
    pressa: [
      'Ei, {nome}! Leu tudinho? Lê mais uma vez com o dedinho 👀',
      'Opa, foi rapidinho! Que tal ler a pergunta de novo, com calma?',
      'Devagarinho se vai longe! Confere mais uma vez antes de responder. 🐢',
      'Lembra: aqui não tem relógio! Lê de novo com calma e depois confere.',
    ],
    dica: [
      'Sabia? Quem termina a prova primeiro não ganha medalha. Quem ACERTA é que ganha! 🥇',
      'A medalha de ouro da escola vale R$100! E ela vem das respostas certas, não da pressa. 💛',
      'Os campeões revisam a prova do começo ao fim antes de entregar.',
      'O tempo da prova é todo seu. Terminar por último está tudo bem!',
      'Na prova, leia cada pergunta duas vezes: uma para entender e outra para ter certeza.',
      'Lembra da quadrinha? "Eu sozinho canto bem, com você canto melhor." Ela valoriza a amizade, não a competição! A prova não é uma corrida.',
      'Se sobrar tempo na prova, use para revisar. É aí que a gente encontra os errinhos!',
      'Antes de começar a prova, respira fundo três vezes. O cérebro fica tranquilo e lembra melhor.',
      'Terminar por último é coisa de campeã! 🏆',
      'Seu unicórnio fica orgulhoso quando você lê com calma. 🦄',
      'Quem acerta com calma ganha o ouro. Quem corre pode errar bobeira. Qual você prefere?',
    ],
    curiosidade: [
      'Sabia que a neta do senhor Antônio também se chama Mariana? 😄',
      'No cartão-postal da apostila está escrito: "Mariana adorou". Tem Mariana em todo lugar!',
      'Os griôs contam histórias há centenas de anos. Hoje eu sou o seu griô! 📖',
      'O senhor Antônio esperava o carteiro todos os dias. Imagina esperar uma carta por semanas!',
      'A Dona Sara conheceu o mar em 28/12/1957. Ela guardou até as conchinhas!',
    ],
    pausa: [
      'Você está estudando há um tempinho! Que tal beber água e esticar os braços? 💧',
      'Hora de uma pausinha! Levanta, dá três pulinhos e volta. 🐰',
      'Seu cérebro trabalhou muito! Descansa os olhinhos um pouquinho olhando pela janela. 🌤️',
    ],
    fimSala: [
      'Você é incrível, {nome}! 🎉',
      'Mais uma sala! Esse museu está ficando todo iluminado por sua causa!',
      'Parabéns! Você revisou com dedicação!',
      'Que orgulho, {nome}! Seu unicórnio está comemorando com você! 🦄',
    ],
  };

  C.FALAS = FALAS;
  var ultimo = {};
  C.frase = function (tipo) {
    var lista = FALAS[tipo] || [''];
    var i, tent = 0;
    do { i = Math.floor(Math.random() * lista.length); tent++; } while (lista.length > 1 && i === ultimo[tipo] && tent < 10);
    ultimo[tipo] = i;
    return lista[i].replace(/\{nome\}/g, nome());
  };

  /* ---------- balão ---------- */
  // quem fala: sem opcoes.quem é o Claude; com quem, nome/retrato/voz da personagem
  var fila = [], aberto = null, animTimer = null, quadros = null;

  function montar() {
    var bal = U.$('#claude-balao');
    if (bal) return bal;
    var tela = PA.paraDOM(PA.claude(0), 4, 'claude-avatar');
    bal = U.el('div#claude-balao', { role: 'status', 'aria-live': 'polite', hidden: true },
      U.el('div.claude-mascote', tela, U.el('span.claude-nome', 'Claude')),
      U.el('div.claude-fala',
        U.el('p.claude-texto'),
        U.el('div.claude-extra', { hidden: true }),
        U.el('div.claude-acoes',
          U.el('button.btn-ouvir-claude', { type: 'button', 'aria-label': 'Ouvir o Claude', text: '🔊' }),
          U.el('button.btn-ok-claude', { type: 'button', text: 'Ok! 👍' }))));
    document.body.appendChild(bal);
    bal.querySelector('.btn-ouvir-claude').addEventListener('click', function () { if (aberto) Reino.Som.falar(aberto.fala || aberto.texto, { voz: vozDe(aberto) }); });
    bal.querySelector('.claude-acoes').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-valor]');
      if (!b || !aberto) return;
      Reino.Som.tocar('toque'); fechar(b.dataset.valor);
    });
    // teclado no balão MODAL: Enter/Espaço acionam o botão focado (ou o principal); Esc aciona o "não" ou fecha
    window.addEventListener('keydown', function (e) {
      if (!aberto || e.repeat) return;
      // campo de texto em foco ou tela por cima: o teclado é deles
      var at = document.activeElement;
      if (at && at.matches && at.matches('input, textarea, select, [contenteditable], [contenteditable] *')) return;
      if (Reino.UI && Reino.UI.temTela && Reino.UI.temTela()) return;
      // Esc fecha qualquer balão aberto (o "não", se houver): sem isso, quem joga só com o teclado ficava
      // com o balão de boas-vindas aberto para sempre (e a pergunta surpresa esperando por ele)
      if (e.key === 'Escape') {
        var nao = bal.querySelector('.claude-acoes button[data-valor="nao"]');
        e.preventDefault(); e.stopPropagation();
        if (nao) nao.click(); else fechar();
        return;
      }
      if (!aberto.modal || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); e.stopPropagation();
      var alvo = bal.contains(document.activeElement) && document.activeElement.matches('.claude-acoes button') ? document.activeElement : principal(bal);
      if (alvo) alvo.click();
    }, true);
    // piscar de vez em quando
    var q = 0;
    animTimer = setInterval(function () {
      q = (q + 1) % 16;
      var c = bal.querySelector('canvas.claude-avatar');
      if (!c || bal.hidden) return;
      var spr = quadros ? quadros[q === 0 && quadros[1] ? 1 : 0] : PA.claude(q === 0 ? 1 : 0).canvas;
      var ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(spr, 0, 0);
    }, 220);
    return bal;
  }

  function principal(bal) {
    return bal.querySelector('.claude-acoes .btn-dialogo.principal') || bal.querySelector('.claude-acoes .btn-dialogo') || bal.querySelector('.btn-ok-claude');
  }

  function vozDe(item) { return item.voz || (item.quem && item.quem.voz) || 'claude'; }

  // retrato: Claude (padrão) ou o da personagem, ampliado nítido
  function porRetrato(bal, quem) {
    var velho = bal.querySelector('canvas.claude-avatar');
    var r = quem && quem.retrato;
    quadros = r ? (Array.isArray(r) ? r : [r]) : null;
    if (!quadros && !bal.classList.contains('com-quem')) return;
    var src = quadros ? quadros[0] : PA.claude(0).canvas;
    var novo = PA.paraDOM(src, quadros ? PA.escalaNitida(Math.min(72, src.width * 4), src.width) : 4, 'claude-avatar');
    velho.replaceWith(novo);
  }

  function porBotoes(bal, item) {
    var acoes = bal.querySelector('.claude-acoes');
    var ouvir = acoes.querySelector('.btn-ouvir-claude');
    ouvir.setAttribute('aria-label', 'Ouvir ' + (item.quem ? U.semEn(item.quem.nome) : 'o Claude'));
    while (ouvir.nextSibling) acoes.removeChild(ouvir.nextSibling);
    if (!item.botoes) {
      acoes.appendChild(U.el('button.btn-ok-claude', { type: 'button', text: 'Ok! 👍', 'data-valor': 'ok' }));
      return item.modal ? acoes.querySelector('.btn-ok-claude') : null;
    }
    var foco = null;
    item.botoes.forEach(function (b) {
      var bt = U.el('button.btn-dialogo' + (b.principal ? '.principal' : ''), { type: 'button', text: b.texto, 'data-valor': b.valor });
      acoes.appendChild(bt);
      if (b.principal && !foco) foco = bt;
    });
    return foco || acoes.querySelector('.btn-dialogo');
  }

  function mostrar(item) {
    var bal = montar();
    aberto = item;
    porRetrato(bal, item.quem);
    bal.classList.toggle('com-quem', !!item.quem);
    bal.classList.toggle('com-botoes', !!item.botoes);
    U.preencher(bal.querySelector('.claude-nome'), item.quem ? item.quem.nome : 'Claude');
    U.preencher(bal.querySelector('.claude-texto'), item.texto);
    var extra = bal.querySelector('.claude-extra');
    extra.innerHTML = '';
    if (item.extra) extra.appendChild(item.extra);
    extra.hidden = !item.extra;
    var foco = porBotoes(bal, item);
    bal.setAttribute('role', item.modal ? 'dialog' : 'status');
    document.body.classList.toggle('com-dialogo', !!item.modal);
    bal.classList.toggle('dica-pressa', item.tipo === 'pressa');
    bal.hidden = false;
    bal.classList.remove('entrando'); void bal.offsetWidth; bal.classList.add('entrando');
    if (foco) try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); }
    if (item.falar !== false) Reino.Som.falar(item.fala || item.texto, { voz: vozDe(item) });
    clearTimeout(item.timer);
    if (item.tempo) item.timer = setTimeout(fechar, item.tempo);
  }
  function fechar(valor) {
    var bal = U.$('#claude-balao');
    if (!aberto) return;
    var item = aberto;
    clearTimeout(item.timer);
    aberto = null;
    if (bal) bal.hidden = true;
    document.body.classList.remove('com-dialogo');
    Reino.Som.calar();
    if (item.resolver) item.resolver(typeof valor === 'string' ? valor : null);
    if (fila.length) setTimeout(function () { if (!aberto && fila.length) mostrar(fila.shift()); }, 180);
  }

  // Claude.falar('texto', {tipo, tempo, falar, fala: [segmentos], voz, agora, quem, botoes, extra, modal}) -> Promise<valor do botão | null>
  C.falar = function (texto, opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolver) {
      var item = { texto: texto, fala: opcoes.fala, voz: opcoes.voz, tipo: opcoes.tipo, tempo: opcoes.tempo || 0, falar: opcoes.falar, resolver: resolver,
        quem: opcoes.quem || null, botoes: opcoes.botoes && opcoes.botoes.length ? opcoes.botoes : null, extra: opcoes.extra || null, modal: !!opcoes.modal };
      if (opcoes.agora && aberto) { fila.unshift(item); fechar(); return; }
      // modal passa na frente de um balão comum, para ela não sair andando
      if (item.modal && aberto && !aberto.modal) { fechar(); mostrar(item); return; }
      if (aberto) fila.push(item); else mostrar(item);
    });
  };
  C.fechar = function () { fechar(); };
  C.aberto = function () { return !!aberto; };
  C.dialogoAberto = function () { return !!(aberto && aberto.modal); };
  C.quemFala = function () { return aberto ? aberto.quem : null; };
  C.limpar = function () {
    // itens novos (quem/botões/modal) descartados resolvem null; os antigos seguem sem resolver, como antes
    fila.forEach(function (it) { if (it.quem || it.botoes || it.modal) it.resolver(null); });
    fila = []; fechar();
  };

  /* ---------- ritmo das dicas ---------- */
  var missoesDesdeDica = 0, inicioSessao = Date.now(), ultimaPausa = Date.now();
  C.depoisDaMissao = function () {
    missoesDesdeDica++;
    if (Date.now() - ultimaPausa > 15 * 60 * 1000) {
      ultimaPausa = Date.now();
      return C.falar(C.frase('pausa'));
    }
    if (missoesDesdeDica >= 2) {
      missoesDesdeDica = 0;
      return C.falar(C.frase('dica'));
    }
    return Promise.resolve();
  };
  C.tempoDeSessao = function () { return Date.now() - inicioSessao; };

  Reino.Claude = C;
})();
