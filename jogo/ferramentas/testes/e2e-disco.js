// Disco do e2e: cada execução grava ~155 MB e o /tmp é um tmpfs dividido com outros projetos; cheio,
// o Chromium cai ("Target crashed"). Aqui: espaço livre, e o plano de poda do `e2e.js --podar`.
//   livre(pasta)                        bytes livres no sistema de arquivos da pasta
//   conferirEspaco(pasta, minimo)       lança erro claro (com o que podar) abaixo do mínimo
//   planoPoda(pasta, { harness, manter, agora, idadeMs })   [{ caminho, bytes, motivo }] — só o que o e2e criou:
//     e2e-* com mais de idadeMs; ref-<base>/<partes>-h<hash> (e .parcial-*) de harness fora de [harness, main, ...manter]
//   hashHarness(ler)                    versão do harness: sha256 de ARQS_HARNESS (ler(f) dá o conteúdo de cada um)
//   harnessMain()                       o harness como está na main (git show), calculado na hora; null sem main
//   podar(plano)                        apaga (cada caminho passa por conferirPastaTmp)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { conferirPastaTmp } = require('./guardas');

const MINIMO = 1.5 * 1024 ** 3;
const UMA_HORA = 60 * 60 * 1000;
const REPO = path.resolve(__dirname, '..', '..', '..');
// o que o e2e.js chama de harness: mudou um destes, muda a pasta das referências da base
const ARQS_HARNESS = ['referencias.js', 'referencias-pagina.js', 'referencias-cenas.js', 'referencias-dados.js', 'saves.js', 'navegador.js'];
function hashHarness(ler) {
  const h = crypto.createHash('sha256');
  ARQS_HARNESS.forEach((f) => h.update(f + '\0' + ler(f)));
  return h.digest('hex').slice(0, 8);
}
// harness da main (a árvore principal usa essa cache): nunca é podado. Na hora, nunca constante (ficava velha e a
// poda de uma worktree apagava a cache da main); sem main legível: null, e nenhuma referência é podada
function harnessMain() {
  try {
    return hashHarness((f) => execFileSync('git', ['-C', REPO, 'show', `main:jogo/ferramentas/testes/${f}`], { stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (e) { return null; }
}

function livre(pasta) {
  let d = pasta;
  while (!fs.existsSync(d)) d = path.dirname(d);
  const s = fs.statfsSync(d);
  return s.bavail * s.bsize;
}
const gb = (b) => (b / 1024 ** 3).toFixed(1) + ' GB';

function conferirEspaco(pasta, minimo = MINIMO) {
  const l = livre(pasta);
  if (l >= minimo) return l;
  throw new Error(`pouco espaço em ${pasta}: ${gb(l)} livres (mínimo ${gb(minimo)}); com o disco cheio o Chromium cai.\n` +
    '  Pode: npm run e2e -- --podar   (e2e-* com mais de 1 h e referências de harness antigos)\n' +
    `  Ou rode noutra pasta: REINO_TESTES=/dev/shm/reino-testes npm run e2e   (veja também: du -sh ${pasta}/*)`);
}

function tamanho(p) {
  const st = fs.lstatSync(p);
  if (!st.isDirectory()) return st.size;
  return fs.readdirSync(p).reduce((n, f) => n + tamanho(path.join(p, f)), 0);
}

function planoPoda(pasta, op = {}) {
  const agora = op.agora || Date.now(), idade = op.idadeMs == null ? UMA_HORA : op.idadeMs;
  const main = harnessMain();
  const manter = new Set([op.harness, main].concat(op.manter || []).filter(Boolean));
  const plano = [];
  if (!fs.existsSync(pasta)) return plano;
  for (const nome of fs.readdirSync(pasta).sort()) {
    const p = path.join(pasta, nome);
    if (!fs.lstatSync(p).isDirectory()) continue;
    if (/^e2e-/.test(nome) && agora - fs.statSync(p).mtimeMs > idade) plano.push({ caminho: p, motivo: 'e2e com mais de 1 h' });
    if (!/^ref-[0-9a-f]+$/.test(nome)) continue;
    for (const sub of fs.readdirSync(p).sort()) {
      const m = /-h([0-9a-f]{8})(\.parcial-\d+)?$/.exec(sub);
      if (!m) continue;
      if (m[2] && agora - fs.statSync(path.join(p, sub)).mtimeMs > idade) plano.push({ caminho: path.join(p, sub), motivo: 'captura interrompida' });
      else if (!m[2] && main && !manter.has(m[1])) plano.push({ caminho: path.join(p, sub), motivo: `harness antigo h${m[1]}` });
    }
  }
  plano.forEach((x) => { x.bytes = tamanho(x.caminho); });
  return plano;
}

function podar(plano) {
  plano.forEach((x) => fs.rmSync(conferirPastaTmp(x.caminho), { recursive: true, force: true }));
  return plano.reduce((n, x) => n + x.bytes, 0);
}

module.exports = { livre, conferirEspaco, planoPoda, podar, gb, MINIMO, ARQS_HARNESS, hashHarness, harnessMain };
