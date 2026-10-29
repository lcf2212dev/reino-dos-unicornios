// Roda tudo o que é rápido (~1 min) e resume: é o `npm test` (na raiz do repositório).
// Uso: node jogo/ferramentas/testar-tudo.js [--detalhes] [--forcar] [--sem-esperar]
//   --detalhes  mostra a saída inteira de cada passo, mesmo verde
//   --forcar    roda tudo mesmo numa árvore já verde
// Os passos rodam AO MESMO TEMPO:
//   1. testes de unidade    jogo/ferramentas/testes/unidade.js (duas filas de node --test: Node puro e navegador;
//                           ao vivo, por ser o mais longo)
//   2. validadores          jogo/ferramentas/validar/validar-tudo.js (conteúdo, interiores, index, docs)
//   3. tamanho              jogo/ferramentas/tamanho.js (código avisa acima de 420 linhas e falha acima de 600; dados ≤ 800)
//   4. referências de dados jogo/ferramentas/testes/e2e.js --so-dados (servidor de TESTE + Chromium)
//   5. tipos                jogo/ferramentas/testes/tipos.js (TypeScript sobre os arquivos de tipos.json)
// A saída dos passos 2 a 5 só aparece inteira no fim, e só quando o passo falha (ou com --detalhes). Passo cujo arquivo
// não existe é erro. Sai com código 1 se algum passo falhar.
// Verde por árvore (testes/verdes.js): tudo verde grava a chave da árvore de trabalho; o próximo `npm test` na mesma
// árvore (mesmos arquivos, Node, Playwright e todas as variáveis REINO_* com valor, menos as de FORA_DA_CHAVE em
// testes/verdes.js) só diz "já verde" e sai 0 (--forcar roda).
// Cada passo roda num grupo de processos próprio com tempo máximo (unidade 6 min, validadores 2, tamanho 1,
// referências 4, tipos 2; REINO_TEMPO=2 dobra): estourou, o grupo inteiro (Chromium incluso) é derrubado. Pega a
// trava da worktree (testes/trava.js): outro `npm test` na mesma worktree espera (ou falha com --sem-esperar).
// Nada aqui toca no servidor de casa, no artifact publicado nem no save da Mariana: os testes usam saves
// sintéticos em vm, cópias em /tmp e o servidor de teste (porta livre, banco em /tmp).
if (require.main === module) require('./ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { rodar } = require('./testes/processo');
const { pegar } = require('./testes/trava');
const verdes = require('./testes/verdes');

const jogo = path.join(__dirname, '..');
const repo = path.join(jogo, '..');
const detalhes = process.argv.includes('--detalhes');
const forcar = process.argv.includes('--forcar');

const FATOR = Number(process.env.REINO_TEMPO) || 1;
const PASSOS = [
  { nome: 'testes de unidade', min: 6, arq: 'jogo/ferramentas/testes/unidade.js', aoVivo: true },
  { nome: 'validadores', min: 2, arq: 'jogo/ferramentas/validar/validar-tudo.js' },
  { nome: 'tamanho', min: 1, arq: 'jogo/ferramentas/tamanho.js' },
  { nome: 'referências de dados', min: 4, arq: 'jogo/ferramentas/testes/e2e.js', extra: ['--so-dados'] },
  { nome: 'tipos', min: 2, arq: 'jogo/ferramentas/testes/tipos.js' },
];

// resumo de um passo: as últimas linhas "ℹ tests/pass/fail" do node:test (e "todo", quando há)
// ou a última linha da saída
function resumo(saida) {
  const nt = {};
  (saida.match(/^ℹ (tests|pass|fail|todo) \d+$/gm) || []).forEach((l) => { const [, k, n] = l.split(' '); nt[k] = n; });
  if (Object.keys(nt).length) return Object.entries(nt).filter(([k, n]) => !(k === 'todo' && n === '0')).map(([k, n]) => `${k} ${n}`).join(', ');
  const ultima = saida.trim().split('\n').pop() || '';
  return ultima.length > 160 ? ultima.slice(0, 157) + '…' : ultima;
}

async function passo(p) {
  const inicio = Date.now();
  const arq = path.join(repo, p.arq);
  if (!fs.existsSync(arq)) return { p, ok: false, linha: `✘ ${p.nome}: ${p.arq} não existe` };
  const limite = p.min * 60 * FATOR;
  const r = await rodar(process.execPath, [arq].concat(p.extra || []), { cwd: repo, timeoutMs: limite * 1000, aoVivo: p.aoVivo, nome: p.nome });
  const ok = r.status === 0 && !r.estourou;
  const s = ((Date.now() - inicio) / 1000).toFixed(1);
  if (r.estourou) return { p, ok, linha: `✘ ${p.nome} passou de ${limite} s: grupo ${r.pgid} derrubado`, saida: r.saida.trimEnd().split('\n').slice(-30).join('\n') };
  return { p, ok, linha: `${ok ? '✔' : '✘'} ${p.nome} (${s} s): ${resumo(r.saida)}`, saida: r.saida.trimEnd() };
}

async function principal() {
  let chave = null;
  try { chave = verdes.chave(repo); } catch (e) { console.log('⚠ sem a chave da árvore (git?): ' + e.message); }
  const ja = chave && !forcar && verdes.verde(chave);
  if (ja) { console.log(`✔ já verde para esta árvore (${ja.quando}, ${ja.worktree}); para rodar de novo: npm test -- --forcar`); return; }
  await pegar('npm test');
  const t0 = Date.now();
  const rs = await Promise.all(PASSOS.map(passo));
  // os passos que não foram ao vivo: a saída inteira se falharam (ou com --detalhes), depois uma linha cada
  rs.forEach((r) => { if (r.saida && !r.p.aoVivo && (!r.ok || detalhes)) console.log(`\n--- ${r.p.nome} ---\n${r.saida}\n`); });
  console.log('');
  rs.forEach((r) => console.log(r.linha));
  const falhas = rs.filter((r) => !r.ok).length;
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  if (falhas) { console.log(`\n✘ ${falhas} passo(s) falharam (${total} s)`); process.exit(1); }
  // só marca verde se a árvore não mudou durante a rodada
  let depois = null;
  try { depois = verdes.chave(repo); } catch (e) { /* sem git */ }
  if (chave && depois === chave) verdes.marcar(chave);
  else if (chave) console.log('⚠ a árvore mudou durante os testes: não marco como verde');
  console.log(`\n✔ tudo certo (${total} s)`);
}
principal().then(() => process.exit(0), (e) => { console.error('✘ ' + e.message); process.exit(1); });
