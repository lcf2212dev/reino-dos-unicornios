/* Desafio do ET (Reino.UI.telaDesafioET(npc, materia)), aberto pela ação `viagem-desafio` (sistemas/viagem-desafio.js):
   o retrato e a fala do ET, config.viagem.desafioPerguntas perguntas uma por vez (o card de Reino.Desafios.render,
   como a pergunta surpresa), Conferir → Aura e estrela no acerto; errada mostra a certa e a explicação e segue.
   No fim, o ET agradece e vira amigo. Contrato: docs/contratos/viagem.md §6.1. Estilos: css/ui-et-desafio.css. */
(function () {
  var U = Reino.util, el = U.el;
  var UI = Reino.UI;
  var OK_TRAVA_MS = 600;

  function compacto() { return window.innerWidth <= 480 || window.innerHeight <= 500; }
  function reduzMovimento() {
    return !!(window.Reino && Reino.util && Reino.util.reduzMovimentoSistema);   // lido e seguido em nucleo/util.js
  }
  // o busto do ET com escala inteira (nítido)
  function retrato(npc) {
    var PA = window.PA, N = Reino.NPCs;
    try {
      var c = N.retrato(npc, 0);
      return PA.paraDOM(c, PA.escalaNitida((compacto() ? 56 : 84), c.width), 'et-retrato');
    } catch (e) { return null; }
  }
  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  function telaDesafioET(npc, materia) {
    var X = Reino._viagemDesafio, D = Reino.Desafios;
    if (!X || !npc || UI.temTela()) return;
    var id = npc.id, F = X.frases(id), voz = npc.voz || X.voz(id), G = Reino.Genero;
    var des = X.comecar(id, materia);
    if (!des.perguntas.length) return;
    var fala = function (t) { return G ? G.genero(t) : t; };
    var i = 0, fase = 'pergunta', ctrl = null, atual = null;

    var J = window.Jogador;
    if (J && J.parar) J.parar();
    Reino.Claude.limpar();
    var pn = UI.painel('et-desafio', npc.nome || 'ET');
    pn.tela.setAttribute('aria-label', 'Desafio de ' + U.semEn(npc.nome || 'ET'));
    pn.conteudo.classList.add('et-conteudo');
    pn.tela._etAtual = function () { return atual; };   // a pergunta na tela (testes)

    var balao = el('p.et-fala', { 'aria-live': 'polite' });
    var placar = el('p.et-placar');
    var cabeca = el('div.et-cabeca', retrato(npc), el('div.et-balao', balao, placar));
    var area = el('div.et-area');
    var retorno = el('div.et-retorno', { hidden: true, 'aria-live': 'polite' });
    var btn = el('button.btn-grande.btn-conferir.et-botao',   // o mesmo Conferir da sala e da surpresa (ui.md §10.8)
      { type: 'button', disabled: true }, 'Conferir ✓');
    var botoes = el('footer.et-botoes', btn);
    pn.conteudo.appendChild(cabeca);
    pn.conteudo.appendChild(area);
    pn.conteudo.appendChild(retorno);
    pn.card.appendChild(botoes);

    // o ET fala (balão + voz) e depois, se pedir, a narradora lê a pergunta
    function dizer(linhas) {
      linhas = linhas.map(fala);
      U.preencher(balao, compacto() ? linhas[linhas.length - 1] : linhas.join(' '));   // no celular, só a última frase (o resto vai na voz)
      return Reino.Som.falar(linhas, { voz: voz });
    }
    function atualizarPlacar() {
      U.preencher(placar, (compacto() ? '' : 'Pergunta ') + Math.min(i + 1, des.perguntas.length) + ' de ' + des.perguntas.length + ' • ' + des.estrelas + ' ⭐');
    }

    function mostrarPergunta(ler) {
      fase = 'pergunta';
      atual = des.perguntas[i].desafio;
      area.innerHTML = '';
      retorno.hidden = true;
      retorno.innerHTML = '';
      ctrl = D.render(atual, { modo: 'surpresa', onMudar: function () { btn.disabled = fase !== 'pergunta' || !ctrl.pronto(); } });
      area.appendChild(ctrl.card);
      U.preencher(btn, 'Conferir ✓');
      btn.disabled = true;
      atualizarPlacar();
      var d = atual, c = ctrl, q = des.perguntas[i];
      // carrega o pacote de voz da sala antes de ler (como a pergunta surpresa); no máximo 4 s de espera
      var voz = q && q.materia && q.sala && Reino.Voz && Reino.Voz.carregarSala
        ? Promise.race([Reino.Voz.carregarSala(q.materia, q.sala), new Promise(function (r) { setTimeout(r, 4000); })]) : null;
      Promise.all([ler, voz]).then(function () {
        if (c === ctrl && fase === 'pergunta' && pn.tela.isConnected) Reino.Som.falar(Reino.Falas.segmentosDesafio(d, c.ordem), { voz: 'narradora' });
      });
      setTimeout(function () {
        var p = ctrl.card.querySelector('.opcao');
        if (p && fase === 'pergunta' && UI.porTeclado()) p.focus({ preventScroll: true });   // no toque, nada contornado
      }, 60);
    }

    function conferir() {
      if (fase !== 'pergunta' || !ctrl.pronto()) return;
      fase = 'resposta';
      ctrl.travado = true;
      var ok = D.pontuar(atual, ctrl.valor()) === 1;
      var n = X.conferir(des, ok);
      if (UI.atualizarHUD) UI.atualizarHUD();
      Array.prototype.forEach.call(ctrl.card.querySelectorAll('button.opcao'), function (b) { b.setAttribute('aria-disabled', 'true'); });
      retorno.className = 'et-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
      if (ok) {
        ctrl.marcarCerto();
        Reino.Som.tocar('acerto');
        setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
        UI.festa(1, { som: false, item: ctrl.card.querySelector('.certa') });   // acerto do ET: nível 1 (ui.md §10.16)
        retorno.appendChild(el('h3', '✨ +' + n + ' ⭐'));
        dizer([sortear(F.acerto)]);
      } else {
        if (ctrl.revelar) ctrl.revelar(); else ctrl.marcarCerto();
        Reino.Som.tocar('erro');
        retorno.appendChild(el('h3', '💭 Quase!'));
        retorno.appendChild(el('p.surpresa-certa', D.linhaCerta(atual)));
        dizer([sortear(F.erro)]);
      }
      if (atual.explica) retorno.appendChild(el('p.retorno-explica', '📌 ' + atual.explica));
      retorno.hidden = false;
      atualizarPlacar();
      U.preencher(btn, i + 1 < des.perguntas.length ? 'Próxima →' : 'Terminar ✓');
      travar();
      setTimeout(function () { if (retorno.scrollIntoView) retorno.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' }); }, 60);
    }

    // o botão novo nasce travado: um toque duplo no Conferir não pula a explicação
    function travar() {
      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; if (pn.tela.isConnected) btn.focus(); }, OK_TRAVA_MS);
    }

    function fim() {
      fase = 'fim';
      var novo = X.terminar(des);
      area.innerHTML = '';
      retorno.hidden = true;
      U.preencher(placar, des.certas + ' de ' + des.perguntas.length + ' certas • +' + des.estrelas + ' ⭐');
      var amiga = npc.genero === 'm' ? 'seu amigo' : 'sua amiga';
      area.appendChild(el('p.et-amigo', '💛 ' + (npc.nome || 'ET') + (novo ? ' virou ' : ' é ') + amiga + '!'));
      Reino.Som.tocar('estrela');
      UI.festa(2, { som: false });   // ET vencido: nível 2 (ui.md §10.16)
      dizer(des.amigoAntes ? F.fimDeNovo : F.fim);
      U.preencher(btn, 'Tchau! 💛');
      travar();
    }

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      Reino.Som.tocar('toque');
      if (fase === 'pergunta') return conferir();
      if (fase === 'resposta') {
        i++;
        if (i < des.perguntas.length) { Reino.Som.calar(); return mostrarPergunta(); }
        return fim();
      }
      Reino.Som.calar();
      UI.fecharTela(pn.tela);
    });

    Reino.Som.tocar('porta');
    mostrarPergunta(dizer(des.amigoAntes ? F.aberturaDeNovo : F.abertura));
  }

  UI.telaDesafioET = telaDesafioET;
})();
