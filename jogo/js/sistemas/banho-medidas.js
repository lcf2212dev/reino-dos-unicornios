/* Banho (parte 3 de 3): as medidas de cada banheira. Reino._banho.medidas(banheira) → medidas ou null (forma que o
   banho não conhece: ele faz só a versão curta). A banheira vem de Reino.Banho.iniciar: { x, y, w, h, tipo, dir }
   (tiles; w e h já na pegada, trocados em 'esq'/'dir': casa.md §5.3). Tudo em px a partir do canto de cima à esquerda
   da banheira (px, py), com o banho olhando a banheira DE FRENTE no mapa:
     linha     a linha da espuma: o unicórnio fica com os pés nela, cortado dali para baixo, dentro do recorte
     recorte   [x0, y0, x1, y1] o buraco da banheira (o que fica abaixo da linha some)
     tx        x do meio do unicórnio dentro dela;  vista: vista fixa dele ({ vista, espelhar }) ou null = olha para ela
     sx, sy    de onde ele sai: x (a partir do lado de quem está ao lado, se ladoSaida) e y dos pés, no chão
     espuma    [x, y, raio] das bolhas (y a partir de espy; y < 0 = fundo da banheira, atrás dele); bolhas: x de onde sobem
     costas    quanto a escova/espuminha se afastam do meio (0 = no meio); escova: a que altura do corpo ela
               trabalha (fração da altura dele a partir dos pés: 0,5 = meio; de frente, negativo = na espuma, abaixo da cara); patinho: { casa, canto } ou null (sem patinho)
     ordem     y (a partir de py) para ordenar com ela e a cena; na casa, logo abaixo do pé da banheira (h + 1): o motor
               redesenha a banheira por cima de quem está colada nela, e o unicórnio tem que ficar na frente dela
   Formas: petshop (3×2, a da Pet Shop: sem tipo ou 'petshop-banheira'), 'casa-banheiro-banheira' em pé (baixo/cima, 2×3)
   e de lado (esq/dir, 3×2; 'dir' é a de lado espelhada). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino, I = R._banho;
  var T = 16;
  // espuma da banheira: as mesmas bolhas do desenho parado (petshop.js)
  var ESPUMA_PET = [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]];

  var FORMAS = {
    petshop: { w: 48, h: 32, linha: 4, recorte: [1, 4, 47, 32], tx: 23, vista: null, sx: 14, sy: 41, ladoSaida: false,
      espuma: ESPUMA_PET, espy: 0, bolhas: [6, 11, 38, 43], costas: 4, escova: 0.5, patinho: { casa: [25.5, -2], canto: [40.5, -1] }, ordem: 20 },
    // em pé (32×48): a água vai de x 6 a 26 e de y 2 a 31; ele fica de frente, no meio, com a espuma na barriga
    pe: { w: 32, h: 48, linha: 20, recorte: [3, 20, 29, 44], tx: 16, vista: { vista: 'frente', espelhar: false }, sx: 9, sy: 57, ladoSaida: true,
      espuma: [[9, 3, 3], [15, 1, 4], [21, 2, 3], [24, 4, 2], [11, -2, 2], [18, -3, 3], [14, 4, 2]], espy: 16, bolhas: [8, 10, 22, 24],
      costas: 0, escova: -0.15, patinho: null, ordem: 49 },
    // de lado (48×32): a água vai de x 6 a 40 e de y 2 a 16
    lado: { w: 48, h: 32, linha: 10, recorte: [3, 10, 45, 27], tx: 23, vista: null, sx: 14, sy: 41, ladoSaida: true,
      espuma: [[9, 3, 4], [15, 1, 5], [21, 2, 4], [27, 0, 5], [32, 2, 4], [37, 4, 3], [12, -2, 3], [24, -3, 3], [31, -3, 3]], espy: 6,
      bolhas: [7, 11, 36, 40], costas: 4, escova: 0.5, patinho: null, ordem: 33 },
  };

  // x de um ponto (px do pixel) espelhado na largura w; retângulo [x0, y0, x1, y1] idem
  function espelhar(f) {
    var w = f.w, c = Object.assign({}, f);
    c.recorte = [w - f.recorte[2], f.recorte[1], w - f.recorte[0], f.recorte[3]];
    c.tx = w - f.tx;
    c.espuma = f.espuma.map(function (b) { return [w - 1 - b[0], b[1], b[2]]; });
    c.bolhas = f.bolhas.map(function (x) { return w - x; });
    return c;
  }

  I.medidas = function (ban) {
    if (!ban) return null;
    var f = null;
    if (!ban.tipo || ban.tipo === 'petshop-banheira') f = FORMAS.petshop;
    else if (ban.tipo === 'casa-banheiro-banheira') {
      var dir = ban.dir || 'baixo';
      if (dir === 'esq') f = FORMAS.lado;
      else if (dir === 'dir') f = espelhar(FORMAS.lado);
      else f = FORMAS.pe;
    }
    // a da casa tem que ter a pegada da forma (outra medida = banheira que o banho não conhece)
    if (f && f !== FORMAS.petshop && !(ban.w * T === f.w && ban.h * T === f.h)) return null;
    return f;
  };
})();
