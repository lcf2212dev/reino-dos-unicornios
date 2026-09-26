/* Sons suaves feitos na hora (WebAudio), a música por ambiente (o motor; as composições estão em
   js/musicas.js) e a saída da voz que lê as perguntas (pt-BR). */
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

  // nota que escorrega de uma frequência para outra (gotinha, gole)
  function deslize(f0, f1, inicio, dur, tipo, vol) {
    if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || 'sine';
    var t0 = ac.currentTime + inicio;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(mestre);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // chiado macio com filtro que desliza (água mexendo, mordidinha)
  function chiado(inicio, dur, vol, tipoFiltro, f0, f1) {
    if (!ac) return;
    var n = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) { var r = 1 - i / n; d[i] = (Math.random() * 2 - 1) * r * r; }
    var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    var t0 = ac.currentTime + inicio;
    src.buffer = buf; f.type = tipoFiltro || 'lowpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(f1 || f0, t0 + dur);
    g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(mestre);
    src.start(t0);
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
    // entrou na água: um "tchibum" abafado e duas bolhinhas
    splash: function () {
      chiado(0, 0.38, 0.26, 'lowpass', 2600, 380);
      deslize(700, 240, 0, 0.14, 'sine', 0.1);
      deslize(520, 980, 0.16, 0.07, 'sine', 0.06);
      deslize(640, 1200, 0.24, 0.06, 'sine', 0.05);
    },
    // saiu da água: gotinhas pingando
    gotas: function () {
      [[0, 1100], [0.13, 1500], [0.3, 1250], [0.46, 1700]].forEach(function (g, i) {
        deslize(g[1], g[1] * 1.9, g[0], 0.06, 'sine', 0.07 - i * 0.01);
      });
    },
    // bebeu água: dois golinhos
    gole: function () {
      [0, 0.24].forEach(function (t, i) {
        deslize(340 - i * 30, 170, t, 0.15, 'sine', 0.16);
        chiado(t, 0.1, 0.06, 'lowpass', 700, 300);
      });
    },
    // comeu: nhac! (mordidinha crocante e um "hum")
    nhac: function () {
      chiado(0, 0.07, 0.22, 'bandpass', 2600, 1400);
      chiado(0.1, 0.06, 0.16, 'bandpass', 2300, 1300);
      nota(N.E5, 0.18, 0.12, 'triangle', 0.1);
      nota(N.G5, 0.26, 0.14, 'triangle', 0.08);
    },
    /* ---- banho de espuma (js/banho.js) ---- */
    // bolhinhas subindo e estourando: plic-plic-ploc
    bolhas: function () {
      [[0, 520], [0.09, 760], [0.17, 610], [0.27, 900], [0.36, 700]].forEach(function (b, i) {
        deslize(b[1], b[1] * 1.8, b[0], 0.06, 'sine', 0.06 - i * 0.006);
      });
      chiado(0.4, 0.05, 0.05, 'bandpass', 2400, 1800);
    },
    // escovinha indo e voltando: shh-shh macio
    esfregar: function () {
      chiado(0, 0.17, 0.12, 'bandpass', 1700, 3000);
      chiado(0.21, 0.17, 0.12, 'bandpass', 3000, 1700);
    },
    // chuveirinho: um "shhhh" de água e gotinhas no fim
    chuveiro: function () {
      chiado(0, 0.9, 0.09, 'bandpass', 4200, 3000);
      chiado(0.12, 0.75, 0.06, 'lowpass', 2600, 1400);
      [[0.55, 1300], [0.7, 1650]].forEach(function (g) { deslize(g[1], g[1] * 1.7, g[0], 0.05, 'sine', 0.05); });
    },
    // sacudida do unicórnio: brrrr e gotas voando
    sacudida: function () {
      for (var i = 0; i < 5; i++) chiado(i * 0.065, 0.055, 0.11 - i * 0.012, 'bandpass', 1500 - i * 110, 900);
      [[0.36, 1200], [0.44, 1550], [0.52, 1350]].forEach(function (g) { deslize(g[1], g[1] * 1.8, g[0], 0.05, 'sine', 0.05); });
    },
    /* ---- foto (js/fotos.js) ---- */
    // obturador: tchic-clic curtinho e um brilhinho
    clique: function () {
      chiado(0, 0.035, 0.2, 'highpass', 3200, 2400);
      chiado(0.07, 0.045, 0.15, 'bandpass', 2300, 1500);
      nota(N.E6, 0.13, 0.12, 'sine', 0.05);
    },
  };

  S.tocar = function (nome) {
    if (ajustes().som === false) return;
    S.ativar();
    if (!ac || !SONS[nome]) return;
    try { SONS[nome](); } catch (e) {}
  };

  /* ---------- música por ambiente ----------
     As composições (dados) estão em js/musicas.js; aqui ficam os instrumentos e o motor.
     Motor: um timer só acorda o agendador a cada config.musica.intervaloMs, e ele agenda pelo relógio do
     AudioContext as notas dos próximos lookaheadS segundos (nenhuma nota depende do timer).
     Cadeia: nota → entrada da faixa (→ eco) → ganho da faixa (crossfade) → ganho da música (volume, voz,
     aba escondida, liga/desliga) → compressor leve → alto-falante. Os efeitos (`mestre`) ficam de fora:
     "Som" desligado não cala a música, e a musiquinha desligada não cala os efeitos. */
  var cfgMusica = function () { return (Reino.config && Reino.config.musica) || {}; };

  // coisas de cada contexto (o do jogo e os OfflineAudioContext de renderizarFaixa): ruído e vibrato
  function extras(c) {
    var n = c.sampleRate, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    var x = 12345;
    for (var i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; d[i] = x / 0x3fffffff - 1; }
    var lfo = c.createOscillator(), prof = c.createGain();
    lfo.frequency.value = 5.2; prof.gain.value = 7;          // vibrato de ±7 cents
    lfo.connect(prof); lfo.start(0);
    return { ruido: buf, vibrato: prof };
  }

  /* ---- pedacinhos dos instrumentos ---- */
  function osc(c, tipo, f, t0, fim, destino, cents) {
    var o = c.createOscillator();
    o.type = tipo; o.frequency.value = f;
    if (cents) o.detune.value = cents;
    o.connect(destino); o.start(t0); o.stop(fim);
    return o;
  }
  function ganho(c, v, destino) { var g = c.createGain(); g.gain.value = v; g.connect(destino); return g; }
  function filtro(c, tipo, f, q, destino) {
    var b = c.createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q; b.connect(destino); return b;
  }
  // envelope de nota tocada/percutida: sobe em `ataque` e decai sozinha (tau); solta mais rápido em `tSolta`
  function envPercutido(g, t0, pico, ataque, tau, tSolta, tauSolta) {
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(pico, t0 + ataque);
    g.gain.setTargetAtTime(0, t0 + ataque, tau);
    if (tSolta && tSolta > t0 + ataque) g.gain.setTargetAtTime(0, tSolta, tauSolta);
  }
  // envelope de nota sustentada (sopro, cordas, pad): sobe, segura (caindo um pouquinho) e solta no fim
  function envSustentado(g, t0, pico, ataque, tFim, tauSolta, queda) {
    var tA = t0 + Math.min(ataque, Math.max(0.005, tFim - t0));
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(pico, tA);
    g.gain.setTargetAtTime(pico * (queda || 0.8), tA, 0.9);
    g.gain.setTargetAtTime(0, Math.max(tFim, tA), tauSolta);
    return Math.max(tFim, tA) + tauSolta * 7;
  }
  // parciais senoidais que decaem cada uma no seu tempo (sinos, caixinha, xilofone): [[mult, amp, tau], ...]
  function parciais(c, s, t0, f, vol, lista, ataque) {
    lista.forEach(function (p) {
      var fp = f * p[0];
      if (fp > 11000) return;
      var g = ganho(c, 0, s);
      envPercutido(g, t0, vol * p[1], ataque || 0.003, p[2]);
      osc(c, 'sine', fp, t0, t0 + ataque + p[2] * 7 + 0.02, g);
    });
  }
  // corda dedilhada (violão, ukulele, alaúde, baixo): filtro que fecha e som que decai
  function dedilhar(c, s, t0, dur, f, vol, o) {
    var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', o.brilho, 0.7, g);
    lp.frequency.setValueAtTime(o.brilho, t0);
    lp.frequency.setTargetAtTime(o.fundo, t0, o.tauFiltro);
    envPercutido(g, t0, vol, o.ataque || 0.004, o.tau, t0 + dur, 0.07);
    var fim = Math.min(t0 + dur + 0.5, t0 + o.tau * 7) + 0.02;
    osc(c, 'triangle', f, t0, fim, lp);
    if (o.serra) osc(c, 'sawtooth', f, t0, fim, ganho(c, o.serra, lp));
  }
  // ruído filtrado (percussão leve)
  function batida(c, s, t0, vol, ex, tipo, f, q, ataque, tau) {
    var src = c.createBufferSource(), g = ganho(c, 0, s), b = filtro(c, tipo, f, q, g);
    src.buffer = ex.ruido; src.connect(b);
    envPercutido(g, t0, vol, ataque, tau);
    src.start(t0, (f * 0.000731) % 0.5);
    src.stop(t0 + ataque + tau * 7 + 0.02);
  }
  function tom(c, s, t0, vol, f0, f1, tau) {
    var g = ganho(c, 0, s), o = c.createOscillator();
    o.type = 'sine'; o.connect(g);
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + tau * 2);
    envPercutido(g, t0, vol, 0.003, tau);
    o.start(t0); o.stop(t0 + tau * 7 + 0.02);
  }

  /* ---- os instrumentos (nome = `onda` das notas de js/musicas.js) ----
     (c, saída, início, duração, frequência, volume, extras) */
  var TIMBRES = {
    flauta: function (c, s, t0, d, f, v, ex) {
      var g = ganho(c, 0, s), fim = envSustentado(g, t0, v * 0.7, 0.05, t0 + d * 0.92, 0.07, 0.85);
      [osc(c, 'sine', f, t0, fim, g), osc(c, 'triangle', f, t0, fim, ganho(c, 0.22, g))]
        .forEach(function (o) { ex.vibrato.connect(o.detune); });
    },
    sanfona: function (c, s, t0, d, f, v, ex) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 1500, 0.4, g);
      var fim = envSustentado(g, t0, v * 0.2, 0.045, t0 + d * 0.9, 0.06, 0.85);
      [osc(c, 'square', f, t0, fim, lp, -6), osc(c, 'square', f, t0, fim, lp, 6)]
        .forEach(function (o) { ex.vibrato.connect(o.detune); });
    },
    trompa: function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 500, 0.5, g);
      lp.frequency.setValueAtTime(500, t0);
      lp.frequency.linearRampToValueAtTime(1300, t0 + 0.1);
      lp.frequency.setTargetAtTime(850, t0 + 0.1, 0.2);
      var fim = envSustentado(g, t0, v * 0.36, 0.07, t0 + d * 0.9, 0.09, 0.8);
      osc(c, 'sawtooth', f, t0, fim, lp);
      osc(c, 'sine', f, t0, fim, ganho(c, 0.8, g));
    },
    cordas: function (c, s, t0, d, f, v, ex) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 1300, 0.5, g);
      var fim = envSustentado(g, t0, v * 0.3, 0.22, t0 + d, 0.2, 0.9);
      [osc(c, 'sawtooth', f, t0, fim, lp, -6), osc(c, 'sawtooth', f, t0, fim, lp, 6)]
        .forEach(function (o) { ex.vibrato.connect(o.detune); });
    },
    'cordas-baixo': function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 520, 0.5, g);
      var fim = envSustentado(g, t0, v * 0.55, 0.08, t0 + d * 0.95, 0.15, 0.75);
      osc(c, 'sawtooth', f, t0, fim, ganho(c, 0.6, lp));
      osc(c, 'sine', f, t0, fim, lp);
    },
    pad: function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 950, 0.5, g);
      var fim = envSustentado(g, t0, v * 0.32, 0.7, t0 + d, 0.5, 0.9);
      osc(c, 'sawtooth', f, t0, fim, lp, -8);
      osc(c, 'sawtooth', f, t0, fim, lp, 8);
      osc(c, 'sine', f / 2, t0, fim, ganho(c, 0.8, g));
    },
    'pad-frio': function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 2200, 0.5, g);
      var fim = envSustentado(g, t0, v * 0.5, 0.4, t0 + d, 0.4, 0.85);
      osc(c, 'triangle', f, t0, fim, lp, -9);
      osc(c, 'triangle', f, t0, fim, lp, 9);
    },
    'pad-baixo': function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), fim = envSustentado(g, t0, v * 0.8, 0.4, t0 + d, 0.6, 0.85);
      osc(c, 'sine', f, t0, fim, g);
      osc(c, 'triangle', f, t0, fim, ganho(c, 0.25, g));
    },
    'baixo-macio': function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s), lp = filtro(c, 'lowpass', 700, 0.5, g);
      var fim = envSustentado(g, t0, v * 0.9, 0.012, t0 + d * 0.95, 0.06, 0.6);
      osc(c, 'sine', f, t0, fim, lp);
      osc(c, 'triangle', f, t0, fim, ganho(c, 0.3, lp));
    },
    'baixo-pluck': function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v * 1.1, { brilho: 1100, fundo: 350, tauFiltro: 0.12, tau: 0.35, ataque: 0.005 });
    },
    violao: function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v * 0.8, { brilho: 2600, fundo: 700, tauFiltro: 0.15, tau: 0.5, serra: 0.22 });
    },
    ukulele: function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v * 0.8, { brilho: 3200, fundo: 1100, tauFiltro: 0.1, tau: 0.28, serra: 0.18 });
    },
    alaude: function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v * 0.85, { brilho: 1800, fundo: 550, tauFiltro: 0.2, tau: 0.55, serra: 0.12 });
    },
    pizz: function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v, { brilho: 1700, fundo: 600, tauFiltro: 0.06, tau: 0.11, ataque: 0.003 });
    },
    harpa: function (c, s, t0, d, f, v) {
      dedilhar(c, s, t0, d, f, v * 0.9, { brilho: 2800, fundo: 1200, tauFiltro: 0.4, tau: 0.65, ataque: 0.006 });
      parciais(c, s, t0, f, v, [[2, 0.12, 0.25]], 0.006);
    },
    'harpa-agua': function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.9, 0.8], [2, 0.12, 0.3], [3, 0.04, 0.12]], 0.01); },
    'piano-suave': function (c, s, t0, d, f, v) {
      var g = ganho(c, 0, s);
      envPercutido(g, t0, 1, 0.006, 0.9, t0 + d, 0.15);
      var fim = Math.min(t0 + d + 1.05, t0 + 6.4);
      osc(c, 'sine', f, t0, fim, ganho(c, v * 0.85, g));
      osc(c, 'sine', f * 2, t0, fim, ganho(c, v * 0.14, g));
      parciais(c, s, t0, f, v, [[3, 0.05, 0.15]], 0.006);
    },
    caixinha: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.8, 0.6], [2, 0.22, 0.28], [3, 0.08, 0.12]], 0.003); },
    'caixinha-grave': function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 1, 0.5], [2, 0.2, 0.2]], 0.004); },
    sino: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.6, 0.9], [2, 0.22, 0.55], [2.76, 0.16, 0.32], [5.4, 0.05, 0.12]], 0.004); },
    xilofone: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.9, 0.22], [4, 0.14, 0.05]], 0.002); },
    marimba: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.9, 0.3], [4, 0.1, 0.04]], 0.003); },
    sininhos: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.7, 0.45], [3, 0.1, 0.12], [4.2, 0.04, 0.06]], 0.003); },
    celesta: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.7, 0.55], [2, 0.14, 0.25], [4, 0.04, 0.08]], 0.003); },
    brilho: function (c, s, t0, d, f, v) { parciais(c, s, t0, f, v, [[1, 0.6, 0.9], [2, 0.14, 0.35], [3.01, 0.05, 0.15]], 0.006); },
  };
  /* percussão leve, feita com ruído (`onda` das notas da parte 'percussao'; f = frequência central do filtro) */
  var PERCUSSAO = {
    chocalho: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 0.9, ex, 'bandpass', f, 1.2, 0.006, 0.028); },
    chimbal: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 0.5, ex, 'highpass', f, 0.7, 0.002, 0.02); },
    aro: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 1.2, ex, 'bandpass', f, 3, 0.002, 0.025); },
    tique: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 1.8, ex, 'bandpass', f, 7, 0.001, 0.014); },
    taque: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 1.8, ex, 'bandpass', f, 7, 0.001, 0.016); },
    casco: function (c, s, t0, d, f, v, ex) {
      batida(c, s, t0, v * 1.3, ex, 'bandpass', f, 4, 0.002, 0.03);
      tom(c, s, t0, v * 0.35, f * 0.5, f * 0.42, 0.03);
    },
    tambor: function (c, s, t0, d, f, v, ex) {
      batida(c, s, t0, v * 0.8, ex, 'lowpass', f * 2.2, 1, 0.004, 0.09);
      tom(c, s, t0, v * 0.7, f * 0.65, f * 0.45, 0.11);
    },
    bumbo: function (c, s, t0, d, f, v, ex) {
      batida(c, s, t0, v * 0.5, ex, 'lowpass', f * 2, 1, 0.003, 0.05);
      tom(c, s, t0, v, f * 1.3, f * 0.55, 0.1);
    },
    // poeira de estrela: ruído bem agudo que cresce e some devagar
    brilho: function (c, s, t0, d, f, v, ex) { batida(c, s, t0, v * 0.6, ex, 'highpass', f, 0.7, 0.12, 0.28); },
  };

  function tocarEvento(c, entrada, e, t0, ex) {
    var fn = (e.parte === 'percussao' ? PERCUSSAO : TIMBRES)[e.onda];
    try {
      if (fn) fn(c, entrada, t0, e.dur, e.freq, e.vol, ex);
      else { var g = ganho(c, 0, entrada); envPercutido(g, t0, e.vol * 0.5, 0.01, 0.3, t0 + e.dur, 0.08); osc(c, /^(sine|triangle|square|sawtooth)$/.test(e.onda) ? e.onda : 'triangle', e.freq, t0, t0 + e.dur + 0.6, g); }
    } catch (err) {}
  }

  // saída de uma faixa: entrada (→ eco) → ganho da faixa (crossfade) → destino
  function montarFaixa(c, destino, fx) {
    var bus = c.createGain(), entrada = c.createGain(), nos = [entrada, bus];
    bus.gain.value = 0;
    entrada.connect(bus);
    if (fx.eco) {
      var atraso = c.createDelay(2), volta = c.createGain(), lp = filtro(c, 'lowpass', 2600, 0.5, volta), molhado = c.createGain();
      atraso.delayTime.value = Math.min(1.9, (fx.eco.tempo || 0.5) * 60 / fx.bpm);
      volta.gain.value = Math.min(0.6, fx.eco.retorno || 0.3);
      molhado.gain.value = fx.eco.mistura || 0.3;
      entrada.connect(atraso); atraso.connect(lp); volta.connect(atraso);
      lp.connect(molhado); molhado.connect(bus);
      nos.push(atraso, volta, lp, molhado);
    }
    bus.connect(destino);
    return { entrada: entrada, bus: bus, nos: nos };
  }
  // ganho geral da música e compressor leve (um por contexto)
  function montarSaida(c) {
    var saida = c.createGain(), comp = c.createDynamicsCompressor();
    saida.gain.value = 0;
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 3;
    comp.attack.value = 0.012; comp.release.value = 0.25;
    saida.connect(comp); comp.connect(c.destination);
    return { saida: saida, comp: comp, ex: extras(c) };
  }

  // ganho de cada faixa: o `volume` dela (acerta o volume entre as faixas) vezes um nível interno, para a
  // mistura ficar bem abaixo da voz e perto dos efeitos com config.musica.volume
  var NIVEL_FAIXA = 0.35;
  function ganhoFaixa(fx) { return (fx.volume == null ? 1 : fx.volume) * NIVEL_FAIXA; }

  var cacheEventos = {};
  function eventosDe(id) {
    if (!cacheEventos[id]) cacheEventos[id] = { ev: Reino.Musicas.expandir(id), dur: Reino.Musicas.duracao(id) };
    return cacheEventos[id];
  }

  /* ---- ambiente (decidido lendo a cena, o nado e a tela do topo) ---- */
  var COM_MUSICA = ['museu', 'castelo', 'escola', 'estabulo', 'loja', 'bau', 'petshop', 'observatorio'];
  var comodoGuardado = { cena: null, comodo: null };
  function comodoAtual(cena) {
    try {
      var g = cena.grade, t = window.Jogador && Jogador.tile ? Jogador.tile() : null;
      var c = g && g.comodo && t && g.comodo[t.y] ? g.comodo[t.y][t.x] : null;
      // no corredor (tile sem cômodo), vale o último cômodo desta mesma cena
      if (comodoGuardado.cena !== cena.id) comodoGuardado = { cena: cena.id, comodo: null };
      if (c) comodoGuardado.comodo = c;
      return comodoGuardado.comodo;
    } catch (e) { return null; }
  }
  function ambienteAgora() {
    var telas = document.getElementById('telas');
    if (telas) {
      if (telas.querySelector('.tela-prova')) return 'silencio';      // treino da medalha e prova: concentração
      if (telas.querySelector('.tela-missao')) return 'sala';
    }
    var C = Reino.Cena, cena = C && C.atual ? C.atual() : null;
    if (!cena || cena.tipo !== 'interior') {
      var nadando = false;
      try { nadando = !!(window.Jogador && Jogador.nadando && Jogador.nadando()); } catch (e) {}
      return nadando ? 'lago' : 'mapa';
    }
    var id = String(cena.id || '');
    if (id.indexOf('torre') === 0) return 'torre';
    if (id === 'portugues') return comodoAtual(cena) === 'porto' ? 'portugues-gelo' : 'portugues';
    if (COM_MUSICA.indexOf(id) >= 0) return id;
    return 'mapa';                                                      // interior sem música própria
  }
  function faixaDoAmbiente(amb) {
    if (amb === 'silencio' || !Reino.Musicas) return null;
    return Reino.Musicas.faixas[amb] ? amb : (Reino.Musicas.faixas.mapa ? 'mapa' : null);
  }

  /* ---- o motor ---- */
  var MUS = {
    ligada: false, ambiente: null, faixa: null, abafada: false, pausada: false,
    tocadores: [], timer: null, saida: null, pendente: null, pendenteDesde: 0, posicoes: {}, ouvindo: false,
    puladas: 0,   // notas que chegaram atrasadas e não tocaram (para os testes de CPU)
  };
  function alvoMusica() {
    if (!MUS.ligada || MUS.pausada) return 0;
    var cf = cfgMusica(), v = cf.volume == null ? 0.22 : cf.volume;
    return v * (MUS.abafada ? (cf.comVoz == null ? 0.3 : cf.comVoz) : 1);
  }
  // rampa linear a partir do valor de agora (sem estalo, mesmo no meio de outra rampa). Não usa
  // cancelAndHoldAtTime: no Chromium ele segura um valor errado quando a rampa anterior já terminou (a faixa
  // que sai caía 8–17 dB de uma vez, e a volta da voz pulava de 30% para ~90%). Lê o valor de agora
  // (param.value é o valor calculado no último bloco de áudio) e recomeça dali.
  // `exp`: rampa exponencial (o mesmo tanto de dB a cada instante), para as mudanças de volume que não vão
  // a zero (a voz): sem degrau nem aceleração perto do fim
  function rampa(param, alvo, s, exp) {
    var t = ac.currentTime, v = param.value, fim = t + Math.max(0.02, s);
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
    if (exp && v > 1e-4 && alvo > 1e-4) param.exponentialRampToValueAtTime(alvo, fim);
    else param.linearRampToValueAtTime(alvo, fim);
  }
  function aplicarVolume(s, exp) { if (ac && MUS.saida) rampa(MUS.saida.saida.gain, alvoMusica(), s, exp); }
  // voz: desce em 0,6 s e volta em 0,8 s, em dB constantes (menos de 1 dB a cada 50 ms)
  function abafarMusica(sim) {
    if (MUS.abafada === sim) return;
    MUS.abafada = sim;
    aplicarVolume(sim ? 0.6 : 0.8, true);
  }

  function posicaoDe(tc) { return (((ac.currentTime - tc.inicio) % tc.dur) + tc.dur) % tc.dur; }
  function indiceEm(ev, pos) {
    for (var i = 0; i < ev.length; i++) if (ev[i].t >= pos - 1e-6) return i;
    return ev.length;
  }
  function ancorar(tc, pos, t) {
    tc.idx = indiceEm(tc.ev, pos);
    tc.inicio = t - pos;
    if (tc.idx >= tc.ev.length) { tc.idx = 0; tc.inicio += tc.dur; }
  }
  function novoTocador(id, pos, fadeS) {
    var d = eventosDe(id), fx = Reino.Musicas.faixas[id];
    var tc = { id: id, fx: fx, ev: d.ev, dur: d.dur, b: montarFaixa(ac, MUS.saida.saida, fx), idx: 0, inicio: 0, fimEm: null };
    ancorar(tc, pos || 0, ac.currentTime + 0.05);
    var g = tc.b.bus.gain, t = ac.currentTime;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(ganhoFaixa(fx), t + Math.max(0.02, fadeS));
    MUS.tocadores.push(tc);
    agendarTocador(tc);
    return tc;
  }
  function pararTocador(tc, fadeS) {
    if (tc.fimEm !== null) return;
    MUS.posicoes[tc.id] = posicaoDe(tc);
    rampa(tc.b.bus.gain, 0, fadeS);
    tc.fimEm = ac.currentTime + fadeS;
  }
  function tocadorAtivo() {
    for (var i = MUS.tocadores.length - 1; i >= 0; i--) if (MUS.tocadores[i].fimEm === null) return MUS.tocadores[i];
    return null;
  }
  // volta na mesma faixa: continua de onde parou, no começo do compasso seguinte
  function posicaoGuardada(id) {
    var p = MUS.posicoes[id], fx = Reino.Musicas.faixas[id];
    if (!p || !fx) return 0;
    var comp = (fx.compasso || 4) * 60 / fx.bpm, d = eventosDe(id).dur;
    return (Math.ceil(p / comp - 1e-6) * comp) % d;
  }

  // agenda as notas da faixa até agora + lookahead (poucas por vez)
  function agendarTocador(tc) {
    var agora = ac.currentTime, limite = agora + (cfgMusica().lookaheadS || 0.25);
    if (tc.fimEm !== null) limite = Math.min(limite, tc.fimEm);
    if (!tc.ev.length) return;
    // atrasou muito (aba travada, CPU ocupada): continua da posição de agora, sem despejar notas velhas
    if (tc.inicio + tc.ev[tc.idx].t < agora - 0.5) { ancorar(tc, posicaoDe(tc), agora); MUS.puladas++; }
    for (var n = 0; n < 96; n++) {
      var e = tc.ev[tc.idx], t = tc.inicio + e.t;
      if (t >= limite) break;
      if (t >= agora - 0.03) tocarEvento(ac, tc.b.entrada, e, Math.max(t, agora), MUS.saida.ex);
      else MUS.puladas++;
      tc.idx++;
      if (tc.idx >= tc.ev.length) { tc.idx = 0; tc.inicio += tc.dur; }
    }
  }

  function trocarPara(amb) {
    MUS.ambiente = amb;
    var faixa = faixaDoAmbiente(amb), atual = tocadorAtivo();
    MUS.faixa = faixa;
    if (!ac || !MUS.saida || MUS.pausada || !MUS.ligada) return;
    if (atual && atual.id === faixa) return;
    var x = cfgMusica().crossfadeS || 1.5;
    MUS.tocadores.forEach(function (tc) { pararTocador(tc, x); });
    if (faixa) novoTocador(faixa, posicaoGuardada(faixa), x);
  }
  // decide o ambiente; mudanças que vêm do chão (nadar, trocar de cômodo) esperam 250 ms firmes
  function decidir(imediato) {
    if (!MUS.ligada) return;
    var amb = ambienteAgora(), agora = Date.now();
    if (amb !== MUS.pendente) { MUS.pendente = amb; MUS.pendenteDesde = agora; }
    if (amb === MUS.ambiente) return;
    if (imediato || MUS.ambiente === null || agora - MUS.pendenteDesde >= 250) trocarPara(amb);
  }

  function tique() {
    if (!ac || !MUS.saida) { clearInterval(MUS.timer); MUS.timer = null; return; }
    decidir(false);
    var agora = ac.currentTime;
    MUS.tocadores = MUS.tocadores.filter(function (tc) {
      if (tc.fimEm !== null && agora > tc.fimEm + 0.1) {
        // desliga tudo (inclusive o laço do eco, para ele não ficar vivo)
        tc.b.nos.forEach(function (n) { try { n.disconnect(); } catch (e) {} });
        return false;
      }
      return true;
    });
    // musiquinha desligada e nada mais soando: o timer para
    if (!MUS.ligada && !MUS.tocadores.length) { clearInterval(MUS.timer); MUS.timer = null; return; }
    if (MUS.pausada) return;
    MUS.tocadores.forEach(agendarTocador);
  }

  function aoMudarVisibilidade() {
    var escondida = !!document.hidden;
    if (escondida === MUS.pausada) return;
    MUS.pausada = escondida;
    if (!ac || !MUS.saida || !MUS.ligada) return;
    if (escondida) {
      MUS.tocadores.forEach(function (tc) { pararTocador(tc, 0.3); });
      aplicarVolume(0.3);
    } else {
      aplicarVolume(0.8);
      decidir(true);
      var faixa = faixaDoAmbiente(MUS.ambiente);
      MUS.faixa = faixa;
      if (faixa && !tocadorAtivo()) novoTocador(faixa, posicaoGuardada(faixa), 0.8);
    }
  }

  function ouvir() {
    if (MUS.ouvindo) return;
    MUS.ouvindo = true;
    var U = Reino.util;
    if (U && U.on) ['cena', 'telas', 'ocupada'].forEach(function (ev) { U.on(ev, function () { decidir(true); }); });
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
  }

  // "🎵 Musiquinha" (Ajustes): liga e desliga tudo
  S.musica = function (ligar) {
    ligar = !!ligar;
    if (!ligar) {
      if (!MUS.ligada) return;
      MUS.ligada = false;
      if (ac && MUS.saida) { MUS.tocadores.forEach(function (tc) { pararTocador(tc, 0.6); }); aplicarVolume(0.5); }
      return;
    }
    S.ativar();
    if (!ac || !Reino.Musicas) return;
    if (!MUS.saida) MUS.saida = montarSaida(ac);
    ouvir();
    MUS.ligada = true;
    MUS.pausada = !!document.hidden;
    MUS.ambiente = null; MUS.pendente = null;
    aplicarVolume(1);
    decidir(true);
    if (!MUS.timer) MUS.timer = setInterval(tique, cfgMusica().intervaloMs || 60);
  };

  S.musicaAtual = function () {
    var tc = ac ? tocadorAtivo() : null;
    return {
      ligada: MUS.ligada,
      ambiente: MUS.ligada ? MUS.ambiente : ambienteAgora(),
      faixa: MUS.ligada ? MUS.faixa : null,
      tocando: !!(MUS.ligada && !MUS.pausada && tc && ac.state === 'running'),
      volume: alvoMusica(),
      abafada: MUS.abafada,
      pausada: MUS.pausada,
      // para os testes: o ganho de agora e as faixas soando (a que entra e as que saem no crossfade)
      ganho: MUS.saida ? MUS.saida.saida.gain.value : 0,
      contexto: ac ? ac.state : null,
      puladas: MUS.puladas,
      faixas: MUS.tocadores.map(function (t) { return { id: t.id, ganho: t.b.bus.gain.value, saindo: t.fimEm !== null }; }),
    };
  };

  /* Renderiza uma faixa com os MESMOS instrumentos e a mesma cadeia (eco, ganho, compressor), fora do tempo
     real (OfflineAudioContext). opcoes: { volume (padrão config.musica.volume), taxa (44100) }.
     → Promise<AudioBuffer> mono. Serve para as ferramentas medirem pico e emenda. */
  S.renderizarFaixa = function (id, segundos, opcoes) {
    opcoes = opcoes || {};
    var fx = Reino.Musicas && Reino.Musicas.faixas[id];
    if (!fx) return Promise.reject(new Error('faixa inexistente: ' + id));
    var d = eventosDe(id), taxa = opcoes.taxa || 44100;
    segundos = segundos || d.dur;
    var Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var c = new Off(1, Math.ceil(segundos * taxa), taxa);
    var sai = montarSaida(c);
    sai.saida.gain.value = opcoes.volume != null ? opcoes.volume : (cfgMusica().volume == null ? 0.22 : cfgMusica().volume);
    var b = montarFaixa(c, sai.saida, fx);
    b.bus.gain.value = ganhoFaixa(fx);
    for (var k = 0; k * d.dur < segundos; k++) {
      d.ev.forEach(function (e) {
        var t = k * d.dur + e.t;
        if (t < segundos) tocarEvento(c, b.entrada, e, t, sai.ex);
      });
    }
    return c.startRendering();
  };

  /* ---------- voz (áudios gravados, ver js/voz.js) ---------- */
  var saidaVoz = null;
  S.contexto = function () { S.ativar(); return ac; };
  S.saidaVoz = function () {
    if (!saidaVoz && ac) { saidaVoz = ac.createGain(); saidaVoz.gain.value = 1; saidaVoz.connect(ac.destination); }
    return saidaVoz;
  };
  // enquanto a voz fala, os sons de efeito ficam mais baixinhos
  // (a música também abaixa, para config.musica.comVoz, e volta devagar)
  S.abaixarEfeitos = function (sim) {
    abafarMusica(!!sim);
    if (!ac || !mestre) return;
    mestre.gain.setTargetAtTime(sim ? 0.16 : 0.35, ac.currentTime, 0.08);
  };
  S.temVoz = function () { return true; };
  S.falar = function (segmentos, opcoes) { return Reino.Voz ? Reino.Voz.falar(segmentos, opcoes) : Promise.resolve(); };
  S.calar = function () { if (Reino.Voz) Reino.Voz.calar(); };

  Reino.Som = S;
})();
