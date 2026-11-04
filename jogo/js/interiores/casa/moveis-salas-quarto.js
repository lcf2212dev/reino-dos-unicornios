/* Casa do jogador: os móveis avulsos de Quarto do jogador (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   Penteadeira, casa de boneca, baú de brinquedos, unicórnio de balanço, ursão, lousa e globo. baixo = de frente,
   cima = de costas, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K, CA = R.CasaArte, virado = CA.virado;
  var ROSA = '#ff8fc4', LIL = '#c9a8ff', LIL2 = '#efe4ff', AMAR = '#ffd84d', CEU = '#8fd0ff', MAD = '#f2c38a', MAD2 = '#d39a5c';
  var VIDRO = '#d4eef8', MARROM = '#b07a4a', MARROM2 = '#8a5a34', VERDE = '#7fe08a', AZUL = '#4fa8e8';

  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  function caixa(ctx, x, y, w, h, c) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, c);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
    ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(c, 0.2));
  }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  // estados com uso (casa.md §13): só ligado; o desligado é o desenho de sempre. Ver CA.animPorDir / CA.refazer (moveis-salas-banheiro.js)
  function coracao(ctx, x, y, c) { ret(ctx, x, y, 2, 2, c); ret(ctx, x + 3, y, 2, 2, c); ret(ctx, x, y + 1, 5, 2, c); ret(ctx, x + 1, y + 3, 3, 1, c); ret(ctx, x + 2, y + 4, 1, 1, c); }

  /* ---------- penteadeira (2×1; lado 1×2) ---------- */
  var penteadeira = I.objeto('casa-movel-penteadeira', { w: 2, h: 1, topo: 18, solido: 'base', alto: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        arred(ctx, px + 8, py - 18, 16, 16, K); arred(ctx, px + 9, py - 17, 14, 14, ROSA);         // moldura do espelho
        arred(ctx, px + 11, py - 15, 10, 10, VIDRO); ret(ctx, px + 12, py - 14, 1, 4, C.branco); ret(ctx, px + 13, py - 14, 1, 2, C.branco);
        coracao(ctx, px + 14, py - 17, C.branco);
        ret(ctx, px + 1, py - 3, 30, 5, K); ret(ctx, px + 2, py - 2, 28, 3, LIL); ret(ctx, px + 2, py - 2, 28, 1, clarear(LIL, 0.45));
        ret(ctx, px + 3, py - 7, 4, 4, K); ret(ctx, px + 4, py - 6, 2, 3, ROSA);                      // perfume
        circulo(ctx, px + 27, py - 5, 2, K); ret(ctx, px + 27, py - 6, 1, 1, AMAR);                   // potinho
        caixa(ctx, px + 2, py + 2, 11, 13, ROSA); caixa(ctx, px + 19, py + 2, 11, 13, ROSA);          // gavetas
        ret(ctx, px + 7, py + 7, 2, 1, AMAR); ret(ctx, px + 24, py + 7, 2, 1, AMAR);
        ret(ctx, px + 13, py + 2, 6, 3, K); ret(ctx, px + 14, py + 2, 4, 2, escurecer(LIL, 0.2));
      },
      cima: function (ctx, px, py) {
        arred(ctx, px + 8, py - 18, 16, 16, K); arred(ctx, px + 9, py - 17, 14, 14, escurecer(ROSA, 0.15));
        ret(ctx, px + 11, py - 14, 10, 1, escurecer(ROSA, 0.3)); ret(ctx, px + 11, py - 9, 10, 1, escurecer(ROSA, 0.3));
        ret(ctx, px + 1, py - 3, 30, 5, K); ret(ctx, px + 2, py - 2, 28, 3, LIL);
        caixa(ctx, px + 2, py + 2, 28, 13, escurecer(LIL, 0.15));
        for (var x = px + 8; x < px + 28; x += 7) ret(ctx, x, py + 4, 1, 9, escurecer(LIL, 0.35));
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 8, py - 18, 5, 22, K); ret(ctx, px + 9, py - 17, 3, 20, ROSA);                  // moldura do espelho, de lado
        ret(ctx, px + 9, py - 15, 1, 16, VIDRO); ret(ctx, px + 10, py - 17, 1, 20, clarear(ROSA, 0.4));
        caixa(ctx, px + 2, py + 3, 12, 28, LIL);                                                      // tampo embaixo
        ret(ctx, px + 2, py + 3, 4, 28, K); ret(ctx, px + 3, py + 4, 2, 26, ROSA);                    // gavetas à esquerda
        ret(ctx, px + 3, py + 10, 2, 1, K); ret(ctx, px + 3, py + 22, 2, 1, K);
        ret(ctx, px + 7, py + 20, 3, 4, K); ret(ctx, px + 8, py + 21, 1, 2, ROSA);                    // perfume
      },
    }) });
  penteadeira.anim = CA.animPorDir({                                                                  // ligado: o espelho brilha
    baixo: function (ctx, px, py, t) {
      var f = Math.floor(t / 110) % 16, r, x;
      for (r = 0; r < 10; r++) {
        x = f - r;                                                                                    // reflexo na diagonal, 2 de largura
        if (x < 0 || x > 9 || (r % 9 === 0 && (x === 0 || x === 9))) continue;
        ret(ctx, px + 11 + x, py - 15 + r, x < 9 ? 2 : 1, 1, C.branco);
      }
      penteadeiraFaiscas(ctx, px, py, t, 7, -14, 25, -9);
    },
    cima: function (ctx, px, py, t) { penteadeiraFaiscas(ctx, px, py, t, 7, -14, 25, -9); },
    lado: function (ctx, px, py, t) {
      ret(ctx, px + 9, py - 15 + Math.floor(t / 110) % 16, 1, 2, C.branco);
      penteadeiraFaiscas(ctx, px, py, t, 5, -12, 14, -6);
    },
  });
  function penteadeiraFaiscas(ctx, px, py, t, x1, y1, x2, y2) {
    var f = Math.floor(t / 240) % 4;
    if (f < 2) brilho(ctx, px + x1, py + y1, f ? C.branco : AMAR); else brilho(ctx, px + x2, py + y2, f === 2 ? AMAR : C.branco);
  }

  /* ---------- casa de boneca (2×1; lado 1×2) ---------- */
  function telhado(ctx, x, y, w, c) {
    for (var i = 0; i < 8; i++) ret(ctx, x + (w >> 1) - 1 - i * 2, y + i, 2 + i * 4, 1, K);
    for (i = 1; i < 7; i++) ret(ctx, x + (w >> 1) - i * 2 + 1, y + i, i * 4 - 2, 1, c);
  }
  function janelinha(ctx, x, y) { ret(ctx, x, y, 6, 6, K); ret(ctx, x + 1, y + 1, 4, 4, CEU); ret(ctx, x + 3, y + 1, 1, 4, C.branco); ret(ctx, x + 1, y + 3, 4, 1, C.branco); }
  var casaBoneca = I.objeto('casa-movel-casa-boneca', { w: 2, h: 1, topo: 16, solido: 'base', alto: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        telhado(ctx, px + 1, py - 16, 30, ROSA);
        caixa(ctx, px + 3, py - 9, 26, 24, C.branco); ret(ctx, px + 4, py + 3, 24, 1, LIL);
        janelinha(ctx, px + 6, py - 6); janelinha(ctx, px + 20, py - 6);
        ret(ctx, px + 13, py + 3, 6, 11, K); ret(ctx, px + 14, py + 4, 4, 10, ROSA); ret(ctx, px + 17, py + 9, 1, 1, AMAR);
        janelinha(ctx, px + 6, py + 5); coracao(ctx, px + 21, py + 6, ROSA);
      },
      cima: function (ctx, px, py) {
        telhado(ctx, px + 1, py - 16, 30, escurecer(ROSA, 0.15));
        caixa(ctx, px + 3, py - 9, 26, 24, LIL2);                                                     // aberta atrás: os andares
        ret(ctx, px + 4, py + 2, 24, 2, K); ret(ctx, px + 15, py - 8, 2, 22, K);
        ret(ctx, px + 6, py - 4, 6, 5, MAD); ret(ctx, px + 6, py - 4, 6, 1, K);                       // caminha
        ret(ctx, px + 20, py - 6, 4, 7, CEU); circulo(ctx, px + 9, py + 9, 2, AMAR);
        ret(ctx, px + 19, py + 7, 6, 6, ROSA); ret(ctx, px + 19, py + 7, 6, 1, K);
      },
      lado: function (ctx, px, py) {
        for (var i = 0; i < 18; i++) {                                                                // telhado inclinado, de lado
          var x = px + 1, w = 2 + (i * 10 / 17 | 0);
          ret(ctx, x, py - 16 + i, w + 2, 1, K); if (i && i < 17) ret(ctx, x + 1, py - 16 + i, w, 1, i < 3 ? clarear(ROSA, 0.3) : ROSA);
        }
        ret(ctx, px + 1, py + 1, 14, 2, K);
        caixa(ctx, px + 2, py + 2, 12, 29, C.branco);                                                 // 2 andares
        ret(ctx, px + 2, py + 16, 12, 2, K); ret(ctx, px + 3, py + 15, 10, 1, LIL);
        janelinha(ctx, px + 5, py + 6); janelinha(ctx, px + 5, py + 21);
      },
    }) });
  // ligado: a frente abre (os dois andares aparecem) e a luzinha pisca
  function faiscasTelhado(ctx, px, py, t) { if (Math.floor(t / 300) % 2) brilho(ctx, px + 4, py - 14, AMAR); else brilho(ctx, px + 27, py - 15, C.branco); }
  casaBoneca.anim = CA.animPorDir({
    baixo: function (ctx, px, py, t) {
      var luz = Math.floor(t / 400) % 2 ? '#fff6c8' : AMAR;
      ret(ctx, px + 4, py - 8, 24, 22, LIL2); ret(ctx, px + 4, py + 2, 24, 2, K);                    // dois andares à mostra
      ret(ctx, px + 15, py - 8, 2, 10, LIL); ret(ctx, px + 5, py + 4, 22, 1, LIL);
      ret(ctx, px + 6, py - 2, 9, 4, K); ret(ctx, px + 7, py - 1, 7, 2, MAD); ret(ctx, px + 7, py - 3, 3, 2, C.branco);   // caminha
      ret(ctx, px + 9, py - 1, 5, 2, ROSA); ret(ctx, px + 6, py + 1, 1, 1, K);
      ret(ctx, px + 19, py - 6, 5, 4, K); ret(ctx, px + 20, py - 5, 3, 2, CEU);                      // janelinha
      ret(ctx, px + 22, py - 1, 1, 3, K); ret(ctx, px + 20, py - 3, 5, 3, K); ret(ctx, px + 21, py - 2, 3, 1, luz);   // abajur
      ret(ctx, px + 6, py + 7, 10, 6, K); ret(ctx, px + 7, py + 8, 8, 4, ROSA); ret(ctx, px + 7, py + 8, 8, 1, clarear(ROSA, 0.4));   // sofazinho
      ret(ctx, px + 19, py + 6, 6, 7, K); ret(ctx, px + 20, py + 7, 4, 5, VERDE); ret(ctx, px + 21, py + 12, 2, 1, MARROM);
      ret(ctx, px + 1, py - 7, 3, 18, K); ret(ctx, px + 2, py - 6, 1, 16, ROSA);                       // as duas portas abertas
      ret(ctx, px + 28, py - 7, 3, 18, K); ret(ctx, px + 29, py - 6, 1, 16, ROSA);
      faiscasTelhado(ctx, px, py, t);
    },
    cima: faiscasTelhado,
    lado: function (ctx, px, py, t) {
      ret(ctx, px + 3, py + 3, 4, 13, LIL2); ret(ctx, px + 3, py + 18, 4, 12, LIL2);                 // a frente aberta: os andares
      ret(ctx, px + 4, py + 11, 3, 4, MAD); ret(ctx, px + 4, py + 10, 2, 1, C.branco);
      ret(ctx, px + 4, py + 25, 3, 4, ROSA); ret(ctx, px + 6, py + 20, 1, 3, Math.floor(t / 400) % 2 ? '#fff6c8' : AMAR);
      ret(ctx, px, py + 4, 3, 24, K); ret(ctx, px + 1, py + 5, 1, 22, ROSA);                      // porta aberta
      faiscasTelhado(ctx, px, py, t);
    },
  });

  /* ---------- baú de brinquedos aberto (2×1; lado 1×2) ---------- */
  var PULO = [0, 0, 0, VERDE];                                                                        // ligado: bola, bloco e varinha pulam (dy) e a ponta brilha
  function brinquedosDentro(ctx, x, y) {
    circulo(ctx, x + 4, y + 3 + PULO[0], 3, K); circulo(ctx, x + 4, y + 3 + PULO[0], 2, ROSA); ret(ctx, x + 3, y + 2 + PULO[0], 1, 1, C.branco);   // bola
    ret(ctx, x + 9, y - 2 + PULO[1], 7, 7, K); ret(ctx, x + 10, y - 1 + PULO[1], 5, 5, AMAR); ret(ctx, x + 12, y + PULO[1], 1, 3, K);             // bloco
    ret(ctx, x + 18, y - 4 + PULO[2], 2, 8, K); circulo(ctx, x + 19, y - 5 + PULO[2], 2, PULO[3]);                                                  // varinha
  }
  var brinquedos = I.objeto('casa-movel-brinquedos', { w: 2, h: 1, topo: 10, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        ret(ctx, px + 2, py - 10, 28, 8, K); ret(ctx, px + 3, py - 9, 26, 6, escurecer(CEU, 0.15));  // tampa aberta
        ret(ctx, px + 3, py - 9, 26, 1, clarear(CEU, 0.4));
        brinquedosDentro(ctx, px + 5, py - 1);
        caixa(ctx, px + 1, py + 1, 30, 14, CEU);
        ret(ctx, px + 2, py + 5, 28, 2, AMAR); coracao(ctx, px + 14, py + 8, ROSA);
        ret(ctx, px + 15, py + 2, 2, 2, K);
      },
      cima: function (ctx, px, py) {
        brinquedosDentro(ctx, px + 5, py - 3);
        caixa(ctx, px + 1, py - 3, 30, 10, escurecer(CEU, 0.1));
        ret(ctx, px + 1, py + 6, 30, 9, K); ret(ctx, px + 2, py + 7, 28, 7, escurecer(CEU, 0.25));   // tampa caída atrás
        ret(ctx, px + 2, py + 9, 28, 1, AMAR);
      },
      lado: function (ctx, px, py) {
        caixa(ctx, px + 3, py - 2, 11, 33, CEU);
        ret(ctx, px + 4, py + 1, 9, 27, escurecer(CEU, 0.35));                                       // o fundo do baú
        circulo(ctx, px + 8, py + 6 + PULO[0], 3, K); circulo(ctx, px + 8, py + 6 + PULO[0], 2, ROSA);
        ret(ctx, px + 5, py + 13 + PULO[1], 6, 6, K); ret(ctx, px + 6, py + 14 + PULO[1], 4, 4, AMAR);
        circulo(ctx, px + 8, py + 24 + PULO[2], 2, PULO[3]);
        ret(ctx, px + 12, py - 4, 4, 36, K); ret(ctx, px + 13, py - 3, 2, 34, escurecer(CEU, 0.15)); // tampa em pé
        ret(ctx, px + 3, py + 13, 1, 6, AMAR);
      },
    }) });
  CA.refazer(brinquedos, function (ctx, px, py, t, obj, orig) {
    var f = Math.floor(t / 130), pulo = [0, -2, -4, -5, -4, -2, 0, 0];
    PULO = [pulo[f % 8], pulo[(f + 3) % 8], pulo[(f + 5) % 8], f % 4 < 2 ? VERDE : AMAR];
    orig(ctx, px, py, obj); PULO = [0, 0, 0, VERDE];
  });

  /* ---------- unicórnio de balanço (1×1) ---------- */
  function cabecaUni(ctx, x, y, olha) {
    ret(ctx, x, y, 7, 7, K); ret(ctx, x + 1, y + 1, 5, 5, C.branco);
    ret(ctx, x + 2, y - 4, 2, 4, K); ret(ctx, x + 2, y - 3, 1, 3, AMAR);                              // chifre
    if (olha) { ret(ctx, x + 2, y + 2, 1, 1, K); ret(ctx, x + 4, y + 2, 1, 1, K); ret(ctx, x + 2, y + 4, 3, 1, ROSA); }
  }
  function balanco(ctx, x, y, w) {                                                                    // base curva
    ret(ctx, x + 2, y + 2, w - 4, 2, K); ret(ctx, x, y, 3, 3, K); ret(ctx, x + w - 3, y, 3, 3, K);
    ret(ctx, x + 3, y + 2, w - 6, 1, MAD); ret(ctx, x + 1, y + 1, 1, 1, MAD); ret(ctx, x + w - 2, y + 1, 1, 1, MAD);
  }
  var uniBalanco = I.objeto('casa-movel-uni-balanco', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        cabecaUni(ctx, px + 4, py - 8, true);
        ret(ctx, px + 2, py - 7, 3, 9, K); ret(ctx, px + 3, py - 6, 1, 7, ROSA);                     // crina
        ret(ctx, px + 3, py - 1, 10, 9, K); ret(ctx, px + 4, py, 8, 7, C.branco); ret(ctx, px + 5, py + 2, 6, 3, LIL);   // corpo e sela
        ret(ctx, px + 4, py + 8, 2, 4, K); ret(ctx, px + 10, py + 8, 2, 4, K);
        balanco(ctx, px + 1, py + 11, 14);
      },
      cima: function (ctx, px, py) {
        ret(ctx, px + 4, py - 8, 7, 7, K); ret(ctx, px + 5, py - 7, 5, 5, C.branco);
        ret(ctx, px + 5, py - 11, 2, 3, K); ret(ctx, px + 5, py - 10, 1, 2, AMAR);
        ret(ctx, px + 6, py - 8, 3, 15, K); ret(ctx, px + 7, py - 7, 1, 13, ROSA);                  // crina nas costas
        ret(ctx, px + 3, py - 1, 10, 9, K); ret(ctx, px + 4, py, 8, 7, C.branco); ret(ctx, px + 7, py, 2, 7, ROSA);
        ret(ctx, px + 7, py + 7, 2, 4, CEU);                                                          // rabo
        balanco(ctx, px + 1, py + 11, 14);
      },
      lado: function (ctx, px, py) {
        cabecaUni(ctx, px + 1, py - 8, false); ret(ctx, px + 2, py - 6, 1, 1, K); ret(ctx, px + 1, py - 3, 2, 1, ROSA);
        ret(ctx, px + 7, py - 8, 3, 8, K); ret(ctx, px + 8, py - 7, 1, 6, ROSA);
        ret(ctx, px + 4, py - 2, 10, 8, K); ret(ctx, px + 5, py - 1, 8, 6, C.branco); ret(ctx, px + 7, py - 1, 4, 3, LIL);
        ret(ctx, px + 13, py - 2, 3, 6, K); ret(ctx, px + 14, py - 1, 1, 4, CEU);                    // rabo
        ret(ctx, px + 5, py + 6, 2, 5, K); ret(ctx, px + 11, py + 6, 2, 5, K);
        balanco(ctx, px, py + 10, 16);
      },
    }) });
  CA.refazer(uniBalanco, function (ctx, px, py, t, obj, orig) {                                        // ligado: balança, 1 px para cada lado
    orig(ctx, px + [0, 1, 0, -1][Math.floor(t / 250) % 4], py, obj);
  });

  /* ---------- ursão de pelúcia (1×1) ---------- */
  function orelhas(ctx, x, y) { circulo(ctx, x + 3, y + 2, 2, K); circulo(ctx, x + 11, y + 2, 2, K); ret(ctx, x + 3, y + 2, 1, 1, MAD); ret(ctx, x + 11, y + 2, 1, 1, MAD); }
  var ursao = I.objeto('casa-movel-ursao', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        orelhas(ctx, px, py - 12);
        arred(ctx, px + 2, py - 11, 12, 11, K); arred(ctx, px + 3, py - 10, 10, 9, MARROM);
        ret(ctx, px + 5, py - 7, 1, 2, K); ret(ctx, px + 10, py - 7, 1, 2, K);
        ret(ctx, px + 6, py - 5, 4, 3, MAD); ret(ctx, px + 7, py - 5, 2, 1, K);                      // focinho
        arred(ctx, px + 1, py + 1, 14, 12, K); arred(ctx, px + 2, py + 2, 12, 10, MARROM);
        ret(ctx, px + 3, py - 1, 10, 2, ROSA); ret(ctx, px + 7, py - 1, 2, 2, K);                    // laço
        ret(ctx, px + 5, py + 4, 6, 6, MAD); coracao(ctx, px + 6, py + 5, ROSA);
        ret(ctx, px + 2, py + 11, 4, 3, K); ret(ctx, px + 10, py + 11, 4, 3, K);
        ret(ctx, px + 3, py + 12, 2, 1, MAD); ret(ctx, px + 11, py + 12, 2, 1, MAD);
      },
      cima: function (ctx, px, py) {
        orelhas(ctx, px, py - 12);
        arred(ctx, px + 2, py - 11, 12, 11, K); arred(ctx, px + 3, py - 10, 10, 9, MARROM2);
        arred(ctx, px + 1, py + 1, 14, 12, K); arred(ctx, px + 2, py + 2, 12, 10, MARROM2);
        ret(ctx, px + 3, py - 1, 10, 2, ROSA);
        ret(ctx, px + 7, py + 8, 2, 2, MAD);                                                          // rabinho
      },
      lado: function (ctx, px, py) {
        circulo(ctx, px + 9, py - 10, 2, K); ret(ctx, px + 9, py - 10, 1, 1, MAD);
        arred(ctx, px + 3, py - 11, 11, 11, K); arred(ctx, px + 4, py - 10, 9, 9, MARROM);
        ret(ctx, px + 1, py - 6, 4, 4, K); ret(ctx, px + 2, py - 5, 2, 2, MAD);                      // focinho
        ret(ctx, px + 6, py - 8, 1, 2, K);
        arred(ctx, px + 3, py + 1, 12, 12, K); arred(ctx, px + 4, py + 2, 10, 10, MARROM);
        ret(ctx, px + 5, py - 1, 8, 2, ROSA);
        ret(ctx, px + 1, py + 10, 7, 4, K); ret(ctx, px + 2, py + 11, 5, 2, MAD);                    // pezinho
      },
    }) });
  ursao.anim = CA.animPorDir({                                                                         // ligado: coraçõezinhos sobem
    baixo: function (ctx, px, py, t) {
      var f = Math.floor(t / 210);
      [[4, 0], [9, 4]].forEach(function (h) {
        var k = (f + h[1]) % 8, x = px + h[0] + [0, 1, 1, 0, 0, -1, -1, 0][k], y = py - 15 - k;
        if (k > 3) return;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { coracao(ctx, x + d[0], y + d[1], K); });
        coracao(ctx, x, y, k > 2 ? ROSA : '#ff6fa8'); ret(ctx, x + 1, y, 1, 1, C.branco);
      });
    },
  });

  /* ---------- lousa de parede (2×2) ---------- */
  I.objeto('casa-movel-lousa', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 30, 24, K); ret(ctx, px + 2, py + 4, 28, 22, MAD); ret(ctx, px + 2, py + 4, 28, 1, clarear(MAD, 0.4));
      ret(ctx, px + 4, py + 6, 24, 17, '#3f6b55');
      ret(ctx, px + 6, py + 8, 1, 1, C.branco); ret(ctx, px + 7, py + 7, 3, 1, C.branco); ret(ctx, px + 10, py + 8, 1, 1, C.branco);   // sol
      ret(ctx, px + 6, py + 9, 5, 1, C.branco); ret(ctx, px + 8, py + 10, 1, 1, AMAR);
      ret(ctx, px + 14, py + 8, 1, 6, C.branco);                                                       // "1+1"
      ret(ctx, px + 17, py + 10, 3, 1, ROSA); ret(ctx, px + 18, py + 9, 1, 3, ROSA);
      ret(ctx, px + 22, py + 8, 1, 6, C.branco);
      coracao(ctx, px + 7, py + 15, ROSA);
      ret(ctx, px + 15, py + 16, 1, 3, CEU); ret(ctx, px + 14, py + 17, 3, 1, CEU);                  // estrelinha
      ret(ctx, px + 20, py + 16, 6, 1, C.branco); ret(ctx, px + 20, py + 18, 6, 1, C.branco);        // "="
      ret(ctx, px + 2, py + 24, 28, 3, K); ret(ctx, px + 3, py + 25, 26, 1, MAD2);                   // aparador de giz
      ret(ctx, px + 7, py + 23, 3, 1, C.branco); ret(ctx, px + 12, py + 23, 3, 1, ROSA); ret(ctx, px + 22, py + 22, 4, 2, CEU);
    } });

  /* ---------- globo terrestre (1×1) ---------- */
  var TERRA = [[4, -7, 3, 3], [5, -5, 2, 3], [9, -6, 4, 2], [10, -4, 2, 4], [6, 1, 3, 1]], GIRO = 0;      // continentes (x, y, w, h); GIRO = colunas andadas
  var globo = I.objeto('casa-movel-globo', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 8, py - 3, 7, K); circulo(ctx, px + 8, py - 3, 6, AZUL);
      TERRA.forEach(function (r) {                                                                    // continentes: andam pela esfera e somem na borda
        for (var j = 0; j < r[3]; j++) for (var i = 0; i < r[2]; i++) {
          var x = (r[0] + i - 2 + GIRO) % 13 + 2, dy = r[1] + j + 3;
          if (Math.abs(x - 8) <= Math.floor(Math.sqrt(36 - dy * dy) + 0.35)) ret(ctx, px + x, py + r[1] + j, 1, 1, VERDE);
        }
      });
      ret(ctx, px + 5, py - 8, 2, 1, C.branco);                                                       // brilho
      ret(ctx, px + 14, py - 6, 2, 9, K); ret(ctx, px + 14, py - 5, 1, 7, AMAR);                      // meia argola
      ret(ctx, px + 7, py + 4, 2, 6, K); ret(ctx, px + 7, py + 5, 1, 4, AMAR);
      ret(ctx, px + 3, py + 10, 10, 4, K); ret(ctx, px + 4, py + 11, 8, 2, MAD2); ret(ctx, px + 4, py + 11, 8, 1, MAD);
    } });
  CA.refazer(globo, function (ctx, px, py, t, obj, orig) {                                                  // ligado: gira
    GIRO = Math.floor(t / 220) % 13; orig(ctx, px, py, obj); GIRO = 0;
  });
  /* ---------- camas: dossel e beliche (2×3; lado 3×2) ---------- */
  function trav(ctx, x, y, w, h) { arred(ctx, x, y, w, h, K); arred(ctx, x + 1, y + 1, w - 2, h - 2, C.branco); ret(ctx, x + 2, y + h - 2, w - 4, 1, LIL2); }
  function colcha(ctx, x, y, w, h, c, cor) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, c);
    ret(ctx, x + 1, y + 1, w - 2, 2, clarear(c, 0.45)); ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(c, 0.2));
    if (cor) coracao(ctx, x + (w >> 1) - 2, y + (h >> 1) - 1, cor);
  }
  function coluna(ctx, x, y, h) { ret(ctx, x, y, 3, h, K); ret(ctx, x + 1, y + 1, 1, h - 2, AMAR); ret(ctx, x, y - 2, 3, 2, K); ret(ctx, x + 1, y - 1, 1, 1, C.branco); }
  function veu(ctx, x, y, w) {                                                                        // cortina do alto, com franja
    ret(ctx, x, y, w, 5, K); ret(ctx, x + 1, y + 1, w - 2, 3, LIL); ret(ctx, x + 1, y + 1, w - 2, 1, LIL2);
    for (var i = x + 1; i < x + w - 2; i += 4) { ret(ctx, i, y + 4, 3, 2, K); ret(ctx, i + 1, y + 4, 1, 1, ROSA); }
  }
  I.objeto('casa-movel-cama-dossel', { w: 2, h: 3, topo: 16, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        veu(ctx, px, py - 14, 32);
        coluna(ctx, px + 1, py - 9, 54); coluna(ctx, px + 28, py - 9, 54);
        ret(ctx, px + 4, py - 9, 3, 30, K); ret(ctx, px + 5, py - 9, 1, 29, ROSA);                      // cortinas presas nas colunas
        ret(ctx, px + 25, py - 9, 3, 30, K); ret(ctx, px + 26, py - 9, 1, 29, ROSA);
        arred(ctx, px + 7, py - 6, 18, 10, K); arred(ctx, px + 8, py - 5, 16, 8, ROSA); coracao(ctx, px + 14, py - 4, C.branco);
        ret(ctx, px + 4, py + 4, 24, 38, K); ret(ctx, px + 5, py + 5, 22, 36, C.branco);
        trav(ctx, px + 7, py + 6, 18, 8);
        colcha(ctx, px + 4, py + 16, 24, 26, ROSA, C.branco);
        ret(ctx, px + 3, py + 41, 26, 5, K); ret(ctx, px + 4, py + 42, 24, 3, LIL); ret(ctx, px + 4, py + 42, 24, 1, LIL2);
      },
      cima: function (ctx, px, py) {
        veu(ctx, px, py - 14, 32);
        coluna(ctx, px + 1, py - 9, 54); coluna(ctx, px + 28, py - 9, 54);
        ret(ctx, px + 3, py - 4, 26, 5, K); ret(ctx, px + 4, py - 3, 24, 3, LIL);                       // pé da cama, no fundo
        ret(ctx, px + 4, py + 1, 24, 34, K); ret(ctx, px + 5, py + 2, 22, 32, C.branco);
        colcha(ctx, px + 4, py + 1, 24, 24, ROSA, C.branco);
        trav(ctx, px + 7, py + 25, 18, 8);
        arred(ctx, px + 4, py + 33, 24, 13, K); arred(ctx, px + 5, py + 34, 22, 11, escurecer(ROSA, 0.15));
        for (var i = px + 8; i < px + 26; i += 4) ret(ctx, i, py + 36, 1, 7, escurecer(ROSA, 0.3));
      },
      lado: function (ctx, px, py) {
        veu(ctx, px, py - 14, 48);
        coluna(ctx, px + 1, py - 9, 39); coluna(ctx, px + 44, py - 9, 39);
        ret(ctx, px + 4, py - 9, 3, 16, K); ret(ctx, px + 5, py - 9, 1, 15, ROSA);
        ret(ctx, px + 41, py - 9, 3, 16, K); ret(ctx, px + 42, py - 9, 1, 15, ROSA);
        ret(ctx, px + 5, py + 4, 36, 25, K); ret(ctx, px + 6, py + 5, 34, 23, C.branco);
        colcha(ctx, px + 4, py + 4, 28, 25, ROSA, C.branco);
        trav(ctx, px + 32, py + 5, 8, 18);
        ret(ctx, px + 4, py + 6, 3, 24, K); ret(ctx, px + 5, py + 7, 1, 22, LIL);                     // pé à esquerda
        arred(ctx, px + 39, py - 2, 5, 32, K); arred(ctx, px + 40, py - 1, 3, 30, ROSA); ret(ctx, px + 40, py, 1, 28, clarear(ROSA, 0.45));
      },
    }) });
  function escadinha(ctx, x, y, h) {
    ret(ctx, x, y, 2, h, K); ret(ctx, x + 6, y, 2, h, K); ret(ctx, x + 1, y, 1, h, MAD); ret(ctx, x + 7, y, 1, h, MAD);
    for (var j = y + 3; j < y + h - 1; j += 6) { ret(ctx, x, j, 8, 2, K); ret(ctx, x + 1, j, 6, 1, MAD); }
  }
  I.objeto('casa-movel-beliche', { w: 2, h: 3, topo: 24, solido: true, alto: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        ret(ctx, px + 1, py - 24, 3, 70, K); ret(ctx, px + 2, py - 23, 1, 68, MAD);                    // pés compridos
        ret(ctx, px + 28, py - 24, 3, 70, K); ret(ctx, px + 29, py - 23, 1, 68, MAD);
        ret(ctx, px + 4, py - 22, 24, 4, K); ret(ctx, px + 5, py - 21, 22, 2, MAD);                    // grade de cima
        trav(ctx, px + 7, py - 18, 18, 7); colcha(ctx, px + 4, py - 11, 24, 16, CEU, AMAR);
        ret(ctx, px + 4, py + 5, 24, 4, K); ret(ctx, px + 5, py + 6, 22, 2, MAD2);                     // estrado de cima
        trav(ctx, px + 7, py + 12, 18, 7); colcha(ctx, px + 4, py + 19, 24, 23, ROSA, C.branco);
        ret(ctx, px + 1, py + 41, 30, 5, K); ret(ctx, px + 2, py + 42, 28, 3, MAD); ret(ctx, px + 2, py + 42, 28, 1, clarear(MAD, 0.4));
        escadinha(ctx, px + 20, py - 18, 28);
      },
      cima: function (ctx, px, py) {
        ret(ctx, px + 1, py - 24, 3, 70, K); ret(ctx, px + 2, py - 23, 1, 68, MAD);
        ret(ctx, px + 28, py - 24, 3, 70, K); ret(ctx, px + 29, py - 23, 1, 68, MAD);
        colcha(ctx, px + 4, py - 22, 24, 22, CEU, AMAR);
        ret(ctx, px + 4, py, 24, 8, K); ret(ctx, px + 5, py + 1, 22, 6, MAD2);                        // tábua de trás
        colcha(ctx, px + 4, py + 8, 24, 26, ROSA, C.branco);
        ret(ctx, px + 4, py + 34, 24, 12, K); ret(ctx, px + 5, py + 35, 22, 10, MAD); ret(ctx, px + 5, py + 35, 22, 1, clarear(MAD, 0.4));
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 1, py - 24, 3, 55, K); ret(ctx, px + 2, py - 23, 1, 53, MAD);
        ret(ctx, px + 44, py - 24, 3, 55, K); ret(ctx, px + 45, py - 23, 1, 53, MAD);
        ret(ctx, px + 4, py - 20, 40, 3, K); ret(ctx, px + 5, py - 19, 38, 1, MAD);
        colcha(ctx, px + 4, py - 17, 30, 12, CEU, AMAR); trav(ctx, px + 34, py - 17, 10, 10);
        ret(ctx, px + 4, py - 5, 40, 4, K); ret(ctx, px + 5, py - 4, 38, 2, MAD2);
        colcha(ctx, px + 4, py + 4, 30, 18, ROSA, C.branco); trav(ctx, px + 34, py + 4, 10, 12);
        ret(ctx, px + 4, py + 22, 40, 6, K); ret(ctx, px + 5, py + 23, 38, 4, MAD);
        escadinha(ctx, px + 8, py - 17, 39);
      },
    }) });
})();
