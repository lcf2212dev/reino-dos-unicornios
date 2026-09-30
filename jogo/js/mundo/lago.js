/* O lago do reino: tiles de água (Mapa.agua: dá para nadar, não é sólido), a água desenhada (uma máscara de pixel
   com a margem irregular, feita uma vez), a fundura de um ponto (Mapa.fundura, a linha d'água dos sprites, tirada
   da mesma máscara) e o desenho: o fixo (Mapa._interno.desenharLago, chamado por Mapa.prerender) e o vivo
   (I.desenharLagoVivo: juncos, vitórias-régias e a ondinha da linha d'água; parados sem Animações).
   Os tiles 'a' são marcados em Mapa.criar (mundo/mapa.js); o custo de nadar no caminho também fica lá. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var T = Mapa.T;
  var C = I.C, ret = I.ret, elipse = I.elipse, K = C.contorno;
  var LINHA = '#2b8a82', RASO = C.agua, MEIO = C.agua3, FUNDO = '#2a7f78', AREIA = C.margem, MOLHADA = '#e8d090';

  // tile de água do lago (a fonte da praça não é água e continua sólida)
  Mapa.agua = function (x, y) { return I.dentro(x, y) && I.tipo[y][x] === 'a'; };

  var LAGO = Mapa.CIDADE.lago;   // em tiles (mundo/lugares.js)
  var cx = Math.round(LAGO.cx * T), cy = Math.round(LAGO.cy * T), rx = Math.round(LAGO.rx * T), ry = Math.round(LAGO.ry * T);
  // a caixa da máscara (px do jogo): o lago e a margem de areia em volta
  var M = 8, X0 = cx - rx - M, Y0 = cy - ry - M, LW = rx * 2 + M * 2 + 1, LH = ry * 2 + M * 2 + 1;
  // margem irregular, fixa: 1–2 px a mais ou a menos por coluna (em cima e embaixo, cada uma com a sua onda)
  function onda(x, fase) { return Math.round(Math.sin(x * 0.19 + fase) * 1.1 + Math.sin(x * 0.47 + fase * 2) * 0.8); }
  function naAgua(px, py) {
    var dx = (px + 0.5 - cx) / rx;
    if (Math.abs(dx) >= 1) return false;
    var hh = ry * Math.sqrt(1 - dx * dx), dy = py + 0.5 - cy;
    return dy < 0 ? -dy <= hh + onda(px, 1.3) : dy <= hh + onda(px, 4.1);
  }
  // distância com sinal até a margem (px; + dentro da água, - fora), por chanfro 3-4 nas duas direções
  var dist = new Float32Array(LW * LH), agua = new Uint8Array(LW * LH);
  (function () {
    var i, x, y, GR = 1e6, den = new Float32Array(LW * LH), fora = new Float32Array(LW * LH);
    for (y = 0; y < LH; y++) for (x = 0; x < LW; x++) {
      i = y * LW + x; agua[i] = naAgua(X0 + x, Y0 + y) ? 1 : 0;
      den[i] = agua[i] ? GR : 0; fora[i] = agua[i] ? 0 : GR;
    }
    function chanfro(d, foraDaCaixa) {
      function v(x, y) { return x < 0 || y < 0 || x >= LW || y >= LH ? foraDaCaixa : d[y * LW + x]; }
      for (y = 0; y < LH; y++) for (x = 0; x < LW; x++) {
        i = y * LW + x; if (!d[i]) continue;
        d[i] = Math.min(d[i], v(x - 1, y) + 3, v(x, y - 1) + 3, v(x - 1, y - 1) + 4, v(x + 1, y - 1) + 4);
      }
      for (y = LH - 1; y >= 0; y--) for (x = LW - 1; x >= 0; x--) {
        i = y * LW + x; if (!d[i]) continue;
        d[i] = Math.min(d[i], v(x + 1, y) + 3, v(x, y + 1) + 3, v(x + 1, y + 1) + 4, v(x - 1, y + 1) + 4);
      }
    }
    chanfro(den, 0); chanfro(fora, GR);   // fora da caixa não é água
    for (i = 0; i < LW * LH; i++) dist[i] = agua[i] ? den[i] / 3 - 0.5 : -(fora[i] / 3 - 0.5);
  })();
  function d(x, y) { return x < 0 || y < 0 || x >= LW || y >= LH ? -M : dist[y * LW + x]; }
  // quantos px o ponto (wx, wy) está para dentro da água desenhada (negativo = fora, na margem). É o que decide onde
  // fica a linha d'água dos sprites: casa com o desenho do lago (a mesma máscara), e não com a grade de tiles.
  Mapa.fundura = function (wx, wy) {
    var fx = wx - X0 - 0.5, fy = wy - Y0 - 0.5, x = Math.floor(fx), y = Math.floor(fy), a = fx - x, b = fy - y;
    if (x < 0 || y < 0 || x >= LW - 1 || y >= LH - 1) return -M;
    return (d(x, y) * (1 - a) + d(x + 1, y) * a) * (1 - b) + (d(x, y + 1) * (1 - a) + d(x + 1, y + 1) * a) * b;
  };

  // os enfeites foram desenhados à mão num lago de 104×38 px com centro em (288, 394): P leva para este
  var sx = rx / 104, sy = ry / 38;
  function P(x, y) { return [Math.round(cx + (x - 288) * sx), Math.round(cy + (y - 394) * sy)]; }

  function desenharLago(ctx) {
    var x, y, k;
    for (y = 0; y < LH; y++) for (x = 0; x < LW; x++) {
      k = d(x, y);
      var cor = null;
      if (k < -4 + (D.sorte(X0 + x, 0, 31) < 0.4 ? 1 : 0)) continue;
      if (k < -1) cor = AREIA;
      else if (k < 0) cor = MOLHADA;
      else if (k < 1) cor = LINHA;                                  // linha d'água de 1 px
      else {
        // a parte funda puxa para o lado de baixo e da direita (não é um alvo)
        var v = k + (X0 + x - cx) * 0.09 + (Y0 + y - cy) * 0.3;
        cor = v < 6 ? RASO : v < 21 ? MEIO : FUNDO;
      }
      ret(ctx, X0 + x, Y0 + y, 1, 1, cor);
    }
    // reflexo quebrado em 3 traços, em cima e à esquerda (a luz vem de lá)
    [[-44, -17, 9, C.agua2], [-30, -14, 5, '#ffffff'], [-52, -12, 3, C.agua2], [30, -18, 4, C.agua2]].forEach(function (s) {
      ret(ctx, cx + s[0], cy + s[1], s[2], 1, s[3]);
    });
    // pedras na margem, com contorno
    [[286, 353], [180, 392], [393, 400], [286, 433], [338, 357], [228, 427]].forEach(function (p) {
      var q = P(p[0], p[1]);
      ret(ctx, q[0] - 1, q[1], 5, 2, K); ret(ctx, q[0], q[1] - 1, 3, 4, K);
      ret(ctx, q[0], q[1], 3, 2, '#c9c0d6'); ret(ctx, q[0], q[1], 2, 1, '#e6e0ee');
    });
  }

  /* ----- a parte viva: juncos (balançam 1 px), vitórias-régias (sobem e descem 1 px) e a ondinha que corre na linha
     d'água (3 quadros). Sem Animações, tudo no quadro 0. ----- */
  var JUNCOS = [[236, 350, 8], [238, 347, 10], [241, 352, 6], [328, 349, 8], [331, 346, 11], [334, 351, 6],
    [184, 388, 7], [182, 386, 9], [186, 390, 6], [390, 388, 7], [392, 385, 10], [388, 391, 5],
    [256, 426, 7], [258, 423, 9], [261, 428, 6], [336, 422, 8], [338, 420, 10], [341, 424, 6]].map(function (h) { return P(h[0], h[1]).concat(h[2]); });
  var REGIAS = [[-60, -8, 6, 3, '#ff8a3d'], [-40, 12, 5, 3, '#ffe066'], [52, 4, 7, 3, null], [70, -10, 5, 2, '#ff8a3d'],
    [-86, 2, 5, 2, '#ffe066'], [20, -16, 5, 2, null]].map(function (v) { return [Math.round(v[0] * sx), Math.round(v[1] * sy)].concat(v.slice(2)); });
  // o anel logo dentro da linha d'água, em ordem de ângulo (a ondinha anda por ele)
  var ANEL = [];
  for (var yy = 0; yy < LH; yy++) for (var xx = 0; xx < LW; xx++) {
    var kk = dist[yy * LW + xx];
    if (kk >= 1 && kk < 2) ANEL.push([X0 + xx, Y0 + yy, Math.atan2((Y0 + yy - cy) / ry, (X0 + xx - cx) / rx)]);
  }
  ANEL.sort(function (a, b) { return a[2] - b[2]; });

  // a parte viva num quadro (q = 0, 1, 2; parado = sem Animações), no ctx em px do jogo
  function vivo(ctx, q, animar) {
    ctx.fillStyle = C.agua2;
    for (var i = 0; i < ANEL.length; i++) if ((i + q * 4) % 12 < 3) ctx.fillRect(ANEL[i][0], ANEL[i][1], 1, 1);
    REGIAS.forEach(function (v, n) {
      var bx = cx + v[0], by = cy + v[1] + (animar && (q + n) % 3 === 0 ? -1 : 0);
      elipse(ctx, bx + 1, by + 1, v[2], v[3], FUNDO);
      elipse(ctx, bx, by, v[2], v[3], '#8fb83a');
      elipse(ctx, bx - 1, by - 1, Math.max(2, v[2] - 2), 1, '#b6d24e');
      ret(ctx, bx, by, Math.max(2, v[2] - 1), 1, MEIO);
      if (v[4]) { ret(ctx, bx + 2, by - 2, 2, 2, v[4]); ret(ctx, bx + 2, by - 2, 1, 1, '#fff6a8'); }
    });
    JUNCOS.forEach(function (h, n) {
      var s = animar && (q + n) % 3 === 1 ? 1 : 0;
      ret(ctx, h[0], h[1] + 2, 1, h[2] - 2, '#2f7a48');
      ret(ctx, h[0] + s, h[1], 1, 2, '#8fb83a');
    });
  }
  // no estático (Mapa.prerender, no chão, antes das peças): o lago e a parte viva parada
  I.desenharLago = function (ctx) { desenharLago(ctx); vivo(ctx, 0, false); };
  // os quadros da animação, feitos uma vez com o estático pronto: só os pixels que mudam em relação ao parado e que
  // nenhuma peça cobre (árvore, banco, poste desenhados depois continuam na frente). Um drawImage por quadro.
  var quadros = null, estaticoDe = null;
  function prepararQuadros(estatico) {
    var chao = PA.novoCanvas(LW, LH), cc = chao.getContext('2d');
    cc.translate(-X0, -Y0); desenharLago(cc);
    function com(q, animar) {
      var c = PA.novoCanvas(LW, LH), g = c.getContext('2d');
      g.drawImage(chao, 0, 0); g.translate(-X0, -Y0); vivo(g, q, animar);
      return g.getImageData(0, 0, LW, LH).data;
    }
    var parado = com(0, false), fim = estatico.getContext('2d').getImageData(X0, Y0, LW, LH).data;
    quadros = [0, 1, 2].map(function (q) {
      var dq = com(q, true), c = PA.novoCanvas(LW, LH), g = c.getContext('2d'), img = g.createImageData(LW, LH), o = img.data;
      for (var i = 0; i < o.length; i += 4) {
        var muda = dq[i] !== parado[i] || dq[i + 1] !== parado[i + 1] || dq[i + 2] !== parado[i + 2];
        var livre = fim[i] === parado[i] && fim[i + 1] === parado[i + 1] && fim[i + 2] === parado[i + 2];
        if (muda && livre) { o[i] = dq[i]; o[i + 1] = dq[i + 1]; o[i + 2] = dq[i + 2]; o[i + 3] = 255; }
      }
      g.putImageData(img, 0, 0);
      return c;
    }).map(recortar);
    estaticoDe = estatico;
  }
  // só a caixa dos pixels que mudam (o drawImage de cada quadro fica pequeno)
  function recortar(c) {
    var d = c.getContext('2d').getImageData(0, 0, LW, LH).data, x0 = LW, y0 = LH, x1 = -1, y1 = -1;
    for (var y = 0; y < LH; y++) for (var x = 0; x < LW; x++) if (d[(y * LW + x) * 4 + 3]) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return { img: null };
    var r = PA.novoCanvas(x1 - x0 + 1, y1 - y0 + 1);
    r.getContext('2d').drawImage(c, -x0, -y0);
    return { img: r, x: X0 + x0, y: Y0 + y0 };
  }
  // no buffer, com Animações: o quadro da vez por cima do estático (sem Animações o estático já está parado)
  I.desenharLagoVivo = function (ctx, t, animar) {
    if (!animar || !I.estatico) return;
    if (estaticoDe !== I.estatico) prepararQuadros(I.estatico);
    var q = quadros[Math.floor(t / 450) % 3];
    if (q.img) ctx.drawImage(q.img, q.x, q.y);
  };
})();
