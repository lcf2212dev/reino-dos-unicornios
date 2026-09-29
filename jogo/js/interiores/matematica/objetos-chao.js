/* Torre dos Números (Matemática), objetos de chão (prefixo matematica-): ábaco, blocos de contar, sólidos,
   tapetes de números, calendário de mesa, despertador, ampulheta, dados, roleta, pote de bolinhas, potes de
   parcelas iguais, caixa de ovos, triciclo, dominó, cartas da tabuada e balança. Algarismos: objetos-parede.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var S = R._predios.matematica, CO = S.CORES, BLOCOS = S.BLOCOS;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // cubinho de 5×5 com contorno e luz em cima
  function cubo(ctx, x, y, c) { ret(ctx, x, y, 5, 5, K); ret(ctx, x + 1, y + 1, 3, 3, c); ret(ctx, x + 1, y + 1, 3, 1, clarear(c, 0.5)); }
  // pé de madeira baixo (mesinha de apoio)
  function mesinha(ctx, x, y, w) {
    ret(ctx, x, y, w, 4, K); ret(ctx, x + 1, y + 1, w - 2, 2, C.madeira); ret(ctx, x + 1, y + 1, w - 2, 1, C.madeiraClara);
    ret(ctx, x + 1, y + 4, 2, 3, K); ret(ctx, x + w - 3, y + 4, 2, 3, K);
  }

  // ábaco de pé: armação de madeira com 4 varetas de contas coloridas
  I.objeto('matematica-abaco', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var x = px + 2, y = py - 7;
      ret(ctx, x, y, 28, 20, K); ret(ctx, x + 1, y + 1, 26, 18, C.madeira);
      ret(ctx, x + 1, y + 1, 26, 1, C.madeiraClara);
      ret(ctx, x + 3, y + 3, 22, 14, '#fff1d0');
      for (var i = 0; i < 4; i++) {
        var yy = y + 5 + i * 3, n = [5, 3, 4, 2][i];
        ret(ctx, x + 3, yy + 1, 22, 1, C.metal2);
        for (var k = 0; k < n; k++) { ret(ctx, x + 4 + k * 3, yy, 3, 3, K); ret(ctx, x + 5 + k * 3, yy + 1, 1, 1, BLOCOS[i]); }
      }
      ret(ctx, x + 1, y + 19, 3, 3, K); ret(ctx, x + 24, y + 19, 3, 3, K);
    } });
  // blocos de contar: uma barra de 5 em pé e cubinhos soltos
  I.objeto('matematica-blocos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desloca', 0);
      for (var i = 0; i < 4; i++) cubo(ctx, px + 2, py - 5 + i * 4, BLOCOS[(i + d) % BLOCOS.length]);
      cubo(ctx, px + 7, py + 7, BLOCOS[(d + 4) % BLOCOS.length]); cubo(ctx, px + 10, py + 10, BLOCOS[(d + 5) % BLOCOS.length]);
      cubo(ctx, px + 7, py + 3, BLOCOS[(d + 2) % BLOCOS.length]);
    } });
  // sólidos geométricos num tablado: cubo, cone e esfera
  I.objeto('matematica-solidos', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 9, 30, 6, K); ret(ctx, px + 2, py + 10, 28, 4, C.creme2); ret(ctx, px + 2, py + 10, 28, 1, C.creme);
      // cubo em pé (face da frente e o topo)
      ret(ctx, px + 3, py - 1, 9, 11, K); ret(ctx, px + 4, py + 2, 7, 7, CO.vermelho); ret(ctx, px + 4, py, 7, 2, clarear(CO.vermelho, 0.45));
      // cone
      triangulo(ctx, px + 13, py - 4, 8, 14, K); triangulo(ctx, px + 14, py - 2, 6, 11, CO.amarelo);
      ret(ctx, px + 16, py + 1, 1, 3, clarear(CO.amarelo, 0.6));
      // esfera
      circulo(ctx, px + 25, py + 5, 5, K); circulo(ctx, px + 25, py + 5, 4, CO.azul);
      ret(ctx, px + 23, py + 2, 2, 1, clarear(CO.azul, 0.6));
    } });
  // tapete de números (amarelinha de 1 a 4; var.texto, um algarismo por casa, ou var.numeros: ['5', '10', …])
  I.objeto('matematica-tapete-numeros', { w: 2, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var s = v(o, 'numeros', String(v(o, 'texto', '1234')).split(''));
      ret(ctx, px + 1, py + 1, 30, 30, K);
      for (var i = 0; i < 4; i++) {
        var x = px + 2 + (i % 2) * 15, y = py + 2 + Math.floor(i / 2) * 15, c = BLOCOS[(i + v(o, 'desloca', 0)) % BLOCOS.length];
        ret(ctx, x, y, 13, 13, clarear(c, 0.55));
        S.textoC(ctx, x + 7, y + 4, String(s[i] || ''), escurecer(c, 0.45));
      }
    } });
  // reta numérica pintada no chão (var.texto: os números, um por tile e meio)
  I.objeto('matematica-reta', { w: 3, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, s = String(v(o, 'texto', '01234'));
      ret(ctx, px + 1, py + 3, W - 2, 11, K); ret(ctx, px + 2, py + 4, W - 4, 9, '#eaf4ff');
      ret(ctx, px + 3, py + 8, W - 6, 1, CO.azul);
      triangulo(ctx, px + W - 6, py + 5, 3, 7, CO.azul);
      var passo = (W - 10) / Math.max(1, s.length - 1);
      s.split('').forEach(function (ch, i) {
        var x = Math.round(px + 4 + i * passo);
        ret(ctx, x + 1, py + 6, 1, 5, CO.azul);
        S.texto(ctx, x - 3, py + 5, ch, i % 2 ? CO.vermelho : K);
      });
    } });
  // calendário de mesa, de virar a folha (var.dia: o número da folha)
  I.objeto('matematica-folhinha', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      ret(ctx, px + 2, py + 11, 12, 4, K); ret(ctx, px + 3, py + 12, 10, 2, C.madeira);
      ret(ctx, px + 3, py - 6, 10, 18, K); ret(ctx, px + 4, py - 5, 8, 16, C.branco);
      ret(ctx, px + 4, py - 5, 8, 4, CO.vermelho); ret(ctx, px + 4, py - 5, 8, 1, clarear(CO.vermelho, 0.45));
      S.textoC(ctx, px + 8, py + 1, String(v(o, 'dia', '7')), K);
      ret(ctx, px + 5, py - 7, 1, 2, K); ret(ctx, px + 10, py - 7, 1, 2, K);
    } });
  // despertador grande com duas campainhas
  I.objeto('matematica-despertador', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 5;
      circulo(ctx, cx - 5, cy - 7, 2, K); circulo(ctx, cx + 5, cy - 7, 2, K);
      circulo(ctx, cx - 5, cy - 7, 1, CO.amarelo); circulo(ctx, cx + 5, cy - 7, 1, CO.amarelo);
      ret(ctx, cx - 5, cy + 6, 2, 4, K); ret(ctx, cx + 4, cy + 6, 2, 4, K);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, CO.vermelho); circulo(ctx, cx, cy, 4, C.creme);
      ret(ctx, cx - 3, cy - 6, 3, 1, clarear(CO.vermelho, 0.5));
      ret(ctx, cx, cy - 3, 1, 3, K); ret(ctx, cx, cy, 3, 1, K);
    } });
  // ampulheta de madeira com areia
  I.objeto('matematica-ampulheta', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py - 7, 13, 3, K); ret(ctx, cx - 5, py - 6, 11, 1, C.madeiraClara);
      ret(ctx, cx - 6, py + 11, 13, 3, K); ret(ctx, cx - 5, py + 12, 11, 1, C.madeira);
      for (var j = 0; j < 7; j++) {
        var m = 5 - j * 0.7 | 0;
        ret(ctx, cx - m - 1, py - 4 + j, m * 2 + 3, 1, K); ret(ctx, cx - m, py - 4 + j, m * 2 + 1, 1, C.vidro);
        ret(ctx, cx - m - 1, py + 10 - j, m * 2 + 3, 1, K); ret(ctx, cx - m, py + 10 - j, m * 2 + 1, 1, j < 4 ? '#f0c060' : C.vidro);
      }
      ret(ctx, cx - 1, py - 2, 3, 2, '#f0c060'); ret(ctx, cx, py + 2, 1, 5, '#f0c060');
      ret(ctx, cx - 5, py - 4, 1, 14, K); ret(ctx, cx + 5, py - 4, 1, 14, K);
    } });
  // dois dados grandes
  function dado(ctx, x, y, n, c) {
    ret(ctx, x, y, 9, 9, K); ret(ctx, x + 1, y + 1, 7, 7, c); ret(ctx, x + 1, y + 1, 7, 1, C.branco);
    var P = { 1: [[4, 4]], 2: [[2, 2], [6, 6]], 3: [[2, 2], [4, 4], [6, 6]], 4: [[2, 2], [6, 2], [2, 6], [6, 6]],
      5: [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]], 6: [[2, 2], [6, 2], [2, 4], [6, 4], [2, 6], [6, 6]] }[n];
    P.forEach(function (p) { ret(ctx, x + p[0], y + p[1], 1, 1, K); });
  }
  I.objeto('matematica-dados', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var a = v(o, 'faces', [6, 3]);
      dado(ctx, px + 1, py - 2, a[0], C.creme); dado(ctx, px + 6, py + 5, a[1], '#ffe0e8');
    } });
  // roleta de sorte num pé: 4 fatias de cor e a setinha
  I.objeto('matematica-roleta', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 5;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 2, C.metal2);
      ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, C.metal);
      circulo(ctx, cx, cy, 8, K);
      var cores = [CO.vermelho, CO.amarelo, CO.azul, CO.verde];
      for (var j = -7; j <= 7; j++) for (var i = -7; i <= 7; i++) {
        if (i * i + j * j > 49) continue;
        ctx.fillStyle = cores[(i >= 0 ? 0 : 1) + (j >= 0 ? 2 : 0)];
        ctx.fillRect(cx + i, cy + j, 1, 1);
      }
      ret(ctx, cx - 3, cy - 6, 3, 1, C.branco);
      circulo(ctx, cx, cy, 1, K);
      triangulo(ctx, cx - 2, cy - 11, 5, 4, K);
    } });
  // pote de vidro com bolinhas de duas cores (qual sai mais?)
  I.objeto('matematica-urna', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var x = px + 2;
      ret(ctx, x + 2, py - 7, 8, 3, K); ret(ctx, x + 3, py - 6, 6, 1, CO.vermelho);
      ret(ctx, x, py - 4, 12, 18, K); ret(ctx, x + 1, py - 3, 10, 16, C.vidro);
      [[2, 9, 0], [5, 10, 0], [8, 9, 1], [3, 6, 0], [6, 7, 0], [8, 5, 0], [4, 3, 1], [7, 2, 0], [2, 1, 0]].forEach(function (b) {
        ret(ctx, x + b[0], py + b[1], 2, 2, b[2] ? CO.azul : CO.vermelho);
      });
      ret(ctx, x + 1, py - 3, 1, 8, C.branco);
    } });
  // potes de parcelas iguais: 3 potes com 4 balas em cada
  I.objeto('matematica-potes', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', CO.laranja), n = v(o, 'cada', 4);
      mesinha(ctx, px + 1, py + 7, 30);
      for (var p = 0; p < 3; p++) {
        var x = px + 3 + p * 9;
        ret(ctx, x, py - 6, 8, 13, K); ret(ctx, x + 1, py - 5, 6, 11, C.vidro);
        ret(ctx, x + 1, py - 8, 6, 3, K); ret(ctx, x + 2, py - 7, 4, 1, c);
        for (var k = 0; k < n; k++) ret(ctx, x + 1 + (k % 2) * 3, py + 3 - Math.floor(k / 2) * 3, 2, 2, BLOCOS[(p + 1) % BLOCOS.length]);
        ret(ctx, x + 1, py - 5, 1, 5, C.branco);
      }
    } });
  // caixa de ovos aberta: 2 fileiras de 3
  I.objeto('matematica-caixa-ovos', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 4, 14, 10, K); ret(ctx, px + 2, py + 5, 12, 8, '#d9c0a0');
      ret(ctx, px + 1, py - 2, 14, 7, K); ret(ctx, px + 2, py - 1, 12, 5, '#c9ae8a');
      for (var i = 0; i < 6; i++) {
        var x = px + 3 + (i % 3) * 4, y = py + 6 + Math.floor(i / 3) * 3;
        ret(ctx, x, y - 1, 3, 3, K); ret(ctx, x + 1, y - 1, 1, 2, C.creme); ret(ctx, x + 1, y - 1, 1, 1, C.branco);
      }
    } });
  // triciclo: três rodas (o triplo de uma)
  I.objeto('matematica-triciclo', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var c = CO.rosa;
      circulo(ctx, px + 4, py + 11, 3, K); circulo(ctx, px + 4, py + 11, 2, C.metal);
      circulo(ctx, px + 12, py + 11, 3, K); circulo(ctx, px + 12, py + 11, 2, C.metal);
      circulo(ctx, px + 9, py + 5, 4, K); circulo(ctx, px + 9, py + 5, 3, C.metal); circulo(ctx, px + 9, py + 5, 1, K);
      ret(ctx, px + 4, py + 7, 9, 3, K); ret(ctx, px + 5, py + 8, 7, 1, c);
      ret(ctx, px + 3, py - 1, 6, 3, K); ret(ctx, px + 4, py, 4, 1, CO.azul);   // banco
      ret(ctx, px + 5, py + 2, 2, 6, K);
      ret(ctx, px + 9, py - 6, 2, 11, K); ret(ctx, px + 7, py - 7, 7, 2, K); ret(ctx, px + 8, py - 7, 1, 1, c); ret(ctx, px + 12, py - 7, 1, 1, c);
    } });
  // dominó grande em pé: 3 | 3 (o dobro de 3)
  I.objeto('matematica-domino', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var x = px + 3, y = py - 11, a = v(o, 'pontos', [3, 3]);
      ret(ctx, x, y, 10, 26, K); ret(ctx, x + 1, y + 1, 8, 24, C.creme); ret(ctx, x + 1, y + 1, 8, 1, C.branco);
      ret(ctx, x + 1, y + 12, 8, 1, K);
      [a[0], a[1]].forEach(function (n, m) {
        var yy = y + 2 + m * 12, P = { 1: [[3, 4]], 2: [[1, 1], [5, 7]], 3: [[1, 1], [3, 4], [5, 7]], 4: [[1, 1], [5, 1], [1, 7], [5, 7]] }[n];
        P.forEach(function (p) { ret(ctx, x + 1 + p[0], yy + p[1], 2, 2, m ? CO.azul : CO.vermelho); });
      });
      ret(ctx, x - 1, py + 13, 12, 2, K);
    } });
  // cavalete baixo com as cartas da tabuada (var.tab)
  I.objeto('matematica-cartas', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var n = v(o, 'tab', 5);
      ret(ctx, px + 3, py + 4, 2, 11, K); ret(ctx, px + 11, py + 4, 2, 11, K); ret(ctx, px + 7, py + 2, 2, 12, K);
      ret(ctx, px + 1, py + 6, 14, 3, K); ret(ctx, px + 2, py + 7, 12, 1, C.madeira);
      ret(ctx, px + 1, py - 11, 14, 17, K); ret(ctx, px + 2, py - 10, 12, 15, C.branco);
      ret(ctx, px + 2, py - 10, 12, 3, n === 4 ? CO.verde : CO.laranja);
      S.textoC(ctx, px + 8, py - 6, n + 'x', K);
      S.textoC(ctx, px + 8, py, String(n * 2), CO.azul);
    } });
  // balança de dois pratos, com um bloco de cada lado (iguais)
  I.objeto('matematica-balanca', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 2, C.ouro2);
      ret(ctx, cx - 1, py - 4, 3, 17, K); ret(ctx, cx, py - 3, 1, 15, C.ouro);
      ret(ctx, cx - 7, py - 5, 15, 2, K); ret(ctx, cx - 6, py - 5, 13, 1, C.ouro);
      [-6, 6].forEach(function (d) {
        ret(ctx, cx + d, py - 3, 1, 5, K);
        elipse(ctx, cx + d, py + 3, 3, 1, K); ret(ctx, cx + d - 2, py + 3, 5, 1, C.ouro2);
        ret(ctx, cx + d - 1, py - 1, 3, 3, K); ret(ctx, cx + d, py, 1, 1, d < 0 ? CO.vermelho : CO.azul);
      });
      circulo(ctx, cx, py - 5, 1, K);
    } });
})();
