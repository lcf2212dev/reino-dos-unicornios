/* Planetas: o visual dos ETs (base 'et', ets.js). Nome, voz e vaga vêm da reserva (observatorio/reservas.js);
   `idade` repete a da reserva (a altura do sprite sai dela) e `planeta` dá o traço fixo dos 3 ETs de cada planeta. */
(function () {
  var Reino = window.Reino;
  /* ================= LUA: os coelhinhos lunares ================= */
  Reino.registrarPersonagem({ id: 'lua-lumi',     // lilás, orelhas de coelho e laço rosa
    sprite: { base: 'et', idade: 'crianca', planeta: 'lua', pele: '#d9c6f5', barriga: '#f6effd', antenas: 2, antena: '#ffd34d', olhos: 2, orelhas: 'coelho', enfeite: 'laco', enfeiteCor: '#ff6fae' } });
  Reino.registrarPersonagem({ id: 'lua-pipo',     // azulzinho de um olho só
    sprite: { base: 'et', idade: 'crianca', planeta: 'lua', pele: '#a9d8f5', barriga: '#e8f6ff', antenas: 1, antena: '#7cf0b0', olhos: 1, orelhas: 'redonda' } });
  Reino.registrarPersonagem({ id: 'lua-vovo',     // a mais velha: orelhas caídas, óculos e cabelo branco
    sprite: { base: 'et', idade: 'idoso', planeta: 'lua', pele: '#b8adc8', barriga: '#e4dcec', antenas: 0, olhos: 2, orelhas: 'caida', enfeite: 'oculos', enfeiteCor: '#8a6a3a', cabelo: '#f4f2fa' } });
  /* ================= MARTE: os marcianos das dunas ================= */
  Reino.registrarPersonagem({ id: 'marte-rubi',   // vermelho-alaranjada, macacão azul-marinho (escuro: aparece na areia) e óculos de solda
    sprite: { base: 'et', idade: 'crianca', planeta: 'marte', pele: '#f08a5d', barriga: '#ffd9c2', antenas: 2, antena: '#ffe066', olhos: 2, orelhas: 'nenhuma', enfeite: 'oculos', enfeiteCor: '#3f6fb0', macacao: '#243f8a' } });
  Reino.registrarPersonagem({ id: 'marte-faisca', // verde-limão, 1 antena e 3 olhos
    sprite: { base: 'et', idade: 'crianca', planeta: 'marte', pele: '#8fdc5a', barriga: '#e2f8c8', antenas: 1, antena: '#ff7a3d', olhos: 3, orelhas: 'redonda' } });
  Reino.registrarPersonagem({ id: 'marte-vovo',   // cor de rocha de vulcão (escura: aparece na areia), cabelo e barbicha brancos, bengala
    sprite: { base: 'et', idade: 'idoso', planeta: 'marte', pele: '#7a3328', barriga: '#c98a6a', antenas: 2, antena: '#ff9f43', olhos: 2, orelhas: 'caida', cabelo: '#f4f2fa', barba: '#f4f2fa', bengala: '#e0b070' } });
  /* ================= SATURNO: os ETs dos anéis de gelo ================= */
  Reino.registrarPersonagem({ id: 'saturno-sky',  // dourada, 2 antenas e laço azul-gelo
    sprite: { base: 'et', idade: 'crianca', planeta: 'saturno', pele: '#f5d77a', barriga: '#fff5d6', antenas: 2, antena: '#8fe3ff', olhos: 2, orelhas: 'nenhuma', enfeite: 'laco', enfeiteCor: '#4fb6f0' } });
  Reino.registrarPersonagem({ id: 'saturno-nico', // azul-gelo, orelhas redondas e cachecol
    sprite: { base: 'et', idade: 'crianca', planeta: 'saturno', pele: '#bfeaf5', barriga: '#f0fbff', antenas: 0, olhos: 2, orelhas: 'redonda', cachecol: '#ff6f6f' } });
  Reino.registrarPersonagem({ id: 'saturno-vovo', // bege-dourado, cabelo branco e xale de tricô
    sprite: { base: 'et', idade: 'idoso', planeta: 'saturno', pele: '#e3c79a', barriga: '#f8ecd6', antenas: 1, antena: '#cfa7ff', olhos: 2, orelhas: 'coelho', cabelo: '#f4f2fa', xale: '#4f9ad0' } });
  /* ================= JÚPITER: os ETs das nuvens listradas ================= */
  Reino.registrarPersonagem({ id: 'jupiter-tinta', // laranja-creme, lacinho vinho e lápis na mão
    sprite: { base: 'et', idade: 'crianca', planeta: 'jupiter', pele: '#f7b27a', barriga: '#fff0dc', antenas: 2, antena: '#c0503a', olhos: 2, orelhas: 'caida', enfeite: 'laco', enfeiteCor: '#b0306a', lapis: '#4f7fd0' } });
  Reino.registrarPersonagem({ id: 'jupiter-bolha', // pêssego redondinho, um olhão e antena de bolha
    sprite: { base: 'et', idade: 'crianca', planeta: 'jupiter', pele: '#e8a878', barriga: '#ffe8d6', antenas: 1, antena: '#9fe8ff', olhos: 1, orelhas: 'nenhuma' } });
  Reino.registrarPersonagem({ id: 'jupiter-vovo', // laranja-escuro, barba e cabelo brancos, 3 olhos
    sprite: { base: 'et', idade: 'idoso', planeta: 'jupiter', pele: '#d9803f', barriga: '#f6d2a8', antenas: 0, olhos: 3, orelhas: 'redonda', cabelo: '#f4f2fa', barba: '#f4f2fa' } });
  /* ================= VÊNUS: os ETs dourados das nuvens quentes ================= */
  Reino.registrarPersonagem({ id: 'venus-mapi',   // amarela, mochila verde de exploradora
    sprite: { base: 'et', idade: 'crianca', planeta: 'venus', pele: '#ffe066', barriga: '#fffbe0', antenas: 2, antena: '#ff8a3d', olhos: 2, orelhas: 'coelho', mochila: '#3f9f5f' } });
  Reino.registrarPersonagem({ id: 'venus-quentinho', // amarelo-ouro, 3 olhos
    sprite: { base: 'et', idade: 'crianca', planeta: 'venus', pele: '#f5c53a', barriga: '#fff3c4', antenas: 1, antena: '#ff4f4f', olhos: 3, orelhas: 'redonda' } });
  Reino.registrarPersonagem({ id: 'venus-vovo',   // amarelo-creme, cabelo branco fofo como nuvem
    sprite: { base: 'et', idade: 'idoso', planeta: 'venus', pele: '#eedd8c', barriga: '#fbf5d8', antenas: 0, olhos: 2, orelhas: 'caida', enfeite: 'cabelo-branco', cabelo: '#fff8e6' } });
  /* ================= NETUNO: os ETs dos mares azuis ================= */
  Reino.registrarPersonagem({ id: 'netuno-gota',  // azul, jaleco branco e óculos de cientista
    sprite: { base: 'et', idade: 'crianca', planeta: 'netuno', pele: '#6fa8f0', barriga: '#dcecff', antenas: 2, antena: '#7cf0d0', olhos: 2, orelhas: 'nenhuma', enfeite: 'oculos', enfeiteCor: '#2a3f80', jaleco: '#ffffff' } });
  Reino.registrarPersonagem({ id: 'netuno-memo',  // azul-turquesa, boina vermelha
    sprite: { base: 'et', idade: 'crianca', planeta: 'netuno', pele: '#5cc6c8', barriga: '#dbf7f5', antenas: 0, olhos: 2, orelhas: 'redonda', boina: '#d0405a' } });
  Reino.registrarPersonagem({ id: 'netuno-vovo',  // azul-marinho claro, cachecol e cabelo branco
    sprite: { base: 'et', idade: 'idoso', planeta: 'netuno', pele: '#7f8fe0', barriga: '#e0e4fb', antenas: 1, antena: '#bfe8ff', olhos: 2, orelhas: 'coelho', cachecol: '#ffb84d', cabelo: '#f4f2fa' } });
})();
