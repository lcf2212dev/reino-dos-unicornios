/* Casa do jogador: os enfeites da loja Casa Bonita (Vila Arco-Íris; dados em js/conteudo/casa/moveis-loja.js), parte C:
   17 de chão, pelúcias, estatuetas e miudezas (almofadas, bolo de festa, pote de biscoito, galinha de louça, leiteira,
   perfumes, sereiazinha, globo de neve, porco cofrinho, aquarinho, coelho, caixa de música, fardo de feno, balde de
   cenoura, dragãozinho, ET de pelúcia, rocha espacial). Movimento de sempre (casa.md §13.7): o peixinho do aquarinho
   nada e sobem bolhas. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, circulo = D.circulo, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores, CA = R.CasaArte, virado = CA.virado;

  var ROSA = '#ff8fc4', OURO = C.ouro, LIL = '#c9a8ff', ROXO = '#9b7cf0', VERDE = '#7fe08a', FOLHA = C.folha3;
  var MAD = '#d99a5b', METAL = '#b9c4d6', VIDRO = '#d9f3ff', AGUA = '#7fc8ff', FENO = '#f2cf6a';

  function pincel(ctx, px, py) {
    var p = {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
      c: function (x, y, raio, c) { circulo(ctx, px + x, py + y, raio, c); },
      caixa: function (x, y, w, h, c) {
        p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, c);
        p.r(x + 1, y + 1, w - 2, 1, clarear(c, 0.4)); p.r(x + 1, y + 2, 1, h - 3, clarear(c, 0.2));
        p.r(x + 2, y + h - 2, w - 3, 1, escurecer(c, 0.2));
      },
    };
    return p;
  }
  // silhueta pixel a pixel com contorno na borda (a mesma da parte B)
  function forma(p, x, y, W, H, dentro, cor) {
    function em(i, j) { return i >= 0 && j >= 0 && i < W && j < H && dentro(i, j); }
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      if (!em(i, j)) continue;
      p.r(x + i, y + j, 1, 1, (!em(i - 1, j) || !em(i + 1, j) || !em(i, j - 1) || !em(i, j + 1)) ? K : cor(i, j));
    }
  }
  function oval(cx, cy, rx, ry) { return function (i, j) { var a = (i - cx) / rx, b = (j - cy) / ry; return a * a + b * b <= 1; }; }
  function chao(id, topo, desenho) {
    return I.objeto('casa-movel-' + id, { w: 1, h: 1, topo: topo, solido: true,
      desenhar: function (ctx, px, py, o) { desenho(pincel(ctx, px, py), o); } });
  }
  function banquinho(p, cor) {                                                         // banquinho de 3 pés embaixo
    p.caixa(1, 6, 14, 4, cor); p.r(2, 10, 3, 5, K); p.r(3, 10, 1, 4, cor); p.r(11, 10, 3, 5, K); p.r(12, 10, 1, 4, cor);
    p.r(6, 10, 4, 3, K); p.r(7, 10, 2, 2, escurecer(cor, 0.2));
  }

  /* ----- almofadas (estar): pilha de três almofadas estampadas ----- */
  chao('almofadas', 6, function (p) {
    function almofada(x, y, w, h, cor, estampa) {
      forma(p, x, y, w, h, function (i, j) { return !((i === 0 || i === w - 1) && (j === 0 || j === h - 1)); }, function (i, j) {
        return j === 1 ? clarear(cor, 0.4) : j === h - 2 ? escurecer(cor, 0.15) : estampa(i, j) ? clarear(cor, 0.55) : cor;
      });
      p.r(x - 1, y + 1, 1, 1, K); p.r(x + w, y + 1, 1, 1, K); p.r(x - 1, y + h - 2, 1, 1, K); p.r(x + w, y + h - 2, 1, 1, K);   // pontas
    }
    almofada(1, 7, 14, 8, '#7fc8ff', function (i, j) { return (i + j) % 4 === 0; });
    almofada(2, 1, 12, 7, ROSA, function (i, j) { return i % 3 === 1 && j % 2 === 1; });
    almofada(4, -5, 9, 7, OURO, function (i, j) { return j === 3 && i > 1 && i < 7; });
  });

  /* ----- bolo de festa (jantar): três andares no prato de pé ----- */
  chao('bolo-festa', 14, function (p) {
    p.r(7, -14, 1, 1, OURO); p.r(7, -13, 1, 1, '#ff9a3d');
    p.r(6, -12, 3, 4, K); p.r(7, -11, 1, 3, '#7fc8ff');
    p.caixa(4, -8, 8, 5, C.branco); p.r(5, -6, 1, 1, ROSA); p.r(8, -6, 1, 1, ROSA); p.r(10, -5, 1, 1, ROSA);
    p.caixa(2, -4, 12, 6, ROSA); p.r(3, -3, 10, 1, C.branco); p.r(4, -2, 1, 1, C.branco); p.r(8, -2, 1, 1, C.branco); p.r(11, -2, 1, 1, C.branco);
    p.caixa(1, 1, 14, 6, '#fff1d6'); p.r(2, 4, 12, 1, '#ff5c6a');
    p.r(0, 7, 16, 2, K); p.r(1, 7, 14, 1, METAL);
    p.r(6, 9, 4, 4, K); p.r(7, 9, 2, 3, METAL);
    p.r(3, 12, 10, 3, K); p.r(4, 12, 8, 1, clarear(METAL, 0.4)); p.r(4, 13, 8, 1, METAL);
  });

  /* ----- pote de biscoito (cozinha): pote de vidro com tampa de ursinho, num caixote ----- */
  chao('pote-biscoito', 10, function (p) {
    p.m(5, -10, ['k.kk.k', 'kokkok', '.kook.', 'kkkkkk'], { k: K, o: '#c98a4b' });
    p.r(2, -6, 12, 2, K); p.r(3, -6, 10, 1, '#c98a4b');
    forma(p, 2, -4, 12, 12, function (i, j) { return !((i === 0 || i === 11) && (j === 0 || j === 11)); }, function (i) {
      return i === 1 ? C.branco : VIDRO;
    });
    [[4, -1], [8, 0], [5, 3], [9, 4]].forEach(function (b) {
      p.m(b[0], b[1], ['.kk.', 'kbbk', 'kcbk', '.kk.'], { k: K, b: '#d9a35c', c: '#6b4428' });
    });
    p.caixa(1, 8, 14, 7, MAD); p.r(2, 11, 12, 1, escurecer(MAD, 0.3));
  });

  /* ----- galinha de louça (cozinha): branca, crista vermelha, sentada num ninho ----- */
  chao('galinha', 8, function (p) {
    p.m(2, -8, ['..rr..', '.krrk.', 'kwwwwk', 'kwwekk', 'kwwwkoo', '.kwwkk.'], { k: K, r: '#ff5c6a', w: C.branco, e: K, o: '#ff9a3d' });
    forma(p, 2, -3, 13, 11, oval(6, 5, 6.5, 5.5), function (i, j) { return j < 3 ? C.branco : '#eef0ff'; });
    p.m(7, -1, ['.kkk', 'kwwk', 'kkwk', '..kk'], { k: K, w: '#dfe2f5' });
    p.r(4, 6, 1, 1, '#ff5c6a');
    forma(p, 0, 6, 16, 9, function (i, j) { return j > 1 || (i > 1 && i < 14); }, function (i, j) { return (i + j * 2) % 3 ? '#e0b060' : '#b8863a'; });
  });

  /* ----- leiteira (cozinha): latão de leite antigo com margaridas ----- */
  function margarida(p, x, y) { p.m(x, y, ['.w.', 'wyw', '.w.'], { w: C.branco, y: OURO }); }
  chao('leiteira', 10, function (p) {
    p.r(5, -8, 1, 8, FOLHA); p.r(8, -10, 1, 10, FOLHA); p.r(11, -7, 1, 7, FOLHA);
    margarida(p, 4, -9); margarida(p, 7, -11 + 1); margarida(p, 10, -8);
    p.r(4, -1, 8, 2, K); p.r(5, -1, 6, 1, clarear(METAL, 0.4));
    p.r(2, 1, 12, 14, K);
    p.r(3, 2, 10, 12, METAL); p.r(3, 2, 2, 12, clarear(METAL, 0.45)); p.r(11, 2, 2, 12, escurecer(METAL, 0.2));
    p.r(3, 5, 10, 1, escurecer(METAL, 0.3)); p.r(3, 11, 10, 1, escurecer(METAL, 0.3));
    p.r(0, 3, 3, 4, K); p.r(13, 3, 3, 4, K); p.r(1, 4, 1, 2, METAL); p.r(14, 4, 1, 2, METAL);   // alças
    p.m(6, 7, ['.k.k', 'kpkp', '.kp.'], { k: '#ff8fc4', p: '#ff8fc4' });
  });

  /* ----- perfumes (banheiro): três vidrinhos numa mesinha redonda ----- */
  chao('perfumes', 10, function (p) {
    p.m(1, -9, ['.kk.', 'kook', '.kk.', 'kkkk', 'kppk', 'kPpk', 'kppk', 'kkkk'], { k: K, o: OURO, p: ROSA, P: '#ffc4e0' });
    p.m(6, -10, ['..kk..', '..kk..', '.kkkk.', 'kvvvvk', 'kVvvvk', 'kvvvvk', 'kVvvvk', 'kvvvvk', 'kkkkkk'], { k: K, v: LIL, V: '#ece0ff' });
    p.m(12, -7, ['.kk.', 'kook', 'kkkk', 'kaak', 'kAak', 'kkkk'], { k: K, o: OURO, a: AGUA, A: C.branco });
    p.r(0, -1, 16, 4, K); p.r(1, 0, 14, 1, clarear('#f3e6c8', 0.4)); p.r(1, 1, 14, 1, '#f3e6c8');
    p.r(6, 3, 4, 8, K); p.r(7, 3, 2, 8, MAD);
    p.r(3, 11, 10, 4, K); p.r(4, 12, 8, 2, MAD); p.r(4, 12, 8, 1, clarear(MAD, 0.4));
  });

  /* ----- sereiazinha (banheiro): estatueta numa pedra ----- */
  chao('sereia', 16, function (p) {
    p.m(4, -16, [
      '..kkkk..', '.kccccks', 'kcsssskc', 'kcsesekc', 'kcssssck', '.kcssck.', 'kkssssk.', 'kpsppsk.', '.kppppk.',
      '..kaaak.', '..kaAak.', '..kaaaak', '...kaaak', '...kaaak', '....kaak', '...kkaak', '..kaakak', '..kakk.k',
    ], { k: K, c: '#ff8a5c', s: '#ffe0c8', e: K, p: '#c9a8ff', a: '#5fd6c0', A: '#a8f0e2' });
    forma(p, 1, 2, 14, 13, function (i, j) { return j > 2 || (i > 2 && i < 12) ; }, function (i, j) {
      return j < 4 ? '#d8d0ea' : (i + j) % 5 ? '#b8aed0' : '#a39ac0';
    });
    p.r(3, 9, 2, 1, C.branco);                                                         // conchinha
  });

  /* ----- globo de neve (quarto dela): castelinho e neve na bola de vidro ----- */
  chao('globo-neve', 12, function (p) {
    forma(p, 1, -12, 14, 14, oval(6.5, 6.5, 7, 7), function (i, j) { return j > 10 ? C.branco : (i + j < 6) ? '#ecf9ff' : '#cbeeff'; });
    p.m(4, -7, ['k.k.k..', 'kpkpk..', 'kpppkk.', 'kpdpkpk', 'kpdpppk', 'kkkkkkk'].map(function (l) { return l.slice(0, 7) + '.'; }), { k: K, p: '#ffc4dd', d: ROXO });
    [[4, -10], [9, -9], [11, -6], [3, -4], [12, -3], [7, -11]].forEach(function (n) { p.r(n[0], n[1], 1, 1, C.branco); });
    p.r(4, -11, 2, 1, C.branco); p.r(3, -10, 1, 2, C.branco);
    p.caixa(1, 2, 14, 6, '#c98a4b'); p.r(6, 4, 4, 2, OURO);
    p.caixa(0, 8, 16, 7, escurecer('#c98a4b', 0.15));
  });

  /* ----- porco cofrinho (quarto dela): porquinho rosa com moeda ----- */
  chao('cofrinho', 6, function (p) {
    p.r(6, -6, 4, 1, K); p.r(5, -5, 6, 3, K); p.r(6, -5, 4, 2, OURO); p.r(7, -5, 1, 1, C.ouro3);   // moeda na fenda
    forma(p, 0, -2, 16, 14, oval(7.5, 6.5, 7.5, 6.5), function (i, j) { return j < 3 ? '#ffc4e0' : ROSA; });
    p.r(2, -3, 3, 3, K); p.r(3, -2, 1, 1, ROSA); p.r(11, -3, 3, 3, K); p.r(12, -2, 1, 1, ROSA);   // orelhas
    p.r(4, 2, 1, 2, K); p.r(11, 2, 1, 2, K);
    p.m(5, 4, ['.kkkkk.', 'kpppppk', 'kpkpkpk', '.kkkkk.'], { k: K, p: '#ffb0d0' });
    p.r(3, 10, 3, 5, K); p.r(10, 10, 3, 5, K); p.r(4, 10, 1, 4, '#ffb0d0'); p.r(11, 10, 1, 4, '#ffb0d0');
  });

  /* ----- aquarinho (quarto dela): bola de vidro com um peixinho, num banquinho ----- */
  var PEIXE = [['.oo.o', 'ooooo', '.oo.o'], ['o.oo.', 'ooooo', 'o.oo.']];   // para a esquerda / para a direita
  var NADO = [[0, 0], [-1, 0], [-2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [2, 0], [1, 0]];
  function peixe(p, dx, volta) { p.m(6 + dx, -5, PEIXE[volta], { o: '#ff8a3d' }); }
  var aquarinho = chao('aquarinho', 10, function (p, o) {
    forma(p, 1, -10, 14, 16, function (i, j) { return oval(6.5, 8.5, 7, 7.5)(i, j) && j > 1; }, function (i, j) {
      return j < 5 ? VIDRO : j < 6 ? clarear(AGUA, 0.5) : j > 13 ? '#f3d9b0' : AGUA;
    });
    p.r(2, -9, 12, 1, K); p.r(3, -8, 1, 1, C.branco);
    p.r(3, -6, 1, 5, C.branco);
    p.m(10, 0, ['g.', 'gg', '.g', 'gg'], { g: C.folha3 });
    if (!(o && o.uid)) peixe(p, 0, 0);                                                // na casa (com uid), o peixe nada no anim
    banquinho(p, ROSA);
  });
  aquarinho.anim = CA.sempre({ baixo: function (p, t, o) {
    if (!o.uid) return;
    var n = NADO[Math.floor(t / 480) % NADO.length];
    peixe(p, n[0], n[1]);
    if (!t) return;
    var u = Math.floor(t / 400) % 6;                                                  // uma bolha sobe da areia
    if (u < 5) p.r(9, 3 - u * 2, 1, 1, C.branco);
  } });

  /* ----- coelho de pelúcia (quarto dela): branco de orelhas rosa e laço ----- */
  chao('coelho-pelucia', 10, function (p) {
    p.m(3, -10, ['.kk...kk.', 'kwpk.kpwk', 'kwpk.kpwk', 'kwpk.kpwk', '.kwk.kwk.'], { k: K, w: C.branco, p: ROSA });
    forma(p, 2, -6, 12, 10, oval(5.5, 4.5, 6, 5), function (i, j) { return j < 3 ? C.branco : '#f4f0ff'; });
    p.r(5, -2, 1, 2, K); p.r(10, -2, 1, 2, K); p.r(7, 0, 2, 1, ROSA); p.r(4, 0, 1, 1, '#ffc4e0'); p.r(11, 0, 1, 1, '#ffc4e0');
    p.m(5, 3, ['kk.kk', 'kakak', 'kk.kk'], { k: K, a: '#7fc8ff' });                  // laço
    forma(p, 1, 5, 14, 10, oval(6.5, 5, 7, 5), function (i, j) { return j < 2 ? C.branco : '#ece6fb'; });
    p.c(8, 10, 2, '#ffd6e8');
    p.r(2, 13, 4, 2, K); p.r(10, 13, 4, 2, K); p.r(3, 13, 2, 1, C.branco); p.r(11, 13, 2, 1, C.branco);
  });

  /* ----- caixa de música (quarto dela): bailarina em cima de uma caixa lilás ----- */
  chao('caixa-musica', 10, function (p) {
    p.m(5, -10, ['..kk..', '..ks..', '.kpk..', 'kspppk', '..pk..', '.kppk.', 'kppppk', '..ks..', '..k.k.'], { k: K, s: '#ffe0c8', p: ROSA });
    p.r(7, -1, 2, 2, K);
    p.caixa(1, 1, 14, 9, LIL); p.r(2, 4, 12, 1, OURO); p.m(6, 6, ['.k.k', 'kkkk', 'k.k.'], { k: ROXO });
    p.r(14, 4, 2, 2, K); p.r(15, 3, 1, 1, OURO);                                      // a chavinha de dar corda
    p.r(1, 10, 14, 5, K); p.r(2, 10, 12, 4, escurecer(LIL, 0.2)); p.r(2, 10, 12, 1, LIL);
  });

  /* ----- fardo de feno (quarto do unicórnio, 2×1) ----- */
  function feno(p, x, y, w, h) {
    p.r(x, y, w, h, K); p.r(x + 1, y + 1, w - 2, h - 2, FENO);
    for (var j = y + 2; j < y + h - 1; j += 2) for (var i = x + 1 + (j % 3); i < x + w - 2; i += 4) p.r(i, j, 2, 1, '#d9a83a');
    p.r(x + 1, y + 1, w - 2, 1, clarear(FENO, 0.5));
  }
  I.objeto('casa-movel-fardo-feno', { w: 2, h: 1, topo: 6, solido: true, desenhar: virado({
    baixo: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      feno(p, 1, -6, 30, 20); p.r(8, -6, 2, 20, '#c98a4b'); p.r(22, -6, 2, 20, '#c98a4b');
    },
    lado: function (ctx, px, py) {
      var p = pincel(ctx, px, py);
      feno(p, 1, -6, 14, 36); p.r(1, 2, 14, 2, '#c98a4b'); p.r(1, 20, 14, 2, '#c98a4b');
    },
  }) });

  /* ----- balde de cenouras (quarto do unicórnio) ----- */
  function cenoura(p, x, y) { p.m(x, y, ['g.g', '.g.', 'kok', 'kok', 'kok', '.k.'], { g: VERDE, k: K, o: '#ff8a3d' }); }
  chao('balde-cenoura', 12, function (p) {
    cenoura(p, 3, -10); cenoura(p, 7, -12); cenoura(p, 10, -9);
    p.r(1, -3, 14, 1, K); p.r(1, -4, 1, 2, K); p.r(14, -4, 1, 2, K);                    // alça
    p.r(1, -2, 14, 3, K); p.r(2, -1, 12, 1, clarear(METAL, 0.4));
    forma(p, 2, 1, 12, 14, function (i, j) { var c = Math.floor(j / 5); return i >= c && i < 12 - c; }, function (i, j) {
      return i < 3 ? clarear(METAL, 0.35) : j === 6 ? escurecer(METAL, 0.25) : METAL;
    });
  });

  /* ----- dragãozinho de pelúcia (quarto do unicórnio): verde, barriga amarela, asinhas ----- */
  chao('dragao-pelucia', 10, function (p) {
    p.m(0, -2, ['kk..', 'kak.', 'kaak', '.kak'], { k: K, a: '#c9a8ff' }); p.m(12, -2, ['..kk', '.kak', 'kaak', 'kak.'], { k: K, a: '#c9a8ff' });
    p.m(4, -10, ['.k....k.', 'kyk..kyk'], { k: K, y: OURO });
    forma(p, 3, -9, 10, 9, oval(4.5, 4, 5, 4.5), function (i, j) { return j < 2 ? '#a8f0b0' : VERDE; });
    p.r(5, -6, 2, 2, K); p.r(9, -6, 2, 2, K); p.r(5, -6, 1, 1, C.branco); p.r(9, -6, 1, 1, C.branco);
    p.r(6, -3, 1, 1, K); p.r(9, -3, 1, 1, K);
    forma(p, 2, 0, 12, 13, oval(5.5, 6, 6, 6.5), function (i, j) { return j < 2 ? '#a8f0b0' : VERDE; });
    forma(p, 5, 3, 6, 8, oval(2.5, 3.5, 3, 4), function () { return '#fff09a'; });
    p.m(12, 9, ['.kk.', 'kggk', '.kgk', '..kk'], { k: K, g: VERDE });                  // rabinho
    p.r(3, 12, 4, 3, K); p.r(9, 12, 4, 3, K); p.r(4, 12, 2, 2, VERDE); p.r(10, 12, 2, 2, VERDE);
  });

  /* ----- ET de pelúcia (quarto do ET): verde-limão, olhos grandes e antenas ----- */
  chao('et-pelucia', 12, function (p) {
    p.m(2, -12, ['kk......kk', 'kpk....kpk', '.k......k.', '..k....k..'], { k: K, p: ROSA });
    forma(p, 1, -9, 14, 11, oval(6.5, 5, 7, 5.5), function (i, j) { return j < 3 ? '#d8ff9a' : '#a8e85a'; });
    p.m(3, -6, ['.kkk..kkk.', 'kwkkkkwkkk', 'kkkk..kkkk', '.kk....kk.'].map(function (l) { return l; }), { k: K, w: C.branco });
    p.r(6, -1, 4, 1, K);
    forma(p, 3, 2, 10, 11, oval(4.5, 5, 5, 5.5), function (i, j) { return j < 2 ? '#d8ff9a' : '#a8e85a'; });
    p.r(6, 5, 4, 4, ROXO); p.r(7, 6, 2, 2, OURO);                                      // a estrelinha da roupa
    p.r(1, 4, 3, 4, K); p.r(12, 4, 3, 4, K); p.r(2, 5, 1, 2, '#a8e85a'); p.r(13, 5, 1, 2, '#a8e85a');
    p.r(4, 12, 3, 3, K); p.r(9, 12, 3, 3, K);
  });

  /* ----- rocha espacial (quarto do ET): pedra roxa com cristais, numa base de exposição ----- */
  chao('rocha-espacial', 8, function (p) {
    forma(p, 2, -6, 12, 11, function (i, j) { return oval(5.5, 6, 6, 5.5)(i, j) || (j > 4 && i > 0 && i < 11); }, function (i, j) {
      return (i * 3 + j * 5) % 7 === 0 ? '#5a4a8a' : j < 4 ? '#8f7ac0' : '#6f5aa8';
    });
    p.m(4, -8, ['.k...', 'kck..', 'kck.k', 'kcckc', 'kccck'], { k: K, c: '#7ff0e0' });
    p.m(9, -5, ['..k', '.kc', 'kcc', 'kck'], { k: K, c: '#ff9ce0' });
    p.r(5, -6, 1, 2, C.branco);
    p.caixa(1, 5, 14, 4, '#8a94aa'); p.caixa(0, 9, 16, 6, escurecer('#8a94aa', 0.15)); p.r(5, 11, 6, 1, OURO);
  });
})();
