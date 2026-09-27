// Vigia de travamento do Claude Code: hook do projeto (.claude/settings.json, PostToolUse e UserPromptSubmit). A cada
// ferramenta usada, por qualquer agente da sessão, e a cada mensagem do Leandro, olha a máquina (~50 ms) e acusa:
//   - Chromium de teste (chrome-headless-shell do Playwright) com mais de REINO_MEMORIA_GB (4) num processo, ou os de
//     UM mesmo teste somando mais de REINO_VIGIA_TOTAL_GB (24): vazamento, ou laço que aloca sem parar (a soma é por
//     teste: vários e2e normais ao mesmo tempo, um por worktree, não são problema);
//   - comando de teste (e2e, npm test, unidade, ver, sonda-memoria, node --test) rodando há mais de
//     REINO_VIGIA_TESTE_MIN (30) min: travado (o e2e completo leva poucos minutos);
//   - menos de 10% de memória livre na máquina;
//   - diagnóstico novo do vigia de dentro dos testes (/tmp/reino-testes/vigia/*.txt, testes/vigia-memoria.js).
// Achou: devolve o aviso ao agente (additionalContext) e ao Leandro (systemMessage), com PID, idade e worktree de cada
// coisa; o mesmo aviso só se repete para o mesmo agente depois de 10 min. Nada achado: não imprime nada. Erro interno: silêncio (o hook
// nunca atrapalha a ferramenta). O que fazer com o aviso: skill investigar-vazamento.
// Uso manual: node jogo/ferramentas/fluxo/vigia-travamento.js --agora   (mostra o que acharia, sem a espera de 10 min)
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { PASTA_TESTES } = require('../testes/guardas');
const { processos } = require('../testes/vigia-memoria');

const GB = 1024 ** 3;
const numero = (v, padrao) => (Number(v) > 0 ? Number(v) : padrao);
const LIMITES = {
  processo: numero(process.env.REINO_MEMORIA_GB, 4) * GB,
  total: numero(process.env.REINO_VIGIA_TOTAL_GB, 24) * GB,
  testeMs: numero(process.env.REINO_VIGIA_TESTE_MIN, 30) * 60000,
  livre: 0.10,
};
const REPETIR_MS = 10 * 60000;
const ESTADO = path.join(PASTA_TESTES, 'vigia-travamento.json');
const PASTA_DIAG = path.join(PASTA_TESTES, 'vigia');
// comandos de teste do projeto (o servidor de teste fica de fora: com --fundo ele roda horas de propósito)
const TESTE = /jogo\/ferramentas\/(testar-tudo|testes\/(e2e|unidade|ver|referencias|sonda-memoria|desempenho))\.js|node --test/;

const ler = (arq) => { try { return fs.readFileSync(arq, 'utf8'); } catch (e) { return ''; } };
const gb = (b) => (b / GB).toFixed(1) + ' GB';
const min = (ms) => (ms < 60000 ? Math.round(ms / 1000) + ' s' : Math.round(ms / 60000) + ' min');

// idade de um processo em ms (/proc/<pid>/stat campo 22, em tiques de 1/100 s desde o boot)
function idade(pid) {
  const stat = ler(`/proc/${pid}/stat`);
  const inicio = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[19]) / 100;
  const uptime = Number(ler('/proc/uptime').split(' ')[0]);
  return inicio && uptime ? (uptime - inicio) * 1000 : 0;
}
const linhaDeComando = (pid) => ler(`/proc/${pid}/cmdline`).split('\0').join(' ').trim();
const pasta = (pid) => { try { return fs.readlinkSync(`/proc/${pid}/cwd`); } catch (e) { return '?'; } };

// o comando de teste que subiu este processo (subindo pelos pais), para dizer de que worktree ele é
function dono(p, porPid) {
  for (let q = porPid.get(p.ppid), n = 0; q && n < 12; q = porPid.get(q.ppid), n++) {
    if (TESTE.test(linhaDeComando(q.pid))) return q;
  }
  return null;
}

