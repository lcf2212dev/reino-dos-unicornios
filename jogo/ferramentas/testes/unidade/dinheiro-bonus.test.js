// Robux por sala sem dízima (decisões do Leandro, 2026-09-26 e 2026-10-16): cada matéria vale config.valorPorMateria
// (500 Robux), cada sala um valor redondo, de 10 em 10 Robux (arredondado para baixo), e a sobra vira bônus quando a
// matéria fica completa. Matérias de 5 salas: 100 Robux por sala, bônus zero. Saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { montar, jogoCarregado } = require('./ajudantes/jogo-save');

// uma matéria de mentira com n salas (ids próprios, para não misturar com o conteúdo de verdade)
function materia(n) {
  return { id: 'zzdinheiro' + n, nome: 'Matéria de Teste', salas: Array.from({ length: n }, (_, i) => ({ id: 'zzd' + n + '-' + (i + 1) })), unicornios: [] };
}

test('valor por sala redondo e bônus que fecha os 500 Robux para 1 a 25 salas', () => {
  const { P, R } = montar();
  assert.strictEqual(R.config.valorPorMateria, 500, 'cada matéria vale 500 Robux');
  const esperado = { 1: [500, 0], 3: [160, 20], 5: [100, 0], 6: [80, 20], 7: [70, 10], 8: [60, 20], 9: [50, 50], 12: [40, 20], 25: [20, 0] };
  for (let n = 1; n <= 25; n++) {
    const m = materia(n), sala = P.valorSala(m), bonus = P.bonusMateria(m);
    assert.strictEqual(sala % 10, 0, `${n} salas: de 10 em 10 Robux`);
    assert.ok(bonus >= 0 && bonus < 10 * n, `${n} salas: bônus ${bonus} menor que 10 Robux por sala`);
    assert.strictEqual(sala * n + bonus, R.config.valorPorMateria, `${n} salas: fecha o valor da matéria`);
    if (esperado[n]) assert.deepStrictEqual([sala, bonus], esperado[n], `${n} salas`);
  }
});

test('as matérias de hoje: 100 Robux por sala e nenhum bônus com 5 salas', () => {
  const { P, R } = montar();
  R.materias.filter((m) => m.salas.length === 5).forEach((m) => {
    assert.strictEqual(P.valorSala(m), R.config.valorPorMateria / m.salas.length, m.id);
    assert.strictEqual(P.bonusMateria(m), 0, m.id);
  });
  // Matemática tem 6 salas: 80 Robux por sala e 20 de bônus
  const mat = R.materias.find((m) => m.id === 'matematica');
  assert.deepStrictEqual([P.valorSala(mat), P.bonusMateria(mat)], [80, 20], 'matematica');
});

test('o bônus entra só quando a matéria fica completa, e o prêmio da última sala o traz', () => {
  const { P, R } = jogoCarregado();
  const m = materia(6);
  R.materias.push(m);
  const resultado = { acertosPrimeira: 5, total: 10, pressas: 1 };
  for (let i = 0; i < 5; i++) {
    const pr = P.concluirSala(m, m.salas[i], resultado);
    assert.strictEqual(pr.dinheiro, 80, 'cada sala: 80 Robux');
    assert.strictEqual(pr.bonus, undefined, 'sem bônus antes da última');
  }
  assert.strictEqual(P.dinheiroMateria(m), 400);
  const ultima = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([ultima.dinheiro, ultima.bonus], [80, 20]);
  assert.strictEqual(P.dinheiroMateria(m), 500, 'completa: salas + bônus = 500 Robux');
  // refazer uma sala não dá Robux nem bônus de novo
  const de_novo = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([de_novo.dinheiro, de_novo.bonus], [0, undefined]);
  assert.strictEqual(P.dinheiroMateria(m), 500);
});

// o "Já pago" dos pais: no save em reais, como sempre foi (formato que não muda, save-e-mescla.md §2); na tela, Robux
test('o "Já pago" antigo, em reais, aparece em Robux; o novo, digitado em Robux, vai ao save em reais', () => {
  const { P } = jogoCarregado();
  const e = P.estado();
  e.pago.historia = 20;   // a matéria inteira paga em dinheiro, antes dos Robux (R$ 20)
  assert.strictEqual(P.pago('historia'), 500, 'R$ 20 = 500 Robux: nada a pagar de novo');
  e.pago.matematica = 3;   // uma sala de R$ 3,00
  assert.strictEqual(P.pago('matematica'), 75);
  P.registrarPagamento('ingles', 300);
  assert.strictEqual(P.estado().pago.ingles, 12, 'o save guarda reais');
  assert.strictEqual(P.pago('ingles'), 300);
  P.registrarPagamento('ingles', 80);
  assert.strictEqual(P.pago('ingles'), 80, 'correção para menos, em Robux');
  P.registrarPagamento('ingles', -5);
  assert.strictEqual(P.pago('ingles'), 0, 'nunca negativo');
});
