/* Casa do jogador: kits Banheiro, Quarto do jogador e Quarto do unicórnio (docs/contratos/casa.md §3). Os desenhos
   ficam em interiores/casa/moveis-banheiro.js, moveis-quarto.js e moveis-quarto-uni.js. Ids para sempre: mudar o id
   de um item faz a peça sumir do save. node: true: só guarda dados no carregamento. */
(function () {
  var R = window.Reino;

  R.registrarKitCasa({
    id: 'banheiro', nome: 'Banheiro', capa: 'casa-banheiro-banheira', comodo: 'banheiro',
    itens: [
      { id: 'banheira', nome: 'Banheira', objeto: 'casa-banheiro-banheira', direcoes: 4 },
      { id: 'vaso', nome: 'Vaso sanitário', objeto: 'casa-banheiro-vaso', direcoes: 4 },
      { id: 'pia', nome: 'Pia', objeto: 'casa-banheiro-pia', direcoes: 4 },
      { id: 'espelho', nome: 'Espelho', objeto: 'casa-banheiro-espelho', direcoes: 1, parede: true },
      { id: 'toalheiro', nome: 'Toalheiro', objeto: 'casa-banheiro-toalheiro', direcoes: 1, parede: true },
      { id: 'tapete', nome: 'Tapetinho', objeto: 'casa-banheiro-tapete', direcoes: 2 },
      { id: 'armario', nome: 'Armarinho', objeto: 'casa-banheiro-armario', direcoes: 1, parede: true },
      { id: 'cesto', nome: 'Cesto de roupa', objeto: 'casa-banheiro-cesto', direcoes: 1 },
    ],
  });

  R.registrarKitCasa({
    id: 'quarto-jogador', nome: 'Quarto {da|do} {nome}', capa: 'casa-quarto-jogador-cama', comodo: 'quarto-jogador',
    itens: [
      { id: 'cama', nome: 'Cama', objeto: 'casa-quarto-jogador-cama', direcoes: 4 },
      { id: 'guarda-roupa', nome: 'Guarda-roupa', objeto: 'casa-quarto-jogador-guarda-roupa', direcoes: 4 },
      { id: 'escrivaninha', nome: 'Escrivaninha', objeto: 'casa-quarto-jogador-escrivaninha', direcoes: 4 },
      { id: 'cadeira', nome: 'Cadeira', objeto: 'casa-quarto-jogador-cadeira', direcoes: 4 },
      { id: 'tapete', nome: 'Tapete', objeto: 'casa-quarto-jogador-tapete', direcoes: 2 },
      { id: 'criado-mudo', nome: 'Criado-mudo', objeto: 'casa-quarto-jogador-criado-mudo', direcoes: 4 },
      { id: 'estante', nome: 'Estante', objeto: 'casa-quarto-jogador-estante', direcoes: 4 },
      { id: 'espelho', nome: 'Espelho', objeto: 'casa-quarto-jogador-espelho', direcoes: 1, parede: true },
    ],
  });

  R.registrarKitCasa({
    id: 'quarto-uni', nome: 'Quarto de {uni}', capa: 'casa-quarto-uni-almofadao', comodo: 'quarto-uni',
    itens: [
      { id: 'almofadao', nome: 'Almofadão', objeto: 'casa-quarto-uni-almofadao', direcoes: 2 },
      { id: 'bebedouro', nome: 'Bebedouro', objeto: 'casa-quarto-uni-bebedouro', direcoes: 4 },
      { id: 'comedouro', nome: 'Comedouro', objeto: 'casa-quarto-uni-comedouro', direcoes: 4 },
      { id: 'tapete', nome: 'Tapete nuvem', objeto: 'casa-quarto-uni-tapete', direcoes: 2 },
      { id: 'bau', nome: 'Baú', objeto: 'casa-quarto-uni-bau', direcoes: 4 },
      { id: 'estrela', nome: 'Estrela mágica', objeto: 'casa-quarto-uni-estrela', direcoes: 1 },
      { id: 'espelho', nome: 'Espelho', objeto: 'casa-quarto-uni-espelho', direcoes: 1, parede: true },
      { id: 'cabideiro', nome: 'Porta-escovas', objeto: 'casa-quarto-uni-cabideiro', direcoes: 1 },
    ],
  });
})();
