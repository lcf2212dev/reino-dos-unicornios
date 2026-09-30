/* Laboratório de Química, 2º andar, parte 2 de 2 dos objetos próprios ('quimica-<nome>'): o Salão das Curiosidades
   (vitrines de museu, garrafas dos elementos, cordão, mapa do Brasil, quadro dos fogos) e a Biblioteca da Química
   (estante grande, retratos sem rosto, ciclo da água). Nada de canvas no carregamento. Contrato: docs/contratos/quimica.md §9. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios['quimica'];
  var v = S.v, LIQ = S.LIQ;
  var MOLDURA = C.ouro2, VERMELHO_MUSEU = '#c0394a';

  /* ================= SALÃO DAS CURIOSIDADES ================= */
  // o que cada vitrine guarda (desenhado dentro da redoma, centro cx, base by)
  var PECAS = {
    // diamante brilhante e o lápis de grafite: os dois são carbono
    diamante: function (ctx, cx, by) {
      matriz(ctx, cx - 5, by - 9, ['..kkkkk..', '.kwbwbbk.', 'kkkkkkkkk', '.kbwbbbk.', '..kbbbk..', '...kbk...', '....k....'], { k: K, w: C.branco, b: '#bfe9ff' });
      ret(ctx, cx + 3, by - 3, 6, 3, K); ret(ctx, cx + 4, by - 2, 3, 1, LIQ.amarelo); ret(ctx, cx + 7, by - 2, 1, 1, '#4a4a5a');
      R.Desenho.brilho(ctx, cx - 5, by - 11, C.branco);
    },
    // geodo aberto: casca de pedra e as pontinhas roxas por dentro
    geodo: function (ctx, cx, by) {
      matriz(ctx, cx - 6, by - 9, ['...kkkkkk...', '.kkppppppkk.', 'kpplwlwlwppk', 'kplwlwlwlwpk', 'kpplwlwlwppk', 'kppplllllppk', '.kkppppppkk.', '...kkkkkk...'],
        { k: K, p: C.pedra2, l: LIQ.roxo, w: '#e6d4ff' });
      R.Desenho.brilho(ctx, cx + 5, by - 10, C.branco);
    },
    // barra e pepitas de ouro
    ouro: function (ctx, cx, by) {
      matriz(ctx, cx - 6, by - 6, ['..kkkkkkkk..', '.kyyyyyyyyk.', 'kywyyyyyyydk', 'kddddddddddk', '.kkkkkkkkkk.'], { k: K, y: C.ouro, w: C.ouro3, d: C.ouro2 });
      ret(ctx, cx - 5, by - 9, 3, 3, K); ret(ctx, cx - 4, by - 8, 1, 1, C.ouro); ret(ctx, cx + 3, by - 10, 3, 3, K); ret(ctx, cx + 4, by - 9, 1, 1, C.ouro);
      R.Desenho.brilho(ctx, cx, by - 10, C.ouro3);
    },
    // vela acesa dentro do pote: o fogo precisa de ar
    vela: function (ctx, cx, by) {
      ret(ctx, cx - 2, by - 8, 5, 8, K); ret(ctx, cx - 1, by - 7, 3, 7, C.creme); ret(ctx, cx, by - 10, 1, 2, K);
      matriz(ctx, cx - 1, by - 15, ['.y.', 'yoy', 'yoy', '.y.'], { y: C.ouro, o: LIQ.laranja });
    },
    // copo de leite e banana: o corpo gosta de cálcio e potássio
    corpo: function (ctx, cx, by) {
      // copo alto de vidro, cheio de leite, com a borda de vidro em cima
      ret(ctx, cx - 5, by - 12, 5, 12, K); ret(ctx, cx - 4, by - 11, 3, 10, '#b8d4ec');
      ret(ctx, cx - 3, by - 9, 1, 8, '#fff8ec'); ret(ctx, cx - 3, by - 9, 1, 1, C.creme2);
      // banana deitada, curvinha, com o cabinho marrom
      matriz(ctx, cx, by - 7, ['...km', '..kyk', '..kyk', 'k.kyk', 'kykyk', 'kyyk.', '.kk..'], { k: K, y: LIQ.amarelo, m: '#6b4428' });
      ret(ctx, cx + 1, by - 3, 1, 1, D.clarear(LIQ.amarelo, 0.5));
    },
  };
  // vitrine de museu: pedestal com plaquinha dourada e a redoma de vidro (var.tema = uma das PECAS)
  I.objeto('quimica-vitrine-museu', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, cor = v(o, 'cor', S.COR);
      ret(ctx, px + 2, py + 11, 12, 4, K); ret(ctx, px + 3, py + 12, 10, 2, C.pedra2);
      ret(ctx, px + 3, py - 1, 10, 13, K); ret(ctx, px + 4, py, 8, 11, C.pedra); ret(ctx, px + 4, py, 2, 11, C.creme);
      ret(ctx, px + 5, py + 4, 6, 3, K); ret(ctx, px + 6, py + 5, 4, 1, C.ouro);
      ret(ctx, px + 1, py - 3, 14, 3, K); ret(ctx, px + 2, py - 2, 12, 1, cor);
      // redoma
      ret(ctx, px + 2, py - 20, 12, 17, K); ret(ctx, px + 3, py - 19, 10, 16, '#eef8ff'); ret(ctx, px + 3, py - 20, 10, 1, K);
      (PECAS[v(o, 'tema', 'diamante')] || PECAS.diamante)(ctx, cx, py - 4);
      ret(ctx, px + 3, py - 19, 1, 2, C.branco);
    } });

  // prateleira de museu com as garrafas dos elementos (cor e etiqueta de cada um)
  I.objeto('quimica-garrafas', { w: 2, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 20, 30, 35, K); ret(ctx, px + 2, py - 19, 28, 33, C.madeiraEscura); ret(ctx, px + 3, py - 18, 26, 31, '#3a2f4a');
      [py - 8, py + 3].forEach(function (y) { ret(ctx, px + 2, y, 28, 2, K); ret(ctx, px + 3, y, 26, 1, C.madeiraClara); });
      ret(ctx, px + 3, py + 5, 26, 8, C.madeira); ret(ctx, px + 12, py + 7, 8, 3, K); ret(ctx, px + 13, py + 8, 6, 1, C.ouro);
      // enxofre amarelo, cobre laranja, cloro verdinho, néon rosa e iodo roxo; embaixo carvão, sal e ferro
      [[4, LIQ.amarelo], [9, '#e07a4a'], [14, '#c9f07a'], [19, S.COR2], [24, LIQ.roxo]].forEach(function (g) {
        var x = px + g[0];
        ret(ctx, x + 1, py - 17, 2, 2, K); ret(ctx, x, py - 15, 4, 7, K); ret(ctx, x + 1, py - 14, 2, 5, g[1]); ret(ctx, x + 1, py - 14, 1, 1, C.branco);
      });
      [[4, '#4a4a5a'], [11, C.branco], [18, C.metal2], [24, C.ouro]].forEach(function (g) {
        var x = px + g[0];
        ret(ctx, x, py - 5, 5, 8, K); ret(ctx, x + 1, py - 4, 3, 6, S.VIDRO); ret(ctx, x + 1, py - 1, 3, 3, g[1]); ret(ctx, x + 1, py - 6, 3, 1, K);
      });
      R.Desenho.brilho(ctx, px + 20, py - 14, C.branco);
    } });

  // cordão de museu: dois postes dourados e a corda vermelha caída entre eles
  I.objeto('quimica-cordao', { w: 1, h: 1, topo: 4, solido: 'base',
    desenhar: function (ctx, px, py) {
      [px + 1, px + 12].forEach(function (x) {
        ret(ctx, x - 1, py + 12, 5, 3, K); ret(ctx, x, py + 13, 3, 1, C.ouro2);
        ret(ctx, x, py - 2, 3, 15, K); ret(ctx, x + 1, py - 1, 1, 13, C.ouro); ret(ctx, x - 1, py - 4, 5, 3, K); ret(ctx, x, py - 3, 3, 1, C.ouro3);
      });
      matriz(ctx, px + 4, py + 1, ['kk......kk', 'rrk....krr', '.rrkkkkrr.', '..rrrrrr..', '...kkkk...'], { k: K, r: VERMELHO_MUSEU });
    } });

  // mapa do Brasil (2×2): o contorno verde, os rios e os pontinhos do que se tira da terra
  I.objeto('quimica-mapa-brasil', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 30, 24, MOLDURA); ret(ctx, px + 2, py + 4, 28, 22, K); ret(ctx, px + 3, py + 5, 26, 20, '#bfe9ff');
      matriz(ctx, px + 5, py + 6, [
        '....gggggg..........', '..gggggggggggg......', '.gggggggggggggggg...', 'gggggggggggggggggggg', 'ggggggggggggggggggg.',
        '.gggggggggggggggggg.', '..gggggggggggggggg..', '....gggggggggggggg..', '.....gggggggggggg...', '......gggggggggg....',
        '.......ggggggggg....', '........gggggg......', '........ggggg.......', '.........gggg.......', '..........gg........',
        '..........g.........'], { g: '#6fdc8c' });
      // rios azuis e uma faixa mais escura de floresta
      ret(ctx, px + 7, py + 9, 12, 1, C.azul); ret(ctx, px + 18, py + 10, 1, 5, C.azul);
      ret(ctx, px + 7, py + 7, 8, 1, C.folha3);
      // pontinhos: ouro, ferro, sal (no mar) e o sol
      ret(ctx, px + 16, py + 15, 2, 2, C.ouro); ret(ctx, px + 13, py + 12, 2, 2, '#b95a36'); ret(ctx, px + 24, py + 11, 2, 2, C.branco);
      ret(ctx, px + 25, py + 20, 3, 3, C.ouro); ret(ctx, px + 26, py + 21, 1, 1, C.ouro3);
    } });

  // quadro dos fogos de artifício (1×2): céu escuro e estouros de cores diferentes
  I.objeto('quimica-fogos', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 14, 23, MOLDURA); ret(ctx, px + 2, py + 4, 12, 21, K); ret(ctx, px + 3, py + 5, 10, 19, '#1f1a3a');
      [[6, 9, LIQ.vermelho], [10, 13, C.verde], [6, 18, C.azul], [10, 7, LIQ.amarelo]].forEach(function (f) {
        var x = px + f[0], y = py + f[1];
        ret(ctx, x, y - 2, 1, 5, f[2]); ret(ctx, x - 2, y, 5, 1, f[2]);
        ret(ctx, x - 2, y - 2, 1, 1, f[2]); ret(ctx, x + 2, y - 2, 1, 1, f[2]); ret(ctx, x - 2, y + 2, 1, 1, f[2]); ret(ctx, x + 2, y + 2, 1, 1, f[2]);
        ret(ctx, x, y, 1, 1, C.branco);
      });
      ret(ctx, px + 3, py + 22, 10, 2, '#3a2f4a');
    } });

  /* ================= BIBLIOTECA DA QUÍMICA ================= */
  var CAPAS = [S.COR, S.COR2, C.azul, LIQ.amarelo, C.verde, LIQ.laranja, '#62d8c8', LIQ.vermelho, '#b58cff'];
  // uma fileira de lombadas na prateleira (base em by), alturas e cores variando
  function livros(ctx, x, by, largura, semente) {
    var i = 0;
    while (largura > 2) {
      var w = 2 + ((semente + i) % 2), h = 7 + ((semente * 3 + i) % 3), cor = CAPAS[(semente + i * 4) % CAPAS.length];
      if (w > largura) break;
      ret(ctx, x, by - h, w, h, cor); ret(ctx, x, by - h + 2, w, 1, D.clarear(cor, 0.5)); ret(ctx, x + w, by - h, 1, h, K);
      x += w + 1; largura -= w + 1; i++;
    }
  }
  // a estante grande dos livros (3×1, abre a tela): quatro prateleiras, a escadinha e o letreiro
  I.objeto('quimica-estante-livros', { w: 3, h: 1, topo: 28, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 28, 46, 43, K); ret(ctx, px + 2, py - 27, 44, 41, C.madeira); ret(ctx, px + 4, py - 22, 40, 34, '#5a3825');
      // letreiro no alto
      ret(ctx, px + 14, py - 28, 20, 5, K); ret(ctx, px + 15, py - 27, 18, 3, S.COR); ret(ctx, px + 17, py - 26, 14, 1, C.creme);
      [py - 14, py - 5, py + 4].forEach(function (y) { ret(ctx, px + 2, y, 44, 2, K); ret(ctx, px + 3, y, 42, 1, C.madeiraClara); });
      livros(ctx, px + 5, py - 14, 38, 1); livros(ctx, px + 5, py - 5, 38, 4); livros(ctx, px + 5, py + 4, 38, 7);
      ret(ctx, px + 5, py + 6, 38, 6, C.madeira2); ret(ctx, px + 22, py + 8, 4, 1, C.ouro);
      // um béquer e um átomo de enfeite entre os livros
      S.bequer(ctx, px + 36, py - 14, 6, 6, LIQ.verde);
      ret(ctx, px + 22, py - 21, 1, 1, K);
      // escadinha encostada
      ret(ctx, px + 40, py - 20, 2, 35, K); ret(ctx, px + 46, py - 20, 2, 35, K);
      for (var y = py - 16; y < py + 14; y += 6) ret(ctx, px + 40, y, 8, 2, C.madeiraClara);
    } });

  // retratos de cientistas sem rosto (1×2): o que cada um estudou, numa moldura dourada
  // var.desenho: 'balanca' (a balança antiga), 'frasco' (o frasco que brilha) ou 'tabela' (a tabelinha)
  I.objeto('quimica-retrato', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'balanca'), cx = px + 8, cy = py + 14;
      ret(ctx, px + 1, py + 3, 14, 23, MOLDURA); ret(ctx, px + 2, py + 4, 12, 21, K);
      ret(ctx, px + 3, py + 5, 10, 19, { balanca: '#fff0d6', frasco: '#2f3f6a', tabela: '#eef6ff' }[d] || '#fff0d6');
      ret(ctx, px + 4, py + 23, 8, 2, K); ret(ctx, px + 5, py + 23, 6, 1, C.ouro);
      if (d === 'balanca') {
        ret(ctx, cx, cy - 5, 1, 12, K); ret(ctx, cx - 5, cy - 5, 11, 1, K); ret(ctx, cx - 2, cy + 6, 5, 2, K);
        triangulo(ctx, cx - 6, cy - 4, 4, 4, C.ouro2); triangulo(ctx, cx + 3, cy - 4, 4, 4, C.ouro2);
        ret(ctx, cx - 6, cy, 4, 1, K); ret(ctx, cx + 3, cy, 4, 1, K);
      } else if (d === 'frasco') {
        S.conico(ctx, cx, cy + 6, 9, 11, '#7dff9a');
        ret(ctx, cx - 4, cy - 7, 1, 1, '#c9ffd6'); ret(ctx, cx + 4, cy - 5, 1, 1, '#c9ffd6'); R.Desenho.brilho(ctx, cx + 3, cy + 1, '#eaffef');
      } else {
        var cores = [S.COR2, LIQ.amarelo, C.azul, C.verde];
        for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) if (j > 0 || i === 0 || i === 3) ret(ctx, px + 4 + i * 2, cy - 5 + j * 3, 2, 2, cores[(i + j) % 4]);
        ret(ctx, px + 5, cy + 7, 6, 1, K);
      }
    } });

  // cartaz do ciclo da água (2×2): sol, mar, vapor subindo, nuvem e chuva voltando
  I.objeto('quimica-ciclo-agua', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 3, 30, 24, K, '#eaf8ff');
      ret(ctx, px + 2, py + 20, 28, 6, C.azul); ret(ctx, px + 2, py + 20, 28, 1, C.azul2);
      ret(ctx, px + 22, py + 17, 8, 3, C.folha3); ret(ctx, px + 24, py + 15, 5, 2, C.folha);
      circulo(ctx, px + 7, py + 8, 3, C.ouro); ret(ctx, px + 7, py + 3 + 1, 1, 1, C.ouro); ret(ctx, px + 2, py + 8, 1, 1, C.ouro);
      // setas: sobe do mar (vapor) e desce da nuvem (chuva)
      matriz(ctx, px + 9, py + 11, ['.k.', 'kkk', '.k.', '.k.', '.k.', '.k.'], { k: '#9fb4c8' });
      ret(ctx, px + 15, py + 6, 11, 4, K); ret(ctx, px + 16, py + 5, 7, 5, K); ret(ctx, px + 16, py + 7, 9, 2, C.branco); ret(ctx, px + 17, py + 6, 5, 1, C.branco);
      [[17, 12], [20, 14], [23, 12], [19, 17], [24, 16]].forEach(function (g) { ret(ctx, px + g[0], py + g[1], 1, 2, C.azul); });
    } });
})();
