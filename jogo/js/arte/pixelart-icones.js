/* Ícones em pixel art e utilidades para a interface (DOM): desenhos de window.ICONES
   (js/arte/icones/*.js) como canvas (PA.iconeDesenho, PA.iconeMenu), emoji sem desenho reduzido
   a uma grade (PA.iconeEmoji), PA.paraDOM, PA.silhueta, PA.escalaNitida e o ícone dentro de texto
   (PA.iconeTexto), que um MutationObserver ajusta ao tamanho da fonte, e o thumbstick do toque (PA.controle). */
(function () {
  var PA = window.PA, I = PA._interno;
  var CONTORNO = I.CONTORNO, cache = I.cache;
  var novoCanvas = PA.novoCanvas, matriz = PA.matriz, contornar = PA.contornar;

  /* ---------- ícones (desenhos 16x16 de js/arte/icones/*.js, já com contorno) ---------- */
  function iconeDesenhado(chave) {
    var ic = window.ICONES && window.ICONES[chave];
    if (!ic) return null;
    if (!cache['icone|' + chave]) cache['icone|' + chave] = matriz(ic.d, ic.p);
    return cache['icone|' + chave];
  }
  PA.iconeMenu = function (id) { return iconeDesenhado('menu:' + id); };
  PA.iconeDesenho = iconeDesenhado;   // qualquer chave de window.ICONES (ex.: 'doc:rg', 'acessorio:pena-magica')

  /* ---------- utilidades para a interface (DOM) ---------- */
  // devolve um <canvas> ampliado com pixels nítidos para usar em cartões
  PA.paraDOM = function (spr, escala, classe) {
    var src = spr.canvas || spr;
    var c = novoCanvas(src.width, src.height);
    c.getContext('2d').drawImage(src, 0, 0);
    c.className = 'pixel ' + (classe || '');
    c.style.width = (src.width * escala) + 'px';
    c.style.height = (src.height * escala) + 'px';
    return c;
  };
  // trancado/vazio (arte.md §14): miolo em --tinta-suave e borda (pixel com vizinho vazio) em --tinta; mesmo tamanho
  PA.silhueta = function (spr) {
    var src = spr.canvas || spr, w = src.width, h = src.height;
    var c = novoCanvas(w, h), ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    var img = ctx.getImageData(0, 0, w, h), d = img.data, a = new Uint8Array(w * h);
    for (var i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    function cheio(x, y) { return x >= 0 && y >= 0 && x < w && y < h && a[y * w + x]; }
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (!a[y * w + x]) continue;
      var borda = !cheio(x - 1, y) || !cheio(x + 1, y) || !cheio(x, y - 1) || !cheio(x, y + 1);
      var k = (y * w + x) * 4;
      d[k] = borda ? 0x3a : 0x6b; d[k + 1] = borda ? 0x24 : 0x53; d[k + 2] = borda ? 0x46 : 0x78; d[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  };

  /* ---------- thumbstick do toque (js/motor/entrada.js): base 22×22 e pino 10×10, na mesma grade ---------- */
  // f: miolo de tinta meio transparente (aparece na calçada clara); b/d: brilho do anel em cima e embaixo
  // (o anel aparece até na água funda); w: as quatro setinhas brancas com contorno;
  // no pino, c creme com brilho w em cima e sombra o embaixo
  var CONTROLE = {
    base: { p: { k: CONTORNO, f: 'rgba(58, 36, 70, 0.25)', b: 'rgba(255, 255, 255, 0.9)',
      d: 'rgba(255, 255, 255, 0.9)', w: '#ffffff' }, d: [
      '........kkkkkk........',
      '.....kkkbbbbbbkkk.....',
      '....kbbbffkkffbbbk....',
      '...kbffffkwwkffffbk...',
      '..kbffffkwwwwkffffbk..',
      '.kbfffffkkkkkkfffffbk.',
      '.kbffffffffffffffffbk.',
      '.kbffffffffffffffffbk.',
      '.kbffffffffffffffffbk.',
      'kbfffkffffffffffkfffbk',
      'kbffkwkffffffffkwkffbk',
      'kbfkwwkffffffffkwwkfbk',
      'kbfkwwkffffffffkwwkfbk',
      'kdffkwkffffffffkwkffdk',
      'kdfffkffffffffffkfffdk',
      '.kdffffffffffffffffdk.',
      '.kdfffffkkkkkkfffffdk.',
      '..kdffffkwwwwkffffdk..',
      '...kdffffkwwkffffdk...',
      '....kdddffkkffdddk....',
      '.....kkkddddddkkk.....',
      '........kkkkkk........'] },
    pino: { p: { k: CONTORNO, c: '#fff1d0', w: '#ffffff', o: '#f0a04a' }, d: [
      '...kkkk...',
      '.kkcccckk.',
      '.kcwwccck.',
      'kcwcccccok',
      'kcccccccok',
      'kcccccccok',
      'kccccccook',
      '.kooooook.',
      '.kkooookk.',
      '...kkkk...'] }
  };
  PA.controle = function (parte) {
    var k = 'controle|' + parte;
    if (!cache[k]) cache[k] = matriz(CONTROLE[parte].d, CONTROLE[parte].p);
    return cache[k];
  };

  /* Um emoji vira pixel art: desenho próprio; se ainda não houver, o glifo reduzido a uma grade. */
  var cacheIcone = {};
  function desenharEmojiPixel(emoji) {
    var N = 64, G = 16;
    var c = novoCanvas(N, N);
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, N, N);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '54px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.fillText(emoji, N / 2, N / 2 + 2);
    var dados = ctx.getImageData(0, 0, N, N).data;
    var out = novoCanvas(G, G);
    var o = out.getContext('2d');
    var passo = N / G;
    var algum = false;
    for (var y = 0; y < G; y++) {
      for (var x = 0; x < G; x++) {
        var r = 0, g = 0, b = 0, n = 0;
        for (var yy = 1; yy < passo; yy += 2) {
          for (var xx = 1; xx < passo; xx += 2) {
            var i = (((y * passo + yy) | 0) * N + ((x * passo + xx) | 0)) * 4;
            if (dados[i + 3] > 50) { r += dados[i]; g += dados[i + 1]; b += dados[i + 2]; n++; }
          }
        }
        if (n < 2) continue;
        algum = true;
        r = Math.round(r / n / 48) * 48;
        g = Math.round(g / n / 48) * 48;
        b = Math.round(b / n / 48) * 48;
        o.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        o.fillRect(x, y, 1, 1);
      }
    }
    if (!algum) return null;
    return contornar(out, CONTORNO);
  }
  PA.iconeEmoji = function (emoji, escala) {
    var chave = emoji.replace(/\uFE0F/g, '');
    var base = iconeDesenhado(chave) || cacheIcone[chave];
    if (!base) {
      base = desenharEmojiPixel(emoji);
      if (!base) {
        var vazio = novoCanvas(12, 12);
        var vx = vazio.getContext('2d');
        vx.fillStyle = '#7c5cff';
        vx.fillRect(1, 1, 10, 10);
        vx.fillStyle = '#fff8ee';
        vx.fillRect(4, 3, 4, 6);
        base = contornar(vazio, CONTORNO);
      } else cacheIcone[chave] = base;
    }
    // mesmo tamanho na tela para qualquer grade: 16 px de base vezes a escala
    return PA.paraDOM(base, PA.escalaNitida((escala || 2) * 16, base.width), 'icone-px');
  };

  /* Escala par em px CSS por pixel do desenho (arte.md §10.7): o par mais perto do alvo, nunca menos de 2;
     assim nenhum pixel sai mais largo que o vizinho. */
  PA.escalaNitida = function (px, grade) {
    return 2 * Math.max(1, Math.round(px / grade / 2));
  };

  /* Ícone dentro de um texto: 32 px (2 px CSS por pixel, como a letra de 16 px), no meio da frase ou sozinho
     (arte.md §10.5). */
  PA.iconeTexto = function (emoji) {
    var c = PA.iconeEmoji(emoji, 2);
    c.classList.add('icone-em');
    return c;
  };
})();
