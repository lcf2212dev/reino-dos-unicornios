/* Caverna de Cristal, os objetos da caverna (prefixo cristal-): o cristalão (três cristais grandes, roxo, ciano ou
   rosa), a estalagmite, o cogumelo gigante que brilha, a drusa (cristaizinhos), a pedra, a rocha com uma lasca e o lago
   subterrâneo (sólidos). Mais abaixo, na segunda parte: os que se tocam e os enfeites do chão. Usa P.prisma e
   P.CRISTAL (cristal.js, que carrega depois: só dentro das funções); guarda P.sombra e P.halo. Nada de DOM nem canvas
   no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).cristal = R._predios.cristal || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }
  var PEDRA = ['#463a70', '#5e5090', '#8070b0', '#a89ad0'];
  var CORES = ['roxo', 'ciano', 'rosa'];
  // a cor de cada um sai da posição (sempre a mesma), ou de var.cor
  function corDe(o, n) { return P.CRISTAL[(o && o.var && o.var.cor) || CORES[((o ? o.x * 7 + o.y * 5 : 0) + (n || 0)) % 3]]; }
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(20,10,40,0.25)'); }
  function halo(ctx, cx, cy, rx, ry, rgb) {
    elipse(ctx, cx, cy, rx, ry, 'rgba(' + rgb + ',0.12)'); elipse(ctx, cx, cy, Math.round(rx * 0.7), Math.round(ry * 0.7), 'rgba(' + rgb + ',0.16)');
  }
  var RGB = { roxo: '180,140,255', ciano: '120,230,240', rosa: '255,150,220' };
  P.sombra = sombra; P.halo = halo; P.corDe = corDe;
  function base(ctx, x, y, w) {   // o montinho de pedra em que os cristais nascem
    ret(ctx, x, y, w, 5, K); ret(ctx, x + 1, y + 1, w - 2, 3, PEDRA[1]); ret(ctx, x + 1, y + 1, w - 2, 1, PEDRA[2]);
  }

  /* ---------- altos da caverna (sólidos na base, desenhados na ordem por Y) ---------- */
  I.objeto('cristal-cristalao', { w: 2, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py, o) {
      var c = corDe(o), nome = CORES.filter(function (k) { return P.CRISTAL[k] === c; })[0] || 'roxo';
      halo(ctx, px + 16, py - 6, 20, 18, RGB[nome]);
      sombra(ctx, px + 16, py + 14, 14);
      P.prisma(ctx, px + 12, py - 28, 9, 40, c);
      P.prisma(ctx, px + 4, py - 12, 7, 24, c);
      P.prisma(ctx, px + 22, py - 17, 6, 29, c);
      P.prisma(ctx, px + 26, py + 1, 4, 11, corDe(o, 1));
      base(ctx, px + 2, py + 10, 28);
      ret(ctx, px + 13, py - 20, 1, 2, '#ffffff');
    } });
  I.objeto('cristal-estalagmite', { w: 1, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 7);
      triangulo(ctx, px + 1, py - 26, 14, 41, K); triangulo(ctx, px + 2, py - 24, 12, 38, PEDRA[1]);
      triangulo(ctx, px + 2, py - 24, 7, 38, PEDRA[2]); ret(ctx, px + 5, py - 14, 1, 20, PEDRA[3]);
      [[-6, 7], [2, 9], [9, 11]].forEach(function (f) { ret(ctx, px + 8 - Math.round(f[1] / 2), py + f[0], f[1], 1, PEDRA[0]); });   // camadas
      var c = corDe(o);
      P.prisma(ctx, px + 11, py + 5, 3, 7, c);
    } });
  I.objeto('cristal-cogumelo-gigante', { w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py, o) {
      var rosa = ((o ? o.x + o.y : 0) & 1) === 1, ch = rosa ? ['#d04aa8', '#ff8ad8', '#ffd8f4'] : ['#1f9fb0', '#5fe0e8', '#d0fbff'];
      halo(ctx, px + 8, py - 10, 14, 12, rosa ? RGB.rosa : RGB.ciano);
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 5, py - 10, 6, 25, K); ret(ctx, px + 6, py - 10, 4, 24, '#e8e0ff'); ret(ctx, px + 9, py - 10, 1, 24, '#b8acdc');
      elipse(ctx, px + 8, py - 14, 9, 7, K); elipse(ctx, px + 8, py - 14, 8, 6, ch[0]);
      elipse(ctx, px + 8, py - 15, 7, 5, ch[1]); ret(ctx, px + 1, py - 10, 15, 2, ch[0]);
      ret(ctx, px + 4, py - 18, 2, 2, ch[2]); ret(ctx, px + 10, py - 16, 2, 2, ch[2]); ret(ctx, px + 7, py - 13, 1, 1, ch[2]);
      ret(ctx, px + 1, py - 8, 15, 1, K);
    } });

  /* ---------- pequenos sólidos ---------- */
  I.objeto('cristal-drusa', { w: 1, h: 1, solido: true, topo: 6,
    desenhar: function (ctx, px, py, o) {
      var c = corDe(o);
      sombra(ctx, px + 8, py + 14, 7);
      P.prisma(ctx, px + 6, py - 5, 5, 17, c);
      P.prisma(ctx, px + 2, py + 2, 4, 10, c);
      P.prisma(ctx, px + 11, py + 3, 3, 9, corDe(o, 1));
      base(ctx, px + 1, py + 10, 14);
    } });
  I.objeto('cristal-pedra', { w: 1, h: 1, solido: true, topo: 4,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, PEDRA[1]);
      elipse(ctx, px + 7, py + 8, 4, 2, PEDRA[2]); ret(ctx, px + 5, py + 6, 3, 1, PEDRA[3]); ret(ctx, px + 11, py + 11, 2, 1, PEDRA[0]);
    } });
  I.objeto('cristal-rocha', { w: 2, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 16, py + 14, 14);
      elipse(ctx, px + 15, py + 7, 13, 8, K); elipse(ctx, px + 15, py + 7, 12, 7, PEDRA[1]);
      elipse(ctx, px + 12, py + 4, 8, 4, PEDRA[2]); ret(ctx, px + 8, py + 1, 6, 1, PEDRA[3]);
      ret(ctx, px + 6, py + 11, 18, 1, PEDRA[0]); ret(ctx, px + 18, py + 5, 4, 1, PEDRA[0]); ret(ctx, px + 21, py + 6, 1, 3, PEDRA[0]);   // rachadura
      P.prisma(ctx, px + 24, py + 2, 4, 11, corDe(o));
    } });
  // o lago subterrâneo: água azul-escura com a beira de pedra, o reflexo de um cristal e brilhos (sólido: ela contorna)
  I.objeto('cristal-lago', { w: 3, h: 2, solido: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 16, 23, 13, K); elipse(ctx, px + 24, py + 16, 22, 12, PEDRA[1]);
      elipse(ctx, px + 24, py + 17, 20, 10, '#24306c'); elipse(ctx, px + 24, py + 18, 17, 8, '#2e4490');
      elipse(ctx, px + 24, py + 19, 12, 5, '#3a5ab0');
      ret(ctx, px + 8, py + 10, 30, 1, '#1a2252');   // a sombra da beira
      ret(ctx, px + 14, py + 15, 3, 7, '#8a6ce0'); ret(ctx, px + 15, py + 15, 1, 5, '#c8a8ff');   // reflexo do cristal
      ret(ctx, px + 30, py + 20, 8, 1, '#5fe0e8'); ret(ctx, px + 20, py + 24, 6, 1, '#5fe0e8'); ret(ctx, px + 33, py + 16, 3, 1, '#a0f0f8');
      P.prisma(ctx, px + 40, py + 5, 4, 10, P.CRISTAL.ciano); P.prisma(ctx, px + 5, py + 8, 3, 8, P.CRISTAL.roxo);
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 600) % 4 : 0;   // um brilho correndo na água
      ret(ctx, px + 12 + f * 6, py + 21 - (f & 1), 3, 1, '#d0fbff');
    } });
})();
/* Segunda parte: os que se tocam e os enfeites do chão (prefixo cristal-): a placa, o geodo, o lampião do mineiro e o
   carrinho de mina (com fala); os trilhos, o cascalho, as lascas, os cogumelinhos, a poça, o musgo que brilha, as
   faíscas e o pó de cristal da trilha (não sólidos). O brilho parado fica no `desenhar`; o piscar, no `anim` (só com
   Animações; com t = 0 fica parado). Usa P.sombra, P.halo e P.corDe (da primeira parte). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).cristal = R._predios.cristal || {};
  var PL = (R._predios.planetas = R._predios.planetas || {});
  function tempo(t) { return PL.tempo ? PL.tempo(t) : 0; }
  var MADEIRA = ['#5a3c26', '#8a5c38', '#b8844e'];
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

  /* ---------- os que se tocam ---------- */
  // a placa de madeira da entrada, com um cristal pintado
  I.objeto('cristal-placa', { w: 1, h: 1, solido: true, topo: 8,
    desenhar: function (ctx, px, py) {
      P.sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 6, py + 7, 4, 8, K); ret(ctx, px + 7, py + 7, 2, 7, MADEIRA[1]);
      ret(ctx, px, py - 4, 16, 12, K); ret(ctx, px + 1, py - 3, 14, 10, MADEIRA[2]); ret(ctx, px + 1, py - 3, 14, 2, '#d8a870'); ret(ctx, px + 1, py + 5, 14, 2, MADEIRA[1]);
      P.prisma(ctx, px + 6, py - 2, 4, 7, P.CRISTAL.roxo);
      ret(ctx, px + 3, py + 1, 2, 1, '#5fe0e8'); ret(ctx, px + 11, py, 2, 1, '#5fe0e8');
    } });
  // o geodo: uma pedra redonda aberta ao meio, cheia de cristais roxos por dentro
  I.objeto('cristal-geodo', { w: 2, h: 1, solido: true, topo: 14,
    desenhar: function (ctx, px, py) {
      P.sombra(ctx, px + 16, py + 14, 13);
      P.halo(ctx, px + 16, py + 1, 16, 12, '180,140,255');
      elipse(ctx, px + 16, py + 2, 14, 12, K); elipse(ctx, px + 16, py + 2, 13, 11, '#6a5c8a'); elipse(ctx, px + 14, py - 2, 9, 6, '#8a7cac');
      elipse(ctx, px + 16, py + 3, 10, 8, K); elipse(ctx, px + 16, py + 3, 9, 7, '#e0ccff'); elipse(ctx, px + 16, py + 4, 7, 5, '#a66bff');
      elipse(ctx, px + 16, py + 5, 4, 3, '#4a2a90');
      [[9, -1], [13, -4], [19, -4], [23, 0], [11, 7], [21, 7], [16, 9]].forEach(function (c) {   // pontas viradas para o meio
        ret(ctx, px + c[0], py + c[1], 2, 2, '#ffffff'); ret(ctx, px + c[0] + 1, py + c[1] + 1, 1, 1, '#c8a8ff');
      });
      ret(ctx, px + 9, py - 7, 4, 1, '#a89cc4');   // luz em cima
    } });
  // o lampião do mineiro: um poste de madeira com o lampião pendurado, de luz amarela quentinha
  I.objeto('cristal-lampiao', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      P.sombra(ctx, px + 8, py + 14, 5);
      P.halo(ctx, px + 10, py - 11, 14, 13, '255,220,140');
      ret(ctx, px + 4, py - 20, 4, 35, K); ret(ctx, px + 5, py - 20, 1, 34, MADEIRA[2]); ret(ctx, px + 6, py - 20, 1, 34, MADEIRA[0]);
      ret(ctx, px + 4, py - 22, 10, 3, K); ret(ctx, px + 5, py - 21, 8, 1, MADEIRA[1]); ret(ctx, px + 12, py - 20, 1, 3, K);
      ret(ctx, px + 9, py - 17, 7, 2, K); ret(ctx, px + 8, py - 15, 9, 10, K);
      ret(ctx, px + 9, py - 14, 7, 8, '#ffe08a'); ret(ctx, px + 10, py - 13, 2, 5, '#fff6d0'); ret(ctx, px + 12, py - 14, 1, 8, '#c89a40');
      ret(ctx, px + 9, py - 6, 7, 2, K);
      ret(ctx, px + 3, py + 12, 7, 3, K); ret(ctx, px + 4, py + 12, 5, 2, '#6a5c8a');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 320) % 3 : 0;   // a chama tremendo
      ret(ctx, px + 10 + (f === 1 ? 1 : 0), py - 12 - (f === 2 ? 1 : 0), 2, 3, '#ffffff');
    } });
  // o carrinho de mina nos trilhos, cheio de cristais
  function trilhos(ctx, px, py, w) {
    for (var x = 2; x < w; x += 5) { ret(ctx, px + x, py + 6, 3, 10, K); ret(ctx, px + x + 1, py + 7, 1, 8, MADEIRA[1]); }
    ret(ctx, px, py + 7, w, 2, K); ret(ctx, px, py + 7, w, 1, '#c0bcd8');
    ret(ctx, px, py + 13, w, 2, K); ret(ctx, px, py + 13, w, 1, '#c0bcd8');
  }
  I.objeto('cristal-vagonete', { w: 2, h: 1, solido: true, topo: 10,
    desenhar: function (ctx, px, py, o) {
      trilhos(ctx, px, py, 32);
      var cheio = !!(o && o.fala);
      P.prisma(ctx, px + 9, py - 9, 5, 10, P.CRISTAL.roxo); P.prisma(ctx, px + 15, py - 11, 5, 12, P.CRISTAL.ciano);
      if (cheio) { P.prisma(ctx, px + 20, py - 7, 4, 8, P.CRISTAL.rosa); P.prisma(ctx, px + 5, py - 5, 4, 6, P.CRISTAL.ciano); }
      ret(ctx, px + 2, py - 2, 28, 3, K); ret(ctx, px + 3, py - 1, 26, 1, '#c87850');   // a borda
      ret(ctx, px + 4, py + 1, 24, 9, K); ret(ctx, px + 5, py + 1, 22, 8, '#a05a3c');
      ret(ctx, px + 5, py + 1, 22, 1, '#c87850'); ret(ctx, px + 5, py + 5, 22, 1, '#7a4030');
      ret(ctx, px + 8, py + 2, 1, 6, '#7a4030'); ret(ctx, px + 23, py + 2, 1, 6, '#7a4030');
      circulo(ctx, px + 9, py + 11, 3, K); circulo(ctx, px + 23, py + 11, 3, K);
      ret(ctx, px + 9, py + 11, 1, 1, '#8a84a8'); ret(ctx, px + 23, py + 11, 1, 1, '#8a84a8');
    } });

  /* ---------- enfeites do chão (não sólidos: ela passa por cima) ---------- */
  // um pedaço de trilho (na horizontal); var.ponta 'e'/'d' = o batente vermelho no fim da linha
  I.objeto('cristal-trilho', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      trilhos(ctx, px, py, 16);
      var p = o && o.var && o.var.ponta;
      if (p) { var x = p === 'e' ? px : px + 11; ret(ctx, x, py + 5, 5, 11, K); ret(ctx, x + 1, py + 6, 3, 9, '#d0503a'); ret(ctx, x + 1, py + 6, 3, 1, '#ff8a6a'); }
    } });
  I.objeto('cristal-cascalho', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 9, 4, 3], [10, 4, 3, 3], [9, 11, 4, 3], [6, 5, 2, 2]].forEach(function (s) {
        ret(ctx, px + s[0], py + s[1], s[2], s[3], K); if (s[2] > 2) ret(ctx, px + s[0] + 1, py + s[1] + 1, s[2] - 2, s[3] - 2, '#a89ad0');
      });
    } });
  I.objeto('cristal-lascas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0, c = P.CRISTAL[['ciano', 'roxo', 'rosa'][n % 3]];
      P.prisma(ctx, px + 7, py + 3, 3, 11, c); P.prisma(ctx, px + 3, py + 8, 3, 6, c); P.prisma(ctx, px + 11, py + 7, 3, 7, c);
      ret(ctx, px + 2, py + 14, 13, 1, K);
    } });
  var CHAPEU = [['#5fe0e8', '#d0fbff'], ['#ff8ad8', '#ffd8f4'], ['#c89cff', '#f0e4ff']];
  I.objeto('cristal-cogumelos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0;
      [[5, 13, 3], [11, 14, 2]].forEach(function (c, i) {
        var ch = CHAPEU[(n + i) % 3];
        elipse(ctx, px + c[0], py + c[1] - c[2], c[2] + 3, c[2] + 1, 'rgba(160,240,250,0.16)');
        ret(ctx, px + c[0] - 1, py + c[1] - c[2] - 1, 3, c[2] + 2, K); ret(ctx, px + c[0], py + c[1] - c[2], 1, c[2] + 1, '#f0ecff');
        elipse(ctx, px + c[0], py + c[1] - c[2] - 1, c[2] + 1, c[2] - 1, K); elipse(ctx, px + c[0], py + c[1] - c[2] - 1, c[2], Math.max(1, c[2] - 2), ch[0]);
        ret(ctx, px + c[0] - 1, py + c[1] - c[2] - 2, 1, 1, ch[1]);
      });
    } });
  I.objeto('cristal-poca', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {   // poça rasa de cantos arredondados, com a beira mais escura e o brilho do teto
      ret(ctx, px + 3, py + 7, 10, 6, '#5a5288'); ret(ctx, px + 2, py + 8, 12, 4, '#5a5288');
      ret(ctx, px + 4, py + 8, 8, 4, '#3a5ab0'); ret(ctx, px + 3, py + 9, 10, 2, '#3a5ab0');
      ret(ctx, px + 5, py + 9, 3, 1, '#a0f0f8'); ret(ctx, px + 10, py + 10, 1, 1, '#c8a8ff');
    } });
  I.objeto('cristal-musgo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 10], [6, 12], [9, 9], [12, 12], [5, 7]].forEach(function (m, i) {
        ret(ctx, px + m[0], py + m[1], 3, 2, '#3f8a8a'); ret(ctx, px + m[0], py + m[1], 1, 1, i % 2 ? '#7ff0d8' : '#b8fff0');
      });
    } });
  var FAISCA = [[3, 5, 0], [10, 3, 2], [12, 11, 4]];   // [x, y, fase] de cada faísca (fora do quadro: nada novo por frame)
  I.objeto('cristal-faiscas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      FAISCA.forEach(function (v, i) { elipse(ctx, px + v[0], py + v[1], 3, 2, 'rgba(160,240,250,0.2)'); ret(ctx, px + v[0], py + v[1], 1, 1, i % 2 ? '#e0ccff' : '#d0fbff'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      for (var n = 0; n < FAISCA.length; n++) {
        var v = FAISCA[n], dx = t ? Math.round(Math.sin(t / 560 + v[2]) * 3) : 0, dy = t ? Math.round(Math.cos(t / 470 + v[2]) * 2) : 0;
        if (t && Math.floor(t / 300 + v[2]) % 3 === 0) brilho(ctx, px + v[0] + dx, py + v[1] + dy, '#ffffff');
        else ret(ctx, px + v[0] + dx, py + v[1] + dy, 2, 2, n % 2 ? '#e0ccff' : '#d0fbff');
      }
    } });
  // pó de cristal nas lajes da trilha
  I.objeto('cristal-brilhos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 5, 1, 1, '#5fe0e8'); ret(ctx, px + 11, py + 10, 1, 1, '#a66bff'); brilho(ctx, px + 8, py + 12, '#ffffff');
      ret(ctx, px + 3, py + 12, 1, 1, '#ff8ad8');
    } });
})();
