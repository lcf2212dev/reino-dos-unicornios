/* Casa do jogador: os móveis avulsos do Quarto do ET (casa.md §12; dados em js/conteudo/casa/moveis-salas.js).
   Cama foguete, disco voador, telescópio, painel da nave, planta alien, abajur Saturno, quadro galáxia e robozinho.
   Ligado (casa.md §13): CasaArte.objeto desenha o estado por cima; desligado ou sem uid é o desenho de sempre.
   cima = de costas, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K, CA = R.CasaArte, virado = CA.virado;
  var LIMA = '#b8f04a', LIMA2 = '#7cc82a', LIL = '#c9a8ff', ROXO = '#9b7cf0', NOITE = '#2b3a7a', NOITE2 = '#4a5cb0';
  var AMAR = '#ffd84d', VIDRO = '#bfeaff', ROSA = '#ff8fc4', APAG = '#6a6a8a', CINZA = '#d8dcf0';
  var LUZES = [ROSA, AMAR, LIMA, VIDRO];

  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  function estrela(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }
  function ceu(ctx, x, y, w, h, pontos) {                                                             // noite com estrelinhas
    ret(ctx, x, y, w, h, NOITE);
    for (var i = 0; i < pontos.length; i++) ret(ctx, x + pontos[i][0], y + pontos[i][1], 1, 1, i % 3 ? C.branco : AMAR);
  }
  function piscaLuzes(p, t, lista) {                                                                   // luzinhas em roda
    var f = Math.floor(t / 180);
    for (var i = 0; i < lista.length; i++) p.r(lista[i][0], lista[i][1], 2, 2, LUZES[(f + i) % LUZES.length]);
  }

  /* ---------- cama foguete (2×3): bico na cabeceira, janelinha, aletas no pé ---------- */
  function bicoCima(ctx, cx, y, n) { for (var i = 0; i < n; i++) { ret(ctx, cx - 2 - i, y + i, 4 + i * 2, 1, K); if (i) ret(ctx, cx - 1 - i, y + i, i * 2 + 2, 1, ROSA); } }
  function bicoBaixo(ctx, cx, y, n) { for (var i = 0; i < n; i++) { ret(ctx, cx - 2 - i, y - i, 4 + i * 2, 1, K); if (i) ret(ctx, cx - 1 - i, y - i, i * 2 + 2, 1, ROSA); } }
  function bicoLado(ctx, x, cy, n) { for (var i = 0; i < n; i++) { ret(ctx, x - i, cy - 2 - i, 1, 4 + i * 2, K); if (i) ret(ctx, x - i, cy - 1 - i, 1, i * 2 + 2, ROSA); } }
  function janela(ctx, x, y) { circulo(ctx, x, y, 4, K); circulo(ctx, x, y, 3, ROXO); circulo(ctx, x, y, 2, VIDRO); ret(ctx, x - 1, y - 1, 1, 1, C.branco); }
  function colchaNoite(ctx, x, y, w, h) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, NOITE); ret(ctx, x + 1, y + 1, w - 2, 2, NOITE2);
    for (var j = 0, k = 0; j < h - 8; j += 6) for (var i = 3 + (j % 12 ? 3 : 0); i < w - 3; i += 7, k++) estrela(ctx, x + i, y + 6 + j, k % 2 ? AMAR : C.branco);
  }
  function aleta(ctx, x, y, h, esq) {                                                                  // aleta em degraus
    for (var i = 0; i < h; i++) { var l = Math.min(5, 1 + (i >> 1)); ret(ctx, esq ? x - l : x, y + i, l + 1, 1, K); if (l > 1) ret(ctx, esq ? x - l + 1 : x + 1, y + i, l - 1, 1, ROXO); }
  }
  I.objeto('casa-movel-cama-foguete', { w: 2, h: 3, topo: 14, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        bicoCima(ctx, px + 16, py - 14, 15);
        aleta(ctx, px + 5, py + 30, 14, true); aleta(ctx, px + 26, py + 30, 14, false);
        ret(ctx, px + 3, py, 26, 45, K); ret(ctx, px + 4, py + 1, 24, 43, LIMA); ret(ctx, px + 4, py + 1, 2, 43, clarear(LIMA, 0.4));
        ret(ctx, px + 4, py + 1, 24, 2, LIL);
        janela(ctx, px + 16, py - 5);
        arred(ctx, px + 7, py + 6, 18, 10, K); arred(ctx, px + 8, py + 7, 16, 8, C.branco); ret(ctx, px + 9, py + 13, 14, 1, CINZA);
        colchaNoite(ctx, px + 4, py + 17, 24, 27);
        ret(ctx, px + 7, py + 44, 18, 4, K); ret(ctx, px + 8, py + 44, 16, 2, ROXO);
      },
      cima: function (ctx, px, py) {
        aleta(ctx, px + 5, py - 8, 14, true); aleta(ctx, px + 26, py - 8, 14, false);
        ret(ctx, px + 7, py - 12, 18, 5, K); ret(ctx, px + 8, py - 11, 16, 3, ROXO);                   // pé, no fundo
        ret(ctx, px + 3, py - 8, 26, 44, K); ret(ctx, px + 4, py - 7, 24, 42, LIMA); ret(ctx, px + 26, py - 7, 2, 42, LIMA2);
        colchaNoite(ctx, px + 4, py - 7, 24, 27);
        arred(ctx, px + 7, py + 22, 18, 10, K); arred(ctx, px + 8, py + 23, 16, 8, C.branco);
        ret(ctx, px + 4, py + 33, 24, 2, LIL);
        bicoBaixo(ctx, px + 16, py + 47, 12);
      },
      lado: function (ctx, px, py) {
        aleta(ctx, px + 8, py - 2, 8, true); aleta(ctx, px + 8, py + 22, 8, true);
        ret(ctx, px + 4, py + 2, 34, 27, K); ret(ctx, px + 5, py + 3, 32, 25, LIMA); ret(ctx, px + 5, py + 3, 32, 2, clarear(LIMA, 0.4));
        bicoLado(ctx, px + 47, py + 15, 10);
        ret(ctx, px + 36, py + 3, 2, 25, LIL);
        arred(ctx, px + 27, py + 6, 9, 17, K); arred(ctx, px + 28, py + 7, 7, 15, C.branco);
        colchaNoite(ctx, px + 5, py + 3, 22, 26);
        ret(ctx, px + 1, py + 6, 4, 19, K); ret(ctx, px + 2, py + 7, 2, 17, ROXO);
      },
    }) });

  /* ---------- disco voador (2×2): pedestal, disco e cúpula com um ETzinho; ligado, as luzes da borda piscam ---------- */
  var BORDA = [[4, 13], [9, 14], [15, 15], [21, 14], [26, 13]];
  function et(ctx, x, y) {                                                                             // ETzinho de pelúcia
    ret(ctx, x + 1, y - 4, 1, 3, K); ret(ctx, x + 6, y - 4, 1, 3, K); ret(ctx, x, y - 5, 2, 2, LIMA); ret(ctx, x + 6, y - 5, 2, 2, LIMA);
    arred(ctx, x, y - 1, 8, 8, K); arred(ctx, x + 1, y, 6, 6, LIMA);
    ret(ctx, x + 2, y + 2, 1, 2, K); ret(ctx, x + 5, y + 2, 1, 2, K); ret(ctx, x + 3, y + 5, 2, 1, K);
  }
  CA.objeto('casa-movel-disco-voador', { w: 2, h: 2, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 16, py + 5, 9, K); circulo(ctx, px + 16, py + 5, 8, VIDRO);                   // cúpula
      et(ctx, px + 12, py + 2);
      ret(ctx, px + 10, py - 1, 2, 2, C.branco);
      arred(ctx, px, py + 9, 32, 9, K); arred(ctx, px + 1, py + 10, 30, 7, ROXO); ret(ctx, px + 2, py + 10, 28, 2, LIL);
      BORDA.forEach(function (b) { ret(ctx, px + b[0], py + b[1], 2, 2, APAG); });
      ret(ctx, px + 13, py + 18, 6, 7, K); ret(ctx, px + 14, py + 18, 4, 6, NOITE2);                   // haste e base
      arred(ctx, px + 6, py + 24, 20, 7, K); arred(ctx, px + 7, py + 25, 18, 5, NOITE); ret(ctx, px + 8, py + 25, 16, 1, NOITE2);
      estrela(ctx, px + 11, py + 27, AMAR); estrela(ctx, px + 21, py + 27, C.branco);
    } }, {
    baixo: function (p) { BORDA.forEach(function (b, i) { p.r(b[0], b[1], 2, 2, LUZES[i % 4]); }); },
    anim: { baixo: function (p, t) { piscaLuzes(p, t, BORDA); p.r(14, 18, 4, 1, LIMA); } } });

  /* ---------- telescópio (1×1): tripé e luneta; ligado, brilha uma estrelinha na lente ---------- */
  function tubo(ctx, x, y, n, dx) {                                                                    // luneta em degraus
    for (var i = 0; i < n; i++) ret(ctx, x + i * dx, y - i, 4, 4, K);
    for (i = 0; i < n; i++) ret(ctx, x + i * dx + 1, y - i + 1, 2, 2, i === 3 ? LIMA : LIL);
  }
  function tripe(ctx, px, py) {
    ret(ctx, px + 7, py - 2, 2, 12, K); ret(ctx, px + 3, py + 8, 10, 2, K);
    for (var i = 0; i < 6; i++) { ret(ctx, px + 6 - i, py + 4 + i, 2, 1, K); ret(ctx, px + 8 + i, py + 4 + i, 2, 1, K); }
    ret(ctx, px + 6, py - 3, 4, 3, K); ret(ctx, px + 7, py - 2, 2, 1, ROXO);
  }
  function brilhoLente(p, t, x) { var c = Math.floor(t / 200) % 2 ? AMAR : C.branco; p.r(x, -13, 2, 2, C.branco); p.r(x, -17, 1, 2, c); p.r(x + 1, -16, 1, 1, c); }
  CA.objeto('casa-movel-telescopio', { w: 1, h: 1, topo: 17, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { tripe(ctx, px, py); tubo(ctx, px + 3, py - 3, 9, 1); circulo(ctx, px + 13, py - 12, 2, K); ret(ctx, px + 12, py - 13, 2, 2, VIDRO); },
      cima: function (ctx, px, py) { tripe(ctx, px, py); tubo(ctx, px + 9, py - 3, 9, -1); circulo(ctx, px + 2, py - 12, 2, K); ret(ctx, px + 1, py - 13, 2, 2, NOITE2); },
      lado: function (ctx, px, py) { tripe(ctx, px, py); tubo(ctx, px + 9, py - 3, 9, -1); circulo(ctx, px + 2, py - 12, 2, K); ret(ctx, px + 1, py - 13, 2, 2, VIDRO); },
    }) }, {
    // ligado: a lente acesa (de costas não se vê a lente)
    baixo: function (p) { p.r(12, -13, 2, 2, AMAR); }, cima: function (p) { p.r(1, -13, 2, 2, AMAR); }, lado: function (p) { p.r(1, -13, 2, 2, AMAR); },
    anim: { baixo: function (p, t) { brilhoLente(p, t, 12); }, cima: function () {}, lado: function (p, t) { brilhoLente(p, t, 1); } } });

  /* ---------- painel da nave (2×1): telinha e botões; ligado, a tela mostra estrelas e os botões piscam ---------- */
  var BOTOES = [[5, 6], [10, 6], [20, 6], [25, 6]];
  CA.objeto('casa-movel-painel-nave', { w: 2, h: 1, topo: 14, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        ret(ctx, px + 6, py - 14, 20, 14, K); ret(ctx, px + 7, py - 13, 18, 12, NOITE2);              // telinha
        ret(ctx, px + 9, py - 11, 14, 8, NOITE); ret(ctx, px + 10, py - 7, 12, 1, LIMA2);
        ret(ctx, px + 1, py, 30, 15, K); ret(ctx, px + 2, py + 1, 28, 13, LIL); ret(ctx, px + 2, py + 1, 28, 2, clarear(LIL, 0.4));
        ret(ctx, px + 2, py + 11, 28, 3, ROXO);
        BOTOES.forEach(function (b, i) { ret(ctx, px + b[0], py + b[1], 3, 3, K); ret(ctx, px + b[0] + 1, py + b[1] + 1, 1, 1, escurecer(LUZES[i], 0.3)); });
        ret(ctx, px + 14, py + 5, 4, 5, K); ret(ctx, px + 15, py + 6, 2, 3, ROSA);                    // alavanca
      },
      cima: function (ctx, px, py) {
        ret(ctx, px + 6, py - 14, 20, 14, K); ret(ctx, px + 7, py - 13, 18, 12, ROXO);
        ret(ctx, px + 1, py, 30, 15, K); ret(ctx, px + 2, py + 1, 28, 13, LIL);
        for (var x = px + 6; x < px + 27; x += 4) ret(ctx, x, py + 4, 2, 6, ROXO);                     // grade de ar
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 4, py - 14, 9, 14, K); ret(ctx, px + 5, py - 13, 7, 12, ROXO);
        ret(ctx, px + 1, py, 14, 31, K); ret(ctx, px + 2, py + 1, 12, 29, LIL); ret(ctx, px + 2, py + 1, 12, 2, clarear(LIL, 0.4));
        ret(ctx, px + 2, py + 27, 12, 3, ROXO); ret(ctx, px + 1, py + 8, 3, 3, K); ret(ctx, px + 1, py + 20, 3, 3, K);
      },
    }) }, {
    baixo: function (p) { BOTOES.forEach(function (b, i) { p.r(b[0] + 1, b[1] + 1, 1, 1, LUZES[i]); }); },
    // de costas e de lado: a luzinha verde de "ligado"
    cima: function (p) { p.r(14, 2, 4, 2, LIMA); }, lado: function (p) { p.r(5, -12, 7, 1, LIMA); },
    anim: {
      baixo: function (p, t) {
        var f = Math.floor(t / 160);
        p.r(9, -11, 14, 8, NOITE);
        for (var i = 0; i < 4; i++) p.r(9 + ((f * 2 + i * 5) % 14), -11 + ((i * 3) % 8), 1, 1, i % 2 ? AMAR : C.branco);
        BOTOES.forEach(function (b, i) { if ((f + i) % 2) p.r(b[0] + 1, b[1] + 1, 1, 1, C.branco); });
      },
      cima: function () {},
      lado: function (p, t) { p.r(5, -12, 7, 1, Math.floor(t / 160) % 2 ? LIMA : AMAR); },
    } });

  /* ---------- planta alien (1×1): talos verdes e bolinhas que brilham, num vaso lilás ---------- */
  I.objeto('casa-movel-planta-alien', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      [[4, -8, 9], [8, -11, 12], [12, -6, 7]].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], 2, s[2] + 1, K); ret(ctx, px + s[0], py + s[1] + 1, 1, s[2], LIMA2);
        circulo(ctx, px + s[0], py + s[1] - 1, 3, K); circulo(ctx, px + s[0], py + s[1] - 1, 2, ROXO);
        ret(ctx, px + s[0] - 1, py + s[1] - 2, 2, 2, LIMA); ret(ctx, px + s[0] - 1, py + s[1] - 2, 1, 1, C.branco);
      });
      ret(ctx, px + 2, py - 1, 4, 2, K); ret(ctx, px + 3, py - 1, 2, 1, LIMA); ret(ctx, px + 10, py - 1, 4, 2, K); ret(ctx, px + 11, py - 1, 2, 1, LIMA);
      ret(ctx, px + 2, py + 1, 12, 3, K); ret(ctx, px + 3, py + 2, 10, 1, LIL);                       // vaso
      ret(ctx, px + 3, py + 4, 10, 10, K); ret(ctx, px + 4, py + 4, 8, 9, ROXO); ret(ctx, px + 4, py + 4, 2, 9, LIL);
      estrela(ctx, px + 9, py + 8, AMAR);
    } });

  /* ---------- abajur Saturno (1×1): cúpula de planeta com anel; ligado, acende ---------- */
  function planeta(ctx, x, y, cor, anel) {
    circulo(ctx, x, y, 6, K); circulo(ctx, x, y, 5, cor); ret(ctx, x - 3, y - 3, 2, 2, clarear(cor, 0.5));
    ret(ctx, x - 8, y, 16, 3, K); ret(ctx, x - 7, y + 1, 14, 1, anel);
  }
  CA.objeto('casa-movel-abajur-saturno', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      planeta(ctx, px + 8, py - 10, ROXO, AMAR);
      ret(ctx, px + 7, py - 3, 2, 12, K); ret(ctx, px + 7, py - 2, 1, 10, LIL);
      arred(ctx, px + 3, py + 8, 10, 5, K); arred(ctx, px + 4, py + 9, 8, 3, NOITE2); ret(ctx, px + 4, py + 9, 8, 1, LIL);
    } }, {
    baixo: function (p) {
      p.r(4, -14, 9, 4, '#efe4ff'); p.r(3, -11, 11, 1, '#efe4ff'); p.r(5, -13, 2, 1, C.branco);
      p.r(1, -9, 14, 1, '#fff6b8');
      p.r(4, 9, 8, 1, clarear(LIL, 0.6));
    },
    anim: { baixo: function (p, t) { var f = Math.floor(t / 300) % 3; [[1, -16], [14, -14], [2, -4]].forEach(function (b, i) { if ((f + i) % 3) p.r(b[0], b[1], 1, 1, AMAR); }); } } });

  /* ---------- quadro galáxia (parede 2×2): espiral e estrelinhas ---------- */
  var ESPIRAL = [[0, 0], [1, 0], [2, 1], [2, 2], [1, 3], [0, 3], [-1, 3], [-2, 2], [-3, 1], [-3, 0], [-3, -1], [-2, -2], [-1, -3],
    [0, -3], [1, -3], [2, -3], [3, -2], [4, -1], [5, 0], [5, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 5]];
  I.objeto('casa-movel-quadro-galaxia', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 4, 28, 24, K); ret(ctx, px + 3, py + 5, 26, 22, ROXO); ret(ctx, px + 3, py + 5, 26, 1, LIL);
      ceu(ctx, px + 5, py + 7, 22, 18, [[2, 2], [19, 3], [4, 14], [17, 15], [10, 1], [1, 9], [20, 10]]);
      var cx = px + 15, cy = py + 15;
      for (var i = 0; i < ESPIRAL.length; i++) {
        var e = ESPIRAL[i], c = i < 8 ? C.branco : i < 16 ? LIL : null;
        ret(ctx, cx + e[0], cy + e[1], 1, 1, c || ROSA); ret(ctx, cx - e[0], cy - e[1], 1, 1, c || VIDRO);
      }
      ret(ctx, cx - 1, cy - 1, 2, 2, AMAR);
      estrela(ctx, px + 9, py + 11, AMAR); estrela(ctx, px + 23, py + 21, C.branco);
    } });

  /* ---------- robozinho (1×1): robô de brinquedo com antena; ligado, a antena pisca e os olhos acendem ---------- */
  function corpoRobo(ctx, px, py) {
    ret(ctx, px + 4, py + 4, 8, 7, K); ret(ctx, px + 5, py + 5, 6, 5, CINZA);                         // corpo
    ret(ctx, px + 3, py + 11, 4, 3, K); ret(ctx, px + 9, py + 11, 4, 3, K);                          // pezinhos
    ret(ctx, px + 7, py - 8, 2, 4, K); circulo(ctx, px + 8, py - 9, 2, K); ret(ctx, px + 7, py - 10, 2, 2, ROSA);
  }
  function antena(p, t) { p.r(7, -10, 2, 2, Math.floor(t / 350) % 2 ? AMAR : C.branco); }
  CA.objeto('casa-movel-robozinho', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        corpoRobo(ctx, px, py);
        ret(ctx, px + 2, py - 5, 12, 10, K); ret(ctx, px + 3, py - 4, 10, 8, LIMA); ret(ctx, px + 3, py - 4, 10, 1, clarear(LIMA, 0.4));
        ret(ctx, px + 5, py - 2, 2, 2, K); ret(ctx, px + 9, py - 2, 2, 2, K); ret(ctx, px + 6, py + 2, 4, 1, K);
        ret(ctx, px + 1, py - 1, 1, 3, K); ret(ctx, px + 14, py - 1, 1, 3, K);
        ret(ctx, px + 6, py + 6, 4, 2, ROXO); ret(ctx, px + 6, py + 6, 1, 1, AMAR);
        ret(ctx, px + 2, py + 5, 2, 4, K); ret(ctx, px + 12, py + 5, 2, 4, K);
      },
      cima: function (ctx, px, py) {
        corpoRobo(ctx, px, py);
        ret(ctx, px + 2, py - 5, 12, 10, K); ret(ctx, px + 3, py - 4, 10, 8, LIMA2);
        ret(ctx, px + 6, py + 6, 4, 3, K); ret(ctx, px + 7, py + 7, 2, 1, AMAR);                       // chavinha de corda
        ret(ctx, px + 2, py + 5, 2, 4, K); ret(ctx, px + 12, py + 5, 2, 4, K);
      },
      lado: function (ctx, px, py) {
        corpoRobo(ctx, px, py);
        ret(ctx, px + 3, py - 5, 11, 10, K); ret(ctx, px + 4, py - 4, 9, 8, LIMA); ret(ctx, px + 4, py - 4, 9, 1, clarear(LIMA, 0.4));
        ret(ctx, px + 5, py - 2, 2, 2, K); ret(ctx, px + 4, py + 2, 3, 1, K); ret(ctx, px + 10, py - 1, 2, 3, K);
        ret(ctx, px + 7, py + 5, 2, 5, K);
      },
    }) }, {
    baixo: function (p) { p.r(5, -2, 2, 2, AMAR); p.r(9, -2, 2, 2, AMAR); },
    cima: function (p) { p.r(7, 2, 2, 2, LIMA); },   // de costas: a luzinha de "ligado" nas costas
    lado: function (p) { p.r(5, -2, 2, 2, AMAR); },
    anim: { baixo: antena, cima: antena, lado: antena } });
})();
