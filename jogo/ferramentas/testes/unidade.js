// Testes de unidade (é o `npm run unidade`): node --test com tempo por teste, concorrência limitada,
// grupo de processos próprio (o Chromium dos *.navegador.test.js morre junto) e a trava da worktree.
// Uso: node jogo/ferramentas/testes/unidade.js [--so <regex>] [--sem-navegador] [--sem-esperar]
//   --so <regex>     só os arquivos cujo nome casa (ex.: --so 'save|loja')
//   --sem-navegador  pula os *.navegador.test.js
// Tempo total: 6 min (REINO_TEMPO=2 dobra). Estourou: derruba o grupo e sai com 1.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const os = require('os');
const path = require('path');
const { rodar } = require('./processo');
const { pegar } = require('./trava');

const PASTA = path.join(__dirname, 'unidade');
const REPO = path.resolve(__dirname, '..', '..', '..');
const FATOR = Number(process.env.REINO_TEMPO) || 1;
const TOTAL_MS = 6 * 60 * 1000 * FATOR;
const POR_TESTE_MS = 120000 * FATOR;
const concorrencia = () => Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2)));

function arquivos(so, semNavegador) {
  const re = so ? new RegExp(so) : null;
  return fs.readdirSync(PASTA).filter((f) => f.endsWith('.test.js'))
    .filter((f) => !(semNavegador && f.endsWith('.navegador.test.js')))
    .filter((f) => !re || re.test(f)).sort().map((f) => path.join(PASTA, f));
}

function argsNode(lista) {
  return ['--test', `--test-timeout=${POR_TESTE_MS}`, `--test-concurrency=${concorrencia()}`].concat(lista);
}

module.exports = { arquivos, argsNode, concorrencia, TOTAL_MS };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  (async () => {
    const lista = arquivos(arg('--so'), process.argv.includes('--sem-navegador'));
    if (!lista.length) { console.error('✘ nenhum teste casou'); process.exit(2); }
    await pegar('npm run unidade');
    const r = await rodar(process.execPath, argsNode(lista), { cwd: REPO, timeoutMs: TOTAL_MS, aoVivo: true, nome: 'unidade' });
    if (r.estourou) console.error(`\n✘ testes de unidade passaram de ${TOTAL_MS / 1000} s: grupo ${r.pgid} derrubado`);
    process.exit(r.estourou ? 1 : r.status);
  })().catch((e) => { console.error('✘ ' + e.message); process.exit(1); });
}
