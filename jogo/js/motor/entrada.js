/* Motor: controles (teclado, toque no canvas e as setas na tela) e agir no alvo tocado.
   Veio de motor/main.js. Usa Reino._motor (ver motor/camera.js); registra V.ligarControles e
   V.montarSetas (chamados em main.js). */
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
    window.addEventListener('blur', function () { V.teclas = {}; });

    V.canvas.addEventListener('pointerdown', function (e) {
      if (!V.jogoAtivo || Cena.bloqueado()) return;
      // logo depois de fechar uma tela por toque, o dedo que ainda bate no mesmo lugar não mexe
      // no mapa (o 2º toque no "Ir" do Lugares trocava o destino da caminhada)
      if (e.isTrusted && Reino.UI.toqueSegurado && Reino.UI.toqueSegurado(e.clientX, e.clientY)) return;
      Reino.Som.ativar();
      var r = V.canvas.getBoundingClientRect();
      var wx = cam.x + ((e.clientX - r.left) * V.dpr) / V.escala;
      var wy = cam.y + ((e.clientY - r.top) * V.dpr) / V.escala;
      var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
      var cena = Cena.atual();
      // tocou em alguém ou em algo (Claude, prédio, NPC, objeto, tapete, escada)
      var alvo = cena.alvoEm(wx, wy);
      if (alvo) { Cena.irAoAlvo(alvo); return; }
      var destino = cena.solido(tx, ty) ? cena.maisPerto(tx, ty, J.tile()) : { x: tx, y: ty };
      if (destino) J.irPara(destino.x, destino.y);
    });
  }

  function montarSetas() {
    var box = U.$('#setas');
    box.innerHTML = '';
    [['cima', '▲'], ['esq', '◀'], ['dir', '▶'], ['baixo', '▼']].forEach(function (s) {
      var b = el('button.seta.seta-' + s[0], { type: 'button', 'aria-label': 'Andar para ' + s[0] }, PA.iconeEmoji(s[1], 2));
      function on(e) { e.preventDefault(); V.teclas[s[0]] = true; Reino.Som.ativar(); }
      function off() { V.teclas[s[0]] = false; }
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
      box.appendChild(b);
    });
    box.hidden = !est().ajustes.setas;
  }

  V.ligarControles = ligarControles; V.montarSetas = montarSetas;
})();
