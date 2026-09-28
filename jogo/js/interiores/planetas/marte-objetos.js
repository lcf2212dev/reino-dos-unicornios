/* Planeta Marte, o chão, o horizonte e os objetos (prefixo marte-): areia vermelha ('marte-areia'), céu com o
   Monte Olimpo e as luazinhas Fobos e Deimos ('marte-horizonte'), dunas, rochas, crateras, jipe-robô, painel solar,
   gelo do polo, antena, placa, rastro do jipe, redemoinho, pedrinhas e pedaços da nave da Rubi.
   O jipe, o redemoinho e as pedrinhas desenham o estado das brincadeiras (Reino._predios.planetas.marte, de
   marte-brincadeiras.js) no `anim`, que roda a cada quadro também sem Animações (com t = 0: parado).
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function M() { return P.marte || null; }
  // cores das rochas e da areia de Marte
  var RO = { luz: '#f6c29a', claro: '#e0875a', meio: '#c0603a', escuro: '#8a3a24', fundo: '#5e2418' };
  var OURO = '#ffc94d', ROSA = '#ff8ac4', CIANO = '#6fd6ff', GELO = '#e8f6ff', METAL = '#d8dce8', METAL2 = '#9aa4bc';

  /* ---------- o chão: areia vermelha com pedrinhas e marcas de vento (contraste com a Mariana ≥ 2,9) ---------- */
  I.PISOS['marte-areia'] = { cores: { piso: '#e7a070', piso2: '#dc9062', detalhe: '#b8643e', luz: '#f6c29a' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var s = sorte(tx, ty, 1);
      if (s < 0.5) ret(ctx, px + Math.floor(s * 14), py + 2, 8, 4, p.piso2);
      // marquinhas de vento na areia (ondinhas)
      if (sorte(tx, ty, 2) < 0.45) {
        var my = py + 8 + Math.floor(sorte(tx, ty, 3) * 5), mx = px + Math.floor(sorte(tx, ty, 4) * 6);
        ret(ctx, mx, my, 4, 1, p.detalhe); ret(ctx, mx + 4, my - 1, 4, 1, p.detalhe); ret(ctx, mx + 8, my, 3, 1, p.detalhe);
        ret(ctx, mx + 4, my, 4, 1, p.luz);
      }
      // pedrinhas escuras com luz em cima
      for (var i = 0; i < 3; i++) {
        var r = sorte(tx, ty, 10 + i), x = px + Math.floor(r * 14), y = py + Math.floor(sorte(tx, ty, 20 + i) * 14);
        if (r < 0.35) { ret(ctx, x, y, 2, 2, p.detalhe); ret(ctx, x, y, 1, 1, p.luz); } else ret(ctx, x, y, 1, 1, r < 0.7 ? p.piso2 : p.luz);
      }
    } };

  /* ---------- o horizonte: céu com poeira, Fobos e Deimos, o Monte Olimpo e morros vermelhos ---------- */
  // luazinha em forma de batata
  function luazinha(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K); elipse(ctx, cx, cy, rx, ry, '#b8a494');
    elipse(ctx, cx - 1, cy - 1, rx - 1, ry - 1, '#d8c6b4'); ret(ctx, cx + 1, cy, 2, 1, '#8e7a6c');
  }
  // o Monte Olimpo: vulcão largo e baixinho, com a boca no topo
  function olimpo(ctx, cx, base) {
    for (var dx = -44; dx <= 44; dx++) {
      var f = 1 - Math.abs(dx) / 44, h = Math.round(15 * Math.min(1, f * 1.6));
      if (h <= 0) continue;
      ret(ctx, cx + dx, base - h - 1, 1, h + 1, K);
      ret(ctx, cx + dx, base - h, 1, h, dx < 0 ? '#b0543a' : '#8e3e2c');
      if (dx < -4 && h > 3) ret(ctx, cx + dx, base - h, 1, 1, '#d8784e');
    }
    ret(ctx, cx - 6, base - 16, 12, 2, '#6e2c20'); ret(ctx, cx - 5, base - 16, 10, 1, '#4e1c16');
  }
  I.PAREDES['marte-horizonte'] = { cores: { parede: '#1a0c24', parede2: '#b8583a', rodape: '#dc9062', detalhe: '#8a3a2c' },
    desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      if (P.estrelas) P.estrelas(ctx, px, py, 16, 14, 70, 300 + tx);
      // névoa de poeira perto do chão: faixas lisas que clareiam para baixo
      ['#211026', '#2a1328', '#34182a', '#401e2c', '#4c242e'].forEach(function (c, i) { ret(ctx, px, py + 12 + i * 3, 16, 3, c); });
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, 16, 32); ctx.clip();
      if (typeof p.fobos === 'number') luazinha(ctx, p.fobos * 16 + 8, py + 7, 4, 3);
      if (typeof p.deimos === 'number') luazinha(ctx, p.deimos * 16 + 4, py + 4, 2, 2);
      if (typeof p.olimpo === 'number') olimpo(ctx, p.olimpo * 16 + 8, py + 26);
      ctx.restore();
      // morros avermelhados: duas camadas
      var a = 23 + Math.round(Math.sin(tx * 0.8) * 2 + Math.sin(tx * 0.33) * 2);
      for (var i = 0; i < 16; i++) {
        var h1 = a + Math.round(Math.sin((tx * 16 + i) / 8) * 2);
        ret(ctx, px + i, py + h1, 1, 32 - h1, p.detalhe);
        var h2 = 27 + Math.round(Math.sin((tx * 16 + i) / 5) * 1.5);
        ret(ctx, px + i, py + h2, 1, 32 - h2, p.parede2);
      }
      ret(ctx, px, py + 30, 16, 2, p.rodape);
    } };

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(90,30,20,0.3)'); }
  function rocha(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K);
    elipse(ctx, cx, cy, rx, ry, RO.meio);
    elipse(ctx, cx - 1, cy - 1, rx - 2, ry - 2, RO.claro);
    ret(ctx, cx - Math.round(rx / 2), cy - ry + 2, 2, 1, RO.luz);
    ret(ctx, cx + Math.round(rx / 3), cy + Math.round(ry / 3), 2, 2, RO.escuro);
  }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }
  function cratera(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, RO.escuro);
    elipse(ctx, cx, cy, rx, ry, RO.luz);
    elipse(ctx, cx, cy + 1, rx - 2, ry - 2, RO.meio);
    elipse(ctx, cx + 1, cy + 2, rx - 4, ry - 3, RO.claro);
  }

  /* ---------- dunas, rochas e crateras ---------- */
  // duna grande (2×2): o tobogã de areia, com as marquinhas de quem já escorregou
  I.objeto('marte-duna', { w: 2, h: 2, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 15);
      elipse(ctx, px + 16, py + 20, 16, 10, K);
      elipse(ctx, px + 16, py + 20, 15, 9, '#d27a4c');
      elipse(ctx, px + 13, py + 18, 11, 6, '#e8955e');
      elipse(ctx, px + 11, py + 16, 6, 3, RO.luz);
      for (var i = 0; i < 4; i++) ret(ctx, px + 18 + i * 2, py + 14 + i * 3, 3, 1, RO.escuro);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var d = t ? Math.round(Math.sin(t / 300) * 2) : 0;
      ret(ctx, px + 15, py + 3 + d, 2, 5, OURO); triangulo(ctx, px + 13, py + 8 + d, 6, 4, OURO);
    } });
  I.objeto('marte-duninha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, '#d27a4c'); elipse(ctx, px + 7, py + 9, 5, 2, RO.luz);
      ret(ctx, px + 10, py + 11, 3, 1, RO.escuro);
    } });
  I.objeto('marte-rocha', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      rocha(ctx, px + 7, py + 9, 6, 5); rocha(ctx, px + 12, py + 12, 3, 2);
    } });
  I.objeto('marte-rocha-alta', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 3, py - 10, 10, 24, K); ret(ctx, px + 4, py - 9, 8, 22, RO.meio);
      ret(ctx, px + 5, py - 15, 7, 6, K); ret(ctx, px + 6, py - 14, 5, 5, RO.claro);
      ret(ctx, px + 4, py - 9, 3, 22, RO.claro); ret(ctx, px + 6, py - 13, 1, 2, RO.luz);
      ret(ctx, px + 4, py - 2, 8, 1, RO.escuro); ret(ctx, px + 4, py + 6, 8, 1, RO.escuro);
    } });
  I.objeto('marte-seixos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 5], [9, 3], [12, 10], [5, 11], [8, 8]].forEach(function (s, i) {
        ret(ctx, px + s[0], py + s[1], 3, 2, RO.fundo); ret(ctx, px + s[0], py + s[1], 2, 1, i % 2 ? RO.luz : RO.claro);
      });
    } });
  I.objeto('marte-cratera', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py) { cratera(ctx, px + 16, py + 17, 14, 10); } });
  I.objeto('marte-cratera-p', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { cratera(ctx, px + 8, py + 9, 6, 4); } });
  I.objeto('marte-poeira', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 3, '#f0b484'); elipse(ctx, px + 7, py + 9, 4, 2, RO.luz);
      ret(ctx, px + 2, py + 5, 1, 1, RO.meio); ret(ctx, px + 13, py + 6, 1, 1, RO.meio);
    } });
  // rastro das rodas do jipe-robô (var.giro: 1 = de lado)
  I.objeto('marte-rastro', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var lado = o.var && o.var.giro;
      for (var i = 0; i < 4; i++) {
        if (lado) { ret(ctx, px + i * 4, py + 4, 3, 2, RO.escuro); ret(ctx, px + i * 4, py + 10, 3, 2, RO.escuro); }
        else { ret(ctx, px + 4, py + i * 4, 2, 3, RO.escuro); ret(ctx, px + 10, py + i * 4, 2, 3, RO.escuro); }
      }
    } });

  /* ---------- gelo do polo e pedrinhas coloridas ---------- */
  I.objeto('marte-gelo', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 12, 7, 3, K); elipse(ctx, px + 8, py + 12, 6, 2, GELO);
      [[3, 8, 4], [7, 12, 5], [11, 9, 4]].forEach(function (c) {
        ret(ctx, px + c[0] - 1, py + c[1] - c[2] - 3, c[2] - 1, c[2] + 3, K);
        triangulo(ctx, px + c[0] - 1, py + c[1] - c[2] * 2 - 1, c[2] - 1, c[2], K);
        ret(ctx, px + c[0], py + c[1] - c[2] - 2, c[2] - 3, c[2] + 1, '#bfe8ff');
        ret(ctx, px + c[0], py + c[1] - c[2] - 2, 1, c[2], '#ffffff');
      });
      brilho(ctx, px + 13, py - 1, '#ffffff');
    } });
  // pedrinha colorida para pegar (acao.n = qual das 5); pega: só o buraquinho na areia
  I.objeto('marte-pedrinha', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 12, 5, 2, RO.claro); },
    anim: function (ctx, px, py, t, o) {
      var m = M(), n = (o.acao && o.acao.n) || 0, cor = ['#b58cff', CIANO, ROSA, '#8cf0c8', OURO][n % 5];
      if (m && m.pedrinhaPega(n)) { ret(ctx, px + 6, py + 11, 4, 2, RO.escuro); return; }
      elipse(ctx, px + 8, py + 9, 5, 4, K); elipse(ctx, px + 8, py + 9, 4, 3, cor);
      ret(ctx, px + 6, py + 7, 2, 1, '#ffffff');
      t = tempo(t);
      var fase = t ? Math.floor(t / 300 + n * 2) % 6 : 0;
      if (fase < 2) brilho(ctx, px + 13, py + 3 + fase, '#ffffff');
    } });

  /* ---------- coisas dos exploradores ---------- */
  // o jipe-robô (2×2): anda um pouquinho e volta quando a Mariana toca (só com Animações)
  function jipe(ctx, x, y, giro) {
    sombra(ctx, x + 16, y + 28, 15);
    [5, 16, 27].forEach(function (rx) {
      circulo(ctx, x + rx, y + 23, 5, K); circulo(ctx, x + rx, y + 23, 3, '#5a5a6e');
      ret(ctx, x + rx - 1 + (giro % 2), y + 21 + (giro % 2), 2, 2, METAL2);
    });
    ret(ctx, x + 2, y + 12, 28, 8, K); ret(ctx, x + 3, y + 13, 26, 6, METAL); ret(ctx, x + 3, y + 13, 26, 1, '#ffffff');
    ret(ctx, x + 6, y + 15, 8, 3, OURO);
    // mastro com a "cabeça" de câmeras
    ret(ctx, x + 22, y - 2, 2, 14, K);
    ret(ctx, x + 18, y - 7, 11, 6, K); ret(ctx, x + 19, y - 6, 9, 4, METAL);
    ret(ctx, x + 20, y - 5, 2, 2, '#3a4a7a'); ret(ctx, x + 24, y - 5, 2, 2, '#3a4a7a'); ret(ctx, x + 20, y - 5, 1, 1, CIANO);
    // braço de pegar amostras e a antena
    ret(ctx, x + 1, y + 8, 2, 6, K); ret(ctx, x - 1, y + 7, 4, 2, K);
    ret(ctx, x + 8, y + 2, 1, 10, K); circulo(ctx, x + 8, y + 1, 2, '#e0433f');
  }
  I.objeto('marte-jipe', { w: 2, h: 2, topo: 12, solido: true,
    desenhar: function () {},
    anim: function (ctx, px, py, t) {
      var m = M(), tt = tempo(t), f = m ? m.progresso('jipe', tt) : null;
      var dx = f === null ? 0 : Math.round(Math.sin(f * Math.PI) * 20);
      jipe(ctx, px + dx, py, f === null ? 0 : Math.floor(tt / 120));
    } });
  // painel solar em cavalete
  I.objeto('marte-painel', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 7, py, 2, 14, K);
      ret(ctx, px, py - 12, 16, 13, K); ret(ctx, px + 1, py - 11, 14, 11, '#3a5ab8');
      for (var i = 0; i < 3; i++) ret(ctx, px + 1 + i * 5, py - 11, 1, 11, '#8ab0ff');
      ret(ctx, px + 1, py - 6, 14, 1, '#8ab0ff'); ret(ctx, px + 2, py - 10, 3, 1, '#ffffff');
    } });
  // antena parabólica que conversa com a Terra
  I.objeto('marte-antena', { w: 1, h: 1, topo: 20, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 6, 2, 19, K); ret(ctx, px + 4, py + 11, 8, 3, K);
      elipse(ctx, px + 8, py - 12, 8, 5, K); elipse(ctx, px + 8, py - 13, 7, 3, '#eef0f6');
      ret(ctx, px + 8, py - 20, 1, 7, K); ret(ctx, px + 7, py - 21, 3, 2, '#e0433f');
    } });
  // placa de boas-vindas com o planeta vermelho
  I.objeto('marte-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, '#c98a4b');
      ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
      ret(ctx, px + 1, py - 13, 14, 2, '#e0433f');
      circulo(ctx, px + 5, py - 6, 3, K); circulo(ctx, px + 5, py - 6, 2, '#d8613c');
      brilho(ctx, px + 11, py - 7, OURO);
    } });
  // pedaços da nave da Rubi (var.p: 0 asa, 1 motor, 2 parafusos)
  function naveAsa(ctx, x, y) {
    triangulo(ctx, x + 1, y + 2, 14, 9, K); triangulo(ctx, x + 2, y + 4, 12, 6, '#ff8ac4');
    ret(ctx, x + 4, y + 8, 8, 1, '#d8589a'); ret(ctx, x + 7, y + 5, 2, 2, '#ffffff');
  }
  I.objeto('marte-peca', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var p = (o.var && o.var.p) || 0;
      sombra(ctx, px + 8, py + 14, 7);
      if (p === 0) naveAsa(ctx, px, py + 2);
      else if (p === 1) {
        ret(ctx, px + 2, py + 1, 12, 11, K); ret(ctx, px + 3, py + 2, 10, 9, METAL); ret(ctx, px + 3, py + 2, 10, 2, '#ffffff');
        circulo(ctx, px + 8, py + 7, 3, K); circulo(ctx, px + 8, py + 7, 2, '#ff9a3a');
        ret(ctx, px + 13, py - 2, 1, 4, K); ret(ctx, px + 11, py - 4, 2, 2, METAL2);
      } else {
        [[3, 8], [9, 5], [11, 11], [5, 12]].forEach(function (s) {
          ret(ctx, px + s[0], py + s[1], 3, 3, K); ret(ctx, px + s[0], py + s[1], 2, 2, METAL);
        });
        ret(ctx, px + 6, py + 3, 2, 6, K); ret(ctx, px + 4, py + 2, 6, 2, K);
      }
    } });
  // o pedaço maior da nave da Rubi (2×1): fuselagem rosa amassada, janela rachada, aleta caída, parafusos e fumacinha
  I.objeto('marte-nave', { w: 2, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 15);
      // aleta caída na areia (à esquerda)
      triangulo(ctx, px, py + 7, 9, 6, K); triangulo(ctx, px + 1, py + 9, 7, 4, '#d8589a');
      // fuselagem: corpo comprido com o bico enterrado na areia
      ret(ctx, px + 6, py - 2, 22, 13, K); ret(ctx, px + 7, py - 1, 20, 11, '#ff8ac4');
      ret(ctx, px + 7, py - 1, 20, 2, '#ffb0d8'); ret(ctx, px + 7, py + 8, 20, 2, '#d8589a');
      triangulo(ctx, px + 26, py - 1, 6, 11, K); ret(ctx, px + 27, py + 1, 2, 7, '#ff8ac4');
      ret(ctx, px + 25, py + 9, 7, 3, RO.claro);
      // amassado (mossa escura) e faixa arrancada
      ret(ctx, px + 10, py + 2, 4, 3, '#b8407a'); ret(ctx, px + 11, py + 3, 2, 1, '#8a2a5a');
      ret(ctx, px + 15, py + 6, 5, 1, METAL2);
      // parafusos soltos no casco
      [[8, 0], [8, 7], [24, 7]].forEach(function (s) { ret(ctx, px + s[0], py + s[1], 2, 2, K); ret(ctx, px + s[0], py + s[1], 1, 1, METAL); });
      // janela rachada
      circulo(ctx, px + 20, py + 3, 4, K); circulo(ctx, px + 20, py + 3, 3, CIANO);
      ret(ctx, px + 19, py + 1, 1, 1, '#ffffff');
      ret(ctx, px + 18, py + 2, 1, 1, K); ret(ctx, px + 19, py + 3, 1, 1, K); ret(ctx, px + 20, py + 4, 1, 1, K);
      ret(ctx, px + 21, py + 3, 1, 1, K); ret(ctx, px + 22, py + 2, 1, 1, K);
      // fumacinha saindo do motor quebrado (parada)
      circulo(ctx, px + 12, py - 5, 2, '#9a8a90'); circulo(ctx, px + 14, py - 9, 3, '#b8aab0'); circulo(ctx, px + 11, py - 13, 2, '#d0c6ca');
    } });

  /* ---------- redemoinho de poeira: gira sempre com Animações, mais alto quando tocado ---------- */
  I.objeto('marte-redemoinho', { w: 1, h: 1, topo: 22, solido: true,
    desenhar: function (ctx, px, py) { elipse(ctx, px + 8, py + 13, 6, 2, 'rgba(90,30,20,0.25)'); },
    anim: function (ctx, px, py, t) {
      var m = M(), tt = tempo(t), f = m ? m.progresso('redemoinho', tt) : null;
      var alto = f === null ? 0 : Math.round(Math.sin(f * Math.PI) * 10), gira = tt / 90;
      for (var i = 0; i < 7; i++) {
        var y = py + 12 - i * (3 + alto / 7), larg = 2 + i * 1.4, x = px + 8 + Math.round(Math.sin(gira + i * 0.9) * (larg / 2));
        ret(ctx, Math.round(x - larg / 2) - 1, Math.round(y) - 1, Math.round(larg) + 2, 3, 'rgba(120,50,30,0.35)');
        ret(ctx, Math.round(x - larg / 2), Math.round(y), Math.round(larg), 1, i % 2 ? '#f0b484' : RO.claro);
      }
      if (f !== null) { brilho(ctx, px + 2, py - 6 - alto, RO.luz); brilho(ctx, px + 14, py - 2 - alto, OURO); }
    } });
})();
