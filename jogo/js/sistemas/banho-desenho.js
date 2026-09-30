/* Banho (parte 2 de 2): o desenho do banho, sempre a partir do tempo decorrido `e` (ms) — sprites pequenos
   (bolha, patinho, escova, chuveirinho), a posição do unicórnio, a espuma, as bolhas, a escova, o chuveirinho,
   as gotas da sacudida e os brilhos de limpinho; e B.itensDesenho / B.sobre, que o motor/laco.js chama a cada quadro.
   Nada roda no carregamento. Ver o cabeçalho de banho.js. */
(function () {
  var R = window.Reino;
  var I = R._banho, B = I.B;
  var trecho = I.trecho, suave = I.suave, lerp = I.lerp, agora = I.agora;
  var K = R.Desenho.K;
  var BRANCO = '#ffffff', AGUA = '#5fc8e8', AGUA2 = '#a8ecff', AGUA3 = '#2f9ec4';
  var ROSA = '#ff9cc6', ROSA2 = '#ff7eb6', OURO = '#ffd34d', LAR = '#ff8a3d', MAD = '#c98a4b', METAL = '#d9e2ee', METAL2 = '#9aa7ba';
  // espuma da banheira: as mesmas bolhas do desenho parado (petshop.js), em px a partir do canto da banheira
  var ESPUMA = [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]];
  var PASSOS = [1, 0, 2, 0];
  // x do meio de um sprite de largura w com a borda esquerda no pixel inteiro do jogo (como o ET): anda em degraus
  function naGrade(x, w) { return Math.round(x - w / 2) + w / 2; }

  /* ---------- sprites pequenos (feitos uma vez, na primeira vez que aparecem) ---------- */
  var cache = {};
  function canvasDe(chave, w, h, pintar) {
    if (!cache[chave]) { var c = PA.novoCanvas(w, h); pintar(c.getContext('2d')); cache[chave] = c; }
    return cache[chave];
  }
  var circ = R.Desenho.circulo;   // círculo em pixel (o mesmo das bolhas da banheira parada)
  // bolha de espuma de raio r (igual à da banheira parada)
  function bolha(r) {
    return canvasDe('bolha' + r, r * 2 + 1, r * 2 + 1, function (ctx) {
      circ(ctx, r, r, r, K);
      if (r >= 2) circ(ctx, r, r, r - 1, BRANCO); else { ctx.fillStyle = BRANCO; ctx.fillRect(r, r, 1, 1); }
      if (r > 2) { ctx.fillStyle = '#e3eefc'; ctx.fillRect(r + 1, r + 1, r - 2, 1); }
    });
  }
  function mapaPixels(linhas, cores) {
    return function (ctx) { R.Desenho.matriz(ctx, 0, 0, linhas, cores); };
  }
  // patinho amarelo (o mesmo da banheira parada), 11 × 8
  var PATINHO = [
    '.....KKKK..',
    '.....KooK..',
    'KKKKKKooKll',
    'KooooooKK..',
    'KooooooK...',
    'KooooooK...',
    'KKKKKKKK...',
  ];
  function patinho() { return canvasDe('patinho', 11, 7, mapaPixels(PATINHO, { K: K, o: OURO, l: LAR })); }
  // escova de crina: cabo de madeira e cabeça rosa com as cerdas brancas
  var ESCOVA = [
    '.....KKKKKKK.',
    'KKKKKKrrrrrrK',
    'KmmmmKrRrRrRK',
    'KKKKKKKKKKKKK',
    '......w.w.w.w',
    '.....w.w.w.w.',
  ];
  function escova() { return canvasDe('escova', 13, 6, mapaPixels(ESCOVA, { K: K, r: ROSA, R: ROSA2, m: MAD, w: BRANCO })); }
  // chuveirinho de mão: cabo inclinado e a cabeça virada para baixo com os furinhos
  var CHUVEIRO = [
    '.............KKK',
    '............KrRK',
    '...........KrRK.',
    '..........KrRK..',
    '...KKKKK.KrRK...',
    '..KmmmmmKmRK....',
    '.KmbmmmmmmK.....',
    'KmmmmmmmmmmK....',
    'KgggggggggK.....',
    '.KKKKKKKKK......',
    '..a.a.a.a.......',
  ];
  function chuveiro() { return canvasDe('chuveiro', 16, 11, mapaPixels(CHUVEIRO, { K: K, m: METAL, g: METAL2, a: AGUA3, b: BRANCO, r: ROSA, R: ROSA2 })); }

  // brilho em cruz (tam 1: 3 px; tam 2: 5 px com o miolo branco); no pintor, por isso não é o Reino.Desenho.brilho
  function brilho(p, x, y, tam, cor) {
    if (tam <= 0) return;
    if (tam === 1) { p.ret(x - 1, y, 3, 1, cor); p.ret(x, y - 1, 1, 3, cor); return; }
    p.ret(x - 2, y, 5, 1, cor); p.ret(x, y - 2, 1, 5, cor); p.ret(x, y, 1, 1, BRANCO);
  }

  /* ---------- o unicórnio ---------- */
  function uniSprite(vista, quadro) {
    var est = R.Progresso.estado(), usa = est.usando || {};
    return PA.unicornio(I.st.def, I.st.estagio, quadro || 0, { enfeites: usa.enfeites, asasFada: usa.asasFada, vista: vista });
  }
  // onde o unicórnio está no instante e (ms): pés (x, y), vista, quadro, e se é cortado pela espuma
  function posicao(e) {
    var s = e / I.st.dur, g = I.st.geo, v;
    if (s < 0.12) {
      // pulo para dentro: arco suave; da metade em diante (já descendo, sobre a banheira) é cortado
      var k = suave(trecho(s, 0, 0.12));
      v = PA.vistaDaDirecao(g.tx - g.x0, 0);
      return { x: lerp(g.x0, g.tx, k), y: lerp(g.y0, g.ty + fundo(s), k) - 4 * g.altoEntra * k * (1 - k), vista: v.vista, espelhar: v.espelhar,
        quadro: k > 0.05 && k < 0.95 ? 1 : 0, corta: k >= 0.5, dentro: true };
    }
    if (s < 0.66) return { x: g.tx, y: g.ty + fundo(s), vista: g.vistaDentro.vista, espelhar: g.vistaDentro.espelhar, quadro: 0, corta: true, dentro: true };
    if (s < 0.74) {
      // pulo para fora, na frente da banheira; cortado só enquanto sobe de dentro dela
      var k2 = suave(trecho(s, 0.66, 0.74));
      v = PA.vistaDaDirecao(g.lx - g.tx, g.ly - g.ty);
      return { x: lerp(g.tx, g.lx, k2), y: lerp(g.ty + fundo(0.66), g.ly, k2) - 4 * g.altoSai * k2 * (1 - k2), vista: v.vista, espelhar: v.espelhar,
        quadro: k2 > 0.05 && k2 < 0.95 ? 1 : 0, corta: k2 < 0.5, dentro: k2 < 0.5 };
    }
    if (s < 0.88) {
      // sacudida: balança de leve de um lado para o outro (1 px, devagar, entrando e saindo aos poucos)
      var env = Math.sin(Math.PI * trecho(s, 0.74, 0.86));
      return { x: g.lx + Math.round(Math.sin((e - 0.74 * I.st.dur) / 1000 * Math.PI * 2 * 4.5) * env), y: g.ly, vista: 'frente', espelhar: false, quadro: 0, corta: false, dentro: false };
    }
    if (s < 0.98) {
      // volta andando até ela (montada) ou até o lugar dele atrás dela (bebê)
      var k3 = suave(trecho(s, 0.88, 0.98));
      v = PA.vistaDaDirecao(g.fx - g.lx, g.fy - g.ly);
      return { x: lerp(g.lx, g.fx, k3), y: lerp(g.ly, g.fy, k3), vista: v.vista, espelhar: v.espelhar,
        quadro: PASSOS[Math.floor(e / 140) % 4], corta: false, dentro: false };
    }
    return { x: g.fx, y: g.fy, vista: g.vistaFim.vista, espelhar: g.vistaFim.espelhar, quadro: 0, corta: false, dentro: false };
  }
  // sem espuma ele fica mais fundo (as pernas não aparecem em cima da borda); a espuma o levanta devagar
  function fundo(s) { return Math.round((1 - espuma(s)) * 5); }   // px inteiro: sobe em degraus
  // quanto de espuma (0–1): cresce na espuma, baixa no enxágue e volta a encher no fim (fica como a parada)
  function espuma(s) {
    if (s < 0.12) return 0;
    if (s < 0.52) return suave(trecho(s, 0.12, 0.26));
    if (s < 0.86) return lerp(1, 0.4, suave(trecho(s, 0.52, 0.66)));
    return lerp(0.4, 1, suave(trecho(s, 0.86, 0.98)));
  }

  function desenharUni(p, e) {
    var pos = posicao(e), s = e / I.st.dur;
    var spr = uniSprite(pos.vista, pos.quadro), img = spr.canvas;
    // sujinho até o chuveirinho levar a lama embora
    if (I.st.sujo && s < 0.58 && window.Jogador && Jogador.sujar) img = Jogador.sujar(img);
    var J = window.Jogador, ctx = p.ctx, g = I.st.geo;
    // na grade de pixel do mundo (O-22): borda esquerda e pés em px inteiro
    pos = { x: naGrade(pos.x, img.width), y: Math.round(pos.y), espelhar: pos.espelhar, dentro: pos.dentro, corta: pos.corta };
    if (!pos.dentro && s >= 0.74) J.sombra(p, pos.x, pos.y - 1, spr.w / 2.6);
    if (pos.corta) {
      // recorta o buraco da banheira (da linha da espuma para baixo): o resto do sprite aparece inteiro
      var a = p.tela(g.px + 1, g.linha), b = p.tela(g.px + 47, g.py + 32);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
      ctx.clip('evenodd');
      J.desenharSprite(p, img, pos.x, pos.y, pos.espelhar);
      ctx.restore();
    } else J.desenharSprite(p, img, pos.x, pos.y, pos.espelhar);
  }

  // espuma crescendo (sobe um pouquinho enquanto cresce). As bolhas mais altas são as do fundo da
  // banheira: ficam atrás do unicórnio; as da frente, na borda, cobrem a barriga dele
  function desenharEspuma(p, s, deTras) {
    var f = espuma(s), g = I.st.geo;
    if (f <= 0) return;
    ESPUMA.forEach(function (bq) {
      if ((bq[1] < 0) !== deTras) return;
      var r = Math.round(bq[2] * f);
      if (r < 1) return;
      p.sprite(bolha(r), g.px + bq[0] + 0.5, g.py + bq[1] + r + 1 + Math.round((1 - f) * 3));
    });
  }

  // espuma, bolhas que sobem, escova, chuveirinho, respingo e patinho (na frente do unicórnio na banheira)
  function desenharBanheira(p, e) {
    var g = I.st.geo, s = e / I.st.dur, d = I.st.dur;
    var h = g.altoUni;
    // respingo ao cair na água
    var tl = (e - 0.12 * d) / 1000;
    if (tl >= 0 && tl < 0.4) {
      for (var i = 0; i < 12; i++) {
        var lado = i % 2 ? 1 : -1, vx = lado * (18 + (i % 4) * 7), vy = -(48 + (i % 3) * 14);
        var x = g.tx + lado * (5 + (i % 3) * 3) + vx * tl, y = g.linha - 1 + vy * tl + 130 * tl * tl;
        p.ret(Math.round(x), Math.round(y), 1, tl < 0.25 ? 2 : 1, i % 3 ? AGUA2 : BRANCO);
      }
    }
    // espuma crescendo, a fileira da frente (a de trás vem antes do unicórnio)
    desenharEspuma(p, s, false);
    // bolhas que sobem dos cantos da banheira (longe da carinha dele) e estouram lá em cima
    if (s > 0.15 && s < 0.66) {
      for (var k = 0; k < 4; k++) {
        var c = ((e - 0.15 * d) / 1500 + k / 4) % 1;
        var bx = g.px + [6, 11, 38, 43][k] + Math.sin(e / 300 + k) * 1.5, by = g.linha - 6 - c * 18;
        if (c < 0.82) { var bk = bolha(k % 2 + 1); p.sprite(bk, naGrade(bx, bk.width), Math.round(by) + (k % 2 + 1) + 1); }
        else if (c < 0.94) brilho(p, Math.round(bx), Math.round(by), 1, BRANCO);
      }
    }
    // espuminha nas costas e a escova indo e vindo
    // costas: do lado contrário ao da cabeça (virado para a esquerda, o corpo fica à direita)
    var costas = { x: g.tx + (g.vistaDentro.espelhar ? 4 : -4), y: Math.round(g.ty + fundo(s) - h * 0.5) };
    var fc = s < 0.52 ? suave(trecho(s, 0.30, 0.36)) : 1 - suave(trecho(s, 0.52, 0.58));
    if (s > 0.30 && s < 0.58) {
      [[-5, 0, 2], [3, -1, 2], [8, 1, 1]].forEach(function (bq) {
        var r = Math.round(bq[2] * fc);
        if (r >= 1) p.sprite(bolha(r), naGrade(costas.x + bq[0], r * 2 + 1), costas.y + bq[1] + r + 1);
      });
    }
    if (s > 0.30 && s < 0.50) {
      var ke = trecho(s, 0.30, 0.50), entra = suave(trecho(ke, 0, 0.15)) * suave(1 - trecho(ke, 0.85, 1));
      var vai = Math.sin((e - 0.30 * d) / 1000 * Math.PI * 2 * 1.6) * 6;
      var esc = escova();
      p.sprite(esc, naGrade(costas.x + vai, esc.width), Math.round(costas.y - 1 - (1 - entra) * 10));
    }
    // chuveirinho enxaguando: cabeça em cima das costas e a água caindo
    if (s > 0.50 && s < 0.66) {
      var kc = trecho(s, 0.50, 0.66), vem = suave(trecho(kc, 0, 0.18)) * suave(1 - trecho(kc, 0.82, 1));
      // (a cabeça fica no meio-esquerdo do sprite: o cabo sobe para a direita)
      var chu = chuveiro();
      var hx = naGrade(costas.x + 6 + Math.sin(e / 330) * 3, chu.width), hy = Math.round(g.ty + fundo(s) - h - 1 - (1 - vem) * 12);
      p.sprite(chu, hx, hy);
      if (vem > 0.6) {
        var de = hy - 1, ate = g.linha - 2, len = ate - de;
        for (var q = 0; q < 10; q++) {
          var fq = (e / 220 + q * 0.37) % 1, col = Math.round(hx - 7) + q;
          p.ret(col, Math.round(de + fq * len), 1, 3, q % 2 ? AGUA3 : AGUA2);
          p.ret(col, Math.round(de + ((fq + 0.5) % 1) * len), 1, 2, q % 3 ? AGUA2 : BRANCO);
        }
      }
    }
    // patinho: vai para o cantinho da banheira, balança na espuma e volta para o lugar dele no fim
    var casa = { x: g.px + 25.5, y: g.py - 2 }, canto = { x: g.px + 40.5, y: g.py - 1 };
    var kp = s < 0.5 ? suave(trecho(s, 0.01, 0.09)) : 1 - suave(trecho(s, 0.88, 0.98));
    var balanco = Math.sin(e / 260) * 1.2 * kp;
    var pat = patinho();
    p.sprite(pat, naGrade(lerp(casa.x, canto.x, kp) + Math.sin(e / 520) * 0.8 * kp, pat.width), Math.round(lerp(casa.y, canto.y, kp) + balanco));
  }

  // gotas voando da sacudida (duas levas)
  function desenharGotas(p, e) {
    var s = e / I.st.dur, g = I.st.geo;
    if (s < 0.74 || s > 0.9) return;
    var h = g.altoUni, cx = g.lx, cy = g.ly - h * 0.5;
    [0.745, 0.80].forEach(function (inicio, leva) {
      var tg = (e - inicio * I.st.dur) / 1000;
      if (tg < 0 || tg > 0.45) return;
      for (var i = 0; i < 14; i++) {
        var a = (i / 14) * Math.PI * 2 + leva * 0.22, v = 42 + ((i * 37) % 20);
        var x = cx + Math.cos(a) * (6 + v * tg), y = cy + Math.sin(a) * 4 + (Math.sin(a) * 0.5 - 0.8) * v * tg + 150 * tg * tg;
        p.ret(Math.round(x), Math.round(y), tg < 0.25 ? 2 : 1, 1, i % 3 ? AGUA2 : (i % 2 ? BRANCO : AGUA));
      }
    });
  }

  // brilhos de limpinho em volta do unicórnio (px do jogo)
  var BRILHOS = [[-12, -0.75], [11, -0.9], [15, -0.35], [-15, -0.25], [1, -1.15], [6, -0.55], [-6, -0.5]];
  function desenharBrilhos(p, x, y, h, e, animar, k) {
    BRILHOS.forEach(function (b, i) {
      var tam = animar ? [0, 1, 2, 1][Math.floor(e / 130 + i * 1.7) % 4] : (i % 2 ? 1 : 2);
      if (animar && k < 1 && i / BRILHOS.length > k) return;       // vão aparecendo um a um
      var sobe = animar ? (e % 1400) / 1400 * 3 : 0;
      brilho(p, Math.round(x + b[0]), Math.round(y + b[1] * h - sobe), tam, i % 3 === 0 ? '#ffd1e6' : i % 3 === 1 ? '#fff6a8' : BRANCO);
    });
  }

  // itens do banho para ordenar por Y com a cena e o Jogador (motor/laco.js)
  B.itensDesenho = function (p, t, animar) {
    if (!B.desenhandoUni()) return [];
    var e = Math.min(I.st.dur, agora() - I.st.inicio), g = I.st.geo, pos = posicao(e);
    var yBanheira = g.py + 20;
    var s = e / I.st.dur;
    return [
      { y: yBanheira - 0.1, desenhar: function () { if (I.st) desenharEspuma(p, s, true); } },
      // montada, ele volta por trás dela (quando chega, ela já está "montando")
      { y: pos.dentro ? yBanheira : I.st.montado && s >= 0.88 ? Math.min(pos.y - 1.5, window.Jogador.y - 0.5) : pos.y - 1.5,
        desenhar: function () { if (I.st) desenharUni(p, e); } },
      { y: yBanheira + 0.1, desenhar: function () { if (I.st) desenharBanheira(p, e); } },
      { y: g.ly + 0.5, desenhar: function () { if (I.st) desenharGotas(p, e); } },
    ];
  };

  // por cima de tudo: os brilhos de limpinho (na versão curta, em volta dela montada ou do bebê)
  B.sobre = function (ctx, p, t, animar) {
    if (!I.st || !I.st.comecou || I.st.fim) return;
    var e = Math.min(I.st.dur, agora() - I.st.inicio);
    if (I.st.curta) {
      var J = window.Jogador, m = J.posMontaria(), alto = I.st.montado ? 26 : 14;
      desenharBrilhos(p, m.x, m.y, alto, e, false, 1);
      return;
    }
    if (!I.st.geo) return;
    var s = e / I.st.dur;
    if (s < 0.86) return;
    var pos = posicao(e);
    desenharBrilhos(p, pos.x, pos.y, I.st.geo.altoUni, e, true, trecho(s, 0.86, 0.94));
  };

  // para a outra parte
  I.uniSprite = uniSprite;
})();
