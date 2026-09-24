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
  function agora() { return Date.now(); }
  function est() { return Reino.Progresso.estado(); }   // a mescla troca o objeto: sempre ler de novo

  /* ---------- o que o Claude fala (todas gravadas no pacote geral) ---------- */
  // frases de 3+ palavras, curtas, emoji só com ícone em pixel (js/icones.js)
  var NUMERO = { 1: 'uma estrela', 2: 'duas estrelas', 3: 'três estrelas' };
  function valendo() { return NUMERO[cfg().estrelas] || cfg().estrelas + ' estrelas'; }
  S.frases = function () {
    return {
      abertura: [
        'Oba, uma pergunta surpresa! Leia com calma. ✨',
        'Pergunta surpresa! Vamos ver se você lembra? ⭐',
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
    // o elogio do acerto vem de Reino.Claude.frase('acerto'), já gravado pelo banco do Claude
    return lista;
  };
  var ultimaFrase = {};
  function sortearFrase(lista, tipo) {
    var i, tent = 0;
    do { i = Math.floor(Math.random() * lista.length); tent++; } while (lista.length > 1 && i === ultimaFrase[tipo] && tent < 10);
    ultimaFrase[tipo] = i;
    return lista[i];
  }

  /* ---------- perguntas ---------- */
  var usadas = {};      // chave -> true (só na memória: sem repetir na mesma sessão)
  var guardada = null;  // a próxima pergunta já sorteada (proximaPergunta() e abrir() mostram a mesma)
  function chave(p) { return p.materia.id + '|' + p.sala.id + '|' + p.desafio.id; }

  // todas as perguntas possíveis: só das salas (nunca das provas), só dos tipos combinados, sem `livre`
  function todas() {
    var tipos = cfg().tipos, lista = [];
    (Reino.materias || []).forEach(function (m) {
      (m.salas || []).forEach(function (s) {
        (s.desafios || []).forEach(function (d) {
          if (tipos.indexOf(d.tipo) < 0 || d.livre) return;
          lista.push({ materia: m, sala: s, desafio: d });
        });
      });
    });
    return lista;
  }
  function salaFeita(salaId) {
    var e = Reino.Progresso && Reino.Progresso.estado ? est() : null;
    var x = e && e.salas && e.salas[salaId];
    return !!(x && x.feita);
  }
  // de preferência das salas que ela já fez; acabou: as outras; acabou tudo: recomeça
  function candidatas() {
    var lista = todas();
    if (!lista.length) return [];
    var novas = lista.filter(function (p) { return !usadas[chave(p)]; });
    if (!novas.length) { usadas = {}; novas = lista; }
    var feitas = novas.filter(function (p) { return salaFeita(p.sala.id); });
    return feitas.length ? feitas : novas;
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
  function ativo() {
    if (!iniciado) return false;
    if (typeof document !== 'undefined' && document.hidden) return false;
    return agora() - ultimoToque < semToqueMs();
  }
  // no mapa ou dentro de uma construção, sem tela, diálogo, transição nem balão do Claude
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
    if (forcado) { if (livre()) abrir(); return; }
    if (!ligado()) { livreDesde = null; return; }
    var pode = ativo() && livre();
    if (!venceu) {
      if (pode) contado += dt;
      if (contado >= alvo) { venceu = true; livreDesde = pode ? t : null; }
      return;
    }
    // venceu: espera esperaLivreMs seguidos de livre
    if (!pode) { livreDesde = null; return; }
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
    if (!abrindo && livre()) abrir();
    return f.promessa;
  };

  /* ---------- painel ---------- */
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function abrir() {
    if (abrindo || painelAberto) return;
    var p = S.proximaPergunta();
    var pedido = forcado;
    if (!p) {
      if (pedido) { forcado = null; pedido.resolver(null); }
      sortearTempo();
      return;
    }
    abrindo = true;
    // carrega o pacote de voz da sala (para o 🔊 ler a pergunta); no máximo 4 s de espera
    Promise.race([Reino.Voz.carregarSala(p.materia, p.sala), esperar(4000)]).then(function () {
      abrindo = false;
      // no meio da espera ela entrou numa porta, abriu uma tela...: espera de novo
      if (!livre() || painelAberto) { livreDesde = null; return; }
      if (!pedido && !ligado()) return;
      if (forcado === pedido) forcado = null;
      usadas[chave(p)] = true;
      guardada = null;
      mostrar(p);
      if (pedido) pedido.resolver(painelAberto.info);
    });
  }

  function reduzMovimento() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  // o Claude com escala inteira de pixel da tela (nítido): menor no celular, sem transform fracionário
  function claudeNitido() {
    var spr = PA.claude(0), src = spr.canvas || spr;
    var alvo = (window.innerWidth <= 480 ? 2 : 3) * src.width;
    return PA.paraDOM(spr, PA.escalaNitida(alvo, src.width), 'surpresa-claude');
  }

  function mostrar(p) {
    var U = Reino.util, el = U.el, UI = Reino.UI, D = Reino.Desafios, d = p.desafio;
    var fase = 'pergunta', ctrl = null;
    var info = { materia: p.materia.id, sala: p.sala.id, desafio: d.id, tipo: d.tipo };
    var resultado = null;

    Reino.Claude.limpar();
    var pn = UI.painel('surpresa', '❓ Pergunta surpresa', { aoFechar: function () { soltar(); terminar(resultado || 'agoraNao'); } });
    painelAberto = { info: info, pn: pn, encerrar: function () { soltar(); terminar(resultado || 'agoraNao'); } };
    vigiarTelas();
    pn.tela.setAttribute('aria-label', 'Pergunta surpresa');

    var abertura = sortearFrase(S.frases().abertura, 'abertura');
    var vale = S.frases().vale;
    var cabeca = el('div.surpresa-cabeca',
      claudeNitido(),
      el('div.surpresa-balao',
        el('p.surpresa-fala', abertura),
        el('p.surpresa-vale', vale)));
    var origem = el('p.surpresa-origem', p.materia.emoji + ' ' + p.materia.nome + ' • ' + p.sala.nome);

    var btnConferir = el('button.btn-grande.btn-principal.surpresa-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
    var btnDepois = el('button.btn-grande.btn-secundario.surpresa-depois', { type: 'button' }, 'Agora não');
    // os botões ficam num rodapé fixo do painel: sempre à vista, mesmo com a pergunta rolando
    var botoes = el('footer.surpresa-botoes', btnDepois, btnConferir);

    ctrl = D.render(d, { modo: 'surpresa', onMudar: function () { btnConferir.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
    var retorno = el('div.surpresa-retorno', { hidden: true, 'aria-live': 'polite' });

    pn.conteudo.classList.add('surpresa-conteudo');
    pn.conteudo.appendChild(cabeca);
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

    btnDepois.addEventListener('click', function () { Reino.Som.tocar('toque'); fechar(); });

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
      var elogio = Reino.Claude.frase('acerto');
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
      retorno.hidden = false;
      setTimeout(function () {
        okBtn.disabled = false;
        okBtn.focus();
      }, OK_TRAVA_MS);
      setTimeout(function () {
        if (retorno.scrollIntoView) retorno.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' });
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
  // encerra do mesmo jeito, sem estrelas, senão a surpresa ficaria "aberta" para sempre
  var vigiando = false;
  function vigiarTelas() {
    if (vigiando || !Reino.util || !Reino.util.on) return;
    vigiando = true;
    Reino.util.on('telas', function () {
      if (painelAberto && !painelAberto.pn.tela.parentNode) painelAberto.encerrar();
    });
  }

  // em todos os casos (acerto, erro, "Agora não" ou ✕): sorteia o próximo tempo
  var ultimoResultado = null;
  function terminar(res) {
    if (!painelAberto) return;
    ultimoResultado = { resultado: res, pergunta: painelAberto.info };
    painelAberto = null;
    sortearTempo();
    ultimoTique = agora();
  }

  // para os testes: como terminou a última pergunta
  S._ultimo = function () { return ultimoResultado; };
  // para os testes: o tempo sorteado e o tempo livre já contado
  S._depurar = function () {
    return { iniciado: iniciado, ligado: ligado(), alvo: alvo, contado: contado, venceu: venceu, livreDesde: livreDesde, aberta: !!painelAberto, pergunta: painelAberto ? painelAberto.info : null, usadas: Object.keys(usadas).length };
  };

  Reino.Surpresa = S;
})();
