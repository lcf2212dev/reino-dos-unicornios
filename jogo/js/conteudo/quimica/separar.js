/* Laboratório de Química, 2º andar: a Mesa de Separar Misturas (Reino.QUIMICA.ferramentas e .misturas).
   Contrato: docs/contratos/quimica.md §3 e §9. Só dados. Falas na voz da Dona Caramela (até 30 letras, 3+ palavras).
   ferramentas: { id, ordem, nome, emoji?, jeito (o nome do jeito de separar, na tela), fala?: [ao separar com ela:
     o que ela faz, dito antes do `explica` da mistura] }
   misturas (cada uma é uma descoberta 'separar', 1ª vez = estrelasMisturaNova): { id, ordem, nome, emoji,
     certas: [ids das ferramentas que separam DE VERDADE], fala: [ao escolher], explica: [ao separar] }.
   O `explica` não cita a ferramenta quando há mais de uma certa (ele vale para todas).
   Os 6 ids de ferramenta e os 6 de mistura são do contrato. O desenho de cada uma: ui/quimica-separar-2.js. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.ferramentas = [
    { id: 'coador', ordem: 1, nome: 'Coador', jeito: 'Filtrar',
      fala: ['O pano do coador segura', 'o que é sólido.', 'O líquido passa!'] },
    { id: 'mao', ordem: 2, nome: 'Catar com a mão', emoji: '✋', jeito: 'Catar',
      fala: ['Catar é tirar com a mão,', 'um pedacinho de cada vez.'] },
    { id: 'peneira', ordem: 3, nome: 'Peneira', jeito: 'Peneirar',
      fala: ['O que é miúdo cai nos furos.', 'O graúdo fica na peneira.'] },
    { id: 'sol', ordem: 4, nome: 'Sol quentinho', emoji: '☀', jeito: 'Evaporar',
      fala: ['O sol esquenta a água.', 'Ela vira vapor e sobe.'] },
    { id: 'ima', ordem: 5, nome: 'Ímã', emoji: '🧲', jeito: 'Usar o ímã',
      fala: ['O ímã puxa o que é de ferro.'] },
    { id: 'esperar', ordem: 6, nome: 'Esperar', emoji: '⏳', jeito: 'Decantar',
      fala: ['Com calma, o mais pesado', 'desce para o fundo.'] },
  ];
  Q.misturas = [
    // coador: o pano retém o pó e deixa passar o café (filtração). Esperar não serve: o pó fino fica boiando
    // e o café sai turvo; a peneira de cozinha deixa o pó passar
    { id: 'cafe', ordem: 1, nome: 'Café com pó', emoji: '☕', certas: ['coador'],
      fala: ['Café com o pó misturado.', 'Como tirar esse pó?'],
      explica: ['O pó ficou no coador.', 'O café coado no pano', 'é bem brasileiro!'] },
    // mão: feijão e pedrinha têm o mesmo tamanho (a peneira não separa) e nenhum é de ferro: cata-se um a um
    { id: 'feijao', ordem: 2, nome: 'Feijão com pedrinhas', emoji: '🫘', certas: ['mao'],
      fala: ['Feijão com umas pedrinhas.', 'Ninguém quer morder pedra!'],
      explica: ['Pronto, sem pedrinhas!', 'A gente cata o feijão', 'antes de cozinhar.'] },
    // peneira: a areia é miúda e passa nos furos; as pedrinhas, graúdas, ficam (é o que se faz na obra).
    // mão: as pedrinhas são grandes o bastante para catar uma a uma
    { id: 'areia-pedras', ordem: 3, nome: 'Areia com pedrinhas', emoji: '🪨', certas: ['peneira', 'mao'],
      fala: ['Areia com pedrinhas.', 'Uma é miúda, a outra graúda.'],
      explica: ['As pedrinhas saíram!', 'A areia ficou fininha.'] },
    // sol: a água evapora e o sal dissolvido fica (é assim nas salinas). Coador, peneira e esperar não servem:
    // o sal dissolvido passa por qualquer furo e nunca desce para o fundo
    { id: 'agua-sal', ordem: 4, nome: 'Água com sal', emoji: '🧂', certas: ['sol'],
      fala: ['Água com sal dissolvido.', 'O sal se escondeu na água!'],
      explica: ['A água foi embora no ar.', 'O sal branquinho ficou!', 'Nas salinas é assim também.'] },
    // ímã: o pó de ferro (limalha) é atraído e a areia não. Peneira e mão não servem: o pó é fino, do tamanho
    // dos grãos de areia (passa nos mesmos furos e não dá para catar)
    { id: 'areia-ferro', ordem: 5, nome: 'Areia com pó de ferro', emoji: '🏖', certas: ['ima'],
      fala: ['Areia com pozinho de ferro.'],
      explica: ['O ímã puxou o pó de ferro!', 'A areia ficou limpinha.'] },
    // esperar: a terra é mais pesada que a água e desce (decantação). Coador: o pano segura a terra (filtração).
    // A peneira não serve: o grão de terra é fino e passa. Mesmo clarinha, essa água não é de beber
    { id: 'agua-barrenta', ordem: 6, nome: 'Água barrenta', emoji: '💧', certas: ['esperar', 'coador'],
      fala: ['Água com terra misturada.'],
      explica: ['A terra se separou da água.', 'Mas essa água não é de beber!'] },
  ];
})();
