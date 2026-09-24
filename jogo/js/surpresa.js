/* Pergunta surpresa (Reino.Surpresa).
   PROVISÓRIO: só a API neutra de CONTRATOS-NOVIDADES.md (nunca aparece), para o jogo rodar
   enquanto o módulo de verdade não chega. O construtor da Fase 1 (D) troca este arquivo inteiro. */
(function () {
  var S = {};
  S.iniciar = function () {};
  S.forcar = function () { return Promise.resolve(null); };
  S.restante = function () { return null; };
  S.aberta = function () { return false; };
  S.proximaPergunta = function () { return null; };
  S.falas = function () { return []; };
  Reino.Surpresa = S;
})();
