/* Ilustrações do Livro de Atividades de Matemática do Dia a Dia (grupo icones; Reino.registrarIlustracao,
   js/arte/ilustracoes.js): as 12 balas de Murilo (p. 7), os 8 «cupcakes» e as 21 maçãs do amor (p. 9) e o gráfico de
   barras "Pontuação no jogo" (p. 13), com uma fonte pixel 3×5 própria (só maiúsculas e algarismos). As salas ma1Xt*
   usam emojis que já têm desenho; as cédulas e moedas (ma:cedula-*, ma:moeda-*) são do icones-10.js. */
(function () {
  var K = '#3a2446', PAPEL = '#fffaf0';

  // repete um desenho pequeno em fileiras (balas, doces)
  function fileiras(sprite, paletas, n, porLinha, passoX, passoY) {
    var w = Math.min(n, porLinha) * passoX + 2, h = Math.ceil(n / porLinha) * passoY + 2;
    return { w: w, h: h, desenhar: function (ctx, D) {
      D.ret(ctx, 0, 0, w, h, PAPEL);
      for (var i = 0; i < n; i++) D.matriz(ctx, 1 + (i % porLinha) * passoX, 1 + Math.floor(i / porLinha) * passoY, sprite, paletas[i % paletas.length]);
    } };
  }

  var BALA = ['...kkkkk...', 'k.kccwwck.k', 'kkkcccccwkk', 'kccccccccck', 'kkkdccccckk', 'k.kddccck.k', '...kkkkk...'];
  function corBala(c, d) { return { k: K, c: c, d: d, w: '#ffffff' }; }
  Reino.registrarIlustracao('ma-t07-balas', fileiras(BALA, [corBala('#5fb4ff', '#2f7fd0'), corBala('#ff7eb6', '#d94f8f'),
    corBala('#ffd34d', '#d9a520'), corBala('#a77be8', '#7a4fc0')], 12, 12, 12, 9));

  var CUPCAKE = ['....kkkk....', '..kkppwpkk..', '.kppppppwpk.', 'kppppppppppk', 'kPppppppppPk', 'kkkkkkkkkkkk',
    '.kyYyYyYyYk.', '.kyYyYyYyYk.', '..kyYyYyYk..', '..kkkkkkkk..'];
  Reino.registrarIlustracao('ma-t09-cupcakes', fileiras(CUPCAKE,
    [{ k: K, p: '#ff9cc6', P: '#e86aa6', w: '#ffffff', y: '#ffe9b0', Y: '#e8b96a' }], 8, 4, 14, 12));

  var MACA = ['....b....', '....b....', '....b....', '..kkbkk..', '.krrrrwk.', 'krrrrrrwk', 'krrrrrrrk', 'krrrrrrrk',
    'kRrrrrrRk', '.kRRRRRk.', '..kkkkk..'];
  Reino.registrarIlustracao('ma-t09-macas', fileiras(MACA,
    [{ k: K, b: '#d9b27a', r: '#e8384f', R: '#b3203a', w: '#ffd0d8' }], 21, 7, 11, 13));

  /* ---------- fonte pixel 3×5 (M e N com 5 e 4 de largura); acentos desenhados à parte ---------- */
  var GLIFOS = {
    0: '###/#.#/#.#/#.#/###', 1: '.#./##./.#./.#./###', 2: '###/..#/###/#../###', 3: '###/..#/###/..#/###',
    4: '#.#/#.#/###/..#/..#', 5: '###/#../###/..#/###', 6: '###/#../###/#.#/###', 7: '###/..#/..#/..#/..#',
    8: '###/#.#/###/#.#/###', 9: '###/#.#/###/..#/###',
    A: '.#./#.#/###/#.#/#.#', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.', E: '###/#../##./#../###',
    F: '###/#../##./#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#', I: '###/.#./.#./.#./###',
    J: '..#/..#/..#/#.#/.#.', L: '#../#../#../#../###', M: '#...#/##.##/#.#.#/#...#/#...#', N: '#..#/##.#/#.##/#..#/#..#',
    O: '.#./#.#/#.#/#.#/.#.', P: '##./#.#/##./#../#..', Q: '.#./#.#/#.#/##./.##', R: '##./#.#/##./#.#/#.#',
    S: '.##/#../.#./..#/##.', T: '###/.#./.#./.#./.#.', U: '#.#/#.#/#.#/#.#/###', V: '#.#/#.#/#.#/.#./.#.',
  };
  var BASE = { 'Á': 'A', 'Ã': 'A', 'Ç': 'C' };
  // escreve s a partir de (x, y) (topo da letra); devolve a largura
  function texto(ctx, D, x, y, s, cor) {
    var x0 = x;
    String(s).split('').forEach(function (ch) {
      if (ch === ' ') { x += 3; return; }
      var g = GLIFOS[BASE[ch] || ch].split('/');
      g.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (l[i] === '#') D.ret(ctx, x + i, y + j, 1, 1, cor); });
      if (ch === 'Á') { D.ret(ctx, x + 2, y - 2, 1, 1, cor); D.ret(ctx, x + 1, y - 1, 1, 1, cor); }
      if (ch === 'Ã') { D.ret(ctx, x, y - 1, 2, 1, cor); D.ret(ctx, x + 1, y - 2, 2, 1, cor); }
      if (ch === 'Ç') { D.ret(ctx, x + 1, y + 5, 1, 1, cor); D.ret(ctx, x, y + 6, 1, 1, cor); }
      x += g[0].length + 1;
    });
    return x - x0 - 1;
  }
  function largura(s) {
    return String(s).split('').reduce(function (w, ch) {
      return w + (ch === ' ' ? 3 : GLIFOS[BASE[ch] || ch].split('/')[0].length + 1);
    }, 0) - 1;
  }

  /* ---------- gráfico de barras da p. 13: 4 px por ponto, linhas de grade de 2 em 2, de 0 a 30 ---------- */
  var JOGO = [['OTÁVIO', 12, 24], ['FLÁVIA', 14, 28], ['JAQUELINE', 12, 18], ['MARCELO', 10, 30]];
  var PERDIDOS = '#ff9a3c', GANHOS = '#8e4fd6', GRADE = '#e6dff2';
  var X0 = 6, W = 134, TOPO = 19, BLOCO = 19, EIXO = TOPO + 4 * BLOCO, H = EIXO + 22;
  function barra(ctx, D, y, pts, cor) {
    D.ret(ctx, X0, y, pts * 4 + 1, 5, K);
    D.ret(ctx, X0, y + 1, pts * 4, 3, cor);
  }
  Reino.registrarIlustracao('ma-t13-grafico', { w: W, h: H, desenhar: function (ctx, D) {
    D.ret(ctx, 0, 0, W, H, PAPEL);
    var titulo = 'PONTUAÇÃO NO JOGO';
    texto(ctx, D, (W - largura(titulo)) >> 1, 3, titulo, K);
    // legenda
    D.ret(ctx, 28, 12, 5, 5, K); D.ret(ctx, 29, 13, 3, 3, PERDIDOS);
    texto(ctx, D, 35, 12, 'PERDIDOS', K);
    D.ret(ctx, 74, 12, 5, 5, K); D.ret(ctx, 75, 13, 3, 3, GANHOS);
    texto(ctx, D, 81, 12, 'GANHOS', K);
    // grade, eixos e números
    for (var n = 2; n <= 30; n += 2) D.ret(ctx, X0 + n * 4, TOPO - 1, 1, EIXO - TOPO + 1, GRADE);
    JOGO.forEach(function (j, i) {
      var y = TOPO + 2 + i * BLOCO;
      texto(ctx, D, X0 + 2, y, j[0], K);
      barra(ctx, D, y + 6, j[1], PERDIDOS);
      barra(ctx, D, y + 11, j[2], GANHOS);
    });
    D.ret(ctx, X0, TOPO - 1, 1, EIXO - TOPO + 2, K);
    D.ret(ctx, X0, EIXO, 30 * 4 + 2, 1, K);
    for (n = 0; n <= 30; n += 2) {
      var s = String(n);
      // os números em duas fileiras (de 4 em 4 em cima, os outros embaixo), para não grudarem
      D.ret(ctx, X0 + n * 4, EIXO + 1, 1, n % 4 ? 7 : 1, n % 4 ? GRADE : K);
      texto(ctx, D, X0 + n * 4 - (largura(s) >> 1), n % 4 ? EIXO + 9 : EIXO + 3, s, K);
    }
    var eixo = 'QUANTIDADE DE PONTOS';
    texto(ctx, D, X0 + 60 - (largura(eixo) >> 1), EIXO + 16, eixo, K);
  } });
})();
