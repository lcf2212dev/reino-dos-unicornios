/* Motor: o quadro (desenhar: cenário, personagens por Y, placas, luz e íris) e o laço
   (requestAnimationFrame: anda com as teclas ou pelo caminho). Veio de motor/main.js.
   Usa Reino._motor (ver motor/camera.js); registra V.desenhar e V.laco. */
(function () {
  var U = Reino.util, J = Jogador, Cena = Reino.Cena;
  var EV = Reino.EVENTOS;
  var V = Reino._motor, cam = V.cam, pintor = V.pintor, est = V.est, atualizarCamera = V.atualizarCamera;

  // luz em faixas de pixel: o clarão quente no meio e a vinheta escura nas bordas, calculados na grade de pixels da
  // cena (canvas pequeno, alfa em poucos níveis) e ampliados sem suavizar. Um só cache, refeito quando o tamanho muda.
  var luz = { w: 0, h: 0, escala: 0, img: null };
  function faixaLuz(t) {
    if (t < 0.42) return [255, 236, 200, Math.ceil((1 - t / 0.42) * 2) * 0.04];   // 0,08 · 0,04
    if (t > 0.72) return [58, 36, 70, Math.ceil((t - 0.72) / 0.28 * 4) * 0.04];    // 0,04 … 0,16
    return null;
  }
  function imagemLuz() {
    var W = V.canvas.width, H = V.canvas.height, e = V.escala || 1;
    if (luz.img && luz.w === W && luz.h === H && luz.escala === e) return luz.img;
    var w = Math.ceil(W / e), h = Math.ceil(H / e);
    var c = luz.img && luz.img.width === w && luz.img.height === h ? luz.img : document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    var cx = W / 2, cy = H / 2, raio = Math.max(W, H) * 0.62;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var dx = (x + 0.5) * e - cx, dy = (y + 0.5) * e - cy;
      var f = faixaLuz(Math.min(1, Math.sqrt(dx * dx + dy * dy) / raio));
      if (!f || !f[3]) continue;
      var i = (y * w + x) * 4;
      d[i] = f[0]; d[i + 1] = f[1]; d[i + 2] = f[2]; d[i + 3] = Math.round(f[3] * 255);
    }
    ctx.putImageData(img, 0, 0);
    luz.w = W; luz.h = H; luz.escala = e; luz.img = c;
    return c;
  }
  function desenharLuz() {
    var c = imagemLuz(), e = V.escala || 1;
    V.ctx.imageSmoothingEnabled = false;
    V.ctx.drawImage(c, 0, 0, c.width * e, c.height * e);
  }

  function ordemY(a, b) { return a.y - b.y; }
  // um erro no desenho de uma cena não derruba o quadro (nem a íris); avisa uma vez por parte
  var errosVistos = {};
  function seguro(cena, parte, fn) {
    try { return fn(); } catch (e) {
      var k = cena.id + ':' + parte;
      if (!errosVistos[k]) { errosVistos[k] = true; console.error('Erro ao desenhar ' + k, e); }
    }
  }
  function desenhar(t) {
    if (!est() || !V.ctx) return;
    var t0 = performance.now();
    // Ajustes → Animações e o "reduzir movimento" do aparelho valem para tudo o que se mexe no cenário
    var animar = est().ajustes.animacoes && !U.reduzMovimentoSistema && V.jogoAtivo;
    var cena = Cena.atual();
    atualizarCamera();
    // o cenário é desenhado em pixels do jogo e deslizado com precisão de pixel da tela
    var ox = Math.floor(cam.x), oy = Math.floor(cam.y);
    V.bctx.setTransform(1, 0, 0, 1, -ox, -oy);
    V.bctx.fillStyle = cena.corFundo;
    V.bctx.fillRect(ox, oy, V.buffer.width, V.buffer.height);
    seguro(cena, 'fundo', function () { cena.desenharFundo(V.bctx, t, animar); });
    J.desenharMarcador(V.bctx, t);
    V.ctx.setTransform(1, 0, 0, 1, 0, 0);
    V.ctx.imageSmoothingEnabled = false;
    V.ctx.drawImage(V.buffer, -Math.round((cam.x - ox) * V.escala), -Math.round((cam.y - oy) * V.escala), V.buffer.width * V.escala, V.buffer.height * V.escala);
    seguro(cena, 'tela', function () { cena.desenharTela(V.ctx, pintor, t, animar); });
    // quem está mais embaixo aparece na frente
    var itens = J.itensDesenho(pintor, animar).concat(seguro(cena, 'itens', function () { return cena.itensDesenho(pintor, t, animar); }) || []);
    // camadas dos módulos (js/nucleo/modulos.js; ex.: banho de espuma) entram na mesma ordem por y
    var camadas = Reino.modulos.filter(function (m) { return m.camada && m.camada.ativo(); });
    camadas.forEach(function (m) { itens = itens.concat(seguro(cena, m.id, function () { return m.camada.itensDesenho(pintor, t, animar); }) || []); });
    itens.sort(ordemY).forEach(function (i) { seguro(cena, 'item', function () { i.desenhar(); }); });
    // por cima dos personagens (ex.: placas dos cômodos que descem para desviar do HUD)
    if (cena.desenharSobre) seguro(cena, 'sobre', function () { cena.desenharSobre(V.ctx, pintor, t, animar); });
    camadas.forEach(function (m) { if (m.camada.sobre && m.camada.ativo()) seguro(cena, m.id + '-sobre', function () { m.camada.sobre(V.ctx, pintor, t, animar); }); });
    desenharLuz();
    Cena.desenharIris(V.ctx, pintor, performance.now());
    Cena.quadros.registrar(performance.now() - t0);
  }

  function laco(t) {
    requestAnimationFrame(laco);
    var dt = Math.min(0.05, (t - (V.ultimo || t)) / 1000);
    V.ultimo = t;
    if (!V.jogoAtivo || V.pausado) return;
    // em transição ou com um diálogo aberto ela não anda nem aciona portas
    if (Cena.bloqueado()) {
      if (V.soltarLivre) V.soltarLivre();   // transição ou diálogo: o thumbstick some e o mouse solta
      if (Cena.estado() === Cena.DIALOGO && (J.caminho.length || J.aoChegar)) J.parar();
      J.atualizar(dt, { x: 0, y: 0 }, null);
    }
    else {
      var tx = (V.teclas.dir ? 1 : 0) - (V.teclas.esq ? 1 : 0);
      var ty = (V.teclas.baixo ? 1 : 0) - (V.teclas.cima ? 1 : 0);
      // sem tecla: a direção do mouse segurado ou do thumbstick (entrada.js)
      var dir = !tx && !ty && V.direcaoLivre && V.direcaoLivre();
      J.atualizar(dt, dir ? { x: dir.x, y: dir.y, livre: true } : { x: tx, y: ty }, Cena.acionar);
    }
    desenhar(t);
  }

  U.on(EV.TELAS, function (n) {
    // abriu uma tela (menu, HUD) com o balão modal de um NPC aberto: o balão fecha
    if (n > 0) Cena.fecharDialogoModal();
    V.pausado = n > 0;
    if (n === 0) desenhar(performance.now());
  });

  // menu Lugares: anda até a porta (de dentro de um prédio, sai primeiro)
  U.on(EV.IR_PARA, function (lugar) { Cena.irAoLugar(lugar); });

  V.desenhar = desenhar; V.laco = laco;
})();
