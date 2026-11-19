/* Minha Casa, térreo (interior `casa`): o layout e o registro. 4 cômodos vazios lado a lado, para ela mobiliar
   (casa.md §4): Cozinha (com a porta da Garagem embaixo) | Sala de Jantar | Sala de Estar (entrada, com a escada que
   sobe) | Banheiro. Cada cômodo
   tem só a janela e a caixa de mudança (abre o modo decorar com o kit dele); os móveis vêm de Reino.Casa. Na Sala de
   Estar, ao lado da caixa, o Baú de Guardados (casa/guardados.js; itens.md §7).
   Formato: docs/contratos/interiores.md §3. Confira com node jogo/ferramentas/validar/validar-interiores.js --so casa --detalhes. */
(function () {
  var R = window.Reino;

  /* ================= LAYOUT ================= */
  // rects com y = 1 (paredes nas fileiras 1-2, chão de 3 em diante); portas nas fileiras 7-8; saída embaixo da Sala de Estar
  var COZ = { x: 1, w: 10, h: 9 }, JAN = { x: 12, w: 12, h: 11 }, EST = { x: 25, w: 13, h: 11 }, BAN = { x: 39, w: 9, h: 9 };
  // a caixa de mudança no canto de cima, junto à parede, com o kit do cômodo
  function caixa(x, kit) { return { tipo: 'casa-caixa', x: x, y: 3, nome: 'Caixa de mudança', acao: { tipo: 'casaDecorar', kit: kit } }; }
  function comodo(id, nome, s, piso, parede, paleta) {
    return { id: id, nome: nome, placa: nome, rect: { x: s.x, y: 1, w: s.w, h: s.h }, piso: piso, parede: parede, paleta: paleta };
  }
  var objetos = [
    // janelas na parede do fundo, longe da placa (que fica no meio)
    { tipo: 'janela', x: COZ.x + 1, y: 1 }, { tipo: 'janela', x: JAN.x + 1, y: 1 }, { tipo: 'janela', x: JAN.x + 10, y: 1 },
    { tipo: 'janela', x: EST.x + 1, y: 1 }, { tipo: 'janela', x: BAN.x + 7, y: 1 },
    caixa(COZ.x, 'cozinha'), caixa(JAN.x, 'jantar'), caixa(EST.x, 'estar'), caixa(BAN.x + BAN.w - 1, 'banheiro'),
    // o Baú de Guardados (2×1), encostado na parede do fundo ao lado da caixa da Sala de Estar
    { tipo: 'casa-guardados', x: EST.x + 1, y: 3, nome: 'Baú de Guardados', acao: { tipo: 'guardados' } },
  ];

  Reino.registrarInterior({
    id: 'casa',
    lugar: 'casa',
    nome: 'Minha Casa',
    entrada: true,
    pacote: 'interior-casa',
    decoravel: true,
    objetosExtras: function () { return R.Casa ? R.Casa.objetosDoAndar('casa') : []; },
    tamanho: { w: 49, h: 13 },
    saida: { x: EST.x + 6, y: 11 },
    spawn: { x: EST.x + 6, y: 10 },
    // sobe para os quartos (casa/andar2.js), no canto de cima à direita da Sala de Estar; quem desce chega logo abaixo.
    // A porta de baixo da Cozinha leva à Garagem (casa/garagem.js); quem volta chega logo acima dela
    escadas: [{ x: EST.x + 11, y: 3, para: 'casa-2', olhar: { x: 0, y: -1 }, sentido: 'sobe' },
      { x: COZ.x + 4, y: COZ.h, para: 'casa-garagem', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: -1 } }],
    comodos: [
      comodo('estar', 'Sala de Estar', EST, 'taco', 'papel',
        { piso: '#f3cfa0', piso2: '#dcae78', parede: '#fff3e6', parede2: '#ffe0cc', rodape: '#e9877a', detalhe: '#ffc94d' }),
      comodo('jantar', 'Sala de Jantar', JAN, 'taco', 'madeira',
        { piso: '#e8bf8c', piso2: '#cf9f68', parede: '#f4ead8', parede2: '#e2d2b4', rodape: '#a8754a', detalhe: '#7ed9c8' }),
      comodo('cozinha', 'Cozinha', COZ, 'azulejo', 'azulejo',
        { piso: '#fff4e8', piso2: '#ffd9b8', parede: '#fff8ee', parede2: '#ffe0c8', rodape: '#ff9d3d', detalhe: '#6fdc8c' }),
      comodo('banheiro', 'Banheiro', BAN, 'azulejo', 'azulejo',
        { piso: '#eef8ff', piso2: '#cfe8fb', parede: '#f2fbff', parede2: '#d6eefc', rodape: '#5fb4ff', detalhe: '#b58cff' }),
    ],
    portas: [
      { x: COZ.x + COZ.w, y: 7, w: 1, h: 2 },   // cozinha ↔ jantar
      { x: JAN.x + JAN.w, y: 7, w: 1, h: 2 },   // jantar ↔ estar
      { x: EST.x + EST.w, y: 7, w: 1, h: 2 },   // estar ↔ banheiro
    ],
    corredores: [],
    objetos: objetos,
    npcs: [],
  });
})();
