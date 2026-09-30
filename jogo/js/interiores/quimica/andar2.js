/* Laboratório de Química, 2º andar (interior `quimica-2`): o layout e o registro. 3 cômodos de 13×13 lado a lado,
   como o térreo: Cozinha Química (esquerda: o Fogão dos Estados e a Mesa de Separar Misturas, com a Dona Caramela) |
   Salão das Curiosidades (meio, com a escada que desce e o Professor Carbono) | Biblioteca da Química (direita: a
   estante dos livros). Sem saída para o mapa: desce-se pela escada. Formato: docs/contratos/interiores.md §3.
   As falas dos objetos moram em quimica/andar2-falas.js; os objetos próprios em quimica/andar2-objetos*.js.
   Contrato do andar: docs/contratos/quimica.md §9. Confira com
   node jogo/ferramentas/validar/validar-interiores.js --so quimica-2 --detalhes. */
(function () {
  var R = window.Reino;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES['quimica']) || { npcs: {}, objetos: {} };
  var S = R._predios['quimica'];
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // objeto que se toca: nome e as falas de F.objetos[chave]
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do andar com sprite e voz do elenco (reservas.js + personagens.js).
      @param {string} id @param {number} x @param {number} y @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }

  /* ================= LAYOUT ================= */
  // CONTRATO (docs/contratos/quimica.md §9): ids e rects dos cômodos, portas, a escada (21, 12) e o spawn (21, 11),
  // as vagas do Professor Carbono (24, 6) e da Dona Caramela (7, 6), as chaves dos 3 objetos que abrem as telas
  // (fogao, mesa-separar, estante-livros) e a ação das curiosidades ({ tipo: 'quimica-curiosidade', tema }).
  var COZ = { x: 1, y: 1 }, CUR = { x: 15, y: 1 }, BIB = { x: 29, y: 1 };
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function tela(chave, nome, t, o) { return inter(chave, nome, Object.assign(o, { acao: { tipo: 'tela', tela: t } })); }
  // objeto que conta uma curiosidade do tema (sorteada sem repetir na sessão, na voz do Professor Carbono)
  function cur(nome, tema, o) { return Object.assign(o, { nome: nome, acao: { tipo: 'quimica-curiosidade', tema: tema } }); }
  // enchimento do esqueleto (só para o validador passar enquanto as frentes trabalham): a frente do cenário troca
  // tudo isto pelos cômodos de verdade. Tapetes cobrem o chão fora do corredor; o resto são móveis comuns
  function enchimento(meio) {
    var l = [
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'relogio-parede', x: 8, y: 0 },
      { tipo: 'vaso-planta', x: 12, y: 2 }, { tipo: 'pilha-livros', x: 12, y: 4 }, { tipo: 'cesto', x: 12, y: 6 },
      { tipo: 'flores', x: 0, y: 12 }, { tipo: 'caixote', x: 12, y: 12 }, { tipo: 'vaso-grande', x: 0, y: 6 },
      { tipo: 'planta-alta', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 12, y: 10 }, { tipo: 'globo', x: 2, y: 12 },
      { tipo: 'almofada', x: 10, y: 12 },
    ];
    return meio ? l.concat([{ tipo: 'tapete', x: 0, y: 3, w: 5, h: 9 }, { tipo: 'tapete-listrado', x: 8, y: 3, w: 5, h: 9 }])
      : l.concat([{ tipo: 'tapete', x: 1, y: 3, w: 11, h: 5 }, { tipo: 'tapete-listrado', x: 1, y: 8, w: 11, h: 4 }]);
  }
  var objetos = [].concat(
    /* ---------- COZINHA QUÍMICA ---------- */
    sala(COZ.x, COZ.y, [
      tela('fogao', 'Fogão dos Estados', 'quimica-estados', { tipo: 'lab-bancada', x: 3, y: 3 }),
      tela('mesa-separar', 'Mesa de Separar Misturas', 'quimica-separar', { tipo: 'lab-bancada', x: 3, y: 8 }),
      cur('Potes da cozinha', 'cozinha', { tipo: 'estante', x: 0, y: 2 }),
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
    ].concat(enchimento())),
    /* ---------- SALÃO DAS CURIOSIDADES (com a escada) ---------- */
    sala(CUR.x, CUR.y, [
      cur('Vitrine dos metais', 'metais', { tipo: 'estante', x: 1, y: 2 }),
      cur('Vitrine dos cristais', 'cristais', { tipo: 'estante', x: 10, y: 2 }),
      { tipo: 'janela', x: 3, y: 0 }, { tipo: 'janela', x: 9, y: 0 },
    ].concat(enchimento(true))),
    /* ---------- BIBLIOTECA DA QUÍMICA ---------- */
    sala(BIB.x, BIB.y, [
      tela('estante-livros', 'Estante dos livros', 'quimica-livros', { tipo: 'estante', x: 5, y: 2 }),
      cur('Retratos de cientistas', 'cientistas', { tipo: 'estante', x: 1, y: 2 }),
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'janela', x: 11, y: 0 },
    ].concat(enchimento()))
  );

  // os personagens do andar (reservas.js; visual em personagens.js), cada um na vaga e com a ação da reserva
  var npcs = (R.personagensDoPredio ? R.personagensDoPredio('quimica-2') : []).map(function (p) {
    return npc(p.id, p.x, p.y, p.acao || { tipo: 'quimica-curiosidade', tema: 'todas' });
  });

  Reino.registrarInterior({
    id: 'quimica-2',
    lugar: 'quimica',
    nome: 'Laboratório de Química, 2º andar',
    pacote: 'interior-quimica',
    tamanho: { w: 43, h: 15 },
    spawn: { x: CUR.x + 6, y: 11 },
    // desce para o térreo: quem sobe de lá chega logo acima do vão, (21, 11), olhando para o salão
    escadas: [{ x: CUR.x + 6, y: 12, para: 'quimica', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: 1 }, sentido: 'desce' }],
    comodos: [
      { id: 'cozinha', nome: 'Cozinha Química', placa: 'Cozinha Química', rect: { x: COZ.x, y: COZ.y, w: 13, h: 13 },
        piso: 'azulejo', parede: 'azulejo',
        paleta: { piso: '#fff4e8', piso2: '#ffd9b8', parede: '#fff8ee', parede2: '#ffe0c8', rodape: '#ff9d3d', detalhe: S.COR2 } },
      { id: 'curiosidades', nome: 'Salão das Curiosidades', placa: 'Salão das Curiosidades', rect: { x: CUR.x, y: CUR.y, w: 13, h: 13 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: S.PAREDE, parede2: '#e9dcff', rodape: S.COR, detalhe: '#ffd34d' } },
      { id: 'biblioteca', nome: 'Biblioteca da Química', placa: 'Biblioteca da Química', rect: { x: BIB.x, y: BIB.y, w: 13, h: 13 },
        piso: 'carpete', parede: 'madeira',
        paleta: { piso: '#cfe8d8', piso2: '#b3d6c0', parede: '#f4ead8', parede2: '#e2d2b4', rodape: '#3fae8a', detalhe: S.COR } },
    ],
    portas: [
      { x: COZ.x + 13, y: 9, w: 1, h: 2 },   // cozinha ↔ salão
      { x: CUR.x + 13, y: 9, w: 1, h: 2 },   // salão ↔ biblioteca
    ],
    corredores: [
      { x: CUR.x + 5, y: 3, w: 3, h: 10 },   // da escada até o fundo do salão
      { x: COZ.x + 9, y: 9, w: 19, h: 2 },   // porta a porta
      { x: BIB.x, y: 9, w: 4, h: 2 },        // entrada da biblioteca
    ],
    objetos: objetos,
    npcs: npcs,
  });
})();
