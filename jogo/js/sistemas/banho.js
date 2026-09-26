/* Banho de espuma na banheira da Pet Shop (Reino.Banho) — CONTRATOS-BANHO-FOTOS-MUSICA.md, seção 3.
   Tocar na banheira: ela anda até o lado dela (posto), a montaria pula na banheira e toma banho
   (~6 s, config.banho.duracaoMs): entrar (cortado na linha da espuma, como no nado), espuma crescendo
   com bolhas que sobem e estouram, escova indo e vindo, patinho balançando o tempo todo, chuveirinho
   enxaguando, pulo para fora com sacudida e gotas, brilhos de limpinho. Montada, ela desce e fica ao
   lado (só no desenho: J.montado() não muda) e volta a montar no fim; o bebê vai sozinho.
   Com Animações desligado (ou "reduzir movimento" do aparelho): versão curta (~1 s), só com brilho.
   Durante o banho a cena fica ocupada (Cena.ocupar('banho')): ela não anda nem toca em nada; depois de
   config.banho.pularDepoisMs, um toque (ou Enter/Espaço) pula para o fim.
   Tudo é desenhado a partir do tempo decorrido (sem partículas guardadas): pular é só ir ao fim.
   Nada de DOM, canvas, PA, Progresso nem Cena no carregamento: só dentro das funções. */
