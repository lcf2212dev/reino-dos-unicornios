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
  // escala do mundo (arte.md §11), inteira em px de aparelho: ~18 tiles de altura, o lado menor com
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

  // área útil (arte.md §18): o HUD (ui/hud.js) escreve no :root o que cobre, em px CSS; aqui só se lê
  // (nada de medir o HUD nem o dock). Folga de 8 px entre a área útil e o que a cobre (arte.md §18.2)
  var FOLGA = 8;
  var raiz = document.documentElement.style;
  function lerVar(nome) { return parseFloat(raiz.getPropertyValue(nome)) || 0; }
  // relida de 250 em 250 ms ou quando a escala muda (a leitura por quadro custava no mapa)
  var areaGuardada = null, areaEm = -1e9;
  // o balão abrir, fechar ou mudar de altura (claude.js escreve --balao-altura) relê na hora
  if (typeof MutationObserver === 'function') new MutationObserver(function () { areaEm = -1e9; })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  function areaHUD() {
    var agora = performance.now(), k = V.dpr / V.escala;   // px CSS → px do jogo
    if (areaGuardada && areaGuardada.k === k && agora - areaEm < 250) return areaGuardada;
    areaGuardada = lerArea(k);
    areaEm = areaGuardada.topo ? agora : -1e9;   // HUD ainda sem medida: lê de novo no próximo quadro
    return areaGuardada;
  }
  function lerArea(k) {
    function g(v) { return v > 0 ? (v + FOLGA) * k : 0; }
    return {
      topo: g(lerVar('--hud-topo')), baixo: g(lerVar('--dock-altura')), k: k,
      balao: g(lerVar('--balao-altura')),   // do topo do balão (com a aba do nome) ao pé, mais a folga; 0 fechado
      esq: { largura: lerVar('--hud-esq-largura'), fundo: g(lerVar('--hud-esq-fundo')) },
      dir: { largura: lerVar('--hud-dir-largura'), fundo: g(lerVar('--hud-dir-fundo')) },
    };
  }
  // nos interiores, a margem de cima conta só o bloco do HUD que cruza a coluna do cômodo (D2A-01):
  // cômodo estreito no meio sobe até o topo da tela; o de baixo é o dock (o tapete de saída fica embaixo)
  function margensInterior(a, mw) {
    var x0 = -cam.x / a.k, x1 = (mw - cam.x) / a.k, vw = window.innerWidth, topo = 0;
    if (x0 < a.esq.largura) topo = Math.max(topo, a.esq.fundo);
    if (x1 > vw - a.dir.largura) topo = Math.max(topo, a.dir.fundo);
    return { topo: topo, baixo: a.baixo };
  }

  // no mapa, a borda de baixo passa do fim do mapa na altura do dock (senão ele esconde a última fileira:
  // portas da Pet Shop e do Observatório, ela nadando no lago) e a de cima, na altura do HUD, só com a Mariana
  // nas 6 primeiras fileiras (BORDA_CIMA, D1-11: o telhado dos prédios de cima fica abaixo do HUD; mais para
  // baixo, a borda volta ao mapa, para não abrir grama vazia). A margem usada desliza até a nova, sem pular.
  var FILEIRAS_CIMA = 6;
  var bordas = { cima: 0, baixo: 0, t: 0, chave: '' };
  function bordasMapa(a) {
    var agora = performance.now(), chave = V.buffer.width + 'x' + V.buffer.height + '@' + V.escala;
    var alvoCima = Math.floor(J.y / T) < FILEIRAS_CIMA ? a.topo : 0;
    if (chave !== bordas.chave) { bordas.chave = chave; bordas.cima = alvoCima; bordas.baixo = a.baixo; }
    else {
      var f = Math.min(1, Math.min(0.1, Math.max(0, (agora - bordas.t) / 1000)) * 6);
      bordas.cima = deslizar(bordas.cima, alvoCima, f);
      bordas.baixo = deslizar(bordas.baixo, a.baixo, f);
    }
    bordas.t = agora;
    return bordas;
  }
  function deslizar(atual, alvo, f) { var d = alvo - atual; return Math.abs(d) < 0.05 ? alvo : atual + d * f; }

  function atualizarCamera() {
    var vw = V.buffer.width, vh = V.buffer.height;
    var c = Cena.atual();
    var mw = c.largura(), mh = c.altura(), a = areaHUD();
    cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(J.x - vw / 2, 0, mw - vw);
    // a Mariana no meio da área útil (entre o HUD e o dock), não da tela inteira (D1-10)
    function alvoY(topo, baixo) { return J.y - 10 - topo - (vh - topo - baixo) / 2; }
    if (c.tipo !== 'interior') {
      var b = bordasMapa(a), livreMapa = vh - b.cima - b.baixo;
      cam.y = mh <= livreMapa ? (mh - livreMapa) / 2 - b.cima
        : U.clamp(alvoY(a.topo, a.baixo), -b.cima, Math.max(-b.cima, mh - vh + b.baixo));
      return;
    }
    var m = margensInterior(a, mw), livre = vh - m.topo - m.baixo;
    cam.y = mh <= livre ? (mh - livre) / 2 - m.topo : U.clamp(alvoY(m.topo, m.baixo), -m.topo, mh - vh + m.baixo);
    acimaDoBalao(c, a, vh);
    // quem precisa mostrar outra coisa que não ela (o fantasma do modo decorar, ui/casa-decorar-fantasma.js) ajusta aqui
    if (V.ajusteCamera) V.ajusteCamera(cam, c);
  }
  // conversa com NPC (balão modal, D5-05): a câmera sobe só o que falta para a Mariana e o NPC ficarem inteiros
  // acima do balão (a margem de baixo vira max(dock, balão) + folga); fechado, volta ao lugar de sempre
  // na mesma conversa a câmera só sobe (a altura do balão muda de página em página: sem vai e volta)
  var subida = { quem: null, y: 0 };
  function acimaDoBalao(c, a, vh) {
    var Cl = Reino.Claude, quem = Cl && Cl.quemFala ? Cl.quemFala() : null;
    if (!a.balao || a.balao <= a.baixo || !quem) { subida.quem = null; return; }
    var pes = J.y, n = npcDaConversa(c);
    if (n) pes = Math.max(pes, n.y * T + T);
    cam.y = Math.max(cam.y, pes + 2 - (vh - a.balao));
    if (subida.quem === quem) cam.y = Math.max(cam.y, subida.y);
    subida.quem = quem; subida.y = cam.y;
  }
  // o NPC da conversa: o mais perto da Mariana, no máximo a 2 tiles (ela para no tile do lado dele)
  function npcDaConversa(c) {
    var lista = c.npcs ? c.npcs() : [], melhor = null, dist = 2.5;
    for (var i = 0; i < lista.length; i++) {
      var d = Math.abs(lista[i].x * T + T / 2 - J.x) / T + Math.abs(lista[i].y * T + T - J.y) / T;
      if (d < dist) { dist = d; melhor = lista[i]; }
    }
    return melhor;
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
