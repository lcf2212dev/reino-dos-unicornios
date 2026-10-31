/* Casa do jogador: os kits "Sala de Estar", "Sala de Jantar" e "Cozinha" (casa.md §3). Os desenhos estão em
   js/interiores/casa/moveis-<kit>.js. Ids fixos para sempre: mudar um id faz a peça sumir do save. */
(function () {
  var R = window.Reino;

  R.registrarKitCasa({
    id: 'estar', nome: 'Sala de Estar', capa: 'casa-estar-sofa', comodo: 'estar',
    itens: [
      { id: 'sofa', nome: 'Sofá', objeto: 'casa-estar-sofa', direcoes: 4 },
      { id: 'poltrona', nome: 'Poltrona', objeto: 'casa-estar-poltrona', direcoes: 4 },
      { id: 'mesa-centro', nome: 'Mesa de centro', objeto: 'casa-estar-mesa-centro', direcoes: 2 },
      { id: 'tapete', nome: 'Tapete', objeto: 'casa-estar-tapete', direcoes: 2 },
      { id: 'estante-tv', nome: 'Estante com TV', objeto: 'casa-estar-estante-tv', direcoes: 4 },
      { id: 'luminaria', nome: 'Luminária', objeto: 'casa-estar-luminaria', direcoes: 1 },
      { id: 'planta', nome: 'Vaso de planta', objeto: 'casa-estar-planta', direcoes: 1 },
      { id: 'quadro', nome: 'Quadro', objeto: 'casa-estar-quadro', direcoes: 1, parede: true },
    ],
  });

  R.registrarKitCasa({
    id: 'jantar', nome: 'Sala de Jantar', capa: 'casa-jantar-mesa', comodo: 'jantar',
    itens: [
      { id: 'mesa', nome: 'Mesa de jantar', objeto: 'casa-jantar-mesa', direcoes: 2 },
      { id: 'cadeira', nome: 'Cadeira', objeto: 'casa-jantar-cadeira', qtd: 4, direcoes: 4 },
      { id: 'cristaleira', nome: 'Cristaleira', objeto: 'casa-jantar-cristaleira', direcoes: 4 },
      { id: 'tapete', nome: 'Tapete', objeto: 'casa-jantar-tapete', direcoes: 2 },
      { id: 'quadro', nome: 'Quadro', objeto: 'casa-jantar-quadro', direcoes: 1, parede: true },
    ],
  });

  R.registrarKitCasa({
    id: 'cozinha', nome: 'Cozinha', capa: 'casa-cozinha-fogao', comodo: 'cozinha',
    itens: [
      { id: 'fogao', nome: 'Fogão', objeto: 'casa-cozinha-fogao', direcoes: 4 },
      { id: 'geladeira', nome: 'Geladeira', objeto: 'casa-cozinha-geladeira', direcoes: 4 },
      { id: 'pia', nome: 'Pia', objeto: 'casa-cozinha-pia', direcoes: 4 },
      { id: 'armario', nome: 'Armário', objeto: 'casa-cozinha-armario', direcoes: 4 },
      { id: 'mesinha', nome: 'Mesinha', objeto: 'casa-cozinha-mesinha', direcoes: 1 },
      { id: 'banquinho', nome: 'Banquinho', objeto: 'casa-cozinha-banquinho', qtd: 2, direcoes: 1 },
      { id: 'fruteira', nome: 'Fruteira', objeto: 'casa-cozinha-fruteira', direcoes: 1 },
    ],
  });
})();
