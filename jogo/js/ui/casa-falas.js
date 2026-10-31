/* Falas do Claude nas telas da casa (docs/contratos/casa.md §10): o baú (ui/bau-casa.js), a escolha do kit
   (ui/casa-kits.js) e a do móvel de cada sala (ui/casa-moveis.js). Arquivo à parte, sem DOM, para carregar também
   no Node (listar-falas.js grava as vozes). */
(function () {
  var R = window.Reino;
  R.CasaFalas = {
    chegou: 'Vamos abrir o baú?',   // a mesma dos cartões (sistemas/cartoes.js): um áudio só
    casa: 'Uma casa só sua!', perto: 'Fica perto do Observatório!',
    escolha: 'Escolha um kit de móveis!', ganhou: 'Kit novo na sua casa!',
    movel: 'Escolha um móvel novo!', movelGanhou: 'Móvel novo na sua casa!',   // ui/casa-moveis.js
  };
  var F = R.CasaFalas;
  R.registrarModulo({ id: 'casa-bau', falas: function () { return [{ texto: F.casa }, { texto: F.perto }]; } });
  R.registrarModulo({ id: 'casa-kits', falas: function () { return [{ texto: F.escolha }, { texto: F.ganhou }]; } });
  R.registrarModulo({ id: 'casa-moveis-tela', falas: function () { return [{ texto: F.movel }, { texto: F.movelGanhou }]; } });
})();
