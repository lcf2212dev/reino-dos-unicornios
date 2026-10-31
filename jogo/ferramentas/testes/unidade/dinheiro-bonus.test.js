// Moedas por sala sem dízima (decisões do Leandro, 2026-09-26, 2026-10-16 e 2026-10-31): cada matéria vale
// config.valorPorMateria (50 moedas), cada sala um número inteiro de moedas (arredondado para baixo), e a sobra vira
// bônus quando a matéria fica completa. Matérias de 5 salas: 10 moedas por sala, bônus zero. Saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { montar, jogoCarregado } = require('./ajudantes/jogo-save');

// uma matéria de mentira com n salas (ids próprios, para não misturar com o conteúdo de verdade)
function materia(n) {
  return { id: 'zzdinheiro' + n, nome: 'Matéria de Teste', salas: Array.from({ length: n }, (_, i) => ({ id: 'zzd' + n + '-' + (i + 1) })), unicornios: [] };
}

test('valor por sala redondo e bônus que fecha as 50 moedas para 1 a 25 salas', () => {
  const { P, R } = montar();
  assert.strictEqual(R.config.valorPorMateria, 50, 'cada matéria vale 50 moedas');
  const esperado = { 1: [50, 0], 3: [16, 2], 5: [10, 0], 6: [8, 2], 7: [7, 1], 8: [6, 2], 9: [5, 5], 12: [4, 2], 25: [2, 0] };
  for (let n = 1; n <= 25; n++) {
    const m = materia(n), sala = P.valorSala(m), bonus = P.bonusMateria(m);
    assert.ok(Number.isInteger(sala), `${n} salas: moedas inteiras`);
    assert.ok(bonus >= 0 && bonus < n, `${n} salas: bônus ${bonus} menor que 1 moeda por sala`);
    assert.strictEqual(sala * n + bonus, R.config.valorPorMateria, `${n} salas: fecha o valor da matéria`);
    if (esperado[n]) assert.deepStrictEqual([sala, bonus], esperado[n], `${n} salas`);
  }
});

test('as matérias de hoje: 10 moedas por sala e nenhum bônus com 5 salas', () => {
  const { P, R } = montar();
  R.materias.filter((m) => m.salas.length === 5).forEach((m) => {
    assert.strictEqual(P.valorSala(m), R.config.valorPorMateria / m.salas.length, m.id);
    assert.strictEqual(P.bonusMateria(m), 0, m.id);
  });
  // Matemática tem 6 salas: 8 moedas por sala e 2 de bônus
  const mat = R.materias.find((m) => m.id === 'matematica');
  assert.deepStrictEqual([P.valorSala(mat), P.bonusMateria(mat)], [8, 2], 'matematica');
});

test('o bônus entra só quando a matéria fica completa, e o prêmio da última sala o traz', () => {
  const { P, R } = jogoCarregado();
  const m = materia(6);
  R.materias.push(m);
  const resultado = { acertosPrimeira: 5, total: 10, pressas: 1 };
  for (let i = 0; i < 5; i++) {
    const pr = P.concluirSala(m, m.salas[i], resultado);
    assert.strictEqual(pr.dinheiro, 8, 'cada sala: 8 moedas');
    assert.strictEqual(pr.bonus, undefined, 'sem bônus antes da última');
  }
  assert.strictEqual(P.dinheiroMateria(m), 40);
  const ultima = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([ultima.dinheiro, ultima.bonus], [8, 2]);
  assert.strictEqual(P.dinheiroMateria(m), 50, 'completa: salas + bônus = 50 moedas');
  // refazer uma sala não dá moedas nem bônus de novo
  const de_novo = P.concluirSala(m, m.salas[5], resultado);
  assert.deepStrictEqual([de_novo.dinheiro, de_novo.bonus], [0, undefined]);
  assert.strictEqual(P.dinheiroMateria(m), 50);
});

// o "Já pago" dos pais: no save em reais, como sempre foi (formato que não muda, save-e-mescla.md §2); na tela, moedas
test('o "Já pago" antigo, em reais, aparece em moedas; o novo, digitado em moedas, vai ao save em reais', () => {
  const { P } = jogoCarregado();
  const e = P.estado();
  e.pago.historia = 20;   // a matéria inteira paga em dinheiro, antes das moedas (R$ 20)
  assert.strictEqual(P.pago('historia'), 50, 'R$ 20 = 50 moedas: nada a pagar de novo');
  e.pago.matematica = 3;   // uma sala de R$ 3,00 (7,5 moedas: a tela arredonda)
  assert.strictEqual(P.pago('matematica'), 8);
  P.registrarPagamento('ingles', 30);
  assert.strictEqual(P.estado().pago.ingles, 12, 'o save guarda reais');
  assert.strictEqual(P.pago('ingles'), 30);
  P.registrarPagamento('ingles', 8);
  assert.strictEqual(P.pago('ingles'), 8, 'correção para menos, em moedas');
  P.registrarPagamento('ingles', -5);
  assert.strictEqual(P.pago('ingles'), 0, 'nunca negativo');
});
