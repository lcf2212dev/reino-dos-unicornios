/* Casa das Palavras (Português), parte 5 de 6: hall + 5 cômodos, um para cada sala.
   Hall (Dona Palavrinha e o Livro das Letras), Cozinha das Receitas, Horta do H, Pátio do Circo,
   Porto da Expedição e Parque do Carrossel.
   Aqui: ajudantes de montagem, o layout e o registro do interior. Os objetos ficam em
   portugues/objetos-*.js (carregados antes); a casa de fora, no mapa, em portugues/fora.js.
   Só dados, objetos e registros; nada de DOM, PA ou Progresso no carregamento.
   As falas moram em portugues/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
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
  function acaoSala(s) { return { tipo: 'sala', materia: 'portugues', sala: s }; }

  /* ================= LAYOUT ================= */
  // colunas: 1 | 13 | 25 ; fileiras: 1 (circo, porto, parque) e 13 (cozinha, hall, horta)
  var objetos = [].concat(
    /* ---------- HALL: Casa das Palavras (creme, vermelho e verde) ---------- */
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-cartaz-aa', x: 1, y: 0 },
      { tipo: 'portugues-varal', x: 2, y: 0, var: { letras: 'ABCDE' } },
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
      { tipo: 'portugues-varal', x: 7, y: 0, var: { letras: 'FGHIL' } },
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'estante', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 },
      inter('livro', 'Livro das Letras', { tipo: 'portugues-pulpito', x: 2, y: 3, acao: { tipo: 'tela', tela: 'livro', materia: 'portugues' } }),
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 1, var: { cor: '#ff9cc6', borda: '#39a860' } },
      { tipo: 'vaso-planta', x: 3, y: 2 },
      { tipo: 'planta-alta', x: 0, y: 5 },
      { tipo: 'flores', x: 8, y: 2, var: { vaso: '#e0433f' } }, { tipo: 'estante', x: 9, y: 2 },
      inter('mapa-casa', 'Mapa da Casa', { tipo: 'portugues-mapa', x: 8, y: 3 }),
      // tapete de página de caderno e a poltrona de leitura com braços
      { tipo: 'portugues-tapete-caderno', x: 7, y: 4, w: 4, h: 1 },
      { tipo: 'portugues-poltrona', x: 8, y: 5 }, { tipo: 'cesto', x: 10, y: 5 },
      // canto do dicionário: nada alto logo embaixo do dicionário e do globo (não "pousam" em cima de nada)
      inter('dicionario', 'Dicionário', { tipo: 'portugues-dicionario', x: 0, y: 8 }),
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 }, { tipo: 'globo', x: 2, y: 8 },
      { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'almofada', x: 1, y: 9, var: { cor: '#9fe0a0' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'vaso-planta', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      // os blocos ficam um tile abaixo dos pés da Dona Palavrinha (ela fica em 7,8)
      inter('blocos', 'Blocos de letras', { tipo: 'portugues-blocos', x: 7, y: 10 }),
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#ffd1e6', itens: ['livro', 'xicara'] } },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 10, y: 10 }, { tipo: 'caixote', x: 10, y: 9, var: { item: 'estrela' } },
      { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: '#ff9cc6' } },
    ]),
    /* ---------- SALA 1: Cozinha das Receitas (azulejo de morango) ---------- */
    sala(1, 13, [
      // o quadro do raro no canto da parede, fora da placa da sala (que fica no meio, em cima)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-receita', x: 1, y: 0 },
      { tipo: 'portugues-panelas', x: 2, y: 0 }, { tipo: 'cortina', x: 4, y: 0, var: { cor: '#ff9cc6' } },
      { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'prateleira-parede', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'quadro-unicornio', x: 9, y: 0, var: { uni: 'p-receitinha' } },
      { tipo: 'portugues-geladeira', x: 0, y: 2 }, { tipo: 'portugues-fogao', x: 1, y: 2 },
      { tipo: 'portugues-bancada', x: 3, y: 2 },
      inter('liquidificador', 'Liquidificador', { tipo: 'portugues-liquidificador', x: 6, y: 3 }),
      { tipo: 'portugues-cesta-frutas', x: 5, y: 2 }, { tipo: 'flores', x: 6, y: 2, var: { vaso: '#ff4f6a' } }, { tipo: 'vaso-planta', x: 7, y: 2 },
      inter('abacaxi', 'Abacaxi', { tipo: 'portugues-abacaxi', x: 9, y: 3 }),
      // o caixote embaixo do quadro do raro fica sem nada em cima (senão invade a moldura)
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'caixote', x: 10, y: 2 }, { tipo: 'cesto', x: 9, y: 2 },
      { tipo: 'tapete-listrado', x: 0, y: 4, w: 3, h: 1, var: { cores: ['#ff4f6a', '#fff4ec', '#39a860', '#fff4ec'] } },
      { tipo: 'tapete', x: 1, y: 6, w: 3, h: 2, var: { cor: '#ffd1e6', borda: '#ff4f6a' } },
      inter('salada', 'Salada de frutas', { tipo: 'portugues-salada', x: 1, y: 8 }),
      { tipo: 'cadeira', x: 0, y: 8, var: { almofada: '#ff9cc6' } }, { tipo: 'cadeira', x: 2, y: 8, var: { almofada: '#9fe0a0' } },
      { tipo: 'mesa', x: 4, y: 9, var: { toalha: '#ffc2d8', itens: ['xicara', 'bolo'] } },
      { tipo: 'portugues-mesa-preparo', x: 7, y: 5 }, { tipo: 'portugues-cesta-frutas', x: 9, y: 5 },
      { tipo: 'portugues-cesta-frutas', x: 5, y: 7 },
      inter('caneca-bolo', 'Bolo de caneca', { tipo: 'portugues-caneca-bolo', x: 6, y: 10 }),
      { tipo: 'portugues-cesta-frutas', x: 0, y: 10 }, { tipo: 'balde', x: 2, y: 10 }, { tipo: 'banco', x: 7, y: 10 },
      { tipo: 'vaso-grande', x: 10, y: 10 }, { tipo: 'cesto', x: 9, y: 10 },
      { tipo: 'almofada', x: 3, y: 8, var: { cor: '#ff9cc6' } },   // encostada na cadeira
    ]),
    /* ---------- SALA 2: Horta do H (terra e verde) ---------- */
    sala(25, 13, [
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'p-hibisco' } },
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'portugues-cartaz-h', x: 3, y: 0, var: { figura: 'hotel' } },
      { tipo: 'janela', x: 4, y: 0 }, { tipo: 'portugues-cartaz-h', x: 5, y: 0, var: { figura: 'helicoptero' } },
      { tipo: 'bandeirinhas', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 6, y: 2 },
      // a placa e o vaso de hortelã ficam uma fileira abaixo dos canteiros (sem cobrir a ponta deles)
      inter('placa-horta', 'Placa da horta', { tipo: 'portugues-placa-horta', x: 1, y: 4 }),
      { tipo: 'portugues-canteiro', x: 2, y: 2, var: { planta: 'alface' } },
      { tipo: 'portugues-canteiro', x: 4, y: 2, var: { planta: 'tomate' } },
      inter('hortela', 'Vaso de hortelã', { tipo: 'portugues-hortela', x: 7, y: 4 }),
      { tipo: 'portugues-canteiro', x: 7, y: 2, var: { planta: 'hortela' } },
      { tipo: 'planta-alta', x: 10, y: 2 }, { tipo: 'portugues-regador', x: 1, y: 2 },
      { tipo: 'portugues-canteiro', x: 3, y: 4, var: { planta: 'cenoura', chao: true } },
      inter('hibisco', 'Pé de hibisco', { tipo: 'portugues-hibisco', x: 9, y: 5 }),
      { tipo: 'portugues-carrinho', x: 10, y: 6 },
      { tipo: 'portugues-leira', x: 6, y: 6, w: 3, h: 1 },
      { tipo: 'portugues-leira', x: 8, y: 8, w: 3, h: 1, var: { planta: 'repolho' } },
      inter('helicoptero', 'Helicóptero de brinquedo', { tipo: 'portugues-helicoptero', x: 5, y: 8 }),
      { tipo: 'portugues-espantalho', x: 3, y: 8 },
      { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'balde', x: 3, y: 10 },
      { tipo: 'cesto', x: 4, y: 10 }, { tipo: 'flores', x: 6, y: 10 }, { tipo: 'caixote', x: 7, y: 10, var: { item: 'moedas' } },
      { tipo: 'portugues-canteiro', x: 8, y: 10, var: { planta: 'alface', chao: true } },   // com uma fileira livre entre ele e a leira
      { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'portugues-regador', x: 5, y: 6 },
      { tipo: 'portugues-carrinho', x: 0, y: 8 },
    ]),
    /* ---------- SALA 3: Pátio do Circo (lona vermelha e amarelinha no chão) ---------- */
    sala(1, 1, [
      // o quadro do raro no canto da direita, fora da placa da sala (e, no notebook, fora do dinheiro e da estrela)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cartaz', x: 1, y: 0 }, { tipo: 'portugues-lona', x: 2, y: 0 },
      { tipo: 'bandeirinhas', x: 4, y: 0 }, { tipo: 'portugues-lona', x: 6, y: 0, var: { cor: '#7c5cff' } },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#e0433f', emblema: 'estrela' } },
      { tipo: 'quadro-unicornio', x: 9, y: 0, var: { uni: 'p-xicara' } },
      { tipo: 'portugues-banquinho', x: 0, y: 2 },
      inter('chocalho', 'Chocalho', { tipo: 'portugues-chocalho', x: 1, y: 3 }),
      inter('amarelinha', 'Amarelinha', { tipo: 'portugues-amarelinha', x: 2, y: 5 }),
      { tipo: 'portugues-bola-circo', x: 3, y: 2 }, { tipo: 'flores', x: 5, y: 2, var: { vaso: '#7c5cff' } },
      inter('pipoca', 'Carrinho de pipoca', { tipo: 'portugues-pipoca', x: 7, y: 3 }),
      { tipo: 'portugues-banquinho', x: 6, y: 2, var: { cor: '#e0433f' } }, { tipo: 'vaso-planta', x: 4, y: 2 },
      { tipo: 'barril', x: 10, y: 3 },   // longe do chocalho: atrás dele fica o chão
      inter('ninho', 'Ninho', { tipo: 'portugues-ninho', x: 9, y: 4 }),
      { tipo: 'portugues-bola-circo', x: 0, y: 6 }, { tipo: 'balde', x: 0, y: 7 },
      { tipo: 'banco', x: 4, y: 10 }, { tipo: 'portugues-banquinho', x: 6, y: 10, var: { cor: '#39c5bb' } },
      { tipo: 'tapete', x: 7, y: 8, w: 3, h: 2, var: { cor: '#ffd34d', borda: '#e0433f' } },
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'cesto', x: 8, y: 10 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'portugues-banquinho', x: 5, y: 8, var: { cor: '#ff9d2e' } },
      { tipo: 'portugues-bola-circo', x: 10, y: 8 },
    ]),
    /* ---------- SALA 4: Porto da Expedição (convés de madeira, gelo e mar) ---------- */
    sala(13, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-boia', x: 1, y: 0 },
      { tipo: 'mapa-parede', x: 2, y: 0 }, { tipo: 'portugues-bandeira', x: 4, y: 0 },
      { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'portugues-boia', x: 6, y: 0 }, { tipo: 'janela', x: 7, y: 0 }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'portugues-quadro-estreito', x: 9, y: 0, var: { uni: 'p-iceberg', lado: 'dir' } },
      { tipo: 'portugues-barco', x: 0, y: 2 },
      inter('iceberg', 'Tanque do iceberg', { tipo: 'portugues-iceberg', x: 7, y: 3 }),
      { tipo: 'portugues-ancora', x: 3, y: 2 },
      // na frente do cais só coisas baixas; o albatroz fica num tile livre, com chão atrás dele
      { tipo: 'portugues-cordas', x: 0, y: 4 }, { tipo: 'caixote', x: 1, y: 4, var: { item: 'concha' } },
      { tipo: 'portugues-albatroz', x: 9, y: 4 }, { tipo: 'portugues-leme', x: 7, y: 5 },
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'portugues-cordas', x: 9, y: 2 }, { tipo: 'caixote', x: 10, y: 2 },   // sem nada em cima: fica embaixo do quadro do raro
      inter('pinguins', 'Pinguins', { tipo: 'portugues-pinguins', x: 0, y: 5 }),
      { tipo: 'portugues-gelo', x: 0, y: 8, w: 3, h: 2 },
      inter('focas', 'Focas', { tipo: 'portugues-focas', x: 8, y: 5 }),
      inter('diario', 'Diário da expedição', { tipo: 'portugues-diario', x: 9, y: 9 }),
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'banco', x: 6, y: 10 }, { tipo: 'globo', x: 10, y: 9 },
      { tipo: 'portugues-lampiao', x: 0, y: 10 }, { tipo: 'balde', x: 1, y: 10 }, { tipo: 'portugues-cordas', x: 3, y: 10 },
      { tipo: 'portugues-pinguins', x: 2, y: 8 }, { tipo: 'cesto', x: 8, y: 8 }, { tipo: 'tapete', x: 3, y: 9, w: 2, h: 1, var: { cor: '#9fcfff', borda: '#2f6fd6' } },
    ]),
    /* ---------- SALA 5: Parque do Carrossel (grama e festa) ---------- */
    sala(25, 1, [
      // o quadro do raro no canto da esquerda, fora da placa da sala (e, no notebook, fora da carta do unicórnio)
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'p-farol' } },
      { tipo: 'bandeirinhas', x: 2, y: 0 }, { tipo: 'janela', x: 4, y: 0 }, { tipo: 'bandeirinhas', x: 5, y: 0 }, { tipo: 'janela', x: 7, y: 0 },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ff5c8a', emblema: 'coracao' } }, { tipo: 'janela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('arvore', 'Árvore', { tipo: 'portugues-arvore', x: 1, y: 4 }), { tipo: 'portugues-canteiro-flores', x: 2, y: 2 },
      { tipo: 'portugues-bola', x: 0, y: 2 }, { tipo: 'portugues-bola', x: 3, y: 4 },
      inter('carrossel', 'Carrossel', { tipo: 'portugues-carrossel', x: 5, y: 2 }),
      { tipo: 'portugues-canteiro-flores', x: 4, y: 2, var: { cor: '#b58cff' } }, { tipo: 'portugues-canteiro-flores', x: 8, y: 2, var: { cor: '#ffd34d' } },
      { tipo: 'planta-alta', x: 10, y: 2 }, { tipo: 'portugues-poste', x: 9, y: 2 }, { tipo: 'portugues-poste', x: 3, y: 2 },
      inter('baloes', 'Balões', { tipo: 'portugues-baloes', x: 9, y: 4 }),
      { tipo: 'portugues-algodao', x: 10, y: 5 },
      inter('mel', 'Pote de mel', { tipo: 'portugues-mel', x: 8, y: 9 }),
      { tipo: 'portugues-banco-praca', x: 9, y: 10 }, { tipo: 'portugues-bola', x: 10, y: 8 },
      { tipo: 'portugues-banco-praca', x: 0, y: 10 }, { tipo: 'flores', x: 2, y: 10 },
      { tipo: 'portugues-bola', x: 1, y: 8 }, { tipo: 'vaso-grande', x: 0, y: 8 },
      { tipo: 'portugues-canteiro-flores', x: 3, y: 8, var: { cor: '#ff5c6a' } }, { tipo: 'cesto', x: 5, y: 10 },
      { tipo: 'tapete', x: 5, y: 8, w: 2, h: 1, var: { cor: '#ffd1e6', borda: '#ff5c8a' } },
      { tipo: 'portugues-canteiro-flores', x: 6, y: 10 },
      { tipo: 'tapete-listrado', x: 7, y: 7, w: 3, h: 1, var: { cores: ['#ff5c8a', '#fff4ec', '#5fb4ff', '#fff4ec'] } },
    ])
  );

  Reino.registrarInterior({
    id: 'portugues',
    lugar: 'materia:portugues',
    nome: 'Casa das Palavras',
    entrada: true,
    pacote: 'interior-portugues',
    tamanho: { w: 37, h: 25 },
    saida: { x: 18, y: 23 },
    spawn: { x: 18, y: 22 },
    comodos: [
      { id: 'hall', nome: 'Hall', placa: 'Hall • Casa das Palavras', rect: { x: 13, y: 13, w: 11, h: 11 },
        piso: 'mosaico', parede: 'papel', paleta: { piso: '#fff4ec', piso2: '#ff9cc6', detalhe: '#39a860', parede: '#fff4ec', parede2: '#ffd9d0', rodape: '#b82e35' } },
      { id: 'cozinha', nome: 'Cozinha das Receitas', placa: 'Sala 1 • Receita de Quê?', rect: { x: 1, y: 13, w: 11, h: 11 },
        piso: 'azulejo', parede: 'azulejo', paleta: { piso: '#fff4ec', piso2: '#ffc2c8', detalhe: '#ff4f6a', parede: '#fffaf2', parede2: '#ffd1d6', rodape: '#b82e35' } },
      { id: 'horta', nome: 'Horta do H', placa: 'Sala 2 • O H Silencioso', rect: { x: 25, y: 13, w: 11, h: 11 },
        piso: 'carpete', parede: 'madeira', paleta: { piso: '#b4d67e', piso2: '#94bd62', parede: '#e8f6d8', parede2: '#b6d88a', rodape: '#2a7d48' } },
      { id: 'circo', nome: 'Pátio do Circo', placa: 'Sala 3 • CH, LH, NH e o X', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'papel', paleta: { piso: '#f0c890', piso2: '#d09a5a', parede: '#fff1f4', parede2: '#ffd34d', rodape: '#7c5cff' } },
      { id: 'porto', nome: 'Porto da Expedição', placa: 'Sala 4 • Expedição Antártida', rect: { x: 13, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'madeira', paleta: { piso: '#d8c0a0', piso2: '#a88a68', parede: '#e8f6ff', parede2: '#bfe4f5', rodape: '#2f4f8a' } },
      { id: 'parque', nome: 'Parque do Carrossel', placa: 'Sala 5 • L, R e RR', rect: { x: 25, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#a8dc8a', piso2: '#8fcc72', parede: '#e6f6ff', parede2: '#ffd1e6', rodape: '#39a860' } },
    ],
    portas: [
      { x: 12, y: 19, w: 1, h: 2 },   // cozinha ↔ hall
      { x: 24, y: 19, w: 1, h: 2 },   // hall ↔ horta
      { x: 18, y: 12, w: 1, h: 3 },   // hall ↔ porto (atravessa a parede do fundo do hall)
      { x: 12, y: 7, w: 1, h: 2 },    // circo ↔ porto
      { x: 24, y: 7, w: 1, h: 2 },    // porto ↔ parque
    ],
    corredores: [
      { x: 17, y: 15, w: 3, h: 9 }, { x: 13, y: 19, w: 11, h: 2 },   // hall
      { x: 8, y: 19, w: 4, h: 2 }, { x: 25, y: 19, w: 4, h: 2 },     // entradas da cozinha e da horta
      { x: 17, y: 3, w: 3, h: 9 }, { x: 13, y: 7, w: 11, h: 2 },     // porto
      { x: 8, y: 7, w: 4, h: 2 }, { x: 25, y: 7, w: 4, h: 2 },       // entradas do circo e do parque
    ],
    objetos: objetos,
    npcs: [
      npc('palavrinha', 20, 21, { tipo: 'guia', lugar: 'materia:portugues', livro: 'portugues' }),
      npc('manu', 5, 18, acaoSala('p1')),
      npc('heitor', 30, 18, acaoSala('p2')),
      npc('chocalho', 6, 6, acaoSala('p3')),
      npc('brisa', 16, 6, acaoSala('p4')),
      npc('carlos', 30, 6, acaoSala('p5')),
    // + os registrados com predio: 'portugues' e x/y (Reino.personagensDoPredio; prédio antigo não tem vagas: sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('portugues').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || { tipo: 'guia', lugar: 'materia:portugues', livro: 'portugues' });
    })),
  });

})();
