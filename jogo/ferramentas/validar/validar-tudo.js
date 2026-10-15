// Roda todos os validadores e resume: conteúdo das matérias, interiores, nomes repetidos, index.html x manifesto, docs
// pixel art, cores (paleta), movimento e enfeites do unicórnio.
// Uso: node ferramentas/validar/validar-tudo.js [--detalhes]   (npm run validar, na raiz do repositório)
// Cada validador roda à parte (eles terminam com process.exit); a saída inteira só aparece quando um
// falha (ou com --detalhes). Validador que não existe é erro. Sai com código 1 se algum falhar.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const jogo = path.join(__dirname, '..', '..');
const VALIDADORES = [
  { nome: 'conteúdo das matérias', arq: 'ferramentas/validar/validar-conteudo.js', detalhes: true },
  { nome: 'conteúdo preservado do terceiro bimestre', arq: 'ferramentas/validar/validar-conteudo.js', args: ['--terceiro-bimestre'], detalhes: true },
  { nome: 'cobertura dos livros do 4º bimestre (inventário x jogo)', arq: 'ferramentas/validar/cobertura-4bim.js', detalhes: true },
  { nome: 'interiores', arq: 'ferramentas/validar/validar-interiores.js', detalhes: true },
  { nome: 'index.html x manifesto', arq: 'ferramentas/gerar-index.js', args: ['--conferir'] },
  { nome: 'nomes repetidos', arq: 'ferramentas/validar/validar-nomes.js' },
  { nome: 'docs', arq: 'ferramentas/validar/validar-docs.js' },
  { nome: 'pixel art (cantos, faixas, sombras, canvas)', arq: 'ferramentas/validar/validar-pixel.js' },
  { nome: 'cores (tokens do :root, opacity, Reino.config.paleta)', arq: 'ferramentas/validar/validar-cores.js' },
  { nome: 'tipografia e pixel da interface (escala 8/12/16/24/32/48, bordas, sombras)', arq: 'ferramentas/validar/validar-tipografia.js', detalhes: true },
  { nome: 'movimento (durações em token, --degrau, :active na regra única, :root x config)', arq: 'ferramentas/validar/validar-movimento.js', detalhes: true },
  { nome: 'enfeites do unicórnio (fora do molde, oclusão montada)', arq: 'ferramentas/validar/validar-enfeites.js', detalhes: true },
];

// detalhes: repassa --detalhes a quem aceita (a lista "✔ …" por matéria, prova e interior)
function rodar(v, detalhes) {
  const arq = path.join(jogo, v.arq);
  if (!fs.existsSync(arq)) return { pulado: true };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [arq].concat(v.args || [], detalhes && v.detalhes ? ['--detalhes'] : []), { cwd: jogo, encoding: 'utf8' });
  return { ok: r.status === 0, saida: (r.stdout || '') + (r.stderr || ''), ms: Date.now() - t0 };
}

if (require.main === module) {
  const detalhes = process.argv.includes('--detalhes');
  let falhas = 0;
  for (const v of VALIDADORES) {
    const r = rodar(v, detalhes);
    if (r.pulado) {
      falhas++; console.log(`✘ ${v.nome}: ${v.arq} não existe`);
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
