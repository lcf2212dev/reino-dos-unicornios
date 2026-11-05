/* Bosque dos Fantasmas: a pergunta do fantasma vencido (docs/contratos/bosque.md §5 e §7, item 2).
   Ouve Reino.EVENTOS.BOSQUE { tipo: 'vencido', id, fantasma } e abre UI.perguntaFantasma(e) (em fila, um por vez: um
   golpe pode vencer dois). A pergunta vem de Reino.Bosque.pergunta() ({ materia, sala, desafio }), no card de
   Reino.Desafios.render como o desafio do ET (ui/et-desafio.js): o Claude fala `vencido`, a narradora lê a pergunta,
   Conferir → certo: Bosque.acertou (estrela e XP), fala `acerto`, a estrela voa até o HUD; errado: Bosque.errou, falas
   `erro` e a resposta certa à vista. Fechar (✕, Esc, fora) antes de responder conta como erro. Uma tentativa, SEM
   limite de tempo. Todo tipo da sala (digitar, ligar, completar, tabela, desenho…), no modo 'prova': uma tentativa
   só, sem o texto ou o desenho guardado da sala já preenchido (Reino.Producoes); conferir é só D.pontuar === 1 (o
   ctrl.conferir da sala grava a produção e ensina a refazer). Errou: o tipo com ctrl.revelar mostra a certa no
   próprio controle; os outros ficam como ela deixou (sem o verde do marcarCerto) e a certa vem por escrito. No fim, sempre BosqueCombate.devolver(id); se subiu de nível, UI.subirNivelBosque(n) (com as falas
   `nivel`). UI.perguntaFantasma(f) → Promise<'certo'|'errado'|'depois'>. Estilos: css/ui-bosque.css.
   Contexto: a pergunta sai da sala, sem o resumo que vem antes dela. O texto de apoio (d.apoio) e a figura (d.figura)
   já vêm no card do Desafios.render; o texto-base, a tabela e as figuras do enunciado ficam na carta do livro
   (d.livro, a página do livro da sala): ela vem acima da pergunta, aberta (UI.desenharCarta, como o resumo da sala). */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var TRAVA_MS = 600;

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  function reduzMovimento() { return !!U.reduzMovimentoSistema; }

  function perguntaFantasma(f) {
    var B = Reino.Bosque, D = Reino.Desafios, Fa = Reino.BosqueFalas, q = B && B.pergunta();
    var devolver = function () { if (Reino.BosqueCombate && f && f.id) Reino.BosqueCombate.devolver(f.id); };
    if (!q || !D) { devolver(); return Promise.resolve('depois'); }
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      if (Reino.Claude && Reino.Claude.limpar) Reino.Claude.limpar();
      var fase = 'pergunta', ctrl = null, resultado = null, subiu = null, materiaId = q.materia.id;
      var pn = UI.painel('bosque-pergunta', '👻 Fantasma vencido!', { curto: '👻 Vencido!', aoFechar: function () { terminar(); } });
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
          subiu = r.subiu;
          ctrl.marcarCerto();
          Reino.Som.tocar('acerto');
          setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
          var certa = ctrl.card.querySelector('.certa');
          UI.festa(1, { som: false, item: certa });   // acerto: nível 1 (arte.md §16)
          var selo = el('h3', '✨ +' + r.estrelas + ' ⭐');
          retorno.appendChild(selo);
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
        U.preencher(btn, subiu ? 'Continuar ⬆' : 'Continuar →');
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

      // fechou (Continuar, ✕, Esc, fora): sem resposta conta como erro; devolve o fantasma; se subiu, o ponto
      var acabou = false;
      function terminar() {
        if (acabou) return;
        acabou = true;
        if (!resultado) { B.errou(materiaId); resultado = 'depois'; }
        devolver();
        if (UI.atualizarHUD) UI.atualizarHUD();
        if (subiu && UI.subirNivelBosque) {
          UI.subirNivelBosque(subiu).then(function () { resolver(resultado); }, function () { resolver(resultado); });
        } else resolver(resultado);
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

  /* ---------- a fila dos vencidos ---------- */
  var fila = [], andando = false;
  function proximo() {
    if (andando || !fila.length) return;
    // outra tela por cima (o prêmio, o ponto, o móvel): espera ela fechar
    if (UI.temTela()) return;
    andando = true;
    var f = fila.shift();
    perguntaFantasma(f).catch(function (e) { console.warn('bosque, pergunta:', e); })
      .then(function () { andando = false; setTimeout(proximo, 0); });
  }
  U.on(Reino.EVENTOS.BOSQUE, function (e) {
    if (!e || e.tipo !== 'vencido') return;
    fila.push(e);
    proximo();
  });
  U.on(Reino.EVENTOS.TELAS, function (n) { if (!n) setTimeout(proximo, 0); });

  UI.perguntaFantasma = perguntaFantasma;
})();
