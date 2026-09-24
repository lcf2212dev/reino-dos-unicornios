/* Escola do Reino: provas bimestrais valendo acessório para o unicórnio.
   Uma questão por vez e sem correção no meio. No fim, pergunta se ela quer revisar
   e só depois mostra a nota. Acertou tudo na 1ª tentativa: lendário; na 2ª: raro; depois: comum. */
(function () {
  var U = Reino.util, el = U.el, D = Reino.Desafios, P = Reino.Progresso;
  var Pv = {};
  var RARIDADES = ['lendario', 'raro', 'comum'];
  var QUANDO = { lendario: '1ª tentativa', raro: '2ª tentativa', comum: '3ª em diante' };
  var MAX_AVISOS_PRESSA = 3;

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
        Pv.iniciar(prova, function () { Reino.UI.fecharTela(pn.tela); Pv.telaEscola(); U.emit('mapaMudou'); });
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
    // a ordem das alternativas é a da folha; só os blocos de montar frase e os itens de ordenar são embaralhados (uma vez)
    var ordens = questoes.map(function (d) {
      if (d.opcoes) return d.opcoes.map(function (_, i) { return i; });
      if (d.tipo === 'frase' || d.tipo === 'ordenar') {
        var m = U.embaralhar((d.blocos || d.itens).map(function (_, i) { return i; }));
        while (m.every(function (v, i) { return v === i; })) m = U.embaralhar(m);
        return m;
      }
      return null;
    });
    var avisosPressa = 0;

    var tela = Reino.UI.abrirTela('prova');
    var sair = el('button.btn-icone.btn-sair', { type: 'button', 'aria-label': 'Sair da prova' }, '✕');
    var pontos = el('div.missao-pontos', { 'aria-hidden': 'true' });
    var titulo = el('div.missao-titulo', el('span', '📝 ' + prova.nome));
    var faixa = el('div.faixa-valendo' + (valendo ? '.rar-' + valendo : '.treino'), { hidden: true },
      valendo ? [Pv.icone(prova.acessorios[valendo].id, 28), el('span', 'Valendo: acessório ', el('b', rar(valendo).nome.toLowerCase()), '. Acerte TUDO!')]
        : el('span', '✏️ Treino: o acessório desta prova você já ganhou.'));
    var corpo = el('div.missao-corpo');
    var rodape = el('footer.missao-rodape.prova-rodape', { hidden: true });
    tela.appendChild(el('header.missao-topo', sair, titulo, pontos));
    tela.appendChild(faixa);
    tela.appendChild(corpo);
    tela.appendChild(rodape);
    document.body.classList.add('em-missao');

    function fechar() {
      Reino.Som.calar(); Reino.Claude.limpar();
      document.body.classList.remove('em-missao');
      Reino.UI.fecharTela(tela);
    }
    sair.addEventListener('click', function () {
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
      Reino.Som.falar(fala, { voz: 'claude' });
      ir.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        Reino.Prova.ritual(corpo, est().ritualVisto).then(function () {
          est().ritualVisto = true; P.salvar();
          mostrarQuestao(0, false);
        });
      });
    }

    // detector gentil de pressa: lembra de ler tudo (no máximo 3 vezes por prova)
    function tempoMinimo(d) {
      var t = D.textoParaFala(d);
      if (d.itens) t += d.itens.map(function (x) { return typeof x === 'string' ? x : x.t; }).join(' ');
      if (d.frases) t += d.frases.map(function (f) { return f.antes + f.depois; }).join(' ');
      if (d.pares) t += d.pares.map(function (p) { return (p[0].t || '') + p[1].t; }).join(' ');
      return U.clamp(1500 + t.length * 32, 2500, 9000);
    }

    function mostrarQuestao(i, revisando) {
      var d = questoes[i];
      Reino.Claude.limpar(); Reino.Som.calar();
      corpo.innerHTML = '';
      rodape.innerHTML = '';
      rodape.hidden = false;
      faixa.hidden = false;
      var inicio = Date.now(), avisou = false;
      var ctrl = D.render(d, {
        modo: 'prova', ordem: ordens[i], monte: ordens[i], valorInicial: respostas[i],
        onMudar: function () { respostas[i] = ctrl.valor(); prontas[i] = ctrl.pronto(); pintarPontos(i); atualizar(); },
      });
      prontas[i] = ctrl.pronto();
      corpo.appendChild(el('div.desafio-num', (revisando ? '👀 Revisando a questão ' : 'Questão ') + (i + 1) + ' de ' + questoes.length));
      corpo.appendChild(ctrl.card);
      if (revisando) corpo.appendChild(el('p.dica-revisao', 'Leia de novo com calma. Se achar um errinho, é só trocar a resposta.'));
      pintarPontos(i);

      var ant = el('button.btn-grande.btn-secundario', { type: 'button', hidden: i === 0 }, '← Anterior');
      var ultima = i + 1 === questoes.length;
      var prox = el('button.btn-grande.btn-principal', { type: 'button' },
        ultima ? (revisando ? 'Entregar a prova 📝' : 'Terminei ✓') : 'Próxima →');
      function atualizar() { prox.disabled = !ctrl.pronto(); }
      ant.addEventListener('click', function () { Reino.Som.tocar('toque'); respostas[i] = ctrl.valor(); mostrarQuestao(i - 1, revisando); });
      prox.addEventListener('click', function () {
        if (!ctrl.pronto()) return;
        respostas[i] = ctrl.valor();
        if (!revisando && !avisou && avisosPressa < MAX_AVISOS_PRESSA && Date.now() - inicio < tempoMinimo(d)) {
          avisou = true; avisosPressa++;
          Reino.Som.tocar('toque');
          Reino.Claude.falar(Reino.Claude.frase('pressa'), { tipo: 'pressa', agora: true });
          return;
        }
        Reino.Som.tocar('toque');
        if (!ultima) mostrarQuestao(i + 1, revisando);
        else if (revisando) entregar();
        else perguntarRevisao();
      });
      rodape.appendChild(ant);
      rodape.appendChild(el('span.sem-relogio', '⏳ Sem relógio'));
      rodape.appendChild(prox);
      atualizar();
      corpo.scrollTop = 0;
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
        el('p.dica-revisao', 'As campeãs revisam antes de entregar: é aí que a gente acha os errinhos.'),
        el('div.intro-botoes', nao, sim)));
      Reino.Som.falar(Reino.Falas.provas.perguntaRevisar, { voz: 'claude' });
      sim.addEventListener('click', function () {
        Reino.Som.tocar('porta');
        mostrarQuestao(0, true);
        Reino.Claude.falar(Reino.Falas.provas.comecaRevisao, { tempo: 6000 });
      });
      nao.addEventListener('click', function () { Reino.Som.tocar('toque'); entregar(); });
    }

    function entregar() {
      Reino.Claude.limpar();
      var pts = questoes.map(function (d, i) { return D.pontuar(d, respostas[i]); });
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
          P.salvar(); U.emit('mapaMudou');
          Reino.Som.tocar('estrela');
          usar.disabled = true; U.preencher(usar, '✓ Já está usando!');
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
        // desenho: a miniatura aparece sempre na correção
        if (d.tipo === 'desenho') { var mini = D.miniaturaDesenho(respostas[i], 3); if (mini) li.appendChild(el('div.correcao-desenho', mini)); }
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
      if (!premios.sucesso || questoes.some(function (d) { return d.tipo === 'desenho'; })) caixa.appendChild(lista);

      var voltar = el('button.btn-grande' + (a ? '.btn-secundario' : '.btn-principal'), { type: 'button' }, 'Voltar à Escola');
      voltar.addEventListener('click', function () { fechar(); if (aoTerminar) aoTerminar(premios); });
      botoes.appendChild(voltar);
      if (!premios.sucesso) {
        var denovo = el('button.btn-grande.btn-secundario', { type: 'button' }, 'Tentar de novo ✏️');
        denovo.addEventListener('click', function () { fechar(); Pv.iniciar(prova, aoTerminar); });
        botoes.appendChild(denovo);
      }
      caixa.appendChild(botoes);
      corpo.appendChild(caixa);
      corpo.scrollTop = 0;

      Reino.Som.tocar(a ? 'fanfarra' : premios.sucesso ? 'acerto' : 'toque');
      if (a) { Reino.UI.confete(premios.raridade === 'lendario' ? 160 : 90); setTimeout(function () { Reino.Som.tocar('estrela'); }, 700); }
      Reino.Som.falar(fala, { voz: 'claude' });
    }

    capa();
  };

  Reino.Provas = Pv;
})();
