/* Presentes do jogo no save (pedido 2026-10-28-presente-medalhas): o presente de Reino.presentes (conteudo/presentes.js)
   é de um jogador só (`para`) e chega uma vez, num baú depois do login (ui/bau-presente.js).
   Campo `presentes: { <idPresente>: em }` (quando abriu; mescla = o menor `em` por presente, nada some; o Novo ciclo
   mantém; vai na cópia -novidades). Um aparelho com a versão antiga preserva tudo: os acessórios ficam em `loja`
   (ids desconhecidos ficam guardados, save-e-mescla.md §6).
   P.presentesPendentes() → os presentes deste jogador ainda sem `presentes[id]` (lista de defs).
   P.abrirPresente(id) → presentes[id] = agora (só a 1ª vez), loja[acessório] = true para cada um e salva.
     Idempotente: abrir de novo só re-garante a loja (sem novo carimbo). Devolve true quando abriu agora.
   As falas do baú (voz do Claude: Reino.Presentes.FALAS e as `falas` de cada acessório) entram no pacote geral
   pelo módulo 'presentes'.
   node: true: nada de DOM no carregamento. */
(function () {
  var R = Reino, P = R.Progresso, I = R._progresso;
  var objeto = I.objeto, chaveSegura = I.chaveSegura, numeroOu = I.numeroOu;
  var tem = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  function limpar(v) {
    if (!objeto(v)) return undefined;
    var r = {};
    Object.keys(v).forEach(function (k) { var n = numeroOu(v[k], NaN); if (chaveSegura(v, k) && isFinite(n) && n >= 0) r[k] = n; });
    return r;
  }
  P.registrarCampo('presentes', {
    padrao: function () { return {}; },
    // por presente, o menor `em` (a primeira vez que abriu); nada some, comutativa
    mesclar: function (a, b) {
      var r = Object.assign({}, a);
      Object.keys(b).forEach(function (k) { r[k] = tem(r, k) ? Math.min(r[k], b[k]) : b[k]; });
      return r;
    },
    limpar: limpar,
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    exemplos: [{ 'medalhas-2026': 1000 }, { 'medalhas-2026': 900, 'outro-presente': 2000 }],
  });

  // é deste jogador? ('mariana' = a conta dela)
  function paraQuemJoga(def) {
    var J = R.Jogadores;
    if (!J) return false;   // sem saber quem joga, não entrega a ninguém
    return def.para === 'mariana' ? J.ehMariana() : J.atual() === def.para;
  }

  /** @returns {any[]} os presentes deste jogador ainda fechados */
  P.presentesPendentes = function () {
    var est = I.estado;
    if (!est) return [];
    var abertos = objeto(est.presentes) ? est.presentes : {};
    return (R.presentes || []).filter(function (def) { return paraQuemJoga(def) && !tem(abertos, def.id); });
  };

  /** @param {string} id @returns {boolean} true quando abriu agora (false: já aberto, de outro jogador ou desconhecido) */
  P.abrirPresente = function (id) {
    var est = I.estado, def = R.presente && R.presente(id);
    if (!est || !def || !paraQuemJoga(def)) return false;
    var p = est.presentes = objeto(est.presentes) ? est.presentes : {};
    var novo = !tem(p, id);
    if (novo) p[id] = I.agora();
    def.acessorios.forEach(function (a) { est.loja[a.id] = true; });
    P.salvar();
    return novo;
  };

  // o que o Claude fala no baú (até 30 letras por frase, 3 palavras ou mais; docs/receitas/licoes-de-voz.md); cada
  // acessório traz as suas em `falas` (conteudo/presentes.js). O nome dela vai escrito: o único presente é da Mariana
  var FALAS = {
    chegou: 'Mariana, chegou um presente!',
    toque: 'Toque no baú para abrir!',
    ultra: 'Elas são Ultra Lendárias!',
    mereceu: 'Você mereceu cada uma!',
  };
  R.Presentes = { FALAS: FALAS };
  R.registrarModulo({
    id: 'presentes',
    falas: function () {
      var l = Object.keys(FALAS).map(function (k) { return FALAS[k]; });
      (R.presentes || []).forEach(function (def) { def.acessorios.forEach(function (a) { l = l.concat(a.falas || []); }); });
      return l.map(function (t) { return { texto: t }; });
    },
    depurar: function () { return { abertos: I.estado ? I.estado.presentes : null, pendentes: P.presentesPendentes().map(function (d) { return d.id; }) }; },
  });
})();
