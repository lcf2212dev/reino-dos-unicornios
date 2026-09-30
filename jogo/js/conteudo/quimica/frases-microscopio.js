/* Laboratório de Química: as frases da tela microscopio (chaves 'microscopio.<nome>'), na voz da Doutora Proveta.
   Contrato: docs/contratos/quimica.md §4. Até 30 letras por página, 3+ palavras. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  por('microscopio.oi', ['Vamos espiar o bem pequeno?', 'Escolha uma lâmina.']);
  por('microscopio.foco', ['Gire o foco bem devagar.']);
  por('microscopio.nitida', ['Ficou nítida, sem borrão!']);
  // o número de estrelas vem de Reino.config.quimica.estrelasLaminaNova: mudou lá, mude aqui e regrave a voz
  por('microscopio.laminaNova', ['Você ganhou 1 estrela!']);
  por('microscopio.todas', ['Você viu todas as lâminas!']);
})();
