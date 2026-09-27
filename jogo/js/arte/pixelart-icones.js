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
  PA.silhueta = function (spr) {
    var src = spr.canvas || spr;
    var c = novoCanvas(src.width, src.height);
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#b9a8cc';
    ctx.fillRect(0, 0, c.width, c.height);
    return c;
  };

  /* ---------- thumbstick do toque (js/motor/entrada.js): base 22×22 e pino 10×10, na mesma grade ---------- */
  // f: fundo claro meio transparente; b/d: anel de brilho em cima e de sombra embaixo; a: as quatro setinhas;
  // no pino, c creme com brilho w em cima e sombra o embaixo
  var CONTROLE = {
    base: { p: { k: CONTORNO, f: 'rgba(255, 250, 253, 0.35)', b: 'rgba(255, 255, 255, 0.8)',
      d: 'rgba(58, 36, 70, 0.2)', a: 'rgba(58, 36, 70, 0.45)' }, d: [
      '........kkkkkk........',
      '.....kkkbbbbbbkkk.....',
      '....kbbbffffffbbbk....',
      '...kbfffffaafffffbk...',
      '..kbfffffaaaafffffbk..',
      '.kbffffffffffffffffbk.',
      '.kbffffffffffffffffbk.',
      '.kbffffffffffffffffbk.',
      'kbffffffffffffffffffbk',
      'kbffaffffffffffffaffbk',
      'kbfaaffffffffffffaafbk',
      'kbfaaffffffffffffaafbk',
      'kdffaffffffffffffaffdk',
      'kdffffffffffffffffffdk',
      '.kdffffffffffffffffdk.',
      '.kdffffffffffffffffdk.',
      '.kdffffffffffffffffdk.',
      '..kdfffffaaaafffffdk..',
      '...kdfffffaafffffdk...',
      '....kdddffffffdddk....',
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
    // mesmo tamanho na tela para qualquer grade: 18px de base vezes a escala
    return PA.paraDOM(base, PA.escalaNitida((escala || 2) * 18, base.width), 'icone-px');
  };

  /* Escala que vira um número inteiro de pixels da tela por pixel do desenho:
     assim nenhum pixel sai mais largo que o vizinho. */
  PA.escalaNitida = function (px, grade) {
    var dpr = window.devicePixelRatio || 1;
    return Math.max(1, Math.round(px * dpr / grade)) / dpr;
  };

  /* Ícone dentro de um texto: pelo menos 24px no meio de uma frase e 36px sozinho,
     crescendo com a fonte onde ela é grande (1.5em / 1.25em, como um emoji).
     Já na página, vira o tamanho nítido mais próximo. */
  PA.iconeTexto = function (emoji, sozinho) {
    var c = PA.iconeEmoji(emoji, 2);
    c.classList.add('icone-em');
    c.setAttribute('data-em', sozinho ? '1.25' : '1.5');
    c.setAttribute('data-min', sozinho ? '36' : '24');
    c.style.width = c.style.height = 'max(' + c.getAttribute('data-min') + 'px, ' + c.getAttribute('data-em') + 'em)';
    return c;
  };
  function ajustarIcone(c) {
    var fonte = parseFloat(getComputedStyle(c).fontSize);
    if (!fonte) return;
    var alvo = Math.max(parseFloat(c.getAttribute('data-min')), fonte * parseFloat(c.getAttribute('data-em')));
    var t = c.width * PA.escalaNitida(alvo, c.width);
    c.style.width = t + 'px';
    c.style.height = (c.height * t / c.width) + 'px';
  }
  function ajustarDentro(no) {
    if (no.nodeType !== 1) return;
    if (no.classList.contains('icone-em')) ajustarIcone(no);
    else if (no.firstElementChild) Array.prototype.forEach.call(no.querySelectorAll('canvas.icone-em'), ajustarIcone);
  }
  if (window.MutationObserver) {
    new MutationObserver(function (mudancas) {
      mudancas.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, ajustarDentro); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  // zoom do navegador muda o devicePixelRatio
  window.addEventListener('resize', function () { ajustarDentro(document.body); });
})();
