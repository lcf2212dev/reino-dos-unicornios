/* Etapas da sala de livro no save (docs/contratos/quarto-bimestre.md §13.2): campo `etapas` e a API Reino.Etapas.
   etapas: { <salaId>: { rodada,                          // salas[id].vezes quando a rodada começou
                         feitas: { <n>: { a, t, p, em } },  // etapa feita nesta rodada: acertos de 1ª, total, pressas
                         perfeitas: { <n>: em } } }         // ⭐ etapa feita sem erro (fica entre rodadas)
   Mescla própria: `rodada` maior vence (as `feitas` da menor somem); mesma rodada, união das `feitas` (a mesma etapa
   nos dois: a de `em` maior); `perfeitas` sempre união (o menor `em`). Comutativa e idempotente. Novo ciclo zera.
   Rodada velha (menor que salas[id].vezes) = trilha nova: nenhuma etapa feita nesta rodada.
   Reino.Etapas.estado(materia, sala) e .concluirEtapa(materia, sala, n, resultado): materia e sala = objeto ou id.
   estado().fechadaSemConcluir: a rodada tem todas as etapas feitas, mas a sala não foi contada (cada aparelho fez
   umas etapas e a mescla juntou; proxima = null): refazer qualquer etapa conta a sala (concluirEtapa).
   A última etapa da rodada chama P.concluirSala com a soma das etapas (o prêmio da sala inteira, igual).
   node: true: nada de DOM no carregamento; o estado se lê na hora (P.estado()). */
