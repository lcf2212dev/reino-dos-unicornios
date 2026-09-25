/* Treino da Medalha de Ouro: ritual da calma, prova sem relógio,
   revisão obrigatória antes de entregar e medalha só pelos acertos. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios;
  var Pr = {};
  var CALMA_TROCA = 400;   // como em provas.js: o Enter/Espaço logo depois da troca não vale no botão novo
  // os ícones de texto (📝, 🥚) só ganham o tamanho final no MutationObserver de pixelart.js (uma
  // microtarefa depois): o foco que rola a tela até um botão espera por eles, senão o rodapé cresce
  // uns pixels depois e o botão focado fica com a pontinha escondida
  function depoisDosIcones(fn) { Promise.resolve().then(fn); }

  function sortearQuestoes(materia) {
    var todos = [];
    // questão pessoal (livre) não entra: não tem resposta certa
    function treinavel(d) { return D.TREINAVEIS.indexOf(d.tipo) >= 0 && !d.livre; }
    materia.salas.forEach(function (s) { s.desafios.forEach(function (d) { if (treinavel(d)) todos.push(d); }); });
    // pega de todas as salas, de forma equilibrada
    var porSala = materia.salas.map(function (s) { return U.embaralhar(s.desafios.filter(treinavel)); });
    var lista = [], i = 0;
    while (lista.length < Reino.config.perguntasTreino && lista.length < todos.length) {
      var s = porSala[i % porSala.length];
      if (s.length) lista.push(s.shift());
      i++;
    }
    return U.embaralhar(lista);
  }

  // Ritual da Calma: 3 respirações com o balão de arco-íris
  Pr.ritual = function (cont, podePular) {
    return new Promise(function (resolver) {
      cont.innerHTML = '';
      var balao = el('div.balao-respira', el('div.balao-cor'));
      var texto = el('p.respira-texto', 'Vamos respirar fundo antes da prova?');
      var contagem = el('p.respira-conta', '');
      var pular = el('button.btn-grande.btn-secundario', { type: 'button', hidden: !podePular }, 'Já respirei, pular');
      var comecar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar a respirar 🎈');
      var titulo = el('h2.titulo-pixel', 'Ritual da Calma');
      var ritual = el('div.ritual', titulo, balao, texto, contagem, el('div.intro-botoes', comecar, pular));
      cont.appendChild(ritual);
      var fim = false;
      pular.addEventListener('click', function () { fim = true; resolver(); });
      comecar.addEventListener('click', function (ev) {
        comecar.hidden = true;
        // teclado (Enter/Espaço: detail 0): o botão sumiu e o foco ia para o body; vai para o
        // "Já respirei, pular" (quando aparece) ou para o título do ritual. Toque e mouse: nada muda
        if (ev && !ev.detail) Reino.UI.focarTroca(ritual, titulo, CALMA_TROCA);
        var ciclo = 0;
        function passo() {
          if (fim) return;
          if (ciclo >= 3) {
            Reino.util.preencher(texto, Reino.Falas.fixas.ritualFim);
            contagem.textContent = '';
            Reino.Som.falar(texto.textContent, { voz: 'claude' });
            setTimeout(function () { if (!fim) { fim = true; resolver(); } }, 1800);
            return;
          }
          ciclo++;
          contagem.textContent = 'Respiração ' + ciclo + ' de 3';
          Reino.util.preencher(texto, Reino.Falas.fixas.ritualPuxa);
          Reino.Som.falar(texto.textContent, { voz: 'claude' });
          balao.classList.remove('esvazia'); balao.classList.add('enche');
          Reino.Som.tocar('respira');
          setTimeout(function () {
            if (fim) return;
            Reino.util.preencher(texto, Reino.Falas.fixas.ritualSolta);
            Reino.Som.falar(texto.textContent, { voz: 'claude' });
            balao.classList.remove('enche'); balao.classList.add('esvazia');
            setTimeout(passo, 3200);
          }, 3200);
        }
        Reino.Som.falar(Reino.Falas.fixas.ritualInicio, { voz: 'claude' }).then(function () { setTimeout(passo, 300); });
      });
    });
  };

  Pr.iniciar = function (materia, aoTerminar) {
    Reino.Voz.carregarMateria(materia);
    var tela = Reino.UI.abrirTela('prova');
    var P = Reino.Progresso, est = P.estado();
    var questoes = sortearQuestoes(materia);
    var respostas = questoes.map(function () { return null; });
    var ordens = questoes.map(function (d) { return d.opcoes ? U.embaralhar(d.opcoes.map(function (_, i) { return i; })) : null; });
    var revisadas = questoes.map(function () { return false; });
    var atual = 0, fase = 'ritual';

    var sair = el('button.btn-icone.btn-sair', { type: 'button', 'aria-label': 'Sair do treino' }, '✕');
    var titulo = el('div.missao-titulo', el('span', '🥇 Treino da Medalha: ' + materia.nome));
    var corpo = el('div.missao-corpo');
    var rodape = el('footer.missao-rodape.prova-rodape', { hidden: true });
    tela.appendChild(el('header.missao-topo', sair, titulo));
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    document.body.classList.add('em-missao');

    function fechar() {
      Reino.Som.calar(); Reino.Claude.limpar();
      document.body.classList.remove('em-missao');
      Reino.UI.fecharTela(tela);
    }
    sair.addEventListener('click', function () {
      Reino.UI.confirmar('Quer sair do treino? As respostas desta vez não serão guardadas.', 'Sair', 'Continuar').then(function (sim) {
        if (sim) { fechar(); if (aoTerminar) aoTerminar(null); }
      });
    });

    function plano() {
      corpo.innerHTML = '';
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar o treino ✏️');
      corpo.appendChild(el('div.intro-sala',
        el('div.intro-emoji', '🥇'),
        el('h2.titulo-pixel', 'Meu Plano da Prova'),
        Reino.UI.cartaoPlano(),
        el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'),
          el('p', 'Aqui é igual à prova da escola: você responde tudo, REVISA tudo e só depois entrega. A medalha vem dos acertos, não da pressa!')),
        el('div.intro-botoes', ir)));
      ir.addEventListener('click', function () { Reino.Som.tocar('porta'); fase = 'prova'; mostrarQuestao(0); });
      Reino.Som.falar(Reino.Falas.fixas.plano, { voz: 'claude' });
      // teclado: o ritual saiu da tela e o foco ia para o body; vai para "Começar o treino"
      Reino.UI.focarTroca(ir, corpo.querySelector('.intro-sala h2'), CALMA_TROCA);
    }

    function mostrarQuestao(i, modoRevisao) {
      atual = i;
      var d = questoes[i];
      corpo.innerHTML = '';
      rodape.innerHTML = '';
      rodape.hidden = false;
      var ctrl = D.render(d, {
        modo: 'prova', ordem: d.tipo === 'vf' ? [0, 1] : ordens[i], valorInicial: respostas[i],
        onMudar: function () { respostas[i] = ctrl.valor(); if (modoRevisao) { revisadas[i] = false; } atualizarBotoes(); },
      });
      var num = el('div.desafio-num', (modoRevisao ? '👀 Revisando a questão ' : 'Questão ') + (i + 1) + ' de ' + questoes.length);
      corpo.appendChild(num);
      corpo.appendChild(ctrl.card);
      if (modoRevisao) corpo.appendChild(el('p.dica-revisao', 'Leia de novo com calma. Se tiver certeza, toque em "Revisei ✓". Se quiser, pode trocar a resposta.'));

      var ant = el('button.btn-grande.btn-secundario', { type: 'button' }, '← Anterior');
      var prox = el('button.btn-grande.btn-principal', { type: 'button' });
      function atualizarBotoes() {
        if (modoRevisao) Reino.util.preencher(prox, 'Revisei ✓');
        else Reino.util.preencher(prox, i + 1 < questoes.length ? 'Próxima →' : 'Ir para a revisão 👀');
        prox.disabled = modoRevisao ? !ctrl.pronto() : false;
      }
      ant.hidden = modoRevisao || i === 0;
      ant.addEventListener('click', function () { Reino.Som.tocar('toque'); mostrarQuestao(i - 1); });
      prox.addEventListener('click', function () {
        Reino.Som.tocar('toque');
        respostas[i] = ctrl.valor();
        if (modoRevisao) { revisadas[i] = true; telaRevisao(false, i); return; }
        if (i + 1 < questoes.length) mostrarQuestao(i + 1);
        else telaRevisao(true);
      });
      if (modoRevisao) {
        var voltar = el('button.btn-grande.btn-secundario', { type: 'button' }, '← Lista');
        voltar.addEventListener('click', function () { telaRevisao(false, i, true); });
        rodape.appendChild(voltar);
      } else rodape.appendChild(ant);
      rodape.appendChild(el('span.sem-relogio', '⏳ Sem relógio'));
      rodape.appendChild(prox);
      atualizarBotoes();
      corpo.scrollTop = 0;
      // teclado ("Começar o treino", "Próxima", "Anterior", uma questão da lista de revisão): o foco
      // vai para o 1º controle da questão (ou para o número dela), não para o body. Toque: nada muda
      Reino.UI.focarTroca(ctrl.card, num, CALMA_TROCA);
    }

    // de: a questão que ela acabou de revisar (ou de onde voltou com "← Lista"); voltou: foi pelo "← Lista"
    function telaRevisao(primeiraVez, de, voltou) {
      fase = 'revisao';
      corpo.innerHTML = '';
      rodape.innerHTML = '';
      var faltamRev = revisadas.filter(function (r) { return !r; }).length;
      var semResp = respostas.filter(function (r) { return r == null || (Array.isArray(r) && !r.length); }).length;
      var lista = el('ol.lista-revisao');
      var itens = [];
      questoes.forEach(function (d, i) {
        var r = respostas[i];
        var vazia = r == null || (Array.isArray(r) && !r.length);
        var item = el('li', el('button.item-revisao' + (revisadas[i] ? '.revisado' : '') + (vazia ? '.vazio' : ''), { type: 'button' },
          el('span.rev-num', String(i + 1)),
          el('span.rev-texto', el('b', D.enunciado(d).slice(0, 70) + (D.enunciado(d).length > 70 ? '…' : '')), el('br'), el('span.rev-resp', 'Sua resposta: ' + D.respostaTexto(d, r))),
          el('span.rev-status', revisadas[i] ? '✓ Revisei' : (vazia ? '✏️ Responder' : '👀 Revisar'))));
        item.firstChild.addEventListener('click', function () { Reino.Som.tocar('toque'); mostrarQuestao(i, true); });
        itens.push(item.firstChild);
        lista.appendChild(item);
      });
      var entregar = el('button.btn-grande.btn-principal.btn-entregar', { type: 'button', disabled: faltamRev > 0 || semResp > 0 }, 'Entregar a prova 📝');
      var aviso = el('p.aviso-revisao', faltamRev > 0
        ? '👀 Falta revisar ' + faltamRev + (faltamRev === 1 ? ' questão' : ' questões') + '. Toque em cada uma, leia de novo e toque em "Revisei ✓".'
        : '✅ Tudo revisado! Agora sim, pode entregar com orgulho.');
      corpo.appendChild(el('div.revisao',
        el('h2.titulo-pixel', 'Hora de revisar!'),
        el('p', 'As campeãs revisam a prova inteirinha antes de entregar. Toque em cada questão.'),
        aviso, lista));
      rodape.hidden = false;
      rodape.appendChild(el('span.sem-relogio', revisadas.filter(Boolean).length + ' de ' + questoes.length + ' revisadas'));
      rodape.appendChild(entregar);
      entregar.addEventListener('click', function () { Reino.Som.tocar('toque'); resultado(); });
      if (primeiraVez) Reino.Claude.falar(Reino.Falas.fixas.revisar);
      // teclado: a lista entrou no lugar da questão e o foco ia para o body. Vai para a próxima
      // questão ainda sem revisar (depois da que ela revisou; "← Lista": a mesma de antes) ou, tudo
      // revisado, para "Entregar a prova". Na 1ª vez, o título fica à vista se a questão não couber;
      // voltando de uma questão, a lista rola até ela. Toque: nada muda
      var alvo = null;
      if (voltou && de != null) alvo = itens[de];
      else if (!entregar.disabled) alvo = entregar;
      else for (var k = 0; k < itens.length && !alvo; k++) { var j = ((de == null ? -1 : de) + 1 + k) % itens.length; if (!revisadas[j]) alvo = itens[j]; }
      var tit = corpo.querySelector('.revisao h2');
      if (!Reino.UI.porTeclado() || !alvo) return;
      depoisDosIcones(function () {
        if (!alvo.isConnected) return;
        if (de == null) { corpo.scrollTop = 0; Reino.UI.focarTroca(alvo, tit, CALMA_TROCA); }
        else Reino.UI.focarTeclado(alvo, CALMA_TROCA);
      });
    }

    function resultado() {
      fase = 'resultado';
      rodape.hidden = true;
      var acertos = questoes.filter(function (d, i) { return D.conferirValor(d, respostas[i]); }).length;
      var premios = P.registrarTreino(materia, acertos, questoes.length);
      var med = premios.medalha;
      var M = Reino.Falas.medalhas[med];
      var info = [M.emoji, M.titulo, M.frase];
      Reino.Som.tocar(med === 'ouro' ? 'fanfarra' : 'acerto');
      corpo.innerHTML = '';
      var erradas = el('div.lista-erros');
      questoes.forEach(function (d, i) {
        if (D.conferirValor(d, respostas[i])) return;
        erradas.appendChild(el('div.erro-item',
          el('p', el('b', (i + 1) + '. '), D.enunciado(d)),
          el('p.erro-sua', 'Você marcou: ' + D.respostaTexto(d, respostas[i])),
          el('p.erro-certa', D.linhaCerta(d)),
          el('p.erro-explica', d.explica)));
      });
      var voltar = el('button.btn-grande.btn-principal', { type: 'button' }, premios.ovos.length ? 'Chocar ' + (premios.ovos.length > 1 ? 'os ovos' : 'o ovo') + ' 🥚' : 'Voltar ao castelo');
      // caminho da persistência: quantos treinos faltam para cada épico
      function dicaEpicos() {
        var linhas = (materia.unicornios || []).filter(function (u) { return u.raridade === 'epico' && !P.temUni(u.id); }).map(function (u) {
          var f = P.faltamPersistencia({ raridade: 'epico', treino: u.treino, materiaId: materia.id });
          if (!f) return null;
          return el('p.dica-raro', '💜 Mais ' + (f === 1 ? '1 treino' : f + ' treinos') + ' e nasce um unicórnio épico! ' + (u.treino === 'ouro' ? 'Ou ganhe OURO.' : 'Ou acerte TODAS.'));
        }).filter(Boolean);
        return linhas.length ? el('div', linhas) : null;
      }
      corpo.appendChild(el('div.fim-sala.resultado-prova',
        el('div.medalha-grande.medalha-' + med, info[0]),
        el('h2.titulo-pixel', info[1]),
        el('p.fim-grande', 'Você acertou ' + acertos + ' de ' + questoes.length + '!'),
        el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', info[2])),
        el('ul.premios',
          el('li', el('span.premio-icone', '⭐'), el('span', '+' + premios.estrelas + ' estrelas')),
          premios.ovos.length ? el('li.premio-ovo', el('span.premio-icone', '🥚'), el('b', premios.ovos.length > 1 ? 'Ovos épicos!' : 'Um ovo ÉPICO!')) : null),
        dicaEpicos(),
        erradas.children.length ? el('h3', 'Vamos aprender com as que faltaram:') : null,
        erradas.children.length ? erradas : null,
        voltar));
      Reino.Som.falar([info[1], Reino.Falas.acertouDeTotal(acertos, questoes.length), info[2]], { voz: 'claude' });
      // teclado ("Entregar a prova"): o botão sumiu e o foco ia para o body; vai para o botão do fim
      // (ou para o título, do começo da tela, se o botão ainda não aparece: o Tab leva a ele).
      // Toque: nada muda
      if (Reino.UI.porTeclado()) depoisDosIcones(function () {
        if (!voltar.isConnected) return;
        corpo.scrollTop = 0;
        Reino.UI.focarTroca(voltar, corpo.querySelector('.resultado-prova h2'), CALMA_TROCA);
      });
      voltar.addEventListener('click', function () {
        fechar();
        var depois = function () { if (aoTerminar) aoTerminar(premios); };
        if (premios.ovos.length) Reino.UI.chocarOvos(premios.ovos).then(depois); else depois();
      });
    }

    Pr.ritual(corpo, est.ritualVisto).then(function () {
      est.ritualVisto = true; P.salvar();
      plano();
    });
  };

  Reino.Prova = Pr;
})();
