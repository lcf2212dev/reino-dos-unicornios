/* Lista da Loja das Fadas (dados, sem DOM): enfeites à venda e os prêmios da Escola.
   PROVISÓRIO: os mesmos 7 enfeites de hoje, para o jogo rodar. O construtor da Fase 1 (C)
   troca este arquivo inteiro (lista única usada por ui.js, pela Loja por dentro e pelas ferramentas). */
(function () {
  var L = {};
  L.ENFEITES = [
    { id: 'flor', nome: 'Flor na orelha', preco: 8, slot: 'orelha', icone: '🌸' },
    { id: 'laco', nome: 'Laço de fita', preco: 12, slot: 'orelha', icone: '🎀' },
    { id: 'oculos', nome: 'Óculos de coração', preco: 15, slot: 'olho', icone: '💗' },
    { id: 'capa', nome: 'Capa mágica (para você)', preco: 20, slot: 'capa', icone: '🦸' },
    { id: 'coroa', nome: 'Coroa real', preco: 25, slot: 'cabeca', icone: '👑' },
    { id: 'estrelinhas', nome: 'Rastro de estrelinhas', preco: 30, slot: 'rastro', icone: '✨' },
    { id: 'asasFada', nome: 'Asinhas de fada', preco: 45, slot: 'asas', icone: '🧚' },
  ];
  L.enfeite = function (id) { return L.ENFEITES.find(function (x) { return x.id === id; }) || null; };
  (window.Reino = window.Reino || {}).LojaItens = L;
})();
