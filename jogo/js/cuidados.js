/* Fome e sede dos unicórnios (Reino.Cuidados).
   PROVISÓRIO: só a API neutra de CONTRATOS-NOVIDADES.md (tudo satisfeito), para o jogo rodar
   enquanto o módulo de verdade não chega. O construtor da Fase 1 (A) troca este arquivo inteiro. */
(function () {
  var C = {};
  function cheio() { return { fome: 100, sede: 100 }; }
  C.iniciar = function () {};
  C.niveis = function () { return cheio(); };
  C.baixo = function () { return { fome: false, sede: false }; };
  C.icone = function () { return null; };
  C.iconeMontaria = function () { return null; };
  C.fatorVelocidade = function () { return 1; };
  C.comidas = function () { return Reino.config.comidas; };
  C.quantidade = function () { return 0; };
  C.despensa = function () { return []; };
  C.comprar = function () { return { ok: false, motivo: 'estrelas', faltam: 0 }; };
  C.alimentar = function () { return { ok: false, motivo: 'sem-comida' }; };
  C.beber = function () { return { ok: false, motivo: 'cheio' }; };
  C.avancar = function () {};
  C.ativo = function () { return false; };
  C.depurar = function () { return { montaria: null, fome: 100, sede: 100, fator: 1, icone: null, ativo: false, despensa: {}, todos: {} }; };
  C.falas = function () { return []; };
  Reino.Cuidados = C;
})();
