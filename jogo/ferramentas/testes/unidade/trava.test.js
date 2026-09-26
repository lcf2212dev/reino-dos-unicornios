// trava.js com dois processos: o segundo espera o primeiro soltar; trava de PID morto é assumida.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const TRAVA = path.join(__dirname, '..', 'trava.js');
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'trava-'));
const arq = path.join(pasta, 't.json');
const env = Object.assign({}, process.env, { REINO_TRAVA_DONA: '' });

function segurar(ms, esperarMs) {
  const cod = `require(${JSON.stringify(TRAVA)}).pegar('p' + process.pid, { arquivo: ${JSON.stringify(arq)}, esperarMs: ${esperarMs}, intervaloMs: 50 })
    .then(() => { console.log('peguei ' + Date.now()); setTimeout(() => process.exit(0), ${ms}); }, (e) => { console.log('falhei'); process.exit(4); });`;
  const p = spawn(process.execPath, ['-e', cod], { env });
  let saida = '';
  p.stdout.on('data', (b) => { saida += b; });
  return new Promise((ok) => p.on('close', (c) => ok({ c, saida })));
}

test('segundo processo espera o primeiro; sem esperar falha', async () => {
  const a = segurar(800, 0);
  await new Promise((ok) => setTimeout(ok, 300));
  const [b, semEsperar] = await Promise.all([segurar(0, 5000), segurar(0, 0)]);
  const ra = await a;
  assert.strictEqual(ra.c, 0);
  assert.strictEqual(semEsperar.c, 4);
  assert.match(b.saida, /ocupados por/);
  const ta = Number(ra.saida.match(/peguei (\d+)/)[1]), tb = Number(b.saida.match(/peguei (\d+)/)[1]);
  assert.ok(tb >= ta + 700, 'b pegou antes de a soltar');
  assert.strictEqual(fs.existsSync(arq), false, 'não soltou');
});

test('trava de PID morto é assumida', async () => {
  fs.writeFileSync(arq, JSON.stringify({ pid: 2 ** 22 + 7, nome: 'morto', desde: 'x' }));
  const r = await segurar(0, 0);
  assert.strictEqual(r.c, 0, r.saida);
});

test('trava de dono vivo mas parado (sem batida) é assumida', async () => {
  fs.writeFileSync(arq, JSON.stringify({ pid: process.pid === 1 ? 2 : 1, nome: 'preso', desde: 'x' }));
  const velho = new Date(Date.now() - 3 * 60000);
  fs.utimesSync(arq, velho, velho);
  const r = await segurar(0, 0);
  assert.strictEqual(r.c, 0, r.saida);
  assert.match(r.saida, /sem batida/);
});
