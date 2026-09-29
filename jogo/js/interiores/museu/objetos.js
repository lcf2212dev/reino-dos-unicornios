/* Museu das Memórias, parte 1 de 2: os objetos temáticos (prefixo museu-) e os desenhos pequenos
   que eles usam. O que as outras partes usam fica em Reino._predios.museu (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.museu) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).museu = {};
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // envelope pequeno com selo (usado em vários objetos)
  function envelope(ctx, x, y, cor, selo) {
    contornoRet(ctx, x, y, 7, 5, cor || C.creme);
    ret(ctx, x + 1, y + 1, 1, 1, '#d8c8b0'); ret(ctx, x + 2, y + 2, 3, 1, '#d8c8b0'); ret(ctx, x + 5, y + 1, 1, 1, '#d8c8b0');
    ret(ctx, x + 5, y + 1, 1, 1, selo || C.vermelho);
  }
  // cordão de isolamento: colunas douradas com corda de veludo
  function coluna(ctx, cx, py) {
    ret(ctx, cx - 2, py + 12, 5, 3, K); ret(ctx, cx - 1, py + 12, 3, 2, C.ouro2);
    ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, C.ouro);
    circulo(ctx, cx, py + 1, 2, K); circulo(ctx, cx, py + 1, 1, C.ouro3);
  }

  /* ================= OBJETOS DO MUSEU ================= */
  I.objeto('museu-cordao', { w: 2, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, c = v(o, 'cor', '#c8324a');
      for (var x = px + 4; x < px + W - 4; x++) {
        var f = (x - px - 4) / (W - 8), cai = Math.round(Math.sin(f * Math.PI) * 4);
        ret(ctx, x, py + 4 + cai, 1, 2, K); ret(ctx, x, py + 4 + cai, 1, 1, c);
      }
      coluna(ctx, px + 3, py); coluna(ctx, px + W - 4, py);
    } });
  I.objeto('museu-legenda', { w: 1, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      ret(ctx, cx - 1, py + 4, 3, 11, K); ret(ctx, cx, py + 4, 1, 10, C.metal2);
      ret(ctx, cx - 4, py + 13, 9, 2, K);
      ret(ctx, cx - 6, py - 5, 13, 10, K); ret(ctx, cx - 5, py - 4, 11, 8, v(o, 'cor', C.creme));
      ret(ctx, cx - 4, py - 3, 7, 1, '#8a7aa8'); ret(ctx, cx - 4, py - 1, 9, 1, '#b8aac8'); ret(ctx, cx - 4, py + 1, 6, 1, '#b8aac8');
      ret(ctx, cx - 5, py - 4, 11, 1, C.branco);
    } });
  I.objeto('museu-pulpito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, C.madeira3);
      ret(ctx, cx - 3, py - 2, 7, 14, K); ret(ctx, cx - 2, py - 2, 5, 13, C.madeira); ret(ctx, cx - 2, py - 2, 1, 13, C.madeiraClara);
      ret(ctx, cx - 1, py + 3, 3, 3, C.ouro2);
      ret(ctx, cx - 8, py - 7, 17, 6, K); ret(ctx, cx - 7, py - 6, 15, 4, C.madeira2); ret(ctx, cx - 7, py - 6, 15, 1, C.madeiraClara);
      // o Livro das Memórias aberto
      ret(ctx, cx - 7, py - 12, 15, 6, K);
      ret(ctx, cx - 6, py - 11, 6, 4, C.creme); ret(ctx, cx + 1, py - 11, 6, 4, C.creme);
      ret(ctx, cx, py - 11, 1, 5, '#9b6bd6');
      ret(ctx, cx - 5, py - 10, 4, 1, '#c8b8d8'); ret(ctx, cx - 5, py - 8, 3, 1, '#c8b8d8');
      ret(ctx, cx + 2, py - 10, 4, 1, '#c8b8d8'); ret(ctx, cx + 2, py - 8, 3, 1, '#c8b8d8');
      ret(ctx, cx, py - 6, 1, 3, C.rosa);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 260) % 8;
      if (f < 3) { ret(ctx, px + 3 + f * 4, py - 15 - f, 1, 3, C.ouro3); ret(ctx, px + 2 + f * 4, py - 14 - f, 3, 1, C.ouro3); }
    } });
  I.objeto('museu-mapa', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py, 3, 15, K); ret(ctx, px + 25, py, 3, 15, K);
      ret(ctx, px + 5, py, 1, 14, C.madeira); ret(ctx, px + 26, py, 1, 14, C.madeira);
      contornoRet(ctx, px + 1, py - 14, 30, 16, C.madeira2);
      ret(ctx, px + 3, py - 12, 26, 12, C.creme);
      // plantinha do museu: 3 salas em cima, 3 embaixo
      var cores = ['#9fe0a0', '#ffb070', '#c9a8ff', '#ffc2d8', '#ffe28a', '#9fcfff'];
      for (var i = 0; i < 6; i++) {
        var x = px + 4 + (i % 3) * 8, y = py - 11 + Math.floor(i / 3) * 5;
        ret(ctx, x, y, 7, 4, K); ret(ctx, x + 1, y + 1, 5, 2, cores[i]);
      }
      ret(ctx, px + 15, py - 3, 2, 2, C.vermelho);   // "você está aqui"
      ret(ctx, px + 1, py - 15, 30, 2, K); ret(ctx, px + 2, py - 14, 28, 1, C.ouro);
    } });
  I.objeto('museu-fotos', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var s = v(o, 'sepia', '#e8d2a8');
      contornoRet(ctx, px + 1, py + 8, 8, 10, C.madeira2); ret(ctx, px + 2, py + 9, 6, 8, s);
      circulo(ctx, px + 5, py + 12, 1, '#8a6a4a'); ret(ctx, px + 3, py + 14, 5, 3, '#8a6a4a');
      contornoRet(ctx, px + 8, py + 15, 7, 8, C.ouro2); ret(ctx, px + 9, py + 16, 5, 6, s);
      circulo(ctx, px + 11, py + 18, 1, '#6a4a3a'); ret(ctx, px + 10, py + 20, 3, 2, '#6a4a3a');
      contornoRet(ctx, px + 3, py + 20, 5, 6, C.rosa2); ret(ctx, px + 4, py + 21, 3, 4, s);
    } });
  I.objeto('museu-mural-cartas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 7, 14, 19, '#d9a36a'); ret(ctx, px + 2, py + 8, 12, 17, '#e8bd84');
      for (var i = 0; i < 6; i++) ret(ctx, px + 2 + (i * 5) % 12, py + 9 + i * 3, 1, 1, '#c9955a');
      envelope(ctx, px + 2, py + 9, C.creme, C.vermelho);
      envelope(ctx, px + 7, py + 12, '#ffe3ec', C.azul);
      envelope(ctx, px + 3, py + 16, '#fff3c8', C.verde);
      envelope(ctx, px + 7, py + 19, C.creme, C.rosa);
      ret(ctx, px + 5, py + 9, 1, 1, C.vermelho); ret(ctx, px + 10, py + 12, 1, 1, C.azul);
    } });
  I.objeto('museu-selos', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 8, 12, 16, C.ouro2); ret(ctx, px + 3, py + 9, 10, 14, '#2f4f8a');
      var cs = [C.vermelho, C.ouro, C.verde, C.rosa, C.azul2, C.laranja];
      for (var i = 0; i < 6; i++) {
        var x = px + 4 + (i % 2) * 5, y = py + 10 + Math.floor(i / 2) * 4;
        ret(ctx, x, y, 4, 3, C.branco); ret(ctx, x + 1, y + 1, 2, 1, cs[i]);
      }
    } });
  I.objeto('museu-caixinha', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // mesinha
      ret(ctx, cx - 7, py - 1, 15, 4, K); ret(ctx, cx - 6, py, 13, 2, '#f0c0d0'); ret(ctx, cx - 6, py, 13, 1, '#ffe3ec');
      ret(ctx, cx - 6, py + 3, 2, 12, K); ret(ctx, cx + 5, py + 3, 2, 12, K);
      ret(ctx, cx - 5, py + 3, 1, 11, C.madeira); ret(ctx, cx + 6, py + 3, 1, 11, C.madeira);
      // caixinha aberta com conchinhas e fotos
      ret(ctx, cx - 6, py - 12, 12, 4, K); ret(ctx, cx - 5, py - 11, 10, 2, '#ff9cc6');
      ret(ctx, cx - 6, py - 8, 12, 7, K); ret(ctx, cx - 5, py - 7, 10, 5, '#ff7eb6'); ret(ctx, cx - 5, py - 7, 10, 1, '#ffc2d8');
      ret(ctx, cx - 1, py - 5, 2, 2, C.ouro);
      ret(ctx, cx - 4, py - 10, 3, 2, '#e8d2a8'); ret(ctx, cx + 1, py - 10, 3, 2, C.branco);
      elipse(ctx, cx - 3, py - 8, 1, 1, '#ffe0c7'); elipse(ctx, cx + 3, py - 8, 1, 1, '#fff3a0');
    } });
  I.objeto('museu-caixa-correio', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = v(o, 'cor', '#ffd34d');
      ret(ctx, cx - 1, py + 2, 3, 13, K); ret(ctx, cx, py + 2, 1, 12, C.metal2);
      ret(ctx, cx - 4, py + 13, 9, 2, K);
      ret(ctx, cx - 6, py - 12, 13, 15, K); ret(ctx, cx - 5, py - 11, 11, 13, c); ret(ctx, cx - 5, py - 11, 1, 13, '#fff3a0');
      elipse(ctx, cx, py - 12, 6, 2, K); elipse(ctx, cx, py - 12, 5, 1, c);
      ret(ctx, cx - 3, py - 8, 7, 2, K);
      ret(ctx, cx - 3, py - 3, 7, 3, '#2f6fd6'); ret(ctx, cx - 2, py - 2, 5, 1, C.branco);
      envelope(ctx, cx - 3, py - 11, C.creme, C.vermelho);
    } });
  I.objeto('museu-postais', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 2, C.metal2);
      ret(ctx, cx - 1, py - 16, 3, 29, K); ret(ctx, cx, py - 16, 1, 28, C.metal);
      var cs = ['#9fdcff', '#ffe28a', '#ffc2d8', '#9fe0a0', '#ffb070', '#c9a8ff'];
      for (var i = 0; i < 6; i++) {
        var x = i % 2 ? cx + 1 : cx - 7, y = py - 15 + Math.floor(i / 2) * 7;
        ret(ctx, x, y, 7, 6, K); ret(ctx, x + 1, y + 1, 5, 4, cs[i]);
        ret(ctx, x + 1, y + 4, 5, 1, i % 2 ? C.folha3 : C.azul);
        ret(ctx, x + (i % 2 ? 4 : 1), y + 1, 1, 1, C.branco);
      }
    } });
  I.objeto('museu-documentos', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var x = px + 1, w = 30;
      contornoRet(ctx, x, py + 3, w, 12, '#2f4f8a'); ret(ctx, x + 1, py + 4, w - 2, 1, '#5f86c8');
      ret(ctx, x + 12, py + 9, 6, 1, C.ouro);
      ret(ctx, x, py - 12, w, 16, K); ret(ctx, x + 1, py - 11, w - 2, 14, '#e2f4fb');
      // certidão (papel com selo), RG verde, CPF azul
      ret(ctx, x + 2, py - 9, 8, 11, K); ret(ctx, x + 3, py - 8, 6, 9, C.creme);
      ret(ctx, x + 4, py - 7, 4, 1, '#b8aac8'); ret(ctx, x + 4, py - 5, 4, 1, '#b8aac8'); circulo(ctx, x + 6, py - 1, 1, C.vermelho);
      ret(ctx, x + 11, py - 6, 9, 7, K); ret(ctx, x + 12, py - 5, 7, 5, '#9fe0a0');
      ret(ctx, x + 13, py - 4, 2, 3, '#e8d2a8'); ret(ctx, x + 16, py - 4, 2, 1, C.folha3); ret(ctx, x + 16, py - 2, 2, 1, C.folha3);
      ret(ctx, x + 21, py - 5, 7, 5, K); ret(ctx, x + 22, py - 4, 5, 3, '#9fcfff'); ret(ctx, x + 23, py - 3, 3, 1, '#2f4f8a');
      ret(ctx, x + 2, py - 11, 1, 5, 'rgba(255,255,255,0.9)');
      ret(ctx, x - 1, py - 14, w + 2, 3, K); ret(ctx, x, py - 13, w, 1, '#5f86c8');
    } });
  I.objeto('museu-mapa-brasil', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 4, 46, 26, C.madeira2);
      ret(ctx, px + 2, py + 5, 44, 24, '#9fdcff');
      ret(ctx, px + 2, py + 5, 44, 1, '#c8ecff');
      // contorno do Brasil (desenho simples, verde e amarelo)
      var linhas = [
        '....gggggggg........',
        '..ggggggggggggg.....',
        '.gggggggggggggggggg.',
        'gggggggyyyggggggggg.',
        'ggggggyyyyyyggggggg.',
        '.ggggggyyyyyggggggg.',
        '..ggggggyyygggggggg.',
        '...gggggggggggggg...',
        '....gggggggggggg....',
        '.....ggggggggg......',
        '......gggggg........',
        '.......gggg.........',
        '.......ggg..........',
        '........g...........',
      ];
      var ox = px + 14, oy = py + 8, pal = { g: '#4caf50', y: '#ffd34d' };
      for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
        var ch = linhas[j][i];
        if (ch !== '.') { ctx.fillStyle = pal[ch]; ctx.fillRect(ox + i, oy + j, 1, 1); }
      }
      // alfinetes dos museus
      [[5, 3], [15, 2], [11, 8], [8, 11], [17, 5]].forEach(function (p, n) {
        ret(ctx, ox + p[0], oy + p[1] - 2, 1, 2, K); ret(ctx, ox + p[0], oy + p[1] - 3, 1, 1, [C.vermelho, C.rosa, C.roxo, C.laranja, C.azul][n]);
      });
      ret(ctx, px + 4, py + 7, 6, 4, K); ret(ctx, px + 5, py + 8, 4, 2, C.creme);   // rosa dos ventos
      ret(ctx, px + 6, py + 7, 2, 1, C.vermelho);
    } });
  I.objeto('museu-maquete', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      // mesa
      ret(ctx, px + 1, py - 1, 30, 5, K); ret(ctx, px + 2, py, 28, 3, '#6fbf73'); ret(ctx, px + 2, py, 28, 1, '#a8e0a0');
      ret(ctx, px + 3, py + 4, 3, 11, K); ret(ctx, px + 26, py + 4, 3, 11, K);
      ret(ctx, px + 4, py + 4, 1, 10, C.madeira); ret(ctx, px + 27, py + 4, 1, 10, C.madeira);
      // miniatura de museu: frontão, colunas e escadinha
      triangulo(ctx, cx - 10, py - 15, 21, 5, K); triangulo(ctx, cx - 8, py - 14, 17, 3, C.creme);
      ret(ctx, cx - 10, py - 10, 21, 2, K);
      for (var i = 0; i < 5; i++) { ret(ctx, cx - 9 + i * 4, py - 8, 3, 6, K); ret(ctx, cx - 8 + i * 4, py - 8, 1, 5, C.branco); }
      ret(ctx, cx - 11, py - 2, 23, 2, K); ret(ctx, cx - 10, py - 2, 21, 1, C.pedra);
      ret(ctx, cx, py - 17, 1, 3, K); ret(ctx, cx + 1, py - 17, 3, 2, '#ffd34d');
    } });
  I.objeto('museu-tico-tico', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 7, 12, 18, C.creme);
      ret(ctx, px + 3, py + 8, 10, 4, C.vermelho); ret(ctx, px + 4, py + 9, 8, 1, C.branco); ret(ctx, px + 4, py + 10, 5, 1, C.ouro3);
      // passarinho tico-tico na capa
      elipse(ctx, px + 8, py + 17, 3, 2, '#a0745a'); circulo(ctx, px + 10, py + 15, 2, '#8a604a');
      ret(ctx, px + 12, py + 15, 1, 1, C.ouro); ret(ctx, px + 10, py + 14, 1, 1, K);
      ret(ctx, px + 4, py + 22, 8, 1, '#b8aac8');
    } });
  I.objeto('museu-tambor', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      function atabaque(cx, alt, c) {
        ret(ctx, cx - 5, py + 14 - alt, 11, alt + 1, K);
        ret(ctx, cx - 4, py + 15 - alt, 9, alt - 1, c); ret(ctx, cx - 4, py + 15 - alt, 2, alt - 1, C.madeiraClara);
        for (var y = py + 17 - alt; y < py + 13; y += 3) ret(ctx, cx - 4, y, 9, 1, '#8a3a2a');
        elipse(ctx, cx, py + 14 - alt, 5, 2, K); elipse(ctx, cx, py + 14 - alt, 4, 1, '#f3e6c8');
        ret(ctx, cx - 4, py + 12, 9, 1, C.ouro);
      }
      atabaque(px + 7, 22, C.madeira); atabaque(px + 17, 17, '#d9784a'); atabaque(px + 26, 12, C.madeira2);
    } });
  I.objeto('museu-panelas', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      // esteira de palha
      ret(ctx, px + 1, py + 9, 30, 6, K); ret(ctx, px + 2, py + 10, 28, 4, '#f5d77a');
      for (var x = px + 3; x < px + 30; x += 3) ret(ctx, x, py + 10, 1, 4, '#d9ab45');
      // panela de barro: corpo com luz em cima, 2 alças, borda clara larga e a boca aberta (escura por dentro)
      function panela(cx, cy, rx, ry) {
        var BARRO = '#b95a36', LUZ = '#e07a4a', BORDA = '#f4b48a', top = cy - ry;
        ret(ctx, cx - rx - 3, cy - 2, 3, 4, K); ret(ctx, cx - rx - 2, cy - 1, 1, 2, LUZ);   // alça da esquerda
        ret(ctx, cx + rx + 1, cy - 2, 3, 4, K); ret(ctx, cx + rx + 2, cy - 1, 1, 2, LUZ);   // alça da direita
        elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, BARRO);
        ret(ctx, cx - rx + 1, cy - 1, 2, 2, LUZ); ret(ctx, cx - rx + 1, cy + ry - 1, 2 * rx - 1, 1, '#8a3a26');
        // borda clara em elipse (5 fileiras) com a boca escura no meio
        var LB = [2 * rx - 3, 2 * rx - 1, 2 * rx + 1, 2 * rx - 1, 2 * rx - 3], BOCA = [0, 3, 5, 3, 0];
        LB.forEach(function (w, k) {
          var y = top - 2 + k;
          ret(ctx, cx - (w >> 1) - 1, y, w + 2, 1, K); ret(ctx, cx - (w >> 1), y, w, 1, k < 2 ? '#ffd8bc' : BORDA);
          if (BOCA[k]) ret(ctx, cx - (BOCA[k] >> 1), y, BOCA[k], 1, '#5a2a1a');
        });
        ret(ctx, cx - (LB[0] >> 1), top - 3, LB[0], 1, K); ret(ctx, cx - (LB[0] >> 1), top + 3, LB[0], 1, K);
      }
      panela(px + 8, py + 7, 4, 4); panela(px + 23, py + 8, 4, 3);
    } });
  // vestido de carimbó num manequim de busto: blusa de mangas bufantes, cintura marcada pelo cinto dourado,
  // saia rodada vermelha com pregas e a barra florida de babados, no pé de metal
  I.objeto('museu-saia', { w: 1, h: 1, topo: 17, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, VERM = '#e0433f', PREGA = '#a8302c', LUZ = '#ff7a6a';
      ret(ctx, cx - 1, py + 4, 3, 10, K); ret(ctx, cx, py + 4, 1, 9, C.metal2); ret(ctx, cx - 4, py + 13, 9, 2, K);
      ret(ctx, cx - 1, py - 17, 3, 3, K); ret(ctx, cx, py - 16, 1, 1, '#f3e6c8');                 // pescoço do manequim
      // blusa: ombros largos afinando até a cintura
      [[-14, 5], [-13, 5], [-12, 4], [-11, 4], [-10, 3], [-9, 2]].forEach(function (r) {
        ret(ctx, cx - r[1] - 1, py + r[0], 2 * r[1] + 3, 1, K); ret(ctx, cx - r[1], py + r[0], 2 * r[1] + 1, 1, C.branco);
      });
      ret(ctx, cx - 4, py - 13, 1, 3, '#e6dccb');
      ret(ctx, cx - 8, py - 14, 3, 4, K); ret(ctx, cx - 7, py - 13, 1, 2, C.branco);            // mangas bufantes
      ret(ctx, cx + 6, py - 14, 3, 4, K); ret(ctx, cx + 7, py - 13, 1, 2, C.branco);
      ret(ctx, cx - 3, py - 8, 7, 1, K); ret(ctx, cx - 2, py - 8, 5, 1, C.ouro);                // cinto (5 px)
      // saia rodada: abre de 7 a 19 px, com pregas escuras e luz à esquerda
      for (var j = 0; j < 11; j++) {
        var m = 3 + Math.round(j * 0.6), y = py - 7 + j;
        ret(ctx, cx - m - 1, y, 2 * m + 3, 1, K); ret(ctx, cx - m, y, 2 * m + 1, 1, VERM);
        ret(ctx, cx - m, y, 1, 1, LUZ);
        if (j > 1 && j < 9) for (var i = -m + 2; i < m; i += 3) ret(ctx, cx + i, y, 1, 1, PREGA);
        if (j >= 9) for (var f = -m; f <= m; f += 2) ret(ctx, cx + f, y, 1, 1, [C.ouro, C.verde, C.azul][((f + m) >> 1) % 3]);
      }
      for (var h = -9; h <= 9; h += 2) ret(ctx, cx + h, py + 4, 1, 1, K);                       // babado da barra
    } });
  I.objeto('museu-fitas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 8, py + 8, 4, K); circulo(ctx, px + 8, py + 8, 3, C.ouro);
      var cs = [C.vermelho, C.ouro, C.verde, C.azul, C.rosa, C.lilas, C.laranja];
      for (var i = 0; i < 7; i++) {
        var x = px + 2 + i * 2, comp = 12 + (i % 3) * 3;
        ret(ctx, x, py + 10, 1, comp, cs[i]);
        ret(ctx, x + (i % 2), py + 10 + comp, 1, 1, cs[i]);
      }
    } });
  I.objeto('museu-quadrinhas', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 4, K); ret(ctx, cx - 4, py + 12, 9, 2, '#c9a8ff');
      ret(ctx, cx - 2, py - 3, 5, 15, K); ret(ctx, cx - 1, py - 3, 3, 14, '#e8dcff');
      ret(ctx, cx - 7, py - 5, 15, 3, K); ret(ctx, cx - 6, py - 4, 13, 1, '#b58cff');
      // caderno aberto com as quadrinhas e um coração
      ret(ctx, cx - 7, py - 12, 15, 8, K);
      ret(ctx, cx - 6, py - 11, 6, 6, C.branco); ret(ctx, cx + 1, py - 11, 6, 6, C.branco);
      ret(ctx, cx, py - 11, 1, 7, C.rosa);
      for (var j = 0; j < 3; j++) { ret(ctx, cx - 5, py - 10 + j * 2, 4, 1, '#9fcfff'); ret(ctx, cx + 2, py - 10 + j * 2, 4, 1, '#9fcfff'); }
      ret(ctx, cx + 4, py - 7, 1, 1, C.vermelho); ret(ctx, cx + 3, py - 8, 1, 1, C.vermelho); ret(ctx, cx + 5, py - 8, 1, 1, C.vermelho);
    } });
  I.objeto('museu-brinquedos', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // bancada
      ret(ctx, px + 1, py - 1, 30, 5, K); ret(ctx, px + 2, py, 28, 3, '#e8b27a'); ret(ctx, px + 2, py, 28, 1, '#ffd9a8');
      ret(ctx, px + 2, py + 4, 28, 10, K); ret(ctx, px + 3, py + 5, 26, 8, C.madeira2);
      ret(ctx, px + 4, py + 6, 11, 6, C.madeira3); ret(ctx, px + 17, py + 6, 11, 6, C.madeira3);
      ret(ctx, px + 9, py + 8, 2, 1, C.ouro); ret(ctx, px + 22, py + 8, 2, 1, C.ouro);
      // pião
      triangulo(ctx, px + 3, py - 6, 9, 5, K); ret(ctx, px + 4, py - 9, 7, 4, K);
      ret(ctx, px + 5, py - 8, 5, 3, C.vermelho); ret(ctx, px + 5, py - 7, 5, 1, C.ouro); ret(ctx, px + 7, py - 3, 1, 2, K);
      ret(ctx, px + 7, py - 11, 1, 2, K);
      // boneca de pano
      circulo(ctx, px + 16, py - 12, 3, K); circulo(ctx, px + 16, py - 12, 2, '#ffe0c7');
      ret(ctx, px + 13, py - 15, 2, 5, '#ffb020'); ret(ctx, px + 18, py - 15, 2, 5, '#ffb020');
      ret(ctx, px + 13, py - 9, 7, 8, K); ret(ctx, px + 14, py - 8, 5, 7, C.lilas); ret(ctx, px + 15, py - 6, 1, 1, C.branco);
      ret(ctx, px + 15, py - 12, 1, 1, K); ret(ctx, px + 17, py - 12, 1, 1, K);
      // carrinho de lata
      ret(ctx, px + 21, py - 8, 10, 5, K); ret(ctx, px + 22, py - 7, 8, 3, C.azul);
      ret(ctx, px + 23, py - 10, 5, 3, K); ret(ctx, px + 24, py - 9, 3, 1, C.azul2);
      circulo(ctx, px + 23, py - 2, 1, K); circulo(ctx, px + 28, py - 2, 1, K);
    } });
  I.objeto('museu-almofada-roda', { w: 3, h: 3, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24, cy = py + 24;
      elipse(ctx, cx, cy, 20, 18, '#e0a060'); elipse(ctx, cx, cy, 18, 16, '#f5c27a');
      elipse(ctx, cx, cy, 10, 8, '#e0a060'); elipse(ctx, cx, cy, 8, 6, '#ffd9a0');
      var cs = [C.vermelho, C.ouro, C.verde, C.laranja, C.rosa, C.azul];
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2, x = Math.round(cx + Math.cos(a) * 15), y = Math.round(cy + Math.sin(a) * 13);
        ret(ctx, x - 4, y - 3, 9, 7, K); ret(ctx, x - 3, y - 2, 7, 5, cs[i]); ret(ctx, x - 3, y - 2, 7, 1, C.branco);
      }
    } });
  I.objeto('museu-vela', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, C.ouro2);
      ret(ctx, cx - 1, py - 2, 3, 14, K); ret(ctx, cx, py - 2, 1, 13, C.ouro);
      ret(ctx, cx - 4, py - 3, 9, 2, K); ret(ctx, cx - 3, py - 3, 7, 1, C.ouro3);
      ret(ctx, cx - 1, py - 9, 3, 6, K); ret(ctx, cx, py - 8, 1, 5, C.creme);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, h = 3 + Math.round(Math.sin(t / 140) * 1);
      ret(ctx, cx, py - 9 - h, 1, h, C.laranja); ret(ctx, cx, py - 10 - h, 1, 1, C.ouro3);
      elipse(ctx, cx, py - 11, 3, 3, 'rgba(255,210,120,0.18)');
    } });

})();
