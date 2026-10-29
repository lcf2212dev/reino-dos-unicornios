// Ajudantes das ferramentas de fluxo (worktree.js, material.js, integrar.js): git, argumentos, árvore principal,
// node_modules por link, processos vivos numa pasta. Nada aqui escreve na árvore principal.
// O repositório é o da pasta atual (process.cwd()); a árvore principal é a primeira de `git worktree list`
// e as worktrees novas moram ao lado dela (/home/leandro/reino-<tema>). Nos testes, um repositório temporário
// em /tmp/reino-testes/ faz o papel de tudo isso.
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { PASTA_TESTES } = require('../testes/guardas');

// sem as variáveis GIT_* herdadas (um hook ou outro git por cima mudaria o repositório de cada comando) e sem
// REINO_RESERVAS_ABERTAS (só vale nas frentes: na integração, reserva sem registro é erro; plano-paralelo.md §2)
function ambiente(extra) {
  const env = { ...process.env, ...(extra || {}) };
  Object.keys(env).filter((k) => /^GIT_(DIR|WORK_TREE|INDEX_FILE|PREFIX)$|^REINO_RESERVAS_ABERTAS$/.test(k)).forEach((k) => delete env[k]);
  return env;
}

// roda um comando e devolve { ok, status, saida, erro }; nunca lança
function rodar(cmd, args, op = {}) {
  const r = spawnSync(cmd, args, {
    cwd: op.cwd, input: op.input, encoding: op.binario ? null : 'utf8', maxBuffer: 1 << 30,
    env: ambiente(op.env), stdio: op.herdar ? 'inherit' : 'pipe',
  });
  const txt = (b) => (b == null ? '' : Buffer.isBuffer(b) ? b : String(b));
  return { ok: r.status === 0, status: r.status, saida: txt(r.stdout), erro: txt(r.stderr) + (r.error ? String(r.error.message) : '') };
}

// git -C <pasta> …: devolve a saída (sem espaço no fim) ou lança com a mensagem do git
function git(pasta, ...args) {
  const r = rodar('git', ['-C', pasta, '-c', 'core.quotePath=false', ...args]);
  if (!r.ok) throw new Error(`git ${args.join(' ')} (em ${pasta}):\n${(r.erro || r.saida).trim()}`);
  return r.saida.replace(/\s+$/, '');
}
const gitOk = (pasta, ...args) => rodar('git', ['-C', pasta, ...args]).ok;

// roda e mostra ao vivo (salvo `quieto`), guardando a saída num arquivo; resolve com true se saiu com 0
function rodarTee(cmd, args, cwd, arqLog, quieto) {
  return new Promise((ok) => {
    const f = fs.createWriteStream(arqLog);
    const p = spawn(cmd, args, { cwd, env: ambiente(), stdio: ['ignore', 'pipe', 'pipe'] });
    const passa = (d) => { f.write(d); if (!quieto) process.stdout.write(d); };
    p.stdout.on('data', passa); p.stderr.on('data', passa);
    p.on('error', (e) => passa(String(e.message) + '\n'));
    p.on('close', (code) => f.end(() => ok(code === 0)));
  });
}

// argumentos: posicionais + opções. `repetidas` acumulam em lista; `booleanas` não levam valor.
function lerArgs(argv, { booleanas = [], repetidas = [] } = {}) {
  const op = { _: [] };
  repetidas.forEach((k) => { op[k] = []; });
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { op._.push(a); continue; }
    const k = a.slice(2);
    if (booleanas.includes(k)) { op[k] = true; continue; }
    const v = argv[++i];
    if (v === undefined) throw new Error(`${a} precisa de um valor`);
    if (repetidas.includes(k)) op[k].push(v); else op[k] = v;
  }
  return op;
}

// repositório da pasta atual, árvore principal (1ª worktree) e a pasta onde moram as worktrees
function raizes(cwd = process.cwd()) {
  const repo = git(cwd, 'rev-parse', '--show-toplevel');
  const lista = worktrees(repo);
  const principal = lista[0].pasta;
  return { repo, principal, mae: path.dirname(principal), worktrees: lista };
}

