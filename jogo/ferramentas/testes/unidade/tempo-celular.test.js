// Testes de unidade: o tempo de celular (js/sistemas/tempo-celular.js). Ganho derivado das salas feitas desde
// config.tempoCelular.desde; só os usos no save (`tempoUsos`). Saves sintéticos (ajudantes/jogo-save.js).
// Rodar: node --test jogo/ferramentas/testes/unidade/tempo-celular.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { Jogo: JS, montar } = require('./ajudantes/jogo-save');

function comSave() {
  const j = montar({ agora: Date.UTC(2026, 10, 2) });
  ['sistemas/progresso-campos', 'sistemas/tempo-celular'].forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  return j;
}
function salas(R, n) {
  const l = [];
  R.materias.forEach((m) => m.salas.forEach((s) => { if (!l.includes(s.id)) l.push(s.id); }));
  return l.slice(0, n);
}
const desde = () => new Date(2026, 10, 1).getTime();
function feita(j, id, quando) { j.P.estado().salas[id] = { vezes: 1, melhor: 0, feita: quando }; }

test('tempo-celular: só contam as salas feitas desde a data, uma vez cada', () => {
  const j = comSave(), T = j.R.TempoCelular, [s1, s2, s3] = salas(j.R, 3);
  assert.strictEqual(T.ganho(), 0);
  feita(j, s1, desde() - 1);
  assert.strictEqual(T.ganho(), 0, 'antes da data não conta');
  assert.strictEqual(T.daSala(s1), 0);
  feita(j, s2, desde());
  feita(j, s3, desde() + 9000);
  assert.strictEqual(T.ganho(), 10);
  assert.strictEqual(T.daSala(s2), 5);
  assert.strictEqual(T.daSala('nao-existe'), 0);
  feita(j, s2, desde() + 1);   // refazer não cria outra sala
  assert.strictEqual(T.ganho(), 10);
});

test('tempo-celular: usar respeita passo e saldo; saldo nunca negativo', () => {
  const j = comSave(), T = j.R.TempoCelular, [s1, s2] = salas(j.R, 2);
  feita(j, s1, desde()); feita(j, s2, desde());
  assert.strictEqual(T.usar(3), false, 'fora do passo');
  assert.strictEqual(T.usar(0), false);
  assert.strictEqual(T.usar(-5), false);
  assert.strictEqual(T.usar(15), false, 'além do saldo');
  assert.strictEqual(T.usar(5), true);
  assert.strictEqual(T.usar(5), true);
  assert.strictEqual(T.saldo(), 0);
  assert.strictEqual(T.usar(5), false);
  assert.strictEqual(T.usos().length, 2);
  delete j.P.estado().salas[s2];   // menos ganho que usado: saldo fica em 0
  assert.strictEqual(T.saldo(), 0);
  assert.strictEqual(T.usado(), 10);
});

test('tempo-celular: dois aparelhos usando ao mesmo tempo somam os dois usos', () => {
  const j = comSave(), T = j.R.TempoCelular;
  salas(j.R, 4).forEach((s) => feita(j, s, desde()));
  const base = JSON.parse(JSON.stringify(j.P.estado()));
  const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
  a.tempoUsos = { '1762000000000-aaaa': 5 };
  b.tempoUsos = { '1762000000000-bbbb': 10 };
  const m = j.P.mesclar(a, b);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(m.tempoUsos)), { '1762000000000-aaaa': 5, '1762000000000-bbbb': 10 });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(j.P.mesclar(m, a).tempoUsos)), JSON.parse(JSON.stringify(m.tempoUsos)), 'idempotente');
  assert.strictEqual(T.ganho(), 20);
});

test('tempo-celular: Novo ciclo zera os usos; limpeza tira minutos inválidos', () => {
  const j = comSave(), T = j.R.TempoCelular, [s1] = salas(j.R, 1);
  feita(j, s1, desde());
  assert.strictEqual(T.usar(5), true);
  j.P.novoCiclo();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(j.P.estado().tempoUsos || {})), {});
  assert.strictEqual(T.usado(), 0);
  const est = JSON.parse(JSON.stringify(j.P.estado()));
  est.tempoUsos = { a: 5, b: -1, c: 2.5, d: 'x' };
  assert.deepStrictEqual(JSON.parse(JSON.stringify(j.P.mesclar(est, est).tempoUsos)), { a: 5 });
});
