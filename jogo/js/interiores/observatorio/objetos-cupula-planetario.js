/* Observatório por dentro, parte 3 de 6: os objetos de chão da Cúpula (telescópio, painel, luneta, globo)
   e do Planetário (projetor, disco da galáxia com as órbitas, o Sol e os planetas).
   Usa observatorio/ceu.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = '#3a2446';
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var ESTRELA = S.ESTRELA, AMARELA = S.AMARELA, LILAS = S.LILAS, CIANO = S.CIANO, METAL = S.METAL, METAL2 = S.METAL2,
      METAL3 = S.METAL3, AZUL = S.AZUL, AZUL2 = S.AZUL2, AZUL_CLARO = S.AZUL_CLARO, v = S.v, clarear = S.clarear,
      sorte = S.sorte, brilho = S.brilho, tempo = S.tempo, MARINHO = S.MARINHO, G_AZUL = S.G_AZUL, G_ROXO = S.G_ROXO,
      G_MAGENTA = S.G_MAGENTA, G_CIANO = S.G_CIANO, G_ROSA = S.G_ROSA, G_LILAS = S.G_LILAS, haloAnel = S.haloAnel,
      desenharPlaneta = S.desenharPlaneta, spritePlaneta = S.spritePlaneta, RAIOS = S.RAIOS, toqueSol = S.toqueSol,
      toquePlaneta = S.toquePlaneta, linhaPontos = S.linhaPontos;

  /* ================= OBJETOS: CHÃO ================= */
  // o telescópio grande, apontado para a fenda da cúpula
  I.objeto('observatorio-telescopio', { w: 2, h: 2, topo: 34, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      elipse(ctx, cx, py + 25, 14, 6, K); elipse(ctx, cx, py + 25, 13, 5, METAL3); elipse(ctx, cx, py + 24, 12, 4, METAL2);
      ret(ctx, cx - 9, py + 23, 2, 1, METAL); ret(ctx, cx + 7, py + 23, 2, 1, METAL);
      // coluna
      ret(ctx, cx - 4, py + 6, 9, 19, K); ret(ctx, cx - 3, py + 7, 7, 17, AZUL); ret(ctx, cx - 3, py + 7, 2, 17, AZUL_CLARO);
      ret(ctx, cx - 3, py + 18, 7, 1, AZUL2);
      // contrapeso
      for (var i = 0; i < 8; i++) { ret(ctx, cx - 5 - i, py + 4 + i, 3, 3, K); }
      for (var i2 = 0; i2 < 8; i2++) { ret(ctx, cx - 4 - i2, py + 5 + i2, 1, 1, METAL); }
      ret(ctx, cx - 16, py + 9, 7, 7, K); ret(ctx, cx - 15, py + 10, 5, 5, METAL2); ret(ctx, cx - 15, py + 10, 5, 1, METAL);
      // tubo (da ocular, embaixo à esquerda, até a lente, lá em cima à direita)
      var x0 = cx - 6, y0 = py + 8, dx = 16, dy = -36, n = 36, k;
      for (k = 0; k <= n; k++) ret(ctx, Math.round(x0 + dx * k / n) - 4, Math.round(y0 + dy * k / n) - 4, 9, 9, K);
      for (k = 0; k <= n; k++) {
        var tx = Math.round(x0 + dx * k / n), ty = Math.round(y0 + dy * k / n);
        ret(ctx, tx - 3, ty - 3, 7, 7, '#eef2fb');
        ret(ctx, tx + 1, ty - 3, 2, 7, '#c9d2ea');
      }
      [0.28, 0.62].forEach(function (f) {
        var bx = Math.round(x0 + dx * f), by = Math.round(y0 + dy * f);
        ret(ctx, bx - 3, by - 3, 7, 3, AZUL); ret(ctx, bx - 3, by - 3, 7, 1, AZUL_CLARO);
      });
      // lente
      var lx = x0 + dx, ly = y0 + dy;
      circulo(ctx, lx, ly, 5, K); circulo(ctx, lx, ly, 4, AZUL2); circulo(ctx, lx, ly, 3, MARINHO);
      // a galáxia refletida no vidro da lente
      ret(ctx, lx - 1, ly + 1, 3, 1, G_ROXO); ret(ctx, lx, ly + 2, 2, 1, G_MAGENTA); ret(ctx, lx + 1, ly, 1, 1, G_AZUL); ret(ctx, lx + 2, ly + 1, 1, 1, G_ROSA);
      ret(ctx, lx - 2, ly - 2, 2, 1, '#bfe9ff'); ret(ctx, lx - 2, ly - 1, 1, 1, '#bfe9ff');
      // ocular
      ret(ctx, x0 - 8, y0 + 1, 6, 4, K); ret(ctx, x0 - 7, y0 + 2, 4, 2, METAL3);
      // cabeça da montagem
      ret(ctx, cx - 6, py + 1, 11, 8, K); ret(ctx, cx - 5, py + 2, 9, 6, METAL); ret(ctx, cx - 5, py + 6, 9, 1, METAL2);
      circulo(ctx, cx - 1, py + 4, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      // halo da lente: dois anéis em pixel (o de dentro ciano, o de fora lilás), sem passar por cima do tubo;
      // com animação, os pontinhos dão a volta devagar
      var lx = px + 26, ly = py - 28, g = t ? Math.floor(t / 400) : 0;
      function tubo(a) { var d = Math.abs(((a - 1.99) + Math.PI * 3) % (Math.PI * 2) - Math.PI); return d < 0.75; }
      haloAnel(ctx, lx, ly, 7, G_CIANO, 2, g % 2, tubo);
      haloAnel(ctx, lx, ly, 9, G_LILAS, 3, g % 3, tubo);
      ret(ctx, lx - 2, ly - 2, 1, 1, g % 4 === 1 ? C.branco : '#bfe9ff');
      var on = !t || Math.floor(t / 650) % 2 === 0;
      ret(ctx, px + 17, py + 12, 2, 2, on ? '#ff5c6a' : '#7a2a3a');
      ret(ctx, px + 17, py + 15, 2, 1, (!t || Math.floor(t / 900) % 3) ? C.verde : '#2a5a3a');
    } });
  // painel de controle da cúpula (botões que piscam)
  I.objeto('observatorio-painel', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 9, 30, 23, K);
      ret(ctx, px + 2, py - 8, 28, 21, '#4a5298');
      ret(ctx, px + 2, py - 8, 28, 9, '#5f68b8');
      ret(ctx, px + 2, py + 1, 28, 1, '#2d3370');
      contornoRet(ctx, px + 4, py - 7, 10, 7, '#10183a');
      ret(ctx, px + 5, py - 4, 8, 1, '#2a6a4a'); ret(ctx, px + 6, py - 5, 1, 1, C.verde); ret(ctx, px + 9, py - 3, 1, 1, C.verde);
      contornoRet(ctx, px + 18, py - 7, 10, 7, '#10183a');
      circulo(ctx, px + 23, py - 4, 2, '#1e3a6a'); ret(ctx, px + 23, py - 4, 1, 1, CIANO);
      for (var i = 0; i < 6; i++) { ret(ctx, px + 4 + i * 4, py + 4, 3, 3, K); ret(ctx, px + 5 + i * 4, py + 5, 1, 1, '#2d3370'); }
      ret(ctx, px + 4, py + 9, 24, 2, '#2d3370');
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cores = [C.vermelho, C.ouro, C.verde, CIANO, C.rosa, C.laranja];
      var f = t ? Math.floor(t / 420) : 0;
      for (var i = 0; i < 6; i++) ret(ctx, px + 5 + i * 4, py + 5, 1, 1, (f + i) % 3 === 0 ? cores[i] : cores[(i + 3) % 6]);
      var r = t ? Math.floor(t / 180) % 8 : 2;
      ret(ctx, px + 20 + (r < 4 ? r : 7 - r), py - 5 + (r % 3), 1, 1, C.verde);
      ret(ctx, px + 5 + (t ? Math.floor(t / 250) % 8 : 3), py - 4, 1, 1, C.verde);
    } });
  // lunetinha de latão no tripé
  I.objeto('observatorio-luneta', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      linhaPontos(ctx, [px + 8, py - 2], [px + 3, py + 14], K); linhaPontos(ctx, [px + 8, py - 2], [px + 13, py + 14], K); linhaPontos(ctx, [px + 8, py - 2], [px + 8, py + 13], K);
      linhaPontos(ctx, [px + 8, py - 1], [px + 4, py + 13], C.madeira); linhaPontos(ctx, [px + 8, py - 1], [px + 12, py + 13], C.madeira);
      for (var i = 0; i < 10; i++) ret(ctx, px + 2 + i, py - 2 - Math.round(i * 0.8), 4, 4, K);
      for (var j = 0; j < 10; j++) ret(ctx, px + 3 + j, py - 1 - Math.round(j * 0.8), 2, 2, j < 4 ? C.ouro2 : C.ouro);
      ret(ctx, px + 12, py - 11, 2, 1, '#bfe9ff');
      ret(ctx, px + 7, py - 3, 3, 3, K); ret(ctx, px + 8, py - 2, 1, 1, METAL);
    } });
  // globo celeste (azul-noite com estrelas douradas)
  I.objeto('observatorio-globo', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 1;
      ret(ctx, cx - 4, py + 11, 9, 3, K); ret(ctx, cx - 3, py + 11, 7, 2, C.madeira);
      ret(ctx, cx - 1, py + 5, 3, 7, K); ret(ctx, cx, py + 5, 1, 6, C.madeira3);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, '#2a3380'); circulo(ctx, cx - 1, cy - 1, 4, '#3a44a0');
      [[-3, -2], [2, -4], [3, 1], [-1, 3], [-4, 1], [1, -1]].forEach(function (s, i) { ret(ctx, cx + s[0], cy + s[1], 1, 1, i % 2 ? AMARELA : ESTRELA); });
      for (var a = 0; a < 20; a++) {
        var ang = Math.PI * 0.7 + a / 20 * Math.PI * 1.3;
        ret(ctx, Math.round(cx + Math.cos(ang) * 8), Math.round(cy + Math.sin(ang) * 8), 1, 1, C.ouro2);
      }
    } });
  // projetor de estrelas do Planetário (o "halteres" com furinhos)
  I.objeto('observatorio-projetor', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 3, K); ret(ctx, cx - 4, py + 11, 9, 2, METAL2);
      ret(ctx, cx - 2, py - 2, 5, 14, K); ret(ctx, cx - 1, py - 1, 3, 12, METAL); ret(ctx, cx - 1, py - 1, 1, 12, C.branco);
      circulo(ctx, cx - 4, py - 8, 5, K); circulo(ctx, cx - 4, py - 8, 4, '#2a2f66');
      circulo(ctx, cx + 4, py - 8, 5, K); circulo(ctx, cx + 4, py - 8, 4, '#2a2f66');
      ret(ctx, cx - 1, py - 9, 3, 3, K);
      [[-6, -10], [-3, -11], [-5, -6], [-2, -8], [3, -10], [6, -9], [4, -6], [2, -8]].forEach(function (s) { ret(ctx, cx + s[0], py + s[1], 1, 1, '#4a52a0'); });
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cx = px + 8, f = t ? Math.floor(t / 300) : 1;
      [[-6, -10], [-3, -11], [-5, -6], [-2, -8], [3, -10], [6, -9], [4, -6], [2, -8]].forEach(function (s, i) {
        if ((f + i) % 3 === 0) ret(ctx, cx + s[0], py + s[1], 1, 1, i % 2 ? ESTRELA : CIANO);
      });
    } });
  // o disco da projeção é uma galáxia azul-clara: a base fica na faixa de claridade do piso, para a Mariana e a
  // unicórnio (contorno #3a2446) aparecerem em cima dela; o brilho do miolo, os dois braços em espiral e as
  // estrelas vêm por cima. (Um disco escuro, ou só um pouco mais claro, fica da mesma luminância do contorno.)
  // Entre os braços, a base é a mais escura (#5a64b8, ainda 2,6:1 do contorno); os braços são largos e claros
  // (auréola, nuvem, faixa clara e fio), com volta e meia cada um, para as duas espirais serem a forma que se vê
  // de longe no celular, e não uma oval lisa.
  var GALAXIA = { aro: '#6a62b8', borda: '#8a82d6', fora: '#5a64b8', meio: '#6a76c8', miolo: '#7a84d6',
    aureola: '#7680d0', braco: '#8f9ae6', braco2: '#a8b0f0', fio: '#b8c0ff', orbita: '#4a52a8' };
  function desenharGalaxia(ctx, sx, sy, d) {
    var g = GALAXIA;
    elipse(ctx, sx, sy, d.rx + 3, d.ry + 2, g.aro);
    elipse(ctx, sx, sy, d.rx + 2, d.ry + 1, g.borda);
    elipse(ctx, sx, sy, d.rx, d.ry, g.fora);
    elipse(ctx, sx, sy, Math.round(d.rx * 0.36), Math.round(d.ry * 0.36), g.meio);
    elipse(ctx, sx, sy, Math.round(d.rx * 0.26), Math.round(d.ry * 0.26), g.miolo);
    elipse(ctx, sx, sy, Math.round(d.rx * 0.15), Math.round(d.ry * 0.15), clarear(g.miolo, 0.3));
    // ponto s (0 = junto do miolo, 1 = na beirada) do braço b
    function noBraco(b, s) {
      var r = 0.16 + 0.8 * s, ang = b * Math.PI + s * Math.PI * 1.5 + 0.4;
      return [Math.round(sx + Math.cos(ang) * r * d.rx), Math.round(sy + Math.sin(ang) * r * d.ry)];
    }
    // cada braço afina para fora: auréola, nuvem clara, faixa mais clara no miolo do braço e fio pontilhado
    var PASSOS = 90;
    for (var b = 0; b < 2; b++) {
      var camadas = [[g.aureola, 3, 2], [g.braco, 1, 0]];
      camadas.forEach(function (c) {
        for (var i = 0; i < PASSOS; i++) {
          var s = i / PASSOS, p = noBraco(b, s), raio = Math.max(1, Math.round(8 * (1 - s * 0.7)));
          elipse(ctx, p[0], p[1], raio + c[1], Math.max(1, Math.round(raio * 0.6)) + c[2], c[0]);
        }
      });
      for (var j = 0; j < PASSOS; j++) {
        var s3 = j / PASSOS, p3 = noBraco(b, s3), raio3 = Math.round(3.6 * (1 - s3 * 1.1));
        if (raio3 >= 1) elipse(ctx, p3[0], p3[1], raio3 + 1, Math.max(1, Math.round(raio3 * 0.5)), g.braco2);
      }
      for (var f = 0; f < PASSOS; f++) {
        if (sorte(f, b, 51) < 0.3) continue;
        var s2 = f / PASSOS, p2 = noBraco(b, s2);
        ret(ctx, p2[0], p2[1], s2 < 0.5 ? 2 : 1, 1, g.fio);
      }
    }
    // estrelas espalhadas (lilás e amarelinhas, algumas com brilho em cruz)
    for (var k = 0; k < 46; k++) {
      var a = sorte(k, 3, 61) * Math.PI * 2, q = Math.sqrt(sorte(k, 5, 67)) * 0.95;
      var x = Math.round(sx + Math.cos(a) * q * d.rx), y = Math.round(sy + Math.sin(a) * q * d.ry);
      if (k % 9 === 0) brilho(ctx, x, y, ESTRELA); else ret(ctx, x, y, 1, 1, k % 5 === 1 ? '#bff0ff' : k % 7 === 2 ? '#ffd0ee' : k % 3 ? LILAS : ESTRELA);
    }
  }
  // chão do Planetário: disco da projeção com as órbitas pontilhadas (Plutão tracejada)
  I.objeto('observatorio-orbitas', { w: 3, h: 3, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var sx = v(o, 'sx', px), sy = v(o, 'sy', py), clip = v(o, 'clip', null);
      ctx.save();
      if (clip && ctx.beginPath) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
      var disco = v(o, 'disco', { rx: 120, ry: 66 });
      desenharGalaxia(ctx, sx, sy, disco);
      (v(o, 'aneis', []) || []).forEach(function (a) {
        var passos = Math.max(24, Math.round(a.rx * 2.2));
        for (var i = 0; i < passos; i++) {
          var ang = i / passos * Math.PI * 2;
          var ok = a.tracejado ? (i % 6 < 3) : (i % 2 === 0);
          if (!ok) continue;
          ret(ctx, Math.round(sx + Math.cos(ang) * a.rx), Math.round(sy + Math.sin(ang) * a.ry), 1, 1, a.cor || '#6b6fc4');
        }
      });
      ctx.restore();
    },
    // poeira cintilante sobre o disco da galáxia (10 pontinhos claros, cada um no seu ritmo)
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var sx = v(o, 'sx', px), sy = v(o, 'sy', py), disco = v(o, 'disco', { rx: 120, ry: 66 });
      for (var k = 0; k < 10; k++) {
        var a = sorte(k, 9, 71) * Math.PI * 2, q = 0.3 + sorte(k, 4, 73) * 0.55;
        var x = Math.round(sx + Math.cos(a) * q * Math.min(disco.rx, 105)), y = Math.round(sy + Math.sin(a) * q * disco.ry);
        var per = 900 + k * 173, f = t ? ((t / per) + k * 0.29) % 1 : (k % 3) / 3;
        if (f > 0.66) continue;
        var cor = [C.branco, '#dff8ff', '#ffe0f4'][k % 3];
        if (f > 0.25 && f < 0.42 && k % 2 === 0) brilho(ctx, x, y, cor); else ret(ctx, x, y, 1, 1, cor);
      }
    } });
  // o Sol, no meio do Planetário (raios girando devagar)
  I.objeto('observatorio-sol', { w: 2, h: 2, topo: 4, solido: true, semSombra: true,
    toque: toqueSol,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, cy = py + 14;
      // sem disco nem halo semitransparente por baixo (no chão escuro virava um disco cinza-marrom):
      // o brilho quente em pontilhado já vem no desenho do Sol (observatorio/cenas.js)
      desenharPlaneta(ctx, 'sol', cx, cy, 11);
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var cx = px + 16, cy = py + 14, giro = t / 9000;   // uma volta a cada ~57 s: calmo
      for (var i = 0; i < 8; i++) {
        var a = giro + i * Math.PI / 4, r1 = 13 + ((i + (t ? Math.floor(t / 1200) : 0)) % 2);
        var x = Math.round(cx + Math.cos(a) * r1), y = Math.round(cy + Math.sin(a) * r1);
        ret(ctx, x, y, 1, 1, '#ffb347');
        ret(ctx, Math.round(cx + Math.cos(a) * (r1 + 1.6)), Math.round(cy + Math.sin(a) * (r1 + 1.6)), 1, 1, i % 2 ? '#ffe680' : '#ff9d2e');
      }
    } });
  // cada planeta: pegada fixa de 1 tile; a animação só dá uma voltinha pequena dentro dela
  I.objeto('observatorio-planeta', { w: 1, h: 1, topo: 6, solido: true, semSombra: true,
    toque: toquePlaneta,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, r = RAIOS[v(o, 'id', 'terra')] || 4;
      // halo em anéis de pixel em volta do planeta (o planeta vem por cima, na animação)
      haloAnel(ctx, cx, py + 6, r + 3, '#9fe8ff', 2);
      haloAnel(ctx, cx, py + 6, r + 5, '#e0c8ff', 3, 1);
      elipse(ctx, cx, py + 13, 5, 1, 'rgba(127,224,255,0.20)');
      elipse(ctx, cx, py + 13, 3, 1, 'rgba(127,224,255,0.22)');
      if (v(o, 'id', '') === 'plutao') { ret(ctx, cx - 5, py + 13, 1, 1, '#9a86c8'); ret(ctx, cx + 5, py + 13, 1, 1, '#9a86c8'); }
    },
    // o planeta fica PARADO (nada de tremer); só as luas dão a volta, bem devagar (≤ 1 px a cada ~0,5 s)
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var id = v(o, 'id', 'terra'), raio = RAIOS[id] || 4;
      var s = spritePlaneta(id, raio), cx = px + 8, cy = py + 6;
      ctx.drawImage(s, cx - s.width / 2, cy - s.height / 2);
      if (id === 'terra') {
        // a Lua dando a volta na Terra (uma volta a cada 20 s)
        var al = (t / 20000) * Math.PI * 2 + 1;
        ret(ctx, Math.round(cx + Math.cos(al) * 8), Math.round(cy + Math.sin(al) * 3), 1, 1, '#e8e4d8');
      } else if (id === 'jupiter') {
        for (var i = 0; i < 2; i++) { var aj = (t / (26000 + i * 8000)) * Math.PI * 2 + i * 2; ret(ctx, Math.round(cx + Math.cos(aj) * (11 + i)), Math.round(cy + Math.sin(aj) * 2), 1, 1, '#f4e4c8'); }
      }
    } });

  // para as outras partes (R._predios.observatorio)
  S.GALAXIA = GALAXIA;
})();
