// O 💰 do HUD mostra o saldo a receber: Robux ganhos − Robux já pagos, nunca negativo (pedido 2026-10-28).
// `pago` segue em reais no save (save-e-mescla.md §2). Saves 100% sintéticos.
const { test } = require('node:test');
const assert = require('assert');
const { jogoCarregado } = require('./ajudantes/jogo-save');

// 6 matérias completas (500 Robux cada) + 7 salas de portugues4
function montarSave() {
  const ctx = jogoCarregado();
  const { P, R } = ctx, e = P.estado();
  Object.keys(e.pago).forEach((id) => { delete e.pago[id]; }); // começa sem nada pago
  const completas = R.materias.filter((m) => m.id !== 'portugues4').slice(0, 6);
  completas.forEach((m) => m.salas.forEach((s) => { e.salas[s.id] = { feita: true }; }));
  const p4 = R.materias.find((m) => m.id === 'portugues4');
  p4.salas.slice(0, 7).forEach((s) => { e.salas[s.id] = { feita: true }; });
  return { ...ctx, e, completas, p4 };
}

test('6 matérias pagas (R$ 20 cada) + 7 salas de portugues4: saldo de 7 salas', () => {
  const { P, e, completas, p4 } = montarSave();
  completas.forEach((m) => { e.pago[m.id] = 20; });
  assert.strictEqual(P.pagoTotal(), 3000);
  assert.strictEqual(P.dinheiroTotal(), 3000 + 7 * P.valorSala(p4));
  assert.strictEqual(P.saldoRobux(), 7 * P.valorSala(p4));
  assert.strictEqual(P.saldoRobux(), 140);
});

test('sem nada pago: o saldo é o total ganho', () => {
  const { P } = montarSave();
  assert.strictEqual(P.pagoTotal(), 0);
  assert.strictEqual(P.saldoRobux(), P.dinheiroTotal());
});

test('pago maior que o ganho: saldo zero; id solto fora das matérias não conta (como a Área dos Pais)', () => {
  const { P, e, p4 } = montarSave();
  e.pago['zz-materia-antiga'] = 1000;
  assert.strictEqual(P.pagoTotal(), 0);
  e.pago[p4.id] = 1000;
  assert.strictEqual(P.pagoTotal(), 25000);
  assert.strictEqual(P.saldoRobux(), 0);
});
