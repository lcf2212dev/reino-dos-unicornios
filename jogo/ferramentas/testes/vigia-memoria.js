// Vigia de memória e de travamento dos testes de navegador (e2e, npm test, ver, cenario, sonda-memoria): começa no
// primeiro lancar() (navegador.js) e, a cada 3 s, lê em /proc a memória (RSS) dos processos descendentes deste node
// (os Chromium do Playwright e os servidores de teste). Dispara quando:
//   - um processo passa de REINO_MEMORIA_GB (padrão 4; uma aba normal do jogo fica abaixo de 1 GB): vazamento,
//     ou um laço que aloca sem parar;
//   - todos juntos passam de REINO_MEMORIA_TOTAL_GB (padrão 24);
//   - uma aba registrada (registrar/marcar, usados pelo e2e) fica REINO_TRAVADO_MIN minutos (padrão 5) sem marca
//     nova, isto é, sem tirar foto nenhuma: travada.
// Ao disparar: mostra os processos, as abas e o que cada uma fazia (também em /tmp/reino-testes/vigia/), derruba os
// descendentes deste processo (SIGKILL, pelo PID: só os que este teste subiu) e sai com código 3.
// Investigar e corrigir: skill investigar-vazamento (.claude/skills/investigar-vazamento/SKILL.md).
// Em código: registrar(page, 'celular/completo cenasTelas'); marcar(page, 'tela-loja'). Sem Linux (/proc): não vigia.
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES } = require('./guardas');

const GB = 1024 ** 3;
const numero = (v, padrao) => (Number(v) > 0 ? Number(v) : padrao);
const LIMITES = {
  processo: numero(process.env.REINO_MEMORIA_GB, 4) * GB,
  total: numero(process.env.REINO_MEMORIA_TOTAL_GB, 24) * GB,
  paradoMs: numero(process.env.REINO_TRAVADO_MIN, 5) * 60000,
};
const INTERVALO = 3000;
const PAGINA = 4096; // bytes por página de memória (x86-64 e arm64 do Linux)

/* ---------- processos (/proc) ---------- */
// [{ pid, ppid, nome, rss (bytes) }] de todos os processos visíveis; lista vazia fora do Linux
function processos() {
  let dirs;
  try { dirs = fs.readdirSync('/proc'); } catch (e) { return []; }
  const lista = [];
  for (const d of dirs) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = fs.readFileSync(`/proc/${d}/stat`, 'utf8');
      const fecha = stat.lastIndexOf(')');
      // depois do nome: estado (3), ppid (4) … rss em páginas (24)
      const campos = stat.slice(fecha + 2).split(' ');
      lista.push({ pid: Number(d), ppid: Number(campos[1]), nome: stat.slice(stat.indexOf('(') + 1, fecha), rss: Number(campos[21]) * PAGINA });
    } catch (e) { /* o processo acabou no meio da leitura */ }
  }
  return lista;
}

// os descendentes de `raiz` (sem ela), a partir da lista de processos()
function descendentes(lista, raiz) {
  const filhos = new Map();
  for (const p of lista) { if (!filhos.has(p.ppid)) filhos.set(p.ppid, []); filhos.get(p.ppid).push(p); }
  const fora = [], fila = [raiz];
  while (fila.length) for (const f of filhos.get(fila.shift()) || []) { fora.push(f); fila.push(f.pid); }
  return fora;
}

/* ---------- abas: o que cada uma está fazendo ---------- */
const abas = new Map(); // page → { rotulo, marca, quando }
function registrar(page, rotulo) {
  abas.set(page, { rotulo, marca: 'abrindo', quando: Date.now() });
  page.once('close', () => abas.delete(page));
}
function marcar(page, marca) {
  const a = abas.get(page);
  if (a) Object.assign(a, { marca, quando: Date.now() });
}

/* ---------- decisão (pura, testada em unidade/vigia-memoria.test.js) ---------- */
// procs: descendentes com rss; abasAgora: [{ rotulo, marca, quando }]; agora: ms. Devolve o motivo ou null.
function avaliar(procs, abasAgora, agora, limites = LIMITES) {
  const gordo = procs.reduce((m, p) => (!m || p.rss > m.rss ? p : m), null);
  if (gordo && gordo.rss > limites.processo) {
    return { tipo: 'memoria', texto: `processo ${gordo.pid} (${gordo.nome}) com ${gb(gordo.rss)} (limite ${gb(limites.processo)}; REINO_MEMORIA_GB)` };
  }
  const total = procs.reduce((s, p) => s + p.rss, 0);
  if (total > limites.total) return { tipo: 'memoria', texto: `os processos deste teste somam ${gb(total)} (limite ${gb(limites.total)}; REINO_MEMORIA_TOTAL_GB)` };
  const parada = abasAgora.find((a) => agora - a.quando > limites.paradoMs);
  if (parada) {
    return { tipo: 'travado', texto: `a aba "${parada.rotulo}" está parada em "${parada.marca}" há ${Math.round((agora - parada.quando) / 60000)} min, sem foto nova (REINO_TRAVADO_MIN)` };
  }
  return null;
}
const gb = (b) => (b / GB).toFixed(1) + ' GB';

/* ---------- o vigia ---------- */
let timer = null;
function disparar(motivo, procs) {
  const linhas = [
    `✘ VIGIA DOS TESTES: ${motivo.tipo === 'memoria' ? 'memória demais (vazamento?)' : 'teste travado'}: ${motivo.texto}`,
    '  processos deste teste (maiores primeiro):',
    ...procs.slice().sort((a, b) => b.rss - a.rss).slice(0, 8).map((p) => `    ${p.pid}  ${gb(p.rss).padStart(8)}  ${p.nome}`),
    '  abas e o que cada uma fazia:',
    ...(abas.size ? [...abas.values()].map((a) => `    ${a.rotulo}: ${a.marca} (há ${Math.round((Date.now() - a.quando) / 1000)} s)`) : ['    (nenhuma registrada)']),
    `  comando: ${process.argv.slice(1).join(' ')}   (cwd ${process.cwd()})`,
    '  Derrubei os processos deste teste. Investigar e corrigir: skill investigar-vazamento.',
  ];
  const texto = linhas.join('\n');
  console.error('\n' + texto);
  try {
    const pasta = path.join(PASTA_TESTES, 'vigia');
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(path.join(pasta, `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}.txt`), texto + '\n');
  } catch (e) { /* sem disco: a saída acima basta */ }
  for (const p of procs) { try { process.kill(p.pid, 'SIGKILL'); } catch (e) { /* já saiu */ } }
  process.exit(3);
}
function checar() {
  const procs = descendentes(processos(), process.pid);
  const motivo = avaliar(procs, [...abas.values()], Date.now());
  if (motivo) disparar(motivo, procs);
}
// idempotente: um vigia por processo, que não segura o node aberto
function vigiar() {
  if (timer || process.platform !== 'linux') return;
  timer = setInterval(checar, INTERVALO);
  timer.unref();
}

module.exports = { vigiar, registrar, marcar, avaliar, processos, descendentes, LIMITES };
