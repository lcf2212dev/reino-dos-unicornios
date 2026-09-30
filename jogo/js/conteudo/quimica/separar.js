/* Laboratório de Química, 2º andar: a Mesa de Separar Misturas (Reino.QUIMICA.ferramentas e .misturas).
   Contrato: docs/contratos/quimica.md §3 e §9. Só dados. Falas na voz da Dona Caramela (até 30 letras, 3+ palavras).
   ferramentas: { id, ordem, nome, emoji?, jeito (o nome do jeito de separar, na tela), fala?: [ao escolher] }
   misturas (cada uma é uma descoberta 'separar', 1ª vez = estrelasMisturaNova): { id, ordem, nome, emoji,
     certas: [ids das ferramentas que separam DE VERDADE], fala: [ao escolher], explica: [ao separar] }.
   Os 6 ids de ferramenta e os 6 de mistura são do contrato. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.ferramentas = [
    { id: 'coador', ordem: 1, nome: 'Coador', jeito: 'Filtrar' },
    { id: 'mao', ordem: 2, nome: 'Catar com a mão', emoji: '✋', jeito: 'Catar' },
    { id: 'peneira', ordem: 3, nome: 'Peneira', jeito: 'Peneirar' },
    { id: 'sol', ordem: 4, nome: 'Sol quentinho', emoji: '☀', jeito: 'Evaporar' },
    { id: 'ima', ordem: 5, nome: 'Ímã', emoji: '🧲', jeito: 'Usar o ímã' },
    { id: 'esperar', ordem: 6, nome: 'Esperar', emoji: '⏳', jeito: 'Decantar' },
  ];
  Q.misturas = [
    { id: 'cafe', ordem: 1, nome: 'Café com pó', emoji: '☕', certas: ['coador'],
      fala: ['Café com o pó misturado.'], explica: ['O coador segurou o pó.', 'O café passou pelo pano!'] },
    { id: 'feijao', ordem: 2, nome: 'Feijão com pedrinhas', emoji: '🫘', certas: ['mao'],
      fala: ['Feijão com umas pedrinhas.'], explica: ['Catamos as pedrinhas!', 'Agora o feijão está limpo.'] },
    { id: 'areia-pedras', ordem: 3, nome: 'Areia com pedrinhas', emoji: '🪨', certas: ['peneira'],
      fala: ['Areia com pedrinhas.'], explica: ['A areia passou nos furos.', 'As pedrinhas ficaram em cima!'] },
    { id: 'agua-sal', ordem: 4, nome: 'Água com sal', emoji: '🧂', certas: ['sol'],
      fala: ['Água com sal dissolvido.'], explica: ['A água evaporou no sol.', 'O sal ficou no fundo!'] },
    { id: 'areia-ferro', ordem: 5, nome: 'Areia com clipes', emoji: '🏖', certas: ['ima'],
      fala: ['Areia com clipes de ferro.'], explica: ['O ímã puxou os clipes!', 'Ele atrai o ferro.'] },
    { id: 'agua-barrenta', ordem: 6, nome: 'Água barrenta', emoji: '💧', certas: ['esperar', 'coador'],
      fala: ['Água com terra misturada.'], explica: ['A terra desceu para o fundo.', 'A água ficou limpinha em cima.'] },
  ];
})();
