// vagas.js com dois disputantes (processos): com 1 vaga, o segundo espera o primeiro devolver e diz quem ocupa;
// reserva fixa para quem espera demais (esgotada, espera); prazo; vaga de PID morto, zumbi ou reusado é assumida; vaga
// e `.assumindo` ilegíveis nunca são apagados; derrubado na espera, diz que esperava vaga (só se não tinha nenhuma).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const vagas = require('../vagas');

const VAGAS = path.join(__dirname, '..', 'vagas.js');
const base = fs.mkdtempSync(path.join(PASTA_TESTES, 'vagas-'));
let nPasta = 0;
const novaPasta = () => { const p = path.join(base, String(++nPasta)); fs.mkdirSync(p); return p; };

// um disputante: pega uma vaga, segura `ms` e sai (devolve na saída do processo)
function disputar(pasta, nome, ms, op = {}) {
  const o = Object.assign({ pasta, total: 1, extra: 0, esperarMs: 10000, intervaloMs: 30 }, op);
  const cod = `require(${JSON.stringify(VAGAS)}).pegar(${JSON.stringify(nome)}, ${JSON.stringify(o)})
    .then((v) => { console.log('peguei ' + Date.now() + ' ' + v.arquivo); setTimeout(() => process.exit(0), ${ms}); });`;
  const p = spawn(process.execPath, ['-e', cod]);
  let saida = '';
  p.stdout.on('data', (b) => { saida += b; });
  return { p, fim: new Promise((ok) => p.on('close', (c, sinal) => ok({ c, sinal, saida }))) };
}
const quando = (r) => Number(r.saida.match(/peguei (\d+)/)[1]);
const arquivo = (r) => r.saida.match(/peguei \d+ (\S+)/)[1];
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
const desistirDepois = (n) => { let k = 0; return () => ++k > n; };
// o que o pegar avisou (console.log) enquanto `fn` roda
async function avisos(fn) {
  const log = console.log, l = [];
  console.log = (t) => l.push(String(t));
  try { return { r: await fn(), l }; } finally { console.log = log; }
}

test('dois disputantes com 1 vaga: o segundo espera o primeiro e diz quem ocupa', async () => {
  const pasta = novaPasta();
  const a = disputar(pasta, 'e2e A', 800);
  await espera(300);
  const [ra, rb] = await Promise.all([a.fim, disputar(pasta, 'e2e B', 0).fim]);
  assert.strictEqual(ra.c, 0, ra.saida);
  assert.strictEqual(rb.c, 0, rb.saida);
  assert.match(rb.saida, /a vaga está ocupada \(1 de PID \d+ "e2e A \(reino-[^)]+\)" desde \d\d:\d\d:\d\d\); espero/);
  assert.ok(quando(rb) >= quando(ra) + 700, 'B pegou antes de A devolver');
  assert.deepStrictEqual(fs.readdirSync(pasta), [], 'sobrou vaga ou temporário');
});

test('com 2 vagas, os dois entram juntos (vagas diferentes)', async () => {
  const pasta = novaPasta();
  const [ra, rb] = await Promise.all([disputar(pasta, 'x', 400, { total: 2 }).fim, disputar(pasta, 'y', 400, { total: 2 }).fim]);
  assert.doesNotMatch(ra.saida + rb.saida, /ocupad/);
  assert.notStrictEqual(arquivo(ra), arquivo(rb));
  assert.ok(Math.abs(quando(ra) - quando(rb)) < 350);
});

test('reserva: quem espera demais usa uma vaga extra; esgotada, espera (e avisa de novo com quanto esperou)', async () => {
  const pasta = novaPasta();
  const dono = disputar(pasta, 'dono', 1500);
  await espera(300);
  const op = { extra: 1, esperarMs: 100, avisoMs: 200 };
  const b = disputar(pasta, 'B', 1500, op);
  await espera(400);
  const rc = await disputar(pasta, 'C', 0, op).fim;
  const [rd, rb] = await Promise.all([dono.fim, b.fim]);
  assert.strictEqual(path.basename(arquivo(rb)), 'extra-0.json');
  assert.match(rb.saida, /uso a reserva \(extra-0\.json\)/);
  assert.match(rc.saida, /e a reserva \(1\) também .*esperando vaga há \d+ s/);
  // C só entrou quando o dono ou B devolveu
  assert.ok(quando(rc) >= Math.min(quando(rd) + 1400, quando(rb) + 1400), 'C passou do teto');
  assert.deepStrictEqual(fs.readdirSync(pasta), []);
});

