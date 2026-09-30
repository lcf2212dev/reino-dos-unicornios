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
    // a trilha da sala no cabeçalho (D7-21): um livrinho por carta do resumo e um ponto por pergunta, com o
    // "Carta N de M"/"Desafio N de M" ao lado (no celular, o texto fica no corpo: o cabeçalho não tem lugar)
    var trilhaCartas = el('div.trilha-cartas', { 'aria-hidden': 'true' });
    var trilhaTexto = el('span.trilha-texto');
    var trilha = el('div.missao-trilha', trilhaTexto, trilhaCartas, pontos);
    var titulo = el('div.missao-titulo', el('span', sala.emoji + ' ' + sala.nome));
    var corpo = el('div.missao-corpo');
    var btnConferir = el('button.btn-grande.btn-conferir', { type: 'button', disabled: true }, 'Conferir ✓');
    var rodape = el('footer.missao-rodape.rodape-acao', el('span.sem-relogio', '⏳ Sem relógio. O tempo é todo seu!'), btnConferir);
    // o rodapé de ação da intro ("Começar") e do resumo ("← Voltar" e "Continuar →"): fixo, fora do que rola (ui.md §10.20)
    var acao = el('footer.rodape-acao', { hidden: true });
    var retorno = el('div.missao-retorno', { hidden: true });

    tela.appendChild(el('header.missao-topo', sair, titulo, trilha));
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    tela.appendChild(acao);
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

    // fase: 'intro' (nada feito), 'resumo' (i = a carta aberta), 'desafio' (idx) ou 'fim' (tudo feito)
    function pintarTrilha(fase, i) {
      var carta = fase === 'resumo' ? i : fase === 'intro' ? -1 : cartas.length;
      var desafio = fase === 'desafio' || fase === 'fim' ? idx : -1;
      trilhaCartas.innerHTML = '';
      cartas.forEach(function (_, j) {
        trilhaCartas.appendChild(el('span.carta-marca' + (j < carta ? '.feito' : '') + (j === carta ? '.atual' : '')));
      });
      pontos.innerHTML = '';
      lista.forEach(function (_, j) {
        pontos.appendChild(el('span.ponto' + (j < desafio || fase === 'fim' ? '.feito' : '') + (j === desafio && fase === 'desafio' ? '.atual' : '')));
      });
      trilhaTexto.textContent = fase === 'resumo' ? 'Carta ' + (i + 1) + ' de ' + cartas.length
        : fase === 'desafio' ? 'Desafio ' + (idx + 1) + ' de ' + lista.length : '';
      trilhaTexto.hidden = !trilhaTexto.textContent;
      trilha.className = 'missao-trilha fase-' + fase;   // no celular, a trilha só aparece nas perguntas (css)
    }
    function pintarPontos() { pintarTrilha('desafio'); }

    // troca o rodapé de ação: `tipo` é a classe da fila de botões (intro-botoes, resumo-botoes)
    function mostrarAcao(tipo, botoes) {
      rodape.hidden = true;
      acao.className = 'rodape-acao ' + tipo;
      acao.innerHTML = '';
      botoes.forEach(function (b) { acao.appendChild(b); });
      acao.hidden = false;
    }

    function intro() {
      corpo.innerHTML = '';
      var claudeMini = PA.paraDOM(PA.claude(0), 4, 'claude-intro');
      var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar 🦄');
      corpo.appendChild(el('div.intro-sala',
        el('div.intro-emoji', sala.emoji),
        el('h2.titulo-pixel', U.colado(sala.nome)),
        el('p.intro-paginas', U.colado('Apostila: ' + sala.paginas)),
        el('div.intro-claude', claudeMini, el('p', U.colado(sala.intro))),
        // no celular, as 3 regras viram uma linha de ícones com o nome curto (.regra-curta)
        el('ul.intro-regras.regras-da-sala',
          el('li', '⏳', el('span.regra-longa', ' Aqui não tem relógio. Pode ir devagar!'), el('span.regra-curta', 'Sem relógio')),
          el('li', '👀', el('span.regra-longa', ' Leia cada pergunta com calma e depois toque em "Conferir".'), el('span.regra-curta', 'Leia com calma')),
          el('li', '⭐', el('span.regra-longa', ' Acertou de primeira? Ganha estrela!'), el('span.regra-curta', 'Acerto de 1ª')))));
      // 🔊 repete a apresentação da sala (D7-06); fica livre enquanto o Claude fala
      var falaIntro = [sala.nome, sala.intro];
      var ouvir = botaoOuvir(function () { Reino.UI.ouvirDeNovo(falaIntro, { voz: 'claude' }); });
      mostrarAcao('intro-botoes', ouvir ? [ouvir, comecar] : [comecar]);
      pintarTrilha('intro');
      comecar.addEventListener('click', function () { Reino.Som.tocar('porta'); if (cartas.length) resumo(0); else mostrarDesafio(); });
      if (cartas.length) Reino.Voz.carregar(materia.id + '-livro');
      // o pacote de voz pode chegar tarde (rede lenta): só fala se a introdução ainda está na tela
      Reino.Voz.carregarSala(materia, sala).then(function () {
        if (comecar.isConnected) Reino.UI.esperarFala([comecar, sair], falaIntro, { voz: 'claude' });
      });
    }

    // o 🔊 Ouvir do livro no rodapé de ação (só a seta no celular); null sem voz
    function botaoOuvir(aoTocar) {
      if (!Reino.Som.temVoz()) return null;
      var b = el('button.btn-grande.btn-secundario.so-seta.btn-ouvir-sala.livre-na-fala', { type: 'button', 'aria-label': 'Ouvir' }, '🔊', el('span.rotulo-longo', ' Ouvir'));
      b.addEventListener('click', aoTocar);
      return b;
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
      Reino.Som.calar();
      corpo.innerHTML = '';
      var area = el('div.livro-carta');
      Reino.UI.desenharCarta(area, cartas[i]);
      var ultima = i === cartas.length - 1;
      // no celular, "Começar 🦄" e só a seta no "Voltar" (o .rotulo-longo some); na carta 1, a vaga guarda o lugar
      // do "Voltar" e o "Continuar" fica sempre no mesmo lugar
      // o de seguir tem a largura do "Começar" da intro (D7-17): na última carta, "Começar 🦄" como lá
      var seguir = el('button.btn-grande.btn-principal', { type: 'button', 'aria-label': ultima ? 'Começar as perguntas' : null }, ultima ? 'Começar 🦄' : 'Continuar →');
      var voltar = i > 0 ? el('button.btn-grande.btn-secundario.so-seta', { type: 'button', 'aria-label': 'Voltar' }, '←', el('span.rotulo-longo', ' Voltar')) : null;
      var titulo = el('h2.titulo-pixel', '📖 Resumo');
      corpo.appendChild(el('div.resumo-sala', titulo,
        el('p.resumo-pag', 'Carta ' + (i + 1) + ' de ' + cartas.length), area));
      // 🔊 repete a carta (D7-06), como o do livro
      var ouvir = botaoOuvir(function () {
        Reino.Voz.carregar(materia.id + '-livro').then(function () { Reino.UI.ouvirDeNovo(Reino.UI.falaCarta(cartas[i]), { voz: 'narradora' }); });
      });
      var fila = [voltar || el('span.rodape-vaga.so-seta', { 'aria-hidden': 'true' })];
      if (ouvir) fila.push(ouvir);
      fila.push(seguir);
      mostrarAcao('resumo-botoes', fila);
      pintarTrilha('resumo', i);
      var botoes = acao;
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
      acao.hidden = true;
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
      Reino.UI.focarTroca(ctrl.card, numAVista(), CALMA_TROCA);
    }
    // o "Desafio N de M" do corpo (celular) ou o da trilha do cabeçalho: o que estiver à vista
    function numAVista() { var n = corpo.querySelector('.desafio-num'); return n && n.offsetParent ? n : trilhaTexto; }

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
        PA.paraDOM(PA.claude(0), 4, 'claude-retorno'),
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
          Reino.UI.focarTroca(ctrl.card, numAVista(), CALMA_TROCA);
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
      pintarTrilha('fim');
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
