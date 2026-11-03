/* Museu das Memórias: o museu inteiro é da História da Gente, a História do 4º bimestre
   (docs/contratos/quarto-bimestre.md §7). Entra-se pela porta do mapa e se sai pelo tapete do hall.
   Planta (37×33): embaixo, o hall de ponta a ponta (a Dona Memória, o mapa do museu, os dois livros, o acervo de
   sempre e o tapete de saída); no meio, uma galeria por capítulo (Livro de Aprendizagem, as salas 1 a 4); em cima de
   cada galeria, a oficina do capítulo (Livro de Atividades, e as salas 5 e 6 do de Aprendizagem, se houver).
   Portas largas entre vizinhos e corredores em cruz: do hall se chega a tudo em poucos passos.
   As estações das salas são GERADAS DOS DADOS: cada sala de Reino.materia('historia4').salas vai para a vaga do
   cômodo do seu capítulo e livro, na ordem do livro; vaga sem sala vira enfeite; sala sem lugar = erro na carga.
   Objetos em museu/objetos*.js e museu/hi-objetos.js (a estação), os das galerias e oficinas em museu/hi-galerias.js,
   falas em museu/falas.js; os anfitriões são NPCs do elenco (os do museu de sempre).
   O layout do 3º bimestre (hall e cinco galerias, uma por sala h1–h5) está em
   arquivo/terceiro-bimestre/jogo/js/interiores/museu/museu.js. */
