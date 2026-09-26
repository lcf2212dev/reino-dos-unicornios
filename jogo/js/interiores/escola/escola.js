/* Escola do Reino (provas bimestriais): corredor com a Diretora Margarida e o mural dos prêmios,
   e uma sala de aula por prova registrada (montadas pelo gerador, na ordem de Reino.provas).
   Só dados e os objetos temáticos da escola; as falas moram em escola/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.escola) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // letrinhas 3×5 para as palavras dos cartazes
  var LETRAS = {
    A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'], C: ['.xx', 'x..', 'x..', 'x..', '.xx'],
    E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'], H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'], K: ['x.x', 'x.x', 'xx.', 'x.x', 'x.x'],
    L: ['x..', 'x..', 'x..', 'x..', 'xxx'], N: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'], O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'],
    P: ['xx.', 'x.x', 'xx.', 'x..', 'x..'], S: ['.xx', 'x..', '.x.', '..x', 'xx.'], T: ['xxx', '.x.', '.x.', '.x.', '.x.'],
    U: ['x.x', 'x.x', 'x.x', 'x.x', 'xxx'], D: ['xx.', 'x.x', 'x.x', 'x.x', 'xx.'], F: ['xxx', 'x..', 'xx.', 'x..', 'x..'],
  };
  function palavra(ctx, texto, x, y, cor) {
    for (var i = 0; i < texto.length; i++) matriz(ctx, x + i * 4, y, LETRAS[texto[i]] || LETRAS.O, { x: cor });
  }
  function maca(ctx, cx, cy) {
    circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, C.vermelho); ret(ctx, cx - 1, cy - 1, 1, 1, '#ffc0c8');
    ret(ctx, cx, cy - 5, 1, 2, C.madeiraEscura); ret(ctx, cx + 1, cy - 5, 2, 1, C.folha3);
  }

  /* ================= OBJETOS DA ESCOLA ================= */
  // carteira de aluno com a cadeirinha (virada para a lousa)
  I.objeto('escola-carteira', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', C.madeiraClara), ca = v(o, 'cadeira', C.azul);
      // tampo
      ret(ctx, px + 1, py - 6, 14, 7, K); ret(ctx, px + 2, py - 5, 12, 5, c); ret(ctx, px + 2, py - 5, 12, 1, '#ffd9a8');
      ret(ctx, px + 3, py + 1, 2, 6, K); ret(ctx, px + 11, py + 1, 2, 6, K);
      // caderno e lápis no tampo
      ret(ctx, px + 4, py - 5, 5, 4, C.branco); ret(ctx, px + 4, py - 5, 1, 4, v(o, 'caderno', C.rosa));
      ret(ctx, px + 10, py - 4, 3, 1, C.ouro); ret(ctx, px + 13, py - 4, 1, 1, C.rosa2);
      // cadeira
      ret(ctx, px + 3, py + 5, 10, 4, K); ret(ctx, px + 4, py + 6, 8, 2, ca);
      ret(ctx, px + 3, py + 9, 10, 3, K); ret(ctx, px + 4, py + 9, 8, 2, D.escurecer(ca, 0.2));
      ret(ctx, px + 4, py + 12, 2, 3, K); ret(ctx, px + 10, py + 12, 2, 3, K);
    } });
  // mesa da professora, com maçã, livros e o potinho de lápis
  I.objeto('escola-mesa-prof', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', C.madeira), x = px + 1, w = 30;
      contornoRet(ctx, x, py - 2, w, 17, D.escurecer(c, 0.1));
      ret(ctx, x + 1, py - 1, w - 2, 5, D.clarear(c, 0.25)); ret(ctx, x + 1, py - 1, w - 2, 1, D.clarear(c, 0.5));
      ret(ctx, x + 1, py + 4, w - 2, 1, D.escurecer(c, 0.35));
      contornoRet(ctx, x + 3, py + 6, 11, 7, c); ret(ctx, x + 7, py + 9, 3, 1, C.ouro);
      contornoRet(ctx, x + 16, py + 6, 11, 7, c); ret(ctx, x + 20, py + 9, 3, 1, C.ouro);
      maca(ctx, x + 5, py - 5);
      // livros empilhados
      ret(ctx, x + 10, py - 6, 10, 5, K); ret(ctx, x + 11, py - 5, 8, 1, v(o, 'livro', C.azul)); ret(ctx, x + 11, py - 3, 8, 1, C.verde);
      // potinho de lápis
      ret(ctx, x + 23, py - 6, 5, 6, K); ret(ctx, x + 24, py - 5, 3, 4, C.lilas);
      ret(ctx, x + 24, py - 10, 1, 4, C.ouro); ret(ctx, x + 26, py - 9, 1, 3, C.vermelho); ret(ctx, x + 25, py - 11, 1, 5, C.azul);
    } });
  // mochila no chão
  I.objeto('escola-mochila', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', C.rosa), cx = px + 8;
      ret(ctx, cx - 5, py - 3, 11, 17, K); ret(ctx, cx - 4, py - 2, 9, 15, c);
      ret(ctx, cx - 4, py - 2, 9, 2, D.clarear(c, 0.3));
      ret(ctx, cx - 3, py + 5, 7, 6, K); ret(ctx, cx - 2, py + 6, 5, 4, D.escurecer(c, 0.15));
      ret(ctx, cx - 1, py + 6, 3, 1, C.ouro);
      ret(ctx, cx - 3, py - 5, 7, 3, K); ret(ctx, cx - 2, py - 4, 5, 1, D.escurecer(c, 0.3));
      ret(ctx, cx + 2, py + 1, 2, 2, C.ouro3);
    } });
  // lixeira de papel
  I.objeto('escola-lixeira', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', C.verde), cx = px + 8;
      ret(ctx, cx - 5, py + 1, 11, 14, K); ret(ctx, cx - 4, py + 2, 9, 12, c);
      for (var i = -3; i <= 3; i += 3) ret(ctx, cx + i, py + 4, 1, 8, D.escurecer(c, 0.2));
      ret(ctx, cx - 6, py - 1, 13, 3, K); ret(ctx, cx - 5, py, 11, 1, D.clarear(c, 0.3));
      ret(ctx, cx - 2, py - 3, 4, 3, K); ret(ctx, cx - 1, py - 2, 2, 1, C.branco);
    } });
  // armários coloridos (escaninhos) do corredor
  I.objeto('escola-escaninhos', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, cs = v(o, 'cores', [C.azul, C.rosa, C.verde, C.ouro]);
      var n = Math.max(2, Math.floor((W - 2) / 8)), lw = Math.floor((W - 2) / n);
      ret(ctx, px + 1, py - 18, n * lw + 1, 33, K);
      for (var i = 0; i < n; i++) {
        var x = px + 2 + i * lw, c = cs[i % cs.length];
        ret(ctx, x, py - 17, lw - 1, 31, c); ret(ctx, x, py - 17, 1, 31, D.clarear(c, 0.35));
        for (var j = 0; j < 3; j++) ret(ctx, x + 2, py - 14 + j * 2, lw - 4, 1, D.escurecer(c, 0.3));
        ret(ctx, x + lw - 3, py - 4, 1, 3, C.branco);
        ret(ctx, x + 2, py + 6, lw - 4, 3, D.escurecer(c, 0.2));
      }
    } });
  // alfabeto na parede (faixa com as letras coloridas)
  I.objeto('escola-alfabeto', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, cs = [C.vermelho, C.laranja, C.ouro2, C.verde, C.azul, C.lilas, C.rosa];
      ret(ctx, px + 1, py + 10, W - 2, 1, K);
      var letras = 'ABCDEF', passo = Math.floor((W - 2) / letras.length);
      for (var i = 0; i < letras.length; i++) {
        var x = px + 1 + i * passo, y = py + 11 + (i % 2);
        ret(ctx, x, y, passo - 1, 9, K); ret(ctx, x + 1, y + 1, passo - 3, 7, C.creme);
        matriz(ctx, x + Math.floor((passo - 4) / 2), y + 2, LETRAS[letras[i]], { x: cs[i % cs.length] });
      }
      ret(ctx, px + 3, py + 22, W - 6, 5, K); ret(ctx, px + 4, py + 23, W - 8, 3, C.creme2);
      for (var k = 0; k < (W - 10) / 3; k++) ret(ctx, px + 5 + k * 3, py + 24, 2, 1, cs[k % cs.length]);
    } });
  // cartaz com uma palavra «em inglês» e o desenho dela
  var FIGURAS = {
    APPLE: function (ctx, cx, cy) { maca(ctx, cx, cy + 1); },
    BOOK: function (ctx, cx, cy) { ret(ctx, cx - 4, cy - 2, 9, 6, K); ret(ctx, cx - 3, cy - 1, 3, 4, C.branco); ret(ctx, cx + 1, cy - 1, 3, 4, C.branco); ret(ctx, cx, cy - 1, 1, 4, C.azul); },
    SUN: function (ctx, cx, cy) { circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, C.ouro); ret(ctx, cx, cy - 5, 1, 1, C.ouro2); ret(ctx, cx, cy + 5, 1, 1, C.ouro2); ret(ctx, cx - 5, cy, 1, 1, C.ouro2); ret(ctx, cx + 5, cy, 1, 1, C.ouro2); },
    CAT: function (ctx, cx, cy) { circulo(ctx, cx, cy + 1, 3, K); circulo(ctx, cx, cy + 1, 2, C.laranja); ret(ctx, cx - 3, cy - 3, 2, 2, K); ret(ctx, cx + 2, cy - 3, 2, 2, K); ret(ctx, cx - 1, cy, 1, 1, K); ret(ctx, cx + 1, cy, 1, 1, K); },
    HELLO: function (ctx, cx, cy) { matriz(ctx, cx - 3, cy - 3, ['.k.k..', 'kyky.k', 'kyyykk', 'kyyyk.', '.kyk..', '..k...'], { k: K, y: '#ffe0c7' }); },
  };
  I.objeto('escola-palavras', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, p = v(o, 'palavra', W > 16 ? 'APPLE' : 'CAT'), fundo = v(o, 'cor', C.creme);
      contornoRet(ctx, px + 1, py + 8, W - 2, 18, fundo);
      ret(ctx, px + 2, py + 9, W - 4, 2, v(o, 'faixa', C.azul));
      (FIGURAS[v(o, 'figura', p)] || FIGURAS.SUN)(ctx, px + Math.floor(W / 2), py + 15);
      var lw = p.length * 4 - 1;
      palavra(ctx, p, px + Math.floor((W - lw) / 2), py + 20, v(o, 'letra', C.roxo));
      ret(ctx, px + 2, py + 7, 2, 2, C.vermelho); ret(ctx, px + W - 4, py + 7, 2, 2, C.azul);
    } });
  // bandeirinha do Reino Unido
  I.objeto('escola-bandeira', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 1, y = py + 10, AZ = '#2f4f8a', VM = '#d63d63';
      ret(ctx, x - 1, y - 3, 2, 18, K); ret(ctx, x, y - 3, 1, 17, C.madeira);
      ret(ctx, x + 1, y - 1, 14, 11, K); ret(ctx, x + 2, y, 12, 9, AZ);
      for (var i = 0; i < 12; i++) { var j = Math.round(i * 8 / 11); ret(ctx, x + 2 + i, y + j, 1, 1, C.branco); ret(ctx, x + 2 + i, y + 8 - j, 1, 1, C.branco); }
      ret(ctx, x + 2, y + 3, 12, 3, C.branco); ret(ctx, x + 6, y, 4, 9, C.branco);
      ret(ctx, x + 2, y + 4, 12, 1, VM); ret(ctx, x + 7, y, 2, 9, VM);
    } });
  // sino da escola
  I.objeto('escola-sino', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 7, 11, 3, K); ret(ctx, cx - 4, py + 8, 9, 1, C.madeira);
      ret(ctx, cx - 1, py + 10, 3, 3, K);
      triangulo(ctx, cx - 6, py + 12, 13, 9, K); triangulo(ctx, cx - 5, py + 13, 11, 7, C.ouro);
      ret(ctx, cx - 6, py + 20, 13, 3, K); ret(ctx, cx - 5, py + 20, 11, 2, C.ouro2);
      ret(ctx, cx - 2, py + 14, 1, 4, C.ouro3); circulo(ctx, cx, py + 23, 1, K);
      ret(ctx, cx + 6, py + 12, 1, 12, K); ret(ctx, cx + 7, py + 12, 1, 12, C.vermelho);
    } });
  // brasão da escola: livro aberto com estrela
  I.objeto('escola-brasao', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      matriz(ctx, cx - 6, py + 7, [
        'kkkkkkkkkkkkk', 'kgggggggggggk', 'kgwwwwkwwwwgk', 'kgwllwkwllwgk', 'kgwwwwkwwwwgk', 'kgwllwkwllwgk', 'kgwwwwkwwwwgk',
        'kgggggyggggk.', '.kgggyyyggk..', '.kggggyggggk.', '..kgggggggk..', '...kgggggk...', '....kgggk....', '.....kgk.....', '......k......',
      ].map(function (l) { return l.length < 13 ? l + '.' : l; }), { k: K, g: '#39a860', w: C.creme, l: '#9fcfff', y: C.ouro });
      ret(ctx, cx - 7, py + 24, 15, 3, K); ret(ctx, cx - 6, py + 25, 13, 1, C.ouro);
    } });
  // cartas antigas numa mesinha (sala de História)
  I.objeto('escola-cartas', { w: 1, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 1, 14, 5, K); ret(ctx, px + 2, py, 12, 3, C.madeiraClara);
      ret(ctx, px + 3, py + 4, 2, 11, K); ret(ctx, px + 11, py + 4, 2, 11, K);
      [[2, -6, C.creme], [6, -8, '#f3e6c8'], [8, -5, C.creme]].forEach(function (e) {
        contornoRet(ctx, px + e[0], py + e[1], 7, 5, e[2]);
        ret(ctx, px + e[0] + 1, py + e[1] + 1, 5, 1, '#d8c8b0'); ret(ctx, px + e[0] + 5, py + e[1] + 1, 1, 1, C.vermelho);
      });
    } });
  // linha do tempo num suporte (sala de História)
  I.objeto('escola-linha-tempo', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py - 2, 2, 17, K); ret(ctx, px + 27, py - 2, 2, 17, K);
      ret(ctx, px + 1, py - 14, 30, 14, K); ret(ctx, px + 2, py - 13, 28, 12, '#f6e2b0');
      ret(ctx, px + 4, py - 6, 24, 1, C.madeiraEscura);
      [[6, C.madeira3], [12, '#9b6bd6'], [19, C.azul], [25, C.verde]].forEach(function (m, i) {
        ret(ctx, px + m[0], py - 8, 2, 5, m[1]);
        ret(ctx, px + m[0] - 1, py - 12 + (i % 2) * 8, 4, 3, K); ret(ctx, px + m[0], py - 11 + (i % 2) * 8, 2, 1, C.branco);
      });
      triangulo(ctx, px + 27, py - 8, 3, 5, C.madeiraEscura);
    } });

  // receita na parede (sala de Português): ficha com morango, ingredientes e modo de preparo
  I.objeto('escola-receita', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var VD = '#39a860', VM = '#e0433f';
      contornoRet(ctx, px + 2, py + 6, 28, 22, C.creme);
      ret(ctx, px + 3, py + 7, 26, 3, VD); ret(ctx, px + 3, py + 8, 26, 1, D.clarear(VD, 0.3));
      ret(ctx, px + 14, py + 4, 4, 3, K); ret(ctx, px + 15, py + 5, 2, 1, VM);   // alfinete
      // morango grande
      circulo(ctx, px + 8, py + 17, 4, K); circulo(ctx, px + 8, py + 17, 3, VM);
      ret(ctx, px + 6, py + 12, 5, 2, VD); ret(ctx, px + 7, py + 16, 1, 1, C.ouro3); ret(ctx, px + 9, py + 18, 1, 1, C.ouro3);
      // ingredientes (bolinha + linha) e modo de preparo (linhas numeradas)
      for (var i = 0; i < 3; i++) { ret(ctx, px + 15, py + 12 + i * 3, 2, 2, [VM, C.ouro, VD][i]); ret(ctx, px + 18, py + 12 + i * 3, 8 - (i % 2) * 2, 1, '#8a7aa8'); }
      ret(ctx, px + 5, py + 24, 22, 1, '#8a7aa8'); ret(ctx, px + 5, py + 26, 15, 1, '#8a7aa8');
    } });
  // quadro das sílabas num suporte (sala de Português): BO-LA em blocos coloridos e palminhas
  I.objeto('escola-silabas', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py - 2, 2, 17, K); ret(ctx, px + 27, py - 2, 2, 17, K);
      ret(ctx, px + 1, py - 14, 30, 14, K); ret(ctx, px + 2, py - 13, 28, 12, '#2e6b45');
      [['BO', '#e0433f', 4], ['LA', '#ffd34d', 17]].forEach(function (b) {
        ret(ctx, px + b[2], py - 11, 11, 8, K); ret(ctx, px + b[2] + 1, py - 10, 9, 6, b[1]);
        palavra(ctx, b[0], px + b[2] + 2, py - 10, b[1] === '#ffd34d' ? K : C.branco);
      });
      ret(ctx, px + 15, py - 8, 2, 1, C.branco);   // o tracinho entre as sílabas
      ret(ctx, px + 2, py - 2, 28, 1, C.madeira3);
    } });

  /* ---------- mural dos prêmios: derivado do estado (colorido = ganho; silhueta = ainda não) ---------- */
  var FUNDO_RARIDADE = { lendario: '#ffe6f7', raro: '#dcefff', comum: '#f4f0f8' };
  var BORDA_RARIDADE = { lendario: '#ff7eb6', raro: '#5fb4ff', comum: '#c4b4d4' };
  var RARIDADES = ['lendario', 'raro', 'comum'];
  // só o prêmio da prova acende o mural: comprar os outros na Loja das Fadas não conta
  function ganhou(P, prova, r) {
    var a = prova.acessorios && prova.acessorios[r];
    if (!a || !P || !P.regProva) return false;
    return P.regProva(prova).premio === r;
  }
  function larguraMural(n) { return n <= 1 ? 4 : 7; }
  I.objeto('escola-mural', { w: 7, h: 1, topo: 32, solido: true, alto: true,   // 32: a faixa dourada sobe 2 px acima da moldura
    chave: function (P) {
      return 'mural:' + (R.provas || []).map(function (pv) {
        return pv.id + '=' + RARIDADES.map(function (r) { return ganhou(P, pv, r) ? 1 : 0; }).join('');
      }).join(',');
    },
    desenhar: function (ctx, px, py, o, P) {
      var W = (o.w || 7) * 16, top = py - 30, H = 45;
      // pés e moldura de madeira com cortiça
      ret(ctx, px + 4, py + 10, 3, 5, K); ret(ctx, px + W - 7, py + 10, 3, 5, K);
      ret(ctx, px + 1, top, W - 2, H - 4, K);
      ret(ctx, px + 2, top + 1, W - 4, H - 6, C.madeira);
      ret(ctx, px + 4, top + 3, W - 8, H - 10, '#e3b981');
      for (var i = 0; i < W - 10; i += 5) ret(ctx, px + 6 + i, top + 6 + (i % 3) * 9, 1, 1, '#c99a60');
      // faixa dourada com estrelinhas no alto
      ret(ctx, px + Math.floor(W / 2) - 16, top - 2, 32, 6, K); ret(ctx, px + Math.floor(W / 2) - 15, top - 1, 30, 4, C.ouro);
      for (var s = -12; s <= 12; s += 6) ret(ctx, px + Math.floor(W / 2) + s, top + 1, 2, 1, C.branco);
      var provas = R.provas || [], cols = Math.min(2, Math.max(1, provas.length)), linhas = Math.ceil(provas.length / cols);
      var gw = 52, gh = 18, x0 = px + Math.floor((W - cols * gw) / 2) + 1, y0 = top + 6 + Math.floor((H - 12 - linhas * gh) / 2);
      provas.forEach(function (pv, n) {
        var gx = x0 + (n % cols) * gw, gy = y0 + Math.floor(n / cols) * gh;
        RARIDADES.forEach(function (r, k) {
          var a = pv.acessorios && pv.acessorios[r], x = gx + k * 17, tem = ganhou(P, pv, r);
          ret(ctx, x - 1, gy - 1, 18, 18, K);
          ret(ctx, x, gy, 16, 16, tem ? FUNDO_RARIDADE[r] : '#e8e0ee');
          ret(ctx, x, gy, 16, 1, BORDA_RARIDADE[r]);
          var ic = a && window.PA && PA.iconeDesenho ? PA.iconeDesenho('acessorio:' + a.id) : null;
          if (ic) ctx.drawImage(tem ? ic : PA.silhueta(ic), x, gy);
          else matriz(ctx, x + 6, gy + 4, ['.kk.', 'k..k', '..k.', '.k..', '....', '.k..'], { k: '#8a7aa8' });
        });
      });
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npcDoElenco(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }

  /* ================= GERADOR DAS SALAS DE AULA ================= */
  // professor conhecido de cada prova (ids fixos do elenco)
  var PROFESSORES = { 'historia-3bim': 'helena', 'ingles-3bim': 'emma', 'portugues-3bim': 'lucia' };
  // tema de cada matéria: piso, paleta e os enfeites próprios (coordenadas locais da sala 11×11)
  var TEMAS = {
    historia: {
      piso: 'taco', parede: 'papel',
      paleta: { piso: '#f2c9a8', piso2: '#dca88a', parede: '#fff1e0', parede2: '#ffe0b8', rodape: '#8a604a', detalhe: '#ff9d2e' },
      cortina: '#ff9d2e', carteira: '#ff9d2e',
      enfeites: [
        { tipo: 'mapa-parede', x: 8, y: 0 }, { tipo: 'estandarte', x: 10, y: 0, var: { cor: '#ff9d2e', emblema: 'estrela' } },
        { tipo: 'quadro', x: 3, y: 0, var: { cena: 'castelo' } },
        inter('linha-tempo', 'Linha do tempo', { tipo: 'escola-linha-tempo', x: 7, y: 9 }),
        inter('cartas', 'Cartas antigas', { tipo: 'escola-cartas', x: 0, y: 9 }),
      ],
    },
    ingles: {
      piso: 'azulejo', parede: 'azulejo',
      paleta: { piso: '#eef4ff', piso2: '#bcd0f2', parede: '#e8f4ff', parede2: '#9fcfff', rodape: '#2f4f8a', detalhe: '#d63d63' },
      cortina: '#d63d63', carteira: '#5fb4ff',
      enfeites: [
        inter('palavras', 'Cartaz de palavras', { tipo: 'escola-palavras', x: 8, y: 0, var: { palavra: 'APPLE' } }),
        inter('bandeira', 'Bandeira', { tipo: 'escola-bandeira', x: 10, y: 0 }),
        { tipo: 'escola-palavras', x: 3, y: 0, w: 1, var: { palavra: 'CAT', faixa: '#d63d63' } },
        { tipo: 'cavalete', x: 7, y: 9 }, { tipo: 'luminaria-pe', x: 8, y: 9 },
        { tipo: 'bau', x: 0, y: 9 },
      ],
    },
    portugues: {
      piso: 'taco', parede: 'papel',
      paleta: { piso: '#e8f4dc', piso2: '#bcdca4', parede: '#fff4ec', parede2: '#ffd6cc', rodape: '#2e7a45', detalhe: '#e0433f' },
      cortina: '#e0433f', carteira: '#39a860',
      enfeites: [
        inter('receita', 'Receita', { tipo: 'escola-receita', x: 8, y: 0 }),
        { tipo: 'estandarte', x: 10, y: 0, var: { cor: '#e0433f', emblema: 'coracao' } },
        { tipo: 'escola-palavras', x: 3, y: 0, w: 1, var: { palavra: 'ABC', figura: 'BOOK', faixa: '#39a860', letra: '#e0433f' } },
        inter('silabas', 'Quadro das sílabas', { tipo: 'escola-silabas', x: 7, y: 9 }),
        { tipo: 'escola-mochila', x: 0, y: 9, var: { cor: '#e0433f' } },
      ],
    },
  };
  // salas de provas sem tema próprio (a Fase 5 testa com uma prova fictícia)
  var TEMA_PADRAO = {
    piso: 'carpete', parede: 'papel',
    paleta: { piso: '#d8f0d8', piso2: '#b8dcb8', parede: '#f2fbef', parede2: '#cdeec8', rodape: '#2e8b3e', detalhe: '#ffd34d' },
    cortina: '#6fdc8c', carteira: '#6fdc8c',
    enfeites: [
      { tipo: 'bandeirinhas', x: 8, y: 0 }, { tipo: 'cartaz', x: 10, y: 0, var: { desenho: 'estrela' } },
      { tipo: 'quadro', x: 3, y: 0, var: { cena: 'flor' } },
      { tipo: 'mesa', x: 7, y: 9, var: { toalha: '#c8f0c8', itens: ['livro', 'planta'] } }, { tipo: 'caixote', x: 0, y: 9, var: { item: 'estrela' } },
    ],
  };
  var MOCHILAS = [C.rosa, C.azul, C.lilas, C.laranja, C.verde];
  var FALAS_PADRAO = F.professorPadrao || {};

  function nomeMateria(prova) {
    var m = R.materia ? R.materia(prova.materiaId) : null;
    return (m && m.nome) || prova.nome || 'Aula';
  }
  // professor da prova: do elenco, se houver; senão um professor padrão
  function professor(prova, x, y) {
    var acao = { tipo: 'prova', prova: prova.id }, id = PROFESSORES[prova.id];
    if (id) return npcDoElenco(id, x, y, acao);
    return { id: 'prof-' + prova.id, nome: 'Professora do Reino', voz: 'npc-padrao-3', x: x, y: y, acao: acao, falas: FALAS_PADRAO,
      sprite: { base: 'pessoa', pele: '#e8b48a', cabelo: '#3a2a20', penteado: 'coque', oculos: true, roupa: '#9b6bd6', roupa2: '#5a3d8a', perna: 'saia', livro: '#ffd34d' } };
  }
  // uma sala de aula completa (cômodo, objetos, professor, porta e corredores) para a prova n
  function gerarSala(prova, n) {
    var ox = 1 + 12 * (n + 1), oy = 1, tema = TEMAS[prova.materiaId] || TEMA_PADRAO, cm = tema.carteira;
    var objetos = sala(ox, oy, [
      // parede do fundo: janela, alfabeto, lousa com ABC, relógio (+ enfeites do tema)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'escola-alfabeto', x: 1, y: 0 },
      inter('lousa', 'Lousa', { tipo: 'lousa', x: 4, y: 0, w: 3 }),
      { tipo: 'relogio-parede', x: 7, y: 0 },
      // frente da sala
      { tipo: 'armario', x: 0, y: 2, var: { cor: tema.paleta.parede2 } },
      inter('globo', 'Globo', { tipo: 'globo', x: 2, y: 2 }),
      { tipo: 'escola-mesa-prof', x: 8, y: 3, var: { livro: tema.cortina } },
      { tipo: 'vaso-planta', x: 10, y: 5 },
      // carteiras em duas fileiras, com o corredor no meio
      { tipo: 'escola-carteira', x: 1, y: 5, var: { cadeira: cm } }, { tipo: 'escola-carteira', x: 3, y: 5, var: { cadeira: cm, caderno: C.azul } },
      { tipo: 'escola-carteira', x: 7, y: 5, var: { cadeira: cm, caderno: C.verde } }, { tipo: 'escola-carteira', x: 9, y: 5, var: { cadeira: cm } }, { tipo: 'flores', x: 3, y: 2 },
      { tipo: 'escola-carteira', x: 1, y: 7, var: { cadeira: cm, caderno: C.lilas } }, { tipo: 'escola-carteira', x: 3, y: 7, var: { cadeira: cm } },
      { tipo: 'escola-carteira', x: 7, y: 7, var: { cadeira: cm, caderno: C.ouro } }, { tipo: 'escola-carteira', x: 9, y: 7, var: { cadeira: cm, caderno: C.azul } },
      { tipo: 'escola-mochila', x: 0, y: 6, var: { cor: MOCHILAS[(n + 1) % 5] } }, { tipo: 'escola-mochila', x: 10, y: 5, var: { cor: MOCHILAS[(n + 3) % 5] } },
      inter('mochila', 'Mochila', { tipo: 'escola-mochila', x: 4, y: 7, var: { cor: MOCHILAS[n % 5] } }),
      // fundo da sala
      { tipo: 'cesto', x: 1, y: 9 }, { tipo: 'pilha-livros', x: 3, y: 9 }, { tipo: 'escola-lixeira', x: 2, y: 9 },
      { tipo: 'estante', x: 9, y: 9 }, { tipo: 'cabideiro', x: 0, y: 10 },
      { tipo: 'papeis', x: 8, y: 10 },
    ].concat(tema.enfeites));
    return {
      comodo: { id: 'sala-' + prova.id, nome: 'Sala de ' + nomeMateria(prova), placa: 'Sala de ' + nomeMateria(prova),
        rect: { x: ox, y: oy, w: 11, h: 11 }, piso: tema.piso, parede: tema.parede, paleta: tema.paleta },
      objetos: objetos,
      npc: professor(prova, ox + 7, oy + 3),
      porta: { x: ox + 5, y: 12, w: 1, h: 3 },     // atravessa o vão e a parede do corredor
      corredores: [{ x: ox + 5, y: oy + 3, w: 1, h: 8 }],
    };
  }

  /* ================= CORREDOR ================= */
  // o corredor tem um trecho para o hall (à esquerda) e um trecho embaixo de cada sala
  function trechoHall(bx, by, nProvas) {
    var mw = larguraMural(nProvas);
    return sala(bx, by, [
      // parede do hall: janela, sino, relógio e o brasão em cima da mesa da Diretora
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'escola-sino', x: 1, y: 0 }, { tipo: 'relogio-parede', x: 2, y: 0 },
      { tipo: 'escola-brasao', x: 3, y: 0 },
      { tipo: 'planta-alta', x: 0, y: 2 },
      inter('bebedouro', 'Bebedouro', { tipo: 'bebedouro', x: 2, y: 2 }),
      { tipo: 'escrivaninha', x: 3, y: 2, var: { abajur: '#39a860' } },
      // o mural dos prêmios fica à direita e uma fileira à frente da parede: no canto de cima à esquerda
      // ele sumia sob os avisos do HUD (⭐, "🥚 1 ovo!"). Bandeirinhas na parede em cima dele; atrás dele,
      // só caixotes (o chão ali ficaria preso)
      { tipo: 'bandeirinhas', x: 5, y: 0 }, { tipo: 'bandeirinhas', x: 7, y: 0 }, { tipo: 'bandeirinhas', x: 9, y: 0 },
      inter('mural', 'Prêmios da Escola do Reino', { tipo: 'escola-mural', x: 12 - mw, y: 3, w: mw }),
      { tipo: 'caixote', x: 12 - mw, y: 2, w: mw },
      // passadeira no corredor (não bloqueia)
      { tipo: 'tapete', x: 0, y: 4, w: 12, h: 2, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
      // recepção, perto do tapete de saída
      { tipo: 'tapete', x: 4, y: 6, w: 3, h: 1, var: { cor: '#9fe0a0', borda: '#ffd34d' } },
      { tipo: 'banco', x: 0, y: 7 }, { tipo: 'vaso-planta', x: 2, y: 7 },
      { tipo: 'vitrine', x: 8, y: 7, var: { itens: ['medalha', 'coroa', 'estrela'] } }, { tipo: 'vaso-grande', x: 10, y: 8 },
      { tipo: 'flores', x: 7, y: 7 },
    ]);
  }
  function trechoSala(bx, by, n, ultimo) {
    var lista = [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cartaz', x: 1, y: 0, var: { desenho: ['abc', 'numeros', 'arcoiris'][n % 3] } },
      { tipo: 'quadro', x: 2, y: 0 }, { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
      { tipo: 'cartaz', x: 7, y: 0, var: { desenho: ['coracao', 'estrela'][n % 2] } }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'estandarte', x: 9, y: 0, var: { cor: '#39a860', emblema: n % 2 ? 'coracao' : 'estrela' } },
      { tipo: 'cortina', x: 10, y: 0, var: { cor: '#6fdc8c' } },
      n === 0 ? inter('escaninhos', 'Armários dos alunos', { tipo: 'escola-escaninhos', x: 0, y: 2 })
        : { tipo: 'escola-escaninhos', x: 0, y: 2, var: { cores: [C.lilas, C.laranja, C.azul, C.rosa] } },
      { tipo: 'vaso-planta', x: 2, y: 2 }, { tipo: 'cabideiro', x: 8, y: 2 }, { tipo: 'banco', x: 9, y: 2 },
      // passadeira listrada no corredor, com um tapete redondo na frente da porta
      { tipo: 'tapete-listrado', x: 0, y: 4, w: ultimo ? 11 : 12, h: 1, var: { cores: ['#39a860', '#fff8ee', '#ffd34d', '#fff8ee'] } },
      { tipo: 'tapete-listrado', x: 0, y: 5, w: ultimo ? 11 : 12, h: 1, var: { cores: ['#ffd34d', '#fff8ee', '#39a860', '#fff8ee'] } },
      { tipo: 'tapete-redondo', x: 4, y: 2, w: 3, h: 2 },
      // fileira de baixo: sempre algo a cada 2 tiles
      { tipo: 'banco', x: 1, y: 7 }, { tipo: 'vaso-planta', x: 4, y: 8 }, { tipo: 'escola-lixeira', x: 7, y: 7 },
      { tipo: 'flores', x: 9, y: 8 }, { tipo: 'cesto', x: 10, y: 8 },
      { tipo: 'tapete-listrado', x: 4, y: 6, w: 3, h: 1, var: { cores: ['#39a860', '#fff8ee', '#ffd34d', '#fff8ee'] } },
    ];
    if (!ultimo) lista.push({ tipo: 'bandeirinhas', x: 10, y: 0, w: 2 }, { tipo: 'planta-alta', x: 11, y: 2 });
    return sala(bx, by, lista);
  }

  /* ================= MONTAGEM ================= */
  function montar() {
    var provas = R.provas || [], N = provas.length, S = N + 1;
    var salas = provas.map(gerarSala);
    var largura = 12 * S - 1, by = 13;
    var objetos = trechoHall(1, by, N);
    salas.forEach(function (s, n) { objetos = objetos.concat(trechoSala(1 + 12 * (n + 1), by, n, n === N - 1)); });
    salas.forEach(function (s) { objetos = objetos.concat(s.objetos); });
    // a bandeirinha do trecho anterior passa por cima da cortina: tira a cortina desse tile
    objetos = objetos.filter(function (o) {
      return !(o.tipo === 'cortina' && objetos.some(function (b) { return b.tipo === 'bandeirinhas' && b.y === o.y && b.x <= o.x && b.x + (b.w || 2) > o.x; }));
    });
    return {
      id: 'escola',
      lugar: 'escola',
      nome: 'Escola do Reino',
      entrada: true,
      pacote: 'interior-escola',
      tamanho: { w: largura + 2, h: 23 },
      saida: { x: 6, y: 21 },
      spawn: { x: 6, y: 20 },
      comodos: [
        { id: 'corredor', nome: 'Corredor', placa: 'Corredor • Escola do Reino', rect: { x: 1, y: by, w: largura, h: 9 },
          piso: 'mosaico', parede: 'madeira', paleta: { piso: '#fff6dc', piso2: '#9fe0a0', detalhe: '#ffd34d', parede: '#f7eed8', parede2: '#e2d2ae', rodape: '#2d6b4a' } },
      ].concat(salas.map(function (s) { return s.comodo; })),
      portas: salas.map(function (s) { return s.porta; }),
      corredores: [
        { x: 1, y: by + 4, w: largura, h: 2 },   // passagem do corredor
        { x: 5, y: by + 5, w: 3, h: 4 },         // do tapete de saída até a passagem
      ].concat([].concat.apply([], salas.map(function (s) { return s.corredores.concat([{ x: s.porta.x, y: by + 2, w: 1, h: 2 }]); }))),
      objetos: objetos,
      npcs: [npcDoElenco('margarida', 5, by + 3, { tipo: 'guia', lugar: 'escola' })].concat(salas.map(function (s) { return s.npc; })),
    };
  }
  R.registrarInterior(montar());
})();
