/* Laboratório de Química: os 12 tubos da bancada (Reino.QUIMICA.ingredientes). Contrato: docs/contratos/quimica.md §3.
   id (usado pelas receitas), nome (no tubo), cor (o líquido ou o pó no desenho), tipo: 'liquido' | 'po',
   fala: dita pela Doutora Proveta quando ela toca no tubo (até 30 letras, 3+ palavras). Só coisas de cozinha e
   farmácia: na vida real, experimento só com um adulto. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.ingredientes = [
    { id: 'vinagre', nome: 'Vinagre', cor: '#f3e3a2', tipo: 'liquido', fala: 'O vinagre é um ácido.' },
    { id: 'bicarbonato', nome: 'Bicarbonato', cor: '#fbfbf4', tipo: 'po', fala: 'O bicarbonato é uma base.' },
    { id: 'agua', nome: 'Água', cor: '#9fd8ff', tipo: 'liquido', fala: 'Água, a mais famosa de todas.' },
    { id: 'detergente', nome: 'Detergente', cor: '#7ee07e', tipo: 'liquido', fala: 'O detergente faz espuma.' },
    { id: 'repolho', nome: 'Repolho roxo', cor: '#8a4fc8', tipo: 'liquido', fala: 'Suco de repolho roxo!' },
    { id: 'limao', nome: 'Limão', cor: '#f6f06a', tipo: 'liquido', fala: 'O limão é bem ácido.' },
    { id: 'sal', nome: 'Sal', cor: '#f4f4ff', tipo: 'po', fala: 'Sal de cozinha, bem branquinho.' },
    { id: 'oleo', nome: 'Óleo', cor: '#f7c948', tipo: 'liquido', fala: 'O óleo é mais leve que a água.' },
    { id: 'corante', nome: 'Corante azul', cor: '#2f6bff', tipo: 'liquido', fala: 'Corante azul pinta tudo.' },
    { id: 'fermento', nome: 'Fermento', cor: '#d9b98a', tipo: 'po', fala: 'Fermento de fazer pão.' },
    { id: 'oxigenada', nome: 'Água oxigenada', cor: '#e8f6ff', tipo: 'liquido', fala: 'Água oxigenada, com cuidado!' },
    { id: 'leite', nome: 'Leite', cor: '#fffaf0', tipo: 'liquido', fala: 'Leite, cheio de gordurinha.' },
  ];
})();
