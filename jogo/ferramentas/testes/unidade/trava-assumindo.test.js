// trava.js: a janela de quem está assumindo uma trava parada (auditoria, conferente anterior). Entre o `stat` e o
// `rename` de quem assume (A), o dono parado acorda e solta; outro (C) cria a trava pelo caminho rápido; A a tira do
// caminho e, antes de devolvê-la, um terceiro (D) cria a dele: a devolução dá EEXIST, a de C se perde e C e D ficam
// os dois donos. Determinístico: este processo é A, e ganchos em fs.renameSync/fs.linkSync (só aqui) rodam C e D,
// processos filhos de verdade, no meio exato da janela. O dono parado é um filho que só espera o stdin fechar.
// Uso: node --test jogo/ferramentas/testes/unidade/trava-assumindo.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');

const TRAVA = path.join(__dirname, '..', 'trava.js');
const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'trava-assumindo-'));
const arq = path.join(pasta, 't.json');
const env = Object.assign({}, process.env, { REINO_TRAVA_DONA: '' });

// disputante que pega a trava e sai SEM soltar (reallyExit pula o 'exit'): o arquivo fica como estava ao pegar
function disputante(alvo = arq) {
  const cod = `require(${JSON.stringify(TRAVA)}).pegar('d' + process.pid, { arquivo: ${JSON.stringify(alvo)}, esperarMs: 0 })
    .then(() => { console.log('peguei'); process.reallyExit(0); }, () => process.reallyExit(4));`;
  return /peguei/.test(spawnSync(process.execPath, ['-e', cod], { env, encoding: 'utf8', timeout: 20000 }).stdout);
}

test('dono parado solta no meio de quem assume: nunca dois donos', async () => {
  const parado = spawn(process.execPath, ['-e', "process.stdin.resume(); process.stdin.on('end', () => process.exit(0));"], { stdio: ['pipe', 'ignore', 'ignore'] });
  fs.writeFileSync(arq, JSON.stringify({ pid: parado.pid, nome: 'parado', desde: 'x' }));
  const velho = new Date(Date.now() - 3 * 60000);
  fs.utimesSync(arq, velho, velho);

  const pegaram = [];
  const { renameSync, linkSync } = fs;
  fs.renameSync = function (de, para) {
    if (de === arq && /\.morto\./.test(para) && !pegaram.C) {
      fs.unlinkSync(arq);                // o dono parado acordou e soltou (soltar)
      pegaram.C = disputante();          // C chega e cria a trava
    }
    return renameSync.apply(fs, arguments);
  };
  fs.linkSync = function (de, para) {
    if (para === arq && /\.morto\./.test(de) && !pegaram.D) pegaram.D = disputante();   // D chega antes da devolução
    return linkSync.apply(fs, arguments);
  };
  let A = false;
  try {
    await require(TRAVA).pegar('A', { arquivo: arq, esperarMs: 0 }).then(() => { A = true; }, () => {});
  } finally {
    fs.renameSync = renameSync; fs.linkSync = linkSync;
    parado.stdin.end();
  }
  const donos = ['A', 'C', 'D'].filter((q) => (q === 'A' ? A : pegaram[q]));
  assert.ok(donos.length <= 1, `donos ao mesmo tempo: ${donos.join(', ')}`);
  assert.strictEqual(donos.length, 1, 'ninguém ficou com a trava');
  const dono = JSON.parse(fs.readFileSync(arq, 'utf8'));
  if (A) assert.strictEqual(dono.pid, process.pid, 'A pegou mas o arquivo não é dele');
  await new Promise((ok) => (parado.exitCode !== null ? ok() : parado.on('close', ok)));
});

// soltar() lia e depois apagava: o dono parado (este processo) que acorda e solta no meio da tomada por outro (A)
// apagava a trava NOVA de A, e um terceiro podia criar a sua: dois donos. O gancho em fs.unlinkSync roda A no vão.
test('dono parado que solta no meio da tomada não apaga a trava nova', () => {
  const arq2 = path.join(pasta, 's.json');
  fs.writeFileSync(arq2, JSON.stringify({ pid: process.pid, nome: 'parado', desde: 'x' }));
  const velho = new Date(Date.now() - 3 * 60000);
  fs.utimesSync(arq2, velho, velho);
  const { unlinkSync } = fs;
  let A = null;
  fs.unlinkSync = function (p) {
    if (p === arq2 && A === null) A = disputante(arq2);
    return unlinkSync.apply(fs, arguments);
  };
  try { require(TRAVA).soltar(arq2); } finally { fs.unlinkSync = unlinkSync; }
  const dono = fs.existsSync(arq2) ? JSON.parse(fs.readFileSync(arq2, 'utf8')) : null;
  if (A) assert.ok(dono && dono.pid !== process.pid, 'A assumiu a trava, mas o soltar do dono parado a apagou');
  else assert.strictEqual(dono, null, 'o dono soltou, mas a trava ficou');
});
