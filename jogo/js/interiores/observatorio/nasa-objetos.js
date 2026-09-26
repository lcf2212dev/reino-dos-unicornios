/* Observatório, 2º andar (NASA), parte 1 de 3: o letreiro NASA (letras próprias do jogo, não o logotipo),
   telões, painéis, consoles, torre de lançamento e móveis de alta tecnologia (prefixo nasa-).
   Usa observatorio/ceu.js. Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var S = R._predios.observatorio;
  var v = S.v, tempo = S.tempo;

  // cores do andar: branco, cinza e azul, com vermelho nos foguetes
  var N = S.NASA = {
    branco: '#f4f6fb', cinza: '#c8d0e0', cinza2: '#9aa4bc', cinza3: '#6a7390', azul: '#2f5fd6', azul2: '#1f3a8a',
    marinho: '#16204f', tela: '#0f1a3a', ciano: '#6fd6ff', vermelho: '#e0433f', verde: '#6fdc8c', amarelo: '#ffd34d',
  };

  /* ---------- letras próprias (5×7), para escrever NASA ---------- */
  var LETRAS = {
    N: ['X...X', 'XX..X', 'X.X.X', 'X.X.X', 'X..XX', 'X...X', 'X...X'],
    A: ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
    S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  };
  // escreve a palavra em pixels de tamanho p (sombra embaixo); vertical = uma letra embaixo da outra
  function escrever(ctx, x, y, palavra, p, cor, sombra, vertical) {
    for (var n = 0; n < palavra.length; n++) {
      var L = LETRAS[palavra[n]];
      if (!L) continue;
      var ox = vertical ? x : x + n * (5 * p + p + 1), oy = vertical ? y + n * (7 * p + 2) : y;
      for (var j = 0; j < 7; j++) for (var i = 0; i < 5; i++) {
        if (L[j][i] !== 'X') continue;
        if (sombra) ret(ctx, ox + i * p, oy + j * p + p, p, p, sombra);
        ret(ctx, ox + i * p, oy + j * p, p, p, cor);
      }
    }
  }
  S.escreverNasa = escrever;

  function luzes(ctx, x, y, n, t, fase) {
    var cores = [N.verde, N.amarelo, N.vermelho, N.ciano];
    for (var i = 0; i < n; i++) {
      var on = !t || (Math.floor(t / 400) + i * 3 + (fase || 0)) % 4 !== 0;
      ret(ctx, x + i * 3, y, 2, 2, on ? cores[(i + (fase || 0)) % 4] : '#2a3050');
    }
  }
  function estrelinhas(ctx, x, y, w, h, n, semente) {
    for (var i = 0; i < n; i++) {
      var sx = x + ((semente * 7 + i * 37) % w), sy = y + ((semente * 3 + i * 23) % h);
      ret(ctx, sx, sy, 1, 1, i % 3 ? '#ffffff' : N.ciano);
    }
  }

  /* ---------- parede ---------- */
  // letreiro grande: NASA em letras brancas num painel azul, com faixa vermelha e estrelas
  I.objeto('nasa-letreiro', { w: 4, h: 2, parede: true,
    desenhar: function (ctx, px, py) {
      var w = 64;
      ret(ctx, px + 1, py + 3, w - 2, 26, K); ret(ctx, px + 2, py + 4, w - 4, 24, N.azul2);
      ret(ctx, px + 2, py + 4, w - 4, 2, N.azul); ret(ctx, px + 2, py + 24, w - 4, 4, N.marinho);
      estrelinhas(ctx, px + 3, py + 5, w - 6, 18, 9, 3);
      escrever(ctx, px + 6, py + 7, 'NASA', 2, N.branco, N.marinho);
      ret(ctx, px + 4, py + 24, w - 8, 2, N.vermelho);
      // parafusos
      ret(ctx, px + 3, py + 5, 1, 1, N.cinza); ret(ctx, px + w - 4, py + 5, 1, 1, N.cinza);
    } });
  // telão: var.tela = 'terra' | 'trajetoria' | 'foguete' | 'marte'
  I.objeto('nasa-telao', { w: 3, h: 2, parede: true,
    desenhar: function (ctx, px, py, o) {
      ret(ctx, px + 1, py + 2, 46, 26, K); ret(ctx, px + 2, py + 3, 44, 24, N.cinza2);
      ret(ctx, px + 4, py + 5, 40, 20, N.tela);
      estrelinhas(ctx, px + 4, py + 5, 40, 20, 8, px % 7);
      var tela = v(o, 'tela', 'terra'), cx = px + 24, cy = py + 15;
      if (tela === 'terra') {
        circulo(ctx, cx, cy, 8, N.azul); ret(ctx, cx - 4, cy - 4, 4, 3, N.verde); ret(ctx, cx + 1, cy + 1, 5, 4, N.verde);
        ret(ctx, cx - 5, cy - 6, 3, 1, '#ffffff'); ret(ctx, cx + 2, cy - 3, 3, 1, '#ffffff');
      } else if (tela === 'trajetoria') {
        circulo(ctx, px + 10, cy + 3, 4, N.azul); ret(ctx, px + 9, cy + 2, 2, 2, N.verde);
        circulo(ctx, px + 38, cy - 4, 3, '#e6e6f0');
        for (var i = 0; i < 9; i++) ret(ctx, px + 14 + i * 3, cy + 1 - Math.round(Math.sin(i / 8 * Math.PI) * 6) - Math.round(i * 0.6), 1, 1, N.amarelo);
      } else if (tela === 'foguete') {
        ret(ctx, cx - 2, cy - 8, 5, 15, N.ciano); ret(ctx, cx - 1, cy - 7, 3, 13, N.tela);
        triangulo(ctx, cx - 2, cy - 12, 5, 4, N.ciano); ret(ctx, cx - 5, cy + 3, 3, 4, N.ciano); ret(ctx, cx + 3, cy + 3, 3, 4, N.ciano);
        for (var k = 0; k < 4; k++) ret(ctx, px + 7, py + 8 + k * 4, 8 - k, 1, N.verde);
        for (var q = 0; q < 4; q++) ret(ctx, px + 34, py + 8 + q * 4, 6, 1, q % 2 ? N.amarelo : N.ciano);
      } else {
        circulo(ctx, cx, cy, 8, '#d0603a'); ret(ctx, cx - 3, cy - 4, 4, 2, '#a8452a'); ret(ctx, cx + 2, cy + 2, 3, 2, '#f08a5a');
        ret(ctx, cx - 5, cy - 7, 3, 1, '#ffd0b0');
      }
      ret(ctx, px + 2, py + 27, 44, 1, N.cinza3);
    },
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var tela = v(o, 'tela', 'terra'), cy = py + 15;
      if (tela === 'trajetoria') {
        // a navezinha andando da Terra até a Lua
        var f = t ? (t / 3000) % 1 : 0.5, i = f * 8;
        ret(ctx, px + 14 + Math.round(i * 3) - 1, cy - Math.round(Math.sin(i / 8 * Math.PI) * 6) - Math.round(i * 0.6), 3, 2, '#ffffff');
      }
      // luzinha de gravando no canto
      ret(ctx, px + 41, py + 6, 2, 2, !t || Math.floor(t / 700) % 2 ? N.vermelho : '#5a1a1a');
    } });
  // relógio da missão (números de luz)
  I.objeto('nasa-relogio', { w: 2, h: 2, parede: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 8, 26, 14, K); ret(ctx, px + 4, py + 9, 24, 12, N.tela);
      // 10:00 em blocos
      ret(ctx, px + 6, py + 11, 1, 7, N.vermelho); ret(ctx, px + 9, py + 11, 4, 1, N.vermelho); ret(ctx, px + 9, py + 17, 4, 1, N.vermelho);
      ret(ctx, px + 9, py + 11, 1, 7, N.vermelho); ret(ctx, px + 12, py + 11, 1, 7, N.vermelho);
      ret(ctx, px + 15, py + 13, 1, 1, N.vermelho); ret(ctx, px + 15, py + 16, 1, 1, N.vermelho);
      ret(ctx, px + 18, py + 11, 4, 1, N.vermelho); ret(ctx, px + 18, py + 17, 4, 1, N.vermelho);
      ret(ctx, px + 18, py + 11, 1, 7, N.vermelho); ret(ctx, px + 21, py + 11, 1, 7, N.vermelho);
      ret(ctx, px + 24, py + 11, 2, 7, '#5a1a1a');
    } });
  // painel de luzes na parede
  I.objeto('nasa-painel', { w: 1, h: 2, parede: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 14, 20, K); ret(ctx, px + 2, py + 7, 12, 18, N.cinza);
      ret(ctx, px + 3, py + 8, 10, 6, N.tela); ret(ctx, px + 4, py + 10, 6, 1, N.verde); ret(ctx, px + 4, py + 12, 4, 1, N.ciano);
      ret(ctx, px + 3, py + 22, 10, 1, N.cinza3);
    },
    anim: function (ctx, px, py, t) { luzes(ctx, px + 3, py + 17, 4, tempo(t), px % 3); } });
  // maquete de satélite pendurada
  I.objeto('nasa-satelite', { w: 2, h: 2, parede: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 15, py + 2, 1, 8, N.cinza3);
      ret(ctx, px + 2, py + 12, 10, 8, K); ret(ctx, px + 3, py + 13, 8, 6, N.azul); ret(ctx, px + 4, py + 15, 6, 1, N.ciano);
      ret(ctx, px + 20, py + 12, 10, 8, K); ret(ctx, px + 21, py + 13, 8, 6, N.azul); ret(ctx, px + 22, py + 15, 6, 1, N.ciano);
      ret(ctx, px + 11, py + 15, 10, 2, K);
      ret(ctx, px + 12, py + 9, 8, 12, K); ret(ctx, px + 13, py + 10, 6, 10, N.amarelo); ret(ctx, px + 13, py + 10, 2, 10, '#fff3a0');
      circulo(ctx, px + 16, py + 24, 3, K); circulo(ctx, px + 16, py + 24, 2, N.branco);
    } });
  // cartaz de missão (desenho de foguete, lua ou planeta)
  I.objeto('nasa-cartaz', { w: 1, h: 2, parede: true,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'lua');
      ret(ctx, px + 1, py + 4, 14, 20, K); ret(ctx, px + 2, py + 5, 12, 18, N.marinho);
      estrelinhas(ctx, px + 2, py + 5, 12, 12, 4, px % 5);
      if (d === 'lua') { circulo(ctx, px + 8, py + 12, 4, '#e6e6f0'); ret(ctx, px + 6, py + 11, 2, 1, '#b8b8c8'); }
      else if (d === 'foguete') { ret(ctx, px + 7, py + 9, 3, 8, N.branco); triangulo(ctx, px + 7, py + 6, 3, 3, N.vermelho); ret(ctx, px + 6, py + 15, 1, 2, N.vermelho); ret(ctx, px + 10, py + 15, 1, 2, N.vermelho); }
      else { circulo(ctx, px + 8, py + 12, 4, '#d0603a'); ret(ctx, px + 4, py + 12, 9, 1, '#ffd0b0'); }
      ret(ctx, px + 3, py + 19, 10, 2, N.vermelho); ret(ctx, px + 4, py + 19, 3, 1, N.branco);
    } });

  /* ---------- chão ---------- */
  // console de controle com telinhas e botões
  I.objeto('nasa-console', { w: 3, h: 2, solido: true,
    desenhar: function (ctx, px, py) {
      var w = 48;
      ret(ctx, px + 1, py + 2, w - 2, 12, K); ret(ctx, px + 2, py + 3, w - 4, 10, N.cinza2);
      for (var i = 0; i < 3; i++) {
        ret(ctx, px + 4 + i * 15, py + 4, 12, 8, K); ret(ctx, px + 5 + i * 15, py + 5, 10, 6, N.tela);
        ret(ctx, px + 6 + i * 15, py + 7, 6 - i, 1, i === 1 ? N.ciano : N.verde); ret(ctx, px + 6 + i * 15, py + 9, 4, 1, N.amarelo);
      }
      ret(ctx, px + 1, py + 13, w - 2, 16, K); ret(ctx, px + 2, py + 14, w - 4, 14, N.branco);
      ret(ctx, px + 2, py + 14, w - 4, 4, N.cinza); ret(ctx, px + 2, py + 26, w - 4, 2, N.cinza2);
      ret(ctx, px + 20, py + 20, 8, 3, N.azul);
    },
    anim: function (ctx, px, py, t) { luzes(ctx, px + 5, py + 15, 5, tempo(t), 0); luzes(ctx, px + 30, py + 15, 4, tempo(t), 2); } });
  // cadeira giratória
  I.objeto('nasa-cadeira', { w: 1, h: 1, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 13, 10, 2, K); ret(ctx, px + 7, py + 9, 2, 5, K);
      ret(ctx, px + 3, py + 1, 10, 7, K); ret(ctx, px + 4, py + 2, 8, 5, N.azul);
      ret(ctx, px + 2, py + 7, 12, 4, K); ret(ctx, px + 3, py + 8, 10, 2, N.azul2);
    } });
  // torre de lançamento (treliça cinza e vermelha)
  I.objeto('nasa-torre', { w: 1, h: 1, topo: 78, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 78, 12, 92, K); ret(ctx, px + 3, py - 77, 10, 90, N.cinza3);
      for (var y = -76; y < 12; y += 8) {
        ret(ctx, px + 3, y + py, 10, 1, N.vermelho);
        for (var k = 0; k < 7; k++) ret(ctx, px + 4 + k, py + y + 1 + k, 1, 1, N.cinza);
      }
      ret(ctx, px + 13, py - 50, 4, 3, K); ret(ctx, px + 13, py - 49, 3, 1, N.cinza);
      ret(ctx, px + 6, py - 82, 3, 5, K); ret(ctx, px + 7, py - 81, 1, 3, N.vermelho);
    },
    anim: function (ctx, px, py, t) { ret(ctx, px + 7, py - 81, 1, 1, !tempo(t) || Math.floor(tempo(t) / 600) % 2 ? N.vermelho : '#ffb0a8'); } });
  // tanque de combustível
  I.objeto('nasa-tanque', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 12, 12, 26, K); ret(ctx, px + 3, py - 11, 10, 24, N.branco);
      ret(ctx, px + 3, py - 11, 3, 24, '#ffffff'); ret(ctx, px + 10, py - 11, 3, 24, N.cinza);
      ret(ctx, px + 3, py - 4, 10, 3, N.azul); ret(ctx, px + 5, py - 14, 6, 3, K); ret(ctx, px + 6, py - 13, 4, 1, N.cinza2);
    } });
  // caixa de equipamento com faixas
  I.objeto('nasa-caixa', { w: 1, h: 1, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 14, 12, K); ret(ctx, px + 2, py + 3, 12, 10, N.cinza);
      ret(ctx, px + 2, py + 3, 12, 2, N.branco);
      for (var i = 0; i < 4; i++) ret(ctx, px + 2 + i * 3, py + 10, 2, 3, i % 2 ? K : N.amarelo);
    } });
  // capacete de astronauta num pedestal
  I.objeto('nasa-capacete', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 6, 10, 8, K); ret(ctx, px + 4, py + 7, 8, 6, N.cinza2);
      circulo(ctx, px + 8, py - 1, 7, K); circulo(ctx, px + 8, py - 1, 6, N.branco);
      elipse(ctx, px + 8, py, 4, 3, N.azul2); ret(ctx, px + 6, py - 2, 2, 1, N.ciano);
    } });
  // computador numa mesinha
  I.objeto('nasa-computador', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 14, 3, K); ret(ctx, px + 2, py + 7, 12, 1, N.cinza);
      ret(ctx, px + 3, py + 9, 2, 5, K); ret(ctx, px + 11, py + 9, 2, 5, K);
      ret(ctx, px + 3, py - 6, 10, 10, K); ret(ctx, px + 4, py - 5, 8, 7, N.tela); ret(ctx, px + 7, py + 4, 2, 2, K);
      ret(ctx, px + 5, py - 3, 5, 1, N.verde); ret(ctx, px + 5, py - 1, 3, 1, N.ciano);
    } });
  // faixa de chão com NASA escrito (pintura no piso)
  I.objeto('nasa-piso-letreiro', { w: 4, h: 2, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 62, 28, N.marinho); ret(ctx, px + 2, py + 3, 60, 26, N.azul2); ret(ctx, px + 2, py + 3, 60, 1, N.azul);
      escrever(ctx, px + 8, py + 7, 'NASA', 2, N.branco, N.marinho);
      ret(ctx, px + 5, py + 24, 54, 2, N.vermelho);
      ret(ctx, px + 4, py + 5, 1, 1, N.amarelo); ret(ctx, px + 59, py + 5, 1, 1, N.amarelo);
    } });
})();
