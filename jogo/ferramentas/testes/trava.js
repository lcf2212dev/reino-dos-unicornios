// Uma trava por worktree para os testes de navegador: dois `npm test`/`npm run e2e` na mesma worktree ao
// mesmo tempo disputam portas, Chromium e /tmp e ficam presos. Arquivo em /tmp/reino-testes/travas/<sha1 da raiz>.json
// com { pid, nome, desde }. Trava de PID morto é assumida. Solta sozinha no `exit`.
// Filhos de quem tem a trava (REINO_TRAVA_DONA no ambiente) passam direto (ex.: testar-tudo → e2e --so-dados).
// Em código: await require('./trava').pegar('npm test', { esperarMs: 600000 });  (--sem-esperar: esperarMs 0)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PASTA_TESTES } = require('./guardas');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const PASTA = path.join(PASTA_TESTES, 'travas');
const ESPERA_PADRAO = 10 * 60 * 1000;

function arquivoDa(raiz = RAIZ) {
  return path.join(PASTA, crypto.createHash('sha1').update(path.resolve(raiz)).digest('hex') + '.json');
}
function vivo(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}
// batida: o dono renova a data do arquivo a cada 20 s; sem batida há mais de 2 min, o dono travou (processo vivo mas
// parado, como um e2e preso) e a trava pode ser assumida
const BATIDA_MS = 20000, SEM_BATIDA_MS = 120000;
function parado(arq) {
  try { return Date.now() - fs.statSync(arq).mtimeMs > SEM_BATIDA_MS; } catch (e) { return false; }
}
function ler(arq) {
  try { return JSON.parse(fs.readFileSync(arq, 'utf8')); } catch (e) { return null; }
}

// tenta criar o arquivo (wx: atômico); trava de dono morto ou ilegível é trocada
function tentar(arq, nome) {
  const dados = JSON.stringify({ pid: process.pid, nome, desde: new Date().toISOString() });
  try { fs.writeFileSync(arq, dados, { flag: 'wx' }); return null; } catch (e) { if (e.code !== 'EEXIST') throw e; }
  const dono = ler(arq);
  if (dono && dono.pid === process.pid) return null;
  if (dono && vivo(dono.pid) && !parado(arq)) return dono;
  if (dono && vivo(dono.pid)) console.log(`⚠ a trava de "${dono.nome}" (PID ${dono.pid}) está sem batida há mais de ${SEM_BATIDA_MS / 60000} min: assumo`);
  // morto ou parado: assume (renomeia por cima; se outro assumiu junto, confere quem ficou)
  const tmp = arq + '.' + process.pid;
  fs.writeFileSync(tmp, dados);
  fs.renameSync(tmp, arq);
  const agora = ler(arq);
  return agora && agora.pid === process.pid ? null : agora;
}

async function pegar(nome, op = {}) {
  const dona = Number(process.env.REINO_TRAVA_DONA);
  const arq = op.arquivo || arquivoDa(op.raiz);
  if (dona && dona !== process.pid) { const d = ler(arq); if (d && d.pid === dona) return { arquivo: arq, herdada: true }; }
  fs.mkdirSync(PASTA, { recursive: true });
  const esperarMs = op.esperarMs !== undefined ? op.esperarMs : (process.argv.includes('--sem-esperar') ? 0 : ESPERA_PADRAO);
  const fim = Date.now() + esperarMs;
  let avisou = false;
  for (;;) {
    const dono = tentar(arq, nome);
    if (!dono) break;
    if (!avisou) {
      console.log(`⏳ testes desta worktree ocupados por "${dono.nome}" (PID ${dono.pid}, desde ${dono.desde}); ` +
        (esperarMs ? `espero até ${Math.round(esperarMs / 60000) || 1} min` : 'sem esperar'));
      avisou = true;
    }
    if (Date.now() >= fim) throw new Error(`trava ocupada por "${dono.nome}" (PID ${dono.pid}); tente depois`);
    await new Promise((r) => setTimeout(r, op.intervaloMs || 1000));
  }
  process.env.REINO_TRAVA_DONA = String(process.pid);
  const batida = setInterval(() => { try { const t = new Date(); fs.utimesSync(arq, t, t); } catch (e) { /* saiu */ } }, BATIDA_MS);
  batida.unref();
  process.once('exit', () => { clearInterval(batida); soltar(arq); });
  return { arquivo: arq, herdada: false };
}

function soltar(arq = arquivoDa()) {
  const d = ler(arq);
  if (d && d.pid === process.pid) try { fs.unlinkSync(arq); } catch (e) { /* já saiu */ }
}

module.exports = { pegar, soltar, arquivoDa, vivo, parado, SEM_BATIDA_MS };
