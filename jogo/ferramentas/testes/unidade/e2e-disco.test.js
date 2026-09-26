// Disco do e2e (e2e-disco.js): espaço mínimo, plano do --podar e a pasta REINO_TESTES das guardas.
// Tudo numa pasta própria dentro de /tmp/reino-testes (sem navegador).
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-disco.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES, pastaTestes } = require('../guardas');
const disco = require('../e2e-disco');

const RAIZ = path.join(PASTA_TESTES, `unidade-disco-${process.pid}`);
test.after(() => fs.rmSync(RAIZ, { recursive: true, force: true }));
const criar = (rel, horas = 0) => {
  const p = path.join(RAIZ, rel);
  fs.mkdirSync(p, { recursive: true });
  fs.writeFileSync(path.join(p, 'x.png'), 'abc');
  const t = new Date(Date.now() - horas * 3600e3);
  fs.utimesSync(p, t, t);
};

test('planoPoda: e2e-* velhos e ref de harness antigo; mantém o atual, o da main e o recente', () => {
  criar('e2e-velho', 2); criar('e2e-novo', 0);
  criar('ref-abc1234/dados-imagens-vozes-h11111111');          // antigo: sai
  criar('ref-abc1234/dados-imagens-vozes-h22222222');          // atual: fica
  criar(`ref-abc1234/dados-imagens-vozes-h${disco.HARNESS_MAIN}`); // da main: fica
  criar('ref-abc1234/dados-vozes-h22222222.parcial-99', 2);    // captura interrompida velha: sai
  criar('base-abc1234/jogo');                                   // cópia da base: fica
  const plano = disco.planoPoda(RAIZ, { harness: '22222222' });
  const rel = plano.map((x) => path.relative(RAIZ, x.caminho)).sort();
  assert.deepStrictEqual(rel, ['e2e-velho', 'ref-abc1234/dados-imagens-vozes-h11111111', 'ref-abc1234/dados-vozes-h22222222.parcial-99']);
  plano.forEach((x) => assert.strictEqual(x.bytes, 3));
  assert.strictEqual(disco.podar(plano), 9);
  assert.ok(!fs.existsSync(path.join(RAIZ, 'e2e-velho')) && fs.existsSync(path.join(RAIZ, 'e2e-novo')));
  assert.deepStrictEqual(disco.planoPoda(RAIZ, { harness: '22222222' }), []);
});

test('conferirEspaco: abaixo do mínimo para com a dica do --podar', () => {
  assert.ok(disco.conferirEspaco(RAIZ, 1) > 0);
  assert.throws(() => disco.conferirEspaco(RAIZ, Number.MAX_SAFE_INTEGER), /--podar/);
});

test('podar recusa caminho fora da pasta de testes', () => {
  assert.throws(() => disco.podar([{ caminho: '/home/leandro', bytes: 0 }]), /proibido/);
});

test('REINO_TESTES: só /tmp ou /dev/shm, nunca servidor/dados', () => {
  assert.strictEqual(pastaTestes(undefined), '/tmp/reino-testes');
  assert.strictEqual(pastaTestes('/dev/shm/reino-testes/'), '/dev/shm/reino-testes');
  ['/home/leandro/x', '/', '/tmp', '/dev/shm', '/tmp/x/servidor/dados', 'relativa'].forEach((p) =>
    assert.throws(() => pastaTestes(p), /proibido/, p));
});
