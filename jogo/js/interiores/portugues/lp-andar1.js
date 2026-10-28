/* Casa das Palavras, 1º andar (portugues-1; docs/contratos/quarto-bimestre.md §13–§14): em cima, os três ateliês do
   Livro de Atividades (amarelos, um por capítulo, cada um com o anfitrião dele); embaixo, o Cantinho do Respiro (pausa
   entre as etapas: pufes, almofadas, aquário, plantas, bebedouro e luz suave, sem desafio) e a Galeria dos Tesouros (um
   pedestal por sala: o prêmio da trilha perfeita aceso quando ela ganha; portugues/lp-tesouros.js).
   A escada no meio do Ateliê do Cap. 11 desce para o saguão (portugues/portugues.js); quem sobe chega logo abaixo
   dela, (18, 11). As peças de montagem e as estações vêm do térreo (Reino._predios.portugues.casa); os NPCs entram
   pelas reservas (portugues/reservas.js, Reino.personagensDoPredio('portugues-1')). Objetos novos em
   portugues/lp-objetos-andar1.js. */
(function () {
  var R = window.Reino;
  var S = R._predios && R._predios.portugues, K = S && S.casa;
  if (!K) return;   // sem a matéria do 4º bimestre o térreo não monta, e o andar também não
  var sala = K.sala, inter = K.inter, npc = K.npc, TEMAS = K.TEMAS;
  var AT = [1, 13, 25], CANT = { x: 1, y: 13 }, TES = { x: 19, y: 13 };

  // falas dos objetos novos do andar (portugues/lp-falas.js pode trocá-las pela mesma chave)
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { objetos: {} };
  var FALAS = {
    'lp-aquario-respiro': ['Os peixinhos nadam devagar.', 'Respire junto com eles.'],
    'lp-tesouro': ['Cada sala tem um tesouro!', 'Sem errar, ele acende aqui.'],
  };
  function falou(chave, nome, o) {
    var n = inter(chave, nome, o);
    if (!(F.objetos || {})[chave] && FALAS[chave]) n.fala = FALAS[chave];
    return n;
  }

  /* ================= ATELIÊS (Livro de Atividades) ================= */
  // ateliê (11×11, amarelo): mesas de trabalho com o caderno amarelo, varal de desenhos e o tema do capítulo; as
  // estações na parede do fundo (x3 e x7, sem enfeite em cima); o anfitrião em (9, 8). Corredores: x4–6 (porta de
  // baixo; no do meio, a escada) e a fileira 6 (portas dos lados)
  function atelie(cap, ox, t) {
    var meio = ox === AT[1];
    return sala(ox, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'lp-varal', x: 1, y: 0 }, { tipo: 'lp-cartaz-abc', x: 4, y: 0 },
      { tipo: 'lp-cartaz', x: 6, y: 0, var: { tema: t.cartaz } }, { tipo: t.quadro, x: 8, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'cesto', x: 0, y: 2, var: { conteudo: 'lapis' } }, { tipo: 'lp-potes', x: 1, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 },
      { tipo: t.meio, x: 4, y: 2 }, { tipo: 'lp-potes', x: 6, y: 2 }, { tipo: 'bau', x: 8, y: 2 },
      { tipo: t.canto, x: 9, y: 2 }, { tipo: 'flores', x: 10, y: 2, var: { vaso: t.cor } },
      { tipo: 'tapete', x: 4, y: 3, var: { cor: '#fff0a0', borda: t.cor } },
      { tipo: t.a1, x: 1, y: 4 }, { tipo: t.a9, x: 9, y: 4 },
      { tipo: 'lp-mesa-atividades', x: 1, y: 5 }, { tipo: 'cadeira', x: 3, y: 5, var: { almofada: t.cor } },
      { tipo: 'lp-mesa-atividades', x: 8, y: 5 }, { tipo: 'cadeira', x: 7, y: 5, var: { almofada: t.cor } },
      { tipo: 'vaso-planta', x: 0, y: 7 }, { tipo: 'tapete-listrado', x: 4, y: 7, var: { cores: [t.cor, '#ffc61a', t.cor, '#fff8ee'] } },
      { tipo: 'vaso-planta', x: 10, y: 7 },
      { tipo: 'flores', x: 0, y: 8 }, { tipo: t.baixo, x: 1, y: 8 }, { tipo: 'caixote', x: 3, y: 8 }, { tipo: 'barril', x: 7, y: 8 },
      { tipo: 'balde', x: 10, y: 8 },
      { tipo: 'almofada', x: 2, y: 9, var: { cor: t.cor } }, { tipo: 'almofada', x: 8, y: 9, var: { cor: t.cor } },
      { tipo: 'planta-alta', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'pilha-livros', x: 3, y: 10 },
      { tipo: 'pilha-livros', x: 7, y: 10 }, { tipo: 'luminaria-pe', x: 8, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
    ].concat(meio ? [{ tipo: 'flores', x: 4, y: 10, var: { vaso: t.cor } }, { tipo: 'flores', x: 6, y: 10, var: { vaso: t.cor } }] : []))
      .concat(K.estacoes(cap, 'atelie', ox, 1));
  }

  var objetos = [].concat(
    // o tema de cada ateliê (portugues/lp-objetos-atelies.js): quadro e cartaz na parede, um canto, o meio (entre as
    // estações), dois móveis da sala (a1 à esquerda, a9 à direita) e a peça da fileira de baixo
    atelie(10, AT[0], { cor: '#3fae5a', quadro: 'lp-quadro-iara', cartaz: 'pontuacao', canto: 'castelo-pergaminhos', meio: 'pilha-livros',
      a1: 'globo', a9: 'lp-pe-feijao', baixo: 'lp-porquinhos' }),
    atelie(11, AT[1], { cor: '#ff8a3d', quadro: 'lp-instrumentos', cartaz: 'notas', canto: 'torre-pandeiro', meio: 'lp-hamster',
      a1: 'lp-aquario', a9: 'lp-arara', baixo: 'lp-bichos' }),
    atelie(12, AT[2], { cor: '#5fb4ff', quadro: 'lp-falta-sorte', cartaz: 'ao', canto: 'castelo-blocos-letras', meio: 'lp-letras',
      a1: 'lp-maquina', a9: 'lp-bola', baixo: 'portugues-bau-letras' }),

    /* ---------- CANTINHO DO RESPIRO (17×9) ---------- */
    // sem estação nem desafio: um tapete grande com a Vovó Serena no meio (vaga (8, 6)), pufes e almofadas nos cantos,
    // o aquário, o bebedouro, plantas e luz suave. Corredores: x4–6 (porta de cima) e a fileira 5 (porta da Galeria)
    sala(CANT.x, CANT.y, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cortina', x: 1, y: 0, var: { cor: '#9fd8c8' } }, { tipo: 'arandela', x: 3, y: 0 },
      { tipo: 'lp-nuvem', x: 7, y: 0 }, { tipo: 'arandela', x: 10, y: 0 }, { tipo: 'quadro', x: 11, y: 0, var: { cena: 'mar' } },
      { tipo: 'arandela', x: 13, y: 0 }, { tipo: 'janela', x: 15, y: 0 }, { tipo: 'cortina', x: 16, y: 0, var: { cor: '#9fd8c8' } },
      { tipo: 'flores', x: 0, y: 2, var: { vaso: '#9fd8c8' } }, { tipo: 'pilha-livros', x: 1, y: 2 },
      falou('lp-aquario-respiro', 'Aquário', { tipo: 'lp-aquario', x: 2, y: 2 }),
      { tipo: 'cesto', x: 7, y: 2, var: { conteudo: 'lapis' } }, { tipo: 'pilha-livros', x: 8, y: 2 }, { tipo: 'lp-abajur', x: 9, y: 2 },
      { tipo: 'flores', x: 10, y: 2 }, { tipo: 'pilha-livros', x: 11, y: 2 },
      inter('lp-bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 12, y: 2 }),
      { tipo: 'flores', x: 13, y: 2 }, { tipo: 'planta-alta', x: 14, y: 2 }, { tipo: 'cesto', x: 15, y: 2 }, { tipo: 'vaso-grande', x: 16, y: 2 },
      { tipo: 'tapete', x: 0, y: 3, var: { cor: '#d6f0ea', borda: '#5fb4a0' } }, { tipo: 'almofada', x: 1, y: 3, var: { cor: '#b58cff' } },
      { tipo: 'lp-pufe', x: 0, y: 4, var: { cor: '#ff9ec8' } }, { tipo: 'lp-pufe', x: 2, y: 4, var: { cor: '#9fd8ff' } },
      { tipo: 'almofada', x: 8, y: 3, var: { cor: '#ffd34d' } }, { tipo: 'almofada', x: 10, y: 3, var: { cor: '#9fd8c8' } },
      { tipo: 'sofa', x: 12, y: 4, var: { cor: '#9fd8c8' } }, { tipo: 'mesa-centro', x: 14, y: 4 }, { tipo: 'vaso-planta', x: 16, y: 4 },
      { tipo: 'tapete-redondo', x: 8, y: 6, var: { cor: '#c8ecdf' } },
      { tipo: 'vaso-planta', x: 0, y: 6 }, { tipo: 'almofada', x: 1, y: 6, var: { cor: '#ffd34d' } }, { tipo: 'lp-pufe', x: 2, y: 6, var: { cor: '#b58cff' } },
      { tipo: 'lp-pufe', x: 7, y: 7, var: { cor: '#ff9ec8' } }, { tipo: 'lp-pufe', x: 10, y: 7, var: { cor: '#9fd8ff' } },
      { tipo: 'lp-pufe', x: 12, y: 6, var: { cor: '#ffd34d' } }, { tipo: 'almofada', x: 14, y: 6, var: { cor: '#ff9ec8' } },
      { tipo: 'flores', x: 16, y: 6 },
      { tipo: 'planta-alta', x: 0, y: 8 }, { tipo: 'cesto', x: 1, y: 8 }, { tipo: 'pilha-livros', x: 3, y: 8 }, { tipo: 'vaso-grande', x: 5, y: 8 },
      { tipo: 'almofada', x: 8, y: 8, var: { cor: '#b58cff' } }, { tipo: 'flores', x: 10, y: 8 }, { tipo: 'lp-abajur', x: 11, y: 8 },
      { tipo: 'sofa', x: 13, y: 8, var: { cor: '#b58cff' } }, { tipo: 'planta-alta', x: 16, y: 8 },
    ]),

    /* ---------- GALERIA DOS TESOUROS (17×9) ---------- */
    // um pedestal por sala, uma fileira por capítulo (10 em cima, 11 no meio, 12 embaixo, entre os vasos), com passagem
    // entre elas; na parede, o estandarte de cada capítulo. Pedestais gerados das salas (portugues/lp-tesouros.js)
    sala(TES.x, TES.y, [
      { tipo: 'estandarte', x: 0, y: 0, var: { cor: '#3fae5a', emblema: 'estrela' } }, { tipo: 'arandela', x: 2, y: 0 },
      { tipo: 'vitral', x: 4, y: 0 }, { tipo: 'quadro', x: 6, y: 0, var: { cena: 'paisagem' } },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ff8a3d', emblema: 'coracao' } },
      { tipo: 'estandarte', x: 13, y: 0, var: { cor: '#5fb4ff', emblema: 'estrela' } }, { tipo: 'janela', x: 14, y: 0 },
      { tipo: 'arandela', x: 16, y: 0 },
      { tipo: 'flores', x: 0, y: 2, var: { vaso: '#3fae5a' } }, { tipo: 'pilha-livros', x: 1, y: 2 }, { tipo: 'cesto', x: 3, y: 2 },
      { tipo: 'flores', x: 5, y: 2 }, { tipo: 'placa-chao', x: 7, y: 2 }, { tipo: 'flores', x: 8, y: 2, var: { vaso: '#ff8a3d' } },
      { tipo: 'flores', x: 13, y: 2, var: { vaso: '#5fb4ff' } }, { tipo: 'pilha-livros', x: 15, y: 2 }, { tipo: 'vaso-grande', x: 16, y: 2 },
      { tipo: 'tapete-listrado', x: 2, y: 3, var: { cores: ['#ffd34d', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'tapete-listrado', x: 7, y: 5, var: { cores: ['#ffd34d', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'tapete-listrado', x: 12, y: 7, var: { cores: ['#ffd34d', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'planta-alta', x: 0, y: 8 }, { tipo: 'flores', x: 2, y: 8 }, { tipo: 'luminaria-pe', x: 4, y: 8 },
      { tipo: 'vaso-grande', x: 6, y: 8 }, { tipo: 'cesto', x: 8, y: 8 }, { tipo: 'flores', x: 10, y: 8 },
      { tipo: 'luminaria-pe', x: 12, y: 8 }, { tipo: 'vaso-planta', x: 14, y: 8 }, { tipo: 'planta-alta', x: 16, y: 8 },
    ]),
    (S.tesouros ? S.tesouros(TES.x, TES.y) : []).map(function (o) {
      return o.tipo === 'lp-pedestal-tesouro' ? falou('lp-tesouro', o.nome, o) : o;
    })
  );

  // var própria em cada objeto: o enfeite que tira a cor do prédio (kitDe, interiores-objetos-enfeites.js) não se
  // confunde com o de mesmo tipo e lugar de outro interior (nem muda a cor dele)
  objetos.forEach(function (o) { if (o.var === undefined) o.var = {}; });

  var comodos = AT.map(function (x, i) {
    var cap = K.CAPITULOS[i], T = TEMAS[cap];
    return { id: 'lp-atelie' + cap, nome: 'Ateliê do Capítulo ' + cap, placa: 'Ateliê do Cap. ' + cap, rect: { x: x, y: 1, w: 11, h: 11 },
      piso: 'tabuas', parede: 'papel', paleta: Object.assign({ piso: '#f2d6a8', piso2: '#d9b27a', parede: '#fff6d6', rodape: '#c98a00' }, T.atelie) };
  }).concat([
    { id: 'lp-respiro', nome: 'Cantinho do Respiro', placa: 'Cantinho do Respiro', rect: { x: CANT.x, y: CANT.y, w: 17, h: 9 },
      piso: 'carpete', parede: 'papel', paleta: { piso: '#dff2ec', piso2: '#c4e6dc', parede: '#f2fbf8', parede2: '#cdeee4', rodape: '#5fb4a0', detalhe: '#9fd8c8' } },
    { id: 'lp-tesouros', nome: 'Galeria dos Tesouros', placa: 'Galeria dos Tesouros', rect: { x: TES.x, y: TES.y, w: 17, h: 9 },
      piso: 'mosaico', parede: 'papel', paleta: { piso: '#fff4d6', piso2: '#f2d890', parede: '#fff8e6', parede2: '#ffe6a8', rodape: '#c98a00', detalhe: '#8e4fd6' } },
  ]);

  R.registrarInterior({
    id: 'portugues-1',
    lugar: 'materia:portugues',
    nome: 'Casa das Palavras, 1º andar',
    pacote: 'interior-portugues',
    tamanho: { w: 37, h: 23 },
    spawn: { x: 18, y: 11 },   // (sem entrada) o mesmo lugar de quem sobe pela escada
    escadas: [{ x: 18, y: 10, para: 'portugues', olhar: { x: 0, y: 1 }, sentido: 'desce' }],
    comodos: comodos,
    portas: [
      { x: 12, y: 6, w: 1, h: 3 }, { x: 24, y: 6, w: 1, h: 3 },   // ateliê ↔ ateliê
      { x: 5, y: 12, w: 3, h: 3 },                               // Ateliê 10 ↔ Cantinho do Respiro
      { x: 29, y: 12, w: 3, h: 3 },                              // Ateliê 12 ↔ Galeria dos Tesouros
      { x: 18, y: 17, w: 1, h: 3 },                              // Cantinho ↔ Galeria
    ],
    corredores: [
      { x: 5, y: 3, w: 3, h: 9 }, { x: 17, y: 3, w: 3, h: 9 }, { x: 29, y: 3, w: 3, h: 9 }, { x: 1, y: 7, w: 35, h: 1 },   // ateliês
      { x: 5, y: 15, w: 3, h: 3 }, { x: 1, y: 18, w: 17, h: 1 },                                                      // Cantinho
    ],
    objetos: objetos,
    // os NPCs do andar vêm todos das reservas (anfitriões dos ateliês e a guardiã do Cantinho), com x/y da vaga
    npcs: R.personagensDoPredio('portugues-1').filter(function (p) { return p.x != null && p.y != null; }).map(function (p) {
      return npc(p.id, p.x, p.y, p.acao || K.GUIA);
    }),
  });
})();
