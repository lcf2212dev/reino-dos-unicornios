/* Desenho da fachada de cada prédio no mapa: Mapa.PREDIOS[sprite](ctx, px, py, w, h, cores),
   em px do jogo (o retângulo do lugar; o telhado pode passar um pouco para cima). Mapa.prerender
   desenha cada lugar com o sprite dele (sem desenho: a torre). Aqui: castelo, museu, estábulo e baú; loja em mundo/predios-3.js; escola, relógio e torre em mundo/predios-2.js. Prédio novo = uma função aqui (ou no arquivo
   do prédio, como a Pet Shop e o Observatório) + a entrada em mundo/lugares.js. Os enfeites comuns
   (janela, telhas, tijolos, porta...) vêm de Mapa.fachada (mundo/fachadas.js). A porta fica sempre
   no meio da última linha (largura par: o desenho anda F.desvio) e é F.entrada (degrau + porta, F.PORTA).
   Brilhos animados: Mapa.PREDIOS_ANIM (só com Animações ligado). */
(function () {
  var Mapa = window.Mapa, F = Mapa.fachada, D = window.Reino.Desenho;
  var C = D.C, K = D.K, ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var contornoRet = D.contornoRet;

  var PREDIOS = {
    castelo: function (ctx, px, py, w, h) {
      var parede = '#fff1d0', paredeT = '#ffe4b8', telhado = '#f0a04a', roxo = '#8a5cff';
      var cx = px + w / 2;
      // torre de menagem no meio, atrás da muralha, com o telhado de telhas e a bandeira roxa
      contornoRet(ctx, cx - 16, py + 10, 32, 22, paredeT);
      F.pedras(ctx, cx - 15, py + 11, 30, 20, paredeT);
      ret(ctx, cx + 8, py + 11, 7, 20, 'rgba(160,110,60,0.14)');
      F.beiral(ctx, cx - 15, py + 12, 30, 3);
      triangulo(ctx, cx - 19, py - 2, 38, 13, K);
      triangulo(ctx, cx - 16, py + 1, 32, 9, telhado);
      F.telhas(ctx, cx - 16, py + 1, 32, 9, telhado, 3);
      ret(ctx, cx - 19, py + 9, 38, 3, K); ret(ctx, cx - 18, py + 10, 36, 1, '#d9842f');
      F.bandeira(ctx, cx, py - 7, 6, roxo);
      F.janela(ctx, cx - 4, py + 14, 8, 10, { arco: true, cruz: false });
      // muralha central de pedra, com as ameias
      contornoRet(ctx, px + 20, py + 30, w - 40, h - 30, parede);
      F.pedras(ctx, px + 21, py + 31, w - 42, h - 32, parede);
      for (var k = px + 20; k < px + w - 20; k += 8) {
        ret(ctx, k, py + 25, 6, 6, K); ret(ctx, k + 1, py + 26, 4, 5, parede); ret(ctx, k + 1, py + 26, 4, 1, '#fffaf0');
        ret(ctx, k + 1, py + 27, 1, 4, '#fffaf0'); ret(ctx, k + 4, py + 27, 1, 4, '#ecd6b0');
      }
      ret(ctx, px + 21, py + 31, w - 42, 1, '#ecd6b0'); ret(ctx, px + 21, py + 32, w - 42, 1, 'rgba(58,36,70,0.12)');
      F.fundacao(ctx, px + 21, py + h - 6, w - 42, 6, '#c4ad8a');
      F.volume(ctx, cx - 15, py + 11, 30, 20);
      // estandartes com o brasão dos dois lados do portão
      [px + 35, px + w - 35].forEach(function (bx) {
        ret(ctx, bx - 5, py + 34, 11, 2, K); ret(ctx, bx - 4, py + 34, 9, 1, C.ouro);
        F.brasao(ctx, bx, py + 36, roxo, '#ff8a3d');
      });
      // torres com telhado cônico de telhas, bandeirola, janela de arco e seteira
      [px + 2, px + w - 28].forEach(function (tx) {
        contornoRet(ctx, tx, py + 22, 26, h - 22, paredeT);
        F.pedras(ctx, tx + 1, py + 23, 24, h - 24, paredeT);
        ret(ctx, tx + 17, py + 23, 8, h - 29, 'rgba(160,110,60,0.2)'); ret(ctx, tx + 22, py + 23, 3, h - 29, 'rgba(120,70,40,0.15)');
        ret(ctx, tx + 2, py + 23, 2, h - 29, 'rgba(255,255,255,0.3)');
        ret(ctx, tx + 1, py + 23, 1, h - 24, '#fffaf0');
        F.fundacao(ctx, tx + 1, py + h - 6, 24, 6, '#c4ad8a');
        F.beiral(ctx, tx + 1, py + 24, 24, 3);
        // musgo nas juntas, fixo por posição
        for (var mz = 0; mz < 5; mz++) { var mx = tx + 3 + Math.floor(D.sorte(tx, mz, 31) * 19), my = py + 34 + Math.floor(D.sorte(mz, tx, 37) * 20); ret(ctx, mx, my, 2, 1, '#9cc25a'); ret(ctx, mx, my + 1, 1, 1, '#6fa040'); }
        triangulo(ctx, tx - 3, py + 2, 32, 22, K);
        triangulo(ctx, tx - 1, py + 4, 28, 19, telhado);
        F.telhas(ctx, tx - 1, py + 4, 28, 19, telhado, 4);
        ret(ctx, tx - 3, py + 21, 32, 3, K); ret(ctx, tx - 2, py + 22, 30, 1, '#d9842f');
        F.bandeira(ctx, tx + 12, py - 7, 10, '#ff8a3d');
        F.janela(ctx, tx + 8, py + 31, 10, 14, { arco: true, luz: tx === px + 2 ? null : '#ffe9a8' });
        ret(ctx, tx + 12, py + 53, 2, 9, K); ret(ctx, tx + 11, py + 56, 4, 2, K);
        F.tufos(ctx, [tx + 3, tx + 19], py + h - 1);
        // estandarte comprido pendurado na torre
        var ex = tx === px + 2 ? tx + 3 : tx + 19;
        ret(ctx, ex - 1, py + 47, 6, 1, K); ret(ctx, ex - 1, py + 48, 6, 9, K); ret(ctx, ex, py + 48, 4, 8, roxo); ret(ctx, ex, py + 48, 1, 8, '#b49aff');
        ret(ctx, ex + 1, py + 51, 2, 2, C.ouro); ret(ctx, ex, py + 57, 1, 1, K); ret(ctx, ex + 3, py + 57, 1, 1, K); ret(ctx, ex + 1, py + 56, 2, 2, K); ret(ctx, ex + 1, py + 56, 2, 1, roxo);
      });
      F.trepadeira(ctx, px + 29, py + h - 6, 18, '#ff7eb6');
      F.trepadeira(ctx, px + w - 30, py + h - 6, 14, '#ffe066');
      // portão com o arco de pedra e a porta roxa
      elipse(ctx, cx, py + h - 25, 14, 6, K); elipse(ctx, cx, py + h - 25, 13, 5, '#f0d0a0');
      ret(ctx, cx - 14, py + h - 25, 28, 25, K); ret(ctx, cx - 13, py + h - 25, 26, 25, '#f0d0a0');
      for (var a = -12; a <= 10; a += 4) ret(ctx, cx + a, py + h - 29 + Math.round(Math.abs(a) / 3), 2, 1, '#d9b88a');
      F.entrada(ctx, cx, py + h, roxo, null, { larg: 20, alto: 23, largDegrau: 26 });
      // fita da medalha: o disco dourado cobre o meio
      var yFita = py + 28, yFim = py + h - 29, comp = yFim - yFita + 1;
      ret(ctx, cx - 6, py + 26, 10, 2, '#ffd34d');
      ret(ctx, cx - 6, py + 26, 10, 1, '#fff3a0');
      ret(ctx, cx - 4, yFita, 3, comp, '#ff8a3d');
      ret(ctx, cx - 4, yFita, 1, comp, '#ffd34d');
      ret(ctx, cx + 1, yFita, 3, comp, roxo);
      ret(ctx, cx + 3, yFita, 1, comp, '#ffd34d');
      ret(ctx, cx - 4, yFim + 1, 1, 2, '#ffd34d');
      ret(ctx, cx - 2, yFim + 1, 1, 2, '#ff8a3d');
      ret(ctx, cx + 1, yFim + 1, 1, 2, roxo);
      ret(ctx, cx + 3, yFim + 1, 1, 2, '#ffd34d');
      // medalha acima do portão, com o raio de luz
      circulo(ctx, cx, py + 40, 7, K);
      circulo(ctx, cx, py + 40, 6, '#e0a820');
      circulo(ctx, cx, py + 40, 5, '#ffd34d');
      ret(ctx, cx - 1, py + 37, 3, 6, '#fff3a0'); ret(ctx, cx - 3, py + 39, 7, 2, '#fff3a0');
      ret(ctx, cx - 3, py + 36, 1, 1, '#ffffff');
    },
    museu: function (ctx, px, py, w, h, cores) {
      cores = cores || {};
      px += F.desvio(w);   // largura par: o desenho anda até a porta ficar no meio do tile dela (D2A-12)
      var parede = cores.parede || '#fff6e4', telhado = cores.telhado || '#b95a36', det = cores.detalhe || '#ff8a3d';
      var pedra = PA.cor.misturar(parede, '#f0d8b8', 0.62);
      var pedraClara = PA.cor.clarear(pedra, 0.28);
      var junta = PA.cor.misturar(pedra, '#c4a57a', 0.45);
      var degrau = PA.cor.misturar(pedra, '#e7d3b0', 0.35);
      var sombra = PA.cor.escurecer(degrau, 0.16);
      contornoRet(ctx, px + 1, py + h - 6, w - 2, 6, degrau);
      ret(ctx, px + 2, py + h - 2, w - 4, 1, sombra);
      contornoRet(ctx, px + 4, py + h - 10, w - 8, 5, PA.cor.clarear(degrau, 0.12));
      ret(ctx, px + 5, py + h - 6, w - 10, 1, sombra);
      contornoRet(ctx, px + 8, py + h - 14, w - 16, 5, pedraClara);
      ret(ctx, px + 9, py + h - 10, w - 18, 1, sombra);
      contornoRet(ctx, px + 7, py + 26, w - 14, h - 39, pedra);
      for (var j = py + 32; j < py + h - 16; j += 6) ret(ctx, px + 8, j, w - 16, 1, junta);
      [px + 9, px + 23, px + w - 31, px + w - 17].forEach(function (cx) {
        ret(ctx, cx - 1, py + 28, 10, 3, C.contorno);
        ret(ctx, cx, py + 29, 8, 1, pedraClara);
        ret(ctx, cx, py + 31, 8, h - 45, C.contorno);
        ret(ctx, cx + 1, py + 31, 6, h - 45, pedraClara);
        ret(ctx, cx + 5, py + 31, 2, h - 45, PA.cor.escurecer(pedra, 0.18));
        ret(ctx, cx + 3, py + 32, 1, h - 47, PA.cor.escurecer(pedraClara, 0.1));   // caneluras
        ret(ctx, cx + 2, py + 31, 1, h - 45, '#ffffff');
        ret(ctx, cx - 1, py + h - 16, 10, 2, C.contorno); ret(ctx, cx, py + h - 16, 8, 1, pedraClara);   // base da coluna
      });
      F.beiral(ctx, px + 8, py + 27, w - 16, 3);
      F.volume(ctx, px + 8, py + 27, w - 16, h - 41);
      ret(ctx, px + 2, py + 20, w - 4, 7, C.contorno);
      ret(ctx, px + 3, py + 21, w - 6, 5, PA.cor.misturar(PA.cor.clarear(telhado, 0.35), pedraClara, 0.4));
      // dentículos na viga, frontão com o friso claro e os enfeites dourados nas pontas
      for (var dx = px + 4; dx < px + w - 5; dx += 4) ret(ctx, dx, py + 24, 2, 2, PA.cor.escurecer(pedraClara, 0.18));
      triangulo(ctx, px + 1, py + 1, w - 2, 20, C.contorno);
      triangulo(ctx, px + 4, py + 4, w - 8, 16, telhado);
      F.telhas(ctx, px + 4, py + 4, w - 8, 16, telhado, 4);
      ret(ctx, px + w / 2 - 1, py + 5, 2, 1, PA.cor.clarear(telhado, 0.4));
      triangulo(ctx, px + 14, py + 10, w - 28, 10, C.contorno); triangulo(ctx, px + 16, py + 12, w - 32, 8, pedraClara);   // tímpano de pedra
      ret(ctx, px + 4, py + 19, w - 8, 1, PA.cor.escurecer(telhado, 0.2));
      F.telhasRet(ctx, px + 5, py + 18, w - 10, 1, PA.cor.escurecer(telhado, 0.12), 4);
      // relevo do frontão: louros dos dois lados do medalhão
      for (var lr = 0; lr < 4; lr++) {
        ret(ctx, px + w / 2 - 8 - lr * 3, py + 14 + (lr >> 1), 2, 1, PA.cor.clarear(telhado, 0.45));
        ret(ctx, px + w / 2 + 7 + lr * 3, py + 14 + (lr >> 1), 2, 1, PA.cor.clarear(telhado, 0.45));
        ret(ctx, px + w / 2 - 8 - lr * 3, py + 15 + (lr >> 1), 2, 1, PA.cor.escurecer(telhado, 0.2));
        ret(ctx, px + w / 2 + 7 + lr * 3, py + 15 + (lr >> 1), 2, 1, PA.cor.escurecer(telhado, 0.2));
      }
      circulo(ctx, px + w / 2, py - 1, 2, C.contorno); circulo(ctx, px + w / 2, py - 1, 1, '#ffd34d');
      [px + 3, px + w - 4].forEach(function (ax) { ret(ctx, ax - 1, py + 16, 3, 4, C.contorno); ret(ctx, ax, py + 17, 1, 2, '#ffd34d'); });
      circulo(ctx, px + w / 2, py + 13, 4, '#ffffff');
      ret(ctx, px + w / 2 - 2, py + 11, 5, 1, det);
      ret(ctx, px + w / 2 - 1, py + 12, 3, 1, det);
      ret(ctx, px + w / 2, py + 13, 1, 1, det);
      ret(ctx, px + w / 2 - 1, py + 14, 3, 1, det);
      ret(ctx, px + w / 2 - 2, py + 15, 5, 1, det);
      Mapa.fachada.porta(ctx, px + w / 2 - 8, py + h - 36, 16, 23, '#7c5cff');
      function vitral(x, y) {
        ret(ctx, x, y, 8, 10, C.contorno);
        ret(ctx, x + 1, y + 1, 2, 3, det);
        ret(ctx, x + 5, y + 1, 2, 3, telhado);
        ret(ctx, x + 1, y + 5, 2, 4, PA.cor.clarear(telhado, 0.4));
        ret(ctx, x + 5, y + 5, 2, 4, PA.cor.clarear(det, 0.35));
        ret(ctx, x + 3, y + 1, 2, 8, C.contorno);
        ret(ctx, x + 1, y + 4, 6, 1, C.contorno);
        ret(ctx, x + 1, y + 1, 1, 1, '#ffffff');
        ret(ctx, x + 5, y + 6, 1, 1, '#ffffff');
      }
      vitral(px + 13, py + 38);
      vitral(px + w - 21, py + 38);
      function estandarte(x, y) {
        ret(ctx, x - 1, y, 6, 2, C.contorno);
        ret(ctx, x, y, 4, 1, PA.cor.clarear(det, 0.35));
        ret(ctx, x, y + 2, 4, 12, C.contorno);
        ret(ctx, x, y + 2, 3, 11, det);
        ret(ctx, x, y + 2, 1, 11, PA.cor.clarear(det, 0.4));
        ret(ctx, x + 1, y + 6, 1, 2, '#ffffff');
        ret(ctx, x, y + 13, 1, 2, telhado);
        ret(ctx, x + 2, y + 13, 1, 2, telhado);
      }
      estandarte(px + w / 2 - 14, py + 32);
      estandarte(px + w / 2 + 10, py + 32);
      var qx = px + w / 2 - 4, qy = py + 32;
      contornoRet(ctx, qx, qy, 9, 10, pedraClara);
      ret(ctx, qx + 2, qy + 2, 5, 6, PA.cor.clarear(telhado, 0.5));
      ret(ctx, qx + 2, qy + 5, 5, 3, PA.cor.misturar(det, pedra, 0.35));
      ret(ctx, qx + 3, qy + 4, 3, 2, telhado);
      ret(ctx, qx + 4, qy + 3, 1, 1, '#ffffff');
      // lampiões nas pontas da escadaria
      Mapa.fachada.lampiao(ctx, px + 3, py + h - 1, 14);
      Mapa.fachada.lampiao(ctx, px + w - 5, py + h - 1, 14);
    },
    estabulo: function (ctx, px, py, w, h) {
      px += F.desvio(w);   // largura par: o desenho anda até a porta ficar no meio do tile dela (D2A-12)
      var cx = px + w / 2, telhado = '#f0a04a', telhado2 = '#d9842f', telhadoL = '#ffc27a';
      // paredes de tábuas em pé, com o rodapé de pedra
      contornoRet(ctx, px + 4, py + 22, w - 8, h - 22, '#f6e7c4');
      F.tabuas(ctx, px + 5, py + 23, w - 10, h - 24, '#f6e7c4');
      F.fundacao(ctx, px + 5, py + h - 8, w - 10, 7, '#e6dccb');
      // telhado com as fileiras de telhas e a cumeeira
      ctx.fillStyle = K;
      for (var j = 0; j < 24; j++) { var m = Math.round(12 + j * (w / 2 - 12) / 23); ctx.fillRect(cx - m - 2, py + j, (m + 2) * 2, 1); }
      ctx.fillStyle = telhado;
      for (var j2 = 2; j2 < 23; j2++) { var m2 = Math.round(10 + j2 * (w / 2 - 14) / 23); ctx.fillRect(cx - m2, py + j2, m2 * 2, 1); }
      for (var j3 = 5, lin = 0; j3 < 23; j3 += 4, lin++) {
        var m3 = Math.round(10 + j3 * (w / 2 - 14) / 23) - 1;
        ret(ctx, cx + 1, py + j3 - 3, m3, 3, '#e4903e');   // água da direita na sombra
        ret(ctx, cx - m3, py + j3, m3 * 2, 1, '#b86a28'); if (j3 + 1 < 22) ret(ctx, cx - m3 + 1, py + j3 + 1, m3, 1, telhadoL);
        for (var tx = cx - m3 + (lin % 2) * 3; tx + 5 <= cx + m3; tx += 6) {
          ret(ctx, tx + 1, py + j3, 4, 1, telhado2); ret(ctx, tx, py + j3 - 1, 1, 1, telhado2); ret(ctx, tx + 5, py + j3 - 1, 1, 1, telhado2);
          ret(ctx, tx + 2, py + j3 - 2, 2, 1, telhadoL);
        }
      }
      ret(ctx, cx - 12, py + 2, 24, 1, telhadoL);
      ret(ctx, px + 2, py + 22, w - 4, 2, K);
      ret(ctx, px + 3, py + 22, w - 6, 1, telhado2);
      F.beiral(ctx, px + 5, py + 24, w - 10, 2, telhado2); ret(ctx, px + 5, py + 29, w - 10, 1, 'rgba(58,36,70,0.12)');
      F.volume(ctx, px + 5, py + 23, w - 10, h - 31);
      // vigas de canto
      [px + 5, px + w - 8].forEach(function (vx) { ret(ctx, vx, py + 24, 3, h - 32, '#c98a4b'); ret(ctx, vx, py + 24, 1, h - 32, '#dca067'); ret(ctx, vx + 2, py + 24, 1, h - 32, '#a86e3a'); });
      // cata-vento com a estrela
      ret(ctx, cx, py - 4, 1, 5, K);
      ret(ctx, cx - 5, py - 2, 11, 1, K); ret(ctx, cx - 6, py - 3, 2, 3, K); ret(ctx, cx + 5, py - 3, 1, 3, K);
      D.matriz(ctx, cx - 3, py - 8, ['...k...', '..kyk..', 'kkyyykk', '.kyyyk.', 'kyk.kyk'], { k: K, y: C.ouro });
      // galinho do cata-vento e as letras N e S
      D.matriz(ctx, cx + 2, py - 13, ['.kk..', 'kryk.', '.kyyk', '..kk.'], { k: K, y: C.ouro, r: '#ff6b5a' });
      ret(ctx, cx - 1, py - 9, 1, 2, K);
      // palha no vão do telhado
      ret(ctx, cx - 7, py + 7, 14, 12, K);
      ret(ctx, cx - 6, py + 8, 12, 10, '#6b4428');
      ret(ctx, cx - 5, py + 11, 10, 7, '#f5c842');
      for (var s = 0; s < 3; s++) ret(ctx, cx - 4 + (s % 2), py + 12 + s * 2, 7, 1, s % 2 ? '#ffe066' : '#d9a93a');
      ret(ctx, cx - 3, py + 9, 1, 3, '#ffe066'); ret(ctx, cx + 1, py + 8, 1, 4, '#f5c842'); ret(ctx, cx + 3, py + 10, 1, 2, '#ffe066');
      ret(ctx, cx - 7, py + 6, 14, 2, K); ret(ctx, cx - 6, py + 6, 12, 1, '#ff8a3d');
      // janelas com venezianas laranja e floreira
      F.janela(ctx, px + 14, py + 27, 12, 10, { venezianas: '#ff8a3d', floreira: '#ff7eb6' });
      F.janela(ctx, px + w - 26, py + 27, 12, 10, { venezianas: '#ff8a3d', floreira: '#ffe066' });
      // porta de celeiro com o X branco e o batente, em cima do degrau (entrada padrão: F.PORTA)
      var dx = cx - 10, dy = py + h - 26, da = 23;
      ret(ctx, dx - 2, dy - 2, 24, da + 2, K); ret(ctx, dx - 1, dy - 1, 22, 2, '#ffffff');
      contornoRet(ctx, dx, dy, 20, da, '#ff8a3d');
      F.tabuas(ctx, dx + 1, dy + 1, 18, da - 1, '#ff8a3d');
      ctx.fillStyle = '#ffffff';
      for (var t = 0; t < da - 4; t++) { ctx.fillRect(dx + 1 + Math.round(t * 16 / (da - 5)), dy + 2 + t, 2, 1); ctx.fillRect(dx + 17 - Math.round(t * 16 / (da - 5)), dy + 2 + t, 2, 1); }
      ret(ctx, dx + 1, dy + 1, 18, 1, '#ffffff'); ret(ctx, dx + 9, dy + 1, 2, da - 1, '#ffffff'); ret(ctx, dx + 1, dy + da - 2, 18, 1, '#ffffff');
      ret(ctx, dx + 7, dy + 11, 2, 2, C.ouro); ret(ctx, dx + 11, dy + 11, 2, 2, C.ouro);
      ret(ctx, dx + 7, dy + 11, 1, 1, C.ouro3); ret(ctx, dx + 11, dy + 11, 1, 1, C.ouro3);
      F.degrau(ctx, cx, py + h - 3, 26, 3);
      // ferradura da sorte em cima da porta
      var hx = cx - 5, hy = py + 24;
      ret(ctx, hx, hy, 3, 7, K); ret(ctx, hx + 8, hy, 3, 7, K); ret(ctx, hx, hy + 5, 11, 4, K);
      ret(ctx, hx + 1, hy + 1, 1, 5, '#ffd34d'); ret(ctx, hx + 9, hy + 1, 1, 5, '#ffd34d'); ret(ctx, hx + 1, hy + 6, 9, 2, '#ffd34d');
      ret(ctx, hx + 1, hy + 1, 1, 1, '#fff3a0'); ret(ctx, hx + 4, hy + 7, 3, 1, '#d9a93a');
      // lampião na parede, ao lado da porta
      ret(ctx, cx + 13, py + 42, 4, 1, K); ret(ctx, cx + 14, py + 43, 4, 6, K); ret(ctx, cx + 15, py + 44, 2, 4, '#ffe066'); ret(ctx, cx + 15, py + 44, 1, 1, '#fff8c8');
      // monte de feno à esquerda da porta, com o forcado
      ret(ctx, px + 30, py + h - 22, 1, 20, K); ret(ctx, px + 29, py + h - 24, 3, 1, K); ret(ctx, px + 29, py + h - 26, 1, 2, K); ret(ctx, px + 31, py + h - 26, 1, 2, K); ret(ctx, px + 30, py + h - 26, 1, 2, K);
      elipse(ctx, px + 18, py + h - 8, 12, 7, K);
      elipse(ctx, px + 18, py + h - 8, 11, 6, '#f5c842');
      elipse(ctx, px + 16, py + h - 11, 7, 3, '#ffe066');
      for (var f = 0; f < 6; f++) ret(ctx, px + 9 + f * 3, py + h - 7 + (f % 2), 2, 1, '#d9a93a');
      ret(ctx, px + 12, py + h - 16, 1, 5, '#ffd34d');
      ret(ctx, px + 21, py + h - 17, 1, 6, '#ffe066');
      ret(ctx, px + 25, py + h - 14, 1, 4, '#d9a93a');
      // feno escapando do vão do telhado
      [[-6, 19], [-2, 20], [3, 19], [6, 20]].forEach(function (f) { ret(ctx, cx + f[0], py + f[1], 1, 2, '#f5c842'); });
      // cocho de água à direita
      var bx = px + w - 30;
      ret(ctx, bx, py + h - 9, 20, 7, K); ret(ctx, bx + 1, py + h - 8, 18, 5, C.madeira);
      ret(ctx, bx + 1, py + h - 8, 18, 2, C.agua); ret(ctx, bx + 3, py + h - 8, 4, 1, C.agua2);
      ret(ctx, bx + 2, py + h - 2, 2, 2, K); ret(ctx, bx + 16, py + h - 2, 2, 2, K);
      ret(ctx, bx + 1, py + h - 5, 18, 1, C.madeira2);
    },
    bau: function (ctx, px, py, w, h) {
      var cx = px + w / 2, mad = '#c98a4b', madE = '#b77a44', ouro = '#ffd34d', ouro2 = '#d9a93a';
      // moedas no topo
      [[24, 5], [36, 2], [48, 5], [58, 3], [30, 7], [42, 6]].forEach(function (m) {
        var mx = px + m[0], my = py + m[1] + 3;
        circulo(ctx, mx, my, 3, K);
        circulo(ctx, mx, my, 2, ouro);
        ret(ctx, mx - 1, my - 1, 2, 1, '#ffffff');
        ret(ctx, mx + 1, my + 1, 1, 1, ouro2);
      });
      // coroa em cima das moedas
      D.miudeza(ctx, 'coroa', px + 40, py + 7);
      // tampa arredondada com tábuas curvas
      elipse(ctx, cx, py + 22, w / 2 - 2, 14, K);
      elipse(ctx, cx, py + 22, w / 2 - 4, 12, madE);
      elipse(ctx, cx, py + 21, w / 2 - 8, 10, mad);
      elipse(ctx, cx - 6, py + 16, w / 2 - 18, 4, '#dca067');
      [-24, -8, 8, 24].forEach(function (o) {
        var yTopo = py + 22 - Math.round(12 * Math.sqrt(Math.max(0, 1 - (o * o) / ((w / 2 - 4) * (w / 2 - 4)))));
        ret(ctx, cx + o, yTopo + 1, 1, py + 24 - yTopo, '#8a604a');
      });
      // gemas cravadas na tampa
      [[-18, 15, '#ff6b8a'], [0, 12, '#5fb4ff'], [18, 15, '#6fdc8c']].forEach(function (g) {
        var gx = cx + g[0], gy = py + g[1];
        ret(ctx, gx - 2, gy - 1, 5, 4, K); ret(ctx, gx - 1, gy - 2, 3, 6, K);
        ret(ctx, gx - 1, gy - 1, 3, 4, g[2]); ret(ctx, gx - 1, gy, 1, 1, '#ffffff'); ret(ctx, gx + 1, gy + 1, 1, 2, D.escurecer(g[2], 0.25));
      });
      // corpo de tábuas deitadas
      contornoRet(ctx, px + 2, py + 24, w - 4, h - 24, mad);
      F.tabuas(ctx, px + 3, py + 29, w - 6, h - 30, mad, true);
      ret(ctx, px + 3, py + 24, w - 6, 4, ouro); ret(ctx, px + 3, py + 24, w - 6, 1, '#fff3a0'); ret(ctx, px + 3, py + 28, w - 6, 1, ouro2);
      for (var r = px + 6; r < px + w - 4; r += 6) ret(ctx, r, py + 26, 1, 1, ouro2);
      // cintas douradas com rebites
      [px + 10, px + w - 16].forEach(function (bx) {
        ret(ctx, bx - 1, py + 9, 8, h - 9, K);
        ret(ctx, bx, py + 10, 6, h - 10, ouro); ret(ctx, bx + 4, py + 10, 2, h - 10, ouro2); ret(ctx, bx, py + 10, 1, h - 10, '#fff3a0');
        for (var rv = py + 14; rv < py + h - 2; rv += 7) { ret(ctx, bx + 2, rv, 2, 2, ouro2); ret(ctx, bx + 2, rv, 1, 1, '#ffffff'); }
      });
      F.beiral(ctx, px + 3, py + 29, w - 6, 3);
      F.volume(ctx, px + 3, py + 29, w - 6, h - 30);
      F.fundacao(ctx, px + 3, py + h - 5, w - 6, 4, '#a8794a');
      // cantoneiras douradas em cima, com rebite
      [[px + 2, 0], [px + w - 9, 1]].forEach(function (c) {
        ret(ctx, c[0], py + 24, 7, 7, K); ret(ctx, c[0] + 1, py + 25, 5, 5, ouro); ret(ctx, c[0] + 1, py + 25, 5, 1, '#fff3a0');
        ret(ctx, c[0] + 3, py + 27, 1, 1, ouro2); ret(ctx, c[0] + 3, py + 27, 1, 1, '#ffffff');
      });
      // rebites ao longo do pé
      for (var rb = px + 12; rb < px + w - 12; rb += 5) { ret(ctx, rb, py + h - 3, 1, 1, ouro2); ret(ctx, rb, py + h - 4, 1, 1, '#fff3a0'); }
      // cantoneiras de ferro
      [[px + 2, 1], [px + w - 9, -1]].forEach(function (c) {
        ret(ctx, c[0], py + h - 7, 7, 7, K); ret(ctx, c[0] + 1, py + h - 6, 5, 5, C.metal); ret(ctx, c[0] + 1, py + h - 6, 5, 1, '#e8eef8');
        ret(ctx, c[0] + 3, py + h - 4, 1, 1, C.metal2);
      });
      // porta de ameixa escura (contraste com a madeira, D2A-03) na entrada padrão, com a fechadura e a pedra preciosa
      var fo = F.entrada(ctx, cx, py + h, '#4a2a5a', ouro, { larg: 16 });
      var fy = fo.y + 9;
      circulo(ctx, cx, fy, 3, K); circulo(ctx, cx, fy, 2, ouro); ret(ctx, cx - 1, fy + 1, 3, 5, K); ret(ctx, cx, fy + 1, 1, 4, ouro);
      ret(ctx, cx - 1, fy - 1, 1, 1, '#fff3a0'); ret(ctx, cx, fy, 1, 1, K);
      D.miudeza(ctx, 'gema', cx, fo.y - 2);
      // tesouro que escorregou: moedas e uma gema na grama
      [[21, 5], [26, 4], [w - 25, 4]].forEach(function (m) {
        circulo(ctx, px + m[0], py + h - m[1], 3, K); circulo(ctx, px + m[0], py + h - m[1], 2, ouro);
        ret(ctx, px + m[0] - 1, py + h - m[1] - 1, 1, 1, '#ffffff'); ret(ctx, px + m[0] + 1, py + h - m[1] + 1, 1, 1, ouro2);
      });
    },
  };

  Mapa.PREDIOS = PREDIOS;
  // brilhos animados de um prédio, por cima da imagem fixa (o prédio registra Mapa.PREDIOS_ANIM[sprite];
  // mesmos argumentos do desenho de fora, mais o tempo t). Só roda com Animações ligado.
  Mapa.PREDIOS_ANIM = Mapa.PREDIOS_ANIM || {};
  // as moedas do baú piscam (as luzinhas da loja: mundo/predios-3.js)
  Mapa.PREDIOS_ANIM.bau = function (ctx, px, py, w, h, t) {
    var brilhos = [[24, 7], [36, 4], [58, 5], [48, 7], [21, h - 6]];
    var f = (t / 900) % brilhos.length, i = Math.floor(f), fase = f - i;
    if (fase > 0.6) return;
    F.brilho(ctx, px + brilhos[i][0], py + brilhos[i][1], '#ffffff');
  };
})();
