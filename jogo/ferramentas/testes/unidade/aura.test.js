// Testes de unidade: o sistema aura (js/sistemas/aura.js), carregado com o jogo no vm (todos os `node: true`).
// Esqueleto do `npm run novo`: acrescente os testes das regras. Modelo: unidade/modulos.test.js.
// Rodar: node --test jogo/ferramentas/testes/unidade/aura.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino;
}

test('aura: o módulo se registra e o depurar responde', () => {
  const R = carregar();
  const m = R.modulo('aura');
  assert.ok(m, 'módulo aura não registrado');
  assert.strictEqual(typeof m.depurar(), 'object');
  assert.ok(Array.isArray(m.falas()));
});

// o jogo no vm com o save (ajudantes/jogo-save.js, saves sintéticos): o registro de campos e a aura
const fs = require('fs');
const vm = require('vm');
const { Jogo: JS, montar, saveHoje, copia } = require('./ajudantes/jogo-save');
function comSave() {
  const j = montar({ agora: Date.UTC(2026, 8, 27) });
  if (!j.R.registrarModulo) j.R.registrarModulo = function () {};
  ['sistemas/progresso-campos', 'sistemas/aura'].forEach((n) => vm.runInContext(fs.readFileSync(JS.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  j.R.depurarAura = () => j.R._aura.comemorar;
  return j;
}

test('aura: começa em 0, branca, vale 0,2 por pergunta', () => {
  const R = comSave().R;
  assert.strictEqual(R.Aura.decimos(), 0);
  assert.strictEqual(R.Aura.passo(0), 2);
  assert.strictEqual(R.Aura.corDaFaixa(0).nome, 'branca');
});

test('aura: a sequência das faixas (0,2 → 2 → 20 → 200)', () => {
  const A = carregar().Aura;
  assert.deepStrictEqual([0, 99, 100, 999, 1000, 9999, 10000].map(A.passo), [2, 2, 20, 20, 200, 200, 2000]);
  assert.strictEqual(A.aplicar(98, true), 100);      // 9,8 + 0,2 = 10,0
  assert.strictEqual(A.aplicar(100, true), 120);     // e a próxima vale +2
  assert.strictEqual(A.aplicar(100, false), 60);     // errada tira o dobro da faixa em que ela está
  assert.strictEqual(A.aplicar(3, false), 0);        // nunca abaixo de 0
  assert.strictEqual(A.corDaFaixa(1).nome, 'amarela');
  assert.strictEqual(A.corDaFaixa(99).nome, 'arco-íris');
  assert.strictEqual(A.texto(124), '12,4');
  assert.strictEqual(A.proximaFaixa(124), 1000);
});

test('aura: contar grava no save, em ordem, e nota parcial (null) não conta', () => {
  const j = comSave();
  const r = j.R.Aura.contar([true, true, false, null, true]);
  assert.deepStrictEqual(copia(r), { antes: 0, depois: 2 });
  assert.strictEqual(j.lido().aura.mariana.d, 2);
  assert.ok(j.lido().aura.mariana.em > 0);
});

test('aura: passar de faixa marca a cor para comemorar; cair de volta desmarca', () => {
  const j = comSave();
  j.P.estado().aura = { mariana: { d: 98, em: 1 } };
  j.R.Aura.contar(true);
  assert.strictEqual(j.R.depurarAura(), 1);
  j.R.Aura.contar(false);
  assert.strictEqual(j.R.depurarAura(), null);
});

test('aura: mescla entre aparelhos vale a mais recente, mesmo menor; aparelho antigo não apaga', () => {
  const j = comSave();
  const a = Object.assign(saveHoje(), { atualizado: 2, aura: { mariana: { d: 500, em: 10 } } });
  const b = Object.assign(saveHoje(), { atualizado: 1, aura: { mariana: { d: 300, em: 20 } } });
  assert.strictEqual(j.P.mesclar(a, b).aura.mariana.d, 300);
  assert.strictEqual(j.P.mesclar(b, a).aura.mariana.d, 300);
  const velho = saveHoje(); delete velho.aura; velho.atualizado = 5;
  assert.strictEqual(j.P.mesclar(velho, a).aura.mariana.d, 500);
});

test('aura: matéria do dia (config.aura.materiaDoDia) vale 4× na certa, a errada tira o de sempre', () => {
  const R = comSave().R;
  assert.deepStrictEqual({ ...R.Aura.materiaDoDia('2026-09-30') }, { materia: 'geografia', vezes: 4 });
  assert.strictEqual(R.Aura.vezesDaMateria('matematica', '2026-10-01'), 4);
  assert.strictEqual(R.Aura.vezesDaMateria('ciencias', '2026-10-02'), 4);
  assert.strictEqual(R.Aura.vezesDaMateria('geografia', '2026-10-01'), 1, 'geografia só no dia dela');
  assert.strictEqual(R.Aura.vezesDaMateria('geografia', '2026-10-03'), 1, 'fora da lista: nada muda');
  assert.strictEqual(R.Aura.vezesDaMateria(undefined, '2026-09-30'), 1, 'sem matéria: vale 1');
  assert.strictEqual(R.Aura.aplicar(0, true, 4), 8);
  assert.strictEqual(R.Aura.aplicar(20, false, 4), 16, 'errada: -passo × penalidade, sem multiplicar');
  assert.strictEqual(R.Aura.aplicar(0, true), 2);
});

test('aura: contar com a matéria do dia de hoje soma 4 passos', () => {
  const j = comSave(), R = j.R;
  const hoje = R.util.hoje();
  R.config.aura.materiaDoDia = { vezes: 4, dias: { [hoje]: 'geografia' } };
  R.Aura.contar([true], 'geografia');
  assert.strictEqual(R.Aura.decimos(), 8);
  R.Aura.contar([true], 'historia');
  assert.strictEqual(R.Aura.decimos(), 10);
  R.Aura.contar([false], 'geografia');
  assert.strictEqual(R.Aura.decimos(), 6);
});
