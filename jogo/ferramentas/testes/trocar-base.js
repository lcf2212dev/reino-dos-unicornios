// Troca a base do e2e (base-referencia.txt) sem estragar os comentários:
//   npm run e2e -- --trocar-base <hash> "<descrição de 1 linha>"
// Confere que o hash é um commit ancestral de HEAD; acrescenta "# <curto> = <descrição>" acima da linha do
// hash e troca só essa linha; as outras linhas "#" ficam byte a byte. Grava atômico e imprime o diff. Sem commit.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

// função pura: texto antigo → texto novo (erro se a descrição não serve)
function trocarTexto(texto, curto, descricao) {
  if (typeof descricao !== 'string' || !descricao.trim()) throw new Error('falta a descrição');
  if (/[\r\n]/.test(descricao)) throw new Error('a descrição tem de ser uma linha só');
  if (descricao.includes('#')) throw new Error('a descrição não pode ter "#"');
  const linhas = texto.split('\n');
  const i = linhas.findIndex((l) => !l.startsWith('#'));
  if (i < 0 || !linhas[i].trim()) throw new Error('base-referencia.txt sem linha de hash');
  linhas.splice(i, 1, `# ${curto} = ${descricao.trim()}`, curto);
  return linhas.join('\n');
}

function trocarBase(hash, descricao, op = {}) {
  const repo = op.repo || path.resolve(__dirname, '..', '..', '..');
  const arq = op.arq || path.join(__dirname, 'base-referencia.txt');
  const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (!/^[0-9a-f]{4,40}$/i.test(hash || '')) throw new Error(`hash inválido: "${hash}"`);
  let cheio;
  try { cheio = git('rev-parse', '--verify', `${hash}^{commit}`); } catch (e) { throw new Error(`${hash} não é um commit deste repositório`); }
  if (spawnSync('git', ['-C', repo, 'merge-base', '--is-ancestor', cheio, 'HEAD']).status !== 0) throw new Error(`${hash} não é ancestral de HEAD`);
  const velho = fs.readFileSync(arq, 'utf8');
  const novo = trocarTexto(velho, cheio.slice(0, 7), descricao);
  fs.writeFileSync(arq + '.tmp', novo);
  fs.renameSync(arq + '.tmp', arq);
  // o antigo fica em /tmp/reino-testes (sem apagar) para o diff
  const { PASTA_TESTES } = require('./guardas');
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const antigo = path.join(PASTA_TESTES, `base-referencia-antes-${process.pid}.txt`);
  fs.writeFileSync(antigo, velho);
  const d = spawnSync('diff', ['-u', antigo, arq], { encoding: 'utf8' });
  console.log(d.stdout || '(sem diferença)');
  console.log(`✔ base trocada para ${cheio.slice(0, 7)} (sem commit; confira e faça o commit com o resto)`);
  return novo;
}

module.exports = { trocarTexto, trocarBase };
