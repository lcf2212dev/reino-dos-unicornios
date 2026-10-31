/* Acabamento do unicórnio: a sombra que vale igual para todo molde, por cima das linhas já montadas (corpo + pernas,
   depois do estágio, do passo, do pulo e da pose cansada). PA.unicornio (pixelart-unicornio.js) chama
   PA._interno.acabarUnicornio logo antes de pintar. O resto da luz (brilho e sombra da crina, olhos com cílio e íris,
   brilho do pelo) é desenhado nos moldes (pixelart-unicornio-moldes.js).
   Luz de cima e da esquerda (arte.md §13.1): o pelo (b) que encosta no vazio à direita ou embaixo fica na
   meia-sombra (d), e o casco ganha brilho no pixel da esquerda (F); as patas que o pulo encolhe mudam junto.
   Também o olho fechado do piscar (PA._interno.piscarUnicornio, opcoes.piscando de PA.unicornio). Sem DOM. */
(function () {
  var PA = window.PA, I = PA._interno;

  function em(g, x, y) { return y >= 0 && y < g.length && x >= 0 && x < g[y].length ? g[y][x] : '.'; }

  /** Olho fechado (piscar): cada coluna do olho (e, l, i) vira pelo, menos o pixel de baixo, que vira o risco do cílio.
      @param {string[]} linhas @returns {string[]} */
  I.piscarUnicornio = function (linhas) {
    var g = linhas.map(function (l) { return l.split(''); }), OLHO = 'eli';
    for (var y = 0; y < g.length; y++) for (var x = 0; x < g[y].length; x++) {
      if (OLHO.indexOf(linhas[y][x]) < 0) continue;
      g[y][x] = OLHO.indexOf(em(linhas, x, y + 1)) >= 0 ? 'b' : 'c';
    }
    return g.map(function (r) { return r.join(''); });
  };

  /** Devolve as linhas com a meia-sombra da borda e o brilho do casco.
      @param {string[]} linhas corpo + pernas do molde @returns {string[]} */
  I.acabarUnicornio = function (linhas) {
    var o = linhas.map(function (l) { return l.split(''); });
    var g = linhas.map(function (l) { return l.split(''); });
    for (var y = 0; y < g.length; y++) for (var x = 0; x < g[y].length; x++) {
      var c = o[y][x];
      if (c === 'b' && (em(o, x + 1, y) === '.' || em(o, x, y + 1) === '.')) g[y][x] = 'd';
      else if (c === 'f' && em(o, x + 1, y) === 'f') g[y][x] = 'F';
    }
    return g.map(function (r) { return r.join(''); });
  };
})();
