/* Sons suaves feitos na hora (WebAudio) e a voz que lê as perguntas (pt-BR). */
(function () {
  var S = {};
  var ac = null, mestre = null;
  var ajustes = function () { return (Reino.Progresso && Reino.Progresso.estado() && Reino.Progresso.estado().ajustes) || {}; };

  S.ativar = function () {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      mestre = ac.createGain();
      mestre.gain.value = 0.35;
      mestre.connect(ac.destination);
    } catch (e) { ac = null; }
  };

  function nota(freq, inicio, dur, tipo, vol) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || 'triangle';
    o.frequency.value = freq;
    var t0 = ac.currentTime + inicio;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(mestre);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(inicio, dur, vol) {
    if (!ac) return;
    var n = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(mestre);
    src.start(ac.currentTime + inicio);
  }

  var N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, B5: 987.8, C6: 1046.5, E6: 1318.5 };

  var SONS = {
    toque: function () { nota(N.A5, 0, 0.06, 'square', 0.08); },
    selecionar: function () { nota(N.E5, 0, 0.07, 'triangle', 0.2); nota(N.A5, 0.05, 0.08, 'triangle', 0.18); },
    acerto: function () { [N.C5, N.E5, N.G5, N.C6].forEach(function (f, i) { nota(f, i * 0.08, 0.18, 'triangle', 0.28); }); },
    erro: function () { nota(N.E4, 0, 0.22, 'sine', 0.18); nota(N.C4, 0.16, 0.3, 'sine', 0.16); },
    moeda: function () { nota(N.B5, 0, 0.08, 'square', 0.12); nota(N.E6, 0.07, 0.25, 'square', 0.12); },
    estrela: function () { [N.C6, N.G5, N.E6].forEach(function (f, i) { nota(f, i * 0.06, 0.12, 'sine', 0.2); }); },
    rachar: function () { ruido(0, 0.12, 0.35); nota(N.G4, 0, 0.08, 'square', 0.06); },
    chocar: function () { ruido(0, 0.2, 0.3); [N.C5, N.E5, N.G5, N.C6, N.E6].forEach(function (f, i) { nota(f, 0.15 + i * 0.07, 0.25, 'triangle', 0.25); }); },
    fanfarra: function () {
      var m = [[N.C5, 0], [N.E5, 0.14], [N.G5, 0.28], [N.C6, 0.42], [N.G5, 0.62], [N.C6, 0.76]];
      m.forEach(function (x) { nota(x[0], x[1], 0.22, 'triangle', 0.3); });
      nota(N.C4, 0, 0.9, 'sine', 0.15);
    },
    porta: function () { nota(N.G4, 0, 0.1, 'sine', 0.15); nota(N.D5, 0.06, 0.14, 'sine', 0.12); },
    respira: function () { nota(N.C4, 0, 2.6, 'sine', 0.08); nota(N.G4, 0, 2.6, 'sine', 0.05); },
  };

  S.tocar = function (nome) {
    if (ajustes().som === false) return;
    S.ativar();
    if (!ac || !SONS[nome]) return;
    try { SONS[nome](); } catch (e) {}
  };

  /* ---------- musiquinha opcional ---------- */
  var musicaTimer = null, passo = 0;
  var MELODIA = [N.E5, N.G5, N.A5, N.G5, N.E5, N.D5, N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5, 0, N.D5, 0];
  var BAIXO = [130.8, 130.8, 110, 110, 174.6, 174.6, 196, 196];
  S.musica = function (ligar) {
    clearInterval(musicaTimer); musicaTimer = null;
    if (!ligar) return;
    S.ativar();
    if (!ac) return;
    musicaTimer = setInterval(function () {
      if (document.hidden) return;
      var f = MELODIA[passo % MELODIA.length];
      if (f) nota(f, 0, 0.32, 'triangle', 0.07);
      if (passo % 2 === 0) nota(BAIXO[(passo / 2) % BAIXO.length], 0, 0.5, 'sine', 0.06);
      passo++;
    }, 340);
  };

  /* ---------- voz (áudios gravados, ver js/voz.js) ---------- */
  var saidaVoz = null;
  S.contexto = function () { S.ativar(); return ac; };
  S.saidaVoz = function () {
    if (!saidaVoz && ac) { saidaVoz = ac.createGain(); saidaVoz.gain.value = 1; saidaVoz.connect(ac.destination); }
    return saidaVoz;
  };
  // enquanto a voz fala, os sons de efeito ficam mais baixinhos
  S.abaixarEfeitos = function (sim) {
    if (!ac || !mestre) return;
    mestre.gain.setTargetAtTime(sim ? 0.16 : 0.35, ac.currentTime, 0.08);
  };
  S.temVoz = function () { return true; };
  S.falar = function (segmentos, opcoes) { return Reino.Voz ? Reino.Voz.falar(segmentos, opcoes) : Promise.resolve(); };
  S.calar = function () { if (Reino.Voz) Reino.Voz.calar(); };

  Reino.Som = S;
})();
