/* Números da Cidade Nova e das suas lojas (docs/contratos/cidade-nova.md): cada um comentado.
   Fica num arquivo separado porque o config.js já é grande. Carrega logo depois do config-itens. */
(function () {
  var R = window.Reino;
  R.config.lojaCidade = {
    // preço único dos 50 móveis de decoração da casa (pedido: cada item custa 30 estrelas)
    precoDecor: 30,
    // a pergunta de entrada é sorteada só entre as perguntas disponíveis deste bimestre (pedido: 4º)
    bimestre: 4,
    // preço de venda dos equipamentos que não declaram `venda` (os que caem de monstro): por raridade
    vendaPorRaridade: { comum: 8, raro: 16, epico: 28, lendario: 45 },
    // quantas peças de cada item cabem num pedido de uma vez (o carrinho da loja)
    maxPorItem: 20,
    // onde a Mariana chega: no portal da Cidade Nova e na praça principal, ao voltar da Teleportadora
    chegadaCidade: { x: 25, y: 33 },
    chegadaPrincipal: { x: 32, y: 23 },
    // o portal da Cidade Nova, no centro-direita do Bosque (2×2; o pé em y+1)
    portalBosque: { x: 43, y: 21 },
    // o portal de volta, na entrada da Cidade Nova
    portalCidade: { x: 25, y: 34 },
    // a Teleportadora na praça principal (2×2; o pé em y+1) e as duas da Cidade Nova
    teleportadoraPrincipal: { x: 25, y: 23 },
    teleportadoraEntrada: { x: 29, y: 31 },
    teleportadoraPraca: { x: 25, y: 20 },
  };
})();
