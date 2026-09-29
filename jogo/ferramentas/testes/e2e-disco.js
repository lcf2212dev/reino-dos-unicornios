// Disco do e2e: cada execução grava ~155 MB e o /tmp é um tmpfs dividido com outros projetos; cheio,
// o Chromium cai ("Target crashed"). Aqui: espaço livre, e o plano de poda do `e2e.js --podar`.
//   livre(pasta)                        bytes livres no sistema de arquivos da pasta
//   conferirEspaco(pasta, minimo)       lança erro claro (com o que podar) abaixo do mínimo
//   planoPoda(pasta, { harness, manter, agora, idadeMs })   [{ caminho, bytes, motivo }] — só o que o e2e criou:
//     e2e-* com mais de idadeMs; ref-<base>/<partes>-h<hash> (e .parcial-*) de harness fora de [harness, main, ...manter]
//     e parada (nada dentro mudou) há mais de idadeMs;
//     pastas temporárias dos testes (TEMPORARIAS) com mais de idadeMs
//   hashHarness(ler)                    versão do harness: sha256 de ARQS_HARNESS (ler(f) dá o conteúdo de cada um)
//   harnessMain()                       o harness como está na main (git show), calculado na hora; null sem main
//   marcarUso(pasta)                    mtime = agora (o e2e chama ao reusar uma referência)
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
// pastas temporárias que os testes e ferramentas criam (mkdtemp: sufixo de 6; <pid>; hash): conferidas no grep de quem cria.
// Só nome inteiro casando: travas/, planos/, integrar/, ver/, auditoria/, vercel/, base-*, ref-* nunca casam
const MKDTEMP = '[A-Za-z0-9]{6}';
const TEMPORARIAS = new RegExp('^(?:(?:' + [
  'banco', 'banco-mariana', 'fluxo-int', 'fluxo-intr', 'fluxo-wt', 'fluxo-mat', 'entrada', 'estrelinhas', 'servidor-lento',
  'marcador', 'testar-sinal', 'empacotar-recusa', 'empacotar-ordem', 'artifact-delta', 'artifact-delta-acento',
  'validar-docs-[a-z]+', 'validar-uni', 'validar-npc', 'validar-emojis', 'trava', 'trava-corrida', 'trava-assumindo',
  'planos', 'vaivem-antiga', 'escolhas-antiga', 'guardas-banco-link', 'vozes-pend', 'vigia-fase-dados', 'ver-recorte',
  'e2e-tamanhos', 'e2e-disco-main',
].join('|') + ')-' + MKDTEMP + '|(?:novo|tipos)-\\d+|autocontido-[0-9a-f]{8})$');
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
    '  Pode: npm run e2e -- --podar   (e2e-* e temporárias de teste com mais de 1 h, referências de harness antigos)\n' +
    `  Ou rode noutra pasta: REINO_TESTES=/dev/shm/reino-testes npm run e2e   (veja também: du -sh ${pasta}/*)`);
}

function tamanho(p) {
  const st = fs.lstatSync(p);
  if (!st.isDirectory()) return st.size;
  return fs.readdirSync(p).reduce((n, f) => n + tamanho(path.join(p, f)), 0);
}

// último uso: o mtime mais novo da pasta e de tudo dentro (outra worktree lendo/gravando a referência a mantém viva)
function ultimoUso(p) {
  const st = fs.lstatSync(p);
  if (!st.isDirectory()) return st.mtimeMs;
  return fs.readdirSync(p).reduce((n, f) => Math.max(n, ultimoUso(path.join(p, f))), st.mtimeMs);
}

// marca o uso de uma referência reusada (só lida não muda mtime): a poda de outra worktree não a apaga no meio
function marcarUso(p) { const t = new Date(); fs.utimesSync(p, t, t); }

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
    if (TEMPORARIAS.test(nome) && agora - fs.statSync(p).mtimeMs > idade) plano.push({ caminho: p, motivo: 'temporária de teste com mais de 1 h' });
    if (!/^ref-[0-9a-f]+$/.test(nome)) continue;
    for (const sub of fs.readdirSync(p).sort()) {
      const m = /-h([0-9a-f]{8})(\.parcial-\d+)?$/.exec(sub);
      if (!m) continue;
      if (agora - ultimoUso(path.join(p, sub)) <= idade) continue; // em uso (ou captura em andamento): nunca sai
      if (m[2]) plano.push({ caminho: path.join(p, sub), motivo: 'captura interrompida' });
      else if (main && !manter.has(m[1])) plano.push({ caminho: path.join(p, sub), motivo: `harness antigo h${m[1]}` });
    }
  }
  plano.forEach((x) => { x.bytes = tamanho(x.caminho); });
  return plano;
}

function podar(plano) {
  plano.forEach((x) => fs.rmSync(conferirPastaTmp(x.caminho), { recursive: true, force: true }));
  return plano.reduce((n, x) => n + x.bytes, 0);
}

module.exports = { livre, conferirEspaco, planoPoda, podar, gb, MINIMO, ARQS_HARNESS, hashHarness, harnessMain, TEMPORARIAS, ultimoUso, marcarUso };
