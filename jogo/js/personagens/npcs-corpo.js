/* NPCs, sprite de pessoa: o que fica atrás do corpo (capa, asas, cabelo comprido), o corpo
   (tronco, estampa, pernas, roupas por cima, armadura) e os acessórios da frente (colar, bolsa,
   livro, varinha...). Só funções de pintar numa Grade; ver npcs.js. */
(function () {
  var _n = window.Reino._npcs;
  var CX = _n.CX, HY = _n.HY, BY = _n.BY, esc = _n.esc, cla = _n.cla, mis = _n.mis;

  /* ---------- atrás do corpo ---------- */
  function pintarAtras(g, o, m) {
    var H = o.cabelo, Hd = esc(H, 0.18), L = cla(H, 0.28), x = CX;
    if (o.capa) {
      var C = o.capaCor || '#9b5cff', Cd = esc(C, 0.2);
      g.r(x - 5, BY, 11, m.h - BY - 1, C);
      g.l(m.h - 2, x - 6, x + 6, Cd);
      g.l(m.h - 3, x - 6, x + 6, C);
      g.r(x - 5, BY + 1, 1, m.h - BY - 3, Cd);
      if (o.capaEstrelas) [[x - 5, BY + 2], [x + 5, BY + 4], [x - 6, m.h - 3], [x + 5, m.h - 2], [x - 5, BY + 6]].forEach(function (p) { g.p(p[0], p[1], '#ffe066'); });
    }
    if (o.asas) {
      var A = '#d6f2ff', Ad = '#a9d8f5', Ab = '#ffffff', y0 = BY - 2;
      [[-1], [1]].forEach(function (lado) {
        var s = lado[0];
        function p(dx, dy, c) { g.p(x + s * dx, y0 + dy, c); }
        [[4, 0], [5, 0], [4, 1], [5, 1], [6, 1], [7, 1], [4, 2], [5, 2], [6, 2], [7, 2], [4, 3], [5, 3], [6, 3],
          [5, 4], [6, 4], [7, 4], [5, 5], [6, 5], [7, 5], [6, 6]].forEach(function (q) { p(q[0], q[1], A); });
        p(6, 1, Ab); p(7, 2, Ad); p(7, 5, Ad); p(5, 3, '#ffc4e1'); p(6, 4, Ab);
      });
    }
    var y = HY;
    switch (o.penteado) {
      case 'longo':
        g.r(x - 5, y + 2, 11, BY + 3 - (y + 2), H);
        g.l(BY + 2, x - 5, x - 4, Hd); g.l(BY + 2, x + 4, x + 5, Hd);
        g.p(x - 5, y + 4, L);
        break;
      case 'chanel':
        g.r(x - 5, y + 1, 11, 6, H);
        g.p(x - 5, y + 6, Hd); g.p(x + 5, y + 6, Hd);
        break;
      case 'rabo':
        g.r(x + 5, y + 1, 1, 6, H); g.r(x + 6, y + 2, 1, 4, H); g.p(x + 5, y + 7, Hd); g.p(x + 6, y + 3, L);
        g.p(x + 5, y + 1, o.cor2);
        break;
      case 'rabos':
        [-1, 1].forEach(function (s) {
          g.r(x + s * 5 - (s < 0 ? 1 : 0), y + 2, 2, 4, H); g.p(x + s * 6, y + 6, Hd);
          g.p(x + s * 5, y + 1, o.cor2);
        });
        break;
      case 'trancas':
        g.r(x - 5, y + 1, 11, 4, H);
        [-1, 1].forEach(function (s) {
          for (var t = y + 3; t <= BY + 3; t++) g.p(x + s * 5, t, (t % 2) ? H : Hd);
          g.p(x + s * 5, BY + 4, o.cor2); g.p(x + s * 5, BY + 5, H);
        });
        break;
      case 'black':
        g.l(y - 3, x - 3, x + 3, H); g.l(y - 2, x - 5, x + 5, H);
        g.r(x - 6, y - 1, 13, 6, H); g.l(y + 5, x - 6, x + 6, H); g.l(y + 6, x - 5, x + 5, Hd);
        [[-4, -2], [2, -2], [-5, 0], [4, -1], [-2, -1], [5, 2], [-6, 3], [3, 0]].forEach(function (q) { g.p(x + q[0], y + q[1], L); });
        break;
      case 'cacheado':
        g.l(y - 2, x - 3, x - 2, H); g.l(y - 2, x, x + 1, H); g.l(y - 2, x + 3, x + 3, H);
        g.l(y - 1, x - 4, x + 4, H); g.r(x - 5, y, 11, 6, H);
        g.p(x - 5, y + 6, H); g.p(x + 5, y + 6, H); g.p(x - 4, y + 6, Hd); g.p(x + 4, y + 6, Hd);
        [[-3, -1], [1, -1], [-5, 1], [4, 0], [-4, 3], [5, 4], [-5, 5]].forEach(function (q) { g.p(x + q[0], y + q[1], L); });
        break;
    }
  }

  /* ---------- corpo ---------- */
  function pintarCorpo(g, o, m) {
    var x = CX, R = o.roupa, Rd = esc(R, 0.22), R2 = o.roupa2, R2d = esc(R2, 0.22), K = o.pele, S = o.sapato;
    // armadura: cinza de metal, ou na cor da matéria do cavaleiro (armaduraCor, arte.md §22)
    var AC = o.armaduraCor;
    if (o.armadura) { R2 = AC ? esc(mis('#c3cde0', AC, 0.7), 0.12) : '#aab4cc'; R2d = AC ? esc(R2, 0.25) : '#7c86a3'; S = AC ? esc(R2, 0.5) : '#5f6a84'; }
    var b = BY, nT = m.nT, maos = m.maos;
    // tronco
    g.l(b, x - 3, x + 3, R);
    for (var y = b + 1; y < maos; y++) g.l(y, x - 4, x + 4, R);
    g.l(maos, x - 3, x + 3, R2);
    g.p(x - 4, maos, K); g.p(x + 4, maos, K);
    for (y = b + 2; y < maos; y++) { g.p(x - 3, y, Rd); g.p(x + 3, y, Rd); }
    g.p(x, b, K);
    // estampa da roupa (só no tronco)
    if (o.estampa) {
      for (y = b; y < maos; y++) for (var i = -4; i <= 4; i++) {
        if (!g.tem(x + i, y) || g.em(x + i, y) === K) continue;
        var e = o.estampa, c = null;
        if (e === 'listras' && (y - b) % 2 === 1) c = cla(R, 0.35);
        if (e === 'xadrez' && ((i + 8) % 3 === 0 || (y - b) % 3 === 1)) c = ((i + 8) % 3 === 0 && (y - b) % 3 === 1) ? esc(R, 0.3) : cla(R, 0.3);
        if (e === 'bolinhas' && (i + 8 + (y - b) * 2) % 4 === 0 && (y - b) % 2 === 1) c = o.cor2;
        if (e === 'estrelas' && ((i === -2 && y === b + 1) || (i === 2 && y === b + 3) || (i === 0 && y === b + 2 && nT > 4))) c = o.cor2;
        if (c) g.p(x + i, y, c);
      }
    }
    // pernas (conforme o tipo e o tamanho)
    var L0 = m.corte, crianca = m.crianca;
    function pernas(y, c, w) { w = w || (crianca ? 2 : 3); g.l(y, x - w, x - 1, c); g.l(y, x + 1, x + w, c); }
    function sapatos(y) { pernas(y, S, crianca ? 2 : 3); }
    var tipo = o.armadura ? 'calca' : o.perna;
    if (tipo === 'calca') {
      g.l(L0, x - 3, x + 3, R2);
      for (y = L0 + 1; y < m.h - 1; y++) pernas(y, R2);
      if (!crianca) { g.p(x - 2, L0 + 2, R2d); g.p(x + 2, L0 + 2, R2d); }
      sapatos(m.h - 1);
    } else if (tipo === 'saia') {
      g.l(L0, x - 3, x + 3, R2);
      if (!crianca) { g.l(L0 + 1, x - 4, x + 4, R2); g.l(L0 + 2, x - 4, x + 4, R2d); }
      else g.l(L0 + 1, x - 4, x + 4, R2d);
      for (y = L0 + (crianca ? 2 : 3); y < m.h - 1; y++) { g.l(y, x - 2, x - 1, K); g.l(y, x + 1, x + 2, K); }
      g.l(m.h - 1, x - 2, x - 1, S); g.l(m.h - 1, x + 1, x + 2, S);
    } else if (tipo === 'vestido') {
      if (!crianca) {
        g.l(L0, x - 4, x + 4, R2); g.l(L0 + 1, x - 4, x + 4, R2);
        for (y = L0 + 2; y < m.h - 2; y++) g.l(y, x - 5, x + 5, R2);
        g.l(m.h - 2, x - 5, x + 5, R2d);
        g.p(x - 2, L0 + 1, cla(R2, 0.3)); g.p(x + 3, L0 + 3, cla(R2, 0.3));
        g.l(m.h - 1, x - 2, x - 1, S); g.l(m.h - 1, x + 1, x + 2, S);
      } else {
        g.l(L0, x - 3, x + 3, R2); g.l(L0 + 1, x - 4, x + 4, R2); g.l(L0 + 2, x - 4, x + 4, R2d);
        g.l(m.h - 1, x - 2, x - 1, S); g.l(m.h - 1, x + 1, x + 2, S);
      }
    } else { // short
      g.l(L0, x - 3, x + 3, R2);
      var yy = L0 + 1;
      if (!crianca) { pernas(yy, R2); yy++; }
      for (; yy < m.h - 2; yy++) pernas(yy, K, 2);
      pernas(m.h - 2, '#ffffff', 2);
      sapatos(m.h - 1);
    }
    // sapatões de palhaço: 1 px a mais para cada lado e a biqueira clarinha
    if (o.sapatoes) {
      var Sp = S;
      g.l(m.h - 1, x - 4, x - 1, Sp); g.l(m.h - 1, x + 1, x + 4, Sp);
      g.p(x - 4, m.h - 1, cla(Sp, 0.3)); g.p(x + 4, m.h - 1, cla(Sp, 0.3));
    }
    // roupas por cima
    if (o.jardineira) {
      var J = o.roupa2;
      for (y = b + 1; y <= maos; y++) g.l(y, x - 2, x + 2, J);
      g.p(x - 2, b, J); g.p(x + 2, b, J); g.p(x - 2, b + 1, o.cor2); g.p(x + 2, b + 1, o.cor2);
      g.p(x, b + 2, esc(J, 0.2));
    }
    if (o.colete) {
      var V = o.colete;
      for (y = b; y < maos; y++) { g.l(y, x - 3, x - 1, V); g.l(y, x + 1, x + 3, V); }
      g.l(maos, x - 3, x + 3, esc(V, 0.2)); g.p(x - 1, b + 2, cla(V, 0.3)); g.p(x - 1, b + 3, cla(V, 0.3));
      if (o.corrente) { g.p(x + 1, b + 3, '#ffd34d'); g.p(x + 2, b + 3, '#ffd34d'); g.p(x + 3, b + 2, '#ffd34d'); }
    }
    if (o.jaleco) {
      var B = '#f4f2fa', Bd = '#c9c4dc';
      for (y = b; y <= maos; y++) for (i = -4; i <= 4; i++) {
        if (Math.abs(i) === 4 && y === maos) continue;
        if (y === b && Math.abs(i) === 4) continue;
        g.p(x + i, y, i === 0 ? (y === b ? K : R) : B);
      }
      for (y = b + 2; y < maos; y++) { g.p(x - 3, y, Bd); g.p(x + 3, y, Bd); }
      g.p(x - 1, b, Bd); g.p(x + 1, b, Bd); g.p(x + 2, b + 2, Bd);
      g.l(L0, x - 4, x - 2, B); g.l(L0, x + 2, x + 4, B); g.l(L0 + 1, x - 4, x - 2, Bd); g.l(L0 + 1, x + 2, x + 4, Bd);
    }
    if (o.avental) {
      var A = o.aventalCor || '#c9a27a', Ad = esc(A, 0.2);
      g.p(x - 2, b, A); g.p(x + 2, b, A);
      for (y = b + 1; y <= L0 + 2 && y < m.h - 1; y++) g.l(y, x - 2, x + 2, A);
      g.l(L0, x - 1, x + 1, Ad); g.p(x - 3, maos, Ad); g.p(x + 3, maos, Ad);
    }
    if (o.armadura) {
      var M = AC ? mis('#c3cde0', AC, 0.7) : '#c3cde0', Md = AC ? esc(M, 0.3) : '#8791ad', Ml = AC ? cla(M, 0.6) : '#eef2fa';
      g.l(b, x - 4, x + 4, M); g.l(b + 1, x - 5, x + 5, M); g.p(x - 5, b + 2, Md); g.p(x + 5, b + 2, Md);
      for (y = b + 2; y < maos; y++) g.l(y, x - 4, x + 4, M);
      for (y = b + 2; y < maos; y++) { g.p(x - 3, y, Md); g.p(x + 3, y, Md); }
      g.p(x - 4, b + 1, Ml); g.p(x - 2, b + 1, Ml);
      g.p(x - 4, maos, K); g.p(x + 4, maos, K);
      // sobreveste com emblema
      for (y = b + 1; y <= L0 + 1; y++) g.l(y, x - 2, x + 2, R);
      g.l(L0 + 1, x - 2, x + 2, Rd);
      g.p(x - 1, b + 2, o.cor2); g.p(x + 1, b + 2, o.cor2); g.l(b + 3, x - 1, x + 1, o.cor2); if (nT > 4) g.p(x, b + 4, o.cor2);
      g.p(x - 2, L0 + 3, Ml); g.p(x + 2, L0 + 3, Ml);
      if (o.emblema === 'A') {
        // letra A dourada no lugar do coração/escudo (pinta a sobreveste por baixo de novo)
        var Ea = o.emblemaCor || '#ffd34d', Ead = esc(Ea, 0.3);
        for (var ya = b + 1; ya <= b + 5; ya++) g.l(ya, x - 2, x + 2, R);
        g.p(x, b + 2, Ea); g.p(x - 1, b + 3, Ea); g.p(x + 1, b + 3, Ea);
        g.l(b + 4, x - 1, x + 1, Ea); g.p(x - 1, b + 5, Ea); g.p(x + 1, b + 5, Ea);
        g.p(x + 1, b + 4, Ead);
      }
    }
  }

  function pintarFrente(g, o, m) {
    var x = CX, b = BY, maos = m.maos, K = o.pele;
    if (o.colar) {
      var P = o.colar === true ? '#ffffff' : o.colar;
      g.p(x - 2, b, P); g.p(x + 2, b, P); g.p(x - 1, b + 1, o.cor2); g.p(x, b + 1, P); g.p(x + 1, b + 1, o.cor2);
    }
    if (o.gola) {
      // gola de babado: franzida nos ombros, com a borda em ondinhas
      var Gw = o.gola === true ? '#ffffff' : o.gola, Gs = mis(Gw, o.chapeuCor, 0.35);
      g.l(b, x - 4, x + 4, Gs); g.l(b + 1, x - 5, x + 5, Gw);
      [-4, -2, 0, 2, 4].forEach(function (d) { g.p(x + d, b, Gw); g.p(x + d, b + 2, Gw); });
      [-5, -3, -1, 1, 3, 5].forEach(function (d) { g.p(x + d, b + 1, mis(Gw, o.chapeuCor, 0.18)); });
    }
    if (o.gravata) { var G = o.gravata === true ? '#e0433f' : o.gravata; g.p(x - 1, b, G); g.p(x + 1, b, G); g.p(x, b, esc(G, 0.3)); g.p(x - 2, b + 1, G); g.p(x + 2, b + 1, G); }
    if (o.cachecol) {
      var Cc = o.cachecolCor || '#2f4f8a', Cl = cla(Cc, 0.35);
      g.l(b, x - 3, x + 3, Cc); g.p(x - 1, b, Cl); g.p(x + 2, b, Cl);
      g.p(x + 2, b + 1, Cc); g.p(x + 2, b + 2, Cl); g.p(x + 2, b + 3, Cc);
    }
    if (o.apito) {
      var cord = o.cor2 === '#ffffff' ? '#e0433f' : o.cor2;
      g.p(x - 2, b, cord); g.p(x + 2, b, cord); g.p(x - 1, b + 1, cord); g.p(x + 1, b + 1, cord);
      g.p(x, b + 2, '#e8edf5'); g.p(x + 1, b + 2, '#a9b4c8');
    }
    if (o.cracha) { g.p(x + 2, b + 2, '#ffffff'); g.p(x + 2, b + 1, o.cor2); }
    if (o.presilha) { var y0 = HY + 1; g.p(x - 3, y0, '#ffe066'); g.p(x - 4, y0, '#ffe066'); g.p(x - 2, y0, '#ffe066'); g.p(x - 3, y0 - 1, '#ffe066'); g.p(x - 3, y0 + 1, '#ffe066'); }
    if (o.flor) { var yf = HY + 1; g.p(x + 3, yf, '#ffd34d'); g.p(x + 2, yf, '#ffffff'); g.p(x + 4, yf, '#ffffff'); g.p(x + 3, yf - 1, '#ffffff'); g.p(x + 3, yf + 1, '#ffffff'); }
    if (o.espelhoTesta) {
      var yb = HY + 2;
      g.l(yb, x - 4, x + 4, '#5f6a84');
      g.l(HY, x - 1, x + 1, '#c9d3e6'); g.l(HY + 1, x - 2, x + 2, '#c9d3e6'); g.p(x, HY + 1, '#ffffff'); g.l(yb, x - 1, x + 1, '#a9b4c8');
    }
    if (o.bolsa) {
      var Bs = o.bolsaCor || '#b8651a', Bd = esc(Bs, 0.25);
      for (var i = 0; i < m.nT; i++) g.p(x - 3 + Math.round(i * 7 / (m.nT - 1)), b + i, Bd);
      g.r(x + 5, maos - 1, 3, 3, Bs); g.l(maos - 1, x + 5, x + 7, Bd); g.p(x + 6, maos, '#ffffff');
    }
    if (o.bengala) {
      var Bn = '#8a5a3a';
      g.p(x + 4, maos - 1, Bn); g.p(x + 5, maos - 1, Bn);
      for (var yb2 = maos; yb2 < m.h; yb2++) g.p(x + 5, yb2, Bn);
      g.p(x + 4, maos, K);
    }
    if (o.livro) {
      var Lv = o.livro === true ? o.cor2 : o.livro;
      g.r(x - 6, maos - 1, 3, 3, Lv); g.p(x - 5, maos - 1, '#ffffff'); g.p(x - 5, maos, '#ffffff'); g.p(x - 5, maos + 1, esc(Lv, 0.25));
      g.p(x - 4, maos, K);
    }
    if (o.livroAberto) {
      // livro aberto na frente do peito, segurado pelas duas mãos (páginas em V, capa por baixo)
      var La = o.livroAberto === true ? o.cor2 : o.livroAberto, Lad = esc(La, 0.3), Pg = '#fffaf0', Pgs = '#e8dcc8', Tx = '#cfc6dc';
      g.p(x - 3, maos - 3, Pg); g.p(x - 2, maos - 3, Pg); g.p(x + 2, maos - 3, Pg); g.p(x + 3, maos - 3, Pg);
      g.l(maos - 2, x - 4, x + 4, Pg); g.l(maos - 1, x - 4, x + 4, Pg);
      g.p(x - 1, maos - 3, Pgs); g.p(x + 1, maos - 3, Pgs); g.p(x, maos - 2, Pgs); g.p(x, maos - 1, Pgs);
      g.l(maos - 2, x - 3, x - 2, Tx); g.l(maos - 2, x + 2, x + 3, Tx); g.p(x - 3, maos - 1, Tx); g.l(maos - 1, x + 2, x + 3, Tx);
      g.l(maos, x - 5, x + 5, La); g.p(x, maos, Lad); g.p(x - 5, maos - 1, La); g.p(x + 5, maos - 1, La);
      g.p(x - 4, maos - 1, K); g.p(x + 4, maos - 1, K); g.p(x - 5, maos, Lad); g.p(x + 5, maos, Lad);
    }
    if (o.regador) {
      // regador de lata na mão direita, com o bico para fora e uma gotinha
      var Rg = o.regadorCor || '#5fb4ff', Rgd = esc(Rg, 0.28), Rgl = cla(Rg, 0.45);
      g.r(x + 5, maos - 1, 3, 3, Rg); g.l(maos + 1, x + 5, x + 7, Rgd); g.p(x + 5, maos - 1, Rgl);
      g.p(x + 5, maos - 2, Rgd); g.p(x + 7, maos - 2, Rgd); g.p(x + 6, maos - 3, Rgd);
      g.p(x + 8, maos, Rg); g.p(x + 9, maos - 1, Rg); g.p(x + 9, maos - 2, Rgd);
      g.p(x + 9, maos + 1, '#bfe6ff');
      g.p(x + 4, maos, K);
    }
    if (o.lapis) {
      // lápis espetado no cabelo, com a borrachinha de fora
      var Lp = '#ffd34d', Lpd = '#e09a1e';
      g.p(x + 3, HY - 1, Lp); g.p(x + 4, HY - 2, Lp); g.p(x + 5, HY - 3, Lp);
      g.p(x + 4, HY - 1, Lpd); g.p(x + 5, HY - 2, Lpd); g.p(x + 6, HY - 3, Lpd);
      g.p(x + 6, HY - 4, '#c3cde0'); g.p(x + 7, HY - 4, '#8791ad'); g.p(x + 7, HY - 5, '#ff8fb8');
    }
    if (o.tesoura) {
      // tesoura de cabeleireira na mão direita: lâminas prateadas para cima, argolas cor-de-rosa
      var Ts = '#d8e0ec', Tp = o.tesoura === true ? '#ff8ac4' : o.tesoura;
      g.p(x + 5, maos - 5, Ts); g.p(x + 7, maos - 5, Ts); g.p(x + 5, maos - 4, Ts); g.p(x + 7, maos - 4, Ts);
      g.p(x + 6, maos - 3, '#ffd34d'); g.p(x + 5, maos - 2, Tp); g.p(x + 7, maos - 2, Tp); g.p(x + 5, maos - 1, Tp); g.p(x + 7, maos - 1, Tp);
      g.p(x + 5, maos, K); g.p(x + 4, maos, K);
    }
    if (o.foguete) {
      // maquete de foguete na mão esquerda: bico e aletas vermelhos, janelinha azul e o foguinho embaixo
      var Fv = '#e0433f', Fb = '#f4f6fb';
      g.p(x - 5, maos - 4, Fv); g.p(x - 5, maos - 3, Fb); g.p(x - 5, maos - 2, '#5fb4ff'); g.p(x - 5, maos - 1, Fb);
      g.p(x - 6, maos - 1, Fv); g.p(x - 6, maos, Fv); g.p(x - 5, maos, '#c8d0e0'); g.p(x - 5, maos + 1, '#ffb020');
      g.p(x - 4, maos, K);
    }
    if (o.chave) {
      // chave inglesa na mão direita, com a boca aberta para cima
      var Ch = '#a9b4c8', Chd = '#6a7390';
      g.p(x + 4, maos - 4, Ch); g.p(x + 6, maos - 4, Ch); g.l(maos - 3, x + 4, x + 6, Ch);
      for (var yc = maos - 2; yc <= maos + 1; yc++) g.p(x + 5, yc, Chd);
      g.p(x + 4, maos, K);
    }
    if (o.mapa) {
      // mapa dobrado na mão esquerda: papel, terra verde, mar azul e o X vermelho
      g.r(x - 7, maos - 1, 3, 3, '#fff1c4'); g.p(x - 7, maos - 1, '#6fbf5a'); g.p(x - 6, maos, '#5fb4ff');
      g.p(x - 5, maos + 1, '#e0433f'); g.p(x - 7, maos + 1, '#e8d49a'); g.p(x - 4, maos, K);
    }
    if (o.carta) {
      g.r(x - 7, maos - 1, 3, 2, '#fffaf0'); g.p(x - 6, maos - 1, '#e0433f'); g.p(x - 4, maos, K);
    }
    if (o.pincel) {
      g.p(x + 5, maos - 4, o.cor2); g.p(x + 5, maos - 3, '#e8edf5');
      for (var yp = maos - 2; yp <= maos; yp++) g.p(x + 5, yp, '#8a5a3a');
      g.p(x + 4, maos, K);
    }
    if (o.varinha) {
      for (var yv = maos - 3; yv <= maos; yv++) g.p(x + 5, yv, '#ffffff');
      var ye = maos - 5;
      g.p(x + 5, ye, '#ffe066'); g.p(x + 4, ye, '#ffe066'); g.p(x + 6, ye, '#ffe066'); g.p(x + 5, ye - 1, '#ffe066'); g.p(x + 5, ye + 1, '#ffe066');
      g.p(x + 4, maos, K);
    }
    if (o.violao) {
      var Vi = '#d08a3c', Vd = '#8a4f1e';
      g.r(x - 4, maos - 1, 4, 3, Vi); g.l(maos + 2, x - 3, x - 1, Vi); g.l(maos - 2, x - 3, x - 1, Vi);
      g.p(x - 2, maos, '#3a2446'); g.p(x - 4, maos + 1, Vd);
      g.p(x, maos - 2, Vd); g.p(x + 1, maos - 3, Vd); g.p(x + 2, maos - 4, Vd); g.p(x + 3, maos - 5, Vd);
      g.p(x + 4, maos - 6, '#3a2446'); g.p(x + 4, maos - 5, Vd);
      g.p(x - 4, maos, K); g.p(x + 1, maos - 2, K);
    }
  }

  _n.pintarAtras = pintarAtras;
  _n.pintarCorpo = pintarCorpo;
  _n.pintarFrente = pintarFrente;
})();
