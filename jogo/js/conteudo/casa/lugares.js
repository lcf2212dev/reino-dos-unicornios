/* Casa do jogador: as 12 miniaturas de lugares famosos do Mercado da Garagem (pedidos/2026-11-19-garagem-lugares.md),
   maquetes num pedestal de madeira. `loja: 'lugares'`: só se compram, com o `preco` de cada uma em estrelas, e ficam
   fora do sorteio das salas e dos presentes (casa-moveis.js). Viram peça como os enfeites da Casa Bonita (vila.md §4);
   não vão para dentro da casa: cada um fica em pé no seu lote da Vila dos Lugares Famosos (casa/vila-lugares.js). `pais`: a legenda do
   cartão. Desenhos em js/interiores/casa/lugares-a.js e -b.js, objeto casa-movel-<id>. Todas são enfeite (sem uso,
   casa.md §13) e não giram. Ids fixos para sempre; nomes até 14 letras, sem emoji. */
(function () {
  var R = window.Reino;

  // preço em degraus pelo tamanho e pelo detalhe: 60 as de forma simples, 200 as grandes e cheias de detalhe
  [
    // 60: um cone e um triângulo
    { id: 'lugar-monte-fuji', nome: 'Monte Fuji', pais: 'Japão', preco: 60 },
    { id: 'lugar-piramides', nome: 'Pirâmides', pais: 'Egito', preco: 60 },
    // 80: torres de 1 tile
    { id: 'lugar-big-ben', nome: 'Big Ben', pais: 'Inglaterra', preco: 80 },
    { id: 'lugar-torre-pisa', nome: 'Torre de Pisa', pais: 'Itália', preco: 80 },
    // 100: as altas e finas de 1 tile
    { id: 'lugar-torre-eiffel', nome: 'Torre Eiffel', pais: 'França', preco: 100 },
    { id: 'lugar-liberdade', nome: 'Liberdade', pais: 'Estados Unidos', preco: 100 },
    // 120: morro de 2 tiles com a estátua ou o bondinho
    { id: 'lugar-cristo', nome: 'Cristo', pais: 'Brasil', preco: 120 },
    { id: 'lugar-pao-de-acucar', nome: 'Pão de Açúcar', pais: 'Brasil', preco: 120 },
    // 150: paisagem larga de 2 tiles
    { id: 'lugar-muralha', nome: 'Grande Muralha', pais: 'China', preco: 150 },
    { id: 'lugar-cataratas', nome: 'Cataratas', pais: 'Brasil', preco: 150 },
    // 200: palácio e catedral, as mais detalhadas
    { id: 'lugar-taj-mahal', nome: 'Taj Mahal', pais: 'Índia', preco: 200 },
    { id: 'lugar-sao-basilio', nome: 'São Basílio', pais: 'Rússia', preco: 200 },
  ].forEach(function (m) {
    m.objeto = 'casa-movel-' + m.id;
    m.comodo = 'garagem';
    m.direcoes = 1;
    m.loja = 'lugares';
    R.registrarMovelCasa(m);
  });
})();
