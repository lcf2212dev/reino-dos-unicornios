/* Museu das Memórias (História), parte 2 de 2: hall + 5 galerias, uma para cada sala.
   Aqui: ajudantes de montagem, o layout e o registro do interior. Os objetos temáticos ficam em
   museu/objetos.js (carregado antes); as falas moram em museu/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.museu) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (0..10 × 0..10; fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
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
  function acaoSala(s) { return { tipo: 'sala', materia: 'historia', sala: s }; }

  /* ================= LAYOUT ================= */
  // colunas: 1 | 13 | 25 ; fileiras: 1 (galerias 3, 4, 5) e 13 (galeria 1, hall, galeria 2)
  var objetos = [].concat(
    /* ---------- HALL ---------- */
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'vitral', x: 1, y: 0 },
      { tipo: 'estandarte', x: 2, y: 0, var: { cor: '#9b6bd6', emblema: 'estrela' } },
      { tipo: 'museu-fotos', x: 3, y: 0 }, { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
      { tipo: 'estandarte', x: 7, y: 0, var: { cor: '#9b6bd6', emblema: 'coracao' } },
      { tipo: 'relogio-parede', x: 8, y: 0 }, { tipo: 'vitral', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      inter('livro', 'Livro das Memórias', { tipo: 'museu-pulpito', x: 2, y: 3, acao: { tipo: 'tela', tela: 'livro', materia: 'historia' } }),
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 1, var: { cor: '#9b6bd6', borda: '#ffd34d' } },
      { tipo: 'museu-legenda', x: 3, y: 2 }, { tipo: 'museu-vela', x: 2, y: 2 },
      { tipo: 'planta-alta', x: 0, y: 5 },
      { tipo: 'flores', x: 7, y: 2 }, { tipo: 'vaso-grande', x: 10, y: 2 },
      { tipo: 'caixote', x: 8, y: 2, var: { item: 'estrela' } }, { tipo: 'globo', x: 9, y: 2 },
      inter('mapa-museu', 'Mapa do museu', { tipo: 'museu-mapa', x: 8, y: 3 }),
      { tipo: 'tapete-listrado', x: 7, y: 4, w: 4, h: 1, var: { cores: ['#c9a8ff', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'banco', x: 8, y: 5 }, { tipo: 'cesto', x: 10, y: 5 },
      inter('bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 0, y: 8 }),
      { tipo: 'museu-cordao', x: 1, y: 9 }, { tipo: 'pedestal', x: 3, y: 9, var: { item: 'pergaminho' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      { tipo: 'balde', x: 0, y: 9 }, { tipo: 'barril', x: 2, y: 10 }, { tipo: 'vaso-planta', x: 10, y: 9 },
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 },
      { tipo: 'vitrine', x: 8, y: 9, var: { itens: ['relogio', 'medalha', 'concha'] } },
      { tipo: 'museu-legenda', x: 7, y: 9, var: { cor: '#e8dcff' } },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 10, y: 10 },
      { tipo: 'museu-vela', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: '#c9a8ff' } },
    ]),
    /* ---------- GALERIA 1: Cartas e Lembranças (papel de carta e rosa) ---------- */
    sala(1, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-mural-cartas', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'h-conchinha' } },
      { tipo: 'museu-fotos', x: 4, y: 0 }, { tipo: 'cortina', x: 5, y: 0, var: { cor: '#ff9cc6' } },
      { tipo: 'museu-mural-cartas', x: 6, y: 0 }, { tipo: 'arandela', x: 7, y: 0 },
      { tipo: 'quadro', x: 8, y: 0, var: { cena: 'mar' } }, { tipo: 'museu-selos', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'escrivaninha', x: 0, y: 2 }, { tipo: 'cadeira', x: 2, y: 2, var: { almofada: '#ff9cc6' } },
      { tipo: 'papeis', x: 0, y: 3 }, { tipo: 'pilha-livros', x: 3, y: 2 },
      inter('caixinha-lembrancas', 'Caixinha de lembranças', { tipo: 'museu-caixinha', x: 5, y: 3 }),
      { tipo: 'museu-cordao', x: 4, y: 4 }, { tipo: 'museu-legenda', x: 6, y: 4 },
      { tipo: 'flores', x: 7, y: 2, var: { vaso: '#ff7eb6', cores: ['#ffffff', '#ff9cc6', '#ffd34d'] } },
      inter('caixa-correio', 'Caixa de correio', { tipo: 'museu-caixa-correio', x: 9, y: 3, var: { cor: '#ff7eb6' } }),
      { tipo: 'vaso-planta', x: 10, y: 2 }, { tipo: 'papeis', x: 8, y: 4 },
      { tipo: 'tapete', x: 1, y: 5, w: 3, h: 2, var: { cor: '#ffc2d8', borda: '#ff7eb6' } },
      { tipo: 'poltrona', x: 0, y: 7, var: { cor: '#ff9cc6' } }, { tipo: 'mesa-centro', x: 1, y: 8 },
      { tipo: 'museu-vela', x: 3, y: 8 },
      { tipo: 'vitrine', x: 0, y: 10, var: { itens: ['pergaminho', 'concha', 'pergaminho'] } },
      { tipo: 'banco', x: 2, y: 10 }, { tipo: 'cesto', x: 4, y: 10 },
      { tipo: 'pedestal', x: 5, y: 8, var: { item: 'concha' } }, { tipo: 'tapete-redondo', x: 5, y: 9, w: 2, h: 2 },
      { tipo: 'museu-legenda', x: 7, y: 10 }, { tipo: 'bau', x: 8, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
      { tipo: 'almofada', x: 9, y: 9, var: { cor: '#ff9cc6' } },
    ]),
    /* ---------- GALERIA 2: Documentos e Postais (azul-correio e amarelo) ---------- */
    sala(25, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-selos', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'h-selinho' } },
      { tipo: 'cartaz', x: 4, y: 0 }, { tipo: 'museu-fotos', x: 5, y: 0, var: { sepia: '#dfe8f5' } },
      { tipo: 'estandarte', x: 6, y: 0, var: { cor: '#2f6fd6', emblema: 'estrela' } },
      { tipo: 'museu-mural-cartas', x: 7, y: 0 }, { tipo: 'relogio-parede', x: 8, y: 0 },
      { tipo: 'museu-selos', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 },
      inter('documentos', 'Vitrine de documentos', { tipo: 'museu-documentos', x: 1, y: 3 }),
      { tipo: 'museu-legenda', x: 3, y: 4, var: { cor: '#fff3c8' } },
      { tipo: 'museu-cordao', x: 1, y: 4, var: { cor: '#2f6fd6' } },
      { tipo: 'pilha-livros', x: 4, y: 2 },
      inter('postais', 'Expositor de postais', { tipo: 'museu-postais', x: 7, y: 3 }),
      { tipo: 'museu-caixa-correio', x: 10, y: 3 },
      { tipo: 'caixote', x: 8, y: 2, var: { item: 'moedas' } }, { tipo: 'flores', x: 5, y: 2 },
      { tipo: 'tapete-listrado', x: 5, y: 4, w: 3, h: 1, var: { cores: ['#2f6fd6', '#ffd34d', '#2f6fd6', '#fff8ee'] } },
      { tipo: 'escrivaninha', x: 9, y: 5 }, { tipo: 'cadeira', x: 8, y: 5, var: { almofada: '#ffd34d' } },
      { tipo: 'papeis', x: 10, y: 6 },
      { tipo: 'tapete', x: 8, y: 7, w: 3, h: 2, var: { cor: '#9fcfff', borda: '#ffd34d' } },
      { tipo: 'globo', x: 10, y: 9 }, { tipo: 'banco', x: 7, y: 10 }, { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'vaso-planta', x: 10, y: 10 },
      { tipo: 'pedestal', x: 4, y: 8, var: { item: 'pergaminho' } },
      { tipo: 'vitrine', x: 0, y: 9, var: { itens: ['pergaminho', 'medalha', 'pergaminho'] } },
      { tipo: 'museu-legenda', x: 2, y: 9 }, { tipo: 'vaso-grande', x: 0, y: 10 },
      { tipo: 'tapete-redondo', x: 5, y: 9, w: 2, h: 2 }, { tipo: 'almofada', x: 3, y: 10, var: { cor: '#ffd34d' } },
      { tipo: 'almofada', x: 6, y: 7, var: { cor: '#9fcfff' } },
    ]),
    /* ---------- GALERIA 3: Museus pelo Brasil (verde e amarelo) ---------- */
    sala(1, 1, [
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'h-fossil' } }, { tipo: 'museu-tico-tico', x: 2, y: 0 },
      { tipo: 'quadro', x: 3, y: 0, var: { cena: 'paisagem' } }, { tipo: 'bandeirinhas', x: 4, y: 0 },
      { tipo: 'janela', x: 6, y: 0 }, { tipo: 'cartaz', x: 7, y: 0 },
      inter('mapa-brasil', 'Mapa do Brasil', { tipo: 'museu-mapa-brasil', x: 8, y: 0 }),
      { tipo: 'planta-alta', x: 0, y: 2 }, { tipo: 'museu-legenda', x: 1, y: 2, var: { cor: '#fff3c8' } },
      { tipo: 'tapete-listrado', x: 2, y: 3, w: 3, h: 1, var: { cores: ['#4caf50', '#ffd34d', '#4caf50', '#fff8ee'] } },
      { tipo: 'pedestal', x: 5, y: 2, var: { item: 'globo' } }, { tipo: 'flores', x: 7, y: 2 },
      { tipo: 'vaso-planta', x: 10, y: 2 },
      inter('miniatura', 'Miniatura de museu', { tipo: 'museu-maquete', x: 7, y: 4 }),
      { tipo: 'museu-cordao', x: 7, y: 5, var: { cor: '#2e8b3e' } }, { tipo: 'museu-legenda', x: 9, y: 4 },
      { tipo: 'globo', x: 0, y: 5 }, { tipo: 'pilha-livros', x: 2, y: 5 },
      { tipo: 'tapete', x: 0, y: 8, w: 3, h: 2, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
      { tipo: 'vitrine', x: 0, y: 10, var: { itens: ['concha', 'gema', 'pergaminho'] } },
      { tipo: 'banco', x: 3, y: 10 }, { tipo: 'vaso-grande', x: 5, y: 10 },
      { tipo: 'museu-maquete', x: 4, y: 8 },
      { tipo: 'cavalete', x: 7, y: 9 }, { tipo: 'mapa-parede', x: 8, y: 9, parede: false, solido: true },
      { tipo: 'papeis', x: 8, y: 10 }, { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } },
      { tipo: 'almofada', x: 10, y: 8, var: { cor: '#6fdc8c' } },
    ]),
    /* ---------- GALERIA 4: Tradições (laranja e terra) ---------- */
    sala(13, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-fitas', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'h-carimbo' } },
      { tipo: 'bandeirinhas', x: 4, y: 0 }, { tipo: 'museu-fitas', x: 6, y: 0 },
      { tipo: 'estandarte', x: 7, y: 0, var: { cor: '#e0433f', emblema: 'coracao' } },
      { tipo: 'museu-fotos', x: 8, y: 0 }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('tambor', 'Tambores', { tipo: 'museu-tambor', x: 0, y: 3 }),
      { tipo: 'museu-legenda', x: 2, y: 3 }, { tipo: 'vaso-grande', x: 0, y: 2 },
      { tipo: 'museu-almofada-roda', x: 3, y: 2 },
      { tipo: 'museu-saia', x: 7, y: 2 },
      inter('panela-barro', 'Panelas de barro', { tipo: 'museu-panelas', x: 8, y: 3 }),
      { tipo: 'cesto', x: 10, y: 2 }, { tipo: 'flores', x: 8, y: 2, var: { vaso: '#b95a36' } }, { tipo: 'museu-vela', x: 9, y: 2 },
      { tipo: 'museu-cordao', x: 8, y: 4, var: { cor: '#ff8a3d' } }, { tipo: 'barril', x: 10, y: 6 },
      { tipo: 'museu-vela', x: 0, y: 5 },
      { tipo: 'tapete', x: 0, y: 9, w: 3, h: 2, var: { cor: '#ffb070', borda: '#e0433f' } },
      { tipo: 'vitrine', x: 0, y: 8, var: { itens: ['vela', 'concha', 'ursinho'] } },
      { tipo: 'banco', x: 1, y: 10 }, { tipo: 'museu-legenda', x: 3, y: 10 },
      { tipo: 'museu-saia', x: 7, y: 10 }, { tipo: 'museu-panelas', x: 8, y: 10 },
      { tipo: 'tapete-listrado', x: 8, y: 9, w: 3, h: 1, var: { cores: ['#ff8a3d', '#ffd34d', '#e0433f', '#fff8ee'] } },
      { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'almofada', x: 0, y: 7, var: { cor: '#ffd34d' } },
    ]),
    /* ---------- GALERIA 5: Material ou Imaterial? (lilás de brinquedo) ---------- */
    sala(25, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'museu-fitas', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'h-grio' } },
      { tipo: 'museu-tico-tico', x: 4, y: 0 }, { tipo: 'cortina', x: 5, y: 0, var: { cor: '#b58cff' } },
      { tipo: 'prateleira-parede', x: 6, y: 0 }, { tipo: 'vitral', x: 8, y: 0 },
      { tipo: 'museu-fotos', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('brinquedos', 'Brinquedos antigos', { tipo: 'museu-brinquedos', x: 1, y: 3 }),
      { tipo: 'museu-cordao', x: 1, y: 4, var: { cor: '#9b6bd6' } }, { tipo: 'museu-legenda', x: 3, y: 4 },
      { tipo: 'tapete-redondo', x: 5, y: 7, w: 2, h: 2 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 4, y: 2 },
      inter('caderno-quadrinhas', 'Caderno de quadrinhas', { tipo: 'museu-quadrinhas', x: 7, y: 3 }),
      { tipo: 'tapete-redondo', x: 6, y: 4, w: 2, h: 1 },
      { tipo: 'cavalete', x: 9, y: 3 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: '#b58cff' } },
      { tipo: 'cesto', x: 10, y: 5 },
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#e8dcff', itens: ['xicara', 'ursinho'] } },
      { tipo: 'cadeira', x: 10, y: 9, var: { almofada: '#b58cff' } },
      { tipo: 'tapete', x: 8, y: 7, w: 3, h: 2, var: { cor: '#c9a8ff', borda: '#ff9cc6' } },
      { tipo: 'bau', x: 10, y: 10 }, { tipo: 'museu-legenda', x: 6, y: 10 },
      { tipo: 'vitrine', x: 0, y: 9, var: { itens: ['ursinho', 'estrela', 'coroa'] } },
      { tipo: 'pedestal', x: 2, y: 9, var: { item: 'ursinho' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'almofada', x: 3, y: 10, var: { cor: '#ff9cc6' } },
      { tipo: 'museu-vela', x: 5, y: 10 }, { tipo: 'papeis', x: 4, y: 9 },
    ])
  );

  Reino.registrarInterior({
    id: 'museu',
    lugar: 'materia:historia',
    nome: 'Museu das Memórias',
    entrada: true,
    pacote: 'interior-museu',
    tamanho: { w: 37, h: 25 },
    saida: { x: 18, y: 23 },
    spawn: { x: 18, y: 22 },
    comodos: [
      { id: 'hall', nome: 'Hall', placa: 'Hall • Museu das Memórias', rect: { x: 13, y: 13, w: 11, h: 11 },
        piso: 'mosaico', parede: 'papel', paleta: { piso: '#f6eefc', piso2: '#c9a8ff', detalhe: '#ffd34d', parede: '#efe2fb', parede2: '#dcc6f4', rodape: '#8a604a' } },
      { id: 'galeria1', nome: 'Cartas e Lembranças', placa: 'Sala 1 • Cartas e Lembranças', rect: { x: 1, y: 13, w: 11, h: 11 },
        piso: 'taco', parede: 'papel', paleta: { piso: '#f2c9a8', piso2: '#dca88a', parede: '#fff1e0', parede2: '#ffd6e4' } },
      { id: 'galeria2', nome: 'Documentos e Postais', placa: 'Sala 2 • Documentos e Postais', rect: { x: 25, y: 13, w: 11, h: 11 },
        piso: 'azulejo', parede: 'azulejo', paleta: { piso: '#eef4ff', piso2: '#bcd0f2', detalhe: '#2f6fd6', parede: '#fff6d8', parede2: '#9fbef0', rodape: '#2f4f8a' } },
      { id: 'galeria3', nome: 'Museus pelo Brasil', placa: 'Sala 3 • Museus pelo Brasil', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'pedra', parede: 'pedra', paleta: { piso: '#e8efd0', piso2: '#b8c98a', parede: '#eef6d8', parede2: '#ffe28a', rodape: '#2e8b3e' } },
      { id: 'galeria4', nome: 'Tradições', placa: 'Sala 4 • Tradições', rect: { x: 13, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'tijolo', paleta: { piso: '#e0a870', piso2: '#b97a48' } },
      { id: 'galeria5', nome: 'Material ou Imaterial?', placa: 'Sala 5 • Material ou Imaterial?', rect: { x: 25, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#d8c4ff', piso2: '#c4a8f4', parede: '#f3eaff', parede2: '#e0d0ff', rodape: '#7c5cff' } },
    ],
    portas: [
      { x: 12, y: 19, w: 1, h: 2 },   // galeria 1 ↔ hall
      { x: 24, y: 19, w: 1, h: 2 },   // hall ↔ galeria 2
      { x: 18, y: 12, w: 1, h: 3 },   // hall ↔ galeria 4 (atravessa a parede do fundo do hall)
      { x: 12, y: 7, w: 1, h: 2 },    // galeria 3 ↔ galeria 4
      { x: 24, y: 7, w: 1, h: 2 },    // galeria 4 ↔ galeria 5
    ],
    corredores: [
      { x: 17, y: 15, w: 3, h: 9 }, { x: 13, y: 19, w: 11, h: 2 },   // hall
      { x: 8, y: 19, w: 4, h: 2 }, { x: 25, y: 19, w: 4, h: 2 },     // entradas das galerias 1 e 2
      { x: 17, y: 3, w: 3, h: 9 }, { x: 13, y: 7, w: 11, h: 2 },     // galeria 4
      { x: 8, y: 7, w: 4, h: 2 }, { x: 25, y: 7, w: 4, h: 2 },       // entradas das galerias 3 e 5
    ],
    objetos: objetos,
    npcs: [
      npc('memoria', 20, 21, { tipo: 'guia', lugar: 'materia:historia', livro: 'historia' }),
      npc('antonio', 5, 18, acaoSala('h1')),
      npc('chico', 30, 18, acaoSala('h2')),
      npc('taina', 5, 6, acaoSala('h3')),
      npc('contadeira', 16, 5, acaoSala('h4')),
      npc('nina', 30, 6, acaoSala('h5')),
    // + os registrados com predio: 'museu' e x/y (Reino.personagensDoPredio; prédio antigo não tem vagas: sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('museu').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || { tipo: 'guia', lugar: 'materia:historia', livro: 'historia' });
    })),
  });
})();
