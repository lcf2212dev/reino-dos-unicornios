// Testes de unidade: o recorte do `npm run ver --recorte` / cenario.foto({ recorte }) (recortarPng). Recorte que sai
// pela borda de cima/esquerda (x ou y negativo) fica só com a parte dentro da imagem: antes o x/y ia a 0 mas a
// largura/altura não descontava o que ficou de fora (o recorte saía deslocado, com pixels não pedidos); e recorte
// todo fora da imagem dava um erro obscuro do PNG em vez de "--recorte fora da imagem".
// Rodar (em jogo/): node --test ferramentas/testes/unidade/ver-recorte.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { recortarPng } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'ver-recorte-'));
// imagem 40×20: vermelho = coluna x, verde = linha y (para saber de onde veio cada pixel)
const img = new PNG({ width: 40, height: 20 });
for (let y = 0; y < 20; y++) for (let x = 0; x < 40; x++) { const i = (y * 40 + x) * 4; img.data[i] = x; img.data[i + 1] = y; img.data[i + 3] = 255; }
const base = path.join(pasta, 'base.png');
fs.writeFileSync(base, PNG.sync.write(img));
const recorte = (r, nome) => PNG.sync.read(fs.readFileSync(recortarPng(base, r, path.join(pasta, nome + '.png'))));
const px = (p, x, y) => [p.data[(y * p.width + x) * 4], p.data[(y * p.width + x) * 4 + 1]];

test('recorte [-10, 0, 20, 5]: só as colunas 0..9 (o que está dentro da imagem)', () => {
  const out = recorte([-10, 0, 20, 5], 'x-neg');
  assert.strictEqual(out.width, 10, `largura ${out.width}: pegou as colunas 0..${out.width - 1}, e o pedido só cobre 0..9`);
  assert.strictEqual(out.height, 5);
  assert.deepStrictEqual(px(out, 9, 4), [9, 4]);
});
test('recorte [3, -4, 6, 10]: só as linhas 0..5', () => {
  const out = recorte([3, -4, 6, 10], 'y-neg');
  assert.deepStrictEqual([out.width, out.height], [6, 6]);
  assert.deepStrictEqual(px(out, 0, 0), [3, 0]);
});
test('recorte dentro da imagem não muda; o que passa da borda de baixo/direita é cortado', () => {
  const out = recorte([30, 15, 20, 20], 'dir');
  assert.deepStrictEqual([out.width, out.height], [10, 5]);
  assert.deepStrictEqual(px(out, 0, 0), [30, 15]);
});
for (const r of [[-30, 0, 20, 5], [50, 0, 10, 5], [0, 25, 10, 5]]) {
  test(`recorte ${JSON.stringify(r)} todo fora da imagem: erro claro`, () => {
    assert.throws(() => recorte(r, 'fora'), /--recorte fora da imagem/);
  });
}
