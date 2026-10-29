// Testes de unidade (é o `npm run unidade`): duas filas de node --test ao mesmo tempo, cada uma com o seu limite
// (Node puro com concorrência alta; os *.navegador.test.js, que abrem o Chromium, com menos), tempo por teste,
// grupo de processos próprio (o Chromium morre junto) e a trava da worktree.
// Uso: node jogo/ferramentas/testes/unidade.js [--so <regex>] [--sem-navegador] [--sem-esperar]
//   --so <regex>     só os arquivos cujo nome casa (ex.: --so 'save|loja')
//   --sem-navegador  pula os *.navegador.test.js
// Concorrência: REINO_UNIDADE_NODE (padrão min(16, CPUs/2)) e REINO_UNIDADE_NAVEGADOR (padrão min(8, max(2, CPUs/4))).
// Mais lentos primeiro: a duração de cada arquivo fica em /tmp/reino-testes/duracoes-unidade.json (ou em REINO_TESTES)
// e ordena a próxima rodada (arquivo sem histórico vai na frente); no fim, os 10 mais lentos.
// Tempo total: 6 min (REINO_TEMPO=2 dobra). Estourou: derruba os grupos e sai com 1.
// Cada fila é um processo filho deste arquivo (`--fila <json>`, interno) com o run() do node:test, que respeita a ordem
// (o `node --test` põe em ordem alfabética). Este arquivo também é o reporter das durações.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PASTA_TESTES } = require('./guardas');

const PASTA = path.join(__dirname, 'unidade');
const REPO = path.resolve(__dirname, '..', '..', '..');
const FATOR = Number(process.env.REINO_TEMPO) || 1;
const TOTAL_MS = 6 * 60 * 1000 * FATOR;
const POR_TESTE_MS = 120000 * FATOR;
const DURACOES = path.join(PASTA_TESTES, 'duracoes-unidade.json');
const CPUS = os.cpus().length;
const limite = (env, padrao) => Math.max(1, Number(process.env[env]) || padrao);
const concorrencia = {
  node: () => limite('REINO_UNIDADE_NODE', Math.min(16, Math.floor(CPUS / 2))),
  navegador: () => limite('REINO_UNIDADE_NAVEGADOR', Math.min(8, Math.max(2, Math.floor(CPUS / 4)))),
};

// reporter: uma linha JSON por teste de 1º nível que terminou ({ file, ms }); a soma por arquivo é a duração dele
async function* reporter(fonte) {
  for await (const ev of fonte) {
    if ((ev.type === 'test:pass' || ev.type === 'test:fail') && ev.data.nesting === 0 && ev.data.file) {
      yield JSON.stringify({ file: path.basename(ev.data.file), ms: Math.round(ev.data.details.duration_ms || 0) }) + '\n';
    }
  }
}

function lerDuracoes() {
  try { return JSON.parse(fs.readFileSync(DURACOES, 'utf8')); } catch (e) { return {}; }
}

// ordem: sem histórico primeiro (alfabética), depois do mais lento ao mais rápido
function ordenar(nomes, d) {
  const peso = (f) => (d[f] === undefined ? Infinity : d[f]);
  return nomes.slice().sort().sort((a, b) => peso(b) - peso(a));
}
function arquivos(so, semNavegador) {
  const re = so ? new RegExp(so) : null;
  const nomes = fs.readdirSync(PASTA).filter((f) => f.endsWith('.test.js'))
    .filter((f) => !(semNavegador && f.endsWith('.navegador.test.js')))
    .filter((f) => !re || re.test(f));
  return ordenar(nomes, lerDuracoes()).map((f) => path.join(PASTA, f));
}
function filas(lista) {
  const nav = (f) => f.endsWith('.navegador.test.js');
  return [
    { nome: 'unidade (node)', lista: lista.filter((f) => !nav(f)), concorrencia: concorrencia.node() },
    { nome: 'unidade (navegador)', lista: lista.filter(nav), concorrencia: concorrencia.navegador() },
  ].filter((f) => f.lista.length);
}

// uma fila roda num processo filho (este arquivo com --fila <json>): run() do node:test, que respeita a ordem pedida
// (o `node --test` põe os arquivos em ordem alfabética)
function argsFila(lista, conc, destino) {
  const cfg = path.join(PASTA_TESTES, `fila-unidade-${process.pid}-${path.basename(destino || 'x')}.json`);
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  fs.writeFileSync(cfg, JSON.stringify({ lista, concorrencia: conc, destino }));
  return [__filename, '--fila', cfg];
}
async function rodarFila(cfg) {
  const { run } = require('node:test');
  const { spec } = require('node:test/reporters');
  const saida = new spec();
  saida.pipe(process.stdout);
  const dest = cfg.destino ? fs.createWriteStream(cfg.destino) : null;
  const fluxo = run({ files: cfg.lista, concurrency: cfg.concorrencia, timeout: POR_TESTE_MS, isolation: 'process' });
  for await (const ev of fluxo) {
    if (ev.type === 'test:fail' && !ev.data.todo) process.exitCode = 1;   // `todo` que falha não reprova (como o node --test)
    saida.write(ev);
    if (dest) for await (const l of reporter([ev])) dest.write(l);
  }
  saida.end();
  await new Promise((ok) => saida.on('end', ok).on('finish', ok));
  if (dest) await new Promise((ok) => dest.end(ok));
}

