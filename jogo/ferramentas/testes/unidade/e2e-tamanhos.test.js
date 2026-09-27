// e2e.js --tamanhos com nome que não existe (ex.: erro de digitação "celulr") para logo com código 2, como uma
// opção desconhecida. Bug da auditoria: ele seguia, fotografava o "celulr" na janela padrão do Playwright (1280×720,
// TAMANHOS[x] undefined), a base também, e dizia "✔ E2E OK" sem ter testado o celular.
// Pasta de testes própria (REINO_TESTES) para não disputar a trava nem as caches dos outros. Sem a correção o e2e
// começaria a capturar: em 8 s o teste derruba o grupo do filho que ele mesmo criou (detached).
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-tamanhos.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const E2E = path.join(__dirname, '..', 'e2e.js');

function rodarE2e(args) {
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'e2e-tamanhos-'));
  const p = spawn(process.execPath, [E2E, ...args], { cwd: REPO, env: Object.assign({}, process.env, { REINO_TESTES: pasta, REINO_TRAVA_DONA: '' }), detached: true });
  let saida = '';
  p.stdout.on('data', (b) => { saida += b; }); p.stderr.on('data', (b) => { saida += b; });
  return new Promise((ok) => {
    const t = setTimeout(() => { try { process.kill(-p.pid, 'SIGKILL'); } catch (e) { /* saiu */ } ok({ codigo: 'ainda rodando após 8 s', saida }); }, 8000);
    p.on('exit', (c) => { clearTimeout(t); ok({ codigo: c, saida }); });
  });
}

test('e2e recusa --tamanhos desconhecido antes de capturar', { timeout: 30000 }, async () => {
  const r = await rodarE2e(['--tamanhos', 'celulr', '--cenas', '^mapa$', '--sem-esperar']);
  assert.strictEqual(r.codigo, 2, `aceitou --tamanhos celulr (${r.codigo}); saída:\n${r.saida}`);
  assert.match(r.saida, /✘ tamanho desconhecido: celulr \(celular, tablet, notebook\)/);
});

test('e2e recusa um desconhecido no meio de uma lista', { timeout: 30000 }, async () => {
  const r = await rodarE2e(['--tamanhos', 'celular,tabelt', '--sem-esperar']);
  assert.strictEqual(r.codigo, 2, `aceitou --tamanhos celular,tabelt (${r.codigo}); saída:\n${r.saida}`);
  assert.match(r.saida, /tamanho desconhecido: tabelt/);
});
