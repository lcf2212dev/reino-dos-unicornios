/* Laboratório de Química, 2º andar: o Fogão dos Estados (Cozinha Química), parte 2 de 2 (o desenho em pixel art).
   Contrato: docs/contratos/quimica.md §2 e §9. Reino.QuimicaEstados.desenhar(canvas, cena, t) pinta a cena L×A:
   o fogão com a panela de vidro e a tampa, o termômetro e a lupa com as bolinhas (moléculas).
   cena = { material, graus, estado, forma: 'pedaco' | 'placa', fogo: 'quente' | 'frio' | null, gotas, de, p }
   (de = o estado de antes, p = 0..1 da mudança; sem animação p = 1). t = ms da animação ou null (quadro parado).
   Sem arc, gradiente nem blur; sorteio fixo (Reino.Desenho.rng), nunca Math.random. */
(function () {
  var R = window.Reino;
  var L = 160, A = 120, K = '#3a2446';
  var CHAO = 74, BORDA = 46;                        // fundo de dentro e boca da panela de vidro
  var LUPA = { x: 22, y: 24, r: 17 };
  var TERMO = { x: 140, topo: 12, base: 96, min: -20, max: 120 };
  // cores de cada material: bolinha, pedaço (claro, meio, sombra) e poça (meio, brilho)
  var COR = {
    agua: { bola: '#3f8fe0', claro: '#ffffff', meio: '#bfe9ff', sombra: '#8fcbe8', poca: '#5aa8f0', brilho: '#a9dcff' },
    chocolate: { bola: '#7a4a2a', claro: '#9a5f3a', meio: '#6b3b22', sombra: '#4a2616', poca: '#5a321c', brilho: '#9a5f3a' },
    manteiga: { bola: '#e0a820', claro: '#fcefb0', meio: '#f3d36b', sombra: '#d8b24a', poca: '#f0c040', brilho: '#fbe89a' },
    vela: { bola: '#c79a58', claro: '#fffaf0', meio: '#f1e6c8', sombra: '#d8c9a0', poca: '#d9b870', brilho: '#fff6dc' },
  };

  function ret(x, a, b, w, h, cor) { if (w > 0 && h > 0) { x.fillStyle = cor; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); } }
  function circ(x, cx, cy, r, cor) { R.Desenho.circulo(x, Math.round(cx), Math.round(cy), Math.max(0, Math.round(r)), cor); }
  function meia(r, j) { return Math.abs(j) > r ? -1 : Math.floor(Math.sqrt(r * r - j * j) + 0.35); }
  function onda(t, periodo, fase) { return t === null ? 0 : Math.sin(t / periodo + fase); }

  /* ---------- a cozinha e o fogão ---------- */
  function fundo(x) {
    for (var j = 0; j < 84; j += 10) for (var i = 0; i < L; i += 10) ret(x, i, j, 10, 10, ((i + j) / 10) % 2 ? '#efdcc4' : '#f6ead8');
    for (j = 9; j < 84; j += 10) ret(x, 0, j, L, 1, '#e2cdb0');
    for (i = 9; i < L; i += 10) ret(x, i, 0, 1, 84, '#e2cdb0');
    ret(x, 0, 84, L, A - 84, '#c9a27a'); ret(x, 0, 84, L, 1, '#a57e5a');   // bancada de madeira
    for (i = 4; i < L; i += 23) ret(x, i, 100 + (i % 3) * 5, 9, 1, '#b48c64');
  }
  function fogao(x, cena) {
    ret(x, 17, 85, 96, 35, K); ret(x, 18, 86, 94, 34, '#f4f1ea'); ret(x, 18, 86, 94, 2, '#ffffff');
    [30, 46, 84, 100].forEach(function (cx, i) {                             // botões
      circ(x, cx, 91, 3, K); circ(x, cx, 91, 2, '#8a94aa'); ret(x, cx, 89, 1, 2, i === 1 && cena.fogo === 'quente' ? '#ff5a2a' : K);
    });
    ret(x, 28, 97, 74, 21, K); ret(x, 29, 98, 72, 19, '#3a3346');            // porta do forno
    ret(x, 32, 100, 66, 1, '#5b5470'); ret(x, 32, 101, 8, 1, '#5b5470');
    ret(x, 26, 95, 78, 2, '#8a94aa');
    ret(x, 12, 80, 106, 5, K); ret(x, 13, 81, 104, 3, '#5b5f6e'); ret(x, 13, 81, 104, 1, '#7c8192');   // a chapa
    ret(x, 46, 78, 38, 3, K); ret(x, 47, 79, 36, 1, '#2a2a33');             // a grade da boca
    for (var i = 48; i < 84; i += 6) ret(x, i, 77, 2, 2, K);
  }
  // chama viva no Esquentar (mais alta quanto mais quente); no Esfriar, o ar gelado com floquinhos
  function calor(x, cena, t) {
    if (cena.fogo === 'quente') {
      var forca = 2 + Math.max(0, Math.min(4, Math.round((cena.graus + 20) / 35)));
      for (var i = 38; i <= 90; i += 4) {
        var fora = i < 44 || i > 86, h = forca + (fora ? 2 : 0) + Math.round(onda(t, 90, i) * 1.5) + (i % 8 ? 0 : 1);
        ret(x, i, 79 - h, 3, h, '#ff5a2a');
        ret(x, i, 79 - Math.ceil(h * 0.6), 3, Math.ceil(h * 0.6), '#ffb020');
        ret(x, i + 1, 78, 1, 2, '#4a7cff');
      }
    } else if (cena.fogo === 'frio') {
      [[32, 52], [96, 48], [28, 70], [100, 66], [64, 30]].forEach(function (f, i) {
        var y = f[1] + (t === null ? 0 : Math.floor(t / 180 + i * 3) % 5), c = i % 2 ? '#8fcbe8' : '#ffffff';
        ret(x, f[0] - 2, y, 5, 1, c); ret(x, f[0], y - 2, 1, 5, c); ret(x, f[0], y, 1, 1, '#3f8fe0');
      });
    }
  }

  /* ---------- o que está na panela ---------- */
  // q = quanto já é líquido (0 sólido, 1 líquido), andando com a mudança
  function liquidez(cena) {
    var fim = cena.estado === 'solido' ? 0 : 1, ini = cena.de ? (cena.de === 'solido' ? 0 : 1) : fim, p = cena.p === undefined ? 1 : cena.p;
    return ini + (fim - ini) * p;
  }
  // altura da poça: a água fervendo vai secando (vira vapor)
  function nivel(cena) {
    if (cena.material !== 'agua') return 8;
    if (cena.estado === 'gas') return Math.max(2, 14 - Math.round((cena.graus - 90) / 2));
    return 14;
  }
  function poca(x, c, h) {
    if (h <= 0) return;
    ret(x, 42, CHAO - h + 1, 45, h, c.poca);
    ret(x, 42, CHAO - h + 1, 45, 1, c.brilho);
    ret(x, 48, CHAO - h + 2, 6, 1, c.brilho);
  }
  // o pedaço, do jeito que foi para a panela (s = quanto ainda é sólido)
  function pedaco(x, cena, c, s) {
    if (s <= 0) return;
    var m = cena.material;
    function bloco(bx, by, w, h) {                                 // um bloco com contorno, luz em cima e sombra do lado
      h = Math.max(1, Math.round(h * s)); var y = by - h + 1;
      ret(x, bx - 1, y - 1, w + 2, h + 2, K); ret(x, bx, y, w, h, c.meio);
      ret(x, bx, y, w, 1, c.claro); ret(x, bx + w - 2, y + 1, 2, h - 1, c.sombra);
      return y;
    }
    if (m === 'agua') {                                            // três cubos de gelo
      var ya = bloco(45, CHAO, 12, 12), yb = bloco(62, CHAO, 12, 12);
      bloco(54, Math.min(ya, yb) - 2, 12, 11);
      ret(x, 47, ya + 2, 2, 2, '#ffffff'); ret(x, 64, yb + 2, 2, 2, '#ffffff');
    } else if (m === 'chocolate') {                                // a barra com os quadradinhos
      var yc = bloco(48, CHAO, 33, 12);
      for (var i = 58; i < 80; i += 11) ret(x, i, yc, 1, CHAO - yc + 1, c.sombra);
      if (CHAO - yc > 6) ret(x, 48, yc + Math.round((CHAO - yc) / 2), 33, 1, c.sombra);
    } else if (m === 'manteiga') {
      var ym = bloco(51, CHAO, 26, 13);
      ret(x, 53, ym + 1, 22, 1, c.claro);
    } else {                                                       // o toco de vela com o pavio
      var yv = bloco(58, CHAO, 12, 24);
      ret(x, 63, yv - 4, 1, 3, K); ret(x, 60, yv + 1, 2, Math.max(1, CHAO - yv - 2), c.claro);
      if (cena.fogo === 'quente' && s < 1) ret(x, 59, yv, 10, 1, c.poca);   // escorrendo pela beirada
    }
  }
  // o que endureceu de novo na panela vira uma placa lisa, do formato da poça
  function placa(x, cena, c, s) {
    var h = Math.max(3, Math.round(nivel(cena) * s)), y = CHAO - h + 1;
    if (cena.material === 'agua') {
      ret(x, 42, y, 45, h, c.meio); ret(x, 42, y, 45, 1, c.claro);
      for (var i = 46; i < 86; i += 9) ret(x, i, y + 2, 3, 1, '#ffffff');   // rachadinhas
      return;
    }
    // tablete fosco de borda reta: contorno, luz na quina de cima, sombra embaixo e os vincos
    ret(x, 43, y - 1, 43, h + 1, K); ret(x, 44, y, 41, h - 1, c.meio);
    ret(x, 44, y, 41, 1, c.claro); ret(x, 44, CHAO - 1, 41, 1, c.sombra);
    if (cena.material === 'chocolate') for (i = 53; i < 85; i += 9) ret(x, i, y + 1, 1, h - 2, c.sombra);
    else if (cena.material === 'manteiga') { ret(x, 47, y + 2, 8, 1, c.claro); ret(x, 70, y + 3, 6, 1, c.claro); }
    else for (i = 47; i < 84; i += 7) ret(x, i, y + 2 + (i % 2), 1, 1, c.sombra);
    ret(x, 46, y + 1, 2, 1, '#ffffff');
  }
  function panela(x, cena, t) {
    var c = COR[cena.material] || COR.agua, q = liquidez(cena), h = nivel(cena);
    ret(x, 41, BORDA + 1, 47, CHAO - BORDA, 'rgba(210, 238, 255, 0.35)');     // o vidro por dentro
    var forma = cena.forma === 'placa' ? placa : pedaco;
    if (q > 0) poca(x, c, Math.round(h * q));
    if (q < 1) forma(x, cena, c, 1 - q);
    if (cena.material === 'agua' && cena.estado === 'gas') ferver(x, cena, t, h);
    if (cena.gotas) gotinhas(x, cena, t);
    // as paredes de vidro, a alça e o reflexo
    ret(x, 39, BORDA, 2, CHAO - BORDA + 3, K); ret(x, 88, BORDA, 2, CHAO - BORDA + 3, K); ret(x, 39, CHAO + 1, 51, 2, K);
    ret(x, 41, BORDA, 1, CHAO - BORDA + 1, '#e6f6ff'); ret(x, 87, BORDA, 1, CHAO - BORDA + 1, '#9cc8e0');
    ret(x, 44, BORDA + 4, 1, 16, 'rgba(255, 255, 255, 0.7)'); ret(x, 46, BORDA + 6, 1, 6, 'rgba(255, 255, 255, 0.5)');
    ret(x, 33, 52, 7, 3, K); ret(x, 34, 53, 5, 1, '#9cc8e0'); ret(x, 89, 52, 7, 3, K); ret(x, 89, 53, 6, 1, '#9cc8e0');
    if (cena.graus < 0) for (var i = 0; i < 9; i++) ret(x, i % 2 ? 87 : 41, BORDA + 4 + i * 3, 1, 1, '#ffffff');   // geada
    // a tampa de vidro (embaçada com o vapor)
    var vapor = cena.material === 'agua' && cena.estado === 'gas';
    ret(x, 37, 42, 55, 4, K); ret(x, 38, 43, 53, 2, vapor ? '#eef6fb' : '#cfefff'); ret(x, 40, 43, 10, 1, '#ffffff');
    ret(x, 60, 38, 9, 4, K); ret(x, 61, 39, 7, 2, '#8a94aa'); ret(x, 62, 39, 3, 1, '#b9c4d6');
  }
  // água fervendo: bolhas subindo na água e o vapor (nuvenzinhas) indo até a tampa
  function ferver(x, cena, t, h) {
    var agua = CHAO - h + 1, f = t === null ? 0 : Math.floor(t / 110);
    for (var i = 0; i < 8; i++) {
      var bx = 45 + i * 5, sobe = (f + i * 3) % Math.max(2, h);
      if (h > 3) ret(x, bx, CHAO - 1 - sobe, 2, 2, '#e6f6ff');
      ret(x, bx - 1, agua - 1, 4, 1, '#e6f6ff');                     // a água borbulhando na superfície
    }
    var ar = agua - BORDA - 2;
    for (i = 0; i < 6; i++) {
      var nx = 44 + ((i * 17) % 38) + Math.round(onda(t, 500, i) * 2), ny = BORDA + 2 + ((ar * 2 - (f + i * 5)) % ar + ar) % ar;
      ret(x, nx, ny, 5, 2, 'rgba(255, 255, 255, 0.85)'); ret(x, nx + 1, ny - 1, 3, 1, 'rgba(255, 255, 255, 0.85)');
    }
    ret(x, 41, BORDA + 1, 47, 2, 'rgba(255, 255, 255, 0.6)');       // vapor juntando embaixo da tampa
  }
  // condensar: gotinhas penduradas na tampa fria (e uma pingando de volta)
  function gotinhas(x, cena, t) {
    for (var i = 43; i < 86; i += 5) {
      var cai = i % 3 ? 0 : (t === null ? 0 : Math.floor(t / 90 + i) % 9);
      ret(x, i, BORDA + 1, 2, 2, '#5aa8f0'); ret(x, i, BORDA + 1, 1, 1, '#ffffff');
      if (cai) ret(x, i, BORDA + 2 + cai * 2, 1, 2, '#5aa8f0');
    }
    ret(x, 42, BORDA + 12, 1, 2, '#5aa8f0'); ret(x, 86, BORDA + 9, 1, 2, '#5aa8f0');
  }

  /* ---------- o termômetro ---------- */
  function alturaDe(g) { return Math.round((Math.max(TERMO.min, Math.min(TERMO.max, g)) - TERMO.min) / (TERMO.max - TERMO.min) * (TERMO.base - TERMO.topo)); }
  function termometro(x, cena) {
    var tx = TERMO.x;
    ret(x, tx - 4, TERMO.topo - 3, 9, TERMO.base - TERMO.topo + 6, K);
    ret(x, tx - 3, TERMO.topo - 2, 7, TERMO.base - TERMO.topo + 4, '#ffffff');
    ret(x, tx - 1, TERMO.topo, 3, TERMO.base - TERMO.topo + 1, '#e2e6ee');
    circ(x, tx, TERMO.base + 7, 7, K); circ(x, tx, TERMO.base + 7, 6, '#ffffff'); circ(x, tx, TERMO.base + 7, 4, '#e53935');
    var h = alturaDe(cena.graus);
    ret(x, tx - 1, TERMO.base - h, 3, h + 4, '#e53935'); ret(x, tx - 1, TERMO.base - h, 1, h + 3, '#ff8a80');
    for (var g = TERMO.min; g <= TERMO.max; g += 10) {                // riscos a cada 10 °C; 0 °C azul e 100 °C vermelho
      var y = TERMO.base - alturaDe(g), marca = g === 0 || g === 100;
      ret(x, tx - (marca ? 9 : 7), y, marca ? 5 : 3, 1, g === 0 ? '#3f8fe0' : g === 100 ? '#e53935' : K);
    }
    ret(x, tx + 1, TERMO.topo + 1, 1, 3, '#ffffff');
  }

  /* ---------- a lupa com as bolinhas ---------- */
  var arranjos = {};
  function arranjo(estado) {
    if (arranjos[estado]) return arranjos[estado];
    var l = [], rnd = R.Desenho.rng(estado.length * 977);
    if (estado === 'solido') {                                      // juntinhas, em fileiras
      for (var gy = -3; gy <= 3; gy++) for (var gx = -3; gx <= 3; gx++) if (gx * gx + gy * gy <= 10) l.push([gx * 4, gy * 4]);
    } else {
      var n = estado === 'liquido' ? 19 : 7, dist = estado === 'liquido' ? 4 : 9, lim = estado === 'liquido' ? 13 : 12;
      for (var k = 0; l.length < n && k < 3000; k++) {
        var p = [Math.round((rnd() * 2 - 1) * lim), Math.round((rnd() * 2 - 1) * lim)];
        if (estado === 'liquido' && p[1] < -5) continue;             // o líquido fica embaixo, soltinho
        if (p[0] * p[0] + p[1] * p[1] > lim * lim) continue;
        if (l.some(function (o) { return Math.abs(o[0] - p[0]) < dist && Math.abs(o[1] - p[1]) < dist; })) continue;
        l.push(p);
      }
    }
    return (arranjos[estado] = l);
  }
  // onde a bolinha i está no instante t: tremendo no lugar, escorregando ou voando e batendo nas beiradas
  function mexer(estado, b, i, t) {
    if (t === null) return b;
    if (estado === 'solido') { var f = Math.floor(t / 120) + i * 7; return [b[0] + (f % 3) - 1, b[1] + (Math.floor(f / 3) % 3) - 1]; }
    if (estado === 'liquido') return [b[0] + Math.round(onda(t, 420, i) * 2), b[1] + Math.round(onda(t, 610, i * 2))];
    function vai(v, vel) { var s = 24, u = ((v + 12 + vel * t / 40) % (2 * s) + 2 * s) % (2 * s); return (u < s ? u : 2 * s - u) - 12; }
    return [vai(b[0], 1 + (i % 3) * 0.4), vai(b[1], i % 2 ? 0.8 : -1.1)];
  }
  function lupa(x, cena, t) {
    var cx = LUPA.x, cy = LUPA.y, r = LUPA.r, c = COR[cena.material] || COR.agua;
    for (var i = 0; i < 6; i++) ret(x, 34 + i, 36 + i, 4, 4, i % 5 ? '#8e5433' : K);   // o cabo
    circ(x, cx, cy, r + 4, K); circ(x, cx, cy, r + 3, '#b9c4d6'); circ(x, cx, cy, r + 1, K); circ(x, cx, cy, r, '#eef8ff');
    var fim = arranjo(cena.estado), de = cena.de ? arranjo(cena.de) : fim, p = cena.p === undefined ? 1 : cena.p;
    var n = Math.max(fim.length, de.length);
    for (i = 0; i < n; i++) {
      var a = de[i] || fim[i], b = fim[i] || de[i];
      if (!fim[i] && p >= 1) continue;                               // sobrou do arranjo de antes: some no fim
      var pa = mexer(cena.de || cena.estado, a, i, t), pb = mexer(cena.estado, b, i, t);
      var bx = Math.round(cx + pa[0] + (pb[0] - pa[0]) * p), by = Math.round(cy + pa[1] + (pb[1] - pa[1]) * p);
      if ((bx - cx) * (bx - cx) + (by - cy) * (by - cy) > (r - 2) * (r - 2)) continue;
      ret(x, bx - 1, by - 1, 3, 3, c.bola); ret(x, bx - 1, by - 1, 1, 1, '#ffffff');
    }
    // o brilho do vidro da lupa
    for (var j = -r + 4; j < -r + 9; j++) { var m = meia(r - 3, j); if (m > 0) ret(x, cx - m, cy + j, 1, 1, '#ffffff'); }
  }

  /**
   * Pinta a cena inteira no canvas (L×A pixels de arte).
   * @param {HTMLCanvasElement} tela @param {Object} cena @param {number|null} t
   */
  function desenhar(tela, cena, t) {
    var x = tela.getContext('2d');
    x.imageSmoothingEnabled = false;
    t = t === undefined ? null : t;
    fundo(x);
    fogao(x, cena);
    calor(x, cena, t);
    panela(x, cena, t);
    termometro(x, cena);
    lupa(x, cena, t);
  }

  R.QuimicaEstados = { L: L, A: A, desenhar: desenhar };
})();
