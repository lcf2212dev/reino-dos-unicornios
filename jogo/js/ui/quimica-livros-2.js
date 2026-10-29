/* Laboratório de Química, 2º andar: a Estante dos livros (Biblioteca da Química), parte 2 de 2 (o desenho em pixel art).
   Contrato: docs/contratos/quimica.md §2 e §9. Um desenho por livro (chave `desenho`), 64×48 px de arte, que muda um
   pouco a cada página (a cena acompanha o texto). arte.md: contorno #3a2446, sem arc, gradiente nem blur; luz em
   faixas; ampliação inteira. Acrescenta ao interno Reino._quimicaLivros: desenhos e desenho(chave, pagina). */
(function () {
  var R = window.Reino, T = R._quimicaLivros, el = T.el, ret = T.ret, D = R.Desenho;
  var K = D.K, C = D.C;
  var W = 64, H = 48;
  var MARROM = '#9a5a2e', CARAMELO = '#d9892e', FERRUGEM = '#b8562a', AZINHAVRE = '#5fbf9f', FUMACA = '#a8a0b8';

  /* ---------- peças ---------- */
  function fundo(ctx, cor) { ret(ctx, 0, 0, W, H, K); ret(ctx, 1, 1, W - 2, H - 2, cor); }
  function caixa(ctx, x, y, w, h, cor) { ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, cor); ret(ctx, x + 1, y + 1, w - 2, 1, D.clarear(cor, 0.45)); }
  function bola(ctx, cx, cy, r, cor) {
    D.circulo(ctx, cx, cy, r + 1, K); D.circulo(ctx, cx, cy, r, cor);
    if (r >= 2) ret(ctx, cx - Math.ceil(r / 2), cy - Math.ceil(r / 2), 1, 1, D.clarear(cor, 0.6));
  }
  // bancada de madeira do chão do desenho, de y até embaixo
  function bancada(ctx, y) { ret(ctx, 1, y, W - 2, 1, K); ret(ctx, 1, y + 1, W - 2, H - y - 2, C.madeira); ret(ctx, 1, y + 1, W - 2, 1, C.madeiraClara); for (var x = 6; x < W - 2; x += 14) ret(ctx, x, y + 4, 5, 1, C.madeira2); }
  // parede de azulejos (linhas de 8 em 8)
  function azulejos(ctx, ate) { ret(ctx, 1, 1, W - 2, ate - 1, C.creme2); for (var x = 8; x < W - 1; x += 8) ret(ctx, x, 1, 1, ate - 1, C.pedra); for (var y = 8; y < ate; y += 8) ret(ctx, 1, y, W - 2, 1, C.pedra); }
  // chama em degraus: s = 1 (5×7) ou 2 (9×12)
  var CHAMAS = {
    1: ['..k..', '.kok.', '.kok.', 'kooyk', 'koyyk', 'koywk', '.kkk.'],
    2: ['....k....', '...kok...', '...kook..', '..koook..', '..kooyok.', '.kooyyok.', '.koyyyok.', 'kooyyyyok', 'koyywyyok', 'koywwwyok', '.kyywyyk.', '..kkkkk..'],
  };
  function chama(ctx, x, y, s) { D.matriz(ctx, x, y, CHAMAS[s], { k: K, o: C.laranja, y: C.ouro, w: C.ouro3 }); }
  function gota(ctx, x, y, cor) { D.matriz(ctx, x, y, ['.k.', 'kbk', 'kbk', '.k.'], { k: K, b: cor || C.azul }); }
  // fiozinho de vapor subindo (ondinha de 2 px)
  function vapor(ctx, x, y, h, cor) { for (var k = 0; k < h; k++) ret(ctx, x + (k % 4 < 2 ? 0 : 1), y + k, 1, 1, cor || C.branco); }
  // seta pontilhada de (x0,y0) a (x1,y1), com a ponta
  function seta(ctx, x0, y0, x1, y1, cor) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)), dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
    for (var k = 0; k <= n; k += 2) ret(ctx, Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), 1, 1, cor);
    ret(ctx, x1, y1, 1, 1, cor); ret(ctx, x1 - dx - dy, y1 - dy + dx, 1, 1, cor); ret(ctx, x1 - dx + dy, y1 - dy - dx, 1, 1, cor);
  }
  // molécula: bolinhas lado a lado (as cores das pontas) — oxigênio (2 vermelhas), nitrogênio (2 azuis), gás carbônico
  function molecula(ctx, x, y, tipo) {
    if (tipo === 'co2') { bola(ctx, x - 3, y, 1, C.vermelho); bola(ctx, x + 3, y, 1, C.vermelho); bola(ctx, x, y, 2, C.metal2); return; }
    var cor = tipo === 'o2' ? C.vermelho : C.azul;
    bola(ctx, x - 1, y, 2, cor); bola(ctx, x + 2, y, 2, cor);
  }
  function nuvem(ctx, x, y, cor) {
    [[x + 4, y + 5, 4], [x + 10, y + 3, 5], [x + 16, y + 5, 4]].forEach(function (b) { D.circulo(ctx, b[0], b[1], b[2] + 1, K); });
    ret(ctx, x, y + 5, 21, 5, K);
    [[x + 4, y + 5, 4], [x + 10, y + 3, 5], [x + 16, y + 5, 4]].forEach(function (b) { D.circulo(ctx, b[0], b[1], b[2], cor); });
    ret(ctx, x + 1, y + 5, 19, 4, cor); ret(ctx, x + 7, y, 3, 1, C.branco);
  }
  function sol(ctx, x, y) {
    [[0, -8], [0, 8], [-8, 0], [8, 0], [-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(function (r) { ret(ctx, x + r[0], y + r[1], 1, 1, C.laranja); ret(ctx, x + Math.round(r[0] * 0.8), y + Math.round(r[1] * 0.8), 1, 1, C.ouro); });
    bola(ctx, x, y, 4, C.ouro);
  }
  function panela(ctx, x, y, w, h, cor) {   // aberta em cima, com as duas alças
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y, w - 2, h - 1, cor); ret(ctx, x + 1, y, w - 2, 1, D.clarear(cor, 0.5));
    ret(ctx, x + 2, y + 2, 1, h - 4, D.clarear(cor, 0.35));
    ret(ctx, x - 3, y + 1, 3, 3, K); ret(ctx, x - 2, y + 2, 2, 1, cor); ret(ctx, x + w, y + 1, 3, 3, K); ret(ctx, x + w, y + 2, 2, 1, cor);
  }
  function pipoca(ctx, x, y) { D.matriz(ctx, x, y, ['.kkk.', 'kwwwk', 'kwywk', '.kkk.'], { k: K, w: C.branco, y: C.ouro3 }); }
  function planta(ctx, x, y, folhas) {   // vaso de terracota com o caule e as folhas (x = centro, y = boca do vaso)
    caixa(ctx, x - 6, y, 13, 9, C.terracota); ret(ctx, x - 7, y, 15, 3, K); ret(ctx, x - 6, y + 1, 13, 1, C.terracota2);
    ret(ctx, x, y - 16, 1, 16, C.folha3);
    (folhas || [[-7, -13], [1, -16], [-7, -7], [1, -10]]).forEach(function (f) {
      D.matriz(ctx, x + f[0], y + f[1], ['.kkkk.', 'kffffk', 'kfFffk', '.kkkk.'], { k: K, f: C.folha, F: C.folha4 });
    });
  }

  var desenhos = T.desenhos = {
    // bolo (páginas 1-3), pipoca (4-6), caramelo (7) e tudo junto (8)
    cozinha: function (ctx, p) {
      azulejos(ctx, 36); bancada(ctx, 36);
      if (p <= 2) {
        var alto = [4, 6, 13][p];
        caixa(ctx, 14, 26, 26, 11, C.metal);
        ret(ctx, 15, 36 - alto, 24, alto, K);
        ret(ctx, 16, 37 - alto, 22, alto - 1, p === 2 ? C.ouro2 : C.creme2);
        ret(ctx, 16, 37 - alto, 22, 1, p === 2 ? MARROM : C.branco);
        if (p >= 1) [[19, 32], [25, 30], [31, 33], [35, 31], [22, 34]].forEach(function (b) { if (b[1] > 36 - alto) ret(ctx, b[0], b[1], 2, 2, D.clarear(C.ouro2, 0.4)); });
        caixa(ctx, 46, 22, 11, 14, C.roxo); ret(ctx, 48, 27, 7, 4, C.creme);   // a caixinha do fermento
        if (p === 1) [[50, 16], [53, 12], [48, 11]].forEach(function (b) { bola(ctx, b[0], b[1], 1, C.vidro); });
        return;
      }
      if (p <= 5) {
        panela(ctx, 16, 24, 24, 12, C.metal2);
        for (var i = 0; i < 9; i++) ret(ctx, 19 + i * 2, 24 - (i % 2), 2, 2, p === 5 && i % 3 ? C.branco : C.ouro);
        chama(ctx, 21, 39, 1); chama(ctx, 31, 39, 1);
        if (p >= 4) { vapor(ctx, 20, 12, 10); vapor(ctx, 28, 9, 12); vapor(ctx, 35, 13, 9); }
        if (p === 4) [[23, 25], [33, 25]].forEach(function (g) { gota(ctx, g[0], g[1] - 1); });
        if (p === 5) { [[14, 12], [22, 5], [33, 4], [41, 11], [27, 14], [46, 20]].forEach(function (q) { pipoca(ctx, q[0], q[1]); }); D.brilho(ctx, 9, 8, C.ouro); D.brilho(ctx, 52, 6, C.ouro); }
        return;
      }
      if (p === 6) {
        [[6, 29], [11, 31]].forEach(function (q) { caixa(ctx, q[0], q[1], 6, 6, C.branco); });
        panela(ctx, 24, 28, 28, 8, C.metal2); ret(ctx, 25, 28, 26, 3, CARAMELO); ret(ctx, 26, 28, 10, 1, C.ouro);
        chama(ctx, 31, 39, 1); chama(ctx, 42, 39, 1);
        seta(ctx, 15, 25, 25, 25, K);
        return;
      }
      caixa(ctx, 4, 26, 16, 11, C.metal); ret(ctx, 5, 25, 14, 2, K); ret(ctx, 5, 24, 14, 1, K); ret(ctx, 6, 25, 12, 1, MARROM);   // o bolo pronto
      ret(ctx, 5, 26, 14, 1, C.ouro2);
      panela(ctx, 26, 29, 12, 7, C.azul2); [[27, 26], [31, 25], [34, 27], [29, 22]].forEach(function (q) { pipoca(ctx, q[0], q[1]); });
      panela(ctx, 46, 31, 14, 5, C.metal2); ret(ctx, 47, 31, 12, 2, CARAMELO);
      D.brilho(ctx, 12, 18, C.ouro); D.brilho(ctx, 53, 24, C.ouro);
    },
    // as bolinhas do ar e a barrinha da mistura; depois o corpo e a planta trocando gases
    ar: function (ctx, p) {
      fundo(ctx, C.ceu);
      if (p <= 2) {
        [[8, 7], [22, 5], [40, 8], [54, 6], [14, 17], [31, 15], [47, 18], [7, 27], [25, 25], [57, 27], [38, 28]].forEach(function (m) { molecula(ctx, m[0], m[1], 'n2'); });
        [[33, 7], [52, 15], [16, 28]].forEach(function (m) { molecula(ctx, m[0], m[1], 'o2'); });
        if (p === 1) [[5, 20], [44, 23]].forEach(function (b) { D.brilho(ctx, b[0], b[1]); });
        // a barrinha: 78 partes de nitrogênio, 21 de oxigênio, 1 de outros
        ret(ctx, 4, 36, 56, 8, K); ret(ctx, 5, 37, 43, 6, C.azul); ret(ctx, 48, 37, 11, 6, C.vermelho); ret(ctx, 58, 37, 1, 6, C.metal2);
        ret(ctx, 5, 37, 43, 1, C.azul2); ret(ctx, 48, 37, 11, 1, C.rosa2);
        if (p === 2) { ret(ctx, 3, 35, 46, 1, C.ouro); ret(ctx, 3, 44, 46, 1, C.ouro); }
        return;
      }
      // o pulmão (esquerda) e a árvore (direita)
      D.matriz(ctx, 5, 12, ['...kk.kk...', '..krk.krk..', '.krrk.krrk.', 'krrrk.krrrk', 'krrrk.krrrk', 'krwrk.krwrk', 'krrrk.krrrk', 'krrrk.krrrk', '.krrk.krrk.', '..kk...kk..'], { k: K, r: C.rosa, w: C.rosa2 });
      ret(ctx, 10, 6, 1, 7, K);
      ret(ctx, 1, 38, W - 2, 9, C.folha2); ret(ctx, 1, 38, W - 2, 1, K);
      ret(ctx, 50, 24, 3, 14, C.madeira2); ret(ctx, 49, 24, 1, 14, K); ret(ctx, 53, 24, 1, 14, K);
      [[51, 14, 8], [45, 19, 5], [57, 19, 5]].forEach(function (b) { D.circulo(ctx, b[0], b[1], b[2] + 1, K); });
      [[51, 14, 8], [45, 19, 5], [57, 19, 5]].forEach(function (b) { D.circulo(ctx, b[0], b[1], b[2], C.folha); });
      ret(ctx, 47, 9, 3, 1, C.folha4);
      if (p === 3 || p >= 5) { molecula(ctx, 36, 9, 'o2'); molecula(ctx, 26, 11, 'o2'); seta(ctx, 34, 14, 20, 16, K); }
      if (p >= 4) { molecula(ctx, 25, 30, 'co2'); molecula(ctx, 36, 32, 'co2'); seta(ctx, 20, 26, 40, 26, K); }
      if (p === 6) D.brilho(ctx, 40, 5, C.ouro);
    },
    // o triângulo do fogo; depois a tampa que abafa e a placa de cuidado
    fogo: function (ctx, p) {
      fundo(ctx, '#fff0d9');
      if (p <= 3) {
        var dest = [0, 1, 2, 3][p];   // 1 = combustível, 2 = oxigênio, 3 = calor
        if (dest === 1 || dest === 0) ret(ctx, 1, 34, 18, 13, dest ? C.ouro3 : '#fff0d9');
        if (dest === 2 || dest === 0) ret(ctx, 23, 1, 18, 11, dest ? C.ouro3 : '#fff0d9');
        if (dest === 3 || dest === 0) ret(ctx, 45, 34, 18, 13, dest ? C.ouro3 : '#fff0d9');
        // o triângulo depois dos destaques (os cantos ficam inteiros)
        for (var j = 0; j < 30; j++) { var m = Math.round(j * 0.72); ret(ctx, 32 - m, 7 + j, 1, 1, K); ret(ctx, 32 + m, 7 + j, 1, 1, K); }
        ret(ctx, 11, 37, 43, 1, K);
        chama(ctx, 28, 22, 2);
        caixa(ctx, 3, 38, 14, 5, C.madeira); ret(ctx, 14, 39, 2, 3, C.madeiraClara); ret(ctx, 5, 40, 6, 1, C.madeira3);   // tora
        molecula(ctx, 31, 6, 'o2');
        ret(ctx, 52, 36, 3, 8, K); ret(ctx, 53, 37, 1, 5, C.branco); ret(ctx, 51, 43, 5, 3, K); ret(ctx, 52, 44, 3, 1, C.vermelho); ret(ctx, 53, 39, 1, 5, C.vermelho);   // termômetro
        return;
      }
      if (p <= 5) {
        caixa(ctx, 16, 32, 32, 8, C.metal2); ret(ctx, 20, 30, 24, 2, K);
        if (p === 4) { chama(ctx, 27, 18, 2); seta(ctx, 10, 12, 20, 16, K); caixa(ctx, 2, 6, 10, 6, C.metal); }
        else { caixa(ctx, 18, 22, 28, 9, C.metal); ret(ctx, 30, 19, 4, 3, K); ret(ctx, 31, 20, 2, 1, C.metal2); [[14, 14], [49, 12]].forEach(function (f) { vapor(ctx, f[0], f[1], 8, FUMACA); }); }
        bancada(ctx, 40);
        return;
      }
      // a placa de cuidado (triângulo amarelo) com a chama; na última, a mão do adulto (só a luva)
      for (var y = 0; y < 30; y++) { var mm = Math.round(y * 0.62); ret(ctx, 32 - mm - 1, 8 + y, mm * 2 + 3, 1, K); if (y > 1 && y < 28) ret(ctx, 32 - mm + 1, 8 + y, mm * 2 - 1, 1, C.ouro); }
      chama(ctx, 28, 22, 2);
      if (p === 6) { for (var k = 0; k < 11; k++) { ret(ctx, 17 + k * 3, 40 - k * 3, 3, 3, K); ret(ctx, 18 + k * 3, 41 - k * 3, 1, 1, C.vermelho); } }
      else { caixa(ctx, 46, 30, 12, 9, C.azul); ret(ctx, 44, 33, 3, 4, K); ret(ctx, 45, 34, 1, 2, C.azul); D.brilho(ctx, 9, 9, C.ouro); }
    },
    // o prego que enferruja, a tinta que protege, o ouro e a estátua de cobre
    ferrugem: function (ctx, p) {
      fundo(ctx, '#e9e4f5');
      if (p <= 2) {
        caixa(ctx, 12, 20, 38, 6, C.metal); caixa(ctx, 8, 17, 5, 12, C.metal); ret(ctx, 50, 21, 3, 4, K); ret(ctx, 53, 22, 2, 2, K);   // o prego
        if (p >= 1) { [[20, 11], [34, 9]].forEach(function (g) { gota(ctx, g[0], g[1]); }); molecula(ctx, 44, 10, 'o2'); }
        if (p === 2) [[15, 22, 4], [24, 21, 6], [33, 23, 3], [41, 21, 5], [9, 20, 3]].forEach(function (f) { ret(ctx, f[0], f[1], f[2], 3, FERRUGEM); ret(ctx, f[0] + 1, f[1] + 1, 1, 1, MARROM); });
        bancada(ctx, 36);
        return;
      }
      if (p === 3) {
        caixa(ctx, 8, 18, 48, 10, C.roxo); ret(ctx, 9, 19, 46, 1, C.lilas); [[18, 8], [38, 6]].forEach(function (g) { gota(ctx, g[0], g[1]); });
        caixa(ctx, 26, 34, 12, 9, C.creme); ret(ctx, 26, 34, 12, 3, C.roxo); ret(ctx, 36, 29, 1, 5, K);   // a latinha de tinta
        return;
      }
      if (p === 4) {
        caixa(ctx, 8, 28, 20, 8, C.ouro); ret(ctx, 11, 26, 14, 2, K); ret(ctx, 11, 27, 14, 1, C.ouro3); D.brilho(ctx, 12, 20); D.brilho(ctx, 26, 22);   // barra de ouro
        caixa(ctx, 38, 30, 20, 5, C.metal); [[40, 31, 4], [47, 31, 5], [54, 32, 2]].forEach(function (f) { ret(ctx, f[0], f[1], f[2], 3, FERRUGEM); });
        bancada(ctx, 38);
        return;
      }
      // a estátua (silhueta, sem rosto): cobre na 6ª página, verde (azinhavre) na 7ª e 8ª
      var cor = p === 5 ? C.terracota : AZINHAVRE;
      fundo(ctx, C.ceu);
      ret(ctx, 1, 40, W - 2, 7, C.agua3); ret(ctx, 1, 40, W - 2, 1, K);
      caixa(ctx, 24, 32, 16, 9, C.pedra2);
      D.matriz(ctx, 25, 3, [
        '...........kkk..', '..........kfk...', '.........kccck..', '..k.k.k..kcck...', '...kckck.kck....', '..kcccccckck....',
        '...kcccckcck....', '...kcccccck.....', '..kccccccck.....', '..kccccccck.....', '..kcccccck......', '.kccccccck......',
        '.kccccccck......', '.kcccccccck.....', 'kccccccccck.....', 'kcccccccccck....', 'kccccccccck.....', 'kkkkkkkkkkk.....',
      ], { k: K, c: cor, f: C.ouro });
      ret(ctx, 29, 13, 1, 12, D.clarear(cor, 0.35));
      if (p === 6) { caixa(ctx, 6, 8, 7, 7, C.terracota); seta(ctx, 15, 11, 22, 11, K); }
      if (p === 7) [[8, 10], [53, 14]].forEach(function (b) { D.brilho(ctx, b[0], b[1], AZINHAVRE); });
    },
    // o caminho da água: mar, sol, vapor, nuvem, chuva, rio
    agua: function (ctx, p) {
      fundo(ctx, C.ceu);
      D.matriz(ctx, 34, 20, ['........kk........', '.......kppk.......', '......kpppwk......', '.....kppppwwk.....', '....kpppppppk.....', '...kppppppppppk...', '..kpppppppppppppk.', '.kpppppppppppppppk'], { k: K, p: C.pedra2, w: C.branco });
      ret(ctx, 1, 28, W - 2, 19, C.folha2); ret(ctx, 1, 28, 33, 1, K);
      ret(ctx, 1, 34, 30, 13, C.azul); ret(ctx, 1, 34, 30, 1, K); for (var x = 3; x < 29; x += 6) ret(ctx, x, 36, 3, 1, C.azul2);   // o mar
      for (var k = 0; k < 10; k++) ret(ctx, 50 - k * 2, 29 + Math.floor(k / 2), 3, 2, C.azul);   // o rio descendo
      sol(ctx, 10, 10);
      if ((p >= 1 && p <= 3) || p === 7) { vapor(ctx, 10, 21, 11); vapor(ctx, 18, 19, 13); vapor(ctx, 25, 22, 10); }
      if (p === 2 || p === 3) [[37, 6], [42, 4], [46, 7]].forEach(function (g) { ret(ctx, g[0], g[1], 2, 2, C.branco); });
      if (p >= 3) nuvem(ctx, 36, 2, p >= 5 ? '#c9c3dc' : C.branco);
      if (p === 3) [[40, 6], [45, 5], [50, 7]].forEach(function (g) { ret(ctx, g[0], g[1], 1, 1, C.azul); });
      if (p >= 5) [[39, 15], [45, 17], [51, 14], [42, 22], [54, 20]].forEach(function (g) { gota(ctx, g[0], g[1]); });
      if (p >= 6) seta(ctx, 34, 32, 30, 35, K);
      if (p === 7) seta(ctx, 26, 14, 32, 10, K);
    },
    // a planta ao sol: luz, água e gás carbônico entram; açúcar dentro; oxigênio sai
    planta: function (ctx, p) {
      fundo(ctx, C.ceu);
      bancada(ctx, 40);
      planta(ctx, 32, 31);
      sol(ctx, 9, 9);
      if (p === 1 || p >= 6) { for (var k = 0; k < 5; k++) ret(ctx, 16 + k * 2, 14 + k, 1, 1, C.ouro); caixa(ctx, 44, 31, 10, 9, C.azul2); gota(ctx, 42, 25); }
      if (p === 2 || p >= 6) { molecula(ctx, 52, 8, 'co2'); seta(ctx, 47, 11, 40, 15, K); }
      if (p >= 3 && p <= 4 || p >= 6) [[26, 19], [35, 16]].forEach(function (a) { ret(ctx, a[0], a[1], 2, 2, C.ouro3); });
      if (p === 4) { caixa(ctx, 50, 32, 6, 6, C.branco); D.brilho(ctx, 58, 29, C.ouro); }
      if (p >= 5) { molecula(ctx, 20, 26, 'o2'); seta(ctx, 26, 22, 20, 22, K); }
      if (p === 7) { D.brilho(ctx, 46, 5, C.ouro); D.brilho(ctx, 20, 34, C.ouro); }
    },
    // o corpo (silhueta sem rosto) com a água, o pão que a saliva desmancha, o estômago, a energia
    corpo: function (ctx, p) {
      fundo(ctx, '#fde6ef');
      if (p <= 1) {
        var corpo = ['...kkkk...', '..kccccK..', '..kccccK..', '...kkkk...', '.kkccccKk.', 'kcccccccck', 'kcckcckcck', 'kcck..kcck',
          'kcck..kcck', '.kk....kk.', '..kccck...', '..kc.ck...', '..kc.ck...', '..kc.ck...', '..kk.kk...'];
        var y0 = 5, s = 2;
        corpo.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (l[i] !== '.') ret(ctx, 22 + i * s, y0 + j * s, s, s, l[i] === 'k' || l[i] === 'K' ? K : (p === 1 && j >= 5 ? C.azul2 : C.creme)); });
        if (p === 1) { ret(ctx, 44, 14, 1, 20, K); for (var j2 = 0; j2 < 20; j2 += 4) ret(ctx, 45, 14 + j2, 2, 1, K); ret(ctx, 45, 18, 4, 1, C.azul); gota(ctx, 50, 22); }
        return;
      }
      if (p <= 3) {
        caixa(ctx, 8, 20, 22, 14, C.madeiraClara); ret(ctx, 10, 22, 18, 10, C.creme);   // o pão
        [[37, 24], [42, 29], [47, 22], [52, 28]].forEach(function (m) { caixa(ctx, m[0], m[1], 4, 4, C.creme); });
        gota(ctx, 38, 14, C.agua2); gota(ctx, 46, 12, C.agua2);
        seta(ctx, 32, 27, 36, 27, K);
        if (p === 3) D.brilho(ctx, 56, 18, C.ouro);
        return;
      }
      if (p <= 5) {
        D.matriz(ctx, 18, 8, ['.....kkkk.......', '....krrrrk......', '....krrrrk......', '...krrrrrrkk....', '..krrrrrrrrrkk..', '.krrgggggrrrrrk.', 'krrgggggggggrrrk', 'krrgggggggggggrk', 'krrgggggggggggrk', '.krrggggggggrrk.', '..krrrrrrrrrrk..', '...kkkkkkkrrk...', '..........krk...', '..........kk....'], { k: K, r: C.rosa, g: '#d6ef6a' });
        [[26, 18], [31, 20], [36, 17]].forEach(function (b) { bola(ctx, b[0] + 2, b[1] + 3, 1, '#f4ffb0'); });
        if (p === 5) [[6, 12], [8, 30], [52, 30]].forEach(function (m) { caixa(ctx, m[0], m[1], 4, 4, C.creme); });
        return;
      }
      // a comida vira energia: a maçã, a seta e o raio
      D.matriz(ctx, 6, 16, ['....kk....', '...kfk....', '.kkkkkkk..', 'krrrrrrrk.', 'krwrrrrrrk', 'krwrrrrrrk', 'krrrrrrrrk', 'krrrrrrrrk', '.krrrrrrk.', '..kkkkkk..'], { k: K, r: C.vermelho, w: C.rosa2, f: C.folha });
      seta(ctx, 19, 22, 29, 22, K);
      D.matriz(ctx, 32, 6, ['....kkkk', '...kyyk.', '..kyyk..', '.kyyyykk', 'kyyyyyyk', 'kkkkyyk.', '...kyk..', '..kyk...', '..kk....'], { k: K, y: C.ouro });
      if (p === 7) { [[46, 30, 12], [46, 36, 12]].forEach(function (b) { caixa(ctx, b[0], b[1], b[2], 4, C.verde); }); D.brilho(ctx, 50, 12, C.ouro); }
      else { caixa(ctx, 44, 20, 16, 10, C.verde); ret(ctx, 60, 23, 2, 4, K); ret(ctx, 46, 22, 10, 6, C.folha4); }   // a bateria enchendo
    },
    // objetos dos cientistas (nada de rosto): a balança, o frasco que brilha e as medalhas, a tabela com casas vazias
    cientistas: function (ctx, p) {
      fundo(ctx, '#efe8ff');
      p = p <= 3 ? Math.max(0, p - 1) : p - 1;   // 10 páginas: Lavoisier (1-4), Marie Curie (5-8), Mendeleiev (9-10)
      if (p <= 2) {
        caixa(ctx, 28, 38, 9, 4, C.madeira); ret(ctx, 31, 12, 3, 26, C.ouro2); ret(ctx, 30, 12, 1, 26, K); ret(ctx, 34, 12, 1, 26, K);
        ret(ctx, 10, 12, 45, 2, K); ret(ctx, 11, 12, 43, 1, C.ouro);
        [[14, 12], [50, 12]].forEach(function (x) { seta(ctx, x[0], 14, x[0], 26, K); ret(ctx, x[0] - 8, 27, 17, 2, K); ret(ctx, x[0] - 7, 27, 15, 1, C.ouro); });
        D.matriz(ctx, 10, 19, ['.kkk.', '.kvk.', 'kvvvk', 'kbbbk', 'kkkkk'], { k: K, v: C.vidro, b: C.azul });
        [[45, 23, 4], [51, 21, 6]].forEach(function (b) { caixa(ctx, b[0], b[1], b[2], 27 - b[1], C.metal); });
        if (p === 2) { D.brilho(ctx, 24, 5, C.ouro); D.brilho(ctx, 42, 5, C.ouro); }
        return;
      }
      if (p <= 6) {
        D.matriz(ctx, 10, 12, ['...kkk...', '...kvk...', '...kvk...', '..kvvvk..', '.kvggggk.', 'kgggGgggk', 'kggGGGggk', 'kgggGgggk', 'kgggggggk', '.kkkkkkk.'], { k: K, v: C.vidro, g: '#7ff0c8', G: '#e8fff6' });
        [[7, 17], [24, 17], [15, 8], [5, 26], [26, 26]].forEach(function (b) { ret(ctx, b[0], b[1], 1, 1, '#7ff0c8'); });
        var med = p === 3 ? 2 : p === 4 ? 1 : 0;   // dois Nobel; depois a primeira medalha
        for (var m = 0; m < med; m++) { var x = 38 + m * 13; ret(ctx, x + 2, 8, 2, 8, C.azul); ret(ctx, x + 5, 8, 2, 8, C.vermelho); bola(ctx, x + 4, 21, 4, C.ouro); }
        if (p >= 5) { D.matriz(ctx, 38, 20, ['.kkk.', '.kvk.', 'kvvvk', 'kgggk', 'kkkkk'], { k: K, v: C.vidro, g: '#7ff0c8' }); D.matriz(ctx, 50, 20, ['.kkk.', '.kvk.', 'kvvvk', 'kgggk', 'kkkkk'], { k: K, v: C.vidro, g: '#b8f0ff' }); }
        bancada(ctx, 40);
        return;
      }
      // a tabela de Mendeleiev: casas cheias e, na última página, as vazias brilhando
      for (var l = 0; l < 5; l++) for (var c = 0; c < 8; c++) {
        var vazia = (l === 2 && c === 5) || (l === 3 && c === 2) || (l === 4 && c === 6);
        var xx = 6 + c * 7, yy = 7 + l * 7;
        ret(ctx, xx, yy, 7, 7, K);
        ret(ctx, xx + 1, yy + 1, 5, 5, vazia ? (p === 8 ? C.ouro3 : C.creme) : [C.rosa2, C.azul2, C.verde, C.lilas, C.ouro][l]);
        if (vazia) { ret(ctx, xx + 2, yy + 2, 3, 1, K); ret(ctx, xx + 4, yy + 3, 1, 1, K); ret(ctx, xx + 3, yy + 4, 1, 1, K); ret(ctx, xx + 3, yy + 5, 1, 1, K); }   // o ?
      }
      if (p === 8) { D.brilho(ctx, 45, 21, C.ouro); D.brilho(ctx, 29, 28); }
    },
  };

  // px CSS por px de arte: 4 no celular, 5 no notebook (tela baixa), 6 no tablet
  function escala() { var w = window.innerWidth, h = window.innerHeight; return w <= 480 ? 4 : h <= 820 ? 5 : 6; }
  T.desenho = function (chave, pagina) {
    var f = desenhos[chave];
    if (!f) return null;
    var c = T.canvasNitido(W, H, escala());
    c.cv.setAttribute('data-desenho', chave);
    c.cv.setAttribute('aria-hidden', 'true');
    f(c.ctx, pagina | 0);
    return el('figure.ql-figura', c.cv);
  };
})();
