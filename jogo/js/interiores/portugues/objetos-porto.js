/* Casa das Palavras, parte 3 de 6: os objetos do Porto da Expedição (iceberg, barco, pinguins, focas...).
   Usa portugues/objetos-hall-cozinha.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.portugues;
  var VERM = S.VERM, VERM2 = S.VERM2, LARANJA = S.LARANJA, GELO = S.GELO, GELO2 = S.GELO2, GELO3 = S.GELO3,
      MAR = S.MAR, MAR2 = S.MAR2, MAR3 = S.MAR3, nuvemNeve = S.nuvemNeve, mesinha = S.mesinha;

  /* ================= PORTO DA EXPEDIÇÃO ================= */
  // tanque de vidro: a pontinha do iceberg fora da água e a maior parte embaixo
  I.objeto('portugues-iceberg', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, nivel = py - 6;
      var FUNDO = '#1f6f96', FUNDO2 = '#2a88b4', GELOF = '#56c3de', GELOF2 = '#8fe0f0', CONT = '#12506e';
      // base de madeira do tanque
      ret(ctx, px + 2, py + 8, 28, 7, K); ret(ctx, px + 3, py + 9, 26, 5, C.madeira2); ret(ctx, px + 3, py + 9, 26, 1, C.madeiraClara);
      ret(ctx, px + 5, py + 11, 22, 1, C.madeira3);
      // vidro: ar em cima, água funda embaixo
      ret(ctx, px + 1, py - 17, 30, 26, K);
      ret(ctx, px + 2, py - 16, 28, nivel - py + 16, '#eef9ff');
      ret(ctx, px + 2, nivel, 28, py + 8 - nivel, FUNDO2);
      for (var a = nivel + 4; a < py + 8; a += 4) ret(ctx, px + 2, a, 28, 2, FUNDO);
      // a parte escondida: bem MAIOR, embaixo d'água, com contorno
      var fundo = [[0, 7], [1, 9], [2, 10], [3, 11], [4, 12], [5, 12], [6, 12], [7, 11], [8, 11], [9, 10], [10, 9], [11, 8], [12, 6], [13, 4]];
      fundo.forEach(function (f) { var y = nivel + 1 + f[0], m = f[1], d = f[0] % 4 === 1 ? 1 : 0; ret(ctx, cx - m - 1 + d, y, m * 2 + 2 - d, 1, CONT); });
      fundo.forEach(function (f) { var y = nivel + 1 + f[0], m = f[1] - 1, d = f[0] % 4 === 1 ? 1 : 0; if (m > 0) ret(ctx, cx - m + d, y, m * 2 - d, 1, GELOF); });
      for (var k = 1; k < 12; k++) ret(ctx, cx - (fundo[k][1] - 2), nivel + 1 + k, 2, 1, GELOF2);
      [[3, 3], [6, 5], [9, 2]].forEach(function (r) { ret(ctx, cx + r[0] - 2, nivel + r[1] + 2, 3, 1, '#3aa6c8'); });
      // a pontinha (pequena) fora d'água: branca, com a sombra azul-clara do lado direito
      triangulo(ctx, cx - 6, nivel - 9, 12, 10, K);
      triangulo(ctx, cx - 5, nivel - 8, 10, 9, C.branco);
      for (var j = 0; j < 8; j++) { var mm = Math.round((j + 1) * 5 / 9); ret(ctx, cx + 1, nivel - 7 + j, Math.max(1, mm - 1), 1, GELO2); }
      ret(ctx, cx - 1, nivel - 6, 1, 3, GELO);
      // linha d'água com espuma
      ret(ctx, px + 2, nivel, 28, 1, '#8fd0f5');
      for (var e = px + 3; e < px + 29; e += 3) ret(ctx, e, nivel, 2, 1, C.branco);
      ret(ctx, cx - 8, nivel + 1, 3, 1, C.branco); ret(ctx, cx + 6, nivel + 1, 3, 1, C.branco);
      // brilho do vidro
      ret(ctx, px + 3, py - 15, 1, 21, 'rgba(255,255,255,0.75)'); ret(ctx, px + 5, py - 15, 1, 6, 'rgba(255,255,255,0.6)');
      // bolhinhas
      ret(ctx, px + 25, py + 1, 1, 1, '#bfe9ff'); ret(ctx, px + 26, py - 2, 2, 2, '#bfe9ff');
      // tampa do tanque
      ret(ctx, px, py - 18, 32, 2, K); ret(ctx, px + 1, py - 18, 30, 1, '#5a6a84');
    } });
  I.objeto('portugues-barco', { w: 3, h: 2, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // água do cais: só no lugar do barco (da parede até o fim da fileira dele), com a borda de pedra
      ret(ctx, px, py + 1, 48, 27, K); ret(ctx, px + 1, py + 1, 46, 26, MAR2); ret(ctx, px + 1, py + 1, 46, 3, '#23649e');
      ret(ctx, px + 1, py + 16, 46, 11, MAR);
      for (var w = 0; w < 6; w++) { ret(ctx, px + 3 + w * 8, py + 6 + (w % 2) * 4, 4, 1, MAR); ret(ctx, px + 2 + w * 8, py + 23 + (w % 2) * 2, 4, 1, MAR3); }
      ret(ctx, px + 2, py + 21, 5, 1, C.branco); ret(ctx, px + 41, py + 21, 5, 1, C.branco);
      // borda do cais: pedras com a luz em cima
      ret(ctx, px, py + 27, 48, 5, K);
      for (var pd = 0; pd < 8; pd++) { var pxp = px + 1 + pd * 6; ret(ctx, pxp, py + 28, 5, 3, pd % 2 ? '#b8b0c8' : '#c9c2d8'); ret(ctx, pxp, py + 28, 5, 1, '#e4e0ee'); }

      // casco vermelho com faixa branca
      ret(ctx, px + 3, py + 8, 42, 14, K);
      ret(ctx, px + 4, py + 9, 40, 12, VERM); ret(ctx, px + 4, py + 9, 40, 2, C.branco); ret(ctx, px + 4, py + 17, 40, 4, VERM2);
      for (var i = 0; i < 4; i++) { circulo(ctx, px + 12 + i * 8, py + 14, 2, K); circulo(ctx, px + 12 + i * 8, py + 14, 1, '#bfe9ff'); }
      triangulo(ctx, px + 40, py + 8, 10, 14, K); ret(ctx, px + 44, py + 9, 2, 10, VERM);
      // cabine e mastro com a bandeirinha da expedição
      ret(ctx, px + 10, py - 4, 18, 13, K); ret(ctx, px + 11, py - 3, 16, 11, C.branco);
      ret(ctx, px + 13, py - 1, 4, 3, '#9fdcff'); ret(ctx, px + 20, py - 1, 4, 3, '#9fdcff');
      ret(ctx, px + 9, py - 6, 20, 3, K); ret(ctx, px + 10, py - 5, 18, 1, '#5fb4ff');
      ret(ctx, px + 34, py - 18, 2, 27, K); ret(ctx, px + 36, py - 17, 8, 6, K); ret(ctx, px + 37, py - 16, 6, 4, '#ffd34d');
      ret(ctx, px + 39, py - 15, 2, 2, VERM);
      ret(ctx, px + 20, py - 12, 4, 7, K); ret(ctx, px + 21, py - 11, 2, 6, '#ffd34d');
    } });
  I.objeto('portugues-pinguins', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 8, 3, K); elipse(ctx, px + 8, py + 13, 7, 2, GELO);
      function pinguim(cx, yb, alt) {
        elipse(ctx, cx, yb - alt / 2, 3, alt / 2, K); elipse(ctx, cx, yb - alt / 2 + 1, 2, alt / 2 - 1, C.branco);
        ret(ctx, cx - 3, yb - alt, 7, 3, K); ret(ctx, cx - 1, yb - alt + 1, 1, 1, C.branco); ret(ctx, cx + 1, yb - alt + 1, 1, 1, C.branco);
        ret(ctx, cx, yb - alt + 2, 1, 1, LARANJA); ret(ctx, cx - 2, yb, 2, 1, LARANJA); ret(ctx, cx + 1, yb, 2, 1, LARANJA);
      }
      pinguim(px + 4, py + 13, 12); pinguim(px + 12, py + 13, 14); pinguim(px + 8, py + 15, 9);
    } });
  var FOCA_DEITADA = [
    '............kkk...',
    '...........kpppk..',
    '..........kppwkpk.',
    '....kkkkkkkppppppk',
    '...kppppppppplllnk',
    '..kpppppppppllllk.',
    'kkpppppplllllllk..',
    'kdkplllllllllkk...',
    'k.kkkkkdddkkk.....',
  ];
  var FOCA_ERGUIDA = [
    '...kkk........',
    '..kpppk.......',
    '.kpkwpk.......',
    'knplppk.......',
    '.kllppk.......',
    '..kllpk.......',
    '..kllppkkkk...',
    '..kllpppppppk.',
    '.kllllpppppdpk',
    '.kllllllpppkdk',
    'kdkkllllllkk.k',
    'k..kkkkkkk....',
  ];
  I.objeto('portugues-focas', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      // placa de gelo com duas focas: uma deitada e outra de cabeça levantada
      elipse(ctx, px + 16, py + 12, 16, 4, K); elipse(ctx, px + 16, py + 12, 15, 3, GELO); ret(ctx, px + 5, py + 14, 22, 1, GELO2);
      ret(ctx, px + 3, py + 11, 4, 1, C.branco); ret(ctx, px + 26, py + 13, 3, 1, C.branco);
      var pal = { k: K, p: '#7f8aa3', d: '#56607a', l: '#dfe5ef', w: C.branco, n: '#2a1e34' };
      function espelho(m) { return m.map(function (l) { return l.split('').reverse().join(''); }); }
      // costas com costas: a deitada olha para a esquerda e a de cabeça erguida para a direita
      D.matriz(ctx, px, py + 4, espelho(FOCA_DEITADA), pal);
      D.matriz(ctx, px + 18, py + 1, espelho(FOCA_ERGUIDA), pal);
      // luz no lombo e bigodinhos
      ret(ctx, px + 9, py + 8, 5, 1, '#a3adc2'); ret(ctx, px + 21, py + 8, 4, 1, '#a3adc2');
      ret(ctx, px - 1, py + 7, 1, 1, '#4a4058'); ret(ctx, px - 2, py + 9, 2, 1, '#4a4058'); ret(ctx, px - 1, py + 8, 1, 1, '#4a4058');
      ret(ctx, px + 32, py + 3, 1, 1, '#4a4058'); ret(ctx, px + 32, py + 5, 2, 1, '#4a4058'); ret(ctx, px + 32, py + 4, 1, 1, '#4a4058');
    } });
  // albatroz em pé no chão do cais, de frente, com as asas bem abertas (pontas escuras) e o bico de lado
  var ALBATROZ = [
    '........kkk.........',
    '.......kwwwk........',
    '.......kgkwkkkkk....',
    '.......kwwwkyyyyk...',
    '........kwwkkkkok...',
    '.kkkkkkkkwwkkkkkkkk.',
    'kppdddddgwwgdddddppk',
    'kpppddddwwwwddddpppk',
    '.kppwwwwwwwwwwwwppk.',
    '..kkkkkwwwwwwkkkkk..',
    '......kwwwwwwk......',
    '......kgwwwwgk......',
    '.......kgwwgk.......',
    '........kddk........',
    '.......kr..rk.......',
    '......rrr..rrr......',
  ];
  I.objeto('portugues-albatroz', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // o sprite de um móvel alto só tem 2 px de folga de cada lado: 20 px de ponta a ponta de asa
      D.matriz(ctx, px - 2, py - 1, ALBATROZ, { k: K, w: C.branco, g: '#d6dbe8', d: '#4e4a62', p: '#241f33', y: '#ffd08a', o: '#e07a6a', r: '#ff8fa8' });
      ret(ctx, px + 5, py + 6, 2, 1, '#6e6a84'); ret(ctx, px + 9, py + 6, 2, 1, '#6e6a84');
    } });
  // lampião de navio: gaiola de latão com vidro e a chama, pendurado num suporte
  I.objeto('portugues-lampiao', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, LATAO = '#d9a441', LATAO2 = '#a8742a';
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 1, LATAO);
      ret(ctx, cx - 1, py - 8, 3, 21, K); ret(ctx, cx, py - 8, 1, 20, '#5a6a84');
      ret(ctx, cx - 1, py - 10, 7, 3, K); ret(ctx, cx, py - 9, 5, 1, '#5a6a84'); ret(ctx, cx + 4, py - 8, 1, 3, K);
      // lampião
      ret(ctx, cx + 1, py - 5, 7, 2, K); ret(ctx, cx + 2, py - 5, 5, 1, LATAO);
      ret(ctx, cx + 1, py - 3, 7, 9, K); ret(ctx, cx + 2, py - 2, 5, 7, '#fff3c0');
      ret(ctx, cx + 3, py - 1, 3, 4, '#ffd34d'); ret(ctx, cx + 4, py, 1, 2, '#ff9d2e');
      ret(ctx, cx + 4, py - 3, 1, 9, LATAO2); ret(ctx, cx + 2, py + 1, 5, 1, LATAO2);
      ret(ctx, cx + 1, py + 6, 7, 2, K); ret(ctx, cx + 2, py + 6, 5, 1, LATAO);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 300) % 3;
      ret(ctx, px + 12, py - 1 + (f === 1 ? 1 : 0), 1, 1, f === 2 ? '#fff3a0' : '#ffb020');
    } });
  // leme de navio num pedestal (roda vazada: aro, oito raios e manoplas)
  I.objeto('portugues-leme', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 2;
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, C.madeira2); ret(ctx, cx - 3, py + 12, 7, 1, C.madeiraClara);
      ret(ctx, cx - 1, py + 6, 3, 6, K); ret(ctx, cx, py + 6, 1, 5, C.madeira);
      for (var dy = -9; dy <= 9; dy++) for (var dx = -9; dx <= 9; dx++) {
        var r = Math.sqrt(dx * dx + dy * dy), raio = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy), cor = null;
        if (r >= 3.9 && r <= 6.5) cor = (r < 4.3 || r > 5.7) ? K : (dy < 0 ? C.madeiraClara : C.madeira);
        else if (raio && r < 3.9 && r > 2.2) cor = C.madeira3;
        else if (raio && r > 6.5 && r <= 7.5) cor = C.madeira2;
        else if (r <= 2.2) cor = r > 1.5 ? K : '#d9a441';
        if (cor) ret(ctx, cx + dx, cy + dy, 1, 1, cor);
      }
      // manoplas nas pontas dos raios
      [[0, -8], [0, 8], [-8, 0], [8, 0], [-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(function (m) {
        ret(ctx, cx + m[0] - 1, cy + m[1] - 1, 3, 3, K); ret(ctx, cx + m[0], cy + m[1], 1, 1, C.madeiraClara);
      });
    } });
  I.objeto('portugues-diario', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py - 1, '#9fcfff');
      // diário aberto com lápis e bússola
      ret(ctx, cx - 7, py - 8, 15, 8, K); ret(ctx, cx - 6, py - 7, 6, 6, C.creme); ret(ctx, cx + 1, py - 7, 6, 6, C.creme);
      ret(ctx, cx, py - 7, 1, 7, '#2f6fd6');
      for (var j = 0; j < 3; j++) { ret(ctx, cx - 5, py - 6 + j * 2, 4, 1, '#9fcfff'); ret(ctx, cx + 2, py - 6 + j * 2, 4, 1, '#9fcfff'); }
      ret(ctx, cx + 3, py - 12, 1, 5, K); ret(ctx, cx + 3, py - 11, 1, 3, '#ffd34d');
      circulo(ctx, cx - 4, py - 11, 2, K); circulo(ctx, cx - 4, py - 11, 1, C.ouro3); ret(ctx, cx - 4, py - 12, 1, 1, VERM);
    } });
  I.objeto('portugues-boia', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 17;
      ret(ctx, cx, py + 5, 1, 4, K);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, C.branco); circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, '#dcc8b0');
      ret(ctx, cx - 6, cy - 1, 3, 3, VERM); ret(ctx, cx + 4, cy - 1, 3, 3, VERM); ret(ctx, cx - 1, cy - 6, 3, 3, VERM); ret(ctx, cx - 1, cy + 4, 3, 3, VERM);
    } });
  I.objeto('portugues-bandeira', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      // bandeira da expedição: azul com o floquinho de neve
      ret(ctx, px + 3, py + 4, 1, 24, K);
      ret(ctx, px + 4, py + 6, 11, 9, K); ret(ctx, px + 5, py + 7, 9, 7, '#2f6fd6');
      ret(ctx, px + 9, py + 8, 1, 5, C.branco); ret(ctx, px + 7, py + 10, 5, 1, C.branco);
      ret(ctx, px + 7, py + 8, 1, 1, C.branco); ret(ctx, px + 11, py + 8, 1, 1, C.branco); ret(ctx, px + 7, py + 12, 1, 1, C.branco); ret(ctx, px + 11, py + 12, 1, 1, C.branco);
      circulo(ctx, px + 3, py + 4, 1, C.ouro);
    } });
  // placa de gelo pintada no chão, com rachaduras e montinhos de neve
  I.objeto('portugues-gelo', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 2) * 16, cx = px + W / 2, cy = py + H / 2;
      elipse(ctx, cx, cy, W / 2 - 1, H / 2 - 1, GELO3); elipse(ctx, cx, cy, W / 2 - 2, H / 2 - 2, GELO); elipse(ctx, cx - 3, cy - 2, W / 2 - 8, H / 2 - 6, '#f6fcff');
      [[-12, -3, 7], [4, 4, 6], [10, -6, 4]].forEach(function (r) { for (var i = 0; i < r[2]; i++) ret(ctx, cx + r[0] + i, cy + r[1] + (i % 3 === 1 ? 1 : 0), 1, 1, GELO2); });
      nuvemNeve(ctx, cx - 16, cy + 6, 6); nuvemNeve(ctx, cx + 12, cy + 7, 5);
    } });
  I.objeto('portugues-ancora', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx, py - 5, 3, K); circulo(ctx, cx, py - 5, 1, '#e9e0cf');
      ret(ctx, cx - 1, py - 2, 3, 14, K); ret(ctx, cx, py - 2, 1, 13, '#5a6a84');
      ret(ctx, cx - 5, py + 1, 11, 3, K); ret(ctx, cx - 4, py + 2, 9, 1, '#5a6a84');
      for (var i = 0; i < 6; i++) { ret(ctx, cx - 7 + i, py + 8 + Math.round(i * 0.8), 2, 2, K); ret(ctx, cx + 6 - i, py + 8 + Math.round(i * 0.8), 2, 2, K); }
      ret(ctx, cx - 8, py + 6, 2, 3, K); ret(ctx, cx + 7, py + 6, 2, 3, K);
    } });
  I.objeto('portugues-cordas', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, K); elipse(ctx, px + 8, py + 10, 6, 3, '#e8c98a');
      elipse(ctx, px + 8, py + 9, 4, 2, '#c9a060'); elipse(ctx, px + 8, py + 9, 2, 1, '#e8c98a'); ret(ctx, px + 8, py + 9, 1, 1, K);
      ret(ctx, px + 13, py + 11, 3, 1, '#c9a060');
    } });

})();
