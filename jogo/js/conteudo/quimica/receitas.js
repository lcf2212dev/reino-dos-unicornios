/* Laboratório de Química: as receitas do caderno (Reino.QUIMICA.receitas). Contrato: docs/contratos/quimica.md §3.
   id, ordem (no caderno), inicial (já vem escrita no caderno), nome, emoji (com pixel art), ingredientes (ids de
   ingredientes.js; a ordem não importa; 2 ou 3), efeito (a animação da bancada: 'explosao' | 'vulcao' | 'cor' |
   'espuma-gigante' | 'dissolver' | 'camadas' | 'gotas' | 'redemoinho' | 'bolhas'), cor (o líquido no fim), cor2 (a
   2ª cor, quando o efeito tem duas), acontece (1 página: o que ela viu), explica (páginas: por que aconteceu),
   dica (1 página: a adivinha do caderno enquanto é segredo). Cada página até 30 letras, 3+ palavras. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.receitas = [
    { id: 'pof', ordem: 1, inicial: true, nome: 'POF! Explosão de confete', emoji: '💥',
      ingredientes: ['vinagre', 'bicarbonato'], efeito: 'explosao', cor: '#fff4d6', cor2: '#ffffff',
      acontece: 'POF! Saiu espuma e confete!',
      explica: ['O vinagre é um ácido.', 'O bicarbonato é uma base.', 'Juntos, eles fazem um gás.',
        'É o gás carbônico, sabia?', 'O gás empurra tudo: POF!'],
      dica: 'Um ácido e um pó branquinho.' },
  ];
})();
