/* Vila Arco-Íris, Casa Mal-Assombrada (o terreno de cima da esquerda; docs/contratos/vila.md §2, monstros.md §10): o que
   os objetos do salão e as 6 jaulas dos monstros das matérias dizem. Parte das falas da Vila (Reino.falasDoPredio('vila',
   …)); tudo na voz da narradora, pacote interior-bosque. Cada página com até ~30 letras, frases de 3 ou mais palavras.
   - objetos: os enfeites que falam (caldeirão, quadro torto e o fantasminha).
   - assombrada: as falas das jaulas (ação 'assombrada-monstro', assombrada-acoes.js, que também as entrega ao
     listar-falas pelo módulo 'assombrada'): por espécie, `termine` (a matéria de agora do prédio, com o artigo: confira
     o nome em Reino.materia(daMateria().materia).nome), `ganhe` e `seu` (o monstro com o artigo) e `ela` (o monstro é
     ela); e as gerais, iguais para os 6.
   Carrega antes de assombrada.js (que lê as falas dos objetos). */
(function () {
  var R = window.Reino;

  R.falasDoPredio('vila', {
    objetos: {
      'assombrada-caldeirao': ['O caldeirão faz bolhas verdes!'],
      'assombrada-quadro': ['Um fantasma sorri no quadro.'],
      'assombrada-fantasma': ['Eu sou um fantasminha amigo!'],
    },
    assombrada: {
      especies: {
        'assombrada-matematica': { termine: 'Termine a Matemática do Dia a Dia!', ganhe: 'E ganhe o Fantasma das Contas!',
          seu: 'O Fantasma das Contas é seu!' },
        // "Termine o English!" e "E ganhe o Vampirinho…" saíam "Terminou o inglês" e "E ganho vampirinho" na transcrição
        'assombrada-ingles': { termine: 'Termine as salas de English!', ganhe: 'E você ganha o Vampirinho Inglês!',
          seu: 'O Vampirinho Inglês é seu!' },
        'assombrada-portugues': { termine: 'Termine a Língua Portuguesa!', ganhe: 'E ganhe a Múmia das Letras!',
          seu: 'A Múmia das Letras é sua!', ela: true },
        'assombrada-geografia': { termine: 'Termine a Geografia do Mundo!', ganhe: 'E ganhe o Lobisomem dos Mapas!',
          seu: 'O Lobisomem dos Mapas é seu!' },
        'assombrada-ciencias': { termine: 'Termine a Ciências da Natureza!', ganhe: 'E ganhe o Monstrinho do Laboratório!',
          seu: 'O Monstrinho do Laboratório é seu!' },
        'assombrada-historia': { termine: 'Termine a História da Gente!', ganhe: 'E ganhe o Esqueleto do Museu!',
          seu: 'O Esqueleto do Museu é seu!' },
      },
      levar: 'Quer levar com você?',
      junto: 'Ele está com você!',
      juntoEla: 'Ela está com você!',
      semVaga: ['Não tem vaga para mais um.', 'Deixe um monstro em casa.'],
    },
  });
})();
