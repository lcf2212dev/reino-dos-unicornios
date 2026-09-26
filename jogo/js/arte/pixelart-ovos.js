/* Pixel art do ovo mágico: cores por raridade (PA.CORES_RARIDADE) e PA.ovo, com as rachaduras. */
(function () {
  var PA = window.PA, I = PA._interno;
  var CONTORNO = I.CONTORNO, cache = I.cache;
  var matriz = PA.matriz, contornar = PA.contornar;

  /* ---------- OVO ---------- */
  var OVO = [
    '....aaaa....',
    '...aaaaaa...',
    '..aawaaaaa..',
    '..awaaabaa..',
    '.aawaabbaaa.',
    '.aaaaabaaaa.',
    '.abaaaaaaba.',
    '.abbaaaaaaa.',
    '.aaaaaaabaa.',
    '.aaabaaabba.',
    '..aabbaaaa..',
    '..aaaaaaaa..',
    '...aaaaaa...',
    '....aaaa....',
  ];
  var RACHADURAS = [
    [],
    [[6, 3], [5, 4], [6, 5], [7, 6]],
    [[6, 3], [5, 4], [6, 5], [7, 6], [3, 7], [4, 8], [5, 8], [8, 7], [9, 8]],
    [[6, 3], [5, 4], [6, 5], [7, 6], [3, 7], [4, 8], [5, 8], [8, 7], [9, 8], [2, 10], [3, 10], [6, 9], [7, 10], [9, 10]],
  ];
  PA.CORES_RARIDADE = {
    comum: { base: '#fff4fa', mancha: '#ffb3d9', borda: '#ff9cc6', nome: 'Comum' },
    raro: { base: '#e3f3ff', mancha: '#5fb4ff', borda: '#4a9dff', nome: 'Raro' },
    epico: { base: '#efe4ff', mancha: '#a66bff', borda: '#8a4dff', nome: 'Épico' },
    lendario: { base: '#fff4cc', mancha: '#ffb020', borda: '#f5a300', nome: 'Lendário' },
  };
  PA.ovo = function (raridade, rachaduras) {
    var chave = 'ovo|' + raridade + '|' + rachaduras;
    if (cache[chave]) return cache[chave];
    var cr = PA.CORES_RARIDADE[raridade] || PA.CORES_RARIDADE.comum;
    var base = matriz(OVO, { a: cr.base, b: cr.mancha, w: '#ffffff' });
    var ctx = base.getContext('2d');
    if (raridade === 'lendario') {
      var arco = ['#ff6b8a', '#ffb020', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
      for (var i = 0; i < 6; i++) { ctx.fillStyle = arco[i]; ctx.fillRect(3 + i, 11, 1, 1); }
    }
    ctx.fillStyle = CONTORNO;
    (RACHADURAS[rachaduras] || []).forEach(function (p) { ctx.fillRect(p[0], p[1], 1, 1); });
    var c = contornar(base, CONTORNO);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };
})();