// git worktree list --porcelain → [{ pasta, head, branch }]
function worktrees(repo) {
  const out = git(repo, 'worktree', 'list', '--porcelain');
  return out.split('\n\n').filter((b) => b.trim()).map((b) => {
    const w = {};
    b.split('\n').forEach((l) => {
      if (l.startsWith('worktree ')) w.pasta = l.slice(9);
      else if (l.startsWith('HEAD ')) w.head = l.slice(5);
      else if (l.startsWith('branch ')) w.branch = l.slice(7).replace(/^refs\/heads\//, '');
    });
    return w;
  });
}

// node_modules instalado (pasta de verdade com o playwright) para servir de link: o da árvore principal,
// senão o de outra worktree registrada. Devolve o caminho real ou null.
function acharNodeModules(r, fora = []) {
  const candidatos = [r.principal].concat(r.worktrees.map((w) => w.pasta).filter((p) => p !== r.principal));
  for (const p of candidatos) {
    if (fora.includes(p)) continue;
    const nm = path.join(p, 'node_modules');
    try {
      const real = fs.realpathSync(nm);
      if (fs.statSync(real).isDirectory() && fs.existsSync(path.join(real, 'playwright'))) return real;
    } catch (e) { /* não existe ou link quebrado */ }
  }
  return null;
}

// node_modules da pasta nova: link para um instalado; sem nenhum, só avisa (ou `npm ci` com ci = true)
function prepararNodeModules(r, pasta, ci) {
  const nm = path.join(pasta, 'node_modules');
  if (fs.existsSync(nm)) return `node_modules: já existe em ${pasta}`;
  if (ci) {
    const x = rodar('npm', ['ci'], { cwd: pasta, herdar: true });
    if (!x.ok) throw new Error('npm ci falhou');
    return 'node_modules: npm ci';
  }
  const real = acharNodeModules(r, [pasta]);
  if (!real) return '⚠ node_modules: nenhum instalado para servir de link (rode de novo com --ci ou `npm ci` na pasta)';
  fs.symlinkSync(real, nm);
  return `node_modules: link para ${real} (nunca faça git add dele)`;
}

// arquivos NÃO rastreados de uma pasta da árvore (relativos à raiz), fora os ignorados pelo .gitignore
function naoRastreados(arvore, sub) {
  const args = ['ls-files', '--others', '--exclude-standard', '-z'];
  if (sub) args.push('--', sub);
  return git(arvore, ...args).split('\0').filter((f) => f && f !== 'node_modules' && !f.startsWith('node_modules/'));
}
const rastreados = (arvore, sub) => git(arvore, 'ls-files', '-z', '--', sub).split('\0').filter(Boolean);

// pasta de material (prints e fotos) relativa à raiz da árvore: o caminho como veio ("matérias/ciências/Revisão")
// ou, senão, o nome da matéria dentro de matérias/ sem diferença de maiúsculas ("Geografia" → "matérias/geografia",
// "Ciências/Revisão" → "matérias/ciências/Revisão"); null se não achar ou se o nome sair da árvore
const PASTA_MATERIAS = 'matérias';
function pastaMaterial(arvore, nome) {
  const rel = String(nome).normalize('NFC').replace(/\/+$/, '');
  if (!rel || path.isAbsolute(rel) || rel.split('/').includes('..')) return null;
  const ehPasta = (r) => fs.existsSync(path.join(arvore, r)) && fs.statSync(path.join(arvore, r)).isDirectory();
  if (ehPasta(rel)) return rel;
  const [prim, ...resto] = rel.split('/');
  let nomes = [];
  try { nomes = fs.readdirSync(path.join(arvore, PASTA_MATERIAS)); } catch (e) { return null; }
  const achada = nomes.find((n) => n.normalize('NFC').toLowerCase() === prim.toLowerCase());
  const r = achada && [PASTA_MATERIAS, achada, ...resto].join('/');
  return r && ehPasta(r) ? r : null;
}

// copia arquivos (relativos) de uma árvore para outra, com a data original; não sobrescreve arquivo diferente
function copiarArquivos(de, para, lista) {
  const r = { copiados: [], iguais: [], diferentes: [] };
  lista.forEach((rel) => {
    const o = path.join(de, rel);
    const d = path.join(para, rel);
    if (fs.existsSync(d)) { (mesmoConteudo(o, d) ? r.iguais : r.diferentes).push(rel); return; }
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.cpSync(o, d, { preserveTimestamps: true, verbatimSymlinks: true });
    r.copiados.push(rel);
  });
  return r;
}

function mesmoConteudo(a, b) {
  try {
    const sa = fs.lstatSync(a); const sb = fs.lstatSync(b);
    if (sa.isSymbolicLink() || sb.isSymbolicLink()) return sa.isSymbolicLink() && sb.isSymbolicLink() && fs.readlinkSync(a) === fs.readlinkSync(b);
    return sa.size === sb.size && fs.readFileSync(a).equals(fs.readFileSync(b));
  } catch (e) { return false; }
}

// processos vivos cuja pasta atual está dentro de `pasta` ou cuja linha de comando cita a pasta (lê /proc).
// Fica de fora este processo e os seus ancestrais (quem chamou a ferramenta).
function processosNaPasta(pasta) {
  const alvo = fs.realpathSync(pasta);
  const dentro = (p) => p === alvo || p.startsWith(alvo + '/');
  const meus = new Set();
  for (let pid = process.pid; pid > 1;) {
    meus.add(pid);
    try { pid = Number(fs.readFileSync(`/proc/${pid}/stat`, 'utf8').replace(/^.*\) \S+ /, '').split(' ')[0]); } catch (e) { break; }
  }
  const achados = [];
  let pids = [];
  try { pids = fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)).map(Number); } catch (e) { return achados; }
  pids.forEach((pid) => {
    if (meus.has(pid)) return;
    let cwd = ''; let cmd = '';
    try { cwd = fs.readlinkSync(`/proc/${pid}/cwd`); } catch (e) { /* de outro usuário ou já saiu */ }
    try { cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').join(' ').trim(); } catch (e) { /* idem */ }
    if (!cmd) return;
    if (dentro(cwd) || cmd.includes(alvo + '/') || cmd.split(' ').includes(alvo)) achados.push({ pid, cwd, cmd: cmd.slice(0, 160) });
  });
  return achados;
}

// 2026-09-26 (data local)
function hoje(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const horaCurta = (d = new Date()) => d.toTimeString().slice(0, 8).replace(/:/g, '');

// nome de pasta sem acento, minúsculo: "Ciências" → "ciencias"
const semAcento = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = (s) => semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';

module.exports = {
  PASTA_TESTES, rodar, rodarTee, git, gitOk, lerArgs, raizes, worktrees, acharNodeModules, prepararNodeModules,
  PASTA_MATERIAS, pastaMaterial, naoRastreados, rastreados, copiarArquivos, mesmoConteudo, processosNaPasta, hoje, horaCurta, slug, ambiente,
};
