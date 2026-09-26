/* Som (parte 2 de 3): os instrumentos da música por ambiente, feitos na hora com WebAudio.
   Tudo recebe o contexto `c` (o do jogo ou um OfflineAudioContext de S.renderizarFaixa): nada de estado aqui.
   Ver o cabeçalho de som.js. */
(function () {
  var I = Reino._som;

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

  /* ---- os instrumentos (nome = `onda` das notas de js/sistemas/musicas.js) ----
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

  // para as outras partes
  I.tocarEvento = tocarEvento; I.montarFaixa = montarFaixa; I.montarSaida = montarSaida; I.ganhoFaixa = ganhoFaixa;
})();
