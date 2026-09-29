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
  fs.utimesSync(path.join(p, 'x.png'), t, t); fs.utimesSync(p, t, t);
};

test('planoPoda: e2e-* velhos e ref de harness antigo; mantém o atual, o da main e o recente', () => {
  criar('e2e-velho', 2); criar('e2e-novo', 0);
  criar('ref-abc1234/dados-imagens-vozes-h11111111', 2);       // antigo e parado: sai
  criar('ref-abc1234/dados-imagens-vozes-h22222222');          // atual: fica
  criar(`ref-abc1234/dados-imagens-vozes-h${disco.harnessMain()}`); // da main: fica
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

test('planoPoda: temporárias de teste velhas saem; recentes, fixas e desconhecidas ficam', () => {
  const velhas = ['banco-a1B2c3', 'fluxo-intr-Zz9x8Y', 'validar-docs-copia-q1w2e3', 'trava-abcdef', 'planos-xyz123',
    'novo-12345', 'tipos-678', 'autocontido-0123abcd', 'artifact-delta-acento-AaBbCc'];
  velhas.forEach((n) => criar(n, 2));
  ['banco-recen1', 'entrada-recen2'].forEach((n) => criar(n, 0));                   // menos de 1 h: ficam
  ['travas', 'planos', 'integrar', 'ver', 'auditoria', 'vercel', 'base-abc1234', 'trava', 'banco',
    'banco-curto', 'banco-comprido1', 'outra-coisa-abcdef', 'novo-abc'].forEach((n) => criar(n, 5)); // fixas ou desconhecidas
  const rel = disco.planoPoda(RAIZ, { harness: '22222222' }).map((x) => path.relative(RAIZ, x.caminho)).sort();
  assert.deepStrictEqual(rel, velhas.slice().sort());
});

test('planoPoda: referência de harness antigo em uso (pasta ou arquivo dentro < 1 h) nunca sai', () => {
  criar('ref-def5678/dados-h33333333', 0);                      // recém-criada por outra worktree: fica
  criar('ref-def5678/dados-h44444444', 2);                      // pasta velha, mas um arquivo dentro acabou de mudar
  fs.writeFileSync(path.join(RAIZ, 'ref-def5678/dados-h44444444/novo.png'), 'x');
  const t = new Date(Date.now() - 2 * 3600e3); fs.utimesSync(path.join(RAIZ, 'ref-def5678/dados-h44444444'), t, t);
  criar('ref-def5678/dados-h55555555.parcial-7', 0);            // captura em andamento: fica
  criar('ref-def5678/dados-h66666666', 2);                      // antigo e parado: sai
  const rel = disco.planoPoda(RAIZ, { harness: '22222222' }).map((x) => path.relative(RAIZ, x.caminho));
  assert.deepStrictEqual(rel.filter((r) => r.startsWith('ref-def5678')), ['ref-def5678/dados-h66666666']);
});

test('planoPoda: ref velha reusada agora (marcarUso) não sai', () => {
  criar('ref-fed9876/dados-h77777777', 3);
  const rel = () => disco.planoPoda(RAIZ, { harness: '22222222' }).map((x) => path.relative(RAIZ, x.caminho));
  assert.ok(rel().includes('ref-fed9876/dados-h77777777'));
  disco.marcarUso(path.join(RAIZ, 'ref-fed9876/dados-h77777777'));
  assert.ok(!rel().includes('ref-fed9876/dados-h77777777'));
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
