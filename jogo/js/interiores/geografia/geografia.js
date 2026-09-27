/* Estação dos Caminhos (Geografia): hall + 5 salas, uma para cada sala da matéria.
   Aqui: ajudantes de montagem, o layout e o registro do interior. Os objetos temáticos ficam em
   geografia/objetos.js e os personagens e as falas em geografia/falas.js (carregados antes). */
(function () {
  var R = window.Reino;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.geografia) || { npcs: {}, objetos: {} };
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
  function acaoSala(s) { return { tipo: 'sala', materia: 'geografia', sala: s }; }

  /* ================= LAYOUT ================= */
  // colunas: 1 | 13 | 25 ; fileiras: 1 (salas 3, 4, 5) e 13 (sala 1, hall, sala 2)
  var objetos = [].concat(
    /* ---------- HALL: a estação (azul e verde) ---------- */
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'mapa-parede', x: 1, y: 0 },
      { tipo: 'estandarte', x: 3, y: 0, var: { cor: '#2f8fd6', emblema: 'estrela' } },
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 7, y: 0 },
      inter('linha-tempo', 'Linha do tempo', { tipo: 'geografia-linha-tempo', x: 5, y: 0 }),
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      inter('livro', 'Livro dos Caminhos', { tipo: 'pedestal', x: 2, y: 3, var: { item: 'globo' }, acao: { tipo: 'tela', tela: 'livro', materia: 'geografia' } }),
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 1, var: { cor: '#9fcfff', borda: '#39a860' } },
      { tipo: 'globo', x: 3, y: 2 }, { tipo: 'vaso-planta', x: 2, y: 2 },
      { tipo: 'planta-alta', x: 0, y: 5 },
      { tipo: 'flores', x: 7, y: 2 }, { tipo: 'vaso-grande', x: 10, y: 2 },
      { tipo: 'caixote', x: 8, y: 2, var: { item: 'estrela' } }, { tipo: 'geografia-correio', x: 9, y: 3 }, { tipo: 'luminaria-pe', x: 9, y: 2 },
      { tipo: 'tapete-listrado', x: 7, y: 4, w: 4, h: 1, var: { cores: ['#2f8fd6', '#fff8ee', '#39a860', '#fff8ee'] } },
      { tipo: 'banco', x: 8, y: 5 }, { tipo: 'cesto', x: 10, y: 5 },
      inter('bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 0, y: 8 }),
      { tipo: 'geografia-placa', x: 1, y: 9, var: { tipo: 'E' } }, { tipo: 'pedestal', x: 3, y: 9, var: { item: 'pergaminho' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      { tipo: 'balde', x: 0, y: 9 }, { tipo: 'barril', x: 2, y: 10 }, { tipo: 'vaso-planta', x: 10, y: 9 },
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 },
      { tipo: 'vitrine', x: 8, y: 9, var: { itens: ['relogio', 'medalha', 'concha'] } },
      { tipo: 'flores', x: 7, y: 9 },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 10, y: 10 },
      { tipo: 'papeis', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: '#9fcfff' } },
    ]),
    /* ---------- SALA 1: Formas de se Comunicar (laranja e creme) ---------- */
    sala(1, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'geografia-libras', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'g-recadinho' } },
      { tipo: 'lousa', x: 4, y: 0 }, { tipo: 'cortina', x: 6, y: 0, var: { cor: '#ffb070' } },
      inter('libras', 'Cartaz de Libras', { tipo: 'geografia-libras', x: 7, y: 0 }), { tipo: 'cartaz', x: 8, y: 0, var: { desenho: 'abc' } },
      { tipo: 'quadro', x: 9, y: 0, var: { cena: 'paisagem' } }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'escrivaninha', x: 0, y: 2 }, { tipo: 'cadeira', x: 2, y: 2, var: { almofada: '#ffb070' } },
      { tipo: 'papeis', x: 0, y: 3 }, { tipo: 'pilha-livros', x: 3, y: 2 },
      { tipo: 'cavalete', x: 5, y: 3 },
      { tipo: 'flores', x: 6, y: 2, var: { vaso: '#ff8a3d', cores: ['#ffffff', '#ffd34d', '#ff9cc6'] } },
      { tipo: 'geografia-correio', x: 9, y: 3 },
      { tipo: 'vaso-planta', x: 10, y: 2 }, { tipo: 'papeis', x: 8, y: 4 },
      { tipo: 'tapete', x: 1, y: 5, w: 3, h: 2, var: { cor: '#ffd9b0', borda: '#ff8a3d' } },
      { tipo: 'poltrona', x: 0, y: 7, var: { cor: '#ffb070' } }, { tipo: 'mesa-centro', x: 1, y: 8 },
      { tipo: 'almofada', x: 3, y: 8, var: { cor: '#ffd34d' } },
      { tipo: 'estante', x: 0, y: 10 },
      { tipo: 'banco', x: 2, y: 10 }, { tipo: 'cesto', x: 4, y: 10 },
      { tipo: 'pedestal', x: 5, y: 8, var: { item: 'pergaminho' } }, { tipo: 'tapete-redondo', x: 5, y: 9, w: 2, h: 2 },
      { tipo: 'placa-chao', x: 7, y: 10, var: { icone: 'coracao' } }, { tipo: 'bau', x: 8, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
      { tipo: 'almofada', x: 9, y: 9, var: { cor: '#ff9cc6' } },
    ]),
    /* ---------- SALA 2: Meios de Comunicação (vermelho de rádio e amarelo) ---------- */
    sala(25, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cartaz', x: 1, y: 0, var: { desenho: 'estrela' } },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'g-radinho' } },
      { tipo: 'prateleira-parede', x: 4, y: 0 }, { tipo: 'geografia-linha-tempo', x: 5, y: 0 },
      { tipo: 'estandarte', x: 7, y: 0, var: { cor: '#e0433f', emblema: 'estrela' } },
      { tipo: 'relogio-parede', x: 8, y: 0 }, { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 0, y: 2 },
      inter('radio', 'Rádio', { tipo: 'geografia-radio', x: 1, y: 3 }),
      { tipo: 'geografia-tv', x: 3, y: 3 },
      { tipo: 'pilha-livros', x: 4, y: 2 },
      inter('correio', 'Caixa de correio', { tipo: 'geografia-correio', x: 7, y: 3 }),
      { tipo: 'geografia-placa', x: 10, y: 3, var: { tipo: '80' } },
      { tipo: 'caixote', x: 8, y: 2, var: { item: 'moedas' } }, { tipo: 'flores', x: 5, y: 2 },
      { tipo: 'tapete-listrado', x: 5, y: 4, w: 3, h: 1, var: { cores: ['#e0433f', '#ffd34d', '#e0433f', '#fff8ee'] } },
      { tipo: 'escrivaninha', x: 9, y: 5 }, { tipo: 'cadeira', x: 8, y: 5, var: { almofada: '#ffd34d' } },
      { tipo: 'papeis', x: 10, y: 6 },
      { tipo: 'tapete', x: 8, y: 7, w: 3, h: 2, var: { cor: '#ffe28a', borda: '#e0433f' } },
      { tipo: 'globo', x: 10, y: 9 }, { tipo: 'banco', x: 7, y: 10 }, { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'vaso-planta', x: 10, y: 10 },
      { tipo: 'geografia-computador', x: 4, y: 8 },
      { tipo: 'estante', x: 0, y: 9 },
      { tipo: 'geografia-radio', x: 2, y: 9 }, { tipo: 'vaso-grande', x: 0, y: 10 },
      { tipo: 'tapete-redondo', x: 5, y: 9, w: 2, h: 2 }, { tipo: 'almofada', x: 3, y: 10, var: { cor: '#ffd34d' } },
      { tipo: 'almofada', x: 6, y: 7, var: { cor: '#ff9a9a' } },
    ]),
    /* ---------- SALA 3: Telefone e Internet Segura (turquesa e lilás) ---------- */
    sala(1, 1, [
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'g-conexao' } }, { tipo: 'cartaz', x: 2, y: 0, var: { desenho: 'coracao' } },
      { tipo: 'quadro', x: 3, y: 0, var: { cena: 'mar' } }, { tipo: 'bandeirinhas', x: 4, y: 0 },
      { tipo: 'janela', x: 6, y: 0 }, { tipo: 'geografia-linha-tempo', x: 7, y: 0 },
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'planta-alta', x: 0, y: 2 },
      inter('telefone', 'Telefone antigo', { tipo: 'geografia-telefone', x: 1, y: 2 }),
      { tipo: 'tapete-listrado', x: 2, y: 3, w: 3, h: 1, var: { cores: ['#39c5bb', '#fff8ee', '#b58cff', '#fff8ee'] } },
      { tipo: 'geografia-copos', x: 5, y: 2 }, { tipo: 'flores', x: 7, y: 2 },
      { tipo: 'vaso-planta', x: 10, y: 2 },
      inter('computador', 'Computador', { tipo: 'geografia-computador', x: 7, y: 4 }),
      { tipo: 'cadeira', x: 8, y: 4, var: { almofada: '#b58cff' } }, { tipo: 'geografia-telefone', x: 9, y: 4 },
      { tipo: 'globo', x: 0, y: 5 }, { tipo: 'pilha-livros', x: 2, y: 5 },
      { tipo: 'tapete', x: 0, y: 8, w: 3, h: 2, var: { cor: '#a8ece6', borda: '#b58cff' } },
      { tipo: 'estante', x: 0, y: 10 },
      { tipo: 'banco', x: 3, y: 10 }, { tipo: 'vaso-grande', x: 5, y: 10 },
      { tipo: 'geografia-copos', x: 3, y: 8 },
      { tipo: 'luminaria-pe', x: 7, y: 9 }, { tipo: 'geografia-computador', x: 8, y: 9 },
      { tipo: 'papeis', x: 9, y: 10 }, { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } },
      { tipo: 'almofada', x: 10, y: 8, var: { cor: '#b58cff' } },
    ]),
    /* ---------- SALA 4: Trânsito Seguro (asfalto, amarelo e verde) ---------- */
    sala(13, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cartaz', x: 1, y: 0, var: { desenho: 'numeros' } },
      { tipo: 'quadro-unicornio', x: 2, y: 0, var: { uni: 'g-faixinha' } },
      { tipo: 'bandeirinhas', x: 4, y: 0 }, { tipo: 'lousa', x: 6, y: 0 },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ffd34d', emblema: 'estrela' } },
      { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('semaforo', 'Semáforo', { tipo: 'geografia-semaforo', x: 0, y: 3 }),
      { tipo: 'geografia-semaforo', x: 3, y: 3, var: { pedestre: true } },
      inter('faixa', 'Faixa de pedestres', { tipo: 'geografia-faixa', x: 0, y: 4, w: 3, h: 1 }),
      { tipo: 'vaso-grande', x: 0, y: 2 }, { tipo: 'geografia-placa', x: 2, y: 2, var: { tipo: 'E-cortado' } },
      { tipo: 'geografia-placa', x: 7, y: 2, var: { tipo: 'seta' } },
      { tipo: 'geografia-carro', x: 8, y: 3 },
      { tipo: 'cesto', x: 10, y: 2 }, { tipo: 'flores', x: 8, y: 2, var: { vaso: '#39a860' } }, { tipo: 'geografia-placa', x: 9, y: 2, var: { tipo: '80' } },
      { tipo: 'barril', x: 10, y: 6 },
      { tipo: 'geografia-placa', x: 0, y: 5, var: { tipo: 'E' } },
      { tipo: 'tapete', x: 0, y: 9, w: 3, h: 2, var: { cor: '#c8e8a0', borda: '#ffd34d' } },
      { tipo: 'geografia-carro', x: 0, y: 8, var: { cor: '#5fb4ff' } },
      { tipo: 'banco', x: 1, y: 10 }, { tipo: 'placa-chao', x: 3, y: 10, var: { icone: 'estrela' } },
      { tipo: 'geografia-faixa', x: 7, y: 10, w: 3, h: 1 }, { tipo: 'geografia-semaforo', x: 10, y: 10 },
      { tipo: 'tapete-listrado', x: 8, y: 9, w: 3, h: 1, var: { cores: ['#ffd34d', '#3a3a4a', '#ffd34d', '#3a3a4a'] } },
      { tipo: 'vaso-planta', x: 7, y: 8 }, { tipo: 'almofada', x: 0, y: 7, var: { cor: '#ffd34d' } },
    ]),
    /* ---------- SALA 5: Problemas no Trânsito (verde de parque e céu) ---------- */
    sala(25, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'mapa-parede', x: 1, y: 0 },
      { tipo: 'quadro-unicornio', x: 3, y: 0, var: { uni: 'g-ar-puro' } },
      { tipo: 'cartaz', x: 4, y: 0, var: { desenho: 'arcoiris' } }, { tipo: 'cortina', x: 5, y: 0, var: { cor: '#6fdc8c' } },
      { tipo: 'prateleira-parede', x: 6, y: 0 }, { tipo: 'vitral', x: 8, y: 0 },
      { tipo: 'quadro', x: 9, y: 0, var: { cena: 'paisagem' } }, { tipo: 'janela', x: 10, y: 0 },
      inter('bicicleta', 'Bicicleta', { tipo: 'geografia-bicicleta', x: 1, y: 3 }),
      { tipo: 'geografia-placa', x: 3, y: 4, var: { tipo: 'E' } },
      { tipo: 'tapete-redondo', x: 5, y: 7, w: 2, h: 2 },
      { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 4, y: 2 },
      inter('ponto', 'Ponto de ônibus', { tipo: 'geografia-ponto', x: 7, y: 3 }),
      { tipo: 'banco', x: 8, y: 3 },
      { tipo: 'planta-alta', x: 10, y: 3 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: '#39a860' } },
      { tipo: 'cesto', x: 10, y: 5 }, { tipo: 'geografia-carro', x: 6, y: 5, var: { cor: '#ffd34d' } }, { tipo: 'vaso-planta', x: 8, y: 6 },
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#d8f5d0', itens: ['xicara', 'ursinho'] } },
      { tipo: 'cadeira', x: 10, y: 9, var: { almofada: '#6fdc8c' } },
      { tipo: 'tapete', x: 8, y: 7, w: 3, h: 2, var: { cor: '#b8f0c8', borda: '#5fb4ff' } },
      { tipo: 'bau', x: 10, y: 10 }, { tipo: 'geografia-carro', x: 5, y: 10, var: { cor: '#9aa4bc' } },
      { tipo: 'geografia-bicicleta', x: 0, y: 9 },
      { tipo: 'vaso-grande', x: 2, y: 9 },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'almofada', x: 3, y: 10, var: { cor: '#9fdcff' } },
      { tipo: 'balde', x: 4, y: 9 }, { tipo: 'papeis', x: 7, y: 10 },
    ])
  );

  Reino.registrarInterior({
    id: 'geografia',
    lugar: 'materia:geografia',
    nome: 'Estação dos Caminhos',
    entrada: true,
    pacote: 'interior-geografia',
    tamanho: { w: 37, h: 25 },
    saida: { x: 18, y: 23 },
    spawn: { x: 18, y: 22 },
    comodos: [
      { id: 'hall', nome: 'Hall', placa: 'Hall • Estação dos Caminhos', rect: { x: 13, y: 13, w: 11, h: 11 },
        piso: 'mosaico', parede: 'papel', paleta: { piso: '#eef6ff', piso2: '#9fcfff', detalhe: '#39a860', parede: '#e6f2ff', parede2: '#c8e0f8', rodape: '#2f6fa8' } },
      { id: 'sala1', nome: 'Formas de se Comunicar', placa: 'Sala 1 • Formas de se Comunicar', rect: { x: 1, y: 13, w: 11, h: 11 },
        piso: 'taco', parede: 'papel', paleta: { piso: '#f2c9a8', piso2: '#dca88a', parede: '#fff1e0', parede2: '#ffe0b8' } },
      { id: 'sala2', nome: 'Meios de Comunicação', placa: 'Sala 2 • Meios de Comunicação', rect: { x: 25, y: 13, w: 11, h: 11 },
        piso: 'azulejo', parede: 'azulejo', paleta: { piso: '#fff6e0', piso2: '#f4d890', detalhe: '#e0433f', parede: '#fff6d8', parede2: '#ffc8b8', rodape: '#a83a2a' } },
      { id: 'sala3', nome: 'Telefone e Internet Segura', placa: 'Sala 3 • Telefone e Internet', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#c8ece8', piso2: '#b0dcd8', parede: '#eefcfa', parede2: '#e0d0ff', rodape: '#5a6cff' } },
      { id: 'sala4', nome: 'Trânsito Seguro', placa: 'Sala 4 • Trânsito Seguro', rect: { x: 13, y: 1, w: 11, h: 11 },
        piso: 'pedra', parede: 'tijolo', paleta: { piso: '#d8dce4', piso2: '#b8bec8' } },
      { id: 'sala5', nome: 'Problemas no Trânsito', placa: 'Sala 5 • Problemas no Trânsito', rect: { x: 25, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#b4dc98', piso2: '#9ccc80', parede: '#e6f6ff', parede2: '#c8ecff', rodape: '#39a860' } },
    ],
    portas: [
      { x: 12, y: 19, w: 1, h: 2 },   // sala 1 ↔ hall
      { x: 24, y: 19, w: 1, h: 2 },   // hall ↔ sala 2
      { x: 18, y: 12, w: 1, h: 3 },   // hall ↔ sala 4 (atravessa a parede do fundo do hall)
      { x: 12, y: 7, w: 1, h: 2 },    // sala 3 ↔ sala 4
      { x: 24, y: 7, w: 1, h: 2 },    // sala 4 ↔ sala 5
    ],
    corredores: [
      { x: 17, y: 15, w: 3, h: 9 }, { x: 13, y: 19, w: 11, h: 2 },   // hall
      { x: 8, y: 19, w: 4, h: 2 }, { x: 25, y: 19, w: 4, h: 2 },     // entradas das salas 1 e 2
      { x: 17, y: 3, w: 3, h: 9 }, { x: 13, y: 7, w: 11, h: 2 },     // sala 4
      { x: 8, y: 7, w: 4, h: 2 }, { x: 25, y: 7, w: 4, h: 2 },       // entradas das salas 3 e 5
    ],
    objetos: objetos,
    npcs: [
      npc('geo-marco', 20, 21, { tipo: 'guia', lugar: 'materia:geografia', livro: 'geografia' }),
      npc('geo-lais', 5, 18, acaoSala('g1')),
      npc('geo-duda', 30, 18, acaoSala('g2')),
      npc('geo-teo', 5, 6, acaoSala('g3')),
      npc('geo-beto', 16, 6, acaoSala('g4')),
      npc('geo-cora', 30, 6, acaoSala('g5')),
    // + os registrados com predio: 'geografia' e x/y (Reino.personagensDoPredio)
    ].concat(R.personagensDoPredio('geografia').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || { tipo: 'guia', lugar: 'materia:geografia', livro: 'geografia' });
    })),
  });
})();
