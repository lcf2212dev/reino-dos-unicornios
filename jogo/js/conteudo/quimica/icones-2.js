/* Laboratório de Química, 2º andar: os ícones pixel art dos emojis novos do andar (Reino.registrarIcones;
   jogo/js/CLAUDE.md, Arte). Contrato: docs/contratos/quimica.md §6 e §9: 🧈 🕯 🌡 🫘 🧲 🔩 🌧 🧑‍🔬.
   (Provisórios do contrato: a frente dos ícones troca cada um pelo desenho de verdade.) */
(function () {
  var k = '#3a2446'; // contorno de sempre
  // um bloco arredondado na cor do emoji, só para o validador enquanto a frente desenha
  function provisorio(n, cor) {
    return { n: n, p: { k: k, c: cor, w: '#ffffff' }, d: [
      '................', '................', '....kkkkkkkk....', '...kccccccccck..', '...kcwcccccccck.',
      '...kccccccccck..', '...kccccccccck..', '...kccccccccck..', '...kccccccccck..', '...kccccccccck..',
      '...kccccccccck..', '...kccccccccck..', '....kkkkkkkkk...', '................', '................', '................',
    ] };
  }
  Reino.registrarIcones({
    '🧈': provisorio('manteiga', '#ffe07a'),
    '🕯': provisorio('vela', '#f4f2fa'),
    '🌡': provisorio('termômetro', '#ff5c6a'),
    '🫘': provisorio('feijão', '#8a4a2a'),
    '🧲': provisorio('ímã', '#e0433f'),
    '🔩': provisorio('parafuso', '#a8b0c0'),
    '🌧': provisorio('nuvem de chuva', '#9fc8f0'),
    '🧑‍🔬': provisorio('cientista', '#f1c7a5'),
  });
})();
