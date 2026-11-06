/* O portal mágico (o do Bosque dos Fantasmas, ao lado da Minha Casa) em qualquer cor: as arenas (arenas.md) usam o
   mesmo desenho, com a cor do redemoinho de cada mapa.
     Reino.Portal.criar(cores?) → { desenhar(ctx, px, py), animar(ctx, px, py, w, h, t) }   o portal no mapa (1 × 1
       tile, disco chato no chão: aro, redemoinho em espiral, miolo e estrelinhas; o brilho animado com halo que pulsa,
       coluna de luz, faíscas subindo e estrelinhas piscando, só com Animações). Sem cores: as do Bosque (lilás e rosa).
     Reino.Portal.registrar(sprite, cores?)   põe o par em Mapa.PREDIOS[sprite] / Mapa.PREDIOS_ANIM[sprite] (no fora.js).
     Reino.Portal.saida(cores?) → fn(ctx, px, py)   o portal de volta dentro da arena (I.FUNDOS[id].saida): anel de
       pedrinhas com o redemoinho no meio.
   cores = { aro, aroLuz, aroSombra, fundo, braco, ponto, miolo, halo: [r, g, b], luz: [r, g, b], pulso: [4 cores],
             faisca: [4 cores], pedra: [escura, meio, clara], anel: [4 cores do redemoinho de volta, de fora para dentro] }
   (o que faltar vem do Bosque). Cores prontas na criação: nada de objeto ou string por quadro. node: true. */
