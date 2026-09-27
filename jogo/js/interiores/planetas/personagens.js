/* Planetas: o visual dos ETs (base 'et', ets.js). Nome, voz e vaga vêm da reserva (observatorio/reservas.js). */
(function () {
  var Reino = window.Reino;
  /* ================= LUA: os coelhinhos lunares ================= */
  Reino.registrarPersonagem({ id: 'lua-lumi',     // lilás, orelhas de coelho e laço rosa
    sprite: { base: 'et', pele: '#d9c6f5', barriga: '#f6effd', antenas: 2, antena: '#ffd34d', olhos: 2, orelhas: 'coelho', enfeite: 'laco', enfeiteCor: '#ff6fae' } });
  Reino.registrarPersonagem({ id: 'lua-pipo',     // azulzinho de um olho só
    sprite: { base: 'et', pele: '#a9d8f5', barriga: '#e8f6ff', antenas: 1, antena: '#7cf0b0', olhos: 1, orelhas: 'redonda' } });
  Reino.registrarPersonagem({ id: 'lua-vovo',     // a mais velha: orelhas caídas, óculos e cabelo branco
    sprite: { base: 'et', pele: '#b8adc8', barriga: '#e4dcec', antenas: 0, olhos: 2, orelhas: 'caida', enfeite: 'oculos', enfeiteCor: '#8a6a3a', cabelo: '#f4f2fa' } });
})();
