/* Motor: canvas e escala (redimensionar), a câmera (segue a Mariana e foge do HUD) e o pintor
   (desenha personagens direto em pixels da tela). Veio de motor/main.js.
   Cria Reino._motor (INTERNO, só de motor/camera.js, laco.js, entrada.js e main.js):
     canvas, ctx, buffer, bctx, escala, dpr   o canvas da tela e o buffer em px do jogo (main.iniciar)
     cam, pintor                             a câmera (px do jogo) e o pintor (passado à Cena e às cenas)
     teclas, ultimo, pausado, jogoAtivo      controles e laço
     est(), redimensionar(), atualizarCamera(), desenhar(t) (laco.js), ligarControles(), montarControle() (entrada.js) */
(function () {
  var U = Reino.util, P = Reino.Progresso, J = Jogador, T = Mapa.T, Cena = Reino.Cena;
  var V = Reino._motor = {
    canvas: null, ctx: null, buffer: null, bctx: null, escala: 3, dpr: 1,
    cam: { x: 0, y: 0 },
    teclas: {},
    ultimo: 0, pausado: false, jogoAtivo: false,
  };
  var cam = V.cam;

  function est() { return P.estado(); }

  /* ---------- tamanho e escala ---------- */
  // escala do mundo (ui.md §10.11), inteira em px de aparelho: ~18 tiles de altura, o lado menor com
  // ≥ 8 tiles, e nunca menos de 2 px CSS por pixel (esse mínimo vence o dos 8 tiles)
  function escalaDoMundo(w, h, dpr) {
    var minimo = Math.max(1, Math.round(2 * dpr));
    var e = Math.max(Math.round(h / (T * 18)), minimo);
    e = Math.min(e, Math.floor(Math.min(w, h) / (T * 8)));
    return Math.max(e, minimo);
  }

  function redimensionar() {
    V.dpr = Math.min(window.devicePixelRatio || 1, 3);
    var w = window.innerWidth, h = window.innerHeight;
    V.canvas.width = Math.round(w * V.dpr); V.canvas.height = Math.round(h * V.dpr);
    V.canvas.style.width = w + 'px'; V.canvas.style.height = h + 'px';
    V.escala = escalaDoMundo(V.canvas.width, V.canvas.height, V.dpr);
    V.buffer.width = Math.ceil(V.canvas.width / V.escala) + 1;
    V.buffer.height = Math.ceil(V.canvas.height / V.escala) + 1;
    V.bctx.imageSmoothingEnabled = false;
    V.ctx.imageSmoothingEnabled = false;
    pintor.ctx = V.ctx; pintor.escala = V.escala; pintor.dpr = V.dpr;
    V.desenhar(performance.now());
  }

  // nos interiores, o HUD de cima e o menu de baixo não podem esconder a primeira e a última
  // fileira (o tapete de saída fica embaixo): a câmera pode passar da borda até o fim do HUD
  function margensHUD() {
    var m = { topo: 0, baixo: 0 };
    var r = V.canvas.getBoundingClientRect();
    U.$$('#hud .hud-topo > *').forEach(function (e) {
      var b = e.getBoundingClientRect();
      if (b.bottom > b.top) m.topo = Math.max(m.topo, b.bottom - r.top);
    });
    var dock = U.$('#hud .dock');
    if (dock) { var d = dock.getBoundingClientRect(); if (d.bottom > d.top) m.baixo = Math.max(0, r.bottom - d.top); }
    m.topo = m.topo * V.dpr / V.escala; m.baixo = m.baixo * V.dpr / V.escala;
    return m;
  }

  // no mapa, só a borda de baixo passa do fim do mapa, na altura do menu de baixo: senão ele esconde
  // a última fileira (portas da Pet Shop e do Observatório no celular; no notebook, o menu fica
  // centrado bem em cima do lago e esconderia quem nada na última fileira dele).
  // Em cima não: a coluna de chips da esquerda é alta e deixaria meia tela de grama vazia; as
  // placas dos cômodos já descem para fugir do HUD de cima.
  // A medida é guardada (getBoundingClientRect por quadro é caro) e refeita a cada meio segundo ou
  // quando a tela muda de tamanho; a margem usada desliza até a nova medida, para a câmera não pular.
  var mapaBaixo = { alvo: 0, atual: 0, medidoEm: -1e9, t: 0, chave: '' };
  function margemBaixoMapa() {
    var agora = performance.now(), chave = V.buffer.width + 'x' + V.buffer.height + '@' + V.escala;
    var mudouTela = chave !== mapaBaixo.chave;
    if (mudouTela || agora - mapaBaixo.medidoEm > 500) {
      var m = margensHUD();
      // o menu fica embaixo, no meio (em cima do lago): em qualquer tela a câmera pode passar da borda
      // até o fim dele, para a última fileira (portas de baixo, ela nadando) não ficar escondida
      mapaBaixo.alvo = m.baixo;
      mapaBaixo.medidoEm = agora;
    }
    if (mudouTela) { mapaBaixo.chave = chave; mapaBaixo.atual = mapaBaixo.alvo; }
    else {
      var dt = Math.min(0.1, Math.max(0, (agora - mapaBaixo.t) / 1000));
      var d = mapaBaixo.alvo - mapaBaixo.atual;
      mapaBaixo.atual = Math.abs(d) < 0.05 ? mapaBaixo.alvo : mapaBaixo.atual + d * Math.min(1, dt * 6);
    }
    mapaBaixo.t = agora;
    return mapaBaixo.atual;
  }

  function atualizarCamera() {
    var vw = V.buffer.width, vh = V.buffer.height;
    var c = Cena.atual();
    var mw = c.largura(), mh = c.altura();
    var alvoX = J.x - vw / 2, alvoY = J.y - 10 - vh / 2;
    cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(alvoX, 0, mw - vw);
    if (c.tipo !== 'interior') {
      var baixo = margemBaixoMapa();
      cam.y = mh <= vh - baixo ? (mh - vh + baixo) / 2 : U.clamp(alvoY, 0, Math.max(0, mh - vh + baixo));
      return;
    }
    var m = margensHUD(), livre = vh - m.topo - m.baixo;
    cam.y = mh <= livre ? (mh - livre) / 2 - m.topo : U.clamp(alvoY, -m.topo, mh - vh + m.baixo);
  }

  // desenha personagens direto em pixels de tela: andam suave, sem tremer
  var pintor = {
    ret: function (x, y, w, h, cor) {
      var x0 = Math.round((x - cam.x) * V.escala), y0 = Math.round((y - cam.y) * V.escala);
      var x1 = Math.round((x + w - cam.x) * V.escala), y1 = Math.round((y + h - cam.y) * V.escala);
      V.ctx.fillStyle = cor;
      V.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    },
    sprite: function (img, x, yPes) {
      var dx = Math.round((x - img.width / 2 - cam.x) * V.escala), dy = Math.round((yPes - img.height - cam.y) * V.escala);
      V.ctx.drawImage(img, dx, dy, img.width * V.escala, img.height * V.escala);
    },
    // px do jogo → px do canvas
    tela: function (x, y) { return { x: Math.round((x - cam.x) * V.escala), y: Math.round((y - cam.y) * V.escala) }; },
    ctx: null, escala: V.escala, dpr: V.dpr, cam: cam,
  };

  V.est = est; V.escalaDoMundo = escalaDoMundo; V.redimensionar = redimensionar; V.atualizarCamera = atualizarCamera; V.pintor = pintor;
})();
