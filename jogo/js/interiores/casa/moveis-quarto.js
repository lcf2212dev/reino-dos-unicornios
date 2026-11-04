/* Casa do jogador: móveis do kit Quarto do jogador (prefixo casa-quarto-jogador-; docs/contratos/casa.md §5). Cama,
   guarda-roupa, escrivaninha, cadeira, tapete, criado-mudo com abajur, estante de brinquedos e espelho de parede.
   baixo = de frente, cima = de costas, lado = virado para a esquerda (pegada trocada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K, virado = R.CasaArte.virado, usos = R.CasaArte.objeto;
  var ROSA = '#ff8fc4', LIL = '#c9a8ff', AMAR = '#ffd84d', CEU = '#8fd0ff', MAD = '#f2c38a', MAD2 = '#d39a5c';

  function arred(ctx, x, y, w, h, c) { ret(ctx, x + 1, y, w - 2, h, c); ret(ctx, x, y + 1, w, h - 2, c); }
  function caixa(ctx, x, y, w, h, c) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, c);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
    ret(ctx, x + 1, y + h - 2, w - 2, 1, escurecer(c, 0.2));
  }
  function coracao(ctx, x, y, c) { ret(ctx, x, y, 2, 2, c); ret(ctx, x + 3, y, 2, 2, c); ret(ctx, x, y + 1, 5, 2, c); ret(ctx, x + 1, y + 3, 3, 1, c); ret(ctx, x + 2, y + 4, 1, 1, c); }
  function bolinhas(ctx, x, y, w, h, c) { for (var j = 2; j < h - 1; j += 5) for (var i = 2 + (j % 10 ? 2 : 0); i < w - 1; i += 6) ret(ctx, x + i, y + j, 2, 2, c); }

  /* ---------- cama (2×3; lado 3×2) ---------- */
  function cabeceira(ctx, x, y, w, h, frente) {
    arred(ctx, x, y, w, h, K); arred(ctx, x + 1, y + 1, w - 2, h - 2, frente ? ROSA : escurecer(ROSA, 0.15));
    ret(ctx, x + 2, y + 2, w - 4, 1, clarear(ROSA, 0.45));
    if (frente) coracao(ctx, x + (w >> 1) - 2, y + 3, C.branco);
    else for (var i = x + 4; i < x + w - 3; i += 4) ret(ctx, i, y + 3, 1, h - 5, escurecer(ROSA, 0.3));
  }
  function travesseiro(ctx, x, y, w, h) { arred(ctx, x, y, w, h, K); arred(ctx, x + 1, y + 1, w - 2, h - 2, C.branco); ret(ctx, x + 2, y + h - 2, w - 4, 1, '#e4dcff'); }
  function cobertor(ctx, x, y, w, h) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, LIL); bolinhas(ctx, x + 1, y + 1, w - 2, h - 2, AMAR);
    ret(ctx, x + 1, y + 1, w - 2, 2, C.branco);
  }
  I.objeto('casa-quarto-jogador-cama', { w: 2, h: 3, topo: 10, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        cabeceira(ctx, px, py - 10, 32, 16, true);
        ret(ctx, px + 2, py + 4, 28, 40, K); ret(ctx, px + 3, py + 5, 26, 38, C.branco);       // colchão
        travesseiro(ctx, px + 5, py + 6, 22, 9);
        cobertor(ctx, px + 2, py + 16, 28, 26);
        ret(ctx, px + 1, py + 41, 30, 6, K); ret(ctx, px + 2, py + 42, 28, 4, MAD); ret(ctx, px + 2, py + 42, 28, 1, clarear(MAD, 0.4));
      },
      cima: function (ctx, px, py) {
        ret(ctx, px + 1, py - 4, 30, 6, K); ret(ctx, px + 2, py - 3, 28, 4, MAD);               // pé da cama, no fundo
        ret(ctx, px + 2, py + 1, 28, 34, K); ret(ctx, px + 3, py + 2, 26, 32, C.branco);
        cobertor(ctx, px + 2, py + 1, 28, 24);
        travesseiro(ctx, px + 5, py + 25, 22, 9);
        cabeceira(ctx, px, py + 31, 32, 16, false);
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 2, py + 2, 40, 27, K); ret(ctx, px + 3, py + 3, 38, 25, C.branco);
        cobertor(ctx, px + 1, py + 2, 30, 26);
        travesseiro(ctx, px + 31, py + 3, 10, 20);
        ret(ctx, px, py + 4, 4, 26, K); ret(ctx, px + 1, py + 5, 2, 24, MAD);                   // pé da cama à esquerda
        arred(ctx, px + 41, py - 10, 7, 41, K); arred(ctx, px + 42, py - 9, 5, 39, ROSA);       // cabeceira à direita
        ret(ctx, px + 42, py - 8, 1, 37, clarear(ROSA, 0.45)); coracao(ctx, px + 42, py - 4, C.branco);
      },
    }) });

  /* ---------- guarda-roupa (2×1, alto; lado 1×2) ---------- */
  function coroa(ctx, x, y, w) {
    ret(ctx, x, y + 2, w, 3, K); ret(ctx, x + 1, y + 3, w - 2, 1, AMAR);
    for (var i = 0; i < 3; i++) { var cx = x + 3 + Math.round(i * (w - 7) / 2); ret(ctx, cx, y, 2, 3, K); ret(ctx, cx, y + 1, 1, 1, AMAR); }
  }
  var DENTRO = '#5b4a78';
  // roupinhas penduradas no varão: cabide + peça colorida
  function roupa(p, x, y, c, h) { p.r(x + 2, y, 1, 2, K); p.r(x, y + 2, 5, h, K); p.r(x + 1, y + 2, 3, h - 1, c); p.r(x + 1, y + 2, 1, h - 1, clarear(c, 0.4)); }
  var GUARDA_ON = {
    baixo: function (p) {
      p.r(3, -16, 26, 25, K); p.r(4, -15, 24, 23, DENTRO); p.r(4, -15, 24, 1, clarear(DENTRO, 0.3)); p.r(4, -13, 24, 1, K); p.r(4, -12, 24, 1, C.metal);
      roupa(p, 5, -12, ROSA, 12); roupa(p, 11, -12, CEU, 9); roupa(p, 17, -12, AMAR, 13); roupa(p, 23, -12, C.verde, 10);
      p.r(4, 2, 24, 1, K); p.r(5, 3, 6, 4, C.rosa2); p.r(12, 4, 6, 3, '#8fd0ff'); p.r(19, 3, 8, 4, C.creme); p.r(4, 7, 24, 1, K);
      p.r(0, -17, 3, 26, K); p.r(1, -16, 1, 24, ROSA); p.r(29, -17, 3, 26, K); p.r(30, -16, 1, 24, ROSA);
    },
    cima: function (p) { p.r(0, -18, 2, 32, K); p.r(1, -17, 1, 30, ROSA); p.r(30, -18, 2, 32, K); p.r(30, -17, 1, 30, ROSA); },
    lado: function (p) {
      p.r(2, -20, 5, 51, K); p.r(3, -19, 3, 49, DENTRO); p.r(3, -12, 3, 1, C.metal);
      p.r(3, -10, 3, 8, ROSA); p.r(3, 0, 3, 7, CEU); p.r(3, 9, 3, 9, AMAR); p.r(3, 20, 3, 7, C.verde);
      p.r(0, -18, 2, 49, K); p.r(0, -17, 1, 47, ROSA);
    },
  };
  usos('casa-quarto-jogador-guarda-roupa', { w: 2, h: 1, topo: 24, solido: 'base', alto: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        coroa(ctx, px + 4, py - 24, 24);
        caixa(ctx, px + 1, py - 19, 30, 34, LIL);
        ret(ctx, px + 15, py - 18, 2, 30, K);
        caixa(ctx, px + 3, py - 16, 12, 24, ROSA); caixa(ctx, px + 17, py - 16, 12, 24, ROSA);
        coracao(ctx, px + 7, py - 12, C.branco); coracao(ctx, px + 20, py - 12, C.branco);
        ret(ctx, px + 13, py - 4, 1, 3, AMAR); ret(ctx, px + 18, py - 4, 1, 3, AMAR);
        ret(ctx, px + 3, py + 10, 26, 3, K); ret(ctx, px + 4, py + 11, 24, 1, escurecer(LIL, 0.2));   // gaveta
        ret(ctx, px + 15, py + 11, 2, 1, AMAR);
      },
      cima: function (ctx, px, py) {
        coroa(ctx, px + 4, py - 24, 24);
        caixa(ctx, px + 1, py - 19, 30, 34, escurecer(LIL, 0.12));
        for (var x = px + 6; x < px + 30; x += 6) ret(ctx, x, py - 17, 1, 30, escurecer(LIL, 0.3));   // tábuas de trás
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 2, py - 24, 12, 4, K); ret(ctx, px + 3, py - 23, 10, 2, AMAR);
        caixa(ctx, px + 2, py - 20, 12, 51, escurecer(LIL, 0.12));
        ret(ctx, px + 2, py - 20, 4, 51, K); ret(ctx, px + 3, py - 19, 2, 49, ROSA);               // a frente, à esquerda
        ret(ctx, px + 3, py - 4, 1, 3, AMAR);
        ret(ctx, px + 7, py - 15, 4, 40, escurecer(LIL, 0.22)); ret(ctx, px + 8, py - 12, 2, 2, C.branco);
      },
    }) }, GUARDA_ON);

  /* ---------- escrivaninha (2×1; lado 1×2) ---------- */
  function lapis(ctx, x, y) {
    ret(ctx, x, y, 5, 5, K); ret(ctx, x + 1, y + 1, 3, 3, CEU);
    ret(ctx, x + 1, y - 4, 1, 4, ROSA); ret(ctx, x + 3, y - 3, 1, 3, AMAR); ret(ctx, x + 2, y - 5, 1, 5, C.verde);
  }
  I.objeto('casa-quarto-jogador-escrivaninha', { w: 2, h: 1, topo: 14, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        ret(ctx, px + 1, py - 4, 30, 6, K); ret(ctx, px + 2, py - 3, 28, 4, MAD); ret(ctx, px + 2, py - 3, 28, 1, clarear(MAD, 0.4));
        ret(ctx, px + 2, py + 2, 3, 13, K); ret(ctx, px + 3, py + 2, 1, 12, MAD2);
        caixa(ctx, px + 18, py + 2, 12, 13, CEU); ret(ctx, px + 18, py + 8, 12, 1, K);           // gavetas
        ret(ctx, px + 23, py + 4, 2, 1, C.branco); ret(ctx, px + 23, py + 10, 2, 1, C.branco);
        lapis(ctx, px + 4, py - 9);
        ret(ctx, px + 12, py - 7, 9, 4, K); ret(ctx, px + 13, py - 6, 7, 1, ROSA); ret(ctx, px + 13, py - 5, 7, 1, C.branco);   // caderno
        circulo(ctx, px + 25, py - 6, 2, K); ret(ctx, px + 25, py - 7, 1, 1, AMAR);
      },
      cima: function (ctx, px, py) {
        lapis(ctx, px + 23, py - 9);
        ret(ctx, px + 9, py - 7, 9, 4, K); ret(ctx, px + 10, py - 6, 7, 2, ROSA);
        ret(ctx, px + 1, py - 4, 30, 6, K); ret(ctx, px + 2, py - 3, 28, 4, MAD); ret(ctx, px + 2, py - 3, 28, 1, clarear(MAD, 0.4));
        caixa(ctx, px + 2, py + 2, 28, 13, MAD2);                                                    // as costas
        ret(ctx, px + 3, py + 8, 26, 1, escurecer(MAD2, 0.25));
      },
      lado: function (ctx, px, py) {
        ret(ctx, px + 2, py + 29, 2, 3, K); ret(ctx, px + 12, py + 29, 2, 3, K);                         // pés curtos
        ret(ctx, px + 1, py - 2, 14, 32, K); ret(ctx, px + 2, py - 1, 12, 26, MAD);                      // tampo visto de cima
        ret(ctx, px + 2, py - 1, 12, 1, clarear(MAD, 0.4)); ret(ctx, px + 2, py, 1, 24, clarear(MAD, 0.25));
        ret(ctx, px + 2, py + 25, 12, 4, MAD2); ret(ctx, px + 2, py + 25, 12, 1, K);                    // faixa da frente
        ret(ctx, px + 6, py + 26, 4, 2, CEU); ret(ctx, px + 7, py + 27, 2, 1, C.branco);                // gavetinha
        ret(ctx, px + 4, py + 1, 6, 6, K); ret(ctx, px + 5, py + 2, 4, 4, CEU);                         // porta-lápis
        ret(ctx, px + 5, py + 2, 1, 1, ROSA); ret(ctx, px + 7, py + 3, 1, 1, AMAR); ret(ctx, px + 6, py + 4, 1, 1, C.verde);
        ret(ctx, px + 4, py + 10, 8, 11, K); ret(ctx, px + 5, py + 11, 6, 9, C.branco); ret(ctx, px + 5, py + 11, 2, 9, ROSA);   // caderno
        ret(ctx, px + 8, py + 13, 2, 1, LIL); ret(ctx, px + 8, py + 15, 2, 1, LIL);
      },
    }) });

  /* ---------- cadeira (1×1) ---------- */
  function encosto(ctx, x, y, w, h, frente) {
    arred(ctx, x, y, w, h, K); arred(ctx, x + 1, y + 1, w - 2, h - 2, frente ? ROSA : escurecer(ROSA, 0.12));
    ret(ctx, x + 2, y + 1, w - 4, 1, clarear(ROSA, 0.45));
    if (frente) coracao(ctx, x + (w >> 1) - 2, y + 3, C.branco);
  }
  function assento(ctx, x, y, w) { ret(ctx, x, y, w, 4, K); ret(ctx, x + 1, y + 1, w - 2, 2, CEU); ret(ctx, x + 1, y + 1, w - 2, 1, clarear(CEU, 0.5)); }
  function pernas(ctx, px, py) { ret(ctx, px + 3, py + 6, 2, 9, K); ret(ctx, px + 11, py + 6, 2, 9, K); ret(ctx, px + 4, py + 6, 1, 8, MAD); ret(ctx, px + 12, py + 6, 1, 8, MAD); }
  I.objeto('casa-quarto-jogador-cadeira', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { encosto(ctx, px + 3, py - 10, 10, 13, true); pernas(ctx, px, py); assento(ctx, px + 2, py + 3, 12); },
      cima: function (ctx, px, py) { pernas(ctx, px, py); assento(ctx, px + 2, py + 1, 12); encosto(ctx, px + 3, py - 8, 10, 15, false); },
      lado: function (ctx, px, py) {
        ret(ctx, px + 4, py + 6, 2, 9, K); ret(ctx, px + 11, py + 6, 2, 9, K);
        assento(ctx, px + 2, py + 3, 12);
        arred(ctx, px + 10, py - 10, 5, 15, K); arred(ctx, px + 11, py - 9, 3, 13, ROSA); ret(ctx, px + 11, py - 8, 1, 11, clarear(ROSA, 0.45));
      },
    }) });

  /* ---------- tapete arco-íris (3×2; lado 2×3) ---------- */
  function tapete(ctx, px, py, W, H) {
    var cores = [ROSA, '#ffb35c', AMAR, '#8fe08a', CEU, LIL], n = 0;
    arred(ctx, px + 1, py + 1, W - 2, H - 2, K);
    for (var i = 2; i * 2 < Math.min(W, H) - 4; i += 2) { arred(ctx, px + i, py + i, W - i * 2, H - i * 2, cores[n % cores.length]); n++; }
    var cx = px + (W >> 1), cy = py + (H >> 1);
    ret(ctx, cx - 1, cy - 3, 3, 7, C.branco); ret(ctx, cx - 3, cy - 1, 7, 3, C.branco); ret(ctx, cx, cy, 1, 1, AMAR);  // estrela
  }
  I.objeto('casa-quarto-jogador-tapete', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: virado({
      baixo: function (ctx, px, py) { tapete(ctx, px, py, 48, 32); },
      lado: function (ctx, px, py) { tapete(ctx, px, py, 32, 48); },
    }) });

  /* ---------- criado-mudo com abajur (1×1) ---------- */
  function abajur(ctx, cx, py, luz) {
    ret(ctx, cx - 2, py - 5, 5, 3, K); ret(ctx, cx - 1, py - 4, 3, 1, MAD2); ret(ctx, cx, py - 7, 1, 3, K);
    ret(ctx, cx - 5, py - 14, 11, 8, K); ret(ctx, cx - 4, py - 13, 9, 6, AMAR);
    ret(ctx, cx - 4, py - 13, 9, 1, clarear(AMAR, 0.5)); if (luz) ret(ctx, cx - 3, py - 12, 2, 4, '#fff6c8');
    ret(ctx, cx - 4, py - 8, 9, 1, ROSA);
  }
  var BRILHO = '#fff6c8';
  function acesa(p) {   // abajur aceso: cúpula clara e o clarão em volta
    p.r(3, -13, 9, 6, '#fff2a0'); p.r(4, -12, 6, 4, BRILHO); p.r(4, -12, 2, 4, C.branco); p.r(3, -8, 9, 1, ROSA);
    [-11, -9, -7].forEach(function (y) { p.r(1 + (y & 1), y, 1, 1, '#ffe27a'); p.r(14 - (y & 1), y, 1, 1, '#ffe27a'); });
    p.r(5, -14, 5, 1, '#ffe27a');
  }
  var LAMP_ON = {
    baixo: acesa, cima: acesa, lado: acesa,
    anim: { baixo: raios, cima: raios, lado: raios },
  };
  function raios(p, t) {
    var f = Math.floor(t / 450) % 2;
    p.r(-1 - f, -12, 2, 1, '#ffe27a'); p.r(15 + f, -12, 2, 1, '#ffe27a'); p.r(0, -16 - f, 1, 1, '#fff1b8'); p.r(15, -16 - f, 1, 1, '#fff1b8');
    p.r(7, -17 - f, 2, 1, '#ffe27a'); p.r(-2, -8 + f, 1, 1, '#fff1b8'); p.r(17, -8 + f, 1, 1, '#fff1b8');
  }
  usos('casa-quarto-jogador-criado-mudo', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        caixa(ctx, px + 2, py - 2, 12, 17, CEU); ret(ctx, px + 2, py + 6, 12, 1, K);
        ret(ctx, px + 7, py + 2, 2, 1, C.branco); ret(ctx, px + 7, py + 10, 2, 1, C.branco); abajur(ctx, px + 8, py, true);
      },
      cima: function (ctx, px, py) { caixa(ctx, px + 2, py - 2, 12, 17, escurecer(CEU, 0.12)); abajur(ctx, px + 8, py, false); },
      lado: function (ctx, px, py) {
        caixa(ctx, px + 3, py - 2, 10, 17, escurecer(CEU, 0.12));
        ret(ctx, px + 3, py - 2, 3, 17, K); ret(ctx, px + 4, py - 1, 1, 15, CEU); ret(ctx, px + 2, py + 2, 1, 1, C.branco);
        abajur(ctx, px + 8, py, true);
      },
    }) }, LAMP_ON);

  /* ---------- estante de brinquedos (2×1, alta; lado 1×2) ---------- */
  function brinquedos(ctx, x, y) {   // uma prateleira: bola, ursinho, blocos
    circulo(ctx, x + 4, y - 3, 3, K); circulo(ctx, x + 4, y - 3, 2, '#ff6b7a'); ret(ctx, x + 3, y - 4, 1, 1, C.branco);
    circulo(ctx, x + 12, y - 4, 3, K); circulo(ctx, x + 12, y - 4, 2, C.madeira); ret(ctx, x + 9, y - 8, 2, 2, K); ret(ctx, x + 14, y - 8, 2, 2, K);
    ret(ctx, x + 11, y - 4, 1, 1, K); ret(ctx, x + 13, y - 4, 1, 1, K);
    ret(ctx, x + 18, y - 5, 5, 5, K); ret(ctx, x + 19, y - 4, 3, 3, CEU); ret(ctx, x + 22, y - 5, 5, 5, K); ret(ctx, x + 23, y - 4, 3, 3, AMAR);
  }
  function livrinhos(ctx, x, y) { [ROSA, LIL, C.verde, CEU, AMAR].forEach(function (c, i) { ret(ctx, x + i * 3, y - 7, 3, 7, K); ret(ctx, x + i * 3 + 1, y - 6, 1, 6, c); }); }
  I.objeto('casa-quarto-jogador-estante', { w: 2, h: 1, topo: 18, solido: 'base', alto: true,
    desenhar: virado({
      baixo: function (ctx, px, py) {
        caixa(ctx, px + 1, py - 18, 30, 33, MAD);
        ret(ctx, px + 3, py - 16, 26, 29, escurecer(MAD, 0.3));
        [-6, 4].forEach(function (y) { ret(ctx, px + 2, py + y, 28, 2, K); ret(ctx, px + 2, py + y, 28, 1, MAD2); });
        brinquedos(ctx, px + 2, py - 6); livrinhos(ctx, px + 5, py + 4); circulo(ctx, px + 24, py + 1, 3, K); circulo(ctx, px + 24, py + 1, 2, LIL);
        ret(ctx, px + 3, py + 6, 26, 7, ROSA); ret(ctx, px + 3, py + 6, 26, 1, clarear(ROSA, 0.4)); ret(ctx, px + 15, py + 9, 2, 1, C.branco);
      },
      cima: function (ctx, px, py) {
        caixa(ctx, px + 1, py - 18, 30, 33, MAD2);
        for (var x = px + 7; x < px + 30; x += 6) ret(ctx, x, py - 16, 1, 29, escurecer(MAD2, 0.25));
      },
      lado: function (ctx, px, py) {
        caixa(ctx, px + 3, py - 18, 11, 49, MAD2);
        ret(ctx, px + 3, py - 18, 3, 49, K); ret(ctx, px + 4, py - 17, 1, 47, MAD);
        circulo(ctx, px + 3, py - 6, 2, '#ff6b7a'); ret(ctx, px + 2, py + 6, 2, 5, LIL); ret(ctx, px + 2, py + 18, 2, 5, AMAR);
        for (var y = py - 10; y < py + 28; y += 12) ret(ctx, px + 7, y, 6, 1, escurecer(MAD2, 0.25));
      },
    }) });

  /* ---------- espelho de parede (1×2) ---------- */
  I.objeto('casa-quarto-jogador-espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      arred(ctx, px + 2, py + 4, 12, 22, K); arred(ctx, px + 3, py + 5, 10, 20, ROSA);
      ret(ctx, px + 4, py + 7, 8, 16, '#d4eef8'); ret(ctx, px + 5, py + 8, 1, 6, C.branco); ret(ctx, px + 6, py + 9, 1, 2, C.branco);
      ret(ctx, px + 9, py + 18, 2, 3, '#e8f8ff'); ret(ctx, px + 3, py + 5, 10, 1, clarear(ROSA, 0.45));
      coracao(ctx, px + 6, py + 1, ROSA); ret(ctx, px + 6, py + 1, 5, 1, K);
      ret(ctx, px + 4, py + 24, 2, 1, AMAR); ret(ctx, px + 10, py + 24, 2, 1, AMAR);
    } });
})();
