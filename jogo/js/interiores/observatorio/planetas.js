/* Observatório, a arte do prédio, parte 1 de 4: utilidades de pixel (cores com memo, sorteio com
   semente, a grade Buf) e o desenho do Sol, dos 8 planetas e de Plutão (sprites com contorno).
   O que as outras partes usam fica em Reino._predios.observatorioCenas (ver o fim do arquivo).
   No carregamento só registra funções: nada de DOM, canvas nem PA aqui fora (as ferramentas em
   Node o carregam num vm sem DOM). Tudo que cria canvas fica cacheado. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var CONTORNO = '#3a2446';
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (Reino._predios = Reino._predios || {}).observatorioCenas = {};
  /* ================= UTILIDADES ================= */
  // cores: PA.cor só existe no navegador (chamado só dentro das funções); memo para não refazer
  var memoCor = {};
  function esc(c, t) { var k = 'e' + c + t; return memoCor[k] || (memoCor[k] = window.PA.cor.escurecer(c, t)); }
  function cla(c, t) { var k = 'c' + c + t; return memoCor[k] || (memoCor[k] = window.PA.cor.clarear(c, t)); }
  function mis(a, b, t) { var k = 'm' + a + b + t; return memoCor[k] || (memoCor[k] = window.PA.cor.misturar(a, b, t)); }

  // gerador pseudoaleatório com semente (a cena sai sempre igual)
  function rng(semente) {
    var s = semente >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // grade de pixels (cor por pixel) que vira canvas uma vez só, juntando as sequências da mesma cor
  function Buf(w, h) { this.w = w; this.h = h; this.c = new Array(w * h); }
  Buf.prototype.p = function (x, y, cor) {
    if (!cor || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.c[y * this.w + x] = cor;
  };
  Buf.prototype.g = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.c[y * this.w + x] || null;
  };
  Buf.prototype.r = function (x, y, w, h, cor) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.p(x + i, y + j, cor); };
  // contorno de 1 px por fora de tudo que está pintado (4 vizinhos), como o PA.contornar
  Buf.prototype.contornar = function (cor) {
    var fora = [];
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      if (this.g(x, y)) continue;
      if (this.g(x - 1, y) || this.g(x + 1, y) || this.g(x, y - 1) || this.g(x, y + 1)) fora.push(x, y);
    }
    for (var k = 0; k < fora.length; k += 2) this.p(fora[k], fora[k + 1], cor || CONTORNO);
    return this;
  };
  // copia o que está pintado para outra grade
  Buf.prototype.estampar = function (dst, ox, oy) {
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var k = this.c[y * this.w + x];
      if (k) dst.p(x + (ox || 0), y + (oy || 0), k);
    }
  };
  Buf.prototype.pintarEm = function (ctx, ox, oy) {
    for (var y = 0; y < this.h; y++) {
      var x = 0;
      while (x < this.w) {
        var k = this.c[y * this.w + x];
        if (!k) { x++; continue; }
        var x0 = x;
        while (x < this.w && this.c[y * this.w + x] === k) x++;
        ctx.fillStyle = k;
        ctx.fillRect(ox + x0, oy + y, x - x0, 1);
      }
    }
  };
  Buf.prototype.canvas = function () {
    var c = window.PA.novoCanvas(this.w, this.h);
    this.pintarEm(c.getContext('2d'), 0, 0);
    return c;
  };

  // círculo cheio com o miolo no pixel (cx, cy), raio inteiro (igual ao do mapa)
  function discoBuf(B, cx, cy, raio, cor) {
    for (var j = -raio; j <= raio; j++) {
      var meia = Math.floor(Math.sqrt(raio * raio - j * j) + 0.35);
      for (var i = -meia; i <= meia; i++) B.p(cx + i, cy + j, cor);
    }
  }
  // estrelinha: tam 1 = pontinho, 2 = cruzinha, 3 = cruz maior, 4 = cruz com brilhos nas diagonais
  function estrela(B, x, y, tam, cor, miolo) {
    miolo = miolo || '#ffffff';
    if (tam <= 1) { B.p(x, y, cor); return; }
    var braco = tam === 2 ? 1 : tam === 3 ? 2 : 3;
    for (var k = 1; k <= braco; k++) {
      var c2 = k === braco && tam >= 3 ? mis(cor, '#2a2060', 0.35) : cor;
      B.p(x - k, y, c2); B.p(x + k, y, c2); B.p(x, y - k, c2); B.p(x, y + k, c2);
    }
    if (tam >= 3) { B.p(x - 1, y - 1, mis(cor, '#2a2060', 0.5)); B.p(x + 1, y - 1, mis(cor, '#2a2060', 0.5)); B.p(x - 1, y + 1, mis(cor, '#2a2060', 0.5)); B.p(x + 1, y + 1, mis(cor, '#2a2060', 0.5)); }
    if (tam >= 4) { B.p(x - 1, y - 1, cor); B.p(x + 1, y - 1, cor); B.p(x - 1, y + 1, cor); B.p(x + 1, y + 1, cor); }
    B.p(x, y, miolo);
  }

  /* ================= PLANETAS ================= */
  // cada planeta é pintado pixel a pixel numa grade (u, v de -1 a 1 dentro do disco), com luz
  // vindo do alto à esquerda; o contorno vem depois (Buf.contornar)
  function dentroDisco(dx, dy, r) { return dx * dx + dy * dy <= r * r + r * 0.6; }

  // crateras [cu, cv, cr] em unidades do raio: miolo mais escuro e borda de baixo iluminada
  function cratera(lista, u, v, base, r) {
    for (var i = 0; i < lista.length; i++) {
      var c = lista[i];
      if (c[2] * r < 0.8) continue;
      var d = Math.sqrt((u - c[0]) * (u - c[0]) + (v - c[1]) * (v - c[1])) / c[2];
      if (d < 1) return (d > 0.5 && (u - c[0]) + (v - c[1]) > 0.25 * c[2]) ? cla(base, 0.35) : esc(base, 0.16);
    }
    return null;
  }
  function manchas(lista, u, v) {
    for (var i = 0; i < lista.length; i++) {
      var m = lista[i], rx = m[2], ry = m[3] || m[2];
      var a = (u - m[0]) / rx, b = (v - m[1]) / ry;
      if (a * a + b * b <= 1) return true;
    }
    return false;
  }

  var CRAT_MERCURIO = [[-0.35, -0.3, 0.26], [0.3, 0.25, 0.3], [0.35, -0.45, 0.16], [-0.3, 0.45, 0.18], [0.05, -0.02, 0.14]];
  var TERRA_CONT = [[-0.3, 0.12, 0.3, 0.42], [-0.18, -0.35, 0.28, 0.2], [0.38, -0.25, 0.3, 0.22], [0.35, 0.25, 0.2, 0.28], [0.55, 0.05, 0.14, 0.14]];
  var MARTE_ESCURO = [[0.15, 0.05, 0.3, 0.16], [-0.35, 0.25, 0.25, 0.14], [0.45, 0.35, 0.18, 0.12], [-0.2, -0.2, 0.2, 0.1]];
  var LUA_MARES = [[-0.3, -0.35, 0.26, 0.22], [0.12, -0.3, 0.17, 0.15], [0.26, -0.05, 0.2, 0.17], [0.62, -0.22, 0.12, 0.11],
    [-0.58, 0.0, 0.22, 0.34], [-0.4, 0.28, 0.2, 0.15], [-0.12, 0.34, 0.15, 0.12], [0.5, 0.17, 0.13, 0.12], [0.3, 0.26, 0.1, 0.09], [-0.08, -0.62, 0.38, 0.07]];
  var LUA_CRATERAS = [[-0.08, 0.72, 0.07], [-0.26, -0.06, 0.06], [0.3, 0.6, 0.09], [0.55, 0.48, 0.07], [-0.45, 0.6, 0.08], [0.1, 0.55, 0.06], [0.7, -0.5, 0.06], [-0.1, 0.9, 0.05], [0.2, 0.82, 0.05], [-0.7, -0.45, 0.06]];

  // cor base de um pixel do planeta (antes da sombra); null = fora
  function corPlaneta(id, u, v, r) {
    var w;
    switch (id) {
      case 'mercurio':
        return cratera(CRAT_MERCURIO, u, v, '#b9b0bd', r) || (manchas([[0.1, 0.1, 0.35, 0.25]], u, v) ? '#a89fae' : '#b9b0bd');
      case 'venus':
        w = Math.sin((v * 2.6 + u * 0.9 + 0.35 * Math.sin(u * 4)) * Math.PI);
        return w > 0.55 ? '#fff1c8' : w < -0.6 ? '#e6bf7a' : '#f5d898';
      case 'terra':
        if (v < -0.84 || v > 0.86) return '#ffffff';
        w = Math.sin((v * 3.2 + Math.sin(u * 3 + 1) * 0.35) * Math.PI);
        if (r >= 6 && w > 0.86 && Math.abs(u + 0.1) < 0.75) return '#f4fbff';   // nuvens
        return manchas(TERRA_CONT, u, v) ? (u + v > 0.2 ? '#4fae48' : '#6fcf5a') : '#4aa8ff';
      case 'marte':
        if (v < -0.72) return '#fff6ec';                                            // calota polar
        if (r >= 7 && Math.abs(v - 0.02 + u * 0.12) < 0.05 && u > -0.1 && u < 0.6) return '#b8492e';   // o grande cânion
        return manchas(MARTE_ESCURO, u, v) ? '#c2553a' : (u < -0.2 && v < 0 ? '#f08a54' : '#e46a3c');
      case 'jupiter':
        var gx = (u - 0.3) / 0.28, gy = (v - 0.3) / 0.15;
        if (gx * gx + gy * gy <= 1) return gx * gx + gy * gy < 0.35 && r >= 10 ? '#f08a5a' : '#d9553a';   // Grande Mancha Vermelha
        var vv = v + 0.035 * Math.sin(u * 9);
        return vv < -0.72 ? '#d9b890' : vv < -0.48 ? '#f3dcb8' : vv < -0.26 ? '#c98652' : vv < -0.04 ? '#f7e6c8'
          : vv < 0.12 ? '#e2b07a' : vv < 0.42 ? '#f7e6c8' : vv < 0.6 ? '#c47a48' : vv < 0.8 ? '#f3dcb8' : '#d4a070';
      case 'saturno':
        return v < -0.7 ? '#d8c07e' : (v > -0.4 && v < -0.18) ? '#e6c677' : (v > 0.25 && v < 0.4) ? '#e2c070' : '#f3dc98';
      case 'urano':
        return v < -0.55 ? '#c9f6f4' : '#9fe6ec';
      case 'netuno':
        var ex = (u + 0.2) / 0.22, ey = (v + 0.22) / 0.13;
        if (r >= 7 && ex * ex + ey * ey <= 1) return '#23408f';                      // a Grande Mancha Escura
        if (r >= 7 && Math.abs(v + 0.02) < 0.05 && u > 0.05 && u < 0.5) return '#e6f2ff';   // nuvenzinha
        return (v > 0.2 && v < 0.34) ? '#355fc8' : '#3f6fe0';
      case 'plutao':
        var hx = (u - 0.22) / 0.46, hy = -(v - 0.08) / 0.46;
        var cor = hx * hx + hy * hy - 1;
        if (r >= 12 && cor * cor * cor - hx * hx * hy * hy * hy <= 0) return '#fff4e0';   // o "coração" (nos pequenos, molde de pixels)
        return manchas([[-0.62, 0.28, 0.5, 0.42]], u, v) ? '#a57a5a' : '#e3c9a2';     // a região escura à esquerda
      case 'lua':
        var cr = cratera(LUA_CRATERAS, u, v, '#f4efdc', r);
        if (cr) return cr;
        return manchas(LUA_MARES, u, v) ? '#cfc8b6' : '#f4efdc';
    }
    return '#ffffff';
  }

  // sombra do lado de baixo à direita (a luz vem do alto à esquerda); com `xadrez` (0/1, paridade
  // do pixel), a divisa entre as faixas de sombra vira um pontilhado em vez de uma diagonal dura
  function sombrear(cor, u, v, xadrez) {
    var d = (u + v) * 0.707;
    if (xadrez !== undefined) {
      if (d > 0.62 && d < 0.7) return xadrez ? esc(cor, 0.3) : esc(cor, 0.14);
      if (d > 0.36 && d < 0.44) return xadrez ? esc(cor, 0.14) : cor;
    }
    if (d > 0.66) return esc(cor, 0.3);
    if (d > 0.4) return esc(cor, 0.14);
    return cor;
  }

  // anel: elipse inclinada (ang) com semi-eixos rx, ry; faixa de sIn a 1; divisão (gap) opcional
  function pixelAnel(dx, dy, a) {
    var ca = Math.cos(a.ang), sa = Math.sin(a.ang);
    var x = dx * ca + dy * sa, y = -dx * sa + dy * ca;
    var s = Math.sqrt((x / a.rx) * (x / a.rx) + (y / a.ry) * (y / a.ry));
    if (s > 1 || s < a.sIn) return null;
    if (a.gap && s > a.gap[0] && s < a.gap[1]) return null;
    var cor = a.cores.length > 1 && s > a.corte ? a.cores[1] : a.cores[0];
    return { cor: cor, frente: a.frenteX ? x < 0 : y > 0 };
  }
  function anelDe(id, r) {
    if (id === 'saturno') return { rx: 2.2 * r + 0.5, ry: 0.72 * r + 0.5, ang: -0.28, sIn: 0.64, corte: 0.86,
      gap: r >= 9 ? [0.8, 0.8 + 1.4 / (2.2 * r)] : null, cores: ['#c9b6ff', '#a58fe6'], contorno: true };
    return null;
  }

  // pinta o planeta (sem contorno) na grade B com o centro em (cx, cy)
  function pintarPlaneta(B, id, cx, cy, r) {
    r = Math.max(2, Math.round(r));
    var anel = anelDe(id, r), x, y, dx, dy, a;
    if (id === 'sol') { pintarSol(B, cx, cy, r); return; }
    if (id === 'urano') { pintarUrano(B, cx, cy, r); return; }
    var alcance = anel ? Math.ceil(Math.max(anel.rx, anel.ry)) + 1 : r + 1;
    // anel de trás
    if (anel) for (dy = -alcance; dy <= alcance; dy++) for (dx = -alcance; dx <= alcance; dx++) {
      a = pixelAnel(dx, dy, anel);
      if (a && !a.frente) B.p(cx + dx, cy + dy, sombrear(a.cor, dx / anel.rx * 0.5, dy / anel.ry * 0.3));
    }
    // o disco
    var hlx = cx - Math.round(r * 0.45), hly = cy - Math.round(r * 0.45);
    for (dy = -r; dy <= r; dy++) for (dx = -r; dx <= r; dx++) {
      if (!dentroDisco(dx, dy, r)) continue;
      var u = dx / r, v = dy / r;
      var xz = r >= 8 ? ((dx + dy) & 1) : undefined;
      var cor = sombrear(corPlaneta(id, u, v, r), u, v, xz);
      if (id === 'lua' && r >= 16) cor = sombrear(corPlaneta(id, u, v, r), u * 0.6, v * 0.6, xz);
      if (anel && anel.contorno && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) {
        var q = pixelAnel(dx + d[0], dy + d[1], anel); return !dentroDisco(dx + d[0], dy + d[1], r) && q && !q.frente;
      })) cor = CONTORNO;
      B.p(cx + dx, cy + dy, cor);
    }
    // Plutão pequeno: o "coração" (Planície Sputnik) desenhado pixel a pixel, porque a conta do
    // coração não fecha em poucos pixels
    if (id === 'plutao' && r < 12) {
      var molde = r <= 4 ? CORACAO_P : r <= 8 ? CORACAO_M : CORACAO_G;
      var mx0 = cx + Math.round(r * 0.22) - (molde[0].length >> 1), my0 = cy + Math.round(r * 0.12) - (molde.length >> 1);
      for (y = 0; y < molde.length; y++) for (x = 0; x < molde[y].length; x++) {
        if (molde[y][x] !== 'X' || !B.g(mx0 + x, my0 + y)) continue;
        var uu = (mx0 + x - cx) / r, vv = (my0 + y - cy) / r;
        B.p(mx0 + x, my0 + y, sombrear('#fff4e0', uu, vv));
      }
    }
    // brilhinho
    if (r >= 5 && id !== 'lua') {
      B.p(hlx, hly, cla(B.g(hlx, hly) || '#ffffff', 0.55));
      if (r >= 12) { B.p(hlx + 1, hly, cla(B.g(hlx + 1, hly) || '#ffffff', 0.4)); B.p(hlx, hly + 1, cla(B.g(hlx, hly + 1) || '#ffffff', 0.4)); }
    }
    // anel da frente, com a sombrinha dele no planeta logo acima
    if (anel) for (dy = -alcance; dy <= alcance; dy++) for (dx = -alcance; dx <= alcance; dx++) {
      a = pixelAnel(dx, dy, anel);
      if (!a || !a.frente) continue;
      B.p(cx + dx, cy + dy, sombrear(a.cor, dx / anel.rx * 0.5, dy / anel.ry * 0.3));
      if (!anel.frenteX && dentroDisco(dx, dy - 1, r) && !pixelAnel(dx, dy - 1, anel)) B.p(cx + dx, cy + dy - 1, anel.contorno ? CONTORNO : esc(B.g(cx + dx, cy + dy - 1) || '#f3dc98', 0.3));
    }
  }

  var CORACAO_P = ['X.X', 'XXX', '.X.'];
  var CORACAO_M = ['XX.XX', 'XXXXX', '.XXX.', '..X..'];
  var CORACAO_G = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

  // Urano gira "deitado": o anel fica quase em pé. Nos tamanhos pequenos o anel fica todo dentro do
  // disco (a silhueta continua redonda); nos grandes ele passa um pouco do disco, em laço arredondado.
  // O anel tem a sua própria linha fina mais escura, para não sumir no azul-claro do planeta.
  function pintarUrano(B, cx, cy, r) {
    var dx, dy, u, v;
    function noDisco(x, y) { return dentroDisco(x, y, r); }
    var temAnel = r >= 5;
    var rx = r >= 12 ? 0.5 * r + 0.5 : Math.max(2, Math.round(0.45 * r));
    var ry = r >= 12 ? r + 2 + Math.round(r * 0.1) : r - 0.4;
    var gro = r >= 13 ? 2 : 1;
    function dentroEl(x, y, a, b) { return (x / a) * (x / a) + (y / b) * (y / b) <= 1 + 0.6 / Math.max(a, b); }
    function noAnel(x, y) {
      if (!temAnel || !dentroEl(x, y, rx + 0.5, ry + 0.5)) return false;
      return !dentroEl(x, y, rx + 0.5 - gro, ry + 0.5 - gro);
    }
    var alc = Math.ceil(Math.max(r, ry)) + 1;
    // anel de trás (só aparece fora do disco)
    for (dy = -alc; dy <= alc; dy++) for (dx = -alc; dx <= alc; dx++) {
      if (dx >= 0 && noAnel(dx, dy) && !noDisco(dx, dy)) B.p(cx + dx, cy + dy, '#a8d4e8');
    }
    // o disco: azul-esverdeado claro, com o polo (virado para o Sol) mais claro
    for (dy = -r; dy <= r; dy++) for (dx = -r; dx <= r; dx++) {
      if (!noDisco(dx, dy)) continue;
      u = dx / r; v = dy / r;
      var base = u < -0.55 ? '#c9f6f4' : '#9fe6ec';
      B.p(cx + dx, cy + dy, sombrear(base, u, v, r >= 8 ? ((dx + dy) & 1) : undefined));
    }
    if (r >= 5) B.p(cx - Math.round(r * 0.45), cy - Math.round(r * 0.45), '#ffffff');
    if (!temAnel) return;
    // onde o anel de trás encosta no disco, a borda do disco continua marcada
    for (dy = -alc; dy <= alc; dy++) for (dx = 0; dx <= alc; dx++) {
      if (!noAnel(dx, dy) || noDisco(dx, dy)) continue;
      if (noDisco(dx - 1, dy) || noDisco(dx, dy - 1) || noDisco(dx, dy + 1)) B.p(cx + dx, cy + dy, CONTORNO);
    }
    // anel da frente, por cima do disco, com a linha fina dos dois lados
    var frente = [];
    for (dy = -alc; dy <= alc; dy++) for (dx = -alc; dx < 0; dx++) if (noAnel(dx, dy)) frente.push(dx, dy);
    for (var k = 0; k < frente.length; k += 2) {
      dx = frente[k]; dy = frente[k + 1];
      [[1, 0], [-1, 0]].forEach(function (d) {
        var x = dx + d[0], y = dy;
        if (noAnel(x, y) || !noDisco(x, y)) return;
        if (d[0] < 0 && r < 12) return;   // nos pequenos, só a sombrinha do lado de dentro
        B.p(cx + x, cy + y, d[0] > 0 ? '#4f86a8' : '#6fa6c4');
      });
    }
    for (k = 0; k < frente.length; k += 2) {
      dx = frente[k]; dy = frente[k + 1];
      B.p(cx + dx, cy + dy, (dx + dy * 0.3) / r < -0.25 ? '#f2fdff' : '#d8f4ff');
    }
  }

  // o Sol: disco amarelo em camadas e raios em volta (curtos e longos alternados)
  function pintarSol(B, cx, cy, r) {
    var L = Math.max(2, Math.round(r * 0.45));
    for (var dy = -r - L; dy <= r + L; dy++) for (var dx = -r - L; dx <= r + L; dx++) {
      var d = Math.sqrt(dx * dx + dy * dy);
      if (dentroDisco(dx, dy, r)) {
        var t = d / r, u = dx / r, v = dy / r;
        var cor = t < 0.45 ? '#fff6b0' : t < 0.78 ? '#ffe066' : '#ffc233';
        if ((u + v) * 0.707 > 0.7) cor = '#ffae2a';
        B.p(cx + dx, cy + dy, cor);
        continue;
      }
      if (d < r + 1.5) continue;   // espaço entre o disco e os raios
      var ang = Math.atan2(dy, dx), passo = Math.PI / 4;
      var k = Math.round(ang / passo), delta = Math.abs(ang - k * passo) * d;
      var comp = (k % 2 === 0) ? L : Math.max(1, Math.round(L * 0.65));
      var fora = d - (r + 1.5);
      if (fora > comp) continue;
      var larg = (1 - fora / (comp + 0.5)) * Math.max(0.8, r * 0.16);
      if (delta <= larg) B.p(cx + dx, cy + dy, fora > comp * 0.6 ? '#ffb020' : '#ffd34d');
    }
    if (r >= 5) B.p(cx - Math.round(r * 0.4), cy - Math.round(r * 0.4), '#ffffff');
  }

  // brilho quente em volta do Sol: pontilhado amarelo e laranja (pixels cheios, nada de
  // transparência, que sobre o azul-escuro vira cinza), só nos vãos entre os raios
  function brilhoSol(B, cx, cy, r) {
    var L = Math.max(2, Math.round(r * 0.45)), fim = r + L + 0.5;
    for (var dy = -Math.ceil(fim); dy <= fim; dy++) for (var dx = -Math.ceil(fim); dx <= fim; dx++) {
      var x = cx + dx, y = cy + dy;
      if (B.g(x, y)) continue;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > fim) continue;
      var t = (d - r) / L;   // 0 junto do disco, 1 na ponta dos raios
      if (t < 0.5) { if ((x + y) & 1) B.p(x, y, (x & 1) ? '#ffd34d' : '#ffb84a'); }
      else if (t < 0.8) { if ((x & 1) && (y & 1)) B.p(x, y, '#ff9d2e'); }
      else if (!(x % 3) && !(y % 3) && ((x + y) % 2)) B.p(x, y, '#e8843a');
    }
  }

  // sprites dos planetas prontos (com contorno), cacheados por id e raio
  var cachePlaneta = {};
  function spritePlaneta(id, r) {
    r = Math.max(2, Math.round(r));
    var k = id + '|' + r;
    if (cachePlaneta[k]) return cachePlaneta[k];
    var anel = anelDe(id, r);
    var mx = id === 'sol' ? r + Math.max(2, Math.round(r * 0.45)) + 1 : anel ? Math.ceil(anel.rx) + 1 : r + 1;
    var my = id === 'sol' ? mx : anel ? Math.ceil(anel.ry) + 1 : r + 1;
    mx = Math.max(mx, r + 1); my = Math.max(my, r + 1);
    if (id === 'urano') my = r + 4 + Math.round(r * 0.1);   // o laço do anel passa um pouco do disco
    var B = new Buf(mx * 2 + 3, my * 2 + 3);
    pintarPlaneta(B, id, mx + 1, my + 1, r);
    B.contornar(CONTORNO);
    if (id === 'sol') brilhoSol(B, mx + 1, my + 1, r);
    var c = B.canvas();
    cachePlaneta[k] = { c: c, ox: mx + 1, oy: my + 1 };
    return cachePlaneta[k];
  }

  // para as outras partes (Reino._predios.observatorioCenas)
  S.esc = esc; S.mis = mis; S.rng = rng; S.Buf = Buf; S.discoBuf = discoBuf; S.estrela = estrela;
  S.dentroDisco = dentroDisco; S.corPlaneta = corPlaneta; S.pintarPlaneta = pintarPlaneta;
  S.spritePlaneta = spritePlaneta;
})();
