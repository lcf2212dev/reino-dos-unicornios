/* Laboratório de Química: as frases da tela bancada (chaves 'bancada.<nome>'), na voz da Doutora Proveta.
   Contrato: docs/contratos/quimica.md §4. Até 30 letras por página, 3+ palavras.
   Número falado vem escrito (estrelas de Reino.config.quimica, tubos de maxTubos): mudou o config, regrave. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // 1ª vez que a bancada abre na sessão
  por('bancada.oi', ['Oi! Vamos misturar poções?', 'Toque num tubo de ensaio.', 'Depois, toque em Misturar!']);
  // béquer cheio (maxTubos: 3) e Misturar! com o béquer vazio
  por('bancada.cheio', ['O béquer já está cheio!', 'Cabem só três tubos.']);
  por('bancada.vazio', ['O béquer está vazio.', 'Escolha um tubo primeiro!']);
  // mistura sem receita: nunca é erro
  por('bancada.nada', ['Hmm, nada de especial.', 'Cientista testa de tudo!', 'Vamos tentar outra mistura?']);
  por('bancada.quaseFalta', ['Quase! Falta um ingrediente.']);
  por('bancada.quaseSobra', ['Quase! Sobrou um ingrediente.', 'Tente tirar um deles.']);
  por('bancada.quaseCaderno', ['A receita está no caderno!']);
  // receita (estrelasReceitaNova: 2; estrelasCadernoCompleto: 10)
  por('bancada.novaReceita', ['Receita nova no caderno!', 'Você ganhou duas estrelas!']);
  por('bancada.completo', ['O caderno está completo!', 'Mais dez estrelas para você!']);
  por('bancada.repetida', ['Essa você já conhece!']);
})();
