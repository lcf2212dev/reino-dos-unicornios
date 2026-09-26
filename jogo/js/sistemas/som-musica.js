/* Som (parte 3 de 3): o motor da música por ambiente.
     As composições (dados) estão em js/sistemas/musicas-faixas.js (lidas por js/sistemas/musicas.js); os
     instrumentos, em som-instrumentos.js.
     Motor: um timer só acorda o agendador a cada config.musica.intervaloMs, e ele agenda pelo relógio do
     AudioContext as notas dos próximos lookaheadS segundos (nenhuma nota depende do timer).
     Cadeia: nota → entrada da faixa (→ eco) → ganho da faixa (crossfade) → ganho da música (volume, voz,
     aba escondida, liga/desliga) → compressor leve → alto-falante. Os efeitos (`mestre`) ficam de fora:
     "Som" desligado não cala a música, e a musiquinha desligada não cala os efeitos.
   Ver o cabeçalho de som.js. */
(function () {
  var I = Reino._som, S = I.S;
  var tocarEvento = I.tocarEvento, montarFaixa = I.montarFaixa, montarSaida = I.montarSaida, ganhoFaixa = I.ganhoFaixa;
  var cfgMusica = function () { return (Reino.config && Reino.config.musica) || {}; };

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
    var t = I.ac.currentTime, v = param.value, fim = t + Math.max(0.02, s);
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
    if (exp && v > 1e-4 && alvo > 1e-4) param.exponentialRampToValueAtTime(alvo, fim);
    else param.linearRampToValueAtTime(alvo, fim);
  }
  function aplicarVolume(s, exp) { if (I.ac && MUS.saida) rampa(MUS.saida.saida.gain, alvoMusica(), s, exp); }
  // voz: desce em 0,6 s e volta em 0,8 s, em dB constantes (menos de 1 dB a cada 50 ms)
  function abafarMusica(sim) {
    if (MUS.abafada === sim) return;
    MUS.abafada = sim;
    aplicarVolume(sim ? 0.6 : 0.8, true);
  }

  function posicaoDe(tc) { return (((I.ac.currentTime - tc.inicio) % tc.dur) + tc.dur) % tc.dur; }
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
    var tc = { id: id, fx: fx, ev: d.ev, dur: d.dur, b: montarFaixa(I.ac, MUS.saida.saida, fx), idx: 0, inicio: 0, fimEm: null };
    ancorar(tc, pos || 0, I.ac.currentTime + 0.05);
    var g = tc.b.bus.gain, t = I.ac.currentTime;
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
    tc.fimEm = I.ac.currentTime + fadeS;
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
    var agora = I.ac.currentTime, limite = agora + (cfgMusica().lookaheadS || 0.25);
    if (tc.fimEm !== null) limite = Math.min(limite, tc.fimEm);
    if (!tc.ev.length) return;
    // atrasou muito (aba travada, CPU ocupada): continua da posição de agora, sem despejar notas velhas
    if (tc.inicio + tc.ev[tc.idx].t < agora - 0.5) { ancorar(tc, posicaoDe(tc), agora); MUS.puladas++; }
    for (var n = 0; n < 96; n++) {
      var e = tc.ev[tc.idx], t = tc.inicio + e.t;
      if (t >= limite) break;
      if (t >= agora - 0.03) tocarEvento(I.ac, tc.b.entrada, e, Math.max(t, agora), MUS.saida.ex);
      else MUS.puladas++;
      tc.idx++;
      if (tc.idx >= tc.ev.length) { tc.idx = 0; tc.inicio += tc.dur; }
    }
  }

  function trocarPara(amb) {
    MUS.ambiente = amb;
    var faixa = faixaDoAmbiente(amb), atual = tocadorAtivo();
    MUS.faixa = faixa;
    if (!I.ac || !MUS.saida || MUS.pausada || !MUS.ligada) return;
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
    if (!I.ac || !MUS.saida) { clearInterval(MUS.timer); MUS.timer = null; return; }
    decidir(false);
    var agora = I.ac.currentTime;
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
    if (!I.ac || !MUS.saida || !MUS.ligada) return;
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
    var U = Reino.util, EV = Reino.EVENTOS;
    if (U && U.on) [EV.CENA, EV.TELAS, EV.OCUPADA].forEach(function (ev) { U.on(ev, function () { decidir(true); }); });
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
  }

  // "🎵 Musiquinha" (Ajustes): liga e desliga tudo
  S.musica = function (ligar) {
    ligar = !!ligar;
    if (!ligar) {
      if (!MUS.ligada) return;
      MUS.ligada = false;
      if (I.ac && MUS.saida) { MUS.tocadores.forEach(function (tc) { pararTocador(tc, 0.6); }); aplicarVolume(0.5); }
      return;
    }
    S.ativar();
    if (!I.ac || !Reino.Musicas) return;
    if (!MUS.saida) MUS.saida = montarSaida(I.ac);
    ouvir();
    MUS.ligada = true;
    MUS.pausada = !!document.hidden;
    MUS.ambiente = null; MUS.pendente = null;
    aplicarVolume(1);
    decidir(true);
    if (!MUS.timer) MUS.timer = setInterval(tique, cfgMusica().intervaloMs || 60);
  };

  S.musicaAtual = function () {
    var tc = I.ac ? tocadorAtivo() : null;
    return {
      ligada: MUS.ligada,
      ambiente: MUS.ligada ? MUS.ambiente : ambienteAgora(),
      faixa: MUS.ligada ? MUS.faixa : null,
      tocando: !!(MUS.ligada && !MUS.pausada && tc && I.ac.state === 'running'),
      volume: alvoMusica(),
      abafada: MUS.abafada,
      pausada: MUS.pausada,
      // para os testes: o ganho de agora e as faixas soando (a que entra e as que saem no crossfade)
      ganho: MUS.saida ? MUS.saida.saida.gain.value : 0,
      contexto: I.ac ? I.ac.state : null,
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

  // para as outras partes
  I.abafarMusica = abafarMusica;
})();
