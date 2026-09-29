/* Planeta Netuno, os objetos (prefixo netuno-): o chão de gelo azul de Tritão ('netuno-gelo'), o horizonte com Netuno
   azul gigante, a Grande Mancha Escura, os anéis finos e o Sol pequenininho ('netuno-horizonte'), gêiseres, cristais e
   blocos de gelo, cata-vento, biruta, o laboratório da Gota (bancada, tubos de ensaio, microscópio), as relíquias e a
   linha do tempo do Memo, baú, bandeira e placa.
   Gêiseres, cata-vento, tubos e cristais desenham o estado das brincadeiras (Reino._predios.planetas.netuno, de
   netuno-brincadeiras.js) no `anim`, que roda a cada quadro também sem Animações (com t = 0: parado).
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function S() { return P.netuno || null; }
  // cores do gelo azul e da madeira
  var GE = { luz: '#f4fbff', claro: '#cfe6fb', meio: '#8fbde8', escuro: '#4f86c4' };
  var MA = { claro: '#d9a86a', meio: '#b07a45', escuro: '#7a5230' };
  var OURO = '#ffc94d', ROSA = '#ff8ac4', CIANO = '#6fd6ff', LILAS = '#c9a8ff', VERDE = '#7fe0a0';
  var CEU = '#070a24';
  // cores da água dos tubos (a brincadeira troca a vez)
  var CORES_TUBO = ['#4aa8ff', '#5fd08a', '#ff7ab8', '#a77cff'];

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(30,60,120,0.28)'); }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }
  function bloco(ctx, x, y, w, h) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, GE.meio);
    ret(ctx, x + 1, y + 1, w - 2, 3, GE.claro); ret(ctx, x + 1, y + 1, 2, h - 2, GE.luz);
    ret(ctx, x + w - 3, y + 4, 1, h - 6, GE.escuro);
  }
  // placa de madeira com faixa colorida (base das placas e da linha do tempo)
  function placa(ctx, px, py, faixa) {
    sombra(ctx, px + 8, py + 14, 5);
    ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, MA.claro);
    ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
    ret(ctx, px + 1, py - 13, 14, 2, faixa);
  }

  /* ---------- o chão de Tritão: gelo azul com rachaduras e neve ---------- */
  I.PISOS['netuno-gelo'] = { cores: { piso: '#8e94e2', piso2: '#a8a0ee', detalhe: '#5a5cb8', luz: '#d4d8ff' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var s = sorte(tx, ty, 1);
      // montinho de neve
      if (s < 0.3) elipse(ctx, px + 4 + Math.floor(s * 26), py + 5 + Math.floor(sorte(tx, ty, 3) * 6), 3, 2, p.piso2);
      // rachadura em zigue-zague
      if (sorte(tx, ty, 4) < 0.35) {
        var rx = px + 2 + Math.floor(sorte(tx, ty, 5) * 6), ry = py + 3 + Math.floor(sorte(tx, ty, 6) * 8);
        ret(ctx, rx, ry, 3, 1, p.detalhe); ret(ctx, rx + 3, ry + 1, 3, 1, p.detalhe); ret(ctx, rx + 6, ry, 2, 1, p.detalhe);
        ret(ctx, rx + 1, ry + 1, 2, 1, p.luz);
      }
      for (var i = 0; i < 3; i++) {
        var r = sorte(tx, ty, 10 + i), x = px + Math.floor(r * 14), y = py + Math.floor(sorte(tx, ty, 20 + i) * 14);
        ret(ctx, x, y, 1, 1, r < 0.4 ? p.detalhe : p.luz);
      }
    } };

  /* ---------- o horizonte: Netuno azul gigante, a Grande Mancha Escura, anéis finos e o Sol lá longe ---------- */
  var NET = { col: 13, r: 42, faixas: ['#5b8ef0', '#4a7be0', '#3f6fd6', '#4d80e6', '#3563c8', '#4677dc'] };
  var SOL = 19;
  function netuno(ctx, cx, cy, r) {
    anel(ctx, cx, cy - 22, Math.round(r * 1.7), 4, true);
    circulo(ctx, cx, cy, r + 1, K);
    for (var y = -r; y <= r; y++) {
      var m = Math.floor(Math.sqrt(r * r - y * y));
      ret(ctx, cx - m, cy + y, 2 * m + 1, 1, NET.faixas[Math.floor((y + r) / 6) % NET.faixas.length]);
      if (m > 3) ret(ctx, cx + m - 4, cy + y, 4, 1, 'rgba(10,20,70,0.3)');
    }
    // a Grande Mancha Escura e a nuvenzinha branca ao lado
    elipse(ctx, cx - 12, cy - 24, 7, 3, '#1f3f96'); ret(ctx, cx - 3, cy - 27, 6, 1, '#e8f4ff');
    ret(ctx, cx + 8, cy - 32, 10, 1, '#9cc2ff'); ret(ctx, cx - 20, cy - 36, 8, 1, '#8ab4ff');
    anel(ctx, cx, cy - 22, Math.round(r * 1.7), 4, false);
  }
  // anel fininho (uma linha só); `tras` desenha a metade de cima
  function anel(ctx, cx, cy, ax, ay, tras) {
    for (var x = -ax; x <= ax; x++) {
      var f = Math.sqrt(Math.max(0, 1 - (x * x) / (ax * ax))), dy = Math.round(ay * f);
      if ((x & 1) === 0) ret(ctx, cx + x, tras ? cy - dy : cy + dy, 1, 1, '#9fb4d8');
    }
  }
  function sol(ctx, cx, cy) { circulo(ctx, cx, cy, 3, 'rgba(255,230,140,0.3)'); circulo(ctx, cx, cy, 2, '#fff2b0'); ret(ctx, cx, cy, 1, 1, '#ffffff'); }
  I.PAREDES['netuno-horizonte'] = { cores: { parede: CEU, parede2: '#b4b0f0', rodape: '#8e94e2', detalhe: '#6a6cc8' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      if (P.estrelas) P.estrelas(ctx, px, py, 16, 20, 60, 600 + tx);
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      if (Math.abs(tx - NET.col) <= 6) netuno(ctx, NET.col * 16 + 8, py + 46, NET.r);
      if (tx === SOL) sol(ctx, SOL * 16 + 8, py + 8);
      ctx.restore();
      // morros de gelo de Tritão ao longe
      for (var i = 0; i < 16; i++) {
        var h = 23 + Math.round(Math.sin((tx * 16 + i) / 9) * 2);
        ret(ctx, px + i, py + h, 1, 32 - h, p.detalhe);
        ret(ctx, px + i, py + h + 1, 1, 2, p.parede2);
      }
      ret(ctx, px, py + 28, 16, 1, '#5a5cb8');
      ret(ctx, px, py + 29, 16, 3, p.rodape);
    } };

  /* ---------- gelo ---------- */
  I.objeto('netuno-bloco', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) { sombra(ctx, px + 8, py + 14, 7); bloco(ctx, px + 2, py + 1, 12, 12); brilho(ctx, px + 12, py + 2, '#ffffff'); } });
  I.objeto('netuno-blocos', { w: 2, h: 2, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 14);
      bloco(ctx, px + 2, py + 14, 14, 14); bloco(ctx, px + 16, py + 14, 14, 14);
      bloco(ctx, px + 9, py + 1, 14, 14); brilho(ctx, px + 25, py + 4, '#ffffff');
    } });
  I.objeto('netuno-cristal-alto', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 4, py - 12, 8, 26, K); triangulo(ctx, px + 4, py - 20, 8, 9, K);
      ret(ctx, px + 5, py - 11, 6, 24, '#5aa0f0'); triangulo(ctx, px + 5, py - 17, 6, 6, '#5aa0f0');
      ret(ctx, px + 5, py - 11, 2, 24, GE.claro); ret(ctx, px + 9, py - 8, 1, 18, '#2f5fb0');
      brilho(ctx, px + 3, py - 14, '#ffffff');
    } });
  I.objeto('netuno-neve', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 3, GE.luz); elipse(ctx, px + 7, py + 9, 4, 2, '#ffffff');
      ret(ctx, px + 2, py + 5, 1, 1, GE.meio); ret(ctx, px + 13, py + 6, 1, 1, '#ffffff');
    } });
  I.objeto('netuno-racha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 4, 1, GE.escuro); ret(ctx, px + 5, py + 7, 4, 1, GE.escuro); ret(ctx, px + 9, py + 6, 5, 1, GE.escuro);
      ret(ctx, px + 7, py + 8, 1, 4, GE.escuro); ret(ctx, px + 2, py + 5, 3, 1, '#ffffff');
    } });
  I.objeto('netuno-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 5], [9, 3], [12, 10], [5, 11], [8, 8]].forEach(function (s, i) {
        ret(ctx, px + s[0], py + s[1], 3, 2, GE.escuro); ret(ctx, px + s[0], py + s[1], 2, 1, i % 2 ? '#ffffff' : GE.claro);
      });
    } });
  // cristais azuis para pegar (acao.n = qual dos 5)
  I.objeto('netuno-cristal', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 12, 6, 3, K); elipse(ctx, px + 8, py + 12, 5, 2, GE.claro); },
    anim: function (ctx, px, py, t, o) {
      var s = S(), n = (o.acao && o.acao.n) || 0, cor = ['#3f8cff', CIANO, '#5a6cff', '#8ab8ff', '#2fb8e0'][n % 5];
      if (s && s.cristalPego(n)) { ret(ctx, px + 6, py + 9, 4, 3, K); ret(ctx, px + 7, py + 10, 2, 1, GE.meio); return; }
      ret(ctx, px + 5, py - 4, 6, 14, K); triangulo(ctx, px + 5, py - 9, 6, 6, K);
      ret(ctx, px + 6, py - 3, 4, 12, cor); triangulo(ctx, px + 6, py - 7, 4, 4, cor);
      ret(ctx, px + 6, py - 3, 1, 11, '#ffffff');
      ret(ctx, px + 10, py + 2, 3, 8, K); ret(ctx, px + 11, py + 3, 1, 6, cor);
      t = tempo(t);
      if (!t || Math.floor(t / 300 + n * 2) % 6 < 2) brilho(ctx, px + 12, py - 6, '#ffffff');
    } });
  // gêiser de gelo (acao.i): buraco com borda de gelo; tocado, fica com o jato de gelo no ar
  I.objeto('netuno-geiser', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 11, 7, 4, K); elipse(ctx, px + 8, py + 11, 6, 3, GE.claro);
      elipse(ctx, px + 8, py + 11, 3, 2, '#23407a'); ret(ctx, px + 3, py + 9, 2, 1, '#ffffff');
    },
    anim: function (ctx, px, py, t, o) {
      var s = S(), i = (o.acao && o.acao.i) || 0;
      if (!s || !s.espirrou(i)) { ret(ctx, px + 7, py + 7, 1, 2, GE.luz); return; }
      t = tempo(t);
      var d = t ? Math.floor(t / 180) % 2 : 0;
      ret(ctx, px + 6, py - 14 + d, 4, 24, K); ret(ctx, px + 7, py - 13 + d, 2, 22, GE.luz);
      elipse(ctx, px + 8, py - 16 + d, 6, 4, K); elipse(ctx, px + 8, py - 16 + d, 5, 3, '#ffffff');
      ret(ctx, px + 2, py - 12, 1, 1, GE.claro); ret(ctx, px + 13, py - 9, 1, 1, GE.claro); ret(ctx, px + 12, py - 18, 1, 1, '#ffffff');
    } });

  /* ---------- vento: cata-vento e biruta ---------- */
  I.objeto('netuno-catavento', { w: 1, h: 1, topo: 26, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 4);
      ret(ctx, px + 7, py - 12, 2, 26, K); ret(ctx, px + 7, py - 12, 1, 26, '#e8ecf5');
    },
    anim: function (ctx, px, py, t) {
      var s = S(), giros = s ? s.giros : 0;
      t = tempo(t);
      var f = (giros + (t && giros ? Math.floor(t / 90) : 0)) % 2, cx = px + 8, cy = py - 14;
      var pas = f ? [[-6, -6], [1, -6], [-6, 1], [1, 1]] : [[-3, -8], [3, -3], [-8, -2], [-2, 3]];
      [ROSA, OURO, CIANO, LILAS].forEach(function (c, k) {
        ret(ctx, cx + pas[k][0] - 1, cy + pas[k][1] - 1, 7, 7, K); ret(ctx, cx + pas[k][0], cy + pas[k][1], 5, 5, c);
      });
      ret(ctx, cx - 1, cy - 1, 3, 3, K); ret(ctx, cx, cy, 1, 1, '#ffffff');
      if (giros) { ret(ctx, cx + 9, cy - 4, 5, 1, GE.luz); ret(ctx, cx + 10, cy + 2, 4, 1, GE.luz); }
    } });
  // biruta: a manga listrada esticada pelo vento fortíssimo
  I.objeto('netuno-biruta', { w: 1, h: 1, topo: 24, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 4, py + 14, 3);
      ret(ctx, px + 3, py - 22, 2, 36, K); ret(ctx, px + 3, py - 22, 1, 36, '#e8ecf5');
      for (var k = 0; k < 4; k++) {
        var h = 8 - k;
        ret(ctx, px + 5 + k * 3, py - 22 + k, 3, h + 1, K);
        ret(ctx, px + 5 + k * 3, py - 21 + k, 3, h - 1, k % 2 ? '#ffffff' : '#ff6a4a');
      }
    } });

  /* ---------- o laboratório da Gota (Ciências) ---------- */
  I.objeto('netuno-bancada', { w: 2, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 2, py + 1, 28, 12, K); ret(ctx, px + 3, py + 2, 26, 10, '#e8ecf5'); ret(ctx, px + 3, py + 2, 26, 2, '#ffffff');
      ret(ctx, px + 4, py + 6, 11, 5, '#c4ccda'); ret(ctx, px + 17, py + 6, 11, 5, '#c4ccda');
      // frascos em cima
      ret(ctx, px + 5, py - 6, 5, 8, K); ret(ctx, px + 6, py - 3, 3, 4, VERDE); ret(ctx, px + 7, py - 8, 1, 3, K);
      circulo(ctx, px + 23, py - 2, 4, K); circulo(ctx, px + 23, py - 2, 3, ROSA); ret(ctx, px + 22, py - 9, 3, 5, K);
    } });
  I.objeto('netuno-tubos', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 1, py + 6, 14, 3, K); ret(ctx, px + 2, py + 7, 12, 1, MA.claro);
      ret(ctx, px + 2, py + 9, 2, 5, K); ret(ctx, px + 12, py + 9, 2, 5, K);
    },
    anim: function (ctx, px, py, t) {
      var s = S(), c = s ? s.cor : 0;
      for (var k = 0; k < 3; k++) {
        var x = px + 2 + k * 4, cor = CORES_TUBO[(c + k) % CORES_TUBO.length];
        ret(ctx, x, py - 6, 4, 13, K); ret(ctx, x + 1, py - 5, 2, 11, '#eef8ff'); ret(ctx, x + 1, py, 2, 6, cor);
      }
      if (s && s.cor) brilho(ctx, px + 13, py - 8, '#ffffff');
    } });
  I.objeto('netuno-microscopio', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 10, 10, 4, K); ret(ctx, px + 4, py + 11, 8, 2, '#8a96b0');
      ret(ctx, px + 10, py - 2, 3, 13, K); ret(ctx, px + 11, py - 1, 1, 11, '#c4ccda');
      ret(ctx, px + 4, py + 5, 9, 2, K);
      ret(ctx, px + 5, py - 10, 5, 12, K); ret(ctx, px + 6, py - 9, 3, 10, '#e8ecf5'); ret(ctx, px + 5, py - 12, 5, 2, K);
      ret(ctx, px + 7, py + 3, 1, 1, CIANO);
    } });

  /* ---------- as coisas antigas do Memo (História) ---------- */
  function reliquia(ctx, px, py, r) {
    if (r === 'carta') {
      ret(ctx, px + 2, py + 2, 12, 9, K); ret(ctx, px + 3, py + 3, 10, 7, '#fff1dc');
      ret(ctx, px + 3, py + 3, 1, 1, MA.meio); ret(ctx, px + 4, py + 4, 4, 1, MA.meio); ret(ctx, px + 8, py + 4, 4, 1, MA.meio);
      ret(ctx, px + 10, py + 6, 2, 2, '#e0433f'); return;
    }
    if (r === 'telefone') {
      ret(ctx, px + 2, py + 5, 12, 7, K); ret(ctx, px + 3, py + 6, 10, 5, '#2a2a3a');
      circulo(ctx, px + 8, py + 8, 2, '#e8ecf5');
      ret(ctx, px + 1, py + 1, 14, 4, K); ret(ctx, px + 2, py + 2, 12, 2, '#2a2a3a');
      ret(ctx, px + 13, py + 11, 1, 3, K); ret(ctx, px + 14, py + 13, 2, 1, K); return;
    }
    if (r === 'relogio') {
      circulo(ctx, px + 8, py + 6, 6, K); circulo(ctx, px + 8, py + 6, 5, OURO); circulo(ctx, px + 8, py + 6, 4, '#fff8e0');
      ret(ctx, px + 8, py + 3, 1, 4, K); ret(ctx, px + 8, py + 6, 3, 1, K); ret(ctx, px + 7, py - 1, 3, 2, K); return;
    }
    if (r === 'foto') {
      ret(ctx, px + 2, py + 1, 12, 11, K); ret(ctx, px + 3, py + 2, 10, 9, '#f2eadc'); ret(ctx, px + 4, py + 3, 8, 7, '#8a8a8a');
      circulo(ctx, px + 8, py + 5, 2, '#d8d8d8'); ret(ctx, px + 6, py + 7, 5, 3, '#d8d8d8'); return;
    }
    // livro velho
    ret(ctx, px + 2, py + 3, 12, 9, K); ret(ctx, px + 3, py + 4, 10, 7, '#8a4a2a'); ret(ctx, px + 3, py + 4, 2, 7, '#5e2e18');
    ret(ctx, px + 7, py + 6, 4, 1, OURO); ret(ctx, px + 13, py + 5, 1, 6, '#f2e6c8');
  }
  // pedestal de gelo com uma relíquia em cima (var.r: carta, telefone, relogio, foto, livro)
  I.objeto('netuno-reliquia', { w: 1, h: 1, topo: 12, solido: true,
    desenhar: function (ctx, px, py, o) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 4, 10, 10, K); ret(ctx, px + 4, py + 5, 8, 8, GE.meio); ret(ctx, px + 4, py + 5, 8, 2, GE.claro);
      reliquia(ctx, px, py - 8, (o.var && o.var.r) || 'livro');
    } });
  // linha do tempo do Memo (2×1): de antigamente até hoje
  I.objeto('netuno-linha', { w: 2, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 4, py - 2, 2, 16, K); ret(ctx, px + 26, py - 2, 2, 16, K);
      ret(ctx, px, py - 14, 32, 13, K); ret(ctx, px + 1, py - 13, 30, 11, '#fff1dc');
      ret(ctx, px + 3, py - 8, 26, 1, MA.meio);
      [['#8a8a8a', 4], [MA.meio, 12], [CIANO, 20], [ROSA, 27]].forEach(function (m) { circulo(ctx, px + m[1], py - 8, 2, m[0]); });
      triangulo(ctx, px + 27, py - 12, 3, 2, MA.meio);
    } });
  I.objeto('netuno-bau', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 1, py + 2, 14, 11, K); ret(ctx, px + 2, py + 3, 12, 9, MA.meio); ret(ctx, px + 2, py + 3, 12, 3, MA.claro);
      ret(ctx, px + 2, py + 6, 12, 1, MA.escuro); ret(ctx, px + 7, py + 6, 2, 3, OURO);
      ret(ctx, px + 4, py + 1, 3, 2, '#ffffff'); ret(ctx, px + 10, py + 1, 2, 2, '#f2eadc');
    } });

  /* ---------- placa e bandeira ---------- */
  I.objeto('netuno-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      placa(ctx, px, py, CIANO);
      circulo(ctx, px + 7, py - 6, 3, '#4a7be0'); ret(ctx, px + 2, py - 6, 11, 1, '#9fb4d8');
      brilho(ctx, px + 12, py - 9, OURO);
    } });
  I.objeto('netuno-bandeira', { w: 1, h: 1, topo: 30, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 5, py + 14, 4);
      ret(ctx, px + 3, py - 28, 2, 42, K); ret(ctx, px + 3, py - 28, 1, 42, '#e8ecf5');
      ret(ctx, px + 5, py - 26, 11, 13, K); ret(ctx, px + 5, py - 26, 10, 12, ROSA);
      ret(ctx, px + 5, py - 15, 10, 1, '#c85a94');
      ret(ctx, px + 9, py - 23, 2, 6, OURO); ret(ctx, px + 7, py - 21, 6, 2, OURO);
    } });
})();
