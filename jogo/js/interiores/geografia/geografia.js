/* Estação dos Caminhos: a estação inteira é da Geografia do Mundo do 4º bimestre (docs/contratos/quarto-bimestre.md §7),
   a estação de trem dos dois livros da escola. Entra-se pela porta do mapa e se sai pelo tapete do saguão.
   Planta (37×33): embaixo, o saguão (o Maquinista Marco, a bilheteria, a locutora, o painel de partidas, o mapa, os
   dois livros e o tapete de saída); no meio, a plataforma de cada capítulo (Livro de Aprendizagem, rodapé verde, com o
   anfitrião do capítulo); em cima, o vagão de Atividades de cada capítulo (rodapé dourado). Portas largas entre
   vizinhos e corredores em cruz: do saguão se chega a tudo em poucos passos.
   As estações das salas são GERADAS DOS DADOS: cada sala de Reino.materia('geografia4').salas vai para a vaga do
   cômodo do seu capítulo e livro, na ordem do livro; vaga sem sala vira enfeite; sala sem cômodo ou capítulo com sala
   demais = erro na carga. Objetos em geografia/objetos.js, ge-objetos.js e ge-objetos-temas.js; personagens e falas
   em geografia/falas.js; a estação de fora, em geografia/fora.js.
   O layout do 3º bimestre (hall + 5 salas) está em arquivo/terceiro-bimestre/jogo/js/interiores/geografia/geografia.js. */
