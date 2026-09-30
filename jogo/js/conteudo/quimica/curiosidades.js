/* Laboratório de Química, 2º andar: as curiosidades do Salão (Reino.QUIMICA.curiosidades), contadas pelo Professor
   Carbono e pelos objetos do andar (ação quimica-curiosidade). Contrato: docs/contratos/quimica.md §9.
   { id, tema, paginas } — até 30 letras por página, 3+ palavras; cada uma com a fonte e a URL no comentário.
   Temas do contrato: cozinha, corpo, agua, ar-fogo, metais, cores, elementos, cientistas, cristais, brasil.
   Só curiosidade: não dá estrela nem mexe no save. Nada de bicho. */
(function () {
  var Q = window.Reino.QUIMICA = window.Reino.QUIMICA || {};
  Q.curiosidades = [
    // fonte: Royal Society of Chemistry — https://edu.rsc.org/
    { id: 'diamante-grafite', tema: 'cristais', paginas: ['O diamante é feito de carbono.', 'A ponta do lápis também!'] },
    // fonte: Britannica — https://www.britannica.com/place/Statue-of-Liberty
    { id: 'estatua-verde', tema: 'metais', paginas: ['Uma estátua famosa é de cobre.', 'Ela ficou verde com o tempo!'] },
  ];
})();
