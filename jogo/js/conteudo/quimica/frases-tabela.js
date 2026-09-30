/* Laboratório de Química: as frases da tela tabela (chaves 'tabela.<nome>'), na voz da Doutora Proveta.
   Contrato: docs/contratos/quimica.md §4. Até 30 letras por página, 3+ palavras. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // ao abrir o Cantinho dos Átomos
  por('tabela.oi', ['Oi! Aqui moram os elementos.', 'Toque num cartão para ver.']);
  // chegou ao fim de uma lição pela 1ª vez (estrelasLicaoNova: 1; mudou o config, regrave)
  por('tabela.licaoNova', ['Muito bem, lição lida!', 'Você ganhou uma estrela!']);
  // e essa era a última que faltava
  por('tabela.todasLicoes', ['Você leu todas as lições!', 'Que cientista incrível!']);
})();