test('vaga de PID morto, zumbi ou reusado é assumida; devolver apaga só a própria', async () => {
  const pasta = novaPasta(), arq = path.join(pasta, '0.json');
  fs.writeFileSync(arq, JSON.stringify({ pid: 2 ** 22 + 7, nome: 'morto', desde: 'x', chave: 'm' }));
  const v = await vagas.pegar('t', { pasta, total: 1, extra: 0, esperarMs: 0 });
  assert.strictEqual(v.arquivo, arq);
  v.soltar();
  // o próprio PID com outro início = processo que morreu e teve o PID reusado
  fs.writeFileSync(arq, JSON.stringify({ pid: process.pid, inicio: '1', nome: 'reusado', desde: 'x', chave: 'r' }));
  const w = await vagas.pegar('t', { pasta, total: 1, extra: 0, esperarMs: 0 });
  assert.strictEqual(w.arquivo, arq);
  w.soltar(); w.soltar();
  assert.deepStrictEqual(fs.readdirSync(pasta), []);
  // zumbi: o filho `sleep 0.1` morre e o pai (sleep 5, que nunca recolhe filhos) o deixa como Z
  const sh = spawn('sh', ['-c', 'sleep 0.1 & echo $!; exec sleep 5']);
  const zumbi = Number(await new Promise((ok) => sh.stdout.once('data', (b) => ok(String(b).trim()))));
  await espera(500);
  assert.match(fs.readFileSync(`/proc/${zumbi}/stat`, 'utf8'), /\) Z /);
  assert.strictEqual(vagas.vivo({ pid: zumbi }), false);
  fs.writeFileSync(arq, JSON.stringify({ pid: zumbi, nome: 'zumbi', desde: 'x', chave: 'z' }));
  const z = await vagas.pegar('t', { pasta, total: 1, extra: 0, esperarMs: 0 });
  assert.strictEqual(z.arquivo, arq);
  z.soltar();
  sh.kill();
  assert.strictEqual(vagas.vivo({ pid: process.pid }), true);
});

test('vaga ilegível e .assumindo ilegível nunca são apagados (mesmo velhos); .assumindo de dono morto sai', async () => {
  const pasta = novaPasta(), arq = path.join(pasta, '0.json'), a = arq + '.assumindo';
  const velho = new Date(Date.now() - 3600000);
  // vaga ilegível (como outra sendo criada): fica, mesmo com data velha
  fs.writeFileSync(arq, '');
  fs.utimesSync(arq, velho, velho);
  assert.strictEqual(await vagas.pegar('t', { pasta, total: 1, extra: 0, intervaloMs: 10, desistir: desistirDepois(3) }), null);
  assert.ok(fs.existsSync(arq), 'apagou a vaga ilegível');
  // vaga de morto com .assumindo ilegível e velho: nenhum dos dois sai
  fs.writeFileSync(arq, JSON.stringify({ pid: 2 ** 22 + 7, nome: 'morto', desde: 'x', chave: 'm' }));
  fs.writeFileSync(a, '');
  fs.utimesSync(a, velho, velho);
  assert.strictEqual(await vagas.pegar('t', { pasta, total: 1, extra: 0, intervaloMs: 10, desistir: desistirDepois(3) }), null);
  assert.ok(fs.existsSync(a) && fs.existsSync(arq), 'apagou o .assumindo ilegível');
  // .assumindo de dono morto: sai, e a vaga do morto é assumida
  fs.writeFileSync(a, JSON.stringify({ pid: 2 ** 22 + 9, nome: 'assumia', desde: 'x', chave: 'a' }));
  const v = await vagas.pegar('t', { pasta, total: 1, extra: 0, esperarMs: 0, intervaloMs: 10 });
  assert.strictEqual(v.arquivo, arq);
  v.soltar();
  assert.deepStrictEqual(fs.readdirSync(pasta), []);
});

