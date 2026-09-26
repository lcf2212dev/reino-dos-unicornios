/* Progresso (parte 4 de 4): as regras do jogo sobre o estado — dinheiro, estrelas, unicórnios,
   conclusão de salas e treinos, persistência, provas, área dos pais. Ver o cabeçalho de progresso.js. */
(function () {
  var I = Reino._progresso, P = I.P;
  var agora = I.agora, estadoNovo = I.estadoNovo, numeroOu = I.numeroOu, ORDEM_MEDALHA = I.ORDEM_MEDALHA;

  /* ---------- dinheiro ---------- */
  P.valorSala = function (materia) { return Reino.config.valorPorMateria / materia.salas.length; };
  P.dinheiroMateria = function (materia) {
    var v = 0;
    materia.salas.forEach(function (s) { if (I.estado.salas[s.id] && I.estado.salas[s.id].feita) v += P.valorSala(materia); });
    return Math.round(v * 100) / 100;
  };
  P.dinheiroTotal = function () {
    return Reino.materias.reduce(function (t, m) { return t + P.dinheiroMateria(m); }, 0);
  };
  P.pago = function (materiaId) { return I.estado.pago[materiaId] || 0; };

  P.salasFeitas = function (materia) { return materia.salas.filter(function (s) { return I.estado.salas[s.id] && I.estado.salas[s.id].feita; }).length; };
  P.materiaCompleta = function (materia) { return P.salasFeitas(materia) === materia.salas.length; };

  /* ---------- estrelas ---------- */
  // ganhas/gastas estragadas (texto, NaN) contam como 0: o saldo nunca vira NaN (NaN deixaria tudo de graça)
  P.estrelas = function () { return Math.max(0, numeroOu(I.estado.estrelas.ganhas, 0) - numeroOu(I.estado.estrelas.gastas, 0)); };
  P.ganharEstrelas = function (n) { I.estado.estrelas.ganhas = numeroOu(I.estado.estrelas.ganhas, 0) + n; };
  P.gastarEstrelas = function (n) {
    if (P.estrelas() < n) return false;
    I.estado.estrelas.gastas = numeroOu(I.estado.estrelas.gastas, 0) + n;
    return true;
  };

  /* ---------- unicórnios ---------- */
  P.temUni = function (id) { return !!I.estado.unis[id]; };
  P.defUni = function (id) { return Reino.Unicornios.def(id, I.estado.corInicial); };
  P.nomeUni = function (id) {
    var u = I.estado.unis[id]; var d = P.defUni(id);
    return (u && u.nome) || (d && d.nome) || 'Unicórnio';
  };
  P.ganharUni = function (id) {
    if (I.estado.unis[id]) return false;
    I.estado.unis[id] = { em: agora(), xp: 0, chocado: false };
    return true;
  };
  P.ovosParaChocar = function () {
    return Object.keys(I.estado.unis).filter(function (id) { return !I.estado.unis[id].chocado; });
  };
  P.chocar = function (id) { if (I.estado.unis[id]) I.estado.unis[id].chocado = true; };
  P.montaria = function () {
    var id = I.estado.montaria;
    if (!I.estado.unis[id] || !I.estado.unis[id].chocado) id = 'inicial';
    return id;
  };
  P.xpMontaria = function (n) {
    var id = P.montaria();
    var u = I.estado.unis[id];
    if (!u) return null;
    var antes = Reino.Unicornios.estagio(u.xp);
    u.xp = (u.xp || 0) + n;
    var depois = Reino.Unicornios.estagio(u.xp);
    return depois > antes ? { id: id, estagio: depois } : null;
  };

  /* ---------- conclusões ---------- */
  // resultado: {acertosPrimeira, total, pressas}
  P.concluirSala = function (materia, sala, resultado) {
    var reg = I.estado.salas[sala.id] || { vezes: 0, melhor: 0 };
    var primeiraVez = !reg.feita;
    var perfeita = resultado.acertosPrimeira === resultado.total;
    var calma = resultado.pressas === 0;
    var premios = { primeiraVez: primeiraVez, dinheiro: 0, estrelas: 0, calma: calma, perfeita: perfeita, ovos: [], cresceu: null, materiaCompleta: false };

    reg.vezes = (reg.vezes || 0) + 1;
    reg.melhor = Math.max(reg.melhor || 0, resultado.acertosPrimeira);
    if (primeiraVez) { reg.feita = agora(); premios.dinheiro = P.valorSala(materia); }
    if (perfeita) reg.perfeita = true;
    if (calma) reg.calma = true;
    I.estado.salas[sala.id] = reg;

    premios.estrelas = resultado.acertosPrimeira + (calma ? 3 : 0);
    P.ganharEstrelas(premios.estrelas);

    var unis = materia.unicornios || [];
    var comum = unis.find(function (u) { return u.raridade === 'comum' && u.sala === sala.id; });
    var raro = unis.find(function (u) { return u.raridade === 'raro' && u.sala === sala.id; });
    if (comum && P.ganharUni(comum.id)) premios.ovos.push(comum.id);
    if (raro && (perfeita && calma || P.persistiuSala(sala.id)) && P.ganharUni(raro.id)) {
      premios.ovos.push(raro.id);
      if (!(perfeita && calma)) premios.porPersistencia = true;
    }
    if (P.materiaCompleta(materia)) {
      var lend = unis.find(function (u) { return u.raridade === 'lendario'; });
      if (lend && P.ganharUni(lend.id)) { premios.ovos.push(lend.id); premios.materiaCompleta = true; }
    }
    premios.cresceu = P.xpMontaria(10 + (calma ? 5 : 0));
    P.salvar();
    return premios;
  };

  /* ---------- caminho da persistência ---------- */
  function vezesSala(id) { return (I.estado.salas[id] && I.estado.salas[id].vezes) || 0; }
  function vezesTreino(id) { return (I.estado.treinos[id] && I.estado.treinos[id].vezes) || 0; }
  P.persistiuSala = function (salaId) { return vezesSala(salaId) >= Reino.config.persistencia.sala; };
  // quantas vezes ainda faltam para o unicórnio nascer pela persistência (0 = já pode)
  P.faltamPersistencia = function (def) {
    var pers = Reino.config.persistencia;
    if (def.raridade === 'raro' && def.sala) return Math.max(0, pers.sala - vezesSala(def.sala));
    if (def.raridade === 'epico' && def.treino === 'ouro') return Math.max(0, pers.treinoOuro - vezesTreino(def.materiaId));
    if (def.raridade === 'epico' && def.treino === 'perfeito') return Math.max(0, pers.treinoPerfeito - vezesTreino(def.materiaId));
    return null;
  };
  // dá os raros/épicos que já cumprem a regra (retroativo); devolve os ids novos
  P.conferirPersistencia = function () {
    var novos = [];
    Reino.materias.forEach(function (m) {
      (m.unicornios || []).forEach(function (u) {
        if (u.raridade !== 'raro' && u.raridade !== 'epico') return;
        var def = { raridade: u.raridade, sala: u.sala, treino: u.treino, materiaId: m.id };
        if (P.faltamPersistencia(def) === 0 && P.ganharUni(u.id)) novos.push(u.id);
      });
    });
    if (novos.length) I.estado.atualizado = agora();
    return novos;
  };

  P.medalhaPara = function (acertos, total) {
    var pct = acertos / total;
    if (pct >= 0.9) return 'ouro';
    if (pct >= 0.7) return 'prata';
    return 'bronze';
  };

  P.registrarTreino = function (materia, acertos, total) {
    var medalha = P.medalhaPara(acertos, total);
    var reg = I.estado.treinos[materia.id] || { vezes: 0 };
    reg.vezes = (reg.vezes || 0) + 1;
    if ((ORDEM_MEDALHA[medalha] || 0) > (ORDEM_MEDALHA[reg.melhor] || 0)) reg.melhor = medalha;
    var premios = { medalha: medalha, ovos: [], estrelas: 0 };
    var unis = materia.unicornios || [];
    var pers = Reino.config.persistencia;
    if (medalha === 'ouro' && !reg.ouro) reg.ouro = agora();
    if (medalha === 'ouro' || reg.vezes >= pers.treinoOuro) {
      var ep = unis.find(function (u) { return u.raridade === 'epico' && u.treino === 'ouro'; });
      if (ep && P.ganharUni(ep.id)) premios.ovos.push(ep.id);
    }
    if (acertos === total && !reg.perfeito) reg.perfeito = agora();
    if (acertos === total || reg.vezes >= pers.treinoPerfeito) {
      var ep2 = unis.find(function (u) { return u.raridade === 'epico' && u.treino === 'perfeito'; });
      if (ep2 && P.ganharUni(ep2.id)) premios.ovos.push(ep2.id);
    }
    premios.estrelas = { ouro: 10, prata: 6, bronze: 3 }[medalha];
    P.ganharEstrelas(premios.estrelas);
    premios.cresceu = P.xpMontaria(acertos * 2);
    I.estado.treinos[materia.id] = reg;
    P.salvar();
    return premios;
  };

  /* ---------- provas bimestrais (Escola do Reino) ---------- */
  // 1ª tentativa vale lendário, 2ª vale raro, da 3ª em diante vale comum
  P.premioDaTentativa = function (n) { return n <= 1 ? 'lendario' : n === 2 ? 'raro' : 'comum'; };
  P.regProva = function (prova) { return I.estado.provas[prova.id] || { tentativas: 0, notas: [] }; };
  // o que a próxima tentativa vale (null quando o acessório já foi ganho)
  P.valendoProva = function (prova) {
    var reg = P.regProva(prova);
    return reg.premio ? null : P.premioDaTentativa((reg.tentativas || 0) + 1);
  };
  P.registrarProva = function (prova, nota) {
    var reg = I.estado.provas[prova.id] || { tentativas: 0, notas: [] };
    var valendo = reg.premio ? null : P.premioDaTentativa((reg.tentativas || 0) + 1);
    reg.tentativas = (reg.tentativas || 0) + 1;
    reg.notas = (reg.notas || []).concat([nota]).slice(-20);
    reg.melhor = Math.max(reg.melhor || 0, nota);
    var sucesso = nota >= Reino.config.notaSucessoProva;
    var premios = { tentativa: reg.tentativas, nota: nota, sucesso: sucesso, valendo: valendo, raridade: null, acessorio: null, estrelas: 0 };
    if (sucesso && valendo) {
      premios.raridade = valendo;
      premios.acessorio = prova.acessorios[valendo];
      I.estado.loja[premios.acessorio.id] = true;
      reg.premio = valendo;
      reg.premioEm = agora();
    }
    premios.proximo = reg.premio ? null : P.premioDaTentativa(reg.tentativas + 1);
    I.estado.provas[prova.id] = reg;
    premios.estrelas = Math.round(nota);
    P.ganharEstrelas(premios.estrelas);
    premios.cresceu = P.xpMontaria(Math.round(nota * 2));
    P.salvar();
    return premios;
  };

  /* ---------- área dos pais ---------- */
  P.registrarPagamento = function (materiaId, valor) {
    I.estado.pago[materiaId] = Math.max(0, valor);
    P.salvar();
  };
  P.novoCiclo = function () {
    I.estado.ciclo = (I.estado.ciclo || 1) + 1;
    I.estado.salas = {}; I.estado.treinos = {}; I.estado.pago = {};
    // fome e sede (cuidados) e a despensa continuam: são do unicórnio, não do ciclo de provas
    P.salvar();
  };
  P.apagarTudo = function () {
    var g = (I.estado.geracao || 1) + 1;
    I.estado = estadoNovo();
    I.estado.geracao = g;
    P.salvar();
  };
})();
