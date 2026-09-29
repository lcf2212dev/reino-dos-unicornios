/* Planeta Júpiter, os objetos (prefixo jupiter-): o chão de ilhas de nuvem ('jupiter-nuvem'), o horizonte com
   Júpiter gigante de faixas, a Grande Mancha Vermelha e as luas Io e Europa ('jupiter-horizonte'), nuvens de algodão,
   redemoinhos, cristais de amônia, raios, pontes de nuvem, balões, trampolim, letras flutuantes, caixa de correio,
   cartas, luneta e placa. Cristais, letras e redemoinho desenham o estado das brincadeiras
   (Reino._predios.planetas.jupiter, de jupiter-brincadeiras.js) no `anim`, que roda a cada quadro também sem
   Animações (com t = 0: parado). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function S() { return P.jupiter || null; }
  // cores das nuvens e do planeta
  var NU = { luz: '#fffaf0', claro: '#f7ead2', meio: '#e6cfa6', escuro: '#b9966a' };
  var OURO = '#ffc94d', ROSA = '#ff8ac4', CIANO = '#6fd6ff', LILAS = '#c9a8ff', LARANJA = '#e8914a', VERMELHO = '#c8553d';
  var CEU = '#0b0820';

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(120,80,40,0.25)'); }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }
  // nuvem fofa: bolinhas com contorno, sombra bege embaixo e brilho em cima
  function nuvem(ctx, cx, cy, r) {
    var bolas = [[-r, 1, r - 1], [0, -2, r], [r, 1, r - 1]];
    bolas.forEach(function (b) { circulo(ctx, cx + b[0], cy + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, cx + b[0], cy + b[1], b[2], NU.meio); });
    bolas.forEach(function (b) { circulo(ctx, cx + b[0], cy + b[1] - 1, b[2] - 1, NU.luz); });
    ret(ctx, cx - r - 2, cy + r - 1, 2 * r + 4, 1, NU.escuro);
  }

  /* ---------- o chão: ilhas de nuvem rosadas, fofinhas, com fiapos bege e brilhos ---------- */
  I.PISOS['jupiter-nuvem'] = { cores: { piso: '#f7c0b4', piso2: '#fbd6cc', detalhe: '#d8907e', luz: '#fff0ea' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var s = sorte(tx, ty, 1);
      // tufos claros arredondados
      if (s < 0.45) {
        var cx = px + 4 + Math.floor(sorte(tx, ty, 2) * 8), cy = py + 4 + Math.floor(sorte(tx, ty, 3) * 8);
        elipse(ctx, cx, cy, 4, 2, p.piso2); ret(ctx, cx - 3, cy + 2, 6, 1, p.detalhe);
      }
      // fiapo de vento
      if (sorte(tx, ty, 4) < 0.25) { var rx = px + 2 + Math.floor(sorte(tx, ty, 5) * 7); ret(ctx, rx, py + 12, 6, 1, p.detalhe); ret(ctx, rx + 2, py + 11, 4, 1, p.luz); }
      for (var i = 0; i < 2; i++) {
        var x = px + Math.floor(sorte(tx, ty, 10 + i) * 15), y = py + Math.floor(sorte(tx, ty, 20 + i) * 15);
        ret(ctx, x, y, 1, 1, i ? p.detalhe : p.luz);
      }
    } };

  /* ---------- o horizonte: Júpiter de faixas, a Grande Mancha Vermelha, Io e Europa, nuvens ao longe ---------- */
  var JUP = { col: 13, r: 46, faixas: ['#f4e0bd', '#d9a066', '#efd2a4', '#c47a45', '#f7e6c6', '#d8935a', '#ead0a2', '#b86c3e'] };
  var IO = 4, EUROPA = 20;
  function jupiter(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r + 1, K);
    for (var y = -r; y <= r; y++) {
      var m = Math.floor(Math.sqrt(r * r - y * y));
      ret(ctx, cx - m, cy + y, 2 * m + 1, 1, JUP.faixas[Math.floor((y + r) / 4) % JUP.faixas.length]);
      if (m > 3) ret(ctx, cx + m - 5, cy + y, 5, 1, 'rgba(90,40,10,0.22)');
    }
    // a Grande Mancha Vermelha: tempestade oval com bordas claras
    elipse(ctx, cx + 16, cy - 33, 8, 4, '#f4e0bd');
    elipse(ctx, cx + 16, cy - 33, 7, 3, VERMELHO);
    elipse(ctx, cx + 15, cy - 34, 4, 1, '#e07a5a');
    ret(ctx, cx - 18, cy - r + 4, 9, 1, '#fff4d0');
  }
  function lua(ctx, cx, cy, cor, mancha) {
    circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, cor);
    ret(ctx, cx - 1, cy, 2, 1, mancha); ret(ctx, cx + 1, cy - 2, 1, 1, mancha); ret(ctx, cx - 2, cy - 2, 1, 1, '#ffffff');
  }
  I.PAREDES['jupiter-horizonte'] = { cores: { parede: CEU, parede2: '#fff6e4', rodape: '#f7c0b4', detalhe: '#e6cfa6' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      if (P.estrelas) P.estrelas(ctx, px, py, 16, 20, 60, 400 + tx);
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      if (Math.abs(tx - JUP.col) <= 6) jupiter(ctx, JUP.col * 16 + 8, py + 48, JUP.r);
      if (tx === IO) lua(ctx, IO * 16 + 8, py + 9, '#f2d45c', '#d98a2b');
      if (tx === EUROPA) lua(ctx, EUROPA * 16 + 4, py + 7, '#f4f1e8', '#c9a27a');
      ctx.restore();
      // as ilhas de nuvem ao longe: bolotas creme em ondas
      for (var i = 0; i < 16; i++) {
        var gx = tx * 16 + i, h = 22 + Math.round(Math.abs(Math.sin(gx / 6)) * -3 + 2);
        ret(ctx, px + i, py + h, 1, 32 - h, p.detalhe);
        ret(ctx, px + i, py + h, 1, 2, p.parede2);
      }
      ret(ctx, px, py + 28, 16, 1, '#c9a67a');
      ret(ctx, px, py + 29, 16, 3, p.rodape);
    } };

  /* ---------- nuvens de algodão ---------- */
  I.objeto('jupiter-algodao', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) { sombra(ctx, px + 8, py + 14, 7); nuvem(ctx, px + 8, py + 8, 4); } });
  // nuvem grande (2×2), fofa como um travesseiro
  I.objeto('jupiter-nuvem-grande', { w: 2, h: 2, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 15);
      nuvem(ctx, px + 10, py + 20, 6); nuvem(ctx, px + 22, py + 20, 6); nuvem(ctx, px + 16, py + 11, 6);
      brilho(ctx, px + 24, py + 6, '#ffffff');
    } });
  // fiapo de nuvem no chão (enfeite)
  I.objeto('jupiter-fiapo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 6, 2, NU.luz); ret(ctx, px + 3, py + 11, 10, 1, NU.meio); ret(ctx, px + 5, py + 6, 5, 1, NU.luz);
    } });
  // gotinhas de chuva de nuvem (enfeite)
  I.objeto('jupiter-gotas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 4], [10, 3], [6, 10], [12, 11]].forEach(function (g) {
        ret(ctx, px + g[0], py + g[1], 2, 3, '#8fc3e6'); ret(ctx, px + g[0], py + g[1], 1, 1, '#e6f6ff');
      });
    } });
  // riscos de vento em curva (enfeite)
  I.objeto('jupiter-vento', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 5, 9, 1, NU.escuro); ret(ctx, px + 11, py + 4, 2, 1, NU.escuro); ret(ctx, px + 13, py + 5, 1, 2, NU.escuro);
      ret(ctx, px + 4, py + 10, 8, 1, NU.escuro); ret(ctx, px + 12, py + 9, 1, 1, NU.escuro);
    } });
  // ponte de nuvem (2×1): tábuas presas por cordinhas, com tufos fofos nas pontas
  I.objeto('jupiter-ponte', { w: 2, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 12, 24, 2, 'rgba(120,80,40,0.25)');
      ret(ctx, px + 5, py + 3, 22, 1, '#8a6a4a'); ret(ctx, px + 5, py + 11, 22, 1, '#8a6a4a');
      for (var i = 0; i < 5; i++) { ret(ctx, px + 6 + i * 4, py + 4, 3, 7, K); ret(ctx, px + 7 + i * 4, py + 5, 1, 5, '#e0b884'); }
      [3, 29].forEach(function (x) {
        circulo(ctx, px + x, py + 7, 5, K); circulo(ctx, px + x, py + 7, 4, NU.meio); circulo(ctx, px + x, py + 6, 3, NU.luz);
      });
    } });

  /* ---------- tempestade e vento ---------- */
  // raiozinho de tempestade: nuvem cinza com raio amarelo
  I.objeto('jupiter-raio', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 4, 3, 2, K); ret(ctx, px + 6, py - 2, 3, 2, K); ret(ctx, px + 8, py, 3, 2, K); ret(ctx, px + 7, py + 2, 3, 4, K);
      ret(ctx, px + 8, py - 4, 1, 2, OURO); ret(ctx, px + 7, py - 2, 1, 2, OURO); ret(ctx, px + 9, py, 1, 2, OURO); ret(ctx, px + 8, py + 2, 1, 3, OURO);
      circulo(ctx, px + 4, py - 9, 4, K); circulo(ctx, px + 11, py - 9, 5, K);
      circulo(ctx, px + 4, py - 9, 3, '#9a93b0'); circulo(ctx, px + 11, py - 9, 4, '#b3adc6'); ret(ctx, px + 9, py - 12, 3, 1, '#e3dff0');
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      if (t && Math.floor(t / 400) % 5 === 0) brilho(ctx, px + 13, py + 2, '#fff6b0');
    } });
  // redemoinho de vento: gira mais depressa quando ela toca (S.giro)
  I.objeto('jupiter-redemoinho', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) { sombra(ctx, px + 8, py + 14, 6); },
    anim: function (ctx, px, py, t) {
      var s = S(), g = s ? s.giro : 0;
      t = tempo(t);
      var fase = (t ? Math.floor(t / (g ? 90 : 220)) : 0) + g;
      for (var i = 0; i < 5; i++) {
        var w = 12 - i * 2, dx = [0, 1, 0, -1][(fase + i) % 4];
        ret(ctx, px + 8 - w / 2 + dx - 1, py + 10 - i * 4, w + 2, 3, K);
        ret(ctx, px + 8 - w / 2 + dx, py + 11 - i * 4, w, 1, i % 2 ? NU.meio : NU.luz);
      }
      brilho(ctx, px + 8 + [3, -3][fase % 2], py - 9, g ? CIANO : '#ffffff');
    } });
  // cristal de amônia para pegar (acao.n = qual dos 5)
  I.objeto('jupiter-cristal', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) { nuvem(ctx, px + 8, py + 12, 3); },
    anim: function (ctx, px, py, t, o) {
      var s = S(), n = (o.acao && o.acao.n) || 0, cor = [CIANO, LILAS, '#bff6ff', ROSA, '#fff3a8'][n % 5];
      if (s && s.cristalPego(n)) return;
      ret(ctx, px + 5, py - 3, 6, 12, K); triangulo(ctx, px + 5, py - 8, 6, 6, K);
      ret(ctx, px + 6, py - 2, 4, 10, cor); triangulo(ctx, px + 6, py - 6, 4, 4, cor);
      ret(ctx, px + 6, py - 2, 1, 9, '#ffffff');
      ret(ctx, px + 10, py + 2, 3, 7, K); ret(ctx, px + 11, py + 3, 1, 5, cor);
      t = tempo(t);
      var fase = t ? Math.floor(t / 300 + n * 2) % 6 : 0;
      if (fase < 2) brilho(ctx, px + 12, py - 5 + fase, '#ffffff');
    } });
  // nuvem-trampolim (2×2): nuvem rosada e elástica com molas
  I.objeto('jupiter-trampolim', { w: 2, h: 2, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 14);
      ret(ctx, px + 6, py + 20, 2, 8, K); ret(ctx, px + 24, py + 20, 2, 8, K);
      for (var i = 0; i < 3; i++) { ret(ctx, px + 5, py + 21 + i * 2, 4, 1, '#9aa4bc'); ret(ctx, px + 23, py + 21 + i * 2, 4, 1, '#9aa4bc'); }
      elipse(ctx, px + 16, py + 17, 15, 6, K); elipse(ctx, px + 16, py + 17, 14, 5, '#ffc7e2');
      elipse(ctx, px + 15, py + 16, 10, 3, '#fff0f7');
      [6, 12, 20, 26].forEach(function (x) { circulo(ctx, px + x, py + 13, 3, '#fff0f7'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var d = t ? Math.round(Math.sin(t / 260) * 2) : 0;
      ret(ctx, px + 15, py + 3 + d, 2, 5, OURO); triangulo(ctx, px + 13, py + 7 + d, 6, 3, OURO);
    } });
  // balão colorido flutuando, preso numa nuvem (var.c: cor)
  I.objeto('jupiter-balao', { w: 1, h: 1, topo: 28, solido: true,
    desenhar: function (ctx, px, py, o) { nuvem(ctx, px + 8, py + 11, 3); },
    anim: function (ctx, px, py, t, o) {
      var cor = [ROSA, CIANO, OURO, LILAS][((o.var && o.var.c) || 0) % 4];
      t = tempo(t);
      var d = t ? Math.round(Math.sin(t / 500 + px) * 2) : 0;
      ret(ctx, px + 8, py - 10 + d, 1, 18 - d, '#6b5a4a');
      elipse(ctx, px + 8, py - 18 + d, 6, 7, K); elipse(ctx, px + 8, py - 18 + d, 5, 6, cor);
      ret(ctx, px + 5, py - 22 + d, 2, 3, '#ffffff'); ret(ctx, px + 7, py - 11 + d, 3, 2, K);
    } });

  /* ---------- letras flutuantes (var.l: A, B, E, I, U) ---------- */
  var FONTE = {
    A: ['.#.', '#.#', '#.#', '###', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'],
    I: ['###', '.#.', '.#.', '.#.', '###'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
  };
  function letraPixel(ctx, x, y, l, cor) {
    var f = FONTE[l] || FONTE.A;
    f.forEach(function (lin, j) { for (var i = 0; i < 3; i++) if (lin[i] === '#') ret(ctx, x + i * 2, y + j * 2, 2, 2, cor); });
  }
  I.objeto('jupiter-letra', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) { nuvem(ctx, px + 8, py + 12, 3); },
    anim: function (ctx, px, py, t, o) {
      var l = (o.var && o.var.l) || 'A', s = S(), lida = s && s.letraLida(l);
      t = tempo(t);
      var d = t ? Math.round(Math.sin(t / 400 + px / 16) * 2) : 0, y = py - 12 + d;
      ret(ctx, px + 1, y - 1, 14, 14, K); ret(ctx, px + 2, y, 12, 12, lida ? '#fff3a8' : '#fffaf0');
      ret(ctx, px + 2, y, 12, 2, [ROSA, CIANO, LILAS, OURO, LARANJA]['ABEIU'.indexOf(l) % 5]);
      letraPixel(ctx, px + 5, y + 2, l, '#5a3a8a');
      if (lida) brilho(ctx, px + 14, y - 2, OURO);
    } });

  /* ---------- coisas da Tinta e dos visitantes ---------- */
  // caixa de correio das cartas da Tinta
  I.objeto('jupiter-correio', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py + 2, 2, 12, K); ret(ctx, px + 7, py + 2, 1, 12, '#c98a4b');
      ret(ctx, px + 2, py - 8, 12, 11, K); ret(ctx, px + 3, py - 7, 10, 9, '#5a8fd8'); ret(ctx, px + 3, py - 7, 10, 2, '#8cb8f0');
      ret(ctx, px + 5, py - 3, 6, 1, K);
      ret(ctx, px + 5, py - 6, 6, 3, '#ffffff'); ret(ctx, px + 6, py - 5, 4, 1, ROSA);
      ret(ctx, px + 13, py - 8, 2, 6, K); ret(ctx, px + 14, py - 8, 3, 3, '#e0433f');
    } });
  // pilha de cartas no chão
  I.objeto('jupiter-cartas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[2, 6, ROSA], [7, 3, CIANO], [5, 9, OURO]].forEach(function (c) {
        ret(ctx, px + c[0], py + c[1], 8, 6, K); ret(ctx, px + c[0] + 1, py + c[1] + 1, 6, 4, '#ffffff');
        ret(ctx, px + c[0] + 3, py + c[1] + 2, 2, 2, c[2]);
      });
    } });
  // luneta mirando a Grande Mancha Vermelha
  I.objeto('jupiter-luneta', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 2, 1, 11, K); ret(ctx, px + 12, py + 2, 1, 11, K); ret(ctx, px + 7, py + 2, 2, 12, K);
      for (var i = 0; i < 6; i++) {
        ret(ctx, px + 2 + i * 2, py - 2 - i * 2, 5, 5, K);
        ret(ctx, px + 3 + i * 2, py - 1 - i * 2, 3, 3, i > 3 ? LARANJA : '#e8ecf5');
      }
      ret(ctx, px + 14, py - 13, 2, 2, VERMELHO);
    } });
  I.objeto('jupiter-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, '#c98a4b');
      ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
      ret(ctx, px + 1, py - 13, 14, 2, LARANJA);
      circulo(ctx, px + 7, py - 6, 4, '#d9a066');
      ret(ctx, px + 3, py - 8, 9, 1, '#c47a45'); ret(ctx, px + 3, py - 5, 9, 1, '#f4e0bd');
      elipse(ctx, px + 9, py - 4, 1, 1, VERMELHO);
      brilho(ctx, px + 13, py - 9, LILAS);
    } });
})();
