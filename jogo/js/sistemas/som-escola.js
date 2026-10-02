/* Notas das aulas de música: compartilham o AudioContext e respeitam o ajuste Som.
   A função devolvida interrompe a nota ao sair da aula, sem deixar osciladores ligados. */
(function () {
  var S = Reino.Som;
  S.notaMusical = function (midi, opcoes) {
    var op = opcoes || {};
    var estado = Reino.Progresso && Reino.Progresso.estado();
    if ((estado && estado.ajustes && estado.ajustes.som === false) || !Number.isFinite(midi) || midi < 21 || midi > 108) return function () {};
    var ac = S.contexto();
    if (!ac) return function () {};
    var duracao = Number.isFinite(op.duracao) ? Math.max(0.06, Math.min(4, op.duracao)) : 0.5;
    var volume = Number.isFinite(op.volume) ? Math.max(0.001, Math.min(0.35, op.volume)) : 0.2;
    var onda = ['sine', 'triangle', 'square', 'sawtooth'].indexOf(op.timbre) >= 0 ? op.timbre : 'triangle';
    var oscilador = ac.createOscillator(), ganho = ac.createGain(), t = ac.currentTime;
    oscilador.type = onda;
    oscilador.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(volume * 0.35, t + 0.012);
    ganho.gain.setValueAtTime(volume * 0.35, t + Math.max(0.013, duracao - 0.05));
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    oscilador.connect(ganho); ganho.connect(ac.destination);
    var encerrada = false;
    oscilador.onended = function () { encerrada = true; oscilador.disconnect(); ganho.disconnect(); };
    oscilador.start(t); oscilador.stop(t + duracao + 0.02);
    return function () {
      if (encerrada) return;
      encerrada = true;
      ganho.gain.cancelScheduledValues(ac.currentTime);
      ganho.gain.setTargetAtTime(0.0001, ac.currentTime, 0.008);
      oscilador.stop(ac.currentTime + 0.03);
    };
  };
})();
