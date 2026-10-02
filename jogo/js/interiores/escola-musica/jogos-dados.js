/* Jogos de música: desafios graduais e falas enumeradas; não altera o progresso salvo. */
(function () {
  var R = window.Reino, M = R.EscolaMusica;
  var J = M.Jogos = {};
  J.falas = {
    convite: ['Vamos brincar com os sons?', 'Escolha um jogo de música.'],
    eco: ['Ouça e veja as notas.', 'Depois toque na mesma ordem.', 'Você pode ouvir de novo.'],
    ritmo: ['Monte quatro tempos musicais.', 'Toque nos blocos para mudar.', 'Compare com o meu ritmo.'],
    ouvido: ['Vamos comparar dois sons?', 'Ouça os dois com atenção.', 'Depois escolha sua resposta.'],
    fim: ['Você completou o desafio!', 'Pode brincar outra vez.']
  };
  J.notas = [{ midi: 60, nome: 'Dó' }, { midi: 62, nome: 'Ré' }, { midi: 64, nome: 'Mi' }, { midi: 67, nome: 'Sol' }];
  J.ecos = [[60, 64], [60, 64, 62], [60, 62, 67, 64], [67, 64, 62, 60, 64]];
  J.blocos = ['ta', 'duplo', 'pausa'];
  J.rotulos = { ta: 'Tá', duplo: 'Tá-tá', pausa: 'Pausa' };
  J.ritmos = [['ta', 'ta', 'pausa', 'ta'], ['ta', 'duplo', 'ta', 'pausa'], ['duplo', 'pausa', 'ta', 'duplo'], ['pausa', 'duplo', 'duplo', 'ta']];
  J.ouvidos = [
    { tema: 'Altura', pergunta: 'Qual som é mais agudo?', sons: [[48, 0.6, 0.18], [72, 0.6, 0.18]], dica: ['Grave', 'Agudo'], certa: 1, explicacao: 'O som 2 é mais agudo. Altura compara grave e agudo.' },
    { tema: 'Duração', pergunta: 'Qual som dura mais?', sons: [[60, 1.2, 0.18], [60, 0.15, 0.18]], dica: ['Longo', 'Curto'], certa: 0, explicacao: 'O som 1 dura mais tempo. A nota continua igual.' },
    { tema: 'Intensidade', pergunta: 'Qual som é mais suave?', sons: [[60, 0.6, 0.2], [60, 0.6, 0.05]], dica: ['Mais forte', 'Suave'], certa: 1, explicacao: 'O som 2 é mais suave. A intensidade muda; a nota é a mesma.' },
    { tema: 'Altura', pergunta: 'Qual som é mais grave?', sons: [[72, 0.6, 0.18], [48, 0.6, 0.18]], dica: ['Agudo', 'Grave'], certa: 1, explicacao: 'O som 2 é mais grave. Grave não quer dizer mais forte.' },
    { tema: 'Duração', pergunta: 'Qual som é mais curto?', sons: [[60, 0.15, 0.18], [60, 1.2, 0.18]], dica: ['Curto', 'Longo'], certa: 0, explicacao: 'O som 1 termina antes. Um som curto dura menos tempo.' },
    { tema: 'Intensidade', pergunta: 'Qual som é mais forte?', sons: [[60, 0.6, 0.2], [60, 0.6, 0.05]], dica: ['Mais forte', 'Suave'], certa: 0, explicacao: 'O som 1 é mais forte. Os dois têm a mesma altura e duração.' }
  ];
  J.nomeNota = function (midi) { return J.notas.filter(function (n) { return n.midi === midi; })[0].nome; };
  J.igual = function (a, b) { return a.length === b.length && a.every(function (v, i) { return v === b[i]; }); };
  J.notasDoRitmo = function (blocos) {
    var notas = [];
    blocos.forEach(function (b, i) {
      if (b !== 'pausa') notas.push([60, i * 0.7, 0.18]);
      if (b === 'duplo') notas.push([60, i * 0.7 + 0.35, 0.18]);
    }); return notas;
  };
  var extras = [];
  Object.keys(J.falas).forEach(function (k) { J.falas[k].forEach(function (texto) { extras.push({ texto: texto, voz: 'claude' }); }); });
  R.falasDoPredio('escola-musica', { extras: extras });
})();
