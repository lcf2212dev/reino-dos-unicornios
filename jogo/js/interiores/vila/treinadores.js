/* Vila Arco-Íris, Treinadores de Monstros por dentro (docs/contratos/monstros.md §2): 'vila-treinadores', 16 × 12
   tiles, um cômodo { x: 1, y: 1, w: 14, h: 10 }, parte do Bosque (lugar 'bosque', entrada: false, pacote
   'interior-bosque'), saída pela escada `portal` (8, 10) com seta de descer (volta para a porta do prédio na Vila).
   A Treinadora Kiara fica atrás do balcão (6, 4), com a ação 'treinadores' (sistemas/treinadores.js); o corredor do
   balcão até a porta fica livre. Objetos de treinadores-objetos.js e da biblioteca; sprite, voz e falas de
   treinadores-falas.js. */
(function () {
  var R = window.Reino;
  var FI = (R.FALAS_INTERIORES || {}).vila || {}, F = FI.objetos || {}, FN = FI.npcs || {};
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var SAIDA = { x: 8, y: 10 };

  // [tipo, x, y, extra?]; `fala: 'chave'` vira a fala do falas (o nome vem junto)
  function objetos(lista) {
    return lista.map(function (o) {
      var r = { tipo: o[0], x: o[1], y: o[2] }, ex = o[3] || {};
      Object.keys(ex).forEach(function (k) { if (k !== 'fala') r[k] = ex[k]; });
      if (ex.fala) r.fala = F[ex.fala] || [];
      return r;
    });
  }
  var e = ELENCO.kiara || {};
  R.registrarInterior({
    id: 'vila-treinadores',
    lugar: 'bosque',
    nome: 'Treinadores de Monstros',
    entrada: false,
    pacote: 'interior-bosque',
    tamanho: { w: 16, h: 12 },
    spawn: { x: SAIDA.x, y: SAIDA.y - 1 },
    comodos: [{ id: 'vila-treinadores', nome: 'Treinadores de Monstros', placa: 'Treinadores de Monstros',
      rect: { x: 1, y: 1, w: 14, h: 10 }, piso: 'taco', parede: 'papel',
      paleta: { parede: '#ffe0ec', parede2: '#ffc8dc', rodape: '#c8336e', detalhe: '#ffe066' } }],
    corredores: [{ x: 7, y: 6, w: 3, h: 4 }],
    escadas: [{ x: SAIDA.x, y: SAIDA.y, para: 'vila', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 } }],
    objetos: objetos([
      // parede: letreiro, janelas, quadro e o estandarte
      ['vila-treinadores-letreiro', 7, 1], ['janela', 2, 1], ['janela', 13, 1], ['quadro', 5, 1], ['estandarte', 10, 1],
      // fundo: prateleiras de bolas, a vitrine de monstrinhos e a bola gigante
      ['vila-treinadores-prateleira', 1, 3, { nome: 'MonsterBalls', fala: 'treinadores-bolas' }], ['vila-treinadores-prateleira', 3, 3],
      ['caixote', 5, 3], ['vila-treinadores-vitrine', 10, 3, { nome: 'Vitrine de monstros', fala: 'treinadores-vitrine' }],
      ['vila-treinadores-estatua', 14, 3, { nome: 'MonsterBall gigante', fala: 'treinadores-estatua' }],
      // o balcão da Kiara e o capacho da porta
      ['vila-balcao', 5, 5, { var: { cor: '#ff5c9a' } }], ['vila-capacho', SAIDA.x, SAIDA.y],
      ['vaso-planta', 7, 10], ['vaso-planta', 9, 10],
      // esquerda: o tapete de treino, banco e plantas
      ['vila-treinadores-tapete', 1, 6, { nome: 'Tapete de treino', fala: 'treinadores-tapete' }], ['banco', 1, 9], ['flores', 4, 6],
      ['planta-alta', 1, 10], ['cesto', 4, 10], ['vila-treinadores-estatua', 5, 8],
      // direita: mais bolas, mesa, tapete, baú e plantas
      ['vila-treinadores-prateleira', 13, 5], ['mesa', 10, 6], ['tapete', 11, 8], ['bau', 14, 8],
      ['planta-alta', 14, 10], ['vaso-grande', 11, 10], ['caixote', 12, 10], ['flores', 12, 5],
    ]),
    npcs: [{ id: 'kiara', nome: e.nome || 'Treinadora Kiara', genero: 'f', sprite: Object.assign({ base: 'pessoa' }, e.sprite || {}),
      voz: 'npc-kiara', x: 6, y: 4, acao: { tipo: 'treinadores' }, falas: FN.kiara || {} }],
  });
})();
