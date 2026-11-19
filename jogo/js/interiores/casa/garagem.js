/* Minha Casa, a Garagem (interior `casa-garagem`; pedido de 19/11, pedidos/2026-11-19-garagem-lugares.md; casa.md §2):
   a mesma casa, um cômodo a mais. Entra-se pela porta de baixo da Cozinha, no térreo (casa/casa.js), e volta-se pela
   porta da parede do fundo. Piso de pedra e parede de tijolo; o balcão do Mercado de Lugares Famosos (ação
   { tipo: 'vilaLoja', loja: 'lugares' }: a loja das miniaturas, vila.md §4), a bancada com o painel de ferramentas, o
   portão de enrolar com o carro da família na frente, a bicicleta, os pneus e a prateleira. O resto do chão é livre
   para ela pôr as miniaturas (e qualquer móvel): decorável, os móveis vêm de Reino.Casa (casa.md §4, §8).
   Formato: docs/contratos/interiores.md §3. Confira com node jogo/ferramentas/validar/validar-interiores.js --so casa-garagem --detalhes. */
(function () {
  var R = window.Reino;
  var G = { x: 1, w: 20, h: 11 };   // o cômodo: paredes nas fileiras 1-2, chão de 3 a 11

  Reino.registrarInterior({
    id: 'casa-garagem',
    lugar: 'casa',
    nome: 'Minha Casa, Garagem',
    pacote: 'interior-casa',
    decoravel: true,
    objetosExtras: function () { return R.Casa ? R.Casa.objetosDoAndar('casa-garagem') : []; },
    tamanho: { w: 22, h: 13 },
    spawn: { x: 3, y: 4 },
    // a porta do fundo volta para a Cozinha (a ponta de lá: casa/casa.js); quem chega da casa aparece logo abaixo dela
    escadas: [{ x: 3, y: 3, para: 'casa', sentido: 'portal', chegar: { x: 0, y: 1 }, olhar: { x: 0, y: 1 } }],
    comodos: [
      { id: 'garagem', nome: 'Garagem', placa: 'Garagem', rect: { x: G.x, y: 1, w: G.w, h: G.h }, piso: 'pedra', parede: 'tijolo',
        paleta: { piso: '#d8d4e4', piso2: '#c2bcd4', parede: '#e9a07a', parede2: '#d4825e', rodape: '#8e86ad', detalhe: '#ffd34d' } },
    ],
    portas: [],
    corredores: [],
    objetos: [
      { tipo: 'casa-garagem-porta', x: 3, y: 1, nome: 'Porta da cozinha' },
      { tipo: 'casa-garagem-ferramentas', x: 12, y: 1, nome: 'Painel de ferramentas' },
      { tipo: 'casa-garagem-portao', x: 16, y: 1, nome: 'Portão da garagem' },
      { tipo: 'casa-garagem-balcao', x: 6, y: 4, nome: 'Mercado de Lugares Famosos', acao: { tipo: 'vilaLoja', loja: 'lugares' } },
      { tipo: 'casa-garagem-bancada', x: 12, y: 3, nome: 'Bancada' },
      { tipo: 'casa-garagem-carro', x: 16, y: 4, nome: 'Carro' },
      { tipo: 'casa-garagem-pneus', x: 20, y: 8, nome: 'Pneus' },
      { tipo: 'casa-garagem-bicicleta', x: 18, y: 10, nome: 'Bicicleta' },
      { tipo: 'casa-garagem-prateleira', x: 1, y: 10, nome: 'Prateleira' },
    ],
    npcs: [],
  });
})();
