/* Bosque da Lua Cheia, o chão, as copas e o céu aberto (docs/contratos/arenas.md §8): o piso 'lua-lua' (a grama
   azul da noite cheia de brilhos prateados, com a trilha de terra azulada por onde ela anda), a parede 'lua-copas'
   (as copas azuis-escuras lá no fundo, com as folhas prateadas) e o fundo I.FUNDOS.lua (a mata azul-noite em volta,
   a lua cheia grande e as estrelas no alto).
   As trilhas ficam em Reino._predios.lua (P.trilha, em lua.js), para o layout não pôr nada sólido em cima delas.
   Os objetos-assinatura da floresta (a árvore-da-lua, o cristal-da-lua e o cogumelo-lua) estão no fim deste arquivo.
   No carregamento só registra funções: nada de DOM nem canvas aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).lua = R._predios.lua || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }   // 0 sem Animações: o desenho fica parado

  /* ---------- as copas da mata: folhagem em bolas azul-noite, com as folhas prateadas na luz da lua ---------- */
  var COPAS = ['#1b2752', '#26366a', '#34487f'];   // [escuro, médio, claro]
  var PRATA = '#b8c8e8';
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, COPAS[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 1) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 2) - 0.5) * 6);
      circulo(ctx, bx, by, 8, COPAS[0]); circulo(ctx, bx - 1, by - 1, 6, COPAS[1]); circulo(ctx, bx - 2, by - 2, 3, COPAS[2]);
      if (sorte(cc, cr, 3) < 0.22) { ret(ctx, bx - 2, by - 5, 2, 1, PRATA); ret(ctx, bx - 1, by - 6, 1, 1, '#e8f0ff'); }   // folha prateada
    }
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- o piso: a grama azul da noite, com os brilhos prateados e a trilha de terra azulada ---------- */
  I.PISOS['lua-lua'] = { cores: { piso: '#627aac', piso2: '#5f76a8', detalhe: '#55699c', luz: '#9fb4dc' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        var cima = P.trilha(tx, ty - 1), baixo = P.trilha(tx, ty + 1), esq = P.trilha(tx - 1, ty), dir = P.trilha(tx + 1, ty);
        ret(ctx, px, py, 16, 16, '#8a93b8');
        ret(ctx, px + 2, py + 3, 5, 3, '#9aa4c6'); ret(ctx, px + 8, py + 9, 6, 3, '#7c86ae');
        for (i = 0; i < 3; i++) ret(ctx, px + Math.floor(sorte(tx, ty, 30 + i) * 14), py + Math.floor(sorte(tx, ty, 40 + i) * 14), 2, 1, '#6f7ba0');
        if (!cima) { ret(ctx, px, py, 16, 2, p.piso2); ret(ctx, px + 3, py + 2, 5, 1, '#9aa4c6'); ret(ctx, px + 10, py + 2, 3, 1, '#6f7ba0'); }
        if (!baixo) { ret(ctx, px, py + 14, 16, 2, p.piso2); ret(ctx, px + 5, py + 13, 5, 1, '#6f7ba0'); }
        if (!esq) { ret(ctx, px, py, 2, 16, p.piso2); ret(ctx, px + 2, py + 5, 1, 4, '#6f7ba0'); }
        if (!dir) { ret(ctx, px + 14, py, 2, 16, p.piso2); ret(ctx, px + 13, py + 7, 1, 4, '#6f7ba0'); }
        return;
      }
      // manchas de grama (sem xadrez) e as lâminas escuras
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 1, py + 8 + Math.floor(sorte(tx, ty, 4) * 4), 9, 4, p.piso2);
      if (sorte(tx, ty, 5) < 0.28) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 5, 4, 3, '#6b81b0');
      for (i = 0; i < 3; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 4 + Math.floor(sorte(tx, ty, 20 + i) * 10);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe); ret(ctx, gx + 2, gy - 1, 1, 2, p.detalhe);
      }
      // os brilhos prateados da lua na grama: pontinhos e uma estrelinha de vez em quando
      if (sorte(tx, ty, 50) < 0.28) {
        var sx = px + 2 + Math.floor(sorte(tx, ty, 51) * 11), sy = py + 2 + Math.floor(sorte(tx, ty, 52) * 11);
        ret(ctx, sx, sy, 1, 1, p.luz);
        if (sorte(tx, ty, 53) < 0.4) { ret(ctx, sx - 1, sy, 3, 1, '#c8d4ee'); ret(ctx, sx, sy - 1, 1, 3, '#c8d4ee'); }
      }
    } };

  /* ---------- a parede: as copas azuis lá no fundo, os troncos e as folhas prateadas ---------- */
  I.PAREDES['lua-copas'] = { cores: { parede: '#1b2752', parede2: '#26366a', rodape: '#141d3c', detalhe: '#34487f' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 22, 3, 8, '#2a3358'); ret(ctx, px + t, py + 22, 1, 8, '#41507e');
      ret(ctx, px, py + 29, 16, 3, '#141d3c');
      if (sorte(tx, 0, 61) < 0.3) { ret(ctx, px + 4 + Math.floor(sorte(tx, 0, 62) * 8), py + 4, 1, 1, '#e8f0ff'); ret(ctx, px + 3, py + 5, 3, 1, '#b8c8e8'); }
    } };

  /* ---------- o céu aberto: a mata azul-noite em volta, as estrelas e a lua cheia grande no alto ----------
     Só a fileira de cima do vão (16 px) fica à vista: é lá que moram a lua e as estrelas; o resto são as copas. */
  var NOITE = ['#121a38', '#1a2448', '#233058'];
  function luaCheia(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r + 3, '#2a3a68');
    circulo(ctx, cx, cy, r + 1, '#8fa4d0');
    circulo(ctx, cx, cy, r, '#f6f2d8');
    circulo(ctx, cx - 3, cy - 2, 2, '#e6dcba'); circulo(ctx, cx + 3, cy + 2, 1, '#e6dcba'); circulo(ctx, cx + 1, cy - 3, 1, '#e6dcba');
    ret(ctx, cx - 4, cy - 4, 3, 1, '#fffef2');
  }
  function estrelas(ctx, w) {
    for (var i = 0; i < 16; i++) {
      var x = Math.floor(sorte(i, 3, 7) * w), y = 2 + Math.floor(sorte(i, 4, 8) * 11);
      if (Math.abs(x - w / 2) < 22) continue;   // a lua tem o lugar dela
      if (i % 5 === 0) { ret(ctx, x, y, 3, 1, '#c8d4ee'); ret(ctx, x + 1, y - 1, 1, 3, '#e8f0ff'); }
      else ret(ctx, x, y, 1, 1, i % 3 ? '#c8d4ee' : '#e8f0ff');
    }
  }
  I.FUNDOS.lua = { cor: NOITE[0],
    desenhar: function (ctx, w, h) {
      ret(ctx, 0, 0, w, h, NOITE[0]);
      ret(ctx, 0, 0, w, 3, NOITE[1]);   // o degradê do céu, na faixa de cima
      estrelas(ctx, w);
      luaCheia(ctx, Math.round(w / 2), 8, 7);
      copas(ctx, 0, 16, w, h - 16);   // a mata em volta, a partir da fileira de cima
    } };

  /* ---------- os objetos-assinatura (prefixo lua-) ---------- */
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(20,28,60,0.32)'); }
  // folhagem da árvore-da-lua: [escuro, médio, claro]; o terceiro tom é o prateado
  var ARVORE = ['#26366a', '#3a5090', '#8fa4d0'];
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  function tronco(ctx, x, y, w, h) {
    ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, '#3a4a7a'); ret(ctx, x, y, 2, h, '#55689c'); ret(ctx, x + w - 2, y, 2, h, '#26325c');
  }
  // a árvore-da-lua: tronco azul-escuro e a copa de folhas prateadas, com estrelinhas entre elas
  I.objeto('luacheia-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 6, 8, 20);
      ret(ctx, px + 9, py + 11, 4, 3, K); ret(ctx, px + 20, py + 11, 4, 3, K); ret(ctx, px + 10, py + 11, 2, 2, '#55689c');
      folhagem(ctx, px, py, [[16, -26, 12], [7, -17, 9], [25, -17, 9], [16, -11, 10]], ARVORE);
      // a luz da lua nas pontas: folhinhas prateadas e uma estrelinha
      ret(ctx, px + 9, py - 34, 2, 1, '#e8f0ff'); ret(ctx, px + 22, py - 30, 2, 1, '#c8d4ee'); ret(ctx, px + 16, py - 38, 1, 1, '#ffffff');
      ret(ctx, px + 13, py - 20, 1, 1, '#fffef2'); ret(ctx, px + 26, py - 12, 1, 1, '#c8d4ee');
    } });

  // o cristal-da-lua: três pontas de quartzo azul que brilham (um halo parado e os brilhinhos no `anim`)
  var CRISTAL = ['#7f9cd8', '#b8d4f8', '#eef6ff'];
  I.objeto('luacheia-cristal', { w: 1, h: 1, solido: true, topo: 10,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 6, 2, 'rgba(20,28,60,0.32)');
      elipse(ctx, px + 8, py + 7, 13, 10, 'rgba(184,212,248,0.16)');
      elipse(ctx, px + 8, py + 8, 9, 7, 'rgba(238,246,255,0.14)');
      [[2, 5, 4, 10], [7, -2, 4, 17], [11, 6, 3, 8]].forEach(function (c) {   // as três pontas
        ret(ctx, px + c[0] - 1, py + c[1] + 1, c[2] + 2, c[3], K);
        ret(ctx, px + c[0], py + c[1], c[2], 1, K);
        ret(ctx, px + c[0], py + c[1] + 1, c[2], c[3] - 1, CRISTAL[0]);
        ret(ctx, px + c[0], py + c[1] + 1, 1, c[3] - 2, CRISTAL[1]);
        ret(ctx, px + c[0] + 1, py + c[1] + 1, 1, Math.max(1, c[3] - 4), CRISTAL[2]);
      });
      ret(ctx, px + 1, py + 13, 14, 2, '#2a3358');   // o chão de pedrinhas
      ret(ctx, px + 3, py + 12, 3, 1, CRISTAL[1]); ret(ctx, px + 10, py + 12, 2, 1, CRISTAL[2]);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 420) % 4 : 0;
      if (f === 0) { ret(ctx, px + 2, py + 1, 2, 1, '#eef6ff'); ret(ctx, px + 3, py, 1, 3, '#eef6ff'); }
      if (f === 2) { ret(ctx, px + 12, py + 2, 1, 1, '#ffffff'); ret(ctx, px + 9, py - 4, 1, 1, '#b8d4f8'); }
    } });

  // o cogumelo-lua: chapéu prateado que brilha no escuro, com um halo azul (enfeite plano: ela passa por cima)
  var CHAPEU = ['#8fa4d0', '#c8d4ee', '#eef6ff'];
  function cogumelo(ctx, cx, base, r, i) {
    ret(ctx, cx - 1, base - r - 1, 3, r + 2, K); ret(ctx, cx, base - r, 1, r + 1, '#d8e0f0');
    elipse(ctx, cx, base - r - 1, r + 1, r, K); elipse(ctx, cx, base - r - 1, r, r - 1, CHAPEU[i % 3]);
    ret(ctx, cx - 1, base - r - 2, 2, 1, CHAPEU[2]); ret(ctx, cx + 1, base - r - 1, 1, 1, CHAPEU[2]);
  }
  I.objeto('luacheia-cogumelo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var i = (o && o.var && o.var.n) || 0;
      elipse(ctx, px + 8, py + 9, 9, 6, 'rgba(184,212,248,0.16)');
      cogumelo(ctx, px + 5, py + 13, 3, i); cogumelo(ctx, px + 11, py + 14, 2, i + 1);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 500) % 3 : 0;
      ret(ctx, px + 2 + f * 5, py + 3 + (f & 1) * 4, 1, 1, f ? '#eef6ff' : '#ffffff');
    } });
})();
