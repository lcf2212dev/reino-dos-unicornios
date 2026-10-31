/* Cartões de experiência do Laboratório (pedido 2026-10-31-moedas-cofre-cartoes §3; docs/contratos/quimica.md §10).
   Cada sala feita pela 1ª vez desde Reino.config.cartoes.desde (início do dia, hora local) dá o próximo cartão: uma
   receita da bancada com `cartao: n` (Reino.QUIMICA.receitas, conteudo/quimica/receitas-cartoes.js). DERIVADO das
   salas feitas (salas[id].feita, timestamp ms), sem campo no save: as salas que contam, ordenadas por (feita, id); a
   k-ésima dá o cartão k (se existir). Produto com `cartao: true` (Reino.QUIMICA.ingredientes) só aparece na bancada
   quando um cartão ganho o usa, ou quando uma receita já descoberta (save `quimica.receitas`) o usa: o que ela já
   usou nunca some, nem num Novo ciclo.
   API (Reino.Cartoes): lista(), ganhos(), ganho(receitaId), cartao(n), daSala(salaId), produtosNovos(n),
   liberado(ingredienteId), novoNaBancada(ingredienteId).
   node: true: nada de DOM, Progresso nem Cena no carregamento. */
(function () {
  var R = window.Reino;
  var C = R.Cartoes = {};

  function dados() { return R.QUIMICA || {}; }
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }
  // início do dia `desde` ('aaaa-mm-dd') na hora local; sem data, nenhuma sala conta
  function inicio() {
    var d = R.config.cartoes && R.config.cartoes.desde, m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : Infinity;
  }
  // as salas que dão cartão, na ordem em que foram feitas: [{ id, feita }]
  function salasQueDao() {
    var est = estado(), salas = est && est.salas, desde = inicio(), vistas = {}, l = [];
    if (!salas) return l;
    (R.materias || []).forEach(function (m) {
      (m.salas || []).forEach(function (s) {
        var reg = salas[s.id], f = reg && reg.feita;
        if (vistas[s.id] || typeof f !== 'number' || !(f >= desde)) return;
        vistas[s.id] = true;
        l.push({ id: s.id, feita: f });
      });
    });
    return l.sort(function (a, b) { return a.feita - b.feita || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
  }
  function receitas() { return dados().receitas || []; }

  /** As receitas de cartão, pela ordem de ganho (`cartao`). */
  C.lista = function () {
    return receitas().filter(function (r) { return r.cartao > 0; }).sort(function (a, b) { return a.cartao - b.cartao; });
  };
  /** A receita do cartão n (ou null). @param {number} n */
  C.cartao = function (n) {
    var l = receitas();
    for (var i = 0; i < l.length; i++) if (l[i].cartao === n) return l[i];
    return null;
  };
  // quantas salas já dão cartão (o cartão k está ganho se k ≤ isto e ele existe)
  function feitas() { return salasQueDao().length; }
  /** Quantos cartões ela já ganhou. */
  C.ganhos = function () { var k = feitas(); return C.lista().filter(function (r) { return r.cartao <= k; }).length; };
  /** A receita de cartão já foi ganha? (receita sem `cartao`: false) @param {string} id */
  C.ganho = function (id) {
    var r = null, l = receitas();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) { r = l[i]; break; }
    return !!(r && r.cartao > 0 && r.cartao <= feitas());
  };
  /** O número do cartão que esta sala deu (0 = nenhum: feita antes de `desde`, ainda não feita ou cartões acabaram).
      @param {string} salaId */
  C.daSala = function (salaId) {
    var l = salasQueDao();
    for (var i = 0; i < l.length; i++) if (l[i].id === salaId) return C.cartao(i + 1) ? i + 1 : 0;
    return 0;
  };
  function ingrediente(id) {
    var l = dados().ingredientes || [];
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  /** Os produtos (`cartao: true`) que saem do baú com o cartão n: os dele que nenhum cartão anterior usa.
      @param {number} n @returns {object[]} ingredientes */
  C.produtosNovos = function (n) {
    var r = C.cartao(n);
    if (!r) return [];
    var antes = {};
    C.lista().forEach(function (x) { if (x.cartao < n) (x.ingredientes || []).forEach(function (g) { antes[g] = true; }); });
    return (r.ingredientes || []).map(ingrediente).filter(function (g) { return g && g.cartao && !antes[g.id]; });
  };
  // alguma receita descoberta (no save) usa este ingrediente?
  function usadoEmDescoberta(id) {
    var est = estado(), d = est && est.quimica && est.quimica.receitas;
    if (!d) return false;
    return receitas().some(function (r) { return d[r.id] && (r.ingredientes || []).indexOf(id) >= 0; });
  }
  /** O produto aparece na bancada? Sem `cartao`, sempre; com `cartao`, se um cartão ganho ou uma receita descoberta
      o usa. @param {string} id */
  C.liberado = function (id) {
    var g = ingrediente(id);
    if (!g) return false;
    if (!g.cartao) return true;
    var k = feitas();
    return C.lista().some(function (r) { return r.cartao <= k && (r.ingredientes || []).indexOf(id) >= 0; }) || usadoEmDescoberta(id);
  };
  /** Selo "Novo!" da bancada: produto de cartão liberado que ainda não entrou em nenhuma receita descoberta. */
  C.novoNaBancada = function (id) { var g = ingrediente(id); return !!(g && g.cartao && C.liberado(id) && !usadoEmDescoberta(id)); };

  // o que o Claude fala no baú do cartão (ui/bau-cartao.js); até 30 letras, 3+ palavras (licoes-de-voz.md)
  var FALAS = C.FALAS = {
    chegou: 'Um cartão novo para você!',
    abrir: 'Vamos abrir o baú?',
    fazer: 'Experimente no Laboratório!',
    produto: 'Saiu um produto novo!',
    produtos: 'Saíram produtos novos!',
  };
  R.registrarModulo({
    id: 'cartoes',
    falas: function () { return Object.keys(FALAS).map(function (k) { return { texto: FALAS[k] }; }); },
    depurar: function () { return { ganhos: C.ganhos(), total: C.lista().length, salas: salasQueDao().map(function (s) { return s.id; }) }; },
  });
})();
