// Testes de unidade: o básico dos cuidados (js/sistemas/cuidados.js) — queda com o tempo, compra na despensa
// com estrelas, comer, beber e banhar (e os motivos de recusa). Os casos finos de relógio, gravação,
// lembrete e mescla estão em cuidados-fome-sede, cuidados-carimbos e banho.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/cuidados-despensa.test.js   (tudo: npm test, na raiz)
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
const { test } = require('node:test');
const assert = require('assert');
const { jogoCarregado, copia } = require('./ajudantes/jogo-save');

const MIN = 60 * 1000;

test('queda com o tempo: fome em 120 min, sede em 60 min, banho em 180 min, nunca abaixo de 0', () => {
  const j = jogoCarregado();
  assert.deepStrictEqual(copia(j.C.niveis()), { fome: 100, sede: 100, banho: 100 });
  const d = j.C.avancar(30 * MIN);
  assert.strictEqual(d.fome, 75); assert.strictEqual(d.sede, 50);
  assert.ok(Math.abs(d.banho - (100 - 30 / 180 * 100)) < 1e-9);
  j.C.avancar(300 * MIN);
  assert.deepStrictEqual(copia(j.C.niveis()), { fome: 0, sede: 0, banho: 0 });
  // só a montaria gasta; o outro unicórnio chocado fica cheio
  assert.deepStrictEqual(copia(j.C.niveis('h-cartinha')), { fome: 100, sede: 100, banho: 100 });
  // abaixo de 25: ícone (sede primeiro) e lento
  assert.strictEqual(j.C.iconeMontaria(), '💧');
  assert.strictEqual(j.C.fatorVelocidade(), j.R.config.cuidados.fatorLento);
});

test('comprar: cobra o preço da comida em estrelas e põe uma na despensa; sem estrelas ou comida errada, recusa', () => {
  const j = jogoCarregado();                       // 37 ganhas - 8 gastas = 29 estrelas
  const bolo = j.R.config.comidas.find((c) => c.id === 'bolo');
  assert.strictEqual(j.P.estrelas(), 29);
  assert.deepStrictEqual(copia(j.C.comprar('bolo')), { ok: true });
  assert.strictEqual(j.P.estrelas(), 29 - bolo.preco);
  assert.strictEqual(j.C.quantidade('bolo'), 1);
  j.C.comprar('bolo'); j.C.comprar('bolo');       // 29 - 24 = 5
  assert.deepStrictEqual(copia(j.C.comprar('bolo')), { ok: false, motivo: 'estrelas', faltam: bolo.preco - 5 });
  assert.strictEqual(j.P.estrelas(), 5, 'compra recusada não cobra');
  assert.deepStrictEqual(copia(j.C.comprar('pizza')), { ok: false, motivo: 'sem-comida' });
  assert.deepStrictEqual(copia(j.C.despensa().map((x) => [x.comida.id, x.quantidade])), [['bolo', 3]]);
  assert.deepStrictEqual(copia(j.P.estado().despensa), { bolo: { compradas: 3, usadas: 0 } });
  assert.deepStrictEqual(copia(j.P.estado().estrelas), { ganhas: 37, gastas: 8 + 3 * bolo.preco });
});

test('comer: gasta uma da despensa e enche a fome (o bolo enche até 100); cheio, sem comida ou ovo recusam', () => {
  const j = jogoCarregado((s) => { s.despensa = { cenoura: { compradas: 2, usadas: 0 }, bolo: { compradas: 1, usadas: 0 } }; });
  assert.deepStrictEqual(copia(j.C.alimentar(null, 'cenoura')), { ok: false, motivo: 'cheio' });
  j.C.avancar(60 * MIN);                           // fome 50
  assert.deepStrictEqual(copia(j.C.alimentar(null, 'cenoura')), { ok: true, antes: 50, depois: 70 });
  assert.deepStrictEqual(copia(j.C.alimentar(null, 'bolo')), { ok: true, antes: 70, depois: 100 });
  assert.strictEqual(j.C.quantidade('bolo'), 0);
  j.C.avancar(60 * MIN);
  assert.deepStrictEqual(copia(j.C.alimentar(null, 'bolo')), { ok: false, motivo: 'sem-comida' });
  assert.deepStrictEqual(copia(j.C.alimentar(null, 'maca')), { ok: false, motivo: 'sem-comida' });
  assert.deepStrictEqual(copia(j.C.alimentar('h-postal', 'cenoura')), { ok: false, motivo: 'sem-uni' });   // ovo ainda não chocado
  assert.deepStrictEqual(copia(j.P.estado().despensa), { cenoura: { compradas: 2, usadas: 1 }, bolo: { compradas: 1, usadas: 1 } });
});

test('beber e banhar: de graça, voltam a 100; cheio e ovo recusam; nenhum dos dois cobra estrelas', () => {
  const j = jogoCarregado();
  assert.deepStrictEqual(copia(j.C.beber()), { ok: false, motivo: 'cheio' });
  assert.deepStrictEqual(copia(j.C.banhar()), { ok: false, motivo: 'cheio' });
  j.C.avancar(45 * MIN);                           // sede 25, banho 75
  assert.deepStrictEqual(copia(j.C.beber()), { ok: true, antes: 25, depois: 100 });
  assert.deepStrictEqual(copia(j.C.banhar()), { ok: true, antes: 75, depois: 100 });
  assert.deepStrictEqual(copia(j.C.niveis()), { fome: 100 - 45 / 120 * 100, sede: 100, banho: 100 });
  assert.deepStrictEqual(copia(j.C.beber('h-postal')), { ok: false, motivo: 'sem-uni' });
  assert.deepStrictEqual(copia(j.C.banhar('h-postal')), { ok: false, motivo: 'sem-uni' });
  assert.strictEqual(j.P.estrelas(), 29);
});
