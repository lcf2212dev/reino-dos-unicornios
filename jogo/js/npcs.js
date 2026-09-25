/* Personagens (NPCs) que moram dentro das construções: sprite em pixel art gerado por
   parâmetros (2 quadros de "respirar" + piscar), retrato para o balão, ícone de status
   derivado do progresso, conversa no balão do Claude e as mesmas ações de sempre.
   No carregamento este arquivo NÃO toca em DOM, canvas, PA nem Progresso (as ferramentas
   em Node o carregam num vm); tudo isso só dentro das funções. */
(function () {
  var Reino = window.Reino;
  var N = {};

  /* ================= GERADOR DE SPRITES ================= */
  var W = 19, CX = 9;          // grade de 19 colunas, centro na coluna 9 (fica centrada no tile)
  var TOPO = 6;                // linhas livres em cima para chapéu, coque, pluma...
  var HY = TOPO;               // primeira linha da cabeça (7 linhas, como a Mariana)
  var BY = HY + 7;             // primeira linha do corpo
  var CONTORNO = '#3a2446';
  var cache = {};

  function cor() { return window.PA.cor; }
  function esc(c, t) { return cor().escurecer(c, t); }
  function cla(c, t) { return cor().clarear(c, t); }
  function mis(a, b, t) { return cor().misturar(a, b, t); }

  // grade de pixels; linhas acima de `corte` sobem `dy` (respirar)
  function Grade(h, corte, dy) { this.w = W; this.h = h; this.c = []; this.corte = corte; this.dy = dy || 0; }
  Grade.prototype.p = function (x, y, c) {
    if (y < this.corte) y += this.dy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    this.c[y * this.w + x] = c;
  };
  Grade.prototype.r = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.p(x + i, y + j, c); };
  Grade.prototype.l = function (y, x0, x1, c) { for (var x = x0; x <= x1; x++) this.p(x, y, c); };
  Grade.prototype.apagar = function (x, y) {
    if (y < this.corte) y += this.dy;
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y * this.w + x] = null;
  };
  Grade.prototype.tem = function (x, y) { return !!this.c[y * this.w + x]; };
  Grade.prototype.em = function (x, y) { return this.c[y * this.w + x]; };
  // ao respirar, a linha logo acima do corte fica vazia: completa com a cor de baixo
  Grade.prototype.fecharCorte = function () {
    if (!this.dy) return;
    var y = this.corte - 1;
    for (var x = 0; x < this.w; x++) {
      if (!this.tem(x, y) && this.tem(x, y + 1) && this.tem(x, y - 1)) this.c[y * this.w + x] = this.em(x, y + 1);
    }
  };
  Grade.prototype.canvas = function () {
    var c = window.PA.novoCanvas(this.w, this.h), ctx = c.getContext('2d');
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var k = this.c[y * this.w + x];
      if (k) { ctx.fillStyle = k; ctx.fillRect(x, y, 1, 1); }
    }
    return c;
  };

  // parâmetros com os padrões preenchidos
  function params(s) {
    s = s || {};
    var idade = s.idade || (s.base === 'fada' ? 'crianca' : 'adulto');
    var roupa = s.roupa || '#7c9cff';
    var o = {
      base: s.base || 'pessoa', idade: idade,
      pele: s.pele || '#f1c7a5',
      cabelo: s.cabelo || (idade === 'idoso' ? '#dcd6e4' : '#5a3825'),
      penteado: s.penteado || 'curto',
      roupa: roupa, roupa2: s.roupa2 || esc(roupa, 0.35),
      perna: s.perna || (s.base === 'fada' ? 'vestido' : 'calca'),
      sapato: s.sapato || '#6b3b5a',
      cor2: s.cor2 || '#ffd34d',
      chapeu: s.chapeu || null, chapeuCor: s.chapeuCor || s.cor2 || '#e0433f',
      estampa: s.estampa || null,
      boca: s.boca !== false,
    };
    ['oculos', 'oculosCor', 'barba', 'bigode', 'avental', 'aventalCor', 'capa', 'capaCor', 'capaEstrelas', 'jaleco', 'apito',
      'bengala', 'bolsa', 'bolsaCor', 'colar', 'gravata', 'cachecol', 'cachecolCor', 'cracha', 'livro', 'carta', 'pincel',
      'violao', 'varinha', 'presilha', 'flor', 'espelhoTesta', 'armadura', 'jardineira', 'colete', 'corrente', 'asas',
      'corpo', 'barriga', 'asa', 'moeda'].forEach(function (k) { if (s[k] !== undefined) o[k] = s[k]; });
    if (o.base === 'fada' && o.asas === undefined) o.asas = true;
    o.cru = s;   // parâmetros originais (bases novas, como o robô, leem os seus daqui)
    return o;
  }

  function medidas(o) {
    var crianca = o.idade === 'crianca';
    var nT = crianca ? 4 : 5, nL = crianca ? 4 : 5;
    return { nT: nT, nL: nL, maos: BY + nT - 1, corte: BY + nT, h: BY + nT + nL };
  }

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
    if (o.armadura) { R2 = '#aab4cc'; R2d = '#7c86a3'; S = '#5f6a84'; }
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
    var L0 = m.corte, crianca = m.nL === 4;
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
      if (!crianca) { g.l(L0 + 1, x - 4, x + 4, R2); g.l(L0 + 2, x - 4, x + 4, R2d); g.l(L0 + 3, x - 2, x - 1, K); g.l(L0 + 3, x + 1, x + 2, K); }
      else { g.l(L0 + 1, x - 4, x + 4, R2d); g.l(L0 + 2, x - 2, x - 1, K); g.l(L0 + 2, x + 1, x + 2, K); }
      g.l(m.h - 1, x - 2, x - 1, S); g.l(m.h - 1, x + 1, x + 2, S);
    } else if (tipo === 'vestido') {
      if (!crianca) {
        g.l(L0, x - 4, x + 4, R2); g.l(L0 + 1, x - 4, x + 4, R2);
        g.l(L0 + 2, x - 5, x + 5, R2); g.l(L0 + 3, x - 5, x + 5, R2); g.l(L0 + 4, x - 5, x + 5, R2d);
        g.p(x - 2, L0 + 1, cla(R2, 0.3)); g.p(x + 3, L0 + 3, cla(R2, 0.3));
      } else {
        g.l(L0, x - 3, x + 3, R2); g.l(L0 + 1, x - 4, x + 4, R2); g.l(L0 + 2, x - 4, x + 4, R2d);
        g.l(m.h - 1, x - 2, x - 1, S); g.l(m.h - 1, x + 1, x + 2, S);
      }
    } else { // short
      g.l(L0, x - 3, x + 3, R2);
      var yy = L0 + 1;
      if (!crianca) { pernas(yy, R2); yy++; }
      pernas(yy, K, 2); pernas(yy + 1, '#ffffff', 2);
      sapatos(m.h - 1);
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
      var M = '#c3cde0', Md = '#8791ad', Ml = '#eef2fa';
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
    }
  }

  /* ---------- cabeça ---------- */
  function pintarCabeca(g, o, piscar) {
    var x = CX, y = HY, K = o.pele;
    g.l(y, x - 2, x + 2, K); g.l(y + 1, x - 3, x + 3, K);
    for (var j = 2; j <= 5; j++) g.l(y + j, x - 4, x + 4, K);
    g.l(y + 6, x - 3, x + 3, K);
    var olho = piscar ? esc(K, 0.4) : '#2a1838';
    g.p(x - 2, y + 4, olho); g.p(x + 2, y + 4, olho);
    var bochecha = mis(K, '#ff6b8a', 0.42);
    g.p(x - 3, y + 5, bochecha); g.p(x + 3, y + 5, bochecha);
    if (o.boca) g.p(x, y + 6, mis(K, '#b03a5a', 0.5));
  }

  function pintarCabeloFrente(g, o) {
    var x = CX, y = HY, H = o.cabelo, L = cla(H, 0.28), Hd = esc(H, 0.18), K = o.pele;
    function topo(volume) {
      if (volume) g.l(y - 1, x - 2, x + 2, H);
      g.l(y, x - 3, x + 3, H); g.l(y + 1, x - 4, x + 4, H); g.l(y + 2, x - 4, x + 4, H);
      g.p(x - 2, y, L); g.p(x - 1, y, L); g.p(x - 3, y + 1, L);
    }
    function lados(ate, largo) {
      g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H);
      if (largo) { g.p(x - 3, y + 3, H); g.p(x + 3, y + 3, H); }
      for (var j = 4; j <= ate; j++) { g.p(x - 4, y + j, H); g.p(x + 4, y + j, H); }
    }
    function queixoFino() { g.apagar(x - 3, y + 6); g.apagar(x + 3, y + 6); }
    switch (o.penteado) {
      case 'careca':
        g.p(x - 1, y, cla(K, 0.45)); g.p(x - 2, y + 1, cla(K, 0.25));
        g.p(x - 4, y + 2, H); g.p(x - 3, y + 2, H); g.p(x + 3, y + 2, H); g.p(x + 4, y + 2, H);
        g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H);
        queixoFino();
        break;
      case 'espetado':
        topo(true);
        g.p(x - 3, y - 1, H); g.p(x + 3, y - 1, H); g.p(x - 2, y - 2, H); g.p(x + 1, y - 2, H); g.p(x + 3, y - 2, Hd);
        lados(3);
        queixoFino();
        break;
      case 'longo': case 'trancas':
        topo(true); lados(6, true);
        break;
      case 'chanel':
        topo(true); g.l(y + 3, x - 4, x + 4, H); g.p(x, y + 3, Hd); lados(6);
        break;
      case 'rabo': case 'rabos':
        topo(false); lados(4, true);
        break;
      case 'coque':
        topo(false); lados(4, true);
        g.l(y - 3, x - 1, x + 1, H); g.l(y - 2, x - 2, x + 2, H); g.l(y - 1, x - 1, x + 1, Hd);
        g.p(x - 1, y - 3, L); g.p(x + 2, y - 2, o.cor2);
        break;
      case 'black': case 'cacheado':
        g.l(y, x - 3, x + 3, H); g.l(y + 1, x - 4, x + 4, H); g.l(y + 2, x - 4, x + 4, H);
        g.p(x - 4, y + 3, H); g.p(x + 4, y + 3, H); g.p(x - 1, y + 1, L); g.p(x + 2, y, L);
        break;
      default: // curto
        topo(true); lados(3);
        g.p(x + 1, y + 2, Hd);
        queixoFino();
    }
  }

  function pintarRosto(g, o) {
    var x = CX, y = HY, H = o.cabelo;
    if (o.barba) {
      var Bb = o.barba === true ? H : o.barba;
      g.p(x - 4, y + 5, Bb); g.p(x + 4, y + 5, Bb); g.p(x - 4, y + 4, Bb); g.p(x + 4, y + 4, Bb);
      g.l(y + 6, x - 3, x + 3, Bb); g.l(y + 7, x - 2, x + 2, Bb); g.p(x, y + 6, esc(Bb, 0.25));
    }
    if (o.bigode) {
      var Bg = o.bigode === true ? H : o.bigode;
      g.l(y + 5, x - 2, x + 2, Bg); g.p(x, y + 5, esc(Bg, 0.15));
    }
    if (o.oculos) {
      // armação fina na linha dos olhos (os olhos continuam aparecendo) e um brilho na lente
      var Oc = o.oculosCor || '#8a6bb0';
      g.p(x - 3, y + 4, Oc); g.p(x - 1, y + 4, Oc); g.p(x, y + 4, Oc); g.p(x + 1, y + 4, Oc); g.p(x + 3, y + 4, Oc);
      g.p(x - 2, y + 3, cla(o.pele, 0.5)); g.p(x + 2, y + 3, cla(o.pele, 0.5));
    }
  }

  function pintarChapeu(g, o) {
    var x = CX, y = HY, C = o.chapeuCor, Cd = esc(C, 0.22), Cl = cla(C, 0.3), c2 = o.cor2;
    switch (o.chapeu) {
      case 'bone':
        g.l(y - 1, x - 3, x + 3, C); g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, C);
        g.l(y + 2, x - 5, x + 5, Cd); g.p(x, y, c2); g.p(x - 2, y - 1, Cl);
        break;
      case 'chapeu': case 'palha':
        var palha = o.chapeu === 'palha';
        if (palha) { C = o.chapeuCor && o.chapeuCor !== o.cor2 ? o.chapeuCor : '#f2cf6b'; Cd = esc(C, 0.2); Cl = cla(C, 0.35); }
        g.l(y - 3, x - 2, x + 2, C); g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 3, x + 3, C);
        g.l(y, x - 3, x + 3, palha ? '#d6453d' : c2);
        g.l(y + 1, x - (palha ? 7 : 6), x + (palha ? 7 : 6), Cd);
        g.p(x - 2, y - 2, Cl);
        if (palha) { g.p(x - 5, y + 1, Cl); g.p(x - 1, y + 1, Cl); g.p(x + 3, y + 1, Cl); g.p(x + 1, y - 2, Cd); g.p(x - 1, y - 1, Cd); }
        break;
      case 'cartola':
        g.r(x - 3, y - 5, 7, 5, C); g.l(y - 1, x - 3, x + 3, c2); g.l(y, x - 5, x + 5, Cd);
        g.r(x - 2, y - 4, 1, 3, Cl);
        break;
      case 'boina':
        g.p(x, y - 2, Cd); g.l(y - 1, x - 3, x + 4, C); g.l(y, x - 4, x + 5, C); g.l(y + 1, x - 4, x + 4, Cd);
        g.p(x - 2, y - 1, Cl);
        break;
      case 'coroa':
        var O = '#ffd34d', Od = '#e09a1e';
        g.p(x - 3, y - 3, O); g.p(x, y - 3, O); g.p(x + 3, y - 3, O);
        g.p(x - 3, y - 2, O); g.l(y - 2, x - 1, x + 1, O); g.p(x + 3, y - 2, O);
        g.l(y - 1, x - 3, x + 3, O); g.l(y, x - 3, x + 3, Od);
        g.p(x - 2, y, '#ff4f9a'); g.p(x, y, '#5fb4ff'); g.p(x + 2, y, '#ff4f9a'); g.p(x, y - 2, '#ffffff');
        break;
      case 'tiara':
        g.l(y + 1, x - 3, x + 3, '#ffd34d'); g.p(x, y, '#ff4f9a'); g.p(x - 1, y, '#ffd34d'); g.p(x + 1, y, '#ffd34d');
        break;
      case 'elmo':
        var M = '#c3cde0', Md = '#8791ad', Ml = '#eef2fa';
        g.l(y - 1, x - 3, x + 3, M); g.l(y, x - 4, x + 4, M); g.l(y + 1, x - 4, x + 4, M); g.l(y + 2, x - 4, x + 4, Md);
        for (var j = 3; j <= 5; j++) { g.p(x - 4, y + j, M); g.p(x + 4, y + j, M); }
        g.p(x - 3, y + 3, Md); g.p(x + 3, y + 3, Md);
        g.p(x - 2, y, Ml); g.p(x - 3, y + 1, Ml); g.p(x, y + 1, Md);
        // pluma
        g.l(y - 4, x, x + 2, c2); g.l(y - 3, x - 1, x + 2, c2); g.l(y - 2, x - 1, x + 1, c2); g.p(x + 1, y - 4, cla(c2, 0.4));
        break;
      case 'turbante':
        g.l(y - 3, x - 3, x + 1, C); g.p(x + 2, y - 4, C); g.p(x + 3, y - 4, c2); g.l(y - 3, x + 2, x + 3, c2);
        g.l(y - 2, x - 4, x + 4, c2); g.l(y - 1, x - 4, x + 4, C); g.l(y, x - 4, x + 4, c2); g.l(y + 1, x - 4, x + 4, C);
        g.p(x - 2, y - 1, Cl); g.p(x + 1, y + 1, Cd); g.p(x - 3, y - 2, cla(c2, 0.3));
        break;
      case 'gorro':
        g.l(y - 3, x - 1, x + 3, C); g.l(y - 2, x - 3, x + 3, C); g.l(y - 1, x - 4, x + 4, C);
        g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, '#f4f2fa');
        g.l(y - 4, x + 2, x + 4, C); g.p(x + 5, y - 3, C); g.p(x + 5, y - 2, Cd); g.p(x + 6, y - 1, '#ffffff'); g.p(x + 6, y - 2, '#f4f2fa');
        g.p(x - 1, y - 1, c2); g.p(x - 2, y, c2); g.p(x + 2, y - 2, Cl);
        break;
      case 'lenco':
        g.l(y - 1, x - 2, x + 2, C); g.l(y, x - 4, x + 4, C); g.l(y + 1, x - 4, x + 4, C);
        g.p(x - 2, y, c2); g.p(x + 1, y + 1, c2); g.p(x + 3, y, c2); g.p(x + 5, y + 1, C); g.p(x + 5, y + 2, Cd); g.p(x + 6, y + 2, C);
        break;
      case 'flores':
        var cores = ['#ff6b8a', '#ffe066', '#ffffff', '#b58cff', '#ff9d2e'];
        [-4, -2, 0, 2, 4].forEach(function (dx, i) { g.p(x + dx, y + 1, cores[i]); });
        [-3, -1, 1, 3].forEach(function (dx) { g.p(x + dx, y + 1, '#6fdc8c'); });
        g.p(x, y, '#ffe066');
        break;
    }
  }

  function pintarFrente(g, o, m) {
    var x = CX, b = BY, maos = m.maos, K = o.pele;
    if (o.colar) {
      var P = o.colar === true ? '#ffffff' : o.colar;
      g.p(x - 2, b, P); g.p(x + 2, b, P); g.p(x - 1, b + 1, o.cor2); g.p(x, b + 1, P); g.p(x + 1, b + 1, o.cor2);
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

  /* ---------- dragãozinho (Tostão) ---------- */
  var DRAGAO = [
    '......h.....h......',
    '.....hh.....hh.....',
    '.....CCCCsCCCC.....',
    '....CCCCCCCCCCC....',
    '...CCCCCCCCCCCCC...',
    '...CCWECCCCCWECC...',
    '...CCEECCCCCEECC...',
    '...CRCCCCCCCCCRC...',
    '....CCCnCCCnCCC....',
    '.....CCCmmmCCC.....',
    '.aa...cCCCCCc...aa.',
    'aAaa.CCBBBBBCC.aaAa',
    '.aAa.CBBoooBBC.aAa.',
    '..aaCKBoOOOoBKC.aa.',
    '....cCBBoooBBCc....',
    '....CCBBBBBBBCC.tt.',
    '....CCCBBBBBCCCtt..',
    '....cCCCCCCCCCttt..',
    '...FFFF.....FFFF...',
  ];
  var DRAGAO_PISCA = { 5: '...CCCCCCCCCCCCC...', 6: '...CCEECCCCCEECC...' };

  function gradeDragao(o, quadro) {
    var pal = {
      C: o.corpo || '#f0a04a', c: esc(o.corpo || '#f0a04a', 0.2), B: o.barriga || '#fff0c4', h: '#fff6e0',
      E: '#2a1838', W: '#ffffff', R: '#ff9cc6', n: esc(o.corpo || '#f0a04a', 0.35), m: '#b03a5a',
      a: o.asa || '#ff7a3d', A: esc(o.asa || '#ff7a3d', 0.25), o: '#ffd34d', O: '#e09a1e', K: o.corpo || '#f0a04a',
      t: o.corpo || '#f0a04a', F: esc(o.corpo || '#f0a04a', 0.28), s: '#ff6b8a',
    };
    if (o.moeda === false) { pal.o = pal.B; pal.O = pal.B; }
    var h = TOPO + DRAGAO.length, corte = TOPO + 13;
    var g = new Grade(h, corte, (quadro & 1) ? -1 : 0);
    DRAGAO.forEach(function (linha, j) {
      if (quadro & 2) linha = DRAGAO_PISCA[j] || linha;
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, TOPO + j, pal[k]); }
    });
    g.fecharCorte();
    return { g: g, busto: TOPO + 11 };
  }

  function gradePessoa(o, quadro) {
    var m = medidas(o);
    var g = new Grade(m.h, m.corte, (quadro & 1) ? -1 : 0);
    pintarAtras(g, o, m);
    pintarCorpo(g, o, m);
    pintarCabeca(g, o, !!(quadro & 2));
    pintarCabeloFrente(g, o);
    pintarRosto(g, o);
    pintarChapeu(g, o);
    pintarFrente(g, o, m);
    g.fecharCorte();
    return { g: g, busto: BY + 3 };
  }

  function chaveSprite(s) { return JSON.stringify(s || {}); }

  /* bases novas de sprite (ex.: 'robo' do Observatório): fn(o, quadro) → { g: Grade, busto }.
     o = params() com o.cru = o sprite original; quadro: bit 1 respira, bit 2 pisca. */
  var BASES = {};
  N.registrarBase = function (nome, fn) { BASES[nome] = fn; };
  N.gradeSprite = { Grade: Grade, W: W, CX: CX, TOPO: TOPO, HY: HY, BY: BY, CONTORNO: CONTORNO,
    esc: function (c, t) { return esc(c, t); }, cla: function (c, t) { return cla(c, t); }, mis: function (a, b, t) { return mis(a, b, t); } };

  // quadro: bit 1 = respirando (corpo sobe 1 px), bit 2 = piscando. 0 e 1 são os quadros do contrato.
  function gerar(spriteDef, quadro) {
    quadro = quadro | 0;
    var k = 'npc|' + chaveSprite(spriteDef) + '|' + quadro;
    if (cache[k]) return cache[k];
    var o = params(spriteDef);
    var r = BASES[o.base] ? BASES[o.base](o, quadro) : o.base === 'dragao' ? gradeDragao(o, quadro) : gradePessoa(o, quadro);
    var c = window.PA.contornar(r.g.canvas(), CONTORNO);
    // primeira linha com desenho (para pôr o ícone de status em cima da cabeça)
    var dados = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, topo = 0;
    achar: for (var y = 0; y < c.height; y++) for (var x = 0; x < c.width; x++) if (dados[(y * c.width + x) * 4 + 3]) { topo = y; break achar; }
    c.topo = topo;
    c.busto = r.busto + 1;   // +1 do contorno
    cache[k] = c;
    return c;
  }

  N.sprite = function (npc, quadro) { return gerar(npc.sprite, quadro); };

  // busto para o balão: quadrado, com a base no peito; quadro 1 = piscando
  N.retrato = function (npc, quadro) {
    var k = 'npcRetrato|' + chaveSprite(npc.sprite) + '|' + (quadro ? 1 : 0);
    if (cache[k]) return cache[k];
    var spr = gerar(npc.sprite, quadro ? 2 : 0);
    var lado = spr.width, fim = spr.busto + 1, ini = Math.max(0, Math.min(spr.topo, fim - lado));
    var alto = Math.min(lado, fim - ini);
    var c = window.PA.novoCanvas(lado, lado);
    c.getContext('2d').drawImage(spr, 0, ini, lado, alto, 0, lado - alto, lado, alto);
    cache[k] = c;
    return c;
  };

  /* ================= STATUS ================= */
  function P() { return Reino.Progresso; }
  function materiaDe(acao) { return acao && Reino.materia(acao.materia); }
  function salaDe(acao) {
    var m = materiaDe(acao);
    return m && m.salas.find(function (s) { return s.id === acao.sala; });
  }
  function raroDaSala(m, s) { return (m.unicornios || []).find(function (u) { return u.raridade === 'raro' && u.sala === s.id; }); }
  function materiaDoLugar(lugar) { return /^materia:/.test(lugar || '') ? Reino.materia(lugar.slice(8)) : null; }
  var MEDALHA = { ouro: '🥇', prata: '🥈', bronze: '🥉' };
  var VALENDO = { lendario: '🌈', raro: '💙', comum: '🤍' };

  // status vindos de outros módulos (ex.: Dona Aveia com a montaria faminta): fn(npc) → {icone, rotulo} | null
  var STATUS = [];
  N.registrarStatus = function (fn) { STATUS.push(fn); };
  N.status = function (npc) {
    for (var si = 0; si < STATUS.length; si++) {
      try { var st = STATUS[si](npc); if (st) return st; } catch (e) { console.error(e); }
    }
    var a = npc.acao || {}, p = P(), est = p.estado();
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (!s) return { icone: '💬', rotulo: 'Conversar' };
      var raro = raroDaSala(m, s);
      if (raro && p.temUni(raro.id)) return { icone: '💙', rotulo: 'Raro já nasceu' };
      var reg = est.salas[s.id];
      return reg && reg.feita ? { icone: '✓', rotulo: 'Sala feita' } : { icone: '❗', rotulo: 'Sala nova' };
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (!mt) return { icone: '💬', rotulo: 'Conversar' };
      if (!p.materiaCompleta(mt)) return { icone: '🔒', rotulo: 'Treino fechado' };
      var t = est.treinos[mt.id] || {};
      return MEDALHA[t.melhor] ? { icone: MEDALHA[t.melhor], rotulo: 'Melhor medalha' } : { icone: '❗', rotulo: 'Treino aberto' };
    }
    if (a.tipo === 'prova') {
      var pv = Reino.prova(a.prova);
      if (!pv) return { icone: '💬', rotulo: 'Conversar' };
      var v = p.valendoProva(pv);
      return v ? { icone: VALENDO[v], rotulo: 'Valendo ' + v } : { icone: '✓', rotulo: 'Acessório ganho' };
    }
    if (a.tipo === 'tela' && (a.tela === 'estabulo' || a.tela === 'ovos') && p.ovosParaChocar().length) return { icone: '🥚', rotulo: 'Ovos para chocar' };
    return { icone: '💬', rotulo: 'Conversar' };
  };

  /* ---------- balãozinho do status (pré-desenhado, 1 px = 1 px do ícone) ---------- */
  var bolhas = {};
  function bolha(icone) {
    if (bolhas[icone]) return bolhas[icone];
    var PA = window.PA;
    var ic = PA.iconeDesenho(icone.replace(/️/g, ''));
    var w = 20, h = 23, c = PA.novoCanvas(w, h), ctx = c.getContext('2d');
    function r(x, y, a, b, k) { ctx.fillStyle = k; ctx.fillRect(x, y, a, b); }
    // caixa arredondada com contorno + rabinho
    r(2, 0, 16, 1, CONTORNO); r(2, 19, 16, 1, CONTORNO); r(0, 2, 1, 16, CONTORNO); r(19, 2, 1, 16, CONTORNO);
    r(1, 1, 1, 1, CONTORNO); r(18, 1, 1, 1, CONTORNO); r(1, 18, 1, 1, CONTORNO); r(18, 18, 1, 1, CONTORNO);
    r(2, 1, 16, 18, '#fff8ee'); r(1, 2, 18, 16, '#fff8ee');
    r(2, 17, 16, 1, '#f0dcea'); r(17, 2, 1, 16, '#f0dcea');
    r(8, 19, 4, 1, '#fff8ee'); r(7, 19, 1, 1, CONTORNO); r(12, 19, 1, 1, CONTORNO);
    r(9, 20, 2, 1, '#f0dcea'); r(8, 20, 1, 1, CONTORNO); r(11, 20, 1, 1, CONTORNO);
    r(9, 21, 2, 1, CONTORNO);
    if (ic) ctx.drawImage(ic, 2, 2);
    bolhas[icone] = c;
    return c;
  }

  function fase(npc) {
    var h = 0, s = String(npc.id || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  N.desenhar = function (pintor, npc, x, yPes, t, animar) {
    var f = fase(npc);
    var quadro = 0;
    if (animar) {
      quadro = Math.floor((t + f % 700) / 700) % 2;
      if ((t + f % 3900) % 3900 < 140) quadro |= 2;   // pisca de vez em quando
    }
    if (window.Jogador && window.Jogador.sombra) window.Jogador.sombra(pintor, x, yPes, 5);
    var spr = gerar(npc.sprite, quadro);
    pintor.sprite(spr, x, yPes + 1);
    // ícone de status acima da cabeça, em px da tela (nítido: inteiro de px por px do ícone)
    var st = N.status(npc);
    var b = bolha(st.icone), ctx = pintor.ctx;
    if (!ctx) return;
    var s = Math.max(1, Math.round((pintor.escala || 3) / 2));
    var cabeca = pintor.tela(x, yPes + 1 - spr.height + (spr.topo || 0));
    var bob = animar ? Math.round(Math.sin(t / 420 + (f % 10))) * s : 0;
    var bx = Math.round(cabeca.x - (b.width * s) / 2), by = Math.round(cabeca.y - b.height * s - s + bob);
    var bw = b.width * s, bh = b.height * s;
    var antes = ctx.imageSmoothingEnabled, alfa = ctx.globalAlpha;
    ctx.imageSmoothingEnabled = false;
    // se o balãozinho cobre a Mariana, fica quase transparente (como as placas do mapa)
    if (cobreMariana(pintor, bx, by, bw, bh)) ctx.globalAlpha = alfa * 0.3;
    ctx.drawImage(b, bx, by, bw, bh);
    ctx.globalAlpha = alfa;
    ctx.imageSmoothingEnabled = antes;
  };

  // retângulo do corpo da Mariana (px do jogo, a partir dos pés) cruza o do ícone (px da tela)?
  function cobreMariana(pintor, bx, by, bw, bh) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return false;
    var montada = false;
    try { montada = J.montado && J.montado(); } catch (e) {}
    var w = montada ? 28 : 16, h = montada ? 34 : 24;
    var a = pintor.tela(J.x - w / 2, J.y - h), z = pintor.tela(J.x + w / 2, J.y + 2);
    return bx < z.x && bx + bw > a.x && by < z.y && by + bh > a.y;
  }

  /* ================= FALAS ================= */
  function U() { return Reino.util; }
  function nomeJogadora(t) { return String(t).replace(/\{nome\}/g, Reino.config.nomeJogadora); }
  function valorSala(m) { return Reino.config.valorPorMateria / m.salas.length; }
  function reais(v) { return U().reais(v); }

  // falas padrão (curtas: até ~30 letras por balão, que no celular dá 2 linhas)
  var PADRAO = {
    sala: {
      nova: ['Sala novinha! Leia com calma. 📖'],
      feita: ['Quer jogar esta sala de novo? 🔁'],
      depois: ['Que orgulho de você! ✨', 'Leu com calma até o fim! 💛'],
    },
    treino: {
      oi: ['Oi! Eu cuido do treino. 🥇'],
      nova: ['Vamos treinar, sem pressa? 🥇'],
      feita: ['Quer treinar de novo? 🥇'],
      bloqueada: ['Primeiro, termine as salas. 🔒'],
      depois: ['Revisou tudo? Coisa de campeã! 🏆'],
    },
    prova: {
      oi: ['Oi! Eu cuido desta prova. 📝'],
      nova: ['Vamos fazer a prova com calma? 📝'],
      feita: ['Prêmio ganho! Vamos treinar? ✏️'],
      depois: ['Muito bem! Tudo com calma! 💛'],
    },
    guia: {
      oi: ['Oi! Que bom te ver por aqui! 😄'],
      nova: ['Quer ver a lista? 📋'],
    },
    tela: {
      oi: ['Oi! Que bom te ver por aqui! 😄'],
      depois: ['Até logo! Volte sempre! 💛'],
      nova: {
        estabulo: 'Quer ver seus unicórnios? 🦄', loja: 'Quer ver os enfeites da loja? ⭐', bau: 'Quer ver o seu tesouro? 💰',
        plano: 'Quer ler o Plano da Prova? 📜', ovos: 'Vamos chocar os ovinhos? 🥚', livro: 'Quer ler o livro? 📖',
      },
    },
  };
  var SAIU = 'Tudo bem, volte quando quiser! 💛';
  var OVOS = 'Tem ovinho para chocar! 🥚';
  // raro da sala: tudo certo de primeira E com calma, OU jogar a sala 3 vezes
  var CALMA = 'Ou de primeira, com calma! 🌙';
  var RARO_JA = 'O raro desta sala já nasceu! 💙';
  var VALE = {
    lendario: 'Agora vale um prêmio lendário! 🌈',
    raro: 'Agora vale um prêmio raro! 💙',
    comum: 'Agora vale um prêmio comum! 🤍',
  };
  // épicos do treino: ouro (ou 3 treinos) e nota dez (ou 5 treinos)
  var OU_EPICO = { ouro: 'Ou tire ouro, com calma! 🥇', perfeito: 'Ou acerte as dez, com calma!' };
  // números por extenso (a voz lê "2 salas" como "dois salas"); acima de 20, algarismos
  var EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
    'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
  function extenso(n, fem) {
    if (n < 0 || n > 20 || n !== Math.floor(n)) return String(n);
    if (fem && n === 1) return 'uma';
    if (fem && n === 2) return 'duas';
    return EXTENSO[n];
  }
  N.extenso = extenso;
  function faltamSalas(n) { return n === 1 ? 'Falta só uma sala! 💪' : 'Faltam ' + extenso(n, true) + ' salas! 💪'; }
  function dicaRaro(n) { return n === 1 ? 'Mais uma vez e o raro nasce! 💙' : 'Mais ' + extenso(n, true) + ' vezes e o raro nasce! 💙'; }
  function dicaEpico(n) { return n === 1 ? 'Falta um treino para o épico!' : 'Faltam ' + extenso(n) + ' treinos pro épico!'; }
  function resumoFeitas(n, total) {
    return n === total ? 'Você fez as ' + extenso(total, true) + ' salas! 🎉' : 'Você fez ' + extenso(n, true) + ' de ' + extenso(total, true) + ' salas.';
  }
  function resumoDinheiro(v) { return 'Já ganhou ' + reais(v) + '! 💰'; }
  function resumoProxima(m, s, primeira) {
    return (primeira ? 'A primeira é a Sala ' : 'Agora vamos para a Sala ') + (m.salas.indexOf(s) + 1) + '! ' + (s.emoji || '');
  }
  var RESUMO_ZERO = 'Você ainda não fez salas.';
  var RESUMO_FIM = 'O treino do Castelo já abriu! 🥇';

  // lista de falas do NPC para um momento (as dele, ou as padrão)
  function falas(npc, tipo) {
    var l = (npc.falas && npc.falas[tipo]) || [];
    if (l.length) return l.map(nomeJogadora);
    var a = npc.acao || {};
    if (tipo === 'oi' && a.tipo === 'sala') { var s = salaDe(a); return s ? [s.intro] : []; }
    var pad = PADRAO[a.tipo] || PADRAO.guia;
    if (tipo === 'nova' && a.tipo === 'tela') return [pad.nova[a.tela] || PADRAO.tela.nova.estabulo];
    if (tipo === 'saiu') return [SAIU];
    return (pad[tipo] || (tipo === 'oi' ? PADRAO.guia.oi : [])).slice();
  }
  function uma(npc, tipo) { var l = falas(npc, tipo); return l.length ? U().sortear(l) : ''; }

  function nomeLivro(m) { return (Reino.UI && Reino.UI.nomeLivro) ? Reino.UI.nomeLivro(m) : (m.nomeLivro || 'Livro das Memórias'); }

  // junta os pedaços em balões de até ~2 linhas (a última página leva os botões)
  var LIMITE = 30;
  // divide um texto em frases (o emoji fica com a frase dele); frase longa demais
  // ainda é cortada nos dois-pontos / ponto e vírgula. Cada frase é um segmento gravado.
  var RE_FRASE = /([.!?…]+[»"”)]*(?:\s*[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]+)*)\s+/gu;
  function frases(t) {
    t = String(t || '').trim();
    var out = [], ult = 0, m;
    RE_FRASE.lastIndex = 0;
    while ((m = RE_FRASE.exec(t))) { out.push(t.slice(ult, m.index + m[1].length).trim()); ult = RE_FRASE.lastIndex; }
    if (t.slice(ult).trim()) out.push(t.slice(ult).trim());
    var res = [];
    out.forEach(function (f) {
      if (tamanho(f) <= LIMITE || !/[:;]\s/.test(f)) { res.push(f); return; }
      f.replace(/([:;])\s+/g, '$1\n').split('\n').forEach(function (p) { if (p.trim()) res.push(p.trim()); });
    });
    return res.filter(function (f) { return /[\p{L}\p{N}]/u.test(f); });
  }
  N.frases = frases;
  // lista de textos → páginas (cada texto vira frases; frases curtas juntam até LIMITE)
  function paginas(textos) { return paginar([].concat.apply([], (textos || []).map(frases))); }
  function tamanho(t) { return String(t).replace(/[«»]/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').trim().length; }
  function paginar(segs) {
    var pags = [], atual = [], n = 0;
    segs.filter(Boolean).forEach(function (sg) {
      var t = tamanho(sg);
      if (atual.length && n + 1 + t > LIMITE) { pags.push(atual); atual = []; n = 0; }
      atual.push(sg); n += (n ? 1 : 0) + t;
    });
    if (atual.length) pags.push(atual);
    return pags;
  }
  N.paginar = paginar;

  var VAMOS = [{ texto: 'Vamos! ✨', valor: 'vamos', principal: true }, { texto: 'Agora não', valor: 'nao' }];

  // o convite conforme o estado atual → { segs, botoes, extra }
  function convite(npc) {
    var a = npc.acao || {}, p = P(), est = p.estado(), pers = Reino.config.persistencia;
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (!s) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      var reg = est.salas[s.id] || {};
      if (!reg.feita) return { segs: [uma(npc, 'nova')], botoes: VAMOS, extra: N.chips(npc) };
      // a dica do caminho da persistência vem antes; a pergunta fica junto dos botões
      var segs = [], raro = raroDaSala(m, s);
      if (raro && p.temUni(raro.id)) segs.push(RARO_JA);
      else if (raro) {
        var f = p.faltamPersistencia({ raridade: 'raro', sala: s.id });
        if (f > 0) { segs.push(dicaRaro(f)); segs.push(CALMA); }
      }
      segs.push(uma(npc, 'feita'));
      return { segs: segs, botoes: VAMOS, extra: N.chips(npc) };
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (!mt) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      if (!p.materiaCompleta(mt)) {
        return { segs: [uma(npc, 'bloqueada'), faltamSalas(mt.salas.length - p.salasFeitas(mt))], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      }
      var t = est.treinos[mt.id] || {};
      if (!t.melhor) return { segs: [uma(npc, 'nova')], botoes: VAMOS };
      var sg = [];
      var dica = null;
      ['ouro', 'perfeito'].forEach(function (tipo) {
        if (dica) return;
        var ep = (mt.unicornios || []).find(function (u) { return u.raridade === 'epico' && u.treino === tipo; });
        if (!ep || p.temUni(ep.id)) return;
        var n = p.faltamPersistencia({ raridade: 'epico', treino: tipo, materiaId: mt.id });
        if (n > 0) dica = [dicaEpico(n), OU_EPICO[tipo]];
      });
      if (dica) sg = sg.concat(dica);
      sg.push(uma(npc, 'feita'));
      return { segs: sg, botoes: VAMOS };
    }
    if (a.tipo === 'prova') {
      if (!Reino.prova(a.prova)) return { segs: [uma(npc, 'nova')], botoes: [{ texto: 'Ok', valor: 'ok', principal: true }] };
      var v = p.valendoProva(Reino.prova(a.prova));
      if (v) return { segs: [VALE[v], uma(npc, 'nova')], botoes: VAMOS };
      return { segs: [uma(npc, 'feita')], botoes: VAMOS };
    }
    if (a.tipo === 'guia') {
      var mg = materiaDoLugar(a.lugar), bts = [{ texto: 'Ver a lista 📋', valor: 'lista', principal: true }];
      var livro = a.livro ? Reino.materia(a.livro) : mg;
      if (livro && livro.livro) bts.push({ texto: '📖 ' + nomeLivro(livro), valor: 'livro' });
      bts.push({ texto: 'Agora não', valor: 'nao' });
      if (!mg) return { segs: [uma(npc, 'nova')], botoes: bts };
      var feitas = p.salasFeitas(mg), total = mg.salas.length;
      if (!total) return { segs: [uma(npc, 'nova')], botoes: bts };
      var prox = mg.salas.find(function (s2) { return !(est.salas[s2.id] && est.salas[s2.id].feita); });
      var r;
      if (feitas === 0) r = [RESUMO_ZERO, resumoProxima(mg, prox, true)];
      else if (feitas === total) r = [resumoFeitas(total, total), resumoDinheiro(p.dinheiroMateria(mg)), RESUMO_FIM];
      else r = [resumoFeitas(feitas, total), resumoDinheiro(p.dinheiroMateria(mg)), resumoProxima(mg, prox, false)];
      return { segs: r, botoes: bts };
    }
    // tela
    var sgt = [uma(npc, 'nova')];
    if ((a.tela === 'estabulo') && p.ovosParaChocar().length) sgt.unshift(OVOS);
    return { segs: sgt, botoes: VAMOS };
  }

  // tudo o que o NPC pode dizer (para gravar as vozes), com os números enumerados
  N.falasPossiveis = function (npc, def) {
    var out = [], a = npc.acao || {}, voz = npc.voz || 'narradora', pers = Reino.config.persistencia;
    // mesmos segmentos que o balão fala: cada texto dividido em frases
    function add(t) { frases(t).forEach(function (f) { if (!out.some(function (o) { return o.texto === f; })) out.push({ texto: f, voz: voz }); }); }
    ['oi', 'nova', 'feita', 'bloqueada', 'depois'].forEach(function (tipo) { falas(npc, tipo).forEach(add); });
    if (a.tipo === 'sala' || a.tipo === 'treino' || a.tipo === 'prova') add(SAIU);
    if (a.tipo === 'sala') {
      var m = materiaDe(a), s = salaDe(a);
      if (m && s && raroDaSala(m, s)) {
        for (var n = 1; n <= pers.sala; n++) add(dicaRaro(n));
        add(CALMA); add(RARO_JA);
      }
    }
    if (a.tipo === 'treino') {
      var mt = materiaDe(a);
      if (mt) {
        for (var f = 1; f <= mt.salas.length; f++) add(faltamSalas(f));
        (mt.unicornios || []).forEach(function (u) {
          if (u.raridade !== 'epico' || !u.treino) return;
          var max = u.treino === 'ouro' ? pers.treinoOuro : pers.treinoPerfeito;
          for (var k = 1; k <= max; k++) add(dicaEpico(k));
          add(OU_EPICO[u.treino]);
        });
      }
    }
    if (a.tipo === 'prova') Object.keys(VALE).forEach(function (k) { add(VALE[k]); });
    if (a.tipo === 'guia') {
      var mg = materiaDoLugar(a.lugar);
      if (mg) {
        var total = mg.salas.length;
        add(RESUMO_ZERO); add(RESUMO_FIM);
        for (var i = 1; i <= total; i++) { add(resumoFeitas(i, total)); add(resumoDinheiro(Math.round(valorSala(mg) * i * 100) / 100)); }
        mg.salas.forEach(function (s2, j) { if (j === 0) add(resumoProxima(mg, s2, true)); add(resumoProxima(mg, s2, false)); });
      }
    }
    if (a.tipo === 'tela' && a.tela === 'estabulo') add(OVOS);
    return out;
  };

  /* ---------- chips da sala (iguais aos da tela da matéria) ---------- */
  N.chips = function (npc) {
    var a = npc.acao || {};
    if (a.tipo !== 'sala') return null;
    var m = materiaDe(a), s = salaDe(a);
    if (!s) return null;
    var el = U().el, p = P(), reg = p.estado().salas[s.id] || {}, raro = raroDaSala(m, s);
    return el('span.sala-chips',
      el('span.chip-mini', '💰 ' + reais(p.valorSala(m))),
      reg.feita ? el('span.chip-mini.ok', '✓ Feita') : el('span.chip-mini.nova', 'Nova!'),
      raro && p.temUni(raro.id) ? el('span.chip-mini.raro', '💙 Raro') : null,
      reg.calma ? el('span.chip-mini.calma', '🌙 Calma') : null);
  };

  /* ================= AÇÕES ================= */
  function contarTelas() { return document.querySelectorAll('#telas > .tela').length; }
  // abre uma tela e resolve quando ela (e o que abriu por cima) fechar
  function esperarTela(abrir) {
    var antes = contarTelas();
    try { abrir(); } catch (e) { console.error(e); return Promise.resolve(null); }
    var aberta = contarTelas();
    if (aberta <= antes) return Promise.resolve(null);
    return new Promise(function (resolver) {
      var fechada = 0;
      var timer = setInterval(function () {
        // duas conferências seguidas: telas que fecham e reabrem na hora não contam
        fechada = contarTelas() < aberta ? fechada + 1 : 0;
        if (fechada >= 2) { clearInterval(timer); resolver(null); }
      }, 150);
    });
  }
  function fimDaAtividade(resolver) {
    return function (premios) { U().emit('mapaMudou'); resolver(premios || null); };
  }

  // texto já gravado inteiro (frase do unicórnio): as páginas aparecem na tela uma de cada vez,
  // mas a voz fala o texto INTEIRO na 1ª página (é o que está gravado); as outras ficam em silêncio.
  var OK = [{ texto: 'Ok! 👍', valor: 'ok', principal: true }];
  // só para a TELA: frase longa sem ponto quebra nas vírgulas ou entre palavras (a voz não muda)
  function quebrarNaTela(t) {
    if (tamanho(t) <= LIMITE) return [t];
    var partes = t.split(/(,\s+)/).reduce(function (acc, p, i) { if (i % 2) acc[acc.length - 1] += p.trim(); else acc.push(p); return acc; }, []);
    if (partes.length === 1) {
      // sem vírgula: corta entre palavras perto do meio (as duas metades ficam parecidas)
      var pal = t.split(/\s+/), melhor = 1, pior = Infinity;
      for (var k = 1; k < pal.length; k++) {
        var m = Math.max(tamanho(pal.slice(0, k).join(' ')), tamanho(pal.slice(k).join(' ')));
        if (m < pior) { pior = m; melhor = k; }
      }
      return [].concat(quebrarNaTela(pal.slice(0, melhor).join(' ')), quebrarNaTela(pal.slice(melhor).join(' ')));
    }
    var out = [], atual = '';
    partes.forEach(function (p) {
      var junto = atual ? atual + ' ' + p : p;
      if (atual && tamanho(junto) > LIMITE) { out.push(atual); atual = p; } else atual = junto;
    });
    if (atual) out.push(atual);
    // se ainda sobrou pedaço longo (vírgulas), quebra esse entre palavras
    return [].concat.apply([], out.map(function (o) { return tamanho(o) > LIMITE && /,/.test(t) && o !== t ? quebrarNaTela(o.replace(/,\s*$/, ',')) : [o]; }));
  }
  function falarPaginado(texto, quem) {
    var pags = [].concat.apply([], paginas([texto]).map(function (pg) { return quebrarNaTela(pg.join(' ')).map(function (x) { return [x]; }); })), i = 0;
    if (!pags.length) pags = [[texto]];
    function prox(v) {
      if (v === null || v === undefined) return null;
      var pg = pags[i], ultima = i === pags.length - 1, op = { quem: quem, modal: true, voz: quem.voz,
        botoes: ultima ? OK : [{ texto: 'Continuar →', valor: 'ok', principal: true }] };
      if (i === 0) op.fala = [texto]; else op.falar = false;
      i++;
      var r = Reino.Claude.falar(pg.join(' '), op);
      return ultima ? r : r.then(prox);
    }
    return prox('ok');
  }

  N.BAIA_VAZIA = 'Aqui vai morar um amigo novo! 🦄';
  // baia fixa: a baia n é sempre do n-ésimo unicórnio do álbum; vazia (null) até ele nascer
  N.unicornioDaBaia = function (n) {
    var est = P().estado(), d = Reino.Unicornios.todos(est.corInicial)[n];
    return d && est.unis[d.id] && est.unis[d.id].chocado ? d : null;
  };
  // unicórnios já chocados, na ordem do álbum do Estábulo
  N.unicorniosChocados = function () {
    var est = P().estado();
    return Reino.Unicornios.todos(est.corInicial).filter(function (d) { return est.unis[d.id] && est.unis[d.id].chocado; });
  };

  /* telas e ações de outros módulos (Pet Shop, Observatório):
     registrarTela('petshop', abrir(acao, ctx), 'Quer ver as comidinhas? 🥕') — abre uma tela do DOM;
       o NPC espera ela fechar e se despede; o texto é o convite padrão de NPC com essa tela.
     registrarAcao('beber', fn(acao, ctx) → Promise) — ação de objeto ou NPC ({ tipo: 'beber' }). */
  var TELAS = {}, ACOES = {};
  N.registrarTela = function (nome, abrir, convite) { TELAS[nome] = abrir; if (convite) PADRAO.tela.nova[nome] = convite; };
  N.registrarAcao = function (tipo, fn) { ACOES[tipo] = fn; };
  N.telas = function () { return Object.keys(TELAS); };
  N.acoes = function () { return Object.keys(ACOES); };

  N.executar = function (acao, ctx) {
    acao = acao || {};
    var UI = Reino.UI, p = P();
    if (acao.tipo === 'sala') {
      var m = materiaDe(acao), s = salaDe(acao);
      if (!s) return Promise.resolve(null);
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Missao.iniciar(m, s, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'treino') {
      var mt = materiaDe(acao);
      if (!mt) return Promise.resolve(null);
      if (!p.materiaCompleta(mt)) {
        Reino.Claude.falar(Reino.Falas.treinoBloqueado(mt, mt.salas.length - p.salasFeitas(mt)));
        return Promise.resolve(null);
      }
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Prova.iniciar(mt, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'prova') {
      var pv = Reino.prova(acao.prova);
      if (!pv) return Promise.resolve(null);
      Reino.Som.tocar('porta');
      return new Promise(function (res) { Reino.Provas.iniciar(pv, fimDaAtividade(res)); });
    }
    if (acao.tipo === 'tela') {
      var fim = function (r) { U().emit('mapaMudou'); return r || null; };
      switch (acao.tela) {
        case 'ovos': return UI.chocarOvos(p.ovosParaChocar()).then(fim);
        case 'livro': var ml = Reino.materia(acao.materia); return ml ? esperarTela(function () { UI.abrirLivro(ml); }).then(fim) : Promise.resolve(null);
        case 'plano': return esperarTela(UI.telaPlano).then(fim);
        case 'loja': return esperarTela(UI.telaLoja).then(fim);
        case 'estabulo': return esperarTela(UI.telaEstabulo).then(fim);
        case 'bau': return esperarTela(UI.telaBau).then(fim);
      }
      if (TELAS[acao.tela]) return esperarTela(function () { TELAS[acao.tela](acao, ctx); }).then(fim);
      return Promise.resolve(null);
    }
    if (ACOES[acao.tipo]) {
      try { return Promise.resolve(ACOES[acao.tipo](acao, ctx || {})).catch(function (e) { console.error(e); return null; }); }
      catch (e) { console.error(e); return Promise.resolve(null); }
    }
    if (acao.tipo === 'unicornio') {
      // o unicórnio da baia diz a frase que já está gravada (o nome que ela deu só aparece na tela)
      var du = N.unicornioDaBaia(acao.indice || 0);
      if (!du) return falarPaginado(N.BAIA_VAZIA, { nome: 'Baia', voz: 'narradora' });
      var uu = p.estado().unis[du.id];
      var spr = PA.unicornio(du, Reino.Unicornios.estagio(uu ? uu.xp : 0), 0).canvas;
      Reino.Som.tocar('selecionar');
      return falarPaginado(du.frase, { nome: p.nomeUni(du.id), retrato: spr, voz: 'unicornio' });
    }
    if (acao.tipo === 'guia') {
      var mg = materiaDoLugar(acao.lugar);
      if (mg) return esperarTela(function () { UI.telaMateria(mg); });
      if (acao.lugar === 'castelo') return esperarTela(UI.telaCastelo);
      if (acao.lugar === 'escola') return esperarTela(Reino.Provas.telaEscola);
    }
    return Promise.resolve(null);
  };

  /* ================= CONVERSA ================= */
  var conversou = {};     // quem já se apresentou nesta sessão (só na memória, nada no save)
  var semVoz = {};        // quantas vezes a apresentação saiu sem voz (pacote ainda vindo)
  var MAX_SEM_VOZ = 3;    // depois disso não insiste mais (pacote que não vem nunca)
  var emConversa = null;

  function apresentacaoComVoz(npc, pags) {
    var V = Reino.Voz, est = Reino.Progresso && Reino.Progresso.estado();
    semVoz[npc.id] = semVoz[npc.id] || 0;
    if (!V || !V.tem || (est && est.ajustes && est.ajustes.voz === false)) return true;   // voz desligada: nada a esperar
    return pags.every(function (segs) {
      return segs.filter(Boolean).every(function (t) { return V.tem(npc.voz || 'claude', t); });
    });
  }

  N.interagir = function (npc, ctx) {
    if (emConversa) return emConversa;
    var a = npc.acao || {};
    var quem = { nome: npc.nome, retrato: [N.retrato(npc, 0), N.retrato(npc, 1)], voz: npc.voz };
    function balao(segs, op) {
      segs = segs.filter(Boolean);
      return Reino.Claude.falar(segs.join(' '), Object.assign({ quem: quem, fala: segs, modal: true, voz: npc.voz }, op || {}));
    }
    var CONTINUAR = { botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] };
    // mostra as páginas em sequência com "Continuar →"; para se o balão for limpo
    function emSequencia(pags) {
      var i = 0;
      function prox(v) {
        if (v === null || v === undefined || i >= pags.length) return v;
        return balao(pags[i++], CONTINUAR).then(prox);
      }
      return prox('ok');
    }
    var seq = Promise.resolve('ok');
    if (!conversou[npc.id]) {
      // a apresentação inteira (todas as falas de `oi`, na ordem), cada uma em sua(s) página(s)
      var pagsOi = [].concat.apply([], falas(npc, 'oi').map(function (t) { return paginas([t]); }));
      // só conta como apresentada se ela ouviu tudo com voz; se o pacote de voz ainda está
      // chegando (Wi-Fi fraco), na próxima conversa a apresentação volta, já com voz
      if (apresentacaoComVoz(npc, pagsOi) || ++semVoz[npc.id] >= MAX_SEM_VOZ) conversou[npc.id] = true;
      seq = emSequencia(pagsOi);
    }
    emConversa = seq.then(function (v) {
      if (v === null || v === undefined) return null;     // balão limpo no meio: não segue
      var c = convite(npc), pags = paginas(c.segs), i = 0;
      // páginas do meio com "Continuar →"; a última com os botões e os chips
      function proxima(v2) {
        if (v2 === null || v2 === undefined) return null;
        var ultima = i === pags.length - 1, pg = pags[i++];
        if (ultima) return balao(pg, { botoes: c.botoes, extra: c.extra || null });
        return balao(pg, { botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] }).then(proxima);
      }
      return proxima('ok');
    }).then(function (v) {
      if (v === 'livro') {
        var ml = a.livro ? Reino.materia(a.livro) : materiaDoLugar(a.lugar);
        return N.executar({ tipo: 'tela', tela: 'livro', materia: ml && ml.id });
      }
      // a ação sabe quem a chamou (ex.: a curiosidade contada com o retrato e a voz da Doutora Vega)
      ctx = Object.assign({ npc: npc, quem: quem }, ctx || {});
      if (v === 'lista') return N.executar(a, ctx);
      if (v !== 'vamos') return null;
      var atividade = a.tipo === 'sala' || a.tipo === 'treino' || a.tipo === 'prova';
      return N.executar(a, ctx).then(function (premios) {
        if (a.tipo === 'tela') {
          // a tela aberta pelo NPC fechou: ele se despede (balão simples, fecha sozinho)
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
          return premios;
        }
        // ação que termina no "Tchau! 💛" (curiosidade da Vega, piada do Cosmo): ele se despede
        if (premios === 'tchau') {
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
          return premios;
        }
        if (!atividade) return premios;
        if (premios) {
          paginas([uma(npc, 'depois')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz }); });
          if (a.tipo === 'sala') Reino.Claude.depoisDaMissao();
        } else {
          paginas([uma(npc, 'saiu')]).forEach(function (pg) { Reino.Claude.falar(pg.join(' '), { quem: quem, fala: pg, voz: npc.voz, tempo: 5000 }); });
        }
        return premios;
      });
    }).catch(function (e) { console.error(e); return null; }).then(function (r) { emConversa = null; return r; });
    return emConversa;
  };

  /* ================= ELENCO =================
     Parâmetros propostos para cada personagem (os prédios reaproveitam: sprite e voz). */
  N.ELENCO = {
    // Museu das Memórias (História)
    memoria: { nome: 'Dona Memória', voz: 'npc-memoria', sprite: { idade: 'idoso', pele: '#f1c7a5', cabelo: '#e4e0ec', penteado: 'coque', roupa: '#9b6bd6', roupa2: '#6b4a9a', perna: 'saia', oculos: true, colar: true, cor2: '#ff9cc6', cracha: true } },
    antonio: { nome: 'Seu Antônio', voz: 'npc-antonio', sprite: { idade: 'idoso', pele: '#e0ac86', cabelo: '#d8d4e0', penteado: 'careca', bigode: true, roupa: '#7aa37a', roupa2: '#6b5a4a', bengala: true, carta: true, colete: '#a86b4a' } },
    chico: { nome: 'Carteiro Chico', voz: 'npc-chico', sprite: { pele: '#a86b4a', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#2f6fd6', cor2: '#ffd34d', roupa: '#8fd0ff', roupa2: '#2f4f8a', bolsa: true, bolsaCor: '#c9733a' } },
    taina: { nome: 'Guia Tainá', voz: 'npc-taina', sprite: { pele: '#c68a5e', cabelo: '#1f1414', penteado: 'chanel', roupa: '#39c5bb', roupa2: '#2d6b66', cracha: true, cor2: '#ff9d2e', colar: '#ff6b8a' } },
    contadeira: { nome: 'Vovó Contadeira', voz: 'npc-contadeira', sprite: { idade: 'idoso', pele: '#7a4a32', cabelo: '#e4e0ec', penteado: 'coque', chapeu: 'turbante', chapeuCor: '#ff9d2e', cor2: '#39a860', roupa: '#e0433f', roupa2: '#ffb020', perna: 'vestido', estampa: 'bolinhas', colar: '#ffe066' } },
    nina: { nome: 'Restauradora Nina', voz: 'npc-nina', sprite: { pele: '#ffe0c7', cabelo: '#c2532b', penteado: 'rabo', roupa: '#ffd1e6', roupa2: '#4a5a8a', avental: true, aventalCor: '#c9a27a', pincel: true, oculos: true, cor2: '#5fb4ff' } },
    // Torre do Relógio (Inglês)
    ponteiro: { nome: 'Relojoeiro Seu Ponteiro', voz: 'npc-ponteiro', sprite: { idade: 'idoso', pele: '#f1c7a5', cabelo: '#cfc8d8', penteado: 'careca', bigode: true, oculos: true, oculosCor: '#b8651a', roupa: '#f4f2fa', colete: '#8a3b3b', corrente: true, roupa2: '#3a3a5a', gravata: '#2f6fd6' } },
    ben: { nome: '«Coach Ben»', voz: 'npc-ben', sprite: { pele: '#7a4a32', cabelo: '#2b1b17', penteado: 'curto', chapeu: 'bone', chapeuCor: '#e0433f', cor2: '#ffffff', roupa: '#ff9d2e', estampa: 'listras', roupa2: '#2f4f8a', perna: 'short', apito: true, sapato: '#f4f2fa' } },
    stella: { nome: '«Miss Stella»', voz: 'npc-stella', sprite: { pele: '#d9a07a', cabelo: '#2b1b17', penteado: 'black', roupa: '#5a6ad0', roupa2: '#2a2f66', perna: 'saia', capa: true, capaCor: '#1f2a5a', capaEstrelas: true, presilha: true, cor2: '#ffe066' } },
    smile: { nome: '«Doctor Smile»', voz: 'npc-smile', sprite: { pele: '#ffe0c7', cabelo: '#e8c16a', penteado: 'espetado', jaleco: true, roupa: '#5fb4ff', roupa2: '#5f6a84', espelhoTesta: true } },
    moon: { nome: '«Miss Moon»', voz: 'npc-moon', sprite: { pele: '#a86b4a', cabelo: '#3a2320', penteado: 'trancas', chapeu: 'gorro', chapeuCor: '#7c5cff', roupa: '#9b7bff', roupa2: '#7c5cff', perna: 'vestido', estampa: 'estrelas', cor2: '#ffe066' } },
    joy: { nome: '«Mister Joy»', voz: 'npc-joy', sprite: { pele: '#d9a07a', cabelo: '#5a3825', penteado: 'cacheado', chapeu: 'cartola', chapeuCor: '#ff4f9a', cor2: '#ffd34d', roupa: '#ffd34d', roupa2: '#6b3fc4', gravata: '#ff4f9a', violao: true } },
    // Castelo da Medalha
    serena: { nome: 'Princesa Serena', voz: 'npc-serena', sprite: { pele: '#ffe0c7', cabelo: '#f2c14e', penteado: 'longo', chapeu: 'coroa', roupa: '#ffb3d9', roupa2: '#ff8ac4', perna: 'vestido', colar: true, cor2: '#b58cff' } },
    aurora: { nome: 'Cavaleira Aurora', voz: 'npc-aurora', sprite: { pele: '#d9a07a', cabelo: '#a0673a', penteado: 'rabo', chapeu: 'elmo', cor2: '#ff6b8a', armadura: true, roupa: '#ff7eb6' } },
    oliver: { nome: '«Sir Oliver»', voz: 'npc-oliver', sprite: { pele: '#f1c7a5', cabelo: '#c2532b', penteado: 'curto', bigode: true, chapeu: 'elmo', cor2: '#5fb4ff', armadura: true, roupa: '#2f6fd6', capa: true, capaCor: '#c9365a' } },
    // Escola do Reino
    margarida: { nome: 'Diretora Margarida', voz: 'npc-margarida', sprite: { pele: '#d9a07a', cabelo: '#6b5a66', penteado: 'coque', oculos: true, flor: true, roupa: '#39a860', roupa2: '#2d6b4a', perna: 'saia', cor2: '#ffd34d', colar: true } },
    helena: { nome: 'Professora Helena', voz: 'npc-helena', sprite: { pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'chanel', roupa: '#ff9d2e', roupa2: '#6b4a9a', perna: 'saia', livro: '#5fb4ff', cor2: '#5fb4ff', oculos: true, oculosCor: '#c9365a' } },
    emma: { nome: '«Teacher Emma»', voz: 'npc-emma', sprite: { pele: '#ffe0c7', cabelo: '#a0673a', penteado: 'longo', chapeu: 'boina', chapeuCor: '#d63d63', cachecol: true, cachecolCor: '#2f4f8a', roupa: '#8fd0ff', roupa2: '#2f4f8a', perna: 'saia', livro: '#d63d63' } },
    // Estábulo, Loja e Baú
    feno: { nome: 'Seu Feno', voz: 'npc-feno', sprite: { pele: '#e0ac86', cabelo: '#a0673a', penteado: 'curto', barba: true, chapeu: 'palha', roupa: '#e0433f', estampa: 'xadrez', roupa2: '#4a6fb0', jardineira: true, cor2: '#ffd34d' } },
    petala: { nome: 'Fada Pétala', voz: 'npc-petala', sprite: { base: 'fada', pele: '#ffe0c7', cabelo: '#ff9cc6', penteado: 'rabos', chapeu: 'flores', roupa: '#b58cff', roupa2: '#ff9cc6', varinha: true, cor2: '#ffe066' } },
    tostao: { nome: 'Dragãozinho Tostão', voz: 'npc-tostao', sprite: { base: 'dragao', corpo: '#f0a04a', barriga: '#fff0c4', asa: '#ff7a3d', moeda: true } },
    // Pet Shop
    aveia: { nome: 'Dona Aveia', voz: 'npc-aveia', sprite: { pele: '#e0ac86', cabelo: '#c2532b', penteado: 'rabos', chapeu: 'lenco', chapeuCor: '#ff9cc6', roupa: '#8fd08f', roupa2: '#4a7a4a', perna: 'saia', avental: true, aventalCor: '#fff1d0', cor2: '#ff8a3d', colar: '#ffd34d' } },
    // Observatório (o Cosmo usa a base 'robo', registrada pelo Observatório com N.registrarBase)
    vega: { nome: 'Doutora Vega', voz: 'npc-vega', sprite: { pele: '#a86b4a', cabelo: '#3a2320', penteado: 'coque', jaleco: true, roupa: '#5a6ad0', roupa2: '#2a2f66', oculos: true, oculosCor: '#ffd34d', presilha: true, cor2: '#ffe066' } },
    cosmo: { nome: 'Robô Cosmo', voz: 'npc-cosmo', sprite: { base: 'robo', corpo: '#b8c4d8', detalhe: '#5fb4ff', antena: '#ff5c8a' } },
  };

  Reino.NPCs = N;
})();
