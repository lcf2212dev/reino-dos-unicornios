/* Salão de Beleza, parte 3: o layout e o registro do interior (um cômodo de 11×11).
   Esquerda: as duas cadeiras com espelho de camarim (cortes de cabelo) e a Dona Lulu; direita: lavatório,
   provador e arara (roupas); embaixo: a salinha de espera. Formato: docs/contratos/interiores.md §3.
   As falas moram em salao/falas.js e salao/personagens.js; os objetos próprios em salao/objetos.js. */
(function () {
  var R = window.Reino;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES['salao']) || { npcs: {}, objetos: {} };
  var S = R._predios['salao'];
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // objeto que se toca: nome e as falas de F.objetos[chave]
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  var CABELO = { tipo: 'tela', tela: 'salao-cabelo' }, ROUPA = { tipo: 'tela', tela: 'salao-roupa' };

  /** NPC do interior com sprite e voz do elenco (Reino.registrarPersonagem, salao/personagens.js).
      @param {string} id @param {number} x @param {number} y @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  // chão livre para mais alguém (npm run novo -- personagem … --predio salao, sem x/y)
  var VAGAS = [{ x: 7, y: 5 }, { x: 4, y: 8 }];

  /* ================= LAYOUT ================= */
  var objetos = [
    // parede do fundo (y 1-2): espelhos das cadeiras, placa, bandeirinhas e a prateleira dos produtos
    { tipo: 'janela', x: 1, y: 1 },
    { tipo: 'salao-espelho', x: 2, y: 1 },
    { tipo: 'arandela', x: 3, y: 1 }, { tipo: 'salao-espelho', x: 4, y: 1 },
    { tipo: 'salao-placa', x: 5, y: 1 },
    inter('prateleira', 'Produtos', { tipo: 'salao-prateleira', x: 6, y: 1 }),
    { tipo: 'bandeirinhas', x: 8, y: 1, w: 2 },
    { tipo: 'relogio-parede', x: 10, y: 1 }, { tipo: 'janela', x: 11, y: 1 },
    // canto do cabelo (esquerda, em cima): duas cadeiras, carrinho e secador (junto: a cadeira fica de propósito na frente do espelho)
    { tipo: 'flores', x: 1, y: 3 },
    inter('cadeira', 'Cadeira da Lulu', { tipo: 'salao-cadeira', x: 2, y: 3, junto: true, acao: CABELO }),
    inter('carrinho', 'Carrinho', { tipo: 'salao-carrinho', x: 3, y: 3 }),
    inter('cadeira', 'Cadeira da Lulu', { tipo: 'salao-cadeira', x: 4, y: 3, junto: true, acao: CABELO }),
    inter('secador', 'Secador', { tipo: 'salao-secador', x: 5, y: 4 }),
    { tipo: 'tapete-listrado', x: 1, y: 4, w: 4, h: 1, var: { cores: [S.COR2, '#fff8ee', S.COR, '#fff8ee'] } },
    { tipo: 'cesto', x: 1, y: 5 }, { tipo: 'almofada', x: 1, y: 6, var: { cor: S.ROSA2 } },
    // canto das roupas (direita): lavatório, provador e a arara
    { tipo: 'flores', x: 7, y: 3 },
    inter('pia', 'Lavatório', { tipo: 'salao-pia', x: 8, y: 3, junto: true }),
    { tipo: 'flores', x: 11, y: 3 },
    inter('provador', 'Provador', { tipo: 'salao-provador', x: 10, y: 5, acao: ROUPA }),
    inter('arara', 'Arara de roupas', { tipo: 'salao-arara', x: 7, y: 7, acao: ROUPA }),
    { tipo: 'cabideiro', x: 5, y: 8 }, { tipo: 'tapete-redondo', x: 7, y: 9, w: 2, h: 2, var: { cor: '#e9d4f7' } },
    // salinha de espera (embaixo)
    { tipo: 'sofa', x: 1, y: 9 }, { tipo: 'mesa-centro', x: 1, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
    { tipo: 'luminaria-pe', x: 3, y: 9 }, { tipo: 'vaso-grande', x: 1, y: 11 }, { tipo: 'salao-secador', x: 4, y: 11 },
    { tipo: 'poltrona', x: 9, y: 10, var: { cor: S.LILAS } }, { tipo: 'poltrona', x: 10, y: 10, var: { cor: S.ROSA } },
    { tipo: 'mesa-centro', x: 9, y: 11 }, { tipo: 'relogio-pe', x: 11, y: 10 }, { tipo: 'cesto', x: 11, y: 11 },
    { tipo: 'tapete', x: 5, y: 5, w: 3, h: 2, var: { cor: S.ROSA3, borda: S.COR } },
  ];

  // a Dona Lulu (e quem mais for registrado com predio: 'salao'), sem editar este layout
  var REG = R.personagensDoPredio ? R.personagensDoPredio('salao') : [];
  var npcs = REG.map(function (p, i) {
    var v = VAGAS[i % VAGAS.length];
    return npc(p.id, p.x != null ? p.x : v.x, p.y != null ? p.y : v.y, p.acao || CABELO);
  });

  Reino.registrarInterior({
    id: 'salao',
    lugar: 'salao',
    nome: 'Salão de Beleza',
    entrada: true,
    pacote: 'interior-salao',
    tamanho: { w: 13, h: 13 },
    saida: { x: 6, y: 11 },
    spawn: { x: 6, y: 10 },
    comodos: [
      { id: 'salao', nome: 'Salão de Beleza', placa: 'Salão de Beleza', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'azulejo', parede: 'papel',
        paleta: { piso: '#fbe3ef', piso2: '#e9d4f7', parede: S.PAREDE, parede2: '#f3dcff', rodape: S.COR, detalhe: S.COR2 } },
    ],
    corredores: [
      { x: 5, y: 4, w: 3, h: 8 },      // da porta até o fundo
      { x: 1, y: 7, w: 6, h: 2 },      // do meio até as cadeiras
    ],
    objetos: objetos,
    npcs: npcs,
  });
})();
