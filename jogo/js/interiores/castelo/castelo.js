/* Castelo da Medalha, parte 2 de 2: salão do trono (Princesa Serena) + uma ala de treino por matéria.
   As alas saem de um GERADOR a partir de Reino.materias (em ordem); as falas moram em castelo/falas.js.
   Aqui: montagem, temas das alas, cavaleiros, a estante das medalhas e o registro do interior.
   Os objetos temáticos ficam em castelo/objetos.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.castelo) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.castelo;
  var matriz = S.matriz, medalha = S.medalha, PT_VERMELHO = S.PT_VERMELHO;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }

  /* ================= ALAS: TEMAS E CAVALEIROS ================= */
  // cavaleiro de cada matéria: o personagem do elenco com `paraMateria` (personagens/elenco.js);
  // as outras matérias ganham o cavaleiro padrão
  function cavaleiroDoElenco(materiaId) {
    return R.NPCs && R.NPCs.doElenco ? R.NPCs.doElenco({ paraMateria: materiaId }) : null;
  }
  // { historia: 'aurora', ingles: 'oliver', portugues: 'clara' }: gancho de teste (I.castelo), tirado do elenco
  var CAVALEIROS = {};
  Object.keys(ELENCO).forEach(function (id) {
    var m = ELENCO[id].paraMateria;
    if (m && !(m in CAVALEIROS)) CAVALEIROS[m] = id;
  });
  // tema de cada ala: enfeite largo (2) e estreito (1) da parede, 4 peças de chão (A..D), piso e paleta
  var TEMAS = {
    historia: {
      paredeLarga: { tipo: 'castelo-mapa-antigo' }, paredeEstreita: { tipo: 'quadro', var: { cena: 'paisagem' } },
      a: inter('historia-ampulheta', 'Ampulheta antiga', { tipo: 'castelo-ampulheta' }),
      b: { tipo: 'castelo-pergaminhos' }, c: { tipo: 'pilha-livros' }, d: { tipo: 'globo' },
      cor: '#ff7eb6', piso: 'tabuas', parede: 'pedra',
      paleta: { piso: '#e8b888', piso2: '#c98a5a', parede: '#fbe6cc', parede2: '#f0c8a0', rodape: '#8a4a3a' },
    },
    ingles: {
      paredeLarga: { tipo: 'castelo-bandeirolas' }, paredeEstreita: { tipo: 'relogio-parede' },
      a: inter('ingles-cartaz', 'Cartaz em inglês', { tipo: 'castelo-cartaz-ingles' }),
      b: { tipo: 'relogio-pe' }, c: { tipo: 'pilha-livros' }, d: { tipo: 'globo' },
      cor: '#2f6fd6', piso: 'pedra', parede: 'tijolo',
      paleta: { piso: '#dfe6f2', piso2: '#aebcd8', parede: '#f4e4d8', parede2: '#d8b0a0', rodape: '#2f4f8a' },
    },
    portugues: {
      paredeLarga: { tipo: 'castelo-quadro-palavras' }, paredeEstreita: { tipo: 'cartaz', var: { desenho: 'abc' } },
      a: inter('portugues-livro', 'Livro aberto', { tipo: 'castelo-livro-aberto' }),
      b: { tipo: 'castelo-blocos-letras' }, c: { tipo: 'pilha-livros' }, d: { tipo: 'castelo-cavalete-receita' },
      cor: PT_VERMELHO, piso: 'taco', parede: 'pedra',
      paleta: { piso: '#e4f0d4', piso2: '#b4d49a', parede: '#fff1ea', parede2: '#f2c4b8', rodape: '#2e7a45' },
    },
  };
  var PISOS_PADRAO = ['palha', 'taco', 'azulejo', 'carpete', 'mosaico'];
  function temaPadrao(m, i) {
    var cores = (m.lugar && m.lugar.cores) || {};
    return {
      paredeLarga: { tipo: 'mapa-parede' }, paredeEstreita: { tipo: 'cartaz' },
      a: { tipo: 'planta-alta' }, b: { tipo: 'castelo-pergaminhos' }, c: { tipo: 'pilha-livros' }, d: { tipo: 'globo' },
      cor: cores.detalhe || '#6fdc8c', piso: PISOS_PADRAO[i % PISOS_PADRAO.length], parede: 'pedra',
      paleta: { parede: cores.parede || '#f4eee0', rodape: cores.detalhe || '#6b5a4a' },
    };
  }
  // "Ala da História", "Ala do Inglês"
  function artigo(nome) {
    var n = String(nome).toLowerCase();
    if (/as$/.test(n)) return 'das';
    if (/os$/.test(n)) return 'dos';
    return /a$/.test(n) ? 'da' : 'do';
  }
  // cavaleiro da matéria: do elenco, ou o padrão (armadura genérica, voz da narradora)
  function cavaleiro(m, x, y, cor) {
    var acao = { tipo: 'treino', materia: m.id }, id = cavaleiroDoElenco(m.id);
    if (id) return npc(id, x, y, acao);
    return { id: 'cav-' + m.id, nome: 'Cavaleiro do Reino', voz: 'npc-padrao-1', x: x, y: y, acao: acao, falas: F.cavaleiro || {},
      sprite: { base: 'pessoa', pele: '#e0ac86', cabelo: '#5a3825', penteado: 'curto', chapeu: 'elmo', armadura: true, roupa: cor, cor2: C.ouro } };
  }

  // GERADOR: uma ala 11×11 para a matéria m (i = posição em Reino.materias), com o canto em (ox, oy).
  // Fileiras 6 e 7 ficam livres de ponta a ponta (a porta do salão entra por uma delas).
  function gerarAla(m, i, ox, oy) {
    var t = TEMAS[m.id] || temaPadrao(m, i);
    function peca(p, x, y) { return Object.assign({}, p, { x: x, y: y }); }
    var objetos = sala(ox, oy, [
      // parede do fundo
      { tipo: 'vitral', x: 0, y: 0 }, { tipo: 'estandarte', x: 1, y: 0, var: { cor: t.cor, emblema: 'estrela' } },
      { tipo: 'castelo-escudo', x: 2, y: 0, var: { cor: t.cor } }, peca(t.paredeLarga, 3, 0),
      { tipo: 'arandela', x: 5, y: 0 }, { tipo: 'castelo-escudo', x: 6, y: 0, var: { cor: '#ff5c6a' } },
      peca(t.paredeEstreita, 7, 0), { tipo: 'estandarte', x: 8, y: 0, var: { cor: t.cor, emblema: 'coracao' } },
      { tipo: 'vitral', x: 9, y: 0 }, { tipo: 'arandela', x: 10, y: 0 },
      // metade de cima: armas de treino e o tema
      { tipo: 'castelo-armadura', x: 0, y: 2, var: { pluma: t.cor } }, { tipo: 'castelo-suporte-espadas', x: 2, y: 2 },
      peca(t.a, 5, 2), { tipo: 'castelo-candelabro', x: 7, y: 2 }, { tipo: 'caixote', x: 9, y: 2 }, { tipo: 'barril', x: 10, y: 2 },
      { tipo: 'castelo-boneco', x: 1, y: 4 }, { tipo: 'castelo-alvo', x: 4, y: 4 },
      peca(t.b, 8, 4), { tipo: 'castelo-feno', x: 10, y: 4 },
      { tipo: 'tapete', x: 5, y: 5, w: 3, h: 1, var: { cor: t.cor, borda: C.ouro } },
      // metade de baixo (depois do corredor das fileiras 6 e 7)
      { tipo: 'banco', x: 0, y: 8 }, { tipo: 'castelo-feno', x: 4, y: 8 }, peca(t.d, 7, 8), { tipo: 'balde', x: 10, y: 8 },
      { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'cesto', x: 2, y: 10 }, peca(t.c, 5, 10),
      { tipo: 'castelo-alvo', x: 7, y: 10 }, { tipo: 'castelo-candelabro', x: 8, y: 10 }, { tipo: 'castelo-armadura', x: 10, y: 10, var: { pluma: t.cor } },
    ]);
    return {
      comodo: { id: 'ala-' + m.id, nome: 'Ala ' + artigo(m.nome) + ' ' + m.nome, placa: 'Ala ' + artigo(m.nome) + ' ' + m.nome,
        rect: { x: ox, y: oy, w: 11, h: 11 }, piso: t.piso, parede: t.parede, paleta: t.paleta },
      objetos: objetos,
      npc: cavaleiro(m, ox + 6, oy + 4, t.cor),
    };
  }

  /* ================= LAYOUT ================= */
  // salão do trono na coluna do meio (x 13..25); alas à esquerda (x 1..11) e à direita (x 27..37),
  // duas por andar de 12 fileiras; o salão cresce para baixo quando há mais de duas matérias.
  var mats = R.materias || [];
  var andares = Math.max(1, Math.ceil(mats.length / 2));
  var SX = 13, SW = 13, SH = 12 * andares - 1;
  var baixo = SH - 1;   // última fileira do salão (local)

  var objetos = sala(SX, 1, [
    /* ---------- SALÃO DO TRONO: parede ---------- */
    { tipo: 'vitral', x: 0, y: 0 },
    inter('tapecaria', 'Plano da Prova', { tipo: 'castelo-tapecaria', x: 2, y: 0, acao: { tipo: 'tela', tela: 'plano' } }),
    { tipo: 'estandarte', x: 4, y: 0, var: { cor: '#ff8a3d', emblema: 'estrela' } },
    { tipo: 'vitral', x: 5, y: 0 }, { tipo: 'castelo-brasao', x: 6, y: 0 }, { tipo: 'vitral', x: 7, y: 0 },
    { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#8a5cff', emblema: 'estrela' } }, { tipo: 'arandela', x: 9, y: 0 },
    { tipo: 'castelo-escudo', x: 10, y: 0, var: { cor: '#ff8a3d' } }, { tipo: 'vitral', x: 11, y: 0 },
    { tipo: 'estandarte', x: 12, y: 0, var: { cor: '#ff8a3d', emblema: 'coracao' } },
    /* ---------- chão de cima ---------- */
    inter('lareira', 'Lareira', { tipo: 'lareira', x: 0, y: 2 }),
    { tipo: 'castelo-candelabro', x: 4, y: 2 }, { tipo: 'castelo-trono', x: 5, y: 2 }, { tipo: 'castelo-candelabro', x: 8, y: 2 },
    inter('medalhas', 'Estante de medalhas', { tipo: 'castelo-estante-medalhas', x: 9, y: 2 }),
    { tipo: 'castelo-armadura', x: 12, y: 2 },
    { tipo: 'castelo-armadura', x: 0, y: 4 }, { tipo: 'banco', x: 1, y: 4, var: { cor: '#e060a0' } },
    { tipo: 'banco', x: 9, y: 4, var: { cor: '#e060a0' } }, { tipo: 'vaso-planta', x: 8, y: 5 }, { tipo: 'castelo-armadura', x: 12, y: 4 },
    { tipo: 'castelo-tapete-real', x: 5, y: 4, w: 3, h: baixo - 5 },
    /* ---------- chão de baixo (depois do corredor das portas) ---------- */
    { tipo: 'vaso-grande', x: 0, y: 8 }, { tipo: 'castelo-candelabro', x: 2, y: 8 }, { tipo: 'flores', x: 4, y: 8 },
    { tipo: 'flores', x: 8, y: 8 }, { tipo: 'castelo-candelabro', x: 10, y: 8 }, { tipo: 'vaso-grande', x: 12, y: 8 },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'cesto', x: 3, y: 10 },
    { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'banco', x: 10, y: 10 }, { tipo: 'barril', x: 12, y: 10 },
  ]);
  // blocos extras do salão (3+ matérias): guarda de honra ao longo do tapete
  for (var k = 1; k < andares; k++) {
    var b = 12 * k;   // fileira local onde começa o andar k (a porta dele fica em b+6 e b+7)
    objetos = objetos.concat(sala(SX, 1, [
      { tipo: 'castelo-armadura', x: 0, y: b }, { tipo: 'castelo-candelabro', x: 3, y: b }, { tipo: 'castelo-candelabro', x: 9, y: b }, { tipo: 'castelo-armadura', x: 12, y: b },
      { tipo: 'planta-alta', x: 0, y: b + 3 }, { tipo: 'banco', x: 2, y: b + 3 }, { tipo: 'banco', x: 9, y: b + 3 }, { tipo: 'planta-alta', x: 12, y: b + 3 },
      { tipo: 'vaso-grande', x: 1, y: b + 5 }, { tipo: 'vaso-grande', x: 11, y: b + 5 },
      { tipo: 'barril', x: 0, y: b + 9 }, { tipo: 'castelo-candelabro', x: 3, y: b + 9 }, { tipo: 'castelo-candelabro', x: 9, y: b + 9 }, { tipo: 'bau', x: 12, y: b + 9 },
    ]));
  }

  var comodos = [
    { id: 'salao', nome: 'Salão do Trono', placa: 'Salão do Trono', rect: { x: SX, y: 1, w: SW, h: SH },
      piso: 'mosaico', parede: 'pedra', paleta: { piso: '#fff1d0', piso2: '#f0c890', detalhe: '#ff8a3d', parede: '#ffe4b8', parede2: '#f0d0a0', rodape: '#8a5cff' } },
  ];
  var portas = [], corredores = [
    { x: SX + 5, y: 5, w: 3, h: SH - 4 },   // tapete vermelho, da saída ao trono
  ];
  var npcs = [npc('serena', SX + 4, 5, { tipo: 'guia', lugar: 'castelo' })];

  mats.forEach(function (m, i) {
    var andar = Math.floor(i / 2), dir = i % 2 === 1, oy = 1 + 12 * andar;
    var ox = dir ? SX + SW + 1 : 1;
    var ala = gerarAla(m, i, ox, oy);
    comodos.push(ala.comodo);
    objetos = objetos.concat(ala.objetos);
    npcs.push(ala.npc);
    portas.push({ x: dir ? SX + SW : SX - 1, y: oy + 6, w: 1, h: 2 });
    corredores.push({ x: ox, y: oy + 6, w: 11, h: 2 });
  });
  // fileiras das portas também no salão
  for (var a = 0; a < andares; a++) corredores.push({ x: SX, y: 7 + 12 * a, w: SW, h: 2 });

  // estante com a melhor medalha de cada matéria (ou o suporte vazio), derivada do progresso
  function melhores(P) {
    var est = (P && P.estado) ? P.estado() : null;
    return mats.map(function (m) { var tr = est && est.treinos && est.treinos[m.id]; return (tr && tr.melhor) || ''; });
  }
  I.objeto('castelo-estante-medalhas', { w: 3, h: 1, topo: 18, solido: true,
    chave: function (P) { return melhores(P).join(','); },
    desenhar: function (ctx, px, py, o, P) {
      var W = 48, lista = melhores(P);
      ret(ctx, px + 1, py - 18, W - 2, 33, K); ret(ctx, px + 2, py - 17, W - 4, 31, C.madeira2);
      ret(ctx, px + 4, py - 15, W - 8, 13, '#6b2a4a'); ret(ctx, px + 4, py + 1, W - 8, 11, '#6b2a4a');
      ret(ctx, px + 2, py - 2, W - 4, 3, C.madeira); ret(ctx, px + 2, py - 2, W - 4, 1, C.madeiraClara);
      ret(ctx, px + 2, py - 17, W - 4, 1, C.madeiraClara);
      // prateleira de cima: uma vaga por matéria
      var n = Math.max(1, lista.length), passo = (W - 10) / n;
      lista.forEach(function (tipo, i) {
        var cx = Math.round(px + 5 + passo * (i + 0.5));
        if (tipo) medalha(ctx, cx, py - 7, tipo);
        else { ret(ctx, cx - 3, py - 5, 7, 2, '#9a7a8a'); ret(ctx, cx, py - 11, 1, 6, '#9a7a8a'); ret(ctx, cx - 1, py - 11, 3, 1, '#9a7a8a'); }
        ret(ctx, cx - 3, py - 3, 7, 1, C.ouro2);
      });
      // embaixo: taças e rosetas de enfeite
      matriz(ctx, px + 8, py + 3, ['yyyyy', '.yyy.', '..y..', '.yyy.'], { y: C.ouro });
      matriz(ctx, px + 35, py + 3, ['yyyyy', '.yyy.', '..y..', '.yyy.'], { y: C.ouro });
      circulo(ctx, px + 24, py + 6, 3, '#ff5c6a'); circulo(ctx, px + 24, py + 6, 1, C.ouro3);
    } });

  var saida = { x: SX + 6, y: 1 + baixo };
  Reino.registrarInterior({
    id: 'castelo',
    lugar: 'castelo',
    nome: 'Castelo da Medalha',
    entrada: true,
    pacote: 'interior-castelo',
    tamanho: { w: SX + SW + 1 + 11 + 1, h: 1 + SH + 1 },
    saida: saida,
    spawn: { x: saida.x, y: saida.y - 1 },
    comodos: comodos,
    portas: portas,
    corredores: corredores,
    objetos: objetos,
    npcs: npcs,
  });
  // para testes e para a Fase 5
  I.castelo = { gerarAla: gerarAla, TEMAS: TEMAS, CAVALEIROS: CAVALEIROS };
})();
