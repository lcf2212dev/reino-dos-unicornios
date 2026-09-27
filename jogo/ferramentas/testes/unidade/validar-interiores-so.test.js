// Testes de unidade: validar-interiores --so <id do interior ou do lugar> confere "só aquele prédio (todos os andares
// dele)". Num prédio de vários andares (Torre, Observatório com Ciências no 3º) o --so dava erro que o validador
// inteiro não dá (escada para um andar fora do filtro, NPC da matéria `dentro` "fora do prédio").
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-interiores-so.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');

const node = (args) => { const r = spawnSync(process.execPath, ['ferramentas/validar/validar-interiores.js'].concat(args), { cwd: Jogo.raiz, encoding: 'utf8' }); return { status: r.status, saida: r.stdout + r.stderr }; };

test('validar-interiores: o jogo inteiro passa', () => {
  const r = node([]);
  assert.strictEqual(r.status, 0, r.saida);
});

for (const so of ['observatorio', 'observatorio-3', 'materia:ciencias', 'torre', 'torre-1']) {
  test(`validar-interiores --so ${so}: sem erro que o validador inteiro não dá`, () => {
    const r = node(['--so', so]);
    assert.doesNotMatch(r.saida, /destino "[^"]+" não existe|precisa de um NPC dentro do prédio|precisa de exatamente 1 interior com entrada/);
    assert.strictEqual(r.status, 0, r.saida);
  });
}
