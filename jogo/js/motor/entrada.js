/* Motor: controles (teclado, toque/clique no canvas, mouse segurado, thumbstick do toque) e agir no alvo.
   Usa Reino._motor (ver motor/camera.js); registra V.ligarControles e V.montarControle (main.js)
   e V.direcaoLivre/V.soltarLivre (laco.js). */
(function () {
  var U = Reino.util, el = U.el, J = Jogador, T = Mapa.T, Cena = Reino.Cena;
  var V = Reino._motor, cam = V.cam, est = V.est;

  // alvo tocado ou ao lado: anda até ele (se precisar), vira e age
  function agirNoAlvo(alvo) {
    var tl = J.tile();
    if (alvo.tile.x === tl.x && alvo.tile.y === tl.y) {
      if (alvo.olhar) J.virar(alvo.olhar.x, alvo.olhar.y);
      alvo.agir();
      return;
    }
    Cena.irAoAlvo(alvo);
  }

  /* ---------- controles ---------- */
  var MAPA_TECLAS = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'cima', w: 'cima', W: 'cima', ArrowDown: 'baixo', s: 'baixo', S: 'baixo' };
  function ligarControles() {
    window.addEventListener('keydown', function (e) {
      if (!V.jogoAtivo || Cena.bloqueado()) return;
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      var k = MAPA_TECLAS[e.key];
      if (k) {
        V.teclas[k] = true; e.preventDefault();
        // andando com as setas, o foco sai do botão do HUD (senão o próximo Espaço/Enter o apertaria de novo)
        var foco = document.activeElement;
        if (foco && foco !== document.body && foco.closest && foco.closest('#hud')) foco.blur();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        var alvo = Cena.atual().alvoPerto(J.tile(), { x: J.olharX, y: J.olharY });
        if (alvo) { e.preventDefault(); agirNoAlvo(alvo); }
      }
    });
    window.addEventListener('keyup', function (e) { var k = MAPA_TECLAS[e.key]; if (k) V.teclas[k] = false; });
    window.addEventListener('blur', function () { V.teclas = {}; soltar(); });

    V.canvas.addEventListener('pointerdown', function (e) {
      if (!V.jogoAtivo || Cena.bloqueado()) return;
      // logo depois de fechar uma tela por toque, o dedo que ainda bate no mesmo lugar não mexe
      // no mapa (o 2º toque no "Ir" do Lugares trocava o destino da caminhada)
      if (e.isTrusted && Reino.UI.toqueSegurado && Reino.UI.toqueSegurado(e.clientX, e.clientY)) return;
      Reino.Som.ativar();
      var mouse = e.pointerType === 'mouse';
      // mouse (botão principal) ou dedo na metade esquerda: o toque espera o pointerup (pode virar arrasto)
      var gesto = !g && (mouse ? e.button === 0 : e.clientX < window.innerWidth / 2);
      if (!gesto) return tocarMapa(e.clientX, e.clientY);
      g = { id: e.pointerId, mouse: mouse, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), arrastando: false, parado: false };
      try { V.canvas.setPointerCapture(e.pointerId); } catch (erro) { /* sem captura: segue sem ela */ }
    });
    V.canvas.addEventListener('pointermove', function (e) {
      if (!g || e.pointerId !== g.id) return;
      if (!V.jogoAtivo || V.pausado || Cena.bloqueado()) return soltar();
      g.x = e.clientX; g.y = e.clientY;
      if (!g.arrastando && Math.hypot(g.x - g.x0, g.y - g.y0) > (g.mouse ? LIMIAR_MOUSE : LIMIAR_TOQUE)) comecarArrasto();
      if (g && g.arrastando && !g.mouse) moverPino();
    });
    function fim(e) {
      if (!g || e.pointerId !== g.id) return;
      var tap = e.type === 'pointerup' && !g.arrastando, x = g.x0, y = g.y0;
      soltar();
      if (tap && V.jogoAtivo && !V.pausado && !Cena.bloqueado()) tocarMapa(x, y);
    }
    V.canvas.addEventListener('pointerup', fim);
    V.canvas.addEventListener('pointercancel', fim);
    V.canvas.addEventListener('lostpointercapture', function (e) { if (g && e.pointerId === g.id && g.arrastando) soltar(); });
    U.on(Reino.EVENTOS.TELAS, function (n) { if (n > 0) soltar(); });
  }

  // toque/clique rápido no mapa (como sempre foi): pessoa ou objeto age; chão, anda até lá pelo caminho
  function tocarMapa(cx, cy) {
    var r = V.canvas.getBoundingClientRect();
    var wx = cam.x + ((cx - r.left) * V.dpr) / V.escala;
    var wy = cam.y + ((cy - r.top) * V.dpr) / V.escala;
    var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    var cena = Cena.atual();
    // tocou em alguém ou em algo (Claude, prédio, NPC, objeto, tapete, escada)
    var alvo = cena.alvoEm(wx, wy);
    if (alvo) { Cena.irAoAlvo(alvo); return; }
    var destino = cena.solido(tx, ty) ? cena.maisPerto(tx, ty, J.tile()) : { x: tx, y: ty };
    if (destino) J.irPara(destino.x, destino.y);
  }

  /* ---------- mouse segurado e thumbstick do toque ---------- */
  var LIMIAR_MOUSE = 6, LIMIAR_TOQUE = 12;   // px CSS: até aqui ainda é toque/clique rápido
  var SEGURAR_MS = 300;                      // mouse parado segurando isso já segue o ponteiro
  var ZONA_MORTA = 10;                       // px CSS do thumbstick sem andar
  var PARA_PERTO = 6, VOLTA_LONGE = 12;      // px do jogo: mouse perto dela para (e só volta mais longe)
  var g = null;                              // o gesto: um ponteiro por vez (pointerId)
  var caixa = null, base = null, pino = null;

  function comecarArrasto() {
    g.arrastando = true;
    J.parar();
    if (g.mouse) return;
    base.style.left = g.x0 + 'px'; base.style.top = g.y0 + 'px';
    caixa.hidden = false;
  }
  function moverPino() {
    var dx = g.x - g.x0, dy = g.y - g.y0, d = Math.hypot(dx, dy);
    var raio = (base.offsetWidth - pino.offsetWidth) / 2 || 31;
    if (d > raio) { dx *= raio / d; dy *= raio / d; }
    pino.style.transform = 'translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)';
  }
  function soltar() {
    if (g) { try { V.canvas.releasePointerCapture(g.id); } catch (e) { /* já solto */ } }
    g = null;
    if (caixa) { caixa.hidden = true; pino.style.transform = ''; }
  }
  // direção livre (vetor unitário) a cada quadro, ou null (laco.js)
  function direcaoLivre() {
    if (!g) return null;
    if (!g.arrastando) {
      if (!g.mouse || performance.now() - g.t0 < SEGURAR_MS) return null;
      comecarArrasto();
    }
    var dx, dy, d;
    if (g.mouse) {
      var r = V.canvas.getBoundingClientRect();
      dx = cam.x + ((g.x - r.left) * V.dpr) / V.escala - J.x;
      dy = cam.y + ((g.y - r.top) * V.dpr) / V.escala - (J.y - 8);
      d = Math.hypot(dx, dy);
      // perto do ponteiro ela para (não treme em volta dele)
      if (g.parado ? d < VOLTA_LONGE : d < PARA_PERTO) { g.parado = true; return null; }
      g.parado = false;
    } else {
      dx = g.x - g.x0; dy = g.y - g.y0; d = Math.hypot(dx, dy);
      if (d < ZONA_MORTA) return null;
    }
    return { x: dx / d, y: dy / d };
  }

  function montarControle() {
    caixa = U.$('#controle');
    caixa.innerHTML = '';
    pino = el('div.controle-pino');
    base = el('div.controle-base', pino);
    caixa.appendChild(base);
    caixa.hidden = true;
  }

  V.ligarControles = ligarControles; V.montarControle = montarControle;
  V.direcaoLivre = direcaoLivre; V.soltarLivre = soltar;
})();
