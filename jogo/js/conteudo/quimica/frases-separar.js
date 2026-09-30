/* Laboratório de Química: as frases da tela separar, a Mesa de Separar Misturas (chaves 'separar.<nome>'), na voz da
   Dona Caramela (Reino.Quimica.vozDe). Contrato: docs/contratos/quimica.md §4 e §9. Até 30 letras por página, 3+ palavras.
   Número falado vem escrito (estrelas de Reino.config.quimica.estrelasMisturaNova): mudou o config, regrave. */
(function () {
  var por = window.Reino.QUIMICA.porFrase;
  // ao abrir a Mesa
  por('separar.oi', ['Escolha uma mistura!', 'Depois, uma ferramenta.']);
  // tocou numa ferramenta sem mistura escolhida
  por('separar.semMistura', ['Primeiro, escolha a mistura!']);
  // ferramenta que não serve: nunca é erro, só outra tentativa
  por('separar.naoSepara', ['Hum, assim não separa bem.', 'Vamos tentar outra?']);
  // 1ª vez de cada mistura (estrelasMisturaNova: 1) e todas as 6
  por('separar.nova', ['Uma estrela nova para você!']);
  por('separar.todas', ['Você separou todas!', 'Que trabalho caprichado!']);
  // a mistura já separada antes
  por('separar.repetida', ['Essa você já sabe separar!']);
})();
