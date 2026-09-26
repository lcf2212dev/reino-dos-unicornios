/* Observatório, 2º andar (NASA): onde a Mariana chega nas escadas, para os outros andares combinarem.
   chegadaDeBaixo: vindo do térreo (observatorio.js); chegadaDeCima: vindo do 3º andar (observatorio-3).
   Carrega depois do observatorio/ceu.js (que cria R._predios.observatorio) e antes dos registros dos andares. */
(function () {
  var S = window.Reino._predios.observatorio;
  S.escadasNasa = { chegadaDeBaixo: { x: 22, y: 12 }, chegadaDeCima: { x: 26, y: 4 } };
})();
