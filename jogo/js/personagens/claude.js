/* Claude, o mascote guia: elogios, dicas de calma para a prova e lembretes. */
(function () {
  var U = Reino.util;
  var C = {};
  // {nome} e o gênero ({campeã|campeão}) de quem joga: Reino.Genero (sistemas/genero.js)

  var FALAS = {
    boasVindas: [
      'Oi, {nome}! Que bom te ver! Vamos passear pelo Reino?',
      'Olá, {nome}! Seu unicórnio estava com saudade de você! 🦄',
      'Oba, {a|o} {nome} chegou! Vamos descobrir os cantinhos do Reino!',
    ],
    acerto: [
      'Isso, {nome}! Você leu com calma e acertou! ✨',
      'Uau! Resposta certinha! 🦄',
      'Que orgulho! Você pensou direitinho.',
      'Acertou! Seu unicórnio está pulando de alegria!',
      'Muito bem! Ler com atenção funciona mesmo!',
      'Perfeito! Você é {uma ótima estudante|um ótimo estudante}! ⭐',
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
      'Opa! {Toda campeã|Todo campeão} erra às vezes. Você consegue!',
    ],
    pressa: [
      'Ei, {nome}! Leu tudinho? Lê mais uma vez com o dedinho 👀',
      'Opa, foi rapidinho! Que tal ler a pergunta de novo, com calma?',
      'Devagarinho se vai longe! Confere mais uma vez antes de responder. 🐢',
      'Lembra: aqui não tem relógio! Lê de novo com calma e depois confere.',
    ],
    dica: [
      'Sabia? Quem termina a prova primeiro não ganha medalha. Quem ACERTA é que ganha! 🥇',
      'A medalha de ouro da escola vale 2.500 Robux! E ela vem das respostas certas, não da pressa. 💛',
      'Os campeões revisam a prova do começo ao fim antes de entregar.',
      'O tempo da prova é todo seu. Terminar por último está tudo bem!',
      'Na prova, leia cada pergunta duas vezes: uma para entender e outra para ter certeza.',
      'A prova não é uma corrida! Cada um tem o seu tempo, e está tudo bem.',
      'Se sobrar tempo na prova, use para revisar. É aí que a gente encontra os errinhos!',
      'Antes de começar a prova, respira fundo três vezes. O cérebro fica tranquilo e lembra melhor.',
      'Terminar por último é coisa de {campeã|campeão}! 🏆',
      'Seu unicórnio fica orgulhoso quando você lê com calma. 🦄',
      'Quem acerta com calma ganha o ouro. Quem corre pode errar bobeira. Qual você prefere?',
    ],
    curiosidade: [
      'Em breve teremos novos conteúdos do quarto bimestre!',
    ],
    pausa: [
      'Você está estudando há um tempinho! Que tal beber água e esticar os braços? 💧',
      'Hora de uma pausinha! Levanta, dá três pulinhos e volta. 🐰',
      'Seu cérebro trabalhou muito! Descansa os olhinhos um pouquinho olhando pela janela. 🌤️',
    ],
    fimSala: [
      'Você é incrível, {nome}! 🎉',
      'Mais uma sala! O Reino está ficando todo iluminado por sua causa!',
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
    return Reino.Genero.texto(lista[i]);
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
          U.el('button.btn-ouvir-claude.livre-na-fala', { type: 'button', 'aria-label': 'Ouvir o Claude', text: '🔊' }),
          U.el('button.btn-ok-claude', { type: 'button', text: 'Ok! 👍' }))));
    document.body.appendChild(bal);
    if (window.ResizeObserver) new ResizeObserver(medirAltura).observe(bal);   // a fala cresce (Letras grandes, ícone)
    window.addEventListener('resize', medirAltura);
    bal.querySelector('.btn-ouvir-claude').addEventListener('click', function () { if (!aberto) return; var segs = aberto.fala || aberto.texto, op = { voz: vozDe(aberto) }; if (Reino.UI && Reino.UI.ouvirDeNovo) Reino.UI.ouvirDeNovo(segs, op); else Reino.Som.falar(segs, op); });
    bal.querySelector('.claude-acoes').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-valor]');
      if (!b || !aberto || b.disabled) return;
      if (b.dataset.valor === PAGINA) { Reino.Som.tocar('toque'); virarPagina(bal, aberto); return; }
      // toque de dedo/mouse (não o Enter): o próximo balão nasce no mesmo lugar, e o 2º toque de um toque
      // duplo pulava a página sem ela ler (ou apertava o "Ok! 👍"/"Vamos!"). A guarda do ui/base.js segura
      // os toques perto deste por um instante; toque noutro lugar e o teclado valem na hora.
      if (e.isTrusted && e.detail && Reino.UI && Reino.UI.segurarToques) Reino.UI.segurarToques();
      Reino.Som.tocar('toque'); fechar(b.dataset.valor);
    });
    // teclado no balão (sem tela por cima): Tab fica preso no balão com botões; Esc fecha qualquer
    // balão (pelo "não", se houver); Enter/Espaço, só no modal, acionam o botão focado (ou o principal)
    window.addEventListener('keydown', function (e) {
      if (!aberto || e.repeat) return;
      // campo de texto em foco ou tela por cima: o teclado é deles
      var at = document.activeElement;
      if (at && at.matches && at.matches('input, textarea, select, [contenteditable], [contenteditable] *')) return;
      if (Reino.UI && Reino.UI.temTela && Reino.UI.temTela()) return;
      // Tab fica dentro do balão com botões (senão o foco escapava para o HUD atrás dele)
      if (e.key === 'Tab' && (aberto.modal || aberto.botoes)) {
        var bts = Array.prototype.filter.call(bal.querySelectorAll('button'), function (b) { return !b.disabled && b.offsetParent !== null; });
        if (bts.length) {
          var i = bts.indexOf(document.activeElement);
          var prox = e.shiftKey ? (i <= 0 ? bts.length - 1 : i - 1) : (i < 0 || i === bts.length - 1 ? 0 : i + 1);
          e.preventDefault(); e.stopPropagation();
          try { bts[prox].focus({ preventScroll: true }); } catch (x) { bts[prox].focus(); }
        }
        return;
      }
      // ouvir antes de seguir (só com config.esperaFala.travar): enquanto a fala toca, Esc/Enter/Espaço não fazem nada
      // (o 🔊 focado segue livre: Enter/Espaço nele repetem a fala)
      var noOuvir = at && at.classList && at.classList.contains('livre-na-fala') && bal.contains(at);
      if (aberto.esperando && (e.key === 'Escape' || (!noOuvir && (e.key === 'Enter' || e.key === ' ')))) {
        e.preventDefault(); e.stopPropagation();
        return;
      }
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
      // boca aberta (quadros[2]) em quadros alternados enquanto a voz toca; parada sem animação (D4-17)
      var boca = quadros && quadros[2] && q % 2 && Reino.Voz && Reino.Voz.falando && Reino.Voz.falando() && !U.reduzMovimentoSistema && !document.body.classList.contains('sem-animacao');
      var spr = quadros ? quadros[q === 0 && quadros[1] ? 1 : boca ? 2 : 0] : PA.claude(q === 0 ? 1 : 0).canvas;
      var ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(spr, 0, 0);
    }, 220);
    return bal;
  }

  function principal(bal) {
    return bal.querySelector('.claude-acoes .btn-dialogo.principal') || bal.querySelector('.claude-acoes .btn-dialogo') || bal.querySelector('.btn-ok-claude');
  }

  // foco no botão só se a última entrada foi o teclado (no toque, nada contornado)
  function porTeclado() { return !!(Reino.UI && Reino.UI.porTeclado && Reino.UI.porTeclado()); }
  function vozDe(item) { return item.voz || (item.quem && item.quem.voz) || 'claude'; }

  // retrato: Claude (padrão) ou o da personagem, ampliado nítido. Personagem (Claude, e o N.retrato de NPC e ET) a 4 px
  // CSS por pixel, o mesmo para todos (ui.md §10.10.6); outro retrato (objeto, unicórnio) a 4 até 21 px, senão a 2
  function escalaRetrato(src) { return src.personagem || Math.max(src.width, src.height) <= 21 ? 4 : 2; }
  function porRetrato(bal, quem) {
    var velho = bal.querySelector('canvas.claude-avatar');
    var r = quem && quem.retrato;
    quadros = r ? (Array.isArray(r) ? r : [r]) : null;
    if (!quadros && !bal.classList.contains('com-quem')) return;
    var src = quadros ? quadros[0] : PA.claude(0).canvas;
    var novo = PA.paraDOM(src, escalaRetrato(src), 'claude-avatar');
    velho.replaceWith(novo);
  }

  function porBotoes(bal, item) {
    var acoes = bal.querySelector('.claude-acoes');
    var ouvir = acoes.querySelector('.btn-ouvir-claude');
    ouvir.setAttribute('aria-label', 'Ouvir ' + (item.quem ? U.semEn(item.quem.nome) : 'o Claude'));
    while (ouvir.nextSibling) acoes.removeChild(ouvir.nextSibling);
    bal.classList.toggle('com-botoes', !!item.botoes || meioDaFala(item));
    if (meioDaFala(item)) {   // página que não é a última: só o "Continuar →" (e o 🔊)
      acoes.appendChild(U.el('button.btn-dialogo.principal', { type: 'button', text: 'Continuar →', 'data-valor': PAGINA }));
      return acoes.querySelector('.btn-dialogo');
    }
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

  /* páginas (D5-02): no celular (e com Letras grandes em qualquer tamanho), a fala do Claude que passa de 4 linhas
     (5 fora do celular) aparece em pedaços de até 4 linhas com "Continuar →" (npcs-e-dialogo.md §10.1); o áudio é
     o da frase inteira, uma vez só. Linhas medidas no próprio balão (a letra e a largura reais); o menor número de
     páginas que cabe, pedaços parecidos (nenhum abaixo de 40 % do maior), cortados numa frase perto do alvo ou
     numa palavra. NPC (quem) não pagina aqui: as falas dele já vêm curtas */
  var LINHAS_PAGINA = 4, PAGINA = '__pagina';
  function celular() { return !!(window.matchMedia && window.matchMedia('(max-width: 480px)').matches); }
  function paginavel() { return celular() || document.documentElement.classList.contains('letras-grandes'); }
  function linhasDe(bal, t) {
    var el = bal.querySelector('.claude-texto');
    U.preencherColado(el, t);
    return Math.round(el.scrollHeight / (parseFloat(getComputedStyle(el).lineHeight) || 24));
  }
  // corte em n pedaços: cada alvo = o que sobra / páginas que faltam; frase a até 30 % do alvo, senão a palavra mais perto
  function dividir(t, n) {
    var pags = [], resto = t;
    for (var k = 0; k < n - 1; k++) {
      var alvo = resto.length / (n - k), melhor = -1, dist = Infinity, re = /[.!?…]["”]?\s/g, m;
      while ((m = re.exec(resto))) { var d = Math.abs(m.index + 1 - alvo); if (d <= alvo * 0.3 && d < dist) { dist = d; melhor = m.index + m[0].length - 1; } }
      if (melhor < 0) for (var i = 0; i < resto.length; i++) if (resto[i] === ' ' && Math.abs(i - alvo) < dist) { dist = Math.abs(i - alvo); melhor = i; }
      if (melhor <= 0) break;
      pags.push(resto.slice(0, melhor).trim());
      resto = resto.slice(melhor).trim();
    }
    pags.push(resto);
    return pags;
  }
  // no celular com Letras grandes e uma tela aberta, 3 linhas: a tela acima do balão fica com espaço (D5-01)
  function linhasPagina() { return celular() && document.documentElement.classList.contains('letras-grandes') && Reino.UI && Reino.UI.temTela && Reino.UI.temTela() ? 3 : LINHAS_PAGINA; }
  function paginar(bal, t) {
    t = String(t).trim();
    var LINHAS_PAGINA = linhasPagina();
    var total = linhasDe(bal, t);
    if (total <= LINHAS_PAGINA + (celular() ? 0 : 1)) return null;
    var pags = null;
    for (var n = Math.ceil(total / LINHAS_PAGINA); n <= total; n++) {
      pags = dividir(t, n);
      var tam = pags.map(function (p) { return p.length; });
      if (pags.every(function (p) { return linhasDe(bal, p) <= LINHAS_PAGINA; }) && Math.min.apply(null, tam) >= 0.4 * Math.max.apply(null, tam)) break;
    }
    return pags && pags.length > 1 ? pags : null;
  }
  function meioDaFala(item) { return !!(item.paginas && item.pag < item.paginas.length - 1); }
  function porTexto(bal, item) {
    var t = item.paginas ? item.paginas[item.pag] : item.texto;
    U.preencherColado(bal.querySelector('.claude-texto'), t);   // emoji, número e "Sala N" colados (ui.md §10.17)
    var extra = bal.querySelector('.claude-extra');
    extra.innerHTML = '';
    var comExtra = item.extra && !meioDaFala(item);
    if (comExtra) extra.appendChild(item.extra);
    extra.hidden = !comExtra;
    return porBotoes(bal, item);
  }
  function virarPagina(bal, item) {
    item.pag++;
    var foco = porTexto(bal, item);
    if (foco && porTeclado()) try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); }
    medirAltura();
    contarTempo(item);
  }
  // balão com tempo: cada página tem o tempo inteiro; acabou numa página do meio, vira; na última, fecha
  function contarTempo(item) {
    clearTimeout(item.timer);
    if (item.tempo) item.timer = setTimeout(function () { if (aberto !== item) return; if (meioDaFala(item)) virarPagina(U.$('#claude-balao'), item); else fechar(); }, item.tempo);
  }

  /* área útil (D10-B03, ui.md §10.18): --balao-altura no :root = do topo do balão (com a aba do nome) ao pé da
     tela, 0 fechado; a câmera e as telas leem. body.balao-no-pe (D5-01): com uma tela aberta, o balão desce
     para o pé e a tela encolhe para acima dele (ui-telas.css) */
  var alturaAntes = -1;
  function medirAltura() {
    var bal = U.$('#claude-balao'), h = 0;
    if (bal && !bal.hidden) {
      var r = bal.getBoundingClientRect(), nome = bal.querySelector('.claude-nome'), topo = r.top;
      if (nome) topo = Math.min(topo, nome.getBoundingClientRect().top);
      h = Math.max(0, Math.ceil(window.innerHeight - topo));
    }
    if (h === alturaAntes) return;
    alturaAntes = h;
    document.documentElement.style.setProperty('--balao-altura', h + 'px');
  }
  function porLugar() {
    var noPe = !!(aberto && Reino.UI && Reino.UI.temTela && Reino.UI.temTela());
    document.body.classList.toggle('balao-no-pe', noPe);
    medirAltura();
  }
  // nome que não cabe numa linha na largura do balão: um degrau abaixo (ui.md §10.17.3), nunca quebra (D5-11)
  function porNome(bal, item) {
    var nome = bal.querySelector('.claude-nome');
    U.preencher(nome, item.quem ? item.quem.nome : 'Claude');
    nome.classList.remove('nome-aux');
    if (nome.scrollWidth > bal.clientWidth) nome.classList.add('nome-aux');
  }

  function mostrar(item) {
    var bal = montar();
    aberto = item;
    porRetrato(bal, item.quem);
    bal.classList.toggle('com-quem', !!item.quem);
    item.pag = 0;
    item.paginas = null;
    if (!item.quem && typeof item.texto === 'string' && paginavel()) {
      // mede com o balão montado e invisível (a largura real, com retrato e padding)
      bal.style.visibility = 'hidden'; bal.hidden = false;
      item.paginas = paginar(bal, item.texto);
      bal.style.visibility = '';
    }
    var foco = porTexto(bal, item);
    bal.setAttribute('role', item.modal ? 'dialog' : 'status');
    if (item.modal) bal.setAttribute('aria-modal', 'true'); else bal.removeAttribute('aria-modal');
    document.body.classList.toggle('com-dialogo', !!item.modal);
    bal.classList.toggle('dica-pressa', item.tipo === 'pressa');
    bal.hidden = false;
    porNome(bal, item);
    porLugar();
    bal.classList.remove('entrando'); void bal.offsetWidth; bal.classList.add('entrando');
    if (foco && porTeclado()) try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); }
    if (item.falar !== false) falarNoBalao(bal, item, foco);
    contarTempo(item);
  }
  // balão que espera resposta (sem `tempo`): com config.esperaFala.travar, os botões (menos o 🔊) só liberam
  // quando a fala acaba; sem ela (o padrão), a fala toca e ela responde ou fecha quando quiser (fechar cala a voz)
  function falarNoBalao(bal, item, foco) {
    var segs = item.fala || item.texto, op = { voz: vozDe(item) };
    if (item.tempo || !Reino.UI || !Reino.UI.esperarFala || !Reino.config.esperaFala.travar) { Reino.Som.falar(segs, op); return; }
    item.esperando = true;
    Reino.UI.esperarFala(bal.querySelector('.claude-acoes'), segs, op).then(function () {
      item.esperando = false;
      if (aberto === item && foco && foco.isConnected && porTeclado()) try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); }
    });
  }
  function fechar(valor) {
    var bal = U.$('#claude-balao');
    if (!aberto) return;
    var item = aberto;
    clearTimeout(item.timer);
    aberto = null;
    if (bal) bal.hidden = true;
    document.body.classList.remove('com-dialogo');
    porLugar();
    Reino.Som.calar();
    if (item.resolver) item.resolver(typeof valor === 'string' ? valor : null);
    if (fila.length) setTimeout(seguirFila, 180);
  }

  // Claude.falar('texto', {tipo, tempo, falar, fala: [segmentos], voz, agora, quem, botoes, extra, modal}) -> Promise<valor do botão | null>
  // todo balão passa por aqui: {nome} e gênero ({campeã|campeão}) de quem joga, no texto e na fala (a voz acha pelo texto)
  function pronto(t) { return typeof t === 'string' ? Reino.Genero.texto(t) : Array.isArray(t) ? t.map(pronto) : t; }
  C.falar = function (texto, opcoes) {
    opcoes = opcoes || {};
    return new Promise(function (resolver) {
      var item = { texto: pronto(texto), fala: pronto(opcoes.fala), voz: opcoes.voz, tipo: opcoes.tipo, tempo: opcoes.tempo || 0, falar: opcoes.falar, resolver: resolver,
        quem: opcoes.quem || null, botoes: opcoes.botoes && opcoes.botoes.length ? opcoes.botoes : null, extra: opcoes.extra || null, modal: !!opcoes.modal };
      if (opcoes.agora && aberto) { fila.unshift(item); fechar(); return; }
      // modal passa na frente de um balão comum, para ela não sair andando
      if (item.modal && aberto && !aberto.modal) { fechar(); mostrar(item); return; }
      if (aberto) fila.push(item);
      else if (festaAberta() && !item.modal) { fila.push(item); esperarFesta(); }
      else mostrar(item);
    });
  };
  // O-02: com uma tela de festa aberta (o ovo chocando e o "Nasceu!"), o balão comum espera na fila até ela fechar
  var TELAS_FESTA = '.tela-ovo', esperando = false;
  function festaAberta() { return typeof document !== 'undefined' && !!document.querySelector(TELAS_FESTA); }
  function esperarFesta() { esperando = true; }
  function seguirFila() {
    if (aberto || !fila.length) return;
    if (festaAberta() && !fila[0].modal) { esperarFesta(); return; }
    mostrar(fila.shift());
  }
  U.on(Reino.EVENTOS.TELAS, porLugar);
  U.on(Reino.EVENTOS.TELAS, function () {
    if (!esperando || festaAberta()) return;
    esperando = false;
    setTimeout(seguirFila, 180);
  });
  C.fechar = function () { fechar(); };
  C.aberto = function () { return !!aberto; };
  C.dialogoAberto = function () { return !!(aberto && aberto.modal); };
  C.textoAberto = function () { return aberto ? aberto.texto : null; };   // a fala inteira (com páginas, só uma aparece)
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
