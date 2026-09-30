/* Laboratório de Química, as telas: a bancada e a Doutora Proveta abrem a bancada de misturas; o púlpito abre o
   caderno de receitas; o microscópio e a tabela periódica abrem as telas deles (js/ui/quimica-*.js). No 2º andar,
   o fogão e a Dona Caramela abrem o Fogão dos Estados; a mesa, a Mesa de Separar; a estante, os livros.
   Contrato: docs/contratos/quimica.md §2. Só guardam funções: nada roda no carregamento. */
(function () {
  var R = window.Reino;
  function abrir(nome) { return function (acao) { var f = R.UI && R.UI[nome]; if (f) return f((acao && acao.op) || {}); }; }
  if (R.NPCs && R.NPCs.registrarTela) {
    // o convite da bancada é o mesmo texto da fala `nova` da Doutora Proveta (o mesmo áudio)
    R.NPCs.registrarTela('quimica-bancada', abrir('telaQuimicaBancada'), 'Vamos misturar poções?');
    R.NPCs.registrarTela('quimica-caderno', abrir('telaQuimicaCaderno'));
    R.NPCs.registrarTela('quimica-microscopio', abrir('telaQuimicaMicroscopio'));
    R.NPCs.registrarTela('quimica-tabela', abrir('telaQuimicaTabela'));
    // 2º andar (docs/contratos/quimica.md §9): o convite do Fogão é o mesmo texto da fala `nova` da Dona Caramela
    R.NPCs.registrarTela('quimica-estados', abrir('telaQuimicaEstados'), 'Vamos ver a água mudar?');
    R.NPCs.registrarTela('quimica-separar', abrir('telaQuimicaSeparar'));
    R.NPCs.registrarTela('quimica-livros', abrir('telaQuimicaLivros'));
  }
})();
