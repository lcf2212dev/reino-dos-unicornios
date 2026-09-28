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
  /* ================= MARTE: os marcianos das dunas ================= */
  Reino.registrarPersonagem({ id: 'marte-rubi',   // vermelho-alaranjada, macacão azul, óculos de solda e lacinho
    sprite: { base: 'et', pele: '#f08a5d', barriga: '#ffd9c2', antenas: 2, antena: '#ffe066', olhos: 2, orelhas: 'nenhuma', enfeite: 'oculos', enfeiteCor: '#3f6fb0', macacao: '#4d8fd6' } });
  Reino.registrarPersonagem({ id: 'marte-faisca', // verde-limão, 1 antena e 3 olhos
    sprite: { base: 'et', pele: '#8fdc5a', barriga: '#e2f8c8', antenas: 1, antena: '#ff7a3d', olhos: 3, orelhas: 'redonda' } });
  Reino.registrarPersonagem({ id: 'marte-vovo',   // cor de ferrugem, cabelo e barbicha brancos, óculos
    sprite: { base: 'et', pele: '#c9654a', barriga: '#f1c9b4', antenas: 2, antena: '#ff9f43', olhos: 2, orelhas: 'caida', enfeite: 'oculos', enfeiteCor: '#5a3a24', cabelo: '#f4f2fa', barba: '#f4f2fa' } });
  /* ================= SATURNO: os ETs dos anéis de gelo ================= */
  Reino.registrarPersonagem({ id: 'saturno-sky',  // dourada, 2 antenas e laço azul-gelo
    sprite: { base: 'et', pele: '#f5d77a', barriga: '#fff5d6', antenas: 2, antena: '#8fe3ff', olhos: 2, orelhas: 'nenhuma', enfeite: 'laco', enfeiteCor: '#4fb6f0' } });
  Reino.registrarPersonagem({ id: 'saturno-nico', // azul-gelo, orelhas redondas e cachecol
    sprite: { base: 'et', pele: '#bfeaf5', barriga: '#f0fbff', antenas: 0, olhos: 2, orelhas: 'redonda', cachecol: '#ff6f6f' } });
  Reino.registrarPersonagem({ id: 'saturno-vovo', // bege-dourado, cabelo branco e óculos
    sprite: { base: 'et', pele: '#e3c79a', barriga: '#f8ecd6', antenas: 1, antena: '#cfa7ff', olhos: 2, orelhas: 'coelho', enfeite: 'oculos', enfeiteCor: '#9a7a3a', cabelo: '#f4f2fa' } });
})();
