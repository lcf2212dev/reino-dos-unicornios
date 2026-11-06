/* Vila Arco-Íris: a pergunta antes da conversa com o lojista (docs/contratos/vila.md §5). UI.perguntaVila(npc) →
   Promise<bool>: true = acertou (a conversa normal começa); false = errou ou fechou sem responder.
   A pergunta vem de Reino.VilaLojas.pergunta() ({ materia, sala, desafio }, 4º bimestre) e aparece como a do fantasma
   (ui/bosque-pergunta.js): o retrato do lojista, a linha "Para conversar, responda certinho!" (só texto, sem voz), a
   carta do livro "Leia antes", o card de Reino.Desafios.render no modo 'prova', a narradora lê a pergunta, Conferir →
   certo ("Acertou! ✨", botão "Conversar →") ou errado (a certa à vista, botão "Tentar depois"). Uma tentativa, sem
   tempo. Não dá estrela nem Aura e não mexe no save. Sem pergunta, resolve true na hora. Estilos: css/ui-vila.css. */
(function () {
  var U = Reino.util, el = U.el, UI = Reino.UI;
  var TRAVA_MS = 600;

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  function reduzMovimento() { return !!U.reduzMovimentoSistema; }
  // "da Dona Lavanda" / "do Seu Bigorna": o gênero do sprite; sem ele, pelo título do nome
  function deQuem(npc) {
    var nome = (npc && npc.nome) || 'lojista', g = npc && ((npc.sprite && npc.sprite.genero) || npc.genero);
    if (!g) g = /^(Dona|Madame|Senhora|Tia|Vovó|Doutora|Professora|Capitã|Princesa|Rainha)\b/.test(nome) ? 'f'
      : /^(Seu|Senhor|Capitão|Tio|Vovô|Doutor|Professor|Mestre|Príncipe|Rei)\b/.test(nome) ? 'm' : '';
    return (g === 'f' ? 'da ' : g === 'm' ? 'do ' : 'de ') + nome;
  }
  function retrato(npc) {
    var N = Reino.NPCs;
    try {
      if (N && N.retrato && npc && npc.sprite) {
        var c = N.retrato(npc, 0), lado = compacto() ? 48 : 64;
        var cv = PA.paraDOM(c, Math.max(1, Math.floor(lado / Math.max(c.width, c.height))), 'vila-retrato');
        cv.setAttribute('aria-hidden', 'true');
        return cv;
      }
    } catch (e) { console.warn('vila, retrato:', e); }
    return PA.iconeEmoji('❓', compacto() ? 2 : 3);
  }

  function perguntaVila(npc) {
    var V = Reino.VilaLojas, D = Reino.Desafios, q = V && V.pergunta();
    if (!q || !D) return Promise.resolve(true);
    return new Promise(function (resolver) {
      var J = window.Jogador;
      if (J && J.parar) J.parar();
      if (Reino.Claude && Reino.Claude.limpar) Reino.Claude.limpar();
      var fase = 'pergunta', ctrl = null, resultado = false, acabou = false;
      var pn = UI.painel('vila-pergunta', 'Pergunta ' + deQuem(npc), { curto: 'Pergunta!', icone: '❓', aoFechar: function () { terminar(); } });
      pn.tela._vilaAtual = function () { return q; };   // a pergunta na tela (testes)

      var area = el('div.vila-area');
      var retorno = el('div.vila-retorno', { hidden: true });
      var btn = el('button.btn-grande.btn-conferir.vila-botao', { type: 'button', disabled: true }, 'Conferir ✓');
      pn.conteudo.appendChild(el('div.vila-cabeca', retrato(npc), el('p.vila-fala', 'Para conversar, responda certinho!')));
      pn.conteudo.appendChild(area);
      pn.conteudo.appendChild(retorno);
      pn.card.appendChild(el('footer.vila-botoes', btn));

      // a página do livro da pergunta (o texto-base do grupo)
      function contexto() {
        var d = q.desafio, c = d.livro && (q.materia.livro || []).find(function (x) { return x.id === d.livro; });
        if (!c || !UI.desenharCarta) return null;
        var carta = el('div.livro-carta.vila-carta');
        UI.desenharCarta(carta, c, q.materia);
        return el('details.vila-contexto', { open: true }, el('summary', el('b', '📖 Leia antes')), carta);
      }

      function mostrar() {
        var ctx = contexto();
        if (ctx) area.appendChild(ctx);
        ctrl = D.render(q.desafio, { modo: 'prova', onMudar: function () { btn.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
        area.appendChild(ctrl.card);
        btn.disabled = !ctrl.pronto();
        var c = ctrl, d = q.desafio;
        // o pacote de voz da sala antes de ler; no máximo 4 s de espera
        var voz = Reino.Voz && Reino.Voz.carregarSala
          ? Promise.race([Reino.Voz.carregarSala(q.materia, q.sala), new Promise(function (r) { setTimeout(r, 4000); })]) : null;
        Promise.resolve(voz).then(function () {
          if (c === ctrl && fase === 'pergunta' && pn.tela.isConnected) Reino.Som.falar(Reino.Falas.segmentosDesafio(d, c.ordem), { voz: 'narradora' });
        });
        setTimeout(function () { if (fase === 'pergunta' && pn.tela.isConnected) UI.focarTroca(ctrl.el, null, 0); }, 60);
      }

      function conferir() {
        if (fase !== 'pergunta' || !ctrl.pronto()) return;
        fase = 'resposta';
        ctrl.travado = true;
        var ok = D.pontuar(q.desafio, ctrl.valor()) === 1;
        travar();
        retorno.className = 'vila-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
        Reino.Som.calar();
        if (ok) {
          resultado = true;
          ctrl.marcarCerto();
          Reino.Som.tocar('acerto');
          UI.festa(1, { som: false, item: ctrl.card.querySelector('.certa') });
          retorno.appendChild(el('h3', 'Acertou! ✨'));
        } else {
          if (ctrl.revelar) ctrl.revelar();
          Reino.Som.tocar('erro');
          retorno.appendChild(el('h3', '💭 Quase!'));
          retorno.appendChild(el('p.surpresa-certa', D.linhaCerta(q.desafio)));
        }
        if (q.desafio.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + q.desafio.explica));
        retorno.hidden = false;
        U.preencher(btn, ok ? 'Conversar →' : 'Tentar depois');
        btn.classList.toggle('btn-secundario', !ok);
        // o botão novo nasce travado: um toque duplo no Conferir não fecha sem ver a resposta
        btn.disabled = true;
        setTimeout(function () { btn.disabled = false; if (pn.tela.isConnected && UI.porTeclado()) btn.focus(); }, TRAVA_MS);
        setTimeout(function () { if (retorno.scrollIntoView) retorno.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' }); }, 60);
      }

      // respondida: nada mais muda
      function travar() {
        var c = ctrl.el;
        Array.prototype.forEach.call(c.querySelectorAll('button.opcao'), function (b) { b.setAttribute('aria-disabled', 'true'); });
        Array.prototype.forEach.call(c.querySelectorAll('input, textarea'), function (x) { x.readOnly = true; });
        Array.prototype.forEach.call(c.querySelectorAll('.acentos button'), function (b) { b.disabled = true; });
        var a = document.activeElement;
        if (a && c.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) a.blur();
      }

      // fechou (botão, ✕, Esc, fora): só o acerto deixa conversar
      function terminar() {
        if (acabou) return;
        acabou = true;
        if (aberta && aberta.tela === pn.tela) aberta = null;
        resolver(resultado);
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

      aberta = { tela: pn.tela, fim: terminar };
      Reino.Som.tocar('porta');
      mostrar();
    });
  }

  // a tela saiu da pilha sem o botão nem o ✕ (UI.fecharTodas, troca de cena): resolve do mesmo jeito (senão a conversa trava)
  var aberta = null;
  U.on(Reino.EVENTOS.TELAS, function () { if (aberta && Reino._ui.pilha.indexOf(aberta.tela) < 0) aberta.fim(); });

  UI.perguntaVila = perguntaVila;
})();
