/* Loja das Fadas, parte 3 de 3: um salão com a Fada Pétala, as vitrines (enfeites e prêmios da Escola)
   e o espelho mágico, que mostra a montaria com os enfeites em uso.
   Aqui: ajudantes de montagem, o layout e o registro do interior. Os objetos ficam em loja/desenhos.js
   e loja/objetos.js (carregados antes); as falas moram em loja/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.loja) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  /* ================= AJUDANTES DE MONTAGEM ================= */
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do interior com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var TELA = { tipo: 'tela', tela: 'loja' };

  /* ================= LAYOUT ================= */
  // salão 15×12: balcão e Pétala à esquerda, espelho mágico ao fundo à direita, vitrines no meio
  var objetos = [
    // parede do fundo (y 1-2)
    { tipo: 'cortina', x: 1, y: 1, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-janela-redonda', x: 2, y: 1 },
    { tipo: 'cortina', x: 4, y: 1, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-lanterna', x: 5, y: 1 },
    { tipo: 'loja-fitas', x: 6, y: 1 },
    { tipo: 'espelho', x: 8, y: 1 },
    { tipo: 'loja-lanterna', x: 9, y: 1 },
    { tipo: 'espelho', x: 10, y: 1 },
    // fundo
    { tipo: 'flores', x: 1, y: 3, var: { vaso: '#b58cff' } },
    { tipo: 'flores', x: 2, y: 3, var: { vaso: '#ff9cc6' } }, { tipo: 'cesto', x: 3, y: 3 },
    { tipo: 'loja-cesta-lacos', x: 7, y: 3 },
    { tipo: 'flores', x: 8, y: 3 },
    { tipo: 'loja-vagalumes', x: 9, y: 3 },
    inter('espelho', 'Espelho mágico', { tipo: 'loja-espelho-magico', x: 11, y: 3 }),
    { tipo: 'loja-capas', x: 15, y: 3 },
    // balcão e tapetes (junto: o balcão e o manequim ficam de propósito na frente das flores e da cesta)
    { tipo: 'loja-cogumelo', x: 1, y: 4, var: { cor: '#b58cff' } },
    inter('caixa', 'Caixinha das estrelas', { tipo: 'loja-balcao', x: 2, y: 4, junto: true }),
    { tipo: 'loja-tapete-folhas', x: 11, y: 4, w: 3, h: 2 },
    { tipo: 'almofada', x: 10, y: 4, var: { cor: '#c9a8ff' } },
    { tipo: 'loja-cogumelo', x: 14, y: 7 },
    inter('potes', 'Potes de pó de estrela', { tipo: 'loja-potes', x: 13, y: 6 }),
    { tipo: 'loja-cogumelo', x: 15, y: 6, var: { cor: '#b58cff' } },
    { tipo: 'loja-manequim', x: 15, y: 5, junto: true },
    { tipo: 'cesto', x: 1, y: 6 },
    { tipo: 'loja-tapete-folhas', x: 2, y: 6, w: 4, h: 2 },
    { tipo: 'flores', x: 15, y: 7, var: { vaso: '#7fa84a' } },
    // vitrines
    { tipo: 'vaso-planta', x: 1, y: 8 },
    inter('vitrine-enfeites', 'Vitrine dos enfeites', { tipo: 'loja-vitrine-enfeites', x: 2, y: 8, acao: TELA }),
    inter('vitrine-premios', 'Prêmios da Escola', { tipo: 'loja-vitrine-premios', x: 10, y: 8, acao: TELA }),
    { tipo: 'loja-cogumelo', x: 13, y: 8, var: { cor: '#b58cff' } },
    { tipo: 'vaso-planta', x: 15, y: 9 },
    // frente
    { tipo: 'loja-cogumelo', x: 1, y: 10 },
    { tipo: 'loja-vagalumes', x: 4, y: 10 },
    { tipo: 'almofada', x: 2, y: 11, var: { cor: '#ff9cc6' } },
    { tipo: 'loja-cogumelo', x: 3, y: 11, var: { cor: '#ff7eb6' } },
    { tipo: 'cesto', x: 1, y: 12 }, { tipo: 'flores', x: 5, y: 12, var: { vaso: '#ff9cc6' } },
    { tipo: 'loja-vagalumes', x: 12, y: 10 },
    { tipo: 'almofada', x: 11, y: 11, var: { cor: '#c9a8ff' } },
    { tipo: 'loja-cogumelo', x: 14, y: 11, var: { cor: '#ffd34d' } },
    { tipo: 'flores', x: 13, y: 12, var: { vaso: '#b58cff' } }, { tipo: 'cesto', x: 15, y: 12 },
    { tipo: 'loja-cesta-lacos', x: 14, y: 12 }, { tipo: 'loja-cesta-lacos', x: 15, y: 4 },
  ];

  Reino.registrarInterior({
    id: 'loja',
    lugar: 'loja',
    nome: 'Loja das Fadas',
    entrada: true,
    pacote: 'interior-loja',
    tamanho: { w: 17, h: 14 },
    saida: { x: 8, y: 12 },
    spawn: { x: 8, y: 11 },
    comodos: [
      { id: 'salao', nome: 'Loja das Fadas', placa: 'Loja das Fadas', rect: { x: 1, y: 1, w: 15, h: 12 },
        piso: 'mosaico', parede: 'papel',
        paleta: { piso: '#efe4fb', piso2: '#c9dca0', detalhe: '#ff9cc6', parede: '#ffe8f3', parede2: '#d9c6f5', rodape: '#5e8a36' } },
    ],
    corredores: [
      { x: 7, y: 5, w: 3, h: 8 },     // da porta até o fundo
      { x: 5, y: 5, w: 5, h: 1 },     // até a Pétala
      { x: 6, y: 9, w: 9, h: 1 },     // na frente das vitrines
    ],
    objetos: objetos,
    npcs: [
      npc('petala', 5, 4, TELA),
    // + os registrados com predio: 'loja' e x/y (Reino.personagensDoPredio; prédio antigo não tem vagas: sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('loja').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || TELA);
    })),
  });
})();
