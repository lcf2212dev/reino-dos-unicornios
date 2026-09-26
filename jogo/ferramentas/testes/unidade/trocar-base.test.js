// Troca da base do e2e (trocar-base.js): a entrada é o base-referencia.txt de verdade (só lido).
// Uso: node --test jogo/ferramentas/testes/unidade/trocar-base.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { trocarTexto } = require('../trocar-base');

const ATUAL = fs.readFileSync(path.join(__dirname, '..', 'base-referencia.txt'), 'utf8');
const comentarios = (t) => t.split('\n').filter((l) => l.startsWith('#'));

test('troca só a linha do hash e acrescenta o comentário acima dela', () => {
  const novo = trocarTexto(ATUAL, 'abc1234', 'matéria nova no HUD');
  const antes = ATUAL.split('\n'), depois = novo.split('\n');
  const i = antes.findIndex((l) => !l.startsWith('#'));
  assert.deepStrictEqual(depois.slice(0, i), antes.slice(0, i));            // comentários byte a byte
  assert.strictEqual(depois[i], '# abc1234 = matéria nova no HUD');
  assert.strictEqual(depois[i + 1], 'abc1234');
  assert.deepStrictEqual(depois.slice(i + 2), antes.slice(i + 1));        // o que vem depois também
  assert.deepStrictEqual(comentarios(novo), comentarios(ATUAL).concat('# abc1234 = matéria nova no HUD'));
});

test('o e2e lê o hash novo (primeira linha que não começa com #)', () => {
  const novo = trocarTexto(ATUAL, 'abc1234', 'x');
  assert.strictEqual(novo.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#')), 'abc1234');
});

test('recusa descrição vazia, com quebra de linha ou com #', () => {
  assert.throws(() => trocarTexto(ATUAL, 'abc1234', ''), /descrição/);
  assert.throws(() => trocarTexto(ATUAL, 'abc1234', 'a\nb'), /uma linha/);
  assert.throws(() => trocarTexto(ATUAL, 'abc1234', 'a # b'), /#/);
});
