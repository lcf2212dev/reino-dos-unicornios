/* Trilha perfeita (docs/contratos/quarto-bimestre.md §14.2): a sala de livro com ⭐ em todas as etapas dá o prêmio
   lendário registrado em Reino.premiosTrilha (um acessório, um elemento químico e uma carta de experiência).
   Campo `trilhas: { <salaId>: em }` (quando ganhou; mescla = o menor `em` por sala, nada some; o Novo ciclo mantém).
   P.conferirTrilhas(): sala com prêmio e (⭐ em todas as etapas ou salas[id].perfeita, o retroativo da sala feita de
   uma vez sem erro) ainda sem `trilhas[id]` → trilhas[id], loja[acessorio.id] = true, Q.descobrir dos dois cartões
   (sem as estrelas da química) e o evento TRILHA_PERFEITA { sala, materia }. Sala já em `trilhas`: re-garante a loja
   e os dois cartões, sem evento. Idempotente; devolve as salas premiadas agora (só a 1ª vez). Não salva: quem chama salva (P.conferirPersistencia, ao abrir e ao mesclar, e Reino.Etapas.concluirEtapa).
   node: true: nada de DOM no carregamento. */
(function () {
  var R = Reino, P = R.Progresso, I = R._progresso;
  var objeto = I.objeto, chaveSegura = I.chaveSegura, numeroOu = I.numeroOu;

  function limpar(v) {
    if (!objeto(v)) return undefined;
    var r = {};
    Object.keys(v).forEach(function (k) { var n = numeroOu(v[k], NaN); if (chaveSegura(v, k) && isFinite(n) && n >= 0) r[k] = n; });
    return r;
  }
  P.registrarCampo('trilhas', {
    padrao: function () { return {}; },
    // por sala, o menor `em` (a primeira vez que ganhou); nada some, comutativa
    mesclar: function (a, b) {
      var r = Object.assign({}, a);
      Object.keys(b).forEach(function (k) { r[k] = Object.prototype.hasOwnProperty.call(r, k) ? Math.min(r[k], b[k]) : b[k]; });
      return r;
    },
    limpar: limpar,
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ lp10a1: 1000 }, { lp10a1: 900, lp11a2: 2000 }],
  });

  // ⭐ em todas as etapas da sala (em qualquer rodada)
  function todasPerfeitas(m, s, est) {
    var etapas = R.etapasDaSala ? R.etapasDaSala(m, s) : null, reg = est.etapas && Object.prototype.hasOwnProperty.call(est.etapas, s.id) ? est.etapas[s.id] : null;
    if (!etapas || !reg || !reg.perfeitas) return false;
    for (var n = 0; n < etapas.length; n++) if (reg.perfeitas[n] === undefined) return false;
    return true;
  }

  /** Entrega os prêmios das trilhas perfeitas que faltam. @returns {string[]} as salas premiadas agora */
  P.conferirTrilhas = function () {
    var est = I.estado, novas = [];
    if (!est) return novas;
    var t = est.trilhas = objeto(est.trilhas) ? est.trilhas : {};
    (R.premiosTrilha || []).forEach(function (pr) {
      var ganha = Object.prototype.hasOwnProperty.call(t, pr.sala);
      if (!ganha) {
        var m = R.materia(pr.materia), s = m && m.salas.find(function (x) { return x.id === pr.sala; });
        if (!s) return;
        var rs = est.salas && est.salas[s.id];
        if (!(rs && rs.perfeita) && !todasPerfeitas(m, s, est)) return;
        t[s.id] = I.agora();
        novas.push(s.id);
      }
      // os três prêmios, também de novo para a sala já ganha (idempotente: não marca nada novo nem avisa)
      est.loja[pr.acessorio.id] = true;
      if (R.Quimica && R.Quimica.descobrir) {
        if (typeof pr.elemento === 'number') R.Quimica.descobrir('elementos', 'z' + pr.elemento, { trilha: true });
        if (pr.experiencia) R.Quimica.descobrir('experiencias', pr.experiencia, { trilha: true });
      }
    });
    if (novas.length) {
      est.atualizado = I.agora();
      novas.forEach(function (id) { R.util.emit(R.EVENTOS.TRILHA_PERFEITA, { sala: id, materia: R.premioTrilha(id).materia }); });
    }
    return novas;
  };
})();
