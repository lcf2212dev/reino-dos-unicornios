/* Viagem de foguete (viagem): o registro dos planetas e a ação `viagem`. Contrato: docs/contratos/viagem.md.
   CONTRATO (onda 0): este arquivo só tem o registro e a ação mínima; a frente da mecânica o completa (tanque,
   passaporte, painel, fluxo do voo).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var planetas = [];

  var V = R.Viagem = {};
  /** Registra um planeta (arquivo do planeta, no carregamento). @param {{ id: string, nome: string,
      interior: string, chegada: {x: number, y: number}, ordem: number, cor: string }} p */
  V.registrarPlaneta = function (p) {
    if (!p || !p.id || !p.interior) throw new Error('registrarPlaneta: falta id ou interior');
    if (planetas.some(function (o) { return o.id === p.id; })) throw new Error('registrarPlaneta: id repetido ' + p.id);
    planetas.push(p);
    planetas.sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
  };
  V.planetas = function () { return planetas.slice(); };
  V.planeta = function (id) { return planetas.find(function (p) { return p.id === id || p.interior === id; }) || null; };

  // ação `viagem`: sem `para` (o foguete do Hangar) abre o painel do foguete; com `para` (o foguete de um planeta)
  // volta para lá, na `chegada`
  function viagem(acao) {
    if (acao && acao.para) return R.Cena.irPara(acao.para, acao.chegada, { x: 0, y: 1 });
    if (R.UI && R.UI.telaFoguete) R.UI.telaFoguete();
    return Promise.resolve();
  }

  R.registrarModulo({ id: 'viagem', acoes: { viagem: viagem } });
})();
