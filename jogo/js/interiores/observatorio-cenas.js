/* Observatório: a arte do prédio.
   - Reino.ObservatorioCenas: as cenas do telescópio (160×112 px, moldura redonda de luneta) e o
     desenho do Sol, dos 8 planetas e de Plutão para o Planetário;
   - a base de sprite 'robo' (o Robô Cosmo), registrada em Reino.NPCs;
   - o desenho de fora (Mapa.PREDIOS.observatorio): o morro, a cúpula e o telescópio.
   No carregamento este arquivo só registra funções: nada de DOM, canvas nem PA aqui fora
   (as ferramentas em Node o carregam num vm sem DOM). Tudo que cria canvas fica cacheado.
   Nunca há cena do Sol pelo telescópio: olhar o Sol por um telescópio é perigoso. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var CONTORNO = '#3a2446';

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

  /* ================= CENAS DO TELESCÓPIO ================= */
  var CW = 160, CH = 112, LX = 79.5, LY = 55.5, LR = 50;   // lente redonda no meio
  var CEU = '#231a5a', CEU2 = '#1a1346';

  function ceu(B, semente, qtd) {
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      var d = Math.sqrt((x - LX) * (x - LX) + (y - LY) * (y - LY));
      if (d <= LR) B.p(x, y, d > 36 ? CEU2 : CEU);
    }
    var r = rng(semente), cores = ['#ffffff', '#fff3c0', '#cfe6ff', '#ffd6ec'];
    for (var i = 0; i < (qtd || 60); i++) {
      var x2 = Math.floor(r() * CW), y2 = Math.floor(r() * CH), c = cores[Math.floor(r() * cores.length)];
      if (r() < 0.55) c = mis(c, CEU, 0.45);
      B.p(x2, y2, c);
    }
  }
  // estrelas que piscam na animação (t): [x, y, tam, cor]
  function piscantes(semente, n, evitar) {
    var r = rng(semente), lista = [], tent = 0;
    while (lista.length < n && tent++ < 400) {
      var ang = r() * Math.PI * 2, raio = 10 + r() * 36;
      var x = Math.round(LX + Math.cos(ang) * raio), y = Math.round(LY + Math.sin(ang) * raio);
      if (evitar && evitar(x, y)) continue;
      lista.push([x, y, r() < 0.4 ? 3 : 2, ['#ffffff', '#fff3a0', '#cfe6ff'][lista.length % 3], r()]);
    }
    return lista;
  }

  // planeta com contorno dentro de uma cena
  function planetaNaCena(B, id, cx, cy, r) {
    var T = new Buf(CW, CH);
    pintarPlaneta(T, id, cx, cy, r);
    T.contornar(CONTORNO);
    T.estampar(B);
  }

  var TEMAS = {
    // Lua cheia: mares escuros, crateras, Tycho com os raios lá embaixo
    lua: function (B) {
      ceu(B, 11, 50);
      var T = new Buf(CW, CH), cx = 80, cy = 56, r = 38;
      pintarPlaneta(T, 'lua', cx, cy, r);
      // raios claros de Tycho
      var tx = cx + Math.round(-0.08 * r), ty = cy + Math.round(0.72 * r);
      [[-1, -3], [1, -3], [-3, -1], [3, -2], [-2, 1], [2, 1]].forEach(function (d) {
        for (var k = 3; k < 12; k += 1) {
          var x = tx + Math.round(d[0] * k / 3), y = ty + Math.round(d[1] * k / 3);
          if (T.g(x, y) && k % 3 !== 0) T.p(x, y, '#fffaf0');
        }
      });
      T.contornar(CONTORNO);
      T.estampar(B);
      return piscantes(12, 6, function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) < 42 * 42; });
    },
    // Saturno com os anéis inclinados, e Titã (alaranjada) do lado
    saturno: function (B) {
      ceu(B, 21, 60);
      planetaNaCena(B, 'saturno', 80, 57, 17);
      var T = new Buf(CW, CH);
      discoBuf(T, 124, 76, 2, '#f0b060'); T.p(123, 75, '#ffd8a0');
      T.p(38, 44, '#e8e4f0'); T.p(39, 44, '#d0cad8');
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(22, 7, function (x, y) { return Math.abs(y - 57) < 16 || (x - 80) * (x - 80) + (y - 57) * (y - 57) < 22 * 22; });
    },
    // Júpiter com as faixas, a Grande Mancha Vermelha e as 4 luas de Galileu em fila
    jupiter: function (B) {
      ceu(B, 31, 55);
      planetaNaCena(B, 'jupiter', 80, 56, 22);
      var T = new Buf(CW, CH);
      [[110, 56, 1, '#fff08a'], [121, 57, 1, '#f4ecd8'], [47, 55, 2, '#d8cfc4'], [34, 56, 1, '#b8aca0']].forEach(function (l) {
        discoBuf(T, l[0], l[1], l[2], l[3]);
      });
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(32, 7, function (x, y) { return Math.abs(y - 56) < 26; });
    },
    // Marte: vermelho, com a calota de gelo no polo, o grande cânion e as luas Fobos e Deimos
    marte: function (B) {
      ceu(B, 41, 55);
      planetaNaCena(B, 'marte', 78, 58, 28);
      var T = new Buf(CW, CH);
      T.p(116, 34, '#b8a898'); T.p(117, 34, '#a09080'); T.p(116, 35, '#a09080');
      T.p(42, 30, '#c8bcb0');
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(42, 7, function (x, y) { return (x - 78) * (x - 78) + (y - 58) * (y - 58) < 33 * 33; });
    },
    // Cruzeiro do Sul como se vê do chão (a Estrela de Magalhães em cima, a Intrometida pequenina),
    // na faixa clarinha da Via Láctea com o Saco de Carvão (nuvem escura) ao lado
    cruzeiro: function (B) {
      ceu(B, 51, 45);
      // faixa da Via Láctea e o Saco de Carvão
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var dist = Math.abs((y - 86) + (x - 30) * 0.42) / 1.09;
        var sx = (x - 52) / 11, sy = (y - 81) / 8;
        if (sx * sx + sy * sy <= 1) { B.p(x, y, '#150e36'); continue; }
        if (dist < 7) B.p(x, y, '#3a2f7a'); else if (dist < 13) B.p(x, y, '#2e2468');
      }
      var r = rng(52);
      for (var i = 0; i < 40; i++) {
        var t = r(), x2 = Math.round(10 + t * 140), y2 = Math.round(86 - (x2 - 30) * 0.42 + (r() - 0.5) * 18);
        B.p(x2, y2, r() < 0.5 ? '#a99fe0' : '#d8d0ff');
      }
      // linhas da cruz, bem suaves
      function linha(a, b) {
        var n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
        for (var k = 5; k < n - 4; k++) if (k % 3 !== 2) B.p(Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n), '#6a5fb0');
      }
      var gacrux = [78, 22], acrux = [84, 88], mimosa = [55, 51], palida = [100, 40], intrometida = [91, 60];
      linha(gacrux, acrux); linha(mimosa, palida);
      estrela(B, acrux[0], acrux[1], 4, '#cfe6ff');                     // Estrela de Magalhães (Acrux), a maior
      estrela(B, gacrux[0], gacrux[1], 3, '#ffb070', '#fff0dc');        // Rubídea (Gacrux), alaranjada
      estrela(B, mimosa[0], mimosa[1], 3, '#cfe6ff');                    // Mimosa
      estrela(B, palida[0], palida[1], 2, '#e0ecff');                    // Pálida
      estrela(B, intrometida[0], intrometida[1], 1, '#fff3c0');          // Intrometida (pequenininha)
      B.p(intrometida[0] + 1, intrometida[1], '#8f86c8');
      return [[acrux[0], acrux[1], 4, '#ffffff', 0.1], [mimosa[0], mimosa[1], 3, '#ffffff', 0.6], [gacrux[0], gacrux[1], 3, '#ffd8a8', 0.35]]
        .concat(piscantes(53, 4, function (x, y) { return Math.abs(x - 80) < 30 && y > 14 && y < 96; }));
    },
    // cometa: a cabeleira brilhante e duas caudas (a de poeira, curva e clara; a de gás, reta e azul),
    // sempre apontando para longe do Sol
    cometa: function (B) {
      ceu(B, 61, 60);
      // o Sol fica lá embaixo à esquerda, fora da lente: as caudas apontam para o alto à direita
      var nx = 50, ny = 76, dxu = 0.857, dyu = -0.514;
      var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      var sorte = rng(63);
      var LP = 74, LG = 88;   // até onde cada cauda chega antes de sumir de vez
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var rx = x - nx, ry = y - ny;
        var ao = rx * dxu + ry * dyu, lado = -rx * dyu + ry * dxu;
        if (ao < 2) continue;
        var limiar = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        // cauda de poeira: larga, curva (fica para trás na órbita), clarinha; afina e vira pontinhos
        var meio = 0.0055 * ao * ao, larg = 1.6 + ao * 0.2;
        var q = Math.abs(lado - meio) / larg;
        var bp = q < 1 ? 1.35 * (1 - q * q) * Math.pow(Math.max(0, 1 - ao / LP), 0.8) : 0;
        if (bp > limiar * 0.9) {
          B.p(x, y, bp > 0.8 ? '#fff6dc' : bp > 0.5 ? '#f6e0b8' : bp > 0.28 ? '#e0bfd0' : bp > 0.14 ? '#b196c8' : '#7d6aac');
        } else if (q < 1.5 && ao < LP + 12 && sorte() < 0.05 * (1 - ao / (LP + 12)) + 0.012) {
          B.p(x, y, sorte() < 0.5 ? '#d8c8e8' : '#fff0d0');   // grãozinhos de poeira soltos
        }
        // cauda de gás (íons): reta, estreita e azul, apontando exatamente para longe do Sol
        var lg = 0.9 + ao * 0.045, qg = Math.abs(lado + 1) / lg;
        var bg = qg < 1 ? 1.3 * (1 - qg * qg) * Math.pow(Math.max(0, 1 - ao / LG), 0.7) : 0;
        if (bg > limiar * 0.8) {
          B.p(x, y, bg > 0.7 ? '#dff4ff' : bg > 0.36 ? '#9fe0ff' : bg > 0.16 ? '#6fa8e8' : '#4f6fc8');
        }
      }
      // cabeleira (coma) com brilho pontilhado e o núcleo bem branco
      for (var dy = -9; dy <= 9; dy++) for (var dx = -9; dx <= 9; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 6.5 && d <= 9 && ((nx + dx + ny + dy) & 1) && (d <= 7.8 || !((nx + dx) & 1))) B.p(nx + dx, ny + dy, d <= 7.8 ? '#8fb8e8' : '#5f78c0');
      }
      discoBuf(B, nx, ny, 6, '#8fb8e8');
      discoBuf(B, nx, ny, 4, '#cfeaff');
      discoBuf(B, nx, ny, 2, '#ffffff');
      B.p(nx - 1, ny - 1, '#ffffff');
      return piscantes(62, 7, function (x, y) { var rx = x - nx, ry = y - ny; return rx * dxu + ry * dyu > -12 && Math.abs(-rx * dyu + ry * dxu) < 24; });
    },
    // galáxia espiral (como a nossa Via Láctea vista de fora), inclinadinha
    galaxia: function (B) {
      ceu(B, 71, 50);
      var ang = -0.4, ca = Math.cos(ang), sa = Math.sin(ang), rr = rng(72);
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var dx = x - 80, dy = y - 56;
        var gx = dx * ca + dy * sa, gy = (-dx * sa + dy * ca) / 0.55;
        var r = Math.sqrt(gx * gx + gy * gy);
        if (r > 46) continue;
        var th = Math.atan2(gy, gx);
        var braco = Math.cos(2 * th - 2.4 * Math.log(r + 1));
        var b = 1.25 * Math.exp(-r / 7) + Math.max(0, braco) * 0.85 * Math.exp(-r / 30);
        var cor = b > 0.95 ? '#fff6d8' : b > 0.66 ? '#ffe0ee' : b > 0.44 ? '#e0b0ff' : b > 0.28 ? '#9a74e0' : b > 0.17 ? '#4f3f9f' : null;
        if (cor) B.p(x, y, cor);
        if (b > 0.3 && b < 0.66 && r > 10 && rr() < 0.05) B.p(x, y, rr() < 0.5 ? '#ff8ac6' : '#9fe0ff');   // estrelas novas
      }
      return piscantes(73, 7, function (x, y) { return Math.abs(x - 80) < 44 && Math.abs(y - 56) < 30; });
    },
    // Vênus pelo telescópio: tem fases, como a Lua (aqui, crescente), e brilha muito
    venus: function (B) {
      ceu(B, 81, 55);
      var T = new Buf(CW, CH), cx = 80, cy = 56, r = 26;
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (!dentroDisco(dx, dy, r)) continue;
        var u = dx / r, v = dy / r;
        if (u < 0.38 * Math.sqrt(Math.max(0, 1 - v * v))) continue;   // lado da noite (não aparece)
        var cor = corPlaneta('venus', u, v, r);
        if (u < 0.38 * Math.sqrt(Math.max(0, 1 - v * v)) + 0.12) cor = esc(cor, 0.18);
        T.p(cx + dx, cy + dy, cor);
      }
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(82, 7, function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) < 30 * 30; });
    },
    // as Plêiades (as Sete Estrelas), azuladas, com um véu de poeira brilhando em volta
    pleiades: function (B) {
      ceu(B, 91, 45);
      var est = [[80, 58, 4], [58, 56, 3], [56, 47, 2], [104, 50, 3], [98, 66, 3], [99, 40, 3], [110, 34, 2], [88, 44, 1], [70, 70, 1]];
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        for (var i = 0; i < 6; i++) {
          var e = est[i], d = Math.sqrt((x - e[0]) * (x - e[0]) + (y - e[1]) * (y - e[1]));
          if (d < 5 + e[2] * 2) { B.p(x, y, d < 2 + e[2] ? '#34448e' : ((x + y) % 2 ? '#2b2c72' : CEU)); break; }
        }
      }
      est.forEach(function (e) { estrela(B, e[0], e[1], e[2], '#bfe0ff'); });
      return est.slice(0, 6).map(function (e, i) { return [e[0], e[1], e[2], '#ffffff', i / 6]; });
    },
  };

  // moldura redonda de luneta: anel de metal com contorno; fora dela, transparente
  function moldura(B) {
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      var dx = x - LX, dy = y - LY, d = Math.sqrt(dx * dx + dy * dy);
      if (d <= LR - 3) continue;
      if (d <= LR) { var k = B.g(x, y); if (k) B.p(x, y, esc(k, 0.22)); continue; }
      if (d <= LR + 1.2) { B.p(x, y, CONTORNO); continue; }
      if (d <= LR + 4) {
        var luz = (-dx - dy) / d;   // luz do alto à esquerda
        B.p(x, y, luz > 0.55 ? '#c9bfe6' : luz > -0.2 ? '#9a8cc4' : '#6f6198');
        continue;
      }
      if (d <= LR + 5.3) { B.p(x, y, CONTORNO); continue; }
      B.c[y * CW + x] = null;
    }
    // parafusinhos dourados no anel
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (p) {
      B.p(Math.round(LX + p[0] * (LR + 2.6)), Math.round(LY + p[1] * (LR + 2.6)), '#ffd34d');
    });
  }

  var cacheCena = {}, cacheAnim = {};
  function cenaEstatica(tema) {
    if (cacheCena[tema]) return cacheCena[tema];
    var B = new Buf(CW, CH);
    var pisca = TEMAS[tema](B) || [];
    moldura(B);
    var c = B.canvas();
    c.piscantes = pisca;
    cacheCena[tema] = c;
    return c;
  }

  Reino.ObservatorioCenas = {
    temas: function () { return Object.keys(TEMAS); },
    // canvas 160×112 com a moldura da luneta; com t (ms), as estrelinhas piscam por cima de um
    // desenho parado cacheado (um canvas de animação por tema, reaproveitado a cada quadro)
    cena: function (tema, t) {
      if (!TEMAS[tema]) tema = 'lua';
      var fixo = cenaEstatica(tema);
      if (typeof t !== 'number' || !isFinite(t)) return fixo;
      var c = cacheAnim[tema] || (cacheAnim[tema] = window.PA.novoCanvas(CW, CH));
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, CW, CH);
      ctx.drawImage(fixo, 0, 0);
      fixo.piscantes.forEach(function (s) {
        var f = ((t / 1600) + s[4]) % 1;
        if (f > 0.5) return;
        var brilho = f < 0.25 ? f / 0.25 : (0.5 - f) / 0.25;   // 0 → 1 → 0
        var braco = brilho > 0.6 ? s[2] - 1 : Math.max(1, s[2] - 2);
        ctx.globalAlpha = 0.35 + brilho * 0.65;
        ctx.fillStyle = s[3];
        ctx.fillRect(s[0] - braco, s[1], braco * 2 + 1, 1);
        ctx.fillRect(s[0], s[1] - braco, 1, braco * 2 + 1);
        ctx.globalAlpha = 1;
      });
      return c;
    },
    // desenha o Sol, um planeta ou Plutão com o centro em (cx, cy), raio em px do jogo (4 a 20 ficam bonitos).
    // Os pixels são pintados uma vez por id e raio (cache) e depois só copiados.
    desenharPlaneta: function (ctx, id, cx, cy, raio) {
      var s = spritePlaneta(id, raio);
      ctx.drawImage(s.c, Math.round(cx) - s.ox, Math.round(cy) - s.oy);
    },
  };

  /* ================= ROBÔ COSMO (base 'robo') ================= */
  // 19 colunas, como os outros; linhas a partir do alto da grade (antena nas linhas livres de cima)
  var ROBO = [
    '...................',   // 0
    '........aAA........',   // 1  bolinha da antena
    '........AAA........',   // 2
    '.........s.........',   // 3  hastezinha
    '........sss........',   // 4
    '....LLLLLLLLLLL....',   // 5  cabeça
    '...LCCCCCCCCCCCc...',   // 6
    '..dCSSSSSSSSSSSCd..',   // 7  tela, com os parafusos-orelha
    '..dCSeESSSSSeESCd..',   // 8  olhos de luz
    '..dCSEESSSSSEESCd..',   // 9
    '...CSkSMSSSMSkSc...',   // 10 bochechas e sorriso
    '...CSSSSMMMSSSSc...',   // 11
    '...cCCCCCCCCCCcc...',   // 12
    '........sss........',   // 13 pescoço
    '...sLLLLLLLLLLLs...',   // 14 ombros
    '..CsCPPPPPPPPPCsC..',   // 15 painel de luzes
    '..CcCPrPyPgPhPCcC..',   // 16
    '..CcCPPPPPPPPPCcC..',   // 17
    '..DcCCCCCCCCCCCcD..',   // 18 mãozinhas
    '....cCCCCCCCCCc....',   // 19
    '......ss...ss......',   // 20 perninhas (não respiram)
    '......ss...ss......',   // 21
    '.....DDDD.DDDD.....',   // 22 pezinhos
  ];
  var ROBO_PISCA = {
    8: '..dCSSSSSSSSSSSCd..',
    9: '..dCSEESSSSSEESCd..',
  };

  function gradeRobo(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    var corpo = cru.corpo || '#b8c4d8', det = cru.detalhe || '#5fb4ff', ant = cru.antena || '#ff5c8a';
    var pisca = !!(quadro & 2);
    var pal = {
      C: corpo, c: G.esc(corpo, 0.2), L: G.cla(corpo, 0.4), s: G.esc(corpo, 0.38),
      S: '#2a2050', E: det, e: G.cla(det, 0.65), k: '#ff9cc6', M: G.cla(det, 0.35),
      P: '#3a3070', r: ant, y: '#ffe066', g: '#6fdc8c', h: det, D: G.esc(det, 0.15), d: ant,
      // a bolinha da antena acende no quadro de piscar
      A: pisca ? G.cla(ant, 0.55) : ant, a: pisca ? '#ffffff' : G.cla(ant, 0.5),
    };
    var corte = 20;
    var g = new G.Grade(ROBO.length, corte, (quadro & 1) ? -1 : 0);
    ROBO.forEach(function (linha, j) {
      if (pisca && ROBO_PISCA[j]) linha = ROBO_PISCA[j];
      for (var i = 0; i < linha.length; i++) { var k = linha[i]; if (k !== '.') g.p(i, j, pal[k]); }
    });
    g.fecharCorte();
    return { g: g, busto: 16 };
  }

  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('robo', gradeRobo);

  /* ================= DESENHO DE FORA (mapa) ================= */
  function ret(ctx, x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }
  function circulo(ctx, cx, cy, raio, cor) {
    ctx.fillStyle = cor;
    for (var j = -raio; j <= raio; j++) {
      var meia = Math.floor(Math.sqrt(raio * raio - j * j) + 0.35);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function elipse(ctx, cx, cy, rx, ry, cor) {
    ctx.fillStyle = cor;
    for (var j = -ry; j <= ry; j++) {
      var meia = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function contornoRet(ctx, x, y, w, h, cor) { ret(ctx, x, y, w, h, CONTORNO); ret(ctx, x + 1, y + 1, w - 2, h - 2, cor); }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }

  function desenharObservatorio(ctx, px, py, w, h) {
    var cx = px + Math.floor(w / 32) * 16 + 8;   // meio do tile da porta (a escada desce até ele)
    var hx = px + Math.floor(w / 2);
    var grama = '#b2d84e', grama2 = '#d0ea72', grama3 = '#8fb83a';
    var terra = '#d4a57a', terra2 = '#b98457', terra3 = '#e8c49c';
    var j, x, y, m;

    // ---- morro: encosta de terra na frente e o platô gramado em cima ----
    elipse(ctx, hx, py + h - 22, w / 2 - 1, 21, CONTORNO);
    elipse(ctx, hx, py + h - 22, w / 2 - 2, 20, terra);
    elipse(ctx, hx + 8, py + h - 16, w / 2 - 12, 13, mis(terra, terra2, 0.35));
    // camadas de pedra na encosta
    [[py + h - 16, 0], [py + h - 10, 4], [py + h - 5, 2]].forEach(function (c) {
      var yy = c[0], dy = yy - (py + h - 22);
      m = Math.floor((w / 2 - 4) * Math.sqrt(Math.max(0, 1 - (dy * dy) / 400)));
      for (x = hx - m + c[1]; x < hx + m - 5; x += 11) { ret(ctx, x, yy, 6, 1, terra2); ret(ctx, x + 1, yy - 1, 3, 1, terra3); }
    });
    [[14, 66], [80, 64], [24, 74], [72, 73]].forEach(function (s) {
      ret(ctx, px + s[0], py + s[1], 3, 2, '#efe2cc'); ret(ctx, px + s[0], py + s[1] + 2, 3, 1, terra2);
    });
    // platô
    elipse(ctx, hx, py + h - 34, w / 2 - 2, 13, CONTORNO);
    elipse(ctx, hx, py + h - 34, w / 2 - 3, 12, grama);
    elipse(ctx, hx - 8, py + h - 37, w / 2 - 16, 7, grama2);
    // franjinha de grama pendurada na beira do platô
    for (x = px + 6; x < px + w - 8; x += 5) {
      var ux = (x + 1 - hx) / (w / 2 - 3);
      if (Math.abs(ux) >= 1) continue;
      var borda = py + h - 34 + Math.floor(12 * Math.sqrt(1 - ux * ux));
      ret(ctx, x, borda, 3, 2, grama);
      ret(ctx, x, borda + 2, 3, 1, CONTORNO);
      ret(ctx, x - 1, borda + 1, 1, 1, CONTORNO); ret(ctx, x + 3, borda + 1, 1, 1, CONTORNO);
    }
    // tufinhos e florzinhas no platô
    [[10, 47], [30, 53], [86, 48], [80, 55]].forEach(function (s) { ret(ctx, px + s[0], py + s[1], 1, 2, grama3); ret(ctx, px + s[0] + 2, py + s[1] - 1, 1, 3, grama3); });
    [[26, 47, '#ff8ac6'], [88, 43, '#ffe066'], [14, 52, '#ffffff'], [84, 52, '#ff8ac6']].forEach(function (f) {
      var fx = px + f[0], fy = py + f[1];
      ret(ctx, fx - 1, fy, 3, 1, f[2]); ret(ctx, fx, fy - 1, 1, 3, f[2]); ret(ctx, fx, fy, 1, 1, '#fff3a0');
    });

    // ---- antena parabólica no canto do platô ----
    var ax = px + 16, ay = py + 38;
    ret(ctx, ax, ay + 2, 3, 8, CONTORNO); ret(ctx, ax + 1, ay + 2, 1, 7, '#9a8cc4');
    ret(ctx, ax - 2, ay + 9, 7, 2, CONTORNO); ret(ctx, ax - 1, ay + 9, 5, 1, '#c9bfe6');
    elipse(ctx, ax, ay, 7, 5, CONTORNO);
    elipse(ctx, ax, ay, 6, 4, '#f4f2fb');
    elipse(ctx, ax + 1, ay + 1, 4, 2, '#cfd6ea');
    ret(ctx, ax + 1, ay - 7, 1, 7, CONTORNO);
    ret(ctx, ax, ay - 9, 3, 3, CONTORNO); ret(ctx, ax + 1, ay - 8, 1, 1, '#ff5c8a');

    // ---- prédio redondo ----
    var bx = cx - 22, by = py + 26, bw = 44, bh = 27;
    contornoRet(ctx, bx, by, bw, bh, '#f6f0ff');
    for (j = by + 6, m = 0; j < by + bh - 3; j += 6, m++) {
      ret(ctx, bx + 1, j, bw - 2, 1, '#e2d8f4');
      for (x = bx + 4 + (m % 2) * 5; x < bx + bw - 2; x += 10) ret(ctx, x, j - 5, 1, 5, '#ece4f8');
    }
    ret(ctx, bx + bw - 10, by + 1, 9, bh - 2, 'rgba(154,140,196,0.22)');
    ret(ctx, bx + 1, by + 1, 2, bh - 2, '#ffffff');
    // rodapé
    ret(ctx, bx - 1, by + bh - 4, bw + 2, 5, CONTORNO); ret(ctx, bx, by + bh - 3, bw, 3, '#cfc2ea'); ret(ctx, bx, by + bh - 3, bw, 1, '#e2d8f4');

    // ---- cúpula (meia bola prateada, com gomos) ----
    var dy0 = by, rx = 23, ry = 21;
    for (j = 0; j <= ry + 1; j++) {
      m = Math.floor((rx + 1) * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 1) * (ry + 1)))) + 0.3);
      ret(ctx, cx - m, dy0 - j, m * 2 + 1, 1, CONTORNO);
    }
    for (j = 0; j <= ry; j++) {
      m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      for (x = -m; x <= m; x++) {
        var u = m ? x / m : 0, v = j / ry;
        var cor = '#b8c8ea';
        if (u > 0.45) cor = '#9fb2da';
        if (u < -0.15 && v > 0.35 && u > -0.75) cor = '#d6e2f8';
        if (u < -0.3 && u > -0.55 && v > 0.55 && v < 0.8) cor = '#f4f8ff';
        var gomo = Math.abs(Math.abs(u) - 0.55) < 0.5 / Math.max(m, 1) || Math.abs(Math.abs(u) - 0.88) < 0.5 / Math.max(m, 1);
        if (gomo || j === 9) cor = '#8ea2cc';
        ret(ctx, cx + x, dy0 - j, 1, 1, cor);
      }
    }
    // fenda aberta, com céu de noite e estrelinhas lá dentro
    for (j = 1; j <= ry; j++) {
      m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      if (m < 4) continue;
      ret(ctx, cx - 5, dy0 - j, 1, 1, CONTORNO); ret(ctx, cx + 4, dy0 - j, 1, 1, CONTORNO);
      ret(ctx, cx - 4, dy0 - j, 8, 1, '#2a2050');
    }
    ret(ctx, cx - 3, dy0 - 15, 1, 1, '#ffffff'); ret(ctx, cx + 2, dy0 - 7, 1, 1, '#ffe066'); ret(ctx, cx - 2, dy0 - 4, 1, 1, '#cfe6ff');
    // aro da cúpula (roxo com bolinhas douradas)
    ret(ctx, bx - 2, by - 1, bw + 4, 4, CONTORNO); ret(ctx, bx - 1, by, bw + 2, 2, '#8a6cd8');
    for (x = bx + 1; x < bx + bw; x += 5) ret(ctx, x, by, 1, 1, '#ffd34d');
    // telescópio saindo da fenda, para o alto à direita
    var t;
    for (t = 0; t <= 16; t++) ret(ctx, cx - 3 + t, dy0 - 12 - t, 5, 5, CONTORNO);
    for (t = 0; t <= 16; t++) {
      ret(ctx, cx - 2 + t, dy0 - 11 - t, 3, 3, t >= 9 && t <= 10 ? '#ffd34d' : '#f4f0ff');
      ret(ctx, cx + t, dy0 - 9 - t, 1, 1, t >= 9 && t <= 10 ? '#e0a820' : '#c9bfe6');
    }
    ret(ctx, cx + 14, dy0 - 27, 3, 3, '#5fb4ff'); ret(ctx, cx + 15, dy0 - 27, 1, 1, '#d9f2ff');
    ret(ctx, cx - 3, dy0 - 6, 6, 5, CONTORNO); ret(ctx, cx - 2, dy0 - 5, 4, 3, '#6f6198');   // o pé do telescópio

    // ---- plaquinha com a lua e a estrela, porta e janelinhas ----
    contornoRet(ctx, cx - 6, by + 4, 12, 8, '#2a2050');
    circulo(ctx, cx - 2, by + 8, 2, '#ffe066'); ret(ctx, cx - 1, by + 6, 2, 3, '#2a2050'); ret(ctx, cx, by + 9, 1, 1, '#2a2050');
    brilho(ctx, cx + 3, by + 7, '#ffffff');
    var dx = cx - 6, dyy = by + 12, dw = 12, dh = bh - 12;
    ret(ctx, dx - 1, dyy + 2, dw + 2, dh - 2, '#ffd34d');
    elipse(ctx, dx + dw / 2 - 0.5, dyy + 3, dw / 2, 3, '#ffd34d');
    ret(ctx, dx, dyy + 3, dw, dh - 3, '#7c5cff');
    elipse(ctx, dx + dw / 2 - 0.5, dyy + 4, dw / 2 - 1, 3, '#7c5cff');
    ret(ctx, dx + dw / 2 - 1, dyy + 5, 1, dh - 5, esc('#7c5cff', 0.25));
    ret(ctx, dx + dw - 4, dyy + dh / 2 + 2, 2, 2, '#ffd34d');
    ret(ctx, dx + 2, dyy + 6, 1, 1, '#ffe066');
    [bx + 9, bx + bw - 9].forEach(function (jx) {
      circulo(ctx, jx, by + 13, 4, CONTORNO); circulo(ctx, jx, by + 13, 3, '#ffd34d'); circulo(ctx, jx, by + 13, 2, '#2a2050');
      ret(ctx, jx - 1, by + 12, 1, 1, '#ffffff'); ret(ctx, jx + 1, by + 14, 1, 1, '#ffe066');
    });

    // ---- escada do morro, da porta até embaixo ----
    var sy = by + bh;
    for (var k = 0; sy + k * 4 < py + h; k++) {
      var y0 = sy + k * 4, meia = 7 + Math.floor(k / 2);
      var alto = Math.min(5, py + h - y0);
      ret(ctx, cx - meia, y0, meia * 2, alto, CONTORNO);
      ret(ctx, cx - meia + 1, y0 + 1, meia * 2 - 2, alto - 1, k % 2 ? '#eadbb8' : '#f5ead0');
      ret(ctx, cx - meia + 1, y0 + 1, meia * 2 - 2, 1, '#fff8e8');
    }
    // lampiões dos dois lados, no pé da escada
    [cx - 14, cx + 13].forEach(function (lx) {
      var ly = py + h - 16;
      ret(ctx, lx, ly, 2, 15, CONTORNO); ret(ctx, lx, ly + 1, 1, 13, '#6f6198');
      ret(ctx, lx - 2, ly - 5, 6, 6, CONTORNO); ret(ctx, lx - 1, ly - 4, 4, 4, '#ffe066'); ret(ctx, lx - 1, ly - 4, 2, 2, '#fff8c8');
      ret(ctx, lx - 1, ly - 7, 4, 2, CONTORNO);
    });

    // ---- estrelinhas em volta ----
    [[6, 10, '#ffe066'], [w - 8, 8, '#ffffff'], [28, 18, '#ffffff'], [w - 5, 30, '#ffe066'], [6, 30, '#ffffff']].forEach(function (s) {
      brilho(ctx, px + s[0], py + s[1], s[2]);
    });
  }

  if (window.Mapa && window.Mapa.PREDIOS) window.Mapa.PREDIOS.observatorio = desenharObservatorio;
})();
