// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético): o brilho da Aura (sistemas/aura.js) contorna a
// figura e só enfraquece para fora. Regressão de 2026-11-03 (prints do Leandro, faixa arco-íris): a 1ª faixa do halo
// (a 3 px) era mais forte que o anel 2 do contorno (a 2 px) e virava uma 2ª linha de lados retos, um retângulo de
// cantos redondos em volta dela e do unicórnio. Desenha só o brilho (Reino.Aura.itensDesenho, pintor de 1 px) num
// canvas vazio, montada e a pé, nas 5 vistas, com e sem acessórios, nas duas pontas da respiração, e mede o alfa
// pela distância (8 vizinhos, como o anel) até a figura.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/aura-brilho.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

test('aura: o brilho enfraquece para fora da figura (sem 2ª linha em volta)', async () => {
  const c = await abrirCenario({ save: 'completo', tamanho: 'celular' });
  try {
    const falhas = await c.js(`(function () {
      var P = Reino.Progresso, est = P.estado(), def = P.defUni(P.montaria()), A = Reino.Aura, J = Jogador;
      var sprites = [];
      PA.VISTAS.forEach(function (v) {
        sprites.push(['montada ' + v, PA.montada(def, 3, 0, est.aparencia, { enfeites: ['flor', 'fitinha-cauda'], capa: true, vista: v })]);
        sprites.push(['montada asas ' + v, PA.montada(def, 2, 0, est.aparencia, { enfeites: [], asasFada: true, vista: v })]);
        sprites.push(['a pé ' + v, PA.mariana(est.aparencia, false, 0, { vista: v })]);
      });
      // [décimos da Aura, t]: arco-íris e a faixa rosa (cor fixa), na respiração cheia (t = 420·π/2) e vazia (420·3π/2)
      var cheia = 420 * Math.PI / 2, vazia = 420 * 3 * Math.PI / 2;
      var casos = [[2000000000, cheia], [2000000000, vazia], [1000000, cheia], [1000000, vazia]];
      // a respiração só anda sem o "reduzir movimento" do sistema (o Chromium de teste pode vir com ele ligado)
      var guardado = est.aura, reduz = Reino.util.reduzMovimentoSistema, falhas = [];
      Reino.util.reduzMovimentoSistema = false;
      sprites.forEach(function (s) {
        var img = s[1].canvas, w = img.width, h = img.height, M = 8, W = w + 2 * M, H = h + 2 * M;
        var fd = img.getContext('2d').getImageData(0, 0, w, h).data, fig = new Uint8Array(W * H);
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (fd[(y * w + x) * 4 + 3] > 40) fig[(y + M) * W + x + M] = 1;
        // distância de cada pixel até a figura, em 8 vizinhos (0 = figura), até 6
        var dist = new Int8Array(W * H).fill(99);
        for (var i = 0; i < fig.length; i++) if (fig[i]) dist[i] = 0;
        for (var k = 1; k <= 6; k++) for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) {
          var j = yy * W + xx;
          if (dist[j] < k) continue;
          for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
            var x2 = xx + dx, y2 = yy + dy;
            if (x2 >= 0 && y2 >= 0 && x2 < W && y2 < H && dist[y2 * W + x2] === k - 1) dist[j] = k;
          }
        }
        casos.forEach(function (caso) {
          est.aura = { mariana: { d: caso[0], em: 1 } };
          var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
          var ctx = cv.getContext('2d');
          var p = { ctx: ctx, escala: 1, tela: function (x, y) { return { x: x, y: y }; },
            sprite: function (im, x, yPes) { ctx.drawImage(im, Math.round(x - im.width / 2), Math.round(yPes - im.height)); },
            ret: function (x, y, a, b, cor) { ctx.fillStyle = cor; ctx.fillRect(Math.round(x), Math.round(y), a, b); } };
          J.silhueta = { img: img, x: W / 2, yPes: M + h, linha: null };
          A.itensDesenho(p, caso[1], true).forEach(function (it) { it.desenhar(); });
          var ad = ctx.getImageData(0, 0, W, H).data, menor = [], maior = [];
          for (var q = 0; q < W * H; q++) {
            var d = dist[q], a = ad[q * 4 + 3];
            if (d < 1 || d > 6) continue;
            // os brilhinhos (branco com bracinhos, sistemas/aura.js) acendem no anel 1 e podem tocar o anel 2: fora da conta
            if (ad[q * 4] === 255 && ad[q * 4 + 1] === 255 && ad[q * 4 + 2] === 255) continue;
            menor[d] = Math.min(menor[d] === undefined ? 999 : menor[d], a);
            maior[d] = Math.max(maior[d] || 0, a);
          }
          var nome = s[0] + ' aura ' + caso[0] + ' t ' + Math.round(caso[1]);
          if (!(menor[1] > 150)) falhas.push(nome + ': anel 1 fraco demais (' + menor[1] + ')');
          if (!(menor[2] > 0)) falhas.push(nome + ': pixel a 2 px sem brilho (' + menor[2] + ')');
          // nada a 3 px ou mais pode ser mais forte que o anel 2: senão aparece a 2ª linha em volta
          for (var d3 = 3; d3 <= 6; d3++) if ((maior[d3] || 0) >= menor[2]) falhas.push(nome + ': a ' + d3 + ' px alfa ' + maior[d3] + ' ≥ anel 2 (' + menor[2] + ')');
        });
      });
      est.aura = guardado; J.silhueta = null; Reino.util.reduzMovimentoSistema = reduz;
      return falhas;
    })()`);
    assert.deepStrictEqual(falhas, [], 'o brilho da Aura não enfraquece para fora:\n' + falhas.slice(0, 20).join('\n'));
  } finally { await c.fechar(); }
});
