// artifact-delta.js: lista publicada num commit, delta (novo, mudado, removido, renomeado) e lotes ≤250
// com a página e os removidos no último. Roda num repositório git temporário em /tmp/reino-testes/.
// Uso: node --test jogo/ferramentas/testes/unidade/artifact-delta.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const D = require('../../artifact-delta.js');

fs.mkdirSync('/tmp/reino-testes', { recursive: true });
const repo = fs.mkdtempSync('/tmp/reino-testes/artifact-delta-');
const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' });
const grava = (f, txt) => { fs.mkdirSync(path.dirname(path.join(repo, f)), { recursive: true }); fs.writeFileSync(path.join(repo, f), txt); };
const manifesto = (js) => grava('jogo/js/manifesto.js', 'module.exports = ' + JSON.stringify({ css: ['css/a.css'], scripts: js.map((j) => ({ js: j })) }) + ';\n');
const commit = (msg) => { git('add', '-A'); git('commit', '-qm', msg); return git('rev-parse', 'HEAD').trim(); };

git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
grava('jogo/css/a.css', 'a{}'); grava('jogo/js/x.js', 'x'); grava('jogo/js/y.js', 'y'); grava('jogo/js/velho.js', 'velho\n'.repeat(20));
grava('jogo/js/voz/geral.js', 'g'); grava('jogo/js/CLAUDE.md', 'r'); grava('jogo/index.html', '<p>');
manifesto(['js/x.js', 'js/y.js', 'js/velho.js']);
const c1 = commit('um');

test('listaPublicada: css, scripts e vozes do commit', () => {
  assert.deepStrictEqual(D.listaPublicada(c1, repo), ['css/a.css', 'js/x.js', 'js/y.js', 'js/velho.js', 'js/voz/geral.js']);
});

test('delta: novo, mudado, removido e renomeado; CLAUDE.md e manifesto ficam de fora', () => {
  grava('jogo/js/x.js', 'x2'); grava('jogo/js/CLAUDE.md', 'r2'); grava('jogo/js/z.js', 'z'); grava('jogo/index.html', '<p>2');
  fs.unlinkSync(path.join(repo, 'jogo/js/y.js'));
  fs.renameSync(path.join(repo, 'jogo/js/velho.js'), path.join(repo, 'jogo/js/novo.js'));
  manifesto(['js/x.js', 'js/novo.js', 'js/z.js']);
  commit('dois');
  const d = D.delta(c1, repo);
  assert.deepStrictEqual(d.novos, ['js/novo.js', 'js/z.js']);
  assert.deepStrictEqual(d.mudados, ['js/x.js']);
  assert.deepStrictEqual(d.removidos, ['js/velho.js', 'js/y.js']);
  assert.strictEqual(d.pagina, true);
  assert.deepStrictEqual(D.sujas(repo), []);
  grava('jogo/css/b.css', 'b');
  assert.strictEqual(D.sujas(repo).length, 1);
});

test('lotes: 300 entradas em 2, removidos (null) só no último', () => {
  const novos = Array.from({ length: 290 }, (_, i) => `js/n${i}.js`);
  const removidos = Array.from({ length: 10 }, (_, i) => `js/r${i}.js`);
  const g = D.lotes({ novos, mudados: [], removidos }, '/jogo');
  assert.deepStrictEqual(g.map((x) => Object.keys(x).length), [250, 50]);
  assert.ok(Object.values(g[0]).every((v) => v !== null));
  assert.deepStrictEqual(Object.keys(g[1]).filter((k) => g[1][k] === null), removidos);
  assert.strictEqual(g[0]['js/n0.js'], '/jogo/js/n0.js');
  // lote cheio de envios: os removidos vão num lote próprio no fim
  assert.deepStrictEqual(D.lotes({ novos: novos.slice(0, 250), mudados: [], removidos }, '/j').map((x) => Object.keys(x).length), [250, 10]);
  assert.deepStrictEqual(D.lotes({ novos: [], mudados: [], removidos: [] }, '/j'), [{}]);
});

test('registrar troca só a linha de dados', () => {
  const arq = path.join(repo, 'reg.txt');
  fs.writeFileSync(arq, '# comentário\n# outro\nabc1234 https://x/y v1\n');
  D.registrar('def5678', 'v2', arq);
  assert.strictEqual(fs.readFileSync(arq, 'utf8'), '# comentário\n# outro\ndef5678 https://x/y v2\n');
  assert.throws(() => D.registrar('zzz', 'v3', arq));
});
