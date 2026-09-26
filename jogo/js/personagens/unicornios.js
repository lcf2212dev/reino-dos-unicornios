/* Regras do deck de unicórnios: raridades, crescimento e o primeiro unicórnio. */
(function () {
  var U = {};

  U.ESTAGIOS = [
    { nome: 'Bebê', emoji: '🍼', xp: 0 },
    { nome: 'Pequeno', emoji: '🌱', xp: 30 },
    { nome: 'Jovem', emoji: '✨', xp: 80 },
    { nome: 'Adulto', emoji: '👑', xp: 150 },
  ];

  U.RARIDADES = {
    comum: { nome: 'Comum', emoji: '🤍', ordem: 0 },
    raro: { nome: 'Raro', emoji: '💙', ordem: 1 },
    epico: { nome: 'Épico', emoji: '💜', ordem: 2 },
    lendario: { nome: 'Lendário', emoji: '🌈', ordem: 3 },
  };

  // cores que ela pode escolher para o primeiro unicórnio
  U.CORES_INICIAIS = {
    rosa: { nome: 'Rosa', corpo: '#fff5fa', crina: ['#ff7eb6', '#b58cff', '#7fd6ff'], chifre: '#ffd34d' },
    lilas: { nome: 'Lilás', corpo: '#f3ecff', crina: ['#9b7bff', '#ff9cc6', '#ffe066'], chifre: '#ffcf5c' },
    ceu: { nome: 'Azul-céu', corpo: '#eef8ff', crina: ['#5fb4ff', '#8ee3c8', '#ffffff'], chifre: '#ffb3d9' },
    menta: { nome: 'Menta', corpo: '#effff7', crina: ['#39c5bb', '#ff9cc6', '#ffe066'], chifre: '#ffd34d' },
  };

  /** @param {string} corEscolhida @returns {Omit<UnicornioBaralho, 'materiaId'>} */
  function inicial(corEscolhida) {
    var c = U.CORES_INICIAIS[corEscolhida] || U.CORES_INICIAIS.rosa;
    return { id: 'inicial', nome: 'Estrelinha', raridade: 'comum', inicial: true,
      cores: { corpo: c.corpo, crina: c.crina, chifre: c.chifre },
      frase: 'Fui o seu primeiro unicórnio. Vamos crescer juntas!' };
  }

  // todos os unicórnios do deck, na ordem de exibição
  /** @param {string} [corInicial] @returns {UnicornioBaralho[]} */
  U.todos = function (corInicial) {
    /** @type {UnicornioBaralho[]} */
    var lista = [Object.assign(inicial(corInicial), { materiaId: null })];
    Reino.materias.forEach(function (m) {
      (m.unicornios || []).forEach(function (u) { lista.push(Object.assign({ materiaId: m.id }, u)); });
    });
    return lista;
  };

  U.def = function (id, corInicial) {
    if (id === 'inicial') return inicial(corInicial);
    for (var i = 0; i < Reino.materias.length; i++) {
      var m = Reino.materias[i];
      var u = (m.unicornios || []).find(function (x) { return x.id === id; });
      if (u) return Object.assign({ materiaId: m.id }, u);
    }
    return null;
  };

  U.estagio = function (xp) {
    var e = 0;
    for (var i = 0; i < U.ESTAGIOS.length; i++) if ((xp || 0) >= U.ESTAGIOS[i].xp) e = i;
    return e;
  };

  // quanto falta para o próximo estágio (0 a 1)
  U.progressoEstagio = function (xp) {
    xp = xp || 0;
    var e = U.estagio(xp);
    if (e >= U.ESTAGIOS.length - 1) return { estagio: e, pct: 1, falta: 0 };
    var a = U.ESTAGIOS[e].xp, b = U.ESTAGIOS[e + 1].xp;
    return { estagio: e, pct: (xp - a) / (b - a), falta: b - xp };
  };

  // dica de como ganhar (para as cartas ainda escondidas)
  U.comoGanhar = function (def) {
    var m = def.materiaId ? Reino.materia(def.materiaId) : null;
    var sala = m && def.sala ? m.salas.find(function (s) { return s.id === def.sala; }) : null;
    if (def.raridade === 'comum' && sala) return 'Conclua a sala "' + sala.nome + '".';
    var P = Reino.Progresso;
    var faltam = P && !P.temUni(def.id) ? P.faltamPersistencia(def) : null;
    var resto = function () { return faltam ? ' (' + (faltam === 1 ? 'falta 1' : 'faltam ' + faltam) + ')' : ''; };
    var pers = Reino.config.persistencia;
    if (def.raridade === 'raro' && sala) return 'Faça a sala "' + sala.nome + '" com tudo certo de primeira e com calma, ou jogue a sala ' + pers.sala + ' vezes' + resto() + '. Treinar também vale!';
    if (def.raridade === 'epico' && def.treino === 'ouro') return 'Ganhe OURO no Treino da Medalha de ' + (m ? m.nome : '') + ', ou termine esse treino ' + pers.treinoOuro + ' vezes' + resto() + '. Treinar também vale!';
    if (def.raridade === 'epico' && def.treino === 'perfeito') return 'Acerte TODAS no Treino da Medalha de ' + (m ? m.nome : '') + ', ou termine esse treino ' + pers.treinoPerfeito + ' vezes' + resto() + '. Treinar também vale!';
    if (def.raridade === 'lendario' && m) return 'Complete a revisão de ' + m.nome + ' (todas as salas).';
    return 'Continue revisando!';
  };

  Reino.Unicornios = U;
})();
