/* Fotos (parte 2 de 3): a moldura em pixel e o carimbo com o lugar e a data; monta a foto num canvas
   novo a partir da captura (e a miniatura do álbum). Nada roda no carregamento. Ver o cabeçalho de fotos.js. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var I = Reino._fotos;
  var K = I.K, FONTE_PIXEL = I.FONTE_PIXEL, cfg = I.cfg, datas = I.datas, nomeLugar = I.nomeLugar;

  /* ---------- moldura e carimbo ----------
     Tudo em "pixels da moldura" de u px (inteiro), para ficar com cara de pixel art em qualquer tamanho.
     Borda de B unidades nos lados e em cima; embaixo, a faixa do carimbo. */
  var BORDA = 11;
  var COR = { corpo: '#ffd6ea', luz: '#fff0f7', sombra: '#f4a9cb', papel: '#fff8ee', papelSombra: '#f3e6c8', ouro: '#ffd34d', lilas: '#cdb8ff', lilasClaro: '#efe6ff', rosa: '#ff6b8a', rosaEscuro: '#d63d63' };
  // coração e estrelinha dos cantos (k contorno, r/y cor, w brilho, d sombra)
  var CORACAO = [
    '.kk.kk.',
    'krrkrrk',
    'krwrrrk',
    'krrrrdk',
    '.krrdk.',
    '..kdk..',
    '...k...',
  ];
  var ESTRELA = [
    '...k...',
    '..kyk..',
    'kkkwykk',
    'kyyyyok',
    '.kyyok.',
    'kyokyok',
    'kk...kk',
  ];
  function desenharMapaBits(ctx, bits, x, y, u, cores) {
    for (var j = 0; j < bits.length; j++) {
      for (var i = 0; i < bits[j].length; i++) {
        var ch = bits[j][i];
        if (ch === '.') continue;
        ctx.fillStyle = cores[ch];
        ctx.fillRect(x + i * u, y + j * u, u, u);
      }
    }
  }

  // escolhe a escala da cena: inteira para cima (k) ou para baixo (1/d), com o lado maior da foto
  // inteira (moldura inclusa) ≤ maxLado. Reduzindo, prefere um d que divide a escala do jogo (cada
  // pixel do jogo vira um número inteiro de pixels da foto: nítido, sem pixel torto)
  function medidas(cw, ch) {
    var u = Math.max(2, Math.round(Math.sqrt(cw * ch) / 170));
    var b = BORDA * u;
    var fonte = Math.max(8, 8 * Math.round(u * 0.8));
    return { cw: cw, ch: ch, u: u, b: b, fonte: fonte };
  }
  function cabe(m, maxLado) {
    // faixa de baixo com até duas linhas de carimbo (a conta exata fica para montar(); aqui, o maior caso)
    var faixa = 2 * (m.fonte + 6 * m.u) + 4 * m.u;
    return Math.max(m.cw + 2 * m.b, m.ch + m.b + m.b + faixa) <= maxLado;
  }
  function escolherEscala(W, H, escalaJogo, maxLado) {
    for (var k = 4; k >= 1; k--) {
      if (cabe(medidas(W * k, H * k), maxLado)) return { mult: k, div: 1 };
    }
    var dMin = 0;
    for (var d = 2; d <= 64; d++) { if (cabe(medidas(Math.floor(W / d), Math.floor(H / d)), maxLado)) { dMin = d; break; } }
    if (!dMin) dMin = 64;
    for (var d2 = dMin; d2 <= Math.floor(dMin * 1.5); d2++) { if (escalaJogo % d2 === 0) return { mult: 1, div: d2 }; }
    return { mult: 1, div: dMin };
  }

  // o texto do carimbo em uma ou duas etiquetas (lugar e data), na fonte pixel; devolve o layout
  function planejarCarimbo(ctx, lugar, data, larguraUtil, m) {
    var l = lugar;
    for (var fonte = m.fonte; fonte >= 8; fonte -= 8) {
      ctx.font = fonte + 'px ' + FONTE_PIXEL;
      ctx.textRendering = 'optimizeSpeed';   // sem ligadura "fi"/"fl" (ui.md §10.9)
      var pad = Math.max(6, Math.round(fonte * 0.6)), vao = 3 * m.u;
      var tentativas = l.comodo ? [nomeLugar(l), l.predio] : [l.predio];   // o cômodo só se couber
      for (var i = 0; i < tentativas.length; i++) {
        var tl = tentativas[i];
        var wl = Math.ceil(ctx.measureText(tl).width) + pad * 2, wd = Math.ceil(ctx.measureText(data).width) + pad * 2;
        if (wl + vao + wd <= larguraUtil) return { fonte: fonte, pad: pad, linhas: [[tl, data]], wl: wl, wd: wd, vao: vao, texto: tl };
        if (Math.max(wl, wd) <= larguraUtil) return { fonte: fonte, pad: pad, linhas: [[tl], [data]], wl: wl, wd: wd, vao: vao, texto: tl };
      }
    }
    ctx.font = '8px ' + FONTE_PIXEL;
    ctx.textRendering = 'optimizeSpeed';   // sem ligadura "fi"/"fl" (ui.md §10.9)
    return { fonte: 8, pad: 6, linhas: [[l.predio], [data]], wl: larguraUtil, wd: Math.ceil(ctx.measureText(data).width) + 12, vao: 3 * m.u, texto: l.predio };
  }

  // etiqueta como as placas dos cômodos: contorno, papel, sombrinha embaixo e dois pontinhos dourados
  function etiqueta(ctx, x, y, w, h, texto, fonte, u, fundo) {
    var bd = Math.max(2, Math.round(u * 0.6)), pt = Math.max(2, Math.round(u * 0.6));
    ctx.fillStyle = K;
    ctx.fillRect(x - bd, y - bd, w + bd * 2, h + bd * 2);
    ctx.fillStyle = fundo;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = COR.papelSombra;
    ctx.fillRect(x, y + h - bd, w, bd);
    ctx.fillStyle = COR.ouro;
    ctx.fillRect(x + pt, y + pt, pt, pt);
    ctx.fillRect(x + w - pt * 2, y + pt, pt, pt);
    ctx.fillStyle = K;
    ctx.font = fonte + 'px ' + FONTE_PIXEL;
    ctx.textRendering = 'optimizeSpeed';   // sem ligadura "fi"/"fl" (ui.md §10.9)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, Math.round(x + w / 2), Math.round(y + h / 2 + fonte * 0.06));
  }

  function montarFoto(cap, lugar, quando) {
    var mx = cfg().maxLado;
    var W = cap.canvas.width, H = cap.canvas.height;
    var e = escolherEscala(W, H, cap.escala, mx);
    var cw = Math.floor(W * e.mult / e.div), ch = Math.floor(H * e.mult / e.div);
    var m = medidas(cw, ch);
    var u = m.u, b = m.b;
    var d = datas(quando);
    var out = document.createElement('canvas');
    var ctx = out.getContext('2d');
    // carimbo: planeja antes para saber a altura da faixa de baixo
    var util = cw + 2 * b - 8 * u;
    var plano = planejarCarimbo(ctx, lugar, d.data, util, m);
    var hEt = plano.fonte + plano.pad * 2;
    var faixa = plano.linhas.length * hEt + (plano.linhas.length - 1) * 3 * u + 4 * u;
    var fw = cw + 2 * b, fh = ch + b + b + faixa;
    // nunca passa do lado maior (medidas() já reserva o pior caso; isto é só por garantia)
    if (Math.max(fw, fh) > mx) { var s = mx / Math.max(fw, fh); cw = Math.floor(cw * s); ch = Math.floor(ch * s); fw = cw + 2 * b; fh = ch + b + b + faixa; }
    out.width = fw; out.height = fh;
    ctx.imageSmoothingEnabled = false;

    // contorno de fora, com os cantos arredondados em degrau (a pontinha fica transparente)
    ctx.fillStyle = K;
    ctx.fillRect(0, 0, fw, fh);
    [[0, 0], [fw - u, 0], [0, fh - u], [fw - u, fh - u]].forEach(function (p) { ctx.clearRect(p[0], p[1], u, u); });
    // corpo rosinha (o pixel de dentro de cada canto fica no contorno, fechando o degrau),
    // com luz em cima e à esquerda e sombra embaixo e à direita
    ctx.fillStyle = COR.corpo;
    ctx.fillRect(u, u, fw - 2 * u, fh - 2 * u);
    ctx.fillStyle = K;
    [[u, u], [fw - 2 * u, u], [u, fh - 2 * u], [fw - 2 * u, fh - 2 * u]].forEach(function (p) { ctx.fillRect(p[0], p[1], u, u); });
    ctx.fillStyle = COR.luz;
    ctx.fillRect(2 * u, u, fw - 4 * u, u);
    ctx.fillRect(u, 2 * u, u, fh - 4 * u);
    ctx.fillStyle = COR.sombra;
    ctx.fillRect(2 * u, fh - 2 * u, fw - 4 * u, u);
    ctx.fillRect(fw - 2 * u, 2 * u, u, fh - 4 * u);
    // bolinhas lilás e douradas no meio da borda (em cima e nos lados)
    var meio = Math.round(b / 2) - u, passo = 6 * u, n = 0;
    for (var x = b + 2 * u; x < fw - b - u; x += passo) { ctx.fillStyle = n++ % 2 ? COR.ouro : COR.lilas; ctx.fillRect(x, meio, u, u); }
    n = 0;
    for (var y = b + 2 * u; y < b + ch - u; y += passo) {
      ctx.fillStyle = n++ % 2 ? COR.ouro : COR.lilas;
      ctx.fillRect(meio, y, u, u);
      ctx.fillRect(fw - meio - u, y, u, u);
    }
    // contorno da cena e a cena (vizinho mais próximo)
    ctx.fillStyle = K;
    ctx.fillRect(b - u, b - u, cw + 2 * u, ch + 2 * u);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cap.canvas, 0, 0, W, H, b, b, cw, ch);
    // cantoneiras de álbum nas quatro pontas da cena (triângulos de papel com contorno)
    var ct = 8;
    [[b, b, 1, 1], [b + cw, b, -1, 1], [b, b + ch, 1, -1], [b + cw, b + ch, -1, -1]].forEach(function (p) {
      for (var j = 0; j < ct; j++) {
        for (var i = 0; i < ct - j; i++) {
          ctx.fillStyle = i === ct - j - 1 ? K : COR.papel;   // a diagonal é o contorno
          var px = p[2] > 0 ? p[0] + i * u : p[0] - (i + 1) * u;
          var py = p[3] > 0 ? p[1] + j * u : p[1] - (j + 1) * u;
          ctx.fillRect(px, py, u, u);
        }
      }
    });
    // corações em cima e estrelinhas embaixo, nos cantos da moldura
    var cores = { k: K, r: COR.rosa, w: '#ffffff', d: COR.rosaEscuro, y: COR.ouro, o: '#e0a020' };
    var off = Math.round((b - 7 * u) / 2);
    desenharMapaBits(ctx, CORACAO, off, off, u, cores);
    desenharMapaBits(ctx, CORACAO, fw - off - 7 * u, off, u, cores);
    var yEst = fh - off - 7 * u;
    desenharMapaBits(ctx, ESTRELA, off, yEst, u, cores);
    desenharMapaBits(ctx, ESTRELA, fw - off - 7 * u, yEst, u, cores);

    // carimbo: lugar (papel) e data (lilás), centrados na faixa de baixo
    var topoFaixa = b + ch + b - u;
    var altUtil = fh - topoFaixa - 2 * u;
    var altTotal = plano.linhas.length * hEt + (plano.linhas.length - 1) * 3 * u;
    var yy = topoFaixa + Math.round((altUtil - altTotal) / 2);
    plano.linhas.forEach(function (linha) {
      var ws = linha.map(function (t) { return t === plano.texto ? plano.wl : plano.wd; });
      var total = ws.reduce(function (a, v) { return a + v; }, 0) + (linha.length - 1) * plano.vao;
      var xx = Math.round((fw - total) / 2);
      linha.forEach(function (t, i) {
        etiqueta(ctx, xx, yy, ws[i], hEt, t, plano.fonte, u, t === plano.texto ? COR.papel : COR.lilasClaro);
        xx += ws[i] + plano.vao;
      });
      yy += hEt + 3 * u;
    });
    return { canvas: out, lugar: plano.texto, data: d.data, arquivo: d.arquivo, w: fw, h: fh };
  }

  // a fonte pixel já veio? (nas placas ela é a mesma; sem rede, segue com a de reserva)
  function fontePronta() {
    try {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      return Promise.race([document.fonts.load('32px "Press Start 2P"').catch(function () {}), new Promise(function (r) { setTimeout(r, 1500); })]);
    } catch (e) { return Promise.resolve(); }
  }
  function paraBlob(canvas, tipo) {
    return new Promise(function (resolver) {
      if (canvas.toBlob) canvas.toBlob(function (bl) { resolver(bl); }, tipo || 'image/png');
      else resolver(null);
    });
  }
  // miniatura para a grade do álbum (lado maior 320, suavizada: é só para escolher)
  function miniatura(canvas) {
    var s = Math.min(1, 320 / Math.max(canvas.width, canvas.height));
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(canvas.width * s)); c.height = Math.max(1, Math.round(canvas.height * s));
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(canvas, 0, 0, c.width, c.height);
    return paraBlob(c, 'image/png');
  }

  // para as outras partes
  I.montarFoto = montarFoto; I.fontePronta = fontePronta; I.paraBlob = paraBlob; I.miniatura = miniatura;
})();
