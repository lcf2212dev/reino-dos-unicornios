// unidade.js: as duas filas (Node puro e navegador), a ordem pelos mais lentos, a soma do resumo e o reporter das
// durações. Sem navegador. Rodar (da raiz): npm run unidade -- --so unidade-filas
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const U = require('../unidade');

// roda fn sem as variáveis de concorrência (o teste não depende do ambiente de quem roda)
function semAmbiente(fn, poe = {}) {
  const ks = ['REINO_UNIDADE_NODE', 'REINO_UNIDADE_NAVEGADOR'], antes = ks.map((k) => process.env[k]);
  try { ks.forEach((k) => { if (poe[k] === undefined) delete process.env[k]; else process.env[k] = poe[k]; }); return fn(); }
  finally { ks.forEach((k, i) => { if (antes[i] === undefined) delete process.env[k]; else process.env[k] = antes[i]; }); }
}

test('ordem: sem histórico primeiro, depois do mais lento ao mais rápido', () => {
  const d = { 'a.test.js': 100, 'b.test.js': 5000, 'c.navegador.test.js': 900 };
  assert.deepStrictEqual(U.ordenar(['a.test.js', 'b.test.js', 'novo.test.js', 'c.navegador.test.js', 'aa.test.js'], d),
    ['aa.test.js', 'novo.test.js', 'b.test.js', 'c.navegador.test.js', 'a.test.js']);
  assert.deepStrictEqual(U.ordenar(['z.test.js', 'm.test.js'], {}), ['m.test.js', 'z.test.js'], 'sem histórico: alfabética');
});

test('filas: navegador à parte, cada uma com o seu limite (variáveis de ambiente mudam)', () => {
  const f = semAmbiente(() => U.filas(['/x/a.test.js', '/x/b.navegador.test.js', '/x/c.test.js']));
  assert.deepStrictEqual(f.map((q) => q.lista), [['/x/a.test.js', '/x/c.test.js'], ['/x/b.navegador.test.js']]);
  assert.ok(f[0].concorrencia >= f[1].concorrencia, 'padrão: Node puro com mais por vez que o navegador');
  assert.strictEqual(U.filas(['/x/a.test.js']).length, 1, 'fila vazia não roda');
  assert.deepStrictEqual(semAmbiente(() => [U.concorrencia.node(), U.concorrencia.navegador()], { REINO_UNIDADE_NODE: '3', REINO_UNIDADE_NAVEGADOR: '2' }), [3, 2]);
});

// a ordem REAL: o `node --test` punha os arquivos em ordem alfabética; a fila tem de rodar na ordem pedida
test('a fila roda os arquivos na ordem pedida (não alfabética), grava as durações e sai 1 se um falha', () => {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'unidade-filas-'));
  const log = path.join(pasta, 'ordem.txt');
  const arq = (n, falha) => {
    const f = path.join(pasta, n + '.test.js');
    fs.writeFileSync(f, `require('fs').appendFileSync(${JSON.stringify(log)}, '${n}\\n');
require('node:test')('${n}', () => { ${falha ? "throw new Error('de propósito');" : ''} });\n`);
    return f;
  };
  const lista = [arq('z'), arq('m'), arq('a')];
  const destino = path.join(pasta, 'duracoes.jsonl');
  // fora do contexto deste node --test (com NODE_TEST_CONTEXT o filho só se reportaria a ele, sem rodar os arquivos)
  const env = Object.assign({}, process.env); delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, U.argsFila(lista, 1, destino), { encoding: 'utf8', env });
  assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  assert.deepStrictEqual(fs.readFileSync(log, 'utf8').trim().split('\n'), ['z', 'm', 'a']);
  const dur = fs.readFileSync(destino, 'utf8').trim().split('\n').map((l) => JSON.parse(l).file);
  assert.deepStrictEqual(dur, ['z.test.js', 'm.test.js', 'a.test.js']);
  const ruim = spawnSync(process.execPath, U.argsFila([arq('b', true)], 1, path.join(pasta, 'd2.jsonl')), { encoding: 'utf8', env });
  assert.strictEqual(ruim.status, 1, 'teste que falha: a fila sai com 1');
});

test('somar: a última linha de cada fila, somadas', () => {
  const a = 'ℹ tests 1\nℹ pass 1\nℹ fail 0\n…\nℹ tests 10\nℹ pass 9\nℹ fail 1\n';
  const b = 'ℹ tests 5\nℹ pass 5\nℹ fail 0\n';
  assert.deepStrictEqual(U.somar([a, b]), { tests: 15, pass: 14, fail: 1 });
});

test('reporter: uma linha por teste de 1º nível, com o arquivo e a duração', async () => {
  async function* eventos() {
    yield { type: 'test:pass', data: { nesting: 0, file: '/x/a.test.js', details: { duration_ms: 12.4 } } };
    yield { type: 'test:pass', data: { nesting: 1, file: '/x/a.test.js', details: { duration_ms: 3 } } };
    yield { type: 'test:fail', data: { nesting: 0, file: '/x/b.test.js', details: { duration_ms: 7 } } };
    yield { type: 'test:diagnostic', data: { nesting: 0, message: 'x' } };
  }
  const linhas = [];
  for await (const l of U(eventos())) linhas.push(JSON.parse(l));
  assert.deepStrictEqual(linhas, [{ file: 'a.test.js', ms: 12 }, { file: 'b.test.js', ms: 7 }]);
});
