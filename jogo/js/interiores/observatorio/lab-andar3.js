/* Laboratório de Ciências: o 3º andar do Observatório é da Ciências da Natureza do 4º bimestre (lugar materia:ciencias;
   docs/contratos/quarto-bimestre.md §7). Tema do bimestre: as plantas.
   Planta (49×25), quatro colunas de cômodos 11×11. Embaixo: a galeria do capítulo 10 | o hall | as galerias dos
   capítulos 11 e 12 (Livro de Aprendizagem, verde). Em cima de cada galeria, a estufa do mesmo capítulo (Livro de
   Atividades, amarelo); em cima do hall, a Sala das Experiências (os mini-jogos e as experiências do laboratório).
   Portas largas entre vizinhos e uma cruz de corredores em cada cômodo: do hall se chega a tudo, sem beco.
   Sem porta para o mapa: ela chega pelo menu Lugares (no spawn) ou subindo do 2º andar; sai pela escada que desce.
   As estações das salas são GERADAS DOS DADOS: cada sala de Reino.materia('ciencias4').salas vai para a vaga da
   galeria ou da estufa do seu capítulo e livro, na ordem do livro; vaga sem sala vira enfeite; sala sem lugar ou
   capítulo com sala demais = erro na carga. O anfitrião de cada capítulo fica na galeria dele.
   Objetos novos em ci-objetos.js, enfeites dos capítulos em ci-comodos.js, falas e pessoas em lab-falas.js.
   O layout do 3º bimestre (salas c1–c5) está em arquivo/terceiro-bimestre/jogo/js/interiores/observatorio/lab-andar3.js. */