// [{ chave, texto }]: tudo o que está errado agora
function achar() {
  const lista = processos();
  const porPid = new Map(lista.map((p) => [p.pid, p]));
  const achados = [];
  const chrome = lista.filter((p) => p.nome === 'chrome-headless' || p.nome.startsWith('chrome-headless'));
  const deQuem = (p) => { const d = dono(p, porPid); return d ? `do teste PID ${d.pid} em ${pasta(d.pid)}` : 'sem teste vivo acima (órfão?)'; };
  for (const p of chrome.filter((x) => x.rss > LIMITES.processo).sort((a, b) => b.rss - a.rss).slice(0, 3)) {
    achados.push({ chave: `mem:${p.pid}`, texto: `Chromium de teste PID ${p.pid} com ${gb(p.rss)} (${deQuem(p)})` });
  }
  // soma por teste dono
  const porTeste = new Map();
  for (const p of chrome) {
    const d = dono(p, porPid);
    if (!d) continue;
    const t = porTeste.get(d.pid) || { rss: 0, n: 0 };
    porTeste.set(d.pid, { rss: t.rss + p.rss, n: t.n + 1 });
  }
  for (const [pid, t] of porTeste) {
    if (t.rss > LIMITES.total) achados.push({ chave: `total:${pid}`, texto: `o teste PID ${pid} em ${pasta(pid)} soma ${gb(t.rss)} de Chromium em ${t.n} processos` });
  }
  for (const p of lista.filter((x) => x.nome === 'node' || x.nome === 'MainThread')) {
    const cmd = linhaDeComando(p.pid);
    if (!TESTE.test(cmd)) continue;
    const t = idade(p.pid);
    if (t > LIMITES.testeMs) achados.push({ chave: `teste:${p.pid}`, texto: `teste rodando há ${min(t)}: PID ${p.pid} "${cmd.slice(0, 90)}" em ${pasta(p.pid)}` });
  }
  const mem = ler('/proc/meminfo');
  const kb = (n) => Number((new RegExp(n + ':\\s+(\\d+)').exec(mem) || [])[1] || 0);
  if (kb('MemTotal') && kb('MemAvailable') / kb('MemTotal') < LIMITES.livre) {
    achados.push({ chave: 'livre', texto: `memória livre da máquina em ${Math.round((kb('MemAvailable') / kb('MemTotal')) * 100)}%` });
  }
  let diags = [];
  try { diags = fs.readdirSync(PASTA_DIAG).filter((f) => f.endsWith('.txt')); } catch (e) { /* nenhum ainda */ }
  for (const f of diags) {
    const arq = path.join(PASTA_DIAG, f);
    if (Date.now() - fs.statSync(arq).mtimeMs < REPETIR_MS) achados.push({ chave: `diag:${f}`, texto: `o vigia dos testes derrubou um teste: ${ler(arq).split('\n')[0].replace(/^✘ /, '')} (${arq})` });
  }
  return achados;
}

// só o que ESTE agente (escopo: a conversa dele) não viu nos últimos 10 min (--agora: tudo). Por agente, para o aviso
// chegar também ao agente travado, e não só ao primeiro que usar uma ferramenta.
function filtrarNovos(achados, agora = Date.now(), tudo = false, escopo = '') {
  let estado = {};
  try { estado = JSON.parse(ler(ESTADO) || '{}'); } catch (e) { estado = {}; }
  const chave = (a) => escopo + '|' + a.chave;
  const novos = achados.filter((a) => tudo || !estado[chave(a)] || agora - estado[chave(a)] > REPETIR_MS);
  if (novos.length && !tudo) {
    for (const a of novos) estado[chave(a)] = agora;
    for (const k of Object.keys(estado)) if (agora - estado[k] > 24 * 3600000) delete estado[k];
    try { fs.mkdirSync(path.dirname(ESTADO), { recursive: true }); fs.writeFileSync(ESTADO, JSON.stringify(estado)); } catch (e) { /* sem disco */ }
  }
  return novos;
}

function mensagem(novos) {
  return ['⚠ VIGIA DE TRAVAMENTO (hook do projeto):', ...novos.map((a) => '- ' + a.texto),
    'Provável teste travado ou vazando memória. Não espere: veja quem é o dono (worktree/agente), pare o agente se for o',
    'caso, derrube os processos pelo PID e investigue com a skill investigar-vazamento.'].join('\n');
}

if (require.main === module) {
  try {
    const agora = process.argv.includes('--agora');
    let entrada = {};
    if (!agora) {
      try { entrada = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch (e) { /* sem stdin */ }
    }
    const evento = entrada.hook_event_name || 'PostToolUse';
    const novos = filtrarNovos(achar(), Date.now(), agora, entrada.agent_id || entrada.transcript_path || entrada.session_id || '');
    if (agora) console.log(novos.length ? mensagem(novos) : '✔ nada de errado agora');
    else if (novos.length) {
      const texto = mensagem(novos);
      console.log(JSON.stringify({ systemMessage: texto, hookSpecificOutput: { hookEventName: evento, additionalContext: texto } }));
    }
  } catch (e) { /* o hook nunca atrapalha a ferramenta */ }
  process.exit(0);
}

module.exports = { achar, filtrarNovos, mensagem, TESTE, LIMITES };
