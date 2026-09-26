/* Motor: o quadro (desenhar: cenário, personagens por Y, placas, luz e íris) e o laço
   (requestAnimationFrame: anda com as teclas ou pelo caminho). Veio de motor/main.js.
   Usa Reino._motor (ver motor/camera.js); registra V.desenhar e V.laco. */
(function () {
  var U = Reino.util, J = Jogador, Cena = Reino.Cena;
  var EV = Reino.EVENTOS;
  var V = Reino._motor, cam = V.cam, pintor = V.pintor, est = V.est, atualizarCamera = V.atualizarCamera;

  function desenharLuz() {
    var g = V.ctx.createRadialGradient(V.canvas.width / 2, V.canvas.height / 2, 0, V.canvas.width / 2, V.canvas.height / 2, Math.max(V.canvas.width, V.canvas.height) * 0.62);
    g.addColorStop(0, 'rgba(255,236,200,0.08)');
    g.addColorStop(0.42, 'rgba(255,236,200,0)');
    g.addColorStop(0.72, 'rgba(58,36,70,0)');
    g.addColorStop(1, 'rgba(58,36,70,0.16)');
    V.ctx.fillStyle = g;
    V.ctx.fillRect(0, 0, V.canvas.width, V.canvas.height);
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
    // banho de espuma (js/sistemas/banho.js): o unicórnio na banheira, a espuma e as gotas entram na mesma ordem
    var Banho = Reino.Banho;
    if (Banho && Banho.ativo()) itens = itens.concat(seguro(cena, 'banho', function () { return Banho.itensDesenho(pintor, t, animar); }) || []);
    itens.sort(ordemY).forEach(function (i) { seguro(cena, 'item', function () { i.desenhar(); }); });
    // por cima dos personagens (ex.: placas dos cômodos que descem para desviar do HUD)
    if (cena.desenharSobre) seguro(cena, 'sobre', function () { cena.desenharSobre(V.ctx, pintor, t, animar); });
    if (Banho && Banho.ativo()) seguro(cena, 'banho-sobre', function () { Banho.sobre(V.ctx, pintor, t, animar); });
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
      if (Cena.estado() === Cena.DIALOGO && (J.caminho.length || J.aoChegar)) J.parar();
      J.atualizar(dt, { x: 0, y: 0 }, null);
    }
    else {
      var tx = (V.teclas.dir ? 1 : 0) - (V.teclas.esq ? 1 : 0);
      var ty = (V.teclas.baixo ? 1 : 0) - (V.teclas.cima ? 1 : 0);
      J.atualizar(dt, { x: tx, y: ty }, Cena.acionar);
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
