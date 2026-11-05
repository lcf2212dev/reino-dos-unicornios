/* Bosque dos Fantasmas: a pergunta do bloco de 10 inimigos mortos e o prêmio (docs/contratos/bosque.md §5 e §7).
   Ouve Reino.EVENTOS.BOSQUE { tipo: 'vencido', id, fantasma } e chama Reino.Bosque.abater(fantasma): o placar de
   mortos sobe (a mosca conta 2) e, a cada 10, a pergunta abre; a cada 30, o nível. A fila processa um vencido por
   vez, esperando as telas fecharem: pergunta (se o bloco fechou e há pergunta pendente) → BosqueCombate.devolver(id)
   → nível (UI.subirNivelBosque(n, undefined, abate.premioNivel)). A pergunta vem de Reino.Bosque.pergunta()
   ({ materia, sala, desafio }), no card de Reino.Desafios.render como o desafio do ET (ui/et-desafio.js): o Claude
   fala `vencido`, a narradora lê a pergunta, Conferir → certo: Bosque.acertou (1 estrela, Aura e UM móvel surpresa
   para a casa), fala `acerto`, a estrela voa até o HUD e o texto "🎁 Um presente para a casa!"; no fechar, o baú do
   presente (UI.bauBosque, ui/bosque-bau.js) abre antes de resolver. Errado: Bosque.errou (consome a pergunta, sem
   baú), falas `erro` e a resposta certa à vista. Fechar (✕, Esc, fora) antes de responder conta como erro. Uma
   tentativa, SEM limite de tempo. Todo tipo da sala (digitar, ligar, completar, tabela, desenho…), no modo 'prova':
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
    var devolver = function () { if (Reino.BosqueCombate && Reino.BosqueCombate.devolver) Reino.BosqueCombate.devolver(f && f.id); };
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
      var fase = 'pergunta', ctrl = null, resultado = null, premio = null, materiaId = q.materia.id;
      var pn = UI.painel('bosque-pergunta', '👻 Hora da pergunta!', { curto: '👻 Pergunta!', aoFechar: function () { terminar(); } });
      pn.tela._bosqueAtual = function () { return q; };   // a pergunta na tela (testes)

      var fala = el('p.bosque-fala');
      var cabeca = el('div.bosque-cabeca', PA.iconeEmoji('👻', compacto() ? 2 : 3), fala);
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
        var d = q.desafio, c = d.livro && (q.materia.livro || []).find(function (x) { return x.id === d.livro; });
        if (!c || !UI.desenharCarta) return null;
        var carta = el('div.livro-carta.bosque-carta');
        UI.desenharCarta(carta, c, q.materia);
        return el('details.bosque-contexto', { open: true }, el('summary', el('b', '📖 Leia antes')), carta);
      }

      function mostrar(ler) {
        var ctx = contexto();
        if (ctx) area.appendChild(ctx);
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
        retorno.className = 'bosque-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
        Reino.Som.calar();
        if (ok) {
          var r = B.acertou(materiaId);
          resultado = 'certo';
          premio = r.presente;
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
          dizer(Fa.erro);
        }
        if (q.desafio.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + q.desafio.explica));
        retorno.hidden = false;
        U.preencher(btn, 'Continuar →');
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
        if (e.isTrusted && e.detail) UI.segurarToques();
        Reino.Som.calar();
        UI.fecharTela(pn.tela);
        terminar();
      });

      Reino.Som.tocar('porta');
      mostrar(dizer(Fa.vencido));
    });
  }

  /* ---------- a fila dos vencidos, um por vez ---------- */
  var fila = [], andando = false;
  function bloqueado() { return !!(Reino.Cena && Reino.Cena.bloqueado && Reino.Cena.bloqueado()); }
  // abre a pergunta sempre que há bloco pendente (o `abate` só é usado para os prêmios e o nível)
  function temPergunta() {
    var B = Reino.Bosque;
    return !!(B && B.perguntasPendentes && B.perguntasPendentes() > 0);
  }
  function devolverUltimo(item) {
    if (Reino.BosqueCombate && Reino.BosqueCombate.devolver) Reino.BosqueCombate.devolver(item && item.id);
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
  // a pergunta que ficou pendente (fechou o jogo no meio): recupera com id null, só dentro do Bosque e com a espada
  function recuperar() {
    if (andando || fila.length || UI.temTela() || bloqueado()) return;
    var B = Reino.Bosque;
    if (!B || !B.noBosque || !B.noBosque() || !B.perguntasPendentes || B.perguntasPendentes() <= 0) return;
    if (B.temEspada && !B.temEspada()) return;   // a tela da espada da 1ª entrada vem primeiro
    if (!B.pergunta()) {   // bimestre sem pergunta: consome as pendentes sem abrir tela
      while (B.perguntasPendentes() > 0 && B.consumirPergunta && B.consumirPergunta()) {}
      return;
    }
    fila.push({ id: null, abate: null });
    proximo();
  }

  U.on(EV.BOSQUE, function (e) {
    if (!e || e.tipo !== 'vencido') return;
    var B = Reino.Bosque, abate = B && B.abater ? B.abater(e.fantasma) : null;
    fila.push({ id: e.id || null, abate: abate });
    proximo();
  });
  U.on(EV.TELAS, function (n) { if (!n) setTimeout(function () { recuperar(); proximo(); }, 0); });
  U.on(EV.CENA, function (m) { if (m && m.para === 'bosque') setTimeout(recuperar, 0); });
  // a íris/diálogo acabou: o que estava esperando a cena liberar pode abrir
  U.on(EV.TRANSICAO, function (comecou) { if (!comecou) setTimeout(function () { recuperar(); proximo(); }, 0); });
  U.on(EV.OCUPADA, function (motivo) { if (!motivo) setTimeout(function () { recuperar(); proximo(); }, 0); });

  UI.perguntaFantasma = perguntaFantasma;
})();
