/* Casa das Palavras, parte 2 de 6: os objetos da Horta do H e do Pátio do Circo.
   Usa portugues/objetos-hall-cozinha.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.portugues;
  var VERM = S.VERM, VERM2 = S.VERM2, VERDE = S.VERDE, VERDE2 = S.VERDE2, VERDE3 = S.VERDE3, BANANA = S.BANANA,
      LARANJA = S.LARANJA, KIWI = S.KIWI, TERRA = S.TERRA, TERRA2 = S.TERRA2, FOLHA = S.FOLHA, FOLHA2 = S.FOLHA2,
      v = S.v, letra = S.letra, palavra = S.palavra, toco = S.toco;

  /* ================= HORTA DO H ================= */
  I.objeto('portugues-canteiro', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, planta = v(o, 'planta', 'alface');
      if (v(o, 'chao', false)) {
        // canteiro direto no chão: montinho de terra fofa com a bordinha de pedras
        ret(ctx, px + 1, py + 4, W - 2, 11, K); ret(ctx, px + 2, py + 5, W - 4, 9, TERRA); ret(ctx, px + 2, py + 5, W - 4, 1, '#a8744a');
        for (var r = py + 8; r < py + 14; r += 3) for (var q = px + 3 + (r % 2) * 2; q < px + W - 3; q += 4) ret(ctx, q, r, 2, 1, TERRA2);
        for (var pd = px + 1; pd < px + W - 2; pd += 4) { ret(ctx, pd, py + 13, 3, 2, '#b8b0a8'); ret(ctx, pd, py + 13, 3, 1, '#e0dad2'); }
      } else {
        ret(ctx, px + 1, py + 3, W - 2, 12, K); ret(ctx, px + 2, py + 4, W - 4, 10, C.madeira); ret(ctx, px + 2, py + 4, W - 4, 1, C.madeiraClara);
        ret(ctx, px + 3, py + 5, W - 6, 4, TERRA); for (var t = px + 4; t < px + W - 4; t += 4) ret(ctx, t, py + 6, 1, 1, TERRA2);
      }
      for (var x = px + 6; x < px + W - 4; x += 8) {
        if (planta === 'alface') { elipse(ctx, x, py + 3, 3, 3, K); elipse(ctx, x, py + 3, 2, 2, KIWI); ret(ctx, x, py + 2, 1, 2, FOLHA2); }
        else if (planta === 'cenoura') { ret(ctx, x - 1, py + 5, 3, 2, LARANJA); ret(ctx, x, py - 1, 1, 6, FOLHA); ret(ctx, x - 2, py, 1, 4, FOLHA2); ret(ctx, x + 2, py, 1, 4, FOLHA2); }
        else if (planta === 'tomate') {
          // tutor de madeira, galhinho com folhas e tomates redondos com o cabinho verde em estrela
          ret(ctx, x + 3, py - 9, 1, 14, C.madeira2);
          ret(ctx, x, py - 8, 1, 13, FOLHA2); ret(ctx, x - 3, py - 6, 3, 2, FOLHA); ret(ctx, x + 1, py - 3, 3, 2, FOLHA); ret(ctx, x - 3, py + 1, 3, 1, FOLHA);
          [[-2, -1], [2, -6]].forEach(function (tm) {
            var tx = x + tm[0], ty = py + tm[1];
            circulo(ctx, tx, ty, 3, K); circulo(ctx, tx, ty, 2, '#ff3b3b'); ret(ctx, tx - 1, ty - 1, 1, 1, '#ffb0a0'); ret(ctx, tx + 1, ty + 1, 1, 1, '#c81e2e');
            ret(ctx, tx - 1, ty - 3, 3, 1, '#2f8a3a'); ret(ctx, tx, ty - 4, 1, 1, '#2f8a3a');
          });
        } else { // hortelã
          [[-2, 2], [0, 0], [2, 2], [-1, -2], [1, -3]].forEach(function (f) { ret(ctx, x + f[0], py + f[1] + 1, 2, 2, K); ret(ctx, x + f[0], py + f[1] + 1, 1, 1, '#7fe08a'); });
        }
      }
    } });
  // leira de terra arada, pintada no chão da horta (dá para pisar), com brotinhos ou repolhinhos
  I.objeto('portugues-leira', { w: 3, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 1) * 16, tipo = v(o, 'planta', 'broto');
      ret(ctx, px + 2, py + 2, W - 4, H - 3, '#7a4e30'); ret(ctx, px + 3, py + 1, W - 6, H - 1, '#7a4e30');
      ret(ctx, px + 3, py + 3, W - 6, H - 6, TERRA);
      for (var r = py + 5; r < py + H - 3; r += 4) { ret(ctx, px + 4, r, W - 8, 1, TERRA2); ret(ctx, px + 4, r + 1, W - 8, 1, '#a8744a'); }
      for (var x = px + 7; x < px + W - 5; x += 8) for (var y = py + 4; y < py + H - 4; y += 8) {
        if (tipo === 'repolho') { circulo(ctx, x, y + 1, 2, '#3f9a45'); ret(ctx, x - 1, y, 2, 2, '#9fe08a'); }
        else { ret(ctx, x, y, 1, 3, '#3f9a45'); ret(ctx, x - 2, y, 2, 1, '#6fdc8c'); ret(ctx, x + 1, y - 1, 2, 1, '#6fdc8c'); }
      }
    } });
  I.objeto('portugues-hortela', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // moita de hortelã: folhas redondinhas e serrilhadas, com as nervuras claras
      var folhas = [[-5, -1], [5, -1], [-3, -5], [3, -5], [0, -8], [-6, -5], [6, -5], [0, -2], [-3, 1], [3, 1]];
      folhas.forEach(function (f) { elipse(ctx, cx + f[0], py + f[1], 3, 2, K); });
      folhas.forEach(function (f, i) {
        var x = cx + f[0], y = py + f[1];
        elipse(ctx, x, y, 2, 1, i % 2 ? '#4fbf6a' : '#6fdc8c'); ret(ctx, x - 1, y, 3, 1, '#b8f0c0'); ret(ctx, x - 2, y - 1, 1, 1, '#2f8a45');
      });
      // vaso de barro com a plaquinha "H"
      ret(ctx, cx - 6, py + 2, 13, 3, K); ret(ctx, cx - 5, py + 3, 11, 1, C.terracota2);
      ret(ctx, cx - 5, py + 4, 11, 11, K); ret(ctx, cx - 4, py + 5, 9, 9, C.terracota); ret(ctx, cx - 4, py + 5, 2, 9, '#f09a6a');
      ret(ctx, cx - 3, py + 7, 7, 7, K); ret(ctx, cx - 2, py + 8, 5, 5, C.creme); letra(ctx, 'H', cx - 1, py + 8, VERDE2);
    } });
  I.objeto('portugues-hibisco', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // vaso de barro
      ret(ctx, cx - 5, py + 5, 11, 10, K); ret(ctx, cx - 4, py + 6, 9, 8, '#e8b27a'); ret(ctx, cx - 4, py + 6, 9, 1, '#ffd9a8'); ret(ctx, cx - 4, py + 6, 2, 8, '#f3c898');
      // folhagem com folhas pontudas
      circulo(ctx, cx, py - 4, 9, K); circulo(ctx, cx, py - 4, 8, FOLHA2);
      circulo(ctx, cx + 3, py - 7, 4, FOLHA); circulo(ctx, cx - 5, py - 1, 3, FOLHA); circulo(ctx, cx + 4, py + 1, 3, '#4ea84e');
      [[-8, -8], [8, -4], [-9, 1], [7, 3]].forEach(function (f) { ret(ctx, cx + f[0], py + f[1], 2, 1, FOLHA2); ret(ctx, cx + f[0], py + f[1] - 1, 1, 1, K); });
      // um botão fechado e duas flores grandes de hibisco: 5 pétalas, o fundinho escuro e o miolo amarelo comprido
      ret(ctx, cx + 5, py - 11, 3, 4, K); ret(ctx, cx + 6, py - 10, 1, 2, '#ff3b5c'); ret(ctx, cx + 6, py - 8, 1, 2, FOLHA);
      var PET = [[0, -3], [3, -1], [2, 3], [-2, 3], [-3, -1]], FLORES = [[-3, -7, 1], [4, 0, -1]];
      FLORES.forEach(function (f) { PET.forEach(function (p) { circulo(ctx, cx + f[0] + p[0], py + f[1] + p[1], 2, K); }); });
      FLORES.forEach(function (f) { flor(cx + f[0], py + f[1], f[2]); });
      function flor(x, y, lado) {
        PET.forEach(function (p) { circulo(ctx, x + p[0], y + p[1], 1, '#ff3b5c'); ret(ctx, x + p[0] + (p[0] > 0 ? 1 : -1), y + p[1] + (p[1] > 0 ? 1 : -1), 1, 1, '#ff3b5c'); });
        PET.forEach(function (p) { ret(ctx, x + Math.round(p[0] * 1.3), y + Math.round(p[1] * 1.3), 1, 1, '#ff8aa0'); });
        ret(ctx, x - 1, y - 1, 3, 3, '#e0203f'); ret(ctx, x, y, 1, 1, '#8a0a26');
        // miolo comprido saindo para o lado, com as pontinhas de pólen
        for (var i = 1; i <= 4; i++) ret(ctx, x + lado * i, y - i, 1, 1, BANANA);
        ret(ctx, x + lado * 5, y - 5, 1, 1, '#ff9d2e'); ret(ctx, x + lado * 4, y - 5, 1, 1, '#ff9d2e'); ret(ctx, x + lado * 5, y - 4, 1, 1, '#ff9d2e');
      }
    } });
  I.objeto('portugues-placa-horta', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 2, 3, 17, K); ret(ctx, cx, py - 2, 1, 16, C.madeira);
      ret(ctx, px - 4, py - 11, 24, 11, K); ret(ctx, px - 3, py - 10, 22, 9, C.madeiraClara); ret(ctx, px - 3, py - 10, 22, 1, '#ffe0b8');
      palavra(ctx, 'ORTA', px + 3, py - 8, VERDE2);
      letra(ctx, 'H', px - 1, py - 8, VERM);   // o H em destaque (a letra que não tem som)
      elipse(ctx, cx, py + 14, 4, 1, FOLHA2);
    } });
  I.objeto('portugues-helicoptero', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      toco(ctx, cx, py, py - 1);
      // helicóptero de brinquedo
      ret(ctx, cx - 5, py - 9, 9, 7, K); ret(ctx, cx - 4, py - 8, 7, 5, '#ff9d2e'); ret(ctx, cx - 3, py - 7, 3, 2, '#bfe9ff');
      ret(ctx, cx + 3, py - 7, 6, 3, K); ret(ctx, cx + 4, py - 6, 4, 1, '#ff9d2e'); ret(ctx, cx + 8, py - 9, 2, 5, K);
      ret(ctx, cx - 5, py - 2, 9, 1, K); ret(ctx, cx - 3, py - 3, 1, 1, K); ret(ctx, cx + 1, py - 3, 1, 1, K);
      ret(ctx, cx - 1, py - 11, 1, 2, K);
      letra(ctx, 'H', cx - 4, py - 16, VERM);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, f = Math.floor(t / 90) % 2;
      ret(ctx, cx - 7 + f * 2, py - 12, 14 - f * 4, 1, K);
    } });
  I.objeto('portugues-regador', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 5, 8, 9, K); ret(ctx, px + 4, py + 6, 6, 7, '#5fb4ff'); ret(ctx, px + 4, py + 6, 1, 7, '#9fdcff');
      for (var i = 0; i < 4; i++) ret(ctx, px + 10 + i, py + 8 - i, 1, 2, K);
      ret(ctx, px + 13, py + 3, 3, 2, K); ret(ctx, px + 14, py + 3, 1, 1, C.metal);
      ret(ctx, px + 5, py + 2, 5, 1, K); ret(ctx, px + 4, py + 3, 1, 3, K); ret(ctx, px + 10, py + 3, 1, 3, K);
    } });
  I.objeto('portugues-carrinho', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 12, 8, K); ret(ctx, px + 2, py + 3, 10, 6, VERDE); ret(ctx, px + 2, py + 3, 10, 1, VERDE3);
      ret(ctx, px + 3, py + 1, 8, 2, TERRA); elipse(ctx, px + 7, py + 1, 4, 2, TERRA2);
      circulo(ctx, px + 4, py + 12, 2, K); circulo(ctx, px + 4, py + 12, 1, C.metal2);
      ret(ctx, px + 12, py + 6, 4, 1, K); ret(ctx, px + 11, py + 10, 1, 5, K);
      ret(ctx, px + 5, py - 2, 1, 4, FOLHA2); ret(ctx, px + 4, py - 2, 3, 1, FOLHA);
    } });
  I.objeto('portugues-cartaz-h', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      // cartaz do H: o hotel ou o helicóptero, com o H bem grande
      var qual = v(o, 'figura', 'hotel');
      contornoRet(ctx, px + 1, py + 5, 14, 21, C.creme);
      ret(ctx, px + 2, py + 6, 12, 7, '#bfe9ff');
      if (qual === 'hotel') {
        ret(ctx, px + 4, py + 7, 8, 6, K); ret(ctx, px + 5, py + 8, 6, 5, '#ffd1e6');
        ret(ctx, px + 6, py + 9, 1, 1, '#5fb4ff'); ret(ctx, px + 9, py + 9, 1, 1, '#5fb4ff'); ret(ctx, px + 7, py + 11, 2, 2, C.madeira2);
      } else {
        ret(ctx, px + 5, py + 9, 6, 3, K); ret(ctx, px + 6, py + 10, 4, 1, '#ff9d2e'); ret(ctx, px + 10, py + 10, 3, 1, K); ret(ctx, px + 3, py + 8, 10, 1, K);
      }
      // o H bem grande (letra de 2 px)
      ret(ctx, px + 5, py + 15, 2, 9, VERM); ret(ctx, px + 9, py + 15, 2, 9, VERM); ret(ctx, px + 7, py + 18, 2, 2, VERM);
    } });
  I.objeto('portugues-espantalho', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 8, 3, 23, K); ret(ctx, cx, py - 8, 1, 22, C.madeira);
      ret(ctx, cx - 8, py - 7, 17, 3, K); ret(ctx, cx - 7, py - 6, 15, 1, C.madeira);
      ret(ctx, cx - 4, py - 8, 9, 10, K); ret(ctx, cx - 3, py - 7, 7, 8, '#e0433f');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 3 + i * 3, py - 7, 1, 8, '#ffd34d');
      ret(ctx, cx - 7, py - 5, 2, 3, '#f5d77a'); ret(ctx, cx + 6, py - 5, 2, 3, '#f5d77a');
      circulo(ctx, cx, py - 13, 4, K); circulo(ctx, cx, py - 13, 3, '#f3d9a8');
      ret(ctx, cx - 2, py - 14, 1, 1, K); ret(ctx, cx + 2, py - 14, 1, 1, K); ret(ctx, cx - 1, py - 11, 3, 1, VERM2);
      ret(ctx, cx - 6, py - 17, 13, 2, K); ret(ctx, cx - 5, py - 17, 11, 1, '#f2cf6b'); ret(ctx, cx - 3, py - 21, 7, 4, K); ret(ctx, cx - 2, py - 20, 5, 3, '#f2cf6b');
      ret(ctx, cx - 2, py - 18, 5, 1, VERM);
    } });

  /* ================= PÁTIO DO CIRCO ================= */
  // amarelinha pintada no chão: 7 casas com a inicial de cada dia da semana e o céu no fim
  I.objeto('portugues-amarelinha', { w: 2, h: 5, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, giz = '#fdfbff', cores = ['#ffd34d', '#ff9cc6', '#9fdcff', '#9fe0a0', '#c9a8ff', '#ffb070', '#ff9cc6'];
      // de baixo para cima: D | S T | Q | Q S | S | céu
      var casas = [
        [[0, 'D']], [[-1, 'S'], [1, 'T']], [[0, 'Q']], [[-1, 'Q'], [1, 'S']], [[0, 'S']],
      ];
      var h = 12, base = py + 78, n = 0;
      casas.forEach(function (linha, j) {
        var y = base - (j + 1) * h;
        linha.forEach(function (c) {
          var x = c[0] === 0 ? cx - 6 : c[0] < 0 ? cx - 12 : cx;
          ret(ctx, x, y, 12, h + 1, giz); ret(ctx, x + 1, y + 1, 10, h - 1, cores[n % cores.length]);
          ret(ctx, x + 1, y + 1, 10, 1, clarear(cores[n % cores.length], 0.4));
          letra(ctx, c[1], x + 5 - 1, y + 4, K);
          n++;
        });
      });
      // céu (meia-lua no topo)
      var yc = base - 5 * h;
      for (var j = 0; j < 12; j++) {
        var m = Math.round(Math.sqrt(Math.max(0, 144 - (12 - j) * (12 - j))));
        ret(ctx, cx - m, yc - 12 + j, m * 2, 1, giz);
        if (m > 1) ret(ctx, cx - m + 1, yc - 12 + j, m * 2 - 2, 1, '#bfe9ff');
      }
      ret(ctx, cx - 1, yc - 8, 3, 3, C.ouro); ret(ctx, cx, yc - 9, 1, 5, C.ouro); ret(ctx, cx - 2, yc - 7, 5, 1, C.ouro);
      // pedrinha e giz
      ret(ctx, cx + 9, base - 6, 3, 2, '#8a8aa0'); ret(ctx, cx - 14, base - 4, 4, 2, giz);
    } });
  // chocalho em pé no seu suporte: cabeça redonda listrada, anel dourado e cabo curto de madeira
  I.objeto('portugues-chocalho', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 8;
      // suporte: banquinho roxo acolchoado com a franja dourada e a estrelinha na frente
      ret(ctx, cx - 6, py + 14, 13, 1, 'rgba(58,36,70,0.25)');
      ret(ctx, cx - 6, py + 7, 13, 8, K); ret(ctx, cx - 5, py + 8, 11, 6, '#7c5cff');
      ret(ctx, cx - 5, py + 8, 11, 1, '#a88cff'); ret(ctx, cx - 5, py + 8, 1, 6, '#a88cff'); ret(ctx, cx + 4, py + 9, 1, 5, '#5a3fd0');
      for (var f = cx - 5; f <= cx + 5; f += 2) ret(ctx, f, py + 13, 1, 1, C.ouro);
      ret(ctx, cx, py + 9, 1, 3, C.ouro); ret(ctx, cx - 1, py + 10, 3, 1, C.ouro);
      // cabo curto de madeira, encaixado no suporte
      ret(ctx, cx - 2, py - 2, 5, 10, K); ret(ctx, cx - 1, py - 1, 3, 8, C.madeira); ret(ctx, cx - 1, py - 1, 1, 8, C.madeiraClara);
      ret(ctx, cx + 1, py + 2, 1, 1, C.madeira2); ret(ctx, cx + 1, py + 5, 1, 1, C.madeira2);
      ret(ctx, cx - 3, py + 7, 7, 1, K);
      // cabeça redonda com as listras (laranja, vermelha, amarela e azul), sombra embaixo à direita
      for (var dy = -7; dy <= 7; dy++) for (var dx = -7; dx <= 7; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 6.6) continue;
        var cor = K;
        if (d <= 5.6) {
          var faixa = dy + dx * dx * 0.06;
          cor = faixa < -3 ? '#ff9d2e' : faixa < -1.2 ? VERM : faixa < 0.8 ? '#ffe066' : faixa < 2.8 ? '#5fb4ff' : '#ff9d2e';
          if (dx + dy > 4.5 && d > 3.5) cor = escurecer(cor, 0.2);
        }
        ret(ctx, cx + dx, cy + dy, 1, 1, cor);
      }
      ret(ctx, cx - 3, cy - 4, 2, 1, C.branco); ret(ctx, cx - 4, cy - 3, 1, 2, C.branco);
      // anel dourado entre a cabeça e o cabo
      ret(ctx, cx - 3, py - 3, 7, 2, K); ret(ctx, cx - 2, py - 3, 5, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      // chique-chique: risquinhos de som dos dois lados da cabeça
      var f = Math.floor(t / 180) % 6, cx = px + 8, cy = py - 8;
      if (f < 2) { ret(ctx, cx + 8, cy - 4 - f, 1, 2, K); ret(ctx, cx - 9, cy - 4 - f, 1, 2, K); ret(ctx, cx + 6, cy - 8 + f, 2, 1, K); ret(ctx, cx - 7, cy - 8 + f, 2, 1, K); }
    } });
  I.objeto('portugues-lona', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, c = v(o, 'cor', VERM);
      // cortina de circo listrada, aberta para os lados, com a estrela no meio
      ret(ctx, px, py + 3, W, 3, K); ret(ctx, px + 1, py + 4, W - 2, 1, C.ouro);
      for (var x = 1; x < W - 1; x++) {
        var lado = x < W / 2 ? x : W - 1 - x, alt = 26 - Math.round(lado * 0.2);
        ret(ctx, px + x, py + 6, 1, Math.min(26, 8 + lado), (Math.floor(x / 3) % 2) ? C.branco : c);
      }
      ret(ctx, px + W / 2 - 5, py + 16, 10, 16, '#5a3a7a');
      ret(ctx, px + W / 2 - 2, py + 20, 5, 5, C.ouro); ret(ctx, px + W / 2, py + 18, 1, 9, C.ouro); ret(ctx, px + W / 2 - 4, py + 22, 9, 1, C.ouro);
      for (var b = 0; b < W; b += 4) { triangulo(ctx, px + b, py + 6, 4, 3, b % 8 ? C.ouro : c); }
    } });
  // ninho de palha em cima de um arbusto, com três ovinhos pintados
  I.objeto('portugues-ninho', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // arbusto redondo com folhas e duas florzinhas
      circulo(ctx, cx, py + 6, 8, K); circulo(ctx, cx, py + 6, 7, FOLHA2);
      circulo(ctx, cx - 3, py + 4, 4, FOLHA); circulo(ctx, cx + 4, py + 7, 3, FOLHA); circulo(ctx, cx - 1, py + 10, 3, '#4ea84e');
      [[-5, 2], [-1, 6], [3, 3], [5, 9], [-4, 10], [1, 12]].forEach(function (p) { ret(ctx, cx + p[0], py + p[1], 2, 1, '#8fe08a'); });
      ret(ctx, cx - 6, py + 8, 2, 2, '#ff9cc6'); ret(ctx, cx + 5, py + 4, 2, 2, C.branco);
      ret(ctx, cx - 7, py + 13, 15, 2, K);
      // ninho de palha marrom: a tigela, o fundo escuro por dentro e os três ovinhos sentados nele
      var PALHA = '#b07838', PALHA2 = '#7a4a22', PALHA3 = '#e0a858';
      elipse(ctx, cx, py, 9, 4, K); elipse(ctx, cx, py, 8, 3, PALHA);
      elipse(ctx, cx, py - 2, 7, 1, '#4a2c18');
      ovoPintado(ctx, cx - 3, py - 11, '#ffd0e2', '#e07aa6');  // rosa clarinho (no meio, mais alto: fica atrás)
      ovoPintado(ctx, cx - 8, py - 9, '#fff2d0', '#c89a5a');   // creme
      ovoPintado(ctx, cx + 2, py - 9, '#cdeeff', '#5f9fd0');   // azul clarinho
      // a beirada da frente do ninho, trançada, por cima da base dos ovos
      ret(ctx, cx - 8, py - 2, 17, 4, K); ret(ctx, cx - 9, py - 1, 19, 2, K);
      ret(ctx, cx - 7, py - 1, 15, 2, PALHA); ret(ctx, cx - 8, py, 17, 1, PALHA);
      for (var i = -7; i <= 7; i += 3) { ret(ctx, cx + i, py - 1, 2, 1, PALHA3); ret(ctx, cx + i + 1, py, 2, 1, PALHA2); }
      for (var k = -6; k <= 6; k += 4) ret(ctx, cx + k, py + 2, 2, 1, PALHA2);
      // fiapos de palha escapando
      ret(ctx, cx - 10, py - 2, 1, 1, PALHA2); ret(ctx, cx - 9, py - 3, 1, 1, PALHA);
      ret(ctx, cx + 9, py - 3, 1, 1, PALHA2); ret(ctx, cx + 8, py - 3, 1, 1, PALHA); ret(ctx, cx + 7, py + 3, 2, 1, PALHA2);
    } });
  // ovinho oval (6×8; a base fica atrás da beirada do ninho) com pintinhas
  var OVO = ['..kk..', '.kwck.', 'kwccck', 'kccpck', 'kpccck', 'kcccpk', 'kcccck', '.kkkk.'];
  function ovoPintado(ctx, x, y, cor, pinta) { D.matriz(ctx, x, y, OVO, { k: K, c: cor, w: C.branco, p: pinta }); }
  I.objeto('portugues-pipoca', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // carrinho de pipoca: rodas, balcão listrado, vitrine cheia e o toldo
      circulo(ctx, cx - 4, py + 12, 3, K); circulo(ctx, cx - 4, py + 12, 2, C.metal2);
      circulo(ctx, cx + 5, py + 12, 3, K); circulo(ctx, cx + 5, py + 12, 2, C.metal2);
      ret(ctx, cx - 7, py - 1, 15, 11, K); ret(ctx, cx - 6, py, 13, 9, VERM);
      for (var i = 0; i < 4; i++) ret(ctx, cx - 5 + i * 4, py, 2, 9, C.branco);
      ret(ctx, cx - 7, py - 12, 15, 12, K); ret(ctx, cx - 6, py - 11, 13, 10, '#eaf8ff');
      for (var j = 0; j < 12; j++) { var x = cx - 5 + (j * 5) % 11, y = py - 6 + Math.floor(j / 4) * 2; ret(ctx, x, y, 2, 2, j % 3 ? C.branco : '#fff3a0'); }
      ret(ctx, cx - 6, py - 11, 1, 5, C.branco);
      ret(ctx, cx - 9, py - 17, 19, 5, K);
      for (var t = 0; t < 17; t += 4) ret(ctx, cx - 8 + t, py - 16, 2, 3, VERM);
      ret(ctx, cx - 8, py - 16, 17, 1, C.ouro3);
      ret(ctx, cx - 1, py - 20, 3, 3, K); ret(ctx, cx, py - 19, 1, 1, C.ouro);
      // espigas de milho de enfeite
      ret(ctx, cx + 6, py + 1, 3, 6, K); ret(ctx, cx + 7, py + 2, 1, 4, BANANA);
    } });
  I.objeto('portugues-bola-circo', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 7;
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, '#5fb4ff');
      ret(ctx, cx - 6, cy - 1, 13, 3, VERM); ret(ctx, cx - 1, cy - 6, 3, 13, C.ouro);
      circulo(ctx, cx, cy, 2, C.branco); ret(ctx, cx - 4, cy - 4, 2, 2, '#bfe9ff');
    } });
  I.objeto('portugues-banquinho', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      // banquinho redondo de circo: tambor com zigue-zague dourado e o tampo de estrela
      var cx = px + 8, c = v(o, 'cor', '#7c5cff'), cl = clarear(c, 0.35);
      ret(ctx, cx - 6, py, 13, 13, K); ret(ctx, cx - 5, py, 11, 12, c); ret(ctx, cx - 5, py, 2, 12, cl);
      elipse(ctx, cx, py + 13, 6, 2, K); elipse(ctx, cx, py + 13, 5, 1, escurecer(c, 0.2));
      for (var i = 0; i < 11; i++) ret(ctx, cx - 5 + i, py + 5 + (i % 4 < 2 ? i % 2 : 1 - i % 2) * 2, 1, 2, C.ouro);
      elipse(ctx, cx, py, 6, 3, K); elipse(ctx, cx, py, 5, 2, C.ouro3); elipse(ctx, cx, py, 3, 1, C.ouro);
      ret(ctx, cx, py - 1, 1, 3, '#ff9d2e'); ret(ctx, cx - 1, py, 3, 1, '#ff9d2e');
    } });

})();
