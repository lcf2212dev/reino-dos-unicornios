// Selo "✨ Novo!" e o campo `visitados` do save (js/sistemas/visitados.js): mescla por união nos dois sentidos,
// a novidade declarada expira pela data (config.novidadeDias, padrão 45) e some depois da 1ª visita.
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/novidades.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const DIA = 86400000;
// o jogo no vm com o registro de campos e os visitados (montar() não os carrega)
function jogo(agora) {
  const j = montar({ agora });
  ['sistemas/progresso-campos', 'sistemas/visitados'].forEach((n) => vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), j.ctx, { filename: n }));
  j.P.carregar();
  j.N = j.R.Novidades;
  return j;
}
const LUGAR = { id: 'materia:ciencias', interior: 'observatorio-3', novidade: '2026-09-26' };
const DATA = Date.UTC(2026, 8, 26);

test('visitados: padrão vazio e mescla por união nos dois sentidos', () => {
  const j = jogo(DATA);
  assert.deepStrictEqual(copia(j.P.estado().visitados), {});
  const a = Object.assign(saveHoje(), { atualizado: 2, visitados: { 'observatorio-3': true } });
  const b = Object.assign(saveHoje(), { atualizado: 1, visitados: { petshop: true } });
  const uniao = { 'observatorio-3': true, petshop: true };
  assert.deepStrictEqual(copia(j.P.mesclar(a, b).visitados), uniao);
  assert.deepStrictEqual(copia(j.P.mesclar(b, a).visitados), uniao);
  // um lado de versão antiga (sem o campo) não apaga o outro
  const velho = saveHoje(); delete velho.visitados; velho.atualizado = 5;
  assert.deepStrictEqual(copia(j.P.mesclar(velho, a).visitados), { 'observatorio-3': true });
});

test('novidade: vale até novidadeDias dias depois da data e expira', () => {
  assert.strictEqual(jogo(DATA + 3 * DIA).N.ehNovo(LUGAR), true);
  assert.strictEqual(jogo(DATA + 44 * DIA).N.ehNovo(LUGAR), true);
  assert.strictEqual(jogo(DATA + 45 * DIA).N.ehNovo(LUGAR), false);
  const j = jogo(DATA + 10 * DIA);
  j.R.config.novidadeDias = 7;
  assert.strictEqual(j.N.ehNovo(LUGAR), false);
  // sem novidade declarada ou com data estragada: nunca
  assert.strictEqual(j.N.ehNovo({ id: 'x' }), false);
  assert.strictEqual(jogo(DATA).N.ehNovo({ id: 'x', novidade: '26/09/2026' }), false);
});

test('visitado some: entrar no andar (ou no lugar) tira o selo; não grava na hora, vai na próxima gravação', () => {
  const j = jogo(DATA + DIA);
  assert.strictEqual(j.N.ehNovo(LUGAR), true);
  j.cena.atual = { id: 'observatorio-3', tipo: 'interior', lugarId: 'materia:ciencias' };
  j.R.util.emit(j.R.EVENTOS.CENA, { de: 'mapa', para: 'observatorio-3' });
  assert.strictEqual(j.N.ehNovo(LUGAR), false);
  assert.strictEqual(j.contagem.salvar || 0, 0, 'entrar não grava na hora');
  j.R.Progresso.salvar();
  assert.deepStrictEqual(copia(j.lido().visitados), { 'observatorio-3': true, 'materia:ciencias': true });
  // pelo id do lugar também
  const k = jogo(DATA + DIA);
  k.N.marcar('materia:ciencias');
  assert.strictEqual(k.N.ehNovo(LUGAR), false);
});
