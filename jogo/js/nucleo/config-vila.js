/* Vila Arco-Íris: os números das 4 lojas e da Teleportadora (docs/contratos/vila.md §3). Reino.config.vila.
   Só dados (node: true), logo depois do config-itens.js. */
(function () {
  var R = window.Reino;
  R.config = R.config || {};
  R.config.vila = {
    bimestre: 4,              // a pergunta do lojista sai de todas as perguntas das matérias deste bimestre (pedido)
    precoDecor: 30,           // cada enfeite da Casa Bonita custa 30 estrelas (pedido)
    // preço de compra das peças das lojas, pela raridade (estrelas)
    precos: { comum: 20, raro: 35, epico: 55, lendario: 80 },
    vendaFracao: 0.5,         // a loja paga metade do preço (arredonda para baixo, mínimo 1)
    // peça sem preço (as que caem dos monstros): o que a loja paga, pela raridade
    vendaDrop: { comum: 6, raro: 12, epico: 20, lendario: 35 },
    maxPorItem: 10,           // quantas de uma mesma peça cabem no carrinho de uma vez
    chegadaVila: { x: 20, y: 20 },          // onde ela chega na Vila pela Teleportadora (praça)
    chegadaCidade: { x: 31, y: 21 },        // onde ela chega na praça da cidade pela Teleportadora
    teleportadoraMapa: { x: 31, y: 20 },    // a Teleportadora na praça da cidade: este tile e o da direita (sólidos)
  };
})();
