/* NPCs, parte extra: a base de sprite 'reserva', a vaga tracejada de um personagem reservado
   (Reino.reservarPersonagem) que ainda não foi registrado. Ocupa o mesmo tile e o mesmo tamanho do NPC final,
   para o cenário ser feito em paralelo sem retrabalho. Contrato: docs/contratos/plano-paralelo.md §2.
   Só registra a função: nada de DOM nem canvas no carregamento. */
(function () {
  var Reino = window.Reino;
  // 19 colunas, como os outros; silhueta de papel com borda tracejada (B/b) e um "?" no peito
  var VAGA = [
    '...................',   // 0
    '...................',   // 1
    '...................',   // 2
    '...................',   // 3
    '.......BbBbB.......',   // 4  cabeça
    '......b.....b......',   // 5
    '.....B.......B.....',   // 6
    '.....b.......b.....',   // 7
    '.....B.......B.....',   // 8
    '......b.....b......',   // 9
    '.......BbBbB.......',   // 10
    '........b.b........',   // 11 pescoço
    '....BbBbB.BbBbB....',   // 12 ombros
    '...b...........b...',   // 13
    '...B....qqq....B...',   // 14 o "?"
    '...b...q...q...b...',   // 15
    '...B.......q...B...',   // 16
    '...b......q....b...',   // 17
    '...B.....q.....B...',   // 18
    '...b...........b...',   // 19
    '...B.....q.....B...',   // 20
    '....bBbBbBbBbBb....',   // 21
    '...................',   // 22
  ];
  // criança: a mesma silhueta sem 3 linhas do meio (cabeça e corpo), com 3 linhas vazias em cima (mesma altura de grade)
  var VAZIA = '...................';
  var CRIANCA = [VAZIA, VAZIA, VAZIA].concat(VAGA.filter(function (l, j) { return j !== 9 && j !== 13 && j !== 19; }));
  // adulto: 1 linha a mais de corpo (21 px com o contorno, como o NPC adulto: arte.md §12)
  var ADULTO = VAGA.slice(0, 20).concat(['...B...........B...'], VAGA.slice(20));

  function gradeReserva(o, quadro) {
    var G = Reino.NPCs.gradeSprite, cru = o.cru || {};
    // tom da vaga pelo gênero da reserva (só para ajudar quem monta o cenário a ler a cena)
    var tinta = cru.genero === 'm' ? '#7fa6e8' : cru.genero === 'f' ? '#e88fc0' : '#a99ad6';
    var pal = { B: tinta, b: G.cla(tinta, 0.45), q: G.esc(tinta, 0.25) };
    var linhas = cru.idade === 'crianca' ? CRIANCA : ADULTO;
    var g = new G.Grade(linhas.length, 0, 0);
    // papel claro por dentro (sem ele, o tracejado vazaria o chão e o contorno riscaria o miolo);
    // piscar: o "?" some por um quadro, para se ver que é provisório
    linhas.forEach(function (linha, j) {
      var ini = linha.search(/[Bb]/), fim = linha.length - 1 - linha.split('').reverse().join('').search(/[Bb]/);
      if (ini < 0) return;
      for (var i = ini; i <= fim; i++) {
        var k = linha[i] === 'q' && (quadro & 2) ? '.' : linha[i];
        g.p(i, j, k === '.' ? '#fbf8ff' : pal[k]);
      }
    });
    return { g: g, busto: linhas === CRIANCA ? 18 : 16 };
  }

  if (Reino.NPCs && Reino.NPCs.registrarBase) Reino.NPCs.registrarBase('reserva', gradeReserva, { genero: ['f', 'm'] });
})();