(function () {
  var R = Reino, P = R.Progresso, I = R._progresso;
  var objeto = I.objeto, chaveSegura = I.chaveSegura, numeroOu = I.numeroOu;
  var INDICE = /^(0|[1-9][0-9]{0,3})$/;

  function contador(x) { var n = numeroOu(x, NaN); return isFinite(n) && n >= 0 ? Math.floor(n) : undefined; }
  // { <n>: f(valor) } só com índices de etapa e valores bons
  function porIndice(o, f) {
    var r = {};
    if (objeto(o)) Object.keys(o).forEach(function (k) { if (INDICE.test(k) && chaveSegura(o, k)) { var v = f(o[k]); if (v !== undefined) r[k] = v; } });
    return r;
  }
  function limparFeita(f) {
    if (!objeto(f)) return undefined;
    var a = contador(f.a), t = contador(f.t), p = contador(f.p), em = numeroOu(f.em, NaN);
    if (a === undefined || t === undefined || !isFinite(em) || em < 0) return undefined;
    return { a: Math.min(a, t), t: t, p: p === undefined ? 0 : p, em: em };
  }
  function limparEm(x) { var n = numeroOu(x, NaN); return isFinite(n) && n >= 0 ? n : undefined; }
  function limpar(v) {
    if (!objeto(v)) return undefined;
    var r = {};
    Object.keys(v).forEach(function (id) {
      var s = v[id];
      if (!chaveSegura(v, id) || !objeto(s)) return;
      r[id] = { rodada: contador(s.rodada) || 0, feitas: porIndice(s.feitas, limparFeita), perfeitas: porIndice(s.perfeitas, limparEm) };
    });
    return r;
  }
  // a mesma etapa feita nos dois lados: o `em` maior; empate, o mesmo resultado escolhido dos dois jeitos (comutativa)
  function feitaVence(x, y) { return y.em > x.em || (y.em === x.em && JSON.stringify(y) > JSON.stringify(x)); }
  function juntarSala(x, y) {
    var r = { rodada: Math.max(x.rodada, y.rodada), feitas: {}, perfeitas: {} };
    [x, y].forEach(function (s) {
      if (s.rodada !== r.rodada) return;
      Object.keys(s.feitas).forEach(function (n) { var f = r.feitas[n]; if (!f || feitaVence(f, s.feitas[n])) r.feitas[n] = Object.assign({}, s.feitas[n]); });
    });
    [x, y].forEach(function (s) {
      Object.keys(s.perfeitas).forEach(function (n) { var e = r.perfeitas[n]; r.perfeitas[n] = e === undefined ? s.perfeitas[n] : Math.min(e, s.perfeitas[n]); });
    });
    return r;
  }
  function mesclar(a, b) {
    var r = {};
    Object.keys(a).concat(Object.keys(b)).forEach(function (id) {
      if (Object.prototype.hasOwnProperty.call(r, id)) return;
      var x = Object.prototype.hasOwnProperty.call(a, id) ? a[id] : null, y = Object.prototype.hasOwnProperty.call(b, id) ? b[id] : null;
      r[id] = x && y ? juntarSala(x, y) : JSON.parse(JSON.stringify(x || y));
    });
    return r;
  }

  P.registrarCampo('etapas', {
    padrao: function () { return {}; },
    mesclar: mesclar,
    limpar: limpar,
    novoCiclo: 'zera',
    copiaSeguranca: true,
    exemplos: [
      { lp10a4: { rodada: 0, feitas: { 0: { a: 3, t: 3, p: 0, em: 1000 }, 1: { a: 1, t: 2, p: 1, em: 1100 } }, perfeitas: { 0: 1000 } } },
      { lp10a4: { rodada: 0, feitas: { 1: { a: 2, t: 2, p: 0, em: 1500 }, 2: { a: 0, t: 0, p: 0, em: 1600 } }, perfeitas: { 1: 1500, 2: 1600 } },
        lp11a1: { rodada: 1, feitas: { 0: { a: 4, t: 4, p: 0, em: 2000 } }, perfeitas: { 0: 2000 } } },
    ],
  });

  /* ---------- API ---------- */
  function acharMateria(m) { return typeof m === 'string' ? R.materia(m) : m; }
  function acharSala(m, s) { return typeof s === 'string' ? ((m && m.salas) || []).find(function (x) { return x.id === s; }) : s; }
  function estado() { return P.estado(); }
  function vezes(id) { var s = estado().salas[id]; return (s && s.vezes) || 0; }
  // o registro da sala no save, na rodada atual (rodada velha: as feitas não contam)
  function registro(id) {
    var t = estado().etapas, reg = t && Object.prototype.hasOwnProperty.call(t, id) ? t[id] : null;
    var atual = !!reg && reg.rodada === vezes(id);   // outra rodada (velha ou estragada): nada feito nesta
    return { feitas: atual ? reg.feitas : {}, perfeitas: reg ? reg.perfeitas : {} };
  }
  function indices(o, total) { return Object.keys(o || {}).map(Number).filter(function (n) { return n < total; }).sort(function (a, b) { return a - b; }); }

  /** @param {Materia|string} materia @param {Sala|string} sala
      @returns {{ total: number, feitas: number[], perfeitas: number[], proxima: number|null, emAndamento: boolean, fechadaSemConcluir: boolean, salaFeita: boolean, trilhaPerfeita: boolean } | null} */
  function estadoSala(materia, sala) {
    var m = acharMateria(materia), s = acharSala(m, sala), etapas = s && R.etapasDaSala(m, s);
    if (!etapas) return null;
    var total = etapas.length, reg = registro(s.id);
    var feitas = indices(reg.feitas, total), perfeitas = indices(reg.perfeitas, total);
    var proxima = null;
    for (var n = 0; n < total; n++) if (feitas.indexOf(n) < 0) { proxima = n; break; }
    var est = estado(), rs = est.salas[s.id];
    var trilhas = est.trilhas || {};
    return {
      total: total, feitas: feitas, perfeitas: perfeitas, proxima: proxima,
      emAndamento: feitas.length > 0 && feitas.length < total,
      fechadaSemConcluir: feitas.length === total,
      salaFeita: !!(rs && rs.feita),
      // ⭐ em todas, ou a sala feita de uma vez sem erro (retroativo), ou o prêmio já entregue
      trilhaPerfeita: perfeitas.length === total || !!(rs && rs.perfeita) || Object.prototype.hasOwnProperty.call(trilhas, s.id),
    };
  }

  /** Grava a etapa n (e a ⭐ se acertosPrimeira === total), salva e devolve o que ela deu.
      @param {Materia|string} materia @param {Sala|string} sala @param {number} n
      @param {{ acertosPrimeira: number, total: number, pressas: number }} res
      @returns {{ ultima: boolean, perfeita: boolean, sala?: PremiosSala, trilha?: any } | null} */
  function concluirEtapa(materia, sala, n, res) {
    var m = acharMateria(materia), s = acharSala(m, sala), etapas = s && R.etapasDaSala(m, s);
    if (!etapas || !(n >= 0 && n < etapas.length && n === Math.floor(n))) return null;
    var est = estado(), t = est.etapas = objeto(est.etapas) ? est.etapas : {}, id = s.id, v = vezes(id);
    var reg = Object.prototype.hasOwnProperty.call(t, id) ? t[id] : null;
    if (!reg || reg.rodada !== v) reg = t[id] = { rodada: v, feitas: {}, perfeitas: (reg && reg.perfeitas) || {} };
    var total = etapas.length, completa = function () { return indices(reg.feitas, total).length === total; };
    var a = Math.max(0, Math.floor(res.acertosPrimeira || 0)), tt = Math.max(0, Math.floor(res.total || 0));
    var velho = reg.feitas[n], em = Math.max(Date.now(), ((velho && velho.em) || 0) + 1);
    reg.feitas[n] = { a: Math.min(a, tt), t: tt, p: Math.max(0, Math.floor(res.pressas || 0)), em: em };
    var perfeita = a >= tt;
    if (perfeita && reg.perfeitas[n] === undefined) reg.perfeitas[n] = em;
    var r = { ultima: false, perfeita: perfeita };
    // a rodada fechou (também a que fechou pela mescla de dois aparelhos): a sala conta como sempre, com a soma das
    // etapas; P.concluirSala sobe salas[id].vezes e a próxima etapa já começa uma rodada nova
    if (completa()) {
      var soma = { acertosPrimeira: 0, total: 0, pressas: 0 };
      for (var k = 0; k < total; k++) { var f = reg.feitas[k]; soma.acertosPrimeira += f.a; soma.total += f.t; soma.pressas += f.p; }
      r.ultima = true;
      r.sala = P.concluirSala(m, s, soma);
    } else P.salvar();
    if (P.conferirTrilhas && P.conferirTrilhas().indexOf(id) >= 0) {
      r.trilha = R.premioTrilha(id);
      P.salvar();
    }
    return r;
  }

  R.Etapas = { estado: estadoSala, concluirEtapa: concluirEtapa };
})();
