/* Laboratório de Química, 2º andar: o Fogão dos Estados (Reino.QUIMICA.materiais e .mudancas).
   Contrato: docs/contratos/quimica.md §3 e §9. Só dados. Falas na voz da Dona Caramela (até 30 letras, 3+ palavras).
   materiais: { id, ordem, nome, emoji, fusao (°C: abaixo é sólido), ebulicao? (°C: dali para cima é gás; só a água),
     inicio (°C quando vai para a panela), fala: [páginas ao escolher] }
   mudancas (cada uma é uma descoberta 'estados', 1ª vez = estrelasEstadoNovo): { id, material, de, para
     ('solido' | 'liquido' | 'gas'), nome (na tela), explica: [páginas] }. Os 7 ids são do contrato. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.materiais = [
    { id: 'agua', ordem: 1, nome: 'Gelo e água', emoji: '🧊', fusao: 0, ebulicao: 100, inicio: -10,
      fala: ['Um cubo de gelo geladinho!'] },
    { id: 'chocolate', ordem: 2, nome: 'Chocolate', emoji: '🍫', fusao: 30, inicio: 20, fala: ['Um pedaço de chocolate!'] },
    { id: 'manteiga', ordem: 3, nome: 'Manteiga', emoji: '🧈', fusao: 35, inicio: 10, fala: ['Manteiga da geladeira!'] },
    { id: 'vela', ordem: 4, nome: 'Cera de vela', emoji: '🕯', fusao: 60, inicio: 20, fala: ['Um toco de cera de vela!'] },
  ];
  Q.mudancas = [
    { id: 'agua-derreter', material: 'agua', de: 'solido', para: 'liquido', nome: 'Derreter',
      explica: ['O gelo derreteu!', 'Virou água líquida.'] },
    { id: 'agua-ferver', material: 'agua', de: 'liquido', para: 'gas', nome: 'Ferver',
      explica: ['A água está fervendo!', 'Ela vira vapor, um gás.'] },
    { id: 'agua-condensar', material: 'agua', de: 'gas', para: 'liquido', nome: 'Condensar',
      explica: ['O vapor esfriou na tampa.', 'Virou gotinhas de água!'] },
    { id: 'agua-congelar', material: 'agua', de: 'liquido', para: 'solido', nome: 'Congelar',
      explica: ['A água congelou!', 'Virou gelo de novo.'] },
    { id: 'chocolate-derreter', material: 'chocolate', de: 'solido', para: 'liquido', nome: 'Derreter',
      explica: ['O chocolate derreteu!', 'Ele derrete bem rapidinho.'] },
    { id: 'manteiga-derreter', material: 'manteiga', de: 'solido', para: 'liquido', nome: 'Derreter',
      explica: ['A manteiga derreteu!', 'Virou um líquido amarelo.'] },
    { id: 'vela-derreter', material: 'vela', de: 'solido', para: 'liquido', nome: 'Derreter',
      explica: ['A cera da vela derreteu!', 'Ela precisa de mais calor.'] },
  ];
})();
