/* Planeta Vênus, os objetos (prefixo venus-): o chão de rocha amarelada com rachaduras ('venus-rocha'), o horizonte
   de nuvens amarelas grossas, o Sol grande e os vulcões ao longe (Maat Mons) ('venus-horizonte'), vulcõezinhos,
   gêiser, vapor, pedras quentes, cristais e as coisas de Geografia: rosa dos ventos, placas de direção, globo,
   mapa-múndi, bússola e luneta. Os vulcões, o gêiser, a rosa e os cristais desenham o estado das brincadeiras
   (Reino._predios.planetas.venus, de venus-brincadeiras.js) no `anim`, que roda a cada quadro também sem Animações
   (com t = 0: parado). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function S() { return P.venus || null; }
  // cores da rocha de Vênus
  var RO = { luz: '#fbe3a4', claro: '#eec070', meio: '#c98a44', escuro: '#8a5530' };
  var OURO = '#ffc94d', LARANJA = '#f08a3c', BRASA = '#ff5a2a', VAPOR = '#fff6e0', VAPOR2 = '#f3e2c0';
  var AZUL = '#4a8ee0', VERDE = '#5cc46a', MADEIRA = '#c98a4b';

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(110,60,20,0.3)'); }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }
  function pedra(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, RO.meio);
    elipse(ctx, cx - 1, cy - 1, rx - 2, ry - 2, RO.claro); ret(ctx, cx - Math.round(rx / 2), cy - ry + 2, 2, 1, RO.luz);
  }
  // nuvenzinha de vapor (bolinhas claras)
  function nuvem(ctx, cx, cy, r) {
    circulo(ctx, cx - r, cy + 1, r, VAPOR2); circulo(ctx, cx + r, cy + 1, r, VAPOR2);
    circulo(ctx, cx, cy - 1, r + 1, VAPOR); circulo(ctx, cx - r + 1, cy, r - 1, VAPOR);
  }
  // uma coluna de vapor subindo de (cx, base), `n` nuvens; `d` desloca com Animações
  function coluna(ctx, cx, base, n, d) {
    for (var i = 0; i < n; i++) nuvem(ctx, cx + ((i % 2) ? 2 : -2) + (i ? d : 0), base - 4 - i * 7, 2 + Math.min(i, 2));
  }
  // placa num poste (plaquinha de madeira)
  function plaquinha(ctx, px, py, faixa) {
    sombra(ctx, px + 8, py + 14, 5);
    ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, MADEIRA);
    ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
    ret(ctx, px + 1, py - 13, 14, 2, faixa);
  }

  /* ---------- o chão: rocha amarelo-esverdeada (enxofre; D2B-10: não confunde com Marte) com rachaduras e pedrinhas ---------- */
  I.PISOS['venus-rocha'] = { cores: { piso: '#b8c864', piso2: '#a8b656', detalhe: '#6e7430', luz: '#d8e090' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var s = sorte(tx, ty, 1);
      // manchas mais escuras arredondadas
      if (s < 0.35) elipse(ctx, px + 4 + Math.floor(s * 24), py + 5 + Math.floor(sorte(tx, ty, 3) * 6), 3, 2, p.piso2);
      // rachadura em zigue-zague
      if (sorte(tx, ty, 4) < 0.35) {
        var rx = px + 1 + Math.floor(sorte(tx, ty, 5) * 6), ry = py + 3 + Math.floor(sorte(tx, ty, 6) * 8);
        ret(ctx, rx, ry, 3, 1, p.detalhe); ret(ctx, rx + 3, ry + 1, 3, 1, p.detalhe); ret(ctx, rx + 6, ry, 3, 1, p.detalhe);
        ret(ctx, rx + 1, ry + 1, 2, 1, p.luz);
      }
      // pedrinhas e pontinhos claros
      for (var i = 0; i < 3; i++) {
        var r = sorte(tx, ty, 10 + i), x = px + Math.floor(r * 14), y = py + Math.floor(sorte(tx, ty, 20 + i) * 14);
        if (r < 0.4) { ret(ctx, x, y, 2, 2, p.detalhe); ret(ctx, x, y, 1, 1, p.piso2); } else ret(ctx, x, y, 1, 1, p.luz);
      }
    } };

  /* ---------- o horizonte: nuvens amarelas grossas, o Sol grande e os vulcões ao longe ---------- */
  var SOL = { col: 18, r: 10 };
  // vulcões ao longe: coluna do pico (em px do interior), altura e meia-largura; o 1º é o Maat Mons
  var VULCOES = [{ x: 104, alt: 13, larg: 46 }, { x: 232, alt: 8, larg: 28 }, { x: 330, alt: 10, larg: 34 }];
  function morro(X) {
    var h = 23 + Math.round(Math.sin(X / 13) * 1.2);
    VULCOES.forEach(function (v) { var d = Math.abs(X - v.x); if (d < v.larg) h = Math.min(h, 23 - Math.round(v.alt * (1 - d / v.larg))); });
    return h;
  }
  I.PAREDES['venus-horizonte'] = { cores: { parede: '#e8a94a', parede2: '#f4c96a', rodape: '#a8b656', detalhe: '#8a5530' },
    desenhar: function (ctx, px, py, tx, p) {
      // o céu: faixas de nuvem amarela, mais clara no alto
      ret(ctx, px, py, 16, 32, p.parede);
      ret(ctx, px, py, 16, 8, p.parede2); ret(ctx, px, py + 8, 16, 3, '#eeb858');
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      // o Sol grande e brilhante, meio escondido nas nuvens
      if (Math.abs(tx - SOL.col) <= 1) {
        var sx = SOL.col * 16 + 8, sy = py + 9;
        circulo(ctx, sx, sy, SOL.r + 3, 'rgba(255,248,210,0.45)'); circulo(ctx, sx, sy, SOL.r, '#fff3b8');
        circulo(ctx, sx - 1, sy - 1, SOL.r - 3, '#fffdf0');
      }
      // nuvens grossas em rolos (bolinhas sorteadas por coluna)
      for (var k = 0; k < 3; k++) {
        var nx = px + Math.floor(sorte(tx, k, 31) * 16), ny = py + 3 + k * 5 + Math.floor(sorte(tx, k, 32) * 3);
        elipse(ctx, nx, ny + 1, 7, 3, '#d8923a'); elipse(ctx, nx, ny, 7, 3, k === 1 ? '#fbe29a' : '#f7d27a');
        ret(ctx, nx - 3, ny - 2, 5, 1, '#fff1c2');
      }
      // os vulcões ao longe, com fumaça saindo do pico
      for (var i = 0; i < 16; i++) {
        var X = tx * 16 + i, h = morro(X);
        ret(ctx, px + i, py + h, 1, 28 - h, h < 21 ? '#9a6232' : '#b87a3e');
        if (h < 21) ret(ctx, px + i, py + h, 1, 1, '#c98a4b');
      }
      VULCOES.forEach(function (v) {
        if (Math.abs(v.x - (tx * 16 + 8)) > 16) return;
        var top = py + 23 - v.alt;
        ret(ctx, v.x - 2, top, 5, 1, BRASA);
        elipse(ctx, v.x + 1, top - 4, 3, 2, VAPOR2); elipse(ctx, v.x + 3, top - 8, 4, 2, VAPOR);
      });
      ctx.restore();
      ret(ctx, px, py + 28, 16, 1, p.detalhe);
      ret(ctx, px, py + 29, 16, 3, p.rodape);
    } };

  /* ---------- rochas ---------- */
  I.objeto('venus-rocha', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) { sombra(ctx, px + 8, py + 14, 7); pedra(ctx, px + 7, py + 9, 6, 5); pedra(ctx, px + 12, py + 12, 3, 2); } });
  I.objeto('venus-rochas', { w: 2, h: 2, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 14);
      pedra(ctx, px + 9, py + 20, 8, 7); pedra(ctx, px + 22, py + 21, 8, 6); pedra(ctx, px + 15, py + 9, 7, 7);
      ret(ctx, px + 12, py + 5, 3, 1, RO.luz);
    } });
  // pedra alta e pontuda
  I.objeto('venus-pedra-alta', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      triangulo(ctx, px + 2, py - 14, 12, 28, K); triangulo(ctx, px + 3, py - 12, 10, 25, RO.meio);
      ret(ctx, px + 6, py - 6, 2, 16, RO.claro); ret(ctx, px + 10, py + 2, 1, 9, RO.escuro);
    } });
  // pedra quente: rachaduras brilhando em laranja
  I.objeto('venus-pedra-quente', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      pedra(ctx, px + 8, py + 9, 7, 5);
      ret(ctx, px + 4, py + 9, 4, 1, BRASA); ret(ctx, px + 8, py + 10, 3, 1, LARANJA); ret(ctx, px + 10, py + 7, 1, 3, BRASA);
      ret(ctx, px + 5, py + 8, 2, 1, OURO);
    } });
  I.objeto('venus-rachadura', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 4, 4, 1, RO.escuro); ret(ctx, px + 5, py + 5, 3, 1, RO.escuro); ret(ctx, px + 8, py + 6, 4, 1, RO.escuro);
      ret(ctx, px + 11, py + 7, 1, 4, RO.escuro); ret(ctx, px + 6, py + 5, 1, 1, BRASA); ret(ctx, px + 12, py + 11, 3, 1, RO.escuro);
    } });
  I.objeto('venus-pedrinhas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 5], [9, 3], [12, 10], [5, 11], [8, 8]].forEach(function (s, i) {
        ret(ctx, px + s[0], py + s[1], 3, 2, RO.escuro); ret(ctx, px + s[0], py + s[1], 2, 1, i % 2 ? RO.luz : RO.claro);
      });
    } });
  // poça de enxofre amarelinho
  I.objeto('venus-enxofre', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 9, 6, 3, '#c9a020'); elipse(ctx, px + 7, py + 9, 5, 2, '#f6e24a'); ret(ctx, px + 4, py + 8, 3, 1, '#fffbb0'); } });
  // vapor saindo de uma fresta no chão
  I.objeto('venus-vapor', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 12, 8, 1, RO.escuro); ret(ctx, px + 7, py + 12, 2, 1, BRASA);
      nuvem(ctx, px + 8, py + 8, 2); nuvem(ctx, px + 9, py + 3, 1);
    } });

  /* ---------- cristais para pegar (acao.n = qual dos 5) ---------- */
  I.objeto('venus-cristal', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 12, 6, 3, K); elipse(ctx, px + 8, py + 12, 5, 2, RO.escuro); },
    anim: function (ctx, px, py, t, o) {
      var s = S(), n = (o.acao && o.acao.n) || 0, cor = [OURO, LARANJA, '#ffe07a', '#ff9f6a', '#f6c0ff'][n % 5];
      if (s && s.cristalPego(n)) { ret(ctx, px + 6, py + 9, 4, 3, K); ret(ctx, px + 7, py + 10, 2, 1, RO.meio); return; }
      ret(ctx, px + 5, py - 4, 6, 14, K); triangulo(ctx, px + 5, py - 9, 6, 6, K);
      ret(ctx, px + 6, py - 3, 4, 12, cor); triangulo(ctx, px + 6, py - 7, 4, 4, cor);
      ret(ctx, px + 6, py - 3, 1, 11, '#ffffff');
      ret(ctx, px + 10, py + 2, 3, 8, K); ret(ctx, px + 11, py + 3, 1, 6, cor);
      ret(ctx, px + 2, py + 4, 3, 6, K); ret(ctx, px + 3, py + 5, 1, 4, cor);
      t = tempo(t);
      var fase = t ? Math.floor(t / 300 + n * 2) % 6 : 0;
      if (fase < 2) brilho(ctx, px + 12, py - 6 + fase, '#ffffff');
    } });

  /* ---------- vulcõezinhos (acao.i): soltam vapor ao tocar ---------- */
  I.objeto('venus-vulcao', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 8);
      triangulo(ctx, px, py - 4, 16, 18, K); triangulo(ctx, px + 1, py - 3, 14, 16, '#a8683a');
      ret(ctx, px + 4, py + 4, 2, 8, '#c98a4b'); ret(ctx, px + 11, py + 6, 1, 6, RO.escuro);
      ret(ctx, px + 5, py - 4, 6, 3, K); ret(ctx, px + 6, py - 3, 4, 1, BRASA);
      ret(ctx, px + 6, py - 1, 1, 4, LARANJA); ret(ctx, px + 9, py, 1, 3, BRASA);
    },
    anim: function (ctx, px, py, t, o) {
      var s = S(), i = (o.acao && o.acao.i) || 0, d = 0;
      t = tempo(t);
      if (t) d = Math.round(Math.sin(t / 260 + i) * 1.5);
      if (s && s.fumegando(i)) coluna(ctx, px + 8, py - 4, 4, d);
      else nuvem(ctx, px + 8 + d, py - 8, 1);
    } });

  /* ---------- gêiser (2×2): solta uma coluna alta de vapor ao tocar ---------- */
  I.objeto('venus-geiser', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 18, 14, 10, K); elipse(ctx, px + 16, py + 18, 13, 9, '#d8c08a');
      elipse(ctx, px + 16, py + 18, 9, 6, '#b89456'); elipse(ctx, px + 16, py + 19, 5, 3, K);
      elipse(ctx, px + 16, py + 19, 4, 2, '#5a3a20');
      for (var k = 0; k < 8; k++) {
        var a = k / 8 * Math.PI * 2;
        ret(ctx, px + 16 + Math.round(Math.cos(a) * 12), py + 18 + Math.round(Math.sin(a) * 8), 2, 2, k % 2 ? '#f6e24a' : '#fff1dc');
      }
    },
    anim: function (ctx, px, py, t) {
      var s = S(), d = 0;
      t = tempo(t);
      if (t) d = Math.round(Math.sin(t / 200) * 2);
      if (s && s.jorrando()) coluna(ctx, px + 16, py + 16, 6, d);
      else { nuvem(ctx, px + 16, py + 12 + (d > 0 ? 1 : 0), 2); nuvem(ctx, px + 18, py + 6, 1); }
    } });

  /* ---------- Geografia ---------- */
  // rosa dos ventos no chão (2×2): quatro pontas; a ponta tocada por último fica dourada
  var PONTAS = { norte: [0, -1], leste: [1, 0], sul: [0, 1], oeste: [-1, 0] };
  I.objeto('venus-rosa', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 17, 15, 12, K); elipse(ctx, px + 16, py + 17, 14, 11, '#f7e3b4');
      elipse(ctx, px + 16, py + 17, 11, 8, '#efd49a');
      // pontas diagonais pequenas
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (v) { ret(ctx, px + 15 + v[0] * 6, py + 16 + v[1] * 4, 2, 2, '#b88a5a'); });
    },
    anim: function (ctx, px, py, t) {
      var s = S(), atual = s ? s.ponta : null, cx = px + 16, cy = py + 17;
      Object.keys(PONTAS).forEach(function (k) {
        var v = PONTAS[k], lit = k === atual, cor = lit ? OURO : (k === 'norte' ? '#e0433f' : '#6a4a3a');
        var ex = cx + v[0] * 12, ey = cy + v[1] * 9;
        // uma ponta: triângulo fininho do centro até a borda
        for (var j = 0; j <= 10; j++) {
          var f = j / 10, x = Math.round(cx + (ex - cx) * f), y = Math.round(cy + (ey - cy) * f), w = 3 - Math.floor(f * 3);
          ret(ctx, x - (v[1] ? w : 0), y - (v[0] ? w : 0), v[1] ? 2 * w + 1 : 1, v[0] ? 2 * w + 1 : 1, K);
          if (w > 0) ret(ctx, x - (v[1] ? w - 1 : 0), y - (v[0] ? w - 1 : 0), v[1] ? 2 * w - 1 : 1, v[0] ? 2 * w - 1 : 1, cor);
        }
        if (lit) brilho(ctx, ex + v[0] * 2, ey + v[1] * 2, '#ffffff');
      });
      circulo(ctx, cx, cy, 2, K); circulo(ctx, cx, cy, 1, OURO);
    } });
  // placas de direção (var.p: norte, sul, leste, oeste): uma seta
  I.objeto('venus-direcao', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py, o) {
      var p = (o.var && o.var.p) || 'norte', v = PONTAS[p] || PONTAS.norte, cx = px + 8, cy = py - 7;
      plaquinha(ctx, px, py, p === 'norte' ? '#e0433f' : AZUL);
      // seta inteira na área clara (py-11 a py-4): cabeça de 4 degraus (1, 3, 5, 7) e haste de 2 px
      for (var k = 0; k < 4; k++) {
        var w = 2 * k + 1;
        if (v[1]) ret(ctx, cx - k - 1, v[1] < 0 ? py - 11 + k : py - 4 - k, w + 1, 1, K);
        else ret(ctx, v[0] > 0 ? px + 13 - k : px + 2 + k, cy - k - 1, 1, w + 1, K);
      }
      if (v[1]) ret(ctx, cx - 1, v[1] < 0 ? py - 7 : py - 11, 2, 4, K);
      else ret(ctx, v[0] > 0 ? px + 4 : px + 6, cy - 1, 6, 2, K);
    } });
  I.objeto('venus-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      plaquinha(ctx, px, py, LARANJA);
      circulo(ctx, px + 7, py - 6, 4, '#f4c96a'); ret(ctx, px + 4, py - 7, 6, 1, '#fff1c2'); ret(ctx, px + 5, py - 4, 5, 1, '#d9a352');
      brilho(ctx, px + 13, py - 9, OURO);
    } });
  // globo da Terra no pezinho
  I.objeto('venus-globo', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 4, py + 11, 8, 3, K); ret(ctx, px + 5, py + 12, 6, 1, MADEIRA); ret(ctx, px + 7, py + 4, 2, 8, K);
      circulo(ctx, px + 8, py - 2, 7, K); circulo(ctx, px + 8, py - 2, 6, AZUL);
      ret(ctx, px + 4, py - 6, 4, 3, VERDE); ret(ctx, px + 9, py - 3, 3, 5, VERDE); ret(ctx, px + 5, py, 2, 2, VERDE);
      ret(ctx, px + 5, py - 7, 2, 1, '#b8dcff');
      ret(ctx, px + 14, py - 6, 1, 10, '#e8c77a');
    } });
  // mapa-múndi num cavalete (2×1)
  I.objeto('venus-mapa', { w: 2, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      ret(ctx, px + 5, py + 2, 2, 12, K); ret(ctx, px + 25, py + 2, 2, 12, K);
      ret(ctx, px + 2, py - 14, 28, 18, K); ret(ctx, px + 3, py - 13, 26, 16, '#6aa8ec');
      // continentes
      ret(ctx, px + 5, py - 11, 6, 5, VERDE); ret(ctx, px + 8, py - 6, 3, 6, VERDE);
      ret(ctx, px + 14, py - 11, 4, 4, VERDE); ret(ctx, px + 14, py - 7, 4, 6, '#e8c77a');
      ret(ctx, px + 20, py - 11, 7, 4, VERDE); ret(ctx, px + 23, py - 3, 4, 3, VERDE);
      ret(ctx, px + 3, py - 13, 26, 1, '#ffffff'); ret(ctx, px + 3, py + 2, 26, 1, '#3a78c0');
    } });
  // bússola grandona: a agulha vermelha aponta o Norte
  I.objeto('venus-bussola', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      circulo(ctx, px + 8, py + 6, 7, K); circulo(ctx, px + 8, py + 6, 6, '#e8c77a'); circulo(ctx, px + 8, py + 6, 5, '#fff8e6');
      ret(ctx, px + 7, py - 2, 2, 2, K);
      ret(ctx, px + 7, py + 1, 2, 5, '#e0433f'); ret(ctx, px + 7, py + 6, 2, 5, '#6a6a7a');
      ret(ctx, px + 8, py + 6, 1, 1, K); ret(ctx, px + 5, py + 3, 1, 1, '#ffffff');
    } });
  // luneta no tripé
  I.objeto('venus-luneta', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 2, 1, 11, K); ret(ctx, px + 12, py + 2, 1, 11, K); ret(ctx, px + 7, py + 2, 2, 12, K);
      for (var i = 0; i < 6; i++) {
        ret(ctx, px + 2 + i * 2, py - 2 - i * 2, 5, 5, K);
        ret(ctx, px + 3 + i * 2, py - 1 - i * 2, 3, 3, i > 3 ? OURO : '#c98a4b');
      }
      ret(ctx, px + 14, py - 13, 2, 2, '#fff3b8');
    } });
})();
