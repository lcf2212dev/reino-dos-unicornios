/* Casa do jogador: os 50 enfeites da loja Casa Bonita da Vila Arco-Íris (docs/contratos/vila.md §4), 30 estrelas cada
   (config.vila.precoDecor). `loja: true`: só se compram, fora do sorteio das salas e dos presentes (casa-moveis.js).
   Viram peça com CasaMoveis.guardar('loja:<id>:<n>', id); o resto é como os móveis avulsos (casa.md §12).
   Desenhos em js/interiores/casa/moveis-loja-a.js (parede), -b.js (tapetes, plantas e luzes) e -c.js (pelúcias e
   miudezas), objeto casa-movel-<id>. Todos são enfeite (sem uso, casa.md §13). Ids fixos para sempre; nomes até 14
   letras, sem emoji. */
(function () {
  var R = window.Reino;

  [
    // Sala de Estar
    { id: 'quadro-mar', nome: 'Quadro do mar', comodo: 'estar', direcoes: 1, parede: true },
    { id: 'quadro-gato', nome: 'Quadro do gato', comodo: 'estar', direcoes: 1, parede: true },
    { id: 'tapete-redondo', nome: 'Tapete redondo', comodo: 'estar', direcoes: 1 },
    { id: 'abajur-tulipa', nome: 'Abajur tulipa', comodo: 'estar', direcoes: 1 },
    { id: 'girassois', nome: 'Girassóis', comodo: 'estar', direcoes: 1 },
    { id: 'castical', nome: 'Castiçal', comodo: 'estar', direcoes: 1 },
    { id: 'almofadas', nome: 'Almofadas', comodo: 'estar', direcoes: 1 },
    // Sala de Jantar
    { id: 'quadro-bolo', nome: 'Quadro do bolo', comodo: 'jantar', direcoes: 1, parede: true },
    { id: 'pratos-parede', nome: 'Pratinhos', comodo: 'jantar', direcoes: 1, parede: true },
    { id: 'varal-festa', nome: 'Varal de festa', comodo: 'jantar', direcoes: 1, parede: true },
    { id: 'tapete-xadrez', nome: 'Tapete xadrez', comodo: 'jantar', direcoes: 2 },
    { id: 'vaso-azul', nome: 'Vaso azul', comodo: 'jantar', direcoes: 1 },
    { id: 'jiboia', nome: 'Jiboia', comodo: 'jantar', direcoes: 1 },
    { id: 'bolo-festa', nome: 'Bolo de festa', comodo: 'jantar', direcoes: 1 },
    // Cozinha
    { id: 'relogio-maca', nome: 'Relógio-maçã', comodo: 'cozinha', direcoes: 1, parede: true },
    { id: 'quadro-cupcake', nome: 'Quadro de doce', comodo: 'cozinha', direcoes: 1, parede: true },
    { id: 'utensilios', nome: 'Utensílios', comodo: 'cozinha', direcoes: 1, parede: true },
    { id: 'tapete-limao', nome: 'Tapete limão', comodo: 'cozinha', direcoes: 2 },
    { id: 'hortinha', nome: 'Hortinha', comodo: 'cozinha', direcoes: 2 },
    { id: 'pote-biscoito', nome: 'Biscoiteira', comodo: 'cozinha', direcoes: 1 },
    { id: 'galinha', nome: 'Galinhazinha', comodo: 'cozinha', direcoes: 1 },
    { id: 'leiteira', nome: 'Leiteira', comodo: 'cozinha', direcoes: 1 },
    // Banheiro
    { id: 'quadro-farol', nome: 'Farol pintado', comodo: 'banheiro', direcoes: 1, parede: true },
    { id: 'espelho-sol', nome: 'Espelho de sol', comodo: 'banheiro', direcoes: 1, parede: true },
    { id: 'estrela-mar', nome: 'Estrela-do-mar', comodo: 'banheiro', direcoes: 1, parede: true },
    { id: 'tapete-pato', nome: 'Tapete de pato', comodo: 'banheiro', direcoes: 2 },
    { id: 'bambu', nome: 'Bambu da sorte', comodo: 'banheiro', direcoes: 1 },
    { id: 'perfumes', nome: 'Perfumes', comodo: 'banheiro', direcoes: 1 },
    { id: 'sereia', nome: 'Sereiazinha', comodo: 'banheiro', direcoes: 1 },
    // Quarto do jogador
    { id: 'mobile-estrelas', nome: 'Móbile estelar', comodo: 'quarto-jogador', direcoes: 1, parede: true },
    { id: 'quadro-castelo', nome: 'Quadro-castelo', comodo: 'quarto-jogador', direcoes: 1, parede: true },
    { id: 'tapete-coracao', nome: 'Tapete coração', comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'globo-neve', nome: 'Globo de neve', comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'cofrinho', nome: 'Porco cofrinho', comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'aquarinho', nome: 'Aquarinho', comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'coelho-pelucia', nome: 'Coelho fofo', comodo: 'quarto-jogador', direcoes: 1 },
    { id: 'caixa-musica', nome: 'Caixa musical', comodo: 'quarto-jogador', direcoes: 1 },
    // Quarto do unicórnio
    { id: 'quadro-pegaso', nome: 'Quadro-pégaso', comodo: 'quarto-uni', direcoes: 1, parede: true },
    { id: 'guirlanda', nome: 'Guirlanda', comodo: 'quarto-uni', direcoes: 1, parede: true },
    { id: 'tapete-estrela', nome: 'Tapete estrela', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'abajur-nuvem', nome: 'Abajur-nuvem', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'fardo-feno', nome: 'Fardo de feno', comodo: 'quarto-uni', direcoes: 2 },
    { id: 'balde-cenoura', nome: 'Balde da horta', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'dragao-pelucia', nome: 'Dragãozinho', comodo: 'quarto-uni', direcoes: 1 },
    // Quarto do ET
    { id: 'quadro-foguete', nome: 'Quadro-foguete', comodo: 'quarto-et', direcoes: 1, parede: true },
    { id: 'planetinhas', nome: 'Planetinhas', comodo: 'quarto-et', direcoes: 1, parede: true },
    { id: 'tapete-lua', nome: 'Tapete lunar', comodo: 'quarto-et', direcoes: 1 },
    { id: 'abajur-lava', nome: 'Abajur de lava', comodo: 'quarto-et', direcoes: 1 },
    { id: 'et-pelucia', nome: 'ET de pelúcia', comodo: 'quarto-et', direcoes: 1 },
    { id: 'rocha-espacial', nome: 'Rocha espacial', comodo: 'quarto-et', direcoes: 1 },
  ].forEach(function (m) {
    m.objeto = 'casa-movel-' + m.id;
    m.loja = true;
    R.registrarMovelCasa(m);
  });
})();
