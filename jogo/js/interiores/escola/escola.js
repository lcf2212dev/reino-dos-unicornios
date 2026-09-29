/* Escola do Reino (provas bimestriais), parte 2 de 2: corredor com a Diretora Margarida e o mural dos
   prêmios, e uma sala de aula por prova registrada (montadas pelo gerador, na ordem de Reino.provas).
   Aqui: ajudantes de montagem, gerador das salas, corredor e o registro do interior. Os objetos
   temáticos ficam em escola/objetos.js (carregado antes); as falas moram em escola/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.escola) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.escola;
  var larguraMural = S.larguraMural;

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  /** NPC do interior com sprite e voz do elenco. @param {string} id @param {number} x @param {number} y
      @param {AcaoNpc} acao @returns {Npc} */
  function npcDoElenco(id, x, y, acao) {
    /** @type {Partial<PersonagemElenco>} */
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }

  /* ================= GERADOR DAS SALAS DE AULA ================= */
  // professora de cada prova: o personagem do elenco com `paraProva` (personagens/elenco.js)
  function professorDoElenco(provaId) {
    return R.NPCs && R.NPCs.doElenco ? R.NPCs.doElenco({ paraProva: provaId }) : null;
  }
  // tema de cada matéria: piso, paleta e os enfeites próprios (coordenadas locais da sala 11×11)
  var TEMAS = {
    historia: {
      piso: 'taco', parede: 'papel',
      paleta: { piso: '#f2c9a8', piso2: '#dca88a', parede: '#fff1e0', parede2: '#ffe0b8', rodape: '#8a604a', detalhe: '#ff9d2e' },
      cortina: '#ff9d2e', carteira: '#ff9d2e',
      enfeites: [
        { tipo: 'mapa-parede', x: 8, y: 0 }, { tipo: 'estandarte', x: 10, y: 0, var: { cor: '#ff9d2e', emblema: 'estrela' } },
        { tipo: 'quadro', x: 3, y: 0, var: { cena: 'castelo' } },
        inter('linha-tempo', 'Linha do tempo', { tipo: 'escola-linha-tempo', x: 7, y: 9 }),
        inter('cartas', 'Cartas antigas', { tipo: 'escola-cartas', x: 0, y: 9 }),
      ],
    },
    ingles: {
      piso: 'azulejo', parede: 'azulejo',
      paleta: { piso: '#eef4ff', piso2: '#bcd0f2', parede: '#e8f4ff', parede2: '#9fcfff', rodape: '#2f4f8a', detalhe: '#d63d63' },
      cortina: '#d63d63', carteira: '#5fb4ff',
      enfeites: [
        inter('palavras', 'Cartaz de palavras', { tipo: 'escola-palavras', x: 8, y: 0, var: { palavra: 'APPLE' } }),
        inter('bandeira', 'Bandeira', { tipo: 'escola-bandeira', x: 10, y: 0 }),
        { tipo: 'escola-palavras', x: 3, y: 0, w: 1, var: { palavra: 'CAT', faixa: '#d63d63' } },
        { tipo: 'cavalete', x: 7, y: 9 }, { tipo: 'luminaria-pe', x: 8, y: 9 },
        { tipo: 'bau', x: 0, y: 9 },
      ],
    },
    portugues: {
      piso: 'taco', parede: 'papel',
      paleta: { piso: '#e8f4dc', piso2: '#bcdca4', parede: '#fff4ec', parede2: '#ffd6cc', rodape: '#2e7a45', detalhe: '#e0433f' },
      cortina: '#e0433f', carteira: '#39a860',
      enfeites: [
        inter('receita', 'Receita', { tipo: 'escola-receita', x: 8, y: 0 }),
        { tipo: 'estandarte', x: 10, y: 0, var: { cor: '#e0433f', emblema: 'coracao' } },
        { tipo: 'escola-palavras', x: 3, y: 0, w: 1, var: { palavra: 'ABC', figura: 'BOOK', faixa: '#39a860', letra: '#e0433f' } },
        inter('silabas', 'Quadro das sílabas', { tipo: 'escola-silabas', x: 7, y: 9 }),
        { tipo: 'escola-mochila', x: 0, y: 9, var: { cor: '#e0433f' } },
      ],
    },
  };
  // salas de provas sem tema próprio (a Fase 5 testa com uma prova fictícia)
  var TEMA_PADRAO = {
    piso: 'carpete', parede: 'papel',
    paleta: { piso: '#d8f0d8', piso2: '#b8dcb8', parede: '#f2fbef', parede2: '#cdeec8', rodape: '#2e8b3e', detalhe: '#ffd34d' },
    cortina: '#6fdc8c', carteira: '#6fdc8c',
    enfeites: [
      { tipo: 'bandeirinhas', x: 8, y: 0 }, { tipo: 'cartaz', x: 10, y: 0, var: { desenho: 'estrela' } },
      { tipo: 'quadro', x: 3, y: 0, var: { cena: 'flor' } },
      { tipo: 'mesa', x: 7, y: 9, var: { toalha: '#c8f0c8', itens: ['livro', 'planta'] } }, { tipo: 'caixote', x: 0, y: 9, var: { item: 'estrela' } },
    ],
  };
  var MOCHILAS = [C.rosa, C.azul, C.lilas, C.laranja, C.verde];
  var FALAS_PADRAO = F.professorPadrao || {};

  function nomeMateria(prova) {
    var m = R.materia ? R.materia(prova.materiaId) : null;
    return (m && m.nome) || prova.nome || 'Aula';
  }
  // professor da prova: do elenco, se houver; senão um professor padrão
  function professor(prova, x, y) {
    var acao = { tipo: 'prova', prova: prova.id }, id = professorDoElenco(prova.id);
    if (id) return npcDoElenco(id, x, y, acao);
    return { id: 'prof-' + prova.id, nome: 'Professora do Reino', voz: 'npc-padrao-3', x: x, y: y, acao: acao, falas: FALAS_PADRAO,
      sprite: { base: 'pessoa', pele: '#e8b48a', cabelo: '#3a2a20', penteado: 'coque', oculos: true, roupa: '#9b6bd6', roupa2: '#5a3d8a', perna: 'saia', livro: '#ffd34d' } };
  }
  // uma sala de aula completa (cômodo, objetos, professor, porta e corredores) para a prova n
  function gerarSala(prova, n) {
    var ox = 1 + 12 * (n + 1), oy = 1, tema = TEMAS[prova.materiaId] || TEMA_PADRAO, cm = tema.carteira;
    var objetos = sala(ox, oy, [
      // parede do fundo: janela, alfabeto, lousa com ABC, relógio (+ enfeites do tema)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'escola-alfabeto', x: 1, y: 0 },
      inter('lousa', 'Lousa', { tipo: 'lousa', x: 4, y: 0, w: 3 }),
      { tipo: 'relogio-parede', x: 7, y: 0 },
      // frente da sala
      { tipo: 'bau', x: 0, y: 2 },               // baixo: não tapa a janela nem o alfabeto
      inter('globo', 'Globo', { tipo: 'globo', x: 2, y: 3 }),
      { tipo: 'escola-mesa-prof', x: 8, y: 3, var: { livro: tema.cortina } },
      { tipo: 'vaso-planta', x: 10, y: 5 },
      // carteiras em duas fileiras, com o corredor no meio
      { tipo: 'escola-carteira', x: 1, y: 5, var: { cadeira: cm } }, { tipo: 'escola-carteira', x: 3, y: 5, var: { cadeira: cm, caderno: C.azul } },
      { tipo: 'escola-carteira', x: 7, y: 5, var: { cadeira: cm, caderno: C.verde } }, { tipo: 'escola-carteira', x: 9, y: 5, var: { cadeira: cm } }, { tipo: 'flores', x: 3, y: 2 },
      { tipo: 'escola-carteira', x: 1, y: 7, var: { cadeira: cm, caderno: C.lilas } }, { tipo: 'escola-carteira', x: 3, y: 7, var: { cadeira: cm } },
      { tipo: 'escola-carteira', x: 7, y: 7, var: { cadeira: cm, caderno: C.ouro } }, { tipo: 'escola-carteira', x: 9, y: 7, var: { cadeira: cm, caderno: C.azul } },
      { tipo: 'escola-mochila', x: 0, y: 6, var: { cor: MOCHILAS[(n + 1) % 5] } }, { tipo: 'escola-mochila', x: 10, y: 3, var: { cor: MOCHILAS[(n + 3) % 5] } },
      inter('mochila', 'Mochila', { tipo: 'escola-mochila', x: 4, y: 7, var: { cor: MOCHILAS[n % 5] } }),
      // fundo da sala
      { tipo: 'cesto', x: 1, y: 9 }, { tipo: 'pilha-livros', x: 3, y: 9 }, { tipo: 'escola-lixeira', x: 2, y: 9 },
      { tipo: 'estante', x: 9, y: 9 },
      { tipo: 'papeis', x: 8, y: 10 },
    ].concat(tema.enfeites));
    return {
      comodo: { id: 'sala-' + prova.id, nome: 'Sala de ' + nomeMateria(prova), placa: 'Sala de ' + nomeMateria(prova),
        rect: { x: ox, y: oy, w: 11, h: 11 }, piso: tema.piso, parede: tema.parede, paleta: tema.paleta },
      objetos: objetos,
      npc: professor(prova, ox + 7, oy + 3),
      porta: { x: ox + 5, y: 12, w: 1, h: 3 },     // atravessa o vão e a parede do corredor
      corredores: [{ x: ox + 5, y: oy + 3, w: 1, h: 8 }],
    };
  }

  /* ================= CORREDOR ================= */
  // o corredor tem um trecho para o hall (à esquerda) e um trecho embaixo de cada sala
  function trechoHall(bx, by, nProvas) {
    var mw = larguraMural(nProvas);
    return sala(bx, by, [
      // parede do hall: janela, sino, relógio e o brasão em cima da mesa da Diretora
      { tipo: 'escola-sino', x: 0, y: 0 }, { tipo: 'relogio-parede', x: 1, y: 0 },   // 2 livre: o bebedouro encosta ali
      { tipo: 'escola-brasao', x: 3, y: 0 },
      { tipo: 'flores', x: 0, y: 2 },
      inter('bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 2, y: 2 }),
      { tipo: 'escrivaninha', x: 3, y: 2, junto: true, var: { abajur: '#39a860' } },   // junto: embaixo do brasão, de propósito
      // o mural dos prêmios fica à direita e uma fileira à frente da parede: no canto de cima à esquerda
      // ele sumia sob os avisos do HUD (⭐, "🥚 1 ovo!"). A parede em cima dele fica lisa (a plaquinha sobe até ela); atrás dele,
      // só caixotes (o chão ali ficaria preso)
      inter('mural', 'Prêmios da Escola do Reino', { tipo: 'escola-mural', x: 12 - mw, y: 3, w: mw, junto: true }),
      { tipo: 'caixote', x: 12 - mw, y: 2, w: mw },
      // passadeira no corredor (não bloqueia)
      { tipo: 'tapete', x: 0, y: 4, w: 12, h: 2, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
      // recepção, perto do tapete de saída
      { tipo: 'tapete', x: 4, y: 6, w: 3, h: 1, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
      { tipo: 'banco', x: 0, y: 7 }, { tipo: 'vaso-planta', x: 2, y: 7 },
      { tipo: 'vitrine', x: 8, y: 7, var: { itens: ['medalha', 'coroa', 'estrela'] } }, { tipo: 'vaso-grande', x: 10, y: 8 },
      { tipo: 'flores', x: 7, y: 7 },
    ]);
  }
  function trechoSala(bx, by, n, ultimo) {
    var lista = [
      // 0-1 livres atrás dos armários; a janela fica sobre o tapete redondo
      { tipo: 'quadro', x: 2, y: 0 }, { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'janela', x: 5, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
      { tipo: 'cartaz', x: 7, y: 0, var: { desenho: ['coracao', 'estrela'][n % 2] } }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'estandarte', x: 9, y: 0, var: { cor: '#39a860', emblema: n % 2 ? 'coracao' : 'estrela' } },
      { tipo: 'cortina', x: 10, y: 0, var: { cor: '#6fdc8c' } },
      n === 0 ? inter('escaninhos', 'Armários dos alunos', { tipo: 'escola-escaninhos', x: 0, y: 2 })
        : { tipo: 'escola-escaninhos', x: 0, y: 2, var: { cores: [C.lilas, C.laranja, C.azul, C.rosa] } },
      { tipo: 'flores', x: 2, y: 2 }, { tipo: 'caixote', x: 8, y: 2 }, { tipo: 'banco', x: 9, y: 2 },
      // passadeira listrada no corredor, com um tapete redondo na frente da porta
      { tipo: 'tapete-listrado', x: 0, y: 4, w: ultimo ? 11 : 12, h: 1, var: { cores: ['#39a860', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'tapete-listrado', x: 0, y: 5, w: ultimo ? 11 : 12, h: 1, var: { cores: ['#ffd34d', '#fff8ee', '#39a860', '#fff8ee'] } },
      { tipo: 'tapete-redondo', x: 4, y: 2, w: 3, h: 2 },
      // fileira de baixo: sempre algo a cada 2 tiles
      { tipo: 'banco', x: 1, y: 7 }, { tipo: 'vaso-planta', x: 4, y: 8 }, { tipo: 'escola-lixeira', x: 7, y: 7 },
      { tipo: 'flores', x: 9, y: 8 }, { tipo: 'cesto', x: 10, y: 8 },
      { tipo: 'tapete-listrado', x: 4, y: 6, w: 3, h: 1, var: { cores: ['#39a860', '#fff8ee', '#ffd34d', '#fff8ee'] } },
    ];
    if (!ultimo) lista.push({ tipo: 'bandeirinhas', x: 10, y: 0, w: 2 }, { tipo: 'flores', x: 11, y: 2 });
    return sala(bx, by, lista);
  }

  /* ================= MONTAGEM ================= */
  function montar() {
    var provas = R.provas || [], N = provas.length, S = N + 1;
    var salas = provas.map(gerarSala);
    var largura = 12 * S - 1, by = 13;
    var objetos = trechoHall(1, by, N);
    salas.forEach(function (s, n) { objetos = objetos.concat(trechoSala(1 + 12 * (n + 1), by, n, n === N - 1)); });
    salas.forEach(function (s) { objetos = objetos.concat(s.objetos); });
    // a bandeirinha do trecho anterior passa por cima da cortina: tira a cortina desse tile
    objetos = objetos.filter(function (o) {
      return !(o.tipo === 'cortina' && objetos.some(function (b) { return b.tipo === 'bandeirinhas' && b.y === o.y && b.x <= o.x && b.x + (b.w || 2) > o.x; }));
    });
    return {
      id: 'escola',
      lugar: 'escola',
      nome: 'Escola do Reino',
      entrada: true,
      pacote: 'interior-escola',
      tamanho: { w: largura + 2, h: 23 },
      saida: { x: 6, y: 21 },
      spawn: { x: 6, y: 20 },
      comodos: [
        { id: 'corredor', nome: 'Corredor', placa: 'Corredor • Escola do Reino', rect: { x: 1, y: by, w: largura, h: 9 },
          piso: 'mosaico', parede: 'madeira', paleta: { piso: '#fff6dc', piso2: '#9fe0a0', detalhe: '#ffd34d', parede: '#f7eed8', parede2: '#e2d2ae', rodape: '#2d6b4a' } },
      ].concat(salas.map(function (s) { return s.comodo; })),
      portas: salas.map(function (s) { return s.porta; }),
      corredores: [
        { x: 1, y: by + 4, w: largura, h: 2 },   // passagem do corredor
        { x: 5, y: by + 5, w: 3, h: 4 },         // do tapete de saída até a passagem
      ].concat([].concat.apply([], salas.map(function (s) { return s.corredores.concat([{ x: s.porta.x, y: by + 2, w: 1, h: 2 }]); }))),
      objetos: objetos,
      npcs: [npcDoElenco('margarida', 5, by + 3, { tipo: 'guia', lugar: 'escola' })].concat(salas.map(function (s) { return s.npc; }))
        // + os registrados com predio: 'escola' e x/y (Reino.personagensDoPredio; prédio antigo não tem vagas)
        .concat(R.personagensDoPredio('escola').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
          return npcDoElenco(p.id, p.x, p.y, p.acao || { tipo: 'guia', lugar: 'escola' });
        })),
    };
  }
  R.registrarInterior(montar());
})();
