/* Casa do jogador: as miniaturas de lugares famosos do Mercado da Garagem (dados em js/conteudo/casa/lugares.js),
   parte A: as torres de 1 tile (Torre Eiffel, Big Ben, Liberdade, Torre de Pisa) e as formas simples de 2 tiles
   (Pirâmides, Monte Fuji). Cada uma é uma maquete num pedestal de madeira escura com o chão do lugar em cima (grama,
   areia, pedra) e a plaquinha dourada na frente; a maquete sobe acima da pegada (`topo`) e anda na ordem por Y com a
   Mariana (`alto`). Só a direção baixo (não giram). `forma` pinta uma silhueta pixel a pixel com o contorno #3a2446
   na borda e a luz de cima e da esquerda. Sem movimento. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var I = R.Interiores;

  var MAD = '#8a5a3a', OURO = C.ouro, OURO3 = C.ouro3;
  var CHAO = {
    grama: ['#7fc85a', '#a8e078'], areia: ['#f2d48a', '#fff0b8'], pedra: ['#c9c2d6', '#e6e1ee'],
  };

  function pincel(ctx, px, py) {
    return {
      r: function (x, y, w, h, c) { ret(ctx, px + x, py + y, w, h, c); },
      m: function (x, y, linhas, pal) { matriz(ctx, px + x, py + y, linhas, pal); },
    };
  }
  /* silhueta: dentro(i, j) diz se o pixel (i, j) da caixa W×H em (x, y) é do desenho; a borda sai em contorno e o
     resto na cor(i, j, luz), com luz = 1 colado no contorno de cima ou da esquerda, -1 no da direita, 0 no meio */
  function forma(p, x, y, W, H, dentro, cor) {
    function em(i, j) { return i >= 0 && j >= 0 && i < W && j < H && dentro(i, j); }
    function borda(i, j) { return em(i, j) && (!em(i - 1, j) || !em(i + 1, j) || !em(i, j - 1) || !em(i, j + 1)); }
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      if (!em(i, j)) continue;
      var luz = borda(i - 1, j) || borda(i, j - 1) ? 1 : borda(i + 1, j) ? -1 : 0;
      p.r(x + i, y + j, 1, 1, borda(i, j) ? K : cor(i, j, luz));
    }
  }
  // a cor de sempre com a luz em faixa: clara no contorno de cima/esquerda, escura no da direita
  function tons(c) { var l = clarear(c, 0.35), e = escurecer(c, 0.2); return function (i, j, luz) { return luz > 0 ? l : luz < 0 ? e : c; }; }
  // larguras por linha, centradas em cx (meio pixel: largura par em cx = 8 fica de 8 - l/2 a 7 + l/2)
  function perfil(larg, cx) { return function (i, j) { var l = larg[j] || 0; return l > 0 && i >= cx - l / 2 && i < cx + l / 2; }; }

  /* o pedestal: madeira escura, o chão do lugar em cima (3 linhas) e a plaquinha dourada no meio da frente */
  function pedestal(p, W, chao) {
    p.r(0, 7, W, 9, K);
    p.r(1, 8, W - 2, 3, chao[0]); p.r(1, 8, W - 2, 1, chao[1]);
    p.r(1, 11, W - 2, 3, MAD); p.r(1, 11, W - 2, 1, clarear(MAD, 0.3)); p.r(1, 12, 1, 2, clarear(MAD, 0.15));
    p.r(2, 14, W - 3, 1, escurecer(MAD, 0.25));
    p.r(W / 2 - 3, 12, 6, 2, OURO); p.r(W / 2 - 3, 12, 6, 1, OURO3);
  }
  function maquete(id, w, topo, desenho) {
    I.objeto('casa-movel-' + id, { w: w, h: 1, topo: topo, solido: true, alto: true,
      desenhar: function (ctx, px, py) { var p = pincel(ctx, px, py); desenho(p); } });
  }

  /* ----- Torre Eiffel (França): de ferro cor de bronze, quatro pés com o arco, dois andares e a antena ----- */
  var EIFFEL = [2, 2, 2, 4, 4, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 6, 6, 8, 8, 12, 12, 12, 10, 10, 12, 12, 14, 16];
  var ARCO = { 30: 2, 31: 4, 32: 6, 33: 6, 34: 8 };   // linha → largura do vão entre os pés
  var BRONZE = '#b07848';
  maquete('lugar-torre-eiffel', 1, 24, function (p) {
    pedestal(p, 16, CHAO.grama);
    var cheio = perfil(EIFFEL, 8);
    forma(p, 0, -24, 16, 35, function (i, j) { var v = ARCO[j]; return cheio(i, j) && !(v && i >= 8 - v / 2 && i < 8 + v / 2); },
      function (i, j, luz) {
        if (luz) return luz > 0 ? clarear(BRONZE, 0.35) : escurecer(BRONZE, 0.25);
        return (i + j) % 2 ? BRONZE : escurecer(BRONZE, 0.25);   // a treliça
      });
    // os andares: faixa clara entre duas linhas de contorno
    [[-19, 6], [-5, 8], [2, 12]].forEach(function (a) {
      var x = 8 - a[1] / 2;
      p.r(x, a[0], a[1], 3, K); p.r(x + 1, a[0] + 1, a[1] - 2, 1, '#f0c080');
    });
    p.r(7, -24, 2, 3, K); p.r(7, -23, 1, 1, '#f0c080');
    p.r(7, -21, 1, 1, OURO3);   // a luz do topo
  });

  /* ----- Big Ben (Inglaterra): torre de pedra clara, o relógio grande, o campanário e o telhado pontudo ----- */
  // larguras de y = -24 a 10: ponta, telhado, campanário, cornija, relógio, cornija, corpo, base
  var BIGBEN = [0, 0, 2, 4, 6, 8, 10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 10, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 10, 10, 10];
  var AREIA_BB = '#e8c890', TELHA_BB = '#56709e';
  maquete('lugar-big-ben', 1, 24, function (p) {
    pedestal(p, 16, CHAO.pedra);
    var pedra = tons(AREIA_BB), telha = tons(TELHA_BB);
    forma(p, 0, -24, 16, 35, perfil(BIGBEN, 8), function (i, j, luz) { return j <= 6 ? telha(i, j, luz) : pedra(i, j, luz); });
    p.r(7, -24, 2, 1, OURO3); p.r(7, -23, 2, 1, OURO);                                 // a ponta dourada
    p.r(7, -20, 2, 1, OURO); p.r(7, -18, 2, 1, OURO);
    [4, 6, 9, 11].forEach(function (x) { p.r(x, -16, 1, 2, '#5a4470'); });              // o campanário
    p.r(3, -14, 10, 1, OURO);
    p.r(4, -13, 8, 8, OURO);                                                            // o relógio, de moldura dourada
    p.m(4, -13, ['..kkkk..', '.kwwwwk.', 'kwwwkwwk', 'kwwwkwwk', 'kwwwkkwk', 'kwwwwwwk', '.kwwwwk.', '..kkkk..'], { k: K, w: C.branco });
    [6, 9].forEach(function (x) { p.r(x, -3, 1, 10, escurecer(AREIA_BB, 0.25)); });   // as linhas góticas do corpo
    p.r(7, -1, 2, 2, '#5a4470'); p.r(7, 3, 2, 2, '#5a4470');
  });

  /* ----- Liberdade (Estados Unidos): a estátua verde de cobre com a tocha, a coroa e o livro, no pedestal ----- */
  var COBRE = '#5fbf9f', COBRE_L = '#a2ead0', COBRE_D = '#3a9a7e', GRANITO = '#d9cbb0';
  maquete('lugar-liberdade', 1, 24, function (p) {
    pedestal(p, 16, CHAO.grama);
    // o pedestal de pedra (y -4 a 10)
    forma(p, 0, -4, 16, 15, perfil([10, 8, 8, 8, 8, 8, 8, 8, 8, 10, 10, 12, 12, 12, 12], 8), tons(GRANITO));
    p.r(5, -1, 6, 1, escurecer(GRANITO, 0.2)); p.r(7, 2, 2, 3, '#7a6a5a');
    // o manto, a cabeça, a coroa
    forma(p, 0, -14, 16, 11, perfil([4, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8], 9), function (i, j, luz) {
      return luz > 0 ? COBRE_L : luz < 0 ? COBRE_D : (i === 8 || i === 10) && j > 3 ? COBRE_D : COBRE;
    });
    p.m(7, -18, ['.kkkk.', 'kllggk', 'klggdk', '.kkkk.'], { k: K, l: COBRE_L, g: COBRE, d: COBRE_D });
    p.m(6, -21, ['k..k..k.', '.k.k.k..', '..kkk...'], { k: K });                        // os raios da coroa
    p.r(5, -19, 1, 1, K); p.r(12, -19, 1, 1, K);
    // o braço erguido com a tocha (do lado esquerdo de quem olha)
    p.m(3, -21, ['kgk', 'klk', 'klk', 'klk', 'klk', '.klk', '.klk', '..klk'], { k: K, l: COBRE_L, g: COBRE });
    p.m(3, -24, ['.y.', 'oyo', 'kOk'], { y: OURO3, o: '#ff9a3d', O: OURO, k: K });
    // o livro na outra mão
    p.m(10, -12, ['kkkk', 'kttk', 'kttk', 'kttk', 'kkkk'], { k: K, t: COBRE_L });
  });

  /* ----- Torre de Pisa (Itália): de mármore branco, as galerias de arcos e torta para a direita ----- */
  var MARMORE = '#f4efe6', ARCO_P = '#9a8cb8';
  maquete('lugar-torre-pisa', 1, 22, function (p) {
    pedestal(p, 16, CHAO.grama);
    function torre(j) {   // [x0, largura] da linha j (y = j - 22): 1 px para a direita a cada 7 linhas
      var y = j - 22, inc = Math.floor((10 - y) / 7), l = y >= -14 ? 8 : y >= -19 ? 6 : y >= -21 ? 4 : 0;
      return [8 - l / 2 + inc, l];
    }
    forma(p, 0, -22, 16, 33, function (i, j) { var t = torre(j); return i >= t[0] && i < t[0] + t[1]; }, function (i, j, luz) {
      var y = j - 22, x = i - torre(j)[0];
      if (luz > 0) return C.branco;
      if (luz < 0) return '#cfc6d8';
      if (y >= 4) return y >= 6 && x % 2 ? ARCO_P : MARMORE;                            // o térreo, com arcos altos
      return (y + 30) % 3 === 0 ? C.branco : x % 2 ? ARCO_P : MARMORE;                   // galerias: cornija e arcos
    });
  });

  /* ----- Pirâmides (Egito): três pirâmides douradas na areia, de tijolos em faixas ----- */
  var DOURADO = '#f2c45a';
  function piramide(p, cx, topo, base, k) {
    forma(p, 0, topo, 32, base - topo + 1, function (i, j) { return Math.abs(i + 0.5 - cx) <= (j + 1) * k; }, function (i, j, luz) {
      var c = i + 0.5 < cx ? clarear(DOURADO, 0.2) : escurecer(DOURADO, 0.12);
      if (j % 3 === 2) c = escurecer(c, 0.15);                                           // as fileiras de pedra
      return luz > 0 ? clarear(c, 0.3) : c;
    });
  }
  maquete('lugar-piramides', 2, 12, function (p) {
    pedestal(p, 32, CHAO.areia);
    piramide(p, 22, -4, 9, 0.62);
    piramide(p, 11, -12, 9, 0.55);
    piramide(p, 27, 2, 9, 0.6);
  });

  /* ----- Monte Fuji (Japão): o vulcão de neve no topo, a cerejeira e o portão vermelho ----- */
  var FUJI = '#7a86d8';
  maquete('lugar-monte-fuji', 2, 12, function (p) {
    pedestal(p, 32, CHAO.grama);
    forma(p, 0, -12, 32, 22, function (i, j) { return Math.abs(i + 0.5 - 16) <= 4 + 12 * Math.pow(j / 21, 1.5); }, function (i, j, luz) {
      var neve = j <= 6 + ((i * 7) % 5 === 0 ? 3 : (i * 3) % 4 === 0 ? 1 : 0), esq = i < 16;
      var c = neve ? (esq ? C.branco : '#dfe6ff') : (esq ? clarear(FUJI, 0.2) : FUJI);
      return luz > 0 ? clarear(c, 0.3) : luz < 0 ? escurecer(c, 0.15) : c;
    });
    // a cerejeira em flor
    forma(p, 0, -4, 10, 9, function (i, j) { var a = (i - 4.5) / 4.5, b = (j - 4) / 4; return a * a + b * b <= 1; }, function (i, j) {
      return (i * 5 + j * 3) % 7 === 0 ? C.branco : i + j < 6 ? '#ffc4e0' : '#ff8fc4';
    });
    p.r(4, 4, 3, 6, K); p.r(5, 4, 1, 5, '#8a5a3a');
    // o portão torii
    p.m(22, 1, ['kkkkkkkkk', 'krrrrrrrk', 'kkrkkkrkk', '.krrrrrk.', '.krkkkrk.', '.krk.krk.', '.krk.krk.', '.krk.krk.', '.kkk.kkk.'],
      { k: K, r: '#ff4a4a' });
  });
})();