(function () {
  var R = window.Reino;
  var MAT = 'geografia4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) a estação não tem salas; a fixture histórica dos testes
  // carrega o layout arquivado no lugar deste arquivo
  if (!M) return;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.geografia) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.geografia, LARANJA = S.LARANJA, CORES_CAP = S.CORES_CAP;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC da estação com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };

  /* ================= ESTAÇÕES (das salas da matéria) ================= */
  // vagas em coordenadas locais, na ordem do livro. Plataforma (Aprendizagem): a fileira de cima dos dois lados da cruz
  // de corredores e duas embaixo, à esquerda; vagão (Atividades): encostadas na parede do fundo, primeiro as do meio
  var VAGAS = { plataforma: [[1, 4], [3, 4], [7, 4], [9, 4], [1, 8], [3, 8]], vagao: [[3, 2], [7, 2], [1, 2], [9, 2]] };
  var LIVRO = { plataforma: 'aprendizagem', vagao: 'atividades' };
  var CAPITULOS = [10, 11, 12];
  function salasDo(cap, livro) { return M.salas.filter(function (s) { return s.capitulo === cap && s.livroOrigem === livro; }); }
  M.salas.forEach(function (s) {
    if (CAPITULOS.indexOf(s.capitulo) < 0 || ['aprendizagem', 'atividades'].indexOf(s.livroOrigem) < 0) {
      throw new Error('geografia: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem cômodo na Estação dos Caminhos (geografia/geografia.js, CAPITULOS)');
    }
  });
  CAPITULOS.forEach(function (cap) {
    Object.keys(VAGAS).forEach(function (comodo) {
      var n = salasDo(cap, LIVRO[comodo]).length;
      if (n > VAGAS[comodo].length) throw new Error('geografia: o capítulo ' + cap + ' tem ' + n + ' salas do livro "' +
        LIVRO[comodo] + '", mas ' + (comodo === 'vagao' ? 'o vagão' : 'a plataforma') + ' só tem ' + VAGAS[comodo].length +
        ' vagas (geografia/geografia.js, VAGAS)');
    });
  });
  // "pp. 3 a 9" → "Páginas 3 a 9"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 3 a 9: De onde vêm?."; se não couber numa página, só a página
  // (o nome da sala já está no título do balão: não se repete)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  var ENFEITE = {
    plataforma: function (i) { return { tipo: 'pedestal', var: { item: ['globo', 'estrela', 'pergaminho', 'vaso', 'livro', 'coroa'][i] } }; },
    vagao: function () { return { tipo: 'cavalete' }; },
  };
  // as estações de um cômodo ('plataforma' | 'vagao') do capítulo, com o canto do cômodo em (ox, oy)
  function estacoes(cap, comodo, ox, oy) {
    var ss = salasDo(cap, LIVRO[comodo]);
    return VAGAS[comodo].map(function (p, i) {
      var s = ss[i], o = { x: ox + p[0], y: oy + p[1] };
      if (!s) return Object.assign(o, ENFEITE[comodo](i));   // vaga sem sala: enfeite (nunca uma estação vazia)
      return Object.assign(o, { tipo: 'geografia-estacao', chave: 'ge-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: LIVRO[comodo], pagina: primeiraPagina(s.paginas) } });
    });
  }

  /* ================= LAYOUT ================= */
  // colunas 1 | 13 | 25; vagões nas fileiras 1–9, plataformas 11–21, saguão 23–31 (de ponta a ponta)
  // plataforma (11×11): cruz de corredores x4–6 e fileiras 5–7; a fileira 3 fica livre atrás das estações de cima e,
  // embaixo das de baixo, só coisa baixa (fileira 9) ou de até meio tile (fileira 10); o anfitrião em (9, 8)
  var objetos = [].concat(
    /* ---------- SAGUÃO ---------- */
    sala(1, 23, [
      // parede: sem enfeite em cima dos livros (x13, x19), da bilheteria (x10–11) e do microfone (x24)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'estandarte', x: 1, y: 0, var: { cor: LARANJA, emblema: 'estrela' } },
      { tipo: 'arandela', x: 2, y: 0 }, { tipo: 'vitral', x: 3, y: 0 },
      inter('ge-painel', 'Painel de partidas', { tipo: 'geografia-painel', x: 7, y: 0 }),
      { tipo: 'relogio-parede', x: 12, y: 0 }, { tipo: 'estandarte', x: 14, y: 0, var: { cor: '#3fae5a', emblema: 'estrela' } },
      { tipo: 'estandarte', x: 20, y: 0, var: { cor: '#ffc61a', emblema: 'estrela' } },
      { tipo: 'museu-mapa-brasil', x: 21, y: 0 }, { tipo: 'quadro', x: 25, y: 0, var: { cena: 'paisagem' } },
      { tipo: 'arandela', x: 26, y: 0 }, { tipo: 'janela', x: 27, y: 0 },
      { tipo: 'vitral', x: 31, y: 0 }, { tipo: 'arandela', x: 32, y: 0 }, { tipo: 'estandarte', x: 33, y: 0, var: { cor: LARANJA, emblema: 'estrela' } },
      { tipo: 'janela', x: 34, y: 0 },
      // fileiras 2 e 3: os bancos de espera, a bilheteria com a Laís, os dois livros e o microfone da locutora
      { tipo: 'pilha-livros', x: 0, y: 2 }, { tipo: 'flores', x: 1, y: 2 }, { tipo: 'flores', x: 2, y: 2, var: { vaso: '#3fae5a' } }, { tipo: 'cesto', x: 3, y: 2 },
      { tipo: 'banco', x: 0, y: 3 }, { tipo: 'geografia-mala', x: 2, y: 3 }, { tipo: 'flores', x: 3, y: 3 },
      { tipo: 'banco', x: 7, y: 2 }, { tipo: 'pilha-livros', x: 9, y: 2 },
      inter('ge-bilheteria', 'Bilheteria', { tipo: 'geografia-bilheteria', x: 10, y: 2 }),
      { tipo: 'escola-lixeira', x: 12, y: 2 }, { tipo: 'almofada', x: 7, y: 3, var: { cor: LARANJA } }, { tipo: 'cesto', x: 12, y: 3 },
      inter('ge-livro-aprendizagem', 'Livro de Aprendizagem', { tipo: 'geografia-livro', x: 13, y: 2, var: { livro: 'aprendizagem' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'aprendizagem' } }),
      { tipo: 'flores', x: 14, y: 2 }, { tipo: 'vaso-planta', x: 15, y: 2 },
      { tipo: 'flores', x: 19, y: 3 },
      inter('ge-livro-atividades', 'Livro de Atividades', { tipo: 'geografia-livro', x: 19, y: 2, var: { livro: 'atividades' },
        acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'atividades' } }),
      { tipo: 'pilha-livros', x: 20, y: 2 }, { tipo: 'cesto', x: 21, y: 2 }, { tipo: 'geografia-mala', x: 22, y: 2, var: { cor: '#5fb4ff' } },
      { tipo: 'papeis', x: 23, y: 2 }, { tipo: 'escola-musica-microfone', x: 24, y: 2 },
      { tipo: 'pilha-livros', x: 25, y: 2 }, { tipo: 'vaso-grande', x: 26, y: 2 },
      { tipo: 'cesto', x: 31, y: 2 }, { tipo: 'banco', x: 32, y: 2 }, { tipo: 'vaso-grande', x: 34, y: 2 },
      { tipo: 'geografia-mala', x: 31, y: 3, var: { cor: '#3fae5a' } }, { tipo: 'flores', x: 34, y: 3 },
      // embaixo, à esquerda: bebedouro, bancos de espera, o relógio de pé e a vitrine
      inter('ge-bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 0, y: 7 }), { tipo: 'vaso-grande', x: 0, y: 8 },
      { tipo: 'banco', x: 2, y: 6 }, { tipo: 'cesto', x: 1, y: 8 }, { tipo: 'banco', x: 2, y: 8 },
      { tipo: 'luminaria-pe', x: 4, y: 6 }, { tipo: 'geografia-mala', x: 5, y: 7, var: { cor: '#e0433f' } },
      { tipo: 'pilha-livros', x: 4, y: 8 }, inter('ge-relogio', 'Relógio da estação', { tipo: 'relogio-pe', x: 6, y: 6 }),
      { tipo: 'vitrine', x: 7, y: 8, var: { itens: ['globo', 'relogio', 'medalha'] } }, { tipo: 'almofada', x: 8, y: 6, var: { cor: '#ffc61a' } },
      { tipo: 'vaso-planta', x: 9, y: 6 }, { tipo: 'banco', x: 10, y: 6 }, { tipo: 'banco', x: 10, y: 8 },
      { tipo: 'planta-alta', x: 13, y: 6 }, { tipo: 'flores', x: 13, y: 8 }, { tipo: 'cesto', x: 14, y: 8 },
      { tipo: 'tapete-listrado', x: 11, y: 7, w: 1, h: 1, var: { cores: [LARANJA, '#fff8ee', '#3fae5a', '#fff8ee'] } },
      // embaixo, à direita: o mapa da estação, mais bancos, outra vitrine e plantas
      inter('ge-mapa', 'Mapa da estação', { tipo: 'geografia-mapa-estacao', x: 19, y: 7 }), { tipo: 'flores', x: 19, y: 8 },
      { tipo: 'cesto', x: 20, y: 8 }, { tipo: 'luminaria-pe', x: 21, y: 6 },
      { tipo: 'banco', x: 22, y: 6 }, { tipo: 'banco', x: 22, y: 8 },
      { tipo: 'vaso-planta', x: 25, y: 6 }, { tipo: 'vitrine', x: 26, y: 7, var: { itens: ['globo', 'estrela', 'pergaminho'] } },
      { tipo: 'planta-alta', x: 28, y: 6 }, { tipo: 'cesto', x: 29, y: 8 }, { tipo: 'banco', x: 30, y: 6 }, { tipo: 'banco', x: 30, y: 8 },
      { tipo: 'cabideiro', x: 33, y: 6 }, { tipo: 'vaso-grande', x: 34, y: 7 },
      { tipo: 'geografia-mala', x: 33, y: 8, var: { cor: '#ffc61a' } }, { tipo: 'flores', x: 34, y: 8 },
    ]),
    /* ---------- PLATAFORMA 10: Matérias-primas (madeira, látex, mel e sal) ---------- */
    sala(1, 11, [
      inter('ge-lapis', 'As partes do lápis', { tipo: 'geografia-lapis', x: 0, y: 0 }), { tipo: 'janela', x: 2, y: 0 },
      { tipo: 'cartaz', x: 3, y: 0, var: { desenho: 'estrela' } }, { tipo: 'prateleira-parede', x: 7, y: 0 },
      { tipo: 'arandela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'bau', x: 2, y: 2 }, { tipo: 'flores', x: 3, y: 2, var: { vaso: '#c98a4b' } },   // (0–1, 2): livres embaixo do lápis
      { tipo: 'cesto', x: 7, y: 2 }, { tipo: 'caixote', x: 8, y: 2, var: { item: 'moedas' } },
      { tipo: 'pilha-livros', x: 9, y: 2 }, { tipo: 'barril', x: 10, y: 2 },
      inter('ge-seringueira', 'Seringueira', { tipo: 'geografia-seringueira', x: 0, y: 4 }),
      inter('ge-sal', 'Monte de sal', { tipo: 'geografia-sal', x: 2, y: 4 }),
      { tipo: 'lab-pedras', x: 8, y: 4 }, { tipo: 'vaso-planta', x: 10, y: 4 },
      { tipo: 'matematica-blocos', x: 0, y: 8 }, inter('ge-colmeia', 'Colmeia', { tipo: 'lab-colmeia', x: 2, y: 8 }),
      { tipo: 'estabulo-ferramentas', x: 7, y: 8 }, { tipo: 'balde', x: 8, y: 8 }, { tipo: 'portugues-cesta-frutas', x: 10, y: 8 },
      { tipo: 'cesto', x: 0, y: 9, var: { conteudo: 'lapis' } },
      { tipo: 'tapete-listrado', x: 1, y: 9, var: { cores: ['#c98a4b', '#fff8ee', '#3fae5a', '#fff8ee'] } },
      { tipo: 'caixote', x: 7, y: 9 }, { tipo: 'papeis', x: 8, y: 9 }, { tipo: 'vaso-grande', x: 10, y: 9 },
      { tipo: 'barril', x: 0, y: 10 }, { tipo: 'geografia-trilho', x: 1, y: 10 }, { tipo: 'geografia-trilho', x: 7, y: 10 },
      { tipo: 'geografia-toras', x: 10, y: 10 },
    ]), estacoes(10, 'plataforma', 1, 11),
    /* ---------- PLATAFORMA 11: Paisagem (a câmera, os quadros de paisagem e a praça) ---------- */
    sala(13, 11, [
      inter('ge-paisagem-natural', 'Paisagem natural', { tipo: 'geografia-paisagem', x: 0, y: 0, var: { cena: 'natural' } }),
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'quadro', x: 3, y: 0, var: { cena: 'paisagem' } },
      inter('ge-paisagem-cidade', 'Paisagem da cidade', { tipo: 'geografia-paisagem', x: 7, y: 0, var: { cena: 'cidade' } }),
      { tipo: 'museu-fotos', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'flores', x: 3, y: 2 },   // (0–1, 2) e (7, 2): livres embaixo dos quadros
      { tipo: 'cesto', x: 8, y: 2 }, { tipo: 'flores', x: 9, y: 2, var: { vaso: '#39a860' } },
      inter('ge-camera', 'Câmera', { tipo: 'geografia-camera', x: 0, y: 4 }), { tipo: 'geografia-placa', x: 2, y: 4, var: { tipo: '80' } },
      { tipo: 'portugues-poste', x: 8, y: 4 }, { tipo: 'portugues-arvore', x: 10, y: 4 },
      { tipo: 'vaso-grande', x: 0, y: 8 }, { tipo: 'torre-luneta', x: 2, y: 8 },
      { tipo: 'portugues-banco-praca', x: 7, y: 8 }, { tipo: 'flores', x: 10, y: 8 },
      { tipo: 'cesto', x: 0, y: 9 }, { tipo: 'tapete-listrado', x: 1, y: 9, var: { cores: ['#39a860', '#fff8ee', '#5fb4ff', '#fff8ee'] } },
      { tipo: 'lab-rio', x: 7, y: 9 }, { tipo: 'almofada', x: 10, y: 9, var: { cor: '#6fdc8c' } },
      { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'bau', x: 1, y: 10 }, { tipo: 'balde', x: 2, y: 10 },
      { tipo: 'cesto', x: 3, y: 10 }, { tipo: 'vaso-planta', x: 7, y: 10 }, { tipo: 'cavalete', x: 8, y: 10 },
      { tipo: 'luminaria-pe', x: 9, y: 10 }, { tipo: 'papeis', x: 10, y: 10 },
    ]), estacoes(11, 'plataforma', 13, 11),
    /* ---------- PLATAFORMA 12: Transformação das paisagens (a gruta, a obra e a muda) ---------- */
    sala(25, 11, [
      inter('ge-antes-depois', 'Antes e depois', { tipo: 'geografia-antes-depois', x: 0, y: 0 }), { tipo: 'janela', x: 2, y: 0 },
      { tipo: 'cartaz', x: 3, y: 0, var: { desenho: 'arcoiris' } },
      { tipo: 'geografia-paisagem', x: 7, y: 0, var: { cena: 'campo' } }, { tipo: 'quadro', x: 9, y: 0, var: { cena: 'mar' } },
      { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'geografia-tijolos', x: 0, y: 2 }, { tipo: 'flores', x: 2, y: 2 },   // (1, 2): livre embaixo do antes e depois
      { tipo: 'flores', x: 3, y: 2, var: { vaso: '#2f8fd6' } },
      { tipo: 'cesto', x: 7, y: 2 }, { tipo: 'barril', x: 8, y: 2 }, { tipo: 'caixote', x: 9, y: 2 }, { tipo: 'flores', x: 10, y: 2 },
      inter('ge-muda', 'Muda de árvore', { tipo: 'geografia-muda', x: 0, y: 4 }), { tipo: 'portugues-regador', x: 2, y: 4 },
      { tipo: 'geografia-cone', x: 8, y: 4 }, { tipo: 'planta-alta', x: 10, y: 4 },
      { tipo: 'lab-pedra', x: 0, y: 8 }, { tipo: 'geografia-tijolos', x: 2, y: 8 },
      inter('ge-gruta', 'Gruta do mar', { tipo: 'geografia-gruta', x: 7, y: 8 }),
      { tipo: 'balde', x: 0, y: 9 }, { tipo: 'tapete-listrado', x: 1, y: 9, var: { cores: ['#2f8fd6', '#fff8ee', '#e07a4a', '#fff8ee'] } },
      { tipo: 'lab-rio', x: 7, y: 9 }, { tipo: 'geografia-cone', x: 10, y: 9 },   // o mar da gruta
      { tipo: 'bau', x: 0, y: 10 }, { tipo: 'papeis', x: 1, y: 10 }, { tipo: 'lab-pedras', x: 2, y: 10 }, { tipo: 'caixote', x: 3, y: 10 },
      { tipo: 'geografia-trilho', x: 7, y: 10 }, { tipo: 'balde', x: 10, y: 10 },
    ]), estacoes(12, 'plataforma', 25, 11),
    vagao(10, 1, { cor: CORES_CAP[10], quadro: { tipo: 'quadro', var: { cena: 'paisagem' } }, canto: 'geografia-toras' }),
    vagao(11, 13, { cor: CORES_CAP[11], quadro: { tipo: 'quadro', var: { cena: 'mar' } }, canto: 'lab-pedras' }),
    vagao(12, 25, { cor: CORES_CAP[12], quadro: { tipo: 'cartaz', var: { desenho: 'coracao' } }, canto: 'geografia-tijolos' })
  );
  // var própria em todo objeto: o kit de cor dos enfeites (interiores-objetos-enfeites.js) não junta com o de outro prédio
  objetos.forEach(function (o) { if (o.var === undefined) o.var = {}; });
  // vagão de Atividades (11×9): janelas dos dois lados, bancos de passageiro, a mesa do caderno amarelo e as malas; as
  // estações na parede do fundo (x1, x3, x7, x9 sem enfeite em cima, fileira 3 livre na frente); corredores: x4–6
  // (porta de baixo) e a fileira 5 (portas dos lados)
  function vagao(cap, ox, t) {
    return sala(ox, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'janela', x: 2, y: 0 }, { tipo: 'arandela', x: 4, y: 0 },
      Object.assign({ x: 5, y: 0 }, t.quadro), { tipo: 'arandela', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'geografia-mala', x: 0, y: 2, var: { cor: t.cor } }, { tipo: 'cesto', x: 2, y: 2, var: { conteudo: 'lapis' } },
      { tipo: 'pilha-livros', x: 8, y: 2 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: t.cor } },
      { tipo: t.canto, x: 10, y: 3 },
      { tipo: 'banco', x: 0, y: 4 }, { tipo: 'almofada', x: 2, y: 4, var: { cor: t.cor } }, { tipo: 'papeis', x: 3, y: 4 },
      { tipo: 'papeis', x: 7, y: 4 }, { tipo: 'banco', x: 8, y: 4 }, { tipo: 'almofada', x: 10, y: 4, var: { cor: '#ffc61a' } },
      { tipo: 'lp-mesa-atividades', x: 0, y: 6 }, { tipo: 'cadeira', x: 2, y: 6, var: { almofada: t.cor } }, { tipo: 'cabideiro', x: 3, y: 6 },
      { tipo: 'cadeira', x: 7, y: 6, var: { almofada: t.cor } }, { tipo: 'lp-mesa-atividades', x: 8, y: 6 }, { tipo: 'luminaria-pe', x: 10, y: 6 },
      { tipo: 'cesto', x: 0, y: 7 }, { tipo: 'tapete-listrado', x: 1, y: 7, var: { cores: [t.cor, '#fff0a0', t.cor, '#fff8ee'] } },
      { tipo: 'tapete-listrado', x: 7, y: 7, var: { cores: ['#ffc61a', '#fff8ee', t.cor, '#fff8ee'] } }, { tipo: 'cesto', x: 10, y: 7 },
      { tipo: 'bau', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 1, y: 8 }, { tipo: 'banco', x: 2, y: 8 },
      { tipo: 'banco', x: 7, y: 8 }, { tipo: 'geografia-mala', x: 9, y: 8, var: { cor: '#e0433f' } }, { tipo: 'vaso-grande', x: 10, y: 8 },
    ]).concat(estacoes(cap, 'vagao', ox, 1)).map(function (o) {
      // var própria: a cor do enfeite (kitDe) não se confunde com a do mesmo tipo e lugar de outro interior
      if (o.var === undefined) o.var = {};
      return o;
    });
  }

  /* ================= A ESTAÇÃO ================= */
  var TEMAS = {   // o nome e a paleta da plataforma de cada capítulo (rodapé verde do Livro de Aprendizagem)
    10: { nome: 'Matérias-primas: de onde vêm?', placa: 'Matérias-primas', piso: 'tabuas', parede: 'madeira',
      paleta: { piso: '#f0d2a8', piso2: '#d8b080', parede: '#f6e2c4', parede2: '#e0bf94', rodape: '#2a7a3e', detalhe: '#c98a4b' } },
    11: { nome: 'Paisagem: retrato de um lugar', placa: 'Paisagem', piso: 'mosaico', parede: 'papel',
      paleta: { piso: '#e8f4dc', piso2: '#bcdca4', parede: '#eaf6ff', parede2: '#c8e6ff', rodape: '#2a7a3e', detalhe: '#39a860' } },
    12: { nome: 'Transformação das paisagens', placa: 'Transformação', piso: 'pedra', parede: 'tijolo',
      paleta: { piso: '#ece6dc', piso2: '#c8beae', parede: '#f4e8dc', parede2: '#e0c8b0', rodape: '#2a7a3e', detalhe: '#2f8fd6' } },
  };
  var comodos = [{ id: 'ge-saguao', nome: 'Saguão', placa: 'Saguão • Geografia do Mundo', rect: { x: 1, y: 23, w: 35, h: 9 },
    piso: 'mosaico', parede: 'papel', paleta: { piso: '#fff1e2', piso2: '#ffc08a', detalhe: '#9fcfff', parede: '#fff4e6', parede2: '#ffd9b0', rodape: '#b5520f' } }];
  CAPITULOS.forEach(function (cap, i) {
    var T = TEMAS[cap], x = 1 + i * 12;
    comodos.push({ id: 'ge-plataforma' + cap, nome: T.nome, placa: 'Cap. ' + cap + ' • ' + T.placa, rect: { x: x, y: 11, w: 11, h: 11 },
      piso: T.piso, parede: T.parede, paleta: T.paleta });
    comodos.push({ id: 'ge-vagao' + cap, nome: 'Vagão de Atividades do Capítulo ' + cap, placa: 'Vagão do Cap. ' + cap + ' • Atividades',
      rect: { x: x, y: 1, w: 11, h: 9 }, piso: 'carpete', parede: 'madeira',
      paleta: { piso: '#f6e8cc', piso2: '#e4cca4', parede: '#f2d8b0', parede2: T.paleta.parede2, rodape: '#c98a00', detalhe: CORES_CAP[cap] } });
  });

  // a Geografia do Mundo (lugar.dentro: 'materia:geografia', interior: 'geografia') mora no interior de entrada da
  // própria estação: o lugar é o da Estação dos Caminhos, e por ele se entra pela porta do mapa e pelo "Ir" do menu Lugares
  Reino.registrarInterior({
    id: 'geografia',
    lugar: 'materia:geografia',
    nome: 'Estação dos Caminhos',
    entrada: true,
    pacote: 'interior-geografia',
    tamanho: { w: 37, h: 33 },
    saida: { x: 18, y: 31 },   // o tapete no meio da parede de baixo do saguão
    spawn: { x: 18, y: 30 },
    comodos: comodos,
    portas: [
      { x: 5, y: 10, w: 3, h: 3 }, { x: 17, y: 10, w: 3, h: 3 }, { x: 29, y: 10, w: 3, h: 3 },   // vagão ↔ plataforma
      { x: 5, y: 22, w: 3, h: 3 }, { x: 17, y: 22, w: 3, h: 3 }, { x: 29, y: 22, w: 3, h: 3 },   // plataforma ↔ saguão
      { x: 12, y: 16, w: 1, h: 3 }, { x: 24, y: 16, w: 1, h: 3 },                                 // plataforma ↔ plataforma
      { x: 12, y: 5, w: 1, h: 3 }, { x: 24, y: 5, w: 1, h: 3 },                                   // vagão ↔ vagão
    ],
    corredores: [
      { x: 5, y: 13, w: 3, h: 9 }, { x: 17, y: 13, w: 3, h: 9 }, { x: 29, y: 13, w: 3, h: 9 }, { x: 1, y: 16, w: 35, h: 3 },   // plataformas
      { x: 5, y: 3, w: 3, h: 7 }, { x: 17, y: 3, w: 3, h: 7 }, { x: 29, y: 3, w: 3, h: 7 }, { x: 1, y: 6, w: 35, h: 1 },        // vagões
      { x: 1, y: 27, w: 35, h: 2 }, { x: 17, y: 25, w: 3, h: 7 }, { x: 5, y: 25, w: 3, h: 2 }, { x: 29, y: 25, w: 3, h: 2 },   // saguão (até o tapete)
    ],
    objetos: objetos,
    npcs: [
      npc('geo-marco', 16, 30, GUIA),
      npc('geo-lais', 10, 26, GUIA),
      npc('geo-duda', 26, 26, GUIA),
      npc('geo-teo', 10, 19, GUIA),
      npc('geo-cora', 22, 19, GUIA),
      npc('geo-beto', 34, 19, GUIA),
    // + os registrados com predio: 'geografia' e x/y (Reino.personagensDoPredio; sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('geografia').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || GUIA);
    })),
  });
})();
