/* Parquinho, parte 3: os brinquedos da fase 2 (carrossel, pula-pula e tanque de bolinhas), que antes de ela completar
   todas as matérias são presentes embrulhados (P.presente, objetos.js; a `chave` muda com a fase), e os enfeites do
   parque (poste, lixeira, placa, bola, amarelinha, canteiro). Medidas que as poses usam em P.GEO.
   Divide Reino._predios.parquinho (P). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse, circulo = D.circulo, matriz = D.matriz;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = R._predios.parquinho, GEO = P.GEO;
  function fase() { try { return R.Parquinho ? R.Parquinho.fase() : 0; } catch (e) { return 0; } }
  function emUso(id) { var b = R.ParquinhoBrincar; return !!(b && b.emUso(id)); }
  function chave(id) { return function () { return 'f' + (fase() >= 2 ? 2 : 0) + (emUso(id) ? 'uso' : ''); }; }
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(58,36,70,0.2)'); }

  /* ---------- carrossel (4 × 3): plataforma redonda, mastro, telhado listrado e quatro cavalinhos ---------- */
  GEO.carrossel = { cx: 32, cy: 35, rx: 20, ry: 5, chao: 38, teto: -12 };
  var CAVALO = ['........kk....', '.......kcwk...', '......kcwwwk..', '.....kcwwewk..', '.kkkkcwwwwkk..', 'kwwwwwwwwk....',
    'kcwwwwwwwk....', 'kcwwwwwwk.....', '.kwwwwwwk.....', '.kwkkkkwk.....', '.kwk..kwk.....', '.kk....kk.....'];
  var CORES_CAVALO = ['#ff9ec8', '#b5e6ff', '#fff1a0', '#c9b0f0'];
  // um cavalinho de pé em (x, y = pés), olhando para dir (1) ou esq (-1), com a haste dourada até o teto
  P.cavalinho = function (ctx, x, y, n, dir, teto) {
    ret(ctx, x, teto, 1, y - teto - 6, '#e0a020'); ret(ctx, x - 1, teto, 1, y - teto - 6, '#ffd34d');
    var linhas = dir > 0 ? CAVALO : CAVALO.map(function (l) { return l.split('').reverse().join(''); });
    matriz(ctx, x - 7, y - 12, linhas, { k: K, w: CORES_CAVALO[n % 4], e: K, c: '#ff7eb6' });
  };
  // os cavalinhos girando: ang em voltas (0 a 1); fn(i, x, y) é chamado para cada um, de trás para frente
  P.giro = function (px, py, ang, fn) {
    var g = GEO.carrossel, lista = [];
    for (var i = 0; i < 4; i++) {
      var a = (ang + i / 4) * Math.PI * 2;
      lista.push({ i: i, x: px + g.cx + Math.round(Math.cos(a) * g.rx), y: py + g.cy + Math.round(Math.sin(a) * g.ry), dir: Math.sin(a) >= 0 ? -1 : 1 });
    }
    lista.sort(function (a, b) { return a.y - b.y; }).forEach(function (c) { fn(c.i, c.x, c.y, c.dir); });
  };
  P.mastro = function (ctx, px, py) { var g = GEO.carrossel; P.caixa(ctx, px + g.cx - 2, py + g.teto, 5, g.chao - g.teto - 4, '#ffd34d'); ret(ctx, px + g.cx - 1, py + g.teto + 1, 1, g.chao - g.teto - 6, '#fff1a0'); };
  I.objeto('parquinho-carrossel', { w: 4, h: 3, solido: true, alto: true, topo: 34,
    chave: chave('carrossel'),
    desenhar: function (ctx, px, py) {
      if (fase() < 2) { P.presente(ctx, px, py, 64, 48, ['#ff7eb6', '#ff9ec8', '#ffd34d']); return; }
      var g = GEO.carrossel, i;
      sombra(ctx, px + 32, py + 44, 30);
      elipse(ctx, px + 32, py + g.chao, 31, 9, K); elipse(ctx, px + 32, py + g.chao, 30, 8, '#a66bff');   // a plataforma
      elipse(ctx, px + 32, py + g.chao - 2, 30, 7, K); elipse(ctx, px + 32, py + g.chao - 2, 29, 6, '#fff1d0');
      for (i = 0; i < 8; i++) ret(ctx, px + 6 + i * 7, py + g.chao + 4, 3, 2, '#ffd34d');                     // luzinhas na borda
      var desenharCavalo = function (n, x, y, dir) { P.cavalinho(ctx, x, y, n, dir, py + g.teto); };
      if (!emUso('carrossel')) P.giro(px, py, 0.08, function (n, x, y, dir) { if (y < py + g.cy) desenharCavalo(n, x, y, dir); });
      P.mastro(ctx, px, py);
      if (!emUso('carrossel')) P.giro(px, py, 0.08, function (n, x, y, dir) { if (y >= py + g.cy) desenharCavalo(n, x, y, dir); });
      // o telhado: cone listrado de vermelho e branco, com a barra de babados e a bandeirinha
      for (var j = 0; j < 20; j++) {
        var meia = Math.round(4 + j * 1.45), y = py - 32 + j;
        ret(ctx, px + 32 - meia - 1, y, meia * 2 + 3, 1, K);
        for (var x = -meia; x <= meia; x++) ret(ctx, px + 32 + x, y, 1, 1, Math.floor((x + 40) / 5) % 2 ? '#ff5c6a' : '#ffffff');
      }
      for (i = 0; i < 9; i++) { elipse(ctx, px + 4 + i * 7, py - 12, 4, 3, K); elipse(ctx, px + 4 + i * 7, py - 12, 3, 2, i % 2 ? '#ffd34d' : '#5fb4ff'); }
      ret(ctx, px + 32, py - 40, 1, 9, K); ret(ctx, px + 33, py - 40, 6, 4, K); ret(ctx, px + 33, py - 39, 5, 2, '#ffd34d');
    } });

  /* ---------- pula-pula (3 × 2): cama elástica redonda com a borda acolchoada ---------- */
  GEO.pulapula = { cx: 24, cy: 16, ela: 16, uni: 32 };
  I.objeto('parquinho-pulapula', { w: 3, h: 2, solido: true, alto: true, topo: 6,
    chave: chave('pulapula'),
    desenhar: function (ctx, px, py) {
      if (fase() < 2) { P.presente(ctx, px, py, 48, 32, ['#5fb4ff', '#8fcaff', '#ff7eb6']); return; }
      var g = GEO.pulapula, x0 = px + g.cx, y0 = py + g.cy;
      sombra(ctx, x0, py + 30, 22);
      [-17, -6, 6, 17].forEach(function (dx) { P.caixa(ctx, x0 + dx - 1, y0 + 4, 3, 10, '#8e9ab4'); });   // as pernas
      elipse(ctx, x0, y0, 23, 10, K); elipse(ctx, x0, y0, 22, 9, '#ffd34d');                                 // a borda
      for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; ret(ctx, x0 + Math.round(Math.cos(a) * 19) - 1, y0 + Math.round(Math.sin(a) * 8), 3, 1, '#ff9f45'); }
      elipse(ctx, x0, y0, 17, 6, K); elipse(ctx, x0, y0, 16, 5, '#2b3a7a'); elipse(ctx, x0 - 3, y0 - 1, 8, 2, '#3f55a8');   // a lona
      ret(ctx, x0 - 14, y0 - 7, 6, 1, '#fff1a0');
    } });

  /* ---------- tanque de bolinhas (3 × 2): caixa acolchoada cheia de bolinhas coloridas ---------- */
  GEO.bolinhas = { topo: 9, superficie: 15, ela: 15, uni: 32 };
  var BOLAS = ['#ff5c6a', '#ffe066', '#5fb4ff', '#6fdc8c', '#ff9f45', '#ff7eb6', '#a66bff'];
  // bolinhas de 3 px em (x, y), cor pela posição (sempre as mesmas)
  P.bolas = function (ctx, x0, y0, w, h, semente) {
    for (var y = 0; y < h; y += 3) for (var x = (y / 3) % 2 ? 1 : 0; x < w - 2; x += 4) {
      var c = BOLAS[Math.floor(sorte(x, y, semente) * BOLAS.length)];
      ret(ctx, x0 + x, y0 + y + 1, 3, 1, c); ret(ctx, x0 + x + 1, y0 + y, 1, 3, c); ret(ctx, x0 + x, y0 + y, 1, 1, '#ffffff');
    }
  };
  P.paredeBolinhas = function (ctx, px, py) {                    // a parede da frente (o que fica na frente de quem está dentro)
    P.caixa(ctx, px + 1, py + 20, 46, 11, '#5fb4ff'); ret(ctx, px + 2, py + 21, 44, 1, '#bfe9ff');
    for (var i = 0; i < 5; i++) ret(ctx, px + 5 + i * 9, py + 24, 4, 4, ['#ff5c6a', '#ffe066', '#6fdc8c', '#ff7eb6', '#a66bff'][i]);
  };
  I.objeto('parquinho-bolinhas', { w: 3, h: 2, solido: true, alto: true, topo: 4,
    chave: chave('bolinhas'),
    desenhar: function (ctx, px, py) {
      if (fase() < 2) { P.presente(ctx, px, py, 48, 32, ['#6fdc8c', '#a6ecb8', '#ff5c6a']); return; }
      sombra(ctx, px + 24, py + 30, 23);
      P.caixa(ctx, px + 1, py + 3, 46, 20, '#ff7eb6'); ret(ctx, px + 2, py + 4, 44, 1, '#ffd1e6');      // a parede de trás
      P.bolas(ctx, px + 4, py + 7, 40, 14, 3);
      P.paredeBolinhas(ctx, px, py);
    } });

  /* ---------- enfeites ---------- */
  I.objeto('parquinho-poste', { w: 1, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      P.caixa(ctx, px + 5, py + 11, 7, 4, '#3f8f45');
      P.caixa(ctx, px + 7, py - 18, 3, 30, '#55ad55');
      P.caixa(ctx, px + 3, py - 26, 11, 9, '#3f8f45'); ret(ctx, px + 4, py - 24, 9, 5, '#fff1a0'); ret(ctx, px + 5, py - 23, 2, 2, '#ffffff');
    } });
  I.objeto('parquinho-lixeira', { w: 1, h: 1, solido: true, alto: true, topo: 2,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      P.caixa(ctx, px + 3, py + 2, 11, 12, '#6fdc8c'); ret(ctx, px + 4, py + 3, 1, 10, '#b4f5b8');
      ret(ctx, px + 6, py + 5, 1, 7, '#3f8f45'); ret(ctx, px + 10, py + 5, 1, 7, '#3f8f45');
      P.caixa(ctx, px + 2, py - 1, 13, 4, '#3f8f45');
    } });
  // a placa do parque: tábua com um arco-íris pintado
  I.objeto('parquinho-placa', { w: 1, h: 1, solido: true, alto: true, topo: 14,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      P.caixa(ctx, px + 7, py - 2, 3, 16, '#a8682e');
      P.caixa(ctx, px, py - 14, 17, 13, '#e0a868'); ret(ctx, px + 1, py - 13, 15, 1, '#f6cf94');
      ['#ff5c6a', '#ffe066', '#6fdc8c', '#5fb4ff'].forEach(function (c, i) { elipse(ctx, px + 8, py - 3, 6 - i, 6 - i, c); });
      ret(ctx, px + 1, py - 3, 15, 2, '#e0a868'); ret(ctx, px + 1, py - 2, 15, 1, K);
    } });
  I.objeto('parquinho-bola', { w: 1, h: 1, solido: false,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 5, 1, 'rgba(58,36,70,0.2)');
      circulo(ctx, px + 8, py + 9, 5, K); circulo(ctx, px + 8, py + 9, 4, '#ffffff');
      ret(ctx, px + 4, py + 8, 9, 2, '#ff5c6a'); ret(ctx, px + 7, py + 5, 2, 9, '#5fb4ff'); ret(ctx, px + 6, py + 6, 1, 1, '#ffffff');
    } });
  // amarelinha riscada de giz no chão (1 × 3): casas de baixo para cima, as duplas no meio
  I.objeto('parquinho-amarelinha', { w: 1, h: 3, solido: false,
    desenhar: function (ctx, px, py) {
      var G = '#ffffff';
      [[3, 34, 10, 12], [3, 22, 10, 12], [-3, 10, 10, 12], [9, 10, 10, 12], [3, -2, 10, 12]].forEach(function (c) {
        ret(ctx, px + c[0], py + c[1] + 10, c[2], 1, G); ret(ctx, px + c[0], py + c[1] + 10 + c[3] - 1, c[2], 1, G);
        ret(ctx, px + c[0], py + c[1] + 10, 1, c[3], G); ret(ctx, px + c[0] + c[2] - 1, py + c[1] + 10, 1, c[3], G);
      });
      ret(ctx, px + 7, py + 39, 2, 2, '#ffe066'); ret(ctx, px + 7, py + 27, 2, 2, '#ff9ec8'); ret(ctx, px + 7, py + 3, 2, 2, '#bfe9ff');
    } });
  I.objeto('parquinho-canteiro', { w: 2, h: 1, solido: true, alto: true, topo: 8,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      P.caixa(ctx, px + 1, py + 6, 30, 9, '#c98a4a'); ret(ctx, px + 2, py + 7, 28, 1, '#e0a868');
      for (var i = 0; i < 6; i++) {
        var x = px + 4 + i * 5, c = ['#ff5c6a', '#ffe066', '#ff7eb6', '#a66bff'][i % 4];
        ret(ctx, x + 1, py - 1, 1, 8, '#3f8f45'); ret(ctx, x + 2, py + 2, 2, 1, '#55ad55');
        P.caixa(ctx, x - 1, py - 5, 5, 5, c); ret(ctx, x, py - 4, 1, 1, '#ffffff');
      }
    } });
})();
