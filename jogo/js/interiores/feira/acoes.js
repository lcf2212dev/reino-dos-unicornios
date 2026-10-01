/* Abre as instalações da Feira; a voz é carregada sob demanda. */
(function () {
  Reino.NPCs.registrarAcao('feira', function (acao) {
    Reino.Voz.carregar('interior-feira');
    Reino.UI.telaFeira({ sala: acao.sala, missao: acao.missao });
    return Promise.resolve();
  });
})();
