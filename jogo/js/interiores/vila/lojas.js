/* Vila Arco-Íris, as 4 lojas por dentro (docs/contratos/vila.md §2): 'vila-casa' (Casa Bonita), 'vila-armas' (Forja
   Brilhante), 'vila-cabecas' (Elmos e Chapéus), 'vila-armaduras' (Armaduras e Botas). Cada uma 16 × 12 tiles, um cômodo
   { x: 1, y: 1, w: 14, h: 10 }, parte do Bosque (lugar 'bosque', entrada: false, pacote 'interior-bosque'), saída pela
   escada `portal` (8, 10) com seta de descer (chega logo acima dela; volta para a porta da loja na Vila).
   O lojista fica atrás do balcão (6, 4), com a ação vilaLoja; o corredor do balcão até a porta fica livre.
   Objetos de objetos-2.js e da biblioteca; sprites, vozes e falas de falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores;
  var FI = (R.FALAS_INTERIORES || {}).vila || {}, F = FI.objetos || {}, FN = FI.npcs || {};
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var SAIDA = { x: 8, y: 10 };

  function npc(id, loja) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: Object.assign({ base: 'pessoa' }, e.sprite || {}), voz: 'npc-' + id,
      x: 6, y: 4, acao: { tipo: 'vilaLoja', loja: loja }, falas: FN[id] || {} };
  }
  // [tipo, x, y, extra?]; `fala: 'chave'` vira nome + fala do falas.js
  function objetos(lista) {
    return lista.map(function (o) {
      var r = { tipo: o[0], x: o[1], y: o[2] }, ex = o[3] || {};
      Object.keys(ex).forEach(function (k) { if (k !== 'fala') r[k] = ex[k]; });
      if (ex.fala) r.fala = F[ex.fala] || [];
      return r;
    });
  }
  // o que toda loja tem: letreiro, janelas, balcão, capacho e plantinhas na porta
  function comuns(loja, cor) {
    return [['vila-letreiro', 7, 1, { var: { loja: loja } }], ['janela', 2, 1], ['janela', 13, 1],
      ['vila-balcao', 5, 5, { var: { cor: cor } }], ['vila-capacho', SAIDA.x, SAIDA.y],
      ['vaso-planta', 7, 10], ['vaso-planta', 9, 10]];
  }
  function loja(id, nome, comodo, lista) {
    R.registrarInterior({
      id: 'vila-' + id,
      lugar: 'bosque',
      nome: nome,
      entrada: false,
      pacote: 'interior-bosque',
      tamanho: { w: 16, h: 12 },
      spawn: { x: SAIDA.x, y: SAIDA.y - 1 },
      comodos: [Object.assign({ id: 'vila-' + id, nome: nome, placa: nome, rect: { x: 1, y: 1, w: 14, h: 10 } }, comodo)],
      corredores: [{ x: 7, y: 6, w: 3, h: 4 }],
      escadas: [{ x: SAIDA.x, y: SAIDA.y, para: 'vila', sentido: 'portal', seta: 'desce', chegar: { x: 0, y: -1 } }],
      objetos: objetos(comuns(id, comodo.cor).concat(lista)),
      npcs: [npc(comodo.lojista, id)],
    });
  }

  // Casa Bonita: rosa, vasos, quadros, almofadas, sofá e tapetes
  loja('casa', 'Casa Bonita', { lojista: 'lavanda', cor: '#ff86bb', piso: 'taco', parede: 'papel',
    paleta: { parede: '#ffd1e6', parede2: '#ffb8d6', rodape: '#c86aa0', detalhe: '#ffffff' } }, [
    ['vila-quadros', 5, 1], ['quadro', 9, 1], ['cortina', 12, 1],
    ['vila-tapetes-rolo', 1, 3, { nome: 'Tapetes', fala: 'casa-tapetes' }], ['vila-prateleira-vasos', 3, 3, { nome: 'Vasos', fala: 'casa-vasos' }],
    ['cesto', 5, 3], ['estante', 10, 3], ['flores', 13, 3], ['luminaria-pe', 14, 3],
    ['sofa', 1, 6], ['poltrona', 3, 6], ['tapete-redondo', 1, 7], ['mesa-centro', 1, 9], ['vila-almofadas', 4, 9, { nome: 'Almofadas', fala: 'casa-almofadas' }],
    ['almofada', 1, 10], ['flores', 4, 10], ['cesto', 5, 8],
    ['mesa', 11, 5], ['flores', 14, 5], ['tapete', 11, 7], ['vila-almofadas', 14, 8], ['vaso-grande', 10, 9], ['vila-tapetes-rolo', 12, 10], ['planta-alta', 14, 10],
  ]);
  // Forja Brilhante: pedra, espadas na parede, forja com fogo, bigorna e barris
  loja('armas', 'Forja Brilhante', { lojista: 'bigorna', cor: '#ff9f45', piso: 'pedra', parede: 'tijolo',
    paleta: { parede: '#c8705a', parede2: '#a85a48', rodape: '#5a3a2a', detalhe: '#ffe066' } }, [
    ['vila-espadas-parede', 5, 1], ['vila-escudo-parede', 9, 1, { var: { cor: '#5fb4ff' } }], ['vila-escudo-parede', 12, 1, { var: { cor: '#ff5c6a' } }],
    ['vila-suporte-espadas', 1, 3], ['vila-forja', 3, 3, { nome: 'Forja', fala: 'armas-forja' }], ['caixote', 5, 3],
    ['vila-suporte-espadas', 10, 3, { nome: 'Espadas', fala: 'armas-espadas' }], ['vila-barril-espadas', 11, 3], ['bau', 13, 3], ['vila-suporte-espadas', 14, 3],
    ['vila-bigorna', 2, 6, { nome: 'Bigorna', fala: 'armas-bigorna' }], ['balde', 1, 7], ['barril', 4, 7], ['tapete-listrado', 1, 9], ['caixote', 1, 10], ['vila-barril-espadas', 4, 10],
    ['pedestal', 11, 5], ['vila-barril-espadas', 14, 5], ['tapete', 11, 7], ['vila-bigorna', 14, 8], ['barril', 10, 9], ['caixote', 12, 10], ['vila-suporte-espadas', 14, 10],
    ['cesto', 5, 8],
  ]);
  // Elmos e Chapéus: lilás, chapéus em cabides, elmos em bustos, caixas de chapéu e espelho
  loja('cabecas', 'Elmos e Chapéus', { lojista: 'plumita', cor: '#b57cff', piso: 'carpete', parede: 'papel',
    paleta: { piso: '#9a7ad8', piso2: '#8a6ac8', parede: '#e0d4ff', parede2: '#c8b8f4', rodape: '#6a3fb0', detalhe: '#ffe066' } }, [
    ['vila-prateleira-chapeus', 5, 1], ['espelho', 9, 1], ['cortina', 12, 1],
    ['vila-cabide-chapeus', 1, 3, { nome: 'Cabide de chapéus', fala: 'cabecas-cabide', var: { n: 0 } }], ['vila-busto-elmo', 3, 3], ['vila-busto-elmo', 4, 3, { var: { cor: '#5fb4ff' } }], ['almofada', 5, 3],
    ['vila-busto-elmo', 10, 3, { nome: 'Busto com elmo', fala: 'cabecas-busto', var: { cor: '#ffe066' } }], ['vila-cabide-chapeus', 11, 3, { var: { n: 2 } }], ['almofada', 13, 3], ['vila-cabide-chapeus', 14, 3, { var: { n: 4 } }],
    ['poltrona', 1, 6], ['tapete-redondo', 2, 7], ['vila-caixas-chapeu', 4, 6, { nome: 'Caixas de chapéu', fala: 'cabecas-caixas' }], ['cabideiro', 1, 9], ['vila-cabide-chapeus', 4, 10, { var: { n: 1 } }],
    ['pedestal', 11, 5], ['vila-busto-elmo', 13, 6, { var: { cor: '#6fdc8c' } }], ['tapete', 10, 7], ['luminaria-pe', 10, 10], ['vila-caixas-chapeu', 14, 8], ['vitrine', 12, 10], ['vaso-planta', 14, 10],
    ['flores', 5, 8],
  ]);
  // Armaduras e Botas: azul, armaduras em manequins, botas em prateleiras, escudos e elmos
  loja('armaduras', 'Armaduras e Botas', { lojista: 'ferrolho', cor: '#5fb4ff', piso: 'tabuas', parede: 'pedra',
    paleta: { parede: '#b8c8e8', parede2: '#98acd4', rodape: '#3a4a7a', detalhe: '#ffe066' } }, [
    ['vila-escudo-parede', 5, 1, { var: { cor: '#5fb4ff' } }], ['vila-escudo-parede', 6, 1, { var: { cor: '#ffe066' } }], ['vila-escudo-parede', 9, 1, { var: { cor: '#ff5c6a' } }], ['estandarte', 12, 1],
    ['vila-manequim-armadura', 1, 3, { nome: 'Armadura', fala: 'armaduras-manequim', var: { cor: '#b0b0c2' } }], ['vila-prateleira-botas', 3, 3], ['caixote', 5, 3],
    ['vila-prateleira-botas', 10, 3, { nome: 'Botas', fala: 'armaduras-botas' }], ['bau', 12, 3], ['vila-manequim-armadura', 14, 3, { var: { cor: '#8fd0ff' } }],
    ['banco', 1, 6], ['vila-botas', 3, 6], ['tapete-listrado', 1, 8], ['bau', 4, 8], ['vila-manequim-armadura', 1, 10, { var: { cor: '#c08a5a' } }], ['barril', 4, 10],
    ['vila-busto-elmo', 13, 5, { nome: 'Elmo', fala: 'armaduras-elmo', var: { cor: '#5fb4ff' } }], ['tapete', 11, 7], ['vila-botas', 14, 7], ['vila-prateleira-botas', 10, 10], ['pedestal', 11, 5],
    ['vila-manequim-armadura', 14, 9, { var: { cor: '#ffd23f' } }], ['caixote', 12, 10], ['vila-botas', 5, 8],
  ]);
})();
