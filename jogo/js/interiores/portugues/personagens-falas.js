/* Falas dos personagens reservados da Casa das Palavras (reservas.js), numa parte própria de Reino.falasDoPredio:
   o 1º andar (portugues-1), com os anfitriões dos ateliês e a Vovó Serena do Cantinho do Respiro.
   Cada página com até 30 letras (sem contar «» e emoji) e frases de 3+ palavras. `respiro`: a narração da
   respiração guiada (lp-respiro.js), gravada na voz da Vovó Serena pelos `extras`. */
(function () {
  var VOZ_SERENA = 'npc-lp-serena';
  // o texto na tela é curto ("Inspira…"); a voz lê a frase inteira (3+ palavras)
  var respiro = {
    voz: VOZ_SERENA,
    comeco: 'Olhe o círculo com calma.',
    inspira: 'Puxe o ar bem devagar.',
    expira: 'Solte o ar bem devagar.',
    fim: ['Você respirou muito bem!', 'Pode voltar quando quiser.'],
  };
  var extras = [respiro.comeco, respiro.inspira, respiro.expira].concat(respiro.fim)
    .map(function (t) { return { texto: t, voz: VOZ_SERENA }; });

  Reino.falasDoPredio('portugues', { respiro: respiro, extras: extras, npcs: {
    'lp-rabisco': {
      oi: ['Olá, eu sou o Mestre Rabisco!', 'Aqui é o ateliê dos contos.', 'Cada lição tem etapas curtas.'],
      nova: ['Vamos fazer uma etapa?'],
      depois: ['Uma etapa de cada vez!', 'Tudo fica guardado, viu?'],
    },
    'lp-melodia': {
      oi: ['Oi, eu sou a Dona Cantiga!', 'Aqui é o ateliê das canções.', 'Cada lição tem etapas curtas.'],
      nova: ['Vamos cantar uma etapa?'],
      depois: ['Você canta muito bem!', 'Se cansar, pode descansar.'],
    },
    'lp-tito': {
      oi: ['Oi, eu sou o Tito Rima!', 'Aqui é o ateliê dos poemas.', 'Cada lição tem etapas curtas.'],
      nova: ['Vamos rimar uma etapa?'],
      depois: ['Que rima mais bonita!', 'Sem erro, ganha um tesouro!'],
    },
    'lp-serena': {
      oi: ['{Olá, minha querida!|Olá, meu querido!}', 'Eu sou a Vovó Serena.', 'Aqui é o Cantinho do Respiro.'],
      nova: ['Vamos respirar bem devagar? 🌿'],
      depois: ['Descansar também é importante.', 'Seu progresso está guardado.'],
    },
  } });
})();
