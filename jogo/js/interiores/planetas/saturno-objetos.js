/* Planeta Saturno, os objetos (prefixo saturno-): o chão de gelo do anel ('saturno-gelo'), o horizonte com Saturno
   gigante, as bordas dos anéis e a lua Titã ('saturno-horizonte'), rochas douradas e cristais de gelo, pedras do anel, pista
   de patinação, bonecos de gelo, placas de palavras em inglês, iglu, trenó, telescópio, bandeira e placa.
   Os bonecos e os cristais desenham o estado das brincadeiras (Reino._predios.planetas.saturno, de
   saturno-brincadeiras.js) no `anim`, que roda a cada quadro também sem Animações (com t = 0: parado).
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function S() { return P.saturno || null; }
  // cores do gelo e das pedras do anel
  var GE = { luz: '#f6fcff', claro: '#d4ebfa', meio: '#9fc8e8', escuro: '#6a96c2' };
  var PE = { luz: '#f2e8d4', claro: '#dccba8', meio: '#b9a07a', escuro: '#86704f' };
  var OURO2 = { luz: '#fff2c8', claro: '#e8c070', meio: '#c89a48', escuro: '#8a6430' };
  var OURO = '#ffc94d', ROSA = '#ff8ac4', CIANO = '#6fd6ff', LILAS = '#c9a8ff', LARANJA = '#f08a3c';
  var CEU = '#0b0820';

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(50,70,110,0.28)'); }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }
  function pedrinha(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, PE.meio);
    elipse(ctx, cx - 1, cy - 1, rx - 2, ry - 2, PE.claro); ret(ctx, cx - Math.round(rx / 2), cy - ry + 2, 2, 1, PE.luz);
  }
  // bloco de gelo: cubo azul claro com brilho no canto
  function bloco(ctx, x, y, w, h) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, GE.meio);
    ret(ctx, x + 1, y + 1, w - 2, 3, GE.claro); ret(ctx, x + 1, y + 1, 2, h - 2, GE.luz);
    ret(ctx, x + w - 3, y + 4, 1, h - 6, GE.escuro);
  }

  /* ---------- o chão do anel: poeira creme e dourada (D2B-10: não confunde com o gelo de Netuno), pedrinhas e brilhos ---------- */
  I.PISOS['saturno-gelo'] = { cores: { piso: '#f0d088', piso2: '#e4bf70', detalhe: '#b8955a', luz: '#fff0c4' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var s = sorte(tx, ty, 1);
      // manchas bege arredondadas (sem cara de tijolo)
      if (s < 0.3) elipse(ctx, px + 4 + Math.floor(s * 26), py + 5 + Math.floor(sorte(tx, ty, 3) * 6), 3, 2, p.piso2);
      // risquinho de gelo
      if (sorte(tx, ty, 4) < 0.3) { var rx = px + 2 + Math.floor(sorte(tx, ty, 5) * 8); ret(ctx, rx, py + 7, 5, 1, p.detalhe); ret(ctx, rx + 1, py + 8, 4, 1, p.luz); }
      // pedrinhas e brilhos
      for (var i = 0; i < 3; i++) {
        var r = sorte(tx, ty, 10 + i), x = px + Math.floor(r * 14), y = py + Math.floor(sorte(tx, ty, 20 + i) * 14);
        if (r < 0.4) { ret(ctx, x, y, 2, 2, p.detalhe); ret(ctx, x, y, 1, 1, p.piso2); } else ret(ctx, x, y, 1, 1, p.luz);
      }
    } };

  /* ---------- o horizonte: Saturno gigante, os anéis, Titã e as bordas do anel ---------- */
  var SAT = { col: 14, r: 44, faixas: ['#f3dca0', '#e8c77a', '#d9ae62', '#f0d392', '#c99a55', '#ecca84'] };
  var TITA = 4;
  function saturno(ctx, cx, cy, r) {
    // o anel cruza o alto da cúpula (o planeta nasce atrás da borda do anel)
    var ax = Math.round(r * 1.9), ay = 5, ay0 = cy - 30;
    anel(ctx, cx, ay0, ax, ay, true);
    circulo(ctx, cx, cy, r + 1, K);
    for (var y = -r; y <= r; y++) {
      var m = Math.floor(Math.sqrt(r * r - y * y));
      ret(ctx, cx - m, cy + y, 2 * m + 1, 1, SAT.faixas[Math.floor((y + r) / 5) % SAT.faixas.length]);
      if (m > 3) ret(ctx, cx + m - 4, cy + y, 4, 1, 'rgba(90,50,20,0.25)');
    }
    ret(ctx, cx - 14, cy - r + 5, 8, 1, '#fff4d0');
    anel(ctx, cx, ay0, ax, ay, false);
  }
  // anel inclinado: faixas de gelo e pedra; `tras` desenha só a metade de cima (atrás do planeta)
  function anel(ctx, cx, cy, ax, ay, tras) {
    var cores = ['#f4e6c4', '#cdb88c', '#e9dcc0', '#b7a37c'];
    for (var x = -ax; x <= ax; x++) {
      var f = Math.sqrt(Math.max(0, 1 - (x * x) / (ax * ax)));
      for (var k = 0; k < 4; k++) {
        var e = 1 - k * 0.12, dy = Math.round(ay * f * e);
        if (tras) ret(ctx, cx + x, cy - dy, 1, 1, cores[k]); else ret(ctx, cx + x, cy + dy, 1, 1, cores[k]);
      }
    }
  }
  function tita(ctx, cx, cy) {
    circulo(ctx, cx, cy, 5, 'rgba(240,138,60,0.25)'); circulo(ctx, cx, cy, 4, K);
    circulo(ctx, cx, cy, 3, LARANJA); ret(ctx, cx - 2, cy - 2, 2, 1, '#ffc48a');
  }
  I.PAREDES['saturno-horizonte'] = { cores: { parede: CEU, parede2: '#e6d6b4', rodape: '#e4bf70', detalhe: '#b39c78' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      if (P.estrelas) P.estrelas(ctx, px, py, 16, 20, 60, 300 + tx);
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      if (Math.abs(tx - SAT.col) <= 6) saturno(ctx, SAT.col * 16 + 8, py + 46, SAT.r);
      if (Math.abs(tx - TITA) <= 1) tita(ctx, TITA * 16 + 8, py + 9);
      ctx.restore();
      // as bordas do anel ao longe: faixas de gelo e pedra, com vãos escuros
      for (var i = 0; i < 16; i++) {
        var h = 24 + Math.round(Math.sin((tx * 16 + i) / 11) * 1.5);
        ret(ctx, px + i, py + h, 1, 32 - h, p.detalhe);
        ret(ctx, px + i, py + h + 2, 1, 2, p.parede2);
        if ((tx * 16 + i) % 7 === 0) ret(ctx, px + i, py + h + 1, 1, 1, '#fff4d0');
      }
      ret(ctx, px, py + 28, 16, 1, '#8a7658');
      ret(ctx, px, py + 29, 16, 3, p.rodape);
    } };

  /* ---------- rochas do anel (os cubos de gelo ficaram só em Netuno: D2B-10) ---------- */
  // rocha dourada do anel, arredondada, com a luz de cima
  function rocha(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, OURO2.meio);
    elipse(ctx, cx - 1, cy - 2, rx - 2, ry - 2, OURO2.claro); ret(ctx, cx - Math.round(rx / 2), cy - ry + 1, 3, 1, OURO2.luz);
    ret(ctx, cx + rx - 3, cy + 1, 2, ry - 1, OURO2.escuro);
  }
  I.objeto('saturno-bloco', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) { sombra(ctx, px + 8, py + 14, 7); rocha(ctx, px + 8, py + 8, 6, 5); brilho(ctx, px + 12, py + 3, '#fff6d8'); } });
  // monte de rochas do anel (2×2)
  I.objeto('saturno-blocos', { w: 2, h: 2, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 14);
      rocha(ctx, px + 9, py + 22, 8, 6); rocha(ctx, px + 23, py + 23, 7, 5);
      rocha(ctx, px + 16, py + 11, 8, 7); brilho(ctx, px + 22, py + 5, '#fff6d8');
    } });
  I.objeto('saturno-cristal-alto', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 4, py - 12, 8, 26, K); triangulo(ctx, px + 4, py - 20, 8, 9, K);
      ret(ctx, px + 5, py - 11, 6, 24, GE.meio); triangulo(ctx, px + 5, py - 17, 6, 6, GE.meio);
      ret(ctx, px + 5, py - 11, 2, 24, GE.luz); ret(ctx, px + 9, py - 8, 1, 18, GE.escuro);
      ret(ctx, px + 11, py + 2, 3, 11, K); ret(ctx, px + 12, py + 3, 1, 9, GE.claro);
      brilho(ctx, px + 3, py - 14, '#ffffff');
    } });
  // cristais para pegar (acao.n = qual dos 5)
  I.objeto('saturno-cristal', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 12, 6, 3, K); elipse(ctx, px + 8, py + 12, 5, 2, GE.claro); },
    anim: function (ctx, px, py, t, o) {
      var s = S(), n = (o.acao && o.acao.n) || 0, cor = [CIANO, LILAS, '#bfefff', ROSA, '#8cf0c8'][n % 5];
      if (s && s.cristalPego(n)) { ret(ctx, px + 6, py + 9, 4, 3, K); ret(ctx, px + 7, py + 10, 2, 1, GE.meio); return; }
      ret(ctx, px + 5, py - 4, 6, 14, K); triangulo(ctx, px + 5, py - 9, 6, 6, K);
      ret(ctx, px + 6, py - 3, 4, 12, cor); triangulo(ctx, px + 6, py - 7, 4, 4, cor);
      ret(ctx, px + 6, py - 3, 1, 11, '#ffffff');
      ret(ctx, px + 10, py + 2, 3, 8, K); ret(ctx, px + 11, py + 3, 1, 6, cor);
      ret(ctx, px + 2, py + 4, 3, 6, K); ret(ctx, px + 3, py + 5, 1, 4, cor);
      t = tempo(t);
      var fase = t ? Math.floor(t / 300 + n * 2) % 6 : 0;
      if (fase < 2) brilho(ctx, px + 12, py - 6 + fase, '#ffffff');
    } });
  // pista de patinação (2×2): gelo lisinho com riscos de patins e setinha de "venha patinar"
  I.objeto('saturno-pista', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 17, 15, 11, K); elipse(ctx, px + 16, py + 17, 14, 10, '#bfe4fb');
      elipse(ctx, px + 15, py + 16, 10, 6, '#e2f4ff');
      ret(ctx, px + 7, py + 14, 8, 1, '#ffffff'); ret(ctx, px + 17, py + 20, 9, 1, '#ffffff'); ret(ctx, px + 10, py + 23, 6, 1, GE.meio);
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2;
        ret(ctx, px + 16 + Math.round(Math.cos(a) * 14), py + 17 + Math.round(Math.sin(a) * 10), 2, 2, i % 2 ? ROSA : OURO);
      }
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var d = t ? Math.round(Math.sin(t / 280) * 2) : 0;
      ret(ctx, px + 15, py + 12 + d, 2, 5, OURO); triangulo(ctx, px + 13, py + 8 + d, 6, 4, OURO);
    } });
  I.objeto('saturno-poca', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 9, 6, 3, GE.meio); elipse(ctx, px + 7, py + 9, 5, 2, '#e2f4ff'); ret(ctx, px + 4, py + 8, 3, 1, '#ffffff'); } });
  I.objeto('saturno-neve', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 3, GE.claro); elipse(ctx, px + 7, py + 9, 4, 2, '#ffffff');
      ret(ctx, px + 2, py + 5, 1, 1, GE.meio); ret(ctx, px + 13, py + 6, 1, 1, '#ffffff');
    } });
  // riscos de patins no gelo (var.giro: 1 = de lado)
  I.objeto('saturno-risco', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var lado = o.var && o.var.giro;
      for (var i = 0; i < 3; i++) {
        if (lado) ret(ctx, px + 1 + i * 2, py + 4 + i * 4, 12, 1, i % 2 ? '#ffffff' : GE.escuro);
        else ret(ctx, px + 4 + i * 4, py + 1 + i * 2, 1, 12, i % 2 ? '#ffffff' : GE.escuro);
      }
    } });

  /* ---------- pedras do anel ---------- */
  I.objeto('saturno-pedra', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      pedrinha(ctx, px + 7, py + 9, 6, 5); pedrinha(ctx, px + 12, py + 12, 3, 2);
      ret(ctx, px + 4, py + 5, 3, 1, GE.luz);
    } });
  I.objeto('saturno-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 5], [9, 3], [12, 10], [5, 11], [8, 8]].forEach(function (s, i) {
        ret(ctx, px + s[0], py + s[1], 3, 2, PE.escuro); ret(ctx, px + s[0], py + s[1], 2, 1, i % 2 ? GE.luz : PE.claro);
      });
    } });

  /* ---------- bonecos de gelo (acao.i): acenam ao tocar ---------- */
  I.objeto('saturno-boneco', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py, o) {
      var i = (o.acao && o.acao.i) || 0, cach = [ROSA, CIANO, LILAS][i % 3];
      sombra(ctx, px + 8, py + 14, 6);
      circulo(ctx, px + 8, py + 8, 6, K); circulo(ctx, px + 8, py + 8, 5, '#f4fbff');
      circulo(ctx, px + 8, py - 3, 5, K); circulo(ctx, px + 8, py - 3, 4, '#ffffff');
      ret(ctx, px + 4, py + 6, 3, 3, GE.claro);
      ret(ctx, px + 6, py - 5, 1, 1, K); ret(ctx, px + 9, py - 5, 1, 1, K);
      ret(ctx, px + 8, py - 3, 3, 1, LARANJA); ret(ctx, px + 7, py - 1, 3, 1, K);
      ret(ctx, px + 4, py + 1, 9, 2, cach);
      ret(ctx, px + 5, py - 11, 7, 3, K); ret(ctx, px + 6, py - 10, 5, 1, cach);
      ret(ctx, px + 8, py + 6, 1, 1, K); ret(ctx, px + 8, py + 9, 1, 1, K);
      // braço esquerdo (graveto de gelo)
      ret(ctx, px + 1, py + 4, 3, 1, GE.escuro);
    },
    anim: function (ctx, px, py, t, o) {
      var s = S(), i = (o.acao && o.acao.i) || 0;
      t = tempo(t);
      if (s && s.acenando(i)) {
        // braço para cima, balançando com Animações
        var d = t ? Math.floor(t / 220) % 2 : 0;
        ret(ctx, px + 12, py + 1 - d, 1, 3, GE.escuro); ret(ctx, px + 13, py - 2 - d, 1, 3, GE.escuro);
        ret(ctx, px + 13, py - 4 - d, 2, 2, '#ffffff');
        brilho(ctx, px + 14, py - 8, OURO);
      } else ret(ctx, px + 12, py + 4, 3, 1, GE.escuro);
    } });

  /* ---------- placas de palavras em inglês (var.p: ice, star, ring, moon) ---------- */
  function icone(ctx, x, y, p) {
    if (p === 'ice') { bloco(ctx, x - 4, y - 4, 9, 9); return; }
    if (p === 'star') {
      // estrela de 5 pontas: ponta de cima, braços, corpo e as 2 pernas abertas
      ret(ctx, x, y - 5, 1, 2, OURO); ret(ctx, x - 1, y - 3, 3, 2, OURO);
      ret(ctx, x - 5, y - 1, 11, 1, OURO); ret(ctx, x - 3, y, 7, 1, OURO); ret(ctx, x - 2, y + 1, 5, 1, OURO);
      ret(ctx, x - 3, y + 2, 2, 1, OURO); ret(ctx, x + 2, y + 2, 2, 1, OURO); ret(ctx, x - 4, y + 3, 2, 1, OURO); ret(ctx, x + 3, y + 3, 2, 1, OURO);
      ret(ctx, x - 1, y - 1, 1, 1, '#fff4d0'); return;
    }
    if (p === 'ring') { circulo(ctx, x, y, 3, '#e8c77a'); ret(ctx, x - 6, y, 13, 1, '#b39c78'); ret(ctx, x - 5, y + 1, 11, 1, '#f4e6c4'); return; }
    circulo(ctx, x, y, 4, OURO); circulo(ctx, x + 2, y - 1, 3, '#fff1dc');
  }
  I.objeto('saturno-palavra', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, '#c98a4b');
      ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
      ret(ctx, px + 1, py - 13, 14, 2, CIANO);
      icone(ctx, px + 8, py - 6, (o.var && o.var.p) || 'moon');
    } });

  /* ---------- coisas dos ETs e dos visitantes ---------- */
  I.objeto('saturno-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, '#c98a4b');
      ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
      ret(ctx, px + 1, py - 13, 14, 2, ROSA);
      circulo(ctx, px + 7, py - 6, 3, '#e8c77a'); ret(ctx, px + 2, py - 6, 11, 1, '#b39c78');
      brilho(ctx, px + 12, py - 9, LILAS);
    } });
  I.objeto('saturno-bandeira', { w: 1, h: 1, topo: 30, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 5, py + 14, 4);
      ret(ctx, px + 3, py - 28, 2, 42, K); ret(ctx, px + 3, py - 28, 1, 42, '#e8ecf5');
      ret(ctx, px + 4, py - 28, 12, 2, K);
      ret(ctx, px + 5, py - 26, 11, 13, K); ret(ctx, px + 5, py - 26, 10, 12, CIANO);
      ret(ctx, px + 5, py - 15, 10, 1, '#3a9ac8');
      ret(ctx, px + 9, py - 23, 2, 6, OURO); ret(ctx, px + 7, py - 21, 6, 2, OURO);
      ret(ctx, px + 2, py + 12, 4, 2, GE.escuro);
    } });
  // iglu dos ETs (2×2): blocos de gelo em cúpula com portinha
  I.objeto('saturno-iglu', { w: 2, h: 2, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 15);
      elipse(ctx, px + 16, py + 18, 15, 12, K); elipse(ctx, px + 16, py + 18, 14, 11, GE.claro);
      ret(ctx, px + 2, py + 18, 28, 11, K); ret(ctx, px + 3, py + 18, 26, 10, GE.claro);
      for (var y = 0; y < 4; y++) ret(ctx, px + 4, py + 10 + y * 5, 24, 1, GE.meio);
      for (var x = 0; x < 5; x++) ret(ctx, px + 6 + x * 5 + (x % 2) * 2, py + 11, 1, 4, GE.meio);
      elipse(ctx, px + 10, py + 11, 4, 3, '#ffffff');
      ret(ctx, px + 12, py + 19, 9, 10, K); ret(ctx, px + 13, py + 20, 7, 9, '#3a4a7a'); ret(ctx, px + 13, py + 20, 7, 2, '#5a6ad0');
    } });
  // trenó (2×1)
  I.objeto('saturno-treno', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 3, py + 11, 26, 2, K); ret(ctx, px + 27, py + 7, 2, 5, K); ret(ctx, px + 29, py + 6, 2, 2, K);
      ret(ctx, px + 8, py + 7, 2, 4, K); ret(ctx, px + 21, py + 7, 2, 4, K);
      ret(ctx, px + 4, py - 1, 22, 9, K); ret(ctx, px + 5, py, 20, 7, '#e0433f'); ret(ctx, px + 5, py, 20, 2, '#ff8a94');
      ret(ctx, px + 10, py + 3, 10, 1, OURO);
    } });
  // telescópio mirando Saturno
  I.objeto('saturno-telescopio', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 2, 1, 11, K); ret(ctx, px + 12, py + 2, 1, 11, K); ret(ctx, px + 7, py + 2, 2, 12, K);
      for (var i = 0; i < 6; i++) {
        ret(ctx, px + 2 + i * 2, py - 2 - i * 2, 5, 5, K);
        ret(ctx, px + 3 + i * 2, py - 1 - i * 2, 3, 3, i > 3 ? '#d9ae62' : '#e8ecf5');
      }
      ret(ctx, px + 14, py - 13, 2, 2, OURO);
    } });
})();
