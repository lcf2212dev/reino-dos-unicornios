/* Casa do jogador: os móveis funcionam (Reino.CasaUsos; docs/contratos/casa.md §13). Esqueleto da onda 0: a frente A
   completa. Estado ligado/aberto só em memória, por uid da peça (nada vai para o save). */
(function () {
  var R = window.Reino;
  var TABELA = {}, ESTADO = {};
  var I = R._casaUsos = { st: null };

  function registrar(tipo, def) { TABELA[tipo] = def; }
  function de(tipo) { var d = TABELA[tipo]; return d && d.uso !== 'enfeite' ? d : null; }
  function ligado(obj) { return !!(obj && obj.uid && ESTADO[obj.uid]); }
  function ligar(uid, valor, andar) {
    if (!uid) return;
    if (valor) ESTADO[uid] = true; else delete ESTADO[uid];
    if (andar && R.Interiores && R.Interiores.refazer) R.Interiores.refazer(andar);
  }
  function esquecer(uid) { delete ESTADO[uid]; }

  R.CasaUsos = {
    registrar: registrar, de: de, ligado: ligado, ligar: ligar, esquecer: esquecer,
    usar: function () { return Promise.resolve(null); },
    animando: function () { return !!I.st; },
    desenhandoEla: function () { return false; },
    desenhandoUni: function () { return false; },
    depurar: function () { return { ligados: Object.keys(ESTADO), st: I.st }; },
  };
})();
