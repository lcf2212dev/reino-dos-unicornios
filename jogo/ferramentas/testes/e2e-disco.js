// Disco do e2e: cada execução grava ~155 MB e o /tmp é um tmpfs dividido com outros projetos; cheio,
// o Chromium cai ("Target crashed"). Aqui: espaço livre, e o plano de poda do `e2e.js --podar`.
//   livre(pasta)                        bytes livres no sistema de arquivos da pasta
//   conferirEspaco(pasta, minimo)       lança erro claro (com o que podar) abaixo do mínimo
//   planoPoda(pasta, { harness, manter, agora, idadeMs })   [{ caminho, bytes, motivo }] — só o que o e2e criou:
//     e2e-* com mais de idadeMs; ref-<base>/<partes>-h<hash> (e .parcial-*) de harness fora de [harness, ...manter]
//   podar(plano)                        apaga (cada caminho passa por conferirPastaTmp)
const fs = require('fs');
const path = require('path');
const { conferirPastaTmp } = require('./guardas');

const MINIMO = 1.5 * 1024 ** 3;
const UMA_HORA = 60 * 60 * 1000;
// harness da main (a árvore principal usa essa cache): nunca é podado
const HARNESS_MAIN = '83b7a60d';

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
  const manter = new Set([op.harness, HARNESS_MAIN].concat(op.manter || []).filter(Boolean));
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
      else if (!m[2] && !manter.has(m[1])) plano.push({ caminho: path.join(p, sub), motivo: `harness antigo h${m[1]}` });
    }
  }
  plano.forEach((x) => { x.bytes = tamanho(x.caminho); });
  return plano;
}

function podar(plano) {
  plano.forEach((x) => fs.rmSync(conferirPastaTmp(x.caminho), { recursive: true, force: true }));
  return plano.reduce((n, x) => n + x.bytes, 0);
}

module.exports = { livre, conferirEspaco, planoPoda, podar, gb, MINIMO, HARNESS_MAIN };
