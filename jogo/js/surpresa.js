/* Pergunta surpresa (Reino.Surpresa) — CONTRATOS-NOVIDADES.md, seção 5.
   De tempos em tempos (3 a 10 minutos de jogo LIVRE) aparece um painel com o Claude e uma
   pergunta das salas, valendo 2 estrelas no acerto de primeira.
   O relógio só conta com ela livre: depois de iniciar (e do tutorial da primeira vez), com o
   interruptor ligado, aba visível, toque ou tecla nos últimos 5 minutos, no mapa ou dentro de
   uma construção e sem balão do Claude aberto. Venceu com ela ocupada: espera ficar livre por
   alguns segundos seguidos e só então aparece. Nunca no meio de sala, treino, prova, tela,
   diálogo ou transição.
   Nada aqui toca em DOM, Progresso, Cena ou document no carregamento: ferramentas/listar-falas.js
   carrega este arquivo num vm sem DOM. Nada vai para o save nem para o localStorage: a lista de
   perguntas já feitas vale só para esta sessão. */
(function () {
  var S = {};

  function cfg() { return Reino.config.surpresa; }
  // relógio monotônico: o relógio do aparelho voltando (ajuste manual, NTP) não trava nem adianta
  // a espera; performance.now() também é o que o relógio falso do Playwright controla
  function agora() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function est() { return Reino.Progresso.estado(); }   // a mescla troca o objeto: sempre ler de novo

  /* ---------- o que o Claude fala (todas gravadas no pacote geral) ---------- */
  // frases de 3+ palavras, curtas, emoji só com ícone em pixel (js/icones.js)
  var NUMERO = { 1: 'uma estrela', 2: 'duas estrelas', 3: 'três estrelas' };
  function valendo() { return NUMERO[cfg().estrelas] || cfg().estrelas + ' estrelas'; }
  S.frases = function () {
    return {
      abertura: [
        'Oba, uma pergunta surpresa! Leia com calma. ✨',
        'Uma pergunta surpresa! Vamos ver se você lembra? ⭐',
        'Hora da pergunta surpresa! Sem pressa, tá? 💛',
      ],
      vale: 'Se acertar, você ganha ' + valendo() + '! ⭐',
      ganhou: 'Você ganhou ' + valendo() + '! ⭐',
      erro: [
        'Tudo bem errar! Agora você já sabe essa. 💛',
        'Não foi dessa vez, e está tudo bem! Olha a explicação. 📌',
      ],
    };
  };
  S.falas = function () {
    var f = S.frases(), lista = [];
    f.abertura.forEach(function (t) { lista.push({ texto: t, voz: 'claude' }); });
    lista.push({ texto: f.vale, voz: 'claude' });
    lista.push({ texto: f.ganhou, voz: 'claude' });
    f.erro.forEach(function (t) { lista.push({ texto: t, voz: 'claude' }); });
    // o elogio do acerto vem do banco do Claude (FALAS.acerto), já gravado: ver elogioAcerto()
    return lista;
  };
  // elogio do acerto: só os que servem para qualquer matéria (sem "historiadora" numa pergunta de Inglês)
  var SO_DE_UMA_MATERIA = /historiador/i;
  function elogioAcerto() {
    var C = Reino.Claude, todas = (C && C.FALAS && C.FALAS.acerto) || [];
    var lista = todas.filter(function (t) { return !SO_DE_UMA_MATERIA.test(t); });
    if (!lista.length) return C.frase('acerto');
    return sortearFrase(lista, 'acerto').replace(/\{nome\}/g, Reino.config.nomeJogadora);
  }
  var ultimaFrase = {};
  function sortearFrase(lista, tipo) {
    var i, tent = 0;
    do { i = Math.floor(Math.random() * lista.length); tent++; } while (lista.length > 1 && i === ultimaFrase[tipo] && tent < 10);
    ultimaFrase[tipo] = i;
    return lista[i];
  }

  /* ---------- perguntas ---------- */
  var usadas = {};      // chave -> true (só na memória: sem repetir na mesma sessão)
  var adiadas = {};     // chave -> ordem do "Agora não": a pergunta volta, mas para o fim da fila
  var nAdiadas = 0, ultimaChave = null;
  var guardada = null;  // a próxima pergunta já sorteada (proximaPergunta() e abrir() mostram a mesma)
  function chave(p) { return p.materia.id + '|' + p.sala.id + '|' + p.desafio.id; }

  // todas as perguntas possíveis: só das salas (nunca das provas), só dos tipos combinados, sem `livre`
  // (as matérias não mudam durante o jogo: a lista é montada uma vez)
  var cacheTodas = null;
  function todas() {
    if (cacheTodas && cacheTodas.materias === Reino.materias) return cacheTodas.lista;
    var tipos = cfg().tipos, lista = [];
    (Reino.materias || []).forEach(function (m) {
      (m.salas || []).forEach(function (s) {
        (s.desafios || []).forEach(function (d) {
          if (tipos.indexOf(d.tipo) < 0 || d.livre) return;
          lista.push({ materia: m, sala: s, desafio: d });
        });
      });
    });
    cacheTodas = { materias: Reino.materias, lista: lista };
    return lista;
  }
  function salaFeita(salaId) {
    var e = Reino.Progresso && Reino.Progresso.estado ? est() : null;
    var x = e && e.salas && e.salas[salaId];
    return !!(x && x.feita);
  }
  // só das salas que ela já fez (nenhuma feita: nenhuma pergunta, a surpresa não aparece)
  function dasFeitas() { return todas().filter(function (p) { return salaFeita(p.sala.id); }); }
  // primeiro as que ainda não vieram; depois as que ela adiou com "Agora não" (a mais antiga
  // primeiro); acabou tudo: recomeça pelas das salas feitas, sem repetir a última que apareceu
  function candidatas() {
    var lista = dasFeitas();
    if (!lista.length) return [];
    var novas = lista.filter(function (p) { return !usadas[chave(p)]; });
    var frescas = novas.filter(function (p) { return adiadas[chave(p)] === undefined; });
    if (frescas.length) return frescas;
    if (novas.length) {
      var velha = novas.reduce(function (a, b) { return adiadas[chave(b)] < adiadas[chave(a)] ? b : a; });
      return [velha];
    }
    usadas = {}; adiadas = {};
    var semUltima = lista.filter(function (p) { return chave(p) !== ultimaChave; });
    return semUltima.length ? semUltima : lista;
  }
  S.proximaPergunta = function () {
    var lista = candidatas();
    if (!lista.length) return null;
    if (guardada) {
      var k = chave(guardada);
      if (lista.some(function (p) { return chave(p) === k; })) return guardada;
    }
    guardada = lista[Math.floor(Math.random() * lista.length)];
    return guardada;
  };

  /* ---------- relógio de jogo livre ---------- */
  var iniciado = false, esperandoTutorial = false, relogio = null, ultimoTique = 0, ultimoToque = 0;
  var alvo = 0, contado = 0, venceu = false, livreDesde = null;
  var forcado = null;          // { resolver } quando __reino.surpresa() pediu
  var abrindo = false, painelAberto = null;

  function ligado() {
    var e = Reino.Progresso && Reino.Progresso.estado ? est() : null;
    return !(e && e.ajustes && e.ajustes.surpresa === false);
  }
  function semToqueMs() { var c = Reino.config.cuidados; return (c && c.semToqueMs) || 5 * 60 * 1000; }
  function visivel() { return !(typeof document !== 'undefined' && document.hidden); }
  function ativo() {
    if (!iniciado || !visivel()) return false;
    return agora() - ultimoToque < semToqueMs();
  }
  // andando até algum lugar (porta, objeto, ponto tocado no chão) ou com as setas: ela termina o que começou
  function andando() {
    var J = typeof window !== 'undefined' ? window.Jogador : null;
    return !!(J && ((J.caminho && J.caminho.length) || J.aoChegar || J.andando));
  }
  // no mapa ou dentro de uma construção, sem tela, diálogo, transição nem balão do Claude.
  // Andando conta como livre (o tempo corre); só a abertura espera ela parar.
  function livre() {
    var cena = Reino.Cena && Reino.Cena.estado ? Reino.Cena.estado() : 'mapa';
    if (cena !== 'mapa' && cena !== 'interior') return false;
    return !(Reino.Claude && Reino.Claude.aberto && Reino.Claude.aberto());
  }
  function sortearTempo() {
    var c = cfg(), min = c.minMinutos * 60000, max = c.maxMinutos * 60000;
    alvo = Math.round(min + Math.random() * (max - min));
    contado = 0; venceu = false; livreDesde = null;
  }

  function tique() {
    var t = agora();
    var dt = Math.max(0, Math.min(5000, t - ultimoTique));   // aba que volta do fundo não dá salto
    ultimoTique = t;
    if (painelAberto || abrindo) return;
    // pedido do debug: assim que ela estiver livre (sem esperar os segundos)
    if (forcado) { if (livre() && !andando() && visivel()) abrir(); return; }
    if (!ligado()) { livreDesde = null; return; }
    // nenhuma sala feita: não há pergunta para fazer, o relógio fica parado
    if (!dasFeitas().length) { livreDesde = null; return; }
    // o tempo conta também com ela andando; só a ABERTURA espera ela parar (ver andando())
    var pode = ativo() && livre();
    if (!venceu) {
      if (pode) contado += dt;
      if (contado >= alvo) { venceu = true; livreDesde = pode && !andando() ? t : null; }
      return;
    }
    // venceu: espera esperaLivreMs seguidos de livre e parada
    if (!pode || andando()) { livreDesde = null; return; }
    if (livreDesde === null) livreDesde = t;
    if (t - livreDesde >= cfg().esperaLivreMs) abrir();
  }
  function ligarRelogio() {
    if (relogio) return;
    ultimoTique = agora();
    relogio = setInterval(tique, 1000);
  }

  var OK_TRAVA_MS = 600;
  var TUTORIAL_LIVRE_MS = 10000, TUTORIAL_MAX_MS = 2 * 60000;
  // main.js chama no fim de entrarNoReino; tutorial = Promise da 1ª vez (ou null)
  S.iniciar = function (opcoes) {
    opcoes = opcoes || {};
    if (iniciado || esperandoTutorial) return;
    function comecar() {
      esperandoTutorial = false;
      iniciado = true;
      vigiarTelas();
      ultimoToque = agora();   // o próprio "Entrar no Reino" conta como toque
      sortearTempo();
      ligarRelogio();
    }
    var op = { capture: true, passive: true };
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function () { ultimoToque = agora(); }, op);
    });
    if (opcoes.tutorial && typeof opcoes.tutorial.then === 'function') {
      // o relógio começa quando o tutorial acabar. Mas a promessa pode nunca resolver
      // (Claude.limpar() descarta sem resolver os balões comuns da fila, e salas, treinos e
      // provas chamam limpar()): então começa também quando ela ficar TUTORIAL_LIVRE_MS seguidos
      // livre e sem balão, ou no máximo TUTORIAL_MAX_MS depois de entrar (o que vier primeiro).
      esperandoTutorial = true;
      var inicio = agora(), livreTut = null, vigia = null;
      var pronto = function () {
        if (!esperandoTutorial) return;
        if (vigia) clearInterval(vigia);
        comecar();
      };
      opcoes.tutorial.then(pronto, pronto);
      vigia = setInterval(function () {
        var t = agora();
        if (livre()) { if (livreTut === null) livreTut = t; } else livreTut = null;
        if ((livreTut !== null && t - livreTut >= TUTORIAL_LIVRE_MS) || t - inicio >= TUTORIAL_MAX_MS) pronto();
      }, 1000);
    } else comecar();
  };

  S.restante = function () {
    if (!iniciado || !ligado()) return null;
    if (venceu) return 0;
    return Math.max(0, alvo - contado);
  };
  S.aberta = function () { return !!painelAberto; };

  // debug: sorteia e mostra agora (se ela estiver ocupada, assim que ficar livre).
  // A promessa resolve quando o painel ABRE (não quando fecha), com { materia, sala, desafio, tipo }
  // (ids), ou null se não houver pergunta. Com o painel já aberto, resolve na hora com o dele.
  S.forcar = function () {
    if (painelAberto) return Promise.resolve(painelAberto.info);
    if (forcado) return forcado.promessa;
    var f = {};
    f.promessa = new Promise(function (r) { f.resolver = r; });
    forcado = f;
    ligarRelogio();
    // com uma abertura já carregando, é ela que resolve este pedido (abrir() lê `forcado` no fim)
    if (!abrindo && livre() && !andando() && visivel()) abrir();
    return f.promessa;
  };

  /* ---------- painel ---------- */
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function abrir() {
    if (abrindo || painelAberto) return;
    var p = S.proximaPergunta();
    if (!p) {
      var semPergunta = forcado;
      if (semPergunta) { forcado = null; semPergunta.resolver(null); }
      sortearTempo();
      return;
    }
    abrindo = true;
    // carrega o pacote de voz da sala (para o 🔊 ler a pergunta); no máximo 4 s de espera
    Promise.race([Reino.Voz.carregarSala(p.materia, p.sala), esperar(4000)]).then(function () {
      abrindo = false;
      // o pedido do debug é o que estiver pendente AGORA (pode ter chegado durante o carregamento)
      var pedido = forcado;
      // no meio da espera ela entrou numa porta, abriu uma tela, escondeu a aba...: espera de novo
      if (!livre() || andando() || !visivel() || painelAberto) { livreDesde = null; return; }
      if (!pedido && (!ligado() || !ativo() || !venceu)) { livreDesde = null; return; }
      forcado = null;
      usadas[chave(p)] = true;
      ultimaChave = chave(p);
      guardada = null;
      mostrar(p);
      if (pedido) pedido.resolver(painelAberto.info);
    });
  }

  function reduzMovimento() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  // celular em pé ou deitado: mesmo corte do @media compacto de css/novidades.css
  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  // o Claude com escala inteira de pixel da tela (nítido): menor no celular, sem transform fracionário
  function claudeNitido() {
    var spr = PA.claude(0), src = spr.canvas || spr;
    var alvo = (compacto() ? 2 : 3) * src.width;
    return PA.paraDOM(spr, PA.escalaNitida(alvo, src.width), 'surpresa-claude');
  }

  function mostrar(p) {
    var U = Reino.util, el = U.el, UI = Reino.UI, D = Reino.Desafios, d = p.desafio;
    var fase = 'pergunta', ctrl = null;
    var info = { materia: p.materia.id, sala: p.sala.id, desafio: d.id, tipo: d.tipo };
    var resultado = null;

    Reino.Claude.limpar();
    // ela podia estar andando até uma porta: para ali, senão entraria sozinha ao fechar a pergunta
    var J = window.Jogador;
    if (J && J.parar) J.parar();
    var pn = UI.painel('surpresa', '❓ Pergunta surpresa', { aoFechar: function () { soltar(); terminar(resultado || 'agoraNao'); } });
    painelAberto = { info: info, pn: pn, encerrar: function () { soltar(); terminar(resultado || 'agoraNao'); } };
    vigiarTelas();
    pn.tela.setAttribute('aria-label', 'Pergunta surpresa');
    // ela não abriu a surpresa por um botão: ao fechar, o foco vai para o mapa (UI.fecharTela sem
    // _focoAntes), nunca de volta ao botão do HUD que estava focado (o Espaço abriria o Estábulo)
    pn.tela._focoAntes = null;

    var abertura = sortearFrase(S.frases().abertura, 'abertura');
    var vale = S.frases().vale;
    var cabeca = el('div.surpresa-cabeca',
      claudeNitido(),
      el('div.surpresa-balao',
        el('p.surpresa-fala', abertura),
        el('p.surpresa-vale', vale)));
    var origem = el('p.surpresa-origem', p.materia.emoji + ' ' + p.materia.nome + ' • ' + p.sala.nome);
    // no celular (CSS compacto) o balão e a origem dão lugar a uma linha só: Claude, matéria e o prêmio;
    // a frase de abertura e o "se acertar..." continuam na voz
    var curta = el('div.surpresa-curta',
      claudeNitido(),
      el('p.surpresa-curta-materia', el('span', p.materia.emoji), el('span.surpresa-curta-nome', ' ' + p.materia.nome)),
      el('p.surpresa-curta-vale', '+' + cfg().estrelas + ' ⭐'));

    var btnConferir = el('button.btn-grande.btn-principal.surpresa-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
    var btnDepois = el('button.btn-grande.btn-secundario.surpresa-depois', { type: 'button' }, 'Agora não');
    // os botões ficam num rodapé fixo do painel: sempre à vista, mesmo com a pergunta rolando
    var botoes = el('footer.surpresa-botoes', btnDepois, btnConferir);

    ctrl = D.render(d, { modo: 'surpresa', onMudar: function () { btnConferir.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
    var retorno = el('div.surpresa-retorno', { hidden: true, 'aria-live': 'polite' });

    // compacto: o 🔊 Ouvir sobe para a linha curta (economiza uma linha inteira antes das alternativas)
    var ouvir = ctrl.card.querySelector('.btn-ouvir');
    if (ouvir && compacto()) curta.insertBefore(ouvir, curta.lastChild);

    pn.conteudo.classList.add('surpresa-conteudo');
    pn.conteudo.appendChild(cabeca);
    pn.conteudo.appendChild(curta);
    pn.conteudo.appendChild(origem);
    pn.conteudo.appendChild(ctrl.card);
    pn.conteudo.appendChild(retorno);
    pn.card.appendChild(botoes);

    Reino.Som.tocar('porta');
    Reino.Som.falar([abertura, vale], { voz: 'claude' });
    setTimeout(function () {
      var primeira = ctrl.card.querySelector('.opcao');
      if (primeira && fase === 'pergunta') primeira.focus({ preventScroll: true });   // o Claude continua à vista
    }, 60);

    // Esc = "Agora não" (ou fecha, depois da resposta); só com este painel por cima de tudo
    function aoTeclar(e) {
      if (e.key !== 'Escape' || !pn.tela.parentNode || document.querySelector('#telas > .tela:last-child') !== pn.tela) return;
      e.preventDefault(); fechar();
    }
    document.addEventListener('keydown', aoTeclar);
    // tocar fora do cartão (no fundo escuro) NÃO fecha a pergunta: só o ✕, "Agora não" e Esc.
    // Captura no document: roda antes do ouvinte de fundo que o UI.painel põe na tela.
    function foraDoCartao(e) { if (e.target === pn.tela) e.stopPropagation(); }
    document.addEventListener('click', foraDoCartao, true);

    btnDepois.addEventListener('click', function () { if (btnDepois.disabled) return; Reino.Som.tocar('toque'); fechar(); });
    // "Agora não" e ✕ travados nos primeiros OK_TRAVA_MS: um toque no menu do celular no instante em
    // que o painel abre (o "Agora não" fica em cima de Lugares e Estábulo) não fecha a pergunta sem
    // ela ver. O Esc continua valendo.
    var btnX = pn.card.querySelector('.btn-fechar');
    btnDepois.disabled = true;
    if (btnX) btnX.disabled = true;
    setTimeout(function () { btnDepois.disabled = false; if (btnX) btnX.disabled = false; }, OK_TRAVA_MS);

    btnConferir.addEventListener('click', function () {
      if (fase !== 'pergunta' || !ctrl.pronto()) return;
      fase = 'resposta';
      ctrl.travado = true;
      var ok = D.pontuar(d, ctrl.valor()) === 1;
      resultado = ok ? 'acerto' : 'erro';
      Array.prototype.forEach.call(ctrl.card.querySelectorAll('button.opcao'), function (b) { b.setAttribute('aria-disabled', 'true'); });
      if (ok) acertou(); else errou();
    });

    function acertou() {
      var n = cfg().estrelas;
      Reino.Progresso.ganharEstrelas(n);
      Reino.Progresso.salvar();
      if (UI.atualizarHUD) UI.atualizarHUD();
      ctrl.marcarCerto();
      Reino.Som.tocar('acerto');
      setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
      if (!reduzMovimento()) UI.confete(24);
      var elogio = elogioAcerto();
      var ganhou = S.frases().ganhou;
      mostrarRetorno(true, '✨ Isso! +' + n + ' ⭐', elogio, ganhou);
      Reino.Som.falar([elogio, ganhou], { voz: 'claude' });
    }

    function errou() {
      if (ctrl.revelar) ctrl.revelar(); else ctrl.marcarCerto();
      Reino.Som.tocar('erro');
      var fala = sortearFrase(S.frases().erro, 'erro');
      mostrarRetorno(false, '💭 Quase!', fala, null);
      Reino.Som.falar([fala], { voz: 'claude' });
    }

    function mostrarRetorno(ok, titulo, fala, extra) {
      retorno.innerHTML = '';
      retorno.className = 'surpresa-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
      // o enunciado de novo, curto, em cima: a explicação não fica solta quando o painel rola até aqui
      retorno.appendChild(el('p.surpresa-eco', '❓ ' + D.enunciado(d)));
      retorno.appendChild(el('div.retorno-cabeca',
        claudeNitido(),
        el('div',
          el('h3', titulo),
          el('p.retorno-fala', fala),
          extra ? el('p.surpresa-ganhou', extra) : null)));
      if (!ok) retorno.appendChild(el('p.surpresa-certa', D.linhaCerta(d)));
      if (d.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + d.explica));
      // o "Ok!" nasce no lugar do "Conferir": fica travado por OK_TRAVA_MS para um toque duplo
      // no "Conferir" não fechar o resultado antes de ela ler (principalmente a explicação do erro)
      var okBtn = el('button.btn-grande.btn-principal.surpresa-ok', { type: 'button', disabled: true }, 'Ok! 👍');
      okBtn.addEventListener('click', function () { if (okBtn.disabled) return; Reino.Som.tocar('toque'); fechar(); });
      botoes.innerHTML = '';
      botoes.appendChild(okBtn);
      // o cabeçalho de abertura sai: o retorno do Claude fica no lugar dele
      cabeca.hidden = true;
      curta.hidden = true;
      retorno.hidden = false;
      setTimeout(function () {
        okBtn.disabled = false;
        okBtn.focus();
      }, OK_TRAVA_MS);
      setTimeout(function () {
        // rola até o COMEÇO do resultado (o enunciado repetido); se assim a explicação ficar abaixo
        // da dobra (celular deitado), rola mais até ela aparecer inteira: antes do Ok destravar
        var c = pn.conteudo, cr = c.getBoundingClientRect(), rr = retorno.getBoundingClientRect();
        var fim = (retorno.querySelector('.retorno-explica') || retorno.lastChild).getBoundingClientRect();
        var topo = c.scrollTop + rr.top - cr.top - 8, ateExplica = c.scrollTop + fim.bottom - cr.bottom + 8;
        // sem passar do começo da explicação (letras grandes no celular deitado: ela não cabe inteira)
        var inicioExplica = c.scrollTop + fim.top - cr.top - 8;
        var alvo = Math.max(0, Math.min(Math.max(topo, ateExplica), Math.max(topo, inicioExplica)));
        if (c.scrollTo) c.scrollTo({ top: alvo, behavior: reduzMovimento() ? 'auto' : 'smooth' }); else c.scrollTop = alvo;
      }, 60);
    }

    function soltar() { document.removeEventListener('keydown', aoTeclar); document.removeEventListener('click', foraDoCartao, true); }
    function fechar() {
      soltar();
      Reino.Som.calar();
      UI.fecharTela(pn.tela);
      terminar(resultado || 'agoraNao');
    }
  }

  // painel fechado por fora dos botões (UI.fecharTodas(), outra tela fechando a pilha...):
  // encerra do mesmo jeito, sem estrelas, senão a surpresa ficaria "aberta" para sempre.
  // E estudo terminado (sala, treino ou prova: telas 'missao' e 'prova'): a contagem recomeça do
  // zero, com um tempo novo de 3 a 10 min, para a surpresa não cair logo depois de ela estudar.
  var vigiando = false, estudando = false;
  function telaDeEstudo() { return !!document.querySelector('#telas > .tela-missao, #telas > .tela-prova'); }
  function vigiarTelas() {
    if (vigiando || !Reino.util || !Reino.util.on) return;
    vigiando = true;
    Reino.util.on('telas', function () {
      if (painelAberto && !painelAberto.pn.tela.parentNode) painelAberto.encerrar();
      if (telaDeEstudo()) estudando = true;
      else if (estudando) {
        estudando = false;
        if (iniciado && !painelAberto) sortearTempo();
      }
    });
  }

  // em todos os casos (acerto, erro, "Agora não" ou ✕): sorteia o próximo tempo
  var ultimoResultado = null;
  function terminar(res) {
    if (!painelAberto) return;
    // "Agora não" (ou ✕, Esc): a pergunta não se perde, volta para o fim da fila
    if (res === 'agoraNao') {
      var i = painelAberto.info, k = i.materia + '|' + i.sala + '|' + i.desafio;
      delete usadas[k];
      adiadas[k] = ++nAdiadas;
    }
    ultimoResultado = { resultado: res, pergunta: painelAberto.info };
    painelAberto = null;
    sortearTempo();
    ultimoTique = agora();
  }

  // para os testes: como terminou a última pergunta
  S._ultimo = function () { return ultimoResultado; };
  // para os testes: o tempo sorteado e o tempo livre já contado
  S._depurar = function () {
    return { iniciado: iniciado, ligado: ligado(), estudando: estudando, andando: andando(), alvo: alvo, contado: contado, venceu: venceu, livreDesde: livreDesde, aberta: !!painelAberto, pergunta: painelAberto ? painelAberto.info : null, usadas: Object.keys(usadas).length, adiadas: Object.keys(adiadas).length, possiveis: dasFeitas().length };
  };

  Reino.Surpresa = S;
})();
