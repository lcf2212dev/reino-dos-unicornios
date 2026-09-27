// artifact-delta.js com acento no nome do arquivo (auditoria): sem core.quotePath=false o git devolve
// "jogo/js/a\303\247\303\243o.js" entre aspas, o arquivo mudado some do delta (não seria publicado) e o pacote de
// voz sai com o nome errado na lista. Roda num repositório git temporário (nunca o de verdade).
// Uso: node --test jogo/ferramentas/testes/unidade/artifact-delta-acento.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const D = require('../../artifact-delta.js');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const repo = fs.mkdtempSync(path.join(PASTA_TESTES, 'artifact-delta-acento-'));
const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' });
const grava = (f, txt) => { fs.mkdirSync(path.dirname(path.join(repo, f)), { recursive: true }); fs.writeFileSync(path.join(repo, f), txt); };
const manifesto = (js) => grava('jogo/js/manifesto.js', 'module.exports = ' + JSON.stringify({ css: ['css/a.css'], scripts: js.map((j) => ({ js: j })) }) + ';\n');
const commit = (msg) => { git('add', '-A'); git('commit', '-qm', msg); return git('rev-parse', 'HEAD').trim(); };

git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't'); git('config', 'commit.gpgsign', 'false');
grava('jogo/css/a.css', 'a{}'); grava('jogo/js/ação.js', 'a'); grava('jogo/js/sessão.js', 's'); grava('jogo/js/voz/lição.js', 'v');
manifesto(['js/ação.js', 'js/sessão.js']);
const c1 = commit('um');

test('listaPublicada: pacote de voz com acento sai com o nome de verdade', () => {
  assert.deepStrictEqual(D.listaPublicada(c1, repo), ['css/a.css', 'js/ação.js', 'js/sessão.js', 'js/voz/lição.js']);
});

test('delta: arquivo com acento novo, mudado e removido', () => {
  grava('jogo/js/ação.js', 'a2'); grava('jogo/js/voz/lição.js', 'v2'); grava('jogo/js/canção.js', 'c');
  fs.unlinkSync(path.join(repo, 'jogo/js/sessão.js'));
  manifesto(['js/ação.js', 'js/canção.js']);
  commit('dois');
  const d = D.delta(c1, repo);
  assert.deepStrictEqual(d.novos, ['js/canção.js']);
  assert.deepStrictEqual(d.mudados, ['js/ação.js', 'js/voz/lição.js']);
  assert.deepStrictEqual(d.removidos, ['js/sessão.js']);
  grava('jogo/css/ç.css', 'b');
  assert.deepStrictEqual(D.sujas(repo), ['?? jogo/css/ç.css']);
});
