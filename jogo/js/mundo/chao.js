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
  // grama: 0 a 3 tufos em lugares sorteados e, em 1 de cada 6 tiles, uma mancha de grama mais escura
  function grama(ctx, x, y, px, py) {
    ret(ctx, px, py, T, T, C.grama);
    if (s(x, y, 11) < 0.17) {
      var mx = px + 2 + Math.floor(s(x, y, 12) * 8), my = py + 3 + Math.floor(s(x, y, 13) * 8);
      ret(ctx, mx, my, 6, 2, C.grama2); ret(ctx, mx + 1, my - 1, 3, 1, C.grama2); ret(ctx, mx + 2, my + 2, 3, 1, C.grama2);
    }
    for (var k = 0, n = Math.floor(s(x, y, 14) * 4); k < n; k++) {
      tufo(ctx, px + 1 + Math.floor(s(x, y, 15 + k) * 13), py + 1 + Math.floor(s(x, y, 19 + k) * 12), C.grama3);
    }
  }
  // paralelepípedo: fileiras de 4 px, pedras de 5 + 1 de junta, desencontradas (contam do canto do mapa: emendam)
  function pedra(ctx, px, py) {
    ret(ctx, px, py, T, T, C.rua2);
    for (var j = 0; j < 4; j++) {
      var wy = py + j * 4, desl = ((wy / 4) % 2) ? 3 : 0;
      for (var wx = px - ((px + desl) % 6); wx < px + T; wx += 6) {
        var a = Math.max(px, wx), b = Math.min(px + T, wx + 5);
        if (b <= a) continue;
        ret(ctx, a, wy, b - a, 3, s(wx, wy, 21) < 0.3 ? '#f0cc98' : C.rua);
        ret(ctx, a, wy, b - a, 1, C.rua3);
        if (a === wx) ret(ctx, a, wy, 1, 1, C.rua);          // quina de cima arredondada
      }
    }
  }
  // ladrilho claro: quadrados de 7 px com junta de 1, e um pontinho em quadrado sim, quadrado não
  function ladrilho(ctx, px, py) {
    ret(ctx, px, py, T, T, '#f3d9a4');
    for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
      var qx = px + i * 8, qy = py + j * 8;
      ret(ctx, qx, qy, 7, 7, '#fff0cc'); ret(ctx, qx, qy, 7, 1, '#fff8e8'); ret(ctx, qx, qy, 1, 7, '#fff8e8');
      if ((qx / 8 + qy / 8) % 2) ret(ctx, qx + 3, qy + 3, 2, 2, '#f7e2b4');
    }
  }
  // terra batida: pedrinhas e grãos sorteados, e a grama roendo a beirada (sem meio-fio)
  function terra(ctx, x, y, px, py) {
    ret(ctx, px, py, T, T, '#e2b57c');
    for (var k = 0; k < 7; k++) {
      var gx = px + Math.floor(s(x, y, 30 + k) * 15), gy = py + 2 + Math.floor(s(x, y, 40 + k) * 12);
      ret(ctx, gx, gy, k < 2 ? 2 : 1, 1, k % 2 ? '#c9955c' : '#f2d09e');
    }
    function chao(nx, ny) { var t = I.dentro(nx, ny) ? I.tipo[ny][nx] : 'g'; return t !== 'c' && t !== 'p'; }
    for (var i = 0; i < T; i++) {
      if (chao(x, y - 1)) ret(ctx, px + i, py, 1, 1 + (s(px + i, py, 51) < 0.35 ? 1 : 0), C.grama);
      if (chao(x, y + 1)) ret(ctx, px + i, py + T - 1 - (s(px + i, py, 52) < 0.35 ? 1 : 0), 1, 2, C.grama);
      if (chao(x - 1, y)) ret(ctx, px, py + i, 1 + (s(px, py + i, 53) < 0.35 ? 1 : 0), 1, C.grama);
      if (chao(x + 1, y)) ret(ctx, px + T - 1 - (s(px, py + i, 54) < 0.35 ? 1 : 0), py + i, 2, 1, C.grama);
    }
  }

  I.desenharChao = function (ctx, x, y, forcado) {
    var px = x * T, py = y * T, t = forcado || I.tipo[y][x], par = (x + y) % 2 === 0;
    if (t === 'g' || t === 'f' || t === 'a') grama(ctx, x, y, px, py);
    else if (t === 'c') {
      var est = (I.estilo && I.estilo[y] && I.estilo[y][x]) || 'pedra';
      if (est === 'terra') { terra(ctx, x, y, px, py); return; }
      if (est === 'ladrilho') ladrilho(ctx, px, py); else pedra(ctx, px, py);
      // meio-fio: onde a rua encosta na grama, uma borda de pedra (a rua fica bem traçada)
      var rua = function (nx, ny) { var k2 = I.dentro(nx, ny) ? I.tipo[ny][nx] : 'c'; return k2 === 'c' || k2 === 'p'; };
      if (!rua(x, y - 1)) { ret(ctx, px, py, T, 2, C.meioFio); ret(ctx, px, py, T, 1, C.rua3); }
      if (!rua(x, y + 1)) { ret(ctx, px, py + 14, T, 2, C.meioFio); ret(ctx, px, py + 15, T, 1, C.meioFio2); }
      if (!rua(x - 1, y)) { ret(ctx, px, py, 2, T, C.meioFio); ret(ctx, px, py, 1, T, C.rua3); }
      if (!rua(x + 1, y)) { ret(ctx, px + 14, py, 2, T, C.meioFio); ret(ctx, px + 15, py, 1, T, C.meioFio2); }
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
