/* Fotos do jogo (📷): a cena do canvas #reino (sem o HUD, que é DOM), com moldura em pixel e um
   carimbo com o lugar e a data, na fonte pixel. Nunca é a câmera do aparelho (nada de getUserMedia).
   As fotos ficam só neste aparelho, num IndexedDB próprio (config.fotos.banco), até config.fotos.maxAlbum;
   NUNCA no save nem no servidor. Sem IndexedDB (ou com erro), ainda dá para salvar no aparelho.
   Nada aqui toca em DOM, canvas, PA, Progresso ou Cena no carregamento: as ferramentas em Node
   (listar-falas.js) carregam este arquivo num vm só para ler falas(). */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var F = {};
  var K = '#3a2446';
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';

  // falas novas (pacote geral): o que aparece escrito na própria tela também é falado (só a voz)
  var FRASES = {
    previa: 'Que foto linda! Vamos guardar?',
    guardada: 'Foto guardada no álbum! 📸',
    cheio: 'O álbum está cheio. Apague uma foto para guardar outra.',
    semBanco: 'Neste aparelho só dá para salvar a foto.',
    salva: 'Pronto! A foto foi salva no aparelho.',
    vazio: 'O álbum ainda está vazio. Vamos tirar uma foto?',
  };
  F.frases = FRASES;
  F.falas = function () {
    return Object.keys(FRASES).map(function (k) { return { texto: FRASES[k], voz: 'claude' }; });
  };

  function cfg() {
    var c = (Reino.config && Reino.config.fotos) || {};
    return { maxLado: c.maxLado || 1600, maxAlbum: c.maxAlbum || 40, banco: c.banco || 'reino-fotos', toqueLongoMs: c.toqueLongoMs || 600 };
  }
  function U() { return Reino.util; }
  function falarVoz(texto) { try { if (Reino.Som && Reino.Som.falar) Reino.Som.falar(texto, { voz: 'claude' }); } catch (e) {} }
  function som(nome) { try { if (Reino.Som && Reino.Som.tocar) Reino.Som.tocar(nome); } catch (e) {} }
  function semAnimacao() {
    return !!((document.body && document.body.classList.contains('sem-animacao')) || (U() && U().reduzMovimentoSistema));
  }

  /* ---------- banco (IndexedDB próprio, só deste aparelho) ----------
     Loja 'fotos' (id automático): { id, criada, lugar, data, arquivo, w, h, png: Blob, mini: Blob } */
  var LOJA = 'fotos';
  var banco = { estado: null, db: null, abrindo: null, quantidade: 0 };
  function abrirBanco() {
    if (banco.abrindo) return banco.abrindo;
    banco.abrindo = new Promise(function (resolver) {
      var feito = false;
      function fim(estado, db) {
        if (feito) return;
        feito = true;
        banco.estado = estado; banco.db = db || null;
        if (!db) { resolver(null); return; }
        // outra aba quer mudar a versão do banco: fecha esta conexão (não trava a outra)
        db.onversionchange = function () { try { db.close(); } catch (e) {} banco.db = null; banco.estado = 'erro'; };
        contar().then(function () { resolver(db); }, function () { resolver(db); });
      }
      var idb = null;
      try { idb = window.indexedDB; } catch (e) { idb = null; }
      if (!idb || typeof idb.open !== 'function') { fim('sem-indexeddb'); return; }
      var pedido;
      try { pedido = idb.open(cfg().banco, 1); } catch (e) { fim('erro'); return; }
      pedido.onupgradeneeded = function () {
        var db = pedido.result;
        if (!db.objectStoreNames.contains(LOJA)) db.createObjectStore(LOJA, { keyPath: 'id', autoIncrement: true });
      };
      pedido.onsuccess = function () { fim('ok', pedido.result); };
      pedido.onerror = function () { fim('erro'); };
      // aba antiga segurando o banco, ou navegador que nunca responde: segue sem álbum
      setTimeout(function () { fim('erro'); }, 5000);
    });
    return banco.abrindo;
  }
  // uma operação numa transação; resolve com o resultado do pedido (ou rejeita)
  function operar(modo, fn) {
    return abrirBanco().then(function (db) {
      if (!db) throw new Error('sem banco');
      return new Promise(function (resolver, rejeitar) {
        var tx, pedido;
        try { tx = db.transaction(LOJA, modo); pedido = fn(tx.objectStore(LOJA)); } catch (e) { rejeitar(e); return; }
        tx.oncomplete = function () { resolver(pedido ? pedido.result : undefined); };
        tx.onerror = tx.onabort = function () { rejeitar(tx.error || new Error('transação')); };
      });
    });
  }
  function contar() {
    if (!banco.db) return Promise.resolve(0);
    return new Promise(function (resolver) {
      try {
        var p = banco.db.transaction(LOJA, 'readonly').objectStore(LOJA).count();
        p.onsuccess = function () { banco.quantidade = p.result; resolver(p.result); };
        p.onerror = function () { resolver(banco.quantidade); };
      } catch (e) { resolver(banco.quantidade); }
    });
  }
  // todas, da mais nova para a mais antiga
  function listar() {
    return operar('readonly', function (loja) { return loja.getAll(); }).then(function (l) {
      l = l || [];
      banco.quantidade = l.length;
      return l.sort(function (a, b) { return b.criada - a.criada || b.id - a.id; });
    });
  }
  // guarda se couber: 'ok' | 'cheio' | 'erro' (a conta e a gravação na mesma transação)
  function guardarNoBanco(foto) {
    var max = cfg().maxAlbum, resultado = 'erro';
    return operar('readwrite', function (loja) {
      var c = loja.count();
      c.onsuccess = function () {
        if (c.result >= max) { resultado = 'cheio'; return; }
        loja.add({ criada: foto.criada, lugar: foto.lugar, data: foto.data, arquivo: foto.arquivo, w: foto.w, h: foto.h, png: foto.png, mini: foto.mini });
        resultado = 'ok';
      };
      return null;
    }).then(function () { return contar().then(function () { return resultado; }); }, function () { return 'erro'; });
  }
  function apagarDoBanco(id) {
    return operar('readwrite', function (loja) { return loja.delete(id); }).then(contar);
  }

  /* ---------- lugar e data ---------- */
  function doisDigitos(n) { return (n < 10 ? '0' : '') + n; }
  function datas(d) {
    return {
      data: doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear(),
      arquivo: d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate()),
    };
  }
  // { predio, comodo }: no mapa, o Reino (ou o Lago, nadando); num interior, o prédio e o cômodo onde ela está
  function lugarAgora() {
    var cena = Reino.Cena && Reino.Cena.atual ? Reino.Cena.atual() : null;
    var J = window.Jogador;
    if (!cena || cena.tipo !== 'interior') {
      return { predio: J && J.nadando && J.nadando() ? 'Lago do Reino' : 'Reino dos Unicórnios', comodo: null };
    }
    var predio = cena.nome || 'Reino dos Unicórnios', comodo = null;
    var t = J && J.tile ? J.tile() : null;
    ((cena.def && cena.def.comodos) || []).forEach(function (c) {
      var r = c.rect;
      if (t && r && t.x >= r.x && t.x < r.x + r.w && t.y >= r.y && t.y < r.y + r.h) comodo = c.nome || c.placa || null;
    });
    if (comodo && comodo.toLowerCase() === predio.toLowerCase()) comodo = null;
    return { predio: predio, comodo: comodo };
  }
  function nomeLugar(l) { return l.comodo ? l.predio + ' · ' + l.comodo : l.predio; }
  // "Pet Shop · Cantinho da Água" → "pet-shop-cantinho-da-agua"
  function semAcento(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function lugarArquivo(lugar) {
    return semAcento(lugar).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'reino';
  }
  // o lugar que já começa com "reino" ("Reino dos Unicórnios") não repete o prefixo
  function nomeArquivo(foto) {
    var l = lugarArquivo(foto.lugar);
    return (/^reino(-|$)/.test(l) ? l : 'reino-' + l) + '-' + foto.arquivo + '.png';
  }

  /* ---------- pode tirar? ---------- */
  var ocupado = false;   // tirando (entre o toque e a prévia): não tira outra por cima
  function jogoComecou() {
    var hud = document.getElementById('hud');
    return !!(hud && !hud.hidden && document.getElementById('reino'));
  }
  F.podeTirar = function () {
    try {
      if (ocupado || typeof document === 'undefined' || !Reino.Cena || !Reino.UI) return false;
      return jogoComecou() && ['mapa', 'interior'].indexOf(Reino.Cena.estado()) >= 0 && !Reino.UI.temTela();
    } catch (e) { return false; }
  };

  /* ---------- captura ----------
     O canvas guarda o último quadro inteiro desenhado (o laço desenha tudo dentro de um
     requestAnimationFrame; aqui, fora dele, nunca se vê um quadro pela metade). Como podeTirar()
     exclui a transição, não há íris. Copia na hora do toque, antes do flash (que é DOM). */
  function capturar() {
    var cv = document.getElementById('reino');
    if (!cv || !cv.width || !cv.height) return null;
    var c = document.createElement('canvas');
    c.width = cv.width; c.height = cv.height;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(cv, 0, 0);
    // a mesma escala do jogo (main.js, redimensionar): px da tela por pixel do jogo
    var T = (window.Mapa && window.Mapa.T) || 16;
    var escala = Math.max(2, Math.round(Math.min(cv.width, cv.height) / (T * 12.5)));
    return { canvas: c, escala: escala };
  }

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

  /* ---------- flash ----------
     Um clarão branco que some depressa. Com Animações desligado (ou "reduzir movimento"), só um
     esmaecer suave e fraquinho. É transição (não animação), para o body.sem-animacao não cortar. */
  function flash() {
    var d = document.createElement('div');
    d.className = 'fotos-flash' + (semAnimacao() ? ' suave' : '');
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
    void d.offsetWidth;
    d.classList.add('sumindo');
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 900);
  }

  /* ---------- salvar no aparelho (download) ---------- */
  function baixar(blob, nome) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nome; a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 4000);
  }

  function botao(rotulo, principal, classe) {
    return U().el('button.btn-grande' + (principal ? '.btn-principal' : '.btn-secundario') + (classe ? '.' + classe : ''), { type: 'button' }, rotulo);
  }

  var ultima = null;   // a última foto tirada nesta visita (para depurar)

  /* ---------- tirar ---------- */
  F.tirar = function () {
    if (!F.podeTirar()) return Promise.resolve(null);
    var cap = capturar();
    if (!cap) return Promise.resolve(null);
    ocupado = true;
    var lugar = lugarAgora(), quando = new Date();
    som('clique');
    flash();
    abrirBanco();
    var espera = new Promise(function (r) { setTimeout(r, semAnimacao() ? 120 : 260); });
    var foto = null;
    return fontePronta().then(function () {
      var f = montarFoto(cap, lugar, quando);
      return Promise.all([paraBlob(f.canvas), miniatura(f.canvas), espera]).then(function (r) {
        foto = { criada: quando.getTime(), lugar: f.lugar, data: f.data, arquivo: f.arquivo, w: f.w, h: f.h, png: r[0], mini: r[1] };
        ultima = { lugar: foto.lugar, data: foto.data, w: foto.w, h: foto.h };
        return abrirBanco();
      });
    }).then(function () {
      ocupado = false;
      if (!foto || !foto.png) return null;
      return previa(foto);
    }, function (e) {
      ocupado = false;
      if (window.console) console.error('Fotos: não deu para montar a foto', e);
      return null;
    });
  };

  // "Que foto linda!": Guardar no álbum (principal), Salvar no aparelho e Apagar
  function previa(foto) {
    var UI = Reino.UI, el = U().el;
    return new Promise(function (resolver) {
      var guardou = false, salvou = false, acabou = false;
      var url = URL.createObjectURL(foto.png);
      function fim() {
        if (acabou) return;
        acabou = true;
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        resolver(guardou || salvou ? { lugar: foto.lugar, data: foto.data, w: foto.w, h: foto.h, guardada: guardou, salva: salvou } : null);
      }
      var pn = UI.painel('fotos-previa', 'Que foto linda! 📸', { aoFechar: fim });
      var img = el('img.fotos-img', { src: url, alt: 'Foto: ' + foto.lugar + ', ' + foto.data, width: foto.w, height: foto.h, draggable: 'false' });
      var msg = el('p.fotos-msg', { role: 'status' });
      var guardar = botao('🖼 Guardar no álbum', true, 'fotos-guardar');
      var album = botao('🖼 Abrir o álbum', true, 'fotos-abrir-album');
      var salvar = botao('💾 Salvar no aparelho', false, 'fotos-salvar');
      var apagar = botao('🗑 Apagar', false, 'fotos-apagar');
      album.hidden = true;
      var corpo = el('div.fotos-previa-corpo', el('div.fotos-moldura-img', img), msg, el('div.intro-botoes.fotos-botoes', guardar, album, salvar, apagar));
      pn.conteudo.appendChild(corpo);
      function avisar(texto) { U().preencher(msg, texto); msg.hidden = !texto; corpo.classList.toggle('com-msg', !!texto); if (texto) falarVoz(texto); }
      function focarBotao(b) { if (UI.porTeclado && UI.porTeclado()) setTimeout(function () { try { b.focus({ preventScroll: true }); } catch (e) {} }, 30); }
      // estado do banco: sem álbum aqui, só salvar no aparelho; álbum lotado, avisa e oferece abrir
      function conferir() {
        var cheio = banco.estado === 'ok' && banco.quantidade >= cfg().maxAlbum;
        // sem álbum neste aparelho, o "Salvar no aparelho" vira o botão principal
        salvar.classList.toggle('btn-principal', banco.estado !== 'ok');
        salvar.classList.toggle('btn-secundario', banco.estado === 'ok');
        if (banco.estado !== 'ok') { guardar.hidden = true; album.hidden = true; avisar(FRASES.semBanco); return; }
        guardar.hidden = cheio; album.hidden = !cheio;
        if (cheio) avisar(FRASES.cheio); else { msg.hidden = true; corpo.classList.remove('com-msg'); falarVoz(FRASES.previa); }
      }
      msg.hidden = true;
      conferir();
      guardar.addEventListener('click', function () {
        if (guardar.disabled) return;
        som('toque');
        guardar.disabled = true;
        guardarNoBanco(foto).then(function (r) {
          guardar.disabled = false;
          if (r === 'ok') {
            guardou = true;
            UI.fecharTela(pn.tela);
            fim();
            if (Reino.Claude && Reino.Claude.falar) Reino.Claude.falar(FRASES.guardada, { voz: 'claude', tempo: 4000 });
            return;
          }
          if (r === 'cheio') { conferir(); focarBotao(album); return; }
          banco.estado = 'erro';
          conferir(); focarBotao(salvar);
        });
      });
      album.addEventListener('click', function () {
        som('toque');
        // apagou alguma lá dentro? de volta aqui, o "Guardar no álbum" reaparece
        F.abrirAlbum().then(function () { if (!acabou) { conferir(); if (!guardar.hidden) focarBotao(guardar); } });
      });
      salvar.addEventListener('click', function () {
        som('toque');
        baixar(foto.png, nomeArquivo(foto));
        salvou = true;
        avisar(FRASES.salva);
      });
      apagar.addEventListener('click', function () {
        som('toque');
        Reino.Som && Reino.Som.calar && Reino.Som.calar();
        UI.fecharTela(pn.tela);
        fim();
      });
    });
  }

  /* ---------- álbum ---------- */
  F.abrirAlbum = function () {
    var UI = Reino.UI, el = U().el;
    if (!UI || typeof document === 'undefined') return Promise.resolve();
    return abrirBanco().then(function () {
      return new Promise(function (resolver) {
        var urls = [];
        function soltar() { urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; }
        var pn = UI.painel('fotos-album', 'Álbum de fotos 🖼', { aoFechar: function () { soltar(); resolver(); } });
        var falouVazio = false;
        function montar(focarIndice) {
          soltar();
          pn.conteudo.innerHTML = '';
          if (banco.estado !== 'ok') {
            pn.conteudo.appendChild(el('p.fotos-msg.fotos-aviso', FRASES.semBanco));
            pn.conteudo.appendChild(el('p.fotos-nota', 'As fotos podem ir para o aparelho pelo "Salvar no aparelho", logo depois de tirar. 💾'));
            falarVoz(FRASES.semBanco);
            return;
          }
          listar().then(function (lista) {
            if (!pn.tela.isConnected) return;
            var max = cfg().maxAlbum;
            pn.conteudo.appendChild(el('p.fotos-conta', lista.length + ' de ' + max + (max === 1 ? ' foto' : ' fotos')));
            if (!lista.length) {
              pn.conteudo.appendChild(el('p.fotos-msg', FRASES.vazio + ' 📸'));
              if (!falouVazio) { falouVazio = true; falarVoz(FRASES.vazio); }
              return;
            }
            if (lista.length >= max) pn.conteudo.appendChild(el('p.fotos-msg.fotos-aviso', FRASES.cheio));
            var grade = el('div.fotos-grade');
            var bts = lista.map(function (f, i) {
              var u = URL.createObjectURL(f.mini || f.png);
              urls.push(u);
              var b = el('button.fotos-mini', { type: 'button', 'aria-label': 'Ver a foto: ' + f.lugar + ', ' + f.data },
                el('img', { src: u, alt: '', draggable: 'false' }),
                el('span.fotos-mini-data', f.data));
              b.addEventListener('click', function () { som('toque'); verGrande(lista, i, function (apagou) { if (apagou) montar(i); }); });
              grade.appendChild(b);
              return b;
            });
            pn.conteudo.appendChild(grade);
            if (focarIndice != null && UI.porTeclado && UI.porTeclado()) {
              var alvo = bts[Math.min(focarIndice, bts.length - 1)];
              setTimeout(function () { UI.focarTeclado ? UI.focarTeclado(alvo) : alvo.focus(); }, 30);
            }
          }, function () {
            banco.estado = 'erro';
            montar();
          });
        }
        montar();
      });
    });
  };

  // a foto grande, com ◀ ▶ (e as setas do teclado), Salvar no aparelho e Apagar (com confirmação)
  function verGrande(lista, i, aoFechar) {
    var UI = Reino.UI, el = U().el;
    var apagou = false, url = null;
    var pn = UI.painel('fotos-ver', 'Foto do álbum 🖼', { aoFechar: function () { if (url) URL.revokeObjectURL(url); aoFechar(apagou); } });
    var img = el('img.fotos-img', { alt: '', draggable: 'false' });
    var legenda = el('p.fotos-legenda');
    var ant = el('button.btn-icone.fotos-nav', { type: 'button', 'aria-label': 'Foto anterior' }, '◀');
    var prox = el('button.btn-icone.fotos-nav', { type: 'button', 'aria-label': 'Próxima foto' }, '▶');
    var salvar = botao('💾 Salvar no aparelho', true, 'fotos-salvar');
    var apagar = botao('🗑 Apagar', false, 'fotos-apagar');
    var msg = el('p.fotos-msg', { role: 'status', hidden: true });
    pn.conteudo.appendChild(el('div.fotos-ver-corpo',
      el('div.fotos-ver-linha', ant, el('div.fotos-moldura-img', img), prox),
      legenda, msg, el('div.intro-botoes.fotos-botoes', salvar, apagar)));
    function mostrar() {
      var f = lista[i];
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(f.png);
      img.src = url; img.alt = 'Foto: ' + f.lugar + ', ' + f.data;
      img.width = f.w; img.height = f.h;
      U().preencher(legenda, f.lugar + ' · ' + f.data);
      msg.hidden = true;
      var varias = lista.length > 1;
      ant.hidden = prox.hidden = !varias;
    }
    function andar(d) { i = (i + d + lista.length) % lista.length; mostrar(); }
    ant.addEventListener('click', function () { som('toque'); andar(-1); });
    prox.addEventListener('click', function () { som('toque'); andar(1); });
    // (com a confirmação aberta por cima, o foco está nela e as setas não chegam aqui)
    pn.tela.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' && lista.length > 1) { e.preventDefault(); andar(-1); }
      if (e.key === 'ArrowRight' && lista.length > 1) { e.preventDefault(); andar(1); }
    });
    salvar.addEventListener('click', function () {
      som('toque');
      var f = lista[i];
      baixar(f.png, nomeArquivo(f));
      U().preencher(msg, FRASES.salva); msg.hidden = false;
      falarVoz(FRASES.salva);
    });
    apagar.addEventListener('click', function () {
      som('toque');
      UI.escolher('Apagar esta foto do álbum? Ela não volta mais.', [
        { rotulo: 'Não, deixar', valor: false, seguro: true },
        { rotulo: '🗑 Sim, apagar', valor: true, principal: true },
      ], 'fotos-confirmar').then(function (sim) {
        if (!sim) return;
        apagarDoBanco(lista[i].id).then(function () {
          apagou = true;
          UI.fecharTela(pn.tela);
          if (url) { URL.revokeObjectURL(url); url = null; }
          aoFechar(true);
        }, function () {
          U().preencher(msg, 'Não deu para apagar agora. Tente de novo.'); msg.hidden = false;
        });
      });
    });
    mostrar();
  }

  /* ---------- testes (?debug=1 → __reino.fotos()) ---------- */
  F.depurar = function () {
    if (!banco.abrindo && typeof document !== 'undefined') abrirBanco();
    return {
      podeTirar: F.podeTirar(),
      banco: banco.estado || 'ok',   // abrindo ainda: 'ok' até dizer o contrário
      quantidade: banco.quantidade,
      ultima: ultima ? { lugar: ultima.lugar, data: ultima.data, w: ultima.w, h: ultima.h } : null,
    };
  };

  Reino.Fotos = F;
})();
