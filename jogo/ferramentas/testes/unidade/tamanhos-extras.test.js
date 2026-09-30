// O tamanho "deitado" (844×390) existe a pedido, mas fica fora da lista padrão (e2e, ver e referências).
// Uso: node --test jogo/ferramentas/testes/unidade/tamanhos-extras.test.js
const test = require('node:test');
const assert = require('node:assert');
const { TAMANHOS } = require('../navegador');

test('deitado disponível, fora dos padrão', () => {
  assert.deepStrictEqual(Object.keys(TAMANHOS), ['celular', 'tablet', 'notebook']);
  assert.ok(Object.prototype.hasOwnProperty.call(TAMANHOS, 'deitado'));
  assert.deepStrictEqual(TAMANHOS.deitado.viewport, { width: 844, height: 390 });
});
