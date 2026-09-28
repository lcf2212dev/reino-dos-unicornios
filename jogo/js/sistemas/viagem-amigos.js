/* Viagem de foguete (3ª versão): os ETs dos planetas e a amizade. Reino.Viagem.ets() lista todos os ETs (os NPCs dos
   interiores dos planetas, na ordem dos planetas), com `amigo` do campo `etsAmigos` (sistemas/viagem-desafio.js).
   A regra: o ET do desafio vira amigo no fim do desafio; os outros, quando ela brinca com eles (as ações de ET dos
   planetas chamam Reino.Viagem.fazerAmigo). Contrato: docs/contratos/viagem.md §6.2. O álbum: ui/album-ets.js.
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var V = R.Viagem = R.Viagem || {};

  // [{ id, nome, planeta, amigo }]: um por ET, sem repetir, na ordem dos planetas e das vagas
  V.ets = function () {
    var amigos = typeof V.amigos === 'function' ? V.amigos() : {}, vistos = {}, lista = [];
    (typeof V.planetas === 'function' ? V.planetas() : []).forEach(function (p) {
      R.personagensDoPredio(p.interior).forEach(function (n) {
        if (vistos[n.id]) return;
        vistos[n.id] = true;
        var pe = (R.personagens && R.personagens[n.id]) || (R.reservas && R.reservas[n.id]) || {};
        lista.push({ id: n.id, nome: pe.nome || n.id, planeta: p.id, amigo: !!amigos[n.id] });
      });
    });
    return lista;
  };
  // quantos amigos de quantos ETs
  V.contagemAmigos = function () {
    var l = V.ets();
    return { n: l.filter(function (e) { return e.amigo; }).length, max: l.length };
  };
})();
