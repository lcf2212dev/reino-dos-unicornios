/* Acessórios exclusivos da Pet Shop; compra/equipamento usam o cartão compartilhado da Loja. */
(function () {
  var R = Reino._ui;
  R.pintarEnfeitesPetShop = function (grade, pintar) {
    var ativo = document.activeElement;
    var foco = ativo && grade.contains(ativo) && ativo.getAttribute('data-item');
    grade.innerHTML = '';
    Reino.LojaItens.naLoja('petshop').sort(function (a, b) { return a.preco - b.preco; }).forEach(function (item) {
      grade.appendChild(R.cartaoEnfeite(item, pintar));
    });
    if (foco) R.focar(grade.querySelector('[data-item="' + foco + '"]'));
  };
})();