(function () {
  var R = window.Reino;
  var MAT = 'historia4', M = R.materia && R.materia(MAT);
  // sem a matéria (contexto só com o catálogo do 3º bimestre) o museu não tem galerias; a fixture histórica dos testes
  // carrega o layout arquivado no lugar deste arquivo
  if (!M) return;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.museu) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.museu;
  var LIVROS = S.LIVROS_HI;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do museu com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npc(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var GUIA = { tipo: 'guia', lugar: 'materia:' + MAT, livro: MAT };

  /* ================= ESTAÇÕES (das salas da matéria) ================= */
  // vagas em coordenadas locais, na ordem do livro. Galeria: as 4 primeiras salas do Livro de Aprendizagem do capítulo
  // (fileira 4, dos dois lados da cruz de corredores); oficina, encostadas na parede do fundo: as do Livro de
  // Atividades nas do meio (x3, x7) e a 5ª e a 6ª do de Aprendizagem nas das pontas (x1, x9)
  var LUGARES = { galeria: [[1, 4], [3, 4], [7, 4], [9, 4]], atividades: [[3, 2], [7, 2]], extra: [[1, 2], [9, 2]] };
  var CAPITULOS = [10, 11, 12];
  function salasDo(cap, livro) { return M.salas.filter(function (s) { return s.capitulo === cap && s.livroOrigem === livro; }); }
  M.salas.forEach(function (s) {
    if (CAPITULOS.indexOf(s.capitulo) < 0 || !LIVROS[s.livroOrigem]) {
      throw new Error('museu: a sala ' + s.id + ' (capítulo ' + s.capitulo + ', livro ' + s.livroOrigem +
        ') não tem cômodo no Museu das Memórias (museu/museu.js)');
    }
  });
  CAPITULOS.forEach(function (cap) {
    var max = { aprendizagem: LUGARES.galeria.length + LUGARES.extra.length, atividades: LUGARES.atividades.length };
    Object.keys(max).forEach(function (livro) {
      var n = salasDo(cap, livro).length;
      if (n > max[livro]) throw new Error('museu: o capítulo ' + cap + ' tem ' + n + ' salas do livro "' + livro + '", mas ' +
        (livro === 'atividades' ? 'a oficina só tem ' : 'a galeria e a oficina só têm ') + max[livro] +
        ' vagas (museu/museu.js, LUGARES)');
    });
  });
  // "pp. 3 a 9" → "Páginas 3 a 9"; "p. 4" → "Página 4"
  function textoPaginas(p) {
    var t = String(p || '').trim(), m = /^(pp?)\.\s*(.+)$/i.exec(t);
    if (!m) return t;
    return (m[1].toLowerCase() === 'pp' || /\d\D+\d/.test(m[2]) ? 'Páginas ' : 'Página ') + m[2];
  }
  // fala curta da estação (sem emoji): "Páginas 3 a 5: O que é trabalho?"; se não couber numa página, só
  // "Páginas 3 a 5." (o nome da sala já está no título do balão: não se repete)
  function falaSala(s) {
    var pg = String(textoPaginas(s.paginas) || '').replace(/\bp\. /g, 'página '), nome = String(s.nome || '').trim(), fim = /[.!?…]$/.test(nome) ? '' : '.';
    if (!pg) return nome + fim;
    var uma = pg + ': ' + nome + fim;
    return uma.length <= 34 ? uma : pg + '.';
  }
  function primeiraPagina(p) { var m = /\d+/.exec(String(p || '')); return m ? m[0] : ''; }
  // as vagas de um cômodo ('galeria' | 'oficina') do capítulo: { p: [x, y], sala (ou undefined), livro, enfeite }
  var ENFEITES = { galeria: ['livro', 'estrela', 'coroa', 'vaso'], extra: ['ovo', 'globo'] };
  function vaga(p, sala, livro, enfeite) { return { p: p, sala: sala, livro: livro, enfeite: enfeite }; }
  function vagas(cap, comodo) {
    var ap = salasDo(cap, 'aprendizagem'), at = salasDo(cap, 'atividades'), n = LUGARES.galeria.length;
    if (comodo === 'galeria') return LUGARES.galeria.map(function (p, i) { return vaga(p, ap[i], 'aprendizagem', { tipo: 'pedestal', var: { item: ENFEITES.galeria[i] } }); });
    return LUGARES.extra.map(function (p, i) { return vaga(p, ap[n + i], 'aprendizagem', { tipo: 'pedestal', var: { item: ENFEITES.extra[i] } }); })
      .concat(LUGARES.atividades.map(function (p, i) { return vaga(p, at[i], 'atividades', { tipo: 'cavalete' }); }));
  }
  // as estações de um cômodo do capítulo, com o canto do cômodo em (ox, oy); vaga sem sala: o enfeite
  function estacoes(cap, comodo, ox, oy) {
    return vagas(cap, comodo).map(function (v) {
      var s = v.sala, o = { x: ox + v.p[0], y: oy + v.p[1] };
      if (!s) return Object.assign(o, v.enfeite);
      return Object.assign(o, { tipo: 'museu-estacao', chave: 'hi-sala-' + s.id, nome: s.nome, fala: falaSala(s),
        acao: { tipo: 'sala', materia: MAT, sala: s.id }, var: { livro: v.livro, pagina: primeiraPagina(s.paginas) } });
    });
  }

  /* ================= O HALL ================= */
  // 35×9, de ponta a ponta embaixo; portas para as galerias em x4–6, x16–18 e x28–30 (sem enfeite na parede ali);
  // corredores: as fileiras 4–5 e x16–18 até o tapete de saída (17,8). A parede do fundo tem vãos em x12–15 e
  // x19–22 (a placa). Os livros nos dois lados da porta do meio; a Dona Memória à esquerda do tapete, com o (14,7)
  // livre; o acervo de sempre (vitrines, pedestais, cordões, legendas) nas ilhas da metade de baixo
  var hall = sala(1, 23, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'vitral', x: 1, y: 0 }, { tipo: 'estandarte', x: 2, y: 0, var: { cor: '#9b6bd6', emblema: 'estrela' } },
    { tipo: 'museu-fotos', x: 3, y: 0 }, { tipo: 'arandela', x: 7, y: 0 },
    { tipo: 'quadro-unicornio', x: 8, y: 0, var: { uni: 'hi-guardiao-das-memorias' } },
    { tipo: 'museu-mural-cartas', x: 10, y: 0 }, { tipo: 'relogio-parede', x: 11, y: 0 },
    { tipo: 'estandarte', x: 23, y: 0, var: { cor: '#6c6f86', emblema: 'coracao' } }, { tipo: 'museu-selos', x: 24, y: 0 },
    { tipo: 'museu-tico-tico', x: 25, y: 0 }, { tipo: 'cortina', x: 26, y: 0, var: { cor: '#b58cff' } }, { tipo: 'janela', x: 27, y: 0 },
    { tipo: 'quadro', x: 31, y: 0, var: { cena: 'paisagem' } }, { tipo: 'museu-fitas', x: 32, y: 0 }, { tipo: 'vitral', x: 33, y: 0 },
    { tipo: 'janela', x: 34, y: 0 },
    // encostado na parede: miudezas do acervo e os dois livros
    { tipo: 'museu-anfora', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'flores', x: 2, y: 2 }, { tipo: 'museu-moedas', x: 3, y: 2 },
    { tipo: 'museu-piao', x: 7, y: 2 }, { tipo: 'caixote', x: 8, y: 2, var: { item: 'estrela' } }, { tipo: 'museu-moedas', x: 9, y: 2 },
    { tipo: 'papeis', x: 10, y: 2 }, { tipo: 'museu-maleta', x: 11, y: 2 }, { tipo: 'flores', x: 12, y: 2, var: { vaso: '#3fae5a' } },
    { tipo: 'vaso-planta', x: 13, y: 2 },
    inter('hi-livro-aprendizagem', 'Livro de Aprendizagem', { tipo: 'museu-pulpito', x: 14, y: 2, var: { cor: LIVROS.aprendizagem.capa },
      acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'aprendizagem' } }),
    { tipo: 'flores', x: 15, y: 2, var: { vaso: '#3fae5a' } }, { tipo: 'flores', x: 19, y: 2, var: { vaso: '#ffc61a' } },
    inter('hi-livro-atividades', 'Livro de Atividades', { tipo: 'museu-pulpito', x: 20, y: 2, var: { cor: LIVROS.atividades.capa },
      acao: { tipo: 'tela', tela: 'livro', materia: MAT, livro: 'atividades' } }),
    { tipo: 'vaso-planta', x: 21, y: 2 }, { tipo: 'pilha-livros', x: 22, y: 2 }, { tipo: 'papeis', x: 23, y: 2 },
    { tipo: 'museu-moedas', x: 24, y: 2 }, { tipo: 'caixote', x: 25, y: 2, var: { item: 'moedas' } },
    { tipo: 'museu-anfora', x: 26, y: 2, var: { cor: '#c8507a' } }, { tipo: 'museu-piao', x: 27, y: 2 },
    { tipo: 'papeis', x: 31, y: 2 }, { tipo: 'cesto', x: 32, y: 2 }, { tipo: 'pilha-livros', x: 33, y: 2 }, { tipo: 'museu-anfora', x: 34, y: 2 },
    { tipo: 'museu-tapete-marajoara', x: 1, y: 3, var: { cor: '#e0d0ff' } }, { tipo: 'museu-tapete-marajoara', x: 9, y: 3, var: { cor: '#c9a8ff' } },
    { tipo: 'tapete', x: 13, y: 3, w: 3, h: 1, var: { cor: '#c8f0d0', borda: LIVROS.aprendizagem.capa } },
    { tipo: 'tapete', x: 19, y: 3, w: 3, h: 1, var: { cor: '#fff0b0', borda: LIVROS.atividades.capa } },
    { tipo: 'museu-tapete-marajoara', x: 25, y: 3, var: { cor: '#ffc2d8' } }, { tipo: 'museu-tapete-marajoara', x: 33, y: 3, var: { cor: '#e0d0ff' } },
    // embaixo, à esquerda: o bebedouro, vitrines, cordões e a caixinha de lembranças
    inter('hi-bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 0, y: 6 }), { tipo: 'museu-moedas', x: 0, y: 7 },
    { tipo: 'museu-banco-veludo', x: 0, y: 8 }, { tipo: 'museu-cordao', x: 1, y: 6 }, { tipo: 'museu-legenda', x: 3, y: 6 },
    { tipo: 'museu-tapete-marajoara', x: 2, y: 7, var: { cor: '#e0d0ff' } },
    { tipo: 'vitrine', x: 2, y: 8, var: { itens: ['relogio', 'medalha', 'concha'] } },
    inter('hi-caixinha', 'Caixinha de lembranças', { tipo: 'museu-caixinha', x: 5, y: 6 }),
    { tipo: 'museu-tapete-marajoara', x: 4, y: 7, var: { cor: '#ffc2d8' } }, { tipo: 'museu-tapete-marajoara', x: 6, y: 7, var: { cor: '#ffc2d8' } },
    { tipo: 'pedestal', x: 4, y: 8, var: { item: 'pergaminho' } }, { tipo: 'museu-piao', x: 6, y: 8 },
    { tipo: 'museu-cordao', x: 7, y: 6 }, { tipo: 'museu-legenda', x: 9, y: 6 },
    inter('hi-brinquedos', 'Brinquedos antigos', { tipo: 'museu-brinquedos', x: 10, y: 6 }),
    { tipo: 'museu-tapete-marajoara', x: 9, y: 7, var: { cor: '#c9a8ff' } },
    { tipo: 'museu-anfora', x: 7, y: 8 }, { tipo: 'vitrine', x: 8, y: 8, var: { itens: ['pergaminho', 'concha', 'pergaminho'] } },
    { tipo: 'museu-banco-veludo', x: 10, y: 8, var: { cor: '#7c5cff' } },
    { tipo: 'planta-alta', x: 12, y: 6 }, { tipo: 'museu-tapete-marajoara', x: 13, y: 7, var: { cor: '#e0d0ff' } },
    { tipo: 'museu-maleta', x: 12, y: 8 }, { tipo: 'pedestal', x: 13, y: 8, var: { item: 'globo' } }, { tipo: 'flores', x: 15, y: 8 },
    // embaixo, à direita: o mapa do museu, mais vitrines e o relógio de pé
    inter('hi-mapa', 'Mapa do museu', { tipo: 'museu-mapa', x: 19, y: 6, var: { planta: 'hi' } }),
    { tipo: 'planta-alta', x: 22, y: 6 }, { tipo: 'museu-tapete-marajoara', x: 20, y: 7, var: { cor: '#c9a8ff' } },
    { tipo: 'flores', x: 19, y: 8 }, { tipo: 'museu-banco-veludo', x: 21, y: 8 },
    { tipo: 'museu-cordao', x: 23, y: 6, var: { cor: '#6c6f86' } }, { tipo: 'museu-legenda', x: 25, y: 6 },
    { tipo: 'museu-tapete-marajoara', x: 25, y: 7, var: { cor: '#ffe28a' } },
    { tipo: 'vitrine', x: 23, y: 8, var: { itens: ['ursinho', 'estrela', 'coroa'] } }, { tipo: 'pedestal', x: 25, y: 8, var: { item: 'ursinho' } },
    { tipo: 'museu-piao', x: 26, y: 8 }, { tipo: 'relogio-pe', x: 27, y: 6 }, { tipo: 'museu-maleta', x: 27, y: 8 },
    { tipo: 'museu-documentos', x: 28, y: 6 }, { tipo: 'museu-tapete-marajoara', x: 30, y: 7, var: { cor: '#bcd0f2' } },
    { tipo: 'museu-anfora', x: 28, y: 8, var: { cor: '#b98a5a' } }, { tipo: 'museu-vela', x: 29, y: 8 },
    { tipo: 'cavalete', x: 31, y: 6 }, { tipo: 'museu-cordao', x: 32, y: 6, var: { cor: '#9b6bd6' } }, { tipo: 'planta-alta', x: 34, y: 6 },
    { tipo: 'museu-tapete-marajoara', x: 33, y: 7, var: { cor: '#e0d0ff' } },
    { tipo: 'vitrine', x: 31, y: 8, var: { itens: ['vela', 'concha', 'pergaminho'] } }, { tipo: 'museu-banco-veludo', x: 33, y: 8, var: { cor: '#2f4f8a' } },
  ]);

  /* ================= O MUSEU ================= */
  var TEMAS = {   // paleta de cada capítulo: a galeria (rodapé verde do Livro de Aprendizagem) e a oficina (dourado, Atividades)
    10: { nome: 'O trabalho de cada um', galeria: { piso: 'tabuas', parede: 'tijolo', paleta: { piso: '#e0a870', piso2: '#b97a48', rodape: '#2a7a3e' } },
      oficina: { piso: 'taco', parede: 'papel', paleta: { piso: '#f2c9a8', piso2: '#dca88a', parede: '#fff1e0', parede2: '#ffd6a8', rodape: '#c98a00' } } },
    11: { nome: 'Profissionais da comunidade', galeria: { piso: 'azulejo', parede: 'azulejo',
      paleta: { piso: '#eef4ff', piso2: '#bcd0f2', detalhe: '#2f6fd6', parede: '#fff6d8', parede2: '#9fbef0', rodape: '#2a7a3e' } },
      oficina: { piso: 'carpete', parede: 'papel', paleta: { piso: '#d8c4ff', piso2: '#c4a8f4', parede: '#f3eaff', parede2: '#e0d0ff', rodape: '#c98a00' } } },
    12: { nome: 'Trabalho e meio ambiente', galeria: { piso: 'pedra', parede: 'pedra',
      paleta: { piso: '#e8efd0', piso2: '#b8c98a', parede: '#eef6d8', parede2: '#ffe28a', rodape: '#2a7a3e' } },
      oficina: { piso: 'carpete', parede: 'papel', paleta: { piso: '#e2f2dc', piso2: '#c4e2bc', parede: '#f4fbef', parede2: '#d8ecc0', rodape: '#c98a00' } } },
  };
  var comodos = [{ id: 'hall', nome: 'Hall', placa: 'Hall • Museu das Memórias', rect: { x: 1, y: 23, w: 35, h: 9 },
    piso: 'mosaico', parede: 'papel', paleta: { piso: '#f6eefc', piso2: '#c9a8ff', detalhe: '#ffd34d', parede: '#efe2fb', parede2: '#dcc6f4', rodape: '#8a604a' } }];
  CAPITULOS.forEach(function (cap, i) {
    var T = TEMAS[cap], x = 1 + i * 12;
    comodos.push(Object.assign({ id: 'galeria' + (i + 1), nome: T.nome, placa: 'Cap. ' + cap + ' • ' + T.nome, rect: { x: x, y: 11, w: 11, h: 11 } }, T.galeria));
    comodos.push(Object.assign({ id: 'oficina' + (i + 1), nome: 'Oficina do Capítulo ' + cap, placa: 'Oficina do Cap. ' + cap,
      rect: { x: x, y: 1, w: 11, h: 9 } }, T.oficina));
  });

  // a História da Gente (lugar.dentro: 'materia:historia', interior: 'museu') mora no interior de entrada do próprio
  // museu: o lugar é o do Museu das Memórias, e por ele se entra pela porta do mapa e pelo "Ir" do menu Lugares
  Reino.registrarInterior({
    id: 'museu',
    lugar: 'materia:historia',
    nome: 'Museu das Memórias',
    entrada: true,
    pacote: 'interior-museu',
    tamanho: { w: 37, h: 33 },
    saida: { x: 18, y: 31 },   // o tapete no meio da parede de baixo do hall
    spawn: { x: 18, y: 30 },
    comodos: comodos,
    portas: [
      { x: 5, y: 10, w: 3, h: 3 }, { x: 17, y: 10, w: 3, h: 3 }, { x: 29, y: 10, w: 3, h: 3 },   // oficina ↔ galeria
      { x: 5, y: 22, w: 3, h: 3 }, { x: 17, y: 22, w: 3, h: 3 }, { x: 29, y: 22, w: 3, h: 3 },   // galeria ↔ hall
      { x: 12, y: 16, w: 1, h: 3 }, { x: 24, y: 16, w: 1, h: 3 },                                 // galeria ↔ galeria
      { x: 12, y: 5, w: 1, h: 3 }, { x: 24, y: 5, w: 1, h: 3 },                                   // oficina ↔ oficina
    ],
    corredores: [
      { x: 5, y: 13, w: 3, h: 9 }, { x: 17, y: 13, w: 3, h: 9 }, { x: 29, y: 13, w: 3, h: 9 }, { x: 1, y: 16, w: 35, h: 3 },   // galerias
      { x: 5, y: 3, w: 3, h: 7 }, { x: 17, y: 3, w: 3, h: 7 }, { x: 29, y: 3, w: 3, h: 7 }, { x: 1, y: 6, w: 35, h: 1 },        // oficinas
      { x: 1, y: 27, w: 35, h: 2 }, { x: 17, y: 25, w: 3, h: 7 }, { x: 5, y: 25, w: 3, h: 2 }, { x: 29, y: 25, w: 3, h: 2 },   // hall (até o tapete)
    ],
    objetos: hall.concat(S.hiComodos({ sala: sala, inter: inter, estacoes: estacoes })),
    npcs: [
      npc('memoria', 16, 30, GUIA),
      npc('antonio', 10, 19, GUIA),      // galeria do capítulo 10
      npc('chico', 22, 19, GUIA),        // galeria do capítulo 11
      npc('taina', 34, 19, GUIA),        // galeria do capítulo 12
      npc('contadeira', 4, 8, GUIA),     // oficina do capítulo 10
      npc('nina', 28, 8, GUIA),          // oficina do capítulo 12
    // + os registrados com predio: 'museu' e x/y (Reino.personagensDoPredio; prédio sem vagas: sem x/y, o validador acusa)
    ].concat(R.personagensDoPredio('museu').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || GUIA);
    })),
  });
})();