(function () {
  var R = window.Reino;
  var MAT = 'ciencias4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) o laboratório não tem andar; a fixture histórica dos
  // testes carrega o layout arquivado no lugar deste arquivo
  if (!M) return;
  var S = R._predios.observatorio;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.observatorio) || { npcs: {}, objetos: {} };
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
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };
  function cartaz(x, desenho, faixa) { return { tipo: 'lab-cartaz', x: x, y: 0, var: { desenho: desenho, faixa: faixa } }; }
  function quadro(x, desenho) { return { tipo: 'lab-quadro', x: x, y: 0, var: { desenho: desenho } }; }

  /* ================= ESTAÇÕES (das salas da matéria) ================= */
  // cada capítulo é uma coluna: a galeria embaixo (y 13) e a estufa em cima (y 1)
  var COLUNA = { 10: 1, 11: 25, 12: 37 };
  var CAPITULOS = [10, 11, 12];
  var COMODO = { aprendizagem: { nome: 'galeria', oy: 13 }, atividades: { nome: 'estufa', oy: 1 } };
  // as vagas de cada cômodo, na ordem do livro: as quatro de cima, dos dois lados da cruz, e as duas de baixo
  var VAGAS = [[1, 4], [3, 4], [7, 4], [9, 4], [3, 8], [7, 8]];
  function salasDo(cap, livro) { return M.salas.filter(function (s) { return s.capitulo === cap && s.livroOrigem === livro; }); }
  M.salas.forEach(function (s) {
    if (CAPITULOS.indexOf(s.capitulo) < 0 || !COMODO[s.livroOrigem]) {
      throw new Error('observatorio: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem lugar no Laboratório de Ciências (observatorio/lab-andar3.js, CAPITULOS)');
    }
  });
  CAPITULOS.forEach(function (cap) {
    Object.keys(COMODO).forEach(function (livro) {
      var n = salasDo(cap, livro).length;
      if (n > VAGAS.length) throw new Error('observatorio: o capítulo ' + cap + ' tem ' + n + ' salas do livro "' + livro +
        '", mas a ' + COMODO[livro].nome + ' só tem ' + VAGAS.length + ' vagas (observatorio/lab-andar3.js, VAGAS)');
    });
  });
  // "pp. 134 a 137" → "Páginas 134 a 137"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 134 a 137: As plantas."; se não couber numa página, só a página
  // (o nome da sala já está no título do balão)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…»]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.replace(/[«»]/g, '').length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  // vaga sem sala: um enfeite (nunca uma estação vazia)
  var ENFEITE = { aprendizagem: { tipo: 'pedestal', var: { item: 'vaso' } }, atividades: { tipo: 'vaso-planta' } };
  // as estações do cômodo do capítulo e livro, em coordenadas do interior
  function estacoes(cap, livro) {
    var ss = salasDo(cap, livro), ox = COLUNA[cap], oy = COMODO[livro].oy;
    return VAGAS.map(function (p, i) {
      var s = ss[i], o = { x: ox + p[0], y: oy + p[1] };
      if (!s) return Object.assign(o, ENFEITE[livro]);
      return Object.assign(o, { tipo: 'ci-estacao', chave: 'ci-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: livro, pagina: primeiraPagina(s.paginas) } });
    });
  }

  /* ================= LAYOUT ================= */
  var CI = S.ci.comodos(inter);
  var objetos = [].concat(
    /* ---------- HALL: Laboratório de Ciências (branco, verde-água e amarelo) ---------- */
    // a porta de cima corta a parede em 4 a 6; os livros à esquerda, o mapa à direita, a escada que desce em (5,10)
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'atomo'), quadro(2, 'seres'), quadro(7, 'mapa'),
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      // a parede é toda enfeitada: na fileira 2 só coisa baixa; a fileira 3 fica livre (atrás dos livros e do mapa)
      { tipo: 'bau', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'lab-bancada', x: 2, y: 2, var: { itens: 'frascos' } },
      { tipo: 'flores', x: 7, y: 2, var: { vaso: AGUA } }, { tipo: 'caixote', x: 8, y: 2, var: { item: 'planta' } },
      { tipo: 'cesto', x: 9, y: 2 }, { tipo: 'vaso-grande', x: 10, y: 2, var: { cor: AGUA, faixa: '#d9fff4' } },   // var própria: sem ela o kit cola no vaso da Geografia
      { tipo: 'globo', x: 0, y: 4 },
      inter('ci-livro-aprendizagem', 'Livro de Aprendizagem', { tipo: 'ci-pulpito', x: 1, y: 4, var: { livro: 'aprendizagem' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'aprendizagem' } }),
      { tipo: 'flores', x: 2, y: 4 },
      inter('ci-livro-atividades', 'Livro de Atividades', { tipo: 'ci-pulpito', x: 3, y: 4, var: { livro: 'atividades' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'atividades' } }),
      { tipo: 'pilha-livros', x: 7, y: 4 },
      inter('ci-mapa', 'Mapa do laboratório', { tipo: 'ci-mapa', x: 8, y: 4 }), { tipo: 'cabideiro', x: 10, y: 4 },
      { tipo: 'tapete-listrado', x: 0, y: 6, w: 3, h: 1, var: { cores: [AGUA, '#f4fbff', AMARELO, '#f4fbff'] } },
      { tipo: 'tapete-listrado', x: 8, y: 6, w: 3, h: 1, var: { cores: [AGUA, '#f4fbff', AMARELO, '#f4fbff'] } },
      { tipo: 'planta-alta', x: 0, y: 8 }, { tipo: 'poltrona', x: 1, y: 8 }, { tipo: 'mesa-centro', x: 2, y: 8 },
      { tipo: 'relogio-pe', x: 9, y: 8 }, { tipo: 'vaso-grande', x: 10, y: 8 },
      { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'balde', x: 1, y: 9 }, { tipo: 'cesto', x: 2, y: 9 },
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#dff6f2', itens: ['livro', 'xicara'] } }, { tipo: 'caixote', x: 10, y: 9, var: { item: 'planta' } },
      // o vão da escada que desce fica em (5, 10): nada em cima dele
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'flores', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      { tipo: 'vaso-planta', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 }, { tipo: 'cesto', x: 10, y: 10 },
    ]),
    /* ---------- SALA DAS EXPERIÊNCIAS (em cima do hall): microscópio, tubos e bancadas ---------- */
    // a fileira 3 fica livre (chega-se a ela por (5,4)); na fileira 2 só coisa baixa
    sala(13, 1, [
      { tipo: 'janela', x: 0, y: 0 }, cartaz(1, 'atomo'), quadro(2, 'memoria'), { tipo: 'quimica-ciclo-agua', x: 4, y: 0 },
      { tipo: 'relogio-parede', x: 6, y: 0 }, cartaz(7, 'abelha', AMARELO), { tipo: 'prateleira-parede', x: 8, y: 0 },
      { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'lab-bancada', x: 0, y: 2, var: { itens: 'frascos' } }, { tipo: 'cesto', x: 2, y: 2 }, { tipo: 'lab-pedras', x: 3, y: 2 },
      { tipo: 'quimica-vidrarias', x: 4, y: 2 }, { tipo: 'lab-bancada', x: 7, y: 2, var: { itens: 'pedras' } },
      { tipo: 'balde', x: 9, y: 2 }, { tipo: 'barril', x: 10, y: 2 },
      { tipo: 'lab-armario-vidro', x: 0, y: 4 }, { tipo: 'quimica-banqueta', x: 1, y: 4 },
      inter('lab-minijogos', 'Mini-jogos de Ciências', { tipo: 'lab-microscopio', x: 2, y: 4, voz: 'narradora', acao: { tipo: 'tela', tela: 'laboratorio-jogos' } }),
      { tipo: 'lab-formigueiro', x: 3, y: 4 }, { tipo: 'lab-agua', x: 4, y: 4 }, { tipo: 'quimica-atomo', x: 6, y: 4 },
      { tipo: 'lab-termometro', x: 7, y: 4 },
      inter('lab-experiencias', 'Experiências de Ciências', { tipo: 'lab-tubos', x: 8, y: 4, voz: 'narradora', acao: { tipo: 'tela', tela: 'laboratorio-atividades' } }),
      { tipo: 'globo', x: 9, y: 4 }, { tipo: 'planta-alta', x: 10, y: 4 },
      { tipo: 'tapete-listrado', x: 0, y: 6, w: 3, h: 1, var: { cores: [AGUA, '#f4fbff', AMARELO, '#f4fbff'] } },
      { tipo: 'tapete-listrado', x: 8, y: 6, w: 3, h: 1, var: { cores: [AGUA, '#f4fbff', AMARELO, '#f4fbff'] } },
      // Lupa em (2,8) e Ravi em (8,8); o meio de baixo (4 a 6) é o corredor até a porta do hall
      { tipo: 'quimica-lupas', x: 0, y: 8 }, { tipo: 'lab-broto', x: 3, y: 8 }, { tipo: 'vaso-planta', x: 7, y: 8 },
      { tipo: 'lab-bancada', x: 9, y: 8, var: { itens: 'vasos' } },
      { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'ci-sementes', x: 1, y: 9 }, { tipo: 'cesto', x: 2, y: 9 },
      { tipo: 'tapete', x: 7, y: 9, w: 2, h: 1, var: { cor: '#bff0ea', borda: AGUA } }, { tipo: 'caixote', x: 9, y: 9, var: { item: 'estrela' } },
      { tipo: 'vaso-grande', x: 10, y: 9 },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'flores', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      { tipo: 'flores', x: 7, y: 10, var: { vaso: AGUA } }, { tipo: 'cabideiro', x: 8, y: 10 }, { tipo: 'caixote', x: 9, y: 10 },
      { tipo: 'cesto', x: 10, y: 10 },
    ]),
    /* ---------- OS CAPÍTULOS: galeria (embaixo) e estufa (em cima), enfeites em ci-comodos.js ---------- */
    sala(1, 13, CI.galeria10), sala(1, 1, CI.estufa10),
    sala(25, 13, CI.galeria11), sala(25, 1, CI.estufa11),
    sala(37, 13, CI.galeria12), sala(37, 1, CI.estufa12),
    estacoes(10, 'aprendizagem'), estacoes(10, 'atividades'),
    estacoes(11, 'aprendizagem'), estacoes(11, 'atividades'),
    estacoes(12, 'aprendizagem'), estacoes(12, 'atividades')
  );

  // as paletas: hall branco e verde-água; galerias verdes (Aprendizagem); estufas amarelas (Atividades)
  var HALL = { piso: '#f4fbff', piso2: '#bff0ea', detalhe: AGUA, parede: '#f4fbff', parede2: '#d6eef8', rodape: '#1f9a92' };
  var GALERIA = { piso: '#f4fff0', piso2: '#cfeec4', detalhe: '#3fae5a', parede: '#f8fff4', parede2: '#d8f0cc', rodape: '#2a7a3e' };
  var ESTUFA = { piso: '#fff6dc', piso2: '#ecdca8', detalhe: '#f0b020', parede: '#eaf8ff', parede2: '#fff0c8', rodape: '#b07a10' };
  function comodo(id, nome, placa, x, y, piso, parede, paleta) {
    return { id: id, nome: nome, placa: placa, rect: { x: x, y: y, w: 11, h: 11 }, piso: piso, parede: parede, paleta: paleta };
  }

  // escada que desce ao 2º andar (vão no chão do Hall): quem sobe de lá chega logo acima do vão (18, 22)
  R.registrarInterior({
    id: 'observatorio-3',
    lugar: 'materia:ciencias',
    nome: 'Laboratório de Ciências',
    entrada: true,
    pacote: 'interior-observatorio',
    tamanho: { w: 49, h: 25 },
    spawn: { x: 18, y: 22 },
    escadas: [{ x: 18, y: 23, para: 'observatorio-2', chegar: { x: 0, y: -1 }, olhar: { x: 0, y: 1 }, sentido: 'desce' }],
    comodos: [
      comodo('hall', 'Hall', 'Hall • Laboratório de Ciências', 13, 13, 'mosaico', 'azulejo', HALL),
      comodo('experiencias', 'Sala das Experiências', 'Sala das Experiências', 13, 1, 'mosaico', 'azulejo',
        Object.assign({}, HALL, { piso2: '#d6eef8', parede2: '#bff0ea' })),
      comodo('galeria10', 'Conhecendo as plantas', 'Cap. 10 • Conhecendo as plantas', 1, 13, 'azulejo', 'azulejo', GALERIA),
      comodo('estufa10', 'Estufa do capítulo 10', 'Cap. 10 • Estufa das Atividades', 1, 1, 'tabuas', 'papel', ESTUFA),
      comodo('galeria11', 'As partes das plantas', 'Cap. 11 • As partes das plantas', 25, 13, 'azulejo', 'azulejo', GALERIA),
      comodo('estufa11', 'Estufa do capítulo 11', 'Cap. 11 • Estufa das Atividades', 25, 1, 'tabuas', 'papel', ESTUFA),
      comodo('galeria12', 'As plantas se relacionam', 'Cap. 12 • As plantas se relacionam', 37, 13, 'azulejo', 'azulejo', GALERIA),
      comodo('estufa12', 'Estufa do capítulo 12', 'Cap. 12 • Estufa das Atividades', 37, 1, 'tabuas', 'papel', ESTUFA),
    ],
    portas: [
      { x: 12, y: 18, w: 1, h: 3 }, { x: 24, y: 18, w: 1, h: 3 }, { x: 36, y: 18, w: 1, h: 3 },   // galeria 10 ↔ hall ↔ galeria 11 ↔ galeria 12
      { x: 12, y: 6, w: 1, h: 3 }, { x: 24, y: 6, w: 1, h: 3 }, { x: 36, y: 6, w: 1, h: 3 },      // estufa 10 ↔ experiências ↔ estufa 11 ↔ estufa 12
      { x: 5, y: 12, w: 3, h: 3 }, { x: 17, y: 12, w: 3, h: 3 },                                 // estufa ↔ galeria; experiências ↔ hall
      { x: 29, y: 12, w: 3, h: 3 }, { x: 41, y: 12, w: 3, h: 3 },                                // (atravessam a parede do fundo de baixo)
    ],
    corredores: [
      { x: 1, y: 18, w: 47, h: 3 }, { x: 1, y: 6, w: 47, h: 3 },                                 // as fileiras das portas dos lados
      { x: 17, y: 15, w: 3, h: 9 },                                                              // o hall, da porta de cima à escada
      { x: 5, y: 15, w: 3, h: 3 }, { x: 29, y: 15, w: 3, h: 3 }, { x: 41, y: 15, w: 3, h: 3 },   // galerias: até a porta da estufa
      { x: 5, y: 9, w: 3, h: 3 }, { x: 17, y: 9, w: 3, h: 3 }, { x: 29, y: 9, w: 3, h: 3 }, { x: 41, y: 9, w: 3, h: 3 },   // de cima: até a porta de baixo
    ],
    objetos: objetos,
    npcs: [
      npc('lab-iris', 20, 21, GUIA),
      npc('lab-malu', 6, 21, GUIA),     // capítulo 10
      npc('lab-bento', 30, 21, GUIA),   // capítulo 11
      npc('lab-jana', 42, 21, GUIA),    // capítulo 12
      npc('lab-lupa', 15, 9, { tipo: 'tela', tela: 'laboratorio-jogos' }),
      npc('lab-ravi', 21, 9, { tipo: 'tela', tela: 'laboratorio-atividades' }),
    // + os registrados com predio: 'observatorio-3' e x/y (Reino.personagensDoPredio)
    ].concat(R.personagensDoPredio('observatorio-3').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || GUIA);
    })),
  });
})();
