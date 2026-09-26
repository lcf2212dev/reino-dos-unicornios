// Resumo do e2e: caixas de diferença (células 8×8) e classificação por região (referencias-regioes.js).
// PNGs sintéticos com pngjs, na memória (sem navegador).
// Uso: node --test jogo/ferramentas/testes/unidade/regioes.test.js
const test = require('node:test');
const assert = require('node:assert');
const { PNG } = require('pngjs');
const { pixelsDiferentes, resumir } = require('../referencias-comparar');
const { classificar, REGIOES } = require('../referencias-regioes');

// tabela de mentira: tela 100×100 px CSS com HUD no topo e dock embaixo
const TAB = { teste: { densidade: 2, hudTopo: { x: 10, y: 10, w: 80, h: 20 }, dock: { x: 30, y: 80, w: 40, h: 15 } } };
// PNG w×h (px do aparelho) branco, com retângulos pretos [x,y,w,h]
function png(w, h, manchas = []) {
  const p = new PNG({ width: w, height: h });
  p.data.fill(255);
  manchas.forEach(([x0, y0, mw, mh]) => {
    for (let y = y0; y < y0 + mh; y++) for (let x = x0; x < x0 + mw; x++) p.data.set([0, 0, 0, 255], (y * w + x) * 4);
  });
  return PNG.sync.write(p);
}

test('caixas: uma mancha vira uma caixa em px CSS (÷ densidade)', () => {
  const d = pixelsDiferentes(png(200, 200), png(200, 200, [[40, 30, 20, 10]]), null, 2);
  assert.strictEqual(d.forte, 200);
  assert.strictEqual(d.caixas.length, 1);
  // células 8×8: x 40..59 → células 5..7 (40..64 px) → 20..32 CSS; y 30..39 → células 3..4 (24..40) → 12..20
  assert.deepStrictEqual(d.caixas[0], { x: 20, y: 12, w: 12, h: 8, px: 200 });
});

test('caixas: manchas longe viram caixas separadas; vizinhas (diagonal) se juntam', () => {
  const d = pixelsDiferentes(png(200, 200), png(200, 200, [[0, 0, 4, 4], [8, 8, 4, 4], [150, 150, 5, 5]]), null, 1);
  assert.strictEqual(d.caixas.length, 2);
  assert.deepStrictEqual(d.caixas.map((c) => c.px).sort((a, b) => a - b), [25, 32]);
});

test('sem pixel forte: nenhuma caixa', () => {
  assert.deepStrictEqual(pixelsDiferentes(png(16, 16), png(16, 16), null, 1).caixas, []);
});

test('classificar: dentro do HUD, dentro do dock, fora e misturado', () => {
  const noHud = pixelsDiferentes(png(200, 200), png(200, 200, [[40, 30, 20, 10]]), null, 2).caixas;
  const fora = pixelsDiferentes(png(200, 200), png(200, 200, [[90, 110, 10, 10]]), null, 2).caixas;
  const noDock = pixelsDiferentes(png(200, 200), png(200, 200, [[80, 170, 20, 10]]), null, 2).caixas;
  assert.strictEqual(classificar(noHud, 'teste', TAB), 'hudTopo');
  assert.strictEqual(classificar(noDock, 'teste', TAB), 'dock');
  assert.strictEqual(classificar(fora, 'teste', TAB), 'outras');
  assert.strictEqual(classificar(noHud.concat(noDock), 'teste', TAB), 'outras');
  assert.strictEqual(classificar(noHud, 'sem-tabela', TAB), 'outras');
});

test('resumir: contagem por tamanho e região; só as "outras" na lista', () => {
  const r = resumir([
    { f: 'imagens/teste/a.png', caixas: [{ x: 20, y: 12, w: 12, h: 8, px: 9 }] },
    { f: 'imagens/teste/b.png', caixas: [{ x: 50, y: 50, w: 8, h: 8, px: 9 }] },
    { f: 'imagens/teste/c.png' },
  ], TAB);
  assert.strictEqual(r.total, 3);
  assert.deepStrictEqual({ ...r.porTamanho.teste, nomes: undefined }, { hudTopo: 1, dock: 0, balao: 0, outras: 2, nomes: undefined });
  assert.deepStrictEqual(r.outras.map((x) => x.f), ['imagens/teste/b.png', 'imagens/teste/c.png']);
});

test('tabela medida: os 3 tamanhos com densidade e as 3 regiões', () => {
  assert.deepStrictEqual(Object.keys(REGIOES), ['celular', 'tablet', 'notebook']);
  assert.deepStrictEqual(Object.values(REGIOES).map((t) => t.densidade), [3, 2, 1]);
  Object.values(REGIOES).forEach((t) => ['hudTopo', 'dock', 'balao'].forEach((k) => assert.ok(t[k] && t[k].w > 0 && t[k].h > 0, k)));
});
