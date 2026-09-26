/* Transição em íris entre cenas: o círculo que fecha centrado na Mariana, espera a cena nova
   ficar pronta (preparar + pacote de voz, com limite de tempo) e abre de novo; sem animação, só
   escurece e clareia rapidinho. Durante a transição, o HUD não recebe toques.
   Veio de motor/cena.js. Usa Reino._cena (ver cena.js); registra S.transicionar e Cena.desenharIris. */
(function () {
  var U = Reino.util, Cena = Reino.Cena, S = Reino._cena, trocarCena = S.trocarCena;
  var COR_IRIS = '#3a2446';
  var TEMPO = { fechar: 450, fechada: 120, abrir: 450, limite: 4000 };
  var TEMPO_RAPIDO = { fechar: 50, fechada: 50, abrir: 50, limite: 4000 };
  // pacote de voz que já foi pedido numa entrada e ainda não chegou (Wi-Fi fraco): as próximas
  // entradas esperam só LIMITE_VINDO; as falas ganham voz quando ele chegar
  var LIMITE_VINDO = 1500;
  var vindo = {};         // nome do pacote -> true enquanto o carregamento pedido aqui não termina

  function J() { return window.Jogador; }
  function P() { return Reino.Progresso; }

  /* ---------- transição em íris ---------- */
  function semAnimacao() {
    var est = P() && P().estado();
    return (est && est.ajustes && est.ajustes.animacoes === false) || !!U.reduzMovimentoSistema;
  }
  // resolve com 'ok', 'erro' (preparar falhou) ou 'tempo' (passou do limite); nunca rejeita
  function comLimite(fn, ms) {
    return new Promise(function (resolver) {
      var feito = false;
      function fim(r) { if (!feito) { feito = true; resolver(r); } }
      setTimeout(function () { fim('tempo'); }, ms);
      try {
        Promise.resolve(fn()).then(function () { fim('ok'); }, function (e) { console.error(e); fim('erro'); });
      } catch (e) { console.error(e); fim('erro'); }
    });
  }
  function carregarPacote(nome) {
    vindo[nome] = true;
    var p = Promise.resolve(Reino.Voz.carregar(nome));
    p.then(function () { delete vindo[nome]; }, function () { delete vindo[nome]; });
    return p;
  }
  function redesenhar() {
    try { if (S.vista && S.vista.desenhar) S.vista.desenhar(); } catch (e) { console.error(e); }
  }

  // destino: { cena, pacote, depois() } — depois() posiciona a Mariana na cena nova.
  // Aconteça o que acontecer (erro no preparar ou no desenho), a transição sempre termina
  // e o jogo continua: se o destino não ficou pronto por erro, ela fica onde estava.
  function transicionar(destino) {
    if (S.trans) return S.trans.promessa;
    var tempos = semAnimacao() ? TEMPO_RAPIDO : TEMPO;
    var Jg = J();
    Jg.parar();
    if (S.vista && S.vista.soltarTeclas) S.vista.soltarTeclas();
    try { Reino.Som.tocar('porta'); } catch (e) { console.error(e); }
    var t = { fase: 'fechando', inicio: performance.now(), tempos: tempos, circulo: tempos === TEMPO, destino: destino };
    S.trans = t;
    U.emit('transicao', true);   // o botão das fotos (ui.js) se apaga durante a transição
    var pacote = destino.pacote && Reino.Voz && Reino.Voz.carregar ? destino.pacote : null;
    var limite = pacote && vindo[pacote] ? Math.min(LIMITE_VINDO, tempos.limite) : tempos.limite;
    t.promessa = new Promise(function (resolver) {
      var concluida = false;
      function concluir() {
        if (concluida) return;
        concluida = true;
        S.trans = null;
        redesenhar();
        U.emit('transicao', false);
        resolver();
      }
      function abrir(resultado) {
        try {
          if (resultado === 'erro') console.error('Cena: o destino não ficou pronto; ela continua em', Cena.atual().id);
          else {
            trocarCena(destino.cena);
            if (destino.depois) destino.depois();
          }
          Jg.portaIgnorada = null;
        } catch (e) { console.error(e); }
        t.fase = 'abrindo'; t.inicio = performance.now();
        redesenhar();
        setTimeout(concluir, tempos.abrir);
      }
      setTimeout(function () {
        t.fase = 'fechada'; t.inicio = performance.now();
        // a espera mínima conta junto com o preparar (fica fechada pelo maior dos dois, não pela soma)
        var espera = U.esperar(tempos.fechada);
        var pronto = comLimite(function () {
          return Promise.all([
            destino.cena && destino.cena.preparar ? destino.cena.preparar() : null,
            pacote ? carregarPacote(pacote) : null,
          ]);
        }, limite);
        Promise.all([pronto, espera])
          .then(function (r) { abrir(r[0]); })
          .catch(function (e) { console.error(e); abrir('erro'); });
      }, tempos.fechar);
      // rede de segurança: nada segura a íris fechada para sempre
      setTimeout(concluir, tempos.fechar + limite + tempos.fechada + tempos.abrir + 1000);
    });
    return t.promessa;
  }

  // quanto da tela está coberto: 0 = aberta, 1 = fechada
  function fechamento(agora) {
    var t = S.trans, d = agora - t.inicio;
    if (t.fase === 'fechada') return 1;
    if (t.fase === 'fechando') { var p = U.clamp(d / t.tempos.fechar, 0, 1); return p * p; }            // ease-in
    var q = U.clamp(d / t.tempos.abrir, 0, 1);
    return (1 - q) * (1 - q);                                                                            // ease-out
  }
  Cena.desenharIris = function (ctx, pn, agora) {
    if (!S.trans) return;
    var W = ctx.canvas.width, H = ctx.canvas.height;
    var f = fechamento(agora);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COR_IRIS;
    if (!S.trans.circulo) {
      // sem animação: só escurece e clareia rapidinho
      ctx.globalAlpha = f;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }
    if (f >= 1) { ctx.fillRect(0, 0, W, H); ctx.restore(); return; }
    var Jg = J(), c = pn.tela(Jg.x, Jg.y - 10);
    // raio aberto: até o canto mais longe (recalculado a cada quadro; resize não quebra)
    var R = Math.max(Math.hypot(c.x, c.y), Math.hypot(W - c.x, c.y), Math.hypot(c.x, H - c.y), Math.hypot(W - c.x, H - c.y));
    var r = R * (1 - f);
    var passo = Math.max(1, Math.round(pn.escala));
    // borda em degraus: faixas horizontais de `escala` px, larguras em múltiplos de `escala`
    var y0 = c.y - Math.floor(c.y / passo) * passo;
    if (y0 > 0) ctx.fillRect(0, 0, W, y0);
    for (var y = y0; y < H; y += passo) {
      var meioY = y + passo / 2 - c.y;
      if (Math.abs(meioY) >= r) { ctx.fillRect(0, y, W, passo); continue; }
      var meia = Math.round(Math.sqrt(r * r - meioY * meioY) / passo) * passo;
      var esq = Math.round(c.x - meia), dir = Math.round(c.x + meia);
      if (esq > 0) ctx.fillRect(0, y, esq, passo);
      if (dir < W) ctx.fillRect(dir, y, W - dir, passo);
    }
    ctx.restore();
  };

  // durante a transição, toques e cliques no HUD não abrem nada
  function bloquearHud(e) {
    if (!S.trans) return;
    var alvo = e.target;
    if (alvo && alvo.closest && alvo.closest('#hud, #setas')) { e.stopPropagation(); e.preventDefault(); }
  }
  ['click', 'pointerdown', 'pointerup', 'touchstart'].forEach(function (tipo) {
    document.addEventListener(tipo, bloquearHud, { capture: true, passive: false });
  });

  S.transicionar = transicionar;
})();
