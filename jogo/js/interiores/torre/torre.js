/* Torre do Relógio (Inglês), parte 2 de 2: térreo, 5 andares (um por sala) e o mecanismo no alto.
   Aqui: ajudantes de montagem, o esqueleto dos andares e o registro de cada andar. Os objetos
   temáticos ficam em torre/objetos.js (carregado antes); as falas moram em torre/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.torre) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.torre;
  var BRONZE = S.BRONZE, BRONZE2 = S.BRONZE2;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do andar (0..10 × 0..10; fileiras 0 e 1 são a parede); o cômodo começa em (1,1)
  function sala(lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + 1; n.y = o.y + 1; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x + 1, y: y + 1, acao: acao, falas: F.npcs[id] || {} };
  }
  function acaoSala(s) { return { tipo: 'sala', materia: 'ingles', sala: s }; }

  // todos os andares têm o mesmo esqueleto: 13×13, um cômodo 11×11 em (1,1);
  // sobe no fundo à direita (10,3) e desce no chão à esquerda (2,10); corredor no meio
  var ANDARES = ['torre', 'torre-1', 'torre-2', 'torre-3', 'torre-4', 'torre-5', 'torre-relogio'];
  var SOBE = { x: 10, y: 3 }, DESCE = { x: 2, y: 10 };
  function escadas(i) {
    var e = [];
    if (i < ANDARES.length - 1) e.push({ x: SOBE.x, y: SOBE.y, para: ANDARES[i + 1], chegada: { x: DESCE.x + 1, y: DESCE.y }, olhar: { x: 1, y: 0 }, sentido: 'sobe' });
    if (i > 0) e.push({ x: DESCE.x, y: DESCE.y, para: ANDARES[i - 1], chegada: { x: SOBE.x - 1, y: SOBE.y }, olhar: { x: 0, y: 1 }, sentido: 'desce' });
    return e;
  }
  function andar(i, nome, comodo, objetos, npcs, extra) {
    Reino.registrarInterior(Object.assign({
      id: ANDARES[i],
      lugar: 'materia:ingles',
      nome: nome,
      pacote: 'interior-torre',
      tamanho: { w: 13, h: 13 },
      escadas: escadas(i),
      comodos: [Object.assign({ id: 'andar', nome: nome, rect: { x: 1, y: 1, w: 11, h: 11 } }, comodo)],
      corredores: [{ x: 5, y: 3, w: 3, h: 9 }, { x: 8, y: 3, w: 2, h: 1 }, { x: 3, y: 10, w: 2, h: 1 }],
      objetos: sala(objetos),
      npcs: npcs,
    }, extra || {}));
  }
  function cartaz(x, icone, cor, faixa) { return { tipo: 'torre-cartaz', x: x, y: 0, var: { icone: icone, cor: cor, faixa: faixa } }; }

  /* ---------- TÉRREO: a oficina do relojoeiro (pedra e bronze) ---------- */
  andar(0, 'Torre do Relógio', {
    placa: 'Térreo • Torre do Relógio', piso: 'pedra', parede: 'madeira',
    paleta: { piso: '#e8dcc8', piso2: '#c9b48f', parede: '#d9a86a', parede2: '#b9824a', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('andares', 'Quadro dos andares', { tipo: 'torre-andares', x: 1, y: 0 }),
    { tipo: 'estandarte', x: 3, y: 0, var: { cor: '#2f6fd6', emblema: 'estrela' } },
    { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
    cartaz(7, 'relogio', '#fff3d6', BRONZE), { tipo: 'cortina', x: 8, y: 0, var: { cor: '#2f6fd6' } }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'luminaria-pe', x: 3, y: 2 },
    { tipo: 'globo', x: 0, y: 4 },
    inter('livro', 'Livro das Palavras', { tipo: 'torre-pulpito', x: 2, y: 4, acao: { tipo: 'tela', tela: 'livro', materia: 'ingles' } }),
    { tipo: 'tapete-redondo', x: 1, y: 5, w: 2, h: 2, var: { cor: '#9fcfff' } },
    { tipo: 'pilha-livros', x: 0, y: 6 }, { tipo: 'banco', x: 0, y: 8 }, { tipo: 'cesto', x: 3, y: 8 },
    { tipo: 'tapete-listrado', x: 0, y: 9, w: 3, h: 1, var: { cores: ['#2f6fd6', '#fff8ee', '#ff5c6a', '#fff8ee'] } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'relogio' } }, { tipo: 'barril', x: 2, y: 10 }, { tipo: 'vaso-grande', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    inter('engrenagens', 'Bancada de engrenagens', { tipo: 'torre-engrenagens', x: 8, y: 4 }),
    inter('relogio-grande', 'Relógio de pé', { tipo: 'relogio-pe', x: 10, y: 4 }),
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#ffd9a0', borda: BRONZE } },
    { tipo: 'flores', x: 10, y: 7 }, { tipo: 'cadeira', x: 7, y: 8, var: { almofada: '#2f6fd6' } },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#fff3d6', itens: ['relogio', 'xicara'] } },
    { tipo: 'cabideiro', x: 10, y: 9 }, { tipo: 'balde', x: 7, y: 10 }, { tipo: 'caixote', x: 8, y: 10, var: { item: 'moedas' } },
    { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'balde', x: 10, y: 8 },
  ], [
    npc('ponteiro', 3, 5, { tipo: 'guia', lugar: 'materia:ingles', livro: 'ingles' }),
  ], { entrada: true, saida: { x: 6, y: 11 }, spawn: { x: 6, y: 10 } });

  /* ---------- ANDAR 1: «Living Together» (quadra de madeira e laranja) ---------- */
  andar(1, '«Living Together»', {
    placa: 'Andar 1 • «Living Together»', piso: 'tabuas', parede: 'tijolo',
    paleta: { piso: '#f0c88a', piso2: '#d9a45e', parede: '#ffb070', parede2: '#e8884a', rodape: '#2f4f8a', detalhe: '#ffffff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-torcida' } },
    inter('regras-escola', 'Regras da escola', cartaz(3, 'mao', '#fff8ee', C.azul)),
    { tipo: 'torre-palavra', x: 4, y: 0, var: { palavra: 'RULES', faixa: C.laranja } },
    inter('torcida', 'Cartaz da torcida', cartaz(6, 'torcida', '#fff8ee', C.vermelho)),
    inter('regras-casa', 'Regras de casa', cartaz(7, 'brinquedos', '#fff8ee', C.verde)),
    { tipo: 'relogio-parede', x: 8, y: 0 }, cartaz(10, 'apito', '#fff8ee', C.ouro),
    { tipo: 'bau', x: 0, y: 2 }, { tipo: 'caixote', x: 1, y: 2, var: { item: 'medalha' } }, { tipo: 'pilha-livros', x: 2, y: 2 },
    { tipo: 'mesa', x: 0, y: 4, var: { toalha: '#9fcfff', itens: ['livro', 'medalha'] } }, { tipo: 'cadeira', x: 2, y: 4, var: { almofada: '#ff8a3d' } },
    inter('trave', 'Trave de futebol', { tipo: 'torre-trave', x: 0, y: 6 }),
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#6fdc8c', '#ffffff', '#6fdc8c', '#ffffff'] } },
    { tipo: 'balde', x: 3, y: 8 }, { tipo: 'vaso-planta', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ff8a3d' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'cesto', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    { tipo: 'banco', x: 8, y: 4 }, { tipo: 'cabideiro', x: 10, y: 4 },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#8fd06a', borda: '#ffffff' } },
    { tipo: 'bau', x: 10, y: 6 }, { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#ff8a3d' } },
    { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'papeis', x: 8, y: 10 }, { tipo: 'caixote', x: 10, y: 10, var: { item: 'medalha' } },
  ], [
    npc('ben', 3, 5, acaoSala('i1')),
  ]);

  /* ---------- ANDAR 2: «Here Comes the Sun» (céu de noite e estrelas) ---------- */
  andar(2, '«Here Comes the Sun»', {
    placa: 'Andar 2 • «Here Comes the Sun»', piso: 'carpete', parede: 'papel',
    paleta: { piso: '#5a6ad0', piso2: '#4a58b8', parede: '#2a2f66', parede2: '#ffe066', rodape: C.ouro2, detalhe: C.ouro },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-planetinha' } },
    inter('sol', 'Cartaz do sol', { tipo: 'torre-cartaz', x: 3, y: 0, var: { icone: 'sol', palavra: 'SUN', cor: '#fff3c8', faixa: C.laranja } }),
    inter('planetas', 'Móbile dos planetas', { tipo: 'torre-mobile', x: 4, y: 0 }),
    { tipo: 'arandela', x: 6, y: 0 },
    inter('arte', 'Cartaz das formas', cartaz(7, 'formas', '#fff8ee', C.rosa)),
    { tipo: 'janela', x: 8, y: 0 }, { tipo: 'torre-cartaz', x: 10, y: 0, var: { icone: 'estrela', faixa: C.ouro } },
        inter('luneta', 'Luneta', { tipo: 'torre-luneta', x: 3, y: 4 }),
    { tipo: 'mesa', x: 0, y: 4, var: { toalha: '#2a2f66', itens: ['estrela', 'globo'] } }, { tipo: 'cadeira', x: 2, y: 4, var: { almofada: '#ffd34d' } },
    { tipo: 'tapete-redondo', x: 0, y: 6, w: 2, h: 2, var: { cor: '#ffe066' } },
    { tipo: 'pilha-livros', x: 2, y: 7 }, { tipo: 'vaso-planta', x: 3, y: 8 },
    { tipo: 'cavalete', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ffd34d' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'flores', x: 3, y: 10 },
    { tipo: 'vaso-planta', x: 10, y: 2 },
    inter('relogio-sol', 'Relógio de sol', { tipo: 'torre-relogio-sol', x: 8, y: 4 }),
    inter('protetor', 'Protetor solar', { tipo: 'torre-protetor', x: 10, y: 4 }),
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#ffd34d', borda: '#ff8a3d' } },
    { tipo: 'poltrona', x: 10, y: 7, var: { cor: '#5a6ad0' } },
    { tipo: 'sofa', x: 7, y: 9, var: { cor: '#ffd34d' } }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'almofada', x: 7, y: 10, var: { cor: '#b58cff' } }, { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
  ], [
    npc('stella', 3, 6, acaoSala('i2')),
  ]);

  /* ---------- ANDAR 3: «I Brush My Teeth Every Day» (banheiro de azulejo) ---------- */
  andar(3, '«I Brush My Teeth Every Day»', {
    placa: 'Andar 3 • «Brush My Teeth»', piso: 'azulejo', parede: 'azulejo',
    paleta: { piso: '#eef8ff', piso2: '#bfe3f7', detalhe: '#5fb4ff', parede: '#e6f6ff', parede2: '#9fdcff', rodape: '#2f6fa8' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-chuveirinho' } },
    inter('toalhas', 'Toalhas', { tipo: 'torre-toalhas', x: 3, y: 0 }),
    { tipo: 'espelho', x: 4, y: 0 },
    inter('sorriso', 'Cartaz do sorriso', cartaz(5, 'dente', '#fff8ee', C.agua)),
    { tipo: 'torre-palavra', x: 6, y: 0, var: { palavra: 'SMILE', faixa: C.agua, icone: 'dente' } },
    { tipo: 'torre-toalhas', x: 8, y: 0, var: { cor: C.ouro, cor2: C.lilas } },
    { tipo: 'torre-cartaz', x: 10, y: 0, var: { icone: 'chuveiro', faixa: C.azul } },
    { tipo: 'flores', x: 0, y: 2 }, { tipo: 'cesto', x: 1, y: 2 },
    inter('pia', 'Pia', { tipo: 'torre-pia', x: 2, y: 2 }),
    { tipo: 'cesto', x: 0, y: 4 }, { tipo: 'balde', x: 1, y: 4 },
    { tipo: 'flores', x: 2, y: 4 },
    { tipo: 'banco', x: 0, y: 6 }, { tipo: 'cabideiro', x: 3, y: 7 },
    { tipo: 'tapete-redondo', x: 1, y: 7, w: 2, h: 2, var: { cor: '#9fdcff' } },
    { tipo: 'vaso-planta', x: 0, y: 8 },
    { tipo: 'caixote', x: 0, y: 9, var: { item: 'concha' } },
    { tipo: 'cesto', x: 0, y: 10 }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#7ed9c8' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'vaso-planta', x: 3, y: 10 },
    { tipo: 'planta-alta', x: 10, y: 2 },
    inter('escova', 'Escova gigante', { tipo: 'torre-escova', x: 7, y: 4 }),
    { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffffff', itens: ['vaso', 'concha'] } }, { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#7ed9c8' } },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#7ed9c8', borda: '#ffffff' } },
    { tipo: 'bebedouro', x: 10, y: 6 },
    { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#9fdcff' } }, { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'balde', x: 7, y: 10 }, { tipo: 'pilha-livros', x: 8, y: 10 }, { tipo: 'caixote', x: 9, y: 10 }, { tipo: 'cesto', x: 10, y: 10 },
  ], [
    npc('smile', 3, 5, acaoSala('i3')),
  ]);

  /* ---------- ANDAR 4: «A Day in My Life» (quarto lilás, do sol à lua) ---------- */
  andar(4, '«A Day in My Life»', {
    placa: 'Andar 4 • «A Day in My Life»', piso: 'taco', parede: 'papel',
    paleta: { piso: '#e8c49a', piso2: '#caa078', parede: '#efe2fb', parede2: '#ffe28a', rodape: '#7c5cff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-noitinha' } },
    { tipo: 'torre-cartaz', x: 3, y: 0, var: { icone: 'sol', palavra: 'DAY', faixa: C.ouro } },
    inter('rotina', 'O dia na parede', { tipo: 'torre-rotina', x: 4, y: 0 }),
    { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'NIGHT', cor: '#2a2f66', tinta: C.ouro3, faixa: C.lilas, icone: 'lua' } }, { tipo: 'janela', x: 10, y: 0 },
    inter('cama', 'Cama', { tipo: 'torre-cama', x: 0, y: 2 }),
    { tipo: 'armario', x: 0, y: 4 }, { tipo: 'luminaria-pe', x: 2, y: 4 },
    inter('licao', 'Lição de casa', { tipo: 'escrivaninha', x: 0, y: 6 }), { tipo: 'cadeira', x: 2, y: 6, var: { almofada: '#b58cff' } },
    { tipo: 'vaso-planta', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 2, y: 8 },
    { tipo: 'papeis', x: 0, y: 9 },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ffe066' } },
    { tipo: 'caixote', x: 2, y: 10, var: { item: 'ursinho' } }, { tipo: 'cesto', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    inter('lanche', 'Mesa do almoço', { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffe066', itens: ['bule', 'bolo'] } }),
    { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#ffe066' } },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#c9a8ff', borda: '#ffe066' } },
    { tipo: 'relogio-pe', x: 10, y: 6 }, { tipo: 'flores', x: 10, y: 8 },
    { tipo: 'sofa', x: 7, y: 9, var: { cor: '#9b7bff' } },
    { tipo: 'almofada', x: 8, y: 10, var: { cor: '#b58cff' } }, { tipo: 'planta-alta', x: 10, y: 10 },
  ], [
    npc('moon', 3, 4, acaoSala('i4')),
  ]);

  /* ---------- ANDAR 5: «If You're Happy, Clap Your Hands» (sala de música) ---------- */
  andar(5, '«If You\'re Happy, Clap Your Hands»', {
    placa: 'Andar 5 • «Clap Your Hands»', piso: 'mosaico', parede: 'papel',
    paleta: { piso: '#fff0f6', piso2: '#ffc2d8', detalhe: '#ffd34d', parede: '#fff6d8', parede2: '#ffc2d8', rodape: '#ff4f9a' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-sleepy' } },
    inter('carinhas', 'Cartaz das carinhas', { tipo: 'torre-carinhas', x: 3, y: 0 }),
    { tipo: 'bandeirinhas', x: 5, y: 0 }, { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'HAPPY', faixa: C.rosa, icone: 'feliz' } }, { tipo: 'janela', x: 10, y: 0 },
    inter('piano', 'Piano', { tipo: 'torre-piano', x: 0, y: 2 }),
    { tipo: 'cadeira', x: 0, y: 4, var: { almofada: '#ff7eb6' } },
    inter('pandeiro', 'Pandeiro', { tipo: 'torre-pandeiro', x: 2, y: 4 }),
    { tipo: 'sofa', x: 0, y: 6, var: { cor: '#ffd34d' } }, { tipo: 'vaso-planta', x: 2, y: 7 },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#ff7eb6', '#ffd34d', '#5fb4ff', '#6fdc8c'] } },
    { tipo: 'cesto', x: 3, y: 8 }, { tipo: 'almofada', x: 0, y: 9, var: { cor: '#5fb4ff' } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'estrela' } },
    { tipo: 'luminaria-pe', x: 2, y: 10 }, { tipo: 'flores', x: 3, y: 10 },
    { tipo: 'planta-alta', x: 10, y: 2 },
    { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffc2d8', itens: ['bolo', 'xicara'] } }, { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#ffd34d' } },
    { tipo: 'tapete-redondo', x: 7, y: 6, w: 2, h: 2, var: { cor: '#ffd34d' } }, { tipo: 'vaso-grande', x: 10, y: 6 },
    { tipo: 'banco', x: 7, y: 9 }, { tipo: 'cavalete', x: 10, y: 9 },
    { tipo: 'torre-pandeiro', x: 9, y: 8 }, { tipo: 'almofada', x: 8, y: 10, var: { cor: '#ff7eb6' } }, { tipo: 'cesto', x: 10, y: 10 },
  ], [
    npc('joy', 3, 5, acaoSala('i5')),
  ]);

  /* ---------- NO ALTO: o mecanismo do relógio (sem personagem) ---------- */
  andar(6, 'O Relógio', {
    placa: 'No alto • O Relógio', piso: 'tabuas', parede: 'pedra',
    paleta: { piso: '#b98a5e', piso2: '#8f6440', parede: '#d8ccb8', parede2: '#b8a888', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'torre-engrenagem-grande', x: 0, y: 0 }, { tipo: 'arandela', x: 2, y: 0 },
    { tipo: 'torre-engrenagem-grande', x: 3, y: 0, var: { sentido: -1 } }, { tipo: 'arandela', x: 5, y: 0 }, { tipo: 'janela', x: 6, y: 0 },
    { tipo: 'arandela', x: 7, y: 0 },
    inter('mostrador', 'Mostrador do relógio', { tipo: 'torre-mostrador', x: 8, y: 0 }),
    inter('pendulo', 'Pêndulo', { tipo: 'torre-pendulo', x: 1, y: 2 }),
    { tipo: 'barril', x: 0, y: 3 }, { tipo: 'flores', x: 0, y: 2 },
    inter('engrenagem-grande', 'Engrenagens do relógio', { tipo: 'torre-maquina', x: 2, y: 3 }),
    { tipo: 'caixote', x: 0, y: 5, var: { item: 'relogio' } }, { tipo: 'balde', x: 3, y: 5 },
    { tipo: 'tapete-redondo', x: 1, y: 6, w: 2, h: 2, var: { cor: '#d9a86a' } },
    { tipo: 'bau', x: 0, y: 7 }, { tipo: 'caixote', x: 3, y: 8 },
    { tipo: 'barril', x: 0, y: 9 },
    { tipo: 'cesto', x: 0, y: 10 }, { tipo: 'caixote', x: 2, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
    inter('sino', 'Sino da torre', { tipo: 'torre-sino', x: 10, y: 4 }),
    { tipo: 'torre-maquina', x: 7, y: 4 },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#c98a4b', borda: C.ouro } },
    { tipo: 'luminaria-pe', x: 10, y: 6 },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#e8dcc8', itens: ['relogio', 'moedas'] } }, { tipo: 'cadeira', x: 10, y: 8 },
    { tipo: 'banco', x: 7, y: 10 }, { tipo: 'relogio-pe', x: 10, y: 10 },
  ], []);
})();
