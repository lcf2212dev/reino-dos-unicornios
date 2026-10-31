/* Acabamento da personagem (a Mariana e quem joga): rosto, luz e sombra por cima das linhas já montadas
   (cabeça + corpo, depois do corte, da roupa e do laço do Salão), igual em todo corte, roupa, vista, passo, sentada
   e montada. PA.mariana (pixelart-personagens.js) chama PA._interno.acabarMariana logo antes de pintar.
   Luz de cima e da esquerda (arte.md §13.1): brilho no alto do cabelo e à esquerda; sombra à direita e embaixo.
   - olhos de 2 px de altura (o de baixo empurra a bochecha para fora) e a boquinha de frente e de lado;
   - a franja faz sombra na testa (pele na sombra logo embaixo do cabelo);
   - cabelo: brilho em arco no alto, sombra na borda direita e embaixo;
   - pele, roupa e sapato: a coluna da direita de cada peça na sombra, o sapato com brilho à esquerda.
   Letras novas da paleta (pixelart-personagens.js): h cabelo na sombra, I brilho do cabelo, k pele na sombra, m boca,
   s brilho do sapato, N roupa clara na sombra (W). Também o olho fechado do piscar (PA._interno.piscarMariana). Sem DOM. */
(function () {
  var PA = window.PA, I = PA._interno;

  var CABELO = 'HLhIB', TECIDO = 'CDAMWNJQOVTG';
  // sombra de cada tecido: a mesma peça um tom abaixo
  var SOMBRA_TECIDO = { C: 'D', D: 'A', M: 'C', W: 'N', O: 'V' };
  // brilho do cabelo (arco no alto, à esquerda do meio): [x, y] por vista; só onde ainda é cabelo liso (H)
  var BRILHO = {
    frente: [[4, 1], [5, 1], [6, 1], [3, 2]],
    costas: [[5, 1], [6, 1], [7, 1], [4, 2]],
    lado: [[4, 1], [5, 1], [6, 1], [3, 2]],
    diagFrente: [[4, 1], [5, 1], [6, 1], [3, 2]],
    diagCostas: [[5, 1], [6, 1], [7, 1], [4, 2]],
  };
  var PAPEIS_PE = ['ombro', 'tronco', 'tronco', 'cintura', 'saia', 'perna', 'perna', 'pe'];
  var PAPEIS_SENTADA = ['ombro', 'tronco', 'cintura', 'saia', 'coxa', 'perna', 'pe'];
  var CABECA = 7;   // linhas 0–6: cabeça; 7 em diante: corpo

  function em(g, x, y) { return y >= 0 && y < g.length && x >= 0 && x < g[y].length ? g[y][x] : '.'; }

  // olhos de 2 px: o de baixo entra na pele; onde estava a bochecha, ela vai 1 px para fora (o lado longe do meio)
  function olhos(g, o) {
    var meio = (g[0].length - 1) / 2;
    for (var y = 0; y < CABECA - 1; y++) for (var x = 0; x < g[y].length; x++) {
      if (o[y][x] !== 'E') continue;
      var de = o[y + 1][x];
      if (de === 'K') g[y + 1][x] = 'E';
      else if (de === 'R') {
        g[y + 1][x] = 'E';
        var fora = x + (x < meio ? -1 : 1);
        if (em(o, fora, y + 1) === 'K') g[y + 1][fora] = 'R';
      }
    }
  }
  // boquinha: de frente e em 3/4 de frente entre os olhos, de lado 1 px à frente do olho; 2 linhas abaixo do olho
  function boca(g, o, vista) {
    if (vista === 'costas' || vista === 'diagCostas') return;
    for (var y = 0; y < CABECA - 2; y++) {
      var xs = [];
      for (var x = 0; x < o[y].length; x++) if (o[y][x] === 'E') xs.push(x);
      if (!xs.length) continue;
      var bx = xs.length >= 2 ? Math.ceil((xs[0] + xs[xs.length - 1]) / 2) : xs[0] + 1, by = y + 2;
      if (by < CABECA && 'Kk'.indexOf(g[by][bx]) >= 0) g[by][bx] = 'm';
      return;
    }
  }

  /** Olho fechado (piscar): o pixel de cima de cada olho vira pele; fica o risco de baixo.
      @param {string[]} linhas já com o acabamento @returns {string[]} */
  I.piscarMariana = function (linhas) {
    var g = linhas.map(function (l) { return l.split(''); });
    for (var y = 0; y < CABECA - 1; y++) for (var x = 0; x < g[y].length; x++) {
      if (linhas[y][x] === 'E' && linhas[y + 1][x] === 'E') g[y][x] = 'K';
    }
    return g.map(function (r) { return r.join(''); });
  };

  /** Devolve as linhas com o acabamento (rosto, luz e sombra).
      @param {string[]} linhas cabeça (7) + corpo @param {string} vista @param {boolean} sentada */
  I.acabarMariana = function (linhas, vista, sentada) {
    var o = linhas.map(function (l) { return l.split(''); });
    var g = linhas.map(function (l) { return l.split(''); });
    var papeis = sentada ? PAPEIS_SENTADA : PAPEIS_PE;
    olhos(g, o);
    boca(g, o, vista);
    for (var y = 0; y < g.length; y++) for (var x = 0; x < g[y].length; x++) {
      var c = o[y][x], dir = em(o, x + 1, y), baixo = em(o, x, y + 1), cima = em(o, x, y - 1);
      var papel = y >= CABECA ? papeis[y - CABECA] : 'cabeca';
      if (g[y][x] !== c) continue;   // já mexido (olho, boca)
      var canto = CABELO.indexOf(em(o, x - 1, y)) >= 0 || CABELO.indexOf(dir) >= 0;
      // a franja faz sombra nos cantos da testa
      if (c === 'K' && y < CABECA && CABELO.indexOf(cima) >= 0 && canto) g[y][x] = 'k';
      // cabelo: a borda de baixo e a da direita (abaixo do alto da cabeça)
      else if (c === 'H' && (baixo === '.' || (dir === '.' && y >= 3))) g[y][x] = 'h';
      // braço e perna: o lado da sombra
      else if (c === 'K' && y >= CABECA && dir === '.') g[y][x] = 'k';
      // sapato: brilho no pixel da esquerda
      else if (c === 'S' && dir === 'S') g[y][x] = 's';
      // roupa (sem as pernas e os pés): a borda da direita, um tom abaixo
      else if (SOMBRA_TECIDO[c] && papel !== 'perna' && papel !== 'pe' && TECIDO.indexOf(dir) < 0) g[y][x] = SOMBRA_TECIDO[c];
    }
    (BRILHO[vista] || []).forEach(function (p) { if (em(o, p[0], p[1]) === 'H') g[p[1]][p[0]] = 'I'; });
    return g.map(function (r) { return r.join(''); });
  };
})();
