// verdes.js: a chave da árvore muda com arquivo novo, mudado e apagado; não muda com node_modules; não mexe no índice
// de verdade. Repositório git sintético em /tmp/reino-testes/. Sem navegador.
// Rodar (da raiz): npm run unidade -- --so verdes
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const V = require('../verdes');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const raiz = fs.mkdtempSync(path.join(PASTA_TESTES, 'verdes-'));
const git = (...a) => execFileSync('git', a, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const escrever = (rel, t) => { fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true }); fs.writeFileSync(path.join(raiz, rel), t); };
git('init', '-q');
escrever('a.js', 'um\n');
escrever('pasta/b.js', 'dois\n');
git('add', '-A');
git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'base');

test('a chave muda com arquivo novo, mudado e apagado (com ou sem git add) e volta igual', () => {
  const k0 = V.chave(raiz);
  assert.strictEqual(V.chave(raiz), k0, 'a mesma árvore dá a mesma chave');
  escrever('novo.txt', 'x\n');
  const k1 = V.chave(raiz);
  assert.notStrictEqual(k1, k0, 'arquivo novo (não rastreado)');
  escrever('a.js', 'um mudado\n');
  const k2 = V.chave(raiz);
  assert.notStrictEqual(k2, k1, 'arquivo mudado');
  fs.unlinkSync(path.join(raiz, 'pasta/b.js'));
  const k3 = V.chave(raiz);
  assert.notStrictEqual(k3, k2, 'arquivo apagado');
  escrever('pasta/b.js', 'dois\n'); escrever('a.js', 'um\n'); fs.unlinkSync(path.join(raiz, 'novo.txt'));
  assert.strictEqual(V.chave(raiz), k0, 'de volta ao que era: a chave de antes');
  assert.strictEqual(git('status', '--porcelain'), '', 'o índice de verdade não mudou');
});

test('node_modules (mesmo fora do .gitignore) não muda a chave', () => {
  const k0 = V.chave(raiz);
  escrever('node_modules/pacote/index.js', 'x\n');
  assert.strictEqual(V.chave(raiz), k0, 'node_modules sem .gitignore');
  escrever('node_modules/pacote/index.js', 'y\n');
  assert.strictEqual(V.chave(raiz), k0, 'node_modules mudado');
  assert.strictEqual(git('status', '--porcelain').trim(), '?? node_modules/', 'o índice de verdade não mudou');
});

test('REINO_RESERVAS_ABERTAS e os modos estritos entram na chave (tempos e pastas não); marcar e verde', () => {
  const antes = process.env.REINO_RESERVAS_ABERTAS, antesTip = process.env.REINO_TIPOGRAFIA_ESTRITA;
  try {
    delete process.env.REINO_TIPOGRAFIA_ESTRITA;
    escrever('unico.txt', `${process.pid} ${Date.now()} ${Math.random()}\n`);   // árvore nunca vista (a chave é só do conteúdo)
    delete process.env.REINO_RESERVAS_ABERTAS;
    const k = V.chave(raiz);
    process.env.REINO_RESERVAS_ABERTAS = '1';
    assert.notStrictEqual(V.chave(raiz), k);
    assert.strictEqual(V.verde(k), null);
    V.marcar(k, { worktree: raiz });
    assert.strictEqual(V.verde(k).worktree, raiz);
    assert.ok(V.verde(k).quando);
    // as de modo estrito mudam o resultado (entram); tempo, concorrência e pasta não
    const comReservas = V.chave(raiz);
    process.env.REINO_TIPOGRAFIA_ESTRITA = '1';
    assert.notStrictEqual(V.chave(raiz), comReservas, 'REINO_TIPOGRAFIA_ESTRITA muda a chave');
    assert.deepStrictEqual(V.ambiente({ REINO_TIPOGRAFIA_ESTRITA: '1', REINO_MOVIMENTO_ESTRITO: '1', REINO_TEMPO: '2', REINO_UNIDADE_NODE: '4', REINO_TESTES: '/tmp/x', OUTRA: '1' }),
      ['REINO_MOVIMENTO_ESTRITO=1', 'REINO_TIPOGRAFIA_ESTRITA=1']);
  } finally {
    if (antesTip === undefined) delete process.env.REINO_TIPOGRAFIA_ESTRITA; else process.env.REINO_TIPOGRAFIA_ESTRITA = antesTip;
    if (antes === undefined) delete process.env.REINO_RESERVAS_ABERTAS; else process.env.REINO_RESERVAS_ABERTAS = antes;
  }
});
