/* Ilustrações do capítulo 12 "O visual do poema" (grupo icones; Reino.registrarIlustracao, js/arte/ilustracoes.js):
   os poemas visuais de Sérgio Capparelli redesenhados em pixel art, com as próprias palavras formando a imagem
   (jacaré letrado, um ovo, o que é mãe, relâmpago, a primavera endoideceu, Falta de sorte), o contorno do gato
   (APR p. 56), o jacaré com os 3 elementos marcados (p. 58) e a lousa do alfabeto (p. 71).
   As letras são de uma fonte pixel própria (abaixo), legível a partir de 2×; o texto inteiro de cada poema também
   está em blocos `versos` nas cartas (livro-12a.js, livro-12t.js), que é o que a voz lê.
   Até 152 px de largura: no celular a carta mostra em 2× sem rolar de lado. */
(function () {
  var K = '#3a2446', PAPEL = '#fffaf0', BRANCO = '#ffffff';

  /* ---------- fonte pixel: linhas de 0 a 8 ('/' separa as linhas, '.' vazio) ----------
     acento nas linhas 0-1, maiúsculas e hastes nas 1-6, minúsculas nas 3-6, pernas (g, j, p, q, ç) nas 7-8 */
  var X = '///';   // as 3 primeiras linhas vazias (corpo da minúscula começa na linha 3)
  var GLIFOS = {
    a: X + '.##/#.#/#.#/.##', b: '/#../#../##./#.#/#.#/##.', c: X + '.##/#../#../.##', d: '/..#/..#/.##/#.#/#.#/.##',
    e: X + '.#./###/#../.##', f: '/.##/.#./###/.#./.#./.#.', g: X + '.##/#.#/#.#/.##/..#/##.', h: '/#../#../##./#.#/#.#/#.#',
    i: '/#//#/#/#/#', j: '/.#//.#/.#/.#/.#/.#/#.', k: '/#../#../#.#/##./#.#/#.#', l: '/#/#/#/#/#/#',
    m: X + '##.#./#.#.#/#.#.#/#.#.#', n: X + '##./#.#/#.#/#.#', o: X + '.#./#.#/#.#/.#.', p: X + '##./#.#/#.#/##./#../#..',
    q: X + '.##/#.#/#.#/.##/..#/..#', r: X + '#.#/##./#../#..', s: X + '.##/##./..#/##.', t: '//#../###/#../#../.##',
    u: X + '#.#/#.#/#.#/.##', v: X + '#.#/#.#/#.#/.#.', w: X + '#...#/#.#.#/#.#.#/.#.#.', x: X + '#.#/.#./.#./#.#',
    y: X + '#.#/#.#/#.#/.##/..#/##.', z: X + '###/..#/#../###',
    A: '/.#./#.#/#.#/###/#.#/#.#', B: '/##./#.#/##./#.#/#.#/##.', C: '/.##/#../#../#../#../.##', D: '/##./#.#/#.#/#.#/#.#/##.',
    E: '/###/#../##./#../#../###', F: '/###/#../##./#../#../#..', G: '/.##/#../#../#.#/#.#/.##', H: '/#.#/#.#/###/#.#/#.#/#.#',
    I: '/###/.#./.#./.#./.#./###', J: '/..#/..#/..#/..#/#.#/.#.', K: '/#.#/#.#/##./##./#.#/#.#', L: '/#../#../#../#../#../###',
    M: '/#...#/##.##/#.#.#/#...#/#...#/#...#', N: '/#..#/##.#/#.##/#..#/#..#/#..#', O: '/.#./#.#/#.#/#.#/#.#/.#.',
    P: '/##./#.#/#.#/##./#../#..', Q: '/.#./#.#/#.#/#.#/#.#/.#./..#', R: '/##./#.#/#.#/##./#.#/#.#',
    S: '/.##/#../.#./..#/..#/##.', T: '/###/.#./.#./.#./.#./.#.', U: '/#.#/#.#/#.#/#.#/#.#/###', V: '/#.#/#.#/#.#/#.#/.#./.#.',
    W: '/#...#/#...#/#...#/#.#.#/##.##/#...#', X: '/#.#/#.#/.#./.#./#.#/#.#', Y: '/#.#/#.#/.#./.#./.#./.#.',
    Z: '/###/..#/.#./.#./#../###',
    '.': '//////#', ',': '//////.#/#.', '?': '/##./..#/.#./.#./.../.#.', '!': '/#/#/#/#//#', ':': '///#///#',
    '-': '////###', '"': '/#.#/#.#', '1': '/.#./##./.#./.#./.#./###', '2': '/##./..#/..#/.#./#../###',
    '3': '/##./..#/.#./..#/..#/##.', ' ': '/..',
  };
  var ACENTO = { '´': '..#/.#.', '`': '#../.#.', '^': '.#./#.#', '~': '.##/##.' };
  var COM_ACENTO = { 'á': 'a´', 'à': 'a`', 'â': 'a^', 'ã': 'a~', 'é': 'e´', 'ê': 'e^', 'ó': 'o´', 'ô': 'o^', 'õ': 'o~', 'ú': 'u´' };
  var CACHE = {};
  // glifo: { w, px: [[x, y], …] } (y de 0 a 8; o Ú tem acento nas linhas -1 e 0)
  function glifo(ch) {
    if (CACHE[ch]) return CACHE[ch];
    var px = [], w = 0;
    function poe(spec, y0) {
      spec.split('/').forEach(function (l, y) {
        w = Math.max(w, l.length);
        for (var x = 0; x < l.length; x++) if (l.charAt(x) === '#') px.push([x, y + y0]);
      });
    }
    if (COM_ACENTO[ch]) { var c = COM_ACENTO[ch]; poe(GLIFOS[c.charAt(0)], 0); poe(ACENTO[c.charAt(1)], 0); }
    else if (ch === 'í') { poe('.#/#./.../#./#./#./#.', 0); }
    else if (ch === 'ç') { poe(GLIFOS.c + '/.#.', 0); }
    else if (ch === 'Ú') { poe(GLIFOS.U, 0); poe(ACENTO['´'], -1); }
    else poe(GLIFOS[ch] || GLIFOS['?'], 0);
    return (CACHE[ch] = { w: w, px: px });
  }
  function largura(s) {
    var n = 0;
    Array.from(s).forEach(function (ch) { n += glifo(ch).w + 1; });
    return n ? n - 1 : 0;
  }
  /* escreve s com o canto de cima da linha em (x, y). op: escala, rot (0 | -90: de baixo para cima | 180),
     passo [dx, dy] (cada letra anda assim, em pé: escada e queda), dentro(x0, y0, x1, y1) (a letra só entra se couber
     inteira: palavras cortadas no contorno) e fundo (contorno de 1 px em volta das letras). Devolve a largura. */
  function escrever(ctx, s, x, y, cor, op) {
    op = op || {};
    var e = op.escala || 1, pen = 0;
    Array.from(s).forEach(function (ch, i) {
      var g = glifo(ch), bx = x + (op.passo ? op.passo[0] * i : 0), by = y + (op.passo ? op.passo[1] * i : 0);
      var a = op.passo ? 0 : pen, caixa;   // a caixa da letra na tela: [x0, y0, x1, y1]
      if (op.rot === -90) caixa = [bx, by - (a + g.w) * e, bx + 9 * e, by - a * e];
      else if (op.rot === 180) caixa = [bx - (a + g.w) * e, by - 9 * e, bx - a * e, by];
      else caixa = [bx + a * e, by, bx + (a + g.w) * e, by + 9 * e];
      function ponto(gx, gy, c) {
        var px = op.rot === -90 ? bx + gy * e : op.rot === 180 ? bx - (a + gx) * e - e : bx + (a + gx) * e;
        var py = op.rot === -90 ? by - (a + gx) * e - e : op.rot === 180 ? by - gy * e - e : by + gy * e;
        ctx.fillStyle = c; ctx.fillRect(px, py, e, e);
      }
      if (ch !== ' ' && (!op.dentro || op.dentro(caixa[0], caixa[1], caixa[2], caixa[3]))) {
        if (op.fundo) g.px.forEach(function (p) { for (var u = -1; u <= 1; u++) for (var v = -1; v <= 1; v++) ponto(p[0] + u, p[1] + v, op.fundo); });
        g.px.forEach(function (p) { ponto(p[0], p[1], cor); });
      }
      pen += g.w + 1;
    });
    return largura(s) * e;
  }
  function papel(ctx, w, h, fundo) { ctx.fillStyle = fundo || PAPEL; ctx.fillRect(0, 0, w, h); }
  // máscara (grade de booleanos) e o contorno dela, de 1 ou 2 px, pontilhado ou cheio
  function mascara(w, h, f) { var m = []; for (var y = 0; y < h; y++) { m.push([]); for (var x = 0; x < w; x++) m[y].push(!!f(x, y)); } return m; }
  function borda(ctx, m, cor, grossa, pontilhada) {
    var h = m.length, w = m[0].length, r = grossa ? 2 : 1;
    function em(x, y) { return x >= 0 && y >= 0 && x < w && y < h && m[y][x]; }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (!em(x, y)) continue;
      var fora = false;
      for (var a = -r; a <= r && !fora; a++) for (var b = -r; b <= r; b++) if (!em(x + a, y + b)) { fora = true; break; }
      if (fora && (!pontilhada || (x + y) % 4 < 2)) { ctx.fillStyle = cor; ctx.fillRect(x, y, 1, 1); }
    }
  }
  function selo(ctx, x, y, n) {   // bolinha roxa com o número do elemento (p. 58)
    ctx.fillStyle = '#8e4fd6'; ctx.fillRect(x + 1, y, 7, 9); ctx.fillRect(x, y + 1, 9, 7);
    escrever(ctx, n, x + 3, y, BRANCO);
  }

  /* ---------- jacaré letrado (pp. 55 e 58): só a palavra "jacaré", cortada no contorno do bicho ----------
     comprido e achatado como no livro: uma faixa de texto por linha (de 9 em 9 px) com os pedaços [x0, x1] que ficam
     dentro do jacaré (os dois olhos em cima, as costas com o vão do dorso, o focinho em ponta na linha mais comprida,
     o queixo, a barriga, as duas patas e o rabo descendo à esquerda); a letra só entra se couber inteira no pedaço */
  var JACARE = [[[98, 110], [120, 132]], [[8, 44], [56, 136]], [[3, 146]], [[2, 140]], [[2, 24], [32, 114]],
    [[2, 18], [46, 62], [88, 104]], [[4, 18], [48, 60], [90, 102]], [[8, 20]], [[12, 20]]];
  var TOPO_JACARE = 22, PASSO_JACARE = 9, PERIODO = largura('jacaré ') + 1;   // a linha repete "jacaré " de PERIODO em PERIODO px
  function faseJacare(i) { return -((i * 9) % PERIODO); }
  function noJacare(x, y) {
    var i = Math.floor((y - TOPO_JACARE) / PASSO_JACARE);
    return i >= 0 && i < JACARE.length && JACARE[i].some(function (p) { return x >= p[0] - 1 && x <= p[1]; });
  }
  function jacare(ctx, cor, op) {
    op = op || {};
    if (op.titulo) { ctx.fillStyle = op.titulo; ctx.fillRect(2, 0, largura('jacaré letrado') * 2 + 4, 18); }
    escrever(ctx, 'jacaré letrado', 4, 0, K, { escala: 2 });
    JACARE.forEach(function (pedacos, i) {
      pedacos.forEach(function (p) {
        escrever(ctx, 'jacaré jacaré jacaré jacaré jacaré jacaré jacaré ', faseJacare(i), TOPO_JACARE + i * PASSO_JACARE, cor,
          { dentro: function (x0, y0, x1) { return x0 >= p[0] && x1 <= p[1]; } });
      });
    });
    if (op.destaque) {   // uma palavra "jacaré" da 4ª linha do corpo, à direita do meio, em laranja (Elemento 1)
      var yd = TOPO_JACARE + 4 * PASSO_JACARE, xd = faseJacare(4) + 3 * PERIODO;
      ctx.fillStyle = op.destaque; ctx.fillRect(xd - 1, yd, largura('jacaré') + 2, 9);
      escrever(ctx, 'jacaré', xd, yd, cor);
    }
  }
  Reino.registrarIlustracao('lp-12-jacare', { w: 152, h: 104, desenhar: function (ctx) {
    papel(ctx, 152, 104);
    jacare(ctx, K);
  } });
  Reino.registrarIlustracao('lp-12-jacare-elementos', { w: 152, h: 106, desenhar: function (ctx) {
    papel(ctx, 152, 106);
    jacare(ctx, K, { titulo: '#bdeac4', destaque: '#ffb26b' });
    borda(ctx, mascara(152, 106, function (x, y) { return noJacare(x, y) || noJacare(x + 2, y) || noJacare(x - 2, y) || noJacare(x, y + 2) || noJacare(x, y - 2); }), '#8e4fd6', false, true);
    selo(ctx, 122, 4, '3');
    selo(ctx, 118, 76, '2');
    selo(ctx, 74, 68, '1');   // logo embaixo da palavra laranja, no vão entre as patas
  } });

  /* ---------- gato para escrever dentro (p. 56): contorno vazio de um gato sentado como no livro: corpo
     arredondado (cabeça e corpo num bloco só), duas orelhas pontudas nos cantos de cima e o rabo saindo embaixo, à
     direita, em S: vai para a direita, desce e volta para a esquerda até a ponta ---------- */
  Reino.registrarIlustracao('lp-12-gato', { w: 106, h: 144, desenhar: function (ctx) {
    papel(ctx, 106, 144, BRANCO);
    function corpo(x, y) { return Math.pow(Math.abs(x - 46) / (34 + 6 * (y - 10) / 112), 2.2) + Math.pow(Math.abs(y - 66) / 56, 2.2) < 0.99; }
    function triangulo(x, y, a, b, c) {
      function lado(p, q) { return (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]); }
      var d1 = lado(a, b), d2 = lado(b, c), d3 = lado(c, a);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    }
    // rabo: curva de Bézier grossa que afina até a ponta
    var cauda = [], P = [[80, 106], [104, 110], [100, 134], [74, 140]];
    for (var t = 0; t <= 1; t += 0.02) {
      var u = 1 - t, k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      cauda.push([k[0] * P[0][0] + k[1] * P[1][0] + k[2] * P[2][0] + k[3] * P[3][0], k[0] * P[0][1] + k[1] * P[1][1] + k[2] * P[2][1] + k[3] * P[3][1], 4.5 - 3 * t]);
    }
    var m = mascara(106, 144, function (x, y) {
      if (corpo(x, y)) return true;
      if (triangulo(x, y, [17, 30], [17, 2], [33, 14]) || triangulo(x, y, [75, 30], [75, 2], [59, 14])) return true;
      return cauda.some(function (p) { return (x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]) <= p[2] * p[2]; });
    });
    borda(ctx, m, K, true, false);
  } });

  /* ---------- um ovo (p. 59): ovo de Páscoa com fita em cruz e laço; "um ovo / de novo" na fita ---------- */
  Reino.registrarIlustracao('lp-12-ovo', { w: 152, h: 153, desenhar: function (ctx, D) {
    papel(ctx, 152, 153);
    var CX = 70, CY = 76, RX = 52, RY = 66, H1 = 50, H2 = 80;   // a faixa horizontal da fita vai de H1 a H2
    function meia(y) { var t = (y - CY) / RY; return t * t >= 1 ? -1 : RX * Math.sqrt(1 - t * t) * (0.86 + 0.14 * (y - CY + RY) / (2 * RY)); }
    function noOvo(x, y) { var h = meia(y); return h > 0 && Math.abs(x - CX) <= h; }
    var ovo = mascara(152, 153, noOvo);
    var fitaV = function (x, y) { return noOvo(x, y) && x >= 55 && x < 85; };
    var fitaH = function (x, y) { return noOvo(x, y) && y >= H1 && y < H2; };
    for (var y = 0; y < 153; y++) for (var x = 0; x < 152; x++) if (fitaV(x, y) || fitaH(x, y)) { ctx.fillStyle = K; ctx.fillRect(x, y, 1, 1); }
    borda(ctx, ovo, K, false, false);
    // laço no alto: duas alças, o nó e as pontas
    D.elipse(ctx, 57, 7, 10, 6, K); D.elipse(ctx, 57, 7, 5, 2, PAPEL);
    D.elipse(ctx, 83, 7, 10, 6, K); D.elipse(ctx, 83, 7, 5, 2, PAPEL);
    D.ret(ctx, 64, 2, 12, 11, K);
    for (var k = 0; k < 5; k++) { D.ret(ctx, 61 - k, 12 + k, 4, 1, K); D.ret(ctx, 76 + k, 12 + k, 4, 1, K); }
    escrever(ctx, 'um ovo', 0, -5, K, { escala: 2 });   // o último "o" encosta na alça esquerda do laço
    function naFita(f) { return function (x0, y0, x1, y1) { return f(x0, y0 + 1) && f(x1 - 1, y0 + 1) && f(x0, y1 - 3) && f(x1 - 1, y1 - 3); }; }
    ['de novo', 'um ovo', 'um ovo', 'de novo'].forEach(function (t, i) {
      escrever(ctx, t, 70 - (largura(t) >> 1), 21 + i * 7, BRANCO, { dentro: naFita(fitaV) });
    });
    ['um ovo', 'de novo', 'de novo', 'um ovo'].forEach(function (t, i) { escrever(ctx, t, 54 - largura(t), H1 + 1 + i * 7, BRANCO, { dentro: naFita(fitaH) }); });
    ['de novo', 'um ovo', 'um ovo', 'de novo'].forEach(function (t, i) { escrever(ctx, t, 87, H1 + 1 + i * 7, BRANCO, { dentro: naFita(fitaH) }); });
    // o nó: "ovo" grande na horizontal e o – v – o na vertical
    escrever(ctx, 'ovo', 59, 56, BRANCO, { escala: 2 });
    escrever(ctx, 'o', 67, 44, BRANCO, { escala: 2 });
    escrever(ctx, 'o', 67, 68, BRANCO, { escala: 2 });
    ['de novo', 'um ovo', 'de novo', 'um ovo', 'de novo', 'de novo', 'um ovo', 'um ovo'].forEach(function (t, i) {
      escrever(ctx, t, 70 - (largura(t) >> 1), 83 + i * 7, BRANCO, { dentro: naFita(fitaV) });
    });
    // a superfície do ovo: florzinhas de "o" e palavrinhas "ovo"
    [[38, 34], [102, 34], [32, 100], [108, 100], [42, 122], [98, 122]].forEach(function (c, n) {
      for (var a = 0; a < 6; a++) {
        var ang = a * Math.PI / 3 + n, ox = Math.round(c[0] + Math.cos(ang) * 6) - 1, oy = Math.round(c[1] + Math.sin(ang) * 6) - 5;
        if (noOvo(ox, oy + 3) && noOvo(ox + 3, oy + 6) && !fitaV(ox, oy + 3) && !fitaV(ox + 3, oy + 6) && !fitaH(ox, oy + 6) && !fitaH(ox, oy + 3)) escrever(ctx, 'o', ox, oy, K);
      }
    });
    [[24, 82], [96, 86], [28, 108]].forEach(function (p) { if (!fitaH(p[0], p[1] + 3) && !fitaV(p[0] + 12, p[1])) escrever(ctx, 'ovo', p[0], p[1], K); });
    escrever(ctx, 'de páscoa', 84, 136, K, { escala: 2 });
  } });

  /* ---------- o que é mãe (p. 62): o ponto de interrogação gigante cheio de "mãe" e o ponto com coração ---------- */
  Reino.registrarIlustracao('lp-12-mae', { w: 100, h: 136, desenhar: function (ctx, D) {
    papel(ctx, 100, 136);
    var MARROM = '#5a3424', CX = 50, CY = 50;
    // o gancho (anel sem o pedaço de baixo à esquerda), a curva que desce e a haste
    function noSinal(x, y) {
      var dx = x - CX, dy = y - CY, d = Math.sqrt(dx * dx + dy * dy);
      if (d >= 14 && d <= 33 && !(dy > -2 && dx < 6) && !(dy > 14)) return true;
      var ex = x - 52, ey = y - 76;
      if (ex * ex + ey * ey <= 13 * 13 && y < 90) return true;
      return x >= 40 && x <= 62 && y >= 76 && y <= 102;
    }
    for (var y = 0; y < 136; y++) for (var x = 0; x < 100; x++) if (noSinal(x, y)) { ctx.fillStyle = MARROM; ctx.fillRect(x, y, 1, 1); }
    var cabe = function (x0, y0, x1, y1) { return noSinal(x0, y0 + 2) && noSinal(x1 - 1, y0 + 2) && noSinal(x0, y1 - 3) && noSinal(x1 - 1, y1 - 3); };
    for (var i = 0; i < 9; i++) {
      var linha = 'mãe mãe mãe mãe mãe mãe ', yy = 17 + i * 9;
      if (i % 2) escrever(ctx, linha, 98 - (i * 5) % 12, yy + 9, BRANCO, { rot: 180, dentro: cabe });
      else escrever(ctx, linha, 14 - (i * 7) % 16, yy, BRANCO, { dentro: cabe });
    }
    // o ponto: uma flor de 6 pontas com um coração branco vazado no meio
    var px = 51, py = 120;
    for (var a = 0; a < 6; a++) D.circulo(ctx, Math.round(px + Math.cos(a * Math.PI / 3) * 8), Math.round(py + Math.sin(a * Math.PI / 3) * 8), 4, MARROM);
    D.circulo(ctx, px, py, 9, MARROM);
    D.matriz(ctx, px - 3, py - 3, ['.ww.ww.', 'w..w..w', 'w.....w', '.w...w.', '..w.w..', '...w...'], { w: BRANCO });
    escrever(ctx, 'o que é mãe', 2, 0, K, { escala: 2 });
  } });

  // pingos em forma de gota: a ponta para cima e as outras 3 viradas
  var GOTA = ['..k..', '.kkk.', 'kkkkk', 'kkkkk', '.kkk.'];
  var PINGOS = [GOTA, GOTA.slice().reverse(), GOTA.map(function (_, i) { return GOTA.map(function (l) { return l.charAt(i); }).join(''); })];
  PINGOS.push(PINGOS[2].map(function (l) { return l.split('').reverse().join(''); }));
  /* ---------- relâmpago (p. 67): o título no meio dos pingos (as "manchas" do cachorro) ---------- */
  Reino.registrarIlustracao('lp-12-relampago', { w: 152, h: 44, desenhar: function (ctx, D) {
    papel(ctx, 152, 44);
    var sorte = D.rng(67), larg = largura('relâmpago') * 2, tx = 76 - (larg >> 1);
    for (var n = 0; n < 40; n++) {
      var x = Math.floor(sorte() * 146) + 3, y = Math.floor(sorte() * 38) + 3, dir = Math.floor(sorte() * 4);
      if (x > tx - 8 && x < tx + larg + 4 && y > 6 && y < 36) continue;
      D.matriz(ctx, x - 2, y - 2, PINGOS[dir], { k: K });
    }
    escrever(ctx, 'relâmpago', tx, 6, K, { escala: 2 });
  } });

  /* ---------- a primavera endoideceu (p. 78): flor de 5 pétalas, cada uma com "bem me quer mal me quer" em linhas
     retas (letras sempre em pé, na ordem de leitura), o miolo com a palavra "zum" em espiral (palavra por palavra) e a
     abelhinha no meio, a frase reta logo acima do miolo e o caule, embaixo do miolo, com as duas linhas lidas de baixo
     para cima ---------- */
  var CAULE = ['nos meus olhos zumbiam mil abelhas', 'e me fitavas detrás da cerca dos cílios'];
  var PETALA = ['bem me', 'quer mal', 'me quer'];
  // pétalas: [ângulo (graus), distância do centro do miolo] — para cima (um pouco à esquerda), para cima à direita,
  // para a direita e para baixo, para baixo e à esquerda (ao lado do caule) e para a esquerda
  var PETALAS = [[100, 53], [32, 50], [-30, 50], [-135, 50], [180, 50]];
  var FLOR = { cx: 84, cy: 124, miolo: 30, w: 152 };
  FLOR.h = FLOR.cy + FLOR.miolo + 1 + Math.max(largura(CAULE[0]), largura(CAULE[1])) + 2;
  function desenharFlor(ctx) {
    var CX = FLOR.cx, CY = FLOR.cy, W = FLOR.w, H = FLOR.h, R0 = FLOR.miolo;
    var ROSA = '#b02a62', OURO = '#8a5200', VERDE = '#2f7d34', MIOLO = '#fff0b3', TINTA_PETALA = '#fde3ee';
    var centros = PETALAS.map(function (p) {
      var ang = p[0] * Math.PI / 180;
      return { x: Math.round(CX + Math.cos(ang) * p[1]), y: Math.round(CY - Math.sin(ang) * p[1]), ang: ang };
    });
    papel(ctx, W, H);
    // as cores de fundo da flor (pétalas, miolo e caule), por baixo das palavras
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var dx = x - CX, dy = y - CY, cor = null;
      if (dx * dx + dy * dy <= R0 * R0) cor = MIOLO;
      else if (x >= CX - 11 && x <= CX + 9 && y > CY) cor = '#e1f3dc';
      else if (centros.some(function (c) {
        var ex = x - c.x, ey = y - c.y, u = ex * Math.cos(c.ang) - ey * Math.sin(c.ang), v = ex * Math.sin(c.ang) + ey * Math.cos(c.ang);
        return (u * u) / (26 * 26) + (v * v) / (21 * 21) <= 1;
      })) cor = TINTA_PETALA;
      if (cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, 1, 1); }
    }
    // caule: duas linhas de texto giradas, de baixo para cima, começando embaixo do miolo
    escrever(ctx, CAULE[0], CX - 10, H - 2, VERDE, { rot: -90 });
    escrever(ctx, CAULE[1], CX, H - 2, VERDE, { rot: -90 });
    // pétalas: "bem me / quer mal / me quer", três linhas retas no meio de cada pétala
    centros.forEach(function (c) {
      PETALA.forEach(function (l, i) { escrever(ctx, l, c.x - (largura(l) >> 1), c.y - 13 + i * 9, ROSA); });
    });
    // miolo: a palavra "zum" inteira, em pé: uma volta de espiral de fora para dentro (8 vezes) e mais 2 perto da
    // abelhinha, em cima e embaixo dela (palavras em pé não se encostam numa volta só)
    for (var k = 0; k < 8; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 4, r = 24 - k * 1.2;
      escrever(ctx, 'zum', Math.round(CX + Math.cos(a) * r - 6.5), Math.round(CY + Math.sin(a) * r - 4.5), OURO, { fundo: MIOLO });
    }
    escrever(ctx, 'zum', CX - 2, CY - 14, OURO, { fundo: MIOLO });
    escrever(ctx, 'zum', CX - 9, CY + 2, OURO, { fundo: MIOLO });
    ctx.fillStyle = '#ffd34d'; ctx.fillRect(CX - 2, CY - 1, 5, 3); ctx.fillStyle = K; ctx.fillRect(CX - 1, CY - 1, 1, 3); ctx.fillRect(CX + 1, CY - 1, 1, 3);
    ctx.fillStyle = BRANCO; ctx.fillRect(CX - 1, CY - 3, 2, 2);
    escrever(ctx, 'a primavera endoideceu', 24, CY - R0 - 9, K, { fundo: PAPEL });
    escrever(ctx, 'a primavera', 3, 2, K, { escala: 2 });
    escrever(ctx, 'endoideceu', 3, 2 + 18, K, { escala: 2 });
  }
  Reino.registrarIlustracao('lp-12-primavera', { w: FLOR.w, h: FLOR.h, desenhar: desenharFlor });
  // só a flor (pétalas, miolo e o começo do caule), para as questões: cabe em 2× no celular
  Reino.registrarIlustracao('lp-12-primavera-miolo', { w: FLOR.w, h: 142, desenhar: function (ctx) {
    ctx.save(); ctx.translate(0, -44); desenharFlor(ctx); ctx.restore();
  } });

  /* ---------- Falta de sorte (Atividades p. 13): o "c a i" caindo e um boneco correndo, feito de palavras ---------- */
  Reino.registrarIlustracao('lp-12-falta-de-sorte', { w: 152, h: 150, desenhar: function (ctx, D) {
    papel(ctx, 152, 150);
    escrever(ctx, 'Falta de sorte', 4, 0, K, { escala: 2 });
    escrever(ctx, 'Hoje estou sem sorte', 4, 20, K);
    var x = 4 + escrever(ctx, 'Tudo me ', 4, 32, K) + 1;
    escrever(ctx, 'c', x, 32, K); escrever(ctx, 'a', x + 6, 37, K); escrever(ctx, 'i', x + 12, 42, K);
    escrever(ctx, 'da mão', x + 19, 32, K);
    D.circulo(ctx, 76, 59, 11, '#f05a3a');
    // tronco: "Para" e "não" na vertical, lado a lado, letra embaixo de letra
    escrever(ctx, 'Para', 71, 72, K, { passo: [0, 9] });
    escrever(ctx, 'não', 78, 72, K, { passo: [0, 9] });
    // braços (descendo para os lados) e pernas
    escrever(ctx, 'perder', 39, 96, K, { passo: [5, -4] });
    escrever(ctx, 'a cabeça', 85, 76, K, { passo: [5, 4] });
    escrever(ctx, 'vou fugir', 28, 140, K, { passo: [5, -4] });
    escrever(ctx, 'para o Japão.', 82, 104, K, { passo: [4, 3] });
  } });

  /* ---------- Pontinho de vista (p. 57): o poema e o esquema do livro, com as etiquetas VERSOS (traços até cada
     verso), ESTROFE (chave que abraça o poema) e RIMAS (as palavras que rimam com fundo verde) ---------- */
  var PONTINHO = ['Eu sou pequeno, me dizem,', 'e eu fico muito zangado.', 'Tenho de olhar todo mundo', 'com o queixo levantado.',
    'Mas se formiga falasse,', 'e me visse lá do chão,', 'ia dizer, com certeza:', '"Minha nossa, que grandão!"'];
  var RIMAS = [[1, 'e eu fico muito ', 'zangado'], [3, 'com o queixo ', 'levantado'], [5, 'e me visse lá do ', 'chão'], [7, '"Minha nossa, que ', 'grandão']];
  var VERDE_RIMA = '#c6efbf', LILAS = '#8e4fd6';
  function pontinho(ctx, x0, esquema) {
    escrever(ctx, 'Pontinho de vista', x0, 2, K);
    if (esquema) RIMAS.forEach(function (r) {
      var x = x0 + largura(r[1]) + 1, y = 14 + r[0] * 10;
      ctx.fillStyle = VERDE_RIMA; ctx.fillRect(x - 1, y, largura(r[2]) + 2, 9);
    });
    PONTINHO.forEach(function (v, i) { escrever(ctx, v, x0, 14 + i * 10, K); });
  }
  Reino.registrarIlustracao('lp-12-pontinho', { w: 110, h: 96, desenhar: function (ctx) {
    papel(ctx, 110, 96);
    pontinho(ctx, 4, false);
  } });
  Reino.registrarIlustracao('lp-12-pontinho-esquema', { w: 150, h: 110, desenhar: function (ctx) {
    papel(ctx, 150, 110);
    var X0 = 31, DIR = X0 + 101;
    pontinho(ctx, X0, true);
    function ret(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
    // VERSOS: um traço até cada verso
    escrever(ctx, 'VERSOS', 1, 48, LILAS);
    ret(24, 52, 3, 1, LILAS); ret(27, 18, 1, 71, LILAS);
    for (var i = 0; i < 8; i++) ret(27, 18 + i * 10, 3, 1, LILAS);
    // ESTROFE: a chave que abraça o poema inteiro
    ret(DIR + 1, 14, 2, 1, LILAS); ret(DIR + 2, 14, 1, 80, LILAS); ret(DIR + 1, 93, 2, 1, LILAS); ret(DIR + 3, 53, 2, 1, LILAS);
    escrever(ctx, 'ESTROFE', DIR + 6, 54 + (largura('ESTROFE') >> 1), LILAS, { rot: -90 });
    // RIMAS: embaixo, com o mesmo fundo verde das palavras que rimam
    ret(X0 + 30, 97, largura('RIMAS') + 4, 11, VERDE_RIMA);
    escrever(ctx, 'RIMAS', X0 + 32, 98, LILAS);
  } });

  /* ---------- a lousa das letras (p. 71) ---------- */
  Reino.registrarIlustracao('lp-12-lousa', { w: 84, h: 76, desenhar: function (ctx, D) {
    D.ret(ctx, 0, 0, 84, 76, K); D.ret(ctx, 1, 1, 82, 74, '#a0745a'); D.ret(ctx, 4, 4, 76, 68, K); D.ret(ctx, 5, 5, 74, 66, '#2f6b4f');
    var GIZ = '#f4fff4';
    ['MAIÚSCULAS', 'ABCDEFGHIJKLMNO', 'PQRSTUVWXYZ', 'minúsculas', 'abcdefghijklmno', 'pqrstuvwxyz'].forEach(function (t, i) {
      escrever(ctx, t, 42 - (largura(t) >> 1), 7 + i * 10 + (i > 2 ? 2 : 0), i % 3 ? GIZ : '#ffe680');
    });
  } });
})();
