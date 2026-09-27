// Desenho de fora no mapa: a porta desenhada tem de ficar no tile da porta de verdade (x + floor(w/2) da
// última fileira do rect, mundo/mapa.js porta()), onde ficam o portão da cerquinha e o caminho. A Torre dos
// Números (matematica/fora.js) centra a porta em px + w/2: com 4 tiles de largura ela sai meio tile à esquerda.
const test = require('node:test');
const assert = require('node:assert');
const { montar, ctxAnotador } = require('./ajudantes/predios');

// [sprite, largura em tiles do rect do lugar de hoje]
const CASOS = [['numeros', 4, 'matematica'], ['caminhos', 5, 'geografia'], ['palavras', 5, 'portugues']];

for (const [sprite, wt, materia] of CASOS) {
  test(`porta de fora de ${sprite} no meio do tile da porta`, () => {
    const { R, janela, fachada } = montar({ mapa: true });
    assert.strictEqual(R.materia(materia).lugar.rect.w, wt, 'largura do rect de hoje');
    const desenhar = janela.Mapa.PREDIOS[sprite];
    assert.ok(desenhar, 'desenho registrado');
    const px = 1000, py = 500, w = wt * 16, h = 80;
    fachada.chamadas.length = 0;
    desenhar(ctxAnotador(), px, py, w, h, {});
    const p = fachada.chamadas.find((c) => c.f === 'porta');
    assert.ok(p, 'desenha a porta com Mapa.fachada.porta');
    const meioDesenhado = p.a[1] + p.a[3] / 2;               // (ctx, x, y, w, …)
    const meioDoTile = px + Math.floor(wt / 2) * 16 + 8;
    assert.strictEqual(meioDesenhado, meioDoTile, `porta desenhada em ${meioDesenhado - px} px; o tile da porta tem o meio em ${meioDoTile - px} px`);
  });
}
