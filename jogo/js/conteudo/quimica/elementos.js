/* Laboratório de Química: os cartões dos elementos (Reino.QUIMICA.elementos) e as famílias (cores do mapa da
   tabela). Contrato: docs/contratos/quimica.md §3. Cartões: z (número atômico), simbolo, nome, familia (chave de
   familias), onde (1 página: onde a gente encontra), curiosidade (páginas). Símbolo só na tela: a voz fala por extenso.
   Cada página até 30 letras, 3+ palavras. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.familias = {
    'nao-metal': { nome: 'Não metais', cor: '#7ee07e' },
  };
  Q.elementos = [
    { z: 1, simbolo: 'H', nome: 'Hidrogênio', familia: 'nao-metal',
      onde: 'Está na água e nas estrelas.', curiosidade: ['É o elemento mais leve.'] },
  ];
})();
