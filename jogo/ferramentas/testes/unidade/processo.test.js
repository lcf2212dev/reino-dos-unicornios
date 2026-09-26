// processo.js: no estouro o grupo inteiro (filho e neto) morre e `estourou` vem true.
const test = require('node:test');
const assert = require('node:assert');
const { rodar } = require('../processo');
const { vivo } = require('../trava');

test('estouro derruba filho e neto', async () => {
  const filho = `const { spawn } = require('child_process');
    const n = spawn('sleep', ['30'], { stdio: 'ignore' });
    console.log('neto ' + n.pid + ' filho ' + process.pid); setInterval(() => {}, 1000);`;
  const r = await rodar(process.execPath, ['-e', filho], { timeoutMs: 1000, nome: 'dorminhoco' });
  assert.strictEqual(r.estourou, true);
  const [, neto, , pai] = r.saida.trim().split(' ').map(Number);
  await new Promise((ok) => setTimeout(ok, 400));
  assert.ok(neto > 0 && pai > 0, r.saida);
  assert.strictEqual(vivo(pai), false, 'filho vivo');
  assert.strictEqual(vivo(neto), false, 'neto vivo');
});

test('sem estouro devolve status e saída', async () => {
  const r = await rodar(process.execPath, ['-e', 'console.log("oi"); process.exit(3)'], { timeoutMs: 5000 });
  assert.deepStrictEqual([r.status, r.saida.trim(), r.estourou], [3, 'oi', false]);
});
