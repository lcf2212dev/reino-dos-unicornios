/* Casa das Palavras: o térreo é da Língua Portuguesa do 4º bimestre (docs/contratos/quarto-bimestre.md §7), a casa
   dos dois livros da escola. Entra-se pela porta da casa no mapa e se sai pelo tapete do saguão.
   Planta (37×33): embaixo, o saguão (guia, mapa, os dois livros e o tapete de saída); no meio, uma galeria por
   capítulo (Livro de Aprendizagem, verde); em cima, o ateliê de cada capítulo (Livro de Atividades, amarelo). Portas
   largas entre vizinhos e corredores em cruz: do saguão se chega a tudo em poucos passos.
   As estações das salas são GERADAS DOS DADOS: cada sala de Reino.materia('portugues4').salas vai para a vaga do
   cômodo do seu capítulo e livro, na ordem do livro; vaga sem sala vira enfeite. Objetos em portugues/lp-objetos*.js,
   pessoas em portugues/lp-personagens.js, falas em portugues/lp-falas.js; a casa de fora, em portugues/fora.js.
   O layout do 3º bimestre (Cozinha, Horta, Circo, Porto e Parque) está em
   arquivo/terceiro-bimestre/jogo/js/interiores/portugues/portugues.js. */
(function () {
  var R = window.Reino;
  var MAT = 'portugues4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) a casa não tem térreo; a fixture histórica dos testes
  // carrega o layout arquivado no lugar deste arquivo
  if (!M) return;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC da casa com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };

  /* ================= ESTAÇÕES (das salas da matéria) ================= */
  // vagas em coordenadas locais, na ordem do livro: galeria (Aprendizagem) ao longo da cruz de corredores;
  // ateliê (Atividades) encostadas na parede do fundo, embaixo dos trechos de parede sem enfeite
  var VAGAS = { aprendizagem: [[1, 4], [3, 4], [7, 4], [9, 4], [1, 8], [3, 8], [7, 8]], atividades: [[3, 2], [5, 2], [7, 2]] };
  var CAPITULOS = [10, 11, 12];
  function salasDo(cap, livro) { return M.salas.filter(function (s) { return s.capitulo === cap && s.livroOrigem === livro; }); }
  M.salas.forEach(function (s) {
    if (CAPITULOS.indexOf(s.capitulo) < 0 || !VAGAS[s.livroOrigem]) {
      throw new Error('portugues: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem cômodo na Casa das Palavras (portugues/portugues.js)');
    }
  });
  CAPITULOS.forEach(function (cap) {
    Object.keys(VAGAS).forEach(function (livro) {
      var n = salasDo(cap, livro).length, max = VAGAS[livro].length;
      if (n > max) throw new Error('portugues: o capítulo ' + cap + ' tem ' + n + ' salas do livro "' + livro + '", mas ' +
        (livro === 'atividades' ? 'o ateliê' : 'a galeria') + ' só tem ' + max + ' vagas (portugues/portugues.js, VAGAS)');
    });
  });
  // "pp. 3 a 9" → "Páginas 3 a 9"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 3 a 9: O Gato de Botas."; se não couber numa página, só
  // "Páginas 11 a 13." (o nome da sala já está no título do balão: não se repete)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  var ENFEITE = {
    aprendizagem: function (i) { return { tipo: 'pedestal', var: { item: ['livro', 'estrela', 'coroa', 'vaso', 'ovo', 'pergaminho', 'globo'][i] } }; },
    atividades: function () { return { tipo: 'cavalete' }; },
  };
  function estacoes(cap, livro, ox, oy) {
    var ss = salasDo(cap, livro);
    return VAGAS[livro].map(function (p, i) {
      var s = ss[i], o = { x: ox + p[0], y: oy + p[1] };
      if (!s) return Object.assign(o, ENFEITE[livro](i));   // vaga sem sala: enfeite (nunca uma estação vazia)
      return Object.assign(o, { tipo: 'lp-estacao', chave: 'lp-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: livro, pagina: primeiraPagina(s.paginas) } });
    });
  }

  /* ================= LAYOUT ================= */
  // colunas 1 | 13 | 25; ateliês nas fileiras 1–9, galerias 11–21, saguão 23–31 (de ponta a ponta)
  // galeria (11×11): parede x0, x2–3, x7, x8–9 enfeitadas; x1 e x10 sem enfeite (móvel alto embaixo); fileira 3 livre
  // atrás das estações; cruz de corredores: x4–6 e fileiras 5–7 (portas de cima, de baixo e dos lados)
  var objetos = [].concat(
    /* ---------- SAGUÃO ---------- */
    sala(1, 23, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'estandarte', x: 1, y: 0, var: { cor: '#8e4fd6', emblema: 'estrela' } },
      { tipo: 'estante', x: 2, y: 2, var: { cor: '#8a604a' } }, { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'flores', x: 1, y: 2 },
      { tipo: 'quadro', x: 7, y: 0, var: { cena: 'paisagem' } }, { tipo: 'arandela', x: 8, y: 0 },
      { tipo: 'escola-alfabeto', x: 9, y: 0 }, { tipo: 'estante', x: 11, y: 2 }, { tipo: 'vitral', x: 13, y: 0 },
      { tipo: 'papeis', x: 7, y: 2 }, { tipo: 'lp-letras', x: 9, y: 2 }, { tipo: 'pilha-livros', x: 10, y: 2 }, { tipo: 'flores', x: 13, y: 2 },
      inter('lp-livro-aprendizagem', 'Livro de Aprendizagem', { tipo: 'lp-pulpito', x: 14, y: 2, var: { livro: 'aprendizagem' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'aprendizagem' } }),
      { tipo: 'estandarte', x: 15, y: 0, var: { cor: '#3fae5a', emblema: 'coracao' } }, { tipo: 'portugues-blocos', x: 15, y: 2 },
      { tipo: 'estandarte', x: 19, y: 0, var: { cor: '#ffc61a', emblema: 'coracao' } }, { tipo: 'castelo-blocos-letras', x: 19, y: 2 },
      inter('lp-livro-atividades', 'Livro de Atividades', { tipo: 'lp-pulpito', x: 20, y: 2, var: { livro: 'atividades' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'atividades' } }),
      { tipo: 'vitral', x: 21, y: 0 }, { tipo: 'flores', x: 21, y: 2 }, { tipo: 'estante', x: 22, y: 2 },
      { tipo: 'prateleira-parede', x: 24, y: 0 }, { tipo: 'arandela', x: 26, y: 0 }, { tipo: 'quadro', x: 27, y: 0, var: { cena: 'mar' } },
      { tipo: 'pilha-livros', x: 24, y: 2 }, { tipo: 'papeis', x: 25, y: 2 }, { tipo: 'lp-potes', x: 26, y: 2 }, { tipo: 'caixote', x: 27, y: 2 },
      { tipo: 'estante', x: 31, y: 2, var: { cor: '#8a604a' } }, { tipo: 'estandarte', x: 33, y: 0, var: { cor: '#8e4fd6', emblema: 'estrela' } },
      { tipo: 'janela', x: 34, y: 0 }, { tipo: 'flores', x: 33, y: 2 }, { tipo: 'pilha-livros', x: 34, y: 2 },
      { tipo: 'tapete', x: 16, y: 4, var: { cor: '#c9a8ff', borda: '#ffd34d' } },
      // embaixo, à esquerda: cantinho de leitura, luminária, vitrine e o bebedouro
      { tipo: 'planta-alta', x: 0, y: 6 }, { tipo: 'cesto', x: 0, y: 7, var: { conteudo: 'lapis' } }, { tipo: 'vaso-grande', x: 0, y: 8 },
      { tipo: 'tapete', x: 1, y: 7, var: { cor: '#e0d0ff', borda: '#8e4fd6' } },
      { tipo: 'poltrona', x: 1, y: 7, var: { cor: '#b58cff' } }, { tipo: 'mesa-centro', x: 2, y: 7 },
      { tipo: 'luminaria-pe', x: 5, y: 6 }, { tipo: 'pilha-livros', x: 5, y: 8 }, { tipo: 'banco', x: 6, y: 6 },
      { tipo: 'cesto', x: 8, y: 8, var: { conteudo: 'lapis' } }, { tipo: 'vitrine', x: 9, y: 8, var: { itens: ['livro', 'estrela', 'livro'] } },
      { tipo: 'vaso-planta', x: 11, y: 8 }, inter('lp-bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 12, y: 6 }),
      { tipo: 'flores', x: 13, y: 8 }, { tipo: 'vaso-planta', x: 14, y: 7 }, { tipo: 'pilha-livros', x: 14, y: 8 },
      { tipo: 'flores', x: 15, y: 8 },
      // embaixo, à direita: o mapa da casa, sofá, outra vitrine e plantas
      inter('lp-mapa', 'Mapa da casa', { tipo: 'lp-mapa', x: 19, y: 7 }), { tipo: 'flores', x: 19, y: 8 },
      { tipo: 'luminaria-pe', x: 22, y: 6 }, { tipo: 'tapete-redondo', x: 22, y: 7, var: { cor: '#ffe28a' } },
      { tipo: 'cesto', x: 22, y: 8, var: { conteudo: 'lapis' } }, { tipo: 'sofa', x: 24, y: 7, var: { cor: '#b58cff' } }, { tipo: 'banco', x: 25, y: 8 },
      { tipo: 'planta-alta', x: 27, y: 6 }, { tipo: 'vitrine', x: 28, y: 7, var: { itens: ['pergaminho', 'livro', 'coroa'] } },
      { tipo: 'vaso-planta', x: 31, y: 7 }, { tipo: 'cesto', x: 31, y: 8, var: { conteudo: 'lapis' } }, { tipo: 'mesa-centro', x: 32, y: 8 },
      { tipo: 'poltrona', x: 33, y: 7, var: { cor: '#b58cff' } }, { tipo: 'planta-alta', x: 34, y: 6 },
      { tipo: 'pilha-livros', x: 34, y: 7 }, { tipo: 'vaso-grande', x: 34, y: 8 },
    ]),
    /* ---------- GALERIA 10: Conta uma história? (contos: castelo e floresta) ---------- */
    sala(1, 11, [
      { tipo: 'castelo-escudo', x: 0, y: 0 }, { tipo: 'lp-livro-conto', x: 2, y: 0 }, { tipo: 'castelo-brasao', x: 7, y: 0 },
      { tipo: 'castelo-tapecaria', x: 8, y: 0 },
      { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'lp-moinho', x: 1, y: 2 }, { tipo: 'castelo-pergaminhos', x: 2, y: 2 },
      { tipo: 'flores', x: 3, y: 2, var: { vaso: '#3fae5a' } }, { tipo: 'cesto', x: 7, y: 2, var: { conteudo: 'lapis' } }, { tipo: 'bau', x: 8, y: 2 },
      { tipo: 'pilha-livros', x: 9, y: 2 }, { tipo: 'planta-alta', x: 10, y: 2 },
      { tipo: 'vaso-planta', x: 0, y: 4 }, { tipo: 'museu-legenda', x: 2, y: 4 }, { tipo: 'castelo-candelabro', x: 8, y: 4 },
      { tipo: 'lp-gato-botas', x: 10, y: 4 },
      { tipo: 'castelo-tapete-real', x: 4, y: 6 },
      { tipo: 'castelo-armadura', x: 0, y: 8 }, { tipo: 'museu-legenda', x: 2, y: 8 }, { tipo: 'castelo-coroa-almofada', x: 0, y: 9 },
      { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#2a7a3e' } },
      inter('lp-castelo', 'Castelo do ogro', { tipo: 'lp-castelo', x: 2, y: 10 }),
      { tipo: 'castelo-ampulheta', x: 10, y: 8 }, { tipo: 'tapete-listrado', x: 7, y: 9, var: { cores: ['#3fae5a', '#ffd34d', '#3fae5a', '#fff8ee'] } },
      { tipo: 'lp-vitoria-regia', x: 7, y: 10 }, { tipo: 'castelo-feno', x: 9, y: 10 }, { tipo: 'planta-alta', x: 10, y: 10 },
    ]), estacoes(10, 'aprendizagem', 1, 11),
    /* ---------- GALERIA 11: Quem canta... (canções e instrumentos) ---------- */
    sala(13, 11, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'lp-notas', x: 2, y: 0 }, { tipo: 'cortina', x: 7, y: 0, var: { cor: '#ff8a3d' } },
      { tipo: 'bandeirinhas', x: 8, y: 0 },
      { tipo: 'torre-pandeiro', x: 0, y: 2 }, { tipo: 'lp-gramofone', x: 1, y: 2 }, { tipo: 'escola-musica-metronomo', x: 2, y: 2 },
      { tipo: 'escola-musica-fones', x: 3, y: 2 }, { tipo: 'flores', x: 7, y: 2, var: { vaso: '#ff8a3d' } },
      { tipo: 'pilha-livros', x: 8, y: 2 }, { tipo: 'museu-piao', x: 9, y: 2 }, { tipo: 'lp-arara', x: 10, y: 2 },
      { tipo: 'vaso-planta', x: 0, y: 4 }, { tipo: 'museu-legenda', x: 2, y: 4 }, { tipo: 'lp-violao', x: 8, y: 4 },
      { tipo: 'luminaria-pe', x: 10, y: 4 },
      { tipo: 'escola-musica-tapete', x: 4, y: 6 },
      inter('lp-leao', 'Rei da Floresta', { tipo: 'lp-leao', x: 0, y: 8 }), { tipo: 'museu-legenda', x: 2, y: 8 },
      { tipo: 'torre-pandeiro', x: 0, y: 9 }, { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#c8701a' } },
      { tipo: 'museu-tambor', x: 2, y: 10 },
      { tipo: 'torre-sino', x: 10, y: 8 }, { tipo: 'tapete-listrado', x: 7, y: 9, var: { cores: ['#ff8a3d', '#ffd34d', '#e0433f', '#fff8ee'] } },
      { tipo: 'torre-piano', x: 7, y: 10 }, { tipo: 'escola-musica-fones', x: 9, y: 10 }, { tipo: 'planta-alta', x: 10, y: 10 },
    ]), estacoes(11, 'aprendizagem', 13, 11),
    /* ---------- GALERIA 12: O visual do poema (poemas visuais e letras) ---------- */
    sala(25, 11, [
      { tipo: 'lp-relampago', x: 0, y: 0 }, { tipo: 'lp-poema', x: 2, y: 0 }, { tipo: 'lp-cartaz-abc', x: 7, y: 0, var: { cor: '#2f6fd6' } },
      { tipo: 'escola-alfabeto', x: 8, y: 0 },
      { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'lp-ovo', x: 1, y: 2 }, { tipo: 'portugues-blocos', x: 2, y: 2 },
      { tipo: 'papeis', x: 3, y: 2 }, { tipo: 'lp-letras', x: 7, y: 2 }, { tipo: 'castelo-blocos-letras', x: 8, y: 2 },
      { tipo: 'flores', x: 9, y: 2, var: { vaso: '#5fb4ff' } }, { tipo: 'cavalete', x: 10, y: 2 },
      { tipo: 'vaso-planta', x: 0, y: 4 }, { tipo: 'museu-legenda', x: 2, y: 4 }, { tipo: 'lp-maquina', x: 8, y: 4 },
      { tipo: 'luminaria-pe', x: 10, y: 4 },
      { tipo: 'tapete', x: 4, y: 6, var: { cor: '#bcd0f2', borda: '#8e4fd6' } },
      { tipo: 'globo', x: 0, y: 8 }, { tipo: 'museu-legenda', x: 2, y: 8 }, { tipo: 'lp-letras', x: 0, y: 9, var: { cor: '#3fae5a', cor2: '#ffc61a' } },
      { tipo: 'museu-banco-veludo', x: 0, y: 10, var: { cor: '#2f4f8a' } },
      inter('lp-jacare', 'Jacaré letrado', { tipo: 'lp-jacare', x: 2, y: 10 }),
      { tipo: 'portugues-dicionario', x: 10, y: 8 },
      { tipo: 'portugues-tapete-letras', x: 7, y: 9 }, { tipo: 'portugues-tapete-letras', x: 8, y: 9 }, { tipo: 'portugues-tapete-letras', x: 9, y: 9 },
      { tipo: 'escrivaninha', x: 7, y: 10 }, { tipo: 'cadeira', x: 9, y: 10, var: { almofada: '#5fb4ff' } }, { tipo: 'planta-alta', x: 10, y: 10 },
    ]), estacoes(12, 'aprendizagem', 25, 11),
    // o tema de cada ateliê (portugues/lp-objetos-atelies.js): quadro e cartaz na parede, um canto, o meio (entre as
    // estações), dois móveis da sala (a1 à esquerda, a9 à direita) e a peça da fileira de baixo
    atelie(10, 1, { cor: '#3fae5a', quadro: 'lp-quadro-iara', cartaz: 'pontuacao', canto: 'castelo-pergaminhos', meio: 'pilha-livros',
      a1: 'globo', a9: 'lp-pe-feijao', baixo: 'lp-porquinhos' }),
    atelie(11, 13, { cor: '#ff8a3d', quadro: 'lp-instrumentos', cartaz: 'notas', canto: 'torre-pandeiro', meio: 'lp-hamster',
      a1: 'lp-aquario', a9: 'lp-arara', baixo: 'lp-bichos' }),
    atelie(12, 25, { cor: '#5fb4ff', quadro: 'lp-falta-sorte', cartaz: 'ao', canto: 'castelo-blocos-letras', meio: 'lp-letras',
      a1: 'lp-maquina', a9: 'lp-bola', baixo: 'portugues-bau-letras' })
  );
  // ateliê (11×9, Livro de Atividades, amarelo): mesas de trabalho com o caderno amarelo, varal de desenhos e o tema do
  // capítulo; as estações na parede do fundo (x3, x5, x7 sem enfeite em cima); corredores: x4–6 (porta de baixo) e a
  // fileira 5 (portas dos lados)
  function atelie(cap, ox, t) {
    return sala(ox, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'lp-varal', x: 1, y: 0 }, { tipo: 'lp-cartaz-abc', x: 4, y: 0 },
      { tipo: 'lp-cartaz', x: 6, y: 0, var: { tema: t.cartaz } }, { tipo: t.quadro, x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'cesto', x: 0, y: 2, var: { conteudo: 'lapis' } }, { tipo: 'lp-potes', x: 1, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 },
      { tipo: t.meio, x: 4, y: 2 }, { tipo: 'lp-potes', x: 6, y: 2 }, { tipo: 'bau', x: 8, y: 2 },
      { tipo: t.canto, x: 9, y: 2 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: t.cor } },
      { tipo: 'tapete', x: 4, y: 3, var: { cor: '#fff0a0', borda: t.cor } },
      { tipo: t.a1, x: 1, y: 4 }, { tipo: t.a9, x: 9, y: 4 },
      { tipo: 'lp-mesa-atividades', x: 1, y: 6 }, { tipo: 'cadeira', x: 3, y: 6, var: { almofada: t.cor } },
      { tipo: 'lp-mesa-atividades', x: 8, y: 6 }, { tipo: 'cadeira', x: 7, y: 6, var: { almofada: t.cor } },
      { tipo: 'vaso-planta', x: 0, y: 7 }, { tipo: 'flores', x: 0, y: 8 }, { tipo: t.baixo, x: 1, y: 8 }, { tipo: 'caixote', x: 3, y: 8 },
      { tipo: 'tapete-listrado', x: 4, y: 7, var: { cores: [t.cor, '#ffc61a', t.cor, '#fff8ee'] } },
      { tipo: 'barril', x: 7, y: 8 }, { tipo: 'banco', x: 8, y: 8 }, { tipo: 'vaso-planta', x: 10, y: 7 }, { tipo: 'balde', x: 10, y: 8 },
    ]).concat(estacoes(cap, 'atividades', ox, 1));
  }

  /* ================= A CASA ================= */
  var TEMAS = {   // paleta de cada capítulo: galeria (rodapé verde do Livro de Aprendizagem) e ateliê (rodapé dourado do de Atividades)
    10: { nome: 'Conta uma história?', galeria: { piso: 'pedra', parede: 'pedra', paleta: { piso: '#e6eed8', piso2: '#b9c9a0', parede: '#eef4e2', parede2: '#cfe0b8', rodape: '#2a7a3e' } },
      atelie: { parede2: '#d8ecc0', detalhe: '#3fae5a' } },
    11: { nome: 'Quem canta...', galeria: { piso: 'taco', parede: 'papel', paleta: { piso: '#f6d2a8', piso2: '#dca878', parede: '#fff1dc', parede2: '#ffd8b0', rodape: '#2a7a3e', detalhe: '#ff8a3d' } },
      atelie: { parede2: '#ffdcb8', detalhe: '#ff8a3d' } },
    12: { nome: 'O visual do poema', galeria: { piso: 'mosaico', parede: 'papel', paleta: { piso: '#eef4ff', piso2: '#bcd0f2', detalhe: '#8e4fd6', parede: '#f2f2ff', parede2: '#d6e2ff', rodape: '#2a7a3e' } },
      atelie: { parede2: '#d6e2ff', detalhe: '#5fb4ff' } },
  };
  var comodos = [{ id: 'lp-saguao', nome: 'Saguão', placa: 'Saguão • Língua Portuguesa', rect: { x: 1, y: 23, w: 35, h: 9 },
    piso: 'mosaico', parede: 'papel', paleta: { piso: '#f4ecff', piso2: '#cdb4f4', detalhe: '#ffd34d', parede: '#f1e6ff', parede2: '#dccaf8', rodape: '#5a3f8a' } }];
  CAPITULOS.forEach(function (cap, i) {
    var T = TEMAS[cap], x = 1 + i * 12;
    comodos.push(Object.assign({ id: 'lp-galeria' + cap, nome: T.nome, placa: 'Cap. ' + cap + ' • ' + T.nome, rect: { x: x, y: 11, w: 11, h: 11 } }, T.galeria));
    comodos.push({ id: 'lp-atelie' + cap, nome: 'Atividades do Cap. ' + cap, placa: 'Atividades • Cap. ' + cap, rect: { x: x, y: 1, w: 11, h: 9 },
      piso: 'tabuas', parede: 'papel', paleta: Object.assign({ piso: '#f2d6a8', piso2: '#d9b27a', parede: '#fff6d6', rodape: '#c98a00' }, T.atelie) });
  });

  // a Língua Portuguesa (lugar.dentro: 'materia:portugues', interior: 'portugues') mora no interior de entrada da
  // própria casa: o lugar é o da Casa das Palavras, e por ele se entra pela porta do mapa e pelo "Ir" do menu Lugares
  Reino.registrarInterior({
    id: 'portugues',
    lugar: 'materia:portugues',
    nome: 'Casa das Palavras',
    entrada: true,
    pacote: 'interior-portugues',
    tamanho: { w: 37, h: 33 },
    saida: { x: 18, y: 31 },   // o tapete no meio da parede de baixo do saguão: a porta da casa (fora.js), no meio
    spawn: { x: 18, y: 30 },
    comodos: comodos,
    portas: [
      { x: 5, y: 10, w: 3, h: 3 }, { x: 17, y: 10, w: 3, h: 3 }, { x: 29, y: 10, w: 3, h: 3 },   // ateliê ↔ galeria
      { x: 5, y: 22, w: 3, h: 3 }, { x: 17, y: 22, w: 3, h: 3 }, { x: 29, y: 22, w: 3, h: 3 },   // galeria ↔ saguão
      { x: 12, y: 16, w: 1, h: 3 }, { x: 24, y: 16, w: 1, h: 3 },                                 // galeria ↔ galeria
      { x: 12, y: 5, w: 1, h: 3 }, { x: 24, y: 5, w: 1, h: 3 },                                   // ateliê ↔ ateliê
    ],
    corredores: [
      { x: 5, y: 13, w: 3, h: 9 }, { x: 17, y: 13, w: 3, h: 9 }, { x: 29, y: 13, w: 3, h: 9 }, { x: 1, y: 16, w: 35, h: 3 },   // galerias
      { x: 5, y: 3, w: 3, h: 7 }, { x: 17, y: 3, w: 3, h: 7 }, { x: 29, y: 3, w: 3, h: 7 }, { x: 1, y: 6, w: 35, h: 1 },        // ateliês
      { x: 1, y: 27, w: 35, h: 2 }, { x: 17, y: 25, w: 3, h: 7 }, { x: 5, y: 25, w: 3, h: 2 }, { x: 29, y: 25, w: 3, h: 2 },   // saguão (até o tapete)
    ],
    objetos: objetos,
    npcs: [
      npc('lp-leticia', 16, 30, GUIA),
      npc('lp-celeste', 10, 19, GUIA),
      npc('lp-sol', 22, 19, GUIA),
      npc('lp-pingo', 34, 19, GUIA),
    // + os registrados com predio: 'portugues' e x/y (Reino.personagensDoPredio; sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('portugues').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || GUIA);
    })),
  });
})();
