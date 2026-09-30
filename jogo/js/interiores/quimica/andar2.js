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
  var AMARELO = '#ffd34d', CREME = '#fff8ee', MUSEU = '#c0394a';
  var objetos = [].concat(
    /* ---------- COZINHA QUÍMICA: o fogão, a mesa de separar e a Dona Caramela (7, 6) perto do fogão ---------- */
    sala(COZ.x, COZ.y, [
      // parede: 5-7 livre para a placa
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quimica-avental', x: 4, y: 0 }, { tipo: 'janela', x: 8, y: 0, var: { andar: 2 } },
      { tipo: 'quimica-panelas-parede', x: 10, y: 0 }, { tipo: 'relogio-parede', x: 12, y: 0 },
      cur('Geladeira', 'agua', { tipo: 'quimica-geladeira', x: 1, y: 2 }),
      cur('Potes de mantimentos', 'cozinha', { tipo: 'quimica-potes', x: 2, y: 2 }),
      inter('pia-cozinha', 'Pia da cozinha', { tipo: 'quimica-pia-cozinha', x: 5, y: 2 }),
      { tipo: 'cesto', x: 7, y: 2 }, { tipo: 'caixote', x: 9, y: 2 }, { tipo: 'quimica-banqueta', x: 11, y: 2, var: { cor: '#ff9d3d' } },
      { tipo: 'cesto', x: 12, y: 2, var: { conteudo: 'frutas' } },
      // o fogão com a cozinheira do lado; tapete xadrez na frente
      { tipo: 'quimica-mesa-cozinha', x: 0, y: 4 },
      tela('fogao', 'Fogão dos Estados', 'quimica-estados', { tipo: 'quimica-fogao', x: 4, y: 4 }),
      { tipo: 'tapete', x: 3, y: 5, w: 5, h: 2, var: { cor: '#ffe0c8', borda: '#ff9d3d' } },
      { tipo: 'quimica-banqueta', x: 0, y: 5, var: { cor: S.COR2 } }, { tipo: 'quimica-banqueta', x: 2, y: 5, var: { cor: AMARELO } },
      { tipo: 'armario', x: 10, y: 4 }, { tipo: 'planta-alta', x: 12, y: 4 },
      cur('Fruteira', 'corpo', { tipo: 'quimica-fruteira', x: 9, y: 5 }),
      { tipo: 'tapete-redondo', x: 10, y: 6, var: { cor: '#fff4c8' } }, { tipo: 'luminaria-pe', x: 12, y: 7, var: { andar: 2 } },
      { tipo: 'flores', x: 0, y: 7, var: { vaso: S.COR } },
      // a Mesa de Separar Misturas, com as banquetas na frente
      tela('mesa-separar', 'Mesa de Separar Misturas', 'quimica-separar', { tipo: 'quimica-mesa-separar', x: 2, y: 7 }),
      { tipo: 'tapete-listrado', x: 1, y: 8, w: 5, h: 1, var: { cores: ['#ff9d3d', CREME, S.COR2, CREME] } },
      { tipo: 'cesto', x: 7, y: 8, var: { conteudo: 'frutas' } },
      { tipo: 'vaso-planta', x: 0, y: 10 }, { tipo: 'quimica-banqueta', x: 2, y: 10 }, { tipo: 'quimica-banqueta', x: 4, y: 10, var: { cor: '#5fb4ff' } },
      { tipo: 'tapete', x: 5, y: 10, w: 4, h: 2, var: { cor: '#fff4e8', borda: S.COR } },
      { tipo: 'quimica-lixeira', x: 7, y: 11 },
      { tipo: 'flores', x: 0, y: 12 }, { tipo: 'banco', x: 2, y: 12 }, { tipo: 'pilha-livros', x: 5, y: 12 },
      { tipo: 'caixote', x: 9, y: 11 }, { tipo: 'barril', x: 10, y: 12 }, { tipo: 'vaso-grande', x: 12, y: 12, var: { cor: '#ff9d3d' } },
      { tipo: 'cesto', x: 12, y: 10, var: { conteudo: 'frutas' } },
    ]),
    /* ---------- SALÃO DAS CURIOSIDADES: vitrines de museu, a escada (21, 12) e o Professor Carbono (24, 6) ---------- */
    sala(CUR.x, CUR.y, [
      { tipo: 'janela', x: 1, y: 0 }, cur('Quadro dos fogos', 'cores', { tipo: 'quimica-fogos', x: 2, y: 0 }),
      cur('Mapa do Brasil', 'brasil', { tipo: 'quimica-mapa-brasil', x: 9, y: 0 }), { tipo: 'janela', x: 12, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      cur('Garrafas dos elementos', 'elementos', { tipo: 'quimica-garrafas', x: 3, y: 2 }),
      cur('Geodo de cristais', 'cristais', { tipo: 'quimica-vitrine-museu', x: 8, y: 2, var: { tema: 'geodo', cor: '#b58cff' } }),
      { tipo: 'pilha-livros', x: 10, y: 2 },
      cur('Barra de ouro', 'metais', { tipo: 'quimica-vitrine-museu', x: 11, y: 2, var: { tema: 'ouro', cor: AMARELO } }),
      { tipo: 'vaso-grande', x: 12, y: 2 },
      // o cordão na frente das vitrines da esquerda
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 3, var: { cor: '#ffe6ea', borda: MUSEU } },
      cur('Diamante e grafite', 'elementos', { tipo: 'quimica-vitrine-museu', x: 0, y: 4, var: { tema: 'diamante', cor: '#5fb4ff' } }),
      cur('Vela no pote', 'ar-fogo', { tipo: 'quimica-vitrine-museu', x: 2, y: 5, var: { tema: 'vela', cor: '#ff9d3d' } }),
      { tipo: 'quimica-cordao', x: 1, y: 7 }, { tipo: 'quimica-cordao', x: 3, y: 7 },
      // o cantinho do Professor Carbono, com o leite e a banana
      { tipo: 'tapete-redondo', x: 8, y: 4, var: { cor: '#e9dcff' } },
      cur('Leite e banana', 'corpo', { tipo: 'quimica-vitrine-museu', x: 12, y: 6, var: { tema: 'corpo', cor: S.COR2 } }),
      { tipo: 'flores', x: 11, y: 4 }, { tipo: 'quimica-cordao', x: 10, y: 6 },
      { tipo: 'flores', x: 8, y: 6, var: { vaso: S.COR } },
      // embaixo: bancos para descansar e a escada
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'vaso-planta', x: 3, y: 10 },
      { tipo: 'tapete', x: 0, y: 11, w: 4, h: 2, var: { cor: '#fff6e4', borda: S.COR } },
      { tipo: 'luminaria-pe', x: 4, y: 11 }, { tipo: 'vaso-grande', x: 0, y: 12 }, { tipo: 'pilha-livros', x: 3, y: 12, var: { andar: 2 } },
      { tipo: 'tapete-listrado', x: 5, y: 12, w: 3, h: 1, var: { cores: [MUSEU, CREME, AMARELO, CREME] } },
      { tipo: 'pedestal', x: 8, y: 10 }, { tipo: 'banco', x: 10, y: 10 }, { tipo: 'vaso-planta', x: 12, y: 10 },
      { tipo: 'tapete', x: 8, y: 11, w: 5, h: 2, var: { cor: '#ffe6ea', borda: MUSEU } },
      { tipo: 'flores', x: 9, y: 12 }, { tipo: 'vaso-grande', x: 12, y: 12, var: { cor: '#b58cff' } },
    ]),
    /* ---------- BIBLIOTECA DA QUÍMICA: a estante grande, a mesa de leitura e os retratos ---------- */
    sala(BIB.x, BIB.y, [
      { tipo: 'janela', x: 1, y: 0 },
      cur('Retratos de cientistas', 'cientistas', { tipo: 'quimica-retrato', x: 2, y: 0, var: { desenho: 'balanca' } }),
      { tipo: 'quimica-retrato', x: 3, y: 0, var: { desenho: 'frasco' } }, { tipo: 'quimica-retrato', x: 4, y: 0, var: { desenho: 'tabela' } },
      cur('Ciclo da água', 'agua', { tipo: 'quimica-ciclo-agua', x: 9, y: 0 }), { tipo: 'janela', x: 12, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'cesto', x: 3, y: 2 }, { tipo: 'papeis', x: 4, y: 2 },
      tela('estante-livros', 'Estante dos livros', 'quimica-livros', { tipo: 'quimica-estante-livros', x: 5, y: 2 }),
      { tipo: 'estante', x: 10, y: 3 }, { tipo: 'flores', x: 12, y: 2 },
      // a mesa de leitura no tapete, com cadeiras dos dois lados
      { tipo: 'tapete', x: 3, y: 4, w: 6, h: 3, var: { cor: '#dff4ec', borda: '#3fae8a' } },
      { tipo: 'cadeira', x: 3, y: 5 }, { tipo: 'mesa', x: 4, y: 5, var: { toalha: '#e9dcff', itens: ['livro', 'xicara'] } },
      { tipo: 'cadeira', x: 6, y: 5 }, { tipo: 'luminaria-pe', x: 8, y: 4 },
      { tipo: 'poltrona', x: 0, y: 4 }, { tipo: 'mesa-centro', x: 0, y: 6 }, { tipo: 'globo', x: 12, y: 5 },
      { tipo: 'poltrona', x: 10, y: 6 }, { tipo: 'pilha-livros', x: 11, y: 7 },
      // o cantinho de ler do fundo
      { tipo: 'tapete-redondo', x: 5, y: 8, var: { cor: '#fff4c8' } },
      { tipo: 'quimica-pufe', x: 5, y: 8, var: { cor: S.COR2 } }, { tipo: 'quimica-pufe', x: 7, y: 9, var: { cor: '#6fdc8c' } },
      { tipo: 'relogio-pe', x: 10, y: 9 }, { tipo: 'planta-alta', x: 12, y: 9 },
      { tipo: 'vaso-planta', x: 0, y: 12 }, { tipo: 'banco', x: 1, y: 12 },
      { tipo: 'tapete-listrado', x: 3, y: 11, w: 5, h: 1, var: { cores: ['#3fae8a', CREME, S.COR, CREME] } },
      { tipo: 'sofa', x: 4, y: 12, var: { andar: 2 } }, { tipo: 'pilha-livros', x: 8, y: 12 }, { tipo: 'cesto', x: 9, y: 12 },
      { tipo: 'estante', x: 10, y: 12 }, { tipo: 'vaso-grande', x: 12, y: 12 },
    ])
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
