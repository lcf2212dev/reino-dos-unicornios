// Testes de unidade: os atalhos testar-save.js e testar-banho.js não saem com 0 quando o `node --test` filho morre
// por sinal (OOM killer, kill -9 do vigia): aí o status é null e process.exit(null) saía com 0 (falso verde).
// SEM sinal de verdade: cada atalho roda com um preload que troca o spawnSync por um que devolve o resultado de um
// filho morto por SIGKILL (status null). Nenhum processo recebe sinal.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/testar-save-sinal.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

fs.mkdirSync(PASTA_TESTES, { recursive: true });
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'testar-sinal-'));
const preload = path.join(pasta, 'filho-morto.js');
fs.writeFileSync(preload, "require('child_process').spawnSync = () => ({ status: null, signal: 'SIGKILL', stdout: '', stderr: '' });\n");
fs.mkdirSync(path.join(pasta, 'unidade'));   // o testar-save.js lista esta pasta

for (const atalho of ['testar-save.js', 'testar-banho.js']) {
  test(`${atalho}: filho morto por sinal (status null) não sai com 0`, () => {
    fs.copyFileSync(path.join(__dirname, '..', atalho), path.join(pasta, atalho));
    const r = spawnSync(process.execPath, ['--require', preload, path.join(pasta, atalho)], { encoding: 'utf8', timeout: 30000 });
    assert.strictEqual(r.signal, null, r.stdout + r.stderr);
    assert.notStrictEqual(r.status, 0, `${atalho} saiu com 0 embora o node --test tenha morrido por sinal:\n${r.stdout}${r.stderr}`);
  });
}
