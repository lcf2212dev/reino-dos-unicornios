/* Desenho da cidade (o que Mapa.CIDADE põe à mão, mundo/lugares.js): o piso da praça, a fonte grande
   (e o jato animado), o coreto, os canteiros redondos, e os enfeites de 1 tile (poste, banco, canteiro,
   cerca, pedra) e os motivos dos campos (poço, caixa de correio, placa de direção, pedrinhas).
   Usa as cores e os ajudantes que mundo/mapa-desenho.js põe em Mapa._interno e entrega:
     I.desenharPraca(ctx)             o piso desenhado da praça (depois do chão, antes dos enfeites)
     I.desenharObjeto(ctx, o)         uma peça grande da praça ({ tipo, x, y, w, h } em tiles)
     I.desenharPeca(ctx, tipo, x, y)  um enfeite posto à mão (tile x, y)
     I.animarCidade(ctx, t)           a água da fonte e o brilho dos lampiões (só com Animações)
     I.animarObjeto(ctx, o, t)        a água da fonte (também por cima da Mariana, quando ela passa atrás)
     I.chavePeca(tipo, x, y)          peças iguais dividem o sprite (mundo/mapa-desenho.js, peças altas) */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T;
  var C = I.C, ret = I.ret, circulo = I.circulo, elipse = I.elipse, triangulo = I.triangulo;
  var K = C.contorno;
  var PEDRA = '#fff4dc', PEDRA2 = '#e8cf9c', PEDRA3 = '#c9a978', TERRA = '#b07a52', BORDA = '#f3dfb4';
  var MADEIRA = '#c98a5a', MADEIRA2 = '#9c6446';

  // triângulo apontando para baixo (bandeirinha, ponta do coração)
  function trianguloBaixo(ctx, x, y, w, h, cor) {
    ctx.fillStyle = cor;
    for (var j = 0; j < h; j++) {
      var meia = Math.round((w / 2) * (h - j) / h);
      ctx.fillRect(Math.round(x + w / 2 - meia), y + j, meia * 2, 1);
    }
  }
  // ponta da rosa dos ventos: losango do raio rIn até a ponta rTip, largura máxima 2·meia em rBase.
  // Pinta pixel a pixel (centro do pixel dentro do losango): sem pixel solto; a borda sai em pedra
  function ponta(ctx, c, ang, rIn, rBase, meia, rTip, cor) {
    var ux = Math.cos(ang), uy = Math.sin(ang);
    function dentroP(px, py) {
      var dx = px + 0.5 - c.x, dy = py + 0.5 - c.y;
      var ao = dx * ux + dy * uy, lado = -dx * uy + dy * ux;
      if (ao < rIn || ao > rTip) return false;
      var lim = ao < rBase ? meia * (ao - rIn) / (rBase - rIn) : meia * (rTip - ao) / (rTip - rBase);
      return Math.abs(lado) <= lim;
    }
    var escura = window.Reino.Desenho.escurecer(cor, 0.2);
    // pixel da ponta sem vizinho dos dois lados de nenhum eixo sai (não fica pixel solto)
    function cheio(px, py) {
      return dentroP(px, py) && ((dentroP(px - 1, py) && dentroP(px + 1, py)) || (dentroP(px, py - 1) && dentroP(px, py + 1))
        || (dentroP(px - 1, py) || dentroP(px + 1, py)) && (dentroP(px, py - 1) || dentroP(px, py + 1)));
    }
    for (var py = Math.floor(c.y - rTip - 1); py <= c.y + rTip + 1; py++) for (var px = Math.floor(c.x - rTip - 1); px <= c.x + rTip + 1; px++) {
      if (!cheio(px, py)) continue;
      var borda = !dentroP(px + 1, py) || !dentroP(px - 1, py) || !dentroP(px, py + 1) || !dentroP(px, py - 1);
      var lado = -(px + 0.5 - c.x) * uy + (py + 0.5 - c.y) * ux;
      ret(ctx, px, py, 1, 1, borda ? PEDRA3 : (lado < 0 ? cor : escura));
    }
  }
  function centroDe(o) { return { x: (o.x + o.w / 2) * T, y: (o.y + o.h / 2) * T }; }
  function fonte() { return I.objetos.find(function (o) { return o.tipo === 'fonte'; }); }

  /* ----- piso da praça: borda de pedra, eixos de ladrilho e a rosa dos ventos em volta da fonte ----- */
  I.desenharPraca = function (ctx) {
    var p = Mapa.CIDADE.praca, x0 = p.x * T, y0 = p.y * T, w = p.w * T, h = p.h * T;
    // meio-fio: moldura de pedra clara com sombra por dentro, aberta onde uma rua chega (ali, uma soleira de 1 fileira
    // entre a rua e o ladrilho). Pedaço a pedaço, tile a tile do contorno
    function rua(tx, ty) { return I.dentro(tx, ty) && I.tipo[ty][tx] === 'c'; }
    for (var tx = p.x; tx < p.x + p.w; tx++) [[p.y, -1, y0], [p.y + p.h - 1, 1, y0 + h - 3]].forEach(function (l) {
      var bx = tx * T;
      if (rua(tx, l[0] + l[1])) { ret(ctx, bx, l[1] < 0 ? y0 : y0 + h - 1, T, 1, PEDRA2); return; }
      ret(ctx, bx, l[2], T, 3, PEDRA3);
      if (l[1] < 0) { ret(ctx, bx, y0 + 1, T, 1, PEDRA); ret(ctx, bx, y0 + 3, T, 1, 'rgba(58,36,70,0.10)'); }
    });
    for (var ty = p.y; ty < p.y + p.h; ty++) [[p.x, -1, x0], [p.x + p.w - 1, 1, x0 + w - 3]].forEach(function (l) {
      var by = ty * T;
      if (rua(l[0] + l[1], ty)) { ret(ctx, l[1] < 0 ? x0 : x0 + w - 1, by, 1, T, PEDRA2); return; }
      ret(ctx, l[2], by, 3, T, PEDRA3);
      if (l[1] < 0) ret(ctx, x0 + 1, by, 1, T, PEDRA);
    });
    // as quinas fecham a moldura
    [[x0, y0], [x0 + w - 3, y0], [x0, y0 + h - 3], [x0 + w - 3, y0 + h - 3]].forEach(function (q) { ret(ctx, q[0], q[1], 3, 3, PEDRA3); });
    ret(ctx, x0 + 1, y0 + 1, 2, 1, PEDRA); ret(ctx, x0 + 1, y0 + 1, 1, 2, PEDRA);
    // eixos em cruz (do castelo ao lago e de rua a rua), com ladrilho de junta desencontrada
    var f = fonte(), c = centroDe(f);
    function ladrilhos(ax, ay, aw, ah) {
      ret(ctx, ax, ay, aw, ah, '#fff0cc');
      for (var yy = ay; yy < ay + ah; yy += 6) {
        var desl = ((yy - ay) / 6) % 2 ? 4 : 0;
        ret(ctx, ax, yy, aw, 1, '#f3d9a4');
        for (var xx = ax + desl; xx < ax + aw; xx += 8) ret(ctx, xx, yy, 1, 6, '#f3d9a4');
      }
    }
    ladrilhos(c.x - 24, y0 + 3, 48, h - 6);
    // a faixa de lado a lado continua a rua que chega pelo oeste
    var rua = Mapa.CIDADE.ruas.find(function (r) { return r.x + r.w === p.x && r.y > p.y && r.y < p.y + p.h; });
    if (rua) ladrilhos(x0 + 3, rua.y * T, w - 6, rua.h * T);
    // rosa dos ventos no meio da fonte (a ponta de cima passa da estrela)
    c = { x: c.x, y: c.y - 4 };
    // discos sem o pixel solto que o circulo() deixa no alto e embaixo: o anel sai limpo em volta das pontas
    [[66, PEDRA3], [64, '#fff6de'], [59, '#f4c98a'], [57, '#fff6de']].forEach(function (d) {
      ctx.fillStyle = d[1];
      for (var j = 1 - d[0]; j < d[0]; j++) {
        var meia = Math.floor(Math.sqrt(d[0] * d[0] - j * j) + 0.35);
        ctx.fillRect(c.x - meia, c.y + j, meia * 2 + 1, 1);
      }
    });
    // 4 pontas (N, L, S, O), cada uma um losango: metade clara, metade escura. Sem diagonais: embaixo a bacia
    // da fonte as cobriria, e o anel interno (raio 57) não deixa espaço para losangos inteiros
    var cores = ['#7ed9c8', '#ff8a3d', '#ffd34d', '#ff9cc6'];
    for (var k = 0; k < 4; k++) ponta(ctx, c, k * Math.PI / 2 - Math.PI / 2, 42, 50, 7, 62, cores[k]);
    // pedrinhas soltas no anel
    for (var d = 0; d < 24; d++) {
      var b = d * Math.PI / 12 + 0.13;
      ret(ctx, Math.round(c.x + Math.cos(b) * 62), Math.round(c.y + Math.sin(b) * 62), 2, 1, PEDRA);
    }
  };

  /* ----- peças grandes ----- */
  // elipse com contorno K fechado: cada linha fecha o degrau até a vizinha (sem furo na borda)
  function elipseContornada(ctx, cx, cy, rx, ry, cor) {
    function meia(j) { return Math.abs(j) > ry ? -1 : Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3); }
    for (var j = -ry; j <= ry; j++) {
      var a = meia(j), dentro = Math.min(a - 1, meia(j - 1), meia(j + 1));
      ret(ctx, cx - a, cy + j, a * 2 + 1, 1, K);
      if (dentro >= 0) ret(ctx, cx - dentro, cy + j, dentro * 2 + 1, 1, cor);
    }
  }

  // a fonte grande (5×4 tiles): bacia larga de pedra, pé com bacia do meio, taça de cima e a estrela dourada
  function desenharFonte(ctx, o) {
    var c = centroDe(o), cx = c.x, cy = c.y + 12;
    elipse(ctx, cx, cy + 6, 40, 18, 'rgba(58,36,70,0.16)');
    elipseContornada(ctx, cx, cy, 39, 19, PEDRA2);
    elipse(ctx, cx, cy - 2, 36, 15, BORDA);   // faixa de pedra mais escura que o anel do chão
    elipseContornada(ctx, cx, cy, 33, 14, C.agua);
    elipse(ctx, cx, cy + 2, 26, 9, C.agua3);
    elipse(ctx, cx, cy + 3, 16, 5, '#2a7f78');
    elipse(ctx, cx - 12, cy - 7, 9, 1, C.agua2);
    elipse(ctx, cx + 16, cy + 6, 5, 1, C.agua2);
    for (var g = 0; g < 16; g++) {
      var a = g * Math.PI / 8;
      ret(ctx, Math.round(cx + Math.cos(a) * 35.5) - 1, Math.round(cy + Math.sin(a) * 16), 2, 1, PEDRA3);
    }
    // vitórias-régias na água
    [[-20, 4, '#ff9cc6'], [22, -3, null], [8, 8, '#ffe066']].forEach(function (v) {
      elipse(ctx, cx + v[0], cy + v[1], 4, 2, '#8fb83a'); ret(ctx, cx + v[0] - 2, cy + v[1] - 1, 3, 1, '#b6d24e');
      if (v[2]) ret(ctx, cx + v[0], cy + v[1] - 2, 2, 2, v[2]);
    });
    // pé e bacia do meio
    ret(ctx, cx - 6, cy - 22, 12, 22, K); ret(ctx, cx - 5, cy - 22, 10, 22, PEDRA); ret(ctx, cx + 2, cy - 22, 3, 22, PEDRA2);
    for (var an = cy - 18; an < cy; an += 6) ret(ctx, cx - 5, an, 10, 1, PEDRA3);
    elipseContornada(ctx, cx, cy - 23, 17, 6, BORDA); elipse(ctx, cx, cy - 21, 15, 2, PEDRA2);
    elipse(ctx, cx, cy - 25, 13, 3, C.agua); ret(ctx, cx - 9, cy - 27, 6, 1, C.agua2);
    // pé e taça de cima, com a estrela dourada no alto
    ret(ctx, cx - 3, cy - 42, 6, 18, K); ret(ctx, cx - 2, cy - 42, 4, 18, '#ffffff'); ret(ctx, cx + 1, cy - 42, 1, 18, '#e8e0f0');
    elipseContornada(ctx, cx, cy - 42, 9, 3, BORDA); ret(ctx, cx - 6, cy - 43, 12, 1, C.agua);
    ret(ctx, cx - 1, cy - 52, 2, 9, K); ret(ctx, cx, cy - 52, 1, 9, '#ffd34d');
    // estrela de 5 pontas (linha a linha: meia-largura por linha, de cima para baixo)
    var ESTRELA = [[0, 1], [-1, 1], [-1, 1], [-5, 5], [-4, 4], [-3, 3], [-3, 3], [-4, -1, 1, 4], [-4, -2, 2, 4]];
    ESTRELA.forEach(function (lin, j) {
      var yy = cy - 60 + j;
      for (var q = 0; q < lin.length; q += 2) {
        ret(ctx, cx + lin[q] - 1, yy, lin[q + 1] - lin[q] + 2, 1, K);
      }
    });
    ESTRELA.forEach(function (lin, j) {
      var yy = cy - 60 + j;
      if (j === 0) return;
      for (var q = 0; q < lin.length; q += 2) ret(ctx, cx + lin[q], yy, lin[q + 1] - lin[q], 1, j < 4 ? '#fff3a0' : '#ffd34d');
    });
  }
  function desenharCoreto(ctx, o) {
    var x = o.x * T, y = o.y * T, w = o.w * T, h = o.h * T, cx = x + w / 2;
    elipse(ctx, cx, y + h - 6, w / 2 - 1, 7, 'rgba(58,36,70,0.16)');
    // base octogonal com degrau na frente
    ret(ctx, x + 3, y + h - 16, w - 6, 12, K);
    ret(ctx, x + 4, y + h - 15, w - 8, 10, PEDRA);
    ret(ctx, x + 4, y + h - 8, w - 8, 3, PEDRA2);
    ret(ctx, cx - 7, y + h - 5, 14, 4, K); ret(ctx, cx - 6, y + h - 5, 12, 3, PEDRA2);
    // piso
    ret(ctx, x + 5, y + h - 16, w - 10, 3, '#f4c98a');
    // colunas e o parapeito
    [x + 6, x + 16, w + x - 19, w + x - 9].forEach(function (px) {
      ret(ctx, px, y + 17, 4, h - 32, K); ret(ctx, px + 1, y + 17, 2, h - 32, '#ffffff');
    });
    ret(ctx, x + 6, y + h - 22, w - 12, 1, K);
    for (var bx = x + 8; bx < x + w - 8; bx += 3) ret(ctx, bx, y + h - 21, 1, 5, '#ffffff');
    // telhado em pagode, com bandeirinhas e o pináculo dourado
    triangulo(ctx, x - 1, y + 1, w + 2, 18, K);
    triangulo(ctx, x + 1, y + 3, w - 2, 15, '#ff9cc6');
    ret(ctx, x - 1, y + 16, w + 2, 3, K); ret(ctx, x, y + 16, w, 2, '#e0679a');
    for (var tx = x + 4; tx < x + w - 4; tx += 6) triangulo(ctx, tx, y + 11, 4, 5, '#ffd34d');
    for (var f = 0; f < 6; f++) {
      var fx = x + 5 + f * 7;
      trianguloBaixo(ctx, fx, y + 19, 5, 4, ['#ff8a3d', '#7ed9c8', '#ffd34d'][f % 3]);
    }
    ret(ctx, cx - 1, y - 5, 2, 7, K); circulo(ctx, cx, y - 5, 2, '#ffd34d'); ret(ctx, cx - 1, y - 6, 1, 1, '#fff6a8');
  }
  function desenharCanteiroGrande(ctx, o) {
    var c = centroDe(o), cx = c.x, cy = c.y + 3, r = I.rng(o.x * 97 + o.y * 31);
    elipse(ctx, cx, cy + 4, 22, 13, 'rgba(58,36,70,0.14)');
    elipse(ctx, cx, cy, 22, 14, K);
    elipse(ctx, cx, cy, 21, 13, PEDRA2);
    elipse(ctx, cx, cy - 1, 21, 12, PEDRA);
    elipse(ctx, cx, cy, 18, 10, TERRA);
    elipse(ctx, cx, cy - 1, 17, 9, '#8fb83a');
    var FL = ['#ff8a3d', '#ffe066', '#ffffff', '#ff9cc6', '#b58cff'];
    for (var k = 0; k < 26; k++) {
      var a = r() * Math.PI * 2, d = 0.35 + r() * 0.6;
      var fx = Math.round(cx + Math.cos(a) * 16 * d), fy = Math.round(cy - 1 + Math.sin(a) * 8 * d);
      var cor = FL[Math.floor(r() * FL.length)];
      ret(ctx, fx - 1, fy, 3, 1, cor); ret(ctx, fx, fy - 1, 1, 3, cor); ret(ctx, fx, fy, 1, 1, '#fff6a8');
    }
    // arbusto em forma de coração no meio
    circulo(ctx, cx - 4, cy - 12, 6, K); circulo(ctx, cx + 4, cy - 12, 6, K); trianguloBaixo(ctx, cx - 10, cy - 12, 20, 10, K);
    circulo(ctx, cx - 4, cy - 12, 5, '#a8cc48'); circulo(ctx, cx + 4, cy - 12, 5, '#a8cc48'); trianguloBaixo(ctx, cx - 9, cy - 12, 18, 8, '#a8cc48');
    circulo(ctx, cx - 5, cy - 14, 2, '#d4ee78');
    ret(ctx, cx - 1, cy - 3, 2, 3, C.tronco);
  }
  var OBJETOS = { fonte: desenharFonte, coreto: desenharCoreto, canteiro: desenharCanteiroGrande };
  I.desenharObjeto = function (ctx, o) { if (OBJETOS[o.tipo]) OBJETOS[o.tipo](ctx, o); };

  /* ----- enfeites de 1 tile ----- */
  function poste(ctx, px, py) {
    elipse(ctx, px + 8, py + 15, 4, 1, 'rgba(58,36,70,0.2)');
    ret(ctx, px + 5, py + 12, 6, 4, K); ret(ctx, px + 6, py + 13, 4, 2, '#6b5a7a');
    ret(ctx, px + 7, py - 6, 2, 19, K); ret(ctx, px + 7, py - 6, 1, 19, '#8e7aa0');
    // lanterna
    ret(ctx, px + 4, py - 14, 8, 9, K);
    ret(ctx, px + 5, py - 13, 6, 7, '#ffe98a'); ret(ctx, px + 5, py - 13, 2, 7, '#fff8d0');
    ret(ctx, px + 3, py - 15, 10, 2, K); ret(ctx, px + 6, py - 17, 4, 2, K); ret(ctx, px + 7, py - 18, 2, 1, '#ffd34d');
    ret(ctx, px + 4, py - 6, 8, 1, K);
  }
  function banco(ctx, px, py) {
    elipse(ctx, px + 8, py + 14, 7, 2, 'rgba(58,36,70,0.18)');
    ret(ctx, px + 1, py + 4, 14, 5, K); ret(ctx, px + 2, py + 5, 12, 1, MADEIRA); ret(ctx, px + 2, py + 7, 12, 1, MADEIRA);
    ret(ctx, px + 1, py + 9, 14, 3, K); ret(ctx, px + 2, py + 10, 12, 1, '#e8a878');
    ret(ctx, px + 2, py + 12, 2, 3, K); ret(ctx, px + 12, py + 12, 2, 3, K);
  }
  function canteiro(ctx, px, py) {
    ret(ctx, px + 1, py + 8, 14, 7, K);
    ret(ctx, px + 2, py + 9, 12, 5, MADEIRA); ret(ctx, px + 2, py + 11, 12, 1, MADEIRA2);
    elipse(ctx, px + 8, py + 7, 6, 3, '#8fb83a');
    [[4, 5, '#ff8a3d'], [8, 3, '#ffe066'], [12, 5, '#ff9cc6'], [6, 7, '#ffffff'], [10, 7, '#b58cff']].forEach(function (f) {
      ret(ctx, px + f[0] - 1, py + f[1], 3, 1, f[2]); ret(ctx, px + f[0], py + f[1] - 1, 1, 3, f[2]);
    });
  }
  function cerca(ctx, px, py, x, y) {
    var esq = x > 0 && I.decor[y][x - 1] === 'cerca', dir = x < Mapa.W - 1 && I.decor[y][x + 1] === 'cerca';
    var a = esq ? 0 : 2, b = dir ? 16 : 14;
    ret(ctx, px + a, py + 6, b - a, 2, K); ret(ctx, px + a, py + 10, b - a, 2, K);
    ret(ctx, px + a, py + 6, b - a, 1, '#ffffff'); ret(ctx, px + a, py + 10, b - a, 1, '#ffffff');
    [2, 7, 12].forEach(function (s) {
      ret(ctx, px + s - 1, py + 3, 4, 11, K); ret(ctx, px + s, py + 2, 2, 11, '#ffffff'); ret(ctx, px + s + 1, py + 4, 1, 9, '#e8e0f0');
    });
  }
  function pedra(ctx, px, py) {
    elipse(ctx, px + 8, py + 12, 6, 2, 'rgba(58,36,70,0.18)');
    elipse(ctx, px + 8, py + 9, 6, 5, K); elipse(ctx, px + 8, py + 9, 5, 4, '#c9c0d6');
    elipse(ctx, px + 7, py + 8, 3, 2, '#e6e0ee'); ret(ctx, px + 10, py + 11, 2, 1, '#a89cb8');
    ret(ctx, px + 4, py + 12, 2, 1, '#8fb83a'); ret(ctx, px + 11, py + 13, 3, 1, '#8fb83a');
  }
  // motivos dos campos (Mapa.CIDADE.motivos): poço, caixa de correio, placa de direção e a trilha de pedras (chão)
  function poco(ctx, px, py) {
    ret(ctx, px + 1, py + 15, 14, 1, 'rgba(58,36,70,0.15)'); ret(ctx, px + 3, py + 15, 10, 1, 'rgba(58,36,70,0.12)');
    ret(ctx, px + 1, py + 5, 14, 10, K); ret(ctx, px + 2, py + 6, 12, 8, PEDRA2); ret(ctx, px + 2, py + 6, 12, 1, PEDRA);
    ret(ctx, px + 2, py + 10, 12, 1, PEDRA3); ret(ctx, px + 6, py + 7, 1, 3, PEDRA3); ret(ctx, px + 10, py + 11, 1, 3, PEDRA3);
    ret(ctx, px + 3, py + 4, 10, 3, K); ret(ctx, px + 4, py + 5, 8, 1, '#2a7f78');
    [2, 11].forEach(function (sx) { ret(ctx, px + sx, py - 7, 3, 12, K); ret(ctx, px + sx + 1, py - 6, 1, 11, MADEIRA); });
    ret(ctx, px + 4, py - 4, 8, 2, K); ret(ctx, px + 5, py - 4, 6, 1, MADEIRA);
    ret(ctx, px + 8, py - 2, 1, 3, '#e8d3a8'); ret(ctx, px + 6, py + 1, 5, 4, K); ret(ctx, px + 7, py + 2, 3, 2, '#8e7aa0');
    triangulo(ctx, px - 1, py - 14, 18, 8, K); triangulo(ctx, px + 1, py - 12, 14, 6, '#ff9cc6');
    ret(ctx, px - 1, py - 7, 18, 2, K); ret(ctx, px, py - 7, 16, 1, '#e0679a'); ret(ctx, px + 7, py - 11, 2, 1, '#ffd1e6');
  }
  function correio(ctx, px, py) {
    ret(ctx, px + 4, py + 14, 9, 1, 'rgba(58,36,70,0.15)'); ret(ctx, px + 6, py + 15, 5, 1, 'rgba(58,36,70,0.15)');
    ret(ctx, px + 7, py + 1, 3, 15, K); ret(ctx, px + 8, py + 1, 1, 14, MADEIRA);
    ret(ctx, px + 2, py - 6, 12, 8, K); ret(ctx, px + 3, py - 7, 10, 1, K);
    ret(ctx, px + 3, py - 6, 10, 7, '#5fb4ff'); ret(ctx, px + 3, py - 6, 10, 1, '#9fdcff'); ret(ctx, px + 3, py - 6, 1, 7, '#9fdcff');
    ret(ctx, px + 3, py, 10, 1, '#3f7fe0'); ret(ctx, px + 5, py - 3, 6, 1, K);
    ret(ctx, px + 13, py - 10, 1, 7, K); ret(ctx, px + 14, py - 10, 2, 3, K); ret(ctx, px + 14, py - 9, 1, 1, '#ff5c6a');
  }
  function placa(ctx, px, py) {
    ret(ctx, px + 4, py + 15, 8, 1, 'rgba(58,36,70,0.15)'); ret(ctx, px + 6, py + 15, 4, 1, 'rgba(58,36,70,0.12)');
    ret(ctx, px + 6, py - 9, 4, 25, K); ret(ctx, px + 7, py - 9, 2, 24, MADEIRA); ret(ctx, px + 7, py - 9, 1, 24, '#e8b27a');
    // duas tábuas em seta: à direita (em cima) e à esquerda (embaixo)
    function tabua(y, dir) {
      var x0 = dir > 0 ? px + 1 : px + 3;
      ret(ctx, x0, y, 12, 6, K);
      ret(ctx, dir > 0 ? x0 + 12 : x0 - 1, y + 1, 1, 4, K); ret(ctx, dir > 0 ? x0 + 13 : x0 - 2, y + 2, 1, 2, K);
      ret(ctx, x0 + 1, y + 1, 11, 4, '#e8b27a'); ret(ctx, dir > 0 ? x0 + 12 : x0 - 1, y + 2, 1, 2, '#e8b27a');
      ret(ctx, x0 + 1, y + 4, 11, 1, MADEIRA); ret(ctx, x0 + 3, y + 2, 6, 1, MADEIRA2);
    }
    tabua(py - 7, 1); tabua(py + 1, -1);
  }
  // pedras chatas de pisar, na metade de cima do tile (a margem do lago cobre a de baixo)
  function pedrinhas(ctx, px, py, x) {
    [[2, 2 + (x % 2) * 2], [9, 5 - (x % 2) * 2]].forEach(function (p) {
      var sx = px + p[0], sy = py + p[1];
      ret(ctx, sx, sy + 4, 6, 1, 'rgba(58,36,70,0.18)');
      ret(ctx, sx, sy, 6, 4, K); ret(ctx, sx - 1, sy + 1, 8, 2, K);
      ret(ctx, sx, sy + 1, 6, 2, PEDRA2); ret(ctx, sx + 1, sy + 1, 3, 1, PEDRA);
    });
  }
  var PECAS = { poste: poste, banco: banco, canteiro: canteiro, cerca: cerca, pedra: pedra,
    poco: poco, correio: correio, placa: placa, pedrinhas: pedrinhas };
  // as que entram na ordem de cima para baixo (e voltam por cima da Mariana quando ela passa atrás)
  I.PECAS_ALTAS = { poste: true, banco: true, canteiro: true, cerca: true, poco: true, correio: true, placa: true };
  I.desenharPeca = function (ctx, tipo, x, y) { if (PECAS[tipo]) PECAS[tipo](ctx, x * T, y * T, x, y); };
  // peças iguais dividem o mesmo sprite (a cerca muda com os vizinhos)
  I.chavePeca = function (tipo, x, y) {
    if (tipo !== 'cerca') return tipo;
    return 'cerca:' + (x > 0 && I.decor[y][x - 1] === 'cerca') + (x < Mapa.W - 1 && I.decor[y][x + 1] === 'cerca');
  };

  /* ----- animação: água da fonte (jatos, pingos, anéis) e o brilho dos lampiões ----- */
  // a água da fonte, em px do jogo: no buffer e, quando ela passa atrás da fonte, de novo por cima dela
  I.animarObjeto = function (ctx, o, t) {
    if (o.tipo !== 'fonte') return;
    var c = centroDe(o), cx = c.x, cy = c.y + 12;
    for (var g = 0; g < 14; g++) {
      var lado = g % 2 ? 1 : -1;
      // da taça de cima para a bacia do meio
      var fa = ((t / 900) + g / 14) % 1;
      ctx.fillStyle = fa < 0.8 ? '#bfe7ff' : '#ffffff';
      ctx.fillRect(Math.round(cx + lado * (4 + fa * 10)), Math.round(cy - 45 - Math.sin(fa * Math.PI) * 6 + fa * 20), 1, 2);
      // da bacia do meio para a de baixo, em cortina
      var fb = ((t / 1100) + g / 14) % 1;
      ctx.fillStyle = fb < 0.7 ? '#d9fff4' : '#ffffff';
      ctx.fillRect(Math.round(cx + lado * (14 + fb * 7) + (g % 3) - 1), Math.round(cy - 23 + fb * fb * 20), 1, 2);
    }
    // jato de cima (em volta da estrela)
    var jato = (t / 500) % 1;
    ctx.fillStyle = 'rgba(217,255,244,0.9)';
    ctx.fillRect(cx - 6, cy - 46 - Math.round(Math.sin(jato * Math.PI) * 2), 2, 2);
    ctx.fillRect(cx + 4, cy - 46 - Math.round(Math.cos(jato * Math.PI) * 2), 2, 2);
    // anéis na água de baixo
    for (var k = 0; k < 3; k++) {
      var an = ((t / 1600) + k / 3) % 1, rx = Math.round(18 + an * 12), ry = Math.round(6 + an * 5);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - an)).toFixed(2) + ')';
      ctx.fillRect(cx - rx, cy + 1, 3, 1); ctx.fillRect(cx + rx - 3, cy + 1, 3, 1);
      ctx.fillRect(cx - 2, cy + ry, 4, 1);
    }
    // brilho que passeia na água
    var br = (t / 2600) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(Math.round(cx - 26 + br * 52), cy + 6, 3, 1);
  };
  // halo do lampião: anel de 2 px em volta da lanterna e mais 2 px pontilhados (2×2), só FORA do poste
  // (não lava o contorno nem se sobrepõe: um nível de alfa só; ui.md §10.13). Feito uma vez, na caixa do sprite do poste
  var halo = null;
  function haloPoste() {
    if (halo) return halo;
    var w = T + 8, h = T + 26, ox = 4, oy = 24;
    var base = PA.novoCanvas(w, h), bctx = base.getContext('2d');
    poste(bctx, ox, oy);
    var d = bctx.getImageData(0, 0, w, h).data, dist = new Uint8Array(w * h), fila = [], x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x;
      if (d[i * 4 + 3] === 255 && y <= oy - 6) { dist[i] = 9; fila.push(i); }
    }
    for (var anel = 1; anel <= 4; anel++) {
      var prox = [];
      fila.forEach(function (k) {
        var kx = k % w, ky = (k - kx) / w;
        for (var j = -1; j <= 1; j++) for (var q = -1; q <= 1; q++) {
          var nx = kx + q, ny = ky + j, nk = ny * w + nx;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || dist[nk] || d[nk * 4 + 3]) continue;
          dist[nk] = anel; prox.push(nk);
        }
      });
      fila = prox;
    }
    halo = PA.novoCanvas(w, h);
    var hctx = halo.getContext('2d');
    hctx.fillStyle = '#ffe98a';
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var dd = dist[y * w + x];
      if (dd && dd <= 2 || (dd === 3 || dd === 4) && (x + y) % 2 === 0) hctx.fillRect(x, y, 1, 1);
    }
    return halo;
  }
  var postes = [], postesDe = null;   // os lampiões do mapa de agora (refeitos quando o Mapa.criar troca a grade)
  I.animarCidade = function (ctx, t) {
    var f = fonte();
    if (f) I.animarObjeto(ctx, f, t);
    // lampiões: o halo morno que respira devagar
    var img = haloPoste();
    // respira em 3 degraus de alfa (0,14 · 0,18 · 0,22), não em rampa contínua (ui.md §10.13 e §10.15)
    ctx.globalAlpha = 0.18 + 0.04 * Math.round(Math.sin(t / 900));
    if (postesDe !== I.decor) {
      postesDe = I.decor; postes = [];
      for (var y = 0; y < Mapa.H; y++) for (var x = 0; x < Mapa.W; x++) if (I.decor[y][x] === 'poste') postes.push([x * T - 4, y * T - 24]);
    }
    for (var i = 0; i < postes.length; i++) ctx.drawImage(img, postes[i][0], postes[i][1]);
    ctx.globalAlpha = 1;
  };
})();
