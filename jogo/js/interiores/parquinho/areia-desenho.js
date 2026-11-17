/* Parquinho, parte 10: o desenho da caixa de areia de perto e do que fica na caixa do parque (docs/contratos/parquinho.md),
   em Reino.ParquinhoAreia (areia-caixa.js): desenhar(ctx, op) pinta a caixa de perto (A.W × A.H px de arte) e
   desenharMundo(ctx, px, py) as torres e os buracos na caixa do parque (objetos.js). Também registra os ícones das
   ferramentas (parquinho:pazinha, balde, rastelo, estrela-do-mar, bandeirinha).
   A areia sai em fileiras, de trás para a frente: cada célula sobe (ou desce) a altura dela e mostra a parede da
   frente quando a célula da frente é mais baixa (o buraco mostra a parede de trás, úmida). Torres, enfeites, ela e o
   unicórnio entram na fileira dos pés deles. Pixel art (arte.md): só retângulos, contorno K.
   node: true: nada de canvas, PA nem Progresso no carregamento (os sprites vêm de P.H na hora de desenhar). */
(function () {
  var R = window.Reino;
  var A = R.ParquinhoAreia, P = R._predios.parquinho;
  var D = R.Desenho, K = D.K, ret = D.ret;
  var W = A.W, H = A.H, CEL = A.CEL, AR = A.AREIA;
  var MAD = '#c98a4a', MAD_CLARA = '#e0a868', MAD_ESCURA = '#a8703a', VEIO = '#b67b41';
  var TOPO = { '-3': '#a8803e', '-2': '#bf9650', '-1': '#d6b268', 0: '#f3dc9a', 1: '#f5e2a8', 2: '#f7e7b4', 3: '#f9ecc0', 4: '#faefca', 5: '#fbf2d2' };
  var FACE = '#dcbc78', FACE_FUNDA = '#b48c48', GRAO = '#d8bd78', LUZ = '#fff6dc', SOMBRA_D = '#e2c584';
  var TORRE = { a: '#e8c77e', l: '#f6e2a8', s: '#c9a45e', f: '#d6b46a' };
  // os enfeites, de baixo para cima, com o ponto de apoio embaixo no meio
  var ENFEITE = {
    concha: { d: ['.kkk.', 'kpwpk', 'kwpwk', '.kkk.'], p: { k: K, p: '#ff9fc8', w: '#ffe3ef' } },
    estrela: { d: ['..o..', 'ooooo', '.ooo.', '.d.d.'], p: { o: '#ff9f45', d: '#e07a2a' } },
    bandeira: { d: ['krr.', 'krrr', 'kr..', 'k...', 'k...', 'k...'], p: { k: K, r: '#ff7eb6' } },
    flor: { d: ['.w.', 'wyw', '.w.', '.g.'], p: { w: '#ffffff', y: '#ffd34d', g: '#5fb46a' } },
  };

  /* ---------- os ícones das ferramentas (botões da tela) ---------- */
  R.registrarIcones({
    'parquinho:pazinha': { n: 'pazinha', p: { k: K, h: '#ff5c6a', y: '#ffd34d', l: '#fff1a0' }, d: [
      '................', '............kk..', '...........khhk.', '..........khhhk.', '.........khhhk..', '........khhhk...',
      '...kkk.khhhk....', '..klllkhhhk.....', '.klllyhhhk......', 'klllyyhhk.......', '.klyyyyk........', '.kyyyyyk........',
      '.kyyyyk.........', '.kyyyk..........', '..kkk...........', '................'] },
    'parquinho:balde': { n: 'balde', p: { k: K, r: '#ff5c6a', l: '#ffb0b8', w: '#ffd1d6', d: '#d8404f' }, d: [
      '................', '....kkkkkkkk....', '...k........k...', '..k..........k..', '..k..........k..', '...kkkkkkkkkk...',
      '..kwwwwwwwwwwk..', '..klrrrrrrrrrk..', '..klrrrrrrrrrk..', '..klrrrrrrrrrk..', '..klrrrrrrrrrk..', '...klrrrrrrrk...',
      '...klrrrrrrrk...', '...kddddddddk...', '....kkkkkkkk....', '................'] },
    'parquinho:rastelo': { n: 'rastelo', p: { k: K, h: '#c98a4a', v: '#5fb46a' }, d: [
      '.......kk.......', '......khhk......', '......khhk......', '......khhk......', '......khhk......', '......khhk......',
      '......khhk......', '......khhk......', '......khhk......', '..kkkkkhhkkkkk..', '.kvvvvvvvvvvvvk.', '.kkvkkvkkvkkvkk.',
      '..kvkkvkkvkkvk..', '...k..k..k..k...', '................', '................'] },
    'parquinho:estrela-do-mar': { n: 'estrela-do-mar', p: { k: K, o: '#ff9f45', l: '#ffc98a', d: '#e07a2a' }, d: [
      '................', '................', '.......kk.......', '......kllk......', '......klok......', '.kkkkkllookkkkk.',
      'kllllllodooooook', '.kkooooooooookk.', '...koooodoook...', '....kodooodk....', '....kooooook....', '....kooodook....',
      '...koookkoook...', '...kokk..kkok...', '....k......k....', '................'] },
    'parquinho:bandeirinha': { n: 'bandeirinha', p: { k: K, m: '#c98a4a', r: '#ff7eb6', l: '#ffc4dd' }, d: [
      '................', '....k...........', '...kmkkk........', '...kmlllkkk.....', '...kmllllllkk...', '...kmrrrrrrrrk..',
      '...kmrrrrrrkk...', '...kmrrrkkk.....', '...kmkkk........', '...kmk..........', '...kmk..........', '...kmk..........',
      '...kmk..........', '...kmk..........', '...kmk..........', '....k...........'] },
  });

  function pix(ctx, x, y, e) {   // um enfeite com o apoio em (x, y): o meio da linha de baixo
    var d = e.d, x0 = x - (d[0].length >> 1), y0 = y - d.length + 1;
    for (var j = 0; j < d.length; j++) for (var i = 0; i < d[j].length; i++) {
      var c = d[j][i];
      if (c !== '.') ret(ctx, x0 + i, y0 + j, 1, 1, e.p[c]);
    }
  }
  function grao(c, l) { return ((c * 73856093) ^ (l * 19349663)) >>> 0; }

  /* ---------- a moldura de madeira ---------- */
  function moldura(ctx) {
    ret(ctx, 0, 0, W, H, K);
    ret(ctx, 1, 1, W - 2, 2, MAD); ret(ctx, 1, 1, W - 2, 1, MAD_CLARA);          // a tábua de trás (de cima)
    ret(ctx, 1, 1, 2, AR.y + AR.h - 1, MAD); ret(ctx, 1, 1, 1, AR.y + AR.h - 1, MAD_CLARA);   // as dos lados
    ret(ctx, W - 3, 1, 2, AR.y + AR.h - 1, MAD); ret(ctx, W - 3, 1, 1, AR.y + AR.h - 1, MAD_CLARA);
    var yf = AR.y + AR.h;                                                          // a da frente: de cima e de frente
    ret(ctx, 1, yf + 1, W - 2, 2, MAD_CLARA); ret(ctx, 1, yf + 3, W - 2, H - yf - 4, MAD_ESCURA);
    [[6, 18], [30, 22], [58, 14]].forEach(function (v) { ret(ctx, v[0], yf + 4 + (v[0] % 3), v[1], 1, VEIO); });
    ret(ctx, 4, yf + 1, 1, 2, MAD); ret(ctx, W - 5, yf + 1, 1, 2, MAD);             // os pregos
  }

  /* ---------- a areia, uma fileira (l) ---------- */
  // montinho: sobe a altura dele e mostra a parede da frente; buraco: fica no lugar, mais escuro e úmido quanto
  // mais fundo, com a sombra da beira de trás (de cima ele se lê melhor assim)
  function fileira(ctx, l) {
    var y = AR.y + l * CEL;
    for (var c = 0; c < A.COLS; c++) {
      var v = A.altura(c, l), x = AR.x + c * CEL, cima = l > 0 ? A.altura(c, l - 1) : 0;
      if (v < 0) {
        ret(ctx, x, y, CEL, CEL, TOPO[v]);
        if (cima > v) ret(ctx, x, y, CEL, 1, cima < 0 ? TOPO[Math.max(A.MIN, v - 1)] : FACE_FUNDA);
        if ((c > 0 ? A.altura(c - 1, l) : 0) > v) ret(ctx, x, y, 1, CEL, FACE_FUNDA);
        continue;
      }
      var frente = l + 1 < A.LINS ? Math.max(0, A.altura(c, l + 1)) : 0, topo = y - v;
      if (v > frente) ret(ctx, x, topo + CEL, CEL, v - frente, FACE);                       // a parede da frente
      ret(ctx, x, topo, CEL, CEL, TOPO[v]);
      if (v > 0 && v > cima) ret(ctx, x, topo, CEL, 1, LUZ);                                 // a beira de cima pega luz
      if (v > 0 && v > (c + 1 < A.COLS ? A.altura(c + 1, l) : 0)) ret(ctx, x + 1, topo + 1, 1, CEL - 1, SOMBRA_D);
      var g = grao(c, l);
      if (g % (v ? 5 : 7) === 0) ret(ctx, x + (g >> 3 & 1), topo + (g >> 4 & 1), 1, 1, GRAO);   // os grãos
    }
  }

  /* ---------- torres e enfeites ---------- */
  function andar(ctx, cx, yb, w, topo) {   // um balde de areia virado (mais largo embaixo), a linha de baixo em yb
    var x0 = cx - (w >> 1), y0 = yb - A.ANDAR + 1, i;
    ret(ctx, x0, y0 + 1, w, A.ANDAR, K); ret(ctx, x0 + 1, y0, w - 2, 1, K);
    ret(ctx, x0 + 1, y0 + 1, w - 2, A.ANDAR - 1, TORRE.a);
    ret(ctx, x0 + 2, y0 + 1, w - 4, 1, TORRE.l);                                  // o degrau de cima pega luz
    ret(ctx, x0 + 1, y0 + 1, 1, A.ANDAR - 1, TORRE.l); ret(ctx, x0 + w - 2, y0 + 2, 1, A.ANDAR - 2, TORRE.s);
    ret(ctx, x0 + 1, yb, w - 2, 1, TORRE.f);                                       // a sombra no pé do andar
    if (!topo) return;
    var ameias = [];                                                               // as ameias: blocos de 3 px
    for (i = x0; i + 2 <= x0 + w - 1; i += 4) ameias.push(i);
    if (ameias[ameias.length - 1] !== x0 + w - 3) ameias.push(x0 + w - 3);
    ameias.forEach(function (ax) { ret(ctx, ax, y0 - 2, 3, 3, K); ret(ctx, ax + 1, y0 - 1, 1, 2, TORRE.l); });
    if (w >= 7) ret(ctx, cx, yb - 3, 1, 2, K);                                     // a janelinha
  }
  // o topo (onde vão os enfeites) e o desenho de uma torre
  function topoDaTorre(t) { return t.y - t.base - A.ANDAR * t.andares - 2; }
  function torre(ctx, t) {
    var pe = t.y - t.base;
    ret(ctx, t.x - 6, pe + 1, 13, 1, FACE);                                        // a sombrinha na areia
    for (var k = 0; k < t.andares; k++) andar(ctx, t.x, pe - k * A.ANDAR, A.TORRE_LARG - 2 * k, k === t.andares - 1);
  }
  function enfeite(ctx, e) {
    if (e.torre) { pix(ctx, e.torre.x + e.dx, topoDaTorre(e.torre), ENFEITE[e.tipo]); return; }
    pix(ctx, e.x, e.y - A.altura(e.c, e.l), ENFEITE[e.tipo]);
  }

  /* ---------- ela e o unicórnio, e o monte que os cobre ---------- */
  function sprites(op) {
    var s = op.sprites || {};
    if (!s.ela && P.H) { try { s.ela = P.H.ela(true, 'frente'); s.uni = P.H.uni('frente'); } catch (e) { /* sem save */ } }
    return s;
  }
  function personagem(ctx, q, spr, op) {
    if (!spr) return;
    A.medir(q, spr.width, spr.height);
    var b = A.corpo(q), st = A.estado(), max = R.config.parquinho.areia.cobrirPassadas;
    var n = st.cobre[q], ri = op.risadas && op.risadas[q], dx = 0, t = op.t || 0;
    if (ri && op.animar && t - ri < 1200) dx = Math.floor((t - ri) / 120) % 2 ? 1 : -1;   // a risadinha: a cabeça balança
    if (!n) ret(ctx, b.cx - (b.larg >> 1) + 2, b.pe, (b.larg >> 1) * 2 - 3, 1, FACE);   // a sombra: uma risca na areia
    ctx.drawImage(spr, b.x + dx, b.y);
    if (n > 0) monte(ctx, b, Math.max(2, Math.round(b.pescoco * n / max)), b.pescoco);
    if (ri && op.animar && t - ri < 1200) notinhas(ctx, b, t - ri);
  }
  // o monte de areia em cima deles: da linha dos pés até h px para cima (no máximo, o pescoço), largo embaixo e
  // estreito em cima, de ombros redondos e contorno K como as torres (hMax = a altura até o pescoço: o monte baixo é
  // a parte de baixo do cheio)
  function monte(ctx, b, h, hMax) {
    var base = (b.larg >> 1) + 1, topo = Math.max(3, b.larg >> 2), r, meia, y;
    if (b.pe + 1 < AR.y + AR.h) ret(ctx, b.cx - base - 1, b.pe + 1, base * 2 + 3, 1, FACE);   // a sombrinha (nunca na moldura)
    for (r = 0; r <= h; r++) {
      meia = Math.round(base + (topo - base) * Math.sqrt(Math.min(1, r / Math.max(1, hMax))));
      if (r === h) meia -= 2; else if (r === h - 1) meia -= 1;                      // a curva de cima
      y = b.pe - r;                                                                  // r = 0: o chão, logo abaixo do desenho
      if (r === h) { ret(ctx, b.cx - meia - 1, y, meia * 2 + 3, 1, K); continue; }
      ret(ctx, b.cx - meia - 1, y, meia * 2 + 3, 1, K);
      ret(ctx, b.cx - meia, y, meia * 2 + 1, 1, TOPO[1]);
      ret(ctx, b.cx + meia - 1, y, 2, 1, SOMBRA_D);                                   // a sombra da direita
      if (r >= h - 2) ret(ctx, b.cx - meia + 1, y, Math.max(1, meia), 1, LUZ);       // o alto pega luz
      else ret(ctx, b.cx - meia, y, 1, 1, LUZ);
      if ((r * 7 + b.cx) % 3 === 0) ret(ctx, b.cx - meia + 2 + (r * 5) % Math.max(1, meia * 2 - 3), y, 1, 1, GRAO);
    }
  }
  function notinhas(ctx, b, e) {   // risadinha: três brilhinhos subindo da cabeça
    [[-6, 0], [5, 300], [0, 600]].forEach(function (n) {
      var k = (e - n[1]) / 600;
      if (k < 0 || k > 1) return;
      var x = b.cx + n[0], y = b.y - 2 - Math.round(k * 6);
      ret(ctx, x, y - 1, 1, 3, '#ff7eb6'); ret(ctx, x - 1, y, 3, 1, '#ff7eb6'); ret(ctx, x, y, 1, 1, '#ffffff');
    });
  }

  /* ---------- a caixa de perto ---------- */
  // op = { t, animar, sprites?: { ela, uni }, risadas?: { ela: t0, uni: t0 }, efeitos?: [{ x, y, t0, tipo }],
  //        cursor?: { x, y } }
  A.desenhar = function (ctx, op) {
    op = op || {};
    var st = A.estado(), spr = sprites(op), filas = {}, l;
    function fila(y) { var f = Math.max(0, Math.min(A.LINS - 1, Math.floor((y - AR.y) / CEL))); return (filas[f] = filas[f] || []); }
    st.torres.forEach(function (t) { fila(t.y).push(function () { torre(ctx, t); }); });
    st.enfeites.forEach(function (e) {
      if (e.torre) fila(e.torre.y).push(function () { enfeite(ctx, e); });
      else fila(e.y).push(function () { enfeite(ctx, e); });
    });
    ['ela', 'uni'].forEach(function (q) { fila(A.QUEM[q].pe).push(function () { personagem(ctx, q, spr[q], op); }); });
    ctx.clearRect(0, 0, W, H);
    moldura(ctx);
    ret(ctx, AR.x, AR.y, AR.w, AR.h, TOPO[0]);
    ctx.save();
    ctx.beginPath(); ctx.rect(AR.x, 0, AR.w, AR.y + AR.h); ctx.clip();
    ret(ctx, AR.x, AR.y, AR.w, 1, '#e3c788');                                       // a sombra da tábua de trás
    for (l = 0; l < A.LINS; l++) fileira(ctx, l);
    ctx.restore();
    // de trás para a frente: torres, enfeites, ela e o unicórnio (fora do recorte: a torre alta passa da tábua)
    for (l = 0; l < A.LINS; l++) (filas[l] || []).forEach(function (f) { f(); });
    (op.efeitos || []).forEach(function (f) { efeito(ctx, f, op.t || 0); });
    if (op.cursor) cursor(ctx, op.cursor.x, op.cursor.y);
  };
  function efeito(ctx, f, t) {   // os grãos que voam da pazinha e da mão
    var k = (t - f.t0) / 350;
    if (k < 0 || k > 1) return;
    [[-3, 1], [2, 0], [4, 2], [-1, 3]].forEach(function (g, i) {
      var x = Math.round(f.x + g[0] * k * 1.5), y = Math.round(f.y - Math.sin(k * Math.PI) * (4 + g[1]));
      ret(ctx, x, y, 1, 1, i % 2 ? TOPO[1] : TOPO['-1']);
    });
  }
  // o cursor do teclado: quatro cantos de contorno duplo (escuro por fora, branco por dentro) e o miolo, para
  // aparecer em qualquer fundo (areia, buraco, torre, o contorno deles)
  function cursor(ctx, x, y) {
    x = Math.round(x); y = Math.round(y);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
      var cx = x + s[0] * 5, cy = y + s[1] * 5, hx = s[0] < 0 ? cx : cx - 3, vy = s[1] < 0 ? cy : cy - 3;
      ret(ctx, hx - 1, cy - 1, 6, 3, K); ret(ctx, cx - 1, vy - 1, 3, 6, K);
      ret(ctx, hx, cy, 4, 1, '#ffffff'); ret(ctx, cx, vy, 1, 4, '#ffffff');
    });
    ret(ctx, x - 1, y - 1, 3, 3, K); ret(ctx, x, y, 1, 1, '#ffffff');
  }

  /* ---------- na caixa do parque (objetos.js): buracos, montinhos e as torres, em miniatura ---------- */
  // o miolo de areia da caixa do parque: x px+5..px+42, y py+7..py+26 (38 × 20 px)
  A.desenharMundo = function (ctx, px, py) {
    var st = A.estado(), mx = 38 / AR.w, my = 20 / AR.h, x, y;
    for (y = 0; y < 20; y++) for (x = 0; x < 38; x++) {
      var v = A.altura(Math.floor(x / mx / CEL), Math.floor(y / my / CEL));
      if (v < 0) ret(ctx, px + 5 + x, py + 7 + y, 1, 1, v < -1 ? TOPO['-3'] : GRAO);
      else if (v > 1) ret(ctx, px + 5 + x, py + 7 + y, 1, 1, TOPO[3]);
    }
    st.torres.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (t) {
      var cx = px + 5 + Math.round((t.x - AR.x) * mx), yb = py + 7 + Math.round((t.y - AR.y) * my), h = 2 + 2 * t.andares;
      ret(ctx, cx - 2, yb - h, 5, h + 1, K); ret(ctx, cx - 1, yb - h + 1, 3, h - 1, TORRE.a);
      ret(ctx, cx - 1, yb - h + 1, 1, h - 1, TORRE.l); ret(ctx, cx + 1, yb - h + 2, 1, h - 2, TORRE.s);
      [-2, 0, 2].forEach(function (d) { ret(ctx, cx + d, yb - h - 1, 1, 1, K); });   // as ameias
      if (st.enfeites.some(function (e) { return e.torre === t && e.tipo === 'bandeira'; })) {
        ret(ctx, cx, yb - h - 4, 1, 4, K); ret(ctx, cx + 1, yb - h - 4, 2, 1, '#ff7eb6');
      }
    });
  };
})();
