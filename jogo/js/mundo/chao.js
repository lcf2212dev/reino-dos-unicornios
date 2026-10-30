/* O chão do mapa, tile a tile: grama (tufos e manchas sorteados por tile, sem a grade à mostra), os 3 calçamentos
   (paralelepípedo nas avenidas, ladrilho claro nas travessas e caminhos, terra batida nas trilhas; Mapa.CIDADE.ruas
   .estilo), o piso da praça, as clareiras guardadas para as próximas matérias e o bosque fechado além da borda de
   cima e de baixo. Usa as cores e os ajudantes de mundo/mapa-desenho.js e de mundo/arvores.js (Mapa._interno) e entrega:
     I.desenharChao(ctx, x, y, forcado)   um tile (forcado: a letra do chão, para as fileiras além do mapa)
     I.desenharClareiras(ctx)             as clareiras livres (depois do chão, antes dos enfeites)
     I.desenharAlemDaBorda(ctx, y0, h)    o bosque fechado de y0 (px) até y0 + h, na largura do mapa */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var T = Mapa.T, W = Mapa.W, C = I.C, ret = I.ret, K = C.contorno;
  var FLORES = ['#ff8a3d', '#ffe066', '#ffffff', '#ffb15a', '#7ed9c8'];
  var s = D.sorte;

  function tufo(ctx, x, y, fio) { ret(ctx, x, y, 1, 3, C.grama2); ret(ctx, x + 1, y + 1, 1, 2, fio); }

  /* ----- grama: manchas orgânicas de 3 tons que atravessam os tiles (ruído de baixa frequência numa grade grossa,
     contado do canto do mapa), pontilhado 2×2 na transição, tufos de 3 formatos, trevinhos e pedrinhas raras ----- */
  var GRAMA_ESC = '#aac947', GRAMA_CLA = '#daf080';
  function suave(t) { return t * t * (3 - 2 * t); }
  function camada(px, py, cel, sem) {
    var gx = px / cel, gy = py / cel, i = Math.floor(gx), j = Math.floor(gy), fx = suave(gx - i), fy = suave(gy - j);
    var a = s(i, j, sem), b = s(i + 1, j, sem), c = s(i, j + 1, sem), d = s(i + 1, j + 1, sem);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  function ruido(px, py) { return camada(px, py, 44, 81) * 0.7 + camada(px, py, 15, 82) * 0.3; }
  // cor da grama no pixel (bloco 2×2): base, mancha escura ou clara; na beirada, xadrez de blocos
  function corGrama(px, py) {
    var bx = px >> 1, by = py >> 1, n = ruido(bx * 2 + 1, by * 2 + 1), xadrez = (bx + by) % 2 === 0;
    if (n < 0.36) return GRAMA_ESC;
    if (n < 0.39) return xadrez ? GRAMA_ESC : C.grama;
    if (n > 0.66) return GRAMA_CLA;
    if (n > 0.63) return xadrez ? GRAMA_CLA : C.grama;
    return C.grama;
  }
  var TUFOS = [
    [[0, 1, 1, 3], [2, 0, 1, 4], [4, 1, 1, 3]],          // leque de 3 fios
    [[0, 2, 1, 2], [1, 0, 1, 4], [3, 1, 1, 3]],          // tufo torto
    [[0, 1, 1, 2], [1, 0, 1, 3], [2, 1, 1, 2]],          // tufinho
  ];
  function tufoGrande(ctx, x, y, v) {
    TUFOS[v].forEach(function (f, i) {
      ret(ctx, x + f[0], y + f[1], f[2], f[3], '#8fbf3e');
      if (i === 1) ret(ctx, x + f[0], y + f[1], 1, 1, C.grama3);
    });
    ret(ctx, x, y + 4, TUFOS[v][2][0] + 1, 1, 'rgba(58,36,70,0.12)');
  }
  function trevo(ctx, x, y) {
    ret(ctx, x, y, 2, 2, '#8fbf3e'); ret(ctx, x + 2, y + 1, 2, 2, '#8fbf3e'); ret(ctx, x, y + 2, 2, 2, '#8fbf3e');
    ret(ctx, x, y, 1, 1, '#b8e06a'); ret(ctx, x + 2, y + 1, 1, 1, '#b8e06a'); ret(ctx, x + 1, y + 4, 1, 1, '#7ea832');
  }
  function rua(nx, ny) { var k = I.dentro(nx, ny) ? I.tipo[ny][nx] : 'g'; return k === 'c' || k === 'p'; }
  function grama(ctx, x, y, px, py) {
    ret(ctx, px, py, T, T, C.grama);
    for (var by = 0; by < T; by += 2) for (var bx = 0; bx < T; bx += 2) {
      var cor = corGrama(px + bx, py + by);
      if (cor !== C.grama) ret(ctx, px + bx, py + by, 2, 2, cor);
    }
    for (var k = 0, n = 1 + Math.floor(s(x, y, 14) * 3); k < n; k++) {
      var tx = px + 1 + Math.floor(s(x, y, 15 + k) * 11), ty = py + 1 + Math.floor(s(x, y, 19 + k) * 10);
      var v = Math.floor(s(x, y, 23 + k) * 4);
      if (v === 3) tufo(ctx, tx, ty, C.grama3); else tufoGrande(ctx, tx, ty, v);
    }
    if (s(x, y, 11) < 0.12) trevo(ctx, px + 3 + Math.floor(s(x, y, 12) * 8), py + 3 + Math.floor(s(x, y, 13) * 8));
    if (s(x, y, 27) < 0.05) {
      var qx = px + 2 + Math.floor(s(x, y, 28) * 10), qy = py + 3 + Math.floor(s(x, y, 29) * 9);
      ret(ctx, qx, qy + 2, 3, 1, 'rgba(58,36,70,0.15)');
      ret(ctx, qx, qy, 3, 2, '#d8cbb0'); ret(ctx, qx, qy, 2, 1, '#f4ecd8'); ret(ctx, qx + 2, qy + 1, 1, 1, '#b3a488');
    }
    // sombra de 1 px do meio-fio na grama (a luz vem de cima e da esquerda: só abaixo e à direita da rua)
    if (calcada(x, y - 1)) ret(ctx, px, py, T, 1, 'rgba(58,36,70,0.15)');
    if (calcada(x - 1, y)) ret(ctx, px, py + (calcada(x, y - 1) ? 1 : 0), 1, T, 'rgba(58,36,70,0.15)');
  }
  // rua com meio-fio (avenida ou ladrilho; a terra não tem)
  function calcada(nx, ny) {
    if (!I.dentro(nx, ny) || I.tipo[ny][nx] !== 'c') return false;
    return ((I.estilo && I.estilo[ny] && I.estilo[ny][nx]) || 'pedra') !== 'terra';
  }

  /* ----- paralelepípedo: fileiras de 4 px, pedras de 5 + 1 de junta, desencontradas (contam do canto do mapa:
     emendam); cada pedra com tom próprio, brilho em cima/à esquerda, sombra embaixo/à direita ----- */
  var PEDRAS = ['#f7d7a8', '#f1cc94', '#fbe3bc', '#ebc286'], JUNTA = '#c99a58';
  function pedra(ctx, x, y, px, py) {
    ret(ctx, px, py, T, T, JUNTA);
    var gc = !rua(x, y - 1), gb = !rua(x, y + 1), ge = !rua(x - 1, y), gd = !rua(x + 1, y);
    for (var j = 0; j < 4; j++) {
      var wy = py + j * 4, desl = ((wy / 4) % 2) ? 3 : 0;
      for (var wx = px - ((px + desl) % 6); wx < px + T; wx += 6) {
        var a = Math.max(px, wx), b = Math.min(px + T, wx + 5);
        if (b <= a) continue;
        var tom = PEDRAS[Math.floor(s(wx, wy, 21) * 4)];
        ret(ctx, a, wy, b - a, 3, tom);
        ret(ctx, a, wy, b - a, 1, D.clarear(tom, 0.45));
        ret(ctx, a, wy + 2, b - a, 1, D.escurecer(tom, 0.12));
        if (a === wx) { ret(ctx, a, wy, 1, 3, D.clarear(tom, 0.25)); ret(ctx, a, wy, 1, 1, JUNTA); }
        if (b === wx + 5) { ret(ctx, b - 1, wy + 1, 1, 2, D.escurecer(tom, 0.16)); ret(ctx, b - 1, wy + 2, 1, 1, JUNTA); }
        if (s(wx, wy, 22) < 0.035 && b - a >= 4) {      // pedra rachada (rara)
          ret(ctx, a + 1, wy + 1, 1, 1, D.escurecer(tom, 0.25)); ret(ctx, a + 2, wy + 2, 1, 1, D.escurecer(tom, 0.25));
        }
      }
      // musgo nas juntas perto da grama
      for (var i = 0; i < T; i++) {
        var jx = px + i, junta = (jx + desl) % 6 === 5, perto = (gc && j === 0) || (gb && j === 3) || (ge && i < 3) || (gd && i > 12);
        if (perto && junta && s(jx, wy, 24) < 0.5) ret(ctx, jx, wy + 1, 1, 2, '#a8cc48');
        if (perto && s(jx, wy, 25) < 0.12) ret(ctx, jx, wy + 3, 1, 1, '#b6d451');
      }
    }
  }
  // cruzamento (avenida com travessa comprida, não com o caminho curto de uma porta): rosácea de pedras claras e
  // escuras no centro; quando o cruzamento tem 2 tiles, ela fica no meio dos dois
  function longo(x, y, dy) { var n = 0; while (rua(x, y) && n < 6) { n++; y += dy; } return n; }
  function cruz(x, y) {
    if (!rua(x, y) || !rua(x - 1, y) || !rua(x + 1, y) || !(rua(x, y - 1) || rua(x, y + 1))) return false;
    return longo(x, y, -1) + longo(x, y, 1) - 1 >= 6;
  }
  function rosacea(ctx, x, y, px, py) {
    var e = x, d2 = x, c0 = y, b0 = y;      // centro do bloco de tiles de cruzamento
    while (cruz(e - 1, y)) e--; while (cruz(d2 + 1, y)) d2++;
    while (cruz(x, c0 - 1)) c0--; while (cruz(x, b0 + 1)) b0++;
    var cx = (e + d2 + 1) * T / 2, cy = (c0 + b0 + 1) * T / 2;
    // medalhão incrustado: disco rosado, 8 pétalas rosa e âmbar, miolo laranja, aro escuro e sombra embaixo/à direita
    for (var j = 0; j < T; j++) for (var i = 0; i < T; i++) {
      var dx = px + i + 0.5 - cx, dy = py + j + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy), cor = null;
      if (d > 7.5) {
        var sx = dx - 1, sy = dy - 1;
        if (Math.sqrt(sx * sx + sy * sy) <= 7.5) ret(ctx, px + i, py + j, 1, 1, 'rgba(58,36,70,0.15)');
        continue;
      }
      var setor = Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 4)) % 8;
      if (d > 6.5) cor = C.meioFio2;
      else if (d <= 1.5) cor = '#ff8a3d';
      else if (d <= 2.5) cor = '#fff6a8';
      else if (d <= 5.5) cor = setor % 2 ? '#ff8fb1' : '#ffbe3d';
      else cor = '#ffe0e6';
      ret(ctx, px + i, py + j, 1, 1, cor);
    }
  }

  /* ----- ladrilho: peças de 7 px com chanfro e junta de 1; fileiras alternadas com losango ou florzinha ----- */
  function ladrilho(ctx, px, py) {
    ret(ctx, px, py, T, T, '#e8c88c');
    for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
      var qx = px + i * 8, qy = py + j * 8, fila = (qy / 8) % 2, alt = (qx / 8 + qy / 8) % 2;
      var base = alt ? '#fff0cc' : '#fbe6b8';
      ret(ctx, qx, qy, 7, 7, base);
      ret(ctx, qx + 1, qy, 5, 1, '#fffaf0'); ret(ctx, qx, qy + 1, 1, 5, '#fffaf0');      // chanfro de luz
      ret(ctx, qx + 1, qy + 6, 6, 1, '#efd29a'); ret(ctx, qx + 6, qy + 1, 1, 6, '#efd29a'); // chanfro de sombra
      ret(ctx, qx, qy, 1, 1, '#e8c88c'); ret(ctx, qx + 6, qy + 6, 1, 1, '#e8c88c');
      ret(ctx, qx + 6, qy, 1, 1, '#f3dcaa'); ret(ctx, qx, qy + 6, 1, 1, '#f3dcaa');
      if (fila) {         // losango
        ret(ctx, qx + 3, qy + 1, 1, 1, '#f0b878'); ret(ctx, qx + 2, qy + 2, 3, 1, '#f0b878');
        ret(ctx, qx + 1, qy + 3, 5, 1, '#f0b878'); ret(ctx, qx + 2, qy + 4, 3, 1, '#f0b878');
        ret(ctx, qx + 3, qy + 5, 1, 1, '#f0b878');
        ret(ctx, qx + 3, qy + 2, 1, 3, '#ffd59a'); ret(ctx, qx + 2, qy + 3, 3, 1, '#ffd59a');
        ret(ctx, qx + 3, qy + 3, 1, 1, alt ? '#ff8a3d' : '#7ed9c8');
      } else {            // florzinha de 4 pontos
        ret(ctx, qx + 3, qy + 2, 1, 1, '#f3c88a'); ret(ctx, qx + 2, qy + 3, 1, 1, '#f3c88a');
        ret(ctx, qx + 4, qy + 3, 1, 1, '#f3c88a'); ret(ctx, qx + 3, qy + 4, 1, 1, '#f3c88a');
        ret(ctx, qx + 3, qy + 3, 1, 1, '#ffb15a');
      }
    }
  }

  /* ----- terra batida: sulcos de roda no sentido da trilha, pedrinhas e a grama roendo a beirada ----- */
  function terra(ctx, x, y, px, py) {
    ret(ctx, px, py, T, T, '#e2b57c');
    for (var k = 0; k < 10; k++) {
      var gx = px + Math.floor(s(x, y, 30 + k) * 15), gy = py + 2 + Math.floor(s(x, y, 40 + k) * 12);
      ret(ctx, gx, gy, 1, 1, k % 2 ? '#cf9e64' : '#f0cd98');
    }
    var deitada = rua(x - 1, y) || rua(x + 1, y) || !(rua(x, y - 1) || rua(x, y + 1));
    [5, 10].forEach(function (o) {
      for (var i = 0; i < T; i++) {
        var w = (deitada ? py : px) + o + (s(deitada ? px + i : px + o, deitada ? py + o : py + i, 55) < 0.2 ? 1 : 0);
        if (deitada) { ret(ctx, px + i, w, 1, 1, '#c99358'); ret(ctx, px + i, w + 1, 1, 1, '#eec894'); }
        else { ret(ctx, w, py + i, 1, 1, '#c99358'); ret(ctx, w + 1, py + i, 1, 1, '#eec894'); }
      }
    });
    for (var p = 0; p < 2; p++) if (s(x, y, 56 + p) < 0.6) {
      var sx = px + 2 + Math.floor(s(x, y, 58 + p) * 11), sy = py + 2 + Math.floor(s(x, y, 60 + p) * 11);
      ret(ctx, sx, sy + 1, 3, 1, '#b8854e'); ret(ctx, sx, sy, 3, 1, '#d8cbb0'); ret(ctx, sx, sy, 1, 1, '#f4ecd8');
    }
    function chao(nx, ny) { return !rua(nx, ny); }
    for (var i = 0; i < T; i++) {
      var r1 = s(px + i, py, 51), r2 = s(px + i, py, 52), r3 = s(px, py + i, 53), r4 = s(px, py + i, 54);
      if (chao(x, y - 1)) ret(ctx, px + i, py, 1, 1 + (r1 < 0.35 ? 1 : 0) + (r1 < 0.08 ? 1 : 0), corGrama(px + i, py));
      if (chao(x, y + 1)) { var hb = 1 + (r2 < 0.35 ? 1 : 0) + (r2 < 0.08 ? 1 : 0); ret(ctx, px + i, py + T - hb, 1, hb, corGrama(px + i, py + T - 1)); }
      if (chao(x - 1, y)) ret(ctx, px, py + i, 1 + (r3 < 0.35 ? 1 : 0) + (r3 < 0.08 ? 1 : 0), 1, corGrama(px, py + i));
      if (chao(x + 1, y)) { var wd = 1 + (r4 < 0.35 ? 1 : 0) + (r4 < 0.08 ? 1 : 0); ret(ctx, px + T - wd, py + i, wd, 1, corGrama(px + T - 1, py + i)); }
    }
  }

  function calcadaOuPraca(nx, ny) { var k = I.tipo[ny][nx]; return k === 'c' || k === 'p'; }
  // meio-fio com volume: linha escura de fora, face lateral e face de cima clara (a luz vem de cima/esquerda)
  function meioFio(ctx, x, y, px, py) {
    var FACE = '#fff0cc', LADO = C.meioFio, LINHA = C.meioFio2;
    var rua = function (nx, ny) { return !I.dentro(nx, ny) || calcadaOuPraca(nx, ny); };   // fora do mapa: sem meio-fio
    if (!rua(x, y - 1)) { ret(ctx, px, py, T, 1, LINHA); ret(ctx, px, py + 1, T, 1, FACE); ret(ctx, px, py + 2, T, 1, LADO); }
    if (!rua(x, y + 1)) { ret(ctx, px, py + 13, T, 1, FACE); ret(ctx, px, py + 14, T, 1, LADO); ret(ctx, px, py + 15, T, 1, LINHA); }
    if (!rua(x - 1, y)) { ret(ctx, px, py, 1, T, LINHA); ret(ctx, px + 1, py, 1, T, FACE); ret(ctx, px + 2, py, 1, T, LADO); }
    if (!rua(x + 1, y)) { ret(ctx, px + 13, py, 1, T, FACE); ret(ctx, px + 14, py, 1, T, LADO); ret(ctx, px + 15, py, 1, T, LINHA); }
    // juntas do meio-fio a cada 8 px
    for (var k = 0; k < T; k += 8) {
      if (!rua(x, y - 1)) ret(ctx, px + k, py + 1, 1, 2, LINHA);
      if (!rua(x, y + 1)) ret(ctx, px + k, py + 13, 1, 2, LINHA);
      if (!rua(x - 1, y)) ret(ctx, px + 1, py + k, 2, 1, LINHA);
      if (!rua(x + 1, y)) ret(ctx, px + 13, py + k, 2, 1, LINHA);
    }
  }

  I.desenharChao = function (ctx, x, y, forcado) {
    var px = x * T, py = y * T, t = forcado || I.tipo[y][x], par = (x + y) % 2 === 0;
    if (t === 'g' || t === 'f' || t === 'a') grama(ctx, x, y, px, py);
    else if (t === 'c') {
      var est = (I.estilo && I.estilo[y] && I.estilo[y][x]) || 'pedra';
      if (est === 'terra') { terra(ctx, x, y, px, py); return; }
      if (est === 'ladrilho') ladrilho(ctx, px, py);
      else { pedra(ctx, x, y, px, py); if (cruz(x, y)) rosacea(ctx, x, y, px, py); }
      meioFio(ctx, x, y, px, py);
    } else if (t === 'p') {
      ret(ctx, px, py, T, T, par ? C.praca2 : C.praca);
      ret(ctx, px, py + 15, T, 1, C.praca2);
      ret(ctx, px + 15, py, 1, T, C.praca2);
      ret(ctx, px, py, T, 1, par ? C.praca : C.praca3);
      ret(ctx, px, py, 1, T, par ? C.praca : C.praca3);
      ret(ctx, px + 7, py + 7, 2, 2, par ? C.praca : C.praca2);
    }
  };

  /* ----- clareiras livres (Mapa.CLAREIRAS): terreno guardado, com a borda de grama escura, flores sorteadas, estacas
     nos cantos e uma plaquinha com "?" no chão (em breve, um prédio) ----- */
  var INTERROGA = ['.kkkkk.', 'kk...kk', '....kk.', '...kk..', '.......', '...kk..'];
  I.desenharClareiras = function (ctx) {
    Mapa.CLAREIRAS.forEach(function (r) {
      if (I.lugares.some(function (l) { return l.rect.x === r.x && l.rect.y === r.y; })) return;
      var x0 = r.x * T, y0 = r.y * T, w = r.w * T, h = r.h * T, ccx = x0 + w / 2, ccy = y0 + h / 2;
      var a1 = s(r.x, r.y, 61) * 6, a2 = s(r.x, r.y, 62) * 6;
      function den(px, py) {
        var dx = (px + 0.5 - ccx) / (w / 2 - 4), dy = (py + 0.5 - ccy) / (h / 2 - 4), ang = Math.atan2(dy, dx);
        return dx * dx + dy * dy <= Math.pow(1 + 0.07 * Math.sin(ang * 3 + a1) + 0.05 * Math.sin(ang * 5 + a2), 2);
      }
      var px, py;
      for (py = y0; py < y0 + h; py++) for (px = x0; px < x0 + w; px++) {
        if (!den(px, py)) continue;
        var borda = !den(px - 2, py) || !den(px + 2, py) || !den(px, py - 2) || !den(px, py + 2);
        ret(ctx, px, py, 1, 1, borda ? C.grama2 : C.grama3);
      }
      // flores e tufos em pontos sorteados (nenhum tile repete o vizinho)
      for (var k = 0; k < r.w * r.h * 2; k++) {
        var fx = x0 + 3 + Math.floor(s(r.x, k, 63) * (w - 6)), fy = y0 + 3 + Math.floor(s(r.y, k, 64) * (h - 6));
        if (!den(fx - 3, fy) || !den(fx + 3, fy) || !den(fx, fy - 3) || !den(fx, fy + 3)) continue;
        if (k % 3 === 2) { tufo(ctx, fx, fy, C.grama); continue; }
        var cor = FLORES[Math.floor(s(fx, fy, 65) * FLORES.length)];
        ret(ctx, fx, fy + 1, 1, 2, C.grama2); ret(ctx, fx - 1, fy, 3, 1, cor); ret(ctx, fx, fy - 1, 1, 3, cor);
        ret(ctx, fx, fy, 1, 1, C.miolo);
      }
      // estacas nos 4 cantos
      [[x0 + 3, y0 + 3], [x0 + w - 5, y0 + 3], [x0 + 3, y0 + h - 8], [x0 + w - 5, y0 + h - 8]].forEach(function (e) {
        ret(ctx, e[0], e[1] + 5, 2, 1, 'rgba(58,36,70,0.18)');
        ret(ctx, e[0] - 1, e[1] - 1, 4, 6, K); ret(ctx, e[0], e[1], 2, 5, '#c98a5a'); ret(ctx, e[0], e[1], 1, 5, '#e8b27a');
        ret(ctx, e[0], e[1] - 1, 2, 1, '#ff8a3d');
      });
      // plaquinha deitada com "?" no meio de cima
      var bx = Math.round(ccx) - 6, by = y0 + 6;
      ret(ctx, bx, by + 10, 12, 1, 'rgba(58,36,70,0.18)');
      ret(ctx, bx, by, 12, 10, K); ret(ctx, bx + 1, by + 1, 10, 8, '#e8b27a'); ret(ctx, bx + 1, by + 1, 10, 1, '#fff0cc');
      D.matriz(ctx, bx + 3, by + 2, INTERROGA, { k: '#6b4428' });
    });
  };

  /* ----- além das bordas: bosque fechado, só copas escuras (sem chão à mostra) ----- */
  var COPA_ESCURA = ['#8fb83a', '#6f9a3a', '#b6d24e'], moitas = null;
  function moita(v) {
    var c = PA.novoCanvas(28, 24), bolas = [[14, 12, 10], [8, 15, 7], [20, 14, 8]].map(function (b, i) {
      var bx = v % 2 ? 28 - b[0] : b[0], by = b[1] + (i === v % 3 ? -2 : 0), r = b[2];
      return { den: function (x, y) { return (x - bx) * (x - bx) + (y - by) * (y - by) <= r * r; },
        baixo: function (x, y) { return y > by + r * 0.4 && Math.abs(Math.sqrt((x - bx) * (x - bx) + (y - by) * (y - by)) - r) < 1.3; } };
    });
    I.pintarMassa(c.getContext('2d'), 28, 24, bolas, COPA_ESCURA, false);
    return c;
  }
  I.desenharAlemDaBorda = function (ctx, y0, h) {
    if (!moitas) moitas = [0, 1, 2, 3].map(moita);
    ret(ctx, 0, y0, W * T, h, COPA_ESCURA[1]);
    // Em cima, as fileiras se ancoram em y = 0 (não na altura variável do cache). Embaixo, preserva o desenho.
    var base = y0 < 0 ? 0 : y0, primeira = y0 < 0 ? Math.floor(y0 / 10) : 0;
    for (var fila = primeira; base + fila * 10 < y0 + h + 10; fila++) for (var x = -14 + ((fila % 2 + 2) % 2) * 9; x < W * T; x += 18) {
      var v = Math.floor(s(x, fila, 71) * 4);
      ctx.drawImage(moitas[v], x + Math.floor(s(x, fila, 72) * 5) - 2, base - 12 + fila * 10);
    }
  };
})();
