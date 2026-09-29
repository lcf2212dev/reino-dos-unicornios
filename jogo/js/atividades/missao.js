/* Missão: a tela de uma sala (Reino.Missao.iniciar): intro, desafios sorteados um a um,
   retorno do Claude a cada conferência e os prêmios no fim. Usa Reino.Desafios. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios;
  var M = {};
  // troca de tela pelo teclado: o Enter/Espaço que chega logo depois no controle novo não vale
  var CALMA_TROCA = 400;

  M.iniciar = function (materia, sala, aoTerminar) {
    var tela = Reino.UI.abrirTela('missao');
    var lista = D.sortear(sala, Reino.config.desafiosPorSala);
    var idx = 0, acertosPrimeira = 0, pressas = 0, ultimaPressa = -10;
    var errouAtual = false, avisouPressa = false, inicioDesafio = 0, ctrl = null;

    var sair = el('button.btn-icone.btn-sair', { type: 'button', 'aria-label': 'Sair da sala' }, '✕');
    var pontos = el('div.missao-pontos', { 'aria-hidden': 'true' });
    var titulo = el('div.missao-titulo', el('span', sala.emoji + ' ' + sala.nome));
    var corpo = el('div.missao-corpo');
    var btnConferir = el('button.btn-grande.btn-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
    var rodape = el('footer.missao-rodape', el('span.sem-relogio', '⏳ Sem relógio. O tempo é todo seu!'), btnConferir);
    var retorno = el('div.missao-retorno', { hidden: true });

    tela.appendChild(el('header.missao-topo', sair, titulo, pontos));
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    tela.appendChild(retorno);
    document.body.classList.add('em-missao');
    D.ajustarTitulo(titulo, materia && materia.id);

    var botaoFim = null;   // no fim da sala, o "Voltar"/"Chocar o ovo": a sala já contou e o ✕ faz o mesmo
    sair.addEventListener('click', function () {
      if (botaoFim) { botaoFim.click(); return; }
      Reino.UI.confirmar('Quer sair da sala agora? Você pode voltar e fazer de novo depois.', 'Sair', 'Continuar aqui').then(function (sim) {
        if (!sim) return;
        fechar();
        if (aoTerminar) aoTerminar(null);
      });
    });

    function fechar() {
      Reino.Som.calar();
      Reino.Claude.limpar();
      document.body.classList.remove('em-missao');
      Reino.UI.fecharTela(tela);
    }

    function pintarPontos() {
      pontos.innerHTML = '';
      lista.forEach(function (_, i) {
        pontos.appendChild(el('span.ponto' + (i < idx ? '.feito' : '') + (i === idx ? '.atual' : '')));
      });
      pontos.setAttribute('aria-label', 'Desafio ' + (idx + 1) + ' de ' + lista.length);
    }

    function intro() {
      rodape.hidden = true;
      corpo.innerHTML = '';
      var claudeMini = PA.paraDOM(PA.claude(0), 4, 'claude-intro');
      var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar 🦄');
      corpo.appendChild(el('div.intro-sala',
        el('div.intro-emoji', sala.emoji),
        el('h2.titulo-pixel', sala.nome),
        el('p.intro-paginas', 'Apostila: ' + sala.paginas),
        el('div.intro-claude', claudeMini, el('p', sala.intro)),
        el('ul.intro-regras',
          el('li', '⏳ Aqui não tem relógio. Pode ir devagar!'),
          el('li', '👀 Leia cada pergunta com calma e depois toque em "Conferir".'),
          el('li', '⭐ Acertou de primeira? Ganha estrela!')),
        el('div.intro-botoes', comecar)));
      comecar.addEventListener('click', function () { Reino.Som.tocar('porta'); if (cartas.length) resumo(0); else mostrarDesafio(); });
      if (cartas.length) Reino.Voz.carregar(materia.id + '-livro');
      // o pacote de voz pode chegar tarde (rede lenta): só fala se a introdução ainda está na tela
      Reino.Voz.carregarSala(materia, sala).then(function () {
        if (comecar.isConnected) Reino.UI.esperarFala([comecar, sair], [sala.nome, sala.intro], { voz: 'claude' });
      });
    }

    // resumo antes das questões: as cartas do livro que a sala usa (campo `livro`, sem repetir, na ordem)
    var cartas = [];
    if (Reino.config.esperaFala.resumoNaSala && materia && materia.livro) {
      sala.desafios.forEach(function (d) {
        var c = materia.livro.find(function (x) { return x.id === d.livro; });
        if (c && cartas.indexOf(c) < 0) cartas.push(c);
      });
    }
    function resumo(i) {
      rodape.hidden = true;
      Reino.Som.calar();
      corpo.innerHTML = '';
      var area = el('div.livro-carta');
      Reino.UI.desenharCarta(area, cartas[i]);
      var ultima = i === cartas.length - 1;
      var seguir = el('button.btn-grande.btn-principal', { type: 'button' }, ultima ? 'Começar as perguntas 🦄' : 'Continuar →');
      var voltar = i > 0 ? el('button.btn-grande.btn-secundario', { type: 'button' }, '← Voltar') : null;
      var botoes = el('div.resumo-botoes', voltar, seguir);
      var titulo = el('h2.titulo-pixel', '📖 Resumo');
      corpo.appendChild(el('div.resumo-sala', titulo,
        el('p.resumo-pag', 'Carta ' + (i + 1) + ' de ' + cartas.length), area, botoes));
      seguir.addEventListener('click', function () { Reino.Som.tocar('toque'); if (ultima) mostrarDesafio(); else resumo(i + 1); });
      if (voltar) voltar.addEventListener('click', function () { Reino.Som.tocar('toque'); resumo(i - 1); });
      corpo.scrollTop = 0;
      Reino.UI.focarTroca(seguir, titulo, CALMA_TROCA);
      // lê a carta (pacote <matéria>-livro); com config.esperaFala.travar, botões e ✕ esperam a leitura acabar
      Reino.Voz.carregar(materia.id + '-livro').then(function () {
        if (!seguir.isConnected) return;
        Reino.UI.esperarFala([botoes, sair], Reino.UI.falaCarta(cartas[i]), { voz: 'narradora' }).then(function () {
          if (seguir.isConnected) Reino.UI.focarTroca(seguir, titulo, 0);
        });
      });
    }

    function mostrarDesafio() {
      rodape.hidden = false;
      Reino.Som.calar();
      Reino.Claude.limpar();
      pintarPontos();
      errouAtual = false; avisouPressa = false;
      var d = lista[idx];
      corpo.innerHTML = '';
      ctrl = D.render(d, {
        modo: 'missao',
        lerSozinho: Reino.config.esperaFala.lerQuestoes ? [sair] : null,
        onMudar: function () { btnConferir.disabled = !ctrl.pronto(); },
        onCompleto: function () { conferir(true); },
      });
      var num = el('div.desafio-num', 'Desafio ' + (idx + 1) + ' de ' + lista.length);
      corpo.appendChild(num);
      corpo.appendChild(ctrl.card);
      btnConferir.disabled = true;
      btnConferir.hidden = !!ctrl.semConferir;
      corpo.scrollTop = 0;
      inicioDesafio = Date.now();
      // teclado ("Começar", "Continuar"): o foco vai para o 1º controle do desafio (ou o número dele)
      Reino.UI.focarTroca(ctrl.card, num, CALMA_TROCA);
    }

    function tempoMinimo(d) {
      return U.clamp(1500 + D.tamanhoLeitura(d) * 32, 2500, 8000);
    }

    function conferir(automatico) {
      var d = lista[idx];
      if (!ctrl || !ctrl.pronto()) return;
      // detector gentil de pressa (só para perguntas de escolher)
      var ehSimples = D.TREINAVEIS.indexOf(d.tipo) >= 0;
      if (!automatico && ehSimples && !errouAtual && !avisouPressa && Date.now() - inicioDesafio < tempoMinimo(d) && idx - ultimaPressa >= 3) {
        avisouPressa = true; ultimaPressa = idx; pressas++;
        Reino.Som.tocar('toque');
        Reino.Claude.falar(Reino.Claude.frase('pressa'), { tipo: 'pressa', agora: true });
        return;
      }
      Reino.Claude.limpar();
      var res = ctrl.conferir();
      if (res.ok) {
        ctrl.travado = true;
        ctrl.marcarCerto();
        var dePrimeira = !errouAtual;
        if (dePrimeira) acertosPrimeira++;
        var cresceu = Reino.Progresso.xpMontaria(dePrimeira ? 5 : 2);
        Reino.Aura.contar(true);
        Reino.Progresso.salvar();
        Reino.Som.tocar('acerto');
        if (dePrimeira) setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
        mostrarRetorno(true, d, dePrimeira, cresceu);
      } else {
        errouAtual = true;
        Reino.Aura.contar(false);
        Reino.Som.tocar('erro');
        ctrl.marcarErro(res);
        mostrarRetorno(false, d, false, null, res);
      }
    }
    btnConferir.addEventListener('click', function () { conferir(false); });

    function mostrarRetorno(ok, d, dePrimeira, cresceu, res) {
      retorno.innerHTML = '';
      retorno.className = 'missao-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
      var fala = ok ? Reino.Claude.frase(dePrimeira ? 'acerto' : 'acertoDepois') : Reino.Claude.frase('erro');
      var extra = null;
      if (!ok && d.tipo === 'varias' && res && res.faltam > 0 && (!res.erradas || !res.erradas.length)) extra = el('p.retorno-extra', 'Dica: ainda falta marcar ' + (res.faltam === 1 ? '1 item' : res.faltam + ' itens') + '!');
      var cab = el('div.retorno-cabeca',
        PA.paraDOM(PA.claude(0), 3, 'claude-retorno'),
        el('div',
          el('h3', ok ? (dePrimeira ? '✨ Isso! +1 ⭐' : '✨ Isso!') : '💭 Quase!'),
          el('p.retorno-fala', fala)));
      retorno.appendChild(cab);
      if (extra) retorno.appendChild(extra);
      // acertou: reforça com a explicação; errou: só uma pista, sem entregar a resposta
      if (ok) retorno.appendChild(el('p.retorno-explica', el('b', '📌 Lembrete: '), d.explica));
      else retorno.appendChild(el('p.retorno-explica', el('b', '📌 Pista: '), pista(d)));
      if (cresceu) retorno.appendChild(el('p.retorno-cresceu', '🌟 ' + Reino.Progresso.nomeUni(cresceu.id) + ' cresceu! Agora é ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].nome + ' ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].emoji));
      var botoes = el('div.retorno-botoes');
      if (ok) {
        var cont = el('button.btn-grande.btn-principal', { type: 'button' }, idx + 1 < lista.length ? 'Continuar →' : 'Terminar a sala 🎉');
        cont.addEventListener('click', function () { Reino.Som.tocar('toque'); retorno.hidden = true; proximo(); });
        botoes.appendChild(cont);
      } else {
        var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 Ver no livro');
        livro.addEventListener('click', function () { Reino.UI.abrirLivro(materia, d.livro); });
        var denovo = el('button.btn-grande.btn-principal', { type: 'button' }, 'Tentar de novo');
        denovo.addEventListener('click', function () {
          Reino.Som.tocar('toque'); retorno.hidden = true; Reino.Som.calar();
          btnConferir.disabled = !ctrl.pronto();
          // o botão sumiu com o retorno: pelo teclado, o foco volta para o desafio
          Reino.UI.focarTroca(ctrl.card, corpo.querySelector('.desafio-num'), CALMA_TROCA);
        });
        botoes.appendChild(livro); botoes.appendChild(denovo);
      }
      retorno.appendChild(botoes);
      retorno.hidden = false;
      btnConferir.disabled = true;
      function focarBotao() { var b = retorno.querySelector('.btn-principal'); if (b && !retorno.hidden) b.focus(); }
      // "Continuar"/"Tentar de novo"/"Ver no livro" e o ✕ esperam a fala do retorno
      Reino.UI.esperarFala([botoes, sair], ok ? [fala] : [fala, pista(d)], { voz: 'claude' }).then(focarBotao);
      setTimeout(focarBotao, 60);
    }

    // pista depois de um erro: primeira frase da explicação, sem a resposta pronta
    function pista(d) { return Reino.Falas.pista(d, materia); }

    function proximo() {
      idx++;
      if (idx < lista.length) { mostrarDesafio(); return; }
      terminar();
    }

    function terminar() {
      pintarPontos();
      rodape.hidden = true;
      var premios = Reino.Progresso.concluirSala(materia, sala, { acertosPrimeira: acertosPrimeira, total: lista.length, pressas: pressas });
      Reino.Som.tocar('fanfarra');
      corpo.innerHTML = '';
      var itens = el('ul.premios');
      itens.appendChild(el('li', el('span.premio-icone', '⭐'), el('span', 'Acertos de primeira: ', el('b', acertosPrimeira + ' de ' + lista.length))));
      if (premios.calma) itens.appendChild(el('li', el('span.premio-icone', '🌙'), el('span', el('b', 'Estrela da Calma!'), ' Você leu tudo com calma. +3 ⭐')));
      if (premios.primeiraVez) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '💰'), el('span', el('b', '+ ' + U.reais(premios.dinheiro)), ' no Baú do Tesouro!')));
      else itens.appendChild(el('li', el('span.premio-icone', '🔁'), el('span', 'Treino livre: os ' + U.reais(Reino.Progresso.valorSala(materia)) + ' desta sala já estão no baú.')));
      if (premios.bonus) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '🎁'), el('span', el('b', '+ ' + U.reais(premios.bonus)), ' de bônus por completar ' + materia.nome + '!')));
      if (premios.ovos.length) itens.appendChild(el('li.premio-ovo', el('span.premio-icone', '🥚'), el('span', el('b', premios.ovos.length === 1 ? 'Você ganhou um ovo mágico!' : 'Você ganhou ' + premios.ovos.length + ' ovos mágicos!'))));
      if (premios.cresceu) itens.appendChild(el('li', el('span.premio-icone', '🌟'), el('span', Reino.Progresso.nomeUni(premios.cresceu.id) + ' cresceu!')));
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === sala.id; });
      var faltamRaro = raro && !Reino.Progresso.temUni(raro.id) ? Reino.Progresso.faltamPersistencia({ raridade: 'raro', sala: sala.id }) : 0;
      var dicaRaro = faltamRaro ? el('p.dica-raro', '💙 Mais ' + (faltamRaro === 1 ? '1 vez' : faltamRaro + ' vezes') + ' nesta sala e o unicórnio raro nasce! Ou faça tudo certo de primeira e com calma.')
        : premios.porPersistencia ? el('p.dica-raro', '💙 O unicórnio raro nasceu pela sua persistência!') : null;
      var btn = el('button.btn-grande.btn-principal', { type: 'button' }, premios.ovos.length ? 'Chocar ' + (premios.ovos.length > 1 ? 'os ovos' : 'o ovo') + ' 🥚' : 'Voltar ' + (materia.lugar.artigo === 'a' ? 'à ' : 'ao ') + materia.lugar.nome);
      corpo.appendChild(el('div.fim-sala',
        el('div.fim-emoji', premios.materiaCompleta ? '🌈' : '🎉'),
        el('h2.titulo-pixel', premios.materiaCompleta ? 'Revisão de ' + materia.nome + ' completa!' : 'Sala concluída!'),
        premios.materiaCompleta ? el('p.fim-grande', 'Você completou TODAS as salas! ' + U.reais(Reino.config.valorPorMateria) + ' de ' + materia.nome + ' no baú! 🥳') : el('p', Reino.Claude.frase('fimSala')),
        itens, dicaRaro, btn));
      Reino.UI.focarTroca(btn, corpo.querySelector('.fim-sala h2'), CALMA_TROCA);
      if (premios.primeiraVez) setTimeout(function () { Reino.Som.tocar('moeda'); }, 900);
      Reino.UI.esperarFala([btn, sair], [premios.materiaCompleta ? Reino.Falas.fixas.revisaoCompleta : Reino.Falas.fixas.salaConcluida, Reino.Falas.acertouDePrimeira(acertosPrimeira)], { voz: 'claude' });
      btn.addEventListener('click', function () {
        fechar();
        var depois = function () { if (aoTerminar) aoTerminar(premios); };
        if (premios.ovos.length) Reino.UI.chocarOvos(premios.ovos).then(depois);
        else depois();
      });
      botaoFim = btn;
    }

    intro();
  };

  Reino.Missao = M;
})();
