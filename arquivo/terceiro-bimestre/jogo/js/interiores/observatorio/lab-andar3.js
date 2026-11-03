/* Laboratório de Ciências: o 3º andar do Observatório, onde mora a matéria Ciências (lugar materia:ciencias).
   Hall (Professora Íris, o mapa das salas e o Livro de Ciências) + 5 cômodos, um para cada sala:
   Vivo ou Não Vivo?, Quem Ganha, Quem Perde, Amigos da Natureza, Cada Um no Seu Hábitat e Detetives da Natureza.
   Sem porta para o mapa: ela chega pelo menu Lugares (no spawn) ou subindo do 2º andar; sai pela escada que desce.
   Os objetos ficam em lab-objetos-*.js; as falas e os personagens, em lab-falas.js (carregados antes).
   Só dados, objetos e registros; nada de DOM, PA ou Progresso no carregamento.
   Laboratório claro (branco, verde-água e amarelo) e estático, sem animações, para contrastar com a noite
   dos andares de baixo; a planta (37×25) é a mesma da Casa das Palavras. */
(function () {
  var R = window.Reino;
  var S = R._predios.observatorio;
  var F = R.FALAS_INTERIORES.observatorio;
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var AGUA = S.lab.AGUA, AMARELO = S.lab.AMARELO;

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
  function acaoSala(s) { return { tipo: 'sala', materia: 'ciencias', sala: s }; }
  // o unicórnio raro da sala, lido da matéria (o id pode mudar)
  function raro(s) {
    var m = R.materia && R.materia('ciencias');
    var u = m && (m.unicornios || []).find(function (x) { return x.sala === s && x.raridade === 'raro'; });
    return u ? u.id : 'ciencias-' + s + '-raro';
  }
  function quadroRaro(s, x) { return { tipo: 'quadro-unicornio', x: x, y: 0, var: { uni: raro(s) } }; }
  function cartaz(x, desenho, faixa) { return { tipo: 'lab-cartaz', x: x, y: 0, var: { desenho: desenho, faixa: faixa } }; }
  function quadro(x, desenho) { return { tipo: 'lab-quadro', x: x, y: 0, var: { desenho: desenho } }; }

  /* ================= LAYOUT ================= */
  // colunas: 1 | 13 | 25 ; fileiras: 1 (amigos, hábitat, detetives) e 13 (vivo, hall, ganha)
  var objetos = [].concat(
    /* ---------- HALL: Laboratório de Ciências (branco, verde-água e amarelo) ---------- */
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'atomo'), quadro(2, 'seres'),
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 }, quadro(7, 'mapa'),
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      // encostado na parede, só coisa baixa embaixo dos quadros (O-12)
      { tipo: 'bau', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 },
      inter('lab-livro', 'Livro de Ciências', { tipo: 'lab-pulpito', x: 2, y: 3, acao: { tipo: 'tela', tela: 'livro', materia: 'ciencias' } }),
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 1, var: { cor: '#bff0ea', borda: AGUA } },
      { tipo: 'planta-alta', x: 0, y: 5 },
      { tipo: 'flores', x: 7, y: 2, var: { vaso: AGUA } },
      inter('lab-mapa', 'Mapa do laboratório', { tipo: 'lab-mapa', x: 8, y: 3 }),
      { tipo: 'tapete-listrado', x: 7, y: 4, w: 4, h: 1, var: { cores: [AGUA, '#f4fbff', AMARELO, '#f4fbff'] } },
      { tipo: 'poltrona', x: 8, y: 5 }, { tipo: 'cesto', x: 10, y: 5 },
      inter('lab-minijogos', 'Mini-jogos de Ciências', { tipo: 'lab-microscopio', x: 0, y: 8, voz: 'narradora', acao: { tipo: 'tela', tela: 'laboratorio-jogos' } }),
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 }, { tipo: 'globo', x: 2, y: 8 },
      { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'almofada', x: 1, y: 9, var: { cor: '#9fe0a0' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'vaso-planta', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      // o vão da escada que desce fica em (5, 10): nada em cima dele
      inter('lab-experiencias', 'Experiências de Ciências', { tipo: 'lab-tubos', x: 7, y: 10, voz: 'narradora', acao: { tipo: 'tela', tela: 'laboratorio-atividades' } }),
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#dff6f2', itens: ['livro', 'xicara'] } },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 9, y: 8 }, { tipo: 'caixote', x: 10, y: 9, var: { item: 'estrela' } }, { tipo: 'cesto', x: 10, y: 10 },
      { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: AMARELO } },
    ]),
    /* ---------- SALA 1: Vivo ou Não Vivo? (azulejo verde) ---------- */
    sala(1, 13, [
      cartaz(1, 'vivo', '#5fb85a'), quadro(2, 'seres'),   // 0 liso: o armário de vidro é alto
      { tipo: 'cortina', x: 4, y: 0, var: { cor: '#9fe0a0' } }, { tipo: 'relogio-parede', x: 5, y: 0 },
      { tipo: 'prateleira-parede', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, quadroRaro('c1', 9),
      { tipo: 'lab-armario-vidro', x: 0, y: 2 }, { tipo: 'lab-bancada', x: 1, y: 2, var: { itens: 'frascos' } },
      { tipo: 'lab-bancada', x: 3, y: 2, var: { itens: 'vasos' } },
      inter('lab-formigueiro', 'Formigueiro de vidro', { tipo: 'lab-formigueiro', x: 6, y: 3 }),
      { tipo: 'lab-pedras', x: 5, y: 2 }, { tipo: 'vaso-planta', x: 8, y: 4 },
      inter('lab-broto', 'Brotinho de feijão', { tipo: 'lab-broto', x: 9, y: 3 }),
      // nada alto embaixo do quadro do raro
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'caixote', x: 10, y: 2 }, { tipo: 'cesto', x: 9, y: 2 },
      { tipo: 'tapete-listrado', x: 0, y: 4, w: 3, h: 1, var: { cores: ['#5fb85a', '#f4fbff', AMARELO, '#f4fbff'] } },
      { tipo: 'tapete', x: 1, y: 6, w: 3, h: 2, var: { cor: '#dff6d8', borda: '#5fb85a' } },
      inter('lab-pedra', 'Pedra', { tipo: 'lab-pedra', x: 1, y: 8 }),
      { tipo: 'cadeira', x: 0, y: 8, var: { almofada: '#9fe0a0' } }, { tipo: 'cadeira', x: 2, y: 8, var: { almofada: AMARELO } },
      { tipo: 'mesa', x: 4, y: 9, var: { toalha: '#e8f8e0', itens: ['livro', 'xicara'] } },
      { tipo: 'lab-bancada', x: 7, y: 5, var: { itens: 'pedras' } }, { tipo: 'lab-pedras', x: 9, y: 5 },
      { tipo: 'lab-pedras', x: 5, y: 7 },
      inter('lab-agua', 'Galão de água', { tipo: 'lab-agua', x: 6, y: 10 }),
      { tipo: 'lab-tubos', x: 0, y: 10 }, { tipo: 'balde', x: 2, y: 10 }, { tipo: 'banco', x: 7, y: 10 },
      { tipo: 'vaso-grande', x: 10, y: 10 }, { tipo: 'cesto', x: 9, y: 10 },
      { tipo: 'almofada', x: 3, y: 8, var: { cor: '#9fe0a0' } },
    ]),
    /* ---------- SALA 2: Quem Ganha, Quem Perde (parque de capim e rio) ---------- */
    sala(25, 13, [
      quadroRaro('c2', 0),
      { tipo: 'janela', x: 2, y: 0 }, cartaz(3, 'onca', '#f0a040'), { tipo: 'janela', x: 4, y: 0 }, cartaz(5, 'abelha', AMARELO),
      quadro(6, 'cadeia'), { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'flores', x: 6, y: 2 },
      inter('lab-colmeia', 'Colmeia', { tipo: 'lab-colmeia', x: 1, y: 4 }),
      { tipo: 'lab-capim', x: 2, y: 2 }, { tipo: 'lab-capim', x: 4, y: 2 },
      inter('lab-gafanhoto', 'Gafanhoto', { tipo: 'lab-gafanhoto', x: 7, y: 4 }),
      { tipo: 'lab-capim', x: 7, y: 2 }, { tipo: 'vaso-grande', x: 10, y: 2 }, { tipo: 'lab-caixa', x: 1, y: 2 },
      { tipo: 'lab-capim', x: 3, y: 4 },
      inter('lab-onca', 'Onça-pintada', { tipo: 'lab-onca', x: 9, y: 5 }),
      { tipo: 'lab-caixa', x: 10, y: 6 },
      { tipo: 'lab-rio', x: 6, y: 6, w: 3, h: 1 }, { tipo: 'lab-rio', x: 8, y: 8, w: 3, h: 1 },
      inter('lab-jacare', 'Jacaré', { tipo: 'lab-jacare', x: 5, y: 8 }),
      inter('lab-pulgas', 'Cachorrinho', { tipo: 'lab-cachorro', x: 3, y: 8 }),
      { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'balde', x: 3, y: 10 },
      { tipo: 'cesto', x: 4, y: 10 }, { tipo: 'flores', x: 6, y: 10 }, { tipo: 'caixote', x: 7, y: 10, var: { item: 'moedas' } },
      { tipo: 'lab-capim', x: 8, y: 10 },
      { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'lab-cogumelo', x: 5, y: 6 },
      { tipo: 'lab-caixa', x: 0, y: 8 },
    ]),
    /* ---------- SALA 3: Amigos da Natureza (jardim cor-de-rosa) ---------- */
    sala(1, 1, [
      { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'passaro', '#5fb4ff'), quadro(2, 'memoria'),
      { tipo: 'bandeirinhas', x: 4, y: 0 }, cartaz(6, 'abelha', '#ff7eb6'), { tipo: 'cartaz', x: 7, y: 0 },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ff7eb6', emblema: 'coracao' } }, quadroRaro('c3', 9),
      { tipo: 'lab-cogumelo', x: 0, y: 2 },
      inter('lab-bufalo', 'Búfalo e passarinho', { tipo: 'lab-bufalo', x: 1, y: 3 }),
      inter('lab-memoria', 'Jogo da memória', { tipo: 'lab-memoria', x: 2, y: 5 }),
      inter('lab-flores', 'Flores e abelha', { tipo: 'lab-flores', x: 3, y: 2 }), { tipo: 'flores', x: 5, y: 2, var: { vaso: '#ff7eb6' } },
      inter('lab-beija-flor', 'Beija-flor', { tipo: 'lab-beija-flor', x: 7, y: 3 }),
      { tipo: 'lab-cogumelo', x: 6, y: 2, var: { cor: '#b58cff' } }, { tipo: 'cesto', x: 4, y: 2 },
      { tipo: 'barril', x: 10, y: 3 },
      { tipo: 'lab-cogumelo', x: 9, y: 4, var: { cor: AMARELO } },
      { tipo: 'lab-flores', x: 0, y: 6 }, { tipo: 'balde', x: 0, y: 7 },
      { tipo: 'banco', x: 4, y: 10 }, { tipo: 'lab-cogumelo', x: 6, y: 10 },
      { tipo: 'tapete', x: 7, y: 8, w: 3, h: 2, var: { cor: '#ffd1e6', borda: '#ff7eb6' } },
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'cesto', x: 8, y: 10 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'lab-cogumelo', x: 5, y: 8, var: { cor: '#ff9d2e' } },
      { tipo: 'lab-flores', x: 10, y: 8 },
    ]),
    /* ---------- SALA 4: Cada Um no Seu Hábitat (do gelo ao deserto) ---------- */
    sala(13, 1, [
      // 0-2 lisos: o iglu é alto (O-12)
      cartaz(3, 'sol', '#ff9d2e'), quadro(4, 'mapa'), cartaz(6, 'neve', '#5fb4ff'),
      { tipo: 'janela', x: 7, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, quadroRaro('c4', 9),
      inter('lab-urso', 'Iglu e urso-polar', { tipo: 'lab-iglu', x: 0, y: 2 }),
      inter('lab-aguape', 'Aquário com aguapé', { tipo: 'lab-aquario', x: 7, y: 3 }),
      { tipo: 'lab-cacto', x: 6, y: 3, var: { pequeno: true } },
      { tipo: 'lab-bloco-gelo', x: 2, y: 4 }, { tipo: 'caixote', x: 4, y: 4, var: { item: 'concha' } },
      inter('lab-camelo', 'Camelo', { tipo: 'lab-camelo', x: 10, y: 4 }), { tipo: 'lab-cacto', x: 7, y: 5, var: { pequeno: true } },
      { tipo: 'barril', x: 4, y: 2 }, { tipo: 'lab-bloco-gelo', x: 9, y: 2 }, { tipo: 'caixote', x: 10, y: 2 },
      inter('lab-cacto', 'Mandacaru', { tipo: 'lab-cacto', x: 0, y: 5 }),
      { tipo: 'lab-areia', x: 0, y: 8, w: 3, h: 2 },
      inter('lab-caatinga', 'Caatinga', { tipo: 'lab-caatinga', x: 8, y: 5 }),
      inter('lab-termometro', 'Termômetro', { tipo: 'lab-termometro', x: 9, y: 9 }),
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'banco', x: 6, y: 10 }, { tipo: 'globo', x: 10, y: 9 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'balde', x: 1, y: 10 }, { tipo: 'lab-bloco-gelo', x: 3, y: 10 },
      { tipo: 'lab-cacto', x: 2, y: 8, var: { pequeno: true } }, { tipo: 'cesto', x: 8, y: 8 },
      { tipo: 'tapete', x: 3, y: 9, w: 2, h: 1, var: { cor: '#f0d8a0', borda: '#ff9d2e' } },
    ]),
    /* ---------- SALA 5: Detetives da Natureza (grama e pegadas) ---------- */
    sala(25, 1, [
      quadroRaro('c5', 0),
      cartaz(2, 'pegada', '#8a5a3a'), { tipo: 'cartaz', x: 3, y: 0 }, { tipo: 'janela', x: 4, y: 0 }, quadro(5, 'cadeia'),
      { tipo: 'janela', x: 7, y: 0 }, { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#8a5a3a', emblema: 'estrela' } },
      { tipo: 'janela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('lab-preguica', 'Bicho-preguiça', { tipo: 'lab-preguica', x: 1, y: 4 }), { tipo: 'flores', x: 2, y: 2 },
      { tipo: 'lab-pegadas', x: 0, y: 2 }, { tipo: 'lab-pegadas', x: 3, y: 4, var: { bicho: 'pinguim' } },
      inter('lab-mesa', 'Mesa do detetive', { tipo: 'lab-mesa-detetive', x: 5, y: 2 }),
      { tipo: 'lab-cogumelo', x: 4, y: 2 }, { tipo: 'lab-cogumelo', x: 8, y: 2, var: { cor: AMARELO } },
      { tipo: 'vaso-grande', x: 10, y: 2 }, { tipo: 'cesto', x: 9, y: 2 }, { tipo: 'balde', x: 3, y: 2 },   // baixos: embaixo das janelas
      inter('lab-pinguim', 'Pinguim', { tipo: 'lab-pinguim', x: 9, y: 4 }),
      inter('lab-feneco', 'Feneco', { tipo: 'lab-feneco', x: 10, y: 5 }),
      inter('lab-tartaruga', 'Tartaruga marinha', { tipo: 'lab-tartaruga', x: 8, y: 9 }),
      { tipo: 'lab-bancada', x: 9, y: 10, var: { itens: 'pedras' } },
      inter('lab-lobo', 'Lobo-do-ártico', { tipo: 'lab-lobo', x: 10, y: 8 }),
      { tipo: 'lab-bancada', x: 0, y: 10, var: { itens: 'vasos' } }, { tipo: 'flores', x: 2, y: 10 },
      inter('lab-lagarto', 'Lagarto-de-colar', { tipo: 'lab-lagarto', x: 1, y: 8 }), { tipo: 'vaso-grande', x: 0, y: 8 },
      { tipo: 'lab-neve', x: 3, y: 8 }, { tipo: 'cesto', x: 5, y: 10 },
      { tipo: 'tapete', x: 5, y: 8, w: 2, h: 1, var: { cor: '#e8d8b8', borda: '#8a5a3a' } },
      { tipo: 'lab-pegadas', x: 6, y: 10 },
      { tipo: 'tapete-listrado', x: 7, y: 7, w: 3, h: 1, var: { cores: ['#8a5a3a', '#f4fbff', '#5fb85a', '#f4fbff'] } },
    ])
  );

  // escada que desce ao 2º andar (vão no chão do Hall): quem sobe de lá chega logo acima do vão (18, 22)
  R.registrarInterior({
    id: 'observatorio-3',
    lugar: 'materia:ciencias',
    nome: 'Laboratório de Ciências',
    entrada: true,
    pacote: 'interior-observatorio',
    tamanho: { w: 37, h: 25 },
    spawn: { x: 18, y: 22 },
    escadas: [{ x: 18, y: 23, para: 'observatorio-2', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: 1 }, sentido: 'desce' }],
    comodos: [
      { id: 'hall', nome: 'Hall', placa: 'Hall • Laboratório de Ciências', rect: { x: 13, y: 13, w: 11, h: 11 },
        piso: 'mosaico', parede: 'azulejo', paleta: { piso: '#f4fbff', piso2: '#bff0ea', detalhe: AGUA, parede: '#f4fbff', parede2: '#d6eef8', rodape: '#1f9a92' } },
      { id: 'vivo', nome: 'Vivo ou Não Vivo?', placa: 'Sala 1 • Vivo ou Não Vivo?', rect: { x: 1, y: 13, w: 11, h: 11 },
        piso: 'azulejo', parede: 'azulejo', paleta: { piso: '#f4fff0', piso2: '#cfeec4', detalhe: '#5fb85a', parede: '#f8fff4', parede2: '#d8f0cc', rodape: '#3f9a45' } },
      { id: 'ganha', nome: 'Quem Ganha, Quem Perde', placa: 'Sala 2 • Quem Ganha, Quem Perde', rect: { x: 25, y: 13, w: 11, h: 11 },
        piso: 'carpete', parede: 'madeira', paleta: { piso: '#d8e8a0', piso2: '#c0d888', parede: '#fff6e0', parede2: '#f0d8a0', rodape: '#8a5a3a' } },
      { id: 'amigos', nome: 'Amigos da Natureza', placa: 'Sala 3 • Amigos da Natureza', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#c8ecb0', piso2: '#b0e098', parede: '#fff1f6', parede2: '#ffd1e6', rodape: '#ff7eb6' } },
      { id: 'habitat', nome: 'Cada Um no Seu Hábitat', placa: 'Sala 4 • Cada Um no Seu Hábitat', rect: { x: 13, y: 1, w: 11, h: 11 },
        piso: 'mosaico', parede: 'papel', paleta: { piso: '#fff4dc', piso2: '#e0f2fb', detalhe: '#ff9d2e', parede: '#eaf8ff', parede2: '#fff0c8', rodape: '#2f6fd6' } },
      { id: 'detetives', nome: 'Detetives da Natureza', placa: 'Sala 5 • Detetives da Natureza', rect: { x: 25, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'madeira', paleta: { piso: '#f0dcb8', piso2: '#dcc098', parede: '#f4fbff', parede2: '#d8ecd0', rodape: '#8a5a3a' } },
    ],
    portas: [
      { x: 12, y: 19, w: 1, h: 2 },   // vivo ↔ hall
      { x: 24, y: 19, w: 1, h: 2 },   // hall ↔ ganha
      { x: 18, y: 12, w: 1, h: 3 },   // hall ↔ hábitat (atravessa a parede do fundo do hall)
      { x: 12, y: 7, w: 1, h: 2 },    // amigos ↔ hábitat
      { x: 24, y: 7, w: 1, h: 2 },    // hábitat ↔ detetives
    ],
    corredores: [
      { x: 17, y: 15, w: 3, h: 9 }, { x: 13, y: 19, w: 11, h: 2 },   // hall
      { x: 8, y: 19, w: 4, h: 2 }, { x: 25, y: 19, w: 4, h: 2 },     // entradas das salas 1 e 2
      { x: 17, y: 3, w: 3, h: 9 }, { x: 13, y: 7, w: 11, h: 2 },     // hábitat
      { x: 8, y: 7, w: 4, h: 2 }, { x: 25, y: 7, w: 4, h: 2 },       // entradas das salas 3 e 5
    ],
    objetos: objetos,
    npcs: [
      npc('lab-iris', 20, 21, { tipo: 'guia', lugar: 'materia:ciencias', livro: 'ciencias' }),
      npc('lab-bento', 5, 18, acaoSala('c1')),
      npc('lab-jana', 30, 18, acaoSala('c2')),
      npc('lab-malu', 6, 6, acaoSala('c3')),
      npc('lab-ravi', 16, 6, acaoSala('c4')),
      npc('lab-lupa', 30, 6, acaoSala('c5')),
    // + os registrados com predio: 'observatorio-3' e x/y (Reino.personagensDoPredio)
    ].concat(R.personagensDoPredio('observatorio-3').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || { tipo: 'guia', lugar: 'materia:ciencias', livro: 'ciencias' });
    })),
  });
})();