// junta as durações da rodada no histórico e devolve as da rodada ({ arquivo: ms })
function guardarDuracoes(destinos) {
  const rodada = {};
  destinos.forEach((d) => {
    let t = '';
    try { t = fs.readFileSync(d, 'utf8'); } catch (e) { return; }
    t.split('\n').filter(Boolean).forEach((l) => {
      try { const x = JSON.parse(l); if (/\.test\.js$/.test(x.file)) rodada[x.file] = (rodada[x.file] || 0) + x.ms; } catch (e) { /* linha cortada */ }
    });
  });
  if (Object.keys(rodada).length) {
    const hist = lerDuracoes();
    // só arquivos de teste que ainda existem (o histórico é dividido entre worktrees)
    Object.keys(hist).forEach((f) => { if (!/\.test\.js$/.test(f) || !fs.existsSync(path.join(PASTA, f))) delete hist[f]; });
    const tmp = DURACOES + '.' + process.pid;
    fs.writeFileSync(tmp, JSON.stringify(Object.assign(hist, rodada), null, 1) + '\n');
    fs.renameSync(tmp, DURACOES);
  }
  return rodada;
}

// soma as linhas "ℹ tests/pass/fail/…" das filas numa só (a última de cada fila)
function somar(saidas) {
  const total = {};
  saidas.forEach((s) => {
    const ultimo = {};
    (s.match(/^ℹ (tests|suites|pass|fail|cancelled|skipped|todo) \d+$/gm) || []).forEach((l) => { const [, k, n] = l.split(' '); ultimo[k] = Number(n); });
    Object.entries(ultimo).forEach(([k, n]) => { total[k] = (total[k] || 0) + n; });
  });
  return total;
}

async function rodarFilas(lista) {
  const { rodar } = require('./processo');
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const fim = Date.now() + TOTAL_MS;
  const fs_ = filas(lista);
  const destinos = fs_.map((f, i) => path.join(PASTA_TESTES, `duracoes-unidade-${process.pid}-${i}.jsonl`));
  const rs = await Promise.all(fs_.map((f, i) => rodar(process.execPath, argsFila(f.lista, f.concorrencia, destinos[i]),
    { cwd: REPO, timeoutMs: Math.max(1000, fim - Date.now()), aoVivo: true, nome: f.nome })));
  const rodada = guardarDuracoes(destinos);
  const lentos = Object.entries(rodada).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (lentos.length) console.log('\nOs 10 arquivos mais lentos:\n' + lentos.map(([f, ms]) => `  ${(ms / 1000).toFixed(1).padStart(6)} s  ${f}`).join('\n'));
  rs.forEach((r, i) => { if (r.estourou) console.error(`\n✘ ${fs_[i].nome} passou de ${TOTAL_MS / 1000} s: grupo ${r.pgid} derrubado`); });
  const total = somar(rs.map((r) => r.saida));
  // o resumo das filas juntas (o testar-tudo lê as últimas linhas "ℹ …")
  console.log(`\n${fs_.map((f) => `${f.nome}: ${f.lista.length} arquivo(s), ${f.concorrencia} por vez`).join(' · ')}`);
  Object.entries(total).forEach(([k, n]) => console.log(`ℹ ${k} ${n}`));
  const falhou = rs.some((r) => r.estourou || r.status !== 0);
  return falhou ? 1 : 0;
}

module.exports = Object.assign(reporter, { arquivos, ordenar, filas, argsFila, concorrencia, rodarFilas, somar, TOTAL_MS, DURACOES });

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (arg('--fila')) {
    rodarFila(JSON.parse(fs.readFileSync(arg('--fila'), 'utf8'))).catch((e) => { console.error('✘ ' + e.message); process.exitCode = 1; });
    return;
  }
  (async () => {
    const lista = arquivos(arg('--so'), process.argv.includes('--sem-navegador'));
    if (!lista.length) { console.error('✘ nenhum teste casou'); process.exit(2); }
    await require('./trava').pegar('npm run unidade');
    process.exit(await rodarFilas(lista));
  })().catch((e) => { console.error('✘ ' + e.message); process.exit(1); });
}
