/* Missão: a tela de uma sala (Reino.Missao.iniciar): intro, desafios sorteados um a um, retorno do Claude a cada
   conferência e os prêmios no fim. Usa Reino.Desafios. Sala de livro (quarto-bimestre.md §13.3): a intro é a trilha
   e cada etapa tem as cartas e os desafios dela. Objeto interno Reino._missao (criado aqui; missao-etapas.js registra
   nele trilha, fimEtapa, festaTrilha, fechaASala e soma, que recebem a `api` da missão aberta, em M.iniciar). */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios;
  var M = {};
  var ME = Reino._missao = {};
  // troca de tela pelo teclado: o Enter/Espaço que chega logo depois no controle novo não vale
  var CALMA_TROCA = 400;

  M.iniciar = function (materia, sala, aoTerminar) {
    if (Reino.Bimestres.emEspera(materia)) return Reino.Bimestres.avisar().then(function () { if (aoTerminar) aoTerminar(null); });
    var tela = Reino.UI.abrirTela('missao');
    if (materia && materia.cor) tela.style.setProperty('--cor-materia', materia.cor);   // faixa do cabeçalho na cor da matéria (D10-12)
    // sala de livro: as etapas (null nas sorteadas); etapaN = a etapa em curso (-1 = na trilha)
    var etapas = Reino.etapasDaSala && Reino.Etapas ? Reino.etapasDaSala(materia, sala) : null, etapaN = -1;
    var lista = etapas ? [] : D.listaDaSala(sala);
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
    var rodape = el('footer.missao-rodape.rodape-acao', el('span.sem-relogio', '⏳ Sem relógio', el('span.sem-relogio-resto', '. O tempo é todo seu!')), btnConferir);
    // o rodapé de ação da intro ("Começar") e do resumo ("← Voltar" e "Continuar →"): fixo, fora do que rola (arte.md §20)
    var acao = el('footer.rodape-acao', { hidden: true });
    var retorno = el('div.missao-retorno', { hidden: true });

    tela.appendChild(el('header.missao-topo', sair, titulo, trilha));
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    tela.appendChild(acao);
    tela.appendChild(retorno);
    document.body.classList.add('em-missao');
    var ajustarTitulo = D.ajustarTitulo(titulo, materia && materia.id);

    var botaoFim = null;   // no fim da sala, o "Voltar"/"Chocar o ovo": a sala já contou e o ✕ faz o mesmo
    sair.addEventListener('click', function () {
      if (botaoFim) { botaoFim.click(); return; }
      Reino.UI.confirmar(etapas && etapaN >= 0 ? 'Quer sair agora? As etapas que você terminou estão guardadas. Só esta etapa começa de novo.'
        : 'Quer sair da sala agora? Você pode voltar e fazer de novo depois.', 'Sair', 'Continuar aqui').then(function (sim) {
        if (!sim) return;
        fechar();
        if (aoTerminar) aoTerminar(null);
      });
    });

    function fechar() {
      Reino.Som.calar();
      Reino.Claude.limpar();
      soltarGiro();
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
      // sala de livro com mais perguntas que a sorteada: no celular, uma barra estreita no lugar dos pontos (css)
      if (lista.length > Reino.config.desafiosPorSala) trilha.classList.add('trilha-longa');
      if (ajustarTitulo) ajustarTitulo();   // a trilha que aparece estreita o título (celular)
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

    // sala de livro (4º bimestre): o nome do livro da escola no lugar de "Apostila"
    function livroDaSala() {
      var L = sala.livroOrigem && materia && materia.livros && materia.livros[sala.livroOrigem];
      return L ? L.emoji + ' ' + L.nome : 'Apostila';
    }
    function intro() {
      if (etapas) { etapaN = -1; botaoFim = null; ME.trilha(api); return; }
      corpo.innerHTML = '';
      var claudeMini = PA.paraDOM(PA.claude(0), 4, 'claude-intro');
      var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar 🦄');
      corpo.appendChild(el('div.intro-sala',
        el('div.intro-emoji', sala.emoji),
        el('h2.titulo-pixel', U.colado(sala.nome)),
        el('p.intro-paginas', U.colado(livroDaSala() + ': ' + sala.paginas)),
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
      if (cartas.length) Reino.Voz.carregar(pacoteCarta(cartas[0]));
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
    // sala.cartas (sala de livro): as cartas dadas, nessa ordem, mesmo sem a preferência do resumo
    // (na sala de livro, as da etapa: etapa.cartas, ou as citadas pelos desafios dela se a sala não tem `cartas`)
    function cartasPara(ids, desafios) {
      var r = [], achar = function (id) { return materia.livro.find(function (x) { return x.id === id; }); };
      if (!materia || !materia.livro) return r;
      if (ids) ids.forEach(function (id) { var c = achar(id); if (c) r.push(c); });
      else if (Reino.config.esperaFala.resumoNaSala) desafios.forEach(function (d) { var c = achar(d.livro); if (c && r.indexOf(c) < 0) r.push(c); });
      return r;
    }
    var cartas = etapas ? [] : cartasPara(sala.cartas, sala.desafios);
    // pacote de voz de cada carta (por capítulo nas cartas que têm `capitulo`)
    function pacoteCarta(c) { return Reino.Falas.pacoteCarta(materia, c); }
    function resumo(i) {
      Reino.Som.calar();
      corpo.innerHTML = '';
      var area = el('div.livro-carta');
      Reino.UI.desenharCarta(area, cartas[i]);
      var ultima = i === cartas.length - 1, soLeitura = ultima && !lista.length;   // etapa só de leitura: termina na última carta
      // no celular, "Começar 🦄" e só a seta no "Voltar" (o .rotulo-longo some); na carta 1, a vaga guarda o lugar
      // do "Voltar" e o "Continuar" fica sempre no mesmo lugar
      // o de seguir tem a largura do "Começar" da intro (D7-17): na última carta, "Começar 🦄" como lá
      var seguir = el('button.btn-grande.btn-principal', { type: 'button', 'aria-label': soLeitura ? 'Terminar a etapa' : ultima ? 'Começar as perguntas' : null },
        soLeitura ? 'Terminar ✓' : ultima ? 'Começar 🦄' : 'Continuar →');
      var voltar = i > 0 ? el('button.btn-grande.btn-secundario.so-seta', { type: 'button', 'aria-label': 'Voltar' }, '←', el('span.rotulo-longo', ' Voltar')) : null;
      var titulo = el('h2.titulo-pixel', '📖 Resumo');
      corpo.appendChild(el('div.resumo-sala', titulo,
        el('p.resumo-pag', 'Carta ' + (i + 1) + ' de ' + cartas.length), area));
      // 🔊 repete a carta (D7-06), como o do livro
      var ouvir = botaoOuvir(function () {
        Reino.Voz.carregar(pacoteCarta(cartas[i])).then(function () { Reino.UI.ouvirDeNovo(Reino.UI.falaCarta(cartas[i]), { voz: 'narradora' }); });
      });
      var fila = [voltar || el('span.rodape-vaga.so-seta', { 'aria-hidden': 'true' })];
      if (ouvir) fila.push(ouvir);
      fila.push(seguir);
      mostrarAcao('resumo-botoes', fila);
      pintarTrilha('resumo', i);
      var botoes = acao;
      seguir.addEventListener('click', function () { Reino.Som.tocar('toque'); if (soLeitura) terminarEtapa(); else if (ultima) mostrarDesafio(); else resumo(i + 1); });
      if (voltar) voltar.addEventListener('click', function () { Reino.Som.tocar('toque'); resumo(i - 1); });
      corpo.scrollTop = 0;
      Reino.UI.focarTroca(seguir, titulo, CALMA_TROCA);
      // lê a carta (pacote <matéria>-livro ou <matéria>-livro-<capítulo>); com config.esperaFala.travar, botões e ✕ esperam a leitura acabar
      Reino.Voz.carregar(pacoteCarta(cartas[i])).then(function () {
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
        modo: 'missao', aoLivro: sala.ordem === 'livro' && d.livro ? function () { Reino.UI.abrirLivro(materia, d.livro); } : null,
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
        Reino.Aura.contar(true, materia && materia.id);
        Reino.Progresso.salvar();
        Reino.Som.tocar('acerto');
        if (dePrimeira) setTimeout(function () { Reino.Som.tocar('estrela'); }, 350);
        // a estrela ganha sai da opção certa e vai até o contador (D9-17)
        if (dePrimeira) Reino.UI.estrelaVoa(corpo.querySelector('.certa') || btnConferir, pontos);
        mostrarRetorno(true, d, dePrimeira, cresceu);
      } else {
        errouAtual = true;
        Reino.Aura.contar(false, materia && materia.id);
        Reino.Som.tocar('erro');
        ctrl.marcarErro(res);
        mostrarRetorno(false, d, false, null, res);
      }
    }
    btnConferir.addEventListener('click', function () { conferir(false); });

    function mostrarRetorno(ok, d, dePrimeira, cresceu, res) {
      retorno.innerHTML = '';
      retorno.className = 'missao-retorno ' + (ok ? 'retorno-certo' : 'retorno-quase');
      var compacto = window.matchMedia('(max-width: 480px), (max-height: 480px)').matches;
      var fala = ok ? Reino.Claude.frase(dePrimeira ? 'acerto' : 'acertoDepois') : Reino.Claude.frase('erro');
      var extra = null;
      if (!ok && d.tipo === 'varias' && res && res.faltam > 0 && (!res.erradas || !res.erradas.length)) extra = el('p.retorno-extra', 'Dica: ainda falta marcar ' + (res.faltam === 1 ? '1 item' : res.faltam + ' itens') + '!');
      // o tipo diz o que falta (escrever: "Escreva pelo menos 2 frases.")
      if (!ok && res && res.dica) extra = el('p.retorno-extra', res.dica);
      var cab = el('div.retorno-cabeca',
        PA.paraDOM(PA.claude(0), compacto ? 3 : 4, 'claude-retorno'),
        el('div',
          el('h3', ok ? (dePrimeira ? '✨ Isso! +1 ⭐' : '✨ Isso!') : '💭 Quase!'),
          el('p.retorno-fala', fala)));
      retorno.appendChild(cab);
      if (extra) retorno.appendChild(extra);
      // acertou: reforça com a explicação; errou: só uma pista, sem entregar a resposta
      // no celular (D6-08) a explicação é recolhível: fechada no erro, aberta no acerto só se couber
      var explica = el('details.retorno-explica', el('summary', el('b', ok ? '📌 Lembrete' : '📌 Pista')), el('p', ok ? d.explica : pista(d)));
      explica.open = !compacto || ok;
      // abrir/fechar a pista muda a altura da folha: refaz a folga e a rolagem (sem animação)
      if (compacto) explica.addEventListener('toggle', function () { if (!retorno.hidden) ajustarMarca(ok); });
      retorno.appendChild(explica);
      if (cresceu) retorno.appendChild(el('p.retorno-cresceu', '🌟 ' + Reino.Progresso.nomeUni(cresceu.id) + ' cresceu! Agora é ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].nome + ' ' + Reino.Unicornios.ESTAGIOS[cresceu.estagio].emoji));
      var botoes = el('div.retorno-botoes');
      if (ok) {
        var cont = el('button.btn-grande.btn-principal', { type: 'button' }, idx + 1 < lista.length ? 'Continuar →' : etapas && !ME.fechaASala(api) ? 'Terminar a etapa ✨' : 'Terminar a sala 🎉');
        cont.addEventListener('click', function () { Reino.Som.tocar('toque'); retorno.hidden = true; soltarGiro(); corpo.style.paddingBottom = ''; proximo(); });
        botoes.appendChild(cont);
      } else {
        var livro = el('button.btn-grande.btn-secundario', { type: 'button' }, '📖 Ver no livro');
        livro.addEventListener('click', function () { Reino.UI.abrirLivro(materia, d.livro); });
        var denovo = el('button.btn-grande.btn-principal', { type: 'button' }, 'Tentar de novo');
        denovo.addEventListener('click', function () {
          Reino.Som.tocar('toque'); retorno.hidden = true; soltarGiro(); corpo.style.paddingBottom = ''; Reino.Som.calar();
          btnConferir.disabled = !ctrl.pronto();
          // o botão sumiu com o retorno: pelo teclado, o foco volta para o desafio
          Reino.UI.focarTroca(ctrl.card, numAVista(), CALMA_TROCA);
        });
        botoes.appendChild(livro); botoes.appendChild(denovo);
      }
      retorno.appendChild(botoes);
      retorno.hidden = false;
      btnConferir.disabled = true;
      if (compacto) { mostrarMarca(ok); vigiarGiro(ok); }
      function focarBotao() { var b = retorno.querySelector('.btn-principal'); if (b && !retorno.hidden) b.focus(); }
      // "Continuar"/"Tentar de novo"/"Ver no livro" e o ✕ esperam a fala do retorno
      Reino.UI.esperarFala([botoes, sair], ok ? [fala] : [fala, pista(d)], { voz: 'claude' }).then(focarBotao);
      setTimeout(focarBotao, 60);
    }

    // celular: a opção marcada fica acima da folha do retorno (o corpo ganha folga e rola até ela)
    function mostrarMarca(ok) {
      if (ok && retorno.offsetHeight > tela.clientHeight * 0.5) explicaFechar();
      ajustarMarca(ok);
    }
    function ajustarMarca(ok) {
      var alto = retorno.offsetHeight;
      corpo.style.paddingBottom = alto + 'px';
      var marcas = corpo.querySelectorAll(ok ? '.certa, .tudo-certo' : '.errada, .item-erro');
      if (!marcas.length) return;
      var baixo = 0;
      Array.prototype.forEach.call(marcas, function (m) { baixo = Math.max(baixo, m.getBoundingClientRect().bottom); });
      var falta = baixo + 8 - retorno.getBoundingClientRect().top;
      if (falta > 0) corpo.scrollTop += falta;
    }
    // girou/redimensionou com a folha aberta: reajusta; o listener sai quando o retorno fecha
    var giro = null;
    function vigiarGiro(ok) {
      soltarGiro();
      giro = function () { if (retorno.hidden || !retorno.isConnected) soltarGiro(); else ajustarMarca(ok); };
      window.addEventListener('resize', giro);
    }
    function soltarGiro() { if (giro) window.removeEventListener('resize', giro); giro = null; }
    function explicaFechar() { var e = retorno.querySelector('.retorno-explica'); if (e) e.open = false; }

    // pista depois de um erro: primeira frase da explicação, sem a resposta pronta
    function pista(d) { return Reino.Falas.pista(d, materia); }

    function proximo() {
      idx++;
      if (idx < lista.length) { mostrarDesafio(); return; }
      if (etapas) terminarEtapa(); else terminar();
    }

    /* ---------- etapas (sala de livro) ---------- */
    // abre a etapa n: as cartas dela e depois os desafios dela, com a contagem só dela
    function comecarEtapa(n) {
      var e = etapas[n];
      etapaN = n; botaoFim = null;
      lista = e.desafios.slice();
      cartas = cartasPara(sala.cartas ? e.cartas : null, e.desafios);
      idx = 0; acertosPrimeira = 0; pressas = 0; ultimaPressa = -10;
      Reino.Som.tocar('porta');
      if (cartas.length) resumo(0); else if (lista.length) mostrarDesafio(); else terminarEtapa();
    }
    // guarda a etapa; a última da rodada conta a sala (a tela de sempre); a última ⭐ da trilha, a festa do prêmio
    function terminarEtapa() {
      pintarTrilha('fim');
      rodape.hidden = true; acao.hidden = true;   // (a etapa só de leitura termina no rodapé de ação da carta)
      var r = Reino.Etapas.concluirEtapa(materia, sala, etapaN, { acertosPrimeira: acertosPrimeira, total: lista.length, pressas: pressas });
      var fimSala = r && r.sala ? function () { terminar(r.sala, ME.soma(sala)); } : null;   // a sala inteira, somada das etapas
      if (r && r.trilha) ME.festaTrilha(api, r.trilha, fimSala);
      else if (fimSala) fimSala();
      else ME.fimEtapa(api, r || { perfeita: acertosPrimeira >= lista.length });
    }
    // o que missao-etapas.js usa desta missão aberta
    var api = {
      materia: materia, sala: sala, etapas: etapas, corpo: corpo, sair: sair, CALMA: CALMA_TROCA,
      mostrarAcao: mostrarAcao, pintarTrilha: pintarTrilha, botaoOuvir: botaoOuvir, livroDaSala: livroDaSala, pacoteCarta: pacoteCarta,
      etapa: function () { return etapaN; },
      comecar: comecarEtapa,
      botaoFim: function (b) { botaoFim = b; },
      fechar: function (premios) { fechar(); if (aoTerminar) aoTerminar(premios || null); },
    };

    // pronto/soma (sala de livro): o retorno de P.concluirSala que a última etapa já chamou e os acertos { a, t } da sala
    function terminar(pronto, soma) {
      pintarTrilha('fim');
      rodape.hidden = true;
      var acertos = soma ? soma.a : acertosPrimeira, total = soma ? soma.t : lista.length;
      var premios = pronto || Reino.Progresso.concluirSala(materia, sala, { acertosPrimeira: acertos, total: total, pressas: pressas });
      corpo.innerHTML = '';
      var itens = el('ul.premios');
      itens.appendChild(el('li', el('span.premio-icone', '⭐'), el('span', 'Acertos de primeira: ', el('b', acertos + ' de ' + total))));
      if (premios.calma) itens.appendChild(el('li', el('span.premio-icone', '🌙'), el('span', el('b', 'Estrela da Calma!'), ' Você leu tudo com calma. +3 ⭐')));
      var valor = Reino.Progresso.valorSala(materia), cartao = premios.primeiraVez && Reino.Cartoes ? Reino.Cartoes.daSala(sala.id) : 0;
      if (premios.primeiraVez) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '🪙'), el('span', el('b', '+ ' + U.moedas(premios.dinheiro)), ' no Baú do Tesouro!')));
      else itens.appendChild(el('li', el('span.premio-icone', '🔁'), el('span', 'Treino livre: ' + (valor === 1 ? 'a 1 moeda desta sala já está no baú.' : 'as ' + U.moedas(valor) + ' desta sala já estão no baú.'))));
      if (premios.bonus) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '🎁'), el('span', el('b', '+ ' + U.moedas(premios.bonus)), ' de bônus por completar ' + materia.nome + '!')));
      // matéria completa (O-36): o total da matéria numa linha só
      if (premios.materiaCompleta) itens.appendChild(el('li.premio-dinheiro', el('span.premio-icone', '🪙'), el('span', materia.nome + ': ', el('b', U.moedas(Reino.config.valorPorMateria)), ' no baú!')));
      if (cartao) itens.appendChild(el('li.premio-cartao', el('span.premio-icone', '🃏'), el('span', el('b', 'Cartão de experiência novo!'))));
      if (premios.primeiraVez && Reino.UI.premioTempo) Reino.UI.premioTempo(itens, sala.id);   // ⏳ tempo de celular
      if (premios.ovos.length) itens.appendChild(el('li.premio-ovo', el('span.premio-icone', '🥚'), el('span', el('b', premios.ovos.length === 1 ? 'Você ganhou um ovo mágico!' : 'Você ganhou ' + premios.ovos.length + ' ovos mágicos!'))));
      if (premios.cresceu) itens.appendChild(el('li', el('span.premio-icone', '🌟'), el('span', Reino.Progresso.nomeUni(premios.cresceu.id) + ' cresceu!')));
      var raro = (materia.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === sala.id; });
      var faltamRaro = raro && !Reino.Progresso.temUni(raro.id) ? Reino.Progresso.faltamPersistencia({ raridade: 'raro', sala: sala.id }) : 0;
      var dicaRaro = faltamRaro ? el('p.dica-raro', '💙 Mais ' + (faltamRaro === 1 ? '1 vez' : faltamRaro + ' vezes') + ' nesta sala e o unicórnio raro nasce! Ou faça tudo certo de primeira e com calma.')
        : premios.porPersistencia ? el('p.dica-raro', '💙 O unicórnio raro nasceu pela sua persistência!') : null;
      var btn = el('button.btn-grande.btn-principal', { type: 'button' }, premios.ovos.length ? 'Chocar ' + (premios.ovos.length > 1 ? 'os ovos' : 'o ovo') + ' 🥚' : 'Voltar ' + (materia.lugar.artigo === 'a' ? 'à ' : 'ao ') + materia.lugar.nome);
      // escala de festa (arte.md §16): sala = nível 2, matéria completa = nível 4; uma 🎉 só, a do emoji
      // o ícone no tamanho do nível, em escala inteira: 16×3 = 48 px (matéria completa), 16×2 = 32 px (sala)
      var emoji = el('div.fim-emoji', { 'aria-hidden': 'true' }, window.PA.iconeEmoji(premios.materiaCompleta ? '🌈' : '🎉', premios.materiaCompleta ? 3 : 2));
      var titulo = el('h2.titulo-pixel', premios.materiaCompleta ? 'Revisão de ' + materia.nome + ' completa!' : 'Sala concluída!');
      // matéria completa (O-36): a folha mais justa (ui-missao.css), para o botão caber sem rolar
      corpo.appendChild(el('div.fim-sala' + (premios.materiaCompleta ? '.fim-materia' : ''), emoji, titulo,
        premios.materiaCompleta ? el('p.fim-grande', 'Você completou TODAS as salas! 🥳') : el('p', Reino.Claude.frase('fimSala').replace(/\s*🎉/g, '')),
        itens, dicaRaro, btn));
      Reino.UI.festa(premios.materiaCompleta ? 4 : 2, { titulo: titulo, emoji: emoji });
      Reino.UI.focarTroca(btn, corpo.querySelector('.fim-sala h2'), CALMA_TROCA);
      Reino.UI.esperarFala([btn, sair], [premios.materiaCompleta ? Reino.Falas.fixas.revisaoCompleta : Reino.Falas.fixas.salaConcluida, Reino.Falas.acertouDePrimeira(acertos)], { voz: 'claude' });
      btn.addEventListener('click', function () {   // depois da tela: as moedas voando até o HUD, o baú do cartão e os ovos
        fechar();
        var UI = Reino.UI, seq = Promise.resolve();
        if (premios.primeiraVez && UI.festaMoedas) seq = seq.then(function () { return UI.festaMoedas(premios.dinheiro + (premios.bonus || 0)); });
        if (cartao && UI.abrirCartaoBau) seq = seq.then(function () { return UI.abrirCartaoBau(cartao); });
        if (premios.ovos.length) seq = seq.then(function () { return UI.chocarOvos(premios.ovos); });
        if (premios.primeiraVez && UI.casaMoveisPendentes) seq = seq.then(function () { return UI.casaMoveisPendentes(); });   // casa.md §12: o móvel da sala, antes do kit
        if (premios.primeiraVez && Reino.Progresso.materiaCompleta(materia) && UI.casaKitsPendentes) seq = seq.then(function () { return UI.casaKitsPendentes(); });
        seq.then(function () { if (aoTerminar) aoTerminar(premios); });
      });
      botaoFim = btn;
    }

    intro();
  };

  Reino.Missao = M;
})();