(function () {
  var R = window.Reino, D = R.Desenho, K = D.K, ret = D.ret;
  var BOSQUE = { aro: '#b57cff', aroLuz: '#e8d6ff', aroSombra: '#8a5ad8', fundo: '#5a2fb0', braco: '#ff7ec0',
    ponto: '#ffc8e6', miolo: '#ffd0ea', halo: [220, 196, 255], luz: [255, 240, 252],
    pulso: ['#ffffff', '#ffe0f2', '#ffc8e6', '#ffe0f2'], faisca: ['#ffffff', '#ffe066', '#ff9ed2', '#c9a6ff'],
    pedra: ['#8a8a9c', '#b0b0c2', '#d4d4e0'], anel: ['#7a3fd0', '#b57cff', '#ff9ed2', '#ffd6ec'] };
  function comBosque(c) { var r = {}; Object.keys(BOSQUE).forEach(function (k) { r[k] = (c && c[k]) || BOSQUE[k]; }); return r; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  // disco em pixel: meia largura da fileira j (de -ry a ry), igual ao D.elipse, mas sem o "pino" de 1 px em j = ±ry
  function disco(ctx, cx, cy, rx, ry, cor) {
    ctx.fillStyle = cor;
    for (var j = -ry; j <= ry; j++) {
      var m = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 0.5) * (ry + 0.5)))) + 0.3);
      ctx.fillRect(cx - m, cy + j, m * 2 + 1, 1);
    }
  }
  // halo: o contorno de uma elipse (rx 10, ry 6) em retângulos [dx, dy, w, h] relativos ao miolo, montados uma vez
  var HALO_R = (function () {
    var rx = 10, ry = 6, j, x, lista = [], dentro = function (X, Y, a, b) { return (X * X) / (a * a) + (Y * Y) / (b * b) <= 1; };
    for (j = -ry; j <= ry; j++) {
      var x0 = null;
      for (x = -rx; x <= rx + 1; x++) {
        var anel = x <= rx && dentro(x, j, rx + 0.4, ry + 0.4) && !dentro(x, j, rx - 1.2, ry - 1.2);
        if (anel && x0 === null) x0 = x;
        if (!anel && x0 !== null) { lista.push([x0, j, x - x0, 1]); x0 = null; }
      }
    }
    // junta fileiras seguidas com o mesmo trecho (os lados viram retângulos altos)
    var fim = [];
    lista.forEach(function (r) {
      var u = fim[fim.length - 1];
      if (u && u[0] === r[0] && u[2] === r[2] && u[1] + u[3] === r[1]) u[3]++; else fim.push(r);
    });
    return fim;
  })();
  var ORBITA = [[3, 9], [4, 6], [8, 5], [12, 6], [13, 9], [12, 12], [8, 13], [4, 12]];   // no aro, relativo ao tile
  var ESTRELAS = [[1, 3], [14, 14]];
  var BRILHO = 'rgba(255,255,255,0.55)';

  function criar(cores) {
    var c = comBosque(cores);
    var HALO = [rgba(c.halo, 0.95), rgba(c.halo, 0.6), rgba(c.halo, 0.25), rgba(c.halo, 0.6)];
    var LUZ = [rgba(c.luz, 0.32), rgba(c.luz, 0.16)];
    function desenhar(ctx, px, py) {
      var cx = px + 8, cy = py + 9;
      disco(ctx, cx, cy + 1, 8, 5, 'rgba(58,36,70,0.22)');                    // sombra de chão, saindo por baixo do disco
      disco(ctx, cx, cy, 8, 5, K);
      disco(ctx, cx, cy, 7, 4, c.aro);                                         // aro
      ret(ctx, px + 4, py + 5, 5, 1, c.aroLuz); ret(ctx, px + 2, py + 6, 2, 1, c.aroLuz);   // luz em cima à esquerda
      ret(ctx, px + 9, py + 13, 4, 1, c.aroSombra);                            // sombra embaixo à direita
      disco(ctx, cx, cy, 5, 3, c.fundo);                                       // fundo do redemoinho
      ret(ctx, px + 4, py + 9, 3, 1, c.braco); ret(ctx, px + 5, py + 10, 3, 1, c.braco);   // braços em espiral
      ret(ctx, px + 9, py + 8, 3, 1, c.braco); ret(ctx, px + 8, py + 7, 3, 1, c.braco);
      ret(ctx, px + 11, py + 9, 1, 1, c.ponto); ret(ctx, px + 4, py + 8, 1, 1, c.ponto);
      disco(ctx, cx, cy, 2, 1, c.miolo);
      ret(ctx, cx - 1, cy, 2, 1, '#ffffff');                                   // miolo claro
      // estrelinhas em cruz no chão, nos cantos do tile
      [[1, 3, '#ffe066'], [14, 4, '#ffffff'], [14, 14, '#ffe066'], [1, 13, '#ffffff']].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], 1, 1, s[2]);
        ret(ctx, px + s[0] - 1, py + s[1], 1, 1, BRILHO); ret(ctx, px + s[0] + 1, py + s[1], 1, 1, BRILHO);
        ret(ctx, px + s[0], py + s[1] - 1, 1, 1, BRILHO); ret(ctx, px + s[0], py + s[1] + 1, 1, 1, BRILHO);
      });
    }
    function animar(ctx, px, py, w, h, t) {
      if (!t) return;
      var i, o, f, x, y, r, cx = px + 8, cy = py + 9, p = Math.floor(t / 300) % 4;
      ctx.fillStyle = HALO[p];                                                  // halo redondo pulsando por fora do aro
      for (i = 0; i < HALO_R.length; i++) { r = HALO_R[i]; ctx.fillRect(cx + r[0], cy + r[1], r[2], r[3]); }
      for (i = 0; i < 2; i++) { ctx.fillStyle = LUZ[i]; ctx.fillRect(cx - 3 + i * 2, cy - 4 - i * 9, 6 - i * 4, 9); }   // coluna de luz
      ctx.fillStyle = c.pulso[p]; ctx.fillRect(px + 6, py + 8, 4, 2);          // miolo pulsando
      o = Math.floor(t / 130) % 8;                                              // dois brilhinhos girando no aro
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + ORBITA[o][0], py + ORBITA[o][1], 2, 1);
      ctx.fillRect(px + ORBITA[(o + 4) % 8][0], py + ORBITA[(o + 4) % 8][1], 2, 1);
      for (i = 0; i < 4; i++) {                                                 // faíscas 2×2 subindo
        f = ((t / 2200) + i * 0.25) % 1;
        x = px + 3 + i * 3 + Math.round(Math.sin(f * 6.3 + i * 1.7) * 2);
        y = py + 7 - Math.round(f * 28);
        ctx.fillStyle = c.faisca[i]; ctx.fillRect(x, y, 2, 2);
      }
      for (i = 0; i < 2; i++) {                                                 // estrelinhas do chão piscando, cada uma no seu tempo
        if ((Math.floor(t / 260) + i * 3) % 6 > 2) continue;
        ctx.fillStyle = '#ffffff'; x = px + ESTRELAS[i][0]; y = py + ESTRELAS[i][1];
        ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5);
      }
    }
    return { desenhar: desenhar, animar: animar };
  }

  // pedrinha redonda: (x, y) = canto de cima, w × h; contorno sem as quinas, luz em cima e sombra embaixo
  function pedra(ctx, x, y, w, h, cores) {
    ret(ctx, x + 1, y, w - 2, h, K); ret(ctx, x, y + 1, w, h - 2, K);
    ret(ctx, x + 1, y + 1, w - 2, h - 2, cores[1]);
    ret(ctx, x + 1, y + 1, w - 3, 1, cores[2]); ret(ctx, x + 1, y + 2, 1, 1, cores[2]);
    ret(ctx, x + 2, y + h - 2, w - 3, 1, cores[0]); ret(ctx, x + w - 2, y + h - 3, 1, 1, cores[0]);
  }
  function saida(cores) {
    var c = comBosque(cores), elipse = D.elipse;
    return function (ctx, px, py) {
      var cx = px + 8, cy = py + 9, i, a;
      elipse(ctx, cx, cy + 1, 11, 7, 'rgba(58,36,70,0.22)');
      for (i = 0; i < 9; i++) {
        a = (i + 0.5) / 9 * Math.PI * 2;
        pedra(ctx, cx + Math.round(Math.cos(a) * 10) - 2, cy + Math.round(Math.sin(a) * 6) - 2, 5, 4, c.pedra);
      }
      elipse(ctx, cx, cy, 9, 5, K); elipse(ctx, cx, cy, 8, 4, c.anel[0]);
      elipse(ctx, cx, cy, 7, 4, c.anel[1]); elipse(ctx, cx, cy, 5, 3, c.anel[2]); elipse(ctx, cx, cy, 3, 2, c.anel[3]); elipse(ctx, cx, cy, 1, 1, '#ffffff');
      ret(ctx, cx - 6, cy - 1, 3, 1, c.anel[3]); ret(ctx, cx + 3, cy + 1, 3, 1, c.anel[3]);
      ret(ctx, px + 1, py + 1, 1, 3, '#fff3a0'); ret(ctx, px, py + 2, 3, 1, '#fff3a0');
      ret(ctx, px + 14, py + 4, 1, 3, '#ffffff'); ret(ctx, px + 13, py + 5, 3, 1, '#ffffff');
    };
  }

  R.Portal = {
    criar: criar, saida: saida, pedra: pedra,
    registrar: function (sprite, cores) {
      var M = window.Mapa;
      if (!M || !M.PREDIOS) return false;
      var p = criar(cores);
      M.PREDIOS[sprite] = p.desenhar;
      (M.PREDIOS_ANIM = M.PREDIOS_ANIM || {})[sprite] = p.animar;
      return true;
    },
  };
})();