test('derrubado (SIGTERM) enquanto espera: diz que esperava vaga e quem ocupa', async () => {
  const pasta = novaPasta();
  const dono = disputar(pasta, 'dono', 2000);
  await espera(300);
  const b = disputar(pasta, 'B', 0);
  await espera(400);
  b.p.kill('SIGTERM');
  const rb = await b.fim;
  assert.strictEqual(rb.c, 143, rb.saida);
  assert.match(rb.saida, /derrubado enquanto esperava vaga de Chromium \(1 de PID \d+ "dono/);
  assert.strictEqual((await dono.fim).c, 0);
  assert.deepStrictEqual(fs.readdirSync(pasta), [], 'sobrou .tmp do derrubado');
});

test('SIGINT e SIGHUP enquanto espera: sai com 130/129 e não sobra .tmp', async () => {
  for (const [sinal, codigo] of [['SIGINT', 130], ['SIGHUP', 129]]) {
    const pasta = novaPasta();
    const dono = disputar(pasta, 'dono', 1500);
    await espera(300);
    const b = disputar(pasta, 'B', 0);
    await espera(400);
    assert.ok(fs.readdirSync(pasta).some((f) => f.startsWith('.tmp-')), 'o B espera com o .tmp');
    b.p.kill(sinal);
    const rb = await b.fim;
    assert.strictEqual(rb.c, codigo, sinal + ': ' + rb.saida);
    assert.strictEqual((await dono.fim).c, 0);
    assert.deepStrictEqual(fs.readdirSync(pasta), [], `sobrou .tmp do ${sinal}`);
  }
});

test('derrubado segurando vaga (e outra aba esperando): não culpa a espera, e solta tudo', async () => {
  const pasta = novaPasta();
  const cod = `const v = require(${JSON.stringify(VAGAS)}), o = { pasta: ${JSON.stringify(pasta)}, total: 1, extra: 0, intervaloMs: 30 };
    v.pegar('a', o).then(() => { console.log('peguei'); return v.pegar('b', o); });`;
  const p = spawn(process.execPath, ['-e', cod]);
  let saida = '';
  p.stdout.on('data', (b) => { saida += b; });
  const fim = new Promise((ok) => p.on('close', (c) => ok(c)));
  await espera(500);
  p.kill('SIGTERM');
  assert.strictEqual(await fim, 143);
  assert.match(saida, /peguei/);
  assert.doesNotMatch(saida, /derrubado/);
  assert.deepStrictEqual(fs.readdirSync(pasta), []);
});

test('prazo: sem vaga até prazoMs, lança dizendo quem ocupa e não pega vaga depois', async () => {
  const pasta = novaPasta();
  const dono = disputar(pasta, 'dono', 1200);
  await espera(300);
  const t0 = Date.now();
  await assert.rejects(vagas.pegar('t', { pasta, total: 1, extra: 0, prazoMs: 300, intervaloMs: 20 }),
    /^Error: ✘ sem vaga de Chromium há \d+ s \(1 de PID \d+ "dono .*\)$/);
  assert.ok(Date.now() - t0 < 1000);
  assert.strictEqual((await dono.fim).c, 0);
  assert.deepStrictEqual(fs.readdirSync(pasta).filter((f) => f.startsWith('.tmp')), []);
});

test('avisos: reserva só para quem não tem vaga; vaga ilegível aparece como ilegível', async () => {
  const pasta = novaPasta();
  const v = await vagas.pegar('eu', { pasta, total: 1, extra: 1, esperarMs: 0 });
  const { r, l } = await avisos(() => vagas.pegar('eu', { pasta, total: 1, extra: 1, esperarMs: 0, intervaloMs: 10, desistir: desistirDepois(3) }));
  assert.strictEqual(r, null);
  assert.ok(l.length && l.every((t) => !/reserva/.test(t)), l.join('\n'));
  v.soltar();
  fs.writeFileSync(path.join(pasta, '0.json'), '');
  const x = await avisos(() => vagas.pegar('eu', { pasta, total: 1, extra: 0, intervaloMs: 10, desistir: desistirDepois(3) }));
  assert.match(x.l.join('\n'), /a vaga está ocupada \(1 ilegível\)/);
  fs.unlinkSync(path.join(pasta, '0.json'));
  assert.deepStrictEqual(fs.readdirSync(pasta), []);
});

test('a pasta das vagas é fixa (todas as worktrees dividem, com ou sem REINO_TESTES)', () => {
  assert.strictEqual(vagas.PASTA, '/tmp/reino-testes/vagas');
});
