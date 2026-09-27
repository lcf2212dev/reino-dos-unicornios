// Roda tudo o que é rápido (< ~1 min) e resume: é o `npm test` (na raiz do repositório).
// Uso: node jogo/ferramentas/testar-tudo.js [--detalhes]
//   1. testes de unidade    node --test jogo/ferramentas/testes/unidade/*.test.js (save, cuidados, banho,
//                           loja, surpresa, pontuação dos desafios, músicas, validadores; os *.navegador.test.js
//                           abrem o Chromium no servidor de TESTE, ~1 s cada)
//   2. validadores          jogo/ferramentas/validar/validar-tudo.js (conteúdo, interiores, index, docs)
//   3. tamanho              jogo/ferramentas/tamanho.js (código ≤ 420 linhas, dados ≤ 800)
//   4. referências de dados jogo/ferramentas/testes/e2e.js --so-dados (servidor de TESTE + Chromium)
// Passo cujo arquivo não existe é erro. A saída de cada passo só aparece
// inteira quando ele falha (ou com --detalhes). Sai com código 1 se algum passo falhar.
// Cada passo roda num grupo de processos próprio com tempo máximo (unidade 6 min, validadores 2, tamanho 1,
// referências 4; REINO_TEMPO=2 dobra): estourou, o grupo inteiro (Chromium incluso) é derrubado. Pega a trava
// da worktree (testes/trava.js): outro `npm test` na mesma worktree espera (ou falha com --sem-esperar).
// Nada aqui toca no servidor de casa, no artifact publicado nem no save da Mariana: os testes usam saves
// sintéticos em vm, cópias em /tmp e o servidor de teste (porta livre, banco em /tmp).
if (require.main === module) require('./ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { rodar } = require('./testes/processo');
const { pegar } = require('./testes/trava');
const unidadeArgs = require('./testes/unidade');

const jogo = path.join(__dirname, '..');
const repo = path.join(jogo, '..');
const detalhes = process.argv.includes('--detalhes');

const FATOR = Number(process.env.REINO_TEMPO) || 1;
const PASSOS = [
  { nome: 'testes de unidade', min: 6, args: () => unidadeArgs.argsNode(unidadeArgs.arquivos()) },
  { nome: 'validadores', min: 2, arq: 'jogo/ferramentas/validar/validar-tudo.js' },
  { nome: 'tamanho', min: 1, arq: 'jogo/ferramentas/tamanho.js' },
  { nome: 'referências de dados', min: 4, arq: 'jogo/ferramentas/testes/e2e.js', extra: ['--so-dados'], aoVivo: true },
];

// resumo de um passo: as linhas "ℹ tests/pass/fail" do node:test (e "todo", quando há)
// ou a última linha da saída
function resumo(saida) {
  const nt = saida.match(/^ℹ (tests|pass|fail|todo) \d+$/gm);
  if (nt) return nt.filter((l) => l !== 'ℹ todo 0').map((l) => l.slice(2)).join(', ');
  return saida.trim().split('\n').pop() || '';
}

async function principal() {
await pegar('npm test');
let falhas = 0;
const t0 = Date.now();
for (const p of PASSOS) {
  const inicio = Date.now();
  let args;
  if (p.arq) {
    const arq = path.join(repo, p.arq);
    if (!fs.existsSync(arq)) {
      falhas++; console.log(`✘ ${p.nome}: ${p.arq} não existe`);
      continue;
    }
    args = [arq].concat(p.extra || []);
  } else args = p.args();
  // passo longo (navegador) mostra a saída ao vivo; os rápidos só no fim, se falharem
  const limite = p.min * 60 * FATOR;
  const r = await rodar(process.execPath, args, { cwd: repo, timeoutMs: limite * 1000, aoVivo: p.aoVivo, nome: p.nome });
  const saida = r.saida;
  const ok = r.status === 0 && !r.estourou;
  if (!ok) falhas++;
  if (r.estourou) {
    console.log(`✘ ${p.nome} passou de ${limite} s: grupo ${r.pgid} derrubado\n` + saida.trimEnd().split('\n').slice(-30).join('\n'));
    continue;
  }
  if (!p.aoVivo && (!ok || detalhes)) console.log(`\n--- ${p.nome} ---\n` + saida.trimEnd() + '\n');
  const s = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(`${ok ? '✔' : '✘'} ${p.nome} (${s} s)${p.aoVivo ? '' : ': ' + resumo(saida)}`);
}
const total = ((Date.now() - t0) / 1000).toFixed(1);
if (falhas) { console.log(`\n✘ ${falhas} passo(s) falharam (${total} s)`); process.exit(1); }
console.log(`\n✔ tudo certo (${total} s)`);
}
principal().then(() => process.exit(0), (e) => { console.error('✘ ' + e.message); process.exit(1); });
