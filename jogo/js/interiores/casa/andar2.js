/* Minha Casa, 2º andar (interior `casa-2`): os 3 quartos vazios, lado a lado. Quarto (do jogador, com a escada que
   desce, à esquerda) | Quarto do unicórnio | Quarto do ET (o amigo da viagem de foguete; só móveis avulsos, sem kit). Sem saída para o mapa: desce-se pela escada. As placas trocam
   {nome}, {a|b} e {uni} (casa.md §4). Formato: docs/contratos/interiores.md §3.
   Confira com node jogo/ferramentas/validar/validar-interiores.js --so casa-2 --detalhes. */
(function () {
  var R = window.Reino;

  /* ================= LAYOUT ================= */
  var QJ = { x: 1, w: 12, h: 11 }, QU = { x: 14, w: 12, h: 11 }, QE = { x: 27, w: 12, h: 11 };
  function caixa(x, kit) { return { tipo: 'casa-caixa', x: x, y: 3, nome: 'Caixa de mudança', acao: { tipo: 'casaDecorar', kit: kit } }; }
  var objetos = [
    { tipo: 'janela', x: QJ.x + 1, y: 1 }, { tipo: 'janela', x: QJ.x + 10, y: 1 },
    { tipo: 'janela', x: QU.x + 1, y: 1 }, { tipo: 'janela', x: QU.x + 10, y: 1 },
    { tipo: 'janela', x: QE.x + 1, y: 1 }, { tipo: 'janela', x: QE.x + 10, y: 1 },
    caixa(QJ.x + QJ.w - 1, 'quarto-jogador'), caixa(QU.x + QU.w - 1, 'quarto-uni'), caixa(QE.x + QE.w - 1, 'quarto-et'),
  ];

  Reino.registrarInterior({
    id: 'casa-2',
    lugar: 'casa',
    nome: 'Minha Casa, 2º andar',
    pacote: 'interior-casa',
    decoravel: true,
    objetosExtras: function () { return R.Casa ? R.Casa.objetosDoAndar('casa-2') : []; },
    tamanho: { w: 40, h: 13 },
    spawn: { x: QJ.x + 1, y: 10 },
    // desce para o térreo, no canto de baixo à esquerda do Quarto; quem sobe chega logo acima do vão
    escadas: [{ x: QJ.x + 1, y: 11, para: 'casa', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: 1 }, sentido: 'desce' }],
    comodos: [
      { id: 'quarto-jogador', nome: 'Quarto', placa: 'Quarto {da|do} {nome}', rect: { x: QJ.x, y: 1, w: QJ.w, h: QJ.h },
        piso: 'carpete', parede: 'papel',
        paleta: { piso: '#f6d6ec', piso2: '#ecc0dc', parede: '#fff0f8', parede2: '#ffd9ee', rodape: '#ff7eb6', detalhe: '#ffd34d' } },
      { id: 'quarto-uni', nome: 'Quarto do unicórnio', placa: 'Quarto de {uni}', rect: { x: QU.x, y: 1, w: QU.w, h: QU.h },
        piso: 'carpete', parede: 'papel',
        paleta: { piso: '#e2dcff', piso2: '#cfc4fa', parede: '#f6f2ff', parede2: '#e6dcff', rodape: '#b58cff', detalhe: '#7ed9c8' } },
      // o quarto do ET: verde-limão e azul de céu de noite (o espaço), com detalhe lilás
      { id: 'quarto-et', nome: 'Quarto do ET', placa: 'Quarto do ET', rect: { x: QE.x, y: 1, w: QE.w, h: QE.h },
        piso: 'carpete', parede: 'papel',
        paleta: { piso: '#d6f5df', piso2: '#bfe9cc', parede: '#eef2ff', parede2: '#d9e0ff', rodape: '#4fc48a', detalhe: '#b58cff' } },
    ],
    portas: [
      { x: QJ.x + QJ.w, y: 7, w: 1, h: 2 },   // quarto ↔ quarto do unicórnio
      { x: QU.x + QU.w, y: 7, w: 1, h: 2 },   // quarto do unicórnio ↔ quarto do ET
    ],
    corredores: [],
    objetos: objetos,
    npcs: [],
  });
})();
