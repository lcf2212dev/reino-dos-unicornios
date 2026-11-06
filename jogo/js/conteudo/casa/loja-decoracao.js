/* Loja de decoração da Cidade Nova: 50 móveis/objetos NOVOS para a casa, todos a 30 estrelas
   (docs/contratos/cidade-nova.md). Cada um é uma peça avulsa (`Reino.registrarMovelCasa`) que a
   CasaMoveis.guardar grava numa chave `loja:<id>:<n>`; o modo decorar da casa já a mostra e deixa
   colocar como qualquer móvel de sala. O desenho é uma variante de um objeto que já existe
   (interiores/casa/loja-moveis.js), com a cor/var fixa daqui. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  if (!R || !R.registrarMovelCasa) return;
  var ITENS = [
    // ---- 10 vasos de planta ----
    { id: 'vaso-rosas', nome: 'Vaso de rosas', base: 'vaso-planta', var: { vaso: '#e07a9a' }, comodo: 'estar', direcoes: 1 },
    { id: 'vaso-tulipas', nome: 'Tulipas', base: 'vaso-planta', var: { vaso: '#ff9d2e' }, comodo: 'estar', direcoes: 1 },
    { id: 'vaso-girassois', nome: 'Girassóis', base: 'vaso-planta', var: { vaso: '#ffd34d' }, comodo: 'jantar', direcoes: 1 },
    { id: 'vaso-margaridas', nome: 'Margaridas', base: 'vaso-planta', var: { vaso: '#f4f0ff' }, comodo: 'jantar', direcoes: 1 },
    { id: 'vaso-lavandas', nome: 'Lavandas', base: 'vaso-planta', var: { vaso: '#b58cff' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'vaso-cactos', nome: 'Vaso de cactos', base: 'vaso-planta', var: { vaso: '#6fdc8c' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'vaso-samambaias', nome: 'Samambaias', base: 'vaso-planta', var: { vaso: '#3fc98a' }, comodo: 'banheiro', direcoes: 1 },
    { id: 'vaso-lirios', nome: 'Vaso de lírios', base: 'vaso-planta', var: { vaso: '#8fd8ff' }, comodo: 'quarto-uni', direcoes: 1 },
    { id: 'vaso-orquideas', nome: 'Orquídeas', base: 'vaso-planta', var: { vaso: '#ff8ac4' }, comodo: 'quarto-uni', direcoes: 1 },
    { id: 'vaso-jasmim', nome: 'Vaso de jasmim', base: 'vaso-planta', var: { vaso: '#fff1d0' }, comodo: 'quarto-et', direcoes: 1 },
    // ---- 8 arranjos de flores ----
    { id: 'flores-campo', nome: 'Flores campo', base: 'flores', var: { vaso: '#7cc15a', cores: ['#ffd34d', '#ff6b8a', '#ffffff'] }, comodo: 'estar', direcoes: 1 },
    { id: 'buque-rosa', nome: 'Buquê rosa', base: 'flores', var: { vaso: '#ff9cc6', cores: ['#ff6b8a', '#ffc2dc', '#ffffff'] }, comodo: 'jantar', direcoes: 1 },
    { id: 'buque-azul', nome: 'Buquê azul', base: 'flores', var: { vaso: '#5fb4ff', cores: ['#3f7fe0', '#8fd8ff', '#ffffff'] }, comodo: 'banheiro', direcoes: 1 },
    { id: 'buque-amarelo', nome: 'Buquê amarelo', base: 'flores', var: { vaso: '#ffd34d', cores: ['#ffd34d', '#ff9d2e', '#fff4cc'] }, comodo: 'cozinha', direcoes: 1 },
    { id: 'buque-lilas', nome: 'Buquê lilás', base: 'flores', var: { vaso: '#b58cff', cores: ['#9b5cff', '#c9b8ff', '#ffffff'] }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'buque-coral', nome: 'Buquê coral', base: 'flores', var: { vaso: '#ff8a3d', cores: ['#ff5c3a', '#ffb3a0', '#fff1d0'] }, comodo: 'quarto-uni', direcoes: 1 },
    { id: 'buque-branco', nome: 'Buquê branco', base: 'flores', var: { vaso: '#c9d4e0', cores: ['#ffffff', '#f4f0ff', '#ffd34d'] }, comodo: 'quarto-et', direcoes: 1 },
    { id: 'buque-arcoiris', nome: 'Buquê arco', base: 'flores', var: { vaso: '#ff9cc6', cores: ['#ff6b8a', '#ffd34d', '#5fb4ff', '#6fdc8c'] }, comodo: 'estar', direcoes: 1 },
    // ---- 6 quadros ----
    { id: 'quadro-praia', nome: 'Quadro praia', base: 'quadro', var: { moldura: '#c9a27a', cena: 'mar' }, comodo: 'estar', parede: true, direcoes: 1 },
    { id: 'quadro-floresta', nome: 'Quadro mata', base: 'quadro', var: { moldura: '#7cc15a', cena: 'paisagem' }, comodo: 'estar', parede: true, direcoes: 1 },
    { id: 'quadro-castelo', nome: 'Quadro castelo', base: 'quadro', var: { moldura: '#b58cff', cena: 'castelo' }, comodo: 'quarto-jogador', parede: true, direcoes: 1 },
    { id: 'quadro-flores', nome: 'Quadro flores', base: 'quadro', var: { moldura: '#ff9cc6', cena: 'flor' }, comodo: 'quarto-jogador', parede: true, direcoes: 1 },
    { id: 'quadro-retrato', nome: 'Quadro retrato', base: 'quadro', var: { moldura: '#ffd34d', cena: 'retrato' }, comodo: 'quarto-uni', parede: true, direcoes: 1 },
    { id: 'quadro-jardim', nome: 'Quadro jardim', base: 'quadro', var: { moldura: '#3fc98a', cena: 'paisagem' }, comodo: 'jantar', parede: true, direcoes: 1 },
    // ---- 4 tapetes ----
    { id: 'tapete-estrelado', nome: 'Tapete estrela', base: 'tapete', var: { cor: '#7c5cff', borda: '#ffd34d' }, comodo: 'estar', direcoes: 1 },
    { id: 'tapete-rosa', nome: 'Tapete rosa', base: 'tapete', var: { cor: '#ff9cc6', borda: '#fff1d0' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'tapete-azul', nome: 'Tapete azul', base: 'tapete', var: { cor: '#3f7fe0', borda: '#ffffff' }, comodo: 'quarto-uni', direcoes: 1 },
    { id: 'tapete-confete', nome: 'Tapete redondo', base: 'tapete-redondo', var: { cores: ['#ffd34d', '#ff6b8a', '#8fd8ff', '#ffffff'] }, comodo: 'estar', direcoes: 1 },
    // ---- 4 luminárias ----
    { id: 'luminaria-rosa', nome: 'Luminária rosa', base: 'luminaria-pe', var: { cor: '#ff9cc6' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'luminaria-sol', nome: 'Luminária sol', base: 'luminaria-pe', var: { cor: '#ffd34d' }, comodo: 'estar', direcoes: 1 },
    { id: 'luminaria-azul', nome: 'Luminária azul', base: 'luminaria-pe', var: { cor: '#8fd8ff' }, comodo: 'quarto-uni', direcoes: 1 },
    { id: 'luminaria-lilas', nome: 'Luminária lila', base: 'luminaria-pe', var: { cor: '#b58cff' }, comodo: 'quarto-et', direcoes: 1 },
    // ---- 4 assentos ----
    { id: 'cadeira-rosa', nome: 'Cadeira rosa', base: 'cadeira', var: { cor: '#fff1d0', almofada: '#ff9cc6' }, comodo: 'jantar', direcoes: 1 },
    { id: 'cadeira-azul', nome: 'Cadeira azul', base: 'cadeira', var: { cor: '#c9d4e0', almofada: '#5fb4ff' }, comodo: 'cozinha', direcoes: 1 },
    { id: 'poltrona-lilas', nome: 'Poltrona lilás', base: 'poltrona', var: { cor: '#b58cff' }, comodo: 'estar', direcoes: 1 },
    { id: 'poltrona-verde', nome: 'Poltrona verde', base: 'poltrona', var: { cor: '#7cc15a' }, comodo: 'quarto-jogador', direcoes: 1 },
    // ---- 4 prateleiras e plantas altas ----
    { id: 'prateleira-livros', nome: 'Prateleira', base: 'prateleira-parede', var: { itens: ['livro', 'vaso', 'ursinho', 'planta'] }, comodo: 'quarto-jogador', parede: true, direcoes: 1 },
    { id: 'prateleira-xicaras', nome: 'Xícaras', base: 'prateleira-parede', var: { itens: ['xicara', 'bule', 'vaso'] }, comodo: 'cozinha', parede: true, direcoes: 1 },
    { id: 'planta-jardim', nome: 'Planta jardim', base: 'planta-alta', var: { vaso: '#ffb020' }, comodo: 'estar', direcoes: 1 },
    { id: 'planta-lua', nome: 'Planta da lua', base: 'planta-alta', var: { vaso: '#c9b8ff' }, comodo: 'quarto-uni', direcoes: 1 },
    // ---- 4 baús e caixotes ----
    { id: 'bau-tesouro', nome: 'Baú tesouro', base: 'bau', var: { cor: '#c9a27a', moedas: true }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'bau-rosa', nome: 'Baú rosa', base: 'bau', var: { cor: '#ff9cc6' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'caixote-brinquedos', nome: 'Brinquedos', base: 'caixote', var: { cor: '#ffd34d', item: 'ursinho' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'caixote-livros', nome: 'Livros', base: 'caixote', var: { cor: '#8fd8ff', item: 'livro' }, comodo: 'quarto-et', direcoes: 1 },
    // ---- 3 almofadas ----
    { id: 'almofada-rosa', nome: 'Almofada rosa', base: 'almofada', var: { cor: '#ff9cc6' }, comodo: 'estar', direcoes: 1 },
    { id: 'almofada-sol', nome: 'Almofada sol', base: 'almofada', var: { cor: '#ffd34d' }, comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'almofada-azul', nome: 'Almofada azul', base: 'almofada', var: { cor: '#8fd8ff' }, comodo: 'quarto-uni', direcoes: 1 },
    // ---- 3 relógios de parede ----
    { id: 'relogio-madeira', nome: 'Relógio', base: 'relogio-parede', var: { cor: '#c9a27a' }, comodo: 'estar', parede: true, direcoes: 1 },
    { id: 'relogio-rosa', nome: 'Relógio rosa', base: 'relogio-parede', var: { cor: '#ff9cc6' }, comodo: 'quarto-jogador', parede: true, direcoes: 1 },
    { id: 'relogio-verde', nome: 'Relógio verde', base: 'relogio-parede', var: { cor: '#7cc15a' }, comodo: 'cozinha', parede: true, direcoes: 1 },
  ];
  R.LOJA_DECOR_ITENS = ITENS;
  ITENS.forEach(function (m) {
    R.registrarMovelCasa({ id: m.id, nome: m.nome, objeto: 'loja-movel-' + m.id, comodo: m.comodo,
      direcoes: m.direcoes || 1, parede: !!m.parede, preco: 30, loja: 'casa' });
  });
})();
