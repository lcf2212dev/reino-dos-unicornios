// Uma trava por worktree para os testes de navegador: dois `npm test`/`npm run e2e` na mesma worktree ao
// mesmo tempo disputam portas, Chromium e /tmp e ficam presos. Arquivo em /tmp/reino-testes/travas/<sha1 da raiz>.json
// com { pid, nome, desde }. Trava de PID morto é assumida (por um só). Solta sozinha no `exit`.
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

// a trava nasce completa: os dados vão num temporário e o link para o nome é atômico (EEXIST se já existe), então
// ninguém vê a trava vazia. Arquivo vazio/ilegível recente (outra versão criando) é ocupado, nunca morto.
// Trava de dono morto ou parado: só quem cria o `.assumindo` (o mesmo link atômico) troca, e com ele na mão confere
// de novo que o arquivo ainda é o do dono morto (mesmo inode). Dois assumindo juntos davam dois donos (auditoria).
// Criar a trava livre também só com o `.assumindo` na mão: quem assume tira do caminho, por um instante, a trava de
// outro criada depois da conferência, e ninguém pode criar a sua nesse vão (a devolução dava EEXIST: dois donos).
const RECENTE_MS = 2000, ASSUMINDO_MS = 10000;
function criar(de, para) {
  try { fs.linkSync(de, para); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; return false; }
}
function recente(arq, ms) {
  try { return Date.now() - fs.statSync(arq).mtimeMs < ms; } catch (e) { return false; }
}
// o que impede de assumir a trava (dono vivo com batida, ou trava sendo criada); null = morta ou parada
function impede(arq, dono) {
  if (!dono) return recente(arq, RECENTE_MS) ? { pid: '?', nome: 'trava sendo criada', desde: '?' } : null;
  return vivo(dono.pid) && !parado(arq) ? dono : null;
}
function tentar(arq, nome) {
  const tmp = arq + '.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify({ pid: process.pid, nome, desde: new Date().toISOString() }));
  try { return tentarCom(arq, tmp); } finally { try { fs.unlinkSync(tmp); } catch (e) { /* já saiu */ } }
}
function tentarCom(arq, tmp) {
  const dono = ler(arq);
  if (dono && dono.pid === process.pid) return null;
  if (impede(arq, dono)) return impede(arq, dono);
  const assumindo = arq + '.assumindo';
  if (!criar(tmp, assumindo)) {
    const outro = ler(assumindo);
    if (outro && vivo(outro.pid) && recente(assumindo, ASSUMINDO_MS)) return Object.assign({}, outro, { nome: `${outro.nome} (assumindo a trava)` });
    // quem assumia morreu no meio: libera para a próxima volta
    if (!recente(assumindo, RECENTE_MS)) try { fs.unlinkSync(assumindo); } catch (e) { /* já saiu */ }
    return { pid: outro ? outro.pid : '?', nome: 'trava sendo assumida', desde: '?' };
  }
  try {
    let ino = null;
    try { ino = fs.statSync(arq).ino; } catch (e) { /* o dono soltou: só criar */ }
    const agora = ler(arq);
    if (ino !== null && agora && agora.pid === process.pid) return null;
    if (ino !== null && impede(arq, agora)) return impede(arq, agora);
    if (agora && vivo(agora.pid)) console.log(`⚠ a trava de "${agora.nome}" (PID ${agora.pid}) está sem batida há mais de ${SEM_BATIDA_MS / 60000} min: assumo`);
    const fora = arq + '.morto.' + process.pid;
    if (ino !== null) {
      try { fs.renameSync(arq, fora); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      // tirou do caminho a trava de outro (criada depois da conferência): devolve e não assume
      if (fs.existsSync(fora) && fs.statSync(fora).ino !== ino) { criar(fora, arq); fs.unlinkSync(fora); return ler(arq) || { pid: '?', nome: 'outro processo', desde: '?' }; }
      try { fs.unlinkSync(fora); } catch (e) { /* não havia */ }
    }
    return criar(tmp, arq) ? null : (ler(arq) || { pid: '?', nome: 'outro processo', desde: '?' });
  } finally {
    const d = ler(assumindo);
    if (d && d.pid === process.pid) try { fs.unlinkSync(assumindo); } catch (e) { /* já saiu */ }
  }
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

// solta com o `.assumindo` na mão (como quem cria ou assume): ler e apagar em dois passos deixava um dono parado que
// acorda apagar a trava NOVA de quem acabou de assumi-la (auditoria). Ocupado por mais de 2 s: não apaga (trava de
// PID morto, que o próximo assume).
function soltar(arq = arquivoDa()) {
  const d = ler(arq);
  if (!d || d.pid !== process.pid) return;
  const tmp = arq + '.' + process.pid, assumindo = arq + '.assumindo', fim = Date.now() + RECENTE_MS;
  try {
    fs.writeFileSync(tmp, JSON.stringify({ pid: process.pid, nome: 'soltando', desde: new Date().toISOString() }));
    while (!criar(tmp, assumindo)) {
      if (Date.now() > fim) return;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);   // espera síncrona (roda no 'exit')
    }
    try {
      const agora = ler(arq);
      if (agora && agora.pid === process.pid) fs.unlinkSync(arq);
    } finally { try { fs.unlinkSync(assumindo); } catch (e) { /* já saiu */ } }
  } catch (e) { /* já saiu */ } finally { try { fs.unlinkSync(tmp); } catch (e) { /* já saiu */ } }
}

module.exports = { pegar, soltar, arquivoDa, vivo, parado, SEM_BATIDA_MS };
