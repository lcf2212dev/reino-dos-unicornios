/* Laboratório de Química, a bancada, parte 1 de 3: o palco (o canvas da bancada, 160×96 px de arte): o fundo, o
   béquer com as camadas, os tubos de ensaio (em pé e inclinados), o despejar e o laço de animação.
   Cria o interno Reino._quimicaPalco (docs/contratos/quimica.md §2), que guarda: W, H, BEQ (a geometria do béquer),
   MESA, EFEITOS (efeito → { dur, sons: [[ms, som]], som, desenhar(ctx, t, info) }; quimica-palco-2.js registra as reações
   e o 'nada'), os helpers de desenho que os efeitos usam e criar(canvas) (o palco de uma tela aberta).
   Quem usa: quimica-palco-2.js e quimica-bancada.js. Pixel art (ui.md §10): só retângulos e os círculos de pixel do
   Reino.Desenho; sem arc, degradê nem blur. Sem animação (Reino.util.animar() falso): nada de rAF, só o quadro final. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, clarear = D.clarear, escurecer = D.escurecer, sorte = D.sorte;
  var W = 160, H = 96;
  // béquer: contorno de fora x 60..99, y 34..80; por dentro x 61..98; o líquido começa em y 78; 10 px por tubo
  var BEQ = { x: 60, w: 40, topo: 34, base: 80, dentroX: 61, dentroW: 38, fundo: 78, camada: 10, meio: 80 };
  var MESA = 76;   // o tampo da bancada (y 76..83); a frente, de 84 para baixo
  var VIDRO = '#eef9ff', VIDRO_TUBO = '#e3f4ff', PAREDE = '#e4f3ee', REJUNTE = '#cde6df', BRANCO = C.branco;
  var SOMBRA = 'rgba(58,36,70,0.2)';   // --sombra-chao
  var P = R._quimicaPalco = { W: W, H: H, BEQ: BEQ, MESA: MESA, EFEITOS: {}, SOMBRA: SOMBRA, VIDRO: VIDRO };

  /* ================= O CENÁRIO ================= */
  function frasco(ctx, x, y, r, cor) {   // balão de fundo redondo: bojo de raio r com o centro em (x, y), gargalo em cima
    ret(ctx, x - 2, y - r - 7, 5, 8, K); ret(ctx, x - 1, y - r - 6, 3, 7, VIDRO);
    circulo(ctx, x, y, r + 1, K); circulo(ctx, x, y, r, VIDRO);
    ret(ctx, x - 3, y - r - 8, 7, 2, K);
    for (var j = 1; j <= r; j++) {   // o líquido na metade de baixo
      var m = Math.floor(Math.sqrt(r * r - j * j) + 0.35);
      ret(ctx, x - m, y + j - 1, m * 2 + 1, 1, j === 1 ? clarear(cor, 0.4) : cor);
    }
    ret(ctx, x - r + 2, y - 2, 1, 2, BRANCO);
  }
  function tubinho(ctx, x, y, cor) {   // tubo pequeno da estante (3×10 com contorno)
    ret(ctx, x, y, 5, 11, K); ret(ctx, x + 1, y, 3, 10, VIDRO_TUBO); ret(ctx, x + 1, y + 5, 3, 5, cor);
    ret(ctx, x + 1, y + 5, 3, 1, clarear(cor, 0.4)); ret(ctx, x - 1, y, 7, 1, K);
  }
  function fundo(ctx) {
    ret(ctx, 0, 0, W, MESA, PAREDE);
    for (var y = 0; y < MESA; y += 12) {   // azulejos de 12×12, uma fileira sim, outra desencontrada
      ret(ctx, 0, y + 11, W, 1, REJUNTE);
      for (var x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) ret(ctx, x, y, 1, 11, REJUNTE);
    }
    // prateleira na parede (à esquerda) com dois frascos e um vidrinho
    ret(ctx, 6, 30, 44, 4, K); ret(ctx, 7, 31, 42, 2, C.madeira); ret(ctx, 7, 31, 42, 1, C.madeiraClara);
    ret(ctx, 10, 34, 3, 4, K); ret(ctx, 42, 34, 3, 4, K);
    frasco(ctx, 18, 24, 5, C.rosa2); frasco(ctx, 36, 25, 4, C.azul);
    ret(ctx, 25, 19, 6, 11, K); ret(ctx, 26, 21, 4, 8, C.verde); ret(ctx, 26, 20, 4, 1, C.creme2); ret(ctx, 26, 21, 4, 1, clarear(C.verde, 0.4));
    // o tampo e a frente da bancada
    ret(ctx, 0, MESA - 1, W, 1, escurecer(C.madeiraClara, 0.3));
    ret(ctx, 0, MESA, W, 8, C.madeiraClara); ret(ctx, 0, MESA, W, 1, '#f3c996');
    ret(ctx, 0, 84, W, 1, K); ret(ctx, 0, 85, W, 11, C.madeira);
    [[6, 88, 18], [40, 91, 22], [92, 88, 16], [128, 92, 20], [70, 93, 10]].forEach(function (v) { ret(ctx, v[0], v[1], v[2], 1, C.madeira2); });
    // estantezinha de tubos na bancada (à direita)
    ret(ctx, 122, 70, 30, 3, K); ret(ctx, 123, 71, 28, 1, C.madeiraClara);
    ret(ctx, 124, 73, 2, 8, K); ret(ctx, 148, 73, 2, 8, K);
    tubinho(ctx, 127, 63, C.rosa); tubinho(ctx, 134, 63, C.ouro); tubinho(ctx, 141, 63, C.verde);
    elipse(ctx, 137, 81, 14, 1, SOMBRA);
  }

  /* ================= O BÉQUER ================= */
  // o conteúdo é desenhado por dentro(ctx, x0, dx) já recortado ao vidro; dx: o tremor (em px de arte)
  function bequer(ctx, dentro, dx) {
    dx = dx || 0;
    var b = BEQ, x = b.x + dx;
    elipse(ctx, b.meio + dx, b.base + 1, 22, 1, SOMBRA);
    ret(ctx, x, b.topo, b.w, b.base - b.topo + 1, K);
    ret(ctx, x + 1, b.topo + 1, b.w - 2, b.base - b.topo - 1, VIDRO);
    ret(ctx, x - 1, b.topo - 1, b.w + 2, 2, K);                  // a borda (aba) de cima
    ret(ctx, x, b.topo - 1, b.w, 1, BRANCO);
    ret(ctx, x - 3, b.topo - 2, 3, 2, K); ret(ctx, x - 2, b.topo - 2, 2, 1, BRANCO);   // o bico
    if (dentro) {
      ctx.save();
      ctx.beginPath(); ctx.rect(b.dentroX + dx, b.topo + 1, b.dentroW, b.fundo - b.topo); ctx.clip();
      dentro(ctx, b.dentroX + dx, dx);
      ctx.restore();
    }
    // o vidro por cima: risquinhos de medida e o brilho da luz (de cima e da esquerda)
    [44, 54, 64].forEach(function (y) { ret(ctx, x + b.w - 7, y, 4, 1, '#8fa9c2'); ret(ctx, x + b.w - 6, y + 5, 3, 1, '#8fa9c2'); });
    ret(ctx, x + 3, b.topo + 4, 1, 34, BRANCO); ret(ctx, x + 5, b.topo + 6, 1, 6, BRANCO);
  }
  // uma faixa de líquido: linha d'água escura em cima, reflexo claro logo abaixo e a lateral direita mais escura
  function liquido(ctx, x, y, w, h, cor) {
    if (h <= 0) return;
    ret(ctx, x, y, w, h, cor);
    ret(ctx, x + w - 3, y, 3, h, escurecer(cor, 0.1));
    ret(ctx, x, y, w, 1, escurecer(cor, 0.22));
    if (h > 2) ret(ctx, x, y + 1, w, 1, clarear(cor, 0.45));
  }
  // uma faixa de pó: grãozinhos claros e escuros, o topo irregular
  function po(ctx, x, y, w, h, cor, semente) {
    if (h <= 0) return;
    ret(ctx, x, y + 1, w, h - 1, cor);
    for (var i = 0; i < w; i++) {
      if (sorte(i, semente, 3) > 0.4) ret(ctx, x + i, y, 1, 1, escurecer(cor, 0.2));
      for (var j = 1; j < h; j++) {
        var s = sorte(i, j + semente * 11, 7);
        if (s < 0.16) ret(ctx, x + i, y + j, 1, 1, escurecer(cor, 0.22));
        else if (s < 0.24) ret(ctx, x + i, y + j, 1, 1, BRANCO);
      }
    }
  }
  // Partículas do modelo, espalhadas por todo o espaço; cor simbólica, sem nível de líquido.
  function gas(ctx, x, y, w, h, cor, passo) {
    for (var i = 0; i < 14; i++) {
      var px = x + 2 + ((i * 11 + passo) % Math.max(1, w - 4));
      var py = y + ((i * 7 + passo) % Math.max(1, h - 1));
      ret(ctx, px, py, 2, 1, cor);
    }
  }
  // as camadas de baixo para cima: [{ cor, tipo, h }]
  function camadas(ctx, lista, x0) {
    var y = BEQ.fundo + 1;
    lista.forEach(function (c, i) {
      if (!c.h || c.tipo === 'gas') return;
      y -= c.h;
      if (c.tipo === 'po') po(ctx, x0, y, BEQ.dentroW, c.h, c.cor, i + 1);
      else liquido(ctx, x0, y, BEQ.dentroW, c.h, c.cor);
    });
    lista.filter(function (c) { return c.tipo === 'gas'; }).forEach(function (c, i) {
      gas(ctx, x0, BEQ.topo + 3, BEQ.dentroW, Math.max(1, y - BEQ.topo - 4), c.cor, i * 7);
    });
    return y;   // o topo do que tem dentro
  }

  /* ================= PEÇAS DOS EFEITOS ================= */
  // espuma: bolas [[x, y, r]] juntas, com um contorno só em volta de todas, sombra embaixo e brilho em cima
  // (soMiolo: sem o contorno, para pintar listras por cima de uma espuma já desenhada)
  function espuma(ctx, bolas, cor, soMiolo) {
    if (!soMiolo) bolas.forEach(function (b) { circulo(ctx, b[0], b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, b[0], b[1], b[2], escurecer(cor, 0.12)); });
    bolas.forEach(function (b) { if (b[2] > 1) circulo(ctx, b[0] - 1, b[1] - 1, b[2] - 1, cor); });
    bolas.forEach(function (b) { if (b[2] > 2) ret(ctx, b[0] - Math.ceil(b[2] / 2), b[1] - Math.ceil(b[2] / 2), 2, 1, BRANCO); });
  }
  // bolha de sabão: só o anel (a luz não tem contorno, ui.md §10.14.2) e um brilho no alto à esquerda
  function bolha(ctx, x, y, r, cor) {
    for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
      var d = i * i + j * j;
      if (d <= r * r + r * 0.7 && d > (r - 1) * (r - 1) + (r - 1) * 0.7) ret(ctx, x + i, y + j, 1, 1, (i + j < 0) ? cor : clarear(cor, 0.35));
    }
    if (r > 2) ret(ctx, x - Math.floor(r / 2), y - Math.floor(r / 2), 1, 1, BRANCO);
  }
  // brilhinho em cruz: grande (5 px) ou pequeno (3 px)
  function brilho(ctx, x, y, grande, cor) {
    cor = cor || BRANCO;
    if (grande) { ret(ctx, x, y - 2, 1, 5, cor); ret(ctx, x - 2, y, 5, 1, cor); ret(ctx, x, y, 1, 1, C.ouro3); }
    else D.brilho(ctx, x, y, cor);
  }
  // peça de confete (1 ou 2 px, cores da festa: Reino.config.paleta.confete)
  function confete(ctx, x, y, i) {
    var cores = (R.config.paleta && R.config.paleta.confete) || [C.rosa, C.ouro, C.roxo, C.azul, C.laranja, C.verde];
    var f = i % 3;
    ret(ctx, Math.round(x), Math.round(y), f === 0 ? 2 : 1, f === 1 ? 2 : 1, cores[i % cores.length]);
  }
  // fumaça pontilhada: disco em xadrez (densidade 2: xadrez; 1: um em quatro)
  function fumaca(ctx, x, y, r, densidade) {
    for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
      if (i * i + j * j > r * r) continue;
      var px = x + i, py = y + j;
      if (densidade >= 2 ? (px + py) % 2 === 0 : (px % 2 === 0 && py % 2 === 0)) ret(ctx, px, py, 1, 1, '#d8cfe6');
    }
  }
  // cor da mistura (a média das camadas)
  function media(cores) {
    if (!cores.length) return VIDRO;
    var c = cores[0];
    for (var i = 1; i < cores.length; i++) c = D.misturar(c, cores[i], 1 / (i + 1));
    return c;
  }

  /* ================= O TUBO DE ENSAIO ================= */
  // o tubo em pé, sem contorno: grade 8×alto de cores (null = vazio): 24 no despejar, 16 na prateleira.
  // cheio 0..1; naBoca: o líquido junto da boca (virado)
  var TW = 8;
  function gradeTubo(ing, cheio, naBoca, alto) {
    var TH = alto || 24, g = [], n = Math.round((TH - 10) * cheio), po = ing.tipo === 'po';
    for (var y = 0; y < TH; y++) {
      g.push([]);
      for (var x = 0; x < TW; x++) {
        var dentro = y < 2 ? true : y < TH - 2 ? (x >= 1 && x <= 6) : y === TH - 2 ? (x >= 2 && x <= 5) : (x >= 3 && x <= 4);
        if (!dentro) { g[y].push(null); continue; }
        var cor = y === 0 ? BRANCO : VIDRO_TUBO;
        var cheia = ing.tipo !== 'gas' && (naBoca ? (y >= 2 && y < 2 + n) : (y >= TH - n && n > 0));
        if (ing.tipo === 'gas' && y > 2 && y < TH - 2 && x > 2 && (x + y * 3) % 7 === 0) cor = ing.cor;
        if (cheia) {
          var topo = naBoca ? 2 + n - 1 : TH - n;
          cor = ing.cor;
          if (y === topo) cor = naBoca ? escurecer(ing.cor, 0.15) : clarear(ing.cor, 0.45);
          else if (po && sorte(x, y, 5) < 0.3) cor = escurecer(ing.cor, 0.2);
          else if (x === 6) cor = escurecer(ing.cor, 0.12);
        }
        if (x === 2 && y > 2 && y < TH - 4) cor = cheia ? clarear(cor, 0.6) : BRANCO;
        g[y].push(cor);
      }
    }
    return g;
  }
  // gira a grade (vizinho mais próximo, na resolução da arte: pixel continua pixel) e põe o contorno de 1 px em volta.
  // Devolve { g, boca: [x, y] } (a boca na grade girada). ang em graus; positivo gira a boca para a esquerda
  function girar(grade, ang) {
    var TH = grade.length, a = ang * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), M = 15, N = M * 2 + 1, out = [], x, y;
    for (y = 0; y < N; y++) {
      out.push([]);
      for (x = 0; x < N; x++) {
        var dx = x - M, dy = y - M;
        var li = Math.floor(dx * c - dy * s + TW / 2 + 0.5), lj = Math.floor(dx * s + dy * c + TH / 2 + 0.5);
        out[y].push(li >= 0 && li < TW && lj >= 0 && lj < TH ? grade[lj][li] : null);
      }
    }
    var cont = out.map(function (l) { return l.slice(); });
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      if (out[y][x]) continue;
      if ((out[y - 1] && out[y - 1][x]) || (out[y + 1] && out[y + 1][x]) || out[y][x - 1] || out[y][x + 1]) cont[y][x] = K;
    }
    // a boca: o meio da borda de cima (TW/2, 0) levado para a grade girada
    var bx = 0, by = -TH / 2;
    return { g: cont, boca: [Math.round(M + bx * c + by * s), Math.round(M - bx * s + by * c)] };
  }
  function pintarGrade(ctx, g, x, y) {
    for (var j = 0; j < g.length; j++) for (var i = 0; i < g[j].length; i++) if (g[j][i]) ret(ctx, x + i, y + j, 1, 1, g[j][i]);
  }
  // o tubo com a boca em (bx, by)
  function tubo(ctx, ing, ang, bx, by, cheio, naBoca, alto) {
    var r = girar(gradeTubo(ing, cheio, naBoca, alto), ang);
    pintarGrade(ctx, r.g, bx - r.boca[0], by - r.boca[1]);
  }
  /** O tubo em pé num canvas pequeno: 12×18 px de arte (alto 16, a prateleira) ou 12×26 (alto 24, o que se arrasta).
      @param {HTMLCanvasElement} cv @param {object} ing @param {number} [alto] */
  P.tuboDePe = function (cv, ing, alto) {
    alto = alto || 16;
    cv.width = 12; cv.height = alto + 2;
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    tubo(ctx, ing, 0, 6, 1, 1, false, alto);
  };

  /* ================= O DESPEJAR ================= */
  // quadros do tubo: [até (ms), ângulo, boca x, boca y]; o líquido cai entre 180 e 620 ms
  var DESPEJO = [[90, 0, 116, 8], [180, 55, 104, 14], [620, 115, 90, 24], [710, 55, 104, 14], [800, 0, 116, 8]];
  P.DESPEJO_MS = 800;
  var JORRO = [180, 620];
  function progressoDespejo(t) { return Math.max(0, Math.min(1, (t - JORRO[0]) / (JORRO[1] - JORRO[0]))); }
  function despejo(ctx, ing, t, ySup) {
    var q = DESPEJO[DESPEJO.length - 1];
    for (var i = 0; i < DESPEJO.length; i++) if (t < DESPEJO[i][0]) { q = DESPEJO[i]; break; }
    var p = progressoDespejo(t), jorrando = t >= JORRO[0] && t < JORRO[1];
    tubo(ctx, ing, q[1], q[2], q[3], 1 - p, q[1] > 90);
    if (!jorrando) return;
    var bx = q[2], by = q[3] + 1, passo = Math.floor(t / 40);
    if (ing.tipo === 'gas') { gas(ctx, 66, 22, 28, 24, ing.cor, passo); return; }
    if (ing.tipo === 'po') {
      for (var k = 0; k < 12; k++) {
        var y = by + ((k * 7 + passo * 3) % Math.max(1, ySup - by));
        ret(ctx, bx - 1 + (k % 3) - 1, y, 1, 1, k % 2 ? escurecer(ing.cor, 0.3) : ing.cor);
      }
      return;
    }
    for (var yy = by; yy < ySup; yy++) ret(ctx, bx - 1, yy, 2, 1, (yy + passo) % 6 < 4 ? ing.cor : clarear(ing.cor, 0.4));
    ret(ctx, bx + (passo % 2 ? 2 : -4), ySup - 2, 2, 1, clarear(ing.cor, 0.3));   // respingos na superfície
    ret(ctx, bx + (passo % 2 ? -3 : 3), ySup - 1, 1, 1, ing.cor);
  }

  /* ================= O QUADRO ================= */
  // g: { tubos: [ids], despejo: { id, t } | null, reacao: { efeito, t, info } | null }
  function quadro(ctx, g) {
    ctx.clearRect(0, 0, W, H);
    fundo(ctx);
    if (g.reacao) {
      var ef = P.EFEITOS[g.reacao.efeito] || P.EFEITOS.nada;
      ef.desenhar(ctx, Math.min(g.reacao.t, ef.dur), g.reacao.info);
      return;
    }
    var lista = g.tubos.map(function (id) { var ing = R.Quimica.ingrediente(id) || {}; return { cor: ing.cor || VIDRO, tipo: ing.tipo, h: BEQ.camada }; });
    var dp = g.despejo, ingD = dp && R.Quimica.ingrediente(dp.id);
    if (dp && lista.length) lista[lista.length - 1].h = Math.round(BEQ.camada * progressoDespejo(dp.t));
    var topo = BEQ.fundo + 1;
    bequer(ctx, function (c, x0) { topo = camadas(c, lista, x0); });
    if (dp && ingD) despejo(ctx, ingD, dp.t, topo);
  }

  // o que os efeitos recebem: as camadas de antes, quantos tubos, o nível e a receita
  function infoDe(g, r) {
    var ings = g.tubos.map(function (id) { return R.Quimica.ingrediente(id) || { id: id, cor: VIDRO }; });
    var cores = ings.map(function (i) { return i.cor; });
    var n = Math.max(1, g.tubos.length);
    return { rec: r.receita || null, tipo: r.tipo, ings: ings, cores: cores, tipos: ings.map(function (i) { return i.tipo; }),
      n: n, nivel: n * BEQ.camada, media: media(cores), corDe: function (id) { var i = R.Quimica.ingrediente(id); return i && i.cor; } };
  }

  /* ================= O LAÇO ================= */
  /** O palco de uma tela aberta: o estado g e um rAF só enquanto algo se mexe. Sem animação, desenha na hora o
      quadro final. @param {HTMLCanvasElement} cv @param {function(): boolean} viva a tela ainda está aberta?
      @returns {{ g: object, desenhar: function, despejar: function(string), reagir: function(object, function), esvaziar: function, parar: function }} */
  P.criar = function (cv, viva) {
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var g = { tubos: [], despejo: null, reacao: null }, raf = 0, antes = 0, aoFim = null;
    function efeito() { return g.reacao && (P.EFEITOS[g.reacao.efeito] || P.EFEITOS.nada); }
    function desenhar() {
      quadro(ctx, g);
      cv.dataset.quadro = g.reacao ? (g.reacao.t >= efeito().dur ? 'final' : 'reacao') : g.despejo ? 'despejo' : 'bequer';
      cv.dataset.efeito = g.reacao ? g.reacao.efeito : '';
    }
    function tocarSons(t0, t1) {
      (efeito().sons || []).forEach(function (s) { if (s[0] > t0 && s[0] <= t1) R.Som.tocar(s[1]); });
    }
    function passo(agora) {
      raf = 0;
      if (!viva()) return;
      var dt = Math.min(100, Math.max(0, agora - antes)), segue = false, acabou = false;
      antes = agora;
      if (g.despejo) { g.despejo.t += dt; if (g.despejo.t >= P.DESPEJO_MS) g.despejo = null; else segue = true; }
      var ef = efeito();
      if (ef && g.reacao.t < ef.dur) {
        var t0 = g.reacao.t;
        g.reacao.t = Math.min(ef.dur, t0 + dt);
        tocarSons(t0, g.reacao.t);
        if (g.reacao.t >= ef.dur) acabou = true; else segue = true;
      }
      desenhar();
      if (segue) raf = requestAnimationFrame(passo);
      if (acabou && aoFim) { var f = aoFim; aoFim = null; f(); }
    }
    function rodar() { if (!raf) { antes = performance.now(); raf = requestAnimationFrame(passo); } }
    var palco = {
      g: g, desenhar: desenhar,
      despejar: function (id) {
        g.tubos.push(id);
        g.despejo = R.util.animar() ? { id: id, t: 0 } : null;
        desenhar();
        if (g.despejo) rodar();
      },
      // r: o que Reino.Quimica.misturar devolveu; fim: chamado quando a animação acaba (sem animação, na hora)
      reagir: function (r, fim) {
        g.despejo = null;
        g.reacao = { efeito: r.receita ? r.receita.efeito : 'nada', t: 0, info: infoDe(g, r) };
        var ef = efeito();
        if (!P.EFEITOS[g.reacao.efeito]) g.reacao.efeito = 'nada';
        if (!R.util.animar()) { g.reacao.t = ef.dur; if (ef.som) R.Som.tocar(ef.som); desenhar(); fim(); return; }
        aoFim = fim;
        tocarSons(-1, 0);
        desenhar(); rodar();
      },
      esvaziar: function () { g.tubos.length = 0; g.despejo = null; g.reacao = null; aoFim = null; desenhar(); },
      parar: function () { if (raf) cancelAnimationFrame(raf); raf = 0; aoFim = null; },
    };
    desenhar();
    return palco;
  };

  Object.assign(P, { fundo: fundo, bequer: bequer, gas: gas, liquido: liquido, po: po, camadas: camadas, espuma: espuma, bolha: bolha,
    brilho: brilho, confete: confete, fumaca: fumaca, media: media, tubo: tubo, quadro: quadro, infoDe: infoDe });
})();
