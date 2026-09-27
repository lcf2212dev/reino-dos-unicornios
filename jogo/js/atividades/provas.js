/* Escola do Reino: provas bimestrais valendo acessório para o unicórnio.
   Uma questão por vez e sem correção no meio. No fim, pergunta se ela quer revisar
   e só depois mostra a nota. Acertou tudo na 1ª tentativa: lendário; na 2ª: raro; depois: comum. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, P = Reino.Progresso;
  var EV = Reino.EVENTOS;
  var Pv = {};
  var RARIDADES = ['lendario', 'raro', 'comum'];
  var QUANDO = { lendario: '1ª tentativa', raro: '2ª tentativa', comum: '3ª em diante' };
  var MAX_AVISOS_PRESSA = 3;
  // troca de tela pelo teclado: o Enter/Espaço que chega logo depois no controle novo não vale
  var CALMA_TROCA = 400;

  function rar(r) { return Reino.Unicornios.RARIDADES[r]; }
  function est() { return P.estado(); }

  /* ---------- acessórios ---------- */
  Pv.acessorios = function () {
    var lista = [];
    Reino.provas.forEach(function (pv) {
      RARIDADES.forEach(function (r) { lista.push(Object.assign({ raridade: r, provaId: pv.id }, pv.acessorios[r])); });
    });
    return lista;
  };
  Pv.acessorio = function (id) { return Pv.acessorios().find(function (a) { return a.id === id; }) || null; };
  Pv.icone = function (id, px) { return PA.paraDOM(PA.iconeDesenho('acessorio:' + id), PA.escalaNitida(px || 36, 16), 'icone-acessorio'); };

  // o unicórnio de montaria usando o acessório (para ela ver como fica)
  Pv.previa = function (id, escala) {
    var uid = P.montaria(), u = est().unis[uid];
    var e = Reino.Unicornios.estagio(u ? u.xp : 0);
    return PA.paraDOM(PA.unicornio(P.defUni(uid), e, 0, { enfeites: [id] }), escala || 5, 'previa-acessorio');
  };

  Pv.formatarNota = function (n) { return String(Math.round(n * 10) / 10).replace('.', ','); };

  // a fonte pixel não tem maiúsculas com acento (LENDÁRIO sairia LENDARIO): o nome fica como está
  function rotuloRaridade(r) { return el('span.chip-rar.rar-' + r, rar(r).emoji + ' ' + rar(r).nome); }

  // quadro que deixa a regra bem clara: o que cada tentativa vale
  Pv.quadroPremios = function (prova) {
    var reg = P.regProva(prova);
    var valendo = P.valendoProva(prova);
    var lista = el('ol.quadro-premios');
    RARIDADES.forEach(function (r, i) {
      var a = prova.acessorios[r];
      var ganhou = reg.premio === r;
      var agora = valendo === r;
      var passou = !ganhou && !agora && (reg.premio || (reg.tentativas || 0) > i) && r !== 'comum';
      var status = ganhou ? el('span.premio-status.ganhou', '✓ Ganhou!')
        : agora ? el('span.premio-status.agora', '⭐ VALENDO AGORA')
        : passou ? el('span.premio-status.passou', 'Já passou') : null;
      lista.appendChild(el('li.linha-premio.rar-' + r + (agora ? '.agora' : '') + (passou ? '.passou' : '') + (ganhou ? '.ganhou' : ''),
        el('span.premio-quando', QUANDO[r]),
        Pv.icone(a.id, 40),
        el('span.premio-info', rotuloRaridade(r), el('b', a.nome)),
        status));
    });
    return el('div.quadro-premios-caixa',
      el('p.quadro-premios-titulo', '🎁 Acertou TUDO? Ganha um acessório!'),
      lista,
      el('p.quadro-premios-nota', '👀 Quanto antes você acertar tudo, mais raro é o prêmio. Leia com atenção desde a primeira vez!'));
  };

  /* ---------- a construção ---------- */
  Pv.telaEscola = function () {
    var pn = Reino.UI.painel('lugar', '🏫 Escola do Reino');
    var c = pn.conteudo;
    c.appendChild(el('div.lugar-guia', PA.paraDOM(PA.claude(0), 3, 'claude-intro'), el('p', Reino.Falas.provas.escola)));
    Reino.Som.falar(Reino.Falas.provas.escola, { voz: 'claude' });
    var lista = el('div.lista-salas');
    Reino.provas.forEach(function (prova) {
      var reg = P.regProva(prova);
      var valendo = P.valendoProva(prova);
      var chips = el('span.sala-chips',
        valendo ? el('span.chip-mini.valendo.rar-' + valendo, 'Valendo: ' + rar(valendo).emoji + ' ' + rar(valendo).nome) : null,
        reg.premio ? el('span.chip-mini.ok', '✓ ' + rar(reg.premio).emoji + ' ' + prova.acessorios[reg.premio].nome) : null,
        reg.tentativas ? el('span.chip-mini', reg.tentativas + (reg.tentativas === 1 ? ' tentativa' : ' tentativas')) : null,
        reg.tentativas ? el('span.chip-mini', 'Melhor nota: ' + Pv.formatarNota(reg.melhor || 0)) : null);
      var b = el('button.sala-card.cartao-prova', { type: 'button' },
        el('span.sala-emoji', prova.emoji),
        el('span.sala-info', el('b', prova.nome), el('small', prova.bimestre + ' • ' + prova.questoes.length + ' questões'), chips),
        el('span.sala-ir', reg.premio ? 'Treinar →' : reg.tentativas ? 'De novo →' : 'Fazer →'));
      b.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        Pv.iniciar(prova, function () { Reino.UI.fecharTela(pn.tela); Pv.telaEscola(); U.emit(EV.MAPA_MUDOU); });
      });
      lista.appendChild(b);
    });
    c.appendChild(lista);
    var plano = el('button.btn-grande.btn-secundario', { type: 'button' }, '📜 Ver o Plano da Prova');
    plano.addEventListener('click', Reino.UI.telaPlano);
    c.appendChild(el('div.intro-botoes', plano));
  };

  /* ---------- a prova ---------- */
  Pv.iniciar = function (prova, aoTerminar) {
    Reino.Voz.carregar('prova-' + prova.id);
    var materia = Reino.materia(prova.materiaId);
    var reg = P.regProva(prova);
    var valendo = P.valendoProva(prova);
    var tentativa = (reg.tentativas || 0) + 1;
    var questoes = prova.questoes;
    var respostas = questoes.map(function () { return null; });
    var prontas = questoes.map(function () { return false; });
    // a ordem das alternativas é a da folha; o tipo pode preparar a sua uma vez (def.prepararProva: blocos de
    // montar frase e itens de ordenar embaralhados, peças de letras do copiar)
    var ordens = questoes.map(function (d) {
      if (d.opcoes) return d.opcoes.map(function (_, i) { return i; });
      var def = D.tipoDe(d);
      return def && def.prepararProva ? def.prepararProva(d) : null;
    });
    var avisosPressa = 0;

    var tela = Reino.UI.abrirTela('prova');
    var sair = el('button.btn-icone.btn-sair', { type: 'button', 'aria-label': 'Sair da prova' }, '✕');
    var pontos = el('div.missao-pontos', { 'aria-hidden': 'true' });
    var titulo = el('div.missao-titulo', el('span', (prova.emoji || '📝') + ' ' + prova.nome));
    var faixa = el('div.faixa-valendo' + (valendo ? '.rar-' + valendo : '.treino'), { hidden: true },
      valendo ? [Pv.icone(prova.acessorios[valendo].id, 28), el('span', 'Valendo: acessório ', el('b', rar(valendo).nome.toLowerCase()), '. Acerte TUDO!')]
        : el('span', '✏️ Treino: o acessório desta prova você já ganhou.'));
    var corpo = el('div.missao-corpo');
    var rodape = el('footer.missao-rodape.prova-rodape', { hidden: true });
    tela.appendChild(el('header.missao-topo', sair, titulo, pontos));
    Reino.Desafios.ajustarTitulo(titulo, prova.materiaId);
    tela.appendChild(faixa);
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    document.body.classList.add('em-missao');

    function fechar() {
      Reino.Som.calar(); Reino.Claude.limpar();
      document.body.classList.remove('em-missao');
      Reino.UI.fecharTela(tela);
    }
    var botaoFim = null;   // no resultado, o "Voltar à Escola": a tentativa já contou e o ✕ faz o mesmo que ele
    sair.addEventListener('click', function () {
      if (botaoFim) { botaoFim.click(); return; }
      Reino.UI.confirmar('Quer sair da prova? Esta tentativa não vai contar e as respostas não ficam guardadas.', 'Sair', 'Continuar').then(function (sim) {
        if (sim) { fechar(); if (aoTerminar) aoTerminar(null); }
      });
    });

    function pintarPontos(atual) {
      pontos.innerHTML = '';
      questoes.forEach(function (_, i) { pontos.appendChild(el('span.ponto' + (prontas[i] ? '.feito' : '') + (i === atual ? '.atual' : ''))); });
    }

    function capa() {
      rodape.hidden = true; faixa.hidden = true;
      corpo.innerHTML = '';
      var fala = valendo ? Reino.Falas.provas.valendo[valendo] : Reino.Falas.provas.treino;
      var ir = el('button.btn-grande.btn-principal', { type: 'button' }, 'Começar a prova ✏️');
      corpo.appendChild(el('div.intro-sala.capa-prova',
        el('div.intro-emoji', prova.emoji),
        el('h2.titulo-pixel', prova.nome),
        el('p.intro-paginas', materia.nome + ' • ' + prova.bimestre + ' • ' + questoes.length + ' questões'),
        el('div.selo-tentativa' + (valendo ? '.rar-' + valendo : ''), el('small', 'Esta é a sua'), el('b', tentativa + 'ª tentativa')),
        valendo ? el('div.previa-valendo.rar-' + valendo, Pv.previa(prova.acessorios[valendo].id, 6),
          el('p', 'Valendo agora: ', el('b', prova.acessorios[valendo].nome), ' ', rotuloRaridade(valendo))) : null,
        Pv.quadroPremios(prova),
        el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', fala)),
        el('ul.intro-regras',
          el('li', '📝 Uma questão de cada vez.'),
          el('li', '⏳ Sem relógio. Pode ir devagar!'),
          el('li', '👀 No fim, você pode revisar antes de ver a nota.')),
        el('div.intro-botoes', ir)));
      corpo.scrollTop = 0;
      // ouvir antes de seguir: "Começar" e ✕ esperam a fala acabar
      Reino.UI.esperarFala([ir, sair], [fala], { voz: 'claude' });
      ir.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        Reino.Prova.ritual(corpo, est().ritualVisto).then(function () {
          est().ritualVisto = true; P.salvar();
          mostrarQuestao(0, false);
        });
        // teclado: o botão sumiu com o conteúdo; o foco vai para o 1º botão do ritual
        var rit = corpo.querySelector('.ritual');
        if (rit) Reino.UI.focarTroca(rit, rit.querySelector('h2'), CALMA_TROCA);
      });
    }

    // detector gentil de pressa: lembra de ler tudo (no máximo 3 vezes por prova)
    function tempoMinimo(d) {
      var t = D.textoParaFala(d);
      // texto de apoio: conta tudo o que ela precisa ler
      if (d.apoio) t += Reino.Falas.segmentosApoio(d.apoio).join(' ');
      // instrucao: a linha de como responder, logo abaixo da pergunta
      if (d.instrucao) t += ' ' + d.instrucao;
      var def = D.tipoDe(d);
      if (def && def.textoProva) t += def.textoProva(d);
      else if (d.itens) t += d.itens.map(function (x) { return typeof x === 'string' ? x : x.t; }).join(' ');
      if (d.frases) t += d.frases.map(function (f) { return f.antes + f.depois; }).join(' ');
      if (d.pares) t += d.pares.map(function (p) { return (p[0].t || '') + p[1].t; }).join(' ');
      return U.clamp(1500 + t.length * 32, 2500, 9000);
    }

    var leitura = 0;   // a leitura em curso (uma questão nova cancela a anterior)
    // antes: fala do Claude num balão antes da leitura (o começo da revisão); a questão é lida quando ela acaba
    function mostrarQuestao(i, revisando, antes) {
      var d = questoes[i];
      Reino.Claude.limpar(); Reino.Som.calar();
      corpo.innerHTML = '';
      rodape.innerHTML = '';
      rodape.hidden = false;
      faixa.hidden = false;
      var inicio = Date.now(), avisou = false;
      var ctrl = D.render(d, {
        modo: 'prova', ordem: ordens[i], monte: ordens[i], valorInicial: respostas[i],
        // texto de apoio já visto numa questão anterior: começa fechado (no celular e no tablet em pé)
        apoioFechado: !!d.apoio && questoes.slice(0, i).some(function (q) { return q.apoio && (q.apoio === d.apoio || JSON.stringify(q.apoio) === JSON.stringify(d.apoio)); }),
        onMudar: function () { respostas[i] = ctrl.valor(); prontas[i] = ctrl.pronto(); pintarPontos(i); atualizar(); },
      });
      prontas[i] = ctrl.pronto();
      var num = el('div.desafio-num', (revisando ? '👀 Revisando a questão ' : 'Questão ') + (i + 1) + ' de ' + questoes.length);
      corpo.appendChild(num);
      corpo.appendChild(ctrl.card);
      if (revisando) corpo.appendChild(el('p.dica-revisao', 'Leia de novo com calma. Se achar um errinho, é só trocar a resposta.'));
      pintarPontos(i);

      var ant = el('button.btn-grande.btn-secundario', { type: 'button', hidden: i === 0 }, '← Anterior');
      var ultima = i + 1 === questoes.length;
      var prox = el('button.btn-grande.btn-principal', { type: 'button' },
        ultima ? (revisando ? 'Entregar a prova 📝' : 'Terminei ✓') : 'Próxima →');
      // travado pela fala (esperando-fala): quem solta é o fim da fala
      function atualizar() { if (!prox.classList.contains('esperando-fala')) prox.disabled = !ctrl.pronto(); }
      ant.addEventListener('click', function () { Reino.Som.tocar('toque'); respostas[i] = ctrl.valor(); mostrarQuestao(i - 1, revisando); });
      prox.addEventListener('click', function (ev) {
        if (!ctrl.pronto()) return;
        respostas[i] = ctrl.valor();
        if (!revisando && !avisou && avisosPressa < MAX_AVISOS_PRESSA && Date.now() - inicio < tempoMinimo(d)) {
          avisou = true; avisosPressa++;
          Reino.Som.tocar('toque');
          Reino.Claude.falar(Reino.Claude.frase('pressa'), { tipo: 'pressa', agora: true });
          return;
        }
        Reino.Som.tocar('toque');
        // toque (não teclado): o botão da questão nova nasce sob o dedo ("Próxima" da penúltima vira
        // "Entregar a prova"); o 2º toque de um toque duplo ali não vale (guarda do ui/base.js)
        if (ev && ev.isTrusted && ev.detail) Reino.UI.segurarToques();
        if (!ultima) mostrarQuestao(i + 1, revisando);
        else if (revisando) entregar();
        else perguntarRevisao();
      });
      rodape.appendChild(ant);
      rodape.appendChild(el('span.sem-relogio', '⏳ Sem relógio'));
      rodape.appendChild(prox);
      atualizar();
      corpo.scrollTop = 0;
      // teclado ("Próxima", "Anterior", "Começar a prova", "Sim, quero revisar"): o foco vai para o
      // 1º controle da questão (ou para o número dela), não para o body
      Reino.UI.focarTroca(ctrl.card, num, CALMA_TROCA);
      // a questão é lida sozinha (a mesma fala do 🔊); respostas, navegação e ✕ esperam o fim. O 🔊 fica livre
      var vez = ++leitura, alvos = [ctrl.card, ant, prox, sair];
      Array.prototype.forEach.call(ctrl.card.querySelectorAll('.btn-ouvir'), function (b) { b.classList.add('livre-na-fala'); });
      function ler() {
        if (vez !== leitura || !ctrl.card.isConnected || !Reino.config.esperaFala.lerQuestoes) return;
        Reino.UI.esperarFala(alvos, Reino.Falas.segmentosDesafio(d, ctrl.ordem), { voz: 'narradora' });
      }
      if (antes) {
        // o balão só mostra (falar: false); a voz vem da espera, que trava a questão até ela acabar
        Reino.Prova.balaoQueSome(antes, { falar: false });
        Reino.UI.esperarFala(alvos, [antes], { voz: 'claude' }).then(function () {
          // o balão fecha antes da leitura (fechar cala a voz: não pode cortar a questão)
          if (vez === leitura && Reino.Claude.aberto()) Reino.Claude.fechar();
          ler();
        });
      } else ler();
    }

    function perguntarRevisao() {
      Reino.Claude.limpar();
      rodape.hidden = true;
      pintarPontos(-1);
      corpo.innerHTML = '';
      var sim = el('button.btn-grande.btn-principal', { type: 'button' }, '👀 Sim, quero revisar');
      var nao = el('button.btn-grande.btn-secundario', { type: 'button' }, '📝 Não, ver a nota');
      corpo.appendChild(el('div.intro-sala.pergunta-revisao',
        el('div.intro-emoji', '👀'),
        el('h2.titulo-pixel', 'Terminou!'),
        el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', Reino.Falas.provas.perguntaRevisar)),
        el('p.dica-revisao', Reino.Genero.genero('{As campeãs|Os campeões} revisam antes de entregar: é aí que a gente acha os errinhos.')),
        el('div.intro-botoes', nao, sim)));
      Reino.UI.focarTroca(sim, corpo.querySelector('.pergunta-revisao h2'), CALMA_TROCA);
      Reino.UI.esperarFala([sim, nao, sair], [Reino.Falas.provas.perguntaRevisar], { voz: 'claude' });
      sim.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        mostrarQuestao(0, true, Reino.Falas.provas.comecaRevisao);
      });
      nao.addEventListener('click', function () { Reino.Som.tocar('toque'); entregar(); });
    }

    function entregar() {
      Reino.Claude.limpar();
      var pts = questoes.map(function (d, i) { return D.pontuar(d, respostas[i]); });
      // Aura: questão inteira certa soma, toda errada tira; nota parcial não conta
      Reino.Aura.contar(pts.map(function (p) { return p === 1 ? true : p === 0 ? false : null; }));
      // nota de 0 a 10, qualquer que seja o número de questões (Inglês tem 11)
      var soma = pts.reduce(function (t, p) { return t + p; }, 0);
      var nota = soma === pts.length ? 10 : Math.min(9.9, Math.round(soma / pts.length * 100) / 10);
      var premios = P.registrarProva(prova, nota);
      resultado(premios, pts);
    }

    function resultado(premios, pts) {
      rodape.hidden = true; faixa.hidden = true;
      pintarPontos(-1);
      corpo.innerHTML = '';
      var a = premios.acessorio;
      var titulo, fala;
      if (a) { titulo = rar(premios.raridade).emoji + ' Acessório ' + rar(premios.raridade).nome.toLowerCase() + '!'; fala = Reino.Falas.provas.ganhou[premios.raridade]; }
      else if (premios.sucesso) { titulo = 'Nota 10! 🏆'; fala = Reino.Falas.provas.treinoDez; }
      else if (premios.proximo) { titulo = 'Quase lá!'; fala = Reino.Falas.provas.quase[premios.proximo]; }
      else { titulo = 'Treino feito! 💪'; fala = Reino.Falas.provas.treinoFeito; }

      var caixa = el('div.fim-sala.resultado-prova');
      caixa.appendChild(el('div.nota-folha' + (premios.sucesso ? '.nota-dez' : ''), el('small', 'Nota'), el('b', Pv.formatarNota(premios.nota)), el('small', 'de 10')));
      caixa.appendChild(el('h2.titulo-pixel', titulo));
      caixa.appendChild(el('div.intro-claude', PA.paraDOM(PA.claude(0), 4, 'claude-intro'), el('p', fala)));

      var botoes = el('div.intro-botoes');
      if (a) {
        caixa.appendChild(el('div.previa-valendo.ganhou.rar-' + premios.raridade, Pv.previa(a.id, 7),
          el('p', el('b', a.nome), ' ', rotuloRaridade(premios.raridade))));
        var usar = el('button.btn-grande.btn-principal', { type: 'button' }, 'Colocar no meu unicórnio ✨');
        usar.addEventListener('click', function () {
          if (!Reino.UI.usandoEnfeite(a.id)) Reino.UI.alternarEnfeite(a.id);
          P.salvar(); U.emit(EV.MAPA_MUDOU);
          Reino.Som.tocar('estrela');
          usar.disabled = true; U.preencher(usar, '✓ Já está usando!');
          // o botão desligado perdeu o foco (ia para o body): pelo teclado, segue no "Voltar à Escola"
          if (Reino.UI.porTeclado()) Reino.UI.focarTeclado(voltar);
        });
        botoes.appendChild(usar);
      } else if (premios.proximo) {
        var prox = prova.acessorios[premios.proximo];
        caixa.appendChild(el('div.proximo-premio.rar-' + premios.proximo,
          Pv.icone(prox.id, 48),
          el('p', el('small', 'A ' + (premios.tentativa + 1) + 'ª tentativa vale:'), el('br'), el('b', prox.nome), ' ', rotuloRaridade(premios.proximo))));
      }

      var itens = el('ul.premios',
        el('li', el('span.premio-icone', '⭐'), el('span', '+' + premios.estrelas + ' estrelas')),
        premios.cresceu ? el('li', el('span.premio-icone', '🌟'), el('span', P.nomeUni(premios.cresceu.id) + ' cresceu!')) : null);
      caixa.appendChild(itens);

      // correção: na 1ª tentativa errada só mostra ONDE tem errinho (para ela procurar com atenção);
      // quando já não vale lendário nem raro, mostra também a resposta certa
      var mostrarCerta = !premios.proximo || premios.proximo === 'comum';
      var lista = el('ol.correcao');
      questoes.forEach(function (d, i) {
        var ok = pts[i] === 1;
        var li = el('li.correcao-item' + (ok ? '.certa' : '.errinho'),
          el('p', el('b', (ok ? '✓ ' : '🔎 ') + 'Questão ' + (i + 1)), ok ? ' certinha!' : ' tem errinho (' + Pv.formatarNota(pts[i]) + ' de 1)'));
        // def.extraCorrecao (desenho: a miniatura) aparece sempre na correção
        var def = D.tipoDe(d), extra = def && def.extraCorrecao ? def.extraCorrecao(d, respostas[i]) : null;
        if (extra) li.appendChild(extra);
        if (!ok) {
          li.appendChild(el('p.correcao-enunciado', D.enunciado(d)));
          if (mostrarCerta) {
            li.appendChild(el('p.erro-sua', 'Você respondeu: ' + D.respostaTexto(d, respostas[i])));
            li.appendChild(el('p.erro-certa', D.linhaCerta(d)));
            li.appendChild(el('p.erro-explica', d.explica));
          }
          if (materia && d.livro) {
            var livro = el('button.btn-pequeno', { type: 'button' }, '📖 Ver no livro');
            livro.addEventListener('click', function () { Reino.UI.abrirLivro(materia, d.livro); });
            li.appendChild(livro);
          }
        }
        lista.appendChild(li);
      });
      if (!premios.sucesso) {
        caixa.appendChild(el('h3', mostrarCerta ? 'Vamos aprender com as que faltaram:' : 'Procure o errinho com atenção:'));
        if (!mostrarCerta) caixa.appendChild(el('p.dica-revisao', 'Não vou contar a resposta ainda: leia de novo no livro e descubra! 🔎'));
      }
      if (!premios.sucesso || questoes.some(function (d) { var def = D.tipoDe(d); return !!(def && def.extraCorrecao); })) caixa.appendChild(lista);

      var voltar = el('button.btn-grande' + (a ? '.btn-secundario' : '.btn-principal'), { type: 'button' }, 'Voltar à Escola');
      voltar.addEventListener('click', function () { fechar(); if (aoTerminar) aoTerminar(premios); });
      botaoFim = voltar;
      botoes.appendChild(voltar);
      if (!premios.sucesso) {
        var denovo = el('button.btn-grande.btn-secundario', { type: 'button' }, 'Tentar de novo ✏️');
        denovo.addEventListener('click', function () { fechar(); Pv.iniciar(prova, aoTerminar); });
        botoes.appendChild(denovo);
      }
      caixa.appendChild(botoes);
      corpo.appendChild(caixa);
      corpo.scrollTop = 0;
      Reino.UI.focarTroca(botoes.querySelector('.btn-principal'), caixa.querySelector('h2'), CALMA_TROCA);

      Reino.Som.tocar(a ? 'fanfarra' : premios.sucesso ? 'acerto' : 'toque');
      if (a) { Reino.UI.confete(premios.raridade === 'lendario' ? 160 : 90); setTimeout(function () { Reino.Som.tocar('estrela'); }, 700); }
      Reino.UI.esperarFala([botoes, sair], [fala], { voz: 'claude' });
    }

    capa();
  };

  Reino.Provas = Pv;
})();
