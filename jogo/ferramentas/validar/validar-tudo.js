// Roda todos os validadores e resume: conteúdo das matérias, interiores, index.html x manifesto e docs.
// Uso: node ferramentas/validar/validar-tudo.js [--detalhes]   (npm run validar, na raiz do repositório)
// Cada validador roda à parte (eles terminam com process.exit); a saída inteira só aparece quando um
// falha (ou com --detalhes). Validador que ainda não existe (validar-docs.js, da Fase 4) é pulado com
// aviso. Sai com código 1 se algum falhar.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const jogo = path.join(__dirname, '..', '..');
const VALIDADORES = [
  { nome: 'conteúdo das matérias', arq: 'ferramentas/validar/validar-conteudo.js' },
  { nome: 'interiores', arq: 'ferramentas/validar/validar-interiores.js' },
  { nome: 'index.html x manifesto', arq: 'ferramentas/gerar-index.js', args: ['--conferir'] },
  { nome: 'docs', arq: 'ferramentas/validar/validar-docs.js', opcional: 'criado na Fase 4' },
];

function rodar(v) {
  const arq = path.join(jogo, v.arq);
  if (!fs.existsSync(arq)) return { pulado: true };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [arq].concat(v.args || []), { cwd: jogo, encoding: 'utf8' });
  return { ok: r.status === 0, saida: (r.stdout || '') + (r.stderr || ''), ms: Date.now() - t0 };
}

if (require.main === module) {
  const detalhes = process.argv.includes('--detalhes');
  let falhas = 0;
  for (const v of VALIDADORES) {
    const r = rodar(v);
    if (r.pulado) {
      if (!v.opcional) { falhas++; console.log(`✘ ${v.nome}: ${v.arq} não existe`); } else console.log(`⚠ ${v.nome}: ${v.arq} ainda não existe (${v.opcional}); pulado`);
      continue;
    }
    if (!r.ok) falhas++;
    if (!r.ok || detalhes) console.log(`\n--- ${v.arq}${(v.args || []).length ? ' ' + v.args.join(' ') : ''} ---\n` + r.saida.trimEnd());
    // resumo: a última linha que o validador escreveu (o "Tudo certo!" / "✔ ..." ou o último erro)
    const ultima = r.saida.trim().split('\n').pop();
    console.log(`${r.ok ? '✔' : '✘'} ${v.nome} (${r.ms} ms): ${ultima}`);
  }
  if (falhas) { console.log(`\n✘ ${falhas} validador(es) com erro`); process.exit(1); }
  console.log('\n✔ validadores ok');
}

module.exports = { VALIDADORES };
