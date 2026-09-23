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
  };

  F.medalhas = {
    ouro: { emoji: '🥇', titulo: 'MEDALHA DE OURO!', frase: 'Viu? O ouro veio de acertar com calma, não de terminar primeiro! Na prova da escola é igualzinho. 💛' },
    prata: { emoji: '🥈', titulo: 'Medalha de prata!', frase: 'Muito bem! Vamos ler o Livro das Memórias e tentar o ouro de novo? Com calma você chega lá!' },
    bronze: { emoji: '🥉', titulo: 'Medalha de bronze!', frase: 'Você terminou e revisou, isso já é de campeã! Vamos revisar as salas e tentar de novo?' },
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
    var L = (materia.livro || []).find(function (l) { return l.id === d.livro; });
    return L ? F.pistaLivro(L.titulo) : F.fixas.pistaSimples;
  };

  // o que a narradora lê no botão 🔊 de um desafio (opções na ordem da tela)
  F.segmentosDesafio = function (d, ordem) {
    if (d.tipo === 'vf') return [F.fixas.verdadeiroOuFalso, d.afirmacao];
    var segs = [d.pergunta];
    if ((d.tipo === 'escolha' || d.tipo === 'varias') && d.opcoes) {
      (ordem || d.opcoes.map(function (_, i) { return i; })).forEach(function (i) { segs.push(d.opcoes[i].t); });
    }
    return segs;
  };

  /* ---------- lista completa (usada pelas ferramentas de gravação) ---------- */
  F.pacotesDaMateria = function (m) {
    return { extra: m.id + '-extra', livro: m.id + '-livro', sala: function (s) { return m.id + '-' + s.id; } };
  };

  F.todas = function () {
    var lista = [];
    function add(texto, voz, pacote) { if (texto) lista.push({ texto: texto, voz: voz, pacote: pacote }); }
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
    return lista;
  };

  Reino.Falas = F;
})();
