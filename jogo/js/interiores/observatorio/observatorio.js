/* Observatório por dentro, parte 6 de 6: um interior noturno com 3 cômodos lado a lado —
   Galeria do Espaço (esquerda) | Cúpula do Telescópio (entrada, no meio) | Planetário (direita).
   Aqui: o layout (cômodos, objetos, planetas em órbita, NPCs) e o registro do interior.
   As outras partes (carregadas antes): observatorio/ceu.js (cores, piso, parede, planetas),
   observatorio/objetos-*.js (objetos temáticos, prefixo observatorio-) e observatorio/acoes.js
   (curiosidades, piadas e o telescópio). Só curiosidades: nada de estrelas, dinheiro ou save.
   No carregamento NADA de DOM, canvas ou PA (as ferramentas em Node carregam este arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = R.Desenho.K;
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var AZUL_CLARO = S.AZUL_CLARO, falas = S.falas, GALAXIA = S.GALAXIA, GAL = S.GAL, CUP = S.CUP, PLA = S.PLA;

  /* ================= LAYOUT ================= */
  // 3 cômodos lado a lado (13 + 13 + 15 tiles), paredes nas fileiras 1-2, chão de 3 a 13.
  // Portas entre eles nas fileiras 9-10; saída embaixo da Cúpula.
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  // objeto de curiosidade (a chave é a mesma do observatorio/falas.js)
  // nome no balão: o do observatorio/falas.js (F.nomes), senão o daqui
  function nomeDe(chave, padrao) { var n = falas().nomes; return (n && n[chave]) || padrao; }
  function cur(chave, nome, tema, o) {
    return Object.assign(o, { chave: chave, nome: nomeDe(chave, nome), acao: { tipo: 'curiosidade', tema: tema } });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {}, F = falas();
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: (F.npcs && F.npcs[id]) || {} };
  }

  // Planetário: o Sol no meio (tiles 6-7 × 6-7 do cômodo) e os planetas em órbitas achatadas
  var SOL_LOCAL = { x: 6, y: 6 };
  var PLANETAS = [
    { id: 'mercurio', nome: 'Mercúrio', x: 8, y: 7, fase: 0.5 },
    { id: 'venus', nome: 'Vênus', x: 6, y: 5, fase: 2.1 },
    { id: 'terra', nome: 'Terra', x: 3, y: 7, fase: 4.0 },
    { id: 'marte', nome: 'Marte', x: 10, y: 5, fase: 1.2 },
    { id: 'jupiter', nome: 'Júpiter', x: 4, y: 9, fase: 3.3 },
    { id: 'saturno', nome: 'Saturno', x: 12, y: 8, fase: 5.0 },
    { id: 'urano', nome: 'Urano', x: 9, y: 10, fase: 0.9 },
    { id: 'netuno', nome: 'Netuno', x: 3, y: 3, fase: 2.7 },
    { id: 'plutao', nome: 'Plutão, planeta-anão', x: 13, y: 10, fase: 4.4 },
  ];
  var ACHATAR = 0.55;
  var solPx = { x: (PLA.x + SOL_LOCAL.x + 1) * T, y: (PLA.y + SOL_LOCAL.y + 1) * T };
  var aneis = PLANETAS.map(function (p) {
    var dx = (PLA.x + p.x) * T + 8 - solPx.x, dy = (PLA.y + p.y) * T + 8 - solPx.y;
    var rx = Math.round(Math.sqrt(dx * dx + (dy / ACHATAR) * (dy / ACHATAR)));
    return { rx: rx, ry: Math.round(rx * ACHATAR), cor: p.id === 'plutao' ? '#9a86c8' : GALAXIA.orbita, tracejado: p.id === 'plutao' };
  });
  var orbitas = { tipo: 'observatorio-orbitas', x: PLA.x + 1, y: PLA.y + 3, w: 13, h: 9,
    var: { sx: solPx.x, sy: solPx.y, aneis: aneis, disco: { rx: 118, ry: 68 },
      clip: { x: PLA.x * T, y: (PLA.y + 2) * T, w: 15 * T, h: 11 * T } } };

  var objetos = [].concat(
    /* ---------- CÚPULA DO TELESCÓPIO (entrada) ---------- */
    sala(CUP.x, CUP.y, [
      // parede: quadros e cartas nas pontas; no meio (atrás da placa do cômodo) só enfeites baixos
      { tipo: 'observatorio-janela', x: 0, y: 0 }, { tipo: 'observatorio-carta', x: 1, y: 0, var: { desenho: 'cruzeiro' } },
      { tipo: 'observatorio-quadro', x: 2, y: 0, var: { cena: 'lua' } },
      { tipo: 'arandela', x: 4, y: 0 },
      { tipo: 'prateleira-parede', x: 5, y: 0, w: 3, var: { itens: ['livro', 'globo', 'estrela'] } },
      { tipo: 'arandela', x: 8, y: 0 },
      { tipo: 'observatorio-fenda', x: 9, y: 0 },
      // o telescópio embaixo da fenda (à direita: a placa do cômodo fica no meio da parede)
      cur('telescopio', 'Telescópio', 'telescopio', { tipo: 'observatorio-telescopio', x: 9, y: 2 }),
      { tipo: 'escrivaninha', x: 0, y: 2, var: { cor: '#5a4a8a', abajur: '#ffd34d' } }, { tipo: 'papeis', x: 0, y: 3 },
      { tipo: 'cadeira', x: 1, y: 3, var: { almofada: '#7c5cff' } }, { tipo: 'pilha-livros', x: 2, y: 2 },
      { tipo: 'observatorio-painel', x: 3, y: 2 }, { tipo: 'cadeira', x: 4, y: 3, var: { almofada: '#5fb4ff' } },
      { tipo: 'observatorio-luneta', x: 5, y: 2 },
      { tipo: 'estante', x: 6, y: 2, var: { cor: '#5a4a8a' } }, { tipo: 'observatorio-globo', x: 12, y: 2 },
      { tipo: 'caixote', x: 12, y: 3, var: { item: 'estrela' } },
      { tipo: 'tapete-redondo', x: 9, y: 4, w: 2, h: 2, var: { cores: ['#3a3f8a', '#ffd34d', '#5a6ad0'] } },
      { tipo: 'vaso-planta', x: 0, y: 5 }, { tipo: 'observatorio-placa', x: 2, y: 5 },
      { tipo: 'tapete', x: 0, y: 6, w: 3, h: 1, var: { cor: '#3a3f8a', borda: '#ffd34d' } },
      { tipo: 'almofada', x: 4, y: 6, var: { cor: '#7c5cff' } },
      { tipo: 'poltrona', x: 11, y: 5, var: { cor: '#b58cff' } }, { tipo: 'mesa-centro', x: 11, y: 6 },
      // luminárias em tile próprio, nunca em cima de vaso ou cesto
      { tipo: 'observatorio-luminaria', x: 12, y: 5 }, { tipo: 'cesto', x: 12, y: 7 }, { tipo: 'pilha-livros', x: 9, y: 7 },
      { tipo: 'globo', x: 4, y: 4 },
      { tipo: 'sofa', x: 0, y: 12, var: { cor: AZUL_CLARO, almofada: '#ffd34d' } }, { tipo: 'planta-alta', x: 0, y: 10 },
      { tipo: 'observatorio-luminaria', x: 5, y: 12 }, { tipo: 'cesto', x: 2, y: 12 },
      { tipo: 'tapete', x: 1, y: 10, w: 3, h: 1, var: { cor: '#2d3580', borda: '#b58cff' } },
      { tipo: 'observatorio-luneta', x: 12, y: 10 }, { tipo: 'poltrona', x: 10, y: 11, var: { cor: '#7c5cff' } },
      { tipo: 'caixote', x: 12, y: 12, var: { item: 'estrela' } }, { tipo: 'vaso-grande', x: 8, y: 12, var: { cor: AZUL_CLARO } },
      { tipo: 'tapete', x: 9, y: 10, w: 2, h: 1, var: { cor: '#3a3f8a', borda: '#7fe0ff' } }, { tipo: 'almofada', x: 11, y: 11, var: { cor: '#ffd34d' } },
      { tipo: 'vaso-planta', x: 4, y: 12 },
    ]),
    /* ---------- GALERIA DO ESPAÇO ---------- */
    sala(GAL.x, GAL.y, [
      // parede: o mapa das constelações, a prateleira baixa (atrás da placa do cômodo) e os quadros à direita.
      // O mapa fica 2 tiles para dentro: no canto ele sumia sob as fichas da esquerda do HUD (R$, ⭐, 🥚),
      // e 3 para dentro ele ficava atrás da placa do cômodo
      { tipo: 'arandela', x: 1, y: 0 },
      cur('mapa-constelacoes', 'Mapa das constelações', 'constelacoes', { tipo: 'observatorio-mapa-constelacoes', x: 2, y: 0 }),
      { tipo: 'prateleira-parede', x: 6, y: 0, w: 3, var: { itens: ['globo', 'estrela', 'livro', 'gema'] } },
      { tipo: 'arandela', x: 9, y: 0 },
      { tipo: 'observatorio-quadro', x: 10, y: 0, var: { cena: 'astronauta' } }, { tipo: 'observatorio-carta', x: 11, y: 0, var: { desenho: 'ursa' } },
      { tipo: 'observatorio-janela', x: 12, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      { tipo: 'observatorio-placa', x: 6, y: 2 }, { tipo: 'estante', x: 7, y: 2, var: { cor: '#5a4a8a' } },
      { tipo: 'planta-alta', x: 12, y: 2 },
      // foguete (bem alto) com cordão na frente
      cur('foguete', 'Foguete', 'foguetes', { tipo: 'observatorio-foguete', x: 9, y: 4 }),
      { tipo: 'observatorio-cordao', x: 9, y: 5 }, { tipo: 'observatorio-placa', x: 11, y: 5 },
      // traje de astronauta
      cur('traje', 'Traje de astronauta', 'astronautas', { tipo: 'observatorio-traje', x: 2, y: 4 }),
      { tipo: 'observatorio-placa', x: 3, y: 4, var: { cor: '#3a3f8a' } },
      { tipo: 'tapete-listrado', x: 5, y: 4, w: 3, h: 1, var: { cores: ['#3a3f8a', '#ffd34d', '#5a6ad0', '#ffd34d'] } }, { tipo: 'tapete-redondo', x: 1, y: 5, w: 2, h: 1, var: { cores: ['#3a3f8a', '#ffd34d'] } },
      { tipo: 'vitrine', x: 4, y: 6, var: { itens: ['estrela', 'gema', 'globo'], cor: '#5a4a8a' } },
      // pedra da Lua e meteorito
      cur('pedra-lua', 'Pedra da Lua', 'lua', { tipo: 'observatorio-pedra-lua', x: 2, y: 8 }),
      { tipo: 'observatorio-cordao', x: 0, y: 9 },
      cur('meteorito', 'Meteorito', 'cometas', { tipo: 'observatorio-meteorito', x: 7, y: 7 }),
      { tipo: 'observatorio-placa', x: 8, y: 7 },
      { tipo: 'banco', x: 5, y: 11, var: { cor: AZUL_CLARO } }, { tipo: 'pedestal', x: 10, y: 8, var: { item: 'globo' } },
      { tipo: 'tapete', x: 9, y: 10, w: 3, h: 1, var: { cor: '#3a3f8a', borda: '#7fe0ff' } },
      { tipo: 'observatorio-luminaria', x: 11, y: 12 }, { tipo: 'vaso-grande', x: 12, y: 12, var: { cor: AZUL_CLARO } },
      { tipo: 'caixote', x: 0, y: 12, var: { item: 'estrela' } }, { tipo: 'cesto', x: 1, y: 12 },
      { tipo: 'almofada', x: 3, y: 11, var: { cor: '#b58cff' } }, { tipo: 'globo', x: 0, y: 6 },
      { tipo: 'vaso-planta', x: 8, y: 12 }, { tipo: 'pedestal', x: 4, y: 2, var: { item: 'gema' } },
    ]),
    /* ---------- PLANETÁRIO ---------- */
    [orbitas],
    sala(PLA.x, PLA.y, [
      { tipo: 'observatorio-janela', x: 0, y: 0 }, { tipo: 'observatorio-ceu', x: 1, y: 0 },
      { tipo: 'observatorio-quadro', x: 3, y: 0, var: { cena: 'cometa' } }, { tipo: 'observatorio-ceu', x: 4, y: 0 },
      // no meio (atrás da placa do cômodo) só duas arandelas baixas, dos lados do projetor
      { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'arandela', x: 8, y: 0 },
      { tipo: 'observatorio-ceu', x: 9, y: 0 }, { tipo: 'observatorio-carta', x: 11, y: 0, var: { desenho: 'cruzeiro' } },
      { tipo: 'observatorio-quadro', x: 12, y: 0, var: { cena: 'galaxia' } }, { tipo: 'relogio-parede', x: 13, y: 0, var: { cor: '#5a6ad0' } },
      { tipo: 'observatorio-janela', x: 14, y: 0 },
      cur('sol', 'Sol', 'sol', { tipo: 'observatorio-sol', x: SOL_LOCAL.x, y: SOL_LOCAL.y }),
      // plateia em volta (encostada nas paredes)
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'banco', x: 1, y: 2, var: { cor: AZUL_CLARO } },
      { tipo: 'observatorio-projetor', x: 7, y: 2 }, { tipo: 'banco', x: 9, y: 2, var: { cor: AZUL_CLARO } },
      { tipo: 'estante', x: 12, y: 2, var: { cor: '#5a4a8a' } }, { tipo: 'planta-alta', x: 14, y: 2 },
      { tipo: 'poltrona', x: 14, y: 4, var: { cor: '#7c5cff' } }, { tipo: 'observatorio-luminaria', x: 14, y: 6 },
      { tipo: 'poltrona', x: 0, y: 4, var: { cor: '#7c5cff' } }, { tipo: 'cesto', x: 0, y: 6 },
      { tipo: 'globo', x: 0, y: 11 }, { tipo: 'banco', x: 2, y: 12, var: { cor: AZUL_CLARO } },
      { tipo: 'almofada', x: 5, y: 12, var: { cor: '#b58cff' } }, { tipo: 'banco', x: 6, y: 12, var: { cor: AZUL_CLARO } },
      { tipo: 'almofada', x: 8, y: 12, var: { cor: '#ffd34d' } }, { tipo: 'banco', x: 10, y: 12, var: { cor: AZUL_CLARO } },
      { tipo: 'vaso-grande', x: 14, y: 12, var: { cor: AZUL_CLARO } }, { tipo: 'caixote', x: 14, y: 11, var: { item: 'estrela' } },
      { tipo: 'pilha-livros', x: 11, y: 2 },
    ]),
    sala(PLA.x, PLA.y, PLANETAS.map(function (p) {
      return { tipo: 'observatorio-planeta', x: p.x, y: p.y, chave: p.id, nome: nomeDe(p.id, p.nome), var: { id: p.id, fase: p.fase },
        acao: { tipo: 'curiosidade', tema: p.id } };
    }))
  );

  R.registrarInterior({
    id: 'observatorio',
    lugar: 'observatorio',
    nome: 'Observatório',
    entrada: true,
    pacote: 'interior-observatorio',
    tamanho: { w: 45, h: 15 },
    saida: { x: CUP.x + 6, y: 13 },
    spawn: { x: CUP.x + 6, y: 12 },
    comodos: [
      { id: 'cupula', nome: 'Cúpula do Telescópio', placa: 'Cúpula do Telescópio', rect: { x: CUP.x, y: CUP.y, w: 13, h: 13 },
        piso: 'observatorio-metal', parede: 'observatorio-noite' },
      { id: 'galeria', nome: 'Galeria do Espaço', placa: 'Galeria do Espaço', rect: { x: GAL.x, y: GAL.y, w: 13, h: 13 },
        piso: 'observatorio-ladrilho', parede: 'observatorio-noite',
        paleta: { parede: '#2e2a70', parede2: '#221f5a', rodape: '#7a5ac8' } },
      { id: 'planetario', nome: 'Planetário', placa: 'Planetário', rect: { x: PLA.x, y: PLA.y, w: 15, h: 13 },
        piso: 'observatorio-estrelado', parede: 'observatorio-noite',
        paleta: { parede: '#1f2160', parede2: '#181a4e', rodape: '#4a3a8a' } },
    ],
    portas: [
      { x: GAL.x + 13, y: 9, w: 1, h: 2 },   // galeria ↔ cúpula
      { x: CUP.x + 13, y: 9, w: 1, h: 2 },   // cúpula ↔ planetário
    ],
    corredores: [
      { x: CUP.x + 5, y: 6, w: 3, h: 7 },     // da saída até o telescópio
      { x: CUP.x, y: 9, w: 13, h: 2 },        // porta a porta, na cúpula
      { x: GAL.x + 9, y: 9, w: 4, h: 2 },     // entrada da galeria
    ],
    objetos: objetos,
    npcs: [
      npc('vega', CUP.x + 8, CUP.y + 4, { tipo: 'curiosidade', tema: 'todas' }),
      npc('cosmo', GAL.x + 6, GAL.y + 9, { tipo: 'piada' }),
    ],
  });

  // para as outras partes (R._predios.observatorio): as estrelas da parede (objetos-parede.js) leem a lista
  S.objetos = objetos;
})();
