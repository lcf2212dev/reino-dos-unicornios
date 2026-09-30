// Selo "✨ Novo!" de uma novidade DENTRO de um lugar já visitado (js/sistemas/visitados.js):
// `novidade: { desde, interior }` vale pela data até ela entrar naquele interior (ex.: o 2º andar do Laboratório).
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/novidade-andar.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { Jogo, montar } = require('./ajudantes/jogo-save');

const DIA = 86400000;
const DATA = Date.UTC(2026, 8, 30);
// o jogo no vm com os visitados já marcados
function jogo(agora, visitados) {
  const j = montar({ agora });
  ['sistemas/progresso-campos', 'sistemas/visitados'].forEach((n) => vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  j.N = j.R.Novidades;
  if (visitados) j.N.marcar.apply(null, visitados);
  return j;
}
const ANDAR = { id: 'quimica', novidade: { desde: '2026-09-30', interior: 'quimica-2' } };
const SIMPLES = { id: 'quimica', novidade: '2026-09-30' };

test('andar novo: nunca visitou nada → novo', () => {
  assert.strictEqual(jogo(DATA + DIA).N.ehNovo(ANDAR), true);
});

test('andar novo: visitou o lugar mas não o andar → continua novo', () => {
  assert.strictEqual(jogo(DATA + DIA, ['quimica']).N.ehNovo(ANDAR), true);
});

test('andar novo: entrou no andar → some', () => {
  assert.strictEqual(jogo(DATA + DIA, ['quimica', 'quimica-2']).N.ehNovo(ANDAR), false);
  // pelo motor: entrar no interior quimica-2 marca a visita
  const j = jogo(DATA + DIA, ['quimica']);
  j.cena.atual = { id: 'quimica-2', tipo: 'interior', lugarId: 'quimica' };
  j.R.util.emit(j.R.EVENTOS.CENA, { de: 'quimica', para: 'quimica-2' });
  assert.strictEqual(j.N.ehNovo(ANDAR), false);
});

test('andar novo: data velha (novidadeDias) → não', () => {
  assert.strictEqual(jogo(DATA + 45 * DIA).N.ehNovo(ANDAR), false);
  assert.strictEqual(jogo(DATA + 44 * DIA).N.ehNovo(ANDAR), true);
  assert.strictEqual(jogo(DATA).N.ehNovo({ id: 'x', novidade: { desde: '30/09/2026', interior: 'y' } }), false);
});

test('lugar sem o campo novo: igual a hoje (a visita ao lugar tira o selo)', () => {
  assert.strictEqual(jogo(DATA + DIA).N.ehNovo(SIMPLES), true);
  assert.strictEqual(jogo(DATA + DIA, ['quimica']).N.ehNovo(SIMPLES), false);
  assert.strictEqual(jogo(DATA + DIA, ['quimica-2']).N.ehNovo(SIMPLES), true);
  assert.strictEqual(jogo(DATA + DIA).N.ehNovo({ id: 'x' }), false);
});
