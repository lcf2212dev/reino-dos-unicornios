/* Tudo o que o jogo fala em voz alta. O jogo usa estas frases, e as
   ferramentas usam Falas.todas() para gravar os áudios com vozes naturais.
   Números e nomes que a Mariana digita não são falados (só aparecem na tela). */
(function () {
  var F = {};

  F.fixas = {
    verdadeiroOuFalso: 'Verdadeiro ou falso?',
    salaConcluida: 'Sala concluída!',
    revisaoCompleta: 'Revisão completa!',
    nasceu: 'Nasceu!',
    lendario: 'Um lendário!',
    ovosParaChocar: 'E você tem ovos para chocar! 🥚',
    lojaFaltam: 'Ainda faltam estrelas para esse enfeite. Cada acerto de primeira vale uma estrela! ⭐',
    ritualInicio: 'Puxa o ar pelo nariz, e solta devagarinho pela boca. Três vezes.',
    ritualPuxa: 'Puxa o ar pelo nariz... 🌬️',
    ritualSolta: 'Solta devagarinho pela boca... 🎈',
    ritualFim: 'Muito bem! Agora o cérebro está calminho e pronto. 🧠✨',
    plano: 'Meu plano da prova. Um: respiro três vezes. Dois: leio cada pergunta duas vezes. Três: respondo com calma. Quatro: reviso tudo, do começo ao fim. Cinco: só entrego depois de revisar. Terminar por último é coisa de campeã!',
    revisar: 'Chegou a parte mais importante: REVISAR! É aqui que as campeãs encontram os errinhos. Toque em cada questão com calma. 👀',
    pistaEspecial: 'Os que estavam certos ficaram no lugar. Leia de novo com calma e tente só os que faltam.',
    pistaVarias: 'Os errados foram tirados. Veja se falta marcar algum!',
    pistaSimples: 'Leia a pergunta de novo, devagarinho.',
    pistaDesenho: 'Olhe a listinha embaixo do desenho: ainda falta usar alguma coisa!',
  };

  F.medalhas = {
    ouro: { emoji: '🥇', titulo: 'MEDALHA DE OURO!', frase: 'Viu? O ouro veio de acertar com calma, não de terminar primeiro! Na prova da escola é igualzinho. 💛' },
    prata: { emoji: '🥈', titulo: 'Medalha de prata!', frase: 'Muito bem! Vamos ler o livro da matéria e tentar o ouro de novo? Com calma você chega lá!' },
    bronze: { emoji: '🥉', titulo: 'Medalha de bronze!', frase: 'Você terminou e revisou, isso já é de campeã! Vamos revisar as salas e tentar de novo?' },
  };

  // Escola do Reino: provas bimestrais valendo acessório (lendário na 1ª tentativa, raro na 2ª, comum depois)
  F.provas = {
    escola: 'Bem-vinda à Escola do Reino! Aqui ficam as provas bimestrais. Acertou tudo na primeira tentativa? Ganha um acessório lendário! 🌈',
    valendo: {
      lendario: 'Esta é a sua primeira tentativa! Se acertar tudo, você ganha um acessório lendário para o seu unicórnio. Leia cada pergunta com muita atenção! 🌈',
      raro: 'Esta é a sua segunda tentativa! Se acertar tudo agora, você ganha um acessório raro. Leia cada pergunta com muita atenção! 💙',
      comum: 'Se acertar tudo, você ganha um acessório comum. Leia com calma e atenção! 🤍',
    },
    treino: 'Você já ganhou o acessório desta prova. Agora é treino, para ficar craque! ✏️',
    perguntaRevisar: 'Você respondeu todas as questões! Quer fazer uma revisão da prova antes de ver a nota? 👀',
    comecaRevisao: 'Muito bem! Vamos revisar com calma, uma questão de cada vez. Achou um errinho? É só trocar a resposta.',
    ganhou: {
      lendario: 'Nota dez de primeira! Você ganhou um acessório lendário! 🌈',
      raro: 'Nota dez! Você ganhou um acessório raro! 💙',
      comum: 'Nota dez! Você ganhou um acessório comum! 🤍',
    },
    quase: {
      raro: 'Quase lá! Para ganhar o acessório, precisa acertar tudo. Na próxima tentativa, o prêmio vai ser raro. 💙',
      comum: 'Quase lá! Para ganhar o acessório, precisa acertar tudo. Na próxima tentativa, o prêmio vai ser comum. 🤍',
    },
    treinoDez: 'Nota dez de novo! Você está craque nesta prova! 🏆',
    treinoFeito: 'Treino feito! Cada revisão deixa você mais preparada para a prova da escola. 💪',
    lojaPremio: 'Esse acessório é prêmio da Escola do Reino! Acerte tudo na prova para ganhar. Na primeira tentativa, o prêmio é lendário! 🏫',
  };

  var NOME_RARIDADE = { comum: 'comum', raro: 'raro', epico: 'épico', lendario: 'lendário' };
  F.ovo = function (raridade) { return 'Um ovo ' + NOME_RARIDADE[raridade] + '! Toque nele 3 vezes para chocar!'; };
  F.acertouDePrimeira = function (n) { return 'Você acertou ' + n + ' de primeira.'; };
  F.acertouDeTotal = function (n, total) { return 'Você acertou ' + n + ' de ' + total + '.'; };
  F.tutorialMapa = function (m) { return 'Toque no chão para andar (ou use as setas do teclado). Vamos até o ' + m.lugar.nome + '? É só tocar nele! ' + m.emoji; };
  F.treinoBloqueado = function (m, faltam) {
    return 'O treino de ' + m.nome + ' abre quando você terminar as salas do ' + m.lugar.nome + '. Falta' + (faltam === 1 ? ' só 1!' : 'm ' + faltam + '!') + ' Você consegue! 💪';
  };
  F.pistaLivro = function (titulo) { return 'Leia a pergunta de novo, devagarinho. Se precisar, abra o livro em "' + titulo + '".'; };

  // pista depois de um erro: ajuda sem entregar a resposta
  F.pista = function (d, materia) {
    if (d.dica) return d.dica;
    if (d.tipo === 'ligar' || d.tipo === 'separar' || d.tipo === 'ordenar' || d.tipo === 'frase') return F.fixas.pistaEspecial;
    if (d.tipo === 'varias') return F.fixas.pistaVarias;
    if (d.tipo === 'desenho') return F.fixas.pistaDesenho;
    var L = (materia.livro || []).find(function (l) { return l.id === d.livro; });
    return L ? F.pistaLivro(L.titulo) : F.fixas.pistaSimples;
  };

  // o que a narradora lê no botão 🔊 de um desafio (opções na ordem da tela)
  F.segmentosDesafio = function (d, ordem) {
    if (d.tipo === 'vf') return [F.fixas.verdadeiroOuFalso, d.afirmacao];
    var segs = [d.pergunta];
    function todos(lista) { return ordem || lista.map(function (_, i) { return i; }); }
    if ((d.tipo === 'escolha' || d.tipo === 'varias') && d.opcoes) {
      todos(d.opcoes).forEach(function (i) { segs.push(d.opcoes[i].t); });
    }
    if (d.tipo === 'vfLista') d.itens.forEach(function (it) { segs.push(it.t); });
    if (d.tipo === 'completar') {
      d.palavras.forEach(function (p) { segs.push(p); });
      d.frases.forEach(function (f) { segs.push(F.fraseComLacuna(f)); });
    }
    // lerItens: a narradora lê também os itens (nas provas, que não têm pista)
    if (d.lerItens && d.tipo === 'ligar') {
      d.pares.forEach(function (p) { if (p[0].t) segs.push(p[0].t); });
      todos(d.pares).forEach(function (i) { segs.push(d.pares[i][1].t); });
    }
    if (d.lerItens && d.tipo === 'frase') todos(d.blocos).forEach(function (i) { segs.push(d.blocos[i]); });
    if (d.lerItens && d.tipo === 'ordenar') todos(d.itens).forEach(function (i) { segs.push(d.itens[i]); });
    return segs;
  };
  F.fraseComLacuna = function (f) { return f.antes + ' ______' + (/^[.,!?]/.test(f.depois) ? '' : ' ') + f.depois; };

  /* ---------- lista completa (usada pelas ferramentas de gravação) ---------- */
  F.pacotesDaMateria = function (m) {
    return { extra: m.id + '-extra', livro: m.id + '-livro', sala: function (s) { return m.id + '-' + s.id; } };
  };

  F.todas = function () {
    var lista = [];
    // cada trecho «em inglês» vira uma fala separada da voz 'ingles' (mesma divisão de Voz.falar)
    function add(texto, voz, pacote) {
      if (texto) Reino.Voz.dividir(texto, voz).forEach(function (p) { lista.push({ texto: p.texto, voz: p.voz, pacote: pacote }); });
    }
    var nome = Reino.config.nomeJogadora;

    // Claude: banco de frases e frases fixas
    var bancos = Reino.Claude.FALAS;
    Object.keys(bancos).forEach(function (k) { bancos[k].forEach(function (t) { add(t.replace(/\{nome\}/g, nome), 'claude', 'geral'); }); });
    Object.keys(F.fixas).forEach(function (k) { add(F.fixas[k], k === 'verdadeiroOuFalso' ? 'narradora' : 'claude', 'geral'); });
    Object.keys(F.medalhas).forEach(function (k) { add(F.medalhas[k].titulo, 'claude', 'geral'); add(F.medalhas[k].frase, 'claude', 'geral'); });
    ['comum', 'raro', 'epico', 'lendario'].forEach(function (r) { add(F.ovo(r), 'claude', 'geral'); });
    for (var n = 0; n <= Reino.config.desafiosPorSala; n++) add(F.acertouDePrimeira(n), 'claude', 'geral');
    for (var a = 0; a <= Reino.config.perguntasTreino; a++) add(F.acertouDeTotal(a, Reino.config.perguntasTreino), 'claude', 'geral');
    if (Reino.Unicornios) add(Reino.Unicornios.def('inicial').frase, 'unicornio', 'geral');

    function addGrupo(o) { Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string') add(o[k], 'claude', 'geral'); else addGrupo(o[k]); }); }
    addGrupo(F.provas);
    (Reino.provas || []).forEach(function (pv) {
      pv.questoes.forEach(function (d) { F.segmentosDesafio(d).forEach(function (t) { add(t, 'narradora', 'prova-' + pv.id); }); });
    });

    Reino.materias.forEach(function (m) {
      var p = F.pacotesDaMateria(m);
      add(F.tutorialMapa(m), 'claude', p.extra);
      add(m.guia, 'claude', p.extra);
      for (var f = 1; f <= m.salas.length; f++) add(F.treinoBloqueado(m, f), 'claude', p.extra);
      (m.livro || []).forEach(function (c) {
        add(F.pistaLivro(c.titulo), 'claude', p.extra);
        add(c.titulo, 'narradora', p.livro);
        add(c.texto, 'narradora', p.livro);
      });
      (m.unicornios || []).forEach(function (u) { add(u.frase, 'unicornio', p.extra); });
      m.salas.forEach(function (s) {
        add(s.nome, 'claude', p.extra);
        add(s.intro, 'claude', p.extra);
        s.desafios.forEach(function (d) {
          F.segmentosDesafio(d).forEach(function (t) { add(t, 'narradora', p.sala(s)); });
        });
      });
    });

    // construções por dentro: o que cada personagem pode dizer (com a voz dela) e as falas
    // dos objetos interativos, no pacote de voz do prédio
    (Reino.interiores || []).forEach(function (def) {
      (def.npcs || []).forEach(function (npc) {
        if (!Reino.NPCs) return;
        Reino.NPCs.falasPossiveis(npc, def).forEach(function (f) { add(f.texto, f.voz, def.pacote); });
      });
      (def.objetos || []).forEach(function (obj) {
        [].concat(obj.fala || []).forEach(function (f) { add(f, obj.voz || 'narradora', def.pacote); });
        // baia do Estábulo sem unicórnio ainda (a frase de cada unicórnio já está gravada)
        if (obj.acao && obj.acao.tipo === 'unicornio' && Reino.NPCs) add(Reino.NPCs.BAIA_VAZIA, 'narradora', def.pacote);
      });
    });
    // falas dos prédios que não saem dos NPCs nem dos objetos (ex.: bebedouro da Pet Shop,
    // curiosidades do Observatório): Reino.FALAS_INTERIORES.<prédio>.extras = [{ texto, voz }]
    var FI = Reino.FALAS_INTERIORES || {};
    Object.keys(FI).forEach(function (k) {
      (FI[k].extras || []).forEach(function (f) { add(f.texto, f.voz || 'narradora', 'interior-' + k); });
    });
    // novidades: fome e sede (lembretes, Pet Shop, Estábulo) e pergunta surpresa, no pacote geral
    [Reino.Cuidados, Reino.Surpresa].forEach(function (modulo) {
      if (modulo && typeof modulo.falas === 'function') modulo.falas().forEach(function (f) { add(f.texto, f.voz || 'claude', 'geral'); });
    });
    // o que a Loja fala de novo (prêmios à venda)
    var FL = (Reino.LojaItens && Reino.LojaItens.FALAS) || {};
    Object.keys(FL).forEach(function (k) { add(FL[k], 'claude', 'geral'); });
    return lista;
  };

  Reino.Falas = F;
})();
