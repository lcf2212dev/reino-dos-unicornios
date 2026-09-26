/* Pixel art feita em código: matrizes de letras + paleta, contorno automático.
   Nada de imagens externas.
   Este arquivo é a BASE (carrega primeiro): cores, canvas, pintarMatriz/matriz, contorno,
   espelho e as 8 direções (vistas). Cria window.PA e o objeto interno PA._interno, que as
   outras partes usam (pixelart-unicornio-moldes, -unicornio, -personagens, -ovos, -icones):
     PA._interno.CONTORNO  cor do contorno automático
     PA._interno.cache     cache único de sprites (chave → sprite), de todas as partes
     PA._interno.UNI       moldes do unicórnio (pixelart-unicornio-moldes.js)
     PA._interno.usarCombo teto do cache por combinação de enfeites (pixelart-unicornio.js) */
(function () {
  var PA = {};
  var CONTORNO = '#3a2446';
  var cache = {};
  // o que as partes compartilham (não é API: fora de js/arte/pixelart-*.js, use só PA.*)
  PA._interno = { CONTORNO: CONTORNO, cache: cache };

  /* ---------- cores ---------- */
  function hexParaRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbParaHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return (v < 16 ? '0' : '') + v.toString(16);
    }).join('');
  }
  function misturar(a, b, t) {
    var x = hexParaRgb(a), y = hexParaRgb(b);
    return rgbParaHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  }
  function escurecer(c, t) { return misturar(c, '#3a2446', t); }
  function clarear(c, t) { return misturar(c, '#ffffff', t); }
  PA.cor = { misturar: misturar, escurecer: escurecer, clarear: clarear, hexParaRgb: hexParaRgb };

  /* ---------- canvas ---------- */
  function novoCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return c;
  }
  PA.novoCanvas = novoCanvas;

  // desenha uma matriz de letras em ctx (x, y), usando a paleta {letra: cor}
  function pintarMatriz(ctx, linhas, paleta, x, y, espelhar) {
    var w = linhas[0].length;
    for (var j = 0; j < linhas.length; j++) {
      var linha = linhas[j];
      if (linha.length !== w && window.console) console.warn('Sprite com linha de tamanho diferente:', j, linha);
      for (var i = 0; i < linha.length; i++) {
        var ch = linha[i];
        if (ch === '.' || ch === ' ') continue;
        var cor = paleta[ch];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(x + (espelhar ? (w - 1 - i) : i), y + j, 1, 1);
      }
    }
  }
  PA.pintarMatriz = pintarMatriz;

  function matriz(linhas, paleta) {
    var c = novoCanvas(linhas[0].length, linhas.length);
    pintarMatriz(c.getContext('2d'), linhas, paleta, 0, 0);
    return c;
  }
  PA.matriz = matriz;

  // contorno de 1px ao redor de tudo que não é transparente (4 vizinhos)
  function contornar(src, cor) {
    var w = src.width, h = src.height;
    var c = novoCanvas(w + 2, h + 2);
    var ctx = c.getContext('2d');
    var dados = src.getContext('2d').getImageData(0, 0, w, h).data;
    function cheio(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      return dados[(y * w + x) * 4 + 3] > 0;
    }
    ctx.fillStyle = cor || CONTORNO;
    for (var y = -1; y <= h; y++) {
      for (var x = -1; x <= w; x++) {
        if (cheio(x, y)) continue;
        if (cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1)) ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    ctx.drawImage(src, 1, 1);
    return c;
  }
  PA.contornar = contornar;

  function espelhado(src) {
    var c = novoCanvas(src.width, src.height);
    var ctx = c.getContext('2d');
    ctx.translate(src.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0);
    return c;
  }
  PA.espelhado = espelhado;

  /* ---------- VISTAS (8 direções) ----------
     Cada sprite tem 5 vistas desenhadas; as outras 3 direções são o espelho.
     lado: para a direita • frente: para baixo • costas: para cima
     diagFrente: para baixo e direita • diagCostas: para cima e direita */
  PA.VISTAS = ['lado', 'frente', 'costas', 'diagFrente', 'diagCostas'];
  var OITO = [
    { vista: 'lado', espelhar: false }, { vista: 'diagFrente', espelhar: false },
    { vista: 'frente', espelhar: false }, { vista: 'diagFrente', espelhar: true },
    { vista: 'lado', espelhar: true }, { vista: 'diagCostas', espelhar: true },
    { vista: 'costas', espelhar: false }, { vista: 'diagCostas', espelhar: false },
  ];
  // direção do movimento na tela (y para baixo) → vista e se é espelhada
  PA.vistaDaDirecao = function (dx, dy) {
    var oitavo = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
    return OITO[(oitavo + 8) % 8];
  };

  window.PA = PA;
})();
