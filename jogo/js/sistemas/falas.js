/* Tudo o que o jogo fala em voz alta. O jogo usa estas frases, e as
   ferramentas usam Falas.todas() para gravar os áudios com vozes naturais.
   Números e nomes que a Mariana digita não são falados (só aparecem na tela).
   Tipos (Fala, FalasApi, Desafio): jogo/ferramentas/testes/tipos-jogo.d.ts. */
(function () {
  /** @type {FalasApi} */
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
    plano: 'Meu plano da prova. Um: respiro três vezes. Dois: leio cada pergunta duas vezes. Três: respondo com calma. Quatro: reviso tudo, do começo ao fim. Cinco: só entrego depois de revisar. Terminar por último é coisa de {campeã|campeão}!',
    revisar: 'Chegou a parte mais importante: REVISAR! É aqui que {as campeãs|os campeões} encontram os errinhos. Toque em cada questão com calma. 👀',
    pistaEspecial: 'Os que estavam certos ficaram no lugar. Leia de novo com calma e tente só os que faltam.',
    pistaVarias: 'Os errados foram tirados. Veja se falta marcar algum!',
    pistaSimples: 'Leia a pergunta de novo, devagarinho.',
    pistaDesenho: 'Olhe a listinha embaixo do desenho: ainda falta usar alguma coisa!',
  };

  F.medalhas = {
    ouro: { emoji: '🥇', titulo: 'MEDALHA DE OURO!', frase: 'Viu? O ouro veio de acertar com calma, não de terminar primeiro! Na prova da escola é igualzinho. 💛' },
    prata: { emoji: '🥈', titulo: 'Medalha de prata!', frase: 'Muito bem! Vamos ler o livro da matéria e tentar o ouro de novo? Com calma você chega lá!' },
    bronze: { emoji: '🥉', titulo: 'Medalha de bronze!', frase: 'Você terminou e revisou, isso já é de {campeã|campeão}! Vamos revisar as salas e tentar de novo?' },
  };

  // Escola do Reino: provas bimestrais valendo acessório (lendário na 1ª tentativa, raro na 2ª, comum depois)
  F.provas = {
    escola: '{Bem-vinda|Bem-vindo} à Escola do Reino! Aqui ficam as provas bimestrais. Acertou tudo na primeira tentativa? Ganha um acessório lendário! 🌈',
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
    treinoFeito: 'Treino feito! Cada revisão deixa você mais {preparada|preparado} para a prova da escola. 💪',
    lojaPremio: 'Esse acessório é prêmio da Escola do Reino! Acerte tudo na prova para ganhar. Na primeira tentativa, o prêmio é lendário! 🏫',
  };

  /* Falas com marcador de gênero ({campeã|campeão}, sistemas/genero.js): quem lê F.fixas.plano recebe a versão de
     quem joga (um getter); a gravação (F.todas) lê o texto cru e grava as duas versões. */
  var CRUS = [];
  function comGenero(o) {
    var crus = {};
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string' && /\{[^{}|]*\|[^{}|]*\}/.test(v)) {
        crus[k] = v;
        Object.defineProperty(o, k, { enumerable: true, configurable: true, get: function () { return Reino.Genero.genero(crus[k]); } });
      } else if (v && typeof v === 'object') comGenero(v);
    });
    CRUS.push({ o: o, crus: crus });
  }
  function cru(o, k) {
    for (var i = 0; i < CRUS.length; i++) if (CRUS[i].o === o && Object.prototype.hasOwnProperty.call(CRUS[i].crus, k)) return CRUS[i].crus[k];
    return o[k];
  }
  [F.fixas, F.medalhas, F.provas].forEach(comGenero);

  var NOME_RARIDADE = { comum: 'comum', raro: 'raro', epico: 'épico', lendario: 'lendário' };
  F.ovo = function (raridade) { return 'Um ovo ' + NOME_RARIDADE[raridade] + '! Toque nele 3 vezes para chocar!'; };
  F.acertouDePrimeira = function (n) { return 'Você acertou ' + n + ' de primeira.'; };
  F.acertouDeTotal = function (n, total) { return 'Você acertou ' + n + ' de ' + total + '.'; };
  // lugar.artigo: 'a' para lugar feminino (a Casa das Palavras); sem ele, masculino (o Museu, a Torre já diz "do")
  function feminino(m) { return m.lugar.artigo === 'a'; }
  F.tutorialMapa = function (m) { return 'Toque no chão para andar (ou use as setas do teclado). Vamos até ' + (feminino(m) ? 'a ' : 'o ') + m.lugar.nome + '? É só tocar ' + (feminino(m) ? 'nela' : 'nele') + '! ' + m.emoji; };
  F.treinoBloqueado = function (m, faltam) {
    return 'O treino de ' + m.nome + ' abre quando você terminar as salas ' + (feminino(m) ? 'da ' : 'do ') + m.lugar.nome + '. Falta' + (faltam === 1 ? ' só 1!' : 'm ' + faltam + '!') + ' Você consegue! 💪';
  };
  F.pistaLivro = function (titulo) { return 'Leia a pergunta de novo, devagarinho. Se precisar, abra o livro em "' + titulo + '".'; };

  // pista depois de um erro: ajuda sem entregar a resposta
  F.pista = function (d, materia) {
    if (d.dica) return d.dica;
    // def.pista: nome da frase fixa do tipo (ex.: 'pistaEspecial')
    var def = tipoDe(d);
    if (def && def.pista) return F.fixas[def.pista];
    var L = (materia.livro || []).find(function (l) { return l.id === d.livro; });
    return L ? F.pistaLivro(L.titulo) : F.fixas.pistaSimples;
  };

  // def do tipo do desafio (Reino.registrarTipoDesafio, js/atividades/desafios.js; carregado depois deste)
  function tipoDe(d) {
    var defs = Reino.tiposDesafio;
    return defs && Object.prototype.hasOwnProperty.call(defs, d.tipo) ? defs[d.tipo] : null;
  }

  // Na leitura automática e no 🔊, só a pergunta; instruções e respostas ficam na tela.
  // Tipos sem pergunta (vf) fornecem os segmentos do próprio enunciado.
  F.segmentosDesafio = function (d, ordem) {
    var pergunta = /** @type {any} */ (d).pergunta;
    if (pergunta) return [pergunta];
    function todos(lista) { return ordem || lista.map(function (_, i) { return i; }); }
    var def = tipoDe(d);
    return def && def.falas ? def.falas(d, todos, []) : [];
  };
  // texto de apoio de uma questão (d.apoio: título e partes com lista ou texto), lido no 🔊 da caixa do texto
  F.segmentosApoio = function (apoio) {
    if (!apoio) return [];
    var segs = [];
    if (apoio.titulo) segs.push(apoio.titulo);
    (apoio.partes || []).forEach(function (p) {
      if (p.titulo) segs.push(p.titulo);
      (p.lista || []).forEach(function (t) { segs.push(t); });
      if (p.texto) segs.push(p.texto);
    });
    return segs;
  };
  F.fraseComLacuna = function (f) { return f.antes + ' ______' + (/^[.,!?]/.test(f.depois) ? '' : ' ') + f.depois; };

  /* ---------- lista completa (usada pelas ferramentas de gravação) ---------- */
  F.pacotesDaMateria = function (m) {
    return { extra: m.id + '-extra', livro: m.id + '-livro', sala: function (s) { return m.id + '-' + s.id; } };
  };

  F.todas = function () {
    /** @type {Fala[]} */
    var lista = [];
    // cada trecho «em inglês» vira uma fala separada da voz 'ingles' (mesma divisão de Voz.falar); texto com
    // marcador de gênero vira as duas versões, e {nome} vira o da Mariana (Reino.Genero.versoes)
    function add(texto, voz, pacote) {
      if (texto) Reino.Genero.versoes(texto).forEach(function (t) {
        Reino.Voz.dividir(t, voz).forEach(function (p) { lista.push({ texto: p.texto, voz: p.voz, pacote: pacote }); });
      });
    }

    // Claude: banco de frases e frases fixas
    var bancos = Reino.Claude.FALAS;
    Object.keys(bancos).forEach(function (k) { bancos[k].forEach(function (t) { add(t, 'claude', 'geral'); }); });
    Object.keys(F.fixas).forEach(function (k) { add(cru(F.fixas, k), k === 'verdadeiroOuFalso' ? 'narradora' : 'claude', 'geral'); });
    Object.keys(F.medalhas).forEach(function (k) { add(F.medalhas[k].titulo, 'claude', 'geral'); add(cru(F.medalhas[k], 'frase'), 'claude', 'geral'); });
    ['comum', 'raro', 'epico', 'lendario'].forEach(function (r) { add(F.ovo(r), 'claude', 'geral'); });
    for (var n = 0; n <= Reino.config.desafiosPorSala; n++) add(F.acertouDePrimeira(n), 'claude', 'geral');
    for (var a = 0; a <= Reino.config.perguntasTreino; a++) add(F.acertouDeTotal(a, Reino.config.perguntasTreino), 'claude', 'geral');
    if (Reino.Unicornios) { var ini = /** @type {any} */ (Reino.Unicornios.def('inicial')); add(ini.fraseCrua || ini.frase, 'unicornio', 'geral'); }

    function addGrupo(o) { Object.keys(o).forEach(function (k) { var v = cru(o, k); if (typeof v === 'string') add(v, 'claude', 'geral'); else addGrupo(v); }); }
    addGrupo(F.provas);
    (Reino.provas || []).forEach(function (pv) {
      pv.questoes.forEach(function (d) {
        F.segmentosDesafio(d).concat(F.segmentosApoio(d.apoio)).forEach(function (t) { add(t, 'narradora', 'prova-' + pv.id); });
      });
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
          F.segmentosDesafio(d).concat(F.segmentosApoio(d.apoio)).forEach(function (t) { add(t, 'narradora', p.sala(s)); });
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
    // módulos (js/nucleo/modulos.js), na ordem de registro: cuidados, surpresa, fotos… (pacote geral se não disserem)
    (Reino.modulos || []).forEach(function (modulo) {
      if (typeof modulo.falas === 'function') modulo.falas().forEach(function (f) { add(f.texto, f.voz || 'claude', f.pacote || 'geral'); });
    });
    // o que a Loja fala de novo (prêmios à venda)
    var FL = (Reino.LojaItens && Reino.LojaItens.FALAS) || {};
    Object.keys(FL).forEach(function (k) { add(FL[k], 'claude', 'geral'); });
    return lista;
  };

  Reino.Falas = F;
})();
