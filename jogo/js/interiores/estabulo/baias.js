/* Estábulo Mágico, parte 1: o desenho das baias que o estabulo.js usa (Reino._predios.estabulo): a madeira de
   cada ala, as coisinhas penduradas e a baia vazia (silhueta do adulto e o "?"). Nada de canvas no carregamento. */
(function () {
  var R = window.Reino;
  var K = R.Desenho.K;
  var B = (R._predios = R._predios || {}).estabulo = {};
  // madeira de cada ala (base, frestas, luz de cima, cor da roseta), em rodízio
  var ALAS_MADEIRA = [['#c98a52', '#a86a3c', '#e8b27a', '#ff7eb6'], ['#b8744a', '#935632', '#d9985f', '#9fdcff'],
    ['#d6a064', '#b27c44', '#f0c48a', '#9fe0a0'], ['#b98a78', '#946656', '#d8ab98', '#c9a8ff']];
  var INTERROGACAO = ['.kkkkk.', 'kwwwwwk', 'kwkkkwk', 'kkk.kwk', '..kwwwk', '..kwkkk', '..kkk..', '..kwk..', '..kkk..'];
  // coisinha pendurada na parede da baia (luz de cima): ferradura, roseta na cor da ala, baldinho, laço ou nada
  var PENDURADOS = [['kkk.kkk', 'kwk.kbk', 'kbk.kbk', 'kbkkkbk', 'kbbbbbk', '.kkkkk.'],
    ['.kkkkk.', 'kaawaak', 'kaaaaak', '.kkkkk.', '.kakak.', '.kk.kk.'],
    ['..kkk..', '.k...k.', 'kkkkkkk', 'kwwwwwk', 'kzzzzzk', '.kkkkk.'],
    ['kk...kk', 'kpk.kpk', 'kpprppk', 'kpk.kpk', 'kk...kk'], null];
  // baia vazia (§10.14): a silhueta de quem vai morar ali, do tamanho dos unicórnios das baias ocupadas (caixa de
  // 28 × 23, sem reduzir o adulto, centrada), de pé acima da porteira (py + 26): o contorno do próprio desenho fica
  // --tinta, o corpo --tinta-suave e o chifre --papel; sem asas; de lado ou na diagonal, passo e espelho pela baia n.
  // O "?" 7×9 vai num canto livre dela, com folga de 1 px da silhueta e de 3 px das divisórias.
  var poses = {}, SUAVE = [0x6b, 0x53, 0x78];
  function silhueta(m, vista, quadro, esp) {
    // chifre pintado de magenta puro só para achá-lo depois e deixá-lo em --papel (é o que diz "unicórnio")
    var semAsas = Object.assign({}, m, { id: m.id + '~silhueta', raridade: 'comum', cores: Object.assign({}, m.cores, { chifre: '#ff00ff' }) });
    var src = PA.unicornio(semAsas, 3, quadro, { vista: vista }); src = src.canvas || src; if (esp) src = PA.espelhado(src);
    var e = Math.min(1, 28 / src.width, 23 / src.height), w = Math.round(src.width * e), h = Math.round(src.height * e);
    var c = document.createElement('canvas'), cx = c.getContext('2d'); c.width = w; c.height = h;
    cx.imageSmoothingEnabled = false; cx.drawImage(src, 0, 0, w, h);
    var img = cx.getImageData(0, 0, w, h), d = img.data, k = parseInt(K.slice(1), 16);
    for (var i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      d[i + 3] = 255;
      if (d[i] > 150 && d[i + 2] > 150 && d[i + 1] < 130 && Math.abs(d[i] - d[i + 2]) < 30) { d[i] = 0xff; d[i + 1] = 0xf8; d[i + 2] = 0xee; }
      else if (((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]) !== k) { d[i] = SUAVE[0]; d[i + 1] = SUAVE[1]; d[i + 2] = SUAVE[2]; }
    }
    cx.putImageData(img, 0, 0);
    return { c: c, a: d, x: Math.round(16 - w / 2), y: 26 - h };
  }
  function poseDaBaia(m, n) {
    var chave = m.id + '|' + n % 12, esp0 = Math.floor(n / 2) % 2, vistas = n % 2 ? ['diagFrente', 'lado'] : ['lado', 'diagFrente'];
    if (chave in poses) return poses[chave];
    var achou = null, primeiro = null;
    try {
      [esp0, 1 - esp0].forEach(function (esp) { vistas.forEach(function (vista) {
        if (achou) return;
        var S = silhueta(m, vista, Math.floor(n / 4) % 3, esp), c = S.c;
        if (!primeiro) primeiro = S;
        function cheio(x, y) { x -= S.x; y -= S.y; return x >= 0 && y >= 0 && x < c.width && y < c.height && S.a[(y * c.width + x) * 4 + 3] > 0; }
        for (var qy = 1; qy <= 16 && !achou; qy++) for (var k = 0; k <= 17 && !achou; k++) {
          var qx = esp ? 21 - k : 4 + k, livre = true;
          for (var yy = qy - 1; yy <= qy + 9 && livre; yy++) for (var xx = qx - 1; xx <= qx + 7; xx++) if (cheio(xx, yy)) { livre = false; break; }
          if (livre) achou = { c: c, x: S.x, y: S.y, qx: qx, qy: qy };
        }
      }); });
    } catch (e) { achou = null; }
    if (!achou && primeiro) achou = { c: primeiro.c, x: primeiro.x, y: primeiro.y };   // nenhum canto livre: só a silhueta
    return (poses[chave] = achou);
  }

  B.ALAS_MADEIRA = ALAS_MADEIRA; B.PENDURADOS = PENDURADOS; B.INTERROGACAO = INTERROGACAO; B.poseDaBaia = poseDaBaia;
})();
