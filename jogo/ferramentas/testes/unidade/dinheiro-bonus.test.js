// Dinheiro por sala sem dízima (decisão do Leandro, 2026-09-26): cada sala vale um valor redondo, de R$ 0,50 em
// R$ 0,50 (arredondado para baixo), e a sobra de config.valorPorMateria vira bônus quando a matéria fica completa.
// As matérias de hoje (5 salas) seguem iguais: R$ 4,00 por sala, bônus zero. Saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { montar, jogoCarregado } = require('./ajudantes/jogo-save');

// uma matéria de mentira com n salas (ids próprios, para não misturar com o conteúdo de verdade)
function materia(n) {
  return { id: 'zzdinheiro' + n, nome: 'Matéria de Teste', salas: Array.from({ length: n }, (_, i) => ({ id: 'zzd' + n + '-' + (i + 1) })), unicornios: [] };
}
const reais = (v) => Math.round(v * 100);

test('valor por sala redondo e bônus que fecha R$ 20 para 1 a 12 salas', () => {
  const { P, R } = montar();
  const esperado = { 1: [2000, 0], 3: [650, 50], 5: [400, 0], 6: [300, 200], 7: [250, 250], 8: [250, 0], 9: [200, 200], 12: [150, 200] };
  for (let n = 1; n <= 12; n++) {
    const m = materia(n), sala = reais(P.valorSala(m)), bonus = reais(P.bonusMateria(m));
    assert.strictEqual(sala % 50, 0, `${n} salas: R$ 0,50 em R$ 0,50`);
    assert.ok(bonus >= 0 && bonus < 50 * n, `${n} salas: bônus ${bonus} menor que R$ 0,50 por sala`);
    assert.strictEqual(sala * n + bonus, reais(R.config.valorPorMateria), `${n} salas: fecha o valor da matéria`);
    if (esperado[n]) assert.deepStrictEqual([sala, bonus], esperado[n], `${n} salas`);
  }
});

test('as matérias de hoje não mudam: R$ 4,00 por sala e nenhum bônus', () => {
  const { P, R } = montar();
  R.materias.filter((m) => m.salas.length === 5).forEach((m) => {
    assert.strictEqual(P.valorSala(m), R.config.valorPorMateria / m.salas.length, m.id);
    assert.strictEqual(P.bonusMateria(m), 0, m.id);
  });
  // Matemática tem 6 salas: R$ 3,00 por sala e R$ 2,00 de bônus
  const mat = R.materias.find((m) => m.id === 'matematica');
  assert.deepStrictEqual([P.valorSala(mat), P.bonusMateria(mat)], [3, 2], 'matematica');
});

test('o bônus entra só quando a matéria fica completa, e o prêmio da última sala o traz', () => {
  const { P, R } = jogoCarregado();
  const m = materia(6);
  R.materias.push(m);
  const resultado = { acertosPrimeira: 5, total: 10, pressas: 1 };
  for (let i = 0; i < 5; i++) {
    const pr = P.concluirSala(m, m.salas[i], resultado);
    assert.strictEqual(pr.dinheiro, 3, 'cada sala: R$ 3,00');
    assert.strictEqual(pr.bonus, undefined, 'sem bônus antes da última');
  }
  assert.strictEqual(P.dinheiroMateria(m), 15);
  const ultima = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([ultima.dinheiro, ultima.bonus], [3, 2]);
  assert.strictEqual(P.dinheiroMateria(m), 20, 'completa: salas + bônus = R$ 20');
  // refazer uma sala não dá dinheiro nem bônus de novo
  const de_novo = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([de_novo.dinheiro, de_novo.bonus], [0, undefined]);
  assert.strictEqual(P.dinheiroMateria(m), 20);
});