(function () {
  var R = window.Reino;
  var B = {};
  var K = '#3a2446';
  var BRANCO = '#ffffff', AGUA = '#5fc8e8', AGUA2 = '#a8ecff', AGUA3 = '#2f9ec4';
  var ROSA = '#ff9cc6', ROSA2 = '#ff7eb6', OURO = '#ffd34d', LAR = '#ff8a3d', MAD = '#c98a4b', METAL = '#d9e2ee', METAL2 = '#9aa7ba';
  // espuma da banheira: as mesmas bolhas do desenho parado (petshop.js), em px a partir do canto da banheira
  var ESPUMA = [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]];
  // etapas (fração da duração): entrar, espuma, esfregar, chuveiro, sacudir (pulo + sacudida), brilhos
  var FASES = [['entrar', 0], ['espuma', 0.12], ['esfregar', 0.30], ['chuveiro', 0.50], ['sacudir', 0.66], ['brilhos', 0.86]];
  var PASSOS = [1, 0, 2, 0];

  var st = null;        // banho em curso
  var ultimo = null;    // o último que terminou (para os testes)

  function cfg() { return (R.config && R.config.banho) || { duracaoMs: 6000, duracaoCurtaMs: 1000, pularDepoisMs: 2000 }; }
  function agora() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function tocar(som) { try { if (R.Som && R.Som.tocar) R.Som.tocar(som); } catch (e) {} }
  function limitar(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function trecho(s, a, b) { return limitar((s - a) / (b - a)); }
  function suave(k) { return k * k * (3 - 2 * k); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function animacoesLigadas() {
    var est = R.Progresso && R.Progresso.estado();
    return !!(est && est.ajustes && est.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }

  /* ---------- sprites pequenos (feitos uma vez, na primeira vez que aparecem) ---------- */
  var cache = {};
  function canvasDe(chave, w, h, pintar) {
    if (!cache[chave]) { var c = PA.novoCanvas(w, h); pintar(c.getContext('2d')); cache[chave] = c; }
    return cache[chave];
  }
  function circ(ctx, cx, cy, r, cor) {
    ctx.fillStyle = cor;
    for (var j = -r; j <= r; j++) { var m = Math.floor(Math.sqrt(r * r - j * j) + 0.35); ctx.fillRect(cx - m, cy + j, m * 2 + 1, 1); }
  }
  // bolha de espuma de raio r (igual à da banheira parada)
  function bolha(r) {
    return canvasDe('bolha' + r, r * 2 + 1, r * 2 + 1, function (ctx) {
      circ(ctx, r, r, r, K);
      if (r >= 2) circ(ctx, r, r, r - 1, BRANCO); else { ctx.fillStyle = BRANCO; ctx.fillRect(r, r, 1, 1); }
      if (r > 2) { ctx.fillStyle = '#e3eefc'; ctx.fillRect(r + 1, r + 1, r - 2, 1); }
    });
  }
  function mapaPixels(linhas, cores) {
    return function (ctx) {
      for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
        var c = cores[linhas[j][i]];
        if (c) { ctx.fillStyle = c; ctx.fillRect(i, j, 1, 1); }
      }
    };
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

  // brilho em cruz (tam 1: 3 px; tam 2: 5 px com o miolo branco)
  function brilho(p, x, y, tam, cor) {
    if (tam <= 0) return;
    if (tam === 1) { p.ret(x - 1, y, 3, 1, cor); p.ret(x, y - 1, 1, 3, cor); return; }
    p.ret(x - 2, y, 5, 1, cor); p.ret(x, y - 2, 1, 5, cor); p.ret(x, y, 1, 1, BRANCO);
  }

  /* ---------- o unicórnio ---------- */
  function uniSprite(vista, quadro) {
    var est = R.Progresso.estado(), usa = est.usando || {};
    return PA.unicornio(st.def, st.estagio, quadro || 0, { enfeites: usa.enfeites, asasFada: usa.asasFada, vista: vista });
  }
  // onde o unicórnio está no instante e (ms): pés (x, y), vista, quadro, e se é cortado pela espuma
  function posicao(e) {
    var s = e / st.dur, g = st.geo, v;
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
      return { x: g.lx + Math.sin((e - 0.74 * st.dur) / 1000 * Math.PI * 2 * 4.5) * env, y: g.ly, vista: 'frente', espelhar: false, quadro: 0, corta: false, dentro: false };
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
  function fundo(s) { return Math.round((1 - espuma(s)) * 5 * 3) / 3; }
  // quanto de espuma (0–1): cresce na espuma, baixa no enxágue e volta a encher no fim (fica como a parada)
  function espuma(s) {
    if (s < 0.12) return 0;
    if (s < 0.52) return suave(trecho(s, 0.12, 0.26));
    if (s < 0.86) return lerp(1, 0.4, suave(trecho(s, 0.52, 0.66)));
    return lerp(0.4, 1, suave(trecho(s, 0.86, 0.98)));
  }

  function desenharUni(p, e) {
    var pos = posicao(e), s = e / st.dur;
    var spr = uniSprite(pos.vista, pos.quadro), img = spr.canvas;
    // sujinho até o chuveirinho levar a lama embora
    if (st.sujo && s < 0.58 && window.Jogador && Jogador.sujar) img = Jogador.sujar(img);
    var J = window.Jogador, ctx = p.ctx, g = st.geo;
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
    var f = espuma(s), g = st.geo;
    if (f <= 0) return;
    ESPUMA.forEach(function (bq) {
      if ((bq[1] < 0) !== deTras) return;
      var r = Math.round(bq[2] * f);
      if (r < 1) return;
      p.sprite(bolha(r), g.px + bq[0] + 0.5, g.py + bq[1] + r + 1 + (1 - f) * 3);
    });
  }

  // espuma, bolhas que sobem, escova, chuveirinho, respingo e patinho (na frente do unicórnio na banheira)
  function desenharBanheira(p, e) {
    var g = st.geo, s = e / st.dur, d = st.dur;
    var h = g.altoUni;
    // respingo ao cair na água
    var tl = (e - 0.12 * d) / 1000;
    if (tl >= 0 && tl < 0.4) {
      for (var i = 0; i < 12; i++) {
        var lado = i % 2 ? 1 : -1, vx = lado * (18 + (i % 4) * 7), vy = -(48 + (i % 3) * 14);
        var x = g.tx + lado * (5 + (i % 3) * 3) + vx * tl, y = g.linha - 1 + vy * tl + 130 * tl * tl;
        p.ret(x, y, 1, tl < 0.25 ? 2 : 1, i % 3 ? AGUA2 : BRANCO);
      }
    }
    // espuma crescendo, a fileira da frente (a de trás vem antes do unicórnio)
    desenharEspuma(p, s, false);
    // bolhas que sobem dos cantos da banheira (longe da carinha dele) e estouram lá em cima
    if (s > 0.15 && s < 0.66) {
      for (var k = 0; k < 4; k++) {
        var c = ((e - 0.15 * d) / 1500 + k / 4) % 1;
        var bx = g.px + [6, 11, 38, 43][k] + Math.sin(e / 300 + k) * 1.5, by = g.linha - 6 - c * 18;
        if (c < 0.82) p.sprite(bolha(k % 2 + 1), bx, by + (k % 2 + 1) + 1);
        else if (c < 0.94) brilho(p, Math.round(bx), Math.round(by), 1, BRANCO);
      }
    }
    // espuminha nas costas e a escova indo e vindo
    // costas: do lado contrário ao da cabeça (virado para a esquerda, o corpo fica à direita)
    var costas = { x: g.tx + (g.vistaDentro.espelhar ? 4 : -4), y: g.ty + fundo(s) - h * 0.5 };
    var fc = s < 0.52 ? suave(trecho(s, 0.30, 0.36)) : 1 - suave(trecho(s, 0.52, 0.58));
    if (s > 0.30 && s < 0.58) {
      [[-5, 0, 2], [3, -1, 2], [8, 1, 1]].forEach(function (bq) {
        var r = Math.round(bq[2] * fc);
        if (r >= 1) p.sprite(bolha(r), costas.x + bq[0], costas.y + bq[1] + r + 1);
      });
    }
    if (s > 0.30 && s < 0.50) {
      var ke = trecho(s, 0.30, 0.50), entra = suave(trecho(ke, 0, 0.15)) * suave(1 - trecho(ke, 0.85, 1));
      var vai = Math.sin((e - 0.30 * d) / 1000 * Math.PI * 2 * 1.6) * 6;
      p.sprite(escova(), costas.x + vai, costas.y - 1 - (1 - entra) * 10);
    }
    // chuveirinho enxaguando: cabeça em cima das costas e a água caindo
    if (s > 0.50 && s < 0.66) {
      var kc = trecho(s, 0.50, 0.66), vem = suave(trecho(kc, 0, 0.18)) * suave(1 - trecho(kc, 0.82, 1));
      // (a cabeça fica no meio-esquerdo do sprite: o cabo sobe para a direita)
      var hx = costas.x + 6 + Math.sin(e / 330) * 3, hy = g.ty + fundo(s) - h - 1 - (1 - vem) * 12;
      p.sprite(chuveiro(), hx, hy);
      if (vem > 0.6) {
        var de = hy - 1, ate = g.linha - 2, len = ate - de;
        for (var q = 0; q < 10; q++) {
          var fq = (e / 220 + q * 0.37) % 1, col = hx - 7 + q;
          p.ret(col, de + fq * len, 1, 3, q % 2 ? AGUA3 : AGUA2);
          p.ret(col, de + ((fq + 0.5) % 1) * len, 1, 2, q % 3 ? AGUA2 : BRANCO);
        }
      }
    }
    // patinho: vai para o cantinho da banheira, balança na espuma e volta para o lugar dele no fim
    var casa = { x: g.px + 25.5, y: g.py - 2 }, canto = { x: g.px + 40.5, y: g.py - 1 };
    var kp = s < 0.5 ? suave(trecho(s, 0.01, 0.09)) : 1 - suave(trecho(s, 0.88, 0.98));
    var balanco = Math.sin(e / 260) * 1.2 * kp;
    p.sprite(patinho(), lerp(casa.x, canto.x, kp) + Math.sin(e / 520) * 0.8 * kp, lerp(casa.y, canto.y, kp) + balanco);
  }

  // gotas voando da sacudida (duas levas)
  function desenharGotas(p, e) {
    var s = e / st.dur, g = st.geo;
    if (s < 0.74 || s > 0.9) return;
    var h = g.altoUni, cx = g.lx, cy = g.ly - h * 0.5;
    [0.745, 0.80].forEach(function (inicio, leva) {
      var tg = (e - inicio * st.dur) / 1000;
      if (tg < 0 || tg > 0.45) return;
      for (var i = 0; i < 14; i++) {
        var a = (i / 14) * Math.PI * 2 + leva * 0.22, v = 42 + ((i * 37) % 20);
        var x = cx + Math.cos(a) * (6 + v * tg), y = cy + Math.sin(a) * 4 + (Math.sin(a) * 0.5 - 0.8) * v * tg + 150 * tg * tg;
        p.ret(x, y, tg < 0.25 ? 2 : 1, 1, i % 3 ? AGUA2 : (i % 2 ? BRANCO : AGUA));
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

  /* ---------- falas ---------- */
  function retratoUni(id) {
    try {
      var P = R.Progresso, d = P.defUni(id), u = P.estado().unis[id];
      var s = PA.unicornio(d, R.Unicornios.estagio(u ? u.xp : 0), 0);
      return s ? (s.canvas || s) : null;
    } catch (e) { return null; }
  }
  // balão modal de uma frase do Reino.Cuidados, na voz de quem fala (o unicórnio ou o Claude)
  function falarFrase(chave, id) {
    var Cu = R.Cuidados, Cl = R.Claude;
    var texto = Cu && Cu.frases && Cu.frases[chave];
    if (!texto || !Cl || !Cl.falar) return Promise.resolve(null);
    var voz = Cu.vozDaFrase ? Cu.vozDaFrase(chave) : 'claude';
    var op = { modal: true, voz: voz, botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] };
    if (voz === 'unicornio') {
      var P = R.Progresso;
      op.quem = { nome: (P.nomeUni && P.nomeUni(id)) || 'Unicórnio', retrato: retratoUni(id), voz: voz };
    }
    return Cl.falar(texto, op);
  }
  // sem unicórnio chocado: a narradora conta para que serve a banheira
  function falarSemUni() {
    var Cl = R.Claude, F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || {};
    var ex = (F.extras || []).filter(function (x) { return x.para === 'banheira'; })[0];
    if (!ex || !Cl || !Cl.falar) return Promise.resolve(null);
    return Cl.falar(ex.texto, { modal: true, voz: ex.voz, quem: { nome: 'Banho de espuma', voz: ex.voz },
      botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] });
  }

  /* ---------- toque e teclado durante o banho ----------
     Ouvinte próprio, na captura da janela: nada chega ao mapa nem ao HUD enquanto dura
     (o do canvas no main.js já ignora com a cena ocupada). Depois de pularDepoisMs, pula para o fim. */
  var engolirAte = 0;
  function podePular() { return st && st.comecou && !st.fim && agora() - st.inicio >= cfg().pularDepoisMs; }
  function aoToque(e) {
    if (!st && agora() > engolirAte) return;
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
    if (e.type === 'pointerdown' && podePular()) pular(true);
  }
  var TECLAS_PULAR = { Enter: 1, ' ': 1, Escape: 1 };
  var TECLAS_ANDAR = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1 };
  function aoTeclar(e) {
    if (!st && agora() > engolirAte) return;
    if (!TECLAS_PULAR[e.key] && !TECLAS_ANDAR[e.key]) return;
    e.stopPropagation();
    e.preventDefault();
    if (TECLAS_PULAR[e.key] && !e.repeat && podePular()) pular(false);
  }
  var ouvindo = false;
  function ouvir(ligar) {
    if (ligar === ouvindo) return;
    ouvindo = ligar;
    var f = ligar ? window.addEventListener : window.removeEventListener;
    f.call(window, 'pointerdown', aoToque, true);
    f.call(window, 'click', aoToque, true);
    f.call(window, 'keydown', aoTeclar, true);
  }

  /* ---------- começo, fim e pulo ---------- */
  function limparTimers() { (st.timers || []).forEach(clearTimeout); st.timers = []; }
  function depois(ms, fn) { st.timers.push(setTimeout(fn, ms)); }

  // a banheira da cena ativa (a da Pet Shop): { x, y, w, h } em tiles
  function acharBanheira() {
    try {
      var c = R.Cena && R.Cena.atual(), objs = (c && c._objetos) || [];
      for (var i = 0; i < objs.length; i++) if (objs[i].o.tipo === 'petshop-banheira') return { x: objs[i].o.x, y: objs[i].o.y, w: objs[i].w, h: objs[i].h };
    } catch (e) {}
    return null;
  }

  function comecar() {
    if (!st || st.comecou) return;
    var J = window.Jogador, T = 16;
    st.comecou = true;
    st.inicio = agora();
    var ban = st.banheira;
    if (ban) {
      var px = ban.x * T, py = ban.y * T;
      // ela olha para a banheira
      J.virar(px + 24 - J.x, 0);
      var de = J.posMontaria();
      var alto = 0;
      PA.VISTAS.forEach(function (v) { alto = Math.max(alto, uniSprite(v, 0).h); });
      var linha = py + 4;                                  // borda de cima da banheira (a linha da espuma)
      // pés lá dentro: as pernas somem e a espuma cobre a barriga (o bebê, mais baixinho, fica mais para cima)
      var ty = linha + 1 - Math.round(Math.max(0, 23 - alto) * 0.6);
      var tx = px + 23;
      var lx = px + 14, ly = py + 32 + 9;                  // onde ele cai ao sair: no chão, na frente da banheira
      var fim;
      if (st.montado) fim = { x: J.x, y: J.y + 1 };
      else {
        var dx = lx - J.x, dy = ly - 1 - J.y, dd = Math.hypot(dx, dy) || 1;
        fim = { x: J.x + dx / dd * J.DIST_BEBE, y: J.y + dy / dd * J.DIST_BEBE + 1 };
      }
      var vistaFim = st.montado ? PA.vistaDaDirecao(J.olharX, J.olharY) : PA.vistaDaDirecao(J.x - fim.x, J.y + 1 - fim.y);
      st.geo = { px: px, py: py, linha: linha, x0: de.x, y0: de.y, tx: tx, ty: ty, lx: lx, ly: ly, fx: fim.x, fy: fim.y,
        altoUni: alto, altoEntra: Math.max(18, (de.y - linha) / 2 + 6), altoSai: Math.max(22, (ly - ty) / 2 + 8),
        vistaDentro: PA.vistaDaDirecao(J.x - tx, Math.abs(J.x - tx) * 0.8 + 1), vistaFim: vistaFim };
    }
    if (st.curta) {
      tocar('estrela');
      depois(st.dur, function () { terminar(false); });
      return;
    }
    var d = st.dur;
    depois(0.11 * d, function () { tocar('bolhas'); });
    depois(0.30 * d, function () { tocar('esfregar'); });
    depois(0.40 * d, function () { tocar('esfregar'); });
    depois(0.50 * d, function () { tocar('chuveiro'); });
    depois(0.745 * d, function () { tocar('sacudida'); });
    depois(0.86 * d, function () { tocar('estrela'); });
    depois(d, function () { terminar(false); });
  }

  function pular(porToque) {
    if (!podePular()) return;
    st.pulou = true;
    terminar(porToque);
  }

  function terminar(porToque) {
    if (!st || st.fim) return;
    var s = st, J = window.Jogador, Cu = R.Cuidados;
    s.fim = true;
    limparTimers();
    var res = { ok: false, motivo: 'sem-cuidados' };
    try { if (Cu && Cu.banhar) res = Cu.banhar(s.uniId) || res; } catch (e) { console.error(e); }
    try {
      if (s.banheira && s.geo && J) {
        if (!s.montado && !s.curta) J.bebeVoltou(s.geo.fx, s.geo.fy - 1);
        J.virar(s.geo.px + 24 - J.x, 0);
      }
    } catch (e) { console.error(e); }
    ultimo = { ativo: false, fase: 'fim', t: Math.round(agora() - (s.inicio || agora())), curta: s.curta, uniId: s.uniId, pulou: !!s.pulou, resultado: res };
    st = null;
    // o toque que pulou ainda vai soltar o dedo (click): não pode apertar nada do HUD
    engolirAte = porToque ? agora() + 400 : 0;
    setTimeout(function () { if (!st) ouvir(false); }, porToque ? 420 : 0);
    if (R.Cena && R.Cena.liberar) R.Cena.liberar('banho');
    var fala = function () { return res.motivo === 'sem-uni' ? Promise.resolve(null) : falarFrase('banhou', s.uniId); };
    var atraso = porToque ? 450 : 0;
    new Promise(function (ok) { setTimeout(ok, atraso); })
      .then(fala)
      .catch(function (e) { console.error(e); return null; })
      .then(function () { s.resolver(Object.assign({ pulou: !!s.pulou }, res)); });
  }

  /* ---------- API ---------- */
  // op.banheira = { x, y, w, h } (tiles); sem ela, procura a da cena ativa
  B.iniciar = function (uniId, op) {
    if (st) return st.promessa;
    op = op || {};
    var P = R.Progresso, Cu = R.Cuidados, J = window.Jogador;
    uniId = uniId || (P && P.montaria && P.montaria());
    var u = uniId && P.estado().unis[uniId];
    if (!u || !u.chocado) return falarSemUni().then(function () { return { ok: false, motivo: 'sem-uni' }; });
    // barra cheia: fala gentil, sem animação
    if (Cu && Cu.niveis && Cu.niveis(uniId).banho >= 99.5) {
      return falarFrase('jaLimpinho', uniId).then(function () { return { ok: false, motivo: 'cheio' }; });
    }
    var banheira = op.banheira || acharBanheira();
    var curta = !animacoesLigadas() || !banheira;
    var resolver;
    var promessa = new Promise(function (ok) { resolver = ok; });
    st = { uniId: uniId, def: P.defUni(uniId), estagio: R.Unicornios.estagio(u.xp || 0), montado: J.montado(),
      sujo: !!(Cu && Cu.sujo && Cu.sujo(uniId)), curta: curta, banheira: banheira,
      dur: curta ? cfg().duracaoCurtaMs : cfg().duracaoMs, inicio: 0, comecou: false, fim: false, pulou: false,
      timers: [], promessa: promessa, resolver: resolver };
    ultimo = null;
    if (R.Cena && R.Cena.ocupar) R.Cena.ocupar('banho');
    ouvir(true);
    // ela vai até o posto (à esquerda da banheira, olhando para ela); se não der, fica onde está
    var posto = banheira ? { x: banheira.x - 1, y: banheira.y + banheira.h - 1 } : null;
    var tl = J.tile();
    if (posto && (tl.x !== posto.x || tl.y !== posto.y) && J.irPara(posto.x, posto.y, comecar)) {
      J.marcador = null;
      depois(3000, comecar);                                // demorou demais: começa onde ela estiver
    } else comecar();
    // rede de segurança: nunca fica preso ocupado
    depois(3000 + st.dur + 2000, function () { if (st) terminar(false); });
    return promessa;
  };

  B.ativo = function () { return !!st; };
  // o banho é quem desenha o unicórnio agora (na versão curta ele fica com ela, como sempre)
  B.desenhandoUni = function () { return !!(st && st.comecou && !st.curta && st.banheira && st.geo && !st.fim); };
  function faseEm(e) {
    if (!st.comecou) return 'indo';
    if (st.curta) return 'brilhos';
    var s = e / st.dur, f = 'entrar';
    FASES.forEach(function (x) { if (s >= x[1]) f = x[0]; });
    return f;
  }
  B.depurar = function () {
    if (!st) return ultimo || { ativo: false, fase: null, t: 0, curta: false, uniId: null, pulou: false };
    var e = st.comecou ? agora() - st.inicio : 0;
    return { ativo: true, fase: faseEm(e), t: Math.round(e), curta: st.curta, uniId: st.uniId, pulou: st.pulou };
  };

  // itens do banho para ordenar por Y com a cena e o Jogador (main.js)
  B.itensDesenho = function (p, t, animar) {
    if (!B.desenhandoUni()) return [];
    var e = Math.min(st.dur, agora() - st.inicio), g = st.geo, pos = posicao(e);
    var yBanheira = g.py + 20;
    var s = e / st.dur;
    return [
      { y: yBanheira - 0.1, desenhar: function () { if (st) desenharEspuma(p, s, true); } },
      // montada, ele volta por trás dela (quando chega, ela já está "montando")
      { y: pos.dentro ? yBanheira : st.montado && s >= 0.88 ? Math.min(pos.y - 1.5, window.Jogador.y - 0.5) : pos.y - 1.5,
        desenhar: function () { if (st) desenharUni(p, e); } },
      { y: yBanheira + 0.1, desenhar: function () { if (st) desenharBanheira(p, e); } },
      { y: g.ly + 0.5, desenhar: function () { if (st) desenharGotas(p, e); } },
    ];
  };

  // por cima de tudo: os brilhos de limpinho (na versão curta, em volta dela montada ou do bebê)
  B.sobre = function (ctx, p, t, animar) {
    if (!st || !st.comecou || st.fim) return;
    var e = Math.min(st.dur, agora() - st.inicio);
    if (st.curta) {
      var J = window.Jogador, m = J.posMontaria(), alto = st.montado ? 26 : 14;
      desenharBrilhos(p, m.x, m.y, alto, e, false, 1);
      return;
    }
    if (!st.geo) return;
    var s = e / st.dur;
    if (s < 0.86) return;
    var pos = posicao(e);
    desenharBrilhos(p, pos.x, pos.y, st.geo.altoUni, e, true, trecho(s, 0.86, 0.94));
  };

  R.Banho = B;
})();
