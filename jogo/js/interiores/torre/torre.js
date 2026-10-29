/* Torre do Relógio: a torre inteira é do English do 4º bimestre (docs/contratos/quarto-bimestre.md §7), a partir do
   térreo: o saguão (o Seu Ponteiro, os dois livros e o quadro dos andares), um andar por capítulo, na ordem do livro
   (English 11 e 12; Projetos 11 e 12), e o mecanismo do relógio no alto. Entra-se pela porta do mapa; sai-se
   pelo tapete do térreo.
   As estações das salas são GERADAS DOS DADOS: cada sala de Reino.materia('ingles4').salas vai para a vaga do andar
   do seu capítulo e livro, na ordem do livro; vaga sem sala vira enfeite. Objetos em torre/objetos*.js e
   torre/en-objetos.js (a estação), falas em torre/falas.js; o anfitrião de cada andar é um NPC do elenco.
   O layout do 3º bimestre (um andar por sala i1–i5) está em arquivo/terceiro-bimestre/jogo/js/interiores/torre/torre.js. */
(function () {
  var R = window.Reino;
  var MAT = 'ingles4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) a torre não tem andares; a fixture histórica dos testes
  // carrega o layout arquivado no lugar deste arquivo
  if (!M) return;
  var C = R.Interiores.desenho.C;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.torre) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.torre;
  var BRONZE = S.BRONZE, BRONZE2 = S.BRONZE2, LIVROS = S.LIVROS;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do andar (0..10 × 0..10; fileiras 0 e 1 são a parede); o cômodo começa em (1,1)
  function sala(lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + 1; n.y = o.y + 1; return n; });
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
      voz: e.voz || 'npc-' + id, x: x + 1, y: y + 1, acao: acao, falas: F.npcs[id] || {} };
  }
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };
  function cartaz(x, icone, cor, faixa) { return { tipo: 'torre-cartaz', x: x, y: 0, var: { icone: icone, cor: cor, faixa: faixa } }; }

  /* ================= ESTAÇÕES (das salas da matéria) ================= */
  // um andar por capítulo, na ordem do livro (andar 1 = CAPITULOS[0]…)
  var CAPITULOS = [{ livro: 'english', cap: 11 }, { livro: 'english', cap: 12 },
    { livro: 'projetos', cap: 11 }, { livro: 'projetos', cap: 12 }];
  // as vagas de cada andar, na ordem do livro: dos dois lados do corredor do meio, de cima para baixo
  // (o tile de cima de cada vaga fica sem móvel: a estação é alta)
  var LUGARES = [[3, 3], [7, 3], [3, 7], [7, 7]];
  function salasDo(c) { return M.salas.filter(function (s) { return s.capitulo === c.cap && s.livroOrigem === c.livro; }); }
  M.salas.forEach(function (s) {
    if (!CAPITULOS.some(function (c) { return c.cap === s.capitulo && c.livro === s.livroOrigem; })) {
      throw new Error('torre: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem andar na Torre do Relógio (torre/torre.js, CAPITULOS)');
    }
  });
  CAPITULOS.forEach(function (c) {
    var n = salasDo(c).length;
    if (n > LUGARES.length) throw new Error('torre: o capítulo ' + c.cap + ' do livro "' + c.livro + '" tem ' + n +
      ' salas, mas o andar só tem ' + LUGARES.length + ' vagas (torre/torre.js, LUGARES)');
  });
  // "pp. 134 a 137" → "Páginas 134 a 137"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 134 a 137: A Happy Day."; se não couber numa página, só a página
  // (o nome da sala já está no título do balão)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…»]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.replace(/[«»]/g, '').length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  // as estações do andar i (1..4); vaga sem sala: o enfeite do andar (nunca uma estação vazia)
  function estacoes(i, enfeite) {
    var c = CAPITULOS[i - 1], ss = salasDo(c);
    return LUGARES.map(function (p, k) {
      var s = ss[k], o = { x: p[0], y: p[1] };
      if (!s) return Object.assign(o, { tipo: 'pedestal', var: { item: enfeite } });
      return Object.assign(o, { tipo: 'torre-estacao', chave: 'en-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: c.livro, pagina: primeiraPagina(s.paginas) } });
    });
  }

  /* ================= O ESQUELETO DOS ANDARES ================= */
  // todos os andares têm o mesmo esqueleto: 13×13, um cômodo 11×11 em (1,1);
  // sobe no fundo à direita (10,3) e desce no chão à esquerda (2,10); corredor no meio.
  // Quem desce chega à esquerda do arco (9,3); quem sobe, à direita do vão (3,10) (`chegar`)
  var ANDARES = ['torre', 'torre-1', 'torre-2', 'torre-3', 'torre-4', 'torre-relogio'];
  var SOBE = { x: 10, y: 3 }, DESCE = { x: 2, y: 10 };
  function escadas(i) {
    var e = [];
    if (i < ANDARES.length - 1) e.push({ x: SOBE.x, y: SOBE.y, para: ANDARES[i + 1], chegar: { x: -1, y: 0 }, olhar: { x: 1, y: 0 }, sentido: 'sobe' });
    if (i > 0) e.push({ x: DESCE.x, y: DESCE.y, para: ANDARES[i - 1], chegar: { x: 1, y: 0 }, olhar: { x: 0, y: 1 }, sentido: 'desce' });
    return e;
  }
  function andar(i, nome, comodo, objetos, npcs, extra) {
    // acima do térreo, o spawn é a chegada pela escada de baixo (à direita do vão): onde o irPara sem
    // chegada e as fotos do e2e a põem (sem ele, cairia em cima de quem estiver no tile padrão)
    var chegadaDeBaixo = i > 0 ? { spawn: { x: DESCE.x + 1, y: DESCE.y } } : {};
    Reino.registrarInterior(Object.assign(chegadaDeBaixo, {
      id: ANDARES[i],
      lugar: 'materia:ingles',
      nome: nome,
      pacote: 'interior-torre',
      tamanho: { w: 13, h: 13 },
      escadas: escadas(i),
      comodos: [Object.assign({ id: 'andar', nome: nome, rect: { x: 1, y: 1, w: 11, h: 11 } }, comodo)],
      corredores: [{ x: 5, y: 3, w: 3, h: 9 }, { x: 8, y: 3, w: 2, h: 1 }, { x: 3, y: 10, w: 2, h: 1 }],
      objetos: sala(objetos),
      // + os registrados com predio: o id do andar ('torre', 'torre-1'…) e x/y do interior (npc() soma 1: tira aqui)
      npcs: npcs.concat(R.personagensDoPredio(ANDARES[i]).filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
        return npc(p.id, p.x - 1, p.y - 1, p.acao || GUIA);
      })),
    }, extra || {}));
  }
  // um andar de capítulo: o anfitrião no meio da fileira das estações da esquerda
  function andarDoCapitulo(i, nome, comodo, objetos, anfitriao, enfeite) {
    andar(i, nome, comodo, objetos.concat(estacoes(i, enfeite)), [npc(anfitriao, 3, 5, GUIA)]);
  }
  S.andarDoCapitulo = andarDoCapitulo;

  /* ---------- TÉRREO: o saguão do English, na oficina do relojoeiro (pedra e bronze) ---------- */
  // as cores do quadro dos andares: a parede de cada andar, do térreo ao relógio
  var CORES_ANDARES = ['#d9a86a', '#ffb070', '#efe2fb', '#fff3e6', '#e6f6ff', BRONZE];
  andar(0, 'Torre do Relógio', {
    placa: 'Térreo • English', piso: 'pedra', parede: 'madeira',
    paleta: { piso: '#e8dcc8', piso2: '#c9b48f', parede: '#d9a86a', parede2: '#b9824a', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('andares', 'Quadro dos andares', { tipo: 'torre-andares', x: 1, y: 0, var: { cores: CORES_ANDARES } }),
    { tipo: 'estandarte', x: 3, y: 0, var: { cor: '#d23c9b', emblema: 'estrela' } },
    { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
    cartaz(7, 'relogio', '#fff3d6', BRONZE), { tipo: 'cortina', x: 8, y: 0, var: { cor: '#d23c9b' } }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'torre-caixa-pecas', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'torre-blocos-abc', x: 3, y: 2 },
    inter('livro-english', 'Livro do English', { tipo: 'torre-pulpito', x: 0, y: 4, var: { cor: LIVROS.english.capa },
      acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'english' } }),
    inter('livro-projetos', 'Livro dos Projetos', { tipo: 'torre-pulpito', x: 2, y: 4, var: { cor: LIVROS.projetos.capa },
      acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'projetos' } }),
    { tipo: 'torre-tapete-palavras', x: 1, y: 5, w: 2, h: 2, var: { palavra: 'TICK', cor: '#ffc2e4' } },
    { tipo: 'pilha-livros', x: 0, y: 6 }, { tipo: 'torre-engrenagens', x: 0, y: 8 }, { tipo: 'torre-caixa-pecas', x: 3, y: 8 },
    { tipo: 'tapete-listrado', x: 0, y: 9, w: 3, h: 1, var: { cores: ['#d23c9b', '#fff8ee', '#2f9f8f', '#fff8ee'] } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'relogio' } }, { tipo: 'torre-mochila', x: 2, y: 10 }, { tipo: 'torre-blocos-abc', x: 3, y: 10 },
    { tipo: 'torre-relogio-sol', x: 10, y: 2 },
    inter('engrenagens', 'Bancada de engrenagens', { tipo: 'torre-engrenagens', x: 8, y: 4 }),
    inter('relogio-grande', 'Relógio de pé', { tipo: 'relogio-pe', x: 10, y: 4 }),
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#ffd9a0', borda: BRONZE } },
    { tipo: 'globo', x: 10, y: 7 }, { tipo: 'cadeira', x: 7, y: 8, var: { almofada: '#d23c9b' } },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#fff3d6', itens: ['relogio', 'xicara'] } },
    { tipo: 'torre-caixa-pecas', x: 7, y: 10 }, { tipo: 'caixote', x: 8, y: 10, var: { item: 'moedas' } },
    { tipo: 'torre-blocos-abc', x: 10, y: 10 },
  ], [
    npc('ponteiro', 3, 5, GUIA),
  ], { entrada: true, saida: { x: 6, y: 11 }, spawn: { x: 6, y: 10 } });

  // os andares de 1 a 5 (torre/en-andares.js) e o mecanismo no alto (andar 6, sem personagem)
  S.andar = andar; S.inter = inter; S.cartaz = cartaz;
})();
