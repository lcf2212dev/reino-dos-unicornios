// Roda um comando num grupo de processos próprio, com tempo máximo: no estouro derruba o grupo INTEIRO
// (o Chromium do Playwright e os filhos do `node --test` ficam dentro). Nunca pkill por nome.
// Em código: const { rodar } = require('./processo');
//   const r = await rodar(process.execPath, ['x.js'], { cwd, timeoutMs: 60000, aoVivo: false, nome: 'x' });
//   r = { status, saida, estourou, pgid }
const { spawn } = require('child_process');

const ESPERA_KILL = 5000;
const vivos = new Set(); // pgids dos grupos ainda rodando (para derrubar se o pai for parado)

function derrubar(pgid, sinal) {
  try { process.kill(-pgid, sinal); } catch (e) { /* o grupo já acabou */ }
}

// pai parado (Ctrl+C, kill, terminal fechado): leva os grupos junto
const CODIGOS = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 };
let sinaisPostos = false;
function porSinais() {
  if (sinaisPostos) return;
  sinaisPostos = true;
  Object.keys(CODIGOS).forEach((s) => process.on(s, () => {
    for (const g of vivos) derrubar(g, 'SIGTERM');
    setTimeout(() => { for (const g of vivos) derrubar(g, 'SIGKILL'); process.exit(CODIGOS[s]); }, 300).unref();
    if (!vivos.size) process.exit(CODIGOS[s]);
  }));
  process.on('exit', () => { for (const g of vivos) derrubar(g, 'SIGKILL'); });
}

function rodar(cmd, args, op = {}) {
  porSinais();
  return new Promise((resolver) => {
    const proc = spawn(cmd, args, { cwd: op.cwd, env: op.env || process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const pgid = proc.pid;
    vivos.add(pgid);
    let saida = '', estourou = false, matar = null;
    const ler = (fluxo) => (b) => { saida += b; if (op.aoVivo) fluxo.write(b); };
    proc.stdout.on('data', ler(process.stdout));
    proc.stderr.on('data', ler(process.stderr));
    const tempo = op.timeoutMs ? setTimeout(() => {
      estourou = true;
      derrubar(pgid, 'SIGTERM');
      matar = setTimeout(() => derrubar(pgid, 'SIGKILL'), ESPERA_KILL);
    }, op.timeoutMs) : null;
    proc.once('error', (e) => { saida += String(e && e.message) + '\n'; });
    proc.once('close', (status, sinal) => {
      clearTimeout(tempo);
      // o líder saiu, mas um neto pode ter ficado no grupo: derruba o resto
      derrubar(pgid, 'SIGTERM');
      if (matar) clearTimeout(matar);
      setTimeout(() => { derrubar(pgid, 'SIGKILL'); vivos.delete(pgid); }, estourou ? 200 : 0);
      resolver({ status: status === null ? 1 : status, sinal, saida, estourou, pgid, nome: op.nome });
    });
  });
}

module.exports = { rodar, derrubar };
