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
  // cores por raridade: o trio de Reino.config.paleta.raridade (ui.md §10.8): casca no fundo, mancha e plaquinha
  // no desenho. Chave que faltar (prévia sem config) cai na reserva, com o hex do contrato
  var RESERVA = { comum: { fundo: '#fff8ee', desenho: '#ff9cc6', texto: '#6b5378' }, raro: { fundo: '#dcebff', desenho: '#5fb4ff', texto: '#2b5ea8' }, epico: { fundo: '#eadcff', desenho: '#a66bff', texto: '#5b2aa8' }, lendario: { fundo: '#ffe39a', desenho: '#ffb020', texto: '#8a5200' } };
  var RAR = ((window.Reino && Reino.config && Reino.config.paleta) || {}).raridade || {};
  function trio(r, nome) {
    var t = RAR[r] || {}, z = RESERVA[r];
    return { base: t.fundo || z.fundo, mancha: t.desenho || z.desenho, borda: t.desenho || z.desenho, texto: t.texto || z.texto, nome: nome };
  }
  PA.CORES_RARIDADE = { comum: trio('comum', 'Comum'), raro: trio('raro', 'Raro'), epico: trio('epico', 'Épico'), lendario: trio('lendario', 'Lendário') };
  // faixa de arco-íris do ovo lendário: só brilho, nas faixas de --arco-iris (desenho)
  var ARCO = ['#ff5c6a', '#ff9f45', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
  PA.ovo = function (raridade, rachaduras) {
    var chave = 'ovo|' + raridade + '|' + rachaduras;
    if (cache[chave]) return cache[chave];
    var cr = PA.CORES_RARIDADE[raridade] || PA.CORES_RARIDADE.comum;
    var base = matriz(OVO, { a: cr.base, b: cr.mancha, w: '#ffffff' });
    var ctx = base.getContext('2d');
    if (raridade === 'lendario') {
      for (var i = 0; i < 6; i++) { ctx.fillStyle = ARCO[i]; ctx.fillRect(3 + i, 11, 1, 1); }
    }
    ctx.fillStyle = CONTORNO;
    (RACHADURAS[rachaduras] || []).forEach(function (p) { ctx.fillRect(p[0], p[1], 1, 1); });
    var c = contornar(base, CONTORNO);
    var res = { canvas: c, w: c.width, h: c.height };
    cache[chave] = res;
    return res;
  };
})();
