/* Laboratório de Química: as frases da tela estados, o Fogão dos Estados (chaves 'estados.<nome>'), na voz da Dona
   Caramela (Reino.Quimica.vozDe). Contrato: docs/contratos/quimica.md §4 e §9. Até 30 letras por página, 3+ palavras. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // ao abrir o Fogão (o mesmo texto do convite da Dona Caramela: o mesmo áudio)
  por('estados.oi', ['Vamos ver a água mudar?']);
  por('estados.escolha', ['Escolha o que vai na panela.', 'Fogão real, só com um adulto!']);
  // o termômetro chegou na ponta
  por('estados.maxQuente', ['O fogo já está no máximo!']);
  por('estados.maxFrio', ['Já está bem geladinho!']);
  // o sólido que volta a endurecer (chocolate, manteiga, cera): não é descoberta
  por('estados.endurece', ['Esfriou e endureceu de novo!', 'Voltou a ser sólido.']);
  // as bolinhas da lupa (faladas depois de cada mudança nova)
  por('estados.solido', ['No sólido, as bolinhas', 'ficam juntinhas, tremendo.']);
  por('estados.liquido', ['No líquido, as bolinhas', 'escorregam umas nas outras.']);
  por('estados.gas', ['No gás, as bolinhas voam', 'para longe umas das outras.']);
  // sem número: um toque pode dar mais de uma estrela (o selo mostra quantas)
  por('estados.novo', ['Mais uma estrela para você!']);
  por('estados.todas', ['Você viu todas as mudanças!']);
})();
