/* Casa do jogador: os móveis avulsos de Cozinha (casa.md §12; dados em js/conteudo/casa/moveis-salas.js), em pixel art.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, virado = R.CasaArte.virado;

  var ROSA = '#ffb3c7', MENTA = '#9fe3d0', AMAR = '#ffd34d', CORAL = '#ff8a7a', LIL = '#c9a6ff', AZUL = '#8fc8ff';
  var CASQ = '#e8a95a', MAD = '#c98a52', BARRO = '#d9825b', METAL = '#cfd8e3';

  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, escurecer(c, 0.2));
      },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
    };
    return p;
  }
  // casquinha com uma bola de sorvete (5×7)
  function casquinha(p, x, y, cor) {
    p.m(x, y, ['.kkk.', 'kccck', 'kcwck', 'kyyyk', '.kyk.', '.kyk.', '..k..'], { k: K, c: cor, w: C.branco, y: CASQ });
  }

  /* ----- sorveteira 1×1: máquina rosa com casquinhas ----- */
  I.objeto('casa-movel-sorveteira', { w: 1, h: 1, topo: 14, solido: true, alto: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(2, -14, 12, 6, ROSA); p.r(4, -12, 8, 2, C.branco); p.r(5, -12, 2, 1, CORAL);
      p.caixa(1, -9, 14, 16, ROSA);
      p.r(6, -8, 4, 3, K); p.r(7, -7, 2, 2, METAL);                     // bico
      casquinha(p, 6, -4, MENTA);
      p.caixa(1, 7, 14, 8, MENTA); p.r(10, 9, 2, 2, AMAR); p.r(12, 9, 2, 2, CORAL);
      casquinha(p, 2, 6, '#fff3a8');
    },
    cima: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(2, -14, 12, 6, escurecer(ROSA, 0.1));
      p.caixa(1, -9, 14, 16, escurecer(ROSA, 0.15));
      for (var y = -6; y < 4; y += 2) p.r(4, y, 8, 1, escurecer(ROSA, 0.4));
      p.r(7, -12, 2, 2, K);
      p.caixa(1, 7, 14, 8, escurecer(MENTA, 0.15));
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      p.caixa(4, -14, 10, 6, ROSA);
      p.caixa(4, -9, 11, 16, escurecer(ROSA, 0.08));
      p.r(1, -7, 4, 3, K); p.r(1, -6, 3, 1, METAL);                     // bico de lado
      casquinha(p, 0, -3, MENTA);
      p.caixa(1, 7, 14, 8, MENTA); p.r(10, 9, 2, 2, AMAR);
    },
  }) });

  /* ----- lixeira de pedal 1×1 ----- */
  I.objeto('casa-movel-lixeira', { w: 1, h: 1, topo: 4, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.caixa(3, -4, 10, 4, MENTA); p.r(7, -3, 2, 1, K);
    p.caixa(3, -1, 10, 14, MENTA);
    p.m(5, 3, ['.k.k.', 'kpkpk', 'kpppk', '.kpk.', '..k..'], { k: K, p: ROSA });   // coraçãozinho
    p.r(5, 13, 6, 3, K); p.r(6, 13, 4, 1, METAL);                      // pedal
  } });

  /* ----- prateleira de parede 2×2 com potes coloridos ----- */
  I.objeto('casa-movel-prateleira', { w: 2, h: 2, parede: true, solido: false, desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    function tabua(y) { p.r(1, y, 30, 3, K); p.r(2, y, 28, 1, clarear(MAD, 0.3)); p.r(2, y + 1, 28, 1, MAD); }
    function pote(x, y, cor, tampa) {
      p.r(x, y, 6, 2, K); p.r(x + 1, y, 4, 1, tampa);
      p.r(x, y + 2, 6, 7, K); p.r(x + 1, y + 2, 4, 6, cor); p.r(x + 1, y + 2, 1, 5, clarear(cor, 0.4));
    }
    pote(3, 4, AMAR, CORAL); pote(10, 4, ROSA, MENTA); pote(17, 4, AZUL, AMAR); pote(24, 4, MENTA, ROSA);
    tabua(13); p.r(4, 16, 2, 3, K); p.r(26, 16, 2, 3, K);
    pote(4, 19, LIL, AMAR); pote(11, 19, CORAL, AZUL);
    p.r(19, 21, 8, 7, K); p.r(20, 22, 6, 5, C.branco); p.r(21, 23, 4, 1, ROSA); p.r(21, 25, 3, 1, AZUL); // caderno de receitas
    tabua(28); p.r(4, 31, 2, 1, K); p.r(26, 31, 2, 1, K);
  } });

  /* ----- cesta de pães 1×1 ----- */
  I.objeto('casa-movel-cesta-paes', { w: 1, h: 1, topo: 4, solido: 'base', desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.m(2, -4, ['....kkkk....', '..kkyyyykk..', '.kyyyykkyyk.', 'kyyykyyyyyyk'], { k: K, y: '#f0b860' });  // pães
    p.r(1, 0, 14, 12, K); p.r(2, 1, 12, 10, MAD);
    for (var y = 3; y < 11; y += 3) p.r(2, y, 12, 1, escurecer(MAD, 0.3));
    for (var x = 4; x < 14; x += 3) p.r(x, 2, 1, 9, clarear(MAD, 0.25));
    p.r(1, 0, 14, 2, K); p.r(2, 0, 12, 1, CORAL); p.r(3, 0, 2, 1, C.branco); p.r(9, 0, 2, 1, C.branco);   // paninho xadrez
    p.r(3, 12, 10, 1, K);
  } });

  /* ----- filtro de água de barro 1×1 numa bancadinha ----- */
  I.objeto('casa-movel-filtro', { w: 1, h: 1, topo: 14, solido: true, alto: true, desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.r(6, -14, 4, 2, K); p.r(7, -14, 2, 1, BARRO);                    // tampinha
    p.r(3, -12, 10, 12, K); p.r(4, -11, 8, 10, BARRO); p.r(2, -9, 12, 6, K); p.r(3, -9, 10, 6, BARRO);
    p.r(4, -11, 2, 8, clarear(BARRO, 0.35)); p.r(4, -2, 8, 1, escurecer(BARRO, 0.3));
    p.r(3, 0, 10, 4, K); p.r(4, 0, 8, 3, BARRO); p.r(4, 0, 8, 1, clarear(BARRO, 0.3));
    p.r(12, 1, 3, 2, K); p.r(13, 1, 1, 1, METAL); p.r(13, 3, 1, 1, AZUL);   // torneirinha pingando
    p.caixa(1, 4, 14, 5, MENTA);
    p.r(2, 9, 2, 6, K); p.r(12, 9, 2, 6, K); p.r(4, 12, 8, 1, K);
    p.m(7, -8, ['.k.', 'kwk', 'kak', '.k.'], { k: K, w: C.branco, a: AZUL });   // gotinha desenhada
  } });

  /* ----- panelas penduradas 2×2 ----- */
  I.objeto('casa-movel-panelas', { w: 2, h: 2, parede: true, solido: false, desenhar: function (ctx, px, py) {
    var p = pincel(ctx, px, py);
    p.r(1, 3, 30, 3, K); p.r(2, 4, 28, 1, METAL);                      // barra
    // panela pendurada pelo cabo comprido num gancho, com borda de metal e alça do outro lado
    function panela(x, w, h, cor) {
      var c = x + (w >> 1);
      p.r(c, 6, 1, 2, K); p.r(c - 1, 8, 3, 1, K);                       // gancho
      p.r(c - 1, 9, 3, 8, K); p.r(c, 9, 1, 7, MAD);                     // cabo de madeira
      p.r(x, 17, w, 2, K); p.r(x + 1, 17, w - 2, 1, METAL);              // borda
      p.r(x, 19, w, h, K); p.r(x + 1, 19, w - 2, h - 1, cor);
      p.r(x + 1, 19, 1, h - 2, clarear(cor, 0.35)); p.r(x + 2, 18 + h - 1, w - 3, 1, escurecer(cor, 0.25));
      p.r(x + 2, 19 + h, w - 4, 1, K);                                  // fundo arredondado
    }
    panela(1, 9, 7, CORAL); panela(11, 9, 9, AZUL); panela(21, 6, 6, AMAR);
    p.r(3, 21, 2, 1, C.branco); p.r(13, 21, 2, 2, C.branco); p.r(23, 21, 1, 1, C.branco);   // brilhos
    p.r(28, 6, 3, 15, K); p.r(29, 6, 1, 14, METAL);                    // concha pendurada, longe das panelas
    p.r(27, 21, 5, 4, K); p.r(28, 21, 3, 2, METAL);
  } });
})();
