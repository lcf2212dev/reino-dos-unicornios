/* Bosque dos Fantasmas e as outras arenas: a pergunta de cada terço do nível e o prêmio (docs/contratos/bosque.md §5 e
   §7, arenas.md). Ouve Reino.EVENTOS.BOSQUE { tipo: 'vencido', id, fantasma, arena? } e chama
   Reino.Bosque.abater(fantasma, arena): o placar e o XP sobem e, a cada terço da barra do nível, a pergunta abre; ao
   fechar a barra, também o nível. Fora do Bosque, o emoji da arena e as falas sem fantasma. A fila processa um vencido por
   vez, esperando as telas fecharem: pergunta (se o terço fechou e há pergunta pendente) → BosqueCombate.devolver(id)
   → nível (UI.subirNivelBosque(n, undefined, abate.premioNivel)). A pergunta vem de Reino.Bosque.pergunta()
   ({ materia, sala, desafio }), no card de Reino.Desafios.render como o desafio do ET (ui/et-desafio.js): o Claude
   fala `vencido`, a narradora lê a pergunta, Conferir → certo: Bosque.acertou (1 estrela, Aura e UM móvel surpresa
   para a casa), fala `acerto`, a estrela voa até o HUD e o texto "🎁 Um presente para a casa!"; no fechar, o baú do
   presente (UI.bauBosque, ui/bosque-bau.js) abre antes de resolver. Errado: Bosque.errou (consome a pergunta, sem
   baú), falas `erro`, a resposta certa à vista e "Tentar de novo": a mesma pergunta em branco até acertar (pedido do
   Leandro, 07/11: a pergunta da batalha só fecha depois de acertada; sem ✕, Esc nem toque fora). Acertar na nova
   tentativa só fecha: o prêmio é da 1ª. SEM limite de tempo. Todo tipo da sala (digitar, ligar, completar, tabela, desenho…), no modo 'prova':
   uma tentativa só, sem o texto ou o desenho guardado da sala já preenchido (Reino.Producoes); conferir é só
   D.pontuar === 1 (o ctrl.conferir da sala grava a produção e ensina a refazer). Errou: o tipo com ctrl.revelar
   mostra a certa no próprio controle; os outros ficam como ela deixou e a certa vem por escrito. Sem pergunta no
   bimestre, consome a pendente sem tela (Bosque.consumirPergunta). Na entrada no Bosque e quando não há tela, a
   pergunta que ficou pendente (fechou o jogo no meio) é recuperada com id null. UI.perguntaFantasma(f) →
   Promise<'certo'|'errado'|'depois'>. Estilos: css/ui-bosque.css.
   Contexto: a pergunta sai da sala, sem o resumo que vem antes dela. O texto de apoio (d.apoio) e a figura (d.figura)
   já vêm no card do Desafios.render; o texto-base, a tabela e as figuras do enunciado ficam na carta do livro
   (d.livro, a página do livro da sala): ela vem acima da pergunta, aberta (UI.desenharCarta, como o resumo da sala). */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI, EV = Reino.EVENTOS;
  var TRAVA_MS = 600;

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  function reduzMovimento() { return !!U.reduzMovimentoSistema; }

  function perguntaFantasma(f) {
    var B = Reino.Bosque, D = Reino.Desafios, Fa = Reino.BosqueFalas, q = B && B.pergunta();
    var devolver = function () { if (Reino.BosqueCombate && Reino.BosqueCombate.devolver) Reino.BosqueCombate.devolver(f && f.id, f && f.arena); };
    var arenaId = (f && f.arena) || (B && B.arenaAtual && B.arenaAtual()) || 'bosque';
    var ar = Reino.Arenas && Reino.Arenas.def(arenaId), emoji = (ar && ar.emoji) || '👻';
    var falas = function (k) { return Fa.de ? Fa.de(k, arenaId) : Fa[k]; };
    if (!q) {
      // bimestre sem pergunta: a pendente é consumida sem tela (senão ela voltaria em toda entrada no Bosque)
      if (B && B.consumirPergunta) B.consumirPergunta();
      devolver();
      return Promise.resolve('depois');
    }
    if (!D) { devolver(); return Promise.resolve('depois'); }
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      if (Reino.Claude && Reino.Claude.limpar) Reino.Claude.limpar();
      var fase = 'pergunta', ctrl = null, resultado = null, premio = null, materiaId = q.materia.id, acertou = false;
      // sem ✕, Esc nem toque fora: só fecha depois de acertar (o Continuar do acerto)
      var pn = UI.painel('bosque-pergunta', emoji + ' Hora da pergunta!', { curto: emoji + ' Pergunta!', semFechar: true });
      pn.tela._bosqueAtual = function () { return q; };   // a pergunta na tela (testes)

      var fala = el('p.bosque-fala');
      var cabeca = el('div.bosque-cabeca', PA.iconeEmoji(emoji, compacto() ? 2 : 3), fala);
      var area = el('div.bosque-area');
      var retorno = el('div.bosque-retorno', { hidden: true });
      var btn = el('button.btn-grande.btn-conferir.bosque-botao', { type: 'button', disabled: true }, 'Conferir ✓');
      pn.conteudo.appendChild(cabeca);
      pn.conteudo.appendChild(area);
      pn.conteudo.appendChild(retorno);
      pn.card.appendChild(el('footer.bosque-botoes', btn));

      // o Claude fala (texto no balão; no celular, só a última frase)
      function dizer(linhas) {
        U.preencher(fala, compacto() ? linhas[linhas.length - 1] : linhas.join(' '));
        return Promise.resolve(Reino.Som.falar(linhas, { voz: 'claude' })).catch(function () {});
      }

      // a página do livro da pergunta (o texto-base do grupo: quanto Alice tem, qual é a compra…)
      function contexto() {
        var c = Reino.cartaAvulsa(q.materia, q.desafio);   // a `livro` do desafio ou a do `avulsa.carta`
        if (!c || !UI.desenharCarta) return null;
        var carta = el('div.livro-carta.bosque-carta');
        UI.desenharCarta(carta, c, q.materia);
        return el('details.bosque-contexto', { open: true }, el('summary', el('b', '📖 Leia antes')), carta);
      }

      function mostrar(ler) {
        var ctx = contexto();
        if (ctx) area.appendChild(ctx);
        desenhar(ler);
      }
      // o controle da pergunta (de novo em branco a cada tentativa) e a leitura dela
      function desenhar(ler) {
        if (ctrl && ctrl.card && ctrl.card.parentNode) ctrl.card.parentNode.removeChild(ctrl.card);
        ctrl = D.render(q.desafio, { modo: 'prova', onMudar: function () { btn.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
        area.appendChild(ctrl.card);
        btn.disabled = !ctrl.pronto();
        var c = ctrl, d = q.desafio;
        // o pacote de voz da sala antes de ler (como o ET e a surpresa); no máximo 4 s de espera
        var voz = Reino.Voz && Reino.Voz.carregarSala
          ? Promise.race([Reino.Voz.carregarSala(q.materia, q.sala), new Promise(function (r) { setTimeout(r, 4000); })]) : null;
        Promise.all([ler, voz]).then(function () {
          if (c === ctrl && fase === 'pergunta' && pn.tela.isConnected) Reino.Som.falar(Reino.Falas.segmentosDesafio(d, c.ordem), { voz: 'narradora' });
        });
        // teclado: o foco no 1º controle da resposta (botão, caixa de texto, prancheta)
        setTimeout(function () { if (fase === 'pergunta' && pn.tela.isConnected) UI.focarTroca(ctrl.el, null, 0); }, 60);
      }

      function conferir() {
        if (fase !== 'pergunta' || !ctrl.pronto()) return;
        fase = 'resposta';
        ctrl.travado = true;
        var ok = D.pontuar(q.desafio, ctrl.valor()) === 1;
        travar();
        U.preencher(retorno, '');
        if (resultado) return conferirDeNovo(ok);
        retorno.className = 'bosque-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
        Reino.Som.calar();
        if (ok) {
          var r = B.acertou(materiaId);
          resultado = 'certo';
          premio = r.presente;
          acertou = true;
          ctrl.marcarCerto();
          Reino.Som.tocar('acerto');
          setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
          var certa = ctrl.card.querySelector('.certa');
          UI.festa(1, { som: false, item: certa });   // acerto: nível 1 (arte.md §16)
          var selo = el('h3', '✨ +' + r.estrelas + ' ⭐');
          retorno.appendChild(selo);
          if (premio) retorno.appendChild(el('p.bosque-presente', '🎁 Um presente para a casa!'));
          retorno.hidden = false;
          if (UI.estrelaVoa) UI.estrelaVoa(selo); else if (UI.atualizarHUD) UI.atualizarHUD();
          dizer([U.sortear(Fa.acerto, 'bosque:acerto')]);
        } else {
          B.errou(materiaId);
          resultado = 'errado';
          if (ctrl.revelar) ctrl.revelar();
          Reino.Som.tocar('erro');
          retorno.appendChild(el('h3', '💭 Quase!'));
          retorno.appendChild(el('p.surpresa-certa', D.linhaCerta(q.desafio)));
          dizer(falas('erro'));
        }
        if (q.desafio.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + q.desafio.explica));
        retorno.hidden = false;
        botaoDepois(ok ? 'Continuar →' : 'Tentar de novo');
      }

      // nova tentativa depois do erro: certo fecha (sem prêmio: ele é da 1ª); errado mostra a certa e tenta de novo
      function conferirDeNovo(ok) {
        retorno.className = 'bosque-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
        Reino.Som.calar();
        if (ok) {
          acertou = true;
          ctrl.marcarCerto();
          Reino.Som.tocar('acerto');
          retorno.appendChild(el('h3', '✨ Isso! Agora você acertou!'));
        } else {
          if (ctrl.revelar) ctrl.revelar();
          Reino.Som.tocar('erro');
          retorno.appendChild(el('h3', '💭 Quase!'));
          retorno.appendChild(el('p.surpresa-certa', D.linhaCerta(q.desafio)));
        }
        if (q.desafio.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + q.desafio.explica));
        retorno.hidden = false;
        botaoDepois(ok ? 'Continuar →' : 'Tentar de novo');
      }

      // o botão depois de conferir: Continuar (acertou) ou Tentar de novo
      function botaoDepois(rotulo) {
        U.preencher(btn, rotulo);
        // o botão novo nasce travado: um toque duplo no Conferir não fecha sem ver a resposta
        btn.disabled = true;
        setTimeout(function () { btn.disabled = false; if (pn.tela.isConnected && UI.porTeclado()) btn.focus(); }, TRAVA_MS);
        setTimeout(function () { if (retorno.scrollIntoView) retorno.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' }); }, 60);
      }

      // respondida: nada mais muda (os tipos de toque olham ctrl.travado; as caixas de texto ficam só de leitura)
      function travar() {
        var c = ctrl.el;
        Array.prototype.forEach.call(c.querySelectorAll('button.opcao'), function (b) { b.setAttribute('aria-disabled', 'true'); });
        Array.prototype.forEach.call(c.querySelectorAll('input, textarea'), function (x) { x.readOnly = true; });
        Array.prototype.forEach.call(c.querySelectorAll('.acentos button'), function (b) { b.disabled = true; });
        // o teclado da tela fecha, para a resposta aparecer (pelo teclado físico, o foco vai para o Continuar)
        var a = document.activeElement;
        if (a && c.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) a.blur();
      }

      // fechou (Continuar, ✕, Esc, fora): sem resposta conta como erro; devolve o fantasma; no acerto, o baú do móvel
      var acabou = false;
      function terminar() {
        if (acabou) return;
        acabou = true;
        if (!resultado) { B.errou(materiaId); resultado = 'depois'; }
        devolver();
        if (UI.atualizarHUD) UI.atualizarHUD();
        var bau = premio && UI.bauBosque
          ? UI.bauBosque({ chave: premio.chave, movel: premio.movel, titulo: 'Presente da pergunta!' })
          : Promise.resolve();
        bau.then(function () { resolver(resultado); }, function () { resolver(resultado); });
      }

      btn.addEventListener('click', function (e) {
        if (btn.disabled) return;
        Reino.Som.tocar('toque');
        if (fase === 'pergunta') return conferir();
        if (!acertou) {   // Tentar de novo: a mesma pergunta em branco, o "Leia antes" continua acima
          fase = 'pergunta';
          retorno.hidden = true;
          U.preencher(btn, 'Conferir ✓');
          Reino.Som.calar();
          desenhar(Promise.resolve());
          return;
        }
        if (e.isTrusted && e.detail) UI.segurarToques();
        Reino.Som.calar();
        UI.fecharTela(pn.tela);
        terminar();
      });

      aberta = { tela: pn.tela, fim: terminar };
      Reino.Som.tocar('porta');
      mostrar(dizer(falas('vencido')));
    });
  }

  // a tela saiu da pilha sem o Continuar (UI.fecharTodas, troca de cena): resolve do mesmo jeito (senão a fila trava);
  // sem resposta conta como erro
  var aberta = null;
  U.on(EV.TELAS, function () { if (aberta && Reino._ui.pilha.indexOf(aberta.tela) < 0) { var a = aberta; aberta = null; a.fim(); } });

  /* ---------- a fila dos vencidos, um por vez ---------- */
  var fila = [], andando = false;
  function bloqueado() { return !!(Reino.Cena && Reino.Cena.bloqueado && Reino.Cena.bloqueado()); }
  // abre a pergunta sempre que há terço pendente (o `abate` só é usado para os prêmios e o nível)
  function temPergunta() {
    var B = Reino.Bosque;
    return !!(B && B.perguntasPendentes && B.perguntasPendentes() > 0);
  }
  function devolverUltimo(item) {
    if (Reino.BosqueCombate && Reino.BosqueCombate.devolver) Reino.BosqueCombate.devolver(item && item.id, item && item.arena);
  }
  // pergunta → devolver o fantasma → nível novo (com o baú do móvel que o abate já gravou)
  function processar(item) {
    var p = temPergunta() ? perguntaFantasma(item) : Promise.resolve('depois');
    return p.catch(function (e) { console.warn('bosque, pergunta:', e); }).then(function () {
      devolverUltimo(item);
      if (item && item.abate && item.abate.subiu && UI.subirNivelBosque) {
        return UI.subirNivelBosque(item.abate.subiu, undefined, item.abate.premioNivel)
          .catch(function (e) { console.warn('bosque, nível:', e); });
      }
    });
  }
  function proximo() {
    if (andando || !fila.length) return;
    // outra tela por cima (o prêmio, o ponto, o baú) ou a íris/diálogo: espera fechar
    if (UI.temTela() || bloqueado()) return;
    andando = true;
    // depois do prêmio, outra pergunta que tenha ficado pendente (save mesclado/crash) entra na fila
    processar(fila.shift()).then(function () { andando = false; recuperar(); setTimeout(proximo, 0); });
  }
  // a pergunta que ficou pendente (fechou o jogo no meio): recupera com id null, só dentro de uma arena e com a espada
  function recuperar() {
    if (andando || fila.length || UI.temTela() || bloqueado()) return;
    var B = Reino.Bosque;
    if (!B || !B.naArena || !B.naArena() || !B.perguntasPendentes || B.perguntasPendentes() <= 0) return;
    if (B.temEspada && !B.temEspada()) return;   // a tela da espada da 1ª entrada vem primeiro
    if (!B.pergunta()) {   // bimestre sem pergunta: consome as pendentes sem abrir tela
      while (B.perguntasPendentes() > 0 && B.consumirPergunta && B.consumirPergunta()) {}
      return;
    }
    fila.push({ id: null, abate: null, arena: B.arenaAtual() });
    proximo();
  }

  U.on(EV.BOSQUE, function (e) {
    if (!e || e.tipo !== 'vencido') return;
    var B = Reino.Bosque, abate = B && B.abater ? B.abater(e.fantasma, e.arena) : null;
    fila.push({ id: e.id || null, abate: abate, arena: e.arena || null });
    proximo();
  });
  U.on(EV.TELAS, function (n) { if (!n) setTimeout(function () { recuperar(); proximo(); }, 0); });
  U.on(EV.CENA, function (m) { if (m && Reino.Arenas && Reino.Arenas.def(m.para)) setTimeout(recuperar, 0); });
  // a íris/diálogo acabou: o que estava esperando a cena liberar pode abrir
  U.on(EV.TRANSICAO, function (comecou) { if (!comecou) setTimeout(function () { recuperar(); proximo(); }, 0); });
  U.on(EV.OCUPADA, function (motivo) { if (!motivo) setTimeout(function () { recuperar(); proximo(); }, 0); });

  UI.perguntaFantasma = perguntaFantasma;
})();
