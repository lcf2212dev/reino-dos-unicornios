/* Pergunta surpresa (parte 2 de 2): o painel da pergunta — Claude, pergunta, "Conferir" / "Agora não",
   acerto (estrelas) e erro com a explicação, e o fechar (✕, Esc, "Ok!"). Nada roda no carregamento.
   Ver o cabeçalho de surpresa.js. */
(function () {
  var I = Reino._surpresa, S = I.S;
  var cfg = I.cfg, agora = I.agora, sortearFrase = I.sortearFrase, elogioAcerto = I.elogioAcerto;
  var vigiarTelas = I.vigiarTelas, terminar = I.terminar;

  var OK_TRAVA_MS = 600;
  // fechou a pergunta com o dedo e continua tocando ali: a guarda do ui/base.js (UI.segurarToques) segura
  // os toques perto dela até 2 s depois de fechar; aqui ela é renovada uma vez, aos
  // GUARDA_FECHAR_MS - 2000, para durar até 3 s (o botão do menu que estava embaixo não abre).
  // Só se o último toque foi perto do fechamento e há pouco (a guarda ainda de pé): ms 1 não cria
  // guarda nova, só estica a que existe. Toque longe e teclado continuam valendo na hora.
  var GUARDA_FECHAR_MS = 3000, TOQUE_PERTO_PX = 40, TOQUE_SEGUIDO_MS = 800;
  function segurarAoFechar(e) {
    var UI = Reino.UI;
    if (!e || !e.isTrusted || !e.detail || !UI.segurarToques) return;
    var ponto = { x: e.clientX, y: e.clientY }, ultimo = null;
    function marcar(ev) { if (ev.isTrusted) ultimo = { x: ev.clientX, y: ev.clientY, t: agora() }; }
    document.addEventListener('pointerdown', marcar, true);
    setTimeout(function () {
      document.removeEventListener('pointerdown', marcar, true);
      if (!ultimo || agora() - ultimo.t > TOQUE_SEGUIDO_MS || document.querySelector('#telas > .tela')) return;
      if (Math.abs(ultimo.x - ponto.x) >= TOQUE_PERTO_PX || Math.abs(ultimo.y - ponto.y) >= TOQUE_PERTO_PX) return;
      UI.segurarToques(1);
    }, GUARDA_FECHAR_MS - 2000);
  }

  function reduzMovimento() {
    return !!(window.Reino && Reino.util && Reino.util.reduzMovimentoSistema);   // lido e seguido em nucleo/util.js
  }

  // celular em pé ou deitado: mesmo corte do @media compacto de css/ui-novidades.css
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
    I.painelAberto = { info: info, pn: pn, encerrar: function () { soltar(); terminar(resultado || 'agoraNao'); } };
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

    var btnConferir = el('button.btn-grande.btn-conferir.surpresa-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
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
      if (primeira && fase === 'pergunta' && Reino.UI.porTeclado()) primeira.focus({ preventScroll: true });   // o Claude continua à vista
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

    btnDepois.addEventListener('click', function (e) { if (btnDepois.disabled) return; Reino.Som.tocar('toque'); fechar(e); });
    // "Agora não" e ✕ travados nos primeiros OK_TRAVA_MS: um toque no menu do celular no instante em
    // que o painel abre (o "Agora não" fica em cima de Lugares e Estábulo) não fecha a pergunta sem
    // ela ver. O Esc continua valendo.
    var btnX = pn.card.querySelector('.btn-fechar');
    btnDepois.disabled = true;
    if (btnX) btnX.disabled = true;
    // o ✕ fecha pelo UI.painel (aoFechar): aqui só a guarda do dedo que continua tocando
    if (btnX) btnX.addEventListener('click', function (e) { if (!btnX.disabled) segurarAoFechar(e); });
    setTimeout(function () { btnDepois.disabled = false; if (btnX) btnX.disabled = false; }, OK_TRAVA_MS);

    btnConferir.addEventListener('click', function () {
      if (fase !== 'pergunta' || !ctrl.pronto()) return;
      fase = 'resposta';
      ctrl.travado = true;
      var ok = D.pontuar(d, ctrl.valor()) === 1;
      resultado = ok ? 'acerto' : 'erro';
      Reino.Aura.contar(ok);
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
      okBtn.addEventListener('click', function (e) { if (okBtn.disabled) return; Reino.Som.tocar('toque'); fechar(e); });
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
        // (celular deitado: o "✓ Certo" fica em cima dela, na mesma coluna, e também não passa do topo)
        var certa = retorno.querySelector('.surpresa-certa'), cb = certa && certa.getBoundingClientRect();
        var inicioExplica = c.scrollTop + (cb && cb.left > rr.left + rr.width / 3 ? cb.top : fim.top) - cr.top - 8;
        var alvo = Math.max(0, Math.min(Math.max(topo, ateExplica), Math.max(topo, inicioExplica)));
        if (c.scrollTo) c.scrollTo({ top: alvo, behavior: reduzMovimento() ? 'auto' : 'smooth' }); else c.scrollTop = alvo;
      }, 60);
    }

    function soltar() { document.removeEventListener('keydown', aoTeclar); document.removeEventListener('click', foraDoCartao, true); }
    function fechar(e) {
      soltar();
      Reino.Som.calar();
      UI.fecharTela(pn.tela);
      segurarAoFechar(e);
      terminar(resultado || 'agoraNao');
    }
  }

  // para a outra parte
  I.mostrar = mostrar;
})();
