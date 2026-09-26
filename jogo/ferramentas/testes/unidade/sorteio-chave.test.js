// Sorteio estável por chave (nucleo/congelar.js + nucleo/util.js + D.sortear): no modo congelado, a mesma chave dá a
// mesma ordem e conteúdo novo em outra sala não muda esta; sem congelar, usa o Math.random.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/sorteio-chave.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');

function util(congelado) {
  const g = vm.createContext({ Reino: {}, location: { search: congelado ? '?debug=1&congelar=1' : '' }, console });
  g.window = g;
  g.document = { documentElement: { classList: { add() {} } }, createElement() { return {}; }, addEventListener() {} };
  if (congelado) {
    // só o sorteio: o resto do congelar.js mexe em relógio e DOM, que não interessam aqui
    const fonte = fs.readFileSync(Jogo.arquivo('nucleo/congelar'), 'utf8');
    const ini = fonte.indexOf('  // sorteio estável'), fim = fonte.indexOf('  // relógio');
    vm.runInContext('Reino.congelado = true;' + fonte.slice(ini, fim).replace(/\bR\./g, 'Reino.'), g);
  }
  vm.runInContext(fs.readFileSync(Jogo.arquivo('nucleo/util'), 'utf8'), g, { filename: 'util' });
  return g;
}
const nums = (n) => Array.from({ length: n }, (_, i) => i);

test('congelado: mesma chave em dois jogos = mesma ordem; usos seguidos variam', () => {
  const a = util(true), b = util(true);
  const x1 = a.Reino.util.embaralhar(nums(10), 'k'), y1 = b.Reino.util.embaralhar(nums(10), 'k');
  assert.deepStrictEqual(Array.from(x1), Array.from(y1));
  const x2 = a.Reino.util.embaralhar(nums(10), 'k');
  assert.notDeepStrictEqual(Array.from(x2), Array.from(x1));
  // chave objeto vira JSON
  assert.deepStrictEqual(Array.from(a.Reino.util.embaralhar(nums(8), ['escolha', { p: 1 }])),
    Array.from(b.Reino.util.embaralhar(nums(8), ['escolha', { p: 1 }])));
});

test('congelado: sortear em outra chave antes não muda esta; não gasta o Math.random', () => {
  const a = util(true), b = util(true);
  let usos = 0; const M = vm.runInContext("Math", b), orig = M.random; M.random = () => { usos++; return orig(); };
  b.Reino.util.embaralhar(nums(10), 'sortear:outra-sala:lista');
  b.Reino.util.sortear(nums(10), 'esp:ligar');
  assert.deepStrictEqual(Array.from(a.Reino.util.embaralhar(nums(10), 'sortear:s1:lista')),
    Array.from(b.Reino.util.embaralhar(nums(10), 'sortear:s1:lista')));
  assert.strictEqual(usos, 0);
});

test('sem congelar: a chave é ignorada e usa o Math.random', () => {
  const g = util(false);
  let usos = 0; vm.runInContext("Math", g).random = () => { usos++; return 0.5; };
  g.Reino.util.embaralhar(nums(5), 'k');
  g.Reino.util.sortear(nums(5), 'k');
  assert.strictEqual(usos, 5);
});
