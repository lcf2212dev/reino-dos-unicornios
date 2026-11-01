/* Tempo de celular (pedido 2026-11-01-tempo-celular): cada sala feita pela 1ª vez desde
   Reino.config.tempoCelular.desde (início do dia, hora local) dá `minutosPorSala` minutos; sem teto.
   O GANHO é derivado das salas (salas[id].feita, mesmo critério de sistemas/cartoes.js); só os USOS vão no save:
   `tempoUsos: { '<Date.now()>-<aleatório>': minutos }` (registrarCampo, mescla 'contadores': cada uso tem chave
   única, então dois aparelhos usando ao mesmo tempo somam os dois). Novo ciclo zera (as salas também zeram).
   API (Reino.TempoCelular): ganho(), usado(), saldo(), usar(min), daSala(salaId), usos(), passo().
   node: true: nada de DOM nem Cena no carregamento. Contrato: docs/contratos/save-e-mescla.md §3.3. */
(function () {
  var R = window.Reino, P = R.Progresso;
  var T = R.TempoCelular = {};

  P.registrarCampo('tempoUsos', {
    padrao: function () { return {}; },
    mesclar: 'contadores',
    novoCiclo: 'zera',
    copiaSeguranca: true,
    // só minutos inteiros > 0 (uma chave estragada some; as boas ficam)
    limpar: function (v) {
      var r = {};
      Object.keys(v).forEach(function (k) { var n = v[k]; if (typeof n === 'number' && n > 0 && Math.floor(n) === n) r[k] = n; });
      return r;
    },
    exemplos: [{ '1762000000000-a1': 5 }, { '1762000000000-a1': 5, '1762000300000-b2': 10 }],
  });

  function cfg() { return R.config.tempoCelular || {}; }
  function estado() { try { return P.estado(); } catch (e) { return null; } }
  /** De quantos em quantos minutos ela escolhe. */
  T.passo = function () { return cfg().passo > 0 ? cfg().passo : 5; };
  function porSala() { return cfg().minutosPorSala > 0 ? cfg().minutosPorSala : 0; }
  // início do dia `desde` na hora local; sem data, nenhuma sala conta
  function inicio() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cfg().desde || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : Infinity;
  }
  // a sala conta? (feita pela 1ª vez a partir de `desde`)
  function conta(salas, id) { var reg = salas[id], f = reg && reg.feita; return typeof f === 'number' && f >= inicio(); }
  function usosSave() { var est = estado(); return (est && est.tempoUsos) || {}; }

  /** Minutos ganhos (salas que contam × minutosPorSala). */
  T.ganho = function () {
    var est = estado(), salas = est && est.salas, vistas = {}, n = 0;
    if (!salas) return 0;
    (R.materias || []).forEach(function (m) {
      (m.salas || []).forEach(function (s) { if (!vistas[s.id] && conta(salas, s.id)) { vistas[s.id] = true; n++; } });
    });
    return n * porSala();
  };
  /** Minutos já usados. */
  T.usado = function () { var u = usosSave(), n = 0; Object.keys(u).forEach(function (k) { n += u[k]; }); return n; };
  /** O que sobra (nunca negativo). */
  T.saldo = function () { return Math.max(0, T.ganho() - T.usado()); };
  /** Minutos que esta sala deu (0 = feita antes de `desde` ou ainda não feita). @param {string} salaId */
  T.daSala = function (salaId) { var est = estado(); return est && est.salas && conta(est.salas, salaId) ? porSala() : 0; };
  /** Usa `min` minutos (múltiplo de passo, > 0 e ≤ saldo). @param {number} min @returns {boolean} */
  T.usar = function (min) {
    var est = estado();
    if (!est || typeof min !== 'number' || !(min > 0) || min % T.passo() !== 0 || min > T.saldo()) return false;
    if (!est.tempoUsos) est.tempoUsos = {};
    var chave;
    do chave = Date.now() + '-' + Math.random().toString(36).slice(2, 6); while (Object.prototype.hasOwnProperty.call(est.tempoUsos, chave));
    est.tempoUsos[chave] = min;
    P.salvar();
    return true;
  };
  /** Os usos, do mais novo: [{ em, minutos }]. */
  T.usos = function () {
    var u = usosSave();
    return Object.keys(u).map(function (k) { return { em: parseInt(k, 10) || 0, minutos: u[k] }; })
      .sort(function (a, b) { return b.em - a.em; });
  };
})();
