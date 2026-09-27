/* Sons suaves feitos na hora (WebAudio), a música por ambiente e a saída da voz que lê as perguntas (pt-BR).
   Em três arquivos, nesta ordem (Reino.Som é um só):
     som.js               o AudioContext, os efeitos (S.tocar) e a saída da voz
     som-instrumentos.js  os instrumentos da música (timbres, percussão, faixa, saída com compressor)
     som-musica.js        o motor da música por ambiente (S.musica, S.musicaAtual, S.renderizarFaixa)
   As composições (dados) estão em js/sistemas/musicas-faixas.js e js/sistemas/musicas.js.
   O que as partes dividem mora em Reino._som (interno): `ac` (sempre ler I.ac: nasce em S.ativar), `S`
   e as funções que cada parte publica no fim dela. */
(function () {
  var S = {};
  // o que as partes do som dividem: `ac` = o AudioContext do jogo (criado no primeiro toque, em S.ativar)
  /** @type {Object<string, any>} interno: as partes publicam o que dividem (ver o cabeçalho) */
  var I = Reino._som = { ac: null, S: S };
  var mestre = null;
  /** @returns {Partial<Ajustes>} */
  var ajustes = function () { return (Reino.Progresso && Reino.Progresso.estado() && Reino.Progresso.estado().ajustes) || {}; };

  S.ativar = function () {
    // 'interrupted': o Safari do iPad/iPhone (tela bloqueada, ligação, outro app tocando); 'closed' não volta
    if (I.ac) { if (I.ac.state === 'suspended' || I.ac.state === 'interrupted') I.ac.resume(); return; }
    try {
      I.ac = new (window.AudioContext || window.webkitAudioContext)();
      mestre = I.ac.createGain();
      mestre.gain.value = 0.35;
      mestre.connect(I.ac.destination);
    } catch (e) { I.ac = null; }
  };

  function nota(freq, inicio, dur, tipo, vol) {
    if (!I.ac) return;
    var o = I.ac.createOscillator(), g = I.ac.createGain();
    o.type = tipo || 'triangle';
    o.frequency.value = freq;
    var t0 = I.ac.currentTime + inicio;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(mestre);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(inicio, dur, vol) {
    if (!I.ac) return;
    var n = Math.floor(I.ac.sampleRate * dur);
    var buf = I.ac.createBuffer(1, n, I.ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = I.ac.createBufferSource(), f = I.ac.createBiquadFilter(), g = I.ac.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(mestre);
    src.start(I.ac.currentTime + inicio);
  }

  // nota que escorrega de uma frequência para outra (gotinha, gole)
  function deslize(f0, f1, inicio, dur, tipo, vol) {
    if (!I.ac) return;
    var o = I.ac.createOscillator(), g = I.ac.createGain();
    o.type = tipo || 'sine';
    var t0 = I.ac.currentTime + inicio;
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
    if (!I.ac) return;
    var n = Math.floor(I.ac.sampleRate * dur);
    var buf = I.ac.createBuffer(1, n, I.ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) { var r = 1 - i / n; d[i] = (Math.random() * 2 - 1) * r * r; }
    var src = I.ac.createBufferSource(), f = I.ac.createBiquadFilter(), g = I.ac.createGain();
    var t0 = I.ac.currentTime + inicio;
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
    /* ---- banho de espuma (js/sistemas/banho.js) ---- */
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
    /* ---- foto (js/sistemas/fotos.js) ---- */
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
    if (!I.ac || !SONS[nome]) return;
    try { SONS[nome](); } catch (e) {}
  };

  /* ---------- voz (áudios gravados, ver js/sistemas/voz.js) ---------- */
  var saidaVoz = null;
  S.contexto = function () { S.ativar(); return I.ac; };
  S.saidaVoz = function () {
    if (!saidaVoz && I.ac) { saidaVoz = I.ac.createGain(); saidaVoz.gain.value = 1; saidaVoz.connect(I.ac.destination); }
    return saidaVoz;
  };
  // enquanto a voz fala, os sons de efeito ficam mais baixinhos
  // (a música também abaixa, para config.musica.comVoz, e volta devagar)
  S.abaixarEfeitos = function (sim) {
    I.abafarMusica(!!sim);
    if (!I.ac || !mestre) return;
    mestre.gain.setTargetAtTime(sim ? 0.16 : 0.35, I.ac.currentTime, 0.08);
  };
  S.temVoz = function () { return true; };
  S.falar = function (segmentos, opcoes) { return Reino.Voz ? Reino.Voz.falar(segmentos, opcoes) : Promise.resolve(); };
  S.falarEsperando = function (segmentos, opcoes) {
    return Reino.Voz ? Reino.Voz.falarEsperando(segmentos, opcoes) : { espera: false, fim: Promise.resolve() };
  };
  S.calar = function () { if (Reino.Voz) Reino.Voz.calar(); };

  Reino.Som = S;
})();
