/* Laboratório de Química: as frases do álbum Experiências do Reino (chaves 'exp.<nome>') e do elemento da trilha
   ainda fechado na tabela ('trilha.elemento'), na voz da Doutora Proveta. Contrato: docs/contratos/quimica.md §4 e
   quarto-bimestre.md §14.3. As páginas de cada carta (Reino.QUIMICA.experiencias) entram aqui como
   'exp.<id>.<parte>' (o Q.falas() já lê as frases: assim elas vão para a lista de gravação). Até 30 letras, 3+ palavras. */
(function () {
  var Q = window.Reino.QUIMICA, por = Q.porFrase;
  // ao abrir o álbum
  por('exp.oi', ['Experiências para casa!', 'Sempre com um adulto.']);
  // tocou numa carta ainda fechada
  por('exp.bloqueada', ['Essa carta ainda é segredo.', 'Faça a trilha sem errar!']);
  // abre toda carta
  por('exp.adulto', ['Faça com um adulto, tá?']);
  // tocou num elemento da trilha ainda fechado (tabela periódica)
  por('trilha.elemento', ['Esse elemento é um segredo!', 'Faça uma trilha perfeita!', 'É na Casa das Palavras.']);
  (Q.experiencias || []).forEach(function (x) {
    por('exp.' + x.id + '.precisa', x.precisa);
    por('exp.' + x.id + '.passos', x.passos);
    por('exp.' + x.id + '.acontece', [x.acontece]);
    por('exp.' + x.id + '.porque', x.porque);
  });
})();
