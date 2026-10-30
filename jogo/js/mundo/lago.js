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

  var CLARO = '#a8ecdc', FUNDISSIMO = '#1f6a68', AREIA2 = '#f0d08c', AREIA3 = '#fff4cc', BORDA = '#dcb878';
  function desenharLago(ctx) {
    var x, y, k;
    for (y = 0; y < LH; y++) for (x = 0; x < LW; x++) {
      k = d(x, y);
      var cor = null, wx = X0 + x, wy = Y0 + y, xadrez = (wx + wy) & 1;
      var fim = -4 + (D.sorte(wx, 0, 31) < 0.4 ? 1 : 0);
      if (k < fim) continue;
      if (k < fim + 1) cor = BORDA;                                 // a beirada da areia, na grama
      else if (k < -1) {
        var r = D.sorte(wx, wy, 33);
        cor = r < 0.12 ? AREIA2 : r > 0.94 ? AREIA3 : AREIA;        // grãozinhos
      }
      else if (k < 0) cor = MOLHADA;
      else if (k < 1) cor = LINHA;                                  // linha d'água de 1 px
      else if (k < 2.5) cor = CLARO;                                // o raso que deixa ver a areia
      else {
        // a parte funda puxa para o lado de baixo e da direita (não é um alvo); a troca de tom em pontilhado 2 × 2
        var v = k + (wx - cx) * 0.09 + (wy - cy) * 0.3;
        var lim = [5, 9, 20, 26, 34], tons = [CLARO, RASO, MEIO, FUNDO, FUNDISSIMO], t = 0;
        while (t < 4 && v >= lim[t] + (xadrez ? 0 : 1.2)) t++;
        cor = t === 0 ? RASO : tons[t];
        if (t === 1 && v < 6.2 && xadrez) cor = CLARO;
      }
      ret(ctx, wx, wy, 1, 1, cor);
    }
    // reflexo do céu: traços em cima e à esquerda (a luz vem de lá) e uma nuvem refletida
    [[-44, -17, 9, C.agua2], [-30, -14, 5, '#ffffff'], [-52, -12, 3, C.agua2], [30, -18, 4, C.agua2], [-20, -9, 6, CLARO],
      [-58, -5, 4, CLARO], [12, -12, 3, '#ffffff'], [44, -6, 5, CLARO]].forEach(function (s) {
      ret(ctx, cx + Math.round(s[0] * sx), cy + Math.round(s[1] * sy), s[2], 1, s[3]);
    });
    // pedrinhas na areia, com contorno: as postas à mão e outras pela sorte da margem
    var pedras = [[286, 353], [180, 392], [393, 400], [286, 433], [338, 357], [228, 427]].map(function (p) { return P(p[0], p[1]); });
    for (y = 2; y < LH - 2; y += 3) for (x = 2; x < LW - 2; x += 3) {
      k = d(x, y);
      if (k > -3.4 && k < -2.2 && D.sorte(X0 + x, Y0 + y, 35) < 0.16) pedras.push([X0 + x, Y0 + y, 1]);
    }
    pedras.forEach(function (q) {
      if (q[2]) {   // miúda
        ret(ctx, q[0] - 1, q[1], 4, 2, K); ret(ctx, q[0], q[1] - 1, 2, 4, K);
        ret(ctx, q[0], q[1], 2, 1, D.sorte(q[0], q[1], 36) < 0.5 ? '#e6e0ee' : '#f0d8c0'); ret(ctx, q[0] + 1, q[1], 1, 1, '#b4a8c4');
        return;
      }
      ret(ctx, q[0] - 1, q[1], 5, 2, K); ret(ctx, q[0], q[1] - 1, 3, 4, K);
      ret(ctx, q[0], q[1], 3, 2, '#c9c0d6'); ret(ctx, q[0], q[1], 2, 1, '#e6e0ee'); ret(ctx, q[0] + 2, q[1] + 1, 1, 1, '#a89cb8');
    });
  }

  /* ----- a parte viva: juncos e taboas (balançam 1 px), vitórias-régias com flor (sobem e descem 1 px), brilhos que
     piscam e a ondinha que corre na linha d'água (3 quadros). Sem Animações, tudo no quadro 0. ----- */
  var JUNCOS = [[236, 350, 8], [238, 347, 10], [241, 352, 6], [328, 349, 8], [331, 346, 11], [334, 351, 6],
    [184, 388, 7], [182, 386, 9], [186, 390, 6], [390, 388, 7], [392, 385, 10], [388, 391, 5],
    [256, 426, 7], [258, 423, 9], [261, 428, 6], [336, 422, 8], [338, 420, 10], [341, 424, 6]].map(function (h) { return P(h[0], h[1]).concat(Math.round(h[2] * 1.4)); });
  // mais tufos pela margem, pela sorte do lugar (longe das pedras de passar, em cima no meio)
  (function () {
    for (var y = 3; y < LH - 3; y += 2) for (var x = 3; x < LW - 3; x += 2) {
      var k = dist[y * LW + x], wx = X0 + x, wy = Y0 + y;
      if (k < -1.5 || k > -0.5 || (Math.abs(wx - cx) < rx * 0.3 && wy < cy) || D.sorte(wx, wy, 37) > 0.12) continue;
      var a = 8 + Math.floor(D.sorte(wx, wy, 38) * 6);
      JUNCOS.push([wx, wy - a + 1, a], [wx + 3, wy - a + 4, a - 3]);
    }
  })();
  var REGIAS = [[-60, -8, 6, 3, '#ff9cc6'], [-40, 12, 5, 3, '#ffffff'], [52, 4, 7, 3, null], [70, -10, 5, 2, '#ff9cc6'],
    [-86, 2, 5, 2, '#ffffff'], [20, -16, 5, 2, null], [-8, 6, 4, 2, null], [86, 0, 4, 2, '#ff9cc6']].map(function (v) { return [Math.round(v[0] * sx), Math.round(v[1] * sy)].concat(v.slice(2)); });
  var BRILHOS = [[-36, -4], [8, -2], [40, 10], [-70, 6], [62, -14], [-12, 14]].map(function (v) { return [cx + Math.round(v[0] * sx), cy + Math.round(v[1] * sy)]; });
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
    // brilhos de sol: uma cruzinha que acende num quadro e fica de pontinho nos outros
    BRILHOS.forEach(function (b, n) {
      var aceso = animar ? (q + n) % 3 === 0 : n % 2 === 0;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(b[0], b[1], 1, 1);
      if (aceso) { ctx.fillStyle = C.agua2; ctx.fillRect(b[0] - 1, b[1], 3, 1); ctx.fillRect(b[0], b[1] - 1, 1, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(b[0], b[1], 1, 1); }
    });
    REGIAS.forEach(function (v, n) {
      var bx = cx + v[0], by = cy + v[1] + (animar && (q + n) % 3 === 0 ? -1 : 0), rx2 = v[2], ry2 = v[3];
      elipse(ctx, bx + 1, by + 1, rx2, ry2, FUNDISSIMO);              // a sombra na água
      elipse(ctx, bx, by, rx2 + 1, ry2 + 1, '#2f6a3a');                // o contorno da folha
      elipse(ctx, bx, by, rx2, ry2, '#7fb03a');
      elipse(ctx, bx - 1, by - 1, Math.max(2, rx2 - 2), Math.max(1, ry2 - 1), '#b6d24e');
      ret(ctx, bx - rx2 + 2, by - ry2, 1, 1, '#e4f59a');               // o brilho de cima
      ret(ctx, bx + 1, by - ry2 - 1, 2, ry2 + 1, n % 2 ? MEIO : FUNDO); // o cortezinho da folha
      if (v[4]) {   // a flor: pétalas em volta de um miolo amarelo
        var fx = bx - 2, fy = by - 2, esc = D.escurecer(v[4], 0.18);
        ret(ctx, fx - 1, fy, 5, 3, K); ret(ctx, fx, fy - 1, 3, 5, K);
        ret(ctx, fx, fy, 3, 3, v[4]); ret(ctx, fx + 2, fy + 2, 1, 1, esc); ret(ctx, fx + 1, fy - 1, 1, 1, v[4]);
        ret(ctx, fx + 1, fy + 1, 1, 1, '#ffd34d');
      }
    });
    JUNCOS.forEach(function (h, n) {
      var s = animar && (q + n) % 3 === 1 ? 1 : 0, x = h[0], base = h[1] + h[2], a = Math.min(h[2], base - Y0 - 1), y = base - a;
      // na fileira colada à calçada (em cima) o tufo fica baixo e sem taboa: não sobe na rua
      // o tufo: folha do meio alta, duas mais baixas inclinadas para os lados
      ret(ctx, x, y + 2, 1, a - 2, '#2f7a48');
      ret(ctx, x + s, y, 1, 2, '#8fb83a');
      ret(ctx, x - 1, base - Math.ceil(a * 0.6), 1, Math.ceil(a * 0.6), '#4f9a4a');
      ret(ctx, x - 2 + s, base - Math.ceil(a * 0.6) - 1, 1, 2, '#a8cc48');
      ret(ctx, x + 1, base - Math.ceil(a * 0.45), 1, Math.ceil(a * 0.45), '#3e8a46');
      ret(ctx, x + 2 + s, base - Math.ceil(a * 0.45) - 1, 1, 2, '#8fb83a');
      if (n % 3 === 1 && y - 7 >= Y0) {   // a taboa: a espiga marrom com contorno no alto do talo
        ret(ctx, x - 1 + s, y - 5, 3, 6, K);
        ret(ctx, x + s, y - 4, 1, 4, '#9a5a36'); ret(ctx, x + s, y - 4, 1, 1, '#c4825a');
        ret(ctx, x + s, y - 7, 1, 2, '#2f7a48');
      }
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
