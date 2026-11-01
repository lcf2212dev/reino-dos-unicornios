/* Casa do jogador: os móveis avulsos, um à escolha por sala feita (docs/contratos/casa.md §12). 41 móveis (um por
   sala do 4º bimestre: 25 de Língua Portuguesa e 13 de Inglês, mais 3 camas), divididos pelos cômodos; `comodo` = a aba do modo
   decorar. Desenhos em js/interiores/casa/moveis-salas-<cômodo>.js (objeto casa-movel-<id>).
   Ids fixos para sempre: mudar um id faz o móvel sumir do save. Nomes até 14 letras, sem emoji. */
(function () {
  var R = window.Reino;

  [
    // Sala de Estar
    { id: 'aquario', nome: 'Aquário', objeto: 'casa-movel-aquario', comodo: 'estar', direcoes: 1 },
    { id: 'piano', nome: 'Piano', objeto: 'casa-movel-piano', comodo: 'estar', direcoes: 4 },
    { id: 'lareira', nome: 'Lareira', objeto: 'casa-movel-lareira', comodo: 'estar', direcoes: 1 },
    { id: 'relogio-cuco', nome: 'Relógio cuco', objeto: 'casa-movel-relogio-cuco', comodo: 'estar', direcoes: 1, parede: true },
    { id: 'pufe', nome: 'Pufe', objeto: 'casa-movel-pufe', comodo: 'estar', direcoes: 1 },
    { id: 'vitrola', nome: 'Vitrola', objeto: 'casa-movel-vitrola', comodo: 'estar', direcoes: 4 },
    { id: 'vitral', nome: 'Vitral', objeto: 'casa-movel-vitral', comodo: 'estar', direcoes: 1, parede: true },
    // Sala de Jantar
    { id: 'aparador', nome: 'Aparador', objeto: 'casa-movel-aparador', comodo: 'jantar', direcoes: 4 },
    { id: 'vaso-flores', nome: 'Vaso de flores', objeto: 'casa-movel-vaso-flores', comodo: 'jantar', direcoes: 1 },
    { id: 'relogio-pe', nome: 'Relógio de pé', objeto: 'casa-movel-relogio-pe', comodo: 'jantar', direcoes: 1 },
    { id: 'jogo-cha', nome: 'Jogo de chá', objeto: 'casa-movel-jogo-cha', comodo: 'jantar', direcoes: 1 },
    { id: 'quadro-uvas', nome: 'Quadro de uvas', objeto: 'casa-movel-quadro-uvas', comodo: 'jantar', direcoes: 1, parede: true },
    { id: 'banco', nome: 'Banco estofado', objeto: 'casa-movel-banco', comodo: 'jantar', direcoes: 2 },
    // Cozinha
    { id: 'sorveteira', nome: 'Sorveteira', objeto: 'casa-movel-sorveteira', comodo: 'cozinha', direcoes: 4 },
    { id: 'lixeira', nome: 'Lixeira', objeto: 'casa-movel-lixeira', comodo: 'cozinha', direcoes: 1 },
    { id: 'prateleira', nome: 'Prateleira', objeto: 'casa-movel-prateleira', comodo: 'cozinha', direcoes: 1, parede: true },
    { id: 'cesta-paes', nome: 'Cesta de pães', objeto: 'casa-movel-cesta-paes', comodo: 'cozinha', direcoes: 1 },
    { id: 'filtro', nome: 'Filtro de água', objeto: 'casa-movel-filtro', comodo: 'cozinha', direcoes: 1 },
    { id: 'panelas', nome: 'Panelas', objeto: 'casa-movel-panelas', comodo: 'cozinha', direcoes: 1, parede: true },
    // Banheiro
    { id: 'patinhos', nome: 'Patinhos', objeto: 'casa-movel-patinhos', comodo: 'banheiro', direcoes: 1 },
    { id: 'samambaia', nome: 'Samambaia', objeto: 'casa-movel-samambaia', comodo: 'banheiro', direcoes: 1 },
    { id: 'toalhas', nome: 'Toalhas', objeto: 'casa-movel-toalhas', comodo: 'banheiro', direcoes: 1 },
    { id: 'balanca', nome: 'Balança', objeto: 'casa-movel-balanca', comodo: 'banheiro', direcoes: 1 },
    { id: 'quadro-concha', nome: 'Quadro concha', objeto: 'casa-movel-quadro-concha', comodo: 'banheiro', direcoes: 1, parede: true },
    { id: 'banco-banho', nome: 'Banco de banho', objeto: 'casa-movel-banco-banho', comodo: 'banheiro', direcoes: 2 },
    // Quarto do jogador
    { id: 'penteadeira', nome: 'Penteadeira', objeto: 'casa-movel-penteadeira', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'casa-boneca', nome: 'Casa de boneca', objeto: 'casa-movel-casa-boneca', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'brinquedos', nome: 'Brinquedos', objeto: 'casa-movel-brinquedos', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'uni-balanco', nome: 'Uni de balanço', objeto: 'casa-movel-uni-balanco', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'ursao', nome: 'Ursão', objeto: 'casa-movel-ursao', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'lousa', nome: 'Lousa', objeto: 'casa-movel-lousa', comodo: 'quarto-jogador', direcoes: 1, parede: true },
    { id: 'globo', nome: 'Globo', objeto: 'casa-movel-globo', comodo: 'quarto-jogador', direcoes: 1 },
    // Quarto do unicórnio
    { id: 'fontinha', nome: 'Fontinha', objeto: 'casa-movel-fontinha', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'arco-iris', nome: 'Arco-íris', objeto: 'casa-movel-arco-iris', comodo: 'quarto-uni', direcoes: 1, parede: true },
    { id: 'ferradura', nome: 'Ferradura', objeto: 'casa-movel-ferradura', comodo: 'quarto-uni', direcoes: 1, parede: true },
    { id: 'luminaria-lua', nome: 'Luminária lua', objeto: 'casa-movel-luminaria-lua', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'cesto-macas', nome: 'Cesto de maçãs', objeto: 'casa-movel-cesto-macas', comodo: 'quarto-uni', direcoes: 1 },
    { id: 'cristal', nome: 'Cristal mágico', objeto: 'casa-movel-cristal', comodo: 'quarto-uni', direcoes: 1 },
    // camas (pedido de 01/11/2026): duas para o quarto dela, uma para o do unicórnio
    { id: 'cama-dossel', nome: 'Cama de dossel', objeto: 'casa-movel-cama-dossel', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'beliche', nome: 'Beliche', objeto: 'casa-movel-beliche', comodo: 'quarto-jogador', direcoes: 4 },
    { id: 'caminha-nuvem', nome: 'Caminha nuvem', objeto: 'casa-movel-caminha-nuvem', comodo: 'quarto-uni', direcoes: 2 },
  ].forEach(function (m) { R.registrarMovelCasa(m); });
})();
